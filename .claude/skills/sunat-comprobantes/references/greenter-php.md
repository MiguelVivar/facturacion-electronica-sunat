\# Modo PHP directo (Greenter)

Usa este modo cuando el proyecto ya tiene (o puede tener) PHP + Composer disponible localmente. Es el camino "oficial": genera el XML UBL 2.1, lo firma con el certificado digital, lo envía a SUNAT y procesa el CDR, todo en un solo paso.

## Instalación y requisitos

```bash
composer require greenter/lite
```

- PHP 7.4+
- Extensiones: `soap`, `openssl`, `zlib`, `curl`
- Certificado en formato PEM (si el cliente solo tiene `.pfx`/`.p12`, conviértelo — ver abajo)
- Credenciales Clave SOL (RUC + usuario + contraseña SOL)

## Configuración (`config.php`)

```php
<?php
use Greenter\Ws\Services\SunatEndpoints;
use Greenter\See;

$see = new See();
$see->setCertificate(file_get_contents(__DIR__.'/certificate.pem'));
$see->setService(SunatEndpoints::FE_BETA); // o FE_PRODUCCION
$see->setClaveSOL('20000000001', 'MODDATOS', 'moddatos');

return $see;
```

Credenciales BETA (entorno de pruebas público de SUNAT, no son un secreto): RUC `20000000001`, usuario `MODDATOS`, password `moddatos`, certificado de prueba en https://raw.githubusercontent.com/thegreenter/xmldsig/master/tests/certificate.pem.

Endpoints reales (clase `Greenter\Ws\Services\SunatEndpoints`):

| Constante | Uso |
|---|---|
| `FE_BETA` / `FE_PRODUCCION` | Factura, Boleta, Nota Crédito/Débito, Resumen, Baja |
| `RETENCION_BETA` / `RETENCION_PRODUCCION` | Retención, Percepción, Reversión |
| `GUIA_BETA` / `GUIA_PRODUCCION` | **Deprecados** — la Guía de Remisión ahora va por la SEE-API (OAuth2 + REST), no por SOAP. No los uses para guías nuevas. |

Certificado `.pfx`/`.p12` en vez de `.pem`:

```php
use Greenter\XMLSecLibs\Certificate\X509Certificate;
use Greenter\XMLSecLibs\Certificate\X509ContentType;

$certificate = new X509Certificate(file_get_contents('mycert.pfx'), 'contraseña-del-pfx');
$see->setCertificate($certificate->export(X509ContentType::PEM));
```

## API de la clase `See` (todos los métodos públicos relevantes)

```php
$see->setCertificate(string $pem);
$see->setClaveSOL(string $ruc, string $user, string $password);
$see->setService(?string $endpoint);
$see->getXmlSigned(DocumentInterface $doc): ?string;      // solo genera+firma, no envía
$see->send(DocumentInterface $doc): ?BaseResult;           // genera, firma, envía, procesa CDR
$see->getStatus(?string $ticket): StatusResult;            // para Resumen/Baja/Reversión (async)
$see->getFactory(): FeFactory;                              // ->getLastXml() da el XML crudo generado
```

## Factura Electrónica — ejemplo completo y verificado

