// Esquemas de columna (cervical, dorsal, lumbar) y abdomen AP, en el estilo del primer ejemplo (Atlas y Axis):
// persona = un contorno continuo color piel con cara (ojo y oreja), huesos de referencia "por transparencia".
const {
  SKO, RED, BLUE, AMB, INK, MUTE, BONE, BONEO,
  table, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot,
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

// ---------- 1. Atlas y Axis: adaptación directa del primer ejemplo ----------
function atlasAxis() {
  const s = 0.8, tx = 190, ty = 252;
  const P = mk(s, 232, 398, tx, ty);
  const p = (x, y) => P(x, y).split(",").map(Number);
  const H = cabezaPerfil(tx, ty, { s, boca: "abierta" });
  const [mx, my] = p(326, 262);
  const [ix, iy] = p(319, 262), [, by] = p(319, 375);
  const [, ty330] = p(462, 330);
  const cuerpo = H.d + ` L${P(398, 352)} C${P(420, 346)} ${P(440, 334)} ${P(466, 328)} C${P(500, 322)} ${P(540, 318)} ${P(580, 322)} L746,${f1(ty330)} L746,252 Z`;
  // C1 (anillo) y C2 con la apófisis odontoides que sube dentro de C1
  const c1 = hueso(`M${P(306, 362)} Q${P(306, 359)} ${P(310, 359)} L${P(328, 359)} Q${P(332, 359)} ${P(332, 362)} L${P(332, 370)} Q${P(332, 373)} ${P(328, 373)} L${P(310, 373)} Q${P(306, 373)} ${P(306, 370)} Z`);
  const c2 = hueso(`M${P(338, 363)} L${P(360, 363)} Q${P(364, 363)} ${P(364, 367)} L${P(364, 377)} Q${P(364, 380)} ${P(360, 380)} L${P(338, 380)} Q${P(335, 380)} ${P(335, 377)} L${P(335, 369)} L${P(322, 369)} Q${P(314, 368)} ${P(314, 365.5)} Q${P(314, 363)} ${P(322, 362.5)} L${P(335, 363)} Z`);
  const [c1x, c1y] = p(306, 356), [c2x, c2y] = p(366, 362), [ox, oy] = p(318, 366);
  const [ex, ey] = p(214, 352);
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(...p(226, 418), 160, 10) + txt(p(226, 418)[0] + 170, p(226, 418)[1] + 10, "RI 18 x 24 longitudinal · parrilla sí", 12, INK) +
    piel(cuerpo) + H.cara +
    c1 + c2 +
    etiquetaHueso(c1x - 2, c1y - 1, "C1", "end") + etiquetaHueso(c2x, c2y, "C2") +
    `<line x1="${f1(ox)}" y1="${f1(oy)}" x2="${f1(ox + 6)}" y2="${f1(oy + 18)}" stroke="${BONEO}" stroke-width="0.9"/>` +
    etiquetaHueso(ox + 8, oy + 22, "odontoides") +
    etiquetaHueso(ex - 8, ey + 2, "oreja") +
    refline(ix, iy, ix, by) + dot(ix, iy) + dot(ix, by) +
    beam(mx, my, 90, 110) +
    `<line x1="${f1(mx)}" y1="${f1(my + 10)}" x2="${f1(mx)}" y2="282" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    txt(mx + 50, 40, "DFR 1 m", 12, MUTE) +
    note(mx + 2, 92, 420, 50, ["Rayo central perpendicular", "por el centro de la boca abierta (C1-C2)"], RED) +
    note(ix, by - 22, 420, 100, ["Incisivos superiores alineados", "con la punta de las mastoides,", "perpendicular a la mesa"], BLUE) +
    note(...p(340, 282), 420, 160, ["Boca abierta al máximo:", "último paso, sin mover la cabeza"], "#7a3b33") +
    txt(30, 302, "Apnea durante la exposición. Se debe ver la odontoides completa, masas laterales de C1 y articulaciones C1-C2,", 11.5, MUTE) +
    txt(30, 317, "con incisivos superiores y base del cráneo superpuestos.", 11.5, MUTE)
  );
}

// ---------- 2. Cervical AP axial ----------
function cervicalAP() {
  const E = escena(1.6, 150, 252);
  const H = E.cabeza({ rot: -8 });
  const cuerpo = H.d + " " + E.tp("C172,220 182,208 196,200 " + PECHO + " C312,188 336,196 362,198 L475,198 L475,252 Z");
  // mandíbula (coordenadas de la cabeza original)
  const mand = hueso(`M${H.P(376, 332)} C${H.P(378, 342)} ${H.P(364, 348)} ${H.P(348, 352)} L${H.P(330, 358)} C${H.P(324, 360)} ${H.P(320, 356)} ${H.P(318, 352)} L${H.P(276, 322)} C${H.P(272, 318)} ${H.P(278, 312)} ${H.P(283, 315)} L${H.P(322, 344)} C${H.P(326, 347)} ${H.P(330, 347)} ${H.P(336, 345)} L${H.P(352, 340)} C${H.P(362, 337)} ${H.P(368, 334)} ${H.P(370, 330)} Z`);
  const CX = [137, 145.5, 154, 162.5, 171, 179.5, 188], CY = 236;
  const w = 7 * E.s, h = 9 * E.s;
  let vs = "";
  CX.forEach((x, i) => { vs += vert(E.X(x), E.Y(CY), w, h); });
  const c4x = E.X(CX[3]), c4y = E.Y(CY);
  // RC 12° craneal que atraviesa C4: entrada en la piel (cartílago tiroides)
  const ang = 12, t = Math.tan((ang * Math.PI) / 180);
  const skinY = E.Y(214);
  const entX = c4x + (c4y - skinY) * t;
  const [m1x, m1y] = H.P(276, 322).split(",").map(Number);
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(c4x - 70, 268, 140, 10, "RI 18 x 24 · parrilla", c4x + 80, 278) +
    piel(cuerpo) + linea(E.tp(BRAZO_COSTADO).replace(/^M[^C]*/, (m) => m)) + H.cara +
    mand + vs + resaltar(c4x, c4y, w, h) +
    etiquetaHueso(E.X(CX[0]) - 2, E.Y(CY) - h / 2 - 4, "C1", "middle") + etiquetaHueso(E.X(CX[6]) + 2, E.Y(CY) - h / 2 - 4, "C7", "middle") +
    etiquetaHueso(m1x - 20, m1y - 16, "mandíbula", "end") + `<line x1="${f1(m1x - 18)}" y1="${f1(m1y - 18)}" x2="${f1(m1x)}" y2="${f1(m1y - 2)}" stroke="${BONEO}" stroke-width="0.9"/>` +
    tube(entX, skinY, -ang, 160, { angLabel: "10-15°" }) +
    `<line x1="${f1(entX)}" y1="${f1(skinY)}" x2="${f1(entX - (276 - skinY) * t)}" y2="276" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    txt(entX - 30, 110, "← craneal", 12, RED, "end", 700) +
    etiquetaHueso(c4x - 6, c4y + h / 2 + 13, "C4", "end") +
    note(entX + 40, 120, 420, 52, ["RC 10-15° craneal, incide en C4", "(cartílago tiroides)", "compensa la lordosis: la mandíbula", "solo tapa C1-C2"], RED) +
    note(...H.P(372, 316).split(",").map(Number), 120, 120, ["Mentón extendido"], INK, "end") +
    txt(470, 300, "También puede hacerse de pie · apnea · DFR 1 m", 11.5, MUTE)
  );
}

