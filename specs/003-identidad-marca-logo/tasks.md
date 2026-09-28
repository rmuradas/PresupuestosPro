---

description: "Task list template for feature implementation"
---

# Tasks: Identidad de marca con logotipo y nueva paleta visual

**Input**: Design documents from `specs/003-identidad-marca-logo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: No se generan tareas de test automatizado — la spec no las pide y el plan establece que la verificación es manual vía `quickstart.md` (Principio IV de la constitution; esta feature no introduce lógica de negocio nueva que probar con Vitest).

**Organization**: Las tareas están agrupadas por historia de usuario (US1–US4, según las prioridades de `spec.md`) para poder implementar y comprobar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3, US4)
- Cada tarea incluye la ruta de fichero exacta

## Path Conventions

Proyecto único (frontend Vue 3 + backend Express, sin cambios en `backend/`):
`public/` (CSS y assets estáticos), `src/views/`, `src/components/`, `src/pdf/` — tal como fija `plan.md`.

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Poner a disposición el logotipo como recurso estático, requisito de las historias US1, US2 y US4.

**⚠️ CRITICAL**: Ninguna historia puede completarse (ni verificarse con `quickstart.md`) sin estos ficheros disponibles en `public/img/`.

- [X] T001 [P] Copiar `assets/brand/logo-rm.svg` a `public/img/logo-rm.svg` (recurso estático servido por Vite/`dist/`, usado en pantalla — Inicio y navegación — por su nitidez a cualquier tamaño, ver Decisión 3 de research.md)
- [X] T002 [P] Copiar `assets/brand/logo-rm.png` a `public/img/logo-rm.png` (recurso estático usado en el PDF, porque jsPDF `addImage` no soporta SVG sin plugin adicional, ver Decisión 3 de research.md)

**Checkpoint**: `public/img/logo-rm.svg` y `public/img/logo-rm.png` existen y son accesibles en `/img/logo-rm.svg` y `/img/logo-rm.png` al arrancar `npm run dev`.

---

## Phase 2: User Story 1 - Logotipo grande en la página de inicio (Priority: P1) 🎯 MVP

**Goal**: Al entrar en la página de inicio, el freelancer ve el logotipo de marca en grande, girando de forma continua (estático si tiene activada la preferencia "reducir movimiento"), sin afectar a los accesos a las cuatro secciones ni al resumen de actividad ya existentes.

**Independent Test**: Abrir la aplicación por su dirección raíz y comprobar que el logotipo aparece en tamaño grande con una animación de giro visible, y que se muestra estático con la preferencia "reducir movimiento" activada, sin romper el resto de la página de Inicio (ver Historia 1 de [quickstart.md](./quickstart.md)).

### Implementation for User Story 1

- [X] T003 [US1] En `public/css/estilos.css`, añadir las variables `--logo-grande-tamano: clamp(96px, 30vw, 220px);` y `--logo-giro-duracion-grande: 6s;`, la regla `@keyframes girar-logo { to { transform: rotate(360deg); } }` y la clase `.logo-grande { width: var(--logo-grande-tamano); height: auto; animation: girar-logo var(--logo-giro-duracion-grande) linear infinite; }` (valores exactos de [contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md))
- [X] T004 [US1] En `public/css/estilos.css`, añadir el bloque `@media (prefers-reduced-motion: reduce) { .logo-grande { animation: none; } }` (FR-003; este bloque se ampliará en T006 con el selector `.nav-comun__logo` de la Historia 2)
- [X] T005 [US1] En `src/views/InicioView.vue`, añadir `<img src="/img/logo-rm.svg" alt="" class="logo-grande" />` como elemento destacado al inicio de la sección, antes del `<h2>Inicio</h2>`, sin modificar los accesos a las cuatro secciones ni el resumen de actividad ya existentes (FR-001)

**Checkpoint**: la página de inicio (`/`) muestra el logotipo grande girando; con `prefers-reduced-motion: reduce` se muestra estático; en un ancho de móvil no desborda la pantalla (Historia 1 de quickstart.md).

---

## Phase 3: User Story 2 - Logotipo pequeño interactivo en la navegación común (Priority: P1)

**Goal**: En cualquier página, el logotipo pequeño de la navegación común gira al pasar el ratón o recibir el foco de teclado, y actúa como enlace a la página de Inicio.

**Independent Test**: Visitar cualquier sección, comprobar que el logotipo pequeño aparece en la navegación, gira con el ratón o el foco de teclado, y que al activarlo (clic o Intro) navega a Inicio (ver Historia 2 de [quickstart.md](./quickstart.md)).

### Implementation for User Story 2

- [X] T006 [US2] En `public/css/estilos.css`, añadir las variables `--logo-pequeno-tamano: 32px;` y `--logo-giro-duracion-pequeno: 0.6s;`, la clase `.nav-comun__logo { width: var(--logo-pequeno-tamano); height: auto; transition: transform var(--logo-giro-duracion-pequeno) linear; }` con `.nav-comun__logo:hover, .nav-comun__logo:focus-visible { transform: rotate(360deg); }`, y ampliar el bloque `@media (prefers-reduced-motion: reduce)` creado en T004 para incluir también `.nav-comun__logo { transition: none; }` (FR-005, FR-007; valores exactos de [contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md); nombre de clase alineado con la convención BEM ya usada en el componente, `nav-comun__enlace`)
- [X] T007 [US2] En `src/components/NavBar.vue`, añadir `<router-link to="/" class="nav-comun__logo" aria-label="Ir a Inicio"><img src="/img/logo-rm.svg" alt="" /></router-link>` como primer elemento dentro de `<nav class="nav-comun">`, antes del enlace de texto "Inicio" ya existente, reutilizando el estilo `:focus-visible` ya definido en `public/css/estilos.css` (FR-004, FR-018, FR-019)

**Checkpoint**: el logotipo pequeño aparece en la navegación de todas las páginas, gira con hover/foco, navega a Inicio al activarlo, y sigue siendo visible (sin girar) en un dispositivo táctil emulado (Historia 2 de quickstart.md).

---

## Phase 4: User Story 3 - Nueva paleta de colores basada en el logotipo (Priority: P2)

**Goal**: Toda la aplicación usa una paleta de colores derivada del logotipo de marca, manteniendo los cinco estados del presupuesto distinguibles.

**Independent Test**: Recorrer varias pantallas y comprobar que comparten los mismos colores de fondo, acentos y botones derivados del logotipo, y que los cinco estados del presupuesto se siguen distinguiendo con contraste suficiente (ver Historia 3 de [quickstart.md](./quickstart.md)).

### Implementation for User Story 3

- [X] T008 [US3] En `public/css/estilos.css`, sustituir los valores de la paleta general por los definidos en [contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md): `--color-primario: #0B3128;`, `--color-primario-hover: #082720;`, `--color-texto: #16211D;`, `--color-texto-secundario: #4B5F58;`, `--color-fondo: #F4FAF7;`, `--color-borde: #CFE3DA;`, y añadir dos variables nuevas `--color-acento: #2FAF7A;` y `--color-acento-secundario: #0E7490;` (`--color-superficie: #FFFFFF;` y `--color-error: #B91C1C;` no cambian) (FR-010, FR-011, FR-013)
- [X] T008a [US3] En `public/css/estilos.css`, sustituir los colores literales heredados de 002 en la navegación común por variables de la nueva paleta: `.nav-comun__enlace { color: #cbd2d9; }` → `color: var(--color-borde);`, y en `.nav-comun__enlace.router-link-exact-active` sustituir `background: rgba(255, 255, 255, 0.12);` por `background: var(--color-acento); color: var(--color-primario);` (el color activo pasa de blanco translúcido a un chip sólido en `--color-acento`, manteniendo el contraste con el fondo oscuro de `--color-primario` de la cabecera) (FR-011, SC-004)
- [X] T009 [US3] En `public/css/estilos.css`, sustituir los cinco valores de color de estado por los definidos en [contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md): `--color-estado-borrador: #243330;`, `--color-estado-enviado: #0E7490;`, `--color-estado-aceptado: #15803D;` (derivados del logotipo), `--color-estado-rechazado: #B91C1C;` y `--color-estado-caducado: #92400E;` (semánticos, sin cambio respecto a 002, según la Clarification de la spec) — no requiere tocar `src/components/EstadoBadge.vue`, que ya lee estas variables (FR-012)

