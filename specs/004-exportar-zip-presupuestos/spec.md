# Feature Specification: Exportar todos los presupuestos en un .zip

**Feature Branch**: `004-exportar-zip-presupuestos`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Exportar todos mis presupuestos en un .zip — botón que descarga un único .zip con un PDF por cada presupuesto existente (idéntico al que ya genera la app) más un archivo de datos con presupuestos, catálogo de servicios y perfil del freelancer (logo incluido), pensado para restaurar la app en el futuro. Sirve como copia de seguridad ante pérdida de datos del navegador."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Copia de seguridad completa con un clic (Priority: P1)

Como freelancer que tiene sus presupuestos guardados en la aplicación, quiero
pulsar un único botón "Exportar todo (.zip)" desde la lista de presupuestos y
recibir un solo archivo .zip descargado con todos mis presupuestos en PDF y un
archivo con todos mis datos, para tener una copia de seguridad completa que
pueda guardar donde quiera (un disco externo, la nube, un email a mí mismo).

**Why this priority**: Es la razón de ser de la feature. Sin esto no hay
producto: es la única funcionalidad de la spec y la que resuelve el riesgo
real (perder todos los datos si el navegador se borra).

**Independent Test**: Con al menos un presupuesto creado, pulsar el botón y
comprobar que se descarga un único .zip que, al descomprimirse, contiene un
PDF por presupuesto y un archivo de datos legible.

**Acceptance Scenarios**:

1. **Given** el freelancer tiene 3 presupuestos creados, **When** pulsa
   "Exportar todo (.zip)", **Then** el navegador descarga un único archivo
   llamado `presupuestospro-copia-AAAA-MM-DD.zip` (con la fecha del día de la
   exportación).
2. **Given** el .zip descargado, **When** el freelancer lo descomprime,
   **Then** ve 3 archivos PDF, cada uno nombrado como "número - cliente"
   (ejemplo: "2026-001 - Estudio García.pdf"), y un único archivo de datos
   adicional.
3. **Given** un PDF dentro del .zip, **When** el freelancer lo abre y lo
   compara con el PDF que la app genera para ese mismo presupuesto desde su
   pantalla de detalle, **Then** ambos son idénticos, céntimo a céntimo, en
   todos sus importes (base, IVA, IRPF, total).
4. **Given** el freelancer acaba de exportar, **When** vuelve a la
   aplicación, **Then** todos sus presupuestos, catálogo de servicios y perfil
   siguen exactamente igual que antes de exportar (la exportación es de solo
   lectura).

---

### User Story 2 - Aviso cuando no hay nada que exportar (Priority: P2)

Como freelancer que aún no ha creado ningún presupuesto, quiero que al pulsar
"Exportar todo (.zip)" se me avise de que no hay nada que exportar, en lugar
de recibir un archivo vacío o confuso, para no perder tiempo revisando un
.zip sin contenido útil.

**Why this priority**: Es un caso límite claramente descrito en el encargo y
evita una mala experiencia (descargar un .zip vacío o roto), pero no bloquea
el valor principal de la Historia 1.

**Independent Test**: Con la aplicación sin presupuestos creados, pulsar el
botón y comprobar que aparece un aviso y no se descarga ningún archivo.

**Acceptance Scenarios**:

1. **Given** el freelancer no tiene ningún presupuesto creado, **When** pulsa
   "Exportar todo (.zip)", **Then** ve un mensaje claro indicando que no hay
   presupuestos que exportar y no se inicia ninguna descarga.

---

### User Story 3 - Exportación fiable con nombres de cliente difíciles o muchos presupuestos (Priority: P3)

Como freelancer con nombres de cliente que incluyen caracteres especiales, o
con un historial largo de presupuestos, quiero que la exportación funcione
igual de bien y me indique que está trabajando cuando tarda, para poder
confiar en el .zip resultante sin importar cuántos presupuestos tenga ni cómo
se llamen mis clientes.

**Why this priority**: Refina la robustez de la Historia 1 para los casos
límite explícitos del encargo (caracteres conflictivos, volumen alto), pero
la funcionalidad básica ya es útil sin este refinamiento.

**Independent Test**: Crear un presupuesto para un cliente con caracteres
como "/" en el nombre y exportar; comprobar que el .zip se genera sin errores
y el PDF correspondiente tiene un nombre de archivo válido y reconocible.
Repetir con un número alto de presupuestos (50 o más) y comprobar que la
interfaz muestra que la exportación está en curso hasta que termina.

**Acceptance Scenarios**:

1. **Given** un presupuesto para el cliente "Diseño/Web S.L.", **When** se
   exporta, **Then** el .zip se genera correctamente y el nombre del PDF
   correspondiente sustituye los caracteres conflictivos por uno seguro,
   manteniendo el número y el nombre del cliente reconocibles.
2. **Given** 50 o más presupuestos creados, **When** el freelancer pulsa
   "Exportar todo (.zip)", **Then** la interfaz muestra una indicación visible
   de que la exportación está en curso hasta que la descarga se completa.

---

### Edge Cases

- Sin presupuestos: aviso claro, ninguna descarga ni .zip vacío generado.
- Nombre de cliente con caracteres no válidos para nombres de archivo (`/`,
  `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`): se sustituyen por un carácter
  seguro sin perder legibilidad del nombre del cliente ni el número de
  presupuesto.
- Dos presupuestos que, tras limpiar el nombre del cliente, generarían el
  mismo nombre de archivo: el número de presupuesto (siempre único) ya
  garantiza que el nombre final no se duplique.
- Volumen alto de presupuestos (50+): la operación puede tardar varios
  segundos; la interfaz debe reflejar que sigue trabajando y no debe parecer
  colgada.
