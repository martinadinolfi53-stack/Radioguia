// Esquemas de miembro superior (hombro, húmero, codo, antebrazo) en el estilo nuevo:
// persona = contorno continuo color piel; huesos de referencia "por transparencia".
const E = require("./estilo.cjs");
const { SK, SKO, RED, BLUE, AMB, INK, MUTE, BONEO, wall, riTop, beam, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, mk, cabezaPerfil, cabezaFrente } = E;

// ---------- helpers propios ----------
const f1 = (n) => +n.toFixed(1);
const P = (pts) => pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" L");
// rótulo de hueso con línea guía fina
const lab = (px, py, tx, ty, t, anchor = "start") =>
  `<line x1="${px}" y1="${py}" x2="${anchor === "start" ? tx - 3 : tx + 3}" y2="${ty - 4}" stroke="${BONEO}" stroke-width=".8"/>` + etiquetaHueso(tx, ty, t, anchor);
const circ = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
// rótulo azul simple con línea (como en la versión anterior)
const azul = (px, py, tx, ty, t, anchor = "middle") =>
  txt(tx, ty, t, 11, BLUE, anchor) + `<line x1="${tx}" y1="${ty + 4}" x2="${px}" y2="${py}" stroke="${BLUE}" stroke-width="1"/>`;
// hueso largo a lo largo del eje p1→p2; perfil = [[t, semiancho lado +n, semiancho lado -n], ...]
// (+n = a la izquierda del sentido p1→p2 en pantalla girado: n = (-uy, ux))
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
// puntas de dedo: semicírculo de puntos de x1 a x2 con el extremo hacia +y
function tip(x1, x2, y) {
  const r = (x2 - x1) / 2, c = (x1 + x2) / 2, out = [];
  for (let i = 0; i <= 6; i++) { const a = Math.PI - (i * Math.PI) / 6; out.push([c + r * Math.cos(a), y + r * Math.sin(a)]); }
  return out;
}
// Mano en coordenadas locales: muñeca en el origen (de x=-10 a x=10), dedos hacia +y, pulgar del lado -x.
// tipo: "palma" | "dorso" (mismo contorno, distinto detalle) | "canto" (de costado, pulgar hacia el observador)
function handLocal(tipo) {
  if (tipo === "canto") {
    const pts = [[-10, 0], [-13, 8], [-14.5, 16], [-13, 24], [-12, 34], [-12, 44], ...tip(-12, -3, 44), [-2.5, 40], ...tip(-3, 3.5, 41).slice(1), [3.5, 37], ...tip(3.5, 8.5, 37).slice(1), [8.5, 33], ...tip(8.5, 11.5, 33).slice(1), [11, 18], [10, 0]];
    const det = [`M-4,4 C-10,12 -10,26 -4,33 C1,36 5,30 5,9`, `M-2.5,29.5 Q0,27.5 3,29.5`, `M-12,36 Q-4,38 0,35`]; // pulgar por delante (con uña) y dedos escalonados // pulgar por delante (con uña) + pliegue de dedos
    return { pts, det };
  }
  const pts = [[-10, 0], [-11, 5], [-17, 13], [-22, 21], [-23.5, 26], ...tip(-24, -18, 27).slice(1, 6), [-16, 24], [-12.5, 21],
    [-12, 27], [-12, 49], ...tip(-12, -6.5, 49), [-6.2, 30], [-6, 52], ...tip(-6, 0, 52), [0.2, 30], [0.5, 50], ...tip(0.5, 6, 50),
    [6.2, 30], [6.5, 43], ...tip(6.5, 11.5, 43), [11.5, 20], [10, 0]];
  const det = tipo === "palma"
    ? [`M-8,20 Q-2,24 9,19`, `M-7,9 Q-10,16 -11,24`] // pliegues de la palma
    : [`M-10.8,46 Q-9.2,44 -7.6,46`, `M-4.8,49 Q-3,47 -1.2,49`, `M1.4,47 Q3.2,45 5,47`, `M7.4,40 Q9,38 10.6,40`, `M-22,23 Q-20.5,21 -19,23`]; // uñas (dorso)
  return { pts, det };
}
// coloca la mano: muñeca en (cx,cy), dedos hacia 'ang' (grados SVG), escala s; espejo = pulgar del otro lado.
// Devuelve { seg: "L..." de un lado de la muñeca al otro, det: líneas internas, a, b: extremos }.
function mano(cx, cy, ang, s, tipo, espejo = false, invertir = false) {
  const { pts, det } = handLocal(tipo);
  const T = mk(s, 0, 0, cx, cy, ang - 90, espejo);
  let p = pts.map(([x, y]) => T(x, y));
  if (invertir) p = p.reverse();
  const detS = det.map((d) => linea(d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => T(+x, +y)), 1.3)).join("");
  return { seg: "L" + p.join(" L"), det: detS, a: p[0], b: p[p.length - 1] };
}
const panelSep = (title) => `<line x1="388" y1="14" x2="388" y2="322" stroke="#e2e4ea"/>` +
  `<text x="402" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${title.toUpperCase()}</text>`;

