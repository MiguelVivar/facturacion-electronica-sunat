---
name: sunat-catalogos
description: Busca códigos de catálogo SUNAT (tipo de documento, tipo de afectación IGV, unidad de medida, moneda, motivo de nota, tipo de operación, leyendas). Úsala cuando necesites el código exacto para un campo tipoDoc/tipAfeIgv/unidad/tipoMoneda/codMotivo, o cuando el usuario pregunte "qué código es X" / "qué significa el código Y" en el contexto de un comprobante SUNAT.
---

# Catálogos SUNAT

Sub-skill de capa "datos": no genera XML ni calcula montos, solo resuelve códigos de catálogo.
Ver [sunat-comprobantes](../sunat-comprobantes/SKILL.md) para el flujo completo que la usa.

## Cómo resolver un código

1. Si el proyecto tiene el paquete `sunat-fe-core` instalado (monorepo `packages/core`), usa
   `buscarCatalogo(consulta)` — programáticamente o vía `sunat-fe catalogo <consulta>` en la
   terminal. Cubre: tipo de documento (01), tipo de documento de identidad (06), moneda (02),
   unidad de medida (03), afectación IGV (07), motivo de nota crédito/débito (09/10), tipo de
   operación (51), leyendas (52).
2. Si no está disponible, consulta [catalogs.md](references/catalogs.md) — cubre el 95% de los
   casos reales.
3. Si el código que necesitas no aparece ahí (un anexo de exportación poco común, una unidad de
   medida rara), **no lo inventes**: dilo explícitamente y remite a la fuente oficial
   (https://cpe.sunat.gob.pe/) antes de asumir un valor.

## Referencia

[catalogs.md](references/catalogs.md) — todos los catálogos con código y nombre.
