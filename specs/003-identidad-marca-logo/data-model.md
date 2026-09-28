# Data Model: Identidad de marca con logotipo y nueva paleta visual

**Spec**: [spec.md](./spec.md) · **Decisiones técnicas**: [research.md](./research.md)

## Sin cambios en el modelo de datos

Esta feature **no** añade, elimina ni modifica ninguna entidad, tabla,
columna ni regla de negocio de las especificaciones anteriores. El modelo
de datos vigente sigue siendo exactamente el descrito en
[specs/002-rediseno-navegacion-bd/data-model.md](../002-rediseno-navegacion-bd/data-model.md)
(que a su vez extiende el de
[specs/001-presupuestos-freelance/data-model.md](../001-presupuestos-freelance/data-model.md)):
`PerfilFreelancer`, `Servicio`, `Cliente`, `Presupuesto` (con su `estado` y
estado efectivo calculado), `LineaPresupuesto`, el contador de numeración
anual y el resumen de actividad derivado. Ninguna tabla ni columna nueva se
crea; ninguna consulta ni endpoint de `backend/` cambia.

## Único artefacto nuevo: tokens de diseño (no son datos de negocio)

Esta feature introduce un conjunto de **variables CSS** (tokens de diseño)
en `public/css/estilos.css` — el mismo fichero único que ya centralizaba la
paleta desde la especificación 002 (FR-014 de 002). No son datos que se
guarden en la base de datos ni que viajen por la API: son constantes
visuales, versionadas junto con el código. Su definición completa está en
[contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md).

| Grupo | Qué describe |
|---|---|
| Paleta general | Colores de fondo, superficie, texto y acciones, derivados de los colores del logotipo de marca |
| Colores de estado del presupuesto | Uno por cada uno de los cinco estados ya definidos en 002 (sin cambiar sus nombres ni su significado), con valores nuevos: tres derivados del logotipo (Borrador, Enviado, Aceptado) y dos semánticos ajenos a la marca (Rechazado, Caducado) — ver Decisión 7 de [research.md](./research.md) |
| Logotipo | Tamaño del logotipo grande y del pequeño, y duración de la animación de giro |

## Recursos estáticos nuevos (no son datos de negocio)

| Recurso | Origen | Uso |
|---|---|---|
| `public/img/logo-rm.svg` | Copia de `assets/brand/logo-rm.svg` (ya versionado) | Logotipo en pantalla (Inicio, navegación común) |
| `public/img/logo-rm.png` | Copia de `assets/brand/logo-rm.png` (ya versionado) | Logotipo en el PDF (jsPDF no soporta SVG sin plugin) |

Estos ficheros son estáticos y no contienen datos personales ni del
freelancer (Principio V de la constitution) — son el mismo logotipo de
marca para todas las instalaciones de la aplicación.
