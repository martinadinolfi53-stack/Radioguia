// Esquemas de codo, antebrazo, muñeca, mano, dedos, pulgar y extremidad superior pediátrica.
// Estilo aprobado (contorno continuo color piel + huesos "por transparencia"). Helpers de codo/antebrazo copiados de
// referencia-tecnicas1-superior.cjs; mano esquelética, cortes desde los dedos y vistas laterales nuevos.
const E = require("./estilo.cjs");
const A = require("./anatomia.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONEO, riTop, beam, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, mk, cabezaFrente } = E;

// ---------- helpers copiados de referencia-tecnicas1-superior.cjs ----------
const f1 = (n) => +n.toFixed(1);
const P = (pts) => pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" L");
const lab = (px, py, tx, ty, t, anchor = "start") =>
  `<line x1="${px}" y1="${py}" x2="${anchor === "start" ? tx - 3 : tx + 3}" y2="${ty - 4}" stroke="${BONEO}" stroke-width=".8"/>` + etiquetaHueso(tx, ty, t, anchor);
const circ = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
const azul = (px, py, tx, ty, t, anchor = "middle") =>
  txt(tx, ty, t, 11, BLUE, anchor) + `<line x1="${tx}" y1="${ty + 4}" x2="${px}" y2="${py}" stroke="${BLUE}" stroke-width="1"/>`;
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
const panelSep = (title, x = 388) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>` +
  `<text x="${x + 14}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
// curva suave por los puntos (de referencia-tecnicas1-pie.cjs)
function cr(pts, closed = false) {
  const n = pts.length, g = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + (closed ? " Z" : "");
}

