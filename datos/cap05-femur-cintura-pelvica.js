// Capítulo 5 · Fémur y cintura pélvica (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 149-172).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// respiracion: null cuando el manual no la indica para esa proyección.
// Protección (pág. 150): en estudios de pelvis y cadera la protección gonadal es clave por la cercanía de los tejidos
// radiosensibles, pero no debe tapar la zona de interés. Hombres: protector de contacto con el borde superior en el
// borde inferior de la sínfisis del pubis, a cualquier edad. Mujeres: protector ovárico en AP y lateral «de rana» de
// caderas (borde superior a la altura de las EIAS o apenas por encima, borde inferior justo por encima del pubis);
// en algunos estudios de pelvis puede tapar anatomía esencial, por eso cada servicio fija su política.
// Localización de cabeza y cuello femoral (pág. 151):
//  - Método 1: trazar una línea entre la EIAS y la sínfisis del pubis y, desde su punto medio, una perpendicular.
//    La cabeza femoral queda ≈4 cm (1,5") por debajo de esa línea; la parte media del cuello, ≈6-7 cm (2,5").
//  - Método 2: el cuello femoral está ≈2,5-5 cm (1-2") medial a la EIAS, a la altura del borde superior de la
//    sínfisis del pubis, que a su vez queda 8-10 cm (3-4") distal a la EIAS.
//    Ojo: la fig. 5.3 de esa misma página rotula «3-5 cm (1-2")» en lugar de 2,5-5 cm.

const DFRI = "100 cm";
const APNEA = "Apnea durante la exposición";
const SIN_CRITERIOS = []; // el manual no trae página de criterios: se deja vacío para completar después
const TEC_CADERA = ["Densidad (brillo) y contraste óptimos.", "Marcas trabeculares nítidas y bien visibles, sin movimiento."];

