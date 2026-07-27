/** Un ítem de línea antes de calcular montos (ver document-types.md del skill). */
export interface Item {
  cantidad: number;
  descripcion: string;
  /** Catálogo 03 — p.ej. "NIU" (unidad), "ZZ" (servicio). */
  unidad: string;
  /** Precio unitario SIN IGV. */
  mtoValorUnitario: number;
  /** Catálogo 07 — determina el "balde" del header en el que cae el ítem. */
  tipAfeIgv: string;
}

/** El mismo ítem con los montos ya calculados. */
export interface ItemCalculado extends Item {
  mtoValorVenta: number;
  igv: number;
  /** Precio unitario CON IGV, solo para mostrar. */
  mtoPrecioUnitario: number;
}

/** Totales de cabecera de Factura/Boleta/Nota, agrupados por catálogo de afectación IGV. */
export interface MontosCabecera {
  mtoOperGravadas: number;
  mtoOperExoneradas: number;
  mtoOperInafectas: number;
  mtoOperExportacion: number;
  mtoOperGratuitas: number;
  mtoIGV: number;
  totalImpuestos: number;
  valorVenta: number;
  subTotal: number;
  mtoImpVenta: number;
}

export interface ResultadoCalculo {
  items: ItemCalculado[];
  montos: MontosCabecera;
}

export interface EntradaCatalogo {
  catalogo: string;
  codigo: string;
  nombre: string;
}
