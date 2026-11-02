// Esquemas de pelvis, caderas, acetábulo y fémur con las figuras por capas del modelo 3D (herramientas/ilus3d/figuras/pelvis.py).
// Reemplazan a los de pelvis.cjs cuando existe el render <id>-tubo. Textos resumidos de datos/bontrager/cap05-femur-cintura-pelvica.js.
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE } = E;
const r1 = (n) => Math.round(n * 10) / 10;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];

def({ id: "pelvis-ap", blanco: "medio:eias_R+eias_L|sinfisis", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "a mitad de camino entre", "las EIAS y la sínfisis", "(≈5 cm distal a las EIAS)"],
  pos: ["Decúbito supino", "Piernas con rotación", "interna de 15-20°", "EIAS a igual distancia", "de la mesa"],
  pie: [M("No rotar las piernas si se"), M("sospecha fractura de cadera")] });

def({ id: "caderas-ap-bilateral", blanco: "medio:cabeza_femur_R+cabeza_femur_L|sinfisis|0.2", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al punto medio entre las", "cabezas femorales (≈2 cm", "por encima de la sínfisis)"],
  pos: ["Decúbito supino", "Piernas extendidas con", "rotación interna de 15-20°", "Pelvis sin rotar"] });

def({ id: "caderas-ap-unilateral", blanco: "medio:cabeza_femur_R+trocanter_mayor_R|rodilla_R|0.08", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "2,5-5 cm distal a la mitad", "del cuello femoral"],
  pos: ["Decúbito supino", "Pierna extendida, rotación", "interna de 15-20°", "(sin traumatismo)"],
  pie: [M("Que entre todo el dispositivo"), M("ortopédico, si lo hay")] });

def({ id: "pelvis-ap-axial-inlet", blanco: "medio:eias_R+eias_L|eias_R+eias_L", ri: "35 × 43", otra: "costado", ang: "40°",
  rc: [R("RC 40° caudal"), "a la altura de las EIAS", "(hombres y mujeres)"],
  pos: ["Decúbito supino", "Pelvis sin rotar", "RI centrado en el RC", "proyectado"] });

def({ id: "pelvis-ap-axial-outlet", blanco: "medio:sinfisis|rodilla_R+rodilla_L|0.08", ri: "35 × 43", otra: "costado", ang: "20-45°",
  rc: [R("RC cefálico"), "Hombres 20-35°", "Mujeres 30-45°", "2,5-5 cm por debajo de la", "sínfisis del pubis"],
  pos: ["Decúbito supino", "Pelvis sin rotar"] });

// rana, vista desde los pies (la mesa abajo): línea punteada vertical desde la cabeza femoral, el muslo (cabeza femoral ->
// rodilla) y el arco entre los dos con el ángulo del libro. El modelo está posado con ese ángulo medido en el plano transversal.
const muslo = (lado, label) => (g) => {
  const h = g.p("cabeza_femur_" + lado), k = g.p("rodilla_" + lado), r = 30;
  const a = Math.atan2(k[0] - h[0], -(k[1] - h[1])), sg = Math.sign(a) || 1;
  const top = [h[0], h[1] - 62], p2 = [h[0] + r * Math.sin(a), h[1] - r * Math.cos(a)], am = a / 2;
  return `<line x1="${r1(h[0])}" y1="${r1(h[1])}" x2="${r1(top[0])}" y2="${r1(top[1])}" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    `<line x1="${r1(h[0])}" y1="${r1(h[1])}" x2="${r1(k[0])}" y2="${r1(k[1])}" stroke="${BLUE}" stroke-width="2"/>` +
    `<path d="M${r1(h[0])},${r1(h[1] - r)} A${r},${r} 0 0 ${sg > 0 ? 1 : 0} ${r1(p2[0])},${r1(p2[1])}" fill="none" stroke="${BLUE}" stroke-width="1.6"/>` +
    E.txt(r1(h[0] + (r + 8) * Math.sin(am) + sg * 2), r1(h[1] - (r + 8) * Math.cos(am) - 4), label, 11.5, BLUE, sg > 0 ? "start" : "end", 700);
};
// oblicua: línea entre las dos EIAS contra la horizontal de la mesa
const giro = (label) => (g) => {
  const R_ = g.p("eias_R"), L_ = g.p("eias_L"), lo = R_[1] > L_[1] ? R_ : L_, hi = lo === R_ ? L_ : R_, d = Math.sign(hi[0] - lo[0]), r = 28;
  const a = Math.atan2(lo[1] - hi[1], Math.abs(hi[0] - lo[0])), p2 = [lo[0] + d * r * Math.cos(a), lo[1] - r * Math.sin(a)];
  return `<line x1="${r1(lo[0])}" y1="${r1(lo[1])}" x2="${r1(hi[0])}" y2="${r1(hi[1])}" stroke="${BLUE}" stroke-width="2"/>` +
    `<line x1="${r1(lo[0])}" y1="${r1(lo[1])}" x2="${r1(lo[0] + d * 58)}" y2="${r1(lo[1])}" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    `<path d="M${r1(lo[0] + d * r)},${r1(lo[1])} A${r},${r} 0 0 ${d > 0 ? 0 : 1} ${r1(p2[0])},${r1(p2[1])}" fill="none" stroke="${BLUE}" stroke-width="1.6"/>` +
    E.txt(r1(lo[0] + d * (r + 30)), r1(lo[1] - 6), label, 11.5, BLUE, d > 0 ? "start" : "end", 700);
};
const ambos = (...fs_) => (g) => fs_.map((f) => f(g)).join("");

