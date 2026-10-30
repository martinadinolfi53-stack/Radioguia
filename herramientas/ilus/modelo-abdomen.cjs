// Esquemas de abdomen, estudios contrastados y portátiles con las figuras por capas del modelo 3D
// (herramientas/ilus3d/figuras/abdomen.py). Reemplazan a los de abdomen.cjs cuando existe el render <id>-tubo.
// Textos resumidos de datos/bontrager/cap09-abdomen-contraste.js y datos/bontrager/cap10-portatiles.js.
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const r1 = (n) => Math.round(n * 10) / 10;
const giro = (label) => (g) => {
  const a = g.p("cabeza_humero_R"), b = g.p("cabeza_humero_L"), u = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(...u);
  const p0 = [a[0] - u[0] / n * 20, a[1] - u[1] / n * 20], p1 = [b[0] + u[0] / n * 20, b[1] + u[1] / n * 20];
  const ref = `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(Math.min(505, p0[0] + Math.sign(u[0] || 1) * (n + 40)))}" y2="${r1(p0[1])}" stroke="${MUTE}" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  return ref + `<line x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(p1[0])}" y2="${r1(p1[1])}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 5"/>` +
    (p1[0] + 4 + label.length * 6.5 > 452       // si no entra antes de la columna del texto, el rótulo va del otro lado
      ? E.txt(r1(p1[0] - 4), r1(p1[1] + (u[1] > 0 ? 14 : -4)), label, 11.5, BLUE, "end", 700)
      : E.txt(r1(p1[0] + 4), r1(p1[1] + (u[1] > 0 ? 14 : -4)), label, 11.5, BLUE, "start", 700));
};
const CRESTAS = "medio:cresta_iliaca_R+cresta_iliaca_L|cresta_iliaca_R+cresta_iliaca_L", SOBRE_CRESTA = "medio:cresta_iliaca_R+cresta_iliaca_L|xifoides|0.25";
const L1 = "centro:First lumbar vertebra", L1_IZQ = `medio:${L1}|centro:Left eleventh rib|0.25`, L1_MITAD_IZQ = `medio:${L1}|centro:Left eleventh rib|0.5`;
const T6 = "centro:Sixth thoracic vertebra", T7 = "centro:Seventh thoracic vertebra", SOBRE_SINF = "medio:sinfisis|eias_R+eias_L|0.55";
const ACOSTADO = { tubo: "Desde el tubo (paciente acostado)" };
const DEC = { ...ACOSTADO, otraTitulo: "Vista desde los pies" };
const TECHO = { ...ACOSTADO, otraTitulo: "Vista desde el techo" };

// ---------- abdomen ----------
def({ id: "abdomen-ap-supino", blanco: CRESTAS, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI, a la altura", "de las crestas ilíacas"],
  pos: ["Decúbito supino, piernas", "extendidas, brazos a los", "costados", "Que entre el borde superior", "de la sínfisis"] });
def({ id: "abdomen-ap-bipedestacion", blanco: SOBRE_CRESTA, ri: "35 × 43", otra: "costado",
  rc: [R("RC horizontal"), "al centro del RI, 5 cm por", "encima de la cresta ilíaca"],
  pos: ["De pie al menos 5 minutos", "antes (mejor 10-20)", "Espalda contra el Bucky,", "brazos a los costados", "Incluir el diafragma"] });
def({ id: "abdomen-decubito-lateral", blanco: SOBRE_CRESTA, ri: "35 × 43", otra: "costado", ...DEC,
  rc: [R("RC horizontal"), "al centro del RI, ≈5 cm por", "encima de la cresta ilíaca"],
  pos: ["Decúbito lateral 5 minutos", "antes como mínimo", "Rodillas algo flexionadas,", "brazos arriba", "Trabar la camilla"] });
def({ id: "abdomen-decubito-dorsal", blanco: SOBRE_CRESTA, ri: "35 × 43", otra: "costado", ...TECHO,
  rc: [R("RC horizontal"), "al centro del RI, 5 cm por", "encima de la cresta"],
  pos: ["Decúbito supino sobre un", "apoyo, costado contra el RI", "Brazos sobre la cabeza", "Plano mediocoronal en la", "línea central del RI"] });

