import { DOMParser } from '@xmldom/xmldom';
import type { CredencialesSol } from './tipos.js';

/** Construye el sobre SOAP 1.1 + WS-Security UsernameToken que SUNAT exige para sendBill. */
export function construirSobreSendBill(
  nombreArchivoZip: string,
  zipBase64: string,
  credenciales: CredencialesSol,
): string {
  const usuarioSoap = `${credenciales.ruc}${credenciales.usuario}`;
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.sunat.gob.pe" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <soapenv:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>${usuarioSoap}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${credenciales.clave}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <ser:sendBill>
      <fileName>${nombreArchivoZip}</fileName>
      <contentFile>${zipBase64}</contentFile>
    </ser:sendBill>
  </soapenv:Body>
</soapenv:Envelope>`;
}

/** Construye el sobre SOAP 1.1 + WS-Security UsernameToken para getStatus (sondeo de tickets async: Resumen, Baja, Reversión). */
export function construirSobreGetStatus(ticket: string, credenciales: CredencialesSol): string {
  const usuarioSoap = `${credenciales.ruc}${credenciales.usuario}`;
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.sunat.gob.pe" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <soapenv:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>${usuarioSoap}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${credenciales.clave}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <ser:getStatus>
      <ticket>${ticket}</ticket>
    </ser:getStatus>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function textoDeElemento(doc: Document, nombreLocal: string): string | null {
  const nodos = doc.getElementsByTagName('*');
  for (let i = 0; i < nodos.length; i++) {
    const nodo = nodos[i]!;
    if (nodo.localName === nombreLocal) {
      return nodo.textContent;
    }
  }
  return null;
}

export interface RespuestaSoapSendBill {
  /** Base64 del .zip con el CDR, si SUNAT aceptó procesar el envío. */
  applicationResponseBase64: string | null;
  /** Presente si SUNAT devolvió un SOAP Fault (p.ej. credenciales inválidas, XML mal formado). */
  fault: { codigo: string; mensaje: string } | null;
}

/** Interpreta la respuesta SOAP cruda de sendBill: éxito (applicationResponse) o SOAP Fault. */
export function interpretarRespuestaSendBill(xmlRespuesta: string): RespuestaSoapSendBill {
  const doc = new DOMParser().parseFromString(xmlRespuesta, 'text/xml');

  const faultCode = textoDeElemento(doc, 'faultcode');
  const faultString = textoDeElemento(doc, 'faultstring');
  if (faultCode || faultString) {
    return {
      applicationResponseBase64: null,
      fault: { codigo: faultCode ?? 'desconocido', mensaje: faultString ?? 'sin mensaje' },
    };
  }

  return {
    applicationResponseBase64: textoDeElemento(doc, 'applicationResponse'),
    fault: null,
  };
}

export interface RespuestaSoapGetStatus {
  /** Código de estado crudo devuelto por SUNAT (p.ej. "0" cuando ya hay CDR). SUNAT no documenta
   *  un catálogo cerrado de valores intermedios ("en proceso"), así que este cliente no intenta
   *  interpretarlo — solo lo expone para diagnóstico; ver `content` para saber si ya hay CDR. */
  statusCode: string | null;
  /** Base64 del .zip con el CDR, presente solo cuando SUNAT ya terminó de procesar el ticket. */
  contentBase64: string | null;
  fault: { codigo: string; mensaje: string } | null;
}

/** Interpreta la respuesta SOAP cruda de getStatus: éxito (statusCode/content) o SOAP Fault. */
export function interpretarRespuestaGetStatus(xmlRespuesta: string): RespuestaSoapGetStatus {
  const doc = new DOMParser().parseFromString(xmlRespuesta, 'text/xml');

  const faultCode = textoDeElemento(doc, 'faultcode');
  const faultString = textoDeElemento(doc, 'faultstring');
  if (faultCode || faultString) {
    return {
      statusCode: null,
      contentBase64: null,
      fault: { codigo: faultCode ?? 'desconocido', mensaje: faultString ?? 'sin mensaje' },
    };
  }

  return {
    statusCode: textoDeElemento(doc, 'statusCode'),
    contentBase64: textoDeElemento(doc, 'content'),
    fault: null,
  };
}

/** Extrae código y descripción de un CDR (ApplicationResponse UBL) ya desempaquetado del zip. */
export function interpretarCdr(cdrXml: string): { codigo: number; descripcion: string } {
  const doc = new DOMParser().parseFromString(cdrXml, 'text/xml');
  const codigoTexto = textoDeElemento(doc, 'ResponseCode');
  const descripcion = textoDeElemento(doc, 'Description') ?? textoDeElemento(doc, 'Note') ?? '';
  if (codigoTexto === null) {
    throw new Error('El CDR no contiene cbc:ResponseCode — ¿es realmente un ApplicationResponse UBL?');
  }
  return { codigo: Number(codigoTexto), descripcion };
}
