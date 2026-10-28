// Menú principal por zona: los botones salen de la fuente elegida (datos/<fuente>/menu.js) y cada familia tiene su color.
import { MENU } from "./datos.js";

const C = { torax: "#2a9d8f", superior: "#1f9a6a", inferior: "#6f5fd0", pelvis: "#9a55c0", columna: "#3d7fd0", toraxOseo: "#6a9a2f", craneo: "#c0619a", abdomen: "#c98a1b", contraste: "#c76b3a", portatil: "#7d8796" };
export const FAMILIAS = {
  torax: { nombre: "Tórax", color: C.torax },
  superior: { nombre: "Miembro superior", color: C.superior },
  inferior: { nombre: "Miembro inferior", color: C.inferior },
  pelvis: { nombre: "Pelvis y cadera", color: C.pelvis },
  columna: { nombre: "Columna vertebral", color: C.columna },
  toraxOseo: { nombre: "Tórax óseo", color: C.toraxOseo },
  craneo: { nombre: "Cráneo y cara", color: C.craneo },
  abdomen: { nombre: "Abdomen", color: C.abdomen },
  contraste: { nombre: "Estudios con contraste", color: C.contraste },
  portatil: { nombre: "Portátiles e intraoperatorias", color: C.portatil },
};

export const GRUPOS = MENU.map((g) => ({ ...g, familia: FAMILIAS[g.familia] }));

for (const g of GRUPOS) g.color = g.familia.color;

export const grupoPorId = Object.fromEntries(GRUPOS.map((g) => [g.id, g]));
export const grupoDeRegion = Object.fromEntries(GRUPOS.flatMap((g) => g.regiones.map((r) => [r, g])));
