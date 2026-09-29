# Fase 1 — Data Model: Exportar todos los presupuestos en un .zip

Esta feature no añade tablas ni cambia el esquema de SQLite: es de solo
lectura sobre entidades ya existentes (`presupuestos`, `presupuesto_lineas`,
`servicios`, `perfil`). Las únicas estructuras nuevas son productos
generados en memoria/descarga, descritas aquí.

## Entidades existentes reutilizadas (sin cambios)

- **Presupuesto** (`backend/rutas/presupuestos.js`): `id`, `numero`,
  `fechaEmision`, `fechaValidez`, `cliente { nombre, nif, contacto, tipo }`,
  `retencionActiva`, `retencionPorcentaje`, `estado`, `lineas[]` (cuando se
  piden con detalle).
- **Línea de presupuesto**: `descripcion`, `cantidad`, `precioUnitario`
  (céntimos), `servicioOrigenId`.
- **Servicio**: `id`, `nombre`, `precioPorDefecto` (céntimos).
- **Perfil**: `nombre`, `nif`, `contacto`, `logo` (string, imagen en
  base64 o vacío).

## Entidad nueva: Copia de exportación (.zip)

Producto efímero, generado bajo demanda en el navegador, nunca persistido.

| Campo | Descripción |
|---|---|
| Nombre del archivo | `presupuestospro-copia-AAAA-MM-DD.zip`, con la fecha del día de la exportación (FR-003) |
| Contenido: PDF | Un archivo por presupuesto exportado con éxito, nombrado `"{numero} - {clienteSaneado}.pdf"` (FR-006/FR-007) |
| Contenido: datos | Exactamente un archivo `datos.json` (ver siguiente sección) |

**Regla de generación**: se construye a partir del estado de los datos en el
momento de pulsar el botón; no se reutiliza ni se cachea entre exportaciones
(Assumptions de la spec).

## Entidad nueva: Archivo de datos de respaldo (`datos.json`)

Documento único, formato JSON, pensado para una futura importación (fuera de
alcance de esta spec), no para lectura humana cómoda.

```jsonc
{
  "generadoEn": "2026-09-29T10:15:00.000Z",   // fecha/hora ISO 8601 de la exportación
  "perfil": {
    "nombre": "...",
    "nif": "...",
    "contacto": "...",
    "logo": "data:image/png;base64,..."        // o "" si no hay logo
  },
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
        { "descripcion": "...", "cantidad": 2, "precioUnitario": 5000, "servicioOrigenId": "..." }
      ]
    }
  ]
}
```

**Validación / invariantes**:
- `presupuestos` incluye únicamente los presupuestos existentes en el
  momento de la exportación, con sus líneas completas (igual forma que
  devuelve hoy `GET /api/presupuestos/:id`).
- No incluye el catálogo de clientes (ver `research.md`, sección 5, y
  Constitution Check en `plan.md`).
- Los importes se guardan en céntimos enteros (misma unidad que usa el resto
  de la app), sin redondeos ni formateo a euros.
- Este archivo no se valida contra un "estado" mutable: es una fotografía de
  solo lectura, no se escribe nunca de vuelta a la base de datos en esta
  feature.

## Entidad nueva (transitoria, solo UI): Resultado de la exportación

Estructura interna que usa `PresupuestosListView.vue` para pintar el aviso
final; no se persiste ni se serializa.

| Campo | Tipo | Descripción |
|---|---|---|
| `total` | number | Presupuestos existentes en el momento de exportar |
| `exportados` | number | PDF generados con éxito e incluidos en el .zip |
| `fallidos` | Array<{ numero, motivo }> | Presupuestos cuyo PDF no pudo generarse (FR-013) |

Regla: si `fallidos.length > 0`, la UI muestra un aviso listando los números
de presupuesto afectados, aunque el .zip se haya descargado igualmente.
