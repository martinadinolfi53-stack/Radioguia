// Esquemas de columna (cervical, torácica, lumbar, escoliosis, sacro-cóccix, sacroilíacas).
// Adaptados de referencia-tecnicas1-columna.cjs (estilo aprobado) a los datos de cada ficha.
const {
  SK, SKO, RED, BLUE, AMB, INK, MUTE, BONE, BONEO,
  table, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, side,
  piel, linea, hueso, etiquetaHueso, mk, cabezaPerfil, cabezaFrente,
} = require("./estilo.cjs");

const f1 = (n) => n.toFixed(1);

// ---------- silueta de perfil (cabeza a la izquierda, cara hacia arriba, espalda abajo) ----------
// Coordenadas base = muestra aprobada de lumbar (nuca en (105.3,252), mesa en y=252, escala de cabeza 0.42).
// escena(s, tx, ty) escala la silueta base en s y lleva la nuca a (tx,ty).
const NX = 105.28, NY = 252;
function escena(s, tx, ty) {
  const X = (x) => tx + s * (x - NX), Y = (y) => ty + s * (y - NY);
  const tp = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => `${f1(X(+a))},${f1(Y(+b))}`);
  return { s, X, Y, tp, cabeza: (o = {}) => cabezaPerfil(tx, ty, { s: 0.42 * s, ...o }) };
}
const CUELLO = "C176,226 180,212 196,200";
const PECHO = "C222,184 256,178 286,182";
const ABDOMEN = "C312,188 336,196 362,198 C380,199 396,198 412,198";
// caderas y rodillas flexionadas
const PIERNAS_FLEX = "C440,180 470,158 494,142 C506,134 520,138 522,152 C540,190 562,222 576,234 C590,236 612,236 628,240 " +
  "C640,244 640,252 628,252 L578,252 C568,252 562,246 558,240 C546,222 528,196 512,178 C506,172 498,172 492,178 " +
  "C474,198 456,222 448,236 C442,248 434,252 420,252 Z";
// piernas extendidas, pies hacia arriba
const PIERNAS_EXT = "C440,200 480,206 520,212 C540,214 556,214 572,218 C610,224 640,226 660,228 C664,220 666,206 670,198 " +
  "C673,192 682,192 684,200 C686,214 688,232 688,246 C688,252 680,252 672,252 L420,252 Z";
// brazo extendido hacia delante (decúbito lateral visto desde el tubo): reemplaza a PECHO
const BRAZO_ADELANTE = "L226,160 C230,152 234,148 240,147 L292,134 C302,132 306,146 296,150 L248,162 C243,163 240,166 239,170 " +
  "L224,189 C244,182 262,179 286,182";
// brazo al costado del cuerpo (línea interna)
const BRAZO_COSTADO = "M206,206 C240,214 272,224 300,230 C330,234 360,232 384,228 C396,226 404,232 398,240 C392,246 380,246 366,244 C336,242 300,244 270,238 C240,232 214,226 200,220";

// vértebra vista de perfil: cuerpo rectangular con esquinas redondeadas (cx,cy en coordenadas finales)
function vert(cx, cy, w, h, rot = 0) {
  const x = cx - w / 2, y = cy - h / 2, r = Math.min(2.5, w / 4);
  return `<g transform="rotate(${rot} ${f1(cx)} ${f1(cy)})">` + hueso(`M${f1(x + r)},${f1(y)} H${f1(x + w - r)} Q${f1(x + w)},${f1(y)} ${f1(x + w)},${f1(y + r)} V${f1(y + h - r)} Q${f1(x + w)},${f1(y + h)} ${f1(x + w - r)},${f1(y + h)} H${f1(x + r)} Q${f1(x)},${f1(y + h)} ${f1(x)},${f1(y + h - r)} V${f1(y + r)} Q${f1(x)},${f1(y)} ${f1(x + r)},${f1(y)} Z`) + `</g>`;
}
// hueso semitransparente (para que se vean las vértebras detrás del ilíaco)
const huesoT = (d, op = 0.6) => `<path d="${d}" fill="${BONE}" fill-opacity="${op}" stroke="${BONEO}" stroke-width="1.4" stroke-linejoin="round"/>`;
const resaltar = (cx, cy, w, h) => `<rect x="${f1(cx - w / 2 - 3)}" y="${f1(cy - h / 2 - 3)}" width="${f1(w + 6)}" height="${f1(h + 6)}" rx="4" fill="none" stroke="${RED}" stroke-width="1.4" stroke-dasharray="3 2"/>`;

// columna lumbar + sacro + coxal, en coordenadas base (E = escena)
const LUMB = [["L1", 286], ["L2", 308], ["L3", 330], ["L4", 352], ["L5", 374]];
const LY = 232;
function lumbares(E, { etiquetas = true, marca = null, izq = [] } = {}) {
  const w = 17 * E.s, h = 14 * E.s;
  let s = "";
  for (const [n, x] of LUMB) {
    s += vert(E.X(x), E.Y(LY), w, h);
    if (marca === n) s += resaltar(E.X(x), E.Y(LY), w, h);
  }
  s += hueso(E.tp("M386,225 C398,226 410,234 418,244 L415,249 C404,247 394,245 387,240 Z")); // sacro
  if (etiquetas) s += LUMB.map(([n, x]) => n === marca ? etiquetaHueso(E.X(x) + 3, E.Y(LY - 7) - 5, n) : izq.includes(n) ? etiquetaHueso(E.X(x) - 3, E.Y(LY + 7) + 10.5, n, "end") : etiquetaHueso(E.X(x), E.Y(LY + 7) + 10.5, n, "middle")).join("");
  return s;
}
// coxal de perfil (cresta ilíaca a la izquierda = craneal, anterior arriba): ala ilíaca con la cresta remarcada,
// acetábulo, rama del pubis hacia la sínfisis (arriba a la derecha) e isquion (abajo a la derecha)
function coxal(E, op = 0.6) {
  const ala = E.tp("M386,207 C370,201 351,210 352,226 C353,240 362,247 373,246 C383,245 390,239 398,238 C404,240 408,246 416,249 C424,250 428,244 424,238 C421,233 420,228 422,223 C424,218 422,213 418,210 C410,207 400,212 394,212 Z");
  const cresta = E.tp("M386,207 C370,201 351,210 352,226 C353,240 362,247 373,246");
  return huesoT(ala, op) + `<path d="${cresta}" fill="none" stroke="${BONEO}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<circle cx="${f1(E.X(410))}" cy="${f1(E.Y(229))}" r="${f1(6 * E.s)}" fill="none" stroke="${BONEO}" stroke-width="1.1"/>`;
}

// ---------- vistas laterales en decúbito supino (escala de la muestra aprobada) ----------
const SUP = escena(1, NX, NY);
const supinoFlex = () => piel(SUP.cabeza().d + " " + SUP.tp(CUELLO + " " + PECHO + " " + ABDOMEN + " " + PIERNAS_FLEX)) + linea(BRAZO_COSTADO) + SUP.cabeza().cara;
const supinoExt = () => piel(SUP.cabeza().d + " " + SUP.tp(CUELLO + " " + PECHO + " " + ABDOMEN + " " + PIERNAS_EXT)) + linea(BRAZO_COSTADO) + SUP.cabeza().cara;

// columna dorsal T1-T12 (coordenadas base)
const TX = Array.from({ length: 12 }, (_, i) => 186 + i * 9.5), TY = 238;
function dorsales(E, marca = 7) {
  const w = 7.6 * E.s, h = 11 * E.s;
  let s = "";
  TX.forEach((x, i) => { s += vert(E.X(x), E.Y(TY), w, h); });
  s += resaltar(E.X(TX[marca - 1]), E.Y(TY), w, h);
  s += etiquetaHueso(E.X(TX[0]), E.Y(TY + 5.5) + 11, "T1", "middle") + etiquetaHueso(E.X(TX[11]), E.Y(TY + 5.5) + 11, "T12", "middle");
  return s;
}

// ---------- decúbito lateral visto desde el tubo ----------
const LAT = escena(1.25, 66, 226);
function latDec({ cojin = false, apoyo = true } = {}) {
  const E = LAT, H = E.cabeza();
  let s = "";
  if (apoyo) s += `<rect x="${f1(E.X(292))}" y="${f1(E.Y(246))}" width="${f1(E.s * 76)}" height="${f1(E.s * 14)}" rx="6" fill="#d7dbe3" stroke="#8a8f9c"/>`;
  s += piel(H.d + " " + E.tp(CUELLO + " " + BRAZO_ADELANTE + " " + ABDOMEN + " " + PIERNAS_FLEX)) + H.cara;
  if (cojin) s += `<rect x="-17" y="-8" width="34" height="16" rx="6" fill="#d7dbe3" stroke="#8a8f9c" transform="translate(${f1(E.X(510))} ${f1(E.Y(160))}) rotate(-42)"/>`;
  s += txt(E.X(200), E.Y(252) + 14, "espalda", 10.5, MUTE);
  return s;
}


// ======================= helpers nuevos =======================
const num = (s) => String(s).split(",").map(Number);
const pts = (d) => [...d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => [+m[1], +m[2]]);
// puntos reales de un path con M/L/C (muestrea las curvas de Bézier)
function curvaPts(d) {
  const out = []; let cur = null;
  for (const seg of d.match(/[MLCQZ][^MLCQZ]*/g)) {
    const t = seg[0], P = pts(seg);
    if (t === "M" || t === "L") { P.forEach((p) => out.push(p)); cur = P[P.length - 1]; }
    else if (t === "C") for (let i = 0; i + 2 < P.length; i += 3) {
      const [a, b, c] = [P[i], P[i + 1], P[i + 2]];
      for (let k = 1; k <= 12; k++) { const u = k / 12, v = 1 - u; out.push([v * v * v * cur[0] + 3 * v * v * u * a[0] + 3 * v * u * u * b[0] + u * u * u * c[0], v * v * v * cur[1] + 3 * v * v * u * a[1] + 3 * v * u * u * b[1] + u * u * u * c[1]]); }
      cur = c;
    }
  }
  return out;
}
// silueta formada por varias piezas: un solo contorno exterior (como body() de estilo.cjs)
const union = (ds) => "<g>" + ds.map((d) => `<path d="${d}" fill="${SK}" stroke="${SKO}" stroke-width="4" stroke-linejoin="round"/>`).join("") +
  ds.map((d) => `<path d="${d}" fill="${SK}"/>`).join("") + "</g>";
