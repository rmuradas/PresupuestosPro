# Quickstart: validación manual de la feature 002

Esta guía comprueba las tres historias de usuario de
[spec.md](./spec.md) usando solo la aplicación, sin leer código ni
consultar la base de datos directamente (Principio IV de la
constitution). Requiere tener el backend arrancado (sirve tanto la API
como la propia aplicación).

**Preparación**: arrancar el servidor (`npm run build` del frontend +
arranque de `backend/server.js`, o el script equivalente que defina
`tasks.md`) y abrir en el navegador la dirección raíz del servidor
(p. ej. `http://localhost:3000/`).

---

## Historia 1 — Persistencia fiable en base de datos

1. Desde la aplicación, rellenar el perfil del freelancer, dar de alta un
   cliente, un servicio del catálogo y crear un presupuesto con al menos
   una línea.
2. Cerrar la pestaña del navegador.
3. Borrar los datos de navegación del navegador (caché y almacenamiento
   local) para ese sitio — o, para una comprobación más fuerte, abrir la
   misma dirección desde **otro navegador** en el mismo equipo.
4. Volver a abrir la dirección raíz del servidor.
   - ✅ **Esperado**: el perfil, el cliente, el servicio y el presupuesto
     creados en el paso 1 siguen apareciendo exactamente igual (SC-001).
5. Crear un segundo presupuesto.
   - ✅ **Esperado**: recibe el siguiente número correlativo sin huecos ni
     repeticiones respecto al primero (continuidad de FR-012 de 001).
6. Detener el proceso del backend (`Ctrl+C` en la terminal donde corre
   `npm run server`) y volver a intentar abrir o refrescar la aplicación.
   - ✅ **Esperado**: aparece un aviso comprensible indicando que no se
     puede conectar con el servidor, en vez de una pantalla en blanco; los
     datos que ya estaban visibles antes de detener el servidor no
     desaparecen (FR-003a).

## Historia 2 — Página de inicio y navegación común

1. Abrir la dirección raíz del servidor en una pestaña nueva (sin haber
   navegado antes a ninguna sección).
   - ✅ **Esperado**: aparece la página de Inicio, con un acceso a cada
     una de las cuatro secciones (Presupuestos, Clientes, Catálogo,
     Perfil) y un resumen con el número de presupuestos por estado
     (SC-002, SC-005).
2. Si todavía no hay ningún presupuesto creado, comprobar el resumen.
   - ✅ **Esperado**: indica que no hay presupuestos, sin error ni pantalla
     en blanco.
3. Pulsar el acceso a "Clientes" desde Inicio, y desde ahí pulsar el
   acceso a "Presupuestos" usando solo la navegación común (sin usar el
   botón "atrás" del navegador).
   - ✅ **Esperado**: se llega a cada sección con un único clic, y la
     navegación común sigue visible en todas ellas (SC-002).
4. Escribir directamente en la barra de direcciones la URL de una sección
   (p. ej. añadiendo `#/clientes` a la dirección raíz) sin pasar por
   Inicio.
   - ✅ **Esperado**: la navegación común aparece igualmente.

## Historia 3 — Rediseño visual profesional y estados del presupuesto

1. Ir a la lista de presupuestos y marcar manualmente presupuestos
   distintos con cada uno de los cuatro estados manuales (Borrador,
   Enviado, Aceptado, Rechazado).
   - ✅ **Esperado**: cada uno se distingue a simple vista por su color y
     etiqueta, sin tener que abrirlo (SC-003).
2. Crear (o editar la fecha de validez de, si la interfaz lo permite) un
   presupuesto en Borrador o Enviado para que su fecha de validez ya haya
   pasado.
   - ✅ **Esperado**: aparece como "Caducado" sin que el freelancer lo haya
     marcado a mano.
3. Marcar un presupuesto como Aceptado o Rechazado y dejar que su fecha de
   validez pase.
   - ✅ **Esperado**: sigue mostrando Aceptado/Rechazado, **no** cambia a
     Caducado (FR-012).
4. Editar una línea de un presupuesto ya marcado como Aceptado.
   - ✅ **Esperado**: el estado sigue siendo Aceptado después de guardar el
     cambio (FR-013a); los importes se recalculan con normalidad.
5. Recorrer visualmente Perfil, Catálogo, Clientes y Presupuestos.
   - ✅ **Esperado**: mismos colores, misma tipografía y mismo espaciado en
     las cuatro pantallas (SC-004).
6. Generar el PDF de un presupuesto con líneas.
   - ✅ **Esperado**: el documento usa la misma paleta de colores y una
     tipografía coherente con la pantalla (SC-004), y sigue mostrando
     exactamente el mismo contenido que en 001 (número, fechas, cliente,
     líneas, desglose de base/IVA/retención/total) — comprobar que el caso
     de referencia de líneas de 1.500,00 € y 500,00 € con retención del
     15 % sigue dando un total de 2.120,00 € (SC-006).
7. Abrir la aplicación desde un móvil (o con el navegador en modo
   responsive/estrecho).
   - ✅ **Esperado**: todas las pantallas y la navegación común se adaptan
     correctamente, sin romper tablas ni formularios.

---

Si los 7 pasos de la Historia 3, los 5 de la Historia 2 y los 2 de la
Historia 1 se cumplen, la feature 002 está lista para considerarse
completa de cara al negocio.
