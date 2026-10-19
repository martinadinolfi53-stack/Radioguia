// Esquemas de abdomen, estudios contrastados (esofagograma, estómago, intestino, enema opaco, urografía, cistografía),
// portátiles y arco en C. Estilo de referencia-tecnicas1-*.cjs: persona = contorno continuo color piel,
// huesos (y órganos con contraste) "por transparencia". Solo datos de cada ficha; unidades métricas.
const E = require("./estilo.cjs");
const {
  SK, SKO, RED, BLUE, AMB, INK, MUTE, BONE, BONEO,
  table, wall, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, side,
  piel, linea, hueso, etiquetaHueso, mk, cabezaPerfil, cabezaFrente,
} = E;

// ---------- helpers generales ----------
const f1 = (n) => +(+n).toFixed(1);
const R = (d) => (d * Math.PI) / 180;
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
const poly = (pts) => "M" + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" L") + " Z";
const lab = (px, py, tx, ty, t, anchor = "start", color = BONEO) =>
  `<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(anchor === "start" ? tx - 3 : tx + 3)}" y2="${f1(ty - 4)}" stroke="${color}" stroke-width=".8"/>` +
  `<text x="${f1(tx)}" y="${f1(ty)}" font-size="10.5" fill="${color}" text-anchor="${anchor}" font-style="italic">${t}</text>`;
const sep = (x, title) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>` +
  `<text x="${x + 12}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
const clipR = (id, x, y, w, h, inner) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
const lineas = (x, y, arr, size = 11.5, color = MUTE, dy = 15) => arr.map((t, i) => txt(x, y + i * dy, t, size, color)).join("");
const dash = (x1, y1, x2, y2, c = RED) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
const ORG = "#dce6f3", ORGO = "#4f73a3";
const organo = (d) => `<path d="${d}" fill="${ORG}" stroke="${ORGO}" stroke-width="1.3" stroke-linejoin="round" opacity=".95"/>`;
// tubo con contraste: banda con contorno
const banda = (d, w) => `<path d="${d}" fill="none" stroke="${ORGO}" stroke-width="${f1(w + 2.4)}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${ORG}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const gris = (x, y, w, h, rx = 4, extra = "") => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="#d7dbe3" stroke="#8a8f9c" ${extra}/>`;
const riBorde = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10 3" opacity=".75"/>`;
// RC "chico" (segunda opción de centrado)
const cruzChica = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="none" stroke="${RED}" stroke-width="2"/><line x1="${f1(x - 9)}" y1="${f1(y)}" x2="${f1(x + 9)}" y2="${f1(y)}" stroke="${RED}" stroke-width="1.3"/><line x1="${f1(x)}" y1="${f1(y - 9)}" x2="${f1(x)}" y2="${f1(y + 9)}" stroke="${RED}" stroke-width="1.3"/>`;

// =====================================================================================
// CUERPO VISTO DE FRENTE / DESDE EL TUBO (coordenadas locales en cm aprox.: u = desde el vértice hacia los pies,
// v = hacia el lado IZQUIERDO del paciente). Una pose = ejes U, V en pantalla.
// =====================================================================================
const POSES = {
  supino: { U: [1, 0], V: [0, -1] }, // cabeza a la izquierda, visto desde arriba: lado derecho abajo
  prono: { U: [1, 0], V: [0, 1], espalda: true }, // visto desde arriba (espalda): lado derecho arriba
  pieAP: { U: [0, 1], V: [1, 0] }, // de pie, visto desde el tubo por delante
  latIzq: { U: [-1, 0], V: [0, 1] }, // decúbito lateral izquierdo visto de frente (cabeza a la derecha)
};
const NECK = [[23.5, 5.2]];
const BRAZO = {
  costado: [[25.5, 11], [28.5, 18.5], [32, 21.5], [45, 23], [60, 23.5], [75, 24], [82, 24.3], [87, 24.6], [92, 24], [95, 22], [93.5, 19.8], [88, 19.6], [80, 19.5], [66, 19.2], [50, 18.8], [40, 18], [35.5, 16.6]],
  arriba: [[21, 9.8], [12, 11], [0, 11], [-10, 10.6], [-16, 10.6], [-21, 11.6], [-22.5, 14], [-21, 16.6], [-16, 17.6], [-8, 17.6], [4, 18.2], [16, 19.2], [26, 20.6], [31, 19.5], [35.5, 16.8]],
  arribaAncho: [[21, 11], [12, 13.4], [0, 13.6], [-10, 13.2], [-16, 13.2], [-21, 14.2], [-22.5, 16.6], [-21, 19.2], [-16, 20.2], [-8, 20.2], [4, 20.6], [16, 21], [26, 21.4], [31, 19.8], [35.5, 16.8]],
  codo: [[25.5, 11], [28.5, 18.5], [32, 21.5], [42, 22.8], [52, 23], [56.5, 22], [57.5, 19.5], [54, 18.6], [46, 18.4], [40, 17.8], [35.5, 16.6]],
};
const TRONCO = [[42, 16.2], [52, 14.8], [60, 14.6], [66, 15.8], [74, 17.2], [82, 17.8]];
const PIERNA = [[90, 16.8], [105, 15], [120, 13.6], [126, 13.2], [140, 12], [155, 11.2], [160, 11], [164, 12], [169, 12.2], [172, 10.5], [172, 7.5], [168, 5.8], [160, 5.6], [140, 4.6], [126, 3.8], [110, 3], [96, 1.6]];
const PIERNA_ELEV = [[87, 16.6], [90, 12], [91, 5], [92, 1.6]];
const CROTCH = [89, 0];

// nuca vista desde atrás (paciente prono)
function nuca(cx, cy, r, rot) {
  return `<g transform="rotate(${f1(rot)} ${f1(cx)} ${f1(cy)})">` +
    `<ellipse cx="${f1(cx - r * 0.98)}" cy="${f1(cy)}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.28)}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${f1(cx + r * 0.98)}" cy="${f1(cy)}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.28)}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(r * 0.92)}" ry="${f1(r * 1.12)}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
    `<path d="M${f1(cx - r * 0.85)},${f1(cy - r * 0.2)} Q${f1(cx)},${f1(cy - r * 1.5)} ${f1(cx + r * 0.85)},${f1(cy - r * 0.2)}" fill="none" stroke="${SKO}" stroke-width="1.2"/>` +
    `<path d="M${f1(cx - r * 0.1)},${f1(cy - r * 0.55)} c${f1(r * 0.25)},${f1(-r * 0.1)} ${f1(r * 0.3)},${f1(r * 0.2)} ${f1(r * 0.05)},${f1(r * 0.25)}" fill="none" stroke="${SKO}" stroke-width="1.1"/></g>`;
}

// topView: devuelve { T, s, piel (cuerpo + cabeza) }
function topView({ x, y, s, pose = "supino", sq = 1, brazoD = "costado", brazoI = "costado", piernaI = "ext", piernaD = "ext", cabezaK = 1 }) {
  const P = POSES[pose];
  const T = (u, v) => [x + s * (u * P.U[0] + v * sq * P.V[0]), y + s * (u * P.U[1] + v * sq * P.V[1])];
  const lado = (brazo, pierna) => [...NECK, ...BRAZO[brazo], ...TRONCO, ...(pierna === "elevada" ? PIERNA_ELEV : PIERNA)];
  const L = lado(brazoI, piernaI), D = lado(brazoD, piernaD);
  const pts = [...L.map(([u, w]) => T(u, w)), T(...CROTCH), ...D.slice().reverse().map(([u, w]) => T(u, -w))];
  const r = 8.6 * s * cabezaK;
  const [hx, hy] = T(20 - 9.63 * cabezaK, 0);
  const rot = (Math.atan2(P.U[1], P.U[0]) * 180) / Math.PI - 90;
  const cab = P.espalda ? nuca(hx, hy, r, rot) : cabezaFrente(f1(hx), f1(hy), f1(r), f1(rot));
  return { T, s, P, piel: piel(suave(pts, true, 0.9)) + cab };
}
const at = (V, u, v) => V.T(u, v);