// transformar los pares x,y de un path con una función T(x,y) -> [X,Y]
const tpF = (d, T) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => { const [X, Y] = T(+a, +b); return `${f1(X)},${f1(Y)}`; });
function Tf(s, tx, ty, rot = 0, flip = false) {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  return (x, y) => { const dx = x * s * (flip ? -1 : 1), dy = y * s; return [tx + dx * c - dy * sn, ty + dx * sn + dy * c]; };
}
const rotAround = (cx, cy, deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r); return (x, y) => [cx + (x - cx) * c - (y - cy) * sn, cy + (x - cx) * sn + (y - cy) * c]; };
// cápsula (miembro) entre p1 y p2, ancho w1 -> w2, extremos redondeados; coordenadas locales
function capsula(p1, p2, w1, w2 = w1) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const a = (p, n, u) => `${f1(p[0] + nx * n + ux * u)},${f1(p[1] + ny * n + uy * u)}`;
  const h1 = w1 / 2, h2 = w2 / 2;
  return `M${a(p1, h1, 0)} L${a(p2, h2, 0)} C${a(p2, h2, h2 * 1.1)} ${a(p2, -h2, h2 * 1.1)} ${a(p2, -h2, 0)} L${a(p1, -h1, 0)} C${a(p1, -h1, -h1 * 1.1)} ${a(p1, h1, -h1 * 1.1)} ${a(p1, h1, 0)} Z`;
}
// cota: línea con topes y rótulo
function cota(x1, y1, x2, y2, label, lx, ly, color = BLUE, anchor = "middle") {
  const L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L * 4, ny = (x2 - x1) / L * 4;
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="1.3"/>` +
    `<line x1="${f1(x1 - nx)}" y1="${f1(y1 - ny)}" x2="${f1(x1 + nx)}" y2="${f1(y1 + ny)}" stroke="${color}" stroke-width="1.3"/>` +
    `<line x1="${f1(x2 - nx)}" y1="${f1(y2 - ny)}" x2="${f1(x2 + nx)}" y2="${f1(y2 + ny)}" stroke="${color}" stroke-width="1.3"/>` +
    txt(lx, ly, label, 11, color, anchor, 700);
}
const dash = (x1, y1, x2, y2, c = RED) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
const thin = (x1, y1, x2, y2, c = BONEO) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="0.9"/>`;
const panelSep = (x = 380) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>`;
const vista2 = (x, t) => `<text x="${x}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${t.toUpperCase()}</text>`;
const lines = (x, y, arr, size = 11.5, color = MUTE, anchor = "start", dy = 15) => arr.map((t, i) => txt(x, y + i * dy, t, size, color, anchor)).join("");
const collarin = (d) => `<path d="${d}" fill="#b9c6d8" fill-opacity=".55" stroke="#6f7f96" stroke-width="1.3"/>`;
const apoyo = (d) => `<path d="${d}" fill="#d7dbe3" stroke="#8a8f9c" stroke-width="1.3" stroke-linejoin="round"/>`;
// rayo extra (solo línea, sin tubo) que llega a (tx,ty) con dirección dir, para mostrar un segundo ángulo
function rayoExtra(tx, ty, dir, len, label, lxOff = 0, lyOff = 0) {
  const r = (dir * Math.PI) / 180, sx = tx - len * Math.cos(r), sy = ty - len * Math.sin(r);
  return `<line x1="${f1(sx)}" y1="${f1(sy)}" x2="${f1(tx)}" y2="${f1(ty)}" stroke="${RED}" stroke-width="1.6" stroke-dasharray="7 4"/>` +
    txt(sx + lxOff, sy + lyOff, label, 12, RED, "middle", 700);
}

// ---------- cabeza + cuello en decúbito (escala de la muestra de Atlas y Axis) ----------
// La cabeza rota (extensión = rot negativo) apoyando el occipital en la mesa; el tronco sigue igual.
// chestY = altura (y) del frente del tórax.
function cuelloDecubito({ s = 0.8, tx = 190, tableY = 252, rot = 0, boca = "cerrada", chestY = null, backY = null } = {}) {
  const bY = backY ?? tableY;
  let H = cabezaPerfil(tx, tableY, { s, rot, boca });
  const maxY = Math.max(...curvaPts(H.d).map((p) => p[1]));
  const ty = tableY - (maxY - tableY) - 1;
  H = cabezaPerfil(tx, ty, { s, rot, boca });
  const P0 = mk(s, 232, 398, tx, tableY);
  const p = (x, y) => num(H.P(x, y)), q = (x, y) => num(P0(x, y));
  const [nx, ny] = p(232, 398), [ex, ey] = p(360, 346);
  const [xc, yc0] = q(466, 328), cy = chestY ?? yc0;
  const cuerpo = H.d + ` C${f1(ex + 18)},${f1(ey + 4)} ${f1(xc - 46)},${f1(cy + 10)} ${f1(xc)},${f1(cy)} C${f1(xc + 40)},${f1(cy - 5)} ${f1(xc + 90)},${f1(cy - 6)} ${f1(xc + 130)},${f1(cy - 3)} L746,${f1(cy + 2)} L746,${f1(bY)} L${f1(nx + 60)},${f1(bY)} Q${f1(nx + 6)},${f1(bY)} ${f1(nx)},${f1(ny)} Z`;
  const mand = hueso(`M${H.P(376, 332)} C${H.P(378, 342)} ${H.P(364, 348)} ${H.P(348, 352)} L${H.P(330, 358)} C${H.P(324, 360)} ${H.P(320, 356)} ${H.P(318, 352)} L${H.P(276, 322)} C${H.P(272, 318)} ${H.P(278, 312)} ${H.P(283, 315)} L${H.P(322, 344)} C${H.P(326, 347)} ${H.P(330, 347)} ${H.P(336, 345)} L${H.P(352, 340)} C${H.P(362, 337)} ${H.P(368, 334)} ${H.P(370, 330)} Z`);
  const P = H.P;
  const c1 = hueso(`M${P(306, 362)} Q${P(306, 359)} ${P(310, 359)} L${P(328, 359)} Q${P(332, 359)} ${P(332, 362)} L${P(332, 370)} Q${P(332, 373)} ${P(328, 373)} L${P(310, 373)} Q${P(306, 373)} ${P(306, 370)} Z`);
  const c2 = hueso(`M${P(338, 363)} L${P(360, 363)} Q${P(364, 363)} ${P(364, 367)} L${P(364, 377)} Q${P(364, 380)} ${P(360, 380)} L${P(338, 380)} Q${P(335, 380)} ${P(335, 377)} L${P(335, 369)} L${P(322, 369)} Q${P(314, 368)} ${P(314, 365.5)} Q${P(314, 363)} ${P(322, 362.5)} L${P(335, 363)} Z`);
  return { H, p, q, cuerpo, mand, c12: c1 + c2, fig: piel(cuerpo) + H.cara, nuca: [nx, ny] };
}

// ---------- cuerpo de frente (de pie o, rotado, en decúbito visto desde arriba) ----------
// coordenadas locales: centro de la cabeza (0,0), r = 26; hombros (±58,84); crestas ilíacas y ≈ 200; caderas 246; tobillos 440.
const TORSO = "M-48,66 C-20,58 20,58 48,66 C62,70 70,82 70,98 L62,170 C60,196 64,222 66,246 L-66,246 C-64,222 -60,196 -62,170 L-70,98 C-70,82 -62,70 -48,66 Z";
const TORSO_SUP = "M-48,66 C-20,58 20,58 48,66 C62,70 70,82 70,98 L62,170 C61,184 61,196 62,214 L-62,214 C-61,196 -61,184 -62,170 L-70,98 C-70,82 -62,70 -48,66 Z";
const PELVIS = "M-62,186 L62,186 C62,206 64,226 66,246 L-66,246 C-64,226 -62,206 -62,186 Z";
const CUELLO_F = "M-11,16 L11,16 L12,70 L-12,70 Z";
// brazo: lista de ángulos (0 = colgando, positivo = hacia afuera) y largos; lado +1 derecha del dibujo, -1 izquierda
function brazo(lado, segs, hombro = [58, 84]) {
  let p = [hombro[0] * lado, hombro[1]]; const out = [];
  segs.forEach(([ang, L, w1, w2]) => {
    const r = (ang * Math.PI) / 180, q = [p[0] + lado * Math.sin(r) * L, p[1] + Math.cos(r) * L];
    out.push(capsula(p, q, w1, w2)); p = q;
  });
  return { ds: out, mano: p };
}
const BRAZO_ABAJO = [[8, 78, 22, 18], [4, 74, 18, 15]];
const pierna = (lado, abierto = 0) => [capsula([lado * 33, 236], [lado * (30 + abierto), 440], 52, 20), capsula([lado * (30 + abierto), 440], [lado * (40 + abierto), 452], 18, 16)];
// columna de frente: niveles (y local) de cada vértebra
const NIV = {};
["C3", "C4", "C5", "C6", "C7"].forEach((n, i) => (NIV[n] = 30 + i * 8));
for (let i = 0; i < 12; i++) NIV["T" + (i + 1)] = 70 + i * 9;
for (let i = 0; i < 5; i++) NIV["L" + (i + 1)] = 180 + i * 11;
const CRESTA = 212, NOTCH = 78;
function columnaFrente(T, { dx = () => 0, s = 1, lumbar = true, desde = "C3" } = {}) {
  let o = "", on = false;
  for (const [n, y] of Object.entries(NIV)) {
    if (n === desde) on = true;
    if (!on || (!lumbar && n[0] === "L")) continue;
    const [w, h] = n[0] === "C" ? [13, 6] : n[0] === "T" ? [16, 7.4] : [21, 9.4];
    const [X, Y] = T(dx(y), y);
    o += vert(X, Y, w * s, h * s);
  }
  return o;
}
// pelvis ósea de frente (alas ilíacas + sacro), coordenadas locales; crestas en y ≈ 212
function pelvisFrente(T, op = 0.95) {
  const ala = (l) => `M${l * 10},228 C${l * 22},214 ${l * 40},208 ${l * 58},212 C${l * 64},220 ${l * 62},236 ${l * 54},252 C${l * 46},262 ${l * 34},266 ${l * 24},268 C${l * 20},256 ${l * 14},240 ${l * 10},228 Z`;
  return huesoT(tpF(ala(-1), T), op) + huesoT(tpF(ala(1), T), op) + huesoT(tpF("M-11,232 L11,232 L7,260 L0,268 L-7,260 Z", T), op);
}
const clavFrente = (T) => hueso(tpF("M-6,76 C-20,70 -40,72 -56,78 L-55,82 C-40,77 -20,75 -6,80 Z", T)) + hueso(tpF("M6,76 C20,70 40,72 56,78 L55,82 C40,77 20,75 6,80 Z", T));
const cuelloCollar = (T) => collarin(tpF("M-18,22 C-6,26 6,26 18,22 L19,66 C6,70 -6,70 -19,66 Z", T));
// figura de frente: brazos = { izq: segs, der: segs } (izq = lado -1 del dibujo local), piernas opcionales
function figuraFrente(T, { izq = BRAZO_ABAJO, der = BRAZO_ABAJO, hIzq = [58, 84], hDer = [58, 84], piernas = true, torso = TORSO, extra = [] } = {}) {
  const ds = [CUELLO_F, torso, ...brazo(-1, izq, hIzq).ds, ...brazo(1, der, hDer).ds, ...extra];
  if (piernas) ds.push(PELVIS, ...pierna(-1), ...pierna(1));
  return union(ds.map((d) => tpF(d, T)));
}
const nucaAtras = (cx, cy, r, rot = 0) => `<g transform="rotate(${rot} ${cx} ${cy})">` +
  `<ellipse cx="${cx - r * 0.98}" cy="${cy}" rx="${r * 0.16}" ry="${r * 0.28}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
  `<ellipse cx="${cx + r * 0.98}" cy="${cy}" rx="${r * 0.16}" ry="${r * 0.28}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
  `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.92}" ry="${r * 1.12}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
  `<path d="M${cx - r * 0.6},${cy + r * 0.62} Q${cx},${cy + r * 0.78} ${cx + r * 0.6},${cy + r * 0.62}" fill="none" stroke="${SKO}" stroke-width="1.3"/></g>`;

// ---------- corte transversal visto desde los pies ----------
// cuerpo elíptico (rx lateral, ry anteroposterior) rotado ang grados y apoyado sobre la mesa en tableY.
function corte({ cx, tableY, rx, ry, ang = 0, cuna = false, tipo = "torax" }) {
  const r = (ang * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const half = Math.sqrt((rx * sn) ** 2 + (ry * c) ** 2);
  const cy = tableY - half;
  const L = (x, y) => [cx + x * c - y * sn, cy + x * sn + y * c]; // y local + = posterior (hacia la mesa con ang 0)
  let s = "";
  if (cuna) {
    const a = L(rx * 0.35, ry * 0.94), b = L(-rx * 0.95, -ry * 0.3);
    s += apoyo(`M${f1(a[0])},${tableY} L${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])} L${f1(b[0] - 6)},${tableY} Z`);
  }
  s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${rx}" ry="${ry}" transform="rotate(${ang} ${f1(cx)} ${f1(cy)})" fill="${SK}" stroke="${SKO}" stroke-width="2"/>`;
  const v = L(0, ry * 0.5);
  if (tipo === "sacro") {
    s += `<g transform="rotate(${ang} ${f1(cx)} ${f1(cy)})">` +
      hueso(`M${f1(cx - 16)},${f1(cy + ry * 0.38)} L${f1(cx + 16)},${f1(cy + ry * 0.38)} L${f1(cx + 12)},${f1(cy + ry * 0.78)} L${f1(cx - 12)},${f1(cy + ry * 0.78)} Z`) +
      hueso(`M${f1(cx + 20)},${f1(cy + ry * 0.36)} C${f1(cx + rx * 0.5)},${f1(cy + ry * 0.05)} ${f1(cx + rx * 0.8)},${f1(cy - ry * 0.1)} ${f1(cx + rx * 0.82)},${f1(cy + ry * 0.12)} C${f1(cx + rx * 0.7)},${f1(cy + ry * 0.4)} ${f1(cx + rx * 0.4)},${f1(cy + ry * 0.72)} ${f1(cx + 15)},${f1(cy + ry * 0.8)} Z`) +
      hueso(`M${f1(cx - 20)},${f1(cy + ry * 0.36)} C${f1(cx - rx * 0.5)},${f1(cy + ry * 0.05)} ${f1(cx - rx * 0.8)},${f1(cy - ry * 0.1)} ${f1(cx - rx * 0.82)},${f1(cy + ry * 0.12)} C${f1(cx - rx * 0.7)},${f1(cy + ry * 0.4)} ${f1(cx - rx * 0.4)},${f1(cy + ry * 0.72)} ${f1(cx - 15)},${f1(cy + ry * 0.8)} Z`) +
      `</g>`;
  } else {
    s += `<g transform="rotate(${ang} ${f1(cx)} ${f1(cy)})">` + hueso(`M${f1(cx - 12)},${f1(cy + ry * 0.32)} L${f1(cx + 12)},${f1(cy + ry * 0.32)} L${f1(cx + 12)},${f1(cy + ry * 0.58)} L${f1(cx - 12)},${f1(cy + ry * 0.58)} Z`) +
      hueso(`M${f1(cx - 3)},${f1(cy + ry * 0.62)} L${f1(cx + 3)},${f1(cy + ry * 0.62)} L${f1(cx + 2)},${f1(cy + ry * 0.92)} L${f1(cx - 2)},${f1(cy + ry * 0.92)} Z`) + `</g>`;
  }
  return { s, L, cy, half };
}
// arco de ángulo entre dos direcciones (grados SVG) con centro (cx,cy)
function arco(cx, cy, r, a1, a2, label, color = BLUE, lr = r + 14) {
  const P = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x1, y1] = P(a1), [x2, y2] = P(a2), m = ((a1 + a2) / 2 * Math.PI) / 180;
  return `<path d="M${f1(x1)},${f1(y1)} A${r},${r} 0 0 ${a2 > a1 ? 1 : 0} ${f1(x2)},${f1(y2)}" fill="none" stroke="${color}" stroke-width="1.4"/>` +
    txt(cx + lr * Math.cos(m), cy + lr * Math.sin(m) + 4, label, 12.5, color, "middle", 700);
}

