// Capítulo 9 · Abdomen y exploraciones frecuentes con medios de contraste (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 269-310).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// respiracion: null cuando el manual no la indica para esa proyección.
// Generalidades del capítulo (págs. 271-273): proteger los tejidos radiosensibles fuera de la zona de interés;
// protección gonadal en todos los hombres en edad fértil (borde superior en la sínfisis del pubis) y en mujeres
// solo si no tapa anatomía esencial; no exponer la pelvis durante la gestación sin indicación expresa del médico.
// Serie de abdomen agudo: en tres fases (AP en decúbito supino, AP en bipedestación y PA de tórax) o en dos fases
// (AP en decúbito supino y decúbito lateral izquierdo).
// En el índice del capítulo solo las proyecciones de abdomen llevan la marca (R)/(E); en los estudios con contraste
// no hay marca y se cargan como "R" con una entrada de revisión.

const DFRI = "100 cm";
const RI_35x43_V = "35 × 43 cm, vertical";
const RI_ESTOMAGO = "30 × 35 cm o 24 × 30 cm, vertical";
const ESPIRACION = "Exponer al final de la espiración";
const ESPIRACION_COMPLETA = "Exponer al final de una espiración completa";
const COLIM_RI = "Hasta los bordes externos del RI o hasta el área de interés";
const COLIM_ESOF = "Hasta el área de interés (≈12-15 cm de ancho)";
const RESP_ESOF = "Con bario fluido, exponer durante la deglución (después de 3 o 4 sorbos). Con bario espeso, exponer enseguida después de tragar; en general el paciente no respira justo después de la deglución";
const SIN_CRIT = []; // el manual no trae página de criterios: se deja vacío para completar después
const TEC_ESTOMAGO = ["Densidad (brillo) y contraste óptimos para ver los pliegues gástricos sin sobreexponer otras estructuras.", "Bordes estructurales nítidos, sin movimiento."];
const TEC_EO = ["Técnica (brillo) adecuada para ver la mucosa sin sobreexponer otras estructuras.", "Bordes estructurales nítidos, sin movimiento."];

