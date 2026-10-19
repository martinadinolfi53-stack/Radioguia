// Esquemas de cráneo, huesos faciales, agujeros ópticos, arcos cigomáticos, huesos nasales, mandíbula, ATM y senos.
// Estilo del primer ejemplo (contorno continuo color piel, huesos "por transparencia"); primitivas de estilo.cjs.
// Lo central: las líneas de referencia del cráneo (LOM, LIOM, LMM, LLM, LAM, LGA) y su ángulo con el RI y con el RC.
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONE, BONEO, table, ri, riTop, beam, cross, coll, note, view, txt, svg, dot, linea, hueso, etiquetaHueso, cabezaFrente } = E;

const f1 = (n) => (+n).toFixed(1);
const D = Math.PI / 180;
const add = (p, d, t) => [p[0] + Math.cos(d * D) * t, p[1] + Math.sin(d * D) * t];
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const angOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) / D;

// ---------- curvas ----------
function cr(pts, closed = false, n = 6) {
  const out = [], N = pts.length;
  const g = (i) => (closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
  const segs = closed ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  if (!closed) out.push(pts[N - 1]);
  return out;
}
const poly = (pts, close = true) => "M" + pts.map((p) => f1(p[0]) + "," + f1(p[1])).join(" L") + (close ? " Z" : "");
// varias siluetas unidas en un solo contorno (primero todos los bordes, después todos los rellenos)
const pielU = (...ds) => `<g>${ds.map((d) => `<path d="${d}" fill="none" stroke="${SKO}" stroke-width="3.6" stroke-linejoin="round"/>`).join("")}${ds.map((d) => `<path d="${d}" fill="${SK}"/>`).join("")}</g>`;
const huesoT = (d, op = 0.55) => `<path d="${d}" fill="${BONE}" fill-opacity="${op}" stroke="${BONEO}" stroke-width="1.2" stroke-linejoin="round"/>`;
// intersecciones de la recta p + t·u con una polilínea cerrada → lista de t ordenada
function cortes(pl, p, dir) {
  const ux = Math.cos(dir * D), uy = Math.sin(dir * D), ts = [];
  for (let i = 0; i < pl.length; i++) {
    const a = pl[i], b = pl[(i + 1) % pl.length];
    const ex = b[0] - a[0], ey = b[1] - a[1], den = ux * ey - uy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const wx = a[0] - p[0], wy = a[1] - p[1];
    const t = (wx * ey - wy * ex) / den, s = (wx * uy - wy * ux) / den;
    if (s >= 0 && s <= 1) ts.push(t);
  }
  return ts.sort((x, y) => x - y);
}

// ---------- cabeza de perfil en coordenadas locales ----------
// Origen en el MAE, +x hacia la cara, +y hacia el mentón (cabeza erguida mirando a la derecha). La LOM es el eje x.
// Unidades ≈ mm. Ángulos de las líneas con la LOM: LIOM 7°, LAM ≈ 20°, LLM 35°, LMM 53° (por eso Waters: LOM a 37° del RI).
const SKIN = [[-46, 175], [-48, 130], [-56, 88], [-74, 60], [-92, 18], [-98, -30], [-88, -80], [-60, -114], [-14, -131], [34, -125], [70, -102], [91, -68],
  [99, -38], [99, -24], [94, -11], [99, 0], [105, 13], [110, 25], [106, 33], [98, 37], [100, 44], [97, 51], [100, 57], [93, 67], [97, 80], [92, 94], [78, 102],
  [55, 101], [32, 103], [22, 112], [24, 140], [26, 175]];
const LM = {
  mae: [0, 0], canto: [78, 0], infraorb: [79.4, 9.75], glabela: [99, -24], nasion: [94, -11], acantion: [98.5, 36.5], comisura: [74, 52],
  menton: [75.2, 99.8], orbinf: [84, 4], alveolar: [90, 46], vertex: [-14, -131], malar: [39, 0], gonion: [7, 61], condilo: [12, 2], labios: [97, 51],
};
const DET = {
  ceja: "M80,-15 Q89,-19 97,-16",
  oreja: "M-1,-20 C-12,-30 -27,-18 -25,0 C-24,16 -14,28 -2,22",
  oreja2: "M-6,-12 C-14,-14 -18,-4 -16,6 C-15,12 -10,14 -6,11",
  nariz: "M101,31 Q97,32 95,29",
  boca: "M97,51 L84,52",
};
const BONES = {
  craneo: [[-82, 42], [-90, 10], [-91, -30], [-82, -76], [-56, -107], [-13, -123], [31, -117], [64, -96], [84, -64], [91, -38], [91, -22], [88, -12], [72, -8], [44, -8], [18, 4], [-18, 18], [-50, 34]],
  mandibula: [[10, -1], [15, 3], [13, 20], [9, 44], [7, 60], [14, 70], [40, 84], [68, 96], [84, 93], [90, 81], [88, 66], [80, 61], [52, 61], [32, 57], [26, 40], [31, 18], [24, 22], [18, 10]],
  cigoma: [[10, 5], [58, 3], [70, 8], [78, 24], [70, 30], [57, 17], [12, 13]],
  maxilar: [[57, 14], [84, 16], [86, 38], [74, 44], [58, 36]],
  frontal: [[81, -42], [89, -40], [91, -22], [84, -18], [80, -28]],
  esfenoidal: [[34, -12], [48, -12], [50, 0], [36, 2]],
  etmoidal: [[62, -12], [76, -12], [77, 4], [63, 4]],
};
// cabeza: MAE en (mx,my), escala s, rotación rot (grados, + = horario en pantalla)
function cabeza(mx, my, s, rot = 0, corto = false) {
  const c = Math.cos(rot * D), sn = Math.sin(rot * D);
  const T = ([x, y]) => [mx + s * (x * c - y * sn), my + s * (x * sn + y * c)];
  const tp = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => T([+a, +b]).map(f1).join(","));
  const skin = cr(corto ? [[-52, 112], ...SKIN.slice(2, -2), [24, 112]] : SKIN).map(T);
  const P = (n) => T(LM[n]);
  const [ex, ey] = T([87, -3]);
  const cara = `<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="${f1(6.5 * s)}" ry="${f1(2.8 * s)}" transform="rotate(${f1(rot - 8)} ${f1(ex)} ${f1(ey)})" fill="${SKO}"/>` +
    linea(tp(DET.ceja), 1.5) + linea(tp(DET.oreja), 1.7) + linea(tp(DET.oreja2), 1.2) + linea(tp(DET.nariz), 1.3) + linea(tp(DET.boca), 1.4);
  const B = (k, op) => huesoT(poly(cr(BONES[k], true, 4).map(T)), op);
  const huesos = {
    craneo: (op = 0.35) => B("craneo", op),
    mandibula: (op = 0.6) => B("mandibula", op),
    cigoma: (op = 0.6) => B("cigoma", op),
    senos: () => ["maxilar", "frontal", "esfenoidal", "etmoidal"].map((k) => huesoT(poly(cr(BONES[k], true, 4).map(T)), 0.85)).join(""),
    orbita: () => { const [ox, oy] = T([80, -4]); return `<circle cx="${f1(ox)}" cy="${f1(oy)}" r="${f1(13 * s)}" fill="none" stroke="${BONEO}" stroke-width="1.6"/>`; },
    nasal: () => `<path d="${tp("M93,-11 L102,5")}" stroke="${BONEO}" stroke-width="2.6" stroke-linecap="round"/>`,
  };
  const bbox = () => ({ minX: Math.min(...skin.map((p) => p[0])), maxX: Math.max(...skin.map((p) => p[0])), minY: Math.min(...skin.map((p) => p[1])), maxY: Math.max(...skin.map((p) => p[1])) });
  // contorno solo de la cabeza (sin cuello) para calcular dónde entra el rayo
  const headPoly = cr(SKIN.slice(2, -2), false).map(T);
  return { T, tp, P, s, rot, skin, d: poly(skin), cara, huesos, bbox, headPoly, ang: (a) => a + rot, mae: T([0, 0]) };
}
// ubica la cabeza para que su borde toque una recta: lado = "abajo" | "derecha" | "izquierda"; ref = coordenada de esa recta
function ubicar(s, rot, lado, ref, otra, corto = false) {
  const h0 = cabeza(0, 0, s, rot), b = h0.bbox();
  const hp = h0.headPoly;
  const minX = Math.min(...hp.map((p) => p[0])), maxX = Math.max(...hp.map((p) => p[0])), maxY = Math.max(...hp.map((p) => p[1]));
  if (lado === "abajo") return cabeza(otra, ref - maxY, s, rot, corto);
  if (lado === "derecha") return cabeza(ref - maxX, otra, s, rot, corto);
  return cabeza(ref - minX, otra, s, rot, corto);
}

