# Tasks: Rediseño visual, página de inicio y persistencia en base de datos

**Input**: Design documents from `specs/002-rediseno-navegacion-bd/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: incluidas de forma limitada — solo las que ya diseñó explícitamente `plan.md` (Technical Context "Testing" y `tests/backend/` en Project Structure) para el riesgo real de esta feature: el cálculo del estado efectivo y la numeración atómica. No se generan tests de contrato por endpoint ni TDD completo, porque la spec no lo pide.

**Organization**: Tasks agrupadas por historia de usuario (US1, US2, US3, en el mismo orden de prioridad que spec.md) para poder implementarlas y probarlas de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (fichero distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta de fichero exacta

## Path Conventions

Proyecto web con frontend + backend (ver "Project Structure" de [plan.md](./plan.md)):
- Frontend: `src/`, `public/`, `tests/unit/` (ya existen desde la spec 001)
- Backend (nuevo): `backend/`, `tests/backend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar el proyecto para tener un backend, sin implementar todavía ninguna ruta.

- [X] T001 Add `express` and `better-sqlite3` as dependencies in `package.json` (raíz del repo) and run `npm install`
- [X] T002 [P] Add `backend/data/` to `.gitignore` so the SQLite database file is never committed (Constitution Principio V — datos del usuario no van al repositorio)
- [X] T003 [P] Add npm script `"server": "node backend/server.js"` to `package.json`'s `scripts`
- [X] T004 [P] Create empty directory structure `backend/db/`, `backend/rutas/`, `backend/estado/`, `backend/data/` per [plan.md](./plan.md) Project Structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestructura mínima que las tres historias de usuario necesitan para existir (servidor arrancando, base de datos creada, hoja de estilos enlazada). Ninguna historia puede completarse sin esto.

**⚠️ CRITICAL**: No se debe empezar ninguna historia de usuario hasta terminar esta fase.

- [X] T005 Create `backend/db/migraciones.sql` with `CREATE TABLE IF NOT EXISTS` statements for every table in [data-model.md](./data-model.md): `perfil` (fila única), `servicios`, `clientes`, `presupuestos` (incluyendo `estado TEXT NOT NULL DEFAULT 'borrador' CHECK(estado IN ('borrador','enviado','aceptado','rechazado'))`, nunca `'caducado'`), `presupuesto_lineas` (`presupuesto_id` con `ON DELETE CASCADE`), y `contador_anual` (`anio INTEGER PRIMARY KEY`, `UNIQUE(anio)` implícito por ser PK)
- [X] T006 Implement `backend/db/conexion.js`: abre/crea `backend/data/presupuestospro.db` con `better-sqlite3`, ejecuta `migraciones.sql` al arrancar si las tablas no existen, exporta el manejador de base de datos
- [X] T007 Implement `backend/server.js`: app Express con `express.json()` para parsear cuerpos JSON, sirve la carpeta `dist/` como estáticos en `/`, monta routers vacíos (placeholder) en `/api/perfil`, `/api/servicios`, `/api/clientes`, `/api/presupuestos`, `/api/resumen-actividad`, `/api/migracion`, escucha en un puerto configurable por variable de entorno
- [X] T008 [P] Implement `backend/estado/estadoEfectivo.js`: función pura `calcularEstadoEfectivo(estadoGuardado, fechaValidez, hoy)` que implementa la regla de data-model.md ("Estado efectivo"): si `estadoGuardado` es `'aceptado'` o `'rechazado'`, se devuelve tal cual (nunca se sustituye); si no, y `fechaValidez < hoy`, devuelve `'caducado'`; en cualquier otro caso devuelve `estadoGuardado` (`'borrador'` o `'enviado'`)
- [X] T009 [P] Create `public/css/estilos.css` with an empty `:root { }` block, link it from `index.html` with `<link rel="stylesheet" href="/css/estilos.css">`, and remove `import './assets/base.css'` from `src/main.js`

**Checkpoint**: el servidor arranca, sirve `dist/` y responde en `/api/*` con routers vacíos; la base de datos se crea vacía con su esquema completo; `estilos.css` está enlazado. Ninguna historia tiene todavía datos ni pantallas nuevas.

---

## Phase 3: User Story 1 - Persistencia fiable en base de datos (Priority: P1) 🎯 MVP

