// Pantallas de navegación: Portada (elegir Enfoques o Juegos), Inicio de enfoques, Región, Favoritos, resultados del buscador y Ajustes.
import { capitulos, regiones, regionPorId, proyecciones, proyeccionesDe, CATEGORIAS, norm, FUENTE } from "./datos.js";
import { listas, preferencias } from "./almacen.js";
import { esc, icono, cabecera, botonFav, barraPestanas } from "./util.js";
import { pwa } from "./pwa.js";
import { GRUPOS, FAMILIAS } from "./menu.js";
import { nombre as nombreUsuario } from "./identificacion.js";
import * as nube from "./nube.js";
import { avatar } from "./foto.js";
import { FUENTES, fuenteId, elegida } from "./fuente.js";
import { nombresDe } from "./otras-fuentes.js";

export const estado = { q: "", qFav: "", filtro: {}, sel: null, favFuente: "" }; // búsqueda, filtro de categoría por región, selección en Favoritos (Set o null) y filtro por libro en Favoritos ("" = todos)

const filaProyeccion = (p, conRegion) => `<div class="row">
  <a href="#p-${p.id}"><span class="t">${esc(p.nombre)}</span>
    <span class="s">${conRegion ? esc(regionPorId[p.region]?.nombre) + " · " : ""}${esc([...(p.categoria || []), p.tipo === "R" ? "Rutina" : p.tipo === "E" ? "Especial" : ""].filter(Boolean).join(" · "))}</span></a>
  ${botonFav(p.id)}</div>`;

const buscador = (id, valor, placeholder) => `<div class="search"><span class="lupa" aria-hidden="true">${icono.lupa}</span>
  <input id="${id}" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="${placeholder}" value="${esc(valor)}" aria-label="Buscar">
  <button class="borrar" data-borrar="${id}" ${valor ? "" : "hidden"} aria-label="Borrar búsqueda">${icono.cerrar}</button></div>`;

// palabras que no ayudan a elegir una ficha ("proyección lateral de codo" = "lateral codo")
const VACIAS = new Set(["de", "del", "la", "las", "el", "los", "en", "con", "y", "o", "a", "al", "para", "por", "proyeccion", "proyecciones", "incidencia", "incidencias", "enfoque", "enfoques", "rx"]);
// "ap" o "pa" sueltas son palabras enteras (si no, "ap" aparece en "escápula", "apoyar"…); "laterales" también encuentra "lateral"
function contiene(texto, t) {
  if (t.length <= 2) return new RegExp(`(^|[^a-z0-9])${t.replace(/[^a-z0-9]/g, "\\$&")}($|[^a-z0-9])`).test(texto);
  return texto.includes(t) || (t.length > 5 && t.endsWith("es") && texto.includes(t.slice(0, -2))) || (t.length > 3 && t.endsWith("s") && texto.includes(t.slice(0, -1)));
}

// si una palabra es región, proyección o método de alguna ficha ("hombro"), se busca solo en el título:
// así no aparecen las de tórax o columna que nombran el hombro en la posición del paciente.
// Las demás palabras ("sentado", "Bucky") se buscan en toda la ficha.
export function buscar(lista, q) {
  const todas = norm(q).split(/\s+/).filter(Boolean);
  const terms = todas.filter((t) => !VACIAS.has(t));
  if (!terms.length) terms.push(...todas);
  const deTitulo = new Set(terms.filter((t) => proyecciones.some((p) => contiene(p._titulo, t))));
  return lista.filter((p) => terms.every((t) => contiene(deTitulo.has(t) ? p._titulo : p._todo, t)))
    .map((p) => ({ p, s: terms.filter((t) => contiene(p._titulo, t)).length }))
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
  if (!fav) {
    // menú por región: una fila por región grande; adentro se despliegan sus partes con los enfoques
    const filas = FAMILIAS.map((f) => ({ f, n: GRUPOS.filter((g) => g.familia === f).reduce((a, g) => a + g.regiones.reduce((b, id) => b + proyeccionesDe(id).length, 0), 0) })).filter((x) => x.n);
    return `<section class="familia"><h2>Regiones</h2><div class="grupos">${filas.map(({ f, n }) =>
      `<a class="grupo" style="--c:${f.color}" href="#f-${f.id}"><span class="t">${esc(f.nombre)}</span><span class="s">${n}</span></a>`).join("")}</div></section>`;
  }
  const botones = GRUPOS.map((g) => ({ g, n: g.regiones.reduce((a, id) => a + proyeccionesDe(id).filter(filtro).length, 0) })).filter((x) => x.n);
  const familias = [...new Set(botones.map((x) => x.g.familia))];
  return familias.map((f) => `<section class="familia" style="--c:${f.color}"><h2>${esc(f.nombre)}</h2><div class="grupos">${botones.filter((x) => x.g.familia === f).map(({ g, n }) =>
    `<a class="grupo" href="#g-${g.id}${fav ? "-fav" : ""}"><span class="t">${esc(g.nombre)}</span><span class="s">${n} ${n === 1 ? "proyección" : "proyecciones"}</span></a>`).join("")}</div></section>`).join("");
}

