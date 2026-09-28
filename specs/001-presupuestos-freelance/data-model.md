# Data Model: PresupuestosPro v0

**Spec**: [spec.md](./spec.md) · **Decisiones técnicas**: [research.md](./research.md)

Todas las entidades se guardan en el `localStorage` del navegador (ver
Decisión 2 de research.md). No hay base de datos ni servidor: este
documento describe la forma de los datos tal y como vive en el navegador
del freelancer, y las reglas que la aplicación debe respetar al leerlos o
escribirlos. El esquema de almacenamiento exacto está en
[contracts/storage-schema.md](./contracts/storage-schema.md).

Todos los importes de dinero se representan y calculan internamente en
céntimos (enteros), no en euros con decimales (ver Decisión 4 de
research.md), para garantizar que el redondeo a 2 decimales (FR-020) sea
siempre exacto.

---

## PerfilFreelancer

Datos de marca y contacto del emisor de los presupuestos. **Existe como
mucho una instancia** por instalación/navegador (FR-001, FR-018).

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| nombre | texto | sí | no puede quedar vacío |
| nif | texto | sí | no puede quedar vacío; no se valida el formato (Clarifications) |
| contacto | texto (email y/o teléfono, dirección) | sí | no puede quedar vacío |
| logo | imagen (codificada en el propio almacenamiento) | no | formato de imagen habitual en la web (PNG/JPG) |

**Reglas de negocio**:
- Mientras no exista un `PerfilFreelancer` guardado, no se puede crear
  ningún `Presupuesto` nuevo (FR-004a); la aplicación debe guiar al
  freelancer a la pantalla de perfil.
- Guardar el perfil sobrescribe siempre la única instancia existente
  (no hay historial de versiones del perfil).

---

## Servicio (catálogo)

Plantilla reutilizable de línea de presupuesto (FR-002).

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | identificador interno | sí | generado por la aplicación |
| nombre | texto | sí | no puede quedar vacío |
| precioPorDefecto | dinero (céntimos) | sí | mayor que 0 |

**Reglas de negocio**:
- Editar o eliminar un `Servicio` **no modifica** las líneas de
  presupuestos ya creadas que se originaron a partir de él (FR-019): esas
  líneas ya tienen su propia copia de descripción y precio, independiente
  del catálogo.

---

## Cliente

Persona o entidad destinataria de un presupuesto (FR-003).

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | identificador interno | sí | generado por la aplicación |
| nombre | texto | sí | no puede quedar vacío |
| nif | texto | sí | no puede quedar vacío; no se valida el formato ni su unicidad (Clarifications) |
| contacto | texto | sí | no puede quedar vacío |
| tipo | enumerado | sí | uno de: `empresa_autonomo`, `particular` |

**Reglas de negocio**:
- El campo `tipo` determina si la retención de IRPF puede aplicarse a los
  presupuestos de ese cliente (FR-009): solo si es `empresa_autonomo`.
- Pueden existir varios clientes con el mismo NIF (sin restricción de
  unicidad).
- Editar o eliminar un `Cliente` no modifica los presupuestos ya creados
  que lo usaron (FR-019): cada `Presupuesto` guarda su propia copia de los
  datos del cliente en el momento de crearse.

---

## Presupuesto

Documento principal, con numeración correlativa por año (FR-012).

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | identificador interno | sí | generado por la aplicación |
| numero | texto, formato `AAAA-NNN` | sí | asignado automáticamente al crear el presupuesto; correlativo dentro de cada año natural, empezando en `001`; nunca cambia después de asignado (FR-016) |
| fechaEmision | fecha | sí | fecha de creación del presupuesto |
| fechaValidez | fecha | sí | calculada como `fechaEmision + 30 días`; se recalcula si cambia la fecha de emisión |
| cliente | copia de los datos de un `Cliente` en ese momento | sí | ver regla de "copia congelada" abajo |
| retencionActiva | booleano | sí | por defecto `false` |
| retencionPorcentaje | enumerado | solo si `retencionActiva` es `true` | uno de: `15`, `7` |
| lineas | lista de `LineaPresupuesto` | sí (al menos 1 para generar el PDF) | ver `LineaPresupuesto` |