// línea de referencia que pasa por a y b, prolongada e1 antes de a y e2 después de b, con rótulo al final
function linRef(a, b, e1, e2, label, lpos = "fin", dx = 0, dy = 0) {
  const d = angOf(a, b), p = add(a, d + 180, e1), q = add(b, d, e2);
  const L = lpos === "fin" ? q : p;
  return E.refline(f1(p[0]), f1(p[1]), f1(q[0]), f1(q[1])) + (label ? txt(f1(L[0] + dx), f1(L[1] + dy), label, 11.5, BLUE, "middle", 700) : "");
}
// arco de ángulo entre dos direcciones desde el vértice v (color azul por defecto)
function arco(v, d1, d2, r, label, color = BLUE, lr = 14) {
  const p = add(v, d1, r), q = add(v, d2, r);
  let dd = ((d2 - d1) % 360 + 540) % 360 - 180;
  const sweep = dd > 0 ? 1 : 0;
  const m = add(v, d1 + dd / 2, r + lr);
  return `<path d="M${f1(p[0])},${f1(p[1])} A${r},${r} 0 0 ${sweep} ${f1(q[0])},${f1(q[1])}" fill="none" stroke="${color}" stroke-width="1.4"/>` +
    (label ? txt(f1(m[0]), f1(m[1] + 4), label, 12.5, color, "middle", 700) : "");
}
// marca de ángulo recto en v entre las direcciones d1 y d2
function recto(v, d1, d2, k = 9, color = BLUE) {
  const a = add(v, d1, k), b = add(add(v, d1, k), d2, k), c = add(v, d2, k);
  return `<path d="M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])} L${f1(c[0])},${f1(c[1])}" fill="none" stroke="${color}" stroke-width="1.3"/>`;
}
// RC: rayo que pasa por el punto p con dirección dir; entra por la piel de la cabeza h; el trazo punteado sigue hasta 'hasta' (t extra o función)
function rayo(h, p, dir, { len = 130, ref, angLabel, hasta = 60, entrada = true } = {}) {
  let e = p;
  if (entrada) {
    const ts = cortes(h.headPoly, p, dir);
    if (ts.length) e = add(p, dir, ts[0]);
  }
  const end = typeof hasta === "function" ? hasta(e, dir) : add(p, dir, hasta);
  return { e, svg: beam(+f1(e[0]), +f1(e[1]), dir, len, { ref: ref ?? dir, angLabel }) +
    `<line x1="${f1(e[0])}" y1="${f1(e[1])}" x2="${f1(end[0])}" y2="${f1(end[1])}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` };
}
const hastaX = (X) => (e, d) => add(e, d, (X - e[0]) / Math.cos(d * D));
const hastaY = (Y) => (e, d) => add(e, d, (Y - e[1]) / Math.sin(d * D));
const pto = (p, c = BLUE, r = 3.6) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${c}"/>`;
const guia = (p, q, c = BONEO, w = 0.9) => `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(q[0])}" y2="${f1(q[1])}" stroke="${c}" stroke-width="${w}"/>`;
// rótulo pequeño con línea guía desde el punto p
function rot2(p, tx, ty, t, c = BONEO, anchor = "start") {
  const w = String(t).length * 6, x0 = anchor === "start" ? tx : anchor === "end" ? tx - w : tx - w / 2, x1 = x0 + w, y0 = ty - 11, y1 = ty + 3;
  let q;
  if (p[0] < x0) q = [x0 - 3, ty - 4]; else if (p[0] > x1) q = [x1 + 3, ty - 4]; else q = [p[0], p[1] < y0 ? y0 - 2 : y1 + 2];
  return guia(p, q, c) + (c === BONEO ? etiquetaHueso(tx, ty, t, anchor) : txt(tx, ty, t, 11, c, anchor));
}
const panelSep = (x, title) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>` + `<text x="${x + 12}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
// RI dibujado de canto (barra) en cualquier orientación: centro c, largo L, dirección d
function riBar(c, L, d, label, lx, ly, anchor = "start") {
  return `<rect x="${f1(c[0] - L / 2)}" y="${f1(c[1] - 4)}" width="${f1(L)}" height="8" fill="${INK}" transform="rotate(${f1(d)} ${f1(c[0])} ${f1(c[1])})"/>` +
    (label ? txt(lx, ly, label, 12, INK, anchor) : "");
}

// ---------- troncos ----------
// sentado/erguido de perfil mirando a la derecha; N = base del cuello
function troncoErguido(N, s, yFin = 318, inc = 0) {
  const [x, y] = N, c = Math.cos(inc * D), sn = Math.sin(inc * D);
  const R = ([px, py]) => [x + (px - x) * c - (py - y) * sn, y + (px - x) * sn + (py - y) * c];
  return poly(cr([[x + 30 * s, y - 14 * s], [x + 66 * s, y + 14 * s], [x + 76 * s, y + 80 * s], [x + 76 * s, yFin + 40], [x - 78 * s, yFin + 40], [x - 80 * s, y + 80 * s], [x - 66 * s, y + 6 * s], [x - 30 * s, y - 14 * s]].map(R).map(([a, b]) => [a, Math.min(b, yFin)])));
}
const brazoErguido = (N, s, yFin = 318) => N[1] + 30 * s > yFin ? "" : linea(`M${f1(N[0] - 20 * s)},${f1(N[1] + 18 * s)} C${f1(N[0] - 34 * s)},${f1(N[1] + 40 * s)} ${f1(N[0] - 30 * s)},${f1(N[1] + 110 * s)} ${f1(N[0] - 26 * s)},${yFin}`);
// decúbito supino de perfil, cabeza a la izquierda; N = base del cuello, mesa en Y
function troncoSupino(N, s, Y, xFin = 748) {
  const [x] = N;
  return poly(cr([[x - 96 * s, Y], [x - 50 * s, Y - 44 * s], [x + 4 * s, Y - 62 * s], [x + 40 * s, Y - 96 * s], [x + 110 * s, Y - 108 * s], [x + 220 * s, Y - 104 * s], [xFin, Y - 92 * s], [xFin, Y]], false), true);
}

// ---------- escenas base ----------
// decúbito supino, vista lateral: cabeza a la izquierda, cara hacia arriba (rot -90 = LOM perpendicular a la mesa)
function escenaSupino(s, rot, mx, Y = 260, xFin = 730) {
  const h = ubicar(s, rot, "abajo", Y, mx);
  const N = h.T([-12, 128]);
  return { h, Y, piel: pielU(troncoSupino(N, s, Y, xFin), h.d) + h.cara };
}
// sentado erguido de perfil, mirando a la derecha. El RI (vertical) toca la cara en X si se da.
function escenaErguido(s, rot, X, my, yFin = 318, mx = 0) {
  const h = X != null ? ubicar(s, rot, "derecha", X, my, true) : cabeza(mx, my, s, rot, true);
  const A = h.T([-48, 106]), B = h.T([22, 106]);
  const N = [(A[0] + B[0]) / 2 - 6 * s, Math.max(A[1], B[1]) + 34 * s];
  const cuello = poly([A, B, [N[0] + 28 * s, N[1] - 10 * s], [N[0] - 30 * s, N[1] - 10 * s]]);
  return { h, piel: pielU(troncoErguido(N, s, yFin), cuello, h.d) + brazoErguido(N, s, yFin) + h.cara };
}
const rotulo = (x, y, lines, color = MUTE, size = 11.5) => lines.map((l, i) => txt(x, y + i * 15, l, size, i === 0 && color !== MUTE ? color : (color === MUTE ? MUTE : INK), "start", i === 0 && color !== MUTE ? 700 : 400)).join("");

// ---------- CRÁNEO ----------
function towneBase({ entradaLocal, cig, mand, s = 0.68, mx = 300, ang = 30, punto = [0, -20], entradaTxt, labelAng, lineas = ["RC 30° caudal respecto de la LOM"], extra = "", ri = "RI 24 × 30 vertical · parrilla", vista = "Vista lateral · decúbito supino", notaLOM = ["Mentón bajo:", "LOM ⟂ al RI"] }) {
  const S = escenaSupino(s, -90, mx), h = S.h;
  const p = h.T(entradaLocal || punto), dir = 90 - ang;
  const R = rayo(h, p, dir, { entrada: !entradaLocal, len: 96, ref: 90, angLabel: labelAng || ang + "°", hasta: hastaY(S.Y + 24) });
  const mae = h.mae, canto = h.P("canto");
  const hitRI = hastaY(S.Y + 16)(R.e, dir);
  return svg(
    view(vista) + table(30, 730, S.Y) +
    E.ri(f1(hitRI[0] - 70), S.Y + 16, 140, 9) + txt(f1(hitRI[0] + 80), S.Y + 25, ri, 11.5, INK) +
    S.piel + h.huesos.craneo() + h.huesos.orbita() + (cig ? h.huesos.cigoma() : "") + (mand ? h.huesos.mandibula() : "") +
    linRef(mae, canto, mae[1] - S.Y + 0, 70, "LOM", "fin", 0, -6) + recto([mae[0], S.Y], -90, 0, 9) +
    pto(mae) + rot2(mae, mae[0] - 46, mae[1] + 26, "MAE", BLUE, "end") +
    pto(h.P("glabela"), INK, 2.6) + rot2(h.P("glabela"), h.P("glabela")[0] + 26, h.P("glabela")[1] - 22, "glabela") +
    R.svg + pto(R.e, RED, 3) + extra +
    note(f1(mae[0] + 4), f1(mae[1] - 120), 450, 46, lineas, RED) +
    (entradaTxt ? note(f1(R.e[0] + 4), f1(R.e[1] + 2), 450, 46 + 16 * lineas.length + 14, entradaTxt, INK) : "") +
    rotulo(40, 296, notaLOM, BLUE)
  );
}

const crTowne = () => towneBase({
  lineas: ["RC 30° caudal respecto de la LOM", "(o 37° caudal si la LIOM queda ⟂ al RI)"],
  entradaTxt: ["Entra ≈6,5 cm por encima de la glabela", "pasa 2 cm por encima del nivel de los MAE"],
  ri: "RI 24 × 30 vertical · parrilla · DFRI 100 cm",
});

// ---------- cabeza vista desde arriba (o desde los pies): óvalo con nariz; +x local = hacia la nariz (PMS) ----------
function cabezaArriba(c, s, rot) {
  const C = Math.cos(rot * D), S = Math.sin(rot * D);
  const T = ([x, y]) => [c[0] + s * (x * C - y * S), c[1] + s * (x * S + y * C)];
  const pts = [];
  for (let i = 0; i < 36; i++) {
    const a = (i * 10) * D; let x = Math.cos(a) * (Math.cos(a) > 0 ? 88 : 96), y = Math.sin(a) * 72;
    if (i === 0) continue;
    pts.push([x, y]);
  }
  const all = [[86, 10], [100, 3], [100, -3], [86, -10], ...pts.filter((p) => !(p[0] > 80 && Math.abs(p[1]) < 14)).reverse()];
  // ordenar por ángulo para un contorno limpio
  all.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
  const skin = cr(all, true, 4).map(T);
  const oreja = (sg) => { const [ex, ey] = T([-6, sg * 74]); return `<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="${f1(9 * s)}" ry="${f1(5 * s)}" transform="rotate(${f1(rot)} ${f1(ex)} ${f1(ey)})" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>`; };
  return { T, skin, d: poly(skin), orejas: oreja(1) + oreja(-1), nariz: T([100, 0]), c, rot, s };
}

