import { desempaquetarPrimerXml, empaquetarXml, nombreComprobante } from './zip.js';
import {
  construirSobreGetStatus,
  construirSobreSendBill,
  interpretarCdr,
  interpretarRespuestaGetStatus,
  interpretarRespuestaSendBill,
} from './soap.js';
import type { CredencialesSol, IdentificadorComprobante, ResultadoEnvio, ResultadoTicket } from './tipos.js';

/** Entorno de pruebas público de SUNAT — no requiere confirmación como el de producción. */
export const ENDPOINT_BETA = 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService';

/**
 * Envía un comprobante ya firmado (XML-DSig) al billService de SUNAT vía SOAP y devuelve el
 * resultado interpretado del CDR. Usa `ENDPOINT_BETA` salvo que se indique explícitamente otro
 * endpoint — enviar a producción es una decisión de alto impacto que el llamador debe tomar
 * explícitamente (ver la regla de seguridad BETA vs PRODUCCIÓN en la skill sunat-comprobantes).
 */
export async function enviarComprobante(
  xmlFirmado: string,
  id: IdentificadorComprobante,
  credenciales: CredencialesSol,
  opciones: { endpoint?: string } = {},
): Promise<ResultadoEnvio> {
  const endpoint = opciones.endpoint ?? ENDPOINT_BETA;
  const nombreZip = `${nombreComprobante(id)}.zip`;
  const zip = empaquetarXml(xmlFirmado, id);
  const zipBase64 = Buffer.from(zip).toString('base64');

  const sobre = construirSobreSendBill(nombreZip, zipBase64, credenciales);

  const respuestaHttp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=UTF-8',
      SOAPAction: '',
    },
    body: sobre,
  });

  const textoRespuesta = await respuestaHttp.text();
  const respuesta = interpretarRespuestaSendBill(textoRespuesta);

  if (respuesta.fault) {
    return {
      aceptado: false,
      codigoCdr: null,
      descripcion: `SOAP Fault ${respuesta.fault.codigo}: ${respuesta.fault.mensaje}`,
      cdrXml: null,
    };
  }

  if (!respuesta.applicationResponseBase64) {
    return {
      aceptado: false,
      codigoCdr: null,
      descripcion: `Respuesta SOAP sin applicationResponse ni fault (HTTP ${respuestaHttp.status}) — respuesta cruda: ${textoRespuesta.slice(0, 500)}`,
      cdrXml: null,
    };
  }

  const zipCdr = Buffer.from(respuesta.applicationResponseBase64, 'base64');
  const { contenido: cdrXml } = desempaquetarPrimerXml(new Uint8Array(zipCdr));
  const { codigo, descripcion } = interpretarCdr(cdrXml);

  return {
    aceptado: codigo === 0,
    codigoCdr: codigo,
    descripcion,
    cdrXml,
  };
}

/**
 * Sondea el estado de un ticket asíncrono (Resumen Diario de Boletas, Comunicación de Baja,
 * Reversión) vía getStatus y descarga el CDR una vez que SUNAT termina de procesarlo.
 *
 * SUNAT solo incluye `content` (el .zip del CDR) cuando el ticket ya está resuelto; mientras no
 * llegue, este cliente lo reporta como `enProceso: true` sin intentar adivinar el catálogo
 * completo de statusCode intermedios (no documentado públicamente) — hay que volver a llamar
 * más tarde (ver el flujo async de Resumen/Baja/Reversión en document-types.md del skill).
 */
export async function consultarTicket(
  ticket: string,
  credenciales: CredencialesSol,
  opciones: { endpoint?: string } = {},
): Promise<ResultadoTicket> {
  const endpoint = opciones.endpoint ?? ENDPOINT_BETA;
  const sobre = construirSobreGetStatus(ticket, credenciales);

  const respuestaHttp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=UTF-8',
      SOAPAction: '',
    },
    body: sobre,
  });

  const textoRespuesta = await respuestaHttp.text();
  const respuesta = interpretarRespuestaGetStatus(textoRespuesta);

  if (respuesta.fault) {
    return {
      enProceso: false,
      statusCode: null,
      aceptado: false,
      codigoCdr: null,
      descripcion: `SOAP Fault ${respuesta.fault.codigo}: ${respuesta.fault.mensaje}`,
      cdrXml: null,
    };
  }

  if (!respuesta.contentBase64) {
    return {
      enProceso: true,
      statusCode: respuesta.statusCode,
      aceptado: false,
      codigoCdr: null,
      descripcion: `Ticket "${ticket}" aún en proceso en SUNAT (statusCode=${respuesta.statusCode ?? 'desconocido'}) — vuelve a consultar en unos segundos.`,
      cdrXml: null,
    };
  }

  const zipCdr = Buffer.from(respuesta.contentBase64, 'base64');
  const { contenido: cdrXml } = desempaquetarPrimerXml(new Uint8Array(zipCdr));
  const { codigo, descripcion } = interpretarCdr(cdrXml);

  return {
    enProceso: false,
    statusCode: respuesta.statusCode,
    aceptado: codigo === 0,
    codigoCdr: codigo,
    descripcion,
    cdrXml,
  };
}
