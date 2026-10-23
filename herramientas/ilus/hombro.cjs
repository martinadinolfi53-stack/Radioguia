// Esquemas de húmero y cintura escapular (húmero, hombro, clavícula, escápula, acromioclaviculares).
// Las figuras salen del modelo anatómico: herramientas/ilus3d/figuras/hombro.py (render/<id>.webp y cortes render/<id>.json).
// Vista desde el tubo: el lado derecho del paciente queda a la izquierda del dibujo (AP) o a la derecha (PA, vista por detrás).
// Vista superior: corte horizontal a la altura de los hombros, visto desde la cabeza, con el tubo arriba y el RI abajo.
const E = require("./estilo.cjs");
const { RED, BLUE, AMB, INK, MUTE, BONEO, wall, riTop, beam, cross, coll, refline, note, view, txt, svg, dot, side, etiquetaHueso, titulo, separador, poli, encajar } = E;

// ---------- helpers ----------
const f1 = (n) => +(+n).toFixed(1);
const rad = (d) => (d * Math.PI) / 180;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const lab = (px, py, tx, ty, t, anchor = "start") =>
  `<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(anchor === "start" ? tx - 3 : tx + 3)}" y2="${f1(ty - 4)}" stroke="${BONEO}" stroke-width=".8"/>` + etiquetaHueso(f1(tx), f1(ty), t, anchor);
const azul = (p, tx, ty, t, anchor = "middle") =>
  txt(tx, ty, t, 11, BLUE, anchor) + `<line x1="${tx}" y1="${ty + 4}" x2="${f1(p[0])}" y2="${f1(p[1])}" stroke="${BLUE}" stroke-width="1"/>`;
const panelSep = (x, title) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>` +
  `<text x="${x + 14}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
const col = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");
const crossP = (p) => cross(f1(p[0]), f1(p[1]));
const redDot = (p, r = 4.5) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${RED}"/>`;
const bluePt = (p) => dot(f1(p[0]), f1(p[1]));
const ring = (p, r = 8) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="none" stroke="${BLUE}" stroke-width="2.2"/>`;
const angulo = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
function arco(c, r, a1, a2, label, color = BLUE, lr = 16) {
  const p1 = [c[0] + r * Math.cos(rad(a1)), c[1] + r * Math.sin(rad(a1))], p2 = [c[0] + r * Math.cos(rad(a2)), c[1] + r * Math.sin(rad(a2))];
  const sweep = ((a2 - a1 + 360) % 360) < 180 ? 1 : 0, am = a1 + (((a2 - a1 + 540) % 360) - 180) / 2;
  const m = [c[0] + (r + lr) * Math.cos(rad(am)), c[1] + (r + lr) * Math.sin(rad(am)) + 4];
  return `<path d="M${f1(p1[0])},${f1(p1[1])} A${r},${r} 0 0 ${sweep} ${f1(p2[0])},${f1(p2[1])}" fill="none" stroke="${color}" stroke-width="1.8"/>` +
    txt(f1(m[0]), f1(m[1]), label, 13, color, "middle", 700);
}
// RI visto desde el tubo, centrado en c, de ancho x alto cm
const riEn = (f, c, ancho, alto) => riTop(f1(c[0] - (ancho * f.ppc) / 2), f1(c[1] - (alto * f.ppc) / 2), f1(ancho * f.ppc), f1(alto * f.ppc));
// RI de canto: barra negra entre x1 y x2 a la altura y
const riBar = (x1, x2, y, label = "RI") => `<rect x="${f1(x1)}" y="${f1(y)}" width="${f1(x2 - x1)}" height="8" fill="${INK}"/>` + (label ? txt(f1(x2 + 6), f1(y + 8), label, 12, INK) : "");
// RI de canto en cualquier dirección: segmento centrado en c, perpendicular a la dirección (grados SVG) dir, de largo L
function riCanto(c, dir, L, label, lx, ly) {
  const n = [-Math.sin(rad(dir)), Math.cos(rad(dir))], a = add(c, n, -L / 2), b = add(c, n, L / 2);
  return `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${INK}" stroke-width="7"/>` + (label ? txt(lx, ly, label, 12, INK, "start", 700) : "");
}
// sentido de cada cm: punto p corrido dx, dy cm en el dibujo
const cm = (f, p, dx, dy) => [f1(p[0] + dx * f.ppc), f1(p[1] + dy * f.ppc)];

