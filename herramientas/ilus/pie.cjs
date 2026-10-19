// Esquemas de tobillo, pie, calcáneo y dedos del pie (estilo aprobado: contorno continuo color piel + huesos de referencia).
// Helpers adaptados de referencia-tecnicas1-pie.cjs (copiados, no modificados allí).
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONE, BONEO, table, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, piel, linea, hueso, etiquetaHueso } = E;

// ---------- helpers ----------
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
const clip = (id, x = 0, y = 0, w = 760, h = 330) => `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>`;
const sep = (x) => `<line x1="${x}" y1="20" x2="${x}" y2="320" stroke="#e2e4ea"/>`;
const panel = (x, t) => `<text x="${x}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${t.toUpperCase()}</text>`;
const apoyo = (x, y, w = 44, h = 16) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#d7dbe3" stroke="#8a8f9c"/>`;
const arco = (cx, cy, r, a1, a2, color = BLUE) => {
  // arco de a1 a a2 (grados SVG), sentido horario si a2 > a1
  const p1 = [cx + r * Math.cos(deg(a1)), cy + r * Math.sin(deg(a1))], p2 = [cx + r * Math.cos(deg(a2)), cy + r * Math.sin(deg(a2))];
  return `<path d="M${f1(p1[0])},${f1(p1[1])} A${r},${r} 0 0 ${a2 > a1 ? 1 : 0} ${f1(p2[0])},${f1(p2[1])}" fill="none" stroke="${color}" stroke-width="1.6"/>`;
};
const rayo = (x1, y1, x2, y2) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${RED}" stroke-width="1.4" stroke-dasharray="5 4"/>`;
const pt = (p) => p.map(f1);

// ---------- miembro inferior visto de costado ----------
// toeFlex: flexión dorsal de los dedos (grados) alrededor de las articulaciones MTF.
const LL = 330, LT = 760;
function limb(o) {
  const { legDir, footDir, thighDir = legDir, s = 1, sg = 1, flexed = false, toeFlex = 0 } = o;
  const aL = unit(legDir), bL = rot(aL, 90 * sg);
  const ankle = o.ankle || [o.knee[0] - LL * s * aL[0], o.knee[1] - LL * s * aL[1]];
  const aF = unit(footDir), bF = rot(aF, -90 * sg);
  const knee = [ankle[0] + LL * s * aL[0], ankle[1] + LL * s * aL[1]];
  const aT = unit(thighDir), bT = rot(aT, 90 * sg);
  const L = frame(ankle, aL, bL, s), F0 = frame(ankle, aF, bF, s), T = frame(knee, aT, bT, s);
  const piv = [108, -40];
  const tw = (p) => { if (!toeFlex || p[0] < 104) return p; const v = rot([p[0] - piv[0], p[1] - piv[1]], toeFlex); return [piv[0] + v[0], piv[1] + v[1]]; };
  const F = (p) => F0(tw(p));
  const thighPost = [[LT, -46], [LT * 0.55, -46], [70, -42]].concat(flexed ? [] : [[18, -38]]);
  const legPost = (flexed ? [] : [[LL - 12, -38]]).concat([[LL - 60, -44], [LL - 120, -46], [LL - 200, -36], [95, -26], [48, -21], [22, -21]]);
  const foot = [[-26, 8], [-38, -12], [-40, -30], [-30, -42], [-12, -47], [10, -46], [40, -40], [76, -43], [102, -47], [112, -47], [134, -46], [150, -42], [153, -34], [146, -26], [128, -24], [110, -20], [100, -15], [66, 0], [42, 11], [28, 19]];
  const legAnt = [[34, 21], [80, 20], [170, 22], [262, 26], [300, 32], [LL - 10, 36]];
  const thighAnt = [[8, 44], [30, 47], [70, 42], [LT * 0.55, 46], [LT, 46]];
  const pts = [...thighPost.map(T), ...legPost.map(L), ...foot.map(F), ...legAnt.map(L), ...thighAnt.map(T)];
  const d = cr(pts) + " Z";
  const toes = linea(cr([[128, -27], [133, -36], [131, -45]].map(F)), 1.3) + linea(cr([[114, -22], [118, -32], [116, -46]].map(F)), 1.1);
  const H = (pts, M, extra) => hueso(cr(pts.map(M), true), extra);
  const B = {
    femur: H([[LT + 30, -14], [90, -14], [40, -26], [14, -32], [3, -20], [4, 8], [16, 22], [40, 12], [90, 11], [LT + 30, 11]], T),
    rotula: H([[44, 33], [30, 39], [10, 37], [5, 31], [18, 27], [34, 27]], T),
    tibia: H([[LL - 6, -26], [LL - 4, -4], [LL - 5, 18], [LL - 22, 24], [LL - 60, 16], [200, 14], [90, 14], [34, 15], [12, 16], [0, 8], [-3, 0], [4, -8], [8, -12], [40, -8], [130, -4], [LL - 70, -6], [LL - 30, -24]], L),
    perone: H([[LL - 24, -24], [LL - 26, -34], [LL - 40, -36], [LL - 50, -30], [LL - 70, -24], [150, -16], [60, -12], [24, -8], [6, -6], [-12, -10], [-8, -18], [14, -18], [60, -20], [150, -23], [LL - 74, -30]], L, `fill-opacity=".7"`),
    calcaneo: H([[-10, -14], [-24, -12], [-34, -22], [-34, -34], [-24, -41], [-6, -41], [14, -37], [28, -32], [28, -24], [10, -20]], F),
    astragalo: H([[-12, 0], [0, 7], [14, 4], [24, -2], [34, -4], [34, -12], [22, -15], [6, -18], [-8, -14]], F),
    tarso: H([[36, -2], [44, -5], [46, -14], [38, -16], [34, -10]], F) + H([[47, -6], [58, -10], [60, -20], [48, -20]], F) + H([[30, -26], [48, -24], [50, -34], [32, -36]], F),
    mt: H([[52, -26], [102, -38], [104, -43], [100, -46], [52, -35]], F) + H([[60, -11], [102, -29], [104, -35], [100, -38], [60, -20]], F),
    falanges: H([[110, -33], [127, -35], [127, -42], [110, -43]], F) + H([[131, -36], [145, -38], [145, -42], [131, -43]], F),
  };
  const huesos = B.femur + B.rotula + B.tibia + B.perone + B.calcaneo + B.astragalo + B.tarso + B.mt + B.falanges;
  return { d, toes, B, huesos, L, F, T, knee, ankle };
}

