// Esquemas de tórax, vía aérea, esternón, esternoclaviculares y costillas con las figuras por capas del modelo 3D
// (herramientas/ilus3d/figuras/torax.py). Reemplazan a los de torax.cjs cuando existe el render <id>-tubo.
// Textos resumidos de datos/bontrager/cap01-torax.js y datos/bontrager/cap07-torax-oseo.js.
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const r1 = (n) => Math.round(n * 10) / 10;
// línea de los hombros en la vista desde arriba, con una paralela al RI, para mostrar el giro
const giro = (label) => (g) => {
  const a = g.p("cabeza_humero_R"), b = g.p("cabeza_humero_L"), u = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(...u);
  const p0 = [a[0] - u[0] / n * 20, a[1] - u[1] / n * 20], p1 = [b[0] + u[0] / n * 20, b[1] + u[1] / n * 20];
  const ref = `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(Math.min(505, p0[0] + Math.sign(u[0] || 1) * (n + 40)))}" y2="${r1(p0[1])}" stroke="${MUTE}" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  return ref + `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(p1[0])}" y2="${r1(p1[1])}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 5"/>` +
    (p1[0] + 4 + label.length * 6.5 > 452       // si no entra antes de la columna del texto, el rótulo va del otro lado
      ? E.txt(r1(p1[0] - 4), r1(p1[1] + (u[1] > 0 ? 14 : -4)), label, 11.5, BLUE, "end", 700)
      : E.txt(r1(p1[0] + 4), r1(p1[1] + (u[1] > 0 ? 14 : -4)), label, 11.5, BLUE, "start", 700));
};
const T7 = "centro:Seventh thoracic vertebra", MITAD = `medio:${T7}|esternon_medio`;

def({ id: "torax-pa", blanco: T7, ri: "35 × 43", otra: "costado", pa: true,
  rc: [R("RC perpendicular al RI"), "en T7: 18-20 cm por debajo", "de la vértebra prominente"],
  pos: ["De pie, mentón elevado", "Manos en las caderas, palmas", "hacia afuera", "Hombros hacia adelante", "Sin rotación"],
  pie: [M("Al final de la segunda"), M("inspiración profunda")] });

def({ id: "torax-lateral", blanco: MITAD, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular al RI"), "en la mitad del tórax,", "a la altura de T7"],
  pos: ["De pie, costado izquierdo", "contra el RI", "Brazos cruzados sobre", "la cabeza, mentón arriba", "Plano sagital ∥ al RI"] });

def({ id: "torax-lateral-camilla", blanco: MITAD, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular al RI"), "en la mitad del tórax,", "a la altura de T7"],
  pos: ["Sentado derecho en la camilla", "o en la silla de ruedas", "Brazos sobre la cabeza", "Sin rotación ni inclinación"] });

def({ id: "torax-decubito-lateral", blanco: T7, ri: "35 × 43", otra: "costado", otraTitulo: "Vista desde los pies",
  tubo: "Desde el tubo (paciente acostado)",
  rc: [R("RC horizontal"), "a T7, 8-10 cm por debajo", "de la escotadura yugular"],
  pos: ["Acostado de costado sobre", "una almohadilla", "Brazos sobre la cabeza", "Líquido: lado sospechoso abajo", "Aire: lado sospechoso arriba"] });

def({ id: "torax-ap-lordotica", blanco: "esternon_medio", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular al RI"), "en la mitad del esternón,", "9 cm por debajo de la", "escotadura yugular"],
  pos: ["De pie a ≈30 cm del RI,", "de espaldas, se inclina hacia", "atrás hasta apoyar los hombros", "Manos en las caderas"],
  pie: [M("Si no puede: AP semiaxial,"), M("RC 15-20° cefálico")] });

def({ id: "torax-oblicua-anterior--v1", blanco: T7, ri: "35 × 43", otra: "arriba", pa: true, extraOtra: giro("45°"),
  rc: [R("RC perpendicular al RI"), "a la altura de T7"],
  pos: ["OAD: de pie, rotado 45°,", "hombro derecho contra el RI", "Brazo alejado del RI arriba;", "el cercano, en la cadera"] });