// ---------- vista frontal (cara mirando al observador): cabeza + cuello + hombros ----------
function frente(cx, cy, r, { hombros = true } = {}) {
  const b = cy + r * 1.0;
  const cuerpo = `M${f1(cx - r * 0.42)},${f1(b - 10)} L${f1(cx - r * 0.45)},${f1(b + r * 0.55)} C${f1(cx - r * 0.9)},${f1(b + r * 0.62)} ${f1(cx - r * 1.5)},${f1(b + r * 0.66)} ${f1(cx - r * 1.62)},${f1(b + r * 1.05)} L${f1(cx - r * 1.66)},${f1(b + r * 1.3)} Q${f1(cx)},${f1(b + r * 1.42)} ${f1(cx + r * 1.66)},${f1(b + r * 1.3)} L${f1(cx + r * 1.62)},${f1(b + r * 1.05)} C${f1(cx + r * 1.5)},${f1(b + r * 0.66)} ${f1(cx + r * 0.9)},${f1(b + r * 0.62)} ${f1(cx + r * 0.45)},${f1(b + r * 0.55)} L${f1(cx + r * 0.42)},${f1(b - 10)} Z`;
  return (hombros ? `<path d="${cuerpo}" fill="${SK}" stroke="${SKO}" stroke-width="2" stroke-linejoin="round"/>` : "") + cabezaFrente(cx, cy, r);
}
// mandíbula de frente (por transparencia)
const mandFrente = (cx, cy, r) => `<path d="M${f1(cx - r * 0.8)},${f1(cy + r * 0.05)} L${f1(cx - r * 0.78)},${f1(cy + r * 0.62)} Q${f1(cx - r * 0.55)},${f1(cy + r * 1.08)} ${f1(cx)},${f1(cy + r * 1.08)} Q${f1(cx + r * 0.55)},${f1(cy + r * 1.08)} ${f1(cx + r * 0.78)},${f1(cy + r * 0.62)} L${f1(cx + r * 0.8)},${f1(cy + r * 0.05)}" fill="none" stroke="${BONEO}" stroke-width="5" stroke-opacity=".45" stroke-linecap="round" stroke-linejoin="round"/>`;
// orden: la vista se escribe al final con fondo blanco para que nada la tape
const vista = (t, x = 12) => `<rect x="${x - 4}" y="7" width="${t.length * 8.6 + 8}" height="18" fill="#fff" fill-opacity=".9"/>` + (x === 12 ? view(t) : `<text x="${x}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${t.toUpperCase()}</text>`);
const sep = (x, y2 = 322) => `<line x1="${x}" y1="14" x2="${x}" y2="${y2}" stroke="#e2e4ea"/>`;

// ---------- vista desde el tubo: perfil grande, RI detrás ----------
// punto = local donde cae el RC; box = [x1,y1,x2,y2] local del RI; col = [x1,y1,x2,y2] local de la colimación
function vistaTubo({ s = 0.86, rot = -7, mae = [240, 150], punto, cruz = true, box, col, lineas, liom = true, ri: riTxt, extras = "", notas = "", titulo = "Vista desde el tubo · sentado", huesos = (h) => h.huesos.craneo() }) {
  const Sc = escenaErguido(s, rot, null, mae[1], 318, mae[0]), h = Sc.h;
  const p = h.T(punto);
  const B = box.map((v, i) => (i % 2 ? mae[1] + v * s : mae[0] + v * s));
  const C = col ? col.map((v, i) => (i % 2 ? mae[1] + v * s : mae[0] + v * s)) : null;
  return svg(
    riTop(f1(B[0]), f1(B[1]), f1(B[2] - B[0]), f1(B[3] - B[1])) +
    Sc.piel + huesos(h) +
    (C ? coll(f1(C[0]), f1(C[1]), f1(C[2] - C[0]), f1(C[3] - C[1])) : "") +
    (liom ? linRef(h.mae, h.P("infraorb"), 34, 40, "LIOM", "fin", 22, 4) : "") +
    pto(h.mae) + txt(f1(h.mae[0] - 6), f1(h.mae[1] + 22), "MAE", 11, BLUE, "end") +
    extras +
    (cruz ? cross(f1(p[0]), f1(p[1])) : pto(p, RED, 4.5)) +
    note(f1(p[0] + 12), f1(p[1] - 6), 470, 50, lineas, RED) +
    txt(470, 316, riTxt, 11.5, INK) + notas + vista(titulo)
  );
}

// ---------- PA erguido mirando al RI (vertical, a la derecha) ----------
// rayos: [{ por: landmark (salida), dir, ang, ref }]
function paPanel({ x0 = 0, X = 330, my = 140, s = 0.56, rot = 0, rayos, lineas, titulo, refl = [], arcos = "", extra = "", len = 92, riL = 210, huesos = (h) => h.huesos.craneo() + h.huesos.orbita(), riTxt, notaY = 236, notaX }) {
  const S = escenaErguido(s, rot, X - 2, my), h = S.h;
  let out = S.piel + huesos(h) + E.ri(X, f1(my - riL / 2 - 10), 8, riL);
  for (const L of refl) out += L(h);
  out += arcos ? arcos(h) : "";
  for (const r of rayos) {
    const p = h.P(r.por);
    const R = rayo(h, p, r.dir, { len, ref: r.ref ?? 0, angLabel: r.ang, hasta: hastaX(X) });
    out += R.svg + pto(p, RED, 3.4);
  }
  out += extra ? extra(h) : "";
  const nx = notaX ?? x0 + 14;
  out += lineas.map((l, i) => txt(nx, notaY + i * 15, l, i === 0 ? 12.5 : 11.5, i === 0 ? RED : INK, "start", i === 0 ? 700 : 400)).join("");
  if (riTxt) out += txt(X + 12, f1(my + riL / 2 - 14), "RI", 11.5, INK);
  return out + vista(titulo, x0 + 12);
}
// línea de referencia como función de la cabeza: desde el MAE por el punto p
const L_ = (lm, nom, e1 = 26, e2 = 40, dx = 0, dy = -6) => (h) => linRef(h.mae, h.P(lm), e1, e2, nom, "inicio", dx, dy);
const LOMr = (e2 = 40) => (h) => linRef(h.mae, h.P("canto"), 24, e2, "LOM", "inicio", -14, 4);

// ---------- CRÁNEO ----------
const crLateral = () => vistaTubo({
  mae: [240, 176], punto: [0, -50], box: [-150, -170, 150, 70], col: [-106, -140, 120, 66],
  lineas: ["RC perpendicular al RI", "≈5 cm por encima del MAE"],
  ri: "RI 24 × 30 horizontal · parrilla · DFRI 100 cm",
  notas: rotulo(470, 120, ["LIOM paralela a los bordes", "superior e inferior del RI"], BLUE) +
    rotulo(470, 170, ["Lateral verdadera: PMS paralelo", "y LIP perpendicular al RI"], INK) +
    txt(470, 220, "Colimar hasta los bordes del cráneo", 11.5, AMB) + txt(470, 236, "Apnea", 11.5, MUTE),
});

function crCaldwell() {
  const comun = { refl: [LOMr()], arcos: (h) => recto([330, h.mae[1]], 180, -90, 9) };
  return svg(
    paPanel({ ...comun, x0: 0, X: 330, titulo: "PA · sentado frente al RI", rayos: [{ por: "glabela", dir: 0 }],
      lineas: ["RC perpendicular al RI", "sale por la glabela", "LOM ⟂ al RI · PMS ⟂ al RI"], riTxt: 1,
      extra: (h) => rot2(h.P("glabela"), h.P("glabela")[0] - 40, h.P("glabela")[1] - 40, "glabela", RED, "middle") }) +
    sep(380) +
    paPanel({ ...comun, arcos: (h) => recto([710, h.mae[1]], 180, -90, 9), x0: 380, X: 710, titulo: "PA axial de Caldwell", rayos: [{ por: "nasion", dir: 15, ang: "15°" }],
      lineas: ["RC 15° caudal respecto de la LOM", "sale por el nasión", "(25-30° caudal: mejor bordes orbitarios)"], riTxt: 1,
      extra: (h) => rot2(h.P("nasion"), h.P("nasion")[0] - 30, h.P("nasion")[1] - 50, "nasión", RED, "middle") }) +
    txt(394, 300, "RI 24 × 30 vertical · parrilla", 11, MUTE) + txt(394, 314, "DFRI 100 cm · apnea", 11, MUTE)
  );
}

// ---------- SMV erguido: vértex contra el RI (izquierda), LIOM paralela al RI, RC horizontal ⟂ LIOM ----------
function smvBase({ cig, c = 20, lineas, entradaTxt, riTxt, notas = "", titulo = "Vista lateral · sentado, cuello en hiperextensión", s = 0.6 }) {
  const X = 150, my = 150, rot = -97;
  const h = ubicar(s, rot, "izquierda", X + 9, my, true);
  const A = h.T([-48, 106]), B = h.T([22, 106]);
  const N = [B[0] + 40 * s, B[1] + 100 * s];
  const cuello = poly([A, B, [N[0] + 26 * s, N[1] - 8 * s], [N[0] - 34 * s, N[1] - 14 * s]]);
  const piel = pielU(troncoErguido(N, s, 318, -24), cuello, h.d) + h.cara;
  const p = h.T([c * Math.cos(7 * D), c * Math.sin(7 * D)]);
  const R = rayo(h, p, 180, { len: 112, ref: 180, hasta: hastaX(X + 8) });
  const a = h.mae, b = h.P("infraorb");
  return svg(
    E.ri(X, 40, 8, 220) + txt(X - 8, 274, "RI", 11.5, INK, "end") +
    piel + h.huesos.craneo() + h.huesos.mandibula(0.45) + (cig ? h.huesos.cigoma(0.75) : "") +
    linRef(a, b, 70, 60, "LIOM", "fin", 0, -8) + txt(f1(b[0] + 14), f1(b[1] - 46), "∥ RI", 11, BLUE, "start", 700) +
    pto(a) + txt(f1(a[0] + 10), f1(a[1] + 18), "MAE", 11, BLUE) +
    R.svg + pto(p, RED, 3.4) +
    note(f1(R.e[0] + 30), f1(R.e[1] - 3), 430, 50, lineas, RED) +
    (entradaTxt ? note(f1(R.e[0]), f1(R.e[1] + 3), 430, 50 + 16 * lineas.length + 12, entradaTxt, INK) : "") +
    rotulo(176, 296, ["Vértex apoyado", "sobre el RI"], INK) +
    notas + txt(430, 316, riTxt, 11.5, INK) + vista(titulo)
  );
}
const crSMV = () => smvBase({
  lineas: ["RC perpendicular a la LIOM", "2 cm por delante del nivel de los MAE"],
  entradaTxt: ["Centrado entre los ángulos", "de la mandíbula"],
  riTxt: "RI 24 × 30 vertical · parrilla · DFRI 100 cm",
  notas: rotulo(430, 200, ["Si no llega a extender: angular el tubo", "para que el RC siga ⟂ a la LIOM"], MUTE) + txt(430, 250, "Sin rotación ni inclinación · apnea", 11.5, MUTE),
});

