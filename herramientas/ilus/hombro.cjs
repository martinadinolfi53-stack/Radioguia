// Esquemas de cintura escapular y húmero (clavícula, escápula, hombro, acromioclaviculares, húmero).
// Estilo aprobado: persona = contorno continuo color piel; huesos de referencia "por transparencia".
// Helpers copiados/adaptados de referencia-tecnicas1-superior.cjs y referencia-tecnicas1-columna.cjs.
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONEO, table, wall, ri, riTop, beam, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, mk, cabezaPerfil, cabezaFrente } = E;

// ---------- helpers ----------
const f1 = (n) => +(+n).toFixed(1);
const P = (pts) => pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" L");
const rad = (d) => (d * Math.PI) / 180;
const lab = (px, py, tx, ty, t, anchor = "start") =>
  `<line x1="${px}" y1="${py}" x2="${anchor === "start" ? tx - 3 : tx + 3}" y2="${ty - 4}" stroke="${BONEO}" stroke-width=".8"/>` + etiquetaHueso(tx, ty, t, anchor);
const circ = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
const azul = (px, py, tx, ty, t, anchor = "middle") =>
  txt(tx, ty, t, 11, BLUE, anchor) + `<line x1="${tx}" y1="${ty + 4}" x2="${px}" y2="${py}" stroke="${BLUE}" stroke-width="1"/>`;
const panelSep = (title) => `<line x1="388" y1="14" x2="388" y2="322" stroke="#e2e4ea"/>` +
  `<text x="402" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
const g = (tr, inner) => `<g transform="${tr}">${inner}</g>`;
// línea de cota azul con rótulo
const cota = (x1, y1, x2, y2, t, tx, ty, anchor = "middle") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="4 3"/>` + txt(tx, ty, t, 11, BLUE, anchor, 700);
const arcoAzul = (cx, cy, r, a1, a2, label, lx, ly) => {
  const p1 = [cx + r * Math.cos(rad(a1)), cy + r * Math.sin(rad(a1))], p2 = [cx + r * Math.cos(rad(a2)), cy + r * Math.sin(rad(a2))];
  return `<path d="M${f1(p1[0])},${f1(p1[1])} A${r},${r} 0 0 ${a2 > a1 ? 1 : 0} ${f1(p2[0])},${f1(p2[1])}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(lx, ly, label, 12, BLUE, "middle", 700);
};

function boneAlong(p1, p2, perfil) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const a = perfil.map(([t, h]) => [p1[0] + dx * t + nx * h, p1[1] + dy * t + ny * h]);
  const b = perfil.map(([t, , h]) => [p1[0] + dx * t - nx * h, p1[1] + dy * t - ny * h]).reverse();
  const cap = (q1, q2, sign) => {
    const k = Math.hypot(q1[0] - q2[0], q1[1] - q2[1]) * 0.35;
    return `Q${f1((q1[0] + q2[0]) / 2 + sign * ux * k)},${f1((q1[1] + q2[1]) / 2 + sign * uy * k)} ${f1(q2[0])},${f1(q2[1])}`;
  };
  return hueso(`M${P(a)} ${cap(a[a.length - 1], b[0], 1)} L${P(b)} ${cap(b[b.length - 1], a[0], -1)} Z`);
}
function tip(x1, x2, y) {
  const r = (x2 - x1) / 2, c = (x1 + x2) / 2, out = [];
  for (let i = 0; i <= 6; i++) { const a = Math.PI - (i * Math.PI) / 6; out.push([c + r * Math.cos(a), y + r * Math.sin(a)]); }
  return out;
}
function handLocal(tipo) {
  if (tipo === "canto") {
    const pts = [[-10, 0], [-13, 8], [-14.5, 16], [-13, 24], [-12, 34], [-12, 44], ...tip(-12, -3, 44), [-2.5, 40], ...tip(-3, 3.5, 41).slice(1), [3.5, 37], ...tip(3.5, 8.5, 37).slice(1), [8.5, 33], ...tip(8.5, 11.5, 33).slice(1), [11, 18], [10, 0]];
    const det = [`M-4,4 C-10,12 -10,26 -4,33 C1,36 5,30 5,9`, `M-2.5,29.5 Q0,27.5 3,29.5`, `M-12,36 Q-4,38 0,35`];
    return { pts, det };
  }
  const pts = [[-10, 0], [-11, 5], [-17, 13], [-22, 21], [-23.5, 26], ...tip(-24, -18, 27).slice(1, 6), [-16, 24], [-12.5, 21],
    [-12, 27], [-12, 49], ...tip(-12, -6.5, 49), [-6.2, 30], [-6, 52], ...tip(-6, 0, 52), [0.2, 30], [0.5, 50], ...tip(0.5, 6, 50),
    [6.2, 30], [6.5, 43], ...tip(6.5, 11.5, 43), [11.5, 20], [10, 0]];
  const det = tipo === "palma"
    ? [`M-8,20 Q-2,24 9,19`, `M-7,9 Q-10,16 -11,24`]
    : [`M-10.8,46 Q-9.2,44 -7.6,46`, `M-4.8,49 Q-3,47 -1.2,49`, `M1.4,47 Q3.2,45 5,47`, `M7.4,40 Q9,38 10.6,40`, `M-22,23 Q-20.5,21 -19,23`];
  return { pts, det };
}
function mano(cx, cy, ang, s, tipo, espejo = false, invertir = false) {
  const { pts, det } = handLocal(tipo);
  const T = mk(s, 0, 0, cx, cy, ang - 90, espejo);
  let p = pts.map(([x, y]) => T(x, y));
  if (invertir) p = p.reverse();
  const detS = det.map((d) => linea(d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => T(+x, +y)), 1.3)).join("");
  return { seg: "L" + p.join(" L"), det: detS, a: p[0], b: p[p.length - 1] };
}
// unión de piezas de piel (paths, segmentos [x1,y1,x2,y2,w], círculos [cx,cy,r]) con un solo contorno continuo
function union(parts) {
  const o = [], f = [];
  for (const p of parts) {
    if (typeof p === "string") {
      o.push(`<path d="${p}" fill="${SKO}" stroke="${SKO}" stroke-width="3" stroke-linejoin="round"/>`);
      f.push(`<path d="${p}" fill="${SK}"/>`);
    } else if (p.length === 3) {
      o.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${p[2] + 1.5}" fill="${SKO}"/>`);
      f.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${p[2]}" fill="${SK}"/>`);
    } else {
      const [x1, y1, x2, y2, w] = p.map(f1);
      o.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SKO}" stroke-width="${w + 3}" stroke-linecap="round"/>`);
      f.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SK}" stroke-width="${w}" stroke-linecap="round"/>`);
    }
  }
  return o.join("") + f.join("");
}
// cabeza vista desde atrás (PA): orejas, nuca, remolino
function cabezaAtras(cx, cy, r = 24) {
  return `<ellipse cx="${cx - r * 0.98}" cy="${cy}" rx="${r * 0.16}" ry="${r * 0.28}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${cx + r * 0.98}" cy="${cy}" rx="${r * 0.16}" ry="${r * 0.28}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.92}" ry="${r * 1.12}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
    linea(`M${cx - r * 0.62},${cy + r * 0.72} Q${cx},${cy + r * 0.92} ${cx + r * 0.62},${cy + r * 0.72}`, 1.3) +
    linea(`M${cx - 3},${cy - r * 0.55} C${cx + 6},${cy - r * 0.7} ${cx + 8},${cy - r * 0.3} ${cx + 2},${cy - r * 0.3} C${cx - 4},${cy - r * 0.28} ${cx - 4},${cy - r * 0.5} ${cx},${cy - r * 0.48}`, 1.2);
}

// ---------- persona de frente (o de espaldas) con brazos configurables ----------
// Coordenadas base: cx = línea media, cuello y 72-90, articulación del hombro en (cx ∓ 78, 126); dy baja todo.
// o.R / o.L = { ang: [ángulo brazo, ángulo antebrazo] (grados SVG), mano: "palma"|"dorso"|"canto", esp }.
// De frente el lado derecho del paciente queda a la izquierda del dibujo; de espaldas (back), a la derecha.
const SCAP = "M215,114 L228,106 L258,104 L266,106 L258,146 L248,192 L241,190 L226,146 L217,134 Z";
const ACRO = "M258,102 L212,96 C204,96 197,100 195,107 L204,108 L213,103 L258,107 Z";
const CORA = "M228,106 C223,110 219,116 220,123 L225,123 C225,116 229,112 235,109 Z";
const CLAV = "M270,96 C256,90 238,102 214,94 L212,100 C238,108 256,96 270,102 Z";
let clipN = 0;
function frontal(o = {}) {
  const cx = o.cx ?? 280, dy = o.dy ?? 0, back = !!o.back, bottom = o.bottom ?? 316;
  const Y = (y) => f1(y + dy);
  const tor = `M${cx - 12},${Y(72)} L${cx - 12},${Y(90)} C${cx - 26},${Y(96)} ${cx - 48},${Y(98)} ${cx - 66},${Y(102)} C${cx - 82},${Y(106)} ${cx - 92},${Y(116)} ${cx - 92},${Y(130)} C${cx - 92},${Y(140)} ${cx - 78},${Y(146)} ${cx - 60},${Y(152)} L${cx - 58},${Y(200)} L${cx - 58},${bottom} L${cx + 58},${bottom} L${cx + 58},${Y(200)} L${cx + 60},${Y(152)} C${cx + 78},${Y(146)} ${cx + 92},${Y(140)} ${cx + 92},${Y(130)} C${cx + 92},${Y(116)} ${cx + 82},${Y(106)} ${cx + 66},${Y(102)} C${cx + 48},${Y(98)} ${cx + 26},${Y(96)} ${cx + 12},${Y(90)} L${cx + 12},${Y(72)} Z`;
  const parts = [tor], bones = [], dets = [], info = {};
  for (const lado of ["R", "L"]) {
    const a = o[lado];
    const sg = (lado === "R") !== back ? -1 : 1;
    const X = (x) => cx - sg * (x - 280);
    const tp = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${f1(X(+x))},${f1(+y + dy)}`);
    const S = [cx + sg * 78, 126 + dy];
    bones.push(hueso(tp(SCAP)) + hueso(tp(ACRO)) + hueso(tp(CORA)) + hueso(tp(CLAV)));
    info[lado] = { S, X, tp, sg, Y: (y) => y + dy };
    if (!a) continue;
    const [a1, a2] = a.ang, L1 = a.l1 ?? 78, L2 = a.l2 ?? 54;
    const El = [S[0] + L1 * Math.cos(rad(a1)), S[1] + L1 * Math.sin(rad(a1))];
    const W = [El[0] + L2 * Math.cos(rad(a2)), El[1] + L2 * Math.sin(rad(a2))];
    parts.push([...S, ...El, 25], [...El, ...W, 19]);
    const m = mano(f1(W[0]), f1(W[1]), a2, 1.0, a.mano || "palma", !!a.esp, false);
    parts.push(`M${m.a} ${m.seg} Z`);
    dets.push(m.det);
    const H0 = [S[0] + 7 * Math.cos(rad(a1)), S[1] + 7 * Math.sin(rad(a1))];
    const ep = a.epi ?? 8;
    bones.push(boneAlong(H0, El, [[0, 5.5, 5.5], [0.74, 5.5, 5.5], [0.88, ep, ep], [0.97, ep - 2, ep - 2], [1, 6.5, 6.5]]) + hueso(circ(f1(S[0]), f1(S[1] - 1), 12)));
    const n = [-Math.sin(rad(a2)), Math.cos(rad(a2))];
    const off = (p, k) => [p[0] + n[0] * k, p[1] + n[1] * k];
    bones.push(boneAlong(off(El, 4.5), off(W, 4.5), [[0, 4, 4], [0.1, 3, 3], [0.9, 3, 3], [1, 4, 4]]) + boneAlong(off(El, -4.5), off(W, -4.5), [[0, 3.5, 3.5], [0.1, 2.5, 2.5], [0.85, 3, 3], [1, 5, 5]]));
    Object.assign(info[lado], { E: El, W, mid: [(S[0] + El[0]) / 2, (S[1] + El[1]) / 2] });
  }
  const cabeza = back ? cabezaAtras(cx, 44 + dy, 26) : cabezaFrente(cx, 44 + dy, 26);
  let draw = union(parts) + bones.join("") + dets.join("") + cabeza;
  if (o.clip !== null) { const id = "fc" + (++clipN); draw = `<clipPath id="${id}"><rect x="0" y="0" width="760" height="${o.clip ?? 318}"/></clipPath><g clip-path="url(#${id})">${draw}</g>`; }
  return { draw, info, cx, dy };
}

