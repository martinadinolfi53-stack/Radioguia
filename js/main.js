// Arranque y navegación por #hash:
// #  inicio · #g-<botón del menú> · #g-<botón>-fav · #r-<región> · #r-<región>-fav · #p-<proyección> · #favoritos · #imprimir (lista activa) · #calc · #calc-<proyección> · #ajustes
import { regionPorId, proyeccionPorId, proyecciones } from "./datos.js";
import { listas, preferencias, aplicarPreferencias } from "./almacen.js";
import { tocarEstrella, hojaLista, quitarDeLista } from "./listas-ui.js";
import { vistaImprimir, opcionesImpresion, preguntarEImprimir } from "./imprimir.js";
import { estado, vistaInicio, vistaRegion, vistaGrupo, vistaFavoritos, vistaAjustes } from "./vistas.js";
import { vistaFicha } from "./ficha.js";
import { vistaCalculadora, calcEstado, calcular, resultadoHTML } from "./calculadora.js";
import { mostrarTermino } from "./glosario.js";
import { ampliar } from "./imagenes.js";
import { pwa } from "./pwa.js";
import { edicion, vistaEditar, leerFormulario } from "./edicion.js";
import { grupoPorId, grupoDeRegion } from "./menu.js";

const app = document.getElementById("app");
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
  if (h.startsWith("#editar-") && proyeccionPorId[h.slice(8)] && edicion.activa()) return { tipo: "editar", p: proyeccionPorId[h.slice(8)] };
  if (h === "#favoritos") return { tipo: "favoritos" };
  if (h === "#imprimir") return { tipo: "imprimir" };
  if (h === "#ajustes") return { tipo: "ajustes" };
  if (h === "#calc" || h.startsWith("#calc-")) return { tipo: "calc", id: h.slice(6) || null };
  return { tipo: "inicio" };
}

function volverA(r) {
  if (r.tipo === "ficha") return historial.findLast((x) => !x.startsWith("#p-") && !x.startsWith("#calc")) || `#g-${grupoDeRegion[r.p.region]?.id}`;
  if (r.tipo === "calc") return pantallaAnterior;
  if (r.tipo === "editar") return `#p-${r.p.id}`;
  return "#";
}

function render() {
  const r = ruta();
  const vuelta = volverA(r);
  switch (r.tipo) {
    case "ficha": app.innerHTML = vistaFicha(r.p, vuelta); break;
    case "grupo": app.innerHTML = vistaGrupo(r.g, r.fav); break;
    case "region": app.innerHTML = vistaRegion(r.r, r.fav); break;
    case "favoritos": app.innerHTML = vistaFavoritos(); break;
    case "imprimir": app.innerHTML = vistaImprimir(); break;
    case "ajustes": app.innerHTML = vistaAjustes(); break;
    case "calc": app.innerHTML = vistaCalculadora(r.id, vuelta); break;
    case "editar": app.innerHTML = vistaEditar(r.p, vuelta); break;
    default: app.innerHTML = vistaInicio();
  }
  // el título es el nombre sugerido del PDF
  document.title = r.tipo === "ficha" ? `${r.p.nombre} · RadioGuía` : r.tipo === "imprimir" ? `${listas.activa().nombre} · RadioGuía` : "RadioGuía";
  altoCabecera();
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
  scrollTo(0, 0);
});

// solo se reemplaza el contenido, así el buscador no pierde el foco ni cierra el teclado
function refrescarMain() {
  const tmp = document.createElement("div");
  tmp.innerHTML = ruta().tipo === "favoritos" ? vistaFavoritos() : vistaInicio();
  const nuevo = tmp.querySelector("main"), actual = app.querySelector("main");
  if (nuevo && actual) actual.replaceWith(nuevo);
}

app.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-desconectar],[data-exportar],[data-salir-edicion],[data-restaurar],[data-fav],[data-term],[data-ampliar],[data-filtro],[data-borrar],[data-pref],[data-instalar],[data-cerrar-aviso],[data-lista],[data-lista-nueva],[data-lista-editar],[data-imp-op],[data-imprimir],[data-sel],[data-sel-entrar],[data-sel-todas],[data-sel-quitar],[data-sel-salir]");
  if (!t) return;
  if ("exportar" in t.dataset) return edicion.exportar();
  if ("desconectar" in t.dataset) { edicion.configurarGithub(null); return render(); }
  if ("salirEdicion" in t.dataset) { edicion.salir(); return render(); }
  if (t.dataset.restaurar) {
    if (!confirm("¿Volver a los datos originales de esta ficha? Se pierden tus cambios.")) return;
    try { await edicion.restaurar(t.dataset.restaurar); } catch (err) { return alert(err.message); }
    location.hash = `#p-${t.dataset.restaurar}`; return location.reload();
  }
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

app.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id === "form-clave") {
    e.preventDefault();
    const ok = await edicion.entrar(f.elements.clave.value);
    if (ok) render(); else document.getElementById("clave-error").hidden = false;
  } else if (f.id === "form-edicion") {
    e.preventDefault();
    const id = f.dataset.id, estadoEl = document.getElementById("ed-estado"), btn = f.querySelector('[type="submit"]');
    btn.disabled = true; estadoEl.textContent = "Guardando…";
    try { estadoEl.textContent = await edicion.guardar(id, leerFormulario(f)); }
    catch (err) { estadoEl.textContent = "Quedó guardado en este celular, pero no se pudo publicar: " + err.message; }
    // se recarga para que el buscador y el glosario tomen los datos nuevos
    setTimeout(() => { location.hash = `#p-${id}`; location.reload(); }, 1600);
  } else if (f.id === "form-github") {
    e.preventDefault();
    const est = document.getElementById("gh-estado");
    const repo = f.elements.repo.value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, ""), token = f.elements.token.value.trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !token) { est.textContent = "Completá el repositorio (usuario/nombre) y el token."; return; }
    edicion.configurarGithub({ repo, token, rama: "main" });
    est.textContent = "Probando…";
    try { await edicion.probarGithub(); est.textContent = "Conectado."; setTimeout(render, 900); }
    catch (err) { edicion.configurarGithub(null); est.textContent = "No se pudo conectar: " + err.message; }
  }
});

pwa.iniciar(() => { if (["inicio", "ajustes"].includes(ruta().tipo) && !document.activeElement?.matches("input")) render(); });
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => preferencias.get("tema") === "sistema" && aplicarPreferencias());
render();
