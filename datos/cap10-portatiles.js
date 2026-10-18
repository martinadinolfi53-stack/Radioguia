// Capítulo 10 · Exploraciones con dispositivos móviles (portátiles) e intraoperatorias (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 311-319).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// respiracion, parrilla y colimacion: null cuando el manual no las indica para esa proyección.
// Principios del capítulo (pág. 311) para traumatismo y portátiles: dos proyecciones a 90° entre sí como mínimo;
// incluir en el RI toda la estructura o zona traumatizada (y sumar proyecciones si no entra en la primera);
// mantener la seguridad del paciente, del personal y del público; proteger los tejidos radiosensibles fuera de la
// zona de interés cuando corresponda.
// El índice del capítulo no marca ninguna proyección como (R) o (E): todas se cargan como "R" con una entrada de revisión.
// La pág. 319 ("Notas sobre el procedimiento") es una hoja en blanco para anotaciones.

const DFRI = "100 cm (40\")";
const SIN_CRIT = []; // el manual no trae página de criterios: se deja vacío para completar después

export default {
  capitulo: 10,
  titulo: "Exploraciones con dispositivos móviles (portátiles) e intraoperatorias",
  paginas: "311-319",
  regiones: [
    { id: "port-torax", nombre: "Tórax portátil", detalle: "" },
    { id: "port-abdomen", nombre: "Abdomen portátil", detalle: "" },
    { id: "port-pelvis-cadera", nombre: "Pelvis y cadera portátil", detalle: "" },
    { id: "intraop-arco", nombre: "Intraoperatoria con arco", detalle: "Arco en C" },
  ],
  proyecciones: [
    // ───────── Tórax portátil ─────────
    {
      id: "port-torax-ap", region: "port-torax", nombre: "AP de tórax portátil (decúbito supino y posición semiincorporada)", categoria: ["AP"], tipo: null,
      factores: { ri: "35 × 43 cm (14 × 17\"), horizontal o vertical", dfri: "120-180 cm (48-72\"); usar la mayor DFRI posible", respiracion: "Exponer después de una segunda inspiración completa", parrilla: "Con o sin parrilla", colimacion: null },
      rc: { direccion: "caudal", angulo: "3-5°", texto: "3-5° caudal respecto de la perpendicular al RI, para que el RC entre perpendicular al esternón (así las clavículas no tapan los vértices). Centrado 8-10 cm (3-4\") por debajo de la escotadura yugular, a la altura de T7." },
      posicion: [
        "Cubrir el RI con una funda de plástico.",
        "Centrar al paciente con el borde superior del RI unos 5 cm (2\") por encima de los hombros.",
        "Si el paciente está en decúbito supino, levantar el respaldo de la cama, si se puede, hasta dejarlo sentado o semierguido.",
        "Sin rotación.",
        "Si su estado lo permite, rotar los hombros hacia adelante.",
      ],
      criterios: SIN_CRIT,
      fuente: { paginas: [312] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Abdomen portátil ─────────
    {
      id: "port-abdomen-ap-supino", region: "port-abdomen", nombre: "AP de abdomen portátil en decúbito supino (RUV)", categoria: ["AP"], tipo: null,
      factores: { ri: "35 × 43 cm (14 × 17\"), vertical", dfri: DFRI, respiracion: "Exponer en espiración", parrilla: "Sí", colimacion: null },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en el RI a la altura de la cresta ilíaca." },
      posicion: [
        "Cubrir el RI con una funda de plástico.",
        "Centrar el RI en el paciente a la altura de la cresta ilíaca.",
        "Si hace falta, poner apoyos debajo del RI para que quede horizontal y perpendicular al RC: así el paciente no rota y se evita el artefacto por corte de parrilla.",
      ],
      criterios: SIN_CRIT,
      fuente: { paginas: [313] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-abdomen-decubito-lateral", region: "port-abdomen", nombre: "Decúbito lateral de abdomen portátil", categoria: ["AP", "Decúbitos"], tipo: null,
      factores: { ri: "35 × 43 cm (14 × 17\"), vertical (respecto de las estructuras anatómicas)", dfri: DFRI, respiracion: "Exponer en espiración", parrilla: "Sí", colimacion: null },
      rc: { direccion: "horizontal", texto: "Horizontal, al centro del RI, 5 cm (2\") por encima de la cresta ilíaca." },
      posicion: [
        "Paciente sobre el lado izquierdo (o el derecho si se indica), con apoyos para que no se hunda en una cama blanda.",
        "Centro del RI 5 cm (2\") por encima de la cresta ilíaca, para incluir el diafragma.",
        "Sin rotación, y con el plano del RI perpendicular al RC.",
        "Usar marcador de decúbito.",
      ],
      criterios: SIN_CRIT,
      notas: [
        "El decúbito lateral izquierdo es la proyección que mejor muestra el aire libre en el abdomen superior derecho; tiene que incluir el diafragma.",
        "Dejar al paciente acostado de lado unos 5 minutos como mínimo antes de exponer; mejor 10-20 minutos. Verificar que entren el diafragma y el borde superior del abdomen.",
      ],
      fuente: { paginas: [314] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Pelvis y cadera portátil ─────────
    {
      id: "port-pelvis-cadera-ap", region: "port-pelvis-cadera", nombre: "AP de pelvis o de cadera portátil", categoria: ["AP"], tipo: null,
      factores: { ri: "Pelvis: 35 × 43 cm (14 × 17\"), horizontal. Solo cadera: 24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: "Apnea durante la exposición", parrilla: "Sí", colimacion: null },
      rc: { direccion: "perpendicular", texto: "Pelvis: perpendicular, a mitad de camino entre las EIAS y la sínfisis del pubis. AP de cadera: RC y RI centrados en la región de la cadera (5 cm [2\"] medial a la EIAS, a la altura del trocánter mayor)." },
      posicion: [
        "Cubrir el RI con una funda de plástico y deslizarlo debajo del paciente, centrado en sentido horizontal.",
        "Pelvis: borde superior del RI ≈2,5 cm (1\") por encima de la cresta ilíaca.",
        "Sin rotación: las EIAS a la misma distancia del RI.",
        "Rotar las dos piernas 15° hacia adentro solo si no se sospecha fractura de cadera.",
      ],
      criterios: SIN_CRIT,
      notas: ["Las figuras muestran una AP de pelvis por traumatismo sin rotar la pierna y una AP de cadera con la pierna rotada."],
      fuente: { paginas: [315] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-cadera-axiolateral-danelius", region: "port-pelvis-cadera", nombre: "Axiolateral de cadera portátil", metodo: "Danelius-Miller", categoria: ["Perfil", "Métodos especiales"], tipo: null,
      factores: { ri: "24 × 30 cm (10 × 12\"), horizontal (eje largo del RI alineado con el eje largo del fémur)", dfri: DFRI, respiracion: "Apnea durante la exposición", parrilla: "Sí", colimacion: null },
      rc: { direccion: "horizontal", texto: "Horizontal, angulado lo necesario para quedar perpendicular al RI y al cuello femoral." },
      posicion: [
        "Poner toallas dobladas o un apoyo debajo de la cadera afectada.",
        "Parrilla vertical contra el costado del paciente, con el borde superior del RI a la altura de la cresta ilíaca y la cara de la parrilla paralela al cuello femoral y perpendicular al RC.",
        "Elevar la otra pierna. NO apoyar la pierna ni el pie sobre el colimador o el tubo: hay riesgo de quemaduras y de descarga eléctrica.",
        "Rotar hacia adentro la pierna afectada solo si no se sospecha una fractura de cadera no fijada.",
      ],
      criterios: SIN_CRIT,
      fuente: { paginas: [316] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-cadera-axiolateral-clements", region: "port-pelvis-cadera", nombre: "Axiolateral modificada de cadera y fémur proximal portátil", metodo: "Clements-Nakayama", categoria: ["Perfil", "Métodos especiales"], tipo: null,
      factores: { ri: "24 × 30 cm (10 × 12\"), horizontal", dfri: DFRI, respiracion: null, parrilla: "Sí, alineada con el ángulo del RC para evitar el artefacto por corte de parrilla", colimacion: null },
      rc: { direccion: "angulado", angulo: "≈15-20° posterior", texto: "Ajustar el ángulo del RC en sentido mediolateral para que quede perpendicular al RI y centrado en el cuello femoral (≈15-20° hacia posterior respecto de la horizontal)." },
      posicion: [
        "Decúbito supino con el lado afectado cerca del borde de la mesa y las dos piernas totalmente extendidas.",
        "Almohada bajo la cabeza y brazos cruzados sobre la parte alta del tórax.",
        "Pierna en posición neutra (anatómica).",
        "Apoyar el RI en la bandeja del Bucky extendida, de modo que su borde inferior quede ≈5 cm (2\") por debajo del nivel del tablero.",
        "Inclinar el RI ≈15° respecto de la vertical y alinearlo para que su cara quede perpendicular al RC, evitando el corte de parrilla.",
        "Centrar la línea central del RI con el RC proyectado.",
      ],
      criterios: SIN_CRIT,
      notas: ["Proyección alternativa cuando las dos piernas tienen la movilidad limitada y no se puede hacer la inferosuperior."],
      fuente: { paginas: [317] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Intraoperatoria con arco ─────────
    {
      id: "intraop-abdomen-pa-colangiograma", region: "intraop-arco", nombre: "PA de abdomen (colangiograma) con arco", categoria: ["PA"], tipo: null,
      factores: { ri: null, dfri: null, respiracion: null, parrilla: null, colimacion: null },
      rc: { direccion: "sin-dato", texto: "Proyección PA con el paciente en decúbito supino: intensificador de imagen arriba y tubo abajo. El manual no da ángulo ni punto de centrado." },
      posicion: [
        "Paciente en decúbito supino; intensificador arriba y tubo abajo (PA).",
        "Dar delantales y protecciones plomadas portátiles a todo el personal de la sala.",
        "Mantener el campo estéril.",
        "Control de la exposición automático o manual.",
        "Con un pedal, el médico controla la imagen de fluoroscopia en el monitor sin usar las manos.",
      ],
      criterios: SIN_CRIT,
      fuente: { paginas: [318] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "intraop-cadera-lateral", region: "intraop-arco", nombre: "Lateral de cadera con arco", categoria: ["Perfil"], tipo: null,
      factores: { ri: null, dfri: null, respiracion: null, parrilla: null, colimacion: null },
      rc: { direccion: "horizontal", texto: "Horizontal, con el tubo de rayos X arriba (superior) y el intensificador abajo (inferior): proyección superoinferior." },
      posicion: [
        "Proyección superoinferior: RC horizontal, tubo superior e intensificador inferior.",
        "Asegurar un campo estéril.",
        "Dar delantales y protecciones plomadas.",
        "La exposición a la radiación es máxima del lado del tubo: el operador tiene que alejarse de esa zona.",
      ],
      criterios: SIN_CRIT,
      notas: ["Según el manual, el montaje recomendado es el inverso del que se muestra (proyección inferosuperior), por el aumento de radiación del lado del tubo."],
      revision: [
        "La nota del manual es confusa: describe la proyección como superoinferior (tubo superior) y luego dice que el montaje recomendado es \"una inversión del que se presenta aquí como proyección inferosuperior\". Hay que confirmar cuál es la disposición recomendada.",
      ],
      fuente: { paginas: [318] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
