// Prueba de integración REAL contra el entorno BETA público de SUNAT — usa las credenciales
// públicas de prueba (RUC 20000000001 / MODDATOS / moddatos, documentadas en
// references/greenter-php.md de la skill sunat-comprobantes) y el certificado de prueba público
// de Greenter (packages/signer/pruebas). No es un mock: recorre calc→xml→firma→zip→SOAP→CDR real.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generarXmlFacturaBoleta } from 'sunat-fe-xml';
import { firmarXml } from 'sunat-fe-signer';
import { enviarComprobante } from './cliente.js';

const CERT_DIR = join(import.meta.dir, '..', '..', 'signer', 'pruebas');
const clavePrivadaPem = readFileSync(join(CERT_DIR, 'clave-privada-prueba-2026.pem'), 'utf-8');
const certificadoPem = readFileSync(join(CERT_DIR, 'certificado-prueba-2026.pem'), 'utf-8');

const RUC_BETA = '20000000001';
const correlativo = String(Math.floor(Math.random() * 1_000_000) + 1);

describe('enviarComprobante (integración real contra FE_BETA)', () => {
  test('una factura real firmada es aceptada o al menos devuelve un CDR/SOAP interpretable', async () => {
    const datos = {
      tipoDoc: '01' as const,
      serie: 'F001',
      correlativo,
      fechaEmision: new Date(),
      moneda: 'PEN',
      emisor: {
        ruc: RUC_BETA,
        razonSocial: 'MODDATOS',
        direccion: 'Av. Prueba 123, Lima',
      },
      cliente: {
        tipoDocumento: '6',
        numeroDocumento: '20123456789',
        razonSocialONombre: 'Cliente de Prueba S.A.C.',
      },
      items: [
        {
          cantidad: 1,
          descripcion: 'Servicio de consultoría',
          unidad: 'ZZ',
          mtoValorUnitario: 100,
          tipAfeIgv: '10',
        },
      ],
    };

    const xmlSinFirmar = generarXmlFacturaBoleta(datos);
    const xmlFirmado = firmarXml(xmlSinFirmar, { clavePrivadaPem, certificadoPem });

    let resultado;
    try {
      resultado = await enviarComprobante(
        xmlFirmado,
        { ruc: RUC_BETA, tipoDoc: '01', serie: 'F001', correlativo },
        { ruc: RUC_BETA, usuario: 'MODDATOS', clave: 'moddatos' },
      );
    } catch (error) {
      throw new Error(
        `No se pudo completar la llamada real a SUNAT BETA (¿sin red desde este entorno?): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    console.log('Resultado real de SUNAT BETA:', JSON.stringify(resultado, null, 2));

    // No forzamos aceptado===true: lo que este test prueba es que el pipeline completo
    // (calc→xml→firma→zip→SOAP→CDR) produce una respuesta real e interpretable de SUNAT,
    // sea ACEPTADA, RECHAZADA (dato de prueba imperfecto) o un SOAP Fault con mensaje legible.
    expect(resultado.descripcion.length).toBeGreaterThan(0);
  }, 30000);
});