// ---------- pie visto desde la planta (dedos arriba, talón abajo); flip = espejo horizontal ----------
function planta(cx, cy, r = 0, s = 1, dash = false, flip = false) {
  const P = ([x, y]) => { const v = rot([x * s * (flip ? -1 : 1), y * s], r); return [cx + v[0], cy + v[1]]; };
  const ex = dash ? `stroke-dasharray="5 4" fill-opacity=".35"` : "";
  const toes = [[-28, -78, 11, 14], [-6, -84, 7, 10], [10, -82, 6.5, 9], [24, -76, 6, 8], [36, -66, 5.5, 7]];
  const t = toes.map(([x, y, rx, ry]) => { const [X, Y] = P([x, y]); return `<ellipse cx="${f1(X)}" cy="${f1(Y)}" rx="${rx * s}" ry="${ry * s}" transform="rotate(${r} ${f1(X)} ${f1(Y)})" fill="${SK}" stroke="${SKO}" stroke-width="${dash ? 1.4 : 1.6}" ${ex}/>`; }).join("");
  const sole = [[-8, 94], [14, 88], [24, 62], [32, 10], [40, -34], [38, -56], [24, -66], [-4, -70], [-30, -66], [-40, -50], [-34, -14], [-26, 28], [-30, 62], [-26, 86]];
  return { svg: t + piel(cr(sole.map(P), true), ex), P };
}

// ---------- pie visto desde los dedos (oblicuas); s = escala ----------
function pieFrontal(x0, y0, r, s = 1) {
  const P = ([x, y]) => { const v = rot([x * s, y * s], r); return [x0 + v[0], y0 + v[1]]; };
  const circ = (x, y, rr, fill, st, w) => { const [X, Y] = P([x, y]); return `<circle cx="${f1(X)}" cy="${f1(Y)}" r="${f1(rr * s)}" fill="${fill}" stroke="${st}" stroke-width="${w}"/>`; };
  const leg = piel(cr([[30, -36], [20, -66], [26, -100], [20, -150], [24, -190], [42, -214], [80, -218], [108, -200], [116, -160], [118, -110], [114, -82], [124, -60], [118, -36]].map(P)) + " Z");
  const rodilla = linea(cr([[48, -196], [68, -204], [92, -196]].map(P)), 1.3);
  const body = piel(cr([[4, 0], [-2, -20], [6, -44], [30, -62], [70, -60], [110, -44], [140, -26], [152, -10], [148, 0], [76, 2]].map(P), true));
  const toes = [[22, -16, 17], [52, -12, 12], [76, -11, 11], [99, -10, 10], [121, -9, 9]].map(([x, y, rr]) => circ(x, y, rr, SK, SKO, 1.6) + linea(cr([[x - rr * 0.5, y - rr * 0.55], [x, y - rr * 0.8], [x + rr * 0.5, y - rr * 0.55]].map(P)), 1.1)).join("");
  const mtPos = [[24, -40, 9], [52, -45, 7], [78, -42, 6.5], [104, -34, 6], [128, -24, 5.5]];
  const mts = mtPos.map(([x, y, rr]) => circ(x, y, rr, BONE, BONEO, 1.3)).join("");
  return { svg: leg + rodilla + body + toes + mts, P, toePos: [[22, -16, 17], [52, -12, 12], [76, -11, 11], [99, -10, 10], [121, -9, 9]] };
}

