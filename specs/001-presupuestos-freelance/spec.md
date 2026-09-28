# Feature Specification: PresupuestosPro v0

**Feature Branch**: `001-presupuestos-freelance` (repositorio git no inicializado todavía; se usa el directorio de la feature como identificador)

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Especificación: PresupuestosPro v0 — herramienta para que un freelancer español cree presupuestos profesionales con su marca y los descargue en PDF para enviárselos a sus clientes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar el perfil del freelancer (Priority: P1)

Como freelancer, quiero configurar mi nombre, NIF, datos de contacto y logo, para que mis presupuestos salgan con mi marca sin tener que ponerla cada vez.

**Why this priority**: Sin estos datos ningún presupuesto puede llevar la marca del freelancer. Es la base sobre la que se construye todo lo demás, y es la primera acción que hace un freelancer nuevo al entrar a la aplicación.

**Independent Test**: Se puede probar por completo rellenando el formulario de perfil (nombre, NIF, contacto, logo), guardando, y comprobando que los datos se muestran correctamente al volver a abrir esa pantalla.

**Acceptance Scenarios**:

1. **Given** que no existe ningún perfil guardado, **When** el freelancer introduce su nombre, NIF, datos de contacto y sube un logo y guarda, **Then** el sistema guarda esos datos y los muestra al volver a la pantalla de perfil.
2. **Given** un perfil ya guardado, **When** el freelancer modifica cualquier dato (por ejemplo el logo) y guarda, **Then** el sistema conserva el cambio y lo usa en los siguientes presupuestos que se generen.

---

### User Story 2 - Crear un presupuesto con cálculo automático de impuestos (Priority: P1)

Como freelancer, quiero crear un presupuesto eligiendo un cliente, añadiendo líneas y viendo cómo se calculan solos la base imponible, el IVA, la retención de IRPF (cuando toque) y el total, para no perder tiempo ni equivocarme con los números.

**Why this priority**: Es el corazón del producto: sin un cálculo automático y correcto no hay ninguna ventaja frente a la hoja de cálculo que el freelancer ya usa hoy.

**Independent Test**: Se puede probar creando un presupuesto con las líneas del ejemplo de referencia (1.500,00 € + 500,00 €), activando la retención al 15 %, y comprobando que el sistema muestra base 2.000,00 €, IVA 420,00 €, retención −300,00 € y total 2.120,00 €, sin que el freelancer haga ningún cálculo manual.

**Acceptance Scenarios**:

1. **Given** un presupuesto con líneas por valor de 1.500,00 € y 500,00 €, cliente de tipo empresa/autónomo y retención del 15 % activada, **When** se guardan las líneas, **Then** el sistema muestra base imponible 2.000,00 €, IVA 420,00 €, retención −300,00 € y total 2.120,00 €.
2. **Given** el mismo presupuesto, **When** el freelancer cambia la retención al 7 %, **Then** el total se recalcula solo y pasa a 2.280,00 €.
3. **Given** el mismo presupuesto, **When** el freelancer desactiva la retención o marca el cliente como particular, **Then** el sistema deja de aplicar la retención y el total sube a 2.420,00 €, incluso si la retención había quedado marcada por error.
4. **Given** un presupuesto sin ninguna línea añadida, **When** el freelancer intenta generar el PDF, **Then** el sistema no genera el PDF y avisa de que falta añadir al menos una línea.

---

### User Story 3 - Descargar el presupuesto en PDF (Priority: P1)

Como freelancer, quiero descargar el presupuesto como PDF con mi logo, número, fechas y desglose de impuestos, para enviárselo al cliente con buena imagen y sin tener que maquetarlo yo.

**Why this priority**: Es el entregable final que de verdad llega al cliente; sin el PDF, el cálculo automático de la Historia 2 no tiene forma de salir de la aplicación.

**Independent Test**: Se puede probar generando el PDF de un presupuesto ya calculado y comprobando visualmente que contiene el logo, el número de presupuesto, la fecha de emisión, la fecha de validez y el desglose completo (base, IVA, retención si la hay, total).

**Acceptance Scenarios**:

