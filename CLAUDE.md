# PresupuestosPro

Aplicación web para que freelancers en España generen y gestionen presupuestos (con cálculo de IVA/IRPF) y los descarguen en PDF.

## Stack y decisiones técnicas vigentes

- **Frontend**: Vue 3 (`<script setup>`) + Vue Router en modo hash, Vite. JavaScript moderno (ES2022+), sin TypeScript (decisión deliberada, ver 001).
- **Backend**: Node.js (LTS >= 20) + Express, sirve tanto `/api/*` (JSON, nunca datos en query string) como los estáticos de `dist/`.
- **Base de datos**: SQLite en fichero vía `better-sqlite3` (`backend/data/presupuestospro.db`), sin ORM. Sustituyó a `localStorage` (spec 002); `localStorage` ya no es el almacén, solo se usa para la migración única de datos antiguos.
- **PDF**: jsPDF + jspdf-autotable, generado en `src/pdf/generarPdfPresupuesto.js`, leyendo colores desde las variables CSS (`getComputedStyle`) para que pantalla y PDF compartan la misma imagen visual.
- **Estilos**: fuente única de verdad en `public/css/estilos.css` (paleta derivada del logo, tipografía, espaciado). Mobile-first, sin librería de CSS externa.
- **Testing**: Vitest (`tests/unit`, `tests/backend`) para lógica de cálculo, numeración, estado efectivo y endpoints. La verificación funcional de cada historia es manual, siguiendo el `quickstart.md` de cada spec.
- Todo el texto de interfaz, PDF y mensajes va en español de España; moneda siempre €.

## Arrancar y probar en local

```
npm install
npm run server   # backend Express + SQLite en :puerto configurado en backend/server.js
npm run dev      # Vite dev server (frontend)
npm run build    # build de producción a dist/
npm run test:unit  # Vitest
```

## Convenciones

- Nada de alcance no pedido: cada cambio debe trazarse a un requisito escrito en la spec de la feature (specs/NNN-.../spec.md).
- No se introduce complejidad, dependencia ni capa nueva sin que la spec correspondiente lo exija (ver Constitution Check de cada plan.md).
- Criterios de éxito verificables por una persona no técnica, usando la app.
- Sin secretos ni claves en el código fuente.

## Spec-kit
- Al ejecutar `/speckit.plan`, SIEMPRE incluye en `plan.md`, como último paso de la fase final, un paso de mantenimiento: “Actualizar `CLAUDE.md` con las decisiones de diseño y convenciones nuevas de esta feature, una línea por decisión, con referencia a la spec (p. ej. ‘[003] ...’). No incluyas entradas por incluir, asegúrate siempre de que es información transversal y relevante para el proyecto que pueden aprovechar futuras features.”

## Decisiones de diseño por feature

Registro transversal, una línea por decisión reutilizable en features futuras (los detalles propios de cada feature viven en su spec/plan, no aquí).

- [004] Exportaciones/agregaciones masivas de datos ya existentes que necesiten detalle anidado (p. ej. líneas de presupuesto): se resuelven con un único endpoint de agregación de solo lectura en el backend, no con N peticiones individuales desde el frontend.
- [004] Generación de `.zip` en el navegador: usar JSZip (ya incorporada como dependencia) en vez de mover el ensamblado al backend o añadir otra librería.
- [004] Nombres de archivo descargables generados por la app: sanear solo los caracteres inválidos de sistema de archivos (`/ \ : * ? " < > |`) sustituyéndolos por `-`; el identificador único del registro (p. ej. número de presupuesto) nunca se sanea ni se omite, para evitar colisiones de nombre.
- [004] Trabajo síncrono pesado en el navegador sobre muchos elementos (p. ej. generar muchos PDF seguidos): ceder el hilo principal entre iteraciones y mostrar progreso visible, en vez de introducir Web Workers, mientras la escala del producto sea de un único usuario.

---
Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md.