// ---------- pierna vista desde el tubo con el pie de frente (dedos hacia el tubo); fr = giro del pie (inversión/eversión) ----------
function pieTubo(x0, y0, fr, s = 1) {
  const P = ([x, y]) => [x0 + x * s, y0 + y * s];
  const pv = [74, -34];
  const PF = ([x, y]) => { const v = rot([x - pv[0], y - pv[1]], fr); return P([pv[0] + v[0], pv[1] + v[1]]); };
  const circ = (p, rr) => { const [X, Y] = PF(p); return `<circle cx="${f1(X)}" cy="${f1(Y)}" r="${f1(rr * s)}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>`; };
  const leg = piel(cr([[34, -40], [26, -62], [30, -100], [32, -170], [34, -240], [114, -240], [116, -170], [118, -100], [122, -64], [114, -40]].map(P)) + " Z");
  const body = piel(cr([[4, 0], [-2, -20], [6, -44], [30, -62], [70, -60], [110, -44], [140, -26], [152, -10], [148, 0], [76, 2]].map(PF), true));
  const toes = [[22, -16, 17], [52, -12, 12], [76, -11, 11], [99, -10, 10], [121, -9, 9]].map(([x, y, rr]) => circ([x, y], rr) + linea(cr([[x - rr * 0.5, y - rr * 0.55], [x, y - rr * 0.8], [x + rr * 0.5, y - rr * 0.55]].map(PF)), 1.1)).join("");
  return { svg: leg + body + toes, P, PF };
}

const I = {};

// ======================= TOBILLO =======================
// panel lateral común: decúbito supino, pierna extendida, RC perpendicular entre maléolos
function tobilloLateral(id, { conApoyo = true, riTxt = "RI 24 × 30 vert." } = {}) {
  const m = limb({ ankle: [430, 214], legDir: 180, footDir: 270, s: 0.86 });
  const j = m.L([2, 0]);
  const mm = m.L([0, 6]);
  return clip(id, 0, 0, 548, 330) +
    table(0, 548, 252) +
    ri(370, 240, 120, 10, "", 0, 0) + txt(372, 272, riTxt, 11.5, INK) +
    `<g clip-path="url(#${id})">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    (conApoyo ? apoyo(176, 236) + txt(198, 280, "apoyo bajo la rodilla", 11, MUTE, "middle") : "") +
    etiquetaHueso(m.L([90, 4])[0], m.L([90, 4])[1] + 4, "tibia", "middle") +
    etiquetaHueso(m.L([90, -26])[0], m.L([90, -26])[1] + 14, "peroné", "middle") +
    tube(j[0], j[1] - 8, 0, 150) +
    note(j[0], 110, 300, 60, ["RC perpendicular al RI,", "a mitad de camino entre", "los maléolos · DFRI 100 cm"], RED, "end") +
    note(mm[0] - 4, mm[1] - 4, 300, 170, ["Maléolos"], INK, "end");
}
const PX = 560; // inicio del panel derecho

I["tobillo-ap"] = () => {
  const p = planta(668, 150, 0, 0.82);
  const top = p.P([0, -96]), bot = p.P([0, 100]);
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    tobilloLateral("cpTA") +
    sep(PX) + panel(PX + 14, "Planta (desde los pies)") +
    p.svg +
    refline(top[0], 44, top[0], 246) +
    `<rect x="${PX + 30}" y="246" width="160" height="10" fill="${INK}"/>` +
    txt(PX + 14, 278, "Sin rotación: eje del pie", 11.5, BLUE, "start", 700) +
    txt(PX + 14, 294, "vertical, paralelo al RC", 11.5, BLUE) +
    txt(PX + 14, 312, "Pierna paralela al borde del RI", 11, MUTE)
  );
};

I["tobillo-ap-mortaja"] = () => {
  const p0 = planta(668, 150, 0, 0.82, true);
  const p1 = planta(668, 150, -17.5, 0.82);
  const a0 = p0.P([-30, 46]), b0 = p0.P([22, 63]);
  const a1 = p1.P([-30, 46]), b1 = p1.P([22, 63]);
  const ml = (a, b, c, w) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${c}" stroke-width="${w}"/>` + `<circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="4" fill="${BONE}" stroke="${BONEO}"/><circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="4" fill="${BONE}" stroke="${BONEO}"/>`;
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    tobilloLateral("cpTM") +
    sep(PX) + panel(PX + 14, "Planta (desde los pies)") +
    p0.svg + p1.svg +
    ml(a0, b0, MUTE, 1.2) +
    refline(PX + 22, f1(a1[1]), PX + 186, f1(a1[1])) + ml(a1, b1, BLUE, 2.2) +
    `<rect x="${PX + 30}" y="246" width="160" height="10" fill="${INK}"/>` +
    `<path d="M700,60 Q680,50 660,54" fill="none" stroke="${BLUE}" stroke-width="1.6" marker-end="url(#arb)"/>` + txt(704, 44, "rotación", 11, BLUE) + txt(704, 59, "medial", 11, BLUE) + txt(704, 75, "15-20°", 12, BLUE, "start", 700) +
    txt(PX + 14, 278, "Línea intermaleolar (azul)", 11.5, BLUE, "start", 700) +
    txt(PX + 14, 294, "paralela al tablero", 11.5, BLUE) +
    txt(PX + 14, 312, "punteado: pie sin rotar", 10.5, MUTE)
  );
};

