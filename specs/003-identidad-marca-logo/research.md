# Research: Identidad de marca con logotipo y nueva paleta visual

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

Este documento explica, en lenguaje de negocio, las decisiones técnicas
necesarias para resolver las dos ambigüedades de alcance detectadas al
planificar (rutas de fichero que no existían en el proyecto real) y el
resto de decisiones de diseño de esta feature.

---

## Decisión 1: Qué fichero es "la plantilla del PDF" en este proyecto

**Contexto**: el encargo original pedía limitar los cambios de PDF a
`src/services/plantillas/presupuesto.html`. Ese fichero no existe: no hay
ninguna carpeta `src/services/` en el repositorio.

**Decisión**: el PDF de presupuesto se genera con jsPDF (llamadas a la API
del documento, sin plantilla HTML) en `src/pdf/generarPdfPresupuesto.js`,
tal y como quedó establecido en el plan de la spec 002. Esta feature aplica
ahí el cambio de logotipo, confirmado con el usuario durante la
planificación.

**Alternativas consideradas**: migrar la generación de PDF a una plantilla
HTML nueva (creando `src/services/plantillas/presupuesto.html` y un motor
de renderizado HTML→PDF). Rechazada por ser un cambio de arquitectura no
pedido por la spec (que solo pide "aplicar el rediseño a la plantilla del
PDF", no cambiar cómo se genera) y porque probablemente requeriría una
dependencia nueva (p. ej. un renderizador HTML→PDF), lo que contradice la
restricción explícita de "sin añadir dependencias nuevas".

---

## Decisión 2: Qué ficheros de presentación se pueden tocar

**Contexto**: el encargo pedía limitar los cambios a `public/` y al fichero
del PDF, pero la spec exige insertar el logotipo dentro de la página de
Inicio y de la navegación común, que son componentes Vue en `src/views/` y
`src/components/`, no en `public/`.

**Decisión**: se interpreta la restricción como "solo capa de
presentación", confirmado con el usuario: además de `public/` y del módulo
de PDF, se tocan exclusivamente `src/views/InicioView.vue` y
`src/components/NavBar.vue` — los dos únicos puntos donde la spec exige que
aparezca el logotipo — sin abrir ningún otro fichero de `src/`.

**Alternativas consideradas**: inyectar el logotipo pequeño con CSS puro
(`background-image` sobre el enlace "Inicio" ya existente en la
navegación), sin tocar `NavBar.vue`. Rechazada para el logotipo grande de
Inicio, porque `InicioView.vue` no tiene ningún elemento vacío del que
"colgar" un logotipo grande solo con CSS sin alterar el HTML; y rechazada
también para el logotipo pequeño por coherencia (evitar depender de
selectores CSS frágiles acoplados al orden de los enlaces del router en vez
de una clase explícita).

---

## Decisión 3: Origen y formato del logotipo

**Decisión**: se usan los ficheros de marca ya versionados en el
repositorio (`assets/brand/logo-rm.svg` y `assets/brand/logo-rm.png`),
copiándolos a `public/img/` para que Vite (en desarrollo) y la carpeta
`dist/` generada por `vite build` (en producción, servida por
`backend/server.js`) los sirvan como estáticos sin ningún paso de
compilación adicional.

- **En pantalla** (Inicio, navegación): se usa el SVG (`logo-rm.svg`),
  porque escala sin perder nitidez en cualquier tamaño (grande o pequeño) y
  en cualquier densidad de píxeles.
- **En el PDF**: se usa el PNG (`logo-rm.png`), porque jsPDF `addImage`
  soporta PNG/JPEG de forma nativa, pero no SVG sin un plugin adicional
  (`svg2pdf.js` u otro) — y el encargo pide explícitamente no añadir
  dependencias nuevas.

**Alternativas consideradas**: convertir el SVG a PNG en tiempo de
ejecución dentro del navegador (canvas) para evitar mantener dos ficheros.
Rechazada por ser una complejidad innecesaria (Principio I): ya existe un
PNG de marca listo para usar en el repositorio.

---

## Decisión 4: Animación de giro

**Decisión**: el giro se implementa enteramente con CSS:

```css
@keyframes girar-logo {
  to { transform: rotate(360deg); }
}

.logo-grande {
  animation: girar-logo 6s linear infinite;
}

.logo-nav {
  transition: transform 0.6s linear;
}
.logo-nav:hover,
.logo-nav:focus-visible {
  transform: rotate(360deg);
}

@media (prefers-reduced-motion: reduce) {
  .logo-grande,
  .logo-nav {
    animation: none;
    transition: none;
  }
}
```

Solo se anima `transform`, nunca propiedades que fuercen recálculo de
layout, para que el giro no introduzca lentitud perceptible (Performance
Goals del plan). El logotipo pequeño gira también al recibir foco por
teclado (`:focus-visible`), no solo con el ratón, para que su animación sea
coherente con que el elemento es también operable por teclado (FR-018).

**Alternativas consideradas**: una librería de animación (p. ej. GSAP,
Motion One). Rechazada: el encargo pide no añadir dependencias nuevas y un
giro simple no las necesita.

---

## Decisión 5: El logotipo pequeño como enlace accesible

**Decisión**: en `NavBar.vue`, el logotipo pequeño se añade como un
`<router-link to="/" class="logo-nav" aria-label="Ir a Inicio">` que
envuelve un `<img src="/img/logo-rm.svg" alt="" />` (imagen decorativa,
`alt` vacío, porque el nombre accesible ya lo aporta `aria-label` en el
enlace — FR-019). Reutiliza el estilo `:focus-visible` ya definido en
`public/css/estilos.css` desde 002 para el foco de teclado (FR-018), sin
necesidad de ninguna regla nueva de accesibilidad.

---

## Decisión 6: Dónde va el logotipo de marca en el PDF

**Contexto**: el PDF ya incluye, desde la especificación 001, el logo
propio que el freelancer sube en su perfil (`perfil.logo`), mostrado arriba
a la derecha de la cabecera. Esta feature pide añadir *además* el logotipo
de identidad de marca de esta aplicación (el de `assets/brand/`), sin que
la spec pida quitar ni mover el logo del freelancer.

**Decisión**: el logotipo de marca se añade como una marca pequeña en el
**pie de página** del PDF (esquina inferior derecha, tamaño discreto, p.
ej. 12×12 mm), claramente separada de la cabecera del emisor y del
desglose de importes, para que:
- No compita visualmente con el logo que el propio freelancer ha subido
  (que sigue siendo el elemento principal de la cabecera, sin cambios).
- No interfiera con la lectura de ningún dato ni importe (FR-009).

**Alternativas consideradas**: sustituir el logo del freelancer por el de
la aplicación. Rechazada explícitamente: la spec no pide tocar el logo del
freelancer (fuera de alcance, Principio III) y sería confuso mostrar la
marca de la herramienta en vez de la del propio freelancer en un documento
que representa a su negocio.

---

## Decisión 7: Paleta de colores derivada del logotipo

**Decisión**: se sustituyen los valores de la paleta general (definida
desde 002 en `public/css/estilos.css`) por tonos derivados directamente de
los colores del logotipo (`#0B3128` verde oscuro, `#55E0A0` verde menta,
`#38D6E0` cian, `#7CFFC4` verde claro, `#141D1B`/`#243330` oscuro neutro).
El detalle completo de valores queda fijado en
[contracts/design-tokens-contract.md](./contracts/design-tokens-contract.md).

Para los cinco estados del presupuesto (según la Clarification de la
sesión de `/speckit-clarify`): Borrador, Enviado y Aceptado reutilizan
tonos oscurecidos del propio logotipo (gris-verde oscuro, cian oscurecido,
verde oscurecido respectivamente), mientras que Rechazado y Caducado usan
colores semánticos ajenos a la paleta de marca (rojo y ámbar) porque el
logotipo no aporta suficiente variedad de matices para distinguir los
cinco estados con el contraste WCAG AA (4.5:1) que exige FR-012.

**Alternativas consideradas**: limitar también Rechazado/Caducado a tonos
verdes o cian del logotipo. Rechazada explícitamente por el usuario en la
sesión de clarificación: con una gama tan estrecha (verdes/cian), Rechazado
y Caducado quedarían demasiado parecidos entre sí y con Aceptado, poniendo
en riesgo SC-005 (identificar el estado de un vistazo).

---

## Decisión 8: Verificación del rediseño

Igual que en 002, no se añaden tests automáticos de aspecto visual (no hay
lógica de negocio nueva que probar con Vitest). La verificación de las
cuatro historias es manual y visual, siguiendo
[quickstart.md](./quickstart.md): mirar el logotipo grande girar en
Inicio, pasar el ratón y el foco por el logotipo pequeño de la navegación,
comprobar que lleva a Inicio, comparar la paleta entre pantallas y con el
PDF generado, y comprobar que los cinco estados del presupuesto se siguen
distinguiendo de un vistazo.