def({ id: "cadera-lateral-rana-bilateral", blanco: "medio:cabeza_femur_R+cabeza_femur_L|cabeza_femur_R+cabeza_femur_L", ri: "35 × 43", otra: "costado",
  otraTitulo: "Vista desde los pies", extraOtra: ambos(muslo("R", "40-45°"), muslo("L", "40-45°")),
  rc: [R("RC perpendicular al RI"), "a la altura de las cabezas", "femorales (≈7-8 cm por", "debajo de las EIAS)"],
  pos: ["Acostado boca arriba", "Caderas y rodillas", "flexionadas", "Muslos abiertos 40-45°", "desde la vertical", "Plantas de los pies juntas"],
  pie: [M("Sin traumatismo")] });

def({ id: "cadera-lateral-rana-unilateral--v1", blanco: "medio:cabeza_femur_R|trocanter_mayor_R", ri: "24 × 30", otra: "costado",
  otraTitulo: "Vista desde los pies", extraOtra: muslo("R", "45°"),
  rc: [R("RC perpendicular"), "a la mitad del cuello", "femoral"],
  pos: ["Cuello femoral:", "acostado boca arriba,", "cadera y rodilla flexionadas", "Muslo abierto 45°", "desde la vertical"],
  pie: [M("Con 20-30° el cuello sale"), M("menos acortado")] });

def({ id: "cadera-lateral-rana-unilateral--v2", blanco: "medio:cabeza_femur_R|trocanter_mayor_R", ri: "24 × 30", otra: "costado",
  otraTitulo: "Vista desde los pies", extraOtra: ambos(giro("35-45°"), muslo("R", "apoyado en la mesa")),
  rc: [R("RC perpendicular"), "a la cabeza femoral"],
  pos: ["Cabeza y acetábulo:", "paciente girado 35-45°", "hacia el lado afectado", "Muslo abierto hasta quedar", "apoyado en la mesa"] });

def({ id: "cadera-axiolateral-danelius-miller", blanco: "medio:cabeza_femur_R|trocanter_mayor_R", ri: "24 × 30", otra: "costado",
  otraTitulo: "Vista desde el techo", tubo: "Desde el tubo (entre las piernas)",
  rc: [R("RC horizontal"), "perpendicular al cuello", "femoral y al RI"],
  pos: ["Decúbito supino", "Cadera y rodilla sanas", "flexionadas y elevadas", "Pierna afectada con 15°", "de rotación interna", "RI vertical sobre la cresta"],
  pie: [M("Traumatismo: no rotar si hay"), M("posible fractura")] });

def({ id: "acetabulo-oblicua-posterior-judet", blanco: "medio:eias_R|sinfisis|0.4", ri: "24 × 30", otra: "arriba",
  rc: [R("RC perpendicular"), "Cadera apoyada: 5 cm distal", "y 5 cm medial a la EIAS", "Cadera elevada: 5 cm distal", "a la EIAS"],
  pos: ["Oblicua posterior de 45°", "Cuña debajo de la pierna", "elevada"] });

def({ id: "acetabulo-pa-oblicua-axial-teufel", blanco: "medio:cabeza_femur_R|cresta_iliaca_R|0.08", ri: "24 × 30", otra: "costado", ang: "12°", pa: true,
  rc: [R("RC 12° cefálico"), "2,5 cm por encima del", "trocánter mayor y ≈5 cm", "lateral al plano medio"],
  pos: ["Semidecúbito prono, lado", "afectado abajo", "Oblicua anterior 35-40°"] });

def({ id: "femur-ap", blanco: "centro:Right femur", ri: "35 × 43",
  rc: [R("RC perpendicular al fémur"), "a la parte media del RI"],
  pos: ["Decúbito supino, fémur en la línea media", "Rotación interna ≈5° (15° si incluye la cadera)", "RI ≈5 cm por debajo de la rodilla", "Cadera hacia el cátodo"] });

def({ id: "femur-lateral", blanco: "centro:Right femur", ri: "35 × 43",
  rc: [R("RC perpendicular al fémur"), "a la parte media del RI"],
  pos: ["Decúbito lateral sobre el lado afectado", "Rodilla flexionada ≈45°", "Pierna sana llevada hacia atrás", "Cadera hacia el cátodo"] });

def({ id: "femur-lateral-haz-horizontal", blanco: "centro:Right femur", ri: "35 × 43", otra: "costado",
  otraTitulo: "Vista desde el techo", tubo: "Desde el tubo (al costado)",
  rc: [R("RC horizontal"), "perpendicular al fémur,", "al punto medio del RI"],
  pos: ["Acostado boca arriba, sin moverlo", "Pierna lesionada apenas elevada,", "con un apoyo bajo la rodilla", "RI parado entre las piernas,", "incluyendo la rodilla, sujeto", "con cinta adhesiva para que", "no se caiga"],
  pie: [M("Fémur proximal: Danelius-Miller")] });

module.exports = I;
