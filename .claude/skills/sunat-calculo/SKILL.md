---
name: sunat-calculo
description: Calcula montos e IGV de un comprobante SUNAT a partir de sus ítems (mtoValorVenta, igv, mtoOperGravadas/Exoneradas/Inafectas/Exportacion, subTotal). Úsala cuando el usuario pida "calcular el IGV", "cuánto es el total con impuestos", o cuando sunat-comprobantes necesite los totales de cabecera antes de generar un XML.
---

# Cálculo de montos e IGV

Sub-skill de capa "lógica pura": sin I/O, sin red, 100% determinista y probada con tests.
Ver [sunat-comprobantes](../sunat-comprobantes/SKILL.md) para dónde encaja esto en el flujo completo.

## Cómo calcular

1. Si el proyecto tiene `sunat-fe-core` (monorepo `packages/core`), usa `calcularCabecera(items)`
   — programáticamente o vía `sunat-fe calcular <items.json>` en la terminal. Ya está implementado
   y probado (`bun test`); no repitas la fórmula a mano si el paquete está disponible.
2. Si no está disponible, sigue la fórmula documentada en
   [formula-montos.md](references/formula-montos.md) exactamente — es la parte donde más se
   equivocan los intentos manuales (agrupar mal por "balde" de tipAfeIgv, o redondear en el
   momento equivocado).
3. Cada ítem cae en un balde según su `tipAfeIgv` (catálogo 07, ver
   [sunat-catalogos](../sunat-catalogos/SKILL.md)): 10-17 gravada, 20-21 exonerada, 30-37 inafecta,
   40 exportación. Un código fuera de esos rangos es un error de datos, no un caso a adivinar.

## Referencia

[formula-montos.md](references/formula-montos.md) — fórmula completa por ítem y de cabecera, con
el ejemplo verificado (S/100 + IGV 18% = S/118).