// ---------- huesos (vista frontal) ----------
const TU = (i) => 27 + (i - 1) * 1.75; // T1..T12
const LU = (j) => 48.8 + (j - 1) * 3.6; // L1..L5
function vertF(T, u, hu, hv) { return hueso(poly([T(u - hu, -hv), T(u - hu, hv), T(u + hu, hv), T(u + hu, -hv)])); }
function columnaF(T, { dorsal = true, lumbar = true } = {}) {
  let s = "";
  if (dorsal) for (let i = 1; i <= 12; i++) s += vertF(T, TU(i), 0.66, 1.7 + i * 0.05);
  if (lumbar) for (let j = 1; j <= 5; j++) s += vertF(T, LU(j), 1.45, 2.5 + j * 0.1);
  return s;
}
const HEMI = [[65.5, 4.2], [62.5, 7.2], [61, 10.8], [61.8, 14], [64, 15.6], [67, 15.8], [69.5, 14.8], [71.5, 13.6], [74, 13.4], [76.5, 13.6], [79, 14], [82, 13.2], [84.5, 11.6], [86.5, 9.2], [87, 6], [86.5, 2.6], [85.6, 0.8], [83.6, 0.8], [82.6, 3], [81, 6], [79, 7.6], [77, 7.4], [74, 5.6], [70.5, 4.4]];
const SACRO = [[65.5, -4.4], [65.5, 4.4], [70, 4.6], [74, 3.4], [77.5, 1.8], [79.5, 0], [77.5, -1.8], [74, -3.4], [70, -4.6]];
const FEMUR = [[100, 12.4], [90, 13.2], [83, 12.6], [80.4, 10.6], [78.6, 12.8], [79.2, 16.4], [81, 17.4], [84, 17.2], [90, 16.4], [100, 15.6]];
const ellF = (T, cu, cv, ru, rv, n = 20) => poly(Array.from({ length: n }, (_, k) => T(cu + ru * Math.cos((2 * Math.PI * k) / n), cv + rv * Math.sin((2 * Math.PI * k) / n))));
function pelvisF(T, { femur = true } = {}) {
  let s = hueso(suave(SACRO.map(([u, v]) => T(u, v)), true, 0.6));
  for (const g of [1, -1]) s += hueso(suave(HEMI.map(([u, v]) => T(u, g * v)), true, 0.8));
  for (const g of [1, -1]) s += `<path d="${ellF(T, 84, g * 5.6, 1.8, 2.3)}" fill="${SK}" stroke="${BONEO}" stroke-width="1.1"/>`;
  if (femur) for (const g of [1, -1]) s += hueso(suave(FEMUR.map(([u, v]) => T(u, g * v)), true, 0.7)) + hueso(ellF(T, 78.3, g * 10.8, 2.7, 2.7));
  return s;
}
function costillasF(T) {
  let s = hueso(poly([T(28.4, -1.1), T(28.4, 1.1), T(45.5, 1), T(46.5, 0), T(45.5, -1)]));
  for (const g of [1, -1]) {
    const cage = [[28.5, 3], [29.2, 9], [31, 14], [35, 16.2], [41, 16.3], [47, 15.6], [51, 14.3], [49.5, 11], [47.5, 7.5], [45.8, 3.5], [45.5, 1.2]];
    s += `<path d="${suave(cage.map(([u, v]) => T(u, g * v)), false, 0.8)}" fill="none" stroke="${BONEO}" stroke-width="1.3"/>`;
    s += `<path d="${suave([[28.2, 1.8], [27.4, 7], [27.8, 12], [27, 16.5]].map(([u, v]) => T(u, g * v)))}" fill="none" stroke="${BONEO}" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}
// ---------- órganos con contraste (vista frontal) ----------
const ESOF = [[21, 0.4], [30, 0.6], [38, 1.4], [43.5, 3.6], [45.6, 6.2]];
function esofagoF(T, s) { return banda(suave(ESOF.map(([u, v]) => T(u, v))), 1.7 * s); }
const ESTOM = [[44.5, 5.4], [42, 6.2], [40.4, 8.6], [41, 11.6], [44, 13], [49, 12.8], [54, 11.6], [57.6, 8.8], [58.4, 5], [57.2, 1], [55, -2], [53.4, -3.4], [52.2, -2], [52.8, 0.6], [51, 3.6], [48.4, 6], [46.2, 6.4]];
function estomagoF(T, s) {
  return organo(suave(ESTOM.map(([u, v]) => T(u, v)), true, 0.8)) +
    banda(suave([[53.4, -3.4], [52.4, -5.8], [55, -7.2], [59, -6.8], [61.4, -4.4], [60.8, -1.2]].map(([u, v]) => T(u, v))), 1.2 * s);
}
const COLON = [[86, 0], [80, 0.3], [76, 2], [74, 6], [70, 8.6], [66, 12], [60, 13.2], [52, 13], [46.5, 12.6], [44.6, 10.6], [46.5, 7], [53, 3], [55, -3], [51, -8.4], [47.5, -11.2], [50, -12.8], [58, -13], [65, -12.6], [69.5, -11]];
function colonF(T, s) { return banda(suave(COLON.map(([u, v]) => T(u, v)), false, 0.9), 2.8 * s) + organo(ellF(T, 70.5, -11, 2.2, 2.4)); }
function delgadoF(T, s) {
  const pts = [];
  const filas = [57, 60.5, 64, 67.5, 71];
  filas.forEach((u, i) => { const xs = i % 2 ? [8, 4, 0, -4, -8] : [-8, -4, 0, 4, 8]; xs.forEach((v, k) => pts.push([u + (k % 2 ? 1.1 : -1.1), v])); });
  return banda(suave(pts.map(([u, v]) => T(u, v)), false, 1), 1.5 * s);
}
function urinarioF(T, s, { rinon = true, ureter = true, vejiga = true } = {}) {
  let o = "";
  const rin = (cu, cv, g) => {
    const pts = [[-3, 0], [-2.6, -1.4], [-1, -2.1], [1, -2.1], [2.6, -1.4], [3, 0], [2.4, 1.3], [0.9, 1.5], [0, 0.9], [-0.9, 1.5], [-2.4, 1.3]];
    const a = R(g * 12);
    return organo(suave(pts.map(([du, dv]) => { const dvv = -g * dv; return T(cu + du * Math.cos(a) - dvv * Math.sin(a), cv + du * Math.sin(a) + dvv * Math.cos(a)); }), true, 0.8));
  };
  if (rinon) o += rin(52, 7.2, 1) + rin(53.5, -7.2, -1);
  if (ureter) for (const g of [1, -1]) o += `<path d="${suave([[g > 0 ? 53 : 54.5, g * 5.6], [60, g * 4.3], [68, g * 4.6], [76, g * 4.2], [80.5, g * 2]].map(([u, v]) => T(u, v)))}" fill="none" stroke="${ORGO}" stroke-width="1.6"/>`;
  if (vejiga) o += organo(ellF(T, 81.6, 0, 2.4, 3.4));
  return o;
}

// =====================================================================================
// CORTE TRANSVERSAL VISTO DESDE LOS PIES (rotación del tronco respecto de la mesa)
// =====================================================================================
// lx: hacia la izquierda del paciente, ly: hacia anterior. Supino: izquierda a la derecha del dibujo, anterior arriba.
function corte(o) {
  const { cx, base, s = 1, rot = 0, prono = false, abajo = null, haz = "v", angTxt, mesa = "Mesa", apoyo = false, centro = [0, 0], letras = true, riLado, tubeLen = 120, riTxt, mesaW } = o;
  const a = 46 * s, b = 30 * s;
  const sx = prono ? -1 : 1, sy = prono ? 1 : -1;
  const downX = abajo === "I" ? sx : abajo === "D" ? -sx : 1;
  const phi = R(downX * rot), c = Math.cos(phi), sn = Math.sin(phi);
  const L0 = (lx, ly) => { const X = sx * lx, Y = sy * ly; return [X * c - Y * sn, X * sn + Y * c]; };
  const elip = Array.from({ length: 40 }, (_, k) => { const t = (2 * Math.PI * k) / 40, st = Math.sin(t); return [a * Math.cos(t), b * st * (st < 0 ? 0.88 : 1)]; });
  const padH = apoyo ? 12 * s : 0;
  const maxY = Math.max(...elip.map(([lx, ly]) => L0(lx, ly)[1]));
  const oy = base - padH - maxY;
  const G = (lx, ly) => { const [x, y] = L0(lx, ly); return [cx + x, oy + y]; };
  const W = mesaW || a * 1.8;
  let out = `<rect x="${f1(cx - W)}" y="${f1(base)}" width="${f1(2 * W)}" height="10" fill="#cfd3dc"/>` + txt(cx - W + 4, base + 22, mesa, 10, MUTE);
  if (apoyo) out += gris(cx - a * 1.05, base - padH, a * 2.1, padH, 4);
  out += piel(suave(elip.map(([lx, ly]) => G(lx, ly)), true));
  // columna (cuerpo vertebral + espinosa)
  const vb = G(0, -0.5 * b), sp = G(0, -0.8 * b);
  out += `<line x1="${f1(vb[0])}" y1="${f1(vb[1])}" x2="${f1(sp[0])}" y2="${f1(sp[1])}" stroke="${BONEO}" stroke-width="${f1(3 * s)}" stroke-linecap="round"/>` +
    `<circle cx="${f1(vb[0])}" cy="${f1(vb[1])}" r="${f1(6.5 * s)}" fill="${BONE}" stroke="${BONEO}" stroke-width="1.3"/>`;
  const an = rot > 0 && rot < 90 ? G(0, 0.62 * b) : G(0.32 * a, 0.55 * b);
  out += txt(an[0], an[1] + 4, "ant.", 10, MUTE, "middle");
  if (letras) { const pi = G(0.6 * a, 0.3 * b), pd = G(-0.6 * a, 0.3 * b); out += txt(pi[0], pi[1] + 4.5, "I", 12.5, INK, "middle", 700) + txt(pd[0], pd[1] + 4.5, "D", 12.5, INK, "middle", 700); }
  // plano coronal y ángulo
  if (rot > 0 && rot < 90) {
    const p1 = G(-a * 1.25, 0), p2 = G(a * 1.25, 0);
    out += refline(p1[0], p1[1], p2[0], p2[1]);
    const ctr = G(0, 0), raised = G(abajo === "D" ? a : -a, 0);
    const vx = raised[0] - ctr[0], vy = raised[1] - ctr[1];
    const hd = Math.sign(vx) || 1, rr = a * 1.12;
    out += `<line x1="${f1(ctr[0])}" y1="${f1(ctr[1])}" x2="${f1(ctr[0] + hd * rr * 1.1)}" y2="${f1(ctr[1])}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>`;
    const ang = Math.atan2(vy, vx), a0 = hd > 0 ? 0 : Math.PI;
    const e = [ctr[0] + rr * Math.cos(ang), ctr[1] + rr * Math.sin(ang)], st = [ctr[0] + hd * rr, ctr[1]];
    const sweep = hd > 0 ? 0 : 1;
    out += `<path d="M${f1(st[0])},${f1(st[1])} A${f1(rr)},${f1(rr)} 0 0 ${sweep} ${f1(e[0])},${f1(e[1])}" fill="none" stroke="${BLUE}" stroke-width="1.6"/>`;
    const mid = (a0 + (hd > 0 ? ang : ang)) / 2;
    const mA = hd > 0 ? ang / 2 : (Math.PI + ang) / 2 + (ang < 0 ? Math.PI : 0) - Math.PI;
    const lx2 = ctr[0] + hd * (rr + 10), ly2 = ctr[1] - (rr * Math.sin(Math.abs(ang - a0) / 2)) - 4;
    if (angTxt) out += txt(lx2, ly2, angTxt, 12.5, BLUE, hd > 0 ? "start" : "end", 700);
  }
  // rayo
  const tgt = G(...centro);
  const minTop = (x) => Math.min(...elip.map(([lx, ly]) => G(lx, ly)).filter(([px]) => Math.abs(px - x) < 5 * s + 2).map(([, py]) => py));
  if (haz === "v") {
    const top = minTop(tgt[0]);
    out += `<rect x="${f1(cx - a * 1.3)}" y="${f1(base + 26)}" width="${f1(a * 2.6)}" height="7" fill="${INK}"/>` + (riTxt ? txt(cx + a * 1.3 + 6, base + 33, riTxt, 11, INK) : "");
    out += tube(tgt[0], top, 0, tubeLen) + dash(tgt[0], top + 6, tgt[0], base + 26);
  } else if (haz === "h-izq" || haz === "h-der") {
    // haz horizontal; RI del lado opuesto al tubo
    const xs = elip.map(([lx, ly]) => G(lx, ly)[0]), xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ys = elip.map(([lx, ly]) => G(lx, ly)[1]), ymin = Math.min(...ys);
    const ty = tgt[1];
    if (haz === "h-izq") { // haz viaja hacia la izquierda: tubo a la derecha
      out += `<rect x="${f1(xmin - 14)}" y="${f1(ymin - 16)}" width="7" height="${f1(base - ymin + 12)}" fill="${INK}"/>`;
      out += beam(xmax + 2, ty, 180, tubeLen, { ref: 180 }) + dash(xmax - 6, ty, xmin - 7, ty);
    } else {
      out += `<rect x="${f1(xmax + 7)}" y="${f1(ymin - 16)}" width="7" height="${f1(base - ymin + 12)}" fill="${INK}"/>`;
      out += beam(xmin - 2, ty, 0, tubeLen, { ref: 0 }) + dash(xmin + 6, ty, xmax + 7, ty);
    }
  }
  return { svg: out, G, a, b, oy };
}

// =====================================================================================
// VISTAS LATERALES (silueta aprobada de referencia-tecnicas1-columna.cjs)
// =====================================================================================
const NX = 105.28, NY = 252;
function escena(s, tx, ty) {
  const X = (x) => tx + s * (x - NX), Y = (y) => ty + s * (y - NY);
  const tp = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => `${f1(X(+a))},${f1(Y(+b))}`);
  return { s, X, Y, tp, cabeza: (o = {}) => cabezaPerfil(tx, ty, { s: 0.42 * s, ...o }) };
}
const CUELLO = "C176,226 180,212 196,200";
const PECHO = "C222,184 256,178 286,182";
const ABDOMEN = "C312,188 336,196 362,198 C380,199 396,198 412,198";
const PIERNAS_FLEX = "C440,180 470,158 494,142 C506,134 520,138 522,152 C540,190 562,222 576,234 C590,236 612,236 628,240 " +
  "C640,244 640,252 628,252 L578,252 C568,252 562,246 558,240 C546,222 528,196 512,178 C506,172 498,172 492,178 " +
  "C474,198 456,222 448,236 C442,248 434,252 420,252 Z";
const PIERNAS_EXT = "C440,200 480,206 520,212 C540,214 556,214 572,218 C610,224 640,226 660,228 C664,220 666,206 670,198 " +
  "C673,192 682,192 684,200 C686,214 688,232 688,246 C688,252 680,252 672,252 L420,252 Z";
const BRAZO_ADELANTE = "L226,160 C230,152 234,148 240,147 L292,134 C302,132 306,146 296,150 L248,162 C243,163 240,166 239,170 " +
  "L224,189 C244,182 262,179 286,182";
const BRAZO_COSTADO = "M206,206 C240,214 272,224 300,230 C330,234 360,232 384,228 C396,226 404,232 398,240 C392,246 380,246 366,244 C336,242 300,244 270,238 C240,232 214,226 200,220";
// brazo levantado por encima de la cabeza, apoyado en la mesa (decúbito supino)
const BRAZO_ARRIBA_SUP = "M214,214 C190,222 150,236 100,240 C80,241 60,240 44,238 C34,237 30,244 38,248 C50,252 70,252 100,251 C150,250 190,246 222,240 Z";
// brazo levantado (decúbito lateral visto desde el tubo): por delante de la cabeza
const BRAZO_ARRIBA_LAT = "M222,186 C200,170 160,158 110,152 C90,150 70,150 56,152 C46,154 46,164 56,165 C72,166 92,166 112,168 C156,174 192,190 214,206 Z";

function supinoL(E, piernas = PIERNAS_EXT, brazo = "costado") {
  const H = E.cabeza();
  let s = "";
  if (brazo === "arriba") s += piel(E.tp(BRAZO_ARRIBA_SUP));
  s += piel(H.d + " " + E.tp(CUELLO + " " + PECHO + " " + ABDOMEN + " " + piernas));
  if (brazo === "costado") s += linea(E.tp(BRAZO_COSTADO));
  return s + H.cara;
}
const PIERNAS_APOYO = "C440,198 476,196 506,190 C520,186 530,186 540,190 C566,206 600,216 640,222 C652,224 660,226 662,228 C664,220 666,206 670,198 " +
  "C673,192 682,192 684,200 C686,214 688,232 688,246 C688,252 680,252 672,252 L640,252 C600,250 566,240 540,230 C528,226 516,226 504,230 C480,240 450,252 420,252 Z";

