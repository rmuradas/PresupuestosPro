# Implementation Plan: Exportar todos los presupuestos en un .zip

**Branch**: `004-exportar-zip-presupuestos` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-exportar-zip-presupuestos/spec.md`

## Summary

Añadir un botón "Exportar todo (.zip)" en la lista de presupuestos que genera,
en el navegador, un único .zip con un PDF por presupuesto (idéntico al PDF
individual ya existente) más un archivo `datos.json` de respaldo
(presupuestos, catálogo de servicios y perfil con logo). La generación es de
solo lectura, tolera fallos puntuales de PDF individuales (mejor esfuerzo) y
muestra progreso visible para volúmenes altos (hasta 200 presupuestos).

Enfoque técnico: se añade un endpoint de solo lectura en el backend que
agrega en una sola respuesta los datos ya existentes (presupuestos con sus
líneas, servicios, perfil) para evitar cientos de peticiones HTTP
individuales desde el navegador. El montaje del .zip (PDF + JSON) ocurre en
el cliente reutilizando la lógica de PDF ya existente, porque esa lógica
depende de APIs de navegador (`getComputedStyle`, `Image`) que no existen en
el servidor.

## Technical Context

**Language/Version**: JavaScript (ES2022+), Node.js LTS >= 20

**Primary Dependencies**: Vue 3 (`<script setup>`), Vite, Express 5,
better-sqlite3, jsPDF + jspdf-autotable (ya presentes); **JSZip** (nueva
dependencia cliente para ensamblar el .zip en el navegador)

**Storage**: SQLite vía `better-sqlite3` (solo lectura para esta feature; sin
cambios de esquema)

**Testing**: Vitest (`tests/unit`) para las funciones puras nuevas
(sanitización de nombre de archivo, construcción del objeto de respaldo);
verificación funcional completa manual vía `quickstart.md`, igual que el
resto del proyecto

**Target Platform**: Navegador (frontend Vue) + Node.js/Express (backend
existente, un endpoint de agregación nuevo)

**Project Type**: Web application (estructura existente de un único
frontend `src/` + backend `backend/`, sin carpetas separadas por proyecto)

**Performance Goals**: Completar la exportación de 200 presupuestos sin
error y sin bloquear la interfaz de forma perceptible (FR-012, SC-005); la
respuesta de "no hay nada que exportar" debe percibirse como inmediata
(SC-004, <1s)

**Constraints**: Operación de solo lectura estricta (FR-009); nombres de
archivo deben sanear caracteres inválidos sin perder legibilidad (FR-007);
mejor esfuerzo ante fallos puntuales de PDF (FR-013)

**Scale/Scope**: De 1 a 200+ presupuestos por exportación; una única
pantalla afectada (lista de presupuestos); un endpoint backend nuevo; ningún
cambio de esquema de base de datos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicidad ante todo**: PASS. Se añade una única dependencia nueva
  (JSZip), imprescindible para producir un .zip real en el navegador (no
  existe alternativa nativa sin dependencia). No se introduce backend
  adicional más allá de un endpoint de agregación de solo lectura que evita
  N peticiones HTTP repetidas; no hay capas ni configuración especulativa.
- **II. Idioma y mercado**: PASS. Todos los textos nuevos (botón, avisos,
  progreso, nombres de archivo) van en español de España; sin cambios de
  moneda.
- **III. Cero alcance fantasma**: PASS. Se implementa exactamente lo que
  dice la spec: botón, .zip con PDF + un archivo de datos, saneado de
  nombres, aviso de vacío, progreso, mejor esfuerzo ante fallos. **El
  catálogo de clientes NO se incluye en el archivo de datos de respaldo**
  porque FR-008 solo menciona presupuestos, servicios y perfil; cada
  presupuesto ya lleva embebidos los datos del cliente en el momento de su
  emisión, así que omitirlo no pierde información y añadirlo sería alcance
  no pedido. La importación/restauración queda fuera de alcance (ya
  declarado en la spec).
- **IV. Verificable por una persona no técnica**: PASS. Todos los criterios
  de éxito se comprueban con clics y observando archivos descargados (ver
  `quickstart.md`).
- **V. Datos del usuario con respeto**: PASS. No se piden datos nuevos al
  usuario; no se introducen secretos; el archivo de respaldo solo contiene
  datos que el usuario ya introdujo voluntariamente en la app.

**Resultado**: Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-exportar-zip-presupuestos/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md         # Fase 1
├── quickstart.md         # Fase 1
├── contracts/            # Fase 1
│   ├── api-exportacion.md
│   └── formato-datos-respaldo.md
└── tasks.md              # Fase 2 (/speckit-tasks, no generado aquí)
```

### Source Code (repository root)

```text
backend/
├── rutas/
│   └── exportacion.js          # NUEVO: GET /api/exportacion (perfil + servicios + presupuestos con líneas)
└── server.js                   # editar: registrar la nueva ruta

src/
├── pdf/
│   └── generarPdfPresupuesto.js  # editar: separar "construir documento" de "guardar" para reutilizarlo en el .zip
├── exportacion/                  # NUEVO
│   ├── nombreArchivo.js          # sanitizarNombreArchivo(texto)
│   └── exportarTodo.js           # orquesta: pide datos, genera PDFs, arma el .zip + datos.json, descarga
├── storage/
│   └── exportacion.js            # NUEVO: peticionJson('/api/exportacion')
└── views/
    └── PresupuestosListView.vue  # editar: botón "Exportar todo (.zip)", indicador de progreso, avisos

tests/unit/
└── exportacion.test.js           # NUEVO: sanitizarNombreArchivo y forma del objeto de respaldo
```

**Structure Decision**: Se mantiene la estructura ya existente del proyecto
(frontend en `src/`, backend en `backend/`), sin introducir una separación
de proyectos nueva. La única pieza backend nueva es un router de agregación
de solo lectura, análogo a `resumenActividadRouter` ya existente en
`presupuestos.js`.

## Fase 1 — paso final: Mantenimiento de `CLAUDE.md`

Como último paso de la Fase 1 (Diseño & Contracts), antes de dar por
cerrada la planificación de esta feature:

- Actualizar `CLAUDE.md` con las decisiones de diseño y convenciones nuevas
  de esta feature, **una línea por decisión**, con referencia a la spec
  (p. ej. `[004] ...`).
- Solo se añaden decisiones **transversales**: información que features
  futuras puedan aprovechar directamente (una convención técnica, una
  librería adoptada, una regla reutilizable). No se documentan detalles
  específicos de esta feature que no trasciendan su propio alcance (p. ej.
  el nombre exacto del botón o el formato interno de `datos.json` ya viven
  en `spec.md`/`data-model.md`, no en `CLAUDE.md`).
- No dejar entradas "por completar después": si una decisión todavía no
  está tomada, no se añade hasta que lo esté.

## Complexity Tracking

*Sin violaciones de la Constitution Check. No aplica.*
