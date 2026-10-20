// Pantallas de navegación: Inicio, Región, Favoritos, resultados del buscador y Ajustes.
import { capitulos, regiones, regionPorId, proyecciones, proyeccionesDe, CATEGORIAS, norm, FUENTE } from "./datos.js";
import { listas, preferencias } from "./almacen.js";
import { esc, icono, cabecera, botonFav } from "./util.js";
import { panelEdicionAjustes } from "./edicion.js";
import { pwa } from "./pwa.js";
import { GRUPOS } from "./menu.js";

export const estado = { q: "", qFav: "", filtro: {}, sel: null }; // búsqueda, filtro de categoría por región y selección en Favoritos (Set o null)

const filaProyeccion = (p, conRegion) => `<div class="row">
  <a href="#p-${p.id}"><span class="t">${esc(p.nombre)}</span>
    <span class="s">${conRegion ? esc(regionPorId[p.region]?.nombre) + " · " : ""}${esc([...(p.categoria || []), p.tipo === "R" ? "Rutina" : p.tipo === "E" ? "Especial" : ""].filter(Boolean).join(" · "))}</span></a>
  ${botonFav(p.id)}</div>`;

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

// menú principal: botones por zona agrupados por región, con su color (ver js/menu.js); "filtro" deja solo las proyecciones que cumplen (favoritos)
function menuRegiones(filtro) {
  const fav = filtro !== todos;
  const botones = GRUPOS.map((g) => ({ g, n: g.regiones.reduce((a, id) => a + proyeccionesDe(id).filter(filtro).length, 0) })).filter((x) => x.n);
  const familias = [...new Set(botones.map((x) => x.g.familia))];
  return familias.map((f) => `<section class="familia" style="--c:${f.color}"><h2>${esc(f.nombre)}</h2><div class="grupos">${botones.filter((x) => x.g.familia === f).map(({ g, n }) =>
    `<a class="grupo" href="#g-${g.id}${fav ? "-fav" : ""}"><span class="t">${esc(g.nombre)}</span><span class="s">${n} ${n === 1 ? "proyección" : "proyecciones"}</span></a>`).join("")}</div></section>`).join("");
}
const todos = () => true;

export function vistaInicio() {
  const q = estado.q.trim();
  const act = listas.activa();
  return cabecera({ titulo: "RadioGuía", sub: "Técnicas y proyecciones radiológicas", derecha: `<a class="ico" href="#ajustes" aria-label="Ajustes">${icono.ajustes}</a>` }) + `
  <div class="buscar-barra"><div class="wrap">${buscador("q-inicio", estado.q, "Región, proyección o método")}</div></div>
  <main class="wrap">
    ${q ? resultados(proyecciones, q) : `
      <div class="accesos">
        <a class="acceso fav" href="#favoritos" style="--lc: var(--lc-${act.color})">${icono.estrella(true)}<span>${listas.todas().length > 1 ? esc(act.nombre) : "Favoritos"}</span><b>${act.ids.length}</b></a>
        <a class="acceso" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
      </div>
      ${pwa.aviso()}
      ${menuRegiones(todos)}`}
    <p class="pie">${proyecciones.length} proyecciones · ${regiones.length} regiones · Fuente: ${esc(FUENTE.corto)}</p>
  </main>`;
}

export function vistaRegion(r, soloFav) {
  const act = listas.activa();
  const todas = proyeccionesDe(r.id).filter((p) => !soloFav || act.ids.includes(p.id));
  const cats = CATEGORIAS.filter((c) => todas.some((p) => p.categoria.includes(c)));
  const f = estado.filtro[r.id];
  const lista = f ? todas.filter((p) => p.categoria.includes(f)) : todas;
  const chip = (c, txt) => `<button class="chip${(f || "") === c ? " on" : ""}" data-filtro="${esc(r.id)}" data-cat="${esc(c)}">${esc(txt)}</button>`;
  return cabecera({ titulo: r.nombre, sub: soloFav ? act.nombre : r.detalle, atras: soloFav ? "#favoritos" : "#" }) + `
  <div class="filtros"><div class="wrap filtros-row">
    <div class="chips" role="group" aria-label="Filtrar por proyección">${cats.length > 1 ? chip("", "Todas") + cats.map((c) => chip(c, c)).join("") : cats.map((c) => `<span class="chip on">${esc(c)}</span>`).join("")}</div>
    <a class="btn-calc" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
  </div></div>
  <main class="wrap">
    ${lista.length ? `<div class="lista">${lista.map((p) => filaProyeccion(p)).join("")}</div>` : `<div class="vacio">No hay proyecciones en esta categoría.</div>`}
  </main>`;
}

