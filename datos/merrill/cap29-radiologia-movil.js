// Capítulo 29 · Radiología móvil (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 3, págs. 233-262).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// DFRI: 102 cm o más, como indica el capítulo (pág. 237); la columna cervical lateral pide 158-183 cm.
// Parrilla: la de cada proyección; las rejillas portátiles suelen ser enfocadas 6:1-8:1 con foco de 91-112 cm (pág. 236).
// Tipo: el capítulo no tiene tabla «Resumen de proyecciones» con iconos de fundamental, así que todas son E. Son las
// 10 proyecciones portátiles más frecuentes según el propio atlas (fig. 29-4). La técnica no portátil está en el capítulo citado en cada nota.

const DFRI = "102 cm o más";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const V3 = (...paginas) => ({ paginas, volumen: 3 });
const GONADAS = "Proteger las gónadas.";
const ALINEA = "Comprobar que el RC y la rejilla están alineados para evitar el corte de rejilla.";
const DECUBITO_ESPERA = "Dejar al paciente al menos 5 min en decúbito antes de disparar, para que el aire suba y el líquido baje.";
const NEONATO_RESP = "Inspiración completa (el recién nacido no puede contener la respiración: disparar en la fase inspiratoria)";
const NEONATO_CABEZA = "Dejar la cabeza del recién nacido intubado como está habitualmente: enderezarla puede hacer avanzar el tubo endotraqueal y falsear su posición.";
const FEMUR_KVP = "Medir la parte más gruesa (proximal) y elegir el kVp para penetrarla; cátodo sobre el fémur proximal.";

