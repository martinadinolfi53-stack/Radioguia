// Juegos en grupo: cuenta (apodo o Google), grupos con link de invitación o código, desafío del día con vidas y ranking.
// Rutas: #juegos-cuenta · #juegos-foto · #juegos-grupos · #juegos-nuevo · #juegos-grupo-<gid>[-historico] · #juegos-editar-<gid>
//        #juegos-unirse-<gid> (link de invitación) · #juegos-desafio[-<gid>]
// Los datos viven en Firebase (js/nube.js). Las pantallas se dibujan con lo que haya y se vuelven a dibujar cuando llega la respuesta.
import { proyecciones, proyeccionPorId, regionPorId } from "./datos.js";
import * as almacen from "./almacen.js";
import { esc, icono, cabecera } from "./util.js";
import { GRUPOS, grupoDeRegion } from "./menu.js";
import { ASPECTOS, CAMPOS, generarPreguntas } from "./repaso-preguntas.js";
import * as nube from "./nube.js";
import { cerrarSesion } from "./sync-favoritos.js";
import { registrarDesafio } from "./juegos.js";
import { vistaFoto, avatar, iniciarFoto } from "./foto.js";

let rerender = () => {};
const local = (() => { try { return localStorage; } catch { return null; } })();
const leer = (k, def) => { try { const v = local?.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const escribir = (k, v) => { try { v == null ? local?.removeItem(k) : local?.setItem(k, JSON.stringify(v)); } catch {} };
const zonaDe = (region) => [grupoDeRegion[region]?.id || "", grupoDeRegion[region]?.familia.nombre || ""];

// ---------- datos que llegan de la nube ----------
const cache = {}; // clave → { ok, datos, error, cargando }
function dato(clave, cargar) {
  const c = cache[clave];
  if (c && !c.viejo) return c;
  if (!c?.cargando) {
    const hash = location.hash;
    cache[clave] = { ...c, cargando: true };
    cargar().then((datos) => { cache[clave] = { ok: true, datos }; }, (e) => { cache[clave] = { error: mensaje(e) }; })
      .finally(() => { if (location.hash === hash) rerender(); });
  }
  return cache[clave];
}
const olvidar = (...prefijos) => Object.keys(cache).forEach((k) => prefijos.some((p) => k.startsWith(p)) && (cache[k].viejo = true));

function mensaje(e) {
  const c = e?.code || "";
  if (c.includes("network") || c === "unavailable") return "No hay conexión. Probá de nuevo cuando tengas internet.";
  if (c.includes("popup-closed") || c.includes("cancelled-popup")) return "Se cerró la ventana de Google antes de terminar.";
  if (c.includes("popup-blocked")) return "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes e intentá otra vez.";
  if (c.includes("credential-already-in-use")) return "Esa cuenta de Google ya está usada por otro jugador. Salí y entrá directamente con Google.";
  if (c.includes("unauthorized-domain")) return "Falta autorizar esta página en Firebase (Authentication > Configuración > Dominios autorizados).";
  if (c.includes("operation-not-allowed") || c.includes("admin-restricted")) return "Ese tipo de ingreso no está habilitado en Firebase.";
  if (c.includes("permission-denied")) return "No tenés permiso para esto (¿seguís en el grupo?).";
  return e?.message || "Algo salió mal.";
}

const cargando = (titulo, atras) => cabecera({ titulo, atras }) + `<main class="wrap juegos"><div class="vacio">Cargando…</div></main>`;
const fallo = (titulo, atras, texto) => cabecera({ titulo, atras }) + `<main class="wrap juegos"><div class="vacio"><b>No se pudo cargar.</b> ${esc(texto)}</div><button class="btn" data-gr="reintentar">Reintentar</button></main>`;

// pide estar logueado; si no, manda a la cuenta y vuelve después
function conCuenta(titulo, atras, fn) {
  const c = dato("sesion", async () => { await nube.iniciar(); return true; });
  if (c.error) return fallo(titulo, atras, c.error);
  if (!c.ok) return cargando(titulo, atras);
  if (!nube.estado().usuario || !nube.estado().perfil?.apodo) {
    escribir("radioguia.juegos.despues", location.hash);
    history.replaceState(null, "", "#juegos-cuenta");
    return vistaCuenta();
  }
  // la foto de perfil es obligatoria antes de jugar en grupo
  if (!nube.estado().perfil.foto) {
    escribir("radioguia.juegos.despues", location.hash);
    history.replaceState(null, "", "#juegos-foto");
    return pantallaFoto();
  }
  return fn();
}

const pantallaFoto = () => vistaFoto({ titulo: "Tu foto", sub: nube.estado().perfil?.apodo, atras: nube.estado().perfil?.foto ? "#juegos-cuenta" : "#juegos", listo: despues });

// vuelve a la pantalla que pidió la cuenta o la foto (por ejemplo, el link de invitación)
function despues() {
  const h = leer("radioguia.juegos.despues", null);
  escribir("radioguia.juegos.despues", null);
  if (h && h !== "#juegos-foto") location.hash = h;
  else if (location.hash === "#juegos-foto") location.hash = "#juegos-grupos";
}

// ---------- pantallas ----------
export function vistaGrupos(h) {
  if (h === "#juegos-cuenta") return vistaCuenta();
  if (h === "#juegos-foto") return nube.estado().perfil?.apodo ? pantallaFoto() : vistaCuenta();
  if (h === "#juegos-grupos") return conCuenta("Grupos", "#juegos", vistaListaGrupos);
  if (h === "#juegos-nuevo") return conCuenta("Nuevo grupo", "#juegos-grupos", () => vistaFormGrupo(null));
  if (h.startsWith("#juegos-editar-")) return conCuenta("Editar grupo", "#juegos-grupos", () => vistaFormGrupo(h.slice(15)));
  if (h.startsWith("#juegos-unirse-")) return conCuenta("Unirse", "#juegos", () => vistaUnirse(h.slice(15)));
  if (h.startsWith("#juegos-grupo-")) {
    const resto = h.slice(14), hist = resto.endsWith("-historico");
    return conCuenta("Grupo", "#juegos-grupos", () => vistaGrupo(hist ? resto.slice(0, -10) : resto, hist));
  }
  if (h.startsWith("#juegos-desafio")) return conCuenta("Desafío del día", "#juegos", () => vistaDesafio(h.slice(16)));
  return null;
}

function vistaCuenta() {
  const c = dato("sesion", async () => { await nube.iniciar(); return true; });
  if (c.error) return fallo("Tu cuenta", "#juegos", c.error);
  if (!c.ok) return cargando("Tu cuenta", "#juegos");
  const { usuario, perfil, conGoogle } = nube.estado();
  const err = cache.errCuenta ? `<p class="jg-error">${esc(cache.errCuenta)}</p>` : "";
  if (!usuario || !perfil?.apodo) return cabecera({ titulo: "Tu cuenta", sub: "Para jugar en grupo", atras: "#juegos" }) + `
  <main class="wrap juegos">
    <section class="panel"><h2>Entrar con un apodo</h2>
      <p class="jg-nota">Es lo único que ven tus compañeros en el ranking. No hace falta mail ni contraseña.</p>
      <form id="gr-apodo" class="jg-form"><input name="apodo" maxlength="24" autocomplete="nickname" placeholder="Tu apodo" value="${esc(perfil?.apodo || "")}" required>
        <button class="rp-empezar" type="submit">Entrar</button></form>
    </section>
    <section class="panel"><h2>O con tu cuenta de Google</h2>
      <p class="jg-nota">Así no perdés tus grupos, tus puntos ni tus favoritos si cambiás de celular o borrás el navegador.</p>
      <button class="btn jg-google" data-gr="google">Entrar con Google</button>
    </section>
    ${err}
  </main>`;
  if (!perfil.foto) return pantallaFoto();
  return cabecera({ titulo: "Tu cuenta", atras: "#juegos" }) + `
  <main class="wrap juegos">
    <section class="panel ft-cuenta">${avatar(perfil.foto, perfil.apodo, "grande")}
      <button class="btn" data-gr="cambiar-foto">Cambiar foto</button>
    </section>
    <section class="panel"><h2>Tu apodo</h2>
      <form id="gr-apodo" class="jg-form"><input name="apodo" maxlength="24" value="${esc(perfil.apodo)}" required>
        <button class="btn" type="submit">Guardar</button></form>
    </section>
    <section class="panel"><h2>Cuenta</h2>
      ${conGoogle ? `<p class="jg-nota">Conectada con Google (${esc(usuario.email || "")}): tus grupos, puntos y favoritos te siguen en cualquier dispositivo.</p>`
        : `<p class="jg-nota">Estás jugando solo con apodo, en este dispositivo. Si lo vinculás con Google, no perdés tus grupos, tus puntos ni tus favoritos si cambiás de celular.</p>
          <button class="btn jg-google" data-gr="google">Vincular con Google</button>`}
      <button class="btn jg-salir" data-gr="salir">Salir</button>
    </section>
    ${err}
  </main>`;
}

function vistaListaGrupos() {
  const c = dato("grupos", () => nube.misGrupos());
  const cuerpo = c.error ? `<div class="vacio">${esc(c.error)}</div>` : !c.ok ? `<div class="vacio">Cargando…</div>`
    : c.datos.length ? `<div class="jg-lista">${c.datos.map((g) => `<a class="jg-tarjeta" href="#juegos-grupo-${esc(g.id)}"><span><b>${esc(g.nombre)}</b><small>${g.fichas.length} enfoques · código ${esc(g.codigo)}</small></span>${icono.chev}</a>`).join("")}</div>`
    : `<div class="vacio"><b>Todavía no estás en ningún grupo.</b> Creá uno e invitá a tus compañeros, o unite con el código que te pasaron.</div>`;
  return cabecera({ titulo: "Grupos", sub: nube.estado().perfil?.apodo, atras: "#juegos", derecha: `<a class="ico" href="#juegos-cuenta" aria-label="Tu cuenta">${icono.ajustes}</a>` }) + `
  <main class="wrap juegos">
    ${cuerpo}
    <a class="rp-empezar jg-centro" href="#juegos-nuevo">Crear un grupo</a>
    <section class="panel"><h2>Unirme con un código</h2>
      <form id="gr-codigo" class="jg-form"><input name="codigo" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="Ej: K7MPQ2" required>
        <button class="btn" type="submit">Unirme</button></form>
      ${cache.errCodigo ? `<p class="jg-error">${esc(cache.errCodigo)}</p>` : ""}
    </section>
  </main>`;
}

// listas de favoritos (si existe el módulo de varias listas) o la lista única
function listas() {
  try { const l = almacen.listas?.todas?.(); if (Array.isArray(l) && l.length) return l; } catch {}
  let ids = [];
  try { ids = almacen.favoritos?.lista?.() || []; } catch {}
  return [{ id: "favoritos", nombre: "Favoritos", ids }];
}

// el creador elige qué enfoques entran en el desafío: todos, una lista de favoritos o zonas del menú
let form = null;
function vistaFormGrupo(gid) {
  let g = null;
  if (gid) {
    const c = dato(`grupo:${gid}`, () => nube.leerGrupo(gid));
    if (c.error) return fallo("Editar grupo", `#juegos-grupo-${gid}`, c.error);
    if (!c.ok) return cargando("Editar grupo", `#juegos-grupo-${gid}`);
    g = c.datos;
  }
  if (!form || form.gid !== gid) form = { gid, nombre: g?.nombre || "", origen: g ? "elegidos" : "todas", zonas: new Set(), lista: listas()[0]?.id, elegidos: new Set(g?.fichas || []) };
  const ls = listas();
  const fichas = fichasDelForm();
  const op = (val, txt, det) => `<button type="button" class="opcion rp-op${form.origen === val ? " on" : ""}" data-gr="origen" data-val="${val}" aria-pressed="${form.origen === val}"><span>${txt}</span><small>${det}</small></button>`;
  return cabecera({ titulo: gid ? "Editar grupo" : "Nuevo grupo", atras: gid ? `#juegos-grupo-${gid}` : "#juegos-grupos" }) + `
  <main class="wrap juegos repaso">
    <section class="panel"><h2>Nombre</h2>
      <input id="gr-nombre" class="jg-input" maxlength="40" placeholder="Ej: Técnicas 1 · Comisión B" value="${esc(form.nombre)}"></section>
    <section class="panel"><h2>¿De qué enfoques salen las preguntas?</h2>
      <div class="opciones rp-col">
        ${gid ? op("elegidos", "Los que tiene ahora", `${form.elegidos.size} enfoques`) : ""}
        ${op("todas", "Todos los enfoques", `${proyecciones.length} enfoques`)}
        ${ls.map((l) => op(`lista:${l.id}`, esc(l.nombre), `${l.ids.length} ${l.ids.length === 1 ? "enfoque" : "enfoques"} de tus favoritos`)).join("")}
        ${op("zonas", "Elegir zonas", `${form.zonas.size} ${form.zonas.size === 1 ? "zona elegida" : "zonas elegidas"}`)}
      </div>
      ${form.origen === "zonas" ? `<div class="jg-zonas">${GRUPOS.map((z) => `<label class="rp-check"><input type="checkbox" data-gr-zona="${z.id}" ${form.zonas.has(z.id) ? "checked" : ""}><span>${esc(z.nombre)}</span></label>`).join("")}</div>` : ""}
    </section>
    <button class="rp-empezar" data-gr="guardar-grupo" ${fichas.length ? "" : "disabled"}>${gid ? "Guardar" : `Crear el grupo con ${fichas.length} enfoques`}</button>
    ${cache.errForm ? `<p class="jg-error">${esc(cache.errForm)}</p>` : ""}
  </main>`;
}
function fichasDelForm() {
  if (form.origen === "todas") return proyecciones.map((p) => p.id);
  if (form.origen === "elegidos") return [...form.elegidos];
  if (form.origen === "zonas") { const regs = new Set(GRUPOS.filter((z) => form.zonas.has(z.id)).flatMap((z) => z.regiones)); return proyecciones.filter((p) => regs.has(p.region)).map((p) => p.id); }
  const l = listas().find((x) => `lista:${x.id}` === form.origen);
  return proyecciones.filter((p) => l?.ids.includes(p.id)).map((p) => p.id);
}
const nombreOrigen = () => form.origen === "todas" ? "Todos los enfoques" : form.origen === "zonas" ? "Zonas: " + GRUPOS.filter((z) => form.zonas.has(z.id)).map((z) => z.nombre).join(", ")
  : form.origen === "elegidos" ? "" : listas().find((x) => `lista:${x.id}` === form.origen)?.nombre || "";

function vistaUnirse(gid) {
  if (nube.estado().perfil?.grupos?.includes(gid)) { history.replaceState(null, "", `#juegos-grupo-${gid}`); return vistaGrupo(gid, false); }
  const c = dato(`grupo:${gid}`, () => nube.leerGrupo(gid));
  if (c.error) return fallo("Unirse", "#juegos", c.error);
  if (!c.ok) return cargando("Unirse", "#juegos");
  return cabecera({ titulo: "Unirse al grupo", atras: "#juegos" }) + `
  <main class="wrap juegos">
    <section class="jg-invitacion"><small>Te invitaron a</small><b>${esc(c.datos.nombre)}</b><small>${c.datos.fichas.length} enfoques en el desafío del día</small></section>
    <button class="rp-empezar" data-gr="unirse" data-gid="${esc(gid)}">Unirme como ${esc(nube.estado().perfil.apodo)}</button>
    ${cache.errUnirse ? `<p class="jg-error">${esc(cache.errUnirse)}</p>` : ""}
  </main>`;
}

const linkInvitacion = (gid) => `${location.origin}${location.pathname}#juegos-unirse-${gid}`;
const tiempo = (ms) => { const s = Math.round(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`; };

function vistaGrupo(gid, hist) {
  const cg = dato(`grupo:${gid}`, () => nube.leerGrupo(gid));
  if (cg.error) return fallo("Grupo", "#juegos-grupos", cg.error);
  if (!cg.ok) return cargando("Grupo", "#juegos-grupos");
  const g = cg.datos, yo = nube.uid(), soyCreador = g.creador === yo;
  const hoyP = dato(`hoy:${gid}`, () => nube.partidaDeHoy(gid));
  const lista = hist ? dato(`miembros:${gid}`, () => nube.miembros(gid)) : dato(`semana:${gid}`, () => nube.partidasDeSemana(gid));
  let filas = "";
  if (lista.error) filas = `<div class="vacio">${esc(lista.error)}</div>`;
  else if (!lista.ok) filas = `<div class="vacio">Cargando…</div>`;
  else {
    const rk = hist ? lista.datos.map((m) => ({ uid: m.uid, apodo: m.apodo, foto: m.foto, puntos: m.puntos || 0, det: `${m.partidas || 0} ${m.partidas === 1 ? "desafío" : "desafíos"}${m.racha > 1 ? ` · ${m.racha} días seguidos` : ""}`, t: 0 }))
      : Object.values(lista.datos.filter((p) => p.terminada).reduce((a, p) => {
          const x = (a[p.uid] ||= { uid: p.uid, apodo: p.apodo, puntos: 0, n: 0, ok: 0, t: 0 });
          x.puntos += p.puntos; x.n++; x.ok += p.correctas; x.t += p.duracionMs || 0; x.apodo = p.apodo; return a;
        }, {})).map((x) => ({ ...x, det: `${x.n} ${x.n === 1 ? "desafío" : "desafíos"} · ${x.ok} correctas` }));
    // las fotos están en los miembros; el ranking de la semana sale de las partidas
    const fotos = Object.fromEntries((hist ? lista : dato(`miembros:${gid}`, () => nube.miembros(gid))).datos?.map((m) => [m.uid, m.foto]) || []);
    rk.sort((a, b) => b.puntos - a.puntos || a.t - b.t);
    filas = rk.length ? `<ol class="jg-ranking">${rk.map((x, i) => `<li class="${x.uid === yo ? "yo" : ""}"><span class="jg-pos">${i + 1}</span>${avatar(fotos[x.uid], x.apodo)}<span><b>${esc(x.apodo)}</b><small>${esc(x.det)}</small></span><b class="jg-pts">${x.puntos}</b></li>`).join("")}</ol>`
      : `<div class="vacio">${hist ? "Todavía nadie jugó." : "Esta semana todavía nadie jugó el desafío. ¡Sé el primero!"}</div>`;
  }
  const jugado = hoyP.ok && hoyP.datos;
  const boton = !hoyP.ok ? "" : jugado?.terminada
    ? `<div class="jg-hecho"><b>Desafío de hoy: ${jugado.puntos} puntos</b><small>${jugado.correctas} correctas${jugado.sinVidas ? " · te quedaste sin vidas" : ""}. Mañana hay uno nuevo.</small></div>`
    : jugado ? `<div class="jg-hecho"><b>Ya empezaste el desafío de hoy</b><small>Si se cortó, seguí desde donde quedaste.</small></div><a class="rp-empezar jg-centro" href="#juegos-desafio-${esc(gid)}">Seguir</a>`
    : `<a class="rp-empezar jg-centro" href="#juegos-desafio-${esc(gid)}">Jugar el desafío del día</a>`;
  return cabecera({ titulo: g.nombre, sub: `${g.fichas.length} enfoques · código ${g.codigo}`, atras: "#juegos-grupos" }) + `
  <main class="wrap juegos">
    ${boton}
    <div class="jg-pestanas" role="tablist">
      <a href="#juegos-grupo-${esc(gid)}" role="tab" aria-selected="${!hist}" class="${hist ? "" : "on"}">Esta semana</a>
      <a href="#juegos-grupo-${esc(gid)}-historico" role="tab" aria-selected="${hist}" class="${hist ? "on" : ""}">Histórico</a>
    </div>
    ${filas}
    <section class="panel"><h2>Invitar compañeros</h2>
      <p class="jg-nota">Mandales el link, o que escriban el código <b class="jg-codigo">${esc(g.codigo)}</b> en Juegos › Grupos.</p>
      <button class="btn" data-gr="invitar" data-gid="${esc(gid)}" data-nombre="${esc(g.nombre)}" data-codigo="${esc(g.codigo)}">Compartir invitación</button>
      <p class="pie" id="gr-compartido" hidden></p>
    </section>
    ${soyCreador ? panelCreador(gid, g) : ""}
    <button class="btn jg-salir" data-gr="dejar" data-gid="${esc(gid)}">Salir del grupo</button>
  </main>`;
}

// para Martin (o quien cree el grupo): cómo viene la dificultad en la última semana, para ajustar vidas y preguntas
function panelCreador(gid, g) {
  const desde = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return nube.hoy(d); })();
  const c = dato(`metricas:${gid}`, () => nube.partidasDesde(gid, desde));
  let cuerpo = "Cargando…";
  if (c.error) cuerpo = esc(c.error);
  else if (c.ok) {
    const ps = c.datos.filter((p) => p.terminada);
    if (!ps.length) cuerpo = "Cuando jueguen el desafío vas a ver acá cómo les va.";
    else {
      const sinVidas = ps.filter((p) => p.sinVidas).length, prom = ps.reduce((a, p) => a + p.correctas, 0) / ps.length;
      const resp = ps.reduce((a, p) => a + p.respondidas, 0), ok = ps.reduce((a, p) => a + p.correctas, 0);
      const fallas = {};
      for (const p of ps) for (const d of p.detalle || []) { const [f, campo, bien] = d.split("|"); const k = `${f}|${campo}`; const x = (fallas[k] ||= { f, campo, n: 0, mal: 0 }); x.n++; if (bien !== "1") x.mal++; }
      const peores = Object.values(fallas).filter((x) => x.mal).sort((a, b) => b.mal / b.n - a.mal / a.n || b.mal - a.mal).slice(0, 5);
      cuerpo = `<div class="jg-numeros">
          <div><b>${ps.length}</b><small>desafíos jugados</small></div>
          <div><b>${Math.round((sinVidas / ps.length) * 100)}%</b><small>se quedaron sin vidas</small></div>
          <div><b>${resp ? Math.round((ok / resp) * 100) : 0}%</b><small>aciertos</small></div>
        </div>
        <p class="jg-nota">Promedio: ${prom.toFixed(1)} correctas por desafío. Si casi nadie se queda sin vidas, está fácil; si más de la mitad se queda sin vidas, está difícil.</p>
        ${peores.length ? `<h3 class="jg-sub mal">Lo que más fallan</h3>${peores.map((x) => `<div class="jg-fila"><span><b>${esc(proyeccionPorId[x.f]?.nombre || x.f)}</b><small>${esc(CAMPOS.find((c) => c.id === x.campo)?.nombre || x.campo)}</small></span><span class="jg-pct mal">${x.mal} de ${x.n}</span></div>`).join("")}` : ""}`;
    }
  }
  return `<section class="panel"><h2>Solo para vos (creaste el grupo)</h2>
    <p class="jg-nota"><b>Cómo viene la dificultad</b> · últimos 7 días</p>${c.ok && c.datos.some((p) => p.terminada) ? cuerpo : `<p class="jg-nota">${cuerpo}</p>`}
    <a class="btn" href="#juegos-editar-${esc(gid)}">Cambiar nombre o enfoques</a></section>`;
}

// ---------- desafío del día ----------
const K_JUEGO = "radioguia.juegos.desafio";
let juego = leer(K_JUEGO, null); // { gid, fecha, nombre, preguntas, respuestas, actual, vidas, vidasIni, inicio, fin, resultado }
const guardarJuego = () => escribir(K_JUEGO, juego);

function vistaDesafio(gid) {
  const grupos = nube.estado().perfil?.grupos || [];
  if (!gid) {
    if (grupos.length === 1) { history.replaceState(null, "", `#juegos-desafio-${grupos[0]}`); return vistaDesafio(grupos[0]); }
    history.replaceState(null, "", "#juegos-grupos");
    return vistaListaGrupos();
  }
  const atras = `#juegos-grupo-${gid}`;
  if (juego?.gid === gid && juego.fecha === nube.hoy()) return juego.resultado ? vistaFinDesafio() : vistaPreguntaDesafio();
  const cg = dato(`grupo:${gid}`, () => nube.leerGrupo(gid));
  const cc = dato("config", () => nube.configDesafio());
  const ch = dato(`hoy:${gid}`, () => nube.partidaDeHoy(gid));
  const err = cg.error || cc.error || ch.error;
  if (err) return fallo("Desafío del día", atras, err);
  if (!cg.ok || !cc.ok || !ch.ok) return cargando("Desafío del día", atras);
  if (ch.datos) {
    history.replaceState(null, "", atras);
    return vistaGrupo(gid, false);
  }
  const g = cg.datos, conf = cc.datos;
  return cabecera({ titulo: "Desafío del día", sub: g.nombre, atras }) + `
  <main class="wrap juegos">
    <section class="jg-invitacion"><b>${conf.preguntas} preguntas · ${conf.vidas} vidas</b>
      <small>Todos los del grupo reciben las mismas preguntas hoy. Cada error te saca una vida; sin vidas, termina tu desafío.</small>
      <small>${conf.puntosPorAcierto ?? 10} puntos por respuesta correcta, más un extra si venís jugando días seguidos.</small></section>
    <p class="jg-nota jg-centro">Se juega una sola vez por día: si salís a la mitad, podés seguir desde donde quedaste.</p>
    <button class="rp-empezar" data-gr="empezar-desafio" data-gid="${esc(gid)}">Empezar</button>
    ${cache.errDesafio ? `<p class="jg-error">${esc(cache.errDesafio)}</p>` : ""}
  </main>`;
}

const corazones = (n, de) => `<span class="jg-vidas" aria-label="${n} de ${de} vidas">${"♥".repeat(n)}<i>${"♥".repeat(Math.max(0, de - n))}</i></span>`;

function vistaPreguntaDesafio() {
  const s = juego, q = s.preguntas[s.actual], p = proyeccionPorId[q.ficha];
  const resp = s.respuestas[s.actual], respondida = resp !== undefined, total = s.preguntas.length;
  const clase = (i) => !respondida ? "" : i === q.correcta ? " ok" : i === resp ? " mal" : " apagada";
  const termina = respondida && (s.vidas <= 0 || s.actual + 1 >= total);
  return cabecera({ titulo: "Desafío del día", sub: `Pregunta ${s.actual + 1} de ${total}`, atras: `#juegos-grupo-${s.gid}`, derecha: corazones(s.vidas, s.vidasIni) }) + `
  <div class="rp-barra"><span style="width:${(s.respuestas.length / total) * 100}%"></span></div>
  <main class="wrap repaso">
    <section class="rp-preg">
      ${q.conNombre ? `<p class="rp-ficha">${esc(p?.nombre)}<small>${esc(q.dato)}</small></p>` : `<p class="rp-ficha"><small>${esc(q.dato)}</small></p>`}
      <h2>${esc(q.enunciado)}</h2>
      ${q.imagen ? `<div class="rp-img"><img src="${esc(q.imagen)}" alt="Esquema de la proyección"></div>` : ""}
      ${q.cita ? `<blockquote class="rp-cita">${esc(q.cita)}</blockquote>` : ""}
    </section>
    <div class="rp-opciones">${q.opciones.map((o, i) => `<button class="rp-opcion${clase(i)}" data-gr="responder" data-val="${i}" ${respondida ? "disabled" : ""}><b>${"ABCD"[i]}</b><span>${esc(o)}</span></button>`).join("")}</div>
    ${respondida ? `<section class="rp-fb ${resp === q.correcta ? "ok" : "mal"}">
      <p><b>${resp === q.correcta ? "¡Correcto!" : s.vidas <= 0 ? "Incorrecto. Te quedaste sin vidas." : "Incorrecto, perdés una vida."}</b> ${resp === q.correcta ? "" : `La respuesta era <b>${"ABCD"[q.correcta]}</b>.`}</p>
      ${q.completa ? `<p>En la ficha: ${esc(q.completa)}</p>` : ""}
    </section>
    <button class="rp-empezar" data-gr="siguiente">${termina ? "Ver resultado" : "Siguiente"}</button>` : ""}
    ${cache.errDesafio ? `<p class="jg-error">${esc(cache.errDesafio)}</p>` : ""}
  </main>`;
}

function vistaFinDesafio() {
  const s = juego, r = s.resultado;
  const errores = s.preguntas.map((q, i) => ({ q, i })).filter(({ q, i }) => s.respuestas[i] !== undefined && s.respuestas[i] !== q.correcta);
  return cabecera({ titulo: "Desafío del día", sub: s.nombre, atras: `#juegos-grupo-${s.gid}` }) + `
  <main class="wrap juegos repaso">
    <section class="rp-puntaje ${r.sinVidas ? "mal" : r.correctas === s.preguntas.length ? "ok" : "medio"}">
      <b>${r.puntos}<small> puntos</small></b>
      <span>${r.correctas} de ${s.preguntas.length} correctas${r.sinVidas ? " · te quedaste sin vidas" : ""}</span>
      ${r.bonus ? `<small>Incluye +${r.bonus} por ${r.racha} días seguidos</small>` : ""}
      <small>Tiempo: ${tiempo(r.duracionMs)}</small>
    </section>
    <a class="rp-empezar jg-centro" href="#juegos-grupo-${esc(s.gid)}">Ver el ranking</a>
    ${errores.length ? `<p class="label">Para repasar</p><div class="lista">${errores.map(({ q, i }) => `<div class="row"><a href="#p-${esc(q.ficha)}"><span class="t">${esc(proyeccionPorId[q.ficha]?.nombre)}</span>
      <span class="s">${esc(q.enunciado)}</span><span class="rp-err">Correcta: ${esc(q.opciones[q.correcta])}</span><span class="rp-err mal">Tu respuesta: ${esc(q.opciones[s.respuestas[i]])}</span></a></div>`).join("")}</div>` : ""}
  </main>`;
}

async function empezarDesafio(gid) {
  const g = cache[`grupo:${gid}`].datos, conf = cache.config.datos;
  const fichas = g.fichas.map((id) => proyeccionPorId[id]).filter(Boolean);
  const fecha = nube.hoy();
  // misma semilla para todo el grupo ese día: todos reciben las mismas preguntas
  const preguntas = generarPreguntas({ fichas, todas: proyecciones, zonaDe, regionNombre: (id) => regionPorId[id]?.nombre || id, aspectos: g.aspectos?.length ? g.aspectos : ASPECTOS.map((a) => a.id), excluir: g.excluir || [], cantidad: conf.preguntas, semilla: `${gid}|${fecha}` });
  if (!preguntas.length) throw new Error("Con los enfoques de este grupo no se pueden armar preguntas. Pedile a quien lo creó que cambie los enfoques.");
  await nube.empezarPartida(gid, conf.vidas);
  juego = { gid, fecha, nombre: g.nombre, preguntas, respuestas: [], actual: 0, vidas: conf.vidas, vidasIni: conf.vidas, inicio: Date.now(), fin: null, resultado: null };
  guardarJuego();
}

async function terminarDesafio() {
  const s = juego;
  s.fin ||= Date.now();
  const resp = s.respuestas.map((r, i) => ({ q: s.preguntas[i], ok: r === s.preguntas[i].correcta }));
  const datos = { correctas: resp.filter((x) => x.ok).length, respondidas: resp.length, vidas: s.vidas, sinVidas: s.vidas <= 0, duracionMs: s.fin - s.inicio,
    detalle: resp.map((x) => `${x.q.ficha}|${x.q.campo}|${x.ok ? 1 : 0}`) };
  const r = await nube.terminarPartida(s.gid, datos);
  s.resultado = { ...datos, ...r };
  guardarJuego();
  // también cuenta para las estadísticas personales y la experiencia
  registrarDesafio({ id: `desafio-${s.gid}-${s.fecha}`, fecha: new Date().toISOString(), detalle: resp.map((x) => ({ ficha: x.q.ficha, aspecto: x.q.aspecto, campo: x.q.campo, ok: x.ok })) });
  olvidar(`hoy:${s.gid}`, `semana:${s.gid}`, `miembros:${s.gid}`, `metricas:${s.gid}`);
}

// ---------- eventos ----------
async function compartir(gid, nombre, codigo) {
  const url = linkInvitacion(gid), aviso = document.getElementById("gr-compartido");
  const texto = `Sumate a mi grupo "${nombre}" en RadioGuía para jugar el desafío del día. Si no abre el link, el código es ${codigo}.`;
  try {
    if (navigator.share) await navigator.share({ title: "RadioGuía · Invitación", text: texto, url });
    else { await navigator.clipboard.writeText(`${texto}\n${url}`); aviso.textContent = "Invitación copiada. Pegala en el grupo de WhatsApp."; aviso.hidden = false; }
  } catch (err) { if (err?.name !== "AbortError") { aviso.textContent = url; aviso.hidden = false; } }
}

export function iniciarGrupos(app, render) {
  rerender = () => { const y = scrollY; render(); scrollTo(0, y); };
  nube.alCambiar(() => { if (location.hash.startsWith("#juegos-")) rerender(); });
  const hacer = async (btn, clave, fn) => {
    if (btn) btn.disabled = true;
    cache[clave] = "";
    try { await fn(); } catch (e) { cache[clave] = mensaje(e); }
    rerender();
  };

  app.addEventListener("click", (e) => {
    const t = e.target.closest("[data-gr]");
    if (!t) return;
    const gid = t.dataset.gid;
    switch (t.dataset.gr) {
      case "cambiar-foto": escribir("radioguia.juegos.despues", "#juegos-cuenta"); location.hash = "#juegos-foto"; return;
      case "reintentar": Object.keys(cache).forEach((k) => cache[k]?.error && delete cache[k]); return rerender();
      case "google": return hacer(t, "errCuenta", async () => { await nube.entrarGoogle(); olvidar("grupos"); despues(); });
      case "salir":
        if (!nube.estado().conGoogle && !confirm("Estás jugando solo con apodo: si salís se borran tus favoritos de este celular y no vas a poder volver a esta cuenta ni a sus grupos y puntos. ¿Salir igual?")) return;
        return hacer(t, "errCuenta", async () => { await cerrarSesion(); Object.keys(cache).forEach((k) => k !== "sesion" && delete cache[k]); juego = null; guardarJuego(); });
      case "origen": form.origen = t.dataset.val; return rerender();
      case "guardar-grupo": return hacer(t, "errForm", async () => {
        const fichas = fichasDelForm(), origen = nombreOrigen();
        if (form.gid) { await nube.editarGrupo(form.gid, { nombre: form.nombre, fichas, ...(origen ? { origen } : {}) }); olvidar(`grupo:${form.gid}`, "grupos"); location.hash = `#juegos-grupo-${form.gid}`; }
        else { const nuevo = await nube.crearGrupo({ nombre: form.nombre, fichas, aspectos: ASPECTOS.map((a) => a.id), origen }); olvidar("grupos"); location.hash = `#juegos-grupo-${nuevo}`; }
        form = null;
      });
      case "unirse": return hacer(t, "errUnirse", async () => { await nube.unirse(gid); olvidar("grupos"); location.hash = `#juegos-grupo-${gid}`; });
      case "invitar": return compartir(gid, t.dataset.nombre, t.dataset.codigo);
      case "dejar":
        if (!confirm("¿Salir del grupo? Tus puntos en este grupo se pierden.")) return;
        return hacer(t, "errGrupo", async () => { await nube.dejarGrupo(gid); olvidar("grupos"); location.hash = "#juegos-grupos"; });
      case "empezar-desafio": return hacer(t, "errDesafio", () => empezarDesafio(gid));
      case "responder": {
        if (juego.respuestas[juego.actual] !== undefined) return;
        const v = +t.dataset.val;
        juego.respuestas[juego.actual] = v;
        if (v !== juego.preguntas[juego.actual].correcta) juego.vidas--;
        guardarJuego(); return rerender();
      }
      case "siguiente":
        if (juego.vidas > 0 && juego.actual + 1 < juego.preguntas.length) { juego.actual++; guardarJuego(); render(); return scrollTo(0, 0); }
        return hacer(t, "errDesafio", terminarDesafio).then(() => scrollTo(0, 0));
    }
  });

  // el nombre se guarda mientras se escribe, así no se pierde al tocar las opciones
  app.addEventListener("input", (e) => { if (e.target.id === "gr-nombre" && form) form.nombre = e.target.value; });

  app.addEventListener("change", (e) => {
    const z = e.target.dataset?.grZona;
    if (!z || !form) return;
    e.target.checked ? form.zonas.add(z) : form.zonas.delete(z);
    rerender();
  });

  app.addEventListener("submit", (e) => {
    const f = e.target;
    if (f.id === "gr-apodo") {
      e.preventDefault();
      return hacer(f.querySelector("button"), "errCuenta", async () => {
        const { usuario } = nube.estado();
        if (usuario) await nube.guardarApodo(f.elements.apodo.value); else await nube.entrarAnonimo(f.elements.apodo.value);
        despues();
      });
    }
    if (f.id === "gr-codigo") {
      e.preventDefault();
      return hacer(f.querySelector("button"), "errCodigo", async () => { const gid = await nube.grupoPorCodigo(f.elements.codigo.value); location.hash = `#juegos-unirse-${gid}`; });
    }
  });

  iniciarFoto(app, rerender);
}