**Goal**: perfil, catálogo de servicios, clientes y presupuestos se guardan y se leen desde la base de datos vía API JSON, sin depender de `localStorage`.

**Independent Test**: crear datos en cada sección, borrar los datos de navegación del navegador (o abrir en otro navegador), y comprobar que todos los datos siguen apareciendo igual al reabrir la aplicación.

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement `backend/rutas/perfil.js`: `GET /api/perfil` (devuelve la fila guardada o `null` si no existe, FR-004a de 001), `PUT /api/perfil` (upsert de la fila única, cuerpo `{ nombre, nif, contacto, logo }`; `nombre`, `nif` y `contacto` obligatorios y no vacíos) — montar en `server.js`
- [X] T011 [P] [US1] Implement `backend/rutas/servicios.js`: `GET`/`POST /api/servicios`, `PUT`/`DELETE /api/servicios/:id`, validando que `precioPorDefecto` (columna `precio_por_defecto_centimos`) sea mayor que 0 — montar en `server.js`
- [X] T012 [P] [US1] Implement `backend/rutas/clientes.js`: `GET`/`POST /api/clientes`, `PUT`/`DELETE /api/clientes/:id`, validando que `tipo` sea `'empresa_autonomo'` o `'particular'` — montar en `server.js`
- [X] T013 [US1] Implement `backend/rutas/presupuestos.js`: `GET /api/presupuestos` y `GET /api/presupuestos/:id` devolviendo `estado` = estado efectivo (usando T008); `POST /api/presupuestos` asignando `id`, `numero` correlativo `AAAA-NNN` (de forma atómica junto con `contador_anual`, dentro de una transacción SQLite, reutilizando la misma regla que `src/calculo/numeracion.js`), `fechaEmision`, `fechaValidez = fechaEmision + 30 días` y `estado: 'borrador'`; `PUT /api/presupuestos/:id` actualiza `cliente`/`retencionActiva`/`retencionPorcentaje`/`lineas` SIN tocar nunca `numero` ni `estado` (FR-013a) — montar en `server.js`
- [X] T014 [US1] Implement `backend/rutas/migracion.js`: `GET /api/migracion/estado` (`{ baseDatosVacia }`), `POST /api/migracion` (importa el contenido completo de `localStorage` de la spec 001 según `specs/001-presupuestos-freelance/contracts/storage-schema.md`, asignando `estado: 'borrador'` a cada presupuesto importado ya que 001 no tenía ese campo; responde `409` sin tocar nada si la base de datos ya no está vacía) — montar en `server.js`
- [X] T015 [US1] Refactor `src/storage/perfil.js` to async functions (`getPerfil`, `guardarPerfil`) that call `fetch('/api/perfil', ...)` with a JSON body, keeping the exact same exported function names already used by the views
- [X] T016 [US1] Refactor `src/storage/servicios.js` to async functions calling `/api/servicios` (listar/crear/actualizar/eliminar), keeping the same exported function names
- [X] T017 [US1] Refactor `src/storage/clientes.js` to async functions calling `/api/clientes` (listar/crear/actualizar/eliminar), keeping the same exported function names
- [X] T018 [US1] Refactor `src/storage/presupuestos.js` to async functions calling `/api/presupuestos` (listar/obtener/crear/actualizar), removing the client-side numbering logic now that the backend assigns `numero` atomically (T013)
- [X] T019 [US1] Create `src/storage/migracionLegado.js`: al arrancar, llama a `GET /api/migracion/estado`; si `baseDatosVacia` es `true` y existen las claves antiguas `presupuestospro.*` en `localStorage`, las envía una única vez con `POST /api/migracion`, y a partir de ahí deja de leer `localStorage`
- [X] T020 [US1] Wire `migracionLegado.js` into `src/main.js` so it runs once, before the Vue app mounts
- [X] T021 [US1] Update `src/views/PerfilView.vue`, `ServiciosView.vue`, `ClientesView.vue`, `PresupuestosListView.vue`, `PresupuestoDetalleView.vue` to `await` the now-async storage calls (T015–T018), showing a simple loading state while the request is in flight, including on first paint when the view is reached by a direct URL (FR-027)
- [X] T021a [P] [US1] Update `ServiciosView.vue` and `ClientesView.vue` to show a clear message ("Todavía no hay servicios" / "Todavía no hay clientes") instead of an empty table when the list has zero items (FR-024)
- [X] T022 [US1] Update the `router.beforeEach` guard in `src/router.js` (`RUTAS_QUE_REQUIEREN_PERFIL`) to `await getPerfil()` now that it returns a Promise

