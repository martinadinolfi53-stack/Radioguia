// Esquemas de pelvis, caderas, acetábulo, caderas pediátricas y fémur (Bontrager 9.ª ed., cap. 7).
// Base: herramientas/ilus/referencia-tecnicas1-pelvis.cjs y -columna.cjs (helpers copiados y adaptados).
// Solo unidades métricas en los rótulos.
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONE, BONEO, table, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, cabezaPerfil, cabezaFrente } = E;
const BO = BONEO;

// ---------- helpers (copiados de referencia-tecnicas1-pelvis.cjs) ----------
const f1 = (n) => +n.toFixed(1);
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
function marco(o, a, s = 1) {
  const r = (a * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  return ([u, v]) => [o[0] + s * (u * c - v * sn), o[1] + s * (u * sn + v * c)];
}
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
const clip = (id, x, y, w, h, inner) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
const arco = (cx, cy, r, a1, a2, color = BLUE) => {
  const p = (a) => [f1(cx + r * Math.cos((a * Math.PI) / 180)), f1(cy + r * Math.sin((a * Math.PI) / 180))];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  return `<path d="M${x1},${y1} A${r},${r} 0 0 ${a2 > a1 ? 1 : 0} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
};
const riBorde = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10 3" opacity=".75"/>`;
const panelSep = (title, x = 388) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>` +
  `<text x="${x + 14}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
// varias formas de piel fundidas en una sola silueta (contornos primero, rellenos después)
const union = (ds) => `<g>${ds.map((d) => `<path d="${d}" fill="none" stroke="${SKO}" stroke-width="4" stroke-linejoin="round"/>`).join("")}${ds.map((d) => `<path d="${d}" fill="${SK}"/>`).join("")}</g>`;
const poly = (m) => suave([...m.L, ...m.R.slice().reverse()], true, 0.8);
// tubo con el texto siempre derecho (para haces horizontales vistos desde arriba)
function tuboLibre(tx, ty, dir, len = 150) {
  const r = (dir * Math.PI) / 180, ux = Math.cos(r), uy = Math.sin(r);
  const cx = tx - len * ux, cy = ty - len * uy;
  return `<g transform="rotate(${f1(dir - 90)} ${f1(cx)} ${f1(cy)})"><rect x="${f1(cx - 42)}" y="${f1(cy - 20)}" width="84" height="40" rx="6" fill="#e9ebf0" stroke="#8a8f9c"/></g>` +
    `<text x="${f1(cx)}" y="${f1(cy + 4)}" font-size="12" text-anchor="middle" fill="${MUTE}">Tubo</text>` +
    `<line x1="${f1(cx + 26 * ux)}" y1="${f1(cy + 26 * uy)}" x2="${f1(tx - 8 * ux)}" y2="${f1(ty - 8 * uy)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>`;
}
const guion = (x1, y1, x2, y2, c = RED) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
const cota = (x1, y1, x2, y2, t, tx, ty, anchor = "middle") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BLUE}" stroke-width="1.3"/>` + txt(tx, ty, t, 11, BLUE, anchor, 700);

// ---------- cuerpo en decúbito supino visto desde el tubo (de la referencia; cabeza a la izquierda, lado derecho abajo) ----------
const CY = 165;
const outerTop = [[0, 104], [45, 109], [85, 106], [122, 96], [162, 88], [205, 85], [240, 89], [290, 99], [340, 106], [378, 108], [400, 109], [432, 107], [470, 110], [506, 115], [530, 118], [544, 118]];
const innerTop = [[546, 138], [530, 140], [500, 148], [450, 157], [405, 158], [378, 157], [340, 157], [298, 157], [266, 159]];
const CROTCH = [248, CY];
const ANK = [548, 128];
function pieArriba(T) {
  const pts = [[0, -10], [12, -11], [26, -12.5], [40, -13.5], [50, -13], [55.5, -11.5], [57, -9], [56, -7.4], [59.5, -5.2], [58.2, -3], [61.6, -0.6], [60.4, 1.8],
    [63.6, 4.4], [62.6, 7], [66, 10.5], [66, 15], [62.5, 19], [54, 20], [40, 18.5], [24, 15], [10, 11.5], [0, 10]];
  return pts.map(T);
}
function dedos(T) {
  return [[-7.4, 56], [-3, 58.2], [1.8, 60.4], [7, 62.6]].map(([v, u]) => linea(`M${T([u, v])} L${T([u - 6, v])}`, 1.2)).join("");
}
function supino(rot = 15) {
  const T = marco(ANK, rot);
  const top = [...outerTop, ...pieArriba(T), ...innerTop];
  const pts = [...top, CROTCH, ...mirrorY(top, CY).reverse()];
  const B = marco([ANK[0], 2 * CY - ANK[1]], -rot);
  return piel(suave(pts) + " L0,104 Z") + dedos(T) + dedos(([u, v]) => B([u, -v]));
}
// partes sueltas para armar otras posturas con union()
const trunkTop = [[-30, 104], [0, 104], [45, 109], [85, 106], [122, 96], [162, 88], [205, 85], [240, 89], [258, 118], [256, 150]];
const tronco = () => suave([...trunkTop, ...mirrorY(trunkTop, CY).reverse()], true, 0.8);
// pierna extendida (sg=1 izquierda, arriba; -1 derecha, abajo); devuelve {d, dedos}
function piernaExt(sg, rot = 15) {
  const T = marco(ANK, rot);
  let pts = [[236, 92], ...outerTop.slice(7), ...pieArriba(T), ...innerTop, [252, 163], [226, 140]];
  if (sg < 0) pts = mirrorY(pts, CY);
  const B = marco([ANK[0], 2 * CY - ANK[1]], -rot);
  return { d: suave(pts, true, 0.8), dedos: sg > 0 ? dedos(T) : dedos(([u, v]) => B([u, -v])) };
}
// pierna en «posición de rana» vista desde arriba (cadera y rodilla flexionadas, muslo abducido, planta contra planta)
function piernaRana(sg) {
  const Y = (y) => (sg > 0 ? y : 2 * CY - y);
  const H = [205, Y(126)], K = [282, Y(52)], A = [324, Y(152)];
  const th = poly(miembro([[196, Y(140)], H, lerp(H, K, 0.55), K], [34, 32, 27, 21], [34, 32, 27, 21]));
  const sh = poly(miembro([K, lerp(K, A, 0.5), A], [20, 17, 10], [20, 17, 10]));
  const ft = suave([[318, Y(158)], [330, Y(151)], [350, Y(151)], [366, Y(156)], [368, Y(162)], [350, Y(165)], [326, Y(165)]], true, 0.8);
  return { d: [th, sh, ft], H, K, A };
}
// fémur dibujado entre la cabeza y la rodilla (vista desde arriba en rana)
function femurRana(sg) {
  const Y = (y) => (sg > 0 ? y : 2 * CY - y);
  const Hd = [196, Y(129)], K = [282, Y(52)];
  const m = miembro([[204, Y(122)], [214, Y(112)], lerp([214, Y(112)], K, 0.5), K], [7, 5, 5, 11], [7, 9, 5, 11]);
  return hueso(poly(m)) + `<circle cx="196" cy="${Y(129)}" r="11" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>`;
}

// huesos de la pelvis y fémures proximales (vista AP desde el tubo), de la referencia
const hemipelvis = [[124, 148], [116, 134], [114, 116], [120, 103], [132, 96], [143, 98], [150, 106], [158, 108], [166, 113], [178, 116], [190, 117],
  [200, 122], [208, 132], [222, 137], [231, 142], [234, 150], [229, 158], [224, 162.5], [211, 162.5], [204, 155], [194, 149], [178, 147], [158, 145], [140, 146]];
function pelvisHuesos(opts = {}) {
  const hp = hemipelvis, hpB = mirrorY(hp, CY);
  let s = hueso(suave([[112, 150], [128, 147], [152, 153], [176, 160], [190, 165], [176, 170], [152, 177], [128, 183], [112, 180]], true, 0.6));
  s += hueso(suave(hp, true, 0.8)) + hueso(suave(hpB, true, 0.8));
  s += `<ellipse cx="214" cy="148" rx="9" ry="5.5" fill="${SK}" stroke="${BO}" stroke-width="1.2"/><ellipse cx="214" cy="182" rx="9" ry="5.5" fill="${SK}" stroke="${BO}" stroke-width="1.2"/>`;
  if (opts.l5 !== false) s += hueso("M86,151 L105,149 L105,181 L86,179 Z");
  if (opts.femur !== false) s += femurProx(1) + femurProx(-1);
  return s;
}
function femurProx(sg, completo = false) {
  const y = (v) => CY + sg * (v - CY);
  const fin = completo ? 352 : 300;
  const yfin = completo ? 132 : 122;
  const pts = [[fin, yfin + 7], [250, 129], [238, 130], [230, 133], [218, 130], [206, 131], [187, 122], [196, 113], [208, 108], [216, 100], [226, 98], [232, 104], [246, 111], [fin, yfin - 7]];
  let s = hueso(suave(pts.map(([a, b]) => [a, y(b)]), false, 0.7) + " Z");
  s += `<circle cx="196" cy="${y(129)}" r="11" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>`;
  if (completo) {
    s += hueso(suave([[340, 120], [356, 113], [372, 110], [381, 114], [383, 124], [378, 133], [383, 142], [381, 152], [372, 156], [356, 153], [340, 146]].map(([a, b]) => [a, y(b)]), true, 0.8));
    s += `<ellipse cx="368" cy="${y(133)}" rx="9" ry="10" fill="none" stroke="${BO}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
    s += hueso(suave([[388, 114], [386, 124], [386, 142], [388, 154], [400, 150], [430, 142], [430, 126], [400, 118]].map(([a, b]) => [a, y(b)]), true, 0.6));
  }
  return s;
}
// líneas de rotación interna de los pies (ángulo a, rótulo t); lados: "ambos" | "der"
function rotPies(a, t, lados = "ambos") {
  const T = marco(ANK, a), B = marco([ANK[0], 2 * CY - ANK[1]], -a);
  const p = T([84, 0]), q = B([84, 0]);
  let s = "";
  if (lados === "ambos") s += refline(ANK[0] + 50, ANK[1], ANK[0] + 92, ANK[1]) + `<line x1="${ANK[0]}" y1="${ANK[1]}" x2="${f1(p[0])}" y2="${f1(p[1])}" stroke="${BLUE}" stroke-width="1.4"/>` + txt(ANK[0] + 96, ANK[1] + 12, t, 12, BLUE, "start", 700);
  s += refline(ANK[0] + 50, 2 * CY - ANK[1], ANK[0] + 92, 2 * CY - ANK[1]) + `<line x1="${ANK[0]}" y1="${2 * CY - ANK[1]}" x2="${f1(q[0])}" y2="${f1(q[1])}" stroke="${BLUE}" stroke-width="1.4"/>` +
    txt(ANK[0] + 96, 2 * CY - ANK[1] - 4, t, 12, BLUE, "start", 700);
  return s;
}
const EIAS = [[144, 99], [144, 231]];

const I = {};

// ---------- AP de pelvis ----------
I["pelvis-ap"] = () => svg(
  view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
  riTop(95, 79, 172, 172, "") +
  supino(17) + pelvisHuesos() +
  coll(102, 86, 158, 158) +
  dot(...EIAS[0]) + dot(...EIAS[1]) + refline(144, 99, 144, 231) + dot(218, 165) +
  cota(144, 64, 181, 64, "≈5 cm", 162, 58) + `<line x1="181" y1="60" x2="181" y2="152" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
  cross(181, 165) +
  note(144, 99, 60, 46, ["EIAS"], BLUE) +
  note(220, 168, 420, 252, ["sínfisis del pubis"], BLUE) +
  etiquetaHueso(118, 132, "ilíaco") + etiquetaHueso(108, 178, "sacro") +
  note(198, 205, 330, 296, ["cabeza femoral"], BO) +
  note(186, 160, 300, 46, ["RC ⟂ a mitad de camino entre las EIAS", "y la sínfisis (≈5 cm distal a las EIAS)"], RED) +
  txt(12, 292, "RI 35 x 43 horizontal · parrilla · DFRI 100 cm", 12, INK) +
  note(596, 222, 540, 286, ["Pies, rodillas y piernas con", "rotación interna de 15-20°"]) +
  rotPies(17, "15-20°") +
  txt(12, 318, "Piernas extendidas · apoyo bajo las rodillas · EIAS a igual distancia del tablero · apnea", 11.5, MUTE)
);

// ---------- AP bilateral de caderas ----------
I["caderas-ap-bilateral"] = () => svg(
  view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
  riTop(110, 79, 172, 172, "") +
  supino(17) + pelvisHuesos() +
  coll(118, 88, 156, 154) +
  dot(...EIAS[0]) + dot(...EIAS[1]) + dot(218, 165) +
  refline(196, 112, 196, 218) +
  cota(196, 255, 218, 255, "≈2 cm", 207, 272) + `<line x1="218" y1="172" x2="218" y2="258" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
  cross(196, 165) +
  note(144, 99, 60, 46, ["EIAS"], BLUE) +
  note(220, 168, 420, 238, ["sínfisis del pubis"], BLUE) +
  note(190, 206, 300, 270, ["cabeza femoral"], BO) +
  note(190, 160, 300, 46, ["RC ⟂ al punto medio entre las cabezas", "femorales (≈2 cm sobre la sínfisis)"], RED) +
  txt(12, 290, "RI 35 x 43 horizontal · parrilla", 12, INK) + txt(12, 304, "DFRI 100 cm · apnea", 12, INK) +
  note(596, 222, 540, 286, ["Ambas piernas extendidas, con", "la misma rotación interna 15-20°"]) +
  rotPies(17, "15-20°") +
  txt(220, 318, "Pelvis sin rotar · apoyo bajo las rodillas", 11.5, MUTE)
);

// ---------- AP unilateral de cadera ----------
I["caderas-ap-unilateral"] = () => {
  const neck = [208, 212], rc = [234, 214];
  return svg(
    view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
    riTop(rc[0] - 60, rc[1] - 48, 120, 96, "") +
    supino(17) + pelvisHuesos() + riBorde(rc[0] - 60, rc[1] - 48, 120, 96) +
    coll(rc[0] - 52, rc[1] - 40, 104, 80) +
    dot(...neck) +
    cross(...rc) +
    note(neck[0] + 2, neck[1] + 6, 330, 300, ["mitad del cuello femoral"], BLUE) +
    note(rc[0] + 8, rc[1] - 6, 330, 46, ["RC ⟂ al RI, 2,5-5 cm distal a la mitad", "del cuello femoral (entra la prótesis)"], RED) +
    note(190, 206, 110, 300, ["cabeza femoral"], BO, "end") +
    note(144, 231, 60, 262, ["EIAS"], BLUE, "end") + dot(...EIAS[1]) +
    txt(300, 262, "RI 24 x 30 vertical · parrilla", 12, INK) +
    side(24, 56, "D") + txt(40, 60, "lado afectado", 11, MUTE) +
    note(596, 222, 540, 286, ["Pierna extendida con", "rotación interna de 15-20°"]) +
    rotPies(17, "15-20°", "der") +
    txt(330, 96, "Apoyo bajo las rodillas · apnea · DFRI 100 cm", 11.5, MUTE)
  );
};

// ---------- vistas laterales en decúbito supino (de referencia-tecnicas1-columna.cjs) ----------
const NX = 105.28, NY = 252;
function escena(s, tx, ty) {
  const X = (x) => tx + s * (x - NX), Y = (y) => ty + s * (y - NY);
  const tp = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => `${f1(X(+a))},${f1(Y(+b))}`);
  return { s, X, Y, tp, cabeza: (o = {}) => cabezaPerfil(tx, ty, { s: 0.42 * s, ...o }) };
}
const CUELLO = "C176,226 180,212 196,200";
const PECHO = "C222,184 256,178 286,182";
const ABDOMEN = "C312,188 336,196 362,198 C380,199 396,198 412,198";
const PIERNAS_EXT = "C440,200 480,206 520,212 C540,214 556,214 572,218 C610,224 640,226 660,228 C664,220 666,206 670,198 " +
  "C673,192 682,192 684,200 C686,214 688,232 688,246 C688,252 680,252 672,252 L420,252 Z";
const BRAZO_COSTADO = "M206,206 C240,214 272,224 300,230 C330,234 360,232 384,228 C396,226 404,232 398,240 C392,246 380,246 366,244 C336,242 300,244 270,238 C240,232 214,226 200,220";
const huesoT = (d, op = 0.6) => `<path d="${d}" fill="${BONE}" fill-opacity="${op}" stroke="${BONEO}" stroke-width="1.4" stroke-linejoin="round"/>`;
function coxalPerfil(E, op = 0.6) {
  const ala = E.tp("M386,207 C370,201 351,210 352,226 C353,240 362,247 373,246 C383,245 390,239 398,238 C404,240 408,246 416,249 C424,250 428,244 424,238 C421,233 420,228 422,223 C424,218 422,213 418,210 C410,207 400,212 394,212 Z");
  const cresta = E.tp("M386,207 C370,201 351,210 352,226 C353,240 362,247 373,246");
  return huesoT(ala, op) + `<path d="${cresta}" fill="none" stroke="${BONEO}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<circle cx="${f1(E.X(410))}" cy="${f1(E.Y(229))}" r="${f1(6 * E.s)}" fill="none" stroke="${BONEO}" stroke-width="1.1"/>` +
    hueso(E.tp("M386,225 C398,226 410,234 418,244 L415,249 C404,247 394,245 387,240 Z")) +
    `<ellipse cx="${f1(E.X(419))}" cy="${f1(E.Y(211))}" rx="4.5" ry="3.5" fill="${BONE}" stroke="${BONEO}" stroke-width="1.4"/>` +
    `<path d="${E.tp("M412,224 C414,218 416,214 419,211")}" fill="none" stroke="${BONEO}" stroke-width="3" stroke-linecap="round"/>` +
    hueso(E.tp("M408,229 C430,231 470,234 500,236 L500,243 C470,242 430,240 410,236 Z"));
}
const SUP = escena(1, NX, NY);
const supinoExt = () => piel(SUP.cabeza().d + " " + SUP.tp(CUELLO + " " + PECHO + " " + ABDOMEN + " " + PIERNAS_EXT)) + linea(BRAZO_COSTADO) + SUP.cabeza().cara;

// ---------- AP axial «inlet» ----------
I["pelvis-ap-axial-inlet"] = () => {
  const ex = 382, ey = 205, tgt = [382, 199];
  const riX = tgt[0] + (270 - tgt[1]) * Math.tan((40 * Math.PI) / 180);
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(riX - 86, 268, 172, 10, "RI 35 x 43 horizontal · parrilla", riX + 96, 278) +
    supinoExt() + coxalPerfil(SUP) +
    dot(ex, ey) + note(ex - 3, ey + 3, 300, 238, ["EIAS"], BLUE, "end") +
    tube(tgt[0], tgt[1], 40, 170) +
    guion(tgt[0], tgt[1], riX, 268) +
    note(327, 134, 520, 54, ["RC 40° caudal, a la altura", "de las EIAS (hombres y mujeres)"], RED) +
    note(riX, 279, 470, 312, ["RI centrado en el RC proyectado"], INK) +
    note(560, 222, 600, 160, ["Pelvis sin rotar:", "EIAS a igual distancia"]) +
    txt(40, 304, "Centrado en la línea media · apnea · DFRI 100 cm", 11.5, MUTE)
  );
};

// ---------- AP axial «outlet» (Taylor) ----------
I["pelvis-ap-axial-outlet"] = () => {
  const sx = 419, sy = 211, tgt = [452, 202], a = 32;
  const riX = tgt[0] - (270 - tgt[1]) * Math.tan((a * Math.PI) / 180);
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(riX - 86, 268, 172, 10, "RI 35 x 43 horizontal · parrilla", riX + 96, 278) +
    supinoExt() + coxalPerfil(SUP) +
    note(sx - 2, sy - 3, 330, 150, ["sínfisis del pubis"], BLUE, "end") +
    cota(sx, 150, tgt[0], 150, "2,5-5 cm", 446, 143, "end") + `<line x1="${sx}" y1="146" x2="${sx}" y2="207" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    tube(tgt[0], tgt[1], -a, 170, { angLabel: " " }) +
    guion(tgt[0], tgt[1], riX, 268) +
    txt(560, 74, "Hombres: 20-35°", 13, RED, "start", 700) + txt(560, 92, "Mujeres: 30-45°", 13, RED, "start", 700) + txt(560, 110, "cefálico", 13, RED, "start", 700) +
    `<line x1="556" y1="86" x2="${tgt[0] + 30}" y2="104" stroke="${RED}" stroke-width="1.1"/>` +
    note(tgt[0] + 4, tgt[1] - 4, 560, 140, ["Centrado 2,5-5 cm distal a la", "sínfisis o a los trocánteres mayores"], RED) +
    note(riX, 279, 470, 312, ["RI centrado en el RC proyectado"], INK) +
    txt(40, 304, "Línea media · EIAS a igual distancia · apnea", 11.5, MUTE)
  );
};

// ---------- «rana» vista desde los pies del paciente ----------
// izq / der = lado del dibujo (el lado derecho del paciente queda a la izquierda). tipo: "rana" | "ext"
function piesRana(cx, { izq = "rana", der = "rana", angulo = true, blanco = "centro" } = {}) {
  const Jl = [cx - 60, 234], Jr = [cx + 60, 234];
  const parts = [suave([[cx - 92, 234], [cx - 80, 206], [cx, 194], [cx + 80, 206], [cx + 92, 234], [cx + 74, 258], [cx, 261], [cx - 74, 258]], true, 0.9)];
  let top = "", bones = "", extra = "";
  for (const [J, sg, tipo] of [[Jl, -1, izq], [Jr, 1, der]]) {
    if (tipo === "rana") {
      const K = [J[0] + sg * 74, J[1] - 84], A = [cx + sg * 11, 244];
      parts.push(poly(miembro([[J[0] - sg * 6, J[1] + 6], J, K], [24, 23, 19], [24, 23, 19])));
      top += piel(poly(miembro([K, lerp(K, A, 0.5), A], [17, 15, 10], [17, 15, 10])), 'opacity=".55"') +
        piel(suave([[A[0] - 9, 224], [A[0] + 9, 224], [A[0] + 10, 248], [A[0], 258], [A[0] - 10, 248]], true, 0.9), 'opacity=".55"');
      bones += hueso(poly(miembro([J, lerp(J, K, 0.5), K], [5, 4.5, 8], [5, 4.5, 8])));
      if (angulo) extra += refline(J[0], J[1], J[0], J[1] - 105) + arco(J[0], J[1], 58, -90, sg > 0 ? -45 : -135) + txt(J[0] + sg * 14, J[1] - 66, "45°", 13, BLUE, sg > 0 ? "start" : "end", 700);
    } else {
      top += piel(suave([[J[0] - 12, 234], [J[0] - 14, 200], [J[0] - 6, 178], [J[0] + 6, 178], [J[0] + 14, 200], [J[0] + 12, 234], [J[0], 246]], true, 0.9));
      extra += txt(J[0] + 22, 196, "pierna", 10.5, MUTE) + txt(J[0] + 22, 208, "extendida", 10.5, MUTE);
    }
    bones += `<circle cx="${J[0]}" cy="${J[1]}" r="10" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>`;
  }
  const tgt = blanco === "centro" ? [cx, 232] : Jl;
  return { s: table(cx - 170, cx + 170, 262, "") + ri(cx - 100, 278, 200, 8) + union(parts) + bones + top + extra + tube(tgt[0], tgt[1], 0, 150), tgt };
}

// ---------- lateral unilateral de cadera en rana ----------
function ranaArriba(dx, { bilateral }) {
  const ps = [tronco(), ...piernaRana(-1).d];
  let dd = "";
  if (bilateral) ps.push(...piernaRana(1).d);
  else { const p = piernaExt(1, 0); ps.push(p.d); dd = p.dedos; }
  return `<g transform="translate(${dx} 0)">${union(ps)}${dd}${pelvisHuesos({ femur: false, l5: false })}${femurRana(-1)}${bilateral ? femurRana(1) : femurProx(1)}</g>`;
}
// ---------- AP bilateral de caderas en rana ----------
I["cadera-lateral-rana-bilateral"] = () => {
  const P = piesRana(190, { blanco: "centro" });
  const dx = 400;
  return svg(
    view("1 · Vista desde los pies del paciente") + P.s +
    txt(262, 60, "Caderas y rodillas", 12, INK, "start", 700) + txt(262, 76, "flexionadas, plantas", 12, INK) + txt(262, 92, "juntas", 12, INK) +
    note(150, 282, 110, 312, ["RI 35 x 43 horizontal · parrilla"], INK) +
    txt(16, 60, "Ambos fémures abducidos", 11.5, MUTE) + txt(16, 74, "por igual: 40-45° de la", 11.5, MUTE) + txt(16, 88, "vertical (si se puede)", 11.5, MUTE) +
    panelSep("2 · Vista desde el tubo") +
    clip("cpRB", 392, 26, 368, 300, riTop(dx + 110, 79, 172, 172, "") + ranaArriba(dx, { bilateral: true }) + riBorde(dx + 110, 79, 172, 172)) +
    dot(dx + 144, 99) + dot(dx + 144, 231) + dot(dx + 218, 165) +
    cota(dx + 144, 56, dx + 196, 56, "7-8 cm", dx + 170, 50) + `<line x1="${dx + 196}" y1="52" x2="${dx + 196}" y2="152" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<line x1="${dx + 144}" y1="52" x2="${dx + 144}" y2="95" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    cross(dx + 196, 165) +
    note(dx + 144, 231, 430, 290, ["EIAS"], BLUE, "end") +
    note(dx + 200, 172, 560, 300, ["RC ⟂ a la altura de las cabezas", "femorales (7-8 cm bajo las EIAS)"], RED) +
    txt(404, 314, "", 1)
  );
};

