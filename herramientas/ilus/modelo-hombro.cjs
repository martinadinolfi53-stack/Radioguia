// Garth, PA transaxilar de Hobbs y oblicua PA / Neer rehechas con las vistas genéricas del modelo 3D
// (herramientas/ilus3d/figuras/hombro_vistas.py). Textos resumidos de datos/cap03-humero-cintura-escapular.js.
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const r1 = (n) => Math.round(n * 10) / 10;
// línea de los hombros (de cabeza humeral a cabeza humeral) en la vista desde arriba, con una paralela al RI, para mostrar el giro
const giro = (label) => (g) => {
  const a = g.p("cabeza_humero_R"), b = g.p("cabeza_humero_L"), u = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(...u);
  const p0 = [a[0] - u[0] / n * 20, a[1] - u[1] / n * 20], p1 = [b[0] + u[0] / n * 20, b[1] + u[1] / n * 20];
  const ref = `<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(a[0] + Math.sign(u[0] || 1) * 90)}" y2="${r1(a[1])}" stroke="${MUTE}" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  return ref + `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(p1[0])}" y2="${r1(p1[1])}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 5"/>` +
    (p1[0] + 4 + label.length * 6.5 > 452       // si no entra antes de la columna del texto, el rótulo va del otro lado
      ? E.txt(r1(p1[0] - 4), r1(p1[1] + (u[1] > 0 ? 14 : -4)), label, 11.5, BLUE, "end", 700)
      : E.txt(r1(p1[0] + 4), r1(p1[1] + (u[1] > 0 ? 14 : -4)), label, 11.5, BLUE, "start", 700));
};

def({ id: "hombro-garth", blanco: "cabeza_humero_R", ri: "24 × 30", otra: "costado", ang: "45°",
  tubo: "De frente (como lo ve el técnico)",
  rc: [R("RC 45° caudal"), "a la cara medial de la", "articulación escapulohumeral"],
  pos: ["De pie (o en decúbito)", "Oblicua posterior 45°:", "hombro afectado contra el RI", "Codo flexionado, mano", "sobre el otro hombro"],
  pie: [M("RI centrado en la salida del RC")] });

def({ id: "hombro-transaxilar-hobbs", blanco: "cabeza_humero_R", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("RC perpendicular al RI"), "centrado en la articulación", "glenohumeral"],
  pos: ["PA, de pie o en decúbito", "Brazo afectado elevado,", "en extensión completa", "Cabeza girada hacia el", "otro lado"] });

def({ id: "hombro-y-escapula-neer", blanco: "cabeza_humero_R", ri: "24 × 30", otra: "arriba", pa: true, extraOtra: giro("45-60°"),
  rc: [R("Y de escápula: RC ⊥"), "a la articulación", "escapulohumeral", R("Neer: RC 10-15° caudal"), "al borde superior de la", "cabeza humeral"],
  pos: ["Desde la PA, oblicua 45-60°", "con el hombro afectado", "contra el RI (escápula ⊥ RI)", "Brazo sano arriba y adelante;", "el afectado abajo, sin moverlo"] });

module.exports = I;
