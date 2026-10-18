// Esquemas de pierna, tobillo y pie en el estilo nuevo (contorno continuo color piel + huesos de referencia).
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, table, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, piel, linea, hueso, etiquetaHueso } = E;

// ---------- helpers propios ----------
const f1 = (n) => +n.toFixed(1);
// curva suave (Catmull-Rom → Bézier) que pasa por todos los puntos
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
// marco local: origen o, eje a (unitario), normal b; escala s
const frame = (o, a, b, s) => ([p, q]) => [o[0] + s * (p * a[0] + q * b[0]), o[1] + s * (p * a[1] + q * b[1])];
const clip = (id) => `<defs><clipPath id="${id}"><rect x="0" y="0" width="760" height="330"/></clipPath></defs>`;

// ---------- miembro inferior visto de costado (muslo + pierna + pie) ----------
// ankle: centro del tobillo (astrágalo). legDir: dirección tobillo→rodilla (grados SVG). footDir: talón→dedos.
// thighDir: rodilla→cadera. sg: 1 o -1 (espejo). s: escala. LL = largo de la pierna (330 a s=1).
const LL = 330, LT = 760;
function limb(o) {
  const { legDir, footDir, thighDir = legDir, s = 1, sg = 1, flexed = false } = o;
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
  // pliegues de los dedos
  const toes = linea(cr([[128, -27], [133, -36], [131, -45]].map(F)), 1.3) + linea(cr([[112, -22], [116, -32], [114, -46]].map(F)), 1.1);
  // huesos
  const H = (pts, M, extra) => hueso(cr(pts.map(M), true), extra);
  const B = {
    femur: H([[LT + 30, -14], [90, -14], [40, -26], [14, -32], [3, -20], [4, 8], [16, 22], [40, 12], [90, 11], [LT + 30, 11]], T),
    rotula: H([[44, 33], [30, 39], [10, 37], [5, 31], [18, 27], [34, 27]], T),
    tibia: H([[LL - 6, -26], [LL - 4, -4], [LL - 5, 18], [LL - 22, 24], [LL - 60, 16], [200, 14], [90, 14], [34, 15], [12, 16], [0, 8], [-3, 0], [4, -8], [8, -12], [40, -8], [130, -4], [LL - 70, -6], [LL - 30, -24]], L),
    perone: H([[LL - 24, -24], [LL - 26, -34], [LL - 40, -36], [LL - 50, -30], [LL - 70, -24], [150, -16], [60, -12], [24, -8], [6, -6], [-12, -10], [-8, -18], [14, -18], [60, -20], [150, -23], [LL - 74, -30]], L, `fill-opacity=".7"`),
    calcaneo: H([[-10, -14], [-24, -12], [-34, -22], [-34, -34], [-24, -41], [-6, -41], [14, -37], [28, -32], [28, -24], [10, -20]], F),
    astragalo: H([[-12, 0], [0, 7], [14, 4], [24, -2], [34, -4], [34, -12], [22, -15], [6, -18], [-8, -14]], F),
    tarso: H([[36, -2], [44, -5], [46, -14], [38, -16], [34, -10]], F) + H([[47, -6], [58, -10], [60, -20], [48, -20]], F) + H([[30, -26], [48, -24], [50, -34], [32, -36]], F),
    mt: H([[52, -26], [104, -39], [106, -44], [102, -46], [52, -35]], F) + H([[60, -11], [106, -30], [110, -36], [106, -39], [60, -20]], F),
    falanges: H([[112, -33], [128, -35], [128, -42], [112, -43]], F) + H([[131, -36], [145, -38], [145, -42], [131, -43]], F),
  };
  const huesos = B.femur + B.rotula + B.tibia + B.perone + B.calcaneo + B.astragalo + B.tarso + B.mt + B.falanges;
  return { d, toes, B, huesos, L, F, T, knee };
}

