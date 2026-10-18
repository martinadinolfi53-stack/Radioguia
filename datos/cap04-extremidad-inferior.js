// Capítulo 4 · Extremidad inferior (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 101-148).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// El manual no indica respiración para estas proyecciones: se deja en null.
// Factores generales del capítulo (pág. 103): tiempo de exposición corto, punto focal pequeño, mAs suficiente
// para una buena densidad (brillo) y parrilla para regiones de más de 10 cm de grosor. Colimar a los cuatro lados
// (con al menos dos bordes paralelos visibles), centrar bien la parte y el RC, y proteger con plomo los tejidos
// radiosensibles en todos los estudios de extremidad inferior. Si se hacen varias exposiciones en un mismo RI,
// colimar con cuidado y cubrir con plomo el resto del chasis.

const DFRI = "100 cm (40\")";
const RI_18x24_H = "18 × 24 cm (8 × 10\"), horizontal";
const RI_18x24_V = "18 × 24 cm (8 × 10\"), vertical";
const RI_24x30_V = "24 × 30 cm (10 × 12\"), vertical";
const PARRILLA_RODILLA = "Sí si el grosor supera 10 cm; sin parrilla si es menor de 10 cm";
const TEC = ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Partes blandas y trabeculación ósea nítidas."];
const TEC_TOBILLO = ["Densidad y contraste (brillo) suficientes para ver tenuemente el peroné distal a través del astrágalo, sin movimiento.", "Bordes óseos y trabeculación ósea nítidos."];
const SIN_CRITERIOS = []; // el manual no trae página de criterios: se deja vacío para completar después