// índice de una región del menú: sus partes como subtítulos y las proyecciones de cada una
export function vistaGrupo(g, soloFav) {
  const act = listas.activa();
  const de = (id) => proyeccionesDe(id).filter((p) => !soloFav || act.ids.includes(p.id));
  const todas = g.regiones.flatMap(de);
  const cats = CATEGORIAS.filter((c) => todas.some((p) => p.categoria.includes(c)));
  const f = estado.filtro[g.id];
  const chip = (c, txt) => `<button class="chip${(f || "") === c ? " on" : ""}" data-filtro="${esc(g.id)}" data-cat="${esc(c)}">${esc(txt)}</button>`;
  const partes = g.regiones.map((id) => {
    const lista = de(id).filter((p) => !f || p.categoria.includes(f));
    if (!lista.length) return "";
    const r = regionPorId[id];
    return `<section class="parte"><h2 class="sub"><span>${esc(r.nombre)}</span>${r.detalle ? `<small>${esc(r.detalle)}</small>` : ""}</h2>
      <div class="lista">${lista.map((p) => filaProyeccion(p)).join("")}</div></section>`;
  }).join("");
  return cabecera({ titulo: g.nombre, sub: `${soloFav ? act.nombre + " · " : ""}${todas.length} ${todas.length === 1 ? "proyección" : "proyecciones"}`, atras: soloFav ? "#favoritos" : "#" }) + `
  <div class="filtros"><div class="wrap filtros-row">
    ${cats.length > 1 ? `<div class="chips" role="group" aria-label="Filtrar por proyección">${chip("", "Todas") + cats.map((c) => chip(c, c)).join("")}</div>` : ""}
    <a class="btn-calc" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
  </div></div>
  <main class="wrap" style="--c:${g.color}">
    ${partes || `<div class="vacio">No hay proyecciones en esta categoría.</div>`}
  </main>`;
}

// modo seleccionar de Favoritos: las proyecciones de la lista con casillas, para quitar varias juntas
function seleccionLista(favs) {
  const sel = estado.sel, n = sel.size, todas = n === favs.length;
  const porRegion = regiones.map((r) => [r, favs.filter((p) => p.region === r.id)]).filter(([, l]) => l.length);
  return `<div class="sel-barra">
      <button class="btn-sec" data-sel-todas>${todas ? "Quitar la selección" : "Seleccionar todas"}</button>
      <button class="btn-sec peligro" data-sel-quitar ${n ? "" : "disabled"}>Quitar de la lista${n ? ` (${n})` : ""}</button>
      <button class="btn-sec" data-sel-salir>Listo</button>
    </div>
    ${porRegion.map(([r, l]) => `<section class="parte"><h2 class="sub"><span>${esc(r.nombre)}</span>${r.detalle ? `<small>${esc(r.detalle)}</small>` : ""}</h2>
      <div class="lista">${l.map((p) => `<button class="row sel-fila${sel.has(p.id) ? " on" : ""}" data-sel="${esc(p.id)}" aria-pressed="${sel.has(p.id)}">
        <span class="casilla" aria-hidden="true">${sel.has(p.id) ? icono.tilde : ""}</span>
        <span class="sel-txt"><span class="t">${esc(p.nombre)}</span><span class="s">${esc([...(p.categoria || []), p.tipo === "R" ? "Rutina" : p.tipo === "E" ? "Especial" : ""].filter(Boolean).join(" · "))}</span></span></button>`).join("")}</div></section>`).join("")}`;
}

// lista activa de favoritos: selector de listas arriba, acciones (editar, nueva, seleccionar, imprimir) y el menú filtrado
export function vistaFavoritos() {
  const act = listas.activa(), todas = listas.todas();
  const favs = proyecciones.filter((p) => act.ids.includes(p.id));
  if (estado.sel) for (const id of estado.sel) if (!act.ids.includes(id)) estado.sel.delete(id);
  if (estado.sel && !favs.length) estado.sel = null;
  const q = estado.qFav.trim();
  let cuerpo;
  if (!favs.length) cuerpo = `<div class="vacio"><b>${todas.length > 1 ? `“${esc(act.nombre)}” está vacía.` : "Todavía no tenés favoritos."}</b><br>Abrí una proyección y tocá la estrella para guardarla${todas.length > 1 ? " en esta lista" : ""}; acá aparece ordenada por región.</div>`;
  else if (estado.sel) cuerpo = seleccionLista(favs);
  else if (q) cuerpo = resultados(favs, q);
  else cuerpo = menuRegiones((p) => act.ids.includes(p.id));
  const selector = estado.sel ? "" : `<div class="lst-selector" role="group" aria-label="Listas de favoritos">${todas.map((l) =>
      `<button class="lst-chip${l.id === act.id ? " on" : ""}" data-lista="${esc(l.id)}" aria-pressed="${l.id === act.id}" style="--lc: var(--lc-${l.color})">${icono.estrella(true)}<span>${esc(l.nombre)}</span><b>${l.ids.length}</b></button>`).join("")}
    <button class="lst-chip nueva" data-lista-nueva>${icono.mas}<span>Nueva lista</span></button></div>
    <div class="lst-acciones">
      <button class="btn-sec" data-lista-editar="${esc(act.id)}">${icono.lapiz}<span>Nombre y color</span></button>
      ${favs.length ? `<button class="btn-sec" data-sel-entrar>${icono.tilde}<span>Seleccionar</span></button>
      <a class="btn-sec" href="#imprimir">${icono.imprimir}<span>Imprimir o PDF</span></a>` : ""}
    </div>`;
  return cabecera({ titulo: todas.length > 1 ? act.nombre : "Favoritos", sub: estado.sel ? `${estado.sel.size} de ${favs.length} seleccionadas` : `${todas.length > 1 ? "Favoritos · " : ""}${favs.length} ${favs.length === 1 ? "proyección" : "proyecciones"}`, atras: "#" }) +
    (favs.length && !estado.sel ? `<div class="buscar-barra"><div class="wrap">${buscador("q-fav", estado.qFav, `Buscar en ${act.nombre}`)}</div></div>` : "") +
    `<main class="wrap" style="--lc: var(--lc-${act.color})">${selector}${cuerpo}</main>`;
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
    <p class="pie">Listas de favoritos y ajustes se guardan solo en este dispositivo.</p>
  </main>`;
}