// ---------- vista en perspectiva: el paciente entero con el bucky detrás (reemplaza a los cortes horizontales) ----------
// el bucky (o RI) se dibuja con borde negro; el RC es una flecha roja que llega al punto de centrado
function persp(id, caja, blanco = "cabeza_humero_R", ns = ["b0", "b1", "b2", "b3"]) {
  const g = encajar(id, ns, caja);
  const t = g.p(blanco), a0 = g.p("rc_ini"), u0 = [t[0] - a0[0], t[1] - a0[1]], L0 = Math.hypot(...u0);
  const a = L0 > 110 ? [t[0] - (u0[0] / L0) * 110, t[1] - (u0[1] / L0) * 110] : a0, u = [t[0] - a[0], t[1] - a[1]], L = Math.hypot(...u);
  // rótulo del bucky arriba de su vértice más alto, por encima del dibujo
  const top = ns.map((n) => g.p(n)).sort((p, q) => p[1] - q[1])[0];
  let m = ""; try { m = poli(g, ["m0", "m1", "m2", "m3"], "#d5d9e1", "#9aa0ac", 1.4); } catch { /* sin camilla */ }
  return { g, t, svg: m + poli(g, ["b0", "b1", "b2", "b3"], "#e6e8ee", INK, 2.5) +
    g.svg + txt(f1(top[0]), f1(Math.max(top[1] - 7, 48)), "Bucky / RI", 10.5, INK, "middle", 700) + `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(t[0] - (u[0] / L) * 7)}" y2="${f1(t[1] - (u[1] / L) * 7)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` +
    redDot(t, 4) + txt(f1(a[0]), f1(a[1] + 16), "RC", 11, RED, "middle", 700) };
}
// esquema desde arriba (no es un corte: solo hombros, cabeza y nariz) con el ángulo entre los hombros y el RI.
// base 'AP' = espalda al RI (mira al tubo), 'PA' = de frente al RI; el hombro derecho es el que apoya.
function planta(cx, yRI, ang, base, label) {
  const a = rad(ang), R = [cx + (base === "AP" ? 30 : -30), yRI - 10];
  const Lp = base === "AP" ? [R[0] - 64 * Math.cos(a), R[1] - 64 * Math.sin(a)] : [R[0] + 64 * Math.cos(a), R[1] - 64 * Math.sin(a)];
  const m = lerp(R, Lp, 0.5), giro = (Math.atan2(Lp[1] - R[1], Lp[0] - R[0]) * 180) / Math.PI;
  const nrm = base === "AP" ? [Math.sin(a) * (base === "AP" ? 1 : -1), -Math.cos(a)] : [-Math.sin(a), -Math.cos(a)];
  const mira = base === "AP" ? nrm : [-nrm[0], -nrm[1]], nariz = add(m, mira, 15);
  const a0 = base === "AP" ? 180 : 0, a1 = giro;
  return `<rect x="${f1(cx - 62)}" y="${f1(yRI)}" width="124" height="6" fill="${INK}"/>` + txt(f1(cx + 66), f1(yRI + 7), "RI", 10.5, INK, "start", 700) +
    `<ellipse cx="${f1(m[0])}" cy="${f1(m[1])}" rx="36" ry="12" transform="rotate(${f1(giro)} ${f1(m[0])} ${f1(m[1])})" fill="${E.SK}" stroke="${E.SKO}" stroke-width="1.6"/>` +
    `<circle cx="${f1(m[0])}" cy="${f1(m[1])}" r="9" fill="${E.SK}" stroke="${E.SKO}" stroke-width="1.6"/>` +
    `<path d="M${f1(nariz[0])},${f1(nariz[1])} L${f1(m[0] + mira[0] * 8 - mira[1] * 4)},${f1(m[1] + mira[1] * 8 + mira[0] * 4)} L${f1(m[0] + mira[0] * 8 + mira[1] * 4)},${f1(m[1] + mira[1] * 8 - mira[0] * 4)} Z" fill="${E.SKO}"/>` +
    txt(f1(R[0] + (base === "AP" ? 8 : -8)), f1(R[1] - 4), "D", 10, INK, base === "AP" ? "start" : "end", 700) +
    arco([R[0], yRI - 10], 30, base === "AP" ? giro : a0, base === "AP" ? a0 : giro, label, BLUE, 26) +
    txt(cx, f1(yRI + 22), "visto desde arriba", 9.5, MUTE, "middle");
}

// vista desde el tubo (paciente con cara o nuca, RI real detrás) + vista desde arriba (planta) + textos.
// o: { id (render <id>-tubo2), blanco (punto del RC), pa (tubo por detrás), ang, base, label (planta), ri (rótulo del RI),
//      arriba (líneas bajo la planta), rc, pos, pie (columnas de texto), extra(f, t) (agregados sobre la vista desde el tubo) }
function tuboArriba(o) {
  const RI = ["b0", "b1", "b2", "b3"], f = encajar(o.id + "-tubo2", RI, [14, 40, 290, 272]), t = f.p(o.blanco);
  const top = RI.map((n) => f.p(n)).sort((p, q) => p[1] - q[1] || p[0] - q[0])[0];
  const dash = `<path d="M${RI.map((n) => f.p(n).map(f1).join(",")).join(" L")} Z" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  return svg(
    titulo(12, "", o.pa ? "Desde el tubo (por detrás)" : "Desde el tubo") +
    poli(f, RI, "#e6e8ee", INK, 2.2) + f.svg + dash + txt(f1(top[0] + 4), f1(Math.max(top[1] + 14, 50)), o.ri, 10.5, INK, "start", 700) +
    crossP(t) + (o.extra ? o.extra(f, t) : "") +
    separador(318) + titulo(330, "", "Vista desde arriba", "otra") +
    `<g transform="translate(420 168) scale(1.25) translate(-420 -168)">${planta(410, 168, o.ang, o.base, o.label)}</g>` +
    col(330, 236, o.arriba.map((l) => [l, INK, 400, 10.5])) +
    separador(522) + col(534, 52, o.rc) + col(534, 52 + o.rc.length * 15 + 16, o.pos) + col(534, 252, o.pie)
  );
}
const I = {};

// ---------- vista superior (corte a la altura de los hombros) ----------
// Pone el corte con su punto más bajo apoyado en el RI (y = yRI), dibuja el RI, el RC perpendicular hacia el blanco y el ángulo
// entre el plano frontal del paciente (línea de las dos cabezas humerales) y el RI.
function superior(id, { x = 200, yRI = 272, ppc = 6.2, blanco = "cabeza_humero_R", ang, rcTxt = "RC ⟂ al RI", rcFin = false, largo = 60 } = {}) {
  const k = E.corte(id, { en: ["apoyo", x, yRI], ppc });
  const R = k.p("cabeza_humero_R"), L = k.p("cabeza_humero_L");
  const t = blanco === "escapula" ? k.hueso("Right scapula") : k.p(blanco);
  const [a, b] = R[1] > L[1] ? [R, L] : [L, R];         // a: el hombro que apoya en el RI
  const giro = angulo(a, b), ref = b[0] > a[0] ? 0 : 180;
  let s = riBar(x - 150, x + 150, yRI + 2, "") + txt(f1(x + 150), f1(yRI + 22), "RI", 12, INK, "end", 700) +
    txt(f1(x - 150), f1(yRI + 22), "Bucky vertical", 10, MUTE) + k.svg;
  s += refline(...lerp(a, b, -0.15).map(f1), ...lerp(a, b, 1.15).map(f1)) +
    `<line x1="${f1(a[0] - 70)}" y1="${f1(a[1])}" x2="${f1(a[0] + 70)}" y2="${f1(a[1])}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="3 4"/>`;
  if (ang) s += arco(a, 46, ref === 0 ? giro : ref, ref === 0 ? 0 : giro, ang, BLUE, 18);
  s += `<line x1="${f1(t[0])}" y1="38" x2="${f1(t[0])}" y2="${f1(t[1] - 6)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` +
    redDot(t) + txt(f1(t[0] + (rcFin ? -8 : 8)), 46, rcTxt, 11.5, RED, rcFin ? "end" : "start", 700);
  return { k, a, b, t, svg: s };
}

