// AP oblicuas de rodilla (rotación medial y lateral) y axial de rótula de Merchant con las vistas genéricas del modelo 3D
// (herramientas/ilus3d/figuras/rodilla_vistas.py). Textos resumidos de datos/bontrager/cap04-extremidad-inferior.js.
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const r1 = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;
const ESPACIO = "medio:vertice_rotula_R|tuberosidad_tibial_R|0.3";

// línea de los epicóndilos femorales vista desde los pies, con una horizontal (paralela a la mesa) de referencia
const giro = (label) => (g) => {
  const a = g.p("epicondilo_lat_fem_R"), b = g.p("epicondilo_med_fem_R"), u = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(...u);
  const e = [u[0] / n, u[1] / n], p0 = [a[0] - e[0] * 22, a[1] - e[1] * 22], p1 = [b[0] + e[0] * 22, b[1] + e[1] * 22];
  const izq = p0[0] < p1[0] ? p0 : p1, der = p0[0] < p1[0] ? p1 : p0;
  const ref = `<line x1="${r1(izq[0])}" y1="${r1(izq[1])}" x2="${r1(izq[0] + (der[0] - izq[0]) + 10)}" y2="${r1(izq[1])}" stroke="${MUTE}" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  return ref + `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(p1[0])}" y2="${r1(p1[1])}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 5"/>` +
    E.txt(r1(der[0] + 6), r1(der[1] + (der[1] > izq[1] ? 12 : -2)), label, 11.5, BLUE, "start", 700);
};

// ángulo del RC respecto de la horizontal (eje de los fémures), en la vista de costado
const horizontal = (label) => (g, q) => {
  const ini = g.p("rc_ini"), s = Math.sign(ini[0] - q[0]) || -1, L = 74;
  const ang = Math.atan2(ini[1] - q[1], (ini[0] - q[0]) * s), r = 44;
  const pA = [q[0] + s * r, q[1]], pB = [q[0] + s * r * Math.cos(ang), q[1] + r * Math.sin(ang)];
  const m = [q[0] + s * (r + 14) * Math.cos(ang / 2), q[1] + (r + 14) * Math.sin(ang / 2) + 4];
  return `<line x1="${r1(q[0])}" y1="${r1(q[1])}" x2="${r1(q[0] + s * L)}" y2="${r1(q[1])}" stroke="${RED}" stroke-width="1.3" stroke-dasharray="3 4"/>` +
    `<path d="M${r1(pA[0])},${r1(pA[1])} A${r},${r} 0 0 ${s > 0 ? 0 : 1} ${r1(pB[0])},${r1(pB[1])}" fill="none" stroke="${RED}" stroke-width="1.5"/>` +
    E.txt(r1(m[0]), r1(m[1]), label, 11.5, RED, s > 0 ? "start" : "end", 700);
};

const OBLICUA = (v, medial) => def({ id: "rodilla-ap-oblicuas--" + v, blanco: ESPACIO, ri: "24 × 30", otra: "costado",
  otraTitulo: "Desde los pies (corte en la rótula)", extraOtra: giro("45°"),
  rc: [R("RC perpendicular al RI"), "a la mitad del espacio", "articular, 1,25 cm por", "debajo de la rótula"],
  pos: ["Semidecúbito supino,", "pierna extendida", medial ? "Rotar 45° hacia adentro" : "Rotar 45° hacia afuera", "toda la extremidad", "(rodilla, tobillo y pie)"],
  pie: [M(medial ? "Peroné proximal sin superposición" : "Cóndilos mediales de perfil")] });
OBLICUA("v1", true);
OBLICUA("v2", false);

def({ id: "fosa-rotula-axial-merchant", blanco: "medio:centro:Right patella|centro:Left patella", ri: "18 × 24", otra: "costado",
  tubo: "Desde el tubo (lado de la cabeza)", extraOtra: horizontal("30°"),
  rc: [R("RC 30° respecto de la"), R("horizontal"), "al punto medio entre", "las rótulas"],
  pos: ["Decúbito supino, rodillas", "flexionadas 40° sobre un", "soporte, piernas relajadas", "RI apoyado contra las piernas,", "~30 cm distal a las rótulas, ⊥ RC"],
  pie: [M("DFRI 120-180 cm · sin parrilla")] });

module.exports = I;
