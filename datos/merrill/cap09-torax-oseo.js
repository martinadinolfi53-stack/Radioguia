// Capítulo 9 · Tórax óseo (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 1, págs. 460-497).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// DFRI: el atlas recomienda 122 cm salvo que la proyección indique otra (pág. 32).
// Parrilla: según la tabla de técnicas del capítulo (pág. 469): Bucky 16:1 en todas; la EC por angulación del RC usa un RI con rejilla sobre la mesa.
// Tipo: R = proyección «fundamental» del resumen de proyecciones (pág. 460); E = el resto.

const DFRI = "122 cm";
const BUCKY = "Sí (Bucky, rejilla 16:1)";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const GONADAS = "Proteger las gónadas.";
const RESP_ESTERNON = "Respiración lenta y superficial durante la exposición (difumina la trama pulmonar); con tiempo corto, suspendida al final de la espiración";

export default {
  capitulo: 9,
  titulo: "Tórax óseo",
  paginas: "460-497",
  regiones: [
    { id: "esternon", nombre: "Esternón", detalle: "" },
    { id: "esternoclaviculares", nombre: "Articulaciones esternoclaviculares", detalle: "EC" },
    { id: "costillas", nombre: "Costillas", detalle: "Anteriores, posteriores y axilares" },
    { id: "costales", nombre: "Articulaciones costales", detalle: "Costovertebrales y costotransversas" },
  ],
  proyecciones: [
    {
      id: "esternon-pa-oblicua-oad", region: "esternon", nombre: "PA oblicua de esternón (OAD)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, dfri: "75 cm (DFRI corta para difuminar las costillas posteriores)", respiracion: RESP_ESTERNON, angulacion: "No", rotacion: "Sí · OAD de 15 a 20° (lo justo para separar esternón y vértebras)" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI; entra por el lado elevado de la espalda a la altura de T7, unos 2,5 cm lateral al plano medio sagital." },
      posicion: [
        "Paciente en decúbito prono, girado a OAD para proyectar el esternón sobre la sombra homogénea del corazón; se apoya en el antebrazo y la rodilla flexionados.",
        "Elevar hombro y cadera izquierdos lo justo para que el esternón no se superponga a las vértebras (una mano sobre el esternón y otra sobre la columna ayudan a estimar los 15 a 20°). Los tórax anchos necesitan menos oblicuidad que los estrechos.",
        "Centrar el eje longitudinal del esternón en la línea media de la rejilla; borde superior del RI unos 4 cm por encima de la escotadura yugular.",
        "Mamas grandes: retirarlas hacia los lados y sujetarlas con una venda.",
        "En pacientes traumatológicos se hace en supino con OPI (AP oblicua) o en bipedestación.",
        GONADAS,
      ],
      criterios: crit(["Proyección ligeramente oblicua del esternón: manubrio, ángulo esternal, cuerpo y apófisis xifoides."], [
        "Todo el esternón, desde la escotadura yugular hasta la punta de la xifoides.",
        "Buena visualización del esternón a través del tórax, con la trama pulmonar difuminada si se usó respiración.",
        "Esternón libre de la columna y proyectado sobre el corazón, con las vértebras apenas oblicuas (sin rotación excesiva).",
        "Parte lateral del manubrio y articulación EC libres de las vértebras.",
      ]),
      fuente: { paginas: [470, 472, 473] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esternon-pa-oblicua-moore", region: "esternon", nombre: "PA oblicua de esternón", metodo: "Moore (prono modificada)", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: f("24 × 30 cm, transversal en la bandeja del Bucky", { parrilla: BUCKY, dfri: "75 cm (DFRI corta para difuminar las costillas posteriores)", respiracion: "Respiración lenta y superficial con mA bajo y 1 a 3 s; si no se puede, suspendida al final de la espiración", angulacion: "Sí · 25° desde la derecha del paciente (menos en pacientes grandes, más en delgados)", rotacion: "No · prono verdadero" }),
      rc: { direccion: "angulado", angulo: "25°", texto: "Ya angulado 25° y centrado en el RI antes de colocar al paciente; con buena posición entra a la altura de T7, unos 5 cm a la derecha de la columna." },
      posicion: [
        "Antes de colocar al paciente: RI transversal en el Bucky, tubo a 75 cm del lado derecho del paciente, angulado 25° hacia el centro del RI, y una marca en la mesa cerca de la cabeza que indique el centro del RI.",
        "El paciente, de pie al lado de la mesa frente al Bucky, se inclina desde la cintura y apoya el esternón en el centro de la mesa, sobre el RI.",
        "Brazos por encima de los hombros con las palmas sobre la mesa, sirviendo de apoyo para el costado de la cabeza.",
        "Comprobar prono verdadero y que la zona media del esternón quede en el centro de la mesa.",
        GONADAS,
      ],
      criterios: crit(["Proyección ligeramente oblicua del esternón."], [
        "Todo el esternón, desde la escotadura yugular hasta la punta de la xifoides.",
        "Buena visualización del esternón a través del tórax; trama pulmonar difuminada si se usó respiración.",
        "Costillas posteriores difuminadas si se usó DFRI corta.",
        "Esternón libre de la columna vertebral.",
      ]),
      notas: ["Alternativa más cómoda para pacientes ambulatorios con dolor agudo."],
      fuente: { paginas: [474, 475] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esternon-lateral-bipedestacion", region: "esternon", nombre: "Lateral de esternón (incorporado)", categoria: ["Perfil"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal (18 × 24 cm vertical para solo la región EC)", { parrilla: BUCKY, dfri: "183 cm (menos magnificación y distorsión)", respiracion: "Suspendida en inspiración profunda", angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, entrando por el borde lateral de la zona media del esternón (para solo la región EC, a la altura de la escotadura yugular)." },
      posicion: [
        "Paciente sentado o de pie, en lateral contra el bucky vertical, con el plano medio sagital vertical.",
        "Hombros rotados hacia atrás y manos entrelazadas detrás de la espalda.",
        "Acercarlo hasta apoyar firmemente el hombro en el bucky y centrar el esternón en la línea media; la cara ancha del esternón queda perpendicular al RI.",
        "Mamas grandes retiradas hacia los lados y sujetas con venda para no tapar la parte inferior del esternón.",
        "Borde superior del RI unos 4 cm por encima de la escotadura yugular.",
        GONADAS,
      ],
      criterios: crit(["Esternón lateral en toda su longitud, con las articulaciones EC y los extremos mediales de las clavículas superpuestos."], [
        "Todo el esternón.",
        "Manubrio libre de las partes blandas de los hombros.",
        "Esternón libre de las costillas; parte inferior no tapada por las mamas (puede hacer falta otra placa con más penetración).",
      ]),
      fuente: { paginas: [476, 477] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esternon-lateral-decubito", region: "esternon", nombre: "Lateral de esternón (decúbito)", categoria: ["Perfil"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, dfri: "180 cm (o la máxima posible con el tubo de techo)", respiracion: "Suspendida al final de una inspiración profunda", angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, entrando por el borde lateral de la zona media del esternón." },
      posicion: [
        "Paciente en decúbito lateral, con caderas y rodillas flexionadas para estar cómodo.",
        "Brazos extendidos por encima de la cabeza, que se apoya sobre ellos o en una almohada.",
        "Apoyo bajo la parte inferior del tórax para dejar horizontal el eje longitudinal del esternón; ajustar la rotación para que su cara ancha quede perpendicular al RI.",
        "Centrar el esternón en la línea media de la rejilla; banda de compresión en las caderas si hace falta.",
        "Borde superior del RI unos 4 cm por encima de la escotadura yugular.",
        "En pacientes graves se hace en decúbito dorsal con haz horizontal y RI con rejilla (también a 180 cm).",
        GONADAS,
      ],
      criterios: crit(["Esternón lateral en toda su longitud."], [
        "Imagen lateral del esternón completo.",
        "Esternón libre de las partes blandas de hombros o brazos y de las costillas.",
        "Parte inferior no tapada por las mamas (puede hacer falta otra placa con más penetración).",
      ]),
      fuente: { paginas: [478, 479] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ec-pa", region: "esternoclaviculares", nombre: "PA de articulaciones esternoclaviculares", categoria: ["PA"], tipo: "R",
      factores: f("18 × 24 cm, transversal", { parrilla: BUCKY, respiracion: "Suspendida al final de la espiración", angulacion: "No", rotacion: "No en la bilateral · en la unilateral, cabeza girada hacia el lado afectado (rota algo la columna)" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, entrando por T3 (detrás de la escotadura yugular)." },
      posicion: [
        "Paciente en decúbito prono (o de pie o sentado), con el plano medio sagital en la línea media de la rejilla.",
        "RI centrado en la apófisis espinosa de T3.",
        "Brazos a los lados con las palmas hacia arriba; hombros en el mismo plano transversal.",
        "Bilateral: cabeza apoyada sobre el mentón, plano medio sagital vertical.",
        "Unilateral: cabeza girada hacia el lado afectado, con la mejilla en la mesa; así se ve mejor la parte lateral del manubrio.",
        GONADAS,
      ],
      criterios: crit(["Articulaciones EC y porción medial de las clavículas."], [
        "Ambas articulaciones EC y los extremos mediales de las clavículas.",
        "Articulaciones EC visibles a través de vértebras y costillas.",
        "Sin rotación en la bilateral; rotación leve en la unilateral.",
      ]),
      fuente: { paginas: [480] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ec-pa-oblicua-rotacion", region: "esternoclaviculares", nombre: "PA oblicua de articulaciones esternoclaviculares", metodo: "Rotación corporal (OAD u OAI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("18 × 24 cm, transversal", { parrilla: BUCKY, respiracion: "Suspendida al final de la espiración", angulacion: "No", rotacion: "Sí · 10 a 15° (OAD u OAI), lado afectado contra el RI" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a la articulación EC más cercana al RI; entra a la altura de T2-T3 (unos 7,5 cm por debajo de la vértebra prominente), 2,5 a 5 cm lateral al plano medio sagital. Entrando por la derecha se ve la EC izquierda y viceversa." },
      posicion: [
        "Paciente en decúbito prono o sentado.",
        "Con el lado afectado contra el RI, oblicuarlo lo suficiente para que las vértebras queden bien por detrás de la EC más cercana (unos 10 a 15°).",
        "Centrar la articulación en la línea media de la rejilla; hombros en el mismo plano transversal.",
        "Centrar el RI con el RC.",
        GONADAS,
      ],
      criterios: crit(["Imagen ligeramente oblicua de la articulación EC."], [
        "EC de interés en el centro, con el manubrio y el extremo medial de la clavícula.",
        "Espacio articular EC abierto.",
        "EC inmediatamente junto a la columna, con oblicuidad mínima.",
        "Buena visualización a través de costillas y campos pulmonares.",
      ]),
      fuente: { paginas: [481] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ec-pa-oblicua-angulacion", region: "esternoclaviculares", nombre: "PA oblicua de articulaciones esternoclaviculares", metodo: "Angulación del RC", categoria: ["Oblicuas"], tipo: "R",
      factores: f("18 × 24 cm, transversal", { parrilla: "Sí (RI con rejilla sobre la mesa, sin Bucky; líneas de la rejilla perpendiculares al eje de la mesa)", respiracion: "Suspendida al final de la espiración", angulacion: "Sí · 15° hacia el plano medio sagital, desde el lado opuesto al estudiado", rotacion: "No · prono" }),
      rc: { direccion: "angulado", angulo: "15°", texto: "Desde el lado opuesto al estudiado, 15° hacia el plano medio sagital, al centro del RI; entra a la altura de T2-T3 (7,5 cm por debajo de la vértebra prominente), 2,5 a 5 cm lateral al plano medio sagital. Entrando por la izquierda se ve la EC derecha y viceversa." },
      posicion: [
        "Paciente en decúbito prono sobre un RI con rejilla colocado bajo la parte superior del tórax, con las líneas de la rejilla perpendiculares al eje largo de la mesa para evitar cortes.",
        "Brazos a los lados con las palmas hacia arriba; hombros en el mismo plano transversal.",
        "Cabeza apoyada sobre el mentón o con el mentón girado hacia la articulación estudiada.",
        GONADAS,
      ],
      criterios: crit(["Imagen ligeramente oblicua de la articulación EC."], [
        "EC de interés en el centro, con el manubrio y el extremo medial de la clavícula.",
        "Espacio articular EC abierto.",
        "EC inmediatamente junto a la columna, con oblicuidad mínima.",
        "Buena visualización a través de costillas y campos pulmonares.",
      ]),
      notas: ["La articulación queda más cerca del RI y se distorsiona menos que con la rotación corporal."],
      fuente: { paginas: [482, 483] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "costillas-anteriores-pa", region: "costillas", nombre: "PA de costillas anteriores superiores", categoria: ["PA"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal (30 × 35 cm para un solo lado)", { parrilla: BUCKY, respiracion: "Suspendida al final de la inspiración (baja el diafragma)", angulacion: "No · opcional 10 a 15° caudal para las costillas 7ª a 9ª", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, que con el RI bien colocado queda a la altura de T7. Opción: 10 a 15° caudal para proyectar el diafragma por debajo de las costillas 7ª a 9ª." },
      posicion: [
        "PA de pie o sentado siempre que se pueda (el diafragma baja más y se ven niveles hidroaéreos); si no, en decúbito prono con la cabeza sobre el mentón.",
        "Plano medio sagital en la línea media de la rejilla.",
        "Borde superior del RI unos 4 cm por encima de los hombros.",
        "Manos en las caderas con las palmas hacia afuera para separar las escápulas; hombros en el mismo plano transversal.",
        "En hiperesténicos, incluir toda la cara lateral de las costillas afectadas (puede requerir desplazar al paciente).",
        GONADAS,
      ],
      criterios: crit(["Costillas anteriores por encima del diafragma (se ven también las posteriores, con menos detalle)."], [
        "Costillas 1ª a 9ª completas, con sus porciones posteriores por encima del diafragma.",
        "Costillas anteriores 1ª a 7ª de ambos lados completas y por encima del diafragma.",
        "En la unilateral, el lado opuesto puede no verse completo.",
        "Costillas visibles a través de los pulmones con contraste suficiente.",
      ]),
      fuente: { paginas: [484, 488, 489] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "costillas-posteriores-ap", region: "costillas", nombre: "AP de costillas posteriores", categoria: ["AP"], tipo: "R",
      factores: f("35 × 43 cm o 30 × 35 cm, longitudinal (transversal para las inferiores)", { parrilla: BUCKY, respiracion: "Por encima del diafragma: inspiración forzada · por debajo: espiración forzada", angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Paciente frente al tubo; incorporado para las costillas por encima del diafragma y en decúbito supino para las de abajo (la gravedad ayuda a mover el diafragma).",
        "Plano medio sagital en la línea media de la rejilla; hombros en el mismo plano transversal.",
        "Por encima del diafragma: RI longitudinal con el borde superior 4 cm por encima de los hombros relajados; manos en las caderas con las palmas hacia afuera (o brazos arriba con las manos bajo la cabeza) y hombros rotados hacia adelante para separar las escápulas.",
        "Por debajo del diafragma: RI transversal en el Bucky con el borde inferior a la altura de las crestas ilíacas; brazos cómodos.",
        GONADAS,
      ],
      criterios: crit(["Costillas posteriores por encima o por debajo del diafragma según la región (se ven también las anteriores, con menos detalle)."], [
        "Por encima del diafragma: costillas posteriores 1ª a 10ª de ambos lados completas.",
        "Por debajo del diafragma: costillas posteriores 8ª a 12ª de ambos lados completas.",
        "Costillas visibles a través de los pulmones o del abdomen.",
        "En la unilateral, el lado opuesto puede no verse completo.",
      ]),
      fuente: { paginas: [490, 491] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "costillas-axilares-ap-oblicua", region: "costillas", nombre: "AP oblicua de costillas axilares (OPD u OPI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("35 × 43 cm o 30 × 35 cm, longitudinal", { parrilla: BUCKY, respiracion: "Por encima del diafragma: inspiración máxima · por debajo: espiración profunda", angulacion: "No", rotacion: "Sí · 45° (OPD u OPI), lado afectado contra el RI" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Incorporado para las costillas por encima del diafragma, en decúbito para las de abajo.",
        "Oblicua posterior de 45° con el lado afectado más cerca del RI; apoyo bajo la cadera elevada si está acostado.",
        "Centrar en la línea media de la rejilla el plano longitudinal que pasa a mitad de camino entre el plano medio sagital y la cara lateral del lado afectado.",
        "Brazo del lado afectado abducido y elevado (mano sobre o bajo la cabeza) para separar la escápula; el otro con la mano en la cadera.",
        "Borde superior del RI 4 cm por encima del hombro relajado (costillas superiores) o borde inferior en las crestas ilíacas (inferiores).",
        GONADAS,
      ],
      criterios: crit(["Porción axilar de las costillas libre de superposición; se ven también las posteriores."], [
        "Distancia entre la columna y el borde lateral de las costillas del lado afectado aproximadamente doble que en el lado sano.",
        "Porción axilar libre de superposición.",
        "Costillas 1ª a 10ª por encima del diafragma (superiores) u 8ª a 12ª por debajo (inferiores).",
        "Costillas visibles a través de los pulmones o del abdomen según la región.",
      ]),
      fuente: { paginas: [492, 493] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "costillas-axilares-pa-oblicua", region: "costillas", nombre: "PA oblicua de costillas axilares (OAD u OAI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("35 × 43 cm o 28 × 35 cm, longitudinal", { parrilla: BUCKY, respiracion: "Por encima del diafragma: inspiración máxima · por debajo: espiración máxima", angulacion: "No", rotacion: "Sí · 45° (OAD u OAI), lado afectado alejado del RI" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Incorporado para las costillas por encima del diafragma, en decúbito para las de abajo (apoyado en el antebrazo y la rodilla flexionada).",
        "Oblicua anterior de 45° con el lado afectado más alejado del RI.",
        "Centrar en la línea media de la rejilla el plano longitudinal que pasa a mitad de camino entre la línea media y la cara lateral del lado elevado.",
        "Borde superior del RI 4 cm por encima del hombro (costillas superiores) o borde inferior en las crestas ilíacas (inferiores).",
        GONADAS,
      ],
      criterios: crit(["Porción axilar de las costillas libre de superposición ósea; se ven también las anteriores."], [
        "Distancia entre la columna y el borde lateral de las costillas del lado afectado aproximadamente doble que en el lado sano.",
        "Porción axilar libre de superposición.",
        "Costillas 1ª a 10ª por encima del diafragma (superiores) u 8ª a 12ª por debajo (inferiores).",
        "Costillas visibles a través de los pulmones o del abdomen según la región.",
      ]),
      notas: ["La OAI muestra las costillas axilares del lado derecho (el lado elevado)."],
      fuente: { paginas: [494, 495] },
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "costales-ap-axial", region: "costales", nombre: "AP axial de articulaciones costales", categoria: ["Axiales"], tipo: "E",
      factores: f("30 × 35 cm, longitudinal", { parrilla: BUCKY, respiracion: "Suspendida al final de una inspiración máxima (la trama pulmonar se marca menos)", angulacion: "Sí · 20° cefálico (5 a 10° más si hay cifosis marcada)", rotacion: "No" }),
      rc: { direccion: "cefálico", angulo: "20°", texto: "20° cefálico, entrando en la línea media unos 5 cm por encima de la apófisis xifoides; aumentar 5 a 10° con cifosis dorsal pronunciada." },
      posicion: [
        "Paciente en decúbito supino con la cabeza apoyada directamente en la mesa, para no acentuar la cifosis.",
        "Plano medio sagital en la línea media de la rejilla; hombros en el mismo plano transversal.",
        "Brazos por encima de la cabeza si la cifosis es pronunciada; si no, a los lados.",
        "Compresión sobre el tórax si hace falta; centrar el RI en el Bucky con el RC.",
        GONADAS,
      ],
      criterios: crit(["Articulaciones costovertebrales y costotransversas."], [
        "Articulaciones costovertebrales y costotransversas abiertas.",
      ]),
      notas: [
        "Indicada en espondilitis reumatoide.",
        "En pacientes de huesos grandes puede hacer falta estudiar cada lado por separado, rotando el cuerpo unos 10° hacia medial; se ve mejor el lado elevado.",
        "Hohmann y Gasteiger proponen 30° cefálico en el paciente medio (35-40° con cifosis marcada), centrando en T4 para la zona superior y en T8 para la inferior.",
      ],
      fuente: { paginas: [496, 497] },
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
