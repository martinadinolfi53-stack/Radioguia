// Esquemas de tórax, vía aérea, tórax pediátrico, esternón, esternoclaviculares y costillas.
// Estilo: contorno continuo color piel + huesos de referencia "por transparencia" (ver estilo.cjs y referencia-*.cjs).
// Solo unidades métricas en los rótulos.
const E = require("./estilo.cjs");
const A = require("./anatomia.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONE, BONEO, wall, ri, riTop, beam, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, cabezaPerfil, cabezaFrente } = E;

// ---------- helpers geométricos ----------
const f1 = (n) => +(+n).toFixed(1);
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
// transformación afín: escala s y rotación rot (grados) alrededor del origen local, llevado a (ox,oy)
function afin(ox, oy, s = 1, rot = 0, ax = 0, ay = 0) {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const m = ([x, y]) => { const dx = x - ax, dy = y - ay; return [ox + s * (dx * c - dy * sn), oy + s * (dx * sn + dy * c)]; };
  m.s = s; m.rot = rot;
  return m;
}
// aplica M a todos los pares "x,y" de un path escrito en coordenadas locales (solo M, L, C, Q, Z)
const mapD = (M, d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, a, b) => M([+a, +b]).map(f1).join(","));
const P = (M, p) => M(p).map(f1);
// tubo (miembro) a lo largo de un eje con semiancho w[i] y extremos redondeados; coordenadas locales
function tuboLocal(eje, w) {
  const n = eje.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = eje[Math.max(0, i - 1)], b = eje[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy); dx /= m; dy /= m;
    L.push([eje[i][0] + dy * w[i], eje[i][1] - dx * w[i]]);
    R.push([eje[i][0] - dy * w[i], eje[i][1] + dx * w[i]]);
  }
  const dir = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], m = Math.hypot(dx, dy); return [dx / m, dy / m]; };
  const cap = (c, wd, d, sg) => [0.25, 0.5, 0.75].map((k) => {
    const t = k * Math.PI, nl = [d[1], -d[0]];
    return [c[0] + sg * wd * (Math.cos(t) * nl[0] + Math.sin(t) * d[0]), c[1] + sg * wd * (Math.cos(t) * nl[1] + Math.sin(t) * d[1])];
  });
  const dE = dir(eje[n - 2], eje[n - 1]), dS = dir(eje[0], eje[1]);
  return { pts: [...L, ...cap(eje[n - 1], w[n - 1], dE, 1), ...R.slice().reverse(), ...cap(eje[0], w[0], dS, -1)], L, R };
}
const tubo = (M, eje, w) => suave(tuboLocal(eje, w).pts.map(M), true, 0.8);
const elipse = (cx, cy, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((2 * Math.PI * i) / n), cy + ry * Math.sin((2 * Math.PI * i) / n)]);
// silueta fusionada: primero todos los contornos, luego todos los rellenos (las partes se funden sin costuras)
const figura = (partes, encima = []) => `<g>` +
  partes.map((d) => `<path d="${d}" fill="${SKO}" stroke="${SKO}" stroke-width="4" stroke-linejoin="round"/>`).join("") +
  partes.map((d) => `<path d="${d}" fill="${SK}"/>`).join("") + encima.map((d) => piel(d)).join("") + `</g>`;
// costilla / línea ósea fina
const costilla = (d) => `<path d="${d}" fill="none" stroke="${BONEO}" stroke-width="2.8" stroke-linecap="round" opacity=".6"/><path d="${d}" fill="none" stroke="${BONE}" stroke-width="1.3" stroke-linecap="round"/>`;
const pulmon = (d) => `<path d="${d}" fill="#dfe8f2" fill-opacity=".85" stroke="#9fb1c6" stroke-width="1.2"/>`;
const lab = (px, py, tx, ty, t, anchor = "start") =>
  `<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(anchor === "start" ? tx - 3 : tx + 3)}" y2="${f1(ty - 4)}" stroke="${BONEO}" stroke-width=".8"/>` + etiquetaHueso(tx, ty, t, anchor);
const panelSep = (x, title) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>` +
  `<text x="${x + 14}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
