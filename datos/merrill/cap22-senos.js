// Capítulo 22 · Senos paranasales (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 2, págs. 386-403).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// DFRI: 122 cm, como indica la tabla de técnicas del capítulo (pág. 390).
// Parrilla: Bucky 16:1 en todas, según esa tabla (rejilla vertical: los senos se hacen de preferencia sentados, con RC horizontal).
// Tipo: R = proyección «fundamental» del resumen de proyecciones (pág. 386); E = el resto.

const DFRI = "122 cm";
const REJILLA = "Sí (Bucky vertical, rejilla 16:1)";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const V2 = (...paginas) => ({ paginas, volumen: 2 });
const RI = "18 × 24 cm";
const NIVELES = "Niveles hidroaéreos, si los hay, bien visibles.";
const COLIMA = "Haz colimado a la zona de los senos.";
const SENOS_NOTA = "De preferencia sentado y con RC horizontal para ver niveles; si se cambia la posición de la cabeza, esperar unos minutos a que el exudado se acomode.";
const WATERS_CRIT = [
  "Pirámides petrosas justo por debajo del suelo de los senos maxilares.",
  "Igual distancia entre el borde lateral del cráneo y el de la órbita en ambos lados (sin rotación).",
  "Órbitas y senos maxilares simétricos.",
  "Senos maxilares.",
  COLIMA,
  NIVELES,
];