// ---------- persona de pie vista de costado, mirando a la derecha (se ve su lado derecho) ----------
// dx desplaza todo; espalda en x≈424+dx, pecho en x≈498+dx
function costado(dx) {
  const h = cabezaPerfil(436 + dx, 80, { s: 0.3, rot: 90 });
  const X = (x) => x + dx;
  const d = h.d + ` L${X(454)},132 C${X(468)},138 ${X(490)},146 ${X(496)},172 L${X(498)},210 C${X(498)},240 ${X(492)},262 ${X(494)},290 L${X(496)},316 L${X(426)},316 L${X(424)},290 C${X(420)},260 ${X(420)},180 ${X(422)},150 C${X(424)},140 ${X(428)},134 ${X(430)},124 L${X(434)},96 Z`;
  // brazo colgando al costado (superpuesto al tronco)
  const brazo = linea(`M${X(442)},176 C${X(440)},152 ${X(450)},138 ${X(462)},137 C${X(476)},138 ${X(482)},152 ${X(478)},176 L${X(476)},250 L${X(474)},316 M${X(442)},176 L${X(444)},250 L${X(446)},316`);
  const huesos =
    hueso(`M${X(432)},136 L${X(444)},140 L${X(449)},150 L${X(446)},172 L${X(440)},214 L${X(432)},213 L${X(429)},170 Z`) + // escápula (de canto)
    hueso(`M${X(431)},141 L${X(452)},132 L${X(470)},132 L${X(471)},138 L${X(452)},139 Z`) + // espina y acromion
    boneAlong([X(459), 150], [X(459), 232], [[0, 6, 6], [0.1, 6, 6], [0.9, 6, 6], [1, 8, 8]]) + // húmero
    hueso(circ(X(459), 152, 11)) + // cabeza humeral
    hueso(`M${X(449)},147 C${X(460)},143 ${X(472)},145 ${X(479)},151 L${X(477)},156 C${X(468)},152 ${X(458)},152 ${X(449)},154 Z`) + // coracoides
    hueso(`M${X(464)},130 C${X(474)},129 ${X(482)},136 ${X(488)},146 L${X(485)},150 C${X(479)},141 ${X(472)},136 ${X(464)},136 Z`); // clavícula
  return { piel: piel(d), cara: h.cara, brazo, huesos };
}

