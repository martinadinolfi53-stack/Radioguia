// Fuente elegida (Bontrager, Merrill…): se pide al entrar, se recuerda en este dispositivo y se cambia en Ajustes.
// Los datos de cada fuente están separados (datos/<id>/), y también lo que la persona guarda: favoritos, repaso y juegos.
import FUENTES from "../datos/fuentes.js";

export { FUENTES };
const K = "radioguia.fuente", KA = "radioguia.ambos";
const leer = (k = K) => { try { return localStorage.getItem(k); } catch { return null; } };
const escribir = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
const valida = (id) => FUENTES.some((f) => f.id === id && f.lista);

export const elegida = () => valida(leer());
// sin elegir todavía se cargan los datos del Bontrager, así la app arranca igual
export const fuenteId = elegida() ? leer() : "bontrager";
export const fuenteInfo = FUENTES.find((f) => f.id === fuenteId);
// "Ambos": el menú y el buscador muestran los enfoques de todos los libros juntos, cada uno con su etiqueta.
// Los datos cargados siguen siendo los de un libro (fuenteId): al abrir una ficha de otro, la app cambia a ese libro sin salir de Ambos.
export const ambos = () => leer(KA) === "1";
export const AMBOS = { id: "ambos", nombre: "Ambos" };

// los datos de la fuente se cargan una sola vez al abrir: cambiar de fuente recarga la app
// destino: a dónde ir después de recargar (por ejemplo, la ficha de un favorito del otro libro);
// seguirEnAmbos: abrir una ficha de otro libro sin dejar el modo Ambos
export function elegirFuente(id, destino = "#", seguirEnAmbos = false) {
  if (id === "ambos") {
    escribir(KA, "1");
    if (!elegida()) escribir(K, fuenteId);
    return false;
  }
  if (!valida(id)) return;
  escribir(K, id);
  if (!seguirEnAmbos) escribir(KA, null);
  if (id === fuenteId) return false;
  location.hash = destino;
  location.reload();
  return true;
}

// clave de localStorage propia de la fuente; el Bontrager conserva las de siempre para no perder lo guardado
export const clave = (k) => (fuenteId === "bontrager" ? k : `${k}.${fuenteId}`);
