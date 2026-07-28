// Tests unitarios de consultarTicket con `fetch` mockeado (sin red) — el pipeline SOAP real
// contra FE_BETA ya se prueba en cliente.integration.test.ts para enviarComprobante.
import { afterEach, describe, expect, test } from 'bun:test';
import { zipSync, strToU8 } from 'fflate';
import { consultarTicket } from './cliente.js';

const CREDENCIALES = { ruc: '20000000001', usuario: 'MODDATOS', clave: 'moddatos' };

function envolverSoap(cuerpo: string): string {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body>${cuerpo}</soapenv:Body></soapenv:Envelope>`;
}

function cdrBase64(codigo: number, descripcion: string): string {
  const cdr = `<ApplicationResponse xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cac:DocumentResponse xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
      <cac:Response><cbc:ResponseCode>${codigo}</cbc:ResponseCode><cbc:Description>${descripcion}</cbc:Description></cac:Response>
    </cac:DocumentResponse>
  </ApplicationResponse>`;
  const zip = zipSync({ 'R-20000000001-20260727.xml': strToU8(cdr) });
  return Buffer.from(zip).toString('base64');
}

const fetchOriginal = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

function mockearFetch(textoRespuesta: string): void {
  globalThis.fetch = (async () => new Response(textoRespuesta)) as typeof fetch;
}

describe('consultarTicket', () => {
  test('ticket todavía en proceso: enProceso=true, sin CDR', async () => {
    mockearFetch(envolverSoap('<statusResponse><status><statusCode>98</statusCode></status></statusResponse>'));
    const resultado = await consultarTicket('ticket-123', CREDENCIALES);
    expect(resultado.enProceso).toBe(true);
    expect(resultado.statusCode).toBe('98');
    expect(resultado.cdrXml).toBeNull();
    expect(resultado.aceptado).toBe(false);
  });

  test('ticket procesado y aceptado: descarga y decodifica el CDR', async () => {
    const content = cdrBase64(0, 'El Resumen fue aceptado');
    mockearFetch(
      envolverSoap(`<statusResponse><status><statusCode>0</statusCode><content>${content}</content></status></statusResponse>`),
    );
    const resultado = await consultarTicket('ticket-123', CREDENCIALES);
    expect(resultado.enProceso).toBe(false);
    expect(resultado.aceptado).toBe(true);
    expect(resultado.codigoCdr).toBe(0);
    expect(resultado.descripcion).toBe('El Resumen fue aceptado');
    expect(resultado.cdrXml).toContain('<cbc:ResponseCode>0</cbc:ResponseCode>');
  });

  test('ticket procesado pero rechazado: aceptado=false con el código real del CDR', async () => {
    const content = cdrBase64(2000, 'El Resumen fue rechazado');
    mockearFetch(
      envolverSoap(`<statusResponse><status><statusCode>0</statusCode><content>${content}</content></status></statusResponse>`),
    );
    const resultado = await consultarTicket('ticket-123', CREDENCIALES);
    expect(resultado.enProceso).toBe(false);
    expect(resultado.aceptado).toBe(false);
    expect(resultado.codigoCdr).toBe(2000);
  });

  test('SOAP Fault (p.ej. ticket inexistente): enProceso=false, descripción con el mensaje de SUNAT', async () => {
    mockearFetch(
      envolverSoap('<soapenv:Fault><faultcode>soapenv:Client.9999</faultcode><faultstring>El ticket no existe</faultstring></soapenv:Fault>'),
    );
    const resultado = await consultarTicket('ticket-inexistente', CREDENCIALES);
    expect(resultado.enProceso).toBe(false);
    expect(resultado.aceptado).toBe(false);
    expect(resultado.descripcion).toContain('El ticket no existe');
  });
});
