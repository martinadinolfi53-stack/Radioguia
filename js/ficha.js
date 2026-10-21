// Ficha técnica de una proyección. Orden fijo (prompt maestro, punto 5):
// A Factores técnicos (desplegable) · B Rayo central (siempre visible) · C Posición (desplegable)
// D Criterios (desplegable) · E Ilustración (siempre visible) · términos, fuente y avisos al final.
import { regionPorId, proyeccionesDe, FUENTE } from "./datos.js";
import { marcar, terminosDe, definicionHTML } from "./glosario.js";
import { bloqueIlustracion } from "./imagenes.js";
import { esc, icono, cabecera, botonFav } from "./util.js";

export const RC_ETIQUETA = { perpendicular: "Perpendicular", "cefálico": "Cefálico", caudal: "Caudal", horizontal: "Horizontal", angulado: "Angulado", variable: "Variable", "sin-dato": "" };
// flecha que muestra hacia dónde apunta el RC: abajo = perpendicular, inclinada hacia la cabeza o hacia los pies
const RC_FLECHA = {
  perpendicular: '<path d="M16 3v22M9 18l7 7 7-7"/>',
  "cefálico": '<path d="M24 26L10 6M9 15l1-9 9 2"/>',
  caudal: '<path d="M8 3l14 21M13 23l9 1 1-9"/>',
  horizontal: '<path d="M3 16h24M20 9l7 7-7 7"/>',
  angulado: '<path d="M8 3l14 21M13 23l9 1 1-9"/>',
  variable: '<path d="M16 3v22M9 18l7 7 7-7"/>',
};
const FACTORES = [["ri", "Tamaño del RI"], ["dfri", "DFRI"], ["respiracion", "Respiración"], ["angulacion", "Angulación del rayo"], ["rotacion", "Rotación de la región"]];
const FACTORES_EXTRA = [["parrilla", "Parrilla (Bucky)"], ["colimacion", "Colimación"]];
export const FACTORES_FICHA = [...FACTORES, ...FACTORES_EXTRA];

