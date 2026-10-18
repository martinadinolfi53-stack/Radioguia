// Capítulo 8 · Cráneo, huesos faciales y senos paranasales (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 225-268).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// respiracion: null cuando el manual no la indica para esa proyección.
// Líneas de referencia (pág. 227): LGM (glabelomeatal), LOM (orbitomeatal), LIOM (infraorbitomeatal, línea basal de Reid),
// LAM (acantomeatal), LLM (labiomeatal, para la Waters modificada), LMM (mentomeatal, para la Waters), LGA (glabeloalveolar),
// LIP (interpupilar), PMS (plano mediosagital), MAE (meato auditivo externo).
// Generalidades (pág. 227): los errores más frecuentes en cráneo y huesos faciales son de rotación, inclinación, flexión y
// extensión. En cada serie hay que proteger los tejidos radiosensibles fuera de la zona de interés y retirar de la cabeza
// todo objeto de metal o plástico y cualquier objeto removible.

const DFRI = "100 cm (40\")";
const APNEA = "Apnea durante la exposición";
const COL_CRANEO = "A los cuatro lados, hasta los bordes del cráneo";
const AVISO_TRAUMA = "En posibles lesiones vertebrales o craneales graves, hacer todas las proyecciones sin mover la cabeza del paciente y sin quitar el collarín cervical, salvo que lo pida un médico.";
const SIN_CRITERIOS = []; // el manual no trae página de criterios: se deja vacío para completar después
const NIVELES = "Requiere posición erguida con RC horizontal para ver niveles hidroaéreos.";

const CRIT_ARCOS = [
  ["Estructuras que se ven", ["SMV: los dos arcos cigomáticos.", "Tangencial: un arco cigomático."]],
  ["Posicionamiento", ["SMV: arcos bilaterales sin obstáculos. Sin rotación: arcos simétricos.", "Inferosuperior oblicua (tangencial): un arco sin obstáculos, sin superposición del parietal ni de la mandíbula."]],
  ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver los arcos cigomáticos.", "Bordes óseos nítidos con detalle de partes blandas, sin movimiento."]],
];
const CRIT_MANDIBULA = [
  ["Estructuras que se ven", ["PA: ramas mandibulares y parte lateral del cuerpo.", "Axiolateral y axiolateral oblicua: ramas, apófisis condíleas y coronoides, y cuerpo del lado más cercano al RI."]],
  ["Posicionamiento", ["PA: sin rotación, ramas simétricas.", "Axiolateral y axiolateral oblicua: ramas, cuerpo y mentón sin obstáculos y sin acortamiento de la zona de interés."]],
  ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver la mandíbula.", "Bordes óseos nítidos, sin movimiento."]],
];
const CRIT_ATM = [
  ["Estructuras que se ven", ["Law modificado: estudio funcional bilateral de las ATM y sus fosas.", "Schuller: estudio funcional bilateral de las ATM y sus fosas."]],
  ["Posicionamiento", ["Law modificado: ATM sin obstáculos con boca abierta y cerrada (en el manual se ilustra solo la boca cerrada: ATM del lado de abajo dentro de su fosa).", "Schuller: ATM sin obstáculos con boca abierta y cerrada, con mayor elongación de los cóndilos (se ilustra solo la boca abierta: cóndilo desplazado hasta el borde anterior de la fosa)."]],
  ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver las ATM y las fosas mandibulares.", "Bordes óseos nítidos, sin movimiento."]],
];
const TEC_SENOS = ["Densidad (brillo) y contraste óptimos para ver los senos paranasales.", "Bordes óseos nítidos con detalle de partes blandas, sin movimiento."];
const CRIT_SENOS_LAT_PA = [
  ["Estructuras que se ven", ["Lateral: todos los senos paranasales.", "PA de Caldwell: senos frontales y etmoidales anteriores."]],
  ["Posicionamiento", ["Lateral: sin rotación ni inclinación; se superponen las alas mayores del esfenoides, los techos de las órbitas y la silla turca.", "PA de Caldwell: crestas petrosas en el tercio inferior de las órbitas. Sin rotación: igual distancia entre órbitas y paredes laterales del cráneo."]],
  ["Criterios técnicos", TEC_SENOS],
];
const CRIT_SENOS_WATERS_SMV = [
  ["Estructuras que se ven", ["Waters: senos maxilares sin obstáculos.", "SMV: senos esfenoidales, maxilares y etmoidales sin obstáculos."]],
  ["Posicionamiento", ["Waters: crestas petrosas justo por debajo del piso de los senos maxilares. Sin rotación: igual distancia entre órbitas y bordes laterales del cráneo.", "SMV: cóndilos mandibulares por delante del peñasco. Sin rotación ni inclinación: pirámides petrosas simétricas e igual distancia entre el borde de la mandíbula y la parte lateral del cráneo."]],
  ["Criterios técnicos", TEC_SENOS],
];

