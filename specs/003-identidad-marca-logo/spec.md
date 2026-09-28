# Feature Specification: Identidad de marca con logotipo y nueva paleta visual

**Feature Branch**: `003-identidad-marca-logo`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada en la spec 002) con dos cambios, sin alterar ninguna funcionalidad ni dato existente. Primero: En la página de inicio (index) incorporar el logo grande giratorio, que es el punto de entrada de la aplicación al acceder a la raíz del servidor, con navegación clara hacia las cuatro secciones existentes (Presupuestos, Clientes, Catálogo y Perfil) y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón atrás. Segundo: rediseñar la apariencia visual de toda la aplicación para que adopte ahora una experiencia al usuario mas agradable visualmente. Utilizar una paleta de colores basada en los colores definidos para los logos. Todas las paginas de navegacion deben incluir el logo pequeño que gira al pasar el mouse sobre el. El logo debe estar en el pdf y en todos los documentos que se impriman tambien. El rediseño debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente y todos los textos en español de España. La lógica de negocio, los cálculos, la API y el esquema de datos no deben cambiar en absoluto."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Logotipo grande en la página de inicio (Priority: P1)

Como freelancer, al entrar en la página de inicio quiero ver el logotipo de mi marca en grande, girando, para que la aplicación transmita identidad propia desde el primer instante, manteniendo los accesos a las cuatro secciones y el resumen de actividad que ya existen.

**Why this priority**: Es el primer elemento que ve el freelancer cada vez que abre la aplicación; define la primera impresión de marca. No depende de ningún otro cambio de esta feature.

**Independent Test**: Se puede probar abriendo la aplicación por su dirección raíz y comprobando que el logotipo aparece en tamaño grande y con una animación de giro visible, sin que los accesos a las cuatro secciones ni el resumen de actividad dejen de funcionar.

**Acceptance Scenarios**:

1. **Given** que el freelancer accede a la dirección raíz de la aplicación, **When** la página de inicio termina de cargar, **Then** ve el logotipo de marca en tamaño grande con una animación de giro continua, junto con el acceso a las cuatro secciones y el resumen de actividad.
2. **Given** que el freelancer tiene activada en su sistema la preferencia de "reducir movimiento", **When** visita la página de inicio, **Then** el logotipo se muestra estático (sin girar), sin que desaparezca ni rompa el diseño de la página.
3. **Given** que el freelancer abre la página de inicio en un móvil, **When** la pantalla es pequeña, **Then** el logotipo grande se adapta al ancho disponible sin desbordar la pantalla ni tapar el resto del contenido.

---

### User Story 2 - Logotipo pequeño interactivo en la navegación común (Priority: P1)

Como freelancer, quiero ver el logotipo de mi marca en pequeño dentro de la navegación común de cada página, y que gire cuando paso el ratón por encima, para reforzar la identidad de marca en todo momento mientras uso la aplicación.

**Why this priority**: La navegación común aparece en todas las pantallas, por lo que el logotipo pequeño es el elemento de marca más repetido de toda la experiencia. Es independiente del logotipo grande de la página de inicio.

**Independent Test**: Se puede probar visitando cualquier sección de la aplicación, comprobando que el logotipo pequeño aparece en la navegación común, y que al pasar el ratón por encima gira, deteniéndose al retirarlo.

**Acceptance Scenarios**:

1. **Given** que el freelancer está en cualquier página de la aplicación, **When** mira la navegación común, **Then** ve el logotipo de marca en tamaño pequeño como parte de ella.
2. **Given** que el freelancer usa un ratón, **When** pasa el puntero sobre el logotipo pequeño, **Then** el logotipo gira; **When** retira el puntero, **Then** el logotipo deja de girar.
3. **Given** que el freelancer usa un dispositivo táctil sin puntero, **When** navega por la aplicación, **Then** el logotipo pequeño sigue siendo visible en la navegación común aunque no llegue a girar, sin que eso afecte al uso de la navegación.
4. **Given** que el freelancer tiene activada la preferencia de "reducir movimiento", **When** pasa el puntero sobre el logotipo pequeño, **Then** el logotipo no gira.
5. **Given** que el freelancer está en cualquier página distinta de Inicio, **When** hace clic en el logotipo pequeño de la navegación (o lo activa con el teclado), **Then** la aplicación le lleva a la página de Inicio.