const riBorde = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10 3" opacity=".75"/>`;
// ---------- perfil de pie (cara a la derecha, espalda a la izquierda) ----------
function perfilDePie(tx, ty, s, headRot = 0, yEnd = 300) {
  const H = cabezaPerfil(tx, ty, { s, rot: 90 + headRot });
  const P0 = mk(s, 232, 398, tx, ty, 90);
  const xe = 232 + (yEnd - ty) / s;
  const d = H.d + ` L${P0(398, 352)} C${P0(420, 346)} ${P0(440, 334)} ${P0(466, 326)} C${P0(Math.min(500, xe - 40), 318)} ${P0(Math.min(540, xe - 20), 312)} ${P0(Math.min(600, xe - 1), 312)} L${P0(xe, 316)} L${P0(xe, 412)} L${P0(320, 412)} C${P0(270, 412)} ${P0(245, 402)} ${P0(232, 398)} Z`;
  const CV = [["C3", 382], ["C4", 402], ["C5", 422], ["C6", 442], ["C7", 462]];
  let vs = "";
  const P = H.P;
  const pos = {};
  for (const [n, x] of CV) { const [X, Y] = num(P0(x, 376)); pos[n] = [X, Y]; vs += vert(X, Y, 13 * s, 16 * s); }
  return { fig: piel(d) + H.cara, vs, pos, P0: (x, y) => num(P0(x, y)), P: (x, y) => num(H.P(x, y)) };
}

// ---------- vista desde arriba, decúbito supino (cabeza a la izquierda) ----------
function supinoArriba(X0, Y0, s, opts = {}) {
  const T = Tf(s, X0, Y0, -90);
  return { T, fig: figuraFrente(T, opts) + cabezaFrente(X0, Y0, 26 * s, -90) };
}

// ======================= COLUMNA CERVICAL =======================
function bocaAbierta() {
  const C = cuelloDecubito({ boca: "abierta" }), p = C.p;
  const [mx, my] = p(326, 262), [ix, iy] = p(319, 262), [, by] = p(319, 375);
  const [c1x, c1y] = p(306, 356), [c2x, c2y] = p(366, 362), [ox, oy] = p(318, 366);
  const rx = p(226, 418)[0];
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(rx, 268, 160, 10) + txt(rx + 170, 278, "RI 18 x 24 vertical · parrilla", 12, INK) +
    C.fig + C.c12 +
    etiquetaHueso(c1x - 2, c1y - 1, "C1", "end") + etiquetaHueso(c2x, c2y, "C2") +
    thin(ox, oy, ox + 6, oy + 18) + etiquetaHueso(ox + 8, oy + 22, "odontoides") +
    refline(ix, iy, ix, by) + dot(ix, iy) + dot(ix, by) +
    beam(mx, my, 90, 110) + dash(mx, my + 10, mx, 282) +
    txt(mx + 50, 40, "DFRI 100 cm", 12, MUTE) +
    note(mx + 2, 92, 420, 50, ["RC perpendicular al RI", "por el centro de la boca abierta (C1-C2)"], RED) +
    note(ix, by - 22, 420, 100, ["Incisivos superiores y punta", "de las mastoides: línea", "perpendicular a la mesa"], BLUE) +
    note(...p(340, 282), 420, 168, ["Abrir bien la boca al final,", "sin mover la cabeza"], "#7a3b33") +
    lines(30, 302, ["Decúbito supino o de pie · apnea · colimar ajustado a C1-C2", "Si la línea no queda perpendicular, angular el RC para compensar"])
  );
}

function fuchsFig() {
  const C = cuelloDecubito({ rot: -32, tx: 205 }), p = C.p;
  const A = p(382, 326), B = p(319, 375), T = p(340, 372);
  const dir = (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI;
  return { C, p, A, B, T, dir };
}
function fuchs() {
  const { C, p, A, B, T, dir } = fuchsFig();
  const r = (dir * Math.PI) / 180, ux = Math.cos(r), uy = Math.sin(r);
  const yRI = 268, xRI = T[0] + (yRI - T[1]) / Math.tan(r);
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(xRI - 75, yRI, 150, 10) + txt(xRI + 85, yRI + 10, "RI 18 x 24 horizontal · parrilla", 12, INK) +
    C.fig + C.mand + C.c12 +
    refline(A[0] - ux * 40, A[1] - uy * 40, B[0], B[1]) + dot(...A) + dot(...B) +
    txt(A[0] - ux * 40 - 8, A[1] - uy * 40 + 4, "LMM", 12, BLUE, "end", 700) +
    beam(T[0], T[1], dir, 140, { ref: dir }) + dash(T[0], T[1], xRI, yRI + 14) +
    note(T[0] - 70 * ux + 2, T[1] - 70 * uy, 420, 46, ["RC paralelo a la LMM", "entra 2,5 cm posteroinferior a las puntas", "de las mastoides y los ángulos mandibulares"], RED) +
    note(A[0] + 4, A[1] - 4, 420, 118, ["Mentón levantado: LMM casi", "perpendicular al RI", "(si no alcanza, angular algo a cefálico)"], BLUE) +
    etiquetaHueso(B[0] + 8, B[1] + 12, "mastoides") +
    lines(30, 302, ["Decúbito supino o de pie · PMS en la línea central, sin rotación · apnea · DFRI 100 cm", "RI centrado en la salida del RC · no hacerla si se sospecha traumatismo"])
  );
}

function judd() {
  // misma figura que Fuchs, espejada: paciente en prono con el mentón sobre la mesa
  const C0 = cuelloDecubito({ rot: -58, tx: 215 });
  const minY = Math.min(...curvaPts(C0.H.d).map((q) => q[1]));
  const K = 252 + minY;
  const C = cuelloDecubito({ rot: -58, tx: 215, chestY: minY + 6, backY: K - 158 }), p = C.p; // y -> K - y
  const m = ([x, y]) => [x, K - y];
  const A = m(p(382, 326)), B = m(p(319, 375)), T = m(p(340, 372));
  const dir = (Math.atan2(A[1] - B[1], A[0] - B[0]) * 180) / Math.PI; // de posterior (arriba) a anterior
  const r = (dir * Math.PI) / 180, ux = Math.cos(r), uy = Math.sin(r);
  const yRI = 268, xRI = T[0] + (yRI - T[1]) / Math.tan(r);
  return svg(
    view("Vista lateral · decúbito prono") + table(30, 730, 252) +
    ri(xRI - 75, yRI, 150, 10) + txt(xRI + 85, yRI + 10, "RI 18 x 24 horizontal · parrilla", 12, INK) +
    `<g transform="matrix(1 0 0 -1 0 ${f1(K)})">` + C.fig + C.mand + C.c12 + `</g>` +
    refline(B[0] - ux * 30, B[1] - uy * 30, A[0], A[1]) + dot(...A) + dot(...B) +
    txt(B[0] - ux * 30 - 8, B[1] - uy * 30, "LMM", 12, BLUE, "end", 700) +
    beam(T[0], T[1], dir, 125, { ref: dir }) + dash(T[0], T[1], xRI, yRI + 14) +
    note(T[0] - 50 * ux + 3, T[1] - 50 * uy, 430, 52, ["RC paralelo a la LMM", "misma alineación que en Fuchs"], RED) +
    note(A[0] + 2, A[1] - 6, 430, 128, ["Prono, mentón apoyado", "en el tablero"], INK) +
    lines(30, 302, ["Apnea · DFRI 100 cm · colimar ajustado a C1-C2", "No hacerla si se sospecha traumatismo cervical"])
  );
}

// cuello en decúbito supino a escala grande (AP axial); devuelve piezas
function cuelloGrande() {
  const E = escena(1.6, 150, 252);
  const H = E.cabeza({ rot: -8 });
  const cuerpo = H.d + " " + E.tp("C172,220 182,208 196,200 " + PECHO + " C312,188 336,196 362,198 L475,198 L475,252 Z");
  const mand = hueso(`M${H.P(376, 332)} C${H.P(378, 342)} ${H.P(364, 348)} ${H.P(348, 352)} L${H.P(330, 358)} C${H.P(324, 360)} ${H.P(320, 356)} ${H.P(318, 352)} L${H.P(276, 322)} C${H.P(272, 318)} ${H.P(278, 312)} ${H.P(283, 315)} L${H.P(322, 344)} C${H.P(326, 347)} ${H.P(330, 347)} ${H.P(336, 345)} L${H.P(352, 340)} C${H.P(362, 337)} ${H.P(368, 334)} ${H.P(370, 330)} Z`);
  const CX = [137, 145.5, 154, 162.5, 171, 179.5, 188], CY = 236;
  const w = 7 * E.s, h = 9 * E.s;
  let vs = "";
  CX.forEach((x) => { vs += vert(E.X(x), E.Y(CY), w, h); });
  const vx = (i) => E.X(CX[i]);
  return { E, H, fig: piel(cuerpo) + linea(BRAZO_COSTADO) + H.cara, mand, vs, vx, vy: E.Y(CY), w, h, CX, CY };
}
// RC angulado a cefálico que pasa por la vértebra i (0 = C1)
function apAxialCervical({ idx, ang, angLabel, collar = false, titulo, notas }) {
  const G = cuelloGrande(), E = G.E;
  const tx = G.vx(idx), ty = G.vy, t = Math.tan((ang * Math.PI) / 180);
  const skinY = E.Y(214), entX = tx + (ty - skinY) * t;
  const [m1x, m1y] = num(G.H.P(276, 322));
  const nombre = "C" + (idx + 1);
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(tx - 70, 268, 140, 10, notas.ri, tx + 80, 278) +
    G.fig + (collar ? collarin(E.tp("M167,220 C173,215 179,210 187,206 L190,251 L165,251 Z")) : "") +
    G.mand + G.vs + resaltar(tx, ty, G.w, G.h) +
    etiquetaHueso(G.vx(0) - 2, ty - G.h / 2 - 4, "C1", "middle") + etiquetaHueso(G.vx(6) + 2, ty - G.h / 2 - 4, "C7", "middle") +
    etiquetaHueso(m1x - 20, m1y - 16, "mandíbula", "end") + thin(m1x - 18, m1y - 18, m1x, m1y - 2) +
    tube(entX, skinY, -ang, 160, { angLabel: " " }) + txt(entX + Math.sin((ang * Math.PI) / 180) * 100 + 10, skinY - Math.cos((ang * Math.PI) / 180) * 100, angLabel, 13, RED, "start", 700) +
    dash(entX, skinY, entX - (276 - skinY) * t, 276) +
    txt(entX - 30, 86, "← cefálico", 12, RED, "end", 700) +
    etiquetaHueso(tx - 6, ty + G.h / 2 + 13, nombre, "end") +
    note(entX + 40, 120, 420, 52, notas.rc, RED) +
    note(...num(G.H.P(372, 316)), 205, 112, [notas.menton], INK, "end") +
    (collar ? note(E.X(188), E.Y(230), 560, 214, ["Con collarín colocado"], INK) : "") +
    lines(40, 302, notas.pie)
  );
}
const cervicalAPaxial = () => apAxialCervical({
  idx: 4, ang: 17.5, angLabel: "15-20°",
  notas: {
    ri: "RI 18 x 24 o 24 x 30 vertical · parrilla",
    rc: ["RC 15-20° cefálico, entra por C5", "(borde inferior del cartílago tiroides)", "RI centrado en el RC proyectado"],
    menton: "Mentón algo levantado",
    pie: ["Decúbito supino o de pie · PMS centrado · apnea · DFRI 100 cm", "Mentón superpuesto a la base del cráneo: la mandíbula solo tapa C1-C2"],
  },
});
const traumaAP = () => apAxialCervical({
  idx: 3, ang: 17.5, angLabel: "15-20°", collar: true,
  notas: {
    ri: "RI 24 x 30 vertical · parrilla",
    rc: ["RC 15-20° cefálico,", "entra por C4"],
    menton: "Sin mover la cabeza",
    pie: ["Hombros bajos · exponer después de una espiración completa · DFRI 100-120 cm", "No retirar el collarín hasta que el médico vea la lateral con haz horizontal"],
  },
});

