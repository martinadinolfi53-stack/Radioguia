// Copiado de /mnt/project-files/tecnicas-1/ilus/estilo.js (estilo aprobado por Martin). Fondo blanco agregado para el modo oscuro.
// Primitivas compartidas por los esquemas (estilo del primer ejemplo: contorno continuo con cara, ojo y oreja).
// Convenciones: flecha roja = rayo central (RC); ⊕ rojo = RC perpendicular que entra al papel;
// barra negra = receptor de imagen (RI); rectángulo punteado ámbar = colimación; azul punteado = línea de referencia.

const SK = "#f6e3d3", SKO = "#9a7a63", RED = "#d23b2f", BLUE = "#1f5fa8", AMB = "#c98a00", INK = "#1b1d22", MUTE = "#5d6270";
const W = 760, H = 330;

// ---------- primitivas ----------
// cuerpo = lista de segmentos [x1,y1,x2,y2,ancho] y círculos [cx,cy,r]; se dibuja contorno + relleno para que se fundan
function body(parts) {
  const out = [], fill = [];
  for (const p of parts) {
    if (p.length === 3) {
      out.push(`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2] + 1.5}" fill="${SKO}"/>`);
      fill.push(`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${SK}"/>`);
    } else {
      const [x1, y1, x2, y2, w] = p;
      out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SKO}" stroke-width="${w + 3}" stroke-linecap="round"/>`);
      fill.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SK}" stroke-width="${w}" stroke-linecap="round"/>`);
    }
  }
  return `<g>${out.join("")}${fill.join("")}</g>`;
}
const table = (x1, x2, y, label = "Mesa") =>
  `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="12" fill="#cfd3dc"/><text x="${x1 + 6}" y="${y + 10}" font-size="10" fill="${MUTE}">${label}</text>`;
const wall = (x, y1, y2, label = "Bucky vertical") =>
  `<rect x="${x}" y="${y1}" width="12" height="${y2 - y1}" fill="#cfd3dc"/><text x="${x + 6}" y="${y2 + 14}" font-size="10" fill="${MUTE}" text-anchor="middle">${label}</text>`;
