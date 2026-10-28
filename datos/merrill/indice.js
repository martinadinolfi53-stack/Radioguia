// Fuente Merrill: capítulos de técnicas del Atlas, en el orden del libro. Mismo formato que datos/bontrager/.
// Mientras no haya capítulos cargados, datos/fuentes.js la marca como "en preparación".
import cap04 from "./cap04-extremidad-superior.js";
import cap05 from "./cap05-cintura-escapular.js";
import cap06 from "./cap06-miembro-inferior.js";
import cap07 from "./cap07-pelvis.js";
import cap08 from "./cap08-columna.js";
import cap09 from "./cap09-torax-oseo.js";
import cap10 from "./cap10-visceras-toracicas.js";
import cap16 from "./cap16-abdomen.js";
import cap17 from "./cap17-tubo-digestivo.js";
import cap18 from "./cap18-urinario.js";
import cap20 from "./cap20-craneo.js";
import cap21 from "./cap21-huesos-cara.js";
import cap22 from "./cap22-senos.js";
import cap27 from "./cap27-pediatria.js";
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

export const CAPITULOS = [cap04, cap05, cap06, cap07, cap08, cap09, cap10, cap16, cap17, cap18, cap20, cap21, cap22, cap27];
