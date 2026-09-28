# Quickstart: Identidad de marca con logotipo y nueva paleta visual

**Spec**: [spec.md](./spec.md) · **Contratos**: [design-tokens-contract.md](./contracts/design-tokens-contract.md), [pdf-visual-contract.md](./contracts/pdf-visual-contract.md)

Guía de validación manual, historia por historia, tal como exige el
Principio IV de la constitution (verificable por una persona no técnica,
sin leer código ni consultar la base de datos).

## Prerrequisitos

1. Backend arrancado: `npm run server` (sirve la API y, si ya se ha hecho
   `npm run build`, también la SPA compilada).
2. Frontend en desarrollo: `npm run dev` (o `npm run build` + `npm run
   server` para probar en condiciones de producción).
3. Al menos un presupuesto creado en cada uno de los cinco estados
   (Borrador, Enviado, Aceptado, Rechazado, Caducado) — reutilizar los
   datos de prueba de 002 si ya existen.

## Historia 1 — Logotipo grande en la página de inicio

1. Abrir la aplicación por su dirección raíz (`/`).
2. **Comprobar**: aparece el logotipo de marca en tamaño grande, girando
   de forma continua, junto con los accesos a Presupuestos/Clientes/
   Catálogo/Perfil y el resumen de actividad.
3. Activar en el sistema operativo o en las herramientas de desarrollo del
   navegador la preferencia "reducir movimiento" (`prefers-reduced-
   motion: reduce`) y recargar la página.
   **Comprobar**: el logotipo se muestra estático (sin girar), sin
   desaparecer ni romper el diseño.
4. Reducir el ancho de la ventana (o usar el modo de emulación de móvil).
   **Comprobar**: el logotipo grande se adapta al ancho disponible, sin
   desbordar la pantalla ni tapar el resto del contenido.

## Historia 2 — Logotipo pequeño interactivo en la navegación

1. Visitar cualquier sección de la aplicación (por ejemplo, Clientes).
   **Comprobar**: el logotipo pequeño aparece en la navegación común,
   visible en todas las páginas.
2. Pasar el ratón sobre el logotipo pequeño.
   **Comprobar**: gira mientras el puntero está encima y se detiene al
   retirarlo.
3. Navegar hasta el logotipo pequeño con el teclado (tecla Tab) y pulsar
   Intro (o Espacio).
   **Comprobar**: el foco es visible sobre el logotipo y, al activarlo, la
   aplicación navega a la página de Inicio.
4. Con la preferencia "reducir movimiento" activada, repetir el paso 2.
   **Comprobar**: el logotipo no gira.
5. Con las herramientas de desarrollo del navegador, emular un dispositivo
   táctil (sin cursor de ratón) y repetir la navegación por las secciones.
   **Comprobar**: el logotipo pequeño sigue siendo visible y usable como
   enlace, aunque no llegue a girar.

## Historia 3 — Nueva paleta de colores basada en el logotipo

1. Recorrer visualmente varias pantallas (Inicio, listado de Presupuestos,
   formulario de Clientes, detalle de un presupuesto).
   **Comprobar**: todas comparten los mismos colores de fondo, botones y
   acentos, derivados del logotipo de marca — ninguna pantalla usa un color
   distinto de los demás.
2. Abrir el listado de Presupuestos con al menos un presupuesto en cada uno
   de los cinco estados.
   **Comprobar**: cada estado (Borrador, Enviado, Aceptado, Rechazado,
   Caducado) se distingue claramente de los demás de un vistazo, con texto
   legible sobre su color de fondo.
3. Con las herramientas de desarrollo del navegador (o un comprobador de
   contraste como WebAIM Contrast Checker), medir el contraste de texto
   blanco sobre cada uno de los cinco colores de `--color-estado-*`
   definidos en [contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md).
   **Comprobar**: los cinco dan un ratio ≥ 4.5:1 (WCAG AA, FR-012); prestar
   especial atención a `--color-estado-enviado` (`#0E7490`), el valor más
   cercano al límite.
4. Comparar la tipografía, el espaciado entre campos y la jerarquía de
   títulos/tablas/formularios/totales con las de antes del rediseño (o con
   cualquier otra pantalla).
   **Comprobar**: siguen siendo consistentes en toda la aplicación; solo
   cambian los colores.

## Historia 4 — Logotipo en el PDF

1. Abrir un presupuesto con líneas y generar su PDF.
2. **Comprobar**: el documento incluye el logotipo de marca, estático, en
   la esquina inferior derecha del pie de página, sin tapar ninguna fila de
   la tabla de líneas ni del desglose de importes.
3. **Comprobar**: el logo propio que el freelancer haya subido en su perfil
   (si lo tiene) sigue apareciendo igual que antes, en la cabecera.
4. Comparar los colores del PDF (cabecera, tabla, total) con los de la
   aplicación.
   **Comprobar**: coinciden.
5. Revisar los importes del presupuesto (base imponible, IVA, retención si
   aplica, total).
   **Comprobar**: son exactamente los mismos que antes de este cambio — por
   ejemplo, dos líneas de 1.500,00 € y 500,00 € con retención del 15 % MUST
   seguir dando un total de 2.120,00 €.

## Casos límite a probar

- Bloquear la carga del fichero del logotipo desde las herramientas de
  desarrollo del navegador (simular fallo de red) y recargar Inicio y
  cualquier otra sección.
  **Comprobar**: la página sigue siendo utilizable; el espacio del
  logotipo no rompe el diseño.
- Imprimir (o exportar a PDF de nuevo) y revisar en escala de grises.
  **Comprobar**: el logotipo del PDF se sigue reconociendo sin color.
