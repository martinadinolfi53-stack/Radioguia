// Fuente Merrill: capítulos de técnicas del Atlas, en el orden del libro. Mismo formato que datos/bontrager/.
// Mientras no haya capítulos cargados, datos/fuentes.js la marca como "en preparación".
import cap04 from "./cap04-extremidad-superior.js";
export { default as MENU } from "./menu.js";
export { default as ANG_ROT } from "./angulacion-rotacion.js";
export { default as VERSIONES } from "./versiones.js";
export { default as CON_ESQUEMA } from "./ilustraciones.js";

export const FUENTE = {
  libro: "Merrill. Atlas de posiciones radiográficas y procedimientos radiológicos",
  edicion: "11ª ed.",
  autores: "Frank, Long, Smith",
  editorial: "Elsevier España, 2010",
  corto: "Merrill 11ª ed.",
  ilustraciones: "ilustraciones/merrill/",
};

export const CAPITULOS = [cap04];
