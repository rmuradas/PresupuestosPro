# Research: Rediseño visual, página de inicio y persistencia en base de datos

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

Cada decisión resuelve un "NEEDS CLARIFICATION" del Technical Context del
plan, o fija una elección técnica que no estaba prescrita por la spec pero
que había que tomar para poder diseñar. Están escritas en lenguaje de
negocio: qué se eligió, por qué, y qué otras opciones se descartaron y por
qué.

---

## Decisión 1: Backend en Node.js + Express, sirviendo también el frontend

**Decisión**: Se añade un único proceso Node.js (`backend/`) que hace dos
cosas: expone la API JSON bajo `/api/*`, y sirve los ficheros ya
compilados del frontend (`dist/`) como estáticos. Es ese mismo proceso el
que, al recibir una petición a la raíz (`/`), entrega `index.html` — con
lo que "acceder a la raíz del servidor" (FR-004) se cumple de forma
directa, sin lógica adicional.

**Razón**: Es la forma más simple de cumplir a la vez "gestionar una base
de datos", "servir una página de inicio en la raíz del servidor" y "APIs
en JSON" tal y como pide la descripción de la feature, usando el mismo
lenguaje que ya tiene el proyecto (JavaScript) y sin añadir una segunda
herramienta de build.

**Alternativas consideradas**:
- **Seguir sin backend** (mantener 001 tal cual): rechazada porque no se
  puede tener una base de datos gestionada por el servidor ni una API JSON
  sin que exista un servidor que las atienda; contradice directamente
  FR-001 a FR-004.
- **Framework backend más "pesado"** (NestJS, Fastify con plugins, etc.):
  rechazado por complejidad innecesaria para ~15 endpoints CRUD sencillos;
  Express es la opción mínima y más estándar para exactamente este tamaño
  de problema (Principio I, Simplicidad).
- **Servidor de ficheros estáticos aparte + backend de API aparte** (dos
  procesos): rechazada porque obliga a gestionar CORS y dos puertos para
  un beneficio nulo en una instalación de un único freelancer; un solo
  proceso es más simple de arrancar y de desplegar.

---

## Decisión 2: Base de datos SQLite en fichero, vía `better-sqlite3`

**Decisión**: La base de datos es un único fichero SQLite
(`backend/data/presupuestospro.db`), gestionado con la librería
`better-sqlite3` (API síncrona).

**Razón**: Cumple "gestionar una base de datos" sin exigir instalar ni
mantener un servidor de base de datos aparte (Postgres, MySQL...), lo cual
sería una complejidad no pedida para una instalación de un único
freelancer. La API síncrona de `better-sqlite3` evita además tener que
introducir manejo de promesas/callbacks en cada ruta del backend, lo que
mantiene el código de persistencia tan simple como el de 001 (que también
era síncrono).

**Alternativas consideradas**:
- **PostgreSQL / MySQL**: rechazadas por exigir un servidor de base de
  datos externo que instalar, configurar y mantener — complejidad que la
  constitution (Principio I) pide evitar cuando no resuelve un problema
  real de esta v2 (que sigue siendo de un único freelancer).
- **Fichero JSON en disco (equivalente a `localStorage` pero en el
  servidor)**: rechazada porque no da garantías transaccionales; el
  contador de numeración anual (FR-012, ya crítico en 001) necesita que
  "leer el último número usado, sumarle 1 y guardarlo" sea una operación
  atómica para no duplicar números si dos peticiones llegan casi a la vez,
  algo que una base de datos real resuelve de forma nativa y un fichero
  JSON no.
- **`sqlite3` (driver asíncrono clásico)**: rechazado frente a
  `better-sqlite3` por añadir complejidad de callbacks/promesas sin
  ninguna ventaja real a este volumen de peticiones (un único usuario).

---

## Decisión 3: La lógica de negocio (cálculos e IVA/IRPF) sigue viviendo en el frontend

