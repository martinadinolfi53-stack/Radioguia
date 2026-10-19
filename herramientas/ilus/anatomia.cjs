// Biblioteca de anatomía para los esquemas (fase piloto "esquemas más fieles").
// Mismo estilo visual que estilo.cjs (piel con contorno continuo, huesos "por transparencia" color hueso), pero con
// proporciones y formas tomadas de medidas reales. Todo se modela en CENTÍMETROS en un sistema local de cada pieza
// y se lleva al dibujo con una transformación X({ s: px por cm, at, rot, flip }).
// No es una zona: ilustrar.mjs la saltea. La usan los .cjs de cada zona.
//
// Contenido:
//   geometría ........ f1, cr (curva suave por puntos), X (transformación), perfilHueso, capsula, elipse, rotar, polar
//   estilo ........... pielUnida(formas) (varias formas con UN contorno continuo), huesoP, huesoSuperpuesto, lineaHueso, organo, pliegue
//   figura humana .... figuraPerfil(o): articulada (cabeza, hombro, codo, cadera, rodilla, tobillo; miembros del lado lejano
//                      aparte). Sirve de pie de perfil, sentado (cadera 90, rodilla 90), supino/prono visto de costado
//                      (rot ±90 en X) y decúbito lateral visto desde el tubo (rot -90, caderas y rodillas flexionadas).
//                      figuraFrente(o): de pie de frente o de espaldas (también supino visto desde el tubo), brazos abajo,
//                      en las caderas, arriba o con ángulos propios. corteTronco(o): corte para las oblicuas.
//   cabeza ........... cabezaLateral(o): perfil con cráneo, órbita, maxilar, mandíbula, MAE y mastoides; puntos de las líneas
//                      de referencia (LOM, LIOM, LMM, LLM) en su lugar (LMM-LOM 53°, LLM-LOM 35°). craneoFrente(o).
//   huesos ........... manoPA (8 carpianos en dos hileras, metacarpianos y falanges con largos reales, pulgar oblicuo),
//                      codoOblicuoMedial, codoAP, codoLateral, corteCodo, hombroAP, rodillaLateral, rodillaAP, pieLateral,
//                      columnaLateral (lordosis, cifosis, pedículos, apófisis articulares y espinosas, sacro, cóccix),
//                      columnaAP, pelvisLateral, pelvisAP, toraxPA (costillas, clavículas, escápulas, pulmones, corazón),
//                      toraxLateral.
// Alturas y largos: ver ALT, VERT, SEG; las vértebras (VERT) cumplen "T7 a 18-20 cm de la vértebra prominente".
const E = require("./estilo.cjs");
const { SK, SKO, BONE, BONEO } = E;

// ---------------------------------------------------------------- geometría
const f1 = (n) => +(+n).toFixed(1);
const R = Math.PI / 180;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const angulo = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) / R;
const polar = (p, deg, L) => [p[0] + Math.cos(deg * R) * L, p[1] + Math.sin(deg * R) * L];
const rotar = (p, deg, c = [0, 0]) => {
  const r = deg * R, dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};
// transformación local (cm) → dibujo (px): espejo, escala (sx/sy aparte para escorzos), rotación, traslación
function X({ s = 1, at = [0, 0], rot = 0, flip = false, sx = 1, sy = 1, o = [0, 0] } = {}) {
  const c = Math.cos(rot * R), sn = Math.sin(rot * R);
  const T = (p) => {
    const dx = (p[0] - o[0]) * s * sx * (flip ? -1 : 1), dy = (p[1] - o[1]) * s * sy;
    return [at[0] + dx * c - dy * sn, at[1] + dx * sn + dy * c];
  };
  T.s = s; T.rot = rot; T.flip = flip;
  return T;
}
const mapa = (T, pts) => pts.map(T);
// curva suave (Catmull-Rom → Bézier) por los puntos; tension < 1 la hace más tensa
function cr(pts, closed = false, tension = 1) {
  const n = pts.length, g = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  const k = tension / 6;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) * k)},${f1(p1[1] + (p2[1] - p0[1]) * k)} ${f1(p2[0] - (p3[0] - p1[0]) * k)},${f1(p2[1] - (p3[1] - p1[1]) * k)} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + (closed ? " Z" : "");
}
const poli = (pts, closed = true) => "M" + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(" L") + (closed ? " Z" : "");
const circulo = (c, r) => `M${f1(c[0] - r)},${f1(c[1])} a${f1(r)},${f1(r)} 0 1,0 ${f1(2 * r)},0 a${f1(r)},${f1(r)} 0 1,0 ${f1(-2 * r)},0 Z`;
// puntos de una elipse (para formas que después se transforman)
const elipse = (c, rx, ry, rot = 0, n = 16) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * 2 * Math.PI;
  return add(c, rotar([rx * Math.cos(a), ry * Math.sin(a)], rot));
});
// contorno cerrado a lo largo de una polilínea "eje": perfil = [[t, medio-ancho izq, medio-ancho der], …] (t de 0 a 1
// a lo largo del eje); las puntas se redondean. Devuelve la lista de puntos (local), para transformar y suavizar.
function perfilHueso(eje, perfil, puntas = 0.6) {
  const L = [0];
  for (let i = 1; i < eje.length; i++) L.push(L[i - 1] + dist(eje[i - 1], eje[i]));
  const tot = L[L.length - 1];
  const en = (t) => { // punto y dirección a la fracción t del largo
    const d = t * tot; let i = 1;
    while (i < eje.length - 1 && L[i] < d) i++;
    const u = (d - L[i - 1]) / (L[i] - L[i - 1] || 1), p = lerp(eje[i - 1], eje[i], u), a = angulo(eje[i - 1], eje[i]);
    return [p, a];
  };
  const izq = [], der = [];
  for (const [t, hl, hr = hl] of perfil) {
    const [p, a] = en(t);
    izq.push(polar(p, a - 90, hl)); der.push(polar(p, a + 90, hr));
  }
  const [p0, a0] = en(0), [p1, a1] = en(1);
  const h0 = (perfil[0][1] + (perfil[0][2] ?? perfil[0][1])) / 2, hN = (perfil[perfil.length - 1][1] + (perfil[perfil.length - 1][2] ?? perfil[perfil.length - 1][1])) / 2;
  return [polar(p0, a0 + 180, h0 * puntas), ...izq, polar(p1, a1, hN * puntas), ...der.reverse()];
}
// cápsula entre dos puntos con anchos distintos en cada punta (miembros, dedos)
const capsula = (a, b, wa, wb = wa) => perfilHueso([a, b], [[0, wa / 2], [1, wb / 2]], 0.95);

