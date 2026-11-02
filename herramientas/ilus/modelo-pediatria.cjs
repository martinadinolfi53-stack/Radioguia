// Fichas pediátricas con el avatar de nene del modelo 3D (herramientas/ilus3d/figuras/pediatria.py), sin huesos: no hay
// esqueleto infantil. Reemplazan a los dibujos a mano de torax.cjs, mano.cjs, rodilla.cjs, pelvis.cjs y abdomen.cjs.
// Textos resumidos de datos/bontrager (caps. 1, 2, 4, 5 y 9). El Pigg-O-Stat va esquemático (asiento y piezas laterales).
const E = require("./estilo.cjs");
const { RED, MUTE, BLUE, INK } = E;
const fs = require("fs"), path = require("path");
const RENDER = path.join(__dirname, "../ilus3d/render");
const I = {};
const def = (o) => { if (fs.existsSync(path.join(RENDER, o.id + "-tubo.webp"))) I[o.id] = () => E.modelo(o); };
const R = (t) => [t, RED, 700];
const M = (t) => [t, MUTE];
const r1 = (n) => Math.round(n * 10) / 10;
const AZ = "#6f8fb5", AZF = "#eaf2fb";
const NOTA = M("Sin huesos: el modelo no tiene esqueleto infantil");

// Pigg-O-Stat visto desde el tubo: piezas laterales transparentes a los costados del tronco y los brazos
const piezas = (f, t) => {
  const y0 = Math.max(f.y, t[1] - 150), y1 = t[1] + 60;
  const iz = f.borde("izq", t[1] - 40, t[1] + 40), de = f.borde("der", t[1] - 40, t[1] + 40);
  const rect = (x) => `<rect x="${r1(x)}" y="${r1(y0)}" width="20" height="${r1(y1 - y0)}" rx="8" fill="${AZF}" fill-opacity=".45" stroke="${AZ}" stroke-width="1.5"/>`;
  return rect(iz - 24) + rect(de + 4) + E.txt(r1(de + 14), r1(y1 + 14), "piezas laterales", 10, AZ, "middle", 400);
};
// Pigg-O-Stat de costado: asiento bajo las nalgas, columna de soporte y piezas laterales (transparentes) alrededor del tronco
const asiento = (g, q) => {
  const h = g.p("caderas"), ys = g.abajo(h[0] - 14, h[0] + 14);
  const top = Math.min(q[1] - 95, g.y + 4);
  return `<rect x="${r1(h[0] - 34)}" y="${r1(top)}" width="68" height="${r1(ys - top)}" rx="10" fill="${AZF}" fill-opacity=".45" stroke="${AZ}" stroke-width="1.3"/>` +
    `<rect x="${r1(h[0] - 48)}" y="${r1(ys)}" width="96" height="9" rx="3" fill="#cfd3dc" stroke="#8a8f9c"/>` +
    `<rect x="${r1(h[0] - 5)}" y="${r1(ys + 9)}" width="10" height="${r1(Math.max(20, 262 - ys))}" fill="#cfd3dc" stroke="#8a8f9c"/>` +
    E.txt(r1(h[0] - 54), r1(ys + 6), "Pigg-O-Stat", 10, MUTE, "end", 400);
};

// ---------- tórax ----------
const RC_TORAX = [R("RC ⊥ en la mitad de los"), R("campos pulmonares,"), "a la altura de la línea", "mamilar (pezones)"];
def({ id: "torax-ped-ap-mesa", blanco: "linea_mamilar", ri: "18 × 24", otra: "costado", otraTitulo: "De costado",
  rc: RC_TORAX,
  pos: ["Decúbito supino, sin rotación", "Brazos arriba y piernas", "extendidas, inmovilizados", "(cinta, bolsas de arena)", "Hombros 5 cm por debajo", "del borde superior del RI"],
  pie: [M("DFRI 128-150 cm o más"), NOTA] });
def({ id: "torax-ped-pa-pigg", blanco: "linea_mamilar", ri: "18 × 24", otra: "costado", otraTitulo: "De costado", pa: true,
  extra: piezas, extraOtra: asiento,
  rc: RC_TORAX,
  pos: ["Sentado en el Pigg-O-Stat,", "piernas por las aberturas", "Brazos arriba, sostenidos", "por las piezas laterales", "Hombros 2,5 cm por debajo", "del borde superior del RI"],
  pie: [M("DFRI 180 cm como mínimo"), NOTA] });
def({ id: "torax-ped-lateral-pigg", blanco: "linea_mamilar", ri: "24 × 18", otra: "costado", otraTitulo: "De frente",
  extra: piezas, extraOtra: asiento,
  rc: RC_TORAX,
  pos: ["Misma posición que la PA:", "girar 90° el asiento y las", "piezas (lateral izquierda)", "Protección plomada justo por", "encima de la cresta ilíaca"],
  pie: [M("DFRI 180 cm"), NOTA] });
def({ id: "torax-ped-lateral-mesa", blanco: "linea_mamilar", ri: "24 × 18", otra: "costado", otraTitulo: "Desde los pies",
  tubo: "Desde el tubo (techo)",
  rc: RC_TORAX,
  pos: ["Decúbito lateral (por lo", "general izquierdo)", "Brazos arriba, la cabeza", "entre ellos; piernas", "flexionadas e inmovilizadas", "Lateral verdadera"],
  pie: [M("DFRI 128-150 cm o más"), NOTA] });

