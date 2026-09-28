---

description: "Task list template for feature implementation"
---

# Tasks: PresupuestosPro v0

**Input**: Design documents from `/specs/001-presupuestos-freelance/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/storage-schema.md](./contracts/storage-schema.md), [contracts/pdf-contract.md](./contracts/pdf-contract.md), [quickstart.md](./quickstart.md)

**Tests**: plan.md pide explícitamente pruebas automáticas (Vitest) solo para la lógica de cálculo de impuestos y de numeración (Decisión 7 de research.md); por eso, y solo por eso, este plan incluye tareas de test para `calculo/importes.js` y `calculo/numeracion.js`. El resto de historias se validan manualmente con [quickstart.md](./quickstart.md), no con tests automáticos.

**Organization**: Las tareas se agrupan por historia de usuario (spec.md) para poder implementar y comprobar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3, US4)
- Cada tarea incluye la ruta de fichero exacta

## Path Conventions

Proyecto único, solo frontend (ver "Project Structure" en [plan.md](./plan.md)):

```text
src/{main.js,App.vue,router.js,storage/,calculo/,pdf/,views/,components/,assets/}
tests/unit/
public/index.html
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Arrancar el proyecto Vue 3 + Vite desde cero (no existe todavía `package.json` en el repo).

- [X] T001 Crear la estructura de carpetas del proyecto: `src/storage/`, `src/calculo/`, `src/pdf/`, `src/views/`, `src/components/`, `src/assets/`, `tests/unit/`, `public/`, tal como describe "Source Code" en [plan.md](./plan.md)
- [X] T002 Inicializar `package.json` en la raíz del repo e instalar `vue@3` y `vue-router@4` como dependencias, y `vite` + `@vitejs/plugin-vue` como devDependencies (research.md Decisión 5)
- [X] T003 Instalar `jspdf` y `jspdf-autotable` como dependencias (research.md Decisión 3), añadidas a `package.json`
- [X] T004 Instalar `vitest` como devDependency y añadir el script `"test:unit": "vitest run"` a `package.json`, de forma que `npm run test:unit` (quickstart.md) ejecute las pruebas de `tests/unit/`
- [X] T005 Crear `vite.config.js` (con el plugin de Vue) y `public/index.html` como único punto de entrada HTML servido por Vite (plan.md: "no hay backend que renderice nada") — Nota: `index.html` se creó en la raíz del repo, no en `public/`, porque Vite exige el HTML de entrada en `root`; `public/` queda para estáticos servidos tal cual
- [X] T006 Crear `src/main.js` arrancando la app Vue y montándola sobre el elemento del DOM definido en `public/index.html`

**Checkpoint**: `npm run dev` levanta una página en blanco sin errores en consola.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Capa de almacenamiento, lógica pura de cálculo/numeración, y el esqueleto de navegación que todas las historias de usuario necesitan.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta que esta fase esté completa.