// ---------- hombro de frente (silueta del ejemplo aprobado, brazo derecho a la izquierda) ----------
function hombroFig(rotacion) {
  const cfg = {
    neutro: { mano: "canto", esp: false, epi: [7, 8], rad: [[186, 214], [185, 254]] },
    externo: { mano: "palma", esp: false, epi: [11, 12], rad: [[186, 214], [179, 254]] },
    interno: { mano: "dorso", esp: true, epi: [4.5, 5.5], rad: [[186, 214], [195, 254]] },
  }[rotacion];
  const m = mano(185, 255, 98.7, 1.0, cfg.mano, cfg.esp, cfg.esp);
  const cuerpo = `M268,72 L268,90 C254,96 232,98 214,102 C198,106 187,116 186,130 L182,168 L178,206 L175,254 ${m.seg} L195,256 L206,208 L212,168 L220,146 L222,200 L222,316 L338,316 L338,200 L340,146 L346,168 L350,240 L352,316 L382,316 L378,240 L376,168 L374,130 C373,116 362,106 346,102 C328,98 306,96 292,90 L292,72 Z`;
  const [lat, med] = cfg.epi;
  const humero = boneAlong([202, 132], [192, 212], [[0, 5.5, 5.5], [0.74, 5.5, 5.5], [0.88, lat, med], [0.97, lat - 2, med - 2], [1, 6.5, 6.5]]);
  const [r1, r2] = cfg.rad;
  const huesos =
    hueso(SCAP) + hueso(ACRO) + humero + hueso(circ(202, 124, 12)) +
    boneAlong([198, 214], [191, 254], [[0, 4, 4], [0.1, 3, 3], [0.9, 3, 3], [1, 4, 4]]) +
    boneAlong(r1, r2, [[0, 3.5, 3.5], [0.1, 2.5, 2.5], [0.85, 3, 3], [1, 5, 5]]) +
    hueso(CORA) + hueso(CLAV) +
    hueso(`M290,96 C304,90 322,102 346,94 L348,100 C322,108 304,96 290,102 Z`);
  const epiMark = rotacion === "interno"
    ? `<circle cx="194" cy="203" r="6.5" fill="none" stroke="${BLUE}" stroke-width="2"/>`
    : rotacion === "externo" ? refline(176, 201, 212, 205) : "";
  return piel(cuerpo) + huesos + m.det + cabezaFrente(280, 44, 26) + epiMark;
}

