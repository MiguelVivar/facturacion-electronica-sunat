# Cálculo de montos (Factura/Boleta — el caso más común)

Este es el cálculo que más se rompe si se hace a mano. Para un item **gravado** (tipAfeIgv=10, IGV 18%):

```
mtoValorUnitario  = precio unitario SIN IGV
mtoValorVenta     = cantidad * mtoValorUnitario          (redondear a 2 decimales)
mtoBaseIgv        = mtoValorVenta                          (a menos que haya descuento por ítem)
igv               = round(mtoBaseIgv * 0.18, 2)
totalImpuestos    = igv                                    (+ isc + otros tributos si aplica)
mtoPrecioUnitario = round(mtoValorUnitario * 1.18, 2)       (precio unitario CON IGV, para mostrar)
```

A nivel de cabecera (Invoice/Note), sumando todos los items:

```
mtoOperGravadas    = Σ mtoValorVenta de items con tipAfeIgv 10-17
mtoOperExoneradas  = Σ mtoValorVenta de items con tipAfeIgv 20-21
mtoOperInafectas   = Σ mtoValorVenta de items con tipAfeIgv 30-37
mtoOperExportacion = Σ mtoValorVenta de items con tipAfeIgv 40
mtoOperGratuitas   = Σ mtoValorVenta de items gratuitos (no suman a valorVenta ni se cobran)
mtoIGV             = Σ igv de todos los items
totalImpuestos     = mtoIGV (+ mtoISC + mtoOtrosTributos si aplica)
valorVenta         = mtoOperGravadas + mtoOperExoneradas + mtoOperInafectas + mtoOperExportacion
subTotal           = valorVenta + totalImpuestos
mtoImpVenta         = subTotal  (ajustado por redondeo/cargos/descuentos globales si los hay; en el caso simple, mtoImpVenta == subTotal)
```

Ejemplo verificado (factura de S/100 + IGV 18% = S/118):
`mtoOperGravadas=100.00, mtoIGV=18.00, totalImpuestos=18.00, valorVenta=100.00, subTotal=118.00, mtoImpVenta=118.00`.

No olvides la leyenda `1000` (monto en letras) — SUNAT la exige en Factura/Boleta. Ver el catálogo 52
en la skill `sunat-catalogos`.

## Implementación ya disponible

Esta fórmula está implementada y probada (`bun test`) en el paquete `sunat-fe-core`
(`packages/core/src/calculo.ts`): `calcularItem(item)` calcula un ítem, `calcularCabecera(items)`
agrupa por balde y devuelve los totales de cabecera. El CLI `sunat-fe calcular <items.json>` expone
esto directamente — no repitas el cálculo a mano si el paquete está disponible en el proyecto.