export default {
  capitulo: 4,
  titulo: "Extremidad inferior",
  paginas: "101-148",
  regiones: [
    { id: "dedos-pie", nombre: "Dedos del pie", detalle: "Incluye sesamoideos" },
    { id: "pie", nombre: "Pie", detalle: "" },
    { id: "calcaneo", nombre: "Calcáneo", detalle: "" },
    { id: "tobillo", nombre: "Tobillo", detalle: "" },
    { id: "pierna", nombre: "Pierna", detalle: "Tibia y peroné" },
    { id: "rodilla", nombre: "Rodilla", detalle: "" },
    { id: "fosa-rotula", nombre: "Fosa intercondílea y rótula", detalle: "" },
    { id: "ext-inf-pediatrica", nombre: "Extremidad inferior pediátrica", detalle: "" },
  ],
  proyecciones: [
    // ───────── Dedos del pie ─────────
    {
      id: "dedos-pie-ap", region: "dedos-pie", nombre: "AP de dedos del pie", categoria: ["AP"], tipo: "R",
      factores: { ri: RI_18x24_H, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados alrededor del área de interés, hasta incluir las partes blandas" },
      rc: { direccion: "angulado", angulo: "10-15° hacia el calcáneo", texto: "Angulado 10-15° hacia el calcáneo (perpendicular al eje longitudinal de los dedos), centrado en las articulaciones MTF de interés." },
      posicion: [
        "Decúbito supino o sentado en la mesa, con la rodilla flexionada y la planta del pie apoyada sobre el RI.",
        "Eje longitudinal de los dedos afectados alineado con la zona del RI que se expone.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el dedo y, como mínimo, la mitad distal del metatarsiano afectado."]],
        ["Posicionamiento", ["Dedos y metatarsianos vecinos sin superponerse.", "Sin rotación: diáfisis de falanges y metatarsianos con la misma concavidad de los dos lados."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Bordes corticales y trabéculas óseas nítidos."]],
      ],
      notas: ["Como protocolo de rutina alternativo, el manual sugiere incluir todo el pie en la AP para no pasar por alto un traumatismo en otra zona (ver AP de pie)."],
      fuente: { paginas: [104, 106] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "dedos-pie-ap-oblicua", region: "dedos-pie", nombre: "AP oblicua de dedos del pie", categoria: ["Oblicuas"], tipo: "E",
      factores: { ri: RI_18x24_H, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados alrededor del área de interés, hasta incluir las partes blandas" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en las articulaciones MTF de interés." },
      posicion: [
        "Decúbito supino o sentado en la mesa, con el pie apoyado sobre el RI.",
        "Eje longitudinal de los dedos afectados alineado con la zona del RI que se expone.",
        "Oblicuar el pie 30-45°: hacia medial para los dedos 1.º a 3.º y hacia lateral para el 4.º y el 5.º. Poner un apoyo debajo del pie.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el dedo y, como mínimo, la mitad distal del metatarsiano afectado."]],
        ["Posicionamiento", ["Mayor concavidad de un lado de la diáfisis de la falange."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Bordes corticales y trabéculas óseas nítidos."]],
      ],
      fuente: { paginas: [105, 106] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "dedos-pie-lateral", region: "dedos-pie", nombre: "Lateral de dedos del pie (mediolateral o lateromedial)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_18x24_H, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Ajustada al dedo de interés, hasta incluir las partes blandas" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación IF del 1.er dedo o en la articulación IFP de los dedos 2.º a 5.º." },
      posicion: [
        "Sentado o en decúbito sobre el tablero de la mesa.",
        "Separar con cuidado los dedos que no se estudian, usando cinta o gasa radiotransparente.",
        "Dedos 1.º a 3.º: lateromedial (1.er dedo abajo). Dedos 4.º y 5.º: mediolateral (1.er dedo arriba).",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el dedo, incluida la falange proximal."]],
        ["Posicionamiento", ["Los dedos vecinos no se superponen.", "La falange proximal se ve a través de las estructuras superpuestas."]],
        ["Criterios técnicos", ["Contraste y densidad (brillo) suficientes para ver partes blandas y hueso, sin movimiento."]],
      ],
      fuente: { paginas: [107, 109] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "dedos-pie-tangencial-sesamoideos", region: "dedos-pie", nombre: "Tangencial de dedos del pie: sesamoideos", categoria: ["Tangenciales"], tipo: "E",
      factores: { ri: RI_18x24_H, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Ajustada al área de interés, incluyendo las partes distales de los metatarsianos 1.º, 2.º y 3.º para ver posibles sesamoideos" },
      rc: { direccion: "variable", texto: "Perpendicular, o angulado si hace falta según cuánta flexión dorsal tenga el pie; centrado en la cabeza del primer metatarsiano." },
      posicion: [
        "Decúbito prono, con el pie y el primer dedo en flexión dorsal, de modo que la planta quede a 15-20° de la vertical si se puede (si no, ajustar el ángulo del RC).",
        "Alternativa en decúbito supino: suele tolerarse mejor si el paciente tiene mucho dolor; el paciente sostiene los dedos con una tira larga de gasa.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Sesamoideos de perfil."]],
        ["Posicionamiento", ["Sesamoideos sin superponerse a los metatarsianos.", "Partes distales de los metatarsianos 1.º a 3.º de perfil."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Partes blandas, trabéculas y bordes corticales nítidos."]],
      ],
      fuente: { paginas: [108, 109] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Pie ─────────
    {
      id: "pie-ap-dorsoplantar", region: "pie", nombre: "AP dorsoplantar de pie", categoria: ["AP"], tipo: "R",
      factores: { ri: "24 × 30 cm (10 × 12\"), vertical", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes del pie" },
      rc: { direccion: "angulado", angulo: "10° posterior (hacia el talón)", texto: "Perpendicular a los metatarsianos, lo que equivale a unos 10° en dirección posterior (hacia el talón), centrado en la base del 3.er metatarsiano." },
      posicion: [
        "Decúbito supino o sentado, con la planta apoyada plana sobre el RI y alineada a lo largo de la zona que se expone.",
        "Extender el pie (flexión plantar), deslizando pie y RI hacia distal sin despegar la planta del RI. Apoyar sobre bolsas de arena para que no se deslicen más.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el pie: tarsianos, metatarsianos y falanges."]],
        ["Posicionamiento", ["Sin rotación, con los tarsianos superpuestos."]],
        ["Criterios técnicos", TEC],
      ],
      fuente: { paginas: [110, 112] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pie-ap-oblicua-medial", region: "pie", nombre: "AP oblicua medial de pie", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes del pie y la parte distal del tobillo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la base del 3.er metatarsiano." },
      posicion: [
        "Decúbito supino o sentado, con el pie centrado a lo largo de la zona del RI que se expone.",
        "Oblicuar el pie 30-40° hacia medial, apoyado en un bloque angular radiotransparente de 45° y con bolsas de arena para que no se deslice.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el pie: tarsianos, metatarsianos y falanges."]],
        ["Posicionamiento", ["Metatarsianos 3.º a 5.º sin superponerse.", "Cuboides bien visible y base del 5.º metatarsiano de perfil."]],
        ["Criterios técnicos", TEC],
      ],
      notas: [
        "Con bóveda plantar alta conviene una oblicuidad más cercana a 45°; con pie plano (bóveda baja), más cercana a 30°.",
        "Una oblicua lateral a 30° muestra el espacio entre los metatarsianos 1.º y 2.º y entre las cuñas (cuneiformes) 1.ª y 2.ª.",
      ],
      fuente: { paginas: [111, 112] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pie-lateral", region: "pie", nombre: "Lateral de pie (mediolateral o lateromedial)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal (hasta el pie) o 24 × 30 cm (10 × 12\"), horizontal para pies grandes", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes del pie y la parte distal del tobillo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la zona de la base del tercer metatarsiano." },
      posicion: [
        "Mediolateral: decúbito sobre el lado afectado, con la rodilla flexionada y la pierna sana por detrás para no rotar de más.",
        "Si hace falta, poner un apoyo debajo de la rodilla y la pierna afectadas para que la planta quede perpendicular al RI y el pie en lateral verdadera.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el pie, con unos 2,5 cm (1\") de tibia y peroné distales."]],
        ["Posicionamiento", ["Lateral verdadera, con la articulación tibioastragalina abierta.", "Metatarsianos distales superpuestos."]],
        ["Criterios técnicos", TEC],
      ],
      notas: ["Si el estado del paciente lo permite, la lateromedial puede facilitar una lateral verdadera."],
      fuente: { paginas: [113, 114] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pie-ap-lateral-carga", region: "pie", nombre: "AP y lateral de pies en carga", categoria: ["AP", "Perfil"], tipo: "E",
      factores: { ri: "24 × 30 cm (10 × 12\"), horizontal; 35 × 43 cm (14 × 17\"), horizontal para estudio bilateral", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Hasta los bordes cutáneos externos de los pies" },
      rc: { direccion: "variable", texto: "AP: 15° en dirección posterior (cefálica), a la altura de la base del 3.er metatarsiano y a mitad de camino entre los dos pies. Lateral: horizontal, hacia la base del 5.º metatarsiano." },
      posicion: [
        "AP: de pie, con el peso repartido por igual entre los dos pies, parado sobre el RI.",
        "Lateral: de pie, con todo el peso sobre los dos pies y el RI vertical entre ellos. Los pies se apoyan en bloques lo bastante altos como para usar un RC horizontal. Se radiografían el pie derecho y el izquierdo para comparar.",
      ],
      criterios: [
        ["Estructuras que se ven", ["AP: los dos pies, con detalle de partes blandas.", "Lateral: todo el pie, con 2,5 cm (1\") de tibia y peroné distales."]],
        ["Posicionamiento", ["AP: articulaciones tarsometatarsianas abiertas y separación parecida entre los metatarsianos 2.º a 4.º.", "Lateral: se ve desde el dorso hasta la planta, con las cabezas de los metatarsianos superpuestas."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Partes blandas, bordes corticales y trabeculación ósea nítidos."]],
      ],
      notas: ["La lateral se usa más para estudiar la bóveda plantar longitudinal (pie plano); la AP muestra la alineación de metatarsianos y falanges. Suelen hacerse los dos pies para comparar."],
      fuente: { paginas: [115, 116] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Calcáneo ─────────
    {
      id: "calcaneo-plantodorsal-axial", region: "calcaneo", nombre: "Plantodorsal (axial) de calcáneo", categoria: ["Axiales"], tipo: "R",
      factores: { ri: RI_18x24_V, dfri: DFRI, respiracion: null, parrilla: "No (pantallas para mejorar el detalle)", colimacion: "Ajustada a la región del calcáneo" },
      rc: { direccion: "angulado", angulo: "40° respecto al eje longitudinal de la planta", texto: "Angulado 40° respecto al eje longitudinal de la superficie plantar (puede hacer falta más de 40° respecto a la vertical si el pie no llega a 90° de flexión dorsal). Centrado en la base del 3.er metatarsiano, para que el calcáneo se proyecte justo distal e inferior a la articulación del tobillo." },
      posicion: [
        "Decúbito supino, con el pie en flexión dorsal lo más cerca posible de la vertical. Si se puede, el paciente tira de una gasa para sostenerlo; como puede doler, hay que trabajar rápido.",
        "Centrar el RC en la región del calcáneo, con el RI centrado sobre el RC proyectado.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el calcáneo, desde la tuberosidad hasta la articulación subastragalina."]],
        ["Posicionamiento", ["Sin rotación, con el sustentáculo del calcáneo de perfil hacia medial."]],
        ["Criterios técnicos", TEC_TOBILLO],
      ],
      notas: ["Por la angulación tan marcada del RC, el calcáneo se coloca sobre la parte inferior del RI, la más cercana al tubo."],
      fuente: { paginas: [117, 119] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "calcaneo-lateral", region: "calcaneo", nombre: "Lateral (mediolateral) de calcáneo", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_18x24_V, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta el área del calcáneo, con la articulación del tobillo en el borde superior" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del calcáneo, 2,5 cm (1\") por debajo del maléolo medial." },
      posicion: [
        "Decúbito sobre el lado afectado, rodilla flexionada y la pierna sana por detrás para no rotar de más.",
        "Si hace falta, poner un apoyo debajo de la rodilla y la pierna para lograr una lateral verdadera.",
        "Flexión dorsal del pie para que la planta quede cerca de 90° respecto de la pierna, si se puede.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Calcáneo de perfil, con el astrágalo y la parte distal de tibia y peroné."]],
        ["Posicionamiento", ["Astrágalo parcialmente superpuesto y articulación subastragalina abierta."]],
        ["Criterios técnicos", TEC_TOBILLO],
      ],
      fuente: { paginas: [118, 119] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Tobillo ─────────
    {
      id: "tobillo-ap", region: "tobillo", nombre: "AP de tobillo", categoria: ["AP"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Hasta los bordes cutáneos laterales, incluyendo la mitad proximal de los metatarsianos y la parte distal de tibia y peroné" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, a mitad de camino entre los maléolos." },
      posicion: [
        "Decúbito supino o sentado en la mesa, pierna extendida, con un apoyo debajo de la rodilla.",
        "Pierna y tobillo paralelos al borde del RI.",
        "AP verdadera, sin rotación: eje longitudinal del pie vertical, paralelo al RC.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Tercio distal de tibia y peroné, maléolos lateral y medial, astrágalo y metatarsianos proximales."]],
        ["Posicionamiento", ["Sin rotación, con las partes medial y lateral de la articulación de la mortaja abiertas."]],
        ["Criterios técnicos", ["Densidad y contraste (brillo) suficientes para ver tenuemente el peroné distal a través del astrágalo, sin movimiento.", "Partes blandas, bordes óseos y trabeculación ósea nítidos."]],
      ],
      fuente: { paginas: [120, 123] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "tobillo-ap-mortaja", region: "tobillo", nombre: "AP de mortaja del tobillo (rotación medial 15-20°)", categoria: ["AP", "Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Hasta los bordes cutáneos laterales, incluyendo tibia y peroné distales y metatarsianos proximales" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, a mitad de camino entre los maléolos." },
      posicion: [
        "Decúbito supino o sentado en la mesa, pierna extendida, con un apoyo debajo de la rodilla.",
        "Rotar hacia adentro 15-20° la pierna y el eje longitudinal del pie, hasta que la línea intermaleolar quede paralela al tablero.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Toda la mortaja abierta, con el tercio distal de tibia y peroné, los maléolos lateral y medial, el astrágalo y la mitad proximal de los metatarsianos."]],
        ["Posicionamiento", ["Superficies articulares lateral y medial de la mortaja abiertas y maléolos de perfil."]],
        ["Criterios técnicos", ["Densidad y contraste (brillo) suficientes para ver tenuemente el peroné distal a través del astrágalo, sin movimiento.", "Partes blandas, bordes óseos y trabeculación ósea nítidos."]],
      ],
      notas: [
        "Es una proyección frontal de toda la mortaja; por lo general no reemplaza a la AP de rutina ni a la oblicua de 45°.",
        "La base del 5.º metatarsiano, sitio frecuente de fractura, se ve en esta proyección.",
      ],
      fuente: { paginas: [121, 123] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "tobillo-ap-oblicua-45", region: "tobillo", nombre: "AP oblicua de tobillo con rotación medial de 45°", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Hasta la región del tobillo, incluyendo metatarsianos proximales y la parte distal de tibia y peroné" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, a mitad de camino entre los maléolos." },
      posicion: [
        "Decúbito supino o sentado, pierna extendida, con un apoyo debajo de la rodilla.",
        "Rotar pierna y pie 45° hacia medial (eje longitudinal del pie a 45° respecto del RI).",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Tercio distal de tibia y peroné, maléolos, astrágalo, calcáneo y mitad proximal de los metatarsianos."]],
        ["Posicionamiento", ["Articulación tibioperonea distal abierta.", "Astrágalo y maléolo medial sin superposición o con superposición mínima."]],
        ["Criterios técnicos", ["Densidad y contraste (brillo) suficientes para ver tenuemente el peroné distal a través del astrágalo, sin movimiento.", "Partes blandas, bordes óseos y trabeculación ósea nítidos."]],
      ],
      notas: ["La base del 5.º metatarsiano, sitio frecuente de fractura, puede verse en las oblicuas de tobillo."],
      fuente: { paginas: [122, 123] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "tobillo-lateral", region: "tobillo", nombre: "Lateral de tobillo (mediolateral o lateromedial)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: "No (pantallas para mejorar el detalle)", colimacion: "Cuatro lados hasta la región del tobillo, incluyendo tibia y peroné distales y metatarsianos proximales" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en el maléolo medial." },
      posicion: [
        "Decúbito con el lado afectado abajo y la rodilla afectada algo flexionada.",
        "Flexión dorsal del pie hasta 90° respecto de la pierna, si el paciente lo tolera.",
        "Si hace falta, poner un apoyo debajo de la rodilla para que pie y tobillo queden en lateral verdadera.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Tercio distal de tibia y peroné, con los tarsianos en lateral y la base del 5.º metatarsiano, el navicular y el cuboides."]],
        ["Posicionamiento", ["Lateral verdadera sin rotación: peroné distal superpuesto a la mitad posterior de la tibia.", "Articulación tibioastragalina abierta."]],
        ["Criterios técnicos", TEC_TOBILLO],
      ],
      notas: ["Si el estado del paciente lo permite, también se puede hacer lateromedial; a veces así es más fácil lograr una lateral verdadera."],
      fuente: { paginas: [124, 125] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "tobillo-ap-estres", region: "tobillo", nombre: "AP de tobillo con sobrecarga o forzada (inversión y eversión)", categoria: ["AP"], tipo: "E",
      factores: { ri: "24 × 30 cm (10 × 12\"), vertical, o 35 × 43 cm (14 × 17\"), horizontal", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Hasta los bordes cutáneos laterales, incluyendo metatarsianos proximales y la parte distal de tibia y peroné" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, a mitad de camino entre los maléolos." },
      posicion: [
        "Decúbito supino o sentado en la mesa, pierna extendida.",
        "Sin rotar la pierna ni el tobillo (AP verdadera), forzar la articulación del tobillo: primero girando la planta hacia adentro (inversión) y después hacia afuera (eversión).",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Advertencia: la sobrecarga se aplica con mucho cuidado, con una gasa larga que sostiene el paciente o a mano por personal capacitado con guantes y delantal plomados. Puede requerir que un médico inyecte anestesia local."],
      fuente: { paginas: [126] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Pierna ─────────
    {
      id: "pierna-ap", region: "pierna", nombre: "AP de pierna (tibia-peroné)", categoria: ["AP"], tipo: "R",
      factores: { ri: "35 × 43 cm (14 × 17\"), vertical; en diagonal solo si hace falta para incluir tobillo y rodilla", dfri: "DFRI mínima de 100 cm (40\"); se puede aumentar hasta 115-125 cm (44-48\")", respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes cutáneos, incluyendo las articulaciones de la rodilla y el tobillo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la pierna (parte media del RI)." },
      posicion: [
        "Decúbito supino, pierna extendida, sin rotación de rodilla, pierna ni tobillo.",
        "Incluir como mínimo unos 3 cm (1-1,5\") más allá de las articulaciones de la rodilla y el tobillo, por la divergencia del haz.",
        "Rodilla hacia el extremo del cátodo, para aprovechar el efecto anódico (talón).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Toda la tibia y todo el peroné, con las articulaciones del tobillo y la rodilla."]],
        ["Posicionamiento", ["Sin rotación: cóndilos femorales y tibiales de perfil.", "Leve superposición en las articulaciones tibioperoneas proximal y distal."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste casi parejos a lo largo de la pierna, sin movimiento.", "Partes blandas y trabeculación ósea nítidas."]],
      ],
      fuente: { paginas: [127, 129] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pierna-mediolateral", region: "pierna", nombre: "Mediolateral de pierna (tibia-peroné)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "35 × 43 cm (14 × 17\"), vertical; en diagonal, o dos RI separados, para incluir las dos articulaciones", dfri: "DFRI mínima de 100 cm (40\"); se puede aumentar hasta 115-125 cm (44-48\")", respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes cutáneos, incluyendo las articulaciones de la rodilla y el tobillo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la pierna (parte media del RI)." },
      posicion: [
        "Decúbito con el lado afectado abajo; la pierna sana va por detrás para no rotar de más.",
        "Si hace falta, poner un apoyo debajo de la parte distal del pie afectado para que pie, tobillo y rodilla queden en lateral verdadera.",
        "Las articulaciones del tobillo y la rodilla tienen que quedar a 3-5 cm (1-2\") de los extremos del RI.",
        "Rodilla hacia el extremo del cátodo, para aprovechar el efecto anódico (talón).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Toda la tibia y todo el peroné, con las articulaciones del tobillo y la rodilla."]],
        ["Posicionamiento", ["Tuberosidad tibial de perfil.", "Peroné distal superpuesto a la parte posterior de la tibia."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste casi parejos a lo largo de la pierna, sin movimiento.", "Partes blandas y trabeculación ósea nítidas."]],
      ],
      fuente: { paginas: [128, 129] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Rodilla ─────────
    {
      id: "rodilla-ap", region: "rodilla", nombre: "AP de rodilla", categoria: ["AP"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: PARRILLA_RODILLA, colimacion: "A los lados hasta los bordes cutáneos; a lo largo, hasta los bordes del RI" },
      rc: { direccion: "variable", texto: "Centrado 1,25 cm (½\") distal al vértice de la rótula y paralelo a la meseta tibial. Para elegir el ángulo se mide la distancia de la EIAS al tablero de la mesa: menos de 19 cm (muslos y nalgas delgados), 3-5° caudal; 19-24 cm (medianos), 0°, perpendicular al RI; más de 24 cm (gruesos), 3-5° cefálico." },
      posicion: [
        "Decúbito supino o sentado en la mesa, pierna extendida y centrada en el RC y en la línea media de la mesa o del RI.",
        "Si hace falta, rotar un poco la pierna hacia adentro para que rodilla y pierna queden en AP verdadera.",
        "Centrar el RI con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Espacio articular femorotibial abierto."]],
        ["Posicionamiento", ["Sin rotación: cóndilos femorales y tibiales simétricos.", "La tibia se superpone a la mitad medial de la cabeza del peroné.", "Se ve la eminencia intercondílea."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, con el contorno de la rótula visible a través del fémur distal, sin movimiento.", "Partes blandas y trabeculación ósea nítidas."]],
      ],
      fuente: { paginas: [130, 132] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "rodilla-ap-oblicuas", region: "rodilla", nombre: "AP oblicua de rodilla con rotación medial y lateral", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: PARRILLA_RODILLA, colimacion: "A los lados hasta los bordes cutáneos; a lo largo, hasta los bordes del RI" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI en un paciente de contextura media (ver AP de rodilla), centrado en la parte media del espacio articular, 1,25 cm (½\") por debajo de la rótula." },
      posicion: [
        "Semidecúbito supino, pierna extendida y centrada en el RC y en la línea media de la mesa.",
        "Oblicua medial: rotar 45° hacia adentro toda la extremidad (rodilla, tobillo y pie).",
        "Oblicua lateral (externa): rotar 45° hacia afuera toda la extremidad.",
        "Centrar el RI con el RC.",
      ],
      criterios: [
        ["Oblicua medial · estructuras", ["Articulación tibioperonea proximal abierta.", "Cóndilos laterales del fémur y la tibia de perfil."]],
        ["Oblicua medial · posicionamiento", ["Articulación tibioperonea proximal abierta y cóndilos tibiales laterales visibles.", "Cabeza y cuello del peroné y mitad de la rótula sin superposición."]],
        ["Oblicua lateral · estructuras", ["Cóndilos mediales del fémur y la tibia de perfil."]],
        ["Oblicua lateral · posicionamiento", ["Parte proximal de la tibia superpuesta a la parte proximal del peroné.", "Cóndilos mediales del fémur y la tibia de perfil.", "Alrededor de la mitad de la rótula sin superponerse al fémur."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, con el contorno de la rótula visible a través del fémur distal, sin movimiento.", "Partes blandas y trabeculación ósea nítidas."]],
      ],
      notas: ["La oblicua medial muestra la cabeza y el cuello del peroné sin superposición; la lateral, los cóndilos mediales del fémur y la tibia de perfil."],
      fuente: { paginas: [131, 132] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "rodilla-lateral", region: "rodilla", nombre: "Lateral (mediolateral) de rodilla", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_24x30_V, dfri: DFRI, respiracion: null, parrilla: PARRILLA_RODILLA, colimacion: "A los lados hasta los bordes cutáneos; a lo largo, hasta los bordes del RI" },
      rc: { direccion: "cefálico", angulo: "5-7°", texto: "Angulado 5-7° cefálico, centrado a unos 2,5 cm (1\") distal al epicóndilo medial. Si se puede elevar la pierna hasta el plano del fémur, el RC puede ser perpendicular." },
      posicion: [
        "Paciente sobre el lado afectado, con la rodilla flexionada unos 20-30°, centrada en el RC y en la línea media de la mesa o del RI.",
        "La pierna y la rodilla sanas van por detrás para no rotar de más.",
        "Si hace falta, poner un apoyo debajo del tobillo y el pie afectados y ajustar la rotación del cuerpo para lograr una lateral verdadera de rodilla.",
        "Centrar el RI con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Fémur distal, tibia y peroné proximales y rótula en perfil lateral.", "Articulaciones femororrotuliana y de la rodilla abiertas."]],
        ["Posicionamiento", ["Lateral verdadera sin rotación, con los cóndilos femorales superpuestos.", "Rótula de perfil y articulación femororrotuliana abierta."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Partes blandas (almohadillas grasas) y trabeculación ósea nítidas."]],
      ],
      fuente: { paginas: [133, 134] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "rodilla-ap-pa-bilateral-carga", region: "rodilla", nombre: "AP o PA bilateral de rodillas en carga", categoria: ["AP", "PA"], tipo: "E",
      factores: { ri: "35 × 43 cm (14 × 17\"), horizontal", dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: "Región de las dos rodillas, incluyendo la parte distal de los fémures y la proximal de tibias y peronés" },
      rc: { direccion: "variable", texto: "En el punto medio entre las dos rodillas, unos 1,25 cm (½\") distal al vértice de las rótulas. AP: horizontal, perpendicular al RI en un paciente de contextura media (ver AP de rodilla). PA: 10° caudal (con las rodillas flexionadas unos 20°)." },
      posicion: [
        "AP: de pie, subido a un escalón o al estribo de la mesa si hace falta, a una altura que permita bajar el tubo y usar un rayo horizontal.",
        "Pies rectos hacia adelante y rodillas extendidas, con el peso repartido por igual. El paciente se sostiene de los agarraderos de la mesa.",
        "PA alternativa: el paciente mira hacia la mesa o el soporte del RI, con las rodillas apoyadas en él y flexionadas unos 20°.",
      ],
      criterios: SIN_CRITERIOS,
      fuente: { paginas: [135] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "rodilla-pa-axial-bilateral-rosenberg", region: "rodilla", nombre: "PA axial bilateral de rodillas en carga", metodo: "Rosenberg", categoria: ["PA", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "35 × 43 cm (14 × 17\"), horizontal", dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: "Región de las dos rodillas, incluyendo la parte distal de los fémures y la proximal de las tibias" },
      rc: { direccion: "caudal", angulo: "10°", texto: "Angulado 10° caudal, hacia la parte media de las articulaciones de las rodillas, 1,25 cm (½\") por debajo del vértice de la rótula." },
      posicion: [
        "De pie, en posición PA.",
        "Peso repartido por igual entre los dos pies.",
        "Rodillas flexionadas hasta 45°.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Fémur distal, tibia y peroné proximales, espacios articulares femorotibiales y fosa intercondílea."]],
        ["Posicionamiento", ["Las dos rodillas sin rotación, de aspecto simétrico.", "Superficies articulares de perfil."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Trabeculación ósea nítida."]],
      ],
      fuente: { paginas: [136, 137] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Fosa intercondílea y rótula ─────────
    {
      id: "fosa-rotula-tunel", region: "fosa-rotula", nombre: "PA y AP axial de fosa intercondílea («proyecciones del túnel»)", metodo: "Camp Coventry y Holmblad", categoria: ["PA", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: RI_18x24_V, dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: "Cuatro lados hasta el área de interés" },
      rc: { direccion: "variable", texto: "Camp Coventry: 40-50° caudal (perpendicular a la pierna), centrado en la articulación de la rodilla para que salga por el borde distal de la rótula. Holmblad: perpendicular a la pierna, en el pliegue poplíteo medio." },
      posicion: [
        "Camp Coventry: decúbito prono, rodilla flexionada 40-50°, con un apoyo grande debajo del tobillo.",
        "Holmblad: arrodillado sobre la mesa o parcialmente de pie; en la figura, el paciente se inclina hacia adelante 20-30°.",
        "Rodilla centrada en el RC y RI centrado en el RC proyectado.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Fosa intercondílea, cóndilos femorales, mesetas tibiales y eminencia intercondílea."]],
        ["Posicionamiento", ["Sin rotación: cóndilos femorales distales y eminencia intercondílea simétricos."]],
        ["Criterios técnicos", TEC],
      ],
      fuente: { paginas: [138, 141] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "fosa-rotula-pa-rotula", region: "fosa-rotula", nombre: "PA de rótula", categoria: ["PA"], tipo: "R",
      factores: { ri: RI_18x24_V, dfri: DFRI, respiracion: null, parrilla: "Sí", colimacion: "Hasta el área de la rótula y la articulación de la rodilla" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte central de la rótula (a la altura del pliegue poplíteo medio)." },
      posicion: [
        "Decúbito prono, rodilla centrada en el RC y en la línea media de la mesa o del RI.",
        "Si la rótula duele, poner una almohadilla debajo del muslo y la pierna para que no apoye directamente.",
        "Rotar hacia adentro unos 5° la cara anterior de la rodilla, o lo necesario para que la línea que une los epicóndilos quede paralela al RI.",
        "Centrar el RI con el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Articulación de la rodilla y rótula, que se perfila a través del fémur distal."]],
        ["Posicionamiento", ["Sin rotación: cóndilos femorales simétricos y rótula centrada respecto del fémur."]],
        ["Criterios técnicos", TEC],
      ],
      notas: ["El manual indica aumentar la exposición respecto de la PA de rodilla (el ajuste figura en la tabla de exposición, que la app no muestra)."],
      fuente: { paginas: [139, 141] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "fosa-rotula-lateral-rotula", region: "fosa-rotula", nombre: "Lateral (mediolateral) de rótula", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_18x24_V, dfri: DFRI, respiracion: null, parrilla: "No (pantallas para mejorar el detalle); se puede usar parrilla en pacientes de contextura grande", colimacion: "Hasta el área de la articulación de la rodilla, la rótula y la articulación femororrotuliana" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del espacio articular femororrotuliano." },
      posicion: [
        "Decúbito sobre el lado afectado, con la rodilla y la pierna del otro lado hacia atrás para no rotar de más.",
        "Flexionar la rodilla solo 5-10°, para no separar fragmentos si hubiera fractura.",
        "Articulación femororrotuliana centrada en el RC y en la línea media del RI.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Rótula, articulación femororrotuliana y articulación femorotibial de perfil."]],
        ["Posicionamiento", ["Rótula de perfil y articulación femororrotuliana abierta."]],
        ["Criterios técnicos", TEC],
      ],
      fuente: { paginas: [140, 141] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "fosa-rotula-axial-merchant", region: "fosa-rotula", nombre: "Axial tangencial bilateral de rótula", metodo: "Merchant", categoria: ["Axiales", "Tangenciales", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm (8 × 10\"), horizontal, o 35 × 43 cm (14 × 17\") para rodillas grandes", dfri: "120-180 cm (48-72\"); una DFRI mayor reduce la magnificación", respiracion: null, parrilla: "No", colimacion: "Hasta las rótulas y las dos articulaciones femororrotulianas" },
      rc: { direccion: "angulado", angulo: "30° respecto a la horizontal", texto: "Angulado 30° respecto a la horizontal (30° respecto al eje longitudinal de los fémures), en el punto medio entre las rótulas." },
      posicion: [
        "Decúbito supino, con las rodillas flexionadas 40° sobre soportes para las piernas. El paciente tiene que estar cómodo y con las piernas bien relajadas, para que la rótula no sea traccionada hacia el surco intercondíleo.",
        "Apoyar el RI sobre los soportes contra las piernas, unos 30 cm (12\") distal a las rótulas y perpendicular al RC.",
        "Hace falta un dispositivo regulable para sostener las piernas y el RI.",
      ],
      criterios: SIN_CRITERIOS,
      fuente: { paginas: [142] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "fosa-rotula-axial-settegast-hughston", region: "fosa-rotula", nombre: "Axial tangencial de rótula en decúbito prono", metodo: "Settegast y Hughston", categoria: ["Axiales", "Tangenciales", "Métodos especiales"], tipo: "E",
      factores: { ri: "24 × 30 cm (10 × 12\"), horizontal", dfri: "100-120 cm (40-48\")", respiracion: null, parrilla: "No", colimacion: "Ajustada a la región de la rótula" },
      rc: { direccion: "cefálico", angulo: "15-20° (Settegast) o 45° (Hughston)", texto: "Centrado en la parte media del espacio articular femororrotuliano. Settegast: 15-20° cefálico respecto del eje longitudinal de la pierna (rodilla flexionada 90°). Hughston: 45° cefálico respecto del eje longitudinal de la pierna (rodilla flexionada 50-60°)." },
      posicion: [
        "Settegast: decúbito prono, rodilla flexionada 90°.",
        "Hughston: decúbito prono, rodilla flexionada 50-60° desde la extensión completa.",
        "El paciente sostiene la pierna con una gasa larga o cinta. En Hughston el pie puede apoyarse en un soporte que no sea el colimador.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [
        "Por lo general se hacen los dos lados para comparar.",
        "Advertencia (fig. 4.63): el colimador puede calentarse; si el pie apoya ahí, usar una almohadilla.",
      ],
      fuente: { paginas: [143] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "fosa-rotula-tangencial-hobbs", region: "fosa-rotula", nombre: "Tangencial superoinferior de rótula en sedestación (bilateral)", metodo: "Modificación de Hobbs", categoria: ["Tangenciales", "Métodos especiales"], tipo: "E",
      factores: { ri: "35 × 43 cm (14 × 17\"), horizontal, o 18 × 24 cm (8 × 10\"), horizontal (unilateral)", dfri: "120-130 cm (48-50\")", respiracion: null, parrilla: "No", colimacion: "Región de las rodillas, fémur distal y rótula de los dos lados" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI (tangencial a la articulación femororrotuliana), centrado a mitad de camino entre las dos articulaciones femororrotulianas." },
      posicion: [
        "Paciente sentado.",
        "Rodillas flexionadas, con los pies debajo de la silla.",
        "RI apoyado sobre un banquito.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Rótula en proyección tangencial.", "Espacio articular femororrotuliano abierto."]],
        ["Posicionamiento", ["Rótula separada del surco intercondíleo.", "Espacio articular femororrotuliano abierto."]],
        ["Criterios técnicos", TEC],
      ],
      notas: ["Por lo general se hacen los dos lados en un mismo RI para comparar."],
      fuente: { paginas: [144, 145] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Pediatría ─────────
    {
      id: "ped-ext-inf-ap", region: "ext-inf-pediatrica", nombre: "AP de extremidad inferior (pediátrica)", categoria: ["AP"], tipo: "E",
      factores: { ri: "Según el tamaño del paciente", dfri: DFRI, respiracion: null, parrilla: "No (pantalla para mejorar el detalle)", colimacion: "Cuatro lados hasta el área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la extremidad (parte media del RI)." },
      posicion: [
        "Proteger los tejidos radiosensibles: decúbito supino, con toda la extremidad incluida y protección sobre la zona pélvica.",
        "Puede hacer falta un segundo RI para la pelvis o el fémur proximal.",
        "Inmovilizar los brazos y la pierna sana con bolsas de arena.",
        "Recurrir a los padres solo si hace falta, con guantes y delantal plomados.",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Si el área de interés es el pie, pueden bastar la AP y la lateral de pie."],
      fuente: { paginas: [146] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-ext-inf-lateral", region: "ext-inf-pediatrica", nombre: "Lateral de extremidad inferior (pediátrica)", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "Según el tamaño del paciente", dfri: DFRI, respiracion: null, parrilla: "No (pantalla para mejorar el detalle)", colimacion: "Cuatro lados hasta el área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la extremidad (parte media del RI)." },
      posicion: [
        "Proteger los tejidos radiosensibles: semidecúbito supino, con toda la extremidad incluida y protección sobre la zona pélvica.",
        "Inmovilizar los brazos y la pierna sana con bolsas de arena si hace falta.",
        "Llevar la extremidad afectada en abducción (pata de rana) hasta una posición lateral e inmovilizarla con cinta adhesiva o una banda de compresión. No hacerlo si hay traumatismo o enfermedad de la cadera.",
        "Recurrir a los padres solo si hace falta, con guantes y delantal plomados.",
      ],
      criterios: SIN_CRITERIOS,
      notas: ["Si el área de interés es el pie, pueden bastar la AP y la lateral de pie."],
      fuente: { paginas: [147] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-pie-ap-mediolateral-kite", region: "ext-inf-pediatrica", nombre: "AP y mediolateral de pie pediátrico (pie zambo congénito)", metodo: "Kite", categoria: ["AP", "Perfil", "Métodos especiales"], tipo: "E",
      factores: { ri: RI_18x24_V, dfri: DFRI, respiracion: null, parrilla: "No (pantallas para mejorar el detalle)", colimacion: "Cuatro lados, ajustada al área del pie" },
      rc: { direccion: "perpendicular", texto: "AP: perpendicular al RI, dirigido a los tarsianos medios (Kite propone no angular el rayo). Lateral: perpendicular, centrado en la zona metatarsiana proximal." },
      posicion: [
        "AP: elevar al paciente sobre un apoyo, con la rodilla flexionada y el pie sobre el RI.",
        "Lateral: paciente o pierna de costado, lado afectado abajo, sujetando con cinta adhesiva o una banda de compresión.",
      ],
      criterios: SIN_CRITERIOS,
      notas: [
        "Con el método de Kite no hay que intentar enderezar el pie al colocarlo sobre el RI. Los pies se sujetan o inmovilizan para obtener la frontal y la lateral a 90° una de otra.",
        "Por lo general se radiografían los dos pies para comparar.",
      ],
      fuente: { paginas: [148] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