// ---------------------------------------------------------------- estilo
const EST = { piel: SK, contorno: SKO, hueso: BONE, huesoO: BONEO };
// piel: formas = [puntos (curva suave cerrada) | { pts, recta: true } | { d: path ya hecho }]. Un solo contorno continuo:
// primero todos los bordes, después todos los rellenos, para que las piezas se fundan.
function pielUnida(formas, extra = "") {
  const ds = formas.map((f) => (Array.isArray(f) ? cr(f, true) : f.d ? f.d : f.recta ? poli(f.pts) : cr(f.pts, true, f.tension ?? 1)));
  return `<g ${extra}>` + ds.map((d) => `<path d="${d}" fill="${SKO}" stroke="${SKO}" stroke-width="4" stroke-linejoin="round"/>`).join("") +
    ds.map((d) => `<path d="${d}" fill="${SK}"/>`).join("") + `</g>`;
}
const pliegue = (pts, w = 1.4, closed = false) => `<path d="${cr(pts, closed)}" fill="none" stroke="${SKO}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// hueso desde puntos (curva suave cerrada) o path
const huesoP = (pts, extra = "", tension = 1) => `<path d="${Array.isArray(pts) ? cr(pts, true, tension) : pts}" fill="${BONE}" stroke="${BONEO}" stroke-width="1.3" stroke-linejoin="round" ${extra}/>`;
// contorno de hueso superpuesto (se ve "a través" de otro): solo el borde, punteado fino
const huesoSuperpuesto = (pts, extra = "") => `<path d="${Array.isArray(pts) ? cr(pts, true) : pts}" fill="none" stroke="${BONEO}" stroke-width="1" stroke-dasharray="2.5 2" ${extra}/>`;
const lineaHueso = (pts, w = 1, closed = false) => `<path d="${cr(pts, closed)}" fill="none" stroke="${BONEO}" stroke-width="${w}" stroke-linecap="round"/>`;
// órganos (pulmones, etc.): relleno celeste muy claro
const organo = (pts, fill = "#dfe9f3", stroke = "#9fb3c8") => `<path d="${cr(pts, true)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" opacity=".9"/>`;

module.exports = { f1, R, add, sub, lerp, dist, angulo, polar, rotar, X, mapa, cr, poli, circulo, elipse, perfilHueso, capsula, EST, pielUnida, pliegue, huesoP, huesoSuperpuesto, lineaHueso, organo };

// ================================================================ MANO Y MUÑECA
// Mano derecha vista por el dorso (PA). Sistema local en cm: origen en el centro de la articulación radiocarpiana,
// x hacia cubital (+) / radial (-), y hacia distal NEGATIVO. Largo radiocarpiana → punta del 3.er dedo ≈ 19,5 cm.
// Medidas relativas (metacarpianos, falanges, carpo) de tablas antropométricas de mano adulta.
const CARPO = {
  escafoides: [[-0.55, -0.3], [-1.0, -0.2], [-1.55, -0.35], [-2.0, -0.65], [-2.35, -1.15], [-2.45, -1.65], [-2.2, -2.0], [-1.75, -2.05], [-1.35, -1.85], [-1.1, -1.5], [-0.75, -1.2], [-0.5, -0.8]],
  semilunar: [[-0.42, -0.25], [0.0, -0.1], [0.45, -0.15], [0.8, -0.4], [0.85, -0.85], [0.6, -1.32], [0.18, -1.17], [-0.22, -1.3], [-0.5, -1.0], [-0.6, -0.6]],
  piramidal: [[1.0, -0.6], [1.4, -0.48], [1.85, -0.68], [2.15, -1.1], [2.1, -1.6], [1.7, -1.85], [1.2, -1.75], [0.97, -1.3]],
  grande: [[-0.2, -1.45], [0.15, -1.3], [0.5, -1.5], [0.64, -1.95], [0.62, -2.6], [0.62, -3.25], [0.15, -3.45], [-0.35, -3.4], [-0.6, -3.2], [-0.56, -2.6], [-0.78, -2.1], [-0.56, -1.7]],
  ganchoso: [[0.78, -1.75], [1.2, -1.97], [1.75, -1.98], [2.2, -2.25], [2.32, -2.8], [2.05, -3.25], [1.45, -3.4], [0.82, -3.32], [0.77, -2.6]],
  trapezoide: [[-0.78, -2.07], [-0.75, -2.6], [-0.75, -3.25], [-1.08, -3.45], [-1.52, -3.3], [-1.62, -2.75], [-1.47, -2.27], [-1.17, -2.07]],
  trapecio: [[-1.66, -2.22], [-1.92, -2.12], [-2.4, -2.17], [-2.8, -2.5], [-3.02, -3.0], [-2.88, -3.42], [-2.42, -3.58], [-1.92, -3.48], [-1.7, -3.0], [-1.7, -2.6]],
};
// [base, cabeza] de los metacarpianos y largos de falanges [proximal, media, distal] (cm)
const RAYOS = {
  1: { base: [-2.75, -3.7], dir: -32, L: 4.5, F: [3.2, 2.5], dirF: [-24, -16], w: 0.95 },
  2: { base: [-1.12, -3.62], cab: [-1.85, -10.25], F: [4.0, 2.3, 1.7], a: -8, w: 0.85, dedo: 1.9 },
  3: { base: [0.08, -3.62], cab: [0.0, -10.15], F: [4.5, 2.8, 1.9], a: 0, w: 0.9, dedo: 1.95 },
  4: { base: [1.18, -3.52], cab: [1.75, -9.4], F: [4.2, 2.7, 1.9], a: 7, w: 0.8, dedo: 1.82 },
  5: { base: [2.05, -3.42], cab: [3.35, -8.7], F: [3.6, 2.1, 1.7], a: 15, w: 0.75, dedo: 1.65 },
};
const dirA = (a) => [Math.sin(a * R), -Math.cos(a * R)]; // a en grados desde "distal", + hacia cubital
// falange o metacarpiano: base ancha, diáfisis fina, cabeza redondeada (cóndilos)
function huesoTubular(a, b, wb, wd, wc, tipo = "falange") {
  const per = tipo === "distal"
    ? [[0, wb / 2], [0.25, wd / 2], [0.7, wd / 2 * 0.9], [0.92, wc / 2], [1, wc / 2 * 0.7]]
    : [[0, wb / 2], [0.14, wb / 2 * 0.86], [0.32, wd / 2], [0.7, wd / 2], [0.86, wc / 2], [1, wc / 2 * 0.82]];
  return perfilHueso([a, b], per, tipo === "distal" ? 0.5 : 0.7);
}
// o: { T (transformación), dedos: separación extra (factor), pulgar: grados extra, sx: escorzo (oblicua), cara: "dorso" }
// Devuelve { piel (formas para pielUnida), huesos (svg; dibujar DESPUÉS de la piel), detalle (uñas), P (puntos clave en px) }
function manoPA(o = {}) {
  const { T = X(), dedos = 1, pulgar = 0, antebrazo = 6, unas = true } = o;
  const piel = [], hs = [], P = {}, det = [];
  // --- radio y cúbito distales
  const lf = antebrazo + 1, sh = (x0, x1) => { const o = []; for (let y = 5; y < lf; y += 3) o.push([x0, y]); o.push([x0, lf], [x1, lf]); for (let y = Math.floor((lf - 5) / 3) * 3 + 5; y >= 5; y -= 3) if (y < lf) o.push([x1, y]); return o; };
  const radio = [[-2.15, -0.55], [-1.8, -0.35], [-1.2, -0.15], [-0.62, -0.02], [-0.2, 0.05], [0.4, 0.2], [0.9, 0.42], [1.0, 0.75], [0.95, 1.35], [0.62, 2.3], [0.35, 3.5],
    ...sh(0.25, -1.4), [-1.5, 3.3], [-1.9, 1.7], [-2.2, 0.5], [-2.3, -0.15]];
  const cubito = [[1.12, 1.3], [1.2, 0.8], [1.45, 0.5], [1.85, 0.4], [2.08, 0.3], [2.33, -0.18], [2.6, 0.3], [2.72, 1.0], [2.58, 1.9], [2.38, 3.0], ...sh(2.25, 1.2), [1.12, 3.0], [1.08, 2.0]];
  hs.push(huesoP(mapa(T, cubito)), huesoP(mapa(T, radio)));
  // --- carpo (hilera proximal: escafoides, semilunar, piramidal, pisiforme; distal: trapecio, trapezoide, grande, ganchoso)
  for (const k of ["escafoides", "semilunar", "piramidal", "trapecio", "trapezoide", "grande", "ganchoso"]) hs.push(huesoP(mapa(T, CARPO[k])));
  hs.push(huesoSuperpuesto(mapa(T, elipse([1.72, -1.22], 0.5, 0.46))), huesoSuperpuesto(mapa(T, elipse([1.68, -2.58], 0.34, 0.28)))); // pisiforme y gancho del ganchoso
  // --- metacarpianos y falanges 2-5
  const ejes = {};
  for (const n of [2, 3, 4, 5]) {
    const r = RAYOS[n], a = r.a * dedos, u = dirA(a);
    hs.push(huesoP(mapa(T, huesoTubular(r.base, r.cab, 1.1, r.w * 0.92, 1.3, "mc")), "", 0.9));
    let p = add(r.cab, u, 0.55);
    const cad = [r.cab];
    r.F.forEach((L, i) => {
      const q = add(p, u, L);
      const tipo = i === 2 ? "distal" : "falange";
      const w = [[1.15, 0.72, 0.95], [0.95, 0.6, 0.78], [0.78, 0.42, 0.62]][i].map((v) => v * (n === 5 ? 0.88 : 1));
      hs.push(huesoP(mapa(T, huesoTubular(p, q, ...w, tipo)), "", 0.9));
      cad.push(q); p = add(q, u, 0.18);
    });
    ejes[n] = { cad, u, a };
    P["mcf" + n] = T(add(r.cab, u, 0.3)); P["ifp" + n] = T(add(cad[1], u, 0.1)); P["ifd" + n] = T(add(cad[2], u, 0.1)); P["punta" + n] = T(add(cad[3], u, 0.45));
    P["mcMedio" + n] = T(lerp(r.base, r.cab, 0.5));
    // piel del dedo: desde la base de la falange proximal hasta la punta, ancho que se afina
    const wd = r.dedo, tip = add(cad[3], u, 0.5);
    piel.push(perfilHueso([lerp(r.cab, cad[1], 0.1), cad[1], cad[2], tip],
      [[0, wd / 2], [0.36, wd / 2 * 0.93], [0.52, wd / 2 * 0.86], [0.66, wd / 2 * 0.88], [0.8, wd / 2 * 0.8], [0.93, wd / 2 * 0.72], [1, wd / 2 * 0.55]].map(([t, h]) => [t, h]), 0.85).map(T));
    if (unas) { // uña sobre la falange distal (vista dorsal)
      const c = lerp(cad[2], cad[3], 0.62), nv = [-u[1], u[0]], hw = wd * 0.27;
      det.push(cr([add(add(c, nv, -hw), u, -0.55), add(add(c, nv, -hw), u, 0.45), add(add(c, u, 0.75), nv, 0), add(add(c, nv, hw), u, 0.45), add(add(c, nv, hw), u, -0.55)].map(T), true));
    }
  }
  // --- pulgar (metacarpiano oblicuo, falanges vistas de 3/4)
  const t = RAYOS[1], a1 = t.dir - pulgar, ua = dirA(a1), mc1b = t.base, mc1c = add(mc1b, ua, t.L);
  const uf1 = dirA(t.dirF[0] - pulgar), f1a = add(mc1c, uf1, 0.55), f1b = add(f1a, uf1, t.F[0]);
  const uf2 = dirA(t.dirF[1] - pulgar), f2a = add(f1b, uf2, 0.2), f2b = add(f2a, uf2, t.F[1]);
  hs.push(huesoP(mapa(T, huesoTubular(mc1b, mc1c, 1.35, 0.95, 1.4, "mc")), "", 0.9), huesoP(mapa(T, huesoTubular(f1a, f1b, 1.2, 0.78, 1.0)), "", 0.9), huesoP(mapa(T, huesoTubular(f2a, f2b, 0.95, 0.5, 0.75, "distal")), "", 0.9));
  // sesamoideo en la MCF del pulgar
  hs.push(huesoSuperpuesto(mapa(T, elipse(add(mc1c, [0.45, 0.1]), 0.28, 0.24))));
  P.mcf1 = T(mc1c); P.punta1 = T(add(f2b, uf2, 0.4)); P.cmc1 = T(mc1b);
  piel.push(perfilHueso([lerp(mc1b, mc1c, 0.35), mc1c, f1b, add(f2b, uf2, 0.45)], [[0, 1.55], [0.35, 1.25], [0.55, 1.05], [0.78, 0.98], [0.92, 0.85], [1, 0.62]], 0.85).map(T));
  if (unas) { const c = lerp(f2a, f2b, 0.6), nv = [-uf2[1], uf2[0]]; det.push(cr([add(add(c, nv, -0.4), uf2, -0.5), add(add(c, nv, -0.42), uf2, 0.4), add(c, uf2, 0.7), add(add(c, nv, 0.38), uf2, 0.4), add(add(c, nv, 0.36), uf2, -0.5)].map(T), true)); }
  // --- palma (dorso de la mano) con eminencia tenar e hipotenar, y antebrazo
  const pal = [[-2.65, 0.4], [-2.85, -1.4], [-3.35, -3.1], [-3.85, -4.8], [-3.7, -6.6], [-2.95, -9.0], [-2.75, -10.7], [-1.9, -11.6], [-0.05, -11.75], [1.75, -11.1], [3.1, -10.1], [4.2, -9.0],
    [4.4, -7.4], [4.05, -4.8], [3.4, -2.4], [2.95, 0.4]];
  piel.push(pal.map(T));
  piel.push({ pts: [[-2.65, -0.5], [-2.75, 3], [-3.1, antebrazo + 1.5], [3.45, antebrazo + 1.5], [3.05, 3], [2.95, -0.5]].map(T), recta: true });
  P.carpo = T([0.05, -1.9]); P.escafoides = T([-1.4, -1.1]); P.muneca = T([0, -0.2]); P.radio = T([-0.5, 3]); P.cubito = T([1.8, 3]);
  // caja de la mano y la muñeca (sin el antebrazo), en px
  const todos = piel.slice(0, -1).flat();
  P.caja = { x0: Math.min(...todos.map((p) => p[0])), x1: Math.max(...todos.map((p) => p[0])), y0: Math.min(...todos.map((p) => p[1])), y1: Math.max(...todos.map((p) => p[1])) };
  P.borde = { radial: T([-3.8, -4.6]), cubital: T([3.7, -6]), distal: T([0, -20.2]), proximal: T([0, 2.5]) };
  const detalle = det.map((d) => `<path d="${d}" fill="none" stroke="${SKO}" stroke-width="1.1"/>`).join("") +
    pliegue([[-1.7, -10.2], [-1.0, -10.5], [-0.3, -10.25]].map(T), 1) + pliegue([[0.75, -9.7], [1.35, -9.95], [2.0, -9.6]].map(T), 1);
  return { piel, huesos: hs.join(""), detalle, P, ejes };
}
module.exports.manoPA = manoPA;
module.exports.CARPO = CARPO;

// ================================================================ FIGURA HUMANA
// Adulto de 172 cm, canon de 7,5 cabezas (cabeza 23 cm). Alturas sobre el piso (cm), tomadas de tablas antropométricas:
// vértice 172 · mentón 149 · C7 147 · acromion 141 · pezón 125 · cintura 106 · ombligo 102 · cresta ilíaca 100 ·
// EIAS 93 · cadera (cabeza femoral) 87 · trocánter 87 · pubis 85 · rodilla 47 · tobillo 8. Codo 107, muñeca 82, punta de dedos 64.
// Sistema local de la figura: ORIGEN EN LA ARTICULACIÓN DE LA CADERA, x hacia adelante (perfil) o hacia el lado
// izquierdo del paciente (frente), y hacia abajo. Se pasa del dato "altura h" a y con yH(h).
const yH = (h) => 87 - h;
const ALT = { vertice: 172, menton: 149, c7: 147, acromion: 141, pezon: 125, cintura: 106, ombligo: 102, cresta: 100, eias: 93, cadera: 87, pubis: 85, rodilla: 47, tobillo: 8 };
// vértebras: altura del centro del cuerpo vertebral (h). T7 queda 19 cm por debajo de la apófisis espinosa de C7.
const VERT = (() => {
  const o = {};
  for (let i = 1; i <= 7; i++) o["C" + i] = 160.5 - (i - 1) * 2.1;     // C1 160,5 … C7 147,9
  for (let i = 1; i <= 12; i++) o["T" + i] = 144.5 - (i - 1) * 2.75;   // T1 144,5 … T7 128 … T12 114,3
  for (let i = 1; i <= 5; i++) o["L" + i] = 110.5 - (i - 1) * 3.7;     // L1 110,5 … L3 103,1 … L5 95,7
  return o;
})();

// ---------- cabeza de perfil (mirando hacia +x), origen en el conducto auditivo externo (MAE / porion), plano de
// Frankfort horizontal. Puntos de las líneas de referencia en su lugar: LOM (canto externo-MAE) a 8° de la LIOM;
// LMM (mentón-MAE) a 53° de la LOM; LLM (comisura-MAE) a 35° de la LOM (geometría que cumple Waters 37° y 55°).
const CAB = {
  piel: [[0, -12.4], [3.5, -11.9], [6.6, -10.4], [8.8, -7.6], [9.7, -5.2], [10.15, -3.5], [9.85, -2.5], [10.5, -1.3], [11.5, 0.3], [12.6, 1.7], [12.2, 2.55], [11.05, 2.95],
    [11.45, 4.15], [10.9, 4.85], [11.15, 5.5], [10.2, 6.85], [10.45, 8.4], [9.75, 9.75], [8.3, 10.85], [6.0, 10.9], [4.6, 11.2]],
  nuca: [[-5.6, 6.2], [-7.0, 3.6], [-8.6, 0.6], [-9.6, -3.2], [-9.4, -6.6], [-7.6, -9.6], [-4.3, -11.8]],
  craneo: [[0, -11.6], [3.4, -11.1], [6.3, -9.7], [8.3, -7.2], [9.15, -4.9], [9.4, -3.5], [9.25, -2.45], [8.6, -2.1], [8.0, -2.0], [6.3, -0.7], [4.0, 0.2], [1.6, 0.6], [-0.9, 1.2], [-3.4, 2.0], [-6.2, 1.9],
    [-7.9, 0.8], [-8.85, -2.6], [-8.75, -6.1], [-7.1, -9.0], [-4.0, -11.1]],
  // maxilar: apófisis frontal (reborde orbitario medial), reborde infraorbitario, abertura piriforme, espina nasal
  // anterior (acantión), apófisis alveolar y tuberosidad
  facial: [[9.25, -2.3], [9.6, -1.4], [10.0, -0.45], [9.55, 0.4], [9.4, 1.4], [9.6, 2.25], [9.95, 2.6], [9.55, 2.85], [9.6, 3.35], [9.8, 3.9], [9.2, 4.0], [7.2, 3.95],
    [5.6, 3.95], [5.0, 3.45], [5.1, 2.4], [5.9, 1.75], [7.4, 1.45], [8.2, 0.6], [8.55, -0.05], [8.75, -1.1], [8.85, -2.05]],
  // huesos propios de la nariz (del nasion al rinion)
  nasal: [[9.2, -2.45], [9.55, -2.45], [10.0, -1.35], [10.45, -0.55], [10.05, -0.4], [9.6, -1.25], [9.15, -2.0]],
  // malar: apófisis frontal (reborde orbitario lateral), cuerpo y apófisis temporal hacia el arco
  cigoma: [[6.95, -2.75], [7.55, -2.85], [7.45, -1.9], [7.25, -0.8], [7.55, -0.1], [8.35, 0.05], [8.25, 0.7], [7.75, 1.45], [6.85, 1.7], [5.6, 1.15], [5.6, 0.45],
    [6.4, 0.25], [6.7, -0.9], [6.8, -2.1]],
  // mandíbula: cóndilo delante del MAE, escotadura sigmoidea, coronoides (bajo el arco), rama, ángulo (gonion), cuerpo y sínfisis
  mandibula: [[1.05, 1.1], [1.0, 2.6], [0.85, 4.6], [0.75, 6.1], [1.2, 6.9], [2.4, 7.6], [4.6, 8.6], [6.6, 9.4], [8.0, 9.95], [8.75, 9.85], [9.3, 9.2], [9.5, 8.4], [9.2, 7.3],
    [9.25, 6.3], [9.55, 5.3], [9.0, 5.2], [7.0, 5.2], [5.2, 5.25], [4.55, 5.0], [4.0, 4.0], [3.75, 2.6], [3.9, 1.3], [4.05, 0.75], [3.6, 0.95], [3.0, 1.55], [2.3, 1.45],
    [1.85, 0.75], [1.75, 0.15], [1.35, -0.1], [0.9, 0.1], [0.85, 0.6]],
  orbita: [8.15, -1.35, 1.05, 1.6],
  puntos: { mae: [0, 0], canto: [6.8, -0.95], infraorbitario: [7.85, -0.1], glabela: [10.15, -3.5], nasion: [9.85, -2.5], acantion: [9.95, 2.6], acantionPiel: [11.05, 2.95],
    menton: [9.75, 9.75], comisura: [9.6, 4.9], vertice: [0, -12.4], gonion: [0.6, 6.4], inion: [-8.2, 0.8], ojo: [7.9, -1.4], nariz: [12.6, 1.7] },
};
// o: { T (local cm → px, el MAE va a T([0,0])), boca: "cerrada" }
// Devuelve { piel: forma (para pielUnida), cara (ojo, oreja, boca: dibujar después de la piel), huesos, P (px) }
function cabezaLateral(o = {}) {
  const { T = X(), cuello = true } = o;
  const forma = [...CAB.piel, ...(cuello ? [[4.3, 13], [4.4, 17]] : [[3.0, 11.3]]), ...(cuello ? [[-6.6, 17], [-6.4, 9.6]] : [[-4.6, 7.4]]), ...CAB.nuca].map(T);
  const P = {};
  for (const [k, v] of Object.entries(CAB.puntos)) P[k] = T(v);
  const ojo = T([8.0, -1.35]), sk = SKO;
  const cara =
    `<path d="${cr([[7.45, -1.75], [8.2, -1.95], [8.75, -1.55]].map(T))}" fill="none" stroke="${sk}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="${cr([[7.5, -1.25], [8.2, -1.05], [8.7, -1.45]].map(T))}" fill="none" stroke="${sk}" stroke-width="1.1" stroke-linecap="round"/>` +
    `<circle cx="${f1(ojo[0])}" cy="${f1(ojo[1])}" r="${f1(0.28 * T.s)}" fill="${sk}"/>` +
    `<path d="${cr([[7.3, -3.0], [8.5, -3.35], [9.5, -3.05]].map(T))}" fill="none" stroke="${sk}" stroke-width="1.3" stroke-linecap="round"/>` + // ceja
    `<path d="${cr([[11.0, 2.15], [11.55, 2.0], [11.9, 2.35]].map(T))}" fill="none" stroke="${sk}" stroke-width="1.2" stroke-linecap="round"/>` + // ala nasal
    `<path d="${cr([[10.95, 4.85], [10.3, 4.95], [9.65, 4.85]].map(T))}" fill="none" stroke="${sk}" stroke-width="1.2" stroke-linecap="round"/>` + // boca
    `<path d="${cr([[-0.6, -3.1], [0.6, -3.6], [1.3, -2.4], [1.0, -0.5], [1.15, 1.6], [0.4, 3.1], [-0.6, 2.7], [-1.4, 0.4], [-1.5, -2.0]].map(T), true)}" fill="${SK}" stroke="${sk}" stroke-width="1.5"/>` + // oreja
    `<path d="${cr([[0.3, -2.3], [-0.6, -1.4], [-0.5, 0.6], [0.2, 1.8]].map(T))}" fill="none" stroke="${sk}" stroke-width="1.1"/>`;
  const oc = CAB.orbita;
  const dientes = (y0, y1, xs) => xs.map(([x, w]) => `<path d="${cr(mapa(T, [[x - w / 2, y0], [x + w / 2, y0], [x + w / 2 * 0.9, y1], [x - w / 2 * 0.9, y1]]), true, 0.5)}" fill="#fbf8f1" stroke="${BONEO}" stroke-width="0.9"/>`).join("");
  const huesos = huesoP(mapa(T, CAB.craneo)) +
    lineaHueso(mapa(T, [[8.3, -2.2], [5.8, -2.0], [3.6, -2.3]]), 0.9) + // base anterior del cráneo
    lineaHueso(mapa(T, [[3.6, -2.3], [3.3, -1.7], [2.6, -1.6], [2.2, -2.1], [2.4, -2.6]]), 1.0) + // silla turca
    lineaHueso(mapa(T, [[2.4, -4.6], [3.3, -3.6], [4.4, -2.9]]), 0.8) + // ala mayor del esfenoides (fosa temporal)
    huesoP(mapa(T, CAB.mandibula)) +
    huesoSuperpuesto(mapa(T, [[1.3, 6.8], [3.6, 7.6], [6.4, 8.5], [8.6, 9.0]])) + // conducto mandibular
    huesoP(mapa(T, CAB.facial)) +
    huesoSuperpuesto(mapa(T, [[5.8, 0.9], [7.4, 0.7], [8.4, 1.4], [8.5, 2.7], [7.0, 3.3], [5.6, 2.8]])) + // seno maxilar
    lineaHueso(mapa(T, [[9.6, 2.75], [7.5, 3.05], [5.1, 3.1]]), 1.0) + // paladar duro
    `<path d="${cr(mapa(T, elipse([oc[0], oc[1]], oc[2], oc[3], -8, 18)), true)}" fill="#ddd2bd" stroke="${BONEO}" stroke-width="1.2"/>` + // órbita
    huesoP(mapa(T, CAB.nasal)) +
    huesoP(perfilHueso([[5.9, 0.75], [3.8, 0.55], [1.9, 0.35]], [[0, 0.4], [0.5, 0.3], [1, 0.36]], 0.6).map(T)) + // arco cigomático
    huesoP(mapa(T, CAB.cigoma)) +
    dientes(3.95, 4.8, [[5.85, 1.0], [6.85, 0.95], [7.75, 0.8], [8.45, 0.65], [9.05, 0.6], [9.55, 0.5]]) +
    dientes(5.2, 6.0, [[5.4, 1.05], [6.4, 1.0], [7.35, 0.8], [8.05, 0.65], [8.65, 0.55], [9.15, 0.5]]) +
    huesoP(mapa(T, [[-0.9, 0.9], [-1.0, 2.6], [-1.55, 3.4], [-2.1, 2.6], [-2.2, 1.2]])) + // apófisis mastoides
    `<path d="${circulo(T([0, 0]), 0.55 * T.s)}" fill="#fff" stroke="${BONEO}" stroke-width="1.2"/>`;
  return { piel: forma, cara, huesos, P, T };
}
module.exports.cabezaLateral = cabezaLateral;
module.exports.CAB = CAB;
module.exports.ALT = ALT;
module.exports.VERT = VERT;
module.exports.yH = yH;

