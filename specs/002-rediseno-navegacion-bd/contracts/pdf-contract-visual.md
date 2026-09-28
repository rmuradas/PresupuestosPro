# Contrato visual del PDF (complementa el contrato de contenido de 001)

**Por qué existe este contrato**: el
[contrato de contenido del PDF de 001](../../001-presupuestos-freelance/contracts/pdf-contract.md)
sigue vigente tal cual — qué debe aparecer y en qué orden **no cambia**.
Este documento añade únicamente la parte visual que pide la spec 002
(FR-017): que el PDF transmita la misma imagen profesional que el resto
de la aplicación.

## Regla del contrato

- El PDF **MUST** obtener sus colores (cabecera, líneas de tabla, total,
  y el color de la etiqueta de estado si se incluye) leyendo las mismas
  variables CSS definidas en
  [css-tokens-contract.md](./css-tokens-contract.md), vía
  `getComputedStyle(document.documentElement)` en el momento de generar el
  documento (Decisión 8 de research.md) — nunca con códigos de color
  escritos a mano dentro del módulo del PDF.
- El PDF **MUST** usar la misma familia tipográfica de referencia que la
  pantalla en la medida en que jsPDF lo permita (las fuentes vectoriales
  de jsPDF son limitadas; se elige la fuente estándar de jsPDF más cercana
  a `--fuente-base` y se documenta la elección en el código, sin que esto
  requiera ningún cambio de contenido).
- El PDF **MUST** mantener exactamente el contenido y el orden ya fijados
  en el contrato de 001 (cabecera del emisor, identificación del
  presupuesto, datos del cliente, tabla de líneas, desglose de importes).
  Esta feature no añade ni quita ninguna sección del PDF.
- Si el presupuesto tiene un estado efectivo (Borrador/Enviado/
  Aceptado/Rechazado/Caducado), esto es **informativo únicamente para la
  aplicación**: el PDF, al ser el documento que recibe el cliente, no
  necesita mostrar el estado interno de gestión del freelancer — no se
  añade como requisito de esta feature (evita alcance no pedido, Principio
  III).

## Verificación

Igual que en 001, la comprobación es visual y manual (ver
[quickstart.md](../quickstart.md)): generar el PDF de un presupuesto y
compararlo a simple vista con la pantalla de la aplicación, confirmando
que usan los mismos colores y una tipografía coherente.
