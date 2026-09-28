# Contrato de almacenamiento local (localStorage)

**Por qué existe este contrato**: aunque no hay una API ni un servidor, sí
hay una interfaz real que la aplicación debe respetar siempre: la forma en
que lee y escribe sus propios datos en el navegador. Este documento fija
esa forma para que persistencia (FR-018) y "no tocar presupuestos ya
creados al editar el catálogo" (FR-019) se cumplan de manera consistente.

Ver decisiones en [research.md](../research.md) (Decisión 2 y 4) y las
entidades completas en [data-model.md](../data-model.md).

## Claves usadas en `localStorage`

| Clave | Contenido |
|---|---|
| `presupuestospro.perfil` | un único objeto `PerfilFreelancer`, o ausente si no se ha guardado todavía |
| `presupuestospro.servicios` | lista de objetos `Servicio` |
| `presupuestospro.clientes` | lista de objetos `Cliente` |
| `presupuestospro.presupuestos` | lista de objetos `Presupuesto` (cada uno con sus `lineas` embebidas) |
| `presupuestospro.contadorAnual` | lista de objetos `{ anio, ultimoNumeroUsado }` |

Todos los valores se guardan como texto JSON (`JSON.stringify` /
`JSON.parse`). El logo del perfil se guarda como cadena `data:` (imagen
codificada en base64) dentro del propio objeto `PerfilFreelancer`, sin
fichero externo.

## Reglas del contrato

1. **Todo importe de dinero se serializa en céntimos** (entero), nunca en
   euros con coma o punto decimal. La conversión a euros con 2 decimales
   solo ocurre al mostrar el dato en pantalla o en el PDF.
2. **Copias congeladas**: al guardar un `Presupuesto`, los datos de
   `cliente` dentro de él, y los de cada `LineaPresupuesto` que venga de un
   `Servicio`, se escriben como valores propios del presupuesto — nunca
   como una referencia que haya que resolver leyendo `clientes` o
   `servicios` en el momento de mostrarlo. Esto es lo que garantiza FR-019.
3. **Ausencia de dato no es error**: si `presupuestospro.perfil` no existe,
   la aplicación lo interpreta como "perfil todavía no configurado"
   (FR-004a), no como un fallo de lectura.
4. **Escritura atómica por entidad**: cada operación de guardado
   (perfil, un servicio, un cliente, un presupuesto) relee la clave
   completa correspondiente, aplica el cambio en memoria, y vuelve a
   escribir la clave completa. No se hacen escrituras parciales dentro de
   una clave.
5. **Migraciones futuras**: si el formato de estas claves cambiara en una
   versión futura, esa versión deberá poder leer el formato descrito aquí
   y convertirlo, para no perder los datos ya guardados por el freelancer
   (continuidad de FR-018 entre versiones de la aplicación).
