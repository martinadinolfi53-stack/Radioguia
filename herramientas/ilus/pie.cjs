// Esquemas de tobillo, pie, calcáneo y dedos del pie.
// Las figuras salen del modelo anatómico: herramientas/ilus3d/figuras/pie.py (render/<id>.webp).
// Decúbito supino visto de costado: la mesa abajo y el tubo arriba. "Desde los pies": el paciente acostado visto desde el extremo
// de la mesa (planta hacia el que mira, talón sobre el RI); el lado medial del pie derecho queda a la derecha del dibujo.
const E = require("./estilo.cjs");
const { RED, BLUE, AMB, INK, MUTE, BONEO, table, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, etiquetaHueso } = E;

// ---------- helpers ----------
const f1 = (n) => +(+n).toFixed(1);
const rad = (d) => (d * Math.PI) / 180;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const lab = (px, py, tx, ty, t, anchor = "start") =>
  `<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(anchor === "start" ? tx - 3 : tx + 3)}" y2="${f1(ty - 4)}" stroke="${BONEO}" stroke-width=".8"/>` + etiquetaHueso(f1(tx), f1(ty), t, anchor);
const panelSep = (x, title) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>` +
  `<text x="${x + 14}" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;
const col = (x, y, filas) => filas.map(([t, c = INK, w = 400, size = 11.5], i) => txt(x, y + i * 15, t, size, c, "start", w)).join("");
const crossP = (p) => cross(f1(p[0]), f1(p[1]));
const redDot = (p, r = 4.5) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${RED}"/>`;
const ringR = (p, r) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(r)}" fill="none" stroke="${RED}" stroke-width="2"/>`;
const angulo = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
function arco(c, r, a1, a2, label, color = BLUE, lr = 16) {
  const p1 = [c[0] + r * Math.cos(rad(a1)), c[1] + r * Math.sin(rad(a1))], p2 = [c[0] + r * Math.cos(rad(a2)), c[1] + r * Math.sin(rad(a2))];
  const sweep = ((a2 - a1 + 360) % 360) < 180 ? 1 : 0, am = a1 + (((a2 - a1 + 540) % 360) - 180) / 2;
  const m = [c[0] + (r + lr) * Math.cos(rad(am)), c[1] + (r + lr) * Math.sin(rad(am)) + 4];
  return `<path d="M${f1(p1[0])},${f1(p1[1])} A${r},${r} 0 0 ${sweep} ${f1(p2[0])},${f1(p2[1])}" fill="none" stroke="${color}" stroke-width="1.8"/>` +
    (label ? txt(f1(m[0]), f1(m[1]), label, 13, color, "middle", 700) : "");
}
const linea = (a, b, color = BLUE, w = 2.2) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${color}" stroke-width="${w}"/>`;
const riBar = (x1, x2, y) => `<rect x="${f1(x1)}" y="${f1(y)}" width="${f1(x2 - x1)}" height="9" fill="${INK}"/>`;
const cm = (f, p, dx, dy) => [f1(p[0] + dx * f.ppc), f1(p[1] + dy * f.ppc)];
// figura recortada a un rectángulo (las piernas largas salen del panel)
let nclip = 0;
function recorte(f, x, y, w, h) {
  const id = "rc" + ++nclip;
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${f.svg}</g>`;
}
// punto de la piel más bajo (apoyo sobre la mesa o el RI) cerca de la x dada
const apoyo = (f, x, d = 6) => f.abajo(x - d, x + d);

const I = {};

// ======================= TOBILLO =======================
// panel izquierdo común: decúbito supino, pierna extendida, vista de costado; RC perpendicular entre los maléolos
function tobilloCostado(id, riTxt = "RI 24 × 30 vert.") {
  const f = E.figura(id, { en: ["tobillo_R", 430, 196], ppc: 3.6 });
  const t = f.p("tobillo_R"), yMesa = apoyo(f, t[0]) + 1;
  const ta = f.p("talon_R");
  return { f, t, svg: table(0, 548, f1(yMesa + 9), "") + riBar(t[0] - 60, t[0] + 60, yMesa) + txt(f1(t[0] - 60), f1(yMesa + 38), riTxt, 11.5, INK) +
    recorte(f, 0, 30, 548, 300) + redDot(t) +
    tube(t[0], t[1] - 8, 0, 150) +
    note(t[0], 100, 330, 60, ["RC perpendicular al RI,", "a mitad de camino entre", "los maléolos · DFRI 100 cm"], RED, "end") +
    lab(...f.p("centro:Right tibia"), 160, 150, "tibia", "middle") + lab(...ta, f1(ta[0] - 30), f1(yMesa - 22), "talón", "end") };
}
const PX = 560; // inicio del panel derecho
// panel derecho: desde los pies, con la línea intermaleolar
function desdePies(id) {
  const f = E.figura(id, { caja: [PX + 20, 30, 170, 208] });
  const yRI = apoyo(f, f.p("talon_R")[0], 30) + 1;
  const mm = f.p("maleolo_med_R"), ml = f.p("maleolo_lat_R");
  return { f, mm, ml, yRI, svg: panelSep(PX, "Desde los pies") + `<rect x="${PX + 20}" y="${f1(yRI)}" width="170" height="9" fill="${INK}"/>` + f.svg +
    linea(mm, ml) + dot(mm[0], mm[1]) + dot(ml[0], ml[1]) + txt(PX + 190, f1(yRI - 6), "medial", 10, MUTE, "end") + txt(PX + 22, f1(yRI - 6), "lateral", 10, MUTE) };
}

I["tobillo-ap"] = () => {
  const c = tobilloCostado("tobillo-ap"), p = desdePies("tobillo-ap-pies");
  const ta = p.f.p("talon_R"), m1 = p.f.p("cabeza_mt1_R"), m5 = p.f.p("base_mt5_R");
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") + c.svg + p.svg +
    refline(f1(ta[0]), 40, f1(ta[0]), f1(p.yRI - 2)) +
    txt(PX + 14, 270, "Sin rotación: eje del pie", 11.5, BLUE, "start", 700) +
    txt(PX + 14, 286, "vertical, paralelo al RC", 11.5, BLUE) +
    txt(PX + 14, 304, "Pierna paralela al borde del RI", 11, MUTE)
  );
};

I["tobillo-ap-mortaja"] = () => {
  const c = tobilloCostado("tobillo-ap-mortaja"), p = desdePies("tobillo-ap-mortaja-pies");
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") + c.svg + p.svg +
    refline(PX + 24, f1(p.mm[1]), PX + 186, f1(p.mm[1])) +
    txt(PX + 14, 270, "Pierna y pie rotados 15-20° hacia", 11.5, BLUE, "start", 700) +
    txt(PX + 14, 286, "medial: línea intermaleolar (azul)", 11.5, BLUE) +
    txt(PX + 14, 302, "paralela al tablero", 11.5, BLUE)
  );
};

I["tobillo-ap-oblicua-45"] = () => {
  const c = tobilloCostado("tobillo-ap-oblicua-45"), p = desdePies("tobillo-ap-oblicua-45-pies");
  const [a, b] = p.mm[0] < p.ml[0] ? [p.mm, p.ml] : [p.ml, p.mm];
  return svg(
    view("Vista lateral · decúbito supino, pierna extendida") + c.svg + p.svg +
    refline(PX + 24, f1(p.ml[1]), PX + 186, f1(p.ml[1])) + arco(p.ml, 40, 0, angulo(p.ml, p.mm), "45°") +
    txt(PX + 14, 270, "Pierna y pie rotados 45°", 11.5, BLUE, "start", 700) +
    txt(PX + 14, 286, "hacia medial (línea", 11.5, BLUE) + txt(PX + 14, 302, "intermaleolar a 45° del RI)", 11.5, BLUE)
  );
};

// decúbito sobre el lado afectado: cara lateral contra el RI; vista desde el tubo = desde medial (dedos a la izquierda)
I["tobillo-lateral"] = () => {
  const f = E.figura("tobillo-lateral", { caja: [70, 30, 300, 290] });
  const mm = f.p("maleolo_med_R"), ta = f.p("talon_R"), as = f.p("centro:Right talus");
  return svg(
    view("Vista desde el tubo · decúbito sobre el lado afectado") +
    riTop(f1(mm[0] - 15 * 0 - 12 * f.ppc), f1(mm[1] - 15 * f.ppc), f1(24 * f.ppc), f1(30 * f.ppc), "RI 24 × 30 vert.", f1(mm[0] - 12 * f.ppc + 6), f1(mm[1] + 15 * f.ppc - 6)) +
    f.svg + coll(f1(mm[0] - 10 * f.ppc), f1(mm[1] - 11 * f.ppc), f1(19 * f.ppc), f1(17 * f.ppc)) + crossP(mm) +
    note(mm[0] + 12, mm[1] + 4, 470, 226, ["RC perpendicular,", "centrado en el maléolo medial"], RED) +
    note(...f.p("cabeza_mt1_R"), 470, 96, ["Flexión dorsal del pie", "a 90° con la pierna (si tolera)"], BLUE) +
    note(...as, 470, 160, ["astrágalo"], INK) + note(...ta, 470, 280, ["calcáneo"], INK) +
    lab(...f.p("centro:Right tibia"), 40, 80, "tibia", "start") +
    txt(16, 306, "Rodilla algo flexionada · pie y tobillo en lateral verdadera · DFRI 100 cm", 11, MUTE) +
    txt(470, 316, "Colimar: tibia y peroné distales + MT proximales", 11, AMB)
  );
};

// AP con sobrecarga: vista desde el tubo, pie hacia abajo del dibujo
function estres(v, nombre, sentido) {
  const id = "tobillo-ap-estres--" + v;
  const f = E.figura(id, { caja: [90, 30, 260, 288] });
  const t = f.p("tobillo_R");
  return svg(
    view(`${nombre} · vista desde el tubo`) +
    riTop(f1(t[0] - 12 * f.ppc), f1(t[1] - 18 * f.ppc), f1(24 * f.ppc), f1(30 * f.ppc), "RI", f1(t[0] - 12 * f.ppc + 6), f1(t[1] - 18 * f.ppc + 16)) +
    f.svg + crossP(t) +
    txt(20, 300, "← lateral", 10.5, MUTE) + txt(420, 300, "medial →", 10.5, MUTE, "end") +
    note(t[0] + 12, t[1], 430, 60, ["RC perpendicular al RI, a mitad", "de camino entre los maléolos"], RED) +
    col(430, 120, [["Decúbito supino o sentado,", INK, 700], ["pierna extendida, sin rotar la", INK, 700], ["pierna ni el tobillo (AP verdadera)", INK, 700]]) +
    col(430, 180, [[`Forzar el tobillo girando la planta`, INK], [sentido, INK]]) +
    col(430, 226, [["Sobrecarga con mucho cuidado: gasa larga", MUTE, 400, 11], ["que sostiene el paciente, o a mano por", MUTE, 400, 11], ["personal capacitado con guantes y delantal", MUTE, 400, 11], ["plomados", MUTE, 400, 11]]) +
    col(430, 300, [["RI 24 × 30 vert. o 35 × 43 · DFRI 100 cm", MUTE, 400, 11]])
  );
}
I["tobillo-ap-estres--v1"] = () => estres("v1", "Inversión", "hacia adentro (inversión)");
I["tobillo-ap-estres--v2"] = () => estres("v2", "Eversión", "hacia afuera (eversión)");

// ======================= PIE =======================
// decúbito supino con la rodilla flexionada y la planta apoyada en el RI, visto de costado (dedos a la derecha)
I["pie-ap-dorsoplantar"] = () => {
  const f = E.figura("pie-ap-dorsoplantar", { caja: [240, 30, 500, 236] });
  const b3 = f.p("base_mt3_R"), yRI = apoyo(f, b3[0], 60) + 1;
  const ta = f.p("talon_R");
  return svg(
    view("Vista lateral · rodilla flexionada, planta apoyada en el RI") +
    table(0, 760, f1(yRI + 10)) + riBar(ta[0] - 30, f.p("punta_dedo1_pie_R")[0] + 24, yRI) + txt(f1(ta[0] - 30), f1(yRI + 36), "RI 24 × 30 vert.", 11.5, INK) +
    f.svg + redDot(b3) +
    tube(b3[0], b3[1] - 4, -10, 190, { angLabel: "10°" }) +
    note(b3[0] + 12, 130, 380, 70, ["RC 10° hacia el talón (posterior),", "perpendicular a los metatarsianos", "DFRI 100 cm"], RED, "end") +
    txt(380, 138, "Flexión plantar: pie y RI deslizados", 11.5, MUTE, "end") + txt(380, 154, "hacia distal; bolsas de arena", 11.5, MUTE, "end") +
    note(b3[0] - 2, b3[1] + 6, 520, 318, ["Base del 3.er MT"], RED, "end") +
    note(...f.p("centro:Right third metatarsal bone"), 650, 300, ["metatarsianos"], INK) +
    note(...ta, 200, 300, ["calcáneo (talón)"], INK, "end")
  );
};

// oblicuas vistas desde los dedos: la rodilla cae hacia un lado y el pie queda inclinado sobre un bloque
function desdeDedos(id, medial, caja) {
  const f = E.figura(id, { caja });
  const m1 = f.p("cabeza_mt1_R"), m5 = f.p("base_mt5_R");
  const bajo = medial ? m1 : m5, alto = medial ? m5 : m1;       // borde que apoya y borde levantado
  const yRI = apoyo(f, bajo[0], 10) + 1;
  // bloque bajo el borde levantado: triángulo desde el apoyo hasta debajo de ese borde
  const sk = 1.0 * f.ppc;                                        // piel bajo el hueso
  const top = [alto[0], alto[1] + sk];
  const base0 = [bajo[0] + (medial ? -1 : 1) * 1.5 * f.ppc, yRI];
  const wedge = `<path d="M${f1(base0[0])},${f1(yRI)} L${f1(top[0])},${f1(top[1])} L${f1(top[0])},${f1(yRI)} Z" fill="#dfe3ea" stroke="#8a8f9c" stroke-width="1.2"/>`;
  return { f, yRI, base0, top, wedge };
}
I["pie-ap-oblicua-medial"] = () => {
  const d = desdeDedos("pie-ap-oblicua-medial", true, [180, 30, 300, 230]), f = d.f;
  const b3 = f.p("base_mt3_R"), ang = angulo(d.base0, d.top);
  return svg(
    view("Vista desde los dedos · pie oblicuado hacia medial") +
    table(120, 600, f1(d.yRI + 9), "") + riBar(150, 560, d.yRI) + txt(566, f1(d.yRI + 9), "RI 24 × 30", 12, INK) +
    d.wedge + f.svg + crossP(b3) +
    refline(f1(d.base0[0]), f1(d.yRI), f1(d.base0[0] + 160 * Math.cos(rad(ang))), f1(d.yRI + 160 * Math.sin(rad(ang)))) +
    arco(d.base0, 90, ang, 0, "30-40°") +
    tube(b3[0], b3[1] - 12, 0, 120) +
    note(b3[0] + 4, 100, 530, 64, ["RC perpendicular al RI", "en la base del 3.er MT", "DFRI 100 cm"], RED) +
    note(f1(d.top[0] - 10), f1(d.yRI - 6), 560, 286, ["Bloque angular", "radiotransparente"], INK) +
    txt(f1(d.base0[0] + 40), f1(d.yRI + 26), "medial", 10.5, MUTE) + txt(f1(d.top[0] - 4), f1(d.yRI + 26), "lateral", 10.5, MUTE, "end") +
    txt(16, 300, "Oblicuar el pie 30-40° hacia medial", 12, INK, "start", 700) + txt(16, 316, "(la rodilla cae hacia adentro), con bolsas de arena.", 11.5, MUTE) +
    txt(16, 64, "Bóveda alta → cerca de 45°", 11.5, MUTE) + txt(16, 80, "pie plano → cerca de 30°", 11.5, MUTE)
  );
};

// decúbito sobre el lado afectado (mediolateral), vista desde el tubo = desde medial
I["pie-lateral"] = () => {
  const f = E.figura("pie-lateral", { caja: [120, 30, 290, 290] });
  const b3 = f.p("base_mt3_R"), ta = f.p("talon_R"), as = f.p("centro:Right talus");
  const x0 = f.p("punta_dedo1_pie_R")[0] - 2 * f.ppc, x1 = ta[0] + 2 * f.ppc;
  return svg(
    view("Vista desde el tubo · decúbito sobre el lado afectado") +
    riTop(f1(x0 - 2 * f.ppc), f1(b3[1] - 12 * f.ppc), f1(x1 - x0 + 4 * f.ppc), f1(18 * f.ppc)) +
    f.svg + coll(f1(x0), f1(b3[1] - 11 * f.ppc), f1(x1 - x0), f1(16 * f.ppc)) + crossP(b3) +
    note(b3[0] - 8, b3[1] - 8, 110, 70, ["RC perpendicular", "en la base del 3.er MT"], RED, "end") +
    note(...f.p("centro:Right tibia"), 470, 80, ["Rodilla flexionada,", "pierna sana por detrás"], INK) +
    note(...f.p("cabeza_mt1_R"), 110, 250, ["Planta perpendicular", "al RI (apoyo bajo la", "rodilla si hace falta)"], BLUE, "end") +
    note(...ta, 470, 250, ["calcáneo"], INK) + note(...as, 470, 200, ["astrágalo"], INK) +
    txt(470, 288, "RI 18 × 24 (o 24 × 30) horiz.", 12, INK) +
    txt(470, 304, "Mediolateral · DFRI 100 cm", 11.5, MUTE) + txt(470, 318, "Campo: todo el pie + parte distal del tobillo", 11, AMB)
  );
};

// ======================= CALCÁNEO =======================
I["calcaneo-plantodorsal-axial"] = () => {
  const f = E.figura("calcaneo-plantodorsal-axial", { en: ["tobillo_R", 470, 196], ppc: 4.4 });
  const t = f.p("tobillo_R"), b3 = f.p("base_mt3_R"), ta = f.p("talon_R");
  const yRI = apoyo(f, ta[0], 8) + 1;
  const e = [f.borde("der", b3[1] - 2, b3[1] + 2), b3[1]];           // entrada: planta a la altura de la base del 3.er MT
  const u = [Math.cos(rad(130)), Math.sin(rad(130))], k = (yRI - e[1]) / u[1], out = add(e, u, k);
  return svg(
    view("Vista lateral · decúbito supino, pie en flexión dorsal") +
    table(0, 760, f1(yRI + 9), "") + riBar(ta[0] - 70, ta[0] + 50, yRI) + txt(f1(ta[0] - 70), f1(yRI + 36), "RI 18 × 24 vert.", 11.5, INK) +
    recorte(f, 0, 30, 760, 300) +
    `<line x1="${f1(e[0])}" y1="${f1(e[1])}" x2="${f1(out[0])}" y2="${f1(out[1])}" stroke="${RED}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    tube(e[0], e[1], -40, 150, { angLabel: "40°" }) + redDot(e) +
    note(e[0] + 4, e[1] + 4, 610, 236, ["Entrada: base del 3.er MT"], RED) +
    note(f1(e[0] + 110 * Math.cos(rad(-50))), f1(e[1] - 110 * Math.sin(rad(50))), 330, 46, ["RC 40° respecto del eje de la planta,", "hacia la cabeza · DFRI 100 cm"], RED, "end") +
    txt(330, 92, "Si el pie no llega a 90°, puede hacer falta", 11.5, MUTE, "end") + txt(330, 108, "más de 40° respecto de la vertical.", 11.5, MUTE, "end") +
    note(...ta, 330, 290, ["calcáneo, sobre la parte del RI"], INK, "end") + txt(330, 306, "más cercana al tubo", 13.5, INK, "end") +
    note(...f.p("cabeza_mt1_R"), 610, 110, ["Pie lo más vertical", "posible (tira de una gasa)"], BLUE)
  );
};