// ---------- traumatismo: lateral con haz horizontal (dos paneles) ----------
function traumaLat({ punto, rcTxt, riTxt, boxW = 300, boxH = 240, extra = "" }) {
  // panel 1: desde los pies
  const Y = 250, s1 = 0.9, c = [196, Y - 96 * s1];
  const A = cabezaArriba(c, s1, -90);
  const XR = 286;
  const lat = [c[0] - 72 * s1, c[1]];
  const p1 = beam(f1(lat[0]), f1(lat[1]), 0, 102, { ref: 0 }) + `<line x1="${f1(lat[0])}" y1="${f1(lat[1])}" x2="${XR}" y2="${f1(lat[1])}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
  const panel1 = table(40, XR - 6, Y, "") + `<rect x="${XR - 6}" y="${Y}" width="1" height="12" fill="#cfd3dc"/>` +
    `<path d="${A.d}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` + A.orejas + linea(poly([A.T([100, 0]), A.T([86, 9])], false)) +
    E.ri(XR, Y - 180, 8, 180 + 24) + `<line x1="${XR + 14}" y1="${Y}" x2="${XR + 14}" y2="${Y + 24}" stroke="${INK}" stroke-width="1"/>` +
    txt(XR + 18, Y + 20, "2,5 cm bajo", 10.5, INK) + txt(XR + 18, Y + 32, "el tablero", 10.5, INK) +
    txt(f1(c[0] + 14), f1(c[1] - 88), "nariz", 10.5, MUTE) +
    txt(XR + 14, Y - 186, "RI de canto", 11, INK, "middle") +
    p1 + txt(40, Y + 50, "Paciente al borde de la mesa,", 11.5, INK) + txt(40, Y + 64, "sin mover la cabeza ni quitar el collarín", 11.5, INK) +
    vista("Desde los pies · decúbito supino");
  // panel 2: desde el tubo
  const s = 0.62, Y2 = 236;
  const S = escenaSupino(s, -90, 520, Y2, 744), h = S.h;
  const p = h.T(punto);
  const bw = boxW * s, bh = boxH * s;
  const panel2 = riTop(f1(p[0] - bh / 2), f1(p[1] - bw / 2 + 4), f1(bh), f1(bw)) + table(392, 744, Y2, "") + S.piel + h.huesos.craneo() + extra +
    pto(h.mae) + txt(f1(h.mae[0] + 10), f1(h.mae[1] + 16), "MAE", 11, BLUE) +
    cross(f1(p[0]), f1(p[1])) +
    note(f1(p[0] + 8), f1(p[1] - 12), 560, 60, rcTxt, RED) +
    txt(400, 300, riTxt, 11, INK) + sep(380) + vista("Desde el tubo", 392);
  return svg(panel1 + panel2);
}
const crTraumaLat = () => traumaLat({
  punto: [0, -50], rcTxt: ["RC horizontal ⟂ al RI", "≈5 cm por encima del MAE"],
  riTxt: "RI 24 × 30 · parrilla · DFRI 100 cm · todo el cráneo",
});

// ---------- traumatismo: AP y AP axiales (tres paneles) ----------
function crTraumaAP() {
  const Y = 262, s = 0.42;
  const panel = (i, titulo, rc, ang, labelA, lineas) => {
    const x0 = i * 253;
    const S = escenaSupino(s, -90, x0 + 100, Y, x0 + 246), h = S.h;
    const p = rc.p(h), dir = 90 + ang;
    const R = rayo(h, p, dir, { len: ang > 0 ? 92 : 78, ref: 90, angLabel: labelA, hasta: hastaY(Y + 22), entrada: false });
    const hit = hastaY(Y + 15)(p, dir);
    return (i ? sep(x0) : "") + table(x0 + 12, x0 + 244, Y, "") + E.ri(f1(hit[0] - 40), Y + 15, 80, 8) + S.piel + h.huesos.craneo(0.3) +
      linRef(h.mae, h.P("canto"), h.mae[1] - Y, 30, "") + txt(f1(h.mae[0] + 7), f1(h.P("canto")[1] - 20), "LOM", 11.5, BLUE, "start", 700) +
      R.svg + pto(p, RED, 3) +
      lineas.map((l, k) => txt(x0 + 14, 40 + k * 14, l, k ? 11 : 12, k ? INK : RED, "start", k ? 400 : 700)).join("") +
      vista(titulo, x0 + 12);
  };
  return svg(
    panel(0, "AP", { p: (h) => h.P("glabela") }, 0, null, ["RC paralelo a la LOM", "centrado en la glabela"]) +
    panel(1, "AP axial · Caldwell inversa", { p: (h) => h.P("nasion") }, 15, "15°", ["RC 15° cefálico a la LOM", "centrado en el nasión"]) +
    panel(2, "AP axial · Towne", { p: (h) => h.T([85, -79]) }, -30, "30°", ["RC 30° caudal a la LOM", "5-6 cm sobre la glabela"]) +
    txt(14, 318, "Decúbito supino · sin mover la cabeza ni quitar el collarín · RI 24 × 30 vertical (Bucky) centrado en el RC proyectado · DFRI 100 cm", 10.5, MUTE)
  );
}

// ---------- HUESOS FACIALES ----------
const facLateral = () => vistaTubo({
  mae: [210, 160], punto: [39, 0], box: [-55, -120, 135, 120], col: [-20, -70, 118, 108],
  lineas: ["RC perpendicular al RI, en el malar", "a mitad de camino entre MAE y canto externo"],
  ri: "RI 18 × 24 vertical · parrilla · DFRI 100 cm",
  huesos: (h) => h.huesos.cigoma() + h.huesos.mandibula(0.45) + h.huesos.orbita(),
  extras: "",
  notas: rotulo(470, 120, ["LIOM paralela a los bordes", "superior e inferior del RI"], BLUE) +
    rotulo(470, 170, ["Lado de interés contra el RI", "PMS paralelo · LIP ⟂ al RI"], INK) +
    txt(470, 220, "Colimar a los huesos faciales", 11.5, AMB) + txt(470, 236, "Apnea", 11.5, MUTE),
});
// marca del canto externo en las vistas desde el tubo
function watersPanel(x0, X, rot, linea, nomLin, angTxt, titulo, lineas, notaX, notaY = 250) {
  const s = 0.56, my = 150;
  return paPanel({
    x0, X, my, s, rot, titulo, lineas, riTxt: 1, notaY, notaX, huesos: (h) => h.huesos.craneo(0.3) + h.huesos.senos(),
    rayos: [{ por: "acantion", dir: 0 }],
    refl: [(h) => linRef(h.mae, h.P(linea), 30, (X - h.P(linea)[0]) + 10, nomLin, "inicio", -16, 4), (h) => linRef(h.mae, h.P("canto"), 20, 0, "")],
    arcos: (h) => {
      const v = hastaX(X)(h.mae, rot), lm = h.P(linea);
      return (rot < -45 ? arco(v, 90, rot + 180, 34, angTxt) : arco(v, -90, rot, 30, angTxt, BLUE, 12) + E.refline(f1(v[0]), f1(v[1]), f1(add(v, rot, 40)[0]), f1(add(v, rot, 40)[1]))) + recto([X, lm[1]], 180, -90, 8) + txt(f1(v[0] - 10), f1(v[1] - 8), "LOM", 11.5, BLUE, "end", 700) +
        E.refline(f1(h.mae[0]), f1(h.mae[1]), f1(v[0]), f1(v[1]));
    },
    extra: (h) => rot2(h.P("acantion"), X - 30, h.P("acantion")[1] + 50, "acantión", RED, "end"),
  });
}
const facWaters = () => svg(
  watersPanel(0, 330, -53, "menton", "LMM", "37°", "Waters", ["RC ⟂ al RI, sale por el acantión", "LMM ⟂ al RI → LOM a 37° del RI", "Cabeza extendida, apoyada en el mentón"]) + sep(380) +
  watersPanel(380, 710, -35, "comisura", "LLM", "55°", "Waters modificada", ["RC ⟂ al RI, sale por el acantión", "LLM ⟂ al RI → LOM a 55° del RI", "(LLM: comisura de los labios-MAE)"]) +
  txt(394, 322, "RI 18 × 24 o 24 × 30 vert. · parrilla · DFRI 100 cm", 10, MUTE)
);
const facCaldwell = () => svg(
  paPanel({ x0: 60, X: 420, s: 0.62, my: 150, titulo: "Vista lateral · sentado frente al RI", rayos: [{ por: "nasion", dir: 15, ang: "15°" }], len: 110,
    refl: [LOMr()], arcos: (h) => recto([420, h.mae[1]], 180, -90, 9), huesos: (h) => h.huesos.craneo(0.3) + h.huesos.orbita() + h.huesos.senos(),
    lineas: ["RC 15° caudal respecto de la LOM", "sale por el nasión"], notaX: 480, notaY: 60, riTxt: 1,
    extra: (h) => rot2(h.P("nasion"), h.P("nasion")[0] - 34, h.P("nasion")[1] - 56, "nasión", RED, "middle") }) +
  rotulo(480, 120, ["Frente y nariz apoyadas", "LOM ⟂ al RI · sin rotación ni inclinación"], BLUE) +
  rotulo(480, 180, ["Bordes inferiores de las órbitas:", "30° (crestas petrosas por debajo)"], MUTE) +
  txt(480, 300, "RI 18 × 24 o 24 × 30 vertical · parrilla", 11, INK) + txt(480, 315, "DFRI 100 cm · apnea", 11, INK)
);
const facTraumaLat = () => traumaLat({
  punto: [39, 0], rcTxt: ["RC horizontal", "entre canto externo y MAE"], boxW: 240, boxH: 180,
  riTxt: "RI 18 × 24 vertical, parrilla de canto contra el cráneo",
});
function watersInv(x0, lm, nom, titulo, lineas) {
  const Y = 262, s = 0.5, rot = -108;
  const S = escenaSupino(s, rot, x0 + 120, Y, x0 + 372), h = S.h;
  const L = h.P(lm), a = h.mae, ac = h.P("acantion");
  const dir = angOf(L, a);
  const R = rayo(h, ac, dir, { len: 92, hasta: hastaY(Y + 22), entrada: false });
  const hit = hastaY(Y + 15)(ac, dir), rx = Math.max(x0 + 14, hit[0] - 45);
  return (x0 ? sep(x0, 290) : "") + table(x0 + 14, x0 + 372, Y, "") + E.ri(f1(rx), Y + 15, 90, 8) + S.piel + h.huesos.craneo(0.3) + h.huesos.senos() +
    linRef(a, L, 10, 60, nom, "fin", 10, -6) + pto(a) + R.svg + pto(ac, RED, 3) +
    lineas.map((l, k) => txt(x0 + 200, 50 + k * 15, l, k ? 11.5 : 12.5, k ? INK : RED, "start", k ? 400 : 700)).join("") +
    rot2(ac, f1(ac[0] - 34), f1(ac[1] - 22), "acantión", RED, "end") + vista(titulo, x0 + 12);
}
const facTraumaWatersInv = () => svg(
  watersInv(0, "menton", "LMM", "Waters inversa", ["RC paralelo a la LMM", "centrado en el acantión", "(cefálico si hace falta*)"]) +
  watersInv(380, "comisura", "LLM", "Waters inversa modificada", ["RC paralelo a la LLM", "centrado en el acantión"]) +
  txt(14, 314, "Decúbito supino, sin mover la cabeza ni quitar el collarín · PMS ⟂ al RI · RI 18 × 24 vertical (Bucky)", 10.5, MUTE) +
  txt(14, 327, "* salvo que ya se haya descartado una lesión cervical", 10.5, MUTE)
);

