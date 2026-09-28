# Quickstart de validación: PresupuestosPro v0

Esta guía sirve para comprobar, usando la aplicación (sin leer código),
que la feature cumple lo que pide [spec.md](./spec.md). Sigue el Principio
IV de la constitution: cualquier persona no técnica debe poder ejecutar
estos pasos.

## Preparación (una sola vez por entorno)

```bash
npm install
npm run dev
```

Abre en el navegador la URL que indique la terminal (por defecto,
`http://localhost:5173`). Pruébalo también con las herramientas de
desarrollador del navegador en modo "vista móvil" para comprobar que se
usa bien en pantallas pequeñas (restricción de la constitution: buen
funcionamiento en móvil).

Para comprobar la versión "publicable" (los ficheros estáticos finales):

```bash
npm run build
npm run preview
```

## Escenario 1 — Configurar el perfil (Historia de Usuario 1)

1. Entra por primera vez en la aplicación: no debe permitir crear ningún
   presupuesto todavía, y debe guiarte a la pantalla de Perfil (FR-004a).
2. Rellena nombre, NIF, datos de contacto, sube un logo, guarda.
3. Recarga la página entera del navegador.
4. **Resultado esperado**: los datos y el logo siguen ahí, tal como los
   guardaste (FR-001, FR-018).

## Escenario 2 — Cálculo automático de impuestos (Historia de Usuario 2)

1. Crea un presupuesto para un cliente de tipo empresa/autónomo.
2. Añade una línea de 1.500,00 € y otra de 500,00 €.
3. Activa la retención de IRPF al 15 %.
4. **Resultado esperado**: base imponible 2.000,00 €, IVA 420,00 €,
   retención −300,00 €, total **2.120,00 €** (SC-002), sin haber hecho
   ningún cálculo a mano.
5. Cambia la retención al 7 %. **Resultado esperado**: el total pasa a
   2.280,00 € al instante, sin recargar la página (SC-006).
6. Marca el cliente como particular (o desactiva la retención).
   **Resultado esperado**: el total sube a 2.420,00 €, aunque la casilla de
   retención siga marcada.
7. Quita todas las líneas del presupuesto e intenta generar el PDF.
   **Resultado esperado**: no se genera, y aparece un aviso explicando que
   falta añadir al menos una línea (FR-017).

## Escenario 3 — Descargar el PDF (Historia de Usuario 3)

1. Con el presupuesto del Escenario 2 (con líneas), genera el PDF.
2. Ábrelo y compáralo contra [contracts/pdf-contract.md](./contracts/pdf-contract.md):
   debe tener logo, datos del freelancer, datos del cliente, número
   (`AAAA-NNN`), fecha de emisión, fecha de validez (+30 días) y el
   desglose completo.
3. Crea un segundo presupuesto ese mismo año. **Resultado esperado**: su
   número es el siguiente correlativo (por ejemplo, si el primero fue
   `2026-001`, el segundo es `2026-002`) — SC-003.
4. Vuelve al primer presupuesto, edita una línea, y genera el PDF otra vez.
   **Resultado esperado**: el nuevo PDF refleja el cambio y conserva el
   mismo número (FR-016).

## Escenario 4 — Catálogos reutilizables (Historia de Usuario 4)

1. Da de alta un servicio en el catálogo (nombre + precio por defecto).
2. Crea un presupuesto nuevo y añade una línea desde ese servicio.
   **Resultado esperado**: descripción y precio se precargan, y se pueden
   editar antes de guardar la línea.
3. Da de alta un cliente en la lista de clientes.
4. Crea otro presupuesto seleccionando ese cliente de la lista.
   **Resultado esperado**: no hace falta volver a escribir sus datos.
5. Edita (o elimina) ese servicio y ese cliente en sus respectivos
   catálogos.
   **Resultado esperado**: los presupuestos ya creados que los usaron no
   cambian ni un dato (FR-019).

## Comprobación de persistencia general (Edge Case)

1. Con datos ya creados en los 4 escenarios anteriores, cierra
   completamente el navegador (no solo la pestaña) y vuelve a abrirlo.
2. **Resultado esperado**: perfil, catálogo, clientes y todos los
   presupuestos siguen disponibles exactamente como se dejaron (FR-018,
   SC-004).

## Comprobación de la lógica de cálculo (para quien programe la feature)

Los mismos números del Escenario 2 deben tener una prueba automática
equivalente (ver Decisión 7 de [research.md](./research.md)):

```bash
npm run test:unit
```

Debe incluir, como mínimo, un caso con los importes exactos del Escenario 2
(base 2.000,00 €, IVA 420,00 €, retención 15 % → total 2.120,00 €) y un
caso de redondeo con más de 2 decimales antes de redondear, para comprobar
la regla "0,5 hacia arriba" de FR-020.
