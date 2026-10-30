// Efecto lente del diseño Liquid Glass (css/vidrio.css): el borde de los botones redondos de vidrio desvía lo que hay atrás,
// como una gota. Usa un filtro SVG (feDisplacementMap) hecho a la medida de cada botón, con un mapa dibujado en un canvas.
// Solo Chrome (y Android) aplica filtros SVG en backdrop-filter; en Safari queda el desenfoque de la hoja de estilos.
const SELECTOR = ".ico, .portada-boton";
const SVG = "http://www.w3.org/2000/svg";
const soporta = /Chrome\//.test(navigator.userAgent) && !/Edg\//.test(navigator.userAgent);
let svg = null, pendiente = false;
const hechos = new Set();

// mapa de desplazamiento: neutro (gris) en el centro; cerca del borde cada punto toma lo que está más adentro
function mapa(w, h, r) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"), img = ctx.createImageData(w, h), banda = Math.max(6, Math.min(18, Math.min(w, h) / 2.5));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // distancia con signo al borde de un rectángulo redondeado (negativa adentro)
    const px = Math.abs(x + .5 - w / 2) - (w / 2 - r), py = Math.abs(y + .5 - h / 2) - (h / 2 - r);
    const fuera = Math.hypot(Math.max(px, 0), Math.max(py, 0)) + Math.min(Math.max(px, py), 0) - r;
    // dirección hacia afuera
    let nx = px > 0 ? Math.sign(x + .5 - w / 2) * px : 0, ny = py > 0 ? Math.sign(y + .5 - h / 2) * py : 0;
    if (px <= 0 && py <= 0) { if (px > py) nx = Math.sign(x + .5 - w / 2); else ny = Math.sign(y + .5 - h / 2); }
    const n = Math.hypot(nx, ny) || 1, f = (1 - Math.min(Math.max(-fuera / banda, 0), 1)) ** 2, i = (y * w + x) * 4;
    img.data[i] = 128 - 127 * f * nx / n; img.data[i + 1] = 128 - 127 * f * ny / n; img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function filtro(w, h, r) {
  const id = `lente-${w}-${h}-${r}`;
  if (hechos.has(id)) return id;
  if (!svg) { svg = document.createElementNS(SVG, "svg"); svg.setAttribute("width", 0); svg.setAttribute("height", 0); svg.setAttribute("aria-hidden", "true"); svg.style.position = "absolute"; document.body.append(svg); }
  const f = document.createElementNS(SVG, "filter");
  Object.entries({ id, x: 0, y: 0, width: w, height: h, filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" }).forEach(([k, v]) => f.setAttribute(k, v));
  f.innerHTML = `<feImage href="${mapa(w, h, r)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="mapa"/>
    <feDisplacementMap in="SourceGraphic" in2="mapa" scale="${Math.min(28, Math.min(w, h) / 2)}" xChannelSelector="R" yChannelSelector="G"/>`;
  svg.append(f); hechos.add(id);
  return id;
}

function aplicar() {
  pendiente = false;
  if (document.documentElement.dataset.diseno !== "vidrio") return;
  for (const el of document.querySelectorAll(SELECTOR)) {
    const { width, height } = el.getBoundingClientRect(), w = Math.round(width), h = Math.round(height);
    if (!w || !h || w > 700) continue;
    const r = Math.min(Math.round(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0), Math.floor(Math.min(w, h) / 2));
    el.style.backdropFilter = `url(#${filtro(w, h, r)}) blur(3px) saturate(180%)`;
  }
}
const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(aplicar); } };

export function iniciarLente(app) {
  if (!soporta) return;
  new MutationObserver(pedir).observe(app, { childList: true, subtree: true });
  new MutationObserver(pedir).observe(document.documentElement, { attributes: true, attributeFilter: ["data-diseno", "data-texto"] });
  addEventListener("resize", pedir);
  pedir();
}
