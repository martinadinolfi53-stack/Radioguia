// Esquemas de pelvis, cadera, fémur y rodilla en el estilo nuevo (contorno continuo + huesos de referencia).
const E = require("./estilo.cjs");
const { RED, BLUE, AMB, INK, MUTE, table, ri, riTop, tube, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso } = E;

// ---------- helpers propios ----------
const f1 = (n) => +n.toFixed(1);
// curva suave (Catmull-Rom → Bézier) que pasa por todos los puntos; devuelve tramo SIN la M inicial
function curva(pts, closed = false, t = 1) {
  const n = pts.length, P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = "";
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t];
    d += ` C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d;
}
const suave = (pts, closed = false, t = 1) => `M${f1(pts[0][0])},${f1(pts[0][1])}` + curva(pts, closed, t) + (closed ? " Z" : "");
const mirrorY = (pts, cy) => pts.map(([x, y]) => [x, 2 * cy - y]);
// transformación local → global: origen o, eje u con ángulo a (grados), v = u rotado +90°
function marco(o, a, s = 1) {
  const r = (a * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  return ([u, v]) => [o[0] + s * (u * c - v * sn), o[1] + s * (u * sn + v * c)];
}
// miembro: eje (polilínea) con medio ancho a la izquierda (wl) y a la derecha (wr) de la dirección de avance
function miembro(eje, wl, wr) {
  const L = [], R = [];
  for (let i = 0; i < eje.length; i++) {
    const a = eje[Math.max(0, i - 1)], b = eje[Math.min(eje.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy); dx /= m; dy /= m;
    L.push([eje[i][0] + dy * wl[i], eje[i][1] - dx * wl[i]]);
    R.push([eje[i][0] - dy * wr[i], eje[i][1] + dx * wr[i]]);
  }
  return { L, R };
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const ang = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const fantasma = (d) => piel(d, 'opacity=".5"');

// pie visto desde el tubo (paciente en supino, dedos hacia el techo, un poco en flexión plantar).
// Coordenadas locales: u a lo largo del pie desde el tobillo, v hacia medial. Devuelve puntos de lateral a medial.
function pieArriba(T) {
  const pts = [[0, -10], [12, -11], [26, -12.5], [40, -13.5], [50, -13], [55.5, -11.5], [57, -9], [56, -7.4], [59.5, -5.2], [58.2, -3], [61.6, -0.6], [60.4, 1.8],
    [63.6, 4.4], [62.6, 7], [66, 10.5], [66, 15], [62.5, 19], [54, 20], [40, 18.5], [24, 15], [10, 11.5], [0, 10]];
  return pts.map(T);
}
// líneas entre dedos (dibujar después de la piel)
function dedos(T) {
  return [[-7.4, 56], [-3, 58.2], [1.8, 60.4], [7, 62.6]].map(([v, u]) => linea(`M${T([u, v])} L${T([u - 6, v])}`, 1.2)).join("");
}
// ---------- cuerpo en decúbito supino visto desde el tubo (cabeza a la izquierda; lado derecho del paciente abajo) ----------
const CY = 165;
const outerTop = [[0, 104], [45, 109], [85, 106], [122, 96], [162, 88], [205, 85], [240, 89], [290, 99], [340, 106], [378, 108], [400, 109], [432, 107], [470, 110], [506, 115], [530, 118], [544, 118]];
const innerTop = [[546, 138], [530, 140], [500, 148], [450, 157], [405, 158], [378, 157], [340, 157], [298, 157], [266, 159]];
const CROTCH = [248, CY];
const ANK = [548, 128];
function supino(rot = 15) {
  const T = marco(ANK, rot);
  const footTop = pieArriba(T);
  const top = [...outerTop, ...footTop, ...innerTop];
  const bot = mirrorY(top, CY).reverse();
  const pts = [...top, CROTCH, ...bot];
  const B = marco([ANK[0], 2 * CY - ANK[1]], -rot);
  const Bm = ([u, v]) => B([u, -v]);
  return piel(suave(pts) + " L0,104 Z") + dedos(T) + dedos(Bm);
}
// eje de pierna (referencia 15°)
function rot15() {
  const T = marco(ANK, 15), B = marco([ANK[0], 2 * CY - ANK[1]], -15);
  const a = T([84, 0]), b = B([84, 0]);
  return refline(ANK[0] + 50, ANK[1], ANK[0] + 92, ANK[1]) + refline(ANK[0] + 50, 2 * CY - ANK[1], ANK[0] + 92, 2 * CY - ANK[1]) +
    `<line x1="${ANK[0]}" y1="${ANK[1]}" x2="${a[0]}" y2="${a[1]}" stroke="${BLUE}" stroke-width="1.4"/>` +
    `<line x1="${ANK[0]}" y1="${2 * CY - ANK[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${BLUE}" stroke-width="1.4"/>` +
    txt(ANK[0] + 96, ANK[1] + 12, "15°", 12, BLUE, "start", 700) + txt(ANK[0] + 96, 2 * CY - ANK[1] - 4, "15°", 12, BLUE, "start", 700);
}

// huesos de la pelvis y fémures proximales (vista AP, desde el tubo)
const hemipelvis = [[124, 148], [116, 134], [114, 116], [120, 103], [132, 96], [143, 98], [150, 106], [158, 108], [166, 113], [178, 116], [190, 117],
  [200, 122], [208, 132], [222, 137], [231, 142], [234, 150], [229, 158], [224, 162.5], [211, 162.5], [204, 155], [194, 149], [178, 147], [158, 145], [140, 146]];
function pelvisHuesos(opts = {}) {
  const hp = hemipelvis, hpB = mirrorY(hp, CY);
  // sacro y cóccix (debajo de los ilíacos)
  let s = hueso(suave([[112, 150], [128, 147], [152, 153], [176, 160], [190, 165], [176, 170], [152, 177], [128, 183], [112, 180]], true, 0.6));
  s += hueso(suave(hp, true, 0.8)) + hueso(suave(hpB, true, 0.8));
  // agujeros obturadores
  s += `<ellipse cx="214" cy="148" rx="9" ry="5.5" fill="#f6e3d3" stroke="#8c7f6a" stroke-width="1.2"/><ellipse cx="214" cy="182" rx="9" ry="5.5" fill="#f6e3d3" stroke="#8c7f6a" stroke-width="1.2"/>`;
  if (opts.l5 !== false) s += hueso("M86,151 L105,149 L105,181 L86,179 Z");
  // fémur proximal (ambos lados)
  s += femurProx(1) + femurProx(-1);
  return s;
}
// fémur AP; sg=1 lado izquierdo del paciente (arriba), -1 derecho (abajo). completo = hasta la rodilla
function femurProx(sg, completo = false) {
  const y = (v) => CY + sg * (v - CY);
  const fin = completo ? 352 : 300;
  const yfin = completo ? 132 : 122;
  // contorno abierto: empieza en el borde medial del corte, pasa por cuello/cabeza/trocánter y vuelve por el borde lateral
  const pts = [[fin, yfin + 7], [250, 129], [238, 130], [230, 133], [218, 130], [206, 131], [187, 122], [196, 113], [208, 108], [216, 100], [226, 98], [232, 104], [246, 111], [fin, yfin - 7]];
  let s = hueso(suave(pts.map(([a, b]) => [a, y(b)]), false, 0.7) + " Z");
  s += `<circle cx="196" cy="${y(129)}" r="11" fill="#ece4d4" stroke="#8c7f6a" stroke-width="1.4"/>`;
  if (completo) {
    // cóndilos femorales + rótula
    s += hueso(suave([[340, 120], [356, 113], [372, 110], [381, 114], [383, 124], [378, 133], [383, 142], [381, 152], [372, 156], [356, 153], [340, 146]].map(([a, b]) => [a, y(b)]), true, 0.8));
    s += `<ellipse cx="368" cy="${y(133)}" rx="9" ry="10" fill="none" stroke="#8c7f6a" stroke-width="1.2" stroke-dasharray="3 2"/>`;
    // tibia proximal y cabeza del peroné (insinuadas)
    s += hueso(suave([[388, 114], [386, 124], [386, 142], [388, 154], [400, 150], [430, 142], [430, 126], [400, 118]].map(([a, b]) => [a, y(b)]), true, 0.6));
  }
  return s;
}

// RI que queda debajo del paciente: se marca su borde por encima del cuerpo
const riBorde = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10 3" opacity=".75"/>`;