const dashRC = (x1, y1, x2, y2) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
const lineas = (x, y, arr, size = 11.5, color = MUTE, gap = 15) => arr.map((t, i) => txt(x, y + i * gap, t, size, i === 0 && color === INK ? INK : color, "start", 400)).join("");
// rectángulo en coordenadas locales (para RI / colimación sobre figuras transformadas)
const rectL = (M, x1, y1, x2, y2) => { const a = M([x1, y1]), b = M([x2, y2]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])]; };
const medida = (x1, y1, x2, y2) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${BLUE}" stroke-width="1.4" marker-end="url(#arb)" marker-start="url(#arb)"/>`;
const plomo = (x, y, w, h, rot = 0) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="3" fill="#6f7886" fill-opacity=".55" stroke="#4d5462" stroke-width="1.2" transform="rotate(${rot} ${f1(x + w / 2)} ${f1(y + h / 2)})"/>`;
const bolsa = (x, y, w, h, rot = 0) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="5" fill="#d9c8a0" stroke="#9a875e" stroke-width="1.2" transform="rotate(${rot} ${f1(x + w / 2)} ${f1(y + h / 2)})"/>`;
const cinta = (x, y, w, h, rot = 0) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#b9cbe6" fill-opacity=".8" stroke="#7f97bd" stroke-width="1" transform="rotate(${rot} ${f1(x + w / 2)} ${f1(y + h / 2)})"/>`;

// cabeza vista desde atrás (nuca hacia el observador)
function cabezaAtras(cx, cy, r = 24, rot = 0) {
  return `<g transform="rotate(${rot} ${cx} ${cy})">` +
    `<ellipse cx="${f1(cx - r * 0.98)}" cy="${cy}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.28)}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${f1(cx + r * 0.98)}" cy="${cy}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.28)}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${f1(r * 0.92)}" ry="${f1(r * 1.12)}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
    `<path d="M${f1(cx - r * 0.2)},${f1(cy - r * 0.55)} C${f1(cx)},${f1(cy - r * 0.75)} ${f1(cx + r * 0.25)},${f1(cy - r * 0.45)} ${f1(cx + r * 0.05)},${f1(cy - r * 0.35)} C${f1(cx - r * 0.1)},${f1(cy - r * 0.3)} ${f1(cx - r * 0.1)},${f1(cy - r * 0.45)} ${f1(cx)},${f1(cy - r * 0.47)}" fill="none" stroke="${SKO}" stroke-width="1.2"/>` +
    `<path d="M${f1(cx - r * 0.55)},${f1(cy + r * 0.75)} Q${cx},${f1(cy + r * 0.92)} ${f1(cx + r * 0.55)},${f1(cy + r * 0.75)}" fill="none" stroke="${SKO}" stroke-width="1.2"/></g>`;
}

// =====================================================================
// ADULTO DE FRENTE / DE ESPALDAS (coordenadas locales: centro de la línea de hombros = (0,0), y hacia abajo)
// Referencias: escotadura yugular (0,27) · C7 (0,-4) · T7 (0,83.5) · xifoides (0,114) · borde costal inferior y≈152 · cresta ilíaca y≈200
// =====================================================================
const TY = (n) => -4 + 12.5 * n; // centro de Tn
const J = [0, 27], T7 = [0, TY(7)];
function frente(M, o = {}) {
  const { brazos = "abajo", espalda = false } = o;
  const s = M.s;
  const half = [[11, -8], [30, -2], [52, 2], [68, 8], [78, 17], [82, 30], [80, 48], [76, 72], [72, 110], [66, 150], [70, 185], [75, 215], [76, 240]];
  const torso = suave([...half.map(([x, y]) => [-x, y]).reverse(), ...half].map(M)) + " Z";
  const parts = [tubo(M, [[0, -46], [0, 2]], [11, 11]), torso];
  const enc = [], lin = [];
  for (const sg of [-1, 1]) {
    let eje, w, mano;
    if (brazos === "abajo") { eje = [[72, 16], [82, 70], [86, 125], [88, 180], [88, 205]]; w = [13, 12, 10.5, 8.5, 7.5]; mano = [88, 218, 9]; }
    else if (brazos === "caderas") { eje = [[72, 16], [96, 60], [112, 104], [90, 136], [72, 150]]; w = [13, 12, 10, 8.5, 8]; mano = [66, 154, 9]; }
    else if (brazos === "arriba") { eje = [[72, 16], [88, -30], [76, -92], [24, -110], [-28, -114]]; w = [13, 12, 10, 8, 7.5]; mano = [-34, -114, 8.5]; }
    else continue;
    const loc = eje.map(([x, y]) => [x * sg, y]);
    parts.push(tubo(M, loc, w));
    parts.push(suave(elipse(mano[0] * sg, mano[1], mano[2], mano[2], 14).map(M), true));
    if (brazos === "abajo") { // borde interno del brazo sobre el tronco
      const { L, R } = tuboLocal(loc, w); const inner = sg > 0 ? R : L;
      lin.push(linea(suave(inner.slice(1).map(M))));
    }
    if (brazos === "caderas") { const { L, R } = tuboLocal(loc, w); lin.push(linea(suave((sg > 0 ? L : R).slice(3).map(M)))); lin.push(linea(suave((sg > 0 ? R : L).slice(3).map(M)))); }
    if (brazos === "arriba" && sg > 0) { const { L, R } = tuboLocal(loc, w); lin.push(linea(suave(L.slice(3).map(M)))); lin.push(linea(suave(R.slice(3).map(M)))); }
  }
  const [hx, hy] = M([0, -60]);
  const cabeza = espalda ? cabezaAtras(f1(hx), f1(hy), 24 * s, M.rot) : cabezaFrente(f1(hx), f1(hy), 24 * s, M.rot);
  return figura(parts) + lin.join("") + cabeza;
}
function vertF(M, cx, cy, w, h) {
  const x1 = cx - w / 2, x2 = cx + w / 2, y1 = cy - h / 2, y2 = cy + h / 2, r = 2;
  return hueso(mapD(M, `M${x1 + r},${y1} L${x2 - r},${y1} L${x2},${y1 + r} L${x2},${y2 - r} L${x2 - r},${y2} L${x1 + r},${y2} L${x1},${y2 - r} L${x1},${y1 + r} Z`));
}
function huesosFrente(M, o = {}) {
  const { espalda = false, escapulas = espalda ? "fuera" : null, pulmones = true, costillas = true, pelvis = false, esternon = !espalda, esternonT = false, cervical = true, nCost = 10 } = o;
  let s = "";
  if (pulmones) for (const sg of [-1, 1]) s += pulmon(mapD(M, `M${sg * 10},8 C${sg * 20},-6 ${sg * 40},-6 ${sg * 50},10 C${sg * 62},36 ${sg * 68},90 ${sg * 66},134 L${sg * 60},140 C${sg * 46},126 ${sg * 26},118 ${sg * 12},122 C${sg * 8},90 ${sg * 8},40 ${sg * 10},8 Z`));
  // columna
  if (cervical) for (let k = 0; k < 4; k++) s += vertF(M, 0, -40 + k * 9, 12, 7);
  s += vertF(M, 0, -4, 13, 8);
  for (let n = 1; n <= 12; n++) s += vertF(M, 0, TY(n), 13 + n * 0.4, 9.5);
  if (pelvis) for (let n = 1; n <= 4; n++) s += vertF(M, 0, TY(12) + n * 13.5, 19, 11);
  if (costillas) for (let i = 0; i < nCost; i++) {
    const y = 4 + i * 12.5, lat = 44 + Math.min(i, 5) * 5;
    for (const sg of [-1, 1]) s += costilla(mapD(M, `M${sg * 8},${y} C${sg * 22},${y - 7} ${sg * (lat - 14)},${y - 8} ${sg * lat},${y + 8} C${sg * (lat + 3)},${y + 20} ${sg * (lat - 12)},${y + 30} ${sg * (lat - 30)},${y + 36}`));
  }
  if (!espalda && costillas) for (const sg of [-1, 1]) s += costilla(mapD(M, `M${sg * 6},112 C${sg * 24},126 ${sg * 46},146 ${sg * 64},158`));
  if (escapulas) {
    const m = escapulas === "fuera" ? 42 : 26;
    for (const sg of [-1, 1]) s += hueso(mapD(M, `M${sg * m},8 L${sg * 70},12 L${sg * 76},28 L${sg * (m + 12)},90 L${sg * (m + 2)},84 Z`), 'fill-opacity=".75"') +
      `<path d="${mapD(M, `M${sg * (m + 1)},22 L${sg * 80},10`)}" fill="none" stroke="${BONEO}" stroke-width="2"/>`;
  }
  // clavículas
  for (const sg of [-1, 1]) s += hueso(mapD(M, `M${sg * 9},24 C${sg * 24},16 ${sg * 44},22 ${sg * 66},4 L${sg * 67},11 C${sg * 44},30 ${sg * 24},24 ${sg * 9},31 Z`));
  if (esternon || esternonT) s += hueso(mapD(M, "M-9,25 L-3,25 L0,28 L3,25 L9,25 L10,40 L7,44 L7,104 L3,110 L0,114 L-3,110 L-7,104 L-7,44 L-10,40 Z"), esternonT ? 'fill-opacity=".55" stroke-dasharray="3 2"' : "");
  if (pelvis) for (const sg of [-1, 1]) s += hueso(mapD(M, `M${sg * 16},240 C${sg * 22},214 ${sg * 44},196 ${sg * 66},200 C${sg * 78},204 ${sg * 78},222 ${sg * 74},240 Z`));
  return s;
}

// =====================================================================
// ADULTO DE PERFIL (mira a la derecha). Coordenadas locales = las de costado() de la referencia de miembro superior.
// Referencias: escotadura yugular (460,141) · esternón medio (474,185) · xifoides (489,226) · C7 (444,128) · T7 (447,188)
// =====================================================================
const PT = (n) => [447, 128 + 8.6 * n];
const PJ = [460, 141], PEST = [474, 185], PT7 = [447, 188];
const TRONCO_SUP = "M432,74 L446,102 L452,108 L454,134 C462,142 476,150 486,166 C494,180 498,196 498,212 C498,240 492,262 494,290";
const ESPALDA = "C420,260 420,180 422,150 C424,140 428,134 430,120 Z";
const TRONCO = {
  medio: TRONCO_SUP + " L496,330 L424,330 L422,290 " + ESPALDA,
  completo: TRONCO_SUP + " C497,320 494,350 490,390 C487,420 486,450 486,470 C486,505 482,545 478,580 C490,588 512,594 528,598 C534,600 534,607 526,607 L452,607 C444,607 442,598 446,588 C448,570 440,540 436,510 C432,488 438,474 438,462 C436,420 432,370 422,340 C416,322 414,306 418,290 " + ESPALDA,
  sentado: TRONCO_SUP + " C500,292 520,290 560,292 L700,296 C708,294 712,284 714,274 C716,266 728,266 730,274 L734,318 C732,326 726,330 716,330 L440,330 C426,330 418,316 418,300 " + ESPALDA,
};
const FRENTE_PERFIL = [[454, 134], [462, 142], [476, 150], [486, 166], [494, 180], [498, 196], [498, 212], [497, 240], [493, 262], [494, 290]];
function afinP(ox, oy, s, rot = 0) { return afin(ox, oy, s, rot, 436, 80); }
function perfil(M, o = {}) {
  const { brazos = "colgando", cuerpo = "medio" } = o;
  const s = M.s;
  const [nx, ny] = M([436, 70]);
  const H = cabezaPerfil(f1(nx), f1(ny), { s: 0.3 * s, rot: 90 + M.rot });
  const parts = [H.d + " Z", mapD(M, TRONCO[cuerpo])];
  let eje, w, mano;
  if (brazos === "colgando") { eje = [[458, 146], [457, 200], [456, 245], [460, 290], [463, 316]]; w = [12, 11, 10, 8.5, 7.5]; mano = [464, 328, 8]; }
  else if (brazos === "caderas") { eje = [[458, 146], [450, 190], [442, 228], [458, 258], [476, 280]]; w = [12, 11, 9.5, 8.5, 8]; mano = [482, 286, 8]; }
  else if (brazos === "arriba") { eje = [[452, 150], [446, 96], [450, 38], [474, 24], [498, 28]]; w = [12, 11, 9.5, 8.5, 8]; mano = [504, 30, 8]; }
  else if (brazos === "atras") { eje = [[456, 146], [448, 198], [438, 246], [432, 290], [430, 314]]; w = [12, 11, 10, 8.5, 7.5]; mano = [430, 326, 8]; }
  const brazo = [tubo(M, eje, w), suave(elipse(mano[0], mano[1], mano[2], mano[2], 14).map(M), true)];
  if (brazos === "arriba") return figura(brazo) + figura(parts) + H.cara;
  return figura(parts, brazo) + H.cara;
}
function huesosPerfil(M, o = {}) {
  const { pulmones = true, esternon = true, columna = true, traquea = false } = o;
  let s = "";
  if (pulmones) s += pulmon(mapD(M, "M450,136 C464,138 476,152 482,170 C488,192 488,222 484,240 C470,234 450,238 434,242 C428,210 428,172 432,150 C436,140 442,136 450,136 Z"));
  if (traquea) s += `<path d="${mapD(M, "M447,104 L452,104 L456,152 L450,152 Z")}" fill="#cfe0f2" stroke="#7f97bd" stroke-width="1.1"/>`;
  if (columna) {
    const v = (cx, cy, w, h) => vertF(M, cx, cy, w, h);
    [98, 104, 110, 116, 122, 128].forEach((y) => { s += v(440, y, 9, 5); });
    for (let n = 1; n <= 12; n++) { const [x, y] = PT(n); s += v(x - (n > 9 ? 0 : 1), y, 11, 7); }
  }
  if (esternon) s += hueso(mapD(M, "M457,141 L463,140 C474,166 484,196 491,222 L488,230 L484,222 C478,196 468,166 457,141 Z"));
  return s;
}

// =====================================================================
// CORTE DESDE ARRIBA (vista superior, desde la cabeza): paciente rotado contra el RI (abajo)
// local: +x = izquierda del paciente, +y = anterior. th = rotación en pantalla (grados)
// =====================================================================
const SUP_OUT = [[-58, -36], [0, -38], [58, -36], [84, -30], [98, -18], [101, 2], [99, 22], [84, 30], [58, 36], [0, 40], [-58, 36], [-86, 28], [-99, 14], [-101, -8], [-90, -26]];
function superior(cx, by, th, s = 0.9) {
  const r = (th * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const R = ([x, y]) => [s * (x * c - y * sn), s * (x * sn + y * c)];
  const maxY = Math.max(...SUP_OUT.map((p) => R(p)[1]));
  const T = (p) => { const q = R(p); return [cx + q[0], by - maxY - 1 + q[1]]; };
  const out = suave(SUP_OUT.map(T), true);
  // huesos (corte a nivel del tórax, por transparencia)
  const caja = `<path d="${suave(elipse(0, 2, 76, 31, 30).map(T), true)}" fill="none" stroke="${BONEO}" stroke-width="3.4" opacity=".8"/><path d="${suave(elipse(0, 2, 76, 31, 30).map(T), true)}" fill="none" stroke="${BONE}" stroke-width="1.6"/>`;
  const vert = hueso(suave(elipse(0, -17, 8, 7, 16).map(T), true)) + `<path d="M${P(T, [0, -24])} L${P(T, [0, -34])}" stroke="${BONEO}" stroke-width="3" stroke-linecap="round"/>`;
  const est = hueso(`M${P(T, [-8, 27])} L${P(T, [8, 27])} L${P(T, [8, 32])} L${P(T, [-8, 32])} Z`);
  const [hx, hy] = T([0, 2]);
  const nose = [T([-7, 20]), T([0, 34]), T([7, 20])].map((p) => p.map(f1).join(",")).join(" L");
  const ear = (x) => { const [ex, ey] = T([x, 3]).map(f1); return `<ellipse cx="${ex}" cy="${ey}" rx="${f1(4.5 * s)}" ry="${f1(7 * s)}" transform="rotate(${th} ${ex} ${ey})" fill="${SK}" stroke="${SKO}" stroke-width="1.5"/>`; };
  const cabeza = `<g opacity=".72">` + ear(-21) + ear(21) + `<path d="M${nose} Z" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/><circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(21 * s)}" fill="${SK}" stroke="${SKO}" stroke-width="2"/></g>`;
  const sD = T([-74, -20]), sI = T([74, -20]);
  return {
    T,
    body: piel(out) + caja + vert + est + cabeza + side(f1(sD[0]), f1(sD[1]), "D") + side(f1(sI[0]), f1(sI[1]), "I"),
    // intersección superior (y mínima) del contorno con la vertical x
    entrada(x) {
      const pts = SUP_OUT.map(T); let best = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) { const t = (x - a[0]) / (b[0] - a[0]); best = Math.min(best, a[1] + t * (b[1] - a[1])); }
      }
      return best;
    },
  };
}
// panel de vista superior: RI abajo, arco de rotación, RC vertical
function panelSup(o) {
  const { x0, w = 370, th, rc = [0, 0], angLabel, by = 236, beamX, angPos } = o;
  const cx = x0 + w / 2;
  const v = superior(cx, by, th);
  const posterior = Math.cos((th * Math.PI) / 180) < 0;
  // hombro en contacto: el más bajo
  const a = v.T([-101, -8]), b = v.T([101, 2]);
  const contacto = a[1] > b[1] ? { p: v.T([-100, 0]), otro: v.T([100, 0]) } : { p: v.T([100, 0]), otro: v.T([-100, 0]) };
  const dx = contacto.otro[0] - contacto.p[0], dy = contacto.otro[1] - contacto.p[1], L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L, sg = Math.sign(ux) || 1;
  const rA = 92;
  const arc = `<path d="M${f1(contacto.p[0] + sg * rA)},${f1(contacto.p[1])} A${rA},${rA} 0 0 ${sg > 0 ? 0 : 1} ${f1(contacto.p[0] + ux * rA)},${f1(contacto.p[1] + uy * rA)}" fill="none" stroke="${BLUE}" stroke-width="1.8"/>`;
  const bx = beamX ?? v.T(rc)[0];
  const ey = v.entrada(bx);
  const angRad = Math.atan2(-uy, Math.abs(ux)) / 2;
  const lx = contacto.p[0] + sg * (rA + 10) * Math.cos(angRad), ly = contacto.p[1] - (rA + 10) * Math.sin(angRad);
  return {
    v, posterior, cx,
    svg: `<rect x="${x0 + 14}" y="${by}" width="${w - 28}" height="10" fill="#cfd3dc"/>` + ri(x0 + 30, by - 4, w - 60, 4) +
      txt(x0 + 18, by + 24, "Bucky vertical (RI)", 11, MUTE) +
      v.body +
      `<line x1="${f1(contacto.p[0])}" y1="${f1(contacto.p[1])}" x2="${f1(contacto.p[0] + ux * (rA + 18))}" y2="${f1(contacto.p[1] + uy * (rA + 18))}" stroke="${BLUE}" stroke-width="1.3" stroke-dasharray="5 4"/>` +
      arc + (angPos ? txt(angPos[0], angPos[1], angLabel, 13, BLUE, "start", 700) : txt(f1(lx), f1(ly + 5), angLabel, 13, BLUE, sg > 0 ? "start" : "end", 700)) +
      `<line x1="${f1(bx)}" y1="44" x2="${f1(bx)}" y2="${f1(ey - 7)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` +
      dashRC(bx, ey, bx, by - 4),
    bx, ey,
  };
}