// ---------- axiolateral de Danelius-Miller (vista desde arriba, haz horizontal) ----------
I["cadera-axiolateral-danelius-miller"] = () => {
  const neck = [210, 214], dir = 130;
  const r = (dir * Math.PI) / 180, ux = Math.cos(r), uy = Math.sin(r);
  const c = [neck[0] + 60 * ux, neck[1] + 60 * uy]; // centro del RI
  const nr = ((dir - 90) * Math.PI) / 180, nx = Math.cos(nr), ny = Math.sin(nr);
  const L = 60;
  const p1 = [c[0] - L * nx, c[1] - L * ny], p2 = [c[0] + L * nx, c[1] + L * ny];
  const derecha = piernaExt(-1, 15);
  // pierna sana flexionada y elevada: el muslo apunta hacia el techo y hacia craneal
  const Hs = [212, 128], Ks = [162, 112];
  const muslo = poly(miembro([[226, 136], Hs, lerp(Hs, Ks, 0.6), Ks], [26, 28, 26, 22], [26, 28, 26, 22]));
  const pie = suave([[150, 92], [168, 88], [184, 94], [186, 108], [176, 120], [160, 124], [146, 116], [144, 102]], true, 0.9);
  return svg(
    view("Vista desde arriba · decúbito supino · haz horizontal") +
    union([tronco(), derecha.d]) + derecha.dedos + pelvisHuesos({ femur: false }) + femurProx(-1) +
    piel(muslo) + piel(pie) + linea("M152,108 C160,104 170,104 178,108", 1.2) +
    refline(193, 200, 232, 232) +
    `<line x1="${f1(p1[0])}" y1="${f1(p1[1])}" x2="${f1(p2[0])}" y2="${f1(p2[1])}" stroke="${INK}" stroke-width="8"/>` +
    tuboLibre(neck[0], neck[1], dir, 190) +
    guion(neck[0], neck[1], c[0], c[1]) +
    note(f1(p2[0]) + 4, f1(p2[1]), 300, 300, ["RI vertical con parrilla portátil, apoyado sobre", "la cresta ilíaca y ⟂ al RC (24 x 30)"], INK) +
    note(250, 166, 420, 150, ["RC horizontal, ⟂ al cuello", "femoral y al RI"], RED) +
    note(226, 230, 420, 246, ["cuello femoral"], BLUE) +
    note(150, 100, 60, 52, ["Pierna sana flexionada y", "elevada, con apoyo"], INK, "start") +
    note(596, 222, 560, 286, ["Pierna afectada: rotación", "interna 15° (no si hay fractura)"]) +
    rotPies(15, "15°", "der") +
    txt(470, 60, "Pelvis sin rotación · apnea", 11.5, MUTE) + txt(470, 76, "DFRI 100 cm", 11.5, MUTE)
  );
};