// ======================= HÚMERO =======================
I["humero-ap"] = () => {
  const f = E.figura("humero-ap", { caja: [40, 34, 340, 290] });
  const c = f.p("centro:Right humerus");
  return svg(
    view("Vista desde el tubo · de pie o decúbito supino") + side(24, 52, "D") +
    riEn(f, c, 35, 43) + txt(f1(c[0] - 17.5 * f.ppc + 6), f1(c[1] - 21.5 * f.ppc + 16), "RI 35 x 43 vertical", 11.5, INK) +
    f.svg + coll(f1(c[0] - 9 * f.ppc), f1(f.p("acromion_R")[1] - 3 * f.ppc), f1(16 * f.ppc), f1(f.p("codo_R")[1] - f.p("acromion_R")[1] + 6 * f.ppc)) +
    crossP(c) + refline(...lerp(f.p("epicondilo_lat_R"), f.p("epicondilo_med_R"), -0.6).map(f1), ...lerp(f.p("epicondilo_lat_R"), f.p("epicondilo_med_R"), 1.6).map(f1)) +
    bluePt(f.p("epicondilo_lat_R")) + bluePt(f.p("epicondilo_med_R")) +
    note(c[0] + 10, c[1] + 2, 420, 100, ["RC perpendicular, en la parte", "media del húmero"], RED) +
    note(...f.p("epicondilo_med_R"), 420, 162, ["Epicóndilos paralelos al RI"], BLUE) +
    note(...cm(f, f.p("codo_R"), 0, 6), 420, 204, ["Brazo un poco separado y mano", "supinada (AP verdadera)"]) +
    note(f1(c[0] + 7 * f.ppc), f1(c[1] - 6 * f.ppc), 420, 256, ["Colimar a los lados, hasta partes", "blandas de húmero y hombro"], AMB) +
    txt(420, 304, "DFRI 100 cm · parrilla si el grosor supera 10 cm", 11.5, MUTE) +
    txt(420, 318, "Incluir codo y hombro (en diagonal si hace falta)", 11.5, MUTE)
  );
};

I["humero-lateral-rotacion--v1"] = () => tuboArriba({ id: "humero-lateral-rotacion--v1", blanco: "centro:Right humerus", pa: true, ang: 17.5, base: "PA", label: "15-20°", ri: "RI 35 x 43",
  arriba: ["De pie en PA, rotado 15-20°", "hasta que húmero y hombro", "toquen el RI"],
  rc: [["RC perpendicular, en la", RED, 700, 12], ["parte media del húmero", RED, 700, 12]],
  pos: [["Codo flexionado 90°,", INK, 700], ["antebrazo por delante", INK, 700], ["del abdomen", INK, 700], ["Epicóndilos perpendiculares", INK], ["al RI (lateral verdadera)", INK]],
  pie: [["RI 35 x 43 o 30 x 35 vertical", MUTE, 400, 11], ["Incluir codo y hombro", MUTE, 400, 11], ["No rotar si hay fractura", MUTE, 400, 11]] });
I["humero-lateral-rotacion--v2"] = () => {
  const f = E.figura("humero-lateral-rotacion--v2", { caja: [40, 30, 340, 296] });
  const c = f.p("centro:Right humerus"), el = lerp(f.p("epicondilo_lat_R"), f.p("epicondilo_med_R"), 0.5);
  return svg(
    view("AP de pie o en decúbito · vista desde el tubo") + side(24, 52, "D") +
    riEn(f, c, 35, 43) + txt(f1(c[0] - 17.5 * f.ppc - 6), f1(c[1] - 21.5 * f.ppc + 14), "RI 35 x 43", 11.5, INK, "end") + txt(f1(c[0] - 17.5 * f.ppc - 6), f1(c[1] - 21.5 * f.ppc + 28), "vertical", 11.5, INK, "end") +
    f.svg + crossP(c) + ring(el) + bluePt(el) +
    note(c[0] + 10, c[1] + 2, 420, 92, ["RC perpendicular, en la parte", "media del húmero"], RED) +
    note(el[0] + 8, el[1], 420, 146, ["Epicóndilos perpendiculares al RI", "(lateral verdadera): superpuestos"], BLUE) +
    note(...f.p("grande_R"), 420, 204, ["Codo un poco flexionado, brazo y", "muñeca rotados: palma hacia atrás", "(pronación)"]) +
    col(420, 282, [["Incluir codo y hombro · DFRI 100 cm", MUTE, 400, 11], ["No rotar si hay sospecha de fractura", MUTE, 400, 11]])
  );
};

// por traumatismo: decúbito supino, rayo horizontal desde lateral; el dibujo es lo que ve el tubo (frente del paciente arriba)
I["humero-lateral-trauma"] = () => {
  const f = E.figura("humero-lateral-trauma", { caja: [20, 40, 420, 270] });
  const h = f.p("cabeza_humero_R"), e = f.p("codo_R"), t = lerp(e, h, 1 / 3);
  const w = Math.abs(e[0] - h[0]) * 0.75, x0 = Math.min(e[0], h[0]) + Math.abs(e[0] - h[0]) * 0.05;
  return svg(
    titulo(12, "", "Desde el tubo · decúbito supino, rayo horizontal") +
    // RI detrás del brazo (entre brazo y tórax): placa gris con borde negro, debajo del dibujo
    `<rect x="${f1(x0)}" y="${f1(t[1] - 12 * f.ppc)}" width="${f1(w)}" height="${f1(15 * f.ppc)}" fill="#d9dce3" stroke="${INK}" stroke-width="2.5"/>` + f.svg +
    // contorno del RI por encima (punteado negro): queda tapado por el brazo
    `<rect x="${f1(x0)}" y="${f1(t[1] - 12 * f.ppc)}" width="${f1(w)}" height="${f1(15 * f.ppc)}" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="7 5"/>` +
    txt(f1(f.x + 4), f1(t[1] - 12 * f.ppc - 14), "RI detrás del brazo (entre brazo y tórax)", 11, INK) + crossP(t) +
    txt(f1(f.x + 4), f1(f.y + f.h + 14), "← cabeza", 11, MUTE) +
    note(t[0] + 6, t[1] + 8, 470, 92, ["RC horizontal, ⟂ al RI,", "en el tercio distal del húmero"], RED) +
    note(f1(x0 + w), f1(t[1] - 6 * f.ppc), 470, 150, ["RI paralelo al húmero, entre", "brazo y tórax, borde superior", "en la axila"]) +
    note(...f.p("grande_R"), 470, 222, ["Codo flexionado, mano en", "lateral verdadera del codo"]) +
    txt(470, 270, "Brazo elevado con suavidad sobre un bloque de apoyo", 11, INK) +
    txt(470, 288, "RI 30 x 35 o 24 x 30 horizontal · sin parrilla", 11, MUTE) +
    txt(470, 302, "Protección entre RI y paciente · DFRI 100 cm", 11, MUTE) +
    txt(470, 316, "Colimar: húmero medio y distal, codo y antebrazo", 11, AMB)
  );
};

