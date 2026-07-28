import { readFile } from 'node:fs/promises';

import { calcularCabecera } from '@miguelvivar/sunat-fe-core';

import { validarItems } from '../validacion.js';

/**
 * `sunat-fe calcular <items.json>` — lee un arreglo de ítems desde un archivo JSON y
 * muestra los montos de cabecera calculados (mtoOperGravadas, mtoIGV, subTotal, etc.).
 */
export async function comandoCalcular(rutaArchivo: string | undefined): Promise<string> {
  if (!rutaArchivo) {
    return 'Uso: sunat-fe calcular <ruta a items.json>\nCada ítem: { cantidad, descripcion, unidad, mtoValorUnitario, tipAfeIgv }';
  }

  const contenido = await readFile(rutaArchivo, 'utf-8');
  let datos: unknown;
  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error(`"${rutaArchivo}" no contiene JSON válido.`);
  }

  const itemsValidados = validarItems(datos, rutaArchivo);

  const { items, montos } = calcularCabecera(itemsValidados);

  const lineasItems = items
    .map((it) => `  - ${it.descripcion}: valorVenta=${it.mtoValorVenta} igv=${it.igv}`)
    .join('\n');

  const lineasMontos = Object.entries(montos)
    .map(([clave, valor]) => `  ${clave}: ${valor}`)
    .join('\n');

  return `Ítems:\n${lineasItems}\n\nMontos de cabecera:\n${lineasMontos}`;
}
