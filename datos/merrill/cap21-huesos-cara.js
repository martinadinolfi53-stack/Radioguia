// Capítulo 21 · Huesos de la cara (Merrill, Atlas de posiciones radiográficas y procedimientos radiológicos, 11ª ed., vol. 2, págs. 346-383).
// Redacción propia a partir del atlas; los valores técnicos se copian tal cual figuran en la fuente.
// DFRI: 122 cm, como indica la tabla de técnicas del capítulo (pág. 347).
// Parrilla: Bucky 16:1 según esa tabla; los huesos nasales se hacen con el RI sobre la mesa o con placa oclusal, como pide el texto.
// Tipo: R = proyección «fundamental» del resumen de proyecciones (pág. 346); E = el resto.

const DFRI = "122 cm";
const BUCKY = "Sí (Bucky, rejilla 16:1)";
const f = (ri, extra = {}) => ({ ri, dfri: DFRI, respiracion: "Suspendida", ...extra });
const crit = (estructuras, evaluacion) => [["Estructuras que se muestran", estructuras], ...(evaluacion.length ? [["Criterios de evaluación", evaluacion]] : [])];
const V2 = (...paginas) => ({ paginas, volumen: 2 });
const RI = "18 × 24 cm";
const ATM_BOCA = "Una exposición con la boca cerrada (dientes posteriores en contacto) y, si no está contraindicado, otra con la boca bien abierta sin adelantar la mandíbula. Nunca boca abierta en traumatismos recientes.";
const PRONO_FRENTE = "Frente y nariz apoyadas en el RI, con la LOM y el plano medio sagital perpendiculares al RI; inmovilizar.";
const PRONO_MENTON = "Plano medio sagital en la línea media del RI; cabeza apoyada en nariz y mentón, con la cara anterior de la sínfisis paralela al RI (la LCM queda casi perpendicular) y el plano medio sagital perpendicular.";

