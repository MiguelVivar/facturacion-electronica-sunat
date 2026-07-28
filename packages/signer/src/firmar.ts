import { SignedXml } from 'xml-crypto';

export interface CredencialesFirma {
  clavePrivadaPem: string;
  certificadoPem: string;
}

/**
 * XPath del elemento raíz firmable de cada familia UBL que este proyecto genera.
 * Se amplía a medida que sunat-fe-xml cubra más tipos de documento.
 *
 * IMPORTANTE: el `/` inicial (no `//`) ancla la búsqueda al elemento raíz del documento. Con `//`
 * este XPath también matcheaba `<cbc:Note>` (la leyenda en letras dentro de un Invoice, cuyo
 * local-name literal es "Note"), generando un segundo `<ds:Reference>` espurio en el SignedInfo
 * además del de la raíz — una firma con dos referencias en vez de una, que SUNAT rechazaba.
 */
const XPATH_RAIZ_FIRMABLE =
  "/*[local-name(.)='Invoice' or local-name(.)='Note' or local-name(.)='Summary' or local-name(.)='VoidedDocuments']";

/**
 * Firma un XML UBL de SUNAT con XML-DSig (RSA-SHA1 + canonicalización C14N clásica), insertando
 * la firma dentro del `ext:ExtensionContent` que sunat-fe-xml deja como marcador estructural.
 *
 * ESTADO CONOCIDO (ver PRODUCT.md — no lo repitas de memoria en otro lugar, actualiza solo aquí):
 * la versión anterior de esta función era rechazada siempre por SUNAT BETA con
 * "SOAP Fault 2335: Incorrect reference digest value". Se probaron variantes de algoritmo de
 * canonicalización (exc-c14n vs. C14N clásico) y de contenido (ASCII puro vs. acentuado) contra
 * el entorno BETA real (ver cliente.integration.test.ts) y NINGUNA cambió el error — descartando
 * la canonicalización y la codificación de caracteres como causa. Las causas reales eran
 * estructurales, no de algoritmo:
 *
 * 1. `XPATH_RAIZ_FIRMABLE` usaba `//*[...]` (cualquier descendiente). Como `local-name(.)='Note'`
 *    también matchea `<cbc:Note>` (la leyenda en letras dentro de un Invoice), se generaban DOS
 *    `<ds:Reference>` en el SignedInfo en vez de una — una firma con forma inesperada que SUNAT
 *    rechazaba. Cambiar a `/*[...]` (solo la raíz del documento) lo resolvió.
 * 2. Sin `isEmptyUri: true`, xml-crypto le agrega un atributo `Id="_0"` al elemento raíz para
 *    poder referenciarlo como `URI="#_0"`. Ese atributo `Id` no existe en el XSD de UBL Invoice-2
 *    de SUNAT, así que el envío pasaba de "Incorrect reference digest value" a un error de
 *    parseo de esquema ("had undefined attribute Id") en cuanto se corregía el punto 1. La forma
 *    correcta es referenciar el documento completo con `URI=""` (mismo enfoque que
 *    `Greenter\XMLSecLibs\Sunat\SignedXml::sign()`, que usa `force_uri => true` para lo mismo).
 *
 * Con ambos fixes, el envío real contra SUNAT BETA deja de fallar por firma/esquema por completo:
 * el error pasa a ser un rechazo de contenido de negocio no relacionado ("3244: Debe consignar
 * la informacion del tipo de transaccion del comprobante"), lo que confirma que SUNAT ya verificó
 * la firma y parseó el documento — esa parte de generarXmlFacturaBoleta (packages/xml) queda como
 * trabajo aparte, fuera del alcance de esta función.
 *
 * El cambio de exc-c14n a C14N clásico (`http://www.w3.org/TR/2001/REC-xml-c14n-20010315`), tanto
 * en el SignedInfo como en la Reference, no se aisló como necesario por sí solo, pero se mantiene
 * porque es la misma elección de `Greenter\XMLSecLibs\Sunat\SignedXml` (github.com/thegreenter/xmldsig),
 * la implementación PHP de referencia que SUNAT sí acepta — minimiza divergencia futura frente a
 * seguir con exc-c14n sin una razón concreta para preferirlo.
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
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

  sig.addReference({
    xpath: XPATH_RAIZ_FIRMABLE,
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    isEmptyUri: true,
  });

  sig.computeSignature(xmlSinFirmar, {
    location: { reference: "//*[local-name(.)='ExtensionContent']", action: 'append' },
    prefix: 'ds',
  });

  return sig.getSignedXml();
}