```php
<?php

use Greenter\Model\Client\Client;
use Greenter\Model\Company\Company;
use Greenter\Model\Company\Address;
use Greenter\Model\Sale\FormaPagos\FormaPagoContado;
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Sale\SaleDetail;
use Greenter\Model\Sale\Legend;

require __DIR__.'/vendor/autoload.php';
$see = require __DIR__.'/config.php';

$client = (new Client())
    ->setTipoDoc('6')              // Catalogo 06: 6=RUC
    ->setNumDoc('20000000001')
    ->setRznSocial('EMPRESA X');

$address = (new Address())
    ->setUbigueo('150101')
    ->setDepartamento('LIMA')->setProvincia('LIMA')->setDistrito('LIMA')
    ->setUrbanizacion('-')
    ->setDireccion('Av. Villa Nueva 221')
    ->setCodLocal('0000');

$company = (new Company())
    ->setRuc('20123456789')
    ->setRazonSocial('GREEN SAC')
    ->setNombreComercial('GREEN')
    ->setAddress($address);

$invoice = (new Invoice())
    ->setUblVersion('2.1')
    ->setTipoOperacion('0101')     // Catalogo 51
    ->setTipoDoc('01')             // 01=Factura, 03=Boleta (mismo modelo)
    ->setSerie('F001')
    ->setCorrelativo('1')
    ->setFechaEmision(new DateTime('2020-08-24 13:05:00-05:00')) // zona horaria Lima
    ->setFormaPago(new FormaPagoContado())
    ->setTipoMoneda('PEN')
    ->setCompany($company)
    ->setClient($client)
    ->setMtoOperGravadas(100.00)
    ->setMtoIGV(18.00)
    ->setTotalImpuestos(18.00)
    ->setValorVenta(100.00)
    ->setSubTotal(118.00)
    ->setMtoImpVenta(118.00);

$item = (new SaleDetail())
    ->setCodProducto('P001')
    ->setUnidad('NIU')             // Catalogo 03
    ->setCantidad(2)
    ->setMtoValorUnitario(50.00)
    ->setDescripcion('PRODUCTO 1')
    ->setMtoBaseIgv(100)
    ->setPorcentajeIgv(18.00)
    ->setIgv(18.00)
    ->setTipAfeIgv('10')           // Catalogo 07
    ->setTotalImpuestos(18.00)
    ->setMtoValorVenta(100.00)
    ->setMtoPrecioUnitario(59.00);

$legend = (new Legend())
    ->setCode('1000')
    ->setValue('SON CIENTO DIECIOCHO CON 00/100 SOLES');

$invoice->setDetails([$item])->setLegends([$legend]);

$result = $see->send($invoice);

file_put_contents($invoice->getName().'.xml', $see->getFactory()->getLastXml());

if (!$result->isSuccess()) {
    echo 'Error SUNAT '.$result->getError()->getCode().': '.$result->getError()->getMessage();
    exit(1);
}

file_put_contents('R-'.$invoice->getName().'.zip', $result->getCdrZip());

$cdr = $result->getCdrResponse();
$code = (int)$cdr->getCode();
if ($code === 0) {
    echo "ACEPTADA".PHP_EOL;
} elseif ($code >= 2000 && $code <= 3999) {
    echo "RECHAZADA: ".$cdr->getDescription().PHP_EOL;
} else {
    echo "EXCEPCION (código {$code}): ".$cdr->getDescription().PHP_EOL;
}
```

**Boleta**: idéntico, solo cambia `setTipoDoc('03')`, la serie usa prefijo `B` (ej. `B001`), y normalmente el cliente es persona natural (`setTipoDoc('1')` DNI en vez de `6` RUC). No es obligatorio `setTipoOperacion`/`setFormaPago` en el ejemplo mínimo de boleta, pero inclúyelos si el negocio los usa.

## Otros comprobantes — namespaces verificados

Todos viven bajo `Greenter\Model\`. Estas clases existen en el paquete `greenter/core` (verificado en el código fuente), pero a diferencia de Factura/Boleta **no hay ejemplo end-to-end oficial en español para cada una** — antes de escribir el código, revisa `reference.greenter.dev` o el propio código instalado en `vendor/greenter/core/src/Core/Model/<Carpeta>/` para confirmar los setters exactos de cada clase (los nombres de campo son los mismos que ves en [document-types.md](document-types.md) y en el esquema JSON de Lycet, que sí está verificado campo por campo).

| Carpeta | Clases |
|---|---|
| `Sale/` | `Invoice`, `Note`, `SaleDetail`, `Legend`, `Charge`, `Document`, `Cuota`, `PaymentTerms`, `Prepayment`, `Detraction`, `SalePerception`, `EmbededDespatch`, `FormaPagos\FormaPagoContado`, `FormaPagos\FormaPagoCredito` |
| `Despatch/` | `Despatch`, `DespatchDetail`, `Shipment`, `Driver`, `Vehicle`, `Transportist`, `Puerto`, `AdditionalDoc`, `Direction` |
| `Perception/` | `Perception`, `PerceptionDetail` |
| `Retention/` | `Retention`, `RetentionDetail`, `Payment`, `Exchange` |
| `Summary/` | `Summary`, `SummaryDetail`, `SummaryPerception` |
| `Voided/` | `Voided`, `VoidedDetail`, `Reversion` |

Patrón general para Resumen/Baja/Reversión (async): construyes el objeto, `$result = $see->send($doc)`, guardas `$result->getTicket()` y luego sondeas con `$see->getStatus($ticket)` hasta que `getStatus()` devuelva el CDR — no reportes éxito antes de eso (ver [document-types.md](document-types.md)).

## Paso a producción — ADVERTENCIA

Cambiar `FE_BETA`→`FE_PRODUCCION` (o el equivalente en Lycet) hace que el envío sea **real**: genera un comprobante con validez legal ante SUNAT, consume la numeración correlativa del contribuyente, y no se puede simplemente "borrar" — solo anular vía Nota de Crédito o Comunicación de Baja, con sus propias reglas y plazos. **Antes de enviar a producción, confirma explícitamente con el usuario** (RUC correcto, serie/correlativo correcto, montos correctos) — es una acción de alto impacto y difícil de revertir, igual que un `git push --force` a producción.