// =====================================================================
// NIÑO DE FRENTE (local: hombros en y=0; cabeza grande, brazos arriba)
// pezones (±22,40) = línea mamilar ≈ mitad de los campos pulmonares
// =====================================================================
function ninoF(M, o = {}) {
  const { espalda = false, piernas = "extendidas" } = o;
  const s = M.s;
  const half = [[9, -4], [26, 0], [40, 5], [47, 14], [48, 30], [46, 60], [44, 90], [46, 110], [44, 126], [30, 138], [0, 142]];
  const torso = suave([...half.map(([x, y]) => [-x, y]).reverse().slice(0, -1), ...half], true, 0.9);
  const parts = [tubo(M, [[0, -24], [0, 4]], [9, 9]), suave([...half.map(([x, y]) => [-x, y]).reverse().slice(0, -1), ...half].map(M), true, 0.9)];
  const lin = [];
  for (const sg of [-1, 1]) {
    const brazo = [[42, 8], [48, -28], [44, -70], [38, -92]].map(([x, y]) => [x * sg, y]);
    parts.push(tubo(M, brazo, [10, 9, 7.5, 6.5]), suave(elipse(38 * sg, -100, 7.5, 8.5, 14).map(M), true));
    if (piernas === "extendidas") {
      const pierna = [[22, 120], [24, 170], [25, 215], [26, 246]].map(([x, y]) => [x * sg, y]);
      parts.push(tubo(M, pierna, [17, 12.5, 10, 8]), suave(elipse(27 * sg, 256, 8, 11, 14).map(M), true));
      const { L, R } = tuboLocal(pierna, [17, 12.5, 10, 8]);
      lin.push(linea(suave((sg > 0 ? R : L).slice(1).map(M))));
    } else if (piernas === "sentado") {
      const pierna = [[22, 128], [26, 170], [27, 200]].map(([x, y]) => [x * sg, y]);
      parts.push(tubo(M, pierna, [15, 10.5, 8.5]), suave(elipse(28 * sg, 208, 9, 7, 14).map(M), true));
    }
  }
  const [hx, hy] = M([0, -48]);
  const cabeza = espalda ? cabezaAtras(f1(hx), f1(hy), 27 * s, M.rot) : cabezaFrente(f1(hx), f1(hy), 27 * s, M.rot);
  let pez = "";
  if (!espalda) for (const sg of [-1, 1]) { const [px, py] = M([22 * sg, 40]); pez += `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(2.6 * s)}" fill="${SKO}"/>`; }
  return figura(parts) + lin.join("") + cabeza + pez;
}
function huesosNinoF(M, { espalda = false } = {}) {
  let s = "";
  for (const sg of [-1, 1]) s += pulmon(mapD(M, `M${sg * 7},4 C${sg * 14},-6 ${sg * 28},-6 ${sg * 34},6 C${sg * 42},24 ${sg * 44},60 ${sg * 42},84 L${sg * 38},88 C${sg * 30},80 ${sg * 18},76 ${sg * 8},80 C${sg * 5},60 ${sg * 5},24 ${sg * 7},4 Z`));
  for (let n = 0; n < 13; n++) s += vertF(M, 0, -2 + n * 7.4, 9, 5.5);
  for (let i = 0; i < 8; i++) { const y = 4 + i * 9, lat = 30 + Math.min(i, 4) * 3.2; for (const sg of [-1, 1]) s += costilla(mapD(M, `M${sg * 5},${y} C${sg * 14},${y - 5} ${sg * (lat - 8)},${y - 5} ${sg * lat},${y + 5} C${sg * (lat + 2)},${y + 13} ${sg * (lat - 8)},${y + 19} ${sg * (lat - 18)},${y + 23}`)); }
  for (const sg of [-1, 1]) s += hueso(mapD(M, `M${sg * 6},14 C${sg * 16},9 ${sg * 28},13 ${sg * 42},4 L${sg * 42},9 C${sg * 28},19 ${sg * 16},15 ${sg * 6},19 Z`));
  return s;
}