// una región grande (por ejemplo Miembro superior): cada parte se despliega y muestra sus enfoques
export function vistaFamilia(f) {
  const partes = GRUPOS.filter((g) => g.familia === f).map((g) => ({ g, lista: g.regiones.flatMap((id) => proyeccionesDe(id)) })).filter((x) => x.lista.length);
  const total = partes.reduce((a, x) => a + x.lista.length, 0);
  return cabecera({ titulo: f.nombre, sub: `${total} enfoques · ${FUENTE.corto}`, atras: "#enfoques" }) + `
  <main class="wrap" style="--c:${f.color}">
    ${partes.map(({ g, lista }, i) => `<details class="sec region"${i === 0 ? " open" : ""}><summary><span class="t">${esc(g.nombre)}</span><span class="s">${lista.length}</span>${icono.chev}</summary>
      <div class="lista">${lista.map((p) => filaProyeccion(p)).join("")}</div></details>`).join("")}
  </main>` + barraPestanas("enfoques");
}

const todos = () => true;

// lo primero al abrir la app (la pantalla del pulgar): elegir Enfoques (fichas y calculadora) o Juegos; cada parte vuelve acá con su flecha
const AYUDA_ICONO = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>';

const fotoPortada = () => { const p = nube.estado().perfil; return p?.foto ? avatar(p.foto, p.apodo, "portada-foto") : ""; };

export function vistaPortada() {
  return `<main class="portada">
    <div class="portada-barra">
      <a class="portada-boton" href="#ayuda-app" aria-label="Cómo usarla como app en el celular">${AYUDA_ICONO}<span>Usarla como app</span></a>
      <h1 class="portada-rx">RX</h1>
      <a class="portada-boton" href="#ajustes" aria-label="Ajustes">${icono.ajustes}<span>Ajustes</span></a>
    </div>
    <p class="portada-hola">${fotoPortada()}Hola ${esc(nombreUsuario())}, ¿qué quieres hacer hoy?</p>
    <div class="portada-ops">
      <a class="portada-op" href="#enfoques"><span class="portada-img"><img src="iconos/icono-512.png" alt="" width="512" height="512"></span><b>Enfoques</b><small>Fichas y calculadora</small></a>
      <a class="portada-op" href="#juegos"><span class="portada-img"><img src="iconos/juegos-512.jpg" alt="" width="512" height="512"></span><b>Juegos</b><small>Repaso, ranking y perfil</small></a>
    </div>
    <div class="portada-fuente" role="group" aria-label="Libro que estás consultando">${FUENTES.filter((f) => f.lista).map((f) => {
      const on = f.id === fuenteId;
      return `<button type="button" data-fuente="${f.id}" class="${on ? "on" : ""}" aria-pressed="${on}">${esc(f.nombre)}</button>`;
    }).join("")}</div>
  </main>`;
}

// botones para elegir la fuente (al entrar y en Ajustes); las que todavía no tienen fichas aparecen "en preparación"
const botonesFuente = () => FUENTES.map((f) => {
  const on = elegida() && f.id === fuenteId;
  return `<button class="fuente-op${on ? " on" : ""}" data-fuente="${f.id}" ${f.lista ? "" : "disabled"} aria-pressed="${on}">
    <b>${esc(f.nombre)}</b><small>${esc(f.detalle)}</small>${f.lista ? "" : "<em>En preparación</em>"}</button>`;
}).join("");

