// Capítulo 3 · Húmero y cintura escapular (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 65-100).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// respiracion: null cuando el manual no la indica para esa proyección.
// Advertencia general del capítulo (pág. 66): no rotar el miembro superior si se sospecha fractura o luxación,
// salvo orden expresa del médico.

const DFRI = "100 cm";
const APNEA = "Apnea durante la exposición";
const TEC_HOMBRO = ["Densidad (brillo) y contraste óptimos.", "Detalle de partes blandas y trabeculación ósea nítidos, sin movimiento."];
const AVISO_TRAUMA = "No hacer esta proyección si se sospecha fractura o luxación.";

export default {
  capitulo: 3,
  titulo: "Húmero y cintura escapular",
  paginas: "65-100",
  regiones: [
    { id: "humero", nombre: "Húmero", detalle: "" },
    { id: "hombro", nombre: "Hombro", detalle: "Articulación escapulohumeral" },
    { id: "clavicula", nombre: "Clavícula", detalle: "" },
    { id: "escapula", nombre: "Escápula", detalle: "Omóplato" },
    { id: "acromioclaviculares", nombre: "Articulaciones acromioclaviculares", detalle: "AC" },
  ],
  proyecciones: [
    // ───────── Húmero ─────────
    {
      id: "humero-ap", region: "humero", nombre: "AP de húmero", categoria: ["AP"], tipo: "R",
      factores: { ri: "35 × 43 cm, vertical; en pacientes pequeños, 30 × 35 cm, vertical", dfri: DFRI, respiracion: null, parrilla: "Sí si el grosor supera 10 cm; sin parrilla si es menor de 10 cm", colimacion: "A los lados, hasta los bordes de partes blandas del húmero y el hombro" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del húmero." },
      posicion: [
        "De pie o en decúbito supino, con el húmero alineado con el eje largo del RI. Si hace falta, colocarlo en diagonal para incluir el codo y el hombro.",
        "Proteger las gónadas.",
        "Separar un poco el brazo (abducción) y supinar la mano para una AP verdadera: epicóndilos paralelos al RI.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el húmero, con las articulaciones del codo y glenohumeral."]],
        ["Posicionamiento", ["Sin rotación: epicóndilos medial y lateral de perfil y troquíter (tubérculo mayor) de perfil hacia lateral.", "Se ven la cabeza del húmero y la cavidad glenoidea."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes corticales y trabeculación ósea nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [67, 70] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "humero-lateral-rotacion", region: "humero", nombre: "Lateral de húmero con rotación", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "35 × 43 cm o 30 × 35 cm, vertical", dfri: DFRI, respiracion: null, parrilla: "Sí si el grosor supera 10 cm; sin parrilla si es menor de 10 cm", colimacion: "A los lados, hasta los bordes de partes blandas del húmero y el hombro" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del húmero." },
      posicion: [
        "Se puede hacer en PA o AP, de pie o en decúbito supino.",
        "De pie en PA: codo flexionado 90° y paciente rotado 15-20° desde la PA, lo necesario para que húmero y hombro toquen el soporte del RI. Epicóndilos perpendiculares al RI (lateral verdadera).",
        "AP de pie o en decúbito: codo un poco flexionado, brazo y muñeca rotados hasta una lateral (palma hacia atrás, en pronación), epicóndilos perpendiculares al RI.",
        "RI centrado de modo que entren el codo y el hombro. Proteger los tejidos radiosensibles fuera de la zona de interés.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Todo el húmero, con las articulaciones del codo y glenohumeral."]],
        ["Posicionamiento", ["Lateral verdadera: epicóndilos superpuestos."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes corticales y trabeculación ósea nítidos, sin movimiento."]],
      ],
      notas: ["No rotar el brazo si se sospecha fractura o luxación (ver lateral por traumatismo)."],
      fuente: { paginas: [68, 70] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "humero-lateral-trauma", region: "humero", nombre: "Lateral de húmero por traumatismo (medio y distal)", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "30 × 35 cm, horizontal, o 24 × 30 cm, horizontal", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, incluyendo las partes media y distal del húmero, el codo y el antebrazo proximal" },
      rc: { direccion: "horizontal", texto: "Horizontal y perpendicular al RI, centrado en el tercio distal del húmero." },
      posicion: [
        "Levantar el brazo con suavidad y poner un bloque de apoyo debajo. Si se puede, rotar la mano hasta una lateral verdadera del codo.",
        "RI paralelo al eje largo del húmero, entre el brazo y el tórax, con su borde superior en la axila. Poner protección entre el RI y el paciente.",
      ],
      criterios: [
        ["Estructuras que se ven", ["El manual no trae criterios propios para esta variante; los de la pág. 70 son los de la AP y la lateral de húmero."]],
      ],
      notas: ["Para el húmero proximal, usar la lateral transtorácica o la lateral en Y de escápula."],
      fuente: { paginas: [69] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "humero-transtoracica", region: "humero", nombre: "Lateral transtorácica de húmero (traumatismo)", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "35 × 43 cm, vertical", dfri: DFRI, respiracion: "Se prefiere la técnica ortostática (respiración suave), con un tiempo de exposición de al menos 3 segundos (idealmente 4-5)", parrilla: "Sí", colimacion: "Hasta los bordes de partes blandas, incluyendo todo el húmero" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la diáfisis del húmero afectado." },
      posicion: [
        "En decúbito o de pie.",
        "El lado afectado, más cerca del RI.",
        "Levantar el brazo opuesto por encima de la cabeza.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Lateral de la mitad proximal del húmero."]],
        ["Posicionamiento", ["Mitad proximal de la diáfisis del húmero bien visible.", "Se ven la cabeza del húmero y la cavidad glenoidea."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Costillas y marcas pulmonares superpuestas borrosas (por la técnica de respiración)."]],
      ],
      fuente: { paginas: [71, 72] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Hombro ─────────
    {
      id: "hombro-ap-rotacion", region: "hombro", nombre: "AP de hombro con rotación externa e interna", categoria: ["AP"], tipo: "R",
      factores: { ri: "24 × 30 cm, horizontal (o vertical para mostrar la parte proximal del húmero)", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada a los cuatro lados" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, dirigido 2,5 cm por debajo de la apófisis coracoides." },
      posicion: [
        "De pie (sentado o parado) o en decúbito supino, con el brazo en leve abducción.",
        "Rotar el tórax lo necesario para apoyar el hombro posterior en el RI.",
        "Centrar el RI en la articulación escapulohumeral y en el RC.",
        "Rotación externa: rotar el brazo hacia afuera hasta que la mano quede en supinación y los epicóndilos paralelos al RI.",
        "Rotación interna: rotar el brazo hacia adentro hasta que la mano quede en pronación y los epicóndilos perpendiculares al RI.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Húmero proximal, dos tercios laterales de la clavícula y escápula superior."]],
        ["Rotación externa", ["Troquíter (tubérculo mayor) completo y de perfil hacia lateral.", "Troquín (tubérculo menor) superpuesto a la cabeza del húmero."]],
        ["Rotación interna (lateral)", ["Troquín completo y de perfil hacia medial.", "Troquíter superpuesto a la cabeza del húmero."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      notas: [AVISO_TRAUMA],
      fuente: { paginas: [73, 74] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-axial-lawrence", region: "hombro", nombre: "Axial inferosuperior de hombro", metodo: "Lawrence", categoria: ["Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí, con las líneas horizontales y el RC en la línea central. A menudo se hace sin parrilla si el hombro es pequeño", colimacion: "Ajustada a los cuatro lados" },
      rc: { direccion: "angulado", angulo: "25-30° medial", texto: "Horizontal, angulado 25-30° hacia medial, apuntando a la axila. Menos ángulo si el brazo no llega a 90° de abducción. El tubo queda cerca de la mesa o camilla, a la altura de la axila." },
      posicion: [
        "Decúbito supino, con el hombro en el borde de la mesa o camilla y un apoyo debajo para centrarlo en el RI. Cabeza girada hacia el lado opuesto.",
        "Brazo a 90° de abducción respecto del cuerpo, si se puede.",
        "Rotación externa del brazo, con la mano en supinación.",
        "Alternativa: rotación externa exagerada, con el pulgar hacia abajo y atrás, unos 45°. Se recomienda para descartar una lesión de Hill-Sachs.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Lateral del húmero proximal en relación con la cavidad escapulohumeral."]],
        ["Posicionamiento", ["Espina de la escápula de perfil, debajo de la articulación escapulohumeral.", "Brazo en abducción de unos 90°."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      notas: [AVISO_TRAUMA],
      fuente: { paginas: [75, 76] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-transaxilar-hobbs", region: "hombro", nombre: "PA transaxilar de hombro", metodo: "Modificación de Hobbs", categoria: ["PA", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada a los cuatro lados" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación glenohumeral." },
      posicion: [
        "En PA, en decúbito o de pie.",
        "Brazo afectado elevado y en extensión completa.",
        "Cabeza girada hacia el otro lado.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Lateral del húmero proximal en relación con la articulación escapulohumeral (glenohumeral)."]],
        ["Posicionamiento", ["Apófisis coracoides de la escápula vista de frente.", "Brazo afectado elevado del todo."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      fuente: { paginas: [77, 78] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-axial-clements", region: "hombro", nombre: "Axial inferosuperior de hombro", metodo: "Modificación de Clements", categoria: ["Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "No (se puede usar si el RC queda perpendicular a ella)", colimacion: "Ajustada a los cuatro lados" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI. Si el paciente no logra 90° de abducción, angular el tubo 5-15° hacia la axila." },
      posicion: [
        "Decúbito lateral sobre el lado sano.",
        "Brazo afectado elevado.",
        "Abducir el brazo 90° respecto del cuerpo, si se puede.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Lateral del húmero proximal en relación con la articulación escapulohumeral."]],
        ["Posicionamiento", ["Brazo en abducción de 90° respecto del cuerpo."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      fuente: { paginas: [79, 80] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-grashey", region: "hombro", nombre: "Oblicua AP de hombro (cavidad glenoidea)", metodo: "Grashey", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Bordes superior y lateral del campo cerca de los bordes de partes blandas" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación escapulohumeral: unos 5 cm por debajo y hacia medial del borde superolateral del hombro." },
      posicion: [
        "De pie (preferible) o en decúbito supino.",
        "Oblicua de 35-45° hacia el lado a estudiar: el cuerpo de la escápula tiene que quedar paralelo al RI. Mano y brazo en rotación neutra.",
        "Centrar la parte media de la articulación escapulohumeral y el RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cabeza del húmero en relación con la cavidad glenoidea."]],
        ["Posicionamiento", ["Espacio articular escapulohumeral abierto.", "Rebordes anterior y posterior de la cavidad glenoidea superpuestos."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      notas: ["Proyección especial para ver de perfil la cavidad glenoidea con el espacio articular abierto."],
      fuente: { paginas: [81, 82] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-fisk", region: "hombro", nombre: "Tangencial del surco intertubercular (corredera bicipital)", metodo: "Modificación de Fisk", categoria: ["Tangenciales", "Métodos especiales"], tipo: "E",
      factores: { ri: "18 × 24 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "No", colimacion: "Ajustada a los cuatro lados, a la parte anterior de la cabeza humeral" },
      rc: { direccion: "variable", texto: "En decúbito supino: tubo angulado 10-15° hacia posterior desde la horizontal, de modo que el haz entre tangencial al surco bicipital, con el RI vertical apoyado en la parte superior del hombro y perpendicular al RC. De pie: RC vertical, perpendicular al RI." },
      posicion: [
        "En decúbito supino o de pie. Palpar la cabeza humeral anterior para ubicar el surco.",
        "En decúbito supino: leve abducción del brazo y mano en supinación; centrar el RI y el surco en el RC.",
        "De pie (alternativa): inclinado hacia adelante sobre el extremo de la mesa, con el húmero a 10-15° de la vertical.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Tubérculos humerales y surco intertubercular de perfil."]],
        ["Posicionamiento", ["Surco y tubérculos de perfil.", "Sin superposición del acromion."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes y trabeculación ósea nítidos; el surco se ve a través de las partes blandas. Sin movimiento."]],
      ],
      fuente: { paginas: [83, 84] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-y-escapula-neer", region: "hombro", nombre: "Oblicua PA de hombro por traumatismo (lateral en Y de escápula)", metodo: "Neer", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: { ri: "24 × 30 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Ajustada a los cuatro lados, al área de interés" },
      rc: { direccion: "perpendicular", texto: "Y de escápula: perpendicular al RI, centrado en la articulación escapulohumeral. Método de Neer: angulado 10-15° caudal, en el borde superior de la cabeza humeral, para ver mejor la salida del supraespinoso." },
      posicion: [
        "De pie (preferible) o en decúbito.",
        "Desde la PA, rotar hasta una oblicua de 45-60°, con el hombro afectado contra el RI: es una lateral de escápula, con el cuerpo de la escápula perpendicular al RI.",
        "Brazo sano hacia adelante y arriba; brazo afectado hacia abajo. No moverlo si se sospecha fractura o luxación.",
        "Centrar la articulación escapulohumeral y el RC.",
      ],
      criterios: [
        ["Y de escápula", ["Lateral verdadera de la escápula y húmero proximal.", "Cuerpo de la escápula, delgado, visto de canto y sin superposición de costillas."]],
        ["Método de Neer", ["Región de la salida del supraespinoso abierta.", "Cuerpo de la escápula visto de canto; cabeza del húmero debajo de la salida del supraespinoso."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes óseos nítidos, sin movimiento."]],
      ],
      notas: ["Con posible fractura o luxación no elevar ni mover la extremidad superior."],
      fuente: { paginas: [85, 86] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-ap-neutra", region: "hombro", nombre: "AP de hombro en rotación neutra (traumatismo)", categoria: ["AP"], tipo: "E",
      factores: { ri: "24 × 30 cm, horizontal (o vertical para incluir más húmero si la lesión llega a su mitad proximal)", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, unos 2 cm (¾\") por debajo de la apófisis coracoides." },
      posicion: [
        "De pie (sentado o parado) o en decúbito supino, con el brazo en leve abducción.",
        "Girar un poco el tórax lo necesario para apoyar el hombro posterior en el RI.",
        "Brazo en posición neutra (en general, palma hacia adentro si no hay traumatismo agudo).",
      ],
      criterios: [
        ["Estructuras que se ven", ["El manual no trae una página de criterios propia. Indica que se evalúa como la AP con rotación, pero sin los tubérculos mayor ni menor de perfil."]],
      ],
      fuente: { paginas: [87] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-transtoracica-lawrence", region: "hombro", nombre: "Lateral transtorácica de hombro (traumatismo)", metodo: "Lawrence", categoria: ["Perfil", "Métodos especiales"], tipo: "E",
      factores: { ri: "24 × 30 cm, vertical", dfri: DFRI, respiracion: "Exponer en inspiración completa; se prefiere la técnica ortostática (respiración suave) si el paciente colabora", parrilla: "Sí", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, atravesando el tórax hasta el cuello quirúrgico. Si no se puede elevar el hombro sano, angular el RC 10-15° cefálico para que no se superponga." },
      posicion: [
        "De pie o en decúbito supino, con el brazo afectado apoyado en el RI, al costado y en rotación neutra.",
        "Elevar el brazo sano por encima de la cabeza.",
        "Elevar el hombro sano, o angular el RC 10-15° cefálico, para evitar que se superponga.",
        "Lateral verdadera o leve rotación anterior del hombro sano.",
        "Centrar la parrilla del RI en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Lateral del húmero proximal y de la articulación glenohumeral."]],
        ["Posicionamiento", ["Diáfisis del húmero proximal bien visible.", "Se ven la cabeza del húmero y la cavidad glenoidea."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Costillas y pulmones borrosos por la respiración suave, pero contornos óseos del húmero nítidos (sin movimiento)."]],
      ],
      fuente: { paginas: [88, 89] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-garth", region: "hombro", nombre: "AP axial oblicua apical de hombro (traumatismo)", metodo: "Garth", categoria: ["Axiales", "Oblicuas", "Métodos especiales"], tipo: "E",
      factores: { ri: "24 × 30 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "caudal", angulo: "45°", texto: "Angulado 45° caudal, dirigido a la cara medial de la articulación escapulohumeral." },
      posicion: [
        "De pie de preferencia (en decúbito si hace falta).",
        "Rotar el tórax 45° con el hombro afectado apoyado en el RI (oblicua posterior).",
        "Flexionar el codo afectado y apoyar la mano sobre el otro hombro.",
        "Centrar el RI en el punto de salida del RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cabeza humeral, cavidad glenoidea, y cuello y cabeza de la escápula sin superposición."]],
        ["Posicionamiento", ["Acromion y articulación AC proyectados por encima de la cabeza humeral."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      notas: ["Útil en traumatismo agudo: muestra luxaciones, fracturas glenoideas y lesiones de Hill-Sachs."],
      fuente: { paginas: [90, 91] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "hombro-ap-axial-apical", region: "hombro", nombre: "AP axial apical de hombro", categoria: ["Axiales"], tipo: "E",
      factores: { ri: "18 × 24 cm o 24 × 30 cm, horizontal", dfri: DFRI, respiracion: APNEA, parrilla: "Sí", colimacion: "Hasta los bordes de partes blandas del hombro" },
      rc: { direccion: "caudal", angulo: "30°", texto: "Angulado 30° caudal, entrando 1,25 cm por encima de la apófisis coracoides." },
      posicion: [
        "De pie de preferencia.",
        "Sin rotación.",
        "Mano del lado afectado en posición neutra.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Cara anteroinferior del acromion y espacio de la articulación acromiohumeral abierto.", "Húmero proximal en rotación neutra."]],
        ["Posicionamiento", ["Espacio acromiohumeral más abierto que en la AP de rutina.", "Se ve la cara anteroinferior del acromion."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      notas: ["Muestra el estrechamiento del espacio acromiohumeral y los espolones, si los hay, en la cara anteroinferior del acromion."],
      fuente: { paginas: [92, 93] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Clavícula ─────────
    {
      id: "clavicula-ap-axial", region: "clavicula", nombre: "AP y AP axial de clavícula", categoria: ["AP", "Axiales"], tipo: "R",
      factores: { ri: "24 × 30 cm, horizontal", dfri: DFRI, respiracion: "Exponer en inspiración completa", parrilla: "Sí", colimacion: "Hasta el área de la clavícula, asegurando que entren las articulaciones AC y esternoclavicular" },
      rc: { direccion: "variable", texto: "En la parte media de la clavícula. AP: perpendicular. AP axial: 15-30° cefálico; en hombros delgados hace falta 5-15° más que en hombros gruesos." },
      posicion: [
        "De pie o en decúbito.",
        "Centrar la clavícula y el RI en el RC: a mitad de camino entre la escotadura yugular (medial) y la articulación AC (lateral).",
        "En lugar de angular el RC para la AP axial, se puede usar una posición AP lordótica.",
      ],
      criterios: [
        ["Estructuras que se ven", ["AP a 0°: toda la clavícula, con las articulaciones AC y esternoclavicular.", "AP axial: toda la clavícula con las articulaciones AC y EC, por encima de la escápula y las costillas."]],
        ["Posicionamiento", ["AP a 0°: toda la clavícula, de la articulación AC a la EC.", "AP axial: solo la parte medial de la clavícula se superpone a la 1.ª y 2.ª costilla."]],
        ["Criterios técnicos", TEC_HOMBRO],
      ],
      notas: ["Según la rutina del servicio se hace AP a 0°, AP axial o las dos."],
      fuente: { paginas: [94, 95] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Escápula ─────────
    {
      id: "escapula-ap", region: "escapula", nombre: "AP de escápula", categoria: ["AP"], tipo: "R",
      factores: { ri: "24 × 30 cm, vertical", dfri: DFRI, respiracion: "Respiración suave o apnea durante la exposición", parrilla: "Sí", colimacion: "Cuatro lados, hasta los bordes de la escápula" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, en la parte media de la escápula: unos 5 cm por debajo de la apófisis coracoides y unos 5 cm hacia medial del borde lateral del paciente." },
      posicion: [
        "De pie o en decúbito supino (de pie es preferible si hay dolor en la zona de la escápula).",
        "Abducir con suavidad el brazo 90°, si se puede, y supinar la mano: así las costillas se superponen menos a la escápula.",
        "Centrar el RI y toda la escápula en el RC.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Toda la escápula."]],
        ["Posicionamiento", ["Borde lateral de la escápula sin superposición."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes óseos y trabeculación nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [96, 98] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "escapula-lateral", region: "escapula", nombre: "Lateral de escápula (de pie o en decúbito)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "24 × 30 cm, vertical", dfri: DFRI, respiracion: APNEA, parrilla: null, colimacion: "Hasta la región escapular" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, en el borde medial (vertebral) de la escápula, a mitad de su altura." },
      posicion: [
        "De pie (preferible) o en decúbito.",
        "Palpar los bordes de la escápula y rotar el tórax hasta que su cuerpo quede perpendicular al RI (entre 45° y 60° de rotación, según el paciente).",
        "Si interesa el cuerpo de la escápula: cruzar el brazo por delante y tomarse el hombro opuesto.",
        "Si interesa la escápula superior (acromion o coracoides): brazo hacia abajo, codo flexionado y palma hacia afuera.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Toda la escápula en lateral."]],
        ["Posicionamiento", ["El húmero no se superpone a la zona de interés.", "Las costillas no se superponen al cuerpo de la escápula."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes óseos y trabeculación nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [97, 98] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Articulaciones AC ─────────
    {
      id: "ac-pearson", region: "acromioclaviculares", nombre: "AP bilateral de articulaciones acromioclaviculares (con y sin pesos)", metodo: "Pearson", categoria: ["AP", "Métodos especiales"], tipo: "E",
      factores: { ri: "35 × 43 cm, horizontal; o dos de 18 × 24 cm, horizontal, en hombros anchos", dfri: "100 cm; para estudios bilaterales en un único RI se recomienda 180 cm", respiracion: APNEA, parrilla: "Con o sin parrilla, según el tamaño de los hombros (se recomienda en los más anchos)", colimacion: "Campo horizontal, largo y estrecho" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la escotadura yugular." },
      posicion: [
        "De pie si se puede, o sentado en una silla.",
        "Brazos a los costados. Una exposición sin pesos y otra con pesos de al menos 3,6-4,5 kg (2,25-3,6 kg en pacientes más pequeños) atados a las muñecas, con hombros y brazos relajados.",
        "Centrar el RI en el RC. Usar marcadores «con pesos» y «sin pesos».",
      ],
      criterios: [
        ["Estructuras que se ven", ["Articulaciones AC y EC derecha e izquierda."]],
        ["Posicionamiento", ["Sin rotación: articulaciones EC simétricas."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos, sin movimiento.", "Bordes óseos y trabeculación nítidos."]],
      ],
      notas: [
        "Antes de la toma con pesos hay que descartar una fractura.",
        "Alternativa: AP axial (método de Alexander), con 15° cefálico centrado en la articulación AC afectada, para descartar subluxación o luxación.",
      ],
      fuente: { paginas: [99, 100] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
