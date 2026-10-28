// Menú principal por zona, como el índice del PDF de Técnicas 1: un botón por zona, con el color de su región.
// Orden del manual; en las extremidades, de proximal a distal (hombro, brazo, codo, antebrazo, muñeca, mano), como pidió Martin.
const C = { torax: "#2a9d8f", superior: "#1f9a6a", inferior: "#6f5fd0", pelvis: "#9a55c0", columna: "#3d7fd0", toraxOseo: "#6a9a2f", craneo: "#c0619a", abdomen: "#c98a1b", contraste: "#c76b3a", portatil: "#7d8796" };
const F = {
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

// cada familia sabe su id (para la ruta #f-<id>)
for (const [id, f] of Object.entries(F)) f.id = id;
export const FAMILIAS = Object.values(F);

export const GRUPOS = [
  { id: "torax", nombre: "Tórax", familia: F.torax, regiones: ["torax", "torax-pediatrico"] },
  { id: "via-aerea", nombre: "Vía aérea", familia: F.torax, regiones: ["via-aerea"] },

  { id: "clavicula", nombre: "Clavícula y escápula", familia: F.superior, regiones: ["clavicula", "escapula"] },
  { id: "hombro", nombre: "Hombro", familia: F.superior, regiones: ["hombro", "acromioclaviculares"] },
  { id: "brazo", nombre: "Brazo (húmero)", familia: F.superior, regiones: ["humero"] },
  { id: "codo", nombre: "Codo", familia: F.superior, regiones: ["codo"] },
  { id: "antebrazo", nombre: "Antebrazo", familia: F.superior, regiones: ["antebrazo"] },
  { id: "muneca", nombre: "Muñeca", familia: F.superior, regiones: ["muneca"] },
  { id: "mano", nombre: "Mano", familia: F.superior, regiones: ["mano"] },
  { id: "dedos-mano", nombre: "Dedos y pulgar", familia: F.superior, regiones: ["dedos-mano", "pulgar"] },
  { id: "superior-ped", nombre: "Miembro superior pediátrico", familia: F.superior, regiones: ["ext-sup-pediatrica"] },

  { id: "cadera", nombre: "Cadera", familia: F.pelvis, regiones: ["caderas", "cadera-lateral"] },
  { id: "pelvis", nombre: "Pelvis y acetábulo", familia: F.pelvis, regiones: ["pelvis", "acetabulo"] },
  { id: "pelvis-ped", nombre: "Cadera y pelvis pediátricas", familia: F.pelvis, regiones: ["caderas-pelvis-pediatricas"] },

  { id: "femur", nombre: "Fémur", familia: F.inferior, regiones: ["femur"] },
  { id: "rodilla", nombre: "Rodilla y rótula", familia: F.inferior, regiones: ["rodilla", "fosa-rotula"] },
  { id: "pierna", nombre: "Pierna", familia: F.inferior, regiones: ["pierna"] },
  { id: "tobillo", nombre: "Tobillo", familia: F.inferior, regiones: ["tobillo"] },
  { id: "pie", nombre: "Pie y calcáneo", familia: F.inferior, regiones: ["pie", "calcaneo"] },
  { id: "dedos-pie", nombre: "Dedos del pie", familia: F.inferior, regiones: ["dedos-pie"] },
  { id: "inferior-ped", nombre: "Miembro inferior pediátrico", familia: F.inferior, regiones: ["ext-inf-pediatrica"] },

  { id: "cervical", nombre: "Columna cervical", familia: F.columna, regiones: ["columna-cervical"] },
  { id: "toracica", nombre: "Columna dorsal", familia: F.columna, regiones: ["columna-toracica"] },
  { id: "lumbar", nombre: "Columna lumbar y escoliosis", familia: F.columna, regiones: ["columna-lumbar", "columna-escoliosis"] },
  { id: "sacro", nombre: "Sacro, cóccix y sacroilíacas", familia: F.columna, regiones: ["columna-sacro-coccix", "columna-sacroiliacas"] },

  { id: "esternon", nombre: "Esternón", familia: F.toraxOseo, regiones: ["esternon", "esternoclaviculares"] },
  { id: "costillas", nombre: "Costillas", familia: F.toraxOseo, regiones: ["costillas-bilaterales", "costillas-axilares"] },

  { id: "craneo", nombre: "Cráneo", familia: F.craneo, regiones: ["craneo", "craneo-trauma"] },
  { id: "cara", nombre: "Huesos faciales", familia: F.craneo, regiones: ["huesos-faciales", "faciales-trauma", "agujeros-opticos", "arcos-cigomaticos", "huesos-nasales"] },
  { id: "mandibula", nombre: "Mandíbula y ATM", familia: F.craneo, regiones: ["mandibula", "atm"] },
  { id: "senos", nombre: "Senos paranasales", familia: F.craneo, regiones: ["senos"] },

  { id: "abdomen", nombre: "Abdomen", familia: F.abdomen, regiones: ["abdomen", "abdomen-pediatrico"] },

  { id: "digestivo", nombre: "Esófago, estómago e intestino", familia: F.contraste, regiones: ["esofagograma", "estomago", "intestino-delgado"] },
  { id: "colon", nombre: "Colon (enema opaco)", familia: F.contraste, regiones: ["enema-opaco"] },
  { id: "urinario", nombre: "Urografía y cistografía", familia: F.contraste, regiones: ["urografia", "cistografia"] },

  { id: "portatiles", nombre: "Portátiles", familia: F.portatil, regiones: ["port-torax", "port-abdomen", "port-pelvis-cadera"] },
  { id: "intraop", nombre: "Intraoperatoria (arco en C)", familia: F.portatil, regiones: ["intraop-arco"] },
];

for (const g of GRUPOS) g.color = g.familia.color;

export const grupoPorId = Object.fromEntries(GRUPOS.map((g) => [g.id, g]));
export const grupoDeRegion = Object.fromEntries(GRUPOS.flatMap((g) => g.regiones.map((r) => [r, g])));
