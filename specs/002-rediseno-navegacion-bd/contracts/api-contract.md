# Contrato de la API JSON del backend

**Por qué existe este contrato**: es la interfaz nueva entre el frontend
(Vue) y el backend (Node + SQLite) que sustituye a la lectura/escritura
directa de `localStorage` de 001. Fija qué endpoints existen y qué forma
tienen sus mensajes, para que persistencia (FR-001), estado del
presupuesto (FR-009 a FR-013a) y resumen de actividad (FR-006) se cumplan
de forma consistente. Ver decisiones en [research.md](../research.md)
(Decisiones 1, 2, 5 y 6) y las entidades completas en
[data-model.md](../data-model.md).

## Regla general de todo el contrato

**Todo dato va en el cuerpo de la petición o de la respuesta, en JSON**
(`Content-Type: application/json`). Nunca se usan parámetros de query
string para transportar datos (perfil, líneas, importes, estado, etc.),
según la restricción de la spec. Los únicos valores que aparecen en la
URL son identificadores de recurso en la propia ruta (p. ej. el `:id` de
`/api/presupuestos/:id`), que identifican *qué* recurso se pide, no
transportan datos.

Todas las respuestas de error usan el mismo formato:

```json
{ "error": "mensaje en español, entendible por el freelancer" }
```

---

## Perfil

| Método | Ruta | Cuerpo petición | Cuerpo respuesta |
|---|---|---|---|
| GET | `/api/perfil` | — | `PerfilFreelancer` o `null` si no existe todavía (FR-004a de 001) |
| PUT | `/api/perfil` | `PerfilFreelancer` (sin `id`) | `PerfilFreelancer` guardado |

## Servicios (catálogo)

| Método | Ruta | Cuerpo petición | Cuerpo respuesta |
|---|---|---|---|
| GET | `/api/servicios` | — | lista de `Servicio` |
| POST | `/api/servicios` | `{ nombre, precioPorDefecto }` | `Servicio` creado (con `id`) |
| PUT | `/api/servicios/:id` | `{ nombre, precioPorDefecto }` | `Servicio` actualizado |
| DELETE | `/api/servicios/:id` | — | `{ ok: true }` |

## Clientes

| Método | Ruta | Cuerpo petición | Cuerpo respuesta |
|---|---|---|---|
| GET | `/api/clientes` | — | lista de `Cliente` |
| POST | `/api/clientes` | `{ nombre, nif, contacto, tipo }` | `Cliente` creado (con `id`) |
| PUT | `/api/clientes/:id` | `{ nombre, nif, contacto, tipo }` | `Cliente` actualizado |
| DELETE | `/api/clientes/:id` | — | `{ ok: true }` |

## Presupuestos

| Método | Ruta | Cuerpo petición | Cuerpo respuesta |
|---|---|---|---|
| GET | `/api/presupuestos` | — | lista de `Presupuesto`, cada uno con `estado` = **estado efectivo** (ver data-model.md) |
| GET | `/api/presupuestos/:id` | — | `Presupuesto` completo (con `lineas`), `estado` = estado efectivo |
| POST | `/api/presupuestos` | `{ cliente, retencionActiva, retencionPorcentaje, lineas }` | `Presupuesto` creado: el backend asigna `id`, `numero` (correlativo del año, FR-012 de 001), `fechaEmision`, `fechaValidez` y `estado: "borrador"` |
| PUT | `/api/presupuestos/:id` | `{ cliente, retencionActiva, retencionPorcentaje, lineas }` | `Presupuesto` actualizado; **NUNCA** cambia `numero` ni `estado` (FR-013a) |
| PUT | `/api/presupuestos/:id/estado` | `{ estado: "borrador" \| "enviado" \| "aceptado" \| "rechazado" }` | `Presupuesto` con el nuevo estado guardado; no toca ningún otro campo (FR-013). `"caducado"` no es un valor aceptado aquí: se rechaza con 400 si se intenta enviar, porque es un valor calculado, no manual. |

## Resumen de actividad

| Método | Ruta | Cuerpo petición | Cuerpo respuesta |
|---|---|---|---|
| GET | `/api/resumen-actividad` | — | `{ borrador, enviado, aceptado, rechazado, caducado }` (conteos, FR-006) |

## Migración de datos antiguos (`localStorage` → base de datos)

| Método | Ruta | Cuerpo petición | Cuerpo respuesta |
|---|---|---|---|
| GET | `/api/migracion/estado` | — | `{ baseDatosVacia: true \| false }` — el frontend lo consulta al arrancar para decidir si debe ofrecer migrar datos antiguos del navegador |
| POST | `/api/migracion` | el contenido completo de las claves de `localStorage` descritas en [contracts/storage-schema.md de 001](../../001-presupuestos-freelance/contracts/storage-schema.md) | `{ ok: true, importados: { perfil, servicios, clientes, presupuestos } }` — solo se ejecuta si la base de datos está vacía; si ya tiene datos, responde `409` sin tocar nada (evita duplicar datos si se llama dos veces) |

Los presupuestos migrados desde 001 no tenían campo `estado`: se les
asigna `'borrador'` por defecto al importarlos (Decisión 6 de
research.md).
