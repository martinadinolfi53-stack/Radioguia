// Fuente «Enfoques Chelo»: resúmenes de clase de un compañero (Técnicas 1): miembro superior e inferior, columna y abdomen.
// Mismo formato que datos/uy/. Las ilustraciones son la imagen que Chelo pegó en cada hoja y la lámina de placas de esa parte.
import cap01 from "./cap01-miembro-superior.js";
import cap02 from "./cap02-miembro-inferior.js";
import cap03 from "./cap03-columna.js";
import cap04 from "./cap04-abdomen.js";
export { default as MENU } from "./menu.js";
export { default as ANG_ROT } from "./angulacion-rotacion.js";
export { default as VERSIONES } from "./versiones.js";
export { default as GUIA } from "./guia-rapida.js";
export { default as CON_ESQUEMA } from "./ilustraciones.js";

export const FUENTE = {
  libro: "Enfoques Chelo · resúmenes de clase",
  edicion: "",
  autores: "",
  editorial: "",
  corto: "Enfoques Chelo",
  ilustraciones: "ilustraciones/chelo/",
};

export const CAPITULOS = [cap01, cap02, cap03, cap04];