---

### User Story 3 - Nueva paleta de colores basada en el logotipo (Priority: P2)

Como freelancer, quiero que toda la aplicación use una paleta de colores basada en los colores de mi logotipo, para conseguir una experiencia visual más agradable y coherente con mi marca, manteniendo la tipografía, el espaciado y la jerarquía visual ya ordenados.

**Why this priority**: Mejora la percepción y la coherencia de marca, apoyándose en el logotipo ya incorporado en las Historias 1 y 2, pero no es imprescindible para que esas dos historias funcionen.

**Independent Test**: Se puede probar recorriendo visualmente cada pantalla de la aplicación y comprobando que los colores usados (fondos, botones, títulos, bordes) proceden de la nueva paleta basada en el logotipo, de forma consistente en toda la aplicación.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la aplicación, **When** se compara su paleta de colores con la del logotipo de marca, **Then** los colores principales de la pantalla (fondos, acentos, botones) proceden de esa paleta.
2. **Given** presupuestos en distintos estados (Borrador, Enviado, Aceptado, Rechazado, Caducado), **When** se muestran en cualquier listado tras el cambio de paleta, **Then** cada estado se sigue distinguiendo claramente de los demás, con contraste de texto suficiente para leerse.
3. **Given** cualquier pantalla de la aplicación, **When** se compara con cualquier otra, **Then** ambas comparten la misma tipografía, el mismo espaciado uniforme y la misma jerarquía visual entre títulos, tablas, formularios y totales ya existentes, solo con los colores actualizados.

---

### User Story 4 - Logotipo e imagen de marca en el PDF (Priority: P2)

Como freelancer, quiero que el PDF de presupuesto que reciben mis clientes incluya mi logotipo y la nueva imagen visual, para que el documento transmita la misma identidad de marca profesional que ven mis clientes en la aplicación.

**Why this priority**: Es el único documento que llega directamente a terceros (los clientes), por lo que completa la coherencia de marca iniciada en las historias anteriores, pero puede entregarse una vez que el logotipo y la paleta ya existen en la aplicación.

**Independent Test**: Se puede probar generando el PDF de un presupuesto y comprobando que incluye el logotipo de marca y usa la misma paleta de colores y tipografía que el resto de la aplicación, sin que cambie ningún dato ni importe del presupuesto.

**Acceptance Scenarios**:

1. **Given** un presupuesto ya calculado, **When** el freelancer genera su PDF, **Then** el documento incluye el logotipo de marca en su versión estática, sin animación.
2. **Given** el PDF generado, **When** se compara su aspecto (colores, tipografía) con el de la aplicación, **Then** ambos comparten la misma imagen visual.
3. **Given** el PDF generado, **When** se revisan los datos y el desglose de importes, **Then** son exactamente los mismos que antes de este cambio, sin ninguna alteración de cifras.

---

### Edge Cases

- El freelancer tiene activada la preferencia de sistema "reducir movimiento": ninguno de los dos logotipos (grande o pequeño) debe animarse; ambos se muestran estáticos sin romper el diseño.
- El freelancer usa un dispositivo táctil sin puntero: el logotipo pequeño no tiene forma de "recibir hover", por lo que se muestra sin girar, sin que eso impida ver la navegación común ni usarla.
- El recurso del logotipo no llega a cargar (fallo de red): la página de inicio y la navegación común deben seguir siendo utilizables, mostrando un espacio reservado en vez de romper el diseño.
- El PDF se imprime en blanco y negro: el logotipo debe seguir siendo reconocible aunque se pierda el color.
- Pantallas muy estrechas (móvil pequeño): el logotipo grande de inicio y el pequeño de la navegación deben escalar sin desbordar ni solapar el resto de contenido.
- Un presupuesto en cualquiera de los cinco estados: tras el cambio de paleta, su etiqueta de estado debe seguir siendo identificable de un vistazo, igual que antes del rediseño de color.

## Clarifications

### Session 2026-09-28