**Checkpoint**: User Story 1 completa y comprobable de forma independiente (Historia 1 de [quickstart.md](./quickstart.md)).

---

## Phase 4: User Story 2 - Página de inicio y navegación común (Priority: P1)

**Goal**: al entrar por la raíz del servidor aparece una página de Inicio con accesos a las cuatro secciones y un resumen de actividad; una navegación común queda visible en todas las pantallas.

**Independent Test**: abrir la dirección raíz del servidor, comprobar que aparece Inicio con las cuatro secciones y el resumen; navegar a cada sección y volver usando solo la navegación común, sin el botón "atrás".

### Implementation for User Story 2

- [X] T023 [P] [US2] Add `GET /api/resumen-actividad` to `backend/rutas/presupuestos.js`: cuenta todos los presupuestos agrupados por **estado efectivo** (reutilizando T008), devolviendo `{ borrador, enviado, aceptado, rechazado, caducado }` con las cinco claves siempre presentes, aunque valgan `0` — montar en `server.js`
- [X] T024 [P] [US2] Create `src/storage/resumenActividad.js`: función async que llama a `GET /api/resumen-actividad`
- [X] T025 [US2] Create `src/components/NavBar.vue`: navegación común con enlaces a Inicio, Presupuestos, Clientes, Catálogo y Perfil, marcando la sección activa (FR-023), visible y accesible tanto en escritorio como en móvil (FR-025)
- [X] T026 [US2] Update `src/App.vue` to render `<NavBar />` instead of the current ad hoc `<header>`, keeping it visible above `<router-view />` on every screen
- [X] T027 [US2] Create `src/views/InicioView.vue`: muestra un acceso directo a cada una de las cuatro secciones y el resumen de actividad (via `resumenActividad.js`, T024), mostrando "no hay presupuestos" cuando los cinco conteos son 0; si `getPerfil()` devuelve `null`, el acceso a "Presupuestos" muestra un aviso visible ("Completa tu perfil antes de crear presupuestos") en vez de depender solo del redirect heredado de 001 (FR-022)
- [X] T028 [US2] Update `src/router.js`: la ruta `/` pasa a renderizar `InicioView` directamente (se elimina el `redirect: '/perfil'`); Inicio no exige perfil guardado (solo `presupuestos`/`presupuesto-detalle` lo siguen exigiendo, FR-004a de 001, sin cambios)

**Checkpoint**: User Story 1 y 2 funcionan juntas de forma independiente (Historia 2 de [quickstart.md](./quickstart.md)).

---

## Phase 5: User Story 3 - Rediseño visual profesional y estados del presupuesto (Priority: P2)

**Goal**: toda la aplicación y el PDF comparten una paleta, tipografía y espaciado consistentes; los cinco estados del presupuesto (Borrador, Enviado, Aceptado, Rechazado, Caducado) se distinguen visualmente en cualquier pantalla.

**Independent Test**: recorrer todas las pantallas y el PDF comprobando que comparten paleta/tipografía, y que presupuestos en cada uno de los cinco estados se distinguen claramente entre sí.

### Implementation for User Story 3

