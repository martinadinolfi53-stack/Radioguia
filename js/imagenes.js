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
  v.innerHTML = `<button class="ico visor-cerrar" aria-label="Cerrar">${icono.cerrar}</button><div class="visor-lienzo"><img src="${esc(src)}" alt="${esc(alt)}"></div>`;
  document.body.appendChild(v);
  const img = v.querySelector("img");
  let escala = 1, x = 0, y = 0;
  const aplicar = () => (img.style.transform = `translate(${x}px, ${y}px) scale(${escala})`);
  const cerrar = () => { v.remove(); document.removeEventListener("keydown", tecla); };
  const tecla = (e) => e.key === "Escape" && cerrar();
  document.addEventListener("keydown", tecla);
  v.querySelector(".visor-cerrar").addEventListener("click", cerrar);
  v.querySelector(".visor-cerrar").focus();
  img.addEventListener("dblclick", () => { escala = escala > 1 ? 1 : 2.5; x = y = 0; aplicar(); });
  // pellizco y arrastre con Pointer Events
  const punteros = new Map(); let d0 = 0, e0 = 1, p0 = null;
  v.addEventListener("pointerdown", (e) => { punteros.set(e.pointerId, e); v.setPointerCapture(e.pointerId); p0 = { x: e.clientX - x, y: e.clientY - y }; if (punteros.size === 2) { const [a, b] = [...punteros.values()]; d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); e0 = escala; } });
  v.addEventListener("pointermove", (e) => {
    if (!punteros.has(e.pointerId)) return;
    punteros.set(e.pointerId, e);
    if (punteros.size === 2) { const [a, b] = [...punteros.values()]; escala = Math.min(5, Math.max(1, e0 * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / d0)); }
    else if (escala > 1 && p0) { x = e.clientX - p0.x; y = e.clientY - p0.y; }
    aplicar();
  });
  const fin = (e) => { punteros.delete(e.pointerId); if (escala === 1) { x = y = 0; aplicar(); } };
  v.addEventListener("pointerup", fin); v.addEventListener("pointercancel", fin);
}