// decúbito lateral visto desde el tubo (anterior arriba)
function latDec(E, { brazo = "adelante", cojin = false } = {}) {
  const H = E.cabeza();
  let s = "";
  if (brazo === "arriba") s += piel(E.tp(BRAZO_ARRIBA_LAT));
  s += piel(H.d + " " + E.tp(CUELLO + " " + (brazo === "adelante" ? BRAZO_ADELANTE : PECHO) + " " + ABDOMEN + " " + PIERNAS_FLEX)) + H.cara;
  if (cojin) s += `<rect x="-17" y="-8" width="34" height="16" rx="6" fill="#d7dbe3" stroke="#8a8f9c" transform="translate(${f1(E.X(510))} ${f1(E.Y(160))}) rotate(-42)"/>`;
  return s;
}
// decúbito prono de perfil (cabeza a la izquierda, cara hacia la mesa)
function pronoL(E) {
  const H = cabezaPerfil(E.X(NX), E.Y(182), { s: 0.42 * E.s, flip: true, rot: 180 });
  const pts = [[159, 204], [178, 218], [205, 238], [235, 249], [275, 252], [320, 250], [365, 250], [405, 252], [450, 252], [520, 251], [580, 250], [640, 248], [676, 248], [690, 252], [701, 249],
    [702, 242], [694, 230], [684, 221], [672, 219], [640, 224], [580, 220], [530, 214], [480, 208], [440, 198], [418, 192], [396, 196], [366, 204], [330, 202], [290, 194], [250, 190], [210, 191], [175, 189], [140, 184], [NX, 182]]
    .map(([x, y]) => [E.X(x), E.Y(y)]);
  const brazo = linea(E.tp("M214,212 C250,222 300,226 350,226 C372,226 388,228 392,236 C394,242 386,244 376,242 C340,238 290,240 240,232"));
  return piel(H.d + curva(pts, false, 0.9) + " Z") + brazo + H.cara;
}
// huesos laterales (copiados de la referencia)
function vertL(cx, cy, w, h, rot = 0) {
  const x = cx - w / 2, y = cy - h / 2, r = Math.min(2.5, w / 4);
  return `<g transform="rotate(${rot} ${f1(cx)} ${f1(cy)})">` + hueso(`M${f1(x + r)},${f1(y)} H${f1(x + w - r)} Q${f1(x + w)},${f1(y)} ${f1(x + w)},${f1(y + r)} V${f1(y + h - r)} Q${f1(x + w)},${f1(y + h)} ${f1(x + w - r)},${f1(y + h)} H${f1(x + r)} Q${f1(x)},${f1(y + h)} ${f1(x)},${f1(y + h - r)} V${f1(y + r)} Q${f1(x)},${f1(y)} ${f1(x + r)},${f1(y)} Z`) + `</g>`;
}
const huesoT = (d, op = 0.6) => `<path d="${d}" fill="${BONE}" fill-opacity="${op}" stroke="${BONEO}" stroke-width="1.4" stroke-linejoin="round"/>`;
const LUMB = [["L1", 286], ["L2", 308], ["L3", 330], ["L4", 352], ["L5", 374]];
const LY = 232;
function lumbaresL(E) {
  let s = "";
  for (const [, x] of LUMB) s += vertL(E.X(x), E.Y(LY), 17 * E.s, 14 * E.s);
  return s + hueso(E.tp("M386,225 C398,226 410,234 418,244 L415,249 C404,247 394,245 387,240 Z"));
}
function coxalL(E, op = 0.6) {
  const ala = E.tp("M386,207 C370,201 351,210 352,226 C353,240 362,247 373,246 C383,245 390,239 398,238 C404,240 408,246 416,249 C424,250 428,244 424,238 C421,233 420,228 422,223 C424,218 422,213 418,210 C410,207 400,212 394,212 Z");
  const cresta = E.tp("M386,207 C370,201 351,210 352,226 C353,240 362,247 373,246");
  return huesoT(ala, op) + `<path d="${cresta}" fill="none" stroke="${BONEO}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<circle cx="${f1(E.X(410))}" cy="${f1(E.Y(229))}" r="${f1(6 * E.s)}" fill="none" stroke="${BONEO}" stroke-width="1.1"/>`;
}
function sinfisisL(E) {
  return `<ellipse cx="${f1(E.X(419))}" cy="${f1(E.Y(211))}" rx="${f1(4.5 * E.s)}" ry="${f1(3.5 * E.s)}" fill="${BONE}" stroke="${BONEO}" stroke-width="1.4"/>` +
    `<path d="${E.tp("M412,224 C414,218 416,214 419,211")}" fill="none" stroke="${BONEO}" stroke-width="${f1(3 * E.s)}" stroke-linecap="round"/>`;
}
const TX = Array.from({ length: 12 }, (_, i) => 186 + i * 9.5), TYL = 238;
function dorsalesL(E) { let s = ""; TX.forEach((x) => { s += vertL(E.X(x), E.Y(TYL), 7.6 * E.s, 11 * E.s); }); return s; }

// =====================================================================================
// PERSONA DE PIE DE COSTADO (de referencia-tecnicas1-superior.cjs), espalda contra el bucky a la izquierda
// =====================================================================================
function costado(dx, dy = 0) {
  const h = cabezaPerfil(436 + dx, 80 + dy, { s: 0.3, rot: 90 });
  const X = (x) => f1(x + dx), Y = (y) => f1(y + dy);
  const d = h.d + ` L${X(454)},${Y(132)} C${X(468)},${Y(138)} ${X(490)},${Y(146)} ${X(496)},${Y(172)} L${X(498)},${Y(210)} C${X(498)},${Y(240)} ${X(492)},${Y(262)} ${X(494)},${Y(290)} L${X(496)},${Y(316)} L${X(426)},${Y(316)} L${X(424)},${Y(290)} C${X(420)},${Y(260)} ${X(420)},${Y(180)} ${X(422)},${Y(150)} C${X(424)},${Y(140)} ${X(428)},${Y(134)} ${X(430)},${Y(124)} L${X(434)},${Y(96)} Z`;
  const brazo = linea(`M${X(442)},${Y(176)} C${X(440)},${Y(152)} ${X(450)},${Y(138)} ${X(462)},${Y(137)} C${X(476)},${Y(138)} ${X(482)},${Y(152)} ${X(478)},${Y(176)} L${X(476)},${Y(250)} L${X(474)},${Y(316)} M${X(442)},${Y(176)} L${X(444)},${Y(250)} L${X(446)},${Y(316)}`);
  return piel(d) + brazo + h.cara;
}

// =====================================================================================
// ESQUEMAS
// =====================================================================================
const I = {};

// ---------- ABDOMEN ----------
I["abdomen-ap-supino"] = () => {
  const E0 = escena(1, NX, NY), cr = E0.X(354), sx = E0.X(419), sy = E0.Y(211);
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(cr - 84, 268, 168, 10, "RI 35 x 43 vertical · parrilla", cr + 94, 278) +
    supinoL(E0) + lumbaresL(E0) + coxalL(E0) + sinfisisL(E0) +
    `<line x1="${cr + 3}" y1="186" x2="${cr + 3}" y2="210" stroke="${BLUE}" stroke-width="1.1" stroke-dasharray="3 3"/>` +
    etiquetaHueso(cr + 8, 190, "cresta ilíaca") + etiquetaHueso(sx + 7, sy - 3, "sínfisis") +
    `<line x1="${sx}" y1="${sy + 4}" x2="${sx}" y2="268" stroke="${BLUE}" stroke-width="1" stroke-dasharray="3 3"/>` +
    tube(cr, 196, 0, 150) + dash(cr, 206, cr, 282) +
    note(cr, 110, 430, 56, ["RC perpendicular al centro del RI,", "a la altura de las crestas ilíacas", "DFRI 100 cm"], RED) +
    note(cr + 84, 279, 470, 312, ["Borde inferior del RI: incluir la sínfisis del pubis"], INK) +
    note(482, 212, 500, 160, ["Piernas extendidas, brazos a los costados", "sin rotación (EIAS a igual distancia)"]) +
    txt(40, 304, "Exponer al final de la espiración", 11.5, MUTE) +
    txt(40, 319, "Colimar a las partes blandas del abdomen", 11.5, AMB)
  );
};

// AP de pie: panel 1 de frente desde el tubo, panel 2 de costado
function dePie({ titulo2 = "2 · De costado (espalda al bucky)", rcU, rcTxt, rcNotas, extraF = "", organos = "", colU = [22, 92], notas2 = [] }) {
  const V = topView({ x: 262, y: 30, s: 2.75, pose: "pieAP" });
  const T = V.T;
  const [rx, ry] = T(rcU, 0);
  const [, yc] = T(61, 0);
  const [x1, y1] = T(colU[0], -19), [x2, y2] = T(colU[1], 19);
  const p1 = clipR("cpP1", 0, 26, 386, 300,
    riTop(T(0, -27)[0], T(colU[0] - 4, 0)[1], T(0, 27)[0] - T(0, -27)[0], T(colU[1] + 4, 0)[1] - T(colU[0] - 4, 0)[1], "") +
    V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + organos + extraF +
    coll(x1, y1, x2 - x1, y2 - y1) +
    refline(T(-20, 0)[0] + 0, yc, T(0, 27)[0], yc) + cross(rx, ry));
  // panel 2: de costado
  const yCr = 250, yRC = yCr - (61 - rcU) * 2.75 * 0.95;
  return svg(
    view("1 · De frente (desde el tubo)") + p1 +
    note(rx - 8, ry - 6, 16, 50, rcNotas, RED) +
    txt(T(0, 27)[0] + 5, yc + 4, "crestas", 10.5, BLUE) +
    sep(388, titulo2) +
    wall(418, 40, 316, "") + txt(424, 34, "Bucky / RI", 10, MUTE, "middle") +
    costado(8) +
    refline(426, yCr, 510, yCr) + txt(560, yCr + 22, "cresta ilíaca", 10.5, BLUE) + `<line x1="510" y1="${yCr}" x2="558" y2="${yCr + 18}" stroke="${BLUE}" stroke-width=".8"/>` +
    beam(506, yRC, 180, 200, { ref: 180 }) + dash(498, yRC, 430, yRC) +
    lineas(560, 60, notas2, 11.5, INK, 15)
  );
}
I["abdomen-ap-bipedestacion"] = () => dePie({
  rcU: 56, rcTxt: "", rcNotas: ["RC horizontal", "al centro del RI,", "5 cm sobre la", "cresta ilíaca"],
  colU: [36, 88],
  notas2: ["De pie ≥ 5 min antes", "(mejor 10-20 min)", "Brazos a los costados", "Sin rotación", "Incluir el diafragma", "RI 35 x 43 vertical · parrilla", "DFRI 100 cm · espiración", "Marcador de bipedestación"],
});

// decúbito lateral (AP) con rayo horizontal: panel 1 de frente desde el tubo, panel 2 corte desde los pies
function decLateral({ rcU, rcNota, notas, mesa = "Camilla", lado = "I", riTxt = "RI", apoyoTxt = "tablero de decúbito" }) {
  const V = topView({ x: 362, y: 140, s: 2.15, pose: "latIzq", brazoD: "arriba", brazoI: "arriba" });
  const T = V.T;
  const bottom = T(82, 17.8)[1];
  const [rx, ry] = T(rcU, 0);
  const [, yc] = [0, 0];
  const p1 = clipR("cpD1", 0, 26, 386, 300,
    riTop(T(rcU + 24, 0)[0], T(0, -24)[1], T(rcU - 24, 0)[0] - T(rcU + 24, 0)[0], T(0, 22)[1] - T(0, -24)[1], "") +
    `<rect x="0" y="${f1(bottom + 2)}" width="386" height="10" fill="#cfd3dc"/>` +
    V.piel + costillasF(T) + columnaF(T) + pelvisF(T) +
    refline(T(61, -20)[0], T(61, -20)[1], T(61, 20)[0], T(61, 20)[1]) + cross(rx, ry));
  const C = corte({ cx: 575, base: 262, s: 1.05, rot: 90, abajo: lado, haz: "h-izq", apoyo: true, mesa, centro: [0, 0], tubeLen: 110 });
  return svg(
    view("1 · De frente (desde el tubo)") + p1 +
    txt(8, bottom + 24, mesa, 10, MUTE) +
    txt(T(61, -20)[0] + 5, T(61, -20)[1] + 4, "cresta", 10.5, BLUE) +
    note(rx, ry + 10, 150, 292, rcNota, RED) +
    sep(388, "2 · Corte visto desde los pies") + C.svg +
    txt(C.G(0, -30)[0] - 22, C.G(0, 0)[1] + 4, riTxt, 11, INK, "end") +
    txt(C.G(0, 0)[0] + 2, 286, apoyoTxt, 10, MUTE, "middle") +
    lineas(410, 44, notas, 11.5, INK, 15)
  );
}
I["abdomen-decubito-lateral"] = () => decLateral({
  rcU: 56, rcNota: ["RC horizontal al centro del RI,", "5 cm por encima de la cresta ilíaca"],
  notas: ["Decúbito lateral ≥ 5 min antes", "(mejor 10-20 min) · trabar ruedas", "Brazos arriba · rodillas algo", "flexionadas · incluir el diafragma"],
  riTxt: "RI", apoyoTxt: "",
});

