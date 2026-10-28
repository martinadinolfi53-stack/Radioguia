// Capítulo 20 · Cráneo (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 2, págs. 276-343).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// DFRI: 122 cm, como indica la tabla de técnicas del capítulo (pág. 299).
// Parrilla: Bucky 16:1 en cráneo, base, parte petromastoidea y conducto óptico, según esa tabla; el ojo se hace sin rejilla, como pide el texto.
// Tipo: R = proyección «fundamental» del resumen de proyecciones (pág. 276); E = el resto.

const DFRI = "122 cm";
const BUCKY = "Sí (Bucky, rejilla 16:1)";
const SIN_REJILLA = "No (sin rejilla, para menos magnificación y sin artefactos de mesa o rejilla)";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const V2 = (...paginas) => ({ paginas, volumen: 2 });
const LATERAL_CRIT = [
  "Cráneo completo, sin rotación ni inclinación.",
  "Techos orbitarios y alas mayores del esfenoides superpuestos.",
  "Mastoides y MAE superpuestos.",
  "ATM superpuestas.",
  "Silla turca de perfil.",
  "Región parietal bien penetrada.",
  "Columna cervical sin la mandíbula encima.",
];
const LATERAL_EST = ["Las dos mitades del cráneo superpuestas, con más detalle del lado cercano al RI; silla turca, clinoides anteriores y posteriores y dorso de la silla."];
const PA_CRIT = (sentido) => [
  "Perímetro craneal completo, con las tres tablas del hueso diferenciadas.",
  "Igual distancia del borde lateral del cráneo al borde lateral de la órbita en ambos lados.",
  "Rebordes petrosos simétricos.",
  `Pirámides petrosas en el tercio inferior de las órbitas con 15° ${sentido}, y llenando las órbitas con 0°.`,
  "Hueso frontal penetrado sin quemar los bordes laterales del cráneo.",
];
const PETRO_RI = "18 × 24 cm";