function oblicuasCervical() {
  // panel 1: vista desde arriba, paciente de pie con la espalda girada 45° hacia el bucky
  const cx = 190, cy = 170, a = -45;
  const R = rotAround(cx, cy, a);
  const hom = `<ellipse cx="${cx}" cy="${cy}" rx="92" ry="34" transform="rotate(${a} ${cx} ${cy})" fill="${SK}" stroke="${SKO}" stroke-width="2"/>`;
  const [nX, nY] = R(cx, cy - 34);
  const nariz = `<path d="M${tpF(`${cx - 6},${cy - 22} L${cx},${cy - 34} L${cx + 6},${cy - 22}`, R)}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>`;
  const head = `<circle cx="${cx}" cy="${cy}" r="24" fill="${SK}" stroke="${SKO}" stroke-width="2"/>`;
  const [p1x, p1y] = R(cx - 120, cy), [p2x, p2y] = R(cx + 120, cy);
  // panel 2: vista lateral del haz
  const F = perfilDePie(560, 97, 0.62);
  const [c4x, c4y] = F.pos.C4;
  const dir = 180 + 17.5, len = 118;
  return svg(
    vista2(12, "1 · Vista desde arriba (de pie)") + panelSep() + vista2(392, "2 · Vista lateral del haz") +
    `<rect x="40" y="262" width="300" height="12" fill="#cfd3dc"/>` + txt(190, 290, "Bucky vertical · RI 24 x 30 vertical", 11, MUTE, "middle") +
    hom + nariz + head + etiquetaHueso(nX - 10, nY - 2, "nariz", "end") +
    refline(p1x, p1y, p2x, p2y) + `<line x1="${f1(p2x)}" y1="${f1(p2y)}" x2="${f1(p2x - 150)}" y2="${f1(p2y)}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    arco(p2x, p2y, 60, 180, 135, "45°") +
    `<line x1="${cx}" y1="40" x2="${cx}" y2="${cy - 30}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` + txt(cx + 8, 50, "RC", 12, RED, "start", 700) +
    dash(cx, cy + 26, cx, 262) +
    lines(20, 304, ["Torso y cabeza girados 45° · se hacen derecha e izquierda", "Mentón algo levantado, mirando adelante"], 11) +
    // panel 2
    `<rect x="520" y="34" width="12" height="266" fill="#cfd3dc"/>` + txt(526, 314, "Bucky", 11, MUTE, "middle") +
    F.fig + F.vs + resaltar(c4x, c4y, 0.62 * 13, 0.62 * 16) + etiquetaHueso(c4x - 8, c4y + 18, "C4", "end") +
    beam(c4x, c4y, dir, len, { ref: 180, angLabel: "15-20°" }) + dash(c4x, c4y, 532, c4y - (c4x - 532) * Math.tan((17.5 * Math.PI) / 180)) +
    txt(750, 46, "RC 15-20° cefálico a C4", 12.5, RED, "end", 700) + txt(750, 62, "(oblicuas posteriores)", 11.5, INK, "end") +
    txt(750, 84, "Oblicuas anteriores:", 11.5, RED, "end", 700) + txt(750, 99, "15-20° caudal", 11.5, RED, "end") +
    txt(392, 40, "DFRI 100-180 cm (mejor la mayor) · apnea", 11, MUTE)
  );
}

function lateralErguida() {
  const cx = 450, hy = 60;
  const cuerpo = `M438,84 L438,122 C430,128 412,132 398,138 C388,142 382,152 381,164 L375,282 C374,296 392,298 393,284 L398,186 ` +
    `C399,180 405,180 406,186 L409,312 L491,312 L494,186 C495,180 501,180 502,186 L507,284 C508,298 526,296 525,282 L519,164 ` +
    `C518,152 512,142 502,138 C488,132 470,128 462,122 L462,84 Z`;
  const VY = [84, 92.5, 101, 109.5, 118, 126.5, 135];
  let vs = "";
  VY.forEach((y) => { vs += vert(cx, y, 15, 7); });
  const clav = hueso("M444,141 C430,138 414,140 402,146 L403,150 C415,145 430,143 444,146 Z") + hueso("M456,141 C470,138 486,140 498,146 L497,150 C485,145 470,143 456,146 Z");
  const pesa = (x) => `<rect x="${x - 9}" y="294" width="18" height="12" rx="2" fill="#8a8f9c" stroke="${INK}" stroke-width="1" stroke-dasharray="3 2"/>`;
  return svg(
    view("Vista de frente · paciente de costado al bucky") +
    `<rect x="530" y="34" width="12" height="270" fill="#cfd3dc"/>` + ri(524, 46, 6, 96) +
    txt(550, 296, "Bucky vertical", 11, MUTE) + txt(550, 310, "RI 24 x 30 vertical · parrilla", 11, INK) +
    piel(cuerpo) + vs + clav + cabezaFrente(cx, hy, 26) + pesa(384) + pesa(516) +
    resaltar(cx, VY[3], 15, 7) + etiquetaHueso(cx + 26, VY[3] + 18, "C4") + thin(cx + 9, VY[3] + 4, cx + 25, VY[3] + 14) +
    `<line x1="476" y1="60" x2="524" y2="60" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` + cota(510, 46, 510, 60, "", 0, 0) +
    beam(438, VY[3], 0, 288, { horizontal: true }) + dash(438, VY[3], 524, VY[3]) +
    note(300, VY[3], 290, 54, ["RC perpendicular al RI en C4", "(borde superior del cartílago tiroides)"], RED, "end") +
    txt(300, VY[3] + 22, "DFRI 150-180 cm", 12.5, RED, "middle", 700) +
    note(396, 142, 300, 190, ["Hombros relajados y bajos", "por igual"], INK, "end") +
    note(384, 300, 300, 250, ["Pesas en las manos", "si hace falta para ver C7"], INK, "end") +
    note(468, 46, 562, 40, ["Mentón algo levantado"]) +
    txt(562, 86, "Borde superior del RI", 11.5, BLUE, "start", 700) + txt(562, 100, "3-5 cm sobre el MAE", 11.5, BLUE) +
    txt(562, 150, "Columna C centrada", 11.5, MUTE) + txt(562, 164, "en el RC y el RI", 11.5, MUTE) +
    txt(562, 196, "Exponer en", 11.5, MUTE) + txt(562, 210, "espiración completa", 11.5, MUTE)
  );
}

function nadador() {
  const T = Tf(1, 450, 58);
  const fig = figuraFrente(T, { piernas: false, der: [[150, 76, 22, 18], [215, 70, 18, 15]], izq: [[16, 80, 22, 18], [10, 76, 18, 15]], hIzq: [60, 94] });
  const [t1x, t1y] = T(0, NIV.T1), [nx, ny] = T(0, NOTCH);
  return svg(
    view("Vista de frente · paciente de costado al bucky") +
    `<rect x="580" y="30" width="12" height="274" fill="#cfd3dc"/>` + txt(600, 296, "Bucky vertical", 11, MUTE) + txt(600, 310, "RI 24 x 30 vertical · parrilla", 11, INK) +
    fig + columnaFrente(T, { lumbar: false }) + clavFrente(T) + cabezaFrente(450, 58, 26) +
    resaltar(t1x, t1y, 16, 7.4) + etiquetaHueso(t1x - 14, t1y - 6, "T1", "end") +
    dot(nx, ny) + etiquetaHueso(nx - 50, ny + 30, "escotadura yugular", "end") + thin(nx - 48, ny + 26, nx - 2, ny + 3) +
    beam(t1x - 20, t1y, 0, 270, { horizontal: true }) + dash(t1x - 20, t1y, 580, t1y) +
    note(250, t1y, 240, 54, ["RC perpendicular en T1", "≈2,5 cm sobre la escotadura yugular"], RED, "end") +
    txt(240, 198, "Opcional: 3-5° caudal para separar", 11.5, RED, "end") + txt(240, 212, "los hombros si hay poca flexibilidad", 11.5, RED, "end") +
    note(...T(-62, 170), 240, 248, ["Otro brazo caído, hombro bajo", "con leve rotación contraria"], INK, "end") +
    note(...T(100, -40), 612, 60, ["Brazo y hombro del lado", "del RI levantados,", "hombro un poco rotado"]) +
    txt(612, 150, "DFRI 150-180 cm", 11.5, MUTE) + txt(612, 166, "Espiración completa", 11.5, MUTE) + txt(612, 180, "o técnica de respiración", 11.5, MUTE) +
    lines(20, 300, ["De pie o sentado · trauma: decúbito lateral,", "un brazo arriba y otro abajo"], 11)
  );
}

function flexExtCervical() {
  const panel = (x0, rot, t1, t2) => {
    const F = perfilDePie(x0 + 150, 92, 0.55, rot, 262);
    const [c4x, c4y] = F.pos.C4;
    return riTop(x0 + 80, 36, 170, 220, "", 0, 0) + F.fig + F.vs + cross(c4x, c4y) + etiquetaHueso(c4x - 14, c4y + 4, "C4", "end") +
      txt(x0 + 270, 120, t1, 12.5, INK, "start", 700) + txt(x0 + 270, 136, t2, 11.5, INK);
  };
  return svg(
    vista2(12, "1.º RI · hiperflexión") + panelSep() + vista2(392, "2.º RI · hiperextensión") +
    panel(0, 22, "Mentón al pecho", "(si se puede)") + panel(380, -32, "Mentón arriba", "al máximo, cómodo") +
    txt(20, 286, "⊕ RC perpendicular al RI en C4 (borde superior del cartílago tiroides)", 12, RED, "start", 700) +
    lines(20, 302, ["De pie o sentado, lateral verdadera · hombros bajos · espiración completa · DFRI 150-180 cm", "RI 24 x 30 vertical · incluir toda la columna C · no hacer si hay sospecha de trauma"], 11, MUTE, "start", 14)
  );
}

function traumaLateral() {
  const s = 1.05, X0 = 120, Y0 = 146;
  const S = supinoArriba(X0, Y0, s), T = S.T;
  const [c4x, c4y] = T(0, NIV.C4);
  const riY = Y0 + 40 * s;
  return svg(
    view("Vista desde arriba · decúbito supino") +
    `<rect x="30" y="${Y0 - 92}" width="700" height="184" fill="#eef0f4"/>` + txt(36, Y0 + 86, "Mesa", 10, MUTE) +
    S.fig + columnaFrente(T, { lumbar: false }) + cuelloCollar(T) +
    resaltar(c4x, c4y, 7.4 * s, 13 * s) + etiquetaHueso(c4x + 8, c4y - 12, "C4") +
    ri(X0 - 16, riY, 96, 8) +
    `<line x1="${X0}" y1="${Y0 + 4}" x2="${X0}" y2="${riY + 22}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` + cota(X0 - 16, riY + 18, X0, riY + 18, "3-5 cm", X0 - 22, riY + 32, BLUE, "end") +
    beam(c4x, Y0 - 16 * s, 90, 80) + dash(c4x, Y0 - 10, c4x, riY) +
    note(c4x + 4, 66, 300, 34, ["RC horizontal, perpendicular al RI en C4", "(borde superior del cartílago tiroides)"], RED) +
    note(X0 + 50, riY + 8, 250, 262, ["RI al costado del cuello: borde superior 3-5 cm sobre el MAE"], INK) +
    txt(250, 286, "Con collarín, sin mover al paciente · DFRI 150-180 cm", 11.5, INK) +
    txt(250, 301, "RI 24 x 30 vertical · con o sin parrilla", 11.5, MUTE) +
    txt(250, 316, "Haz horizontal: el tubo está al costado del paciente (arriba en el dibujo)", 11.5, MUTE)
  );
}