I["abdomen-decubito-dorsal"] = () => {
  const E0 = escena(0.66, 40, 250), cr = E0.X(354), rc = E0.X(336);
  const yv = E0.Y(232);
  const C = corte({ cx: 600, base: 262, s: 1.0, rot: 0, haz: "h-izq", apoyo: true, letras: false, mesa: "Camilla", centro: [0, 0], tubeLen: 100 });
  return svg(
    view("1 · Desde el tubo (de costado)") +
    riTop(rc - 70, 150, 140, 104, "") +
    `<rect x="20" y="${f1(E0.Y(252))}" width="420" height="10" fill="#cfd3dc"/>` +
    clipR("cpDD", 0, 26, 452, 300, supinoL(E0, PIERNAS_EXT, "arriba") + lumbaresL(E0) + coxalL(E0) + sinfisisL(E0)) +
    refline(cr, 136, cr, E0.Y(256)) + txt(cr + 4, 134, "cresta ilíaca", 10.5, BLUE) +
    refline(E0.X(270), yv - 6, E0.X(420), yv - 6) +
    cross(rc, yv - 6) +
    note(rc - 6, yv + 4, 40, 292, ["RC horizontal al centro del RI", "(5 cm por encima de la cresta)"], RED) +
    txt(250, 292, "Plano mediocoronal en la", 11, BLUE) + txt(250, 306, "línea central del RI", 11, BLUE) +
    txt(30, 50, "Brazos arriba · apoyo bajo la espalda", 11.5, INK) +
    sep(456, "2 · Corte desde los pies") + C.svg +
    lineas(470, 50, ["Supino, de costado al RI", "Trabar ruedas", "RI 35 x 43 horizontal · parrilla", "DFRI 100 cm · espiración"], 11.5, INK)
  );
};

// ---------- ABDOMEN PEDIÁTRICO ----------
I["abdomen-ped-ap-supino"] = () => {
  const V = topView({ x: 150, y: 150, s: 2.35, pose: "supino", brazoD: "arribaAncho", brazoI: "arribaAncho", cabezaK: 1.35 });
  const T = V.T;
  const [c1x, c1y] = T(58.5, 0), [c2x, c2y] = T(58, 0);
  const [ox, oy] = T(56.5, 0);
  const sand = (u, v) => { const [x, y] = T(u, v); return gris(x - 12, y - 7, 24, 14, 5); };
  return svg(
    view("Vista desde el tubo · decúbito supino") +
    riTop(T(38, 0)[0], T(0, 22)[1], T(90, 0)[0] - T(38, 0)[0], T(0, -22)[1] - T(0, 22)[1], "") +
    V.piel + costillasF(T) + columnaF(T, { dorsal: false }) + pelvisF(T) +
    sand(-19, 23) + sand(-19, -23) + sand(150, 15) + sand(150, -15) +
    coll(T(40, 0)[0], T(0, 18.5)[1], T(88, 0)[0] - T(40, 0)[0], T(0, -18.5)[1] - T(0, 18.5)[1]) +
    refline(T(61, 19)[0], T(61, 19)[1], T(61, -19)[0], T(61, -19)[1]) +
    cross(T(58.5, 0)[0], T(58.5, 0)[1]) +
    `<circle cx="${f1(ox)}" cy="${f1(oy)}" r="2.5" fill="none" stroke="${SKO}" stroke-width="1.4"/>` + cruzChica(ox, oy) +
    note(c1x + 6, c1y - 8, 440, 44, ["RC perpendicular", "hasta 1 año: 2,5 cm sobre la cresta ilíaca", "niños mayores: a la altura del ombligo (⊕ chico)"], RED) +
    txt(T(61, -20)[0] + 3, T(61, -20)[1] + 14, "cresta", 10.5, BLUE, "middle") +
    lab(ox - 2, oy + 6, 250, 250, "ombligo", "end", MUTE) +
    note(T(-19, -23)[0], T(-19, -23)[1] + 7, 20, 280, ["Brazos sobre la cabeza y piernas", "inmovilizados (venda, bolsas de arena)"]) +
    lineas(440, 256, ["RI 18 x 24, 24 x 30 o 30 x 35 vertical · DFRI 100 cm", "Parrilla si el grosor > 10 cm · colimar a los 4 lados", "Exponer en espiración · proteger las gónadas"], 11.5, INK, 16)
  );
};

I["abdomen-ped-ap-bipedestacion"] = () => {
  const V = topView({ x: 190, y: 40, s: 2.6, pose: "pieAP", brazoD: "arribaAncho", brazoI: "arribaAncho", cabezaK: 1.35 });
  const T = V.T;
  const [ox, oy] = T(56.5, 0);
  const [a1x, a1y] = T(54, 0), [a2x, a2y] = T(57.5, 0);
  const [, ys] = T(89, 0), [, ycr] = T(61, 0);
  return svg(
    view("De frente (desde el tubo) · sentado en el dispositivo") +
    clipR("cpPB", 0, 26, 760, 300,
      riTop(T(0, -26)[0], T(36, 0)[1], T(0, 26)[0] - T(0, -26)[0], T(96, 0)[1] - T(36, 0)[1], "") +
      V.piel + costillasF(T) + columnaF(T, { dorsal: false }) + pelvisF(T) +
      gris(T(0, -27)[0], T(34, 0)[1], 14, T(80, 0)[1] - T(34, 0)[1], 4, 'opacity=".75"') +
      gris(T(0, 27)[0] - 14, T(34, 0)[1], 14, T(80, 0)[1] - T(34, 0)[1], 4, 'opacity=".75"') +
      gris(T(0, -20)[0], ys - 2, T(0, 20)[0] - T(0, -20)[0], 9, 3) +
      `<rect x="${f1(T(0, -11)[0])}" y="${f1(T(80.5, 0)[1])}" width="${f1(T(0, 11)[0] - T(0, -11)[0])}" height="${f1(T(87, 0)[1] - T(80.5, 0)[1])}" fill="#7d828e" opacity=".8"/>`) +
    refline(T(0, -20)[0], ycr, T(0, 20)[0], ycr) +
    `<circle cx="${f1(ox)}" cy="${f1(oy)}" r="2.5" fill="none" stroke="${SKO}" stroke-width="1.4"/>` +
    cruzChica(a1x, a1y) + cross(a2x - 0, a2y + 0) +
    note(a1x + 8, a1y - 4, 400, 52, ["RC perpendicular · hasta 1 año:", "2,5 cm por encima del ombligo"], RED) +
    note(a2x + 10, a2y + 2, 400, 110, ["Niños mayores: 2,5-5 cm por", "encima de la cresta ilíaca"], RED) +
    txt(T(0, 20)[0] + 4, ycr + 4, "cresta", 10.5, BLUE) +
    note(T(0, 27)[0] - 7, T(46, 0)[1], 400, 162, ["Piezas laterales ajustadas,", "brazos sobre la cabeza"]) +
    note(T(0, 11)[0], T(84, 0)[1], 400, 214, ["Protección plomada a la altura", "de la sínfisis del pubis"]) +
    lab(ox - 3, oy, 60, 250, "ombligo", "end", MUTE) +
    lineas(400, 262, ["Piernas por las aberturas del asiento", "RI centrado con el RC · DFRI 100 cm", "RI 18 x 24, 24 x 30 o 30 x 35 vertical"], 11.5, MUTE, 15)
  );
};

// ---------- ESOFAGOGRAMA ----------
I["esofagograma-oad"] = () => {
  const V = topView({ x: 118, y: 172, s: 4.0, pose: "prono", sq: 0.8, brazoI: "arriba", brazoD: "costado" });
  const T = V.T;
  const [cx, cy] = T(35.75, 1.2);
  const cup = T(-17, 13);
  const p1 = clipR("cpE1", 0, 26, 386, 300,
    riTop(T(20, 0)[0], T(0, -24)[1], T(70, 0)[0] - T(20, 0)[0], T(0, 24)[1] - T(0, -24)[1], "") +
    V.piel + costillasF(T) + columnaF(T, { lumbar: false }) + esofagoF(T, 4) + estomagoF(T, 4) +
    gris(cup[0] - 8, cup[1] - 6, 16, 18, 3) +
    coll(T(21, 0)[0], T(0, -6.5)[1], T(58, 0)[0] - T(21, 0)[0], T(0, 6.5)[1] - T(0, -6.5)[1]) +
    cross(cx, cy));
  const C = corte({ cx: 575, base: 228, s: 1.0, rot: 37.5, prono: true, abajo: "D", angTxt: "35-40°", tubeLen: 95 });
  return svg(
    view("1 · Desde el tubo · semiprono") + p1 +
    note(cx + 4, cy + 10, 120, 300, ["RC ⟂ en T6 (5-8 cm bajo la", "escotadura yugular)"], RED) +
    lab(cup[0] + 8, cup[1] - 6, 60, 46, "vaso en la mano izq.", "start", MUTE) +
    txt(250, 46, "RI: borde sup. 5 cm", 11, INK) + txt(250, 60, "por encima del hombro", 11, INK) +
    sep(388, "2 · Corte desde los pies (OAD)") + C.svg +
    lineas(402, 282, ["Rotar 35-40° desde prono, lado derecho abajo;", "brazo derecho abajo, izquierdo arriba"], 11.5, INK) +
    txt(402, 316, "Colimar ≈12-15 cm · RI 35 x 43 · DFRI 100 cm", 11, MUTE)
  );
};

I["esofagograma-lateral"] = () => {
  const E0 = escena(1.25, 66, 226);
  const t6 = E0.X(TX[5]), yE = E0.Y(TYL - 18), ys = E0.Y(TYL);
  const esof = banda(`M${f1(E0.X(160))},${f1(E0.Y(TYL - 22))} C${f1(E0.X(200))},${f1(E0.Y(TYL - 20))} ${f1(E0.X(260))},${f1(E0.Y(TYL - 17))} ${f1(E0.X(300))},${f1(E0.Y(TYL - 22))}`, 6);
  return svg(
    view("Vista desde el tubo · decúbito lateral derecho") +
    riTop(t6 - 150, 92, 300, 160, "") +
    latDec(E0) + dorsalesL(E0) + esof +
    coll(E0.X(150), yE - 22, E0.X(310) - E0.X(150), 44) +
    cross(t6, yE) +
    note(t6 + 8, yE + 10, 330, 292, ["RC ⟂ en T6, 5-8 cm bajo la escotadura yugular"], RED) +
    lab(E0.X(285), yE - 4, 470, 100, "esófago con bario", "start", ORGO) +
    note(E0.X(270), E0.Y(140), 330, 52, ["Brazo y hombro derechos hacia arriba", "y adelante, sosteniendo el vaso"]) +
    txt(t6 - 146, 86, "RI: borde sup. 5 cm sobre el hombro", 11, INK) +
    txt(20, 300, "Plano mediocoronal en la línea central", 11.5, BLUE) +
    lineas(570, 210, ["RI 35 x 43 vertical", "DFRI 100 cm (180 cm de pie)", "Colimar ≈12-15 cm de ancho", "Exponer al deglutir"], 11, MUTE, 14)
  );
};

I["esofagograma-ap-pa"] = () => {
  const V = topView({ x: 120, y: 168, s: 3.6, pose: "supino", brazoD: "codo", brazoI: "costado" });
  const T = V.T;
  const [cx, cy] = T(35.75, 0);
  const fa = [T(54, -20.5), T(40, -14), T(28, -6.5)];
  const ante = piel(suave([T(56, -22.5), T(42, -16.2), T(30, -9), T(26.5, -7.5), T(25, -4.5), T(27, -3.8), T(38, -11.5), T(52, -18)], true, 0.7));
  const cupP = T(24.5, -5.5);
  return svg(
    view("Vista desde el tubo · decúbito supino") +
    clipR("cpEA", 0, 26, 520, 300,
      riTop(T(20, 0)[0], T(0, 24)[1], T(70, 0)[0] - T(20, 0)[0], T(0, -24)[1] - T(0, 24)[1], "") +
      V.piel + costillasF(T) + columnaF(T, { lumbar: false }) + esofagoF(T, 3.6) + estomagoF(T, 3.6) + ante +
      gris(cupP[0] - 8, cupP[1] - 2, 14, 16, 3) +
      coll(T(21, 0)[0], T(0, 7)[1], T(58, 0)[0] - T(21, 0)[0], T(0, -7)[1] - T(0, 7)[1]) +
      cross(cx, cy)) +
    note(cx + 4, cy - 10, 330, 50, ["RC ⟂ en T6, ≈8 cm por debajo", "de la escotadura yugular"], RED) +
    lab(cupP[0], cupP[1] + 14, 40, 300, "vaso en la mano derecha, pajita en la boca", "start", MUTE) +
    txt(T(20, 0)[0], 272, "RI: borde sup. 5 cm sobre el hombro", 11, INK) +
    lineas(540, 120, ["Brazo izquierdo al costado", "Paciente en la línea media", "Colimar ≈12-15 cm de ancho", "RI 35 x 43 vertical", "DFRI 100 cm (180 cm de pie)", "De pie se puede hacer PA", "Exponer al deglutir"], 11.5, INK, 16)
  );
};