// ---------- persona de pie vista de costado, mirando a la derecha ----------
function costado(dx, conBrazo = true) {
  const h = cabezaPerfil(436 + dx, 80, { s: 0.3, rot: 90 });
  const X = (x) => x + dx;
  const d = h.d + ` L${X(454)},132 C${X(468)},138 ${X(490)},146 ${X(496)},172 L${X(498)},210 C${X(498)},240 ${X(492)},262 ${X(494)},290 L${X(496)},316 L${X(426)},316 L${X(424)},290 C${X(420)},260 ${X(420)},180 ${X(422)},150 C${X(424)},140 ${X(428)},134 ${X(430)},124 L${X(434)},96 Z`;
  const brazo = conBrazo ? linea(`M${X(442)},176 C${X(440)},152 ${X(450)},138 ${X(462)},137 C${X(476)},138 ${X(482)},152 ${X(478)},176 L${X(476)},250 L${X(474)},316 M${X(442)},176 L${X(444)},250 L${X(446)},316`) : "";
  const huesos =
    hueso(`M${X(432)},136 L${X(444)},140 L${X(449)},150 L${X(446)},172 L${X(440)},214 L${X(432)},213 L${X(429)},170 Z`) +
    hueso(`M${X(431)},141 L${X(452)},132 L${X(470)},132 L${X(471)},138 L${X(452)},139 Z`) +
    boneAlong([X(459), 150], [X(459), 232], [[0, 6, 6], [0.1, 6, 6], [0.9, 6, 6], [1, 8, 8]]) +
    hueso(circ(X(459), 152, 11)) +
    hueso(`M${X(449)},147 C${X(460)},143 ${X(472)},145 ${X(479)},151 L${X(477)},156 C${X(468)},152 ${X(458)},152 ${X(449)},154 Z`) +
    hueso(`M${X(464)},130 C${X(474)},129 ${X(482)},136 ${X(488)},146 L${X(485)},150 C${X(479)},141 ${X(472)},136 ${X(464)},136 Z`);
  return { piel: piel(d), cara: h.cara, brazo, huesos, X };
}
// panel derecho: de costado con la espalda contra el RI (pared a la izquierda, tubo a la derecha)
const costadoEspalda = (c) => wall(418, 44, 300, "") + txt(424, 38, "Bucky / RI", 10, MUTE, "middle") + c.piel + c.huesos + c.brazo + c.cara;
// panel derecho: de costado mirando al RI (pared a la derecha, tubo detrás)
const costadoFrente = (c) => wall(706, 44, 300, "") + txt(712, 38, "Bucky / RI", 10, MUTE, "middle") + c.piel + c.huesos + c.brazo + c.cara;

// ---------- vista superior del paciente rotado contra el Bucky ----------
// ap = false: oblicua anterior (mira al RI, haz PA). ap = true: oblicua posterior (espalda al RI, haz AP).
// En coordenadas locales (convención PA) el hombro afectado (derecho) es (-100,0) y la nariz va hacia +y.
function superior(rotDeg, { ap = false, brazo = false } = {}) {
  const cx = ap ? 250 : 236;
  const r = rad(ap ? rotDeg : -rotDeg), c = Math.cos(r), s = Math.sin(r);
  const cy = ap ? 252 - 100 * s : 252 + 100 * s;
  const T = (x, y) => { const [px, py] = ap ? [-x, -y] : [x, y]; return [cx + px * c - py * s, cy + px * s + py * c]; };
  const Ts = (x, y) => T(x, y).map(f1).join(",");
  const angT = ap ? rotDeg + 180 : -rotDeg; // rotación total aplicada a las piezas locales
  let d = `M${P([[-58, -36], [0, -38], [58, -36], [84, -30], [98, -18], [101, 2], [99, 22]].map(([x, y]) => T(x, y)))}`;
  let det = "";
  if (brazo) {
    const ms = mano(...T(84, 66), 90 + angT, 0.9, "dorso", true, true);
    d += ` L${Ts(98, 66)} ${ms.seg} L${Ts(70, 66)} L${Ts(70, 36)}`;
    det = ms.det;
  } else d += ` L${Ts(92, 30)}`;
  d += ` L${P([[40, 38], [0, 40], [-58, 36], [-86, 28], [-99, 14], [-101, -8], [-90, -26]].map(([x, y]) => T(x, y)))} Z`;
  const [hx, hy] = T(0, 2), nose = [T(-7, 21), T(0, 36), T(7, 21)];
  const ear = (x) => { const [ex, ey] = T(x, 4).map(f1); return `<ellipse cx="${ex}" cy="${ey}" rx="4.5" ry="7" transform="rotate(${f1(angT)} ${ex} ${ey})" fill="${SK}" stroke="${SKO}" stroke-width="1.5"/>`; };
  const cabeza = ear(-23) + ear(23) + `<path d="M${P(nose)} Z" fill="${SK}" stroke="${SKO}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="23" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
    `<path d="M${P([T(-6, 22), T(0, 33), T(6, 22)])}" fill="${SK}" stroke="none"/>` + linea(`M${P([T(-6, 22.5), T(0, 35), T(6, 22.5)])}`, 1.6) +
    linea(`M${Ts(-3, -6)} C${Ts(6, -10)} ${Ts(8, 0)} ${Ts(2, 1)} C${Ts(-4, 2)} ${Ts(-4, -4)} ${Ts(0, -4)}`, 1.2);
  const huesos =
    hueso(`M${P([[-74, -6], [-66, -12], [-38, -36], [-32, -32], [-62, -4], [-70, 4]].map(([x, y]) => T(x, y)))} Z`) +
    hueso(`M${P([[-88, -10], [-60, 12], [-30, 24], [-6, 30], [-6, 35], [-32, 30], [-62, 18], [-90, -4]].map(([x, y]) => T(x, y)))} Z`) +
    hueso(circ(...T(-84, 2).map(f1), 11));
  return { piel: piel(d), cabeza, huesos, det, T };
}
// panel izquierdo: vista superior con el ángulo de rotación y el haz (vertical en el dibujo)
function topPanel(rotDeg, { ap = false, brazo = false, beamLocal = [-80, -2], angLabel, haz }) {
  const v = superior(rotDeg, { ap, brazo });
  const [bx, by] = v.T(...beamLocal).map(f1);
  const cont = v.T(-100, 0).map(f1), otro = v.T(100, 0);
  const u = [otro[0] - cont[0], otro[1] - cont[1]], L = Math.hypot(...u);
  const sx = Math.sign(u[0]), arcR = 104;
  const a2 = [f1(cont[0] + arcR * u[0] / L), f1(cont[1] + arcR * u[1] / L)];
  const sweep = sx > 0 ? 0 : 1;
  const lx = f1(cont[0] + sx * (arcR + 8));
  const sc = v.T(-52, -20).map(f1), hh = v.T(-90, 8).map(f1), nz = v.T(0, 36).map(f1);
  const labX = ap ? 372 : 112, labA = ap ? "end" : "end";
  return view("1 · Vista superior (desde arriba)") +
    `<rect x="30" y="252" width="330" height="12" fill="#cfd3dc"/>` + txt(36, 280, "Bucky vertical (RI)", 11, MUTE) +
    `<path d="M${cont[0] + sx * arcR},252 A${arcR},${arcR} 0 0 ${sweep} ${a2[0]},${a2[1]}" fill="none" stroke="${BLUE}" stroke-width="1.8"/>` +
    v.piel + v.huesos + v.det + v.cabeza +
    `<line x1="${cont[0]}" y1="${cont[1]}" x2="${f1(cont[0] + 60 * u[0] / L)}" y2="${f1(cont[1] + 60 * u[1] / L)}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 4"/>` +
    txt(sx > 0 ? lx : lx, 240, angLabel, 13, BLUE, sx > 0 ? "start" : "end", 700) +
    (ap
      ? ""
      : lab(sc[0], sc[1], labX, 150, "escápula", labA) + lab(hh[0], hh[1], labX, 232, "cabeza humeral", labA)) +
    txt(nz[0] + 4, nz[1] + (ap ? -4 : 10), "nariz", 10, MUTE) +
    `<line x1="${bx}" y1="40" x2="${bx}" y2="${f1(by - 8)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` + txt(bx + 8, 52, haz, 11.5, RED, "start", 700);
}

