---

description: "Task list for feature implementation"
---

# Tasks: Exportar todos los presupuestos en un .zip

**Input**: Documentos de diseño de `/specs/004-exportar-zip-presupuestos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Se incluyen únicamente los tests unitarios que `plan.md` (§ Testing) y `quickstart.md` piden explícitamente: `sanitizarNombreArchivo` y la construcción del objeto `datos.json`. El resto del flujo se valida manualmente vía `quickstart.md`.

**Organization**: Las tareas se agrupan por historia de usuario para permitir implementación y prueba independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3)
- Cada tarea incluye la ruta de fichero exacta

## Path Conventions

Proyecto único ya existente: frontend en `src/`, backend en `backend/`, tests en `tests/unit/` (ver `plan.md` § Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Añadir la única dependencia nueva que necesita la feature

- [ ] T001 Añadir la dependencia cliente **JSZip** al proyecto (`npm install jszip`), quedando registrada en `package.json` bajo `dependencies` (research.md §1; plan.md § Primary Dependencies)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura compartida que usan tanto la Historia 1 como la Historia 3 (agregación de datos, generación de PDF reutilizable, saneado de nombres)

**⚠️ CRITICAL**: Ninguna historia de usuario puede implementarse hasta que esta fase esté completa

- [ ] T002 [P] Crear `backend/rutas/exportacion.js` con un router Express que expone `GET /api/exportacion` y devuelve `{ perfil, servicios, presupuestos }` en una sola respuesta de solo lectura: `perfil` con la misma forma que `GET /api/perfil` (`null` si no existe), `servicios` con la misma forma que `GET /api/servicios`, y `presupuestos` con la misma forma que `GET /api/presupuestos/:id` (incluyendo `lineas`) para **todos** los presupuestos existentes, ordenados por `numero` descendente, con el `estado` efectivo ya calculado (mismo patrón que `resumenActividadRouter` en `backend/rutas/presupuestos.js`); sin paginación (contracts/api-exportacion.md)
- [ ] T003 Registrar la nueva ruta en `backend/server.js` con `app.use('/api/exportacion', rutasExportacion)`, siguiendo el mismo patrón que las rutas ya registradas (depende de T002)
- [ ] T004 [P] Refactorizar `src/pdf/generarPdfPresupuesto.js` separando la construcción del documento jsPDF (lógica actual entre la carga del perfil y el desglose de importes + logo de marca) de la acción de guardar/descargar: extraer una función que recibe un `presupuesto` y devuelve el objeto `jsPDF` ya construido, y hacer que `generarPdfPresupuesto` (usada hoy por el botón "Generar PDF" en `src/views/PresupuestoDetalleView.vue`) siga llamando a `doc.save(...)` tras invocar esa función, sin cambiar su comportamiento actual (plan.md § Project Structure)
- [ ] T005 [P] Crear `src/storage/exportacion.js` con una función `getDatosExportacion()` que llama a `peticionJson('/api/exportacion')` (mismo patrón que `src/storage/resumenActividad.js`)
- [ ] T006 [P] Crear `src/exportacion/nombreArchivo.js` con `sanitizarNombreArchivo(texto)`: sustituye cada carácter de `/ \ : * ? " < > |` por `-` y recorta espacios sobrantes resultantes, sin alterar el resto del texto (research.md §4; FR-007)

**Checkpoint**: Con esta fase completa, puede empezar la implementación de la Historia 1

---

## Phase 3: User Story 1 - Copia de seguridad completa con un clic (Priority: P1) 🎯 MVP

**Goal**: Un botón "Exportar todo (.zip)" descarga un único .zip con un PDF por presupuesto (idéntico al individual) más `datos.json`, tolerando fallos puntuales de PDF (mejor esfuerzo)

**Independent Test**: Con al menos un presupuesto creado, pulsar el botón y comprobar que se descarga un único .zip que, al descomprimirse, contiene un PDF por presupuesto y un `datos.json` legible