// ---------- figura de perfil (mirando hacia +x) ----------
// Contorno del tronco (cuello a glúteo), en coordenadas de figura (x adelante, y = 87 - h).
const TRONCO_P = [[-6.8, 151], [-8.2, 147], [-10.6, 141], [-12.3, 133], [-12.6, 126], [-11.8, 118], [-10.4, 111], [-10.0, 105], [-11.0, 98], [-13.0, 91], [-13.9, 85], [-12.8, 79],
  [-9.5, 75.5], [-3, 75], [4.5, 78.5], [9.0, 84.5], [10.8, 91], [11.9, 99], [11.6, 107], [11.6, 113], [13.0, 120], [13.9, 126], [12.9, 133], [9.8, 139], [7.2, 143], [5.6, 147], [5.2, 151]].map(([x, h]) => [x, yH(h)]);
// segmentos de los miembros: largo (cm) y medio-ancho [adelante, atrás] a lo largo (t de 0 a 1), mirando hacia +x con el miembro hacia abajo
const SEG = {
  muslo: { L: 40, per: [[0, 8.6, 8.4], [0.25, 8.2, 7.6], [0.55, 7.0, 6.4], [0.8, 5.8, 5.4], [0.92, 5.4, 5.0], [1, 5.2, 5.0]] },
  pierna: { L: 39, per: [[0, 4.9, 5.1], [0.12, 4.2, 6.4], [0.3, 3.8, 7.2], [0.5, 3.4, 6.0], [0.72, 2.9, 4.2], [0.9, 2.7, 3.0], [1, 3.0, 3.3]] },
  brazo: { L: 30, per: [[0, 5.0, 5.4], [0.2, 4.6, 5.0], [0.5, 4.0, 4.4], [0.85, 3.5, 3.7], [1, 3.4, 3.6]] },
  antebrazo: { L: 25, per: [[0, 3.6, 3.6], [0.25, 4.0, 3.8], [0.6, 3.1, 3.0], [0.9, 2.5, 2.5], [1, 2.4, 2.4]] },
};
const PIE_P = [[-3.6, -2.6], [-5.0, 0.6], [-5.9, 4.2], [-5.5, 7.2], [-3.2, 8.0], [4, 8.1], [12, 8.0], [17.2, 7.8], [19.8, 7.2], [20.3, 6.0], [18.6, 5.0], [14, 4.0], [9.2, 2.6], [4.8, -0.3], [3.0, -2.8]];
const MANO_P = [[-2.6, -0.5], [-2.9, 5], [-3.1, 10], [-2.6, 15.3], [-1.2, 18.5], [0.6, 18.7], [1.9, 15.6], [2.3, 11.2], [3.5, 9.6], [4.3, 7.0], [3.8, 4.4], [2.6, 1.4], [2.4, -0.5]];
const MANO_PUNO = [[-2.6, -0.5], [-3.0, 4], [-3.2, 7.5], [-2.2, 10.2], [0.4, 10.6], [2.6, 9.4], [3.6, 7.0], [3.6, 4.0], [2.5, 1.2], [2.4, -0.5]];
// miembro: segmento desde 'a' con dirección 'dir' (grados SVG) y largo L*k; devuelve [contorno, punto final]
function miembro(seg, a, dir, k = 1, flipW = false) {
  const s = SEG[seg], b = polar(a, dir, s.L * k);
  // per: [t, adelante, atrás]; "adelante" = a la izquierda del sentido de avance cuando el miembro baja (dir 90)
  return [perfilHueso([a, b], s.per.map(([t, f, p]) => (flipW ? [t, p, f] : [t, f, p])), 0.9), b];
}
// o: { T, cabeza: extensión del cuello en grados (+ = mentón arriba), hombro / codo: flexión (grados), escorzo: [k brazo, k antebrazo],
//      mano: "abierta" | "puno" | "no", cadera / rodilla: flexión, tobillo: grados (+ = punta hacia arriba),
//      lejos: { hombro, codo, cadera, rodilla, tobillo, escorzo, mano, d: [dx, dy] desplazamiento del lado lejano },
//      sinPiernas, sinBrazo }
// Devuelve { capas: svg de piel ya armado (atrás, cuerpo, brazo cercano), cara, P (puntos clave en px), J (articulaciones en cm de figura), cab }
function figuraPerfil(o = {}) {
  const { T = X(), cabeza = 0, hombro = 0, codo = 10, escorzo = [1, 1], mano = "abierta", cadera = 0, rodilla = 0, tobillo = 0, lejos = null, sinPiernas = false, sinBrazo = false } = o;
  const J = { cadera: [0, 0], hombro: [-2.2, yH(138.5)], cuello: [-1.6, yH(150)] };
  const cuerpo = [TRONCO_P.map(T)], atras = [], frente = [];
  // cabeza: el MAE neutro en (-0.6, h160); gira alrededor de la base del cuello
  const ang = -cabeza, base = add([-0.6, yH(160)], [0, 0]);
  const Tc = (p) => T(rotar(add(base, p), ang, J.cuello));
  Tc.s = T.s;
  const cab = cabezaLateral({ T: Tc });
  cuerpo.push(cab.piel);
  const pierna = (c, r, t, d = [0, 0]) => {
    const h = add(J.cadera, d);
    const [mu, k] = miembro("muslo", h, 90 - c);
    const [pi, an] = miembro("pierna", k, 90 - c + r);
    const dirPie = 90 - c + r - 90 - t; // pie perpendicular a la pierna, hacia adelante
    const pie = PIE_P.map((p) => add(an, rotar(p, dirPie)));
    return { formas: [mu, pi, pie], k, an };
  };
  const brazoF = (hm, cd, esc, mn, d = [0, 0]) => {
    const s0 = add(J.hombro, d);
    const [br, e] = miembro("brazo", s0, 90 - hm, esc[0]);
    const dirA = 90 - hm - cd;
    const [ab, w] = miembro("antebrazo", e, dirA, esc[1]);
    const f = [br, ab];
    if (mn !== "no") f.push((mn === "puno" ? MANO_PUNO : MANO_P).map((p) => add(w, rotar(p, dirA - 90))));
    return { formas: f, e, w };
  };
  let pc, bc;
  if (lejos) {
    const d = lejos.d || [0, 0];
    if (!sinPiernas) { const pl = pierna(lejos.cadera ?? cadera, lejos.rodilla ?? rodilla, lejos.tobillo ?? tobillo, d); atras.push(...pl.formas.map((f) => f.map(T))); J.rodillaLejos = pl.k; J.tobilloLejos = pl.an; }
    if (!sinBrazo) { const bl = brazoF(lejos.hombro ?? hombro, lejos.codo ?? codo, lejos.escorzo || escorzo, lejos.mano || mano, d); atras.push(...bl.formas.map((f) => f.map(T))); J.codoLejos = bl.e; J.munecaLejos = bl.w; }
  }
  if (!sinPiernas) { pc = pierna(cadera, rodilla, tobillo); cuerpo.push(...pc.formas.map((f) => f.map(T))); J.rodilla = pc.k; J.tobillo = pc.an; }
  if (!sinBrazo) { bc = brazoF(hombro, codo, escorzo, mano); frente.push(...bc.formas.map((f) => f.map(T))); J.codo = bc.e; J.muneca = bc.w; }
  // capas por separado: atras (miembros del lado lejano), cuerpo (tronco, cabeza, pierna cercana), frente (brazo cercano).
  // Orden sugerido: atras + cuerpo + huesos del tronco + frente + cara.
  const L = { atras: atras.length ? pielUnida(atras) : "", cuerpo: pielUnida(cuerpo), frente: frente.length ? pielUnida(frente) : "" };
  if (lejos && lejos.encima) { L.frente = L.atras + L.frente; L.atras = ""; } // el miembro "lejano" queda más cerca del observador (p. ej. pierna de arriba en decúbito lateral)
  const P = {};
  for (const [k, v] of Object.entries(J)) P[k] = T(v);
  Object.assign(P, cab.P);
  J.dirMuslo = 90 - cadera; J.dirPierna = 90 - cadera + rodilla;
  if (lejos) { J.dirMusloLejos = 90 - (lejos.cadera ?? cadera); J.dirPiernaLejos = 90 - (lejos.cadera ?? cadera) + (lejos.rodilla ?? rodilla); }
  return { ...L, capas: L.atras + L.cuerpo + L.frente, cara: cab.cara, P, J, T, cab, cabHuesos: cab.huesos };
}
module.exports.figuraPerfil = figuraPerfil;
module.exports.SEG = SEG;