I["calcaneo-lateral"] = () => {
  const f = E.figura("calcaneo-lateral", { caja: [60, 30, 340, 290] });
  const mm = f.p("maleolo_med_R"), rc = cm(f, mm, 0, 2.5), ta = f.p("talon_R");
  return svg(
    view("Vista desde el tubo · decúbito sobre el lado afectado") +
    riTop(f1(rc[0] - 12 * f.ppc), f1(rc[1] - 9 * f.ppc), f1(24 * f.ppc), f1(18 * f.ppc), "RI 18 × 24 vert.", f1(rc[0] - 12 * f.ppc + 6), f1(rc[1] + 9 * f.ppc - 6)) +
    f.svg + coll(f1(rc[0] - 7 * f.ppc), f1(mm[1] - 2 * f.ppc), f1(ta[0] - rc[0] + 9 * f.ppc), f1(10 * f.ppc)) + crossP(rc) +
    note(rc[0] + 12, rc[1] + 6, 470, 250, ["RC perpendicular,", "2,5 cm por debajo del", "maléolo medial"], RED) +
    note(mm[0] + 4, mm[1] - 6, 470, 160, ["Maléolo medial"], INK) +
    note(...f.p("cabeza_mt1_R"), 470, 96, ["Flexión dorsal:", "planta cerca de 90°"], BLUE) +
    txt(16, 290, "Campo: calcáneo, con el tobillo en el borde superior", 11, AMB) +
    txt(16, 306, "Rodilla flexionada, pierna sana por detrás · lateral verdadera · DFRI 100 cm", 11, MUTE)
  );
};

