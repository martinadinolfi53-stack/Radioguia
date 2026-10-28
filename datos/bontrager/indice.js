// Fuente Bontrager: capítulos en el orden del manual y los datos que los completan. La app carga esta carpeta
// cuando la persona eligió el Bontrager (js/fuente.js). Para sumar un capítulo: crear capNN-nombre.js e importarlo acá.
import cap01 from "./cap01-torax.js";
import cap02 from "./cap02-extremidad-superior.js";
import cap03 from "./cap03-humero-cintura-escapular.js";
import cap04 from "./cap04-extremidad-inferior.js";
import cap05 from "./cap05-femur-cintura-pelvica.js";
import cap06 from "./cap06-columna.js";
import cap07 from "./cap07-torax-oseo.js";
import cap08 from "./cap08-craneo-cara-senos.js";
import cap09 from "./cap09-abdomen-contraste.js";
import cap10 from "./cap10-portatiles.js";
export { default as MENU } from "./menu.js";
export { default as ANG_ROT } from "./angulacion-rotacion.js";
export { default as VERSIONES } from "./versiones.js";
export { default as CON_ESQUEMA } from "./ilustraciones.js";

export const FUENTE = {
  libro: "Bontrager. Manual de posiciones y técnicas radiológicas",
  edicion: "9ª ed.",
  autores: "Lampignano, Kendrick",
  editorial: "Elsevier, 2018",
  corto: "Bontrager 9ª ed.",
  ilustraciones: "ilustraciones/", // carpeta de los esquemas <id>.svg
};

export const CAPITULOS = [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10];