// ---------- oblicuas: corte visto desde los pies ----------
// pelvis como bloque redondeado girado "a" grados; apoya su borde inferior en la mesa (y=250)
function bloqueGirado(cx, a, w = 180, h = 84) {
  const T = marco([cx, 0], -a);
  const hw = w / 2, hh = h / 2;
  const raw = [[-hw, -hh + 18], [-hw + 18, -hh], [hw - 18, -hh], [hw, -hh + 18], [hw, hh - 18], [hw - 18, hh], [-hw + 18, hh], [-hw, hh - 18]];
  const pts0 = raw.map(T);
  const maxY = Math.max(...pts0.map((p) => p[1]));
  const dy = 248 - maxY;
  const G = ([u, v]) => { const p = T([u, v]); return [p[0], p[1] + dy]; };
  return { d: suave(raw.map(G), true, 0.6), G };
}

// ---------- Judet ----------
I["acetabulo-oblicua-posterior-judet"] = () => {
  const { d, G } = bloqueGirado(200, 45);
  const hd = G([-58, 6]), hu = G([58, 6]), c = G([0, 0]);
  const w1 = G([-50, 42]), w2 = G([86, 42]);
  const wedge = `M${f1(w1[0] + 6)},248 L${f1(w2[0])},248 L${f1(w2[0])},${f1(w2[1])} Z`;
  const ring = hueso(suave([[-70, 0], [-40, -16], [0, -24], [40, -16], [70, 0], [40, 18], [0, 24], [-40, 18]].map(([u, v]) => G([u, v])), true, 0.8));
  const contacto = G([-80, 34]);
  // panel 2: vista desde el tubo (recorte de la vista supina)
  const dx = 410;
  const A = [dx + 144 + 37, 231 - 37], B = [dx + 144 + 37, 99];
  return svg(
    view("1 · Vista desde los pies · oblicua posterior") +
    table(20, 380, 250, "") + ri(110, 266, 180, 8, "RI · parrilla", 296, 274) +
    `<path d="${wedge}" fill="#d7dbe3" stroke="#8a8f9c"/>` + piel(d) + ring +
    `<circle cx="${f1(hd[0])}" cy="${f1(hd[1])}" r="10" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/><circle cx="${f1(hu[0])}" cy="${f1(hu[1])}" r="10" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>` +
    txt(f1(w2[0]) + 6, 236, "cuña 45°", 11, MUTE) +
    refline(contacto[0], 248, contacto[0] + 120, 248) + arco(contacto[0], 248, 70, -45, 0) + txt(contacto[0] + 76, 224, "45°", 13, BLUE, "start", 700) +
    note(hd[0] - 6, hd[1] + 4, 40, 300, ["cadera abajo"], BO, "start") +
    note(hu[0] + 8, hu[1] - 4, 320, 70, ["cadera arriba"], BO) +
    tube(c[0], c[1], 0, 110) +
    note(c[0] - 4, 104, 150, 60, ["RC ⟂, centrado en la", "cadera que interesa"], RED, "end") +
    panelSep("2 · Vista desde el tubo · centrado", 396) +
    clip("cpJ", 398, 26, 362, 300, `<g transform="translate(${dx} 0)">${supino(0)}${pelvisHuesos()}</g>`) +
    dot(dx + 144, 99) + dot(dx + 144, 231) +
    cross(...A) + cross(...B) +
    `<line x1="${dx + 144}" y1="231" x2="${A[0]}" y2="231" stroke="${BLUE}" stroke-width="1.2"/><line x1="${A[0]}" y1="231" x2="${A[0]}" y2="${A[1] + 12}" stroke="${BLUE}" stroke-width="1.2"/>` +
    `<line x1="${dx + 144}" y1="99" x2="${B[0] - 12}" y2="99" stroke="${BLUE}" stroke-width="1.2"/>` +
    note(dx + 140, 233, 430, 290, ["EIAS"], BLUE, "end") +
    note(A[0] + 10, A[1] + 6, 610, 252, ["Cadera abajo: 5 cm distal", "y 5 cm medial a la EIAS"], RED) +
    note(B[0] + 10, B[1] - 6, 610, 60, ["Cadera arriba: 5 cm", "distal a la EIAS"], RED) +
    txt(410, 314, "RI 24 x 30 vertical, o 35 x 43 horizontal (ambas caderas)", 11, INK)
  );
};

