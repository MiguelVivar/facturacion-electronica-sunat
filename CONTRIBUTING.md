# 🤝 Guía de Contribución — Facturación Electrónica SUNAT

¡Gracias por tu interés en contribuir a este proyecto! Para mantener la calidad, seguridad y coherencia del código, seguimos reglas estrictas de desarrollo.

---

## 🌿 Estrategia de Ramas (Git Workflow)

- **`main`**: Rama de producción y lanzamientos estables. **Prohibido hacer `git push` directo a `main`**.
- **`dev`**: Rama principal de desarrollo donde se integran las nuevas características y correcciones antes de un release.
- **Ramas de características (`feature/*` o `fix/*`)**: Deben crearse a partir de `dev` y enviarse mediante un **Pull Request (PR)** hacia `dev`.

```bash
# Crear tu rama desde dev
git checkout dev
git pull origin dev
git checkout -b feature/nueva-funcionalidad
```

---

## 📝 Commits Convencionales (Conventional Commits)

Todos los commits deben cumplir con la especificación de [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):

```
<tipo>(<alcance opcional>): <descripción concisa en minúsculas>
```

### Tipos Permitidos:
- 🎨 **`style`**: Cambios de formato, CSS o diseño UI sin alterar lógica.
- ✨ **`feat`**: Una nueva funcionalidad.
- 🐛 **`fix`**: Corrección de un error o bug.
- 📚 **`docs`**: Cambios exclusivamente en la documentación.
- ♻️ **`refactor`**: Refactorización de código sin añadir feat ni arreglar fix.
- ⚡ **`perf`**: Mejora de rendimiento.
- 🧪 **`test`**: Añadir o corregir pruebas unitarias.
- 🛠️ **`build`** / **`ci`**: Cambios en scripts de compilación, Workflows de GitHub Actions o paquetes.
- 🧹 **`chore`**: Tareas de mantenimiento menores.

### Ejemplos Válidos:
- `feat(core): agregar validación de detraccones para catálogo 54`
- `fix(xml): corregir namespace en el nodo InvoiceTypeCode`
- `docs: actualizar comandos de instalación en README`

---

## 🛡️ Estándares de Código y TypeScript Estricto

1. **TypeScript Estricto:**
   - Prohibido el uso del tipo `any`. Usa tipos concretos, genéricos o `unknown` con type guards.
   - Las opciones `"noImplicitAny"`, `"strict"`, `"noUnusedLocals"` y `"noUnusedParameters"` están activadas y se validan en CI.
2. **Análisis de Código Muerto (Knip):**
   - Ejecuta `bun run knip` antes de abrir un PR para garantizar que no existan archivos, tipos o dependencias sin usar.
3. **Pruebas Unitarias:**
   - Todo cambio en la lógica de comprobantes o catálogos debe incluir pruebas unitarias con `bun test`.

---

## 🔄 Proceso de Pull Request (PR)

1. Asegúrate de que tu código compila y pasa los tests locales:
   ```bash
   bun install
   bun test
   bun run check
   bun run knip
   bun run build
   ```
2. Crea el Pull Request apuntando a la rama **`dev`**.
3. El flujo automatizado de CI (GitHub Actions) validará:
   - Formato de Conventional Commits.
   - Compilación en TypeScript estricto.
   - Knip para código no utilizado.
   - Pruebas unitarias completas.