// ---------- persona de frente apoyada de costado contra el Bucky (laterales transtorácicas) ----------
function transtoracica(target, rcTxt, extra) {
  const F = frontal({ cx: 300, dy: 70, R: { ang: [94, 94], mano: "canto" }, L: { ang: [-84, -94], mano: "palma", esp: true } });
  const R = F.info.R;
  const tgt = target(R);
  return svg(
    view("Vista de frente · lado afectado contra el RI") +
    `<rect x="186" y="60" width="12" height="250" fill="#cfd3dc"/>` + txt(192, 54, "Bucky / RI", 10, MUTE, "middle") +
    F.draw +
    beam(tgt[0], tgt[1], 180, 250, { ref: 180 }) +
    `<circle cx="${tgt[0]}" cy="${tgt[1]}" r="4" fill="${RED}"/>` +
    side(150, 128, "D") + txt(96, 152, "lado afectado", 10.5, MUTE) +
    extra(F, tgt) +
    rcTxt
  );
}

const I = {};

// ======================= HÚMERO =======================
function humeroFrente(perfil) {
  const elbow = [196, 202];
  const wr = perfil ? [210, 262] : [176, 262];
  const v = [wr[0] - elbow[0], wr[1] - elbow[1]], L = Math.hypot(...v), nn = [v[1] / L, -v[0] / L];
  const ang = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
  const m = mano(wr[0], wr[1], ang, 1.0, perfil ? "dorso" : "palma", perfil, perfil);
  const wA = [wr[0] - nn[0] * 10, wr[1] - nn[1] * 10], wB = [wr[0] + nn[0] * 10, wr[1] + nn[1] * 10];
  const d = `M288,74 L288,92 C274,98 254,100 238,104 C224,108 214,116 212,128 L198,160 L184,196 L${P([wA])} ${m.seg} L${P([wB])} L208,206 L226,170 L244,148 L248,220 L246,318 L354,318 L352,220 L356,148 L364,180 L368,318 L394,318 L390,200 L388,150 C386,122 376,108 362,104 C346,100 326,98 312,92 L312,74 Z`;
  const humero = boneAlong([230, 130], [197, 202], perfil
    ? [[0, 5.5, 5.5], [0.78, 5.5, 5.5], [0.9, 6, 7], [0.97, 5, 6], [1, 6, 6]]
    : [[0, 5.5, 5.5], [0.78, 5.5, 5.5], [0.9, 12, 12], [0.97, 9, 9], [1, 7, 7]]);
  const forearm = perfil
    ? boneAlong([201, 205], [210, 262], [[0, 4, 4], [0.1, 3, 3], [0.9, 3, 3], [1, 4, 4]]) + boneAlong([191, 204], [219, 260], [[0, 3.5, 3.5], [0.1, 2.5, 2.5], [0.85, 3, 3], [1, 5, 5]])
    : boneAlong([201, 205], [181, 263], [[0, 4, 4], [0.1, 3, 3], [0.9, 3, 3], [1, 4, 4]]) + boneAlong([191, 201], [171, 260], [[0, 3.5, 3.5], [0.1, 2.5, 2.5], [0.85, 3, 3], [1, 5, 5]]);
  const huesos =
    hueso(`M243,112 L256,104 L284,102 L292,104 L284,144 L274,192 L267,190 L254,146 L245,132 Z`) +
    hueso(`M284,100 L238,94 C230,94 223,98 221,105 L230,106 L239,101 L284,105 Z`) +
    humero + hueso(circ(230, 121, 12)) + forearm +
    hueso(`M296,94 C282,88 264,100 240,92 L238,98 C264,106 282,94 296,100 Z`) +
    hueso(`M304,94 C318,88 336,100 360,92 L362,98 C336,106 318,94 304,100 Z`);
  return { piel: piel(d), huesos, det: m.det, cabeza: cabezaFrente(300, 52, 23) };
}
const humeroComun = (h, riLabel) =>
  riTop(116, 46, 190, 272, riLabel, 122, 62) +
  h.piel + h.huesos + h.det + h.cabeza +
  side(60, 70, "D") + txt(30, 96, "lado derecho", 10.5, MUTE) + txt(30, 108, "del paciente", 10.5, MUTE) +
  coll(158, 80, 116, 150) + cross(213, 166) +
  lab(222, 114, 204, 100, "cabeza humeral", "end") + lab(208, 150, 190, 142, "húmero", "end");

I["humero-ap"] = () => {
  const h = humeroFrente(false);
  return svg(
    view("Vista desde el tubo · de pie o decúbito supino") +
    humeroComun(h, "RI 35 x 43 vertical") +
    refline(180, 189, 216, 205) + dot(187, 192) + dot(210, 202) +
    lab(176, 236, 156, 240, "radio", "end") + lab(188, 246, 200, 254, "cúbito") +
    note(224, 166, 420, 100, ["RC perpendicular, en la parte", "media del húmero"], RED) +
    note(216, 205, 420, 162, ["Epicóndilos paralelos al RI"], BLUE) +
    note(170, 296, 420, 204, ["Brazo un poco separado y mano", "supinada (AP verdadera)"]) +
    note(274, 226, 420, 256, ["Colimar a los lados, hasta partes", "blandas de húmero y hombro"], AMB) +
    txt(420, 304, "DFRI 100 cm · parrilla si el grosor supera 10 cm", 11.5, MUTE) +
    txt(420, 318, "Incluir codo y hombro (en diagonal si hace falta)", 11.5, MUTE)
  );
};

I["humero-lateral-rotacion"] = () => {
  const h = humeroFrente(true);
  return svg(
    view("Vista desde el tubo · variante AP (espalda contra el RI)") +
    humeroComun(h, "RI 35 x 43 vertical") +
    `<circle cx="197" cy="200" r="8" fill="none" stroke="${BLUE}" stroke-width="2.2"/>` + dot(197, 200) +
    lab(201, 236, 176, 244, "radio y cúbito", "end") +
    note(224, 166, 420, 92, ["RC perpendicular, en la parte", "media del húmero"], RED) +
    note(205, 200, 420, 146, ["Epicóndilos perpendiculares al RI", "(lateral verdadera)"], BLUE) +
    note(222, 296, 420, 200, ["Codo un poco flexionado,", "palma hacia atrás (pronación)"]) +
    txt(420, 256, "Variante PA de pie: codo a 90° y paciente", 12, INK, "start", 700) +
    txt(420, 272, "rotado 15-20° desde la PA, hasta que húmero", 12, INK) +
    txt(420, 288, "y hombro toquen el soporte del RI.", 12, INK) +
    txt(420, 312, "DFRI 100 cm · no rotar si hay sospecha de fractura", 11.5, MUTE)
  );
};

I["humero-lateral-trauma"] = () => {
  const F = frontal({ cx: 330, R: { ang: [115, 115], mano: "canto", epi: 6 }, L: { ang: [86, 88], mano: "palma", esp: true } });
  const R = F.info.R, S = R.S, u = [Math.cos(rad(115)), Math.sin(rad(115))], n = [Math.sin(rad(115)), -Math.cos(rad(115))];
  const at = (t, k) => [f1(S[0] + u[0] * t + n[0] * k), f1(S[1] + u[1] * t + n[1] * k)];
  const r1 = at(22, 24), r2 = at(132, 24);
  const tgt = at(56, 0);
  const b1 = at(10, -20), b2 = at(150, -20), b3 = at(150, 20), b4 = at(10, 20);
  return svg(
    view("Vista desde arriba · brazo apoyado, RI entre brazo y tórax") +
    `<path d="M${P([at(30, -24), at(150, -24), at(150, 18), at(30, 18)])} Z" fill="#d7dbe3" stroke="#8a8f9c"/>` +
    F.draw +
    `<line x1="${r1[0]}" y1="${r1[1]}" x2="${r2[0]}" y2="${r2[1]}" stroke="${INK}" stroke-width="7"/>` +
    beam(tgt[0], tgt[1], 25, 180, { ref: 25 }) +
    `<circle cx="${tgt[0]}" cy="${tgt[1]}" r="4" fill="${RED}"/>` +
    side(300, 300, "D") +
    note(r1[0] + 2, r1[1] + 4, 470, 92, ["RI paralelo al húmero, entre", "brazo y tórax, borde superior", "en la axila"]) +
    note(tgt[0] + 2, tgt[1] - 4, 470, 160, ["RC horizontal, ⟂ al RI,", "en el tercio distal del húmero"], RED) +
    note(at(140, -10)[0], at(140, -10)[1], 470, 222, ["Brazo elevado con suavidad", "sobre un bloque de apoyo"]) +
    txt(470, 270, "Mano en lateral verdadera del codo, si se puede", 11.5, INK) +
    txt(470, 288, "RI 30 x 35 o 24 x 30 horizontal · sin parrilla", 11.5, MUTE) +
    txt(470, 302, "Protección entre RI y paciente · DFRI 100 cm", 11.5, MUTE) +
    txt(470, 316, "Colimar: húmero medio y distal, codo y antebrazo", 11.5, AMB)
  );
};

