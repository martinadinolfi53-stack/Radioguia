// Capítulo 2 · Extremidad superior (Bontrager, Manual de posiciones y técnicas radiológicas, 9ª ed., págs. 20-64).
// Redacción propia a partir del manual; los valores técnicos se copian tal cual figuran en la fuente.
// El manual no indica respiración para estas proyecciones: se deja en null y la ficha lo muestra así.
// Factores generales del capítulo (pág. 22): DFRI 100 cm (40"), DORI mínima, punto focal pequeño, sin parrilla
// (o sobre el tablero), tiempo de exposición corto, colimación ajustada y protección del paciente.

const CRIT_TEC = ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación ósea nítidos, sin movimiento."];
const RI_18x24 = "18 × 24 cm (8 × 10\"), vertical";
const RI_24x30 = "24 × 30 cm (10 × 12\"), vertical";
const DFRI = "100 cm (40\")";

export default {
  capitulo: 2,
  titulo: "Extremidad superior",
  paginas: "20-64",
  regiones: [
    { id: "dedos-mano", nombre: "Dedos de la mano", detalle: "2.º a 5.º dedo" },
    { id: "pulgar", nombre: "Pulgar", detalle: "1.er dedo" },
    { id: "mano", nombre: "Mano", detalle: "" },
    { id: "muneca", nombre: "Muñeca", detalle: "Carpo" },
    { id: "antebrazo", nombre: "Antebrazo", detalle: "Radio y cúbito" },
    { id: "codo", nombre: "Codo", detalle: "" },
    { id: "ext-sup-pediatrica", nombre: "Extremidad superior pediátrica", detalle: "" },
  ],
  proyecciones: [
    // ───────── Dedos de la mano ─────────
    {
      id: "dedos-pa", region: "dedos-mano", nombre: "PA de dedos de la mano", categoria: ["PA"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados alrededor del dedo, incluyendo la parte distal de los metacarpianos" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación IFP del dedo a estudiar." },
      posicion: [
        "Sentado al costado de la mesa, codo flexionado 90°, con protección plomada sobre el regazo.",
        "Mano en pronación con los dedos separados.",
        "Eje largo del dedo centrado y alineado con la zona del RI que se expone.",
        "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde la falange distal hasta la parte distal del metacarpiano, con sus articulaciones."]],
        ["Posicionamiento", ["Eje largo del dedo paralelo al RI y articulaciones abiertas.", "Dedo sin rotar: diáfisis de aspecto simétrico."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      notas: ["Como protocolo de rutina alternativo, el manual sugiere incluir toda la mano en la PA para no pasar por alto lesiones en otras zonas (ver PA de mano)."],
      fuente: { paginas: [23, 25] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "dedos-pa-oblicua", region: "dedos-mano", nombre: "PA oblicua de dedos de la mano", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados alrededor del dedo afectado, hasta la parte distal del metacarpiano" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación IFP." },
      posicion: [
        "Sentado, mano sobre la mesa y codo flexionado 90°, con protección plomada sobre el regazo.",
        "Dedos alineados con el eje largo de la zona del RI que se expone.",
        "Rotar la mano 45° hacia medial o lateral según el dedo, apoyada en un bloque de 45°.",
        "Dedos separados; el dedo afectado tiene que quedar paralelo al RI (así se minimiza la DORI).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde la falange distal hasta la parte distal del metacarpiano, con sus articulaciones."]],
        ["Posicionamiento", ["Articulaciones interfalángicas y MCF abiertas.", "Los dedos vecinos no se superponen."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [24, 25] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "dedos-lateral", region: "dedos-mano", nombre: "Lateral de dedos de la mano (mediolateral o lateromedial)", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados alrededor del dedo afectado, hasta la parte distal del metacarpiano" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación IFP." },
      posicion: [
        "Sentado, mano sobre la mesa, con protección plomada sobre el regazo.",
        "Mano en lateral: del 3.º al 5.º dedo, con el lado del pulgar hacia arriba (lateromedial); para el 2.º dedo, con el lado del pulgar hacia abajo (mediolateral).",
        "Dedo alineado con el eje largo de la zona del RI que se expone, paralelo al RI.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde la falange distal hasta la parte distal del metacarpiano, con sus articulaciones."]],
        ["Posicionamiento", ["Lateral verdadera: articulaciones abiertas y cara anterior de las diáfisis de las falanges con forma cóncava."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [26, 28] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Pulgar ─────────
    {
      id: "pulgar-ap", region: "pulgar", nombre: "AP de pulgar", categoria: ["AP"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Ajustada al pulgar, con todo el 1.er metacarpiano y hasta los huesos del carpo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la 1.ª articulación MCF." },
      posicion: [
        "De pie o sentado, con la mano en rotación interna y la palma hacia afuera, para que la cara posterior del pulgar apoye directamente en el RI.",
        "Pulgar alineado con el eje largo de la zona del RI que se expone.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde la falange distal hasta la parte proximal del metacarpiano y el trapecio."]],
        ["Posicionamiento", ["Eje largo del pulgar paralelo al RI y articulaciones abiertas.", "Pulgar sin rotar: diáfisis de aspecto simétrico."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [27, 28] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pulgar-pa-oblicua", region: "pulgar", nombre: "PA oblicua de pulgar", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Ajustada al pulgar, con todo el 1.er metacarpiano y hasta los huesos del carpo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la 1.ª articulación MCF." },
      posicion: [
        "Sentado, mano sobre la mesa y codo flexionado, con protección sobre el regazo.",
        "Pulgar alineado con el eje largo de la zona del RI que se expone.",
        "Con la mano en pronación, separar un poco el pulgar (abducción): así rota solo hasta quedar oblicuo a unos 45°.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde la falange distal hasta la parte proximal del metacarpiano y el trapecio."]],
        ["Posicionamiento", ["Eje largo del pulgar paralelo al RI y articulaciones abiertas."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [29, 31] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pulgar-lateral", region: "pulgar", nombre: "Lateral de pulgar", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Ajustada al pulgar, con todo el 1.er metacarpiano y hasta los huesos del carpo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la 1.ª articulación MCF." },
      posicion: [
        "Sentado, mano sobre la mesa y codo flexionado, con protección sobre el regazo.",
        "Pulgar alineado con el eje largo de la zona del RI que se expone.",
        "Desde la pronación, con la mano un poco arqueada, rotarla hacia medial hasta que el pulgar quede en lateral verdadera.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde la falange distal hasta la parte proximal del metacarpiano y el trapecio."]],
        ["Posicionamiento", ["Lateral verdadera, con articulaciones interfalángica y MCF abiertas.", "Las caras anteriores del 1.er metacarpiano y de la falange proximal se ven igual de cóncavas; las posteriores, bastante rectas."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [30, 31] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "pulgar-ap-axial-roberts", region: "pulgar", nombre: "AP axial de pulgar", metodo: "Roberts modificado", categoria: ["Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Ajustada a todo el pulgar, incluyendo el trapecio" },
      rc: { direccion: "angulado", angulo: "15° proximal", texto: "Angulado 15° hacia proximal, centrado en la 1.ª articulación carpometacarpiana (CMC). Variante de Lewis: RC en la 1.ª articulación MCF con 10-15° hacia proximal." },
      posicion: [
        "Sentado o de pie, con la mano en rotación interna, de modo que la cara posterior del pulgar apoye directamente en el RI.",
        "Pulgar alineado con el eje largo de la zona del RI que se expone.",
        "Pulgar extendido.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Desde la falange distal hasta la parte proximal del metacarpiano y el trapecio.", "Base del 1.er metacarpiano y trapecio bien visibles."]],
        ["Posicionamiento", ["Eje largo del pulgar paralelo al RI y articulaciones abiertas.", "Sin rotación."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      notas: ["Proyección especial para estudiar mejor la primera articulación carpometacarpiana."],
      fuente: { paginas: [32, 34] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Mano ─────────
    {
      id: "mano-pa", region: "mano", nombre: "PA de mano", categoria: ["PA"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes externos de la mano y la muñeca, incluyendo las hileras proximal y distal del carpo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la 3.ª articulación MCF." },
      posicion: [
        "Sentado, mano sobre la mesa y codo flexionado, con protección sobre el regazo.",
        "Eje largo de la mano y la muñeca paralelo al borde del RI.",
        "Mano en pronación completa, con los dedos un poco separados.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Mano, muñeca y unos 2,5 cm (1\") de antebrazo distal."]],
        ["Posicionamiento", ["Articulaciones interfalángicas y MCF abiertas.", "Mano sin rotar: diáfisis de metacarpianos y falanges de aspecto simétrico.", "Dedos un poco separados."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [33, 34] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mano-pa-oblicua", region: "mano", nombre: "PA oblicua de mano", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes externos de la mano y la muñeca, incluyendo las hileras proximal y distal del carpo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la 3.ª articulación MCF." },
      posicion: [
        "Sentado, mano sobre la mesa y codo flexionado, con protección sobre el regazo.",
        "Rotar mano y muñeca 45° hacia lateral, apoyadas en un bloque de cuña o escalonado; alinearlas con el RI.",
        "Todos los dedos un poco separados y paralelos al RI.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Mano, muñeca y unos 2,5 cm (1\") de antebrazo distal."]],
        ["Posicionamiento", ["Eje largo de dedos y metacarpianos paralelo al RI, con articulaciones abiertas.", "Las diáfisis del 3.º al 5.º metacarpiano no se superponen en su parte media."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [35, 37] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "mano-lateral", region: "mano", nombre: "Lateral de mano en abanico y en extensión", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "18 × 24 cm (8 × 10\"), vertical", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes externos de la mano y la muñeca, incluyendo las hileras proximal y distal del carpo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la 2.ª articulación MCF." },
      posicion: [
        "Sentado, mano sobre la mesa y codo flexionado, con protección sobre el regazo.",
        "Mano en lateral con el lado del pulgar hacia arriba.",
        "En abanico: dedos separados y abiertos, apoyados en un soporte escalonado radiotransparente (de espuma o similar). Los metacarpianos tienen que quedar en lateral verdadera.",
        "Alternativa en extensión (dedos juntos y extendidos): se usa ante sospecha de cuerpo extraño o lesión de un metacarpiano.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Mano, muñeca y unos 2,5 cm (1\") de antebrazo distal.", "Articulaciones interfalángicas y MCF abiertas."]],
        ["Posicionamiento", ["Dedos en lateral verdadera.", "Falanges y metacarpianos con superficies simétricas.", "Radio y cúbito distales superpuestos, igual que los metacarpianos."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      notas: ["Los criterios de la pág. 37 corresponden a la lateral en abanico; el manual no trae criterios aparte para la lateral en extensión."],
      fuente: { paginas: [36, 37] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "manos-ap-oblicua-norgaard", region: "mano", nombre: "AP bilateral oblicua de manos", metodo: "Norgaard (posición del «receptor de pelota»)", categoria: ["Oblicuas", "Métodos especiales"], tipo: "E",
      factores: { ri: "24 × 30 cm (10 × 12\") o 35 × 43 cm (14 × 17\"), horizontal", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta los bordes externos de ambas manos y muñecas, incluyendo las hileras proximal y distal del carpo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en el punto medio entre las 5.as articulaciones MCF de ambas manos." },
      posicion: [
        "Sentado al costado de la mesa, con ambos antebrazos y manos extendidos, palmas hacia arriba.",
        "Manos en oblicua a 45°, con sus bordes mediales tocándose, apoyadas en dos bloques de goma espuma de 45°.",
        "Dedos en extensión completa sobre los bloques.",
        "Variante «receptor de pelota»: dedos en flexión parcial. Muestra bien metacarpianos y articulaciones MCF, pero deforma las interfalángicas.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Ambas manos, desde el carpo hasta las falanges distales.", "Las dos manos en oblicua a 45°."]],
        ["Posicionamiento", ["Las diáfisis del 2.º al 5.º metacarpiano no se superponen en su parte media.", "Articulaciones MCF abiertas."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación ósea nítidos, desde las MCF hasta las falanges distales."]],
      ],
      fuente: { paginas: [38, 39] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Muñeca ─────────
    {
      id: "muneca-pa", region: "muneca", nombre: "PA de muñeca", categoria: ["PA"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta la muñeca, incluyendo radio y cúbito distales y la parte media de los metacarpianos" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del carpo." },
      posicion: [
        "Sentado, antebrazo sobre la mesa, con protección sobre el regazo.",
        "Mano y muñeca paralelas al borde del RI.",
        "Bajar el hombro para apoyar el antebrazo en la mesa y evitar que la muñeca rote.",
        "Mano en pronación, dedos flexionados y mano un poco arqueada, para que la muñeca apoye de lleno en el RI.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Parte media de los metacarpianos, carpo, radio y cúbito distales, con sus articulaciones."]],
        ["Posicionamiento", ["PA verdadera: las bases de los metacarpianos se ven simétricas.", "Radio y cúbito distales separados."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación de los huesos del carpo nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [40, 42] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "muneca-pa-oblicua", region: "muneca", nombre: "PA oblicua de muñeca", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta la muñeca, incluyendo radio y cúbito distales y la parte media de los metacarpianos" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del carpo." },
      posicion: [
        "Sentado, brazo sobre la mesa y codo flexionado, con protección sobre el regazo.",
        "Mano y muñeca paralelas al borde del RI.",
        "Rotar mano y muñeca hacia lateral hasta una oblicua de 45°.",
        "Flexionar los dedos para sostener la posición, o usar un bloque de goma espuma de 45°.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Parte media de los metacarpianos, carpo, radio y cúbito distales, con sus articulaciones."]],
        ["Posicionamiento", ["Eje largo de la mano y el antebrazo alineado con el RI.", "Muñeca en oblicua a 45°."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación de los huesos del carpo nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [41, 42] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "muneca-lateral", region: "muneca", nombre: "Lateral de muñeca", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados hasta la muñeca, incluyendo radio y cúbito distales y la parte media de los metacarpianos" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del carpo." },
      posicion: [
        "Sentado, antebrazo sobre la mesa y codo flexionado, con protección sobre el regazo.",
        "Bajar el hombro para que húmero, antebrazo y muñeca queden en el mismo plano horizontal.",
        "Mano y muñeca paralelas al borde del RI.",
        "Mano y muñeca en lateral verdadera; usar un apoyo si hace falta para sostenerla.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Parte media de los metacarpianos, carpo, radio y cúbito distales, con sus articulaciones."]],
        ["Posicionamiento", ["Muñeca en lateral verdadera.", "Cabeza del cúbito superpuesta al radio distal."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación de los huesos del carpo nítidos, sin movimiento.", "Se llegan a ver parte de las almohadillas y estrías grasas."]],
      ],
      fuente: { paginas: [43, 44] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "muneca-desviacion-cubital", region: "muneca", nombre: "PA y PA axial con desviación cubital (escafoides)", metodo: "10-15° y Stecher modificado", categoria: ["PA", "Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, ajustada a la región del carpo" },
      rc: { direccion: "variable", texto: "Perpendicular al RI. Otra opción: angulado 10-15° hacia el codo, centrado en el escafoides (lado del pulgar del carpo). Si la mano se apoya en un bloque de 20° (Stecher modificado), el RC va perpendicular al RI." },
      posicion: [
        "Desde la PA de muñeca, llevar la mano con suavidad hacia el lado cubital (desviación cubital) todo lo que el paciente tolere.",
        "Si no puede hacer la desviación cubital: apoyar la mano en un bloque de goma espuma a 20° (Stecher modificado).",
      ],
      criterios: [
        ["Estructuras que se ven", ["Escafoides bien visible, sin acortamiento ni superposición.", "Bordes de partes blandas y trabeculación del escafoides nítidos, sin movimiento."]],
        ["Posicionamiento", ["Desviación cubital evidente.", "Puede hacer falta probar varios ángulos del RC para ver bien esta zona.", "Muñeca sin rotar."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación del escafoides nítidos, sin movimiento."]],
      ],
      notas: [
        "Ante un posible traumatismo de muñeca, hacer esta proyección solo después de descartar fracturas evidentes de muñeca o antebrazo distal con la serie de rutina.",
        "La PA axial se recomienda para fracturas poco evidentes.",
        "Puede hacer falta una serie de cuatro proyecciones con el RC a 0°, 10°, 20° y 30°.",
      ],
      fuente: { paginas: [45, 46] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "muneca-desviacion-radial", region: "muneca", nombre: "PA de muñeca con desviación radial", categoria: ["PA"], tipo: "E",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, ajustada a la región del carpo (cuadrado de unos 7,5 cm o 3\")" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media del carpo." },
      posicion: [
        "Desde la PA de muñeca, llevar la mano con suavidad hacia el lado radial (desviación radial) todo lo que el paciente tolere.",
        "Protección sobre el regazo.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Se ven mejor los huesos del carpo del lado cubital."]],
        ["Posicionamiento", ["Desviación radial evidente.", "Muñeca sin rotar."]],
        ["Criterios técnicos", ["Bordes de partes blandas y trabeculación de la parte cubital del carpo nítidos, sin movimiento.", "Densidad (brillo) y contraste óptimos."]],
      ],
      notas: ["Ante un posible traumatismo, hacerla solo después de descartar fracturas evidentes de muñeca o antebrazo distal con la serie de rutina."],
      fuente: { paginas: [47, 48] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "muneca-tunel-carpiano", region: "muneca", nombre: "Inferosuperior tangencial de muñeca (túnel carpiano)", metodo: "Gaynor-Hart", categoria: ["Tangenciales", "Métodos especiales"], tipo: "E",
      factores: { ri: RI_18x24, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Ajustada a la región del carpo (cuadrado de unos 7,5 cm o 3\")" },
      rc: { direccion: "angulado", angulo: "25-30° respecto del eje largo de la palma", texto: "Angulado 25-30° respecto del eje largo de la cara palmar de la mano, centrado unos 2-3 cm (1\") distal a la base del 3.er metacarpiano." },
      posicion: [
        "Sentado, mano sobre la mesa, con protección sobre el regazo.",
        "Muñeca en hiperextensión (flexión dorsal) todo lo que tolere; el paciente sostiene los dedos hacia atrás con la otra mano.",
        "Rotar un poco mano y muñeca hacia interno, hacia el lado del radio (unos 10°).",
        "Trabajar rápido: la posición puede ser dolorosa.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Huesos del carpo dispuestos en arco."]],
        ["Posicionamiento", ["Pisiforme y apófisis ganchosa separados (si no lo están, faltó rotar la muñeca unos 10° hacia el radio).", "Escafoides y trapecio de perfil."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación ósea del túnel carpiano nítidos, sin movimiento."]],
      ],
      notas: ["El manual la llama también «proyección del túnel». Ante un posible traumatismo, hacerla solo después de descartar fracturas evidentes de muñeca o antebrazo distal con la serie de rutina."],
      fuente: { paginas: [49, 50] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Antebrazo ─────────
    {
      id: "antebrazo-ap", region: "antebrazo", nombre: "AP de antebrazo", categoria: ["AP"], tipo: "R",
      factores: { ri: "35 × 43 cm (14 × 17\"), vertical; o 30 × 35 cm (11 × 14\"), vertical, en pacientes más pequeños", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, con al menos 2,5 cm (1\") más allá de las articulaciones de la muñeca y del codo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en el punto medio del antebrazo." },
      posicion: [
        "Sentado al costado de la mesa, brazo extendido y mano en supinación, con protección sobre el regazo.",
        "Incluir las articulaciones de la muñeca y del codo (usar un RI tan grande como haga falta).",
        "Si hace falta, pedirle que se incline hacia lateral para lograr una AP verdadera.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Radio y cúbito completos.", "Todo el codo y la fila proximal del carpo."]],
        ["Posicionamiento", ["Leve superposición de radio y cúbito proximales.", "Epicóndilos humerales de perfil."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [51, 53] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "antebrazo-lateral", region: "antebrazo", nombre: "Lateromedial de antebrazo", categoria: ["Perfil"], tipo: "R",
      factores: { ri: "35 × 43 cm (14 × 17\"), vertical; o 30 × 35 cm (11 × 14\"), vertical, en pacientes más pequeños", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, con al menos 2,5 cm (1\") más allá de las articulaciones de la muñeca y del codo" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en el punto medio del antebrazo." },
      posicion: [
        "Sentado al costado de la mesa, con protección sobre el regazo.",
        "Codo flexionado 90°.",
        "Mano y muñeca en lateral verdadera: radio y cúbito distales directamente superpuestos.",
        "Incluir las articulaciones de la muñeca y del codo, salvo contraindicación.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Radio y cúbito completos.", "Todo el codo y la fila proximal del carpo."]],
        ["Posicionamiento", ["Lateral verdadera.", "Epicóndilos humerales superpuestos.", "Cabeza del cúbito superpuesta al radio distal."]],
        ["Criterios técnicos", CRIT_TEC],
      ],
      fuente: { paginas: [52, 53] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Codo ─────────
    {
      id: "codo-ap", region: "codo", nombre: "AP de codo (extensión completa y flexión parcial)", categoria: ["AP"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la articulación del codo. Con flexión parcial: una toma con el RC perpendicular al húmero distal y otra perpendicular al antebrazo proximal." },
      posicion: [
        "Codo extendido y mano en supinación, con protección sobre el regazo.",
        "Si hace falta, pedirle que se incline hacia lateral para lograr una AP verdadera (palpar los epicóndilos).",
        "Si el codo no se puede extender del todo, hacer dos AP: una con el húmero apoyado paralelo al RI y otra con el antebrazo paralelo al RI.",
      ],
      criterios: [
        ["Extensión completa · estructuras", ["Húmero distal.", "Radio y cúbito proximales."]],
        ["Extensión completa · posicionamiento", ["Leve superposición de radio y cúbito proximales.", "Epicóndilos humerales de perfil."]],
        ["Flexión parcial · estructuras", ["Tercio distal del húmero (toma con el húmero paralelo al RI).", "Tercio proximal del antebrazo (toma con el antebrazo paralelo al RI)."]],
        ["Flexión parcial · posicionamiento", ["Leve superposición de radio y cúbito proximales.", "Epicóndilos humerales de perfil."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación ósea del codo nítidos, sin movimiento."]],
      ],
      fuente: { paginas: [54, 55, 56] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "codo-ap-oblicua", region: "codo", nombre: "AP oblicua de codo (medial y lateral)", categoria: ["Oblicuas"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la articulación del codo." },
      posicion: [
        "Oblicua medial (interna): codo extendido y mano en pronación; palpar los epicóndilos para confirmar una rotación interna de 45°.",
        "Oblicua lateral (externa): igual, pero con la mano en supinación y el codo rotado hacia afuera 40-45°. Cuesta más al paciente: inclinar todo el tronco hacia lateral si hace falta.",
      ],
      criterios: [
        ["Oblicua medial · estructuras", ["Radio y cúbito proximales.", "Epicóndilo medial y tróclea."]],
        ["Oblicua medial · posicionamiento", ["Apófisis coronoides de perfil.", "Cabeza y cuello del radio superpuestos al cúbito."]],
        ["Oblicua lateral · estructuras", ["Radio y cúbito proximales.", "Epicóndilo lateral y cóndilo humeral."]],
        ["Oblicua lateral · posicionamiento", ["Cabeza, cuello y tuberosidad del radio sin superposición.", "Epicóndilo y cóndilo humerales de perfil."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación ósea nítidos, sin movimiento."]],
      ],
      notas: ["La oblicua medial muestra mejor la apófisis coronoides; la lateral, la cabeza y el cuello del radio. Según el manual, la lateral es la más frecuente."],
      fuente: { paginas: [57, 58] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "codo-lateral", region: "codo", nombre: "Lateromedial de codo", categoria: ["Perfil"], tipo: "R",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, con al menos unos 5 cm (2\") de antebrazo y de húmero" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la articulación del codo." },
      posicion: [
        "Codo flexionado 90°; bajar el hombro lo necesario para que antebrazo y húmero apoyen en un mismo plano sobre la mesa y el RI. Protección sobre el regazo.",
        "Codo en el centro del RI (o de la zona que se expone), con el antebrazo paralelo al borde del chasis.",
        "Mano y muñeca en lateral verdadera.",
      ],
      criterios: [
        ["Estructuras que se ven", ["Radio y cúbito proximales y húmero distal.", "Zona de las almohadillas grasas de la articulación."]],
        ["Posicionamiento", ["Olécranon y escotadura troclear de perfil.", "Cabeza, cuello y tuberosidad del radio sin superposición.", "Epicóndilos humerales superpuestos.", "Codo flexionado 90°."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación ósea nítidos."]],
      ],
      fuente: { paginas: [59, 60] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "codo-axial-coyle", region: "codo", nombre: "Lateromedial y mediolateral axial de codo (traumatismo)", metodo: "Coyle", categoria: ["Axiales", "Métodos especiales"], tipo: "E",
      factores: { ri: RI_24x30, dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "variable", texto: "Para la cabeza del radio: angulado 45° hacia el hombro, centrado en la cabeza del radio. Para la apófisis coronoides: angulado 45° alejándose del hombro, centrado en la coronoides. En los dos casos el RC entra por la parte media de la articulación del codo." },
      posicion: [
        "Cabeza del radio: codo flexionado 90° si se puede, mano en pronación.",
        "Apófisis coronoides: codo flexionado solo 80°, mano en pronación.",
      ],
      criterios: [
        ["Cabeza del radio (RC 45° hacia el hombro, lateromedial)", ["Cabeza y cuello del radio y cóndilo humeral proyectados lejos de la parte proximal del cúbito.", "Codo flexionado 90°."]],
        ["Apófisis coronoides (RC 45° alejándose del hombro, mediolateral)", ["Se ven la apófisis coronoides y la tróclea.", "Coronoides de perfil, con el codo flexionado 80° (más flexión la tapa)."]],
        ["Criterios técnicos", ["Densidad (brillo) y contraste óptimos.", "Bordes de partes blandas y trabeculación ósea nítidos, sin movimiento."]],
      ],
      notas: ["Proyecciones especiales para ver la cabeza del radio y la apófisis coronoides.", "Por la angulación del RC, el manual indica aumentar la exposición respecto de la lateral de codo (el ajuste figura en kV, que la app no muestra)."],
      fuente: { paginas: [61, 62] }, ilustracion: null, estado: "pendiente-revision",
    },

    // ───────── Pediatría ─────────
    {
      id: "ped-ext-sup-ap", region: "ext-sup-pediatrica", nombre: "AP de extremidad superior (pediátrica)", categoria: ["AP"], tipo: "E",
      factores: { ri: "Según la edad y el tamaño del paciente", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la extremidad." },
      posicion: [
        "Decúbito supino, brazo en abducción separado del cuerpo, con protección plomada sobre la pelvis.",
        "Incluir toda la extremidad, salvo que se pida una articulación o un hueso puntual.",
        "Inmovilizar con una banda de retención flexible y transparente, bolsas de arena o cinta.",
        "Recurrir a los padres solo si hace falta, con guantes y delantal plomados.",
      ],
      criterios: [],
      notas: ["Ante un posible traumatismo, mover la extremidad lo menos posible y con mucha suavidad. Hacer una sola exposición para descartar fracturas evidentes antes de sumar otras."],
      fuente: { paginas: [63] }, ilustracion: null, estado: "pendiente-revision",
    },
    {
      id: "ped-ext-sup-lateral", region: "ext-sup-pediatrica", nombre: "Lateral de extremidad superior (pediátrica)", categoria: ["Perfil"], tipo: "E",
      factores: { ri: "Según la edad y el tamaño del paciente", dfri: DFRI, respiracion: null, parrilla: "No", colimacion: "Cuatro lados, ajustada al área de interés" },
      rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la extremidad." },
      posicion: [
        "Decúbito supino, brazo en abducción separado del cuerpo, con protección plomada sobre la pelvis.",
        "Incluir toda la extremidad, salvo que se pida una articulación o un hueso puntual.",
        "Inmovilizar con una banda de retención flexible y transparente, bolsas de arena o cinta.",
        "Flexionar el codo y rotar toda la extremidad hasta una posición lateral.",
        "Recurrir a los padres solo si hace falta, con guantes y delantal plomados.",
      ],
      criterios: [],
      fuente: { paginas: [64] }, ilustracion: null, estado: "pendiente-revision",
    },
  ],
};
