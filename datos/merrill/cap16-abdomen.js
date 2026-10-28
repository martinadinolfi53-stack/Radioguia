// Capítulo 16 · Aparato digestivo: abdomen (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 2, págs. 92-117).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// DFRI: 122 cm, como indica la tabla de técnicas del capítulo (pág. 99).
// Parrilla: Bucky 16:1 en todas, según esa tabla.
// Tipo: R = proyección «fundamental» del resumen de proyecciones (pág. 92); E = el resto.
// Las colangiografías (CTP, con tubo en T y CPRE) no se cargan: el atlas las describe como procedimientos de
// inyección guiados por fluoroscopia, sin técnica de proyección (RI, RC, criterios) para cada placa.

const DFRI = "122 cm";
const BUCKY = "Sí (Bucky, rejilla 16:1)";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida al final de la espiración", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const GONADAS = "Proteger las gónadas (protector local en varones).";
const V2 = (...paginas) => ({ paginas, volumen: 2 });

export default {
  capitulo: 16,
  titulo: "Abdomen",
  paginas: "92-117",
  regiones: [
    { id: "abdomen", nombre: "Abdomen", detalle: "Simple de abdomen y abdomen agudo" },
  ],
  proyecciones: [
    {
      id: "abdomen-ap", region: "abdomen", nombre: "AP de abdomen (decúbito supino o bipedestación)", categoria: ["AP"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Supino: perpendicular al RI a la altura de las crestas ilíacas. De pie: horizontal, 5 cm por encima de las crestas para incluir el diafragma." },
      posicion: [
        "Paciente en decúbito supino (preferible en la mayoría de los estudios iniciales, también llamada RUV) o de pie con el peso repartido entre ambos pies.",
        "Plano medio sagital en la línea media de la rejilla; brazos fuera de la imagen.",
        "En supino, apoyo bajo las rodillas.",
        "Supino: RI centrado en las crestas ilíacas, comprobando que entre la sínfisis del pubis.",
        "De pie: RI 5 cm por encima de las crestas (o lo necesario para incluir el diafragma); si interesa la vejiga, centrar en las crestas.",
        "Si el paciente es alto y no entra la pelvis, otra placa de 24 × 30 cm transversal centrada 5 a 7,6 cm por encima del borde superior de la sínfisis.",
        "Banda de compresión con presión moderada si hace falta inmovilizar.",
        GONADAS,
      ],
      criterios: crit(["Tamaño y forma del hígado, bazo y riñones; calcificaciones o masas intraabdominales."], [
        "Desde la sínfisis del pubis hasta el abdomen superior (dos placas si el paciente es alto).",
        "Columna centrada; costillas, pelvis y caderas a igual distancia de ambos bordes.",
        "Sin rotación: espinosas en el centro de las vértebras lumbares, espinas ciáticas y alas ilíacas simétricas.",
        "Partes blandas: pared abdominal y grasa properitoneal, psoas, borde inferior del hígado, riñones, últimas costillas y apófisis transversas lumbares.",
        "Marcador D o I visible sin tapar el abdomen.",
        "De pie: diafragma sin movimiento (RI transversal si el paciente es muy grande), densidad parecida a la de supino (menos si se sospecha neumoperitoneo) y marcador de abdomen superior.",
      ]),
      notas: ["La serie de abdomen agudo suele ser AP supino, AP de pie y PA de tórax; si no puede ponerse de pie, decúbito lateral izquierdo."],
      fuente: V2(101, 102, 103),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-pa", region: "abdomen", nombre: "PA de abdomen (bipedestación)", categoria: ["PA"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal, 5 cm por encima de las crestas ilíacas (igual que la AP de pie)." },
      posicion: [
        "Paciente de pie con la cara anterior del abdomen contra el bucky vertical.",
        "Línea media del abdomen en la línea media del RI.",
        "RI centrado 5 cm por encima de las crestas ilíacas.",
        GONADAS,
      ],
      criterios: crit(["Las mismas que la AP de pie."], [
        "Los mismos criterios que la AP de abdomen de pie.",
      ]),
      notas: ["Recomendada cuando los riñones no son de interés principal: reduce mucho la dosis gonadal respecto de la AP."],
      fuente: V2(104),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-ap-decubito-lateral", region: "abdomen", nombre: "AP de abdomen en decúbito lateral izquierdo", categoria: ["AP", "Decúbitos"], tipo: "R",
      factores: f("35 × 43 cm", { parrilla: BUCKY, angulacion: "No · haz horizontal", rotacion: "No · frontal verdadera" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al centro del RI." },
      posicion: [
        "Para el paciente que no puede ponerse de pie: decúbito lateral (casi siempre izquierdo) sobre una almohadilla radiotransparente en la camilla; bloquear las ruedas.",
        "Si se puede, mantenerlo de costado varios minutos antes de exponer para que el aire suba.",
        "Brazos por encima del diafragma; rodillas algo flexionadas.",
        "Bucky vertical con el eje largo del RI centrado en el plano medio sagital; crestas ilíacas en el centro del RI (o 5 cm más arriba para asegurar los diafragmas).",
        "Comprobar que no esté rotado.",
        GONADAS,
      ],
      criterios: crit(["Hígado, bazo y riñones; sobre todo aire libre y niveles hidroaéreos cuando no se puede hacer la de pie."], [
        "Diafragma sin movimiento.",
        "Ambos lados del abdomen; si no entran, elevar y mostrar el lado de abajo si se sospecha líquido, o el de arriba si se sospecha aire libre.",
        "Paredes abdominales, flancos y diafragma.",
        "Sin rotación.",
        "Identificación visible del lado y del lado que queda arriba.",
      ]),
      notas: [
        "En abdómenes voluminosos, un filtro compensador evita sobreexponer el flanco superior.",
        "Si no puede acostarse sobre el lado izquierdo, se hace decúbito lateral derecho.",
        "Para gas libre mínimo, Miller recomendaba 10 a 20 minutos en decúbito lateral izquierdo antes de las placas (muchos servicios usan 5 minutos como mínimo).",
      ],
      fuente: V2(104, 105, 106),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-lateral", region: "abdomen", nombre: "Lateral de abdomen", categoria: ["Perfil"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, entrando por el plano medio coronal a la altura de la cresta ilíaca (o 5 cm por encima si se incluye el diafragma)." },
      posicion: [
        "Paciente acostado sobre el lado derecho o izquierdo, con las rodillas flexionadas y apoyos entre rodillas y tobillos.",
        "Plano medio coronal en la línea media de la rejilla.",
        "Codos flexionados con las manos bajo la cabeza.",
        "RI centrado en las crestas ilíacas o 5 cm más arriba para incluir el diafragma.",
        "Banda de compresión sobre la pelvis si hace falta estabilizar.",
        GONADAS,
      ],
      criterios: crit(["Espacio prevertebral con la aorta abdominal y calcificaciones o masas intraabdominales."], [
        "Contenido abdominal con las partes blandas en tonos grises.",
        "Sin rotación: huesos ilíacos y pedículos lumbares superpuestos, agujeros intervertebrales abiertos.",
        "Si se incluye el diafragma, la mayor parte posible del resto del abdomen.",
      ]),
      fuente: V2(108),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "abdomen-lateral-decubito-dorsal", region: "abdomen", nombre: "Lateral de abdomen en decúbito dorsal", categoria: ["Perfil", "Decúbitos"], tipo: "R",
      factores: f("35 × 43 cm, longitudinal", { parrilla: BUCKY, angulacion: "No · haz horizontal", rotacion: "No · supino verdadero" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al centro del RI, entrando por el plano medio coronal 5 cm por encima de las crestas ilíacas." },
      posicion: [
        "Para el paciente que no puede ponerse de pie ni de costado: decúbito supino sobre camilla o soporte, con el lado derecho o izquierdo contra el bucky vertical; bloquear las ruedas.",
        "Brazos cruzados sobre la parte alta del tórax o detrás de la cabeza; rodillas algo flexionadas.",
        "Eje largo del RI centrado en el plano medio coronal; un punto 5 cm por encima de las crestas en el centro del RI.",
        "Elevar al paciente para que entre todo el abdomen y asegurar que no se gire.",
        GONADAS,
      ],
      criterios: crit(["Espacio prevertebral y niveles hidroaéreos abdominales."], [
        "Diafragma sin movimiento.",
        "Contenido abdominal visible en tonos grises de partes blandas.",
        "Paciente elevado de modo que se vea todo el abdomen.",
      ]),
      fuente: V2(109),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