I["humero-transtoracica"] = () => transtoracica(
  (R) => [f1(R.S[0] + 1), f1(R.S[1] + 40)],
  txt(520, 248, "RC perpendicular al RI, en la parte", 12, INK, "start", 700) +
  txt(520, 264, "media de la diáfisis del húmero afectado", 12, INK, "start", 700) +
  txt(520, 288, "RI 35 x 43 vertical · parrilla · DFRI 100 cm", 11, MUTE) +
  txt(520, 302, "Respiración suave (ortostática),", 11, MUTE) + txt(520, 316, "exposición de 3 s o más", 11, MUTE),
  (F, t) => {
    const L = F.info.L;
    return note(L.E[0] + 10, L.E[1], 520, 70, ["Brazo opuesto por", "encima de la cabeza"]) +
      txt(20, 70, "Lado afectado", 12, INK, "start", 700) + txt(20, 86, "pegado al RI", 12, INK) +
      lab(t[0] - 6, t[1] + 20, 130, 250, "húmero", "end") +
      txt(520, 180, "De pie o en decúbito", 12, INK, "start", 700);
  });

// ======================= HOMBRO =======================
function hombroPanel(rot, dx, titulo, lineas) {
  return g(`translate(${dx} 34) scale(.78)`,
    riTop(150, 60, 180, 136) + hombroFig(rot) + `<circle cx="222" cy="137" r="5" fill="${RED}"/>`) +
    txt(dx + 2, 210, titulo, 12.5, INK, "start", 700) + lineas.map((l, i) => txt(dx + 2, 228 + i * 14, l, 11, MUTE)).join("");
}
I["hombro-ap-rotacion"] = () => svg(
  view("1 · Rotación externa (desde el tubo)") +
  hombroPanel("externo", 14, "Rotación externa", ["mano en supinación,", "epicóndilos", "paralelos al RI"]) +
  note(14 + 222 * 0.78, 34 + 137 * 0.78, 120, 112, ["RC ⟂"], RED, "end") +
  panelSep("2 · Rotación interna (desde el tubo)") +
  hombroPanel("interno", 396, "Rotación interna", ["mano en pronación,", "epicóndilos ⟂", "al RI"]) +
  note(396 + 222 * 0.78, 34 + 137 * 0.78, 502, 112, ["RC ⟂"], RED, "end") +
  txt(14, 302, "RC perpendicular, 2,5 cm por debajo de la apófisis coracoides · brazo en leve abducción", 11.5, INK, "start", 700) +
  txt(14, 318, "Hombro posterior apoyado en el RI · RI 24 x 30 horizontal · parrilla · apnea · DFRI 100 cm", 11, MUTE)
);

I["hombro-ap-neutra"] = () => {
  const c = costado(8);
  return svg(
    view("1 · De frente (desde el tubo)") +
    riTop(150, 60, 180, 136) + txt(16, 176, "RI 24 x 30", 12, INK) + txt(16, 190, "horizontal", 12, INK) +
    hombroFig("neutro") +
    `<circle cx="222" cy="135" r="4.5" fill="${RED}"/>` +
    note(218, 136, 140, 116, ["RC 2 cm debajo", "de la coracoides"], RED, "end") +
    lab(262, 99, 268, 124, "clavícula") + lab(226, 118, 268, 138, "coracoides") + lab(212, 128, 268, 152, "cabeza humeral") + lab(252, 172, 268, 176, "escápula") +
    side(30, 44, "D") + txt(46, 48, "hombro derecho", 10.5, MUTE) +
    txt(16, 238, "Brazo en posición neutra", 12, INK, "start", 700) + txt(16, 254, "leve abducción, palma", 11, MUTE) + txt(16, 268, "hacia adentro", 11, MUTE) +
    panelSep("2 · De costado (hombro posterior al RI)") +
    costadoEspalda(c) +
    `<circle cx="484" cy="163" r="4" fill="${RED}"/>` +
    beam(484, 163, 180, 200, { ref: 180 }) +
    lab(492, 144, 512, 122, "clavícula") + lab(486, 155, 520, 186, "coracoides") + lab(474, 162, 520, 200, "cabeza humeral") +
    txt(530, 248, "RC perpendicular al RI, unos", 12, INK, "start", 700) +
    txt(530, 264, "2 cm debajo de la coracoides", 12, INK, "start", 700) +
    txt(530, 286, "De pie, sentado o en decúbito", 11, MUTE) +
    txt(530, 300, "Tórax girado lo justo para apoyar", 11, MUTE) + txt(530, 314, "el hombro · parrilla · apnea", 11, MUTE)
  );
};

I["hombro-ap-axial-apical"] = () => {
  const c = costado(8);
  return svg(
    view("1 · De frente (desde el tubo)") +
    riTop(150, 60, 180, 136) + txt(16, 176, "RI 18 x 24 o", 12, INK) + txt(16, 190, "24 x 30 horizontal", 12, INK) +
    hombroFig("neutro") +
    `<circle cx="222" cy="111" r="4.5" fill="${RED}"/>` +
    note(218, 110, 140, 112, ["RC 1,25 cm por", "encima de la", "coracoides"], RED, "end") +
    lab(224, 121, 268, 138, "coracoides") + lab(212, 128, 268, 152, "cabeza humeral") + lab(252, 172, 268, 176, "escápula") +
    side(30, 44, "D") + txt(46, 48, "hombro derecho", 10.5, MUTE) +
    txt(16, 238, "Sin rotación", 12, INK, "start", 700) + txt(16, 254, "mano en posición", 11, MUTE) + txt(16, 268, "neutra", 11, MUTE) +
    panelSep("2 · De costado (de pie, espalda al RI)") +
    costadoEspalda(c) +
    `<circle cx="486" cy="146" r="4" fill="${RED}"/>` +
    beam(486, 146, 150, 185, { ref: 180, angLabel: "30°" }) +
    lab(486, 155, 520, 196, "coracoides") + lab(474, 162, 520, 210, "cabeza humeral") +
    txt(530, 252, "RC 30° caudal, entra 1,25 cm", 12, INK, "start", 700) +
    txt(530, 268, "por encima de la coracoides", 12, INK, "start", 700) +
    txt(530, 290, "DFRI 100 cm · parrilla · apnea", 11, MUTE) +
    txt(530, 304, "Colimar hasta partes blandas", 11, AMB) + txt(530, 318, "del hombro", 11, AMB)
  );
};

