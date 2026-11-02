// Versión anterior (dibujada a mano). Se conserva solo por las figuras pediátricas, que todavía no salen del modelo.
// Esquemas de rodilla, rótula / fosa intercondílea, pierna y extremidad inferior pediátrica.
// Estilo aprobado: contorno continuo color piel + huesos de referencia (adaptado de referencia-tecnicas1-pelvis/pie).
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONEO, table, wall, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, cabezaPerfil, cabezaFrente } = E;

// ---------- helpers (copiados de las referencias) ----------
const f1 = (n) => +n.toFixed(1);
function cr(pts, closed = false) {
  const P = pts, n = P.length;
  const g = (i) => (closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f1(P[0][0])},${f1(P[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + (closed ? " Z" : "");
}
const deg = (a) => (a * Math.PI) / 180;
const unit = (a) => [Math.cos(deg(a)), Math.sin(deg(a))];
const rot = (v, a) => { const c = Math.cos(deg(a)), s = Math.sin(deg(a)); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
const frame = (o, a, b, s) => ([p, q]) => [o[0] + s * (p * a[0] + q * b[0]), o[1] + s * (p * a[1] + q * b[1])];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const ang = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const fantasma = (d) => piel(d, 'opacity=".5"');
const clipR = (id, x, y, w, h, inner) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
const arco = (cx, cy, r, a1, a2, color = BLUE) => {
  const p = (a) => [f1(cx + r * Math.cos(deg(a))), f1(cy + r * Math.sin(deg(a)))];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  return `<path d="M${x1},${y1} A${r},${r} 0 0 ${a2 > a1 ? 1 : 0} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
};
const riBorde = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10 3" opacity=".75"/>`;
const panel2 = (x, title) => `<line x1="${x - 12}" y1="14" x2="${x - 12}" y2="322" stroke="#e2e4ea"/>` +
  `<text x="${x}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
const vlbl = (x, y, t) => `<text x="${x}" y="${y}" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${t.toUpperCase()}</text>`;
const BO = BONEO;
const rayo = (x1, y1, x2, y2, w = 1.4) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${RED}" stroke-width="${w}" stroke-dasharray="3 3"/>`;
const bolsa = (x, y, w = 34, h = 14, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#d9cfb8" stroke="#9c8f72" stroke-width="1.3" transform="rotate(${r} ${x + w / 2} ${y + h / 2})"/>`;
const apoyo = (x, y, w, h, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#d7dbe3" stroke="#8a8f9c" transform="rotate(${r} ${x + w / 2} ${y + h / 2})"/>`;

// ---------- miembro inferior visto de costado (muslo + pierna + pie), de referencia-tecnicas1-pie ----------
// ankle: centro del tobillo. legDir: tobillo→rodilla (grados SVG). footDir: talón→dedos. thighDir: rodilla→cadera.
// sg: 1 o -1 (espejo). s: escala. lt: largo del muslo en unidades locales (760 = se sale del dibujo).
const LL = 330;
function limb(o) {
  const { legDir, footDir, thighDir = legDir, s = 1, sg = 1, flexed = false, lt = 760 } = o;
  const LT = lt;
  const aL = unit(legDir), bL = rot(aL, 90 * sg);
  const ankle = o.ankle || [o.knee[0] - LL * s * aL[0], o.knee[1] - LL * s * aL[1]];
  const aF = unit(footDir), bF = rot(aF, -90 * sg);
  const knee = [ankle[0] + LL * s * aL[0], ankle[1] + LL * s * aL[1]];
  const aT = unit(thighDir), bT = rot(aT, 90 * sg);
  const L = frame(ankle, aL, bL, s), F = frame(ankle, aF, bF, s), T = frame(knee, aT, bT, s);
  const thighPost = [[LT, -46], [LT * 0.55, -46], [70, -42]].concat(flexed ? [] : [[18, -38]]);
  const legPost = (flexed ? [] : [[LL - 12, -38]]).concat([[LL - 60, -44], [LL - 120, -46], [LL - 200, -36], [95, -26], [48, -21], [22, -21]]);
  const foot = [[-26, 8], [-38, -12], [-40, -30], [-30, -42], [-12, -47], [10, -46], [40, -40], [76, -43], [108, -47], [134, -46], [150, -42], [153, -34], [146, -26], [128, -24], [100, -15], [66, 0], [42, 11], [28, 19]];
  const legAnt = [[34, 21], [80, 20], [170, 22], [262, 26], [300, 32], [LL - 10, 36]];
  const thighAnt = [[8, 44], [30, 47], [70, 42], [LT * 0.55, 46], [LT, 46]];
  const pts = [...thighPost.map(T), ...legPost.map(L), ...foot.map(F), ...legAnt.map(L), ...thighAnt.map(T)];
  const d = cr(pts) + " Z";
  const toes = linea(cr([[128, -27], [133, -36], [131, -45]].map(F)), 1.3) + linea(cr([[112, -22], [116, -32], [114, -46]].map(F)), 1.1);
  const H = (pts, M, extra) => hueso(cr(pts.map(M), true), extra);
  const fe = Math.min(LT + 30, LT - 14);
  const B = {
    femur: H([[fe, -14], [90, -14], [40, -26], [14, -32], [3, -20], [4, 8], [16, 22], [40, 12], [90, 11], [fe, 11]], T),
    rotula: H([[44, 33], [30, 39], [10, 37], [5, 31], [18, 27], [34, 27]], T),
    tibia: H([[LL - 6, -26], [LL - 4, -4], [LL - 5, 18], [LL - 22, 24], [LL - 60, 16], [200, 14], [90, 14], [34, 15], [12, 16], [0, 8], [-3, 0], [4, -8], [8, -12], [40, -8], [130, -4], [LL - 70, -6], [LL - 30, -24]], L),
    perone: H([[LL - 24, -24], [LL - 26, -34], [LL - 40, -36], [LL - 50, -30], [LL - 70, -24], [150, -16], [60, -12], [24, -8], [6, -6], [-12, -10], [-8, -18], [14, -18], [60, -20], [150, -23], [LL - 74, -30]], L, `fill-opacity=".7"`),
    calcaneo: H([[-10, -14], [-24, -12], [-34, -22], [-34, -34], [-24, -41], [-6, -41], [14, -37], [28, -32], [28, -24], [10, -20]], F),
    astragalo: H([[-12, 0], [0, 7], [14, 4], [24, -2], [34, -4], [34, -12], [22, -15], [6, -18], [-8, -14]], F),
    tarso: H([[36, -2], [44, -5], [46, -14], [38, -16], [34, -10]], F) + H([[47, -6], [58, -10], [60, -20], [48, -20]], F) + H([[30, -26], [48, -24], [50, -34], [32, -36]], F),
    mt: H([[52, -26], [104, -39], [106, -44], [102, -46], [52, -35]], F) + H([[60, -11], [106, -30], [110, -36], [106, -39], [60, -20]], F),
    falanges: H([[112, -33], [128, -35], [128, -42], [112, -43]], F) + H([[131, -36], [145, -38], [145, -42], [131, -43]], F),
  };
  const pie = B.calcaneo + B.astragalo + B.tarso + B.mt + B.falanges;
  const huesos = B.femur + B.rotula + B.tibia + B.perone + pie;
  return { d, toes, B, pie, huesos, L, F, T, knee, ankle };
}
// pierna completa = piel + huesos + pliegues
const dibujar = (m, op) => (op ? `<g opacity="${op}">${piel(m.d)}</g>` : piel(m.d) + m.huesos + m.toes);
// punto medio de la articulación (en el marco del muslo, cerca del extremo distal del fémur)
const P = (p) => `${f1(p[0])},${f1(p[1])}`;


// ---------- helpers de referencia-tecnicas1-pelvis (pierna de perfil con pie) ----------
function curva(pts, closed = false, t = 1) {
  const n = pts.length, Q = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = "";
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = Q(i - 1), p1 = Q(i), p2 = Q(i + 1), p3 = Q(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t];
    d += ` C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d;
}
const suave = (pts, closed = false, t = 1) => `M${f1(pts[0][0])},${f1(pts[0][1])}` + curva(pts, closed, t) + (closed ? " Z" : "");
function marco(o, a, s = 1) {
  const r = deg(a), c = Math.cos(r), sn = Math.sin(r);
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
function piePerfil(A, legDir, plantar = 0, s = 1) {
  const T = marco(A, legDir - 90 + plantar, s);
  const pts = [[11, 0], [22, 5], [40, 10], [56, 13], [66, 15.5], [71, 19], [70.5, 24], [64, 26.5], [52, 26.5], [36, 24.5], [16, 27], [0, 29], [-9, 27], [-13.5, 19], [-13, 9], [-11, 0]];
  return pts.map(T);
}
function piernaPerfil(eje, wl, wr, plantar = 0, s = 1) {
  const { L, R } = miembro(eje, wl, wr);
  const n = eje.length, A = eje[n - 1], legDir = ang(eje[n - 2], A);
  return { L, R, foot: piePerfil(A, legDir, plantar, s) };
}
// rodilla de perfil vista desde el tubo (decúbito lateral, cara medial hacia el tubo), de "Rodilla|Perfil".
// flex = flexión de la rodilla en grados. Devuelve piezas y puntos.
function rodillaLateralTubo(flex, K = [190, 162], id = "cpRL") {
  const A = [K[0] + 150, K[1]];
  const LTh = Math.max(210, (K[0] + 20) / Math.cos(deg(flex)));
  const P0 = [K[0] - LTh * Math.cos(deg(flex)), K[1] + LTh * Math.sin(deg(flex))];
  const eje = [P0, lerp(P0, K, 0.5), lerp(P0, K, 0.85), K, [K[0] + 30, K[1]], [K[0] + 80, K[1]], A];
  const leg = piernaPerfil(eje, [30, 27, 24, 28, 21, 19, 11], [32, 29, 25, 22, 22, 22, 11], 0, 1.05);
  const cuerpo = [...leg.L, ...leg.foot, ...leg.R.slice().reverse()];
  const G0 = [Math.min(K[0] - 210, -20), K[1] + 124], GK = [K[0] + 10, K[1] + 128], GA = [K[0] + 148, K[1] + 130];
  const g = piernaPerfil([G0, lerp(G0, GK, 0.5), lerp(G0, GK, 0.85), GK, lerp(GK, GA, 0.2), lerp(GK, GA, 0.5), GA], [26, 23, 19, 19, 17, 17, 10], [26, 24, 21, 18, 20, 20, 10], 25, 0.9);
  const ghost = [...g.L, ...g.foot, ...g.R.slice().reverse()];
  const F = marco(K, -flex, 1);
  const fem = [[-150, -8], [-45, -8], [-28, -12], [-14, -14], [-4, -10], [0, -2], [-1, 8], [-6, 15], [-16, 19], [-28, 17], [-40, 9], [-150, 8]].map(F);
  const tib = [[3, -14], [12, -15], [18, -18], [24, -12], [40, -8], [100, -6], [150, -5], [150, 5], [100, 6], [40, 8], [20, 13], [6, 16], [2, 2]].map(([u, v]) => [K[0] + u, K[1] + v]);
  const per = [[16, 8], [24, 8], [28, 13], [40, 13], [150, 11], [150, 16], [40, 18], [24, 19], [16, 15]].map(([u, v]) => [K[0] + u, K[1] + v]);
  const pat = F([-8, -19]);
  const cm = F([-14, 2]);
  const piezas = fantasma(suave(ghost) + " Z") + piel(suave(cuerpo) + " Z") +
    hueso(suave(fem, false, 0.7) + " Z") + hueso(suave(per, true, 0.7)) + hueso(suave(tib, true, 0.7)) +
    `<ellipse cx="${f1(pat[0])}" cy="${f1(pat[1])}" rx="5" ry="10" transform="rotate(-10 ${f1(pat[0])} ${f1(pat[1])})" fill="#ece4d4" stroke="${BO}" stroke-width="1.3"/>`;
  const flexMarca = `<line x1="${K[0]}" y1="${K[1]}" x2="${f1(K[0] + 70 * Math.cos(deg(flex)))}" y2="${f1(K[1] - 70 * Math.sin(deg(flex)))}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 3"/>` +
    arco(K[0], K[1], 56, -flex, 0);
  return { piezas, flexMarca, pat, cm, F, K, ghostAt: GK };
}

const I = {};

// ======================= PIERNA =======================
I["pierna-ap"] = () => {
  const m = limb({ ankle: [600, 206], legDir: 180, footDir: 270, s: 0.95 });
  const top = m.L([LL / 2, 23]);
  const fh = m.L([LL - 30, -40]), mm = m.L([-2, 4]), tb = m.L([170, 4]);
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    table(0, 760, 252) +
    ri(240, 268, 420, 10, "RI 35 x 43 vertical", 668, 278) +
    clipR("cpA", 0, 0, 760, 330, dibujar(m)) +
    etiquetaHueso(tb[0] - 22, tb[1] + 4, "tibia", "end") +
    note(fh[0], fh[1], 230, 300, ["cabeza del peroné"], BO, "end") +
    note(mm[0], mm[1] + 4, 690, 236, ["maléolos"], BO) +
    tube(top[0], top[1] - 2, 0, 140, { anodo: ["cátodo", "ánodo"] }) +
    note(top[0], 110, 380, 62, ["RC perpendicular al RI,", "en la parte media de la pierna"], RED, "end") +
    txt(380, 112, "DFRI mínima 100 cm (hasta 115-125 cm)", 11.5, MUTE, "end") +
    note(240, 274, 300, 304, ["Incluir ≥3 cm más allá de rodilla y tobillo"], INK) +
    txt(16, 52, "Rodilla hacia el cátodo (efecto anódico)", 11.5, INK, "start", 700) +
    txt(16, 68, "Sin rotación de rodilla, pierna ni tobillo", 11.5, MUTE) +
    txt(16, 84, "Sin parrilla", 11.5, MUTE)
  );
};

I["pierna-mediolateral"] = () => {
  const m = limb({ ankle: [610, 150], legDir: 180, footDir: 90, s: 0.88, sg: -1 });
  const g = limb({ knee: [330, 30], legDir: 176, thighDir: 196, footDir: 86, s: 0.8, sg: -1 });
  const mid = m.L([LL / 2, 0]);
  const fh = m.L([LL - 32, -40]);
  const foot = m.F([60, -2]);
  return svg(
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    riTop(258, 92, 400, 150, "") +
    clipR("cpB", 0, 26, 760, 304, dibujar(g, 0.4) + dibujar(m)) +
    txt(560, 44, "pierna sana, por detrás", 11, MUTE) +
    coll(266, 100, 384, 134) + txt(16, 128, "Colimar a los bordes de la piel,", 11, AMB) + txt(16, 142, "con rodilla y tobillo", 11, AMB) +
    note(foot[0] - 4, foot[1] + 30, 600, 300, ["apoyo bajo la parte distal", "del pie, si hace falta"], INK, "end") +
    cross(mid[0], mid[1]) +
    note(mid[0] + 6, mid[1] + 10, 420, 290, ["RC ⟂ en la parte media de la pierna"], RED, "end") +
    note(fh[0], fh[1], 226, 214, ["cabeza del peroné"], BO, "end") +
    etiquetaHueso(m.L([210, 8])[0], m.L([210, 8])[1] + 4, "tibia", "middle") +
    note(262, 236, 160, 286, ["Rodilla y tobillo a 3-5 cm", "de los extremos del RI"], INK, "end") +
    txt(16, 60, "Pie, tobillo y rodilla en lateral verdadera", 11.5, BLUE, "start", 700) +
    txt(16, 76, "Rodilla hacia el cátodo · sin parrilla", 11.5, MUTE) +
    txt(16, 92, "DFRI mínima 100 cm (hasta 115-125 cm)", 11.5, MUTE) +
    txt(16, 108, "RI 35 x 43 vertical", 11.5, INK, "start", 700)
  );
};

// ======================= RODILLA =======================
I["rodilla-ap"] = () => {
  const cuerpo = [[0, 170], [80, 173], [160, 179], [240, 187], [288, 196], [306, 190], [326, 187], [344, 192], [356, 201], [376, 206], [440, 209], [500, 212], [530, 213],
    [538, 204], [548, 186], [556, 166], [561, 148], [563, 136], [567, 129], [574, 127], [580, 131], [583, 141], [584, 160], [581, 190], [583, 222], [580, 240], [570, 250], [552, 249], [536, 244], [510, 244],
    [470, 249], [420, 251], [300, 251], [200, 251], [0, 251]];
  const fem = [[0, 196], [270, 202], [298, 199], [318, 203], [330, 213], [334, 226], [330, 240], [318, 247], [298, 246], [272, 238], [0, 232]];
  const tib = [[340, 205], [352, 207], [362, 214], [400, 218], [470, 220], [530, 220], [530, 234], [470, 235], [400, 236], [364, 240], [348, 246], [338, 240], [336, 222]];
  const per = [[350, 239], [360, 237], [366, 242], [380, 243], [470, 242], [528, 240], [528, 246], [470, 248], [380, 248], [362, 249], [350, 246]];
  // RC: 1,25 cm distal al vértice de la rótula (vértice en x≈338)
  const X = 349, Y = 196;
  const alt = (a, lbl, ly, anchor) => {
    const L = 110, dx = Math.sin(deg(a)), dy = Math.cos(deg(a));
    return rayo(X - L * dx, Y - L * dy, X, Y, 1.3) + txt(f1(X - 70 * dx + (a < 0 ? 8 : -8)), f1(Y - 70 * dy) + ly, lbl, 11, RED, anchor, 700);
  };
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    table(20, 600, 252) +
    ri(272, 268, 150, 10, "RI 24 x 30 vertical", 432, 278) +
    piel(cr(cuerpo) + " L0,170 Z") +
    hueso(cr(fem) + " Z") + hueso(cr(per, true)) + hueso(cr(tib, true)) +
    `<ellipse cx="325" cy="196" rx="17" ry="6" transform="rotate(8 325 196)" fill="#ece4d4" stroke="${BO}" stroke-width="1.3"/>` +
    dot(338, 199) +
    alt(-5, "3-5° cefálico", 0, "start") + alt(5, "3-5° caudal", 0, "end") +
    tube(X, Y - 2, 0, 150) +
    rayo(X, 200, X, 266) +
    note(352, 104, 470, 50, ["RC 1,25 cm distal al vértice", "de la rótula, paralelo a la", "meseta tibial"], RED) +
    note(334, 199, 236, 150, ["vértice de la rótula"], BLUE, "end") +
    etiquetaHueso(150, 222, "fémur") + etiquetaHueso(430, 231, "tibia") +
    txt(16, 52, "← cabeza", 11, MUTE) + txt(596, 266, "pies →", 11, MUTE, "end") +
    // tabla de ángulos según la distancia EIAS - mesa
    `<rect x="606" y="112" width="148" height="132" rx="6" fill="#f7f8fa" stroke="#d5d8e0"/>` +
    txt(614, 130, "EIAS → mesa", 11.5, INK, "start", 700) +
    txt(614, 152, "< 19 cm", 11.5, INK) + txt(746, 152, "3-5° caudal", 11.5, RED, "end", 700) +
    txt(614, 172, "19-24 cm", 11.5, INK) + txt(746, 172, "0° (⟂ RI)", 11.5, RED, "end", 700) +
    txt(614, 192, "> 24 cm", 11.5, INK) + txt(746, 192, "3-5° cefálico", 11.5, RED, "end", 700) +
    txt(614, 214, "cefálico = hacia", 10.5, MUTE) + txt(614, 228, "la cabeza", 10.5, MUTE) +
    txt(20, 300, "Pierna centrada en la mesa; si hace falta,", 11.5, MUTE) +
    txt(20, 314, "rotarla un poco hacia adentro (AP verdadera)", 11.5, MUTE) +
    txt(432, 300, "DFRI 100 cm · parrilla si el", 11.5, MUTE) + txt(432, 314, "grosor supera 10 cm", 11.5, MUTE)
  );
};

I["rodilla-lateral"] = () => {
  const r = rodillaLateralTubo(25);
  const { K, cm, pat } = r;
  const RCp = [cm[0] + 9, cm[1] + 1];
  const p1 = clipR("cpRL1", 0, 26, 388, 304, r.piezas + riBorde(RCp[0] - 60, RCp[1] - 48, 120, 96));
  // panel 2: desde el costado de la mesa (cara medial arriba), de la referencia
  const piel2 = [[395, 190], [450, 193], [520, 199], [566, 204], [584, 202], [600, 206], [614, 212], [640, 214], [690, 213], [745, 216]];
  const fem2 = [[395, 222], [550, 222], [568, 214], [586, 210], [596, 216], [598, 230], [598, 238], [596, 250], [586, 255], [568, 252], [550, 244], [395, 244]];
  const tib2 = [[604, 213], [620, 214], [632, 220], [650, 222], [745, 223], [745, 241], [650, 241], [634, 244], [620, 252], [604, 252], [602, 232]];
  const per2 = [[624, 248], [636, 246], [644, 250], [660, 250], [745, 249], [745, 255], [660, 256], [644, 258], [626, 257]];
  const p2 = clipR("cpRL2", 404, 26, 336, 236,
    piel(suave(piel2, false) + " L745,261 L395,261 Z") +
    hueso(suave(fem2, false, 0.7) + " Z") + hueso(suave(per2, false, 0.7) + " Z") + hueso(suave(tib2, false, 0.7) + " Z"));
  return svg(
    view("1 · Vista desde el tubo · decúbito lateral") +
    `<g transform="translate(${f1(RCp[0] - 60)} ${f1(RCp[1] - 48)})">${riTop(0, 0, 120, 96, "")}</g>` +
    p1 + r.flexMarca + txt(K[0] + 64, K[1] - 34, "flexión 20-30°", 11.5, BLUE, "start", 700) +
    dot(cm[0], cm[1], BO) +
    cross(RCp[0], RCp[1]) +
    note(cm[0] - 2, cm[1] - 4, 110, 70, ["epicóndilo medial"], BO, "end") +
    note(pat[0] - 2, pat[1] - 6, 150, 46, ["rótula"], BO, "end") +
    etiquetaHueso(K[0] + 70, K[1] + 3, "tibia") +
    txt(RCp[0] - 60, RCp[1] + 64, "RI 24 x 30 vertical", 12, INK) +
    note(K[0] + 146, K[1] + 12, 236, 250, ["apoyo bajo tobillo y pie,", "si hace falta"], INK) +
    txt(16, 324, "pierna sana por detrás", 11, MUTE) +
    panel2(404, "2 · Vista desde el costado de la mesa") +
    table(404, 740, 262, "") + p2 +
    dot(588, 207, BO) + txt(578, 186, "epicóndilo medial", 10.5, BO, "end") +
    etiquetaHueso(470, 238, "fémur") + etiquetaHueso(690, 237, "tibia") +
    ri(540, 278, 120, 8, "") +
    txt(424, 300, "← cabeza", 11, MUTE) + txt(736, 300, "pie →", 11, MUTE, "end") +
    tube(600, 232, -6, 160, { angLabel: "\u200b" }) + txt(624, 176, "5-7°", 13, RED, "start", 700) + txt(666, 106, "cefálico", 12, RED, "start", 700) +
    note(596, 200, 560, 100, ["RC 5-7° cefálico,", "2,5 cm distal al", "epicóndilo medial"], RED, "end") +
    txt(404, 318, "DFRI 100 cm · parrilla si el grosor supera 10 cm", 11.5, MUTE)
  );
};

I["fosa-rotula-lateral-rotula"] = () => {
  const r = rodillaLateralTubo(8, [300, 150]);
  const { K, pat } = r;
  const fp = r.F([-6, -12]); // espacio femororrotuliano
  return svg(
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    `<g transform="translate(${f1(fp[0] - 70)} ${f1(fp[1] - 56)})">${riTop(0, 0, 140, 112, "")}</g>` +
    clipR("cpLR", 0, 26, 760, 304, r.piezas + riBorde(fp[0] - 70, fp[1] - 56, 140, 112) + coll(fp[0] - 56, fp[1] - 44, 112, 88)) +
    r.flexMarca + txt(K[0] + 64, K[1] - 22, "flexión de solo 5-10°", 11.5, BLUE, "start", 700) +
    cross(fp[0], fp[1]) +
    note(fp[0] + 8, fp[1] - 10, 470, 64, ["RC perpendicular al RI, en la", "parte media del espacio", "articular femororrotuliano"], RED) +
    note(pat[0] - 2, pat[1] - 8, 190, 60, ["rótula"], BO, "end") +
    etiquetaHueso(K[0] + 80, K[1] + 3, "tibia") + etiquetaHueso(K[0] - 120, K[1] + 26, "fémur") +
    txt(fp[0] - 70, fp[1] + 74, "RI 18 x 24 vertical", 12, INK) +
    txt(16, 310, "pierna sana hacia atrás", 11, MUTE) +
    txt(470, 150, "No flexionar más: puede", 11.5, MUTE) + txt(470, 166, "separar fragmentos si hay fractura", 11.5, MUTE) +
    txt(470, 200, "DFRI 100 cm", 11.5, MUTE) + txt(470, 216, "Sin parrilla (con parrilla en", 11.5, MUTE) + txt(470, 232, "pacientes de contextura grande)", 11.5, MUTE)
  );
};

// ---------- de pie, rodillas en carga ----------
const escalon = (x, y, w, h = 14) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#d7dbe3" stroke="#8a8f9c"/>`;
const piso = (x1, x2, y) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#8a8f9c" stroke-width="2"/>`;
const bucky = (x, y1, y2, lbl = "Bucky vertical") => `<rect x="${x}" y="${y1}" width="12" height="${y2 - y1}" fill="#cfd3dc"/><rect x="${x + (x > 380 ? -6 : 12)}" y="${y1 + 30}" width="6" height="${y2 - y1 - 60}" fill="${INK}"/>`;
// articulación de la rodilla (≈ 1,25 cm distal al vértice de la rótula), en el marco de la pierna
const artic = (m) => m.L([LL - 10, 6]);

I["rodilla-pa-axial-bilateral-rosenberg"] = () => {
  const s = 0.5;
  const m = limb({ ankle: [330, 300 - 47 * 0.5], legDir: 247.5, thighDir: 292.5, footDir: 180, s, sg: -1 });
  const k = artic(m);
  const ax = m.knee;
  return svg(
    view("Vista lateral · de pie, de frente al bucky (PA)") +
    bucky(200, 34, 236) + txt(150, 252, "RI 35 x 43 horizontal", 11, INK) +
    piso(60, 600, 300) +
    clipR("cpRo", 0, 26, 760, 274, dibujar(m)) +
    // flexión 45°: prolongación del muslo vs pierna
    `<line x1="${P(ax).split(",")[0]}" y1="${f1(ax[1])}" x2="${f1(ax[0] - 70 * Math.cos(deg(292.5)))}" y2="${f1(ax[1] - 70 * Math.sin(deg(292.5)))}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 3"/>` +
    arco(ax[0], ax[1], 52, 112.5, 67.5) + txt(f1(ax[0] + 56), f1(ax[1] + 70), "flexión 45°", 12, BLUE, "start", 700) +
    beam(k[0], k[1], 170, 200, { ref: 180, angLabel: "10°" }) +
    note(k[0] + 50, k[1] - 9, 540, 200, ["RC 10° caudal (hacia los pies)", "a la mitad de las articulaciones,", "1,25 cm por debajo del", "vértice de la rótula"], RED) +
    note(m.T([20, 40])[0], m.T([20, 40])[1], 180, 80, ["rótula"], BO, "end") +
    txt(540, 276, "Peso repartido por igual entre los dos pies", 11.5, MUTE) +
    txt(540, 292, "DFRI 100 cm · parrilla", 11.5, MUTE)
  );
};

// ======================= RÓTULA Y FOSA INTERCONDÍLEA =======================
I["fosa-rotula-pa-rotula"] = () => {
  const sc = 0.9;
  const m = limb({ ankle: [600, 216], legDir: 180, footDir: 12, s: sc, sg: -1 });
  const pc = m.T([22, 33]); // centro de la rótula
  return svg(
    view("Vista lateral · decúbito prono, pierna extendida") +
    table(0, 640, 252) +
    ri(pc[0] - 60, 268, 120, 10, "RI 18 x 24 vertical", pc[0] + 68, 278) +
    clipR("cpPR", 0, 0, 760, 252, dibujar(m)) +
    tube(pc[0], m.T([22, -44])[1] - 4, 0, 118) +
    rayo(pc[0], pc[1], pc[0], 266) +
    dot(pc[0], pc[1], RED) +
    note(pc[0] + 2, 120, 420, 62, ["RC perpendicular al RI, en el centro", "de la rótula (a la altura del", "pliegue poplíteo medio)"], RED) +
    note(pc[0] - 6, pc[1] + 2, 230, 306, ["rótula (hacia la mesa)"], BO, "end") +
    etiquetaHueso(120, m.T([200, 0])[1] + 4, "fémur") + etiquetaHueso(470, m.L([150, 0])[1] + 4, "tibia") +
    txt(16, 52, "← cabeza", 11, MUTE) +
    txt(16, 84, "Rotar la cara anterior de la rodilla", 11.5, INK) + txt(16, 100, "~5° hacia adentro: línea entre", 11.5, INK) + txt(16, 116, "epicóndilos paralela al RI", 11.5, INK) +
    txt(420, 140, "Si duele, almohadilla bajo muslo y", 11.5, MUTE) + txt(420, 156, "pierna para que la rótula no apoye", 11.5, MUTE) +
    txt(470, 316, "DFRI 100 cm · parrilla", 11.5, MUTE)
  );
};

// ---------- oblicuas: corte de la rodilla visto desde los pies ----------
function corteRodilla(cx, cy, r, ghost = false) {
  const R = (pts) => pts.map(([x, y]) => { const v = rot([x, y], r); return [cx + v[0], cy + v[1]]; });
  const skin = [[0, -44], [26, -40], [46, -22], [52, 2], [46, 26], [24, 40], [0, 42], [-24, 40], [-46, 26], [-52, 2], [-46, -22], [-26, -40]];
  if (ghost) return `<path d="${cr(R(skin), true)}" fill="none" stroke="${SKO}" stroke-width="1.4" stroke-dasharray="5 4" opacity=".7"/>`;
  const cond = [[0, -18], [18, -22], [32, -10], [34, 8], [26, 24], [12, 22], [4, 10], [0, 14], [-4, 10], [-12, 22], [-26, 24], [-34, 8], [-32, -10], [-18, -22]];
  const pat = [[-14, -32], [0, -38], [14, -32], [10, -27], [0, -25], [-10, -27]];
  return piel(cr(R(skin), true)) + hueso(cr(R(cond), true)) + hueso(cr(R(pat), true));
}
function oblicuaPanel(x0, r, titulo, giro) {
  const cx = x0 + 190, cy = 252 - 44, ant = rot([0, -1], r);
  const tip = [cx + 92 * ant[0], cy + 92 * ant[1]];
  const sideL = r > 0 ? "lateral" : "lateral", sideR = "medial";
  return vlbl(x0 + 12, 20, titulo) +
    table(x0 + 30, x0 + 350, 252, "") + ri(cx - 70, 266, 140, 8, "") +
    corteRodilla(cx, cy, 0, true) + corteRodilla(cx, cy, r) +
    refline(cx, cy, cx, cy - 92) + refline(cx, cy, tip[0], tip[1]) +
    arco(cx, cy, 70, -90, -90 + r) + txt(f1(cx + (r > 0 ? 30 : -30)), f1(cy - 82), "45°", 13, BLUE, "middle", 700) +
    tube(cx, cy - 2, 0, 140) + dot(cx, cy, RED) +
    txt(cx - 62, cy + 6, "lateral", 11, MUTE, "end") + txt(cx + 62, cy + 6, "medial", 11, MUTE) +
    txt(x0 + 30, 290, giro, 12, INK, "start", 700) +
    txt(x0 + 30, 306, "rodilla, tobillo y pie giran juntos", 11.5, MUTE);
}
I["fosa-rotula-tangencial-hobbs"] = () => {
  const s = 0.45, kn = [340, 184];
  const m = limb({ knee: kn, legDir: -40, thighDir: 180, footDir: 0, s, lt: 330 });
  const hip = m.T([330, 0]);
  const h = cabezaPerfil(198, 64, { s: 0.28, rot: 90 });
  const yb = hip[1];
  const tronco = h.d + ` C${P([216, 112])} ${P([224, 118])} ${P([232, 128])} C${P([240, 140])} ${P([242, 160])} ${P([240, yb - 22])} C${P([240, yb - 10])} ${P([248, yb - 18])} ${P([262, yb - 18])} L${P([262, yb + 18])} C${P([230, yb + 22])} ${P([196, yb + 22])} ${P([182, yb + 14])} C${P([170, yb + 4])} ${P([170, 150])} ${P([172, 120])} C${P([174, 100])} ${P([180, 84])} ${P([188, 74])} Z`;
  const t = m.T([12, 32]);
  return svg(
    view("Vista lateral · sentado, pies debajo de la silla") +
    `<rect x="150" y="${f1(hip[1] + 20)}" width="150" height="10" fill="#cfd3dc"/><rect x="156" y="${f1(hip[1] + 30)}" width="8" height="${f1(300 - hip[1] - 30)}" fill="#cfd3dc"/><rect x="286" y="${f1(hip[1] + 30)}" width="8" height="${f1(300 - hip[1] - 30)}" fill="#cfd3dc"/>` +
    piso(100, 560, 300) +
    clipR("cpHo", 0, 26, 760, 274, dibujar(m)) +
    piel(tronco) + h.cara +
    apoyo(t[0] - 28, 236, 70, 64) + txt(t[0] + 48, 280, "banquito", 11, MUTE) +
    ri(t[0] - 34, 226, 82, 10, "") +
    tube(t[0], t[1], 0, 120) + rayo(t[0], t[1], t[0], 226) +
    note(t[0] + 2, 120, 470, 52, ["RC perpendicular al RI, tangencial", "a la articulación femororrotuliana,", "a mitad de camino entre ambas"], RED) +
    note(t[0] + 44, 231, 520, 200, ["RI 35 x 43 horizontal", "(18 x 24 si es unilateral)"], INK) +
    note(m.T([20, 40])[0], m.T([20, 40])[1], 470, 150, ["rótula"], BO) +
    txt(520, 260, "DFRI 120-130 cm", 11.5, MUTE) + txt(520, 276, "Sin parrilla", 11.5, MUTE)
  );
};

// ======================= PEDIÁTRICA =======================
// niño en decúbito supino visto desde el tubo, cabeza a la izquierda; pierna derecha abajo (afectada)
function nino(rana = false) {
  const der = rana ? [[250, 186, 312, 246, 32], [312, 246, 370, 200, 24], [370, 200, 384, 188, 16]] : [[250, 186, 360, 188, 32], [360, 188, 470, 190, 24], [470, 190, 486, 190, 16]];
  const parts = [[160, 165, 240, 165, 86], [124, 165, 150, 165, 26], [252, 145, 360, 142, 32], [360, 142, 470, 140, 24], [470, 140, 486, 140, 16], ...der,
    [158, 112, 238, 108, 18], [158, 218, 238, 222, 18]];
  return E.body(parts) + cabezaFrente(96, 165, 30, -90);
}
const plomo = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#7d8494" fill-opacity=".85" stroke="#4a4f5c"/>`;
I["ped-ext-inf-ap"] = () => svg(
  view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
  riTop(218, 156, 290, 62, "") +
  nino(false) +
  hueso(cr([[262, 182], [350, 184], [350, 192], [262, 192]], true)) + hueso(cr([[368, 184], [462, 186], [462, 192], [368, 192]], true)) +
  plomo(222, 128, 36, 74) +
  bolsa(176, 92) + bolsa(176, 224) + bolsa(392, 120, 44, 14) +
  coll(226, 164, 274, 46) + riBorde(218, 156, 290, 62) +
  cross(366, 188) +
  note(374, 196, 470, 290, ["RC ⟂ en la parte media de la extremidad", "(parte media del RI)"], RED) +
  note(240, 132, 280, 54, ["protección plomada sobre la pelvis"], INK) +
  note(436, 124, 520, 96, ["bolsas de arena: brazos", "y pierna sana"], INK) +
  txt(218, 238, "RI según el tamaño", 11, INK) +
  txt(12, 290, "Toda la extremidad incluida.", 11.5, MUTE) + txt(12, 306, "Puede hacer falta otro RI para", 11.5, MUTE) + txt(12, 322, "la pelvis o el fémur proximal.", 11.5, MUTE) +
  txt(560, 160, "DFRI 100 cm", 11.5, MUTE) + txt(560, 176, "Sin parrilla", 11.5, MUTE) +
  txt(560, 200, "Padres solo si hace falta,", 11.5, MUTE) + txt(560, 216, "con guantes y delantal plomados", 11.5, MUTE)
);

I["ped-ext-inf-lateral"] = () => svg(
  view("Vista desde el tubo · semidecúbito supino, pata de rana") +
  `<g transform="rotate(10 318 222)">${riTop(240, 172, 160, 96, "")}</g>` +
  nino(true) +
  hueso(cr([[256, 190], [306, 240], [312, 232], [262, 184]], true)) + hueso(cr([[318, 238], [366, 200], [362, 194], [314, 232]], true)) +
  plomo(222, 128, 36, 74) +
  bolsa(176, 92) + bolsa(176, 224) + bolsa(392, 120, 44, 14) +
  `<rect x="324" y="210" width="12" height="40" rx="2" fill="#fff" fill-opacity=".7" stroke="${MUTE}" stroke-dasharray="3 2" transform="rotate(-40 330 230)"/>` +
  `<g transform="rotate(10 318 222)">${coll(248, 180, 144, 80)}${riBorde(240, 172, 160, 96)}</g>` +
  cross(312, 228) +
  note(320, 234, 470, 290, ["RC ⟂ en la parte media de la extremidad"], RED) +
  note(240, 132, 280, 54, ["protección plomada sobre la pelvis"], INK) +
  note(436, 124, 520, 96, ["bolsas de arena: brazos", "y pierna sana"], INK) +
  note(342, 222, 470, 200, ["cinta o banda de compresión"], INK) +
  txt(470, 222, "Abducción hasta lateral (rana).", 11.5, INK, "start", 700) +
  txt(470, 238, "No si hay traumatismo o", 11.5, RED) + txt(470, 254, "enfermedad de la cadera", 11.5, RED) +
  txt(12, 290, "RI según el tamaño · DFRI 100 cm", 11.5, MUTE) + txt(12, 306, "Sin parrilla", 11.5, MUTE)
);

// ======================= VERSIONES (un esquema por posición; ver datos/bontrager/versiones.js) =======================
const col = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");
const g = (tr, inner) => `<g transform="${tr}">${inner}</g>`;

// ---- AP oblicua de rodilla ----
const oblTxt = (interna) =>
  note(190, 150, 430, 60, ["RC perpendicular al RI, 1,25 cm", "por debajo de la rótula (mitad", "del espacio articular)"], RED) +
  col(430, 130, [[`Rotar 45° hacia ${interna ? "adentro" : "afuera"} toda la`, INK, 700, 12.5], [interna ? "extremidad (rodilla, tobillo y pie)" : "extremidad", INK, 700, 12.5]]) +
  col(430, 180, [["Semidecúbito supino, pierna extendida", INK], ["y centrada en el RC y en la línea", INK], ["media de la mesa", INK]]) +
  col(430, 240, [[interna ? "Muestra la cabeza y el cuello del peroné" : "Muestra los cóndilos mediales del", MUTE, 400, 11], [interna ? "sin superposición" : "fémur y la tibia de perfil", MUTE, 400, 11]]) +
  col(430, 290, [["RI 24 x 30 vertical · DFRI 100 cm", MUTE, 400, 11], ["Parrilla si el grosor supera 10 cm", MUTE, 400, 11]]) +
  txt(12, 44, "Rodilla derecha, vista desde los pies", 11, MUTE) +
  txt(12, 324, "punteado: rodilla sin rotar · línea azul: frente de la rodilla (rótula)", 10.5, MUTE);
I["rodilla-ap-oblicuas--v1"] = () => svg(oblicuaPanel(0, 45, "Oblicua medial (interna) · desde los pies", "Rotación interna 45°").replace(/<text[^>]*>rodilla, tobillo y pie giran juntos<\/text>/, "") + oblTxt(true));
I["rodilla-ap-oblicuas--v2"] = () => svg(oblicuaPanel(0, -45, "Oblicua lateral (externa) · desde los pies", "Rotación externa 45°").replace(/<text[^>]*>rodilla, tobillo y pie giran juntos<\/text>/, "") + oblTxt(false));

// ---- AP o PA bilateral de rodillas en carga ----
I["rodilla-ap-pa-bilateral-carga--v1"] = () => {
  const s = 0.42;
  const a = limb({ ankle: [126, 280], legDir: 270, footDir: 0, s });
  const ka = artic(a);
  return svg(
    view("AP · vista lateral, de pie") +
    bucky(80, 34, 244) + txt(12, 262, "RI 35 x 43", 11, INK) + txt(12, 276, "horizontal", 11, INK) +
    escalon(60, 291, 170) + txt(240, 302, "escalón, si hace falta", 11, MUTE) +
    clipR("cpC1", 0, 26, 378, 264, dibujar(a)) +
    beam(ka[0], ka[1], 180, 170, { ref: 180 }) +
    rayo(ka[0], ka[1], 92, ka[1]) +
    note(ka[0] + 70, ka[1], 430, 60, ["RC horizontal, ⟂ al RI (contextura", "media), en el punto medio entre las", "rodillas, 1,25 cm distal al vértice", "de las rótulas"], RED) +
    col(430, 150, [["De pie, de espaldas al bucky, subido a un", INK, 700], ["escalón si hace falta para usar un rayo", INK, 700], ["horizontal", INK, 700]]) +
    col(430, 210, [["Pies rectos hacia adelante, rodillas", INK], ["extendidas, peso repartido por igual", INK], ["Se sostiene de los agarraderos de la mesa", INK]]) +
    col(430, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};
I["rodilla-ap-pa-bilateral-carga--v2"] = () => {
  const s = 0.42;
  const b = limb({ knee: [668, 140], legDir: 280, thighDir: 260, footDir: 0, s });
  const kb = artic(b), dx = -340;
  return svg(
    view("PA (alternativa) · de frente al bucky") +
    g(`translate(${dx} 0)`,
      bucky(700, 34, 230) + piso(404, 756, 298) +
      clipR("cpC2", 392, 26, 368, 272, dibujar(b)) +
      beam(kb[0], kb[1], 10, 190, { horizontal: true, angLabel: "10°" })) +
    txt(370, 250, "RI 35 x 43 horizontal", 11, INK, "end") +
    note(kb[0] + dx - 100, kb[1] - 17, 470, 60, ["RC 10° caudal, en el punto medio", "entre las rodillas, 1,25 cm distal", "al vértice de las rótulas"], RED) +
    col(470, 140, [["Mira hacia la mesa o el soporte", INK, 700], ["del RI, con las rodillas apoyadas", INK, 700], ["en él y flexionadas unos 20°", INK, 700]]) +
    col(470, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};

// ---- Fosa intercondílea: Camp Coventry / Holmblad ----
I["fosa-rotula-tunel--v1"] = () => {
  const s = 0.55;
  const a = limb({ knee: [150, 252 - 40 * s], legDir: 135, thighDir: 180, footDir: -15, s, sg: -1 });
  const ka = a.L([LL - 6, 0]);
  const ank = a.ankle;
  return svg(
    view("Camp Coventry · decúbito prono") +
    table(0, 400, 252, "") +
    ri(ka[0] - 44, 268, 88, 8, "RI 18 x 24", ka[0] + 50, 276) +
    apoyo(ank[0] - 22, ank[1] + 14, 44, 252 - ank[1] - 14) +
    note(ank[0] + 22, 230, 290, 300, ["apoyo grande", "bajo el tobillo"], INK) +
    clipR("cpT1", 0, 26, 400, 226, dibujar(a)) +
    tube(ka[0], ka[1], 45, 150, { angLabel: "40-50°" }) +
    `<line x1="${f1(ka[0])}" y1="${f1(ka[1])}" x2="${f1(ka[0] + 30)}" y2="${f1(ka[1] + 30)}" stroke="${RED}" stroke-width="1.4" stroke-dasharray="3 3"/>` +
    txt(16, 44, "← cabeza", 11, MUTE) +
    arco(a.knee[0], a.knee[1], 46, -45, 0) + `<line x1="${f1(a.knee[0])}" y1="${f1(a.knee[1])}" x2="${f1(a.knee[0] + 60)}" y2="${f1(a.knee[1])}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 3"/>` +
    txt(f1(a.knee[0] + 52), f1(a.knee[1] - 8), "flexión 40-50°", 11.5, BLUE, "start", 700) +
    col(440, 70, [["RC 40-50° caudal (⟂ a la pierna),", RED, 700, 12], ["centrado en la rodilla; sale por el", INK], ["borde distal de la rótula", INK]]) +
    col(440, 140, [["Decúbito prono, rodilla flexionada", INK, 700], ["40-50°, con un apoyo grande", INK, 700], ["debajo del tobillo", INK, 700]]) +
    col(440, 200, [["Rodilla centrada en el RC; RI centrado", INK], ["en el RC proyectado", INK]]) +
    col(440, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};
I["fosa-rotula-tunel--v2"] = () => {
  const s = 0.55;
  const b = limb({ knee: [520, 252 - 40 * s], legDir: 180, thighDir: 245, footDir: 4, s, sg: -1, flexed: true });
  const kb = b.L([LL - 30, -24]), dx = -340;
  return svg(
    view("Holmblad · arrodillado") +
    g(`translate(${dx} 0)`,
      table(380, 760, 252, "") +
      ri(kb[0] - 44, 268, 88, 8, "RI 18 x 24", kb[0] + 50, 276) +
      clipR("cpT2", 380, 26, 380, 226, dibujar(b)) +
      tube(kb[0], kb[1] - 4, 0, 165) +
      refline(b.knee[0], b.knee[1], b.knee[0], b.knee[1] - 120) +
      arco(b.knee[0], b.knee[1], 90, 245, 270) + txt(f1(b.knee[0] - 84), f1(b.knee[1] - 96), "20-30°", 12, BLUE, "end", 700)) +
    note(kb[0] + dx + 2, 150, 440, 70, ["RC ⟂ a la pierna, en el", "pliegue poplíteo medio"], RED) +
    col(440, 140, [["Arrodillado sobre la mesa o", INK, 700], ["parcialmente de pie", INK, 700], ["En la figura se inclina hacia", INK], ["adelante 20-30°", INK]]) +
    col(440, 220, [["Rodilla centrada en el RC; RI centrado", INK], ["en el RC proyectado", INK]]) +
    col(440, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};

// ---- Axial tangencial de rótula: Settegast / Hughston ----
const settTxt = (y) => col(440, y, [["El paciente sostiene la pierna con una", MUTE, 400, 11], ["gasa larga o cinta · DFRI 100-120 cm", MUTE, 400, 11]]);
I["fosa-rotula-axial-settegast-hughston--v1"] = () => {
  const s = 0.5;
  const a = limb({ knee: [180, 252 - 42 * s], legDir: 90, thighDir: 180, footDir: 276, s, sg: -1 });
  const pa = a.T([14, 30]);
  return svg(
    view("Settegast · decúbito prono") +
    table(0, 400, 252, "") +
    clipR("cpS1", 0, 26, 400, 226, dibujar(a)) +
    tube(pa[0], pa[1], -17.5, 200, { angLabel: "15-20°" }) +
    arco(a.knee[0], a.knee[1], 30, -90, 0) + txt(f1(a.knee[0] - 30), f1(a.knee[1] - 34), "90°", 12, BLUE, "end", 700) +
    txt(16, 44, "← cabeza", 11, MUTE) +
    col(440, 70, [["RC 15-20° cefálico respecto del eje", RED, 700, 12], ["longitudinal de la pierna, en la", INK], ["mitad del espacio femororrotuliano", INK]]) +
    col(440, 140, [["Decúbito prono, rodilla", INK, 700, 12.5], ["flexionada 90°", INK, 700, 12.5]]) +
    settTxt(290)
  );
};
I["fosa-rotula-axial-settegast-hughston--v2"] = () => {
  const s = 0.5;
  const b = limb({ knee: [480, 252 - 42 * s], legDir: 125, thighDir: 180, footDir: 340, s, sg: -1 });
  const pb = b.T([14, 30]), dx = -280;
  return svg(
    view("Hughston · decúbito prono") +
    g(`translate(${dx} 0)`,
      table(280, 680, 252, "") +
      clipR("cpS2", 280, 26, 400, 226, dibujar(b)) +
      beam(pb[0], pb[1], 170, 210, { ref: 125, angLabel: "45°" }) +
      `<line x1="${f1(b.knee[0])}" y1="${f1(b.knee[1])}" x2="${f1(b.knee[0] + 70)}" y2="${f1(b.knee[1])}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 3"/>` +
      arco(b.knee[0], b.knee[1], 56, -55, 0) + txt(f1(b.knee[0] + 50), f1(b.knee[1] - 50), "50-60°", 12, BLUE, "start", 700)) +
    txt(16, 44, "← cabeza", 11, MUTE) +
    col(440, 70, [["RC 45° cefálico respecto del eje", RED, 700, 12], ["longitudinal de la pierna, en la", INK], ["mitad del espacio femororrotuliano", INK]]) +
    col(440, 140, [["Decúbito prono, rodilla flexionada", INK, 700, 12.5], ["50-60° desde la extensión completa", INK, 700, 12.5]]) +
    col(440, 190, [["El pie puede apoyarse en un soporte", INK], ["que no sea el colimador", INK]]) +
    settTxt(290)
  );
};

// ---- Pie pediátrico (Kite): AP / lateral ----
I["ped-pie-ap-mediolateral-kite--v1"] = () => {
  const a = limb({ ankle: [200, 214], legDir: 250, footDir: 0, s: 0.7 });
  const ta = a.F([40, -22]);
  return svg(
    view("AP · rodilla flexionada, pie sobre el RI") +
    table(0, 400, 259, "") + apoyo(20, 231, 120, 28) + txt(26, 249, "apoyo", 11, MUTE) +
    ri(150, 247, 150, 12, "RI 18 x 24 vertical", 150, 296) +
    clipR("cpK1", 0, 26, 400, 230, dibujar(a)) +
    dot(ta[0], ta[1], RED) +
    tube(ta[0], ta[1] - 4, 0, 160) +
    note(ta[0] + 4, 120, 440, 70, ["RC perpendicular al RI, en los", "tarsianos medios (Kite propone", "no angular el rayo)"], RED) +
    col(440, 150, [["Paciente elevado sobre un apoyo,", INK, 700], ["rodilla flexionada y pie sobre el RI", INK, 700]]) +
    col(440, 200, [["No intentar enderezar el pie al", INK], ["colocarlo sobre el RI", INK]]) +
    col(440, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["ped-pie-ap-mediolateral-kite--v2"] = () => {
  const b = limb({ ankle: [660, 190], legDir: 304, footDir: 180, s: 0.7, sg: -1 });
  const mb = b.F([64, -28]), dx = -360;
  return svg(
    view("Lateral (mediolateral) · desde el tubo") +
    g(`translate(${dx} 0)`,
      riTop(470, 110, 230, 150, "") +
      clipR("cpK2", 392, 26, 368, 300, dibujar(b) +
        `<rect x="${f1(mb[0] - 8)}" y="100" width="16" height="170" fill="#fff" fill-opacity=".55" stroke="${MUTE}" stroke-dasharray="3 2"/>`) +
      coll(482, 122, 206, 126) + cross(mb[0], mb[1])) +
    txt(110, 98, "RI 18 x 24 · cinta adhesiva o banda", 11, INK) +
    note(mb[0] + dx - 8, mb[1] + 8, 120, 290, ["RC perpendicular, en la zona", "metatarsiana proximal"], RED) +
    col(440, 70, [["Paciente o pierna de costado,", INK, 700], ["lado afectado abajo", INK, 700]]) +
    col(440, 120, [["Sujetar con cinta adhesiva o una", INK], ["banda de compresión", INK]]) +
    col(440, 170, [["Frontal y lateral a 90° una de otra;", MUTE, 400, 11], ["no enderezar el pie", MUTE, 400, 11]]) +
    col(440, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

module.exports = I;