function traumaOblicua() {
  const cx = 190, tableY = 236, r = 46;
  const cy = tableY - r - 8;
  const tx = cx, ty = cy + 16, len = 170, a = 45, t = Math.tan((a * Math.PI) / 180);
  const xRI = tx - (262 - ty) * t;
  return svg(
    view("Corte del cuello visto desde la cabeza · decúbito supino") + table(30, 360, tableY) +
    ri(xRI - 60, 254, 120, 9) + txt(xRI - 60, 280, "RI 24 x 30 · parrilla", 11.5, INK) +
    `<circle cx="${cx}" cy="${cy}" r="${r + 7}" fill="#b9c6d8" fill-opacity=".55" stroke="#6f7f96" stroke-width="1.3"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
    hueso(`M${cx - 14},${cy + 6} L${cx + 14},${cy + 6} L${cx + 14},${cy + 24} L${cx - 14},${cy + 24} Z`) + hueso(`M${cx - 3},${cy + 26} L${cx + 3},${cy + 26} L${cx + 2},${cy + 42} L${cx - 2},${cy + 42} Z`) +
    `<circle cx="${cx}" cy="${cy - 26}" r="7" fill="#fff" stroke="${SKO}" stroke-width="1.2"/>` +
    etiquetaHueso(cx + 10, cy - 30, "tráquea") + etiquetaHueso(cx + 18, cy + 18, "C4") +
    txt(cx - r - 10, cy - r + 6, "collarín", 10.5, "#6f7f96", "end") +
    beam(tx, ty, 90 + a, len, { angLabel: "45°" }) + dash(tx, ty, xRI, 262) +
    note(cx + 60, 70, 400, 50, ["RC angulado 45° hacia medial", "entra a la altura de C4"], RED) +
    lines(400, 104, ["+15° cefálico si no se usa parrilla"], 12, RED) +
    lines(400, 140, ["Sin mover al paciente ni quitar el collarín:", "la oblicuidad la da el tubo", "Se hace derecha e izquierda", "DFRI 100-120 cm"], 11.5, INK, "start", 17)
  );
}

function traumaCervicotoracica() {
  const s = 0.95, X0 = 250, Y0 = 158;
  const S = supinoArriba(X0, Y0, s, { izq: [[168, 80, 22, 18], [178, 74, 18, 15]], hDer: [58, 94] });
  const T = S.T;
  const [t1x, t1y] = T(0, NIV.T1);
  const riY = Y0 + 80;
  return svg(
    view("Vista desde arriba · decúbito supino") +
    `<rect x="20" y="${Y0 - 92}" width="720" height="184" fill="#eef0f4"/>` + txt(26, Y0 + 86, "Mesa", 10, MUTE) +
    S.fig + columnaFrente(T, { lumbar: false }) + cuelloCollar(T) + clavFrente(T) +
    resaltar(t1x, t1y, 7.4, 16) + etiquetaHueso(t1x + 8, t1y - 14, "T1") +
    ri(t1x - 48, riY, 96, 8) +
    beam(t1x, Y0 - 72, 90, 48) + dash(t1x, Y0 - 66, t1x, riY) +
    note(t1x + 4, 72, 420, 40, ["RC horizontal · RI centrado en T1", "≈3 cm sobre la escotadura yugular"], RED) +
    note(...T(-66, -50), 200, 288, ["Brazo y hombro del lado del RI arriba"], INK) +
    note(...T(60, 88), 520, 288, ["El otro hombro abajo"], INK) +
    txt(40, 314, "Con collarín, sin mover al paciente · DFRI 100-120 cm · RI 24 x 30 vertical · opcional, para ver C7", 11.5, MUTE)
  );
}

// ======================= COLUMNA TORÁCICA =======================
function dorsalAP() {
  const E = SUP, t7 = E.X(TX[6]);
  const ester = hueso("M193,206 C196,201 200,199 204,199 C224,192 244,187 262,186 L263,190 C245,191 226,196 206,204 C202,206 197,208 193,206 Z");
  const notch = [196, 203];
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(t7 - 86, 268, 172, 10, "RI 35 x 43 vertical · parrilla", t7 + 96, 278) +
    supinoFlex() + ester + dorsales(E) +
    etiquetaHueso(t7 - 5, E.Y(TY - 5.5) - 3, "T7", "end") +
    dot(...notch) + etiquetaHueso(notch[0] - 22, 150, "escotadura yugular", "end") + thin(notch[0] - 20, 153, notch[0], notch[1] - 4) +
    `<line x1="${notch[0]}" y1="168" x2="${t7}" y2="168" stroke="${BLUE}" stroke-width="1.3"/><line x1="${notch[0]}" y1="162" x2="${notch[0]}" y2="198" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    txt((notch[0] + t7) / 2 - 6, 162, "8-10 cm", 11, BLUE, "middle", 700) +
    tube(t7, 180, 0, 132, { anodo: ["ánodo", "cátodo"] }) + dash(t7, 190, t7, 282) +
    note(t7, 108, 330, 58, ["RC perpendicular al centro del RI, en T7", "8-10 cm debajo de la escotadura yugular"], RED) +
    note(494, 146, 560, 120, ["Caderas y rodillas flexionadas:", "menos curvatura lordótica"]) +
    note(616, 240, 560, 288, ["Parte baja de la columna", "hacia el cátodo (efecto talón)"]) +
    lines(40, 300, ["Borde superior del RI al menos 3 cm sobre los hombros · sin rotación · DFRI 100 cm", "Exponer en espiración · campo largo y estrecho hasta la columna T"])
  );
}

function dorsalPerfil() {
  const E = LAT, t7x = E.X(TX[6]), sy = E.Y(TY);
  const x1 = E.X(TX[0]) - 14, x2 = E.X(TX[11]) + 14;
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(t7x - 118, 128, 236, 128, "", 0, 0) + txt(t7x + 14, 270, "RI 35 x 43 vertical · parrilla", 11.5, INK) +
    latDec() + dorsales(E) +
    coll(x1, sy - 20, x2 - x1, 40) + txt(x1 + 30, sy - 25, "campo largo y estrecho", 11, AMB) +
    cross(t7x, sy) +
    note(t7x + 10, sy + 6, 250, 286, ["RC perpendicular en T7: 8-10 cm bajo la escotadura", "yugular o 18-21 cm bajo la vértebra prominente"], RED) +
    note(E.X(330), E.Y(253), 560, 262, ["Apoyo bajo la cintura:", "columna casi paralela"]) +
    note(E.X(500), E.Y(150), 600, 44, ["Caderas y rodillas", "flexionadas"]) +
    note(E.X(265), E.Y(140), 330, 44, ["Brazos levantados,", "codos flexionados"]) +
    lines(20, 70, ["Respiración (2-3 s)", "o inspiración completa", "DFRI 100 cm"]) +
    lines(20, 236, ["Sin apoyo en la cintura y", "hombros anchos: 10-15° cefálico"], 11.5, RED)
  );
}

function dorsalOblicua() {
  const cx = 200, tableY = 252;
  const C = corte({ cx, tableY, rx: 78, ry: 48, ang: 70 });
  const [vx, vy] = C.L(0, 48 * 0.45);
  const [ax, ay] = C.L(0, -48 - 14), [px, py] = C.L(0, 48 + 16);
  const [l1x, l1y] = C.L(-110, 0), [l2x, l2y] = C.L(110, 0);
  const ctr = C.L(0, 0);
  return svg(
    view("Corte del tórax visto desde los pies") + table(40, 370, tableY) + ri(80, 268, 250, 9) + txt(80, 294, "RI 35 x 43 vertical · parrilla", 11.5, INK) +
    C.s + etiquetaHueso(vx - 26, vy + 20, "T7", "end") +
    txt(ax, ay + 4, "anterior", 10.5, MUTE, "middle") + txt(px - 8, py + 4, "posterior", 10.5, MUTE, "end") +
    refline(l1x, l1y, l2x, l2y) + `<line x1="${f1(ctr[0])}" y1="${f1(ctr[1])}" x2="${f1(ctr[0] + 110)}" y2="${f1(ctr[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<line x1="${f1(ctr[0])}" y1="${f1(ctr[1])}" x2="${f1(ctr[0])}" y2="${f1(ctr[1] - 100)}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    arco(ctr[0], ctr[1], 58, 0, 70, "70°") + arco(ctr[0], ctr[1], 92, 250, 270, "", BLUE) + txt(ctr[0] + 12, ctr[1] - 104, "20°", 12.5, BLUE, "start", 700) +
    `<line x1="${f1(vx)}" y1="40" x2="${f1(vx)}" y2="${f1(vy - 10)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` + dash(vx, vy, vx, 268) +
    note(vx + 2, 60, 420, 50, ["RC perpendicular al centro del RI, en T7", "8-10 cm bajo la escotadura yugular", "o 5 cm bajo el ángulo esternal"], RED) +
    lines(420, 126, ["Desde la lateral, rotar 20° hacia atrás", "(OPD a 70° del RI)"], 12.5, BLUE, "start", 16) +
    lines(420, 176, ["Decúbito lateral o de pie", "Brazo alejado del RI detrás de la espalda;", "el cercano levantado, delante de la cabeza", "Borde superior del RI ≥3 cm sobre los hombros", "Espiración · DFRI 100 cm · se hacen las dos"], 11.5, INK, "start", 16)
  );
}

// ======================= COLUMNA LUMBAR =======================
function lumbarAP() {
  const E = SUP, rc = E.X(330), cr = E.X(354);
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(rc - 84, 268, 168, 10, "RI 30 x 35 o 35 x 43 vertical · parrilla", rc + 94, 278) +
    supinoFlex() + lumbares(E, { marca: "L3" }) + coxal(E) +
    `<line x1="${cr}" y1="178" x2="${cr}" y2="212" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="3 3"/>` +
    etiquetaHueso(cr + 5, 176, "cresta ilíaca") +
    `<line x1="${rc}" y1="190" x2="${cr}" y2="190" stroke="${BLUE}" stroke-width="1.4"/>` + txt(cr + 5, 191, "4 cm", 10.5, BLUE, "start", 700) +
    tube(rc, 196, 0, 150) + dash(rc, 206, rc, 282) +
    note(rc, 110, 420, 56, ["RC perpendicular 4 cm por encima", "de la cresta ilíaca (L3)", "con 35 x 43: centrar en la cresta"], RED) +
    note(506, 150, 566, 124, ["Caderas y rodillas flexionadas:", "menos lordosis lumbar"]) +
    lines(40, 304, ["Sin rotación: EIAS a la misma distancia de la mesa · espiración · DFRI 100 cm", "Campo largo y estrecho, incluir las articulaciones sacroilíacas · también puede hacerse PA"])
  );
}

function lumbarPerfil() {
  const E = LAT, rc = E.X(330), sy = E.Y(LY), cr = E.X(354);
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(rc - 112, 128, 224, 128, "RI · parrilla", rc - 106, 251) +
    latDec({ cojin: true }) + lumbares(E, { marca: "L3", izq: ["L4"] }) + coxal(E) +
    refline(cr, 126, cr, E.Y(256)) + txt(cr + 4, 122, "nivel de la cresta ilíaca", 11, BLUE) +
    coll(E.X(282), sy - 26, E.X(396) - E.X(282), 52) + cross(rc, sy) +
    note(rc - 8, sy + 8, 190, 280, ["RC perpendicular 4 cm sobre la cresta (L3);", "con RI 35 x 43, en la cresta (L4)"], RED) +
    txt(190, 316, "Pelvis ancha y tórax estrecho: puede hacer falta 3-5° caudal", 11.5, RED) +
    note(E.X(512), E.Y(152), 600, 44, ["Apoyo entre las rodillas,", "caderas y rodillas flexionadas"]) +
    lines(20, 60, ["RI 30 x 35 o 35 x 43 vertical", "DFRI 100 cm · espiración"], 11.5, INK) +
    lines(560, 252, ["Apoyo bajo la cintura", "Plomo detrás del paciente", "Parte baja hacia el cátodo", "Escoliosis: convexidad abajo"])
  );
}

function pasajeL5S1() {
  const E = LAT, cx = E.X(385), cy = E.Y(234), cr = E.X(354);
  const [ax, ay] = [E.X(385), E.Y(206)];
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(cx - 60, 162, 120, 90, "", 0, 0) + txt(cx + 64, 266, "RI 18 x 24 vertical", 11, INK) +
    latDec({ cojin: true }) + lumbares(E, { marca: null, izq: ["L4"] }) + coxal(E) +
    refline(cr, 126, cr, E.Y(256)) + txt(cr - 4, 122, "nivel de la cresta", 11, BLUE, "end") +
    dot(ax, ay) + txt(ax + 10, 146, "EIAS", 11, BLUE) + thin(ax + 2, ay - 4, ax + 8, 148, BLUE) +
    cota(cr, cy + 22, cx, cy + 22, "3 cm", (cr + cx) / 2, cy + 36) + cota(ax + 30, ay, ax + 30, cy, "5 cm", ax + 36, (ay + cy) / 2 + 4, BLUE, "start") +
    cross(cx, cy) +
    note(cx + 8, cy + 8, 440, 284, ["RC perpendicular si la columna está paralela;", "si no, 5-8° caudal (paralelo al plano interilíaco)"], RED) +
    note(E.X(512), E.Y(152), 600, 44, ["Apoyo entre las rodillas"]) +
    lines(20, 270, ["Centrado: 3 cm bajo la cresta", "y 5 cm detrás de la EIAS", "Apoyo bajo la cintura si hace falta", "Plomo detrás · apnea · DFRI 100 cm"], 11.5, MUTE, "start", 15)
  );
}