I["tobillo-ap-oblicua-45"] = () => {
  const c = [672, 160];
  const p0 = planta(c[0], c[1], 0, 0.72, true);
  const p1 = planta(c[0], c[1], -45, 0.72);
  const t1 = p1.P([0, -104]), b1 = p1.P([0, 70]);
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    tobilloLateral("cpTO") +
    sep(PX) + panel(PX + 14, "Planta (desde los pies)") +
    p0.svg + p1.svg +
    refline(c[0], 70, c[0], 240) +
    `<line x1="${f1(b1[0])}" y1="${f1(b1[1])}" x2="${f1(t1[0])}" y2="${f1(t1[1])}" stroke="${BLUE}" stroke-width="2.2"/>` +
    arco(c[0], c[1], 62, -90, -135) + txt(c[0] - 14, c[1] - 70, "45°", 14, BLUE, "end", 700) +
    `<rect x="${PX + 30}" y="246" width="160" height="10" fill="${INK}"/>` +
    txt(PX + 14, 278, "Pierna y pie rotados 45°", 11.5, BLUE, "start", 700) +
    txt(PX + 14, 294, "hacia medial", 11.5, BLUE) +
    txt(PX + 14, 312, "punteado: pie sin rotar", 10.5, MUTE)
  );
};

I["tobillo-lateral"] = () => {
  const m = limb({ ankle: [436, 214], legDir: 180, footDir: 270, s: 1.0 });
  const mm = m.L([0, 6]);
  const c = m.L([30, 21]);
  return svg(clip("cpTL") +
    view("Vista desde el tubo · decúbito sobre el lado afectado") +
    riTop(330, 54, 230, 240, "RI 24 × 30 vert.", 336, 286) +
    `<g clip-path="url(#cpTL)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    coll(344, 62, 176, 214) + txt(344, 48, "tibia y peroné distales + MT proximales", 11, AMB) +
    cross(mm[0], mm[1]) +
    note(mm[0] + 12, mm[1] + 4, 580, 226, ["RC perpendicular,", "centrado en el maléolo medial"], RED) +
    `<path d="M${f1(c[0] - 34)},${f1(c[1])} A34,34 0 0 1 ${f1(c[0])},${f1(c[1] - 34)}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(f1(c[0] - 30), f1(c[1] - 30), "90°", 12, BLUE, "end", 700) +
    note(m.F([96, -10])[0], m.F([96, -10])[1], 580, 96, ["Flexión dorsal del pie", "a 90° con la pierna (si tolera)"], BLUE) +
    note(m.F([18, -2])[0], m.F([18, -2])[1], 580, 150, ["astrágalo"], INK) +
    note(m.F([-20, -32])[0], m.F([-20, -32])[1], 580, 278, ["calcáneo"], INK) +
    etiquetaHueso(m.L([170, 4])[0], m.L([170, 4])[1] + 4, "tibia", "middle") +
    etiquetaHueso(m.L([170, -26])[0], m.L([170, -26])[1] + 16, "peroné", "middle") +
    txt(16, 270, "← rodilla algo flexionada (apoyo si hace falta)", 11, MUTE) +
    txt(16, 306, "Pie y tobillo en lateral verdadera · DFRI 100 cm", 11.5, MUTE)
  );
};

I["tobillo-ap-estres"] = () => {
  const inv = pieTubo(572, 214, 22, 0.42), ev = pieTubo(670, 214, -22, 0.42);
  const lab = (f, t) => { const a = f.P([74, 62]); return txt(f1(a[0]), f1(a[1]), t, 11.5, INK, "middle", 700); };
  const curv = (f, sg) => { const a = f.P([74 + 70 * sg, 12]), b = f.P([74 - 50 * sg, 16]); return `<path d="M${f1(a[0])},${f1(a[1])} Q${f1((a[0] + b[0]) / 2)},${f1(a[1] + 26)} ${f1(b[0])},${f1(b[1])}" fill="none" stroke="${BLUE}" stroke-width="1.6" marker-end="url(#arb)"/>`; };
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    tobilloLateral("cpTE", { conApoyo: false, riTxt: "RI 24 × 30 vert. o 35 × 43" }) +
    sep(PX) + panel(PX + 14, "Desde el tubo · dedos arriba") +
    inv.svg + ev.svg + curv(inv, 1) + curv(ev, -1) +
    lab(inv, "inversión") + lab(ev, "eversión") +
    txt(PX + 10, 60, "← medial", 10.5, MUTE) + txt(752, 60, "lateral →", 10.5, MUTE, "end") + txt(PX + 10, 76, "(planta hacia el borde inferior)", 10, MUTE) +
    txt(PX + 14, 284, "Sin rotar la pierna (AP verdadera):", 11, INK, "start", 700) +
    txt(PX + 14, 299, "forzar planta hacia adentro", 11, INK) +
    txt(PX + 14, 314, "y después hacia afuera", 11, INK)
  );
};