// ---------- ESTÓMAGO ----------
function topCorte({ pose, sq, brazoD, brazoI, cu, cv, rot, prono, abajo, angTxt, t1, t2, rcNota, notas, organos, v0 = 40, v1 = 82, x0 = 70, s = 3.4, corteTitulo }) {
  const V = topView({ x: x0, y: 172, s, pose, sq, brazoD, brazoI });
  const T = V.T;
  const [cx, cy] = T(cu, cv);
  const p1 = clipR("cpTC", 0, 26, 386, 300,
    riTop(T(v0, 0)[0], T(0, -24)[1], T(v1, 0)[0] - T(v0, 0)[0], T(0, 24)[1] - T(0, -24)[1], "") +
    V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + organos(T, s) + cross(cx, cy));
  const C = corte({ cx: 575, base: 228, s: 1.0, rot, prono, abajo, angTxt, tubeLen: 95 });
  return svg(view(t1) + p1 + note(cx + 4, cy + 10, 20, 292, rcNota, RED) +
    sep(388, corteTitulo || t2) + C.svg + lineas(402, 288, notas, 11.5, INK));
}

I["estomago-pa"] = () => {
  const V = topView({ x: 150, y: 168, s: 3.6, pose: "prono", brazoD: "arriba", brazoI: "arriba" });
  const T = V.T;
  const [cx, cy] = T(46.5, 4);
  return svg(
    view("Vista desde el tubo · decúbito prono") +
    clipR("cpS", 0, 26, 520, 300,
      riTop(T(28, 0)[0], T(0, -22)[1], T(78, 0)[0] - T(28, 0)[0], T(0, 22)[1] - T(0, -22)[1], "") +
      V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + estomagoF(T, 3.6) + cross(cx, cy)) +
    note(cx + 6, cy + 8, 330, 292, ["RC ⟂ (esténico): 2,5-5 cm sobre el reborde", "costal (L1), ≈2,5 cm a la izquierda de la columna"], RED) +
    lab(T(56, 10)[0], T(56, 10)[1], 330, 258, "estómago", "start", ORGO) +
    lab(T(48.8, -2.5)[0], T(48.8, -2.5)[1] - 4, T(48.8, 0)[0] + 10, T(0, -20)[1] - 6, "L1", "start", BONEO) +
    side(40, 60, "I") + txt(56, 64, "lado izquierdo abajo", 10.5, MUTE) +
    lineas(540, 110, ["Prono, brazos arriba", "junto a la cabeza", "Hiperesténico: 5 cm más", "arriba y más medial", "Asténico: más abajo y", "más medial (ver ficha)", "RI 35 x 43, 30 x 35 o 24 x 30", "DFRI 100 cm · espiración"], 11.5, INK, 16)
  );
};

I["estomago-oad"] = () => topCorte({
  pose: "prono", sq: 0.8, brazoD: "costado", brazoI: "arriba", cu: 47, cv: 8.5, rot: 50, prono: true, abajo: "D", angTxt: "45-55°",
  t1: "1 · Desde el tubo · semiprono", t2: "2 · Corte desde los pies (OAD)",
  rcNota: ["RC ⟂ (esténico): 2,5-5 cm sobre las costillas inf.,", "entre la columna y el borde izquierdo"],
  notas: ["Lado anterior derecho apoyado · cadera y rodilla izq.", "algo flexionadas · hiperesténico ≈70°, asténico ≈40°"],
  organos: (T, s) => estomagoF(T, s), v0: 28, v1: 76,
});

I["estomago-lateral-derecha"] = () => {
  const E0 = escena(1.25, 66, 226);
  const l1 = E0.X(286), yv = E0.Y(LY), yF = E0.Y(205);
  const est = organo(`M${f1(E0.X(252))},${f1(E0.Y(200))} C${f1(E0.X(262))},${f1(E0.Y(186))} ${f1(E0.X(290))},${f1(E0.Y(186))} ${f1(E0.X(300))},${f1(E0.Y(196))} C${f1(E0.X(310))},${f1(E0.Y(206))} ${f1(E0.X(304))},${f1(E0.Y(220))} ${f1(E0.X(290))},${f1(E0.Y(220))} C${f1(E0.X(276))},${f1(E0.Y(220))} ${f1(E0.X(270))},${f1(E0.Y(212))} ${f1(E0.X(262))},${f1(E0.Y(214))} C${f1(E0.X(254))},${f1(E0.Y(214))} ${f1(E0.X(246))},${f1(E0.Y(208))} ${f1(E0.X(252))},${f1(E0.Y(200))} Z`);
  return svg(
    view("Vista desde el tubo · decúbito lateral derecho") +
    riTop(l1 - 110, 104, 220, 150, "") +
    latDec(E0, { brazo: "arriba" }) + lumbaresL(E0) + coxalL(E0) + dorsalesL(E0) + est +
    refline(E0.X(250), yv, E0.X(400), yv) +
    cross(l1, yF) +
    note(l1 + 8, yF - 8, 330, 52, ["RC ⟂ (esténico): reborde costal, nivel de L1,", "2,5-4 cm por delante del plano mediocoronal"], RED) +
    lab(l1 - 2, yv + 6, 300, 296, "L1 · plano mediocoronal", "start", BLUE) +
    lab(E0.X(256), E0.Y(206), 140, 290, "estómago", "end", ORGO) +
    note(E0.X(500), E0.Y(150), 600, 140, ["Caderas y rodillas", "algo flexionadas"]) +
    txt(30, 60, "Brazos arriba", 11.5, INK) +
    lineas(560, 222, ["Hiperesténico: ≈5 cm más arriba", "Asténico: ≈5 cm más abajo", "RI 30 x 35 o 24 x 30 · DFRI 100 cm"], 11, MUTE, 14)
  );
};

I["estomago-ap"] = () => {
  const V = topView({ x: 150, y: 168, s: 3.6, pose: "supino" });
  const T = V.T;
  const [cx, cy] = T(48.8, 4);
  return svg(
    view("Vista desde el tubo · decúbito supino") +
    clipR("cpSA", 0, 26, 520, 300,
      riTop(T(28, 0)[0], T(0, 24)[1], T(80, 0)[0] - T(28, 0)[0], T(0, -24)[1] - T(0, 24)[1], "") +
      V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + estomagoF(T, 3.6) +
      refline(T(48.8, -3)[0], cy, T(48.8, -16)[0], cy) + cross(cx, cy)) +
    note(cx + 6, cy - 8, 330, 44, ["RC ⟂, 2,5-5 cm a la izquierda del PMS", "(esténico) en L1: mitad entre xifoides", "y costillas laterales inferiores"], RED) +
    lab(T(56, 10)[0], T(56, 10)[1], 300, 300, "estómago", "start", ORGO) +
    lab(T(46.5, 0)[0], T(46.5, 0)[1] + 2, 170, 300, "xifoides", "end", BONEO) +
    side(40, 60, "I") + txt(56, 64, "lado izquierdo arriba", 10.5, MUTE) +
    lineas(540, 140, ["Brazos a los costados", "Hiperesténico: ≈5 cm más arriba", "Asténico: ≈5 cm más abajo", "y más medial", "RI 30 x 35 o 35 x 43", "DFRI 100 cm · espiración"], 11.5, INK, 16)
  );
};

I["estomago-opi"] = () => topCorte({
  pose: "supino", sq: 0.8, brazoD: "costado", brazoI: "costado", cu: 48.8, cv: 7, rot: 45, prono: false, abajo: "I", angTxt: "45°",
  t1: "1 · Desde el tubo · semisupino", t2: "2 · Corte desde los pies (OPI)",
  rcNota: ["RC ⟂ en la mitad izquierda del abdomen,", "en L1 (esténico)"],
  notas: ["Lado izquierdo abajo, rodilla derecha algo flexionada", "Hiperesténico 60° · asténico 30° (y más abajo)"],
  organos: (T, s) => estomagoF(T, s), v0: 28, v1: 76,
});

// ---------- INTESTINO DELGADO ----------
I["intestino-delgado-pa"] = () => {
  const V = topView({ x: 120, y: 168, s: 3.3, pose: "prono", brazoD: "arriba", brazoI: "arriba" });
  const T = V.T;
  const [cx, cy] = T(61, 0), [c2x, c2y] = T(56, 0);
  return svg(
    view("Vista desde el tubo · decúbito prono") +
    clipR("cpID", 0, 26, 520, 300,
      riTop(T(36, 0)[0], T(0, -22)[1], T(88, 0)[0] - T(36, 0)[0], T(0, 22)[1] - T(0, -22)[1], "") +
      V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + estomagoF(T, 3.3) + delgadoF(T, 3.3) +
      refline(T(61, -19)[0], T(61, -19)[1], T(61, 19)[0], T(61, 19)[1]) + cruzChica(c2x, c2y) + cross(cx, cy)) +
    note(cx + 6, cy + 10, 330, 290, ["RC ⟂ en la cresta ilíaca (series siguientes)"], RED) +
    note(c2x - 4, c2y - 8, 200, 46, ["15 o 30 min: 5 cm más arriba"], RED, "end") +
    txt(T(61, -19)[0] + 3, T(61, -19)[1] - 6, "crestas", 10.5, BLUE, "middle") +
    lab(T(70, 8)[0], T(70, 8)[1], 220, 312, "asas con bario", "end", ORGO) +
    lineas(540, 110, ["Prono, PMS en la línea media,", "sin rotación", "(si hace falta: AP en supino)", "Indicador de tiempo visible", "RI 35 x 43 vertical · parrilla", "DFRI 100 cm", "Espiración completa"], 11.5, INK, 16)
  );
};

// ---------- ENEMA OPACO ----------
I["enema-opaco-pa-ap"] = () => {
  const V = topView({ x: 120, y: 168, s: 3.3, pose: "prono", brazoD: "arriba", brazoI: "arriba" });
  const T = V.T;
  const [cx, cy] = T(61, 0);
  return svg(
    view("Vista desde el tubo · decúbito prono (PA)") +
    clipR("cpEO", 0, 26, 520, 300,
      riTop(T(38, 0)[0], T(0, -22)[1], T(90, 0)[0] - T(38, 0)[0], T(0, 22)[1] - T(0, -22)[1], "") +
      V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + colonF(T, 3.3) +
      refline(T(61, -19)[0], T(61, -19)[1], T(61, 19)[0], T(61, 19)[1]) + cross(cx, cy)) +
    note(cx + 6, cy + 10, 330, 290, ["RC ⟂ al centro del RI, a la altura de la cresta ilíaca"], RED) +
    txt(T(61, -19)[0] + 3, T(61, -19)[1] - 6, "crestas", 10.5, BLUE, "middle") +
    lab(T(56, 13)[0], T(56, 13)[1], 200, 314, "colon con bario", "end", ORGO) +
    lineas(540, 120, ["Prono (PA) o supino (AP)", "En la línea central,", "sin rotación", "RI 35 x 43 vertical · parrilla", "DFRI 100 cm", "Espiración completa"], 11.5, INK, 16)
  );
};

I["enema-opaco-oblicuas"] = () => {
  const V = topView({ x: 140, y: 172, s: 3.2, pose: "prono", sq: 0.8, brazoD: "costado", brazoI: "arriba" });
  const T = V.T;
  const [cx, cy] = T(57.5, 2.5);
  const p1 = clipR("cpEB", 0, 26, 386, 300,
    riTop(T(38, 0)[0], T(0, -24)[1], T(90, 0)[0] - T(38, 0)[0], T(0, 24)[1] - T(0, -24)[1], "") +
    V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + colonF(T, 3.2) +
    refline(T(61, -19)[0], T(61, -19)[1], T(61, 19)[0], T(61, 19)[1]) + cross(cx, cy));
  const A = corte({ cx: 480, base: 222, s: 0.72, rot: 40, prono: true, abajo: "D", angTxt: "35-45°", tubeLen: 80 });
  const B = corte({ cx: 670, base: 222, s: 0.72, rot: 40, prono: true, abajo: "I", angTxt: "35-45°", tubeLen: 80 });
  return svg(
    view("1 · Desde el tubo · semiprono (OAD)") + p1 +
    note(cx + 4, cy + 10, 30, 290, ["RC ⟂: 2,5-5 cm sobre la cresta ilíaca", "y 2,5 cm a la izquierda del PMS"], RED) +
    sep(388, "2 · Cortes desde los pies") + A.svg + B.svg +
    txt(480, 262, "OAD", 12, INK, "middle", 700) + txt(670, 262, "OAI", 12, INK, "middle", 700) +
    lineas(406, 284, ["OPD / OPI: la misma rotación en semisupino", "Incluir la zona rectal · RI 35 x 43 · DFRI 100 cm"], 11.5, INK)
  );
};

