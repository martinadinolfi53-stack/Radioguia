// Esquemas de cráneo, cara, arcos, nasales, mandíbula, ATM y senos con las figuras por capas del modelo 3D
// (herramientas/ilus3d/figuras/craneo.py). Reemplazan a los de craneo.cjs cuando existe el render <id>-tubo.
// Textos resumidos de datos/bontrager/cap08-craneo-cara-senos.js.
const E = require("./estilo.cjs");
const { RED, MUTE } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const SOBRE_MAE = "medio:meato_auditivo_R|vertex|0.5", MALAR = "medio:meato_auditivo_R|nasion|0.55", GONIONES = "medio:gonion_R+gonion_L|menton|0.3";
const SIN_BOCA = [M("La boca abierta no se dibuja")];

// ---------- cráneo ----------
def({ id: "craneo-ap-axial-towne", blanco: "medio:glabela|vertex|0.45", ri: "24 × 30", otra: "costado", ang: "30°",
  rc: [R("RC 30° caudal a la LOM"), "(37° a la LIOM), ≈6,5 cm por", "encima de la glabela"],
  pos: ["Sentado o en supino", "Mentón abajo: LOM (o LIOM)", "⊥ al RI", "RI centrado en el RC", "proyectado"] });
def({ id: "craneo-lateral", blanco: SOBRE_MAE, ri: "24 × 30", otra: "costado",
  rc: [R("RC perpendicular al RI"), "≈5 cm por encima del MAE"],
  pos: ["Sentado o semiprono", "Lateral verdadera: PMS ∥ RI,", "LIP ⊥ RI", "LIOM ∥ a los bordes del RI"] });
def({ id: "craneo-pa-caldwell", blanco: "nasion", ri: "24 × 30", otra: "costado", ang: "15°", pa: true,
  rc: [R("PA: RC ⊥, sale por la glabela"), R("Caldwell: 15° caudal a la"), R("LOM, sale por el nasión"), "(25-30°: bordes orbitarios)"],
  pos: ["Frente y nariz apoyadas", "LOM ⊥ al RI", "PMS ⊥ al RI, sin rotación"] });
def({ id: "craneo-smv", blanco: "medio:meato_auditivo_R+meato_auditivo_L|nasion|0.2", ri: "24 × 30", otra: "costado",
  rc: [R("RC ⊥ a la LIOM"), "2 cm por delante de los MAE,", "entre los ángulos de la", "mandíbula"],
  pos: ["Cuello hiperextendido,", "vértex contra el RI", "LIOM ∥ al RI", "Sin rotación ni inclinación"] });
def({ id: "craneo-trauma-lateral", blanco: SOBRE_MAE, ri: "24 × 30", otra: "costado", otraTitulo: "Vista desde el techo",
  tubo: "Desde el tubo (paciente acostado)",
  rc: [R("RC horizontal"), "⊥ al RI, ≈5 cm por encima", "del MAE"],
  pos: ["Decúbito supino, sin quitar", "el collarín", "RI al costado de la cabeza", "Lateral verdadera"] });
def({ id: "craneo-trauma-ap-axial", blanco: "glabela", ri: "24 × 30", otra: "costado",
  rc: [R("AP: RC ∥ a la LOM,"), "en la glabela", "Caldwell inversa: 15° cef.", "Towne: 30° caudal"],
  pos: ["Decúbito supino", "Sin mover la cabeza", "RI centrado en el RC", "proyectado"] });

// ---------- huesos faciales ----------
def({ id: "faciales-lateral", blanco: MALAR, ri: "18 × 24", otra: "costado",
  rc: [R("RC perpendicular al RI"), "en el malar, entre el MAE", "y el canto externo"],
  pos: ["Erguido o semiprono", "Lado de interés contra el RI", "PMS ∥ RI, LIP ⊥ RI", "LIOM ∥ a los bordes del RI"] });
def({ id: "faciales-parietoacantial-waters--v1", blanco: "acantion", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("RC perpendicular al RI"), "saliendo por el acantión"],
  pos: ["Waters: cabeza extendida,", "apoyada en el mentón", "LMM ⊥ al RI", "(LOM a 37° del RI)"] });