// ======================= DEDOS DEL PIE =======================
I["dedos-pie-ap"] = () => {
  const f = E.figura("dedos-pie-ap", { caja: [200, 30, 540, 236] });
  const j = f.p("mtf_pie_R"), yRI = apoyo(f, f.p("cabeza_mt1_R")[0], 30) + 1;
  return svg(
    view("Vista lateral · rodilla flexionada, planta sobre el RI") +
    table(0, 760, f1(yRI + 10)) + riBar(j[0] - 90, j[0] + 120, yRI) + txt(f1(j[0] + 120), f1(yRI + 36), "RI 18 × 24 horiz.", 11.5, INK, "end") +
    f.svg + redDot(j) +
    tube(j[0], j[1] - 4, -12.5, 190, { angLabel: "10-15°" }) +
    note(j[0] + 12, 120, 290, 50, ["RC 10-15° hacia el calcáneo,", "perpendicular al eje de los dedos", "DFRI 100 cm"], RED, "end") +
    note(j[0] - 2, j[1] + 6, 600, 318, ["Articulaciones MTF de interés"], RED, "end") +
    note(...f.p("punta_dedo1_pie_R"), 700, 228, ["falanges"], INK) +
    note(...f.p("centro:Right third metatarsal bone"), 330, 300, ["metatarsianos"], INK, "end") +
    txt(16, 170, "Decúbito supino o sentado.", 11.5, MUTE) + txt(16, 186, "Varias exposiciones en un RI:", 11.5, MUTE) + txt(16, 202, "cubrir con plomo el resto.", 11.5, MUTE)
  );
};

