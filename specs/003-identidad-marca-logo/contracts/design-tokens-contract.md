# Contrato del sistema visual (ampliación para la identidad de marca)

**Por qué existe este contrato**: amplía el
[contrato de tokens de 002](../../002-rediseno-navegacion-bd/contracts/css-tokens-contract.md),
que sigue vigente en su estructura (un único fichero,
`public/css/estilos.css`, ningún color o medida suelta fuera de él). Este
documento fija los **valores nuevos** de la paleta (derivados del
logotipo) y las **variables nuevas** del propio logotipo (FR-010, FR-011,
FR-012, FR-013).

## Ubicación

Sigue siendo un único fichero: `public/css/estilos.css`. No se crea ningún
fichero de estilos adicional.

## Paleta general — nuevos valores (derivados del logotipo)

| Variable | Valor nuevo | Origen |
|---|---|---|
| `--color-primario` | `#0B3128` | Verde oscuro del fondo del logotipo |
| `--color-primario-hover` | `#082720` | Variante más oscura del anterior |
| `--color-acento` | `#2FAF7A` | Verde menta del logotipo, oscurecido para contraste sobre fondo claro. **Uso**: color del enlace activo/hover en la navegación común (`nav-comun__enlace`), sustituyendo los literales `#cbd2d9` / `rgba(255,255,255,0.12)` heredados de 002 |
| `--color-acento-secundario` | `#0E7490` | Cian del logotipo, oscurecido para contraste sobre fondo claro |
| `--color-texto` | `#16211D` | Tono oscuro neutro del logotipo (texto "R.M.") |
| `--color-texto-secundario` | `#4B5F58` | Variante media del anterior |
| `--color-fondo` | `#F4FAF7` | Blanco con matiz menta muy suave |
| `--color-superficie` | `#FFFFFF` | Sin cambios respecto a 002 |
| `--color-borde` | `#CFE3DA` | Verde grisáceo claro, coherente con la paleta nueva |
| `--color-error` | `#B91C1C` | Sin cambios respecto a 002 (semántico, fuera de la paleta de marca) |

`--color-acento` y `--color-acento-secundario` son variables **nuevas**
respecto al contrato de 002; sustituyen a cualquier uso disperso de colores
de enlace/foco no cubiertos por `--color-primario`.

## Estados del presupuesto (FR-012) — nuevos valores

Cada estado sigue teniendo exactamente un color y una etiqueta de texto
fijos (sin cambios de nombres ni de significado respecto a 002):

| Variable | Estado | Valor nuevo | Origen (ver Decisión 7 de research.md) |
|---|---|---|---|
| `--color-estado-borrador` | `borrador` | `#243330` | Derivado del logotipo (gris-verde oscuro) |
| `--color-estado-enviado` | `enviado` | `#0E7490` | Derivado del logotipo (cian oscurecido) — mismo valor que `--color-acento-secundario` |
| `--color-estado-aceptado` | `aceptado` | `#15803D` | Derivado del logotipo (verde oscurecido) |
| `--color-estado-rechazado` | `rechazado` | `#B91C1C` | **Semántico, fuera de la paleta de marca** (rojo), según Clarification de la spec |
| `--color-estado-caducado` | `caducado` | `#92400E` | **Semántico, fuera de la paleta de marca** (ámbar), según Clarification de la spec |

Todos los valores mantienen un contraste de texto blanco sobre fondo de,
al menos, 4.5:1 (WCAG AA), igual que exigía FR-030 de 002 y ahora FR-012 de
esta especificación. `EstadoBadge.vue` no cambia de implementación: sigue
siendo el único punto que traduce un estado a color + etiqueta, leyendo
estas mismas variables.

## Logotipo — variables nuevas

| Variable | Valor | Uso |
|---|---|---|
| `--logo-grande-tamano` | `clamp(96px, 30vw, 220px)` | Ancho del logotipo grande en Inicio; escala con el viewport sin desbordar en móvil (FR-016) |
| `--logo-pequeno-tamano` | `32px` | Ancho/alto del logotipo pequeño en la navegación común |
| `--logo-giro-duracion-grande` | `6s` | Duración de una vuelta completa del logotipo grande (giro continuo, FR-002) |
| `--logo-giro-duracion-pequeno` | `0.6s` | Duración del giro del logotipo pequeño al recibir hover o foco (FR-005) |

## Regla de accesibilidad de movimiento (FR-003, FR-007, FR-015 de la spec)

`public/css/estilos.css` **MUST** incluir una regla `@media
(prefers-reduced-motion: reduce)` que anule ambas animaciones de giro
(grande y pequeño), mostrando el logotipo estático sin excepción, tal como
se fijó en la sesión de `/speckit-clarify`.

## Regla del contrato (sin cambios respecto a 002)

Cualquier nuevo color, tamaño o medida que necesite una pantalla **MUST**
añadirse como variable nueva en este mismo fichero, nunca como valor suelto
dentro de un componente — así se mantiene FR-010/FR-011 y SC-004
(comparación visual directa entre pantallas).