// ---------- 3. Cervical perfil (vista de frente, de pie de costado al bucky) ----------
function cervicalPerfil() {
  const cx = 450, hy = 60;
  const cuerpo = `M438,84 L438,122 C430,128 412,132 398,138 C388,142 382,152 381,164 L375,282 C374,296 392,298 393,284 L398,186 ` +
    `C399,180 405,180 406,186 L409,312 L491,312 L494,186 C495,180 501,180 502,186 L507,284 C508,298 526,296 525,282 L519,164 ` +
    `C518,152 512,142 502,138 C488,132 470,128 462,122 L462,84 Z`;
  const VY = [84, 92.5, 101, 109.5, 118, 126.5, 135];
  let vs = "";
  VY.forEach((y) => { vs += vert(cx, y, 15, 7); });
  const clav = hueso("M444,141 C430,138 414,140 402,146 L403,150 C415,145 430,143 444,146 Z") +
    hueso("M456,141 C470,138 486,140 498,146 L497,150 C485,145 470,143 456,146 Z");
  return svg(
    view("Vista de frente · paciente de costado al bucky") +
    `<rect x="528" y="34" width="12" height="270" fill="#cfd3dc"/>` +
    txt(548, 290, "Bucky vertical", 11, MUTE) + txt(548, 304, "RI 24 x 30 longitudinal", 11, INK) +
    piel(cuerpo) + vs + clav + cabezaFrente(cx, hy, 26) +
    resaltar(cx, VY[3], 15, 7) +
    etiquetaHueso(cx + 26, VY[3] + 18, "C4") + `<line x1="${cx + 9}" y1="${VY[3] + 4}" x2="${cx + 25}" y2="${VY[3] + 14}" stroke="${BONEO}" stroke-width="0.9"/>` +
    etiquetaHueso(cx, 166, "clavículas", "middle") +
    beam(438, VY[3], 0, 288, { horizontal: true }) +
    `<line x1="438" y1="${VY[3]}" x2="526" y2="${VY[3]}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    note(300, VY[3], 290, 54, ["RC perpendicular (horizontal),", "incide en C4"], RED, "end") +
    txt(300, VY[3] + 22, "DFR 1,40 m", 12.5, RED, "middle", 700) +
    note(396, 142, 300, 196, ["Hombros relajados y caídos,", "brazos hacia atrás"], INK, "end") +
    note(468, 48, 562, 40, ["Cuello extendido,", "maxilar hacia delante"]) +
    txt(562, 110, "Plano mediocoronal", 11.5, BLUE, "start", 700) + txt(562, 124, "alineado con el RC", 11.5, BLUE) +
    txt(562, 160, "Exponer en", 11.5, MUTE) + txt(562, 174, "espiración completa", 11.5, MUTE)
  );
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

function dorsalAP() {
  const E = SUP, t7 = E.X(TX[6]);
  const ester = hueso("M193,206 C196,201 200,199 204,199 C224,192 244,187 262,186 L263,190 C245,191 226,196 206,204 C202,206 197,208 193,206 Z");
  const notch = [196, 203];
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(t7 - 86, 268, 172, 10, "RI 35 x 43 longitudinal · parrilla", t7 + 96, 278) +
    supinoFlex() + ester + dorsales(E) +
    etiquetaHueso(t7 - 5, E.Y(TY - 5.5) - 3, "T7", "end") +
    dot(...notch) + etiquetaHueso(notch[0] - 22, 150, "escotadura yugular", "end") +
    `<line x1="${notch[0] - 20}" y1="153" x2="${notch[0]}" y2="${notch[1] - 4}" stroke="${BONEO}" stroke-width="0.9"/>` +
    // distancia escotadura - RC
    `<line x1="${notch[0]}" y1="168" x2="${t7}" y2="168" stroke="${BLUE}" stroke-width="1.3"/><line x1="${notch[0]}" y1="162" x2="${notch[0]}" y2="198" stroke="${BLUE}" stroke-width="1" stroke-dasharray="2 3"/>` +
    txt((notch[0] + t7) / 2 - 6, 162, "8-10 cm", 11, BLUE, "middle", 700) +
    tube(t7, 180, 0, 132, { anodo: ["ánodo", "cátodo"] }) +
    `<line x1="${t7}" y1="190" x2="${t7}" y2="282" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    note(t7, 108, 330, 62, ["RC perpendicular a T7", "8-10 cm debajo de la escotadura yugular"], RED) +
    note(494, 146, 560, 120, ["Caderas y rodillas flexionadas", "reduce la curvatura lordótica"]) +
    note(616, 240, 650, 210, ["Pies hacia el cátodo", "(efecto talón)"]) +
    txt(40, 304, "Exponer en espiración · colimar largo y estrecho hasta la columna T", 11.5, MUTE)
  );
}