// ---------- pie visto desde la planta (dedos arriba, talón abajo) ----------
function planta(cx, cy, r = 0, s = 1, dash = false) {
  const P = ([x, y]) => { const v = rot([x * s, y * s], r); return [cx + v[0], cy + v[1]]; };
  const ex = dash ? `stroke-dasharray="5 4" fill-opacity=".35"` : "";
  const toes = [[-28, -78, 11, 14], [-6, -84, 7, 10], [10, -82, 6.5, 9], [24, -76, 6, 8], [36, -66, 5.5, 7]];
  const t = toes.map(([x, y, rx, ry]) => { const [X, Y] = P([x, y]); return `<ellipse cx="${f1(X)}" cy="${f1(Y)}" rx="${rx * s}" ry="${ry * s}" transform="rotate(${r} ${f1(X)} ${f1(Y)})" fill="${SK}" stroke="${SKO}" stroke-width="${dash ? 1.4 : 1.6}" ${ex}/>`; }).join("");
  const sole = [[-8, 94], [14, 88], [24, 62], [32, 10], [40, -34], [38, -56], [24, -66], [-4, -70], [-30, -66], [-40, -50], [-34, -14], [-26, 28], [-30, 62], [-26, 86]];
  return { svg: t + piel(cr(sole.map(P), true), ex), P };
}

// ---------- pie visto desde los dedos (para la oblicua) ----------
function pieFrontal(x0, y0, r) {
  const P = ([x, y]) => { const v = rot([x, y], r); return [x0 + v[0], y0 + v[1]]; };
  const circ = (x, y, rr, fill, st, w) => { const [X, Y] = P([x, y]); return `<circle cx="${f1(X)}" cy="${f1(Y)}" r="${rr}" fill="${fill}" stroke="${st}" stroke-width="${w}"/>`; };
  // pierna (por detrás del pie), con maléolos y rodilla flexionada arriba
  const leg = piel(cr([[30, -36], [20, -66], [26, -100], [20, -150], [24, -190], [42, -214], [80, -218], [108, -200], [116, -160], [118, -110], [114, -82], [124, -60], [118, -36]].map(P)) + " Z");
  const rodilla = linea(cr([[48, -196], [68, -204], [92, -196]].map(P)), 1.3);
  const body = piel(cr([[4, 0], [-2, -20], [6, -44], [30, -62], [70, -60], [110, -44], [140, -26], [152, -10], [148, 0], [76, 2]].map(P), true));
  const toes = [[22, -16, 17], [52, -12, 12], [76, -11, 11], [99, -10, 10], [121, -9, 9]].map(([x, y, rr]) => circ(x, y, rr, SK, SKO, 1.6) + linea(cr([[x - rr * 0.5, y - rr * 0.55], [x, y - rr * 0.8], [x + rr * 0.5, y - rr * 0.55]].map(P)), 1.1)).join("");
  const mtPos = [[24, -40, 9], [52, -45, 7], [78, -42, 6.5], [104, -34, 6], [128, -24, 5.5]];
  const mts = mtPos.map(([x, y, rr]) => circ(x, y, rr, "#ece4d4", "#8c7f6a", 1.3)).join("");
  return { svg: leg + rodilla + body + toes + mts, P };
}

const I = {};