const ri = (x, y, w, h, label, lx, ly) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${INK}"/>` + (label ? `<text x="${lx ?? x + w + 8}" y="${ly ?? y + h - 1}" font-size="12" fill="${INK}">${label}</text>` : "");
// tubo + RC que llega a (tx,ty). dir = dirección de viaje del haz en grados SVG (90 = hacia abajo, 0 = hacia la derecha).
// ref = dirección de referencia (perpendicular al RI) para dibujar el ángulo; si es igual a dir no se dibuja.
function beam(tx, ty, dir = 90, len = 170, opts = {}) {
  const ref = opts.ref ?? (opts.horizontal ? 0 : 90);
  const rad = (d) => (d * Math.PI) / 180;
  const ux = Math.cos(rad(dir)), uy = Math.sin(rad(dir));
  const cx = tx - len * ux, cy = ty - len * uy;
  const rot = dir - 90;
  let s = `<g transform="rotate(${rot} ${cx} ${cy})"><rect x="${cx - 42}" y="${cy - 22}" width="84" height="40" rx="6" fill="#e9ebf0" stroke="#8a8f9c"/>` +
    `<text x="${cx}" y="${cy + 3}" font-size="12" text-anchor="middle" fill="${MUTE}">Tubo</text>` +
    (opts.anodo ? `<text x="${cx - 36}" y="${cy + 13}" font-size="9" fill="${MUTE}">${opts.anodo[0]}</text><text x="${cx + 36}" y="${cy + 13}" font-size="9" fill="${MUTE}" text-anchor="end">${opts.anodo[1]}</text>` : "") +
    `</g><line x1="${cx + 24 * ux}" y1="${cy + 24 * uy}" x2="${tx - 8 * ux}" y2="${ty - 8 * uy}" stroke="${RED}" stroke-width="3" marker-end="url(#ar)"/>`;
  if (Math.abs(dir - ref) > 0.1) {
    const r = len * 0.6;
    const rx = tx - r * Math.cos(rad(ref)), ry = ty - r * Math.sin(rad(ref));
    const bx = tx - r * ux, by = ty - r * uy;
    const sweep = (Math.cos(rad(ref)) * uy - Math.sin(rad(ref)) * ux) > 0 ? 1 : 0;
    const mx = tx - (r + 16) * Math.cos(rad((ref + dir) / 2)), my = ty - (r + 16) * Math.sin(rad((ref + dir) / 2));
    s += `<line x1="${tx}" y1="${ty}" x2="${rx}" y2="${ry}" stroke="${RED}" stroke-width="1.2" stroke-dasharray="4 4"/>` +
      `<path d="M${rx},${ry} A${r},${r} 0 0 ${sweep} ${bx},${by}" fill="none" stroke="${RED}" stroke-width="1.3"/>` +
      `<text x="${mx}" y="${my + 4}" font-size="13" font-weight="700" fill="${RED}" text-anchor="middle">${opts.angLabel || Math.abs(dir - ref) + "°"}</text>`;
  }
  return s;
}
const tube = (tx, ty, a = 0, len = 170, opts = {}) => beam(tx, ty, 90 - a, len, opts);
// RC perpendicular al plano del dibujo (vista desde el tubo)
const cross = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${RED}" stroke-width="2.5"/><line x1="${x - 15}" y1="${y}" x2="${x + 15}" y2="${y}" stroke="${RED}" stroke-width="1.6"/><line x1="${x}" y1="${y - 15}" x2="${x}" y2="${y + 15}" stroke="${RED}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="2.5" fill="${RED}"/>`;
const coll = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${AMB}" stroke-width="2" stroke-dasharray="7 5"/>`;
const refline = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BLUE}" stroke-width="2.2" stroke-dasharray="6 5"/>`;
// llamada: línea desde el punto (px,py) hasta el texto en (tx,ty)
function note(px, py, tx, ty, lines, color = INK, anchor = "start") {
  const [first, ...rest] = lines;
  // caja aproximada del texto, para que la línea llegue al borde más cercano y nunca lo tache
  const ancho = (t, k) => String(t).replace(/<[^>]*>/g, "").length * k;
  const w = Math.max(ancho(first, 7.9), ...rest.map((l) => ancho(l, 7)));
  const x0 = anchor === "start" ? tx : anchor === "end" ? tx - w : tx - w / 2, x1 = x0 + w;
  const y0 = ty - 12, y1 = ty + 16 * rest.length + 4;
  let lx, ly;
  if (px <= x0) { lx = x0 - 4; ly = ty - 4; }
  else if (px >= x1) { lx = x1 + 4; ly = ty - 4; }
  else { lx = px; ly = py < y0 ? y0 - 2 : y1 + 2; }
  return `<line x1="${px}" y1="${py}" x2="${lx.toFixed(1)}" y2="${ly.toFixed(1)}" stroke="${color}" stroke-width="1.1"/>` +
    `<text x="${tx}" y="${ty}" font-size="13.5" fill="${color}" text-anchor="${anchor}"><tspan font-weight="700">${first}</tspan>` +
    rest.map((l) => `<tspan x="${tx}" dy="16" fill="${INK}">${l}</tspan>`).join("") + `</text>`;
}
const view = (t) => `<text x="12" y="20" font-size="12" font-weight="700" fill="${MUTE}" letter-spacing=".06em">${t.toUpperCase()}</text>`;
const txt = (x, y, t, size = 12, color = MUTE, anchor = "start", weight = 400) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}">${t}</text>`;

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + 24}" font-family="IBM Plex Sans, Carlito, Helvetica, Arial, sans-serif">` + `<rect width="100%" height="100%" fill="#fff"/>` +
    `<defs><marker id="arb" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${BLUE}"/></marker><marker id="ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${RED}"/></marker></defs>` +
    inner +
    `<text x="12" y="${H + 18}" font-size="10.5" fill="${MUTE}">Esquema didáctico, no a escala · pendiente de validación docente · → / ⊕ rayo central · ▬ RI · ┅ colimación</text></svg>`;
}

