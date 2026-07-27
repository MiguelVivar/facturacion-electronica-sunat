import { unzipSync, zipSync } from 'fflate';
import type { IdentificadorComprobante } from './tipos.js';

/** `{RUC}-{tipoDoc}-{serie}-{correlativo}` — nomenclatura exigida por SUNAT para archivo y XML interno. */
export function nombreComprobante(id: IdentificadorComprobante): string {
  return `${id.ruc}-${id.tipoDoc}-${id.serie}-${id.correlativo}`;
}

/**
 * Los comprobantes UBL-PE (y el CDR de respuesta) declaran `encoding="ISO-8859-1"` en el prólogo
 * — hay que empaquetar/leer los bytes reales en ese charset, no en UTF-8. Si se usa UTF-8 (p.ej.
 * el `strToU8`/`strFromU8` por defecto de fflate), SUNAT decodifica mal cualquier acento
 * ("consultoría" → basura), recalcula un digest distinto al firmado, y rechaza el documento como
 * "alterado" — este fue un bug real, confirmado contra el entorno BETA de SUNAT.
 */
function aBytesLatin1(texto: string): Uint8Array {
  return new Uint8Array(Buffer.from(texto, 'latin1'));
}
function deBytesLatin1(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('latin1');
}

/** Empaqueta un XML firmado en el .zip que SUNAT espera, con el nombre interno correcto. */
export function empaquetarXml(xmlFirmado: string, id: IdentificadorComprobante): Uint8Array {
  const nombre = nombreComprobante(id);
  return zipSync({ [`${nombre}.xml`]: aBytesLatin1(xmlFirmado) });
}

/** Desempaqueta el primer archivo XML de un .zip (usado tanto para armar el envío como para leer el CDR de respuesta). */
export function desempaquetarPrimerXml(zip: Uint8Array): { nombreArchivo: string; contenido: string } {
  const archivos = unzipSync(zip);
  const nombreArchivo = Object.keys(archivos).find((n) => n.toLowerCase().endsWith('.xml'));
  if (!nombreArchivo) {
    throw new Error('El .zip no contiene ningún archivo .xml');
  }
  return { nombreArchivo, contenido: deBytesLatin1(archivos[nombreArchivo]!) };
}
