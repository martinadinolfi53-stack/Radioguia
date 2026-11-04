// Guía rápida de cada ficha: lo mínimo para quien ya sabe la técnica, sacado de la misma ficha (Bontrager 9.ª ed.).
// rc: dónde incide el rayo central · angulacion / rotacion: grados y hacia dónde ("No" si no lleva) · flexion: solo si la ficha la pide.
// Se muestra abajo del rayo central (js/ficha.js). Una ficha sin entrada no muestra la guía.
export default {
  "torax-pa": { rc: "T7 (ángulo inferior de la escápula)", angulacion: "No", rotacion: "No" },
  "codo-lateral": { rc: "Mitad de la articulación del codo", angulacion: "No", rotacion: "No", flexion: "Codo 90°" },
  "mano-pa-oblicua": { rc: "3.ª articulación MCF", angulacion: "No", rotacion: "45° lateral" },
  "codo-axial-coyle": { rc: "Mitad de la articulación del codo", angulacion: "45° hacia el hombro (cabeza del radio) · 45° alejándose del hombro (coronoides)", rotacion: "No", flexion: "Codo 90° (cabeza del radio) · 80° (coronoides)" },
  "hombro-ap-rotacion": { rc: "2,5 cm debajo de la coracoides", angulacion: "No", rotacion: "Brazo en rotación externa e interna (sin grados)" },
};
