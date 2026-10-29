// Arranque y navegación por #hash:
// #  portada (Enfoques o Juegos) · #ajustes-fuente (Ajustes, en la parte de elegir libro) · #enfoques inicio de enfoques · #g-<botón del menú> · #g-<botón>-fav · #r-<región> · #r-<región>-fav · #p-<proyección> · #favoritos · #imprimir (lista activa) · #calc · #calc-<proyección> · #ajustes · #ayuda-app (instalar en el celular) · #repaso… (js/repaso.js) · #juegos… (js/juegos.js)
import { regionPorId, proyeccionPorId, proyecciones } from "./datos.js";
import { listas, preferencias, aplicarPreferencias } from "./almacen.js";
import { tocarEstrella, hojaLista, quitarDeLista } from "./listas-ui.js";
import { vistaImprimir, opcionesImpresion, preguntarEImprimir } from "./imprimir.js";
import { estado, vistaElegirFuente, vistaPortada, vistaAyudaApp, vistaInicio, vistaRegion, vistaGrupo, vistaFavoritos, vistaAjustes, vistaFamilia } from "./vistas.js";
import { vistaFicha } from "./ficha.js";
import { vistaCalculadora, calcEstado, calcular, resultadoHTML } from "./calculadora.js";
import { mostrarTermino } from "./glosario.js";
import { ampliar } from "./imagenes.js";
import { pwa } from "./pwa.js";
import { grupoPorId, grupoDeRegion, FAMILIAS } from "./menu.js";
import { vistaRepaso, iniciarRepaso } from "./repaso.js";
import { vistaJuegos, iniciarJuegos } from "./juegos.js";
import { iniciarGrupos } from "./grupos.js";
import { identificado, recordarDestino, vistaIdentificacion, iniciarIdentificacion } from "./identificacion.js";
import * as nube from "./nube.js";
import { vistaFoto } from "./foto.js";
import { elegida, elegirFuente } from "./fuente.js";
import { iniciarLente } from "./lente.js";
import { iniciarSyncFavoritos, cerrarSesion } from "./sync-favoritos.js";

const app = document.getElementById("app");
iniciarLente(app);
aplicarPreferencias();
listas.limpiar(new Set(proyecciones.map((p) => p.id)));

// de dónde se llegó a cada pantalla, para que "Volver" lleve al lugar correcto
let pantallaAnterior = "#";
const historial = [];

function ruta() {
  const h = decodeURIComponent(location.hash || "#");
  if (h.startsWith("#p-") && proyeccionPorId[h.slice(3)]) return { tipo: "ficha", p: proyeccionPorId[h.slice(3)] };
  if (h.startsWith("#g-")) {
    const fav = h.endsWith("-fav"), id = h.slice(3, fav ? -4 : undefined);
    if (grupoPorId[id]) return { tipo: "grupo", g: grupoPorId[id], fav };
  }
  if (h.startsWith("#r-")) {
    const fav = h.endsWith("-fav"), id = h.slice(3, fav ? -4 : undefined);
    if (regionPorId[id]) return { tipo: "region", r: regionPorId[id], fav };
  }
  if (h.startsWith("#f-")) { const f = FAMILIAS.find((x) => x.id === h.slice(3)); if (f) return { tipo: "familia", f }; }
  if (h === "#favoritos") return { tipo: "favoritos" };
  if (h === "#imprimir") return { tipo: "imprimir" };
  if (h === "#ajustes" || h === "#ajustes-fuente") return { tipo: "ajustes" };
  if (h === "#ayuda-app") return { tipo: "ayuda-app" };
  if (h === "#enfoques") return { tipo: "inicio" };
  if (h.startsWith("#repaso")) return { tipo: "repaso", h };
  if (h.startsWith("#juegos")) return { tipo: "juegos", h };
  if (h === "#calc" || h.startsWith("#calc-")) return { tipo: "calc", id: h.slice(6) || null };
  return { tipo: "portada" };
}

function volverA(r) {
  if (r.tipo === "ficha") return historial.findLast((x) => !x.startsWith("#p-") && !x.startsWith("#calc")) || `#g-${grupoDeRegion[r.p.region]?.id}`;
  if (r.tipo === "calc") return pantallaAnterior;
  return "#";
}

