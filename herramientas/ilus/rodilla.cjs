// Esquemas de pierna, rodilla, rótula y fosa intercondílea.
// Las figuras salen del modelo anatómico: herramientas/ilus3d/figuras/rodilla.py (render/<id>.webp).
// Supino o prono visto de costado: los pies a la derecha. Decúbito lateral visto desde el tubo: cara medial hacia el tubo,
// pies a la derecha. Las figuras pediátricas siguen dibujadas a mano (referencia-rodilla-anterior.cjs).
const E = require("./estilo.cjs");
const { RED, BLUE, AMB, INK, MUTE, BONEO, table, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, etiquetaHueso } = E;
const ANT = require("./referencia-rodilla-anterior.cjs");

// ---------- helpers ----------
const f1 = (n) => +(+n).toFixed(1);
const rad = (d) => (d * Math.PI) / 180;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const unit = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
const angulo = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const col = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");
const crossP = (p) => cross(f1(p[0]), f1(p[1]));
const redDot = (p, r = 4.5) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${RED}"/>`;
const lab = (p, tx, ty, t, anchor = "start") =>
  `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(anchor === "start" ? tx - 3 : tx + 3)}" y2="${f1(ty - 4)}" stroke="${BONEO}" stroke-width=".8"/>` + etiquetaHueso(f1(tx), f1(ty), t, anchor);
const linea = (a, b, color = BLUE, w = 1.4, dash = "5 4") => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const rayo = (a, b) => linea(a, b, RED, 1.4, "3 3");
const riBar = (x1, x2, y) => `<rect x="${f1(x1)}" y="${f1(y)}" width="${f1(x2 - x1)}" height="9" fill="${INK}"/>`;
const riV = (x, y1, y2) => `<rect x="${f1(x)}" y="${f1(y1)}" width="9" height="${f1(y2 - y1)}" fill="${INK}"/>`;
function arco(c, r, a1, a2, label, color = BLUE, lr = 16) {
  const p1 = [c[0] + r * Math.cos(rad(a1)), c[1] + r * Math.sin(rad(a1))], p2 = [c[0] + r * Math.cos(rad(a2)), c[1] + r * Math.sin(rad(a2))];
  const sweep = ((a2 - a1 + 360) % 360) < 180 ? 1 : 0, am = a1 + (((a2 - a1 + 540) % 360) - 180) / 2;
  const m = [c[0] + (r + lr) * Math.cos(rad(am)), c[1] + (r + lr) * Math.sin(rad(am)) + 4];
  return `<path d="M${f1(p1[0])},${f1(p1[1])} A${r},${r} 0 0 ${sweep} ${f1(p2[0])},${f1(p2[1])}" fill="none" stroke="${color}" stroke-width="1.8"/>` +
    (label ? txt(f1(m[0]), f1(m[1]), label, 12.5, color, "middle", 700) : "");
}
let nclip = 0;
function recorte(f, x, y, w, h) {
  const id = "rr" + ++nclip;
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${f.svg}</g>`;
}
// RI visto desde el tubo, recortado al área útil (lim = [x0, y0, x1, y1])
function riC(x, y, w, h, label = "", lim = [6, 30, 754, 326]) {
  const x0 = Math.max(lim[0], x), y0 = Math.max(lim[1], y), x1 = Math.min(lim[2], x + w), y1 = Math.min(lim[3], y + h);
  return riTop(f1(x0), f1(y0), f1(x1 - x0), f1(y1 - y0), label, f1(x0 + 6), f1(y0 + 16));
}
// borde superior de la piel en la x dada (para apuntar el tubo a la superficie)
const arriba = (f, x, d = 3) => f.rango(x - d, x + d)[0];
// punto a d cm del punto p en la dirección a → b
const haciaCm = (f, p, a, b, d) => add(p, unit(a, b), d * f.ppc);
const RC = (lineas) => lineas;
const piso = (x1, x2, y) => `<line x1="${f1(x1)}" y1="${f1(y)}" x2="${f1(x2)}" y2="${f1(y)}" stroke="#8a8f9c" stroke-width="2"/>`;
const bucky = (x, y1, y2) => `<rect x="${f1(x)}" y="${f1(y1)}" width="12" height="${f1(y2 - y1)}" fill="#cfd3dc"/>`;
const escalon = (x, y, w, h = 14) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${h}" rx="2" fill="#d7dbe3" stroke="#8a8f9c"/>`;

const I = {};

// ======================= PIERNA =======================
I["pierna-ap"] = () => {
  const f = E.figura("pierna-ap", { en: ["tobillo_R", 650, 196], ppc: 7.6 });
  const k = f.p("rodilla_R"), t = f.p("tobillo_R"), yMesa = f.abajo(k[0], t[0] + 20) + 1;
  const m = lerp(k, t, 0.5), top = [m[0], arriba(f, m[0])];
  const L = 43 * f.ppc;
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    table(0, 760, f1(yMesa + 9)) + riBar(m[0] - L / 2, m[0] + L / 2, yMesa) + txt(f1(m[0] - L / 2), f1(yMesa + 54), "RI 35 × 43 vert.", 11.5, INK) +
    recorte(f, 0, 30, 760, 300) +
    tube(top[0], top[1] - 2, 0, 120, { anodo: ["cátodo", "ánodo"] }) + rayo(top, [m[0], yMesa]) +
    note(top[0] - 50, 66, 420, 50, ["RC perpendicular al RI, en la", "parte media de la pierna"], RED, "end") +
    txt(420, 96, "DFRI mínima 100 cm (hasta 115-125 cm)", 11.5, MUTE, "end") +
    lab(f.p("centro:Right tibia"), f1(m[0] + 20), f1(yMesa + 58), "tibia", "start") +
    note(...f.p("cabeza_perone_R"), 170, 300, ["cabeza del peroné"], BONEO, "end") +
    note(...f.p("maleolo_lat_R"), 740, 300, ["maléolos"], BONEO, "end") +
    txt(f1(m[0] - L / 2), f1(yMesa + 36), "Incluir ≥3 cm más allá de rodilla y tobillo", 11.5, INK) +
    txt(16, 52, "Rodilla hacia el cátodo (efecto anódico)", 11.5, INK, "start", 700) +
    txt(16, 68, "Sin rotación de rodilla, pierna ni tobillo", 11.5, MUTE) + txt(16, 84, "Sin parrilla", 11.5, MUTE)
  );
};

