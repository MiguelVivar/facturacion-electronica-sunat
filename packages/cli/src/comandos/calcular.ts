import { readFile } from 'node:fs/promises';

import { calcularCabecera, type Item } from '@miguelvivar/sunat-fe-core';

function esItemValido(valor: unknown): valor is Item {
  if (typeof valor !== 'object' || valor === null) return false;
  const item = valor as Record<string, unknown>;
  return (
    typeof item.cantidad === 'number' &&
    typeof item.descripcion === 'string' &&
    typeof item.unidad === 'string' &&
    typeof item.mtoValorUnitario === 'number' &&
    typeof item.tipAfeIgv === 'string'
  );
}

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

  if (!Array.isArray(datos) || !datos.every(esItemValido)) {
    throw new Error(
      'El JSON debe ser un arreglo de ítems: { cantidad, descripcion, unidad, mtoValorUnitario, tipAfeIgv }',
    );
  }

  const { items, montos } = calcularCabecera(datos);

  const lineasItems = items
    .map((it) => `  - ${it.descripcion}: valorVenta=${it.mtoValorVenta} igv=${it.igv}`)
    .join('\n');

  const lineasMontos = Object.entries(montos)
    .map(([clave, valor]) => `  ${clave}: ${valor}`)
    .join('\n');

  return `Ítems:\n${lineasItems}\n\nMontos de cabecera:\n${lineasMontos}`;
}
