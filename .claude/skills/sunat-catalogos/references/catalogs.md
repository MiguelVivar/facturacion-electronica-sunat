# Catálogos SUNAT (códigos usados en los campos)

Estos son los catálogos oficiales de SUNAT que Greenter/Lycet esperan en los campos de tipo `tipoDoc`, `tipoOperacion`, `tipAfeIgv`, etc. La lista completa y autoritativa vive en las "Reglas de Validación" publicadas en https://cpe.sunat.gob.pe/ — lo de abajo cubre los códigos que aparecen en el 95% de los comprobantes. Si un caso no está aquí (p.ej. anexos de exportación poco comunes), consulta esa página antes de inventar un código.

## Catálogo 01 — Tipo de Documento (Comprobante)

| Código | Documento |
|---|---|
| 01 | Factura |
| 03 | Boleta de Venta |
| 07 | Nota de Crédito |
| 08 | Nota de Débito |
| 09 | Guía de Remisión Remitente |
| 20 | Comprobante de Retención |
| 40 | Comprobante de Percepción |

Nota de Crédito/Débito comparten el mismo modelo (`Note`), solo cambia `tipoDoc` (07 u 08) y el catálogo del motivo (09 o 10, ver abajo).

## Catálogo 06 — Tipo de Documento de Identidad (para `tipoDoc` de Client/Company)

| Código | Documento |
|---|---|
| 0 | Doc. Trib. No Dom. Sin RUC (venta a extranjero sin RUC) |
| 1 | DNI |
| 4 | Carné de Extranjería |
| 6 | RUC |
| 7 | Pasaporte |
| A | Cédula Diplomática de Identidad |

## Catálogo 02 — Moneda (ISO 4217, `tipoMoneda`)

`PEN` (Sol), `USD` (Dólar), `EUR` (Euro). PEN es lo normal salvo exportación o pacto explícito en moneda extranjera.

## Catálogo 03 — Unidades de Medida (`unidad` en cada item)

Los más comunes: `NIU` (Unidad, bienes), `ZZ` (Servicios), `KGM` (Kilogramo), `LTR` (Litro), `MTR` (Metro), `BX` (Caja), `GLL` (Galón). Lista completa (UN/ECE rec 20) en la página de SUNAT si el producto usa una unidad menos común.

## Catálogo 07 — Tipo de Afectación del IGV (`tipAfeIgv` en cada item)

| Código | Afectación |
|---|---|
| 10 | Gravado — Operación Onerosa (el caso normal, con IGV 18%) |
| 11 | Gravado — Retiro por premio |
| 12 | Gravado — Retiro por donación |
| 13 | Gravado — Retiro |
| 15 | Gravado — Bonificaciones |
| 16 | Gravado — Retiro por entrega a trabajadores |
| 17 | Gravado — IVAP |
| 20 | Exonerado — Operación Onerosa (sin IGV, pero el bien está en el apéndice de exonerados) |
| 21 | Exonerado — Transferencia Gratuita |
| 30 | Inafecto — Operación Onerosa |
| 31–37 | Variantes de Inafecto (retiro, bonificación, muestras médicas, etc.) |
| 40 | Exportación (0% IGV, factura de exportación) |

Este código determina en qué "balde" del header cae el monto de la línea: 10-17 → `mtoOperGravadas`, 20-21 → `mtoOperExoneradas`, 30-37 → `mtoOperInafectas`, 40 → `mtoOperExportacion`. Ver [document-types.md](document-types.md) para el cálculo completo.

## Catálogo 09 — Motivo de Nota de Crédito (`codMotivo` cuando `tipoDoc=07`)

| Código | Motivo |
|---|---|
| 01 | Anulación de la operación |
| 02 | Anulación por error en el RUC |
| 03 | Corrección por error en la descripción |
| 04 | Descuento global |
| 05 | Descuento por ítem |
| 06 | Devolución total |
| 07 | Devolución por ítem |
| 08 | Bonificación |
| 09 | Disminución en el valor |
| 10 | Otros conceptos |
| 11 | Ajustes de operaciones de exportación |
| 12 | Ajustes afectos al IVAP |

## Catálogo 10 — Motivo de Nota de Débito (`codMotivo` cuando `tipoDoc=08`)

| Código | Motivo |
|---|---|
| 01 | Intereses por mora |
| 02 | Aumento en el valor |
| 03 | Penalidades / otros conceptos |

## Catálogo 51 — Tipo de Operación (`tipoOperacion`, solo en Factura/Boleta)

Los más comunes: `0101` Venta interna (caso normal), `0112` Venta interna con anticipos, `0200` Exportación de bienes, `0201` Exportación de servicios, `1001` Operación sujeta a detracción, `2001` Operación sujeta a percepción. Si la venta no encaja en ninguno de estos, es venta interna estándar: usa `0101`.

## Catálogo 52 — Leyendas (`code` en `Legend`)

| Código | Uso |
|---|---|
| 1000 | Monto en letras (obligatoria en toda Factura/Boleta) |
| 1002 | Anticipos |
| 2000 | Bienes transferidos a título gratuito |

`1000` es casi siempre obligatoria — el monto total en letras ("SON CIENTO DIECIOCHO CON 00/100 SOLES").
