#!/usr/bin/env node
import { comandoCatalogo } from './comandos/catalogo.js';
import { comandoCalcular } from './comandos/calcular.js';
import { comandoGenerarXml } from './comandos/generarXml.js';
import { comandoFirmar } from './comandos/firmar.js';
import { comandoEnviar } from './comandos/enviar.js';

const AYUDA = `sunat-fe — CLI para facturación electrónica SUNAT (Perú)

Comandos:
  catalogo <consulta>                     Busca un código o nombre en los catálogos SUNAT
  calcular <items.json>                   Calcula montos/IGV de cabecera a partir de un JSON de ítems
  generar-xml <datos.json>                Genera el XML UBL 2.1 (SIN FIRMAR) de una Factura/Boleta
  firmar <xml> <clave.pem> <cert.pem>      Firma XML-DSig (ver aviso abajo)
  enviar <xml-firmado> <config.json>       Envía por SOAP al billService de SUNAT (ver aviso abajo)

Ejemplos:
  sunat-fe catalogo factura
  sunat-fe calcular items.json
  sunat-fe generar-xml datos.json
  sunat-fe firmar factura.xml clave.pem certificado.pem
  sunat-fe enviar factura-firmada.xml config-envio.json

AVISO: en pruebas reales contra el entorno BETA de SUNAT, la firma generada por "firmar" fue
rechazada con "Incorrect reference digest value" — "enviar" sí llega, envía y lee la respuesta
real de SUNAT end-to-end, pero no esperes CDR ACEPTADA hasta que ese problema se resuelva
(ver PRODUCT.md).`;

async function main(): Promise<void> {
  const [comando, ...resto] = process.argv.slice(2);

  switch (comando) {
    case 'catalogo':
      console.log(comandoCatalogo(resto[0]));
      break;
    case 'calcular':
      console.log(await comandoCalcular(resto[0]));
      break;
    case 'generar-xml':
      console.log(await comandoGenerarXml(resto[0]));
      if (resto[0]) console.error('\nAVISO: este XML NO está firmado ni ha sido validado contra SUNAT — ver PRODUCT.md.');
      break;
    case 'firmar':
      console.log(await comandoFirmar(resto[0], resto[1], resto[2]));
      if (resto[0] && resto[1] && resto[2]) {
        console.error('\nAVISO: firma no validada por SUNAT todavía (ver PRODUCT.md) — no la uses contra producción.');
      }
      break;
    case 'enviar':
      console.log(await comandoEnviar(resto[0], resto[1]));
      break;
    case undefined:
    case '--help':
    case '-h':
      console.log(AYUDA);
      break;
    default:
      console.error(`Comando desconocido: "${comando}"\n`);
      console.error(AYUDA);
      process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
