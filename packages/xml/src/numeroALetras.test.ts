import { describe, expect, test } from 'bun:test';
import { enteroALetras, montoALetras } from './numeroALetras.js';

describe('enteroALetras', () => {
  test('cero', () => expect(enteroALetras(0)).toBe('CERO'));
  test('unidades y decenas simples', () => {
    expect(enteroALetras(1)).toBe('UNO');
    expect(enteroALetras(15)).toBe('QUINCE');
    expect(enteroALetras(21)).toBe('VEINTIUNO');
    expect(enteroALetras(30)).toBe('TREINTA');
    expect(enteroALetras(45)).toBe('CUARENTA Y CINCO');
  });
  test('cientos', () => {
    expect(enteroALetras(100)).toBe('CIEN');
    expect(enteroALetras(118)).toBe('CIENTO DIECIOCHO');
    expect(enteroALetras(500)).toBe('QUINIENTOS');
  });
  test('miles', () => {
    expect(enteroALetras(1000)).toBe('MIL');
    expect(enteroALetras(2500)).toBe('DOS MIL QUINIENTOS');
  });
  test('millones', () => {
    expect(enteroALetras(1_000_000)).toBe('UN MILLON');
    expect(enteroALetras(3_250_118)).toBe('TRES MILLONES DOSCIENTOS CINCUENTA MIL CIENTO DIECIOCHO');
  });
  test('rechaza fuera de rango', () => {
    expect(() => enteroALetras(-1)).toThrow();
    expect(() => enteroALetras(1.5)).toThrow();
  });
});

describe('montoALetras', () => {
  test('ejemplo verificado de document-types.md: S/118.00', () => {
    expect(montoALetras(118, 'PEN')).toBe('SON CIENTO DIECIOCHO CON 00/100 SOLES');
  });
  test('céntimos distintos de cero', () => {
    expect(montoALetras(45.5, 'PEN')).toBe('SON CUARENTA Y CINCO CON 50/100 SOLES');
  });
  test('singular cuando la parte entera es 1', () => {
    expect(montoALetras(1, 'PEN')).toBe('SON UNO CON 00/100 SOL');
  });
  test('otras monedas del catálogo 02', () => {
    expect(montoALetras(10, 'USD')).toBe('SON DIEZ CON 00/100 DOLARES AMERICANOS');
    expect(montoALetras(10, 'EUR')).toBe('SON DIEZ CON 00/100 EUROS');
  });
  test('singular en USD cuando la parte entera es 1', () => {
    expect(montoALetras(1, 'USD')).toBe('SON UNO CON 00/100 DOLAR AMERICANO');
  });
  test('USD con céntimos', () => {
    expect(montoALetras(168, 'USD')).toBe('SON CIENTO SESENTA Y OCHO CON 00/100 DOLARES AMERICANOS');
  });
  test('moneda fuera de catálogo lanza error', () => {
    expect(() => montoALetras(10, 'GBP')).toThrow();
  });
});