def({ id: "torax-oblicua-anterior--v2", blanco: T7, ri: "35 × 43", otra: "arriba", pa: true, extraOtra: giro("45°"),
  rc: [R("RC perpendicular al RI"), "a la altura de T7"],
  pos: ["OAI: de pie, rotado 45°", "(60° en estudios cardíacos),", "hombro izquierdo contra el RI", "Brazo alejado del RI arriba;", "el cercano, en la cadera"] });

def({ id: "via-aerea-ap-lateral--v1", blanco: "centro:Sixth cervical vertebra", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "a la altura de C6-C7, entre", "la prominencia laríngea y", "la escotadura yugular"],
  pos: ["AP: sentado o de pie", "Brazos abajo, mentón", "levemente elevado"] });

def({ id: "via-aerea-ap-lateral--v2", blanco: "medio:centro:Sixth cervical vertebra|yugular", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "a la altura de C6-C7"],
  pos: ["Lateral: sentado o de pie", "Hombros abajo y hacia atrás", "Mentón levemente elevado"] });

def({ id: "esternon-oad", blanco: "esternon_medio", ri: "24 × 30", otra: "arriba", pa: true, extraOtra: giro("15-20°"),
  rc: [R("RC perpendicular"), "a la mitad del esternón,", "2,5 cm a la izquierda de la", "línea media"],
  pos: ["De pie (o semiprono),", "rotado 15-20° con el lado", "derecho contra el RI", "Tórax delgado: un poco más"] });

def({ id: "esternon-lateral", blanco: "esternon_medio", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular"), "a la mitad del esternón"],
  pos: ["De pie (se prefiere)", "Hombros hacia atrás", "Borde superior del RI 4 cm", "por encima de la escotadura", "yugular"] });

def({ id: "esternoclaviculares-pa", blanco: "medio:yugular|esternon_medio|0.35", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("RC perpendicular"), "en T2-T3, sobre el plano", "medio, ≈7 cm por debajo de", "la vértebra prominente"],
  pos: ["De pie o en decúbito prono", "Cabeza girada hacia un lado,", "sin rotar los hombros"] });

def({ id: "esternoclaviculares-oblicua", blanco: "medio:yugular|esternon_medio|0.35", ri: "18 × 24", otra: "arriba", pa: true, extraOtra: giro("10-15°"),
  rc: [R("RC perpendicular"), "en T2-T3, 2,5-5 cm lateral", "al plano medio"],
  pos: ["Desde la PA, rotar el tórax", "10-15° (OAD: EC derecha;", "OAI: EC izquierda)", "5-10°: parte superior"] });

def({ id: "costillas-ap-encima-diafragma", blanco: T7, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular al RI"), "8-10 cm por debajo de la", "escotadura yugular (T7)"],
  pos: ["De pie (se prefiere)", "Borde superior del RI ≈4 cm", "por encima de los hombros", "Hombros hacia adelante"],
  pie: [M("Inspiración")] });

def({ id: "costillas-ap-debajo-diafragma", blanco: "medio:xifoides|centro:Second lumbar vertebra", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular al RI"), "entre la punta del xifoides", "y el borde costal inferior"],
  pos: ["De pie (se prefiere)", "Borde inferior del RI en", "la cresta ilíaca"],
  pie: [M("Espiración")] });

def({ id: "costillas-axilares-oad-superiores", blanco: T7, ri: "35 × 43", otra: "arriba", pa: true, extraOtra: giro("45°"),
  rc: [R("RC perpendicular al RI"), "18-20 cm por debajo de la", "vértebra prominente (T7)"],
  pos: ["De pie, oblicua 45°", "columna alejada de la", "zona de interés", "Zona afectada centrada"] });

def({ id: "costillas-axilares-opi-inferiores", blanco: "medio:xifoides|centro:Second lumbar vertebra", ri: "35 × 43", otra: "arriba", extraOtra: giro("45°"),
  rc: [R("RC perpendicular al RI"), "entre el xifoides y el", "borde costal inferior"],
  pos: ["Rotado 45° desde la AP", "Brazo cercano al RI sobre", "la cabeza; la otra mano", "en la cintura"] });

module.exports = I;