// ---------- AGUJEROS ÓPTICOS ----------
function rhese() {
  const lam = angOf([0, 0], LM.acantion);
  const izq = paPanel({ x0: 0, X: 330, s: 0.56, my: 140, rot: -lam, titulo: "Lateral · frente al RI",
    rayos: [{ por: "orbinf", dir: 0 }], huesos: (h) => h.huesos.craneo(0.3) + h.huesos.orbita(),
    refl: [(h) => linRef(h.mae, h.P("acantion"), 26, 330 - h.P("acantion")[0] + 12, "LAM", "inicio", -16, 4)],
    arcos: (h) => recto([330, h.P("acantion")[1]], 180, -90, 8),
    lineas: ["RC ⟂ al RI, en la parte inferior", "de la órbita que queda abajo", "LAM ⟂ al RI"], notaY: 252,
    extra: (h) => rot2(h.P("orbinf"), h.P("orbinf")[0] - 20, h.P("orbinf")[1] - 44, "órbita", RED, "middle") });
  // desde arriba
  const X = 700, s = 0.82, rot = 37, c = [X - 74 * s, 168];
  const A = cabezaArriba(c, s, rot);
  const ojos = [[72, 30], [72, -30]].map((p) => A.T(p));
  const abajo = ojos[0][0] > ojos[1][0] ? ojos[0] : ojos[1];
  const ts = cortes(A.skin, abajo, 0), e = add(abajo, 0, ts[0]);
  const pR = hastaX(X)(c, rot);
  const der = sep(380) + E.ri(X, 50, 8, 230) + txt(X + 12, 270, "RI", 11.5, INK) +
    `<path d="${A.d}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` + A.orejas +
    ojos.map((o) => `<ellipse cx="${f1(o[0])}" cy="${f1(o[1])}" rx="7" ry="4" transform="rotate(${rot} ${f1(o[0])} ${f1(o[1])})" fill="${SKO}"/>`).join("") +
    E.refline(f1(c[0] - 80 * s * Math.cos(rot * D)), f1(c[1] - 80 * s * Math.sin(rot * D)), f1(pR[0]), f1(pR[1])) +
    txt(f1(c[0] - 80 * s * Math.cos(rot * D) - 4), f1(c[1] - 80 * s * Math.sin(rot * D) - 6), "PMS", 11.5, BLUE, "end", 700) +
    arco(pR, -90, rot + 180, 40, "53°") +
    beam(f1(e[0]), f1(e[1]), 0, 110, { ref: 0 }) + `<line x1="${f1(e[0])}" y1="${f1(e[1])}" x2="${X}" y2="${f1(e[1])}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    pto(abajo, RED, 3.4) + txt(400, 262, "Nariz, mejilla y mentón apoyados", 11.5, INK) + txt(400, 277, "PMS a 53° del RI (medidor de ángulos)", 11.5, BLUE) +
    txt(400, 300, "RI 18 × 24 horizontal · parrilla · DFRI 100 cm", 10.5, MUTE) + txt(400, 314, "Colimar a un cuadrado de 8-10 cm · ambos lados", 10.5, AMB) +
    vista("Desde arriba", 392);
  return svg(izq + der);
}

// ---------- ARCOS CIGOMÁTICOS ----------
const arcosSMV = () => smvBase({
  c: 40, cig: true,
  lineas: ["RC perpendicular a la LIOM", "a mitad de camino entre los arcos"],
  entradaTxt: ["Entra ≈4 cm por debajo", "de la sínfisis mandibular"],
  riTxt: "RI 24 × 30 horizontal · parrilla · DFRI 100 cm",
  notas: txt(430, 210, "Colimar a la zona de los arcos", 11.5, AMB) + txt(430, 228, "Sin rotación ni inclinación · apnea", 11.5, MUTE),
});
function arcosTang() {
  const izq = smvMini(70, 0.48, 40);
  const c = [592, 168], s = 0.82, rot = -90 - 15;
  const A = cabezaArriba(c, s, rot);
  const pms = (r, L) => [c, add(c, r, L * s)];
  const [a0, b0] = pms(-90, 112), [a1, b1] = pms(rot, 112);
  const arcoP = A.T([30, -70]);
  const der = sep(380) + riTop(470, 54, 244, 230) +
    `<path d="${A.d}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` + A.orejas +
    `<line x1="${f1(a0[0])}" y1="${f1(a0[1] + 100 * s)}" x2="${f1(b0[0])}" y2="${f1(b0[1])}" stroke="${MUTE}" stroke-width="1.2" stroke-dasharray="3 4"/>` +
    E.refline(f1(c[0] - (b1[0] - c[0])), f1(c[1] - (b1[1] - c[1])), f1(b1[0]), f1(b1[1])) + txt(f1(b1[0] - 6), f1(b1[1] - 6), "PMS", 11.5, BLUE, "end", 700) +
    arco(c, -90, rot, 70, "15°") +
    cross(f1(arcoP[0]), f1(arcoP[1])) + rot2(arcoP, 440, 100, "arco estudiado", RED, "middle") +
    txt(400, 300, "Rotar 15° e inclinar el PMS 15° hacia el lado estudiado", 10.5, INK) +
    txt(400, 314, "RI 18 × 24 vertical · parrilla · DFRI 100 cm · ambos lados", 10.5, MUTE) +
    vista("Desde el tubo (bajo el mentón)", 392);
  return svg(izq + der);
}
const arcosTowne = () => towneBase({
  entradaLocal: [98, -35], cig: true,
  lineas: ["RC 30° caudal respecto de la LOM", "(o 37° respecto de la LIOM)"],
  entradaTxt: ["Entra 2,5 cm por encima del nasión", "pasa por la parte media de los arcos"],
  ri: "RI 18 × 24 horizontal · parrilla · DFRI 100 cm",
});

// ---------- HUESOS NASALES ----------
const nasLateral = () => vistaTubo({
  mae: [190, 160], punto: [99, 1], box: [-21, -90, 219, 90], col: [49, -49, 149, 51],
  lineas: ["RC perpendicular al RI", "≈1,25 cm por debajo del nasión"],
  ri: "RI 18 × 24 horizontal · sin parrilla · DFRI 100 cm",
  huesos: (h) => h.huesos.craneo(0.25) + h.huesos.nasal(),
  extras: "",
  notas: rotulo(470, 120, ["LIOM paralela a los bordes", "superior e inferior del RI"], BLUE) +
    rotulo(470, 170, ["Lateral verdadera: LIP ⟂ al RI", "y PMS paralelo"], INK) +
    txt(470, 220, "Colimar a un cuadrado de ≈10 cm", 11.5, AMB) + txt(470, 236, "Hacer las dos laterales", 11.5, MUTE),
});
function nasSI() {
  const lga = angOf(LM.glabela, LM.alveolar);
  const s = 0.62, Sc = escenaErguido(s, 90 - lga, null, 168, 318, 250), h = Sc.h;
  const g = h.P("glabela"), m = h.P("menton"), al = h.P("alveolar");
  const riY = m[1] + 2;
  const px = g[0] + 3;
  const R = rayo(h, [px, g[1] - 4], 90, { len: 84, hasta: hastaY(riY), entrada: false });
  return svg(
    table(m[0] - 6, 456, riY + 8, "Mesa") + Sc.piel + h.huesos.craneo(0.25) + h.huesos.nasal() +
    E.ri(f1(m[0] - 30), f1(riY), 170, 8) + txt(f1(m[0] + 150), f1(riY - 6), "RI", 11.5, INK) +
    linRef(g, al, 40, riY - al[1], "LGA", "inicio", -22, 14) + recto([g[0], riY], -90, 180, 8) +
    R.svg + pto(g, RED, 3) +
    note(f1(px + 4), f1(g[1] - 40), 470, 60, ["RC paralelo a la LGA, ⟂ al RI", "tangencial a la glabela"], RED) +
    note(f1(g[0] - 2), f1(g[1] + 50), 470, 130, ["LGA (glabela-alveolar) ⟂ al RI", "mentón extendido sobre el RI"], BLUE) +
    txt(470, 190, "Sentado en el extremo de la mesa", 11.5, MUTE) + txt(470, 205, "(o prono con apoyos)", 11.5, MUTE) +
    txt(470, 300, "RI 18 × 24 horizontal · sin parrilla", 11.5, INK) + txt(470, 315, "Colimar a ≈10 cm · DFRI 100 cm", 11.5, INK) +
    vista("Vista lateral · sentado")
  );
}

