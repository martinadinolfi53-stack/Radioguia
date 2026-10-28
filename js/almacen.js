// Listas de favoritos y preferencias, guardados en este dispositivo (localStorage). Todo envuelto en try/catch:
// en modo privado o con datos bloqueados la app funciona igual, solo que sin recordar.
import { fuenteId } from "./fuente.js";
const leer = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// las listas de favoritos son compartidas entre fuentes (cada enfoque guarda de qué libro es); las preferencias también
const K_LISTAS = "radioguia.listas", K_FAV_VIEJO = "radioguia.favoritos", K_PREF = "radioguia.preferencias";

// Listas de favoritos. Formato guardado en localStorage["radioguia.listas"] (v: 1):
//   { v: 1, activa: "<id>", listas: [{ id, nombre, color, ids: ["<ref>", ...] }] }
// - id: texto corto único ("fav" la primera, después "l" + base36 del momento de creación); no cambia al renombrar.
// - color: una clave de COLORES (no un hex), así se adapta al tema claro u oscuro.
// - ids: referencias en el orden en que se agregaron: el id de la proyección para el Bontrager (como siempre)
//   y "<fuente>:<id>" para las demás (ej. "merrill:torax-pa"), porque los ids de dos libros pueden repetirse.
// - activa: la lista que se ve en #favoritos y en los menús filtrados (#g-…-fav, #r-…-fav).
// Hacia afuera, cada lista trae `ids` (solo los de la fuente abierta, ids normales), `otras` ([{ fuente, id }]
// de los otros libros) y `total`. Así el resto de la app (repaso, impresión, menús) sigue trabajando con la fuente abierta.
// Siempre hay al menos una lista. La primera vez se migra el formato viejo (radioguia.favoritos, un arreglo de ids).
const ref = (pid) => (fuenteId === "bontrager" ? pid : `${fuenteId}:${pid}`);
const deRef = (r) => { const i = r.indexOf(":"); return i < 0 ? { fuente: "bontrager", id: r } : { fuente: r.slice(0, i), id: r.slice(i + 1) }; };
export const COLORES = [
  ["amarillo", "Amarillo"], ["naranja", "Naranja"], ["rojo", "Rojo"], ["rosa", "Rosa"],
  ["violeta", "Violeta"], ["azul", "Azul"], ["verde", "Verde"], ["gris", "Gris"],
].map(([id, nombre]) => ({ id, nombre }));
const colorValido = (c) => (COLORES.some((x) => x.id === c) ? c : "amarillo");

function cargarListas() {
  const d = leer(K_LISTAS, null);
  if (d?.v === 1 && Array.isArray(d.listas) && d.listas.length) {
    const listas = d.listas.filter((l) => l && l.id).map((l) => ({ id: String(l.id), nombre: String(l.nombre || "Lista"), color: colorValido(l.color), ids: [...new Set(Array.isArray(l.ids) ? l.ids : [])] }));
    if (listas.length) return { v: 1, activa: listas.some((l) => l.id === d.activa) ? d.activa : listas[0].id, listas };
  }
  return { v: 1, activa: "fav", listas: [{ id: "fav", nombre: "Favoritos", color: "amarillo", ids: [...new Set(leer(K_FAV_VIEJO, []))] }] };
}
let datos = cargarListas();
const guardar = () => escribir(K_LISTAS, datos);
const buscarLista = (id) => datos.listas.find((l) => l.id === id);
// antes de compartirlas, el Merrill tenía sus listas aparte (radioguia.listas.merrill): se suman a la lista del mismo id o a la primera
(function migrarListasSeparadas() {
  for (const f of ["merrill"]) {
    const k = `radioguia.listas.${f}`, d = leer(k, null);
    if (!d) continue;
    for (const l of Array.isArray(d.listas) ? d.listas : []) {
      const destino = buscarLista(String(l?.id)) || datos.listas[0];
      for (const pid of Array.isArray(l?.ids) ? l.ids : []) if (!destino.ids.includes(`${f}:${pid}`)) destino.ids.push(`${f}:${pid}`);
    }
    guardar();
    try { localStorage.removeItem(k); localStorage.removeItem(`radioguia.favoritos.${f}`); } catch {}
  }
})();
const copia = (l) => {
  if (!l) return l;
  const todos = l.ids.map(deRef);
  return { id: l.id, nombre: l.nombre, color: l.color, ids: todos.filter((x) => x.fuente === fuenteId).map((x) => x.id), otras: todos.filter((x) => x.fuente !== fuenteId), total: todos.length };
};

