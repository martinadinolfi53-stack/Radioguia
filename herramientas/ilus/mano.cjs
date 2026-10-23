// Esquemas de codo, antebrazo, muñeca, mano, dedos, pulgar y extremidad superior pediátrica.
// Estilo aprobado (contorno continuo color piel + huesos "por transparencia"). Helpers de codo/antebrazo copiados de
// referencia-tecnicas1-superior.cjs; mano esquelética, cortes desde los dedos y vistas laterales nuevos.
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONEO, riTop, beam, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, mk, cabezaFrente, titulo, separador, poli, encajar } = E;

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
  const f = E.figura("mano-pa", { en: ["mcf3_R", 330, 186], ppc: 13 });
  const m3 = f.p("mcf3_R"), cm = f.ppc, tip = f.p("punta_dedo3_R");
  const x0 = f1(f.p("estiloides_radio_R")[0] - 2.5 * cm), x1 = f1(tip[0] + 0.8 * cm);
  return svg(
    view("Vista desde el tubo · mano apoyada en el RI") +
    riTop(120, 50, 360, 252) + txt(120, 318, "RI 24 x 30", 12, INK) +
    refline(20, 186, 470, 186) +
    f.svg + coll(x0, f1(f.y - 0.6 * cm), f1(x1 - x0), f1(f.h + 1.2 * cm)) + crossP(m3) +
    lab(...f.p("centro:Right hamate"), 210, 288, "carpo", "end") +
    lab(...f.p("centro:Right fourth metacarpal bone"), 300, 288, "metacarpianos") +
    lab(...f.p("centro:Middle phalanx of right little finger"), 420, 288, "falanges") +
    note(m3[0] + 10, m3[1] - 4, 520, 62, ["RC perpendicular al RI", "en la 3.ª articulación MCF"], RED) +
    note(470, 186, 520, 122, ["Eje de mano y muñeca", "paralelo al borde del RI"], BLUE) +
    note(tip[0], tip[1] - 6, 520, 176, ["Pronación completa,", "dedos un poco separados"]) +
    note(x1, f1(f.y + f.h + 0.6 * cm), 520, 232, ["Colimar a los bordes de", "mano y muñeca, con las", "dos hileras del carpo"], AMB) +
    tecnica(520, 300, "24 x 30 vertical") + txt(12, 40, "Sentado, codo flexionado, protección en el regazo", 11.5, MUTE)
  );
};