// ---------- esófago ----------
def({ id: "esofagograma-oad", blanco: T6, ri: "35 × 43", otra: "arriba", pa: true, extraOtra: giro("35-40°"),
  rc: [R("RC perpendicular"), "al centro del RI (T6, 5-8 cm", "por debajo de la yugular)"],
  pos: ["Desde el prono, rotar 35-40°", "hacia la derecha", "Brazo derecho abajo,", "izquierdo arriba con el vaso"] });
def({ id: "esofagograma-lateral", blanco: `medio:${T6}|esternon_medio`, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI (T6)"],
  pos: ["Lateral derecha en decúbito", "Brazo y hombro derechos", "arriba y adelante (el vaso)", "Mediocoronal en la línea", "central"] });
def({ id: "esofagograma-ap-pa", blanco: T6, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI (≈8 cm por", "debajo de la yugular, T6)"],
  pos: ["Decúbito supino (de pie: PA)", "Borde superior del RI ≈5 cm", "por encima del hombro"] });

// ---------- estómago ----------
def({ id: "estomago-pa", blanco: L1_IZQ, ri: "35 × 43", otra: "costado", pa: true,
  rc: [R("RC perpendicular"), "Esténico: L1, ≈2,5 cm a la", "izquierda de la columna"],
  pos: ["Decúbito prono, brazos", "arriba junto a la cabeza"],
  pie: [M("Hiperesténico: 5 cm más arriba;"), M("asténico: más abajo")] });
def({ id: "estomago-oad", blanco: L1_MITAD_IZQ, ri: "30 × 35", otra: "arriba", pa: true, extraOtra: giro("40-70°"),
  rc: [R("RC perpendicular"), "Esténico: L1, entre la", "columna y el borde izquierdo", "(oblicuidad 45-55°)"],
  pos: ["Semiprono, lado anterior", "derecho contra la mesa", "Brazo derecho abajo,", "izquierdo arriba"] });
def({ id: "estomago-lateral-derecha", blanco: `medio:${L1}|xifoides|0.4`, ri: "30 × 35", otra: "costado",
  rc: [R("RC perpendicular"), "Esténico: L1, 2,5-4 cm por", "delante del plano", "mediocoronal"],
  pos: ["Acostado sobre el costado", "derecho, brazos arriba", "Caderas y rodillas algo", "flexionadas"] });
def({ id: "estomago-ap", blanco: L1_IZQ, ri: "30 × 35", otra: "costado",
  rc: [R("RC perpendicular"), "Esténico: L1, 2,5-5 cm a la", "izquierda del plano medio"],
  pos: ["Decúbito supino, brazos", "a los costados"] });
def({ id: "estomago-opi", blanco: L1_MITAD_IZQ, ri: "30 × 35", otra: "arriba", extraOtra: giro("30-60°"),
  rc: [R("RC perpendicular"), "Esténico: L1, mitad", "izquierda del abdomen", "(oblicuidad 45°)"],
  pos: ["Semisupino, lado izquierdo", "abajo", "Rodilla derecha algo", "flexionada"] });
def({ id: "intestino-delgado-pa", blanco: SOBRE_CRESTA, ri: "35 × 43", otra: "costado", pa: true,
  rc: [R("RC perpendicular"), "≈5 cm por encima de la", "cresta (primeras placas);", "luego en la cresta"],
  pos: ["Decúbito prono (o AP en", "supino)", "Sin rotación", "Que se vean los indicadores", "de tiempo"] });

// ---------- colon ----------
def({ id: "enema-opaco-pa-ap", blanco: CRESTAS, ri: "35 × 43", otra: "costado", pa: true,
  rc: [R("RC perpendicular"), "al centro del RI, a la", "altura de la cresta ilíaca"],
  pos: ["Decúbito prono (PA) o", "supino (AP)", "Sin rotación"] });
