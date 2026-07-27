export interface CredencialesSol {
  ruc: string;
  usuario: string;
  clave: string;
}

export interface IdentificadorComprobante {
  ruc: string;
  /** Catálogo 01 — "01" Factura, "03" Boleta, "07"/"08" Nota, etc. */
  tipoDoc: string;
  serie: string;
  correlativo: string;
}

export interface ResultadoEnvio {
  /** true si el CDR trae código 0 (ACEPTADA). */
  aceptado: boolean;
  /** Código del CDR: 0 = aceptada, 2000-3999 = rechazada, otro = excepción. Null si SUNAT devolvió un SOAP Fault sin llegar a generar CDR. */
  codigoCdr: number | null;
  descripcion: string;
  /** XML crudo del CDR (ya desempaquetado del zip), o null si no se recibió CDR. */
  cdrXml: string | null;
}