// ---------- MANDÍBULA ----------
function mandPA() {
  const comun = { refl: [LOMr()], huesos: (h) => h.huesos.craneo(0.25) + h.huesos.mandibula(0.6), riTxt: 1 };
  return svg(
    paPanel({ ...comun, x0: 0, X: 330, arcos: (h) => recto([330, h.mae[1]], 180, -90, 9), titulo: "PA", rayos: [{ por: "labios", dir: 0 }],
      lineas: ["RC ⟂ al RI", "sale a la altura de la unión de los labios", "LOM ⟂ al RI · PMS ⟂ al RI"],
      extra: (h) => rot2(h.P("labios"), h.P("labios")[0] - 30, h.P("labios")[1] + 50, "labios", RED, "middle") }) + sep(380) +
    paPanel({ ...comun, x0: 380, X: 710, arcos: (h) => recto([710, h.mae[1]], 180, -90, 9), titulo: "PA axial (opcional)", rayos: [{ por: "acantion", dir: -22.5, ang: "20-25°" }],
      lineas: ["RC 20-25° cefálico", "sale por el acantión", "mejor ramas y cóndilos"],
      extra: (h) => rot2(h.P("acantion"), h.P("acantion")[0] - 30, h.P("acantion")[1] + 60, "acantión", RED, "middle") }) +
    txt(394, 300, "RI 18 × 24 o 24 × 30 vertical", 11, MUTE) + txt(394, 314, "parrilla · DFRI 100 cm", 11, MUTE)
  );
}
// vista de frente con el RI contra el lado derecho de la imagen
function frenteRI(cx, cy, r, { riTop: t = 50, riBot } = {}) {
  const X = cx + r * 1.14;
  return { X, svg: frente(cx, cy, r) + E.ri(f1(X), t, 8, f1((riBot ?? cy + r * 1.3) - t)) };
}
function mandAxio() {
  const cx = 200, cy = 118, r = 52, F = frenteRI(cx, cy, r);
  const t = [cx + r * 0.58, cy + r * 0.86];
  const R = beam(f1(t[0]), f1(t[1]), -25, 128, { ref: 0, angLabel: "25°" }) + `<line x1="${f1(t[0])}" y1="${f1(t[1])}" x2="${f1(F.X)}" y2="${f1(t[1] - (F.X - t[0]) * Math.tan(25 * D))}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
  const eyeY = cy - r * 0.12;
  const izq = F.svg + mandFrente(cx, cy, r) +
    E.refline(cx - r * 1.3, f1(eyeY), F.X, f1(eyeY)) + txt(cx - r * 1.34, f1(eyeY + 4), "LIP", 11.5, BLUE, "end", 700) + recto([F.X, eyeY], 180, 90, 8) +
    R + pto(t, RED, 3) +
    txt(F.X + 14, 70, "RI", 11.5, INK) +
    rotulo(14, 276, ["RC 25° cefálico respecto de la LIP", "a la parte media de la mandíbula de abajo", "(≈5 cm debajo del ángulo del lado de arriba)"], RED) +
    vista("De frente · lado de interés contra el RI");
  // desde arriba: rotación según la zona
  const c = [590, 176], s = 0.72, A = cabezaArriba(c, s, -90), XR = c[0] + 76 * s;
  const fan = [[-90, "0°: rama"], [-77.5, "10-15°: general"], [-60, "30°: cuerpo"], [-45, "45°: mentón"]];
  const der = sep(392) + `<path d="${A.d}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` + A.orejas +
    fan.map(([a, l], i) => { const q = add(c, a, 134); return `<line x1="${c[0]}" y1="${c[1]}" x2="${f1(q[0])}" y2="${f1(q[1])}" stroke="${BLUE}" stroke-width="${i ? 1.3 : 2.2}" stroke-dasharray="${i ? "4 4" : "6 5"}"/>` + txt(f1(q[0] + (i ? 4 : 0)), f1(q[1] - 5), l, 11, BLUE, i ? "start" : "middle", 700); }).join("") + E.ri(f1(XR), 96, 8, 170) + txt(f1(XR + 12), 262, "RI", 11.5, INK) +
    txt(404, 290, "Rotar la cabeza hacia el RI según la zona", 11, INK) + txt(404, 304, "LIP ⟂ al RI, mentón extendido, sin inclinación", 11, INK) +
    txt(404, 320, "RI 18 × 24 o 24 × 30 horizontal · DFRI 100 cm", 10.5, MUTE) +
    vista("Desde arriba", 404);
  return svg(izq + der);
}
function mandAxioTrauma() {
  const cx = 210, cy = 112, r = 50, F = frenteRI(cx, cy, r);
  const t = [cx - r * 0.78, cy + r * 0.62 + 30];
  const R = beam(f1(t[0]), f1(t[1]), -25, 110, { ref: 0, angLabel: "25°" }) + `<line x1="${f1(t[0])}" y1="${f1(t[1])}" x2="${f1(F.X)}" y2="${f1(t[1] - (F.X - t[0]) * Math.tan(25 * D))}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
  const izq = F.svg + mandFrente(cx, cy, r) + R + pto(t, RED, 3) + txt(F.X + 14, 70, "RI de canto", 11.5, INK) +
    txt(F.X + 14, 84, "∥ al PMS", 11.5, INK) +
    rotulo(14, 268, ["Haz horizontal, 25° cefálico", "≈5 cm distal al ángulo del lado alejado"], RED) +
    txt(14, 304, "PMS ⟂ al tablero, sin rotar la cabeza", 11, INK) + txt(14, 318, "Bajar hombros; mentón extendido si se puede", 11, INK) +
    vista("Desde arriba · decúbito supino");
  const Y = 250, s = 0.8, c = [560, Y - 96 * s], A = cabezaArriba(c, s, -90), XR = c[0] + 76 * s;
  const lat = [c[0] - 72 * s, c[1] - 10];
  const der = sep(392) + table(404, XR + 30, Y, "") + `<path d="${A.d}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` + A.orejas +
    E.ri(f1(XR), Y - 170, 8, 168) +
    beam(f1(lat[0]), f1(lat[1]), 7.5, 130, { ref: 0, angLabel: "<tspan></tspan>" }) + txt(f1(lat[0] - 70), f1(lat[1] - 18), "5-10°", 13, RED, "middle", 700) +
    `<line x1="${f1(lat[0])}" y1="${f1(lat[1])}" x2="${f1(XR)}" y2="${f1(lat[1] + (XR - lat[0]) * Math.tan(7.5 * D))}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    txt(f1(c[0] + 14), f1(c[1] - 86), "nariz", 10.5, MUTE) +
    rotulo(404, 278, ["Además 5-10° hacia abajo (posterior)", "para que no se superponga el hombro"], RED) +
    txt(404, 318, "RI 18 × 24 o 24 × 30 horizontal · DFRI 100 cm", 10.5, MUTE) +
    vista("Desde los pies", 404);
  return svg(izq + der);
}
const mandAPaxial = () => towneBase({
  ang: 35, entradaLocal: LM.glabela, mand: true,
  lineas: ["RC 35° caudal respecto de la LOM", "(42° si la LIOM queda ⟂ al RI)"],
  entradaTxt: ["Centrado en la glabela (mandíbula)", "ATM: 2,5 cm por encima de la glabela"],
  ri: "RI 18 × 24 o 24 × 30 horizontal · parrilla · DFRI 100 cm",
  notaLOM: ["Mentón bajo:", "LOM ⟂ al RI si se puede"],
});

// ---------- ATM ----------
function atmFrente(ang, label, sobre, lineas) {
  const cx = 220, cy = 128, r = 52, F = frenteRI(cx, cy, r);
  const mae = [cx - r * 0.98, cy], e = [mae[0] + 6, cy - sobre];
  const end = [F.X, e[1] + (F.X - e[0]) * Math.tan(ang * D)];
  return F.svg + mandFrente(cx, cy, r) +
    beam(f1(e[0]), f1(e[1]), ang, 120, { ref: 0, angLabel: label }) + `<line x1="${f1(e[0])}" y1="${f1(e[1])}" x2="${f1(end[0])}" y2="${f1(end[1])}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    pto(e, RED, 3) + pto(mae, BLUE, 3.2) + txt(f1(mae[0] - 14), f1(mae[1] + 26), "MAE de arriba", 10.5, BLUE, "end") +
    `<line x1="${f1(mae[0] - 10)}" y1="${f1(e[1])}" x2="${f1(mae[0] - 10)}" y2="${f1(mae[1])}" stroke="${BLUE}" stroke-width="1.2"/>` +
    txt(f1(F.X + 14), 70, "RI", 11.5, INK) + txt(f1(F.X + 14), f1(cy + 40), "lado afectado", 10.5, INK) +
    rotulo(14, 274, lineas, RED) + vista("De frente · lado afectado contra el RI");
}
function atmLaw() {
  const izq = atmFrente(15, "15°", 30, ["RC 15° caudal", "entra 4 cm por encima del MAE de arriba"]);
  const X = 690, s = 0.78, rot = -75, c = [X - 70 * s, 170], A = cabezaArriba(c, s, rot);
  const tip = add(c, rot, 118), tip0 = add(c, -90, 118);
  const der = sep(392) + E.ri(X, 60, 8, 230) + txt(X + 12, 286, "RI", 11.5, INK) + `<path d="${A.d}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` + A.orejas +
    `<line x1="${c[0]}" y1="${f1(c[1] + 90 * s)}" x2="${f1(tip0[0])}" y2="${f1(tip0[1])}" stroke="${MUTE}" stroke-width="1.2" stroke-dasharray="3 4"/>` +
    txt(f1(tip0[0] - 6), f1(tip0[1] + 4), "lateral", 10.5, MUTE, "end") +
    E.refline(f1(c[0] - (tip[0] - c[0]) * 0.8), f1(c[1] - (tip[1] - c[1]) * 0.8), f1(tip[0]), f1(tip[1])) + txt(f1(tip[0] + 6), f1(tip[1] + 4), "PMS", 11.5, BLUE, "start", 700) +
    arco(c, -90, rot, 80, "15°") +
    rotulo(404, 262, ["PMS girado 15° hacia el RI", "sin inclinación; LIP ⟂ al RI"], BLUE) +
    txt(404, 296, "LIOM ⟂ al borde anterior del RI", 11, INK) + txt(404, 310, "Boca cerrada y abierta en el mismo RI (18 × 24)", 10.5, MUTE) +
    vista("Desde arriba", 404);
  return svg(izq + der);
}
function atmSchuller() {
  const izq = atmFrente(27.5, "25-30°", 36, ["RC 25-30° caudal", "entra ≈5 cm por encima y 1-2 cm", "por delante del MAE de arriba"]);
  const s = 0.56, Sc = escenaErguido(s, -7, null, 150, 318, 520), h = Sc.h;
  const p = h.T([15, -50]);
  const der = sep(392) + riTop(430, 64, 200, 150) + Sc.piel + h.huesos.craneo(0.25) + h.huesos.mandibula(0.5) +
    linRef(h.mae, h.P("infraorb"), 40, 40, "LIOM", "fin", 20, 4) + pto(h.mae) + txt(f1(h.mae[0] - 4), f1(h.mae[1] + 20), "MAE", 11, BLUE, "end") +
    pto(p, RED, 4) + rot2(p, 650, 60, "entrada del RC", RED) +
    txt(650, 120, "Lateral verdadera,", 11, INK) + txt(650, 134, "sin rotación", 11, INK) +
    txt(650, 156, "LIOM ⟂ al borde", 11, BLUE) + txt(650, 170, "anterior del RI", 11, BLUE) +
    txt(650, 210, "Boca cerrada y", 11, MUTE) + txt(650, 224, "abierta en el mismo", 11, MUTE) + txt(650, 238, "RI (18 × 24 horiz.)", 11, MUTE) +
    vista("Desde el tubo", 404);
  return svg(izq + der);
}