I["enema-opaco-lateral-recto"] = () => {
  const E0 = escena(1.25, 30, 226);
  const ex = E0.X(382), eyA = E0.Y(205), eyP = E0.Y(250);
  const ym = (eyA + eyP) / 2;
  const recto = banda(`M${f1(E0.X(360))},${f1(E0.Y(226))} C${f1(E0.X(380))},${f1(E0.Y(222))} ${f1(E0.X(400))},${f1(E0.Y(236))} ${f1(E0.X(426))},${f1(E0.Y(240))}`, 9);
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(ex - 100, 120, 200, 140, "") +
    latDec(E0, { brazo: "adelante" }) + lumbaresL(E0) + coxalL(E0) + sinfisisL(E0) + recto +
    dot(ex, eyA) + refline(ex, eyA - 30, ex, eyP + 8) +
    cross(ex, ym) +
    note(ex + 8, ym + 8, 470, 250, ["RC ⟂ a la altura de las EIAS, en el plano", "mediocoronal (mitad entre EIAS y sacro)"], RED) +
    lab(ex - 3, eyA - 3, ex - 30, eyA - 22, "EIAS", "end", BLUE) +
    lab(E0.X(410), E0.Y(242), E0.X(430), 300, "recto con bario", "start", ORGO) +
    note(E0.X(500), E0.Y(150), 600, 52, ["Rodillas y caderas", "algo flexionadas"]) +
    lineas(20, 270, ["Lateral verdadera, plano medioaxilar", "en la línea media de la mesa", "En decúbito prono el RC es horizontal", "RI 30 x 35 o 24 x 30 · DFRI 100 cm"], 11.5, INK, 15)
  );
};

I["enema-opaco-decubito-lateral"] = () => {
  const V = topView({ x: 362, y: 140, s: 2.15, pose: "latIzq", brazoD: "arriba", brazoI: "arriba" });
  const T = V.T;
  const bottom = T(82, 17.8)[1];
  const [rx, ry] = T(61, 0);
  const p1 = clipR("cpED", 0, 26, 386, 300,
    riTop(T(85, 0)[0], T(0, -24)[1], T(37, 0)[0] - T(85, 0)[0], T(0, 22)[1] - T(0, -24)[1], "") +
    `<rect x="0" y="${f1(bottom + 2)}" width="386" height="10" fill="#cfd3dc"/>` +
    V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + colonF(T, 2.15) +
    refline(T(61, -20)[0], T(61, -20)[1], T(61, 20)[0], T(61, 20)[1]) + cross(rx, ry));
  const C = corte({ cx: 575, base: 262, s: 1.05, rot: 90, abajo: "I", haz: "h-izq", apoyo: true, letras: false, mesa: "Camilla / mesa", tubeLen: 110 });
  const filtro = C.G(0, 0);
  return svg(
    view("1 · De frente (desde el tubo)") + p1 +
    note(rx, ry + 10, 150, 292, ["RC horizontal al centro del RI,", "en la cresta ilíaca, en el PMS"], RED) +
    sep(388, "2 · Corte desde los pies") + C.svg +
    lineas(410, 44, ["Decúbito lateral, brazos arriba,", "rodillas algo flexionadas, espalda", "contra el RI · sin rotación", "Filtro de compensación arriba"], 11.5, INK, 15) +
    lineas(560, 300, ["RI 35 x 43 · DFRI 100 cm", "Espiración completa"], 11, MUTE, 14)
  );
};

function axialPanel(E0, { prono, a, entry, label, angTxt, clipId, x0, w }) {
  const body = prono ? pronoL(E0) : supinoL(E0);
  const bones = prono
    ? `<g transform="matrix(1 0 0 -1 0 ${f1(2 * E0.Y(225))})">${lumbaresL(E0) + coxalL(E0) + sinfisisL(E0)}</g>`
    : lumbaresL(E0) + coxalL(E0) + sinfisisL(E0);
  return clipR(clipId, x0, 26, w, 300, `<rect x="${x0}" y="${f1(E0.Y(252))}" width="${w}" height="10" fill="#cfd3dc"/>` + body + bones);
}
I["enema-opaco-ap-pa-axial"] = () => {
  // panel 1: AP axial supino, 30-40° cefálico, entra 5 cm debajo de las EIAS
  const A = escena(0.62, 70, 262);
  const exA = A.X(382), eyA = A.Y(205), inA = A.X(401), skA = A.Y(199);
  // panel 2: PA axial prono, 30-40° caudal, sale a la altura de las EIAS
  const B = escena(0.62, 450, 262);
  const exB = B.X(382), eyB = B.Y(245), tb = Math.tan(R(35));
  const backY = B.Y(195), inB = exB - (B.Y(252) - backY) * tb;
  return svg(
    view("1 · AP axial · decúbito supino") +
    axialPanel(A, { prono: false, clipId: "cpX1", x0: 0, w: 378 }) +
    `<rect x="${f1(A.X(330))}" y="${f1(A.Y(252) + 14)}" width="110" height="7" fill="${INK}"/>` +
    dot(exA, eyA) + lab(exA - 2, eyA - 4, exA - 40, eyA - 26, "EIAS", "end", BLUE) +
    tube(inA, skA, -35, 130, { angLabel: "30-40°" }) + dash(inA, skA, inA + (A.Y(252) + 12 - skA) * Math.tan(R(-35)), A.Y(252) + 12) +
    txt(inA - 60, 110, "← cefálico", 12, RED, "end", 700) +
    txt(20, 50, "RC 30-40° cefálico,", 13, RED, "start", 700) + txt(20, 66, "5 cm por debajo de las EIAS", 12.5, INK) +
    sep(380, "2 · PA axial · decúbito prono") +
    axialPanel(B, { prono: true, clipId: "cpX2", x0: 382, w: 378 }) +
    `<rect x="${f1(B.X(330))}" y="${f1(B.Y(252) + 14)}" width="110" height="7" fill="${INK}"/>` +
    dot(exB, eyB) + lab(exB + 3, eyB + 3, exB + 60, eyB + 44, "EIAS", "start", BLUE) +
    tube(inB, backY, 35, 130, { angLabel: "30-40°" }) + dash(inB, backY, exB + (14) * tb, B.Y(252) + 14) +
    txt(inB + 70, 110, "caudal →", 12, RED, "start", 700) +
    txt(400, 50, "RC 30-40° caudal, centrado", 13, RED, "start", 700) + txt(400, 66, "para salir a la altura de las EIAS", 12.5, INK) +
    txt(20, 318, "OPI axial: 5 cm debajo y 5 cm medial a la EIAS derecha · RI 30 x 35 · DFRI 100 cm", 11, MUTE)
  );
};

// ---------- UROGRAFÍA ----------
I["urografia-ap"] = () => {
  const V = topView({ x: 120, y: 168, s: 3.3, pose: "supino" });
  const T = V.T;
  const [cx, cy] = T(61, 0), [nx, ny] = T(53.7, 0);
  return svg(
    view("Vista desde el tubo · decúbito supino") +
    clipR("cpU", 0, 26, 520, 300,
      riTop(T(39, 0)[0], T(0, 22)[1], T(91, 0)[0] - T(39, 0)[0], T(0, -22)[1] - T(0, 22)[1], "") +
      V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + urinarioF(T, 3.3) +
      refline(T(61, -19)[0], T(61, -19)[1], T(61, 19)[0], T(61, 19)[1]) + cruzChica(nx, ny) + cross(cx, cy)) +
    note(cx + 6, cy - 10, 300, 44, ["RC ⟂ al centro del RI, en la cresta ilíaca", "(torso largo: 2,5-5 cm más arriba y", "un 2.º RI transversal para la vejiga)"], RED) +
    note(nx - 4, ny + 8, 30, 286, ["Nefrograma: mitad entre", "xifoides y cresta ilíaca"], RED) +
    txt(T(61, -19)[0] + 3, T(61, -19)[1] + 14, "crestas", 10.5, BLUE, "middle") +
    lab(T(52, 9)[0], T(52, 9)[1], 300, 300, "riñones, uréteres y vejiga", "start", ORGO) +
    lineas(540, 120, ["Apoyo bajo las rodillas", "PMS en la línea media,", "sin rotación", "Marcador de minutos", "Proteger gónadas (hombres)", "RI 35 x 43 vertical", "DFRI 100 cm · espiración"], 11.5, INK, 16)
  );
};

I["urografia-oblicuas"] = () => {
  const V = topView({ x: 130, y: 172, s: 3.1, pose: "supino", sq: 0.85, brazoD: "costado", brazoI: "codo" });
  const T = V.T;
  const [cx, cy] = T(61, 0);
  const p1 = clipR("cpUO", 0, 26, 386, 300,
    riTop(T(39, 0)[0], T(0, -24)[1], T(91, 0)[0] - T(39, 0)[0], T(0, 24)[1] - T(0, -24)[1], "") +
    V.piel + costillasF(T) + columnaF(T) + pelvisF(T) + urinarioF(T, 3.1) +
    refline(T(61, -19)[0], T(61, -19)[1], T(61, 19)[0], T(61, 19)[1]) + cross(cx, cy));
  const C = corte({ cx: 575, base: 228, s: 1.0, rot: 30, prono: false, abajo: "D", angTxt: "30°", tubeLen: 95 });
  const w = C.G(-20, -30);
  return svg(
    view("1 · Desde el tubo · semisupino (OPD)") + p1 +
    note(cx + 4, cy + 10, 30, 292, ["RC ⟂ al centro del RI,", "a la altura de la cresta ilíaca"], RED) +
    sep(388, "2 · Corte desde los pies (OPD)") + C.svg +
    lineas(402, 288, ["Rodilla y codo del lado elevado flexionados", "(cuña bajo la espalda si hace falta)"], 11.5, INK) +
    txt(402, 320, "OPI: al revés · RI 35 x 43 · DFRI 100 cm · minutos", 11, MUTE)
  );
};

// la versión de pie de UIV muestra el aparato urinario
{
  I["urografia-ap-posmiccional"] = () => {
    const V = topView({ x: 262, y: 30, s: 2.75, pose: "pieAP" });
    return dePie({
      rcU: 62, rcTxt: "", rcNotas: ["RC ⟂ al centro del RI,", "en las crestas o", "≈2,5 cm más abajo", "(incluir la vejiga)"],
      colU: [40, 92], organos: urinarioF(V.T, 2.75),
      notas2: ["De pie, PMS en la línea", "media, sin rotación", "Incluir vejiga y sínfisis", "RI 35 x 43 vertical · parrilla", "DFRI 100 cm · espiración", "Marcadores: bipedestación", "y posmiccional"],
    });
  };
}

// ---------- CISTOGRAFÍA ----------
const vejigaL = (E0) => organo(`M${f1(E0.X(398))},${f1(E0.Y(214))} C${f1(E0.X(392))},${f1(E0.Y(226))} ${f1(E0.X(398))},${f1(E0.Y(236))} ${f1(E0.X(408))},${f1(E0.Y(234))} C${f1(E0.X(416))},${f1(E0.Y(232))} ${f1(E0.X(416))},${f1(E0.Y(218))} ${f1(E0.X(410))},${f1(E0.Y(212))} C${f1(E0.X(405))},${f1(E0.Y(208))} ${f1(E0.X(400))},${f1(E0.Y(210))} ${f1(E0.X(398))},${f1(E0.Y(214))} Z`);
I["cistografia-ap-axial"] = () => {
  const E0 = escena(1, NX, NY), sx = E0.X(419), sy = E0.Y(211);
  const inX = E0.X(400), sk = E0.Y(198.5);
  const proj = inX + (268 - sk) * Math.tan(R(12.5));
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(proj - 70, 268, 140, 10, "RI 30 x 35 vertical · parrilla", proj + 80, 278) +
    supinoL(E0) + lumbaresL(E0) + coxalL(E0) + vejigaL(E0) + sinfisisL(E0) +
    etiquetaHueso(sx + 7, sy - 3, "sínfisis") +
    `<line x1="${f1(inX)}" y1="${f1(sk - 30)}" x2="${f1(sx)}" y2="${f1(sk - 30)}" stroke="${BLUE}" stroke-width="1.3"/>` +
    txt(sx + 5, sk - 26, "5 cm", 10.5, BLUE, "start", 700) +
    `<line x1="${f1(sx)}" y1="${f1(sk - 34)}" x2="${f1(sx)}" y2="${f1(sy - 4)}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    tube(inX, sk, 12.5, 160, { angLabel: " " }) + txt(inX + 10, sk - 104, "10-15°", 13, RED, "start", 700) + dash(inX, sk, proj, 268) +
    txt(480, 112, "caudal →", 12, RED, "start", 700) +
    note(inX - (sk - 66) * 0.2217, 66, 480, 56, ["RC 10-15° caudal, ≈5 cm por encima", "de la sínfisis del pubis, en el PMS"], RED) +
    lab(E0.X(398), E0.Y(226), 250, 288, "vejiga con contraste", "end", ORGO) +
    note(560, 222, 560, 160, ["Piernas bien extendidas", "RI centrado con el RC proyectado"]) +
    txt(40, 304, "DFRI 100 cm · espiración completa", 11.5, MUTE)
  );
};

I["cistografia-oblicuas"] = () => {
  const V = topView({ x: 40, y: 172, s: 3.6, pose: "supino", sq: 0.8, brazoD: "costado", brazoI: "codo" });
  const T = V.T;
  const [cx, cy] = T(79.6, 8.5);
  const [ex, ey] = T(67, 15.8);
  const p1 = clipR("cpCO", 0, 26, 386, 300,
    riTop(T(62, 0)[0], T(0, -22)[1], T(100, 0)[0] - T(62, 0)[0], T(0, 22)[1] - T(0, -22)[1], "") +
    V.piel + columnaF(T, { dorsal: false }) + pelvisF(T) + urinarioF(T, 3.6, { rinon: false }) + dot(ex, ey) + cross(cx, cy));
  const C = corte({ cx: 575, base: 228, s: 1.0, rot: 52.5, prono: false, abajo: "D", angTxt: "45-60°", tubeLen: 95 });
  return svg(
    view("1 · Desde el tubo · semisupino (OPD)") + p1 +
    lab(ex, ey - 4, ex + 30, 50, "EIAS elevada", "start", BLUE) +
    note(cx + 4, cy + 10, 120, 296, ["RC ⟂: 5 cm sobre la sínfisis y", "5 cm medial a la EIAS elevada"], RED) +
    sep(388, "2 · Corte desde los pies (OPD)") + C.svg +
    lineas(402, 288, ["Brazo y pierna del lado elevado flexionados", "60°: mejor cara posterolateral y unión UV"], 11.5, INK) +
    txt(402, 320, "OPI: al revés · RI 30 x 35 · DFRI 100 cm", 11, MUTE)
  );
};

I["cistografia-lateral"] = () => {
  const E0 = escena(2.6, -490, 235);
  const sx = E0.X(419), sy = E0.Y(211);
  const px = sx - 49, py = sy + 49;
  return svg(
    view("Vista lateral de la pelvis") +
    clipR("cpCL", 30, 30, 460, 270, supinoL(E0) + lumbaresL(E0) + coxalL(E0) + vejigaL(E0) + sinfisisL(E0)) +
    `<rect x="30" y="30" width="460" height="270" fill="none" stroke="#e2e4ea"/>` +
    dot(sx, sy) + lab(sx + 6, sy - 4, sx + 40, sy - 34, "sínfisis del pubis", "start", BLUE) +
    `<line x1="${f1(sx)}" y1="${f1(sy)}" x2="${f1(px)}" y2="${f1(py)}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="3 3"/>` +
    cross(px, py) +
    note(px + 10, py + 8, 510, 120, ["RC perpendicular, 5 cm por", "encima y por detrás de la", "sínfisis del pubis"], RED) +
    lab(E0.X(404), E0.Y(222), 330, 290, "vejiga", "start", ORGO) + txt(40, 292, "← cabeza", 11, MUTE) + txt(40, 48, "anterior ↑", 11, MUTE) +
    lineas(510, 210, ["RI 30 x 35 vertical · parrilla", "DFRI 100 cm", "La ficha no describe la posición", "del paciente (solo una figura)"], 11.5, INK, 16)
  );
};

