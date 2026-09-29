# Contrato: `GET /api/exportacion`

Nuevo endpoint de solo lectura, añadido en `backend/rutas/exportacion.js` y
registrado en `backend/server.js` como `app.use('/api/exportacion', ...)`,
siguiendo el mismo patrón que `resumenActividadRouter`.

## Request

```
GET /api/exportacion
```

Sin parámetros, sin body. Sin autenticación adicional (igual que el resto de
la API: un único freelancer/usuario por instalación).

## Response — 200 OK

```jsonc
{
  "perfil": { "nombre": "...", "nif": "...", "contacto": "...", "logo": "..." },
  "servicios": [
    { "id": "...", "nombre": "...", "precioPorDefecto": 12000 }
  ],
  "presupuestos": [
    {
      "id": "...",
      "numero": "2026-001",
      "fechaEmision": "2026-01-10T00:00:00.000Z",
      "fechaValidez": "2026-02-09T00:00:00.000Z",
      "cliente": { "nombre": "...", "nif": "...", "contacto": "...", "tipo": "empresa_autonomo" },
      "retencionActiva": true,
      "retencionPorcentaje": 15,
      "estado": "enviado",
      "lineas": [
        { "descripcion": "...", "cantidad": 2, "precioUnitario": 5000, "servicioOrigenId": null }
      ]
    }
  ]
}
```

- `perfil`: misma forma que devuelve hoy `GET /api/perfil` (`null` si nunca
  se ha rellenado).
- `servicios`: misma forma que devuelve hoy `GET /api/servicios` (array,
  puede estar vacío).
- `presupuestos`: misma forma que devuelve hoy `GET /api/presupuestos/:id`
  para cada presupuesto (incluye `lineas`), pero para **todos** los
  presupuestos existentes en una sola respuesta, ordenados igual que
  `GET /api/presupuestos` (por `numero` descendente). El `estado` es el
  estado efectivo (ya calculado, incluye `caducado` cuando corresponde),
  igual que en los endpoints existentes.

## Comportamiento

- Es una operación **de solo lectura**: no modifica ninguna fila (FR-009).
- Si no hay presupuestos, `presupuestos` es un array vacío `[]` (no es un
  error) — la decisión de avisar y no descargar nada (FR-010) es
  responsabilidad del frontend, no de este endpoint.
- No pagina ni limita resultados: la spec exige soportar hasta 200
  presupuestos en una sola exportación (FR-012); una única consulta de
  agregación en el backend es más simple y fiable que paginar.

## Errores

- `500` con `{ "error": "..." }` únicamente ante un fallo inesperado de base
  de datos, igual que el resto de rutas existentes (no hay validación de
  entrada porque no hay parámetros).