def({ id: "enema-opaco-oblicuas--v1", blanco: SOBRE_CRESTA, ri: "35 × 43", otra: "arriba", pa: true, extraOtra: giro("35-45°"),
  rc: [R("RC perpendicular"), "2,5-5 cm por encima de la", "cresta, 2,5 cm a la", "izquierda del plano medio"],
  pos: ["OAD: semiprono, rotado", "35-45°", "Incluir la zona rectal"] });
def({ id: "enema-opaco-oblicuas--v2", blanco: SOBRE_CRESTA, ri: "35 × 43", otra: "arriba", pa: true, extraOtra: giro("35-45°"),
  rc: [R("RC perpendicular"), "2,5-5 cm por encima de la", "cresta ilíaca"],
  pos: ["OAI: semiprono, rotado", "35-45°", "(también OPD y OPI)"] });
def({ id: "enema-opaco-lateral-recto", blanco: "medio:eias_L|centro:Sacrum|0.5", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular"), "a la altura de las EIAS, en", "el plano mediocoronal"],
  pos: ["Decúbito, lateral verdadera", "Caderas y rodillas algo", "flexionadas"],
  pie: [M("En decúbito prono, RC horizontal")] });
def({ id: "enema-opaco-decubito-lateral", blanco: CRESTAS, ri: "35 × 43", otra: "costado", ...DEC,
  rc: [R("RC horizontal"), "al centro del RI, a la", "altura de la cresta ilíaca"],
  pos: ["Decúbito lateral, brazos", "arriba, rodillas flexionadas", "Espalda contra el RI", "Trabar la camilla"] });
def({ id: "enema-opaco-ap-pa-axial--v1", blanco: "medio:eias_R+eias_L|sinfisis|0.55", ri: "30 × 35", otra: "costado", ang: "30-40°",
  rc: [R("AP axial: RC 30-40°"), R("cefálico"), "5 cm por debajo de las EIAS"],
  pos: ["Decúbito supino", "Centrado en la línea media"] });
def({ id: "enema-opaco-ap-pa-axial--v2", blanco: "medio:eias_R+eias_L|eias_R+eias_L", ri: "30 × 35", otra: "costado", ang: "30-40°", pa: true,
  rc: [R("PA axial: RC 30-40°"), R("caudal"), "sale a la altura de las EIAS"],
  pos: ["Decúbito prono", "Centrado en la línea media"] });
def({ id: "enema-opaco-ap-pa-axial--v3", blanco: "medio:eias_R|sinfisis|0.5", ri: "30 × 35", otra: "arriba", extraOtra: giro("30-40°"),
  rc: [R("OPI axial: RC 30-40°"), R("cefálico"), "5 cm por debajo y 5 cm", "medial a la EIAS derecha"],
  pos: ["Oblicua posterior izquierda", "de 30-40°"] });

// ---------- urinario ----------
def({ id: "urografia-ap", blanco: CRESTAS, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al centro del RI, a la", "altura de la cresta ilíaca"],
  pos: ["Decúbito supino, apoyo bajo", "las rodillas, sin rotación", "Marcador de minutos"],
  pie: [M("Nefrograma: entre el xifoides"), M("y la cresta ilíaca")] });
def({ id: "urografia-oblicuas", blanco: CRESTAS, ri: "35 × 43", otra: "arriba", extraOtra: giro("30°"),
  rc: [R("RC perpendicular"), "al centro del RI, a la", "altura de la cresta ilíaca"],
  pos: ["Semisupino, oblicuo 30°", "Rodilla y codo del lado", "elevado flexionados", "Marcador de minutos"] });
def({ id: "urografia-ap-posmiccional", blanco: "medio:cresta_iliaca_R+cresta_iliaca_L|sinfisis|0.2", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "a las crestas ilíacas o", "≈2,5 cm más abajo"],
  pos: ["De pie, sin rotación", "Que entren la vejiga y", "la sínfisis", "Marcadores de bipedestación", "y posmiccional"] });
