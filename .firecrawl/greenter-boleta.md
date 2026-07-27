[Saltar a contenido](https://greenter.dev/examples/boleta/#boleta-de-venta)

[![logo](https://greenter.dev/img/logo.svg)](https://greenter.dev/ "Greenter - Facturación Electrónica en Perú")

Greenter - Facturación Electrónica en Perú

Boleta de Venta

Teclee para comenzar búsqueda

[greenter/greenter \\
\\
- v5.3.0\\
- 353\\
- 162](https://github.com/thegreenter/greenter "source.link.title")

- [Inicio](https://greenter.dev/)
- [Empezar](https://greenter.dev/starter/)
- [Ejemplos](https://greenter.dev/examples/exonerada/)
- [Referencia](https://greenter.dev/packages/xml/)

[![logo](https://greenter.dev/img/logo.svg)](https://greenter.dev/ "Greenter - Facturación Electrónica en Perú") Greenter - Facturación Electrónica en Perú

[greenter/greenter \\
\\
- v5.3.0\\
- 353\\
- 162](https://github.com/thegreenter/greenter "source.link.title")

- [ ]  Inicio  Inicio

  - [Inicio](https://greenter.dev/)

- [ ]  Empezar  Empezar

  - [Guia de Inicio](https://greenter.dev/starter/)
  - [Detalles de uso](https://greenter.dev/usage/)
  - [Paso a Producción](https://greenter.dev/production/)
  - [Preguntas Frecuentes](https://greenter.dev/faq/)

- [x]  Ejemplos  Ejemplos

  - [F. Exonerada](https://greenter.dev/examples/exonerada/)
  - [F. Gratuita](https://greenter.dev/examples/gratuita/)
  - [F. Descuentos](https://greenter.dev/examples/descuento-linea/)
  - [F. Percepción](https://greenter.dev/examples/percepcion/)
  - [F. Anticipos](https://greenter.dev/examples/anticipo/)
  - [F. Detracción](https://greenter.dev/examples/detraccion/)
  - [F. Exportación](https://greenter.dev/examples/exportacion/)
  - [F. ICBPER](https://greenter.dev/examples/icbper/)
  - [ ]  Boleta de Venta [Boleta de Venta](https://greenter.dev/examples/boleta/) Tabla de contenidos

    - [Ejemplo](https://greenter.dev/examples/boleta/#ejemplo)

  - [Contingencia](https://greenter.dev/examples/contingencia/)
  - [Forma de Pago](https://greenter.dev/examples/forma-pago/)
  - [Otros](https://greenter.dev/examples/mas/)

- [ ]  Referencia  Referencia

  - [greenter/xml](https://greenter.dev/packages/xml/)
  - [greenter/xmldsig](https://greenter.dev/packages/sign/)
  - [greenter/ws](https://greenter.dev/packages/ws/)
  - [greenter/report](https://greenter.dev/packages/report/)
  - [greenter/xml-parser](https://greenter.dev/packages/xml-parser/)
  - [API Referencia](https://reference.greenter.dev/)

Tabla de contenidos

- [Ejemplo](https://greenter.dev/examples/boleta/#ejemplo)

# Boleta de Venta [¶](https://greenter.dev/examples/boleta/\#boleta-de-venta "Permanent link")

Este ejemplo muestra la creación del XML para una boleta de venta electrónica, empleando el estándar UBL 2.1

## Ejemplo [¶](https://greenter.dev/examples/boleta/\#ejemplo "Permanent link")

```
<?php

use Greenter\Model\Client\Client;
use Greenter\Model\Company\Company;
use Greenter\Model\Company\Address;
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Sale\SaleDetail;
use Greenter\Model\Sale\Legend;

require __DIR__.'/vendor/autoload.php';

$see = require __DIR__.'/config.php';

// Cliente
$client = new Client();
$client->setTipoDoc('1')
    ->setNumDoc('46712369')
    ->setRznSocial('MARIA RAMOS ARTEAGA');

// Emisor
$address = new Address();
$address->setUbigueo('150101')
    ->setDepartamento('LIMA')
    ->setProvincia('LIMA')
    ->setDistrito('LIMA')
    ->setUrbanizacion('-')
    ->setDireccion('AV LOS GERUNDIOS');

$company = new Company();
$company->setRuc('20000000001')
    ->setRazonSocial('EMPRESA SAC')
    ->setNombreComercial('EMPRESA')
    ->setAddress($address);

// Venta
$invoice = (new Invoice())
    ->setUblVersion('2.1')
    ->setTipoOperacion('0101') // Catalog. 51
    ->setTipoDoc('03')
    ->setSerie('B001')
    ->setCorrelativo('1')
    ->setFechaEmision(new DateTime())
    ->setTipoMoneda('PEN')
    ->setClient($client)
    ->setMtoOperGravadas(100.00)
    ->setMtoIGV(18.00)
    ->setTotalImpuestos(18.00)
    ->setValorVenta(100.00)
    ->setSubTotal(118.00)
    ->setMtoImpVenta(118.00)
    ->setCompany($company);

$item = (new SaleDetail())
    ->setCodProducto('P001')
    ->setUnidad('NIU')
    ->setCantidad(2)
    ->setDescripcion('PRODUCTO 1')
    ->setMtoBaseIgv(100)
    ->setPorcentajeIgv(18.00) // 18%
    ->setIgv(18.00)
    ->setTipAfeIgv('10')
    ->setTotalImpuestos(18.00)
    ->setMtoValorVenta(100.00)
    ->setMtoValorUnitario(50.00)
    ->setMtoPrecioUnitario(59.00);

$legend = (new Legend())
    ->setCode('1000')
    ->setValue('SON CIENTO DIECIOCHO CON 00/100 SOLES');

$invoice->setDetails([$item])
        ->setLegends([$legend]);

$xml = $see->getXmlSigned($invoice);

// Guardar XML
file_put_contents($invoice->getName().'.xml', $xml);
```

Copyright © 2020 Greenter

Made with [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

[github.com](https://github.com/thegreenter "github.com")[fb.me](https://fb.me/thegreenter "fb.me")[community.greenter.dev](https://community.greenter.dev/ "community.greenter.dev")[yape.greenter.dev](https://yape.greenter.dev/ "yape.greenter.dev")