export default {
  capitulo: 22,
  titulo: "Senos paranasales",
  paginas: "386-403",
  regiones: [
    { id: "senos", nombre: "Senos paranasales", detalle: "" },
  ],
  proyecciones: [
    {
      id: "senos-lateral", region: "senos", nombre: "Lateral de senos paranasales", categoria: ["Perfil"], tipo: "R",
      factores: f(RI, { parrilla: REJILLA, dfri: "122 cm (183 cm para mediciones prequirúrgicas)", angulacion: "No · RC horizontal", rotacion: "No · cabeza en lateral verdadero (cuerpo en OAD u OAI)" }),
      rc: { direccion: "horizontal", texto: "Horizontal, entrando 1,3 a 2,5 cm por detrás del canto externo; RI centrado en el RC." },
      posicion: [
        "Paciente sentado frente a la rejilla vertical, con el cuerpo en OAD u OAI y la cabeza en lateral verdadero.",
        "Plano medio sagital paralelo y línea interpupilar perpendicular al RI.",
        "LIOM horizontal, paralela al eje transversal de la rejilla; inmovilizar.",
        "Si no puede sentarse: decúbito dorsal con haz horizontal y la LIOM vertical.",
      ],
      criterios: crit(["Dimensiones AP y superoinferior de los senos, su relación con lo que los rodea y el grosor de la tabla externa del frontal."], [
        "Los cuatro grupos de senos, sobre todo el esfenoidal.",
        "Silla turca sin rotación.",
        "Techos orbitarios superpuestos.",
        "Ramas mandibulares superpuestas.",
        "Senos bien visibles.",
        COLIMA,
        NIVELES,
      ]),
      notas: [SENOS_NOTA],
      fuente: V2(391, 392, 394, 395),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "senos-caldwell", region: "senos", nombre: "PA axial de senos frontales y etmoidales anteriores", metodo: "Caldwell", categoria: ["Axiales", "Métodos especiales"], tipo: "R",
      factores: f(RI, { parrilla: REJILLA, angulacion: "No · RC horizontal; los 15° con la LOM se logran inclinando la rejilla o la cabeza", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal, saliendo por el nasión (15° respecto de la LOM en ambas técnicas); RI centrado en el RC." },
      posicion: [
        "Paciente sentado frente a la rejilla vertical, con el plano medio sagital en la línea media.",
        "Rejilla inclinada (preferida): inclinar la rejilla 15° hacia abajo; nariz y frente apoyadas, nasión centrado, plano medio sagital y LOM perpendiculares al RI inclinado.",
        "Rejilla vertical: extender un poco el cuello, punta de la nariz apoyada y nasión centrado; LOM a 15° del RC horizontal, con una esponja entre la frente y la rejilla.",
        "Inmovilizar.",
      ],
      criterios: crit(["Senos frontales por encima de la sutura nasofrontal, celdillas etmoidales anteriores y esfenoidales a través de las fosas nasales; los peñascos tapan el tercio superior de los maxilares."], [
        "Igual distancia entre el borde lateral del cráneo y el de las órbitas (sin rotación).",
        "Rebordes petrosos simétricos, en el tercio inferior de las órbitas.",
        "Senos frontales por encima de la sutura nasofrontal y etmoidales anteriores por encima de los rebordes petrosos.",
        COLIMA,
        NIVELES,
      ]),
      notas: ["La rejilla inclinada deja el RI más cerca de los senos y mejora la resolución.", SENOS_NOTA],
      fuente: V2(396, 397),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "senos-waters", region: "senos", nombre: "Parietocantal de senos maxilares", metodo: "Waters", categoria: ["Métodos especiales"], tipo: "R",
      factores: f(RI, { parrilla: REJILLA, angulacion: "No · RC horizontal", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal, saliendo por el acantión." },
      posicion: [
        "Paciente sentado erguido frente a la rejilla vertical, con el plano medio sagital en la línea media.",
        "Hiperextender el cuello y centrar el RI en el acantión; mentón apoyado en la rejilla con el plano medio sagital perpendicular.",
        "Con transportador, LOM a 37° del RI (la LMM queda casi perpendicular); inmovilizar y exponer rápido, la posición es incómoda.",
        "Poca extensión: los peñascos tapan el fondo de los maxilares. Demasiada: los maxilares quedan en escorzo.",
      ],
      criterios: crit(["Senos maxilares con los peñascos por debajo de su suelo; frontales y etmoidales distorsionados. También sirve para los agujeros redondos."], WATERS_CRIT),
      notas: [SENOS_NOTA],
      fuente: V2(398, 399),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "senos-waters-boca-abierta", region: "senos", nombre: "Parietocantal de senos maxilares y esfenoidales (boca abierta)", metodo: "Waters con boca abierta", categoria: ["Métodos especiales"], tipo: "R",
      factores: f(RI, { parrilla: REJILLA, angulacion: "No · RC horizontal", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal, saliendo por el acantión." },
      posicion: [
        "Como la Waters: cuello en hiperextensión, RI en el acantión, mentón apoyado y plano medio sagital perpendicular.",
        "LOM a 37° del RI con transportador (la LMM ya no queda perpendicular).",
        "El paciente abre la boca despacio sin perder la posición; inmovilizar y exponer rápido.",
      ],
      criterios: crit(["Senos esfenoidales a través de la boca abierta, junto con los maxilares."], [
        ...WATERS_CRIT,
        "Senos esfenoidales proyectados a través de la boca abierta.",
      ]),
      notas: ["Si no se puede hacer la SMV, esta y la lateral pueden ser las únicas para el esfenoides.", SENOS_NOTA],
      fuente: V2(400, 401),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "senos-smv", region: "senos", nombre: "Submentovertical de senos etmoidales y esfenoidales", categoria: ["Axiales"], tipo: "R",
      factores: f(RI, { parrilla: REJILLA, angulacion: "No · RC horizontal y perpendicular a la LIOM", rotacion: "No" }),
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular a la LIOM, a través de la silla turca; entra en el plano medio sagital unos 1,9 cm por delante de la línea de los MAE." },
      posicion: [
        "Paciente sentado en una silla con respaldo, algo alejado de la rejilla vertical para poder extender del todo la cabeza.",
        "Cuello corto o hiperesténico: inclinar la rejilla paralela a la LIOM (el RC deja de ser horizontal y los niveles se ven peor).",
        "Hiperextender el cuello y apoyar la cabeza en el vértex, con la boca cerrada; plano medio sagital perpendicular a la línea media del RI.",
        "Ajustar el tubo para que el RC quede perpendicular a la LIOM; inmovilizar (cinta acolchada sobre el mentón si no hay sujeción).",
      ],
      criterios: crit(["Parte anterior de la base del cráneo simétrica, con el seno esfenoidal y las celdillas etmoidales."], [
        "Igual distancia del borde lateral del cráneo a los cóndilos mandibulares (sin inclinación).",
        "Mentón superpuesto al frontal anterior (LIOM paralela, extensión completa).",
        "Cóndilos mandibulares por delante de las pirámides petrosas.",
        NIVELES,
      ]),
      notas: [SENOS_NOTA],
      fuente: V2(402, 403),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
