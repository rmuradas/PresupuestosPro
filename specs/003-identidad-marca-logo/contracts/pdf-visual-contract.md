# Contrato visual del PDF — logotipo de marca (ampliación)

**Por qué existe este contrato**: el
[contrato de contenido de 001](../../001-presupuestos-freelance/contracts/pdf-contract.md)
y el [contrato visual de 002](../../002-rediseno-navegacion-bd/contracts/pdf-contract-visual.md)
siguen vigentes tal cual — qué debe aparecer, en qué orden, y que los
colores se leen de las variables CSS de `public/css/estilos.css` vía
`getComputedStyle`. Este documento añade únicamente lo que pide la spec
003 (FR-008, FR-009): incorporar el logotipo de identidad de marca de la
aplicación al documento.

## Regla del contrato

- El PDF **MUST** incluir el logotipo de marca (`public/img/logo-rm.png`,
  la versión PNG estática — jsPDF no soporta SVG sin un plugin adicional)
  mediante `doc.addImage(...)`, igual que ya hace el módulo con el logo
  propio del freelancer.
- El logotipo de marca **MUST** colocarse en el **pie de página**, en la
  esquina inferior derecha, en un tamaño discreto (aprox. 12×12 mm) —
  nunca en la cabecera, donde ya aparece el logo que el propio freelancer
  ha subido en su perfil (`perfil.logo`, sin cambios de posición ni de
  tamaño respecto a 001/002).
- El logotipo de marca **MUST** mostrarse siempre, tenga o no el
  freelancer un logo propio guardado en su perfil (a diferencia de
  `perfil.logo`, que sigue siendo condicional): es la identidad de la
  aplicación, no un dato del freelancer.
- La posición del logotipo de marca **MUST NOT** solapar ni desplazar
  ninguna fila de la tabla de líneas ni del desglose de importes (FR-009);
  si el contenido del presupuesto es largo y ocupa más de una página, el
  logotipo de marca aparece solo en la última página (junto con el
  desglose de importes final), no en cada página intermedia.
- El PDF **MUST** seguir leyendo los colores (cabecera, tabla, total) de
  las mismas variables CSS ya definidas en
  [design-tokens-contract.md](./design-tokens-contract.md), sin cambios en
  el mecanismo ya usado desde 002.
- El contenido y el orden del PDF fijados en el contrato de 001 **MUST NOT**
  cambiar: esta feature no añade, quita ni reordena ninguna sección
  existente (cabecera del emisor, identificación del presupuesto, datos
  del cliente, tabla de líneas, desglose de importes); solo añade el
  logotipo de marca como elemento visual adicional en el pie de página.

## Verificación

Igual que en 001/002, la comprobación es visual y manual (ver
[quickstart.md](../quickstart.md)): generar el PDF de un presupuesto y
comprobar que el logotipo de marca aparece en la esquina inferior derecha,
sin tapar ningún dato ni importe, y que los colores del documento coinciden
con los de la aplicación.
