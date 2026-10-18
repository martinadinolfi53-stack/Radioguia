// Capítulo 7 · Tórax óseo (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 212-224).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// respiracion: null cuando el manual no la indica para esa proyección.
// Consideraciones generales (pág. 213):
// - Esternón: la rutina suele incluir una lateral y una oblicua; una OAD de 15-20° desplaza el esternón a la izquierda
//   de la columna, sobre la sombra cardíaca. Suele usarse técnica ortostática (con respiración) para borrar marcas
//   pulmonares y costillas; si se prefiere, también en apnea. DFRI mínima 100 cm (40"); la piel del paciente al menos
//   a 38 cm (15") de la superficie del colimador para reducir la dosis cutánea.
// - Costillas: cada servicio define su rutina. Dos imágenes: AP o PA (por encima o por debajo del diafragma) más una
//   oblicua de las costillas axilares del lado de la lesión, rotando la columna lejos de la lesión. Tres imágenes
//   (algunos servicios, en traumatismo): AP por encima y AP por debajo del diafragma, más OPD y OPI.
// - Por encima del diafragma: menos exposición (cercana a tórax) y en inspiración. Por debajo: exposición cercana a
//   abdomen y en espiración.

const DFRI_COSTILLAS = "180 cm en bipedestación; 100 cm en decúbito";
const CRIT_COSTILLAS_AP = [
  ["Estructuras que se ven", ["Por encima del diafragma: costillas 1 a 10.", "Por debajo del diafragma: costillas 10 a 12."]],
  ["Posicionamiento", ["Sin rotación: bordes costales laterales a igual distancia de la columna."]],
  ["Criterios técnicos", ["Sin movimiento, bordes óseos nítidos.", "Contraste y densidad (brillo) adecuados para ver las costillas 1-10 por encima del diafragma y las 10-12 por debajo (como mínimo)."]],
];
const CRIT_COSTILLAS_AXILARES = [
  ["Estructuras que se ven", ["OPI/OAD: costillas axilares izquierdas (alargadas).", "OPD/OAI: costillas axilares derechas (alargadas).", "Por encima del diafragma: costillas 1-9.", "Por debajo del diafragma: costillas 10-12 (como mínimo).", "La porción axilar de las costillas sin superposición."]],
  ["Posicionamiento", ["Con la oblicua a 45°, las costillas axilares quedan de perfil y la columna se aleja de la zona de interés."]],
  ["Criterios técnicos", ["Sin movimiento, bordes óseos nítidos.", "Contraste y densidad (brillo) óptimos para ver las costillas a través de los pulmones y la sombra cardíaca (por encima del diafragma) y a través de los órganos abdominales densos (por debajo)."]],
];