// ---------- ilustraciones ----------
// RI visto desde arriba (vista desde el tubo)
const riTop = (x, y, w, h, label, lx, ly) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eceef2" stroke="${INK}" stroke-width="2"/>` +
  (label ? `<text x="${lx ?? x + 6}" y="${ly ?? y + h - 6}" font-size="12" fill="${INK}">${label}</text>` : "");
const dot = (x, y, c = BLUE) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`;
const side = (x, y, t) => `<g><circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${INK}" stroke-width="1.5"/><text x="${x}" y="${y + 4.5}" font-size="12" font-weight="700" text-anchor="middle" fill="${INK}">${t}</text></g>`;

// ---------- estilo persona ----------
// piel: contorno continuo relleno (usar UN path por silueta; las superposiciones internas con linea())
const piel = (d, extra = "") => `<path d="${d}" fill="${SK}" stroke="${SKO}" stroke-width="2" stroke-linejoin="round" ${extra}/>`;
// línea interna (borde de un brazo apoyado sobre el tronco, pliegues): sin relleno
const linea = (d, w = 1.6) => `<path d="${d}" fill="none" stroke="${SKO}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// hueso o estructura de referencia, visto "por transparencia" dentro de la piel
const BONE = "#ece4d4", BONEO = "#8c7f6a";
const hueso = (d, extra = "") => `<path d="${d}" fill="${BONE}" stroke="${BONEO}" stroke-width="1.4" stroke-linejoin="round" opacity=".95" ${extra}/>`;
const etiquetaHueso = (x, y, t, anchor = "start") => `<text x="${x}" y="${y}" font-size="10.5" fill="${BONEO}" text-anchor="${anchor}" font-style="italic">${t}</text>`;

// Transformación afín: escala s, rotación rot (grados), espejo horizontal flip, y traslación al punto (tx,ty)
// del ancla (ax,ay) de las coordenadas originales.
function mk(s, ax, ay, tx, ty, rot = 0, flip = false) {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  return (x, y) => {
    let dx = (x - ax) * s * (flip ? -1 : 1), dy = (y - ay) * s;
    return `${(tx + dx * c - dy * sn).toFixed(1)},${(ty + dx * sn + dy * c).toFixed(1)}`;
  };
}
// Cabeza de perfil del primer ejemplo (Atlas y Axis). Coordenadas originales: nuca apoyada en (232,398),
// coronilla hacia la izquierda, cara hacia arriba, termina debajo del mentón en (360,346).
// Devuelve { d: tramo de path que EMPIEZA con M en la nuca y termina bajo el mentón (seguir el path con el cuello),
//            cara: ojo + oreja (dibujar después de la piel), P: la función de transformación }.
// opts: s (escala, 0.42 ≈ cuerpo entero), ancla en la nuca (tx,ty), rot, flip, boca:"cerrada"|"abierta".
function cabezaPerfil(tx, ty, opts = {}) {
  const { s = 0.42, rot = 0, flip = false, boca = "cerrada" } = opts;
  const T = mk(s, 232, 398, tx, ty, rot, flip);
  const mouth = boca === "abierta" ? `L${T(319, 263)} L${T(333, 268)} L${T(346, 290)}` : `L${T(319, 263)} L${T(328, 264)} L${T(346, 290)}`;
  const d = `M${T(232, 398)} C${T(168, 396)} ${T(138, 352)} ${T(148, 308)} C${T(156, 270)} ${T(186, 247)} ${T(226, 240)} L${T(266, 232)} C${T(276, 221)} ${T(289, 219)} ${T(293, 231)} L${T(301, 247)} L${T(313, 251)} ${mouth} L${T(354, 292)} C${T(372, 296)} ${T(386, 314)} ${T(380, 333)} C${T(376, 343)} ${T(368, 346)} ${T(360, 346)}`;
  const [ex, ey] = T(262, 250).split(",").map(Number);
  const cara = `<ellipse cx="${ex}" cy="${ey}" rx="${(7 * s * 1.1).toFixed(1)}" ry="${(3.5 * s * 1.1).toFixed(1)}" transform="rotate(${rot} ${ex} ${ey})" fill="${SKO}"/>` +
    `<path d="M${T(262, 305)} C${T(250, 295)} ${T(236, 300)} ${T(236, 318)} C${T(236, 334)} ${T(252, 340)} ${T(262, 330)}" fill="none" stroke="${SKO}" stroke-width="1.6"/>` +
    (boca === "abierta" ? `<path d="M${T(319, 263)} L${T(333, 268)} L${T(346, 290)} Z" fill="#7a3b33"/>` : "");
  return { d, cara, P: T };
}
// Cabeza vista de frente (desde arriba en decúbito supino, o paciente mirando al tubo): ojos, nariz, boca, orejas.
function cabezaFrente(cx, cy, r = 24, rot = 0) {
  return `<g transform="rotate(${rot} ${cx} ${cy})">` +
    `<ellipse cx="${cx - r * 0.98}" cy="${cy}" rx="${r * 0.16}" ry="${r * 0.28}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${cx + r * 0.98}" cy="${cy}" rx="${r * 0.16}" ry="${r * 0.28}" fill="${SK}" stroke="${SKO}" stroke-width="1.6"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.92}" ry="${r * 1.12}" fill="${SK}" stroke="${SKO}" stroke-width="2"/>` +
    `<ellipse cx="${cx - r * 0.34}" cy="${cy - r * 0.12}" rx="${r * 0.13}" ry="${r * 0.07}" fill="${SKO}"/>` +
    `<ellipse cx="${cx + r * 0.34}" cy="${cy - r * 0.12}" rx="${r * 0.13}" ry="${r * 0.07}" fill="${SKO}"/>` +
    `<path d="M${cx},${cy - r * 0.05} L${cx - r * 0.1},${cy + r * 0.3} L${cx + r * 0.06},${cy + r * 0.32}" fill="none" stroke="${SKO}" stroke-width="1.3"/>` +
    `<path d="M${cx - r * 0.25},${cy + r * 0.55} Q${cx},${cy + r * 0.68} ${cx + r * 0.25},${cy + r * 0.55}" fill="none" stroke="${SKO}" stroke-width="1.4"/></g>`;
}