// ======================= PIE =======================
I["pie-ap-dorsoplantar"] = () => {
  const m = limb({ ankle: [530, 213], legDir: 250, footDir: 0, s: 1.0 });
  const b3 = m.F([58, -24]);
  const mt = m.F([86, -38]), ph = m.F([136, -38]), ca = m.F([-22, -32]);
  return svg(clip("cpPA") +
    view("Vista lateral · rodilla flexionada, planta apoyada en el RI") +
    table(0, 760, 268) +
    ri(470, 256, 236, 12, "") + txt(470, 296, "RI 24 × 30 vert.", 11.5, INK) +
    `<g clip-path="url(#cpPA)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    dot(b3[0], b3[1], RED) +
    tube(b3[0], b3[1] - 4, -10, 190, { angLabel: "10°" }) +
    note(b3[0] + 12, 130, 380, 70, ["RC 10° hacia el talón (posterior),", "perpendicular a los metatarsianos", "DFRI 100 cm"], RED, "end") +
    txt(380, 138, "Flexión plantar: pie y RI deslizados", 11.5, MUTE, "end") + txt(380, 154, "hacia distal; bolsas de arena", 11.5, MUTE, "end") +
    note(b3[0] - 2, b3[1] + 6, 560, 318, ["Base del 3.er MT"], RED, "end") +
    note(mt[0], mt[1], 640, 300, ["metatarsianos"], INK) +
    note(ph[0], ph[1], 704, 228, ["falanges"], INK) +
    note(ca[0], ca[1], 440, 300, ["calcáneo (talón)"], INK, "end") +
    etiquetaHueso(m.L([60, 4])[0] + 2, m.L([60, 4])[1], "tibia", "middle")
  );
};

I["pie-ap-oblicua-medial"] = () => {
  const x0 = 420, y0 = 248, R = -35;
  const f = pieFrontal(x0, y0, R);
  const mt3 = f.P([78, -42]);
  const la = f.P([160, 18]);
  const rx = x0 + 150 * Math.cos(deg(35)), ry = y0 - 150 * Math.sin(deg(35));
  const w1 = f.P([70, 3]), w2 = f.P([150, 3]);
  return svg(
    view("Vista desde los dedos · pie oblicuado hacia medial") +
    table(200, 720, 260, "") +
    ri(270, 248, 330, 12, "RI 24 × 30", 608, 258) +
    `<path d="M${f1(w1[0])},${f1(w1[1])} L${f1(w2[0])},${f1(w2[1])} L${f1(w2[0])},${y0} L${f1(w1[0])},${y0} Z" fill="#dfe3ea" stroke="#8a8f9c" stroke-width="1.2"/>` +
    f.svg +
    `<circle cx="${f1(mt3[0])}" cy="${f1(mt3[1])}" r="9" fill="none" stroke="${RED}" stroke-width="2"/>` +
    `<line x1="${x0}" y1="${y0}" x2="${f1(x0 + 200 * Math.cos(deg(35)))}" y2="${f1(y0 - 200 * Math.sin(deg(35)))}" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
    `<path d="M${x0 + 150},${y0} A150,150 0 0 0 ${f1(rx)},${f1(ry)}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(584, 222, "30-40°", 14, BLUE, "start", 700) +
    txt(x0 - 12, y0 - 6, "medial", 11, MUTE, "end") + txt(f1(la[0]) + 6, f1(la[1]) - 8, "lateral", 11, MUTE) +
    note(f1(w2[0]) - 10, y0 - 10, 620, 292, ["Bloque angular", "radiotransparente"], INK) +
    tube(mt3[0], mt3[1] - 10, 0, 140) +
    note(mt3[0], 110, 530, 64, ["RC perpendicular al RI", "en la base del 3.er MT", "DFRI 100 cm"], RED) +
    note(f.P([128, -24])[0] + 4, f.P([128, -24])[1] - 2, 600, 150, ["Metatarsianos"], INK) +
    note(f.P([22, -16])[0] - 14, f.P([22, -16])[1] + 6, 300, 214, ["Dedo gordo"], INK, "end") +
    txt(40, 300, "Oblicuar el pie 30-40° hacia medial", 12, INK, "start", 700) + txt(40, 316, "con bolsas de arena.", 11.5, MUTE) +
    txt(40, 64, "Bóveda alta → cerca de 45° · pie plano → cerca de 30°.", 11.5, MUTE)
  );
};

I["pie-lateral"] = () => {
  const m = limb({ ankle: [500, 200], legDir: 304, footDir: 180, s: 1.0, sg: -1 });
  const b3 = m.F([58, -24]);
  const mt = m.F([90, -36]), ca = m.F([-24, -30]), as = m.F([10, 0]);
  return svg(clip("cpPL") +
    view("Vista desde el tubo · decúbito sobre el lado afectado") +
    riTop(300, 110, 290, 176, "") + txt(584, 280, "RI 18 × 24 (o 24 × 30) horiz.", 12, INK, "end") +
    `<g clip-path="url(#cpPL)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    coll(316, 126, 256, 140) + txt(316, 302, "todo el pie + parte distal del tobillo", 11, AMB) +
    cross(b3[0], b3[1]) +
    note(b3[0] - 8, b3[1] - 8, 290, 70, ["RC perpendicular en la base del 3.er MT"], RED, "end") +
    note(m.L([130, 30])[0] + 2, m.L([130, 30])[1], 290, 150, ["Rodilla flexionada,", "pierna sana por detrás"], INK, "end") +
    note(m.F([120, -46])[0], m.F([120, -46])[1] + 2, 250, 296, ["Planta perpendicular al RI", "(apoyo bajo la rodilla si hace falta)"], BLUE, "end") +
    note(mt[0], mt[1], 150, 210, ["metatarsianos"], INK, "end") +
    note(ca[0], ca[1], 610, 250, ["calcáneo"], INK) +
    note(as[0], as[1], 610, 200, ["astrágalo"], INK) +
    txt(600, 300, "Mediolateral · DFRI 100 cm", 11.5, MUTE)
  );
};