**Decisión**: Las funciones puras de `src/calculo/` (base imponible, IVA,
retención, total, redondeo) no se mueven al backend. El backend solo
persiste los datos que el frontend ya calculó y valida. La única pieza de
lógica que sí se traslada al backend es la asignación del número
correlativo de presupuesto (FR-012), porque necesita ser atómica con la
escritura en la base de datos (ver Decisión 2).

**Razón**: FR-020 y FR-021 exigen no tocar la lógica de negocio ni el
esquema de datos de 001. Moverla al backend sería un cambio de diseño no
pedido y añadiría el riesgo de que cálculo en pantalla (mientras el
freelancer edita, antes de guardar) y cálculo guardado diverjan. Mantener
el cálculo en el frontend, tal y como ya funciona hoy, es la opción que
menos toca lo que ya funciona.

**Alternativas consideradas**:
- **Mover todo el cálculo al backend** (patrón más "clásico" de apps con
  base de datos): rechazada porque no aporta nada a esta feature (no pide
  cambiar los cálculos) y sí introduce riesgo de duplicar o desincronizar
  lógica ya validada en 001.

---

## Decisión 4: El frontend sigue con enrutado en modo hash (`createWebHashHistory`)

**Decisión**: No se cambia el modo de enrutado de Vue Router. Sigue siendo
`createWebHashHistory` (rutas tipo `#/perfil`), igual que en 001.

**Razón**: Con rutas en modo hash, el navegador nunca pide al servidor
nada distinto de `/` (todo lo que va después del `#` se resuelve en el
propio navegador). Eso significa que el backend nuevo solo necesita saber
servir dos cosas: los ficheros estáticos de `dist/` y las rutas `/api/*`
— sin necesitar una ruta de "fallback" que reenvíe cualquier URL
desconocida a `index.html` (como sí haría falta con el modo "historia"
normal). Es la opción que menos código de servidor exige para cumplir
FR-004 (página de inicio en la raíz).

**Alternativas consideradas**:
- **Cambiar a `createWebHistory` (rutas sin `#`)**: rechazada porque, aun
  siendo más "bonita" a nivel de URL, obliga a añadir al backend una regla
  de fallback (cualquier ruta que no sea `/api/*` debe devolver
  `index.html`) — complejidad de servidor que no aporta nada a lo que pide
  la spec 002.

---

## Decisión 5: Estado del presupuesto — un valor guardado + un valor efectivo calculado

**Decisión**: Se guarda en la base de datos un campo `estado` con uno de
cuatro valores manuales: `borrador` (por defecto), `enviado`, `aceptado`,
`rechazado` (ver Clarifications de spec.md). El quinto valor, `caducado`,
**no se guarda nunca**: se calcula en el momento de leer el presupuesto,
comparando su `fechaValidez` con la fecha de hoy, y solo se aplica si el
estado guardado es `borrador` o `enviado` (nunca sobre `aceptado` o
`rechazado`, tal y como se aclaró en la sesión de clarificación). A este
valor calculado se le llama **estado efectivo**, y es el que ve el
freelancer en pantalla.

**Razón**: Guardar "caducado" como un valor más obligaría a un proceso
en segundo plano que recorra todos los presupuestos cada día para
actualizarlo — complejidad de servidor (tareas programadas) que no aporta
nada frente a calcularlo al vuelo, que es instantáneo y siempre exacto sin
importar cuánto tiempo lleve la aplicación cerrada.

**Alternativas consideradas**:
- **Guardar `caducado` como un valor más del campo `estado`, actualizado
  por un job programado**: rechazada por la complejidad operativa de
  mantener un proceso en segundo plano (Principio I), y porque además
  podría no ejecutarse si el servidor está apagado, dejando estados
  desactualizados.

---

## Decisión 6: Migración de los datos antiguos de `localStorage`, iniciada por el propio navegador

**Decisión**: La primera vez que el frontend arranca contra el backend
nuevo, comprueba si la base de datos está vacía; si lo está y el navegador
todavía tiene datos guardados con el formato de 001 en `localStorage`,
los envía una única vez al backend (`POST /api/migracion`) con todo el
contenido en el cuerpo JSON. El backend los inserta tal cual (perfil,
servicios, clientes, presupuestos con `estado = 'borrador'` por defecto,
ya que 001 no tenía ese campo) y responde con éxito; el frontend entonces
dejar de leer `localStorage` en adelante.