const I = {};

I["Pelvis|Frente · AP"] = () => svg(
  view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
  riTop(108, 79, 142, 172, "") +
  supino(15) + pelvisHuesos() +
  coll(112, 90, 134, 150) +
  dot(144, 99) + dot(144, 231) + refline(144, 99, 144, 231) +
  dot(218, 165) +
  cross(180, 165) +
  // rótulos de huesos
  note(144, 99, 60, 52, ["EIAS"], BLUE, "start") +
  note(220, 168, 420, 258, ["sínfisis del pubis"], BLUE) +
  etiquetaHueso(120, 132, "ilíaco") + etiquetaHueso(128, 169, "sacro") +
  note(198, 205, 300, 258, ["cabeza femoral"], "#8c7f6a") +
  note(224, 232, 300, 282, ["trocánter mayor"], "#8c7f6a") +
  txt(108, 268, "RI 35 x 43 transversal · parrilla", 12, INK) +
  note(186, 160, 300, 48, ["RC ⟂ al punto medio entre las EIAS", "y la sínfisis (o 5 cm sobre la sínfisis)"], RED) +
  note(596, 222, 560, 286, ["Pies, rodillas y piernas con", "rotación interna de 15°"]) +
  rot15() +
  txt(12, 318, "Manos sobre el tórax · apnea · foco grueso", 11.5, MUTE)
);

