import { describe, expect, test } from 'bun:test';
import { buscarCatalogo, TIPOS_AFECTACION_IGV, TIPOS_DOCUMENTO } from './catalogos.js';

describe('buscarCatalogo', () => {
  test('encuentra por código exacto', () => {
    const resultados = buscarCatalogo('01');
    expect(resultados.some((r) => r.catalogo === 'tipo-documento' && r.nombre === 'Factura')).toBe(true);
  });

  test('encuentra por coincidencia parcial de nombre, sin importar mayúsculas', () => {
    const resultados = buscarCatalogo('factura');
    expect(resultados.some((r) => r.codigo === '01')).toBe(true);
  });

  test('un código compartido entre catálogos (p.ej. "10") devuelve todas las coincidencias', () => {
    const resultados = buscarCatalogo('10');
    const catalogos = new Set(resultados.map((r) => r.catalogo));
    expect(catalogos.has('afectacion-igv')).toBe(true);
  });

  test('consulta sin coincidencias devuelve arreglo vacío', () => {
    expect(buscarCatalogo('no-existe-xyz')).toEqual([]);
  });
});

describe('catálogos crudos', () => {
  test('TIPOS_DOCUMENTO tiene los 7 documentos del catálogo 01', () => {
    expect(TIPOS_DOCUMENTO).toHaveLength(7);
  });

  test('TIPOS_AFECTACION_IGV cubre los códigos gravados 10-17 documentados', () => {
    const codigos = TIPOS_AFECTACION_IGV.map((c) => c.codigo);
    expect(codigos).toContain('10');
    expect(codigos).toContain('17');
  });
});