// después de identificarse: de qué libro salen las fichas, el repaso y los juegos (js/fuente.js)
export function vistaElegirFuente() {
  return `<main class="portada">
    <p class="portada-rx">RX</p>
    <p class="portada-hola">¿Qué libro querés consultar?</p>
    <div class="fuente-ops">${botonesFuente()}</div>
    <small class="ident-nota">Cada libro tiene sus propias fichas, favoritos y juegos. Lo podés cambiar cuando quieras en Ajustes.</small>
  </main>`;
}

// cómo instalarla desde el link en el celular o la tablet
export function vistaAyudaApp() {
  const link = location.origin + location.pathname;
  const ya = pwa.instalada();
  return cabecera({ titulo: "Usarla como app", sub: "En el celular o la tablet", atras: "#" }) + `
  <main class="wrap ayuda-app">
    ${ya ? `<p class="aviso-ok">Ya la estás usando como app. Funciona sin internet.</p>` : ""}
    <section class="panel"><h2>El link de la app</h2>
      <p>Compartilo con tus compañeros. Se abre en el navegador y desde ahí se agrega a la pantalla de inicio.</p>
      <div class="ayuda-link"><code>${esc(link)}</code><button class="btn" data-copiar-link="${esc(link)}">Copiar</button></div>
    </section>
    ${pwa.puedeInstalar() ? `<section class="panel"><h2>Instalar ahora</h2><p>Este navegador permite instalarla con un toque.</p><button class="rp-empezar" data-instalar>Instalar</button></section>` : ""}
    <section class="panel"><h2>iPhone o iPad</h2>
      <ol>
        <li>Abrí el link en <b>Safari</b> (en otros navegadores del iPhone puede no aparecer la opción).</li>
        <li>Tocá el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba).</li>
        <li>Elegí <b>Agregar a inicio</b> y después <b>Agregar</b>.</li>
        <li>Abrila desde el ícono del pulgar en tu pantalla de inicio.</li>
      </ol>
    </section>
    <section class="panel"><h2>Android</h2>
      <ol>
        <li>Abrí el link en <b>Chrome</b>.</li>
        <li>Tocá el menú <b>⋮</b> (arriba a la derecha).</li>
        <li>Elegí <b>Instalar app</b> o <b>Agregar a la pantalla principal</b> y confirmá.</li>
        <li>Abrila desde el ícono del pulgar.</li>
      </ol>
    </section>
    <section class="panel"><h2>Bueno saber</h2>
      <ul>
        <li>La primera vez abrila con internet: así se guardan todas las fichas y después funciona sin conexión.</li>
        <li>Tu identificación queda guardada; no hace falta entrar cada vez.</li>
        <li>Cuando hay una versión nueva, la app se actualiza sola al abrirla con internet.</li>
      </ul>
    </section>
  </main>`;
}

export function vistaInicio() {
  const q = estado.q.trim();
  const act = listas.activa();
  return cabecera({ titulo: "Enfoques", sub: `Técnicas y proyecciones · ${FUENTE.corto}`, atras: "#" }) + `
  <div class="buscar-barra"><div class="wrap">${buscador("q-inicio", estado.q, "Región, proyección o método")}</div></div>
  <main class="wrap">
    ${q ? resultados(proyecciones, q) : `
      <div class="accesos">
        <a class="acceso fav" href="#favoritos" style="--lc: var(--lc-${act.color})">${icono.estrella(true)}<span>${listas.todas().length > 1 ? esc(act.nombre) : "Favoritos"}</span><b>${act.total}</b></a>
        <a class="acceso" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
      </div>
      ${menuRegiones(todos)}`}
    <p class="pie">${proyecciones.length} proyecciones · ${regiones.length} regiones · Fuente: ${esc(FUENTE.corto)}</p>
  </main>` + barraPestanas("enfoques");
}