- [X] T029 [US3] Populate `public/css/estilos.css`'s `:root` with every variable required by [contracts/css-tokens-contract.md](./contracts/css-tokens-contract.md): paleta (`--color-primario`, `--color-primario-hover`, `--color-texto`, `--color-texto-secundario`, `--color-fondo`, `--color-superficie`, `--color-borde`, `--color-error`), los cinco `--color-estado-*` (elegidos con un contraste de texto mínimo WCAG AA 4.5:1 sobre su fondo, FR-030), tipografía (`--fuente-base`, `--fuente-tamano-base`, `--fuente-tamano-titulo-1`, `--fuente-tamano-titulo-2`, `--fuente-peso-normal`, `--fuente-peso-negrita`) y espaciado (`--espacio-1` … `--espacio-6`, `--radio-borde`)
- [X] T030 [US3] Delete `src/assets/base.css` and reimplement its base element rules (`body`, `.app-shell`, `.app-main`, `form`, `label`, `input`/`select`/`textarea`, `button`, `button.secundario`, `table`/`th`/`td`, `.aviso`, `.resumen-importes`) directly in `public/css/estilos.css`, using `var(--...)` instead of the hardcoded hex values from 001
- [X] T031 [P] [US3] Create `src/components/EstadoBadge.vue`: recibe un `estado` (valor efectivo) por prop y muestra su color + etiqueta en español (Borrador/Enviado/Aceptado/Rechazado/Caducado) usando las variables `--color-estado-*` de T029
- [X] T032 [US3] Add `PUT /api/presupuestos/:id/estado` to `backend/rutas/presupuestos.js`: cuerpo `{ estado }` limitado a `'borrador' | 'enviado' | 'aceptado' | 'rechazado'` (responde `400` si se envía `'caducado'`, por ser un valor calculado, no manual — FR-010/FR-011); actualiza únicamente la columna `estado`, sin tocar ningún otro campo (FR-013)
- [X] T033 [US3] Add `cambiarEstadoPresupuesto(id, estado)` to `src/storage/presupuestos.js` calling the endpoint from T032
- [X] T034 [US3] Update `src/views/PresupuestosListView.vue` to show `<EstadoBadge :estado="p.estado" />` per presupuesto row
- [X] T035 [US3] Update `src/views/PresupuestoDetalleView.vue` to show `<EstadoBadge>` plus a manual `<select>` (Borrador/Enviado/Aceptado/Rechazado, cambio libre en cualquier orden, FR-010, FR-026) wired to `cambiarEstadoPresupuesto` (T033); confirmar que editar líneas/cliente no modifica el estado mostrado (FR-013a)
- [X] T036 [US3] Update `src/pdf/generarPdfPresupuesto.js` to read its colors via `getComputedStyle(document.documentElement).getPropertyValue('--color-...')` instead of any hardcoded color value, keeping the PDF content contract from spec 001 (and [contracts/pdf-contract-visual.md](./contracts/pdf-contract-visual.md)) unchanged
- [X] T037 [US3] Review `src/views/PerfilView.vue`, `ServiciosView.vue`, `ClientesView.vue`, `src/components/LineaForm.vue`, `src/components/LogoUploader.vue` and replace any remaining hardcoded color/spacing with the `var(--...)` tokens from T029, so every screen shares the same palette, typography and spacing (FR-014, FR-015, SC-004)
- [X] T037a [P] [US3] In `public/css/estilos.css`, add responsive rules so tables (`PresupuestosListView.vue`, líneas de presupuesto in `PresupuestoDetalleView.vue`) stay legible on narrow screens via horizontal scroll (`overflow-x: auto` wrapper) without clipping columns (FR-029)
- [X] T037b [P] [US3] Add visible `:focus-visible` styles (using `--color-primario`) in `public/css/estilos.css` for `NavBar.vue` links and the estado `<select>` from T035, and verify by keyboard (Tab) that every interactive element in the nav and the estado control is reachable and its focus is visible (FR-031)

**Checkpoint**: las tres historias funcionan juntas; Historia 3 de [quickstart.md](./quickstart.md) completa.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: cubrir el riesgo real que introduce esta feature (cálculo de estado efectivo y numeración atómica en el nuevo backend) y confirmar que nada de lo ya existente se ha roto.