I["Cadera|Frente · AP"] = () => svg(
  view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
  riTop(146, 166, 120, 96, "") +
  supino(15) + pelvisHuesos() + riBorde(146, 166, 120, 96) +
  dot(144, 99) + dot(144, 231) +
  dot(204, 165) +
  cross(205, 215) +
  note(144, 99, 60, 52, ["EIAS"], BLUE) +
  note(204, 163, 290, 52, ["Bilateral: RC al medio entre las cabezas femorales,", "2 cm arriba del pubis · RI 35 x 43 longitudinal"], RED) +
  note(215, 218, 300, 258, ["Unilateral: RC ⟂ en el cuello femoral"], RED) +
  note(220, 168, 560, 258, ["sínfisis del pubis"], BLUE) +
  note(190, 206, 136, 252, ["cabeza femoral"], "#8c7f6a", "end") +
  note(226, 233, 300, 284, ["trocánter mayor"], "#8c7f6a") +
  etiquetaHueso(120, 132, "ilíaco") +
  txt(150, 278, "RI 24 x 30 (unilateral)", 12, INK) +
  side(24, 290, "D") + txt(40, 294, "lado derecho", 11, MUTE) +
  note(596, 222, 600, 290, ["Ambas piernas con", "rotación interna de 15°"]) +
  rot15() +
  txt(12, 318, "Piernas extendidas · pelvis sin rotación · almohada bajo la cabeza · apnea · parrilla", 11.5, MUTE)
);

I["Fémur|Frente · AP"] = () => svg(
  view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
  riTop(206, 140, 172, 140, "") +
  supino(15) + pelvisHuesos({ l5: false }) + femurProx(-1, true) + riBorde(206, 140, 172, 140) +
  coll(212, 180, 160, 60) +
  cross(288, 209) +
  note(296, 205, 420, 64, ["RC perpendicular al medio del fémur"], RED) +
  note(228, 233, 150, 272, ["trocánter mayor"], "#8c7f6a", "end") +
  note(380, 212, 420, 264, ["cóndilos femorales"], "#8c7f6a") +
  note(372, 200, 420, 244, ["rótula"], "#8c7f6a") +
  note(190, 206, 150, 252, ["cabeza femoral"], "#8c7f6a", "end") +
  txt(206, 296, "RI 35 x 43 vertical · parrilla", 12, INK) +
  side(24, 300, "D") + txt(40, 304, "lado derecho", 11, MUTE) +
  note(596, 222, 560, 270, ["Rotación interna:", "5° medio y distal", "15° si incluye cadera"]) +
  rot15() +
  txt(12, 38, "Si no entra todo: una placa de la articulación", 11.5, MUTE) + txt(12, 52, "proximal y otra de la distal.", 11.5, MUTE)
);

