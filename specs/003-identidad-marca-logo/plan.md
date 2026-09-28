# Implementation Plan: Identidad de marca con logotipo y nueva paleta visual

**Branch**: `003-identidad-marca-logo` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-identidad-marca-logo/spec.md`

## Summary

Esta feature no toca ni el backend Node.js ni el esquema de datos de 001/002:
es un cambio puramente de presentación sobre la aplicación web-cliente +
servidor ya existente. Se incorpora el logotipo de marca ya disponible en
el repositorio (`assets/brand/logo-rm.svg` / `.png`) copiándolo a
`public/img/`, para poder mostrarlo en dos tamaños con animación de giro
CSS (grande y continuo en la página de Inicio; pequeño y solo al pasar el
ratón en la navegación común, donde además actúa como enlace a Inicio). Se
sustituye la paleta de colores general de `public/css/estilos.css` por una
derivada de los colores del logotipo, manteniendo los cinco estados del
presupuesto distinguibles mediante una mezcla de tonos de marca (Borrador,
Enviado, Aceptado) y colores semánticos ajenos a la marca (Rechazado,
Caducado), según quedó decidido en la sesión de clarificación de la spec.
El mismo logotipo (versión estática, en PNG) se añade a
`src/pdf/generarPdfPresupuesto.js` — la generación real de PDF en este
proyecto (con jsPDF, no una plantilla HTML) — sin sustituir ni desplazar el
logo propio que el freelancer ya sube en su perfil. No se añade ninguna
dependencia nueva: el giro es CSS puro (`@keyframes` + `prefers-reduced-
motion`) y el PDF sigue leyendo colores de las variables CSS con
`getComputedStyle`, igual que en 002. El detalle de cada decisión técnica,
en lenguaje de negocio, está en [research.md](./research.md).

## Technical Context

**Language/Version**: JavaScript moderno (ES2022+), Vue 3 (SFC con
`<script setup>`), sin TypeScript — sin cambios respecto a 001/002.

**Primary Dependencies**: ninguna dependencia nueva. Se reutilizan las ya
existentes: Vue 3 + Vue Router (frontend), jsPDF + `jspdf-autotable`
(generación de PDF). La animación de giro del logotipo se implementa con
CSS puro (`@keyframes` + media query `prefers-reduced-motion`), sin
librería de animación.

**Storage**: N/A — sin cambios en el modelo de datos ni en la base de
datos SQLite de 002 (ver [data-model.md](./data-model.md)).

**Testing**: Vitest sigue siendo el framework del proyecto, pero esta
feature no introduce ninguna función de negocio nueva que probar de forma
automática (es un cambio de presentación puro). La verificación es manual,
historia por historia, siguiendo [quickstart.md](./quickstart.md) — así lo
exige el Principio IV de la constitution.

**Target Platform**: navegador web moderno, mismo enfoque mobile-first que
001/002. El backend Node.js (`backend/`) no se modifica: sigue sirviendo
`dist/` como estáticos y `/api/*` exactamente igual.

**Project Type**: aplicación web frontend + backend ya existente (sin
cambio de tipo de proyecto); esta feature solo afecta a la capa de
presentación del frontend y a la generación del PDF.

**Performance Goals**: la animación de giro MUST usar únicamente
`transform: rotate(...)` (acelerado por composición, sin forzar layout ni
repintado de toda la página), tanto en el logotipo grande de Inicio como
en el pequeño de la navegación, para que no introduzca lentitud percibida
en ninguna pantalla ni en dispositivos modestos.

**Constraints**:
- Sin cambios en backend, API, esquema de datos ni lógica de negocio
  (cálculos, numeración, estado efectivo): éstos permanecen exactamente
  como en 002.
- Alcance de ficheros acordado con el usuario (ver aclaraciones de esta
  sesión de planificación, resueltas antes de escribir este documento):
  el encargo original limitaba los cambios a `public/` y a "la plantilla
  del PDF (`src/services/plantillas/presupuesto.html`)", pero ese fichero
  no existe en este proyecto — el PDF se genera con jsPDF en
  `src/pdf/generarPdfPresupuesto.js` (ver plan.md de 002). Se acordó
  interpretar la restricción como "solo capa de presentación": el sistema
  visual centralizado (`public/css/estilos.css`), los ficheros de imagen
  del logotipo (copiados a `public/img/`), el módulo real de generación
  del PDF, y los dos componentes Vue estrictamente necesarios para insertar
  el logotipo (`src/views/InicioView.vue` y `src/components/NavBar.vue`).
  Ningún otro fichero de `src/` se toca.
- Sin dependencias nuevas: ni de animación (CSS puro) ni de manipulación de
  SVG en el PDF (se usa el PNG del logotipo, porque jsPDF `addImage` no
  soporta SVG sin un plugin adicional).
- Se mantiene el enfoque mobile-first y todos los textos en español de
  España, sin excepción.

**Scale/Scope**: mismo alcance que 002 (instalación de un único
freelancer); esta feature no lo amplía ni lo reduce.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento | Nota |
|---|---|---|
| I. Simplicidad ante todo | ✅ PASS | No se añade backend, base de datos ni dependencia nueva. El giro es CSS puro; los nuevos colores de estado son solo valores añadidos al mismo fichero de variables que ya centralizaba la paleta desde 002. |
| II. Idioma y mercado | ✅ PASS | Sin cambios de idioma (español de España) ni de moneda (€). |
| III. Cero alcance fantasma | ✅ PASS | El plan cubre exactamente las 4 historias de la spec 003 (logo grande en Inicio, logo pequeño + enlace en la navegación, nueva paleta, logo en el PDF). No se anima nada más, no se cambia el contenido ni el orden del PDF (solo se añade el logotipo, ver contrato de 001 vigente), y no se toca `backend/`. |
| IV. Verificable por una persona no técnica | ✅ PASS | Cada historia se comprueba mirando la aplicación: el logo grande gira en Inicio, el logo pequeño gira al pasar el ratón y lleva a Inicio al pulsarlo, los colores de toda la app y del PDF coinciden a simple vista (ver [quickstart.md](./quickstart.md)). |
| V. Datos del usuario con respeto | ✅ PASS | No se piden datos nuevos al freelancer. Los ficheros de imagen del logotipo son estáticos, no contienen secretos ni datos personales. |

**Restricciones del Producto** (constitution): plataforma web ✅, salida en
PDF ✅ (mismo contenido, solo se añade el logotipo de marca sin tocar el
resto), usuario freelancers ✅ — todas se cumplen sin desviación.

Sin violaciones → no aplica Complexity Tracking.

*(Re-evaluado después del Phase 1: ver sección "Constitution Check
(post-diseño)" al final de este documento.)*

## Project Structure

### Documentation (this feature)

```text
specs/003-identidad-marca-logo/
├── plan.md                        # este documento
├── research.md                    # Phase 0: decisiones técnicas explicadas en lenguaje de negocio
├── data-model.md                  # Phase 1: confirma que no hay cambios de datos; documenta los tokens de diseño nuevos
├── quickstart.md                  # Phase 1: guía de validación manual, historia por historia
├── contracts/
│   ├── design-tokens-contract.md  # Phase 1: ampliación del contrato de variables CSS de 002 con la paleta y el logotipo
│   └── pdf-visual-contract.md     # Phase 1: cómo y dónde se añade el logotipo al PDF, sin romper el contrato de contenido de 001
└── tasks.md                       # Phase 2 (lo genera /speckit-tasks, no este comando)
```

### Source Code (repository root)

```text
assets/brand/                  # SIN CAMBIOS: origen del logotipo ya versionado en el repo
├── logo-rm.svg
└── logo-rm.png

backend/                       # SIN CAMBIOS: ningún fichero de esta carpeta se toca

src/
├── views/
│   └── InicioView.vue          # + <img> del logotipo grande con animación de giro continua (FR-001, FR-002)
├── components/
│   └── NavBar.vue              # + logotipo pequeño envuelto en <router-link to="/">, con aria-label "Ir a Inicio" (FR-004, FR-018, FR-019)
├── pdf/
│   └── generarPdfPresupuesto.js  # + doc.addImage() del logotipo de marca en PNG, en pie de página (FR-008, FR-009)
└── (resto de src/: storage/, calculo/, router.js, App.vue, demás views y componentes) # SIN CAMBIOS

public/
├── img/                         # NUEVO: copia estática del logotipo servida directamente por Vite/Express
│   ├── logo-rm.svg              # usado en pantalla (escalable, nítido en cualquier tamaño)
│   └── logo-rm.png              # usado en el PDF (jsPDF no soporta SVG sin plugin)
└── css/
    └── estilos.css              # paleta sustituida por la derivada del logotipo + variables nuevas del logotipo (tamaño, duración del giro)

tests/                           # SIN CAMBIOS: no hay lógica de negocio nueva que cubrir con Vitest
```

**Structure Decision**: se mantiene la misma estructura frontend + backend
de 002 (backend Node.js/Express + SQLite, frontend Vue 3 servido por
Vite/`dist/`). Esta feature es una excepción deliberadamente pequeña: solo
toca `public/css/estilos.css`, los nuevos ficheros estáticos en
`public/img/`, el módulo real de generación de PDF
(`src/pdf/generarPdfPresupuesto.js`) y los dos componentes de presentación
donde la spec exige insertar el logotipo (`InicioView.vue`, `NavBar.vue`).
Ningún otro directorio del proyecto (`backend/`, `storage/`, `calculo/`,
`tests/`, el resto de `views/`) se modifica.

## Complexity Tracking

> No aplica: el Constitution Check no registra ninguna violación.

## Constitution Check (post-diseño)

Tras diseñar los tokens visuales y el contrato del PDF (Phase 1), se repasa
de nuevo:

- El contrato de tokens ([contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md))
  añade únicamente variables de color, tamaño y duración de animación al
  mismo fichero único que ya exigía FR-014 de la spec 002 — no se crea un
  segundo lugar de definición de estilos, ni se introduce ningún valor de
  color suelto fuera de `public/css/estilos.css` (Principio I).
- El contrato visual del PDF ([contracts/pdf-visual-contract.md](./contracts/pdf-visual-contract.md))
  no cambia ni una línea del contenido ya fijado por
  [specs/001-presupuestos-freelance/contracts/pdf-contract.md](../001-presupuestos-freelance/contracts/pdf-contract.md):
  solo añade el logotipo de marca como elemento visual adicional, en una
  posición que no compite con el logo del freelancer ni con el desglose de
  importes (Principio III).
- `data-model.md` confirma que no se toca ninguna tabla, columna ni regla
  de negocio de 001/002: el único artefacto nuevo son tokens de diseño, no
  datos (Principio I, V).
- Sigue sin haber ninguna violación que justificar.
