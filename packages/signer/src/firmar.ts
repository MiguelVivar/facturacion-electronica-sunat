import { SignedXml } from 'xml-crypto';

export interface CredencialesFirma {
  clavePrivadaPem: string;
  certificadoPem: string;
}

/**
 * XPath del elemento raíz firmable de cada familia UBL que este proyecto genera.
 * Se amplía a medida que sunat-fe-xml cubra más tipos de documento.
 */
const XPATH_RAIZ_FIRMABLE =
  "//*[local-name(.)='Invoice' or local-name(.)='Note' or local-name(.)='Summary' or local-name(.)='VoidedDocuments']";

/**
 * Firma un XML UBL de SUNAT con XML-DSig (RSA-SHA1 + canonicalización exclusiva), insertando la
 * firma dentro del `ext:ExtensionContent` que sunat-fe-xml deja como marcador estructural.
 *
 * ESTADO CONOCIDO (ver PRODUCT.md — no lo repitas de memoria en otro lugar, actualiza solo aquí):
 * esta es la única de cuatro configuraciones probadas que verifica criptográficamente en local
 * (round-trip real con xml-crypto contra el propio certificado, ver firmar.test.ts). Se probó
 * contra el entorno BETA real de SUNAT y el envío fue rechazado con
 * "SOAP Fault 2335: Incorrect reference digest value" — pero las otras tres variantes probadas
 * (C14N clásico con referencia por Id, C14N clásico con URI vacío/documento completo, y un
 * certificado de prueba recién generado con fechas válidas en vez del certificado público
 * expirado de Greenter) fallaron con el **mismo error exacto**, y dos de ellas ni siquiera
 * verifican en local. Eso descarta la canonicalización y el certificado como la causa aislada;
 * la causa real de por qué SUNAT sigue rechazando esta firma específica no está resuelta y
 * necesita comparar contra una implementación PHP/Greenter real (no solo su documentación) o
 * soporte de SUNAT — no asumas que esto ya envía comprobantes válidos a producción.
 *
 * Deliberadamente NO reimplementa la canonicalización/firma a mano: usa `xml-crypto`, una
 * librería madura para exactamente este sub-problema (ver DESIGN.md / PRODUCT.md del proyecto
 * para por qué esta es la única dependencia de firma que no se construye desde cero).
 */
export function firmarXml(xmlSinFirmar: string, credenciales: CredencialesFirma): string {
  const sig = new SignedXml({
    privateKey: credenciales.clavePrivadaPem,
    publicCert: credenciales.certificadoPem,
  });

  sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
  sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';

  sig.addReference({
    xpath: XPATH_RAIZ_FIRMABLE,
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
  });

  sig.computeSignature(xmlSinFirmar, {
    location: { reference: "//*[local-name(.)='ExtensionContent']", action: 'append' },
    prefix: 'ds',
  });

  return sig.getSignedXml();
}
