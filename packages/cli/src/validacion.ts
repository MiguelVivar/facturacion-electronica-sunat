import type { Item } from '@miguelvivar/sunat-fe-core';
import type { DatosFacturaBoleta } from '@miguelvivar/sunat-fe-xml';

/** Campos requeridos de un Item y su ayuda (catálogo SUNAT o formato esperado). */
const CAMPOS_ITEM: { campo: keyof Item; tipo: 'string' | 'number'; ayuda: string }[] = [
  { campo: 'descripcion', tipo: 'string', ayuda: 'descripción del ítem (texto)' },
  { campo: 'cantidad', tipo: 'number', ayuda: 'cantidad de unidades (número)' },
  { campo: 'unidad', tipo: 'string', ayuda: 'catálogo 03 SUNAT, ej. NIU, ZZ' },
  { campo: 'mtoValorUnitario', tipo: 'number', ayuda: 'precio unitario sin IGV (número)' },
  { campo: 'tipAfeIgv', tipo: 'string', ayuda: 'catálogo 07 SUNAT, ej. 10, 20' },
];

/** Valida que `datos` sea un arreglo de ítems bien formado, señalando la posición y el campo exacto que falta. */
export function validarItems(datos: unknown, nombreArchivo: string): Item[] {
  if (!Array.isArray(datos)) {
    throw new Error(`"${nombreArchivo}" debe contener un arreglo de ítems, no ${typeof datos}.`);
  }

  datos.forEach((valor, indice) => {
    if (typeof valor !== 'object' || valor === null) {
      throw new Error(`El ítem en la posición ${indice} de "${nombreArchivo}" debe ser un objeto.`);
    }
    const item = valor as Record<string, unknown>;
    for (const { campo, tipo, ayuda } of CAMPOS_ITEM) {
      if (typeof item[campo] !== tipo) {
        throw new Error(
          `Error: El ítem en la posición ${indice} requiere el campo '${campo}' (${ayuda}).`,
        );
      }
    }
  });

  return datos as Item[];
}

function requerirTexto(objeto: Record<string, unknown>, campo: string, ruta: string, ayuda: string): void {
  if (typeof objeto[campo] !== 'string' || objeto[campo] === '') {
    throw new Error(`Error: falta el campo '${ruta}${campo}' (${ayuda}).`);
  }
}

function requerirObjeto(
  datos: Record<string, unknown>,
  campo: string,
  nombreArchivo: string,
): Record<string, unknown> {
  const valor = datos[campo];
  if (typeof valor !== 'object' || valor === null) {
    throw new Error(`Error: falta el objeto '${campo}' en "${nombreArchivo}".`);
  }
  return valor as Record<string, unknown>;
}

/** Valida la forma completa de un datos.json antes de generar el XML, con mensajes por campo. */
export function validarDatosFacturaBoleta(datos: unknown, nombreArchivo: string): DatosFacturaBoleta {
  if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) {
    throw new Error(`"${nombreArchivo}" debe contener un objeto JSON con los datos del comprobante.`);
  }
  const raiz = datos as Record<string, unknown>;

  if (raiz.tipoDoc !== '01' && raiz.tipoDoc !== '03') {
    throw new Error(`Error: el campo 'tipoDoc' debe ser "01" (Factura) o "03" (Boleta de Venta).`);
  }
  requerirTexto(raiz, 'serie', '', 'serie del comprobante, ej. F001');
  if (typeof raiz.correlativo !== 'string' && typeof raiz.correlativo !== 'number') {
    throw new Error(`Error: falta el campo 'correlativo' (número correlativo del comprobante).`);
  }
  if (typeof raiz.moneda !== 'string' || raiz.moneda === '') {
    throw new Error(`Error: falta el campo 'moneda' (catálogo 02 SUNAT, ej. PEN, USD).`);
  }
  if (Number.isNaN(new Date(raiz.fechaEmision as string).getTime())) {
    throw new Error(`Error: el campo 'fechaEmision' no es una fecha válida (formato YYYY-MM-DD).`);
  }

  const emisor = requerirObjeto(raiz, 'emisor', nombreArchivo);
  requerirTexto(emisor, 'ruc', 'emisor.', 'RUC del emisor, 11 dígitos');
  requerirTexto(emisor, 'razonSocial', 'emisor.', 'razón social del emisor');
  requerirTexto(emisor, 'direccion', 'emisor.', 'dirección fiscal del emisor');

  const cliente = requerirObjeto(raiz, 'cliente', nombreArchivo);
  requerirTexto(cliente, 'tipoDocumento', 'cliente.', 'catálogo 06 SUNAT, ej. 1 (DNI), 6 (RUC)');
  requerirTexto(cliente, 'numeroDocumento', 'cliente.', 'número de documento del cliente');
  requerirTexto(cliente, 'razonSocialONombre', 'cliente.', 'razón social o nombre del cliente');

  validarItems(raiz.items, nombreArchivo);

  return datos as DatosFacturaBoleta;
}