- Q: Para los cinco estados del presupuesto (Borrador, Enviado, Aceptado, Rechazado, Caducado), ¿los colores de sus etiquetas deben limitarse estrictamente a los tonos del logotipo, o se permite añadir colores semánticos adicionales fuera de esa paleta para distinguirlos con claridad? → A: Flexible — la paleta general de la interfaz se basa en el logotipo, pero las etiquetas de estado pueden usar colores semánticos adicionales (por ejemplo, rojo o ámbar) cuando sea necesario para mantenerlos distinguibles.
- Q: ¿El logotipo pequeño de la navegación común debe funcionar también como enlace a la página de Inicio al hacer clic o activarlo por teclado, o es puramente decorativo? → A: Es un enlace: al hacer clic (o activarlo por teclado) lleva a la página de Inicio, además de girar al pasar el ratón.
- Q: ¿La animación de giro de los logotipos debe desactivarse cuando el sistema del usuario tiene activada la preferencia de accesibilidad "reducir movimiento", o deben girar siempre igual para todos los usuarios? → A: Sí, deben desactivarse: cuando el sistema indique "reducir movimiento", los logotipos se muestran estáticos (sin animación de giro).

## Requirements *(mandatory)*

### Functional Requirements

**Logotipo en la página de inicio**

- **FR-001**: El sistema MUST mostrar el logotipo de marca en tamaño grande y destacado en la página de inicio, manteniendo en ella los accesos a las cuatro secciones (Presupuestos, Clientes, Catálogo, Perfil) y el resumen de actividad ya existentes.
- **FR-002**: El logotipo grande de la página de inicio MUST mostrar una animación de giro continuo mientras la página está abierta.
- **FR-003**: El logotipo grande MUST mostrarse estático, sin animación de giro, cuando el navegador indique que el usuario tiene activada la preferencia de sistema "reducir movimiento".

**Logotipo en la navegación común**

- **FR-004**: El sistema MUST mostrar el logotipo de marca en tamaño pequeño dentro de la navegación común, visible en todas las páginas de la aplicación, funcionando como enlace a la página de Inicio al hacer clic sobre él o al activarlo con el teclado.
- **FR-005**: El logotipo pequeño MUST girar mientras el puntero del ratón permanece sobre él, y MUST dejar de girar cuando el puntero se retira, sin que esa animación interfiera con su función de enlace a Inicio.
- **FR-006**: En dispositivos sin puntero (táctiles), el logotipo pequeño MUST seguir siendo visible en la navegación común aunque no se anime, sin que ninguna funcionalidad de la navegación dependa de esa animación.
- **FR-007**: El logotipo pequeño MUST mostrarse estático cuando el navegador indique que el usuario tiene activada la preferencia de sistema "reducir movimiento".

**Logotipo en el PDF**

- **FR-008**: El sistema MUST incluir el logotipo de marca, en su versión estática (sin animación), en la plantilla del PDF de presupuesto entregado al cliente.
- **FR-009**: El logotipo incluido en el PDF MUST mantener un tamaño y una ubicación que no interfieran con la lectura de los datos del presupuesto ni de su desglose de importes.

**Nueva paleta de colores**

- **FR-010**: El sistema MUST sustituir la paleta de colores general de toda la aplicación (interfaz y PDF) por una nueva paleta derivada de los colores del logotipo de marca, definida en un único lugar de referencia para toda la aplicación.
- **FR-011**: El sistema MUST aplicar la nueva paleta derivada del logotipo de forma consistente en todas las pantallas y en la plantilla del PDF, sin combinar colores de la paleta anterior (la definida en la especificación 002) con la nueva.
- **FR-012**: El sistema MUST mantener cada uno de los cinco estados del presupuesto (Borrador, Enviado, Aceptado, Rechazado, Caducado) visualmente distinguible de los demás tras aplicar la nueva paleta, con un contraste de texto sobre fondo suficiente para ser legible (mínimo equivalente a WCAG AA, ratio 4.5:1); para ello, las etiquetas de estado MAY usar colores semánticos adicionales fuera de la paleta derivada del logotipo (por ejemplo, rojo o ámbar) cuando sea necesario para garantizar esa distinción, definidos también en el mismo lugar único de referencia.
- **FR-013**: El sistema MUST conservar, aplicando sobre ellos la nueva paleta, la tipografía consistente, el espaciado uniforme y la jerarquía visual clara entre títulos, tablas, formularios y totales ya establecidos.