export default {
  capitulo: 21,
  titulo: "Huesos de la cara",
  paginas: "346-383",
  regiones: [
    { id: "huesos-faciales", nombre: "Huesos faciales", detalle: "" },
    { id: "huesos-nasales", nombre: "Huesos nasales", detalle: "" },
    { id: "arcos-cigomaticos", nombre: "Arcos cigomáticos", detalle: "" },
    { id: "mandibula", nombre: "Maxilar inferior (mandíbula)", detalle: "" },
    { id: "atm", nombre: "Articulaciones temporomandibulares", detalle: "ATM" },
  ],
  proyecciones: [
    {
      id: "faciales-lateral", region: "huesos-faciales", nombre: "Lateral de huesos faciales", categoria: ["Perfil"], tipo: "R",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, por la cara lateral del cigoma, a mitad de camino entre el canto externo y el MAE; RI centrado en el RC." },
      posicion: [
        "Paciente semiprono o sentado en oblicuo frente a la rejilla vertical.",
        "Plano sagital paralelo y línea interpupilar perpendicular al RI.",
        "LIOM paralela al eje transversal del RI; inmovilizar.",
      ],
      criterios: crit(["Huesos de la cara de perfil, con ambos lados superpuestos."], [
        "Todos los huesos faciales completos, con el cigoma en el centro.",
        "Ramas mandibulares casi perfectamente superpuestas.",
        "Techos orbitarios superpuestos.",
        "Silla turca sin rotación.",
      ]),
      fuente: V2(349, 350, 351),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "faciales-waters", region: "huesos-faciales", nombre: "Parietocantal de huesos faciales", metodo: "Waters", categoria: ["Métodos especiales"], tipo: "R",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, saliendo por el acantión." },
      posicion: [
        "Paciente en decúbito prono o sentado, con el plano medio sagital en la línea media de la rejilla.",
        "Cabeza apoyada en la punta del mentón; cuello en hiperextensión hasta que la LOM forme 37° con el RI (la LMM queda casi perpendicular y la nariz a unos 1,9 cm de la rejilla).",
        "Plano medio sagital perpendicular al RI.",
        "RI centrado en el acantión; inmovilizar.",
      ],
      criterios: crit(["Órbitas, maxilares superiores y arcos cigomáticos."], [
        "Igual distancia entre el borde lateral del cráneo y la órbita en ambos lados.",
        "Rebordes petrosos justo por debajo de los senos maxilares.",
      ]),
      fuente: V2(352, 353),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "faciales-waters-modificado", region: "huesos-faciales", nombre: "Parietocantal modificada de huesos faciales", metodo: "Waters modificado", categoria: ["Métodos especiales"], tipo: "E",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, saliendo por el acantión (como en la Waters)." },
      posicion: [
        "Igual que la Waters, pero con el cuello menos extendido: la LOM forma unos 55° con el RI.",
      ],
      criterios: crit(["Huesos faciales con menos angulación axial; rebordes petrosos justo por debajo del borde inferior de las órbitas, a mitad de los senos maxilares."], []),
      notas: ["Excelente para fracturas por estallido: el suelo de la órbita queda perpendicular al RI y paralelo al RC."],
      revision: "El atlas no da el RC de forma explícita para la variante modificada; se tomó el de la Waters.",
      fuente: V2(354, 355),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "faciales-waters-invertido", region: "huesos-faciales", nombre: "Cantoparietal de huesos faciales", metodo: "Waters invertido", categoria: ["Métodos especiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "No · en trauma, RC paralelo a la LMM", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, entrando por el acantión y centrado en el RI. En trauma, sin extender el cuello, RC paralelo a la LMM por el acantión." },
      posicion: [
        "Para pacientes que no pueden ponerse en prono: decúbito supino con el plano medio sagital en la línea media de la rejilla.",
        "Elevar el mentón y extender el cuello hasta que la LOM forme 37° con el RI (apoyo bajo los hombros si hace falta); la LMM queda casi perpendicular.",
        "Plano medio sagital perpendicular al RI; inmovilizar.",
      ],
      criterios: crit(["Huesos faciales superiores, como en la Waters pero muy magnificados."], [
        "Igual distancia entre el borde lateral del cráneo y la órbita en ambos lados.",
        "Rebordes petrosos por debajo de los senos maxilares.",
      ]),
      fuente: V2(356, 357),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "faciales-caldwell", region: "huesos-faciales", nombre: "PA axial de huesos faciales", metodo: "Caldwell", categoria: ["Axiales", "Métodos especiales"], tipo: "R",
      factores: f("24 × 30 cm, longitudinal", { parrilla: BUCKY, angulacion: "Sí · 15° caudal (30° para rebordes y suelos orbitarios)", rotacion: "No" }),
      rc: { direccion: "caudal", angulo: "15°", texto: "15° caudal saliendo por el nasión (30° caudal, «Caldwell exagerado», para los rebordes y suelos orbitarios); RI centrado en el RC." },
      posicion: [
        "Paciente en decúbito prono o sentado, con el plano medio sagital en la línea media de la rejilla.",
        "Frente y nariz apoyadas en la mesa o el bucky vertical (esponja delante de la frente en obesos o hiperesténicos).",
        "LOM perpendicular al RI; plano medio sagital perpendicular (órbitas o MAE a igual distancia de la mesa).",
        "Inmovilizar y centrar el RI en el nasión.",
      ],
      criterios: crit(["Rebordes orbitarios, maxilares superiores, tabique nasal, cigomas y espina nasal anterior."], [
        "Perímetro craneal completo con las tres tablas diferenciadas.",
        "Igual distancia del borde lateral del cráneo al borde lateral de la órbita en ambos lados.",
        "Rebordes petrosos simétricos, en el tercio inferior de las órbitas.",
        "Frontal penetrado sin quemar los bordes laterales, viendo los huesos faciales.",
      ]),
      fuente: V2(358, 359),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "nasales-lateral", region: "huesos-nasales", nombre: "Lateral de huesos nasales (D e I)", categoria: ["Perfil"], tipo: "R",
      factores: f("18 × 24 cm transversal, dos exposiciones; o placa oclusal de 57 × 76 mm para cada lado", { parrilla: "No (RI sobre la mesa o placa oclusal)", angulacion: "No", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular al puente de la nariz, 1,3 cm por debajo del nasión; colimación cerrada." },
      posicion: [
        "Paciente semiprono, con el cuerpo girado para que el plano medio sagital de la cabeza quede horizontal.",
        "Plano medio sagital paralelo y línea interpupilar perpendicular a la mesa; LIOM paralela al eje transversal del RI; apoyo bajo la mandíbula.",
        "RI de 18 × 24 cm: deslizar la mitad libre bajo la región nasofrontal y centrar en el nasión.",
        "Placa oclusal: sujetarla con un saco de arena junto a la nariz, paralela al plano medio sagital, con el borde superior 1,3 cm por encima del reborde supraorbitario (con puente plano o cóncavo, en ángulo bajo el reborde, sostenida por el paciente).",
      ],
      criterios: crit(["Huesos y partes blandas de la nariz del lado cercano al RI; hacer y comparar ambos lados."], [
        "Huesos y partes blandas de la nariz sin rotación.",
        "Espina nasal anterior y sutura nasofrontal.",
      ]),
      fuente: V2(360, 361),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cigomaticos-smv", region: "arcos-cigomaticos", nombre: "Submentovertical de arcos cigomáticos", categoria: ["Axiales"], tipo: "R",
      factores: f(RI + ", transversal", { parrilla: BUCKY, angulacion: "No · RC perpendicular a la LIOM", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a la LIOM, por el plano medio sagital de la garganta unos 2,5 cm por detrás de los cantos externos; RI centrado en el RC." },
      posicion: [
        "Paciente sentado o en supino con el tronco elevado sobre almohadas firmes para extender del todo el cuello; rodillas flexionadas.",
        "Plano medio sagital en la línea media de la rejilla.",
        "Hiperextender el cuello hasta que la LIOM quede lo más paralela posible al RI; cabeza apoyada en el vértex con el plano medio sagital perpendicular.",
      ],
      criterios: crit(["Ambos arcos cigomáticos simétricos sin superposición."], [
        "Arcos cigomáticos sin estructuras encima.",
        "Arcos simétricos y sin escorzo.",
        "Cabeza sin rotación.",
      ]),
      notas: ["Se ven mejor bajando la técnica respecto de la SMV de base de cráneo."],
      fuente: V2(362, 363),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cigomatico-tangencial", region: "arcos-cigomaticos", nombre: "Tangencial de arco cigomático", categoria: ["Tangenciales"], tipo: "R",
      factores: f(RI, { parrilla: "Sí (rejilla vertical) sentado · en supino, RI elevado sobre sacos o esponja en cuña", angulacion: "No · RC perpendicular a la LIOM", rotacion: "Sí · cabeza girada 15° hacia el lado en estudio e inclinada 15° hacia el contrario" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a la LIOM, centrado en el arco unos 2,5 cm por detrás del canto externo; tangente a la cara lateral del cráneo." },
      posicion: [
        "Sentado con la espalda contra la rejilla vertical, o en supino con el tronco elevado y las rodillas flexionadas; cuello en hiperextensión y cabeza apoyada en el vértex.",
        "LIOM lo más paralela posible al RI (en supino, elevar el extremo superior del RI).",
        "Girar el plano medio sagital unos 15° hacia el lado a estudiar e inclinar la parte alta de la cabeza 15° hacia el lado contrario: el RC pasa rozando el ángulo mandibular y el parietal.",
        "Centrar el arco en el RI; cinta bajo el mentón fijada a la mesa si hace falta (sin pegarla a la piel).",
      ],
      criterios: crit(["Un arco cigomático tangencial, libre de superposición (útil en fracturas deprimidas o malares planos)."], [
        "Arco cigomático sin estructuras encima.",
        "Arco sin sobreexposición.",
      ]),
      fuente: V2(364, 365),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "cigomaticos-towne", region: "arcos-cigomaticos", nombre: "AP axial de arcos cigomáticos", metodo: "Towne modificado", categoria: ["Axiales", "Métodos especiales"], tipo: "R",
      factores: f(RI + ", transversal", { parrilla: BUCKY, angulacion: "Sí · 30° caudal con la LOM (37° con la LIOM)", rotacion: "No" }),
      rc: { direccion: "caudal", angulo: "30°", texto: "30° caudal, entrando por la glabela unos 2,5 cm por encima del nasión (37° si se usa la LIOM); RI centrado en el RC." },
      posicion: [
        "Paciente sentado o en supino, con el plano medio sagital en la línea media de la rejilla y perpendicular a ella.",
        "LOM perpendicular al RI (si no flexiona lo suficiente, LIOM perpendicular y 37°).",
      ],
      criterios: crit(["Ambos arcos cigomáticos simétricos sin superposición."], [
        "Arcos sin la mandíbula encima.",
        "Sin rotación: arcos simétricos.",
        "Arcos laterales a las ramas mandibulares.",
      ]),
      fuente: V2(366, 367),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-ramas-pa", region: "mandibula", nombre: "PA de ramas mandibulares", categoria: ["PA"], tipo: "R",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular, saliendo por el acantión; RI centrado en el RC." },
      posicion: [
        "Paciente en decúbito prono o sentado frente a la rejilla vertical.",
        PRONO_FRENTE,
      ],
      criterios: crit(["Cuerpo y ramas mandibulares (la parte central del cuerpo queda tapada por la columna); desplazamientos mediales o laterales en fracturas de rama."], [
        "Cuerpo y ramas simétricos.",
        "Mandíbula completa.",
      ]),
      fuente: V2(368),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-ramas-pa-axial", region: "mandibula", nombre: "PA axial de ramas mandibulares", categoria: ["Axiales"], tipo: "R",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "Sí · 20 a 25° cefálico", rotacion: "No" }),
      rc: { direccion: "cefálico", angulo: "20 a 25°", texto: "20 a 25° cefálico, saliendo por el acantión; RI centrado en el RC." },
      posicion: [
        "Paciente en decúbito prono o sentado frente a la rejilla vertical.",
        PRONO_FRENTE,
      ],
      criterios: crit(["Cuerpo y ramas mandibulares; desplazamientos en fracturas de rama."], [
        "Cuerpo y ramas simétricos.",
        "Apófisis condíleas.",
        "Mandíbula completa.",
      ]),
      fuente: V2(369),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-cuerpo-pa", region: "mandibula", nombre: "PA de cuerpo mandibular", categoria: ["PA"], tipo: "E",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "No", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a la altura de los labios; RI centrado en el RC." },
      posicion: [
        "Paciente en decúbito prono o sentado frente a la rejilla vertical.",
        PRONO_MENTON,
      ],
      criterios: crit(["Cuerpo mandibular."], ["Cuerpo mandibular simétrico."]),
      fuente: V2(370),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-cuerpo-pa-axial", region: "mandibula", nombre: "PA axial de cuerpo mandibular", categoria: ["Axiales"], tipo: "E",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "Sí · 30° cefálico", rotacion: "No" }),
      rc: { direccion: "cefálico", angulo: "30°", texto: "30° cefálico, al punto medio entre las ATM; RI centrado en el RC." },
      posicion: [
        "Paciente en decúbito prono o sentado frente a la rejilla vertical.",
        PRONO_MENTON,
        "Zanelli proponía inflar la boca de aire para mejorar el contraste alrededor de las ATM.",
      ],
      criterios: crit(["Cuerpo mandibular y ATM."], [
        "ATM justo por debajo de las mastoides.",
        "Ramas simétricas.",
      ]),
      fuente: V2(371),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-axiolateral-oblicua", region: "mandibula", nombre: "Axiolateral oblicua de mandíbula", categoria: ["Oblicuas"], tipo: "R",
      factores: f(RI + ", según la región", { parrilla: BUCKY, angulacion: "Sí · 25° cefálico", rotacion: "Sí · rama: lateral verdadera · cuerpo: 30° hacia el RI · sínfisis: 45° hacia el RI" }),
      rc: { direccion: "cefálico", angulo: "25°", texto: "25° cefálico, atravesando la región de interés; con rejilla vertical, RI centrado en el RC." },
      posicion: [
        "Paciente sentado, semiprono o semisupino (en semisupino, RI sobre una cuña).",
        "Cabeza en lateral con la línea interpupilar perpendicular al RI; boca cerrada y dientes juntos.",
        "Extender el cuello hasta que el eje largo del cuerpo mandibular quede paralelo al eje transversal del RI (evita la columna cervical).",
        "Girar la cabeza hacia el RI según la zona: rama 0° (lateral verdadera), cuerpo 30°, sínfisis 45°.",
      ],
      criterios: crit(["La región mandibular que queda paralela al RI."], [
        "Rama y cuerpo: rama sin la otra hemimandíbula ni la columna cervical encima, sin elongación ni escorzo.",
        "Sínfisis: región mentoniana sin la otra hemimandíbula encima y sin escorzo.",
      ]),
      notas: ["En pacientes musculosos o hiperesténicos, inclinar el plano medio sagital unos 15° (abierto hacia abajo) y usar 10° cefálico para mantener los 25° entre RC y la parte sin que el hombro tape la mandíbula."],
      fuente: V2(372, 373, 374),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-smv", region: "mandibula", nombre: "Submentovertical de mandíbula", categoria: ["Axiales"], tipo: "E",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "No · RC perpendicular a la LIOM", rotacion: "No" }),
      rc: { direccion: "perpendicular", texto: "Perpendicular a la LIOM, centrado en el punto medio entre los ángulos mandibulares." },
      posicion: [
        "Paciente de pie frente a la rejilla vertical o en supino con los hombros elevados y las rodillas flexionadas.",
        "Plano medio sagital en la línea media de la rejilla.",
        "Extender del todo el cuello, cabeza apoyada en el vértex con el plano medio sagital vertical y la LIOM lo más paralela posible al RI (si no se logra, inclinar la rejilla paralela a la LIOM).",
        "Inmovilizar.",
      ],
      criterios: crit(["Cuerpo mandibular con las apófisis coronoides y condíleas."], [
        "Igual distancia entre el borde lateral del cráneo y la mandíbula en ambos lados.",
        "Cóndilos por delante de los peñascos.",
        "Sínfisis llegando casi al borde anterior de la cara (sin escorzo).",
      ]),
      fuente: V2(375),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "atm-ap-axial", region: "atm", nombre: "AP axial de ATM", categoria: ["Axiales"], tipo: "R",
      factores: f(RI + ", longitudinal", { parrilla: BUCKY, angulacion: "Sí · 35° caudal", rotacion: "No" }),
      rc: { direccion: "caudal", angulo: "35°", texto: "35° caudal, centrado entre ambas ATM y entrando unos 7,6 cm por encima del nasión; RI centrado en el RC." },
      posicion: [
        "Paciente en decúbito supino o sentado con el occipucio contra el bucky vertical.",
        "Plano medio sagital perpendicular al RI.",
        "Flexionar el cuello hasta que la LOM quede perpendicular al RI.",
        ATM_BOCA,
      ],
      criterios: crit(["Cóndilos mandibulares y fosas mandibulares de los temporales."], [
        "Cabeza sin rotación.",
        "Boca cerrada: superposición mínima del peñasco sobre el cóndilo.",
        "Boca abierta: cóndilo y ATM por debajo del peñasco.",
      ]),
      fuente: V2(376, 377),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "atm-axiolateral", region: "atm", nombre: "Axiolateral de ATM (D e I)", categoria: ["Perfil"], tipo: "E",
      factores: f(RI + ", transversal", { parrilla: BUCKY, angulacion: "Sí · 25 a 30° caudal", rotacion: "No · lateral verdadero" }),
      rc: { direccion: "caudal", angulo: "25 a 30°", texto: "25-30° caudal al centro del RI, entrando 1,3 cm por delante y 5 cm por encima del MAE de arriba." },
      posicion: [
        "Si hace falta, marcar cada mejilla 1,3 cm por delante y 2,5 cm por debajo del MAE para ubicar las ATM.",
        "Paciente semiprono o sentado frente a la rejilla vertical.",
        "Centrar en el RI un punto 1,3 cm por delante del MAE, con la cabeza en lateral y el lado afectado contra el RI.",
        "Plano medio sagital paralelo y línea interpupilar perpendicular al RI; inmovilizar.",
        ATM_BOCA,
      ],
      criterios: crit(["ATM con la boca abierta y cerrada; examinar y comparar ambos lados."], [
        "ATM por delante del MAE.",
        "Boca cerrada: cóndilo dentro de la fosa mandibular.",
        "Boca abierta: cóndilo por debajo del tubérculo articular (si puede abrir del todo).",
      ]),
      fuente: V2(378, 379),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "atm-axiolateral-oblicua", region: "atm", nombre: "Axiolateral oblicua de ATM (D e I)", categoria: ["Oblicuas"], tipo: "R",
      factores: f(RI + ", transversal", { parrilla: BUCKY, angulacion: "Sí · 15° caudal", rotacion: "Sí · plano medio sagital girado 15° hacia el RI" }),
      rc: { direccion: "caudal", angulo: "15°", texto: "15° caudal, saliendo por la ATM cercana al RI; entra unos 3,8 cm por encima del MAE de arriba." },
      posicion: [
        "Paciente semiprono o sentado frente a la rejilla vertical; usar cambiador de chasis o bandeja Bucky para no mover la cabeza entre exposiciones.",
        "Centrar en el RI un punto 1,3 cm por delante del MAE, con la mejilla apoyada en la rejilla.",
        "Girar el plano medio sagital unos 15° hacia el RI; línea interpupilar perpendicular.",
        "LCM paralela al eje transversal del RI; inmovilizar.",
        ATM_BOCA,
      ],
      criterios: crit(["Cóndilos y cuellos mandibulares y su relación con la fosa; en boca cerrada, fracturas de cuello y cóndilo."], [
        "ATM visible.",
        "Boca cerrada: cóndilo dentro de la fosa mandibular.",
        "Boca abierta: cóndilo por debajo del tubérculo articular (si puede abrir del todo).",
      ]),
      fuente: V2(380, 381),
      ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mandibula-panoramica", region: "mandibula", nombre: "Panorámica de mandíbula", metodo: "Tomografía panorámica", categoria: ["Métodos especiales"], tipo: "E",
      factores: f("Película de 12,7 × 30,5 cm o 12,7 × 35,6 cm en RI flexible (equipo panorámico)", { parrilla: "No (colimación por ranura)", respiracion: "Sin dato en el atlas", angulacion: "No", rotacion: "No · el tubo y el RI giran alrededor del paciente (o el paciente y la película)" }),
      rc: { direccion: "sin-dato", texto: "Haz colimado por una ranura vertical estrecha; el atlas no da un RC como en las proyecciones convencionales." },
      posicion: [
        "Paciente sentado e inmovilizado con el sujetacabezas y el mordedor radiotransparente del equipo (la silla puede retirarse para silla de ruedas).",
        "La rotación dura entre 10 y 20 segundos según el equipo.",
      ],
      criterios: crit(["Toda la mandíbula sin distorsión, con las ATM y ambas arcadas dentarias."], []),
      notas: ["Para ubicar fragmentos en fracturas se complementa con una AP, PA o SMV."],
      revision: "El atlas describe el equipo y no da criterios de evaluación ni respiración.",
      fuente: V2(382, 383),
      ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