export default {
  capitulo: 29,
  titulo: "Radiología móvil",
  paginas: "233-262",
  regiones: [
    { id: "port-torax", nombre: "Tórax portátil", detalle: "" },
    { id: "port-abdomen", nombre: "Abdomen portátil", detalle: "" },
    { id: "port-pelvis", nombre: "Pelvis portátil", detalle: "" },
    { id: "port-femur", nombre: "Fémur portátil", detalle: "" },
    { id: "port-cervical", nombre: "Columna cervical portátil", detalle: "" },
    { id: "port-neonato", nombre: "Tórax y abdomen del recién nacido", detalle: "" },
  ],
  proyecciones: [
    {
      id: "port-torax-ap", region: "port-torax", nombre: "AP de tórax portátil (vertical o decúbito supino)", categoria: ["AP"], tipo: "E",
      factores: f("35 × 43 cm longitudinal o transversal, según el hábito", { parrilla: "Según el tamaño del paciente y el centro · obligatoria en RC si se superan 90 kVp", respiracion: "Inspiración (con respirador, disparar en la fase inspiratoria)", angulacion: "No · perpendicular al eje largo del esternón", rotacion: "No · torso sin rotar ni inclinar" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al eje largo del esternón y al centro del RI, entrando unos 7,6 cm por debajo de la escotadura yugular, a la altura de T7." },
      posicion: [
        "Elevar la cabecera a semisentado o sentado, lo más vertical que tolere; decúbito supino en pacientes muy graves.",
        "RI bajo el paciente con el borde superior unos 5 cm por encima de los hombros relajados (en supino los hombros suben: ajustar).",
        "Plano medio sagital centrado en el RI.",
        "Hombros relajados y brazos en rotación interna para sacar las escápulas de los pulmones, si no está contraindicado.",
        GONADAS,
      ],
      criterios: crit(["Corazón, tráquea, cúpulas diafragmáticas y campos pulmonares completos con las marcas vasculares."], [
        "Sin movimiento.",
        "Campos pulmonares completos, con los ángulos costofrénicos.",
        "Marcas pleurales visibles.",
        "Costillas y espacios discales torácicos tenues a través del corazón.",
        "Sin rotación: extremos mediales de las clavículas y bordes costales equidistantes de la columna.",
      ]),
      notas: [
        "Para verificar el ángulo del tubo, mirar la sombra de los hombros en el campo de luz: si cae muy por encima del borde superior del RI, corregir.",
        "Con rejilla transversal, el RC debe quedar perpendicular a ella.",
        "La técnica no portátil está en el capítulo 10.",
      ],
      fuente: V3(242, 243),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-torax-decubito", region: "port-torax", nombre: "AP o PA de tórax portátil en decúbito lateral", categoria: ["AP", "PA", "Decúbitos"], tipo: "E",
      factores: f("35 × 43 cm longitudinal", { parrilla: "Según el tamaño del paciente", respiracion: "Inspiración", angulacion: "No · RC horizontal", rotacion: "No · plano coronal de hombros y caderas vertical" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al centro del RI, entrando unos 7,6 cm por debajo de la escotadura yugular." },
      posicion: [
        "Decúbito lateral derecho o izquierdo, con las rodillas flexionadas para estabilizar.",
        "Soporte firme bajo el paciente que lo eleve 5-8 cm para que no se hunda en el colchón y se vea el lado de abajo.",
        "Ambos brazos levantados, de preferencia sobre la cabeza (un brazo al costado puede simular aire libre).",
        "Preferir la AP: es más fácil colocar a un paciente enfermo.",
        "RI detrás del paciente y por debajo del soporte, unos 5 cm por encima de los hombros, apoyado (no inclinado contra el paciente).",
        "Asegurar que no pueda caerse de la cama.",
        GONADAS,
      ],
      criterios: crit(["Campos pulmonares completos y niveles de aire o líquido, si los hay."], [
        "Sin movimiento ni rotación.",
        "Lado afectado completo (parte alta para aire libre, parte baja para líquido).",
        "Brazos fuera de la zona de interés.",
        "Marcador que indique el decúbito.",
      ]),
      notas: [
        "Líquido pleural: lado afectado abajo. Aire: lado sano abajo.",
        DECUBITO_ESPERA,
        "La técnica no portátil está en el capítulo 10.",
      ],
      fuente: V3(244, 245),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-abdomen-ap", region: "port-abdomen", nombre: "AP de abdomen portátil", categoria: ["AP"], tipo: "E",
      factores: f("35 × 43 cm longitudinal", { parrilla: "Sí (rejilla)", respiracion: "Espiración", angulacion: "No", rotacion: "No · hombros y pelvis en el mismo plano" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al centro de la rejilla, en el plano medio sagital, a la altura de las crestas ilíacas (o de la décima costilla lateralmente)." },
      posicion: [
        "Cama en horizontal y paciente en decúbito supino.",
        "Rejilla en el centro de la cama, estabilizada con sábanas o toallas para que no se incline; una sábana doblada ayuda a rodar al paciente y hace de barrera con la piel.",
        "Plano medio sagital en la línea media de la rejilla, centrada en las crestas ilíacas (5 cm más arriba si interesa el abdomen superior y el diafragma).",
        "Brazos fuera del abdomen.",
        "Proteger las gónadas (no es posible en mujeres).",
      ],
      criterios: crit(["Borde inferior del hígado, bazo, riñones, psoas, calcificaciones y masas; con el diafragma incluido, tamaño y forma del hígado."], [
        "Sin movimiento ni rotación.",
        "Contornos de las vísceras abdominales.",
        "Abdomen con la sínfisis del pubis o el diafragma (en algunos pacientes, ambos).",
        "Columna en el centro; columna y alas ilíacas simétricas.",
        "Psoas, borde inferior del hígado y siluetas renales.",
      ]),
      notas: ["Los hiperesténicos necesitan dos imágenes con la rejilla transversal (abdomen superior e inferior).", "La técnica no portátil está en el capítulo 16."],
      fuente: V3(246, 247),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-abdomen-decubito", region: "port-abdomen", nombre: "AP o PA de abdomen portátil en decúbito lateral izquierdo", categoria: ["AP", "PA", "Decúbitos"], tipo: "E",
      factores: f("35 × 43 cm longitudinal", { parrilla: "Sí (rejilla vertical, apoyada, no contra el paciente)", respiracion: "Espiración", angulacion: "No · RC horizontal", rotacion: "No · plano coronal de hombros y caderas vertical" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al centro de la rejilla, en el plano medio sagital." },
      posicion: [
        "Decúbito lateral izquierdo (salvo otro pedido), rodillas algo flexionadas.",
        "Soporte firme bajo el paciente si se hunde en el colchón.",
        "Brazos fuera del abdomen (el derecho al costado puede simular aire libre).",
        "PA o AP según la disposición de la habitación: rejilla delante del paciente para PA, detrás para AP.",
        "Rejilla centrada 5 cm por encima de las crestas ilíacas para incluir el diafragma; no hace falta ver la sínfisis.",
        "Asegurar que no pueda caerse de la cama.",
        GONADAS,
      ],
      criterios: crit(["Niveles de aire o líquido en la cavidad abdominal; útil sobre todo para aire libre. Debe verse el borde derecho del abdomen."], [
        "Sin movimiento ni rotación.",
        "Diafragma y vísceras abdominales bien definidos.",
        "Niveles hidroaéreos, si los hay.",
        "Paredes abdominales derecha e izquierda y flancos.",
        "Columna y alas ilíacas simétricas.",
      ]),
      notas: [DECUBITO_ESPERA, "Hiperesténicos: dos imágenes con la rejilla transversal; torso grande: dos con la rejilla longitudinal.", "La técnica no portátil está en el capítulo 16."],
      fuente: V3(248, 249),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-pelvis-ap", region: "port-pelvis", nombre: "AP de pelvis portátil", categoria: ["AP"], tipo: "E",
      factores: f("35 × 43 cm", { parrilla: "Sí (rejilla transversal)", angulacion: "No", rotacion: "Sí · piernas en rotación interna de unos 15°, si no está contraindicado" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al punto medio de la rejilla, en el plano medio sagital, unos 5 cm por encima de la sínfisis del pubis y 5 cm por debajo de la EIAS." },
      posicion: [
        "Cama en horizontal y paciente en decúbito supino, brazos fuera de la pelvis.",
        "Rejilla bajo la pelvis, centrada a mitad de camino entre la EIAS y la sínfisis.",
        "Plano medio sagital en la línea media de la rejilla; pelvis sin rotar.",
        "Proteger las gónadas (puede no ser posible en mujeres).",
      ],
      criterios: crit(["Ambos coxales, sacro y cóccix, cabeza, cuello, trocánteres y parte proximal de los fémures."], [
        "Toda la pelvis con los fémures proximales.",
        "Sin rotación: alas ilíacas y agujeros obturadores simétricos.",
        "Trocánteres mayores e ilíacos equidistantes del borde de la imagen.",
        "Cuellos femorales sin acortar y trocánter mayor de perfil.",
      ]),
      notas: [
        "El peso del paciente suele inclinar hacia arriba el borde inferior de la rejilla: bajar un poco los pies de la cama, poner una toalla enrollada debajo o inflar al máximo el colchón de aire, y revisar el nivel.",
        "La técnica no portátil está en el capítulo 7.",
      ],
      fuente: V3(250, 251),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-femur-ap", region: "port-femur", nombre: "AP de fémur portátil", categoria: ["AP"], tipo: "E",
      factores: f("35 × 43 cm longitudinal", { parrilla: "Sí (rejilla longitudinal)", angulacion: "No · perpendicular al eje largo del fémur", rotacion: "No · rejilla paralela al plano de los cóndilos" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al eje largo del fémur y centrado en la rejilla." },
      posicion: [
        "Decúbito supino; suele estar con tracción y el fémur no se puede mover.",
        "Rejilla longitudinal bajo el fémur, con el borde distal lo bastante bajo para incluir la fractura y la rodilla.",
        "Calzar la rejilla con toallas o bloques hasta alinearla con el tubo.",
        "Rejilla centrada en la línea media del fémur y paralela al plano de los cóndilos.",
        GONADAS,
        ALINEA,
      ],
      criterios: crit(["Dos tercios distales del fémur con la rodilla."], [
        "La mayor parte del fémur, con la rodilla.",
        "Rodilla sin rotación.",
        "Fémur proximal bien penetrado.",
        "Material ortopédico, si lo hay.",
      ]),
      notas: [FEMUR_KVP, "Para el fémur completo, agregar una AP proximal con el borde superior de la rejilla a la altura de la EIAS.", "La técnica no portátil está en el capítulo 6."],
      fuente: V3(252, 253),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-femur-lateral", region: "port-femur", nombre: "Lateral de fémur portátil en decúbito dorsal (mediolateral o lateromedial)", categoria: ["Perfil", "Decúbitos"], tipo: "E",
      factores: f("35 × 43 cm longitudinal", { parrilla: "Sí (rejilla longitudinal vertical)", angulacion: "No · RC horizontal", rotacion: "No · rejilla perpendicular al plano epicondíleo" }),
      rc: { direccion: "horizontal", texto: "Perpendicular al eje largo del fémur, entrando en su punto medio (centrado en el fémur, no en la rejilla)." },
      posicion: [
        "Decúbito supino. Se prefiere la mediolateral porque muestra más fémur proximal.",
        "Mediolateral: rejilla vertical contra la cara lateral del fémur, con el borde distal incluyendo la rodilla; elevar la pierna sana casi vertical sobre un soporte (o un ayudante con delantal).",
        "Lateromedial: rejilla contra la cara medial (entre las piernas), incluyendo la rodilla.",
        "Rejilla perpendicular al plano epicondíleo, sujeta por el paciente o firme en su lugar.",
        GONADAS,
        ALINEA,
      ],
      criterios: crit(["Dos tercios distales del fémur con la rodilla, sin superposición del otro muslo."], [
        "La mayor parte del fémur, con la rodilla.",
        "Rótula de perfil y cóndilos femorales superpuestos.",
        "El otro muslo fuera de la zona de interés.",
        "Fémur proximal bien penetrado.",
        "Material ortopédico, si lo hay.",
      ]),
      notas: [FEMUR_KVP, "La técnica no portátil está en el capítulo 6."],
      fuente: V3(254, 255),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-cervical-lateral", region: "port-cervical", nombre: "Lateral de columna cervical portátil en decúbito dorsal", categoria: ["Perfil", "Decúbitos"], tipo: "E",
      factores: f("24 × 30 cm longitudinal", { dfri: "158-183 cm (por la gran DORI; ayuda a ver C7)", parrilla: "Sí (rejilla longitudinal) · sin rejilla en pacientes pequeños", respiracion: "Espiración completa (máximo descenso de los hombros)", angulacion: "No · RC horizontal", rotacion: "No · torso, cuello y cabeza sin rotar" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al centro de la rejilla, a la altura de C4 (borde superior del cartílago tiroides)." },
      posicion: [
        "Decúbito supino con los brazos a lo largo del cuerpo.",
        "No quitar el collarín sin permiso de enfermería o del médico.",
        "Rejilla vertical al costado, paralela al cuello, con el borde superior unos 2,43 cm por encima del MAE (centrada en C4).",
        "Elevar un poco la barbilla; en traumatismo reciente, consultar antes al médico.",
        "Sujetar la rejilla con el calibrador bajo los hombros, almohadas contra la baranda o cinta.",
        "Bajar los hombros hacia los pies todo lo posible.",
        GONADAS,
        ALINEA,
      ],
      criterios: crit(["Las siete vértebras cervicales, la base del cráneo y los tejidos blandos del cuello."], [
        "Siete vértebras con los espacios intervertebrales y las apófisis espinosas.",
        "Cuello extendido si es posible, sin las ramas mandibulares sobre C1-C2.",
        "C4 en el centro de la rejilla.",
        "Bordes posteriores de los cuerpos superpuestos.",
      ]),
      notas: [
        "Es fundamental incluir C6 y C7. No tirar de los brazos con fuerza ni de golpe si puede haber fractura; si no se ve la columna baja, usar el método del nadador (Twining, cap. 8).",
        "En RC, ajustar el kVp para penetrar C7.",
        "La técnica no portátil está en el capítulo 8.",
      ],
      fuente: V3(256, 257),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-neonato-ap", region: "port-neonato", nombre: "AP de tórax y abdomen del recién nacido", categoria: ["AP"], tipo: "E",
      factores: f("20 × 24 cm longitudinal", { parrilla: "No (RI directo bajo el lactante o en la bandeja de la cuna)", respiracion: NEONATO_RESP, angulacion: "No", rotacion: "No · tórax y abdomen sin rotar" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al punto medio del tórax y el abdomen, en el plano medio sagital." },
      posicion: [
        "Decúbito supino en el centro del RI (bandeja numerada de la cuna o RI cubierto con una manta suave y tibia).",
        "Correr el calefactor y colocar con cuidado el tubo sobre el lactante.",
        "Brazos separados del cuerpo o sobre la cabeza y piernas hacia abajo, sujetos por una enfermera con delantal.",
        NEONATO_CABEZA,
        "Colimar ceñido al tórax y abdomen.",
        GONADAS,
      ],
      criterios: crit(["Todo el tórax y el abdomen."], [
        "Desde los vértices pulmonares hasta la sínfisis del pubis.",
        "Sin movimiento ni borrosidad en pulmones, diafragma y abdomen.",
        "Sin rotación.",
      ]),
      notas: ["Es la combinación habitual en la UCIN para prematuros; si piden solo tórax o solo abdomen, ajustar RC y colimación.", "En espiración los pulmones simulan enfermedad: en inspiración completa el diafragma queda a la altura de la décima costilla posterior."],
      fuente: V3(258, 259, 260),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "port-neonato-lateral", region: "port-neonato", nombre: "Lateral de tórax y abdomen del recién nacido en decúbito dorsal", categoria: ["Perfil", "Decúbitos"], tipo: "E",
      factores: f("20 × 24 cm longitudinal", { parrilla: "No", respiracion: NEONATO_RESP, angulacion: "No · RC horizontal", rotacion: "No · tórax y abdomen sin rotar" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al punto medio del tórax y el abdomen, en el plano coronal medio." },
      posicion: [
        "Tubo al costado de la cuna.",
        "Decúbito supino sobre un bloque radiotransparente cubierto con una manta (sirve una caja de pañuelos dada vuelta).",
        "Brazos sobre la cabeza, sujetos por una enfermera con delantal.",
        "RI longitudinal y vertical al costado, inmovilizado.",
        NEONATO_CABEZA,
        "Colimar ceñido al tórax y abdomen.",
        GONADAS,
      ],
      criterios: crit(["Todo el tórax y el abdomen, con atención a los ángulos costofrénicos posteriores y a los niveles hidroaéreos."], [
        "Desde los vértices pulmonares hasta el pubis.",
        "Sin movimiento ni borrosidad en pulmones, diafragma y abdomen.",
        "Sin rotación.",
        "Niveles hidroaéreos, si los hay.",
      ]),
      notas: ["La mayoría de los prematuros no pueden ponerse de lado ni verticales para un lateral."],
      fuente: V3(261, 262),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
