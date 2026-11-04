// Fuente «Enfoques UY»: fichas del cuaderno «Enfoques TÉC 1 y 2» (miembro superior e inferior).
// Mismo formato que datos/bontrager/ y datos/merrill/. Las ilustraciones son las fotos de posición y resultado de cada enfoque.
import cap01 from "./cap01-miembro-superior.js";
import cap02 from "./cap02-miembro-inferior.js";
export { default as MENU } from "./menu.js";
export { default as ANG_ROT } from "./angulacion-rotacion.js";
export { default as VERSIONES } from "./versiones.js";
export { default as CON_ESQUEMA } from "./ilustraciones.js";

export const FUENTE = {
  libro: "Enfoques UY · Enfoques TÉC 1 y 2",
  edicion: "",
  autores: "",
  editorial: "",
  corto: "Enfoques UY",
  ilustraciones: "ilustraciones/uy/",
};

export const CAPITULOS = [cap01, cap02];