export default {
  capitulo: 7,
  titulo: "Tórax óseo",
  paginas: "212-224",
  regiones: [
    { id: "esternon", nombre: "Esternón", detalle: "" },
    { id: "esternoclaviculares", nombre: "Articulaciones esternoclaviculares", detalle: "EC" },
    { id: "costillas-bilaterales", nombre: "Costillas (bilaterales)", detalle: "Por encima y por debajo del diafragma" },
    { id: "costillas-axilares", nombre: "Costillas axilares", detalle: "Oblicuas" },
  ],
  proyecciones: [
    // ───────── Esternón ─────────
    {
      id: "esternon-oad", region: "esternon", nombre: "Oblicua anterior derecha (OAD) de esternón", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: "24 × 30 cm, vertical", dfri: "100 cm", respiracion: "Técnica ortostática con respiración (3-4 segundos) o apnea", parrilla: "Sí", colimacion: "Campo largo y estrecho en la zona del esternón" },
      rc: { direccion: "perpendicular", texto: "Perpendicular a la parte media del esternón: 2,5 cm a la izquierda de la línea media y a mitad de camino entre la escotadura yugular y la punta del xifoides." },
      posicion: [
        "De pie (se prefiere) o en decúbito semiprono, rotado 15-20° con el lado derecho hacia abajo.",
        "Un tórax delgado necesita un poco más de oblicuidad que uno grueso.",
        "Centrar el esternón con el RC en la línea media de la mesa o del soporte del RI.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el esternón, superpuesto a la sombra cardíaca."]],
        ["Posicionamiento", ["Rotación correcta: el esternón se ve paralelo a la columna vertebral."]],
        ["Criterios técnicos", ["Con técnica de respiración de 3-4 segundos, las marcas pulmonares se ven borrosas.", "Contraste y densidad (brillo) óptimos para ver todo el esternón.", "Bordes óseos nítidos."]],
      ],
      notas: ["No se recomienda el CAE.", "La figura del manual muestra en recuadro una opción para traumatismo."],
      fuente: { paginas: [214, 216] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esternon-lateral", region: "esternon", nombre: "Lateral de esternón", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "24 × 30 cm o 35 × 35 cm, vertical", dfri: "150-180 cm; 100 cm como mínimo", respiracion: "Exponer en inspiración completa", parrilla: "Sí", colimacion: "Campo largo y estrecho en la zona del esternón" },
      rc: { direccion: "perpendicular", texto: "Perpendicular a la parte media del esternón." },
      posicion: [
        "De pie (se prefiere), sentado o parado, o en decúbito lateral con RC vertical. En traumatismo grave, decúbito supino con RC horizontal (transversal a la mesa).",
        "Brazos por encima de la cabeza o hombros llevados hacia atrás.",
        "Alinear el esternón con el RC en la línea media de la parrilla, la mesa o el Bucky vertical.",
        "Borde superior del RI 4 cm por encima de la escotadura yugular.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el esternón."]],
        ["Posicionamiento", ["Sin rotación: el esternón no queda superpuesto a las costillas.", "Hombros y brazos hacia atrás."]],
        ["Criterios técnicos", ["Sin movimiento, bordes óseos nítidos.", "Contraste y densidad (brillo) óptimos para ver todo el esternón."]],
      ],
      notas: ["No se recomienda el CAE.", "Si se hace en decúbito, colocar una plancha de plomo delante del esternón."],
      fuente: { paginas: [215, 216] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Articulaciones esternoclaviculares ─────────
    {
      id: "esternoclaviculares-pa", region: "esternoclaviculares", nombre: "PA de articulaciones esternoclaviculares (EC)", categoria: ["PA"], tipo: "R",
      factores: { ri: "18 × 24 cm, horizontal", dfri: "100 cm", respiracion: "Apnea en espiración", parrilla: "Sí", colimacion: "Cuatro lados, hasta la zona de las articulaciones esternoclaviculares" },
      rc: { direccion: "perpendicular", texto: "A nivel de T2-T3: perpendicular, sobre el PMS, unos 7 cm por debajo de la vértebra prominente (3 cm por debajo de la escotadura yugular)." },
      posicion: [
        "Decúbito prono o de pie, con el plano mediosagital centrado en el RC.",
        "Cabeza girada hacia un lado, sin rotar los hombros.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cara lateral del manubrio y parte medial de las clavículas, a los lados de la columna."]],
        ["Posicionamiento", ["Sin rotación: las dos articulaciones EC a igual distancia de la columna."]],
        ["Criterios técnicos", ["Sin movimiento, bordes óseos nítidos.", "Las articulaciones EC se ven a través de costillas y pulmones.", "Contraste y densidad (brillo) óptimos para ver las articulaciones EC."]],
      ],
      fuente: { paginas: [217, 218] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esternoclaviculares-oblicua", region: "esternoclaviculares", nombre: "Oblicua anterior de articulaciones esternoclaviculares (OAD / OAI)", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: "18 × 24 cm, horizontal", dfri: "100 cm", respiracion: "Apnea en espiración", parrilla: "Sí", colimacion: "Cuatro lados, hasta la zona de las articulaciones esternoclaviculares" },
      rc: { direccion: "perpendicular", texto: "A nivel de T2-T3: perpendicular, unos 2,5-5 cm lateral al PMS (hacia el lado elevado) y unos 7 cm por debajo de la vértebra prominente." },
      posicion: [
        "Desde la PA, rotar el tórax 10-15° para sacar las vértebras de encima del esternón; así se ve mejor la parte inferior de la articulación EC.",
        "OAD: muestra la articulación EC derecha. OAI: muestra la izquierda.",
        "Con menos oblicuidad (5-10°) se ve mejor la parte superior de la articulación, cerca de la columna.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Manubrio, parte medial de las clavículas y parte inferior de las articulaciones EC."]],
        ["Posicionamiento", ["Paciente rotado 10-15°: la parte inferior de la articulación EC se ve sin superponerse a la columna."]],
        ["Criterios técnicos", ["Sin movimiento, bordes óseos nítidos.", "Contraste y densidad (brillo) suficientes para ver las articulaciones EC a través de costillas y pulmones."]],
      ],
      notas: ["Normalmente se hacen las dos oblicuas para comparar."],
      fuente: { paginas: [217, 218] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Costillas bilaterales ─────────
    {
      id: "costillas-ap-encima-diafragma", region: "costillas-bilaterales", nombre: "AP (o PA) de costillas bilaterales por encima del diafragma", categoria: ["AP", "PA"], tipo: "R",
      factores: { ri: "35 × 43 cm, horizontal (o vertical para estudio unilateral o tórax estrecho)", dfri: "180 cm en bipedestación; 100-120 cm en decúbito", respiracion: "Exponer en inspiración (diafragma abajo)", parrilla: "Sí", colimacion: "Hasta la zona de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, 8-10 cm por debajo de la escotadura yugular (nivel de T7)." },
      posicion: [
        "De pie (se prefiere) o en decúbito, con el plano mediosagital en la línea media de la mesa o Bucky vertical y del RC.",
        "Borde superior del RI unos 4 cm por encima de los hombros.",
        "Hombros hacia adelante, sin rotación.",
        "Tórax centrado a ambos lados en el RI.",
      ],
      criterios: CRIT_COSTILLAS_AP,
      notas: ["Por lo general se hace en AP para las costillas posteriores y en PA para las anteriores."],
      fuente: { paginas: [219, 221] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "costillas-ap-debajo-diafragma", region: "costillas-bilaterales", nombre: "AP de costillas bilaterales por debajo del diafragma", categoria: ["AP"], tipo: "R",
      factores: { ri: "35 × 43 cm, horizontal (o vertical para estudio unilateral o tórax estrecho)", dfri: DFRI_COSTILLAS, respiracion: "Exponer en espiración (diafragma en el punto más alto)", parrilla: "Sí", colimacion: "Hasta la zona de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, centrado en el RI, a mitad de camino entre la punta del xifoides y el borde costal inferior." },
      posicion: [
        "De pie (se prefiere) o en decúbito, con el PMS en la línea media de la mesa o Bucky vertical y del RI (y del RC).",
        "Borde inferior del RI en la cresta ilíaca.",
        "Incluir los dos bordes laterales del tórax (estudio bilateral).",
        "Proteger los tejidos radiosensibles.",
      ],
      criterios: CRIT_COSTILLAS_AP,
      notas: ["Algunas rutinas incluyen solo las costillas del lado afectado (unilateral)."],
      fuente: { paginas: [220, 221] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Costillas axilares ─────────
    {
      id: "costillas-axilares-oad-superiores", region: "costillas-axilares", nombre: "Oblicua anterior (OAD) de costillas axilares superiores", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: "35 × 43 cm o 35 × 35 cm, vertical (ver nota)", dfri: DFRI_COSTILLAS, respiracion: "Por encima del diafragma: exponer en inspiración", parrilla: "Sí", colimacion: "Hasta la zona de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, centrado en el RI, 18-20 cm por debajo de la vértebra prominente (T7)." },
      posicion: [
        "De pie (se prefiere) o en decúbito si hace falta.",
        "Oblicua a 45°, rotando la columna para alejarla de la zona de interés.",
        "Centrar en el RI la región del tórax afectada.",
      ],
      criterios: CRIT_COSTILLAS_AXILARES,
      notas: ["Algunas rutinas piden una oblicua unilateral solo del lado afectado, con un RI más chico en vertical."],
      fuente: { paginas: [222, 224] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "costillas-axilares-opi-inferiores", region: "costillas-axilares", nombre: "Oblicua posterior (OPI) de costillas axilares inferiores", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: "35 × 43 cm, vertical, o 35 × 35 cm", dfri: DFRI_COSTILLAS, respiracion: "Por debajo del diafragma: exponer en espiración", parrilla: "Sí", colimacion: "Hasta la zona de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, centrado en el RI, a mitad de camino entre la apófisis xifoides y el borde costal inferior." },
      posicion: [
        "De pie o en decúbito (se prefiere en decúbito).",
        "Borde superior del RI unos 4 cm por encima de los hombros.",
        "Rotar 45° desde la AP. El brazo más cercano al RI, levantado y apoyado sobre la cabeza; la otra mano en la cintura, con el brazo separado del cuerpo.",
      ],
      criterios: CRIT_COSTILLAS_AXILARES,
      fuente: { paginas: [223, 224] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
