// Generador de preguntas de multiple choice para el modo repaso.
// Todo sale de los datos de las fichas (datos/capNN-*.js, angulacion-rotacion.js, versiones.js): la respuesta correcta es el
// valor de la ficha y los distractores son valores de otras fichas que no se pueden confundir con el correcto.
// Determinístico: con la misma semilla, fichas, aspectos y cantidad salen las mismas preguntas en cualquier dispositivo
// (así una partida de grupo puede compartirse como esa configuración y todos juegan lo mismo).
// Módulo puro: no toca el DOM ni el almacenamiento, se puede probar con node.

export const ASPECTOS = [
  { id: "general", nombre: "General", detalle: "Reconocer la proyección por su esquema o su rayo central" },
  { id: "factores", nombre: "Factores técnicos", detalle: "Tamaño del RI, DFRI, parrilla, respiración, angulación y rotación" },
  { id: "rc", nombre: "Rayo central", detalle: "Dirección y punto de centrado" },
  { id: "posicion", nombre: "Posición del paciente", detalle: "Pasos de la colocación" },
  { id: "criterios", nombre: "Criterios de evaluación", detalle: "Estructuras que se ven" },
];

const RC_ETIQUETA = { perpendicular: "Perpendicular", "cefálico": "Cefálico", caudal: "Caudal", horizontal: "Horizontal", angulado: "Angulado" };
const N_OPCIONES = 4;

