# Quickstart: Exportar todos los presupuestos en un .zip

Guía de validación manual (esta feature no requiere pruebas automatizadas de
extremo a extremo; ver `plan.md` § Testing). Ejecutar tras
`npm run server` y `npm run dev` (o `npm run build` + `npm run server`
sirviendo `dist/`).

## Preparación

```
npm install
npm run server   # backend en el puerto configurado
npm run dev      # frontend Vite
```

Tener al menos: un perfil relleno (con logo, para comprobar que viaja en el
.zip), un servicio en el catálogo, y varios presupuestos creados.

## Escenario 1 — Copia de seguridad completa (Historia 1, P1)

1. Ir a la lista de presupuestos con al menos 3 presupuestos creados.
2. Pulsar "Exportar todo (.zip)".
3. Verificar que se descarga un único archivo
   `presupuestospro-copia-AAAA-MM-DD.zip` con la fecha de hoy.
4. Descomprimirlo: debe haber un PDF por presupuesto, nombrado
   `"{numero} - {cliente}.pdf"`, más un único `datos.json`.
5. Abrir uno de los PDF del .zip y compararlo con el PDF que genera el botón
   "Generar PDF" de ese mismo presupuesto desde su pantalla de detalle: deben
   ser idénticos céntimo a céntimo (base, IVA, retención, total).
6. Volver a la app y comprobar que presupuestos, servicios y perfil siguen
   exactamente igual que antes de exportar (contrato: `GET /api/exportacion`
   en `contracts/api-exportacion.md` es de solo lectura).
7. Abrir `datos.json` con un editor de texto y comprobar que contiene
   `perfil` (con el logo en base64), `servicios` y `presupuestos` con sus
   líneas — ver forma exacta en `contracts/formato-datos-respaldo.md`.

## Escenario 2 — Fallo puntual de un presupuesto (Historia 1, edge case)

1. Provocar que un presupuesto concreto no pueda generar su PDF (por
   ejemplo, editando temporalmente sus datos a un estado inválido a nivel de
   base de datos, o simulándolo según convenga en desarrollo).
2. Pulsar "Exportar todo (.zip)".
3. Verificar que el .zip se descarga igualmente, con los PDF del resto de
   presupuestos, y que la interfaz muestra un aviso indicando qué
   presupuesto(s) quedaron fuera.
4. Verificar que `datos.json` no incluye el presupuesto fallido (coherencia
   entre PDF y JSON, ver `contracts/formato-datos-respaldo.md`).

## Escenario 3 — Sin presupuestos (Historia 2, P2)

1. Con la base de datos sin presupuestos (instalación nueva o tras
   borrarlos todos).
2. Pulsar "Exportar todo (.zip)".
3. Verificar que aparece un aviso claro de que no hay nada que exportar y
   que **no** se descarga ningún archivo.
4. Cronometrar informalmente que el aviso aparece en menos de 1 segundo
   (SC-004).

## Escenario 4 — Cliente con caracteres especiales (Historia 3, P3)

1. Crear un presupuesto para un cliente llamado, por ejemplo,
   "Diseño/Web S.L.".
2. Exportar todo.
3. Verificar que el .zip se genera sin error y que el PDF de ese
   presupuesto tiene un nombre de archivo válido en el sistema operativo
   usado, con el `/` sustituido por un carácter seguro, manteniendo número y
   nombre reconocibles (ver regla de saneado en `research.md` § 4).

## Escenario 5 — Volumen alto (Historia 3, P3)

1. Crear (o preparar en base de datos) 50 o más presupuestos, idealmente
   hasta 200 para cubrir SC-005.
2. Pulsar "Exportar todo (.zip)".
3. Verificar que la interfaz muestra una indicación visible de progreso
   ("Generando X de Y…" o similar) durante toda la operación, que no se
   queda congelada, y que termina con la descarga del .zip completo.

## Notas para pruebas automatizadas (Vitest)

Solo se cubren con test unitario las funciones puras nuevas:

- `sanitizarNombreArchivo` (`src/exportacion/nombreArchivo.js`): casos con
  cada carácter inválido (`/ \ : * ? " < > |`), y el caso límite de nombre
  vacío tras sanear (debe seguir siendo distinguible gracias al número, ver
  Assumptions de la spec).
- Construcción del objeto `datos.json` a partir de una respuesta simulada de
  `/api/exportacion` (forma correcta de claves, sin catálogo de clientes).

El resto del flujo (descarga real, generación de PDF con `jsPDF`, ensamblado
con JSZip) se valida manualmente con los escenarios anteriores, igual que ya
hace el resto del proyecto con la generación de PDF individual.