**Checkpoint**: todas las pantallas comparten la nueva paleta por comparación visual directa; los cinco estados del presupuesto siguen siendo distinguibles de un vistazo en cualquier listado (Historia 3 de quickstart.md).

---

## Phase 5: User Story 4 - Logotipo e imagen de marca en el PDF (Priority: P2)

**Goal**: El PDF de presupuesto incluye el logotipo de marca en su versión estática, sin alterar el contenido ni los importes ya existentes.

**Independent Test**: Generar el PDF de un presupuesto y comprobar que incluye el logotipo de marca sin tapar ningún dato, y que los importes son exactamente los mismos que antes (ver Historia 4 de [quickstart.md](./quickstart.md)).

### Implementation for User Story 4

- [X] T010 [US4] En `src/pdf/generarPdfPresupuesto.js`, añadir una función auxiliar `cargarImagenLogoMarca()` que cree un `new Image()`, le asigne `src = '/img/logo-rm.png'` y devuelva una `Promise` que se resuelve en el evento `onload` con la propia imagen (para poder pasarla a `doc.addImage`)
- [X] T011 [US4] En `generarPdfPresupuesto`, tras `await cargarImagenLogoMarca()` e inmediatamente antes de `doc.save(...)`, colocar el logotipo de marca en el pie de página de la **última** página: `doc.setPage(doc.internal.getNumberOfPages())` y luego `doc.addImage(imagenLogoMarca, 'PNG', 183, 270, 12, 12)` (esquina inferior derecha, 12×12 mm). Si `yDesglose` ya ha sobrepasado 260 (dejando menos de 10 mm antes del logo), usar en su lugar `y: doc.internal.pageSize.getHeight() - 20` para evitar solapar con el desglose de importes. No modificar la posición ni la condición (`if (perfil?.logo)`) del logo propio del freelancer ya existente (FR-008, FR-009; ver [contracts/pdf-visual-contract.md](./contracts/pdf-visual-contract.md))

