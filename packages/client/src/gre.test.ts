// Tests unitarios del cliente OAuth2/REST de GRE con `fetch` mockeado — sin red real (a diferencia
// de cliente.integration.test.ts, este flujo no se probó todavía contra un entorno real de SUNAT).
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, test } from 'bun:test';
import { zipSync, strToU8 } from 'fflate';
import { consultarEstadoGre, enviarGuiaRemision, obtenerTokenGre } from './gre.js';

const CREDENCIALES = {
  ruc: '20000000001',
  usuarioSol: 'MODDATOS',
  claveSol: 'moddatos',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
};

const fetchOriginal = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

function mockearFetch(respuestas: { status?: number; cuerpo: string }[]): { peticiones: Request[] } {
  const cola = [...respuestas];
  const peticiones: Request[] = [];
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    peticiones.push(new Request(url, init));
    const siguiente = cola.shift();
    if (!siguiente) throw new Error('mockearFetch: no quedan respuestas encoladas');
    return new Response(siguiente.cuerpo, { status: siguiente.status ?? 200 });
  }) as typeof fetch;
  return { peticiones };
}

describe('obtenerTokenGre', () => {
  test('arma username=RUC+usuarioSol y devuelve access_token', async () => {
    const { peticiones } = mockearFetch([
      { cuerpo: JSON.stringify({ access_token: 'tok-123', token_type: 'Bearer', expires_in: 3600 }) },
    ]);
    const token = await obtenerTokenGre(CREDENCIALES);
    expect(token).toBe('tok-123');

    const peticion = peticiones[0]!;
    expect(peticion.url).toBe('https://api-seguridad.sunat.gob.pe/v1/clientessol/test-client-id/oauth2/token/');
    const cuerpo = await peticion.text();
    const params = new URLSearchParams(cuerpo);
    expect(params.get('grant_type')).toBe('password');
    expect(params.get('username')).toBe('20000000001MODDATOS');
    expect(params.get('client_id')).toBe('test-client-id');
  });

  test('respuesta HTTP de error lanza con el detalle de SUNAT', async () => {
    mockearFetch([{ status: 401, cuerpo: '{"error":"invalid_client"}' }]);
    await expect(obtenerTokenGre(CREDENCIALES)).rejects.toThrow(/401/);
  });
});

describe('enviarGuiaRemision', () => {
  const id = { ruc: '20000000001', tipoDoc: '09', serie: 'T001', correlativo: '121' };
  const xml = '<Despatch><cbc:ID>T001-121</cbc:ID></Despatch>';

  test('obtiene token, empaqueta el XML y devuelve el numTicket', async () => {
    const { peticiones } = mockearFetch([
      { cuerpo: JSON.stringify({ access_token: 'tok-123', token_type: 'Bearer', expires_in: 3600 }) },
      { cuerpo: JSON.stringify({ numTicket: 'ticket-abc', fecRecepcion: '2026-07-27T00:00:00' }) },
    ]);

    const resultado = await enviarGuiaRemision(xml, id, CREDENCIALES);
    expect(resultado).toEqual({ numTicket: 'ticket-abc', fecRecepcion: '2026-07-27T00:00:00' });

    const peticionEnvio = peticiones[1]!;
    expect(peticionEnvio.url).toBe(
      'https://api-cpe.sunat.gob.pe/v1/contribuyente/gem/comprobantes/20000000001-09-T001-121',
    );
    expect(peticionEnvio.headers.get('Authorization')).toBe('Bearer tok-123');

    const cuerpo = JSON.parse(await peticionEnvio.text()) as {
      archivo: { nomArchivo: string; arcGreZip: string; hashZip: string };
    };
    expect(cuerpo.archivo.nomArchivo).toBe('20000000001-09-T001-121.zip');
    const zipDecodificado = Buffer.from(cuerpo.archivo.arcGreZip, 'base64');
    expect(cuerpo.archivo.hashZip).toBe(createHash('sha256').update(zipDecodificado).digest('hex'));
  });

  test('reutiliza un accessToken explícito en vez de pedir uno nuevo', async () => {
    const { peticiones } = mockearFetch([{ cuerpo: JSON.stringify({ numTicket: 'ticket-abc' }) }]);
    await enviarGuiaRemision(xml, id, CREDENCIALES, { accessToken: 'tok-ya-tengo' });
    expect(peticiones).toHaveLength(1);
    expect(peticiones[0]!.headers.get('Authorization')).toBe('Bearer tok-ya-tengo');
  });
});

describe('consultarEstadoGre', () => {
  test('ticket en proceso (codRespuesta 98): enProceso=true, sin CDR', async () => {
    mockearFetch([{ cuerpo: JSON.stringify({ codRespuesta: '98' }) }]);
    const resultado = await consultarEstadoGre('ticket-abc', CREDENCIALES, { accessToken: 'tok' });
    expect(resultado.enProceso).toBe(true);
    expect(resultado.aceptado).toBe(false);
    expect(resultado.cdrXml).toBeNull();
  });

  test('ticket aceptado (codRespuesta 0) con CDR: descarga y desempaqueta el zip', async () => {
    const cdr = '<ApplicationResponse><cbc:ResponseCode>0</cbc:ResponseCode></ApplicationResponse>';
    const zipCdr = zipSync({ 'R-20000000001-1.xml': strToU8(cdr) });
    mockearFetch([
      {
        cuerpo: JSON.stringify({
          codRespuesta: '0',
          indCdrGenerado: '1',
          arcCdr: Buffer.from(zipCdr).toString('base64'),
        }),
      },
    ]);
    const resultado = await consultarEstadoGre('ticket-abc', CREDENCIALES, { accessToken: 'tok' });
    expect(resultado.enProceso).toBe(false);
    expect(resultado.aceptado).toBe(true);
    expect(resultado.cdrXml).toBe(cdr);
  });

  test('envío con error (codRespuesta 99): expone numError/desError', async () => {
    mockearFetch([
      {
        cuerpo: JSON.stringify({
          codRespuesta: '99',
          error: { numError: '2800', desError: 'El comprobante ya fue registrado' },
        }),
      },
    ]);
    const resultado = await consultarEstadoGre('ticket-abc', CREDENCIALES, { accessToken: 'tok' });
    expect(resultado.enProceso).toBe(false);
    expect(resultado.aceptado).toBe(false);
    expect(resultado.codigoError).toBe('2800');
    expect(resultado.descripcionError).toBe('El comprobante ya fue registrado');
  });
});
