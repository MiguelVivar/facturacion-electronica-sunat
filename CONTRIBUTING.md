# 🤝 Guía Completa de Contribución — Facturación Electrónica SUNAT

¡Bienvenido al repositorio oficial de **Facturación Electrónica SUNAT**! Este ecosistema incluye la **Skill de Claude Code**, las librerías nativas **TypeScript**, el **CLI global (`sunat-fe`)** y el **sitio web en Astro**.

Para garantizar la precisión tributaria, la seguridad criptográfica y la sostenibilidad del código, todas las contribuciones deben seguir las pautas descritas en este documento.

---

## 📋 Tabla de Contenidos
1. [📜 Código de Conducta y Principios](#-código-de-conducta-y-principios)
2. [🌿 Flujo de Trabajo en Git (Git Workflow)](#-flujo-de-trabajo-en-git-git-workflow)
3. [📝 Commits Convencionales (Conventional Commits)](#-commits-convencionales-conventional-commits)
4. [🛡️ Estándares de Código y TypeScript Estricto](#-estándares-de-código-y-typescript-estricto)
5. [🧪 Ciclo TDD y Pruebas Unitarias](#-ciclo-tdd-y-pruebas-unitarias)
6. [🔍 Auditoría de Código Muerto (Knip)](#-auditoría-de-código-muerto-knip)
7. [🔄 Proceso Paso a Paso para Enviar un Pull Request (PR)](#-proceso-paso-a-paso-para-enviar-un-pull-request-pr)
8. [🔐 Seguridad y Reporte de Vulnerabilidades](#-seguridad-y-reporte-de-vulnerabilidades)

---

## 📜 Código de Conducta y Principios

Este proyecto maneja **reglas tributarias de SUNAT** y **firmas digitales XML-DSig**. Nos guiamos por cuatro principios fundamentales:

1. **Cero Tolerancia al Engaño:** Un comprobante mal calculado o firmado de forma inválida acarrea multas legales reales. No se permiten fallbacks ficticios ni ocultar errores en producciones de prueba.
2. **Respeto y Colaboración:** Mantenemos discusiones profesionales basadas en la normativa tributaria oficial (Resoluciones de Superintendencia SUNAT).
3. **Simplicidad Criptográfica:** No se reimplementan algoritmos estándar si existen librerías consolidadas y mantenidas.

---

## 🌿 Flujo de Trabajo en Git (Git Workflow)

Trabajamos directamente sobre la rama principal **`main`** mediante Pull Requests (PRs). **No está permitido el `git push` directo a `main`**.

### Nomenclatura de Ramas
Cuando crees una rama de trabajo, utiliza prefijos claros seguidos de un nombre descriptivo en minúsculas separado por guiones:

| Prefijo | Propósito | Ejemplo |
| :--- | :--- | :--- |
| `feat/` | Nueva funcionalidad o soporte de comprobante | `feat/guias-remision-see-api` |
| `fix/` | Corrección de un error o cálculo de IGV | `fix/redondeo-exonerado-cabecera` |
| `docs/` | Mejoras en documentación o sitio web | `docs/ejemplo-factura-exportacion` |
| `perf/` | Optimización de velocidad o memoria | `perf/compresion-zip-fflate` |
| `test/` | Casos de prueba tributarios adicionales | `test/afectacion-igv-bolsa-plástica` |
| `chore/` | Mantenimiento de dependencias o CI | `chore/actualizar-astro-v7` |

---

## 📝 Commits Convencionales (Conventional Commits)

Todos los mensajes de commit son validados automáticamente en CI mediante **Commitlint**. Deben seguir el formato:

$$\text{<tipo>}(\text{<alcance opcional>}): \text{<descripción corta en minúsculas>}$$

### Tipos Permitidos:
- 🎨 **`style`**: Formato de código, espacios, punto y coma o diseño UI sin cambiar lógica.
- ✨ **`feat`**: Nueva característica en librerías, CLI, skills o web.
- 🐛 **`fix`**: Corrección de errores en cálculo, firmas, XML o SOAP.
- 📚 **`docs`**: Cambios en archivos `.md`, plantillas o sitio web.
- ♻️ **`refactor`**: Reorganización de código sin alterar comportamiento externo.
- ⚡ **`perf`**: Mejoras en tiempo de ejecución o consumo de memoria.
- 🧪 **`test`**: Creación o ajuste de pruebas unitarias (`bun test`).
- 🛠️ **`build`** / **`ci`**: Cambios en `package.json`, Workflows de GitHub Actions o TypeScript config.
- 🧹 **`chore`**: Tareas de mantenimiento general.

---

## 🛡️ Estándares de Código y TypeScript Estricto

El código TypeScript debe ser **100% estricto y seguro**:

- 🚫 **Sin `any`**: El uso de `any` está prohibido. Utiliza tipos específicos, uniones, genéricos o `unknown` acompañado de guardas de tipo (*type guards*).
- ⚙️ **Compiler Flags Activas**:
  - `"strict": true`
  - `"noImplicitAny": true`
  - `"noUnusedLocals": true`
  - `"noUnusedParameters": true`
  - `"noImplicitReturns": true`
  - `"noFallthroughCasesInSwitch": true`

---

## 🧪 Ciclo TDD y Pruebas Unitarias

Utilizamos **Bun Test** como motor principal de pruebas. Cualquier cambio en las fórmulas de cálculo (`packages/core`), generadores de XML (`packages/xml`), cliente SOAP (`packages/client`) o comandos CLI (`packages/cli`) debe acompañarse de sus correspondientes tests unitarios.

Para ejecutar los tests localmente:
```bash
bun test
```

---

## 🔍 Auditoría de Código Muerto (Knip)

El proyecto utiliza **Knip** para garantizar que no existan archivos huerfanos, exportaciones no utilizadas ni dependencias fantasma.

Para validar que tu rama esté limpia antes de enviar un PR:
```bash
bun run knip
```

---

## 🔄 Proceso Paso a Paso para Enviar un Pull Request (PR)

1. **Sincronizar y Crear Rama:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/mi-nueva-caracteristica
   ```

2. **Desarrollar y Verificar Localmente:**
   Ejecuta la suite de verificación completa antes de enviar:
   ```bash
   bun install
   bun run check      # Compilación TypeScript estricta
   bun run knip       # Auditoría de código muerto
   bun test           # Pruebas unitarias
   bun run build      # Construcción estática del sitio web
   ```

3. **Hacer Commit con Conventional Commit:**
   ```bash
   git add .
   git commit -m "feat(xml): soporte para leyenda de retencion 2000"
   ```

4. **Publicar Rama y Abrir PR:**
   ```bash
   git push origin feat/mi-nueva-caracteristica
   ```
   Abre el Pull Request en GitHub seleccionando **`main`** como rama de destino.

---

## 🔐 Seguridad y Reporte de Vulnerabilidades

Si descubres una posible vulnerabilidad de seguridad (relacionada con certificados digitales, claves privadas o credenciales SOL), **no abras una Issue pública**.

Utiliza la plantilla de seguridad **[🔐 Reporte de Vulnerabilidad](https://github.com/MiguelVivar/facturacion-electronica-sunat/issues/new?template=5-security_vulnerability.yml)** asegurándote de enmascarar cualquier secreto real.