const pieOblTxt = (medial) =>
  col(440, 70, [[`Oblicuar el pie 30-45° hacia ${medial ? "medial" : "lateral"}`, INK, 700, 12.5]]) +
  col(440, 100, [["Decúbito supino o sentado, pie", INK], ["apoyado sobre el RI, con un apoyo", INK], ["debajo del pie", INK]]) +
  col(440, 160, [["Eje de los dedos alineado con la", INK], ["zona del RI que se expone", INK]]) +
  col(440, 206, [["RC perpendicular al RI, centrado", RED, 700], ["en las MTF de interés", RED, 700]]) +
  col(440, 290, [["RI 18 × 24 horiz. · DFRI 100 cm", MUTE, 400, 11], ["Varias tomas en un RI: cubrir con plomo el resto", MUTE, 400, 11]]);
function dedosOblicua(v, medial) {
  const d = desdeDedos("dedos-pie-ap-oblicua--" + v, medial, [70, 30, 300, 230]), f = d.f;
  const j = f.p("mtf_pie_R"), ang = angulo(d.base0, d.top);
  const blanco = medial ? f.p("punta_dedo1_pie_R") : f.p("punta_dedo5_pie_R");
  return svg(
    view(medial ? "Dedos 1.º a 3.º · vista desde los dedos" : "Dedos 4.º y 5.º · vista desde los dedos") +
    table(30, 420, f1(d.yRI + 9), "") + riBar(50, 400, d.yRI) +
    d.wedge + f.svg + ringR(blanco, 3.4 * f.ppc) +
    refline(f1(d.base0[0]), f1(d.yRI), f1(d.base0[0] + 150 * Math.cos(rad(ang))), f1(d.yRI + 150 * Math.sin(rad(ang)))) +
    arco(d.base0, 80, ang, medial ? 0 : 180, "30-45°") +
    tube(blanco[0], blanco[1] - 3.6 * f.ppc, 0, 110) +
    txt(f1(d.base0[0]), f1(d.yRI + 26), medial ? "medial" : "lateral", 10.5, MUTE, medial ? "start" : "end") +
    pieOblTxt(medial)
  );
}
I["dedos-pie-ap-oblicua--v1"] = () => dedosOblicua("v1", true);
I["dedos-pie-ap-oblicua--v2"] = () => dedosOblicua("v2", false);