def({ id: "faciales-parietoacantial-waters--v2", blanco: "acantion", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("RC perpendicular al RI"), "saliendo por el acantión"],
  pos: ["Waters modificada:", "LOM a 55° del RI", "(LLM ⊥ al RI)"] });
def({ id: "faciales-pa-axial-caldwell", blanco: "nasion", ri: "18 × 24", otra: "costado", ang: "15°", pa: true,
  rc: [R("RC 15° caudal a la LOM"), "saliendo por el nasión"],
  pos: ["Frente y nariz apoyadas", "LOM ⊥ al RI", "Sin rotación ni inclinación"] });
def({ id: "faciales-trauma-lateral", blanco: MALAR, ri: "18 × 24", otra: "costado", otraTitulo: "Vista desde el techo",
  tubo: "Desde el tubo (paciente acostado)",
  rc: [R("RC horizontal"), "entre el canto externo", "y el MAE"],
  pos: ["Decúbito supino, sin mover", "la cabeza ni quitar el", "collarín", "PMS ∥ al RI"] });
def({ id: "faciales-trauma-waters-inversa", blanco: "acantion", ri: "18 × 24", otra: "costado",
  rc: [R("RC ∥ a la LMM"), "centrado en el acantión", "Modificada: RC ∥ a la LLM"],
  pos: ["Decúbito supino, sin mover", "la cabeza ni quitar el", "collarín", "Sin rotación ni inclinación"] });
def({ id: "agujeros-opticos-rhese", blanco: "medio:nasion|centro:Right zygomatic bone|0.5", ri: "18 × 24", otra: "arriba", pa: true,
  rc: [R("RC perpendicular al RI"), "en la parte inferior de la", "órbita que queda abajo"],
  pos: ["Nariz, mejilla y mentón", "apoyados", "LAM ⊥ al RI", "PMS a 53° del RI"] });

// ---------- arcos y nasales ----------
def({ id: "arcos-smv", blanco: GONIONES, ri: "24 × 30", otra: "costado",
  rc: [R("RC ⊥ a la LIOM"), "entre los arcos, ≈4 cm por", "debajo de la sínfisis", "mandibular"],
  pos: ["Cabeza extendida, vértex", "sobre el RI", "LIOM ∥ al RI"] });
def({ id: "arcos-tangencial", blanco: "centro:Right zygomatic bone", ri: "18 × 24", otra: "costado",
  rc: [R("RC ⊥ a la LIOM"), "en la parte media del arco"],
  pos: ["Como una SMV de cráneo", "Cabeza rotada ≈15° hacia", "el lado que se estudia", "PMS inclinado ≈15° hacia", "ese lado"] });
def({ id: "arcos-ap-axial-towne", blanco: "medio:nasion|vertex|0.2", ri: "18 × 24", otra: "costado", ang: "30°",
  rc: [R("RC 30° caudal a la LOM"), "(37° a la LIOM), 2,5 cm", "por encima del nasión"],
  pos: ["Sentado o en supino", "LOM (o LIOM) ⊥ al RI", "Sin rotación ni inclinación"] });
def({ id: "nasales-lateral", blanco: "medio:nasion|acantion|0.2", ri: "18 × 24", otra: "costado",
  rc: [R("RC perpendicular al RI"), "≈1,25 cm por debajo del", "nasión"],
  pos: ["Sentado o semiprono", "LIOM ∥ a los bordes del RI", "Lateral verdadera"] });
def({ id: "nasales-superoinferior", blanco: "medio:nasion|acantion|0.2", ri: "18 × 24", otra: "costado",
  rc: [R("RC ∥ a la LGA"), "(⊥ al RI), tangencial a", "la glabela"],
  pos: ["Sentado en el extremo de", "la mesa", "Mentón extendido sobre el RI,", "RI ⊥ a la LGA"] });

// ---------- mandíbula ----------
def({ id: "mandibula-pa", blanco: "medio:acantion|menton|0.5", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("PA: RC ⊥, a la unión de"), R("los labios"), "PA axial: 20-25° cefálico,", "sale por el acantión"],
  pos: ["Frente y nariz apoyadas", "LOM ⊥ al RI", "Sin rotación ni inclinación"] });