function render() {
  // primero hay que identificarse (una sola vez por dispositivo)
  if (!identificado()) {
    recordarDestino(location.hash);
    app.innerHTML = vistaIdentificacion();
    document.title = "RX";
    return;
  }
  // después, la foto de perfil (obligatoria); sin internet no se pide, para no trabar la app
  const cuenta = nube.estado();
  if (navigator.onLine && cuenta.listo && cuenta.usuario && cuenta.perfil && !cuenta.perfil.foto) {
    app.innerHTML = vistaFoto({ titulo: "Tu foto", sub: cuenta.perfil.apodo, listo: render });
    document.title = "RX";
    return;
  }
  // y elegir de qué libro consultar (una vez; se cambia en Ajustes)
  if (!elegida()) {
    app.innerHTML = vistaElegirFuente();
    document.title = "RX";
    return;
  }
  const r = ruta();
  const vuelta = volverA(r);
  switch (r.tipo) {
    case "ficha": app.innerHTML = vistaFicha(r.p, vuelta); break;
    case "grupo": app.innerHTML = vistaGrupo(r.g, r.fav); break;
    case "region": app.innerHTML = vistaRegion(r.r, r.fav); break;
    case "favoritos": app.innerHTML = vistaFavoritos(); break;
    case "imprimir": app.innerHTML = vistaImprimir(); break;
    case "ajustes": app.innerHTML = vistaAjustes(); break;
    case "ayuda-app": app.innerHTML = vistaAyudaApp(); break;
    case "calc": app.innerHTML = vistaCalculadora(r.id, vuelta); break;
    case "repaso": app.innerHTML = vistaRepaso(r.h); break;
    case "juegos": app.innerHTML = vistaJuegos(r.h); break;
    case "inicio": app.innerHTML = vistaInicio(); break;
    case "familia": app.innerHTML = vistaFamilia(r.f); break;
    default: app.innerHTML = vistaPortada();
  }
  // el título es el nombre sugerido del PDF
  document.title = r.tipo === "ficha" ? `${r.p.nombre} · RadioGuía` : r.tipo === "imprimir" ? `${listas.activa().nombre} · RadioGuía` : "RadioGuía";
  altoCabecera();
  if (location.hash === "#ajustes-fuente") document.getElementById("fuente")?.scrollIntoView();
}

// la barra del buscador y la de filtros se pegan debajo de la cabecera, que puede ocupar dos renglones
function altoCabecera() {
  const top = app.querySelector(".top");
  if (top) document.documentElement.style.setProperty("--top-h", top.offsetHeight + "px");
}
addEventListener("resize", altoCabecera);

addEventListener("hashchange", (e) => {
  const antes = new URL(e.oldURL).hash || "#";
  pantallaAnterior = antes;
  estado.sel = null;
  if (!antes.startsWith("#p-")) historial.push(antes); else if (!historial.length) historial.push(antes);
  if (historial.length > 30) historial.shift();
  render();
  if (location.hash !== "#ajustes-fuente") scrollTo(0, 0);
});

// solo se reemplaza el contenido, así el buscador no pierde el foco ni cierra el teclado
function refrescarMain() {
  const tmp = document.createElement("div");
  tmp.innerHTML = ruta().tipo === "favoritos" ? vistaFavoritos() : vistaInicio();
  const nuevo = tmp.querySelector("main"), actual = app.querySelector("main");
  if (nuevo && actual) actual.replaceWith(nuevo);
}

// elegir la fuente (al entrar, en Ajustes o desde un grupo de otro libro): si cambia, la app se recarga con esos datos
app.addEventListener("click", (e) => {
  const b = e.target.closest("[data-fuente]");
  if (b && elegirFuente(b.dataset.fuente) === false) render();
});

// favorito de otro libro: cambia a ese libro y abre la ficha
app.addEventListener("click", (e) => {
  const b = e.target.closest("[data-ir-fuente]");
  if (b) elegirFuente(b.dataset.irFuente, `#p-${b.dataset.irFicha}`);
  const f = e.target.closest("[data-fav-fuente]");
  if (f) { estado.favFuente = f.dataset.favFuente; const y = scrollY; render(); scrollTo(0, y); }
});
// una vista avisa que terminó de cargar algo (por ejemplo, los nombres de otro libro en Favoritos)
document.addEventListener("rx-rehacer", () => { const y = scrollY; render(); scrollTo(0, y); });

// Ajustes → Buscar actualización
app.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-buscar-act]");
  if (!b) return;
  const est = b.nextElementSibling;
  b.disabled = true; est.textContent = "Buscando…";
  const r = await pwa.buscarActualizacion().catch(() => "error");
  est.textContent = r === "nueva" ? "Hay una versión nueva: se está descargando y la app se va a recargar sola."
    : r === "al-dia" ? "Ya tenés la última versión."
    : r === "sin-sw" ? "Esta vista no usa el modo sin conexión: recargá la página para ver lo último."
    : "No se pudo comprobar. Revisá la conexión a internet.";
  b.disabled = false;
});

