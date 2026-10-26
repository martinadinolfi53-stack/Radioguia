// Listas de favoritos y preferencias, guardados en este dispositivo (localStorage). Todo envuelto en try/catch:
// en modo privado o con datos bloqueados la app funciona igual, solo que sin recordar.
const leer = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const K_LISTAS = "radioguia.listas", K_FAV_VIEJO = "radioguia.favoritos", K_PREF = "radioguia.preferencias";

// Listas de favoritos. Formato guardado en localStorage["radioguia.listas"] (v: 1):
//   { v: 1, activa: "<id>", listas: [{ id, nombre, color, ids: ["<id de proyección>", ...] }] }
// - id: texto corto único ("fav" la primera, después "l" + base36 del momento de creación); no cambia al renombrar.
// - color: una clave de COLORES (no un hex), así se adapta al tema claro u oscuro.
// - ids: proyecciones en el orden en que se agregaron; para mostrar o imprimir se ordenan como en el manual.
// - activa: la lista que se ve en #favoritos y en los menús filtrados (#g-…-fav, #r-…-fav).
// Siempre hay al menos una lista. La primera vez se migra el formato viejo (radioguia.favoritos, un arreglo de ids).
// Otras partes de la app (por ejemplo, el múltiple opción) leen las listas solo con listas.todas() / listas.porId().
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
const copia = (l) => l && { ...l, ids: [...l.ids] };

export const listas = {
  todas: () => datos.listas.map(copia),
  porId: (id) => copia(buscarLista(id)),
  activa: () => copia(buscarLista(datos.activa)),
  elegir(id) { if (buscarLista(id)) { datos.activa = id; guardar(); } },
  // listas que contienen la proyección, en el orden de las listas
  de: (pid) => datos.listas.filter((l) => l.ids.includes(pid)).map(copia),
  enAlguna: (pid) => datos.listas.some((l) => l.ids.includes(pid)),
  tiene: (id, pid) => !!buscarLista(id)?.ids.includes(pid),
  alternar(id, pid) {
    const l = buscarLista(id); if (!l) return;
    l.ids = l.ids.includes(pid) ? l.ids.filter((x) => x !== pid) : [...l.ids, pid];
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
  // saca ids de proyecciones que ya no existen
  limpiar(validos) { for (const l of datos.listas) l.ids = l.ids.filter((pid) => validos.has(pid)); guardar(); },
};

const PREF_DEF = { tema: "oscuro", texto: "normal", avisoInstalar: true, diseno: "clasico", paleta: "original", subir: "no", rebote: "no", pompitas: "no" };
let prefs = { ...PREF_DEF, ...leer(K_PREF, {}) };
export const preferencias = {
  get: (k) => prefs[k],
  set(k, v) { prefs = { ...prefs, [k]: v }; escribir(K_PREF, prefs); aplicarPreferencias(); },
};

// paletas de Pompa de jabón que van sobre fondo claro (el resto son oscuras)
export const PALETAS_CLARAS = new Set(["perla", "perla-brillante", "salvia", "niebla", "durazno"]);

export function aplicarPreferencias() {
  const root = document.documentElement;
  const pompa = prefs.diseno === "pompa", vidrio = prefs.diseno === "vidrio";
  // en Pompa de jabón la paleta decide si es clara u oscura; en Clásico y Liquid Glass manda el Tema
  const tema = pompa ? (PALETAS_CLARAS.has(prefs.paleta) ? "claro" : "oscuro")
    : prefs.tema === "sistema" ? (matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "oscuro") : prefs.tema;
  root.dataset.theme = tema === "claro" ? "light" : "dark";
  root.dataset.texto = prefs.texto;
  root.dataset.diseno = prefs.diseno;
  for (const k of ["paleta", "subir", "rebote", "pompitas"]) {
    if (pompa) root.dataset[k] = prefs[k]; else delete root.dataset[k];
  }
  const hojas = { "hoja-glass": pompa, "hoja-pompa": pompa, "hoja-vidrio": vidrio };
  for (const [id, on] of Object.entries(hojas)) { const l = document.getElementById(id); if (l) l.disabled = !on; }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tema === "claro" ? "#f3f5f8" : "#0d1117");
}
