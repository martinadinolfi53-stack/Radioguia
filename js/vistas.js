// Pantallas de navegación: Inicio, Región, Favoritos, resultados del buscador y Ajustes.
import { capitulos, regiones, regionPorId, proyecciones, proyeccionesDe, CATEGORIAS, norm, FUENTE } from "./datos.js";
import { favoritos, preferencias } from "./almacen.js";
import { esc, icono, cabecera, botonFav } from "./util.js";
import { panelEdicionAjustes } from "./edicion.js";
import { pwa } from "./pwa.js";

export const estado = { q: "", qFav: "", filtro: {} }; // texto de búsqueda y filtro de categoría por región

const filaProyeccion = (p, conRegion) => `<div class="row">
  <a href="#p-${p.id}"><span class="t">${esc(p.nombre)}</span>
    <span class="s">${conRegion ? esc(regionPorId[p.region]?.nombre) + " · " : ""}${esc([...(p.categoria || []), p.tipo === "R" ? "Rutina" : p.tipo === "E" ? "Especial" : ""].filter(Boolean).join(" · "))}</span></a>
  ${botonFav(p.id, favoritos.tiene(p.id))}</div>`;

const buscador = (id, valor, placeholder) => `<div class="search"><span class="lupa" aria-hidden="true">${icono.lupa}</span>
  <input id="${id}" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="${placeholder}" value="${esc(valor)}" aria-label="Buscar">
  <button class="borrar" data-borrar="${id}" ${valor ? "" : "hidden"} aria-label="Borrar búsqueda">${icono.cerrar}</button></div>`;

export function buscar(lista, q) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  return lista.filter((p) => terms.every((t) => p._todo.includes(t)))
    .map((p) => ({ p, s: terms.filter((t) => p._titulo.includes(t)).length }))
    .sort((a, b) => b.s - a.s).map((x) => x.p);
}

function resultados(lista, q) {
  const res = buscar(lista, q);
  if (!res.length) return `<div class="vacio">No hay proyecciones que coincidan con <b>“${esc(q)}”</b>. Probá con la región (por ejemplo “tórax”), la proyección (“lateral”) o el método (“Pigg-O-Stat”).</div>`;
  return `<p class="label">${res.length} ${res.length === 1 ? "resultado" : "resultados"}</p><div class="lista">${res.map((p) => filaProyeccion(p, true)).join("")}</div>`;
}

// menú desplegable de capítulos → regiones; "filtro" deja solo las proyecciones que cumplen (favoritos)
export const capAbiertos = new Set(); // capítulos desplegados en el inicio, para que sigan abiertos al volver
function menuRegiones(filtro) {
  const fav = filtro !== todos;
  return capitulos.map((c) => {
    const regs = c.regiones.map((r) => ({ r, n: proyeccionesDe(r.id).filter(filtro).length })).filter((x) => x.n);
    if (!regs.length) return "";
    const total = regs.reduce((a, x) => a + x.n, 0);
    return `<details class="cap" data-cap="${c.capitulo}" ${fav || capAbiertos.has(c.capitulo) ? "open" : ""}>
      <summary><span class="num">${c.capitulo}</span><span class="t">${esc(c.titulo)}</span><span class="cnt">${total}</span>${icono.chev}</summary>
      <div class="regs">${regs.map(({ r, n }) => `<a class="row reg" href="#r-${r.id}${fav ? "-fav" : ""}"><span class="t">${esc(r.nombre)}</span>
        <span class="s">${r.detalle ? esc(r.detalle) + " · " : ""}${n} ${n === 1 ? "proyección" : "proyecciones"}</span>${icono.chev}</a>`).join("")}</div>
    </details>`;
  }).join("");
}
const todos = () => true;