export default {
  capitulo: 5,
  titulo: "Fémur y cintura pélvica",
  paginas: "149-172",
  regiones: [
    { id: "femur", nombre: "Fémur", detalle: "Fémur medio y distal" },
    { id: "caderas", nombre: "Fémures proximales (caderas)", detalle: "" },
    { id: "cadera-lateral", nombre: "Lateral de cadera", detalle: "Sin traumatismo y por traumatismo" },
    { id: "pelvis", nombre: "Pelvis", detalle: "Cintura pélvica" },
    { id: "acetabulo", nombre: "Acetábulo", detalle: "" },
    { id: "caderas-pelvis-pediatricas", nombre: "Caderas y pelvis pediátricas", detalle: "" },
  ],
  proyecciones: [
    // ───────── Fémur ─────────
    {
      id: "femur-ap", region: "femur", nombre: "AP de fémur", categoria: ["AP"], tipo: "R",
      factores: { ri: "35 × 43 cm, vertical", dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: "Larga y estrecha, hasta el área del fémur" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al fémur, a la parte media del RI." },
      posicion: [
        "Decúbito supino, con el fémur centrado en la línea media de la mesa o del RI de la parrilla.",
        "Rotar hacia adentro toda la extremidad ≈5° para una AP de fémur medio y distal; 15° de rotación interna si la AP verdadera debe incluir la cadera.",
        "Borde inferior del RI ≈5 cm por debajo de la rodilla para que la articulación entre bien (para el fémur proximal, ver AP unilateral de cadera, pág. 157).",
        "Cadera hacia el extremo del cátodo (efecto talón o anódico).",
        "Proteger los tejidos radiosensibles en hombres y mujeres.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Dos tercios distales del fémur, con la articulación de la rodilla."]],
        ["Posicionamiento", ["Sin rotación: cóndilos femorales y tibiales simétricos en tamaño y forma."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Marcas trabeculares finas, sin movimiento."]],
      ],
      notas: ["En adultos con traumatismo, sumar un segundo RI más chico en la cadera o la rodilla para ver esas articulaciones y descartar fracturas."],
      fuente: { paginas: [152, 154] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "femur-lateral", region: "femur", nombre: "Lateral de fémur (mediolateral)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "35 × 43 cm, vertical", dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: "Larga y estrecha, hasta el área del fémur" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al fémur, a la parte media del RI." },
      posicion: [
        "Decúbito lateral, con la pierna sana llevada hacia atrás para no rotar de más.",
        "Incluir suficiente rodilla o cadera en un extremo del RI.",
        "Flexionar la rodilla afectada ≈45° y alinear el fémur con la línea media de la mesa.",
        "Cadera hacia el extremo del cátodo (efecto talón en el ánodo).",
        "Proteger los tejidos radiosensibles en lo posible.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Dos tercios distales del fémur, con la articulación de la rodilla."]],
        ["Posicionamiento", ["Lateral verdadera: cóndilos femorales superpuestos."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Marcas trabeculares finas, sin movimiento."]],
      ],
      notas: [
        "Si se sospecha fractura, hacer la lateral con haz horizontal.",
        "En adultos, si interesan las dos articulaciones, agregar un segundo RI más chico con una lateral de cadera o de rodilla.",
      ],
      fuente: { paginas: [153, 154] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "femur-lateral-haz-horizontal", region: "femur", nombre: "Lateral de fémur con haz horizontal: fémur medio y distal (traumatismo)", categoria: ["Perfil"], tipo: null,
      factores: { ri: "35 × 43 cm, vertical (siguiendo el eje longitudinal del fémur)", dfri: DFRI, respiracion: null, parrilla: "Parrilla portátil", colimacion: "Estrecha a los cuatro lados, hasta el área de interés" },
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al fémur, al punto medio del RI." },
      posicion: [
        "No mover al paciente de la posición de decúbito supino. Levantar con cuidado la pierna lesionada y poner un apoyo debajo de la rodilla y de la pierna.",
        "RI vertical entre las piernas, lo más arriba posible pero incluyendo la rodilla en la parte distal. Sujetar el RI con parrilla con cinta adhesiva.",
        "Proteger los tejidos radiosensibles en hombres y mujeres.",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Para el fémur proximal, hacer una axiolateral de cadera (método de Danelius-Miller)."],
      fuente: { paginas: [155] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Fémures proximales (caderas) ─────────
    {
      id: "caderas-ap-bilateral", region: "caderas", nombre: "AP bilateral de caderas: fémures proximales", categoria: ["AP"], tipo: "R",
      factores: { ri: "35 × 43 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta los bordes de la pelvis y de las caderas" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, al punto medio entre las cabezas femorales (unos 2 cm por encima de la sínfisis del pubis)." },
      posicion: [
        "Decúbito supino, alineado y centrado con el RC y el RI, con las dos piernas extendidas y la misma rotación interna de 15-20° (ver advertencia).",
        "Pelvis sin rotar: las dos EIAS a la misma distancia del tablero. Apoyo debajo de las rodillas para comodidad.",
        "Centrar el RI en el RC. Proteger los tejidos radiosensibles (hombres y mujeres).",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Si se sospecha fractura, no rotar la pierna: hacer las caderas bilaterales «tal cual» para comparar."],
      fuente: { paginas: [156] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "caderas-ap-unilateral", region: "caderas", nombre: "AP unilateral de cadera: fémur proximal", categoria: ["AP"], tipo: "R",
      factores: { ri: "24 × 30 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, dirigido 2,5-5 cm distal a la parte media del cuello femoral, para que entre cualquier dispositivo ortopédico de cadera." },
      posicion: [
        "Decúbito supino, pierna extendida y con rotación interna de 15-20° (sin traumatismo).",
        "Centrar el cuello femoral en el RC; se puede poner un apoyo debajo de las rodillas.",
        "Centrar el RI en el RC. Proteger los tejidos radiosensibles (hombres y mujeres).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Tercio proximal del fémur y partes vecinas de la cintura pélvica.", "Dispositivo ortopédico completo."]],
        ["Posicionamiento", ["Trocánter mayor, cabeza y cuello del fémur de perfil.", "El trocánter menor no se ve o apenas se ve."]],
        ["Criterios técnicos", TEC_CADERA],
      ],
      notas: ["Si puede haber fractura de cadera, hacer la AP bilateral de caderas (pág. 156) para comparar."],
      fuente: { paginas: [157, 158] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Lateral de cadera ─────────
    {
      id: "cadera-lateral-rana-unilateral", region: "cadera-lateral", nombre: "Lateral unilateral de cadera en «posición de rana» (sin traumatismo)", metodo: "Cleaves modificado", categoria: ["Perfil", "Métodos especiales"], tipo: "R",
      factores: { ri: "24 × 30 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta el fémur proximal y la cadera" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, a la parte media del cuello o de la cabeza femoral (ver métodos de localización, pág. 151)." },
      posicion: [
        "Decúbito supino.",
        "Para el cuello femoral: flexionar rodilla y cadera del lado afectado y llevar el fémur a 45° de abducción respecto de la vertical.",
        "Para la cabeza femoral, el acetábulo y la diáfisis proximal: oblicuar al paciente 35-45° hacia el lado afectado y abducir la pierna hasta la mesa si se puede. Centrar cadera y cuello en el RC.",
        "Centrar el RI en el RC. Proteger los tejidos radiosensibles (hombres y mujeres).",
      ],
      criterios: SIN_CRITERIOS,
      notas: [
        "No hacerla si puede haber fractura en la zona de la cadera.",
        "Con menos abducción (solo 20-30° respecto de la vertical) el cuello femoral sale menos acortado.",
      ],
      fuente: { paginas: [159] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cadera-lateral-rana-bilateral", region: "cadera-lateral", nombre: "AP bilateral de caderas en «posición de rana» (sin traumatismo)", metodo: "Cleaves modificado", categoria: ["AP", "Perfil", "Métodos especiales"], tipo: "R",
      factores: { ri: "35 × 43 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta la región de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, a la altura de las cabezas femorales (≈7-8 cm por debajo de las EIAS)." },
      posicion: [
        "Decúbito supino, centrado con el RC y el RI. Flexionar caderas y rodillas y abducir los dos fémures por igual hasta 40-45° respecto de la vertical, si se puede, con las plantas de los pies juntas.",
        "Pelvis sin rotar: EIAS a la misma distancia de la mesa.",
        "Centrar el RI en el RC. Proteger los tejidos radiosensibles (hombres y mujeres).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cabezas y cuellos femorales, acetábulo y zona de los trocánteres."]],
        ["Posicionamiento", ["Sin rotación: huesos pélvicos simétricos.", "Trocánteres menores del mismo tamaño.", "Cuello femoral con distorsión mínima.", "Trocánteres mayores superpuestos a los cuellos femorales."]],
        ["Criterios técnicos", TEC_CADERA],
      ],
      notas: [
        "No hacerla si puede haber fractura en las caderas.",
        "Con menos abducción (solo 20-30° respecto de la vertical) el cuello femoral sale menos acortado.",
      ],
      fuente: { paginas: [160, 161] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cadera-axiolateral-danelius-miller", region: "cadera-lateral", nombre: "Axiolateral inferosuperior de cadera (traumatismo)", metodo: "Danelius-Miller", categoria: ["Perfil", "Axiales", "Métodos especiales"], tipo: "R",
      factores: { ri: "24 × 30 cm (RI paralelo al fémur), horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Parrilla portátil", colimacion: "A los cuatro lados, hasta el área del fémur proximal" },
      rc: { direccion: "horizontal", texto: "Horizontal, perpendicular al área del cuello femoral y al RI (ver métodos de localización, pág. 151)." },
      posicion: [
        "Decúbito supino, sin rotación de la pelvis.",
        "Flexionar y levantar la rodilla y la cadera sanas, con un apoyo.",
        "Rotar la pierna afectada 15° hacia adentro, salvo que esté contraindicado por posible fractura de cadera.",
        "RI con parrilla vertical, apoyado contra el costado justo por encima de la cresta ilíaca, con su plano perpendicular al RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Toda la cabeza y el cuello femorales, los trocánteres y el acetábulo.", "Dispositivo ortopédico completo."]],
        ["Posicionamiento", ["Cabeza y cuello del fémur y acetábulo con poca superposición de la cadera opuesta.", "No se ven las líneas de la parrilla.", "Cuello femoral con distorsión mínima."]],
        ["Criterios técnicos", TEC_CADERA],
      ],
      notas: ["Con traumatismo, no rotar la pierna hacia adentro en la exploración inicial."],
      fuente: { paginas: [162, 163] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Pelvis ─────────
    {
      id: "pelvis-ap", region: "pelvis", nombre: "AP de pelvis", categoria: ["AP"], tipo: "R",
      factores: { ri: "35 × 43 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, incluyendo toda la pelvis" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, a mitad de camino entre las EIAS y la sínfisis del pubis (unos 5 cm distal a las EIAS)." },
      posicion: [
        "Decúbito supino, pelvis centrada en la línea media y piernas extendidas.",
        "Pies, rodillas y piernas con la misma rotación interna de 15-20° (con cinta si hace falta). Apoyo debajo de las rodillas.",
        "Pelvis sin rotar: EIAS a la misma distancia del tablero de la mesa.",
        "Centrar el RI en el RC, incluyendo toda la pelvis. Proteger los tejidos radiosensibles si no compromete el estudio.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cintura pélvica, L5, sacro, cóccix y fémures proximales.", "Dispositivo ortopédico completo, si lo hay."]],
        ["Posicionamiento", ["Los trocánteres menores en general no se ven (sin traumatismo).", "Sin rotación: alas ilíacas y agujeros obturadores simétricos."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos: se ven L5, el sacro y los bordes de las cabezas femorales y de los acetábulos.", "Partes blandas y marcas trabeculares nítidas, sin movimiento."]],
      ],
      notas: [
        "Incluye fémures proximales, cintura pélvica, sacro y cóccix.",
        "No rotar las piernas si se sospechan fracturas de cadera.",
        "Para el centrado bilateral de caderas, ver AP bilateral de caderas (pág. 156).",
      ],
      fuente: { paginas: [164, 165] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pelvis-ap-axial-inlet", region: "pelvis", nombre: "AP axial de pelvis «inlet» (entrada)", categoria: ["AP", "Axiales"], tipo: "E",
      factores: { ri: "35 × 43 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área de interés" },
      rc: { direccion: "caudal", angulo: "40°", texto: "40° caudal, a la altura de las EIAS, en hombres y mujeres." },
      posicion: [
        "Decúbito supino, centrado en la línea media.",
        "Pelvis sin rotar: EIAS a la misma distancia del tablero.",
        "Centrar el RI en el RC proyectado. Puede no ser posible proteger las gónadas sin tapar anatomía esencial.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el anillo (entrada) de la pelvis."]],
        ["Posicionamiento", ["Espinas isquiáticas visibles y del mismo tamaño; anillo pélvico; sin rotación."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Se ven el cuerpo y las ramas superiores del pubis.", "Partes anterior y posterior del anillo pélvico superpuestas.", "Bordes óseos y marcas trabeculares nítidos."]],
      ],
      fuente: { paginas: [166, 167] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pelvis-ap-axial-outlet", region: "pelvis", nombre: "AP axial de pelvis «outlet» (salida)", metodo: "Taylor", categoria: ["AP", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "35 × 43 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área de interés" },
      rc: { direccion: "cefálico", angulo: "20-35° (hombres); 30-45° (mujeres)", texto: "Hombres, 20-35° cefálico; mujeres, 30-45° cefálico. Centrado 2,5-5 cm por debajo de la sínfisis del pubis o de los trocánteres mayores." },
      posicion: [
        "Decúbito supino, centrado en la línea media.",
        "Pelvis sin rotar: EIAS a la misma distancia del tablero.",
        "Centrar el RI en el RC proyectado. Puede no ser posible proteger las gónadas sin tapar anatomía esencial.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Ramas superiores e inferiores del pubis y rama del isquion."]],
        ["Posicionamiento", ["Agujeros obturadores del mismo tamaño; huesos anteriores y posteriores de la pelvis; sin rotación."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Se ven el cuerpo y las ramas superiores del pubis.", "Partes anterior y posterior del anillo pélvico superpuestas.", "Bordes óseos y marcas trabeculares nítidos."]],
      ],
      fuente: { paginas: [166, 167] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Acetábulo ─────────
    {
      id: "acetabulo-oblicua-posterior-judet", region: "acetabulo", nombre: "Oblicua posterior de acetábulo", metodo: "Judet", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: { ri: "24 × 30 cm, vertical, o 35 × 43 cm, horizontal si hay que ver las dos caderas en todas las proyecciones", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "A los cuatro lados, hasta el área de interés" },
      rc: { direccion: "perpendicular", texto: "Cadera apoyada (abajo): perpendicular, 5 cm distal y 5 cm medial a la superficie inferior de la EIAS. Cadera elevada (arriba): perpendicular, 5 cm distal a la superficie superior de la EIAS." },
      posicion: [
        "Oblicua posterior a 45°, centrando la cadera de arriba o la de abajo según lo que interese.",
        "Cuña de 45° debajo de la pierna elevada; brazos y piernas acomodados para sostener la posición.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cadera apoyada: reborde anterior del acetábulo, columna ilioisquiática posterior y ala ilíaca.", "Cadera elevada: reborde posterior del acetábulo, columna iliopúbica anterior y agujero obturador."]],
        ["Posicionamiento", ["Cadera apoyada: ala ilíaca alargada y agujero obturador cerrado.", "Cadera elevada: ala ilíaca acortada y agujero obturador abierto."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes óseos y marcas trabeculares nítidos, sin movimiento."]],
      ],
      notas: ["En general se hacen los dos lados para comparar, con el acetábulo arriba o abajo."],
      fuente: { paginas: [168, 169] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "acetabulo-pa-oblicua-axial-teufel", region: "acetabulo", nombre: "PA oblicua axial de acetábulo", metodo: "Teufel", categoria: ["PA", "Oblicuas", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "24 × 30 cm, vertical", dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: "Región del acetábulo y fémur proximal" },
      rc: { direccion: "cefálico", angulo: "12°", texto: "12° cefálico. Cuando la región de interés está abajo (lado apoyado), dirigirlo 2,5 cm por encima del trocánter mayor y ≈5 cm lateral al plano sagital medio." },
      posicion: [
        "Semidecúbito prono, con el lado afectado hacia abajo.",
        "Rotar el cuerpo 35-40° en oblicua anterior.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Pared superoposterior del acetábulo."]],
        ["Posicionamiento", ["Fosa de la cabeza femoral, con la cabeza del fémur de perfil.", "Agujero obturador abierto."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Bordes óseos y marcas trabeculares nítidos."]],
      ],
      notas: ["En general se hacen los dos lados para comparar."],
      revision: ["RC: el manual indica «RC 12° en dirección cefálica» y en el punto siguiente escribe «RC ⊥» para el centrado. Se tomó el ángulo de 12° cefálico; confirmar si el «⊥» es una errata."],
      fuente: { paginas: [170, 171] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Caderas y pelvis pediátricas ─────────
    {
      id: "caderas-pelvis-pediatricas-ap", region: "caderas-pelvis-pediatricas", nombre: "AP de caderas y pelvis pediátricas", categoria: ["AP"], tipo: "E",
      factores: { ri: "Según el tamaño del paciente; RI horizontal", dfri: DFRI, respiracion: "Inspiración completa si el paciente llora", parrilla: "Sí si el grosor supera 10 cm", colimacion: "Hasta los bordes de la pelvis" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, centrado a la altura de las caderas." },
      posicion: [
        "Decúbito supino, pelvis centrada en el RC y el RI. Usar protección gonadal en varones y nenas (en nenas, un protector ovárico de tamaño adecuado que no tape las caderas).",
        "Inmovilizar brazos y parte superior del cuerpo con bolsas de arena, cinta o bandas de compresión según haga falta.",
        "Piernas extendidas con rotación interna de 15°.",
      ],
      criterios: SIN_CRITERIOS,
      fuente: { paginas: [172] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "caderas-pelvis-pediatricas-lateral-rana", region: "caderas-pelvis-pediatricas", nombre: "Lateral de caderas pediátricas en «posición de rana»", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "Según el tamaño del paciente; RI horizontal", dfri: DFRI, respiracion: "Inspiración completa si el paciente llora", parrilla: "Sí si el grosor supera 10 cm", colimacion: "Hasta los bordes de la pelvis" },
      rc: { direccion: "perpendicular", texto: "Perpendicular, centrado a la altura de las caderas." },
      posicion: [
        "Decúbito supino, pelvis centrada en el RC y el RI. Usar protección gonadal en varones y nenas (en nenas, un protector ovárico de tamaño adecuado que no tape las caderas).",
        "Inmovilizar brazos y parte superior del cuerpo con bolsas de arena, cinta o bandas de compresión según haga falta.",
        "Flexionar rodillas y caderas, juntar las plantas de los pies y abducir las dos piernas; fijar con cinta y bolsas de arena.",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Con posible patología de cadera, no hacer la lateral «de rana» salvo que la indique un médico después de ver la AP de pelvis."],
      fuente: { paginas: [172] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
