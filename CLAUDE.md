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

---
Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md.