// NIÑO DE PERFIL (mira a la derecha; local: nuca en (0,0))
function ninoP(M, o = {}) {
  const { piernas = "flexionadas" } = o;
  const s = M.s;
  const [nx, ny] = M([0, 0]);
  const H = cabezaPerfil(f1(nx), f1(ny), { s: 0.26 * s, rot: 90 + M.rot });
  const tronco = mapD(M, "M-2,4 L10,26 L14,34 L16,46 C30,50 44,60 48,80 C52,100 50,124 44,146 C36,160 10,162 0,152 C-8,132 -8,90 -6,60 C-4,48 -2,40 -2,30 Z");
  const parts = [H.d + " Z", tronco];
  let pierna, wp, pie;
  if (piernas === "flexionadas") { pierna = [[16, 146], [40, 164], [62, 178], [48, 202], [34, 224]]; wp = [15, 12, 9.5, 8, 6.5]; pie = [42, 230, 9, 5]; }
  else { pierna = [[16, 148], [40, 152], [62, 154], [64, 178], [64, 198]]; wp = [15, 12, 9.5, 8, 6.5]; pie = [72, 203, 9, 5]; }
  parts.push(tubo(M, pierna, wp), suave(elipse(pie[0], pie[1], pie[2], pie[3], 14).map(M), true));
  const brazo = [[14, 56], [12, 20], [16, -14], [26, -34]];
  const wb = [9, 8, 7, 6];
  const atras = [tubo(M, brazo, wb), suave(elipse(30, -40, 6.5, 7.5, 14).map(M), true)];
  return figura(atras) + figura(parts) + H.cara;
}
function huesosNinoP(M) {
  let s = pulmon(mapD(M, "M10,52 C24,52 36,62 40,80 C44,98 42,114 38,122 C28,118 14,120 2,124 C-2,104 -2,76 2,62 C4,56 6,52 10,52 Z"));
  for (let n = 0; n < 14; n++) s += vertF(M, 6, 40 + n * 7.6, 8, 5);
  s += hueso(mapD(M, "M30,54 L34,54 C40,74 44,96 46,112 L42,114 C38,96 34,74 30,54 Z"));
  return s;
}

const I = {};

// ---------------------------------------------------------------------
// TÓRAX
// ---------------------------------------------------------------------
I["torax-pa"] = () => {
  // panel 1: de costado, de pie, pecho contra el Bucky (figura anatómica de anatomia.cjs, 2,2 px = 1 cm)
  const yv = 44, s1 = 2.2, xp = 227; // y del vértice, escala, x de la línea de plomada
  const T1 = A.X({ s: s1, at: [xp, yv + (172 - 87) * s1] });
  const F = A.figuraPerfil({ T: T1, cabeza: 16, hombro: -35, codo: 65, escorzo: [0.72, 0.92] }); // codo hacia afuera: brazo y antebrazo escorzados
  const H = (h) => yv + (172 - h) * s1;
  const t7 = T1([A.ejeX(A.VERT.T7), A.yH(A.VERT.T7)]), back = [T1([-12.7, 0])[0], H(A.VERT.T7)];
  const cl = A.columnaLateral({ T: T1, desde: "C2", hasta: "L2", sacro: false }), tl = A.toraxLateral({ T: T1 });
  const p1 = view("1 · Vista lateral · de pie") +
    wall(254, 40, 306, "Bucky vertical") +
    `<clipPath id="cpTP1"><rect x="0" y="26" width="372" height="278"/></clipPath><g clip-path="url(#cpTP1)">` +
    F.atras + F.cuerpo + tl.svg + cl.svg + `<g opacity=".82">${F.frente}</g>` + F.cara + `</g>` +
    `<rect x="${f1(t7[0] - 7)}" y="${f1(t7[1] - 6)}" width="14" height="12" rx="3" fill="none" stroke="${RED}" stroke-width="1.3" stroke-dasharray="3 2"/>` +
    beam(f1(back[0]), f1(back[1]), 0, 130, { horizontal: true }) + dashRC(back[0], back[1], 254, back[1]) +
    txt(110, back[1] + 26, "DFRI 180 cm", 12.5, RED, "middle", 700) +
    note(back[0] - 30, back[1] - 2, 150, 92, ["RC ⟂ al RI", "(horizontal), en T7"], RED, "end") +
    note(F.P.menton[0] + 2, F.P.menton[1] + 2, 292, 52, ["Mentón", "elevado"]) +
    note(...F.P.muneca, 292, 214, ["Manos en", "las caderas,", "hombros", "adelante"]) +
    lineas(24, 266, ["Pecho contra el RI,", "sin rotación"], 11.5, MUTE);
  // panel 2: desde el tubo (de espaldas), 2,6 px = 1 cm; RI 35 x 43 cm a escala
  const s2 = 2.6, xc = 560, yv2 = 40, H2 = (h) => yv2 + (172 - h) * s2;
  const T2 = A.X({ s: s2, at: [xc, yv2 + (172 - 87) * s2] });
  const G = A.figuraFrente({ T: T2, espalda: true, brazos: "caderas" });
  const tx = A.toraxPA({ T: T2, espalda: true, hombrosAdelante: true });
  const riY0 = H2(148), riW = 35 * s2, riH = 43 * s2;
  const c7 = [xc, H2(A.ALT.c7)], t7b = [xc, H2(A.VERT.T7)], mx = xc - 30;
  const piel = 16.6 * s2;
  const p2 = panelSep(380, "2 · Desde el tubo (de espaldas)") +
    `<clipPath id="cpTP2"><rect x="386" y="26" width="374" height="292"/></clipPath><g clip-path="url(#cpTP2)">` +
    riTop(f1(xc - riW / 2), f1(riY0), f1(riW), f1(riH)) + G.cuerpo + tx.svg + G.frente + G.cara + `</g>` +
    `<rect x="${f1(xc - riW / 2)}" y="${f1(riY0)}" width="${f1(riW)}" height="${f1(riH)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10 3" opacity=".8"/>` +
    coll(f1(xc - piel), f1(c7[1]), f1(2 * piel), f1(riY0 + riH - c7[1] - 3)) +
    dot(...c7) + medida(mx, c7[1] + 2, mx, t7b[1] - 2) + `<line x1="${f1(mx - 4)}" y1="${f1(c7[1])}" x2="${f1(c7[0])}" y2="${f1(c7[1])}" stroke="${BLUE}" stroke-width="1"/>` +
    cross(...t7b) +
    note(c7[0] - 4, c7[1] - 2, 398, 50, ["Vértebra", "prominente"], BLUE) +
    note(mx - 2, (c7[1] + t7b[1]) / 2, 398, 150, ["18-20 cm"], BLUE) +
    note(t7b[0] + 10, t7b[1] + 4, 668, 56, ["RC ⟂", "en T7"], RED) +
    lineas(668, 214, ["Colimar: arriba", "hasta C7; a los", "lados, la piel"], 10.5, AMB, 13) +
    lineas(668, 270, ["RI 35 × 43 cm", "vert. u horiz."], 11, INK, 14) +
    lineas(398, 300, ["2.ª inspiración", "profunda · parrilla"], 11, MUTE, 14);
  return svg(p1 + p2);
};

I["torax-lateral"] = () => {
  const M = afin(470, 124, 0.8);
  const t7 = M(T7), lado = M([-76, TY(7)]);
  return svg(
    view("Vista de frente · lado izquierdo contra el RI") +
    wall(540, 30, 306, "Bucky vertical") + ri(538, 70, 3, 196) +
    frente(M, { brazos: "arriba" }) + huesosFrente(M) +
    beam(lado[0], lado[1], 0, 250, { horizontal: true }) + dashRC(lado[0], t7[1], 538, t7[1]) +
    note(260, t7[1], 250, 66, ["RC ⟂ (horizontal) a la mitad", "del tórax, a la altura de T7"], RED, "end") +
    txt(270, t7[1] + 24, "DFRI 180 cm", 12.5, RED, "middle", 700) +
    note(...M([30, -106]), 570, 46, ["Brazos cruzados sobre", "la cabeza, mentón arriba"]) +
    txt(570, 112, "Plano sagital medio", 11.5, BLUE, "start", 700) + txt(570, 126, "paralelo al RI, sin rotación", 11.5, BLUE) +
    txt(570, 160, "RI 35 × 43 cm vertical", 11.5, INK) + txt(570, 174, "RI y RC ≈2,5 cm más abajo", 11.5, INK) + txt(570, 188, "que en la PA", 11.5, INK) +
    txt(570, 222, "Las caderas no se apoyan", 11.5, MUTE) + txt(570, 236, "en el soporte del RI", 11.5, MUTE) +
    side(M([-60, 200])[0], M([-60, 200])[1], "D") + side(M([60, 200])[0], M([60, 200])[1], "I") +
    txt(24, 300, "2.ª inspiración completa · parrilla", 11.5, MUTE)
  );
};

I["torax-lateral-camilla"] = () => {
  const M = afinP(134, 105, 0.78);
  const t7 = M([459, 188]);
  const [rx, ry, rw, rh] = rectL(M, 384, 124, 534, 252);
  const [cx1, cy1, cw, ch] = rectL(M, 421, 128, 499, 250);
  return svg(
    view("Vista desde el tubo · sentado de costado al RI") +
    riTop(rx, ry, rw, rh) +
    `<rect x="90" y="300" width="290" height="11" rx="3" fill="#cfd3dc"/>` + txt(96, 326, "Camilla (o silla de ruedas)", 11, MUTE) +
    perfil(M, { brazos: "arriba", cuerpo: "sentado" }) + huesosPerfil(M) +
    coll(cx1, cy1, cw, ch) + cross(...t7) +
    note(t7[0] + 12, t7[1] + 4, 430, 70, ["RC ⟂ al RI, en la mitad del tórax", "a la altura de T7"], RED) +
    note(...M([460, 30]), 430, 128, ["Brazos cruzados sobre la cabeza", "o tomados de una barra"]) +
    txt(430, 184, "Sentado derecho, sin rotación", 12, INK, "start", 700) + txt(430, 200, "ni inclinación; mentón arriba", 12, INK) +
    txt(430, 226, "Plano sagital medio paralelo al RI", 11.5, BLUE, "start", 700) +
    txt(430, 258, "RI 35 × 43 cm horizontal · parrilla", 11.5, INK) + txt(430, 274, "DFRI 180 cm", 11.5, RED, "start", 700) +
    txt(430, 296, "Colimar arriba hasta C7; adelante y", 11, AMB) + txt(430, 310, "atrás hasta la piel", 11, AMB)
  );
};

