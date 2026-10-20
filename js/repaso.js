// Modo repaso: multiple choice sobre los enfoques de una lista de favoritos o elegidos sueltos.
// Rutas: #repaso (elegir) · #repaso-l-<lista> (elegir, con esa lista) · #repaso-jugar · #repaso-partida-<código> (partida compartida)
// Las preguntas salen de js/repaso-preguntas.js. Los resultados se guardan en este dispositivo con un formato pensado
// para mandarlos después a un ranking de grupo (ver guardarResultado).
import { proyecciones, proyeccionPorId, regionPorId } from "./datos.js";
import * as almacen from "./almacen.js";
import { esc, icono, cabecera } from "./util.js";
import { GRUPOS, grupoDeRegion } from "./menu.js";
import { ASPECTOS, generarPreguntas } from "./repaso-preguntas.js";

const K_RES = "radioguia.repaso.resultados", K_SUELTOS = "radioguia.repaso.sueltos", K_CONF = "radioguia.repaso.config", K_SESION = "radioguia.repaso.sesion";
const leer = (st, k, def) => { try { const v = st.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const escribir = (st, k, v) => { try { v == null ? st.removeItem(k) : st.setItem(k, JSON.stringify(v)); } catch {} };
const local = (() => { try { return localStorage; } catch { return null; } })();
const sesionSt = (() => { try { return sessionStorage; } catch { return null; } })();

const CANTIDADES = [10, 20, 30];
const zonaDe = (region) => [grupoDeRegion[region]?.id || "", grupoDeRegion[region]?.familia.nombre || ""];

// listas de favoritos: las arma el módulo de favoritos (almacen.listas); mientras no exista, la lista única de favoritos
function listas() {
  try { const l = almacen.listas?.todas?.(); if (Array.isArray(l) && l.length) return l; } catch {}
  return [{ id: "favoritos", nombre: "Favoritos", ids: almacen.favoritos.lista() }];
}

// cantidad 0 = todas las que se puedan armar
const conf = { origen: "lista:favoritos", aspectos: ASPECTOS.map((a) => a.id), cantidad: 10, ...leer(local, K_CONF, {}) };
let sueltos = new Set(leer(local, K_SUELTOS, []));
let sesion = leer(sesionSt, K_SESION, null);
const guardarConf = () => escribir(local, K_CONF, conf);
const guardarSesion = () => escribir(sesionSt, K_SESION, sesion);

function fichasElegidas() {
  const ids = conf.origen === "sueltos" ? [...sueltos] : listas().find((l) => `lista:${l.id}` === conf.origen)?.ids || [];
  // en el orden del manual
  return proyecciones.filter((p) => ids.includes(p.id));
}
function origenActual() {
  if (conf.origen === "sueltos") return { tipo: "sueltos", nombre: "Enfoques elegidos" };
  const l = listas().find((x) => `lista:${x.id}` === conf.origen) || listas()[0];
  return l.id === "favoritos" ? { tipo: "favoritos", nombre: l.nombre } : { tipo: "lista", id: l.id, nombre: l.nombre };
}
// si la lista guardada ya no existe, vuelve a la primera
function validarOrigen() {
  if (conf.origen === "sueltos") return;
  const ls = listas();
  if (!ls.some((l) => `lista:${l.id}` === conf.origen)) conf.origen = `lista:${ls[0].id}`;
}

export function resultados() { return leer(local, K_RES, []); }

// formato de resultado (v1), pensado para un ranking de grupo:
// { v, id, fecha, semilla, fichas, aspectos, preguntas, correctas, puntaje, duracionMs, origen: {tipo, id?, nombre}, detalle: [{ficha, aspecto, campo, ok}] }
// con semilla + fichas + aspectos + preguntas cualquiera vuelve a generar exactamente las mismas preguntas.
function guardarResultado(s) {
  const correctas = s.respuestas.filter((r, i) => r === s.preguntas[i].correcta).length;
  const res = {
    v: 1, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, fecha: new Date().toISOString(),
    semilla: s.semilla, fichas: s.fichas, aspectos: s.aspectos, preguntas: s.preguntas.length, correctas, puntaje: correctas * 100,
    duracionMs: Math.max(0, (s.fin || Date.now()) - s.inicio), origen: s.origen,
    detalle: s.preguntas.map((q, i) => ({ ficha: q.ficha, aspecto: q.aspecto, campo: q.campo, ok: s.respuestas[i] === q.correcta })),
  };
  escribir(local, K_RES, [res, ...resultados()].slice(0, 50));
  return res;
}

function empezar({ fichas, aspectos, cantidad, semilla = Math.random().toString(36).slice(2, 10), origen, preguntas, soloErrores = false }) {
  const lista = fichas.map((id) => proyeccionPorId[id]).filter(Boolean);
  preguntas ||= generarPreguntas({ fichas: lista, todas: proyecciones, zonaDe, aspectos, cantidad: cantidad || Infinity, semilla });
  if (!preguntas.length) return false;
  sesion = { semilla, fichas: lista.map((p) => p.id), aspectos, cantidad, origen, soloErrores, preguntas, respuestas: [], actual: 0, inicio: Date.now(), fin: null, resultado: null };
  guardarSesion();
  return true;
}

// partida compartida: la configuración en el link, para que todos respondan las mismas preguntas
const codificar = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const decodificar = (c) => { try { return JSON.parse(decodeURIComponent(escape(atob(c.replace(/-/g, "+").replace(/_/g, "/"))))); } catch { return null; } };
const linkPartida = (s) => `${location.origin}${location.pathname}#repaso-partida-${codificar({ s: s.semilla, f: s.fichas, a: s.aspectos, n: s.cantidad })}`;

// ---------- pantallas ----------
export function vistaRepaso(h) {
  if (h.startsWith("#repaso-partida-")) {
    const c = decodificar(h.slice(16));
    const ok = c && Array.isArray(c.f) && empezar({ fichas: c.f, aspectos: c.a || [], cantidad: +c.n || 0, semilla: String(c.s), origen: { tipo: "partida", nombre: "Partida compartida" } });
    history.replaceState(null, "", ok ? "#repaso-jugar" : "#repaso");
    if (!ok) return vistaElegir("El link de la partida no es válido o no tiene preguntas.");
  }
  if (h.startsWith("#repaso-l-")) { conf.origen = `lista:${h.slice(10)}`; guardarConf(); history.replaceState(null, "", "#repaso"); }
  if (h.startsWith("#repaso-jugar") || h.startsWith("#repaso-partida-")) return sesion ? (sesion.resultado ? vistaResultado() : vistaPregunta()) : vistaElegir();
  return vistaElegir();
}

// cuántas preguntas se pueden armar (se recuerda, porque con muchas fichas tarda)
let memo = {};
function maximo(fichas, aspectos) {
  if (!fichas.length) return 0;
  const k = fichas.map((p) => p.id).join(",") + "|" + aspectos.join(",");
  return (memo = memo.k === k ? memo : { k, n: generarPreguntas({ fichas, todas: proyecciones, zonaDe, aspectos, cantidad: Infinity, semilla: "x" }).length }).n;
}

function vistaElegir(aviso) {
  validarOrigen();
  const fichas = fichasElegidas();
  const max = maximo(fichas, conf.aspectos);
  const n = conf.cantidad ? Math.min(conf.cantidad, max) : max;
  const op = (on, attrs, txt, det = "") => `<button class="opcion rp-op${on ? " on" : ""}" ${attrs} aria-pressed="${on}"><span>${txt}</span>${det ? `<small>${det}</small>` : ""}</button>`;
  const origenes = [...listas().map((l) => op(conf.origen === `lista:${l.id}`, `data-rp="origen" data-val="lista:${esc(l.id)}"`, esc(l.nombre), `${l.ids.length} ${l.ids.length === 1 ? "enfoque" : "enfoques"}`)),
    op(conf.origen === "sueltos", 'data-rp="origen" data-val="sueltos"', "Elegir enfoques", `${sueltos.size} ${sueltos.size === 1 ? "elegido" : "elegidos"}`)].join("");
  const ultimos = resultados().slice(0, 5);
  const enCurso = sesion && !sesion.resultado && sesion.respuestas.length < sesion.preguntas.length;

  return cabecera({ titulo: "Repaso", sub: "Multiple choice con tus enfoques", atras: "#" }) + `
  <main class="wrap repaso">
    ${aviso ? `<div class="vacio">${esc(aviso)}</div>` : ""}
    ${enCurso ? `<a class="rp-seguir" href="#repaso-jugar"><span><b>Seguir el repaso</b><small>Vas por la pregunta ${sesion.actual + 1} de ${sesion.preguntas.length}</small></span>${icono.chev}</a>` : ""}
    <section class="panel"><h2>¿Qué enfoques?</h2><div class="opciones rp-col">${origenes}</div>
      ${conf.origen === "sueltos" ? selectorSueltos() : ""}</section>
    <section class="panel"><h2>¿Qué preguntar?</h2><div class="opciones rp-col">${ASPECTOS.map((a) => op(conf.aspectos.includes(a.id), `data-rp="aspecto" data-val="${a.id}"`, esc(a.nombre), esc(a.detalle))).join("")}</div></section>
    <section class="panel"><h2>¿Cuántas preguntas?</h2><div class="opciones">${CANTIDADES.map((c) => op(conf.cantidad === c, `data-rp="cantidad" data-val="${c}"`, String(c))).join("")}${op(!conf.cantidad, 'data-rp="cantidad" data-val="0"', `Todas${max ? ` (${max})` : ""}`)}</div></section>
    ${fichas.length ? "" : `<div class="vacio">${conf.origen === "sueltos" ? "Elegí al menos un enfoque de la lista de arriba." : "<b>Esta lista está vacía.</b><br>Agregá enfoques con la estrella o elegí enfoques sueltos."}</div>`}
    <button class="rp-empezar" data-rp="empezar" ${n ? "" : "disabled"}>Empezar · ${n} ${n === 1 ? "pregunta" : "preguntas"}</button>
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
  return cabecera({ titulo: "Repaso", sub: `Pregunta ${s.actual + 1} de ${total}`, atras: "#repaso" }) + `
  <div class="rp-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${s.respuestas.length}"><span style="width:${(s.respuestas.length / total) * 100}%"></span></div>
  <main class="wrap repaso">
    <section class="rp-preg">
      ${q.conNombre ? `<p class="rp-ficha">${esc(p?.nombre)}<small>${esc(regionPorId[p?.region]?.nombre || "")} · ${esc(q.dato)}</small></p>` : `<p class="rp-ficha"><small>${esc(q.dato)}</small></p>`}
      <h2>${esc(q.enunciado)}</h2>
      ${q.imagen ? `<button class="rp-img" data-ampliar="${esc(q.imagen)}" data-alt="Esquema" aria-label="Ampliar esquema"><img src="${esc(q.imagen)}" alt="Esquema de la proyección"></button>` : ""}
      ${q.cita ? `<blockquote class="rp-cita">${esc(q.cita)}</blockquote>` : ""}
    </section>
    <div class="rp-opciones">${q.opciones.map((o, i) => `<button class="rp-opcion${clase(i)}" data-rp="responder" data-val="${i}" ${respondida ? "disabled" : ""}><b>${"ABCD"[i]}</b><span>${esc(o)}</span></button>`).join("")}</div>
    ${respondida ? `<section class="rp-fb ${resp === q.correcta ? "ok" : "mal"}">
      <p><b>${resp === q.correcta ? "¡Correcto!" : "Incorrecto."}</b> ${resp === q.correcta ? "" : `La respuesta era <b>${"ABCD"[q.correcta]}</b>.`}</p>
      ${q.completa ? `<p>En la ficha: ${esc(q.completa)}</p>` : ""}
      <a class="rp-link" href="#p-${esc(q.ficha)}">${icono.libro}<span>Ver la ficha de ${esc(p?.nombre)}</span></a>
    </section>
    <button class="rp-empezar" data-rp="siguiente">${s.actual + 1 < total ? "Siguiente" : "Ver resultado"}</button>` : ""}
  </main>`;
}

function vistaResultado() {
  const s = sesion, r = s.resultado, total = s.preguntas.length;
  const pct = Math.round((r.correctas / total) * 100);
  const errores = s.preguntas.map((q, i) => ({ q, i })).filter(({ q, i }) => s.respuestas[i] !== q.correcta);
  const min = Math.floor(r.duracionMs / 60000), seg = Math.round((r.duracionMs % 60000) / 1000);
  return cabecera({ titulo: "Resultado", sub: s.origen?.nombre, atras: "#repaso" }) + `
  <main class="wrap repaso">
    <section class="rp-puntaje ${pct >= 80 ? "ok" : pct >= 50 ? "medio" : "mal"}">
      <b>${r.correctas}<small>/${total}</small></b>
      <span>${pct}% de respuestas correctas · ${r.puntaje} puntos</span>
      <small>Tiempo: ${min ? `${min} min ` : ""}${seg} s</small>
    </section>
    <div class="rp-acciones">
      ${errores.length ? `<button class="rp-empezar" data-rp="errores">Repasar los ${errores.length === 1 ? "error" : `${errores.length} errores`}</button>` : ""}
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
export function iniciarRepaso(app, render) {
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
      case "cantidad": conf.cantidad = +v; break;
      case "empezar": {
        const fichas = fichasElegidas().map((p) => p.id);
        if (empezar({ fichas, aspectos: conf.aspectos, cantidad: conf.cantidad, origen: origenActual() })) location.hash = "#repaso-jugar";
        return;
      }
      case "responder":
        if (sesion.respuestas[sesion.actual] !== undefined) return;
        sesion.respuestas[sesion.actual] = +v; guardarSesion(); break;
      case "siguiente":
        if (sesion.actual + 1 < sesion.preguntas.length) sesion.actual++;
        else { sesion.fin = Date.now(); sesion.resultado = guardarResultado(sesion); }
        guardarSesion(); render(); return scrollTo(0, 0);
      case "errores": {
        const malas = sesion.preguntas.filter((q, i) => sesion.respuestas[i] !== q.correcta);
        empezar({ ...sesion, soloErrores: true, preguntas: malas.map((q) => ({ ...q })), origen: { ...sesion.origen, nombre: `${sesion.origen?.nombre || "Repaso"} · errores` } });
        render(); return scrollTo(0, 0);
      }
      case "otra":
        empezar({ fichas: sesion.fichas, aspectos: sesion.aspectos, cantidad: sesion.cantidad, origen: sesion.origen }); render(); return scrollTo(0, 0);
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
