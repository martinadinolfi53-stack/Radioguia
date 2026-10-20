// Sección Juegos: menú de juegos, Mi perfil (nivel, racha, medallas y estadísticas por pilar y por zona).
// Rutas: #juegos · #juegos-perfil
// Todo lo de esta pantalla vive en este dispositivo y funciona sin cuenta. Desafío del día, Grupos y Ranking necesitan
// la cuenta (Firebase) y se muestran como "próximamente" hasta que estén conectados.
// Las estadísticas se acumulan con cada repaso terminado (evento rg:repaso-resultado de js/repaso.js), así no se pierden
// cuando el repaso descarta resultados viejos (guarda los últimos 50).
import { proyeccionPorId } from "./datos.js";
import { esc, icono, cabecera } from "./util.js";
import { GRUPOS, grupoDeRegion } from "./menu.js";
import { ASPECTOS } from "./repaso-preguntas.js";
import { resultados, empezarRepaso } from "./repaso.js";

const K_STATS = "radioguia.juegos.stats";
const local = (() => { try { return localStorage; } catch { return null; } })();
const leer = () => { try { return JSON.parse(local?.getItem(K_STATS)) || null; } catch { return null; } };
const guardar = () => { try { local?.setItem(K_STATS, JSON.stringify(st)); } catch {} };

// práctica libre: experiencia por respuesta correcta; el nivel sube con la experiencia
const XP_POR_ACIERTO = 10;
const NIVELES = [
  { desde: 0, nombre: "Estudiante" },
  { desde: 500, nombre: "Técnico" },
  { desde: 1500, nombre: "Licenciado" },
  { desde: 3500, nombre: "Especialista" },
  { desde: 7000, nombre: "Jefe de servicio" },
];
const MIN_RESPUESTAS = 5; // menos que esto no alcanza para decir si un pilar es fuerte o débil

const nuevo = () => ({ v: 1, xp: 0, repasos: 0, aciertos: 0, respuestas: 0, dias: [], aspectos: {}, zonas: {}, fichas: {}, contados: [] });
let st = leer() || nuevo();

const hoy = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sumar = (obj, k, ok) => { const x = (obj[k] ||= { n: 0, ok: 0 }); x.n++; if (ok) x.ok++; };

function contar(res) {
  if (!res?.id || st.contados.includes(res.id)) return false;
  st.contados = [res.id, ...st.contados].slice(0, 200);
  st.repasos++;
  for (const d of res.detalle || []) {
    st.respuestas++;
    if (d.ok) { st.aciertos++; st.xp += XP_POR_ACIERTO; }
    sumar(st.aspectos, d.aspecto, d.ok);
    const zona = grupoDeRegion[proyeccionPorId[d.ficha]?.region]?.id;
    if (zona) sumar(st.zonas, zona, d.ok);
    sumar(st.fichas, d.ficha, d.ok);
  }
  const dia = hoy(new Date(res.fecha || Date.now()));
  if (!st.dias.includes(dia)) st.dias = [...st.dias, dia].sort().slice(-400);
  return true;
}

