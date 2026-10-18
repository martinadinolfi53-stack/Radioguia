// Menú principal por región, como el índice del PDF de Técnicas 1: de la cabeza a los pies
// y, en las extremidades, de proximal a distal. Cada botón agrupa regiones del manual.
export const GRUPOS = [
  { id: "craneo", nombre: "Cráneo, cara y senos", color: "#c0619a", regiones: ["craneo", "craneo-trauma", "huesos-faciales", "faciales-trauma", "agujeros-opticos", "arcos-cigomaticos", "huesos-nasales", "mandibula", "atm", "senos"] },
  { id: "columna", nombre: "Columna vertebral", color: "#3d7fd0", regiones: ["columna-cervical", "columna-toracica", "columna-lumbar", "columna-escoliosis", "columna-sacro-coccix", "columna-sacroiliacas"] },
  { id: "torax", nombre: "Tórax", color: "#2a9d8f", regiones: ["torax", "via-aerea", "torax-pediatrico"] },
  { id: "torax-oseo", nombre: "Tórax óseo", color: "#5e9e3f", regiones: ["esternon", "esternoclaviculares", "costillas-bilaterales", "costillas-axilares"] },
  { id: "abdomen", nombre: "Abdomen", color: "#c98a1b", regiones: ["abdomen", "abdomen-pediatrico"] },
  { id: "contraste", nombre: "Estudios con contraste", color: "#c76b3a", regiones: ["esofagograma", "estomago", "intestino-delgado", "enema-opaco", "urografia", "cistografia"] },
  { id: "hombro", nombre: "Hombro y húmero", color: "#1f9a7a", regiones: ["clavicula", "acromioclaviculares", "escapula", "hombro", "humero"] },
  { id: "superior", nombre: "Codo, antebrazo y mano", color: "#169c9c", regiones: ["codo", "antebrazo", "muneca", "mano", "pulgar", "dedos-mano", "ext-sup-pediatrica"] },
  { id: "pelvis", nombre: "Pelvis y cadera", color: "#8a63c9", regiones: ["pelvis", "acetabulo", "caderas", "cadera-lateral", "caderas-pelvis-pediatricas"] },
  { id: "inferior", nombre: "Miembro inferior", color: "#6f6fd6", regiones: ["femur", "rodilla", "fosa-rotula", "pierna", "tobillo", "calcaneo", "pie", "dedos-pie", "ext-inf-pediatrica"] },
  { id: "portatiles", nombre: "Portátiles e intraoperatorias", color: "#7d8796", regiones: ["port-torax", "port-abdomen", "port-pelvis-cadera", "intraop-arco"] },
];

export const grupoPorId = Object.fromEntries(GRUPOS.map((g) => [g.id, g]));
export const grupoDeRegion = Object.fromEntries(GRUPOS.flatMap((g) => g.regiones.map((r) => [r, g])));

