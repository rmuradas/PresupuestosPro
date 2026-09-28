# Data Model: Rediseño visual, página de inicio y persistencia en base de datos

**Spec**: [spec.md](./spec.md) · **Decisiones técnicas**: [research.md](./research.md)

Este documento describe el mismo modelo conceptual que
[specs/001-presupuestos-freelance/data-model.md](../001-presupuestos-freelance/data-model.md),
ahora representado como tablas de una base de datos SQLite (ver Decisión 2
de research.md) en vez de claves de `localStorage`. **Ningún campo de 001
se elimina ni cambia de significado.** El único añadido es `estado` en
`Presupuesto` (y su valor efectivo `caducado`, que no se guarda). Los
importes de dinero se siguen representando en céntimos (enteros), igual
que en 001.

---

## PerfilFreelancer

Tabla `perfil` — como mucho una fila (FR-001 de 001, FR-018 de 001).

| Columna | Tipo SQL | Obligatorio | Reglas |
|---|---|---|---|
| id | INTEGER PRIMARY KEY | sí | siempre `1`: fila única, se sobrescribe (`INSERT OR REPLACE`) |
| nombre | TEXT | sí | no vacío |
| nif | TEXT | sí | no vacío; formato libre (sin cambios respecto a 001) |
| contacto | TEXT | sí | no vacío |
| logo | TEXT | no | cadena `data:` (imagen en base64), igual que en 001 |

Sin cambios de reglas de negocio respecto a 001.

---

## Servicio (catálogo)

Tabla `servicios` (FR-002 de 001).

| Columna | Tipo SQL | Obligatorio | Reglas |
|---|---|---|---|
| id | TEXT PRIMARY KEY | sí | identificador generado por la aplicación |
| nombre | TEXT | sí | no vacío |
| precio_por_defecto_centimos | INTEGER | sí | mayor que 0 |

Sin cambios de reglas de negocio respecto a 001 (editar/eliminar un
servicio no toca las líneas ya creadas a partir de él, porque esas líneas
guardan su propia copia — ver `presupuesto_lineas` más abajo).

---

## Cliente

Tabla `clientes` (FR-003 de 001).

| Columna | Tipo SQL | Obligatorio | Reglas |
|---|---|---|---|
| id | TEXT PRIMARY KEY | sí | identificador generado por la aplicación |
| nombre | TEXT | sí | no vacío |
| nif | TEXT | sí | no vacío; sin validación de formato ni unicidad (sin cambios) |
| contacto | TEXT | sí | no vacío |
| tipo | TEXT | sí | `'empresa_autonomo'` o `'particular'` |

Sin cambios de reglas de negocio respecto a 001.

---

## Presupuesto

Tabla `presupuestos` — documento principal (FR-004 a FR-021 de 001, más
FR-009 a FR-013a de 002 para el `estado`).

| Columna | Tipo SQL | Obligatorio | Reglas |
|---|---|---|---|
| id | TEXT PRIMARY KEY | sí | identificador generado por la aplicación |
| numero | TEXT | sí | formato `AAAA-NNN`; asignado por el backend al crear (ver `contador_anual`); no cambia nunca después |
| fecha_emision | TEXT (ISO 8601) | sí | fecha de creación |
| fecha_validez | TEXT (ISO 8601) | sí | `fecha_emision + 30 días` |
| cliente_nombre | TEXT | sí | copia congelada del `Cliente` en el momento de crear (igual que 001) |
| cliente_nif | TEXT | sí | copia congelada |
| cliente_contacto | TEXT | sí | copia congelada |
| cliente_tipo | TEXT | sí | copia congelada: `'empresa_autonomo'` o `'particular'` |
| retencion_activa | INTEGER (0/1) | sí | por defecto `0` |
| retencion_porcentaje | INTEGER | solo si `retencion_activa = 1` | `15` o `7` |
| **estado** | TEXT | sí | **NUEVO (spec 002)** — uno de `'borrador'` (por defecto), `'enviado'`, `'aceptado'`, `'rechazado'`. Editable libremente en cualquier momento y orden (FR-010). `'caducado'` **nunca se guarda aquí**: es un valor calculado, ver más abajo. |