- [X] T007 Implementar utilidades genéricas de lectura/escritura en `src/storage/util.js`: serializar/deserializar JSON y aplicar la regla de "escritura atómica por entidad" de [contracts/storage-schema.md](./contracts/storage-schema.md) (releer la clave completa, aplicar el cambio en memoria, reescribir la clave completa; sin escrituras parciales)
- [X] T008 [P] Implementar `src/storage/perfil.js`: `getPerfil()` / `savePerfil()` sobre la clave `presupuestospro.perfil`; la ausencia de la clave se trata como "perfil todavía no configurado" (FR-004a), nunca como un error de lectura (contracts/storage-schema.md, regla 3); guardar el logo como cadena `data:` dentro del propio objeto
- [X] T009 [P] Implementar `src/storage/servicios.js`: alta, edición, borrado y listado de `Servicio` sobre la clave `presupuestospro.servicios`; cada `Servicio` exige `nombre` (no puede quedar vacío) y `precioPorDefecto` en céntimos, mayor que 0 (data-model.md)
- [X] T010 [P] Implementar `src/storage/clientes.js`: alta, edición, borrado y listado de `Cliente` sobre la clave `presupuestospro.clientes`; cada `Cliente` exige `nombre`, `nif` y `contacto` (no pueden quedar vacíos, sin validar formato ni unicidad del NIF) y `tipo` (uno de `empresa_autonomo` o `particular`) (data-model.md)
- [X] T011 [P] Implementar `src/storage/presupuestos.js`: alta, edición, borrado y listado de `Presupuesto` (con sus `lineas` embebidas) sobre la clave `presupuestospro.presupuestos`, más lectura/incremento del contador anual (`{ anio, ultimoNumeroUsado }`) sobre la clave `presupuestospro.contadorAnual`, incrementando en 1 por cada presupuesto nuevo de ese año y sin decrementar ni reutilizar nunca un número (data-model.md, "Contador de numeración anual")
- [X] T012 [P] Implementar `src/calculo/importes.js` con funciones puras, trabajando en céntimos (enteros): `baseImponible` (suma de `cantidad × precioUnitario` de todas las líneas), `iva` (`baseImponible × 21%`), `retencion` (`baseImponible × retencionPorcentaje%` solo si `retencionActiva === true` **y** `cliente.tipo === 'empresa_autonomo'`; en cualquier otro caso, 0) y `total` (`baseImponible + iva − retencion`); cada importe redondeado a 2 decimales con la regla "0,5 hacia arriba" (FR-020)
- [X] T013 [P] Implementar `src/calculo/numeracion.js` con una función pura `siguienteNumero(anio, contadores)` que devuelve el número `AAAA-NNN` correlativo del año dado, empezando en `001`, sin decrementar ni reutilizar números de años ya usados (FR-012, data-model.md)
- [X] T014 [P] Escribir pruebas de `src/calculo/importes.js` en `tests/unit/importes.test.js`: el caso de referencia del Escenario 2 de quickstart.md (líneas 1.500,00 € + 500,00 €, retención 15% → base 2.000,00 €, IVA 420,00 €, retención −300,00 €, total 2.120,00 €) y al menos un caso de redondeo con más de 2 decimales antes de redondear, comprobando la regla "0,5 hacia arriba" (FR-020)
- [X] T015 [P] Escribir pruebas de `src/calculo/numeracion.js` en `tests/unit/numeracion.test.js`: numeración correlativa dentro de un mismo año natural (001, 002, 003…) y reinicio del contador a 001 al pasar a un año nuevo, sin afectar a los números de años anteriores (FR-012)
- [X] T016 Crear `src/router.js` en modo hash con las rutas `#/perfil`, `#/servicios`, `#/clientes`, `#/presupuestos`, `#/presupuestos/:id` (research.md Decisión 6), con un guard de navegación que redirige a `#/perfil` cuando no existe `PerfilFreelancer` guardado (vía `src/storage/perfil.js`) y la ruta destino es `#/presupuestos` o `#/presupuestos/:id` (FR-004a)
- [X] T017 Crear `src/App.vue` con la navegación principal (Perfil, Servicios, Clientes, Presupuestos) y un `<router-view>`
- [X] T018 [P] Crear el CSS base mobile-first en `src/assets/base.css`, sin librería de estilos externa (plan.md, "Target Platform")

**Checkpoint**: Con datos escritos manualmente en `localStorage`, la navegación entre las 5 rutas funciona y el guard de perfil redirige correctamente. `npm run test:unit` pasa.

---

## Phase 3: User Story 1 - Configurar el perfil del freelancer (Priority: P1) 🎯 MVP

**Goal**: El freelancer puede guardar su nombre, NIF, contacto y logo, y recuperarlos al volver a la pantalla.

**Independent Test**: Rellenar el formulario de perfil, guardar, recargar la página y comprobar que los datos y el logo siguen ahí (quickstart.md, Escenario 1).

### Implementation for User Story 1

- [X] T019 [P] [US1] Crear `src/components/LogoUploader.vue`: input de fichero de imagen que lo codifica como cadena `data:` (PNG/JPG) para guardarlo en el campo `logo` del perfil (data-model.md)
- [X] T020 [US1] Crear `src/views/PerfilView.vue`: formulario de nombre, NIF, contacto y logo (usando `LogoUploader.vue`), que al montarse carga el perfil existente vía `src/storage/perfil.js` y precarga los campos si ya hay uno guardado
- [X] T021 [US1] Implementar el guardado en `src/views/PerfilView.vue`: validar que nombre, NIF y contacto no estén vacíos (FR-001) antes de llamar a `savePerfil()`, y volver a mostrar los datos guardados tras guardar (Escenario 1 de quickstart.md)
- [X] T022 [US1] Enlazar la ruta `#/perfil` con `src/views/PerfilView.vue` en `src/router.js` y añadir el enlace "Perfil" a la navegación de `src/App.vue`

**Checkpoint**: La Historia de Usuario 1 es completamente funcional y comprobable de forma independiente (Escenario 1 de quickstart.md).

---

## Phase 4: User Story 2 - Crear un presupuesto con cálculo automático de impuestos (Priority: P1)

**Goal**: Crear un presupuesto con cliente, líneas, y ver base/IVA/retención/total recalculados al instante.

