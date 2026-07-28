import { describe, expect, test } from 'bun:test';
import { comandoEstado } from './estado.js';

describe('comandoEstado', () => {
  test('sin argumentos muestra el uso', async () => {
    expect(await comandoEstado(undefined, undefined)).toContain('Uso:');
  });

  test('archivo de config inexistente lanza error', async () => {
    await expect(comandoEstado('ticket-123', 'no-existe.json')).rejects.toThrow();
  });
});
