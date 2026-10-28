// Esquemas de columna con las figuras por capas del modelo 3D (herramientas/ilus3d/figuras/columna.py).
// Reemplazan a los de columna.cjs cuando existe el render <id>-tubo. Textos resumidos de datos/cap06-columna.js.
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const r1 = (n) => Math.round(n * 10) / 10;
// línea de los hombros en la vista desde arriba, con una paralela al RI, para mostrar el giro
const giro = (label) => (g) => {
  const a = g.p("cabeza_humero_R"), b = g.p("cabeza_humero_L"), u = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(...u);
  const p0 = [a[0] - u[0] / n * 20, a[1] - u[1] / n * 20], p1 = [b[0] + u[0] / n * 20, b[1] + u[1] / n * 20];
  const ref = `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(p0[0] + Math.sign(u[0] || 1) * (n + 40))}" y2="${r1(p0[1])}" stroke="${MUTE}" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  return ref + `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(p1[0])}" y2="${r1(p1[1])}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 5"/>` +
    E.txt(r1(p1[0] + 4), r1(p1[1] + (u[1] > 0 ? 14 : -4)), label, 11.5, BLUE, "start", 700);
};
const V = (n) => `centro:${n} vertebra`;
const C4 = V("Fourth cervical"), C5 = V("Fifth cervical"), T1 = V("First thoracic"), T7 = V("Seventh thoracic"), T12 = V("Twelfth thoracic"), L3 = V("Third lumbar");
const SOBRE_SINF = "medio:sinfisis|eias_R+eias_L|0.55";

// ---------- cervical ----------
def({ id: "columna-cervical-ap-boca-abierta", blanco: "medio:centro:Atlas|centro:Axis", ri: "18 × 24", otra: "costado",
  rc: [R("RC perpendicular al RI"), "por el centro de la boca", "abierta (C1-C2)"],
  pos: ["Supino o de pie", "Línea incisivos superiores-", "mastoides ⊥ al RI", "Abrir bien la boca sin", "mover la cabeza"] });
def({ id: "columna-cervical-odontoides-fuchs", blanco: "centro:Axis", ri: "18 × 24", otra: "costado",
  rc: [R("RC paralelo a la LMM"), "2,5 cm posteroinferior a las", "mastoides y a los ángulos", "de la mandíbula"],
  pos: ["Supino o de pie", "Mentón elevado hasta que la", "LMM quede casi ⊥ al RI", "RI centrado en la salida"] });
def({ id: "columna-cervical-odontoides-judd", blanco: "centro:Axis", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("RC paralelo a la LMM"), "(igual que en Fuchs)"],
  pos: ["Prono, con el mentón", "apoyado en la mesa"] });
def({ id: "columna-cervical-ap-axial", blanco: C5, ri: "18 × 24", otra: "costado", ang: "15-20°",
  rc: [R("RC 15-20° cefálico"), "entrando por C5 (borde", "inferior del cartílago", "tiroides)"],
  pos: ["Supino o de pie", "Mentón un poco elevado", "RI centrado en el RC", "proyectado"] });
def({ id: "columna-cervical-oblicuas--v1", blanco: C4, ri: "24 × 30", otra: "arriba", extraOtra: giro("45°"),
  rc: [R("Posteriores: RC 15-20°"), R("cefálico"), "entrando por C4"],
  pos: ["De pie o sentado, torso y", "cabeza girados 45°", "Mentón un poco elevado", "Se hacen derecha e izquierda"] });
def({ id: "columna-cervical-oblicuas--v2", blanco: C4, ri: "24 × 30", otra: "arriba", pa: true, extraOtra: giro("45°"),
  rc: [R("Anteriores: RC 15-20°"), R("caudal"), "entrando por C4"],
  pos: ["De pie o sentado, torso y", "cabeza girados 45°", "Mentón un poco elevado", "Se hacen derecha e izquierda"] });
def({ id: "columna-cervical-lateral-erguida", blanco: C4, ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "a C4 (borde superior del", "cartílago tiroides)"],
  pos: ["Sentado o de pie, lateral", "Borde superior del RI 3-5 cm", "por encima del MAE", "Mentón un poco elevado", "Hombros relajados y abajo"] });
def({ id: "columna-cervical-nadador", blanco: T1, ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular"), "a T1 (≈2,5 cm por encima de", "la escotadura yugular)", "Opcional: 3-5° caudal"],
  pos: ["De pie o sentado", "Brazo del lado del RI arriba", "El otro abajo, con el hombro", "bajo y algo rotado"] });
def({ id: "columna-cervical-lateral-flexion-extension--v1", blanco: C4, ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "a C4"],
  pos: ["Lateral verdadera, de pie", "o sentado, hombros abajo", "Hiperflexión: mentón", "al tórax"] });