I["torax-decubito-lateral"] = () => {
  const M = afin(178, 168, 0.88, -90);
  const t7 = M(T7), j = M(J);
  const [rx, ry, rw, rh] = rectL(M, -84, -24, 84, 180);
  return svg(
    view("Vista desde el tubo · decúbito lateral (paciente de frente)") +
    riTop(rx, ry, rw, rh) + txt(452, 258, "RI 35 × 43 cm, el largo a lo", 11, INK) + txt(452, 272, "largo del paciente · parrilla", 11, INK) +
    `<rect x="40" y="244" width="380" height="11" rx="4" fill="#e3e6ec" stroke="#a9afbb"/>` +
    `<rect x="30" y="256" width="400" height="12" fill="#cfd3dc"/>` + txt(36, 284, "Camilla con ruedas trabadas · almohadilla radiotransparente debajo", 11, MUTE) +
    frente(M, { brazos: "arriba" }) + huesosFrente(M) +
    side(...M([-56, 196]), "D") + side(...M([56, 196]), "I") +
    dot(...j) + medida(j[0] + 3, j[1] - 26, t7[0] - 3, j[1] - 26) +
    `<line x1="${f1(j[0])}" y1="${f1(j[1] - 4)}" x2="${f1(j[0])}" y2="${f1(j[1] - 30)}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 2"/>` +
    txt((j[0] + t7[0]) / 2, j[1] - 32, "8-10 cm", 11, BLUE, "middle", 700) +
    cross(...t7) +
    note(t7[0] + 6, t7[1] + 10, 452, 70, ["RC horizontal, dirigido a T7", "8-10 cm bajo la escotadura yugular"], RED) +
    note(j[0], j[1] + 6, 452, 128, ["escotadura yugular"], BLUE) +
    txt(452, 164, "Líquido (derrame): lado sospechoso abajo", 12, INK, "start", 700) +
    txt(452, 180, "Aire (neumotórax): lado sospechoso arriba", 12, INK, "start", 700) +
    txt(452, 210, "Brazos sobre la cabeza, mentón arriba", 11.5, MUTE) + txt(452, 226, "AP verdadera, sin rotación", 11.5, MUTE) +
    txt(452, 304, "DFRI 180 cm (Bucky mural)", 11.5, RED, "start", 700) + txt(452, 319, "100-120 cm con chasis y parrilla", 11.5, RED)
  );
};