// ---------- Teufel ----------
I["acetabulo-pa-oblicua-axial-teufel"] = () => {
  const { d, G } = bloqueGirado(190, -37);
  const hd = G([58, -6]), hu = G([-58, -6]);
  const ring = hueso(suave([[-70, 0], [-40, 16], [0, 24], [40, 16], [70, 0], [40, -18], [0, -24], [-40, -18]].map(([u, v]) => G([u, v])), true, 0.8));
  const contacto = G([80, 34]);
  const ab = G([0, 34]), es = G([0, -40]);
  // panel 2: zoom lateral, decúbito prono (cabeza a la izquierda)
  const skin = suave([[392, 186], [440, 190], [490, 188], [530, 170], [570, 162], [610, 170], [650, 182], [700, 186], [770, 190]]) + " L770,250 L392,250 Z";
  const ala = hueso(suave([[480, 196], [500, 186], [530, 186], [560, 200], [585, 222], [574, 234], [550, 226], [520, 214], [492, 210]], true, 0.8));
  const fem = hueso(suave([[600, 224], [612, 214], [628, 212], [640, 220], [760, 222], [760, 236], [640, 238], [620, 242], [604, 236]], true, 0.6));
  const tgt = [574, 163];
  const riX = tgt[0] - (262 - tgt[1]) * Math.tan((12 * Math.PI) / 180);
  return svg(
    view("1 · Vista desde los pies · semiprono") +
    table(20, 380, 250, "") + ri(100, 266, 180, 8, "RI 24 x 30 vertical", 286, 274) +
    piel(d) + ring +
    `<circle cx="${f1(hd[0])}" cy="${f1(hd[1])}" r="10" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/><circle cx="${f1(hu[0])}" cy="${f1(hu[1])}" r="10" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>` +
    txt(f1(es[0]) - 10, f1(es[1]) - 8, "espalda", 10.5, MUTE, "middle") + txt(f1(ab[0]) - 70, f1(ab[1]) - 10, "abdomen", 10.5, MUTE, "middle") +
    refline(contacto[0] - 120, 248, contacto[0], 248) + arco(contacto[0], 248, 70, 180, 217) + txt(contacto[0] - 76, 224, "35-40°", 13, BLUE, "end", 700) +
    note(hd[0] + 8, hd[1] + 4, 360, 300, ["lado afectado (abajo)"], BO, "end") +
    txt(30, 60, "Oblicua anterior: cuerpo", 11.5, INK) + txt(30, 74, "girado 35-40°, lado", 11.5, INK) + txt(30, 88, "afectado apoyado", 11.5, INK) +
    panelSep("2 · Vista lateral (detalle) · prono", 388) +
    clip("cpT", 390, 26, 370, 300, table(390, 760, 250, "") + piel(skin) + ala + fem +
      `<circle cx="604" cy="228" r="11" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>`) +
    ri(riX - 60, 266, 120, 8) +
    dot(624, 214, BO) + note(626, 214, 750, 290, ["trocánter mayor"], BO, "end") +
    tube(tgt[0], tgt[1], -12, 110, { angLabel: " " }) + txt(604, 100, "12° cefálico", 13, RED, "start", 700) +
    guion(tgt[0], tgt[1], riX, 264) +
    note(tgt[0] - 4, tgt[1] + 2, 404, 104, ["RC 12° cefálico, 2,5 cm sobre", "el trocánter mayor y ≈5 cm", "lateral al plano medio"], RED, "start") +
    txt(404, 316, "← cabeza", 11, MUTE) + txt(752, 316, "pies →", 11, MUTE, "end")
  );
};