I["mano-pa-oblicua"] = () => {
  // 1: desde el tubo, como en la fig. 2.18 (muñeca arriba, dedos hacia abajo)
  const f = E.figura("mano-pa-oblicua", { en: ["mcf3_R", 180, 206], ppc: 9 });
  const m3 = f.p("mcf3_R"), cm = f.ppc;
  const yc0 = f1(f.p("estiloides_radio_R")[1] - 2.5 * cm), yc1 = f1(f.y + f.h + 0.6 * cm);
  // 2: en perspectiva desde adelante, arriba y del lado del pulgar, con el RI y la cuña de 45°
  const g = encajar("mano-pa-oblicua-perspectiva", ["ri0", "ri1", "ri2", "ri3"], [410, 92, 340, 178]);
  const r0 = g.p("rc0"), r1 = g.p("rc1"), ang = (Math.atan2(r0[1] - r1[1], r0[0] - r1[0]) * 180) / Math.PI;
  const a1 = g.p("cA1"), b1 = g.p("cB1"), t1 = g.p("cT1");
  return svg(
    titulo(12, "", "Desde el tubo") +
    riTop(92, 46, 176, 266) + txt(278, 306, "RI 24 x 30", 11, INK) + txt(278, 320, "vertical", 11, INK) +
    f.svg + coll(f1(f.x - 0.6 * cm), yc0, f1(f.w + 1.2 * cm), f1(yc1 - yc0)) + crossP(m3) +
    note(m3[0] + 8, m3[1] - 4, 282, 150, ["RC ⟂ en", "la 3.ª MCF"], RED) +
    note(...f.p("punta_dedo3_R"), 282, 236, ["Dedos un poco", "separados y", "paralelos al RI"]) +
    txt(282, 62, "Colimar mano", 11, AMB) + txt(282, 76, "y muñeca, con", 11, AMB) + txt(282, 90, "todo el carpo", 11, AMB) +
    separador() + titulo(402, "", "En perspectiva, desde adelante", "otra") +
    poli(g, ["ri0", "ri1", "ri2", "ri3"], "#eceef2", INK, 2) +
    poli(g, ["cB0", "cB1", "cT1", "cT0"], "#d5d9e1") + poli(g, ["cA0", "cA1", "cT1", "cT0"], "#e3e6ec") +
    poli(g, ["cA1", "cB1", "cT1"], "#c9ced8") +
    g.svg + beam(r0[0], r0[1], ang, 80) + redDot(r0, 4) +
    txt(f1((a1[0] + b1[0] + t1[0]) / 3), f1((a1[1] + b1[1] + t1[1]) / 3 + 5), "45°", 12.5, BLUE, "middle", 700) +
    lab(...lerp(b1, t1, 0.4), 744, f1(b1[1] - 40), "cuña de 45°", "end") +
    bold(402, 294, "Mano y muñeca rotadas 45° hacia lateral (rotación parcial)") +
    txt(402, 309, "Sentado, codo flexionado, plomo en el regazo", 11, MUTE) + txt(402, 324, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

// ======================= DEDOS =======================
// colimación alrededor de un dedo: desde la parte distal del metacarpiano hasta la punta (alto: unos 3,5 cm)
function colDedo(f, mcf, punta, alto = 3.6) {
  const cm = f.ppc, a = f.p(mcf), t = f.p(punta), x0 = f1(a[0] - 1.6 * cm), x1 = f1(t[0] + 0.7 * cm), yc = (a[1] + t[1]) / 2;
  return coll(x0, f1(yc - alto / 2 * cm), f1(x1 - x0), f1(alto * cm));
}
I["dedos-pa"] = () => {
  const f = E.figura("dedos-pa", { en: ["ifp3_R", 380, 168], ppc: 12 });
  const i3 = f.p("ifp3_R"), m = f.p("mcf3_R"), t = f.p("punta_dedo3_R");
  return svg(
    view("Vista desde el tubo · mano en pronación sobre el RI") +
    riTop(260, 58, 230, 220) + txt(260, 296, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + refline(f1(m[0] - 5 * f.ppc), m[1], f1(t[0] + 2 * f.ppc), t[1]) +
    colDedo(f, "mcf3_R", "punta_dedo3_R") + crossP(i3) +
    note(i3[0] + 6, i3[1] - 8, 510, 60, ["RC perpendicular en la IFP", "del dedo a estudiar (aquí, 3.º)"], RED) +
    note(f1(t[0] + 2 * f.ppc), t[1], 510, 120, ["Eje largo del dedo centrado", "en la zona del RI que se expone"], BLUE) +
    note(f1(t[0] + 0.7 * f.ppc), f1(t[1] + 1.8 * f.ppc), 510, 172, ["Colimar alrededor del dedo,", "con la parte distal del", "metacarpiano"], AMB) +
    note(...f.p("punta_dedo5_R"), 510, 238, ["Pronación, dedos separados"]) +
    lab(...f.p("ifp4_R"), 420, 296, "IFP", "start") +
    txt(12, 300, "Sentado, codo a 90°,", 11.5, MUTE) + txt(12, 314, "plomo sobre el regazo", 11.5, MUTE) +
    txt(510, 286, "Varias tomas en un RI: cubrir con", 11, MUTE) + txt(510, 300, "plomo el resto del chasis.", 11, MUTE) +
    txt(510, 318, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["dedos-pa-oblicua"] = () => {
  const f = E.figura("dedos-pa-oblicua", { en: ["ifp2_R", 270, 170], ppc: 11 });
  const i2 = f.p("ifp2_R");
  const c = E.corte("dedos-pa-oblicua-corte", { en: ["apoyo", 540, 256], ppc: 12 });
  // los dedos (cortados por separado) apoyan en el bloque: tangente a todos los contornos
  const t = c.extremo((q) => q[0] + q[1], true), v = [f1(t[0] + t[1] - 256), 256], L = f1(c.caja[0] + c.caja[2] - v[0] + 6);
  // en el corte, el 2.º dedo es el penúltimo contando desde el pulgar (arriba a la derecha)
  const dedo2 = c.hueso("Proximal phalanx of right index finger");
  return svg(
    view("1 · Desde el tubo") +
    riTop(150, 62, 210, 210) + txt(150, 290, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colDedo(f, "mcf2_R", "punta_dedo2_R") + crossP(i2) +
    note(i2[0] + 4, i2[1] - 8, 160, 44, ["RC ⟂ en la IFP (aquí, 2.º dedo)"], RED) +
    txt(12, 306, "Dedos separados; el dedo afectado,", 11.5, INK) + txt(12, 320, "paralelo al RI.", 11.5, INK) +
    panelSep("2 · Desde la punta de los dedos") +
    riBar(450, 716, 256) + cuna(v, 45, L, 1) + c.svg +
    beam(dedo2[0], f1(dedo2[1] - 0.9 * c.ppc), 90, 110) +
    arco(v, 46, 315, 360, "45°", BLUE, 14) + lab(f1(v[0] + L * 0.75), 248, f1(v[0] + L - 10), 290, "bloque de 45°") +
    ((q) => q ? lab(...q, f1(v[0] + L + 6), 120, "pulgar") : "")(c.primero("Distal phalanx of right thumb", "Proximal phalanx of right thumb", "Right first metacarpal bone")) +
    bold(402, 296, "Mano rotada 45° hacia medial o lateral,") + bold(402, 311, "según el dedo") + txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

// ======================= PULGAR =======================
// vista desde el tubo de la AP: pulgar apoyado por su cara posterior, mano en rotación interna (de canto, detrás)
const pulgarAP = () => E.figura("pulgar-ap", { en: ["mcf1_R", 150, 190], ppc: 9.5 });
// colimación del pulgar: todo el 1.er metacarpiano y el carpo (desde la punta del pulgar hasta 2,5 cm proximal a la CMC)
function colPulgar(f, vertical = true) {
  const cm = f.ppc, t = f.p("punta_dedo1_R"), c = f.p("cmc1_R");
  if (vertical) return coll(f1(c[0] - 3 * cm), f1(t[1] - cm), f1(6 * cm), f1(c[1] - t[1] + 3.5 * cm));
  const xa = Math.min(t[0], c[0]) - 2.5 * cm, xb = Math.max(t[0], c[0]) + cm, ya = Math.min(t[1], c[1]) - 2.5 * cm, yb = Math.max(t[1], c[1]) + 2.5 * cm;
  return coll(f1(xa), f1(ya), f1(xb - xa), f1(yb - ya));
}
I["pulgar-ap"] = () => {
  // 1: desde el tubo, como en la fig. 2.7 (antebrazo arriba, pulgar hacia abajo, los demás dedos a un costado)
  const f = E.figura("pulgar-ap", { en: ["mcf1_R", 150, 238], ppc: 8.2 });
  const m1 = f.p("mcf1_R"), cm = f.ppc, t = f.p("punta_dedo1_R"), c1 = f.p("cmc1_R");
  // 2: de costado, desde lateral: se ve la palma (hacia afuera) y el pulgar apoyado sobre el RI; el codo queda a la izquierda
  const g = E.figura("pulgar-ap-costado", { en: ["mcf1_R", 690, 210], ppc: 4.6 });
  const g1 = g.p("mcf1_R"), yRI = f1(g.abajo(g.p("cmc1_R")[0], g.p("punta_dedo1_R")[0]) + 1);
  return svg(
    titulo(12, "", "Desde el tubo") +
    riTop(84, 104, 148, 206) + txt(240, 306, "RI 18 x 24", 11, INK) + txt(240, 320, "vertical", 11, INK) +
    f.svg + coll(f1(Math.min(c1[0], t[0]) - 2.6 * cm), f1(c1[1] - 2.8 * cm), f1(Math.abs(c1[0] - t[0]) + 5.2 * cm), f1(t[1] - c1[1] + 3.8 * cm)) + crossP(m1) +
    note(m1[0] + 10, m1[1] + 4, 252, 196, ["RC ⟂ en", "la 1.ª MCF"], RED) +
    note(...t, 252, 262, ["Pulgar alineado", "con el eje largo", "del RI"]) +
    txt(270, 60, "Incluir todo el", 11, AMB) + txt(270, 74, "1.er metacarpiano", 11, AMB) + txt(270, 88, "y el carpo", 11, AMB) +
    separador() + titulo(402, "", "De costado, desde lateral", "otra") +
    riBar(470, 740, yRI) + g.svg + beam(g1[0], f1(g1[1] - 6), 90, 120) +
    lab(...g.p("codo_R"), 450, 90, "codo", "start") +
    lab(f1(g1[0] - 4 * g.ppc), f1(g1[1] - 6 * g.ppc), 560, 90, "palma hacia afuera", "middle") +
    lab(...lerp(g1, g.p("punta_dedo1_R"), 0.5), 744, f1(yRI + 24), "pulgar sobre el RI", "end") +
    bold(402, 279, "Mano en rotación interna (pulgar en AP), palma") + bold(402, 294, "hacia afuera: la cara posterior del pulgar") +
    bold(402, 309, "apoya en el RI") + txt(402, 324, "De pie o sentado · DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};
I["pulgar-ap-axial-roberts"] = () => {
  const f = pulgarAP(), c1 = f.p("cmc1_R");
  // vista de costado (desde lateral): se ve la palma y el pulgar apoyado sobre el RI
  const g = E.figura("pulgar-ap-costado", { en: ["cmc1_R", 540, 230], ppc: 9 });
  const c = g.p("cmc1_R"), yRI = f1(g.abajo(g.p("mcf1_R")[0], g.p("punta_dedo1_R")[0]) - 3);   // el RI, donde apoya el pulgar
  return svg(
    view("1 · Desde el tubo") +
    riTop(60, 40, 200, 270) + txt(270, 300, "RI 18 x 24", 11.5, INK) + txt(270, 314, "vertical", 11.5, INK) +
    f.svg + colPulgar(f) + redDot(c1) +
    note(c1[0] + 6, c1[1], 270, 228, ["RC en", "la 1.ª CMC"], RED, "start") +
    txt(270, 150, "Pulgar extendido;", 11, INK) + txt(270, 164, "incluir el trapecio", 11, AMB) +
    panelSep("2 · De costado (a lo largo del pulgar)") +
    riBar(420, 716, yRI) + g.svg + redDot(c) +
    beam(c[0], c[1], 105, 170, { angLabel: "15°" }) + lab(...lerp(g.p("mcf1_R"), g.p("punta_dedo1_R"), 0.5), 690, f1(yRI - 16), "pulgar") +
    txt(420, 70, "← proximal", 11, MUTE) + txt(716, 70, "distal →", 11, MUTE, "end") +
    bold(402, 294, "RC 15° hacia proximal, en la 1.ª CMC") +
    txt(402, 309, "Variante de Lewis: RC en la 1.ª MCF, 10-15° proximal", 11, INK) + txt(402, 324, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};
I["pulgar-pa-oblicua"] = () => {
  const f = E.figura("pulgar-pa-oblicua", { en: ["mcf1_R", 230, 130], ppc: 13 });
  const m1 = f.p("mcf1_R"), t = f.p("punta_dedo1_R"), c1 = f.p("cmc1_R");
  return svg(
    view("Vista desde el tubo · mano en pronación, pulgar separado") +
    riTop(110, 34, 240, 280) + txt(116, 306, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colPulgar(f, false) + crossP(m1) +
    note(m1[0] + 8, m1[1] - 6, 520, 62, ["RC perpendicular al RI", "en la 1.ª articulación MCF"], RED) +
    note(...t, 520, 126, ["Pulgar en leve abducción:", "queda oblicuo, a unos 45°"]) +
    note(f1(c1[0] + 2.5 * f.ppc), f1(c1[1] + 2 * f.ppc), 520, 190, ["Colimar el pulgar, con todo", "el 1.er metacarpiano y el carpo"], AMB) +
    txt(520, 254, "Sentado, mano sobre la mesa, codo", 11.5, MUTE) + txt(520, 268, "flexionado, plomo sobre el regazo.", 11.5, MUTE) +
    txt(520, 290, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};
I["pulgar-lateral"] = () => {
  const f = E.figura("pulgar-lateral", { en: ["mcf1_R", 230, 130], ppc: 13 });
  const m1 = f.p("mcf1_R"), t = f.p("punta_dedo1_R"), c1 = f.p("cmc1_R");
  return svg(
    view("Vista desde el tubo · mano arqueada y rotada hacia medial") +
    riTop(110, 34, 240, 280) + txt(116, 306, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colPulgar(f, false) + crossP(m1) +
    note(m1[0] + 8, m1[1] - 6, 520, 62, ["RC perpendicular al RI", "en la 1.ª articulación MCF"], RED) +
    note(...t, 520, 126, ["Pulgar en lateral verdadera"]) +
    note(f1(f.x + f.w - 2 * f.ppc), f1(f.y + f.h - 2 * f.ppc), 520, 172, ["Desde la pronación, mano un", "poco arqueada y rotada hacia", "medial"]) +
    note(f1(c1[0] + 2.5 * f.ppc), f1(c1[1] + 2.5 * f.ppc), 520, 236, ["Colimar el pulgar, con todo", "el 1.er metacarpiano y el carpo"], AMB) +
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

// colimación de muñeca: radio y cúbito distales (unos 3 cm proximal a la estiloides radial) hasta la mitad de los metacarpianos
function colMuneca(f) {
  const cm = f.ppc, x0 = f.p("estiloides_radio_R")[0] - 3 * cm, x1 = (f.p("base_mc3_R")[0] + f.p("mcf3_R")[0]) / 2;
  const [ya, yb] = f.rango(Math.min(x0, x1), Math.max(x0, x1));
  return coll(f1(Math.min(x0, x1)), f1(ya - 0.5 * cm), f1(Math.abs(x1 - x0)), f1(yb - ya + cm));
}
// colimación al carpo: cuadrado de unos 7,5 cm centrado en el punto c
const colCarpo = (f, c) => coll(f1(c[0] - 3.75 * f.ppc), f1(c[1] - 3.75 * f.ppc), f1(7.5 * f.ppc), f1(7.5 * f.ppc));
I["muneca-pa"] = () => {
  const f = E.figura("muneca-pa", { en: ["grande_R", 200, 170], ppc: 12 }), c = f.p("grande_R");
  const g = E.figura("muneca-pa-costado", { en: ["grande_R", 590, 222], ppc: 8 });
  const yRI = f1(g.abajo(g.x, g.x + g.w) - 2), gc = g.p("grande_R");
  return svg(
    view("1 · Desde el tubo") +
    riTop(70, 52, 240, 236) + txt(70, 306, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colMuneca(f) + crossP(c) +
    note(c[0] + 6, c[1] + 8, 120, 278, ["RC ⟂ en la parte media del carpo"], RED) +
    txt(12, 40, "Pronación; mano y muñeca paralelas al borde del RI", 11, MUTE) +
    panelSep("2 · De costado") +
    riBar(420, 716, yRI) + g.svg + beam(gc[0], f1(gc[1] - 1.5 * g.ppc), 90, 150) +
    note(...g.p("punta_dedo3_R"), 740, 110, ["Dedos flexionados,", "mano un poco arqueada"], INK, "end") +
    txt(402, 296, "Bajar el hombro para apoyar el antebrazo", 11.5, INK) + txt(402, 310, "y evitar que la muñeca rote.", 11.5, INK) +
    txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-pa-oblicua"] = () => {
  const f = E.figura("muneca-pa-oblicua", { en: ["grande_R", 190, 180], ppc: 12 }), c = f.p("grande_R");
  const k = E.corte("muneca-pa-oblicua-corte", { en: ["apoyo", 560, 262], ppc: 14 });
  const t = k.extremo((q) => q[0] + q[1]), v = [f1(t[0] + t[1] - 262), 262], L = f1(t[0] - v[0] + 1.2 * k.ppc);
  const tg = k.hueso("Right third metacarpal bone");
  return svg(
    view("1 · Desde el tubo") +
    riTop(60, 60, 250, 220) + txt(60, 298, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colMuneca(f) + crossP(c) +
    note(c[0] + 6, c[1] + 8, 140, 318, ["RC ⟂ en la parte media del carpo"], RED) +
    txt(12, 40, "Mano y muñeca paralelas al borde del RI", 11, MUTE) +
    panelSep("2 · Desde la mano") +
    riBar(450, 716, 262) + cuna(v, 45, L, 1) + k.svg +
    beam(tg[0], f1(k.caja[1] + 4), 90, 110) +
    arco(v, 46, 315, 360, "45°", BLUE, 14) + lab(f1(v[0] + L * 0.8), 254, f1(v[0] + L + 14), 250, "goma espuma 45°") +
    ((q) => q ? labL(q, 40, -30, "pulgar") : "")(k.primero("Right first metacarpal bone", "Proximal phalanx of right thumb")) +
    bold(402, 296, "Rotar mano y muñeca 45° hacia lateral;") + txt(402, 311, "dedos flexionados o bloque de 45°", 11.5, INK) +
    txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-lateral"] = () => {
  const f = E.figura("muneca-lateral", { en: ["grande_R", 200, 176], ppc: 12 }), c = f.p("grande_R");
  const k = E.corte("muneca-lateral-corte", { en: ["apoyo", 560, 262], ppc: 12 });
  const tg = k.hueso("Right third metacarpal bone");
  return svg(
    view("1 · Desde el tubo") +
    riTop(70, 60, 240, 220) + txt(70, 298, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colMuneca(f) + crossP(c) +
    note(c[0] + 6, c[1] + 8, 120, 318, ["RC ⟂ en la parte media del carpo"], RED) +
    txt(12, 40, "Mano y muñeca paralelas al borde del RI", 11, MUTE) +
    panelSep("2 · Desde la mano") +
    riBar(450, 680, 262) + k.svg + beam(tg[0], f1(k.caja[1] + 4), 90, 110) +
    ((q) => q ? note(...q, 620, 120, ["Lateral verdadera", "(pulgar arriba)"]) : "")(k.primero("Right first metacarpal bone", "Proximal phalanx of right thumb")) +
    txt(402, 296, "Bajar el hombro: húmero, antebrazo y muñeca", 11.5, INK) + txt(402, 310, "en el mismo plano horizontal. Apoyo si hace falta.", 11.5, INK) +
    txt(402, 326, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-desviacion-radial"] = () => {
  const f = E.figura("muneca-desviacion-radial", { en: ["grande_R", 220, 186], ppc: 11 }), c = f.p("grande_R");
  return svg(
    view("Vista desde el tubo · desde la PA de muñeca") +
    riTop(110, 40, 250, 270) + txt(116, 302, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colCarpo(f, c) + crossP(c) +
    note(c[0] + 8, c[1] - 8, 520, 70, ["RC perpendicular al RI en la", "parte media del carpo"], RED) +
    note(...f.p("punta_dedo2_R"), 520, 140, ["Desviación radial: llevar la mano", "hacia el lado del pulgar, todo", "lo que tolere"]) +
    note(f1(c[0] + 3.75 * f.ppc), f1(c[1] + 3.75 * f.ppc), 520, 226, ["Colimar al carpo", "(cuadrado de unos 7,5 cm)"], AMB) +
    txt(520, 290, "Protección sobre el regazo", 11, MUTE) + txt(520, 304, "DFRI 100 cm · sin parrilla", 11, MUTE)
  );
};

I["muneca-tunel-carpiano"] = () => {
  const g = E.figura("muneca-tunel-carpiano", { en: ["grande_R", 330, 230], ppc: 9 });
  const yRI = f1(g.abajo(g.x, g.p("grande_R")[0]) - 2);
  // eje largo de la palma: de la base del 3.er MC a la 3.ª MCF; RC 2-3 cm (2,5) distal a la base del 3.er MC
  const a = g.p("mcf3_R"), b = g.p("base_mc3_R"), L = Math.hypot(a[0] - b[0], a[1] - b[1]);
  const u = [(a[0] - b[0]) / L, (a[1] - b[1]) / L], tg = add(b, u, 2.5 * g.ppc);
  const pdir = (Math.atan2(-u[1], -u[0]) * 180) / Math.PI;      // dirección del eje hacia proximal (hacia la muñeca)
  const ext = add(a, u, 2 * g.ppc), ini = add(b, u, -1 * g.ppc);
  return svg(
    view("Vista de costado · muñeca en hiperextensión") +
    riBar(40, 470, yRI) + g.svg +
    refline(f1(ext[0]), f1(ext[1]), f1(ini[0]), f1(ini[1])) +
    beam(f1(tg[0]), f1(tg[1]), pdir + 27.5, 150, { ref: pdir, angLabel: "25-30°" }) + redDot(tg) +
    note(tg[0] - 6, tg[1] + 4, 230, 170, ["RC 25-30° respecto del", "eje largo de la palma"], RED, "end") +
    note(f1(ext[0] - 2), f1(ext[1]), 230, 80, ["Eje largo de la palma"], BLUE, "end") +
    txt(520, 60, "Centrado unos 2-3 cm distal", 12, INK, "start", 700) + txt(520, 76, "a la base del 3.er metacarpiano", 12, INK, "start", 700) +
    lines(520, 110, ["Hiperextensión (flexión dorsal)", "todo lo que tolere: el paciente", "sostiene los dedos hacia atrás", "con la otra mano."], 11.5, INK) +
    lines(520, 186, ["Rotar unos 10° hacia interno", "(hacia el radio).", "Trabajar rápido: puede doler."], 11.5, INK) +
    txt(520, 250, "Colimar al carpo (~7,5 cm)", 11.5, AMB) +
    tecnica(520, 290, "18 x 24 vertical") + txt(60, 300, "← antebrazo sobre el RI", 11, MUTE)
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
// colimación de mano y muñeca sobre una figura: desde 2,5 cm proximal a la estiloides radial hasta las puntas de los dedos
function colMano(f, puntas) {
  const cm = f.ppc, x0 = f1(f.p("estiloides_radio_R")[0] - 2.5 * cm), x1 = f1(Math.max(...puntas.map((n) => f.p(n)[0])) + 0.8 * cm);
  return { svg: coll(x0, f1(f.y - 0.6 * cm), f1(x1 - x0), f1(f.h + 1.2 * cm)), x0, x1, y1: f1(f.y + f.h + 0.6 * cm) };
}
I["mano-lateral--v1"] = () => {
  const f = E.figura("mano-lateral--v1", { en: ["mcf2_R", 222, 180], ppc: 13 });
  const m2 = f.p("mcf2_R"), c = colMano(f, ["punta_dedo2_R", "punta_dedo5_R"]);
  return svg(
    view("Lateral en abanico · vista desde el tubo") +
    riTop(34, 50, 320, 226) + txt(40, 292, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + c.svg + crossP(m2) +
    note(m2[0] + 6, m2[1] + 8, 420, 230, ["RC perpendicular al RI", "en la 2.ª articulación MCF"], RED) +
    note(...f.p("punta_dedo5_R"), 420, 70, ["Dedos separados y abiertos", "sobre un soporte escalonado", "radiotransparente"]) +
    col(420, 140, [["Mano en lateral, lado del pulgar", INK, 700], ["hacia arriba", INK, 700], ["Metacarpianos en lateral verdadera", MUTE]]) +
    col(420, 300, [["Colimar a mano y muñeca, con todo el carpo", AMB, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["mano-lateral--v2"] = () => {
  const f = E.figura("mano-lateral--v2", { en: ["mcf2_R", 222, 186], ppc: 13 });
  const m2 = f.p("mcf2_R"), c = colMano(f, ["punta_dedo2_R"]);
  return svg(
    view("Lateral en extensión · vista desde el tubo") +
    riTop(34, 60, 330, 210) + txt(40, 288, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + c.svg + crossP(m2) +
    note(m2[0] + 6, m2[1] + 8, 420, 230, ["RC perpendicular al RI", "en la 2.ª articulación MCF"], RED) +
    note(...f.p("punta_dedo2_R"), 420, 80, ["Dedos juntos y extendidos"]) +
    col(420, 130, [["Mano en lateral, lado del pulgar", INK, 700], ["hacia arriba", INK, 700], ["Se usa ante sospecha de cuerpo", INK], ["extraño o lesión de un metacarpiano", INK]]) +
    col(420, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// ---- AP bilateral oblicua de manos (Norgaard) ----
function norgaard(v) {
  // cada mano es una figura aparte; se acercan hasta que los bordes cubitales se tocan
  const cx = 196, y5 = 150, ppc = 10.5;
  let L = E.figura(`norgaard-${v}-L`, { en: ["mcf5_L", cx - 30, y5], ppc }), R = E.figura(`norgaard-${v}-R`, { en: ["mcf5_R", cx + 30, y5], ppc });
  const y1 = Math.max(L.p("estiloides_cubito_L")[1], R.p("estiloides_cubito_R")[1]) + 2 * ppc;
  const hueco = E.hueco(L, R, -1e9, y1);     // separación mínima fila por fila: se tocan sin cruzarse
  L = E.figura(`norgaard-${v}-L`, { en: ["mcf5_L", cx - 30 + hueco / 2, y5], ppc });
  R = E.figura(`norgaard-${v}-R`, { en: ["mcf5_R", cx + 30 - hueco / 2, y5], ppc });
  const mid = lerp(L.p("mcf5_L"), R.p("mcf5_R"), 0.5);
  const top = Math.min(L.y, R.y), xa = L.borde("izq", 0, y1 + 3 * ppc), xb = R.borde("der", 0, y1 + 3 * ppc);
  return { svg: riTop(50, 40, 340, 262) + L.svg + R.svg + coll(f1(xa - 0.8 * ppc), f1(top - 0.8 * ppc), f1(xb - xa + 1.6 * ppc), f1(y1 + 2.5 * ppc - top + 0.8 * ppc)) + crossP(mid),
    mid, L, R };
}
const norgaardTxt = (x) => col(x, 128, [["Sentado, antebrazos y manos", INK, 700], ["extendidos, palmas arriba", INK, 700], ["Manos a 45°, bordes mediales", INK], ["juntos, sobre bloques de 45°", INK]]);
I["manos-ap-oblicua-norgaard--v1"] = () => {
  const n = norgaard("v1");
  return svg(
    titulo(12, "Dedos en extensión", "Desde el tubo") + n.svg + txt(50, 320, "RI 24 x 30 o 35 x 43 horizontal", 11, INK) +
    note(n.mid[0] + 8, n.mid[1] - 8, 430, 64, ["RC perpendicular, entre", "las 5.as articulaciones MCF"], RED) +
    norgaardTxt(430) + note(...n.R.p("punta_dedo3_R"), 430, 214, ["Dedos en extensión completa", "sobre los bloques"]) +
    col(430, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["manos-ap-oblicua-norgaard--v2"] = () => {
  const n = norgaard("v2");
  return svg(
    titulo(12, "Variante «receptor de pelota»", "Desde el tubo") + n.svg + txt(50, 320, "RI 24 x 30 o 35 x 43 horizontal", 11, INK) +
    note(n.mid[0] + 8, n.mid[1] - 8, 430, 64, ["RC perpendicular, entre", "las 5.as articulaciones MCF"], RED) +
    norgaardTxt(430) + note(...n.R.p("punta_dedo3_R"), 430, 214, ["Dedos en flexión parcial"]) +
    col(430, 236, [["Muestra bien metacarpianos y MCF,", MUTE], ["pero deforma las interfalángicas", MUTE]]) +
    col(430, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// ---- Lateral de dedos ----
I["dedos-lateral--v1"] = () => {
  const f = E.figura("dedos-lateral--v1", { en: ["ifp3_R", 280, 186], ppc: 12 });
  const i3 = f.p("ifp3_R");
  const c = E.corte("dedos-lateral--v1-corte", { en: ["apoyo", 650, 286], ppc: 7 });
  return svg(
    view("Dedos 3.º a 5.º · lateromedial · desde el tubo") +
    riTop(150, 86, 240, 190) + txt(150, 294, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colDedo(f, "mcf3_R", "punta_dedo3_R") + crossP(i3) +
    note(i3[0] + 4, i3[1] - 8, 430, 60, ["RC perpendicular al RI", "en la IFP (aquí, 3.er dedo)"], RED) +
    note(...f.p("punta_dedo1_R"), 430, 124, ["Mano en lateral, lado del", "pulgar hacia arriba"]) +
    col(430, 184, [["Dedo paralelo al RI, alineado con", INK], ["el eje de la zona que se expone", INK]]) +
    riBar(600, 700, 286, "") + c.svg + ((q) => q ? lab(...q, 700, 226, "pulgar", "start") : "")(c.primero("Right first metacarpal bone", "Proximal phalanx of right thumb")) +
    txt(650, 322, "corte visto desde la punta de los dedos", 10.5, MUTE, "middle")
  );
};
I["dedos-lateral--v2"] = () => {
  const f = E.figura("dedos-lateral--v2", { en: ["ifp2_R", 280, 166], ppc: 12 });
  const i2 = f.p("ifp2_R");
  const c = E.corte("dedos-lateral--v2-corte", { en: ["apoyo", 650, 286], ppc: 7 });
  return svg(
    view("2.º dedo · mediolateral · desde el tubo") +
    riTop(150, 66, 240, 190) + txt(150, 274, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colDedo(f, "mcf2_R", "punta_dedo2_R") + crossP(i2) +
    note(i2[0] + 4, i2[1] + 8, 430, 60, ["RC perpendicular al RI", "en la IFP del 2.º dedo"], RED) +
    col(430, 116, [["Mano en lateral, lado del", INK, 700], ["pulgar hacia abajo", INK, 700], ["(el pulgar queda debajo,", MUTE], ["contra el RI)", MUTE]]) +
    col(430, 194, [["Dedo paralelo al RI, alineado con", INK], ["el eje de la zona que se expone", INK]]) +
    riBar(600, 700, 286, "") + c.svg + ((q) => q ? lab(...q, 720, 268, "pulgar", "start") : "")(c.primero("Right first metacarpal bone", "Proximal phalanx of right thumb")) +
    txt(650, 322, "corte visto desde la punta de los dedos", 10.5, MUTE, "middle")
  );
};

// ---- PA con desviación cubital (escafoides) ----
I["muneca-desviacion-cubital--v1"] = () => {
  const f = E.figura("muneca-desviacion-cubital--v1", { en: ["escafoides_R", 190, 140], ppc: 11 }), e = f.p("escafoides_R");
  return svg(
    view("Con desviación cubital · vista desde el tubo") +
    riTop(70, 40, 280, 250) + txt(70, 308, "RI 18 x 24 vertical", 11.5, INK) +
    f.svg + colCarpo(f, f.p("grande_R")) + redDot(e) +
    labL(e, -30, -46, "escafoides") +
    note(...f.p("punta_dedo3_R"), 430, 214, ["Mano llevada hacia el lado", "cubital todo lo que tolere"]) +
    note(e[0] + 6, e[1] - 4, 430, 60, ["RC perpendicular al RI", "Otra opción: 10-15° hacia el codo,", "centrado en el escafoides"], RED) +
    col(430, 140, [["Desde la PA de muñeca", INK, 700], ["(lado del pulgar del carpo = escafoides)", MUTE]]) +
    col(430, 296, [["Colimar a la región del carpo", AMB, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["muneca-desviacion-cubital--v2"] = () => {
  // de costado (desde lateral, el codo a la izquierda): antebrazo sobre el RI y la mano apoyada en un bloque de 20°
  const g = E.figura("muneca-desviacion-cubital--v2", { en: ["grande_R", 330, 230], ppc: 11 });
  const c = g.p("grande_R"), yRI = f1(g.abajo(g.x, c[0]) - 2);
  // el bloque: su cara inclinada (20°) toca la palma por debajo; el vértice queda sobre el RI
  const t20 = Math.tan(rad(20)), xb = g.x + g.w;
  let vx = -1e9;
  // (la palma apoya entre el carpo y las MCF; los dedos pueden quedar apenas separados)
  for (let x = c[0] + 2 * g.ppc; x <= g.p("mcf3_R")[0] + g.ppc; x += 2) { const yb = g.abajo(x - 1, x + 1); if (isFinite(yb)) vx = Math.max(vx, x - (yRI - yb) / t20); }
  const v = [f1(vx), yRI];
  return svg(
    view("Stecher modificado · de costado") +
    riBar(40, 560, yRI) + cuna(v, 20, f1(xb - v[0] + 6), 1) + g.svg + redDot(c) +
    beam(c[0], c[1], 90, 160) +
    arco(v, 110, 340, 360, "20°", BLUE, 16) +
    txt(48, 200, "← codo", 11, MUTE) + labL([f1(v[0] + 120), yRI - 4], -20, 34, "bloque de goma espuma a 20°") +
    note(c[0] + 6, c[1] - 6, 600, 70, ["RC perpendicular", "al RI"], RED) +
    col(600, 130, [["Si no puede hacer la", INK, 700], ["desviación cubital:", INK, 700], ["mano apoyada en un", INK], ["bloque de 20°", INK]]) +
    col(600, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// ======================= CODO Y ANTEBRAZO (figuras del modelo: herramientas/ilus3d/figuras/codo.py) =======================
const medio = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const muneca = (f) => medio(f.p("estiloides_radio_R"), f.p("estiloides_cubito_R"));
// RI visto desde el tubo, centrado en c, con 'largo' cm a lo largo del miembro (horizontal) y 'ancho' cm de alto
const riEn = (f, c, largo, ancho, rotulo, lx, ly) => riTop(f1(c[0] - largo * f.ppc / 2), f1(c[1] - ancho * f.ppc / 2), f1(largo * f.ppc), f1(ancho * f.ppc), rotulo, lx, ly);
// colimación del antebrazo: desde 2,5 cm por encima del codo hasta 2,5 cm más allá de la muñeca, con el ancho de la figura
function colAntebrazo(f, vertical = false) {
  const cm = f.ppc, e = f.p("codo_R"), m = muneca(f);
  if (!vertical) {
    const x0 = e[0] - 2.5 * cm, x1 = m[0] + 2.5 * cm, [ya, yb] = f.rango(e[0], x1);
    return coll(f1(x0), f1(ya - 0.6 * cm), f1(x1 - x0), f1(yb - ya + 1.2 * cm));
  }
  const x1 = m[0] + 2.5 * cm, [ya, yb] = f.rango(f.x, x1), y0 = e[1] - 2.5 * cm;
  return coll(f1(f.x - 0.6 * cm), f1(y0), f1(x1 - f.x + 0.6 * cm), f1(yb - y0 + 0.6 * cm));
}
// ángulo (grados SVG) de la recta a→b
const angulo = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
// línea de los epicóndilos (prolongada) con los dos puntos
const epicondilos = (q, l, m, ext = 0.35) => refline(...add(m, sub2(m, l), ext).map(f1), ...add(l, sub2(l, m), ext).map(f1)) + bluePt(l) + bluePt(m);
const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];

I["antebrazo-ap"] = () => {
  const f = E.figura("antebrazo-ap", { en: ["codo_R", 110, 170], ppc: 7 });
  const e = f.p("codo_R"), c = medio(e, muneca(f));
  return svg(
    view("Vista desde el tubo · sentado al costado de la mesa") +
    riEn(f, c, 43, 35, "", 0, 0) + txt(f1(c[0]), 312, "RI 35 x 43 vertical", 11.5, INK, "middle") +
    f.svg + colAntebrazo(f) + crossP(c) +
    lab(f1(e[0] - 6 * f.ppc), f1(e[1]), 70, 92, "húmero", "end") +
    lab(...f.p("centro:Right ulna"), 250, 100, "cúbito") + lab(...f.p("centro:Right radius"), 250, 252, "radio") +
    epicondilos(null, f.p("epicondilo_lat_R"), f.p("epicondilo_med_R"), 0.5) + azul(...f.p("epicondilo_med_R"), 110, 104, "epicóndilos de perfil") +
    note(c[0] + 6, c[1] + 6, 450, 60, ["RC perpendicular en el", "punto medio del antebrazo"], RED) +
    note(f1(muneca(f)[0] + 2.5 * f.ppc), f1(c[1] - 40), 450, 124, ["Incluir muñeca y codo: colimar", "al menos 2,5 cm más allá", "de cada articulación"], AMB) +
    bold(450, 202, "Brazo extendido, mano en supinación") +
    lines(450, 222, ["Si hace falta, que se incline hacia", "lateral para una AP verdadera."], 11.5, INK) +
    tecnica(450, 270, "35 x 43 vertical", ["(30 x 35 en pacientes más pequeños)", "Protección sobre el regazo"])
  );
};

I["antebrazo-lateral"] = () => {
  const f = E.figura("antebrazo-lateral", { en: ["codo_R", 100, 205], ppc: 7 });
  const e = f.p("codo_R"), c = medio(e, muneca(f));
  return svg(
    view("Vista desde el tubo · codo a 90°") +
    riEn(f, c, 43, 35, "", 0, 0) + txt(f1(c[0]), 326, "RI 35 x 43 vertical", 11.5, INK, "middle") +
    f.svg + colAntebrazo(f, true) + crossP(c) +
    arco(e, 34, -90, 0, "90°", BLUE, 14) +
    lab(f1(e[0] - 0.4 * f.ppc), f1(e[1] - 8 * f.ppc), 40, 90, "húmero", "end") +
    lab(...f.p("centro:Right ulna"), 210, 300, "cúbito") + lab(...f.p("centro:Right radius"), 260, 150, "radio") +
    note(c[0] + 6, c[1] - 6, 450, 60, ["RC perpendicular en el", "punto medio del antebrazo"], RED) +
    note(...f.p("punta_dedo1_R"), 450, 124, ["Mano y muñeca en lateral verdadera:", "radio y cúbito distales superpuestos"]) +
    note(f1(muneca(f)[0] + 2.5 * f.ppc), f1(c[1] + 30), 450, 192, ["Incluir muñeca y codo, salvo", "contraindicación"], AMB) +
    lines(450, 252, ["Sentado al costado de la mesa,", "protección sobre el regazo."], 11.5, INK) +
    tecnica(450, 290, "35 x 43 vertical", ["(30 x 35 en pacientes más pequeños)"])
  );
};

// AP de codo en extensión: desde el tubo y un corte por los epicóndilos visto desde la mano (paralelos al RI)
function corteCodo(id, x, yRI, ppc) {
  const k = E.corte(id, { en: ["apoyo", x, yRI], ppc });
  const l = k.p("epicondilo_lat_R"), m = k.p("epicondilo_med_R"), h = k.hueso("Right humerus");
  return { k, l, m, h, svg: riBar(x - 110, x + 110, yRI) + k.svg + epicondilos(null, l, m) +
    beam(f1(h[0]), f1(k.caja[1] - 2), 90, 72) };
}
I["codo-ap--v1"] = () => {
  const f = E.figura("codo-ap--v1", { en: ["codo_R", 170, 170], ppc: 9 }), e = f.p("codo_R");
  const q = corteCodo("codo-ap-corte", 560, 262, 14);
  return svg(
    view("1 · Desde el tubo") +
    riEn(f, e, 30, 24, "", 0, 0) + txt(f1(e[0] - 15 * f.ppc), f1(e[1] - 12 * f.ppc - 6), "RI 24 x 30 vertical", 11.5, INK) +
    f.svg + coll(f1(e[0] - 7 * f.ppc), f1(e[1] - 5 * f.ppc), f1(14 * f.ppc), f1(10 * f.ppc)) + crossP(e) +
    lab(f1(e[0] - 8 * f.ppc), f1(e[1]), 40, 96, "húmero", "end") +
    lab(...f.p("centro:Right ulna"), 352, 110, "cúbito", "end") + lab(...f.p("centro:Right radius"), 352, 238, "radio", "end") +
    note(e[0] + 6, e[1] + 6, 30, 318, ["RC ⟂ en la parte media de la articulación del codo"], RED) +
    txt(12, 38, "Codo extendido, mano en supinación", 11.5, INK, "start", 700) +
    panelSep("2 · Desde la mano") + q.k.svg.slice(0, 0) + q.svg +
    labL(q.l, -16, -30, "lateral") + lab(...q.m, f1(q.m[0] + 30), f1(q.m[1] - 30), "medial") +
    azul(...medio(q.l, q.m), 560, 290, "epicóndilos paralelos al RI") +
    lines(402, 312, ["Si hace falta, inclinar al paciente hacia lateral (palpar los epicóndilos).", "DFRI 100 cm · sin parrilla · colimar al área de interés"], 11, MUTE, 14)
  );
};

// Flexión parcial, de costado (desde lateral; el hombro a la izquierda)
function codoParcial(id, apoyado) {
  const f = E.figura(id, { en: ["codo_R", 330, 200], ppc: 9 }), e = f.p("codo_R");
  const x0 = apoyado === "humero" ? f.x : e[0], x1 = apoyado === "humero" ? e[0] : f.x + f.w;
  const yRI = f1(f.abajo(x0 + 10, x1 - 10) + 1);
  return { f, e, yRI, svg: riBar(f.x + 10, f.x + f.w - 10, yRI, "") + f.svg + redDot(e) + beam(e[0], e[1], 90, 128) };
}
I["codo-ap--v2"] = () => {
  const c = codoParcial("codo-ap--v2", "humero"), { f, e } = c;
  return svg(
    view("Flexión parcial · húmero apoyado · de costado") + c.svg +
    txt(f1(f.x), f1(f.y - 8), "← hombro", 11, MUTE) +
    lab(f1(e[0] - 9 * f.ppc), f1(e[1]), f1(e[0] - 9 * f.ppc), f1(c.yRI + 36), "húmero apoyado paralelo al RI", "middle") +
    lab(...f.p("centro:Right radius"), f1(f.x + f.w + 6), 120, "antebrazo") +
    note(e[0] + 6, e[1] - 6, 560, 60, ["RC perpendicular", "al húmero distal"], RED) +
    col(560, 140, [["Si el codo no se", INK, 700], ["extiende del todo:", INK, 700], ["dos AP. Esta, con el", INK], ["húmero paralelo al RI", INK]]) +
    col(560, 290, [["RI 24 x 30 vertical", INK, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
I["codo-ap--v3"] = () => {
  const c = codoParcial("codo-ap--v3", "antebrazo"), { f, e } = c;
  return svg(
    view("Flexión parcial · antebrazo apoyado · de costado") + c.svg +
    txt(f1(f.x), 60, "hombro ↖", 11, MUTE) +
    lab(f1(e[0] - 5 * f.ppc), f1(e[1] - 3 * f.ppc), 120, 230, "húmero", "end") +
    lab(f1(e[0] + 12 * f.ppc), f1(c.yRI - 1.5 * f.ppc), f1(e[0] + 12 * f.ppc), f1(c.yRI + 34), "antebrazo apoyado paralelo al RI", "middle") +
    note(e[0] + 6, e[1] - 6, 560, 60, ["RC perpendicular al", "antebrazo proximal"], RED) +
    col(560, 140, [["Si el codo no se", INK, 700], ["extiende del todo:", INK, 700], ["dos AP. Esta, con el", INK], ["antebrazo paralelo al RI", INK]]) +
    col(560, 290, [["RI 24 x 30 vertical", INK, 400, 11], ["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

// Oblicuas: desde el tubo y corte por los epicóndilos visto desde la mano, con el ángulo respecto del RI
function codoOblicua(v, titulo, mano, filas, muestra) {
  const f = E.figura(`codo-ap-oblicua--${v}`, { en: ["codo_R", 170, 172], ppc: 9 }), e = f.p("codo_R");
  const q = corteCodo(`codo-ap-oblicua--${v}-corte`, 560, 262, 14);
  // el epicóndilo que queda abajo es el vértice; el ángulo se mide entre la línea de los epicóndilos y el RI
  const [ab, ar] = q.l[1] > q.m[1] ? [q.l, q.m] : [q.m, q.l];
  const a = angulo(ab, ar), ref = ar[0] > ab[0] ? 0 : 180;
  return svg(
    view("1 · Desde el tubo") +
    riEn(f, e, 30, 24, "", 0, 0) + txt(f1(e[0] - 15 * f.ppc), f1(e[1] - 12 * f.ppc - 6), "RI 24 x 30 vertical", 11.5, INK) +
    f.svg + coll(f1(e[0] - 7 * f.ppc), f1(e[1] - 5 * f.ppc), f1(14 * f.ppc), f1(10 * f.ppc)) + crossP(e) +
    note(e[0] + 6, e[1] + 6, 30, 318, ["RC ⟂ en la parte media de la articulación del codo"], RED) +
    txt(12, 38, mano, 11.5, INK, "start", 700) +
    panelSep("2 · Desde la mano · " + titulo) + q.svg +
    `<line x1="${f1(ab[0] - 80)}" y1="${f1(ab[1])}" x2="${f1(ab[0] + 80)}" y2="${f1(ab[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="3 4"/>` +
    arco(ab, 58, ref === 0 ? a : ref, ref === 0 ? 0 : a, filas.ang, BLUE, 18) +
    labL(q.l, -54, q.l[1] > q.m[1] ? -8 : -26, "lateral") + lab(...q.m, f1(q.m[0] + 40), f1(q.m[1] + (q.m[1] > q.l[1] ? -8 : -26)), "medial") +
    lines(402, 296, filas.txt, 11, INK, 14) + txt(402, 324, muestra + " · DFRI 100 cm · sin parrilla", 11, MUTE)
  );
}
I["codo-ap-oblicua--v1"] = () => codoOblicua("v1", "oblicua medial", "Codo extendido, mano en pronación",
  { ang: "45°", txt: ["Rotación interna de 45° (palpar los epicóndilos)"] }, "Muestra mejor la coronoides");
I["codo-ap-oblicua--v2"] = () => codoOblicua("v2", "oblicua lateral", "Codo extendido, mano en supinación",
  { ang: "40-45°", txt: ["Rotación externa de 40-45°; si cuesta, inclinar el tronco"] }, "Muestra mejor cabeza y cuello del radio");

// Lateral y Coyle: codo a 90° (u 80°) sobre la mesa, visto desde el tubo; húmero hacia arriba, antebrazo a la derecha
function codoLado(id, ppc = 9) {
  const f = E.figura(id, { en: ["codo_R", 170, 196], ppc }), e = f.p("codo_R");
  return { f, e, ri: riEn(f, e, 30, 24, "", 0, 0) + txt(f1(e[0]), 320, "RI 24 x 30 vertical", 11.5, INK, "middle"),
    col: coll(f1(f.p("olecranon_R")[0] - 1.2 * ppc), f1(e[1] - 6 * ppc), f1(e[0] + 6 * ppc - f.p("olecranon_R")[0] + 1.2 * ppc), f1(f.abajo(f.x, e[0] + 6 * ppc) - e[1] + 6.6 * ppc)) };
}
I["codo-lateral"] = () => {
  const { f, e, ri, col: cl } = codoLado("codo-lateral");
  const ang = angulo(e, muneca(f));
  return svg(
    view("Vista desde el tubo · codo a 90° sobre la mesa") + ri + f.svg + cl + crossP(e) +
    arco(e, 40, -90, ang, "90°", BLUE, 14) +
    lab(f1(e[0] + 0.3 * f.ppc), f1(e[1] - 8 * f.ppc), 80, 70, "húmero", "end") + lab(...f.p("olecranon_R"), 60, 270, "olécranon", "end") +
    lab(...f.p("centro:Right radius"), 360, 150, "radio") + lab(...f.p("centro:Right ulna"), 360, 286, "cúbito") +
    note(e[0] + 6, e[1] - 6, 450, 60, ["RC perpendicular en la parte", "media de la articulación"], RED) +
    note(f1(e[0] + 6 * f.ppc), f1(e[1] - 6 * f.ppc), 450, 120, ["Colimar con al menos 5 cm", "de antebrazo y de húmero"], AMB) +
    lines(450, 180, ["Bajar el hombro: húmero y antebrazo", "en un mismo plano sobre la mesa.", "Antebrazo paralelo al borde del RI.", "Mano y muñeca en lateral verdadera."], 11.5, INK) +
    tecnica(450, 270, "24 x 30 vertical", ["Protección sobre el regazo"])
  );
};
function coyle(v, rcTxt, hacia, flex, vista) {
  const { f, e, ri } = codoLado(`codo-axial-coyle--${v}`);
  const ang = angulo(e, muneca(f)), h = [e[0] + 0.3 * f.ppc, e[1] - 9 * f.ppc];
  // flecha a lo largo del húmero: hacia el hombro (arriba) o alejándose (abajo)
  const flecha = hacia ? [[e[0] + 0.3 * f.ppc, e[1] - 3 * f.ppc], h] : [h, [e[0] + 0.3 * f.ppc, e[1] - 3 * f.ppc]];
  return svg(
    view(`Vista desde el tubo · ${vista}`) + ri + f.svg + crossP(e) +
    `<line x1="${f1(flecha[0][0])}" y1="${f1(flecha[0][1])}" x2="${f1(flecha[1][0])}" y2="${f1(flecha[1][1])}" stroke="${RED}" stroke-width="2.6" marker-end="url(#ar)"/>` +
    txt(f1(h[0] - 1.2 * f.ppc), f1(h[1] + 3 * f.ppc), "tubo inclinado", 11, RED, "end", 700) + txt(f1(h[0] - 1.2 * f.ppc), f1(h[1] + 3 * f.ppc + 13), hacia ? "hacia el hombro" : "alejándose del hombro", 11, RED, "end", 700) +
    (flex === 90 ? arco(e, 40, -90, ang, "90°", BLUE, 14) : "") +
    lab(...f.p("centro:Right radius"), 360, 150, "radio") + lab(...f.p("centro:Right ulna"), 360, 286, "cúbito") +
    note(e[0] + 6, e[1] + 6, 450, 60, rcTxt, RED) +
    lines(450, 130, [`Codo flexionado ${flex}°${flex === 90 ? " si se puede" : " (más flexión tapa la coronoides)"},`, "mano en pronación.", "El RC entra por la parte media de la", "articulación del codo."], 11.5, INK) +
    tecnica(450, 270, "24 x 30 vertical", ["Colimar al área de interés"])
  );
}
I["codo-axial-coyle--v1"] = () => coyle("v1", ["RC 45° hacia el hombro,", "centrado en la cabeza del radio"], true, 90, "cabeza del radio");
I["codo-axial-coyle--v2"] = () => coyle("v2", ["RC 45° alejándose del hombro,", "centrado en la coronoides"], false, 80, "apófisis coronoides");


module.exports = I;
