[Saltar a contenido](https://greenter.dev/starter/#empezando-con-greenter)

[![logo](https://greenter.dev/img/logo.svg)](https://greenter.dev/ "Greenter - Facturación Electrónica en Perú")

Greenter - Facturación Electrónica en Perú

Guia de Inicio

Inicializando búsqueda

[greenter/greenter](https://github.com/thegreenter/greenter "source.link.title")

- [Inicio](https://greenter.dev/)
- [Empezar](https://greenter.dev/starter/)
- [Ejemplos](https://greenter.dev/examples/exonerada/)
- [Referencia](https://greenter.dev/packages/xml/)

[![logo](https://greenter.dev/img/logo.svg)](https://greenter.dev/ "Greenter - Facturación Electrónica en Perú") Greenter - Facturación Electrónica en Perú

[greenter/greenter](https://github.com/thegreenter/greenter "source.link.title")

- [ ]  Inicio  Inicio

  - [Inicio](https://greenter.dev/)

- [x]  Empezar  Empezar

  - [ ]  Guia de Inicio [Guia de Inicio](https://greenter.dev/starter/) Tabla de contenidos

    - [Instalación](https://greenter.dev/starter/#instalacion)
    - [Requerimientos](https://greenter.dev/starter/#requerimientos)
    - [Configuración](https://greenter.dev/starter/#configuracion)
    - [Definición del comprobante](https://greenter.dev/starter/#definicion-del-comprobante)
    - [Factura Electrónica](https://greenter.dev/starter/#factura-electronica)
    - [Envío a SUNAT](https://greenter.dev/starter/#envio-a-sunat)
    - [Lectura del CDR](https://greenter.dev/starter/#lectura-del-cdr)
    - [Ejecutar](https://greenter.dev/starter/#ejecutar)
    - [¿Que sigue?](https://greenter.dev/starter/#que-sigue)
    - [Comentarios](https://greenter.dev/starter/#comentarios)

  - [Detalles de uso](https://greenter.dev/usage/)
  - [Paso a Producción](https://greenter.dev/production/)
  - [Preguntas Frecuentes](https://greenter.dev/faq/)

- [ ]  Ejemplos  Ejemplos

  - [F. Exonerada](https://greenter.dev/examples/exonerada/)
  - [F. Gratuita](https://greenter.dev/examples/gratuita/)
  - [F. Descuentos](https://greenter.dev/examples/descuento-linea/)
  - [F. Percepción](https://greenter.dev/examples/percepcion/)
  - [F. Anticipos](https://greenter.dev/examples/anticipo/)
  - [F. Detracción](https://greenter.dev/examples/detraccion/)
  - [F. Exportación](https://greenter.dev/examples/exportacion/)
  - [F. ICBPER](https://greenter.dev/examples/icbper/)
  - [Boleta de Venta](https://greenter.dev/examples/boleta/)
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

- [Instalación](https://greenter.dev/starter/#instalacion)
- [Requerimientos](https://greenter.dev/starter/#requerimientos)
- [Configuración](https://greenter.dev/starter/#configuracion)
- [Definición del comprobante](https://greenter.dev/starter/#definicion-del-comprobante)
- [Factura Electrónica](https://greenter.dev/starter/#factura-electronica)
- [Envío a SUNAT](https://greenter.dev/starter/#envio-a-sunat)
- [Lectura del CDR](https://greenter.dev/starter/#lectura-del-cdr)
- [Ejecutar](https://greenter.dev/starter/#ejecutar)
- [¿Que sigue?](https://greenter.dev/starter/#que-sigue)
- [Comentarios](https://greenter.dev/starter/#comentarios)

# Empezando con Greenter [¶](https://greenter.dev/starter/\#empezando-con-greenter "Permanent link")

En este primero ejemplo, veremos el flujo básico del proceso de facturación electrónica, desde la elaboración del comprobante electrónico (archivo XML), la inclusión de la firma digital, y posterior envió a SUNAT, además de la lectura del CDR[1](https://greenter.dev/starter/#fn:1).

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/thegreenter/firststeps)

## Instalación [¶](https://greenter.dev/starter/\#instalacion "Permanent link")

La forma mas fácil de instalar grenter es utilizando [composer](https://getcomposer.org/).

```
composer require greenter/lite
```

## Requerimientos [¶](https://greenter.dev/starter/\#requerimientos "Permanent link")

Técnico

- PHP `7.4` o superior
- Certificado en formato PEM
- Credenciales Clave SOL

Se necesita tener las siguientes extensiones habilitadas en `php.ini`.

```
extension=soap
extension=openssl
```

Bases

Para conocer más detalles sobre el proceso de Facturación Electrónica, puede consultar.

- [FE Primer](https://cpe.sunat.gob.pe/) \- Guía de inicio hecho por Greenter
- [cpe.sunat.gob.pe](https://cpe.sunat.gob.pe/) \- Página oficial de SUNAT

## Configuración [¶](https://greenter.dev/starter/\#configuracion "Permanent link")

Para firmar nuestro comprobante electrónico utilizaremos este [certificado de prueba](https://raw.githubusercontent.com/thegreenter/xmldsig/master/tests/certificate.pem), y para conectarnos a los servicios `BETA` de SUNAT, usaremos las credenciales **Clave SOL** por defecto.

- RUC: `20000000001`
- Usuario: `MODDATOS`
- Contraseña: `moddatos`

Crearemos el archivo `config.php` donde configuraremos el certificado digital, la ruta del servicio y las credenciales (Clave SOL) a utilizar:

config.php

```
<?php
use Greenter\Ws\Services\SunatEndpoints;
use Greenter\See;

$see = new See();
$see->setCertificate(file_get_contents(__DIR__.'/certificate.pem'));
$see->setService(SunatEndpoints::FE_BETA);
$see->setClaveSOL('20000000001', 'MODDATOS', 'moddatos');

return $see;
```

Certificado .PFX - PKCS#12

Si cuentas con un certificado `.p12` ó `.pfx`, puedes configurar el certificado con el siguiente código:

```
<?php
use Greenter\XMLSecLibs\Certificate\X509Certificate;
use Greenter\XMLSecLibs\Certificate\X509ContentType;

// ...

$pfx = file_get_contents('mycert.pfx');
$password = 'YOUR-PASSWORD';

$certificate = new X509Certificate($pfx, $password);

$see->setCertificate($certificate->export(X509ContentType::PEM));

// ...
```

## Definición del comprobante [¶](https://greenter.dev/starter/\#definicion-del-comprobante "Permanent link")

Para el ejemplo, el comprobante a utilizar será una factura gravada, con la siguiente definición.

```
La empresa GREEN SAC, identificada con RUC 20123456789; desea emitir
su primera factura electrónica N° F001-1 con la siguiente información:
```

| Global |  |
| --- | --- |
| Numero | F001-1 |
| Fecha de Emisión | 21/07/2020 |
| Hora de Emisión | 13:05 |
| Forma de Pago | Contado |
| Moneda | Sol (PEN) |
| RUC de Emisor | 20123456789 |
| RUC de Receptor | 20000000001 |
| Operaciones Gravadas | S/ 100.00 |
| Valor Venta | S/ 100.00 |
| IGV | S/ 18.00 |
| Total Impuestos | S/ 18.00 |
| Importe Total | S/ 118.00 |

| Detalle |  |
| --- | --- |
| Codigo | P001 |
| Descripcíon | Tijeras |
| Unidad de Medida | Unidad (NIU) |
| Cantidad | 2 |
| Valor unitario | S/ 50.00 |
| Valor venta | S/ 100.00 |
| Tipo de afectación IGV | Gravado (10) |
| IGV | S/ 18.00 |
| Total Impuestos | S/ 18.00 |
| Precio unitario | S/ 59.00 |

## Factura Electrónica [¶](https://greenter.dev/starter/\#factura-electronica "Permanent link")

Crearemos nuestra primera factura electrónica siguiendo el estándar [UBL 2.1](https://github.com/thegreenter/ubl-validator/blob/0962ca6a30de609851d83965b8401a7983bc56b7/src/xsd/2.1/maindoc/UBL-Invoice-2.1.xsd), en nuevo archivo `factura.php` agregaremos el siguiente código:

factura.php

```
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

// Cliente
$client = (new Client())
    ->setTipoDoc('6')
    ->setNumDoc('20000000001')
    ->setRznSocial('EMPRESA X');

// Emisor
$address = (new Address())
    ->setUbigueo('150101')
    ->setDepartamento('LIMA')
    ->setProvincia('LIMA')
    ->setDistrito('LIMA')
    ->setUrbanizacion('-')
    ->setDireccion('Av. Villa Nueva 221')
    ->setCodLocal('0000'); // Codigo de establecimiento asignado por SUNAT, 0000 por defecto.

$company = (new Company())
    ->setRuc('20123456789')
    ->setRazonSocial('GREEN SAC')
    ->setNombreComercial('GREEN')
    ->setAddress($address);

// Venta
$invoice = (new Invoice())
    ->setUblVersion('2.1')
    ->setTipoOperacion('0101') // Venta - Catalog. 51
    ->setTipoDoc('01') // Factura - Catalog. 01
    ->setSerie('F001')
    ->setCorrelativo('1')
    ->setFechaEmision(new DateTime('2020-08-24 13:05:00-05:00')) // Zona horaria: Lima
    ->setFormaPago(new FormaPagoContado()) // FormaPago: Contado
    ->setTipoMoneda('PEN') // Sol - Catalog. 02
    ->setCompany($company)
    ->setClient($client)
    ->setMtoOperGravadas(100.00)
    ->setMtoIGV(18.00)
    ->setTotalImpuestos(18.00)
    ->setValorVenta(100.00)
    ->setSubTotal(118.00)
    ->setMtoImpVenta(118.00)
    ;

$item = (new SaleDetail())
    ->setCodProducto('P001')
    ->setUnidad('NIU') // Unidad - Catalog. 03
    ->setCantidad(2)
    ->setMtoValorUnitario(50.00)
    ->setDescripcion('PRODUCTO 1')
    ->setMtoBaseIgv(100)
    ->setPorcentajeIgv(18.00) // 18%
    ->setIgv(18.00)
    ->setTipAfeIgv('10') // Gravado Op. Onerosa - Catalog. 07
    ->setTotalImpuestos(18.00) // Suma de impuestos en el detalle
    ->setMtoValorVenta(100.00)
    ->setMtoPrecioUnitario(59.00)
    ;

$legend = (new Legend())
    ->setCode('1000') // Monto en letras - Catalog. 52
    ->setValue('SON DOSCIENTOS TREINTA Y SEIS CON 00/100 SOLES');

$invoice->setDetails([$item])
        ->setLegends([$legend]);
```

Los catálogos que se mencionan en los comentarios del código se encuentran en la _Reglas de Validaciones de SUNAT_, puedes obtener la última versión en la [página oficial de SUNAT](https://cpe.sunat.gob.pe/node/88#item-1).

## Envío a SUNAT [¶](https://greenter.dev/starter/\#envio-a-sunat "Permanent link")

En el mismo archivo `factura.php` agregaremos el código de abajo, el método `send` envuelve varios procesos en si, primero genera el XML, lo firma digitalmente, lo envía al servició de SUNAT y procesa la respuesta (CDR).

```
<?php

$result = $see->send($invoice);

// Guardar XML firmado digitalmente.
file_put_contents($invoice->getName().'.xml',
                  $see->getFactory()->getLastXml());

// Verificamos que la conexión con SUNAT fue exitosa.
if (!$result->isSuccess()) {
    // Mostrar error al conectarse a SUNAT.
    echo 'Codigo Error: '.$result->getError()->getCode();
    echo 'Mensaje Error: '.$result->getError()->getMessage();
    exit();
}

// Guardamos el CDR
file_put_contents('R-'.$invoice->getName().'.zip', $result->getCdrZip());
```

Para saber como actuar según el código de error que SUNAT devuelve, es muy importante revisar las [Reglas de Validación](https://cpe.sunat.gob.pe/node/88#item-1), allí encontraremos todas las validaciones que SUNAT aplica a los diferentes comprobantes electrónicos disponibles, además de lista de catálogos y la lista completa de codigos de error.

## Lectura del CDR [¶](https://greenter.dev/starter/\#lectura-del-cdr "Permanent link")

Finalmente para saber si nuestro comprobante fue procesado correctamente y ha sido aceptado por SUNAT, necesitamos leer la informacíon contenida en el CDR[1](https://greenter.dev/starter/#fn:1).

```
<?php
/*
* file: factura.php
*/

$cdr = $result->getCdrResponse();

$code = (int)$cdr->getCode();

if ($code === 0) {
    echo 'ESTADO: ACEPTADA'.PHP_EOL;
    if (count($cdr->getNotes()) > 0) {
        echo 'OBSERVACIONES:'.PHP_EOL;
        // Corregir estas observaciones en siguientes emisiones.
        var_dump($cdr->getNotes());
    }
} else if ($code >= 2000 && $code <= 3999) {
    echo 'ESTADO: RECHAZADA'.PHP_EOL;
} else {
    /* Esto no debería darse, pero si ocurre, es un CDR inválido que debería tratarse como un error-excepción. */
    /*code: 0100 a 1999 */
    echo 'Excepción';
}

echo $cdr->getDescription().PHP_EOL;
```

> Más detalles sobre que hacer si una factura fue observada o rechazada, [aquí](https://greenter.dev/faq/#facturas).

## Ejecutar [¶](https://greenter.dev/starter/\#ejecutar "Permanent link")

Finalmente ejecutaremos el script desde la linea de comandos.

```
php factura.php
```

y si todo sale bien obtendremos como respuesta.

Exito!

ESTADO: ACEPTADA

La Factura numero F001-1, ha sido aceptada

Estructura finald del proyecto de ejemplo:

```
/
├── vendor/
├── certificate.pem
├── composer.json
├── config.php
├── factura.php
├── 20123456789-01-F001-1.xml
├── R-20123456789-01-F001-1.zip
```

Este ejemplo puedes encontrarlo en [@thegreenter/firststeps](https://github.com/thegreenter/firststeps).

## ¿Que sigue? [¶](https://greenter.dev/starter/\#que-sigue "Permanent link")

- [Detalles de uso de greenter](https://greenter.dev/usage/)
- [Ejemplos de comprobantes electrónicos](https://github.com/thegreenter/demo/tree/master/examples)
- [Revisar los paquetes que componen greenter](https://greenter.dev/packages/xml/)

## Comentarios [¶](https://greenter.dev/starter/\#comentarios "Permanent link")

Pueden unirse a 👋 [Greenter Community](https://community.greenter.dev/).

* * *

1. Comprobante de Recepción (CDR), es un archivo xml que contiene la respuesta de SUNAT, al envío previo de un comprobante electrónico, en ella se indica si un comprobante ha sido aceptado, aceptado con observaciones o rechazado. [↩](https://greenter.dev/starter/#fnref:1 "Jump back to footnote 1 in the text") [↩](https://greenter.dev/starter/#fnref2:1 "Jump back to footnote 1 in the text")


Copyright © 2020 Greenter

Made with [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

[github.com](https://github.com/thegreenter "github.com")[fb.me](https://fb.me/thegreenter "fb.me")[community.greenter.dev](https://community.greenter.dev/ "community.greenter.dev")[yape.greenter.dev](https://yape.greenter.dev/ "yape.greenter.dev")