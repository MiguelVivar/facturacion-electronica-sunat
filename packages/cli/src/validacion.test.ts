import { describe, expect, test } from 'bun:test';
import { validarDatosFacturaBoleta, validarItems } from './validacion.js';

const ITEM_VALIDO = {
  descripcion: 'Servicio de consultoría',
  cantidad: 1,
  unidad: 'NIU',
  mtoValorUnitario: 100,
  tipAfeIgv: '10',
};

const DATOS_VALIDOS = {
  tipoDoc: '01',
  serie: 'F001',
  correlativo: '1',
  fechaEmision: '2026-07-27',
  moneda: 'PEN',
  emisor: { ruc: '20000000001', razonSocial: 'Empresa S.A.C.', direccion: 'Av. Siempre Viva 123' },
  cliente: { tipoDocumento: '6', numeroDocumento: '20123456789', razonSocialONombre: 'Cliente S.A.C.' },
  items: [ITEM_VALIDO],
};

describe('validarItems', () => {
  test('acepta un arreglo de ítems bien formado', () => {
    expect(validarItems([ITEM_VALIDO], 'items.json')).toEqual([ITEM_VALIDO]);
  });

  test('rechaza un valor que no es arreglo', () => {
    expect(() => validarItems({ foo: 'bar' }, 'items.json')).toThrow(/arreglo de ítems/);
  });

  test('señala la posición y el campo exacto que falta', () => {
    const { unidad: _unidad, ...sinUnidad } = ITEM_VALIDO;
    expect(() => validarItems([sinUnidad], 'items.json')).toThrow(
      "El ítem en la posición 0 requiere el campo 'unidad' (catálogo 03 SUNAT, ej. NIU, ZZ).",
    );
  });
});

describe('validarDatosFacturaBoleta', () => {
  test('acepta un datos.json bien formado', () => {
    expect(validarDatosFacturaBoleta(DATOS_VALIDOS, 'datos.json')).toEqual(DATOS_VALIDOS);
  });

  test('rechaza un tipoDoc desconocido', () => {
    const invalido = { ...DATOS_VALIDOS, tipoDoc: '99' };
    expect(() => validarDatosFacturaBoleta(invalido, 'datos.json')).toThrow(/tipoDoc/);
  });

  test('señala el campo anidado exacto que falta en emisor', () => {
    const { razonSocial: _razonSocial, ...emisorSinRazonSocial } = DATOS_VALIDOS.emisor;
    const invalido = { ...DATOS_VALIDOS, emisor: emisorSinRazonSocial };
    expect(() => validarDatosFacturaBoleta(invalido, 'datos.json')).toThrow("'emisor.razonSocial'");
  });

  test('propaga los errores de validación de ítems', () => {
    const invalido = { ...DATOS_VALIDOS, items: [{}] };
    expect(() => validarDatosFacturaBoleta(invalido, 'datos.json')).toThrow(/posición 0/);
  });
});
