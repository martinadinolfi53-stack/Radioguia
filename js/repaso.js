// Modo repaso: multiple choice sobre los enfoques de una lista de favoritos o elegidos sueltos.
// Se entra desde Juegos (#juegos; sin esa sección, la ruta cae en el inicio).
// Rutas: #repaso (elegir) · #repaso-l-<lista> (elegir, con esa lista) · #repaso-jugar · #repaso-partida-<código> (partida compartida)
// Las preguntas salen de js/repaso-preguntas.js. Los resultados se guardan en este dispositivo con un formato pensado
// para mandarlos después a un ranking de grupo (ver guardarResultado).
import { proyecciones, proyeccionPorId, regionPorId, CATEGORIAS } from "./datos.js";
import * as almacen from "./almacen.js";
import { esc, icono, cabecera } from "./util.js";
import { GRUPOS, grupoDeRegion } from "./menu.js";
import { ASPECTOS, CAMPOS, generarPreguntas } from "./repaso-preguntas.js";
import * as nube from "./nube.js";

const K_RES = "radioguia.repaso.resultados", K_SUELTOS = "radioguia.repaso.sueltos", K_CONF = "radioguia.repaso.config", K_SESION = "radioguia.repaso.sesion";
const leer = (st, k, def) => { try { const v = st.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const escribir = (st, k, v) => { try { v == null ? st.removeItem(k) : st.setItem(k, JSON.stringify(v)); } catch {} };
const local = (() => { try { return localStorage; } catch { return null; } })();
const sesionSt = (() => { try { return sessionStorage; } catch { return null; } })();

const CANTIDADES = [10, 20, 30];
const regionNombre = (id) => regionPorId[id]?.nombre || id;
const zonaDe = (region) => [grupoDeRegion[region]?.id || "", grupoDeRegion[region]?.familia.nombre || ""];

// listas de favoritos: las arma el módulo de favoritos (almacen.listas); mientras no exista, la lista única de favoritos
function listas() {
  try { const l = almacen.listas?.todas?.(); if (Array.isArray(l) && l.length) return l; } catch {}
  let ids = [];
  try { ids = almacen.favoritos?.lista?.() || []; } catch {}
  return [{ id: "favoritos", nombre: "Favoritos", ids }];
}

const FAMILIAS = [...new Map(GRUPOS.map((g) => [g.familia.nombre, g.familia])).values()];
const TIPOS = [["R", "Rutina"], ["E", "Especial"]];

// cantidad 0 = todas las que se puedan armar · excluir: tipos de pregunta apagados (CAMPOS)
// filtros: se aplican sobre los enfoques elegidos; una lista vacía = sin filtro
const conf = { origen: "lista:favoritos", aspectos: ASPECTOS.map((a) => a.id), excluir: [], cantidad: 10, ...leer(local, K_CONF, {}) };
conf.filtros = { familias: [], tipos: [], cats: [], ...conf.filtros };
// modo: "normal" (pausa para ver la respuesta) o "reloj" (contrarreloj: todas las que puedas en conf.minutos)
conf.modo ||= "normal"; conf.minutos ||= 2;
const MINUTOS = [1, 2, 3];
let sueltos = new Set(leer(local, K_SUELTOS, []));
let sesion = leer(sesionSt, K_SESION, null);
const guardarConf = () => escribir(local, K_CONF, conf);
const guardarSesion = () => escribir(sesionSt, K_SESION, sesion);

function fichasDelOrigen() {
  if (conf.origen === "todas") return proyecciones;
  const ids = conf.origen === "sueltos" ? [...sueltos] : listas().find((l) => `lista:${l.id}` === conf.origen)?.ids || [];
  // en el orden del manual
  return proyecciones.filter((p) => ids.includes(p.id));
}
const pasaFiltros = (p, f = conf.filtros) =>
  (!f.familias.length || f.familias.includes(grupoDeRegion[p.region]?.familia.nombre)) &&
  (!f.tipos.length || f.tipos.includes(p.tipo)) &&
  (!f.cats.length || (p.categoria || []).some((c) => f.cats.includes(c)));
const fichasElegidas = () => fichasDelOrigen().filter((p) => pasaFiltros(p));
function origenActual() {
  if (conf.origen === "sueltos") return { tipo: "sueltos", nombre: "Enfoques elegidos" };
  if (conf.origen === "todas") return { tipo: "todas", nombre: "Todas las fichas" };
  const l = listas().find((x) => `lista:${x.id}` === conf.origen) || listas()[0];
  return l.id === "favoritos" ? { tipo: "favoritos", nombre: l.nombre } : { tipo: "lista", id: l.id, nombre: l.nombre };
}
// si la lista guardada ya no existe, vuelve a la primera
function validarOrigen() {
  if (conf.origen === "sueltos" || conf.origen === "todas") return;
  const ls = listas();
  if (!ls.some((l) => `lista:${l.id}` === conf.origen)) conf.origen = `lista:${ls[0].id}`;
}

export function resultados() { return leer(local, K_RES, []); }

// preguntas reportadas por el usuario (dos opciones válidas, respuesta mal, etc.): se guardan acá y se mandan como texto
const K_REP = "radioguia.repaso.reportes";
const MOTIVOS = ["Hay más de una correcta", "La respuesta correcta está mal", "La pregunta es confusa", "Otro"];
export const reportes = () => leer(local, K_REP, []);
const reportada = (q) => reportes().some((x) => x.ficha === q.ficha && x.campo === q.campo && x.enunciado === q.enunciado && x.correcta === q.opciones[q.correcta]);
// los reportes se guardan en el dispositivo y se mandan a la nube (nube.enviarReporte); si no hay internet, quedan
// pendientes y se vuelven a mandar al abrir el repaso. Los lee Martin en #repaso-reportes (Ajustes).
const pendientes = () => reportes().filter((x) => !x.enviado);
let mandando = null;
function mandarPendientes() {
  if (mandando || !pendientes().length || !navigator.onLine) return mandando;
  return (mandando = (async () => {
    for (const x of pendientes()) {
      try { await nube.enviarReporte(x); } catch { break; }
      escribir(local, K_REP, reportes().map((y) => (y.fecha === x.fecha && y.enunciado === x.enunciado ? { ...y, enviado: true } : y)));
    }
  })().finally(() => { mandando = null; }));
}

// formato de resultado (v1), pensado para un ranking de grupo:
// { v, id, fecha, semilla, fichas, aspectos, excluir, preguntas, correctas, puntaje, duracionMs, origen: {tipo, id?, nombre}, soloErrores, detalle: [{ficha, aspecto, campo, ok}] }
// con semilla + fichas + aspectos + excluir + preguntas cualquiera vuelve a generar exactamente las mismas preguntas.
function guardarResultado(s) {
  const correctas = s.respuestas.filter((r, i) => r === s.preguntas[i].correcta).length;
  const reloj = s.reloj ? { modo: "reloj", segundos: s.reloj / 1000 } : { modo: "normal" };
  const res = {
    v: 1, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, fecha: new Date().toISOString(),
    semilla: s.semilla, fichas: s.fichas, aspectos: s.aspectos, excluir: s.excluir || [], preguntas: s.preguntas.length, correctas, puntaje: correctas * 100,
    duracionMs: Math.max(0, (s.fin || Date.now()) - s.inicio), ...reloj, origen: s.origen, soloErrores: !!s.soloErrores,
    detalle: s.preguntas.map((q, i) => ({ ficha: q.ficha, aspecto: q.aspecto, campo: q.campo, ok: s.respuestas[i] === q.correcta })),
  };
  escribir(local, K_RES, [res, ...resultados()].slice(0, 50));
  // aviso para el ranking de grupo (js de cuentas y grupos), sin que tenga que leer el almacenamiento
  try { dispatchEvent(new CustomEvent("rg:repaso-resultado", { detail: res })); } catch {}
  return res;
}

function empezar({ fichas, aspectos, excluir = [], cantidad, reloj = 0, semilla = Math.random().toString(36).slice(2, 10), origen, preguntas, soloErrores = false }) {
  const lista = fichas.map((id) => proyeccionPorId[id]).filter(Boolean);
  // contrarreloj: se arman todas, se responden las que alcancen en el tiempo
  preguntas ||= generarPreguntas({ fichas: lista, todas: proyecciones, zonaDe, regionNombre, aspectos, excluir, cantidad: reloj ? Infinity : cantidad || Infinity, semilla });
  if (!preguntas.length) return false;
  sesion = { semilla, fichas: lista.map((p) => p.id), aspectos, excluir, cantidad, origen, soloErrores, preguntas, respuestas: [], actual: 0, inicio: Date.now(), fin: null, resultado: null,
    reloj: reloj || 0, limite: reloj ? Date.now() + reloj : null };
  guardarSesion();
  return true;
}

// para otras pantallas (ej. estadísticas): arranca un repaso con esas fichas y va a la pregunta 1. Devuelve false si no hay preguntas.
export function empezarRepaso({ fichas, aspectos = ASPECTOS.map((a) => a.id), excluir = [], cantidad = 10, origen = { tipo: "otro", nombre: "Repaso" } }) {
  const ok = empezar({ fichas, aspectos, excluir, cantidad, origen });
  if (ok) location.hash = "#repaso-jugar";
  return ok;
}

// partida compartida: la configuración en el link, para que todos respondan las mismas preguntas
const codificar = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const decodificar = (c) => { try { return JSON.parse(decodeURIComponent(escape(atob(c.replace(/-/g, "+").replace(/_/g, "/"))))); } catch { return null; } };
const linkPartida = (s) => `${location.origin}${location.pathname}#repaso-partida-${codificar({ s: s.semilla, f: s.fichas, a: s.aspectos, n: s.cantidad, ...(s.excluir?.length ? { x: s.excluir } : {}), ...(s.reloj ? { r: s.reloj / 1000 } : {}) })}`;

// fin de la partida; en contrarreloj solo cuentan las preguntas respondidas
function terminar() {
  if (sesion.reloj) {
    const n = sesion.respuestas.filter((x) => x !== undefined).length;
    sesion.preguntas = sesion.preguntas.slice(0, n); sesion.respuestas = sesion.respuestas.slice(0, n);
    sesion.actual = Math.max(0, n - 1);
  }
  sesion.fin = sesion.limite ? Math.min(Date.now(), sesion.limite) : Date.now();
  sesion.resultado = guardarResultado(sesion);
  guardarSesion();
}
const restante = (s) => { const t = Math.max(0, Math.ceil((s.limite - Date.now()) / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };

// ---------- pantallas ----------
export function vistaRepaso(h) {
  if (h.startsWith("#repaso-partida-")) {
    const c = decodificar(h.slice(16));
    const ok = c && Array.isArray(c.f) && empezar({ fichas: c.f, aspectos: c.a || [], excluir: Array.isArray(c.x) ? c.x : [], cantidad: +c.n || 0, reloj: +c.r > 0 ? Math.min(+c.r, 600) * 1000 : 0, semilla: String(c.s), origen: { tipo: "partida", nombre: "Partida compartida" } });
    history.replaceState(null, "", ok ? "#repaso-jugar" : "#repaso");
    if (!ok) return vistaElegir("El link de la partida no es válido o no tiene preguntas.");
  }
  if (h.startsWith("#repaso-l-")) { conf.origen = `lista:${h.slice(10)}`; guardarConf(); history.replaceState(null, "", "#repaso"); }
  if (h.startsWith("#repaso-reportes")) return vistaAdmin();
  if (sesion?.reloj && !sesion.resultado && Date.now() >= sesion.limite) terminar();
  if (h.startsWith("#repaso-jugar") || h.startsWith("#repaso-partida-")) return sesion ? (sesion.resultado ? vistaResultado() : vistaPregunta()) : vistaElegir();
  return vistaElegir();
}

// cuántas preguntas se pueden armar (se recuerda, porque con muchas fichas tarda)
let memo = {};
function maximo(fichas, aspectos, excluir) {
  if (!fichas.length) return 0;
  const k = fichas.map((p) => p.id).join(",") + "|" + aspectos.join(",") + "|" + excluir.join(",");
  return (memo = memo.k === k ? memo : { k, n: generarPreguntas({ fichas, todas: proyecciones, zonaDe, regionNombre, aspectos, excluir, cantidad: Infinity, semilla: "x" }).length }).n;
}

function vistaElegir(aviso) {
  validarOrigen();
  const delOrigen = fichasDelOrigen(), fichas = delOrigen.filter((p) => pasaFiltros(p));
  const max = maximo(fichas, conf.aspectos, conf.excluir);
  const nFiltros = conf.filtros.familias.length + conf.filtros.tipos.length + conf.filtros.cats.length;
  const n = conf.cantidad ? Math.min(conf.cantidad, max) : max;
  const op = (on, attrs, txt, det = "") => `<button class="opcion rp-op${on ? " on" : ""}" ${attrs} aria-pressed="${on}"><span>${txt}</span>${det ? `<small>${det}</small>` : ""}</button>`;
  const chip = (on, attrs, txt) => `<button class="rp-chip${on ? " on" : ""}" ${attrs} aria-pressed="${on}">${txt}</button>`;
  // filtros: cada botón muestra cuántos enfoques del origen tiene
  const cuantos = (k, v) => delOrigen.filter((p) => pasaFiltros(p, { ...conf.filtros, [k]: [v] })).length;
  const filaFiltro = (k, titulo, valores) => `<h3>${titulo}</h3><div class="rp-chips">${valores.map(([v, txt]) => chip(conf.filtros[k].includes(v), `data-rp="filtro" data-k="${k}" data-val="${esc(v)}"`, `${esc(txt)} <small>${cuantos(k, v)}</small>`)).join("")}</div>`;
  const origenes = [op(conf.origen === "todas", 'data-rp="origen" data-val="todas"', "Todas las fichas", `${proyecciones.length} enfoques`), ...listas().map((l) => op(conf.origen === `lista:${l.id}`, `data-rp="origen" data-val="lista:${esc(l.id)}"`, esc(l.nombre), `${l.ids.length} ${l.ids.length === 1 ? "enfoque" : "enfoques"}`)),
    op(conf.origen === "sueltos", 'data-rp="origen" data-val="sueltos"', "Elegir enfoques", `${sueltos.size} ${sueltos.size === 1 ? "elegido" : "elegidos"}`)].join("");
  const ultimos = resultados().slice(0, 5);
  const enCurso = sesion && !sesion.resultado && sesion.respuestas.length < sesion.preguntas.length;

  return cabecera({ titulo: "Repaso", sub: "Multiple choice con tus enfoques", atras: "#juegos" }) + `
  <main class="wrap repaso">
    ${aviso ? `<div class="vacio">${esc(aviso)}</div>` : ""}
    ${enCurso ? `<a class="rp-seguir" href="#repaso-jugar"><span><b>Seguir el repaso</b><small>Vas por la pregunta ${sesion.actual + 1} de ${sesion.preguntas.length}</small></span>${icono.chev}</a>` : ""}
    <section class="panel"><h2>¿Qué enfoques?</h2><div class="opciones rp-col">${origenes}</div>
      ${conf.origen === "sueltos" ? selectorSueltos() : ""}</section>
    <details class="panel rp-filtros"${nFiltros ? " open" : ""}><summary><h2>Filtrar enfoques</h2><span>${nFiltros ? `${fichas.length} de ${delOrigen.length} enfoques` : "Sin filtros"}</span>${icono.chev}</summary>
      ${filaFiltro("familias", "Región", FAMILIAS.map((x) => [x.nombre, x.nombre]))}
      ${filaFiltro("tipos", "Rutina o especial", TIPOS)}
      ${filaFiltro("cats", "Tipo de proyección", CATEGORIAS.map((c) => [c, c]))}
      ${nFiltros ? `<button class="rp-limpiar" data-rp="limpiar">Quitar filtros</button>` : ""}
    </details>
    <section class="panel"><h2>¿Qué preguntar?</h2><div class="rp-aspectos">${ASPECTOS.map((a) => {
      const on = conf.aspectos.includes(a.id);
      return `<div class="rp-aspecto">${op(on, `data-rp="aspecto" data-val="${a.id}"`, esc(a.nombre), esc(a.detalle))}
        ${on ? `<div class="rp-chips">${CAMPOS.filter((c) => c.aspecto === a.id).map((c) => chip(!conf.excluir.includes(c.id), `data-rp="campo" data-val="${c.id}"`, esc(c.nombre))).join("")}</div>` : ""}</div>`;
    }).join("")}</div></section>
    <section class="panel"><h2>¿Cómo jugar?</h2><div class="opciones rp-col">
      ${op(conf.modo === "normal", 'data-rp="modo" data-val="normal"', "Normal", "Después de cada respuesta ves si acertaste y seguís cuando quieras")}
      ${op(conf.modo === "reloj", 'data-rp="modo" data-val="reloj"', "Contrarreloj", "Respondé todas las que puedas antes de que se acabe el tiempo")}</div>
      ${conf.modo === "reloj" ? `<div class="rp-chips rp-min">${MINUTOS.map((m) => chip(conf.minutos === m, `data-rp="minutos" data-val="${m}"`, `${m} ${m === 1 ? "minuto" : "minutos"}`)).join("")}</div>` : ""}</section>
    ${conf.modo === "reloj" ? "" : `<section class="panel"><h2>¿Cuántas preguntas?</h2><div class="opciones">${CANTIDADES.map((c) => op(conf.cantidad === c, `data-rp="cantidad" data-val="${c}"`, String(c))).join("")}${op(!conf.cantidad, 'data-rp="cantidad" data-val="0"', `Todas${max ? ` (${max})` : ""}`)}</div></section>`}
    ${fichas.length ? "" : `<div class="vacio">${delOrigen.length ? "<b>Ningún enfoque pasa los filtros.</b><br>Sacá alguno de los filtros de arriba." : conf.origen === "sueltos" ? "Elegí al menos un enfoque de la lista de arriba." : "<b>Esta lista está vacía.</b><br>Agregá enfoques con la estrella o elegí enfoques sueltos."}</div>`}
    ${fichas.length && !max ? `<div class="vacio">Con estos enfoques y estos tipos de pregunta no se puede armar ninguna pregunta. Prendé más tipos de pregunta.</div>` : ""}
    <button class="rp-empezar" data-rp="empezar" ${n ? "" : "disabled"}>Empezar · ${conf.modo === "reloj" ? `${conf.minutos} ${conf.minutos === 1 ? "minuto" : "minutos"}` : `${n} ${n === 1 ? "pregunta" : "preguntas"}`}</button>
    ${pendientes().length ? `<section class="panel"><h2>Reportes sin mandar (${pendientes().length})</h2><p>No se pudieron mandar porque no había internet. Se mandan solos cuando vuelve la conexión.</p>
      <div class="opciones rp-rep-acc"><button class="opcion" data-rp="mandar-reportes">Mandar ahora</button></div><p class="pie" id="rp-rep-aviso" hidden></p></section>` : ""}
    ${ultimos.length ? `<section class="panel"><h2>Últimos resultados</h2><div class="rp-hist">${ultimos.map((r) => `<div><span>${esc(r.origen?.nombre || "")}<small>${new Date(r.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · ${r.preguntas} preguntas</small></span><b>${r.correctas}/${r.preguntas}</b></div>`).join("")}</div></section>` : ""}
    <p class="pie">Preguntas armadas con los datos de las fichas (Bontrager 9ª ed.). Los resultados se guardan en este dispositivo.</p>
  </main>`;
}

// enfoques sueltos: un desplegable por zona del menú, con casilla para toda la zona
function selectorSueltos() {
  return `<div class="rp-zonas">${GRUPOS.map((g) => {
    const ps = g.regiones.flatMap((r) => proyecciones.filter((p) => p.region === r));
    if (!ps.length) return "";
    const n = ps.filter((p) => sueltos.has(p.id)).length;
    return `<details class="rp-zona" style="--c:${g.color}" ${n ? "open" : ""}><summary><span>${esc(g.nombre)}</span><small>${n}/${ps.length}</small>${icono.chev}</summary>
      <label class="rp-check rp-todas"><input type="checkbox" data-rp-zona="${g.id}" ${n === ps.length ? "checked" : ""}><span>Toda la zona</span></label>
      ${ps.map((p) => `<label class="rp-check"><input type="checkbox" data-rp-ficha="${p.id}" ${sueltos.has(p.id) ? "checked" : ""}><span>${esc(p.nombre)}</span></label>`).join("")}</details>`;
  }).join("")}</div>`;
}

function vistaPregunta() {
  const s = sesion, q = s.preguntas[s.actual], p = proyeccionPorId[q.ficha];
  const resp = s.respuestas[s.actual], respondida = resp !== undefined;
  const total = s.preguntas.length;
  const clase = (i) => !respondida ? "" : i === q.correcta ? " ok" : i === resp ? " mal" : " apagada";
  const bien = s.respuestas.filter((r, i) => r === s.preguntas[i].correcta).length;
  return cabecera(s.reloj ? { titulo: "Contrarreloj", sub: `${bien} ${bien === 1 ? "correcta" : "correctas"} · pregunta ${s.actual + 1}`, atras: "#repaso", derecha: `<b class="rp-reloj" id="rp-reloj">${restante(s)}</b>` }
    : { titulo: "Repaso", sub: `Pregunta ${s.actual + 1} de ${total}`, atras: "#repaso" }) + `
  ${s.reloj ? `<div class="rp-barra reloj"><span id="rp-reloj-barra" style="width:${Math.max(0, (s.limite - Date.now()) / s.reloj) * 100}%"></span></div>`
    : `<div class="rp-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${s.respuestas.length}"><span style="width:${(s.respuestas.length / total) * 100}%"></span></div>`}
  <main class="wrap repaso">
    <section class="rp-preg">
      ${q.conNombre ? `<p class="rp-ficha">${esc(p?.nombre)}<small>${esc(regionPorId[p?.region]?.nombre || "")} · ${esc(q.dato)}</small></p>` : `<p class="rp-ficha"><small>${esc(q.dato)}</small></p>`}
      <h2>${esc(q.enunciado)}</h2>
      ${q.imagen ? `<button class="rp-img" data-ampliar="${esc(q.imagen)}" data-alt="Esquema" aria-label="Ampliar esquema"><img src="${esc(q.imagen)}" alt="Esquema de la proyección"></button>` : ""}
      ${q.cita ? `<blockquote class="rp-cita">${esc(q.cita)}</blockquote>` : ""}
    </section>
    <div class="rp-opciones">${q.opciones.map((o, i) => `<button class="rp-opcion${clase(i)}" data-rp="responder" data-val="${i}" ${respondida ? "disabled" : ""}><b>${"ABCD"[i]}</b><span>${esc(o)}</span></button>`).join("")}</div>
    ${respondida && !s.reloj ? `<section class="rp-fb ${resp === q.correcta ? "ok" : "mal"}">
      <p><b>${resp === q.correcta ? "¡Correcto!" : "Incorrecto."}</b> ${resp === q.correcta ? "" : `La respuesta era <b>${"ABCD"[q.correcta]}</b>.`}</p>
      ${q.completa ? `<p>En la ficha: ${esc(q.completa)}</p>` : ""}
      <a class="rp-link" href="#p-${esc(q.ficha)}">${icono.libro}<span>Ver la ficha de ${esc(p?.nombre)}</span></a>
      ${reportada(q) ? `<p class="rp-reportada">Pregunta reportada. Gracias.</p>` : s.reportando ? `<div class="rp-reporte">
        <label for="rp-coment">¿Qué está mal? <small>(opcional)</small></label>
        <input id="rp-coment" type="text" autocomplete="off" placeholder="Por ejemplo: la B también es correcta">
        <div class="rp-chips">${MOTIVOS.map((m) => `<button class="rp-chip" data-rp="reportar" data-val="${esc(m)}">${esc(m)}</button>`).join("")}</div>
        <button class="rp-limpiar" data-rp="no-reportar">Cancelar</button></div>`
      : `<button class="rp-reportar" data-rp="abrir-reporte">Reportar esta pregunta</button>`}
    </section>
    <button class="rp-empezar" data-rp="siguiente">${s.actual + 1 < total ? "Siguiente" : "Ver resultado"}</button>` : ""}
  </main>`;
}

function vistaResultado() {
  const s = sesion, r = s.resultado, total = s.preguntas.length;
  const pct = total ? Math.round((r.correctas / total) * 100) : 0;
  const errores = s.preguntas.map((q, i) => ({ q, i })).filter(({ q, i }) => s.respuestas[i] !== q.correcta);
  const min = Math.floor(r.duracionMs / 60000), seg = Math.round((r.duracionMs % 60000) / 1000);
  return cabecera({ titulo: "Resultado", sub: s.origen?.nombre, atras: "#repaso" }) + `
  <main class="wrap repaso">
    <section class="rp-puntaje ${pct >= 80 ? "ok" : pct >= 50 ? "medio" : "mal"}">
      <b>${r.correctas}<small>/${total}</small></b>
      <span>${pct}% de respuestas correctas · ${r.puntaje} puntos</span>
      <small>${s.reloj ? `Contrarreloj de ${s.reloj / 60000} ${s.reloj === 60000 ? "minuto" : "minutos"} · ${total} ${total === 1 ? "respondida" : "respondidas"}` : `Tiempo: ${min ? `${min} min ` : ""}${seg} s`}</small>
    </section>
    <div class="rp-acciones">
      ${errores.length ? `<button class="rp-empezar" data-rp="errores">Repasar los ${errores.length === 1 ? "error" : `${errores.length} errores`}</button>` : ""}
      <button class="btn" data-rp="repetir">Repetir esta misma partida</button>
      <button class="btn" data-rp="otra">Otra vez con preguntas nuevas</button>
      ${s.soloErrores ? "" : `<button class="btn" data-rp="compartir">Compartir esta partida</button>`}
      <p class="pie" id="rp-compartido" hidden></p>
    </div>
    ${errores.length ? `<p class="label">Para repasar</p><div class="lista">${errores.map(({ q, i }) => {
      const p = proyeccionPorId[q.ficha];
      return `<div class="row"><a href="#p-${esc(q.ficha)}"><span class="t">${esc(p?.nombre)}</span>
        <span class="s">${esc(q.enunciado)}</span><span class="rp-err">Correcta: ${esc(q.opciones[q.correcta])}</span>${s.respuestas[i] !== undefined ? `<span class="rp-err mal">Tu respuesta: ${esc(q.opciones[s.respuestas[i]])}</span>` : ""}</a></div>`;
    }).join("")}</div>` : `<div class="vacio"><b>¡Todas bien!</b> Probá con más preguntas o con otra lista.</div>`}
  </main>`;
}

// ---------- eventos ----------
// ---------- reportes de todos (solo para quien figura en ADMINS de herramientas/firestore.rules) ----------
let admin = null, renderRepaso = () => {};
function vistaAdmin() {
  if (!admin) {
    admin = { cargando: true };
    nube.leerReportes().then((lista) => { admin = { lista }; }, (e) => { admin = { error: e?.code || e?.message || "error" }; })
      .then(() => { if (location.hash.startsWith("#repaso-reportes")) renderRepaso(); });
  }
  const cab = cabecera({ titulo: "Reportes de preguntas", sub: "Lo que reportaron todos", atras: "#ajustes" });
  if (admin.cargando) return cab + `<main class="wrap repaso"><div class="vacio">Cargando reportes…</div></main>`;
  if (admin.error) {
    const sinPermiso = String(admin.error).includes("permission"), uid = nube.uid();
    return cab + `<main class="wrap repaso">${sinPermiso ? `<section class="panel"><h2>Todavía no tenés permiso</h2>
      <p>Solo pueden ver los reportes las cuentas anotadas en las reglas de Firebase. Este es tu código de usuario: mandáselo a Claude para que te anote.</p>
      ${uid ? `<p class="rp-uid"><code>${esc(uid)}</code> <button class="rp-limpiar" data-rp="copiar-uid" data-val="${esc(uid)}">Copiar</button></p>` : "<p>No hay una cuenta abierta en este dispositivo.</p>"}</section>`
      : `<div class="vacio">No se pudieron cargar los reportes. Fijate que tengas internet.</div>`}
      <button class="rp-limpiar" data-rp="admin-recargar">Probar de nuevo</button></main>`;
  }
  const lista = admin.lista;
  return cab + `<main class="wrap repaso">
    ${lista.length ? lista.map((x) => `<section class="panel rp-adm">
      <p class="rp-ficha"><a href="#p-${esc(x.ficha)}">${esc(x.fichaNombre || x.ficha)}</a><small>${esc(x.apodo || "Sin apodo")} · ${x.creado ? new Date(x.creado).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</small></p>
      <p><b>${esc(x.motivo)}</b>${x.comentario ? `: ${esc(x.comentario)}` : ""}</p>
      <p>${esc(x.enunciado)}</p>
      <ul>${(x.opciones || []).map((o) => `<li class="${o === x.correcta ? "ok" : o === x.elegida ? "mal" : ""}">${esc(o)}${o === x.correcta ? " <small>(correcta según la app)</small>" : o === x.elegida ? " <small>(eligió esta)</small>" : ""}</li>`).join("")}</ul>
      <button class="rp-limpiar" data-rp="admin-borrar" data-val="${esc(x.id)}">Revisado, borrar</button></section>`).join("")
      : `<div class="vacio">No hay reportes. Cuando alguien reporte una pregunta, aparece acá.</div>`}
    <button class="rp-limpiar" data-rp="admin-recargar">Actualizar</button></main>`;
}

export function iniciarRepaso(app, render) {
  renderRepaso = render;
  mandarPendientes();
  addEventListener("online", () => mandarPendientes());
  // reloj del contrarreloj: actualiza el tiempo que queda y termina la partida al llegar a cero
  setInterval(() => {
    if (!sesion?.reloj || sesion.resultado) return;
    if (Date.now() >= sesion.limite) { terminar(); if (location.hash.startsWith("#repaso")) { render(); scrollTo(0, 0); } return; }
    const t = document.getElementById("rp-reloj"), b = document.getElementById("rp-reloj-barra");
    if (t) t.textContent = restante(sesion);
    if (b) b.style.width = `${Math.max(0, (sesion.limite - Date.now()) / sesion.reloj) * 100}%`;
  }, 250);

  app.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-rp]");
    if (!t) return;
    const v = t.dataset.val;
    switch (t.dataset.rp) {
      case "origen": conf.origen = v; break;
      case "aspecto": {
        const a = new Set(conf.aspectos); a.has(v) ? a.delete(v) : a.add(v);
        if (!a.size) return; // siempre queda al menos uno
        conf.aspectos = ASPECTOS.map((x) => x.id).filter((x) => a.has(x)); break;
      }
      case "campo": {
        const x = new Set(conf.excluir); x.has(v) ? x.delete(v) : x.add(v);
        const aspecto = CAMPOS.find((c) => c.id === v)?.aspecto;
        // si se apagan todos los tipos de un aspecto, se apaga el aspecto y sus tipos vuelven a quedar prendidos para la próxima
        if (CAMPOS.filter((c) => c.aspecto === aspecto).every((c) => x.has(c.id))) {
          if (conf.aspectos.length === 1) return;
          conf.aspectos = conf.aspectos.filter((a) => a !== aspecto);
          CAMPOS.filter((c) => c.aspecto === aspecto).forEach((c) => x.delete(c.id));
        }
        conf.excluir = CAMPOS.map((c) => c.id).filter((c) => x.has(c)); break;
      }
      case "filtro": {
        const k = t.dataset.k, l = new Set(conf.filtros[k]); l.has(v) ? l.delete(v) : l.add(v);
        conf.filtros = { ...conf.filtros, [k]: [...l] }; break;
      }
      case "limpiar": conf.filtros = { familias: [], tipos: [], cats: [] }; break;
      case "cantidad": conf.cantidad = +v; break;
      case "modo": conf.modo = v; break;
      case "minutos": conf.minutos = +v; break;
      case "empezar": {
        const fichas = fichasElegidas().map((p) => p.id);
        if (empezar({ fichas, aspectos: conf.aspectos, excluir: conf.excluir, cantidad: conf.cantidad, reloj: conf.modo === "reloj" ? conf.minutos * 60000 : 0, origen: origenActual() })) location.hash = "#repaso-jugar";
        return;
      }
      case "responder": {
        if (sesion.respuestas[sesion.actual] !== undefined || sesion.resultado) return;
        sesion.respuestas[sesion.actual] = +v; guardarSesion();
        // contrarreloj: se ve un instante si acertaste y pasa sola a la siguiente
        if (sesion.reloj) {
          const i = sesion.actual, s0 = sesion;
          setTimeout(() => {
            if (sesion !== s0 || s0.resultado || s0.actual !== i) return;
            if (i + 1 < s0.preguntas.length) { s0.actual++; guardarSesion(); } else terminar();
            if (location.hash.startsWith("#repaso-jugar")) { render(); scrollTo(0, 0); }
          }, 650);
        }
        break;
      }
      case "siguiente":
        sesion.reportando = false;
        if (sesion.actual + 1 < sesion.preguntas.length) sesion.actual++;
        else terminar();
        guardarSesion(); render(); return scrollTo(0, 0);
      case "errores": {
        const malas = sesion.preguntas.filter((q, i) => sesion.respuestas[i] !== q.correcta);
        empezar({ ...sesion, soloErrores: true, preguntas: malas.map((q) => ({ ...q })), origen: { ...sesion.origen, nombre: `${sesion.origen?.nombre || "Repaso"} · errores` } });
        render(); return scrollTo(0, 0);
      }
      // mismas preguntas, mismas opciones y mismo orden (misma semilla), para ver si mejoraste
      case "repetir":
        empezar({ fichas: sesion.fichas, aspectos: sesion.aspectos, excluir: sesion.excluir, cantidad: sesion.cantidad, semilla: sesion.semilla, origen: sesion.origen,
          reloj: sesion.reloj, ...(sesion.soloErrores ? { soloErrores: true, preguntas: sesion.preguntas.map((q) => ({ ...q })) } : {}) });
        render(); return scrollTo(0, 0);
      case "otra":
        empezar({ fichas: sesion.fichas, aspectos: sesion.aspectos, excluir: sesion.excluir, cantidad: sesion.cantidad, reloj: sesion.reloj, origen: sesion.origen }); render(); return scrollTo(0, 0);
      case "abrir-reporte": sesion.reportando = true; break;
      case "no-reportar": sesion.reportando = false; break;
      case "reportar": {
        const q = sesion.preguntas[sesion.actual], elegida = sesion.respuestas[sesion.actual];
        const rep = { fecha: new Date().toISOString(), ficha: q.ficha, fichaNombre: proyeccionPorId[q.ficha]?.nombre || q.ficha, campo: q.campo, enunciado: q.enunciado,
          opciones: q.opciones, correcta: q.opciones[q.correcta], elegida: elegida !== undefined ? q.opciones[elegida] : null, motivo: v, comentario: document.getElementById("rp-coment")?.value.trim() || "" };
        escribir(local, K_REP, [...reportes(), rep]);
        mandarPendientes();
        sesion.reportando = false; break;
      }
      case "mandar-reportes": {
        const aviso = document.getElementById("rp-rep-aviso");
        await mandarPendientes();
        if (pendientes().length) { aviso.textContent = "Todavía no se pudo. Fijate que tengas internet."; aviso.hidden = false; return; }
        break;
      }
      case "admin-borrar": {
        if (!confirm("¿Marcar este reporte como revisado? Se borra para todos.")) return;
        try { await nube.borrarReporte(v); admin.lista = admin.lista.filter((x) => x.id !== v); } catch (err) { alert(err?.message || "No se pudo borrar."); return; }
        break;
      }
      case "admin-recargar": admin = null; break;
      case "copiar-uid": {
        try { await navigator.clipboard.writeText(v); t.textContent = "Copiado"; } catch { getSelection().selectAllChildren(t.previousElementSibling); }
        return;
      }
      case "compartir": {
        const url = linkPartida(sesion), aviso = document.getElementById("rp-compartido");
        const texto = "Partida de repaso de RadioGuía: respondé las mismas preguntas que yo.";
        try {
          if (navigator.share) await navigator.share({ title: "RadioGuía · Repaso", text: texto, url });
          else { await navigator.clipboard.writeText(url); aviso.textContent = "Link copiado. Pegalo en el grupo para que jueguen la misma partida."; aviso.hidden = false; }
        } catch (err) { if (err?.name !== "AbortError") { aviso.textContent = url; aviso.hidden = false; } }
        return;
      }
      default: return;
    }
    guardarConf();
    if (sesion) guardarSesion();
    const y = scrollY; render(); scrollTo(0, y);
  });

  app.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset.rpFicha) el.checked ? sueltos.add(el.dataset.rpFicha) : sueltos.delete(el.dataset.rpFicha);
    else if (el.dataset.rpZona) {
      const g = GRUPOS.find((x) => x.id === el.dataset.rpZona);
      for (const p of proyecciones.filter((x) => g.regiones.includes(x.region))) el.checked ? sueltos.add(p.id) : sueltos.delete(p.id);
    } else return;
    escribir(local, K_SUELTOS, [...sueltos]);
    // se vuelve a dibujar con los desplegables como estaban
    const abiertos = [...app.querySelectorAll("details.rp-zona")].map((d) => d.open);
    const y = scrollY; render();
    app.querySelectorAll("details.rp-zona").forEach((d, i) => (d.open = abiertos[i] ?? d.open));
    scrollTo(0, y);
  });
}
