# Implementation Plan: PresupuestosPro v0

**Branch**: `001-presupuestos-freelance` | **Date**: 2026-09-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-presupuestos-freelance/spec.md`

## Summary

PresupuestosPro v0 permite a un freelancer configurar su perfil, mantener
catálogos reutilizables de servicios y clientes, crear presupuestos con
cálculo automático de IVA e IRPF, y descargarlos en PDF con numeración
correlativa por año. **Enfoque técnico**: una aplicación web de una sola
página que corre entera en el navegador del freelancer — sin servidor
propio, sin base de datos en la nube y sin cuentas de usuario — con los
datos guardados en el propio navegador y el PDF generado también ahí. Esto
permite publicarla como un sitio web estático (sin backend que desplegar ni
mantener) y que funcione igual de bien en móvil que en escritorio, que son
las dos condiciones que ha puesto el negocio para esta v1. El detalle de
cada decisión, explicado en lenguaje de negocio, está en
[research.md](./research.md).

## Technical Context

**Language/Version**: JavaScript moderno (ES2022+), sin TypeScript — se
prioriza no añadir un paso de compilación de tipos que esta v1 no necesita.

**Primary Dependencies**: Vue 3 + Vue Router (pantallas y navegación), Vite
(construcción y servidor de desarrollo), jsPDF + jspdf-autotable
(generación del PDF en el navegador). Ver justificación de cada una en
[research.md](./research.md) (Decisiones 3, 5 y 6).

**Storage**: `localStorage` del navegador del freelancer, en formato JSON;
sin base de datos ni servidor propio. Esquema detallado en
[contracts/storage-schema.md](./contracts/storage-schema.md).

**Testing**: Vitest, para la lógica de cálculo de impuestos y de
numeración de presupuestos (la parte con más riesgo de error económico
real). La comprobación funcional de cada historia de usuario se hace
manualmente contra la aplicación, siguiendo [quickstart.md](./quickstart.md).

**Target Platform**: navegador web moderno, en escritorio y en móvil
(diseño mobile-first con CSS responsive, sin librería de estilos externa).

**Project Type**: aplicación web de una sola página, "frontend-only" (sin
backend).

**Performance Goals**: recálculo de importes (base, IVA, retención, total)
visible en pantalla de forma inmediata (percibido como instantáneo) al
cambiar cualquier línea, la retención o el tipo de cliente — sin recargar
la página (SC-006). Sin objetivos de carga concurrente: es una aplicación
de un único usuario por instalación.

**Constraints**: debe poder publicarse como sitio estático (sin servidor de
aplicación) en cualquier alojamiento web estático; debe funcionar sin
cuentas de usuario; sin sincronización entre dispositivos ni con la nube en
esta versión (asunción explícita de la spec).

**Scale/Scope**: un único freelancer por instalación/navegador; volumen de
datos esperado (perfil, catálogo, clientes, presupuestos de uso normal de
un freelancer) muy por debajo de los límites de `localStorage`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento | Nota |
|---|---|---|
| I. Simplicidad ante todo | ✅ PASS | Sin servidor, sin base de datos, sin autenticación, sin infraestructura que la spec no pida. Un único proyecto frontend. |
| II. Idioma y mercado | ✅ PASS | Interfaz, mensajes y PDF en español de España; todos los importes en € con formato español (coma decimal). |
| III. Cero alcance fantasma | ✅ PASS | Este plan cubre exactamente las 4 historias de usuario de la spec; no se añade gestión de estados de presupuesto, descuentos, multi-moneda ni multiusuario (todo eso está fuera de alcance en la spec). |
| IV. Verificable por una persona no técnica | ✅ PASS | Cada historia tiene su escenario de comprobación manual en [quickstart.md](./quickstart.md), usando la aplicación, sin leer código ni consultar almacenamiento. |
| V. Datos del usuario con respeto | ✅ PASS | Solo se piden los datos de perfil, cliente y línea que la spec pide explícitamente. No hay backend ni claves/secretos que gestionar: no hay ningún servicio externo al que llamar. |

**Restricciones del Producto** (constitution): plataforma web ✅, salida en
PDF ✅, usuario freelancers ✅ — todas se cumplen sin desviación.

No hay violaciones que justificar → no aplica la tabla de Complexity
Tracking.

*(Re-evaluado después del Phase 1: sigue sin haber violaciones — ver
sección "Constitution Check (post-diseño)" más abajo.)*

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-freelance/
├── plan.md              # este documento
├── research.md          # Phase 0: decisiones técnicas explicadas en lenguaje de negocio
├── data-model.md         # Phase 1: entidades, campos, reglas y fórmulas de cálculo
├── quickstart.md         # Phase 1: guía de validación manual, historia por historia
├── contracts/
│   ├── storage-schema.md # Phase 1: esquema de localStorage (el único "backend" que hay)
│   └── pdf-contract.md   # Phase 1: contenido obligatorio del PDF generado
└── tasks.md               # Phase 2 (lo genera /speckit-tasks, no este comando)
```

### Source Code (repository root)

```text
src/
├── main.js              # arranque de la app Vue
├── App.vue
├── router.js             # rutas en modo hash: #/perfil, #/servicios, #/clientes, #/presupuestos, #/presupuestos/:id
├── storage/              # capa de lectura/escritura de localStorage (implementa contracts/storage-schema.md)
│   ├── perfil.js
│   ├── servicios.js
│   ├── clientes.js
│   └── presupuestos.js
├── calculo/              # lógica pura de cálculo: base, IVA, retención, total, redondeo, numeración anual
│   ├── importes.js
│   └── numeracion.js
├── pdf/                  # generación del PDF (jsPDF + jspdf-autotable), implementa contracts/pdf-contract.md
│   └── generarPdfPresupuesto.js
├── views/                # una pantalla por historia de usuario
│   ├── PerfilView.vue
│   ├── ServiciosView.vue
│   ├── ClientesView.vue
│   ├── PresupuestosListView.vue
│   └── PresupuestoDetalleView.vue
├── components/            # piezas reutilizables entre pantallas (formulario de línea, tabla de importes, etc.)
└── assets/                # CSS base mobile-first, logo/iconos propios de la app

tests/
└── unit/
    ├── importes.test.js    # casos de la Historia 2 (incluye el ejemplo 2.120,00 €) y de redondeo (FR-020)
    └── numeracion.test.js  # correlativo por año y reinicio en año nuevo (FR-012)

public/
└── index.html             # servido por Vite; no hay backend que renderice nada
```

**Structure Decision**: proyecto único, solo frontend (no hay carpeta
`backend/`: no existe backend en esta v1 — ver Decisión 1 de research.md).
Todo el código vive bajo `src/`, se compila con `vite build` a una carpeta
`dist/` de ficheros estáticos, y esa carpeta es literalmente lo que se
publica online.

## Constitution Check (post-diseño)

Tras diseñar el modelo de datos y los contratos (Phase 1), se repasa de
nuevo:

- El esquema de `localStorage` ([contracts/storage-schema.md](./contracts/storage-schema.md))
  no introduce ningún dato que la spec no pida (Principio III, V).
- El contrato del PDF ([contracts/pdf-contract.md](./contracts/pdf-contract.md))
  reproduce exactamente el contenido exigido por FR-015, ni más ni menos.
- Ninguna decisión de diseño obliga a introducir servidor, base de datos
  en la nube o cuentas de usuario (Principio I y restricciones del
  encargo). **Sigue sin haber violaciones.**

## Complexity Tracking

*No aplica: no hay violaciones de la Constitution Check que justificar.*