// ---------- caderas pediátricas: niño entero visto desde el tubo ----------
function ninoArriba(rot) {
  const top = [[-200, 150], [-196, 132], [-180, 116], [-150, 106], [-100, 104], [-40, 106], [0, 104], [45, 109], [85, 106], [122, 96], [162, 88], [205, 85], [240, 89], [258, 118], [256, 150]];
  const tr = suave([...top, ...mirrorY(top, CY).reverse()], true, 0.8);
  const brazo = (sg) => {
    const Y = (y) => (sg > 0 ? y : 2 * CY - y);
    return [poly(miembro([[-160, Y(118)], [-130, Y(90)], [-50, Y(84)], [40, Y(84)]], [16, 15, 12, 10], [16, 15, 12, 10])), suave([[34, Y(76)], [58, Y(74)], [70, Y(84)], [58, Y(94)], [34, Y(92)]], true, 0.9)];
  };
  const pi = piernaExt(1, rot), pd = piernaExt(-1, rot);
  return union([tr, ...brazo(1), ...brazo(-1), pi.d, pd.d]) + pi.dedos + pd.dedos + cabezaFrente(-232, CY, 40, -90);
}
const bolsa = (x, y) => `<rect x="${x}" y="${y}" width="60" height="18" rx="8" fill="#d7dbe3" stroke="#8a8f9c"/>`;
I["caderas-pelvis-pediatricas-ap"] = () => {
  const s = 0.62, tx = 196, ty = 64;
  const X = (x) => f1(tx + s * x), Y = (y) => f1(ty + s * y);
  return svg(
    view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
    riTop(X(100), Y(76), 150 * s, 178 * s, "") +
    `<g transform="translate(${tx} ${ty}) scale(${s})">${ninoArriba(15)}${pelvisHuesos({ l5: false })}</g>` +
    bolsa(X(-120), Y(68)) + bolsa(X(-120), Y(244)) +
    coll(X(108), Y(88), 140 * s, 154 * s) +
    refline(X(196), Y(104), X(196), Y(226)) +
    cross(X(196), Y(CY)) +
    note(X(196) + 8, Y(CY) - 6, 380, 46, ["RC ⟂ a la altura de las caderas"], RED) +
    note(X(-90), Y(68), 60, 46, ["Inmovilizar brazos y tronco", "(bolsas de arena, cinta)"], INK) +
    note(X(560), Y(240), 560, 300, ["Piernas extendidas,", "rotación interna 15°"]) +
    `<g transform="translate(${tx} ${ty}) scale(${s})">${rotPies(15, "")}</g>` + txt(X(650), Y(122), "15°", 12, BLUE, "start", 700) + txt(X(650), Y(214), "15°", 12, BLUE, "start", 700) +
    txt(12, 290, "RI horizontal, según el tamaño", 12, INK) + txt(12, 304, "Parrilla si el grosor supera 10 cm", 12, INK) +
    txt(12, 318, "DFRI 100 cm · si llora, exponer en inspiración · protección gonadal sin tapar las caderas", 11, MUTE)
  );
};
I["caderas-pelvis-pediatricas-lateral-rana"] = () => {
  const s = 0.8, P = piesRana(0, { angulo: false, blanco: "centro" });
  const dx = 400;
  return svg(
    view("1 · Vista desde los pies (niño)") +
    `<g transform="translate(190 52) scale(${s})">${P.s}</g>` +
    txt(262, 60, "Caderas y rodillas", 12, INK, "start", 700) + txt(262, 76, "flexionadas, plantas", 12, INK) + txt(262, 92, "juntas, piernas", 12, INK) + txt(262, 108, "abducidas", 12, INK) +
    txt(16, 60, "Fijar con cinta y", 11.5, MUTE) + txt(16, 74, "bolsas de arena", 11.5, MUTE) +
    txt(16, 300, "RI horizontal, según el tamaño · parrilla si > 10 cm", 11.5, INK) +
    panelSep("2 · Vista desde el tubo") +
    clip("cpRP", 392, 26, 368, 300, `<g transform="translate(${dx + 40} 30) scale(${s})">${riTop(110, 79, 172, 172, "")}${ranaArriba(0, { bilateral: true })}</g>`) +
    cross(f1(dx + 40 + 196 * s), f1(30 + 165 * s)) +
    note(f1(dx + 40 + 196 * s) + 8, f1(30 + 165 * s) + 6, 520, 300, ["RC ⟂ a la altura de las caderas"], RED) +
    txt(404, 48, "Inmovilizar brazos y tronco · DFRI 100 cm", 11.5, MUTE) +
    txt(404, 318, "Si llora, exponer en inspiración", 11, MUTE)
  );
};

