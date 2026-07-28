import { readFile } from 'node:fs/promises';

import { generarXmlFacturaBoleta } from '@miguelvivar/sunat-fe-xml';

import { validarDatosFacturaBoleta } from '../validacion.js';

/**
 * `sunat-fe generar-xml <datos.json>` — genera el XML UBL 2.1 (SIN FIRMAR) de una Factura/Boleta
 * a partir de un archivo JSON con emisor, cliente e ítems. Ver DatosFacturaBoleta en sunat-fe-xml.
 */
export async function comandoGenerarXml(rutaArchivo: string | undefined): Promise<string> {
  if (!rutaArchivo) {
    return 'Uso: sunat-fe generar-xml <ruta a datos.json>\nVer DatosFacturaBoleta (sunat-fe-xml) para el formato esperado.';
  }

  const contenido = await readFile(rutaArchivo, 'utf-8');
  let crudo: unknown;
  try {
    crudo = JSON.parse(contenido);
  } catch {
    throw new Error(`"${rutaArchivo}" no contiene JSON válido.`);
  }

  const validado = validarDatosFacturaBoleta(crudo, rutaArchivo);
  const datos = { ...validado, fechaEmision: new Date(validado.fechaEmision) };

  // Deliberadamente sin avisos ni texto extra en el valor de retorno: este comando se usa en
  // pipelines (`generar-xml datos.json > factura.xml` seguido de `firmar factura.xml ...`), y
  // cualquier texto adicional en stdout corrompería el XML para el siguiente paso. El aviso de
  // "no firmado" se imprime aparte, a stderr, en cli.ts.
  return generarXmlFacturaBoleta(datos);
}
