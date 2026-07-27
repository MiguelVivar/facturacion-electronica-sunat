import { readFile } from 'node:fs/promises';

import { generarXmlFacturaBoleta, type DatosFacturaBoleta } from '@miguelvivar/sunat-fe-xml';

/**
 * `sunat-fe generar-xml <datos.json>` — genera el XML UBL 2.1 (SIN FIRMAR) de una Factura/Boleta
 * a partir de un archivo JSON con emisor, cliente e ítems. Ver DatosFacturaBoleta en sunat-fe-xml.
 */
export async function comandoGenerarXml(rutaArchivo: string | undefined): Promise<string> {
  if (!rutaArchivo) {
    return 'Uso: sunat-fe generar-xml <ruta a datos.json>\nVer DatosFacturaBoleta (sunat-fe-xml) para el formato esperado.';
  }

  const contenido = await readFile(rutaArchivo, 'utf-8');
  let datos: DatosFacturaBoleta;
  try {
    const crudo = JSON.parse(contenido);
    datos = { ...crudo, fechaEmision: new Date(crudo.fechaEmision) };
  } catch {
    throw new Error(`"${rutaArchivo}" no contiene JSON válido o le falta algún campo.`);
  }

  // Deliberadamente sin avisos ni texto extra en el valor de retorno: este comando se usa en
  // pipelines (`generar-xml datos.json > factura.xml` seguido de `firmar factura.xml ...`), y
  // cualquier texto adicional en stdout corrompería el XML para el siguiente paso. El aviso de
  // "no firmado" se imprime aparte, a stderr, en cli.ts.
  return generarXmlFacturaBoleta(datos);
}