export function vistaInicio() {
  const q = estado.q.trim();
  const nFav = favoritos.lista().length;
  return cabecera({ titulo: "RadioGuía", sub: "Técnicas y proyecciones radiológicas", derecha: `<a class="ico" href="#ajustes" aria-label="Ajustes">${icono.ajustes}</a>` }) + `
  <div class="buscar-barra"><div class="wrap">${buscador("q-inicio", estado.q, "Región, proyección o método")}</div></div>
  <main class="wrap">
    ${q ? resultados(proyecciones, q) : `
      <div class="accesos">
        <a class="acceso" href="#favoritos">${icono.estrella(true)}<span>Favoritos</span><b>${nFav}</b></a>
        <a class="acceso" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
      </div>
      ${pwa.aviso()}
      ${menuRegiones(todos)}`}
    <p class="pie">${proyecciones.length} proyecciones · ${regiones.length} regiones · Fuente: ${esc(FUENTE.corto)}</p>
  </main>`;
}

export function vistaRegion(r, soloFav) {
  const todas = proyeccionesDe(r.id).filter((p) => !soloFav || favoritos.tiene(p.id));
  const cats = CATEGORIAS.filter((c) => todas.some((p) => p.categoria.includes(c)));
  const f = estado.filtro[r.id];
  const lista = f ? todas.filter((p) => p.categoria.includes(f)) : todas;
  const chip = (c, txt) => `<button class="chip${(f || "") === c ? " on" : ""}" data-filtro="${esc(r.id)}" data-cat="${esc(c)}">${esc(txt)}</button>`;
  return cabecera({ titulo: r.nombre, sub: soloFav ? "Favoritos" : r.detalle, atras: soloFav ? "#favoritos" : "#" }) + `
  <div class="filtros"><div class="wrap filtros-row">
    <div class="chips" role="group" aria-label="Filtrar por proyección">${cats.length > 1 ? chip("", "Todas") + cats.map((c) => chip(c, c)).join("") : cats.map((c) => `<span class="chip on">${esc(c)}</span>`).join("")}</div>
    <a class="btn-calc" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
  </div></div>
  <main class="wrap">
    ${lista.length ? `<div class="lista">${lista.map((p) => filaProyeccion(p)).join("")}</div>` : `<div class="vacio">No hay proyecciones en esta categoría.</div>`}
  </main>`;
}

export function vistaFavoritos() {
  const favs = proyecciones.filter((p) => favoritos.tiene(p.id));
  const q = estado.qFav.trim();
  let cuerpo;
  if (!favs.length) cuerpo = `<div class="vacio"><b>Todavía no tenés favoritos.</b><br>Abrí una proyección y tocá la estrella para que aparezca acá, ordenada por región.</div>`;
  else if (q) cuerpo = resultados(favs, q);
  else cuerpo = menuRegiones((p) => favoritos.tiene(p.id));
  return cabecera({ titulo: "Favoritos", sub: `${favs.length} ${favs.length === 1 ? "proyección" : "proyecciones"}`, atras: "#" }) +
    (favs.length ? `<div class="buscar-barra"><div class="wrap">${buscador("q-fav", estado.qFav, "Buscar en favoritos")}</div></div>` : "") +
    `<main class="wrap">${cuerpo}</main>`;
}

export function vistaAjustes() {
  const op = (k, v, txt) => `<button class="opcion${preferencias.get(k) === v ? " on" : ""}" data-pref="${k}" data-val="${v}" aria-pressed="${preferencias.get(k) === v}">${txt}</button>`;
  return cabecera({ titulo: "Ajustes", atras: "#" }) + `
  <main class="wrap">
    <section class="panel"><h2>Tema</h2><div class="opciones">${op("tema", "oscuro", "Oscuro")}${op("tema", "claro", "Claro")}${op("tema", "sistema", "Como el teléfono")}</div></section>
    <section class="panel"><h2>Tamaño del texto</h2><div class="opciones">${op("texto", "normal", "Normal")}${op("texto", "grande", "Grande")}</div></section>
    <section class="panel"><h2>Sin conexión</h2><p>${pwa.estadoOffline()}</p></section>
    ${panelEdicionAjustes()}
    <section class="panel"><h2>Fuente</h2><p>${esc(FUENTE.libro)}, ${esc(FUENTE.edicion)} (${esc(FUENTE.autores)}; ${esc(FUENTE.editorial)}). Contenido redactado a partir del manual, pendiente de revisión.</p></section>
    <p class="pie">Favoritos y ajustes se guardan solo en este dispositivo.</p>
  </main>`;
}