// lateral de dedos, vista desde el tubo: v1 lateromedial (desde lateral, dedos a la derecha), v2 mediolateral (desde medial)
function dedosLateral(v) {
  const id = "dedos-pie-lateral--" + v, med = v === "v2";
  const f = E.figura(id, { caja: med ? [300, 50, 440, 250] : [20, 50, 440, 250] });
  const j = f.p(med ? "ifp_dedo3_pie_R" : "if_dedo1_pie_R");
  return { f, j, svg: riTop(f1(j[0] - 12 * f.ppc), f1(j[1] - 9 * f.ppc), f1(24 * f.ppc), f1(18 * f.ppc)) + f.svg +
    coll(f1(j[0] - 3 * f.ppc), f1(j[1] - 2.5 * f.ppc), f1(6 * f.ppc), f1(5 * f.ppc)) + crossP(j) };
}
I["dedos-pie-lateral--v1"] = () => {
  const d = dedosLateral("v1"), j = d.j;
  return svg(
    view("Dedos 1.º a 3.º · lateromedial · desde el tubo") + d.svg +
    note(j[0] - 6, j[1] - 12, 300, 56, ["RC perpendicular a la IF del 1.er dedo", "(IFP del 2.º o el 3.er dedo)"], RED, "end") +
    note(f1(j[0] + 3 * d.f.ppc), f1(j[1] + 2.5 * d.f.ppc), 520, 300, ["Colimar al dedo de interés"], AMB, "end") +
    col(560, 200, [["Lateromedial:", INK, 700, 12], ["1.er dedo abajo, contra el RI", INK]]) +
    col(560, 250, [["RI 18 × 24 horiz.", INK]]) +
    col(560, 280, [["Separar los otros dedos con", MUTE, 400, 11], ["cinta o gasa · DFRI 100 cm", MUTE, 400, 11]])
  );
};
I["dedos-pie-lateral--v2"] = () => {
  const d = dedosLateral("v2"), j = d.j;
  return svg(
    view("Dedos 4.º y 5.º · mediolateral · desde el tubo") + d.svg +
    note(j[0] + 6, j[1] - 12, 460, 56, ["RC perpendicular a la IFP", "del dedo a estudiar"], RED, "start") +
    note(f1(j[0] - 3 * d.f.ppc), f1(j[1] + 2.5 * d.f.ppc), 240, 300, ["Colimar al dedo de interés"], AMB, "start") +
    col(20, 200, [["Mediolateral:", INK, 700, 12], ["1.er dedo arriba", INK]]) +
    col(20, 250, [["RI 18 × 24 horiz.", INK]]) +
    col(20, 280, [["Separar los otros dedos con", MUTE, 400, 11], ["cinta o gasa · DFRI 100 cm", MUTE, 400, 11]])
  );
};