export function vistaFicha(p, volver) {
  const r = regionPorId[p.region];
  const v = new Set(); // términos ya marcados en la sección actual
  const m = (t) => marcar(t, v);
  const sec = (titulo, cuerpo, abierta) => { v.clear(); return `<details class="sec"${abierta ? " open" : ""}><summary><span>${titulo}</span>${icono.chev}</summary><div class="body">${cuerpo()}</div></details>`; };
  const lista = (items) => `<ul>${items.map((x) => `<li>${m(x)}</li>`).join("")}</ul>`;
  const hermanas = proyeccionesDe(p.region);
  const terminos = terminosDe(p);
  const dir = p.rc?.direccion || "perpendicular";
  // una versión de la posición (datos/versiones.js): sus pasos, su RC si difiere del general y su esquema
  const version = (x) => `<details class="sec ver"><summary><span>${esc(x.nombre)}</span>${icono.chev}</summary><div class="body">
    ${x.posicion.length ? lista(x.posicion) : ""}
    ${x.rc ? `<div class="ver-rc rc-${x.rc.direccion === "cefálico" ? "cefalico" : x.rc.direccion || "sin-dato"}"><h4>Rayo central</h4>${RC_ETIQUETA[x.rc.direccion] ? `<p class="rc-dir">${esc(RC_ETIQUETA[x.rc.direccion])}${x.rc.angulo ? ` <b>${esc(x.rc.angulo)}</b>` : ""}</p>` : ""}<p>${m(x.rc.texto)}</p></div>` : ""}
    ${x.ilustracion?.src ? bloqueIlustracion(x.ilustracion, `${p.nombre} · ${x.nombre}`) : ""}</div></details>`;

  return cabecera({ titulo: r?.nombre || "", sub: r?.detalle, atras: volver, derecha: botonFav(p.id, "ico fav") }) + `
  <main class="wrap ficha">
    <div class="ficha-cab">
      <h2>${esc(p.nombre)}</h2>
      <div class="tags">
        ${(p.categoria || []).map((c) => `<span class="tag">${esc(c)}</span>`).join("")}
        ${p.tipo ? `<span class="tag ${p.tipo === "R" ? "rut" : "esp"}">${p.tipo === "R" ? "Rutina" : "Especial"}</span>` : ""}
        ${p.metodo ? `<span class="tag">${esc(p.metodo)}</span>` : ""}
        ${p.estado !== "validado" ? `<span class="tag pend">Pendiente de revisión</span>` : ""}
      </div>
    </div>

    ${sec("Factores técnicos", () => `<dl class="tabla">${FACTORES_FICHA.filter(([k]) => p.factores?.[k] || (p.factores && k in p.factores && p.factores[k] === null))
      .map(([k, n]) => `<div class="it"><dt>${m(n)}</dt><dd>${p.factores[k] === null ? "" : m(p.factores[k]).replace(/^(Sí|No)(?=\s|;|$)/, "<b>$1</b>")}</dd></div>`).join("")}</dl>`)}

    <section class="rc rc-${dir === "cefálico" ? "cefalico" : dir}" aria-labelledby="rc-t">
      <div class="rc-cab">
        <svg class="rc-flecha" viewBox="0 0 32 32" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${RC_FLECHA[dir] || RC_FLECHA.perpendicular}</svg>
        <div><h3 id="rc-t">Rayo central</h3>
          <p class="rc-dir">${esc(RC_ETIQUETA[dir] || dir)}${p.rc?.angulo ? ` <b>${esc(p.rc.angulo)}</b>` : ""}</p></div>
      </div>
      <p class="rc-txt">${(v.clear(), m(p.rc?.texto || "Sin dato en la fuente."))}</p>
    </section>

    ${sec("Posición del paciente", () => p.versiones ? (p.comun?.length ? lista(p.comun) : "") + `<div class="versiones">${p.versiones.map(version).join("")}</div>` : lista(p.posicion || []))}

    ${sec("Criterios de evaluación", () => (p.criterios || []).map(([t, it]) => `<h4>${esc(t)}</h4>${lista(it)}`).join(""))}

    ${p.versiones?.length && p.versiones.every((x) => x.ilustracion?.src) ? "" : `<section class="ilus-sec" aria-label="Ilustración">${bloqueIlustracion(p.ilustracion, p.nombre)}</section>`}

    ${p.notas?.length ? `<aside class="nota"><h4>Nota sobre la fuente</h4>${p.notas.map((n) => `<p>${esc(n)}</p>`).join("")}</aside>` : ""}
    ${p.revision?.length ? `<aside class="revisar"><h4>Para revisar</h4>${p.revision.map((n) => `<p>${esc(n)}</p>`).join("")}</aside>` : ""}

    ${terminos.length ? `<details class="sec glos"><summary><span>Términos de esta ficha</span>${icono.chev}</summary><div class="body"><dl class="terms">${terminos.map((t) => `<div><dt>${esc(t.termino)}</dt><dd>${definicionHTML(t)}</dd></div>`).join("")}</dl></div></details>` : ""}

    ${hermanas.length > 1 ? `<details class="sec"><summary><span>Otras proyecciones de ${esc(r?.nombre)} (${hermanas.length - 1})</span>${icono.chev}</summary><div class="body"><nav class="serie" aria-label="Otras proyecciones de ${esc(r?.nombre)}">${hermanas.map((h) => `<a class="chip${h.id === p.id ? " on" : ""}" href="#p-${h.id}">${esc(h.nombre)}</a>`).join("")}</nav></div></details>` : ""}

    <div class="pie-ficha">
      <a class="btn" href="#calc-${p.id}">${icono.calc}<span>Calculadora de técnica</span></a>
      <p class="fuente">${icono.libro} ${esc(FUENTE.corto)}, pág${p.fuente.paginas.length > 1 ? "s" : ""}. ${p.fuente.paginas.join(", ")}</p>
    </div>
  </main>`;
}
