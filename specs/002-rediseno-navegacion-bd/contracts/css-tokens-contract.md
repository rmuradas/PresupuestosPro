# Contrato del sistema visual (`public/css/estilos.css`)

**Por qué existe este contrato**: fija cuáles son las variables CSS que
forman el "único lugar" de la paleta de colores, la tipografía y el
espaciado (FR-014), para que cualquier pantalla nueva o cambio futuro se
apoye en ellas en vez de introducir valores sueltos. También es lo que
lee el PDF para compartir la misma imagen (FR-017, ver Decisión 8 de
research.md).

## Ubicación

Un único fichero: `public/css/estilos.css`, enlazado desde `index.html`
con `<link rel="stylesheet" href="/css/estilos.css">`. Ningún componente
Vue define su propio color, tamaño de fuente o color de fondo suelto:
todos usan `var(--...)`.

## Variables obligatorias

### Paleta de colores (limitada, Principio "profesional y sobria")

| Variable | Uso |
|---|---|
| `--color-primario` | acciones principales, enlaces activos, cabecera de la navegación común |
| `--color-primario-hover` | estado "hover"/pulsado de acciones principales |
| `--color-texto` | texto principal sobre fondo claro |
| `--color-texto-secundario` | texto de apoyo (etiquetas, ayudas) |
| `--color-fondo` | fondo general de la aplicación |
| `--color-superficie` | fondo de tarjetas, formularios y tablas |
| `--color-borde` | bordes de tablas, inputs y separadores |
| `--color-error` | avisos y validaciones (p. ej. línea con importe ≤ 0) |

### Estados del presupuesto (FR-016)

Cada estado efectivo tiene un color y una etiqueta de texto fijos,
consistentes en toda la aplicación:

| Variable de color | Estado | Etiqueta de texto (español) |
|---|---|---|
| `--color-estado-borrador` | `borrador` | "Borrador" |
| `--color-estado-enviado` | `enviado` | "Enviado" |
| `--color-estado-aceptado` | `aceptado` | "Aceptado" |
| `--color-estado-rechazado` | `rechazado` | "Rechazado" |
| `--color-estado-caducado` | `caducado` | "Caducado" |

El componente `EstadoBadge.vue` (ver plan.md) es el único punto del
frontend que traduce un valor de estado a su color + etiqueta, leyendo
estas variables — así, si la paleta cambia, solo hay que tocar este
fichero.

### Tipografía

| Variable | Uso |
|---|---|
| `--fuente-base` | familia tipográfica de toda la aplicación (texto, formularios, tablas) |
| `--fuente-tamano-base` | tamaño de texto de párrafo |
| `--fuente-tamano-titulo-1` | títulos de página (p. ej. "Presupuestos") |
| `--fuente-tamano-titulo-2` | subtítulos de sección |
| `--fuente-peso-normal` / `--fuente-peso-negrita` | pesos usados para jerarquía (p. ej. totales en negrita) |

### Espaciado (uniforme, FR-015)

| Variable | Uso |
|---|---|
| `--espacio-1` … `--espacio-6` | escala de espaciado (márgenes, padding, separación entre campos de formulario) usada en vez de valores sueltos como `12px` o `1.3rem` |
| `--radio-borde` | redondeo uniforme de botones, tarjetas e inputs |

## Regla del contrato

Cualquier nuevo color, tamaño de fuente o medida de espaciado que necesite
una pantalla **MUST** añadirse como variable nueva en este fichero, nunca
como valor suelto dentro de un componente. Esto es lo que garantiza
FR-014 y SC-004 (misma paleta y tipografía verificable por comparación
visual directa entre pantallas).
