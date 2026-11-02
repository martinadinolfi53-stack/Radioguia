// AP oblicuas de rodilla (rotación medial y lateral) con las vistas genéricas del modelo 3D
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

const OBLICUA = (v, medial) => def({ id: "rodilla-ap-oblicuas--" + v, blanco: ESPACIO, ri: "24 × 30", otra: "costado",
  otraTitulo: "Desde los pies", extraOtra: giro("45°"),
  rc: [R("RC perpendicular al RI"), "a la mitad del espacio", "articular, 1,25 cm por", "debajo de la rótula"],
  pos: ["Semidecúbito supino,", "pierna extendida", medial ? "Rotar 45° hacia adentro" : "Rotar 45° hacia afuera", "toda la extremidad", "(rodilla, tobillo y pie)"],
  pie: [M(medial ? "Peroné proximal sin superposición" : "Cóndilos mediales de perfil")] });
OBLICUA("v1", true);
OBLICUA("v2", false);

// Merchant sigue con el dibujo a mano (rodilla.cjs): con las rodillas flexionadas, la piel del avatar queda por detrás de la
// rótula y del fémur del modelo anatómico y los huesos asoman.

module.exports = I;
