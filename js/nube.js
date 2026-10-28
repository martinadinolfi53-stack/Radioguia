// Cuentas, grupos y ranking en Firebase (proyecto "App RX", datos en config/firebase.js).
// El SDK (js/vendor/firebase.js, firebase@12.19.0 empaquetado con esbuild) se carga recién cuando se usa algo de esto,
// así el resto de la app no lo descarga ni depende de la red.
//
// Firestore (reglas en herramientas/firestore.rules):
//   config/desafio                         { preguntas, vidas }  lo cambia Martin desde la consola para ajustar la dificultad
//   usuarios/{uid}                         { apodo, foto, grupos: [gid] }   foto: JPEG cuadrado chico como data URL
//   usuarios/{uid}/privado/favoritos       { datos, actualizado }  listas de favoritos (JSON de js/almacen.js), solo cuentas con Google;
//                                          solo las lee y escribe el dueño (ver js/sync-favoritos.js)
//   codigos/{CODIGO}                       { gid, creador }  para unirse escribiendo el código del grupo
//   grupos/{gid}                           { nombre, codigo, creador, creado, fichas, aspectos, excluir, origen }
//   grupos/{gid}/miembros/{uid}            { uid, apodo, foto, puntos, partidas, racha, ultimaFecha }  acumulado para el ranking histórico
//   grupos/{gid}/partidas/{fecha}_{uid}    { uid, apodo, fecha, semana, correctas, respondidas, vidas, sinVidas, puntos, bonus, duracionMs, terminada, detalle }
//   reportes/{id}                          { uid, apodo, creado, ficha, fichaNombre, campo, enunciado, opciones, correcta, elegida, motivo, comentario }
//                                          preguntas reportadas en el repaso; los escribe cualquiera y solo los lee quien figura en ADMINS de las reglas
import { firebaseConfig } from "../config/firebase.js";

export const DESAFIO = { preguntas: 15, vidas: 5, puntosPorAcierto: 10, bonusPorDia: 2, bonusMax: 10 };

let fb = null, app, auth, db;
let usuario = null, perfil = null, listo = false;
const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => { try { f(); } catch {} });
export const alCambiar = (f) => oyentes.add(f);

// emulador local para probar sin tocar el proyecto real: ?emulador en la dirección
const EMULADOR = /[?&]emulador\b/.test(location.search);

export async function iniciar() {
  if (fb) return fb;
  fb = await import("./vendor/firebase.js");
  app = fb.initializeApp(firebaseConfig);
  auth = fb.getAuth(app);
  try { db = fb.initializeFirestore(app, { localCache: fb.persistentLocalCache({ tabManager: fb.persistentSingleTabManager() }) }); }
  catch { db = fb.initializeFirestore(app, {}); }
  if (EMULADOR) { fb.connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true }); fb.connectFirestoreEmulator(db, "127.0.0.1", 8080); }
  await new Promise((ok) => fb.onAuthStateChanged(auth, async (u) => {
    const otro = u?.uid !== usuario?.uid;
    usuario = u;
    if (otro) perfil = null;
    // lo que ya se guardó en esta sesión (por ejemplo el apodo recién elegido) gana sobre una lectura que llegó después
    if (u) { try { const leido = (await fb.getDoc(fb.doc(db, "usuarios", u.uid))).data(); if (usuario?.uid === u.uid) perfil = { ...(leido || {}), ...(perfil || {}) }; } catch {} }
    listo = true; avisar(); ok();
  }));
  return fb;
}

export const estado = () => ({ listo, usuario, perfil, conGoogle: !!usuario?.providerData?.some((p) => p.providerId === "google.com") });

const limpiarApodo = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, 24);

// entrar sin cuenta (solo apodo) o con Google; el apodo es lo único que ven los demás
export async function entrarAnonimo(apodo) {
  await iniciar();
  apodo = limpiarApodo(apodo);
  if (!apodo) throw new Error("Escribí un apodo.");
  if (!auth.currentUser) await fb.signInAnonymously(auth);
  await guardarApodo(apodo);
}
export async function entrarGoogle() {
  await iniciar();
  const prov = new fb.GoogleAuthProvider();
  // si ya jugaba con apodo, se vincula la misma cuenta a Google para no perder grupos ni puntos
  const r = auth.currentUser?.isAnonymous ? await fb.linkWithPopup(auth.currentUser, prov) : await fb.signInWithPopup(auth, prov);
  usuario = r.user;
  if (!perfil?.apodo) await guardarApodo(limpiarApodo(r.user.displayName?.split(" ")[0]) || "Jugador");
  avisar();
}
export async function salir() { await iniciar(); await fb.signOut(auth); }

export async function guardarApodo(apodo) {
  apodo = limpiarApodo(apodo);
  if (!apodo) throw new Error("Escribí un apodo.");
  const uid = auth.currentUser.uid;
  await fb.setDoc(fb.doc(db, "usuarios", uid), { apodo }, { merge: true });
  perfil = { ...(perfil || {}), apodo };
  // el apodo también se ve en el ranking de cada grupo
  await Promise.all((perfil.grupos || []).map((g) => fb.updateDoc(fb.doc(db, "grupos", g, "miembros", uid), { apodo }).catch(() => {})));
  avisar();
}

