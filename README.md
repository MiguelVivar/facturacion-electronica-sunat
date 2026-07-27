<p align="center">
  <img src="./public/logo.svg" alt="Facturación Electrónica SUNAT Logo" width="540" />
</p>

<h1 align="center">Facturación Electrónica SUNAT</h1>

<p align="center">
  <strong>Skill de Claude Code y Motor TypeScript Nativo para Comprobantes Electrónicos Peruanos</strong>
</p>

<p align="center">
  <a href="#-visión-general">Visión General</a> •
  <a href="#-tres-rutas-de-ejecución">Rutas de Ejecución</a> •
  <a href="#-comprobantes-soportados">Comprobantes</a> •
  <a href="#-arquitectura-del-ecosistema">Arquitectura</a> •
  <a href="#-desarrollo-web-y-sitio">Sitio Web</a> •
  <a href="#-estado-de-verificación">Estado Real</a>
</p>

---

## 📋 Visión General

`sunat-facturacion-electronica` es un ecosistema completo para generar, validar y transmitir comprobantes de pago electrónicos a la **SUNAT** (Superintendencia Nacional de Aduanas y de Administración Tributaria de Perú).

Empaqueta el conocimiento de dominio tributario peruano (códigos de catálogo, cálculo exacto de IGV con redondeo por afección, flujos síncronos vs. asíncronos por ticket, migración de Guía de Remisión a SEE-API OAuth2 y lectura de códigos CDR) para que ni un agente de Inteligencia Artificial ni un desarrollador tengan que redescubrir las reglas tributarias a fuerza de errores y rechazos.

---

## ⚡ Tres Rutas de Ejecución

El ecosistema detecta y soporta tres modelos de integración según las necesidades del proyecto:

1. **Ruta PHP (Greenter)**  
   Para proyectos PHP existentes con `greenter/lite` o `greenter/greenter` vía Composer.
2. **Ruta Lycet REST API**  
   Para servicios multi-lenguaje que se comunican mediante HTTP REST/JSON hacia una instancia de Lycet.
3. **Ruta Nativa TypeScript (`sunat-fe`)**  
   Monorepo TypeScript ejecutado con **Bun** o **Node.js**, sin dependencia de PHP.

---

## 📜 Comprobantes Soportados

| Tipo | Código | Descripción | Modo de Transmisión |
| :--- | :---: | :--- | :---: |
| **Factura Electrónica** | `01` | Venta entre contribuyentes con RUC | Síncrono (CDR Inmediato) |
| **Boleta de Venta** | `03` | Venta a consumidor final con DNI/CE/Pasaporte | Síncrono (CDR Inmediato) |
| **Nota de Crédito** | `07` | Anulación o descuento sobre comprobante previo | Síncrono (CDR Inmediato) |
| **Nota de Débito** | `08` | Penalidad o aumento de valor | Síncrono (CDR Inmediato) |
| **Comprobante de Retención** | `20` | Agente de retención de IGV | Síncrono (CDR Inmediato) |
| **Comprobante de Percepción** | `40` | Agente de percepción de IGV | Síncrono (CDR Inmediato) |
| **Guía de Remisión Remitente** | `09` | Sustento de traslado de bienes | Asíncrono (SEE-API OAuth2) |
| **Resumen Diario de Boletas** | `RC` | Resumen masivo de boletas y notas asociadas | Asíncrono (Ticket + Polling) |
| **Comunicación de Baja** | `RA` | Anulación formal de facturas emitidas | Asíncrono (Ticket + Polling) |

---

## 🏗️ Arquitectura del Ecosistema

### 1. Sub-Skills de Claude Code (`.claude/skills/`)
- `sunat-facturacion-electronica`: Router e índice principal.
- `sunat-comprobantes`: Orquestación e integración de flujos (Greenter, Lycet, TypeScript).
- `sunat-catalogos`: Catálogos oficiales SUNAT (01 a 59: monedas, tributos, afectación IGV, etc.).
- `sunat-calculo`: Fórmulas matemáticas de IGV, bases imponibles y agrupadors.
- `sunat-cli`: Uso de la herramienta CLI nativa.

### 2. Paquetes Nativos TypeScript (`packages/`)
Publicados en **GitHub Packages** (`https://npm.pkg.github.com`):

- `@miguelvivar/sunat-fe-core`: Catálogos y motor de cálculo de montos/IGV.
- `@miguelvivar/sunat-fe-xml`: Generador de estructuras UBL 2.1 XML en UTF-8.
- `@miguelvivar/sunat-fe-client`: Cliente SOAP (WS-Security + empaquetado ZIP ISO-8859-1).
- `@miguelvivar/sunat-fe-signer`: Firma digital XML-DSig enveloped.
- `@miguelvivar/sunat-fe`: CLI ejecutable (`catalogo`, `calcular`, `generar-xml`, `firmar`, `enviar`).

#### 📥 Instalación de Paquetes Publicados:

```bash
# 1. Configurar el registro en tu ~/.npmrc
@miguelvivar:registry=https://npm.pkg.github.com

# 2. Instalar el CLI ejecutable globalmente
bun add -g @miguelvivar/sunat-fe
# o con npm:
npm install -g @miguelvivar/sunat-fe

# 3. O instalar las librerías en tu proyecto TypeScript
bun add @miguelvivar/sunat-fe-core @miguelvivar/sunat-fe-xml
```

---

## 🛠️ Comandos de Desarrollo

El proyecto incluye un sitio web explicativo desarrollado en **Astro**:

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo del sitio web
bun dev

# Ejecutar tests unitarios de las librerías TypeScript
bun test

# Construir el sitio web para producción
bun build
```

---

## ⚖️ Estado de Verificación y Transparencia

De acuerdo con nuestras políticas de honestidad técnica (`PRODUCT.md`):

- ✅ **Catálogos y Motor de Cálculo**: Implemenados y validados con 46+ tests unitarios (`bun test`).
- ✅ **Generación UBL 2.1**: Estructuras XML válidas para Facturas y Boletas.
- ✅ **Conexión SOAP BETA**: Cliente SOAP verificado contra el entorno `FE_BETA` real de SUNAT (compresión ZIP, codificación ISO-8859-1 y parseo de SOAP Fault / CDR exitoso).
- ⚠️ **Firma XML-DSig**: En proceso de ajuste fino de digest / canonicidad contra el validador estricto de SUNAT.

---

## 📄 Licencia

MIT © 2026 Ecosistema Facturación Electrónica SUNAT.
