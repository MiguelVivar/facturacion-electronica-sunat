---
name: sunat-comprobantes
description: Genera y envía comprobantes electrónicos peruanos (Factura, Boleta de Venta, Nota de Crédito/Débito, Guía de Remisión, Resumen Diario, Comunicación de Baja/Reversión, Retención, Percepción) usando Greenter (PHP), la API REST de Lycet, o el paquete nativo sunat-fe-xml. Úsala siempre que el usuario pida "generar una factura", "emitir una boleta", "facturación electrónica SUNAT", "comprobante electrónico Perú", "enviar a SUNAT", "UBL 2.1", "CDR", "clave SOL", "nota de crédito/débito", "guía de remisión electrónica", o mencione RUC/IGV/SUNAT en el contexto de emitir un documento de venta.
---

# Facturación Electrónica SUNAT (Perú) — flujo completo

Esta es la skill "orquestadora": decide qué tipo de comprobante generar y con qué motor, apoyándose
en las sub-skills de capa — [sunat-catalogos](../sunat-catalogos/SKILL.md) para códigos,
[sunat-calculo](../sunat-calculo/SKILL.md) para montos/IGV, y [sunat-cli](../sunat-cli/SKILL.md)
para el CLI/paquete npm nativo.

## Por qué esto no es "solo generar un XML"

Un comprobante electrónico SUNAT tiene tres partes que deben cuadrar entre sí: (1) los catálogos correctos (tipo de documento, tipo de afectación IGV, unidad de medida...), (2) los montos calculados exactamente como SUNAT espera, y (3) el envío + lectura del CDR para saber si SUNAT realmente lo aceptó. Fallar en cualquiera de los tres produce un rechazo, y a diferencia de un bug de software, un comprobante mal emitido puede tener consecuencias tributarias reales.

## Flujo de trabajo

### 1. Identifica el tipo de comprobante

Traduce lo que pide el usuario al catálogo SUNAT correspondiente (usa
[sunat-catalogos](../sunat-catalogos/SKILL.md)). La tabla completa de mapeo (tipoDoc, clase PHP,
endpoint REST) está en [references/document-types.md](references/document-types.md).

- **Factura** (cliente con RUC, tipoDoc 01) vs **Boleta de Venta** (cliente final, tipoDoc 03).
- Si piden corregir/anular un comprobante ya emitido → **Nota de Crédito/Débito**, no una factura nueva.
- Guía de remisión, resumen diario, retención, percepción, comunicación de baja/reversión: mismo
  flujo, revisa la fila correspondiente en `document-types.md` (varios son **asíncronos**).

### 2. Determina el motor de generación/envío

Tres modos posibles — no asumas uno, detecta o pregunta:

1. **Paquete nativo (`sunat-fe-xml` / CLI `sunat-fe`)**: si el proyecto es Node/TS y quiere generar
   el XML UBL 2.1 sin depender de PHP. Ver [sunat-cli](../sunat-cli/SKILL.md). **Genera el XML pero
   aún no lo firma ni lo envía a SUNAT** — eso son fases posteriores del proyecto (ver PRODUCT.md).
2. **PHP directo (Greenter)**: ¿hay `composer.json` con `greenter/lite`/`greenter/greenter`? →
   ver [greenter-php.md](references/greenter-php.md). Cubre firma + envío + CDR reales.
3. **API REST (Lycet)**: ¿hay `LYCET_API_URL`/token configurado? → ver [lycet-api.md](references/lycet-api.md). Cubre firma + envío + CDR reales.

Si ninguno existe, pregúntale al usuario qué prefiere antes de instalar/levantar nada.

### 3. Reúne los datos y calcula los montos

Usa [sunat-calculo](../sunat-calculo/SKILL.md) para los montos — no los calcules a mano. Si falta
un dato obligatorio (dirección del emisor, motivo de una nota), pregúntalo: SUNAT rechaza el
comprobante si falta, así que es más rápido preguntar antes que generar algo que sabes que fallará.

### 4. Genera y envía

- **Nativo**: `sunat-fe generar-xml <datos.json>` (o la función `generarXmlFacturaBoleta`
  programáticamente). Recuerda: XML sin firmar, sin envío real todavía.
- **PHP**: sigue `greenter-php.md`. Usa `FE_BETA` salvo que el usuario confirme producción.
- **Lycet**: arma el JSON según `lycet-api.md` y pégale al endpoint `/send` correspondiente.
- Guarda el XML firmado y, si el envío tuvo éxito, el CDR.

### 5. Lee la respuesta y repórtale al usuario el estado real

No te quedes en "no hubo error de conexión" — lee el código del CDR: `0` = ACEPTADA, `2000-3999` =
RECHAZADA (con motivo), cualquier otro rango = excepción/error de formato. Para
Resumen/Baja/Reversión/Guía, `send()` solo da un ticket — hay que sondear el estado por separado.

## Regla de seguridad: BETA vs PRODUCCIÓN

Enviar a los endpoints de producción de SUNAT crea un comprobante con validez legal y consume la
numeración correlativa real del contribuyente — no es reversible con un "deshacer", solo con una
Nota de Crédito o Comunicación de Baja formal. Si detectas que la configuración apunta a producción
(o el usuario no ha sido explícito sobre BETA vs producción), confírmalo antes de enviar. Trabajar
contra BETA/el entorno de pruebas no necesita esta confirmación.

## Referencias

| Archivo | Cuándo leerlo |
|---|---|
| [references/document-types.md](references/document-types.md) | Siempre — mapeo de comprobante→clase/endpoint |
| [references/greenter-php.md](references/greenter-php.md) | Modo PHP directo |
| [references/lycet-api.md](references/lycet-api.md) | Modo API REST |
| [sunat-catalogos](../sunat-catalogos/SKILL.md) | Códigos de catálogo |
| [sunat-calculo](../sunat-calculo/SKILL.md) | Montos/IGV |
| [sunat-cli](../sunat-cli/SKILL.md) | Paquete npm / CLI nativo |