def({ id: "columna-cervical-lateral-flexion-extension--v2", blanco: C4, ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "a C4"],
  pos: ["Lateral verdadera, de pie", "o sentado, hombros abajo", "Hiperextensión: mentón", "arriba al máximo"] });
def({ id: "columna-cervical-trauma-lateral-horizontal", blanco: C4, ri: "24 × 30", otra: "costado", otraTitulo: "Vista desde el techo",
  tubo: "Desde el tubo (paciente acostado)",
  rc: [R("RC horizontal"), "perpendicular, a C4", "Borde superior del RI 3-5 cm", "por encima del MAE"],
  pos: ["Decúbito supino con", "el collarín puesto", "RI al costado del cuello"] });
def({ id: "columna-cervical-trauma-ap", blanco: C4, ri: "24 × 30", otra: "costado", ang: "15-20°",
  rc: [R("RC 15-20° cefálico"), "entrando por C4"],
  pos: ["Decúbito supino, sin quitar", "el collarín", "Hombros bajos"] });
def({ id: "columna-cervical-trauma-ap-axial-oblicua", blanco: C4, ri: "24 × 30", otra: "arriba", ang: "45°",
  rc: [R("RC 45° hacia medial"), "(y 15° cefálico sin parrilla)", "entrando a la altura de C4"],
  pos: ["Decúbito supino, sin mover", "al paciente ni quitar el", "collarín: se angula el tubo", "Derecha e izquierda"] });
def({ id: "columna-cervical-trauma-cervicotoracica", blanco: T1, ri: "24 × 30", otra: "costado", otraTitulo: "Vista desde el techo",
  tubo: "Desde el tubo (paciente acostado)",
  rc: [R("RI centrado en T1"), "(≈3 cm por encima de la", "escotadura yugular)"],
  pos: ["Opcional, para ver C7", "Hombro y brazo del lado del", "RI arriba; el otro hombro", "abajo"] });

// ---------- torácica ----------
def({ id: "columna-toracica-ap", blanco: T7, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "a T7: 8-10 cm por debajo", "de la escotadura yugular"],
  pos: ["Decúbito supino", "Caderas y rodillas", "flexionadas", "Borde superior del RI ≥3 cm", "por encima de los hombros"] });
def({ id: "columna-toracica-lateral", blanco: T7, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "a T7 (8-10 cm por debajo de", "la escotadura yugular)"],
  pos: ["Decúbito lateral, rodillas", "flexionadas, brazos arriba", "con los codos flexionados", "Apoyo bajo la cintura", "Sin rotación"] });
def({ id: "columna-toracica-oblicua", blanco: T7, ri: "35 × 43", otra: "arriba", extraOtra: giro("70°"),
  rc: [R("RC perpendicular"), "a T7"],
  pos: ["20° de rotación posterior", "desde la lateral (OPD a 70°)", "Brazo alejado del RI atrás;", "el cercano, delante de la", "cabeza"] });

// ---------- lumbar ----------
def({ id: "columna-lumbar-ap", blanco: L3, ri: "30 × 35", otra: "costado",
  rc: [R("RC perpendicular"), "≈4 cm por encima de la", "cresta ilíaca (L3)", "(35 × 43: en la cresta)"],
  pos: ["Decúbito supino", "Caderas y rodillas", "flexionadas", "EIAS a igual distancia", "de la mesa"] });
def({ id: "columna-lumbar-lateral", blanco: L3, ri: "30 × 35", otra: "costado",
  rc: [R("RC perpendicular"), "≈4 cm por encima de la", "cresta ilíaca (L3)", "(35 × 43: en la cresta, L4)"],
  pos: ["Decúbito lateral verdadero", "Caderas y rodillas", "flexionadas", "Apoyo bajo la cintura y", "entre las rodillas"] });
def({ id: "columna-lumbar-lateral-l5-s1", blanco: "medio:centro:Fifth lumbar vertebra|centro:Sacrum|0.3", ri: "18 × 24", otra: "costado",
  rc: [R("RC perpendicular"), "(5-8° caudal si la columna no", "queda paralela a la mesa)", "3 cm por debajo de la cresta", "y 5 cm detrás de la EIAS"],
  pos: ["Decúbito lateral verdadero", "Caderas y rodillas", "flexionadas"] });
def({ id: "columna-lumbar-oblicua--v1", blanco: L3, ri: "30 × 35", otra: "arriba", extraOtra: giro("45°"),
  rc: [R("RC perpendicular"), "a L3, 2,5-5 cm por encima", "de la cresta y 5 cm medial", "a la EIAS de arriba"],
  pos: ["Oblicua posterior: cuerpo", "girado 45°, con bloques bajo", "la pelvis y los hombros", "Derecha e izquierda"] });