// transtorácicas: lado afectado contra el RI; el rayo atraviesa el tórax desde el otro lado
function transtoracica(id, blanco, extra) {
  const f = E.figura(id, { caja: [70, 30, 300, 296] });
  const t = blanco(f), xRI = f1(f.x - 14);
  return svg(
    view("Vista de frente · lado afectado contra el RI") + side(24, 52, "D") +
    wall(xRI - 12, 44, 300, "") + txt(xRI - 6, 38, "RI", 11, INK, "middle", 700) + f.svg +
    beam(f1(t[0]), f1(t[1]), 180, f1(f.x + f.w + 70 - t[0]), { ref: 180 }) + redDot(t) +
    extra(f, t)
  );
}
I["humero-transtoracica"] = () => transtoracica("humero-transtoracica", (f) => f.p("centro:Right humerus"), (f, t) =>
  txt(20, 76, "Lado afectado", 12, INK, "start", 700) + txt(20, 92, "pegado al RI", 12, INK) +
  note(...f.p("codo_L"), 520, 70, ["Brazo opuesto por", "encima de la cabeza"]) +
  lab(t[0], t[1] + 6, 400, 300, "húmero", "start") +
  txt(520, 180, "De pie o en decúbito", 12, INK, "start", 700) +
  txt(520, 230, "RC perpendicular al RI, en la parte", 12, RED, "start", 700) + txt(520, 246, "media de la diáfisis del húmero afectado", 12, RED, "start", 700) +
  txt(520, 276, "RI 35 x 43 vertical · parrilla · DFRI 100 cm", 11, MUTE) +
  txt(520, 290, "Respiración suave (ortostática):", 11, MUTE) + txt(520, 304, "exposición de 3 s o más", 11, MUTE));

// ======================= HOMBRO =======================
// AP con rotación: RC 2,5 cm por debajo de la coracoides
function hombroAP(id, titulo, rc, notas) {
  const f = E.figura(id, { caja: [30, 30, 380, 296] });
  const t = cm(f, f.p("coracoides_R"), 0, rc);
  return { f, t, svg: view(titulo) + side(24, 52, "D") + riEn(f, t, 30, 24) + txt(f1(t[0] - 15 * f.ppc + 6), f1(t[1] + 12 * f.ppc - 6), "RI 24 x 30 horizontal", 11, INK) +
    f.svg + crossP(t) + notas(f, t) };
}
const epis = (f) => [f.p("epicondilo_lat_R"), f.p("epicondilo_med_R")];
const hombroRotTxt = () =>
  col(430, 196, [["De pie o en decúbito supino, brazo", INK], ["en leve abducción; tórax rotado para", INK], ["apoyar el hombro posterior en el RI", INK]]) +
  col(430, 258, [["RI 24 x 30 horizontal · parrilla", MUTE, 400, 11], ["Apnea · DFRI 100 cm", MUTE, 400, 11], ["No hacerla si se sospecha fractura o luxación", MUTE, 400, 11]]);
I["hombro-ap-rotacion--v1"] = () => svg(hombroAP("hombro-ap-rotacion--v1", "Rotación externa · vista desde el tubo", 2.5, (f, t) => {
  const [l, m] = epis(f);
  return refline(...lerp(l, m, -0.6).map(f1), ...lerp(l, m, 1.6).map(f1)) + bluePt(l) + bluePt(m) +
    note(t[0] + 10, t[1], 430, 60, ["RC perpendicular, 2,5 cm por", "debajo de la apófisis coracoides"], RED) +
    note(...m, 430, 120, ["Brazo rotado hacia afuera: mano en", "supinación, epicóndilos paralelos al RI"], BLUE) +
    lab(...f.p("coracoides_R"), 40, 92, "coracoides", "start");
}).svg + hombroRotTxt());
I["hombro-ap-rotacion--v2"] = () => svg(hombroAP("hombro-ap-rotacion--v2", "Rotación interna · vista desde el tubo", 2.5, (f, t) => {
  const [l, m] = epis(f), e = lerp(l, m, 0.5);
  return ring(e) + bluePt(e) +
    note(t[0] + 10, t[1], 430, 60, ["RC perpendicular, 2,5 cm por", "debajo de la apófisis coracoides"], RED) +
    note(e[0] + 8, e[1], 430, 120, ["Brazo rotado hacia adentro: mano en", "pronación, epicóndilos ⟂ al RI"], BLUE) +
    lab(...f.p("coracoides_R"), 40, 92, "coracoides", "start");
}).svg + hombroRotTxt());
I["hombro-ap-neutra"] = () => svg(hombroAP("hombro-ap-neutra", "Vista desde el tubo · rotación neutra", 2, (f, t) =>
  note(t[0] + 10, t[1], 430, 60, ["RC perpendicular, unos 2 cm", "debajo de la apófisis coracoides"], RED) +
  note(...f.p("codo_R"), 430, 120, ["Brazo en posición neutra: palma", "hacia el muslo (si no hay trauma agudo)"]) +
  lab(...f.p("coracoides_R"), 40, 92, "coracoides", "start") +
  col(430, 186, [["Erguido (sentado o de pie) o en", INK], ["decúbito supino; brazo en abducción", INK], ["ligera. Girar el tórax lo necesario", INK], ["para apoyar el hombro posterior", INK]]) +
  col(430, 262, [["RI 24 x 30 horizontal (o vertical para más", MUTE, 400, 11], ["húmero) · parrilla · DFRI 100 cm", MUTE, 400, 11], ["Colimar a los cuatro lados", AMB, 400, 11]])).svg);