// ---------- SENOS PARANASALES ----------
const senLateral = () => vistaTubo({
  mae: [210, 160], punto: [39, 0], box: [-51, -120, 129, 120], col: [10, -70, 110, 70],
  titulo: "Vista desde el tubo · sentado, erguido",
  lineas: ["RC horizontal (⟂ al RI)", "entre el MAE y el canto externo"],
  ri: "RI 18 × 24 vertical · parrilla · DFRI 100 cm",
  huesos: (h) => h.huesos.craneo(0.25) + h.huesos.senos(),
  notas: rotulo(470, 120, ["LIOM ⟂ al borde anterior del RI", "(levantar el mentón)"], BLUE) +
    rotulo(470, 170, ["PMS paralelo · LIP ⟂ al RI"], INK) +
    rotulo(470, 210, ["Erguido y RC horizontal:", "se ven los niveles hidroaéreos"], MUTE),
});
function senCaldwell() {
  const s = 0.56, rot = -15;
  // panel 1: RI inclinado 15°
  const S1 = escenaErguido(s, rot, 330, 150), h1 = S1.h;
  const n1 = h1.P("nasion"), Q = add(n1, rot, 8);
  const riDir = rot - 90; // hacia arriba-izquierda
  const hitRI = (p) => { // intersección del rayo horizontal por p con la recta del RI
    const ux = Math.cos(riDir * D), uy = Math.sin(riDir * D); const t = (p[1] - Q[1]) / uy; return [Q[0] + ux * t, p[1]];
  };
  const R1 = rayo(h1, n1, 0, { len: 96, ref: rot, angLabel: "<tspan></tspan>", hasta: (e) => hitRI(e) });
  const l1 = add(R1.e, 157, 70);
  const p1 = S1.piel + h1.huesos.craneo(0.25) + h1.huesos.senos() + riBar(add(Q, riDir, 10), 210, riDir) +
    linRef(h1.mae, h1.P("canto"), 24, Math.hypot(Q[0] - h1.P("canto")[0], Q[1] - h1.P("canto")[1]), "LOM", "inicio", -14, 4) + recto(Q, rot + 180, riDir, 8) +
    R1.svg + pto(n1, RED, 3.2) + txt(f1(l1[0]), f1(l1[1] + 8), "15°", 13, RED, "middle", 700) +
    rotulo(14, 246, ["RI inclinado 15° (arriba hacia el paciente)", "LOM ⟂ al RI · RC horizontal", "sale por el nasión"], RED) +
    vista("PA de Caldwell");
  // panel 2: RI vertical, cabeza inclinada atrás
  const X = 712, S2 = escenaErguido(s, rot, X - 2, 150), h2 = S2.h, n2 = h2.P("nasion");
  const R2 = rayo(h2, n2, 0, { len: 96, hasta: hastaX(X) });
  const m = h2.mae, k = hastaX(X)(m, rot);
  const p2 = sep(380) + S2.piel + h2.huesos.craneo(0.25) + h2.huesos.senos() + E.ri(X, 40, 8, 210) +
    E.refline(f1(m[0]), f1(m[1]), f1(k[0]), f1(k[1])) + txt(f1(m[0] - 8), f1(m[1] + 4), "LOM", 11.5, BLUE, "end", 700) +
    `<line x1="${f1(m[0])}" y1="${f1(m[1])}" x2="${X}" y2="${f1(m[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    arco(m, 0, rot, 48, "") + txt(f1(m[0] + 40), f1(m[1] + 16), "15°", 12.5, BLUE, "middle", 700) + R2.svg + pto(n2, RED, 3.2) +
    rotulo(394, 246, ["Soporte fijo: inclinar la cabeza atrás", "LOM a 15° de la horizontal", "RC horizontal, sale por el nasión"], RED) +
    vista("Caldwell modificada", 392);
  return svg(p1 + p2 + txt(14, 300, "RI 18 × 24 vertical · parrilla", 11, MUTE) + txt(14, 314, "DFRI 100 cm · siempre erguido", 11, MUTE));
}
const senWaters = () => svg(
  watersPanel(40, 400, -53, "menton", "LMM", "37°", "Vista lateral · sentado erguido", ["RC horizontal ⟂ al RI", "sale por el acantión"], 470, 60) +
  rotulo(470, 110, ["Mentón extendido contra el RI", "LMM ⟂ al RI → LOM a 37° del RI", "PMS ⟂ al soporte, sin rotación"], BLUE) +
  rotulo(470, 175, ["Opción boca abierta: senos", "esfenoidales a través de la boca"], MUTE) +
  rotulo(470, 225, ["Erguido y RC horizontal:", "niveles hidroaéreos"], MUTE) +
  txt(470, 300, "RI 18 × 24 o 24 × 30 vertical", 11, INK) + txt(470, 315, "parrilla · DFRI 100 cm", 11, INK)
);
const senSMV = () => smvBase({
  c: 35,
  lineas: ["RC horizontal, ⟂ a la LIOM", "entre los ángulos de la mandíbula"],
  entradaTxt: ["Entra 4-5 cm por debajo", "de la sínfisis mandibular"],
  riTxt: "RI 18 × 24 o 24 × 30 vertical · parrilla · DFRI 100 cm",
  titulo: "Vista lateral · sentado erguido, reclinado",
  notas: rotulo(430, 200, ["LIOM lo más paralela posible al RI", "sin rotación ni inclinación"], MUTE) + rotulo(430, 245, ["Erguido y RC horizontal:", "niveles hidroaéreos"], MUTE),
});

// SMV compacto (panel izquierdo de la tangencial)
function smvMini(X, s, c) {
  const my = 150, rot = -97;
  const h = ubicar(s, rot, "izquierda", X + 9, my, true);
  const A = h.T([-48, 106]), B = h.T([22, 106]);
  const N = [B[0] + 40 * s, B[1] + 100 * s];
  const cuello = poly([A, B, [N[0] + 26 * s, N[1] - 8 * s], [N[0] - 34 * s, N[1] - 14 * s]]);
  const p = h.T([c * Math.cos(7 * D), c * Math.sin(7 * D)]);
  const R = rayo(h, p, 180, { len: 96, ref: 180, hasta: hastaX(X + 8) });
  const a = h.mae, b = h.P("infraorb");
  return E.ri(X, 60, 8, 180) + pielU(troncoErguido(N, s, 318, -24), cuello, h.d) + h.cara + h.huesos.craneo() + h.huesos.cigoma(0.75) +
    linRef(a, b, 60, 50, "LIOM", "fin", 0, -8) + txt(f1(b[0] + 12), f1(b[1] - 40), "∥ RI", 11, BLUE, "start", 700) +
    R.svg + pto(p, RED, 3) +
    rotulo(14, 262, ["RC ⟂ a la LIOM, en la parte", "media del arco cigomático"], RED) +
    txt(14, 300, "Como una SMV: LIOM paralela al RI", 11, INK) +
    vista("Lateral · como SMV");
}

module.exports = {
  "craneo-ap-axial-towne": crTowne,
  "craneo-lateral": crLateral,
  "craneo-pa-caldwell": crCaldwell,
  "craneo-smv": crSMV,
  "craneo-trauma-lateral": crTraumaLat,
  "craneo-trauma-ap-axial": crTraumaAP,
  "faciales-lateral": facLateral,
  "faciales-pa-axial-caldwell": facCaldwell,
  "faciales-trauma-lateral": facTraumaLat,
  "faciales-trauma-waters-inversa": facTraumaWatersInv,
  "agujeros-opticos-rhese": rhese,
  "arcos-smv": arcosSMV,
  "arcos-tangencial": arcosTang,
  "arcos-ap-axial-towne": arcosTowne,
  "nasales-lateral": nasLateral,
  "nasales-superoinferior": nasSI,
  "mandibula-pa": mandPA,
  "mandibula-axiolateral": mandAxio,
  "mandibula-axiolateral-trauma": mandAxioTrauma,
  "mandibula-ap-axial": mandAPaxial,
  "senos-lateral": senLateral,
  "senos-parietoacantial-waters": senWaters,
  "senos-smv": senSMV,
};

// ======================= fichas con versiones: un esquema por versión =======================
const col = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");

// ---- Waters / Waters modificada ----
const facWatersV = (mod) => svg(
  (mod ? watersPanel(40, 400, -35, "comisura", "LLM", "55°", "Waters modificada · vista lateral", ["RC ⟂ al RI, sale por el acantión"], 470, 60)
    : watersPanel(40, 400, -53, "menton", "LMM", "37°", "Waters · vista lateral", ["RC ⟂ al RI, sale por el acantión"], 470, 60)) +
  col(470, 100, mod ? [["LLM ⟂ al RI → LOM a 55° del RI", BLUE, 700], ["(LLM: comisura de los labios-MAE)", INK]]
    : [["LMM ⟂ al RI → LOM a 37° del RI", BLUE, 700], ["Cabeza extendida, apoyada en el mentón", INK]]) +
  col(470, 150, [["Sentado erguido (se prefiere)", INK], ["o en decúbito prono sobre la mesa", INK], ["RI centrado en el RC", INK]]) +
  col(470, 280, [["RI 18 × 24 o 24 × 30 vertical", MUTE, 400, 11], ["parrilla · DFRI 100 cm", MUTE, 400, 11]])
);

// ---- Waters con cabeza y cráneo anatómicos (anatomia.cjs): perfil sentado, mentón en el RI vertical ----
// La geometría de la cabeza cumple LMM-LOM = 53° y LLM-LOM = 35°: con la LMM (o la LLM) ⟂ al RI, la LOM queda a 37° (o 55°).
function watersAnat(mod) {
  const A = require("./anatomia.cjs");
  const linea = mod ? "comisura" : "menton", nom = mod ? "LLM" : "LMM", angTxt = mod ? "55°" : "37°";
  const sc = 6.6, XRI = 396; // escala (px por cm) y cara del RI
  // extensión del cuello para que la línea elegida quede horizontal (⟂ al RI vertical)
  const P0 = A.CAB.puntos, ext = Math.atan2(P0[linea][1], P0[linea][0]) * 180 / Math.PI;
  const prueba = A.figuraPerfil({ T: A.X({ s: sc }), cabeza: ext, sinPiernas: true, sinBrazo: true });
  // el mentón (o la nariz) toca el RI: punto de la cabeza más adelantado
  const xmax = Math.max(...prueba.cab.piel.map((p) => p[0]));
  const dx = XRI - 1 - xmax, dy = 196 - prueba.P.mae[1];
  const T = A.X({ s: sc, at: [dx, dy] });
  const F = A.figuraPerfil({ T, cabeza: ext, sinPiernas: true, sinBrazo: true });
  const P = F.P, mae = P.mae, L = P[linea], can = P.canto, ac = P.acantion;
  // LOM prolongada hasta el RI y ángulo con el RI
  const k = (XRI - mae[0]) / (can[0] - mae[0]), v = [XRI, mae[1] + (can[1] - mae[1]) * k];
  const angLOM = Math.atan2(can[1] - mae[1], can[0] - mae[0]) * 180 / Math.PI; // grados SVG (negativo = hacia arriba)
  const entrada = Math.min(...F.cab.piel.filter((p) => Math.abs(p[1] - ac[1]) < 12).map((p) => p[0]));
  const clip = `<clipPath id="cpWA${mod ? 2 : 1}"><rect x="0" y="28" width="${XRI}" height="300"/></clipPath>`;
  const arcoR = 52, a0 = 90, a1 = angLOM + 180; // entre el RI (hacia abajo) y la LOM (hacia el MAE)
  const pA = (a) => [v[0] + arcoR * Math.cos(a * D), v[1] + arcoR * Math.sin(a * D)];
  const [q0, q1] = [pA(a0), pA(a1)], am = (a0 + a1) / 2, qm = pA(am);
  const arcoSvg = `<path d="M${f1(q0[0])},${f1(q0[1])} A${arcoR},${arcoR} 0 0 1 ${f1(q1[0])},${f1(q1[1])}" fill="none" stroke="${BLUE}" stroke-width="1.8"/>` +
    txt(f1(v[0] + (arcoR + 18) * Math.cos(am * D)), f1(v[1] + (arcoR + 18) * Math.sin(am * D) + 5), angTxt, 13, BLUE, "middle", 700);
  return svg(
    `<text x="80" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${(mod ? "Waters modificada" : "Waters").toUpperCase()} · VISTA LATERAL · SENTADO</text>` +
    clip + `<g clip-path="url(#cpWA${mod ? 2 : 1})">` + F.atras + F.cuerpo + F.cabHuesos + F.frente + F.cara + `</g>` +
    `<rect x="${XRI}" y="30" width="9" height="${f1(Math.max(250, L[1] + 70) - 30)}" fill="${INK}"/>` + txt(XRI + 14, f1(Math.max(250, L[1] + 70) - 4), "RI", 12, INK) +
    E.refline(f1(mae[0] - 20), f1(mae[1] - (can[1] - mae[1]) / (can[0] - mae[0]) * 20), f1(v[0]), f1(v[1])) + txt(f1(mae[0] + (v[0] - mae[0]) * 0.72 - 10), f1(mae[1] + (v[1] - mae[1]) * 0.72), "LOM", 11.5, BLUE, "end", 700) +
    E.refline(f1(mae[0] - 20), f1(L[1]), XRI, f1(L[1])) + txt(f1(mae[0] - 24), f1(L[1] + 4), nom, 11.5, BLUE, "end", 700) +
    `<path d="M${XRI - 9},${f1(L[1])} L${XRI - 9},${f1(L[1] - 9)} L${XRI},${f1(L[1] - 9)}" fill="none" stroke="${BLUE}" stroke-width="1.3"/>` +
    arcoSvg + dot(f1(mae[0]), f1(mae[1])) + dot(f1(L[0]), f1(L[1])) +
    beam(f1(entrada - 6), f1(ac[1]), 0, 150, { horizontal: true }) +
    `<line x1="${f1(entrada)}" y1="${f1(ac[1])}" x2="${XRI}" y2="${f1(ac[1])}" stroke="${RED}" stroke-width="1.6" stroke-dasharray="4 4"/>` +
    `<circle cx="${f1(ac[0])}" cy="${f1(ac[1])}" r="3.5" fill="${RED}"/>` +
    note(f1(ac[0] - 3), f1(ac[1] - 3), f1(ac[0] - 74), f1(ac[1] - 70), ["acantión"], RED, "end") +
    etiquetaHueso(f1(mae[0] + 6), f1(mae[1] + 22), "MAE") +
    col(470, 60, [["RC ⟂ al RI, sale por el acantión", RED, 700, 12.5]]) +
    col(470, 100, mod ? [[nom + " ⟂ al RI → LOM a 55° del RI", BLUE, 700], ["(LLM: comisura de los labios-MAE)", INK]]
      : [[nom + " ⟂ al RI → LOM a 37° del RI", BLUE, 700], ["Cabeza extendida, apoyada en el mentón", INK]]) +
    col(470, 150, [["Sentado erguido (se prefiere)", INK], ["o en decúbito prono sobre la mesa", INK], ["RI centrado en el RC", INK]]) +
    col(470, 280, [["RI 18 × 24 o 24 × 30 vertical", MUTE, 400, 11], ["parrilla · DFRI 100 cm", MUTE, 400, 11]])
  );
}

// ---- ATM (Law modificado y Schüller): boca cerrada / abierta, vista de frente ----
function atmV({ ang, label, sobre, rc, abierta, titulo, textos, ri: riTxt }) {
  const cx = 220, cy = 128, r = 52;
  let o = atmFrente(ang, label, sobre, rc).replace(vista("De frente · lado afectado contra el RI"), vista(titulo));
  if (abierta) {
    const cara = `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.92}" ry="${r * 1.12}"`;
    const boca = `<path d="M${cx - r * 0.25},${cy + r * 0.55} Q${cx},${cy + r * 0.68} ${cx + r * 0.25},${cy + r * 0.55}" fill="none" stroke="${SKO}" stroke-width="1.4"/>`;
    if (!o.includes(cara) || !o.includes(boca)) throw new Error("atmV: no encuentro la cara");
    o = o.replace(cara, `<ellipse cx="${cx}" cy="${f1(cy + r * 0.1)}" rx="${r * 0.92}" ry="${f1(r * 1.22)}"`)
      .replace(boca, `<ellipse cx="${cx}" cy="${f1(cy + r * 0.72)}" rx="${f1(r * 0.2)}" ry="${f1(r * 0.2)}" fill="#8a5d4b" stroke="${SKO}" stroke-width="1.4"/>`)
      .replace(mandFrente(cx, cy, r), `<g transform="translate(0 ${f1(r * 0.2)})">${mandFrente(cx, cy, r)}</g>`);
  }
  return svg(o +
    col(470, 60, [[abierta ? "Boca bien abierta" : "Boca cerrada", INK, 700, 12.5], [abierta ? "2.ª exposición, en la misma posición" : "1.ª exposición", INK]]) +
    col(470, 110, textos) + col(470, 290, [[riTxt, MUTE, 400, 11]]));
}
const lawTxt = [["Sentado erguido (se prefiere) o semidecúbito", INK], ["prono, lado afectado abajo", INK],
  ["PMS girado 15° hacia el RI, sin inclinación;", BLUE, 700], ["LIP ⟂ al RI", BLUE, 700], ["LIOM ⟂ al borde anterior del RI", INK]];
