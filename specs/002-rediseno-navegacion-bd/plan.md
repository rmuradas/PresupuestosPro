# Implementation Plan: Rediseño visual, página de inicio y persistencia en base de datos

**Branch**: `002-rediseno-navegacion-bd` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-rediseno-navegacion-bd/spec.md`

## Summary

PresupuestosPro pasa de ser una aplicación 100% de navegador (datos en
`localStorage`, sin servidor) a una aplicación cliente-servidor sencilla:
un backend Node.js con una base de datos SQLite en fichero sustituye al
`localStorage` como almacén de datos, exponiendo una API JSON (nunca
parámetros en la URL para los datos) que el frontend Vue ya existente
consume. Ese mismo servidor sirve también los ficheros estáticos de la
SPA, de modo que acceder a su raíz (`/`) carga una nueva página de Inicio
con accesos a las cuatro secciones y un resumen de presupuestos por
estado; una barra de navegación común (ya no solo la cabecera actual)
queda visible en todas las pantallas. Se añade un campo `estado` al
presupuesto (Borrador/Enviado/Aceptado/Rechazado, con Caducado calculado)
para poder distinguirlo visualmente. Todo el sistema visual (colores,
tipografía, espaciado) se centraliza en variables CSS en
`public/css/estilos.css`, de donde también lee sus colores la generación
del PDF, para que pantalla y PDF compartan exactamente la misma imagen.
**Ni la lógica de cálculo de impuestos, ni el esquema de datos de 001
(salvo la incorporación aditiva del estado), cambian.** El detalle de cada
decisión técnica, en lenguaje de negocio, está en
[research.md](./research.md).

## Technical Context

**Language/Version**: JavaScript moderno (ES2022+) en todo el proyecto,
sin TypeScript — igual que en 001, y ahora también en el backend nuevo
(Node.js LTS ≥ 20), para no introducir un segundo lenguaje ni un paso de
compilación de tipos.

**Primary Dependencies**:
- Frontend (sin cambios respecto a 001): Vue 3 + Vue Router, Vite, jsPDF +
  jspdf-autotable.
- Backend (nuevo): Express (servidor HTTP y API JSON) + `better-sqlite3`
  (base de datos embebida en un único fichero, sin servidor de base de
  datos externo). Justificación de ambas en [research.md](./research.md)
  (Decisiones 1 y 2).

**Storage**: SQLite en un fichero local gestionado por el backend
(`backend/data/presupuestospro.db`), en vez de `localStorage` del
navegador. Esquema completo en [data-model.md](./data-model.md) y
[contracts/api-contract.md](./contracts/api-contract.md).

**Testing**: Vitest (ya usado en 001), ampliado para cubrir también la
nueva función pura de cálculo del "estado efectivo" (Caducado) y los
endpoints del backend (con una base de datos SQLite temporal por test).
La comprobación funcional de cada historia sigue haciéndose a mano contra
la aplicación, siguiendo [quickstart.md](./quickstart.md).

**Target Platform**: navegador web moderno (frontend, sin cambios,
mobile-first) + un proceso Node.js que hace de servidor: sirve tanto los
ficheros estáticos de la SPA como la API JSON bajo `/api/*`.

**Project Type**: aplicación web frontend + backend (a diferencia de 001,
que era "frontend-only"; ver Decisión 1 de research.md).

**Performance Goals**: el recálculo de importes en pantalla (base, IVA,
retención, total) sigue siendo instantáneo y sin llamada de red (no
cambia: sigue siendo lógica pura en el navegador). Las llamadas a la API
para leer/guardar datos deben resolverse en un tiempo imperceptible para
un único freelancer trabajando en local; no hay objetivo de concurrencia
ni de usuarios simultáneos.

**Constraints**:
- Debe seguir funcionando sin cuentas de usuario ni control de acceso.
- El servidor y la base de datos forman parte de la misma instalación del
  freelancer (no se añade hosting en la nube ni sincronización
  multi-dispositivo real — ver Assumptions de la spec).
- Toda comunicación entre frontend y backend que transporte datos MUST
  hacerlo en el cuerpo de la petición/respuesta en formato JSON, nunca
  como parámetros de query string. Los identificadores de recurso en la
  ruta (p. ej. `/api/presupuestos/:id`) sí son válidos: identifican
  *cuál* recurso, no transportan los datos en sí (convención REST
  estándar, no entra en conflicto con la restricción de la spec).
- El enfoque mobile-first y los textos en español de España no cambian.

**Scale/Scope**: mismo alcance que 001 (un único freelancer por
instalación), con el añadido del campo `estado` en cada presupuesto.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento | Nota |
|---|---|---|
| I. Simplicidad ante todo | ⚠️ PASS con justificación | Se introduce servidor + base de datos, que 001 explícitamente evitaba. Es un cambio de complejidad real, pero lo pide la propia spec 002 (FR-001 a FR-003) para resolver un problema de hoy (pérdida de datos al depender solo del navegador). Se elige la opción más simple posible que lo cumple: un único proceso Node + SQLite en fichero, sin ORM, sin cola de mensajes, sin autenticación, sin infraestructura en la nube. Ver Complexity Tracking. |
| II. Idioma y mercado | ✅ PASS | Interfaz, mensajes, nueva página de Inicio y PDF siguen en español de España; importes en € con formato español. Sin cambios. |
| III. Cero alcance fantasma | ✅ PASS | Este plan cubre exactamente las 3 historias de la spec 002 (persistencia, inicio/navegación, rediseño visual + estado). No se añaden cuentas de usuario, sincronización en la nube, envío real de email, borrado de presupuestos ni ninguna función no pedida. |
| IV. Verificable por una persona no técnica | ✅ PASS | Cada historia tiene su escenario de comprobación manual en [quickstart.md](./quickstart.md), usando la aplicación (crear datos, cerrar/reabrir, navegar, mirar colores), sin leer código ni consultar la base de datos directamente. |
| V. Datos del usuario con respeto | ✅ PASS | No se piden datos nuevos aparte del `estado` del presupuesto (que no es un dato personal). El fichero de base de datos vive localmente, sin credenciales ni claves de terceros en el código; no hay ningún servicio externo al que llamar. |

**Restricciones del Producto** (constitution): plataforma web ✅, salida en
PDF ✅ (con el mismo contenido, solo cambia su imagen visual), usuario
freelancers ✅ — todas se cumplen sin desviación.

Hay una violación a justificar (Principio I) → ver tabla de Complexity
Tracking al final de este documento.

*(Re-evaluado después del Phase 1: ver sección "Constitution Check
(post-diseño)" más abajo.)*

## Project Structure

### Documentation (this feature)

```text
specs/002-rediseno-navegacion-bd/
├── plan.md                        # este documento
├── research.md                    # Phase 0: decisiones técnicas explicadas en lenguaje de negocio
├── data-model.md                  # Phase 1: entidades, tablas de la base de datos y estado efectivo
├── quickstart.md                  # Phase 1: guía de validación manual, historia por historia
├── contracts/
│   ├── api-contract.md            # Phase 1: endpoints JSON del backend (persistencia, estado, resumen, migración)
│   ├── css-tokens-contract.md     # Phase 1: variables CSS del sistema visual único
│   └── pdf-contract-visual.md     # Phase 1: cómo el PDF reutiliza el mismo sistema visual (complementa el contrato de contenido de 001)
└── tasks.md                       # Phase 2 (lo genera /speckit-tasks, no este comando)
```

### Source Code (repository root)

```text
backend/                     # NUEVO: servidor Node.js (API JSON + estáticos de la SPA)
├── server.js                 # arranque de Express, monta /api/* y sirve dist/ como estáticos
├── db/
│   ├── conexion.js           # apertura del fichero SQLite y creación de tablas si no existen
│   └── migraciones.sql       # sentencias CREATE TABLE (ver data-model.md)
├── rutas/                     # un router Express por entidad, implementa contracts/api-contract.md
│   ├── perfil.js
│   ├── servicios.js
│   ├── clientes.js
│   ├── presupuestos.js       # incluye la numeración anual (misma regla de calculo/numeracion.js, ahora aquí)
│   └── migracion.js          # importación única de datos antiguos de localStorage (FR-002)
├── estado/
│   └── estadoEfectivo.js     # función pura: calcula Caducado a partir de fechaValidez + estado guardado
└── data/                      # carpeta del fichero .db (no versionado, ver .gitignore)

src/                          # frontend Vue, mismo proyecto que en 001
├── main.js                   # ya no importa assets/base.css (retirado, ver public/css/estilos.css)
├── App.vue                    # ahora monta <NavBar /> en vez del <header> ad hoc
├── router.js                  # "/" pasa a mostrar InicioView (ya no redirige a /perfil)
├── storage/                   # MISMA interfaz pública que en 001, implementación cambia a fetch() con JSON
│   ├── perfil.js
│   ├── servicios.js
│   ├── clientes.js
│   ├── presupuestos.js       # + cambiarEstadoPresupuesto(id, estado)
│   ├── resumenActividad.js   # NUEVO: lee /api/resumen-actividad
│   └── migracionLegado.js    # NUEVO: detecta datos viejos en localStorage y los envía una vez a /api/migracion
├── calculo/                   # SIN CAMBIOS: base, IVA, retención, total, redondeo, numeración (lógica pura)
│   ├── importes.js
│   └── numeracion.js
├── pdf/
│   └── generarPdfPresupuesto.js  # lee los colores desde las variables CSS (getComputedStyle) en vez de tenerlos hardcodeados
├── views/
│   ├── InicioView.vue         # NUEVO: página de inicio (accesos + resumen de actividad)
│   ├── PerfilView.vue
│   ├── ServiciosView.vue
│   ├── ClientesView.vue
│   ├── PresupuestosListView.vue   # ahora muestra el estado de cada presupuesto (EstadoBadge)
│   └── PresupuestoDetalleView.vue # + selector de estado (FR-010)
├── components/
│   ├── NavBar.vue             # NUEVO: navegación común visible en todas las pantallas
│   ├── EstadoBadge.vue        # NUEVO: etiqueta de color + texto para un estado de presupuesto
│   ├── LineaForm.vue
│   └── LogoUploader.vue
└── assets/                     # se retira base.css (sustituido por public/css/estilos.css)

tests/
├── unit/                       # frontend, sin cambios de ubicación
│   ├── importes.test.js
│   └── numeracion.test.js      # sigue probando la regla; ahora también se prueba desde backend/rutas/presupuestos.js
└── backend/                    # NUEVO
    ├── estadoEfectivo.test.js  # Borrador/Enviado que caducan, Aceptado/Rechazado que no caducan nunca
    └── presupuestos.test.js    # numeración correlativa y reinicio anual contra una base de datos temporal

public/
├── index.html                  # enlaza <link rel="stylesheet" href="/css/estilos.css">
└── css/
    └── estilos.css             # NUEVO: único lugar con la paleta, tipografía y espaciado de toda la app
```

**Structure Decision**: proyecto dividido en dos partes ("Option 2: Web
application" del template) — `backend/` (nuevo) y el `src/` de siempre
(frontend). El frontend se sigue compilando con `vite build` a `dist/`;
el backend sirve esa carpeta como estáticos y expone `/api/*`. La
navegación del frontend sigue en modo hash (`createWebHashHistory`, sin
cambios) precisamente para que el backend no tenga que implementar
ningún enrutado de "fallback" adicional: solo necesita servir `dist/` y
responder a `/api/*` (ver Decisión 4 de research.md).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Servidor Node.js + base de datos SQLite (antes: cero backend) | La propia especificación 002 exige explícitamente persistir los datos en una base de datos gestionada por la aplicación y servir la página desde la raíz de un servidor, con una API JSON (FR-001 a FR-004, Assumptions) — sustituye al `localStorage`, que la spec 001 usaba pero que esta feature pide dejar de usar como único almacén. | Seguir solo con `localStorage` (alternativa de 001) fue rechazada explícitamente por quien pide la feature: no resuelve la pérdida de datos al borrar el navegador ni permite acceder desde otro dispositivo, que es exactamente el problema que FR-001/FR-002 piden resolver. Dentro de "tener que añadir un backend", SQLite en fichero es la opción más simple posible (frente a Postgres/MySQL, que exigirían un servidor de base de datos aparte para un único usuario). |

## Constitution Check (post-diseño)

Tras diseñar el modelo de datos y los contratos (Phase 1), se repasa de
nuevo:

- El esquema de la base de datos ([data-model.md](./data-model.md)) es un
  reflejo directo de las entidades ya definidas en 001, más el único campo
  nuevo (`estado` del presupuesto) que la propia spec 002 pide para poder
  distinguirlo visualmente (Principio III, V): no se ha colado ningún
  campo ni tabla adicional no pedido.
- El contrato de API ([contracts/api-contract.md](./contracts/api-contract.md))
  no expone más operaciones que las necesarias para las tres historias de
  la spec (leer/guardar perfil, catálogo, clientes y presupuestos; cambiar
  estado; consultar el resumen de actividad; migrar datos antiguos una
  vez). No hay endpoints de autenticación, borrado de presupuestos ni
  ninguna otra función no pedida.
- El contrato visual ([contracts/css-tokens-contract.md](./contracts/css-tokens-contract.md))
  centraliza la paleta y tipografía en un único fichero, tal y como pide
  FR-014, y el PDF la reutiliza en vez de definir sus propios colores
  (contracts/pdf-contract-visual.md), cumpliendo FR-017 sin duplicar la
  fuente de verdad.
- Ninguna decisión de diseño introduce cuentas de usuario, sincronización
  en la nube entre dispositivos, ni cambia la lógica de cálculo de
  impuestos o el resto del esquema de datos de 001 (Principio I, III).
  **Sigue habiendo una única violación justificada** (backend + base de
  datos), ya registrada arriba; no hay violaciones nuevas.