**Razón**: Es la forma más simple de cumplir FR-002 (no perder datos ya
guardados) sin construir una herramienta de migración aparte ni pedirle al
freelancer ningún paso manual: ocurre sola la primera vez que abre la
aplicación ya actualizada.

**Alternativas consideradas**:
- **Script de migración de línea de comandos, ejecutado a mano por el
  freelancer**: rechazada por añadir un paso manual y técnico que un
  freelancer sin conocimientos técnicos no debería tener que hacer
  (Principio IV).

---

## Decisión 7: Variables CSS en `public/css/estilos.css`, enlazadas desde `index.html`

**Decisión**: Toda la paleta de colores, tipografía y espaciado se define
como variables CSS (`:root { --color-...; --font-...; --space-...; }`) en
un único fichero, `public/css/estilos.css`, enlazado directamente desde
`index.html` con `<link rel="stylesheet">`. Los estilos de cada
componente Vue usan esas variables (`var(--color-primario)`) en vez de
valores de color o tamaño sueltos. El fichero `src/assets/base.css` de 001
se retira.

**Razón**: `public/` es la carpeta de Vite pensada exactamente para
ficheros que se sirven tal cual, sin pasar por el empaquetado — lo que
convierte a `estilos.css` en el único lugar de referencia real (FR-014),
tanto para el frontend en pantalla como, según la Decisión 8, para el PDF.
No hace falta añadir Sass, PostCSS ni ningún framework de utilidades: CSS
estándar con variables ya resuelve "un único lugar" y "paleta limitada"
sin herramientas nuevas (Principio I).

**Alternativas consideradas**:
- **Preprocesador (Sass/LESS) con variables propias**: rechazado por
  añadir un paso de compilación adicional que no aporta nada que las
  variables CSS nativas no den ya.
- **Librería de utilidades tipo Tailwind**: rechazada por ser un cambio de
  enfoque de estilos mucho mayor del que pide la spec (que solo pide
  consistencia y un único lugar de definición, no una metodología nueva).

---

## Decisión 8: El PDF lee los colores desde las mismas variables CSS, en tiempo de generación

**Decisión**: `generarPdfPresupuesto.js` no vuelve a escribir los códigos
de color a mano. En el momento de generar el PDF (que ocurre en el propio
navegador), lee los valores actuales de las variables CSS con
`getComputedStyle(document.documentElement).getPropertyValue('--color-...')`
y los usa para dibujar cabeceras, tablas y totales en el PDF.

**Razón**: Es la única forma de que "un único lugar" (FR-014) sea cierto
también para el PDF (FR-017) sin mantener la paleta duplicada a mano en
dos sitios (el CSS y el código del PDF), que es justo el tipo de
inconsistencia que esta feature quiere eliminar.

**Alternativas consideradas**:
- **Duplicar los valores de color como constantes JavaScript en el módulo
  del PDF**: rechazada porque reintroduce exactamente el problema que
  FR-014 quiere resolver (dos sitios que mantener sincronizados a mano).

---

## Resumen de decisiones

| # | Decisión | Categoría |
|---|---|---|
| 1 | Backend Node.js + Express, sirve API y frontend | Arquitectura |
| 2 | SQLite en fichero vía `better-sqlite3` | Persistencia |
| 3 | Cálculos de negocio siguen en el frontend | Continuidad con 001 |
| 4 | Enrutado del frontend sigue en modo hash | Arquitectura |
| 5 | Estado guardado (4 valores) + estado efectivo calculado (Caducado) | Modelo de datos |
| 6 | Migración automática de `localStorage` en el primer arranque | Continuidad con 001 |
| 7 | Variables CSS centralizadas en `public/css/estilos.css` | Diseño visual |
| 8 | El PDF lee la paleta desde las variables CSS en tiempo de generación | Diseño visual |

Todas las incógnitas del Technical Context del plan quedan resueltas; no
queda ningún `NEEDS CLARIFICATION` pendiente.
