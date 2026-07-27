import { readFile } from 'node:fs/promises';
import { enviarComprobante } from '@miguelvivar/sunat-fe-client';

interface ConfigEnvio {
  ruc: string;
  tipoDoc: string;
  serie: string;
  correlativo: string;
  usuario: string;
  clave: string;
  endpoint?: string;
}

function esConfigEnvioValida(valor: unknown): valor is ConfigEnvio {
  if (typeof valor !== 'object' || valor === null) return false;
  const c = valor as Record<string, unknown>;
  return (
    typeof c.ruc === 'string' &&
    typeof c.tipoDoc === 'string' &&
    typeof c.serie === 'string' &&
    typeof c.correlativo === 'string' &&
    typeof c.usuario === 'string' &&
    typeof c.clave === 'string'
  );
}

/**
 * `sunat-fe enviar <xml-firmado.xml> <config.json>` — envía por SOAP al billService de SUNAT.
 *
 * AVISO: en las pruebas reales contra FE_BETA, SUNAT rechazó la firma generada por
 * `sunat-fe firmar` con "Incorrect reference digest value" — este comando llega, envía y
 * lee la respuesta real de SUNAT (eso sí está probado end-to-end), pero no esperes un CDR
 * ACEPTADA hasta que ese problema de firma se resuelva. Ver PRODUCT.md.
 */
export async function comandoEnviar(
  rutaXmlFirmado: string | undefined,
  rutaConfig: string | undefined,
): Promise<string> {
  if (!rutaXmlFirmado || !rutaConfig) {
    return 'Uso: sunat-fe enviar <xml-firmado.xml> <config.json>\nconfig.json: { ruc, tipoDoc, serie, correlativo, usuario, clave, endpoint? }';
  }

  const [xmlFirmado, contenidoConfig] = await Promise.all([
    readFile(rutaXmlFirmado, 'utf-8'),
    readFile(rutaConfig, 'utf-8'),
  ]);

  let config: unknown;
  try {
    config = JSON.parse(contenidoConfig);
  } catch {
    throw new Error(`"${rutaConfig}" no contiene JSON válido.`);
  }
  if (!esConfigEnvioValida(config)) {
    throw new Error('config.json debe traer: ruc, tipoDoc, serie, correlativo, usuario, clave (endpoint es opcional).');
  }

  const resultado = await enviarComprobante(
    xmlFirmado,
    { ruc: config.ruc, tipoDoc: config.tipoDoc, serie: config.serie, correlativo: config.correlativo },
    { ruc: config.ruc, usuario: config.usuario, clave: config.clave },
    { endpoint: config.endpoint },
  );

  return JSON.stringify(resultado, null, 2);
}