I["pierna-mediolateral"] = () => {
  const f = E.figura("pierna-mediolateral", { en: ["tobillo_R", 640, 150], ppc: 7.2 });
  const k = f.p("rodilla_R"), t = f.p("tobillo_R"), m = lerp(k, t, 0.5);
  const L = 43 * f.ppc, A = 35 * f.ppc;
  return svg(
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    riC(m[0] - L / 2, m[1] - A / 2, L, A, "", [180, 30, 740, 290]) + f.svg +
    coll(f1(k[0] - 4 * f.ppc), f1(m[1] - 9 * f.ppc), f1(t[0] - k[0] + 8 * f.ppc), f1(18 * f.ppc)) + crossP(m) +
    note(m[0] + 6, m[1] + 10, 470, 310, ["RC ⟂ en la parte media de la pierna"], RED, "end") +
    note(...f.p("cabeza_perone_R"), 160, 250, ["cabeza del peroné"], BONEO, "end") +
    lab(f.p("centro:Right tibia"), f1(m[0] + 30), 72, "tibia", "start") +
    txt(16, 52, "Pie, tobillo y rodilla en lateral verdadera", 11.5, BLUE, "start", 700) +
    txt(16, 68, "Rodilla hacia el cátodo · sin parrilla", 11.5, MUTE) +
    txt(16, 84, "DFRI mínima 100 cm (hasta 115-125 cm)", 11.5, MUTE) +
    txt(16, 108, "RI 35 × 43 vert.", 11.5, INK, "start", 700) +
    txt(16, 132, "Colimar a los bordes de la piel,", 11, AMB) + txt(16, 146, "con rodilla y tobillo", 11, AMB) +
    txt(16, 178, "Rodilla y tobillo a 3-5 cm", 11, MUTE) + txt(16, 192, "de los extremos del RI", 11, MUTE) +
    txt(16, 216, "Pierna sana por detrás", 11, MUTE)
  );
};