1. **Given** un presupuesto con al menos una línea, **When** el freelancer genera el PDF, **Then** el archivo descargado muestra el logo y los datos del freelancer, los datos del cliente, el número de presupuesto, la fecha de emisión, la fecha de validez (30 días después) y la tabla de líneas con el desglose de base, IVA, retención (si aplica) y total.
2. **Given** el primer presupuesto emitido en el año en curso, **When** se genera, **Then** su número tiene el formato AAAA-NNN con NNN = 001 (por ejemplo 2026-001), y el segundo presupuesto del mismo año recibe automáticamente el siguiente número correlativo (2026-002).
3. **Given** un presupuesto cuyo PDF ya se generó antes, **When** el freelancer edita una línea, el cliente o la retención y vuelve a generar el PDF, **Then** el nuevo PDF refleja los datos actualizados y conserva el mismo número de presupuesto.

---

### User Story 4 - Mantener catálogos reutilizables de servicios y clientes (Priority: P2)

Como freelancer, quiero mantener un catálogo de mis servicios (con precio por defecto) y una lista de mis clientes habituales, para no volver a escribir los mismos datos cada vez que hago un presupuesto nuevo.

**Why this priority**: Ahorra tiempo en el uso repetido de la aplicación, pero no es imprescindible para emitir un primer presupuesto: sin catálogo, las líneas y los datos de cliente se pueden seguir escribiendo a mano (Historias 2 y 3 ya cubren ese camino).

**Independent Test**: Se puede probar dando de alta un servicio en el catálogo y un cliente en la lista, y comprobando que ambos aparecen disponibles para seleccionar al crear un presupuesto nuevo, precargando sus datos (precio del servicio, datos del cliente) de forma editable.

**Acceptance Scenarios**:

1. **Given** un catálogo vacío, **When** el freelancer da de alta un servicio con nombre y precio por defecto, **Then** ese servicio queda disponible para añadirlo como línea en cualquier presupuesto futuro, precargando su nombre y precio (editables antes de guardar la línea).
2. **Given** una lista de clientes vacía, **When** el freelancer da de alta un cliente con nombre, NIF, contacto y tipo (empresa/autónomo o particular), **Then** ese cliente queda disponible para seleccionarlo directamente al crear un presupuesto nuevo, sin volver a escribir sus datos.
3. **Given** un servicio o un cliente ya usado en presupuestos anteriores, **When** el freelancer edita o elimina ese servicio o cliente del catálogo/lista, **Then** los presupuestos ya creados que lo usaron no cambian: conservan los datos y el precio tal como estaban en el momento de crearse.

---

### Edge Cases

- Un presupuesto sin ninguna línea: el sistema no genera el PDF y avisa al freelancer de por qué (User Story 2, escenario 4).
- Una línea escrita a mano, sin relación con ningún servicio del catálogo: debe poder añadirse igualmente (no todo encargo está catalogado).
- Un cliente particular con la retención de IRPF marcada por error: el sistema no la aplica bajo ninguna circunstancia; el tipo de cliente manda sobre la casilla de retención.
- Cambio de tipo de cliente (de particular a empresa/autónomo o viceversa) en un presupuesto que ya tenía la retención configurada: el sistema recalcula el total según la regla vigente (retención solo si el cliente es empresa/autónomo).
- Paso de un año natural a otro con presupuestos pendientes: el contador de numeración se reinicia a 001 para el año nuevo sin afectar a la numeración de los presupuestos ya emitidos en años anteriores.
- Cierre y reapertura de la aplicación: el perfil, el catálogo, la lista de clientes y todos los presupuestos deben seguir disponibles tal como se dejaron.
- Intento de crear un presupuesto sin haber guardado antes el perfil del freelancer: el sistema lo impide y guía al freelancer a completar el perfil primero.
- Intento de añadir una línea con cantidad o precio unitario en cero o negativo: el sistema rechaza la línea y avisa de que ambos valores deben ser mayores que 0.

## Clarifications

### Session 2026-09-26

