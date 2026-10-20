// Utilidades compartidas por las vistas.
import { listas } from "./almacen.js";

export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const icono = {
  atras: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  lupa: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
  estrella: (on) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>`,
  calc: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h3.5"/></svg>',
  ajustes: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  imagen: '<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/></svg>',
  imprimir: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
  lapiz: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  tilde: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  imagenChica: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/></svg>',
  mas: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  libro: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5z"/><path d="M4 5.5v16"/></svg>',
};

export function cabecera({ titulo, sub, atras, derecha = "" }) {
  return `<header class="top"><div class="wrap top-row">
    ${atras ? `<a class="ico" href="${atras}" data-atras aria-label="Volver">${icono.atras}</a>` : `<img class="logo" src="iconos/icono-192.png" alt="">`}
    <div class="titulo"><h1>${esc(titulo)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
    ${derecha}
  </div></header>`;
}

// estrella de una proyección: rellena con el color de la primera lista que la tiene
export function botonFav(id, clase = "starb") {
  const de = listas.de(id), on = de.length > 0;
  const nombres = de.map((l) => l.nombre).join(", ");
  return `<button class="${clase}${on ? " on" : ""}" data-fav="${esc(id)}"${on ? ` style="--lc: var(--lc-${de[0].color})"` : ""} aria-label="${on ? `En ${esc(nombres)}. Cambiar listas` : "Agregar a favoritos"}">${icono.estrella(on)}</button>`;
}

// hoja inferior (glosario, listas de favoritos); no cambia la posición de lectura. Devuelve { panel, cerrar }.
let hojaAbierta;
export function abrirHoja(titulo, cuerpo, alCerrar) {
  hojaAbierta?.cerrar();
  const hoja = document.createElement("div");
  hoja.className = "hoja";
  hoja.innerHTML = `<div class="hoja-fondo" data-cerrar-hoja></div>
    <div class="hoja-panel" role="dialog" aria-modal="true" aria-labelledby="hoja-t">
      <div class="hoja-cab"><h3 id="hoja-t">${esc(titulo)}</h3><button class="ico" data-cerrar-hoja aria-label="Cerrar">${icono.cerrar}</button></div>
      ${cuerpo}
    </div>`;
  document.body.appendChild(hoja);
  const anterior = document.activeElement;
  hoja.querySelector(".hoja-cab .ico").focus();
  const tecla = (e) => e.key === "Escape" && cerrar();
  const cerrar = () => {
    if (!hoja.isConnected) return;
    hoja.remove(); hojaAbierta = null; document.removeEventListener("keydown", tecla);
    anterior?.isConnected && anterior.focus?.({ preventScroll: true });
    alCerrar?.();
  };
  document.addEventListener("keydown", tecla);
  hoja.addEventListener("click", (e) => e.target.closest("[data-cerrar-hoja]") && cerrar());
  hojaAbierta = { panel: hoja.querySelector(".hoja-panel"), cerrar };
  return hojaAbierta;
}
