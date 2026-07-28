import { createHash } from 'node:crypto';
import { desempaquetarPrimerXml, empaquetarXml, nombreComprobante } from './zip.js';
import type { IdentificadorComprobante } from './tipos.js';

/**
 * Cliente REST + OAuth2 del "SEE-API" (plataforma GRE) que SUNAT exige desde la R.S. N°
 * 000123-2022/SUNAT para transmitir Guías de Remisión Electrónicas (tipoDoc 09) — ya NO usa el
 * webservice SOAP `billService` como Factura/Boleta/Resumen/Baja (ver soap.ts/cliente.ts).
 *
 * Endpoints y forma de los payloads verificados contra el openapi.yaml público de
 * github.com/thegreenter/gre-api y la implementación de referencia GreSender.php de
 * github.com/thegreenter/greenter — no contra un entorno real de SUNAT (a diferencia de
 * enviarComprobante/consultarTicket, que sí se probaron contra FE_BETA).
 */

/** Host del servicio de autenticación OAuth2 de SUNAT (mismo para BETA y producción; las credenciales determinan el ambiente). */
export const ENDPOINT_TOKEN_GRE = 'https://api-seguridad.sunat.gob.pe/v1';
/** Host del servicio de recepción de comprobantes GRE (mismo para BETA y producción). */
export const ENDPOINT_CPE_GRE = 'https://api-cpe.sunat.gob.pe/v1';

export interface CredencialesGre {
  ruc: string;
  /** Usuario SOL (sin el RUC delante — se concatena al armar `username`). */
  usuarioSol: string;
  claveSol: string;
  /** client_id generado en el menú SOL para el API GRE. */
  clientId: string;
  clientSecret: string;
}

interface RespuestaTokenSunat {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/** Obtiene el token Bearer OAuth2 (`grant_type=password`) que exige el SEE-API antes de enviar o consultar comprobantes GRE. */
export async function obtenerTokenGre(
  credenciales: CredencialesGre,
  opciones: { endpoint?: string } = {},
): Promise<string> {
  const endpoint = opciones.endpoint ?? ENDPOINT_TOKEN_GRE;
  const cuerpo = new URLSearchParams({
    grant_type: 'password',
    scope: 'https://api-cpe.sunat.gob.pe',
    client_id: credenciales.clientId,
    client_secret: credenciales.clientSecret,
    username: `${credenciales.ruc}${credenciales.usuarioSol}`,
    password: credenciales.claveSol,
  });

  const respuestaHttp = await fetch(`${endpoint}/clientessol/${encodeURIComponent(credenciales.clientId)}/oauth2/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: cuerpo,
  });

  const textoRespuesta = await respuestaHttp.text();
  if (!respuestaHttp.ok) {
    throw new Error(
      `SUNAT rechazó la solicitud de token GRE (HTTP ${respuestaHttp.status}): ${textoRespuesta.slice(0, 500)}`,
    );
  }

  const token = JSON.parse(textoRespuesta) as RespuestaTokenSunat;
  return token.access_token;
}

export interface ResultadoEnvioGre {
  /** UUID del ticket generado por SUNAT — hay que sondearlo con consultarEstadoGre. */
  numTicket: string;
  fecRecepcion: string | null;
}

/**
 * Envía el .zip de una Guía de Remisión ya firmada (XML-DSig) al SEE-API de SUNAT vía HTTP POST
 * autenticado con OAuth2. Como Resumen/Baja (ver consultarTicket en cliente.ts), este envío es
 * asíncrono: devuelve un ticket, no el CDR — hay que consultar el estado por separado.
 */
export async function enviarGuiaRemision(
  xmlFirmado: string,
  id: IdentificadorComprobante,
  credenciales: CredencialesGre,
  opciones: { endpoint?: string; accessToken?: string } = {},
): Promise<ResultadoEnvioGre> {
  const endpoint = opciones.endpoint ?? ENDPOINT_CPE_GRE;
  const accessToken = opciones.accessToken ?? (await obtenerTokenGre(credenciales));

  const nombreArchivo = nombreComprobante(id);
  const zip = empaquetarXml(xmlFirmado, id);

  const respuestaHttp = await fetch(`${endpoint}/contribuyente/gem/comprobantes/${encodeURIComponent(nombreArchivo)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archivo: {
        nomArchivo: `${nombreArchivo}.zip`,
        arcGreZip: Buffer.from(zip).toString('base64'),
        hashZip: createHash('sha256').update(zip).digest('hex'),
      },
    }),
  });

  const textoRespuesta = await respuestaHttp.text();
  if (!respuestaHttp.ok) {
    throw new Error(
      `SUNAT rechazó el envío de la Guía de Remisión (HTTP ${respuestaHttp.status}): ${textoRespuesta.slice(0, 500)}`,
    );
  }

  const respuesta = JSON.parse(textoRespuesta) as { numTicket: string; fecRecepcion?: string };
  return { numTicket: respuesta.numTicket, fecRecepcion: respuesta.fecRecepcion ?? null };
}

export interface ResultadoEstadoGre {
  /** true mientras SUNAT sigue procesando el ticket (codRespuesta "98") — hay que volver a consultar más tarde. */
  enProceso: boolean;
  /** true si SUNAT terminó de procesar el ticket sin error (codRespuesta "0"). */
  aceptado: boolean;
  /** Código crudo devuelto por SUNAT: "98" en proceso, "0" OK, "99" envío con error. */
  codigoRespuesta: string;
  codigoError: string | null;
  descripcionError: string | null;
  /** XML del CDR ya desempaquetado del zip, o null si SUNAT todavía no lo generó. */
  cdrXml: string | null;
}

/** Consulta el estado de un envío GRE (ticket UUID) y descarga/desempaqueta el CDR cuando ya está disponible. */
export async function consultarEstadoGre(
  numTicket: string,
  credenciales: CredencialesGre,
  opciones: { endpoint?: string; accessToken?: string } = {},
): Promise<ResultadoEstadoGre> {
  const endpoint = opciones.endpoint ?? ENDPOINT_CPE_GRE;
  const accessToken = opciones.accessToken ?? (await obtenerTokenGre(credenciales));

  const respuestaHttp = await fetch(`${endpoint}/contribuyente/gem/comprobantes/envios/${encodeURIComponent(numTicket)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const textoRespuesta = await respuestaHttp.text();
  if (!respuestaHttp.ok) {
    throw new Error(
      `SUNAT rechazó la consulta de estado GRE (HTTP ${respuestaHttp.status}): ${textoRespuesta.slice(0, 500)}`,
    );
  }

  const respuesta = JSON.parse(textoRespuesta) as {
    codRespuesta: string;
    error?: { numError: string; desError: string };
    arcCdr?: string;
    indCdrGenerado?: string;
  };

  let cdrXml: string | null = null;
  if (respuesta.indCdrGenerado === '1' && respuesta.arcCdr) {
    const zipCdr = Buffer.from(respuesta.arcCdr, 'base64');
    cdrXml = desempaquetarPrimerXml(new Uint8Array(zipCdr)).contenido;
  }

  return {
    enProceso: respuesta.codRespuesta === '98',
    aceptado: respuesta.codRespuesta === '0',
    codigoRespuesta: respuesta.codRespuesta,
    codigoError: respuesta.error?.numError ?? null,
    descripcionError: respuesta.error?.desError ?? null,
    cdrXml,
  };
}
