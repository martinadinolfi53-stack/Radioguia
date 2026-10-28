// Capítulo 18 · Aparato urinario (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 2, págs. 196-240).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// Solo las proyecciones; la preparación, los medios de contraste y la venopunción quedan fuera.
// DFRI: 122 cm, como indica la tabla de técnicas del capítulo (pág. 203).
// Parrilla: Bucky 16:1 en todas, según esa tabla.
// Tipo: R = proyección «fundamental» del resumen de proyecciones (pág. 196); E = el resto.

const DFRI = "122 cm";
const BUCKY = "Sí (Bucky, rejilla 16:1)";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida al final de la espiración", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const GONADAS = "Proteger las gónadas.";
const V2 = (...paginas) => ({ paginas, volumen: 2 });
const ESCALA = "Escala de contraste muy corta, que muestre claramente el contraste en riñones, uréteres y vejiga.";
const VEJIGA_CRIT = [
  "Extremos distales de los uréteres, vejiga y uretra proximal.",
  "Escala de contraste muy corta, que muestre bien el contraste en vejiga, uréteres distales y uretra proximal.",
];

export default {
  capitulo: 18,
  titulo: "Aparato urinario",
  paginas: "196-240",
  regiones: [
    { id: "urinario", nombre: "Aparato urinario", detalle: "Urografía" },
    { id: "vejiga", nombre: "Vejiga urinaria y uretra", detalle: "Cistografía y cistouretrografía" },
  ],
  proyecciones: [
    {
      id: "urinario-ap", region: "urinario", nombre: "AP de aparato urinario", categoria: ["AP"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI a la altura de las crestas ilíacas." },
      posicion: [
        "Paciente en decúbito supino (habitual para la preliminar y las postinyección), con apoyo bajo las rodillas.",
        "De pie o semisentado para ver la vejiga opacificada y la movilidad renal; Trendelenburg de 15-20° con RC perpendicular para los uréteres distales.",
        "Plano medio sagital en la línea media de la rejilla; brazos fuera del RI.",
        "RI centrado en las crestas ilíacas. Si el paciente es alto, otra placa de 24 × 30 cm transversal centrada 5 a 7,6 cm por encima del borde superior de la sínfisis.",
        "Compresión ureteral si está indicada.",
        GONADAS,
      ],
      criterios: crit(["Riñones, uréteres y vejiga con contraste."], [
        "Silueta completa de ambos riñones.",
        "Vejiga y sínfisis del pubis (si no entra, placa aparte de la vejiga).",
        "Sin movimiento.",
        ESCALA,
        "Dispositivos de compresión, si se usan, centrados sobre la parte alta del sacro.",
        "Columna centrada.",
        "Sin artefactos de la ropa interior.",
        "En varones mayores, la región prostática por debajo de la sínfisis.",
        "Marcador de tiempo.",
      ]),
      notas: ["El prono llena mejor los uréteres y la unión ureteropélvica (útil en hidronefrosis); el supino llena mejor los cálices posterosuperiores."],
      fuente: V2(218, 219),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "urinario-ap-oblicua", region: "urinario", nombre: "AP oblicua de aparato urinario (OPD u OPI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "Sí · 30° (OPD u OPI)" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI a la altura de las crestas ilíacas, unos 5 cm lateral a la línea media del lado elevado." },
      posicion: [
        "Paciente en decúbito supino, girado hasta que el plano medio coronal forme 30° con el RI.",
        "Hombros y caderas en el mismo plano, con apoyos bajo el lado elevado si hace falta; brazos fuera del aparato urinario.",
        "Columna centrada en la rejilla; RI en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Riñones, uréteres y vejiga; el riñón elevado queda paralelo al RI y el de abajo perpendicular."], [
        "Paciente girado unos 30°.",
        "Riñón alejado del RI sin superponerse a las vértebras.",
        "Riñón de abajo completo.",
        "Vejiga y uréteres distales en los 35 × 43 cm, si el tamaño lo permite.",
        "Marcador de tiempo.",
      ]),
      fuente: V2(220),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "urinario-lateral", region: "urinario", nombre: "Lateral de aparato urinario", categoria: ["Perfil"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, por el plano medio coronal a la altura de la cresta ilíaca." },
      posicion: [
        "Paciente acostado sobre el lado derecho o izquierdo, según se indique, con las rodillas flexionadas.",
        "Plano medio coronal en la línea media de la rejilla.",
        "Codos flexionados con las manos bajo la cabeza.",
        "RI centrado en las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Riñones, uréteres y vejiga; rotación o desplazamiento renal, calcificaciones y masas."], [
        "Todo el aparato urinario.",
        "Vejiga y sínfisis del pubis.",
        ESCALA,
        "Sin rotación (pelvis y vértebras lumbares).",
        "Marcador de tiempo.",
      ]),
      fuente: V2(221),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "urinario-lateral-decubito-dorsal", region: "urinario", nombre: "Lateral de aparato urinario en decúbito dorsal", categoria: ["Perfil", "Decúbitos"], tipo: "R",
      factores: f("35 × 43 cm", { parrilla: "Sí (rejilla vertical)", angulacion: "No · haz horizontal", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al centro del RI, por el plano medio coronal a la altura de las crestas ilíacas." },
      posicion: [
        "Paciente en supino sobre una camilla con el lado en estudio contra la rejilla vertical; ruedas bloqueadas.",
        "Brazos cruzados sobre el tórax o detrás de la cabeza; rodillas algo flexionadas.",
        "Eje largo del RI centrado en el plano medio coronal y crestas ilíacas en el centro del RI.",
        "Comprobar que no haya rotación.",
        GONADAS,
      ],
      criterios: crit(["Riñones y uréteres de perfil; útil para masas del flanco (intra o extraperitoneales) y desplazamientos anteriores."], [
        "Todo el aparato urinario.",
        "Vejiga y sínfisis del pubis.",
        ESCALA,
        "Sin rotación (pelvis y vértebras lumbares).",
        "Marcador de tiempo.",
        "Paciente elevado de modo que se vea todo el abdomen.",
      ]),
      fuente: V2(222),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "nefrotomografia-ap", region: "urinario", nombre: "AP de parénquima renal", metodo: "Nefrotomografía y nefrourografía", categoria: ["AP", "Métodos especiales"], tipo: "E",
      factores: f("Sin dato en el atlas", { parrilla: BUCKY, respiracion: "Sin dato en el atlas", angulacion: "No", rotacion: "No" }),
      rc: { direccion: "sin-dato", texto: "El atlas no lo detalla: AP de abdomen en fase arterial y luego tomografías del abdomen superior en fase nefrográfica (unos 5 minutos tras el contraste)." },
      posicion: [
        "Paciente en decúbito supino sobre una mesa de tomografía.",
        "Placa preliminar del abdomen para fijar la técnica y el nivel de los cortes.",
        "Tras el contraste (bolo o infusión), AP en fase arterial y varias tomografías en fase nefrográfica; estudios de los conductos a los 10, 20 y 30 minutos.",
        "Si hace falta, también tomografías oblicuas y laterales.",
      ],
      criterios: [],
      revision: "El atlas describe el procedimiento pero no da RI, RC, respiración ni criterios de evaluación para esta proyección.",
      fuente: V2(223, 224, 225),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "urografia-retrograda-ap", region: "urinario", nombre: "AP de sistema pelvicalicial y uréteres", metodo: "Urografía retrógrada", categoria: ["AP", "Métodos especiales"], tipo: "R",
      factores: f("35 × 43 cm, con L3 centrada en la rejilla", { parrilla: BUCKY, respiracion: "Pielografía: suspendida al final de la espiración · ureterografía: inspiración profunda y luego suspendida al final de una espiración completa", angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Al centro del RI, con L3 centrada en la rejilla." },
      posicion: [
        "Paciente en la mesa de cistoscopia en litotomía modificada (rodillas flexionadas sobre los estribos). Si la lordosis no se reduce, almohada bajo cabeza y hombros.",
        "Centrar L3 en la rejilla para incluir riñones y uréteres completos.",
        "Serie habitual de tres AP: preliminar con las sondas, pielografía (cabecera a veces 10-15° abajo) y ureterografía (cabecera a veces 35-40° arriba).",
        "A veces se agregan OPD u OPI, una lateral o laterales en decúbito.",
      ],
      criterios: [],
      revision: "El atlas no da un texto de rayo central ni criterios de evaluación para esta proyección; el RC se dedujo del centraje del RI.",
      fuente: V2(228, 229),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "vejiga-axial", region: "vejiga", nombre: "AP axial o PA axial de vejiga", categoria: ["Axiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "Sí · AP: 10 a 15° caudal (5° para cuello vesical y uretra) · PA: 10 a 15° cefálico (20 a 25° para la próstata)", rotacion: "No" }),
      rc: { direccion: "angulado", angulo: "10 a 15°", texto: "AP: 10-15° caudal, entrando 5 cm por encima del borde superior de la sínfisis (5° basta para cuello vesical y uretra; menos con más lordosis). PA: 10-15° cefálico, entrando 2,5 cm por debajo de la punta del cóccix y saliendo justo por encima de la sínfisis (20-25° para la próstata). Estudios miccionales: perpendicular a la sínfisis." },
      posicion: [
        "Paciente en decúbito supino (prono para zonas que no se ven bien en la AP axial).",
        "Plano medio sagital en la línea media de la rejilla; hombros y caderas equidistantes del RI; brazos fuera.",
        "En supino, piernas extendidas para que la lordosis incline el pubis hacia abajo y quede por debajo del cuello vesical.",
        "RI 5 cm por encima del borde superior de la sínfisis (en la sínfisis para estudios miccionales).",
      ],
      criterios: crit(["Vejiga con contraste (y uréteres distales si hay reflujo)."], [
        ...VEJIGA_CRIT,
        "Pubis proyectado por debajo del cuello vesical y la uretra proximal.",
      ]),
      notas: ["Trendelenburg de 15-20° con RC vertical despeja los uréteres distales y los orificios vesicoureterales."],
      fuente: V2(232, 233),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "vejiga-ap-oblicua", region: "vejiga", nombre: "AP oblicua de vejiga (OPD u OPI)", categoria: ["Oblicuas"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "No · opcional 10° caudal para cuello vesical y uretra", rotacion: "Sí · 40 a 60° (OPD u OPI)" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro del RI, 5 cm por encima del borde superior de la sínfisis y 5 cm medial a la EIAS elevada (10° caudal si interesan cuello vesical y uretra; perpendicular a la sínfisis en estudios miccionales)." },
      posicion: [
        "Paciente en decúbito supino, girado 40-60° a OPD u OPI según el médico.",
        "Arco pubiano más cercano a la mesa sobre la línea media de la rejilla.",
        "Muslo de arriba extendido y abducido para que no tape la vejiga.",
        "RI 5 cm por encima del borde superior de la sínfisis y 5 cm medial a la EIAS elevada (en la sínfisis para estudios miccionales).",
      ],
      criterios: crit(["Vejiga con contraste (y uréteres distales si hay reflujo)."], [
        ...VEJIGA_CRIT,
        "Pubis por debajo del cuello vesical y la uretra proximal.",
        "Vejiga sin el muslo de arriba encima.",
        "Miccionales: toda la uretra llena de contraste, superpuesta al muslo y por detrás de las ramas pubiana e isquiática del lado de abajo.",
      ]),
      fuente: V2(234, 235),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "vejiga-lateral", region: "vejiga", nombre: "Lateral de vejiga", categoria: ["Perfil"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, 5 cm por encima del borde superior de la sínfisis, en el plano medio coronal." },
      posicion: [
        "Paciente acostado sobre el lado derecho o izquierdo, con las rodillas algo flexionadas.",
        "Plano medio coronal en la línea media de la rejilla; codos flexionados y manos bajo la cabeza.",
        "RI 5 cm por encima del borde superior de la sínfisis, en el plano medio coronal.",
      ],
      criterios: crit(["Paredes anterior y posterior y base de la vejiga (uréteres distales si hay reflujo)."], [
        ...VEJIGA_CRIT,
        "Vejiga y uréteres distales visibles a través de la pelvis.",
        "Caderas y fémures superpuestos.",
      ]),
      fuente: V2(236),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cistouretrografia-masculina", region: "vejiga", nombre: "AP oblicua de cistouretrografía masculina (OPD u OPI)", categoria: ["Oblicuas", "Métodos especiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal, centrado en el borde superior de la sínfisis", { parrilla: BUCKY, respiracion: "Quieto a la señal del médico; se expone mientras sigue inyectando", angulacion: "No", rotacion: "Sí · 35 a 40° (OPD u OPI)" }),
      rc: { direccion: "sin-dato", texto: "El atlas no da el RC; el RI se centra en el borde superior de la sínfisis (raíz del pene), que abarca vejiga y meato." },
      posicion: [
        "Paciente supino en oblicua de 35-40°, con el pubis elevado centrado en la línea media de la rejilla, para ver el cuello vesical y toda la uretra sin hueso encima.",
        "Rodilla de abajo algo flexionada (partes blandas del muslo cerca del centro del RI); muslo de arriba extendido y retraído.",
        "El médico inyecta por el meato y extiende el pene sobre la cara inferomedial del muslo.",
        "Se puede llenar la vejiga para un estudio miccional sin cambiar de posición (o de pie frente a la rejilla vertical).",
      ],
      criterios: [["Estructuras que se muestran", ["Uretra prostática, membranosa y esponjosa con contraste."]]],
      revision: "El atlas no da rayo central ni criterios de evaluación para esta proyección.",
      fuente: V2(237),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cistouretrografia-femenina", region: "vejiga", nombre: "AP de cistouretrografía femenina", metodo: "Inyección", categoria: ["AP", "Métodos especiales"], tipo: "E",
      factores: f("18 × 24 cm o 24 × 30 cm, longitudinal, centrado en el borde superior de la sínfisis", { parrilla: BUCKY, respiracion: "Sin dato en el atlas", angulacion: "Sí · 5° caudal (evita superponer el cuello vesical)", rotacion: "No en la AP · Sí 35 a 40° en las oblicuas" }),
      rc: { direccion: "caudal", angulo: "5°", texto: "5° caudal, al borde superior de la sínfisis del pubis." },
      posicion: [
        "Paciente en decúbito supino (o semisentada elevando la cabecera para la AP miccional).",
        "RI centrado en el borde superior de la sínfisis.",
        "El médico inyecta con una jeringa de bellota contra el meato durante la exposición.",
        "Oblicuas: girar 35-40° para que la uretra quede por detrás de la sínfisis y abducir el muslo de arriba.",
        "Lateral miccional: acostada o de pie, con el RI en el borde superior de la sínfisis.",
      ],
      criterios: [["Estructuras que se muestran", ["Vejiga y uretra con contraste; en la técnica de cadena metálica, AP y laterales de pie en reposo y en esfuerzo."]]],
      revision: "El atlas no da criterios de evaluación ni respiración para esta proyección.",
      fuente: V2(238, 239, 240),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
