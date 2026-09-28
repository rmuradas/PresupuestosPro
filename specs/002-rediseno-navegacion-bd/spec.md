# Feature Specification: Rediseño visual, página de inicio y persistencia en base de datos

**Feature Branch**: `002-rediseno-navegacion-bd`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada en la spec 001) con tres cambios, sin alterar ninguna funcionalidad ni dato existente. Primero: gestionar una base de datos para la persistencia de los mismos. Segundo: añadir una página de inicio (index) que sea el punto de entrada de la aplicación al acceder a la raíz del servidor, con navegación clara hacia las cuatro secciones existentes (Presupuestos, Clientes, Catálogo y Perfil) y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón atrás. Tercero: rediseñar la apariencia visual de toda la aplicación para que resulte profesional y sobria: tipografía consistente, paleta de colores limitada definida en un único lugar, espaciado uniforme, jerarquía visual clara entre títulos, tablas, formularios y totales, y estados visuales distinguibles para los presupuestos (Borrador, Enviado, Aceptado, Rechazado, Caducado). El rediseño debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente y todos los textos en español de España. La lógica de negocio, los cálculos y el esquema de datos no deben cambiar en absoluto. Al generar las APIs necesarias, siempre que la información se maneje con mensajes en formato json, no como parámetros en la URL."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Persistencia fiable en base de datos (Priority: P1)

Como freelancer, quiero que mis datos (perfil, catálogo, clientes y presupuestos) se guarden en una base de datos gestionada por la aplicación, para no perderlos si se borran los datos del navegador o si accedo desde otro navegador o dispositivo.

**Why this priority**: Es la base de fiabilidad de todo lo demás. Sin datos seguros, cualquier mejora de navegación o de imagen visual pierde sentido; además puede entregarse y verificarse de forma completamente independiente de las otras dos historias.

**Independent Test**: Se puede probar creando datos en cada sección (perfil, un cliente, un servicio, un presupuesto), borrando después los datos de navegación del navegador (caché y almacenamiento local) y comprobando que, al volver a abrir la aplicación, todos los datos siguen apareciendo exactamente igual.

**Acceptance Scenarios**:

1. **Given** datos guardados previamente (perfil, clientes, servicios, presupuestos), **When** se borran los datos de navegación del navegador (caché, almacenamiento local) y se vuelve a abrir la aplicación, **Then** todos los datos guardados siguen apareciendo exactamente igual que antes.
2. **Given** un presupuesto ya emitido con su número correlativo, **When** se reinicia el servidor de la aplicación, **Then** ese presupuesto y su número se mantienen intactos y el siguiente presupuesto que se cree continúa la numeración correlativa sin huecos ni duplicados.
3. **Given** una instalación que ya tenía datos guardados con la versión anterior de la aplicación, **When** se actualiza a esta nueva versión, **Then** todos esos datos previos aparecen disponibles en la aplicación sin que el freelancer tenga que volver a introducirlos.

---

### User Story 2 - Página de inicio y navegación común (Priority: P1)

Como freelancer, quiero entrar en la aplicación y ver una pantalla de inicio con accesos claros a Presupuestos, Clientes, Catálogo y Perfil, además de un resumen de mi actividad, y quiero poder moverme entre secciones en cualquier momento sin depender del botón "atrás" del navegador.

**Why this priority**: Define cómo entra y se mueve el freelancer por toda la aplicación cada vez que la usa. Es independiente de la base de datos (funciona igual sea cual sea el almacenamiento) y del rediseño visual (la navegación puede probarse aunque el estilo aún no esté pulido).

**Independent Test**: Se puede probar abriendo la aplicación por su dirección raíz y comprobando que aparece la página de inicio con las cuatro secciones y el resumen; después, navegando a cada sección y volviendo al inicio usando únicamente los enlaces de la navegación común, sin pulsar nunca el botón "atrás".

**Acceptance Scenarios**:

