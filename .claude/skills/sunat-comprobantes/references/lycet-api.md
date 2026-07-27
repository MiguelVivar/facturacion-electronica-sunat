\# Modo API REST (Lycet)

Usa este modo cuando ya hay un servidor Lycet corriendo (local, Docker, o remoto) y no quieres/puedes manejar PHP directamente — por ejemplo si el resto del sistema del usuario está en otro lenguaje. Lycet es un wrapper REST de Symfony sobre Greenter; los nombres de campo en el JSON son exactamente los mismos setters que en el modo PHP.

## Cómo se configura un servidor Lycet

- `.env` en la raíz del proyecto Lycet: `CLIENT_TOKEN` (token de la API), `SOL_USER` (es RUC+usuario SOL concatenados, ej. `20000000001MODDATOS`), `SOL_PASS`, `FE_URL`, `RE_URL`, `GUIA_URL` (o `AUTH_URL`/`API_URL`/`CLIENT_ID`/`CLIENT_SECRET` para guías vía SEE-API).
- Certificado y logo van en `/data/cert.pem` y `/data/logo.png`, o se registran por API (ver abajo) o vía `empresas.json` para multi-empresa.
- Correr: `php -S 0.0.0.0:8000 -t public` o Docker (`docker run -p 8000:8000 -v ./data:/var/www/html/data lycet`).
- Todas las requests llevan el token como query param: `?token=<CLIENT_TOKEN>`.

**No asumas que hay un servidor Lycet corriendo** — comprueba `LYCET_API_URL` (o el nombre de variable que use el proyecto) y `LYCET_API_TOKEN` antes de intentar pegarle a la API. Si no existe, o bien se levanta un servidor local (ver arriba) o se usa el modo PHP directo.

## Endpoints (prefijo `/api/v1` normalmente, confirmar con `swagger.yaml` del proyecto)

| Comprobante | Enviar | Solo XML | Solo PDF | Estado (async) |
|---|---|---|---|---|
| Factura / Boleta | `POST /invoice/send` | `POST /invoice/xml` | `POST /invoice/pdf` | `GET /invoice/status` |
| Nota Crédito/Débito | `POST /note/send` | `POST /note/xml` | `POST /note/pdf` | — |
| Resumen Diario | `POST /summary/send` | `POST /summary/xml` | `POST /summary/pdf` | `GET /summary/status` |
| Comunicación de Baja | `POST /voided/send` | `POST /voided/xml` | `POST /voided/pdf` | `GET /voided/status` |
| Guía de Remisión | `POST /despatch/send` | `POST /despatch/xml` | `POST /despatch/pdf` | `GET /despatch/status` |
| Comprobante de Retención | `POST /retention/send` | `POST /retention/xml` | `POST /retention/pdf` | — |
| Comprobante de Percepción | `POST /peception/send` (typo real, ver nota) | `POST /peception/xml` | `POST /peception/pdf` | — |
| Reversión | `POST /reversion/send` | `POST /reversion/xml` | `POST /reversion/pdf` | `GET /reversion/status` |
| QR de una venta | `POST /sale/qr` | — | — | — |
| Config. de empresa | `PUT /configuration/company/{ruc}`, `DELETE /configuration/company/{ruc}` | — | — | — |

**Nota sobre el endpoint de Percepción:** está mal escrito en la propia API de Lycet como `peception` (falta la "r"), no es un error de esta guía — así está en el código fuente actual del proyecto. Si lo escribes correctamente como `perception`, la request fallará con 404.

El body de `/invoice/send`, `/note/send`, etc. es directamente el JSON del comprobante (ver siguiente sección) — no hay envoltorio extra.

## Ejemplo — enviar una factura/boleta

```bash
curl -X POST "http://localhost:8000/api/v1/invoice/send?token=123456" \
  -H "Content-Type: application/json" \
  -d '{
    "tipoDoc": "03",
    "serie": "B001",
    "correlativo": "1",
    "fechaEmision": "2020-08-24T13:05:00-05:00",
    "tipoMoneda": "PEN",
    "client": {"tipoDoc": "1", "numDoc": "46712369", "rznSocial": "MARIA RAMOS ARTEAGA"},
    "company": {"ruc": "20000000001", "razonSocial": "EMPRESA SAC"},
    "mtoOperGravadas": 100.00,
    "mtoIGV": 18.00,
    "totalImpuestos": 18.00,
    "valorVenta": 100.00,
    "subTotal": 118.00,
    "mtoImpVenta": 118.00,
    "details": [{
      "codProducto": "P001", "unidad": "NIU", "cantidad": 2,
      "descripcion": "PRODUCTO 1", "mtoValorUnitario": 50.00,
      "mtoBaseIgv": 100, "porcentajeIgv": 18.00, "igv": 18.00,
      "tipAfeIgv": "10", "totalImpuestos": 18.00,
      "mtoValorVenta": 100.00, "mtoPrecioUnitario": 59.00
    }],
    "legends": [{"code": "1000", "value": "SON CIENTO DIECIOCHO CON 00/100 SOLES"}]
  }'
```

