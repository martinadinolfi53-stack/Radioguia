// Capítulo 6 · Columna vertebral (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 173-211).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// respiracion: null cuando el manual no la indica para esa proyección.
// Agujeros intervertebrales y articulaciones cigoapofisarias (pág. 175), según el manual:
//   cervical: cigoapofisarias en lateral; agujeros en oblicua posterior a 45° (lado más próximo al RI, según la tabla; ver revisión en las oblicuas cervicales).
//   torácica: cigoapofisarias en oblicua anterior a 70° (lado más próximo al RI); agujeros en lateral.
//   lumbar: cigoapofisarias en oblicua posterior a 45° (lado más próximo al RI); agujeros en lateral.
// Marcas topográficas (pág. 175): punta del xifoides T9-T10, borde costal inferior L2-L3, cresta ilíaca L4-L5,
//   EIAS S1-S2, sínfisis del pubis; T7 a 8-10 cm por debajo de la escotadura yugular.

const DFRI = "100 cm";
const DFRI_LARGA = "150-180 cm";
const DFRI_TRAUMA = "100-120 cm";
const APNEA = "Apnea durante la exposición";
const ESPIRACION_FINAL = "Exponer al final de la espiración";
const RI_24x30 = "24 × 30 cm, vertical";
const RI_35x43 = "35 × 43 cm, vertical";
const RI_LUMBAR = "30 × 35 cm, vertical, o 35 × 43 cm, vertical";
const SIN_CRITERIOS = []; // el manual no trae página de criterios: se deja vacío para completar después
const TEC_BASE = "Contraste y densidad (brillo) óptimos, sin movimiento.";
const AVISO_COLLARIN = "No retirar el collarín cervical salvo que lo indique el médico después de ver la lateral con haz horizontal.";