**Independent Test**: Crear un presupuesto para un cliente empresa/autónomo, añadir líneas de 1.500,00 € y 500,00 €, activar retención 15% y comprobar que el total es 2.120,00 €; cambiar retención a 7% y comprobar 2.280,00 €; marcar el cliente como particular y comprobar 2.420,00 € (quickstart.md, Escenario 2).

### Implementation for User Story 2

- [X] T023 [P] [US2] Crear `src/views/PresupuestosListView.vue`: listado de `Presupuesto` existentes (número, cliente, total) leídos vía `src/storage/presupuestos.js`, con una acción "Nuevo presupuesto"
- [X] T024 [P] [US2] Crear `src/views/PresupuestoDetalleView.vue` (esqueleto): al crear uno nuevo, inicializa en memoria un `Presupuesto` con `retencionActiva = false`, `lineas = []` y sin `cliente` todavía asignado
- [X] T025 [US2] Implementar en `src/views/PresupuestoDetalleView.vue` la selección/alta de cliente: elegir un `Cliente` existente (vía `src/storage/clientes.js`) o rellenar un formulario en el momento (nombre, NIF, contacto, tipo), congelando esos datos en `presupuesto.cliente` al crearse (FR-004, data-model.md "copia congelada del cliente")
- [X] T026 [P] [US2] Crear `src/components/LineaForm.vue`: formulario para añadir una `LineaPresupuesto` (descripción, cantidad, precio unitario) que valida que cantidad y precio unitario sean mayores que 0, rechazando 0 o negativos con un aviso (FR-005)
- [X] T027 [US2] Integrar `LineaForm.vue` en `src/views/PresupuestoDetalleView.vue`: listar, editar y eliminar líneas del presupuesto en cualquier momento, recalculando los importes de inmediato tras cada cambio (FR-014, FR-011)
- [X] T028 [US2] Añadir en `src/views/PresupuestoDetalleView.vue` los controles de retención de IRPF (activar/desactivar + elegir 15% o 7%), aplicándola solo cuando `cliente.tipo === 'empresa_autonomo'` (FR-008, FR-009) y recalculando el total al instante ante cualquier cambio (FR-011, SC-006)
- [X] T029 [US2] Mostrar en `src/views/PresupuestoDetalleView.vue` los importes calculados (base imponible, IVA, retención, total) usando `src/calculo/importes.js`, actualizándose sin recargar la página ante cualquier cambio de línea, cliente o retención (FR-011, SC-006)
- [X] T030 [US2] Implementar el guardado del presupuesto en `src/views/PresupuestoDetalleView.vue` vía `src/storage/presupuestos.js`, asignando `numero` con `src/calculo/numeracion.js` y el contador anual únicamente en el primer guardado (FR-012), y enlazar las rutas `#/presupuestos` / `#/presupuestos/:id` + el enlace "Presupuestos" en `src/App.vue`

**Checkpoint**: Las Historias de Usuario 1 y 2 funcionan juntas de forma independiente (no se puede crear un presupuesto sin perfil, pero con perfil guardado el cálculo automático es completo — Escenario 2 de quickstart.md).

---

## Phase 5: User Story 3 - Descargar el presupuesto en PDF (Priority: P1)

**Goal**: Generar un PDF del presupuesto con el contenido fijado en [contracts/pdf-contract.md](./contracts/pdf-contract.md).

**Independent Test**: Generar el PDF de un presupuesto con líneas y comprobar visualmente logo, número, fechas y desglose completo; crear un segundo presupuesto el mismo año y comprobar que su número es el correlativo siguiente; editar una línea y regenerar el PDF comprobando que conserva el mismo número (quickstart.md, Escenario 3).

### Implementation for User Story 3

