// Menú principal del Bontrager por zona, como el índice del PDF de Técnicas 1: un botón por zona, agrupados por familia (color en js/menu.js).
// Orden del manual; en las extremidades, de proximal a distal (hombro, brazo, codo, antebrazo, muñeca, mano), como pidió Martin.
export default [
  { id: "torax", nombre: "Tórax", familia: "torax", regiones: ["torax", "torax-pediatrico"] },
  { id: "via-aerea", nombre: "Vía aérea", familia: "torax", regiones: ["via-aerea"] },

  { id: "clavicula", nombre: "Clavícula y escápula", familia: "superior", regiones: ["clavicula", "escapula"] },
  { id: "hombro", nombre: "Hombro", familia: "superior", regiones: ["hombro", "acromioclaviculares"] },
  { id: "brazo", nombre: "Brazo (húmero)", familia: "superior", regiones: ["humero"] },
  { id: "codo", nombre: "Codo", familia: "superior", regiones: ["codo"] },
  { id: "antebrazo", nombre: "Antebrazo", familia: "superior", regiones: ["antebrazo"] },
  { id: "muneca", nombre: "Muñeca", familia: "superior", regiones: ["muneca"] },
  { id: "mano", nombre: "Mano", familia: "superior", regiones: ["mano"] },
  { id: "dedos-mano", nombre: "Dedos y pulgar", familia: "superior", regiones: ["dedos-mano", "pulgar"] },
  { id: "superior-ped", nombre: "Miembro superior pediátrico", familia: "superior", regiones: ["ext-sup-pediatrica"] },

  { id: "cadera", nombre: "Cadera", familia: "pelvis", regiones: ["caderas", "cadera-lateral"] },
  { id: "pelvis", nombre: "Pelvis y acetábulo", familia: "pelvis", regiones: ["pelvis", "acetabulo"] },
  { id: "pelvis-ped", nombre: "Cadera y pelvis pediátricas", familia: "pelvis", regiones: ["caderas-pelvis-pediatricas"] },

  { id: "femur", nombre: "Fémur", familia: "inferior", regiones: ["femur"] },
  { id: "rodilla", nombre: "Rodilla y rótula", familia: "inferior", regiones: ["rodilla", "fosa-rotula"] },
  { id: "pierna", nombre: "Pierna", familia: "inferior", regiones: ["pierna"] },
  { id: "tobillo", nombre: "Tobillo", familia: "inferior", regiones: ["tobillo"] },
  { id: "pie", nombre: "Pie y calcáneo", familia: "inferior", regiones: ["pie", "calcaneo"] },
  { id: "dedos-pie", nombre: "Dedos del pie", familia: "inferior", regiones: ["dedos-pie"] },
  { id: "inferior-ped", nombre: "Miembro inferior pediátrico", familia: "inferior", regiones: ["ext-inf-pediatrica"] },

  { id: "cervical", nombre: "Columna cervical", familia: "columna", regiones: ["columna-cervical"] },
  { id: "toracica", nombre: "Columna dorsal", familia: "columna", regiones: ["columna-toracica"] },
  { id: "lumbar", nombre: "Columna lumbar y escoliosis", familia: "columna", regiones: ["columna-lumbar", "columna-escoliosis"] },
  { id: "sacro", nombre: "Sacro, cóccix y sacroilíacas", familia: "columna", regiones: ["columna-sacro-coccix", "columna-sacroiliacas"] },

  { id: "esternon", nombre: "Esternón", familia: "toraxOseo", regiones: ["esternon", "esternoclaviculares"] },
  { id: "costillas", nombre: "Costillas", familia: "toraxOseo", regiones: ["costillas-bilaterales", "costillas-axilares"] },

  { id: "craneo", nombre: "Cráneo", familia: "craneo", regiones: ["craneo", "craneo-trauma"] },
  { id: "cara", nombre: "Huesos faciales", familia: "craneo", regiones: ["huesos-faciales", "faciales-trauma", "agujeros-opticos", "arcos-cigomaticos", "huesos-nasales"] },
  { id: "mandibula", nombre: "Mandíbula y ATM", familia: "craneo", regiones: ["mandibula", "atm"] },
  { id: "senos", nombre: "Senos paranasales", familia: "craneo", regiones: ["senos"] },

  { id: "abdomen", nombre: "Abdomen", familia: "abdomen", regiones: ["abdomen", "abdomen-pediatrico"] },

  { id: "digestivo", nombre: "Esófago, estómago e intestino", familia: "contraste", regiones: ["esofagograma", "estomago", "intestino-delgado"] },
  { id: "colon", nombre: "Colon (enema opaco)", familia: "contraste", regiones: ["enema-opaco"] },
  { id: "urinario", nombre: "Urografía y cistografía", familia: "contraste", regiones: ["urografia", "cistografia"] },

  { id: "portatiles", nombre: "Portátiles", familia: "portatil", regiones: ["port-torax", "port-abdomen", "port-pelvis-cadera"] },
  { id: "intraop", nombre: "Intraoperatoria (arco en C)", familia: "portatil", regiones: ["intraop-arco"] },
];