def({ id: "columna-lumbar-oblicua--v2", blanco: L3, ri: "30 × 35", otra: "arriba", pa: true, extraOtra: giro("45°"),
  rc: [R("RC perpendicular"), "a L3, 2,5-5 cm por encima", "de la cresta ilíaca"],
  pos: ["Oblicua anterior: cuerpo", "girado 45°", "Derecha e izquierda"] });
def({ id: "columna-lumbar-ap-flexion-lateral--v1", blanco: L3, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI"],
  pos: ["Supino o de pie", "Flexión lateral máxima a la", "derecha, sin inclinar ni", "rotar la pelvis"] });
def({ id: "columna-lumbar-ap-flexion-lateral--v2", blanco: L3, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI"],
  pos: ["Supino o de pie", "Flexión lateral máxima a la", "izquierda, sin inclinar ni", "rotar la pelvis"] });
def({ id: "columna-lumbar-lateral-flexion-extension--v1", blanco: L3, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI (o a la", "artrodesis, si se conoce)"],
  pos: ["Lateral verdadera, de pie", "o en decúbito", "Hiperflexión: máxima", "flexión hacia adelante"] });
def({ id: "columna-lumbar-lateral-flexion-extension--v2", blanco: L3, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI (o a la", "artrodesis, si se conoce)"],
  pos: ["Lateral verdadera, de pie", "o en decúbito", "Hiperextensión: máxima", "extensión hacia atrás"] });
def({ id: "columna-escoliosis-pa-ferguson--v1", blanco: T12, ri: "35 × 43", otra: "costado", pa: true,
  rc: [R("RC perpendicular"), "al centro del RI"],
  pos: ["Primer RI: de pie o sentado,", "brazos a los costados", "Sin rotación de pelvis ni", "tórax"] });
def({ id: "columna-escoliosis-pa-ferguson--v2", blanco: T12, ri: "35 × 43", otra: "costado", pa: true,
  rc: [R("RC perpendicular"), "al centro del RI"],
  pos: ["Segundo RI: alza de 8-10 cm", "bajo el pie (o la nalga) del", "lado convexo de la curva"],
  pie: [M("El alza no está dibujada")] });

// ---------- sacro, cóccix y sacroilíacas ----------
def({ id: "columna-sacro-ap-axial", blanco: SOBRE_SINF, ri: "24 × 30", otra: "costado", ang: "15°",
  rc: [R("RC 15° cefálico"), "≈5 cm por encima de la", "sínfisis del pubis"],
  pos: ["Decúbito supino", "Pelvis sin rotar", "RI centrado en el RC", "proyectado"] });
def({ id: "columna-coccix-ap-axial", blanco: SOBRE_SINF, ri: "18 × 24", otra: "costado", ang: "10°",
  rc: [R("RC 10° caudal"), "5 cm por encima de la", "sínfisis del pubis"],
  pos: ["Decúbito supino, apoyo", "bajo las rodillas", "Sin rotación"] });
def({ id: "columna-sacro-coccix-lateral", blanco: "centro:Sacrum", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular"), "Sacro: 8-10 cm por detrás", "de la EIAS de arriba"],
  pos: ["Decúbito lateral verdadero", "Caderas y rodillas", "flexionadas"] });
def({ id: "columna-coccix-lateral", blanco: "coxis", ri: "18 × 24", otra: "costado",
  rc: [R("RC perpendicular"), "5 cm distal a la EIAS y", "8-10 cm por detrás"],
  pos: ["Decúbito lateral verdadero", "Caderas y rodillas a 90°"] });
def({ id: "columna-sacroiliacas-ap-axial", blanco: "medio:eias_R+eias_L|sinfisis|0.55", ri: "24 × 30", otra: "costado", ang: "30-35°",
  rc: [R("RC cefálico"), "30° (hombres), 35° (mujeres)", "≈5 cm por debajo de las EIAS"],
  pos: ["Decúbito supino", "Pelvis sin rotar", "RI centrado en el RC", "proyectado"] });
def({ id: "columna-sacroiliacas-oblicua-posterior", blanco: "medio:eias_R|eias_L|0.12", ri: "24 × 30", otra: "arriba", extraOtra: giro("25-30°"),
  rc: [R("RC perpendicular"), "2,5 cm medial a la EIAS", "que queda arriba"],
  pos: ["Oblicua posterior 25-30°,", "lado a estudiar levantado", "Se hacen los dos lados"] });

module.exports = I;