// ======================= RODILLA =======================
// RC de la AP: 1,25 cm distal al vértice de la rótula, a la altura de la interlínea
const rcAP = (f) => { const v = f.p("vertice_rotula_R"), k = f.p("rodilla_R"); return [v[0] + 1.25 * f.ppc, k[1]]; };
I["rodilla-ap"] = () => {
  const f = E.figura("rodilla-ap", { en: ["rodilla_R", 300, 210], ppc: 6.5 });
  const X = rcAP(f), yMesa = f.abajo(f.x, f.x + f.w) + 1, top = [X[0], arriba(f, X[0])];
  const v = f.p("vertice_rotula_R");
  const alt = (a, lbl, anchor) => {
    const L = 100, dx = Math.sin(rad(a)), dy = Math.cos(rad(a));
    return rayo([top[0] - L * dx, top[1] - L * dy], top) + txt(f1(top[0] - 84 * dx + (a < 0 ? 8 : -8)), f1(top[1] - 84 * dy), lbl, 11, RED, anchor, 700);
  };
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") +
    table(0, 590, f1(yMesa + 9)) + riBar(X[0] - 12 * f.ppc, X[0] + 12 * f.ppc, yMesa) + txt(f1(X[0] + 12 * f.ppc + 6), f1(yMesa + 8), "RI 24 × 30 vert.", 11.5, INK) +
    recorte(f, 0, 30, 590, 300) +
    alt(-5, "3-5° cefálico", "start") + alt(5, "3-5° caudal", "end") +
    tube(top[0], top[1] - 2, 0, 110) + rayo(top, [X[0], yMesa]) + redDot(X, 3.5) + dot(v[0], v[1]) +
    note(top[0] + 4, 100, 440, 50, ["RC 1,25 cm distal al vértice", "de la rótula, paralelo a la", "meseta tibial"], RED) +
    note(v[0] - 4, v[1] - 2, 200, 120, ["vértice de la rótula"], BLUE, "end") +
    etiquetaHueso(f1(X[0] - 150), f1(X[1] + 4), "fémur", "middle") + etiquetaHueso(f1(X[0] + 130), f1(X[1] + 4), "tibia", "middle") +
    txt(16, 52, "← cabeza", 11, MUTE) +
    `<rect x="606" y="112" width="148" height="132" rx="6" fill="#f7f8fa" stroke="#d5d8e0"/>` +
    txt(614, 130, "EIAS → mesa", 11.5, INK, "start", 700) +
    txt(614, 152, "&lt; 19 cm", 11.5, INK) + txt(746, 152, "3-5° caudal", 11.5, RED, "end", 700) +
    txt(614, 172, "19-24 cm", 11.5, INK) + txt(746, 172, "0° (⟂ RI)", 11.5, RED, "end", 700) +
    txt(614, 192, "&gt; 24 cm", 11.5, INK) + txt(746, 192, "3-5° cefálico", 11.5, RED, "end", 700) +
    txt(614, 214, "cefálico = hacia", 10.5, MUTE) + txt(614, 228, "la cabeza", 10.5, MUTE) +
    txt(16, 300, "Pierna centrada en la mesa; si hace falta, rotarla", 11.5, MUTE) +
    txt(16, 316, "un poco hacia adentro (AP verdadera)", 11.5, MUTE) +
    txt(606, 290, "DFRI 100 cm · parrilla si el", 11.5, MUTE) + txt(606, 306, "grosor supera 10 cm", 11.5, MUTE)
  );
};

// lateral: panel 1 desde el tubo (decúbito lateral, cara medial hacia el tubo); panel 2 desde el costado de la mesa
function lateralTubo(id, caja) {
  const f = E.figura(id, { caja });
  const em = f.p("epicondilo_med_fem_R"), k = f.p("rodilla_R"), t = f.p("tobillo_R"), fe = f.p("centro:Right femur");
  const rc = haciaCm(f, em, k, t, 2.5);
  // flexión: prolongación del eje del fémur y eje de la pierna
  const eF = add(k, unit(fe, k), 60), eT = add(k, unit(k, t), 60);
  const flex = linea(k, eF) + linea(k, eT) + arco(k, 46, angulo(k, eF), angulo(k, eT), "");
  return { f, em, k, t, rc, flex };
}
I["rodilla-lateral"] = () => {
  const a = lateralTubo("rodilla-lateral", [10, 40, 370, 230]), f = a.f;
  const g = E.figura("rodilla-lateral-mesa", { caja: [410, 110, 340, 150] });
  const yM = g.abajo(g.x, g.x + g.w) + 1, em2 = g.p("epicondilo_med_fem_R");
  const rc2 = [em2[0] + 2.5 * g.ppc, em2[1]];
  const pat = f.p("centro:Right patella");
  return svg(
    view("1 · Vista desde el tubo · decúbito lateral") +
    riC(a.rc[0] - 12 * f.ppc, a.rc[1] - 15 * f.ppc, 24 * f.ppc, 30 * f.ppc, "", [10, 30, 380, 300]) + f.svg + a.flex +
    txt(f1(a.k[0] + 50), f1(a.k[1] - 44), "flexión 20-30°", 11.5, BLUE, "start", 700) +
    dot(a.em[0], a.em[1], BONEO) + crossP(a.rc) +
    note(a.em[0] - 4, a.em[1] - 4, 120, 70, ["epicóndilo medial"], BONEO, "end") +
    note(pat[0] - 2, pat[1] + 4, 150, 290, ["rótula"], BONEO, "end") +
    txt(16, 310, "RI 24 × 30 vert. · pierna sana por detrás", 11, MUTE) +
    `<line x1="398" y1="14" x2="398" y2="322" stroke="#e2e4ea"/>` +
    `<text x="410" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">2 · DESDE EL COSTADO DE LA MESA</text>` +
    table(404, 756, f1(yM + 9), "") + riBar(rc2[0] - 12 * g.ppc, rc2[0] + 12 * g.ppc, yM) + recorte(g, 404, 30, 352, 300) +
    dot(em2[0], em2[1], BONEO) + txt(f1(em2[0] - 8), f1(em2[1] - 10), "epicóndilo medial", 10.5, BONEO, "end") +
    tube(rc2[0], rc2[1] - 2, -6, 90, { angLabel: "\u200b" }) + txt(f1(rc2[0] + 14), f1(rc2[1] - 34), "5-7°", 12.5, RED, "start", 700) +
    note(rc2[0] + 4, rc2[1] - 50, 744, 44, ["RC 5-7° cefálico,", "2,5 cm distal al", "epicóndilo medial"], RED, "end") +
    txt(410, 290, "← cabeza", 11, MUTE) + txt(750, 290, "pie →", 11, MUTE, "end") +
    txt(410, 314, "DFRI 100 cm · parrilla si el grosor supera 10 cm", 11, MUTE)
  );
};