// ---- tangencial de sesamoideos ----
// v1 prono, visto desde medial (lado del 1.er dedo): mesa abajo, talón arriba
I["dedos-pie-tangencial-sesamoideos--v1"] = () => {
  const f = E.figura("dedos-pie-tangencial-sesamoideos--v1", { en: ["cabeza_mt1_R", 560, 214], ppc: 5.2 });
  const h = f.p("cabeza_mt1_R"), ta = f.p("talon_R");
  const yRI = apoyo(f, f.p("punta_dedo1_pie_R")[0], 12) + 1;
  const ang = angulo(h, ta);                                     // planta: de la cabeza del 1.er MT al talón
  const e2 = add(h, [Math.cos(rad(ang)), Math.sin(rad(ang))], 1.15 * Math.hypot(ta[0] - h[0], ta[1] - h[1]));
  return svg(
    view("Decúbito prono · vista lateral (desde medial)") +
    table(0, 760, f1(yRI + 9)) + riBar(h[0] - 80, h[0] + 80, yRI) + txt(f1(h[0] - 80), f1(yRI + 36), "RI 18 × 24 horiz.", 11.5, INK) +
    recorte(f, 0, 30, 760, 300) +
    linea(h, e2) + refline(f1(h[0]), f1(h[1]), f1(h[0]), f1(h[1] - 120)) +
    arco(h, 70, -90, ang, "") + txt(f1(h[0] - 40), f1(h[1] - 130), "Planta a 15-20°", 12.5, BLUE, "end", 700) + txt(f1(h[0] - 40), f1(h[1] - 115), "de la vertical", 11.5, BLUE, "end") +
    tube(h[0], h[1] - 2, 0, 150) + redDot(h) +
    note(h[0] + 4, h[1] + 4, 640, 236, ["Cabeza del", "1.er MT"], RED) +
    note(h[0], 130, 642, 100, ["RC perpendicular,", "tangente a la", "cabeza del 1.er MT", "(angulado si falta", "flexión dorsal)"], RED) +
    txt(16, 290, "Pie y 1.er dedo en flexión dorsal, apoyados sobre el RI.", 11.5, INK, "start", 700) +
    txt(16, 306, "Si no se logra la planta a 15-20° de la vertical, ajustar el ángulo del RC · DFRI 100 cm", 11, MUTE)
  );
};
// v2 supino: pierna extendida, pie hacia arriba y dedos en flexión dorsal sostenidos con una gasa
I["dedos-pie-tangencial-sesamoideos--v2"] = () => {
  const f = E.figura("dedos-pie-tangencial-sesamoideos--v2", { en: ["cabeza_mt1_R", 420, 110], ppc: 4.2 });
  const h = f.p("cabeza_mt1_R"), tip = f.p("punta_dedo1_pie_R"), ta = f.p("talon_R");
  const yRI = apoyo(f, ta[0], 8) + 1, mano = [150, 70];
  return svg(
    view("Decúbito supino (alternativa) · vista lateral") +
    table(0, 760, f1(yRI + 9)) + riBar(ta[0] - 60, ta[0] + 50, yRI) + txt(f1(ta[0] - 60), f1(yRI + 36), "RI 18 × 24 horiz.", 11.5, INK) +
    recorte(f, 0, 30, 760, 300) +
    `<path d="M${f1(tip[0])},${f1(tip[1])} Q${f1((tip[0] + mano[0]) / 2)},${f1(Math.min(tip[1], mano[1]) - 30)} ${mano[0]},${mano[1]}" fill="none" stroke="#9fc3e8" stroke-width="3"/>` +
    txt(mano[0], mano[1] - 14, "← gasa: la sostiene el paciente", 11, MUTE, "start") +
    tube(h[0], h[1] - 2, 0, 80) + redDot(h) +
    note(h[0] + 4, h[1] + 4, 600, 200, ["Cabeza del", "1.er MT"], RED) +
    note(h[0] + 6, 60, 600, 70, ["RC perpendicular, o", "angulado según la", "flexión dorsal, centrado", "en la cabeza del 1.er MT"], RED) +
    txt(16, 296, "Suele tolerarse mejor si el paciente tiene mucho dolor.", 11.5, INK, "start", 700) +
    txt(16, 312, "El paciente sostiene los dedos con una tira larga de gasa · DFRI 100 cm", 11, MUTE)
  );
};