- [X] T031 [P] [US3] Implementar `src/pdf/generarPdfPresupuesto.js` con jsPDF + jspdf-autotable, produciendo el contenido en el orden fijado por [contracts/pdf-contract.md](./contracts/pdf-contract.md): (1) cabecera del emisor (logo si existe, nombre, NIF y contacto del `PerfilFreelancer`), (2) número `AAAA-NNN`, fecha de emisión y fecha de validez en formato día/mes/año, (3) datos del cliente tal como quedaron congelados en el presupuesto, (4) tabla de líneas (descripción, cantidad, precio unitario, importe de línea), (5) desglose de base imponible, IVA (con el 21% indicado), retención de IRPF —con su porcentaje y como importe negativo, y omitiendo la fila entera si `retencionActiva` es `false` o el cliente es particular— y total; todos los importes en euros con 2 decimales y símbolo €, en formato español (coma decimal)
- [X] T032 [US3] Añadir el botón "Generar PDF" en `src/views/PresupuestoDetalleView.vue` que llama a `generarPdfPresupuesto.js` y descarga el fichero en el navegador, reutilizando siempre el `numero` ya asignado al presupuesto (FR-016)
- [X] T033 [US3] Bloquear la generación del PDF en `src/views/PresupuestoDetalleView.vue` cuando el presupuesto no tenga ninguna línea, mostrando un aviso que explique que falta añadir al menos una (FR-017)
- [X] T034 [US3] Mostrar la fecha de validez (`fechaEmision + 30 días`) junto al número de presupuesto en `src/views/PresupuestoDetalleView.vue` y `src/views/PresupuestosListView.vue`, en formato día/mes/año (FR-013)

**Checkpoint**: Las Historias de Usuario 1, 2 y 3 cubren el flujo completo: perfil → presupuesto calculado → PDF descargado (Escenario 3 de quickstart.md).

---

## Phase 6: User Story 4 - Mantener catálogos reutilizables de servicios y clientes (Priority: P2)

**Goal**: Gestionar un catálogo de servicios y una lista de clientes reutilizables desde sus propias pantallas, y usarlos al crear un presupuesto.

**Independent Test**: Dar de alta un servicio y un cliente en sus catálogos; comprobar que ambos aparecen disponibles al crear un presupuesto nuevo, precargando sus datos de forma editable; editar o eliminar ese servicio/cliente y comprobar que los presupuestos ya creados no cambian (quickstart.md, Escenario 4).

### Implementation for User Story 4

- [X] T035 [P] [US4] Crear `src/views/ServiciosView.vue`: alta, edición, borrado y listado de `Servicio` (nombre, precio por defecto) vía `src/storage/servicios.js`, validando que el nombre no esté vacío y que el precio por defecto sea mayor que 0 (FR-002)
- [X] T036 [P] [US4] Crear `src/views/ClientesView.vue`: alta, edición, borrado y listado de `Cliente` (nombre, NIF, contacto, tipo) vía `src/storage/clientes.js`, validando que nombre, NIF y contacto no estén vacíos (sin validar el formato del NIF) (FR-003)
- [X] T037 [US4] Enlazar las rutas `#/servicios` y `#/clientes` en `src/router.js` con sus vistas, y añadir los enlaces "Servicios" y "Clientes" a la navegación de `src/App.vue`
- [X] T038 [P] [US4] Ampliar `src/components/LineaForm.vue` para permitir elegir un `Servicio` del catálogo (vía `src/storage/servicios.js`), precargando descripción y precio unitario editables antes de guardar la línea, y congelando esos valores en la línea sin volver a leerlos del catálogo después (FR-005, FR-019, data-model.md "copia congelada del servicio")
- [X] T039 [P] [US4] Ampliar la selección de cliente en `src/views/PresupuestoDetalleView.vue` para listar también los `Cliente` del catálogo (además de la opción de alta en el momento ya existente de la Historia 2), sin tener que volver a escribir sus datos (FR-004)
- [X] T040 [US4] Comprobar que editar o eliminar un `Servicio` o `Cliente` ya usado en presupuestos anteriores no altera esos presupuestos (FR-019): confirmar que ni `src/views/PresupuestoDetalleView.vue` ni `src/pdf/generarPdfPresupuesto.js` vuelven a leer el catálogo en el momento de mostrar/generar un presupuesto ya creado

**Checkpoint**: Las 4 historias de usuario funcionan juntas de forma independiente (Escenario 4 de quickstart.md).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de extremo a extremo, sin añadir funcionalidad nueva (Principio III de la constitution).