I["pie-ap-lateral-carga"] = () => {
  const m = limb({ ankle: [116, 238], legDir: 270, footDir: 0, s: 0.68 });
  const b3 = m.F([58, -24]);
  // panel derecho: desde arriba
  const pd = planta(630, 176, 0, 0.78), pi = planta(500, 176, 0, 0.78, false, true);
  const mt5 = pd.P([32, 6]);
  const blk = (c) => `<rect x="${c - 46}" y="90" width="92" height="170" rx="4" fill="#e3e6ec" stroke="#8a8f9c" stroke-width="1.2"/>`;
  return svg(clip("cpPC", 0, 0, 360, 330) +
    `<rect x="20" y="260" width="330" height="10" fill="#cfd3dc"/>` +
    ri(40, 250, 220, 10, "") + txt(20, 286, "RI 24 × 30 horiz. (35 × 43 los dos pies)", 11, INK) +
    `<g clip-path="url(#cpPC)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    `<rect x="8" y="6" width="190" height="20" fill="#fff" opacity=".85"/>` + view("AP · vista lateral, de pie") +
    tube(b3[0], b3[1] - 4, -15, 160, { angLabel: " " }) + txt(f1(b3[0] - 8), f1(b3[1] - 70), "15°", 13, RED, "end", 700) +
    note(f1(b3[0] + (b3[1] - 204) * Math.tan(deg(15))), 200, 246, 160, ["RC 15° posterior", "(cefálico) a la base", "del 3.er MT, entre", "los dos pies"], RED) +
    txt(16, 306, "Peso repartido en los dos pies, parado sobre el RI", 11, MUTE) +
    sep(372) + panel(386, "Lateral · desde arriba") +
    blk(500) + blk(630) + txt(565, 278, "bloques", 10.5, MUTE, "middle") +
    pi.svg + pd.svg +
    `<rect x="562" y="70" width="7" height="200" fill="${INK}"/>` + txt(565, 62, "RI vertical entre los pies", 11, INK, "middle") +
    beam(mt5[0] + 2, mt5[1], 180, 76, { ref: 180 }) +
    txt(744, 124, "RC horizontal", 12.5, RED, "end", 700) + txt(744, 240, "base del 5.º MT", 11.5, INK, "end") +
    txt(386, 306, "Derecho e izquierdo, para comparar", 11, MUTE) +
    txt(386, 320, "DFRI 100 cm", 11, MUTE)
  );
};

// ======================= CALCÁNEO =======================
I["calcaneo-plantodorsal-axial"] = () => {
  const m = limb({ ankle: [470, 205], legDir: 180, footDir: 270, s: 0.95 });
  const e = m.F([60, -44]);
  const u = unit(130), k = (238 - e[1]) / u[1];
  const out = [e[0] + k * u[0], 238];
  const ca = m.F([-20, -30]);
  return svg(clip("cpCA") +
    view("Vista lateral · decúbito supino, pie en flexión dorsal") +
    table(0, 760, 250) +
    ri(380, 238, 150, 12, "") + txt(382, 280, "RI 18 × 24 vert.", 11.5, INK) +
    `<g clip-path="url(#cpCA)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    rayo(e[0], e[1], out[0], out[1]) +
    tube(e[0], e[1], -40, 160, { angLabel: "40°" }) +
    note(e[0] + 4, e[1] + 4, 600, 228, ["Entrada: base del 3.er MT"], RED) +
    note(f1(e[0] + 120 * Math.cos(deg(-50))), f1(e[1] - 120 * Math.sin(deg(50))), 290, 46, ["RC 40° respecto del eje de la planta,", "hacia la cabeza · DFRI 100 cm"], RED, "end") +
    txt(290, 92, "Si el pie no llega a 90°, puede hacer falta", 11.5, MUTE, "end") + txt(290, 108, "más de 40° respecto de la vertical.", 11.5, MUTE, "end") +
    note(ca[0], ca[1], 290, 300, ["calcáneo, sobre la parte del RI"], INK, "end") + txt(290, 316, "más cercana al tubo", 13.5, INK, "end") +
    note(m.F([110, -10])[0], m.F([110, -10])[1], 590, 120, ["Pie lo más vertical", "posible (tira de una gasa)"], BLUE) +
    etiquetaHueso(m.L([110, 4])[0], m.L([110, 4])[1] + 4, "tibia", "middle")
  );
};