// ---- AP y lateral de pies en carga ----
I["pie-ap-lateral-carga--v1"] = () => {
  const f = E.figura("pie-ap-lateral-carga--v1", { caja: [60, 30, 340, 250] });
  const b3 = f.p("base_mt3_R"), yRI = apoyo(f, b3[0], 40) + 1;
  return svg(
    view("AP · vista lateral, de pie") +
    `<rect x="40" y="${f1(yRI + 9)}" width="400" height="10" fill="#cfd3dc"/>` +
    riBar(f.p("talon_R")[0] - 20, f.p("punta_dedo1_pie_R")[0] + 20, yRI) + txt(60, f1(yRI + 40), "RI 24 × 30 horiz. (35 × 43 los dos pies)", 11, INK) +
    f.svg + redDot(b3) +
    tube(b3[0], b3[1] - 4, -15, 150, { angLabel: "15°" }) +
    note(f1(b3[0] + 70 * Math.tan(rad(15))), f1(b3[1] - 70), 470, 70, ["RC 15° posterior (cefálico)", "a la base del 3.er MT, a mitad", "de camino entre los dos pies"], RED) +
    col(470, 150, [["De pie, parado sobre el RI,", INK, 700], ["con el peso repartido por igual", INK, 700], ["entre los dos pies", INK, 700]]) +
    col(470, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};
// desde arriba: los dos pies; el derecho del paciente queda a la derecha del dibujo (se mira desde la cabeza)
I["pie-ap-lateral-carga--v2"] = () => {
  const f = E.figura("pie-ap-lateral-carga--v2", { caja: [30, 40, 400, 240] });
  const m5 = f.p("base_mt5_R"), cR = f.p("tobillo_R");
  const xm = f.x + f.w / 2;                                        // entre los dos pies
  const blk = (x0, x1) => `<rect x="${f1(x0)}" y="${f1(f.y - 6)}" width="${f1(x1 - x0)}" height="${f1(f.h + 12)}" rx="4" fill="#e3e6ec" stroke="#8a8f9c" stroke-width="1.2"/>`;
  return svg(
    view("Lateral · vista desde arriba") +
    blk(f.x - 4, xm - 8) + blk(xm + 8, f.x + f.w + 4) + txt(f1(xm), f1(f.y + f.h + 22), "bloques", 10.5, MUTE, "middle") +
    f.svg + `<rect x="${f1(xm - 3.5)}" y="${f1(f.y - 16)}" width="7" height="${f1(f.h + 30)}" fill="${INK}"/>` + txt(f1(xm), f1(f.y - 22), "RI vertical entre los pies", 11, INK, "middle") +
    beam(f1(m5[0] + 2), f1(m5[1]), 180, f1(Math.max(60, 470 - m5[0] - 20)), { ref: 180 }) + redDot(m5) +
    txt(30, 300, "← pie izquierdo", 10.5, MUTE) + txt(430, 300, "pie derecho →", 10.5, MUTE, "end") +
    note(m5[0] + 4, m5[1] + 4, 470, 250, ["RC horizontal, hacia", "la base del 5.º MT"], RED) +
    col(470, 70, [["De pie, con todo el peso sobre", INK, 700], ["los dos pies y el RI vertical", INK, 700], ["entre ellos", INK, 700]]) +
    col(470, 130, [["Pies sobre bloques lo bastante altos", INK], ["como para usar un RC horizontal", INK]]) +
    col(470, 180, [["Se radiografían el pie derecho y el", INK], ["izquierdo para comparar", INK]]) +
    col(470, 300, [["DFRI 100 cm · sin parrilla", MUTE, 400, 11]])
  );
};

module.exports = I;
