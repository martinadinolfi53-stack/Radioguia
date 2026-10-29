// Fichas cuya posición describe dos o más posiciones del paciente distintas.
// Solo reorganiza lo que ya dicen las fichas de datos/capNN-*.js (posicion, rc, notas): no agrega datos.
// comun: pasos que valen para todas las versiones. versiones: una por posición, en orden; rc solo si la ficha da otro RC para esa versión.
// Cada versión puede tener su esquema en ilustraciones/<id>--v<N>.svg (N = 1, 2… en este orden).
export default {
  // ---------- Cap. 1: tórax ----------
  "torax-oblicua-anterior": {
    comun: [
      "El brazo más alejado del RI, arriba, apoyado en la cabeza o en el soporte del RI.",
      "El brazo más cercano al RI, abajo sobre la cadera. Mentón arriba.",
      "Tórax centrado a lo ancho respecto de los bordes del RI; en altura, con el RC en T7.",
      "Como alternativa se pueden hacer oblicuas posteriores: la OPI muestra mejor el hemitórax izquierdo y la OPD el derecho.",
    ],
    versiones: [
      { nombre: "OAD (oblicua anterior derecha)", posicion: ["De pie, rotado 45°, con la parte anterior del hombro derecho contra el soporte del RI."] },
      { nombre: "OAI (oblicua anterior izquierda)", posicion: ["De pie, rotado 45°, con la parte anterior del hombro izquierdo contra el soporte del RI.", "Algunos estudios cardíacos piden la OAI con 60° de rotación respecto de la PA."] },
    ],
  },
  "via-aerea-ap-lateral": {
    comun: ["Sentado o de pie, con la vía aérea superior centrada respecto del RC.", "Centro del RI a la altura del RC."],
    versiones: [
      { nombre: "AP", posicion: ["Brazos abajo, mentón levemente elevado."] },
      { nombre: "Lateral", posicion: ["Brazos abajo, mentón levemente elevado.", "Bajar los hombros y llevarlos hacia atrás."] },
    ],
  },

  // ---------- Cap. 2: extremidad superior ----------
  "dedos-lateral": {
    comun: ["Sentado, mano sobre la mesa, con protección plomada sobre el regazo.", "Dedo alineado con el eje largo de la zona del RI que se expone, paralelo al RI."],
    versiones: [
      { nombre: "Dedos 3.º a 5.º (lateromedial)", posicion: ["Mano en lateral, con el lado del pulgar hacia arriba."] },
      { nombre: "2.º dedo (mediolateral)", posicion: ["Mano en lateral, con el lado del pulgar hacia abajo."] },
    ],
  },
  "mano-lateral": {
    comun: ["Sentado, mano sobre la mesa y codo flexionado, con protección sobre el regazo.", "Mano en lateral con el lado del pulgar hacia arriba."],
    versiones: [
      { nombre: "En abanico", posicion: ["Dedos separados y abiertos, apoyados en un soporte escalonado radiotransparente (de espuma o similar).", "Los metacarpianos tienen que quedar en lateral verdadera."] },
      { nombre: "En extensión", posicion: ["Dedos juntos y extendidos.", "Se usa ante sospecha de cuerpo extraño o lesión de un metacarpiano."] },
    ],
  },
  "manos-ap-oblicua-norgaard": {
    comun: [
      "Sentado al costado de la mesa, con ambos antebrazos y manos extendidos, palmas hacia arriba.",
      "Manos en oblicua a 45°, con sus bordes mediales tocándose, apoyadas en dos bloques de goma espuma de 45°.",
    ],
    versiones: [
      { nombre: "Dedos en extensión", posicion: ["Dedos en extensión completa sobre los bloques."] },
      { nombre: "Variante «receptor de pelota»", posicion: ["Dedos en flexión parcial.", "Muestra bien metacarpianos y articulaciones MCF, pero deforma las interfalángicas."] },
    ],
  },
  "muneca-desviacion-cubital": {
    comun: [],
    versiones: [
      {
        nombre: "Con desviación cubital",
        posicion: ["Desde la PA de muñeca, llevar la mano con suavidad hacia el lado cubital (desviación cubital) todo lo que el paciente tolere."],
        rc: { direccion: "variable", texto: "Perpendicular al RI. Otra opción: angulado 10-15° hacia el codo, centrado en el escafoides (lado del pulgar del carpo)." },
      },
      {
        nombre: "Stecher modificado (bloque de 20°)",
        posicion: ["Si no puede hacer la desviación cubital: apoyar la mano en un bloque de goma espuma a 20°."],
        rc: { direccion: "perpendicular", texto: "Perpendicular al RI." },
      },
    ],
  },
  "codo-ap": {
    comun: [
      "Protección sobre el regazo.",
      "Si hace falta, pedirle que se incline hacia lateral para lograr una AP verdadera (palpar los epicóndilos).",
    ],
    versiones: [
      {
        nombre: "Extensión completa",
        posicion: ["Codo extendido y mano en supinación."],
        rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la parte media de la articulación del codo." },
      },
      {
        nombre: "Flexión parcial: húmero paralelo al RI",
        posicion: ["Si el codo no se puede extender del todo, se hacen dos AP. Esta, con el húmero apoyado paralelo al RI."],
        rc: { direccion: "perpendicular", texto: "Perpendicular al húmero distal." },
      },
      {
        nombre: "Flexión parcial: antebrazo paralelo al RI",
        posicion: ["Si el codo no se puede extender del todo, se hacen dos AP. Esta, con el antebrazo apoyado paralelo al RI."],
        rc: { direccion: "perpendicular", texto: "Perpendicular al antebrazo proximal." },
      },
    ],
  },
  "codo-ap-oblicua": {
    comun: [],
    versiones: [
      { nombre: "Oblicua medial (interna)", posicion: ["Codo extendido y mano en pronación.", "Palpar los epicóndilos para confirmar una rotación interna de 45°."] },
      {
        nombre: "Oblicua lateral (externa)",
        posicion: ["Codo extendido y mano en supinación.", "Codo rotado hacia afuera 40-45° (palpar los epicóndilos).", "Cuesta más al paciente: inclinar todo el tronco hacia lateral si hace falta."],
      },
    ],
  },
  "codo-axial-coyle": {
    comun: [],
    versiones: [
      {
        nombre: "Cabeza del radio",
        posicion: ["Codo flexionado 90° si se puede, mano en pronación."],
        rc: { direccion: "angulado", angulo: "45° hacia el hombro", texto: "Angulado 45° hacia el hombro, centrado en la cabeza del radio. El RC entra por la parte media de la articulación del codo." },
      },
      {
        nombre: "Apófisis coronoides",
        posicion: ["Codo flexionado solo 80°, mano en pronación."],
        rc: { direccion: "angulado", angulo: "45° alejándose del hombro", texto: "Angulado 45° alejándose del hombro, centrado en la coronoides. El RC entra por la parte media de la articulación del codo." },
      },
    ],
  },

  // ---------- Cap. 3: húmero y cintura escapular ----------
  "humero-lateral-rotacion": {
    comun: [
      "Se puede hacer en PA o AP, de pie o en decúbito supino.",
      "RI centrado de modo que entren el codo y el hombro. Proteger los tejidos radiosensibles fuera de la zona de interés.",
    ],
    versiones: [
      {
        nombre: "De pie en PA",
        posicion: ["Codo flexionado 90° y paciente rotado 15-20° desde la PA, lo necesario para que húmero y hombro toquen el soporte del RI.", "Epicóndilos perpendiculares al RI (lateral verdadera)."],
      },
      {
        nombre: "AP de pie o en decúbito",
        posicion: ["Codo un poco flexionado, brazo y muñeca rotados hasta una lateral (palma hacia atrás, en pronación).", "Epicóndilos perpendiculares al RI."],
      },
    ],
  },
  "hombro-ap-rotacion": {
    comun: [
      "De pie (sentado o parado) o en decúbito supino, con el brazo en leve abducción.",
      "Rotar el tórax lo necesario para apoyar el hombro posterior en el RI.",
      "Centrar el RI en la articulación escapulohumeral y en el RC.",
    ],
    versiones: [
      { nombre: "Rotación externa", posicion: ["Rotar el brazo hacia afuera hasta que la mano quede en supinación y los epicóndilos paralelos al RI."] },
      { nombre: "Rotación interna", posicion: ["Rotar el brazo hacia adentro hasta que la mano quede en pronación y los epicóndilos perpendiculares al RI."] },
    ],
  },
  "hombro-fisk": {
    comun: ["Palpar la cabeza humeral anterior para ubicar el surco."],
    versiones: [
      {
        nombre: "Decúbito supino",
        posicion: ["Decúbito supino, con leve abducción del brazo y mano en supinación.", "Centrar el RI y el surco en el RC."],
        rc: { direccion: "angulado", angulo: "10-15° posterior desde la horizontal", texto: "Tubo angulado 10-15° hacia posterior desde la horizontal, de modo que el haz entre tangencial al surco bicipital, con el RI vertical apoyado en la parte superior del hombro y perpendicular al RC." },
      },
      {
        nombre: "De pie (alternativa)",
        posicion: ["De pie, inclinado hacia adelante sobre el extremo de la mesa, con el húmero a 10-15° de la vertical."],
        rc: { direccion: "perpendicular", texto: "RC vertical, perpendicular al RI." },
      },
    ],
  },
  "clavicula-ap-axial": {
    comun: [
      "De pie o en decúbito.",
      "Centrar la clavícula y el RI en el RC: a mitad de camino entre la escotadura yugular (medial) y la articulación AC (lateral).",
    ],
    versiones: [
      { nombre: "AP", posicion: [], rc: { direccion: "perpendicular", texto: "Perpendicular, en la parte media de la clavícula." } },
      {
        nombre: "AP axial",
        posicion: ["En lugar de angular el RC, se puede usar una posición AP lordótica."],
        rc: { direccion: "cefálico", angulo: "15-30°", texto: "15-30° cefálico, en la parte media de la clavícula; en hombros delgados hace falta 5-15° más que en hombros gruesos." },
      },
    ],
  },
  "escapula-lateral": {
    comun: [
      "De pie (preferible) o en decúbito.",
      "Palpar los bordes de la escápula y rotar el tórax hasta que su cuerpo quede perpendicular al RI (entre 45° y 60° de rotación, según el paciente).",
    ],
    versiones: [
      { nombre: "Cuerpo de la escápula", posicion: ["Cruzar el brazo por delante y tomarse el hombro opuesto."] },
      { nombre: "Escápula superior (acromion o coracoides)", posicion: ["Brazo hacia abajo, codo flexionado y palma hacia afuera."] },
    ],
  },

  // ---------- Cap. 4: extremidad inferior ----------
  "dedos-pie-ap-oblicua": {
    comun: [
      "Decúbito supino o sentado en la mesa, con el pie apoyado sobre el RI.",
      "Eje longitudinal de los dedos afectados alineado con la zona del RI que se expone.",
      "Poner un apoyo debajo del pie.",
      "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
    ],
    versiones: [
      { nombre: "Dedos 1.º a 3.º (oblicua medial)", posicion: ["Oblicuar el pie 30-45° hacia medial."] },
      { nombre: "Dedos 4.º y 5.º (oblicua lateral)", posicion: ["Oblicuar el pie 30-45° hacia lateral."] },
    ],
  },
  "dedos-pie-lateral": {
    comun: [
      "Sentado o en decúbito sobre el tablero de la mesa.",
      "Separar con cuidado los dedos que no se estudian, usando cinta o gasa radiotransparente.",
      "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
    ],
    versiones: [
      {
        nombre: "Dedos 1.º a 3.º (lateromedial)",
        posicion: ["Lateromedial, con el 1.er dedo abajo."],
        rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación IF del 1.er dedo o en la articulación IFP del 2.º o el 3.er dedo." },
      },
      {
        nombre: "Dedos 4.º y 5.º (mediolateral)",
        posicion: ["Mediolateral, con el 1.er dedo arriba."],
        rc: { direccion: "perpendicular", texto: "Perpendicular al RI, centrado en la articulación IFP del dedo a estudiar." },
      },
    ],
  },
  "dedos-pie-tangencial-sesamoideos": {
    comun: ["Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis."],
    versiones: [
      {
        nombre: "Decúbito prono",
        posicion: ["Decúbito prono, con el pie y el primer dedo en flexión dorsal, de modo que la planta quede a 15-20° de la vertical si se puede (si no, ajustar el ángulo del RC)."],
      },
      {
        nombre: "Decúbito supino (alternativa)",
        posicion: ["Decúbito supino: suele tolerarse mejor si el paciente tiene mucho dolor.", "El paciente sostiene los dedos con una tira larga de gasa."],
      },
    ],
  },
  "pie-ap-lateral-carga": {
    comun: [],
    versiones: [
      {
        nombre: "AP",
        posicion: ["De pie, con el peso repartido por igual entre los dos pies, parado sobre el RI."],
        rc: { direccion: "cefálico", angulo: "15° posterior", texto: "15° en dirección posterior (cefálica), a la altura de la base del 3.er metatarsiano y a mitad de camino entre los dos pies." },
      },
      {
        nombre: "Lateral",
        posicion: [
          "De pie, con todo el peso sobre los dos pies y el RI vertical entre ellos.",
          "Los pies se apoyan en bloques lo bastante altos como para usar un RC horizontal.",
          "Se radiografían el pie derecho y el izquierdo para comparar.",
        ],
        rc: { direccion: "horizontal", texto: "Horizontal, hacia la base del 5.º metatarsiano." },
      },
    ],
  },
  "tobillo-ap-estres": {
    comun: [
      "Decúbito supino o sentado en la mesa, pierna extendida.",
      "Sin rotar la pierna ni el tobillo (AP verdadera).",
      "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis.",
    ],
    versiones: [
      { nombre: "Inversión", posicion: ["Primera toma: forzar la articulación del tobillo girando la planta hacia adentro (inversión)."] },
      { nombre: "Eversión", posicion: ["Segunda toma: forzar la articulación del tobillo girando la planta hacia afuera (eversión)."] },
    ],
  },
  "rodilla-ap-oblicuas": {
    comun: ["Semidecúbito supino, pierna extendida y centrada en el RC y en la línea media de la mesa.", "Centrar el RI con el RC."],
    versiones: [
      { nombre: "Oblicua medial (interna)", posicion: ["Rotar 45° hacia adentro toda la extremidad (rodilla, tobillo y pie)."] },
      { nombre: "Oblicua lateral (externa)", posicion: ["Rotar 45° hacia afuera toda la extremidad."] },
    ],
  },
  "rodilla-ap-pa-bilateral-carga": {
    comun: [],
    versiones: [
      {
        nombre: "AP",
        posicion: [
          "De pie, subido a un escalón o al estribo de la mesa si hace falta, a una altura que permita bajar el tubo y usar un rayo horizontal.",
          "Pies rectos hacia adelante y rodillas extendidas, con el peso repartido por igual. El paciente se sostiene de los agarraderos de la mesa.",
        ],
        rc: { direccion: "horizontal", texto: "Horizontal, perpendicular al RI en un paciente de contextura media (ver AP de rodilla), en el punto medio entre las dos rodillas, unos 1,25 cm distal al vértice de las rótulas." },
      },
      {
        nombre: "PA (alternativa)",
        posicion: ["El paciente mira hacia la mesa o el soporte del RI, con las rodillas apoyadas en él y flexionadas unos 20°."],
        rc: { direccion: "caudal", angulo: "10°", texto: "10° caudal (con las rodillas flexionadas unos 20°), en el punto medio entre las dos rodillas, unos 1,25 cm distal al vértice de las rótulas." },
      },
    ],
  },
  "fosa-rotula-tunel": {
    comun: ["Rodilla centrada en el RC y RI centrado en el RC proyectado."],
    versiones: [
      {
        nombre: "Camp Coventry (PA axial)",
        posicion: ["Decúbito prono, rodilla flexionada 40-50°, con un apoyo grande debajo del tobillo."],
        rc: { direccion: "caudal", angulo: "40-50°", texto: "40-50° caudal (perpendicular a la pierna), centrado en la articulación de la rodilla para que salga por el borde distal de la rótula." },
      },
      {
        nombre: "Holmblad",
        posicion: ["Arrodillado sobre la mesa o parcialmente de pie; en la figura, el paciente se inclina hacia adelante 20-30°."],
        rc: { direccion: "perpendicular", texto: "Perpendicular a la pierna, en el pliegue poplíteo medio." },
      },
    ],
  },
  "fosa-rotula-axial-settegast-hughston": {
    comun: ["El paciente sostiene la pierna con una gasa larga o cinta.", "Si se hacen varias exposiciones en el mismo RI, cubrir con plomo el resto del chasis."],
    versiones: [
      {
        nombre: "Settegast",
        posicion: ["Decúbito prono, rodilla flexionada 90°."],
        rc: { direccion: "cefálico", angulo: "15-20°", texto: "15-20° cefálico respecto del eje longitudinal de la pierna, centrado en la parte media del espacio articular femororrotuliano." },
      },
      {
        nombre: "Hughston",
        posicion: ["Decúbito prono, rodilla flexionada 50-60° desde la extensión completa.", "El pie puede apoyarse en un soporte que no sea el colimador."],
        rc: { direccion: "cefálico", angulo: "45°", texto: "45° cefálico respecto del eje longitudinal de la pierna, centrado en la parte media del espacio articular femororrotuliano." },
      },
    ],
  },
  "ped-pie-ap-mediolateral-kite": {
    comun: [],
    versiones: [
      {
        nombre: "AP",
        posicion: ["Elevar al paciente sobre un apoyo, con la rodilla flexionada y el pie sobre el RI."],
        rc: { direccion: "perpendicular", texto: "Perpendicular al RI, dirigido a los tarsianos medios (Kite propone no angular el rayo)." },
      },
      {
        nombre: "Lateral (mediolateral)",
        posicion: ["Paciente o pierna de costado, lado afectado abajo, sujetando con cinta adhesiva o una banda de compresión."],
        rc: { direccion: "perpendicular", texto: "Perpendicular, centrado en la zona metatarsiana proximal." },
      },
    ],
  },

  // ---------- Cap. 5: fémur y cintura pélvica ----------
  "cadera-lateral-rana-unilateral": {
    comun: ["Decúbito supino.", "Centrar el RI en el RC. Proteger los tejidos radiosensibles (hombres y mujeres)."],
    versiones: [
      { nombre: "Cuello femoral", posicion: ["Flexionar rodilla y cadera del lado afectado y llevar el fémur a 45° de abducción respecto de la vertical."] },
      {
        nombre: "Cabeza femoral, acetábulo y diáfisis proximal",
        posicion: ["Oblicuar al paciente 35-45° hacia el lado afectado y abducir la pierna hasta la mesa si se puede.", "Centrar cadera y cuello en el RC."],
      },
    ],
  },

  // ---------- Cap. 6: columna ----------
  "columna-cervical-oblicuas": {
    comun: [
      "Levantar un poco el mentón y mirar hacia adelante (o girar la cabeza apenas hacia el RI) para que la rama de la mandíbula no tape C1.",
      "Centrar el RI en el RC proyectado.",
      "Se hacen oblicuas derecha e izquierda, en dos RI, para comparar.",
    ],
    versiones: [
      {
        nombre: "Oblicuas posteriores",
        posicion: ["Oblicua posterior, de preferencia de pie o sentado, con el torso y la cabeza girados 45° respecto del RI y la columna C alineada con el RC y la línea central del RI."],
        rc: { direccion: "cefálico", angulo: "15-20°", texto: "15-20° cefálico, entrando por C4." },
      },
      {
        nombre: "Oblicuas anteriores",
        posicion: ["Oblicua anterior, de preferencia de pie o sentado, con el torso y la cabeza girados 45° respecto del RI y la columna C alineada con el RC y la línea central del RI."],
        rc: { direccion: "caudal", angulo: "15-20°", texto: "Hace falta un ángulo de 15-20° caudal." },
      },
    ],
  },
  "columna-cervical-lateral-flexion-extension": {
    comun: [
      "Se prefiere de pie o sentado, en lateral verdadera, con la columna C alineada con el RC y la línea central del RI.",
      "Relajar y bajar los hombros todo lo posible.",
      "Incluir toda la columna C en las dos tomas.",
    ],
    versiones: [
      { nombre: "Hiperflexión", posicion: ["Primer RI: bajar el mentón hasta que toque el tórax, si se puede."] },
      { nombre: "Hiperextensión", posicion: ["Segundo RI: levantar el mentón al máximo, siempre que el paciente esté cómodo."] },
    ],
  },
  "columna-lumbar-oblicua": {
    comun: [
      "Columna alineada y centrada con el RC y la línea media de la mesa o del RI.",
      "Se hacen las dos oblicuas (derecha e izquierda) en dos RI para comparar.",
    ],
    versiones: [
      { nombre: "Oblicuas posteriores", posicion: ["Oblicua posterior derecha o izquierda: girar el cuerpo 45°.", "Usar bloques triangulares bajo la pelvis y los hombros para sostener la posición."] },
      { nombre: "Oblicuas anteriores", posicion: ["Oblicua anterior derecha o izquierda: girar el cuerpo 45°."] },
    ],
  },
  "columna-lumbar-ap-flexion-lateral": {
    comun: [
      "En decúbito supino o de pie, con la columna centrada en el RC y en la línea media de la mesa o del RI.",
      "Flexión lateral máxima sin inclinar la pelvis (la pelvis queda fija y actúa como fulcro).",
      "Controlar que no roten la pelvis ni el torso.",
      "Borde inferior del RI 2,5-5 cm por debajo de la cresta ilíaca.",
    ],
    versiones: [
      { nombre: "Flexión lateral derecha", posicion: ["Primera toma: máxima flexión lateral posible hacia la derecha."] },
      { nombre: "Flexión lateral izquierda", posicion: ["Segunda toma: máxima flexión lateral posible hacia la izquierda."] },
    ],
  },
  "columna-lumbar-lateral-flexion-extension": {
    comun: [
      "En decúbito o de pie, con la columna centrada en la mesa.",
      "Apoyo bajo la cintura para que la columna quede paralela al tablero.",
      "Mantener la lateral verdadera.",
      "Borde inferior del RI 2,5-5 cm por debajo de la cresta ilíaca.",
    ],
    versiones: [
      { nombre: "Hiperflexión", posicion: ["Primer RI: máxima flexión hacia adelante."] },
      { nombre: "Hiperextensión", posicion: ["Segundo RI: máxima extensión hacia atrás."] },
    ],
  },
  "columna-escoliosis-pa-ferguson": {
    comun: ["Usar protección gonadal y mamaria."],
    versiones: [
      {
        nombre: "Primer RI",
        posicion: ["De pie o sentado, con la columna alineada y centrada en la línea media de la mesa o del RI, brazos a los costados, sin rotación de la pelvis ni del tórax.", "Borde inferior del RI 2,5-5 cm por debajo de la cresta ilíaca."],
      },
      {
        nombre: "Segundo RI (con alza)",
        posicion: [
          "Misma posición que en el primer RI.",
          "Poner un alza de 8-10 cm bajo el pie (o bajo las nalgas si está sentado) del lado convexo de la curva; así se distinguen las curvas primarias deformantes de las compensadoras.",
        ],
      },
    ],
  },

  // ---------- Cap. 8: cráneo, cara y senos ----------
  "faciales-parietoacantial-waters": {
    comun: ["Sentado erguido (se prefiere) o en decúbito prono sobre la mesa.", "Centrar el RI en el RC."],
    versiones: [
      { nombre: "Waters", posicion: ["Cabeza extendida, apoyada en el mentón, con la LMM perpendicular al RI; así la LOM queda a 37° del RI."] },
      { nombre: "Waters modificada", posicion: ["La LOM queda a 55° del plano del RI, o sea, la LLM (línea desde la comisura de los labios hasta el MAE) perpendicular al RI."] },
    ],
  },
  "atm-law-modificado": {
    comun: [
      "Sentado erguido (se prefiere) o en semidecúbito prono, con el lado afectado abajo.",
      "Ajustar el mentón para que la LIOM quede perpendicular al borde anterior del RI.",
      "Girar el cráneo (PMS) 15° hacia el RI, sin inclinación; la LIP sigue perpendicular al RI.",
      "Centrar en el RC la mitad del RI que se expone.",
    ],
    versiones: [
      { nombre: "Boca cerrada", posicion: ["Primera exposición, con la boca cerrada."] },
      { nombre: "Boca abierta", posicion: ["Segunda exposición en la misma posición, con la boca bien abierta."] },
    ],
  },
  "atm-schuller": {
    comun: [
      "Sentado erguido o en semidecúbito prono, con el lado afectado abajo.",
      "Ajustar el mentón para que la LIOM quede perpendicular al borde anterior del RI; cabeza en lateral verdadera, sin rotación ni inclinación.",
      "Centrar en el RC proyectado la mitad del RI que se expone.",
    ],
    versiones: [
      { nombre: "Boca cerrada", posicion: ["Primera exposición, con la boca cerrada."] },
      { nombre: "Boca abierta", posicion: ["Segunda exposición en la misma posición, con la boca bien abierta."] },
    ],
  },
  "senos-pa-caldwell": {
    comun: [],
    versiones: [
      {
        nombre: "PA de Caldwell (soporte inclinado)",
        posicion: [
          "Si se puede inclinar el soporte: sentado erguido mirando al RI.",
          "Inclinar la parte superior del RI 15° hacia el paciente.",
          "Cabeza con la LOM perpendicular al RI, sin rotación.",
          "RI centrado en el RC (nasión).",
        ],
      },
      {
        nombre: "PA de Caldwell modificada",
        posicion: ["Si no se puede inclinar el soporte: sentado erguido mirando al RI.", "Inclinar la cabeza hacia atrás hasta que la LOM quede a 15° de la horizontal."],
      },
    ],
  },

  // ---------- Cap. 9: abdomen y contraste ----------
  "enema-opaco-oblicuas": {
    comun: ["Abdomen alineado y centrado en la línea media de la mesa.", "RI centrado a la altura de la cresta ilíaca, incluyendo la zona rectal."],
    versiones: [
      { nombre: "Oblicuas anteriores (OAD y OAI)", posicion: ["Semiprono (PA), rotado 35-45°."] },
      { nombre: "Oblicuas posteriores (OPD y OPI)", posicion: ["Semisupino (AP), rotado 35-45°."] },
    ],
  },
  "enema-opaco-ap-pa-axial": {
    comun: [],
    versiones: [
      {
        nombre: "AP axial",
        posicion: ["Decúbito supino, paciente alineado y centrado en la línea media de la mesa."],
        rc: { direccion: "cefálico", angulo: "30-40°", texto: "30-40° cefálico, 5 cm por debajo de las EIAS." },
      },
      {
        nombre: "PA axial",
        posicion: ["Decúbito prono, paciente alineado y centrado en la línea media de la mesa."],
        rc: { direccion: "caudal", angulo: "30-40°", texto: "30-40° caudal, centrado para que salga a la altura de las EIAS." },
      },
      {
        nombre: "Oblicua axial (OPI u OAD)",
        posicion: ["Alternativa oblicua: OPI u OAD, con el paciente oblicuo 30-40°."],
        rc: { texto: "OPI axial: 5 cm por debajo y 5 cm medial a la EIAS derecha. El manual no da el centrado de la OAD axial." },
      },
    ],
  },

  // ---------- Cap. 10: portátiles ----------
  "port-torax-ap": {
    comun: [
      "Cubrir el RI con una funda de plástico.",
      "Centrar al paciente con el borde superior del RI unos 5 cm por encima de los hombros.",
      "Sin rotación.",
      "Si su estado lo permite, rotar los hombros hacia adelante.",
    ],
    versiones: [
      { nombre: "Decúbito supino", posicion: ["Paciente en decúbito supino, cuando no se puede levantar el respaldo de la cama."] },
      { nombre: "Semiincorporado", posicion: ["Levantar el respaldo de la cama, si se puede, hasta dejar al paciente sentado o semierguido."] },
    ],
  },
  "port-pelvis-cadera-ap": {
    comun: [
      "Cubrir el RI con una funda de plástico y deslizarlo debajo del paciente, centrado en sentido horizontal.",
      "Sin rotación: las EIAS a la misma distancia del RI.",
      "Rotar las dos piernas 15° hacia adentro solo si no se sospecha fractura de cadera.",
    ],
    versiones: [
      {
        nombre: "AP de pelvis",
        posicion: ["Borde superior del RI ≈2,5 cm por encima de la cresta ilíaca."],
        rc: { direccion: "perpendicular", texto: "Perpendicular, a mitad de camino entre las EIAS y la sínfisis del pubis." },
      },
      {
        nombre: "AP de cadera",
        posicion: ["RC y RI centrados en la región de la cadera."],
        rc: { texto: "RC y RI centrados en la región de la cadera (5 cm medial a la EIAS, a la altura del trocánter mayor)." },
      },
    ],
  },
};
