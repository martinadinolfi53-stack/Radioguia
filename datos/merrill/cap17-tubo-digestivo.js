// Capítulo 17 · Aparato digestivo: tubo digestivo (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 2, págs. 120-194).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// Solo las proyecciones radiográficas que siguen a la fluoroscopia; la preparación y los procedimientos de contraste quedan fuera.
// DFRI: 122 cm, como indica la tabla de técnicas del capítulo (pág. 128).
// Parrilla: Bucky 16:1 en todas, según esa tabla.
// Tipo: R = proyección «fundamental» del resumen de proyecciones (pág. 120); E = el resto.

const DFRI = "122 cm";
const BUCKY = "Sí (Bucky, rejilla 16:1)";
const ESP = "Suspendida al final de la espiración (salvo otra indicación)";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const GONADAS = "Proteger las gónadas.";
const V2 = (...paginas) => ({ paginas, volumen: 2 });
const ESOFAGO_RESP = "Bario: varios tragos seguidos y uno retenido en la boca hasta exponer; se expone al tragar (en inspiración moderada). Várices: espiración completa antes de tragar, o Valsalva tras tragar";
const ESOFAGO_GENERAL = [
  "Esófago desde la parte baja del cuello hasta su entrada en el estómago.",
  "Esófago lleno de bario y bien penetrado.",
];
const RI_ESOFAGO = "35 × 43 cm, longitudinal, con el borde superior a la altura de la boca";
const RC_ESOFAGO = { direccion: "perpendicular", texto: "Perpendicular al centro del RI (queda a la altura de T5-T6)." };
const ESOFAGO_NOTA = "Salvo que se pida de pie, se hace acostado: el bario llena mejor el esófago contra la gravedad (y también las várices).";
const COLON_DOBLE = "En contraste simple, bario bien penetrado; en doble contraste lo importante es la parte inflada con aire, sin sobrepenetrar.";