- [X] T038 [P] Add `tests/backend/estadoEfectivo.test.js` (Vitest) covering: Borrador/Enviado con `fechaValidez` pasada → `'caducado'`; Aceptado/Rechazado con `fechaValidez` pasada → se mantienen sin cambio; Borrador/Enviado con `fechaValidez` futura → sin cambio
- [X] T039 [P] Add `tests/backend/presupuestos.test.js` (Vitest, contra un fichero SQLite temporal) covering numeración correlativa dentro de un mismo año y reinicio a `001` en un año nuevo (misma regla que `tests/unit/numeracion.test.js`, ahora ejercida a través del backend, T013)
- [X] T039a [P] Add a shared error-handling helper (e.g. `src/storage/errores.js` or a `try/catch` wrapper used by every `storage/*.js` module) that catches failed `fetch()` calls and surfaces a comprehensible Spanish message (e.g. "No se puede conectar con el servidor.") via a visible UI element (toast/banner) with a "Reintentar" button that re-issues the same failed request on click (no automatic background retry), without clearing already-rendered data (FR-003a, FR-028)
- [X] T040 Run the full [quickstart.md](./quickstart.md) validation manually against the built app (`npm run build` + `npm run server`), confirming every check for Historias 1, 2 and 3 passes
- [X] T041 Verify `tests/unit/importes.test.js` and `tests/unit/numeracion.test.js` (heredados de la spec 001) siguen pasando sin modificarlos, confirmando que los cálculos de impuestos no se han tocado (FR-020, FR-021)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede empezar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las tres historias
- **User Story 1 (Phase 3)**: depende solo de Foundational
- **User Story 2 (Phase 4)**: depende de Foundational; además reutiliza el endpoint y la tabla de presupuestos que construye US1 (T013) para calcular el resumen de actividad — en la práctica se implementa después de US1
- **User Story 3 (Phase 5)**: depende de Foundational; reutiliza los presupuestos ya persistidos por US1 (T013) para poder mostrar y cambiar su estado — en la práctica se implementa después de US1
- **Polish (Phase 6)**: depende de que las historias que se quieran cubrir con test/validación ya estén completas

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias — puede probarse de forma completamente independiente
- **US2 (P1)**: técnicamente reutiliza el backend de presupuestos de US1 (mismo endpoint `/api/presupuestos`, ampliado con `/api/resumen-actividad`), pero es una historia distinta y comprobable por separado (Historia 2 de quickstart) una vez US1 está montada
- **US3 (P2)**: técnicamente reutiliza los presupuestos de US1 para tener datos que colorear, pero añade su propia superficie (CSS, `EstadoBadge`, endpoint de estado) y es comprobable por separado (Historia 3 de quickstart)

### Within Each User Story

- Backend antes que frontend (las rutas deben existir antes de que `storage/*.js` las llame)
- `storage/*.js` antes que las vistas que los usan
- Historia completa y comprobada antes de pasar a la siguiente en orden de prioridad

### Parallel Opportunities

- Todas las tareas `[P]` de Setup pueden ejecutarse en paralelo
- T008 y T009 (Foundational) pueden ejecutarse en paralelo entre sí (ficheros distintos, sin dependencia mutua)
- Dentro de US1: T010, T011, T012 (rutas de perfil/servicios/clientes) son paralelas entre sí; T015, T016, T017 (refactor de storage) son paralelas entre sí una vez existen sus rutas correspondientes
- Dentro de US2: T023 y T024 son paralelas
- Dentro de US3: T031 (EstadoBadge) es paralela al resto mientras T029 (variables CSS) ya exista
- T038 y T039 (Polish) son paralelas entre sí

---

## Parallel Example: User Story 1

```bash
# Backend: lanzar las tres rutas CRUD sencillas juntas (perfil, servicios, clientes)
Task: "Implement backend/rutas/perfil.js"
Task: "Implement backend/rutas/servicios.js"
Task: "Implement backend/rutas/clientes.js"

# Frontend: una vez existen esas rutas, refactorizar sus módulos de storage en paralelo
Task: "Refactor src/storage/perfil.js to async fetch calls"
Task: "Refactor src/storage/servicios.js to async fetch calls"
Task: "Refactor src/storage/clientes.js to async fetch calls"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloquea todo lo demás)
3. Completar Phase 3: User Story 1
4. **Parar y validar**: ejecutar la Historia 1 de [quickstart.md](./quickstart.md) de forma independiente
5. Con esto ya hay persistencia real en base de datos, aunque la aplicación siga viéndose como en 001

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar Historia 1 → los datos ya no se pierden (MVP de esta feature)
3. US2 → validar Historia 2 → aparece Inicio y la navegación común
4. US3 → validar Historia 3 → la aplicación y el PDF tienen la imagen profesional pedida, con estados visibles
5. Polish → tests de riesgo (numeración, estado efectivo) + validación manual completa

### Recomendación de orden

Aunque US1 y US2 comparten prioridad P1, **US1 debe implementarse primero**: tanto US2 (resumen de actividad) como US3 (estados visuales sobre presupuestos reales) necesitan que los presupuestos ya vivan en la base de datos construida por US1 para tener algo que mostrar.