// días seguidos jugando, contando hasta hoy (o hasta ayer, si hoy todavía no jugó)
function racha() {
  const dias = new Set(st.dias);
  const d = new Date();
  if (!dias.has(hoy(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(hoy(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function mejorRacha() {
  let mejor = 0, n = 0, antes = null;
  for (const s of st.dias) {
    const d = new Date(s + "T12:00");
    n = antes && (d - antes) / 864e5 < 1.5 ? n + 1 : 1;
    mejor = Math.max(mejor, n); antes = d;
  }
  return mejor;
}

function nivel() {
  const i = NIVELES.findLastIndex((x) => st.xp >= x.desde);
  const sig = NIVELES[i + 1];
  return { ...NIVELES[i], numero: i + 1, sig, avance: sig ? (st.xp - NIVELES[i].desde) / (sig.desde - NIVELES[i].desde) : 1 };
}

const medallas = () => [
  { nombre: "Primer repaso", detalle: "Terminá un repaso", ok: st.repasos >= 1 },
  { nombre: "Constante", detalle: "7 días seguidos jugando", ok: mejorRacha() >= 7 },
  { nombre: "Cien aciertos", detalle: "100 respuestas correctas", ok: st.aciertos >= 100 },
  { nombre: "Maratón", detalle: "25 repasos terminados", ok: st.repasos >= 25 },
  { nombre: "Todoterreno", detalle: "Respondé preguntas de 10 zonas distintas", ok: Object.keys(st.zonas).length >= 10 },
  { nombre: "Mil aciertos", detalle: "1000 respuestas correctas", ok: st.aciertos >= 1000 },
];

// pilares (aspectos) y zonas ordenados por % de aciertos; los de pocas respuestas quedan aparte
function ranking(obj, nombre) {
  return Object.entries(obj).map(([id, x]) => ({ id, nombre: nombre(id), n: x.n, ok: x.ok, pct: Math.round((x.ok / x.n) * 100) }))
    .filter((x) => x.nombre).sort((a, b) => b.pct - a.pct || b.n - a.n);
}
const pilares = () => ranking(st.aspectos, (id) => ASPECTOS.find((a) => a.id === id)?.nombre);
const zonas = () => ranking(st.zonas, (id) => GRUPOS.find((g) => g.id === id)?.nombre);

// los dos pilares y las dos zonas más flojos (con respuestas suficientes y menos de 80 % de aciertos)
function debiles() {
  const flojos = (l) => l.filter((x) => x.n >= MIN_RESPUESTAS && x.pct < 80).slice(-2);
  return { pilares: flojos(pilares()), zonas: flojos(zonas()) };
}

// ---------- pantallas ----------
export function vistaJuegos(h) {
  return h.startsWith("#juegos-perfil") ? vistaPerfil() : vistaMenu();
}

function vistaMenu() {
  const nv = nivel(), r = racha(), deb = debiles();
  const tarjeta = (href, titulo, detalle, extra = "") => href
    ? `<a class="jg-tarjeta" href="${href}"><span><b>${titulo}</b><small>${detalle}</small></span>${extra}${icono.chev}</a>`
    : `<div class="jg-tarjeta pronto" aria-disabled="true"><span><b>${titulo}</b><small>${detalle}</small></span><em>Próximamente</em></div>`;
  return cabecera({ titulo: "Juegos", sub: "Repasá jugando", atras: "#" }) + `
  <main class="wrap juegos">
    <a class="jg-yo" href="#juegos-perfil">
      <span class="jg-nivel">${nv.numero}</span>
      <span><b>${esc(nv.nombre)}</b><small>${st.xp} de experiencia${r ? ` · ${r} ${r === 1 ? "día seguido" : "días seguidos"}` : ""}</small></span>${icono.chev}
    </a>
    <div class="jg-lista">
      ${tarjeta("", "Desafío del día", "Las mismas preguntas para todo tu grupo, con 5 vidas. Suma al ranking.")}
      ${tarjeta("#repaso", "Práctica libre", "Todas las veces que quieras, para parciales y exámenes. Suma experiencia y estadísticas.")}
      ${deb.pilares.length || deb.zonas.length
        ? `<button class="jg-tarjeta debiles" data-jg="debiles"><span><b>Repasar mis débiles</b><small>${[...deb.pilares, ...deb.zonas].map((x) => esc(x.nombre)).join(" · ")}</small></span>${icono.chev}</button>`
        : `<div class="jg-tarjeta pronto"><span><b>Repasar mis débiles</b><small>Aparece cuando tengas algunos repasos hechos y algo para reforzar.</small></span></div>`}
      ${tarjeta("", "Grupos", "Creá un grupo e invitá a tus compañeros con un link.")}
      ${tarjeta("", "Ranking", "Semanal e histórico de tu grupo.")}
      ${tarjeta("#juegos-perfil", "Mi perfil", "Tu nivel, medallas, pilares fuertes y para mejorar.")}
    </div>
    <p class="pie" id="jg-aviso" hidden></p>
    <p class="pie">Desafío, grupos y ranking necesitan una cuenta; se activan cuando estén listos.</p>
  </main>`;
}

const barra = (x) => `<div class="jg-fila"><span><b>${esc(x.nombre)}</b><small>${x.ok} de ${x.n} correctas</small></span>
  <span class="jg-pct ${x.pct >= 80 ? "ok" : x.pct >= 50 ? "medio" : "mal"}">${x.pct}%</span>
  <span class="jg-barra" aria-hidden="true"><i style="width:${x.pct}%"></i></span></div>`;

function bloque(titulo, lista) {
  const conDatos = lista.filter((x) => x.n >= MIN_RESPUESTAS), pocos = lista.filter((x) => x.n < MIN_RESPUESTAS);
  if (!conDatos.length) return `<section class="panel"><h2>${titulo}</h2><p class="jg-nota">Todavía hay pocas respuestas. Con ${MIN_RESPUESTAS} o más por cada uno aparecen acá.</p></section>`;
  const fuertes = conDatos.filter((x) => x.pct >= 80), mejorar = conDatos.filter((x) => x.pct < 80).reverse();
  return `<section class="panel"><h2>${titulo}</h2>
    ${fuertes.length ? `<h3 class="jg-sub ok">Fuertes</h3>${fuertes.map(barra).join("")}` : ""}
    ${mejorar.length ? `<h3 class="jg-sub mal">Para mejorar</h3>${mejorar.map(barra).join("")}` : ""}
    ${pocos.length ? `<p class="jg-nota">Con pocas respuestas todavía: ${pocos.map((x) => esc(x.nombre)).join(", ")}.</p>` : ""}
  </section>`;
}

function vistaPerfil() {
  const nv = nivel(), r = racha(), deb = debiles();
  const pct = st.respuestas ? Math.round((st.aciertos / st.respuestas) * 100) : 0;
  const hayDebiles = deb.pilares.length || deb.zonas.length;
  return cabecera({ titulo: "Mi perfil", sub: "Tu desempeño en este dispositivo", atras: "#juegos" }) + `
  <main class="wrap juegos">
    <section class="jg-perfil">
      <span class="jg-nivel grande">${nv.numero}</span>
      <div><b>${esc(nv.nombre)}</b>
        <small>${nv.sig ? `${st.xp} / ${nv.sig.desde} de experiencia para ${esc(nv.sig.nombre)}` : `${st.xp} de experiencia · nivel máximo`}</small>
        <span class="jg-barra" aria-hidden="true"><i style="width:${Math.round(nv.avance * 100)}%"></i></span></div>
    </section>
    <div class="jg-numeros">
      <div><b>${r}</b><small>${r === 1 ? "día seguido" : "días seguidos"}</small></div>
      <div><b>${st.repasos}</b><small>repasos</small></div>
      <div><b>${pct}%</b><small>aciertos</small></div>
    </div>
    ${!st.respuestas ? `<div class="vacio"><b>Todavía no jugaste.</b> Terminá un repaso en Práctica libre y acá vas a ver tus pilares fuertes y los que tenés que reforzar.</div>
      <a class="btn" href="#repaso">Ir a Práctica libre</a>` : `
    ${hayDebiles ? `<button class="rp-empezar" data-jg="debiles">Repasar mis débiles</button>
      <p class="jg-nota">${[...deb.pilares, ...deb.zonas].map((x) => esc(x.nombre)).join(" · ")}</p>` : ""}
    ${bloque("Pilares", pilares())}
    ${bloque("Zonas", zonas())}`}
    <section class="panel"><h2>Medallas</h2><div class="jg-medallas">${medallas().map((m) =>
      `<div class="jg-medalla${m.ok ? " on" : ""}"><b>${esc(m.nombre)}</b><small>${esc(m.detalle)}</small></div>`).join("")}</div></section>
    <p class="pie" id="jg-aviso" hidden></p>
  </main>`;
}

// arma un repaso con las fichas de las zonas flojas (primero las que tuvieron errores) y los pilares flojos
function repasarDebiles() {
  const deb = debiles();
  const zonasDeb = new Set(deb.zonas.map((x) => x.id));
  const conError = Object.entries(st.fichas).filter(([, x]) => x.ok < x.n).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([id]) => id);
  let fichas = conError.filter((id) => zonasDeb.has(grupoDeRegion[proyeccionPorId[id]?.region]?.id));
  if (fichas.length < 3) fichas = [...new Set([...fichas, ...conError])];
  if (fichas.length < 3) fichas = [...new Set([...fichas, ...Object.keys(st.fichas)])];
  const aspectos = deb.pilares.length ? deb.pilares.map((x) => x.id) : ASPECTOS.map((a) => a.id);
  const origen = { tipo: "debiles", nombre: "Mis débiles" };
  return empezarRepaso({ fichas, aspectos, cantidad: 10, origen }) || empezarRepaso({ fichas, cantidad: 10, origen });
}

// ---------- eventos ----------
export function iniciarJuegos(app) {
  // los repasos que ya estaban guardados antes de esta pantalla también cuentan
  let cambio = false;
  for (const res of resultados().slice().reverse()) cambio = contar(res) || cambio;
  if (cambio) guardar();
  addEventListener("rg:repaso-resultado", (e) => { if (contar(e.detail)) guardar(); });

  app.addEventListener("click", (e) => {
    const t = e.target.closest("[data-jg]");
    if (t?.dataset.jg !== "debiles") return;
    if (!repasarDebiles()) {
      const aviso = document.getElementById("jg-aviso");
      aviso.textContent = "No se pudo armar un repaso con tus enfoques débiles. Probá en Práctica libre.";
      aviso.hidden = false;
    }
  });
}