// ---------- hombro AP: de frente (desde el tubo) + de costado con la angulación ----------
function hombroAP(rotacion) {
  const cfg = {
    neutro: { mano: "canto", esp: false, epi: [7, 8], rad: [[186, 214], [185, 254]], t1: "Brazo en posición neutra", t2: ["palma hacia el muslo", "(pulgar hacia el tubo)"] },
    externo: { mano: "palma", esp: false, epi: [11, 12], rad: [[186, 214], [179, 254]], t1: "Rotación externa", t2: ["mano en supinación (palma", "al tubo), epicóndilos", "paralelos al RI"] },
    interno: { mano: "dorso", esp: true, epi: [4.5, 5.5], rad: [[186, 214], [195, 254]], t1: "Rotación interna", t2: ["mano en pronación (dorso", "al tubo), epicóndilos", "perpendiculares al RI"] },
  }[rotacion];
  // brazo derecho del paciente = lado izquierdo del dibujo
  const m = mano(185, 255, 98.7, 1.0, cfg.mano, cfg.esp, cfg.esp);
  const cuerpo = `M268,72 L268,90 C254,96 232,98 214,102 C198,106 187,116 186,130 L182,168 L178,206 L175,254 ${m.seg} L195,256 L206,208 L212,168 L220,146 L222,200 L222,316 L338,316 L338,200 L340,146 L346,168 L350,240 L352,316 L382,316 L378,240 L376,168 L374,130 C373,116 362,106 346,102 C328,98 306,96 292,90 L292,72 Z`;
  const [lat, med] = cfg.epi;
  const humero = boneAlong([202, 132], [192, 212], [[0, 5.5, 5.5], [0.74, 5.5, 5.5], [0.88, lat, med], [0.97, lat - 2, med - 2], [1, 6.5, 6.5]]);
  const [r1, r2] = cfg.rad;
  const huesos =
    hueso(`M215,114 L228,106 L258,104 L266,106 L258,146 L248,192 L241,190 L226,146 L217,134 Z`) + // escápula
    hueso(`M258,102 L212,96 C204,96 197,100 195,107 L204,108 L213,103 L258,107 Z`) + // espina y acromion
    humero + hueso(circ(202, 124, 12)) +
    boneAlong([198, 214], [191, 254], [[0, 4, 4], [0.1, 3, 3], [0.9, 3, 3], [1, 4, 4]]) + // cúbito
    boneAlong(r1, r2, [[0, 3.5, 3.5], [0.1, 2.5, 2.5], [0.85, 3, 3], [1, 5, 5]]) + // radio
    hueso(`M228,106 C223,110 219,116 220,123 L225,123 C225,116 229,112 235,109 Z`) + // coracoides
    hueso(`M270,96 C256,90 238,102 214,94 L212,100 C238,108 256,96 270,102 Z`) + // clavícula der.
    hueso(`M290,96 C304,90 322,102 346,94 L348,100 C322,108 304,96 290,102 Z`); // clavícula izq.
  // epicóndilos: centro del húmero distal ≈ (193.3,202.4); eje lateral-medial ≈ horizontal
  const epiMark = rotacion === "interno"
    ? `<circle cx="194" cy="203" r="6.5" fill="none" stroke="${BLUE}" stroke-width="2"/>`
    : refline(rotacion === "externo" ? 176 : 182, 201, rotacion === "externo" ? 212 : 206, 205);
  return svg(
    view("1 · De frente (desde el tubo)") +
    riTop(150, 60, 180, 136) + txt(16, 176, "RI 24 x 30", 12, INK) + txt(16, 190, "transversal", 12, INK) +
    piel(cuerpo) + huesos + m.det + cabezaFrente(280, 44, 26) + epiMark +
    `<circle cx="222" cy="135" r="4.5" fill="${RED}"/>` +
    note(218, 136, 140, 116, ["RC 2 cm debajo", "de la coracoides"], RED, "end") +
    lab(262, 99, 268, 124, "clavícula") + lab(226, 118, 268, 138, "coracoides") + lab(212, 128, 268, 152, "cabeza humeral") +
    lab(252, 172, 268, 176, "escápula") + lab(rotacion === "externo" ? 210 : 204, 205, 268, 214, "epicóndilos") +
    side(30, 44, "D") + txt(46, 48, "hombro derecho", 10.5, MUTE) +
    txt(16, 238, cfg.t1, 12, INK, "start", 700) + cfg.t2.map((l, i) => txt(16, 254 + i * 14, l, 11, MUTE)).join("") +
    panelSep("2 · De costado (espalda contra el RI)") + hombroCostadoAP()
  );
}
function hombroCostadoAP() {
  const c = costado(8);
  return wall(418, 44, 300, "") + txt(424, 38, "Bucky / RI", 10, MUTE, "middle") +
    c.piel + c.huesos + c.brazo + c.cara +
    `<circle cx="484" cy="163" r="4" fill="${RED}"/>` +
    beam(484, 163, 162.5, 220, { ref: 180, angLabel: "15-20°" }) +
    lab(492, 144, 512, 122, "clavícula") + lab(486, 155, 520, 186, "coracoides") + lab(474, 162, 520, 200, "cabeza humeral") + lab(452, 196, 520, 214, "escápula") +
    txt(530, 252, "RC 15-20° caudal, 2 cm debajo", 12, INK, "start", 700) +
    txt(530, 268, "de la apófisis coracoides", 12, INK, "start", 700) +
    txt(530, 290, "DFR 1 m · parrilla · resp. suspendida", 11, MUTE) +
    txt(530, 306, "Bontrager: RC ⟂, 2,5 cm debajo", 11, MUTE) + txt(530, 319, "(ver recuadro)", 11, MUTE);
}