def({ id: "mandibula-axiolateral", blanco: "medio:gonion_R|menton|0.4", ri: "18 × 24", otra: "costado", ang: "25°",
  rc: [R("RC 25° cefálico"), "a la mitad de la mandíbula", "del lado de abajo"],
  pos: ["Mentón extendido, lado de", "interés sobre el RI", "LIP ⊥ al RI", "Rotar 0-30° según la zona"] });
def({ id: "mandibula-axiolateral-trauma", blanco: "medio:gonion_R|menton|0.4", ri: "18 × 24", otra: "costado", otraTitulo: "Vista desde el techo",
  tubo: "Desde el tubo (paciente acostado)",
  rc: [R("Haz horizontal, 25° cefálico"), "y 5-10° hacia posterior", "≈5 cm distal al ángulo", "del lado alejado del RI"],
  pos: ["Decúbito supino, cabeza", "sin rotar", "RI de canto, cerca de la cara", "Hombros abajo"] });
def({ id: "mandibula-ap-axial", blanco: "glabela", ri: "18 × 24", otra: "costado", ang: "35°",
  rc: [R("RC 35° caudal a la LOM"), "(42° a la LIOM), en la", "glabela (ATM: 2,5 cm más", "arriba)"],
  pos: ["Sentado o en supino", "LOM ⊥ al RI", "Sin rotación ni inclinación"] });

// ---------- ATM ----------
for (const v of ["v1", "v2"]) {
  const ab = v === "v2";
  def({ id: `atm-law-modificado--${v}`, blanco: "medio:meato_auditivo_L|vertex|0.45", ri: "18 × 24", otra: "costado", ang: "15°",
    rc: [R("RC 15° caudal"), "4 cm por encima del MAE", "de arriba"],
    pos: ["Lado afectado abajo", "Cráneo girado 15° hacia el RI", "LIOM ⊥ al borde anterior", ab ? "Boca bien abierta" : "Boca cerrada"],
    pie: ab ? SIN_BOCA : [] });
  def({ id: `atm-schuller--${v}`, blanco: "medio:meato_auditivo_L|vertex|0.55", ri: "18 × 24", otra: "costado", ang: "25-30°",
    rc: [R("RC 25-30° caudal"), "≈5 cm por encima y 1-2 cm", "por delante del MAE de arriba"],
    pos: ["Lado afectado abajo", "Lateral verdadera", "LIOM ⊥ al borde anterior", ab ? "Boca bien abierta" : "Boca cerrada"],
    pie: ab ? SIN_BOCA : [] });
}

// ---------- senos paranasales ----------
def({ id: "senos-lateral", blanco: MALAR, ri: "18 × 24", otra: "costado",
  rc: [R("RC horizontal"), "entre el MAE y el canto", "externo"],
  pos: ["Sentado, lateral verdadera", "LIOM ⊥ al borde anterior", "del RI", "PMS ∥ RI, LIP ⊥ RI"] });
def({ id: "senos-pa-caldwell--v1", blanco: "nasion", ri: "18 × 24", otra: "costado", ang: "15°", pa: true,
  rc: [R("RC horizontal"), "saliendo por el nasión"],
  pos: ["Sentado, mirando al RI", "RI inclinado 15° hacia", "el paciente", "LOM ⊥ al RI"] });
def({ id: "senos-pa-caldwell--v2", blanco: "nasion", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("RC horizontal"), "saliendo por el nasión"],
  pos: ["Modificada (soporte fijo):", "cabeza inclinada hacia atrás", "hasta que la LOM quede a 15°", "de la horizontal"] });
def({ id: "senos-parietoacantial-waters", blanco: "acantion", ri: "18 × 24", otra: "costado", pa: true,
  rc: [R("RC horizontal, ⊥ al RI"), "saliendo por el acantión"],
  pos: ["Sentado, mentón extendido", "contra el receptor", "LMM ⊥ al RI", "(LOM a 37°)"] });
def({ id: "senos-smv", blanco: GONIONES, ri: "18 × 24", otra: "costado",
  rc: [R("RC horizontal, ⊥ a la LIOM"), "entre los ángulos de la", "mandíbula, 4-5 cm por", "debajo de la sínfisis"],
  pos: ["Sentado, reclinado, vértex", "contra el soporte", "LIOM ∥ al RI"] });

module.exports = I;