function lumbarOblicua() {
  const cx = 200, tableY = 246;
  const C = corte({ cx, tableY, rx: 86, ry: 52, ang: 45, cuna: true, tipo: "lumbar" });
  const [vx, vy] = C.L(0, 52 * 0.45);
  const [ex, ey] = C.L(-86 * 0.92, -52 * 0.25);
  const ctr = C.L(0, 0), [l1x, l1y] = C.L(-120, 0), [l2x, l2y] = C.L(120, 0);
  return svg(
    view("Corte del abdomen visto desde los pies · OPI/OPD") + table(40, 370, tableY) + ri(90, 262, 220, 9) + txt(90, 288, "RI 30 x 35 o 24 x 30 vertical · parrilla", 11.5, INK) +
    C.s + etiquetaHueso(vx + 16, vy + 6, "L3") +
    refline(l1x, l1y, l2x, l2y) + `<line x1="${f1(ctr[0])}" y1="${f1(ctr[1])}" x2="${f1(ctr[0] + 120)}" y2="${f1(ctr[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    arco(ctr[0], ctr[1], 66, 0, 45, "45°") +
    dot(ex, ey) + txt(ex - 10, ey + 18, "EIAS de arriba", 11, BLUE, "end", 700) +
    cota(ex, ey - 34, vx, ey - 34, "5 cm", ex - 6, ey - 30, BLUE, "end") + `<line x1="${f1(ex)}" y1="${f1(ey - 30)}" x2="${f1(ex)}" y2="${f1(ey - 4)}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<line x1="${f1(vx)}" y1="40" x2="${f1(vx)}" y2="${f1(vy - 10)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` + dash(vx, vy, vx, 262) +
    txt(C.L(-86, 40)[0] - 30, tableY - 6, "bloque", 10.5, MUTE, "end") +
    note(vx + 2, 90, 410, 50, ["RC perpendicular al cuerpo de L3", "a la altura del borde costal inferior", "(2,5-5 cm sobre la cresta ilíaca)", "y 5 cm medial a la EIAS de arriba"], RED) +
    lines(410, 138 + 20, ["Cuerpo girado 45°; en las posteriores,", "bloques bajo la pelvis y los hombros", "Se hacen derecha e izquierda", "Apnea · DFRI 100 cm", "L1-L2: mejor 50° · L5-S1: mejor 30°"], 11.5, INK, "start", 16)
  );
}

// figura de pie, de frente o de espaldas, con el tronco inclinado deg grados (pivote en la cintura)
function figuraInclinada(T, deg, { espalda = false, dx = () => 0, alza = 0, ladoAlza = 1 } = {}) {
  const R = rotAround(0, 214, deg), Tr = (x, y) => T(...R(x, y));
  const up = [CUELLO_F, TORSO_SUP, ...brazo(-1, BRAZO_ABAJO).ds, ...brazo(1, BRAZO_ABAJO).ds].map((d) => tpF(d, Tr));
  const legs = [-1, 1].map((l) => pierna(l).map((d) => tpF(d, (x, y) => T(x, y - (l === ladoAlza ? alza : 0))))).flat();
  const low = [tpF(PELVIS, T), ...legs];
  const [hx, hy] = Tr(0, 0), r = 26 * Math.abs(T(1, 0)[0] - T(0, 0)[0]);
  let o = union([...up, ...low]);
  o += espalda ? nucaAtras(hx, hy, r, deg) : cabezaFrente(hx, hy, r, deg);
  // columna: rotación progresiva por encima de L3
  let vs = "";
  const sc = r / 26;
  for (const [n, y] of Object.entries(NIV)) {
    const f = Math.max(0, Math.min(1, (202 - y) / 40));
    const [X, Y] = T(...rotAround(0, 214, deg * f)(dx(y), y));
    const [w, h] = n[0] === "C" ? [13, 6] : n[0] === "T" ? [16, 7.4] : [21, 9.4];
    vs += vert(X, Y, w * sc, h * sc, deg * f);
  }
  return { fig: o, vs, pelvis: pelvisFrente(T, 0.75) };
}

function flexionLateral() {
  const s = 0.56;
  const panel = (cx, deg, titulo) => {
    const T = Tf(s, cx, 46);
    const F = figuraInclinada(T, deg);
    const [rx1, ry1] = T(-46, 116), [rx2, ry2] = T(46, 226), [ccx, ccy] = T(0, 171), [, crY] = T(0, CRESTA);
    return F.fig + F.pelvis + F.vs + riBorde(rx1, ry1, rx2 - rx1, ry2 - ry1) +
      `<line x1="${f1(rx1 - 30)}" y1="${f1(crY)}" x2="${f1(rx1)}" y2="${f1(crY)}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
      cota(rx1 - 14, crY, rx1 - 14, ry2, "", 0, 0) +
      cross(ccx, ccy) + side(cx - 92, 70, "D") + side(cx + 92, 70, "I") +
      txt(cx, 312, titulo, 12.5, INK, "middle", 700);
  };
  return svg(
    vista2(12, "Vista desde el tubo · AP de pie (o en decúbito supino)") +
    panel(160, -16, "1.º flexión lateral derecha") + panel(470, 16, "2.º flexión lateral izquierda") +
    note(470 + 30, 150, 600, 70, ["⊕ RC perpendicular al", "centro del RI"], RED) +
    txt(600, 120, "(más arriba si interesa", 11, MUTE) + txt(600, 134, "la columna torácica)", 11, MUTE) +
    txt(600, 166, "▭ punteado = RI", 11.5, INK) + txt(600, 186, "Borde inferior del RI", 11.5, BLUE, "start", 700) + txt(600, 200, "2,5-5 cm bajo la cresta", 11.5, BLUE) +
    lines(600, 228, ["Pelvis fija (fulcro),", "sin rotar pelvis ni torso", "RI 35 x 43 o 35 x 90", "DFRI 100-150 cm", "Espiración"], 11.5, MUTE, "start", 15)
  );
}

function flexExtLumbar() {
  const E = LAT, cr = E.X(354), sy = E.Y(LY);
  const rx2 = cr + 28, rx1 = rx2 - 236, ccx = (rx1 + rx2) / 2;
  const curv = (x1, y1, x2, y2, cx, cy, c) => `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="${c}" stroke-width="2.4" marker-end="url(#${c === RED ? "ar" : "arb"})"/>`;
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(rx1, 124, 236, 136, "", 0, 0) + txt(rx1 + 6, 274, "RI 35 x 43 vertical · parrilla", 11.5, INK) +
    latDec() + lumbares(E, { izq: ["L4"] }) + coxal(E) +
    refline(cr, 124, cr, E.Y(256)) + cota(cr, 266, rx2, 266, "2,5-5 cm", rx2 + 6, 270, BLUE, "start") +
    cross(ccx, sy) +
    curv(160, 96, 120, 136, 128, 100, BLUE) + txt(108, 92, "1.º flexión máxima", 12, BLUE, "end", 700) + txt(108, 106, "hacia adelante", 11.5, INK, "end") +
    curv(170, 300, 120, 262, 132, 302, BLUE) + txt(110, 304, "2.º extensión máxima", 12, BLUE, "end", 700) + txt(110, 318, "hacia atrás", 11.5, INK, "end") +
    note(ccx + 8, sy + 8, 440, 300, ["RC perpendicular al centro del RI", "(o al sitio de la artrodesis, si se conoce)"], RED) +
    txt(cr + 4, 116, "cresta ilíaca", 11, BLUE) +
    lines(20, 40, ["Decúbito o de pie, lateral verdadera · apoyo bajo la cintura", "Plomo detrás del paciente · espiración · DFRI 100 cm"], 11.5, MUTE, "start", 15)
  );
}

// ======================= ESCOLIOSIS =======================
function ferguson() {
  const s = 0.56;
  const dx = (y) => (y < 60 ? 0 : 9 * Math.sin(((y - 60) / 175) * 2 * Math.PI) * -1);
  const panel = (cx, alza, titulo) => {
    const T = Tf(s, cx, 44);
    const F = figuraInclinada(T, 0, { espalda: true, dx, alza, ladoAlza: 1 });
    const [rx1, ry1] = T(-46, -4), [rx2, ry2] = T(46, 226), [ccx, ccy] = T(0, 111);
    let o = F.fig + F.pelvis + F.vs + riBorde(rx1, ry1, rx2 - rx1, ry2 - ry1) + cross(ccx, ccy) +
      side(cx - 92, 70, "I") + side(cx + 92, 70, "D") + txt(cx, 318, titulo, 12, INK, "middle", 700);
    if (alza) { const [bx, by] = T(40, 462 - alza); const [bx2, by2] = T(40, 462); o += apoyo(`M${f1(bx - 20)},${f1(by)} L${f1(bx + 20)},${f1(by)} L${f1(bx + 20)},${f1(by2)} L${f1(bx - 20)},${f1(by2)} Z`) + note(bx + 20, (by + by2) / 2, cx + 110, 280, ["alza 8-10 cm"], INK); }
    return o;
  };
  return svg(
    vista2(12, "Vista desde el tubo · PA de pie (de espaldas al tubo)") +
    panel(150, 0, "1.º RI: de pie, sin rotación") + panel(420, 24, "2.º RI: alza bajo el pie convexo") +
    `<line x1="0" y1="${f1(44 + 462 * s)}" x2="560" y2="${f1(44 + 462 * s)}" stroke="#cfd3dc" stroke-width="2"/>` +
    txt(600, 50, "⊕ RC perpendicular", 12.5, RED, "start", 700) + txt(600, 66, "al centro del RI", 12, INK) +
    lines(600, 92, ["▭ punteado = RI", "RI 35 x 43 o 35 x 90", "Borde inferior 2,5-5 cm", "bajo la cresta ilíaca", "DFRI 100-150 cm (mayor)", "Espiración completa", "Brazos a los costados", "De pie o sentado (alza", "bajo la nalga)", "Protección gonadal y mamaria"], 11.5, MUTE, "start", 15)
  );
}

// ======================= SACRO Y CÓCCIX =======================
const COCCIX = "M415,246 C419,247 423,248 428,249 L427,252 C422,251 418,250 414,249 Z";
const sinfisis = (E) => { const [sx, sy] = [E.X(419), E.Y(211)]; return { sx, sy, s: `<ellipse cx="${sx}" cy="${sy}" rx="4.5" ry="3.5" fill="${BONE}" stroke="${BONEO}" stroke-width="1.4"/>` + `<path d="${E.tp("M412,224 C414,218 416,214 419,211")}" fill="none" stroke="${BONEO}" stroke-width="3" stroke-linecap="round"/>` }; };
const PIERNAS_APOYO = "C440,196 476,192 510,190 C528,189 542,194 554,202 C584,216 620,226 650,230 C654,222 658,208 662,200 C665,194 674,194 676,202 C678,216 680,234 680,246 C680,252 672,252 664,252 L610,252 C588,248 566,238 548,228 C532,220 512,226 490,236 C470,246 446,252 420,252 Z";
const supinoApoyo = () => apoyo("M492,252 C492,238 504,226 524,224 C544,224 560,236 562,252 Z") + piel(SUP.cabeza().d + " " + SUP.tp(CUELLO + " " + PECHO + " " + ABDOMEN + " " + PIERNAS_APOYO)) + linea(BRAZO_COSTADO) + SUP.cabeza().cara;

function sacroAP() {
  const E = SUP, S = sinfisis(E);
  const ex = E.X(392), ey = E.Y(199), a = 15, t = Math.tan((a * Math.PI) / 180);
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(ex - 26 - 80, 268, 160, 10, "RI 24 x 30 vertical · parrilla", ex + 66, 278) +
    supinoExt() + lumbares(E, { etiquetas: false }) + coxal(E) + S.s +
    hueso(E.tp("M386,225 C398,226 410,234 418,244 L415,249 C404,247 394,245 387,240 Z")) + resaltar(E.X(402), E.Y(237), 36, 26) +
    etiquetaHueso(E.X(402), E.Y(237) + 26, "sacro", "middle") + etiquetaHueso(S.sx + 7, S.sy - 3, "sínfisis") +
    cota(ex, 184, S.sx, 184, "5 cm", S.sx + 6, 188, BLUE, "start") + `<line x1="${S.sx}" y1="188" x2="${S.sx}" y2="${S.sy - 4}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    tube(ex, ey, -a, 150, { angLabel: "15°" }) + dash(ex, ey, ex - (282 - ey) * t, 282) +
    txt(ex - 50, 64, "← cefálico", 12, RED, "end", 700) +
    note(ex + 70 * Math.sin(0.2618), ey - 70 * Math.cos(0.2618), 495, 56, ["RC 15° cefálico, dirigido 5 cm", "por encima de la sínfisis del pubis"], RED) +
    note(482, 212, 520, 150, ["Sin rotación: las dos EIAS", "a la misma distancia de la mesa"]) +
    lines(40, 304, ["RI centrado en el RC proyectado · apnea · DFRI 100 cm", "Proteger tejidos radiosensibles (gónadas en hombres)"])
  );
}

function coccixAP() {
  const E = SUP, S = sinfisis(E);
  const ex = E.X(392), ey = E.Y(198), a = 10, t = Math.tan((a * Math.PI) / 180);
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(ex + 26 - 60, 268, 120, 10, "RI 18 x 24 vertical · parrilla", ex + 96, 278) +
    supinoApoyo() + lumbares(E, { etiquetas: false }) + coxal(E) + S.s +
    hueso(E.tp(COCCIX)) + etiquetaHueso(E.X(428), E.Y(246), "cóccix") + etiquetaHueso(S.sx + 7, S.sy - 3, "sínfisis") +
    cota(ex, 184, S.sx, 184, "5 cm", S.sx + 6, 188, BLUE, "start") + `<line x1="${S.sx}" y1="188" x2="${S.sx}" y2="${S.sy - 4}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    tube(ex, ey, a, 150, { angLabel: "10°" }) + dash(ex, ey, ex + (282 - ey) * t, 282) +
    txt(ex + 60, 64, "caudal →", 12, RED, "start", 700) +
    note(ex - 70 * Math.sin(0.1745), ey - 70 * Math.cos(0.1745), 200, 110, ["RC 10° caudal, centrado", "5 cm sobre la sínfisis"], RED, "end") +
    note(E.X(527), E.Y(240), 600, 150, ["Apoyo bajo", "las rodillas"]) +
    lines(40, 304, ["PMS centrado, sin rotación · vaciar la vejiga · apnea · DFRI 100 cm", "Si no tolera apoyar el cóccix: PA con 10° cefálico"])
  );
}