// la foto de perfil es obligatoria; va en el perfil y en cada grupo, como el apodo, para mostrarla en el ranking
export async function guardarFoto(foto) {
  if (!/^data:image\/jpeg;base64,/.test(foto || "")) throw new Error("Elegí una foto.");
  const uid = auth.currentUser.uid;
  await fb.setDoc(fb.doc(db, "usuarios", uid), { foto }, { merge: true });
  perfil = { ...(perfil || {}), foto };
  await Promise.all((perfil.grupos || []).map((g) => fb.updateDoc(fb.doc(db, "grupos", g, "miembros", uid), { foto }).catch(() => {})));
  avisar();
}

// ---------- favoritos en la cuenta ----------
const refFavoritos = () => fb.doc(db, "usuarios", auth.currentUser.uid, "privado", "favoritos");
// devuelve { datos, actualizado } o null si la cuenta todavía no guardó nada
export async function leerFavoritos() {
  await iniciar();
  const d = await fb.getDoc(refFavoritos());
  if (!d.exists()) return null;
  const { datos, actualizado } = d.data();
  try { return { datos: JSON.parse(datos), actualizado }; } catch { return null; }
}
export async function guardarFavoritos(datos, actualizado) {
  await iniciar();
  await fb.setDoc(refFavoritos(), { datos: JSON.stringify(datos), actualizado });
}

// ---------- grupos ----------
const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0 ni I/1, que se confunden
const nuevoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => LETRAS[b % LETRAS.length]).join("");

export async function crearGrupo({ nombre, fichas, aspectos, excluir = [], origen }) {
  await iniciar();
  nombre = String(nombre || "").trim().slice(0, 40);
  if (!nombre) throw new Error("Poné un nombre al grupo.");
  if (!fichas?.length) throw new Error("Elegí al menos un enfoque.");
  const uid = auth.currentUser.uid;
  const ref = fb.doc(fb.collection(db, "grupos"));
  let codigo;
  for (let i = 0; i < 5; i++) {
    codigo = nuevoCodigo();
    try {
      await fb.runTransaction(db, async (t) => {
        if ((await t.get(fb.doc(db, "codigos", codigo))).exists()) throw new Error("repetido");
        t.set(fb.doc(db, "codigos", codigo), { gid: ref.id, creador: uid });
      });
      break;
    } catch (e) { if (e.message !== "repetido" || i === 4) throw e; }
  }
  await fb.setDoc(ref, { nombre, codigo, creador: uid, creado: fb.serverTimestamp(), fichas, aspectos, excluir, origen: origen || "" });
  await unirse(ref.id);
  return ref.id;
}

export async function editarGrupo(gid, cambios) {
  await iniciar();
  const ok = {};
  if (cambios.nombre != null) ok.nombre = String(cambios.nombre).trim().slice(0, 40);
  for (const k of ["fichas", "aspectos", "excluir", "origen"]) if (cambios[k] != null) ok[k] = cambios[k];
  await fb.updateDoc(fb.doc(db, "grupos", gid), ok);
}

