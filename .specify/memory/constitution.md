<!--
Sync Impact Report
Version change: (plantilla sin rellenar) → 1.0.0
Ratificación inicial de la constitution del proyecto.

Principios definidos:
  I.   Simplicidad ante todo
  II.  Idioma y mercado
  III. Cero alcance fantasma
  IV.  Verificable por una persona no técnica
  V.   Datos del usuario con respeto

Secciones añadidas:
  - Restricciones del Producto
  - Flujo de Trabajo
  - Governance

Secciones eliminadas: ninguna (primera versión).
Plantillas dependientes: no requieren cambios para esta ratificación inicial;
  se revisarán en la próxima ejecución de /speckit-plan, /speckit-tasks y
  /speckit-analyze para confirmar alineación.
Seguimientos pendientes: ninguno.
-->

# PresupuestosPro Constitution

## Core Principles

### I. Simplicidad ante todo
Ante dos soluciones que resuelven el mismo problema, se elige siempre la más
simple. Esta es la versión 1 del producto: no se diseña pensando en escala
futura, en flexibilidad "por si acaso" ni en casos de uso que nadie ha
pedido todavía. Complejidad anticipada (abstracciones, configuración
opcional, capas extra) se rechaza salvo que resuelva un problema real que
existe hoy.

**Razón**: la complejidad prematura es la principal causa de retrasos y
errores en una v1. Simplificar ahora deja espacio para crecer después, con
información real de uso.

### II. Idioma y mercado
Todo el producto —interfaz, mensajes de error, textos de ayuda y los PDF
generados— se redacta en español de España. La moneda de la aplicación es
el euro (€); no se contempla ninguna otra moneda ni formato regional en
esta versión.

**Razón**: el producto tiene un mercado único y definido (freelancers en
España). Soportar varios idiomas o monedas sin necesidad real añade trabajo
sin beneficio.

### III. Cero alcance fantasma
No se implementa ninguna funcionalidad que no esté escrita explícitamente
en la spec de la feature correspondiente. Si durante el desarrollo surge
una idea nueva, una mejora o un "ya que estamos", se propone para su
evaluación por separado: no se construye dentro de la tarea en curso.

**Razón**: el alcance no controlado retrasa entregas y dificulta saber qué
se ha validado. Cada línea de código debe poder trazarse a un requisito
escrito.

### IV. Verificable por una persona no técnica
Cada criterio de éxito de cada feature debe poder comprobarse usando la
aplicación —haciendo clic, rellenando un formulario, mirando el resultado—
sin necesidad de leer código, logs ni consultas a base de datos. Si un
criterio no se puede formular así, no está bien escrito.

**Razón**: garantiza que "terminado" significa algo comprobable por
cualquiera, incluido el propio usuario final del producto, no solo por
quien lo programó.

### V. Datos del usuario con respeto
Solo se solicitan al usuario los datos imprescindibles para generar el
presupuesto (por ejemplo: datos del emisor, del cliente y de las líneas del
presupuesto). No se piden datos "por si sirven en el futuro". El código
fuente no contiene claves, tokens ni secretos de ningún tipo; estos se
gestionan siempre fuera del repositorio (variables de entorno u otro
mecanismo de configuración no versionado).

**Razón**: minimizar los datos recogidos reduce el riesgo para el usuario y
la responsabilidad del producto. Los secretos en código son una fuga de
seguridad conocida y evitable.

## Restricciones del Producto

- **Plataforma**: aplicación web.
- **Salida principal**: generación de presupuestos en formato PDF.
- **Usuario objetivo**: freelancers.

Estas restricciones fijan el marco del producto tal y como fue encargado.
Cualquier cambio de plataforma, formato de salida o público objetivo
requiere una enmienda a esta constitution, no una decisión tomada dentro de
una feature individual.

## Flujo de Trabajo

- Toda funcionalidad nueva se define primero en una spec antes de escribir
  código (ver Principio III).
- Una tarea de implementación no se considera completa si añade algo que no
  estaba escrito en la spec correspondiente.
- Los criterios de éxito de cada feature se redactan de forma que una
  persona no técnica pueda comprobarlos usando la aplicación (ver
  Principio IV), y se revisan con ese filtro antes de darlos por buenos.

## Governance

Esta constitution prevalece sobre cualquier otra práctica, plantilla o
preferencia individual dentro del proyecto. Ante un conflicto, gana la
constitution.

**Procedimiento de enmienda**: cualquier cambio a este documento se hace
editando este archivo y registrando el motivo del cambio en el Sync Impact
Report de la cabecera. Un cambio que elimine o redefina un principio
existente requiere justificación explícita.

**Política de versionado** (versionado semántico aplicado a esta
constitution):
- **MAJOR**: se elimina o se redefine de forma incompatible un principio.
- **MINOR**: se añade un principio o sección nueva, o se amplía de forma
  sustancial una guía existente.
- **PATCH**: aclaraciones de redacción, correcciones y ajustes que no
  cambian el significado.

**Revisión de cumplimiento**: cada spec, plan y tarea de implementación se
revisa frente a los cinco principios de este documento antes de darse por
válida. Cualquier complejidad, alcance o dato adicional que no encaje debe
justificarse por escrito o eliminarse.

**Version**: 1.0.0 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-09-26