- El freelancer cierra o navega fuera de la pantalla mientras se genera el
  .zip: la descarga en curso puede interrumpirse; no se considera un fallo
  del sistema, es un comportamiento estándar de descargas del navegador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un botón "Exportar todo (.zip)" en un
  lugar visible de la lista de presupuestos.
- **FR-002**: Al pulsar el botón, si existe al menos un presupuesto, el
  sistema DEBE generar y descargar un único archivo .zip.
- **FR-003**: El archivo .zip DEBE nombrarse
  `presupuestospro-copia-AAAA-MM-DD.zip`, usando la fecha del día en que se
  realiza la exportación.
- **FR-004**: El .zip DEBE contener un archivo PDF por cada presupuesto
  existente en el momento de la exportación.
- **FR-005**: Cada PDF dentro del .zip DEBE ser exactamente el mismo
  documento (mismo contenido, formato e importes) que la aplicación genera
  para ese presupuesto al descargarlo individualmente.
- **FR-006**: Cada PDF dentro del .zip DEBE nombrarse con el número de
  presupuesto seguido del nombre del cliente (formato "número - cliente",
  ejemplo: "2026-001 - Estudio García.pdf").
- **FR-007**: El sistema DEBE limpiar del nombre de archivo cualquier
  carácter que pueda causar problemas en el sistema de archivos o en el
  propio .zip (por ejemplo `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`),
  sustituyéndolo por un carácter seguro, sin perder la identificación del
  presupuesto.
- **FR-008**: El .zip DEBE contener, además de los PDF, un único archivo de
  datos con toda la información necesaria para restaurar la aplicación en el
  futuro: todos los presupuestos, el catálogo de servicios y el perfil del
  freelancer (incluido el logo).
- **FR-009**: La exportación DEBE ser una operación de solo lectura: no debe
  modificar, borrar ni alterar ningún presupuesto, servicio o dato de perfil
  existente.
- **FR-010**: Si no existe ningún presupuesto en el momento de pulsar el
  botón, el sistema DEBE mostrar un aviso claro de que no hay nada que
  exportar y NO DEBE descargar ningún archivo .zip.
- **FR-011**: Mientras se genera el .zip, el sistema DEBE mostrar una
  indicación visible de que la exportación está en curso, especialmente
  perceptible cuando hay un número alto de presupuestos.
- **FR-012**: El sistema DEBE completar la exportación con éxito
  independientemente del número de presupuestos existentes (desde 1 hasta
  como mínimo 200).

### Key Entities

- **Copia de exportación (.zip)**: archivo comprimido generado bajo demanda
  que agrupa, en un momento dado, todos los PDF de presupuestos existentes
  más un archivo de datos de respaldo. No se almacena en el sistema; se
  genera y se entrega al freelancer en el momento de la descarga.
- **Archivo de datos de respaldo**: documento único incluido en el .zip que
  recoge el estado completo de los datos del freelancer en el momento de la
  exportación (presupuestos, catálogo de servicios, perfil del freelancer y
  su logo), pensado para una futura restauración (fuera de alcance de esta
  spec).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un freelancer con presupuestos ya creados puede obtener una
  copia de seguridad completa de todos ellos en una sola acción (un clic) y
  un solo archivo descargado.
- **SC-002**: El 100% de los PDF incluidos en el .zip son idénticos, céntimo
  a céntimo, a los que la aplicación genera individualmente para esos mismos
  presupuestos.
- **SC-003**: Un freelancer sin conocimientos técnicos identifica sin ayuda,
  al descomprimir el .zip, qué PDF corresponde a qué presupuesto, solo
  leyendo el nombre de archivo.
- **SC-004**: Exportar con 0 presupuestos informa al freelancer de que no hay
  nada que exportar en menos de 1 segundo, sin generar ninguna descarga.
- **SC-005**: La exportación con 200 presupuestos se completa sin errores y
  sin que el freelancer piense que la aplicación se ha bloqueado (la interfaz
  muestra progreso durante toda la operación).
- **SC-006**: Tras exportar, el 100% de los presupuestos, servicios y datos
  de perfil permanecen exactamente iguales a como estaban antes de la
  exportación.

## Assumptions

- El archivo de datos de respaldo se genera en un formato legible por
  máquina pensado para una futura funcionalidad de importación (fuera de
  alcance de esta spec); no se pide que sea legible cómodamente por una
  persona.
- La generación del .zip ocurre en el momento de la descarga, a partir de
  los datos que ya existen en el sistema; no se guarda ninguna copia
  histórica de exportaciones anteriores.
- El botón "Exportar todo (.zip)" está disponible siempre que haya acceso a
  la lista de presupuestos; no se contempla ningún control de permisos
  adicional, en línea con el resto de la aplicación (un único
  freelancer/usuario por instalación).
- "Muchos presupuestos" para efectos de la Historia 3 se interpreta como 50
  o más, tal y como indica el encargo; no se fija un límite máximo superior
  al de 200 mencionado en los criterios de éxito, pero tampoco se exige
  soporte ilimitado.
- Si el nombre de cliente queda vacío tras la limpieza de caracteres (caso
  extremo no mencionado explícitamente), el nombre del presupuesto se
  mantiene igualmente identificable gracias al número, que nunca se limpia
  ni se omite.

## Out of Scope

- Importar o restaurar la copia de seguridad dentro de la aplicación: se
  tratará en una spec futura independiente.
- Exportar a formatos de hoja de cálculo (Excel, CSV) con estructura
  contable.
- Copias de seguridad automáticas o programadas: esta feature cubre
  únicamente la exportación bajo demanda mediante el botón descrito.