**Checkpoint**: el PDF generado incluye el logotipo de marca en la esquina inferior derecha, sin tapar la tabla de líneas ni el desglose de importes; el logo del freelancer (si existe) sigue apareciendo igual que antes; los importes no cambian (Historia 4 de quickstart.md).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final de que nada de lo ya existente se ha roto.

- [X] T012 [P] Ejecutar `npm run test:unit` y confirmar que la suite de Vitest existente (`tests/unit/importes.test.js`, `tests/unit/numeracion.test.js`, `tests/backend/*`) sigue pasando sin cambios (FR-014: la lógica de negocio no se ha tocado)
- [X] T013 [P] Ejecutar `npm run build` y confirmar que `public/img/logo-rm.svg` y `public/img/logo-rm.png` aparecen copiados en `dist/img/`
- [X] T014 Ejecutar de principio a fin la validación manual de [quickstart.md](./quickstart.md) (las 4 historias + los casos límite de fallo de carga del logotipo y de impresión en blanco y negro) — verificado con Playwright headless contra `npm run server`: logo grande girando en Inicio (`animationName: girar-logo`), logo pequeño de nav rotando con hover, header/paleta en `#0B3128`, enlace activo del nav con el nuevo `--color-acento`, los 5 colores de estado coinciden exactamente con el contrato, y el PDF generado incluye el logotipo de marca en la esquina inferior derecha sin alterar los importes. **Hallazgo colateral (fuera de alcance de esta feature)**: `PresupuestosListView.vue` tiene un bug preexistente (ajeno a 003) — `calcularImportes(p)` falla porque `GET /api/presupuestos` no incluye `lineas` por fila (solo el detalle las incluye); rompe la vista de listado para cualquier presupuesto. No se ha tocado, por quedar fuera del alcance acordado (solo capa de presentación de 003); se reporta para que se cree una feature/fix aparte.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: sin dependencias — puede empezar de inmediato. Bloquea US1, US2 y US4 (todas usan `/img/logo-rm.*`).
- **User Story 1 (Phase 2)**: depende solo de Phase 1.
- **User Story 2 (Phase 3)**: depende de Phase 1; T006 depende de T004 (mismo bloque `@media` en `public/css/estilos.css`), pero es independiente del resto de US1.
- **User Story 3 (Phase 4)**: depende solo de Phase 1 (de hecho, ni siquiera necesita el logotipo copiado; puede adelantarse si conviene).
- **User Story 4 (Phase 5)**: depende de Phase 1 (T002, el PNG); T011 depende de T010 (mismo fichero).
- **Polish (Phase 6)**: depende de que todas las historias que se vayan a entregar estén completas.

### Parallel Opportunities

- T001 y T002 (Phase 1) son paralelas (ficheros distintos).
- Una vez completada Phase 1, US1, US2, US3 y US4 pueden trabajarse en paralelo por distintas personas, salvo por la coincidencia de fichero en `public/css/estilos.css` (T003/T004 de US1, T006 de US2, T008/T008a/T009 de US3 tocan el mismo fichero: conviene secuenciarlas aunque pertenezcan a historias distintas, para evitar conflictos de fusión).
- T012 y T013 (Phase 6) son paralelas entre sí.

---

## Parallel Example: Phase 1 (Foundational)

```bash
Task: "Copiar assets/brand/logo-rm.svg a public/img/logo-rm.svg"
Task: "Copiar assets/brand/logo-rm.png a public/img/logo-rm.png"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 — ambas P1)

1. Completar Phase 1 (Foundational).
2. Completar Phase 2 (US1: logotipo grande en Inicio) y Phase 3 (US2: logotipo pequeño en la navegación) — ambas son P1 y juntas forman el MVP de identidad de marca visible en toda la app.
3. **STOP and VALIDATE**: comprobar Historias 1 y 2 con quickstart.md.
4. Entregar/mostrar si está listo.

### Incremental Delivery

1. Phase 1 (Foundational) → logotipo disponible como recurso estático.
2. + US1 (logo grande en Inicio) → validar → demo.
3. + US2 (logo pequeño en navegación) → validar → demo (MVP completo).
4. + US3 (nueva paleta) → validar → demo.
5. + US4 (logo en el PDF) → validar → demo.
6. Phase 6 (Polish): regresión de tests existentes, build y validación manual completa.

## Notes

- Ninguna tarea toca `backend/`, `src/storage/`, `src/calculo/`, `src/router.js` ni ningún fichero de `tests/` (más allá de ejecutarlos en T012): esta feature es estrictamente de presentación, tal como fija `plan.md`.
- Todas las tareas que tocan `public/css/estilos.css` (T003, T004, T006, T008, T008a, T009) deben aplicarse en orden secuencial, aunque pertenezcan a historias distintas, para evitar conflictos de fusión sobre el mismo fichero.
- Commitear tras cada tarea o grupo lógico de tareas.
