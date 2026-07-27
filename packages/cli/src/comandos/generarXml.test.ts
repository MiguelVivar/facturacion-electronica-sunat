import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { comandoGenerarXml } from './generarXml.js';

const EJEMPLO_DATOS = join(import.meta.dir, '..', '..', 'ejemplos', 'datos.json');

describe('comandoGenerarXml', () => {
  test('sin ruta muestra el uso', async () => {
    expect(await comandoGenerarXml(undefined)).toContain('Uso:');
  });

  test('genera el XML puro, sin texto adicional (debe poder redirigirse a un archivo .xml)', async () => {
    const salida = await comandoGenerarXml(EJEMPLO_DATOS);
    expect(salida).toContain('<cbc:ID>F001-1</cbc:ID>');
    expect(salida.trim().endsWith('</Invoice>')).toBe(true);
  });
});