I["hombro-grashey"] = () => svg(
  topPanel(40, { ap: true, beamLocal: [-79, -3], angLabel: "35-45°", haz: "AP: RC ⟂ al RI" }) +
  txt(30, 300, "Oblicua hacia el lado afectado: cuerpo de la", 11, INK) +
  txt(30, 314, "escápula paralelo al RI. Brazo en rotación neutra.", 11, INK) +
  panelSep("2 · Punto de centrado (desde el tubo)") +
  g("translate(330 40) scale(.8)", hombroFig("neutro") +
    cota(188, 104, 188, 134, "", 0, 0) + cota(188, 134, 216, 134, "", 0, 0) + dot(188, 104)) +
  cross(f1(330 + 216 * 0.8), f1(40 + 134 * 0.8)) +
  txt(f1(330 + 182 * 0.8), f1(40 + 122 * 0.8), "5 cm", 11, BLUE, "end", 700) +
  txt(f1(330 + 202 * 0.8), f1(40 + 170 * 0.8), "5 cm", 11, BLUE, "middle", 700) +
  azul(f1(330 + 188 * 0.8), f1(40 + 103 * 0.8), 470, 64, "borde superolateral del hombro") +
  txt(560, 220, "RC perpendicular, en la", 12, INK, "start", 700) +
  txt(560, 236, "articulación escapulohumeral:", 12, INK, "start", 700) +
  txt(560, 252, "≈5 cm abajo y medial del borde", 12, INK) + txt(560, 268, "superolateral del hombro", 12, INK) +
  txt(560, 292, "De pie (preferible) o supino", 11, MUTE) + txt(560, 306, "RI 18 x 24 horizontal · parrilla", 11, MUTE) + txt(560, 320, "apnea · DFRI 100 cm", 11, MUTE)
);

I["hombro-garth"] = () => {
  const c = costado(8, false);
  const X = c.X;
  const brazo = piel(`M${X(446)},144 C${X(456)},136 ${X(474)},138 ${X(480)},156 L${X(482)},194 L${X(484)},166 C${X(485)},158 ${X(493)},158 ${X(493)},166 L${X(490)},214 C${X(484)},236 ${X(460)},242 ${X(448)},226 C${X(443)},210 ${X(442)},180 ${X(443)},160 Z`);
  return svg(
    topPanel(45, { ap: true, beamLocal: [-82, -2], angLabel: "45°", haz: "AP · 45° caudal" }) +
    txt(30, 300, "Tórax rotado 45°, hombro afectado apoyado en", 11, INK) +
    txt(30, 314, "el RI (oblicua posterior). De pie, de preferencia.", 11, INK) +
    panelSep("2 · De costado (espalda al RI)") +
    wall(418, 44, 300, "") + txt(424, 38, "Bucky / RI", 10, MUTE, "middle") + c.piel + brazo + c.huesos + c.cara +
    `<circle cx="462" cy="156" r="4" fill="${RED}"/>` +
    beam(462, 156, 135, 115, { ref: 180, angLabel: "45°" }) +
    note(X(494), 170, 640, 210, ["Codo flexionado,", "mano sobre el", "otro hombro"]) +
    txt(530, 262, "RC 45° caudal, a la cara medial", 12, INK, "start", 700) +
    txt(530, 278, "de la articulación escapulohumeral", 12, INK, "start", 700) +
    txt(530, 300, "RI 24 x 30 vertical, centrado en la", 11, MUTE) + txt(530, 314, "salida del RC · parrilla · apnea", 11, MUTE)
  );
};

I["hombro-y-escapula-neer"] = () => {
  const c = costado(196);
  return svg(
    topPanel(52, { brazo: true, beamLocal: [-79, -3], angLabel: "45-60°", haz: "Y de escápula: RC ⟂ (PA)" }) +
    txt(30, 300, "Desde la PA, rotar con el hombro afectado contra el RI.", 11, INK) +
    txt(30, 314, "Brazo sano adelante y arriba; afectado hacia abajo.", 11, INK) +
    panelSep("2 · Método de Neer (de costado)") +
    costadoFrente(c) +
    dot(655, 141) +
    beam(655, 141, 12.5, 210, { horizontal: true, angLabel: "10-15°" }) +
    azul(652, 136, 540, 40, "borde superior de la cabeza humeral") +
    lab(636, 206, 610, 222, "escápula", "end") + lab(664, 134, 610, 238, "acromion", "end") +
    txt(402, 262, "Neer: RC 10-15° caudal, al borde", 12, INK, "start", 700) +
    txt(402, 278, "superior de la cabeza humeral", 12, INK, "start", 700) +
    txt(402, 298, "RI 24 x 30 vertical · parrilla · apnea", 11, MUTE) +
    txt(402, 312, "Con trauma: no mover el brazo afectado", 11, MUTE)
  );
};

I["hombro-transtoracica-lawrence"] = () => transtoracica(
  (R) => [f1(R.S[0] + 2), f1(R.S[1] + 16)],
  txt(520, 236, "RC perpendicular al RI, atraviesa", 12, INK, "start", 700) +
  txt(520, 252, "el tórax hasta el cuello quirúrgico", 12, INK, "start", 700) +
  txt(520, 272, "Si no se puede elevar el hombro sano:", 11.5, RED) + txt(520, 286, "RC 10-15° cefálico", 11.5, RED, "start", 700) +
  txt(520, 306, "RI 24 x 30 vertical · parrilla · inspiración", 11, MUTE) + txt(520, 320, "completa (o respiración suave)", 11, MUTE),
  (F, t) => {
    const L = F.info.L;
    return note(L.E[0] + 10, L.E[1], 520, 70, ["Brazo y hombro sanos", "elevados, por encima", "de la cabeza"]) +
      txt(20, 64, "Brazo afectado al", 12, INK, "start", 700) + txt(20, 80, "costado, en rotación", 12, INK) + txt(20, 96, "neutra, contra el RI", 12, INK) +
      lab(t[0] - 6, t[1] - 10, 130, 250, "cuello quirúrgico", "end") +
      txt(520, 180, "De pie o en decúbito supino", 12, INK, "start", 700);
  });

I["hombro-axial-lawrence"] = () => {
  const F = frontal({ cx: 330, R: { ang: [180, 180], mano: "palma" }, L: { ang: [86, 88], mano: "palma", esp: true } });
  const S = F.info.R.S, tgt = [f1(S[0] + 2), f1(S[1] + 2)];
  const u = [Math.cos(rad(-62.5)), Math.sin(rad(-62.5))], n = [-u[1], u[0]];
  const c = [tgt[0] + u[0] * 44, tgt[1] + u[1] * 44];
  const r1 = [f1(c[0] - n[0] * 34), f1(c[1] - n[1] * 34)], r2 = [f1(c[0] + n[0] * 34), f1(c[1] + n[1] * 34)];
  return svg(
    view("Vista desde arriba · decúbito supino") +
    `<rect x="30" y="160" width="160" height="150" fill="none"/>` +
    F.draw +
    `<line x1="${r1[0]}" y1="${r1[1]}" x2="${r2[0]}" y2="${r2[1]}" stroke="${INK}" stroke-width="7"/>` + txt(r1[0] - 8, r1[1] + 4, "RI", 12, INK, "end", 700) +
    beam(tgt[0], tgt[1], -62.5, 180, { ref: -90, angLabel: "25-30°" }) +
    `<circle cx="${tgt[0]}" cy="${tgt[1]}" r="4" fill="${RED}"/>` +
    side(40, 50, "D") +
    txt(70, 82, "Brazo a 90° de abducción,", 12, INK, "start", 700) + txt(70, 98, "rotación externa (supinación)", 12, INK) +
    txt(470, 70, "RC horizontal, 25-30° hacia medial,", 12, RED, "start", 700) +
    txt(470, 86, "apuntando a la axila", 12, RED, "start", 700) +
    txt(470, 104, "Menos ángulo si no llega a 90° de abducción.", 11, INK) +
    txt(470, 118, "Tubo cerca de la mesa, a la altura de la axila.", 11, INK) +
    txt(470, 160, "Hombro en el borde de la mesa, sobre un", 11.5, INK) +
    txt(470, 174, "apoyo; cabeza girada al lado opuesto.", 11.5, INK) +
    txt(470, 206, "Alternativa (Hill-Sachs): rotación externa", 11.5, INK) +
    txt(470, 220, "exagerada, pulgar abajo y atrás (~45°).", 11.5, INK) +
    txt(470, 270, "RI 18 x 24 horizontal · parrilla (a menudo", 11, MUTE) + txt(470, 284, "sin ella en hombros pequeños) · apnea", 11, MUTE) +
    txt(470, 304, "No hacer si se sospecha fractura o luxación", 11, MUTE)
  );
};