I["fosa-rotula-lateral-rotula"] = () => {
  const a = lateralTubo("fosa-rotula-lateral-rotula", [20, 40, 430, 250]), f = a.f;
  const pat = f.p("centro:Right patella"), fp = lerp(pat, a.k, 0.3);
  return svg(
    view("Vista desde el tubo · decúbito lateral sobre el lado afectado") +
    riC(fp[0] - 9 * f.ppc, fp[1] - 12 * f.ppc, 18 * f.ppc, 24 * f.ppc, "", [20, 30, 450, 300]) + f.svg +
    coll(f1(fp[0] - 7 * f.ppc), f1(fp[1] - 9 * f.ppc), f1(14 * f.ppc), f1(16 * f.ppc)) + a.flex +
    crossP(fp) + txt(480, 130, "Flexión de solo 5-10°", 11.5, BLUE, "start", 700) +
    note(fp[0] + 8, fp[1] + 4, 480, 64, ["RC perpendicular al RI, en la", "parte media del espacio", "articular femororrotuliano"], RED) +
    note(pat[0] - 2, pat[1] + 6, 120, 290, ["rótula"], BONEO, "end") +
    txt(480, 150, "No flexionar más: puede", 11.5, MUTE) + txt(480, 166, "separar fragmentos si hay fractura", 11.5, MUTE) +
    txt(480, 200, "RI 18 × 24 vert. · DFRI 100 cm", 11.5, MUTE) + txt(480, 216, "Sin parrilla (con parrilla en", 11.5, MUTE) + txt(480, 232, "pacientes de contextura grande)", 11.5, MUTE) +
    txt(480, 270, "Pierna sana hacia atrás", 11, MUTE)
  );
};

// ---------- de pie ----------
// punto de la interlínea: 1,25 cm por debajo del vértice de la rótula, a la altura del centro de la rodilla
const interlinea = (f) => { const v = f.p("vertice_rotula_R"), k = f.p("rodilla_R"); return [k[0], v[1] + 1.25 * f.ppc]; };
const flexion = (f, label) => {
  const k = f.p("rodilla_R"), fe = f.p("centro:Right femur"), tb = f.p("centro:Right tibia");
  const eF = add(k, unit(fe, k), 70), eT = add(k, unit(k, tb), 70);
  return linea(k, eF) + arco(k, 50, angulo(k, eF), angulo(k, eT), label, BLUE, 20);
};
I["rodilla-pa-axial-bilateral-rosenberg"] = () => {
  const f = E.figura("rodilla-pa-axial-bilateral-rosenberg", { caja: [150, 30, 200, 270] });
  const j = interlinea(f), yP = f.abajo(f.x, f.x + f.w) + 1, xB = f.x + f.w + 10;
  return svg(
    view("Vista lateral · de pie, de frente al bucky (PA)") +
    piso(60, 600, yP) + bucky(xB, 34, yP - 30) + riV(xB - 6, j[1] - 17 * f.ppc, j[1] + 17 * f.ppc) +
    f.svg + flexion(f, "45°") +
    beam(j[0], j[1], 10, 190, { ref: 0, angLabel: "10°" }) + redDot(j, 3.5) +
    note(...add(j, [-Math.cos(rad(10)), -Math.sin(rad(10))], 110), 420, 70, ["RC 10° caudal (hacia los pies)", "a la mitad de las articulaciones,", "1,25 cm por debajo del", "vértice de la rótula"], RED) +
    txt(f1(xB + 18), f1(j[1] + 17 * f.ppc + 14), "RI 35 × 43 horiz.", 11, INK) +
    note(...f.p("centro:Right patella"), 420, 180, ["rótula (contra el bucky)"], BONEO) +
    txt(420, 220, "Rodillas flexionadas 45°, rótulas", 11.5, BLUE, "start", 700) + txt(420, 236, "apoyadas en el bucky", 11.5, BLUE) +
    txt(420, 276, "Peso repartido por igual entre los dos pies", 11.5, MUTE) +
    txt(420, 292, "DFRI 100 cm · parrilla", 11.5, MUTE)
  );
};

