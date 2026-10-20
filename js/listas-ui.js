// Hojas de las listas de favoritos: elegir lista al tocar una estrella, y crear o editar una lista.
import { listas, COLORES } from "./almacen.js";
import { esc, icono, abrirHoja } from "./util.js";

const estrella = (l, on = true) => `<span class="lst-estrella" style="--lc: var(--lc-${l.color})">${icono.estrella(on)}</span>`;
const cuenta = (n) => `${n} ${n === 1 ? "proyección" : "proyecciones"}`;

// estrella tocada: se abren las listas; un toque en una lista guarda la ficha ahí y cierra.
// Tocar una lista donde ya está la saca, con confirmación.
export function tocarEstrella(pid, alCambiar) {
  const filas = listas.todas().map((l) => {
    const on = l.ids.includes(pid);
    return `<button class="lst-fila${on ? " on" : ""}" data-hl-lista="${esc(l.id)}" style="--lc: var(--lc-${l.color})">${estrella(l, on)}<span class="t">${esc(l.nombre)}<small>${cuenta(l.ids.length)}</small></span><span class="s">${on ? "Ya está · tocá para quitar" : ""}</span></button>`;
  }).join("");
  const { panel, cerrar } = abrirHoja("Agregar a una lista", `<div class="lst-elegir">${filas}
    <button class="lst-fila nueva" data-hl-nueva>${icono.mas}<span class="t">Crear lista nueva</span></button></div>`);
  panel.addEventListener("click", (e) => {
    const t = e.target.closest("[data-hl-lista],[data-hl-nueva]");
    if (!t) return;
    if (t.dataset.hlLista) {
      const l = listas.porId(t.dataset.hlLista);
      if (l.ids.includes(pid) && !confirm(`¿Quitar esta proyección de “${l.nombre}”?`)) return;
      listas.alternar(l.id, pid);
      cerrar(); alCambiar();
    } else hojaLista(null, alCambiar, pid);
  });
}

// quitar varias proyecciones de una lista (modo seleccionar de Favoritos)
export function quitarDeLista(id, pids) {
  for (const pid of pids) if (listas.tiene(id, pid)) listas.alternar(id, pid);
}

// crear (id = null) o editar una lista: nombre, color y borrar. "agregar" = proyección que se guarda en la lista nueva.
export function hojaLista(id, alCambiar, agregar) {
  const l = id ? listas.porId(id) : { nombre: "", color: COLORES.find((c) => !listas.todas().some((x) => x.color === c.id))?.id || "amarillo" };
  if (!l) return;
  const puedeBorrar = id && listas.todas().length > 1;
  const { panel, cerrar } = abrirHoja(id ? "Editar lista" : "Nueva lista", `<form class="lst-form" novalidate>
    <label class="ed-campo"><span>Nombre</span><input name="nombre" maxlength="60" required autocomplete="off" enterkeyhint="done" value="${esc(l.nombre)}" placeholder="Por ejemplo: Parcial de miembro superior"></label>
    <fieldset class="lst-colores"><legend>Color de la estrella</legend>
      ${COLORES.map((c) => `<label class="lst-color" style="--lc: var(--lc-${c.id})"><input type="radio" name="color" value="${c.id}"${c.id === l.color ? " checked" : ""}><span class="lst-muestra">${icono.estrella(true)}</span><span class="lst-color-n">${esc(c.nombre)}</span></label>`).join("")}
    </fieldset>
    <p class="ed-error" hidden>Escribí un nombre para la lista.</p>
    <div class="ed-acciones"><button type="submit" class="pri">${id ? "Guardar" : "Crear lista"}</button>${puedeBorrar ? `<button type="button" class="peligro" data-hl-borrar>Borrar lista</button>` : ""}</div>
  </form>`);
  const f = panel.querySelector("form");
  if (!id) f.elements.nombre.focus();
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = f.elements.nombre.value.trim(), color = f.elements.color.value;
    if (!nombre) { panel.querySelector(".ed-error").hidden = false; return f.elements.nombre.focus(); }
    if (id) listas.editar(id, { nombre, color });
    else { const nuevo = listas.crear(nombre, color); if (agregar) listas.alternar(nuevo, agregar); }
    cerrar(); alCambiar();
  });
  panel.querySelector("[data-hl-borrar]")?.addEventListener("click", () => {
    if (!confirm(`¿Borrar la lista “${l.nombre}”? Las proyecciones siguen en la app; solo se pierde esta lista (${cuenta(l.ids.length)}).`)) return;
    listas.borrar(id); cerrar(); alCambiar();
  });
}