### Implementation for User Story 1

- [ ] T007 [US1] Crear `src/exportacion/exportarTodo.js` que orquesta la exportación: llama a `getDatosExportacion()`, genera secuencialmente el PDF de cada presupuesto reutilizando la función de construcción de `src/pdf/generarPdfPresupuesto.js` (T004), nombra cada PDF `"{numero} - {sanitizarNombreArchivo(cliente.nombre)}.pdf"` (FR-006/FR-007), y captura el fallo de un presupuesto concreto sin detener el resto (FR-013), acumulando `{ numero, motivo }` de los que fallaron
- [ ] T008 [US1] Dentro de `src/exportacion/exportarTodo.js`, construir el objeto `datos.json` con `{ generadoEn, perfil, servicios, presupuestos }` — `generadoEn` en ISO 8601 del momento de la exportación, `presupuestos` incluye **únicamente** los que generaron su PDF con éxito y con sus `lineas` completas, sin catálogo de clientes (contracts/formato-datos-respaldo.md; data-model.md) — y ensamblar con JSZip los PDF generados + `datos.json`, descargando el resultado como `presupuestospro-copia-AAAA-MM-DD.zip` con la fecha del día (FR-002/FR-003/FR-004/FR-008)
- [ ] T009 [P] [US1] Test unitario en `tests/unit/exportacion.test.js` que construye el objeto `datos.json` a partir de una respuesta simulada de `/api/exportacion` y comprueba la forma exacta de sus claves de primer nivel (`generadoEn`, `perfil`, `servicios`, `presupuestos`) y que no incluye catálogo de clientes (quickstart.md § Notas para pruebas automatizadas)
- [ ] T010 [US1] Añadir el botón "Exportar todo (.zip)" en `src/views/PresupuestosListView.vue`, visible en la lista de presupuestos, que al pulsarse invoca la orquestación de `src/exportacion/exportarTodo.js` (FR-001)
- [ ] T011 [US1] En `src/views/PresupuestosListView.vue`, tras completar la exportación, mostrar un aviso listando los números de presupuesto que quedaron fuera cuando `fallidos.length > 0`, dejando claro que el resto del .zip sí se descargó (FR-013; Acceptance Scenario 5 de la Historia 1)

**Checkpoint**: La Historia 1 debe ser completamente funcional y probable de forma independiente

---

## Phase 4: User Story 2 - Aviso cuando no hay nada que exportar (Priority: P2)

**Goal**: Pulsar "Exportar todo (.zip)" sin presupuestos muestra un aviso claro en vez de generar una descarga vacía o confusa

**Independent Test**: Con la aplicación sin presupuestos creados, pulsar el botón y comprobar que aparece un aviso y no se descarga ningún archivo

### Implementation for User Story 2

- [ ] T012 [US2] En el punto de entrada de la exportación (botón en `src/views/PresupuestosListView.vue` u orquestación en `src/exportacion/exportarTodo.js`), comprobar si no existe ningún presupuesto **antes** de llamar al backend o iniciar cualquier trabajo, y en ese caso mostrar un mensaje claro de que no hay nada que exportar sin iniciar ninguna descarga (FR-010; SC-004, percibido en menos de 1 segundo)

**Checkpoint**: Las Historias 1 y 2 deben funcionar de forma independiente

---

## Phase 5: User Story 3 - Exportación fiable con nombres de cliente difíciles o muchos presupuestos (Priority: P3)

**Goal**: La exportación funciona igual de bien con nombres de cliente con caracteres especiales y con volúmenes altos de presupuestos, mostrando progreso visible mientras dura

**Independent Test**: Crear un presupuesto con "/" en el nombre del cliente y exportar, comprobando un nombre de fichero válido; repetir con 50+ presupuestos y comprobar que la interfaz muestra progreso hasta terminar

### Implementation for User Story 3