I["hombro-transaxilar-hobbs"] = () => {
  const F = frontal({ back: true, cx: 270, dy: 80, R: { ang: [-84, -92], mano: "dorso", esp: true }, L: { ang: [92, 92], mano: "dorso", esp: true } });
  const S = F.info.R.S, j = [f1(S[0] - 12), f1(S[1] + 2)];
  return svg(
    view("Vista desde el tubo · PA, de pie o en decúbito") +
    riTop(j[0] - 64, j[1] - 84, 128, 170) +
    F.draw +
    cross(...j) +
    side(80, 70, "D") + txt(30, 96, "vista por detrás:", 10.5, MUTE) + txt(30, 108, "el lado derecho", 10.5, MUTE) + txt(30, 120, "queda a la derecha", 10.5, MUTE) +
    note(j[0] + 10, j[1] + 6, 470, 210, ["RC perpendicular, centrado en", "la articulación glenohumeral"], RED) +
    note(f1(F.info.R.E[0] + 12), f1(F.info.R.E[1]), 470, 90, ["Brazo afectado elevado,", "en extensión completa"]) +
    note(282, 130, 470, 150, ["Cabeza girada hacia", "el otro lado"]) +
    txt(470, 264, "RI 18 x 24 vertical", 11.5, INK) + txt(470, 280, "Parrilla · apnea · DFRI 100 cm", 11.5, MUTE) +
    txt(470, 296, "Colimación ajustada a los cuatro lados", 11.5, AMB)
  );
};

I["hombro-axial-clements"] = () => {
  const F = frontal({ cx: 280, clip: null, R: { ang: [180, 180], mano: "palma" }, L: { ang: [92, 92], mano: "palma", esp: true } });
  const Tx = 260, Ty = 218, k = 0.72;
  const tr = (x, y) => [f1(Tx - k * (y - 160)), f1(Ty + k * (x - 280))];
  const sh = tr(202, 132);
  return svg(
    view("Vista de frente · decúbito lateral sobre el lado sano") +
    table(40, 430, 287) +
    g(`translate(${Tx} ${Ty}) rotate(90) scale(${k}) translate(-280 -160)`, F.draw) +
    `<rect x="${sh[0] + 26}" y="${sh[1] - 62}" width="7" height="78" fill="${INK}"/>` + txt(sh[0] + 40, sh[1] - 50, "RI", 12, INK, "start", 700) +
    beam(sh[0], sh[1], 0, 200, { horizontal: true }) +
    `<circle cx="${sh[0]}" cy="${sh[1]}" r="4" fill="${RED}"/>` +
    note(sh[0] - 6, 50, 150, 40, ["Brazo afectado elevado,", "90° de abducción"], INK, "end") +
    txt(470, 70, "RC perpendicular al RI", 12.5, RED, "start", 700) +
    txt(470, 88, "Sin 90° de abducción: angular", 11.5, INK) + txt(470, 102, "el tubo 5-15° hacia la axila", 11.5, INK) +
    txt(470, 150, "Paciente acostado sobre el lado sano;", 11.5, INK) + txt(470, 164, "hombro afectado arriba", 11.5, INK) +
    txt(470, 270, "RI 18 x 24 vertical · sin parrilla (o con ella", 11, MUTE) + txt(470, 284, "si el RC le queda perpendicular) · apnea", 11, MUTE) +
    txt(470, 304, "DFRI 100 cm · colimar a los cuatro lados", 11, MUTE)
  );
};

I["hombro-fisk"] = () => {
  // panel 1: decúbito supino visto de costado (silueta de la muestra aprobada de columna), recortado al tórax
  const NX = 105.28, NY = 252;
  const h = cabezaPerfil(NX, NY, { s: 0.42 });
  const cuerpo = h.d + " C176,226 180,212 196,200 C222,184 256,178 286,182 C312,188 336,196 362,198 C380,199 396,198 412,198 L412,252 Z";
  const brazo = linea("M206,206 C240,214 272,224 300,230 C330,234 360,232 384,228");
  const tgt = [206, 200];
  const u = [Math.cos(rad(167.5)), Math.sin(rad(167.5))], n = [-u[1], u[0]];
  const rc = [tgt[0] + u[0] * 22, tgt[1] + u[1] * 22];
  const r1 = [f1(rc[0] - n[0] * 30), f1(rc[1] - n[1] * 30)], r2 = [f1(rc[0] + n[0] * 30), f1(rc[1] + n[1] * 30)];
  // panel 2: de pie inclinado sobre el extremo de la mesa
  const c = costado(110, false);
  const sh = [643, 158];
  const el = [sh[0] + 78 * Math.sin(rad(12.5)), sh[1] + 78 * Math.cos(rad(12.5))].map(f1);
  const m = mano(700, el[1] + 2, 0, 1.0, "palma", false, true);
  const arm = union([[...sh, ...el, 24], [...el, 700, el[1] + 2, 18], `M${m.a} ${m.seg} Z`]);
  return svg(
    view("1 · Decúbito supino (de costado)") +
    `<clipPath id="cf"><rect x="0" y="30" width="386" height="300"/></clipPath><g clip-path="url(#cf)">` +
    table(20, 400, 252) + piel(cuerpo) + brazo + h.cara +
    hueso(circ(206, 208, 9)) + `</g>` +
    `<line x1="${r1[0]}" y1="${r1[1]}" x2="${r2[0]}" y2="${r2[1]}" stroke="${INK}" stroke-width="6"/>` +
    beam(tgt[0], tgt[1], 167.5, 160, { ref: 180, angLabel: "10-15°" }) +
    `<circle cx="${tgt[0]}" cy="${tgt[1]}" r="4" fill="${RED}"/>` +
    note(r2[0] + 2, r2[1] - 2, 230, 92, ["RI vertical sobre", "el hombro, ⟂ al RC"], INK, "start") +
    txt(16, 280, "Tubo 10-15° hacia posterior desde la horizontal:", 11.5, RED, "start", 700) +
    txt(16, 294, "haz tangencial al surco bicipital.", 11.5, INK) +
    txt(16, 308, "Leve abducción, mano supinada.", 11.5, INK) +
    panelSep("2 · Alternativa de pie (de costado)") +
    `<rect x="672" y="${el[1] + 12}" width="88" height="12" fill="#cfd3dc"/>` + txt(700, el[1] + 38, "Mesa", 10, MUTE) +
    g(`rotate(25 570 316)`, c.piel + c.cara) + arm + m.det +
    boneAlong([sh[0] + 1.5, sh[1] + 7], el, [[0, 6, 6], [0.9, 6, 6], [1, 8, 8]]) + hueso(circ(sh[0], sh[1], 10)) +
    `<rect x="${el[0] - 8}" y="${el[1] - 16}" width="60" height="6" fill="${INK}"/>` + txt(el[0] + 56, el[1] - 10, "RI", 11, INK, "start", 700) +
    `<line x1="${sh[0]}" y1="${sh[1]}" x2="${sh[0]}" y2="${sh[1] + 66}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 4"/>` +
    arcoAzul(sh[0], sh[1], 50, 90, 77.5, "10-15°", sh[0] - 22, sh[1] + 74) +
    beam(sh[0], sh[1] - 8, 90, 92) +
    txt(402, 50, "Inclinado hacia adelante", 11.5, INK) + txt(402, 64, "sobre el extremo de la", 11.5, INK) + txt(402, 78, "mesa; húmero a 10-15°", 11.5, INK) + txt(402, 92, "de la vertical", 11.5, INK) +
    txt(402, 118, "RC vertical, ⟂ al RI", 12, RED, "start", 700) +
    txt(402, 136, "RI 18 x 24 horizontal", 11, MUTE) + txt(402, 150, "sin parrilla · apnea", 11, MUTE)
  );
};

