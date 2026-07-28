import { readFile } from 'node:fs/promises';
import { consultarTicket } from '@miguelvivar/sunat-fe-client';

interface ConfigEstado {
  ruc: string;
  usuario: string;
  clave: string;
  endpoint?: string;
}

function esConfigEstadoValida(valor: unknown): valor is ConfigEstado {
  if (typeof valor !== 'object' || valor === null) return false;
  const c = valor as Record<string, unknown>;
  return typeof c.ruc === 'string' && typeof c.usuario === 'string' && typeof c.clave === 'string';
}

/**
 * `sunat-fe estado <ticket> <config.json>` — sondea el estado de un ticket asíncrono (Resumen
 * Diario de Boletas, Comunicación de Baja, Reversión) vía getStatus y descarga el CDR cuando
 * SUNAT ya terminó de procesarlo. Reutiliza el mismo config.json de `enviar` (basta con
 * ruc/usuario/clave; tipoDoc/serie/correlativo no aplican aquí).
 */
export async function comandoEstado(
  ticket: string | undefined,
  rutaConfig: string | undefined,
): Promise<string> {
  if (!ticket || !rutaConfig) {
    return 'Uso: sunat-fe estado <ticket> <config.json>\nconfig.json: { ruc, usuario, clave, endpoint? }';
  }

  const contenidoConfig = await readFile(rutaConfig, 'utf-8');
  let config: unknown;
  try {
    config = JSON.parse(contenidoConfig);
  } catch {
    throw new Error(`"${rutaConfig}" no contiene JSON válido.`);
  }
  if (!esConfigEstadoValida(config)) {
    throw new Error('config.json debe traer: ruc, usuario, clave (endpoint es opcional).');
  }

  const resultado = await consultarTicket(
    ticket,
    { ruc: config.ruc, usuario: config.usuario, clave: config.clave },
    { endpoint: config.endpoint },
  );

  return JSON.stringify(resultado, null, 2);
}
