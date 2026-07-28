import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { SignedXml } from 'xml-crypto';
import { firmarXml } from './firmar.js';

const DIR_PRUEBAS = join(import.meta.dir, '..', 'pruebas');
const CLAVE_PRIVADA = readFileSync(join(DIR_PRUEBAS, 'clave-privada-prueba.pem'), 'utf-8');
const CERTIFICADO = readFileSync(join(DIR_PRUEBAS, 'certificado-prueba.pem'), 'utf-8');

const XML_SIN_FIRMAR = `<?xml version="1.0" encoding="ISO-8859-1"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">F001-1</cbc:ID>
</Invoice>`;

/** Como XML_SIN_FIRMAR, pero con un cbc:Note anidado (la leyenda en letras real de una Factura/Boleta). */
const XML_SIN_FIRMAR_CON_NOTE = `<?xml version="1.0" encoding="ISO-8859-1"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ID>F001-1</cbc:ID>
  <cbc:Note languageLocaleID="1000">SON CIENTO DIECIOCHO CON 00/100 SOLES</cbc:Note>
</Invoice>`;

/** Localiza el nodo ds:Signature en un XML ya firmado y devuelve un verificador cargado con él. */
function crearVerificador(xmlFirmado: string): SignedXml {
  const doc = new DOMParser().parseFromString(xmlFirmado);
  const nodoFirma = doc.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Signature')[0];
  if (!nodoFirma) throw new Error('No se encontró ds:Signature en el XML firmado');
  const verificador = new SignedXml({ publicCert: CERTIFICADO });
  verificador.loadSignature(nodoFirma);
  return verificador;
}

describe('firmarXml', () => {
  test('produce un XML con un elemento ds:Signature dentro de ExtensionContent', () => {
    const firmado = firmarXml(XML_SIN_FIRMAR, {
      clavePrivadaPem: CLAVE_PRIVADA,
      certificadoPem: CERTIFICADO,
    });
    expect(firmado).toContain('<ds:Signature');
    expect(firmado).toContain('<ds:SignatureValue>');
  });

  test('la firma verifica criptográficamente contra el certificado (round-trip real)', () => {
    const firmado = firmarXml(XML_SIN_FIRMAR, {
      clavePrivadaPem: CLAVE_PRIVADA,
      certificadoPem: CERTIFICADO,
    });
    expect(crearVerificador(firmado).checkSignature(firmado)).toBe(true);
  });

  test('una firma se rompe si el XML se altera después de firmar (detecta manipulación)', () => {
    const firmado = firmarXml(XML_SIN_FIRMAR, {
      clavePrivadaPem: CLAVE_PRIVADA,
      certificadoPem: CERTIFICADO,
    });
    const alterado = firmado.replace('F001-1', 'F001-2');
    expect(crearVerificador(alterado).checkSignature(alterado)).toBe(false);
  });

  test('genera un único ds:Reference aunque el XML tenga un cbc:Note anidado (regresión: XPath con // matcheaba también el Note)', () => {
    const firmado = firmarXml(XML_SIN_FIRMAR_CON_NOTE, {
      clavePrivadaPem: CLAVE_PRIVADA,
      certificadoPem: CERTIFICADO,
    });
    const cantidadReferencias = (firmado.match(/<ds:Reference\b/g) ?? []).length;
    expect(cantidadReferencias).toBe(1);
  });

  test('usa URI="" en la Reference, sin agregar un atributo Id espurio a la raíz (SUNAT rechaza Id fuera del XSD)', () => {
    const firmado = firmarXml(XML_SIN_FIRMAR, {
      clavePrivadaPem: CLAVE_PRIVADA,
      certificadoPem: CERTIFICADO,
    });
    expect(firmado).toContain('<ds:Reference URI="">');
    const raiz = firmado.match(/<Invoice\b[^>]*>/)?.[0] ?? '';
    expect(raiz).not.toContain('Id=');
  });
});