// ---------- PORTÁTILES ----------
function semisentado(E0, th) {
  const pv = [E0.X(430), E0.Y(250)];
  const w = (x) => { const t = Math.max(0, Math.min(1, (E0.X(420) - x) / (80 * E0.s))); return t * t * (3 - 2 * t); };
  const rotP = (x, y, k = 1) => { const a = R(th) * k, c = Math.cos(a), s = Math.sin(a), dx = x - pv[0], dy = y - pv[1]; return [pv[0] + dx * c - dy * s, pv[1] + dx * s + dy * c]; };
  const tr = (x, y) => rotP(x, y, w(x));
  const trD = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => tr(+a, +b).map(f1).join(","));
  const [nx, ny] = rotP(E0.X(NX), E0.Y(NY));
  const H = cabezaPerfil(nx, ny, { s: 0.42 * E0.s, rot: th });
  const body = piel(H.d + " " + trD(E0.tp(CUELLO + " " + PECHO + " " + ABDOMEN + " " + PIERNAS_EXT))) + linea(trD(E0.tp(BRAZO_COSTADO))) + H.cara;
  return { body, tr: (x, y) => tr(E0.X(x), E0.Y(y)), pv, rotP };
}
I["port-torax-ap"] = () => {
  const E0 = escena(0.8, 70, 288), th = 32;
  const S = semisentado(E0, th);
  const [t7x, t7y] = S.tr(243, 184);
  const [jx, jy] = S.tr(196, 202);
  const ref = 90 + th;
  // RI detrás de la espalda, sobre el respaldo
  const back = S.rotP(E0.X(200), E0.Y(254)), back2 = S.rotP(E0.X(320), E0.Y(254));
  const bk1 = S.rotP(E0.X(90), E0.Y(262)), bk2 = S.rotP(E0.X(420), E0.Y(262));
  return svg(
    view("Vista lateral · cama, posición semiincorporada") +
    `<line x1="${f1(bk1[0])}" y1="${f1(bk1[1])}" x2="${f1(bk2[0])}" y2="${f1(bk2[1])}" stroke="#cfd3dc" stroke-width="12"/>` +
    `<rect x="${f1(S.pv[0])}" y="${f1(E0.Y(256))}" width="${f1(E0.X(720) - S.pv[0])}" height="12" fill="#cfd3dc"/>` + txt(E0.X(560), E0.Y(256) + 26, "Cama (respaldo levantado)", 10.5, MUTE) +
    `<line x1="${f1(back[0])}" y1="${f1(back[1])}" x2="${f1(back2[0])}" y2="${f1(back2[1])}" stroke="${INK}" stroke-width="7"/>` +
    S.body +
    dot(jx, jy) + lab(jx - 3, jy + 3, jx - 40, jy + 40, "escotadura yugular", "end", BLUE) +
    beam(t7x, t7y, ref - 4, 108, { ref, angLabel: " " }) + txt(t7x + 66 * 0.53 + 22 * 0.85, t7y - 66 * 0.85 + 22 * 0.53, "3-5°", 13, RED, "start", 700) +
    note(t7x + 0.52 * 108 + 46, t7y - 0.86 * 108 + 6, 470, 48, ["RC 3-5° caudal respecto de la ⟂ al RI", "(⟂ al esternón), 8-10 cm bajo la", "escotadura yugular (T7)"], RED) +
    note((back[0] + back2[0]) / 2 - 6, (back[1] + back2[1]) / 2 + 4, 60, 300, ["RI 35 x 43 con funda, detrás de la espalda;", "borde sup. 5 cm sobre los hombros"]) +
    lineas(470, 150, ["DFRI 120-180 cm (la mayor posible)", "Con o sin parrilla · sin rotación", "Hombros hacia adelante si se puede", "Exponer tras la 2.ª inspiración"], 11.5, INK, 16)
  );
};

I["port-abdomen-ap-supino"] = () => {
  const E0 = escena(1, NX, 244), cr = E0.X(354);
  return svg(
    view("Vista lateral · decúbito supino en la cama") +
    `<rect x="30" y="252" width="700" height="22" rx="4" fill="#e6e8ee" stroke="#b5bac6"/>` + txt(36, 290, "Cama", 10, MUTE) +
    gris(cr - 70, 246, 20, 7, 2) + gris(cr + 50, 246, 20, 7, 2) +
    `<rect x="${cr - 84}" y="236" width="168" height="9" fill="${INK}"/>` +
    supinoL(E0) + lumbaresL(E0) + coxalL(E0) + sinfisisL(E0) +
    `<line x1="${cr + 3}" y1="176" x2="${cr + 3}" y2="202" stroke="${BLUE}" stroke-width="1.1" stroke-dasharray="3 3"/>` + etiquetaHueso(cr + 8, 180, "cresta ilíaca") +
    tube(cr, 188, 0, 140) + dash(cr, 198, cr, 236) +
    note(cr, 100, 430, 56, ["RC ⟂ al RI, centrado a la altura", "de la cresta ilíaca · DFRI 100 cm"], RED) +
    note(cr + 60, 250, 450, 306, ["Apoyos bajo el RI si hace falta:", "RI horizontal y ⟂ al RC"], INK) +
    note(cr - 84, 241, 60, 306, ["RI 35 x 43 con funda · parrilla"]) +
    txt(480, 160, "Espiración", 11.5, MUTE)
  );
};

I["port-abdomen-decubito-lateral"] = () => decLateral({
  rcU: 56, rcNota: ["RC horizontal al centro del RI,", "5 cm por encima de la cresta ilíaca"],
  notas: ["Sobre el lado izquierdo (o el indicado),", "con apoyos para no hundirse en la cama", "Sin rotación, RI ⟂ al RC", "RI 35 x 43 · DFRI 100 cm · espiración"],
  mesa: "Cama", riTxt: "RI", apoyoTxt: "",
});

// pelvis AP desde el tubo (geometría de referencia-tecnicas1-pelvis.cjs)
const mirrorY = (pts, cy) => pts.map(([x, y]) => [x, 2 * cy - y]);
function marco(o, a, s = 1) { const r = R(a), c = Math.cos(r), sn = Math.sin(r); return ([u, v]) => [o[0] + s * (u * c - v * sn), o[1] + s * (u * sn + v * c)]; }
function pieArriba(T) {
  const pts = [[0, -10], [12, -11], [26, -12.5], [40, -13.5], [50, -13], [55.5, -11.5], [57, -9], [56, -7.4], [59.5, -5.2], [58.2, -3], [61.6, -0.6], [60.4, 1.8],
    [63.6, 4.4], [62.6, 7], [66, 10.5], [66, 15], [62.5, 19], [54, 20], [40, 18.5], [24, 15], [10, 11.5], [0, 10]];
  return pts.map(T);
}
const dedos = (T) => [[-7.4, 56], [-3, 58.2], [1.8, 60.4], [7, 62.6]].map(([v, u]) => linea(`M${T([u, v])} L${T([u - 6, v])}`, 1.2)).join("");
const PCY = 165;
const outerTop = [[0, 104], [45, 109], [85, 106], [122, 96], [162, 88], [205, 85], [240, 89], [290, 99], [340, 106], [378, 108], [400, 109], [432, 107], [470, 110], [506, 115], [530, 118], [544, 118]];
const innerTop = [[546, 138], [530, 140], [500, 148], [450, 157], [405, 158], [378, 157], [340, 157], [298, 157], [266, 159]];
const ANK = [548, 128];
function supinoP(rot = 15) {
  const T = marco(ANK, rot);
  const top = [...outerTop, ...pieArriba(T), ...innerTop];
  const pts = [...top, [248, PCY], ...mirrorY(top, PCY).reverse()];
  const B = marco([ANK[0], 2 * PCY - ANK[1]], -rot);
  return piel(suave(pts) + " L0,104 Z") + dedos(T) + dedos(([u, v]) => B([u, -v]));
}
const hemipelvis = [[124, 148], [116, 134], [114, 116], [120, 103], [132, 96], [143, 98], [150, 106], [158, 108], [166, 113], [178, 116], [190, 117],
  [200, 122], [208, 132], [222, 137], [231, 142], [234, 150], [229, 158], [224, 162.5], [211, 162.5], [204, 155], [194, 149], [178, 147], [158, 145], [140, 146]];
function femurProx(sg) {
  const y = (v) => PCY + sg * (v - PCY);
  const pts = [[300, 129], [250, 129], [238, 130], [230, 133], [218, 130], [206, 131], [187, 122], [196, 113], [208, 108], [216, 100], [226, 98], [232, 104], [246, 111], [300, 115]];
  return hueso(suave(pts.map(([a, b]) => [a, y(b)]), false, 0.7) + " Z") + `<circle cx="196" cy="${y(129)}" r="11" fill="${BONE}" stroke="${BONEO}" stroke-width="1.4"/>`;
}
function pelvisHuesos() {
  let s = hueso(suave([[112, 150], [128, 147], [152, 153], [176, 160], [190, 165], [176, 170], [152, 177], [128, 183], [112, 180]], true, 0.6));
  s += hueso(suave(hemipelvis, true, 0.8)) + hueso(suave(mirrorY(hemipelvis, PCY), true, 0.8));
  s += `<ellipse cx="214" cy="148" rx="9" ry="5.5" fill="${SK}" stroke="${BONEO}" stroke-width="1.2"/><ellipse cx="214" cy="182" rx="9" ry="5.5" fill="${SK}" stroke="${BONEO}" stroke-width="1.2"/>`;
  s += hueso("M86,151 L105,149 L105,181 L86,179 Z");
  return s + femurProx(1) + femurProx(-1);
}
function rot15() {
  const T = marco(ANK, 15), B = marco([ANK[0], 2 * PCY - ANK[1]], -15);
  const a = T([84, 0]), b = B([84, 0]);
  return refline(ANK[0] + 50, ANK[1], ANK[0] + 92, ANK[1]) + refline(ANK[0] + 50, 2 * PCY - ANK[1], ANK[0] + 92, 2 * PCY - ANK[1]) +
    `<line x1="${ANK[0]}" y1="${ANK[1]}" x2="${f1(a[0])}" y2="${f1(a[1])}" stroke="${BLUE}" stroke-width="1.4"/>` +
    `<line x1="${ANK[0]}" y1="${2 * PCY - ANK[1]}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${BLUE}" stroke-width="1.4"/>` +
    txt(ANK[0] + 96, ANK[1] + 12, "15°", 12, BLUE, "start", 700) + txt(ANK[0] + 96, 2 * PCY - ANK[1] - 4, "15°", 12, BLUE, "start", 700);
}
I["port-pelvis-cadera-ap"] = () => svg(
  view("Vista desde el tubo · decúbito supino en la cama") +
  riTop(108, 79, 142, 172, "") +
  supinoP(15) + pelvisHuesos() +
  dot(144, 99) + dot(144, 231) + dot(220, 165) + dot(226, 233, BONEO) +
  refline(144, 99, 220, 165) +
  cross(182, 132) + cruzChica(222, 211) +
  note(144, 99, 60, 52, ["EIAS"], BLUE) +
  note(190, 128, 300, 46, ["Pelvis: RC ⟂ a mitad de camino", "entre las EIAS y la sínfisis del pubis"], RED) +
  note(228, 214, 330, 262, ["Cadera: RC 5 cm medial a la EIAS,", "a la altura del trocánter mayor"], RED) +
  note(220, 168, 300, 120, ["sínfisis del pubis"], BLUE) +
  lab(232, 238, 270, 296, "trocánter mayor", "start", BONEO) +
  txt(30, 270, "RI con funda bajo el paciente", 11.5, INK) +
  txt(30, 285, "Pelvis: 35 x 43 horizontal, borde", 11.5, INK) + txt(30, 299, "sup. 2,5 cm sobre la cresta", 11.5, INK) +
  txt(30, 314, "Cadera: 24 x 30 vertical", 11.5, INK) +
  note(596, 222, 560, 286, ["Rotación interna de 15° solo si", "no se sospecha fractura de cadera"]) +
  rot15() +
  txt(560, 50, "EIAS a igual distancia del RI", 11.5, MUTE) + txt(560, 66, "Apnea · DFRI 100 cm · parrilla", 11.5, MUTE)
);