**Continuidad con las especificaciones 001 y 002**

- **FR-014**: El sistema MUST mantener sin ningún cambio la lógica de negocio, los cálculos de importes, la API y el esquema de datos ya existentes.
- **FR-015**: El sistema MUST mantener sin cambios la página de inicio, la navegación común y el resto de comportamientos ya entregados en la especificación 002 (accesos a las cuatro secciones, resumen de actividad, indicadores de carga, avisos de error, cambio de estado del presupuesto, etc.), incorporando únicamente el logotipo y la nueva paleta descritos en esta especificación.
- **FR-016**: El sistema MUST conservar el enfoque mobile-first ya existente, incluyendo el comportamiento del logotipo grande, el logotipo pequeño y la navegación común en pantallas de móvil.
- **FR-017**: Todos los textos de la interfaz y del PDF MUST permanecer en español de España.

**Accesibilidad**

- **FR-018**: El logotipo pequeño de la navegación, al ser un enlace a Inicio, MUST ser operable mediante teclado igual que el resto de elementos de la navegación común (foco visible y activación con Intro/Espacio), sin que la animación de giro sea necesaria para su uso.
- **FR-019**: El logotipo pequeño MUST tener un nombre accesible para lectores de pantalla (por ejemplo, "Ir a Inicio") que describa su función de enlace, en vez de tratarse como una imagen puramente decorativa sin descripción.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las cargas de la página de inicio muestran el logotipo grande girando (o estático si el usuario tiene activada la preferencia de reducir movimiento), sin afectar a los accesos a las cuatro secciones ni al resumen de actividad.
- **SC-002**: En el 100 % de las páginas de la aplicación, el logotipo pequeño de la navegación común gira al pasar el ratón por encima y deja de girar al retirarlo.
- **SC-003**: El 100 % de los PDF de presupuesto generados incluyen el logotipo de marca en su versión estática, sin alterar ningún dato ni importe del presupuesto.
- **SC-004**: El 100 % de las pantallas de la aplicación y la plantilla del PDF comparten la misma paleta de colores basada en el logotipo, verificable mediante comparación visual directa entre pantallas.
- **SC-005**: Un freelancer puede identificar el estado de un presupuesto (Borrador, Enviado, Aceptado, Rechazado, Caducado) de un vistazo en cualquier listado tras el cambio de paleta, en el 100 % de los casos.
- **SC-006**: Tras el rediseño, los cálculos de cualquier presupuesto siguen produciendo exactamente los mismos resultados que antes (por ejemplo, el caso de referencia de líneas de 1.500,00 € y 500,00 € con retención del 15 % sigue dando un total de 2.120,00 €).
- **SC-007**: Los usuarios con la preferencia de sistema "reducir movimiento" activada no ven ninguna animación de giro en ningún logotipo, en el 100 % de los casos, viendo en su lugar el logotipo estático.

## Assumptions

- El logotipo de marca ya existente (los ficheros de marca `logo-rm.svg` y `logo-rm.png` disponibles en el proyecto) es la fuente tanto del logotipo a mostrar como de los colores base de la nueva paleta (verde oscuro, verde menta, cian y verde claro definidos en él).
- El logotipo grande de la página de inicio gira de forma continua y automática mientras la página está abierta; el logotipo pequeño de la navegación común gira únicamente como respuesta a pasar el ratón por encima (hover), tal y como distingue el propio encargo entre ambos.
- El único documento imprimible de la aplicación hoy es el PDF de presupuesto ya definido en la especificación 001; la incorporación del logotipo "en todos los documentos que se impriman" se refiere a ese PDF, que es el único existente.
- La nueva paleta de colores debe seguir permitiendo distinguir sin ambigüedad los cinco estados del presupuesto ya definidos en la especificación 002; para lograrlo, las etiquetas de estado pueden incorporar colores semánticos adicionales fuera de la gama estricta del logotipo (ver Clarifications), mientras que el resto de la interfaz (fondos, botones, títulos) usa exclusivamente la paleta derivada del logotipo.
- El giro del logotipo es un efecto decorativo y de identidad de marca; no sustituye ni interfiere con ningún indicador de carga, aviso de error o control de cambio de estado ya existente en la especificación 002.
