# Research & Decisiones Técnicas: PresupuestosPro v0

**Fecha**: 2026-09-26
**Spec**: [spec.md](./spec.md)

Este documento no resuelve ambigüedades de negocio (ya se resolvieron todas en
la spec, sección Clarifications). Resuelve las decisiones de arquitectura
necesarias para poder empezar a construir, aplicando el Principio I de la
constitution (Simplicidad ante todo) y las restricciones que ha dado el
negocio para esta v1: publicarse online cuanto antes, funcionar bien en
móvil, sin cuentas de usuario y sin base de datos en la nube.

---

## Decisión 1 — Dónde vive la aplicación: solo en el navegador, sin servidor propio

**Decisión**: PresupuestosPro v1 es una aplicación que se ejecuta entera en el
navegador del freelancer (una "SPA" — single-page app). No hay servidor de
aplicación, no hay API propia, no hay base de datos en la nube.

**Por qué (en términos de negocio)**: la spec dice que la aplicación la usa
un único freelancer, sin cuentas ni acceso multiusuario, y que los datos se
guardan localmente sin sincronizar con la nube. Si no hay que compartir datos
entre usuarios ni dispositivos, montar un servidor y una base de datos añade
coste de mantenimiento (facturación de hosting, actualizaciones de
seguridad, copias de seguridad del servidor) sin aportar ningún valor que el
freelancer haya pedido. Al no haber servidor, publicar la aplicación es tan
sencillo como subir unos ficheros a cualquier alojamiento de páginas web
estáticas: se puede tener online en minutos y no hay "backend" que se pueda
caer.

**Alternativas consideradas**:
- *Servidor propio + base de datos (ej. Node.js + PostgreSQL)*: descartado.
  Añade una pieza de infraestructura (el servidor) que hay que contratar,
  desplegar y mantener, para un caso de un único usuario sin necesidad de
  compartir datos. Iría contra el Principio I de la constitution.
- *Backend "sin servidor" (funciones cloud) con base de datos gestionada*:
  descartado por el mismo motivo — el enunciado del usuario pide
  explícitamente no añadir base de datos en la nube en esta versión.

---

## Decisión 2 — Dónde se guardan los datos: en el propio navegador (localStorage)

**Decisión**: el perfil del freelancer, el catálogo de servicios, la lista
de clientes y todos los presupuestos se guardan en el `localStorage` del
navegador, como datos estructurados (JSON). El logo se guarda como imagen
codificada dentro del mismo almacenamiento, sin ficheros externos.

**Por qué (en términos de negocio)**: la spec exige que los datos sobrevivan
a cerrar y abrir la aplicación (FR-018), pero no exige que estén disponibles
desde varios dispositivos ni que se compartan con nadie. El almacenamiento
del propio navegador cumple exactamente eso, sin necesidad de contratar ni
mantener ninguna base de datos, y sin pedir al freelancer que cree ninguna
cuenta. Es la opción más simple que resuelve el requisito real.

