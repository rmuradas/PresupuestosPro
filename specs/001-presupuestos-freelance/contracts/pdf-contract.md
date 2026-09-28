# Contrato del PDF generado

**Por qué existe este contrato**: el PDF es el único entregable que sale de
la aplicación y llega de verdad al cliente del freelancer (Historia de
Usuario 3). Este documento fija qué debe contener siempre, derivado
directamente de FR-015 y de los criterios de éxito SC-005, para que
cualquier cambio futuro de maquetación se compare contra esta lista, no
contra "cómo se ve ahora".

## Contenido obligatorio, en este orden

1. **Cabecera del emisor**: logo (si el perfil tiene uno guardado), nombre,
   NIF y datos de contacto del `PerfilFreelancer`.
2. **Identificación del presupuesto**: `numero` (formato `AAAA-NNN`),
   `fechaEmision`, `fechaValidez`.
3. **Datos del cliente**: nombre, NIF, contacto y tipo (empresa/autónomo o
   particular) — tal y como quedaron congelados en el `Presupuesto`
   (nunca releídos del catálogo de clientes en ese momento).
4. **Tabla de líneas**: una fila por `LineaPresupuesto`, con descripción,
   cantidad, precio unitario e importe de línea (`cantidad × precioUnitario`).
5. **Desglose de importes**: base imponible, IVA (con el 21 % indicado),
   retención de IRPF **solo si `retencionActiva` es `true` y el cliente es
   empresa/autónomo** (con el porcentaje indicado, y como importe negativo o
   claramente marcado como descuento), y total.

## Reglas del contrato

- Todos los importes se muestran en euros con 2 decimales y el símbolo €,
  en formato español (coma decimal) — Principio II de la constitution.
- Las fechas se muestran en formato de fecha español (día/mes/año).
- Si `retencionActiva` es `false`, o el cliente es particular, la línea de
  retención **no aparece** en el desglose (no se muestra "0,00 €" de
  retención: se omite la fila entera), para que el documento sea claro
  para el cliente que lo recibe.
- Regenerar el PDF de un `Presupuesto` ya emitido produce un documento con
  el **mismo `numero`** y los datos actualizados (FR-016) — nunca un número
  nuevo.
- Intentar generar el PDF de un `Presupuesto` sin ninguna línea debe
  bloquearse antes de llegar a este contrato (FR-017): no existe una
  versión "vacía" válida de este documento.