export default {
  capitulo: 6,
  titulo: "Columna vertebral",
  paginas: "173-211",
  regiones: [
    { id: "columna-cervical", nombre: "Columna cervical", detalle: "C1-C7, incluye serie de traumatismo" },
    { id: "columna-toracica", nombre: "Columna torácica", detalle: "T1-T12" },
    { id: "columna-lumbar", nombre: "Columna lumbar", detalle: "L1-L5 y unión L5-S1" },
    { id: "columna-escoliosis", nombre: "Escoliosis", detalle: "Serie de escoliosis; en el índice del manual figura dentro de columna lumbar" },
    { id: "columna-sacro-coccix", nombre: "Sacro y cóccix", detalle: "" },
    { id: "columna-sacroiliacas", nombre: "Articulaciones sacroilíacas", detalle: "SI" },
  ],
  proyecciones: [
    // ───────── Columna cervical ─────────
    {
      id: "columna-cervical-ap-boca-abierta", region: "columna-cervical", nombre: "AP de C1-C2 con la boca abierta (atlas y axis)", categoria: ["AP"], tipo: "R",
      factores: { ri: "18 × 24 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada hasta la región C1-C2" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, entrando por el centro de la boca abierta (a C1-C2)." },
      posicion: [
        "En decúbito supino o de pie, con el paciente centrado en el RC y en la línea central.",
        "Con la boca todavía cerrada, acomodar la cabeza de modo que la línea que va del borde inferior de los incisivos superiores a la base del cráneo (puntas de las mastoides) quede perpendicular a la mesa o al RI; si no se logra, angular el RC para compensar.",
        "Centrar el RI en el RC.",
        "Justo antes de exponer, pedir que abra bien la boca sin mover la cabeza, y volver a controlar la alineación.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Apófisis odontoides y cuerpo de C2, masas laterales y apófisis transversas de C1, y articulaciones atlantoaxiales."]],
        ["Posicionamiento", ["Incisivos superiores y base del cráneo superpuestos.", "Apófisis odontoides completa dentro de la boca abierta."]],
        ["Criterios técnicos", ["Contraste y densidad (brillo) óptimos.", "Bordes de partes blandas, bordes óseos y trabeculación nítidos; perfil de la odontoides bien definido, sin movimiento."]],
      ],
      notas: [
        "En pacientes con traumatismo, no quitar el collarín ni mover la cabeza o el cuello hasta que un médico haya revisado la lateral con haz horizontal o la TC cervical.",
        "No se recomienda el CAE porque el campo es muy chico.",
      ],
      fuente: { paginas: [176, 178] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-odontoides-fuchs", region: "columna-cervical", nombre: "AP de apófisis odontoides", metodo: "Fuchs", categoria: ["AP", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada hasta la región C1-C2" },
      rc: { direccion: "angulado", angulo: "paralelo a la LMM", texto: "Paralelo a la LMM, entrando 2,5 cm posteroinferior a las puntas de las mastoides y los ángulos de la mandíbula." },
      posicion: [
        "En decúbito supino o de pie, con el PMS alineado con la línea central y sin rotación.",
        "Levantar el mentón hasta que la LMM quede casi perpendicular al RI; si no se puede levantar lo suficiente, puede hacer falta angular el RC algo hacia cefálico.",
        "Centrar el RI en la salida del RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Apófisis odontoides dentro del perfil del agujero occipital."]],
        ["Posicionamiento", ["La punta de la mandíbula no se superpone a la odontoides.", "Mandíbula de aspecto simétrico."]],
        ["Criterios técnicos", ["Contraste y densidad (brillo) óptimos.", "Bordes de partes blandas, bordes óseos y trabeculación nítidos; perfil de la odontoides bien definido, sin movimiento."]],
      ],
      notas: ["No hacerla si se sospecha traumatismo cervical.", "No se recomienda el CAE.", "Alternativa: PA con el método de Judd (ver ficha propia)."],
      fuente: { paginas: [177, 178] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-odontoides-judd", region: "columna-cervical", nombre: "PA de apófisis odontoides", metodo: "Judd", categoria: ["PA", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada hasta la región C1-C2" },
      rc: { direccion: "angulado", angulo: "paralelo a la LMM", texto: "Con la misma alineación del RC que en el método de Fuchs: paralelo a la LMM." },
      posicion: [
        "En prono, con el mentón apoyado en el tablero de la mesa.",
        "Mantener la misma alineación del RC que en la AP de Fuchs.",
      ],
      criterios: [
        ["Estructuras que se ven", ["La página de criterios (pág. 178) se titula «AP (PA) de apófisis odontoides», pero sus ítems solo describen la AP de Fuchs; no hay criterios específicos para la PA de Judd."]],
      ],
      notas: ["No hacerla si se sospecha traumatismo cervical.", "El manual la presenta como nota dentro de la página del método de Fuchs; los factores se toman de esa misma página."],
      fuente: { paginas: [177] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-ap-axial", region: "columna-cervical", nombre: "AP axial de columna cervical", categoria: ["AP", "Axiales"], tipo: "R",
      factores: { ri: "18 × 24 cm o 24 × 30 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la región anatómica de interés" },
      rc: { direccion: "cefálico", angulo: "15-20°", texto: "Angulado 15-20° cefálico, entrando por C5 (borde inferior del cartílago tiroides)." },
      posicion: [
        "En decúbito supino o de pie, con el plano mediosagital centrado en el RC y en la línea central del RI.",
        "Levantar un poco el mentón para que el ángulo del RC superponga el mentón a la base del cráneo (así la mandíbula solo tapa C1-C2).",
        "Centrar el RI en el RC proyectado.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cuerpos vertebrales de C3 a T2 y articulaciones intervertebrales."]],
        ["Posicionamiento", ["Articulaciones intervertebrales abiertas y apófisis espinosas a igual distancia de la línea media."]],
        ["Criterios técnicos", [TEC_BASE, "Partes blandas, bordes óseos y trabeculación nítidos."]],
      ],
      fuente: { paginas: [179, 181] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-oblicuas", region: "columna-cervical", nombre: "Oblicuas de columna cervical (anteriores o posteriores)", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30, dfri: "100-180 cm; se recomienda la mayor DFRI", respiracion: APNEA, parrilla: "Sí (opcional en pacientes pequeños y en niños)", colimacion: "Hasta la región de la columna C" },
      rc: { direccion: "variable", angulo: "15-20°", texto: "Oblicuas posteriores: 15-20° cefálico, entrando por C4. Oblicuas anteriores: hace falta un ángulo de 15-20° caudal." },
      posicion: [
        "Se prefiere de pie o sentado, con el torso y la cabeza girados 45° respecto del RI y la columna C alineada con el RC y la línea central del RI.",
        "Levantar un poco el mentón y mirar hacia adelante (o girar la cabeza apenas hacia el RI) para que la rama de la mandíbula no tape C1.",
        "Centrar el RI en el RC proyectado.",
        "Se hacen oblicuas derecha e izquierda, en dos RI, para comparar.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Agujeros intervertebrales abiertos y pedículos.", "OPI/OPD: agujeros intervertebrales y pedículos del lado superior (el más alejado del RI).", "OAI/OAD: agujeros intervertebrales y pedículos del lado inferior (el más próximo al RI)."]],
        ["Posicionamiento", ["Oblicua a 45° (AP o PA): agujeros intervertebrales abiertos de forma pareja y pedículos de perfil."]],
        ["Criterios técnicos", [TEC_BASE, "Partes blandas, bordes óseos y trabeculación nítidos."]],
      ],
      notas: ["No hacerlas si se sospecha traumatismo cervical.", "Las oblicuas anteriores se asocian a menos dosis en la tiroides."],
      revision: [ "Lado que se ve: la tabla de la pág. 175 dice que la oblicua posterior a 45° muestra los agujeros intervertebrales del lado más próximo al RI, pero los criterios de la pág. 181 dicen que OPI/OPD muestran el lado superior (más alejado del RI) y OAI/OAD el más próximo. Las dos afirmaciones se contradicen."],
      fuente: { paginas: [180, 181] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-lateral-erguida", region: "columna-cervical", nombre: "Lateral de columna cervical (erguida)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_24x30, dfri: "150-180 cm; una DFRI mayor mejora la visualización de C7 porque los rayos divergen menos", respiracion: "Exponer en espiración completa", parrilla: "Sí (opcional en pacientes pequeños y en niños)", colimacion: "A los cuatro lados, hasta la región de la columna C" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, a la altura de C4 (borde superior del cartílago tiroides)." },
      posicion: [
        "Sentado o de pie, en lateral, con la columna C alineada y centrada respecto del RC y de la línea central del RI.",
        "Borde superior del RI unos 3-5 cm por encima del MAE.",
        "Levantar un poco el mentón para que los ángulos de la mandíbula no tapen la columna.",
        "Relajar y bajar los dos hombros por igual; puede hacer falta poner pesas en ambas manos para ver C7.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Espacios articulares intervertebrales y cuerpos vertebrales de C1 a C7 como mínimo."]],
        ["Posicionamiento", ["Articulaciones cigoapofisarias casi superpuestas.", "La mandíbula no se superpone a la columna C."]],
        ["Criterios técnicos", ["Contraste y densidad (brillo) óptimos de la columna cervical baja y torácica alta, sin movimiento.", "Se ven la anatomía ósea y los bordes de partes blandas."]],
      ],
      notas: ["En pacientes con traumatismo, ver la serie de traumatismo de columna cervical (pág. 187).", "Si aun así no se ve bien C7, hacer la lateral cervicotorácica («del nadador»)."],
      fuente: { paginas: [182, 184] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-nadador", region: "columna-cervical", nombre: "Lateral cervicotorácica («del nadador»), región C5-T3", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI_LARGA, respiracion: "Exponer en espiración completa o con técnica de respiración", parrilla: "Sí", colimacion: "Ajustada hasta el área de interés" },
      rc: { direccion: "variable", angulo: "3-5° caudal (opcional)", texto: "Perpendicular, centrado en T1 (unos 2,5 cm por encima de la escotadura yugular). Opcional: 3-5° caudal para separar los hombros en pacientes con poca flexibilidad." },
      posicion: [
        "Se prefiere de pie o sentado, con la columna C alineada con el RC y la línea central del RI.",
        "Levantar el brazo y el hombro del lado del RI y rotar ese hombro un poco hacia adelante o hacia atrás.",
        "Dejar el otro brazo caído y relajado, bajando el hombro con una leve rotación en sentido contrario, para separar las cabezas humerales de las vértebras.",
        "Alternativa en traumatismo: decúbito lateral con un brazo y hombro hacia abajo y el otro hacia arriba.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cuerpos vertebrales y espacios discales intervertebrales desde C5 hasta T3 como mínimo."]],
        ["Posicionamiento", ["Cabezas humerales separadas de la columna C.", "Cuerpos vertebrales en perspectiva lateral."]],
        ["Criterios técnicos", ["Contraste y densidad (brillo) óptimos de la columna cervical baja y torácica alta, sin movimiento.", "Se ven la anatomía ósea y los bordes de partes blandas."]],
      ],
      revision: ["Centrado en T1: aquí se indica «aproximadamente 2,5 cm» por encima de la escotadura yugular, pero en la serie de traumatismo (pág. 187) la misma referencia figura como «3 cm». Además, la misma medida en la otra unidad que da el libro equivale a unos 3,8 cm. ¿Cuál es el valor correcto?"],
      fuente: { paginas: [183, 184] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-lateral-flexion-extension", region: "columna-cervical", nombre: "Lateral de columna cervical en hiperflexión e hiperextensión", categoria: ["Perfil"], tipo: "E",
      factores: { ri: RI_24x30, dfri: DFRI_LARGA, respiracion: "Exponer en espiración completa", parrilla: "Con o sin parrilla", colimacion: "Hasta la región de la columna C" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, a C4 (borde superior del cartílago tiroides)." },
      posicion: [
        "Se prefiere de pie o sentado, en lateral verdadera, con la columna C alineada con el RC y la línea central del RI.",
        "Relajar y bajar los hombros todo lo posible.",
        "Primer RI: bajar el mentón hasta que toque el tórax, si se puede.",
        "Segundo RI: levantar el mentón al máximo, siempre que el paciente esté cómodo. Incluir toda la columna C en las dos.",
      ],
      criterios: [
        ["Estructuras que se ven", ["C1 a C7: amplitud de movimiento y estabilidad ligamentosa."]],
        ["Posicionamiento", ["Hiperflexión: apófisis espinosas bien separadas.", "Hiperextensión: apófisis espinosas muy juntas."]],
        ["Criterios técnicos", [TEC_BASE, "Bordes de partes blandas y trabeculación nítidos."]],
      ],
      notas: ["Estudio funcional: no hacerlo si se sospecha traumatismo."],
      fuente: { paginas: [185, 186] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-trauma-lateral-horizontal", region: "columna-cervical", nombre: "Serie de traumatismo: lateral con haz horizontal", categoria: ["Perfil", "Decúbitos"], tipo: "E",
      factores: { ri: RI_24x30, dfri: DFRI_LARGA, respiracion: null, parrilla: "Con o sin parrilla", colimacion: null },
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular, a C4 (borde superior del cartílago tiroides). Borde superior del RI unos 3-5 cm por encima del MAE." },
      posicion: ["Paciente en decúbito supino, con el collarín colocado; el RI se pone al costado del cuello y el haz entra de forma horizontal."],
      criterios: SIN_CRITERIOS,
      notas: [AVISO_COLLARIN],
      fuente: { paginas: [187] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-trauma-ap", region: "columna-cervical", nombre: "Serie de traumatismo: AP (axial)", categoria: ["AP", "Axiales"], tipo: "E",
      factores: { ri: RI_24x30, dfri: DFRI_TRAUMA, respiracion: "Exponer después de una espiración completa", parrilla: "Sí", colimacion: null },
      rc: { direccion: "cefálico", angulo: "15-20°", texto: "Angulado 15-20° cefálico, de modo que entre por C4." },
      posicion: ["En decúbito supino, sin quitar el collarín, con los hombros bajos."],
      criterios: SIN_CRITERIOS,
      notas: [AVISO_COLLARIN],
      fuente: { paginas: [187] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-trauma-ap-axial-oblicua", region: "columna-cervical", nombre: "Serie de traumatismo: AP axial oblicua", categoria: ["Oblicuas", "Axiales"], tipo: "E",
      factores: { ri: RI_24x30, dfri: DFRI_TRAUMA, respiracion: null, parrilla: "Sí", colimacion: null },
      rc: { direccion: "angulado", angulo: "45° medial (y 15° cefálico si no se usa parrilla)", texto: "Angulado 45° hacia medial (y 15° cefálico si no se usa parrilla); el RC tiene que entrar a la altura de C4." },
      posicion: ["En decúbito supino, sin mover al paciente ni quitar el collarín; la oblicuidad se logra angulando el tubo. Se hace derecha e izquierda (fig. 6.25)."],
      criterios: SIN_CRITERIOS,
      notas: [AVISO_COLLARIN],
      fuente: { paginas: [187] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-cervical-trauma-cervicotoracica", region: "columna-cervical", nombre: "Serie de traumatismo: lateral cervicotorácica", categoria: ["Perfil"], tipo: "E",
      factores: { ri: RI_24x30, dfri: DFRI_TRAUMA, respiracion: null, parrilla: "Sí", colimacion: null },
      rc: { direccion: "horizontal", texto: "RI centrado en T1 (aproximadamente 3 cm por encima del nivel de la escotadura yugular)." },
      posicion: [
        "Proyección opcional, si hace falta para ver C7.",
        "Levantar el hombro y el brazo del lado del RI y bajar el otro hombro.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [AVISO_COLLARIN],
      revision: [
        "Centrado en T1: aquí dice «3 cm» por encima de la escotadura yugular; en la lateral cervicotorácica de rutina (pág. 183) dice «2,5 cm». Además, la misma medida en la otra unidad que da el libro equivale a unos 3,8 cm, no a 3 cm.",
      ],
      fuente: { paginas: [187] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Columna torácica ─────────
    {
      id: "columna-toracica-ap", region: "columna-toracica", nombre: "AP de columna torácica", categoria: ["AP"], tipo: "R",
      factores: { ri: RI_35x43, dfri: DFRI, respiracion: "Exponer en espiración, para lograr una densidad más pareja", parrilla: "Sí", colimacion: "Campo largo y estrecho, hasta la región de la columna T" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, a la altura de T7 (como en una AP de tórax), 8-10 cm por debajo de la escotadura yugular." },
      posicion: [
        "En decúbito supino, con la columna alineada y centrada en la línea media de la mesa o del RI. Flexionar caderas y rodillas para reducir la curvatura lordótica.",
        "Borde superior del RI al menos 3 cm por encima de los hombros.",
        "Controlar que el tórax y la pelvis no estén rotados; proteger los tejidos radiosensibles.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Los 12 cuerpos torácicos, los espacios articulares intervertebrales y las apófisis espinosas y transversas."]],
        ["Posicionamiento", ["Articulaciones EC a igual distancia de la línea media, sin rotación."]],
        ["Criterios técnicos", ["Contraste y densidad (brillo) óptimos, sin movimiento.", "Bordes de partes blandas y trabeculación nítidos."]],
      ],
      notas: [
        "Ubicar la parte baja de la columna (toracolumbar) del lado del cátodo, por el efecto talón.",
        "Se recomienda un filtro de compensación en cuña para que la densidad de la columna sea pareja.",
      ],
      fuente: { paginas: [188, 190] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-toracica-lateral", region: "columna-toracica", nombre: "Lateral de columna torácica", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_35x43, dfri: DFRI, respiracion: "Se recomienda técnica con respiración (mínimo de 2-3 segundos) o exponer en inspiración completa", parrilla: "Sí", colimacion: "Campo largo y estrecho, hasta la región de la columna T" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, en T7 (8-10 cm por debajo de la escotadura yugular o 18-21 cm por debajo de la vértebra prominente)." },
      posicion: [
        "En decúbito lateral, con apoyo bajo la cintura, rodillas flexionadas y brazos levantados con los codos flexionados. Proteger los tejidos radiosensibles.",
        "Plano medioaxilar alineado y centrado con la línea media de la mesa o del RI.",
        "Borde superior del RI al menos 3 cm por encima de los hombros; sin rotación.",
        "Si hace falta, poner apoyos bajo la parte baja de la espalda para que la columna quede casi paralela al tablero (una leve curvatura natural ayuda, porque acompaña la divergencia de los rayos).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Los 12 cuerpos torácicos, los espacios articulares intervertebrales y las apófisis espinosas y transversas."]],
        ["Posicionamiento", ["Espacios discales intervertebrales abiertos."]],
        ["Criterios técnicos", ["Contraste y densidad (brillo) óptimos; conviene exponer con respiración suave en la lateral.", "Bordes de partes blandas y trabeculación nítidos."]],
      ],
      notas: [
        "Poner una lámina de plomo detrás del paciente para reducir la radiación dispersa.",
        "No usar CAE si se trabaja con técnica de respiración.",
        "En pacientes de hombros anchos puede hacer falta angular el RC 10-15° cefálico si la cintura no está apoyada.",
      ],
      fuente: { paginas: [189, 190] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-toracica-oblicua", region: "columna-toracica", nombre: "Oblicua de columna torácica", categoria: ["Oblicuas"], tipo: "E",
      factores: { ri: RI_35x43, dfri: DFRI, respiracion: "Exponer al final de la espiración", parrilla: "Sí", colimacion: "Campo largo y estrecho, hasta la región de la columna T" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, en T7 (8-10 cm por debajo de la escotadura yugular o 5 cm por debajo del ángulo esternal)." },
      posicion: [
        "En decúbito lateral o de pie, con rotación posterior de 20° desde la lateral verdadera (OPD a 70°, según la figura 6.31).",
        "Columna alineada y centrada con la línea media de la mesa o del RI. El brazo más alejado del RI va detrás de la espalda; el más cercano, levantado y delante de la cabeza.",
        "Borde superior del RI al menos 3 cm por encima de los hombros.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [
        "Por lo general se hacen las dos oblicuas en RI distintos para comparar.",
        "También puede hacerse como oblicua anterior, con menos dosis en las mamas.",
      ],
      fuente: { paginas: [191] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Columna lumbar ─────────
    {
      id: "columna-lumbar-ap", region: "columna-lumbar", nombre: "AP (PA) de columna lumbar", categoria: ["AP", "PA"], tipo: "R",
      factores: { ri: "30 × 35 cm, vertical, o 35 × 43 cm, vertical", dfri: DFRI, respiracion: ESPIRACION_FINAL, parrilla: "Sí", colimacion: "Campo largo y estrecho hasta la región de la columna L, incluyendo las articulaciones SI" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, a unos 4 cm por encima de la cresta ilíaca (L3); con un RI de 35 × 43 cm, centrar en la cresta." },
      posicion: [
        "En decúbito supino, con la columna alineada con la línea media de la mesa o de la parrilla.",
        "Flexionar caderas y rodillas para reducir la curvatura lordótica.",
        "Sin rotación: las dos EIAS a la misma distancia de la mesa.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde T12 hasta S1 como mínimo.", "Cuerpos vertebrales, articulaciones intervertebrales, apófisis espinosas y transversas, articulaciones SI y sacro."]],
        ["Posicionamiento", ["Sin rotación: apófisis transversas, articulaciones SI y sacro simétricos.", "Apófisis espinosas en la línea media."]],
        ["Criterios técnicos", [TEC_BASE, "Bordes de partes blandas y trabeculación nítidos."]],
      ],
      notas: ["Se puede hacer una PA, que abre más los espacios intervertebrales por la divergencia del haz (fig. 6.33)."],
      fuente: { paginas: [192, 193] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-lumbar-lateral", region: "columna-lumbar", nombre: "Lateral de columna lumbar", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_LUMBAR, dfri: DFRI, respiracion: ESPIRACION_FINAL, parrilla: "Sí", colimacion: "Campo largo y estrecho hasta la región de la columna L" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, a unos 4 cm por encima de la cresta ilíaca (L3), o en la cresta ilíaca (L4) si se usa un RI de 35 × 43 cm." },
      posicion: [
        "En decúbito lateral verdadero, con caderas y rodillas flexionadas y el plano medioaxilar alineado y centrado en la línea central.",
        "Poner apoyo bajo la cintura cuando haga falta para que toda la columna quede paralela al tablero, y otro entre las rodillas.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cuerpos vertebrales de L1 a L4, articulaciones intervertebrales, agujeros y apófisis espinosas."]],
        ["Posicionamiento", ["Columna paralela al RI; espacios articulares intervertebrales y agujeros abiertos; sin rotación."]],
        ["Criterios técnicos", [TEC_BASE, "Bordes de partes blandas y detalle óseo nítidos en cuerpos vertebrales, espacios articulares y apófisis espinosas."]],
      ],
      notas: [
        "Colocar la parte baja de la columna lumbar del lado del cátodo y una protección plomada detrás del paciente.",
        "En pacientes de pelvis ancha y tórax estrecho puede hacer falta angular el RC 3-5° caudal, aun con apoyo bajo la cintura.",
        "Si hay escoliosis, colocar al paciente con la convexidad hacia abajo.",
      ],
      fuente: { paginas: [194, 196] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-lumbar-lateral-l5-s1", region: "columna-lumbar", nombre: "Lateral de L5-S1", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "18 × 24 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada hasta el área de interés" },
      rc: { direccion: "variable", angulo: "5-8° caudal", texto: "Perpendicular al RI si toda la columna está paralela a la mesa; si no, 5-8° caudal (más habitual en mujeres), de modo que el RC quede paralelo al plano interilíaco. Centrado 3 cm por debajo de la cresta ilíaca y 5 cm por detrás de la EIAS." },
      posicion: [
        "En decúbito lateral verdadero, con caderas y rodillas flexionadas y el plano medioaxilar alineado con la línea media de la mesa o del RI y con el RC.",
        "Apoyo bajo la cintura cuando haga falta para que la columna quede paralela al tablero, y otro entre las rodillas.",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cuerpos vertebrales de L5 a S1, espacios articulares intervertebrales y agujeros intervertebrales abiertos."]],
        ["Posicionamiento", ["Espacios articulares intervertebrales y agujeros abiertos; sin rotación."]],
        ["Criterios técnicos", [TEC_BASE, "Bordes de partes blandas y detalle óseo nítidos."]],
      ],
      notas: ["Protector de plomo detrás del paciente."],
      fuente: { paginas: [195, 196] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-lumbar-oblicua", region: "columna-lumbar", nombre: "Oblicuas de columna lumbar (posteriores o anteriores)", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: "30 × 35 cm, vertical, o 24 × 30 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta el área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al cuerpo de L3, a la altura del borde costal inferior (2,5-5 cm por encima de la cresta ilíaca) y 5 cm medial a la EIAS que queda arriba." },
      posicion: [
        "Para las oblicuas posteriores o anteriores derecha e izquierda, girar el cuerpo 45°; en las posteriores, usar bloques triangulares bajo la pelvis y los hombros para sostener la posición.",
        "Columna alineada y centrada con el RC y la línea media de la mesa o del RI.",
        "Se hacen las dos oblicuas (derecha e izquierda) en dos RI para comparar.",
      ],
      criterios: [
        ["Estructuras que se ven", ["OPI/OPD: articulaciones cigoapofisarias de L1 a L4 del lado de abajo; se ven los elementos del «perrito escocés».", "OAI/OAD: articulaciones cigoapofisarias de L1 a L4 del lado de arriba; se ven los elementos del «perrito escocés»."]],
        ["Posicionamiento", ["Articulaciones cigoapofisarias y pedículo («ojo» del perrito escocés) centrados en el cuerpo vertebral."]],
        ["Criterios técnicos", [TEC_BASE, "Bordes de partes blandas y detalle óseo nítidos en cuerpos vertebrales, espacios articulares y elementos del perrito escocés."]],
      ],
      notas: ["Para las articulaciones cigoapofisarias de L1-L2 es mejor una oblicua a 50°, y a 30° para L5-S1."],
      fuente: { paginas: [197, 198] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-lumbar-ap-flexion-lateral", region: "columna-lumbar", nombre: "AP de columna lumbar con flexión lateral derecha e izquierda", categoria: ["AP"], tipo: "E",
      factores: { ri: "35 × 43 cm, vertical, o 35 × 90 cm, vertical", dfri: "100-150 cm", respiracion: ESPIRACION_FINAL, parrilla: "Sí", colimacion: "Incluir la zona de interés de la columna" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI (centrar más arriba si interesa la columna torácica)." },
      posicion: [
        "En decúbito supino o de pie, con la columna centrada en el RC y en la línea media de la mesa o del RI.",
        "Hacer la máxima flexión lateral posible, primero a la derecha y después a la izquierda, sin inclinar la pelvis (la pelvis queda fija y actúa como fulcro).",
        "Controlar que no roten la pelvis ni el torso.",
        "Borde inferior del RI 2,5-5 cm por debajo de la cresta ilíaca.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [
        "Se puede hacer una PA de pie para bajar la dosis en las zonas radiosensibles.",
        "Filtros de compensación para que la densidad de la columna sea más pareja.",
      ],
      fuente: { paginas: [200] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-lumbar-lateral-flexion-extension", region: "columna-lumbar", nombre: "Lateral de columna lumbar en hiperflexión e hiperextensión", categoria: ["Perfil"], tipo: "E",
      factores: { ri: RI_35x43, dfri: DFRI, respiracion: ESPIRACION_FINAL, parrilla: "Sí", colimacion: "A los cuatro lados, hasta cerca de los bordes del RI" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI (o al sitio de la artrodesis, si se conoce)." },
      posicion: [
        "En decúbito o de pie, con la columna centrada en la mesa.",
        "Apoyo bajo la cintura para que la columna quede paralela al tablero.",
        "Primer RI: máxima flexión hacia adelante; segundo RI: máxima extensión hacia atrás, manteniendo la lateral verdadera.",
        "Borde inferior del RI 2,5-5 cm por debajo de la cresta ilíaca.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Hiperflexión e hiperextensión: vértebras torácicas y lumbares, incluyendo unos 3-5 cm de las crestas ilíacas; lateral de las vértebras lumbares."]],
        ["Posicionamiento", ["Hiperflexión: lateral verdadera sin rotación; espacios entre las apófisis espinosas abiertos.", "Hiperextensión: lateral verdadera sin rotación; espacios entre las apófisis espinosas cerrados."]],
        ["Criterios técnicos", [TEC_BASE, "Detalle óseo nítido en cuerpos vertebrales, apófisis espinosas y espacios articulares intervertebrales."]],
      ],
      notas: ["Protector de plomo detrás del paciente."],
      fuente: { paginas: [201, 202] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Escoliosis ─────────
    {
      id: "columna-escoliosis-pa-ferguson", region: "columna-escoliosis", nombre: "PA: serie de escoliosis", metodo: "Ferguson", categoria: ["PA", "Métodos especiales"], tipo: "E",
      factores: { ri: "35 × 43 cm, vertical, o 35 × 90 cm", dfri: "100-150 cm; se recomienda la DFRI mayor", respiracion: "Exponer en espiración completa", parrilla: "Sí", colimacion: "Larga y estrecha, hasta la región de la columna vertebral" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Primer RI: de pie o sentado, con la columna alineada y centrada en la línea media de la mesa o del RI, brazos a los costados, sin rotación de la pelvis ni del tórax. Borde inferior del RI 2,5-5 cm por debajo de la cresta ilíaca.",
        "Segundo RI: poner un alza de 8-10 cm bajo el pie (o bajo las nalgas si está sentado) del lado convexo de la curva; así se distinguen las curvas primarias deformantes de las compensadoras.",
        "Usar protección gonadal y mamaria.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [
        "La PA baja mucho la dosis en las zonas sensibles y se recomienda en lugar de la AP.",
        "Una serie de escoliosis suele incluir dos imágenes PA (o AP) para comparar: una de pie y otra en decúbito.",
        "Filtros de compensación para que la densidad de la columna sea más pareja.",
      ],
      fuente: { paginas: [199] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Sacro y cóccix ─────────
    {
      id: "columna-sacro-ap-axial", region: "columna-sacro-coccix", nombre: "AP axial de sacro", categoria: ["AP", "Axiales"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área del sacro" },
      rc: { direccion: "cefálico", angulo: "15°", texto: "Angulado 15° cefálico, dirigido a unos 5 cm por encima de la sínfisis del pubis." },
      posicion: [
        "En decúbito supino, centrado en el RC y en la línea media de la mesa o del RI.",
        "Sin rotación de la pelvis: las dos EIAS a la misma distancia de la mesa.",
        "Centrar el RI en el RC proyectado. Proteger los tejidos radiosensibles y las gónadas en los hombres.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Imagen del sacro sin acortamiento."]],
        ["Posicionamiento", ["Sacro sin superposición; se ven los agujeros sacros."]],
        ["Criterios técnicos", [TEC_BASE, "Partes blandas y detalle óseo nítidos."]],
      ],
      fuente: { paginas: [203, 205] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-coccix-ap-axial", region: "columna-sacro-coccix", nombre: "AP axial de cóccix", categoria: ["AP", "Axiales"], tipo: "R",
      factores: { ri: "18 × 24 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada hasta el área del cóccix" },
      rc: { direccion: "caudal", angulo: "10°", texto: "Angulado 10° caudal, centrado 5 cm por encima de la sínfisis del pubis." },
      posicion: [
        "En decúbito supino, con apoyo bajo las rodillas. Proteger los tejidos radiosensibles y las gónadas en los hombres.",
        "Plano mediosagital alineado y centrado en la línea media de la mesa o del RI, sin rotación.",
        "Centrar el RI a la altura del RC proyectado.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Imagen del cóccix sin acortamiento."]],
        ["Posicionamiento", ["Cóccix sin superposición y sin rotación."]],
        ["Criterios técnicos", [TEC_BASE, "Partes blandas y detalle óseo nítidos."]],
      ],
      notas: [
        "Si el paciente no tolera apoyar el cóccix en decúbito supino, se puede hacer una PA con 10° cefálico.",
        "Vaciar la vejiga antes del estudio.",
        "Usar el CAE con prudencia.",
      ],
      fuente: { paginas: [204, 205] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-sacro-coccix-lateral", region: "columna-sacro-coccix", nombre: "Lateral de sacro y cóccix", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área del sacro" },
      rc: { direccion: "perpendicular", texto: "Para el sacro: perpendicular, dirigido 8-10 cm por detrás de la EIAS que queda arriba." },
      posicion: [
        "En decúbito lateral, con caderas y rodillas flexionadas, en lateral verdadera.",
        "Centrar el sacro en el RC y en la línea media de la mesa o del RI (alinear paciente y RI con el RC bien centrado).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Lateral del sacro y el cóccix.", "Lateral de la articulación intervertebral L5-S1."]],
        ["Posicionamiento", ["Sin rotación: escotaduras ciáticas mayores y cabezas femorales superpuestas.", "Entran el sacro y el cóccix completos."]],
        ["Criterios técnicos", [TEC_BASE, "Trabeculación nítida."]],
      ],
      notas: [
        "La lateral de sacro y la de cóccix pueden hacerse en una sola toma si se estudian ambos (baja la dosis).",
        "Protector de plomo detrás del paciente.",
        "Si se quiere incluir el cóccix, se recomienda un filtro de compensación tipo bumerán.",
      ],
      fuente: { paginas: [206, 208] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-coccix-lateral", region: "columna-sacro-coccix", nombre: "Lateral de cóccix", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "18 × 24 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta el área del sacro distal y el cóccix" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, 5 cm distal al nivel de la EIAS y 8-10 cm por detrás." },
      posicion: [
        "En decúbito lateral, con caderas y rodillas flexionadas 90°, en lateral verdadera.",
        "Centrar el cóccix en el RC y en la línea media de la mesa o del RI (el cóccix es superficial, entre las nalgas, apenas por encima del trocánter mayor).",
        "Centrar el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Lateral del sacro y el cóccix.", "Lateral de la articulación intervertebral L5-S1."]],
        ["Posicionamiento", ["Sin rotación: escotaduras ciáticas mayores y cabezas femorales superpuestas.", "Entran el sacro y el cóccix completos."]],
        ["Criterios técnicos", [TEC_BASE, "Trabeculación nítida."]],
      ],
      notas: [
        "La lateral de sacro y la de cóccix pueden hacerse en una sola toma si se estudian ambos (baja la dosis).",
        "Protector de plomo detrás del paciente.",
        "Usar el CAE con prudencia.",
      ],
      fuente: { paginas: [207, 208] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Articulaciones sacroilíacas ─────────
    {
      id: "columna-sacroiliacas-ap-axial", region: "columna-sacroiliacas", nombre: "AP axial de articulaciones sacroilíacas", categoria: ["AP", "Axiales"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área de interés" },
      rc: { direccion: "cefálico", angulo: "30° (hombres) y 35° (mujeres)", texto: "Angulado 30° (hombres) o 35° (mujeres) cefálico, entrando unos 5 cm por debajo del nivel de las EIAS." },
      posicion: [
        "En decúbito supino, centrado en la línea media de la mesa o del RI.",
        "Sin rotación de la pelvis: EIAS a la misma distancia del tablero.",
        "Centrar el RI en el RC proyectado. Proteger los tejidos radiosensibles y las gónadas en los hombres.",
      ],
      criterios: SIN_CRITERIOS,
      fuente: { paginas: [209] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "columna-sacroiliacas-oblicua-posterior", region: "columna-sacroiliacas", nombre: "Oblicua posterior de articulaciones sacroilíacas", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, 2,5 cm medial a la EIAS que queda arriba." },
      posicion: [
        "Oblicua posterior de 25-30°, con el lado a estudiar levantado (usar un apoyo para sostener la posición).",
        "Alinear la articulación SI elevada con el RC y la línea media de la mesa o del RI (2,5 cm medial a la EIAS de arriba).",
        "Centrar el RI en el RC. Proteger los tejidos radiosensibles y las gónadas en los hombres.",
        "Se hace de los dos lados para comparar.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Articulación SI del lado de arriba (la más alejada del RI) abierta."]],
        ["Posicionamiento", ["OPI: articulación SI derecha abierta, sin superposición del ala ilíaca y el sacro.", "OPD: articulación SI izquierda abierta, sin superposición del ala ilíaca y el sacro."]],
        ["Criterios técnicos", [TEC_BASE, "Bordes óseos y trabeculación nítidos."]],
      ],
      notas: ["Se puede angular el RC 15-20° cefálico para ver mejor la parte distal de la articulación."],
      fuente: { paginas: [210, 211] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