function lumbarAP() {
  const E = SUP, rc = E.X(330), cr = E.X(354);
  return svg(
    view("Vista lateral · decúbito supino (variante AP)") +
    table(30, 730, 252) +
    ri(rc - 84, 268, 168, 10, "RI 30 x 35 o 35 x 43 long. · parrilla", rc + 94, 278) +
    supinoFlex() + lumbares(E, { marca: "L3" }) + coxal(E) +
    `<line x1="${cr}" y1="178" x2="${cr}" y2="212" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="3 3"/>` +
    etiquetaHueso(cr + 5, 176, "cresta ilíaca") +
    `<line x1="${rc}" y1="190" x2="${cr}" y2="190" stroke="${BLUE}" stroke-width="1.4"/>` + txt(cr + 5, 191, "2,5 cm", 10.5, BLUE, "start", 700) +
    tube(rc, 196, 0, 150) +
    `<line x1="${rc}" y1="206" x2="${rc}" y2="282" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    note(rc, 110, 420, 56, ["RC perpendicular 2,5 cm por encima", "de la cresta ilíaca (L3)", "con 35 x 43: centrar en la cresta"], RED) +
    note(506, 150, 566, 124, ["Rodillas flexionadas:", "compensa la lordosis lumbar"]) +
    txt(40, 304, "EIAS a la misma distancia de la mesa · exponer al final de la espiración", 11.5, MUTE) +
    txt(40, 319, "Colimar largo y estrecho (incluir sacroilíacas)", 11.5, AMB)
  );
}

function abdomenAP() {
  const E = SUP, cr = E.X(354), [sx, sy] = [E.X(419), E.Y(211)];
  return svg(
    view("Vista lateral · decúbito supino") +
    table(30, 730, 252) +
    ri(cr - 84, 268, 168, 10, "RI 35 x 43 longitudinal · parrilla", cr + 94, 278) +
    supinoExt() + lumbares(E, { etiquetas: false }) + coxal(E) +
    `<ellipse cx="${sx}" cy="${sy}" rx="4.5" ry="3.5" fill="${BONE}" stroke="${BONEO}" stroke-width="1.4"/>` +
    `<path d="${E.tp("M412,224 C414,218 416,214 419,211")}" fill="none" stroke="${BONEO}" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="${cr + 3}" y1="186" x2="${cr + 3}" y2="210" stroke="${BLUE}" stroke-width="1.1" stroke-dasharray="3 3"/>` +
    etiquetaHueso(cr + 8, 190, "cresta ilíaca") + etiquetaHueso(sx + 7, sy - 3, "sínfisis") +
    `<line x1="${sx}" y1="${sy + 4}" x2="${sx}" y2="268" stroke="${BLUE}" stroke-width="1" stroke-dasharray="3 3"/>` +
    tube(cr, 196, 0, 150) +
    `<line x1="${cr}" y1="206" x2="${cr}" y2="282" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
    note(cr, 110, 430, 56, ["RC perpendicular a nivel de las crestas ilíacas", "foco grueso · DFR 1 m"], RED) +
    note(cr + 84, 279, 470, 312, ["Borde inferior del RI incluye la sínfisis del pubis"], INK) +
    note(482, 212, 500, 160, ["Piernas extendidas, brazos a los lados", "sin rotación (EIAS a igual distancia)"]) +
    txt(40, 304, "Exponer al final de la espiración", 11.5, MUTE)
  );
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

function dorsalPerfil() {
  const E = LAT, t7x = E.X(TX[6]), sy = E.Y(TY);
  const x1 = E.X(TX[0]) - 14, x2 = E.X(TX[11]) + 14;
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(t7x - 118, 128, 236, 128, "RI 35 x 43 long. · parrilla", t7x - 112, 251) +
    latDec() + dorsales(E) +
    coll(x1, sy - 20, x2 - x1, 40) +
    txt(x1 + 30, sy - 25, "colimar largo y estrecho", 11, AMB) +
    cross(t7x, sy) +
    note(t7x + 10, sy + 6, 300, 290, ["RC perpendicular en T7"], RED) +
    note(E.X(330), E.Y(253), 470, 276, ["Apoyo bajo la cintura:", "columna casi paralela a la mesa"]) +
    note(E.X(500), E.Y(150), 600, 44, ["Caderas y rodillas", "flexionadas"]) +
    txt(30, 296, "Respiración suave o", 11.5, MUTE) + txt(30, 310, "exponer en espiración", 11.5, MUTE)
  );
}

