// Esquemas de pelvis, caderas, acetábulo y fémur con las figuras por capas del modelo 3D (herramientas/ilus3d/figuras/pelvis.py).
// Reemplazan a los de pelvis.cjs cuando existe el render <id>-tubo. Textos resumidos de datos/cap05-femur-cintura-pelvica.js.
const E = require("./estilo.cjs");
const { RED, MUTE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];

def({ id: "pelvis-ap", blanco: "medio:eias_R+eias_L|sinfisis", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "a mitad de camino entre", "las EIAS y la sínfisis", "(≈5 cm distal a las EIAS)"],
  pos: ["Decúbito supino", "Piernas con rotación", "interna de 15-20°", "EIAS a igual distancia", "de la mesa"],
  pie: [M("No rotar las piernas si se"), M("sospecha fractura de cadera")] });

def({ id: "caderas-ap-bilateral", blanco: "medio:cabeza_femur_R+cabeza_femur_L|sinfisis|0.2", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular"), "al punto medio entre las", "cabezas femorales (≈2 cm", "por encima de la sínfisis)"],
  pos: ["Decúbito supino", "Piernas extendidas con", "rotación interna de 15-20°", "Pelvis sin rotar"] });

def({ id: "caderas-ap-unilateral", blanco: "medio:cabeza_femur_R+trocanter_mayor_R|rodilla_R|0.08", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "2,5-5 cm distal a la mitad", "del cuello femoral"],
  pos: ["Decúbito supino", "Pierna extendida, rotación", "interna de 15-20°", "(sin traumatismo)"],
  pie: [M("Que entre todo el dispositivo"), M("ortopédico, si lo hay")] });

def({ id: "pelvis-ap-axial-inlet", blanco: "medio:eias_R+eias_L|eias_R+eias_L", ri: "35 × 43", otra: "costado", ang: "40°",
  rc: [R("RC 40° caudal"), "a la altura de las EIAS", "(hombres y mujeres)"],
  pos: ["Decúbito supino", "Pelvis sin rotar", "RI centrado en el RC", "proyectado"] });

def({ id: "pelvis-ap-axial-outlet", blanco: "medio:sinfisis|rodilla_R+rodilla_L|0.08", ri: "35 × 43", otra: "costado", ang: "20-45°",
  rc: [R("RC cefálico"), "Hombres 20-35°", "Mujeres 30-45°", "2,5-5 cm por debajo de la", "sínfisis del pubis"],
  pos: ["Decúbito supino", "Pelvis sin rotar"] });

def({ id: "cadera-lateral-rana-bilateral", blanco: "medio:cabeza_femur_R+cabeza_femur_L|cabeza_femur_R+cabeza_femur_L", ri: "35 × 43", otra: "costado",
  rc: [R("RC perpendicular al RI"), "a la altura de las cabezas", "femorales (≈7-8 cm por", "debajo de las EIAS)"],
  pos: ["Caderas y rodillas", "flexionadas", "Fémures abducidos 40-45°", "desde la vertical", "Plantas de los pies juntas"],
  pie: [M("Sin traumatismo")] });

def({ id: "cadera-lateral-rana-unilateral--v1", blanco: "medio:cabeza_femur_R|trocanter_mayor_R", ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular"), "a la mitad del cuello", "femoral"],
  pos: ["Cuello femoral:", "cadera y rodilla flexionadas", "Fémur a 45° de abducción", "desde la vertical"],
  pie: [M("Con 20-30° el cuello sale"), M("menos acortado")] });

def({ id: "cadera-lateral-rana-unilateral--v2", blanco: "medio:cabeza_femur_R|trocanter_mayor_R", ri: "24 × 30", otra: "arriba",
  rc: [R("RC perpendicular"), "a la cabeza femoral"],
  pos: ["Cabeza y acetábulo:", "paciente oblicuo 35-45°", "hacia el lado afectado", "Pierna abducida hasta", "la mesa"] });

def({ id: "cadera-axiolateral-danelius-miller", blanco: "medio:cabeza_femur_R|trocanter_mayor_R", ri: "24 × 30", otra: "costado",
  otraTitulo: "Vista desde el techo", tubo: "Desde el tubo (entre las piernas)",
  rc: [R("RC horizontal"), "perpendicular al cuello", "femoral y al RI"],
  pos: ["Decúbito supino", "Cadera y rodilla sanas", "flexionadas y elevadas", "Pierna afectada con 15°", "de rotación interna", "RI vertical sobre la cresta"],
  pie: [M("Traumatismo: no rotar si hay"), M("posible fractura")] });

def({ id: "acetabulo-oblicua-posterior-judet", blanco: "medio:eias_R|sinfisis|0.4", ri: "24 × 30", otra: "arriba",
  rc: [R("RC perpendicular"), "Cadera apoyada: 5 cm distal", "y 5 cm medial a la EIAS", "Cadera elevada: 5 cm distal", "a la EIAS"],
  pos: ["Oblicua posterior de 45°", "Cuña debajo de la pierna", "elevada"] });

def({ id: "acetabulo-pa-oblicua-axial-teufel", blanco: "medio:cabeza_femur_R|cresta_iliaca_R|0.08", ri: "24 × 30", otra: "costado", ang: "12°", pa: true,
  rc: [R("RC 12° cefálico"), "2,5 cm por encima del", "trocánter mayor y ≈5 cm", "lateral al plano medio"],
  pos: ["Semidecúbito prono, lado", "afectado abajo", "Oblicua anterior 35-40°"] });

def({ id: "femur-ap", blanco: "centro:Right femur", ri: "35 × 43",
  rc: [R("RC perpendicular al fémur"), "a la parte media del RI"],
  pos: ["Decúbito supino, fémur en la línea media", "Rotación interna ≈5° (15° si incluye la cadera)", "RI ≈5 cm por debajo de la rodilla", "Cadera hacia el cátodo"] });

def({ id: "femur-lateral", blanco: "centro:Right femur", ri: "35 × 43",
  rc: [R("RC perpendicular al fémur"), "a la parte media del RI"],
  pos: ["Decúbito lateral sobre el lado afectado", "Rodilla flexionada ≈45°", "Pierna sana llevada hacia atrás", "Cadera hacia el cátodo"] });

def({ id: "femur-lateral-haz-horizontal", blanco: "centro:Right femur", ri: "35 × 43",
  rc: [R("RC horizontal"), "perpendicular al fémur, al punto medio del RI"],
  pos: ["Sin mover al paciente (decúbito supino)", "Pierna lesionada apenas elevada, con apoyo", "RI vertical entre las piernas, incluyendo", "la rodilla"],
  pie: [M("Fémur proximal: Danelius-Miller")] });

module.exports = I;