- [ ] T013 [P] [US3] Tests unitarios en `tests/unit/exportacion.test.js` para `sanitizarNombreArchivo` cubriendo cada carácter inválido (`/ \ : * ? " < > |` sustituido por `-`) y el caso límite de nombre de cliente vacío tras sanear, que debe seguir siendo distinguible gracias al número de presupuesto (research.md §4; Assumptions de spec.md; quickstart.md § Notas para pruebas automatizadas)
- [ ] T014 [US3] En `src/exportacion/exportarTodo.js`, ceder el hilo principal entre la generación de cada PDF (micro-espera `await`) y mantener un contador reactivo expuesto a la vista con el progreso ("X de Y"), sin Web Workers (research.md §3; FR-011)
- [ ] T015 [US3] En `src/views/PresupuestosListView.vue`, mostrar una indicación visible de progreso ("Generando X de Y…") ligada al contador reactivo de T014 mientras dura la exportación, especialmente perceptible con volumen alto (FR-011; SC-005)

**Checkpoint**: Las tres historias deben funcionar de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de extremo a extremo

- [ ] T016 Ejecutar manualmente los 5 escenarios de `quickstart.md` (copia completa, fallo puntual de un presupuesto, sin presupuestos, cliente con caracteres especiales, volumen alto) y confirmar que cada uno se comporta como se describe

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede empezar inmediatamente
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las historias de usuario
- **User Story 1 (Phase 3)**: Depende de Foundational — sin dependencias de otras historias
- **User Story 2 (Phase 4)**: Depende de Foundational; se apoya en el botón de exportación creado en T010 (US1) para insertar la comprobación temprana, por lo que se implementa después de la Historia 1 en la práctica aunque es conceptualmente independiente
- **User Story 3 (Phase 5)**: Depende de Foundational y de `exportarTodo.js` creado en la Historia 1 (T007/T008), sobre el que añade cesión de hilo, contador y refina el saneado ya creado en T006
- **Polish (Phase 6)**: Depende de que las historias deseadas estén completas

### Within Each User Story

- Historia 1: orquestación (T007→T008) antes que UI (T010→T011); el test T009 puede ir en paralelo una vez decidida la forma de T008
- Historia 2: tarea única, depende de T007/T010 ya existentes
- Historia 3: tests (T013) en paralelo; implementación de progreso (T014) antes que su UI (T015)

### Parallel Opportunities

- T002, T004, T005, T006 (Foundational) pueden ejecutarse en paralelo — ficheros distintos, sin dependencias entre sí
- T009 (test) puede ejecutarse en paralelo a T010/T011 (US1) — fichero distinto
- T013 (test) puede ejecutarse en paralelo al resto de la Historia 3

---

## Parallel Example: Foundational

```bash
Task: "Crear backend/rutas/exportacion.js con GET /api/exportacion"
Task: "Refactorizar src/pdf/generarPdfPresupuesto.js separando construcción y guardado"
Task: "Crear src/storage/exportacion.js con getDatosExportacion()"
Task: "Crear src/exportacion/nombreArchivo.js con sanitizarNombreArchivo(texto)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todas las historias)
3. Completar Phase 3: User Story 1
4. **PARAR y VALIDAR**: probar la Historia 1 de forma independiente (Escenario 1 de quickstart.md)
5. Desplegar/mostrar si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. Añadir Historia 1 → probar de forma independiente → MVP
3. Añadir Historia 2 → probar de forma independiente
4. Añadir Historia 3 → probar de forma independiente
5. Cada historia añade valor sin romper las anteriores

## Notes

- [P] = ficheros distintos, sin dependencias
- [Story] mapea cada tarea a su historia de usuario para trazabilidad
- Verificar cada checkpoint antes de continuar a la siguiente fase
- Evitar alcance no pedido: no tocar el catálogo de clientes ni introducir Web Workers, paginación o librerías adicionales no mencionadas en `research.md`