function sacroCoccixLat() {
  const E = LAT, cx = E.X(402), cy = E.Y(238), [ax, ay] = [E.X(402), E.Y(209)];
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(cx - 80, 140, 160, 116, "", 0, 0) + txt(cx - 76, 136, "RI 24 x 30 vertical · parrilla", 11, INK) +
    latDec({ cojin: true, apoyo: false }) + lumbares(E, { marca: null, izq: ["L4"] }) + coxal(E) + hueso(E.tp(COCCIX)) +
    etiquetaHueso(cx + 26, cy + 30, "cóccix") +
    dot(ax, ay) + txt(ax - 4, 150, "EIAS de arriba", 11, BLUE, "end", 700) + thin(ax - 2, ay - 4, ax - 10, 152, BLUE) +
    cota(ax + 46, ay, ax + 46, cy, "8-10 cm", ax + 52, (ay + cy) / 2 + 4, BLUE, "start") + `<line x1="${ax}" y1="${ay}" x2="${ax + 50}" y2="${ay}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    cross(cx, cy) + etiquetaHueso(cx - 16, cy + 28, "sacro", "end") +
    note(cx + 8, cy + 10, 420, 290, ["RC perpendicular para el sacro:", "8-10 cm detrás de la EIAS de arriba"], RED) +
    lines(20, 270, ["Lateral verdadera, caderas", "y rodillas flexionadas", "Plomo detrás · apnea · DFRI 100 cm"], 11.5, MUTE, "start", 15) +
    lines(560, 60, ["Sacro y cóccix pueden ir", "en una sola toma"], 11.5, MUTE)
  );
}

function coccixLat() {
  const E = LAT, [ax, ay] = [E.X(402), E.Y(209)], cx = E.X(424), cy = E.Y(248);
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(cx - 60, 160, 120, 96, "", 0, 0) + txt(cx + 66, 270, "RI 18 x 24 vertical", 11, INK) +
    latDec({ cojin: true, apoyo: false }) + lumbares(E, { etiquetas: false }) + coxal(E) + hueso(E.tp(COCCIX)) +
    etiquetaHueso(cx + 18, cy + 26, "cóccix") +
    dot(ax, ay) + txt(ax - 8, ay - 6, "EIAS", 11, BLUE, "end", 700) +
    cota(ax, ay - 14, cx, ay - 14, "5 cm", (ax + cx) / 2, ay - 20) +
    `<line x1="${cx}" y1="${ay - 16}" x2="${cx}" y2="${cy - 12}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    cota(cx + 50, ay, cx + 50, cy, "8-10 cm", cx + 56, (ay + cy) / 2 + 4, BLUE, "start") + `<line x1="${ax}" y1="${ay}" x2="${cx + 54}" y2="${ay}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    cross(cx, cy) +
    note(cx + 8, cy + 10, 420, 290, ["RC perpendicular: 5 cm distal a la EIAS", "y 8-10 cm por detrás"], RED) +
    lines(20, 262, ["Caderas y rodillas flexionadas 90°,", "lateral verdadera", "Plomo detrás · apnea · DFRI 100 cm", "CAE con prudencia"], 11.5, MUTE, "start", 15)
  );
}

// ======================= SACROILÍACAS =======================
function siAP() {
  const E = SUP, S = sinfisis(E);
  const [ax, ay] = [E.X(402), E.Y(208)];
  const ex = E.X(429), ey = E.Y(199), t = Math.tan((30 * Math.PI) / 180);
  return svg(
    view("Vista lateral · decúbito supino") + table(30, 730, 252) +
    ri(ex - 110, 268, 150, 10, "RI 24 x 30 vertical · parrilla", ex + 50, 278) +
    supinoExt() + lumbares(E, { etiquetas: false }) + coxal(E) + S.s +
    hueso(E.tp("M386,225 C398,226 410,234 418,244 L415,249 C404,247 394,245 387,240 Z")) + etiquetaHueso(E.X(378), E.Y(236) + 26, "sacro", "end") +
    dot(ax, ay) + txt(ax - 10, 176, "EIAS", 11, BLUE, "end", 700) + thin(ax - 2, ay - 4, ax - 10, 178, BLUE) +
    cota(ax, 214, ex, 214, "5 cm", ax - 6, 218, BLUE, "end") + `<line x1="${ex}" y1="${ey + 4}" x2="${ex}" y2="216" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    tube(ex, ey, -30, 150, { angLabel: "30° (H)" }) + rayoExtra(ex, ey, 125, 110, "35° (M)", 30, -4) +
    dash(ex, ey, ex - (282 - ey) * t, 282) +
    txt(ex - 120, 60, "← cefálico", 12, RED, "end", 700) +
    note(ex + 60 * Math.sin(0.5236), ey - 60 * Math.cos(0.5236), 40, 104, ["RC 30° (hombres) o 35° (mujeres)", "cefálico, entra unos 5 cm por", "debajo del nivel de las EIAS"], RED) +
    lines(40, 304, ["Sin rotación: EIAS a la misma distancia del tablero · RI centrado en el RC proyectado", "Apnea · DFRI 100 cm · proteger tejidos radiosensibles (gónadas en hombres)"])
  );
}

function siOblicua() {
  const cx = 200, tableY = 246;
  const C = corte({ cx, tableY, rx: 92, ry: 54, ang: 27.5, cuna: true, tipo: "sacro" });
  const [jx, jy] = C.L(-20, 54 * 0.55);
  const [ex, ey] = C.L(-92 * 0.8, -54 * 0.5);
  const ctr = C.L(0, 0), [l1x, l1y] = C.L(-125, 0), [l2x, l2y] = C.L(125, 0);
  return svg(
    view("Corte de la pelvis visto desde los pies · oblicua posterior") + table(40, 370, tableY) + ri(90, 262, 210, 9) + txt(90, 288, "RI 24 x 30 vertical · parrilla", 11.5, INK) +
    C.s + etiquetaHueso(120, 214, "articulación SI", "end") + etiquetaHueso(120, 227, "elevada", "end") + thin(122, 214, jx - 4, jy + 2) +
    refline(l1x, l1y, l2x, l2y) + `<line x1="${f1(ctr[0])}" y1="${f1(ctr[1])}" x2="${f1(ctr[0] + 125)}" y2="${f1(ctr[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    arco(ctr[0], ctr[1], 80, 0, 27.5, "25-30°", BLUE, 104) +
    dot(ex, ey) + txt(ex - 6, ey - 8, "EIAS de arriba", 11, BLUE, "end", 700) +
    cota(ex, 66, jx, 66, "2,5 cm", ex - 6, 70, BLUE, "end") + `<line x1="${f1(ex)}" y1="70" x2="${f1(ex)}" y2="${f1(ey - 4)}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<line x1="${f1(jx)}" y1="40" x2="${f1(jx)}" y2="${f1(jy - 10)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` + dash(jx, jy, jx, 262) +
    txt(C.L(-92, 40)[0] - 24, tableY - 6, "apoyo", 10.5, MUTE, "end") +
    note(jx + 2, 96, 410, 50, ["RC perpendicular, 2,5 cm medial", "a la EIAS de arriba"], RED) +
    lines(410, 92, ["Opcional: 15-20° cefálico para ver mejor", "la parte distal de la articulación"], 11.5, RED, "start", 15) +
    lines(410, 140, ["Oblicua posterior de 25-30°,", "lado a estudiar levantado (con apoyo)", "Se hacen los dos lados para comparar", "Apnea · DFRI 100 cm", "Proteger gónadas en hombres"], 11.5, INK, "start", 16)
  );
}

module.exports = {
  "columna-cervical-ap-boca-abierta": bocaAbierta,
  "columna-cervical-odontoides-fuchs": fuchs,
  "columna-cervical-odontoides-judd": judd,
  "columna-cervical-ap-axial": cervicalAPaxial,
  "columna-cervical-lateral-erguida": lateralErguida,
  "columna-cervical-nadador": nadador,
  "columna-cervical-trauma-lateral-horizontal": traumaLateral,
  "columna-cervical-trauma-ap": traumaAP,
  "columna-cervical-trauma-ap-axial-oblicua": traumaOblicua,
  "columna-cervical-trauma-cervicotoracica": traumaCervicotoracica,
  "columna-toracica-ap": dorsalAP,
  "columna-toracica-lateral": dorsalPerfil,
  "columna-toracica-oblicua": dorsalOblicua,
  "columna-lumbar-ap": lumbarAP,
  "columna-lumbar-lateral": lumbarPerfil,
  "columna-lumbar-lateral-l5-s1": pasajeL5S1,
  "columna-sacro-ap-axial": sacroAP,
  "columna-coccix-ap-axial": coccixAP,
  "columna-sacro-coccix-lateral": sacroCoccixLat,
  "columna-coccix-lateral": coccixLat,
  "columna-sacroiliacas-ap-axial": siAP,
  "columna-sacroiliacas-oblicua-posterior": siOblicua,
};

// ======================= fichas con versiones: un esquema por versión =======================
const col = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");
const g = (tr, inner) => `<g transform="${tr}">${inner}</g>`;

// ---- oblicuas de columna cervical ----
const oblCervTxt = (ant) =>
  col(430, 150, [[ant ? "Oblicua anterior, de pie o sentado" : "Oblicua posterior, de pie o sentado", INK, 700], ["Torso y cabeza girados 45° respecto del RI", INK, 700]]) +
  col(430, 196, [["Columna C alineada con el RC y el RI", INK], ["Mentón algo levantado, mirando adelante", INK], ["Se hacen derecha e izquierda", INK]]) +
  col(430, 270, [["RI 24 x 30 vertical · bucky vertical", MUTE, 400, 11], ["DFRI 100-180 cm (mejor la mayor) · apnea", MUTE, 400, 11]]);
function oblCervPost() {
  const dx = -300, F = perfilDePie(560, 97, 0.62);
  const [c4x, c4y] = F.pos.C4, X = c4x + dx;
  return svg(
    view("Oblicua posterior · vista lateral del haz") +
    `<rect x="220" y="34" width="12" height="266" fill="#cfd3dc"/>` + txt(226, 314, "Bucky", 11, MUTE, "middle") +
    g(`translate(${dx} 0)`, F.fig + F.vs) + resaltar(X, c4y, 0.62 * 13, 0.62 * 16) + etiquetaHueso(X - 8, c4y + 18, "C4", "end") +
    beam(X, c4y, 180 + 17.5, 118, { ref: 180, angLabel: "15-20°" }) + dash(X, c4y, 232, c4y - (X - 232) * Math.tan((17.5 * Math.PI) / 180)) +
    col(430, 60, [["RC 15-20° cefálico,", RED, 700, 12.5], ["entrando por C4", INK, 400, 12]]) + oblCervTxt(false)
  );
}
function oblCervAnt() {
  // espejo: la cara mira al bucky (izquierda); el tubo queda detrás, arriba, apuntando hacia los pies
  const W = 752, F = perfilDePie(560, 97, 0.62);
  const [c4x0, c4y] = F.pos.C4, X = W - c4x0, dir = 180 - 17.5;
  return svg(
    view("Oblicua anterior · vista lateral del haz") +
    `<rect x="60" y="34" width="12" height="266" fill="#cfd3dc"/>` + txt(66, 314, "Bucky", 11, MUTE, "middle") +
    g(`translate(${W} 0) scale(-1 1)`, F.fig + F.vs) + resaltar(X, c4y, 0.62 * 13, 0.62 * 16) + etiquetaHueso(X + 8, c4y + 18, "C4") +
    beam(X, c4y, dir, 118, { ref: 180, angLabel: "15-20°" }) + dash(X, c4y, 72, c4y + (X - 72) * Math.tan((17.5 * Math.PI) / 180)) +
    col(430, 60, [["RC 15-20° caudal", RED, 700, 12.5]]) + oblCervTxt(true)
  );
}

// ---- lateral de columna cervical en hiperflexión / hiperextensión ----
function flexExtCerv(rot, titulo, paso) {
  const x0 = 60, F = perfilDePie(x0 + 150, 92, 0.55, rot, 262);
  const [c4x, c4y] = F.pos.C4;
  return svg(
    view(titulo) +
    riTop(x0 + 80, 36, 170, 220, "", 0, 0) + F.fig + F.vs + cross(c4x, c4y) + etiquetaHueso(c4x - 14, c4y + 4, "C4", "end") +
    col(400, 60, [["⊕ RC perpendicular al RI en C4", RED, 700, 12.5], ["(borde superior del cartílago tiroides)", INK, 400, 12]]) +
    col(400, 120, paso.map((t) => [t, INK, 700])) +
    col(400, 170, [["De pie o sentado, lateral verdadera", INK], ["Hombros relajados y bajos", INK], ["Incluir toda la columna C", INK]]) +
    col(400, 250, [["RI 24 x 30 vertical · DFRI 150-180 cm", MUTE, 400, 11], ["Espiración completa", MUTE, 400, 11], ["No hacer si hay sospecha de trauma", MUTE, 400, 11]]) +
    txt(x0 + 165, 290, "RI 24 x 30 vertical", 11, INK, "middle")
  );
}