export default {
  capitulo: 8,
  titulo: "Cráneo, huesos faciales y senos paranasales",
  paginas: "225-268",
  regiones: [
    { id: "craneo", nombre: "Cráneo", detalle: "Serie de cráneo" },
    { id: "craneo-trauma", nombre: "Cráneo por traumatismo", detalle: "Serie de cráneo" },
    { id: "huesos-faciales", nombre: "Huesos faciales", detalle: "" },
    { id: "faciales-trauma", nombre: "Huesos faciales por traumatismo", detalle: "Serie de huesos faciales" },
    { id: "agujeros-opticos", nombre: "Agujeros ópticos", detalle: "Órbitas" },
    { id: "arcos-cigomaticos", nombre: "Arcos cigomáticos", detalle: "" },
    { id: "huesos-nasales", nombre: "Huesos nasales", detalle: "" },
    { id: "mandibula", nombre: "Mandíbula", detalle: "" },
    { id: "atm", nombre: "Articulaciones temporomandibulares", detalle: "ATM" },
    { id: "senos", nombre: "Senos paranasales", detalle: "" },
  ],
  proyecciones: [
    // ───────── Cráneo ─────────
    {
      id: "craneo-ap-axial-towne", region: "craneo", nombre: "AP axial de cráneo", metodo: "Towne", categoria: ["AP", "Axiales", "Métodos especiales"], tipo: "R",
      factores: { ri: "24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: COL_CRANEO },
      rc: { direccion: "caudal", angulo: "30° respecto de la LOM o 37° respecto de la LIOM", texto: "30° caudal respecto de la LOM, o 37° caudal respecto de la LIOM. Entra unos 6,5 cm (2,5\") por encima de la glabela (2 cm [0,75\"] por encima del nivel de los MAE)." },
      posicion: [
        "Sentado erguido o en decúbito supino, con el PMS alineado con el RC y con la línea media de la mesa o del RI, perpendicular al RI; sin rotación ni inclinación.",
        "Bajar el mentón hasta que la LOM o la LIOM quede perpendicular al RI.",
        "Centrar el RI en el RC proyectado.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Hueso occipital, pirámides petrosas y agujero occipital."]],
        ["Posicionamiento", ["El dorso de la silla turca se ve dentro del agujero occipital.", "Sin rotación: porciones petrosas (pirámides) de los temporales simétricas."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver el occipital y las estructuras dentro del agujero occipital.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      notas: ["Alternativa: PA axial (método de Haas). Cabeza con la LOM perpendicular al RI y RC 25° en dirección craneal (cefálica), saliendo 4 cm (1½\") por encima del nasión; la figura indica que pasa por el nivel de los MAE."],
      fuente: { paginas: [228, 229] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-lateral", region: "craneo", nombre: "Lateral de cráneo", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "24 × 30 cm (10 × 12\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: COL_CRANEO },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, unos 5 cm (2\") por encima del MAE." },
      posicion: [
        "Sentado erguido o en semidecúbito prono sobre la mesa.",
        "Cabeza en lateral verdadera, sin rotación ni inclinación: PMS paralelo al RI y LIP perpendicular al RI.",
        "Ajustar el mentón para que la LIOM quede paralela a los bordes superior e inferior del RI.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el cráneo, con las dos mitades superpuestas.", "La silla turca completa, de perfil, y el dorso de la silla."]],
        ["Posicionamiento", ["Sin inclinación: placas orbitarias (techos de las órbitas) superpuestas.", "Sin rotación: alas mayores del esfenoides y ramas de la mandíbula superpuestas."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver las estructuras de la silla turca.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [230, 231] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-pa-caldwell", region: "craneo", nombre: "PA y PA axial (15°) de cráneo", metodo: "Caldwell", categoria: ["PA", "Axiales", "Métodos especiales"], tipo: "R",
      factores: { ri: "24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: COL_CRANEO },
      rc: { direccion: "variable", texto: "PA: perpendicular al RI, saliendo por la glabela. PA axial de Caldwell: 15° caudal respecto de la LOM, saliendo por el nasión (con 25-30° caudal se ven mejor los bordes orbitarios)." },
      posicion: [
        "Sentado erguido o en decúbito prono, con la cabeza alineada con el RC y con la línea media de la mesa o del RI.",
        "Frente y nariz apoyadas sobre el tablero; ajustar la cabeza para que la LOM quede perpendicular al RI.",
        "Sin rotación ni inclinación: PMS perpendicular al RI.",
        "Centrar el RI en el RC proyectado.",
      ],
      criterios: [
        ["Estructuras que se ven", ["PA: hueso frontal y crista galli sin distorsión.", "PA axial a 15°: alas mayores y menores del esfenoides, hueso frontal y fisuras orbitarias superiores."]],
        ["Posicionamiento", ["PA: crestas petrosas a la altura del borde orbitario superior. Sin rotación: igual distancia entre órbitas y paredes laterales del cráneo.", "PA axial a 15°: crestas petrosas en el tercio inferior de las órbitas. Sin rotación: igual distancia entre órbitas y paredes laterales del cráneo."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver el hueso frontal y las estructuras que lo rodean.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      notas: ["Algunos servicios agregan una PA a 0° para ver mejor el hueso frontal, además de la PA axial a 15° de Caldwell."],
      fuente: { paginas: [232, 233] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-smv", region: "craneo", nombre: "Submentovertical (SMV) de cráneo", categoria: ["Axiales"], tipo: "E",
      factores: { ri: "24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: COL_CRANEO },
      rc: { direccion: "perpendicular", texto: "Perpendicular a la LIOM (angulando el tubo lo necesario), centrado 2 cm (0,75\") por delante del nivel de los MAE, en el punto medio entre los ángulos de la mandíbula." },
      posicion: [
        "Sentado erguido o en decúbito supino, con la cabeza extendida más allá del extremo de la mesa y el vértex apoyado sobre el RI con parrilla (se puede inclinar un poco la mesa hacia arriba). Se puede poner gomaespuma o una almohada bajo los hombros.",
        "Ajustar el RI e hiperextender el cuello hasta que la LIOM quede paralela al RI.",
        "Sin rotación ni inclinación.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Agujeros ovales y espinosos, mandíbula, senos esfenoidales y etmoidales posteriores, apófisis mastoides, crestas petrosas, paladar duro, agujero occipital y hueso occipital."]],
        ["Posicionamiento", ["Cóndilos mandibulares por delante de la porción petrosa del temporal.", "Sin inclinación: igual distancia entre los cóndilos mandibulares y las paredes laterales del cráneo.", "Sin rotación: PMS paralelo al borde de la imagen."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver el contorno del agujero occipital.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      notas: ["CAE opcional.", "Si el paciente no puede extender tanto la cabeza, ajustar el RC para que siga perpendicular a la LIOM."],
      fuente: { paginas: [234, 235] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Cráneo por traumatismo ─────────
    {
      id: "craneo-trauma-lateral", region: "craneo-trauma", nombre: "Lateral de cráneo por traumatismo (haz horizontal)", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "24 × 30 cm (10 × 12\"), horizontal (alineado con la dimensión anteroposterior del cráneo)", dfri: DFRI, respiracion: "Exposición en apnea", parrilla: "Sí", colimacion: COL_CRANEO },
      rc: { direccion: "horizontal", texto: "Horizontal, perpendicular al RI, unos 5 cm (2\") por encima del MAE." },
      posicion: [
        "Decúbito supino, sin quitar el collarín cervical si lo tiene.",
        "Si puede haber lesión vertebral, llevar al paciente hasta el borde de la mesa y colocar el RI unos 2,5 cm (1\") por debajo del tablero y de la parte posterior del cráneo (desplazar hacia adelante el tablero flotante).",
        "Cabeza en lateral verdadera, sin rotación ni inclinación.",
        "Centrar el RI con el RC horizontal, de modo que entre todo el cráneo.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el cráneo, con las dos mitades superpuestas.", "Toda la silla turca y el dorso de la silla."]],
        ["Posicionamiento", ["Sin rotación ni inclinación (el manual remite a los criterios de la AP y AP axial por traumatismo)."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver las estructuras de la silla turca.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      notas: ["No elevar ni mover la cabeza hasta descartar una lesión de la columna cervical."],
      fuente: { paginas: [236, 238] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-trauma-ap-axial", region: "craneo-trauma", nombre: "AP y AP axial de cráneo por traumatismo", categoria: ["AP", "Axiales"], tipo: "E",
      factores: { ri: "24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí (Bucky)", colimacion: COL_CRANEO },
      rc: { direccion: "variable", texto: "Según las figuras: AP con el RC paralelo a la LOM, centrado en la glabela; AP axial «inversa» de Caldwell con el RC 15° cefálico respecto de la LOM, centrado en el nasión; AP axial de Towne con el RC 30° caudal respecto de la LOM, unos 5-6 cm (2,5\") por encima de la glabela. El RI se centra en el RC proyectado." },
      posicion: [
        "Pasar al paciente con cuidado a la mesa, en decúbito supino.",
        "Las cuatro proyecciones se hacen tal cual, sin mover la cabeza del paciente.",
      ],
      criterios: [
        ["Estructuras que se ven", ["AP a 0°: hueso frontal y crista galli (magnificados por la mayor DORI).", "AP axial a 15°: alas mayores y menores del esfenoides, hueso frontal y fisuras orbitarias superiores."]],
        ["Posicionamiento", ["AP a 0°: crestas petrosas a la altura del borde orbitario superior. Sin rotación: igual distancia entre órbitas y paredes laterales del cráneo.", "AP axial a 15°: crestas petrosas en el tercio inferior de las órbitas. Sin rotación: igual distancia entre órbitas y paredes laterales del cráneo."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver el hueso frontal y las estructuras que lo rodean.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      notas: [AVISO_TRAUMA, "La pág. 239 no trae criterios para la AP axial de Towne por traumatismo."],
      fuente: { paginas: [237, 239] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Huesos faciales ─────────
    {
      id: "faciales-lateral", region: "huesos-faciales", nombre: "Lateral de huesos faciales", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la zona de los huesos faciales" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, en el malar (prominencia del pómulo), a mitad de camino entre el MAE y el canto externo." },
      posicion: [
        "Erguido o en semidecúbito prono sobre la mesa.",
        "Cabeza en lateral verdadera, con el lado de interés más cerca del RI.",
        "Sin rotación ni inclinación: PMS paralelo al RI y LIP perpendicular al RI.",
        "Ajustar el mentón para que la LIOM quede paralela a los bordes superior e inferior del RI.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Huesos faciales superpuestos, alas mayores del esfenoides y silla turca.", "Desde los techos de las órbitas hasta el mentón."]],
        ["Posicionamiento", ["Sin inclinación: placas orbitarias (techos) superpuestas.", "Sin rotación: alas mayores del esfenoides y ramas de la mandíbula superpuestas."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver las estructuras faciales.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [240, 241] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "faciales-parietoacantial-waters", region: "huesos-faciales", nombre: "Parietoacantial y parietoacantial modificada de huesos faciales", metodo: "Waters y Waters modificado", categoria: ["PA", "Métodos especiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical, o 24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la zona de los huesos faciales" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, saliendo por el acantión (en las dos proyecciones)." },
      posicion: [
        "Waters: sentado erguido (se prefiere) o en decúbito prono sobre la mesa.",
        "Waters: cabeza extendida, apoyada en el mentón, con la LMM perpendicular al RI; así la LOM queda a 37° del RI.",
        "Waters modificada: la LOM queda a 55° del plano del RI, o sea, la LLM (línea desde la comisura de los labios hasta el MAE) perpendicular al RI.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Waters: vista general de los huesos faciales: bordes orbitarios inferiores, maxilares y tabique nasal.", "Waters modificada: pisos de las órbitas de perfil, sin distorsión. Es la proyección ideal para buscar una fractura por estallido del piso de la órbita."]],
        ["Posicionamiento", ["Waters: crestas petrosas justo por debajo del piso de los senos maxilares. Sin rotación: igual distancia entre órbitas y paredes laterales del cráneo.", "Waters modificada: crestas petrosas proyectadas en la mitad inferior de los senos maxilares. Sin rotación: igual distancia entre órbitas y paredes laterales del cráneo."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver la región maxilar y las estructuras que la rodean.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [242, 243] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "faciales-pa-axial-caldwell", region: "huesos-faciales", nombre: "PA axial (15°) de huesos faciales", metodo: "Caldwell", categoria: ["PA", "Axiales", "Métodos especiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical, o 24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta los bordes del cráneo (huesos faciales)" },
      rc: { direccion: "caudal", angulo: "15°", texto: "15° caudal respecto de la LOM, saliendo por el nasión." },
      posicion: [
        "Sentado erguido o en decúbito prono sobre la mesa, con el PMS alineado con el RC y con la línea media de la mesa o del RI.",
        "Frente y nariz apoyadas sobre el tablero; ajustar la cabeza para que la LOM quede perpendicular al RI, sin rotación ni inclinación.",
        "Centrar el RI en el RC proyectado (en el nasión).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Bordes orbitarios, maxilares, tabique nasal y arcos cigomáticos."]],
        ["Posicionamiento", ["Crestas petrosas proyectadas en el tercio inferior de las órbitas.", "Sin rotación: igual distancia entre órbitas y bordes laterales del cráneo."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver la región maxilar y el piso de la órbita.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      notas: ["Si interesan los bordes inferiores de las órbitas, hace falta un ángulo de 30° para proyectar las crestas petrosas por debajo de ellos; el RC sale entonces por la parte media de las órbitas."],
      fuente: { paginas: [244, 245] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Huesos faciales por traumatismo ─────────
    {
      id: "faciales-trauma-lateral", region: "faciales-trauma", nombre: "Lateral de huesos faciales por traumatismo (haz horizontal)", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical", dfri: null, respiracion: null, parrilla: "Sí, apoyada de canto contra la pared lateral del cráneo", colimacion: null },
      rc: { direccion: "horizontal", texto: "Horizontal, a mitad de camino entre el canto externo y el MAE." },
      posicion: [
        "Decúbito supino, sin mover la cabeza y sin quitar el collarín cervical si lo tiene.",
        "Sin rotación ni inclinación: PMS paralelo al RI.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [AVISO_TRAUMA],
      fuente: { paginas: [246] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "faciales-trauma-waters-inversa", region: "faciales-trauma", nombre: "Acantioparietal de huesos faciales por traumatismo", metodo: "Waters inverso y Waters inverso modificado", categoria: ["AP", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical", dfri: null, respiracion: null, parrilla: "Sí (Bucky)", colimacion: null },
      rc: { direccion: "variable", texto: "Waters inversa: RC paralelo a la LMM, centrado en el acantión (si hace falta, angulado en dirección cefálica, salvo que ya se haya descartado una lesión cervical). Waters inversa modificada: RC paralelo a la LLM, centrado en el acantión." },
      posicion: [
        "Decúbito supino, sin mover la cabeza y sin quitar el collarín cervical si lo tiene.",
        "PMS alineado con el RC y con la línea media de la mesa o del RI.",
        "Sin rotación ni inclinación.",
        "La Waters inversa modificada se hace igual que la Waters inversa, salvo la línea a la que se alinea el RC.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [AVISO_TRAUMA, "CAE: centrar el campo."],
      fuente: { paginas: [246] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Agujeros ópticos ─────────
    {
      id: "agujeros-opticos-rhese", region: "agujeros-opticos", nombre: "Parietoorbitaria oblicua de agujeros ópticos", metodo: "Rhese", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada a un cuadrado de 8-10 cm (3-4\")" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, en el centro de la parte inferior de la órbita que queda abajo." },
      posicion: [
        "Sentado erguido o en decúbito prono sobre la mesa.",
        "Punto de partida: nariz, mejilla y mentón apoyados sobre el tablero.",
        "Ajustar la cabeza para que la LAM quede perpendicular al RI y el PMS a 53° del RI (usar un medidor de ángulos).",
        "Centrar el RI en el RC (hacia la parte inferior de la órbita).",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Se radiografían las dos órbitas para comparar.", "No se recomienda el CAE."],
      fuente: { paginas: [247] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Arcos cigomáticos ─────────
    {
      id: "arcos-smv", region: "arcos-cigomaticos", nombre: "SMV bilateral de arcos cigomáticos", categoria: ["Axiales"], tipo: "R",
      factores: { ri: "24 × 30 cm (10 × 12\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí (la figura indica que se puede preferir sin parrilla en posición erguida)", colimacion: "Hasta incluir la zona de los arcos cigomáticos" },
      rc: { direccion: "perpendicular", texto: "Perpendicular a la LIOM (angulando lo necesario), centrado a mitad de camino entre los arcos cigomáticos, unos 4 cm (1,5\") por debajo de la sínfisis mandibular." },
      posicion: [
        "Sentado erguido o en decúbito supino, con la cabeza extendida más allá del extremo de la mesa y el vértex apoyado sobre un RI con parrilla o en el Bucky mural (se puede inclinar un poco la mesa hacia arriba).",
        "Ajustar el RI y la cabeza para que la LIOM quede paralela al RI.",
        "Sin rotación ni inclinación.",
        "Centrar el RI en el RC.",
      ],
      criterios: CRIT_ARCOS,
      notas: ["No se recomienda el CAE."],
      fuente: { paginas: [248, 250] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "arcos-tangencial", region: "arcos-cigomaticos", nombre: "Inferosuperior oblicua (tangencial) de arcos cigomáticos", categoria: ["Tangenciales", "Oblicuas"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada a la zona de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular a la LIOM (angulado si hace falta), centrado en la parte media del arco cigomático." },
      posicion: [
        "Colocar como para una SMV de cráneo, con la LIOM paralela al RI.",
        "Rotar la cabeza unos 15° hacia el lado que se estudia.",
        "Inclinar el PMS unos 15° hacia el lado que se estudia (a veces hace falta más para sacar el arco de encima de la mandíbula y el parietal).",
        "Centrar el RI en el RC.",
      ],
      criterios: CRIT_ARCOS,
      notas: ["Por lo general se radiografían los dos arcos para comparar.", "No se recomienda el CAE."],
      fuente: { paginas: [249, 250] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "arcos-ap-axial-towne", region: "arcos-cigomaticos", nombre: "AP axial de arcos cigomáticos", metodo: "Towne modificado", categoria: ["AP", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la zona de los dos arcos" },
      rc: { direccion: "caudal", angulo: "30° respecto de la LOM o 37° respecto de la LIOM", texto: "30° caudal respecto de la LOM, o 37° respecto de la LIOM. Entra 2,5 cm (1\") por encima del nasión, para que pase por la parte media de los arcos." },
      posicion: [
        "Sentado erguido o en decúbito supino, con el PMS alineado con la línea media de la mesa o del RI, sin rotación ni inclinación.",
        "Bajar el mentón hasta que la LOM o la LIOM quede perpendicular al RI.",
        "Centrar el RI en el RC proyectado.",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["No se recomienda el CAE."],
      fuente: { paginas: [251] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Huesos nasales ─────────
    {
      id: "nasales-lateral", region: "huesos-nasales", nombre: "Lateral de huesos nasales", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "No; pantallas para mejorar el detalle (analógica)", colimacion: "Ajustada a un cuadrado de unos 10 cm (4\")" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, unos 1,25 cm (0,5\") por debajo del nasión." },
      posicion: [
        "Sentado erguido o en semidecúbito prono sobre la mesa.",
        "Centrar los huesos nasales en la mitad del RI y en el RC.",
        "Ajustar la cabeza para que la LIOM quede paralela a los bordes superior e inferior del RI.",
        "Lateral verdadera: LIP perpendicular al RI y PMS paralelo.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Huesos nasales con sus partes blandas.", "Desde la sutura frontonasal hasta la espina nasal anterior."]],
        ["Posicionamiento", ["Sin rotación: huesos nasales completos, de perfil.", "Desde la sutura frontonasal hasta la espina nasal anterior dentro del campo colimado."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver los huesos nasales y las partes blandas vecinas.", "Bordes óseos nítidos con detalle de partes blandas, sin movimiento."]],
      ],
      notas: ["Por lo general se hacen las dos laterales para comparar."],
      fuente: { paginas: [252, 253] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "nasales-superoinferior", region: "huesos-nasales", nombre: "Superoinferior tangencial (axial) de huesos nasales", categoria: ["Tangenciales", "Axiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "No; pantallas para mejorar el detalle (analógica)", colimacion: "Ajustada a un cuadrado de unos 10 cm (4\")" },
      rc: { direccion: "perpendicular", texto: "Paralelo a la LGA (y perpendicular al RI), tangencial a la glabela." },
      posicion: [
        "Sentado erguido en el extremo de la mesa, o en decúbito prono con apoyos bajo el tórax y bajo el RI.",
        "Apoyar el mentón extendido sobre el RI, que debe quedar perpendicular a la LGA (línea glabeloalveolar) y al RC.",
      ],
      criterios: SIN_CRITERIOS,
      fuente: { paginas: [254] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Mandíbula ─────────
    {
      id: "mandibula-pa", region: "mandibula", nombre: "PA y PA axial de mandíbula", categoria: ["PA", "Axiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical, o 24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta la zona de la mandíbula (área cuadrada)" },
      rc: { direccion: "variable", texto: "PA: perpendicular al RI, saliendo a la altura de la unión de los labios. PA axial (opcional): 20-25° en dirección cefálica, saliendo por el acantión; muestra mejor las ramas proximales y los cóndilos." },
      posicion: [
        "Sentado erguido o en decúbito prono sobre la mesa, con la cabeza alineada con la línea media de la mesa o del RI.",
        "Frente y nariz apoyadas sobre el tablero; ajustar la cabeza para que la LOM quede perpendicular al RI.",
        "Sin rotación ni inclinación: PMS perpendicular al RI.",
        "Centrar el RI en el RC (a la altura de la unión de los labios).",
      ],
      criterios: CRIT_MANDIBULA,
      notas: ["No se recomienda el CAE."],
      fuente: { paginas: [255, 258] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-axiolateral", region: "mandibula", nombre: "Axiolateral y axiolateral oblicua de mandíbula", categoria: ["Perfil", "Oblicuas", "Axiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\") o 24 × 30 cm (10 × 12\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Con o sin parrilla", colimacion: "Hasta la zona de la mandíbula (área cuadrada)" },
      rc: { direccion: "cefálico", angulo: "25°", texto: "25° cefálico respecto de la LIP, centrado en el lado de abajo, en la parte media de la mandíbula (unos 5 cm [2\"] por debajo del ángulo del lado de arriba)." },
      posicion: [
        "Sentado erguido, en semidecúbito prono o en semidecúbito supino, con un apoyo bajo el hombro y la cadera.",
        "Mentón extendido y el lado de interés apoyado sobre el RI.",
        "Ajustar la cabeza para que la LIP quede perpendicular al RI, sin inclinación.",
        "Rotar la cabeza hacia el RI según la zona de interés: en lateral verdadera (0°) se ve la rama (axiolateral); con 10-15°, estudio general de la mandíbula; con 30° hacia el RI, el cuerpo; con 45°, el mentón.",
      ],
      criterios: CRIT_MANDIBULA,
      notas: ["Por lo general se hacen los lados derecho e izquierdo para comparar, salvo contraindicación.", "No se recomienda el CAE."],
      fuente: { paginas: [256, 258] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-axiolateral-trauma", region: "mandibula", nombre: "Axiolateral oblicua de mandíbula por traumatismo (haz horizontal)", categoria: ["Oblicuas", "Axiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\") o 24 × 30 cm (10 × 12\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Con o sin parrilla", colimacion: "Hasta la zona de la mandíbula (área cuadrada)" },
      rc: { direccion: "cefálico", angulo: "25° (más 5-10° hacia posterior)", texto: "Haz horizontal, 25° cefálico (respecto de la lateral o de la LIP) y angulado 5-10° hacia abajo (posterior) para evitar que se superponga el hombro. Centrado unos 5 cm (2\") distal al ángulo de la mandíbula del lado alejado del RI." },
      posicion: [
        "Para pacientes con traumatismo que no pueden colaborar.",
        "Decúbito supino, sin rotar la cabeza, con el PMS perpendicular al tablero.",
        "RI de canto, cerca de la cara y paralelo al PMS, con su borde inferior unos 2,5 cm (1\") por debajo del borde inferior de la mandíbula.",
        "Bajar los hombros y elevar o extender el mentón si se puede.",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Se puede rotar un poco la cabeza hacia el RI (10-15°) para ver mejor el cuerpo o el mentón, si son la zona de interés.", "Los criterios de la pág. 258 son los de la PA y la axiolateral oblicua de rutina."],
      fuente: { paginas: [257] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-ap-axial", region: "mandibula", nombre: "AP axial de mandíbula o de ATM y apófisis condíleas", categoria: ["AP", "Axiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\") o 24 × 30 cm (10 × 12\"), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Desde las ATM hasta el cuerpo de la mandíbula" },
      rc: { direccion: "caudal", angulo: "35° respecto de la LOM (42° respecto de la LIOM)", texto: "35° caudal respecto de la LOM (42° respecto de la LIOM), centrado en la glabela para ver la mandíbula. Si el objetivo principal son las ATM, centrar unos 2,5 cm (1\") por encima de la glabela." },
      posicion: [
        "Sentado erguido o en decúbito supino, con el PMS centrado en la línea media de la mesa, sin rotación ni inclinación.",
        "Bajar el mentón para que la LOM quede perpendicular al RI si se puede (o la LIOM perpendicular, sumando 7° al ángulo del RC).",
        "Centrar el RI en el RC proyectado.",
      ],
      criterios: SIN_CRITERIOS,
      fuente: { paginas: [259] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── ATM ─────────
    {
      id: "atm-law-modificado", region: "atm", nombre: "Axiolateral oblicua de ATM (boca abierta y cerrada)", metodo: "Law modificado", categoria: ["Oblicuas", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal (dividido en el mismo RI)", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta un cuadrado de 8-10 cm (3-4\")" },
      rc: { direccion: "caudal", angulo: "15°", texto: "15° caudal, entrando 4 cm (1½\") por encima del MAE del lado de arriba." },
      posicion: [
        "Sentado erguido (se prefiere) o en semidecúbito prono, con el lado afectado abajo.",
        "Ajustar el mentón para que la LIOM quede perpendicular al borde anterior del RI.",
        "Girar el cráneo (PMS) 15° hacia el RI, sin inclinación; la LIP sigue perpendicular al RI.",
        "Centrar en el RC la mitad del RI que se expone.",
        "Segunda exposición en la misma posición, con la boca bien abierta.",
      ],
      criterios: CRIT_ATM,
      notas: ["Se hacen los lados derecho e izquierdo, con boca abierta y cerrada, para comparar.", "La rutina pide boca abierta y cerrada con Law modificado o con Schuller."],
      fuente: { paginas: [260, 262] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "atm-schuller", region: "atm", nombre: "Axiolateral de ATM (boca abierta y cerrada)", metodo: "Schuller", categoria: ["Perfil", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal (dividido en el mismo RI)", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta un cuadrado de 8-10 cm (3-4\")" },
      rc: { direccion: "caudal", angulo: "25-30°", texto: "25-30° caudal, entrando unos 5 cm (2\") por encima y 1-2 cm (½\") por delante del MAE del lado de arriba." },
      posicion: [
        "Sentado erguido o en semidecúbito prono, con el lado afectado abajo.",
        "Ajustar el mentón para que la LIOM quede perpendicular al borde anterior del RI; cabeza en lateral verdadera, sin rotación ni inclinación.",
        "Centrar en el RC proyectado la mitad del RI que se expone.",
        "Segunda exposición en la misma posición, con la boca bien abierta.",
      ],
      criterios: CRIT_ATM,
      notas: ["Se hacen los dos lados, con boca abierta y cerrada, para comparar.", "La rutina pide boca abierta y cerrada con Law modificado o con Schuller."],
      fuente: { paginas: [261, 262] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Senos paranasales ─────────
    {
      id: "senos-lateral", region: "senos", nombre: "Lateral de senos paranasales", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la región de los senos" },
      rc: { direccion: "horizontal", texto: "Horizontal, en el punto medio entre el MAE y el canto externo." },
      posicion: [
        "Erguido, sentado mirando al RI; girar la cabeza hasta una lateral verdadera.",
        "Levantar el mentón para que la LIOM quede perpendicular al borde anterior del RI.",
        "Sin rotación: PMS paralelo y LIP perpendicular al RI.",
        "Centrar el RI en el RC.",
      ],
      criterios: CRIT_SENOS_LAT_PA,
      notas: [NIVELES, "No se recomienda el CAE."],
      fuente: { paginas: [263, 265] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "senos-pa-caldwell", region: "senos", nombre: "PA de senos paranasales (PA modificada)", metodo: "Caldwell", categoria: ["PA", "Métodos especiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta la región de los senos" },
      rc: { direccion: "horizontal", texto: "Horizontal (paralelo al piso), saliendo por el nasión." },
      posicion: [
        "PA de Caldwell (si se puede inclinar el soporte): sentado erguido mirando al RI; inclinar la parte superior del RI 15° hacia el paciente. Cabeza con la LOM perpendicular al RI, sin rotación. RI centrado en el RC (nasión).",
        "PA de Caldwell modificada (si no se puede inclinar el soporte): inclinar la cabeza hacia atrás hasta que la LOM quede a 15° de la horizontal.",
      ],
      criterios: CRIT_SENOS_LAT_PA,
      notas: [NIVELES, "No se recomienda el CAE."],
      fuente: { paginas: [264, 265] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "senos-parietoacantial-waters", region: "senos", nombre: "Parietoacantial de senos paranasales", metodo: "Waters", categoria: ["PA", "Métodos especiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\") o 24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la zona de los senos" },
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al RI, saliendo por el acantión." },
      posicion: [
        "Sentado erguido, con el mentón extendido y apoyado contra el receptor.",
        "Ajustar la altura del RI para centrarlo en el acantión.",
        "Ajustar la LMM perpendicular al RI (la LOM queda a 37° del RI).",
        "Sin rotación: PMS perpendicular al soporte del RI.",
        "Centrar el RI en el RC.",
        "Opción con boca abierta: el paciente abre bien la boca para ver mejor los senos esfenoidales a través de ella.",
      ],
      criterios: CRIT_SENOS_WATERS_SMV,
      notas: [NIVELES, "No se recomienda el CAE."],
      fuente: { paginas: [266, 268] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "senos-smv", region: "senos", nombre: "SMV de senos paranasales", categoria: ["Axiales"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\") o 24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la región de los senos" },
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular a la LIOM, centrado a mitad de camino entre los ángulos de la mandíbula, 4-5 cm (1½-2\") por debajo de la sínfisis mandibular." },
      posicion: [
        "Sentado erguido, reclinado en la silla y con la cabeza extendida para apoyar el vértex en el soporte del RI.",
        "Ajustar la cabeza para que la LIOM quede lo más paralela posible al plano del RI, sin rotación ni inclinación.",
        "Centrar el RI en el RC.",
      ],
      criterios: CRIT_SENOS_WATERS_SMV,
      notas: [NIVELES, "No se recomienda el CAE."],
      fuente: { paginas: [267, 268] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