I["calcaneo-lateral"] = () => {
  const m = limb({ ankle: [436, 200], legDir: 180, footDir: 270, s: 1.0 });
  const mm = m.L([0, 6]);
  const rc = m.F([-14, -26]);
  const c = m.L([30, 21]);
  const jx = m.L([4, 0])[0];
  return svg(clip("cpCL") +
    view("Vista desde el tubo · decúbito sobre el lado afectado") +
    riTop(360, 64, 200, 230, "RI 18 × 24 vert.", 366, 286) +
    `<g clip-path="url(#cpCL)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    coll(f1(jx), 150, f1(552 - jx), 120) + txt(16, 290, "Campo: calcáneo, con el tobillo en el borde superior", 11, AMB) +
    cross(rc[0], rc[1]) +
    note(rc[0] + 12, rc[1] + 6, 590, 250, ["RC perpendicular,", "2,5 cm por debajo del", "maléolo medial"], RED) +
    note(mm[0] - 4, mm[1] - 6, 300, 120, ["Maléolo medial"], INK, "end") +
    `<path d="M${f1(c[0] - 34)},${f1(c[1])} A34,34 0 0 1 ${f1(c[0])},${f1(c[1] - 34)}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(f1(c[0] + 2), f1(c[1] - 40), "90°", 12, BLUE, "start", 700) +
    note(m.F([96, -10])[0], m.F([96, -10])[1], 590, 96, ["Flexión dorsal:", "planta cerca de 90°"], BLUE) +
    etiquetaHueso(m.L([170, 4])[0], m.L([170, 4])[1] + 4, "tibia", "middle") +
    txt(16, 270, "← rodilla flexionada, pierna sana por detrás", 11, MUTE) +
    txt(16, 310, "Lateral verdadera · DFRI 100 cm", 11.5, MUTE)
  );
};

// ======================= DEDOS DEL PIE =======================
I["dedos-pie-ap"] = () => {
  const m = limb({ ankle: [400, 191], legDir: 250, footDir: 0, s: 1.35 });
  const mtf = m.F([107, -38]);
  const ph = m.F([138, -38]), mt = m.F([80, -34]);
  return svg(clip("cpDA") +
    table(0, 760, 268) +
    ri(470, 256, 210, 12, "") + txt(680, 288, "RI 18 × 24 horiz.", 11.5, INK, "end") +
    `<g clip-path="url(#cpDA)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    `<rect x="8" y="6" width="420" height="20" fill="#fff" opacity=".85"/>` + view("Vista lateral · rodilla flexionada, planta sobre el RI") +
    dot(mtf[0], mtf[1], RED) +
    tube(mtf[0], mtf[1] - 4, -12.5, 190, { angLabel: " " }) + txt(f1(mtf[0] - 8), f1(mtf[1] - 80), "10-15°", 13, RED, "end", 700) +
    note(mtf[0] + 12, 120, 290, 50, ["RC 10-15° hacia el calcáneo,", "perpendicular al eje de los dedos", "DFRI 100 cm"], RED, "end") +
    note(mtf[0] - 2, mtf[1] + 6, 610, 318, ["Articulaciones MTF de interés"], RED, "end") +
    note(ph[0], ph[1], 700, 228, ["falanges"], INK) +
    note(mt[0], mt[1], 380, 300, ["metatarsianos"], INK, "end") +
    txt(16, 170, "Decúbito supino o sentado.", 11.5, MUTE) + txt(16, 186, "Varias exposiciones en un RI:", 11.5, MUTE) + txt(16, 202, "cubrir con plomo el resto.", 11.5, MUTE)
  );
};

I["dedos-pie-ap-oblicua"] = () => {
  const S = 0.72;
  // izquierda: oblicua medial (borde medial sobre el RI)
  const xA = 120, yA = 250;
  const fA = pieFrontal(xA, yA, -38, S);
  // derecha: oblicua lateral (borde lateral sobre el RI): giro opuesto, pivote en el borde lateral
  const tmp = pieFrontal(0, 0, 38, S), lp = tmp.P([152, 0]);
  const xB = 640 - lp[0], yB = 250 - lp[1];
  const fB = pieFrontal(xB, yB, 38, S);
  const tA = fA.P([22, -16]), tB = fB.P([121, -9]);
  const wedge = (f, a, b) => { const p = f.P(a), q = f.P(b); return `<path d="M${f1(p[0])},${f1(p[1])} L${f1(q[0])},${f1(q[1])} L${f1(q[0])},250 L${f1(p[0])},250 Z" fill="#dfe3ea" stroke="#8a8f9c" stroke-width="1.2"/>`; };
  const ang = (x, y, sg) => { const r = 92, a = sg > 0 ? -1 : 1; const ex = x + sg * r * Math.cos(deg(37.5)), ey = y - r * Math.sin(deg(37.5)); return `<line x1="${x}" y1="${y}" x2="${f1(x + sg * 130 * Math.cos(deg(37.5)))}" y2="${f1(y - 130 * Math.sin(deg(37.5)))}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="4 4"/><path d="M${x + sg * r},${y} A${r},${r} 0 0 ${sg > 0 ? 0 : 1} ${f1(ex)},${f1(ey)}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>`; };
  return svg(
    view("Vista desde los dedos · pie oblicuado") +
    ri(40, 250, 300, 10, "") + ri(420, 250, 300, 10, "") +
    wedge(fA, [70, 3], [150, 3]) + wedge(fB, [0, 3], [80, 3]) +
    fA.svg + fB.svg +
    ang(xA, yA, 1) + ang(640, 250, -1) +
    txt(xA + 96, yA - 26, "30-45°", 13, BLUE, "start", 700) + txt(640 - 96, 224, "30-45°", 13, BLUE, "end", 700) +
    tube(tA[0], tA[1] - 14, 0, 120) + tube(tB[0], tB[1] - 12, 0, 120) +
    `<circle cx="${f1(tA[0])}" cy="${f1(tA[1])}" r="${f1(17 * S + 3)}" fill="none" stroke="${RED}" stroke-width="2"/>` +
    `<circle cx="${f1(tB[0])}" cy="${f1(tB[1])}" r="${f1(9 * S + 3)}" fill="none" stroke="${RED}" stroke-width="2"/>` +
    txt(40, 46, "Dedos 1.º a 3.º: hacia medial", 12.5, INK, "start", 700) +
    txt(720, 46, "Dedos 4.º y 5.º: hacia lateral", 12.5, INK, "end", 700) +
    txt(xA - 14, yA - 4, "medial", 10.5, MUTE, "end") + txt(648, 246, "lateral", 10.5, MUTE) +
    txt(380, 284, "Apoyo bajo el pie · RC perpendicular al RI, centrado en las MTF de interés · RI 18 × 24 horiz. · DFRI 100 cm", 11, RED, "middle") +
    txt(380, 302, "Eje de los dedos alineado con la zona del RI que se expone", 11, MUTE, "middle")
  );
};

I["dedos-pie-lateral"] = () => {
  const m = limb({ ankle: [590, 130], legDir: 304, footDir: 180, s: 1.6, sg: -1 });
  const ifj = m.F([129, -39]);
  return svg(clip("cpDL") +
    view("Vista desde el tubo · lateral de dedos (detalle)") +
    riTop(250, 100, 290, 170, "") + txt(534, 264, "RI 18 × 24 horiz.", 12, INK, "end") +
    `<g clip-path="url(#cpDL)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    coll(f1(ifj[0] - 70), f1(ifj[1] - 40), 150, 80) +
    cross(ifj[0], ifj[1]) +
    note(ifj[0] - 6, ifj[1] - 12, 300, 56, ["RC perpendicular a la IF del 1.er dedo", "(IFP en los dedos 2.º a 5.º) · DFRI 100 cm"], RED, "end") +
    note(f1(ifj[0] - 70), f1(ifj[1] + 30), 230, 300, ["Colimar al dedo de interés"], AMB, "end") +
    txt(560, 230, "Dedos 1.º a 3.º: lateromedial", 12, INK, "start", 700) + txt(560, 246, "(1.er dedo abajo, contra el RI)", 11.5, INK) +
    txt(560, 270, "Dedos 4.º y 5.º: mediolateral", 12, INK, "start", 700) + txt(560, 286, "(1.er dedo arriba)", 11.5, INK) +
    txt(560, 312, "Separar los otros dedos con cinta o gasa", 11, MUTE)
  );
};