def({ id: "cistografia-ap-axial", blanco: SOBRE_SINF, ri: "30 × 35", otra: "costado", ang: "10-15°",
  rc: [R("RC 10-15° caudal"), "≈5 cm por encima de la", "sínfisis, en el plano medio"],
  pos: ["Decúbito supino, piernas", "extendidas", "RI centrado en el RC", "proyectado"] });
def({ id: "cistografia-oblicuas", blanco: "medio:sinfisis|eias_L|0.45", ri: "30 × 35", otra: "arriba", extraOtra: giro("45-60°"),
  rc: [R("RC perpendicular"), "≈5 cm por encima de la", "sínfisis y 5 cm medial a", "la EIAS elevada"],
  pos: ["Semisupino, oblicuo 45-60°", "Brazo y pierna del lado", "elevado flexionados"] });
def({ id: "cistografia-lateral", blanco: "medio:sinfisis|centro:Sacrum|0.35", ri: "30 × 35", otra: "costado",
  rc: [R("RC perpendicular"), "5 cm por encima y por", "detrás de la sínfisis"],
  pos: [M("El manual solo la muestra"), M("en la figura 9.57")] });

// ---------- portátiles ----------
def({ id: "port-torax-ap--v1", blanco: T7, ri: "35 × 43", otra: "costado", ang: "3-5°",
  rc: [R("RC 3-5° caudal"), "(⊥ al esternón), 8-10 cm", "por debajo de la yugular (T7)"],
  pos: ["Decúbito supino", "RI con funda, borde superior", "5 cm sobre los hombros", "Sin rotación"] });
def({ id: "port-torax-ap--v2", blanco: T7, ri: "35 × 43", otra: "costado", ang: "3-5°",
  rc: [R("RC 3-5° caudal"), "(⊥ al esternón), a T7"],
  pos: ["Semiincorporado: respaldo", "levantado si se puede", "Hombros hacia adelante", "Sin rotación"] });
def({ id: "port-abdomen-ap-supino", blanco: CRESTAS, ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular al RI"), "a la altura de la cresta", "ilíaca"],
  pos: ["Decúbito supino", "RI con funda, horizontal y", "⊥ al RC (apoyos si hace", "falta)"] });
def({ id: "port-abdomen-decubito-lateral", blanco: SOBRE_CRESTA, ri: "35 × 43", otra: "costado", ...DEC,
  rc: [R("RC horizontal"), "5 cm por encima de la", "cresta ilíaca"],
  pos: ["Sobre el lado izquierdo,", "con apoyos", "RI ⊥ al RC", "Marcador de decúbito"] });
def({ id: "port-pelvis-cadera-ap--v1", blanco: "medio:eias_R+eias_L|sinfisis", ri: "35 × 43", otra: "costado",
  rc: [R("Pelvis: RC perpendicular"), "entre las EIAS y la sínfisis"],
  pos: ["RI con funda debajo del", "paciente", "EIAS a igual distancia", "Rotación interna 15° solo", "sin sospecha de fractura"] });
def({ id: "port-pelvis-cadera-ap--v2", blanco: "medio:eias_R|trocanter_mayor_R|0.5", ri: "24 × 30", otra: "costado",
  rc: [R("Cadera: RC y RI en la"), R("cadera"), "5 cm medial a la EIAS, a la", "altura del trocánter mayor"],
  pos: ["RI con funda debajo del", "paciente", "Sin rotación"] });
def({ id: "port-cadera-axiolateral-danelius", blanco: "medio:cabeza_femur_R|trocanter_mayor_R", ri: "24 × 30", otra: "costado",
  otraTitulo: "Vista desde el techo", tubo: "Desde el tubo (entre las piernas)",
  rc: [R("RC horizontal"), "⊥ al RI y al cuello femoral"],
  pos: ["Apoyo bajo la cadera", "Parrilla vertical contra el", "costado, sobre la cresta", "Otra pierna elevada (nunca", "sobre el tubo)"] });

module.exports = I;