// pie de perfil: A = centro del tobillo, legDir = dirección de la pierna (hacia distal), plantar = flexión plantar (°)
// devuelve puntos desde la cara anterior del tobillo, pasando por los dedos, la planta y el talón, hasta la cara posterior
function piePerfil(A, legDir, plantar = 0, s = 1) {
  const fDir = legDir - 90 + plantar; // hacia los dedos
  const T = marco(A, fDir, s); // u hacia los dedos, v hacia la planta (distal)
  const pts = [[11, 0], [22, 5], [40, 10], [56, 13], [66, 15.5], [71, 19], [70.5, 24], [64, 26.5], [52, 26.5], [36, 24.5], [16, 27], [0, 29], [-9, 27], [-13.5, 19], [-13, 9], [-11, 0]];
  return pts.map(T);
}
// pierna de perfil completa: eje, anchos, pie. Devuelve {L, R, foot}
function piernaPerfil(eje, wl, wr, plantar = 0, s = 1) {
  const { L, R } = miembro(eje, wl, wr);
  const n = eje.length, A = eje[n - 1], legDir = ang(eje[n - 2], A);
  return { L, R, foot: piePerfil(A, legDir, plantar, s) };
}
const clip = (id, x, y, w, h, inner) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
const arco = (cx, cy, r, a1, a2, color = BLUE) => {
  const p = (a) => [f1(cx + r * Math.cos((a * Math.PI) / 180)), f1(cy + r * Math.sin((a * Math.PI) / 180))];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  return `<path d="M${x1},${y1} A${r},${r} 0 0 ${a2 > a1 ? 1 : 0} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
};
const BO = "#8c7f6a";

// ---------- Fémur perfil: decúbito lateral, visto desde el tubo ----------
I["Fémur|Perfil"] = () => {
  const H = [175, 172], K = [295, 103], A = [418, 136];
  const eje = [H, lerp(H, K, 0.5), lerp(H, K, 0.85), K, lerp(K, A, 0.15), lerp(K, A, 0.45), lerp(K, A, 0.85), A];
  const leg = piernaPerfil(eje, [30, 26, 21, 22, 19, 19, 14, 11], [34, 30, 24, 20, 22, 24, 16, 11]);
  const cuerpo = [[0, 128], [60, 124], [112, 126], [140, 134], ...leg.L.slice(0), ...leg.foot, ...leg.R.slice().reverse(), [178, 214], [140, 222], [90, 220], [40, 215], [0, 213]];
  // pierna no afectada, por detrás (más lejos del RI), semitransparente
  const H2 = [110, 186], K2 = [322, 214], A2 = [448, 236];
  const eje2 = [H2, lerp(H2, K2, 0.5), lerp(H2, K2, 0.85), K2, lerp(K2, A2, 0.2), lerp(K2, A2, 0.5), lerp(K2, A2, 0.85), A2];
  const g = piernaPerfil(eje2, [24, 24, 21, 21, 19, 19, 14, 11], [22, 26, 23, 20, 22, 23, 16, 11], 18);
  const ghost = [...g.L, ...g.foot, ...g.R.slice().reverse()];
  // fémur en marco del muslo: u a lo largo del fémur desde la cabeza, v hacia posterior
  const F = marco(H, ang(H, K), 1);
  const fem = [[8, -8], [40, -6], [90, -6.5], [116, -8.5], [128, -10], [137, -5], [139, 4], [133, 12], [121, 13.5], [111, 8], [90, 6], [40, 6], [20, 9], [12, 15], [3, 14], [-2, 7]].map(F);
  const M = lerp(H, K, 0.5);
  const cR = F([131, 2]);
  const pat = F([136, -19]);
  const RIc = M, rot = ang(H, K);
  return svg(
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    `<g transform="rotate(${f1(rot)} ${f1(RIc[0])} ${f1(RIc[1])})">${riTop(RIc[0] - 86, RIc[1] - 70, 172, 140, "")}</g>` +
    fantasma(suave(ghost) + " Z") +
    piel(suave(cuerpo) + " L0,128 Z") +
    hueso(suave(fem, true, 0.7)) + `<circle cx="${f1(H[0])}" cy="${f1(H[1])}" r="9.5" fill="#ece4d4" stroke="${BO}" stroke-width="1.4"/>` +
    `<ellipse cx="${f1(pat[0])}" cy="${f1(pat[1])}" rx="5" ry="9" transform="rotate(${f1(rot + 20)} ${f1(pat[0])} ${f1(pat[1])})" fill="#ece4d4" stroke="${BO}" stroke-width="1.3"/>` +
    `<g transform="rotate(${f1(rot)} ${f1(RIc[0])} ${f1(RIc[1])})">${riBorde(RIc[0] - 86, RIc[1] - 70, 172, 140)}${coll(RIc[0] - 80, RIc[1] - 26, 160, 52)}</g>` +
    cross(M[0], M[1]) +
    note(M[0] + 8, M[1] - 4, 470, 186, ["RC perpendicular al medio del fémur"], RED) +
    note(cR[0] + 6, cR[1] + 4, 470, 232, ["Cóndilos perpendiculares a la mesa", "(superpuestos)"], BLUE) +
    note(F([60, -4])[0], F([60, -4])[1], 120, 84, ["fémur"], BO, "end") +
    note(pat[0] + 4, pat[1] - 6, 340, 40, ["rótula"], BO) +
    arco(K[0], K[1], 34, -30, 15) + txt(K[0] + 26, K[1] - 18, "rodilla ~45°", 11.5, BLUE, "start", 700) +
    txt(470, 268, "pierna no afectada atrás", 11, MUTE) + linea("M466,266 L432,252", 1) +
    txt(12, 300, "Pelvis girada a lateral", 11.5, MUTE) +
    txt(470, 60, "RI 35 x 43 · parrilla", 12, INK) + txt(470, 76, "alineado con el eje del fémur", 11, MUTE)
  );
};

// ---------- Rodilla AP: vista lateral, decúbito supino ----------
I["Rodilla|Frente · AP"] = () => {
  const cuerpo = [[0, 170], [80, 173], [160, 179], [240, 187], [288, 196], [306, 190], [326, 187], [344, 192], [356, 201], [376, 206], [440, 209], [500, 212], [530, 213],
    [538, 204], [548, 186], [556, 166], [561, 148], [563, 136], [567, 129], [574, 127], [580, 131], [583, 141], [584, 160], [581, 190], [583, 222], [580, 240], [570, 250], [552, 249], [536, 244], [510, 244],
    [470, 249], [420, 251], [300, 251], [200, 251], [0, 251]];
  const fem = [[0, 196], [270, 202], [298, 199], [318, 203], [330, 213], [334, 226], [330, 240], [318, 247], [298, 246], [272, 238], [0, 232]];
  const tib = [[340, 205], [352, 207], [362, 214], [400, 218], [470, 220], [530, 220], [530, 234], [470, 235], [400, 236], [364, 240], [348, 246], [338, 240], [336, 222]];
  const per = [[350, 239], [360, 237], [366, 242], [380, 243], [470, 242], [528, 240], [528, 246], [470, 248], [380, 248], [362, 249], [350, 246]];
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    table(20, 740, 252) +
    ri(272, 268, 150, 10, "RI 24 x 30 vertical", 432, 278) +
    piel(suave(cuerpo) + " L0,170 Z") +
    hueso(suave(fem, false, 0.7) + " Z") + hueso(suave(per, true, 0.7)) + hueso(suave(tib, true, 0.7)) +
    `<ellipse cx="325" cy="196" rx="17" ry="6" transform="rotate(8 325 196)" fill="#ece4d4" stroke="${BO}" stroke-width="1.3"/>` +
    dot(343, 199) +
    tube(349, 194, 0, 150) +
    `<line x1="349" y1="200" x2="349" y2="266" stroke="${RED}" stroke-width="1.4" stroke-dasharray="3 3"/>` +
    note(349, 110, 440, 64, ["RC perpendicular, 1,25 cm distal", "al vértice de la rótula"], RED) +
    note(338, 199, 250, 150, ["vértice de la rótula"], BLUE, "end") +
    etiquetaHueso(150, 222, "fémur") + etiquetaHueso(430, 231, "tibia") +
    note(320, 238, 226, 300, ["cóndilos femorales"], BO, "end") +
    note(372, 246, 470, 304, ["cabeza del peroné"], BO) +
    txt(610, 168, "Rotar la pierna 3-5°", 12, INK) + txt(610, 184, "hacia medial: cóndilos", 12, INK) + txt(610, 200, "femorales paralelos al RI", 12, INK) +
    txt(20, 318, "Parrilla según el espesor · foco fino · DFR 1 m", 11.5, MUTE)
  );
};

// ---------- Rodilla perfil ----------
I["Rodilla|Perfil"] = () => {
  // panel 1: desde el tubo, decúbito lateral sobre el lado afectado (cara medial hacia el tubo)
  const K = [190, 162], A = [340, 162];
  const P0 = [K[0] - 210 * Math.cos(Math.PI / 9), K[1] + 210 * Math.sin(Math.PI / 9)];
  const eje = [P0, lerp(P0, K, 0.5), lerp(P0, K, 0.85), K, [K[0] + 30, K[1]], [K[0] + 80, K[1]], A];
  const leg = piernaPerfil(eje, [30, 27, 24, 28, 21, 19, 11], [32, 29, 25, 22, 22, 22, 11], 0, 1.05);
  const cuerpo = [...leg.L, ...leg.foot, ...leg.R.slice().reverse()];
  const G0 = [-20, 286], GK = [200, 290], GA = [338, 292];
  const g = piernaPerfil([G0, lerp(G0, GK, 0.5), lerp(G0, GK, 0.85), GK, lerp(GK, GA, 0.2), lerp(GK, GA, 0.5), GA], [26, 23, 19, 19, 17, 17, 10], [26, 24, 21, 18, 20, 20, 10], 25, 0.9);
  const ghost = [...g.L, ...g.foot, ...g.R.slice().reverse()];
  const F = marco(K, -20, 1); // u a lo largo del fémur (hacia distal), v hacia posterior; origen en la rodilla
  const fem = [[-150, -8], [-45, -8], [-28, -12], [-14, -14], [-4, -10], [0, -2], [-1, 8], [-6, 15], [-16, 19], [-28, 17], [-40, 9], [-150, 8]].map(F);
  const tib = [[3, -14], [12, -15], [18, -18], [24, -12], [40, -8], [100, -6], [150, -5], [150, 5], [100, 6], [40, 8], [20, 13], [6, 16], [2, 2]].map(([u, v]) => [K[0] + u, K[1] + v]);
  const per = [[16, 8], [24, 8], [28, 13], [40, 13], [150, 11], [150, 16], [40, 18], [24, 19], [16, 15]].map(([u, v]) => [K[0] + u, K[1] + v]);
  const cm = F([-14, 2]);
  const RCp = [cm[0] + 8, cm[1] + 1];
  const pat = F([-8, -19]);
  const p1 = clip("cpR1", 0, 26, 388, 304,
    fantasma(suave(ghost) + " Z") + piel(suave(cuerpo) + " Z") +
    hueso(suave(fem, false, 0.7) + " Z") + hueso(suave(per, true, 0.7)) + hueso(suave(tib, true, 0.7)) +
    `<ellipse cx="${f1(pat[0])}" cy="${f1(pat[1])}" rx="5" ry="10" transform="rotate(-10 ${f1(pat[0])} ${f1(pat[1])})" fill="#ece4d4" stroke="${BO}" stroke-width="1.3"/>` +
    riBorde(RCp[0] - 60, RCp[1] - 48, 120, 96));
  // panel 2: desde el costado de la mesa (cara medial arriba)
  const piel2 = [[395, 190], [450, 193], [520, 199], [566, 204], [584, 202], [600, 206], [614, 212], [640, 214], [690, 213], [745, 216], [745, 261], [395, 261]];
  const fem2 = [[395, 222], [550, 222], [568, 214], [586, 210], [596, 216], [598, 230], [598, 238], [596, 250], [586, 255], [568, 252], [550, 244], [395, 244]];
  const tib2 = [[604, 213], [620, 214], [632, 220], [650, 222], [745, 223], [745, 241], [650, 241], [634, 244], [620, 252], [604, 252], [602, 232]];
  const per2 = [[624, 248], [636, 246], [644, 250], [660, 250], [745, 249], [745, 255], [660, 256], [644, 258], [626, 257]];
  const p2 = clip("cpR2", 404, 26, 336, 236,
    piel(suave(piel2.slice(0, 10), false) + " L745,261 L395,261 Z") +
    hueso(suave(fem2, false, 0.7) + " Z") + hueso(suave(per2, false, 0.7) + " Z") + hueso(suave(tib2, false, 0.7) + " Z") +
    `<ellipse cx="576" cy="233" rx="11" ry="14" fill="none" stroke="${BO}" stroke-width="1.2" stroke-dasharray="3 2"/>`);
  return svg(
    view("1 · Vista desde el tubo · decúbito lateral") +
    `<g transform="translate(${f1(RCp[0] - 60)} ${f1(RCp[1] - 48)})">${riTop(0, 0, 120, 96, "")}</g>` +
    p1 +
    `<line x1="${K[0]}" y1="${K[1]}" x2="${f1(K[0] + 70 * Math.cos(-Math.PI / 9))}" y2="${f1(K[1] - 70 * Math.sin(Math.PI / 9))}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 3"/>` +
    arco(K[0], K[1], 56, -20, 0) + txt(K[0] + 66, K[1] - 34, "flexión 20°", 11.5, BLUE, "start", 700) +
    dot(cm[0], cm[1], BO) +
    cross(RCp[0], RCp[1]) +
    note(cm[0] - 2, cm[1] - 4, 110, 70, ["cóndilo medial"], BO, "end") +
    note(pat[0] - 2, pat[1] - 6, 150, 46, ["rótula"], BO, "end") +
    etiquetaHueso(K[0] + 70, K[1] + 3, "tibia") +
    note(K[0] + 34, K[1] + 17, 236, 236, ["cabeza del peroné"], BO) +
    txt(RCp[0] - 60, RCp[1] + 64, "RI 24 x 30", 12, INK) +
    txt(16, 324, "pierna no afectada detrás", 11, MUTE) +
    `<line x1="390" y1="20" x2="390" y2="320" stroke="#e2e4ea"/>` +
    `<text x="404" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">2 · VISTA DE COSTADO DE LA MESA</text>` +
    table(404, 740, 262, "") + p2 +
    dot(588, 207, BO) + txt(578, 186, "cóndilo medial", 10.5, BO, "end") +
    etiquetaHueso(470, 238, "fémur") + etiquetaHueso(690, 237, "tibia") + linea("M650,255 L664,288", 1) + etiquetaHueso(662, 300, "peroné") +
    ri(540, 278, 120, 8, "") +
    txt(424, 300, "← cabeza", 11, MUTE) + txt(736, 300, "pie →", 11, MUTE, "end") +
    tube(598, 232, -6, 160, { angLabel: "5-7°" }) + txt(666, 106, "craneal", 12, RED, "start", 700) +
    note(594, 176, 560, 62, ["RC al centro de la", "articulación, 2 cm distal", "al cóndilo medial"], RED, "end") +
    txt(404, 318, "Epicóndilos y rótula perpendiculares al RI.", 11.5, MUTE)
  );
};

module.exports = I;