**Importes calculados** (no se guardan como entrada del usuario, se derivan
siempre de `lineas`, `cliente.tipo`, `retencionActiva` y
`retencionPorcentaje` — FR-011):

| Importe | Fórmula | Redondeo |
|---|---|---|
| baseImponible | suma de (`cantidad` × `precioUnitario`) de todas las `lineas` | a 2 decimales, "0,5 hacia arriba" |
| iva | `baseImponible` × 21 % | a 2 decimales, "0,5 hacia arriba" |
| retencion | si `retencionActiva` es `true` **y** `cliente.tipo` es `empresa_autonomo`: `baseImponible` × `retencionPorcentaje` %; en cualquier otro caso: 0 | a 2 decimales, "0,5 hacia arriba" |
| total | `baseImponible` + `iva` − `retencion` | a 2 decimales, "0,5 hacia arriba" |

**Reglas de negocio**:
- **Copia congelada del cliente**: al crear el presupuesto, se copian
  `nombre`, `nif`, `contacto` y `tipo` del `Cliente` elegido dentro del
  propio `Presupuesto`. Cambios posteriores en el `Cliente` del catálogo no
  afectan a presupuestos ya creados (FR-019). Si el freelancer cambia el
  `tipo` de cliente *dentro del presupuesto* (no en el catálogo), los
  importes se recalculan al momento según la nueva regla de retención
  (Edge Case de la spec).
- Un `Presupuesto` sin ninguna `LineaPresupuesto` no puede generar PDF
  (FR-017); sí puede guardarse y editarse.
- Un `Presupuesto` permanece editable siempre, incluso después de haber
  generado su PDF una o más veces; volver a generarlo conserva el mismo
  `numero` (FR-016).
- No existe ningún campo de estado (borrador/enviado/aceptado/rechazado):
  todo `Presupuesto` guardado es igual de válido (Assumptions de la spec).

---

## LineaPresupuesto

Concepto dentro de un presupuesto (FR-005).

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | identificador interno | sí | generado por la aplicación |
| descripcion | texto | sí | no puede quedar vacío; precargado desde un `Servicio` o escrito a mano |
| cantidad | número | sí | mayor que 0 (se rechaza 0 o negativo) |
| precioUnitario | dinero (céntimos) | sí | mayor que 0 (se rechaza 0 o negativo) |
| servicioOrigenId | identificador de `Servicio`, opcional | no | solo informativo; no crea dependencia — ver "copia congelada" abajo |

**Reglas de negocio**:
- **Copia congelada del servicio**: si la línea se crea a partir de un
  `Servicio` del catálogo, `descripcion` y `precioUnitario` se copian en
  ese momento y quedan libres para editarse; no se vuelven a leer del
  catálogo después (FR-019).
- Una línea puede añadirse sin relación con ningún `Servicio` del catálogo
  (Edge Case de la spec).

---

## Contador de numeración anual

No es una entidad visible para el freelancer, pero es el mecanismo que
garantiza FR-012 y SC-003.

| Campo | Tipo | Reglas |
|---|---|---|
| año | número (AAAA) | uno por cada año natural en el que se haya creado al menos un presupuesto |
| ultimoNumeroUsado | número entero | empieza en 0; se incrementa en 1 cada vez que se crea un presupuesto nuevo en ese año |

**Reglas de negocio**:
- Al crear un `Presupuesto`, se toma el año de `fechaEmision`, se busca (o
  se crea con valor 0) su contador, se incrementa en 1, y ese valor
  (con 3 cifras, ej. `001`) forma la parte `NNN` de `numero`.
- El contador de un año nunca se decrementa ni se reutiliza, ni siquiera si
  se elimina un presupuesto (evita duplicar números dentro del mismo año).

---

## Diagrama de relaciones

```
PerfilFreelancer (única instancia)
   se usa como emisor en → Presupuesto (vía PDF, sin guardar copia aparte)

Servicio (catálogo) ── copia congelada al crear ──> LineaPresupuesto
Cliente (lista)      ── copia congelada al crear ──> Presupuesto.cliente

Presupuesto (1) ──── contiene (1..N) ────> LineaPresupuesto
```