I["dedos-pie-tangencial-sesamoideos"] = () => {
  // decúbito prono: cara anterior de la pierna hacia la mesa, rodilla apoyada; pie casi vertical sobre los dedos en flexión dorsal
  const m = limb({ knee: [250, 222], legDir: 167.5, thighDir: 180, footDir: 72.5, s: 0.85, sg: -1, flexed: true, toeFlex: TF });
  const h = m.F([104, -47]);
  const p1 = m.F([-30, -43]), p2 = m.F([104, -47]);
  const u = [p2[0] - p1[0], p2[1] - p1[1]], n = Math.hypot(...u);
  const e1 = [p1[0] - u[0] / n * 30, p1[1] - u[1] / n * 30], e2 = [p2[0] + u[0] / n * 20, p2[1] + u[1] / n * 20];
  const ang = Math.atan2(u[0], u[1]) * 180 / Math.PI; // respecto de la vertical
  return svg(clip("cpDS") +
    view("Vista lateral · decúbito prono") +
    table(0, 760, 262) +
    ri(400, 250, 170, 12, "") + txt(410, 290, "RI 18 × 24 horiz.", 11.5, INK) +
    `<g clip-path="url(#cpDS)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    `<line x1="${f1(e1[0])}" y1="${f1(e1[1])}" x2="${f1(e2[0])}" y2="${f1(e2[1])}" stroke="${BLUE}" stroke-width="2"/>` +
    refline(f1(e1[0]), f1(e1[1]), f1(e1[0]), f1(e1[1] + 120)) +
    arco(e1[0], e1[1], 70, 90, 90 - ang) + txt(f1(e1[0] - 10), f1(e1[1] + 2), "Planta a 15-20°", 12.5, BLUE, "end", 700) + txt(f1(e1[0] - 10), f1(e1[1] + 17), "de la vertical", 11.5, BLUE, "end") +
    tube(h[0], h[1], 0, 150) +
    note(h[0] + 4, h[1] + 4, 640, 236, ["Cabeza del", "1.er MT"], RED) +
    note(h[0], 170, 642, 120, ["RC perpendicular,", "tangente a la", "cabeza del 1.er MT", "(angulado si falta", "flexión dorsal)"], RED) +
    txt(16, 290, "Pie y 1.er dedo en flexión dorsal, apoyados sobre el RI.", 11.5, INK, "start", 700) +
    txt(16, 306, "Alternativa en supino si hay mucho dolor: el paciente sostiene los dedos con una gasa · DFRI 100 cm", 11, MUTE)
  );
};
const TF = 70;

module.exports = I;