// ---------- helpers nuevos ----------
const rad = (d) => (d * Math.PI) / 180;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const dirUp = (a) => [Math.sin(rad(a)), -Math.cos(rad(a))]; // a = grados desde "arriba", + hacia +x
const rotP = (p, a, c = [0, 0]) => { const r = rad(a), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
// transformación local → dibujo: escala s, compresión lateral sx (oblicuas), espejo, rotación, traslación
const tf = (s, tx, ty, rot = 0, flip = false, sx = 1) => ([x, y]) => {
  const dx = x * s * sx * (flip ? -1 : 1), dy = y * s, r = rad(rot);
  return [tx + dx * Math.cos(r) - dy * Math.sin(r), ty + dx * Math.sin(r) + dy * Math.cos(r)];
};
// silueta fundida: varias piezas (polilíneas gruesas o polígonos) con un único contorno
function skin(parts, extra = "") {
  const o = [], f = [];
  for (const p of parts) {
    if (p.w) {
      const d = "M" + P(p.pts);
      o.push(`<path d="${d}" fill="none" stroke="${SKO}" stroke-width="${f1(p.w + 3.4)}" stroke-linecap="round" stroke-linejoin="round"/>`);
      f.push(`<path d="${d}" fill="none" stroke="${SK}" stroke-width="${f1(p.w)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    } else {
      const d = p.smooth ? cr(p.pts, true) : "M" + P(p.pts) + " Z";
      o.push(`<path d="${d}" fill="${SKO}" stroke="${SKO}" stroke-width="3.4" stroke-linejoin="round"/>`);
      f.push(`<path d="${d}" fill="${SK}" stroke="none"/>`);
    }
  }
  return `<g ${extra}>${o.join("")}${f.join("")}</g>`;
}
const ell = (c, rx, ry, rot = 0) => hueso(`M${f1(c[0] - rx)},${f1(c[1])} a${f1(rx)},${f1(ry)} 0 1,0 ${f1(2 * rx)},0 a${f1(rx)},${f1(ry)} 0 1,0 ${f1(-2 * rx)},0 Z`, `transform="rotate(${f1(rot)} ${f1(c[0])} ${f1(c[1])})"`);
// hueso corto entre dos puntos, ancho w (cabeza y base algo más anchas)
const bone = (a, b, w, gap = 0) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), g = Math.min(gap / L, 0.2);
  return boneAlong(lerp(a, b, g), lerp(a, b, 1 - g), [[0, w * 0.62, w * 0.62], [0.18, w * 0.42, w * 0.42], [0.82, w * 0.42, w * 0.42], [1, w * 0.58, w * 0.58]]);
};
// rótulo de hueso a la izquierda del punto (texto alineado a la derecha)
const labL = (p, dx, dy, t) => lab(f1(p[0]), f1(p[1]), f1(p[0] + dx), f1(p[1] + dy), t, "end");
const redDot = (p, r = 4.5) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${RED}"/>`;
const bluePt = (p) => dot(f1(p[0]), f1(p[1]));
const ring = (p, r = 8, c = BLUE) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="none" stroke="${c}" stroke-width="2.2"/>`;
const crossP = (p) => cross(f1(p[0]), f1(p[1]));
const lines = (x, y, arr, size = 11.5, color = MUTE, lh = 15) => arr.map((t, i) => txt(x, y + i * lh, t, size, i === 0 && color === INK ? INK : color)).join("");
const bold = (x, y, t, size = 12, c = INK, a = "start") => txt(x, y, t, size, c, a, 700);
// rótulo con datos técnicos de la ficha (RI · DFRI · parrilla)
const tecnica = (x, y, riTxt, extra = []) => lines(x, y, [`RI ${riTxt} · DFRI 100 cm · sin parrilla`, ...extra], 11, MUTE, 14);
// arco de ángulo entre dos direcciones (grados SVG) con rótulo
function arco(c, r, a1, a2, label, color = BLUE, lr = 16) {
  const p1 = [c[0] + r * Math.cos(rad(a1)), c[1] + r * Math.sin(rad(a1))], p2 = [c[0] + r * Math.cos(rad(a2)), c[1] + r * Math.sin(rad(a2))];
  const sweep = ((a2 - a1 + 360) % 360) < 180 ? 1 : 0, am = a1 + (((a2 - a1 + 540) % 360) - 180) / 2;
  const m = [c[0] + (r + lr) * Math.cos(rad(am)), c[1] + (r + lr) * Math.sin(rad(am)) + 4];
  return `<path d="M${f1(p1[0])},${f1(p1[1])} A${r},${r} 0 0 ${sweep} ${f1(p2[0])},${f1(p2[1])}" fill="none" stroke="${color}" stroke-width="1.8"/>` +
    txt(f1(m[0]), f1(m[1]), label, 13, color, "middle", 700);
}
// RI visto de canto (barra negra) sobre la mesa
const riBar = (x1, x2, y, label = "RI") => `<rect x="${x1 - 20}" y="${y + 8}" width="${x2 - x1 + 40}" height="10" fill="#cfd3dc"/>` +
  `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="8" fill="${INK}"/>` + (label ? txt(x2 + 6, y + 8, label, 12, INK) : "");

// ---------- mano esquelética (vista dorsal o palmar), coordenadas locales ----------
// Muñeca en (0,0), dedos hacia -y, pulgar del lado -x. Unidades ≈ px a escala 1 (mano ≈ 206 de largo).
const RAYS = [
  { n: 2, B: [-15, -38], M: [-25, -108], a: -8, L: [40, 24, 18], w: 16 },
  { n: 3, B: [-4, -40], M: [-7, -114], a: -1.5, L: [45, 28, 19], w: 17 },
  { n: 4, B: [7, -38], M: [11, -110], a: 5, L: [42, 27, 18], w: 16 },
  { n: 5, B: [17, -35], M: [27, -99], a: 13, L: [32, 20, 17], w: 14 },
];
const CARPO = [ // [centro, rx, ry, rot, nombre]
  [[-14, -11], 7, 5, -35, "escafoides"], [[-3, -10], 5, 5, 0], [[8, -12], 5, 4.5, 20], [[14, -9], 3.4, 3.4, 0],
  [[-19, -29], 5, 6, 10], [[-9, -30], 4, 5.5, 0], [[0, -28], 5, 7.5, 0], [[11, -27], 5.5, 6.5, 10],
];
// o: { s, at:[x,y] posición de la muñeca, rot (dirección de los dedos, grados SVG; -90 = arriba), flip, sx,
//      spread (factor de separación de los dedos), flex (0-1, dedos flexionados vistos desde arriba),
//      thumb: grados extra de abducción del pulgar, dev: desviación (+ cubital, - radial), F: largo de antebrazo,
//      cara: "dorso" | "palma", solo: n.º de dedo extendido (los demás flexionados), sinDedos: [n…] ocultos }
function manoEsq(o) {
  const { s = 1, at = [0, 0], rot = -90, flip = false, sx = 1, spread = 1, flex = 0, thumb = 0, dev = 0, F = 120, cara = "dorso", solo = null } = o;
  const T = tf(s, at[0], at[1], rot + 90, flip, sx);
  const D = (p) => T(rotP(p, dev, [0, -18])); // puntos de la mano (desviación alrededor del carpo)
  const ws = s * (0.8 + 0.2 * sx);
  const skinParts = [], bones = [], det = [], pts = { mcp: {}, ifp: {}, tip: {}, mcb: {} };
  // antebrazo
  skinParts.push({ pts: [[-26, 2], [-30, F], [30, F], [26, 2]].map(T) });
  bones.push(boneAlong(T([-12, -1]), T([-14, F + 10]), [[0, 11 * ws, 8 * ws], [0.12, 7 * ws, 6 * ws], [0.4, 5 * ws, 5 * ws], [1, 5 * ws, 5 * ws]]));
  bones.push(boneAlong(T([13, 2]), T([15, F + 10]), [[0, 5.5 * ws, 5.5 * ws], [0.12, 4.2 * ws, 4.2 * ws], [1, 4.2 * ws, 4.2 * ws]]));
  // palma
  skinParts.push({ smooth: true, pts: [[-25, 6], [-27, -20], [-30, -60], [-33, -100], [-24, -118], [-8, -123], [8, -120], [20, -114], [33, -100], [34, -60], [31, -26], [27, 6]].map(D) });
  // pulgar
  const tb = [-20, -30], tm = rotP([-44, -66], -thumb, tb), ta = -36 - thumb * 1.1;
  const t1 = add(tm, dirUp(ta), 30 * (1 - 0.35 * flex)), t2 = add(t1, dirUp(ta - 4), 23 * (1 - 0.5 * flex));
  skinParts.push({ pts: [[-22, -26], tm, t1, t2].map(D), w: 19 * ws });
  skinParts.push({ pts: [[-24, -24], tm, lerp(tm, t1, 0.35), [-31, -97], [-28, -60]].map(D) });
  bones.push(bone(D(tb), D(tm), 8 * ws, 2) + bone(D(tm), D(t1), 7 * ws, 3) + bone(D(t1), D(t2), 6 * ws, 3));
  pts.mcp[1] = D(tm); pts.cmc1 = D(tb); pts.ifp[1] = D(t1); pts.tip[1] = D(t2);
  // dedos 2-5
  for (const r of RAYS) {
    const fl = solo ? (solo === r.n ? 0 : 1) : flex;
    const k = [1 - 0.5 * fl, 1 - 0.78 * fl, 1 - 0.92 * fl];
    const ang = r.a * spread;
    let p = r.M; const chain = [p];
    r.L.forEach((L, i) => { p = add(p, dirUp(ang), L * k[i]); chain.push(p); });
    skinParts.push({ pts: chain.map(D), w: r.w * ws });
    bones.push(bone(D(r.B), D(r.M), 8 * ws, 1.5));
    for (let i = 0; i < 3; i++) if (r.L[i] * k[i] > 6) bones.push(bone(D(chain[i]), D(chain[i + 1]), (7 - i) * ws, 2.5));
    pts.mcp[r.n] = D(r.M); pts.ifp[r.n] = D(chain[1]); pts.tip[r.n] = D(chain[3]); pts.mcb[r.n] = D(r.B);
    // detalle: uñas (dorso) o pliegues (palma)
    const u = dirUp(ang), nv = [-u[1], u[0]], hw = r.w * 0.3;
    if (fl < 0.5) {
      if (cara === "dorso") { const c = add(chain[3], u, -7); det.push(`M${P([add(c, nv, -hw), add(add(c, u, -3), [0, 0]), add(c, nv, hw)].map(D))}`); }
      else for (const j of [chain[1], chain[2]]) det.push(`M${P([add(j, nv, -hw * 1.2), add(j, nv, hw * 1.2)].map(D))}`);
    } else if (cara === "dorso") { const j = chain[1]; det.push(`M${P([add(j, nv, -hw * 1.3), add(j, u, -2.5), add(j, nv, hw * 1.3)].map(D))}`); }
  }
  if (cara === "palma") det.push("M" + P([[-24, -86], [-4, -92], [26, -86]].map(D)), "M" + P([[-22, -40], [-26, -62], [-24, -90]].map(D)));
  for (const [c, rx, ry, rr] of CARPO) bones.push(ell(D(c), rx * ws * sx, ry * ws, rot + 90 + rr + dev));
  pts.carpo = D([-2, -20]); pts.escafoides = D([-14, -11]); pts.wrist = T([0, 0]); pts.arm = T([0, F * 0.7]);
  return { skin: skin(skinParts), bones: bones.join(""), det: det.map((d) => linea(d, 1.2)).join(""), pts, T, D };
}
const drawHand = (h) => h.skin + h.bones + h.det;

// ---------- mano de canto (lateral), coordenadas locales ----------
// Muñeca en (0,0), dedos hacia -y, dorso hacia +x, palma hacia -x; el pulgar queda del lado del observador.
// o: { s, at, rot, flip, F, modo: "ext" | "abanico" | "puno" | "solo", solo: n.º de dedo extendido, bend: flexión de muñeca
//      (+ hacia el dorso), thumb: "delante" | "lateral" (pulgar separado, de perfil) }
const FING = { 2: [40, 24, 18], 3: [45, 28, 19], 4: [42, 27, 18], 5: [32, 20, 17] };
function manoCanto(o) {
  const { s = 1, at = [0, 0], rot = -90, flip = false, F = 120, modo = "ext", solo = 2, bend = 0, fan = 13, sinPulgar = false, fx = 0, pulgarPlano = false } = o;
  const T = tf(s, at[0], at[1], rot + 90, flip);
  const D = (p) => T(rotP(p, bend, [0, -6]));
  const body = [], front = [], bones = [], det = [], pts = {};
  body.push({ pts: [[-19, 2], [-19, F], [21, F], [19, 2]].map(T) });
  bones.push(boneAlong(T([-4, -2]), T([-5, F + 10]), [[0, 9 * s, 9 * s], [0.12, 6 * s, 6 * s], [1, 5 * s, 5 * s]]));
  bones.push(boneAlong(T([4, 0]), T([5, F + 10]), [[0, 5 * s, 5 * s], [0.12, 4 * s, 4 * s], [1, 4 * s, 4 * s]]));
  body.push({ smooth: true, pts: [[-19, 8], [-24, -22], [-29, -50], [-24, -86], [-14, -104], [3, -112], [18, -102], [21, -62], [21, -22], [19, 8]].map(D) });
  for (const c of [[-2, -12], [4, -14], [-4, -28], [3, -30], [8, -24]]) bones.push(ell(D(c), 6 * s, 6 * s));
  const order = [5, 4, 3, 2];
  for (const n of order) {
    const base = [2 - (5 - n) * 0.5 + fx, -100 + (5 - n) * 2];
    let angs;
    if (modo === "ext") angs = [0, 0, 0];
    else if (modo === "abanico") angs = Array(3).fill(-(n - 2) * fan);
    else if (modo === "puno" || (modo === "solo" && n !== solo)) angs = [-80, -165, -215];
    else if (modo === "arco") angs = [-35, -95, -125];
    else angs = [0, 0, 0];
    const L = FING[n]; let p = base; const ch = [p];
    L.forEach((l, i) => { p = add(p, dirUp(angs[i]), l * (angs[i] < -100 ? 0.75 : 1)); ch.push(p); });
    body.push({ pts: ch.map(D), w: 15.5 * s });
    bones.push(bone(D([2, -34]), D(base), 7 * s, 1));
    for (let i = 0; i < 3; i++) bones.push(bone(D(ch[i]), D(ch[i + 1]), (6.5 - i) * s, 2.5));
    pts["mcp" + n] = D(base); pts["ifp" + n] = D(ch[1]); pts["tip" + n] = D(ch[3]);
    if (angs[0] === 0 && (modo !== "ext" || n === 2)) { const u = dirUp(angs[0]); const c = add(ch[3], u, -6); det.push("M" + P([add(c, [5, 0]), add(c, [7.5, 2]), add(c, [7.5, 9])].map(D))); }
  }
  if (modo === "ext") for (const x of [-3.5, 0.5, 4]) det.push("M" + P([[x + fx, -112], [x + fx, -170]].map(D)));
  if (pulgarPlano) {
    const tb = [-12, -26], tm = [-17, -60], t1 = [-18, -86], t2 = [-18, -104];
    front.push({ pts: [[-10, -20], tm, t1, t2].map(D), w: 16 * s });
    bones.push(bone(D(tb), D(tm), 8 * s, 2) + bone(D(tm), D(t1), 7 * s, 3) + bone(D(t1), D(t2), 6 * s, 3));
    det.push("M" + P([[-12, -96], [-14, -94], [-15, -100]].map(D)));
    pts.mcp1 = D(tm); pts.cmc1 = D(tb); pts.tip1 = D(t2);
  } else if (!sinPulgar) {
    const tb = [-12, -26], tm = [-32, -60], t1 = [-42, -86], t2 = [-46, -106];
    front.push({ pts: [[-10, -20], tm, t1, t2].map(D), w: 18 * s });
    front.push({ smooth: true, pts: [[-6, -22], [-24, -40], [-33, -62], [-30, -76], [-14, -84], [-8, -50]].map(D) });
    bones.push(bone(D(tb), D(tm), 8 * s, 2) + bone(D(tm), D(t1), 7 * s, 3) + bone(D(t1), D(t2), 6 * s, 3));
    det.push("M" + P([[-47, -96], [-41, -95], [-38, -100]].map(D)));
    pts.mcp1 = D(tm); pts.cmc1 = D(tb); pts.tip1 = D(t2);
  }
  pts.carpo = D([1, -20]); pts.wrist = T([0, 0]); pts.arm = T([0, F * 0.6]);
  // los huesos del pulgar van por encima del contorno del pulgar (que está delante)
  return { skin: skin(body) + (front.length ? skin(front) : ""), bones: bones.join(""), det: det.map((d) => linea(d, 1.2)).join(""), pts, T, D };
}

// ---------- corte de la mano visto desde la punta de los dedos ----------
// local: x de -55 (2.º MC) a 55 (5.º MC), y negativo = dorso; pulgar en (-60,12).
// o: { at: dónde cae el punto de apoyo 'contact' (local), rot: giro (grados, + horario), flip: espejo, s }
function corte(o) {
  const { s = 1, rot = 0, flip = false, contact = [55, 16], at, pulgar = [-62, 10] } = o;
  const base = (p) => rotP([p[0] * (flip ? -1 : 1) * s, p[1] * s], rot);
  const c0 = base(contact), Tl = (p) => { const q = base(p); return [q[0] - c0[0] + at[0], q[1] - c0[1] + at[1]]; };
  const out = [[-56, -8], [-48, -16], [0, -17], [48, -15], [56, -7], [56, 8], [48, 16], [0, 17], [-48, 16], [-56, 8]];
  const sk = skin([{ smooth: true, pts: out.map(Tl) }, { pts: [Tl([-52, 4]), Tl(pulgar)], w: 22 * s }]);
  const heads = [-38, -13, 12, 36].map((x) => Tl([x, -3]));
  const b = heads.map((p) => hueso(circ(f1(p[0]), f1(p[1]), f1(7.5 * s)))).join("") + hueso(circ(...Tl(pulgar).map(f1), f1(6 * s)));
  return { svg: sk + b, heads, T: Tl, thumb: Tl(pulgar) };
}
// cuña de goma espuma bajo un plano inclinado: vértice en v (sobre el RI), sube hacia 'lado' (-1 izq, 1 der)
function cuna(v, ang, L, lado = -1, label = "") {
  const A = [v[0] + lado * L, v[1]], B = [v[0] + lado * L, v[1] - L * Math.tan(rad(ang))];
  return `<path d="M${P([v, A, B])} Z" fill="#e3e6ec" stroke="#9aa0ac" stroke-width="1.4"/>` + (label ? txt(f1(v[0] + lado * L * 0.62), f1(v[1] - 6), label, 10, MUTE, "middle") : "");
}

const I = {};

// ======================= MANO =======================
I["mano-pa"] = () => {
  // mano derecha en pronación, dedos hacia la derecha; 11 px = 1 cm (RI 30 x 24 cm a escala)
  const T = A.X({ s: 13, at: [170, 182], rot: 90 });
  const h = A.manoPA({ T, antebrazo: 16, dedos: 1.15 });
  const m3 = h.P.mcf3, c = h.P.caja, px = h.P.borde.proximal[0];
  const cx0 = Math.min(c.x0, px) - 8, cy0 = c.y0 - 8, cx1 = c.x1 + 8, cy1 = c.y1 + 8;
  return svg(
    view("Vista desde el tubo · mano apoyada en el RI") +
    riTop(138, 46, 330, 264) + txt(138, 324, "RI 24 x 30", 12, INK) +
    refline(20, 182, 484, 182) +
    A.pielUnida(h.piel) + h.detalle + h.huesos + coll(f1(cx0), f1(cy0), f1(cx1 - cx0), f1(cy1 - cy0)) + crossP(m3) +
    lab(...h.P.carpo, 214, 290, "carpo", "end") +
    lab(...h.P.mcMedio4, 300, 290, "metacarpianos") +
    lab(...h.P.ifp5, 410, 290, "falanges") +
    note(m3[0] + 10, m3[1] - 4, 520, 62, ["RC perpendicular al RI", "en la 3.ª articulación MCF"], RED) +
    note(484, 182, 520, 122, ["Eje de mano y muñeca", "paralelo al borde del RI"], BLUE) +
    note(h.P.punta3[0] + 4, h.P.punta3[1] - 3, 520, 176, ["Pronación completa,", "dedos un poco separados"]) +
    note(f1(cx1), f1(cy1 - 16), 520, 232, ["Colimar a los bordes de", "mano y muñeca, con las", "dos hileras del carpo"], AMB) +
    tecnica(520, 300, "24 x 30 vertical") + txt(12, 40, "Sentado, codo flexionado, protección en el regazo", 11.5, MUTE)
  );
};

I["mano-pa-oblicua"] = () => {
  const h = manoEsq({ s: 1.05, at: [92, 186], rot: 0, spread: 1.2, sx: 0.66, F: 120 });
  const m3 = h.pts.mcp[3];
  const c = corte({ rot: 45, at: [650, 262] });
  const hd = c.heads[1];
  return svg(
    view("1 · Desde el tubo") +
    riTop(40, 70, 320, 220) + txt(46, 304, "RI 24 x 30 vertical", 11.5, INK) +
    drawHand(h) + coll(60, 92, 290, 180) + crossP(m3) +
    note(m3[0] + 8, m3[1] + 6, 150, 318 - 6, ["RC ⟂ en la 3.ª MCF"], RED) +
    txt(12, 40, "Dedos un poco separados y paralelos al RI", 11.5, MUTE) +
    txt(12, 54, "Colimar mano y muñeca, con todo el carpo", 11.5, AMB) +
    panelSep("2 · Desde la punta de los dedos") +
    riBar(450, 716, 262) + cuna([650, 262], 45, 104, -1) + c.svg +
    beam(f1(hd[0]), f1(hd[1]), 90, 150) +
    arco([650, 262], 62, 180, 225, "45°", BLUE, 14) + labL([556, 254], -10, -30, "cuña de 45°") +
    labL(c.thumb, -30, -50, "pulgar") + lab(...c.heads[3], 700, 200, "5.º MC", "start") +
    bold(402, 302, "Mano y muñeca rotadas 45° hacia lateral") + txt(402, 318, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

// ======================= DEDOS =======================
I["dedos-pa"] = () => {
  const h = manoEsq({ s: 1.25, at: [150, 190], rot: 0, spread: 1.7, F: 150 });
  const f = h.pts.ifp[3], m = h.pts.mcp[3], t = h.pts.tip[3];
  return svg(
    view("Vista desde el tubo · mano en pronación sobre el RI") +
    riTop(260, 58, 230, 220) + txt(260, 296, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + refline(m[0] - 60, m[1] + 1, t[0] + 24, t[1]) +
    coll(m[0] - 34, m[1] - 20, t[0] - m[0] + 50, 38) + crossP(f) +
    note(f[0] + 6, f[1] - 8, 510, 60, ["RC perpendicular en la IFP", "del dedo a estudiar (aquí, 3.º)"], RED) +
    note(t[0] + 24, t[1], 510, 120, ["Eje largo del dedo centrado", "en la zona del RI que se expone"], BLUE) +
    note(t[0] + 16, m[1] + 18, 510, 172, ["Colimar alrededor del dedo,", "con la parte distal del", "metacarpiano"], AMB) +
    note(...h.pts.tip[5], 510, 238, ["Pronación, dedos separados"]) +
    lab(...h.pts.ifp[4], 420, 296, "IFP", "start") +
    txt(12, 300, "Sentado, codo a 90°,", 11.5, MUTE) + txt(12, 314, "plomo sobre el regazo", 11.5, MUTE) +
    txt(510, 286, "Varias tomas en un RI: cubrir con", 11, MUTE) + txt(510, 300, "plomo el resto del chasis.", 11, MUTE) +
    txt(510, 318, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["dedos-pa-oblicua"] = () => {
  const h = manoEsq({ s: 1.05, at: [70, 196], rot: 0, spread: 1.6, sx: 0.66, F: 100 });
  const f = h.pts.ifp[2], m = h.pts.mcp[2], t = h.pts.tip[2];
  const c = corte({ rot: 45, at: [650, 256] });
  const hd = c.heads[0];
  return svg(
    view("1 · Desde el tubo") +
    riTop(150, 62, 210, 210) + txt(150, 290, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(m[0] - 30, Math.min(m[1], t[1]) - 18, t[0] - m[0] + 44, Math.abs(t[1] - m[1]) + 36) + crossP(f) +
    note(f[0] + 4, f[1] - 8, 160, 44, ["RC ⟂ en la IFP (aquí, 2.º dedo)"], RED) +
    txt(12, 306, "Dedos separados; el dedo afectado,", 11.5, INK) + txt(12, 320, "paralelo al RI.", 11.5, INK) +
    panelSep("2 · Desde la punta de los dedos") +
    riBar(450, 716, 256) + cuna([650, 256], 45, 104, -1) + c.svg +
    beam(f1(hd[0]), f1(hd[1]), 90, 130) +
    arco([650, 256], 62, 180, 225, "45°", BLUE, 14) + labL([556, 248], -10, -30, "bloque de 45°") +
    labL(c.thumb, -30, -50, "pulgar") +
    bold(402, 296, "Mano rotada 45° hacia medial o lateral,") + bold(402, 311, "según el dedo") + txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

// ======================= PULGAR =======================
// vista desde el tubo de la AP: pulgar apoyado por su cara posterior, mano en rotación interna (de canto, detrás)
function pulgarAP() {
  const h = manoCanto({ s: 1.1, at: [164, 286], rot: -67, modo: "ext", F: 34 });
  return h;
}
const colPulgar = (h) => coll(h.pts.cmc1[0] - 34, h.pts.tip1[1] - 14, 70, h.pts.cmc1[1] - h.pts.tip1[1] + 48);
I["pulgar-ap"] = () => {
  const h = pulgarAP();
  const c = corte({ rot: -100, contact: [-73, 10], at: [600, 262] });
  return svg(
    view("1 · Desde el tubo") +
    riTop(60, 40, 200, 270) + txt(270, 300, "RI 18 x 24", 11.5, INK) + txt(270, 314, "vertical", 11.5, INK) +
    drawHand(h) + colPulgar(h) + crossP(h.pts.mcp1) +
    note(h.pts.mcp1[0] + 10, h.pts.mcp1[1], 270, 228, ["RC ⟂ en", "la 1.ª MCF"], RED, "start") +
    txt(270, 150, "Incluir todo el", 11, AMB) + txt(270, 164, "1.er metacarpiano", 11, AMB) + txt(270, 178, "y el carpo", 11, AMB) +
    panelSep("2 · Desde la punta de los dedos") +
    riBar(470, 716, 262) + c.svg + beam(f1(c.thumb[0]), f1(c.thumb[1] - 10), 90, 150) +
    lab(...c.T([0, 17]), 660, 150, "palma hacia afuera", "start") +
    labL(c.thumb, -40, -24, "pulgar") +
    bold(402, 294, "Mano en rotación interna: la cara posterior") + bold(402, 309, "del pulgar apoya en el RI") + txt(402, 324, "De pie o sentado · DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["pulgar-ap-axial-roberts"] = () => {
  const h = pulgarAP();
  // vista de costado: la mano se ve de frente (palma) y el pulgar apoyado sobre el RI
  const o = { s: 0.95, flip: true, dev: 50, cara: "palma", F: 90 };
  const g0 = manoEsq({ ...o, at: [0, 0], rot: 0 });
  const tv = [g0.pts.tip[1][0] - g0.pts.cmc1[0], g0.pts.tip[1][1] - g0.pts.cmc1[1]];
  const rr = -(Math.atan2(tv[1], tv[0]) * 180) / Math.PI;
  const g1 = manoEsq({ ...o, at: [0, 0], rot: rr });
  const yb = Math.max(g1.pts.cmc1[1], g1.pts.tip[1][1]);
  const g2 = manoEsq({ ...o, at: [560 - g1.pts.cmc1[0], 262 - 24 - yb], rot: rr });
  const c = g2.pts.cmc1;
  return svg(
    view("1 · Desde el tubo") +
    riTop(60, 40, 200, 270) + txt(270, 300, "RI 18 x 24", 11.5, INK) + txt(270, 314, "vertical", 11.5, INK) +
    drawHand(h) + colPulgar(h) + redDot(h.pts.cmc1) +
    note(h.pts.cmc1[0] + 6, h.pts.cmc1[1], 270, 228, ["RC en", "la 1.ª CMC"], RED, "start") +
    txt(270, 150, "Pulgar extendido;", 11, INK) + txt(270, 164, "incluir el trapecio", 11, AMB) +
    panelSep("2 · De costado (a lo largo del pulgar)") +
    riBar(420, 716, 262) + drawHand(g2) + redDot(c) +
    beam(f1(c[0]), f1(c[1]), 105, 200, { angLabel: "15°" }) + lab(...lerp(g2.pts.mcp[1], g2.pts.tip[1], 0.5), 690, 246, "pulgar") +
    txt(420, 120, "← proximal", 11, MUTE) + txt(716, 120, "distal →", 11, MUTE, "end") +
    bold(402, 294, "RC 15° hacia proximal, en la 1.ª CMC") +
    txt(402, 309, "Variante de Lewis: RC en la 1.ª MCF, 10-15° proximal", 11, INK) + txt(402, 324, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["pulgar-pa-oblicua"] = () => {
  const h = manoEsq({ s: 1.2, at: [160, 196], rot: 0, spread: 1.2, thumb: 22, F: 160 });
  const m1 = h.pts.mcp[1];
  return svg(
    view("Vista desde el tubo · mano en pronación, pulgar separado") +
    riTop(110, 34, 240, 280) + txt(116, 306, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(m1[0] - 70, h.pts.tip[1][1] - 16, 140, h.pts.cmc1[1] - h.pts.tip[1][1] + 46) + crossP(m1) +
    note(m1[0] + 8, m1[1] - 6, 520, 62, ["RC perpendicular al RI", "en la 1.ª articulación MCF"], RED) +
    note(...h.pts.tip[1], 520, 126, ["Pulgar en leve abducción:", "queda oblicuo, a unos 45°"]) +
    note(m1[0] + 66, h.pts.cmc1[1] + 10, 520, 190, ["Colimar el pulgar, con todo", "el 1.er metacarpiano y el carpo"], AMB) +
    txt(520, 254, "Sentado, mano sobre la mesa, codo", 11.5, MUTE) + txt(520, 268, "flexionado, plomo sobre el regazo.", 11.5, MUTE) +
    txt(520, 290, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["pulgar-lateral"] = () => {
  const h = manoEsq({ s: 1.2, at: [160, 196], rot: 0, spread: 0.6, sx: 0.5, flex: 0.45, thumb: 14, F: 160 });
  const m1 = h.pts.mcp[1];
  return svg(
    view("Vista desde el tubo · mano arqueada y rotada hacia medial") +
    riTop(110, 34, 240, 280) + txt(116, 306, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(m1[0] - 70, h.pts.tip[1][1] - 16, 140, h.pts.cmc1[1] - h.pts.tip[1][1] + 46) + crossP(m1) +
    note(m1[0] + 8, m1[1] - 6, 520, 62, ["RC perpendicular al RI", "en la 1.ª articulación MCF"], RED) +
    note(...h.pts.tip[1], 520, 126, ["Pulgar en lateral verdadera"]) +
    note(...h.pts.tip[4], 520, 172, ["Desde la pronación, mano un", "poco arqueada y rotada hacia", "medial"]) +
    note(m1[0] + 66, h.pts.cmc1[1] + 10, 520, 236, ["Colimar el pulgar, con todo", "el 1.er metacarpiano y el carpo"], AMB) +
    txt(520, 296, "Sentado · DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

// ======================= MUÑECA =======================
// mano de costado apoyada sobre el RI (palma abajo): se calcula la altura para que el punto más bajo toque el RI
// (antebrazo apoyado; con modo "arco" se busca la flexión de muñeca que deja las puntas de los dedos sobre el RI)
function cantoSobreRI(o, x, yRI) {
  let oo = { pulgarPlano: true, ...o };
  if (o.modo === "arco") {
    let best = 0, err = 1e9;
    for (let b = 0; b <= 40; b++) {
      const h = manoCanto({ ...oo, bend: b, at: [0, 0], rot: 0, flip: true });
      const e = Math.abs(Math.max(h.pts.tip2[1], h.pts.tip3[1]) - h.T([-19, 2])[1]);
      if (e < err) { err = e; best = b; }
    }
    oo = { ...oo, bend: best };
  }
  const h0 = manoCanto({ ...oo, at: [0, 0], rot: 0, flip: true });
  const yb = Math.max(h0.T([-19, 2])[1], h0.D([-29, -50])[1], h0.D([-24, -22])[1]);
  return manoCanto({ ...oo, at: [x, yRI - yb - 1.7], rot: 0, flip: true });
}
const munecaTxt = (y) => txt(12, y, "Sentado, antebrazo sobre la mesa, plomo en el regazo", 11, MUTE);

I["muneca-pa"] = () => {
  const h = manoEsq({ s: 1.2, at: [150, 176], rot: 0, flex: 0.85, F: 150 });
  const c = h.pts.carpo;
  const sv = cantoSobreRI({ s: 1.0, modo: "arco", F: 200 }, 540, 262);
  return svg(
    view("1 · Desde el tubo") +
    riTop(70, 52, 240, 236) + txt(70, 306, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(90, 100, 196, 150) + crossP(c) +
    note(c[0] + 6, c[1] + 8, 120, 278, ["RC ⟂ en la parte media del carpo"], RED) +
    txt(12, 40, "Pronación; mano y muñeca paralelas al borde del RI", 11, MUTE) +
    panelSep("2 · De costado") +
    riBar(420, 716, 262) + drawHand(sv) + beam(f1(sv.pts.carpo[0]), f1(sv.pts.carpo[1]), 90, 170) +
    note(sv.pts.tip3[0], sv.pts.tip3[1] - 14, 740, 110, ["Dedos flexionados,", "mano un poco arqueada"], INK, "end") +
    txt(402, 296, "Bajar el hombro para apoyar el antebrazo", 11.5, INK) + txt(402, 310, "y evitar que la muñeca rote.", 11.5, INK) +
    txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-pa-oblicua"] = () => {
  const h = manoEsq({ s: 1.15, at: [130, 186], rot: 0, flex: 0.7, sx: 0.66, F: 140 });
  const c = h.pts.carpo;
  const k = corte({ rot: 45, at: [650, 262] });
  const tg = lerp(k.heads[1], k.heads[2], 0.5);
  return svg(
    view("1 · Desde el tubo") +
    riTop(60, 60, 250, 220) + txt(60, 298, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(80, 106, 190, 150) + crossP(c) +
    note(c[0] + 6, c[1] + 8, 140, 318, ["RC ⟂ en la parte media del carpo"], RED) +
    txt(12, 40, "Mano y muñeca paralelas al borde del RI", 11, MUTE) +
    panelSep("2 · Desde la mano") +
    riBar(450, 716, 262) + cuna([650, 262], 45, 104, -1) + k.svg +
    beam(f1(tg[0]), f1(tg[1]), 90, 150) +
    arco([650, 262], 62, 180, 225, "45°", BLUE, 14) + labL([556, 254], -10, -30, "goma espuma 45°") +
    labL(k.thumb, -30, -50, "pulgar") +
    bold(402, 296, "Rotar mano y muñeca 45° hacia lateral;") + txt(402, 311, "dedos flexionados o bloque de 45°", 11.5, INK) +
    txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-lateral"] = () => {
  const h = manoCanto({ s: 1.2, at: [150, 180], rot: 0, modo: "ext", F: 150 });
  const c = h.pts.carpo;
  const k = corte({ rot: 90, contact: [56, 0], at: [560, 262] });
  return svg(
    view("1 · Desde el tubo") +
    riTop(70, 60, 240, 220) + txt(70, 298, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(90, 110, 190, 130) + crossP(c) +
    note(c[0] + 6, c[1] + 8, 120, 318, ["RC ⟂ en la parte media del carpo"], RED) +
    txt(12, 40, "Mano y muñeca paralelas al borde del RI", 11, MUTE) +
    panelSep("2 · Desde la mano") +
    riBar(450, 680, 262) + k.svg + beam(f1(k.T([0, 0])[0]), f1(k.T([0, 0])[1]), 90, 140) +
    note(...k.thumb, 600, 120, ["Lateral verdadera", "(pulgar arriba)"]) +
    txt(402, 296, "Bajar el hombro: húmero, antebrazo y muñeca", 11.5, INK) + txt(402, 310, "en el mismo plano horizontal. Apoyo si hace falta.", 11.5, INK) +
    txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-desviacion-radial"] = () => {
  const h = manoEsq({ s: 1.25, at: [170, 186], rot: 0, dev: -18, spread: 0.8, F: 170 });
  const c = h.pts.carpo;
  return svg(
    view("Vista desde el tubo · desde la PA de muñeca") +
    riTop(110, 40, 250, 270) + txt(116, 302, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(c[0] - 55, c[1] - 55, 110, 110) + crossP(c) +
    note(c[0] + 8, c[1] - 8, 520, 70, ["RC perpendicular al RI en la", "parte media del carpo"], RED) +
    note(...h.pts.tip[2], 520, 140, ["Desviación radial: llevar la mano", "hacia el lado del pulgar, todo", "lo que tolere"]) +
    note(c[0] + 55, c[1] + 40, 520, 226, ["Colimar al carpo", "(cuadrado de unos 7,5 cm)"], AMB) +
    txt(520, 290, "Protección sobre el regazo", 11, MUTE) + txt(520, 304, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-tunel-carpiano"] = () => {
  const o = { s: 0.92, modo: "ext", bend: 80, F: 260 };
  const h0 = manoCanto({ ...o, at: [0, 0], rot: 0, flip: true });
  const yb = h0.T([-19, 30])[1];
  const h = manoCanto({ ...o, at: [300, 262 - yb - 1.7], rot: 0, flip: true });
  const tg = h.D([-14, -40]);
  const a = h.D([0, -150]), b = h.D([0, 0]);
  const pdir = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return svg(
    view("Vista de costado · muñeca en hiperextensión") +
    riBar(40, 470, 262) + drawHand(h) +
    refline(a[0], a[1] - 30, b[0], b[1] + 6) +
    beam(f1(tg[0]), f1(tg[1]), pdir + 27.5, 200, { ref: pdir, angLabel: "25-30°" }) + redDot(tg) +
    note(tg[0] - 6, tg[1] + 4, 260, 170, ["RC 25-30° respecto del", "eje largo de la palma"], RED, "end") +
    note(a[0] - 2, a[1] - 20, 260, 80, ["Eje largo de la palma"], BLUE, "end") +
    txt(520, 60, "Centrado unos 2-3 cm distal", 12, INK, "start", 700) + txt(520, 76, "a la base del 3.er metacarpiano", 12, INK, "start", 700) +
    lines(520, 110, ["Hiperextensión (flexión dorsal)", "todo lo que tolere: el paciente", "sostiene los dedos hacia atrás", "con la otra mano."], 11.5, INK) +
    lines(520, 186, ["Rotar unos 10° hacia interno", "(hacia el radio).", "Trabajar rápido: puede doler."], 11.5, INK) +
    txt(520, 250, "Colimar al carpo (~7,5 cm)", 11.5, AMB) +
    tecnica(520, 290, "18 x 24 vertical") + txt(60, 300, "antebrazo sobre el RI →", 11, MUTE)
  );
};

// ======================= CODO Y ANTEBRAZO =======================
// brazo extendido sobre la mesa, visto desde el tubo (copiado de referencia-tecnicas1-superior.cjs)
function brazoMesa() {
  const m = mano(490, 177, 0, 2.1, "palma", false, true);
  const d = `M0,146 L300,149 C318,149 330,148 344,151 C372,154 400,156 430,157 L490,${m.a.split(",")[1]} ${m.seg} L430,197 C400,198 372,200 344,203 C330,205 318,205 300,205 L0,206 Z`;
  const huesos =
    boneAlong([7, 176], [338, 176], [[0, 7, 7], [0.8, 7, 7], [0.92, 20, 22], [0.97, 15, 16], [1, 11, 11]]) +
    boneAlong([336, 166], [486, 166], [[0, 9, 9], [0.12, 7, 7], [0.22, 5, 5], [0.88, 4, 4], [1, 5, 5]]) +
    boneAlong([344, 188], [486, 187], [[0, 6, 6], [0.06, 6, 6], [0.14, 4, 4], [0.8, 5, 5], [1, 9, 9]]);
  return { piel: piel(d), huesos, det: m.det };
}

// corte del codo visto desde la mano: piel + húmero distal con los epicóndilos, girado 'g' grados
function codoCorte(cx, yRI, g, lado) {
  const c = [cx, yRI - 46];
  const R = (p) => add(c, rotP(p, g));
  const sk = `<ellipse cx="${cx}" cy="${yRI - 46}" rx="56" ry="44" fill="${SK}" stroke="${SKO}" stroke-width="2" transform="rotate(${g} ${cx} ${yRI - 46})"/>`;
  const hum = hueso(cr([[-44, -4], [-36, -14], [-14, -16], [0, -11], [14, -16], [36, -14], [44, -4], [38, 8], [14, 13], [0, 9], [-14, 13], [-38, 8]].map(R), true));
  const em = R([-42, -2]), el = R([42, -2]);
  return { svg: sk + hum + refline(...add(em, sub(em, el), 0.25), ...add(el, sub(el, em), 0.25)) + bluePt(em) + bluePt(el), em, el, c };
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
// codo a 90° visto desde el tubo: húmero horizontal y antebrazo hacia arriba (adaptado de "Codo|Perfil")
function codoPerfil(largo = 82, sMano = 1.45) {
  const wy = 200 - largo - 0;
  const m = mano(330, 118 - (82 - largo), -90, sMano, "canto", true, false);
  const d = `M0,172 L298,172 Q304,170 305,160 L${m.a} ${m.seg} L356,160 C359,196 355,222 338,230 L0,228 Z`;
  const huesos =
    boneAlong([8, 200], [330, 200], [[0, 8, 8], [0.85, 8, 8], [0.95, 13, 13], [1, 10, 10]]) + hueso(circ(322, 200, 9)) +
    boneAlong([340, 224], [337, wy + 38], [[0, 9, 9], [0.1, 8, 8], [0.2, 5, 5], [0.9, 4, 4], [1, 5, 5]]) +
    boneAlong([318, 188], [322, wy + 38], [[0, 6, 6], [0.06, 6, 6], [0.12, 4, 4], [0.85, 5, 5], [1, 7, 7]]);
  return { piel: piel(d), huesos, det: m.det };
}
I["codo-lateral"] = () => {
  const c = codoPerfil();
  return svg(
    view("Vista desde el tubo · codo a 90° sobre la mesa") +
    riTop(250, 60, 170, 230, "RI 24 x 30 vertical", 256, 282) +
    c.piel + c.huesos + c.det +
    `<circle cx="322" cy="200" r="7" fill="none" stroke="${BLUE}" stroke-width="2.2"/>` +
    `<path d="M282,200 A40,40 0 0 1 322,160" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(280, 168, "90°", 12, BLUE, "end", 700) +
    coll(268, 112, 130, 140) + cross(322, 200) +
    lab(200, 204, 200, 250, "húmero", "end") + lab(344, 226, 380, 238, "olécranon") + lab(338, 140, 380, 140, "cúbito") + lab(321, 150, 380, 156, "radio") +
    note(332, 206, 470, 216, ["RC perpendicular en la parte", "media de la articulación"], RED) +
    note(336, 76, 470, 50, ["Mano y muñeca en", "lateral verdadera"]) +
    note(352, 120, 470, 118, ["Antebrazo paralelo al", "borde del chasis"]) +
    txt(470, 272, "Colimar con al menos 5 cm de", 11.5, AMB) + txt(470, 286, "antebrazo y de húmero", 11.5, AMB) +
    txt(470, 306, "DFRI 100 cm · sin parrilla", 11, MUTE) +
    txt(20, 268, "Bajar el hombro: húmero y", 11.5, INK) + txt(20, 282, "antebrazo en un mismo plano", 11.5, INK) + txt(20, 296, "sobre la mesa y el RI", 11.5, INK)
  );
};

// Coyle: vista de costado (mirando a lo largo del antebrazo); húmero horizontal hacia el hombro (izquierda)
function coyle(cx, dir, rotulo) {
  const y = 262, top = y - 46;
  const hum = piel(`M${cx - 250},${top} L${cx - 10},${top} C${cx + 20},${top} ${cx + 26},${y} ${cx},${y} L${cx - 250},${y} Z`);
  const humB = boneAlong([cx - 250, y - 23], [cx + 4, y - 23], [[0, 8, 8], [0.88, 8, 8], [0.97, 13, 13], [1, 9, 9]]);
  const fore = `<ellipse cx="${cx - 4}" cy="${y - 28}" rx="26" ry="27" fill="${SK}" stroke="${SKO}" stroke-width="2"/>`;
  const fb = hueso(circ(cx - 12, y - 30, 8)) + hueso(circ(cx + 6, y - 24, 9));
  const tg = [cx - 4, y - 28];
  return { svg: riBar(cx - 240, cx + 60, y, "") + hum + humB + fore + fb + redDot(tg) + beam(tg[0], tg[1], dir, 150, { angLabel: "45°" }), tg };
}
I["antebrazo-ap"] = () => {
  const b = brazoMesa();
  return svg(
    view("Vista desde el tubo · sentado al costado de la mesa") +
    riTop(232, 62, 300, 236, "RI 35 x 43 vertical", 238, 290) +
    b.piel + b.huesos + b.det +
    refline(311, 144, 311, 208) + dot(311, 154) + dot(311, 197) +
    coll(288, 126, 220, 100) + cross(412, 176) +
    lab(200, 172, 200, 230, "húmero", "end") + lab(380, 165, 380, 112, "cúbito", "end") + lab(380, 188, 380, 250, "radio", "end") +
    note(422, 176, 560, 90, ["RC perpendicular en el", "punto medio del antebrazo"], RED) +
    note(508, 226, 560, 160, ["Incluir muñeca y codo,", "con al menos 2,5 cm más", "allá de cada articulación"], AMB) +
    txt(560, 250, "Brazo extendido, mano", 12, INK, "start", 700) + txt(560, 266, "en supinación", 12, INK, "start", 700) +
    txt(560, 290, "Pacientes pequeños: RI 30 x 35", 11, MUTE) + txt(560, 304, "DFRI 100 cm · sin parrilla", 11, MUTE) +
    txt(30, 270, "Si hace falta, inclinar al", 11.5, INK) + txt(30, 284, "paciente hacia lateral para", 11.5, INK) + txt(30, 298, "una AP verdadera", 11.5, INK)
  );
};

I["antebrazo-lateral"] = () => {
  // codo a 90°: húmero horizontal, antebrazo vertical largo, mano de canto arriba
  const ex = 300, ey = 276, wy = 142;
  const h = manoCanto({ s: 0.52, at: [ex + 2, wy], rot: -90, modo: "ext", F: 30 });
  const d = `M0,${ey - 28} L${ex - 24},${ey - 28} L${ex - 8},${wy} L${ex + 13},${wy} L${ex + 28},${ey - 30} C${ex + 32},${ey + 10} ${ex + 20},${ey + 30} ${ex},${ey + 30} L0,${ey + 30} Z`;
  const huesos = boneAlong([8, ey], [ex + 8, ey], [[0, 8, 8], [0.85, 8, 8], [0.95, 13, 13], [1, 10, 10]]) + hueso(circ(ex, ey, 9)) +
    boneAlong([ex + 16, ey + 24], [ex + 8, wy + 2], [[0, 9, 9], [0.1, 8, 8], [0.2, 5, 5], [0.9, 4, 4], [1, 5, 5]]) +
    boneAlong([ex - 4, ey - 12], [ex - 2, wy + 2], [[0, 6, 6], [0.06, 6, 6], [0.12, 4, 4], [0.85, 5, 5], [1, 8, 8]]);
  const mid = [ex + 3, (ey + wy) / 2];
  return svg(
    view("Vista desde el tubo · codo a 90°") +
    riTop(220, 26, 170, 300) + txt(212, 318, "RI 35 x 43 vertical", 11.5, INK, "end") +
    piel(d) + huesos + drawHand(h) +
    coll(244, 30, 120, 290) + crossP(mid) +
    `<path d="M${ex - 40},${ey} A40,40 0 0 1 ${ex},${ey - 40}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(ex - 42, ey - 34, "90°", 12, BLUE, "end", 700) +
    lab(160, ey, 160, ey - 40, "húmero", "end") + lab(ex + 10, 190, 398, 180, "cúbito y radio") +
    note(mid[0] + 10, mid[1], 470, 150, ["RC perpendicular en el", "punto medio del antebrazo"], RED) +
    note(...h.pts.tip1, 470, 60, ["Mano y muñeca en lateral", "verdadera: radio y cúbito", "distales superpuestos"]) +
    note(364, 300, 470, 230, ["Incluir muñeca y codo, con al", "menos 2,5 cm más allá de cada uno"], AMB) +
    txt(470, 290, "Pacientes pequeños: RI 30 x 35", 11, MUTE) + txt(470, 304, "DFRI 100 cm · sin parrilla", 11, MUTE) +
    txt(20, 60, "Sentado al costado de la mesa,", 11.5, INK) + txt(20, 74, "protección en el regazo", 11.5, INK)
  );
};

// ======================= EXTREMIDAD SUPERIOR PEDIÁTRICA =======================
// niño en decúbito supino visto desde arriba, brazo en abducción sobre el RI
function nino(lateral) {
  const dy = lateral ? 40 : 0, Y = (y) => y + dy;
  const sh = [158, Y(132)], el = [290, Y(134)];
  const torso = piel(cr([[100, Y(98)], [120, Y(98)], [150, Y(112)], [166, Y(128)], [164, Y(200)], [160, Y(260)], [164, 326], [56, 326], [60, Y(260)], [56, Y(200)], [54, Y(128)], [70, Y(112)]], true));
  const otro = skin([{ pts: [[60, Y(132)], [44, Y(250)]], w: 22 }]) + hueso(circ(43, Y(262), 7)).replace(BONEO, SKO).replace(/fill="[^"]+"/, `fill="${SK}"`);
  let arm, bones, hand, wr, tipP;
  if (!lateral) {
    wr = [404, Y(136)];
    const h = manoEsq({ s: 0.42, at: wr, rot: 0, cara: "palma", flip: true, F: 10 });
    arm = skin([{ pts: [sh, el], w: 30 }, { pts: [el, wr], w: 24 }]);
    bones = boneAlong([170, Y(133)], [292, Y(134)], [[0, 7, 7], [0.85, 5, 5], [1, 8, 8]]) +
      boneAlong([296, Y(129)], [402, Y(131)], [[0, 4, 4], [0.5, 3, 3], [1, 4, 4]]) + boneAlong([296, Y(140)], [402, Y(141)], [[0, 3.5, 3.5], [0.5, 3, 3], [1, 5, 5]]);
    hand = drawHand(h); tipP = h.pts.tip[3];
  } else {
    wr = [292, Y(70)];
    const h = manoCanto({ s: 0.34, at: wr, rot: -90, modo: "ext", F: 10 });
    arm = skin([{ pts: [sh, el], w: 30 }, { pts: [el, wr], w: 24 }]);
    bones = boneAlong([170, Y(133)], [292, Y(134)], [[0, 7, 7], [0.85, 5, 5], [1, 8, 8]]) +
      boneAlong([294, Y(130)], [292, Y(74)], [[0, 5, 5], [0.5, 3, 3], [1, 4, 4]]) + boneAlong([286, Y(124)], [290, Y(74)], [[0, 3.5, 3.5], [0.5, 3, 3], [1, 5, 5]]);
    hand = drawHand(h); tipP = h.pts.tip2;
  }
  const py = Math.min(Y(262), 276);
  const plomo = `<rect x="52" y="${py}" width="116" height="44" rx="6" fill="#6b7280" fill-opacity=".55" stroke="#4b5563"/>` + txt(110, py + 26, "plomo", 11, "#fff", "middle", 700);
  return { svg: torso + otro + cabezaFrente(110, Y(70), 28) + arm + bones + hand + plomo, sh, el, wr, tipP };
}
const banda = (x, y1, y2) => `<rect x="${x}" y="${y1}" width="22" height="${y2 - y1}" fill="#9fc3e8" fill-opacity=".45" stroke="#5a8fc4" stroke-width="1"/>`;
const bolsa = (x, y) => `<rect x="${x}" y="${y}" width="44" height="22" rx="10" fill="#d9cfb8" stroke="#9c8f72" stroke-width="1.3"/>`;
I["ped-ext-sup-ap"] = () => {
  const n = nino(false);
  const mid = [f1((n.sh[0] + n.tipP[0]) / 2), n.el[1] + 1];
  return svg(
    view("Vista desde arriba · decúbito supino") +
    riTop(196, 82, 350, 110) + txt(196, 210, "RI según edad y tamaño", 11.5, INK) +
    n.svg + banda(240, 86, 188) + bolsa(476, 150) +
    coll(176, 98, 352, 76) + crossP(mid) +
    note(mid[0] + 8, mid[1] - 8, 560, 60, ["RC perpendicular en la", "parte media de la extremidad"], RED) +
    note(251, 92, 560, 116, ["Banda transparente o", "bolsas de arena para inmovilizar"], INK) +
    note(530, 140, 560, 170, ["Incluir toda la extremidad", "(salvo pedido puntual)"], AMB) +
    note(168, 290, 560, 250, ["Protección plomada", "sobre la pelvis"]) +
    txt(220, 236, "Brazo en abducción,", 12, INK, "start", 700) + txt(220, 252, "separado del cuerpo", 12, INK) +
    txt(220, 318, "Padres solo si hace falta, con guantes y delantal plomados.", 11, MUTE) +
    txt(560, 300, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};
I["ped-ext-sup-lateral"] = () => {
  const n = nino(true);
  const e = n.el;
  return svg(
    view("Vista desde arriba · decúbito supino") +
    riTop(184, 32, 200, 182) + txt(392, 206, "RI según edad", 11.5, INK) + txt(392, 220, "y tamaño", 11.5, INK) +
    n.svg + banda(196, 150, 200) + bolsa(316, 60) +
    coll(178, 38, 160, 166) + crossP(e) +
    `<path d="M${e[0] - 44},${e[1]} A44,44 0 0 1 ${e[0]},${e[1] - 44}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` +
    note(e[0] + 10, e[1] + 6, 470, 60, ["RC perpendicular en la", "parte media de la extremidad"], RED) +
    note(...n.tipP, 470, 120, ["Codo flexionado y toda la", "extremidad rotada a lateral"]) +
    note(207, 196, 470, 176, ["Inmovilizar: banda", "transparente, bolsas de arena", "o cinta"]) +
    note(168, 296, 470, 254, ["Protección plomada", "sobre la pelvis"]) +
    txt(196, 250, "Brazo en abducción,", 12, INK, "start", 700) + txt(196, 266, "separado del cuerpo", 12, INK) +
    txt(470, 300, "Padres solo si hace falta, con guantes", 11, MUTE) + txt(470, 314, "y delantal plomados · DFRI 100 cm", 11, MUTE)
  );
};

// ======================= VERSIONES (un esquema por posición; ver datos/versiones.js) =======================
// columna de texto a la derecha del dibujo
const col = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");

// ---- Mano lateral ----
I["mano-lateral--v1"] = () => {
  const a = manoCanto({ s: 1.2, at: [60, 180], rot: 0, modo: "abanico", F: 110 });
  return svg(
    view("Lateral en abanico · vista desde el tubo") +
    riTop(34, 50, 320, 226) + txt(40, 292, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(a) + coll(50, 64, 290, 196) + crossP(a.pts.mcp2) +
    note(a.pts.mcp2[0] + 6, a.pts.mcp2[1] + 8, 420, 230, ["RC perpendicular al RI", "en la 2.ª articulación MCF"], RED) +
    note(...a.pts.tip3, 420, 70, ["Dedos separados y abiertos", "sobre un soporte escalonado", "radiotransparente"]) +
    col(420, 140, [["Mano en lateral, lado del pulgar", INK, 700], ["hacia arriba", INK, 700], ["Metacarpianos en lateral verdadera", MUTE]]) +
    col(420, 300, [["Colimar a mano y muñeca, con todo el carpo", AMB, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["mano-lateral--v2"] = () => {
  const b = manoCanto({ s: 1.2, at: [60, 190], rot: 0, modo: "ext", F: 110 });
  return svg(
    view("Lateral en extensión · vista desde el tubo") +
    riTop(34, 60, 330, 210) + txt(40, 288, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(b) + coll(50, 84, 300, 160) + crossP(b.pts.mcp2) +
    note(b.pts.mcp2[0] + 6, b.pts.mcp2[1] + 8, 420, 230, ["RC perpendicular al RI", "en la 2.ª articulación MCF"], RED) +
    note(...b.pts.tip2, 420, 80, ["Dedos juntos y extendidos"]) +
    col(420, 130, [["Mano en lateral, lado del pulgar", INK, 700], ["hacia arriba", INK, 700], ["Se usa ante sospecha de cuerpo", INK], ["extraño o lesión de un metacarpiano", INK]]) +
    col(420, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// ---- AP bilateral oblicua de manos (Norgaard) ----
function norgaard(flex) {
  const L = manoEsq({ s: 0.92, at: [180, 270], rot: -90, sx: 0.66, cara: "palma", spread: 1.1, F: 26, flex });
  const R = manoEsq({ s: 0.92, at: [258, 270], rot: -90, sx: 0.66, cara: "palma", spread: 1.1, F: 26, flex, flip: true });
  const mid = lerp(L.pts.mcp[5], R.pts.mcp[5], 0.5);
  return { svg: riTop(50, 40, 340, 262) + drawHand(L) + drawHand(R) + coll(74, 56, 292, 230) + crossP(mid), mid, L, R };
}
const norgaardTxt = (x) => col(x, 128, [["Sentado, antebrazos y manos", INK, 700], ["extendidos, palmas arriba", INK, 700], ["Manos a 45°, bordes mediales", INK], ["juntos, sobre bloques de 45°", INK]]);
I["manos-ap-oblicua-norgaard--v1"] = () => {
  const n = norgaard(0);
  return svg(
    view("Dedos en extensión · vista desde el tubo") + n.svg + txt(50, 320, "RI 24 x 30 o 35 x 43 horizontal", 11, INK) +
    note(n.mid[0] + 8, n.mid[1] - 8, 430, 64, ["RC perpendicular, entre", "las 5.as articulaciones MCF"], RED) +
    norgaardTxt(430) + note(...n.R.pts.tip[2], 430, 214, ["Dedos en extensión completa", "sobre los bloques"]) +
    col(430, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["manos-ap-oblicua-norgaard--v2"] = () => {
  const n = norgaard(0.7);
  return svg(
    view("Variante «receptor de pelota» · desde el tubo") + n.svg + txt(50, 320, "RI 24 x 30 o 35 x 43 horizontal", 11, INK) +
    note(n.mid[0] + 8, n.mid[1] - 8, 430, 64, ["RC perpendicular, entre", "las 5.as articulaciones MCF"], RED) +
    norgaardTxt(430) + note(...n.R.pts.tip[2], 430, 214, ["Dedos en flexión parcial"]) +
    col(430, 236, [["Muestra bien metacarpianos y MCF,", MUTE], ["pero deforma las interfalángicas", MUTE]]) +
    col(430, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// ---- Lateral de dedos ----
I["dedos-lateral--v1"] = () => {
  const h = manoCanto({ s: 1.25, at: [40, 196], rot: 0, modo: "solo", solo: 3, F: 90 });
  const f = h.pts.ifp3, m = h.pts.mcp3, t = h.pts.tip3;
  const up = corte({ rot: 90, contact: [56, 0], at: [650, 286], s: 0.5 });
  return svg(
    view("Dedos 3.º a 5.º · lateromedial · desde el tubo") +
    riTop(150, 86, 240, 190) + txt(150, 294, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(m[0] - 26, m[1] - 18, t[0] - m[0] + 40, 36) + crossP(f) +
    note(f[0] + 4, f[1] - 8, 430, 60, ["RC perpendicular al RI", "en la IFP (aquí, 3.er dedo)"], RED) +
    note(...h.pts.tip1, 430, 124, ["Mano en lateral, lado del", "pulgar hacia arriba"]) +
    col(430, 184, [["Dedo paralelo al RI, alineado con", INK], ["el eje de la zona que se expone", INK]]) +
    riBar(600, 700, 286, "") + up.svg + lab(...up.thumb, 690, 236, "pulgar", "start") + txt(650, 322, "corte visto desde la punta de los dedos", 10.5, MUTE, "middle")
  );
};
I["dedos-lateral--v2"] = () => {
  const h = manoCanto({ s: 1.25, at: [40, 176], rot: 0, modo: "solo", solo: 2, F: 90, sinPulgar: true, flip: true });
  const f = h.pts.ifp2, m = h.pts.mcp2, t = h.pts.tip2;
  const dn = corte({ rot: -90, contact: [-73, 10], at: [650, 286], s: 0.5 });
  return svg(
    view("2.º dedo · mediolateral · desde el tubo") +
    riTop(150, 66, 240, 190) + txt(150, 274, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(m[0] - 26, m[1] - 18, t[0] - m[0] + 40, 36) + crossP(f) +
    note(f[0] + 4, f[1] + 8, 430, 60, ["RC perpendicular al RI", "en la IFP del 2.º dedo"], RED) +
    col(430, 116, [["Mano en lateral, lado del", INK, 700], ["pulgar hacia abajo", INK, 700], ["(el pulgar queda debajo,", MUTE], ["contra el RI)", MUTE]]) +
    col(430, 194, [["Dedo paralelo al RI, alineado con", INK], ["el eje de la zona que se expone", INK]]) +
    riBar(600, 700, 286, "") + dn.svg + lab(...dn.thumb, 720, 250, "pulgar", "start") + txt(650, 322, "corte visto desde la punta de los dedos", 10.5, MUTE, "middle")
  );
};

// ---- PA con desviación cubital (escafoides) ----
I["muneca-desviacion-cubital--v1"] = () => {
  const h = manoEsq({ s: 1.1, at: [150, 150], rot: 0, dev: 22, spread: 0.8, F: 150 });
  const e = h.pts.escafoides;
  return svg(
    view("Con desviación cubital · vista desde el tubo") +
    riTop(70, 40, 280, 250) + txt(70, 308, "RI 18 x 24 vertical", 11.5, INK) +
    drawHand(h) + coll(e[0] - 44, e[1] - 38, 98, 92) + redDot(e) +
    labL(e, -30, -46, "escafoides") +
    note(...h.pts.tip[3], 430, 214, ["Mano llevada hacia el lado", "cubital todo lo que tolere"]) +
    note(e[0] + 6, e[1] - 4, 430, 60, ["RC perpendicular al RI", "Otra opción: 10-15° hacia el codo,", "centrado en el escafoides"], RED) +
    col(430, 140, [["Desde la PA de muñeca", INK, 700], ["(lado del pulgar del carpo = escafoides)", MUTE]]) +
    col(430, 296, [["Colimar a la región del carpo", AMB, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["muneca-desviacion-cubital--v2"] = () => {
  // de costado: antebrazo sobre el RI y la mano apoyada en un bloque de 20°
  const yRI = 262, w = [300, yRI - 15];
  const h = manoCanto({ s: 0.9, at: w, rot: -20, flip: true, modo: "ext", F: 8, pulgarPlano: true });
  const arm = skin([{ pts: [[40, yRI - 1.7], [40, yRI - 42], [w[0] + 6, yRI - 40], [w[0] + 10, yRI - 1.7]] }]);
  const armB = boneAlong([44, yRI - 26], [w[0] + 2, yRI - 26], [[0, 6, 6], [0.9, 7, 7], [1, 9, 9]]) + boneAlong([44, yRI - 14], [w[0] + 2, yRI - 14], [[0, 5, 5], [0.9, 5, 5], [1, 6, 6]]);
  const c = h.pts.carpo;
  return svg(
    view("Stecher modificado · de costado") +
    riBar(40, 560, yRI) + cuna([w[0] + 6, yRI], 20, 220, 1) + arm + armB + drawHand(h) + redDot(c) +
    beam(f1(c[0]), f1(c[1]), 90, 170) +
    arco([w[0] + 6, yRI], 120, 0, -20, "20°", BLUE, 16) +
    txt(48, 200, "← codo", 11, MUTE) + labL([360, yRI - 4], -20, 34, "bloque de goma espuma a 20°") +
    note(c[0] + 6, c[1] - 6, 600, 70, ["RC perpendicular", "al RI"], RED) +
    col(600, 130, [["Si no puede hacer la", INK, 700], ["desviación cubital:", INK, 700], ["mano apoyada en un", INK], ["bloque de 20°", INK]]) +
    col(600, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// ---- AP de codo: extensión y flexión parcial ----
I["codo-ap--v1"] = () => {
  const b = brazoMesa();
  return svg(
    view("Extensión completa · vista desde el tubo") +
    riTop(226, 92, 220, 170, "RI 24 x 30 vertical", 232, 256) +
    b.piel + b.huesos + b.det +
    refline(311, 144, 311, 208) + dot(311, 154) + dot(311, 197) + txt(226, 82, "epicóndilos paralelos al RI", 11, BLUE) +
    coll(262, 118, 150, 116) + cross(336, 176) +
    lab(200, 172, 200, 130, "húmero", "end") + lab(306, 156, 250, 112, "epicóndilo medial", "end") +
    lab(306, 198, 250, 238, "epicóndilo lateral", "end") + lab(440, 165, 456, 130, "cúbito") + lab(440, 188, 456, 232, "radio") +
    note(346, 176, 470, 60, ["RC perpendicular en la parte", "media de la articulación del codo"], RED) +
    note(530, 186, 540, 262, ["Codo extendido, mano supinada"]) +
    txt(20, 290, "Si hace falta, inclinar al paciente hacia lateral (palpar los epicóndilos).", 11.5, INK) +
    txt(20, 310, "DFRI 100 cm · sin parrilla · colimar al área de interés", 11, MUTE)
  );
};
// codo en flexión parcial visto de costado: un segmento apoyado sobre el RI y el otro levantado
function codoFlexion(apoyado) {
  const yRI = 262, r = 20, E0 = [310, yRI - r - 2], L = 200, a = rad(32);
  const up = apoyado === "humero" ? [E0[0] + L * Math.cos(a), E0[1] - L * Math.sin(a)] : [E0[0] - L * Math.cos(a), E0[1] - L * Math.sin(a)];
  const flat = apoyado === "humero" ? [50, E0[1]] : [560, E0[1]];
  const hum = apoyado === "humero" ? flat : up, wrist = apoyado === "humero" ? up : flat;
  const dirF = Math.atan2(wrist[1] - E0[1], wrist[0] - E0[0]) * 180 / Math.PI;
  const h = manoCanto({ s: 0.75, at: wrist, rot: dirF, modo: "ext", F: 6, pulgarPlano: true, flip: apoyado === "humero" });
  const sk = skin([{ pts: [hum, E0], w: 2 * r + 4 }, { pts: [E0, wrist], w: 2 * r - 6 }]);
  const n = (p, q, k) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); return [-(q[1] - p[1]) / d * k, (q[0] - p[0]) / d * k]; };
  const off = n(E0, wrist, 6);
  const huesos = boneAlong(lerp(hum, E0, 0.02), lerp(hum, E0, 0.97), [[0, 7, 7], [0.85, 7, 7], [0.95, 12, 12], [1, 9, 9]]) +
    boneAlong(add(lerp(E0, wrist, 0.05), off), add(lerp(E0, wrist, 0.95), off), [[0, 6, 6], [0.15, 4, 4], [1, 5, 5]]) +
    boneAlong(add(lerp(E0, wrist, 0.03), off, -1), add(lerp(E0, wrist, 0.95), off, -1), [[0, 7, 7], [0.15, 4, 4], [1, 4, 4]]);
  return { svg: riBar(40, 580, yRI, "") + sk + huesos + drawHand(h), E0, hum, wrist, yRI };
}
I["codo-ap--v2"] = () => {
  const c = codoFlexion("humero"), tg = [c.E0[0] - 26, c.E0[1]];
  return svg(
    view("Flexión parcial · húmero apoyado · de costado") + c.svg + redDot(tg) + beam(tg[0], tg[1], 90, 170) +
    txt(48, 214, "← hombro", 11, MUTE) + lab(160, c.E0[1], 150, 300, "húmero apoyado paralelo al RI", "start") + lab(...lerp(c.E0, c.wrist, 0.55), 470, 230, "antebrazo") +
    note(tg[0] - 6, tg[1] - 6, 60, 70, ["RC perpendicular", "al húmero distal"], RED) +
    col(600, 120, [["Si el codo no se", INK, 700], ["extiende del todo:", INK, 700], ["dos AP. Esta, con el", INK], ["húmero paralelo al RI", INK]]) +
    col(600, 300, [["RI 24 x 30 vertical", INK, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["codo-ap--v3"] = () => {
  const c = codoFlexion("antebrazo"), tg = [c.E0[0] + 26, c.E0[1]];
  return svg(
    view("Flexión parcial · antebrazo apoyado · de costado") + c.svg + redDot(tg) + beam(tg[0], tg[1], 90, 170) +
    lab(...lerp(c.E0, c.hum, 0.6), 100, 290, "húmero", "end") + txt(60, 100, "hombro ↖", 11, MUTE) +
    lab(440, c.E0[1], 450, 300, "antebrazo apoyado paralelo al RI", "start") +
    note(tg[0] + 6, tg[1] - 6, 600, 60, ["RC perpendicular al", "antebrazo proximal"], RED) +
    col(600, 120, [["Si el codo no se", INK, 700], ["extiende del todo:", INK, 700], ["dos AP. Esta, con el", INK], ["antebrazo paralelo al RI", INK]]) +
    col(600, 300, [["RI 24 x 30 vertical", INK, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// ---- AP oblicua de codo ----
function codoOblicua(medial) {
  const k = codoCorte(250, 262, medial ? -45 : 45);
  return k;
}
I["codo-ap-oblicua--v1"] = () => {
  // panel 1: desde el tubo, brazo extendido sobre la mesa en oblicua medial (anatomia.cjs), 4,4 px = 1 cm
  const s = 5.8, C = [108, 212], g = -20;
  const T = A.X({ s, at: C, rot: g });
  const brazo = A.perfilHueso([[-40, 0], [-12, 0], [0, 0], [10, 0], [25.6, 0]], [[0, 4.6], [0.4, 4.3], [0.52, 4.05], [0.62, 4.1], [0.8, 3.5], [1, 2.75]], 0.4).map(T);
  const h = A.manoPA({ T: A.X({ s, at: T([25.8, 0]), rot: 90 + g }), antebrazo: 1.5, unas: false });
  const k = A.codoOblicuoMedial({ T, largoH: 40, largoA: 25.4 });
  const riW = 30 * s, riH = 24 * s;
  const c = k.P.centro, rotG = (inner) => `<g transform="rotate(${g} ${f1(c[0])} ${f1(c[1])})">${inner}</g>`;
  const p1 = `<clipPath id="cpCO1"><rect x="0" y="30" width="384" height="300"/></clipPath><g clip-path="url(#cpCO1)">` +
    rotG(riTop(f1(c[0] - riW / 2), f1(c[1] - riH / 2), f1(riW), f1(riH))) + A.pielUnida([brazo, ...h.piel]) + h.huesos + k.svg + `</g>` +
    rotG(coll(f1(c[0] - 64), f1(c[1] - 44), 128, 88)) + cross(f1(c[0]), f1(c[1]));
  // panel 2: corte del codo visto desde la mano, epicóndilos a 45° del RI
  const yRI = 276, k0 = A.corteCodo({ T: A.X({ s: 8.6, at: [478, 0] }), g: -45 });
  const kc = A.corteCodo({ T: A.X({ s: 8.6, at: [478, yRI - 1 - k0.fondo] }), g: -45 });
  const ctr = kc.c, em = kc.em, el = kc.el;
  const ext = (a, b, t) => [a[0] + (a[0] - b[0]) * t, a[1] + (a[1] - b[1]) * t];
  const p2 = `<line x1="392" y1="14" x2="392" y2="322" stroke="#e2e4ea"/>` + txt(404, 20, "2 · CORTE, VISTO DESDE LA MANO", 12, MUTE, "start", 700).replace("<text ", '<text letter-spacing=".06em" ') +
    riBar(410, 548, yRI, "RI") + kc.svg +
    `<line x1="${f1(ctr[0])}" y1="58" x2="${f1(ctr[0])}" y2="${f1(ctr[1] - 10)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` +
    refline(...ext(em, el, 0.3).map(f1), ...ext(el, em, 0.3).map(f1)) + bluePt(em) + bluePt(el) +
    `<line x1="${f1(ctr[0] - 64)}" y1="${f1(ctr[1])}" x2="${f1(ctr[0] + 64)}" y2="${f1(ctr[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="3 4"/>` +
    arco(ctr, 56, 0, -45, "45°", BLUE, 16) +
    labL(em, -16, -30, "medial") + lab(...el, 520, 132, "lateral") + txt(404, 318, "línea de los epicóndilos a 45°", 11, BLUE);
  return svg(
    view("1 · Oblicua medial (interna) · desde el tubo") + p1 + p2 +
    lab(...k.P.epicondiloMedial, 96, 124, "epicóndilo medial", "end") + lab(...k.P.coronoides, 196, 110, "coronoides") +
    lab(...k.P.cabezaRadio, 196, 262, "cabeza del radio") + txt(196, 276, "sobre el cúbito", 10.5, BONEO, "start").replace("<text ", '<text font-style="italic" ') + labL(k.P.humero, -4, 40, "húmero") +
    txt(196, 304, "Mano en pronación: el radio", 11.5, MUTE) + txt(196, 319, "cruza sobre el cúbito", 11.5, MUTE) +
    note(f1(c[0] - 4), f1(c[1] - 8), 12, 56, ["RC ⟂ al RI, en la parte media", "de la articulación del codo"], RED) +
    col(572, 62, [["Codo extendido y", INK, 700, 12.5], ["mano en pronación", INK, 700, 12.5]]) +
    col(572, 106, [["Palpar los epicóndilos", INK], ["para confirmar una", INK], ["rotación interna de 45°", INK]]) +
    col(572, 170, [["Muestra mejor la", MUTE], ["apófisis coronoides", MUTE]]) +
    col(572, 214, [["RI 24 x 30 vertical", MUTE, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["codo-ap-oblicua--v2"] = () => {
  const k = codoOblicua(false);
  return svg(
    view("Oblicua lateral (externa) · vista desde la mano") +
    riBar(100, 400, 262, "RI") + k.svg + beam(f1(k.c[0]), f1(k.c[1]), 90, 150) +
    `<line x1="${f1(k.c[0] - 90)}" y1="${f1(k.c[1])}" x2="${f1(k.c[0] + 90)}" y2="${f1(k.c[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="3 4"/>` +
    arco(k.c, 80, 180, 225, "40-45°", BLUE, 22) +
    lab(...k.el, 340, 250, "lateral") + labL(k.em, -20, -44, "medial") +
    note(k.c[0] + 6, k.c[1] + 6, 470, 300, ["RC perpendicular al RI en la parte", "media de la articulación del codo"], RED) +
    col(470, 70, [["Codo extendido y mano", INK, 700, 12.5], ["en supinación", INK, 700, 12.5]]) +
    col(470, 120, [["Codo rotado hacia afuera 40-45°", INK], ["(palpar los epicóndilos)", INK], ["Cuesta más: inclinar el tronco", INK], ["hacia lateral si hace falta", INK]]) +
    col(470, 200, [["Muestra mejor la cabeza y el", MUTE], ["cuello del radio", MUTE]]) +
    col(470, 246, [["RI 24 x 30 vertical · DFRI 100 cm", MUTE, 400, 11], ["sin parrilla", MUTE, 400, 11]])
  );
};

// ---- Axial de codo (Coyle) ----
I["codo-axial-coyle--v1"] = () => {
  const a = coyle(330, 135);
  return svg(
    view("Cabeza del radio · de costado") + a.svg +
    txt(90, 200, "← hombro", 11, MUTE) + lab(316, 234, 300, 120, "antebrazo (hacia el observador)", "end") +
    note(a.tg[0] + 6, a.tg[1] + 8, 470, 300, ["RC 45° hacia el hombro,", "en la cabeza del radio"], RED) +
    col(470, 70, [["Codo flexionado 90° si se", INK, 700, 12.5], ["puede, mano en pronación", INK, 700, 12.5]]) +
    col(470, 120, [["El RC entra por la parte media", INK], ["de la articulación del codo", INK]]) +
    col(470, 180, [["RI 24 x 30 vertical · DFRI 100 cm", MUTE, 400, 11], ["sin parrilla", MUTE, 400, 11]])
  );
};
I["codo-axial-coyle--v2"] = () => {
  const b = coyle(330, 45);
  return svg(
    view("Apófisis coronoides · de costado") + b.svg +
    txt(90, 200, "← hombro", 11, MUTE) + lab(316, 234, 300, 112, "antebrazo (hacia el observador)", "end") +
    note(b.tg[0] + 6, b.tg[1] + 8, 470, 300, ["RC 45° alejándose del", "hombro, en la coronoides"], RED) +
    col(470, 70, [["Codo flexionado solo 80°,", INK, 700, 12.5], ["mano en pronación", INK, 700, 12.5]]) +
    col(470, 120, [["El RC entra por la parte media", INK], ["de la articulación del codo", INK]]) +
    col(470, 180, [["RI 24 x 30 vertical · DFRI 100 cm", MUTE, 400, 11], ["sin parrilla", MUTE, 400, 11]])
  );
};

module.exports = I;