// ---------- miembros ----------
const RC_MEDIO = [R("RC ⊥ en la parte media"), R("de la extremidad")];
def({ id: "ped-ext-sup-ap", blanco: "codo_R", ri: "Según el tamaño", otra: "costado", otraTitulo: "De costado",
  rc: RC_MEDIO, pos: ["Decúbito supino, brazo", "separado del cuerpo", "Toda la extremidad", "Inmovilizar (banda, bolsas", "de arena o cinta)", "Protección sobre la pelvis"],
  pie: [M("Sin parrilla"), NOTA] });
def({ id: "ped-ext-sup-lateral", blanco: "codo_R", ri: "Según el tamaño", otra: "costado", otraTitulo: "De costado",
  rc: RC_MEDIO, pos: ["Decúbito supino, brazo", "separado del cuerpo", "Codo flexionado y toda la", "extremidad girada hasta", "la posición lateral", "Inmovilizar"],
  pie: [M("Sin parrilla"), NOTA] });
def({ id: "ped-ext-inf-ap", blanco: "rodilla_R", ri: "Según el tamaño", otra: "costado", otraTitulo: "De costado",
  rc: RC_MEDIO, pos: ["Decúbito supino, toda la", "extremidad sobre el RI", "Brazos y pierna sana con", "bolsas de arena", "Protección sobre la pelvis"],
  pie: [M("Sin parrilla"), NOTA] });
def({ id: "ped-ext-inf-lateral", blanco: "rodilla_R", ri: "Según el tamaño", otra: "costado", otraTitulo: "De costado",
  rc: RC_MEDIO, pos: ["Semidecúbito supino", "Pierna afectada en abducción", "(pata de rana) hasta la", "lateral, con cinta o banda", "No si hay traumatismo o", "enfermedad de la cadera"],
  pie: [M("Sin parrilla"), NOTA] });
def({ id: "ped-pie-ap-mediolateral-kite--v1", blanco: "mediotarso_R", ri: "18 × 24", otra: "costado", otraTitulo: "De costado",
  tubo: "Desde el tubo (arriba)",
  rc: [R("AP: RC ⊥ a los tarsianos"), R("medios"), "(Kite: sin angular el rayo)"],
  pos: ["Sentado sobre un apoyo,", "rodilla flexionada y la", "planta sobre el RI", "No enderezar el pie al", "apoyarlo"],
  pie: [M("Se suelen hacer los dos pies"), NOTA] });
def({ id: "ped-pie-ap-mediolateral-kite--v2", blanco: "base_mt_R", ri: "18 × 24", otra: "costado", otraTitulo: "De costado",
  rc: [R("Lateral: RC ⊥ a la zona"), R("metatarsiana proximal")],
  pos: ["Pierna de costado, lado", "afectado abajo", "Sujetar con cinta o banda", "No enderezar el pie: AP y", "lateral a 90° una de otra"],
  pie: [M("Se suelen hacer los dos pies"), NOTA] });

// ---------- caderas y pelvis ----------
def({ id: "caderas-pelvis-pediatricas-ap", blanco: "caderas", ri: "Según el tamaño", otra: "costado", otraTitulo: "De costado",
  rc: [R("RC ⊥ a la altura de las"), R("caderas")],
  pos: ["Decúbito supino, pelvis", "centrada", "Piernas extendidas con", "rotación interna de 15°", "Protección gonadal que no", "tape las caderas"],
  pie: [M("Parrilla si supera 10 cm"), NOTA] });
def({ id: "caderas-pelvis-pediatricas-lateral-rana", blanco: "caderas", ri: "Según el tamaño", otra: "costado", otraTitulo: "Desde los pies",
  rc: [R("RC ⊥ a la altura de las"), R("caderas")],
  pos: ["Decúbito supino", "Rodillas y caderas", "flexionadas, plantas juntas", "y piernas en abducción", "Fijar con cinta y bolsas", "de arena"],
  pie: [M("Parrilla si supera 10 cm"), NOTA] });

// ---------- abdomen ----------
def({ id: "abdomen-ped-ap-supino", blanco: "ombligo", ri: "24 × 30", otra: "costado", otraTitulo: "De costado",
  rc: [R("Mayores de 1 año: RC ⊥"), R("a la altura del ombligo"), "Hasta 1 año: 2,5 cm por", "encima de la cresta ilíaca"],
  pos: ["Decúbito supino, brazos", "arriba y piernas", "inmovilizados", "Proteger las gónadas", "si se puede"],
  pie: [M("Exponer en espiración"), NOTA] });
def({ id: "abdomen-ped-ap-bipedestacion", blanco: "sobre_cresta", ri: "24 × 30", otra: "costado", otraTitulo: "De costado",
  extra: piezas, extraOtra: asiento,
  rc: [R("Mayores: RC ⊥ ≈2,5-5 cm"), R("sobre la cresta ilíaca"), "Hasta 1 año: 2,5 cm por", "encima del ombligo"],
  pos: ["Sentado en el Pigg-O-Stat,", "piernas por las aberturas", "Brazos arriba, piezas", "laterales ajustadas", "Protección a la altura", "de la sínfisis del pubis"],
  pie: [M("Exponer en espiración"), NOTA] });

module.exports = I;
