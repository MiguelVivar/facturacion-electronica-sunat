import { readFile } from 'node:fs/promises';
import { firmarXml } from 'sunat-fe-signer';

/**
 * `sunat-fe firmar <xml.xml> <clave-privada.pem> <certificado.pem>` — firma XML-DSig.
 *
 * AVISO: esta firma es criptográficamente autoconsistente (se verifica a sí misma), pero SUNAT
 * la rechazó en las pruebas reales contra su entorno BETA ("Incorrect reference digest value") —
 * ver PRODUCT.md y el comentario en sunat-fe-signer/src/firmar.ts antes de asumir que esto ya
 * produce comprobantes que SUNAT aceptará.
 */
export async function comandoFirmar(
  rutaXml: string | undefined,
  rutaClavePrivada: string | undefined,
  rutaCertificado: string | undefined,
): Promise<string> {
  if (!rutaXml || !rutaClavePrivada || !rutaCertificado) {
    return 'Uso: sunat-fe firmar <xml.xml> <clave-privada.pem> <certificado.pem>';
  }
  const [xmlSinFirmar, clavePrivadaPem, certificadoPem] = await Promise.all([
    readFile(rutaXml, 'utf-8'),
    readFile(rutaClavePrivada, 'utf-8'),
    readFile(rutaCertificado, 'utf-8'),
  ]);
  // Sin avisos en el valor de retorno (se usa en pipelines: `firmar x.xml ... > firmado.xml`
  // seguido de `enviar firmado.xml ...`) — el aviso se imprime a stderr en cli.ts.
  return firmarXml(xmlSinFirmar, { clavePrivadaPem, certificadoPem });
}