// ---------- AP de fémur ----------
I["femur-ap"] = () => {
  const rx = 250, rc = [rx + 86, 209];
  return svg(
    view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
    riTop(rx, 140, 172, 140, "") +
    supino(15) + pelvisHuesos({ l5: false }) + femurProx(-1, true) + riBorde(rx, 140, 172, 140) +
    coll(rx + 8, 182, 156, 54) +
    cross(...rc) +
    note(rc[0] + 8, rc[1] - 6, 440, 64, ["RC ⟂ al fémur, a la mitad del RI"], RED) +
    cota(383, 290, rx + 172, 290, "≈5 cm", 403, 306) + `<line x1="383" y1="200" x2="383" y2="294" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    note(380, 212, 470, 252, ["rodilla incluida"], BO) +
    note(190, 206, 150, 252, ["cabeza femoral"], BO, "end") +
    txt(rx - 120, 296, "RI 35 x 43 vertical · parrilla", 12, INK) +
    side(24, 300, "D") + txt(40, 304, "lado afectado", 11, MUTE) +
    note(596, 222, 560, 270, ["Rotación interna:", "≈5° (fémur medio y distal)", "15° si incluye la cadera"]) +
    rotPies(15, "15°", "der") +
    txt(12, 44, "Cadera hacia el cátodo (efecto talón)", 11.5, MUTE) + txt(12, 58, "DFRI 100 cm", 11.5, MUTE)
  );
};

// ---------- lateral de fémur (de la referencia) ----------
function piePerfil(A, legDir, plantar = 0, s = 1) {
  const fDir = legDir - 90 + plantar;
  const T = marco(A, fDir, s);
  const pts = [[11, 0], [22, 5], [40, 10], [56, 13], [66, 15.5], [71, 19], [70.5, 24], [64, 26.5], [52, 26.5], [36, 24.5], [16, 27], [0, 29], [-9, 27], [-13.5, 19], [-13, 9], [-11, 0]];
  return pts.map(T);
}
function piernaPerfil(eje, wl, wr, plantar = 0, s = 1) {
  const { L, R } = miembro(eje, wl, wr);
  const n = eje.length, A = eje[n - 1], legDir = ang(eje[n - 2], A);
  return { L, R, foot: piePerfil(A, legDir, plantar, s) };
}
I["femur-lateral"] = () => {
  const H = [175, 172], K = [295, 103], A = [418, 136];
  const eje = [H, lerp(H, K, 0.5), lerp(H, K, 0.85), K, lerp(K, A, 0.15), lerp(K, A, 0.45), lerp(K, A, 0.85), A];
  const leg = piernaPerfil(eje, [30, 26, 21, 22, 19, 19, 14, 11], [34, 30, 24, 20, 22, 24, 16, 11]);
  const cuerpo = [[0, 128], [60, 124], [112, 126], [140, 134], ...leg.L, ...leg.foot, ...leg.R.slice().reverse(), [178, 214], [140, 222], [90, 220], [40, 215], [0, 213]];
  const H2 = [110, 186], K2 = [322, 214], A2 = [448, 236];
  const eje2 = [H2, lerp(H2, K2, 0.5), lerp(H2, K2, 0.85), K2, lerp(K2, A2, 0.2), lerp(K2, A2, 0.5), lerp(K2, A2, 0.85), A2];
  const g = piernaPerfil(eje2, [24, 24, 21, 21, 19, 19, 14, 11], [22, 26, 23, 20, 22, 23, 16, 11], 18);
  const ghost = [...g.L, ...g.foot, ...g.R.slice().reverse()];
  const F = marco(H, ang(H, K), 1);
  const fem = [[8, -8], [40, -6], [90, -6.5], [116, -8.5], [128, -10], [137, -5], [139, 4], [133, 12], [121, 13.5], [111, 8], [90, 6], [40, 6], [20, 9], [12, 15], [3, 14], [-2, 7]].map(F);
  const M = lerp(H, K, 0.5);
  const pat = F([136, -19]);
  const rot = ang(H, K);
  return svg(
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    `<g transform="rotate(${f1(rot)} ${f1(M[0])} ${f1(M[1])})">${riTop(M[0] - 86, M[1] - 70, 172, 140, "")}</g>` +
    fantasma(suave(ghost) + " Z") +
    piel(suave(cuerpo) + " L0,128 Z") +
    hueso(suave(fem, true, 0.7)) + `<circle cx="${f1(H[0])}" cy="${f1(H[1])}" r="9.5" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>` +
    `<ellipse cx="${f1(pat[0])}" cy="${f1(pat[1])}" rx="5" ry="9" transform="rotate(${f1(rot + 20)} ${f1(pat[0])} ${f1(pat[1])})" fill="${BONE}" stroke="${BO}" stroke-width="1.3"/>` +
    `<g transform="rotate(${f1(rot)} ${f1(M[0])} ${f1(M[1])})">${riBorde(M[0] - 86, M[1] - 70, 172, 140)}${coll(M[0] - 80, M[1] - 26, 160, 52)}</g>` +
    cross(M[0], M[1]) +
    note(M[0] + 8, M[1] - 4, 470, 186, ["RC ⟂ al fémur, a la mitad del RI"], RED) +
    note(F([60, -4])[0], F([60, -4])[1], 120, 84, ["fémur"], BO, "end") +
    note(pat[0] + 4, pat[1] - 6, 340, 40, ["rótula"], BO) +
    arco(K[0], K[1], 34, -30, 15) + txt(K[0] + 26, K[1] - 18, "rodilla ≈45°", 11.5, BLUE, "start", 700) +
    txt(470, 268, "pierna sana llevada hacia atrás", 11, MUTE) + linea("M466,266 L432,252", 1) +
    txt(470, 60, "RI 35 x 43 vertical · parrilla", 12, INK) + txt(470, 76, "fémur alineado con la línea media", 11, MUTE) +
    txt(470, 222, "Incluir rodilla o cadera en un extremo", 11, MUTE) +
    txt(12, 300, "Cadera hacia el cátodo (efecto talón) · DFRI 100 cm", 11.5, MUTE)
  );
};

// ---------- lateral de fémur con haz horizontal ----------
I["femur-lateral-haz-horizontal"] = () => {
  const tgt = [300, 121];
  return svg(
    view("Vista desde arriba · decúbito supino · haz horizontal") +
    `<rect x="300" y="94" width="130" height="50" rx="6" fill="none" stroke="#8a8f9c" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    supino(0) + pelvisHuesos({ l5: false }) + femurProx(1, true) +
    `<rect x="252" y="161" width="180" height="8" fill="${INK}"/>` +
    tube(tgt[0], tgt[1], 0, 76) +
    guion(tgt[0], tgt[1], tgt[0], 160) +
    note(tgt[0] + 8, tgt[1] - 4, 470, 52, ["RC horizontal, ⟂ al fémur,", "al punto medio del RI"], RED) +
    note(432, 165, 470, 238, ["RI vertical entre las piernas, con", "parrilla portátil, sujeto con cinta;", "incluye la rodilla (35 x 43)"], INK) +
    note(430, 100, 600, 112, ["Apoyo debajo de la", "rodilla y la pierna"], MUTE) +
    side(24, 56, "I") + txt(40, 60, "lado lesionado (ejemplo)", 11, MUTE) +
    txt(12, 290, "No mover al paciente del supino:", 11.5, MUTE) + txt(12, 304, "levantar con cuidado la pierna lesionada", 11.5, MUTE) +
    txt(12, 318, "DFRI 100 cm · colimar estrecho a los cuatro lados", 11.5, MUTE)
  );
};

