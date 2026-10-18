// Favoritos y preferencias, guardados en este dispositivo (localStorage). Todo envuelto en try/catch:
// en modo privado o con datos bloqueados la app funciona igual, solo que sin recordar.
const leer = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const K_FAV = "radioguia.favoritos", K_PREF = "radioguia.preferencias";

let favs = new Set(leer(K_FAV, []));
export const favoritos = {
  tiene: (id) => favs.has(id),
  alternar(id) { favs.has(id) ? favs.delete(id) : favs.add(id); escribir(K_FAV, [...favs]); },
  lista: () => [...favs],
  limpiar(validos) { favs = new Set([...favs].filter((id) => validos.has(id))); escribir(K_FAV, [...favs]); },
};

const PREF_DEF = { tema: "oscuro", texto: "normal", avisoInstalar: true };
let prefs = { ...PREF_DEF, ...leer(K_PREF, {}) };
export const preferencias = {
  get: (k) => prefs[k],
  set(k, v) { prefs = { ...prefs, [k]: v }; escribir(K_PREF, prefs); aplicarPreferencias(); },
};

export function aplicarPreferencias() {
  const root = document.documentElement;
  const tema = prefs.tema === "sistema" ? (matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "oscuro") : prefs.tema;
  root.dataset.theme = tema === "claro" ? "light" : "dark";
  root.dataset.texto = prefs.texto;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tema === "claro" ? "#f3f5f8" : "#0d1117");
}
