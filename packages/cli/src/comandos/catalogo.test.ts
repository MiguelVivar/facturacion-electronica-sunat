import { describe, expect, test } from 'bun:test';
import { comandoCatalogo } from './catalogo.js';

describe('comandoCatalogo', () => {
  test('sin consulta muestra el uso', () => {
    expect(comandoCatalogo(undefined)).toContain('Uso:');
  });
  test('encuentra Factura por nombre', () => {
    expect(comandoCatalogo('factura')).toContain('Factura');
  });
  test('sin resultados es explícito', () => {
    expect(comandoCatalogo('xyz-no-existe')).toContain('Sin resultados');
  });
});