export function vistaRegion(r, soloFav) {
  const act = listas.activa();
  const todas = proyeccionesDe(r.id).filter((p) => !soloFav || act.ids.includes(p.id));
  const cats = CATEGORIAS.filter((c) => todas.some((p) => p.categoria.includes(c)));
  const f = estado.filtro[r.id];
  const lista = f ? todas.filter((p) => p.categoria.includes(f)) : todas;
  const chip = (c, txt) => `<button class="chip${(f || "") === c ? " on" : ""}" data-filtro="${esc(r.id)}" data-cat="${esc(c)}">${esc(txt)}</button>`;
  return cabecera({ titulo: r.nombre, sub: soloFav ? act.nombre : r.detalle, atras: soloFav ? "#favoritos" : `#f-${g.familia.id}` }) + `
  <div class="filtros"><div class="wrap filtros-row">
    <div class="chips" role="group" aria-label="Filtrar por proyección">${cats.length > 1 ? chip("", "Todas") + cats.map((c) => chip(c, c)).join("") : cats.map((c) => `<span class="chip on">${esc(c)}</span>`).join("")}</div>
    <a class="btn-calc" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
  </div></div>
  <main class="wrap">
    ${lista.length ? `<div class="lista">${lista.map((p) => filaProyeccion(p)).join("")}</div>` : `<div class="vacio">No hay proyecciones en esta categoría.</div>`}
  </main>` + barraPestanas("enfoques");
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
  return cabecera({ titulo: g.nombre, sub: `${soloFav ? act.nombre + " · " : ""}${todas.length} ${todas.length === 1 ? "proyección" : "proyecciones"}`, atras: soloFav ? "#favoritos" : `#f-${g.familia.id}` }) + `
  <div class="filtros"><div class="wrap filtros-row">
    ${cats.length > 1 ? `<div class="chips" role="group" aria-label="Filtrar por proyección">${chip("", "Todas") + cats.map((c) => chip(c, c)).join("")}</div>` : ""}
    <a class="btn-calc" href="#calc">${icono.calc}<span>Calculadora de técnica</span></a>
  </div></div>
  <main class="wrap" style="--c:${g.color}">
    ${partes || `<div class="vacio">No hay proyecciones en esta categoría.</div>`}
  </main>` + barraPestanas("enfoques");
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

// Favoritos por región (las familias del menú), con los dos libros juntos: los del libro abierto como botones de zona
// y los de otro libro como filas con su etiqueta; al tocar una de esas filas se cambia de libro y se abre la ficha
function menuFavoritos(filtro, otras) {
  // cada enfoque es una fila con la etiqueta de su libro (un color por libro); los del libro abierto abren la ficha directo
  const etiqueta = (f) => `<span class="fuente-tag f-${esc(f.id)}">${esc(f.nombre)}</span>`;
  const fila = ({ f, id, nombre, region }) => f.id === fuenteId
    ? `<a class="row fav-otra" href="#p-${esc(id)}"><span class="sel-txt"><span class="t">${esc(nombre)}</span><span class="s">${esc(region)}</span></span>${etiqueta(f)}</a>`
    : `<button class="row fav-otra" data-ir-fuente="${esc(f.id)}" data-ir-ficha="${esc(id)}"><span class="sel-txt"><span class="t">${esc(nombre)}</span><span class="s">${esc(region)}</span></span>${etiqueta(f)}</button>`;
  const porFamilia = {};
  const agregar = (k, item) => (porFamilia[FAMILIAS.some((x) => x.id === k) ? k : ""] ||= []).push(item);
  const abierta = FUENTES.find((f) => f.id === fuenteId);
  for (const g of GRUPOS) for (const rid of g.regiones) for (const p of proyeccionesDe(rid).filter(filtro))
    agregar(g.familia.id, { f: abierta, id: p.id, nombre: p.nombre, region: regionPorId[rid]?.nombre || "" });
  let cargando = false;
  for (const f of FUENTES.filter((x) => x.id !== fuenteId)) {
    const suyas = otras.filter((x) => x.fuente === f.id);
    if (!suyas.length) continue;
    const nombres = nombresDe(f.id, () => { if (location.hash === "#favoritos") document.dispatchEvent(new Event("rx-rehacer")); });
    if (!nombres) { cargando = true; continue; }
    for (const x of suyas) if (nombres[x.id]) agregar(nombres[x.id].familia, { f, id: x.id, ...nombres[x.id] });
  }
  const secciones = [...FAMILIAS.map((f) => f.id), ""].map((k) => {
    const fam = FAMILIAS.find((f) => f.id === k) || { nombre: "Otras", color: "var(--mute)" };
    const items = porFamilia[k];
    if (!items?.length) return "";
    return `<section class="familia" style="--c:${fam.color}"><h2>${esc(fam.nombre)}</h2><div class="lista fav-otras">${items.map(fila).join("")}</div></section>`;
  }).join("");
  const nota = otras.length ? `<p class="fav-fuente-nota">Cada enfoque lleva la etiqueta de su libro; al abrir uno de otro libro, la app cambia a ese libro.</p>` : "";
  return nota + secciones + (cargando ? `<div class="vacio">Cargando…</div>` : "");
}

// lista activa de favoritos: selector de listas arriba, acciones (editar, nueva, seleccionar, imprimir) y el menú filtrado
export function vistaFavoritos() {
  const act = listas.activa(), todas = listas.todas();
  const favs = proyecciones.filter((p) => act.ids.includes(p.id));
  if (estado.sel) for (const id of estado.sel) if (!act.ids.includes(id)) estado.sel.delete(id);
  if (estado.sel && !favs.length) estado.sel = null;
  const q = estado.qFav.trim();
  // filtro por libro: "" muestra todos; si no, solo los enfoques de ese libro
  const ff = estado.favFuente;
  const otrasVer = act.otras.filter((x) => !ff || x.fuente === ff), localVer = !ff || ff === fuenteId ? favs : [];
  const nDe = (id) => (id === fuenteId ? favs.length : act.otras.filter((x) => x.fuente === id).length);
  const filtroFuente = estado.sel || !act.total ? "" : `<div class="chips fav-filtro" role="group" aria-label="Filtrar por libro">${[{ id: "", nombre: "Todos" }, ...FUENTES.filter((f) => f.lista)].map((f) => {
      const on = ff === f.id, n = f.id ? nDe(f.id) : act.total;
      return `<button class="chip${on ? " on" : ""}" data-fav-fuente="${esc(f.id)}" aria-pressed="${on}">${esc(f.nombre)} · ${n}</button>`;
    }).join("")}</div>`;
  let cuerpo;
  if (estado.sel) cuerpo = seleccionLista(favs);
  else if (!localVer.length && !otrasVer.length) cuerpo = act.total
    ? `<div class="vacio">No hay enfoques del ${esc(FUENTES.find((f) => f.id === ff)?.nombre || "")} en esta lista.</div>`
    : `<div class="vacio"><b>${todas.length > 1 ? `“${esc(act.nombre)}” está vacía.` : "Todavía no tenés favoritos."}</b><br>Abrí una proyección y tocá la estrella para guardarla${todas.length > 1 ? " en esta lista" : ""}; acá aparece ordenada por región.</div>`;
  else if (q && localVer.length) cuerpo = resultados(localVer, q);
  else cuerpo = menuFavoritos((p) => localVer.includes(p), otrasVer);
  const selector = estado.sel ? "" : `<div class="lst-selector" role="group" aria-label="Listas de favoritos">${todas.map((l) =>
      `<button class="lst-chip${l.id === act.id ? " on" : ""}" data-lista="${esc(l.id)}" aria-pressed="${l.id === act.id}" style="--lc: var(--lc-${l.color})">${icono.estrella(true)}<span>${esc(l.nombre)}</span><b>${l.total}</b></button>`).join("")}
    <button class="lst-chip nueva" data-lista-nueva>${icono.mas}<span>Nueva lista</span></button></div>
    <div class="lst-acciones">
      <button class="btn-sec" data-lista-editar="${esc(act.id)}">${icono.lapiz}<span>Nombre y color</span></button>
      ${favs.length ? `<button class="btn-sec" data-sel-entrar>${icono.tilde}<span>Seleccionar</span></button>
      <a class="btn-sec" href="#imprimir">${icono.imprimir}<span>Imprimir o PDF</span></a>
      <a class="btn-sec" href="#repaso-l-${esc(act.id)}">${icono.repaso}<span>Repasar</span></a>` : ""}
    </div>`;
  return cabecera({ titulo: todas.length > 1 ? act.nombre : "Favoritos", sub: estado.sel ? `${estado.sel.size} de ${favs.length} seleccionadas` : `${todas.length > 1 ? "Favoritos · " : ""}${act.total} ${act.total === 1 ? "proyección" : "proyecciones"}`, atras: "#enfoques" }) +
    (favs.length && !estado.sel ? `<div class="buscar-barra"><div class="wrap">${buscador("q-fav", estado.qFav, `Buscar en ${act.nombre}`)}</div></div>` : "") +
    `<main class="wrap" style="--lc: var(--lc-${act.color})">${selector}${filtroFuente}${cuerpo}</main>` + barraPestanas("favoritos");
}

// Ajustes > Apariencia: diseño (Clásico, Pompa de jabón o Liquid Glass); en Pompa, la paleta de colores y los detalles jugados; en los otros, el tema
const PALETAS = [
  ["original", "Original", "#0b0d1f", "#ff7ad9, #ffd36e, #7dffb0, #6ee7ff, #8a7bff, #ff7ad9"],
  ["perla", "Perla", "#e6e1d8", "#e4b3c8, #ecd4a4, #bfdccb, #b7cfe6, #cdbfe8, #e4b3c8"],
  ["perla-brillante", "Perla brillante", "#f5f1ea", "#f7b6d9, #ffe1a8, #c9f5df, #bfe3ff, #d9c8ff, #f7b6d9"],
  ["salvia", "Salvia", "#dfe4dc", "#9fbf98, #e3c49d, #d99a7e, #a9cbc0, #c9d6a8, #9fbf98"],
  ["niebla", "Niebla", "#e2e0ea", "#b9a8f0, #f0b8d4, #a8d0f0, #c8f0e0, #d9c8ff, #b9a8f0"],
  ["durazno", "Durazno", "#ede0d7", "#ffb59a, #f6a6bb, #ffd9a0, #f3c7b4, #e8b0d8, #ffb59a"],
  ["grafito", "Grafito", "#111216", "#9aa4b8, #4b5468, #e6ebf5, #c0c8d8, #7aa2ff, #9aa4b8"],
  ["coral", "Coral", "#0c1322", "#ff8a7a, #ffc7a1, #6f8fe0, #3a5bbf, #ff9fb0, #ff8a7a"],
  ["mocha", "Mocha", "#181210", "#c99b80, #f1dcc4, #a47864, #e8b8a8, #7a5242, #c99b80"],
  ["aurora", "Aurora", "#06121a", "#5ef2c2, #7b6bff, #c6f45a, #3fd0ff, #a98bff, #5ef2c2"],
  ["oro", "Oro negro", "#030303", "#f6d27a, #8a5a1c, #fff1c1, #c08a2e, #f9e5a6, #f6d27a"],
  ["lima", "Lima", "#04130b", "#c6f432, #2bd66b, #4fe3c1, #f7f36a, #9bff7a, #c6f432"],
  ["rubi", "Rubí", "#160307", "#ff4d6d, #ffb3c1, #ffd27a, #ff7a45, #c9184a, #ff4d6d"],
  ["oceano", "Océano", "#021624", "#6ee7ff, #4f8bff, #9b8cff, #6effd0, #c4fff1, #6ee7ff"],
  ["atardecer", "Atardecer", "#170a20", "#ff8fb1, #ffcf7a, #fff1a8, #ff9a6b, #d48bff, #ff8fb1"],
];
const DETALLES = [
  ["subir", "Burbujitas que suben", "Pompas que flotan por el fondo y tarjetas que se mecen"],
  ["rebote", "Rebote al tocar", "Los botones se aplastan y vuelven como gelatina"],
  ["pompitas", "Pompitas en las esquinas", "Dos burbujas chiquitas en cada tarjeta"],
];
function apariencia(op) {
  const p = (k) => preferencias.get(k);
  const elegir = (k, v, muestra, txt) => `<button class="ap-op${p(k) === v ? " on" : ""}" data-pref="${k}" data-val="${v}" aria-pressed="${p(k) === v}">${muestra}<span>${txt}</span></button>`;
  const disenos = `<div class="ap-disenos">${elegir("diseno", "clasico", `<span class="ap-muestra clasico"></span>`, "Clásico")}${elegir("diseno", "pompa", `<span class="ap-muestra pompa"></span>`, "Pompa de jabón")}${elegir("diseno", "vidrio", `<span class="ap-muestra vidrio"></span>`, "Liquid Glass")}</div>`;
  if (p("diseno") !== "pompa") return `<section class="panel"><h2>Apariencia</h2><h3>Diseño</h3>${disenos}
      <h3>Tema</h3><div class="opciones">${op("tema", "oscuro", "Oscuro")}${op("tema", "claro", "Claro")}${op("tema", "sistema", "Como el teléfono")}</div></section>`;
  const paletas = PALETAS.map(([v, txt, bg, iris]) => elegir("paleta", v, `<span class="ap-muestra" style="--mbg: linear-gradient(${bg}, ${bg}); --miris: conic-gradient(${iris})"></span>`, txt)).join("");
  const detalles = DETALLES.map(([k, txt, sub]) => {
    const si = p(k) === "si";
    return `<button class="ap-detalle" role="switch" aria-checked="${si}" data-pref="${k}" data-val="${si ? "no" : "si"}"><span>${txt}<small>${sub}</small></span><span class="interruptor"></span></button>`;
  }).join("");
  return `<section class="panel"><h2>Apariencia</h2><h3>Diseño</h3>${disenos}
      <h3>Colores</h3><div class="ap-paletas">${paletas}</div>
      <h3>Detalles jugados</h3>${detalles}</section>`;
}

// Ajustes > Tu cuenta: quién está usando la app y el botón para cerrar la sesión
function cuenta() {
  const { usuario, perfil, conGoogle } = nube.estado(), apodo = perfil?.apodo || nombreUsuario();
  const detalle = conGoogle ? `Con Google · ${esc(usuario.email || "")}` : usuario ? "Solo con apodo, en este celular" : "Sin cuenta";
  return `<section class="panel"><h2>Tu cuenta</h2>
      <div class="aj-cuenta">${avatar(perfil?.foto, apodo)}<span><b>${esc(apodo)}</b><small>${detalle}</small></span></div>
      <div class="opciones">${usuario ? `<a class="opcion" href="#juegos-cuenta">Editar perfil</a>` : ""}<button class="opcion aj-salir" data-cerrar-sesion>Cerrar sesión</button></div>
      <div class="opciones"><a class="opcion" href="#privacidad">Qué datos guarda RadioGuía</a>${usuario ? `<button class="opcion aj-salir" data-borrar-cuenta>Borrar mi cuenta y mis datos</button>` : ""}</div></section>`;
}

export function vistaAjustes() {
  const op = (k, v, txt) => `<button class="opcion${preferencias.get(k) === v ? " on" : ""}" data-pref="${k}" data-val="${v}" aria-pressed="${preferencias.get(k) === v}">${txt}</button>`;
  return cabecera({ titulo: "Ajustes", atras: "#" }) + `
  <main class="wrap">
    ${cuenta()}
    <section class="panel" id="fuente"><h2>Fuente</h2><p>El libro del que salen las fichas, el repaso y los juegos. Cada uno tiene su repaso y sus juegos; los favoritos son compartidos y muestran de qué libro es cada enfoque.</p>
      <div class="fuente-ops">${botonesFuente()}</div>
      <p>Ahora: ${esc(FUENTE.libro)}, ${esc(FUENTE.edicion)} (${esc(FUENTE.autores)}; ${esc(FUENTE.editorial)}). Contenido redactado a partir del libro, pendiente de revisión.</p></section>
    ${apariencia(op)}
    <section class="panel"><h2>Tamaño del texto</h2><div class="opciones">${op("texto", "normal", "Normal")}${op("texto", "grande", "Grande")}</div></section>
    <section class="panel"><h2>Sin conexión</h2><p>${pwa.estadoOffline()}</p></section>
    <section class="panel"><h2>Reportes de preguntas</h2>
      <p>Las preguntas del repaso que reportaron todos los que usan la app. Solo las ve la cuenta de Martin.</p>
      <div class="opciones"><a class="opcion" href="#repaso-reportes">Ver reportes</a></div></section>
    <section class="panel"><h2>Versión</h2><p>Versión instalada: <b>${esc(pwa.version() || "sin datos")}</b></p>
      <button class="opcion" data-buscar-act>Buscar actualización</button><p class="act-estado" aria-live="polite"></p></section>

    <p class="pie">Listas de favoritos y ajustes se guardan solo en este dispositivo.</p>
  </main>` + barraPestanas("ajustes");
}