export async function grupoPorCodigo(codigo) {
  await iniciar();
  codigo = String(codigo || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const c = await fb.getDoc(fb.doc(db, "codigos", codigo));
  if (!c.exists()) throw new Error("No hay ningún grupo con ese código.");
  return c.data().gid;
}

export async function leerGrupo(gid) {
  await iniciar();
  const g = await fb.getDoc(fb.doc(db, "grupos", gid));
  if (!g.exists()) throw new Error("Ese grupo ya no existe.");
  return { id: gid, ...g.data() };
}

export async function unirse(gid) {
  await iniciar();
  const uid = auth.currentUser.uid;
  const m = fb.doc(db, "grupos", gid, "miembros", uid);
  if (!(await fb.getDoc(m)).exists()) await fb.setDoc(m, { uid, apodo: perfil?.apodo || "Jugador", foto: perfil?.foto || "", puntos: 0, partidas: 0, racha: 0, ultimaFecha: "" });
  await fb.setDoc(fb.doc(db, "usuarios", uid), { grupos: fb.arrayUnion(gid) }, { merge: true });
  perfil = { ...(perfil || {}), grupos: [...new Set([...(perfil?.grupos || []), gid])] };
  avisar();
}

export async function dejarGrupo(gid) {
  await iniciar();
  const uid = auth.currentUser.uid;
  await fb.deleteDoc(fb.doc(db, "grupos", gid, "miembros", uid));
  await fb.updateDoc(fb.doc(db, "usuarios", uid), { grupos: fb.arrayRemove(gid) });
  perfil = { ...perfil, grupos: (perfil?.grupos || []).filter((g) => g !== gid) };
  avisar();
}

export async function misGrupos() {
  await iniciar();
  const ids = perfil?.grupos || [];
  const grupos = await Promise.all(ids.map((g) => leerGrupo(g).catch(() => null)));
  return grupos.filter(Boolean);
}

export async function miembros(gid) {
  await iniciar();
  return (await fb.getDocs(fb.collection(db, "grupos", gid, "miembros"))).docs.map((d) => d.data());
}

// ---------- desafío del día ----------
export const hoy = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ayer = () => { const d = new Date(); d.setDate(d.getDate() - 1); return hoy(d); };
// semana ISO (lunes a domingo): el ranking semanal se reinicia los lunes
export function semana(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dia);
  const inicio = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-S${String(Math.ceil(((t - inicio) / 864e5 + 1) / 7)).padStart(2, "0")}`;
}

export async function configDesafio() {
  await iniciar();
  try { const c = (await fb.getDoc(fb.doc(db, "config", "desafio"))).data() || {}; return { ...DESAFIO, ...c }; } catch { return { ...DESAFIO }; }
}

const refPartida = (gid, fecha = hoy()) => fb.doc(db, "grupos", gid, "partidas", `${fecha}_${auth.currentUser.uid}`);

export async function partidaDeHoy(gid) {
  await iniciar();
  const p = await fb.getDoc(refPartida(gid));
  return p.exists() ? p.data() : null;
}

// se anota al empezar, así abandonar a mitad de camino no permite volver a jugar el mismo día
export async function empezarPartida(gid, vidas) {
  await iniciar();
  const ref = refPartida(gid);
  await fb.runTransaction(db, async (t) => {
    if ((await t.get(ref)).exists()) throw new Error("Ya jugaste el desafío de hoy en este grupo.");
    t.set(ref, { uid: auth.currentUser.uid, apodo: perfil?.apodo || "Jugador", fecha: hoy(), semana: semana(), correctas: 0, respondidas: 0, vidas, sinVidas: false, puntos: 0, bonus: 0, duracionMs: 0, terminada: false, detalle: [] });
  });
}

export async function terminarPartida(gid, { correctas, respondidas, vidas, sinVidas, duracionMs, detalle }) {
  await iniciar();
  const uid = auth.currentUser.uid;
  const mRef = fb.doc(db, "grupos", gid, "miembros", uid);
  return fb.runTransaction(db, async (t) => {
    const m = (await t.get(mRef)).data() || { puntos: 0, partidas: 0, racha: 0, ultimaFecha: "" };
    const racha = m.ultimaFecha === hoy() ? m.racha : m.ultimaFecha === ayer() ? m.racha + 1 : 1;
    const bonus = correctas ? Math.min((racha - 1) * DESAFIO.bonusPorDia, DESAFIO.bonusMax) : 0;
    const puntos = correctas * DESAFIO.puntosPorAcierto + bonus;
    t.update(refPartida(gid), { correctas, respondidas, vidas, sinVidas, duracionMs, puntos, bonus, detalle, terminada: true });
    t.set(mRef, { uid, apodo: perfil?.apodo || "Jugador", foto: perfil?.foto || "", puntos: (m.puntos || 0) + puntos, partidas: (m.partidas || 0) + 1, racha, ultimaFecha: hoy() }, { merge: true });
    return { puntos, bonus, racha };
  });
}

// partidas de una semana (ranking semanal) o de los últimos días (para medir la dificultad)
export async function partidasDeSemana(gid, sem = semana()) {
  await iniciar();
  return (await fb.getDocs(fb.query(fb.collection(db, "grupos", gid, "partidas"), fb.where("semana", "==", sem)))).docs.map((d) => d.data());
}
export async function partidasDesde(gid, fecha) {
  await iniciar();
  return (await fb.getDocs(fb.query(fb.collection(db, "grupos", gid, "partidas"), fb.where("fecha", ">=", fecha)))).docs.map((d) => d.data());
}

export const uid = () => auth?.currentUser?.uid || null;

// ---------- reportes de preguntas ----------
export async function enviarReporte(rep) {
  await iniciar();
  if (!auth.currentUser) throw new Error("Sin cuenta.");
  const t = (x, n) => String(x ?? "").slice(0, n);
  await fb.setDoc(fb.doc(fb.collection(db, "reportes")), {
    uid: auth.currentUser.uid, apodo: t(perfil?.apodo, 24), creado: fb.serverTimestamp(),
    ficha: t(rep.ficha, 80), fichaNombre: t(rep.fichaNombre, 160), campo: t(rep.campo, 40), enunciado: t(rep.enunciado, 600),
    opciones: (rep.opciones || []).slice(0, 6).map((o) => t(o, 600)), correcta: t(rep.correcta, 600), elegida: rep.elegida == null ? "" : t(rep.elegida, 600),
    motivo: t(rep.motivo, 60), comentario: t(rep.comentario, 500),
  });
}
// solo funciona para quien figura en ADMINS de las reglas; a los demás Firestore les responde permission-denied
export async function leerReportes() {
  await iniciar();
  const docs = (await fb.getDocs(fb.collection(db, "reportes"))).docs.map((d) => ({ id: d.id, ...d.data(), creado: d.data().creado?.toMillis?.() || 0 }));
  return docs.sort((a, b) => b.creado - a.creado);
}
export async function borrarReporte(id) { await iniciar(); await fb.deleteDoc(fb.doc(db, "reportes", id)); }