// ======================= PIERNA =======================
I["Pierna|Frente · AP"] = () => {
  const m = limb({ ankle: [600, 206], legDir: 180, footDir: 270, s: 0.95 });
  const mid = m.L([LL / 2, 0]);
  const top = m.L([LL / 2, 23]);
  const fh = m.L([LL - 30, -40]), mm = m.L([-2, 4]), tb = m.L([170, 4]);
  return svg(clip("cpA") +
    view("Vista lateral · decúbito supino, pierna extendida") +
    table(0, 760, 252) +
    ri(255, 268, 400, 10, "RI 35 x 43", 664, 278) +
    `<g clip-path="url(#cpA)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    etiquetaHueso(tb[0] - 22, tb[1] + 4, "tibia", "end") +
    note(fh[0], fh[1], 240, 296, ["Cabeza del peroné"], INK, "end") +
    etiquetaHueso(m.L([110, -26])[0], m.L([110, -26])[1] + 16, "peroné", "middle") +
    note(mm[0], mm[1] + 4, 690, 236, ["Maléolos"], INK) +
    tube(top[0], top[1] - 2, 0, 140) +
    note(top[0], 110, 380, 70, ["RC perpendicular al", "punto medio de la pierna", "DFR 1 m (hasta 1,15-1,25 m)"], RED, "end") +
    note(m.F([100, -44])[0], m.F([100, -44])[1], 690, 120, ["Pie a 90°"], INK) +
    note(258, 273, 300, 312, ["Rodilla y tobillo a 3-5 cm del borde del RI"], INK) +
    txt(16, 52, "Cóndilos femorales paralelos al RI · sin rotación", 11.5, MUTE) + txt(16, 68, "Parrilla: no.", 11.5, MUTE)
  );
};

I["Pierna|Perfil"] = () => {
  // la pierna afectada apoyada; anterior hacia abajo (dedos abajo); la otra pierna por detrás (arriba), atenuada
  const m = limb({ ankle: [600, 140], legDir: 180, footDir: 90, s: 0.88, sg: -1 });
  const g = limb({ knee: [490, 72], legDir: 80, thighDir: 180, footDir: 352, s: 0.72, sg: -1, flexed: true });
  const mid = m.L([LL / 2, 0]);
  const fh = m.L([LL - 32, -40]);
  return svg(clip("cpB") +
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    riTop(250, 84, 400, 150, "RI 35 x 43", 256, 228) +
    `<g clip-path="url(#cpB)"><g opacity=".45">${piel(g.d)}</g>${piel(m.d)}${m.huesos}${m.toes}</g>` +
    txt(540, 60, "la otra pierna, por detrás", 11, MUTE) +
    coll(258, 92, 384, 134) + txt(258, 250, "incluir rodilla y tobillo", 11, AMB) +
    cross(mid[0], mid[1]) +
    note(mid[0] + 6, mid[1] + 10, 470, 300, ["RC perpendicular al punto medio de la pierna"], RED) +
    note(fh[0], fh[1], 230, 204, ["Cabeza del peroné"], INK, "end") +
    etiquetaHueso(m.L([210, 8])[0], m.L([210, 8])[1] + 4, "tibia", "middle") +
    etiquetaHueso(m.L([110, -30])[0], m.L([110, -30])[1] - 10, "peroné", "middle") +
    note(m.T([20, 30])[0], m.T([20, 30])[1], 220, 268, ["Rótula y cóndilos femorales", "perpendiculares al RI"], BLUE, "end")
  );
};

// ======================= TOBILLO =======================
I["Tobillo|Frente · AP (mortaja)"] = () => {
  const m = limb({ ankle: [462, 214], legDir: 180, footDir: 270, s: 0.86 });
  const j = m.L([2, 0]);
  const mm = m.L([0, 6]), ml = m.L([-10, -16]);
  // planta (desde los pies): neutra punteada y rotada 15° hacia medial
  const p0 = planta(668, 160, 0, 0.82, true);
  const p1 = planta(668, 160, -15, 0.82);
  const heel = p1.P([-8, 84]), ip = p1.P([32, -70]);
  return svg(clip("cpC") +
    view("Vista lateral · pierna extendida, pie a 90°") +
    table(0, 560, 252) +
    ri(400, 268, 120, 10, "RI 24 x 30", 412, 296) +
    `<g clip-path="url(#cpC)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    `<rect x="206" y="236" width="44" height="16" rx="4" fill="#d7dbe3" stroke="#8a8f9c"/>` + txt(228, 290, "apoyo bajo la rodilla", 11, MUTE, "middle") +
    etiquetaHueso(m.L([90, 4])[0], m.L([90, 4])[1] + 4, "tibia", "middle") +
    etiquetaHueso(m.L([90, -26])[0], m.L([90, -26])[1] + 14, "peroné", "middle") +
    note(m.F([4, -8])[0], m.F([4, -8])[1], 520, 236, ["astrágalo"], INK) +
    tube(j[0], j[1] - 8, 0, 150) +
    note(j[0], 110, 300, 60, ["RC perpendicular al punto medio", "entre ambos maléolos (mortaja)"], RED, "end") +
    note(mm[0] - 4, mm[1] - 4, 330, 166, ["Maléolos"], INK, "end") +
    `<line x1="575" y1="20" x2="575" y2="320" stroke="#e2e4ea"/>` +
    `<text x="588" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">PLANTA (DESDE LOS PIES)</text>` +
    p0.svg + p1.svg +
    refline(ip[0], 54, ip[0], 252) +
    `<rect x="590" y="252" width="160" height="10" fill="${INK}"/>` +
    `<path d="M700,66 Q680,56 660,60" fill="none" stroke="${BLUE}" stroke-width="1.6" marker-end="url(#arb)"/>` + txt(690, 40, "rotación", 11, BLUE) + txt(690, 52, "medial ≈15°", 11, BLUE) +
    txt(588, 282, "Línea 4.º-5.º dedo → talón", 11.5, BLUE, "start", 700) +
    txt(588, 296, "queda vertical, ⟂ al RI", 11.5, BLUE) +
    txt(588, 312, "punteado: pie sin rotar", 10.5, MUTE)
  );
};

