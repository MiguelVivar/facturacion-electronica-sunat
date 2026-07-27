# Tipos de comprobante: mapeo y cálculo de totales

## Tabla de mapeo

| Comprobante | tipoDoc | Clase Greenter (PHP) | Endpoint Lycet | Async (ticket)? |
|---|---|---|---|---|
| Factura | 01 | `Greenter\Model\Sale\Invoice` | `/invoice/*` | No |
| Boleta de Venta | 03 | `Greenter\Model\Sale\Invoice` (mismo modelo, cambia tipoDoc) | `/invoice/*` | No |
| Nota de Crédito | 07 | `Greenter\Model\Sale\Note` | `/note/*` | No |
| Nota de Débito | 08 | `Greenter\Model\Sale\Note` (mismo modelo, cambia tipoDoc) | `/note/*` | No |
| Resumen Diario de Boletas | — | `Greenter\Model\Summary\Summary` + `SummaryDetail` | `/summary/*` | **Sí** — `send()` da un ticket, hay que sondear `/summary/status` |
| Comunicación de Baja | — | `Greenter\Model\Voided\Voided` + `VoidedDetail` | `/voided/*` | **Sí** — igual que Resumen |
| Comunicación de Reversión | — | `Greenter\Model\Voided\Reversion` + `VoidedDetail` | `/reversion/*` | **Sí** |
| Guía de Remisión Remitente | 09 | `Greenter\Model\Despatch\Despatch` + `DespatchDetail` | `/despatch/*` | **Sí** (ticket) — ⚠️ ver nota abajo, ya NO usa SOAP |
| Comprobante de Retención | 20 | `Greenter\Model\Retention\Retention` + `RetentionDetail` | `/retention/*` | No |
| Comprobante de Percepción | 40 | `Greenter\Model\Perception\Perception` + `PerceptionDetail` | `/peception/*` ⚠️ typo real en la API, no `perception` | No |

⚠️ **Guía de Remisión desde 2023 ya no usa el webservice SOAP** (`SunatEndpoints::GUIA_BETA/GUIA_PRODUCCION` están deprecados en el código). SUNAT migró la Guía a la "SEE-API": autenticación OAuth2 (`client_id`/`client_secret` contra un `AUTH_URL`) y envío REST contra un `API_URL`. En Greenter esto lo maneja `Greenter\Ws\Api\GreSender` en vez del SOAP client normal — si vas a emitir guías en modo PHP, confírmalo con la referencia oficial (`reference.greenter.dev`) o el código fuente instalado, porque el flujo de configuración difiere del resto de comprobantes (ver [greenter-php.md](greenter-php.md)). En modo Lycet, el `.env`/`empresas.json` ya trae los campos `AUTH_URL`, `API_URL`, `CLIENT_ID`, `CLIENT_SECRET` para esto — no necesitas montar el OAuth tú mismo.

## Cálculo de montos (Factura/Boleta — el caso más común)

La fórmula completa y verificada vive en la skill **`sunat-calculo`**
([formula-montos.md](../../sunat-calculo/references/formula-montos.md)) — no la repitas ni la
reinventes aquí. Ya está implementada y probada en `packages/core/src/calculo.ts`
(`calcularCabecera`), expuesta también por `sunat-fe calcular <items.json>`.

## Nota de Crédito/Débito — campos propios

Además de los campos de Invoice, una `Note` necesita:

- `tipDocAfectado` / `numDocfectado`: tipo y número del comprobante que se está corrigiendo (p.ej. `01` y `F001-1`).
- `codMotivo` / `desMotivo`: catálogo 09 (crédito) o 10 (débito) — ver [catalogs.md](../../sunat-catalogos/references/catalogs.md).
- El `tipoDoc` de la Note es `07` (crédito) u `08` (débito).

## Resumen Diario / Comunicación de Baja / Reversión — flujo async

Estos tres **no** devuelven el CDR de inmediato: `send()` devuelve un `ticket`, y hay que consultar el estado por separado (`getStatus($ticket)` en PHP, o `GET /summary/status`, `/voided/status`, `/reversion/status` en Lycet) hasta que SUNAT procese la comunicación — normalmente unos segundos a minutos después. No asumas éxito solo porque `send()` no lanzó error: siempre haz el segundo paso de consulta antes de reportarle al usuario que el comprobante fue aceptado.