// AP axial apical: de frente (desde el tubo) y de costado con el RC 30° caudal
I["hombro-ap-axial-apical"] = () => {
  const f = E.figura("hombro-ap-axial-apical", { caja: [16, 30, 300, 296] });
  const s = E.figura("hombro-ap-axial-apical-costado", { caja: [440, 30, 150, 296] });
  const t = cm(f, f.p("coracoides_R"), 0, -1.25), ts = cm(s, s.p("coracoides_R"), 0, -1.25);
  return svg(
    view("1 · De frente (desde el tubo)") + side(24, 52, "D") + f.svg + redDot(t) +
    lab(...f.p("coracoides_R"), 40, 100, "coracoides", "start") +
    note(t[0] + 6, t[1] - 4, 250, 60, ["RC 1,25 cm por", "encima de la", "coracoides"], RED, "start") +
    col(200, 250, [["Sin rotación", INK, 700, 12], ["mano en posición neutra", MUTE, 400, 11]]) +
    panelSep(388, "2 · De costado (espalda al RI)") + wall(f1(s.x - 16), 44, 300, "") + s.svg +
    beam(f1(ts[0]), f1(ts[1]), 150, 150, { ref: 180, angLabel: "30°" }) + redDot(ts) +
    col(600, 230, [["RC 30° caudal, entra", RED, 700, 12], ["1,25 cm por encima", RED, 700, 12], ["de la coracoides", RED, 700, 12]]) +
    col(600, 286, [["DFRI 100 cm · parrilla", MUTE, 400, 11], ["Colimar hasta partes", AMB, 400, 11], ["blandas del hombro", AMB, 400, 11]])
  );
};

// Grashey: vista superior (oblicua posterior 35-45°) y punto de centrado desde el tubo
I["hombro-grashey"] = () => tuboArriba({ id: "hombro-grashey", blanco: "cabeza_humero_R", ang: 40, base: "AP", label: "35-45°", ri: "RI 18 x 24",
  arriba: ["Espalda contra el RI, rotado", "35-45° hacia el lado afectado:", "escápula paralela al RI"],
  rc: [["RC perpendicular, en la", RED, 700, 12], ["articulación escapulohumeral:", RED, 700, 12], ["≈5 cm abajo y medial del", INK], ["borde superolateral del hombro", INK]],
  pos: [["De pie (preferible) o supino", INK, 700], ["Brazo al costado, en", INK], ["rotación neutra", INK]],
  pie: [["RI 18 x 24 horizontal", MUTE, 400, 11], ["parrilla · apnea · DFRI 100 cm", MUTE, 400, 11]] });

// Garth: vista superior (oblicua posterior 45°) y vista desde el tubo
I["hombro-garth"] = () => tuboArriba({ id: "hombro-garth", blanco: "cabeza_humero_R", ang: 45, base: "AP", label: "45°", ri: "RI 24 x 30",
  arriba: ["Espalda contra el RI, rotado", "45° hacia el lado afectado", "(oblicua posterior)"],
  rc: [["RC 45° caudal (angulación),", RED, 700, 12], ["a la cara medial de la", RED, 700, 12], ["articulación escapulohumeral", RED, 700, 12]],
  pos: [["Codo flexionado, mano", INK, 700], ["sobre el otro hombro", INK, 700], ["(o brazo al costado si", INK], ["hay lesión)", INK]],
  pie: [["RI 24 x 30 vertical, centrado", MUTE, 400, 11], ["en la salida del RC", MUTE, 400, 11], ["parrilla · apnea", MUTE, 400, 11]] });

// Y de escápula / Neer: vista superior (desde la PA, oblicua anterior 45-60°) y vista desde el tubo (por detrás)
I["hombro-y-escapula-neer"] = () => tuboArriba({ id: "hombro-y-escapula-neer", blanco: "cabeza_humero_R", pa: true, ang: 52, base: "PA", label: "45-60°", ri: "RI 24 x 30",
  arriba: ["De frente al RI (PA), rotado", "45-60° con el hombro afectado", "contra el RI: escápula ⟂ al RI"],
  rc: [["Y de escápula: RC ⟂", RED, 700, 12], ["Neer: RC 10-15° caudal", RED, 700, 12], ["(angulación), al borde", RED, 700, 12], ["superior de la cabeza humeral", RED, 700, 12]],
  pos: [["Brazo sano adelante", INK, 700], ["y arriba; el afectado", INK], ["abajo, sin moverlo", INK]],
  pie: [["RI 24 x 30 vertical", MUTE, 400, 11], ["parrilla · apnea", MUTE, 400, 11]] });

I["hombro-transtoracica-lawrence"] = () => transtoracica("hombro-transtoracica-lawrence", (f) => lerp(f.p("cabeza_humero_R"), f.p("centro:Right humerus"), 0.3), (f, t) =>
  txt(520, 128, "Brazo afectado al costado, en", 12, INK, "start", 700) + txt(520, 144, "rotación neutra, contra el RI", 12, INK) +
  note(...f.p("codo_L"), 520, 64, ["Brazo y hombro sanos", "elevados, por encima", "de la cabeza"]) +
  lab(t[0], t[1] + 6, 400, 300, "cuello quirúrgico", "start") +
  txt(520, 168, "De pie o en decúbito supino", 12, INK, "start", 700) +
  txt(520, 206, "RC perpendicular al RI, atraviesa", 12, RED, "start", 700) + txt(520, 222, "el tórax hasta el cuello quirúrgico", 12, RED, "start", 700) +
  txt(520, 244, "Si no se puede elevar el hombro sano:", 11.5, RED) + txt(520, 258, "RC 10-15° cefálico", 11.5, RED, "start", 700) +
  txt(520, 286, "RI 24 x 30 vertical · parrilla · inspiración", 11, MUTE) + txt(520, 300, "completa (o respiración suave)", 11, MUTE));