I["Tobillo|Perfil"] = () => {
  const m = limb({ ankle: [436, 214], legDir: 180, footDir: 270, s: 1.0 });
  const mm = m.L([0, 6]);
  return svg(clip("cpD") +
    view("Vista desde el tubo · decúbito lateral, borde externo apoyado") +
    riTop(330, 54, 230, 240, "RI 24 x 30", 336, 286) +
    `<g clip-path="url(#cpD)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    coll(344, 62, 176, 214) + txt(350, 48, "mitad proximal de los MT + tibia y peroné distales", 11, AMB) +
    cross(mm[0], mm[1]) +
    note(mm[0] + 12, mm[1] + 4, 580, 226, ["RC perpendicular,", "incide en el maléolo medial"], RED) +
    (() => { const c = m.L([30, 21]); return `<path d="M${f1(c[0] - 34)},${f1(c[1])} A34,34 0 0 1 ${f1(c[0])},${f1(c[1] - 34)}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(f1(c[0] - 30), f1(c[1] - 30), "90°", 12, BLUE, "end", 700); })() +
    note(m.F([96, -10])[0], m.F([96, -10])[1], 580, 96, ["Pie en flexión dorsal:", "planta a 90° con la pierna"], BLUE) +
    note(m.F([18, -2])[0], m.F([18, -2])[1], 580, 150, ["astrágalo"], INK) +
    note(m.F([-20, -32])[0], m.F([-20, -32])[1], 580, 278, ["calcáneo"], INK) +
    etiquetaHueso(m.L([170, 4])[0], m.L([170, 4])[1] + 4, "tibia", "middle") +
    etiquetaHueso(m.L([170, -26])[0], m.L([170, -26])[1] + 16, "peroné", "middle") +
    txt(16, 270, "← rodilla", 11, MUTE) +
    txt(16, 306, "Articulación del tobillo alineada con el RC y con el eje del RI.", 11.5, MUTE)
  );
};

