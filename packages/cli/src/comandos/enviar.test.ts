import { describe, expect, test } from 'bun:test';
import { comandoEnviar } from './enviar.js';

describe('comandoEnviar', () => {
  test('sin argumentos muestra el uso', async () => {
    expect(await comandoEnviar(undefined, undefined)).toContain('Uso:');
  });

  test('archivo inexistente lanza error', async () => {
    await expect(comandoEnviar('no-existe.xml', 'no-existe.json')).rejects.toThrow();
  });
});