const schTxt = [["Sentado erguido o semidecúbito prono,", INK], ["lado afectado abajo", INK],
  ["Lateral verdadera, sin rotación ni inclinación", BLUE, 700], ["LIOM ⟂ al borde anterior del RI", INK]];
const atmLawV = (abierta) => atmV({ ang: 15, label: "15°", sobre: 30, rc: ["RC 15° caudal", "entra 4 cm por encima del MAE de arriba"], abierta,
  titulo: `De frente · boca ${abierta ? "abierta" : "cerrada"}`, textos: lawTxt, ri: "Boca cerrada y abierta en el mismo RI (18 × 24)" });
const atmSchV = (abierta) => atmV({ ang: 27.5, label: "25-30°", sobre: 36, rc: ["RC 25-30° caudal", "entra ≈5 cm por encima y 1-2 cm", "por delante del MAE de arriba"], abierta,
  titulo: `De frente · boca ${abierta ? "abierta" : "cerrada"}`, textos: schTxt, ri: "Boca cerrada y abierta en el mismo RI (18 × 24 horiz.)" });

// ---- PA de Caldwell (soporte inclinado) / Caldwell modificada ----
function senCaldwellV(mod) {
  const s = 0.56, rot = -15;
  let o;
  if (!mod) {
    const S1 = escenaErguido(s, rot, 380, 150), h1 = S1.h;
    const n1 = h1.P("nasion"), Q = add(n1, rot, 8);
    const riDir = rot - 90;
    const hitRI = (p) => { const ux = Math.cos(riDir * D), uy = Math.sin(riDir * D); const t = (p[1] - Q[1]) / uy; return [Q[0] + ux * t, p[1]]; };
    const R1 = rayo(h1, n1, 0, { len: 96, ref: rot, angLabel: "<tspan></tspan>", hasta: (e) => hitRI(e) });
    const l1 = add(R1.e, 157, 70);
    o = S1.piel + h1.huesos.craneo(0.25) + h1.huesos.senos() + riBar(add(Q, riDir, 10), 210, riDir) +
      linRef(h1.mae, h1.P("canto"), 24, Math.hypot(Q[0] - h1.P("canto")[0], Q[1] - h1.P("canto")[1]), "LOM", "inicio", -14, 4) + recto(Q, rot + 180, riDir, 8) +
      R1.svg + pto(n1, RED, 3.2) + txt(f1(l1[0]), f1(l1[1] + 8), "15°", 13, RED, "middle", 700) +
      col(470, 60, [["RC horizontal, sale por el nasión", RED, 700, 12.5]]) +
      col(470, 96, [["Soporte del RI inclinado 15°", INK, 700], ["(la parte superior hacia el paciente)", INK], ["LOM ⟂ al RI, sin rotación", BLUE, 700], ["RI centrado en el nasión", INK]]) +
      vista("PA de Caldwell · soporte inclinado");
  } else {
    const X = 410, S2 = escenaErguido(s, rot, X - 2, 150), h2 = S2.h, n2 = h2.P("nasion");
    const R2 = rayo(h2, n2, 0, { len: 96, hasta: hastaX(X) });
    const m = h2.mae, k = hastaX(X)(m, rot);
    o = S2.piel + h2.huesos.craneo(0.25) + h2.huesos.senos() + E.ri(X, 40, 8, 210) +
      E.refline(f1(m[0]), f1(m[1]), f1(k[0]), f1(k[1])) + txt(f1(m[0] - 8), f1(m[1] + 4), "LOM", 11.5, BLUE, "end", 700) +
      `<line x1="${f1(m[0])}" y1="${f1(m[1])}" x2="${X}" y2="${f1(m[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
      arco(m, 0, rot, 48, "") + txt(f1(m[0] + 40), f1(m[1] + 16), "15°", 12.5, BLUE, "middle", 700) + R2.svg + pto(n2, RED, 3.2) +
      col(470, 60, [["RC horizontal, sale por el nasión", RED, 700, 12.5]]) +
      col(470, 96, [["Si no se puede inclinar el soporte:", INK, 700], ["inclinar la cabeza hacia atrás", INK], ["LOM a 15° de la horizontal", BLUE, 700]]) +
      vista("Caldwell modificada · soporte fijo");
  }
  return svg(o + col(470, 186, [["Sentado erguido, mirando al RI", INK]]) +
    col(470, 280, [["RI 18 × 24 vertical · parrilla", MUTE, 400, 11], ["DFRI 100 cm · siempre erguido", MUTE, 400, 11]]));
}

Object.assign(module.exports, {
  "faciales-parietoacantial-waters--v1": () => watersAnat(false),
  "faciales-parietoacantial-waters--v2": () => facWatersV(true),
  "atm-law-modificado--v1": () => atmLawV(false),
  "atm-law-modificado--v2": () => atmLawV(true),
  "atm-schuller--v1": () => atmSchV(false),
  "atm-schuller--v2": () => atmSchV(true),
  "senos-pa-caldwell--v1": () => senCaldwellV(false),
  "senos-pa-caldwell--v2": () => senCaldwellV(true),
});