// ---------- figuras del modelo anatómico (herramientas/ilus3d) ----------
// figura(id, opts) inserta el dibujo render/<id>.webp (generado con herramientas/ilus3d/figuras/<zona>.py) y devuelve
// { svg, p(nombre) -> [x, y] del punto de referencia en coordenadas del esquema, ppc (unidades por cm), x, y, w, h }.
// opts: caja [x, y, w, h] (encaja centrado) | en [nombre, X, Y] + ppc (el punto nombre cae en X,Y a esa escala).
const _fs = require("node:fs"), _path = require("node:path");
const RENDER = _path.join(__dirname, "..", "ilus3d", "render");
function figura(id, opts = {}) {
  const info = JSON.parse(_fs.readFileSync(_path.join(RENDER, id + ".json"), "utf8"));
  const [rw, rh] = info.res;
  let k, x, y;
  if (opts.caja) {
    const [bx, by, bw, bh] = opts.caja; k = Math.min(bw / rw, bh / rh);
    x = bx + (bw - rw * k) / 2; y = by + (bh - rh * k) / 2;
  } else {
    k = opts.ppc / info.ppc; const [n, X, Y] = opts.en; const q = info.puntos[n];
    if (!q) throw new Error(`figura ${id}: no tiene el punto ${n}`);
    x = X - q[0] * k; y = Y - q[1] * k;
  }
  const r = (v) => Math.round(v * 10) / 10;
  const b64 = _fs.readFileSync(_path.join(RENDER, id + ".webp")).toString("base64");
  const p = (n) => {
    const q = info.puntos[n]; if (!q) throw new Error(`figura ${id}: no tiene el punto ${n}`);
    return [r(x + q[0] * k), r(y + q[1] * k)];
  };
  // borde(lado, y0, y1): x extremo ('izq' = mínimo, 'der' = máximo) del dibujo entre las alturas y0 e y1 del esquema
  const borde = (lado, y0 = -1e9, y1 = 1e9) => {
    const fs = (info.silueta || []).filter(([yy]) => y + yy * k >= y0 && y + yy * k <= y1);
    if (!fs.length) throw new Error(`figura ${id}: sin silueta en ese rango`);
    return r(lado === "izq" ? x + Math.min(...fs.map((q) => q[1])) * k : x + Math.max(...fs.map((q) => q[2])) * k);
  };
  // filas: [[y, xmin, xmax], …] de la silueta en coordenadas del esquema
  const filas = (info.silueta || []).map(([yy, a, b]) => [y + yy * k, x + a * k, x + b * k]);
  // abajo(x0, x1): y más bajo del dibujo entre esas x (p. ej. dónde apoya sobre el RI una parte determinada)
  const rango = (x0, x1) => { const cs = (info.columnas || []).filter(([xx]) => x + xx * k >= x0 && x + xx * k <= x1);
    return [r(Math.min(...cs.map((c) => y + c[1] * k))), r(Math.max(...cs.map((c) => y + c[2] * k)))]; };
  const abajo = (x0, x1) => r(Math.max(...(info.columnas || []).filter(([xx]) => x + xx * k >= x0 && x + xx * k <= x1).map((c) => y + c[2] * k)));
  return { svg: `<image x="${r(x)}" y="${r(y)}" width="${r(rw * k)}" height="${r(rh * k)}" href="data:image/webp;base64,${b64}"/>`,
    p, borde, filas, abajo, rango, ppc: info.ppc * k, x: r(x), y: r(y), w: r(rw * k), h: r(rh * k) };
}