export default {
  capitulo: 9,
  titulo: "Abdomen y exploraciones frecuentes con medios de contraste",
  paginas: "269-310",
  regiones: [
    { id: "abdomen", nombre: "Abdomen", detalle: "Adulto" },
    { id: "abdomen-pediatrico", nombre: "Abdomen pediátrico", detalle: "" },
    { id: "esofagograma", nombre: "Esofagograma", detalle: "Esófago con bario" },
    { id: "estomago", nombre: "Tracto digestivo superior", detalle: "Estómago (SEGD)" },
    { id: "intestino-delgado", nombre: "Intestino delgado", detalle: "Tránsito intestinal" },
    { id: "enema-opaco", nombre: "Enema opaco", detalle: "Colon (intestino grueso)" },
    { id: "urografia", nombre: "Urografía intravenosa", detalle: "UIV" },
    { id: "cistografia", nombre: "Cistografía", detalle: "Vejiga" },
  ],
  proyecciones: [
    // ───────── Abdomen (adulto) ─────────
    {
      id: "abdomen-ap-supino", region: "abdomen", nombre: "AP de abdomen en decúbito supino (RUV)", categoria: ["AP"], tipo: "R",
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: "Hasta los bordes superior e inferior de las partes blandas del abdomen" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, a la altura de las crestas ilíacas." },
      posicion: [
        "Decúbito supino, piernas extendidas y brazos a los costados.",
        "Plano mediosagital alineado y centrado con la línea media de la mesa y/o del RI.",
        "Sin rotación: las EIAS a la misma distancia del tablero.",
        "RI centrado a la altura de las crestas ilíacas, cuidando que el borde superior de la sínfisis del pubis entre en el borde inferior del RI.",
        "En un paciente hiperesténico grande puede hacer falta poner el RI en horizontal y sumar un segundo RI centrado más arriba.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Contorno del hígado, el bazo, los músculos psoas y los riñones, hasta la sínfisis del pubis en el abdomen inferior."]],
        ["Posicionamiento", ["Sin rotación: alas ilíacas simétricas y bordes externos de las costillas inferiores simétricos."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver los psoas y las apófisis transversas lumbares.", "Bordes del hígado y los riñones visibles en pacientes de tamaño medio, sin movimiento."]],
      ],
      fuente: { paginas: [274, 276] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-ap-bipedestacion", region: "abdomen", nombre: "AP de abdomen en bipedestación", categoria: ["AP"], tipo: "E",
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: "Hasta los bordes de las partes blandas del abdomen y el diafragma" },
      rc: { direccion: "horizontal", texto: "Horizontal, al centro del RI (5 cm por encima de la cresta ilíaca)." },
      posicion: [
        "El paciente tiene que estar de pie como mínimo 5 minutos antes de la exposición; mejor 10-20 minutos.",
        "De pie, espalda apoyada en el tablero o Bucky mural, brazos a los costados.",
        "Plano mediosagital alineado y centrado con la línea media, sin rotación.",
        "Centro del RI unos 5 cm por encima de la cresta ilíaca, para incluir el diafragma (en pacientes esténicos, el borde superior del RI queda a la altura de la axila).",
        "Usar marcador de posición en bipedestación.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Los hemidiafragmas y buena parte del abdomen inferior."]],
        ["Posicionamiento", ["Sin rotación: alas ilíacas simétricas y bordes externos de las costillas inferiores simétricos."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver los psoas y las apófisis transversas lumbares.", "Se ven niveles hidroaéreos si los hay.", "Bordes del hígado y los riñones visibles en pacientes de tamaño medio, sin movimiento."]],
      ],
      fuente: { paginas: [275, 276] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-decubito-lateral", region: "abdomen", nombre: "Decúbito lateral (AP) de abdomen", categoria: ["AP", "Decúbitos"], tipo: "E",
      factores: { ri: "35 × 43 cm, horizontal", dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: "Hasta los bordes de las partes blandas del abdomen y el diafragma" },
      rc: { direccion: "horizontal", texto: "Horizontal, al centro del RI (unos 5 cm por encima de la cresta ilíaca)." },
      posicion: [
        "El paciente tiene que estar en decúbito lateral como mínimo 5 minutos antes de la exposición; mejor 10-20 minutos.",
        "Trabar las ruedas de la camilla.",
        "Decúbito lateral sobre un tablero de decúbito o un apoyo que eleve la parte inferior del abdomen; rodillas algo flexionadas y brazos hacia arriba, cerca de la cabeza.",
        "Acomodar paciente y camilla para que el centro del RI y del tablero mural (y el RC) quede unos 5 cm por encima de la cresta ilíaca, para incluir el diafragma.",
        "Ajustar la altura del RI para que entre el borde superior del abdomen y se pueda detectar aire libre.",
        "Usar marcador de decúbito y una flecha que indique el lado de arriba.",
      ],
      criterios: [
        ["Estructuras que se ven", ["El abdomen, con el estómago y el intestino con aire, y el lado superior del diafragma."]],
        ["Posicionamiento", ["Sin rotación: alas ilíacas simétricas y columna recta."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver tejidos blandos y columna lumbar.", "Se ven las partes blandas y el aire intraperitoneal que haya, en pacientes de tamaño medio, sin movimiento."]],
      ],
      notas: ["La figura muestra un decúbito lateral izquierdo (AP)."],
      fuente: { paginas: [277, 279] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-decubito-dorsal", region: "abdomen", nombre: "Decúbito dorsal (lateral) de abdomen", categoria: ["Perfil", "Decúbitos"], tipo: "E",
      factores: { ri: "35 × 43 cm, horizontal", dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: "Hasta los bordes superior e inferior de las partes blandas del abdomen" },
      rc: { direccion: "horizontal", texto: "Horizontal, al centro del RI." },
      posicion: [
        "Decúbito supino sobre un tablero de decúbito o un apoyo que eleve la parte posterior del abdomen, con el costado contra la mesa o camilla y los brazos por encima de la cabeza.",
        "Fijar la camilla (trabar las ruedas).",
        "Centro del RI y del tablero mural (y el RC) a la altura de la cresta ilíaca (5 cm por encima de la cresta, para incluir el diafragma).",
        "Ajustar la altura del RI para que el plano mediocoronal coincida con su línea central.",
        "Incluir marcador de decúbito.",
      ],
      criterios: [
        ["Estructuras que se ven", ["El abdomen, incluyendo los dos hemidiafragmas."]],
        ["Posicionamiento", ["Sin rotación: alas ilíacas y diafragma simétricos.", "Se ven los espacios de las articulaciones intervertebrales y los cuerpos vertebrales."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver tejidos blandos y columna lumbar.", "Se ven las partes blandas y el aire intraperitoneal que haya, en pacientes de tamaño medio, sin movimiento."]],
      ],
      revision: ["Centrado: el manual dice que el centro del RI va \"al nivel de la cresta ilíaca\" y entre paréntesis \"5 cm por encima de la cresta ilíaca\". Las dos indicaciones no coinciden; hay que confirmar cuál vale."],
      fuente: { paginas: [278, 279] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Abdomen pediátrico ─────────
    {
      id: "abdomen-ped-ap-supino", region: "abdomen-pediatrico", nombre: "AP de abdomen pediátrico en decúbito supino (RUV)", categoria: ["AP"], tipo: "R",
      factores: { ri: "18 × 24 cm, 24 × 30 cm o 30 × 35 cm, vertical (según el tamaño del paciente)", dfri: DFRI, respiracion: "Exponer en espiración o cuando el abdomen se mueva menos. Si el paciente llora, exponer en espiración completa", parrilla: "Pantalla si el grosor es menor de 10 cm; parrilla si es mayor de 10 cm", colimacion: "A los cuatro lados, hasta los bordes del abdomen" },
      rc: { direccion: "perpendicular", texto: "Desde recién nacidos hasta 1 año: 2,5 cm por encima de la cresta ilíaca. Niños mayores: a la altura del ombligo." },
      posicion: [
        "Lactante en decúbito supino, con los brazos inmovilizados por encima de la cabeza (venda elástica, cinta adhesiva o bolsas de arena).",
        "Piernas inmovilizadas con venda elástica o cinta y bolsas de arena.",
        "RI centrado con el RC.",
        "Proteger las gónadas si se puede.",
        "Ayuda de los padres solo si hace falta: con delantal y guantes plomados, uno sostiene los brazos por encima de la cabeza con una mano y las piernas con la otra, sin dejar que el niño rote.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Partes blandas y estructuras con gas."]],
        ["Posicionamiento", ["Si se puede, incluir desde el diafragma hasta la sínfisis del pubis."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver tejidos blandos y estructuras óseas, sin movimiento."]],
      ],
      fuente: { paginas: [280, 282] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-ped-ap-bipedestacion", region: "abdomen-pediatrico", nombre: "AP de abdomen pediátrico en bipedestación", metodo: "Pigg-O-Stat", categoria: ["AP"], tipo: "E",
      factores: { ri: "18 × 24 cm, 24 × 30 cm o 30 × 35 cm, vertical (según el tamaño del paciente)", dfri: DFRI, respiracion: "Exponer en espiración o cuando haya menos movimiento", parrilla: "Pantalla si el grosor es menor de 10 cm; parrilla si es mayor de 10 cm", colimacion: "A los cuatro lados, hasta los bordes del abdomen" },
      rc: { direccion: "perpendicular", texto: "Desde recién nacidos hasta 1 año: 2,5 cm por encima del ombligo. Niños mayores: ≈2,5-5 cm por encima de la cresta ilíaca, según la altura del niño." },
      posicion: [
        "Paciente sentado, con las piernas pasadas por las aberturas del dispositivo (la figura muestra un Pigg-O-Stat).",
        "Brazos por encima de la cabeza, con las piezas laterales del dispositivo bien ajustadas al cuerpo.",
        "Protección plomada a la altura de la sínfisis del pubis; RI centrado con el RC.",
        "Si hace falta, uno de los padres (con delantal y guantes plomados) sostiene los brazos con una mano y las piernas con la otra para que no rote la pelvis o el tórax.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Partes blandas y estructuras con gas; niveles hidroaéreos en bipedestación."]],
        ["Posicionamiento", ["Si se puede, incluir desde el diafragma hasta la sínfisis del pubis."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver tejidos blandos y estructuras óseas, sin movimiento."]],
      ],
      fuente: { paginas: [281, 282] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Esofagograma ─────────
    {
      id: "esofagograma-oad", region: "esofagograma", nombre: "Esofagograma: OAD", categoria: ["Oblicuas"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: RESP_ESOF, parrilla: "Sí", colimacion: COLIM_ESOF },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al centro del RI (≈5-8 cm distal a la escotadura yugular, a la altura de T6)." },
      posicion: [
        "En decúbito o de pie; se prefiere el decúbito porque el esófago se llena más completo.",
        "Rotar 35-40° desde el decúbito prono hacia el lado derecho, con el brazo derecho abajo y el izquierdo arriba; el paciente sostiene el vaso con la mano izquierda y la pajita en la boca.",
        "Tórax centrado en la línea central.",
        "Borde superior del RI ≈5 cm por encima del hombro.",
      ],
      criterios: [
        ["Estructuras que se ven", ["El esófago entre la columna vertebral y el corazón."]],
        ["Posicionamiento", ["Todo el esófago tapizado por el contraste y sin superponerse a la columna."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver los bordes del esófago lleno de contraste.", "Bordes estructurales nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [283, 285] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esofagograma-lateral", region: "esofagograma", nombre: "Esofagograma: lateral", categoria: ["Perfil"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: "100 cm o 180 cm si se hace en bipedestación", respiracion: RESP_ESOF, parrilla: "Sí", colimacion: COLIM_ESOF },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al centro del RI (≈5-8 cm distal a la escotadura yugular, a la altura de T6)." },
      posicion: [
        "En decúbito o de pie; se prefiere el decúbito.",
        "Lateral derecha en decúbito, con el brazo y el hombro derechos hacia arriba y adelante (sosteniendo el vaso).",
        "Plano mediocoronal centrado en la línea central.",
        "Borde superior del RI ≈5 cm por encima de la parte alta del hombro.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el esófago entre la columna torácica y el corazón."]],
        ["Posicionamiento", ["Sin rotación: costillas posteriores superpuestas.", "Todo el esófago tapizado por el contraste."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver los bordes del esófago lleno de contraste.", "Bordes estructurales nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [284, 285] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esofagograma-ap-pa", region: "esofagograma", nombre: "Esofagograma: AP (PA)", categoria: ["AP", "PA"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: "100 cm o 180 cm si se hace en bipedestación", respiracion: "Con bario fluido, exponer durante la deglución (después de 3 o 4 sorbos). Con bario espeso, exponer enseguida después de tragar", parrilla: "Sí", colimacion: COLIM_ESOF },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al centro del RI (≈8 cm por debajo de la escotadura yugular, en T6)." },
      posicion: [
        "En decúbito supino o de pie; se prefiere el decúbito supino (de pie se puede obtener una PA).",
        "Paciente centrado en la línea media de la mesa.",
        "Borde superior del RI ≈5 cm por encima de la parte alta del hombro.",
        "Brazo izquierdo al costado; sostiene el vaso con la mano derecha y la pajita en la boca.",
      ],
      criterios: SIN_CRIT,
      fuente: { paginas: [286] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Tracto digestivo superior (estómago) ─────────
    {
      id: "estomago-pa", region: "estomago", nombre: "Tracto digestivo superior (estómago): PA", categoria: ["PA"], tipo: null,
      factores: { ri: "35 × 43 cm, 30 × 35 cm o 24 × 30 cm, vertical", dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular. Esténico: ≈2,5-5 cm por encima del reborde costal inferior (nivel de L1) y ≈2,5 cm a la izquierda de la columna. Hiperesténico: 5 cm por encima de L1 y más cerca de la línea media. Asténico: ≈5 cm por debajo del nivel de T1 [sic] y más cerca de la línea media." },
      posicion: [
        "Decúbito prono, con los brazos arriba junto a la cabeza.",
        "Paciente y RI alineados y centrados con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el estómago y el duodeno."]],
        ["Posicionamiento", ["Cuerpo y píloro llenos de bario y centrados."]],
        ["Criterios técnicos", TEC_ESTOMAGO],
      ],
      revision: ["Centrado del asténico: el manual dice \"por abajo del nivel de T1\". En el resto de las proyecciones de estómago la referencia es L1, por lo que podría ser una errata; hay que confirmarlo."],
      fuente: { paginas: [287, 289] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-oad", region: "estomago", nombre: "Tracto digestivo superior (estómago): OAD", categoria: ["Oblicuas"], tipo: null,
      factores: { ri: RI_ESTOMAGO, dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI. Esténico: ≈2,5-5 cm por encima de las costillas inferiores, a mitad de camino entre la columna y el borde abdominal lateral izquierdo (que queda arriba), con oblicuidad de 45-55°. Hiperesténico: 5 cm por encima de L1, más cerca de la línea media, oblicuidad ≈70°. Asténico: ≈5 cm por debajo de L1, oblicuidad ≈40°." },
      posicion: [
        "Semiprono, rotado 40-70° desde el decúbito prono, con el lado anterior derecho apoyado en la mesa.",
        "Brazo derecho abajo y brazo izquierdo arriba; flexionar un poco la cadera y la rodilla izquierdas.",
        "Paciente alineado y centrado con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el estómago y el asa en C del duodeno."]],
        ["Posicionamiento", ["Píloro y bulbo duodenal de perfil y llenos de bario."]],
        ["Criterios técnicos", TEC_ESTOMAGO],
      ],
      fuente: { paginas: [288, 289] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-lateral-derecha", region: "estomago", nombre: "Tracto digestivo superior (estómago): lateral derecha", categoria: ["Perfil"], tipo: null,
      factores: { ri: RI_ESTOMAGO, dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI. Esténico: en el reborde costal a la altura de L1 y 2,5-4 cm por delante del plano mediocoronal (a mitad de camino entre el borde anterior de las vértebras y la cara anterior del abdomen). Hiperesténico: ≈5 cm por encima de L1. Asténico: ≈5 cm por debajo de L1." },
      posicion: [
        "Paciente acostado sobre el costado derecho, brazos arriba, caderas y rodillas algo flexionadas.",
        "Paciente y RI alineados y centrados con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el estómago, el duodeno y el espacio retrogástrico."]],
        ["Posicionamiento", ["Píloro y asa en C del duodeno visibles.", "Sin rotación: cuerpos vertebrales alineados."]],
        ["Criterios técnicos", TEC_ESTOMAGO],
      ],
      fuente: { paginas: [290, 292] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-ap", region: "estomago", nombre: "Tracto digestivo superior (estómago): AP", categoria: ["AP"], tipo: null,
      factores: { ri: "30 × 35 cm o 35 × 43 cm, vertical", dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, 2,5-5 cm a la izquierda del PMS. Esténico: a la altura de L1 (a mitad de camino entre la apófisis xifoides y el nivel de las costillas laterales inferiores). Hiperesténico: ≈5 cm por encima de L1. Asténico: ≈5 cm por debajo de L1 y más cerca de la línea media." },
      posicion: [
        "Decúbito supino, brazos a los costados.",
        "Paciente y RI alineados y centrados con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el estómago y el asa en C del duodeno; se incluye el diafragma para descartar hernia de hiato."]],
        ["Posicionamiento", ["Fundus lleno de bario y centrado."]],
        ["Criterios técnicos", TEC_ESTOMAGO],
      ],
      notas: ["La figura muestra la AP en decúbito supino en posición de Trendelenburg, que permite ver mejor la hernia de hiato."],
      fuente: { paginas: [291, 292] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-opi", region: "estomago", nombre: "Tracto digestivo superior (estómago): OPI", categoria: ["Oblicuas"], tipo: null,
      factores: { ri: RI_ESTOMAGO, dfri: DFRI, respiracion: ESPIRACION, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la mitad izquierda del abdomen. Esténico: en L1 (a mitad de camino entre la apófisis xifoides y el nivel de las costillas laterales inferiores), oblicuidad 45°. Hiperesténico: 5 cm por encima de L1, oblicuidad 60°. Asténico: ≈5 cm por debajo de L1 y más cerca de la línea media, oblicuidad 30°." },
      posicion: [
        "Semisupino, oblicuo 30-60° con el lado izquierdo abajo y la rodilla derecha algo flexionada (más rotación en hiperesténicos).",
        "Paciente y RI centrados con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el estómago y el duodeno, con el bulbo duodenal sin superposiciones."]],
        ["Posicionamiento", ["Fundus lleno de bario; en el doble contraste, bulbo duodenal lleno de gas.", "Bulbo duodenal de perfil."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver los pliegues gástricos sin sobreexponer otras estructuras.", "Bordes estructurales y órganos gástricos nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [293, 294] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Intestino delgado ─────────
    {
      id: "intestino-delgado-pa", region: "intestino-delgado", nombre: "Intestino delgado: PA", categoria: ["PA"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: ESPIRACION_COMPLETA, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, al centro del RI: ≈5 cm por encima de la cresta ilíaca en las primeras exposiciones (15 o 30 minutos) y en la cresta ilíaca en las siguientes." },
      posicion: [
        "Se prefiere el decúbito prono (si hace falta, se puede hacer AP en decúbito supino).",
        "PMS alineado con la línea media de la mesa, sin rotación.",
        "Paciente y RI centrados en la cresta ilíaca (más arriba en las primeras exposiciones).",
        "Los indicadores de tiempo tienen que verse en la imagen.",
      ],
      criterios: SIN_CRIT,
      notas: [
        "El protocolo de rutina toma imágenes cada 15 o 30 minutos hasta que el bario llega a la válvula ileocecal.",
        "La serie de imágenes y los factores técnicos son parecidos en la enteroclisis y el sondaje.",
      ],
      fuente: { paginas: [295] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Enema opaco ─────────
    {
      id: "enema-opaco-pa-ap", region: "enema-opaco", nombre: "Enema opaco: PA (AP)", categoria: ["PA", "AP"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: "Exponer en espiración completa", parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, al centro del RI, a la altura de la cresta ilíaca." },
      posicion: [
        "Decúbito prono (PA) o supino (AP).",
        "Paciente alineado y centrado en la línea central, sin rotación.",
        "RI centrado a la altura de la cresta ilíaca.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el intestino grueso, incluyendo la flexura cólica izquierda y el recto."]],
        ["Posicionamiento", ["Colon transverso lleno sobre todo de bario en la PA y de gas en la AP.", "Sin rotación: alas ilíacas y vértebras lumbares simétricas."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos para ver la mucosa sin sobreexponer otras estructuras.", "Bordes estructurales nítidos, sin movimiento."]],
      ],
      notas: ["En pacientes grandes o hiperesténicos puede hacer falta usar dos RI en horizontal para incluir todo el intestino grueso: uno centrado en el abdomen inferior y otro en el superior."],
      fuente: { paginas: [296, 297] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "enema-opaco-oblicuas", region: "enema-opaco", nombre: "Enema opaco: OAD y OAI (OPD y OPI)", categoria: ["Oblicuas"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: "Exponer en espiración", parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al centro del RI: 2,5-5 cm por encima de la cresta ilíaca y 2,5 cm a la izquierda del PMS." },
      posicion: [
        "Semiprono (PA) o semisupino (AP), rotado 35-45°.",
        "Abdomen alineado y centrado en la línea media de la mesa.",
        "RI centrado a la altura de la cresta ilíaca, incluyendo la zona rectal.",
      ],
      criterios: [
        ["Estructuras que se ven", ["OPI/OAD: flexura cólica derecha, colon ascendente y colon sigmoide.", "OPD/OAI: flexura cólica izquierda y colon descendente."]],
        ["Posicionamiento", ["OPI/OAD: flexura cólica derecha y colon ascendente de perfil.", "OPD/OAI: flexura cólica izquierda y colon descendente de perfil."]],
        ["Criterios técnicos", TEC_EO],
      ],
      notas: [
        "Habitualmente se hacen las dos oblicuas, derecha e izquierda.",
        "Muchos pacientes necesitan un segundo RI centrado ≈5 cm más arriba para incluir la flexura cólica izquierda; esto pesa más en la OAI y la OPD (seguir el protocolo del servicio).",
      ],
      fuente: { paginas: [298, 299] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "enema-opaco-lateral-recto", region: "enema-opaco", nombre: "Enema opaco: lateral de recto (decúbito prono)", categoria: ["Perfil", "Decúbitos"], tipo: null,
      factores: { ri: RI_ESTOMAGO, dfri: DFRI, respiracion: "Exponer en espiración", parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "variable", texto: "Perpendicular al RI, a la altura de las EIAS, centrado en el plano mediocoronal (a mitad de camino entre las EIAS y la parte posterior del sacro). En la proyección en decúbito prono, el RC es horizontal." },
      posicion: [
        "En decúbito, en lateral verdadera.",
        "Plano medioaxilar centrado en la línea media de la mesa, con rodillas y caderas algo flexionadas.",
        "Paciente y RI centrados con el RC.",
        "Para la lateral en decúbito prono se recomienda un filtro de compensación.",
      ],
      criterios: SIN_CRIT,
      notas: ["En los estudios con doble contraste se suele hacer, como alternativa, la lateral en decúbito prono (con RC horizontal)."],
      fuente: { paginas: [300] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "enema-opaco-decubito-lateral", region: "enema-opaco", nombre: "Enema opaco (doble contraste): decúbito lateral", categoria: ["AP", "Decúbitos"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: "Exponer en espiración completa", parrilla: "Sí (parrilla portátil o Bucky)", colimacion: COLIM_RI },
      rc: { direccion: "horizontal", texto: "Horizontal, al centro del RI (a la altura de la cresta ilíaca, en el plano mediosagital)." },
      posicion: [
        "Decúbito lateral, brazos arriba, rodillas algo flexionadas, espalda apoyada en el chasis con parrilla o en el tablero mural.",
        "PMS alineado y centrado con la línea central del RI (y del RC), sin rotación; si se usa camilla, trabar las ruedas.",
        "RI centrado a la altura de la cresta ilíaca.",
        "Filtro de compensación en el lado superior del abdomen.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el intestino grueso."]],
        ["Posicionamiento", ["Sin rotación: pelvis y costillas simétricas."]],
        ["Criterios técnicos", TEC_EO],
      ],
      notas: ["Habitualmente se hacen los decúbitos laterales derecho e izquierdo como parte de la serie con doble contraste. La figura muestra un decúbito lateral derecho (AP)."],
      fuente: { paginas: [301, 303] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "enema-opaco-ap-pa-axial", region: "enema-opaco", nombre: "Enema opaco: AP (PA) axial", categoria: ["Axiales", "AP", "PA"], tipo: null,
      factores: { ri: "30 × 35 cm, vertical", dfri: DFRI, respiracion: "Exponer en espiración completa", parrilla: "Sí", colimacion: "Hasta el área de interés" },
      rc: { direccion: "variable", angulo: "30-40°", texto: "AP axial: 30-40° cefálico, 5 cm por debajo de las EIAS. PA axial: 30-40° caudal, centrado para que salga a la altura de las EIAS. OPI axial: 5 cm por debajo y 5 cm medial a la EIAS derecha." },
      posicion: [
        "Decúbito supino (AP) o prono (PA), paciente alineado y centrado en la línea media de la mesa.",
        "Alternativa oblicua: OPI u OAD, con el paciente oblicuo 30-40°.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Colon rectosigmoide desplegado."]],
        ["Posicionamiento", ["Menos superposición del recto y el colon sigmoide."]],
        ["Criterios técnicos", TEC_EO],
      ],
      fuente: { paginas: [302, 303] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Urografía intravenosa ─────────
    {
      id: "urografia-ap", region: "urografia", nombre: "Urografía intravenosa (UIV): AP (PA) exploradora y serie", categoria: ["AP", "PA"], tipo: null,
      factores: { ri: "35 × 43 cm, vertical; 30 × 35 cm, horizontal, para nefrotomografía", dfri: DFRI, respiracion: ESPIRACION_COMPLETA, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al centro del RI, a la altura de la cresta ilíaca, o 2,5-5 cm por encima de las crestas en pacientes de torso largo, sumando un segundo RI más chico en transversal para la vejiga, con la sínfisis del pubis en su borde inferior. Nefrograma: RC a mitad de camino entre el apéndice xifoides y la cresta ilíaca." },
      posicion: [
        "Decúbito supino, plano mediosagital alineado y centrado en la línea media de la mesa, con apoyo debajo de las rodillas y sin rotación.",
        "Incluir marcador de minutos cuando corresponda.",
        "Proteger las gónadas en los hombres.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el sistema urinario, desde las sombras renales hasta la sínfisis del pubis."]],
        ["Posicionamiento", ["Sin rotación: alas ilíacas simétricas; se incluyen la sínfisis del pubis y la parte superior de los riñones."]],
        ["Criterios técnicos", ["Técnica (brillo) y contraste adecuados para ver riñones y uréteres sin sobreexponer otras estructuras, sin movimiento.", "Se ven los marcadores de minutos y los de lado."]],
      ],
      notas: ["Las primeras imágenes pueden incluir nefrotomografía."],
      fuente: { paginas: [304, 306] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "urografia-oblicuas", region: "urografia", nombre: "UIV: OPD y OPI", categoria: ["Oblicuas"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: ESPIRACION_COMPLETA, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al centro del RI, a la altura de la cresta ilíaca." },
      posicion: [
        "Semisupino, oblicuo 30° hacia la derecha (o la izquierda); flexionar la rodilla y el codo del lado elevado para apoyarse (con una cuña bajo la espalda si hace falta).",
        "Abdomen alineado y centrado en la línea central.",
        "RI centrado a la altura de la cresta ilíaca.",
        "Incluir marcador de minutos y proteger las gónadas en los hombres.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el sistema urinario, desde las sombras renales hasta la sínfisis del pubis."]],
        ["Posicionamiento", ["El riñón del lado elevado se ve de perfil y el uréter inferior queda alejado de la columna."]],
        ["Criterios técnicos", ["Técnica (brillo) y contraste adecuados para ver riñones y uréteres sin sobreexponer otras estructuras, sin movimiento.", "Se ven los marcadores de minutos y los de lado."]],
      ],
      notas: ["Las oblicuas posteriores derecha e izquierda deben formar parte del protocolo de rutina."],
      fuente: { paginas: [305, 306] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "urografia-ap-posmiccional", region: "urografia", nombre: "UIV: AP en bipedestación (posmiccional)", categoria: ["AP"], tipo: null,
      factores: { ri: RI_35x43_V, dfri: DFRI, respiracion: ESPIRACION_COMPLETA, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al centro del RI (a la altura de las crestas ilíacas o ≈2,5 cm más abajo, para incluir la vejiga)." },
      posicion: [
        "De pie, plano mediosagital alineado y centrado en la línea media de la mesa, sin rotación.",
        "RI centrado en la cresta ilíaca, asegurando que entren la vejiga y la sínfisis del pubis.",
        "Usar marcadores de bipedestación y posmiccional.",
      ],
      criterios: SIN_CRIT,
      fuente: { paginas: [307] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Cistografía ─────────
    {
      id: "cistografia-ap-axial", region: "cistografia", nombre: "Cistograma: AP axial", categoria: ["Axiales"], tipo: null,
      factores: { ri: "30 × 35 cm, vertical", dfri: DFRI, respiracion: ESPIRACION_COMPLETA, parrilla: "Sí", colimacion: COLIM_RI },
      rc: { direccion: "caudal", angulo: "10-15°", texto: "10-15° caudal, centrado ≈5 cm por encima de la sínfisis del pubis en el PMS (proyecta el pubis hacia abajo para ver mejor la vejiga)." },
      posicion: [
        "Decúbito supino, plano mediosagital alineado y centrado en la línea media de la mesa, piernas bien extendidas.",
        "RI centrado con el RC proyectado.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Uréteres distales, vejiga y uretra proximal."]],
        ["Posicionamiento", ["La vejiga no se superpone a los huesos del pubis."]],
        ["Criterios técnicos", ["Técnica (brillo) adecuada para ver la vejiga sin sobreexponer otras estructuras, sin movimiento."]],
      ],
      fuente: { paginas: [308, 310] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cistografia-oblicuas", region: "cistografia", nombre: "Cistograma: oblicuas posteriores (OPD, OPI)", categoria: ["Oblicuas"], tipo: null,
      factores: { ri: "30 × 35 cm, vertical", dfri: DFRI, respiracion: "Exponer en espiración", parrilla: "Sí", colimacion: "Hasta los bordes del RI o hasta el área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, ≈5 cm por encima de la sínfisis del pubis y 5 cm medial a la EIAS elevada." },
      posicion: [
        "Semisupino, oblicuo 45-60° (a 60° se ve mejor la cara posterolateral de la vejiga y la unión UV).",
        "Flexionar el brazo y la pierna del lado elevado para sostener la posición.",
        "Paciente y RI centrados con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Uréteres distales, vejiga y uretra proximal."]],
        ["Posicionamiento", ["La vejiga no se superpone a la pierna flexionada."]],
        ["Criterios técnicos", ["Técnica (brillo) adecuada para ver la vejiga sin sobreexponer otras estructuras, sin movimiento."]],
      ],
      fuente: { paginas: [309, 310] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cistografia-lateral", region: "cistografia", nombre: "Cistograma: lateral opcional", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "30 × 35 cm, vertical", dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: null },
      rc: { direccion: "perpendicular", texto: "Perpendicular, 5 cm por encima y por detrás de la sínfisis del pubis." },
      posicion: ["El manual no describe la posición para la lateral: solo la muestra en la figura 9.57."],
      criterios: SIN_CRIT,
      notas: ["El protocolo de rutina del cistograma puede no incluir la lateral por la elevada dosis gonadal."],
      fuente: { paginas: [309] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