// ---------- figura de frente / de espaldas ----------
// Medio contorno (lado +x) del tronco y la pierna, de la base del cuello al pie (x desde la línea media, h altura).
// Hombros (deltoides) 45 cm de ancho, cintura 28, caderas 35; rodillas y tobillos algo separados (pies juntos, no pegados).
const TRONCO_F = [[5.6, 151], [5.9, 146.5], [9.5, 144.6], [14.2, 142.6], [18.4, 140.8], [21.3, 139], [22.6, 135.5], [22.2, 130.5], [19.5, 127.5], [16.6, 125], [15.8, 120], [15.0, 113],
  [14.0, 106.5], [14.6, 101], [16.4, 95], [17.4, 89], [17.6, 84]].map(([x, h]) => [x, yH(h)]);
const PIERNA_F = [[17.6, 84], [16.6, 76], [15.2, 66], [13.6, 56], [12.3, 50], [12.0, 46], [12.4, 40], [12.5, 34], [11.2, 24], [9.8, 14], [9.2, 8.5], [9.9, 4.5], [10.6, 1.2], [10.0, -0.2],
  [5.0, -0.2], [4.9, 2.5], [5.6, 8.5], [5.4, 15], [4.4, 26], [3.6, 36], [4.0, 41], [4.6, 47], [4.0, 54], [2.6, 66], [0.9, 78.5], [0, 80]].map(([x, h]) => [x, yH(h)]);
// miembro superior de frente: brazo 30, antebrazo 25 (anchos de frente)
const SEGF = {
  brazo: { L: 30, per: [[0, 5.0], [0.2, 4.6], [0.55, 4.1], [0.9, 3.6], [1, 3.6]] },
  antebrazo: { L: 25, per: [[0, 3.9], [0.2, 4.2], [0.6, 3.3], [0.92, 2.8], [1, 2.8]] },
};
const MANO_F = [[-3.0, -0.4], [-3.4, 4.5], [-3.6, 9.5], [-3.0, 13.5], [-2.2, 17.8], [-0.8, 19.0], [0.8, 18.8], [2.0, 17.2], [2.5, 13.2], [3.2, 9.8], [4.6, 8.4], [5.4, 6.4], [4.6, 3.6], [3.0, 1.4], [2.9, -0.4]];
// o: { T, espalda: true (vista posterior: sin cara), brazos: "abajo" | "caderas" | "arriba" | { hombro: abd°, codo: flex° },
//      piernas: true, hasta: altura mínima a dibujar (h), cabeza: { rot } }
// Devuelve { capas, cara, P, J, T }. P: articulaciones y puntos de superficie (px); J en cm de figura.
function figuraFrente(o = {}) {
  const { T = X(), espalda = false, brazos = "abajo", piernas = true, hasta = null } = o;
  const izq = (pts) => pts.map(([x, y]) => [-x, y]);
  let tronco = [...TRONCO_F, ...(piernas ? PIERNA_F.slice(1) : [[0, TRONCO_F[TRONCO_F.length - 1][1] + 4]])];
  tronco = [...tronco, ...izq(tronco).reverse()];
  if (hasta != null) tronco = tronco.map(([x, y]) => [x, Math.min(y, yH(hasta))]);
  const cuerpo = [tronco.map(T)];
  // cuello y cabeza (cabeza 15 x 23 cm, orejas a la altura de los ojos)
  const cuello = [[5.4, yH(155)], [5.8, yH(146)], [-5.8, yH(146)], [-5.4, yH(155)]];
  cuerpo.push({ pts: cuello.map(T), recta: true });
  const cc = [0, yH(160.5)], cab = elipse(cc, 7.5, 11.6, 0, 28).map(([x, y]) => [x * (y > cc[1] ? 0.96 - 0.12 * ((y - cc[1]) / 11.6) ** 2 : 1), y]);
  cuerpo.push(cab.map(T));
  const orejas = [-1, 1].map((sg) => [[sg * 7.2, yH(163)], [sg * 8.4, yH(162.5)], [sg * 8.5, yH(159.5)], [sg * 7.6, yH(156.8)], [sg * 7.0, yH(157.5)]].map(T));
  // brazos
  const J = { cadera: [0, 0], hombroD: [17.2, yH(137)], hombroI: [-17.2, yH(137)], c7: [0, yH(ALT.c7)], t7: [0, yH(VERT.T7)], cresta: [0, yH(ALT.cresta)] };
  const conf = typeof brazos === "object" ? brazos : {
    abajo: { hombro: 7, codo: 5 }, caderas: { hombro: 31, codo: 75, escorzo: [0.89, 0.89], dirMano: 100, kMano: 0.82, anchoMano: 0.6 }, arriba: { hombro: 165, codo: 30 },
  }[brazos];
  const frente = [];
  for (const sg of [1, -1]) {
    const s0 = sg > 0 ? J.hombroD : J.hombroI;
    const esc = conf.escorzo || [1, 1];
    const d1 = 90 - sg * conf.hombro; // abducción: el brazo se aleja de la línea media
    const e = polar(s0, d1, SEGF.brazo.L * esc[0]);
    const d2 = d1 + sg * conf.codo;
    const w = polar(e, d2, SEGF.antebrazo.L * esc[1]);
    const br = perfilHueso([s0, e], SEGF.brazo.per.map(([t, h]) => [t, h]), 0.9), ab = perfilHueso([e, w], SEGF.antebrazo.per.map(([t, h]) => [t, h]), 0.9);
    const dm = conf.dirMano != null ? 90 + sg * (conf.dirMano - 90) : d2;
    const mn = MANO_F.map(([x, y]) => add(w, rotar([sg * x * (espalda ? -1 : 1) * 0.9 * (conf.anchoMano ?? 1), y * (conf.kMano ?? 1)], dm - 90)));
    const formas = [br, ab, mn].map((f) => f.map(T));
    frente.push(...formas);
    J[sg > 0 ? "codoD" : "codoI"] = e; J[sg > 0 ? "munecaD" : "munecaI"] = w;
  }
  const Lc = { cuerpo: pielUnida(cuerpo), frente: frente.length ? pielUnida(frente) : "" };
  const capas = Lc.cuerpo + Lc.frente;
  let cara = orejas.map((p) => `<path d="${cr(p, true)}" fill="${SK}" stroke="${SKO}" stroke-width="1.5"/>`).join("");
  const s = T.s;
  if (!espalda) {
    const ojo = (sg) => T([sg * 3.0, yH(162.2)]);
    cara += [-1, 1].map((sg) => { const p = ojo(sg); return `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(1.0 * s)}" ry="${f1(0.45 * s)}" fill="${SKO}"/>`; }).join("") +
      `<path d="${cr([[0, yH(161.5)], [-0.9, yH(157.8)], [0.6, yH(157.4)]].map(T))}" fill="none" stroke="${SKO}" stroke-width="1.2"/>` +
      `<path d="${cr([[-2.2, yH(154.8)], [0, yH(154.2)], [2.2, yH(154.8)]].map(T))}" fill="none" stroke="${SKO}" stroke-width="1.3"/>` +
      pliegue([[-0.4, yH(102.6)], [0.4, yH(101.4)]].map(T), 1.3);
  } else {
    cara += pliegue([[-4.5, yH(152.5)], [0, yH(151.6)], [4.5, yH(152.5)]].map(T), 1.1) + // línea del pelo en la nuca
      pliegue([[0, yH(140)], [0, yH(104)]].map(T), 1.0) + // surco de la columna
      (piernas ? pliegue([[0, yH(92)], [0, yH(80)]].map(T), 1.2) + [-1, 1].map((sg) => pliegue([[sg * 1.2, yH(79.5)], [sg * 7, yH(78.4)], [sg * 13, yH(80.2)]].map(T), 1.1)).join("") : "");
  }
  const P = {};
  for (const [k, v] of Object.entries(J)) P[k] = T(v);
  return { ...Lc, capas, cara, P, J, T };
}
module.exports.figuraFrente = figuraFrente;

