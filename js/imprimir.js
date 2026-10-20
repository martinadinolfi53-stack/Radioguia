// Impresión de una lista de favoritos (#imprimir): todas sus fichas completas, una por hoja, con el diálogo de
// impresión del navegador (desde ahí se guarda como PDF). Funciona sin conexión: no usa ninguna biblioteca externa.
import { regionPorId, proyecciones, FUENTE } from "./datos.js";
import { listas } from "./almacen.js";
import { esc, icono, cabecera, abrirHoja } from "./util.js";
import { FACTORES_FICHA, RC_ETIQUETA } from "./ficha.js";

export const opcionesImpresion = { ilustraciones: true, criterios: true };

const lista = (items) => (items?.length ? `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
const rcHTML = (rc) => `${RC_ETIQUETA[rc?.direccion] ? `<p class="imp-rc-dir">${esc(RC_ETIQUETA[rc.direccion])}${rc.angulo ? ` · ${esc(rc.angulo)}` : ""}</p>` : ""}<p>${esc(rc?.texto || "Sin dato en la fuente.")}</p>`;
const figura = (il, alt) => (il?.src ? `<figure class="imp-ilus"><img src="${esc(il.src)}" alt="${esc(il.alt || alt)}"></figure>` : "");

function hoja(p, nombreLista) {
  const r = regionPorId[p.region];
  const o = opcionesImpresion;
  const factores = FACTORES_FICHA.filter(([k]) => p.factores?.[k] || (p.factores && k in p.factores && p.factores[k] === null)).map(([k, n]) =>
    `<div><dt>${esc(n)}</dt><dd>${esc(p.factores[k] ?? "").replace(/^(Sí|No)(?=\s|;|$)/, "<b>$1</b>")}</dd></div>`).join("");
  const tags = [...(p.categoria || []), p.tipo === "R" ? "Rutina" : p.tipo === "E" ? "Especial" : "", p.metodo || "", p.estado !== "validado" ? "Pendiente de revisión" : ""].filter(Boolean);
  const ilusPorVersion = p.versiones?.length && p.versiones.every((x) => x.ilustracion?.src);
  const posicion = p.versiones
    ? lista(p.comun) + p.versiones.map((x) => `<div class="imp-ver"><h4>${esc(x.nombre)}</h4>${lista(x.posicion)}${x.rc ? `<div class="imp-ver-rc"><b>Rayo central:</b> ${rcHTML(x.rc)}</div>` : ""}${o.ilustraciones ? figura(x.ilustracion, `${p.nombre} · ${x.nombre}`) : ""}</div>`).join("")
    : lista(p.posicion);
  return `<article class="imp-hoja">
    <header class="imp-cab"><p class="imp-region">${esc(r?.nombre || "")}${r?.detalle ? ` · ${esc(r.detalle)}` : ""}</p>
      <h2>${esc(p.nombre)}</h2>${tags.length ? `<p class="imp-tags">${tags.map(esc).join(" · ")}</p>` : ""}</header>
    ${factores ? `<section><h3>Factores técnicos</h3><dl class="imp-factores">${factores}</dl></section>` : ""}
    <section class="imp-rc"><h3>Rayo central</h3>${rcHTML(p.rc)}</section>
    <section><h3>Posición del paciente</h3>${posicion}</section>
    ${o.criterios && p.criterios?.length ? `<section><h3>Criterios de evaluación</h3>${p.criterios.map(([t, it]) => `<h4>${esc(t)}</h4>${lista(it)}`).join("")}</section>` : ""}
    ${o.ilustraciones && !ilusPorVersion ? figura(p.ilustracion, p.nombre) : ""}
    <footer class="imp-pie">${esc(FUENTE.corto)}, pág${p.fuente.paginas.length > 1 ? "s" : ""}. ${p.fuente.paginas.join(", ")} · ${esc(nombreLista)} · RadioGuía</footer>
  </article>`;
}

export function vistaImprimir() {
  const act = listas.activa();
  // en el orden del manual, no en el orden en que se guardaron
  const fichas = proyecciones.filter((p) => act.ids.includes(p.id));
  const o = opcionesImpresion;
  const op = (k, txt) => `<button class="opcion${o[k] ? " on" : ""}" data-imp-op="${k}" aria-pressed="${o[k]}">${txt}</button>`;
  return cabecera({ titulo: `Imprimir ${act.nombre}`, sub: `${fichas.length} ${fichas.length === 1 ? "ficha" : "fichas"}, una por hoja`, atras: "#favoritos" }) + `
  <main class="wrap imprimir">
    <section class="panel imp-opciones">
      <h2>Incluir</h2>
      <div class="opciones">${op("criterios", "Criterios de evaluación")}</div>
      <button class="btn pri" data-imprimir ${fichas.length ? "" : "disabled"}>${icono.imprimir}<span>Imprimir o guardar PDF</span></button>
      <p class="ayuda">Se abre el menú de impresión. Para tener el PDF, en el iPad tocá el botón Compartir de la vista previa y elegí Guardar en Archivos; en la computadora elegí «Guardar como PDF» como impresora.</p>
    </section>
    ${fichas.length ? `<p class="label">Vista previa</p><div class="imp-hojas">${fichas.map((p) => hoja(p, act.nombre)).join("")}</div>` : `<div class="vacio">Esta lista está vacía.</div>`}
  </main>`;
}

// antes de imprimir pregunta si van las ilustraciones
export function preguntarEImprimir(raiz, rehacer) {
  const { panel, cerrar } = abrirHoja("¿Incluir las ilustraciones?", `<div class="lst-elegir">
    <button class="lst-fila" data-imp-ilus="si">${icono.imagenChica}<span class="t">Con ilustraciones<small>Más hojas, con los esquemas de cada ficha</small></span></button>
    <button class="lst-fila" data-imp-ilus="no">${icono.imprimir}<span class="t">Sin ilustraciones<small>Solo el texto, ocupa menos hojas</small></span></button></div>`);
  panel.addEventListener("click", (e) => {
    const t = e.target.closest("[data-imp-ilus]");
    if (!t) return;
    opcionesImpresion.ilustraciones = t.dataset.impIlus === "si";
    cerrar(); rehacer(); imprimir(raiz);
  });
}

// espera a que carguen las ilustraciones para que no salgan hojas en blanco
async function imprimir(raiz) {
  await Promise.all([...raiz.querySelectorAll(".imp-hojas img")].map((img) => (img.complete ? null : img.decode().catch(() => {}))));
  print();
}