Los importes calculados (`base_imponible`, `iva`, `retencion`, `total`) **no
se guardan como columnas**: se siguen derivando siempre de `lineas`,
`cliente_tipo`, `retencion_activa` y `retencion_porcentaje` con las mismas
fórmulas y el mismo redondeo de 001 (FR-011, FR-020 de 001) — sin cambios.

### Estado efectivo (calculado, no almacenado)

Cada vez que se lee un presupuesto (listado, detalle o resumen de
actividad), el backend calcula su **estado efectivo** con esta regla fija
(FR-011, FR-012 de 002):

```text
si estado guardado es 'aceptado' o 'rechazado':
    estado_efectivo = estado guardado   (nunca se sustituye por caducado)
si no, si fecha_validez < hoy:
    estado_efectivo = 'caducado'
si no:
    estado_efectivo = estado guardado   ('borrador' o 'enviado')
```

Esta es la única función nueva de negocio que introduce la feature; es
una función pura (misma entrada → misma salida), fácil de probar de forma
aislada (ver `tests/backend/estadoEfectivo.test.js` en plan.md).

**Reglas de negocio** (heredadas de 001, sin cambios):
- Copia congelada del cliente al crear el presupuesto.
- Un presupuesto sin líneas no puede generar PDF (FR-017 de 001).
- Un presupuesto permanece editable siempre; editarlo **no** cambia su
  `estado` (FR-013a de 002) ni sus importes se ven afectados por un cambio
  de `estado` (FR-013 de 002).
- Regenerar el PDF conserva el mismo `numero`.

---

## LineaPresupuesto

Tabla `presupuesto_lineas` (FR-005 de 001).

| Columna | Tipo SQL | Obligatorio | Reglas |
|---|---|---|---|
| id | TEXT PRIMARY KEY | sí | identificador generado por la aplicación |
| presupuesto_id | TEXT | sí | clave foránea a `presupuestos.id`, con borrado en cascada si se elimina el presupuesto |
| descripcion | TEXT | sí | no vacío; copia congelada de un `Servicio` o texto libre |
| cantidad | REAL | sí | mayor que 0 |
| precio_unitario_centimos | INTEGER | sí | mayor que 0 |
| servicio_origen_id | TEXT | no | solo informativo, sin restricción de integridad referencial (igual que en 001: no crea dependencia) |

Sin cambios de reglas de negocio respecto a 001.

---

## Contador de numeración anual

Tabla `contador_anual` — mecanismo interno para FR-012 de 001 (no visible
para el freelancer). En 001 vivía en `localStorage`; en 002 pasa a ser una
tabla con restricción `UNIQUE(anio)`, para que incrementar el contador sea
una operación atómica dentro de una transacción SQLite (ver Decisión 2 de
research.md) y así nunca se dupliquen números aunque lleguen dos
peticiones casi a la vez.

| Columna | Tipo SQL | Reglas |
|---|---|---|
| anio | INTEGER PRIMARY KEY | uno por cada año natural con al menos un presupuesto |
| ultimo_numero_usado | INTEGER | empieza en 0; se incrementa en 1 dentro de la misma transacción que crea el presupuesto |

Sin cambios de reglas de negocio respecto a 001 (el contador nunca se
decrementa ni se reutiliza).

---

## Resumen de actividad (vista derivada, no almacenada)

No es una tabla: es el resultado de `GET /api/resumen-actividad` (FR-006
de 002), calculado sobre la marcha contando `presupuestos` agrupados por
**estado efectivo** (no por el `estado` guardado, para que un presupuesto
caducado cuente como Caducado y no como Borrador/Enviado):

```json
{
  "borrador": 3,
  "enviado": 5,
  "aceptado": 8,
  "rechazado": 1,
  "caducado": 2
}
```

---

## Diagrama de relaciones

```
PerfilFreelancer (fila única)
   se usa como emisor en → Presupuesto (vía PDF, sin guardar copia aparte)

Servicio (catálogo) ── copia congelada al crear ──> LineaPresupuesto
Cliente (lista)      ── copia congelada al crear ──> Presupuesto (cliente_*)

Presupuesto (1) ──── contiene (1..N) ────> LineaPresupuesto
Presupuesto.estado (guardado) + Presupuesto.fecha_validez ──> estado efectivo (calculado)
Presupuesto[] ──── agrupados por estado efectivo ────> Resumen de actividad (calculado)
```