// ================================================================ TÓRAX (vista frontal: PA / AP)
// Coordenadas de figura de frente (x desde la línea media hacia el lado IZQUIERDO del paciente, h altura).
// o.espalda = true → vista desde atrás (PA desde el tubo): se espeja para que el lado derecho del paciente quede a la derecha.
// o.hombrosAdelante: escápulas desplazadas hacia lateral (fuera de los campos pulmonares).
const COST = { // medio ancho lateral (cm) y descenso del arco posterior (cm) de cada costilla
  w: [6.3, 9.2, 11.2, 12.5, 13.3, 13.8, 14.0, 13.9, 13.4, 12.6, 10.8, 8.2],
  d: [2.2, 2.8, 3.4, 4.0, 4.5, 5.0, 5.4, 5.6, 5.7, 5.6, 5.2, 4.4],
  ant: [2.4, 3.6, 4.8, 5.8, 6.8, 7.6, 8.4, 8.6, 8.4, 7.4, 0, 0], // descenso del arco anterior hasta el cartílago
};
function toraxPA(o = {}) {
  const { T = X(), espalda = false, hombrosAdelante = false, pulmones = true, costillas = true, vertebras = true, escapulas = true, clavs = true } = o;
  const sgD = espalda ? 1 : -1; // signo de x del lado DERECHO del paciente
  const M = ([x, h]) => T([x, yH(h)]);
  const out = [], P = {};
  // pulmones (lado derecho más corto: cúpula más alta; izquierdo con escotadura cardíaca)
  if (pulmones) {
    const der = [[3.0, 143.4], [5.0, 144.8], [8.4, 142.8], [11.6, 138], [13.2, 132], [13.7, 124], [13.6, 117], [13.3, 111.2], [11.0, 113.2], [7.2, 115.6], [3.6, 115.0], [3.0, 120], [3.2, 128], [2.9, 136], [2.8, 142]];
    const izq = [[2.9, 143.2], [4.9, 144.6], [8.3, 142.8], [11.5, 138], [13.1, 132], [13.6, 124], [13.6, 117], [13.4, 110.5], [11.2, 111.8], [8.0, 113.5], [5.4, 114.6], [8.0, 118], [7.4, 123.5], [4.5, 128.5], [2.8, 133], [2.6, 140]];
    out.push(organo(der.map(([x, h]) => M([sgD * x, h]))), organo(izq.map(([x, h]) => M([-sgD * x, h]))));
    // silueta cardíaca, muy tenue (se proyecta sobre la columna y hacia la izquierda del paciente)
    out.push(`<path d="${cr([[-2.6, 132], [2.8, 131.5], [3.8, 127], [4.0, 121], [4.4, 116.2], [-2.0, 115.0], [-7.6, 114.6], [-8.6, 118], [-7.4, 123.5], [-4.5, 128.5]].map(([x, h]) => M([sgD * x, h])), true)}" fill="#f1d9d6" stroke="#d2a9a4" stroke-width="1" opacity=".75"/>`);
    P.cupulaD = M([sgD * 7.2, 115.6]); P.cupulaI = M([-sgD * 8, 113.5]); P.senoCFd = M([sgD * 13.3, 111.2]); P.senoCFi = M([-sgD * 13.4, 110.5]); P.vertice = M([sgD * 5.0, 144.8]);
  }
  // costillas: arco posterior (hueso) y anterior (contorno fino)
  if (costillas) for (let n = 1; n <= 12; n++) {
    const h0 = VERT["T" + n] + 0.4, w = COST.w[n - 1], d = COST.d[n - 1], a = COST.ant[n - 1];
    for (const sg of [-1, 1]) {
      const post = [[1.8, h0 + 0.3], [w * 0.32, h0 + 0.65], [w * 0.62, h0 - d * 0.18], [w * 0.86, h0 - d * 0.55], [w, h0 - d]];
      const band = perfilHueso(post.map(([x, h]) => [sg * x, yH(h)]), [[0, 0.62], [0.5, 0.6], [1, 0.5]], 0.6);
      out.push(huesoP(band.map(T), 'opacity=".9"'));
      if (a) {
        const ant = [[w, h0 - d], [w * 0.92, h0 - d - a * 0.32], [w * 0.68, h0 - d - a * 0.72], [Math.max(3.2, w * 0.36), h0 - d - a]];
        out.push(`<path d="${cr(ant.map(([x, h]) => M([sg * x, h])))}" fill="none" stroke="${BONEO}" stroke-width="1" opacity=".55"/>`);
      }
    }
  }
  // columna (cuerpos de C5 a L1, con pedículos y apófisis espinosas)
  if (vertebras) {
    const lista = ["C5", "C6", "C7", ...Array.from({ length: 12 }, (_, i) => "T" + (i + 1)), "L1"];
    for (const v of lista) {
      const h = VERT[v], k = v[0] === "C" ? 0.75 : v[0] === "L" ? 1.15 : 0.85 + (+v.slice(1)) * 0.022, alto = v[0] === "C" ? 1.45 : v[0] === "L" ? 2.7 : 2.0 + (+v.slice(1)) * 0.035;
      out.push(huesoP(poli([[-2 * k, h + alto / 2], [2 * k, h + alto / 2], [2.1 * k, h - alto / 2], [-2.1 * k, h - alto / 2]].map(M)), 'rx="2"', 0.5));
      out.push(huesoSuperpuesto(elipse([-1.45 * k, yH(h + 0.2)], 0.45, 0.55).map(T)), huesoSuperpuesto(elipse([1.45 * k, yH(h + 0.2)], 0.45, 0.55).map(T)));
      out.push(huesoP(mapa(T, [[0, yH(h + 0.6)], [0.55, yH(h - 0.4)], [0, yH(h - (v === "C7" ? 2.2 : 1.6))], [-0.55, yH(h - 0.4)]]), 'opacity=".9"'));
    }
    P.c7 = M([0, VERT.C7 - 0.9]); P.t7 = M([0, VERT.T7]); P.t1 = M([0, VERT.T1]);
  }
  // clavículas
  if (clavs) for (const sg of [-1, 1]) {
    const c = [[2.4, 137.8], [6.0, 138.6], [10.2, 138.9], [14.0, 139.4], [17.0, 139.8]].map(([x, h]) => [sg * x, yH(h)]);
    out.push(huesoP(perfilHueso(c, [[0, 0.85], [0.3, 0.6], [0.75, 0.55], [1, 0.75]], 0.7).map(T)));
  }
  // escápulas
  if (escapulas) for (const sg of [-1, 1]) {
    const dx = hombrosAdelante ? 4.2 : 0, rot = hombrosAdelante ? -8 : 0;
    const esc = [[6.0, 141.2], [9.0, 141.8], [11.8, 141.4], [14.2, 139.8], [15.6, 138.0], [15.4, 135.2], [14.4, 133.8], [12.4, 130.8], [9.8, 127.8], [8.6, 127.6], [7.6, 129.6], [6.6, 133.6], [5.8, 138.0]];
    const c0 = [11, 135];
    const pts = esc.map((p) => rotar(add(p, [dx, 0]), sg * rot, add(c0, [dx, 0]))).map(([x, h]) => [sg * x, yH(h)]);
    out.push(huesoP(pts.map(T), 'opacity=".75"'));
    const esp = [[5.9, 138.4], [10, 139.0], [14.5, 139.8], [17.8, 139.6]].map((p) => rotar(add(p, [p[0] > 16 ? 0 : dx, 0]), sg * rot, add(c0, [dx, 0]))).map(([x, h]) => [sg * x, yH(h)]);
    out.push(huesoP(perfilHueso(esp, [[0, 0.3], [0.6, 0.55], [1, 0.9]], 0.6).map(T), 'opacity=".85"'));
    P[sg === sgD ? "escapulaD" : "escapulaI"] = T(pts[9]);
  }
  return { svg: out.join(""), P };
}
module.exports.toraxPA = toraxPA;

// ================================================================ COLUMNA DE PERFIL
// Línea de los centros de los cuerpos vertebrales en una figura de pie mirando a +x (x adelante, h altura):
// lordosis cervical, cifosis torácica (vértice en T7), lordosis lumbar (vértice en L3).
const EJE_COL = [[0.2, 160.5], [0.6, 156.3], [0.2, 152.1], [-1.2, 147.9], [-3.4, 141.75], [-4.6, 136.25], [-5.1, 128], [-4.6, 119.75], [-4.0, 114.25], [-3.8, 110.5], [-3.2, 103.1], [-4.0, 95.7]];
function ejeX(h) { // interpolación lineal del eje
  const e = EJE_COL;
  if (h >= e[0][1]) return e[0][0];
  for (let i = 1; i < e.length; i++) if (h >= e[i][1]) { const t = (h - e[i][1]) / (e[i - 1][1] - e[i][1]); return e[i][0] + (e[i - 1][0] - e[i][0]) * t; }
  return e[e.length - 1][0];
}
// medidas de cada vértebra de perfil (cm): profundidad del cuerpo, alto del cuerpo, largo de los elementos posteriores, inclinación de la espinosa
function medidasV(v) {
  const n = +v.slice(1);
  if (v[0] === "C") return { prof: 1.6, alto: 1.35, post: 2.9 + (n === 7 ? 0.9 : 0), incl: 18 + n * 2 };
  if (v[0] === "T") return { prof: 2.0 + n * 0.09, alto: 1.75 + n * 0.06, post: 3.6, incl: n < 5 ? 40 : n < 10 ? 52 : 35 };
  return { prof: 3.3 + n * 0.07, alto: 2.55 + (n === 5 ? 0.15 : 0), post: 4.2, incl: 8 };
}
// o: { T (figura de pie → px), desde: "T10", hasta: "L5", detalle: true (pedículo, apófisis articulares, agujero de conjunción),
//      sacro: true, rotulos: true }. Devuelve { svg, P: centros de los cuerpos (px), Pesp: puntas de espinosas }
function columnaLateral(o = {}) {
  const { T = X(), desde = "C1", hasta = "L5", detalle = true, sacro = true, opac = 1 } = o;
  const orden = [...Array.from({ length: 7 }, (_, i) => "C" + (i + 1)), ...Array.from({ length: 12 }, (_, i) => "T" + (i + 1)), ...Array.from({ length: 5 }, (_, i) => "L" + (i + 1))];
  const lista = orden.slice(orden.indexOf(desde), orden.indexOf(hasta) + 1);
  const M = ([x, h]) => T([x, yH(h)]);
  const out = [], P = {}, Pesp = {};
  for (const v of lista) {
    const h = VERT[v], c = [ejeX(h), h];
    const tg = Math.atan2(ejeX(h + 1) - ejeX(h - 1), 2) / R; // inclinación del eje respecto de la vertical (grados)
    // marco local: u = adelante (perpendicular al eje), w = arriba (a lo largo del eje)
    const up = [Math.sin(tg * R), Math.cos(tg * R)], fw = [up[1], -up[0]];
    const L = (a, b) => [c[0] + fw[0] * a + up[0] * b, c[1] + fw[1] * a + up[1] * b];
    const m = medidasV(v), p = m.prof / 2, a = m.alto / 2;
    const cuña = v === "L5" ? 0.25 : v[0] === "T" && +v.slice(1) > 5 && +v.slice(1) < 10 ? -0.12 : 0; // L5 más alta adelante; torácicas medias, algo acuñadas
    const cuerpo = [L(-p, a - cuña), L(-p * 0.2, a - cuña * 0.6 + 0.05), L(p, a + cuña), L(p + 0.08, 0), L(p, -a - cuña), L(-p * 0.2, -a + cuña * 0.4 - 0.05), L(-p, -a + cuña), L(-p - 0.05, 0)];
    out.push(huesoP(cuerpo.map(M), "", 0.55));
    if (detalle) {
      // elementos posteriores de perfil: pedículo (mitad superior del cuerpo), macizo articular con las apófisis articulares
      // superior e inferior (las carillas de dos vértebras vecinas se enfrentan) y apófisis espinosa.
      const k = m.post / 4.2, tipo = v[0];
      const ped = [L(-p + 0.1, a * 0.9), L(-p - 1.35 * k, a * 0.78), L(-p - 1.45 * k, -a * 0.18), L(-p + 0.1, -a * 0.28)];
      const arco = [L(-p - 1.2 * k, a * 0.82), L(-p - 1.3 * k, a + 0.5 * k), L(-p - 1.95 * k, a + 0.72 * k), L(-p - 2.5 * k, a * 0.55), L(-p - 2.75 * k, -a * 0.3), L(-p - 2.45 * k, -a - 0.62 * k),
        L(-p - 1.75 * k, -a - 0.45 * k), L(-p - 1.55 * k, -a * 0.25), L(-p - 1.35 * k, 0)];
      const ex = -Math.cos(m.incl * R), ey = -Math.sin(m.incl * R); // dirección de la espinosa (atrás y abajo)
      const hs = tipo === "L" ? a * 0.82 : tipo === "T" ? a * 0.32 : a * 0.3, Ls = (tipo === "L" ? 2.9 : tipo === "T" ? 2.9 : v === "C7" ? 2.3 : 1.4) * (tipo === "C" ? 1 : k);
      const b0 = [-p - 2.45 * k, a * 0.15], b1 = add(b0, [ex, ey], Ls);
      const nx = -ey, ny = ex; // normal (hacia arriba de la espinosa)
      const esp = [add(b0, [nx, ny], -hs), add(b1, [nx, ny], -hs * 0.75), add(b1, [ex, ey], 0.35), add(b1, [nx, ny], hs * 0.8), add(add(b0, [nx, ny], hs), [ex, ey], -0.2)].map(([u, w]) => L(u, w));
      out.push(huesoP(esp.map(M), "", 0.55), huesoP(arco.map(M), "", 0.6), huesoP(ped.map(M), "", 0.5));
      if (tipo !== "C") out.push(huesoSuperpuesto(elipse([0, 0], 0.5, 0.42).map(([u, w]) => L(-p - 1.75 * k + u, a * 0.3 + w)).map(M))); // apófisis transversa (de punta)
      Pesp[v] = M(L(...add(b1, [ex, ey], 0.35)));
    }
    P[v] = M(c); P[v + "ant"] = M(L(p, 0)); P[v + "post"] = M(L(-p, 0));
  }
  if (sacro && hasta === "L5") {
    const sac = [[-2.7, 92.5], [-3.9, 90.3], [-5.6, 88.4], [-7.4, 86.9], [-9.3, 85.7], [-10.8, 84.7], [-11.4, 84.2], [-11.9, 84.9], [-12.1, 86.6], [-11.7, 88.8], [-10.9, 91.0], [-9.9, 93.2],
      [-9.0, 95.0], [-8.0, 95.7], [-7.4, 94.6], [-6.3, 94.9]];
    out.push(huesoP(sac.map(M), "", 0.7));
    // cuerpo de S1 y crestas transversas (segmentos fusionados), solo en la cara anterior
    out.push(lineaHueso([[-3.9, 90.3], [-7.0, 91.9]].map(M), 0.9), lineaHueso([[-5.6, 88.4], [-8.2, 89.4]].map(M), 0.8), lineaHueso([[-7.4, 86.9], [-9.6, 87.6]].map(M), 0.8));
    out.push(lineaHueso([[-7.6, 94.4], [-8.6, 91.0], [-9.9, 88.0], [-11.1, 85.6]].map(M), 0.8)); // conducto sacro
    out.push(huesoP([[-11.4, 84.0], [-11.9, 83.0], [-11.7, 81.8], [-11.0, 81.2], [-10.6, 81.7], [-10.9, 82.8]].map(M), "", 0.8)); // cóccix
    P.S1 = M([-4.6, 92.6]); P.promontorio = M([-2.7, 92.5]); P.coccix = M([-11.0, 81.3]); P.sacro = M([-9.0, 89.0]);
  }
  return { svg: out.length ? `<g opacity="${opac}">${out.join("")}</g>` : "", P, Pesp };
}
module.exports.columnaLateral = columnaLateral;
module.exports.ejeX = ejeX;