const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// azar con semilla (cyrb53 para pasar el texto a número, mulberry32 para la secuencia)
function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return h1 >>> 0;
}
function azar(semilla) {
  let a = hash(String(semilla));
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mezclar = (lista, r) => { const a = [...lista]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// palabras con contenido, para medir cuánto se parecen dos textos
// (sin las palabras que están en casi todas las fichas, y recortadas a 5 letras para que «pulmones» y «pulmonares» cuenten igual)
const VACIAS = new Set("para como desde hasta entre sobre bajo cada este esta esto estos estas que los las del con sin una uno unos unas por mas muy lado lados perpendicular centrado centrar centrada altura dirigido angulado rayo central".split(" "));
const palabras = (s) => new Set(norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !VACIAS.has(w)).map((w) => w.slice(0, 5)));
function parecido(a, b) {
  const A = palabras(a), B = palabras(b);
  if (!A.size || !B.size) return 0;
  let n = 0; for (const w of A) if (B.has(w)) n++;
  return n / Math.min(A.size, B.size);
}
const numeros = (s) => new Set((norm(s).match(/\d+(?:,\d+)?/g) || []));
const niveles = (s) => new Set(norm(s).match(/\b[ctls]\d{1,2}\b/g) || []);
const disjuntos = (A, B) => [...A].every((x) => !B.has(x));
const limpio = (s) => norm(s).replace(/[^a-z0-9]+/g, " ").trim();
const contiene = (a, b) => { const x = limpio(a), y = limpio(b); return x.includes(y) || y.includes(x); };

// ---------- reglas de "no se confunde con el correcto" por dato ----------
const TAMANOS = (s) => new Set((norm(s).match(/\d+\s*x\s*\d+/g) || []).map((x) => x.replace(/\s/g, "")));
const ORIENT = (s) => new Set(["vertical", "horizontal"].filter((w) => norm(s).includes(w)));
const subconj = (A, B) => [...A].every((x) => B.has(x));
const RESP = ["inspiracion", "espiracion", "apnea", "respiracion", "deglucion", "ortostatica"];
const claveResp = (s) => new Set(RESP.filter((w) => norm(s).includes(w)));
const DIRS = ["cefalico", "caudal", "medial", "lateral", "interna", "externa", "proximal", "posterior", "radial", "axila", "hombro", "calcaneo", "talon"];
const dirs = (s) => new Set(DIRS.filter((w) => norm(s).includes(w)));
const siNo = (s) => (/^sí/i.test(s) ? "si" : /^no\b/i.test(s) ? "no" : "");

const DISTINTO = {
  ri(c, d) {
    if (/segun/.test(norm(d)) || contiene(c, d)) return false;
    const Sc = TAMANOS(c), Sd = TAMANOS(d), Oc = ORIENT(c), Od = ORIENT(d);
    if (!Sd.size) return false;
    const mismosTam = subconj(Sd, Sc) || subconj(Sc, Sd);
    return !mismosTam || (Oc.size > 0 && Od.size > 0 && disjuntos(Oc, Od));
  },
  dfri: (c, d) => !contiene(c, d) && numeros(d).size > 0 && disjuntos(numeros(c), numeros(d)),
  respiracion: (c, d) => { const A = claveResp(c), B = claveResp(d); return A.size > 0 && B.size > 0 && disjuntos(A, B); },
  // angulación y rotación: «No» contra «Sí · …»; entre dos «Sí», grados distintos o sentido opuesto
  angulo(c, d) {
    if (contiene(c, d) || /sin grados/.test(norm(d))) return false;
    const a = siNo(c), b = siNo(d);
    if (!a || !b) return false;
    if (a !== b) return true;
    if (a === "no" || /sin grados/.test(norm(c))) return false;
    const Nc = numeros(c), Nd = numeros(d), Dc = dirs(c), Dd = dirs(d);
    return Nd.size > 0 && (disjuntos(Nc, Nd) || (Dc.size > 0 && Dd.size > 0 && disjuntos(Dc, Dd)));
  },
  // dos rayos centrales que apuntan a la misma vértebra (T7, L3…) se pueden confundir aunque estén redactados distinto
  texto: (c, d) => !contiene(c, d) && parecido(c, d) < 0.35 && disjuntos(niveles(c), niveles(d)),
};
// valores raros o compuestos no sirven como distractor (se notaría cuál es el correcto)
const simple = (v) => v && !/[;(:]/.test(v) && v.length <= 90;

// ---------- datos de cada ficha ----------
const pasosDe = (p) => [...(p.posicion || []), ...(p.comun || []), ...(p.versiones || []).flatMap((v) => v.posicion || [])];
// todo el bloque «Estructuras que se ven» junto: un renglón suelto (ej. «Húmero distal») puede valer para varias fichas
const estructurasDe = (p) => (p.criterios || []).filter(([t]) => /estructura/i.test(t)).flatMap(([, it]) => it).filter((x) => !/manual/i.test(x)).join(" ");
const rcDireccion = (p) => {
  const d = p.rc?.direccion, et = RC_ETIQUETA[d];
  if (!et || (d === "angulado" && !p.rc.angulo)) return null;
  return p.rc.angulo ? `${et} · ${p.rc.angulo}` : et;
};
const esquemaDe = (p) => p.ilustracion?.src || p.versiones?.find((v) => v.ilustracion?.src)?.ilustracion.src || null;
const parrillaSiNo = (v) => {
  if (!v || /\bsi el\b|opcional|con o sin|o con parrilla|segun|pantalla si/.test(norm(v))) return null;
  return /^sí(?=$|[\s(;,])/i.test(v) ? "Sí" : /^no(?=$|[\s(;,])/i.test(v) ? "No" : null;
};

const FACTORES = [
  { campo: "ri", nombre: "Tamaño del RI", pregunta: () => `¿Qué tamaño de RI (chasis) se usa?`, regla: "ri" },
  { campo: "dfri", nombre: "DFRI", pregunta: () => `¿Qué DFRI (distancia foco-receptor) se usa?`, regla: "dfri" },
  { campo: "respiracion", nombre: "Respiración", pregunta: () => `¿Cuándo se expone (respiración)?`, regla: "respiracion" },
  { campo: "angulacion", nombre: "Angulación del rayo", pregunta: () => `¿Se angula el rayo?`, regla: "angulo" },
  { campo: "rotacion", nombre: "Rotación de la región", pregunta: () => `¿Se rota la región?`, regla: "angulo" },
];

// ---------- generación ----------
// fichas: proyecciones a repasar · todas: todas las proyecciones (de ahí salen los distractores)
// zonaDe(regionId) → [botón del menú, familia], para buscar distractores primero en la misma zona (más difíciles de descartar)
export function generarPreguntas({ fichas, todas, zonaDe = () => ["", ""], aspectos, cantidad, semilla }) {
  const r = azar(`${semilla}|${fichas.map((p) => p.id).join(",")}|${[...aspectos].sort().join(",")}|${cantidad}`);
  const elegidas = new Set(fichas.map((p) => p.id));
  // orden de búsqueda de distractores: misma zona del menú, misma familia, las otras fichas elegidas y el resto
  const cercanas = (p) => {
    const [g, f] = zonaDe(p.region);
    const nivel = (x) => { const [gx, fx] = zonaDe(x.region); return gx === g ? 0 : fx === f ? 1 : elegidas.has(x.id) ? 2 : 3; };
    const otras = mezclar(todas.filter((x) => x.id !== p.id), r);
    return [0, 1, 2, 3].flatMap((n) => otras.filter((x) => nivel(x) === n));
  };
  // toma distractores de una lista de candidatos (en orden), sin repetir ni parecerse entre sí
  const juntar = (correcta, candidatos, ok, max = N_OPCIONES - 1) => {
    const res = [];
    for (const d of candidatos) {
      if (res.length >= max) break;
      if (!d || norm(d) === norm(correcta) || !ok(correcta, d)) continue;
      if (res.some((x) => norm(x) === norm(d) || contiene(x, d))) continue;
      res.push(d);
    }
    return res;
  };
  const armar = (p, aspecto, campo, enunciado, correcta, distractores, extra = {}) => {
    if (distractores.length < 1) return null;
    const opciones = mezclar([correcta, ...distractores], r);
    return { ficha: p.id, aspecto, campo, enunciado, opciones, correcta: opciones.indexOf(correcta), conNombre: aspecto !== "general", ...extra };
  };

  const candidatas = [];
  for (const p of fichas) {
    const lista = [];
    const vecinas = cercanas(p);
    const n = p.nombre;
    const largo = (c) => (d) => d && !/^segun/.test(norm(d)) && d.length <= c.length * 1.6 + 60;
    if (aspectos.includes("factores")) {
      for (const f of FACTORES) {
        const c = p.factores?.[f.campo];
        if (!c || /segun/.test(norm(c))) continue;
        if (f.regla === "angulo" && !siNo(c)) continue;
        if (f.regla === "respiracion" && !claveResp(c).size) continue;
        const pool = [...vecinas.map((x) => x.factores?.[f.campo]).filter(simple)];
        // «No» siempre es una opción posible para angulación y rotación
        if (f.regla === "angulo") pool.splice(Math.floor(r() * 3), 0, "No");
        const regla = f.regla === "angulo" ? DISTINTO.angulo : DISTINTO[f.regla];
        lista.push(armar(p, "factores", f.campo, f.pregunta(), c, juntar(c, pool, regla), { dato: f.nombre }));
      }
      const pr = parrillaSiNo(p.factores?.parrilla);
      if (pr) lista.push(armar(p, "factores", "parrilla", `¿Lleva parrilla (Bucky)?`, pr, [pr === "Sí" ? "No" : "Sí"], { dato: "Parrilla (Bucky)", completa: p.factores.parrilla }));
    }
    if (aspectos.includes("rc")) {
      const d = rcDireccion(p);
      if (d) {
        const pool = vecinas.map(rcDireccion).filter(Boolean);
        const ok = (c, x) => x.split(" · ")[0] !== c.split(" · ")[0] || (numeros(x).size > 0 && disjuntos(numeros(c), numeros(x)));
        lista.push(armar(p, "rc", "rc-direccion", `¿Cómo se dirige el rayo central?`, d, juntar(d, pool, ok), { dato: "Dirección del RC" }));
      }
      const t = p.rc?.texto;
      if (t) lista.push(armar(p, "rc", "rc-centrado", `¿Cuál es el rayo central?`, t, juntar(t, vecinas.map((x) => x.rc?.texto).filter(largo(t)), DISTINTO.texto), { dato: "Rayo central" }));
    }
    if (aspectos.includes("posicion")) {
      const pasos = pasosDe(p);
      // pasos propios de la ficha (los genéricos, como retirar objetos, no sirven para preguntar)
      const propios = pasos.filter((s) => s.length >= 40 && vecinas.slice(0, 12).every((x) => pasosDe(x).every((o) => !contiene(s, o) && parecido(s, o) < 0.7)));
      const c = mezclar(propios, r)[0];
      if (c) {
        const ok = (_, d) => pasos.every((s) => !contiene(s, d) && parecido(s, d) < 0.35);
        lista.push(armar(p, "posicion", "posicion", `¿Cuál de estos pasos es de la posición del paciente?`, c, juntar(c, vecinas.flatMap((x) => mezclar(pasosDe(x).filter((s) => s.length >= 30), r).slice(0, 2)).filter(largo(c)), ok), { dato: "Posición del paciente" }));
      }
    }
    if (aspectos.includes("criterios")) {
      const c = estructurasDe(p);
      if (c) {
        const ok = (_, d) => !contiene(c, d) && parecido(c, d) < 0.35;
        lista.push(armar(p, "criterios", "estructuras", `¿Qué estructuras se ven en la placa?`, c, juntar(c, vecinas.map(estructurasDe).filter(largo(c)), ok), { dato: "Estructuras que se ven" }));
      }
    }
    if (aspectos.includes("general")) {
      const nombreOk = (x) => norm(x.nombre) !== norm(n);
      const img = esquemaDe(p);
      if (img) {
        const pool = vecinas.filter((x) => nombreOk(x) && esquemaDe(x)).map((x) => x.nombre);
        lista.push(armar(p, "general", "esquema", "¿A qué proyección corresponde este esquema?", n, juntar(n, pool, () => true), { dato: "Esquema", imagen: img }));
      }
      const t = p.rc?.texto;
      if (t) {
        const pool = vecinas.filter((x) => nombreOk(x) && x.rc?.texto && DISTINTO.texto(t, x.rc.texto)).map((x) => x.nombre);
        lista.push(armar(p, "general", "rc-a-proyeccion", "¿En qué proyección el rayo central es así?", n, juntar(n, pool, () => true), { dato: "Proyección", cita: t }));
      }
    }
    candidatas.push(mezclar(lista.filter(Boolean), r));
  }
  // reparto parejo: una pregunta de cada ficha por vuelta, en orden mezclado
  const orden = mezclar(candidatas, r), res = [];
  for (let vuelta = 0; res.length < cantidad && orden.some((l) => l.length > vuelta); vuelta++)
    for (const l of orden) if (l[vuelta] && res.length < cantidad) res.push(l[vuelta]);
  return mezclar(res, r);
}

// cuántas preguntas distintas se pueden armar (para ofrecer "Todas")
export const maximoPreguntas = (args) => generarPreguntas({ ...args, cantidad: Infinity }).length;