// ---------- vista superior del paciente rotado contra el Bucky (perfil escapular / desfiladero) ----------
function superior(rotDeg) {
  // coordenadas locales: línea de hombros en x, frente (nariz) hacia +y; hombro derecho en -x
  const cx = 236;
  const r = (-rotDeg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const cy = 252 + 100 * s; // el hombro derecho (-100,0) toca el Bucky (y=252)
  const T = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
  const Ts = (x, y) => T(x, y).map(f1).join(",");
  // tronco + brazo no afectado hacia adelante (a la altura del hombro)
  const ms = mano(...T(84, 66), 90 - rotDeg, 0.9, "dorso", true, true);
  let d = `M${P([[-58, -36], [0, -38], [58, -36], [84, -30], [98, -18], [101, 2], [99, 22]].map(([x, y]) => T(x, y)))}`;
  d += ` L${Ts(98, 66)} ${ms.seg} L${Ts(70, 66)} L${Ts(70, 36)}`;
  d += ` L${P([[40, 38], [0, 40], [-58, 36], [-86, 28], [-99, 14], [-101, -8], [-90, -26]].map(([x, y]) => T(x, y)))} Z`;
  const [hx, hy] = T(0, 2), nose = [T(-7, 21), T(0, 36), T(7, 21)];
  const ear = (x) => { const [ex, ey] = T(x, 4).map(f1); return `<ellipse cx="${ex}" cy="${ey}" rx="4.5" ry="7" transform="rotate(${-rotDeg} ${ex} ${ey})" fill="${SK}" stroke="${SKO}" stroke-width="1.5"/>`; };
  const cabeza = ear(-23) + ear(23) + `<path d="M${P(nose)} Z" fill="${SK}" stroke="${SKO}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="23" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
    `<path d="M${P([T(-6, 22), T(0, 33), T(6, 22)])}" fill="${SK}" stroke="none"/>` + linea(`M${P([T(-6, 22.5), T(0, 35), T(6, 22.5)])}`, 1.6) +
    linea(`M${Ts(-3, -6)} C${Ts(6, -10)} ${Ts(8, 0)} ${Ts(2, 1)} C${Ts(-4, 2)} ${Ts(-4, -4)} ${Ts(0, -4)}`, 1.2); // remolino (coronilla)
  const huesos =
    hueso(`M${P([[-74, -6], [-66, -12], [-38, -36], [-32, -32], [-62, -4], [-70, 4]].map(([x, y]) => T(x, y)))} Z`) + // escápula (de canto, desde arriba)
    hueso(`M${P([[-88, -10], [-60, 12], [-30, 24], [-6, 30], [-6, 35], [-32, 30], [-62, 18], [-90, -4]].map(([x, y]) => T(x, y)))} Z`) + // clavícula
    hueso(circ(...T(-84, 2).map(f1), 11)); // cabeza humeral
  return { piel: piel(d), cabeza, huesos, det: ms.det, T };
}
function topPanel(rotDeg, beamLocal, extra) {
  const v = superior(rotDeg);
  const bx = f1(v.T(...beamLocal)[0]);
  const cont = v.T(-100, 0).map(f1);
  const arcR = 104, a = (rotDeg * Math.PI) / 180;
  const ax2 = f1(cont[0] + arcR * Math.cos(a)), ay2 = f1(cont[1] - arcR * Math.sin(a));
  const sc = v.T(-52, -20).map(f1), hh = v.T(-90, 8).map(f1), cl = v.T(-44, 27).map(f1), nz = v.T(0, 36).map(f1);
  return view("1 · Vista superior (desde arriba)") +
    `<rect x="30" y="252" width="320" height="12" fill="#cfd3dc"/>` + txt(36, 280, "Bucky vertical (RI)", 11, MUTE) +
    `<path d="M${cont[0] + arcR},252 A${arcR},${arcR} 0 0 0 ${ax2},${ay2}" fill="none" stroke="${BLUE}" stroke-width="1.8"/>` +
    v.piel + v.huesos + v.det + v.cabeza +
    `<line x1="${cont[0]}" y1="${cont[1]}" x2="${f1(cont[0] + 60 * Math.cos(a))}" y2="${f1(cont[1] - 60 * Math.sin(a))}" stroke="${BLUE}" stroke-width="1.2" stroke-dasharray="4 4"/>` +
    txt(f1(cont[0] + arcR + 8), 240, "45-60°", 13, BLUE, "start", 700) +
    lab(sc[0], sc[1], 112, 150, "escápula", "end") + lab(cl[0], cl[1], 112, 196, "clavícula", "end") + lab(hh[0], hh[1], 112, 232, "cabeza humeral", "end") +
    txt(nz[0] + 4, nz[1] + 10, "nariz", 10, MUTE) +
    `<line x1="${bx}" y1="40" x2="${bx}" y2="244" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>` + txt(bx + 8, 52, "PA: el haz entra por detrás", 11.5, RED, "start", 700) +
    extra;
}

const I = {};
I["Hombro|Frente neutro · AP"] = () => hombroAP("neutro");
I["Hombro|Frente externo · AP rotación externa"] = () => hombroAP("externo");
I["Hombro|Frente interno · AP rotación interna"] = () => hombroAP("interno");

I["Hombro|Perfil escapular · PA"] = () => {
  const c = costado(196);
  return svg(
    topPanel(45, [-36, -32],
      txt(30, 300, "Desde PA, rotar hasta apoyar el hombro afectado en el RI.", 11, INK) +
      txt(30, 314, "Brazo no afectado arriba, por delante.", 11, INK)) +
    panelSep("2 · Vista lateral (mirando al RI)") +
    wall(706, 44, 300, "") + txt(712, 38, "Bucky / RI", 10, MUTE, "middle") + c.piel + c.huesos + c.brazo + c.cara +
    refline(627, 140, 633, 212) + dot(630, 177) +
    beam(630, 177, 17.5, 200, { horizontal: true, angLabel: "15-20°" }) +
    azul(626, 168, 556, 50, "borde medial de la escápula (mitad)") +
    lab(636, 206, 610, 222, "escápula", "end") + lab(652, 160, 610, 238, "cabeza humeral", "end") +
    txt(402, 262, "RC 15-20° caudal, en la mitad", 12, INK, "start", 700) +
    txt(402, 278, "del borde medial de la escápula", 12, INK, "start", 700) +
    txt(402, 298, "Bontrager: RC ⟂ a la articulación", 11, MUTE) +
    txt(402, 312, "escapulohumeral (ver recuadro)", 11, MUTE)
  );
};

I["Hombro|Desfiladero"] = () => {
  const c = costado(196);
  return svg(
    topPanel(52, [-84, 2],
      txt(30, 300, "Hombro afectado contra el RI; un poco más", 11, INK) +
      txt(30, 314, "de rotación que el perfil escapular.", 11, INK)) +
    panelSep("2 · Vista lateral (de pie, mirando al RI)") +
    wall(706, 44, 300, "") + txt(712, 38, "Bucky / RI", 10, MUTE, "middle") + c.piel + c.huesos + c.brazo + c.cara +
    dot(655, 141) +
    beam(655, 141, 12.5, 210, { horizontal: true, angLabel: "10-15°" }) +
    azul(652, 136, 524, 40, "borde superior de la cabeza humeral") +
    lab(636, 206, 610, 222, "escápula", "end") + lab(664, 134, 610, 238, "acromion", "end") +
    txt(402, 262, "RC 10-15° caudal al borde", 12, INK, "start", 700) +
    txt(402, 278, "superior de la cabeza humeral:", 12, INK, "start", 700) +
    txt(402, 294, "abre la salida del supraespinoso.", 12, INK)
  );
};

// ---------- húmero: de frente desde el tubo (brazo derecho = izquierda del dibujo) ----------
function humeroFrente(perfil) {
  const elbow = [196, 202];
  const wr = perfil ? [210, 262] : [176, 262];
  const v = [wr[0] - elbow[0], wr[1] - elbow[1]], L = Math.hypot(...v), nn = [v[1] / L, -v[0] / L]; // normal hacia afuera (izquierda)
  const ang = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
  const m = mano(wr[0], wr[1], ang, 1.0, perfil ? "dorso" : "palma", perfil, perfil);
  const wA = [wr[0] - nn[0] * 10, wr[1] - nn[1] * 10], wB = [wr[0] + nn[0] * 10, wr[1] + nn[1] * 10];
  const d = `M288,74 L288,92 C274,98 254,100 238,104 C224,108 214,116 212,128 L198,160 L184,196 L${P([wA])} ${m.seg} L${P([wB])} L208,206 L226,170 L244,148 L248,220 L246,318 L354,318 L352,220 L356,148 L364,180 L368,318 L394,318 L390,200 L388,150 C386,122 376,108 362,104 C346,100 326,98 312,92 L312,74 Z`;
  const humero = boneAlong([230, 130], [197, 202], perfil
    ? [[0, 5.5, 5.5], [0.78, 5.5, 5.5], [0.9, 6, 7], [0.97, 5, 6], [1, 6, 6]]
    : [[0, 5.5, 5.5], [0.78, 5.5, 5.5], [0.9, 12, 12], [0.97, 9, 9], [1, 7, 7]]);
  const forearm = perfil
    ? boneAlong([201, 205], [210, 262], [[0, 4, 4], [0.1, 3, 3], [0.9, 3, 3], [1, 4, 4]]) + boneAlong([191, 204], [219, 260], [[0, 3.5, 3.5], [0.1, 2.5, 2.5], [0.85, 3, 3], [1, 5, 5]])
    : boneAlong([201, 205], [181, 263], [[0, 4, 4], [0.1, 3, 3], [0.9, 3, 3], [1, 4, 4]]) + boneAlong([191, 201], [171, 260], [[0, 3.5, 3.5], [0.1, 2.5, 2.5], [0.85, 3, 3], [1, 5, 5]]);
  const huesos =
    hueso(`M243,112 L256,104 L284,102 L292,104 L284,144 L274,192 L267,190 L254,146 L245,132 Z`) + // escápula
    hueso(`M284,100 L238,94 C230,94 223,98 221,105 L230,106 L239,101 L284,105 Z`) + // espina y acromion
    humero + hueso(circ(230, 121, 12)) + forearm +
    hueso(`M296,94 C282,88 264,100 240,92 L238,98 C264,106 282,94 296,100 Z`) + // clavícula der.
    hueso(`M304,94 C318,88 336,100 360,92 L362,98 C336,106 318,94 304,100 Z`);
  return { piel: piel(d), huesos, det: m.det, cabeza: cabezaFrente(300, 52, 23) };
}
const humeroComun = (h) =>
  riTop(116, 46, 190, 272, "RI 35 x 43 long.", 122, 62) +
  h.piel + h.huesos + h.det + h.cabeza +
  side(60, 70, "D") + txt(30, 96, "lado derecho", 10.5, MUTE) + txt(30, 108, "del paciente", 10.5, MUTE) +
  coll(158, 80, 116, 150) + cross(213, 166) +
  lab(222, 114, 204, 100, "cabeza humeral", "end") + lab(208, 150, 190, 142, "húmero", "end");

I["Húmero|Frente · AP"] = () => {
  const h = humeroFrente(false);
  return svg(
    view("Vista desde el tubo · de pie o decúbito, espalda contra el RI") +
    humeroComun(h) +
    refline(180, 189, 216, 205) + dot(187, 192) + dot(210, 202) +
    lab(176, 236, 156, 240, "radio", "end") + lab(188, 246, 200, 254, "cúbito") +
    note(224, 166, 420, 110, ["RC perpendicular en la mitad del húmero"], RED) +
    note(216, 205, 420, 160, ["Epicóndilos paralelos al RI"], BLUE) +
    note(170, 296, 420, 206, ["Brazo levemente abducido, mano supinada", "(palma hacia el tubo)"]) +
    note(274, 226, 420, 262, ["Colimar a 4 lados incluyendo", "hombro y codo"], AMB) +
    txt(420, 318, "Parrilla si el grosor > 10 cm.", 11.5, MUTE)
  );
};

I["Húmero|Perfil · AP o PA"] = () => {
  const h = humeroFrente(true);
  return svg(
    view("Vista desde el tubo · variante AP (espalda contra el RI)") +
    humeroComun(h) +
    `<circle cx="197" cy="200" r="8" fill="none" stroke="${BLUE}" stroke-width="2.2"/>` + dot(197, 200) +
    lab(201, 236, 176, 244, "radio y cúbito", "end") +
    note(224, 166, 420, 100, ["RC perpendicular en la mitad del húmero"], RED) +
    note(205, 200, 420, 146, ["Epicóndilos perpendiculares al RI", "(se superponen)"], BLUE) +
    note(222, 296, 420, 200, ["Codo ligeramente flexionado,", "palma mirando hacia atrás"]) +
    txt(420, 262, "Variante PA (erguido): codo a 90° y paciente", 12, INK, "start", 700) +
    txt(420, 278, "rotado 15-20° para que el húmero toque el RI.", 12, INK) +
    txt(420, 312, "Factores técnicos y colimación: igual que el frente.", 11.5, MUTE)
  );
};

// ---------- codo / antebrazo: brazo extendido sobre la mesa, visto desde el tubo ----------
function brazoMesa() {
  // mano supinada (palma arriba); brazo derecho: pulgar (lateral) hacia abajo en el dibujo
  const m = mano(490, 177, 0, 2.1, "palma", false, true);
  const d = `M0,146 L300,149 C318,149 330,148 344,151 C372,154 400,156 430,157 L490,${m.a.split(",")[1]} ${m.seg} L430,197 C400,198 372,200 344,203 C330,205 318,205 300,205 L0,206 Z`;
  const huesos =
    boneAlong([7, 176], [338, 176], [[0, 7, 7], [0.8, 7, 7], [0.92, 20, 22], [0.97, 15, 16], [1, 11, 11]]) + // húmero (+n = abajo = lateral)
    boneAlong([336, 166], [486, 166], [[0, 9, 9], [0.12, 7, 7], [0.22, 5, 5], [0.88, 4, 4], [1, 5, 5]]) + // cúbito (medial, arriba)
    boneAlong([344, 188], [486, 187], [[0, 6, 6], [0.06, 6, 6], [0.14, 4, 4], [0.8, 5, 5], [1, 9, 9]]); // radio (lateral, lado del pulgar)
  return { piel: piel(d), huesos, det: m.det };
}

I["Codo|Frente · AP"] = () => {
  const b = brazoMesa();
  return svg(
    view("Vista desde el tubo · brazo extendido sobre la mesa") +
    riTop(226, 92, 220, 170, "RI 24 x 30 long.", 232, 256) +
    b.piel + b.huesos + b.det +
    refline(311, 144, 311, 208) + dot(311, 154) + dot(311, 197) + txt(226, 82, "epicóndilos paralelos al RI", 11, BLUE) +
    coll(262, 118, 150, 116) +
    cross(336, 176) +
    lab(200, 172, 200, 130, "húmero", "end") + lab(306, 156, 250, 112, "epicóndilo medial", "end") +
    lab(306, 198, 250, 238, "epicóndilo lateral", "end") + lab(440, 165, 456, 130, "cúbito") + lab(440, 188, 456, 232, "radio") +
    note(346, 176, 470, 60, ["RC perpendicular a la mitad", "de la articulación del codo"], RED) +
    note(530, 186, 540, 262, ["Codo extendido, mano supinada", "(palma arriba)"]) +
    txt(20, 304, "Si no extiende del todo: dos AP, una con RC ⟂ al húmero y otra ⟂ al antebrazo.", 11.5, MUTE) +
    txt(20, 319, "Parrilla: no.", 11.5, MUTE)
  );
};

I["Antebrazo|Frente · AP"] = () => {
  const b = brazoMesa();
  return svg(
    view("Vista desde el tubo · sentado al extremo de la mesa") +
    riTop(232, 62, 300, 236, "RI 35 x 43 long.", 238, 290) +
    b.piel + b.huesos + b.det +
    refline(311, 144, 311, 208) + dot(311, 154) + dot(311, 197) +
    azul(306, 152, 176, 120, "epicóndilos a igual distancia del RI") +
    coll(288, 126, 220, 100) +
    cross(412, 176) +
    lab(200, 172, 200, 230, "húmero", "end") + lab(380, 165, 380, 112, "cúbito", "end") + lab(380, 188, 380, 250, "radio", "end") +
    note(422, 176, 560, 90, ["RC perpendicular en la", "zona media del antebrazo"], RED) +
    note(508, 226, 560, 270, ["Incluir húmero distal y", "muñeca (~2,5 cm)"], AMB) +
    txt(30, 270, "Brazo extendido,", 12, INK, "start", 700) + txt(30, 286, "mano supinada", 12, INK) +
    txt(30, 312, "Parrilla: no.", 11.5, MUTE)
  );
};

I["Codo|Perfil"] = () => {
  // húmero horizontal sobre la mesa, codo a 90°, antebrazo hacia arriba, mano de canto (pulgar hacia el tubo)
  const m = mano(330, 118, -90, 1.45, "canto", true, false);
  const d = `M0,172 L298,172 Q304,170 305,160 L${m.a} ${m.seg} L356,160 C359,196 355,222 338,230 L0,228 Z`;
  const huesos =
    boneAlong([8, 200], [330, 200], [[0, 8, 8], [0.85, 8, 8], [0.95, 13, 13], [1, 10, 10]]) +
    hueso(circ(322, 200, 9)) +
    boneAlong([340, 224], [337, 120], [[0, 9, 9], [0.1, 8, 8], [0.2, 5, 5], [0.9, 4, 4], [1, 5, 5]]) + // cúbito (olécranon abajo)
    boneAlong([318, 188], [322, 120], [[0, 6, 6], [0.06, 6, 6], [0.12, 4, 4], [0.85, 5, 5], [1, 7, 7]]); // radio
  return svg(
    view("Vista desde el tubo · sentado al lado de la mesa") +
    riTop(250, 60, 170, 230, "RI 24 x 30 long.", 256, 282) +
    piel(d) + huesos + m.det +
    `<circle cx="322" cy="200" r="7" fill="none" stroke="${BLUE}" stroke-width="2.2"/>` +
    `<path d="M282,200 A40,40 0 0 1 322,160" fill="none" stroke="${BLUE}" stroke-width="1.5"/>` + txt(280, 168, "90°", 12, BLUE, "end", 700) +
    coll(268, 112, 130, 140) +
    cross(322, 200) +
    lab(200, 204, 200, 250, "húmero", "end") + lab(344, 226, 380, 238, "olécranon") + lab(338, 140, 380, 140, "cúbito") + lab(321, 150, 380, 156, "radio") +
    note(332, 206, 470, 230, ["RC perpendicular a la articulación", "(igual que el frente)"], RED) +
    note(329, 196, 470, 120, ["Epicóndilos superpuestos", "(perpendiculares al RI)"], BLUE) +
    note(336, 76, 470, 50, ["Mano en lateral, pulgar arriba", "(Bontrager)"]) +
    txt(470, 290, "Colimar: codo + 5 cm de antebrazo y húmero", 11.5, AMB) +
    txt(30, 262, "← húmero sobre la mesa,", 11.5, MUTE) + txt(30, 276, "a la altura del hombro", 11.5, MUTE)
  );
};

module.exports = I;