I["rodilla-ap-pa-bilateral-carga--v1"] = () => {
  const f = E.figura("rodilla-ap-pa-bilateral-carga--v1", { caja: [130, 40, 200, 248] });
  const j = interlinea(f), yP = f.abajo(f.x, f.x + f.w) + 1, xB = f.x - 30;
  return svg(
    view("AP · vista lateral, de pie") +
    escalon(xB - 10, yP, 230) + txt(f1(xB - 10), f1(yP + 30), "escalón, si hace falta", 11, MUTE) +
    bucky(xB, 34, yP) + riV(xB + 12, j[1] - 17 * f.ppc, j[1] + 17 * f.ppc) +
    f.svg + beam(j[0], j[1], 180, 170, { ref: 180 }) + redDot(j, 3.5) + rayo(j, [xB + 20, j[1]]) +
    txt(f1(xB - 6), f1(j[1] - 6), "RI 35 × 43", 11, INK, "end") + txt(f1(xB - 6), f1(j[1] + 8), "horiz.", 11, INK, "end") +
    note(j[0] + 120, j[1] - 26, 430, 60, ["RC horizontal, ⟂ al RI (contextura", "media), en el punto medio entre las", "rodillas, 1,25 cm distal al vértice", "de las rótulas"], RED) +
    col(430, 150, [["De pie, de espaldas al bucky, subido a un", INK, 700], ["escalón si hace falta para usar un rayo", INK, 700], ["horizontal", INK, 700]]) +
    col(430, 210, [["Pies rectos hacia adelante, rodillas", INK], ["extendidas, peso repartido por igual", INK], ["Se sostiene de los agarraderos de la mesa", INK]]) +
    col(430, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};
I["rodilla-ap-pa-bilateral-carga--v2"] = () => {
  const f = E.figura("rodilla-ap-pa-bilateral-carga--v2", { caja: [120, 40, 200, 258] });
  const j = interlinea(f), yP = f.abajo(f.x, f.x + f.w) + 1, xB = f.x + f.w + 8;
  return svg(
    view("PA (alternativa) · de frente al bucky") +
    piso(30, 400, yP) + bucky(xB, 34, yP - 30) + riV(xB - 6, j[1] - 17 * f.ppc, j[1] + 17 * f.ppc) +
    f.svg + flexion(f, "20°") + beam(j[0], j[1], 10, 190, { ref: 0, angLabel: "10°" }) + redDot(j, 3.5) +
    txt(f1(xB + 18), f1(j[1] + 17 * f.ppc), "RI 35 × 43 horiz.", 11, INK) +
    note(...add(j, [-Math.cos(rad(10)), -Math.sin(rad(10))], 110), 470, 60, ["RC 10° caudal, en el punto medio", "entre las rodillas, 1,25 cm distal", "al vértice de las rótulas"], RED) +
    col(470, 140, [["Mira hacia la mesa o el soporte", INK, 700], ["del RI, con las rodillas apoyadas", INK, 700], ["en él y flexionadas unos 20°", INK, 700]]) +
    col(470, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};

// ======================= RÓTULA Y FOSA INTERCONDÍLEA =======================
// decúbito prono visto de costado (desde medial): la mesa abajo, la cara anterior hacia la mesa, los pies a la derecha
function prono(id, opts) {
  const f = E.figura(id, opts);
  const yMesa = f.abajo(f.x, f.x + f.w) + 1;
  return { f, yMesa, k: f.p("rodilla_R"), pat: f.p("centro:Right patella") };
}
I["fosa-rotula-pa-rotula"] = () => {
  const { f, yMesa, pat } = prono("fosa-rotula-pa-rotula", { en: ["rodilla_R", 240, 170], ppc: 6.2 });
  const top = [pat[0], arriba(f, pat[0])];
  return svg(
    view("Vista lateral · decúbito prono, pierna extendida") +
    table(0, 700, f1(yMesa + 9)) + riBar(pat[0] - 12 * f.ppc, pat[0] + 12 * f.ppc, yMesa) + txt(f1(pat[0] + 12 * f.ppc + 6), f1(yMesa + 8), "RI 18 × 24 vert.", 11.5, INK) +
    recorte(f, 0, 30, 760, 300) +
    tube(top[0], top[1] - 2, 0, 80) + rayo(top, pat) + redDot(pat, 3.5) +
    note(top[0] + 4, 80, 400, 52, ["RC perpendicular al RI, en el centro", "de la rótula (a la altura del", "pliegue poplíteo medio)"], RED) +
    note(pat[0] - 4, pat[1] + 2, 150, f1(yMesa + 40), ["rótula (hacia la mesa)"], BONEO, "end") +
    txt(16, 52, "← cabeza", 11, MUTE) +
    txt(16, 84, "Rotar la cara anterior de la rodilla", 11.5, INK) + txt(16, 100, "~5° hacia adentro: línea entre", 11.5, INK) + txt(16, 116, "epicóndilos paralela al RI", 11.5, INK) +
    txt(400, 112, "Si duele, almohadilla bajo muslo y", 11.5, MUTE) + txt(400, 128, "pierna para que la rótula no apoye", 11.5, MUTE) +
    txt(560, 316, "DFRI 100 cm · parrilla", 11.5, MUTE)
  );
};

// ---- Oblicuas: corte a la altura de la rótula visto desde los pies; punteado: rodilla sin rotar ----
function oblicua(v, interna) {
  const id = "rodilla-ap-oblicuas--" + v, cx = 200, yRI = 262, ppc = 7.2;
  const c = E.corte(id, { en: ["apoyo", cx, yRI - 1], ppc });
  const g0 = E.corte("rodilla-corte-neutra", { en: ["apoyo", cx, yRI - 1], ppc });
  const fc = c.hueso("Right femur"), fg = g0.hueso("Right femur"), pc = c.hueso("Right patella");
  const fant = `<g transform="translate(${f1(fc[0] - fg[0])} ${f1(fc[1] - fg[1])})" opacity=".3">${g0.svg}</g>`;
  const ant = add(fc, unit(fc, pc), 95), a = angulo(fc, pc);
  return svg(
    view(interna ? "Oblicua medial (interna) · desde los pies" : "Oblicua lateral (externa) · desde los pies") +
    table(30, 370, yRI + 9, "") + riBar(cx - 80, cx + 80, yRI) + fant + c.svg +
    refline(f1(fc[0]), f1(fc[1]), f1(fc[0]), f1(fc[1] - 95)) + linea(fc, ant, BLUE, 2.2, "") + arco(fc, 70, -90, a, "45°", BLUE, 14) +
    tube(fc[0], c.caja[1] - 4, 0, 90) + rayo([fc[0], c.caja[1]], [fc[0], yRI]) + redDot(fc, 3.5) +
    txt(f1(c.caja[0] - 8), f1(fc[1] + 4), "lateral", 11, MUTE, "end") + txt(f1(c.caja[0] + c.caja[2] + 8), f1(fc[1] + 4), "medial", 11, MUTE) +
    txt(30, 290, interna ? "Rotación interna 45°" : "Rotación externa 45°", 12, INK, "start", 700) +
    txt(30, 306, "rodilla, tobillo y pie giran juntos", 11.5, MUTE) +
    note(fc[0] + 2, c.caja[1] - 50, 430, 60, ["RC perpendicular al RI, 1,25 cm", "por debajo de la rótula (mitad", "del espacio articular)"], RED) +
    col(430, 130, [[`Rotar 45° hacia ${interna ? "adentro" : "afuera"} toda la`, INK, 700, 12.5], [interna ? "extremidad (rodilla, tobillo y pie)" : "extremidad", INK, 700, 12.5]]) +
    col(430, 180, [["Semidecúbito supino, pierna extendida", INK], ["y centrada en el RC y en la línea", INK], ["media de la mesa", INK]]) +
    col(430, 240, [[interna ? "Muestra la cabeza y el cuello del peroné" : "Muestra los cóndilos mediales del", MUTE, 400, 11], [interna ? "sin superposición" : "fémur y la tibia de perfil", MUTE, 400, 11]]) +
    col(430, 290, [["RI 24 × 30 vert. · DFRI 100 cm", MUTE, 400, 11], ["Parrilla si el grosor supera 10 cm", MUTE, 400, 11]]) +
    txt(12, 40, "Rodilla derecha, vista desde los pies", 11, MUTE) +
    txt(12, 324, "claro: rodilla sin rotar · línea azul: hacia la rótula", 10.5, MUTE)
  );
}
I["rodilla-ap-oblicuas--v1"] = () => oblicua("v1", true);
I["rodilla-ap-oblicuas--v2"] = () => oblicua("v2", false);

// ---- Fosa intercondílea: Camp Coventry / Holmblad ----
I["fosa-rotula-tunel--v1"] = () => {
  const { f, yMesa, k } = prono("fosa-rotula-tunel--v1", { en: ["rodilla_R", 140, 250], ppc: 5 });
  const t = f.p("tobillo_R"), ap = f.p("talon_R");
  const rcT = arriba(f, k[0] + 1.5 * f.ppc, 2), e = [k[0] + 1.5 * f.ppc, rcT];
  const dirP = angulo(k, t);                                                // eje de la pierna (hacia arriba y a la derecha)
  const bd = dirP + 90;                                                     // RC ⟂ a la pierna, entrando por detrás
  const ax = add(k, [1, 0], 70);
  return svg(
    view("Camp Coventry · decúbito prono") +
    table(0, 400, f1(yMesa + 9), "") + riBar(k[0] - 9 * f.ppc, k[0] + 9 * f.ppc, yMesa) + txt(f1(k[0] + 9 * f.ppc + 6), f1(yMesa + 8), "RI 18 × 24", 11, INK) +
    `<rect x="${f1(t[0] - 26)}" y="${f1(f.rango(t[0] - 2, t[0] + 2)[1] - 4)}" width="52" height="${f1(yMesa - f.rango(t[0] - 2, t[0] + 2)[1] + 4)}" rx="4" fill="#d7dbe3" stroke="#8a8f9c"/>` +
    recorte(f, 0, 30, 400, 300) +
    txt(300, f1(yMesa + 30), "apoyo grande bajo el tobillo", 11.5, INK, "middle") +
    linea(k, ax) + linea(k, add(k, unit(k, t), 70)) + arco(k, 46, 0, dirP, "") +
    txt(f1(k[0] + 74), f1(k[1] + 4), "flexión 40-50°", 11.5, BLUE, "start", 700) +
    beam(k[0], k[1], bd, 150, { ref: 90, angLabel: "40-50°" }) + redDot(k, 3.5) +
    txt(16, 44, "← cabeza", 11, MUTE) +
    col(440, 70, [["RC 40-50° caudal (⟂ a la pierna),", RED, 700, 12], ["centrado en la rodilla; sale por el", INK], ["borde distal de la rótula", INK]]) +
    col(440, 140, [["Decúbito prono, rodilla flexionada", INK, 700], ["40-50°, con un apoyo grande", INK, 700], ["debajo del tobillo", INK, 700]]) +
    col(440, 200, [["Rodilla centrada en el RC; RI centrado", INK], ["en el RC proyectado", INK]]) +
    col(440, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};
// Holmblad: arrodillado sobre la mesa, la pierna apoyada y el muslo inclinado hacia adelante; vista de costado (pies a la izquierda)
I["fosa-rotula-tunel--v2"] = () => {
  const f = E.figura("fosa-rotula-tunel--v2", { caja: [20, 40, 380, 210] });
  const k = f.p("rodilla_R"), fe = f.p("centro:Right femur"), yMesa = f.abajo(f.x, f.x + f.w) + 1;
  const vert = [k[0], k[1] - 110];
  return svg(
    view("Holmblad · arrodillado") +
    table(0, 420, f1(yMesa + 9), "") + riBar(k[0] - 9 * f.ppc, k[0] + 9 * f.ppc, yMesa) + txt(f1(k[0] - 9 * f.ppc - 6), f1(yMesa + 8), "RI 18 × 24", 11, INK, "end") +
    f.svg + refline(f1(k[0]), f1(k[1]), f1(vert[0]), f1(vert[1])) + linea(k, add(k, unit(k, fe), 110), BLUE, 2.2, "") +
    arco(k, 80, -90, angulo(k, fe), "20-30°", BLUE, 18) +
    tube(k[0], k[1] - 4, 0, 150) + redDot(k, 3.5) +
    note(k[0] + 6, 80, 440, 70, ["RC ⟂ a la pierna, en el", "pliegue poplíteo medio"], RED) +
    col(440, 140, [["Arrodillado sobre la mesa o", INK, 700], ["parcialmente de pie", INK, 700], ["Muslo inclinado hacia", INK], ["adelante 20-30°", INK]]) +
    col(440, 220, [["Rodilla centrada en el RC; RI centrado", INK], ["en el RC proyectado", INK]]) +
    col(440, 300, [["DFRI 100 cm · parrilla", MUTE, 400, 11]])
  );
};

// ---- Axial tangencial de rótula: Settegast / Hughston ----
const settTxt = (y) => col(440, y, [["El paciente sostiene la pierna con una", MUTE, 400, 11], ["gasa larga o cinta · DFRI 100-120 cm", MUTE, 400, 11]]);
function axialRotula(id, opts, grados, flexTxt) {
  const { f, yMesa, k, pat } = prono(id, opts);
  const t = f.p("tobillo_R"), dirP = angulo(k, t);
  // RC: entra por la mitad del espacio femororrotuliano, cefálico respecto del eje de la pierna
  const fp = lerp(pat, k, 0.35);
  const bd = dirP + 180 + grados;                                            // desde los pies, inclinado hacia la cabeza
  const ax = add(k, [1, 0], 64);
  return { f, yMesa, k, t, fp, svg:
    table(0, 420, f1(yMesa + 9), "") + riBar(fp[0] - 16 - 9 * f.ppc, fp[0] - 16 + 9 * f.ppc, yMesa) +
    recorte(f, 0, 30, 420, 300) +
    linea(k, ax) + arco(k, 40, dirP, 0, flexTxt, BLUE, 16) +
    linea(fp, add(fp, unit(k, t), 150), MUTE, 1, "4 4") +
    beam(fp[0], fp[1], bd, 190, { ref: dirP + 180, angLabel: grados + "°" }) + redDot(fp, 3.5) +
    txt(16, 44, "← cabeza", 11, MUTE) };
}
I["fosa-rotula-axial-settegast-hughston--v1"] = () => {
  const a = axialRotula("fosa-rotula-axial-settegast-hughston--v1", { en: ["rodilla_R", 170, 236], ppc: 6.4 }, 17.5, "90°");
  return svg(
    view("Settegast · decúbito prono") + a.svg.replace(">17.5°<", ">15-20°<") +
    col(440, 70, [["RC 15-20° cefálico respecto del eje", RED, 700, 12], ["longitudinal de la pierna, en la", INK], ["mitad del espacio femororrotuliano", INK]]) +
    col(440, 140, [["Decúbito prono, rodilla", INK, 700, 12.5], ["flexionada 90°", INK, 700, 12.5]]) +
    txt(440, 190, "RI apoyado en la mesa, bajo la rodilla", 11.5, INK) +
    settTxt(290)
  );
};
I["fosa-rotula-axial-settegast-hughston--v2"] = () => {
  const a = axialRotula("fosa-rotula-axial-settegast-hughston--v2", { en: ["rodilla_R", 130, 236], ppc: 6.4 }, 45, "50-60°");
  return svg(
    view("Hughston · decúbito prono") + a.svg +
    col(440, 70, [["RC 45° cefálico respecto del eje", RED, 700, 12], ["longitudinal de la pierna, en la", INK], ["mitad del espacio femororrotuliano", INK]]) +
    col(440, 140, [["Decúbito prono, rodilla flexionada", INK, 700, 12.5], ["50-60° desde la extensión completa", INK, 700, 12.5]]) +
    col(440, 190, [["El pie puede apoyarse en un soporte", INK], ["que no sea el colimador", INK]]) +
    settTxt(290)
  );
};

// ---- Hobbs: sentado, pies debajo de la silla; RI sobre un banquito bajo las rodillas ----
I["fosa-rotula-tangencial-hobbs"] = () => {
  const f = E.figura("fosa-rotula-tangencial-hobbs", { caja: [120, 30, 200, 290] });
  const k = f.p("rodilla_R"), pat = f.p("centro:Right patella"), hip = f.p("cabeza_femur_R");
  const yP = f.abajo(f.x, f.x + f.w) + 1;
  const ySilla = f.abajo(hip[0] - 4, hip[0] + 4) + 1;
  const tg = [pat[0] + 0.8 * f.ppc, arriba(f, pat[0] + 0.8 * f.ppc, 1)];      // tangente al frente de la rótula
  const yRI = k[1] + 12 * f.ppc, xRI = tg[0];
  const silla = `<rect x="${f1(hip[0] - 50)}" y="${f1(ySilla)}" width="110" height="8" fill="#cfd3dc"/>` +
    `<rect x="${f1(hip[0] - 46)}" y="${f1(ySilla + 8)}" width="7" height="${f1(yP - ySilla - 8)}" fill="#cfd3dc"/>` +
    `<rect x="${f1(hip[0] + 50)}" y="${f1(ySilla + 8)}" width="7" height="${f1(yP - ySilla - 8)}" fill="#cfd3dc"/>`;
  return svg(
    view("Vista lateral · sentado, pies debajo de la silla") +
    piso(60, 600, yP) + silla +
    `<rect x="${f1(xRI - 30)}" y="${f1(yRI + 9)}" width="70" height="${f1(yP - yRI - 9)}" rx="4" fill="#d7dbe3" stroke="#8a8f9c"/>` + riBar(xRI - 36, xRI + 46, yRI) +
    f.svg + tube(tg[0], tg[1] - 2, 0, 110) + rayo(tg, [tg[0], yRI]) + redDot(tg, 3.5) +
    txt(f1(xRI + 48), f1(yP - 12), "banquito", 11, MUTE) +
    note(tg[0] + 4, 80, 450, 52, ["RC perpendicular al RI, tangencial", "a la articulación femororrotuliana,", "a mitad de camino entre ambas"], RED) +
    note(xRI + 46, yRI + 4, 500, 200, ["RI 35 × 43 horiz.", "(18 × 24 si es unilateral)"], INK) +
    note(pat[0] + 2, pat[1] - 2, 450, 150, ["rótula"], BONEO) +
    txt(500, 260, "DFRI 120-130 cm", 11.5, MUTE) + txt(500, 276, "Sin parrilla", 11.5, MUTE)
  );
};

// ======================= PEDIÁTRICA (dibujada a mano, pendiente) =======================
for (const id of ["ped-ext-inf-ap", "ped-ext-inf-lateral", "ped-pie-ap-mediolateral-kite--v1", "ped-pie-ap-mediolateral-kite--v2"]) I[id] = ANT[id];

module.exports = I;
