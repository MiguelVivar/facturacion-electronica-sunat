import { describe, expect, test } from 'bun:test';
import { escaparXml, etiquetasBalanceadas, formatearFecha, formatearMonto } from './util.js';

describe('escaparXml', () => {
  test('escapa los cinco caracteres especiales', () => {
    expect(escaparXml(`<a> & "b" 'c'`)).toBe('&lt;a&gt; &amp; &quot;b&quot; &apos;c&apos;');
  });
  test('acepta números', () => expect(escaparXml(118)).toBe('118'));
});

describe('formatearFecha', () => {
  test('formatea a YYYY-MM-DD', () => {
    expect(formatearFecha(new Date('2026-07-27T15:00:00Z'))).toBe('2026-07-27');
  });
});

describe('formatearMonto', () => {
  test('siempre 2 decimales', () => {
    expect(formatearMonto(118)).toBe('118.00');
    expect(formatearMonto(18.5)).toBe('18.50');
  });
});

describe('etiquetasBalanceadas', () => {
  test('XML bien formado', () => {
    expect(etiquetasBalanceadas('<a><b>x</b><c/></a>')).toBe(true);
  });
  test('detecta etiqueta sin cerrar', () => {
    expect(etiquetasBalanceadas('<a><b>x</a>')).toBe(false);
  });
  test('ignora la declaración XML', () => {
    expect(etiquetasBalanceadas('<?xml version="1.0"?><a/>')).toBe(true);
  });
});
