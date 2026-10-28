// Fuente elegida (Bontrager, Merrill…): se pide al entrar, se recuerda en este dispositivo y se cambia en Ajustes.
// Los datos de cada fuente están separados (datos/<id>/), y también lo que la persona guarda: favoritos, repaso y juegos.
import FUENTES from "../datos/fuentes.js";

export { FUENTES };
const K = "radioguia.fuente";
const leer = () => { try { return localStorage.getItem(K); } catch { return null; } };
const valida = (id) => FUENTES.some((f) => f.id === id && f.lista);

export const elegida = () => valida(leer());
// sin elegir todavía se cargan los datos del Bontrager, así la app arranca igual
export const fuenteId = elegida() ? leer() : "bontrager";
export const fuenteInfo = FUENTES.find((f) => f.id === fuenteId);

// los datos de la fuente se cargan una sola vez al abrir: cambiar de fuente recarga la app
export function elegirFuente(id) {
  if (!valida(id)) return;
  try { localStorage.setItem(K, id); } catch {}
  if (id === fuenteId) return false;
  location.hash = "#";
  location.reload();
  return true;
}

// clave de localStorage propia de la fuente; el Bontrager conserva las de siempre para no perder lo guardado
export const clave = (k) => (fuenteId === "bontrager" ? k : `${k}.${fuenteId}`);