// Lawrence axial: decúbito supino visto desde arriba; RC horizontal desde abajo (caudal), 25-30° hacia medial, a la axila
I["hombro-axial-lawrence"] = () => {
  // vista desde el techo: paciente acostado, camilla con el borde en el hombro, RI vertical (de canto) contra el cuello y RC
  // horizontal que entra por la axila con 25-30° hacia medial respecto del eje del cuerpo
  const f = encajar("hombro-axial-lawrence-cenital", ["b0", "b1", "rc_ini"], [16, 40, 410, 280]);
  const t = f.p("cabeza_humero_R"), a0 = f.p("rc_ini"), b0 = f.p("b0"), b1 = f.p("b1");
  const u = [t[0] - a0[0], t[1] - a0[1]], L = Math.hypot(...u), a = [t[0] - (u[0] / L) * 140, t[1] - (u[1] / L) * 140];
  const ang = angulo(t, a), eje = 90;     // el eje del cuerpo va hacia abajo (los pies) en el dibujo
  const clip = `<clipPath id="pl"><rect x="10" y="34" width="420" height="292"/></clipPath>`;
  // vista de costado (esquema): camilla, paciente de perfil mirando al techo, RI vertical sobre el hombro, RC horizontal
  const X0 = 470, Y0 = 118;
  const costado = `<rect x="${X0}" y="${Y0}" width="270" height="6" fill="#c9ced8"/>` +
    `<rect x="${X0 + 40}" y="${Y0 - 30}" width="200" height="30" rx="14" fill="${E.SK}" stroke="${E.SKO}" stroke-width="1.6"/>` +
    `<circle cx="${X0 + 22}" cy="${Y0 - 22}" r="17" fill="${E.SK}" stroke="${E.SKO}" stroke-width="1.6"/>` +
    `<path d="M${X0 + 12},${Y0 - 39} L${X0 + 15},${Y0 - 46} L${X0 + 20},${Y0 - 39} Z" fill="${E.SKO}"/>` +
    `<rect x="${X0 + 44}" y="${Y0 - 62}" width="7" height="62" fill="#e6e8ee" stroke="${INK}" stroke-width="2"/>` +
    txt(X0 + 47, Y0 - 68, "RI vertical", 10, INK, "middle", 700) +
    `<line x1="${X0 + 250}" y1="${Y0 - 15}" x2="${X0 + 64}" y2="${Y0 - 15}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` +
    txt(X0 + 250, Y0 - 22, "RC horizontal", 10, RED, "end", 700) + txt(X0 + 160, Y0 + 20, "pies →", 10, MUTE, "middle");
  return svg(
    titulo(12, "", "Vista desde arriba (desde el techo)", "otra") + clip +
    `<g clip-path="url(#pl)">${poli(f, ["m0", "m1", "m2", "m3"], "#d5d9e1", "#9aa0ac", 1.4)}</g>` + f.svg +
    `<line x1="${f1(b0[0])}" y1="${f1(b0[1])}" x2="${f1(b1[0])}" y2="${f1(b1[1])}" stroke="${INK}" stroke-width="7" stroke-linecap="butt"/>` +
    col(30, 62, [["RI vertical (visto de canto),", INK, 700], ["arriba del hombro, contra el cuello", INK]]) +
    `<line x1="${f1(Math.min(b0[0], b1[0]) - 3)}" y1="${f1(b0[0] < b1[0] ? b0[1] : b1[1])}" x2="232" y2="70" stroke="${INK}" stroke-width="1"/>` +
    `<line x1="${f1(t[0])}" y1="${f1(t[1])}" x2="${f1(t[0])}" y2="${f1(t[1] + 120)}" stroke="${MUTE}" stroke-width="1.2" stroke-dasharray="5 4"/>` +
    `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(t[0] - (u[0] / L) * 7)}" y2="${f1(t[1] - (u[1] / L) * 7)}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` +
    arco(t, 70, eje, ang, "25-30°", BLUE, 22) + redDot(t, 4) + txt(f1(a[0]), f1(a[1] + 16), "RC", 11, RED, "middle", 700) +
    txt(16, 318, "Camilla con el borde a la altura del hombro; el brazo queda afuera, sobre un apoyo.", 10.5, INK) +
    separador(440) + titulo(452, "", "Vista de costado", "otra") + costado +
    col(452, 160, [["RC horizontal, 25-30° hacia medial,", RED, 700, 12], ["apuntando a la axila", RED, 700, 12], ["Menos ángulo si el brazo no llega a 90°", INK, 400, 11]]) +
    col(452, 216, [["Decúbito supino, apoyo bajo el hombro;", INK, 700], ["brazo a 90° de abducción, rotación", INK], ["externa (mano en supinación);", INK], ["cabeza girada al lado opuesto", INK]]) +
    col(452, 288, [["RI 18 x 24 horizontal · parrilla · DFRI 100 cm", MUTE, 400, 11], ["No hacer si se sospecha fractura o luxación", MUTE, 400, 11]])
  );
};

// Hobbs: PA (vista por detrás), brazo elevado
I["hombro-transaxilar-hobbs"] = () => {
  const f = E.figura("hombro-transaxilar-hobbs", { caja: [130, 28, 300, 298] });
  const t = f.p("cabeza_humero_R");
  return svg(
    view("Vista desde el tubo · PA, de pie o en decúbito") + side(48, 70, "D") +
    txt(30, 96, "vista por detrás:", 10.5, MUTE) + txt(30, 108, "el lado derecho", 10.5, MUTE) + txt(30, 120, "queda a la derecha", 10.5, MUTE) +
    riEn(f, t, 18, 24) + f.svg + crossP(t) +
    note(t[0] + 10, t[1] + 6, 470, 210, ["RC perpendicular, centrado en", "la articulación glenohumeral"], RED) +
    note(...f.p("codo_R"), 470, 90, ["Brazo afectado elevado,", "en extensión completa"]) +
    note(...cm(f, f.p("apofisis_c7"), -2, -12), 470, 150, ["Cabeza girada hacia", "el otro lado"]) +
    txt(470, 264, "RI 18 x 24 vertical", 11.5, INK) + txt(470, 280, "Parrilla · apnea · DFRI 100 cm", 11.5, MUTE) +
    txt(470, 296, "Colimación ajustada a los cuatro lados", 11.5, AMB)
  );
};

// Clements: decúbito lateral sobre el lado sano, visto de frente; brazo afectado hacia arriba; RI contra la parte superior del
// hombro (del lado de la cabeza) y RC horizontal desde los pies
I["hombro-axial-clements"] = () => {
  const f = E.figura("hombro-axial-clements", { caja: [70, 30, 330, 290] });
  const t = f.p("cabeza_humero_R"), cab = f.p("acromion_L");
  const der = cab[0] > t[0];                            // la cabeza del paciente, hacia la derecha del dibujo
  const xRI = f1(t[0] + (der ? 1 : -1) * 4.5 * f.ppc);
  return svg(
    view("Vista de frente · decúbito lateral sobre el lado sano") + f.svg +
    `<rect x="${f1(xRI - 4)}" y="${f1(t[1] - 11 * f.ppc)}" width="8" height="${f1(22 * f.ppc)}" fill="${INK}"/>` + txt(f1(xRI + 8), f1(t[1] - 9 * f.ppc), "RI", 12, INK, "start", 700) +
    beam(f1(t[0]), f1(t[1]), der ? 0 : 180, f1(Math.abs(t[0] - (der ? 30 : 420)) + 0), { horizontal: true }) + redDot(t) +
    note(...f.p("codo_R"), 430, 40, ["Brazo afectado elevado,", "90° de abducción"]) +
    txt(470, 100, "RC perpendicular al RI", 12.5, RED, "start", 700) +
    txt(470, 118, "Sin 90° de abducción: angular", 11.5, INK) + txt(470, 132, "el tubo 5-15° hacia la axila", 11.5, INK) +
    txt(470, 170, "Paciente acostado sobre el lado sano;", 11.5, INK) + txt(470, 184, "hombro afectado arriba", 11.5, INK) +
    txt(470, 270, "RI 18 x 24 vertical · sin parrilla (o con ella", 11, MUTE) + txt(470, 284, "si el RC le queda perpendicular) · apnea", 11, MUTE) +
    txt(470, 304, "DFRI 100 cm · colimar a los cuatro lados", 11, MUTE)
  );
};

