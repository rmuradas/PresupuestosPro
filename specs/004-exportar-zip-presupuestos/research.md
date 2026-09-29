# Fase 0 — Research: Exportar todos los presupuestos en un .zip

## 1. Cómo generar un .zip en el navegador

- **Decisión**: Usar la librería **JSZip** (cliente, sin backend) para
  ensamblar el .zip en memoria y descargarlo con un `Blob` + enlace temporal.
- **Racional**: No existe una API nativa de navegador para crear archivos
  .zip. JSZip es el estándar de facto para este caso (ligera, sin
  dependencias, funciona con `Blob`/`ArrayBuffer`, compatible con los PDF que
  ya produce jsPDF). Mantener el ensamblado en el cliente evita duplicar en
  el servidor la lógica de PDF, que depende de `getComputedStyle` y `Image`
  (APIs de navegador) para leer colores de marca y cargar el logo — replicar
  eso en Node añadiría una dependencia de renderizado (canvas/DOM virtual)
  mucho más pesada y arriesgada que añadir JSZip.
- **Alternativas consideradas**:
  - *Generar el .zip en el backend* (con una librería Node como `archiver`):
    rechazado porque obligaría a reimplementar la generación de PDF fuera
    del navegador (sin acceso a las variables CSS ni al logo cargado vía
    `Image`), duplicando lógica y arriesgando que el PDF del .zip deje de
    ser "exactamente el mismo" que el PDF individual (viola FR-005).
  - *Descargar los PDF uno a uno sin .zip*: rechazado, no cumple FR-002 (un
    único archivo) ni la experiencia de "copia de seguridad con un clic".

## 2. Cómo obtener todos los datos necesarios sin bloquear con cientos de peticiones

- **Decisión**: Añadir un único endpoint de solo lectura
  `GET /api/exportacion` en el backend que devuelve en una sola respuesta
  `{ perfil, servicios, presupuestos }`, donde cada presupuesto incluye ya
  sus `lineas` (igual que hace hoy `GET /api/presupuestos/:id`, pero para
  todos a la vez).
- **Racional**: El endpoint de listado actual (`GET /api/presupuestos`) no
  incluye las líneas de cada presupuesto (necesarias tanto para el PDF como
  para el archivo de respaldo); solo el detalle individual las incluye. Pedir
  el detalle de cada presupuesto uno por uno desde el navegador (hasta 200
  peticiones HTTP) es frágil y lento comparado con una única consulta desde
  el propio backend, que ya tiene acceso directo a la base de datos. Esto es
  la forma más simple de cumplir FR-012/SC-005 sin introducir colas, workers
  ni paginación.
- **Alternativas consideradas**:
  - *200 peticiones `GET /api/presupuestos/:id` desde el cliente*: rechazado,
    más lento, más frágil ante fallos de red intermitentes, y no aporta
    ninguna ventaja frente a un único endpoint de agregación.
  - *Añadir `lineas` directamente a `GET /api/presupuestos`*: rechazado
    porque cambiaría el contrato de un endpoint ya usado por la lista normal
    de presupuestos (que hoy no las necesita), aumentando el payload de una
    ruta de uso frecuente sin necesidad.

## 3. Cómo evitar que la generación de 200 PDF "cuelgue" la interfaz

- **Decisión**: Generar los PDF secuencialmente, cediendo el hilo principal
  entre cada uno (`await` de una micro-espera) y actualizando un contador
  reactivo ("Generando X de Y…") que Vue puede repintar entre iteraciones.
- **Racional**: jsPDF construye el documento de forma síncrona; generar 200
  seguidos sin ceder el hilo bloquearía la interfaz y parecería colgada
  (viola FR-011/SC-005). Ceder el hilo entre cada PDF es la solución más
  simple, sin Web Workers ni librerías adicionales.
- **Alternativas consideradas**:
  - *Web Worker dedicado*: rechazado por complejidad desproporcionada (jsPDF
    necesita `document`/`Image` del DOM para el logo y los colores CSS, lo
    que complica moverlo a un worker) para un caso de uso de un único
    freelancer.

## 4. Qué caracteres sanear en el nombre de archivo de cada PDF

- **Decisión**: Reemplazar los caracteres inválidos en nombres de archivo
  Windows/otros SO — `/ \ : * ? " < > |` — por un guion (`-`), y recortar
  espacios sobrantes resultantes. El número de presupuesto (siempre único y
  ya sin caracteres problemáticos) nunca se sanea ni se omite, garantizando
  nombres finales únicos aunque el nombre de cliente saneado coincida.
- **Racional**: Cubre exactamente el conjunto de caracteres citado en el
  edge case de la spec y es compatible con Windows, macOS y Linux al mismo
  tiempo (Windows es el más restrictivo, así que cubrirlo cubre los demás).
- **Alternativas consideradas**: usar una librería de slugify de terceros —
  rechazado por innecesario (Principio I), una función pura de una decena de
  líneas es suficiente y fácil de testear.

## 5. Qué incluir en el archivo de datos de respaldo

- **Decisión**: Un único archivo `datos.json` dentro del .zip con la forma
  `{ generadoEn, presupuestos, servicios, perfil }` (ver
  `contracts/formato-datos-respaldo.md` y `data-model.md`).
- **Racional**: FR-008 pide explícitamente presupuestos, catálogo de
  servicios y perfil (con logo); JSON es el formato más simple para datos
  legibles por máquina pensados para una futura importación (ver Assumptions
  de la spec).
- **Catálogo de clientes**: **no se incluye**. La spec no lo menciona en
  FR-008 pese a existir como entidad independiente en la app; cada
  presupuesto ya lleva embebidos los datos del cliente tal y como eran en el
  momento de su emisión, así que no se pierde información recuperable.
  Incluirlo sería alcance no escrito (Principio III de la Constitution).
- **Formato de fecha/moneda**: se mantienen los mismos formatos ya usados
  internamente por la API (ISO 8601 para fechas, céntimos enteros para
  importes), sin conversión, porque el archivo está pensado para una futura
  importación automática, no para lectura humana (ver Assumptions de la
  spec).

## Resumen — sin incógnitas pendientes

No quedan `NEEDS CLARIFICATION` en el Technical Context: todas las
decisiones anteriores resuelven las preguntas técnicas abiertas por la
spec (ya clarificada en su sesión 2026-09-29 respecto al comportamiento
ante fallos de PDF individuales).