**Contrapartida asumida**: si el freelancer borra los datos del navegador, o
cambia de ordenador, no se lleva sus presupuestos con él — hoy la spec no
pide lo contrario (ver Assumptions de la spec: "sin sincronización en la
nube ni entre dispositivos"). Si en el futuro se pide poder trabajar desde
varios dispositivos, esa sería una feature nueva con su propia decisión de
almacenamiento (por ejemplo, en ese momento sí tendría sentido evaluar una
base de datos en la nube), no algo que haya que resolver en esta v1.

**Alternativas consideradas**:
- *IndexedDB*: más potente (soporta más volumen de datos y tipos binarios de
  forma nativa), pero su API es más compleja de programar y probar que
  `localStorage`. Para el volumen de datos de un único freelancer (perfil,
  catálogo, clientes y presupuestos de uso normal), `localStorage` es
  suficiente y más simple. Si en el futuro el volumen de presupuestos
  creciera mucho, migrar a IndexedDB sería un cambio interno, sin ningún
  impacto para el freelancer.

---

## Decisión 3 — Cómo se genera el PDF: en el propio navegador, sin servicio externo

**Decisión**: el PDF del presupuesto se genera en el navegador del propio
freelancer, en el momento de pulsar "descargar PDF", usando una librería de
generación de PDF que corre en JavaScript (jsPDF, con su complemento de
tablas). No se envía ningún dato a un servicio externo para fabricar el PDF.

**Por qué (en términos de negocio)**: generar el PDF fuera del navegador
(por ejemplo, mandando los datos a un servicio en la nube que devuelve un
PDF) obligaría a tener un servidor y expondría los datos del freelancer y
de sus clientes a un tercero, sin necesidad. Generándolo en el propio
navegador, el dato nunca sale del dispositivo del freelancer hasta que él
decide enviar el PDF a su cliente, lo cual es coherente con el Principio V
de la constitution (pedir y mover solo los datos imprescindibles).

**Alternativas consideradas**:
- *Servicio en la nube que genera el PDF*: descartado, requiere servidor y
  expone datos innecesariamente.
- *"Foto" de la pantalla convertida a PDF (html-to-canvas)*: descartado
  frente a construir la tabla de líneas e importes de forma explícita
  (jsPDF + tabla), porque el PDF es el único entregable que llega de
  verdad al cliente del freelancer (Historia de Usuario 3): conviene que su
  maquetación (alineación de columnas, salto de página si hay muchas
  líneas) sea fiable y no dependa de cómo se vea la pantalla en ese momento
  en un navegador concreto.

---

## Decisión 4 — Cómo se evitan errores de céntimos en los cálculos

**Decisión**: todos los importes de dinero (líneas, base imponible, IVA,
retención, total) se calculan internamente en céntimos (números enteros), y
solo se convierten a euros con 2 decimales al mostrarlos o al escribirlos en
el PDF. El redondeo final de cada importe usa la regla "0,5 hacia arriba"
que pide la spec (FR-020).

**Por qué (en términos de negocio)**: el freelancer necesita que el total
del presupuesto sea exacto siempre — es un documento con el que le va a
cobrar a su cliente, no puede tener un céntimo de diferencia según el
navegador o el orden de los cálculos. Trabajar con números enteros
(céntimos) en vez de con decimales evita un problema conocido de cualquier
programa que calcula con decimales (errores de redondeo minúsculos que se
acumulan), garantizando que el resultado mostrado en pantalla y el que
aparece en el PDF final coincidan siempre, en el 100 % de los casos, tal y
como pide el criterio de éxito SC-002 de la spec.

**Alternativas consideradas**:
- *Calcular directamente en euros con decimales*: descartado por el riesgo
  de errores de redondeo minúsculos pero reales en cálculos de dinero, que
  además son difíciles de detectar a simple vista.

---

## Decisión 5 — Con qué piezas se construye la pantalla (framework de interfaz)

**Decisión**: se construye como una aplicación de una sola página con Vue 3
(usando Vite como herramienta de construcción) y navegación interna simple
entre las pantallas de Perfil, Catálogo de servicios, Clientes, Lista de
presupuestos y Detalle/edición de un presupuesto.

**Por qué (en términos de negocio)**: la aplicación tiene varias pantallas
con formularios (perfil, catálogo, clientes, líneas de presupuesto) donde
los importes se tienen que recalcular solos en cuanto el freelancer cambia
un dato (FR-011, SC-006). Hacer eso a mano, sin ninguna ayuda, es fácil de
programar mal y da pie a que el total mostrado en pantalla se desincronice
del total real — justo el problema que la Historia de Usuario 2 quiere
evitarle al freelancer. Vue es una herramienta pequeña y muy extendida que
resuelve ese "recalcular solo" de forma fiable, sin necesitar programar
ningún servidor ni backend adicional: sigue siendo una página web estática
al publicarse.

**Alternativas consideradas**:
- *HTML/JavaScript "a mano", sin ninguna librería*: descartado. Para cuatro
  pantallas con formularios y recálculo en vivo, el código a mano necesario
  para mantener la pantalla sincronizada con los datos sería más complejo
  de mantener (y más fácil de romper) que apoyarse en Vue.
- *React*: opción igualmente válida y de complejidad similar; se descarta
  solo por preferir la sintaxis más cercana a HTML de Vue, que resulta más
  simple de leer para las pantallas de formulario de esta aplicación. No hay
  un motivo de negocio fuerte para esta elección — es intercambiable.

---

## Decisión 6 — Cómo se publica online

**Decisión**: la aplicación se compila (`vite build`) en un conjunto de
ficheros estáticos (HTML, CSS y JavaScript) que se puede publicar en
cualquier alojamiento de páginas web estáticas (por ejemplo Netlify, Vercel
o Cloudflare Pages, todos con un plan gratuito adecuado para este uso). La
navegación interna usa un modo de rutas ("hash", del tipo `#/presupuestos`)
que funciona en cualquier alojamiento estático sin configuración especial
del servidor.

**Por qué (en términos de negocio)**: el encargo pide que la v1 se pueda
publicar online enseguida. Al no depender de ningún servidor ni base de
datos propia (Decisiones 1 y 2), "publicar" se reduce a subir los ficheros
generados a un alojamiento estático, lo cual se puede hacer el mismo día,
sin esperar a contratar ni configurar ninguna infraestructura, y sin coste
para un uso de un único freelancer.

**Alternativas consideradas**:
- *Rutas "normales" (sin `#`)*: requieren que el alojamiento esté
  configurado para redirigir todas las rutas a la aplicación; se descarta
  para no depender de esa configuración adicional y así garantizar que
  "subir los ficheros" es siempre suficiente para publicar.

---

## Decisión 7 — Cómo se comprueba que los cálculos son correctos

**Decisión**: la lógica de cálculo de impuestos y de numeración de
presupuestos se prueba con pruebas automáticas (Vitest, la herramienta de
pruebas que acompaña a Vite), además de poder comprobarse a mano en la
propia aplicación como pide el Principio IV de la constitution.

**Por qué (en términos de negocio)**: el cálculo de impuestos es el corazón
del producto (Historia de Usuario 2): un error de céntimos en un
presupuesto es un error de cara al cliente del freelancer, con impacto
económico y de imagen. Tener pruebas automáticas de esta lógica concreta no
es una funcionalidad nueva ni alcance añadido (no contradice el Principio
III): es la forma de tener certeza continua de que el criterio de éxito
SC-002 ("2.120,00 € siempre, sin cálculo manual") sigue cumpliéndose cada
vez que se toque el código, sin depender de que alguien repita la prueba
manual cada vez.

---

## Resumen de dependencias añadidas

| Pieza | Para qué | Tipo de coste |
|---|---|---|
| Vite | construir y servir la aplicación | herramienta de desarrollo, no se publica |
| Vue 3 + Vue Router | pantallas y navegación | librería en el navegador del freelancer |
| jsPDF + jspdf-autotable | generar el PDF en el navegador | librería en el navegador del freelancer |
| Vitest | pruebas automáticas de los cálculos | herramienta de desarrollo, no se publica |

No se añade ningún servidor, base de datos, servicio en la nube de terceros,
ni sistema de cuentas de usuario.