1. **Given** que el freelancer accede a la dirección raíz de la aplicación, **When** la página termina de cargar, **Then** ve una pantalla de inicio con un acceso directo a cada una de las cuatro secciones (Presupuestos, Clientes, Catálogo, Perfil) y un resumen con el número de presupuestos por estado.
2. **Given** que el freelancer está en cualquier sección de la aplicación, **When** busca la navegación común visible en la pantalla, **Then** puede pulsar directamente para ir a cualquiera de las otras secciones o a la página de inicio, sin necesidad de usar el botón "atrás" del navegador.
3. **Given** que el freelancer todavía no tiene ningún presupuesto creado, **When** visita la página de inicio, **Then** el resumen de actividad indica que no hay presupuestos, en vez de mostrar un error o quedarse en blanco.
4. **Given** que el freelancer accede directamente a una sección por su dirección (sin pasar antes por el inicio), **When** la sección termina de cargar, **Then** la navegación común sigue visible igualmente.

---

### User Story 3 - Rediseño visual profesional y sobrio (Priority: P2)

Como freelancer, quiero que toda la aplicación (pantallas y PDF) tenga un aspecto profesional, sobrio y coherente, con colores y tipografía consistentes y con los estados de un presupuesto fáciles de distinguir de un vistazo, para transmitir una imagen de calidad tanto a mí como a mis clientes.

**Why this priority**: Mejora la percepción de calidad y confianza, pero no cambia lo que la aplicación permite hacer. Puede entregarse una vez que la base de datos y la navegación ya funcionan, y de hecho se apoya en la navegación común de la Historia 2 para aplicarse de forma consistente en todas las pantallas.

**Independent Test**: Se puede probar recorriendo visualmente cada pantalla y el PDF generado, comprobando que todos usan la misma paleta de colores, tipografía, espaciado y estilos de tabla/formulario, y que un presupuesto en cada uno de los cinco estados se distingue claramente de los demás.

**Acceptance Scenarios**:

1. **Given** presupuestos en distintos estados (Borrador, Enviado, Aceptado, Rechazado, Caducado), **When** se muestran en cualquier listado, **Then** cada estado se distingue visualmente de los demás (por ejemplo, con un color y una etiqueta de texto propios) de forma consistente en toda la aplicación.
2. **Given** cualquier pantalla de la aplicación (listados, formularios, detalle de presupuesto), **When** se compara su aspecto con el de cualquier otra pantalla, **Then** ambas usan la misma paleta de colores, tipografía y espaciado, sin estilos inconsistentes entre secciones.
3. **Given** un presupuesto ya calculado, **When** el freelancer genera su PDF, **Then** el documento descargado usa la misma imagen visual (colores, tipografía, jerarquía) que el resto de la aplicación.
4. **Given** la aplicación abierta en un móvil, **When** se navega por cualquier sección, **Then** el diseño se adapta correctamente a la pantalla pequeña, sin romper la navegación común ni la legibilidad de tablas y formularios.

---

### Edge Cases

- La base de datos no está disponible al abrir la aplicación: el sistema debe mostrar un aviso comprensible en vez de fallar en blanco, sin perder ningún dato ya guardado.
- Un freelancer nuevo que todavía no ha completado su perfil accede a la página de inicio: la página de inicio debe seguir siendo accesible y guiarle a completar el perfil antes de crear un presupuesto (igual que exige hoy la especificación 001).
- Un presupuesto marcado como Aceptado o Rechazado cuya fecha de validez ya ha pasado: no debe mostrarse como Caducado, porque ya tiene una resolución definitiva.
- Un presupuesto marcado como Aceptado o Rechazado cuyo contenido (líneas, cliente, etc.) se edita después: el estado no cambia solo, permanece tal cual hasta que el freelancer lo modifique manualmente.
- Los datos ya existentes de una instalación anterior (guardados en el navegador) deben trasladarse a la base de datos sin pérdida al actualizar la aplicación.
- Acceso a una sección concreta escribiendo directamente su dirección, sin pasar antes por la página de inicio: la navegación común debe seguir apareciendo igual.

## Clarifications

### Session 2026-09-27