// hueso coxal de perfil (cresta ilíaca, EIAS, EIPS, escotadura ciática, isquion, pubis, acetábulo) + cabeza femoral
function pelvisLateral(o = {}) {
  const { T = X(), femur = true } = o;
  const M = ([x, h]) => T([x, yH(h)]);
  const coxal = [[7.4, 93.0], [6.0, 96.8], [3.2, 99.4], [-0.6, 100.8], [-4.6, 100.8], [-8.4, 99.4], [-11.2, 96.8], [-12.4, 93.8], [-12.0, 92.0], [-10.0, 90.2], [-7.6, 88.8], [-5.8, 87.0], [-5.8, 85.4],
    [-6.2, 84.0], [-6.1, 81.4], [-5.2, 79.2], [-3.4, 78.4], [-1.2, 79.4], [1.4, 81.2], [4.0, 82.6], [6.4, 83.8], [7.0, 85.6], [5.4, 86.6], [3.0, 86.0], [3.5, 88.6], [5.8, 89.6], [6.6, 91.0]];
  let s = huesoP(coxal.map(M), `opacity="${o.opac ?? 0.55}"`);
  s += huesoSuperpuesto(elipse([0.6, yH(82.4)], 2.2, 1.6, -20).map(T)); // agujero obturador
  s += `<path d="${circulo(M([0, 87]), 2.9 * T.s)}" fill="none" stroke="${BONEO}" stroke-width="1.1"/>`; // acetábulo
  if (femur) s += huesoP(circulo(M([0, 87]), 2.35 * T.s));
  const P = { cresta: M([-2.5, 100.6]), eias: M([7.4, 93.0]), eips: M([-12.4, 93.8]), acetabulo: M([0, 87]), isquion: M([-3.4, 78.4]), pubis: M([6.4, 83.8]) };
  return { svg: s, P };
}
module.exports.pelvisLateral = pelvisLateral;

// órganos y huesos del tórax de perfil (pulmón, esternón, cúpula diafragmática), figura de pie mirando a +x
function toraxLateral(o = {}) {
  const { T = X() } = o;
  const M = ([x, h]) => T([x, yH(h)]);
  const pulmon = [[-3.2, 147.6], [0.6, 146.4], [4.6, 141.8], [8.4, 135.6], [10.6, 128], [10.8, 121], [9.4, 115.6], [6.2, 114.0], [2.0, 113.6], [-3.4, 111.4], [-7.8, 106.6], [-9.8, 107.8], [-10.6, 114], [-10.6, 124], [-9.6, 133], [-7.4, 140.6], [-5.2, 145.4]];
  let s = organo(pulmon.map(M));
  const est = [[7.4, 139.6], [9.0, 139.0], [9.6, 134.2], [10.8, 126.0], [11.5, 118.6], [11.0, 117.0], [10.2, 118.6], [9.2, 126.0], [8.0, 133.6], [7.0, 136.2]];
  s += huesoP(est.map(M), 'opacity=".9"');
  return { svg: s, P: { esternon: M([9.4, 128]), pulmonAnt: M([10.6, 128]), pulmonPost: M([-10.6, 124]), vertice: M([-3.2, 147.6]) } };
}
module.exports.toraxLateral = toraxLateral;

// ================================================================ RODILLA
// Lateral (de perfil): fémur distal con los cóndilos superpuestos, rótula, meseta tibial, tuberosidad y cabeza del peroné.
// K = centro de la interlínea articular (cm, en el sistema que transforma T); dirF = dirección rodilla→cadera, dirT = rodilla→tobillo
// (grados SVG); adelante = +1 si la cara anterior queda a la izquierda del sentido rodilla→tobillo, -1 si a la derecha.
function rodillaLateral(o = {}) {
  const { T = X(), dirF = -90, dirT = 90, adelante = 1, rotula = true, largoF = 24, largoT = 30, avance = 1.4 } = o;
  // los huesos de la rodilla quedan por delante del eje del miembro (atrás están la fosa poplítea y los gemelos)
  const bis = ((dirF + 180 + dirT) / 2) * R, K = [(o.K || [0, 0])[0] + Math.sin(bis) * avance * adelante, (o.K || [0, 0])[1] - Math.cos(bis) * avance * adelante];
  // marcos locales: x = anterior, y = a lo largo del hueso alejándose de la rodilla
  const marco = (dir, nd) => { const u = [Math.cos(dir * R), Math.sin(dir * R)], v = [Math.cos(nd * R), Math.sin(nd * R)], n = [v[1] * adelante, -v[0] * adelante]; return ([x, y]) => T([K[0] + n[0] * x + u[0] * y, K[1] + n[1] * x + u[1] * y]); };
  const Fm = marco(dirF, dirF + 180), Tb = marco(dirT, dirT);
  const lf = largoF, lt = largoT;
  const femur = [[1.55, lf], [1.6, 9], [2.0, 5.8], [2.75, 3.6], [2.85, 2.0], [2.2, 0.7], [1.0, 0.05], [-0.5, -0.02], [-2.0, 0.45], [-3.05, 1.6], [-3.25, 3.0], [-2.75, 4.2], [-1.85, 5.6], [-1.6, 9], [-1.5, lf]];
  const tibia = [[-2.6, 0.38], [-1.0, 0.45], [-0.35, 0.05], [0.25, 0.0], [0.6, 0.42], [2.0, 0.52], [2.25, 1.1], [2.15, 2.3], [2.6, 3.5], [2.05, 4.8], [1.55, 8], [1.25, lt], [-1.2, lt], [-1.45, 8], [-2.1, 3.8], [-2.75, 1.4]];
  const perone = [[-1.0, 2.4], [-1.45, 1.55], [-2.3, 1.6], [-2.7, 2.6], [-2.35, 3.8], [-2.05, 5.0], [-1.8, lt], [-1.15, lt], [-1.3, 5.0], [-1.05, 3.6]];
  let s = huesoP(mapa(Tb, perone)) + huesoP(mapa(Tb, tibia)) + huesoP(mapa(Fm, femur));
  s += lineaHueso(mapa(Fm, [[1.5, 1.7], [0.2, 2.7], [-1.3, 3.8]]), 0.9); // línea intercondílea (Blumensaat)
  s += huesoSuperpuesto(mapa(Fm, [[-0.3, 0.42], [-1.7, 0.8], [-2.65, 1.75], [-2.85, 2.9]])); // cóndilo del otro lado, casi superpuesto
  const P = { K: T(K), epicondilo: Fm([-0.6, 2.8]), tuberosidad: Tb([2.6, 3.5]), cabezaPerone: Tb([-1.9, 2.6]) };
  if (rotula) {
    const rc = [4.05, 3.1], pat = elipse(rc, 1.15, 2.3, 0, 18).map(([x, y]) => [x + (y < rc[1] ? 0 : 0.25 * (y - rc[1])), y]);
    s += huesoP(mapa(Fm, pat));
    s += lineaHueso([Fm([4.2, 0.85]), Tb([2.55, 3.2])], 1.0).replace('stroke-width="1"', 'stroke-width="1" stroke-dasharray="3 2"'); // tendón rotuliano
    P.rotula = Fm(rc);
  }
  return { svg: s, P, Fm, Tb };
}
module.exports.rodillaLateral = rodillaLateral;

// AP (de frente): K = centro de la interlínea; dirF / dirT como arriba; medial = +1 si el lado medial queda a la izquierda
// del sentido rodilla→tobillo. Fémur con cóndilos y escotadura, rótula superpuesta, meseta con espinas, cabeza del peroné.
function rodillaAP(o = {}) {
  const { T = X(), K = [0, 0], dirF = -90, dirT = 90, medial = 1, rotula = true, largoF = 16, largoT = 16 } = o;
  const marco = (dir, nd) => { const u = [Math.cos(dir * R), Math.sin(dir * R)], v = [Math.cos(nd * R), Math.sin(nd * R)], n = [v[1] * medial, -v[0] * medial]; return ([x, y]) => T([K[0] + n[0] * x + u[0] * y, K[1] + n[1] * x + u[1] * y]); };
  const Fm = marco(dirF, dirF + 180), Tb = marco(dirT, dirT);
  // x = medial (+) / lateral (-); y alejándose de la rodilla
  const femur = [[1.65, largoF], [1.8, 9], [2.6, 5.8], [3.7, 4.2], [4.35, 2.6], [4.1, 1.0], [3.4, 0.2], [2.2, -0.1], [1.1, 0.3], [0.5, 1.2], [0, 1.6], [-0.5, 1.2], [-1.1, 0.35], [-2.2, 0.05], [-3.4, 0.35],
    [-4.05, 1.3], [-4.15, 2.6], [-3.4, 4.3], [-2.3, 6.2], [-1.7, 9], [-1.6, largoF]];
  const tibia = [[-3.9, 0.6], [-2.4, 0.42], [-0.9, 0.38], [-0.45, -0.25], [-0.1, 0.25], [0.2, 0.25], [0.55, -0.3], [1.0, 0.38], [2.5, 0.42], [3.95, 0.65], [4.05, 1.3], [3.5, 3.0], [2.2, 5.5], [1.7, 8], [1.55, largoT],
    [-1.6, largoT], [-1.8, 8], [-2.5, 5.0], [-3.7, 2.9], [-4.1, 1.4]];
  const perone = [[-2.9, 2.6], [-3.5, 1.85], [-4.4, 2.0], [-4.75, 3.0], [-4.3, 4.2], [-3.9, 5.6], [-3.4, largoT], [-2.6, largoT], [-3.0, 5.6], [-2.9, 4.0]];
  let s = huesoP(mapa(Tb, perone)) + huesoP(mapa(Tb, tibia)) + huesoP(mapa(Fm, femur));
  if (rotula) s += huesoSuperpuesto(mapa(Fm, elipse([0.35, 2.9], 2.15, 2.5, 0, 18)));
  const P = { K: T(K), epicondiloMedial: Fm([4.35, 2.6]), epicondiloLateral: Fm([-4.15, 2.6]), cabezaPerone: Tb([-3.9, 3.0]) };
  return { svg: s, P, Fm, Tb };
}
module.exports.rodillaAP = rodillaAP;

