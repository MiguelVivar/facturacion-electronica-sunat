import { describe, expect, test } from 'bun:test';
import { calcularCabecera, calcularItem } from './calculo.js';

describe('calcularItem', () => {
  test('ítem gravado: S/100 + IGV 18% = S/118 (ejemplo verificado de document-types.md)', () => {
    const resultado = calcularItem({
      cantidad: 1,
      descripcion: 'Servicio de consultoría',
      unidad: 'ZZ',
      mtoValorUnitario: 100,
      tipAfeIgv: '10',
    });
    expect(resultado.mtoValorVenta).toBe(100);
    expect(resultado.igv).toBe(18);
    expect(resultado.mtoPrecioUnitario).toBe(118);
  });

  test('ítem exonerado no genera IGV', () => {
    const resultado = calcularItem({
      cantidad: 2,
      descripcion: 'Producto exonerado',
      unidad: 'NIU',
      mtoValorUnitario: 50,
      tipAfeIgv: '20',
    });
    expect(resultado.mtoValorVenta).toBe(100);
    expect(resultado.igv).toBe(0);
    expect(resultado.mtoPrecioUnitario).toBe(50);
  });

  test('tipAfeIgv fuera de catálogo lanza error en vez de asumir un balde', () => {
    expect(() =>
      calcularItem({ cantidad: 1, descripcion: 'x', unidad: 'NIU', mtoValorUnitario: 1, tipAfeIgv: '99' }),
    ).toThrow();
  });
});

describe('calcularCabecera', () => {
  test('un solo ítem gravado: totales de cabecera S/100 + IGV 18% = S/118', () => {
    const { montos } = calcularCabecera([
      { cantidad: 1, descripcion: 'Servicio de consultoría', unidad: 'ZZ', mtoValorUnitario: 100, tipAfeIgv: '10' },
    ]);
    expect(montos.mtoOperGravadas).toBe(100);
    expect(montos.mtoOperExoneradas).toBe(0);
    expect(montos.mtoOperInafectas).toBe(0);
    expect(montos.mtoIGV).toBe(18);
    expect(montos.valorVenta).toBe(100);
    expect(montos.subTotal).toBe(118);
    expect(montos.mtoImpVenta).toBe(118);
  });

  test('ítems mixtos se agrupan en el balde correcto (gravada + exonerada + inafecta + exportación)', () => {
    const { montos } = calcularCabecera([
      { cantidad: 1, descripcion: 'Gravado', unidad: 'NIU', mtoValorUnitario: 100, tipAfeIgv: '10' },
      { cantidad: 1, descripcion: 'Exonerado', unidad: 'NIU', mtoValorUnitario: 50, tipAfeIgv: '20' },
      { cantidad: 1, descripcion: 'Inafecto', unidad: 'NIU', mtoValorUnitario: 30, tipAfeIgv: '30' },
      { cantidad: 1, descripcion: 'Exportación', unidad: 'NIU', mtoValorUnitario: 20, tipAfeIgv: '40' },
    ]);
    expect(montos.mtoOperGravadas).toBe(100);
    expect(montos.mtoOperExoneradas).toBe(50);
    expect(montos.mtoOperInafectas).toBe(30);
    expect(montos.mtoOperExportacion).toBe(20);
    expect(montos.mtoIGV).toBe(18);
    expect(montos.valorVenta).toBe(200);
    expect(montos.subTotal).toBe(218);
  });

  test('redondeo a 2 decimales en cantidades fraccionarias', () => {
    const { items, montos } = calcularCabecera([
      { cantidad: 3, descripcion: 'x', unidad: 'NIU', mtoValorUnitario: 10.005, tipAfeIgv: '10' },
    ]);
    expect(items[0]!.mtoValorVenta).toBe(30.02);
    expect(montos.mtoIGV).toBe(5.4);
  });
});