// axiolateral (Danelius-Miller) portátil: vista desde arriba
I["port-cadera-axiolateral-danelius"] = () => {
  const V = topView({ x: 70, y: 150, s: 3.2, pose: "supino", piernaI: "elevada" });
  const T = V.T;
  const g = -1; // lado afectado: abajo en el dibujo (derecho en esta vista)
  const [hx, hy] = T(78.3, g * 10.8), [tx, ty] = T(81, g * 17.4);
  const nk = [(hx + tx) / 2, (hy + ty) / 2];
  const ux = tx - hx, uy = ty - hy, L = Math.hypot(ux, uy), nux = ux / L, nuy = uy / L;
  // RI vertical (de canto) paralelo al cuello, apoyado en el costado por encima de la cadera
  const c0 = [nk[0] - 8 * 3.2 * 1, nk[1] + 0];
  const riC = [nk[0] - 40, nk[1] + 18];
  const r1 = [riC[0] - nux * 42, riC[1] - nuy * 42], r2 = [riC[0] + nux * 42, riC[1] + nuy * 42];
  // dirección del haz: ⟂ al RI, hacia el RI
  let bx = -nuy, by = nux; if ((riC[0] - nk[0]) * bx + (riC[1] - nk[1]) * by < 0) { bx = -bx; by = -by; }
  const dir = (Math.atan2(by, bx) * 180) / Math.PI;
  const kn = T(97, 9);
  return svg(
    view("Vista desde arriba · decúbito supino (cadera afectada abajo)") +
    clipR("cpDM", 0, 26, 760, 300, V.piel + pelvisF(T) + columnaF(T, { dorsal: false })) +
    `<ellipse cx="${f1(kn[0])}" cy="${f1(kn[1])}" rx="26" ry="22" fill="${SK}" stroke="${SKO}" stroke-width="2" opacity=".85"/>` +
    txt(kn[0], kn[1] + 4, "rodilla", 10, MUTE, "middle") +
    gris(hx - 30, hy + 30, 50, 14, 4, 'opacity=".8"') +
    `<line x1="${f1(r1[0])}" y1="${f1(r1[1])}" x2="${f1(r2[0])}" y2="${f1(r2[1])}" stroke="${INK}" stroke-width="7"/>` +
    refline(hx - nux * 30, hy - nuy * 30, tx + nux * 30, ty + nuy * 30) +
    beam(nk[0], nk[1], dir, 250, { ref: dir }) + dash(nk[0] - bx * 6, nk[1] - by * 6, nk[0] + bx * 40, nk[1] + by * 40) +
    note(nk[0] - bx * 120, nk[1] - by * 120 + 14, 560, 196, ["RC horizontal, ⟂ al RI", "y al cuello femoral"], RED) +
    lab(tx + nux * 30, ty + nuy * 30, tx + nux * 30 + 30, ty + nuy * 30 + 18, "eje del cuello femoral", "start", BLUE) +
    note(r1[0] - 2, r1[1] + 2, 20, 290, ["Parrilla vertical contra el costado, paralela al", "cuello; borde superior a la altura de la cresta"]) +
    note(kn[0], kn[1] - 22, 470, 46, ["Pierna sana elevada: no apoyarla", "sobre el tubo ni el colimador"]) +
    lab(hx - 10, hy + 44, 380, 300, "toallas o apoyo bajo la cadera afectada", "start", MUTE) +
    txt(560, 260, "RI 24 x 30 · DFRI 100 cm", 11.5, MUTE) + txt(560, 275, "Apnea", 11.5, MUTE)
  );
};

I["port-cadera-axiolateral-clements"] = () => {
  // corte desde los pies, a la altura de las caderas
  const base = 230, cx = 330, a = 100, b = 48;
  const el = Array.from({ length: 40 }, (_, k) => { const t = (2 * Math.PI * k) / 40, st = Math.sin(t); return [cx + a * Math.cos(t), base - b - b * st * (st > 0 ? 0.88 : 1)]; });
  const hx = cx + 62, hy = base - 46;
  // RI inclinado 15° respecto de la vertical (borde inferior 5 cm bajo el tablero)
  const rb = [cx + a + 34, base + 18], rt = [rb[0] + Math.sin(R(15)) * 150, rb[1] - Math.cos(R(15)) * 150];
  const dir = 17.5;
  return svg(
    view("Corte visto desde los pies · decúbito supino") +
    `<rect x="120" y="${base}" width="${cx + a + 20 - 120}" height="10" fill="#cfd3dc"/>` + txt(126, base + 24, "Mesa", 10, MUTE) +
    gris(cx + a + 8, base + 2, 70, 8, 2) + txt(cx + a + 44, base + 34, "bandeja del Bucky", 10, MUTE, "middle") +
    piel(suave(el, true)) +
    hueso(suave([[cx - 70, base - 60], [cx - 40, base - 78], [cx, base - 70], [cx + 40, base - 78], [cx + 70, base - 60], [cx + 50, base - 40], [cx, base - 46], [cx - 50, base - 40]], true, 0.8)) +
    `<circle cx="${hx}" cy="${hy}" r="12" fill="${BONE}" stroke="${BONEO}" stroke-width="1.4"/>` +
    hueso(suave([[hx + 8, hy - 8], [hx + 26, hy - 10], [hx + 34, hy - 4], [hx + 30, hy + 8], [hx + 10, hy + 8]], true, 0.8)) +
    `<line x1="${f1(rb[0])}" y1="${f1(rb[1])}" x2="${f1(rt[0])}" y2="${f1(rt[1])}" stroke="${INK}" stroke-width="8"/>` +
    `<line x1="${f1(rb[0])}" y1="${f1(rb[1])}" x2="${f1(rb[0])}" y2="${f1(rb[1] - 150)}" stroke="${BLUE}" stroke-width="1.1" stroke-dasharray="4 3"/>` +
    txt(rb[0] + 4, rb[1] - 158, "≈15°", 12, BLUE, "start", 700) +
    beam(hx, hy, dir, 300, { ref: 0, angLabel: "≈15-20°" }) + dash(hx + 6, hy + 2, rb[0] + 20, hy + (rb[0] + 20 - hx) * Math.tan(R(dir))) +
    lab(hx - 4, hy + 10, hx - 30, base + 30, "cabeza femoral", "end", BONEO) +
    txt(cx - 60, base - 2 * b - 8, "lado sano", 10.5, MUTE, "middle") + txt(cx + 70, base - 2 * b - 8, "lado afectado", 10.5, MUTE, "middle") +
    note(200, 160, 30, 290, ["RC ≈15-20° hacia posterior respecto de la horizontal,", "⟂ al RI y centrado en el cuello femoral"], RED) +
    lineas(560, 60, ["Lado afectado cerca del borde", "de la mesa, piernas extendidas", "Brazos cruzados sobre el tórax", "RI inclinado ≈15°, cara ⟂ al RC", "Borde inferior del RI 5 cm", "por debajo del tablero", "Parrilla alineada con el RC", "RI 24 x 30 · DFRI 100 cm"], 11.5, INK, 16)
  );
};

// ---------- ARCO EN C ----------
function arcoC(cx, base, a, b) {
  const el = Array.from({ length: 40 }, (_, k) => { const t = (2 * Math.PI * k) / 40, st = Math.sin(t); return [cx + a * Math.cos(t), base - b - b * st * (st > 0 ? 0.88 : 1)]; });
  return piel(suave(el, true));
}
I["intraop-abdomen-pa-colangiograma"] = () => {
  const cx = 300, base = 212;
  return svg(
    view("Corte visto desde los pies · decúbito supino") +
    `<path d="M${cx + 70},${base + 76} C${cx + 230},${base + 60} ${cx + 230},${base - 150} ${cx + 80},${base - 160}" fill="none" stroke="#b5bac6" stroke-width="16" stroke-linecap="round"/>` +
    `<rect x="${cx - 150}" y="${base}" width="300" height="10" fill="#cfd3dc"/>` + txt(cx - 146, base + 24, "Mesa", 10, MUTE) +
    arcoC(cx, base, 92, 34) +
    `<circle cx="${cx}" cy="${base - 22}" r="8" fill="${BONE}" stroke="${BONEO}" stroke-width="1.3"/>` +
    `<rect x="${cx - 46}" y="${base + 52}" width="130" height="36" rx="6" fill="#e9ebf0" stroke="#8a8f9c"/>` + txt(cx + 19, base + 75, "Tubo (abajo)", 12, MUTE, "middle") +
    `<rect x="${cx - 60}" y="${base - 178}" width="150" height="36" rx="6" fill="#e9ebf0" stroke="#8a8f9c"/>` + txt(cx + 15, base - 155, "Intensificador (arriba)", 12, MUTE, "middle") +
    `<line x1="${cx}" y1="${base + 50}" x2="${cx}" y2="${base - 134}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` +
    txt(cx + 6, base + 36, "PA", 13, RED, "start", 700) +
    txt(cx - 120, base - 30, "ant.", 10, MUTE) +
    lineas(540, 60, ["Proyección PA: el haz entra por", "la espalda y sale por delante", "La ficha no da ángulo ni", "punto de centrado", "", "Campo estéril", "Delantales y protecciones", "plomadas para el personal", "Exposición automática o manual", "El médico maneja la fluoroscopia", "con un pedal"], 11.5, INK, 16)
  );
};

I["intraop-cadera-lateral"] = () => {
  const V = topView({ x: 40, y: 150, s: 3.3, pose: "supino" });
  const T = V.T;
  const [hx, hy] = T(79, -12.5);
  const tb = [hx - 170, hy + 40], ii = [hx + 150, hy - 50];
  const dir = (Math.atan2(ii[1] - tb[1], ii[0] - tb[0]) * 180) / Math.PI;
  return svg(
    view("Vista desde arriba · decúbito supino") +
    `<path d="M${f1(tb[0])},${f1(tb[1])} C${f1(tb[0] + 60)},${f1(tb[1] + 150)} ${f1(ii[0] + 60)},${f1(ii[1] + 160)} ${f1(ii[0])},${f1(ii[1])}" fill="none" stroke="#b5bac6" stroke-width="14" stroke-linecap="round" opacity=".7"/>` +
    clipR("cpIC", 0, 26, 760, 300, V.piel + pelvisF(T) + columnaF(T, { dorsal: false })) +
    `<g transform="rotate(${f1(dir + 90)} ${f1(ii[0])} ${f1(ii[1])})"><rect x="${f1(ii[0] - 50)}" y="${f1(ii[1] - 12)}" width="100" height="24" rx="5" fill="#e9ebf0" stroke="#8a8f9c"/></g>` +
    txt(ii[0] + 10, ii[1] + 74, "Intensificador (inferior)", 11.5, MUTE, "middle") +
    beam(hx, hy, dir, Math.hypot(hx - tb[0], hy - tb[1]), { ref: dir }) + dash(hx + 6, hy - 2, ii[0] - 10, ii[1] + 3) +
    txt(tb[0] - 4, tb[1] + 40, "Tubo (superior)", 11.5, MUTE, "middle") +
    note(hx + 4, hy + 6, 400, 290, ["RC horizontal · proyección superoinferior"], RED) +
    lineas(560, 52, ["Tubo arriba (superior),", "intensificador abajo (inferior)", "Campo estéril · delantales", "y protecciones plomadas", "Máxima radiación del lado", "del tubo: alejarse de esa zona"], 11.5, INK, 16)
  );
};

module.exports = I;