function lumbarPerfil() {
  const E = LAT, rc = E.X(330), sy = E.Y(LY), cr = E.X(354);
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(rc - 112, 128, 224, 128, "RI · parrilla", rc - 106, 251) +
    latDec({ cojin: true }) + lumbares(E, { marca: "L3", izq: ["L4"] }) + coxal(E) +
    refline(cr, 126, cr, E.Y(256)) + txt(cr + 4, 122, "nivel de la cresta ilíaca", 11, BLUE) +
    coll(E.X(282), sy - 26, E.X(396) - E.X(282), 52) +
    cross(rc, sy) +
    note(rc - 8, sy + 8, 210, 282, ["RC perpendicular, igual que el frente", "(2,5 cm por encima de la cresta)"], RED) +
    txt(210, 318, "Pelvis ancha y tórax estrecho: angular 3-5° caudal", 11.5, RED) +
    note(E.X(512), E.Y(152), 600, 44, ["Cojín entre las piernas,", "piernas flexionadas"]) +
    txt(520, 274, "Plancha de plomo detrás", 11.5, MUTE) + txt(520, 288, "del paciente · pies al cátodo", 11.5, MUTE) +
    txt(520, 310, "Escoliosis: convexidad hacia abajo", 11.5, MUTE)
  );
}