- Q: Cuando el cálculo de IVA o retención produce más de 2 decimales, ¿cómo debe redondear el sistema el importe resultante? → A: Redondear cada importe (IVA, retención, total) a 2 decimales usando redondeo estándar (0,5 hacia arriba)
- Q: ¿Se puede crear un presupuesto o generar su PDF antes de haber rellenado el perfil del freelancer, o el sistema debe exigir un perfil guardado primero? → A: El sistema exige perfil guardado desde el principio, antes incluso de crear un presupuesto
- Q: ¿Debe el sistema validar que el NIF/CIF introducido (perfil y clientes) tenga un formato válido español, o acepta cualquier texto libre? → A: Validar solo que no esté vacío, sin comprobar el formato
- Q: En una línea de presupuesto, ¿debe el sistema impedir cantidades o precios unitarios en cero o negativos, o se permite cualquier valor numérico? → A: Impedir cero y negativos: cantidad y precio unitario deben ser mayores que 0
- Q: ¿Debe el sistema impedir dar de alta dos clientes con el mismo NIF, o permite duplicados libremente? → A: Permitir duplicados libremente, sin ninguna validación de unicidad

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir guardar y editar el perfil del freelancer: nombre, NIF, datos de contacto y logo. El NIF MUST ser obligatorio (no puede quedar vacío), pero el sistema no valida su formato.
- **FR-002**: El sistema MUST permitir crear, editar y eliminar servicios del catálogo, cada uno con nombre y precio por defecto.
- **FR-003**: El sistema MUST permitir mantener una lista de clientes reutilizable (nombre, NIF, datos de contacto y tipo: empresa/autónomo o particular), con alta, edición y eliminación. El NIF MUST ser obligatorio (no puede quedar vacío), pero el sistema no valida su formato.
- **FR-004**: El sistema MUST permitir crear un presupuesto seleccionando un cliente de la lista, o dando de alta uno nuevo en el momento, indicando siempre su tipo (empresa/autónomo o particular).
- **FR-004a**: El sistema MUST exigir que el perfil del freelancer esté guardado antes de permitir crear un presupuesto nuevo, y MUST guiar al freelancer a completar el perfil si todavía no existe.
- **FR-005**: Cada línea del presupuesto MUST poder añadirse desde el catálogo (precargando descripción y precio por defecto, editables) o escribirse a mano (descripción, cantidad y precio unitario libres). La cantidad y el precio unitario MUST ser siempre mayores que 0; el sistema MUST rechazar valores en cero o negativos.
- **FR-006**: El sistema MUST calcular automáticamente la base imponible como la suma de (cantidad × precio unitario) de todas las líneas del presupuesto.
- **FR-007**: El sistema MUST calcular automáticamente el IVA como la base imponible × 21 % (tipo por defecto).
- **FR-008**: El sistema MUST permitir activar o desactivar, para cada presupuesto de forma individual, la retención de IRPF, y elegir entre 15 % o 7 % cuando esté activada.
- **FR-009**: El sistema MUST aplicar la retención de IRPF únicamente cuando el cliente sea de tipo empresa/autónomo; si el cliente es particular, la retención no se aplica en ningún caso, aunque esté marcada.
- **FR-010**: El sistema MUST calcular el total del presupuesto como base imponible + IVA − retención de IRPF (si aplica).
- **FR-011**: El sistema MUST recalcular todos los importes (base, IVA, retención, total) automáticamente cada vez que cambie una línea, el tipo de cliente o la configuración de retención.
- **FR-012**: El sistema MUST numerar automáticamente cada presupuesto con el formato AAAA-NNN, de forma correlativa dentro de cada año natural, reiniciando el contador a 001 en cada año nuevo.
- **FR-013**: El sistema MUST mostrar en cada presupuesto la fecha de emisión y una fecha de validez calculada como la fecha de emisión + 30 días.
- **FR-014**: El sistema MUST permitir editar o eliminar cualquier línea de un presupuesto en cualquier momento, antes o después de haber generado su PDF, recalculando los importes de inmediato.
- **FR-015**: El sistema MUST generar un PDF del presupuesto que incluya el logo y los datos del freelancer, los datos del cliente, el número de presupuesto, la fecha de emisión, la fecha de validez, la tabla de líneas y el desglose de base imponible, IVA, retención (si aplica) y total.
- **FR-016**: El sistema MUST permitir volver a generar el PDF de un presupuesto ya emitido después de editarlo, conservando siempre el mismo número de presupuesto.
- **FR-017**: El sistema MUST impedir la generación del PDF de un presupuesto que no tenga ninguna línea, y MUST avisar al freelancer del motivo.
- **FR-018**: El sistema MUST conservar el perfil del freelancer, el catálogo de servicios, la lista de clientes y todos los presupuestos entre cierres y reaperturas de la aplicación.
- **FR-019**: El sistema MUST mantener sin cambios los presupuestos ya creados cuando, con posterioridad, se edite o elimine un servicio del catálogo o un cliente de la lista que hubieran sido usados en ellos.
- **FR-020**: El sistema MUST redondear cada importe calculado (IVA, retención y total) a 2 decimales usando redondeo estándar (0,5 hacia arriba) cada vez que el cálculo produzca más de 2 decimales.

