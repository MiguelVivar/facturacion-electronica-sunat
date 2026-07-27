import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { comandoCalcular } from './calcular.js';

const EJEMPLO_ITEMS = join(import.meta.dir, '..', '..', 'ejemplos', 'items.json');

describe('comandoCalcular', () => {
  test('sin ruta muestra el uso', async () => {
    expect(await comandoCalcular(undefined)).toContain('Uso:');
  });

  test('calcula el ejemplo verificado desde ejemplos/items.json (S/100 + IGV = S/118)', async () => {
    const salida = await comandoCalcular(EJEMPLO_ITEMS);
    expect(salida).toContain('mtoIGV: 18');
    expect(salida).toContain('subTotal: 118');
  });

  test('archivo inexistente lanza error', async () => {
    await expect(comandoCalcular('no-existe.json')).rejects.toThrow();
  });
});