function pasajeL5S1() {
  const E = LAT, cx = E.X(386), cy = E.Y(233), cr = E.X(354);
  const [ax, ay] = [E.X(382), E.Y(205)];
  return svg(
    view("Vista desde el tubo · decúbito lateral") +
    riTop(cx - 60, 157, 120, 90, "RI 18 x 24", cx - 2, 242) +
    latDec({ cojin: true }) + lumbares(E, { marca: null, izq: ["L4"] }) + coxal(E) +
    refline(cr, 126, cr, E.Y(256)) + txt(cr - 4, 122, "nivel de la cresta", 11, BLUE, "end") +
    dot(ax, ay) + txt(ax + 8, 146, "EIAS", 11, BLUE) + `<line x1="${ax + 2}" y1="${ay - 4}" x2="${ax + 8}" y2="148" stroke="${BLUE}" stroke-width="1"/>` +
    `<line x1="${ax}" y1="${ay + 4}" x2="${ax}" y2="${cy}" stroke="${BLUE}" stroke-width="1" stroke-dasharray="3 3"/>` +
    cross(cx, cy) +
    note(cx + 8, cy + 8, 470, 284, ["RC en L5-S1: ⟂ si la columna", "está paralela; 5-8° caudal si no"], RED) +
    txt(470, 318, "Centrado (Bontrager): ≈4 cm bajo la cresta y 5 cm detrás de la EIAS", 10.5, MUTE) +
    note(E.X(512), E.Y(152), 600, 44, ["Apoyo entre las rodillas"]) +
    txt(30, 280, "Apoyo bajo la cintura si hace falta", 11.5, MUTE) + txt(30, 294, "Plancha de plomo detrás · apnea", 11.5, MUTE)
  );
}

module.exports = {
  "Columna cervical|Atlas y Axis (C1-C2) · AP boca abierta": atlasAxis,
  "Columna cervical|Frente · AP axial": cervicalAP,
  "Columna cervical|Perfil": cervicalPerfil,
  "Columna dorsal (torácica)|Frente · AP": dorsalAP,
  "Columna dorsal (torácica)|Perfil": dorsalPerfil,
  "Columna lumbar|Frente · AP o PA": lumbarAP,
  "Columna lumbar|Perfil": lumbarPerfil,
  "Columna lumbar|Pasaje L5-S1 · Perfil": pasajeL5S1,
  "Abdomen|Frente · AP decúbito supino": abdomenAP,
};