### Key Entities *(include if feature involves data)*

- **Perfil del freelancer**: datos de marca y contacto del emisor de los presupuestos (nombre, NIF, datos de contacto, logo). Existe una única instancia por instalación.
- **Servicio (catálogo)**: plantilla reutilizable de línea de presupuesto, con nombre y precio por defecto; se puede usar como base para crear líneas, pero cada línea puede modificar esos valores libremente.
- **Cliente**: persona o entidad destinataria de un presupuesto, con nombre, NIF, datos de contacto y tipo (empresa/autónomo o particular). El tipo determina si la retención de IRPF puede aplicarse. El NIF es obligatorio pero no está sujeto a ninguna restricción de unicidad: pueden existir varios clientes con el mismo NIF.
- **Presupuesto**: documento con número (AAAA-NNN), fecha de emisión, fecha de validez, cliente asociado, configuración de retención de IRPF (activada/desactivada y porcentaje), una o varias líneas, y los importes calculados (base imponible, IVA, retención, total).
- **Línea de presupuesto**: concepto dentro de un presupuesto, con descripción, cantidad y precio unitario; puede originarse en un servicio del catálogo o escribirse libremente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un freelancer puede crear un presupuesto completo (cliente, líneas e impuestos) y descargar su PDF en menos de 5 minutos.
- **SC-002**: En el 100 % de los presupuestos con el ejemplo de referencia (líneas de 1.500,00 € y 500,00 € y retención del 15 %), el total mostrado es exactamente 2.120,00 €, sin ningún cálculo manual por parte del freelancer.
- **SC-003**: El 100 % de los presupuestos reciben un número único y correlativo en formato AAAA-NNN sin intervención manual, y el contador se reinicia correctamente al empezar un año natural nuevo.
- **SC-004**: Tras cerrar y volver a abrir la aplicación, el 100 % de los datos de perfil, catálogo, clientes y presupuestos guardados previamente siguen disponibles sin pérdida.
- **SC-005**: El 100 % de los PDF generados incluyen el logo, el número de presupuesto, la fecha de emisión, la fecha de validez y el desglose completo de base, IVA, retención (cuando la haya) y total.
- **SC-006**: Al activar o desactivar la retención de IRPF, cambiar su porcentaje, o cambiar el tipo de cliente, el total visible se actualiza sin que el freelancer tenga que recalcular nada ni recargar la pantalla.

## Assumptions

- La retención de IRPF (15 % o 7 %) se activa y elige de forma individual en cada presupuesto; no existe un valor por defecto configurado una sola vez en el perfil.
- Los clientes se gestionan en una lista reutilizable (alta, edición, eliminación), de forma análoga al catálogo de servicios, en vez de escribirse a mano en cada presupuesto.
- Un presupuesto permanece editable de forma indefinida, incluso después de haber generado su PDF por primera vez; volver a generarlo conserva el mismo número.
- La aplicación es de un único freelancer por instalación, sin cuentas de usuario ni control de acceso (según el punto "Fuera de alcance" de la descripción original).
- Los datos se guardan localmente en el equipo del freelancer, sin sincronización en la nube ni entre dispositivos (según "Fuera de alcance").
- El sistema no valida si un freelancer cumple los requisitos legales para aplicar el 7 % de "nuevo autónomo"; es una elección manual del freelancer bajo su responsabilidad.
- No se gestiona ningún estado de ciclo de vida del presupuesto (borrador, enviado, aceptado, rechazado); todo presupuesto guardado es igual de válido y editable.
- El logo se admite en formatos de imagen habituales en la web (por ejemplo PNG o JPG); no se han especificado restricciones de negocio adicionales sobre su tamaño o resolución.
- No existen descuentos por línea ni globales en esta versión (según "Fuera de alcance"); si se añaden en el futuro, será una feature aparte con su propia regla de cálculo.