// ---------------- fichas con versiones: un esquema por versión ----------------
const colV = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");
const ranaTxtFin = colV(430, 262, [["RI 24 x 30 horizontal · parrilla · DFRI 100 cm", MUTE, 400, 11], ["Apnea · no hacerla si puede haber fractura", MUTE, 400, 11]]);
I["cadera-lateral-rana-unilateral--v1"] = () => {
  const P = piesRana(190, { izq: "rana", der: "ext", blanco: "cadera" });
  return svg(
    view("Cuello femoral · vista desde los pies") + P.s +
    side(30, 250, "D") + side(350, 250, "I") +
    note(P.tgt[0] - 60, P.tgt[1] - 60, 220, 60, ["Rodilla y cadera", "flexionadas, fémur", "a 45° de la vertical"], INK) +
    note(150, 282, 120, 312, ["RI 24 x 30 horizontal"], INK) +
    colV(430, 60, [["RC perpendicular a la mitad", RED, 700, 12.5], ["del cuello o de la cabeza femoral", INK, 400, 12]]) +
    colV(430, 120, [["Decúbito supino", INK, 700], ["Lado afectado: rodilla y cadera flexionadas,", INK], ["fémur a 45° de abducción de la vertical", INK]]) +
    colV(430, 190, [["Con 20-30° el cuello sale menos acortado", MUTE]]) + ranaTxtFin
  );
};
I["cadera-lateral-rana-unilateral--v2"] = () => {
  // paciente oblicuado 35-45° hacia el lado afectado (derecho, a la izquierda del dibujo); pierna abducida sobre la mesa
  const cx = 210, th = -40, r = (th * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const R0 = ([x, y]) => [cx + (x - cx) * c - (y - 234) * sn, 234 + (x - cx) * sn + (y - 234) * c];
  const cuerpo0 = [[cx - 92, 234], [cx - 80, 206], [cx, 194], [cx + 80, 206], [cx + 92, 234], [cx + 74, 258], [cx, 261], [cx - 74, 258]].map(R0);
  const off = 261 - Math.max(...cuerpo0.map((p) => p[1]));
  const R = (p) => { const q = R0(p); return [q[0], q[1] + off]; };
  const cuerpo = cuerpo0.map(([x, y]) => [x, y + off]);
  const J = R([cx - 60, 234]), Jr = R([cx + 60, 234]);
  const K = [J[0] - 120, 247], A = [J[0] + 6, 252];
  const parts = [suave(cuerpo, true, 0.9), poly(miembro([[J[0] + 4, J[1] + 4], J, K], [22, 22, 15], [22, 22, 15]))];
  const top = piel(poly(miembro([K, lerp(K, A, 0.5), A], [13, 12, 9], [13, 12, 9])), 'opacity=".55"');
  const ox = cx + 60;
  const pOtra = piel(suave([[ox - 12, 234], [ox - 14, 200], [ox - 6, 178], [ox + 6, 178], [ox + 14, 200], [ox + 12, 234], [ox, 246]].map(R), true, 0.9));
  const bones = hueso(poly(miembro([J, lerp(J, K, 0.5), K], [5, 4.5, 8], [5, 4.5, 8]))) + `<circle cx="${f1(J[0])}" cy="${f1(J[1])}" r="10" fill="${BONE}" stroke="${BO}" stroke-width="1.4"/>`;
  const a = cuerpo[7], b = cuerpo[5];
  const ux = (Jr[0] - J[0]) / Math.hypot(Jr[0] - J[0], Jr[1] - J[1]), uy = (Jr[1] - J[1]) / Math.hypot(Jr[0] - J[0], Jr[1] - J[1]);
  const P0 = J;
  return svg(
    view("Cabeza femoral, acetábulo y diáfisis · desde los pies") +
    table(20, 400, 262, "") + ri(J[0] - 100, 278, 200, 8) + union(parts) + pOtra + bones + top +
    refline(P0[0], P0[1], P0[0] + ux * 170, P0[1] + uy * 170) +
    `<line x1="${f1(P0[0])}" y1="${f1(P0[1])}" x2="${f1(P0[0] + 170)}" y2="${f1(P0[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    arco(P0[0], P0[1], 120, -40, 0) + txt(P0[0] + 128, P0[1] - 26, "35-45°", 13, BLUE, "start", 700) +
    tube(J[0], J[1], 0, 150) +
    side(30, 300, "D") + side(380, 300, "I") +
    note(K[0] + 30, K[1] - 18, 40, 130, ["pierna abducida", "hasta la mesa"], INK) +
    colV(430, 60, [["RC perpendicular a la mitad", RED, 700, 12.5], ["del cuello o de la cabeza femoral", INK, 400, 12]]) +
    colV(430, 120, [["Decúbito supino, oblicuado 35-45°", INK, 700], ["hacia el lado afectado", INK, 700], ["Abducir la pierna hasta la mesa, si se puede", INK], ["Cadera y cuello centrados en el RC", INK]]) +
    ranaTxtFin
  );
};

module.exports = I;