export default {
  capitulo: 20,
  titulo: "Cráneo",
  paginas: "276-343",
  regiones: [
    { id: "craneo", nombre: "Cráneo", detalle: "" },
    { id: "base-craneo", nombre: "Base del cráneo", detalle: "" },
    { id: "petromastoidea", nombre: "Parte petromastoidea", detalle: "Peñasco y mastoides" },
    { id: "optico", nombre: "Conducto y agujero ópticos", detalle: "" },
    { id: "ojo", nombre: "Ojo", detalle: "Cuerpos extraños" },
  ],
  proyecciones: [
    {
      id: "craneo-lateral", region: "craneo", nombre: "Lateral de cráneo", categoria: ["Perfil"], tipo: "R",
      factores: f("24 × 30 cm, transversal", { parrilla: BUCKY, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, entrando 5 cm por encima del MAE; RI centrado en el RC." },
      posicion: [
        "Paciente sentado erguido o semiprono (apoyado en el antebrazo y la rodilla flexionada del lado elevado).",
        "Lado de interés contra el RI; con una mano bajo la mandíbula y otra en el parietal, llevar la cabeza a lateral verdadero.",
        "Plano medio sagital paralelo al RI (apoyo bajo la mandíbula si cae).",
        "LIOM perpendicular al borde frontal del RI y paralela a su eje largo.",
        "Línea interpupilar perpendicular al RI; inmovilizar.",
      ],
      criterios: crit(LATERAL_EST, LATERAL_CRIT),
      fuente: V2(306, 307),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-lateral-decubito-dorsal", region: "craneo", nombre: "Lateral de cráneo en decúbito dorsal", categoria: ["Perfil", "Decúbitos"], tipo: "R",
      factores: f("24 × 30 cm, transversal", { parrilla: "Sí (rejilla vertical)", angulacion: "No · haz horizontal", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al RI, 5 cm por encima del MAE." },
      posicion: [
        "Paciente en supino con los hombros en el mismo plano horizontal; descartar antes lesión cervical.",
        "Lado de interés junto a la rejilla vertical; elevar la cabeza sobre una esponja radiotransparente hasta centrarla en el RI.",
        "Plano medio sagital vertical y línea interpupilar perpendicular al RI.",
      ],
      criterios: crit(LATERAL_EST, LATERAL_CRIT),
      notas: ["Robinson, Meares y Goree la recomiendan para ver el nivel en el seno esfenoidal, que puede ser la única pista de una fractura de base de cráneo."],
      fuente: V2(308, 309),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-lateral-supino", region: "craneo", nombre: "Lateral de cráneo en supino (cabeza girada)", categoria: ["Perfil"], tipo: "R",
      factores: f("24 × 30 cm, transversal", { parrilla: BUCKY, angulacion: "No", rotacion: "Sí · cabeza girada hacia el lado en estudio, con hombro y cadera contrarios elevados" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, entrando 5 cm por encima del MAE; RI centrado en el RC." },
      posicion: [
        "Paciente en supino o semisupino, con la cabeza girada hacia el lado a estudiar.",
        "Elevar y apoyar el hombro y la cadera contrarios hasta que el plano medio sagital quede paralelo y la línea interpupilar perpendicular al RI.",
        "Cabeza apoyada sobre una esponja radiotransparente.",
      ],
      criterios: crit(LATERAL_EST, LATERAL_CRIT),
      fuente: V2(308, 309),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-pa", region: "craneo", nombre: "PA de cráneo", categoria: ["PA"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, saliendo por el nasión (cuando interesa sobre todo el hueso frontal)." },
      posicion: [
        "Paciente en decúbito prono o sentado, con el plano medio sagital en la línea media de la rejilla.",
        "Frente y nariz apoyadas en la mesa o el bucky vertical; brazos cómodos.",
        "LOM perpendicular al RI (esponja bajo el mentón, o bajo la frente en obesos e hiperesténicos).",
        "Plano medio sagital perpendicular: bordes laterales de las órbitas o MAE a igual distancia de la mesa.",
        "Inmovilizar y centrar el RI en el nasión.",
      ],
      criterios: crit(["Las órbitas se llenan con las pirámides petrosas; celdillas etmoidales posteriores, crista galli, frontal y senos frontales; el dorso de la silla como una línea curva entre las órbitas."], PA_CRIT("caudal")),
      notas: ["Si no puede ponerse en prono, en decúbito lateral con rejilla vertical y RC horizontal (0° o 15° caudal) saliendo por el nasión."],
      fuente: V2(310, 312, 313),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-caldwell", region: "craneo", nombre: "PA axial de cráneo", metodo: "Caldwell", categoria: ["Axiales", "Métodos especiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "Sí · 15° caudal (20-25° para fisuras orbitarias superiores; 25-30° para agujeros redondos)", rotacion: "No" }),
      rc: { direccion: "caudal", angulo: "15°", texto: "15° caudal, saliendo por el nasión; RI centrado en el RC. Fisuras orbitarias superiores: 20-25° caudal por el centro de las órbitas. Agujeros redondos: 25-30° caudal al nasión." },
      posicion: [
        "Paciente en decúbito prono o sentado, con el plano medio sagital en la línea media de la rejilla.",
        "Frente y nariz apoyadas en la mesa o el bucky vertical.",
        "LOM perpendicular al RI; plano medio sagital perpendicular (órbitas o MAE a igual distancia de la mesa).",
        "Inmovilizar y centrar el RI en el nasión.",
      ],
      criterios: crit(["Como la PA, pero con los rebordes petrosos en el tercio inferior de las órbitas; también las celdillas etmoidales anteriores."], PA_CRIT("caudal")),
      notas: ["Schüller, el primero en describirla, recomendaba 25° caudal."],
      fuente: V2(310, 311, 312, 313),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-ap", region: "craneo", nombre: "AP de cráneo", categoria: ["AP"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular; RI centrado en el RC." },
      posicion: [
        "Para cuando no se puede hacer la PA: paciente en decúbito supino con el plano medio sagital centrado en la rejilla.",
        "Plano medio sagital y LOM perpendiculares al RI.",
      ],
      criterios: crit(["Las mismas estructuras que la PA, con las órbitas bastante magnificadas (más DORI)."], PA_CRIT("cefálico")),
      fuente: V2(314, 315),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-ap-axial", region: "craneo", nombre: "AP axial de cráneo", categoria: ["Axiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "Sí · 15° cefálico", rotacion: "No" }),
      rc: { direccion: "cefálico", angulo: "15°", texto: "15° cefálico dirigido al nasión; RI centrado en el RC." },
      posicion: [
        "Paciente en decúbito supino con el plano medio sagital centrado en la rejilla.",
        "Plano medio sagital y LOM perpendiculares al RI.",
      ],
      criterios: crit(["Equivalente a la Caldwell, con las órbitas magnificadas."], PA_CRIT("cefálico")),
      fuente: V2(314, 315),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-towne", region: "craneo", nombre: "AP axial de cráneo", metodo: "Towne", categoria: ["Axiales", "Métodos especiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "Sí · 30° caudal con la LOM (37° con la LIOM)", rotacion: "No" }),
      rc: { direccion: "caudal", angulo: "30°", texto: "30° caudal respecto de la LOM (37° si se usa la LIOM), a través del agujero magno; entra unos 6,3 cm por encima de la glabela y pasa por el nivel de los MAE." },
      posicion: [
        "Paciente en supino o sentado (mejor sentado en hiperesténicos u obesos), con el plano medio sagital en la línea media de la rejilla y los hombros nivelados.",
        "Plano medio sagital perpendicular a la línea media del RI.",
        "Flexionar el cuello hasta que la LOM quede perpendicular al RI; si no se puede, poner la LIOM perpendicular y sumar 7° al RC.",
        "Borde superior del RI a la altura del vértex (el centro queda cerca del agujero magno); para una imagen localizada de dorso de la silla y peñascos, centrar en el plano oclusal o algo por debajo.",
        "Inmovilizar.",
      ],
      criterios: crit(["Peñascos simétricos, parte posterior del agujero magno con el dorso de la silla y las clinoides posteriores dentro, occipital y parietales posteriores."], [
        "Igual distancia del borde lateral del cráneo al borde del agujero magno en ambos lados (sin rotación).",
        "Pirámides petrosas simétricas.",
        "Dorso de la silla y clinoides posteriores dentro del agujero magno.",
        "Occipital penetrado sin quemar los bordes laterales del cráneo.",
      ]),
      notas: [
        "Para ver todo el agujero magno, subir el ángulo caudal con la LOM a 40-60°.",
        "En decúbito lateral (cifosis marcada, trauma), rejilla vertical detrás del occipucio y RC horizontal a 30° caudal con la LOM.",
        "Si no se puede acercar el cráneo al RI, hacer la PA axial de Haas.",
      ],
      fuente: V2(316, 317, 318, 320),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "craneo-haas", region: "craneo", nombre: "PA axial de cráneo", metodo: "Haas", categoria: ["Axiales", "Métodos especiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal (18 × 24 cm para la silla o los peñascos)", { parrilla: BUCKY, angulacion: "Sí · 25° cefálico con la LOM", rotacion: "No" }),
      rc: { direccion: "cefálico", angulo: "25°", texto: "25° cefálico respecto de la LOM, entrando 3,8 cm por debajo del inión y saliendo unos 3,8 cm por encima del nasión." },
      posicion: [
        "Paciente en decúbito prono o sentado, con el plano medio sagital en la línea media de la rejilla y los hombros nivelados.",
        "Frente y nariz apoyadas en la mesa, con el plano medio sagital perpendicular.",
        "LOM perpendicular al RI; inmovilizar.",
        "Para una imagen localizada de la silla o los peñascos, centrar el RI con el RC; subirlo unos 7,6 cm para incluir el vértex.",
      ],
      criterios: crit(["Región occipital con peñascos simétricos y dorso de la silla y clinoides posteriores dentro del agujero magno."], [
        "Dorso de la silla y clinoides posteriores dentro del agujero magno.",
        "Igual distancia del borde lateral del cráneo al borde del agujero magno en ambos lados (sin rotación).",
        "Pirámides petrosas simétricas.",
        "Cráneo completo.",
      ]),
      notas: ["Para hiperesténicos, obesos o pacientes que no pueden hacer la Towne; es la inversa y da un resultado comparable."],
      fuente: V2(322, 323),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "base-craneo-smv", region: "base-craneo", nombre: "Submentovertical (SMV) de base de cráneo", metodo: "Schüller", categoria: ["Axiales", "Métodos especiales"], tipo: "E",
      factores: f("24 × 30 cm, longitudinal, paralelo a la LIOM", { parrilla: BUCKY, angulacion: "No · RC perpendicular a la LIOM", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a la LIOM a través de la silla turca: entra en el plano medio sagital de la garganta entre los ángulos mandibulares y pasa 1,9 cm por delante de los MAE." },
      posicion: [
        "Paciente sentado (más cómodo, algo alejado de la rejilla vertical) o en supino con el tórax elevado para que la cabeza apoye en el vértex; rodillas flexionadas.",
        "Plano medio sagital en la línea media de la rejilla.",
        "Extender el cuello todo lo posible hasta que la LIOM quede lo más paralela posible al RI.",
        "Plano medio sagital perpendicular al RI; hombros nivelados.",
        "Inmovilizar (cinta acolchada sobre el mentón si no hay sujeción) y no dejarlo en la posición más de lo necesario.",
      ],
      criterios: crit(["Peñascos, mastoides, agujeros oval y espinoso, conductos carotídeos, senos esfenoidal y etmoidal, mandíbula, tabique nasal, odontoides y occipital."], [
        "Base del cráneo bien penetrada.",
        "Igual distancia del borde lateral del cráneo a los cóndilos mandibulares (sin inclinación).",
        "Mentón superpuesto al frontal anterior (cuello bien extendido).",
        "Cóndilos mandibulares por delante de las pirámides petrosas.",
        "Peñascos simétricos.",
      ]),
      notas: ["En supino puede subir la presión intracraneal: el paciente puede marearse al incorporarse."],
      fuente: V2(324, 325),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "petromastoidea-law", region: "petromastoidea", nombre: "Axiolateral oblicua de parte petromastoidea", metodo: "Law modificado", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: f(PETRO_RI, { parrilla: BUCKY, angulacion: "Sí · 15° caudal", rotacion: "Sí · cabeza girada 15° hacia el RI" }),
      rc: { direccion: "caudal", angulo: "15°", texto: "15° caudal al centro de la rejilla, saliendo por la mastoides de abajo (2,5 cm por detrás del MAE); entra unos 5 cm por detrás y 5 cm por encima del MAE de arriba." },
      posicion: [
        "Paciente en decúbito prono o sentado frente a la rejilla vertical.",
        "Orejas dobladas hacia adelante con una tira de cinta.",
        "Cabeza en lateral con el lado afectado contra el RI; LIOM paralela y línea interpupilar perpendicular al RI.",
        "Girar la cabeza hacia el RI hasta que el plano medio sagital forme 15° (comprobar con transportador); inmovilizar.",
      ],
      criterios: crit(["Celdillas mastoideas, parte lateral del peñasco, MAI y MAE superpuestos."], [
        "Mastoides cercana al RI con las celdillas centradas; la opuesta por debajo y algo por delante, sin taparla.",
        "Pabellón auricular fuera de la mastoides.",
        "MAI y MAE superpuestos.",
        "ATM visible por delante de la mastoides.",
        "Haz colimado a la región mastoidea.",
      ]),
      fuente: V2(328, 329),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "petromastoidea-stenvers", region: "petromastoidea", nombre: "Axiolateral oblicua de parte petromastoidea (perfil posterior)", metodo: "Stenvers", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: f(PETRO_RI, { parrilla: BUCKY, angulacion: "Sí · 12° cefálico", rotacion: "Sí · plano medio sagital a 45° del RI (menos en braquicéfalos, más en dolicocéfalos)" }),
      rc: { direccion: "cefálico", angulo: "12°", texto: "12° cefálico; entra 7,6-10 cm por detrás y 1,3 cm por debajo del MAE de arriba y sale unos 2,5 cm por delante del MAE de abajo." },
      posicion: [
        "Paciente en decúbito prono o sentado frente a la rejilla vertical.",
        "Cabeza apoyada en frente, nariz y mejilla, con el lado a estudiar más cerca del RI.",
        "LIOM paralela al eje transversal del RI.",
        "Plano medio sagital a 45° del RI (con transportador); inmovilizar.",
      ],
      criterios: crit(["Peñasco cercano al RI de perfil: reborde petroso, celdillas y antro mastoideo, caja timpánica, laberinto, conducto auditivo interno y vértice del peñasco."], [
        "Parte petromastoidea de perfil sin distorsión.",
        "Desde el borde lateral del cráneo hasta el borde lateral de la órbita.",
        "Reborde petroso hasta unos dos tercios de la altura del borde lateral de la órbita.",
        "Mastoides de perfil por debajo del borde del cráneo.",
        "Borde posterior de la rama mandibular sobre el borde lateral de la columna cervical.",
        "Haz colimado al peñasco y la mastoides.",
      ]),
      fuente: V2(330, 331),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "petromastoidea-arcelin", region: "petromastoidea", nombre: "Axiolateral oblicua de parte petromastoidea (perfil anterior)", metodo: "Arcelin", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: f(PETRO_RI, { parrilla: BUCKY, angulacion: "Sí · 10° caudal", rotacion: "Sí · cara girada al lado contrario, plano medio sagital a 45° del RI" }),
      rc: { direccion: "caudal", angulo: "10°", texto: "10° caudal, entrando por la sien unos 2,5 cm por delante y 1,9 cm por encima del MAE." },
      posicion: [
        "Paciente en decúbito supino con el plano medio sagital en la línea media de la mesa.",
        "Girar la cara hacia el lado contrario al estudiado hasta que el plano medio sagital forme 45° con el RI.",
        "LIOM perpendicular al RI; inmovilizar.",
      ],
      criterios: crit(["Peñasco alejado del RI de perfil (inversa de Stenvers, más magnificada)."], [
        "Parte petromastoidea de perfil.",
        "Desde el borde lateral del cráneo hasta el borde lateral de la órbita.",
        "Reborde petroso horizontal, a unos dos tercios de la altura del borde lateral de la órbita.",
        "Mastoides de perfil por debajo del borde del cráneo.",
        "Rama mandibular paralela a la cara lateral de las cervicales; cóndilo sobre el atlas cerca del peñasco.",
        "Haz colimado al peñasco y la mastoides.",
      ]),
      notas: ["Útil en niños y en adultos que no pueden ponerse en prono ni sentarse para la Stenvers."],
      fuente: V2(332, 333),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "optico-rhese", region: "optico", nombre: "Parietoorbitaria oblicua de conducto y agujero ópticos", metodo: "Rhese", categoria: ["Oblicuas", "Métodos especiales"], tipo: "R",
      factores: f("18 × 24 cm", { parrilla: BUCKY, angulacion: "No", rotacion: "Sí · plano medio sagital a 53° del RI" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, entrando unos 2,5 cm por encima y por detrás del RAS de arriba y saliendo por la órbita apoyada; colimar estrecho a esa órbita." },
      posicion: [
        "Paciente semiprono o sentado, con los hombros nivelados.",
        "Órbita afectada centrada en la mitad libre del RI, con pómulo, nariz y mentón apoyados.",
        "LCM perpendicular al RI.",
        "Plano medio sagital a 53° del RI (con transportador); inmovilizar.",
      ],
      criterios: crit(["Conducto óptico «de punta» y agujero óptico en el cuadrante inferolateral de la órbita; también senos etmoidal, esfenoidal y frontal."], [
        "Conducto y agujero ópticos al final del reborde esfenoidal, en el cuadrante inferolateral de la órbita.",
        "Reborde orbitario completo.",
        "Bordes supraorbitarios en la misma horizontal.",
        "Haz colimado a la región orbitaria.",
      ]),
      notas: ["Un desvío lateral del agujero indica mala rotación; uno longitudinal, mala angulación de la LCM. Comparar ambos lados."],
      fuente: V2(336, 337),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ojo-lateral", region: "ojo", nombre: "Lateral de ojo (cuerpos extraños)", categoria: ["Perfil"], tipo: "E",
      factores: f("Sin dato en el atlas; centrado en el canto externo", { parrilla: SIN_REJILLA, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a través del canto externo; el paciente mira al frente." },
      posicion: [
        "Paciente semiprono o sentado, con el canto externo del ojo afectado contra el centro del RI.",
        "Plano sagital paralelo y línea interpupilar perpendicular al RI.",
      ],
      criterios: crit(["Órbita y ojo para localizar cuerpos extraños."], [
        "Densidad y contraste óptimos para la órbita y el ojo.",
        "Techos orbitarios superpuestos.",
        "Haz colimado y centrado en la órbita.",
      ]),
      fuente: V2(340, 341),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ojo-pa-axial", region: "ojo", nombre: "PA axial de ojo (cuerpos extraños)", categoria: ["Axiales"], tipo: "E",
      factores: f("Sin dato en el atlas; centrado 1,9 cm por debajo del nasión", { parrilla: SIN_REJILLA, angulacion: "Sí · 30° caudal", rotacion: "No" }),
      rc: { direccion: "caudal", angulo: "30°", texto: "30° caudal a través del centro de las órbitas (proyecta los peñascos por debajo de las órbitas); ojos cerrados e inmóviles." },
      posicion: [
        "Frente y nariz apoyadas en el portachasis; RI centrado 1,9 cm por debajo del nasión.",
        "Plano medio sagital y LOM perpendiculares al RI.",
      ],
      criterios: crit(["Órbitas libres de los peñascos para localizar cuerpos extraños."], [
        "Pirámides petrosas por debajo de las órbitas.",
        "Cráneo sin rotación.",
        "Haz colimado y centrado en la órbita.",
      ]),
      fuente: V2(342),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ojo-waters-modificado", region: "ojo", nombre: "Parietocantal de ojo (cuerpos extraños)", metodo: "Waters modificado", categoria: ["Métodos especiales"], tipo: "E",
      factores: f("Sin dato en el atlas; centrado en el centro de las órbitas", { parrilla: SIN_REJILLA, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a través del centro de las órbitas; ojos cerrados e inmóviles." },
      posicion: [
        "Mentón apoyado en el portachasis, con el RI centrado en el centro de las órbitas.",
        "Plano medio sagital perpendicular al RI.",
        "Cuello extendido hasta que la LOM forme 50° con el RI.",
      ],
      criterios: crit(["Órbitas libres de los peñascos para localizar cuerpos extraños."], [
        "Pirámides petrosas bien por debajo de las órbitas.",
        "Órbitas simétricas (sin rotación).",
        "Haz colimado y centrado en la órbita.",
      ]),
      fuente: V2(343),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
