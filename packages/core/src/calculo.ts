import type { Item, ItemCalculado, MontosCabecera, ResultadoCalculo } from './tipos.js';

const IGV_TASA = 0.18;

function redondear(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

type Balde = 'gravada' | 'exonerada' | 'inafecta' | 'exportacion';

/**
 * Determina en qué "balde" del header cae un ítem según su tipAfeIgv (catálogo 07).
 * 10-17 → gravada, 20-21 → exonerada, 30-37 → inafecta, 40 → exportación.
 * Ver references/catalogs.md y document-types.md del skill original.
 */
function balde(tipAfeIgv: string): Balde {
  const codigo = Number(tipAfeIgv);
  if (Number.isInteger(codigo) && codigo >= 10 && codigo <= 17) return 'gravada';
  if (codigo === 20 || codigo === 21) return 'exonerada';
  if (Number.isInteger(codigo) && codigo >= 30 && codigo <= 37) return 'inafecta';
  if (codigo === 40) return 'exportacion';
  throw new Error(`tipAfeIgv desconocido o fuera de catálogo: "${tipAfeIgv}"`);
}

/** Calcula mtoValorVenta, igv y mtoPrecioUnitario de un ítem. Solo los ítems "gravada" pagan IGV. */
export function calcularItem(item: Item): ItemCalculado {
  const mtoValorVenta = redondear(item.cantidad * item.mtoValorUnitario);
  const esGravado = balde(item.tipAfeIgv) === 'gravada';
  const igv = esGravado ? redondear(mtoValorVenta * IGV_TASA) : 0;
  const mtoPrecioUnitario = redondear(item.mtoValorUnitario * (esGravado ? 1 + IGV_TASA : 1));
  return { ...item, mtoValorVenta, igv, mtoPrecioUnitario };
}

/**
 * Calcula los ítems y los totales de cabecera de una Factura/Boleta/Nota, siguiendo la fórmula
 * verificada en document-types.md: cada balde se acumula por separado y luego se suman.
 */
export function calcularCabecera(items: Item[]): ResultadoCalculo {
  const itemsCalculados = items.map(calcularItem);

  const montos: MontosCabecera = {
    mtoOperGravadas: 0,
    mtoOperExoneradas: 0,
    mtoOperInafectas: 0,
    mtoOperExportacion: 0,
    mtoOperGratuitas: 0,
    mtoIGV: 0,
    totalImpuestos: 0,
    valorVenta: 0,
    subTotal: 0,
    mtoImpVenta: 0,
  };

  items.forEach((item, i) => {
    const calculado = itemsCalculados[i]!;
    switch (balde(item.tipAfeIgv)) {
      case 'gravada':
        montos.mtoOperGravadas = redondear(montos.mtoOperGravadas + calculado.mtoValorVenta);
        break;
      case 'exonerada':
        montos.mtoOperExoneradas = redondear(montos.mtoOperExoneradas + calculado.mtoValorVenta);
        break;
      case 'inafecta':
        montos.mtoOperInafectas = redondear(montos.mtoOperInafectas + calculado.mtoValorVenta);
        break;
      case 'exportacion':
        montos.mtoOperExportacion = redondear(montos.mtoOperExportacion + calculado.mtoValorVenta);
        break;
    }
    montos.mtoIGV = redondear(montos.mtoIGV + calculado.igv);
  });

  montos.totalImpuestos = montos.mtoIGV;
  montos.valorVenta = redondear(
    montos.mtoOperGravadas + montos.mtoOperExoneradas + montos.mtoOperInafectas + montos.mtoOperExportacion,
  );
  montos.subTotal = redondear(montos.valorVenta + montos.totalImpuestos);
  montos.mtoImpVenta = montos.subTotal;

  return { items: itemsCalculados, montos };
}