I["torax-ap-lordotica"] = () => {
  const s = 0.5, rot = -16;
  const heel = [222, 304];
  const r = (rot * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const dx = 448 - 436, dy = 607 - 80;
  const M0 = afinP(0, 0, s, rot), h0 = M0([448, 607]), b0 = M0([422, 168]);
  heel[0] = 134 + (h0[0] - b0[0]);
  const M = afinP(heel[0] - h0[0], heel[1] - h0[1], s, rot);
  const est = M(PEST);
  const fr = FRENTE_PERFIL.map(M);
  let sx = est[0] + 10;
  for (let i = 0; i < fr.length - 1; i++) { const a = fr[i], b = fr[i + 1]; if ((a[1] - est[1]) * (b[1] - est[1]) <= 0) { sx = a[0] + ((est[1] - a[1]) / (b[1] - a[1])) * (b[0] - a[0]); break; } }
  const hombro = M([452, 132]);
  const riTopY = hombro[1] - 24;
  return svg(
    view("Vista lateral · de pie, apoyado de espaldas") +
    `<rect x="20" y="304" width="380" height="6" fill="#cfd3dc"/>` +
    wall(120, 40, 304, "") + txt(110, 300, "Bucky", 10, MUTE, "end") +
    ri(127, riTopY, 5, 170) +
    perfil(M, { brazos: "caderas", cuerpo: "completo" }) + huesosPerfil(M) +
    beam(sx, est[1], 180, 150, { ref: 180 }) + dashRC(sx, est[1], 136, est[1]) +
    medida(134, 296, heel[0] - 10, 296) + txt((134 + heel[0]) / 2, 290, "≈30 cm", 11, BLUE, "middle", 700) +
    `<line x1="112" y1="${f1(riTopY - 4)}" x2="126" y2="${f1(riTopY)}" stroke="${BLUE}" stroke-width="1.2"/>` +
    lineas(108, riTopY + 4, ["Borde sup.", "del RI: 7-8 cm", "sobre los", "hombros"], 10.5, BLUE, 13).replace(/text-anchor="start"/g, 'text-anchor="end"') +
    note(sx + 60, est[1] - 2, 420, 60, ["RC ⟂ al RI, en la parte media del", "esternón: 9 cm bajo la escotadura yugular"], RED) +
    txt(sx + 75, est[1] + 22, "DFRI 180 cm", 12.5, RED, "middle", 700) +
    txt(420, 214, "De pie a ≈30 cm, inclinado hacia atrás:", 12, INK, "start", 700) +
    txt(420, 230, "hombros y espalda alta en el Bucky", 12, INK) +
    txt(420, 252, "Manos en las caderas, palmas afuera,", 11.5, MUTE) + txt(420, 266, "hombros hacia adelante", 11.5, MUTE) +
    txt(420, 286, "Si no puede adoptar la postura: AP semiaxial", 11, MUTE) + txt(420, 300, "con RC 15-20° craneal (no dibujada)", 11, MUTE) +
    txt(420, 318, "2.ª inspiración completa · parrilla · RI 35 × 43 cm vertical", 10.5, MUTE)
  );
};

// ---------------------------------------------------------------------
// VÍA AÉREA
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// TÓRAX PEDIÁTRICO
// ---------------------------------------------------------------------
I["torax-ped-ap-mesa"] = () => {
  const M = afin(230, 166, 0.95, -90);
  const mam = M([0, 40]);
  const [rx, ry, rw, rh] = rectL(M, -64, -26, 64, 100);
  const [cx1, cy1, cw, ch] = rectL(M, -50, -6, 50, 92);
  return svg(
    view("Vista desde el tubo · decúbito supino (cabeza a la izquierda)") +
    `<rect x="20" y="70" width="430" height="196" rx="6" fill="#eef0f4"/>` + txt(26, 260, "Mesa", 10, MUTE) +
    riTop(rx, ry, rw, rh) +
    ninoF(M) + huesosNinoF(M) +
    cinta(...M([-38, -78]), 12, 34, 0) + cinta(...M([38, -78]), 12, 34, 0) +
    bolsa(M([-40, -96])[0] - 18, M([-40, -96])[1] - 10, 22, 22) + bolsa(M([40, -96])[0] - 18, M([40, -96])[1] - 10, 22, 22) +
    bolsa(M([-26, 236])[0] - 10, M([-26, 236])[1] - 6, 24, 18) + bolsa(M([26, 236])[0] - 10, M([26, 236])[1] - 12, 24, 18) +
    plomo(M([0, 112])[0] - 14, M([0, 112])[1] - 40, 30, 80) +
    coll(cx1, cy1, cw, ch) +
    `<line x1="${f1(mam[0])}" y1="${f1(cy1 - 6)}" x2="${f1(mam[0])}" y2="${f1(cy1 + ch + 6)}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    cross(...mam) +
    note(mam[0] + 4, cy1 - 4, 470, 52, ["RC ⟂ en la mitad de los campos", "pulmonares, a la altura de la", "línea mamilar (pezones)"], RED) +
    txt(470, 126, "Hombros 5 cm por debajo del", 12, INK, "start", 700) + txt(470, 142, "borde superior del RI (izquierda)", 12, INK) +
    note(M([0, 120])[0] + 12, M([0, 120])[1] + 30, 470, 178, ["Protección gonadal"], "#4d5462") +
    txt(470, 206, "Brazos y piernas extendidos e", 11.5, MUTE) + txt(470, 220, "inmovilizados (cinta, bolsas de arena)", 11.5, MUTE) +
    txt(470, 244, "RI 18 × 24 o 24 × 30 cm horizontal", 11, INK) + txt(470, 258, "DFRI mín. 128-150 cm, tubo lo más alto", 11, RED) +
    txt(470, 272, "Sin parrilla (salvo que no se pueda retirar)", 11, MUTE) +
    txt(20, 300, "Colimación estrecha a los 4 lados · 2.ª inspiración completa (si llora, en inspiración completa)", 11, MUTE) +
    txt(20, 316, "Si ayuda un padre o una madre: sostiene brazos y cabeza con una mano y piernas con la otra, con delantal y guantes plomados", 10.5, MUTE)
  );
};

function piggo(x1, x2, y1, y2) {
  return `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="8" fill="#cfe3f0" fill-opacity=".35" stroke="#7f97bd" stroke-width="1.4"/>`;
}
I["torax-ped-pa-pigg"] = () => {
  const M = afin(240, 158, 0.95);
  const mam = M([0, 40]);
  const [rx, ry, rw, rh] = rectL(M, -66, -12, 66, 104);
  const cr = M([0, 128]);
  return svg(
    view("Vista desde el tubo · sentado en el Pigg-O-Stat (de espaldas)") +
    riTop(rx, ry, rw, rh) +
    `<clipPath id="cvP"><rect x="0" y="28" width="400" height="290"/></clipPath><g clip-path="url(#cvP)">` +
    ninoF(M, { espalda: true, piernas: "sentado" }) + huesosNinoF(M, { espalda: true }) + `</g>` +
    `<rect x="${f1(M([-60, 136])[0])}" y="${f1(M([-60, 136])[1])}" width="${f1(120 * 0.95)}" height="16" rx="5" fill="#cfd3dc" stroke="#9aa0ad"/>` +
    piggo(f1(M([-74, -110])[0]), f1(M([-54, -110])[0]), f1(M([0, -110])[1]), f1(M([0, 60])[1])) +
    piggo(f1(M([54, -110])[0]), f1(M([74, -110])[0]), f1(M([0, -110])[1]), f1(M([0, 60])[1])) +
    plomo(M([-56, 112])[0], M([0, 112])[1], 112 * 0.95, 20) +
    side(f1(M([-30, 122])[0]), f1(M([0, 122])[1]), "I") + side(f1(M([30, 122])[0]), f1(M([0, 122])[1]), "D") +
    `<line x1="${f1(rx - 8)}" y1="${f1(mam[1])}" x2="${f1(rx + rw + 8)}" y2="${f1(mam[1])}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    cross(...mam) +
    note(mam[0] + 12, mam[1] + 2, 420, 60, ["RC ⟂ en la mitad de los campos", "pulmonares, a la altura de la", "línea mamilar"], RED) +
    note(rx + rw - 2, ry + 2, 420, 130, ["Hombros ≈2,5 cm por debajo", "del borde superior del RI"]) +
    note(M([64, -40])[0], M([64, -40])[1], 420, 180, ["Piezas laterales: sostienen", "brazos y cabeza, firmes"], "#5f7fae") +
    note(M([56, 116])[0], M([56, 116])[1], 420, 230, ["Protección plomada con D e I,", "2,5-5 cm sobre la cresta ilíaca"], "#4d5462") +
    txt(420, 276, "Piernas por las aberturas del asiento", 11, MUTE) +
    txt(420, 292, "RI 18 × 24 o 24 × 30 cm horizontal", 11, INK) + txt(420, 306, "DFRI mín. 180 cm · sin parrilla", 11, RED) +
    txt(420, 320, "Inspiración completa · colimación estrecha", 11, MUTE)
  );
};

I["torax-ped-lateral-mesa"] = () => {
  const M = afin(108, 205, 1.3, -90);
  const mam = M([24, 86]);
  const [rx, ry, rw, rh] = rectL(M, -12, 40, 56, 140);
  return svg(
    view("Vista desde el tubo · decúbito lateral izquierdo") +
    `<rect x="20" y="70" width="430" height="200" rx="6" fill="#eef0f4"/>` + txt(26, 264, "Mesa", 10, MUTE) +
    riTop(rx, ry, rw, rh) +
    ninoP(M) + huesosNinoP(M) +
    cinta(M([24, -18])[0] - 6, M([24, -18])[1] - 16, 12, 32) + bolsa(M([30, -44])[0] - 26, M([30, -44])[1] - 12, 22, 24) +
    cinta(M([52, 190])[0] - 6, M([52, 190])[1] - 22, 12, 44) + bolsa(M([40, 232])[0] - 6, M([40, 232])[1] - 14, 22, 26) +
    plomo(M([24, 148])[0] - 12, M([24, 148])[1] - 30, 24, 60) +
    `<line x1="${f1(mam[0])}" y1="${f1(ry - 6)}" x2="${f1(mam[0])}" y2="${f1(ry + rh + 6)}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    cross(...mam) +
    note(mam[0] + 4, ry - 4, 470, 52, ["RC ⟂ en la mitad de los campos", "pulmonares, a la altura de la", "línea mamilar"], RED) +
    note(M([22, -10])[0], M([22, -10])[1], 470, 124, ["Brazos arriba, cabeza entre", "ellos (cinta y bolsas de arena)"]) +
    note(M([52, 180])[0], M([52, 180])[1], 470, 172, ["Piernas flexionadas y fijadas;", "protección plomada en la pelvis"]) +
    txt(470, 214, "Lateral verdadera, sin rotación", 11.5, BLUE, "start", 700) +
    txt(470, 240, "RI 18 × 24 o 24 × 30 cm vertical", 11, INK) + txt(470, 254, "DFRI mín. 128-150 cm, tubo lo más alto", 11, RED) +
    txt(470, 268, "Sin parrilla (salvo que no se pueda retirar)", 11, MUTE) +
    txt(20, 300, "Colimación estrecha a los 4 lados · 2.ª inspiración completa (si llora, en inspiración completa)", 11, MUTE) +
    txt(20, 316, "Si ayuda un padre o una madre: sostiene brazos y cabeza con una mano y piernas con la otra, con delantal y guantes plomados", 10.5, MUTE)
  );
};

I["torax-ped-lateral-pigg"] = () => {
  const M = afin(220, 102, 1.05);
  const mam = M([24, 86]);
  const [rx, ry, rw, rh] = rectL(M, -14, 38, 60, 150);
  const seat = M([-10, 160]);
  return svg(
    view("Vista desde el tubo · Pigg-O-Stat girado 90° (lateral izquierda)") +
    riTop(rx, ry, rw, rh) +
    ninoP(M, { piernas: "sentado" }) + huesosNinoP(M) +
    `<rect x="${f1(seat[0])}" y="${f1(seat[1])}" width="${f1(84 * 1.05)}" height="14" rx="5" fill="#cfd3dc" stroke="#9aa0ad"/>` +
    `<rect x="${f1(seat[0] + 30)}" y="${f1(seat[1] + 14)}" width="10" height="${f1(310 - seat[1] - 14)}" fill="#cfd3dc"/>` +
    piggo(f1(M([-12, 0])[0]), f1(M([58, 0])[0]), f1(M([0, -50])[1]), f1(M([0, 120])[1])) +
    plomo(M([-10, 140])[0], M([0, 140])[1], 66 * 1.05, 14) +
    `<line x1="${f1(rx - 8)}" y1="${f1(mam[1])}" x2="${f1(rx + rw + 8)}" y2="${f1(mam[1])}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    cross(...mam) +
    note(mam[0] + 12, mam[1] + 2, 420, 60, ["RC ⟂ en la mitad de los campos", "pulmonares, a la altura de la", "línea mamilar"], RED) +
    note(M([58, 0])[0], M([58, 0])[1], 420, 130, ["Piezas laterales sostienen", "brazos y cabeza"], "#5f7fae") +
    note(M([56, 147])[0], M([56, 147])[1], 420, 178, ["Protección plomada justo", "por encima de la cresta ilíaca"], "#4d5462") +
    txt(420, 222, "Misma posición que la PA: cambiar el RI", 11.5, INK) + txt(420, 236, "y girar 90° asiento y piezas laterales", 11.5, INK) +
    txt(420, 258, "Cambiar el marcador a lateral izquierda", 11, MUTE) +
    txt(420, 280, "RI 18 × 24 o 24 × 30 cm vertical", 11, INK) + txt(420, 294, "DFRI 180 cm · sin parrilla", 11, RED) +
    txt(420, 308, "Inspiración completa · colimación estrecha", 11, MUTE)
  );
};

// ---------------------------------------------------------------------
// ESTERNÓN
// ---------------------------------------------------------------------
I["esternon-oad"] = () => {
  const A = panelSup({ x0: 0, w: 380, th: -17.5, angLabel: "15-20°", rc: [0, 30], angPos: [205, 224] });
  const N = afin(618, 116, 0.72);
  const pc = N([-12, (27 + 114) / 2]);
  const [rx, ry, rw, rh] = rectL(N, -66, -6, 42, 140);
  const [cx1, cy1, cw, ch] = rectL(N, -32, 18, 8, 122);
  return svg(
    view("1 · OAD · vista superior (desde la cabeza)") + A.svg +
    note(A.bx + 4, 66, A.bx + 18, 56, ["RC ⟂ al esternón"], RED) +
    lab(...A.v.T([0, 30]), A.bx + 70, 168, "esternón") +
    txt(18, 292, "Rotado 15-20°, lado derecho hacia el RI", 11.5, INK, "start", 700) +
    txt(18, 306, "Tórax delgado: un poco más de oblicuidad", 11, MUTE) +
    txt(18, 320, "De pie (preferido) o semiprono", 11, MUTE) +
    panelSep(380, "2 · Centrado · desde el tubo (espalda)") +
    riTop(rx, ry, rw, rh) +
    frente(N, { brazos: "abajo", espalda: true }) + huesosFrente(N, { espalda: true, escapulas: "normal", esternonT: true, pulmones: false }) +
    coll(cx1, cy1, cw, ch) + cross(...pc) +
    side(...N([-62, 200]), "I") + side(...N([62, 200]), "D") +
    note(pc[0] - 12, pc[1], 398, 140, ["RC ⟂ en la parte media", "del esternón, 2,5 cm a la", "izquierda de la línea media"], RED) +
    note(...N([-5, 112]), 398, 214, ["a mitad entre escotadura", "yugular y xifoides"], BLUE) +
    lineas(398, 262, ["RI 24 × 30 cm vertical", "DFRI 100 cm", "Respiración ortostática", "o apnea"], 11, MUTE, 14)
  );
};

I["esternon-lateral"] = () => {
  const M = afinP(210, 70, 1.05);
  const c = M(PEST), j = M(PJ);
  const [rx, ry, rw, rh] = rectL(M, 404, 127, 516, 267);
  const [cx1, cy1, cw, ch] = rectL(M, 452, 132, 500, 238);
  return svg(
    view("Vista desde el tubo · de pie, de costado al RI") +
    riTop(rx, ry, rw, rh) +
    `<clipPath id="cvE"><rect x="0" y="28" width="760" height="290"/></clipPath><g clip-path="url(#cvE)">` +
    perfil(M, { brazos: "atras" }) + huesosPerfil(M, { pulmones: false }) + `</g>` +
    coll(cx1, cy1, cw, ch) +
    dot(...j) + `<line x1="${f1(j[0] - 70)}" y1="${f1(ry)}" x2="${f1(j[0] - 70)}" y2="${f1(j[1])}" stroke="${BLUE}" stroke-width="1.3"/>` +
    `<line x1="${f1(j[0] - 76)}" y1="${f1(j[1])}" x2="${f1(j[0])}" y2="${f1(j[1])}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    txt(j[0] - 76, (ry + j[1]) / 2 + 4, "4 cm", 11, BLUE, "end", 700) +
    cross(...c) +
    note(c[0] + 12, c[1] + 4, 470, 60, ["RC ⟂ a la parte media del esternón"], RED) +
    note(j[0] + 4, j[1] - 4, 470, 100, ["Borde superior del RI 4 cm", "por encima de la escotadura yugular"], BLUE) +
    note(...M([434, 240]), 470, 150, ["Hombros llevados hacia atrás", "(o brazos sobre la cabeza)"]) +
    txt(470, 196, "Esternón alineado con el RC y la", 11.5, INK) + txt(470, 210, "línea media del Bucky", 11.5, INK) +
    txt(470, 236, "Colimar largo y estrecho", 11, AMB) +
    txt(470, 258, "RI 24 × 30 o 35 × 35 cm vertical", 11, INK) +
    txt(470, 272, "DFRI 150-180 cm (mín. 100 cm)", 11, RED, "start", 700) +
    txt(470, 288, "Inspiración completa · parrilla", 11, MUTE) +
    txt(470, 304, "También sentado o en decúbito lateral; trauma", 10.5, MUTE) + txt(470, 318, "grave: supino con RC horizontal", 10.5, MUTE)
  );
};

// ---------------------------------------------------------------------
// ESTERNOCLAVICULARES
// ---------------------------------------------------------------------
function ecEspalda(M, rcX, clipId, x0, x1) {
  const rc = M([rcX, 30]), c7 = M([0, -4]);
  const [rx, ry, rw, rh] = rectL(M, -50 + rcX, -8, 50 + rcX, 68);
  const [cx1, cy1, cw, ch] = rectL(M, -34 + rcX, 6, 34 + rcX, 54);
  return {
    rc, c7,
    svg: riTop(rx, ry, rw, rh) +
      `<clipPath id="${clipId}"><rect x="${x0}" y="28" width="${x1 - x0}" height="290"/></clipPath><g clip-path="url(#${clipId})">` +
      frente(M, { brazos: "abajo", espalda: true }) + huesosFrente(M, { espalda: true, escapulas: "normal", esternonT: true, pulmones: false, nCost: 6 }) + `</g>` +
      coll(cx1, cy1, cw, ch) + dot(...c7) + cross(...rc),
  };
}
I["esternoclaviculares-pa"] = () => {
  const M = afin(240, 150, 1.3);
  const e = ecEspalda(M, 0, "cvC", 0, 760);
  const mx = M([-40, 0])[0];
  return svg(
    view("Vista desde el tubo · PA (de pie, de espaldas)") + e.svg +
    medida(mx, e.c7[1] + 2, mx, e.rc[1] - 2) + `<line x1="${f1(mx - 4)}" y1="${f1(e.c7[1])}" x2="${f1(e.c7[0])}" y2="${f1(e.c7[1])}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 2"/>` +
    `<line x1="${f1(mx - 4)}" y1="${f1(e.rc[1])}" x2="${f1(e.rc[0] - 12)}" y2="${f1(e.rc[1])}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 2"/>` +
    txt(mx - 6, (e.c7[1] + e.rc[1]) / 2 + 4, "7 cm", 11, BLUE, "end", 700) +
    note(e.c7[0] + 2, e.c7[1] - 4, 420, 50, ["Vértebra prominente"], BLUE) +
    note(e.rc[0] + 12, e.rc[1] - 2, 420, 92, ["RC ⟂ en T2-T3, sobre el PMS:", "≈7 cm bajo la vértebra prominente", "(3 cm bajo la escotadura yugular)"], RED) +
    lab(...M([9, 29]), 420, 168, "articulaciones EC (por transparencia)") +
    side(...M([-74, 110]), "I") + side(...M([74, 110]), "D") +
    txt(420, 200, "Cabeza girada hacia un lado,", 12, INK, "start", 700) + txt(420, 216, "sin rotar los hombros", 12, INK) +
    txt(420, 240, "De pie o en decúbito prono", 11.5, MUTE) +
    txt(420, 264, "RI 18 × 24 cm horizontal · parrilla", 11, INK) + txt(420, 278, "DFRI 100 cm", 11, RED, "start", 700) +
    txt(420, 294, "Apnea en espiración", 11, MUTE) + txt(420, 310, "Colimar a la zona de las EC", 11, AMB)
  );
};

I["esternoclaviculares-oblicua"] = () => {
  const A = panelSup({ x0: 0, w: 380, th: -12.5, angLabel: "10-15°", beamX: null, rc: [16, -38] });
  const psm1 = A.v.T([0, -60]), psm2 = A.v.T([0, 50]);
  const N = afin(616, 150, 0.9);
  const e = ecEspalda(N, -24, "cvD", 381, 760);
  return svg(
    view("1 · OAD · vista superior (desde la cabeza)") + A.svg +
    `<line x1="${f1(psm1[0])}" y1="${f1(psm1[1])}" x2="${f1(psm2[0])}" y2="${f1(psm2[1])}" stroke="${BLUE}" stroke-width="1.3" stroke-dasharray="4 3"/>` +
    txt(f1(psm1[0]) - 6, f1(psm1[1]) - 4, "PMS", 11, BLUE, "end", 700) +
    note(A.bx + 4, 64, A.bx + 18, 54, ["RC ⟂, 2,5-5 cm lateral al PMS,", "hacia el lado elevado"], RED) +
    txt(18, 290, "Desde la PA, rotar el tórax 10-15°", 11.5, INK, "start", 700) +
    txt(18, 305, "OAD: muestra la EC derecha · OAI: la izquierda", 11, MUTE) +
    txt(18, 320, "5-10°: mejor la parte superior de la articulación", 11, MUTE) +
    panelSep(380, "2 · Centrado · desde el tubo") + e.svg +
    side(...N([-56, 64]), "I") + side(...N([56, 64]), "D") +
    note(e.rc[0] - 12, e.rc[1], 398, 56, ["RC a T2-T3,", "≈7 cm bajo la", "vért. prominente"], RED) +
    note(e.c7[0] + 2, e.c7[1] - 4, 668, 54, ["Vértebra", "prominente"], BLUE) +
    lineas(398, 262, ["RI 18 × 24 cm", "horizontal", "DFRI 100 cm", "Apnea en espiración"], 11, MUTE, 14)
  );
};

// ---------------------------------------------------------------------
// COSTILLAS
// ---------------------------------------------------------------------
I["costillas-ap-encima-diafragma"] = () => {
  const M = afin(232, 122, 0.8);
  const t7 = M(T7), j = M(J);
  const [rx, ry, rw, rh] = rectL(M, -118, -12, 118, 180);
  const hom = M([0, 8]);
  return svg(
    view("Vista desde el tubo · AP de pie (de frente)") +
    riTop(rx, ry, rw, rh) +
    frente(M, { brazos: "abajo" }) + huesosFrente(M) +
    side(...M([-56, -30]), "D") + side(...M([56, -30]), "I") +
    dot(...j) + cross(...t7) +
    `<line x1="${f1(rx + rw + 4)}" y1="${f1(ry)}" x2="${f1(rx + rw + 4)}" y2="${f1(hom[1])}" stroke="${BLUE}" stroke-width="1.3"/>` +
    `<line x1="${f1(M([70, 8])[0])}" y1="${f1(hom[1])}" x2="${f1(rx + rw + 8)}" y2="${f1(hom[1])}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    txt(rx + rw + 10, (ry + hom[1]) / 2 + 4, "4 cm", 11, BLUE, "start", 700) +
    note(t7[0] + 12, t7[1] + 4, 420, 118, ["RC ⟂ al centro del RI, 8-10 cm", "bajo la escotadura yugular (T7)"], RED) +
    note(j[0] + 4, j[1] - 4, 420, 166, ["escotadura yugular"], BLUE) +
    txt(420, 56, "Borde superior del RI ≈4 cm", 11.5, BLUE, "start", 700) + txt(420, 70, "por encima de los hombros", 11.5, BLUE) +
    txt(420, 190, "Hombros hacia adelante, sin rotación;", 11.5, INK) + txt(420, 204, "PMS en la línea media del RI", 11.5, INK) +
    txt(420, 224, "Inspiración (diafragma abajo)", 11.5, INK, "start", 700) +
    txt(420, 240, "RI 35 × 43 cm horizontal · parrilla", 11, INK) +
    txt(420, 254, "DFRI 180 cm de pie · 100-120 cm decúbito", 11, RED) +
    txt(420, 278, "AP: costillas posteriores", 11, MUTE) + txt(420, 292, "PA: costillas anteriores", 11, MUTE) +
    txt(420, 312, "De pie (preferido) o en decúbito", 11, MUTE)
  );
};

I["costillas-ap-debajo-diafragma"] = () => {
  const M = afin(232, 96, 0.84);
  const rc = M([0, 133]), xi = M([0, 114]), cm = M([46, 146]), cr = M([62, 200]);
  const [rx, ry, rw, rh] = rectL(M, -82, 67, 82, 199);
  return svg(
    view("Vista desde el tubo · AP de pie (de frente)") +
    riTop(rx, ry, rw, rh) +
    `<clipPath id="cvF"><rect x="0" y="28" width="760" height="290"/></clipPath><g clip-path="url(#cvF)">` +
    frente(M, { brazos: "abajo" }) + huesosFrente(M, { pelvis: true }) + `</g>` +
    side(...M([-56, -30]), "D") + side(...M([56, -30]), "I") +
    dot(...xi) + dot(...cm) + cross(...rc) +
    `<line x1="${f1(rx - 10)}" y1="${f1(ry + rh)}" x2="${f1(rx + rw + 10)}" y2="${f1(ry + rh)}" stroke="${BLUE}" stroke-width="1.3" stroke-dasharray="5 4"/>` +
    note(rc[0] + 12, rc[1] + 4, 420, 80, ["RC ⟂, centrado en el RI, a mitad", "entre la punta del xifoides y el", "borde costal inferior"], RED) +
    note(xi[0] - 4, xi[1] - 2, 60, 110, ["xifoides"], BLUE, "end") +
    note(cm[0] + 4, cm[1], 420, 158, ["borde costal inferior"], BLUE) +
    note(rx + rw + 10, ry + rh, 420, 194, ["Borde inferior del RI", "en la cresta ilíaca"], BLUE) +
    lab(...M([-62, 200]), 60, 300, "cresta ilíaca", "end") +
    txt(420, 246, "Espiración (diafragma arriba)", 11.5, INK, "start", 700) +
    txt(420, 268, "Incluir ambos bordes laterales", 11, MUTE) +
    txt(420, 284, "RI 35 × 43 cm horizontal · parrilla", 11, INK) +
    txt(420, 298, "DFRI 180 cm de pie · 100 cm decúbito", 11, RED) +
    txt(420, 314, "Proteger tejidos radiosensibles", 11, MUTE)
  );
};

I["costillas-axilares-oad-superiores"] = () => {
  const A = panelSup({ x0: 0, w: 400, th: -45, angLabel: "45°" });
  return svg(
    view("Vista superior (desde la cabeza) · OAD") + A.svg +
    note(A.bx + 4, 66, A.bx + 18, 56, ["RC ⟂, centrado en el RI"], RED) +
    panelSep(400, "Posición y centrado") +
    txt(418, 60, "Oblicua anterior derecha a 45°:", 12.5, INK, "start", 700) +
    txt(418, 76, "parte anterior derecha contra el RI", 12, INK) +
    txt(418, 104, "Rotar la columna para alejarla", 12, INK) + txt(418, 120, "de la zona de interés", 12, INK) +
    txt(418, 148, "Centrar en el RI la región afectada", 12, INK, "start", 700) +
    txt(418, 176, "RC a 18-20 cm por debajo de la", 12, RED, "start", 700) + txt(418, 192, "vértebra prominente (T7)", 12, RED, "start", 700) +
    txt(418, 220, "Inspiración (por encima del diafragma)", 11.5, MUTE) +
    txt(418, 244, "RI 35 × 43 o 35 × 35 cm vertical · parrilla", 11, INK) +
    txt(418, 258, "DFRI 180 cm de pie · 100 cm en decúbito", 11, RED) +
    txt(418, 282, "De pie (preferido) o en decúbito", 11, MUTE) +
    txt(18, 300, "Algunas rutinas: oblicua unilateral del lado afectado,", 11, MUTE) + txt(18, 314, "con RI más chico en vertical", 11, MUTE)
  );
};

I["costillas-axilares-opi-inferiores"] = () => {
  const A = panelSup({ x0: 0, w: 400, th: 135, angLabel: "45°" });
  return svg(
    view("Vista superior (desde la cabeza) · OPI") + A.svg +
    note(A.bx + 4, 66, A.bx + 18, 56, ["RC ⟂, centrado en el RI"], RED) +
    panelSep(400, "Posición y centrado") +
    txt(418, 60, "Oblicua posterior izquierda:", 12.5, INK, "start", 700) +
    txt(418, 76, "rotar 45° desde la AP, espalda", 12, INK) + txt(418, 92, "izquierda contra el RI", 12, INK) +
    txt(418, 120, "Brazo cercano al RI arriba, sobre", 12, INK) + txt(418, 136, "la cabeza; la otra mano en la", 12, INK) + txt(418, 152, "cintura, brazo separado del cuerpo", 12, INK) +
    txt(418, 180, "RC a mitad entre la apófisis xifoides", 12, RED, "start", 700) + txt(418, 196, "y el borde costal inferior", 12, RED, "start", 700) +
    txt(418, 220, "Espiración (por debajo del diafragma)", 11.5, MUTE) +
    txt(418, 238, "Borde superior del RI ≈4 cm sobre los hombros", 11, MUTE) +
    txt(418, 258, "RI 35 × 43 cm vertical o 35 × 35 cm · parrilla", 11, INK) +
    txt(418, 272, "DFRI 180 cm de pie · 100 cm en decúbito", 11, RED) +
    txt(418, 294, "Se prefiere en decúbito (aquí, de pie)", 11, MUTE)
  );
};

// ---------------- fichas con versiones: un esquema por versión ----------------
const colV = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");
const gV = (tr, inner) => `<g transform="${tr}">${inner}</g>`;

const oblAnt = (th, nombre, hombro, extra) => {
  const A = panelSup({ x0: 20, w: 380, th, angLabel: "45°" });
  return svg(
    view(`${nombre} · vista superior (desde la cabeza)`) + A.svg +
    note(A.bx + 4, 70, A.bx + 18, 62, ["RC ⟂ al RI en T7"], RED) +
    colV(440, 70, [["De pie, rotado 45°", INK, 700], [`Hombro ${hombro} (anterior) contra el RI`, INK, 700]]) +
    colV(440, 120, [["Brazo lejano arriba, sobre la cabeza", INK], ["o el soporte; el cercano abajo, en la cadera", INK], ["Mentón arriba", INK]]) +
    (extra ? colV(440, 180, [[extra, MUTE]]) : "") +
    colV(440, 260, [["DFRI 180 cm · parrilla · RI 35 × 43 cm vertical", MUTE, 400, 11], ["2.ª inspiración", MUTE, 400, 11]])
  );
};
I["torax-oblicua-anterior--v1"] = () => oblAnt(-45, "OAD", "derecho");
I["torax-oblicua-anterior--v2"] = () => oblAnt(45, "OAI", "izquierdo", "Estudios cardíacos: OAI a 60°");

const viaTxt = (lat) =>
  colV(470, 80, lat ? [["Sentado o de pie", INK, 700], ["Brazos abajo, mentón levemente elevado", INK], ["Hombros abajo y hacia atrás", INK, 700]]
    : [["Sentado o de pie", INK, 700], ["Brazos abajo, mentón levemente elevado", INK]]) +
  colV(470, 150, [["Vía aérea centrada en el RC", INK], ["Centro del RI a la altura del RC", INK]]) +
  colV(470, 250, [["RI 24 × 30 cm vertical · DFRI 180 cm · parrilla", MUTE, 400, 11], ["Inspiración lenta y profunda", MUTE, 400, 11]]);
I["via-aerea-ap-lateral--v1"] = () => {
  const M = afin(250, 152, 1.2);
  const ec = M([0, -14]);
  const [rx, ry, rw, rh] = rectL(M, -60, -84, 60, 64);
  return svg(view("AP · desde el tubo") +
    riTop(rx, ry, rw, rh) +
    `<clipPath id="cvA"><rect x="0" y="28" width="378" height="290"/></clipPath><g clip-path="url(#cvA)">` +
    frente(M, { brazos: "abajo" }) + huesosFrente(M, { pulmones: false, nCost: 3 }) +
    `<path d="${mapD(M, "M-4,-34 L4,-34 L4,40 L-4,40 Z")}" fill="#cfe0f2" stroke="#7f97bd" stroke-width="1.1" opacity=".9"/>` + `</g>` +
    dot(...M([0, -26])) + dot(...M(J)) +
    cross(...ec) +
    note(ec[0] - 12, ec[1], 24, 56, ["RC ⟂ en C6-C7", "punto medio entre", "prominencia laríngea", "y escotadura yugular"], RED) +
    note(...M([3, -27]), 300, 52, ["prominencia", "laríngea"], BLUE) +
    note(...M([-2, 27]), 24, 148, ["escotadura yugular"], BLUE) +
    note(...M([3, 8]), 300, 112, ["tráquea"], "#5f7fae") + viaTxt(false));
};
I["via-aerea-ap-lateral--v2"] = () => {
  const dx = -330, N = afinP(560, 168, 1.35);
  const c = N([447, 130]), C = [c[0] + dx, c[1]];
  const [r2x, r2y, r2w, r2h] = rectL(N, 395, 60, 505, 196);
  const pl = N([454, 116]), ey = N([461, 142]);
  return svg(view("Lateral · desde el tubo") +
    gV(`translate(${dx} 0)`, riTop(r2x, r2y, r2w, r2h) +
      `<clipPath id="cvB"><rect x="381" y="28" width="379" height="290"/></clipPath><g clip-path="url(#cvB)">` +
      perfil(N, { brazos: "atras" }) + huesosPerfil(N, { pulmones: false, traquea: true, esternon: false }) + `</g>` +
      dot(...N([453, 118])) + dot(...N(PJ))) +
    cross(...C) +
    note(C[0] - 12, C[1] + 4, 30, 150, ["RC ⟂ en C6-C7", "punto medio entre", "prominencia laríngea", "y escotadura yugular"], RED) +
    note(pl[0] + dx, pl[1], 310, 64, ["prominencia", "laríngea"], BLUE) +
    note(ey[0] + dx, ey[1], 330, 160, ["escotadura", "yugular"], BLUE) + viaTxt(true));
};

module.exports = I;