// Fisk: v1 decúbito supino de costado (frente arriba); v2 de pie inclinado sobre la mesa
I["hombro-fisk--v1"] = () => {
  const p = persp("hombro-fisk--v1-persp", [10, 36, 430, 286], "troquiter_R", ["b0", "b1", "b2", "b3", "m0", "m1", "m2", "m3"]);
  return svg(
    titulo(12, "", "Cómo se ubica el paciente", "otra") + p.svg +
    col(470, 50, [["Decúbito supino, brazo un poco", INK, 700], ["separado y mano en supinación", INK, 700]]) +
    col(470, 92, [["RI vertical contra la parte", INK, 700], ["superior del hombro, ⟂ al RC", INK, 700], ["(como en la fig. 3.23 del libro)", MUTE]]) +
    col(470, 152, [["RC desde los pies, casi horizontal:", RED, 700, 12], ["angulación 10-15° hacia posterior", RED, 700, 12], ["desde la horizontal, tangencial", RED, 700, 12], ["al surco bicipital", RED, 700, 12]]) +
    col(470, 226, [["Palpar la cabeza humeral anterior", INK], ["para ubicar el surco", INK]]) +
    col(470, 290, [["RI 18 x 24 horizontal · sin parrilla · apnea", MUTE, 400, 11]])
  );
};
I["hombro-fisk--v2"] = () => {
  const f = E.figura("hombro-fisk--v2", { caja: [30, 40, 380, 260] });
  const sh = f.p("cabeza_humero_R"), el = f.p("codo_R"), t = f.p("troquiter_R");
  const mesa = f1(f.abajo(el[0] + 10, f.x + f.w) + 2);
  const yRI = f1(mesa - 3.4 * f.ppc - 8);
  return svg(
    view("De pie (alternativa) · de costado") +
    `<rect x="${f1(el[0] - 20)}" y="${mesa}" width="${f1(f.x + f.w - el[0] + 40)}" height="12" fill="#cfd3dc"/>` + txt(f1(f.x + f.w - 30), f1(mesa + 26), "Mesa", 10, MUTE) +
    f.svg + riBar(f1(t[0] - 6 * f.ppc), f1(t[0] + 12 * f.ppc), yRI, "") + txt(f1(t[0] - 6 * f.ppc - 6), f1(yRI + 5), "RI", 12, INK, "end", 700) +
    `<line x1="${f1(sh[0])}" y1="${f1(sh[1])}" x2="${f1(sh[0])}" y2="${f1(sh[1] + 120)}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 4"/>` +
    arco(sh, 70, 90, angulo(sh, el), "10-15°", BLUE, 22) +
    beam(f1(t[0]), f1(t[1]), 90, f1(Math.max(70, t[1] - 50))) + redDot(t) +
    col(470, 70, [["RC vertical, perpendicular al RI", RED, 700, 12]]) +
    col(470, 110, [["De pie, inclinado hacia adelante", INK, 700], ["sobre el extremo de la mesa", INK, 700], ["Húmero a 10-15° de la vertical", INK]]) +
    col(470, 180, [["Palpar la cabeza humeral anterior", MUTE], ["para ubicar el surco", MUTE]]) +
    col(470, 300, [["RI 18 x 24 horizontal · sin parrilla · apnea", MUTE, 400, 11]])
  );
};

// ======================= CLAVÍCULA =======================
I["clavicula-ap-axial--v1"] = () => {
  const f = E.figura("clavicula-ap", { caja: [40, 30, 360, 296] });
  const c = f.p("clavicula_media_R"), ac = f.p("acromion_R"), y = f.p("yugular");
  return svg(
    view("AP · vista desde el tubo") + side(24, 44, "D") +
    riEn(f, c, 30, 24) + f.svg +
    coll(f1(ac[0] - 2 * f.ppc), f1(c[1] - 5 * f.ppc), f1(y[0] - ac[0] + 4 * f.ppc), f1(10 * f.ppc)) +
    bluePt(ac) + bluePt(y) + crossP(c) +
    azul(ac, 110, 52, "articulación AC") + azul(y, f1(y[0] + 20), f1(y[1] + 90), "escotadura yugular") +
    note(c[0] + 10, c[1] - 4, 430, 70, ["RC perpendicular, en la", "parte media de la clavícula"], RED) +
    col(430, 128, [["De pie o en decúbito", INK, 700], ["Clavícula y RI centrados en el RC:", INK], ["a mitad de camino entre la escotadura", INK], ["yugular y la articulación AC", INK]]) +
    col(430, 220, [["Colimar incluyendo las articulaciones", AMB, 400, 11], ["AC y esternoclavicular", AMB, 400, 11]]) +
    col(430, 270, [["RI 24 x 30 horizontal · parrilla", MUTE, 400, 11], ["Inspiración completa · DFRI 100 cm", MUTE, 400, 11]])
  );
};
I["clavicula-ap-axial--v2"] = () => {
  const f = E.figura("clavicula-costado", { caja: [150, 30, 150, 296] });
  const c = f.p("clavicula_media_R");
  return svg(
    view("AP axial · de costado, espalda al RI") +
    wall(f1(f.x - 18), 44, 300, "") + txt(f1(f.x - 12), 38, "Bucky / RI", 10, MUTE, "middle") + f.svg +
    beam(f1(c[0]), f1(c[1]), 202.5, 140, { ref: 180, angLabel: "15-30°" }) + redDot(c) +
    lab(c[0] - 2, c[1], f1(f.x - 26), f1(c[1] - 30), "clavícula", "end") +
    col(470, 70, [["RC 15-30° cefálico, en la parte", RED, 700, 12], ["media de la clavícula", RED, 700, 12]]) +
    col(470, 116, [["Hombros delgados: hacen falta", INK], ["5-15° más que en hombros gruesos", INK]]) +
    col(470, 168, [["De pie o en decúbito", INK, 700], ["En lugar de angular el RC, se puede", INK], ["usar una posición AP lordótica", INK]]) +
    col(470, 250, [["Colimar incluyendo las articulaciones", AMB, 400, 11], ["AC y esternoclavicular", AMB, 400, 11]]) +
    col(470, 290, [["RI 24 x 30 horizontal · parrilla", MUTE, 400, 11], ["Inspiración completa · DFRI 100 cm", MUTE, 400, 11]])
  );
};