- Q: Los presupuestos no tienen hoy ningún estado guardado (la especificación 001 asume que todos son igual de válidos). Para poder distinguir Borrador/Enviado/Aceptado/Rechazado/Caducado como pide esta feature, ¿de dónde debe salir ese estado? → A: Añadir un estado editable manualmente por el freelancer (Borrador por defecto; puede marcarlo como Enviado, Aceptado o Rechazado; Caducado se calcula solo cuando la fecha de validez ya pasó y seguía en Borrador o Enviado).

### Session 2026-09-28

- Q: ¿Puede el freelancer cambiar el estado de un presupuesto libremente entre cualquiera de los cinco valores (por ejemplo, pasar de Aceptado de vuelta a Borrador), o el cambio debe seguir un flujo hacia adelante sin poder retroceder manualmente? → A: Cambio libre: el freelancer puede poner cualquier presupuesto en Borrador, Enviado, Aceptado o Rechazado en cualquier momento y en cualquier orden, sin restricciones de flujo (Caducado sigue siendo exclusivamente automático, no seleccionable a mano).
- Q: Si el freelancer edita las líneas, el cliente o cualquier otro dato de un presupuesto ya marcado como Aceptado o Rechazado, ¿el estado vuelve automáticamente a Borrador, o se mantiene tal cual hasta que el freelancer lo cambie él mismo? → A: Se mantiene tal cual; editar el contenido de un presupuesto no cambia su estado de forma automática, son dos acciones independientes.

## Requirements *(mandatory)*

### Functional Requirements

**Persistencia en base de datos**

- **FR-001**: El sistema MUST persistir el perfil del freelancer, el catálogo de servicios, la lista de clientes y todos los presupuestos (incluida su numeración e historial) en una base de datos gestionada por la aplicación, en lugar de depender únicamente del almacenamiento del navegador.
- **FR-002**: El sistema MUST trasladar a la base de datos, sin pérdida ni alteración de ningún valor, los datos que un freelancer ya tuviera guardados con la versión anterior de la aplicación.
- **FR-003**: El sistema MUST seguir funcionando como una instalación de un único freelancer, sin cuentas de usuario ni control de acceso; la incorporación de la base de datos no introduce por sí sola sincronización en la nube ni acceso multi-dispositivo.
- **FR-003a**: El sistema MUST mostrar un aviso comprensible en español, sin jerga técnica, cuando una petición a la API falle por no poder conectar con el servidor o la base de datos, en vez de dejar la pantalla en blanco o sin respuesta; ningún dato ya cargado en pantalla se debe perder al mostrar ese aviso.

**Página de inicio y navegación común**

- **FR-004**: El sistema MUST mostrar una página de inicio como punto de entrada al acceder a la dirección raíz de la aplicación.
- **FR-005**: La página de inicio MUST ofrecer un acceso directo y claramente identificado a cada una de las cuatro secciones existentes: Presupuestos, Clientes, Catálogo y Perfil.
- **FR-006**: La página de inicio MUST mostrar un resumen de actividad con el número de presupuestos agrupado por cada uno de sus estados (Borrador, Enviado, Aceptado, Rechazado, Caducado).
- **FR-007**: El sistema MUST mostrar una navegación común, visible en todas las pantallas de la aplicación, que permita moverse a cualquiera de las cuatro secciones y a la página de inicio sin depender del botón "atrás" del navegador.
- **FR-008**: El sistema MUST mantener visible la navegación común incluso cuando el freelancer accede directamente a una sección por su dirección, sin pasar antes por la página de inicio.

**Estado del presupuesto**

