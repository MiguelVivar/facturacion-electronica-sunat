import { describe, expect, test } from 'bun:test';
import { comandoFirmar } from './firmar.js';

describe('comandoFirmar', () => {
  test('sin argumentos muestra el uso', async () => {
    expect(await comandoFirmar(undefined, undefined, undefined)).toContain('Uso:');
  });

  test('archivo inexistente lanza error', async () => {
    await expect(comandoFirmar('no-existe.xml', 'no-existe.pem', 'no-existe.pem')).rejects.toThrow();
  });
});
