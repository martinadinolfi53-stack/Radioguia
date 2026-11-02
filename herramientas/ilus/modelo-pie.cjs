// AP oblicuas de dedos del pie con dos vistas del modelo 3D (herramientas/ilus3d/figuras/dedos_vistas.py): desde el tubo, toda la
// pierna; desde los dedos, la planta a ~37° del RI (medido en el modelo) sobre un bloque. Textos de datos/bontrager/cap04-extremidad-inferior.js.
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const r1 = (n) => Math.round(n * 10) / 10;
const rad = (a) => (a * Math.PI) / 180;

// vista desde los dedos: bloque bajo el borde levantado y arco entre el RI y la planta. La vista mira a lo largo del pie, en el
// plano de la planta, así que la planta se ve con su inclinación real (37,5°, medida en el modelo con la normal de la planta).
const bloque = (medial, incl, label) => (g) => {
  const yRI = Math.max(...["b0", "b1", "b2", "b3"].map((n) => g.p(n)[1]));
  const m1 = g.p("cabeza_mt1_R"), m5 = g.p("base_mt5_R"), bajo = medial ? m1 : m5, alto = medial ? m5 : m1;
  const dir = Math.sign(alto[0] - bajo[0]), t = Math.tan(rad(incl));
  const top = [alto[0] + dir * 0.6 * g.ppc, alto[1] + 1.0 * g.ppc];
  const b0 = [top[0] - dir * (yRI - 3 - top[1]) / t, yRI - 3];
  const ang = dir > 0 ? -incl : -180 + incl, hor = dir > 0 ? 0 : 180, r = 34;
  const p1 = [b0[0] + r * Math.cos(rad(hor)), b0[1]], p2 = [b0[0] + r * Math.cos(rad(ang)), b0[1] + r * Math.sin(rad(ang))];
  const L = Math.hypot(top[0] - b0[0], top[1] - b0[1]) + 26, e = [b0[0] + L * Math.cos(rad(ang)), b0[1] + L * Math.sin(rad(ang))];
  const am = rad((ang + (dir > 0 ? 0 : -180)) / 2), lx = b0[0] + (r + 14) * Math.cos(am) * (dir > 0 ? 1 : 1), ly = b0[1] + (r + 14) * Math.sin(am);
  return `<path d="M${r1(b0[0])},${r1(b0[1])} L${r1(top[0])},${r1(top[1])} L${r1(top[0])},${r1(b0[1])} Z" fill="#dfe3ea" fill-opacity=".85" stroke="#8a8f9c" stroke-width="1.2"/>` +
    `<line x1="${r1(b0[0])}" y1="${r1(b0[1])}" x2="${r1(e[0])}" y2="${r1(e[1])}" stroke="${BLUE}" stroke-width="1.6" stroke-dasharray="5 4"/>` +
    `<path d="M${r1(p1[0])},${r1(p1[1])} A${r},${r} 0 0 ${dir > 0 ? 0 : 1} ${r1(p2[0])},${r1(p2[1])}" fill="none" stroke="${BLUE}" stroke-width="1.6"/>` +
    E.txt(r1(lx + dir * 6), r1(ly + 2), label, 11.5, BLUE, dir > 0 ? "start" : "end", 700) +
    E.txt(r1(top[0] + dir * 4), r1(b0[1] + 14), "bloque", 10, MUTE, dir > 0 ? "start" : "end", 400);
};

const OBL = (v, medial) => def({ id: "dedos-pie-ap-oblicua--" + v, blanco: "mtf_pie_R", ri: "18 × 24", otra: "costado",
  otraTitulo: "Desde los dedos", extraOtra: bloque(medial, medial ? 37.3 : 37.2, "30-45°"),
  rc: [R("RC ⊥ al RI, centrado"), R("en las MTF de interés")],
  pos: ["Decúbito supino o sentado,", "rodilla flexionada, planta", "sobre el RI", medial ? "Rotar pie y pierna 30-45°" : "Rotar pie y pierna 30-45°",
    medial ? "hacia medial (rodilla adentro)" : "hacia lateral (rodilla afuera)", "Bloque bajo el borde levantado"],
  pie: [M(medial ? "Dedos 1.º a 3.º" : "Dedos 4.º y 5.º"), M("Varias tomas: plomo en el resto")] });
OBL("v1", true);
OBL("v2", false);

module.exports = I;