// ======================= ESCÁPULA =======================
I["escapula-ap"] = () => {
  const f = E.figura("escapula-ap", { caja: [16, 40, 430, 250] });
  const t = f.p("centro:Right scapula");
  return svg(
    view("Vista desde el tubo · de pie o decúbito supino") + side(24, 52, "D") +
    riEn(f, t, 24, 30) + f.svg + crossP(t) +
    lab(...f.p("coracoides_R"), 120, 300, "coracoides", "end") +
    note(t[0] + 10, t[1] + 6, 470, 110, ["RC perpendicular, en la parte", "media de la escápula"], RED) +
    txt(470, 150, "≈5 cm debajo de la coracoides y", 12, INK) + txt(470, 166, "≈5 cm medial del borde lateral", 12, INK) +
    note(...f.p("codo_R"), 470, 206, ["Brazo abducido 90°, mano", "supinada: menos costillas", "sobre la escápula"]) +
    txt(470, 270, "RI 24 x 30 vertical", 11, INK) + txt(470, 284, "Respiración suave o apnea · parrilla · DFRI 100 cm", 11, MUTE) +
    txt(470, 300, "Colimar hasta los bordes de la escápula", 11, AMB)
  );
};
const escapulaTxt = () =>
  col(430, 70, [["RC perpendicular al RI, en el borde", RED, 700, 12], ["medial de la escápula, a mitad", RED, 700, 12], ["de su altura", RED, 700, 12]]) +
  col(430, 130, [["De pie (preferible) o en decúbito", INK, 700], ["Palpar los bordes de la escápula y", INK], ["rotar el tórax hasta que su cuerpo", INK], ["quede ⟂ al RI (45-60°)", INK]]);
function escapulaLat(v, brazoTxt) {
  return tuboArriba({ id: `escapula-lateral--${v}`, blanco: "centro:Right scapula", pa: true, ang: 52, base: "PA", label: "45-60°", ri: "RI 24 x 30",
    arriba: ["De frente al RI (PA), rotado", "hasta que el cuerpo de la", "escápula quede ⟂ al RI"],
    rc: [["RC perpendicular al RI,", RED, 700, 12], ["en el borde medial de", RED, 700, 12], ["la escápula, a mitad", RED, 700, 12], ["de su altura", RED, 700, 12]],
    pos: brazoTxt,
    pie: [["De pie (preferible) o en", MUTE, 400, 11], ["decúbito · RI 24 x 30", MUTE, 400, 11], ["vertical · apnea · DFRI 100 cm", MUTE, 400, 11]] });
}
I["escapula-lateral--v1"] = () => escapulaLat("v1", [["Cuerpo de la escápula:", INK, 700], ["brazo cruzado por delante,", INK], ["mano en el hombro opuesto", INK]]);
I["escapula-lateral--v2"] = () => escapulaLat("v2", [["Acromion o coracoides:", INK, 700], ["brazo hacia abajo, codo", INK], ["flexionado, palma afuera", INK]]);

// ======================= ACROMIOCLAVICULARES =======================
I["ac-pearson"] = () => {
  const f = E.figura("ac-pearson", { caja: [130, 30, 280, 290] });
  const y = f.p("yugular"), R = f.p("acromion_R"), L = f.p("acromion_L");
  const peso = (p) => `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(p[0])}" y2="${f1(p[1] + 16)}" stroke="${INK}" stroke-width="1.5"/>` +
    `<rect x="${f1(p[0] - 9)}" y="${f1(p[1] + 16)}" width="18" height="14" rx="2" fill="#7b8190"/>`;
  return svg(
    view("Vista desde el tubo · de pie, brazos a los costados") +
    riTop(f1(R[0] - 6 * f.ppc), f1(y[1] - 13 * f.ppc), f1(L[0] - R[0] + 12 * f.ppc), f1(22 * f.ppc)) + f.svg +
    coll(f1(R[0] - 3 * f.ppc), f1(y[1] - 7 * f.ppc), f1(L[0] - R[0] + 6 * f.ppc), f1(11 * f.ppc)) +
    bluePt(R) + bluePt(L) + crossP(y) + azul(R, 80, 60, "Acromioclavicular der.") + azul(L, 470, 60, "Acromioclavicular izq.") +
    peso(cm(f, f.p("grande_R"), 0, 2)) + note(...cm(f, f.p("grande_R"), 1.5, 4), 40, 300, ["Toma con pesos"]) +
    note(y[0] + 12, y[1] + 6, 470, 100, ["RC perpendicular, centrado", "en la escotadura yugular"], RED) +
    txt(16, 200, "RI 35 x 43", 11.5, INK) + txt(16, 214, "horizontal", 11.5, INK) +
    txt(470, 150, "Dos tomas bilaterales:", 12, INK, "start", 700) +
    txt(470, 166, "1) sin pesos; 2) con pesos de 3,6-4,5 kg", 11.5, INK) + txt(470, 180, "atados a las muñecas (2,25-3,6 kg en", 11.5, INK) + txt(470, 194, "pacientes chicos), hombros relajados", 11.5, INK) +
    txt(470, 214, "Marcadores «con pesos» y «sin pesos»", 11.5, INK) +
    txt(470, 238, "Campo horizontal, largo y estrecho", 11.5, AMB) +
    txt(470, 262, "DFRI 180 cm si es un solo RI bilateral", 11.5, MUTE) + txt(470, 276, "(si no, 100 cm) · apnea", 11.5, MUTE) +
    txt(470, 290, "Descartar fractura antes de los pesos", 11.5, MUTE)
  );
};

module.exports = I;
