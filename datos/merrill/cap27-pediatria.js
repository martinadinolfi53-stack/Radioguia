// Capítulo 27 · Diagnóstico por imagen en pediatría (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 3, págs. 165-212).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// Este capítulo no tiene tabla «Resumen de proyecciones» ni tabla de técnicas: las fichas salen de «Exploraciones más frecuentes»
// y «Exploraciones propias de pacientes pediátricos» (págs. 182-205). Por eso todas son tipo E y la DFRI, el RI y la parrilla
// figuran como «Sin dato en el atlas» salvo donde el texto los da.
// Quedan fuera los procedimientos con radioscopia (digestivos, CUMS, UIV): el atlas describe la inmovilización pero no proyecciones.

const SIN = "Sin dato en el atlas";
const f = (ri, extra = {}) => ({ ri, dfri: SIN, parrilla: SIN, respiracion: "Suspendida", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const V3 = (...paginas) => ({ paginas, volumen: 3 });
const INSPIRA = "Inspiración máxima: disparar al final del llanto o al ver expandirse el abdomen";
const PANAL = "Quitar el pañal por completo: produce artefactos, sobre todo si está mojado.";
const TORAX_CRIT = [
  "Estructuras de la línea media (esternón, vía aérea y cuerpos vertebrales) superpuestas: sin rotación.",
  "9 o 10 costillas posteriores por encima del diafragma (buena inspiración).",
  "Espacios discales visibles a través del corazón y marcas pulmonares periféricas visibles.",
];
const TORAX_EST = ["Vía aérea (tráquea) hasta los ángulos costofrénicos, corazón, vértices, bases y mediastino."];
const COLIMA_TORAX = "Colimar desde las puntas de las mastoides hasta justo por encima de las crestas ilíacas (vía aérea alta y bordes costales inferiores).";
const CRANEO_NOTA = "Consejo del atlas: en niños pequeños, restar 5° a las angulaciones de cráneo del adulto (cap. 20). La LOM y la LIOM están separadas unos 15°.";
const CRANEO_INMO = "Hasta los 3 años (si no está dormido): envolver con el método del «conejito» y usar pinzas para la cabeza («orejeras»).";
const EXT_INMO = [
  "Recién nacido a 2 años: envolver con la sábana (variante del «conejito») y una banda de velcro; mano con plexiglás y «sujetalibros»; en el miembro inferior, saco de arena sobre la pierna sana.",
  "Preescolar: sentado en el regazo del padre (miembro superior) o sentado/acostado en la mesa con velcro (miembro inferior).",
  "Edad escolar: como el adulto.",
];

export default {
  capitulo: 27,
  titulo: "Pediatría",
  paginas: "165-212",
  regiones: [
    { id: "ped-torax", nombre: "Tórax pediátrico", detalle: "" },
    { id: "ped-cadera", nombre: "Caderas y pelvis pediátricas", detalle: "" },
    { id: "ped-craneo", nombre: "Cráneo pediátrico", detalle: "" },
    { id: "ped-extremidades", nombre: "Extremidades pediátricas", detalle: "" },
    { id: "ped-abdomen", nombre: "Abdomen pediátrico", detalle: "" },
    { id: "ped-escoliosis", nombre: "Escoliosis", detalle: "" },
    { id: "ped-especiales", nombre: "Edad ósea y cuerpos extraños", detalle: "" },
  ],
  proyecciones: [
    {
      id: "ped-torax-pa-pigg", region: "ped-torax", nombre: "PA de tórax en el Pigg-o-stat (recién nacido a 3 años)", categoria: ["PA"], tipo: "E",
      factores: f(SIN, { respiracion: INSPIRA, angulacion: "No", rotacion: "No · sentado erguido, sin rotación" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI a la altura de T6-T7." },
      posicion: [
        "Desvestido de la cintura para arriba.",
        "Sentado en el asiento del Pigg-o-stat, con los brazos levantados rectos sobre la cabeza dentro de los soportes del tamaño adecuado.",
        "Ajustar la altura del asiento hasta que la cara encaje en la zona recortada de los soportes.",
        "RI sujeto en el soporte extensible de metal.",
        COLIMA_TORAX,
      ],
      criterios: crit(TORAX_EST, TORAX_CRIT),
      notas: ["El asiento, los soportes y la base giran juntos para pasar de PA a lateral sin mover al niño.", "kVp de referencia del atlas para PA pediátrica: 80-90 (en el adulto, 110-130)."],
      fuente: V3(182, 183, 185, 186),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-torax-lat-pigg", region: "ped-torax", nombre: "Lateral de tórax en el Pigg-o-stat (recién nacido a 3 años)", categoria: ["Perfil"], tipo: "E",
      factores: f(SIN, { respiracion: INSPIRA, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI a la altura de T6-T7." },
      posicion: [
        "Igual que la PA: sentado en el Pigg-o-stat, brazos arriba dentro de los soportes.",
        "Girar el conjunto (asiento, soportes y base) 90° para quedar de perfil al RI.",
        COLIMA_TORAX,
      ],
      criterios: crit(["Vía aérea hasta las bases, corazón, vértices y espacio retrocardíaco."], [
        "Costillas posteriores superpuestas y apófisis espinosas de perfil (sin rotación).",
        "Desde las apófisis espinosas hasta el esternón.",
      ]),
      fuente: V3(182, 183, 186),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-torax-pa-sentado", region: "ped-torax", nombre: "PA de tórax sentado (3 a 18 años)", categoria: ["PA"], tipo: "E",
      factores: f(SIN, { respiracion: "Inspiración máxima", angulacion: "No", rotacion: "No · sin rotación" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI a la altura de T6-T7." },
      posicion: [
        "Sentado en un cajón grande de madera, un carro con frenos o un taburete, con el RI en un soporte extensible de metal.",
        "El niño queda entre los soportes laterales, con la barbilla apoyada en el borde superior del RI o cerca.",
        "Sentado se evita que se mueva de la cintura para abajo.",
        COLIMA_TORAX,
      ],
      criterios: crit(TORAX_EST, TORAX_CRIT),
      fuente: V3(184, 185),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-torax-lat-sentado", region: "ped-torax", nombre: "Lateral de tórax sentado (3 a 18 años)", categoria: ["Perfil"], tipo: "E",
      factores: f(SIN, { respiracion: "Inspiración máxima", angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI a la altura de T6-T7." },
      posicion: [
        "Sentado como en la PA, de perfil al RI.",
        "El padre (si está permitido) le levanta los brazos por encima de la cabeza y le sujeta la cabeza entre los brazos.",
        COLIMA_TORAX,
      ],
      criterios: crit(["Vía aérea hasta las bases, corazón, vértices y espacio retrocardíaco."], [
        "Costillas posteriores superpuestas y apófisis espinosas de perfil (sin rotación).",
      ]),
      fuente: V3(184, 186),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-torax-lat-transversal", region: "ped-torax", nombre: "Lateral transversal de tórax en decúbito supino", categoria: ["Perfil", "Decúbitos"], tipo: "E",
      factores: f(SIN, { respiracion: INSPIRA, angulacion: "No · haz horizontal", rotacion: "No · decúbito supino" }),
      rc: { direccion: "horizontal", texto: "Horizontal, lateral, a la altura de T6-T7." },
      posicion: [
        "Decúbito supino sobre la mesa, elevado sobre una esponja, con los brazos por encima de la cabeza.",
        "Velcro alrededor de las rodillas y otra tira sobre las piernas.",
        "RI vertical al costado para que el haz entre en lateral horizontal.",
      ],
      criterios: crit(TORAX_EST, []),
      notas: ["Útil con tubos torácicos o de gastrostomía, o tejidos blandos que los soportes del Pigg-o-stat podrían comprometer."],
      revision: "El atlas describe la inmovilización pero no da RC ni criterios propios para esta proyección; se tomó el centraje de T6-T7 de las demás de tórax.",
      fuente: V3(185),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-pelvis-ap", region: "ped-cadera", nombre: "AP de caderas y pelvis", categoria: ["AP"], tipo: "E",
      factores: f(SIN, { angulacion: "No", rotacion: "No · EIAS equidistantes de la mesa" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, en la línea media, a mitad de camino entre la EIAS y la sínfisis del pubis (el borde superior de la sínfisis está a la altura del trocánter mayor)." },
      posicion: [
        PANAL,
        "Decúbito supino, posición simétrica; esponjas para compensar la rotación si hay dolor.",
        "Inmovilizar según el niño: velcro sobre las piernas; si es activo, velcro alrededor de las rodillas y sacos de arena sobre los brazos; si se los saca, el padre sujeta los húmeros con los pulgares sobre los hombros.",
        "Protección gonadal: siempre en varones (borde superior 1 cm por debajo del trocánter, apoyada en una esponja a 15°). En niñas, en todas salvo la primera AP de la exploración inicial, cubriendo sacro y sacroilíacas sin tapar caderas ni sínfisis.",
        "Nunca tocar la sínfisis del pubis.",
      ],
      criterios: crit(["Desde las crestas ilíacas hasta el cuarto superior de los fémures."], [
        "Estructuras de la línea media en la línea media e ilíacos simétricos.",
        "Pliegues cutáneos simétricos.",
        "Patrón trabecular visible en las articulaciones de la cadera sin perder los tejidos blandos.",
      ]),
      notas: ["Se exploran ambas caderas con la misma proyección para comparar (Perthes, displasia, dolor inespecífico)."],
      fuente: V3(187, 188, 189, 186),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-pelvis-ancas-rana", region: "ped-cadera", nombre: "Caderas en «ancas de rana»", metodo: "Lauenstein", categoria: ["Perfil", "Métodos especiales"], tipo: "E",
      factores: f(SIN, { angulacion: "No", rotacion: "No · EIAS equidistantes; muslos en abducción y rotación externa" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, en la línea media, a mitad de camino entre la EIAS y la sínfisis del pubis." },
      posicion: [
        PANAL,
        "Decúbito supino con ambos muslos en abducción y rotación externa (imagen coronal de la pelvis).",
        "Apoyar siempre los muslos con esponjas para evitar el movimiento.",
        "Inmovilización y protección gonadal como en la AP.",
      ],
      criterios: crit(["Desde las crestas ilíacas hasta el cuarto superior de los fémures."], [
        "Posición simétrica de ambos lados.",
        "Patrón trabecular visible sin perder los tejidos blandos.",
      ]),
      notas: ["La técnica completa de Lauenstein está en el capítulo 7."],
      fuente: V3(187, 188, 189),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-craneo-pa", region: "ped-craneo", nombre: "PA de cráneo", categoria: ["PA", "Axiales"], tipo: "E",
      factores: f(SIN, { angulacion: "Sí · 10-15° caudal en lactantes y niños pequeños (15-20° en niños mayores)", rotacion: "No · sin rotación" }),
      rc: { direccion: "caudal", angulo: "10-15°", texto: "Con la LOM perpendicular a la mesa, 10-15° caudal en lactantes y niños pequeños para proyectar las crestas petrosas en el tercio inferior de las órbitas." },
      posicion: [CRANEO_INMO, "LOM perpendicular a la mesa."],
      criterios: crit(["Cráneo en PA."], ["Crestas petrosas en el tercio inferior de las órbitas."]),
      notas: [CRANEO_NOTA, "Tomar la primera imagen como localizadora y revisarla antes de seguir: la densidad ósea varía con la edad y las anomalías congénitas."],
      fuente: V3(190, 192, 193),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-craneo-ap", region: "ped-craneo", nombre: "AP de cráneo", categoria: ["AP"], tipo: "E",
      factores: f(SIN, { angulacion: "Sí · 15° cefálico con la LOM perpendicular; No si se pone la LIOM perpendicular", rotacion: "No · sin rotación" }),
      rc: { direccion: "cefálico", angulo: "15°", texto: "Con la LOM perpendicular a la mesa, 15° cefálico. Si se coloca la LIOM perpendicular (postura cómoda), el RC va perpendicular sin angular." },
      posicion: [
        CRANEO_INMO,
        "Opción cómoda: LIOM perpendicular a la mesa, con la frente y la barbilla paralelas al RI; el niño cómodo se queda más quieto.",
        "El chupete puede quedar en la boca en todas las imágenes salvo en esta AP «inversa».",
      ],
      criterios: crit(["Cráneo en AP."], ["Crestas petrosas en el tercio inferior de las órbitas."]),
      notas: [CRANEO_NOTA],
      fuente: V3(190, 192, 193),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-craneo-towne", region: "ped-craneo", nombre: "AP axial de cráneo", metodo: "Towne", categoria: ["Axiales", "Métodos especiales"], tipo: "E",
      factores: f(SIN, { angulacion: "Sí · la del adulto (cap. 20) menos 5°", rotacion: "No · sin rotación" }),
      rc: { direccion: "caudal", angulo: "Adulto menos 5°", texto: "Caudal, con la angulación del Towne del adulto (cap. 20) reducida 5° en niños pequeños." },
      posicion: [CRANEO_INMO, "Envolver sin dejar sábana enrollada en hombros y cuello (produce artefactos en la frontooccipital)."],
      criterios: crit(["Cráneo en AP axial."], []),
      notas: [CRANEO_NOTA, "Forma parte de la rutina neurológica y de la traumatológica (tabla 27-2)."],
      revision: "El atlas incluye el Towne en las rutinas pero no lo describe en el capítulo; el ángulo se dedujo del consejo de restar 5°.",
      fuente: V3(191, 192, 194),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-craneo-lat-vertical", region: "ped-craneo", nombre: "Lateral de cráneo con haz vertical (rutina neurológica)", categoria: ["Perfil"], tipo: "E",
      factores: f(SIN, { angulacion: "No", rotacion: "Sí · cabeza girada a lateral" }),
      rc: { direccion: "perpendicular", texto: "Vertical, perpendicular al RI." },
      posicion: [
        CRANEO_INMO,
        "Si nada más funciona, una segunda banda de velcro sobre la cabeza girada.",
        "Girar la cabeza y poner el velcro como últimos pasos, con la colimación ya revisada; el padre le habla de cerca mientras se dispara.",
      ],
      criterios: crit(["Cráneo en lateral."], []),
      notas: ["Si el niño se durmió de espaldas con la cabeza de lado, puede no necesitar pinzas."],
      revision: "El atlas no da RC ni criterios para esta proyección en el capítulo.",
      fuente: V3(192, 194),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-craneo-lat-transversal", region: "ped-craneo", nombre: "Lateral de cráneo con haz horizontal (rutina traumatológica)", categoria: ["Perfil", "Decúbitos"], tipo: "E",
      factores: f(SIN, { angulacion: "No · haz horizontal", rotacion: "No · decúbito supino" }),
      rc: { direccion: "horizontal", texto: "Horizontal (proyección transversal)." },
      posicion: [
        CRANEO_INMO,
        "Decúbito supino con el inmovilizador de cabeza y cuello del lactante.",
        "RI vertical al costado de la cabeza.",
      ],
      criterios: crit(["Cráneo en lateral sin rotar, con la parte superior de la columna cervical."], ["Niveles hidroaéreos postraumáticos, si los hay."]),
      revision: "El atlas no da un texto de rayo central para esta proyección.",
      fuente: V3(194, 195),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-craneo-smv", region: "ped-craneo", nombre: "Submentovertical de cráneo (rutina neurológica)", categoria: ["Axiales"], tipo: "E",
      factores: f(SIN, { angulacion: "No · como en el adulto (cap. 20)", rotacion: "No · cabeza en hiperextensión" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo; remite a la técnica del adulto (cap. 20)." },
      posicion: [
        CRANEO_INMO,
        "Cuello en extensión, mantenida con cinta sobre la frente (con la cara adherente hacia afuera).",
        "Envolver sin sábana enrollada en hombros y cuello: produce artefactos en la submentovertical.",
      ],
      criterios: crit(["Base del cráneo."], []),
      revision: "El atlas solo muestra la inmovilización (fig. 27-32); no da RC ni criterios.",
      fuente: V3(191, 194, 195),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-extremidad-superior", region: "ped-extremidades", nombre: "Extremidad superior (AP/PA y lateral)", categoria: ["AP", "Perfil"], tipo: "E",
      factores: f(SIN, { respiracion: "No aplica", angulacion: "No", rotacion: "No · las AP y laterales no deben verse oblicuas" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo; mismas proyecciones que en el adulto." },
      posicion: [...EXT_INMO.slice(0, 2), EXT_INMO[2], "Proteger timo, esternón y mamas con un delantal de plomo pequeño.", "Si hay fractura evidente, entablillar antes de empezar; se puede hacer en la camilla."],
      criterios: crit(["Hueso, músculo y tejidos blandos; articulaciones por encima y por debajo de la lesión."], [
        "Patrón trabecular visible y tejidos blandos (placas de crecimiento).",
        "Las AP y laterales no se ven oblicuas.",
      ]),
      notas: ["Con frecuencia se pide la extremidad contralateral para comparar las líneas epifisarias (fracturas de Salter-Harris).", "Usar un sistema de imagen de la mitad de velocidad que el de columna y abdomen."],
      fuente: V3(186, 196, 197, 198, 199),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-extremidad-inferior", region: "ped-extremidades", nombre: "Extremidad inferior (AP y lateral)", categoria: ["AP", "Perfil"], tipo: "E",
      factores: f(SIN, { respiracion: "No aplica", angulacion: "No", rotacion: "No · las AP y laterales no deben verse oblicuas" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo; mismas proyecciones que en el adulto." },
      posicion: [
        "Recién nacido a 2 años (el mayor reto): ambos brazos envueltos en la sábana, velcro sobre el abdomen y saco de arena grande sobre la pierna sana; el padre sujeta la extremidad con la colimación ajustada.",
        EXT_INMO[1],
        "Que no se caiga de la mesa: el padre al lado si está sentado, velcro si está acostado.",
        EXT_INMO[2],
      ],
      criterios: crit(["Hueso, músculo y tejidos blandos; articulaciones por encima y por debajo de la lesión."], [
        "Patrón trabecular visible y tejidos blandos (placas de crecimiento).",
        "Las AP y laterales no se ven oblicuas.",
      ]),
      notas: ["Con frecuencia se pide la extremidad contralateral para comparar las líneas epifisarias."],
      fuente: V3(186, 196, 197, 198, 199),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-abdomen-supino", region: "ped-abdomen", nombre: "AP de abdomen en decúbito supino", categoria: ["AP"], tipo: "E",
      factores: f(SIN, { respiracion: "Suspendida", angulacion: "No", rotacion: "No · sin rotación" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, en la línea media, a la altura de L2." },
      posicion: [
        PANAL,
        "Inmovilizar como para caderas y pelvis (velcro, sacos de arena, padre sujetando los húmeros).",
        "Protección gonadal en todos los varones.",
      ],
      criterios: crit(["Diafragma, hígado, riñones, columna y gases intestinales."], [
        "Ambos hemidiafragmas, sínfisis del pubis y bordes cutáneos derecho e izquierdo.",
        "Tejidos blandos por encima de las crestas ilíacas y siluetas de órganos visibles.",
      ]),
      notas: ["La serie abdominal pediátrica lleva solo dos imágenes: decúbito supino y una que muestre niveles hidroaéreos."],
      fuente: V3(186, 200),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-abdomen-vertical", region: "ped-abdomen", nombre: "AP de abdomen en posición vertical", categoria: ["AP"], tipo: "E",
      factores: f(SIN, { respiracion: "Suspendida", angulacion: "No", rotacion: "No · sin rotación" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo para la imagen vertical." },
      posicion: [
        PANAL,
        "Hasta 3 años: Pigg-o-stat con el asiento elevado para que las bases de los soportes no se proyecten sobre el abdomen bajo; asiento cubierto con un pañal de tela.",
        "Niño mayor: sentado en una caja grande, carro o taburete, con las piernas separadas para que los fémures no tapen la pelvis.",
        "Protección gonadal anterior.",
      ],
      criterios: crit(["Abdomen con niveles hidroaéreos."], []),
      notas: ["En menores de 2-3 años se prefiere a la decúbito lateral porque es más fácil de inmovilizar."],
      revision: "El atlas no da RC ni criterios propios para esta proyección.",
      fuente: V3(200),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-abdomen-lateral", region: "ped-abdomen", nombre: "Lateral de abdomen (y de columna torácica o lumbosacra)", categoria: ["Perfil"], tipo: "E",
      factores: f(SIN, { respiracion: "Suspendida", angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo." },
      posicion: [
        "El padre, del otro lado de la mesa, sujeta brazos y cabeza (recordar que solo puede hacer una cosa a la vez).",
        "Rodar al niño de lado con una esponja o saco de arena pequeño entre las rodillas.",
        "Velcro sobre las caderas; «sujetalibros» en la espalda y esponja a 45° con saco de arena por delante para que no se arquee.",
      ],
      criterios: crit(["Columna lumbar de T12 al cóccix, de las apófisis espinosas a los cuerpos."], [
        "Superficies posteriores de los cuerpos vertebrales alineadas.",
        "Patrón trabecular visible en L5-S1.",
      ]),
      notas: ["Sirve para localizar algo en el plano AP o la posición de un catéter umbilical. Ante un pedido de «dos proyecciones del abdomen», confirmar la justificación clínica."],
      revision: "El atlas no da RC para esta proyección; los criterios vienen de la fila «Lateral columna lumbar» de la tabla 27-1.",
      fuente: V3(186, 201),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-escoliosis-pa", region: "ped-escoliosis", nombre: "PA (o AP) de columna completa para escoliosis", categoria: ["PA", "AP"], tipo: "E",
      factores: f("RI de 90 cm de largo (columna completa)", { angulacion: "No", rotacion: "No · sin rotación" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo; remite a las proyecciones para escoliosis del capítulo 8." },
      posicion: [
        "De pie; preferir PA para reducir la dosis en mamas.",
        "Si se hace AP (más estable tras la cirugía), usar protectores de mama; en la PA, colocarlos con mucho cuidado.",
        "Delantal de plomo pequeño a la altura de las EIAS para las gónadas.",
        "La serie completa agrega lateral de columna completa en 90 cm e imágenes en inclinación; en el preoperatorio, también PA de tórax.",
      ],
      criterios: crit(["Columna completa en un solo RI."], []),
      notas: ["El seguimiento suele ser PA y lateral de pie."],
      fuente: V3(205),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-escoliosis-inclinacion", region: "ped-escoliosis", nombre: "AP en inclinación derecha e izquierda para escoliosis", categoria: ["AP", "Métodos especiales"], tipo: "E",
      factores: f(SIN, { angulacion: "No", rotacion: "No · EIAS equidistantes de la mesa al inclinarse" }),
      rc: { direccion: "sin-dato", texto: "Sin dato; el centraje debe incluir desde la primera vértebra sin forma de cuña hasta las crestas ilíacas." },
      posicion: [
        "Decúbito supino sobre la mesa.",
        "Que se doble de costado como si quisiera alcanzar las rodillas, primero hacia un lado y después hacia el otro.",
        "Comprobar que las EIAS siguen equidistantes de la mesa.",
        "Protección de mamas y gónadas como en la PA.",
      ],
      criterios: crit(["Desde la primera vértebra cervical o torácica «normal» (sin forma de cuña) hasta las crestas ilíacas."], []),
      notas: ["Sirven para predecir cuánto se puede corregir la curva. La curva deja de progresar cuando se fusionan las epífisis de las crestas ilíacas."],
      fuente: V3(205),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-edad-osea", region: "ped-especiales", nombre: "Edad ósea: AP de mano y muñeca izquierdas", metodo: "Greulich y Pyle", categoria: ["AP", "Métodos especiales"], tipo: "E",
      factores: f(SIN, { respiracion: "No aplica", angulacion: "No", rotacion: "No" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo." },
      posicion: [
        "Mano y muñeca izquierdas.",
        "En niños de 1 y 2 años se agrega AP de rodilla izquierda (algunos centros, solo si no se ven osificadas las epífisis metacarpianas).",
      ],
      criterios: crit(["Centros de osificación de mano y muñeca para comparar con el atlas de Greulich y Pyle."], []),
      notas: ["El atlas escribe «Gruelich»; el autor es Greulich."],
      revision: "El atlas no da RC ni criterios; la técnica de mano está en el capítulo 4.",
      fuente: V3(203),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-cuello-cuerpo-extrano", region: "ped-especiales", nombre: "Tejidos blandos del cuello por sospecha de cuerpo extraño aspirado", categoria: ["Métodos especiales"], tipo: "E",
      factores: f(SIN, { angulacion: "No", rotacion: "No" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo." },
      posicion: [
        "Desvestido de la cintura para arriba.",
        "En el inmovilizador de cabeza y cuello del lactante: cabeza en la zona recortada, cuello sobre la parte elevada y tórax en la pendiente (si no hay, improvisar con una esponja a 45° y velcro).",
        "Cuello bien extendido para que la tráquea no se acode y hombros lo más bajos posible, sujetos con la sabanita y velcro.",
      ],
      criterios: crit(["Vía aérea del cuello sin superposición de los hombros."], []),
      notas: ["Técnica filtrada con kVp alto. Más frecuente entre los 6 meses y los 3 años."],
      fuente: V3(203),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-torax-cuerpo-extrano", region: "ped-especiales", nombre: "PA de tórax en inspiración y espiración por cuerpo extraño aspirado", categoria: ["PA"], tipo: "E",
      factores: f(SIN, { respiracion: "Una en inspiración y otra en espiración", angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI a la altura de T6-T7, como en la PA de tórax." },
      posicion: [
        "Rutina: PA en inspiración, PA en espiración y lateral.",
        "Si no se logran buenas imágenes en inspiración y espiración, hacer decúbitos laterales de ambos lados.",
      ],
      criterios: crit(["Ambos pulmones para comparar el atrapamiento aéreo."], [
        "En espiración, el lado afectado queda inflado (el cuerpo extraño hace de válvula).",
      ]),
      notas: ["En decúbito, el pulmón afectado sigue inflado del lado de abajo e impide que el corazón se desplace hacia ese lado."],
      fuente: V3(183, 204),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-cuerpo-ingerido", region: "ped-especiales", nombre: "Nasofaringe, tórax y abdomen por cuerpo extraño ingerido", categoria: ["AP"], tipo: "E",
      factores: f("35 × 43 cm (niños de alrededor de 1 año)", { angulacion: "No", rotacion: "No" }),
      rc: { direccion: "sin-dato", texto: "Sin dato en el capítulo." },
      posicion: [
        "Primera radiografía: cuello y tórax, o nasofaringe, tórax y abdomen en un solo RI.",
        "Protector gonadal en diagonal sobre la parte distal de la sínfisis para no tapar el recto inferior.",
      ],
      criterios: crit(["Desde la nasofaringe hasta el canal anal."], [
        "Si no se ven todas esas zonas no se puede descartar el cuerpo extraño.",
      ]),
      notas: ["Una moneda vista de frente a la altura de la entrada torácica está en el esófago; vista de canto, en la tráquea."],
      fuente: V3(204),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