app.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-fav],[data-term],[data-ampliar],[data-filtro],[data-borrar],[data-pref],[data-instalar],[data-cerrar-aviso],[data-lista],[data-lista-nueva],[data-lista-editar],[data-imp-op],[data-imprimir],[data-sel],[data-sel-entrar],[data-sel-todas],[data-sel-quitar],[data-sel-salir],[data-cerrar-sesion]");
  if (!t) return;
  const rehacer = () => { const y = scrollY; render(); scrollTo(0, y); };
  if (t.dataset.fav) { e.preventDefault(); tocarEstrella(t.dataset.fav, rehacer); }
  else if (t.dataset.lista) { listas.elegir(t.dataset.lista); estado.qFav = ""; rehacer(); }
  else if ("selEntrar" in t.dataset) { estado.sel = new Set(); render(); scrollTo(0, 0); }
  else if ("selSalir" in t.dataset) { estado.sel = null; render(); scrollTo(0, 0); }
  else if (t.dataset.sel) { estado.sel.has(t.dataset.sel) ? estado.sel.delete(t.dataset.sel) : estado.sel.add(t.dataset.sel); rehacer(); }
  else if ("selTodas" in t.dataset) {
    const ids = listas.activa().ids;
    estado.sel = estado.sel.size === ids.length ? new Set() : new Set(ids); rehacer();
  } else if ("selQuitar" in t.dataset) {
    const n = estado.sel.size, act = listas.activa();
    if (!n || !confirm(`¿Quitar ${n === 1 ? "1 proyección" : `${n} proyecciones`} de “${act.nombre}”?`)) return;
    quitarDeLista(act.id, estado.sel); estado.sel = null; render(); scrollTo(0, 0);
  }
  else if ("listaNueva" in t.dataset) hojaLista(null, rehacer);
  else if (t.dataset.listaEditar) hojaLista(t.dataset.listaEditar, rehacer);
  else if (t.dataset.impOp) { opcionesImpresion[t.dataset.impOp] = !opcionesImpresion[t.dataset.impOp]; rehacer(); }
  else if ("imprimir" in t.dataset) preguntarEImprimir(app, rehacer); else if (t.dataset.term) mostrarTermino(t.dataset.term);
  else if (t.dataset.ampliar) ampliar(t.dataset.ampliar, t.dataset.alt);
  else if (t.dataset.filtro) { estado.filtro[t.dataset.filtro] = t.dataset.cat || undefined; const y = scrollY; render(); scrollTo(0, y); }
  else if (t.dataset.borrar) {
    const k = t.dataset.borrar === "q-fav" ? "qFav" : "q";
    estado[k] = ""; render(); document.getElementById(t.dataset.borrar)?.focus();
  } else if (t.dataset.pref) { preferencias.set(t.dataset.pref, t.dataset.val); render(); }
  else if ("instalar" in t.dataset) { await pwa.instalar(); render(); }
  else if ("cerrarAviso" in t.dataset) { preferencias.set("avisoInstalar", false); render(); }
  else if ("cerrarSesion" in t.dataset) {
    const { usuario, conGoogle } = nube.estado();
    const aviso = conGoogle ? "¿Cerrar la sesión? Tus favoritos quedan guardados en tu cuenta de Google y vuelven cuando entres de nuevo."
      : usuario ? "Estás solo con apodo: si cerrás la sesión se borran tus favoritos de este celular y no vas a poder volver a esta cuenta ni a sus grupos y puntos. ¿Cerrar igual?"
      : "Si cerrás la sesión se borran tus favoritos de este celular. ¿Cerrar igual?";
    if (!confirm(aviso)) return;
    t.disabled = true;
    await cerrarSesion();
    // olvida el nombre y vuelve a empezar, así no quedan datos de la cuenta anterior en pantalla
    try { localStorage.removeItem("radioguia.nombre"); } catch {}
    location.hash = ""; location.reload();
  }
});

app.addEventListener("input", (e) => {
  const el = e.target;
  if (el.id === "q-inicio" || el.id === "q-fav") {
    estado[el.id === "q-fav" ? "qFav" : "q"] = el.value;
    refrescarMain();
    const b = app.querySelector(`[data-borrar="${el.id}"]`); if (b) b.hidden = !el.value;
  } else if (el.id === "espesor") {
    calcEstado.espesor = el.value;
    const r = ruta();
    document.getElementById("calc-res").innerHTML = resultadoHTML(calcular(el.value, r.id ? proyeccionPorId[r.id] : null));
  }
});

iniciarIdentificacion(app, render);
iniciarRepaso(app, render);
iniciarJuegos(app);
iniciarGrupos(app, render);
// con cuenta de Google, cuando llegan favoritos de otro dispositivo se redibuja (salvo que esté escribiendo)
iniciarSyncFavoritos(() => { if (!document.activeElement?.matches("input, textarea")) render(); });
pwa.iniciar(() => { if (["portada", "inicio", "ajustes", "ayuda-app"].includes(ruta().tipo) && !document.activeElement?.matches("input")) render(); });
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => preferencias.get("tema") === "sistema" && aplicarPreferencias());
// cuando llega la cuenta: pedir la foto si falta, o mostrarla en la portada y en Ajustes
nube.alCambiar(() => { const p = nube.estado().perfil; if (identificado() && (ruta().tipo === "portada" || ruta().tipo === "ajustes" || (p && !p.foto))) render(); });
render();
