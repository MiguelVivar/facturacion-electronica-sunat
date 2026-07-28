import { describe, expect, test } from 'bun:test';
import {
  construirSobreGetStatus,
  construirSobreSendBill,
  interpretarCdr,
  interpretarRespuestaGetStatus,
  interpretarRespuestaSendBill,
} from './soap.js';

describe('construirSobreSendBill', () => {
  test('concatena RUC+usuario en el Username WS-Security', () => {
    const sobre = construirSobreSendBill('20123456789-01-F001-1.zip', 'QkFTRTY0', {
      ruc: '20123456789',
      usuario: 'MODDATOS',
      clave: 'moddatos',
    });
    expect(sobre).toContain('<wsse:Username>20123456789MODDATOS</wsse:Username>');
    expect(sobre).toContain('<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">moddatos</wsse:Password>');
    expect(sobre).toContain('<fileName>20123456789-01-F001-1.zip</fileName>');
    expect(sobre).toContain('<contentFile>QkFTRTY0</contentFile>');
  });
});

describe('interpretarRespuestaSendBill', () => {
  test('extrae applicationResponse de una respuesta exitosa', () => {
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body><applicationResponse>QkFTRTY0</applicationResponse></soapenv:Body>
    </soapenv:Envelope>`;
    const resultado = interpretarRespuestaSendBill(xml);
    expect(resultado.applicationResponseBase64).toBe('QkFTRTY0');
    expect(resultado.fault).toBeNull();
  });

  test('extrae faultcode/faultstring de un SOAP Fault', () => {
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body><soapenv:Fault><faultcode>soapenv:Client.0130</faultcode><faultstring>El certificado no es valido</faultstring></soapenv:Fault></soapenv:Body>
    </soapenv:Envelope>`;
    const resultado = interpretarRespuestaSendBill(xml);
    expect(resultado.applicationResponseBase64).toBeNull();
    expect(resultado.fault).toEqual({ codigo: 'soapenv:Client.0130', mensaje: 'El certificado no es valido' });
  });
});

describe('interpretarCdr', () => {
  test('lee código y descripción de un ApplicationResponse UBL', () => {
    const cdr = `<ApplicationResponse xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
      <cac:DocumentResponse xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
        <cac:Response><cbc:ResponseCode>0</cbc:ResponseCode><cbc:Description>La Factura numero F001-1, ha sido aceptada</cbc:Description></cac:Response>
      </cac:DocumentResponse>
    </ApplicationResponse>`;
    expect(interpretarCdr(cdr)).toEqual({ codigo: 0, descripcion: 'La Factura numero F001-1, ha sido aceptada' });
  });

  test('lanza error si no hay ResponseCode', () => {
    expect(() => interpretarCdr('<Otro/>')).toThrow();
  });
});

describe('construirSobreGetStatus', () => {
  test('incluye el ticket y el Username WS-Security', () => {
    const sobre = construirSobreGetStatus('20123456789-RC-20260727-1', {
      ruc: '20123456789',
      usuario: 'MODDATOS',
      clave: 'moddatos',
    });
    expect(sobre).toContain('<ticket>20123456789-RC-20260727-1</ticket>');
    expect(sobre).toContain('<wsse:Username>20123456789MODDATOS</wsse:Username>');
  });
});

describe('interpretarRespuestaGetStatus', () => {
  test('ticket ya procesado: extrae statusCode y content (CDR en base64)', () => {
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body><statusResponse><status><statusCode>0</statusCode><content>QkFTRTY0</content></status></statusResponse></soapenv:Body>
    </soapenv:Envelope>`;
    const resultado = interpretarRespuestaGetStatus(xml);
    expect(resultado.statusCode).toBe('0');
    expect(resultado.contentBase64).toBe('QkFTRTY0');
    expect(resultado.fault).toBeNull();
  });

  test('ticket todavía en proceso: statusCode presente pero sin content', () => {
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body><statusResponse><status><statusCode>98</statusCode></status></statusResponse></soapenv:Body>
    </soapenv:Envelope>`;
    const resultado = interpretarRespuestaGetStatus(xml);
    expect(resultado.statusCode).toBe('98');
    expect(resultado.contentBase64).toBeNull();
    expect(resultado.fault).toBeNull();
  });

  test('extrae faultcode/faultstring de un SOAP Fault (p.ej. ticket inexistente)', () => {
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body><soapenv:Fault><faultcode>soapenv:Client.9999</faultcode><faultstring>El ticket no existe</faultstring></soapenv:Fault></soapenv:Body>
    </soapenv:Envelope>`;
    const resultado = interpretarRespuestaGetStatus(xml);
    expect(resultado.contentBase64).toBeNull();
    expect(resultado.fault).toEqual({ codigo: 'soapenv:Client.9999', mensaje: 'El ticket no existe' });
  });
});