// corte(id, opts): corte transversal vectorial (render/<id>.json de escena.corte, en cm). opts: caja [x,y,w,h] | en [nombre|"apoyo", X, Y] + ppc.
// Devuelve { svg, p(nombre), apoyo: [x,y] (punto más bajo de la piel), ppc, hueso(nombreModelo) -> centro [x,y] }.
function corte(id, opts = {}) {
  const d = JSON.parse(_fs.readFileSync(_path.join(RENDER, id + ".json"), "utf8"));
  const todos = d.piel.flat();
  const mnx = Math.min(...todos.map((q) => q[0])), mxx = Math.max(...todos.map((q) => q[0]));
  const mny = Math.min(...todos.map((q) => q[1])), mxy = Math.max(...todos.map((q) => q[1]));
  let k, ox, oy;
  if (opts.caja) {
    const [bx, by, bw, bh] = opts.caja; k = Math.min(bw / (mxx - mnx), bh / (mxy - mny));
    ox = bx + (bw - (mxx - mnx) * k) / 2 - mnx * k; oy = by + (bh - (mxy - mny) * k) / 2 - mny * k;
  } else {
    k = opts.ppc; const [n, X, Y] = opts.en; const q = n === "apoyo" ? d.apoyo : d.puntos[n];
    ox = X - q[0] * k; oy = Y - q[1] * k;
  }
  const r = (v) => Math.round(v * 10) / 10, T = (q) => [r(ox + q[0] * k), r(oy + q[1] * k)];
  const path = (l) => "M" + l.map((q) => T(q).join(",")).join(" L") + " Z";
  const svg = d.piel.map((l) => piel(path(l))).join("") + Object.values(d.huesos).flat().map((l) => hueso(path(l))).join("");
  const centro = (n) => { const l = d.huesos[n]; if (!l) throw new Error(`corte ${id}: no corta ${n}`);
    const q = l.flat(); return T([q.reduce((a, b) => a + b[0], 0) / q.length, q.reduce((a, b) => a + b[1], 0) / q.length]); };
  // extremo(fx): punto del contorno de piel principal (el más grande) que maximiza fx([x, y]) en coordenadas del esquema,
  // p. ej. para apoyar una cuña tangente
  const extremo = (fx, todos = false) => (todos ? d.piel.flat() : d.piel[0]).map(T).reduce((m, q) => (fx(q) > fx(m) ? q : m));
  const primero = (...ns) => { const n = ns.find((q) => d.huesos[q]); return n ? centro(n) : null; };   // el primero de los huesos que el plano corta (o null)
  return { svg, p: (n) => T(d.puntos[n]), apoyo: T(d.apoyo), ppc: k, hueso: centro, primero, extremo,
    caja: [r(ox + mnx * k), r(oy + mny * k), r((mxx - mnx) * k), r((mxy - mny) * k)] };
}