- [ ] T041 Ejecutar manualmente los 4 escenarios y la "Comprobación de persistencia general" de [quickstart.md](./quickstart.md) de principio a fin — **pendiente de ejecución humana en un navegador real** (Principio IV de la constitution): este entorno de desarrollo no dispone de navegador ni de herramientas de automatización de navegador para simularlo de forma fiable; sí se comprobó por servidor (Vite sirviendo cada módulo sin errores de compilación) y con las pruebas automáticas de `npm run test:unit`
- [X] T042 [P] Comprobar que `npm run build` seguido de `npm run preview` sirve la aplicación como ficheros estáticos, sin backend (plan.md "Structure Decision", research.md Decisión 6) — verificado: `npm run build` genera `dist/` y `npm run preview` sirve `index.html` con los assets enlazados, sin ningún backend
- [ ] T043 [P] Revisar las 5 vistas (`PerfilView`, `ServiciosView`, `ClientesView`, `PresupuestosListView`, `PresupuestoDetalleView`) en un viewport móvil estrecho, comprobando el diseño mobile-first (plan.md "Target Platform") — **pendiente de revisión visual humana**: el CSS base (`src/assets/base.css`) está escrito mobile-first (columna única por defecto, `@media (min-width: 640px)` solo añade espaciado), pero confirmar el aspecto real requiere abrir la app en un navegador

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — empieza de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias de usuario
- **Historias de usuario (Phase 3-6)**: todas dependen de que Foundational esté completa
  - Dependencia real entre historias (no solo de fase): **US2 depende de US1** (FR-004a exige perfil guardado antes de crear un presupuesto) — por eso se implementan en ese orden aunque ambas sean P1
  - **US3 depende de US2** (necesita un presupuesto con importes calculados para generar su PDF)
  - **US4 es aditiva** sobre US2 (amplía la selección de cliente/línea con los catálogos), pero es la única historia que puede posponerse sin bloquear el resto (Priority P2)
- **Polish (Phase 7)**: depende de que todas las historias deseadas estén completas

### Within Each User Story

- Storage y cálculo (Foundational) antes que cualquier vista que los use
- Dentro de una vista: estructura/esqueleto antes que la lógica de guardado o cálculo que depende de sus campos
- Historia completa y comprobable antes de pasar a la siguiente en el plan de entrega

### Parallel Opportunities

- Todas las tareas [P] de Setup y Foundational pueden repartirse entre distintas personas (ficheros distintos)
- Dentro de Foundational: T008-T011 (storage), T012-T013 (cálculo) y T014-T015 (tests) son grupos independientes entre sí
- Dentro de US2: T023/T024 (dos vistas nuevas) en paralelo; T026 (`LineaForm.vue`) en paralelo con T025 (selección de cliente, mismo fichero que T024 pero distinto de T026)
- Dentro de US4: T035/T036 (dos vistas nuevas) en paralelo; T038/T039 (ficheros distintos) en paralelo

---

## Parallel Example: User Story 1

```bash
# T019 y el resto de US1 dependen de Foundational, no entre sí de forma paralela real
# (formulario único), pero LogoUploader.vue es un fichero aparte:
Task: "Crear src/components/LogoUploader.vue"
# ... y en paralelo, si hay más de una persona, puede adelantarse la maquetación de la vista:
Task: "Crear src/views/PerfilView.vue (esqueleto de formulario)"
```

## Parallel Example: User Story 2

```bash
# Dos vistas nuevas, sin dependencia entre ellas:
Task: "Crear src/views/PresupuestosListView.vue"
Task: "Crear src/views/PresupuestoDetalleView.vue (esqueleto)"

# Un componente aparte, en paralelo con la selección de cliente:
Task: "Crear src/components/LineaForm.vue"
```

---

## Implementation Strategy

### MVP First (Historias de Usuario 1 + 2)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todas las historias)
3. Completar Phase 3: Historia 1 (Perfil)
4. Completar Phase 4: Historia 2 (Cálculo automático) — **no puede probarse de forma aislada de la Historia 1**, porque FR-004a exige perfil guardado
5. **PARAR y VALIDAR**: probar Escenario 1 y Escenario 2 de quickstart.md

### Entrega incremental

1. Setup + Foundational → base lista
2. Historia 1 → Escenario 1 de quickstart.md validado
3. Historia 2 → Escenario 2 de quickstart.md validado (MVP funcional de cálculo, aunque todavía sin PDF)
4. Historia 3 → Escenario 3 de quickstart.md validado (entregable real: el PDF llega al cliente) — **este es el MVP publicable**, ya que sin PDF el presupuesto no puede salir de la aplicación
5. Historia 4 → Escenario 4 de quickstart.md validado (ahorro de tiempo en el uso repetido; no bloqueante para publicar)
6. Polish → validación completa de quickstart.md + build estático

### Nota sobre "independencia" de las historias

Las historias de usuario de esta feature no son mutuamente independientes en el sentido estricto del principio (US1 → US2 → US3 forman una cadena obligatoria por las propias reglas de negocio de la spec: sin perfil no hay presupuesto, sin presupuesto calculado no hay PDF). Cada una sigue siendo **comprobable por separado** en cuanto la anterior está lista, que es lo que exige el Principio IV de la constitution y lo que describe el "Independent Test" de cada historia en spec.md. Solo la Historia 4 (catálogos) es opcional/pospuesta sin bloquear la entrega de las demás.
