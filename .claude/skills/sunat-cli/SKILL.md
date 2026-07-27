---
name: sunat-cli
description: Instala y usa el CLI/paquete npm nativo sunat-fe (catálogos, cálculo de montos, generación de XML UBL 2.1, firma XML-DSig y envío SOAP a SUNAT). Úsala cuando el usuario pida "el CLI de SUNAT", "el paquete npm", "sunat-fe", o quiera usar la librería TypeScript en vez de PHP/Greenter o la API Lycet.
---

# CLI y paquete npm (sunat-fe)

Sub-skill que documenta el ecosistema TypeScript nativo de este proyecto: un monorepo Bun con
`packages/core` (tipos, catálogos, cálculo), `packages/xml` (generación UBL 2.1), `packages/signer`
(firma XML-DSig), `packages/client` (cliente SOAP) y `packages/cli` (el binario `sunat-fe`). Ver
[sunat-comprobantes](../sunat-comprobantes/SKILL.md) para cómo esto encaja junto a los modos
PHP/Lycet existentes.

## Estado real (no sobre-prometer)

- ✅ Catálogos y cálculo de montos/IGV: implementados, probados con `bun test`.
- ✅ Generación de XML UBL 2.1 (Factura/Boleta): implementada, probada, estructuralmente sana.
- ✅ Cliente SOAP (`sunat-fe-client`): **verificado end-to-end contra el entorno BETA real de
  SUNAT** — el zip, la autenticación WS-Security, el envío `sendBill` y la lectura de la
  respuesta (SOAP Fault o CDR) funcionan de verdad, no son un mock.
- ⚠️ Firma XML-DSig (`sunat-fe-signer`): criptográficamente autoconsistente (se firma y se
  verifica a sí misma con éxito), pero **SUNAT la rechaza** con "Incorrect reference digest
  value" — se probaron cuatro configuraciones distintas (canonicalización, estilo de referencia,
  certificado) contra el servidor real y las cuatro fallaron igual. Causa exacta sin resolver;
  ver PRODUCT.md antes de asumir que un comprobante firmado por este paquete será aceptado.
- 📦 El paquete está listo para `npm publish` (bin, exports, package.json) pero **no ha sido
  publicado** — instálalo localmente por ahora (workspace del monorepo, o `npm link`).

No le digas al usuario que esto ya produce comprobantes aceptados por SUNAT: el envío y la lectura
de la respuesta real funcionan, pero la firma específica que se envía todavía es rechazada.

## Instalación (dentro de este monorepo)

```
bun install
```

Los cinco paquetes (`sunat-fe-core`, `sunat-fe-xml`, `sunat-fe-signer`, `sunat-fe-client`,
`sunat-fe`) quedan enlazados como workspace. Para usar el binario:
`bun run --cwd packages/cli build` y luego `node packages/cli/dist/cli.js`, o enlázalo
globalmente con `npm link` desde `packages/cli` una vez compilado.

## Comandos

```
sunat-fe catalogo <consulta>                    # busca un código/nombre en los catálogos SUNAT
sunat-fe calcular <items.json>                  # calcula montos de cabecera (mtoIGV, subTotal, etc.)
sunat-fe generar-xml <datos.json>                # genera el XML UBL 2.1 de una Factura/Boleta
sunat-fe firmar <xml> <clave.pem> <cert.pem>     # firma XML-DSig (ver estado real arriba)
sunat-fe enviar <xml-firmado> <config.json>      # envía por SOAP a SUNAT (ver estado real arriba)
```

Formato de `items.json` y `datos.json`: ver `packages/cli/ejemplos/*.json` para ejemplos reales
que ya pasan los tests del paquete. `config.json` de `enviar`: `{ ruc, tipoDoc, serie,
correlativo, usuario, clave, endpoint? }`.

## Uso programático

```ts
import { calcularCabecera, buscarCatalogo } from 'sunat-fe-core';
import { generarXmlFacturaBoleta } from 'sunat-fe-xml';
import { firmarXml } from 'sunat-fe-signer';
import { enviarComprobante } from 'sunat-fe-client';
```

## Referencias

Los tipos exactos (`Item`, `DatosFacturaBoleta`, etc.) viven en el código fuente de
`packages/core/src/tipos.ts` y `packages/xml/src/tipos.ts` — son la fuente de verdad, no los
repitas de memoria aquí si el código está disponible en el proyecto.
