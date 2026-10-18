// Configuración de la Calculadora de técnica.
// Las fórmulas las provee Martin. Mientras "configurada" sea false, la calculadora muestra
// "Pendiente de configuración" y no calcula nada. No completar con fórmulas genéricas ni del manual.
//
// Cuando lleguen las fórmulas:
//   kvp(espesorCm, proyeccion) → número   (proyeccion = ficha seleccionada o null)
//   mas(espesorCm, proyeccion) → número
//   validar(espesorCm, proyeccion) → null si se puede calcular, o un texto con la advertencia
//   espesor: { min, max } en cm, para validar el dato
//   medicion: texto con cómo medir el espesor; ilustracionMedicion: ruta a la imagen
//
// Se pueden definir fórmulas por proyección con "porProyeccion": { "<id de ficha>": { kvp, mas } }.

export default {
  configurada: false,
  espesor: null,
  kvp: null,
  mas: null,
  validar: null,
  porProyeccion: {},
  medicion: null,
  ilustracionMedicion: null,
  advertencia: null,
};