// ======================= CLAVÍCULA =======================
I["clavicula-ap-axial"] = () => {
  const c = costado(8);
  return svg(
    view("1 · De frente (desde el tubo)") +
    riTop(150, 54, 180, 100) + txt(16, 176, "RI 24 x 30", 12, INK) + txt(16, 190, "horizontal", 12, INK) +
    hombroFig("neutro") +
    coll(186, 76, 104, 44) +
    dot(280, 94) + dot(204, 100) +
    `<circle cx="238" cy="100" r="5" fill="${RED}"/>` +
    note(236, 102, 140, 128, ["RC en la mitad", "de la clavícula"], RED, "end") +
    txt(300, 240, "escotadura yugular", 11, BLUE, "middle") + `<line x1="280" y1="98" x2="300" y2="228" stroke="${BLUE}" stroke-width="1"/>` + azul(204, 98, 120, 56, "articulación AC", "middle") +
    side(30, 44, "D") +
    txt(16, 238, "De pie o en decúbito", 12, INK, "start", 700) + txt(16, 254, "Colimar incluyendo", 11, AMB) + txt(16, 268, "las articulaciones", 11, AMB) + txt(16, 282, "AC y esternoclavicular", 11, AMB) +
    panelSep("2 · De costado (espalda al RI)") +
    costadoEspalda(c) +
    `<circle cx="484" cy="139" r="4" fill="${RED}"/>` +
    beam(484, 139, 202.5, 110, { ref: 180, angLabel: "15-30°" }) +
    lab(490, 142, 520, 112, "clavícula") +
    txt(530, 242, "AP: RC perpendicular (punteado)", 12, INK, "start", 700) +
    txt(530, 258, "AP axial: RC 15-30° cefálico", 12, RED, "start", 700) +
    txt(530, 274, "Hombros delgados: 5-15° más", 11, INK) + txt(530, 288, "que en hombros gruesos", 11, INK) +
    txt(530, 304, "Inspiración completa · parrilla · DFRI 100 cm", 11, MUTE) +
    txt(530, 318, "En vez de angular: AP lordótica", 11, MUTE)
  );
};

// ======================= ESCÁPULA =======================
I["escapula-ap"] = () => {
  const F = frontal({ cx: 330, R: { ang: [180, 180], mano: "palma" }, L: { ang: [86, 88], mano: "palma", esp: true } });
  const R = F.info.R, X = R.X;
  const rc = [X(240), 152], cor = [X(222), 120], latx = 330 - 92;
  return svg(
    view("Vista desde el tubo · de pie o decúbito supino") +
    riTop(X(196), 70, 104, 150) +
    F.draw +
    coll(X(212), 92, 62, 112) +
    dot(...cor) + cota(cor[0], cor[1], cor[0], rc[1], "", 0, 0) + txt(cor[0] + 6, 132, "5 cm", 11, BLUE, "start", 700) +
    cota(latx, rc[1], rc[0], rc[1], "", 0, 0) + txt(257, rc[1] + 16, "5 cm", 11, BLUE, "end", 700) +
    cross(...rc) +
    lab(cor[0] - 2, cor[1] - 2, 200, 66, "coracoides", "end") + lab(X(258), 184, 300, 240, "escápula") +
    side(40, 50, "D") +
    note(rc[0] + 10, rc[1] + 6, 470, 110, ["RC perpendicular, en la parte", "media de la escápula"], RED) +
    txt(470, 150, "≈5 cm debajo de la coracoides y", 12, INK) + txt(470, 166, "≈5 cm medial del borde lateral", 12, INK) +
    note(110, 120, 120, 250, ["Brazo abducido 90°, mano", "supinada: menos costillas", "sobre la escápula"], INK, "start") +
    txt(470, 254, "RI 24 x 30 vertical", 11, INK) + txt(470, 270, "Respiración suave o apnea · parrilla", 11, MUTE) +
    txt(470, 286, "DFRI 100 cm", 11, MUTE) + txt(470, 302, "Colimar hasta los bordes de la escápula", 11, AMB)
  );
};

I["escapula-lateral"] = () => {
  const c = costado(196);
  return svg(
    topPanel(52, { beamLocal: [-36, -32], angLabel: "45-60°", haz: "RC ⟂ al RI" }) +
    txt(30, 300, "Rotar el tórax hasta que el cuerpo de la escápula", 11, INK) +
    txt(30, 314, "quede perpendicular al RI (palpar sus bordes).", 11, INK) +
    panelSep("2 · Vista lateral (mirando al RI)") +
    costadoFrente(c) +
    refline(627, 140, 633, 212) + dot(630, 177) +
    beam(630, 177, 0, 200, { horizontal: true }) +
    azul(626, 168, 556, 50, "borde medial de la escápula (mitad)") +
    lab(636, 206, 610, 222, "escápula", "end") +
    txt(402, 246, "RC perpendicular, en el borde medial", 12, INK, "start", 700) +
    txt(402, 262, "a mitad de altura de la escápula", 12, INK, "start", 700) +
    txt(402, 282, "Cuerpo: brazo cruzado, mano al otro hombro", 11, INK) +
    txt(402, 296, "Acromion/coracoides: brazo abajo, codo", 11, INK) + txt(402, 310, "flexionado, palma hacia afuera · apnea", 11, INK)
  );
};

// ======================= ACROMIOCLAVICULARES =======================
I["ac-pearson"] = () => {
  const F = frontal({ cx: 230, R: { ang: [96, 92], mano: "palma" }, L: { ang: [84, 88], mano: "palma", esp: true } });
  const R = F.info.R, L = F.info.L;
  const peso = (W) => `<line x1="${f1(W[0])}" y1="${f1(W[1] + 6)}" x2="${f1(W[0])}" y2="${f1(W[1] + 58)}" stroke="${MUTE}" stroke-width="1.5"/>` +
    `<rect x="${f1(W[0] - 13)}" y="${f1(W[1] + 58)}" width="26" height="20" rx="3" fill="#8a8f9c"/>`;
  const acR = [R.X(206), 100], acL = [L.X(206), 100], yug = [230, 94];
  const Z = ([x, y]) => [f1(x * 0.85 + 34.5), f1(y * 0.85 + 14)];
  return svg(
    view("Vista desde el tubo · de pie, brazos a los costados") +
    g("translate(34.5 14) scale(.85)", riTop(100, 64, 260, 80) + F.draw + peso(R.W) + peso(L.W) + coll(112, 72, 236, 56) + dot(...acR) + dot(...acL)) +
    cross(...Z(yug)) +
    azul(...Z(acR), 60, 44, "AC derecha") + azul(...Z(acL), 400, 44, "AC izquierda") +
    note(...Z([L.W[0] + 13, L.W[1] + 70]), 360, 300, ["Toma con pesos"]) +
    note(Z(yug)[0] + 12, Z(yug)[1] + 6, 470, 92, ["RC perpendicular, centrado", "en la escotadura yugular"], RED) +
    txt(16, 200, "RI 35 x 43", 11.5, INK) + txt(16, 214, "horizontal", 11.5, INK) +
    txt(470, 140, "Dos tomas bilaterales:", 12, INK, "start", 700) +
    txt(470, 156, "1) sin pesos; 2) con pesos de 3,6-4,5 kg", 11.5, INK) + txt(470, 170, "atados a las muñecas (2,25-3,6 kg en", 11.5, INK) + txt(470, 184, "pacientes chicos), hombros relajados", 11.5, INK) +
    txt(470, 204, "Marcadores «con pesos» y «sin pesos»", 11.5, INK) +
    txt(470, 228, "Campo horizontal, largo y estrecho", 11.5, AMB) +
    txt(470, 252, "DFRI 180 cm si es un solo RI bilateral", 11.5, MUTE) + txt(470, 266, "(si no, 100 cm) · apnea", 11.5, MUTE) +
    txt(470, 280, "Descartar fractura antes de los pesos", 11.5, MUTE)
  );
};

module.exports = I;
