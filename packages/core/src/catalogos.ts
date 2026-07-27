import type { EntradaCatalogo } from './tipos.js';

export const TIPOS_DOCUMENTO = [
  { codigo: '01', nombre: 'Factura' },
  { codigo: '03', nombre: 'Boleta de Venta' },
  { codigo: '07', nombre: 'Nota de Crédito' },
  { codigo: '08', nombre: 'Nota de Débito' },
  { codigo: '09', nombre: 'Guía de Remisión Remitente' },
  { codigo: '20', nombre: 'Comprobante de Retención' },
  { codigo: '40', nombre: 'Comprobante de Percepción' },
] as const;

export const TIPOS_DOCUMENTO_IDENTIDAD = [
  { codigo: '0', nombre: 'Doc. Trib. No Dom. Sin RUC (venta a extranjero sin RUC)' },
  { codigo: '1', nombre: 'DNI' },
  { codigo: '4', nombre: 'Carné de Extranjería' },
  { codigo: '6', nombre: 'RUC' },
  { codigo: '7', nombre: 'Pasaporte' },
  { codigo: 'A', nombre: 'Cédula Diplomática de Identidad' },
] as const;

export const MONEDAS = [
  { codigo: 'PEN', nombre: 'Sol' },
  { codigo: 'USD', nombre: 'Dólar' },
  { codigo: 'EUR', nombre: 'Euro' },
] as const;

export const UNIDADES_MEDIDA = [
  { codigo: 'NIU', nombre: 'Unidad (bienes)' },
  { codigo: 'ZZ', nombre: 'Servicios' },
  { codigo: 'KGM', nombre: 'Kilogramo' },
  { codigo: 'LTR', nombre: 'Litro' },
  { codigo: 'MTR', nombre: 'Metro' },
  { codigo: 'BX', nombre: 'Caja' },
  { codigo: 'GLL', nombre: 'Galón' },
] as const;

export const TIPOS_AFECTACION_IGV = [
  { codigo: '10', nombre: 'Gravado — Operación Onerosa' },
  { codigo: '11', nombre: 'Gravado — Retiro por premio' },
  { codigo: '12', nombre: 'Gravado — Retiro por donación' },
  { codigo: '13', nombre: 'Gravado — Retiro' },
  { codigo: '15', nombre: 'Gravado — Bonificaciones' },
  { codigo: '16', nombre: 'Gravado — Retiro por entrega a trabajadores' },
  { codigo: '17', nombre: 'Gravado — IVAP' },
  { codigo: '20', nombre: 'Exonerado — Operación Onerosa' },
  { codigo: '21', nombre: 'Exonerado — Transferencia Gratuita' },
  { codigo: '30', nombre: 'Inafecto — Operación Onerosa' },
  { codigo: '40', nombre: 'Exportación (0% IGV)' },
] as const;

export const MOTIVOS_NOTA_CREDITO = [
  { codigo: '01', nombre: 'Anulación de la operación' },
  { codigo: '02', nombre: 'Anulación por error en el RUC' },
  { codigo: '03', nombre: 'Corrección por error en la descripción' },
  { codigo: '04', nombre: 'Descuento global' },
  { codigo: '05', nombre: 'Descuento por ítem' },
  { codigo: '06', nombre: 'Devolución total' },
  { codigo: '07', nombre: 'Devolución por ítem' },
  { codigo: '08', nombre: 'Bonificación' },
  { codigo: '09', nombre: 'Disminución en el valor' },
  { codigo: '10', nombre: 'Otros conceptos' },
  { codigo: '11', nombre: 'Ajustes de operaciones de exportación' },
  { codigo: '12', nombre: 'Ajustes afectos al IVAP' },
] as const;

export const MOTIVOS_NOTA_DEBITO = [
  { codigo: '01', nombre: 'Intereses por mora' },
  { codigo: '02', nombre: 'Aumento en el valor' },
  { codigo: '03', nombre: 'Penalidades / otros conceptos' },
] as const;

export const TIPOS_OPERACION = [
  { codigo: '0101', nombre: 'Venta interna' },
  { codigo: '0112', nombre: 'Venta interna con anticipos' },
  { codigo: '0200', nombre: 'Exportación de bienes' },
  { codigo: '0201', nombre: 'Exportación de servicios' },
  { codigo: '1001', nombre: 'Operación sujeta a detracción' },
  { codigo: '2001', nombre: 'Operación sujeta a percepción' },
] as const;

export const LEYENDAS = [
  { codigo: '1000', nombre: 'Monto en letras (obligatoria en Factura/Boleta)' },
  { codigo: '1002', nombre: 'Anticipos' },
  { codigo: '2000', nombre: 'Bienes transferidos a título gratuito' },
] as const;

const TODOS_LOS_CATALOGOS: Record<string, readonly { codigo: string; nombre: string }[]> = {
  'tipo-documento': TIPOS_DOCUMENTO,
  'tipo-documento-identidad': TIPOS_DOCUMENTO_IDENTIDAD,
  moneda: MONEDAS,
  'unidad-medida': UNIDADES_MEDIDA,
  'afectacion-igv': TIPOS_AFECTACION_IGV,
  'motivo-nota-credito': MOTIVOS_NOTA_CREDITO,
  'motivo-nota-debito': MOTIVOS_NOTA_DEBITO,
  'tipo-operacion': TIPOS_OPERACION,
  leyenda: LEYENDAS,
};

/**
 * Busca un código o nombre en todos los catálogos SUNAT conocidos.
 * Coincidencia exacta de código, o coincidencia parcial (insensible a mayúsculas) de nombre.
 */
export function buscarCatalogo(consulta: string): EntradaCatalogo[] {
  const q = consulta.trim().toLowerCase();
  const resultados: EntradaCatalogo[] = [];
  for (const [catalogo, entradas] of Object.entries(TODOS_LOS_CATALOGOS)) {
    for (const entrada of entradas) {
      const coincideCodigo = entrada.codigo.toLowerCase() === q;
      const coincideNombre = entrada.nombre.toLowerCase().includes(q);
      if (coincideCodigo || coincideNombre) {
        resultados.push({ catalogo, codigo: entrada.codigo, nombre: entrada.nombre });
      }
    }
  }
  return resultados;
}