// ================================================================ CODO
// Codo extendido visto desde el tubo, en AP (rot = 0) u oblicua medial (rot = 45, rotación interna; mano en pronación).
// Sistema local en cm: origen en el centro de la articulación, x hacia distal (mano), y hacia LATERAL (+) / medial (-).
// Oblicua medial: epicóndilo medial y tróclea bien vistos, coronoides de perfil, cabeza y cuello del radio superpuestos al cúbito,
// y el radio cruzando sobre el cúbito en el antebrazo (pronación).
function codoOblicuoMedial(o = {}) {
  const { T = X(), largoH = 18, largoA = 24 } = o;
  const humero = [[-largoH, -1.25], [-8, -1.3], [-4.6, -1.9], [-2.7, -2.9], [-1.75, -3.55], [-1.05, -3.2], [-0.55, -2.4], [0.12, -1.75], [0.12, -0.75], [0.35, 0.15], [0.25, 1.15],
    [-0.45, 1.75], [-1.2, 2.05], [-2.4, 1.85], [-4.4, 1.45], [-8, 1.25], [-largoH, 1.2]];
  const cubito = [[-1.9, -0.75], [-1.2, -1.65], [0.2, -1.95], [0.95, -2.55], [1.7, -1.95], [3.2, -1.3], [9, -0.8], [16, 0.0], [largoA, 0.55], [largoA, 1.65], [16, 1.05], [9, 0.2], [3.4, -0.05], [1.4, 0.2], [0.6, -0.05], [-0.6, 0.05], [-1.7, -0.1]];
  const radio = [[0.75, -0.95], [0.85, 0.9], [1.65, 1.0], [1.75, 0.55], [2.9, 0.4], [3.8, 0.55], [9, 0.1], [16, -1.2], [largoA - 0.6, -2.2], [largoA, -2.6], [largoA, -0.9], [16, 0.05], [9, 1.15], [3.8, 1.05], [2.9, -0.45], [1.75, -0.5], [1.65, -0.95]];
  let s = huesoP(mapa(T, humero)) + huesoSuperpuesto(mapa(T, elipse([-2.0, -0.35], 0.95, 0.65))) + // fosa olecraneana
    huesoP(mapa(T, cubito), 'opacity=".92"') + huesoP(mapa(T, radio), 'opacity=".88"');
  s += lineaHueso(mapa(T, [[-0.5, -1.7], [-0.1, -0.9], [-0.3, 0.1]]), 0.9); // borde de la tróclea
  const P = { centro: T([0.1, -0.3]), epicondiloMedial: T([-1.75, -3.55]), epicondiloLateral: T([-1.2, 2.05]), coronoides: T([0.95, -2.55]), cabezaRadio: T([1.2, 0.0]), troclea: T([-0.1, -1.4]),
    humero: T([-8, 0]), cubito: T([12, 0.3]), radio: T([12, -0.1]) };
  return { svg: s, P };
}
module.exports.codoOblicuoMedial = codoOblicuoMedial;
// Oblicua lateral (rotación externa 45°; mano en supinación). Mismo sistema local que codoOblicuoMedial.
// Epicóndilo lateral y cóndilo (capitulum) de perfil, cabeza, cuello y tuberosidad del radio libres del cúbito,
// radio y cúbito paralelos (supinación), epicóndilo medial acortado.
function codoOblicuoLateral(o = {}) {
  const { T = X(), largoH = 18, largoA = 24 } = o;
  const humero = [[-largoH, -1.2], [-8, -1.25], [-4.4, -1.5], [-2.4, -1.95], [-1.5, -2.1], [-0.8, -1.75], [-0.1, -1.3], [0.15, -0.45], [0.0, 0.3], [0.35, 0.9], [0.45, 1.6],
    [0.1, 2.35], [-0.7, 2.95], [-1.6, 3.3], [-2.6, 2.75], [-4.4, 1.6], [-8, 1.3], [-largoH, 1.25]];
  const cubito = [[-1.6, -1.15], [-0.6, -1.6], [0.6, -1.7], [2.0, -1.45], [4, -1.2], [9, -1.25], [16, -1.75], [largoA, -2.65], [largoA, -1.2], [16, -0.6], [9, -0.15], [4, -0.15],
    [2.4, -0.25], [1.0, -0.2], [0.2, -0.5], [-0.8, -0.4], [-1.5, -0.5]];
  const radio = [[0.62, 0.5], [0.55, 2.7], [1.45, 2.75], [1.62, 2.1], [2.6, 2.05], [4, 2.15], [9, 2.25], [16, 2.15], [largoA - 0.6, 2.2], [largoA, 2.3], [largoA, -0.9], [16, 0.3],
    [9, 0.85], [4.0, 0.8], [3.3, 0.5], [2.7, 0.85], [2.5, 1.2], [1.62, 1.2], [1.45, 0.45]];
  let s = huesoP(mapa(T, humero)) + huesoSuperpuesto(mapa(T, elipse([-2.0, 0.1], 0.9, 0.6))) + // fosa olecraneana
    huesoP(mapa(T, cubito), 'opacity=".92"') + huesoP(mapa(T, radio));
  s += lineaHueso(mapa(T, [[-0.3, 0.75], [0.0, 1.5], [-0.25, 2.25]]), 0.9); // contorno del cóndilo (capitulum)
  const P = { centro: T([0.2, 0.5]), epicondiloLateral: T([-1.6, 3.3]), epicondiloMedial: T([-1.5, -2.1]), capitulo: T([0.25, 1.5]), cabezaRadio: T([1.0, 2.7]),
    cuelloRadio: T([2.1, 2.05]), tuberosidad: T([3.2, 0.55]), humero: T([-8, 0]), cubito: T([12, -0.9]), radio: T([12, 1.5]) };
  return { svg: s, P };
}
module.exports.codoOblicuoLateral = codoOblicuoLateral;
// corte transversal del codo a la altura de los epicóndilos, visto desde la mano (desde distal).
// Local: x hacia lateral (+) / medial (-), y hacia posterior (+). g = giro en grados (+ horario). Devuelve piel, hueso y epicóndilos.
function corteCodo(o = {}) {
  const { T = X(), g = 0 } = o;
  const Rg = (p) => T(rotar(p, g));
  const piel = elipse([-0.1, 0.25], 4.7, 3.7, 0, 30);
  const hum = [[-3.35, 0.15], [-2.5, -0.55], [-1.2, -0.95], [0, -0.75], [1.2, -0.95], [2.4, -0.8], [2.95, -0.2], [2.5, 0.6], [1.2, 0.85], [0.1, 0.45], [-1.1, 0.85], [-2.4, 0.75]];
  const olec = elipse([-0.25, 1.75], 0.85, 0.7, 0, 14);
  const svgS = pielUnida([piel.map(Rg)]) + huesoP(hum.map(Rg)) + huesoP(olec.map(Rg));
  const fondo = Math.max(...piel.map((p) => Rg(p)[1])) - T([0, 0])[1]; // cuánto baja la piel por debajo del origen (px)
  return { svg: svgS, em: Rg([-3.35, 0.15]), el: Rg([2.95, -0.2]), c: Rg([-0.1, 0.25]), fondo, T: Rg };
}
module.exports.corteCodo = corteCodo;

// ================================================================ PELVIS AP
// Figura de frente (x desde la línea media, h altura). Huesos coxales con alas ilíacas, EIAS, agujeros obturadores, sínfisis,
// sacro y cóccix, L5, y fémures proximales (cabeza, cuello, trocánteres). Simétrica.
function pelvisAP(o = {}) {
  const { T = X(), femures = true, l5 = true } = o;
  const M = ([x, h]) => T([x, yH(h)]);
  const coxal = [[2.4, 96.6], [5.5, 99.4], [9.0, 100.6], [12.2, 100.2], [14.2, 98.4], [14.0, 95.6], [13.2, 93.2], [12.6, 91.2], [12.2, 90.0], [11.6, 88.9], [12.0, 86.8], [11.6, 84.6], [10.4, 82.6],
    [9.4, 80.6], [8.2, 79.2], [6.2, 79.4], [4.2, 80.6], [1.0, 83.2], [0.6, 85.4], [3.2, 86.0], [6.6, 86.8], [5.6, 89.6], [4.2, 92.2], [2.8, 94.6]];
  const fem = [[9.2, 89.4], [7.0, 88.0], [7.0, 86.0], [8.4, 84.8], [10.4, 84.2], [10.4, 82.6], [9.8, 81.8], [10.6, 80.6], [10.9, 76], [10.7, 68], [13.4, 68], [13.9, 76], [14.3, 81.6], [14.7, 85.2], [13.9, 87.8], [12.6, 87.2], [11.2, 87.6]];
  let s = "";
  for (const sg of [-1, 1]) {
    const m = (pts) => pts.map(([x, h]) => M([sg * x, h]));
    if (femures) s += huesoP(m(fem));
    s += huesoP(m(coxal), 'opacity=".95"');
    s += `<path d="${cr(m(elipse([5.6, 82.6], 2.2, 1.6, 15 * sg, 16)), true)}" fill="#fff" stroke="${BONEO}" stroke-width="1.2"/>`; // agujero obturador
    s += `<path d="${circulo(M([sg * 9.2, 87]), 2.55 * T.s)}" fill="none" stroke="${BONEO}" stroke-width="1.1"/>`; // acetábulo
    if (femures) s += huesoP(circulo(M([sg * 9.2, 87]), 2.3 * T.s));
  }
  const sacro = [[-5.0, 96.4], [-2.6, 97.2], [2.6, 97.2], [5.0, 96.4], [4.4, 92.6], [2.8, 88.6], [1.2, 85.8], [0, 85.2], [-1.2, 85.8], [-2.8, 88.6], [-4.4, 92.6]];
  s += huesoP(sacro.map(M));
  for (const [y, w] of [[94.6, 2.2], [92.2, 1.8], [89.8, 1.4], [87.6, 1.0]]) for (const sg of [-1, 1]) s += huesoSuperpuesto(elipse([sg * w, yH(y)], 0.35, 0.3).map(T));
  s += huesoP([[0, 85.0], [0.8, 84.4], [0.5, 83.2], [0, 82.8], [-0.5, 83.2], [-0.8, 84.4]].map(M)); // cóccix
  if (l5) s += huesoP([[-2.8, 97.6], [2.8, 97.6], [2.9, 100.3], [-2.9, 100.3]].map(M), "", 0.4) + huesoP([[-2.9, 99.0], [-5.6, 99.6], [-5.4, 98.4], [-2.9, 98.0]].map(M)) + huesoP([[2.9, 99.0], [5.6, 99.6], [5.4, 98.4], [2.9, 98.0]].map(M));
  const P = { crestaD: M([-9, 100.6]), crestaI: M([9, 100.6]), eiasD: M([-13.2, 93.2]), eiasI: M([13.2, 93.2]), sinfisis: M([0, 84.3]), caderaD: M([-9.2, 87]), caderaI: M([9.2, 87]),
    trocanterD: M([-14.3, 85]), trocanterI: M([14.3, 85]), sacro: M([0, 91]) };
  return { svg: s, P };
}
module.exports.pelvisAP = pelvisAP;

// ================================================================ COLUMNA AP
// Cuerpos vertebrales con pedículos, apófisis transversas y espinosas, de 'desde' a 'hasta' (figura de frente).
function columnaAP(o = {}) {
  const { T = X(), desde = "T1", hasta = "L5" } = o;
  const orden = [...Array.from({ length: 7 }, (_, i) => "C" + (i + 1)), ...Array.from({ length: 12 }, (_, i) => "T" + (i + 1)), ...Array.from({ length: 5 }, (_, i) => "L" + (i + 1))];
  const lista = orden.slice(orden.indexOf(desde), orden.indexOf(hasta) + 1);
  const M = ([x, h]) => T([x, yH(h)]);
  let s = "";
  const P = {};
  for (const v of lista) {
    const n = +v.slice(1), h = VERT[v];
    const w = v[0] === "C" ? 1.6 : v[0] === "T" ? 1.7 + n * 0.06 : 2.4 + n * 0.1, a = v[0] === "C" ? 0.68 : v[0] === "T" ? 0.95 + n * 0.03 : 1.3;
    const tr = v[0] === "L" ? (n === 3 ? 4.6 : 3.8) : v[0] === "T" ? 3.2 - n * 0.06 : 2.4;
    for (const sg of [-1, 1]) s += huesoP([[sg * w * 0.8, h + a * 0.4], [sg * tr, h + a * 0.3], [sg * tr, h - a * 0.2], [sg * w * 0.8, h - a * 0.4]].map(M), 'opacity=".9"', 0.5);
    s += huesoP([[-w, h + a], [w, h + a], [w * 1.04, h - a], [-w * 1.04, h - a]].map(M), "", 0.45);
    for (const sg of [-1, 1]) s += huesoSuperpuesto(elipse([sg * w * 0.62, yH(h + a * 0.25)], 0.42, 0.55).map(T));
    s += huesoSuperpuesto([[0, yH(h + a * 0.2)], [0.45, yH(h - a * 0.6)], [0, yH(h - a * 1.5)], [-0.45, yH(h - a * 0.6)]].map(T));
    P[v] = M([0, h]);
  }
  return { svg: s, P };
}
module.exports.columnaAP = columnaAP;

// ================================================================ HOMBRO AP (derecho visto de frente; para el izquierdo, flip en T)
// Local en cm: origen en el centro de la articulación glenohumeral, x hacia lateral (+), y hacia abajo.
function hombroAP(o = {}) {
  const { T = X() } = o;
  const hum = [[-1.4, -0.4], [-1.1, -1.9], [0.0, -2.6], [1.5, -2.6], [2.7, -1.9], [3.3, -0.6], [3.4, 1.0], [3.0, 2.6], [2.7, 4.4], [2.6, 8], [2.5, 18], [0.3, 18], [0.3, 8], [0.4, 4.6], [-0.4, 3.1], [-1.2, 1.6]];
  const escap = [[-1.6, -1.8], [-1.1, -0.6], [-1.1, 1.0], [-1.6, 2.0], [-2.6, 3.0], [-4.6, 6.6], [-7.2, 10.6], [-8.6, 12.6], [-9.6, 12.2], [-10.4, 7.0], [-10.6, 1.0], [-10.2, -3.0], [-7.0, -2.6], [-4.2, -2.4], [-2.6, -2.7]];
  const acrom = [[-6.5, -3.9], [-3.0, -4.6], [0.2, -4.4], [2.6, -4.0], [2.9, -3.3], [0.6, -3.3], [-2.4, -3.3], [-6.4, -2.8]];
  const coraco = [[-2.8, -2.7], [-2.0, -3.1], [-0.6, -2.7], [0.3, -2.0], [-0.2, -1.6], [-1.2, -2.0], [-2.2, -2.0]];
  const clav = [[2.0, -4.6], [0.0, -4.5], [-3.0, -4.0], [-6.0, -3.6], [-9.0, -3.8], [-12.0, -4.4], [-14.2, -4.4]];
  let s = huesoP(mapa(T, escap), 'opacity=".85"') + huesoP(mapa(T, hum)) + huesoP(mapa(T, coraco)) + huesoP(mapa(T, acrom)) +
    huesoP(perfilHueso(clav, [[0, 0.8], [0.3, 0.6], [0.7, 0.62], [1, 0.9]], 0.6).map(T));
  s += huesoSuperpuesto(mapa(T, [[-1.15, -1.8], [-0.7, -0.4], [-0.7, 1.0], [-1.15, 2.0]])); // reborde anterior de la glena
  s += lineaHueso(mapa(T, [[1.4, -2.6], [2.0, -0.6], [2.9, 1.4]]), 0.9); // cuello anatómico / troquíter
  const P = { articulacion: T([-0.6, 0]), acromion: T([2.6, -4.0]), coracoides: T([0.3, -2.0]), troquiter: T([3.3, -0.6]), clavicula: T([-6, -3.7]), escapula: T([-8.6, 12.6]) };
  return { svg: s, P };
}
module.exports.hombroAP = hombroAP;

