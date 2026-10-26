// Ilustraciones: bloque de la ficha (o marcador de pendiente) y visor ampliado con zoom por gesto o doble toque.
import { esc, icono } from "./util.js";

// ilustracion = null (pendiente) o { src, alt, verificada }
export function bloqueIlustracion(il, nombre) {
  if (!il?.src) {
    return `<figure class="ilus pendiente">${icono.imagen}<figcaption><b>Ilustración pendiente</b><br>Todavía no hay una ilustración preparada y verificada para esta proyección.</figcaption></figure>`;
  }
  return `<figure class="ilus"><button class="ilus-btn" data-ampliar="${esc(il.src)}" data-alt="${esc(il.alt || nombre)}" aria-label="Ampliar ilustración">
      <img src="${esc(il.src)}" alt="${esc(il.alt || nombre)}" loading="lazy"></button>
    <figcaption>${il.verificada ? "Tocá la imagen para ampliarla." : "Ilustración sin verificar · tocá para ampliar"}</figcaption></figure>`;
}

export function ampliar(src, alt) {
  const v = document.createElement("div");
  v.className = "visor";
  v.innerHTML = `<button class="ico visor-cerrar" aria-label="Cerrar">${icono.cerrar}</button><div class="visor-lienzo"><img src="${esc(src)}" alt="${esc(alt)}" draggable="false"></div>`;
  document.body.appendChild(v);
  const lienzo = v.querySelector(".visor-lienzo"), img = v.querySelector("img");
  // el zoom cambia el tamaño real de la imagen (no un transform): así el dibujo vectorial se vuelve a trazar nítido
  let w0 = 0, h0 = 0, escala = 1, x = 0, y = 0;
  const caja = () => lienzo.getBoundingClientRect();
  const medir = () => {
    const { width: W, height: H } = caja(), nw = img.naturalWidth || 760, nh = img.naturalHeight || 354;
    const k = Math.min((W * 0.96) / nw, (H * 0.9) / nh); w0 = nw * k; h0 = nh * k; aplicar();
  };
  const limitar = () => {
    const { width: W, height: H } = caja(), mx = Math.max(0, (w0 * escala - W) / 2 + 24), my = Math.max(0, (h0 * escala - H) / 2 + 24);
    x = Math.min(mx, Math.max(-mx, x)); y = Math.min(my, Math.max(-my, y));
  };
  const aplicar = () => {
    if (escala <= 1) { escala = 1; x = y = 0; }
    limitar();
    const { width: W, height: H } = caja(), w = w0 * escala, h = h0 * escala;
    Object.assign(img.style, { width: `${w}px`, height: `${h}px`, left: `${(W - w) / 2 + x}px`, top: `${(H - h) / 2 + y}px` });
  };
  // zoom alrededor de un punto de la pantalla (px, py): ese punto de la imagen queda quieto bajo el dedo
  const zoomEn = (nueva, px, py) => {
    const r = caja(), cx = px - r.left - r.width / 2, cy = py - r.top - r.height / 2;
    nueva = Math.min(6, Math.max(1, nueva));
    x = cx - ((cx - x) * nueva) / escala; y = cy - ((cy - y) * nueva) / escala; escala = nueva; aplicar();
  };
  img.complete ? medir() : img.addEventListener("load", medir);
  const cerrar = () => { v.remove(); document.removeEventListener("keydown", tecla); removeEventListener("resize", medir); };
  const tecla = (e) => e.key === "Escape" && cerrar();
  document.addEventListener("keydown", tecla); addEventListener("resize", medir);
  v.querySelector(".visor-cerrar").addEventListener("click", cerrar);
  v.querySelector(".visor-cerrar").focus();
  v.addEventListener("wheel", (e) => { e.preventDefault(); zoomEn(escala * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY); }, { passive: false });
  // gestos con Pointer Events: un dedo arrastra; dos dedos hacen zoom y arrastran a la vez (por el punto medio).
  // Cada vez que cambia la cantidad de dedos se toma una referencia nueva, así se puede seguir moviendo sin soltar.
  const punteros = new Map(); let ref = null, ultimoToque = 0;
  const medio = () => { const ps = [...punteros.values()]; return { x: ps.reduce((a, p) => a + p.clientX, 0) / ps.length, y: ps.reduce((a, p) => a + p.clientY, 0) / ps.length }; };
  const distancia = () => { const [a, b] = [...punteros.values()]; return b ? Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) : 0; };
  const referencia = () => { ref = punteros.size ? { m: medio(), d: distancia(), e: escala, x, y } : null; };
  v.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".visor-cerrar")) return;
    punteros.set(e.pointerId, e); v.setPointerCapture(e.pointerId); referencia();
  });
  v.addEventListener("pointermove", (e) => {
    if (!punteros.has(e.pointerId) || !ref) return;
    punteros.set(e.pointerId, e);
    const m = medio();
    if (punteros.size >= 2 && ref.d) {
      x = ref.x; y = ref.y; escala = ref.e;
      zoomEn(ref.e * (distancia() / ref.d), ref.m.x, ref.m.y);
      x += m.x - ref.m.x; y += m.y - ref.m.y; aplicar();
    } else if (escala > 1) { x = ref.x + m.x - ref.m.x; y = ref.y + m.y - ref.m.y; aplicar(); }
  });
  const fin = (e) => {
    if (!punteros.has(e.pointerId)) return;
    const solo = punteros.size === 1, quieto = ref && Math.hypot(e.clientX - ref.m.x, e.clientY - ref.m.y) < 10;
    punteros.delete(e.pointerId); referencia();
    // doble toque: acerca (x2,5) donde se tocó, o vuelve al tamaño normal
    if (solo && quieto && e.type === "pointerup") {
      const ahora = Date.now();
      if (ahora - ultimoToque < 320) { escala > 1 ? ((escala = 1), aplicar()) : zoomEn(2.5, e.clientX, e.clientY); ultimoToque = 0; }
      else ultimoToque = ahora;
    }
  };
  v.addEventListener("pointerup", fin); v.addEventListener("pointercancel", fin);
}
