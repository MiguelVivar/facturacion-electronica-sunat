---
name: sunat-facturacion-electronica
description: Punto de entrada para todo lo relacionado a facturación electrónica SUNAT (Perú) — enruta a la sub-skill correcta. Úsala cuando el usuario mencione RUC/IGV/SUNAT/UBL/CDR/comprobante electrónico y no sea obvio cuál sub-skill aplica todavía.
---

# Facturación Electrónica SUNAT (Perú) — índice

Este proyecto se dividió en sub-skills por capa de responsabilidad. Esta skill es solo el índice:
lee la intención del usuario y dirige a la sub-skill correcta en vez de repetir su contenido aquí.

| Sub-skill | Cuándo usarla |
|---|---|
| [sunat-comprobantes](../sunat-comprobantes/SKILL.md) | Generar/enviar un comprobante completo (Factura, Boleta, Nota, Guía, Resumen, Retención, Percepción). Este es el punto de partida normal. |
| [sunat-catalogos](../sunat-catalogos/SKILL.md) | Solo necesitas un código de catálogo (tipoDoc, tipAfeIgv, unidad, moneda, motivo de nota...). |
| [sunat-calculo](../sunat-calculo/SKILL.md) | Solo necesitas calcular montos/IGV a partir de ítems. |
| [sunat-cli](../sunat-cli/SKILL.md) | Usar el paquete npm/CLI nativo (`sunat-fe`) en vez de PHP/Greenter o Lycet. |

## Regla de enrutamiento

- Pedido de "generar/emitir/enviar un comprobante" → `sunat-comprobantes` (que a su vez usa
  `sunat-catalogos` y `sunat-calculo` como sub-pasos, y `sunat-cli` si el motor elegido es el
  paquete nativo).
- Pregunta aislada de "qué código es X" → `sunat-catalogos` directamente.
- Pregunta aislada de "cuánto es el IGV de esto" → `sunat-calculo` directamente.
- Pregunta sobre instalar/usar el CLI o el paquete npm → `sunat-cli` directamente.

No dupliques contenido de las sub-skills en este archivo — si algo cambia, cambia en un solo lugar.