// ================================================================ CODO AP y LATERAL
// AP: codo extendido, mano en supinación. Local en cm: origen en el centro de la articulación, x hacia lateral (+), y hacia distal.
function codoAP(o = {}) {
  const { T = X(), largoH = 16, largoA = 18 } = o;
  const hum = [[-1.3, -largoH], [-1.4, -7], [-2.2, -4.4], [-3.5, -2.6], [-3.8, -1.7], [-3.0, -1.1], [-2.5, -0.2], [-2.0, 0.5], [-0.9, 0.35], [-0.5, -0.1], [0.4, 0.15], [1.4, 0.05], [2.4, -0.4], [2.9, -1.4],
    [3.1, -2.3], [2.4, -3.6], [1.6, -6], [1.3, -largoH]];
  const cub = [[-2.4, 0.75], [-1.9, 0.6], [-0.7, 0.62], [0.0, 0.95], [0.2, 1.8], [-0.2, 3.0], [-0.4, 6], [-0.45, largoA], [-1.6, largoA], [-1.7, 6], [-1.6, 3.2], [-2.6, 1.8]];
  const rad = [[0.55, 0.45], [2.65, 0.4], [2.75, 1.25], [2.15, 1.55], [2.0, 2.6], [2.3, 4.5], [2.7, 9], [2.8, largoA], [1.4, largoA], [1.2, 9], [0.9, 4.6], [1.1, 3.6], [0.95, 2.4], [1.2, 1.55], [0.55, 1.25]];
  let s = huesoP(mapa(T, cub)) + huesoP(mapa(T, rad)) + huesoP(mapa(T, hum));
  s += huesoSuperpuesto(mapa(T, elipse([-0.4, -2.3], 1.1, 0.8))) + huesoSuperpuesto(mapa(T, [[-1.6, -1.5], [-2.2, -0.3], [-1.4, 0.4], [-0.6, -0.5], [-0.8, -1.6]])); // fosa olecraneana y olécranon
  const P = { centro: T([0, 0.2]), epicondiloMedial: T([-3.8, -1.7]), epicondiloLateral: T([3.1, -2.3]), cabezaRadio: T([1.7, 0.9]), coronoides: T([-0.5, 0.8]) };
  return { svg: s, P };
}
module.exports.codoAP = codoAP;
// lateral con flexión (90° por defecto): húmero hacia -y; antebrazo girado 'flex' grados hacia adelante (+x = anterior).
function codoLateral(o = {}) {
  const { T = X(), flex = 90, largoH = 16, largoA = 18 } = o;
  const hum = [[-1.2, -largoH], [-1.3, -6], [-1.9, -3.2], [-2.2, -1.6], [-1.6, -0.2], [-0.4, 1.2], [1.0, 1.4], [2.2, 0.6], [2.4, -0.8], [1.7, -2.4], [1.2, -6], [1.2, -largoH]];
  const A = (p) => T(rotar(p, -flex)); // antebrazo: dirección +y rotada hacia adelante
  const cub = [[-2.6, -2.0], [-1.6, -2.4], [-0.6, -1.4], [0.0, 0.0], [1.6, 0.5], [1.4, 1.3], [0.6, 1.6], [0.5, 4], [0.3, largoA], [-0.9, largoA], [-1.2, 5], [-1.9, 1.5], [-2.7, -0.6]];
  const rad = [[0.9, 0.9], [2.4, 1.2], [2.3, 2.4], [1.6, 2.6], [1.4, 4.0], [1.6, 8], [1.7, largoA], [0.6, largoA], [0.4, 8], [0.7, 3.8], [0.6, 2.2]];
  let s = huesoP(mapa(A, rad), 'opacity=".9"') + huesoP(mapa(A, cub)) + huesoP(mapa(T, hum));
  s += `<path d="${circulo(T([0.4, 0]), 1.25 * T.s)}" fill="none" stroke="${BONEO}" stroke-width="1"/>` + `<path d="${circulo(T([0.4, 0]), 0.75 * T.s)}" fill="none" stroke="${BONEO}" stroke-width="0.9"/>`; // tróclea y cóndilo concéntricos
  const P = { centro: T([0.4, 0]), olecranon: A([-2.2, -1.6]), cabezaRadio: A([1.6, 1.8]) };
  return { svg: s, P };
}
module.exports.codoLateral = codoLateral;

// ================================================================ TOBILLO Y PIE LATERAL
// Local en cm: origen en la cúpula del astrágalo, x hacia los dedos (+), y hacia abajo; planta en y ≈ 7,6.
function pieLateral(o = {}) {
  const { T = X(), largoTibia = 14 } = o;
  const tibia = [[-1.7, -largoTibia], [-1.8, -5], [-2.2, -1.8], [-2.0, -0.2], [-0.8, 0.15], [0.8, 0.1], [1.9, -0.4], [2.1, -1.6], [1.6, -5], [1.5, -largoTibia]];
  const perone = [[-1.9, -largoTibia], [-1.9, -4], [-2.4, -1.2], [-2.3, 1.6], [-1.6, 2.6], [-0.9, 1.6], [-0.7, -1.2], [-0.9, -4], [-1.0, -largoTibia]];
  const astr = [[-1.9, 0.5], [-0.8, 0.2], [0.8, 0.2], [1.9, 0.6], [3.1, 1.0], [4.0, 1.5], [4.1, 2.4], [3.3, 2.8], [2.0, 2.4], [0.8, 2.9], [-1.0, 3.0], [-2.1, 2.4]];
  const calc = [[-2.4, 3.2], [0.4, 3.2], [2.4, 3.0], [3.4, 3.5], [3.5, 5.0], [2.6, 5.4], [0.4, 6.2], [-2.0, 6.8], [-4.4, 6.9], [-5.6, 6.0], [-5.6, 4.2], [-4.6, 3.3]];
  const nav = [[4.2, 1.6], [5.3, 1.7], [5.4, 3.2], [4.3, 3.0]];
  const cub = [[3.6, 3.7], [5.3, 3.6], [5.6, 5.0], [4.0, 5.5]];
  const cun = [[5.5, 1.8], [7.4, 2.0], [7.6, 4.0], [5.6, 3.9]];
  let s = huesoP(mapa(T, perone), 'opacity=".9"') + huesoP(mapa(T, tibia)) + huesoP(mapa(T, calc)) + huesoP(mapa(T, astr)) + huesoP(mapa(T, nav), "", 0.6) + huesoP(mapa(T, cub), "", 0.6) + huesoP(mapa(T, cun), "", 0.6);
  for (const [b, c, w] of [[[7.5, 2.4], [14.6, 5.0], 1.0], [[7.6, 3.4], [14.2, 5.9], 0.9], [[5.8, 5.0], [12.6, 6.6], 0.9]]) s += huesoP(mapa(T, huesoTubular(b, c, w * 1.3, w * 0.7, w * 1.1, "mc")), 'opacity=".9"');
  s += huesoP(mapa(T, huesoTubular([14.9, 5.2], [17.6, 5.9], 1.0, 0.6, 0.8))) + huesoP(mapa(T, huesoTubular([17.8, 6.0], [19.6, 6.5], 0.8, 0.5, 0.6, "distal")));
  s += huesoSuperpuesto(mapa(T, [[-0.6, -1.0], [0.9, -0.6], [1.0, 1.4], [-0.2, 1.8]])); // maléolo medial superpuesto
  const P = { tobillo: T([0, 0.8]), maleoloLateral: T([-1.6, 2.0]), base5MT: T([5.8, 5.0]), calcaneo: T([-4.4, 5.6]), talon: T([-5.6, 5.4]) };
  return { svg: s, P };
}
module.exports.pieLateral = pieLateral;

// ================================================================ CRÁNEO DE FRENTE (PA / AP)
// Local en cm: origen en el punto medio de la línea interorbitaria (nasion bajo), x hacia el lado izquierdo del paciente, y hacia abajo.
// petrosas: altura (y) a la que se proyectan las crestas petrosas (depende de la angulación: Caldwell ≈ 1,2, Waters ≈ 4,6).
function craneoFrente(o = {}) {
  const { T = X(), petrosas = 1.2 } = o;
  const boveda = [[0, -11.4], [4.2, -10.6], [6.8, -7.8], [7.4, -3.8], [7.0, 0.6], [6.4, 3.0]];
  // bóveda y paredes laterales (contorno simétrico, de la mitad izquierda espejada)
  let s = huesoP(mapa(T, [...boveda, ...boveda.slice(1).reverse().map(([x, y]) => [-x, y])]), 'opacity=".9"');
  // órbitas, senos y cavidad nasal
  for (const sg of [-1, 1]) {
    s += `<path d="${cr(mapa(T, elipse([sg * 3.3, -0.2], 1.9, 1.75, 0, 18)), true)}" fill="#f6f1e6" stroke="${BONEO}" stroke-width="1.3"/>`;
    s += huesoSuperpuesto(mapa(T, [[sg * 1.6, 2.0], [sg * 4.6, 1.8], [sg * 4.4, 4.4], [sg * 2.2, 4.8], [sg * 1.4, 3.6]])); // seno maxilar
    s += lineaHueso(mapa(T, [[sg * 5.4, 1.6], [sg * 6.8, 2.2]]), 1.2); // arco cigomático
  }
  s += `<path d="${cr(mapa(T, [[0, 0.6], [1.0, 1.6], [1.25, 3.3], [0.8, 4.2], [0, 4.4], [-0.8, 4.2], [-1.25, 3.3], [-1.0, 1.6]]), true)}" fill="#f6f1e6" stroke="${BONEO}" stroke-width="1.2"/>` +
    lineaHueso(mapa(T, [[0, 0.8], [0.1, 4.3]]), 1) + huesoSuperpuesto(mapa(T, [[0, -1.6], [1.4, -2.6], [0.9, -3.8], [0, -3.4], [-0.9, -3.8], [-1.4, -2.6]])); // tabique y seno frontal
  // crestas petrosas
  for (const sg of [-1, 1]) s += lineaHueso(mapa(T, [[sg * 6.6, petrosas + 0.6], [sg * 4.0, petrosas], [sg * 1.8, petrosas + 0.4]]), 1.6);
  // mandíbula y dientes
  s += huesoP(mapa(T, [[-5.3, 3.0], [-5.6, 5.6], [-5.0, 7.6], [-3.0, 9.6], [0, 10.4], [3.0, 9.6], [5.0, 7.6], [5.6, 5.6], [5.3, 3.0], [4.5, 3.3], [4.3, 6.4], [2.8, 7.0], [0, 7.2], [-2.8, 7.0], [-4.3, 6.4], [-4.5, 3.3]]), 'opacity=".95"');
  s += lineaHueso(mapa(T, [[-3.2, 5.6], [0, 6.0], [3.2, 5.6]]), 1);
  const P = { nasion: T([0, -0.4]), acantion: T([0, 4.4]), orbitaD: T([-3.3, -0.2]), orbitaI: T([3.3, -0.2]), menton: T([0, 10.4]), petrosa: T([4.0, petrosas]) };
  return { svg: s, P };
}
module.exports.craneoFrente = craneoFrente;

// ================================================================ CORTE DEL TRONCO (oblicuas vistas desde los pies o desde arriba)
// Local en cm: x hacia la izquierda del paciente, y hacia posterior. g: giro del cuerpo (grados) alrededor del centro.
// nivel: "lumbar" (cuerpo vertebral, espinosa, riñones) o "torax" (costillas, corazón).
function corteTronco(o = {}) {
  const { T = X(), g = 0, nivel = "lumbar" } = o;
  const Rg = (p) => T(rotar(p, g));
  const piel = nivel === "torax" ? elipse([0, 0], 16, 11, 0, 32) : elipse([0, 0], 15, 10.5, 0, 32).map(([x, y]) => [x, y < 0 ? y * 1.05 : y * 0.92]);
  let s = pielUnida([piel.map(Rg)]);
  const vb = nivel === "torax" ? [0, 5.4] : [0, 3.4], r = nivel === "torax" ? 1.6 : 2.2;
  s += huesoP(elipse(vb, r, r * 0.85, 0, 16).map(Rg)) + huesoP([[0, vb[1] + r], [1.3, vb[1] + r + 1.6], [0.5, vb[1] + r + 4.4], [-0.5, vb[1] + r + 4.4], [-1.3, vb[1] + r + 1.6]].map(Rg));
  for (const sg of [-1, 1]) s += huesoP([[sg * 1.2, vb[1] + r + 0.6], [sg * 4.0, vb[1] + 1.2], [sg * 4.0, vb[1] + 2.0], [sg * 1.4, vb[1] + r + 1.4]].map(Rg));
  if (nivel === "lumbar") for (const sg of [-1, 1]) s += organo(elipse([sg * 6.0, 3.2], 2.0, 3.2, sg * -30, 14).map(Rg), "#ecd8d0", "#c8a59a");
  else s += organo(elipse([2.6, -2.4], 5.0, 4.0, 20, 16).map(Rg), "#f1d9d6", "#d2a9a4");
  return { svg: s, P: { centro: Rg([0, 0]), vertebra: Rg(vb), espalda: Rg([0, 10]), frente: Rg([0, -10.5]) }, T: Rg };
}
module.exports.corteTronco = corteTronco;
