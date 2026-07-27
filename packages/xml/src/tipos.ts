import type { Item } from '@miguelvivar/sunat-fe-core';

export interface Empresa {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  /** Catálogo de ubigeo + dirección; se deja como texto libre por ahora (SUNAT exige más detalle,
   *  ver references/greenter-php.md del skill original para el desglose completo de domicilio fiscal). */
  direccion: string;
  ubigeo?: string;
}

export interface Cliente {
  /** Catálogo 06 — p.ej. "6" (RUC), "1" (DNI). */
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocialONombre: string;
}

export interface DatosFacturaBoleta {
  /** "01" (Factura) o "03" (Boleta de Venta). */
  tipoDoc: '01' | '03';
  serie: string;
  correlativo: string;
  fechaEmision: Date;
  /** Catálogo 02 — normalmente "PEN". */
  moneda: string;
  emisor: Empresa;
  cliente: Cliente;
  items: Item[];
}