export const listas = {
  todas: () => datos.listas.map(copia),
  porId: (id) => copia(buscarLista(id)),
  activa: () => copia(buscarLista(datos.activa)),
  elegir(id) { if (buscarLista(id)) { datos.activa = id; guardar(); } },
  // listas que contienen la proyección, en el orden de las listas
  de: (pid) => datos.listas.filter((l) => l.ids.includes(ref(pid))).map(copia),
  enAlguna: (pid) => datos.listas.some((l) => l.ids.includes(ref(pid))),
  tiene: (id, pid) => !!buscarLista(id)?.ids.includes(ref(pid)),
  alternar(id, pid) {
    const l = buscarLista(id), r = ref(pid); if (!l) return;
    l.ids = l.ids.includes(r) ? l.ids.filter((x) => x !== r) : [...l.ids, r];
    guardar();
  },
  crear(nombre, color) {
    let id = "l" + Date.now().toString(36);
    while (buscarLista(id)) id += "x";
    datos.listas.push({ id, nombre: nombre.trim().slice(0, 60) || "Lista nueva", color: colorValido(color), ids: [] });
    datos.activa = id; guardar();
    return id;
  },
  editar(id, { nombre, color }) {
    const l = buscarLista(id); if (!l) return;
    if (nombre != null && nombre.trim()) l.nombre = nombre.trim().slice(0, 60);
    if (color != null) l.color = colorValido(color);
    guardar();
  },
  // la última lista no se borra (siempre queda una)
  borrar(id) {
    if (datos.listas.length < 2) return false;
    datos.listas = datos.listas.filter((l) => l.id !== id);
    if (datos.activa === id) datos.activa = datos.listas[0].id;
    guardar(); return true;
  },
  // saca proyecciones de la fuente abierta que ya no existen (las de otros libros se revisan cuando se abre ese libro)
  limpiar(validos) { for (const l of datos.listas) l.ids = l.ids.filter((r) => { const x = deRef(r); return x.fuente !== fuenteId || validos.has(x.id); }); guardar(); },
};

const PREF_DEF = { tema: "oscuro", texto: "normal", avisoInstalar: true, diseno: "clasico", paleta: "original", subir: "no", rebote: "no", pompitas: "no" };
let prefs = { ...PREF_DEF, ...leer(K_PREF, {}) };
export const preferencias = {
  get: (k) => prefs[k],
  set(k, v) { prefs = { ...prefs, [k]: v }; escribir(K_PREF, prefs); aplicarPreferencias(); },
};

export function aplicarPreferencias() {
  const root = document.documentElement;
  const pompa = prefs.diseno === "pompa";
  // en Pompa de jabón la paleta decide si es clara u oscura (Perla es la única clara); el Tema vale solo para el diseño clásico
  const tema = pompa ? (prefs.paleta === "perla" ? "claro" : "oscuro")
    : prefs.tema === "sistema" ? (matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "oscuro") : prefs.tema;
  root.dataset.theme = tema === "claro" ? "light" : "dark";
  root.dataset.texto = prefs.texto;
  root.dataset.diseno = prefs.diseno;
  for (const k of ["paleta", "subir", "rebote", "pompitas"]) {
    if (pompa) root.dataset[k] = prefs[k]; else delete root.dataset[k];
  }
  for (const id of ["hoja-glass", "hoja-pompa"]) { const l = document.getElementById(id); if (l) l.disabled = !pompa; }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tema === "claro" ? "#f3f5f8" : "#0d1117");
}