// ---- oblicuas de columna lumbar ----
function lumbarOblVer(ant) {
  const cx = 200, tableY = 246;
  const C = corte({ cx, tableY, rx: 86, ry: 52, ang: ant ? 135 : 45, cuna: !ant, tipo: "lumbar" });
  const [vx, vy] = C.L(0, 52 * 0.45);
  const [ex, ey] = C.L(-86 * 0.92, -52 * 0.25);
  const ctr = C.L(0, 0), [l1x, l1y] = C.L(-120, 0), [l2x, l2y] = C.L(120, 0);
  let o = view(ant ? "Oblicua anterior · corte visto desde los pies" : "Oblicua posterior · corte visto desde los pies") +
    table(40, 370, tableY) + ri(90, 262, 220, 9) + txt(90, 288, "RI 30 x 35 o 24 x 30 vertical · parrilla", 11.5, INK) +
    C.s + etiquetaHueso(vx + 16, vy + 6, "L3") +
    refline(l1x, l1y, l2x, l2y) + `<line x1="${f1(ctr[0])}" y1="${f1(ctr[1])}" x2="${f1(ctr[0] + 120)}" y2="${f1(ctr[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    (ant ? arco(ctr[0], ctr[1], 66, 0, -45, "45°") : arco(ctr[0], ctr[1], 66, 0, 45, "45°")) +
    `<line x1="${f1(vx)}" y1="40" x2="${f1(vx)}" y2="${f1(vy - 10)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` + dash(vx, vy, vx, 262);
  if (ant) {
    o += txt(C.L(0, 52)[0] - 14, C.L(0, 52)[1] - 8, "espalda", 10.5, MUTE, "end") + txt(C.L(0, -52)[0] + 12, C.L(0, -52)[1] + 4, "abdomen", 10.5, MUTE);
  } else {
    o += dot(ex, ey) + txt(ex - 10, ey + 18, "EIAS de arriba", 11, BLUE, "end", 700) +
      cota(ex, ey - 34, vx, ey - 34, "5 cm", ex - 6, ey - 30, BLUE, "end") + `<line x1="${f1(ex)}" y1="${f1(ey - 30)}" x2="${f1(ex)}" y2="${f1(ey - 4)}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
      txt(C.L(-86, 40)[0] - 30, tableY - 6, "bloque", 10.5, MUTE, "end");
  }
  return svg(o +
    note(vx + 2, 90, 410, 50, ["RC perpendicular al cuerpo de L3", "a la altura del borde costal inferior", "(2,5-5 cm sobre la cresta ilíaca)", "y 5 cm medial a la EIAS de arriba"], RED) +
    col(410, 158, ant ? [["Oblicua anterior: cuerpo girado 45°", INK, 700]] : [["Oblicua posterior: cuerpo girado 45°", INK, 700], ["Bloques bajo la pelvis y los hombros", INK, 700]]) +
    col(410, ant ? 190 : 205, [["Columna centrada en el RC y la mesa", INK], ["Se hacen derecha e izquierda", INK]]) +
    col(410, 270, [["Apnea · DFRI 100 cm", MUTE, 400, 11], ["L1-L2: mejor 50° · L5-S1: mejor 30°", MUTE, 400, 11]])
  );
}

// ---- AP con flexión lateral derecha / izquierda ----
function flexLatVer(deg, titulo, paso) {
  const s = 0.56, cx = 200;
  const T = Tf(s, cx, 46);
  const F = figuraInclinada(T, deg);
  const [rx1, ry1] = T(-46, 116), [rx2, ry2] = T(46, 226), [ccx, ccy] = T(0, 171), [, crY] = T(0, CRESTA);
  return svg(
    view(titulo) +
    F.fig + F.pelvis + F.vs + riBorde(rx1, ry1, rx2 - rx1, ry2 - ry1) +
    `<line x1="${f1(rx1 - 30)}" y1="${f1(crY)}" x2="${f1(rx1)}" y2="${f1(crY)}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    cota(rx1 - 14, crY, rx1 - 14, ry2, "", 0, 0) +
    cross(ccx, ccy) + side(cx - 92, 70, "D") + side(cx + 92, 70, "I") +
    note(ccx + 12, ccy, 420, 64, ["⊕ RC perpendicular al", "centro del RI"], RED) +
    col(420, 100, [["(más arriba si interesa la columna torácica)", MUTE, 400, 11]]) +
    col(420, 130, [[paso, INK, 700]]) +
    col(420, 160, [["Pelvis fija (fulcro), sin rotar pelvis ni torso", INK], ["De pie o en decúbito supino", INK]]) +
    col(420, 206, [["▭ punteado = RI", INK], ["Borde inferior del RI", BLUE, 700], ["2,5-5 cm bajo la cresta", BLUE]]) +
    col(420, 270, [["RI 35 x 43 o 35 x 90 · DFRI 100-150 cm", MUTE, 400, 11], ["Espiración", MUTE, 400, 11]])
  );
}

// ---- lateral lumbar en hiperflexión / hiperextensión: el tronco se dobla sobre la columna lumbar ----
function flexExtLumbVer(deg, titulo, paso, sub) {
  const E = LAT, H = E.cabeza();
  const px = E.X(350), py = E.Y(LY), ancho = 110;
  const fr = (x) => Math.max(0, Math.min(1, (px - x) / ancho));
  const B = (x, y) => rotAround(px, py, deg * fr(x))(x, y);
  const cuerpo = tpF(H.d + " " + E.tp(CUELLO + " " + BRAZO_ADELANTE + " " + ABDOMEN + " " + PIERNAS_FLEX), B);
  const cara = H.cara.replace(/<ellipse cx="([\d.-]+)" cy="([\d.-]+)"([^>]*?)transform="rotate\(([\d.-]+)[^"]*"/, (m, x, y, mid, r) => {
    const [X, Y] = B(+x, +y); return `<ellipse cx="${f1(X)}" cy="${f1(Y)}"${mid}transform="rotate(${+r + deg} ${f1(X)} ${f1(Y)})"`;
  }).replace(/d="([^"]+)"/g, (m, d) => `d="${tpF(d, B)}"`);
  const apoyoR = `<rect x="${f1(E.X(292))}" y="${f1(E.Y(246))}" width="${f1(E.s * 76)}" height="${f1(E.s * 14)}" rx="6" fill="#d7dbe3" stroke="#8a8f9c"/>`;
  const w = 17 * E.s, h = 14 * E.s;
  let vs = "";
  for (const [n, x] of LUMB) {
    const [X, Y] = B(E.X(x), E.Y(LY));
    vs += vert(X, Y, w, h, deg * fr(E.X(x)));
  }
  vs += hueso(E.tp("M386,225 C398,226 410,234 418,244 L415,249 C404,247 394,245 387,240 Z"));
  const cr = E.X(354), rx2 = cr + 28, rx1 = rx2 - 236, ccx = (rx1 + rx2) / 2, sy = E.Y(LY);
  const curv = (x1, y1, x2, y2, cx, cy) => `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="${BLUE}" stroke-width="2.4" marker-end="url(#arb)"/>`;
  const flecha = deg > 0 ? curv(118, 230, 96, 168, 92, 206) : curv(118, 150, 96, 212, 92, 174);
  return svg(
    view(titulo) +
    riTop(rx1, 124, 236, 136, "", 0, 0) +
    apoyoR + piel(cuerpo) + cara + txt(E.X(250), E.Y(252) + 14, "espalda", 10.5, MUTE) + vs + coxal(E) +
    refline(cr, 124, cr, E.Y(256)) + cota(cr, 266, rx2, 266, "2,5-5 cm", rx2 + 6, 270, BLUE, "start") + txt(cr + 4, 116, "cresta ilíaca", 11, BLUE) +
    cross(ccx, sy) + flecha +
    note(ccx + 8, sy + 8, 440, 300, ["RC perpendicular al centro del RI", "(o al sitio de la artrodesis, si se conoce)"], RED) +
    col(440, 40, [[paso, BLUE, 700, 12.5], [sub, INK]]) +
    col(20, deg > 0 ? 290 : 44, [["Decúbito o de pie, lateral verdadera · apoyo bajo la cintura", MUTE, 400, 11], ["RI 35 x 43 vertical · parrilla · espiración · DFRI 100 cm", MUTE, 400, 11]])
  );
}

// ---- escoliosis PA (Ferguson) ----
function fergusonVer(alza, titulo, pie) {
  const s = 0.56, cx = 220;
  const dx = (y) => (y < 60 ? 0 : 9 * Math.sin(((y - 60) / 175) * 2 * Math.PI) * -1);
  const T = Tf(s, cx, 44);
  const F = figuraInclinada(T, 0, { espalda: true, dx, alza, ladoAlza: 1 });
  const [rx1, ry1] = T(-46, -4), [rx2, ry2] = T(46, 226), [ccx, ccy] = T(0, 111);
  let o = F.fig + F.pelvis + F.vs + riBorde(rx1, ry1, rx2 - rx1, ry2 - ry1) + cross(ccx, ccy) +
    side(cx - 92, 70, "I") + side(cx + 92, 70, "D") + txt(cx, 318, pie, 12, INK, "middle", 700);
  if (alza) { const [bx, by] = T(40, 462 - alza); const [bx2, by2] = T(40, 462); o += apoyo(`M${f1(bx - 20)},${f1(by)} L${f1(bx + 20)},${f1(by)} L${f1(bx + 20)},${f1(by2)} L${f1(bx - 20)},${f1(by2)} Z`) + note(bx + 20, (by + by2) / 2, cx + 110, 280, ["alza 8-10 cm"], INK); }
  return svg(
    view(titulo) + o +
    `<line x1="40" y1="${f1(44 + 462 * s)}" x2="420" y2="${f1(44 + 462 * s)}" stroke="#cfd3dc" stroke-width="2"/>` +
    note(ccx + 12, ccy, 470, 60, ["⊕ RC perpendicular", "al centro del RI"], RED) +
    col(470, 110, alza ? [["Misma posición que en el 1.º RI", INK, 700], ["Alza de 8-10 cm bajo el pie del lado", INK, 700], ["convexo (sentado: bajo la nalga)", INK, 700]]
      : [["De pie o sentado, sin rotación", INK, 700], ["de la pelvis ni del tórax", INK, 700], ["Brazos a los costados", INK]]) +
    col(470, 170, [["▭ punteado = RI", INK], ["Borde inferior 2,5-5 cm", INK], ["bajo la cresta ilíaca", INK]]) +
    col(470, 240, [["RI 35 x 43 o 35 x 90 · DFRI 100-150 cm", MUTE, 400, 11], ["Espiración completa", MUTE, 400, 11], ["Protección gonadal y mamaria", MUTE, 400, 11]])
  );
}

Object.assign(module.exports, {
  "columna-cervical-oblicuas--v1": oblCervPost,
  "columna-cervical-oblicuas--v2": oblCervAnt,
  "columna-cervical-lateral-flexion-extension--v1": () => flexExtCerv(22, "1.º RI · hiperflexión · vista lateral", ["Bajar el mentón hasta tocar", "el tórax, si se puede"]),
  "columna-cervical-lateral-flexion-extension--v2": () => flexExtCerv(-32, "2.º RI · hiperextensión · vista lateral", ["Levantar el mentón al máximo,", "siempre que esté cómodo"]),
  "columna-lumbar-oblicua--v1": () => lumbarOblVer(false),
  "columna-lumbar-oblicua--v2": () => lumbarOblVer(true),
  "columna-lumbar-ap-flexion-lateral--v1": () => flexLatVer(-16, "Flexión lateral derecha · vista desde el tubo", "1.ª toma: máxima flexión hacia la derecha"),
  "columna-lumbar-ap-flexion-lateral--v2": () => flexLatVer(16, "Flexión lateral izquierda · vista desde el tubo", "2.ª toma: máxima flexión hacia la izquierda"),
  "columna-lumbar-lateral-flexion-extension--v1": () => flexExtLumbVer(18, "Hiperflexión · vista desde el tubo, decúbito lateral", "1.º RI: flexión máxima", "hacia adelante"),
  "columna-lumbar-lateral-flexion-extension--v2": () => flexExtLumbVer(-18, "Hiperextensión · vista desde el tubo, decúbito lateral", "2.º RI: extensión máxima", "hacia atrás"),
  "columna-escoliosis-pa-ferguson--v1": () => fergusonVer(0, "1.º RI · PA de pie · vista desde el tubo", "de pie, sin rotación"),
  "columna-escoliosis-pa-ferguson--v2": () => fergusonVer(24, "2.º RI (con alza) · PA de pie · vista desde el tubo", "alza bajo el pie convexo"),
});
