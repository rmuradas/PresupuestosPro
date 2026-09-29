# Contrato: archivo `datos.json` dentro del .zip de exportación

Este es el "contrato de salida" que ve el usuario al descomprimir el .zip:
el único archivo de datos exigido por FR-008. Pensado como entrada para una
futura funcionalidad de importación (fuera de alcance de esta spec), no
como documento de lectura humana.

## Ubicación

Raíz del .zip, junto a los PDF, con nombre fijo: `datos.json`.

## Forma

Ver el bloque de ejemplo completo en
[`../data-model.md`](../data-model.md#entidad-nueva-archivo-de-datos-de-respaldo-datosjson).

Resumen de claves de primer nivel:

| Clave | Tipo | Obligatoria | Contenido |
|---|---|---|---|
| `generadoEn` | string (ISO 8601) | sí | Momento exacto de la exportación |
| `perfil` | object \| null | sí | Igual forma que `GET /api/perfil` |
| `servicios` | array | sí | Igual forma que `GET /api/servicios` (puede ser `[]`) |
| `presupuestos` | array | sí | Presupuestos exportados con éxito, con `lineas`; **no** incluye los que fallaron (ver FR-013) |

## Reglas de consistencia con los PDF del mismo .zip

- `presupuestos` en `datos.json` contiene **exactamente** los presupuestos
  cuyo PDF sí se generó correctamente. Si un presupuesto falla (FR-013), no
  aparece ni como PDF ni en este JSON, para que ambas partes del .zip sean
  coherentes entre sí.
- El campo `numero` de cada presupuesto en `datos.json` permite emparejarlo
  con su PDF correspondiente (cuyo nombre siempre empieza por ese mismo
  número).

## Fuera de alcance de este contrato

- Un esquema de validación formal (JSON Schema) no es necesario para esta
  feature: no hay ninguna funcionalidad en esta spec que lea o valide este
  archivo de vuelta (la importación es una spec futura independiente).
- No incluye el catálogo de clientes (ver `research.md`).