export default {
  capitulo: 17,
  titulo: "Tubo digestivo",
  paginas: "120-194",
  regiones: [
    { id: "esofago", nombre: "Esófago", detalle: "Esofagograma" },
    { id: "estomago", nombre: "Estómago y duodeno", detalle: "SEGD" },
    { id: "intestino-delgado", nombre: "Intestino delgado", detalle: "Tránsito intestinal" },
    { id: "intestino-grueso", nombre: "Intestino grueso", detalle: "Colon por enema" },
  ],
  proyecciones: [
    {
      id: "esofago-ap-pa", region: "esofago", nombre: "AP o PA de esófago", categoria: ["AP", "PA"], tipo: "R",
      factores: f(RI_ESOFAGO, { parrilla: BUCKY, respiracion: ESOFAGO_RESP, angulacion: "No", rotacion: "No" }),
      rc: RC_ESOFAGO,
      posicion: [
        "Paciente en decúbito supino o prono (como para un tórax), con los brazos por encima de la cabeza, cómodo.",
        "Plano medio sagital centrado en la rejilla.",
        "Si hace falta, girar un poco la cabeza para ayudarle a tragar.",
        GONADAS,
      ],
      criterios: crit(["Esófago lleno de contraste desde la parte baja del cuello hasta la unión esofagogástrica."], [
        ...ESOFAGO_GENERAL,
        "Esófago visible a través de las vértebras dorsales.",
        "Sin rotación.",
      ]),
      notas: [ESOFAGO_NOTA],
      fuente: V2(138, 139),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esofago-oblicua", region: "esofago", nombre: "AP o PA oblicua de esófago (OAD u OPI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f(RI_ESOFAGO, { parrilla: BUCKY, respiracion: ESOFAGO_RESP, angulacion: "No", rotacion: "Sí · 35 a 40° (OAD de preferencia, u OPI)" }),
      rc: RC_ESOFAGO,
      posicion: [
        "Paciente en OAD u OPI, con el plano medio sagital a 35-40° de la rejilla. La OAD se prefiere a la OAI porque deja más espacio para ver el esófago entre la columna y el corazón.",
        "Brazo de abajo junto al cuerpo y brazo de arriba sobre la almohada junto a la cabeza.",
        "Centrar en la rejilla el lado elevado, en un plano unos 5 cm lateral al plano medio sagital.",
        GONADAS,
      ],
      criterios: crit(["Esófago lleno de contraste entre la columna y el corazón."], [
        ...ESOFAGO_GENERAL,
        "Esófago entre las vértebras y el corazón.",
      ]),
      notas: [ESOFAGO_NOTA],
      fuente: V2(138, 139),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "esofago-lateral", region: "esofago", nombre: "Lateral de esófago", categoria: ["Perfil"], tipo: "R",
      factores: f(RI_ESOFAGO, { parrilla: BUCKY, respiracion: ESOFAGO_RESP, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: RC_ESOFAGO,
      posicion: [
        "Paciente en lateral derecho o izquierdo, con los brazos hacia adelante y los antebrazos sobre la almohada cerca de la cabeza.",
        "Plano medio coronal centrado en la rejilla.",
        GONADAS,
      ],
      criterios: crit(["Esófago lleno de contraste de perfil."], [
        ...ESOFAGO_GENERAL,
        "Brazos fuera del esófago proximal.",
        "Costillas posteriores superpuestas por detrás de la columna (sin rotación).",
      ]),
      notas: [ESOFAGO_NOTA],
      fuente: V2(138, 139),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-pa", region: "estomago", nombre: "PA de estómago y duodeno", categoria: ["PA"], tipo: "R",
      factores: f("30 × 35 cm, longitudinal (35 × 43 cm si se incluye esófago distal o intestino delgado)", { parrilla: BUCKY, respiracion: ESP, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Paciente acostado (a veces de pie para ver la posición del estómago). En pacientes delgados, almohadillas bajo tórax y pelvis para que la columna no comprima el estómago.",
        "Centrar en la rejilla el plano sagital a mitad de camino entre la columna y el borde lateral izquierdo del abdomen.",
        "En prono, RI unos 5 cm por encima del reborde costal, a la altura de L1-L2; de pie, 7,6 a 15 cm más abajo.",
        "Sin banda de compresión: provoca defectos de llenado.",
        GONADAS,
      ],
      criterios: crit(["Estómago y bulbo duodenal llenos de bario (de pie: tamaño, forma y posición del estómago lleno)."], [
        "Todo el estómago y el asa duodenal.",
        "Estómago centrado a la altura del píloro.",
        "Sin rotación.",
        "Técnica que muestra la anatomía.",
      ]),
      fuente: V2(144, 145),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-pa-axial", region: "estomago", nombre: "PA axial de estómago y duodeno", categoria: ["Axiales"], tipo: "E",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, respiracion: ESP, angulacion: "Sí · 35 a 45° cefálico (20 a 25° en lactantes)", rotacion: "No" }),
      rc: { direccion: "cefálico", angulo: "35 a 45°", texto: "35 a 45° cefálico hacia el centro del RI (Gugliantini: 20 a 25° en lactantes)." },
      posicion: [
        "Paciente en decúbito prono, con el plano medio sagital centrado en la rejilla.",
        "En esténicos, RI a la altura de L2 (2,5 a 5 cm por encima del reborde costal); algo más alto en hiperesténicos y más bajo en asténicos.",
        GONADAS,
      ],
      criterios: crit(["Estómago «abierto» (sobre todo el alto y horizontal del hiperesténico): curvaturas, antro, conducto pilórico y bulbo duodenal."], [
        "Todo el estómago y el duodeno proximal.",
        "Estómago centrado a la altura del píloro.",
        "Técnica que muestra la anatomía.",
      ]),
      notas: ["Ideada por Gordon."],
      fuente: V2(146, 147),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-pa-oblicua-oad", region: "estomago", nombre: "PA oblicua de estómago y duodeno (OAD)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("30 × 35 cm, longitudinal", { parrilla: BUCKY, respiracion: ESP, angulacion: "No", rotacion: "Sí · OAD de 40 a 70° (más en hiperesténicos)" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Desde la PA: cabeza sobre la mejilla derecha y brazo derecho junto al cuerpo; elevar el lado izquierdo apoyándose en el antebrazo y la rodilla izquierdos.",
        "Centrar en la rejilla el plano sagital a mitad de camino entre la columna y el borde lateral del lado elevado.",
        "RI unos 2,5-5 cm por encima del reborde costal, a la altura de L1-L2.",
        "Rotación final de 40 a 70° según el tamaño, forma y posición del estómago.",
        GONADAS,
      ],
      criterios: crit(["Estómago y asa duodenal completa; la mejor imagen del conducto pilórico y el bulbo en hábitos cercanos al esténico."], [
        "Todo el estómago y el asa duodenal.",
        "Píloro y bulbo duodenal sin superponerse.",
        "Bulbo y asa duodenal de perfil.",
        "Estómago centrado a la altura del píloro.",
        "Técnica que muestra la anatomía.",
      ]),
      notas: ["El peristaltismo es más activo en OAD: a veces se hace una serie cada 30-40 s para el píloro y el bulbo."],
      fuente: V2(148, 149),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-ap-oblicua-opi", region: "estomago", nombre: "AP oblicua de estómago y duodeno (OPI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("30 × 35 cm, longitudinal", { parrilla: BUCKY, respiracion: ESP, angulacion: "No", rotacion: "Sí · OPI de 45° de media (30 a 60° según el hábito)" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Paciente en decúbito supino; brazo izquierdo abducido con la mano cerca de la cabeza (o a lo largo del cuerpo) y brazo derecho al costado o cruzado sobre el tórax.",
        "Girarlo hacia la izquierda apoyado en la cara posterior izquierda, con la rodilla derecha flexionada y una esponja bajo la espalda elevada.",
        "Centrar en el RI el plano sagital a mitad de camino entre la columna y el borde lateral izquierdo del abdomen.",
        "RI a la altura del cuerpo del estómago, a mitad de camino entre la xifoides y el reborde costal.",
        GONADAS,
      ],
      criterios: crit(["Fondo gástrico; píloro y bulbo con menos bario que en la OAD, en doble contraste."], [
        "Todo el estómago y el asa duodenal.",
        "Fondo gástrico.",
        "Píloro y bulbo duodenal sin superponerse.",
        "Cuerpo del estómago centrado.",
        "Cuerpo y píloro en doble contraste.",
        "Técnica que muestra la anatomía.",
      ]),
      fuente: V2(150, 151),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-lateral", region: "estomago", nombre: "Lateral derecho de estómago y duodeno", categoria: ["Perfil"], tipo: "R",
      factores: f("30 × 35 cm, longitudinal", { parrilla: BUCKY, respiracion: ESP, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Acostado en lateral derecho (espacio retrogástrico derecho, asa duodenal y unión duodenoyeyunal); de pie en lateral izquierdo para el espacio retrogástrico izquierdo.",
        "Centrar en la rejilla el plano a mitad de camino entre el plano medio coronal y la cara anterior del abdomen.",
        "RI a la altura de L1-L2 acostado (2,5 a 5 cm por encima del reborde costal) o de L3 de pie.",
        "Lateral verdadero.",
        GONADAS,
      ],
      criterios: crit(["Caras anterior y posterior del estómago, conducto pilórico y bulbo duodenal (la mejor en hiperesténicos)."], [
        "Todo el estómago y el asa duodenal.",
        "Sin rotación, según las vértebras.",
        "Estómago centrado a la altura del píloro.",
        "Técnica que muestra la anatomía.",
      ]),
      fuente: V2(152, 153),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-ap", region: "estomago", nombre: "AP de estómago y duodeno", categoria: ["AP"], tipo: "R",
      factores: f("30 × 35 cm transversal (longitudinal para hernias hiatales pequeñas); 35 × 43 cm longitudinal para hernias diafragmáticas grandes o estómago e intestino delgado", { parrilla: BUCKY, respiracion: ESP, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI." },
      posicion: [
        "Paciente en decúbito supino: el bario llena el fondo y el gas pasa al antro (doble contraste de la pared posterior). En delgados, girar a la izquierda o bajar la cabecera.",
        "Para hernias diafragmáticas, Trendelenburg total o parcial.",
        "RI de 35 × 43 cm: línea media del cuerpo en la rejilla; altura según la hernia (se define en la fluoroscopia). RI de 30 × 35 cm: plano a mitad de camino entre la línea media y el borde izquierdo del abdomen.",
        "Estómago y duodeno: RI a mitad de camino entre la xifoides y el reborde costal (L1-L2), más arriba o abajo si interesa el diafragma o el intestino delgado.",
        GONADAS,
      ],
      criterios: crit(["Fondo lleno y doble contraste de cuerpo, píloro y duodeno; zona retrogástrica del duodeno y yeyuno; hernias a través del diafragma."], [
        "Todo el estómago y el asa duodenal.",
        "Doble contraste del cuerpo, el píloro y el bulbo duodenal.",
        "Zona retrogástrica del duodeno y yeyuno.",
        "Bases pulmonares en los 35 × 43 cm para hernias diafragmáticas.",
        "Estómago centrado en el píloro en los 30 × 35 cm.",
        "Sin rotación y técnica que muestra la anatomía.",
      ]),
      fuente: V2(154, 155),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-wolf", region: "estomago", nombre: "PA oblicua de estómago superior y esófago distal (OAD)", metodo: "Wolf (hernia hiatal)", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, respiracion: "Suspendida al final de la espiración; exponer durante el 3.er o 4.º sorbo de bario", angulacion: "No · el RC perpendicular a la espalda queda 10 a 20° caudal", rotacion: "Sí · OAD de 40 a 45°" }),
      rc: { direccion: "caudal", angulo: "10 a 20°", texto: "Perpendicular al eje largo de la espalda, centrado en T6-T7; por la cuña queda con 10 a 20° caudal respecto de la mesa." },
      posicion: [
        "Paciente en decúbito prono; en posición genupectoral modificada se coloca bajo el abdomen, justo por debajo del reborde costal, un dispositivo de compresión semicilíndrico radiotransparente (55 × 24 × 20 cm).",
        "Girarlo a OAD de 40-45° con el tórax centrado en la rejilla.",
        "Bebe bario con pajita en sorbos rápidos y continuos.",
        GONADAS,
      ],
      criterios: crit(["Relación entre estómago y diafragma; hernias hiatales deslizantes pequeñas."], [
        "Esófago medio y distal y parte superior del estómago.",
        "Esófago entre la columna y el corazón.",
      ]),
      notas: ["Equivale a un Trendelenburg con más presión intraabdominal, sin inclinar la mesa."],
      fuente: V2(156, 157),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "estomago-seriados-mucosa", region: "estomago", nombre: "PA oblicua para estudios seriados y de la mucosa (OAD)", categoria: ["Oblicuas"], tipo: "E",
      factores: f("En el Bucky, centrado sobre la paleta; se cambia en cada exposición", { parrilla: BUCKY, respiracion: ESP, angulacion: "No", rotacion: "Sí · OAD ligera" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI." },
      posicion: [
        "Paciente en decúbito prono, ligeramente en OAD, con la zona en estudio sobre la línea media de la rejilla.",
        "Paleta de compresión inflable bajo la zona de interés; bajo fluoroscopia, el bulbo duodenal queda centrado sobre la paleta.",
        "Inflar la paleta a la presión deseada; una placa inflada y otras mientras se desinfla.",
        GONADAS,
      ],
      criterios: crit(["Extremo pilórico y bulbo duodenal con y sin compresión, en distintos momentos del llenado y vaciado."], [
        "Píloro y bulbo duodenal centrados, sin superponerse y de perfil.",
      ]),
      notas: ["La parte fluoroscópica la hace el radiólogo."],
      fuente: V2(158),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "intestino-delgado-pa-ap", region: "intestino-delgado", nombre: "PA o AP de intestino delgado", categoria: ["PA", "AP"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, respiracion: ESP, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI: a la altura de L2 en las placas tempranas y de las crestas ilíacas en las tardías." },
      posicion: [
        "Paciente en decúbito prono (comprime el abdomen) o supino (separa el duodeno y yeyuno retrogástricos y evita superposición).",
        "Plano medio sagital centrado en la rejilla.",
        "En esténicos, RI en L2 durante los primeros 30 minutos tras el contraste; después, en las crestas ilíacas.",
        "Cada placa lleva un marcador con el tiempo desde la ingesta (la primera, a los 15 minutos; luego cada 15-30).",
        GONADAS,
      ],
      criterios: crit(["Llenado progresivo del intestino delgado hasta la válvula ileocecal."], [
        "Todo el intestino delgado en cada placa.",
        "Estómago en las placas iniciales.",
        "Indicador de tiempo.",
        "Columna centrada y sin rotación.",
        "Técnica que muestra la anatomía.",
        "Estudio terminado cuando el bario llega al ciego (unas 2 h con motilidad normal).",
      ]),
      fuente: V2(159, 160, 161),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-pa", region: "intestino-grueso", nombre: "PA de intestino grueso", categoria: ["PA"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, por la línea media a la altura de las crestas ilíacas." },
      posicion: [
        "Paciente en decúbito prono con el plano medio sagital centrado en la rejilla.",
        "RI en las crestas ilíacas (algo más alto en hiperesténicos y más bajo en asténicos).",
        "Si hace falta, Trendelenburg leve para sacar las asas de la pelvis.",
        GONADAS,
      ],
      criterios: crit(["Todo el colon en decúbito prono."], [
        "Todo el colon con las flexuras y el recto (dos RI en hiperesténicos).",
        "Columna centrada, incluyendo colon ascendente y descendente.",
      ]),
      fuente: V2(176, 177),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-pa-axial", region: "intestino-grueso", nombre: "PA axial de intestino grueso", categoria: ["Axiales"], tipo: "R",
      factores: f("35 × 43 cm o 24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "Sí · 30 a 40° caudal", rotacion: "No" }),
      rc: { direccion: "caudal", angulo: "30 a 40°", texto: "30 a 40° caudal, entrando por la línea media a la altura de la EIAS." },
      posicion: [
        "Paciente en decúbito prono con el plano medio sagital centrado en la rejilla.",
        "RI centrado en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Zona rectosigmoide."], [
        "Zona rectosigmoide centrada.",
        "Rectosigmoide menos superpuesto que en la PA.",
        "No hace falta incluir el colon transverso ni las flexuras.",
      ]),
      fuente: V2(178),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-pa-oblicua-oad", region: "intestino-grueso", nombre: "PA oblicua de intestino grueso (OAD)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "Sí · OAD de 35 a 45°" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, 2,5 a 5 cm lateral a la línea media del lado elevado, a la altura de la cresta ilíaca." },
      posicion: [
        "Paciente en decúbito prono; brazo derecho al costado y mano izquierda junto a la cabeza.",
        "Girarlo sobre la cadera derecha hasta 35-45°, con la rodilla izquierda flexionada.",
        "Cuerpo centrado en la rejilla; RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Flexura cólica derecha, colon ascendente y sigmoide."], [
        "Todo el colon.",
        "Flexura cólica derecha más abierta que en la PA.",
        "Colon ascendente, ciego y sigma.",
      ]),
      fuente: V2(179),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-pa-oblicua-oai", region: "intestino-grueso", nombre: "PA oblicua de intestino grueso (OAI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "Sí · OAI de 35 a 45°" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, 2,5 a 5 cm lateral a la línea media del lado elevado, a la altura de la cresta ilíaca." },
      posicion: [
        "Paciente en decúbito prono; brazo izquierdo al costado y mano derecha junto a la cabeza.",
        "Girarlo sobre la cadera izquierda hasta 35-45°, con la rodilla derecha flexionada.",
        "Cuerpo centrado en la rejilla; RI en la cresta ilíaca.",
        GONADAS,
      ],
      criterios: crit(["Flexura cólica izquierda y colon descendente."], [
        "Todo el colon.",
        "Flexura cólica izquierda más abierta que en la PA.",
        "Colon descendente.",
      ]),
      fuente: V2(180),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-lateral", region: "intestino-grueso", nombre: "Lateral de recto", categoria: ["Perfil"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, por el plano medio coronal a la altura de la EIAS." },
      posicion: [
        "Paciente acostado sobre el lado izquierdo o derecho, con el plano medio coronal centrado en la rejilla.",
        "Rodillas algo flexionadas con un apoyo entre ellas; hombros y caderas perpendiculares a la mesa.",
        "RI centrado en la EIAS.",
        GONADAS,
      ],
      criterios: crit(["Recto y sigma distal."], [
        "Zona rectosigmoide centrada.",
        "Sin rotación: caderas y fémures superpuestos.",
        "No hace falta incluir el colon superior.",
      ]),
      fuente: V2(181),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-ap", region: "intestino-grueso", nombre: "AP de intestino grueso", categoria: ["AP"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, por la línea media a la altura de las crestas ilíacas." },
      posicion: [
        "Paciente en decúbito supino con el plano medio sagital centrado en la rejilla.",
        "RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Todo el colon en decúbito supino."], [
        "Todo el colon con la flexura esplénica y el recto (dos RI en hiperesténicos).",
        "Columna centrada, con colon ascendente y descendente completos.",
      ]),
      fuente: V2(182),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-ap-axial", region: "intestino-grueso", nombre: "AP axial de intestino grueso", categoria: ["Axiales"], tipo: "R",
      factores: f("35 × 43 cm o 24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "Sí · 30 a 40° cefálico", rotacion: "No" }),
      rc: { direccion: "cefálico", angulo: "30 a 40°", texto: "30 a 40° cefálico, por la línea media unos 5 cm por debajo de la EIAS; para una placa colimada del rectosigmoide, por el borde inferior de la sínfisis." },
      posicion: [
        "Paciente en decúbito supino con el plano medio sagital centrado en la rejilla.",
        "RI unos 5 cm por encima de las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Zona rectosigmoide."], [
        "Rectosigmoide centrado con RI de 24 × 30 cm.",
        "Rectosigmoide menos superpuesto que en la AP.",
        "No hace falta incluir el colon transverso ni las flexuras.",
      ]),
      fuente: V2(183),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-ap-oblicua-opi", region: "intestino-grueso", nombre: "AP oblicua de intestino grueso (OPI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "Sí · OPI de 35 a 45°" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, por el lado elevado unos 2,5 a 5 cm lateral a la línea media, a la altura de la cresta ilíaca." },
      posicion: [
        "Paciente en decúbito supino; brazo izquierdo al costado y brazo derecho cruzado sobre el tórax.",
        "Girarlo sobre la cadera izquierda hasta 35-45°, con esponja y rodilla derecha flexionada si hace falta.",
        "Plano medio sagital centrado en la rejilla; RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Flexura cólica derecha, colon ascendente y sigmoide."], [
        "Todo el colon.",
        "Flexura cólica derecha más abierta que en la AP.",
        "Colon ascendente, ciego y sigma.",
      ]),
      fuente: V2(184),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-ap-oblicua-opd", region: "intestino-grueso", nombre: "AP oblicua de intestino grueso (OPD)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "Sí · OPD de 35 a 45°" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, por el lado elevado unos 2,5 a 5 cm lateral a la línea media, a la altura de la cresta ilíaca." },
      posicion: [
        "Paciente en decúbito supino; brazo derecho al costado y brazo izquierdo cruzado sobre el tórax.",
        "Girarlo sobre la cadera derecha hasta 35-45°, con esponja de apoyo si hace falta.",
        "Cuerpo centrado en la rejilla; RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Flexura cólica izquierda y colon descendente."], [
        "Todo el colon.",
        "Flexura cólica izquierda y colon descendente.",
      ]),
      revision: "El atlas indica flexionar la rodilla derecha también en la OPD; lo lógico sería la izquierda (la del lado elevado).",
      fuente: V2(185),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-decubito-lateral-derecho", region: "intestino-grueso", nombre: "AP o PA de intestino grueso en decúbito lateral derecho", categoria: ["Decúbitos", "AP", "PA"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: "Sí (rejilla vertical)", angulacion: "No · haz horizontal", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al RI, por la línea media a la altura de las crestas ilíacas." },
      posicion: [
        "Paciente sobre el costado derecho, con la espalda o el abdomen contra la rejilla vertical; bloquear las ruedas de la camilla.",
        "Elevarlo sobre un soporte radiotransparente para que no aparezcan artefactos de colchón o camilla en el lado de abajo.",
        "Plano medio sagital centrado en la rejilla; RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Colon con contraste; en doble contraste, cara medial del ascendente y lateral del descendente."], [
        "Desde la flexura cólica izquierda hasta el recto.",
        "Sin rotación, según costillas y pelvis.",
        COLON_DOBLE,
      ]),
      notas: ["En pacientes grandes, un filtro de decúbito mejora la imagen. Si se hacen ambos decúbitos, uno con la cara anterior y otro con la posterior contra la rejilla."],
      fuente: V2(186, 187),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-decubito-lateral-izquierdo", region: "intestino-grueso", nombre: "PA o AP de intestino grueso en decúbito lateral izquierdo", categoria: ["Decúbitos", "AP", "PA"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: "Sí (rejilla vertical)", angulacion: "No · haz horizontal", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al RI, por la línea media a la altura de las crestas ilíacas." },
      posicion: [
        "Paciente sobre el costado izquierdo, con la espalda o el abdomen contra la rejilla vertical; bloquear las ruedas de la camilla.",
        "Elevarlo sobre un soporte radiotransparente.",
        "Plano medio sagital centrado en la rejilla; RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Colon con contraste; en doble contraste, cara lateral del ascendente y medial del descendente."], [
        "Desde la flexura cólica izquierda hasta el recto.",
        "Sin rotación, según costillas y pelvis.",
        COLON_DOBLE,
      ]),
      fuente: V2(186, 188),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-lateral-decubito-ventral", region: "intestino-grueso", nombre: "Lateral de intestino grueso en decúbito ventral", categoria: ["Decúbitos", "Perfil"], tipo: "E",
      factores: f("35 × 43 cm, longitudinal", { parrilla: "Sí (rejilla vertical)", angulacion: "No · haz horizontal", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al RI, por el plano medio coronal a la altura de las crestas ilíacas." },
      posicion: [
        "Paciente en decúbito prono con el costado derecho o izquierdo contra la rejilla vertical.",
        "Elevarlo sobre un soporte radiotransparente y centrar el plano medio coronal en la rejilla.",
        "RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Colon lateral; partes posteriores (las de arriba) en doble contraste."], [
        "Desde las flexuras hasta el recto.",
        "Sin rotación.",
        COLON_DOBLE,
        "Cánula del enema retirada para ver bien el recto.",
      ]),
      fuente: V2(189),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-bipedestacion", region: "intestino-grueso", nombre: "AP, PA, oblicuas y lateral de intestino grueso de pie", categoria: ["AP", "PA", "Oblicuas", "Perfil"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal, más bajo que acostado", { parrilla: "Sí (rejilla vertical)", angulacion: "No", rotacion: "Sí · en las oblicuas, como acostado (35 a 45°); No en AP, PA y lateral" }),
      rc: { direccion: "variable", texto: "Igual que en la proyección equivalente acostado, bajando el centraje por la caída del intestino." },
      posicion: [
        "Mismas posiciones que acostado, pero de pie.",
        "Bajar el RI para compensar la caída del intestino por la gravedad.",
        GONADAS,
      ],
      criterios: crit(["Las mismas que en las proyecciones acostado."], [
        "Los mismos criterios que en la proyección equivalente acostado.",
      ]),
      revision: "El atlas no da rotación concreta para la serie de pie; remite a las proyecciones acostado.",
      fuente: V2(190),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "colon-chassard-lapine", region: "intestino-grueso", nombre: "Axial de rectosigma", metodo: "Chassard-Lapiné", categoria: ["Axiales", "Métodos especiales"], tipo: "E",
      factores: f("30 × 35 cm, transversal en el Bucky", { parrilla: BUCKY, angulacion: "No · la angulación la da la flexión del tronco", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a la región lumbosacra, a la altura de los trocánteres mayores." },
      posicion: [
        "Paciente sentado bien atrás en un costado de la mesa, con el plano medio coronal lo más cerca posible de la línea media de la mesa (adelantar el RI en el Bucky si hace falta).",
        "Muslos abducidos todo lo que permita el borde de la mesa.",
        "RI en la línea media de la pelvis; el paciente se inclina hacia adelante todo lo posible y se agarra los tobillos.",
      ],
      criterios: crit(["Recto, unión rectosigmoide y sigma en axial, con las vueltas del sigma sin superponerse."], [
        "Rectosigmoide centrado y sin taparse con el colon superior.",
        "Superposición mínima del rectosigmoide.",
        "Zona lumbosacra y bario bien penetrados.",
      ]),
      notas: ["Exposición parecida a la de un perfil de pelvis. Puede hacerse tras la evacuación."],
      fuente: V2(191),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
