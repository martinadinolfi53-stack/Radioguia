// Hojas de las listas de favoritos: "Guardar en…" (al tocar una estrella con dos o más listas) y crear o editar una lista.
import { listas, COLORES } from "./almacen.js";
import { esc, icono, abrirHoja } from "./util.js";

const estrella = (l, on = true) => `<span class="lst-estrella" style="--lc: var(--lc-${l.color})">${icono.estrella(on)}</span>`;
const cuenta = (n) => `${n} ${n === 1 ? "proyección" : "proyecciones"}`;

// estrella tocada: con una sola lista agrega o quita directo; con varias pregunta en cuáles
export function tocarEstrella(pid, alCambiar) {
  const todas = listas.todas();
  if (todas.length === 1) { listas.alternar(todas[0].id, pid); return alCambiar(); }
  hojaGuardarEn(pid, alCambiar);
}

function hojaGuardarEn(pid, alCambiar) {
  const cuerpo = () => `<div class="lst-elegir">${listas.todas().map((l) => {
      const on = l.ids.includes(pid);
      return `<button class="lst-fila${on ? " on" : ""}" data-hl-alternar="${esc(l.id)}" aria-pressed="${on}">${estrella(l, on)}<span class="t">${esc(l.nombre)}</span><span class="s">${on ? "Guardada" : "Agregar"}</span></button>`;
    }).join("")}
    <button class="lst-fila nueva" data-hl-nueva>${icono.mas}<span class="t">Nueva lista</span></button></div>`;
  const { panel } = abrirHoja("Guardar en", cuerpo());
  panel.addEventListener("click", (e) => {
    const t = e.target.closest("[data-hl-alternar],[data-hl-nueva]");
    if (!t) return;
    if (t.dataset.hlAlternar) {
      listas.alternar(t.dataset.hlAlternar, pid);
      panel.querySelector(".lst-elegir").outerHTML = cuerpo();
      panel.querySelector(`[data-hl-alternar="${CSS.escape(t.dataset.hlAlternar)}"]`)?.focus();
      alCambiar();
    } else hojaLista(null, alCambiar, pid);
  });
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