- **FR-009**: El sistema MUST asignar a cada presupuesto nuevo el estado inicial "Borrador".
- **FR-010**: El sistema MUST permitir al freelancer cambiar manualmente el estado de un presupuesto a Borrador, Enviado, Aceptado o Rechazado en cualquier momento y en cualquier orden (incluyendo retroceder, por ejemplo de Aceptado a Borrador), sin restricciones de flujo. El estado Caducado MUST NOT poder seleccionarse manualmente: solo se obtiene mediante el cálculo automático de FR-011.
- **FR-011**: El sistema MUST calcular automáticamente el estado "Caducado" para cualquier presupuesto cuya fecha de validez ya haya pasado y que siguiera en estado Borrador o Enviado, sin necesidad de que el freelancer lo marque a mano.
- **FR-012**: El sistema MUST mantener el estado Aceptado o Rechazado de un presupuesto aunque su fecha de validez ya haya pasado; estos dos estados no se sustituyen nunca por Caducado.
- **FR-013**: El cambio de estado de un presupuesto MUST NOT alterar ninguno de sus importes calculados (base imponible, IVA, retención, total) ni ningún otro dato del presupuesto.
- **FR-013a**: El sistema MUST mantener el estado de un presupuesto sin cambios automáticos cuando el freelancer edite sus líneas, su cliente o cualquier otro dato, incluso si el presupuesto está en estado Aceptado o Rechazado; el estado solo cambia mediante la acción manual descrita en FR-010 o el cálculo automático descrito en FR-011.

**Rediseño visual**

- **FR-014**: El sistema MUST aplicar en todas las pantallas una única paleta de colores y una tipografía consistente, definidas en un solo lugar de referencia para toda la aplicación.
- **FR-015**: El sistema MUST aplicar un espaciado uniforme y una jerarquía visual clara entre títulos, tablas, formularios y totales en todas las pantallas.
- **FR-016**: El sistema MUST distinguir visualmente (color y etiqueta de texto) cada uno de los cinco estados de un presupuesto (Borrador, Enviado, Aceptado, Rechazado, Caducado), de forma consistente en todos los listados y pantallas donde aparezca.
- **FR-017**: El sistema MUST aplicar el mismo rediseño visual (paleta, tipografía, jerarquía) a la plantilla del PDF de presupuesto, manteniendo sin cambios los datos y el desglose de importes que ya incluye.
- **FR-018**: El sistema MUST conservar el enfoque mobile-first ya existente en el rediseño visual, de modo que todas las pantallas sigan siendo usables correctamente en pantallas de móvil.
- **FR-019**: Todos los textos de la interfaz y del PDF MUST permanecer en español de España, igual que en la versión actual.

**Continuidad con la especificación 001**

- **FR-020**: El sistema MUST mantener sin ningún cambio la lógica de negocio y los cálculos de importes (base imponible, IVA, retención, total) ya definidos en la especificación 001.
- **FR-021**: El sistema MUST mantener sin ningún cambio el resto del esquema de datos y las reglas ya definidas en la especificación 001 (numeración, redondeo, validaciones de líneas, tipos de cliente, etc.), salvo la incorporación aditiva del estado del presupuesto descrita en esta especificación.

**Experiencia de usuario y accesibilidad**

- **FR-022**: El sistema MUST mostrar, en la página de Inicio, un aviso visible que invite al freelancer a completar su perfil antes de crear un presupuesto cuando el perfil todavía no esté configurado, sin bloquear el resto de accesos de Inicio.
- **FR-023**: La navegación común MUST indicar visualmente en qué sección se encuentra el freelancer en cada momento.
- **FR-024**: Las listas de Catálogo y de Clientes MUST mostrar un mensaje claro, en vez de un espacio en blanco, cuando todavía no existe ningún elemento.
- **FR-025**: La navegación común MUST mantenerse siempre visible y accesible tanto en pantallas de escritorio como en pantallas de móvil, adaptando su disposición sin ocultar nunca el acceso a las secciones.
- **FR-026**: El sistema MUST ofrecer el cambio de estado de un presupuesto (FR-010) mediante un selector en la propia pantalla de detalle del presupuesto, con las opciones Borrador, Enviado, Aceptado y Rechazado (nunca Caducado).
- **FR-027**: Toda pantalla que dependa de una llamada a la API (incluido el acceso directo a una sección sin pasar por Inicio) MUST mostrar un indicador de carga visible mientras espera la respuesta, en vez de una pantalla en blanco.
- **FR-028**: Cuando el sistema muestre el aviso de FR-003a, MUST ofrecer una acción explícita (por ejemplo, un botón "Reintentar") para que el freelancer repita la petición manualmente; el sistema no reintenta automáticamente en segundo plano.
- **FR-029**: En anchos de pantalla estrechos (móvil), las tablas (líneas de presupuesto, listados) MUST seguir siendo legibles mediante desplazamiento horizontal o apilado por fila, sin cortar columnas ni solapar contenido.
- **FR-030**: Cada etiqueta de estado (FR-016) MUST mantener un contraste de texto sobre fondo suficiente para ser legible (mínimo equivalente a WCAG AA, ratio 4.5:1).
- **FR-031**: La navegación común y el control de cambio de estado (FR-010) MUST ser operables mediante teclado, con el elemento que tiene el foco siempre visible.