Respuesta (`DocumentResponse`): `{ xml, hash, sunatResponse: { success, error, cdrZip (base64), cdrResponse: { accepted, code, description, notes[] } } }`. Igual que en modo PHP: `code === 0` → aceptada, `2000-3999` → rechazada, cualquier otro rango → excepción/error.

## Esquema JSON completo por tipo de documento (campos verificados desde el swagger de Lycet)

Los nombres de campo son idénticos a los setters de Greenter (`mtoValorVenta`, `tipAfeIgv`, etc. — ver [document-types.md](document-types.md) para el cálculo).

- **Invoice** (Factura/Boleta): `tipoDoc, serie, correlativo, fechaEmision, formaPago{moneda,tipo,monto}, cuotas[], client{}, company{}, tipoMoneda, mtoOperGravadas, mtoOperInafectas, mtoOperExoneradas, mtoOperExportacion, mtoOperGratuitas, mtoIGV, mtoIGVGratuitas, mtoISC, mtoOtrosTributos, icbper, valorVenta, subTotal, mtoImpVenta, details[], legends[], guias[], relDocs[], observacion, tipoOperacion, ublVersion, perception{}, guiaEmbebida{}, anticipos[], detraccion{}, seller{}, direccionEntrega{}, descuentos[], cargos[], redondeo, name`.
- **Note** (Crédito/Débito): mismos campos que Invoice salvo `valorVenta`/`subTotal` opcionales, más `codMotivo, desMotivo, tipDocAfectado, numDocfectado`.
- **Summary** (Resumen Diario): `correlativo, fecGeneracion, fecResumen, moneda, company{}, details[]` — cada `SummaryDetail` referencia una boleta ya emitida (tipoDoc, serie, correlativo, estado, montos).
- **Voided** (Comunicación de Baja) / **Reversion**: `correlativo, fecGeneracion, fecComunicacion, company{}, details[]` — cada `VoidedDetail` es `{tipoDoc, serie, correlativo, desMotivoBaja}`.
- **Despatch** (Guía de Remisión): `version, tipoDoc, serie, correlativo, observacion, fechaEmision, company{}, destinatario{}, tercero{}, comprador{}, envio{Shipment}, docBaja{}, relDoc{}, addDocs[], details[]`.
- **Retention**: `serie, correlativo, fechaEmision, proveedor{}, company{}, regimen, tasa, impRetenido, impPagado, observacion, details[]` — cada `RetentionDetail` es el comprobante de compra afectado, con `pagos[]` y `tipoCambio`.
- **Perception**: `serie, correlativo, fechaEmision, company{}, proveedor{}, regimen, tasa, impPercibido, impCobrado, observacion, details[]` — cada `PerceptionDetail` similar a Retention pero con `cobros[]`.

Para el detalle campo-por-campo exacto (tipos, sub-objetos como `Shipment`, `Charge`, `DetailAttribute`), consulta el `swagger.yaml` del repo Lycet directamente (`https://raw.githubusercontent.com/giansalex/lycet/master/public/swagger.yaml`) — es la fuente de verdad y puede tener campos nuevos que esta guía no cubre.

## Gestión de empresas por API (útil si el usuario administra varios RUCs)

```bash
curl -X PUT "http://localhost:8000/api/v1/configuration/company/20000000001?token=123456" \
  -H "Content-Type: application/json" \
  -d '{"SOL_USER":"20000000001MODDATOS","SOL_PASS":"moddatos","certificate":"<PEM en base64>","FE_URL":"https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService"}'
```

Trata `SOL_PASS` y el certificado como secretos reales del usuario en un caso real — nunca los imprimas en logs ni los incluyas en el código que entregues, solo en la llamada a la API/config local. (El ejemplo de arriba usa credenciales BETA públicas de SUNAT, no un secreto real.)
