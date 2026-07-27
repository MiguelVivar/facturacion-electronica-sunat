# Certificado de prueba — SOLO para BETA/tests

`clave-privada-prueba.pem` y `certificado-prueba.pem` son el certificado de pruebas **público**
que Greenter publica para su propio entorno FE_BETA de SUNAT (fuente:
https://raw.githubusercontent.com/thegreenter/xmldsig/master/tests/certificate.pem, referenciado
también en `references/greenter-php.md` de la skill `sunat-comprobantes`).

- No es secreto: cualquiera que use Greenter/Lycet en modo BETA usa este mismo certificado.
- **Nunca lo uses contra FE_PRODUCCION** — no tiene validez legal y SUNAT lo rechazaría de todas formas.
- Sirve únicamente para probar mecánicamente que la firma XML-DSig y el envío SOAP funcionan.
- **Expiró en 2018-07-05** (verificado con `openssl x509 -noout -dates`) — sigue sirviendo para
  probar la mecánica de firma/verificación local, pero no es lo que usan los tests que hablan con
  SUNAT de verdad.

## `clave-privada-prueba-2026.pem` / `certificado-prueba-2026.pem`

Certificado autofirmado generado localmente (`openssl req -x509 -newkey rsa:2048 ...`, válido
2026-07-27 a 2036-07-24) porque el certificado público de Greenter ya estaba expirado. Cambiar de
uno a otro **no cambió el resultado** contra SUNAT BETA (mismo error, ver `firmar.ts` y
PRODUCT.md) — o sea, la fecha del certificado no era la causa del rechazo real, pero vale la pena
tener un certificado no expirado para no confundir esa variable con el problema real, aún sin
resolver.