### Key Entities *(include if feature involves data)*

- **Presupuesto** (ampliación de la entidad definida en la especificación 001): además de sus datos ya existentes (número, fechas, cliente, líneas, importes), incorpora un **estado** con uno de estos cinco valores: Borrador, Enviado, Aceptado, Rechazado o Caducado. Borrador es el valor inicial; Enviado, Aceptado y Rechazado se establecen manualmente por el freelancer; Caducado se calcula automáticamente a partir de la fecha de validez cuando el presupuesto seguía en Borrador o Enviado.
- **Resumen de actividad**: vista agregada, calculada a partir de los presupuestos existentes, que muestra cuántos presupuestos hay en cada estado. No se almacena de forma independiente; se recalcula a partir de los presupuestos guardados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tras borrar los datos de navegación del navegador o acceder desde otro navegador o dispositivo al mismo servidor, el 100 % de los datos guardados anteriormente (perfil, catálogo, clientes, presupuestos) siguen disponibles sin pérdida.
- **SC-002**: Desde la página de inicio, un freelancer puede llegar a cualquiera de las cuatro secciones existentes con un único clic, y puede moverse entre cualquier par de secciones sin usar nunca el botón "atrás" del navegador.
- **SC-003**: Un freelancer puede identificar el estado de un presupuesto (Borrador, Enviado, Aceptado, Rechazado, Caducado) de un vistazo en cualquier listado, sin necesidad de abrir el presupuesto, en el 100 % de los casos.
- **SC-004**: El 100 % de las pantallas de la aplicación y la plantilla del PDF comparten la misma paleta de colores y tipografía, verificable mediante una comparación visual directa entre pantallas.
- **SC-005**: El resumen de actividad de la página de inicio refleja el número real de presupuestos por estado en el 100 % de los casos, incluyendo cuando no hay ningún presupuesto creado.
- **SC-006**: Tras el rediseño, los cálculos de cualquier presupuesto siguen produciendo exactamente los mismos resultados que antes (por ejemplo, el caso de referencia de líneas de 1.500,00 € y 500,00 € con retención del 15 % sigue dando un total de 2.120,00 €).

## Assumptions

- La base de datos sigue formando parte de una instalación de un único freelancer (sin cuentas de usuario ni sincronización en la nube entre dispositivos distintos), manteniendo el alcance ya fijado por la especificación 001; solo cambia el lugar donde se guardan los datos, no quién puede acceder a ellos.
- Los datos ya existentes en instalaciones previas se migran a la base de datos como parte de esta feature, sin que el freelancer tenga que volver a introducirlos manualmente.
- Las nuevas comunicaciones entre la aplicación y el servidor que esta feature requiera (por ejemplo, para consultar el resumen de actividad o cambiar el estado de un presupuesto) intercambian la información en el cuerpo de los mensajes en formato JSON, no como parámetros en la dirección (URL).
- El resto de reglas de negocio, cálculos y esquema de datos definidos en la especificación 001 (numeración AAAA-NNN, redondeo a 2 decimales, aplicación de retención de IRPF solo a empresas/autónomos, validaciones de líneas, etc.) permanecen exactamente iguales; esta feature solo añade persistencia en base de datos, página de inicio con navegación común y un rediseño visual (incluyendo el estado del presupuesto necesario para distinguirlo visualmente).
- El cambio de estado de un presupuesto es una acción manual y sencilla (por ejemplo, un selector o botones de acción) disponible en la pantalla del propio presupuesto; no implica ningún flujo de envío real de email ni integración con terceros, que queda fuera de alcance.