// ======================= PIE =======================
I["Pie|Frente · AP"] = () => {
  const m = limb({ ankle: [530, 213], legDir: 250, footDir: 0, s: 1.0 });
  const b3 = m.F([58, -24]);
  const mt = m.F([86, -38]), ph = m.F([136, -38]), ca = m.F([-22, -32]);
  return svg(clip("cpE") +
    view("Vista lateral · rodilla flexionada, planta apoyada en el RI") +
    table(0, 760, 268) +
    ri(470, 256, 236, 12, "RI 24 x 30 long.", 470, 296) +
    `<g clip-path="url(#cpE)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    dot(b3[0], b3[1], RED) +
    tube(b3[0], b3[1] - 4, -12, 190, { angLabel: "10-15°" }) +
    note(b3[0] + 12, 130, 380, 76, ["RC angulado 10-15° hacia el talón", "incide en la base del 3.er MT"], RED, "end") +
    txt(380, 128, "Compensa el arco de los MT.", 11.5, MUTE, "end") + txt(380, 144, "Cuerpo extraño: no se angula.", 11.5, MUTE, "end") +
    note(b3[0] - 2, b3[1] + 6, 560, 318, ["Base del 3.er MT"], RED, "end") +
    note(mt[0], mt[1], 640, 300, ["metatarsianos"], INK) +
    note(ph[0], ph[1], 704, 228, ["falanges"], INK) +
    note(ca[0], ca[1], 440, 300, ["calcáneo (talón)"], INK, "end") +
    etiquetaHueso(m.L([110, 4])[0] + 2, m.L([110, 4])[1], "tibia", "middle")
  );
};

I["Pie|Oblicua"] = () => {
  const x0 = 420, y0 = 248, R = -35;
  const f = pieFrontal(x0, y0, R);
  const mt3 = f.P([78, -42]);
  const lat = f.P([152, -2]);
  const la = f.P([160, 18]), me = f.P([-6, 10]);
  const rx = x0 + 150 * Math.cos(deg(35)), ry = y0 - 150 * Math.sin(deg(35));
  return svg(
    view("Vista desde los dedos · planta inclinada respecto al RI") +
    table(200, 720, 260, "") +
    ri(270, 248, 330, 12, "RI", 608, 258) +
    f.svg +
    `<circle cx="${f1(mt3[0])}" cy="${f1(mt3[1])}" r="9" fill="none" stroke="${RED}" stroke-width="2"/>` +
    `<line x1="${x0}" y1="${y0}" x2="${f1(x0 + 200 * Math.cos(deg(35)))}" y2="${f1(y0 - 200 * Math.sin(deg(35)))}" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
    `<path d="M${x0 + 150},${y0} A150,150 0 0 0 ${f1(rx)},${f1(ry)}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(584, 222, "30-40°", 14, BLUE, "start", 700) +
    txt(x0 - 12, y0 - 6, "medial", 11, MUTE, "end") + txt(f1(la[0]), f1(la[1]) + 4, "lateral", 11, MUTE) +
    tube(mt3[0], mt3[1] - 10, 0, 140) +
    note(mt3[0], 110, 530, 64, ["RC perpendicular al RI", "en la base del 3.er MT"], RED) +
    note(f.P([128, -24])[0] + 4, f.P([128, -24])[1] - 2, 600, 150, ["Metatarsianos"], INK) +
    etiquetaHueso(600, 168, "(1.º a 5.º, vistos de frente)") +
    note(f.P([22, -16])[0] - 14, f.P([22, -16])[1] + 6, 300, 214, ["Dedo gordo"], INK, "end") +
    note(f.P([70, -150])[0] - 30, f.P([70, -150])[1], 220, 110, ["Pierna inclinada", "hacia medial"], INK, "end") +
    txt(40, 300, "Rotar el pie hacia medial: borde medial sobre el RI, borde lateral elevado.", 12, INK, "start", 700) +
    txt(40, 316, "Bóveda alta → cerca de 45° · pie plano → cerca de 30°. Colimar todo el pie.", 11.5, MUTE)
  );
};

I["Pie|Perfil"] = () => {
  // espejado: dedos a la izquierda, pierna hacia arriba a la derecha
  const m = limb({ ankle: [500, 200], legDir: 304, footDir: 180, s: 1.0, sg: -1 });
  const b3 = m.F([58, -24]);
  const mt = m.F([90, -36]), ca = m.F([-24, -30]), as = m.F([10, 0]), lat = m.F([130, -46]);
  return svg(clip("cpF") +
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    riTop(300, 110, 290, 176, "RI 24 x 30", 306, 280) +
    `<g clip-path="url(#cpF)">${piel(m.d)}${m.huesos}${m.toes}</g>` +
    coll(316, 126, 256, 140) + txt(316, 302, "todo el pie + 2-3 cm del tobillo", 11, AMB) +
    cross(b3[0], b3[1]) +
    note(b3[0] - 8, b3[1] - 8, 290, 70, ["RC perpendicular en la base del 3.er MT"], RED, "end") +
    note(m.L([130, 30])[0] + 2, m.L([130, 30])[1], 290, 150, ["Rodilla flexionada,", "pierna no afectada hacia atrás"], INK, "end") +
    note(lat[0], lat[1] + 2, 250, 296, ["Borde lateral apoyado:", "5.º dedo sobre el RI"], INK, "end") +
    note(mt[0], mt[1], 150, 210, ["metatarsianos"], INK, "end") +
    note(ca[0], ca[1], 610, 250, ["calcáneo"], INK) +
    note(as[0], as[1], 610, 200, ["astrágalo"], INK)
  );
};

module.exports = I;