// separación horizontal mínima entre la figura A (a la izquierda) y B (a la derecha), fila por fila (negativa = se superponen)
function hueco(A, B, y0 = -1e9, y1 = 1e9) {
  let m = Infinity;
  for (const [y, , xa] of A.filas) {
    if (y < y0 || y > y1) continue;
    const fb = B.filas.reduce((best, f) => (Math.abs(f[0] - y) < Math.abs(best[0] - y) ? f : best), [Infinity]);
    if (Math.abs(fb[0] - y) < 4) m = Math.min(m, fb[1] - xa);
  }
  return m;
}


// ---------- títulos y vistas en perspectiva ----------
const _f1 = (n) => +(+n).toFixed(1);
// títulos: el enfoque en negrita y la vista en una etiqueta de color (violeta = desde el tubo; verde azulado = la otra vista)
const VISTA = { tubo: "#6b3fb3", otra: "#0b7a6a" };
function titulo(x, enfoque, vista, tipo = "tubo") {
  const xe = enfoque ? x + enfoque.length * 6.7 + 12 : x, V = vista.toUpperCase(), w = V.length * 7.4 + 16;
  return (enfoque ? txt(x, 22, enfoque, 13.5, INK, "start", 700) : "") +
    `<rect x="${_f1(xe)}" y="9" width="${_f1(w)}" height="18" rx="9" fill="${VISTA[tipo]}"/>` +
    `<text x="${_f1(xe + 8)}" y="22" font-size="10.5" font-weight="700" fill="#fff" letter-spacing=".05em">${V}</text>`;
}
const separador = (x = 388) => `<line x1="${x}" y1="14" x2="${x}" y2="322" stroke="#e2e4ea"/>`;
// polígono de puntos de una figura (p. ej. el RI o una cuña en una vista en perspectiva)
const poli = (f, ns, fill, stroke = "#9aa0ac", w = 1.4) => `<path d="M${ns.map((n) => f.p(n).map(_f1).join(",")).join(" L")} Z" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
// figura escalada y ubicada para que los puntos ns (p. ej. las esquinas del RI en perspectiva) y el dibujo llenen la caja [x, y, w, h]
function encajar(id, ns, [bx, by, bw, bh]) {
  const g0 = figura(id, { en: [ns[0], 0, 0], ppc: 10 }), q = ns.map((n) => g0.p(n)).concat([[g0.x, g0.y], [g0.x + g0.w, g0.y + g0.h]]);
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(bw / w, bh / h);
  return figura(id, { en: [ns[0], bx + (bw - w * k) / 2 - Math.min(...xs) * k, by + (bh - h * k) / 2 - Math.min(...ys) * k], ppc: 10 * k });
}

module.exports = { titulo, separador, poli, encajar, SK, SKO, RED, BLUE, AMB, INK, MUTE, W, H, BONE, BONEO, body, table, wall, ri, riTop, beam, tube, cross, coll, refline, note, view, txt, svg, dot, side, piel, linea, hueso, etiquetaHueso, mk, cabezaPerfil, cabezaFrente, figura, corte, hueco };
