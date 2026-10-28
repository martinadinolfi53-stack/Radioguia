// Pruebas de herramientas/firestore.rules contra el emulador local de Firestore (nunca toca el proyecto real).
// Correr antes de publicar cualquier cambio en las reglas. Desde una carpeta aparte, fuera del repo:
//   npm i firebase-tools @firebase/rules-unit-testing firebase@12.19.0
//   cp <repo>/herramientas/probar-reglas.mjs <repo>/herramientas/firestore.rules <repo>/herramientas/firebase.json .
//   npx firebase emulators:exec --only firestore --project demo-radioguia "node probar-reglas.mjs"
// Cada prueba dice lo que tiene que pasar (PERMITIDO o BLOQUEADO). Si alguna da distinto, termina con error.
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, runTransaction, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";

const env = await initializeTestEnvironment({ projectId: "demo-radioguia", firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 } });
const FOTO = "data:image/jpeg;base64,AAAA";
const fecha = (d) => d.toISOString().slice(0, 10);
const HOY = fecha(new Date());
const hace = (seg) => Timestamp.fromMillis(Date.now() - seg * 1000);
const miembro = (uid, extra = {}) => ({ uid, apodo: uid, foto: FOTO, puntos: 0, partidas: 0, racha: 0, ultimaFecha: "", ...extra });
const partida = (uid, f, extra = {}) => ({ uid, apodo: uid, fecha: f, semana: "S", correctas: 0, respondidas: 0, vidas: 5, sinVidas: false, puntos: 0, bonus: 0, duracionMs: 0, terminada: false, detalle: [], creado: serverTimestamp(), ...extra });

// grupo g1 de Ana (código ABC234), con Beto adentro; Ana y Beto empezaron su partida de hoy hace 5 minutos
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore();
  await setDoc(doc(db, "usuarios/ana"), { apodo: "Ana", foto: FOTO, grupos: ["g1"] });
  await setDoc(doc(db, "codigos/ABC234"), { gid: "g1", creador: "ana", nombre: "Comisión B", enfoques: 1 });
  await setDoc(doc(db, "grupos/g1"), { nombre: "Comisión B", codigo: "ABC234", creador: "ana", fichas: ["x"], aspectos: [], excluir: [], origen: "" });
  await setDoc(doc(db, "grupos/g1/miembros/ana"), miembro("ana", { puntos: 30, partidas: 1, racha: 1, ultimaFecha: "2026-01-01" }));
  await setDoc(doc(db, "grupos/g1/miembros/beto"), miembro("beto"));
  await setDoc(doc(db, `grupos/g1/partidas/${HOY}_ana`), partida("ana", HOY, { creado: hace(300) }));
  await setDoc(doc(db, `grupos/g1/partidas/${HOY}_beto`), partida("beto", HOY, { creado: hace(300) }));
  await setDoc(doc(db, "reportes/r1"), { uid: "ana", enunciado: "x", motivo: "y" });
});
const como = (uid) => env.authenticatedContext(uid).firestore();
const ana = como("ana"), beto = como("beto"), intruso = como("intruso"), carla = como("carla");
const nadie = env.unauthenticatedContext().firestore();

let fallas = 0;
async function prueba(id, desc, esperado, fn) {
  let ok = true;
  try { await (esperado === "PERMITIDO" ? assertSucceeds(fn()) : assertFails(fn())); } catch { ok = false; }
  if (!ok) fallas++;
  console.log(`${ok ? "ok  " : "MAL "} ${id}\t${esperado.padEnd(9)}\t${desc}`);
}
const cerrar = (db, uid, f, correctas, respondidas, puntos, m) => {
  const b = writeBatch(db);
  b.update(doc(db, `grupos/g1/partidas/${f}_${uid}`), { correctas, respondidas, vidas: 5, sinVidas: false, duracionMs: 1, puntos, bonus: 0, detalle: [], terminada: true });
  b.update(doc(db, `grupos/g1/miembros/${uid}`), { puntos: m.puntos + puntos, partidas: m.partidas + 1, racha: 1, ultimaFecha: f });
  return b.commit();
};

// --- privacidad ---
await prueba("P1", "Sin sesión: leer un perfil", "BLOQUEADO", () => getDoc(doc(nadie, "usuarios/ana")));
await prueba("P2", "Otra cuenta: listar todos los perfiles", "BLOQUEADO", () => getDocs(collection(intruso, "usuarios")));
await prueba("P2b", "Otra cuenta: leer el perfil de Ana", "BLOQUEADO", () => getDoc(doc(intruso, "usuarios/ana")));
await prueba("P2c", "Ana lee su propio perfil", "PERMITIDO", () => getDoc(doc(ana, "usuarios/ana")));
await prueba("P3", "Listar todos los códigos de grupo", "BLOQUEADO", () => getDocs(collection(intruso, "codigos")));
await prueba("P3b", "Consultar un código exacto (invitación)", "PERMITIDO", () => getDoc(doc(intruso, "codigos/ABC234")));
await prueba("P4", "No miembro: leer el grupo con su id", "BLOQUEADO", () => getDoc(doc(intruso, "grupos/g1")));
await prueba("P5", "Listar todos los grupos", "BLOQUEADO", () => getDocs(collection(intruso, "grupos")));
await prueba("P6", "No miembro: leer el ranking", "BLOQUEADO", () => getDocs(collection(intruso, "grupos/g1/miembros")));
await prueba("P7", "Unirse a un grupo sin el código", "BLOQUEADO", () => setDoc(doc(intruso, "grupos/g1/miembros/intruso"), miembro("intruso")));
await prueba("P7b", "Unirse con un código equivocado", "BLOQUEADO", () => setDoc(doc(intruso, "grupos/g1/miembros/intruso"), miembro("intruso", { codigo: "ZZZ999" })));
await prueba("P8", "Unirse con el código correcto", "PERMITIDO", () => setDoc(doc(intruso, "grupos/g1/miembros/intruso"), miembro("intruso", { codigo: "ABC234" })));
await prueba("P8b", "Ya unido: leer el grupo y el ranking", "PERMITIDO", async () => { await getDoc(doc(intruso, "grupos/g1")); await getDocs(collection(intruso, "grupos/g1/miembros")); });
await prueba("P9", "Usuario común: leer reportes", "BLOQUEADO", () => getDocs(collection(beto, "reportes")));

// --- integridad entre cuentas ---
await prueba("I1", "Modificar el perfil de otra persona", "BLOQUEADO", () => setDoc(doc(beto, "usuarios/ana"), { apodo: "Hackeada" }, { merge: true }));
await prueba("I2", "Modificar los puntos de otra persona", "BLOQUEADO", () => updateDoc(doc(beto, "grupos/g1/miembros/ana"), { puntos: 0 }));
await prueba("I3", "Borrar el perfil de otra persona", "BLOQUEADO", () => deleteDoc(doc(beto, "usuarios/ana")));
await prueba("I4", "Editar un grupo ajeno", "BLOQUEADO", () => updateDoc(doc(beto, "grupos/g1"), { nombre: "Mío" }));
await prueba("I4b", "Cambiarle el creador o el código al grupo propio", "BLOQUEADO", () => updateDoc(doc(ana, "grupos/g1"), { creador: "beto" }));
await prueba("I5", "Echar a otro miembro sin ser creador", "BLOQUEADO", () => deleteDoc(doc(beto, "grupos/g1/miembros/ana")));
await prueba("I6", "Crear una partida a nombre de otra persona", "BLOQUEADO", () => setDoc(doc(beto, `grupos/g1/partidas/${HOY}_carla`), partida("carla", HOY)));
await prueba("I7", "Escribir la configuración del desafío", "BLOQUEADO", () => setDoc(doc(beto, "config/desafio"), { vidas: 99 }));
await prueba("I8", "Darse puntos sin partida", "BLOQUEADO", () => updateDoc(doc(beto, "grupos/g1/miembros/beto"), { puntos: 1000, partidas: 1 }));
await prueba("I9", "Guardar campos extra en el propio perfil", "BLOQUEADO", () => setDoc(doc(beto, "usuarios/beto"), { admin: true }, { merge: true }));
await prueba("I10", "Crear un código que apunte a un grupo ajeno", "BLOQUEADO", () => setDoc(doc(beto, "codigos/ZZZ999"), { gid: "g1", creador: "beto", nombre: "x", enfoques: 1 }));
await prueba("I11", "Unirse con un apodo de 5000 letras", "BLOQUEADO", () => setDoc(doc(carla, "grupos/g1/miembros/carla"), miembro("carla", { apodo: "A".repeat(5000), codigo: "ABC234" })));
await prueba("I12", "Unirse con puntos o racha de entrada", "BLOQUEADO", () => setDoc(doc(carla, "grupos/g1/miembros/carla"), miembro("carla", { racha: 50, codigo: "ABC234" })));
await prueba("I13", "Cambiarse la racha sin jugar", "BLOQUEADO", () => updateDoc(doc(beto, "grupos/g1/miembros/beto"), { racha: 99 }));
await prueba("I14", "Sacarle el apodo a una partida ajena", "BLOQUEADO", () => updateDoc(doc(beto, `grupos/g1/partidas/${HOY}_ana`), { apodo: "Cuenta borrada" }));

// --- puntuación ---
await prueba("S1", "Cerrar la partida con 50 aciertos (más que las preguntas del desafío)", "BLOQUEADO", () => cerrar(beto, "beto", HOY, 50, 50, 510, { puntos: 0, partidas: 0 }));
await prueba("S1b", "Cerrar con más aciertos que respuestas", "BLOQUEADO", () => cerrar(beto, "beto", HOY, 10, 5, 110, { puntos: 0, partidas: 0 }));
await prueba("S2", "Crear una partida de 2030", "BLOQUEADO", () => setDoc(doc(beto, "grupos/g1/partidas/2030-01-01_beto"), partida("beto", "2030-01-01")));
await prueba("S2b", "Crear una partida de 1999", "BLOQUEADO", () => setDoc(doc(beto, "grupos/g1/partidas/1999-12-31_beto"), partida("beto", "1999-12-31")));
await prueba("S3", "Crear una partida con la hora de creación inventada", "BLOQUEADO", () => setDoc(doc(carla, `grupos/g1/partidas/${HOY}_carla`), partida("carla", HOY, { creado: hace(3600) })));
await prueba("S4", "Ana empieza la partida de mañana y la cierra al instante con 15 de 15", "BLOQUEADO", async () => {
  const man = fecha(new Date(Date.now() + 864e5));
  await setDoc(doc(ana, `grupos/g1/partidas/${man}_ana`), partida("ana", man));
  await cerrar(ana, "ana", man, 15, 15, 160, { puntos: 30, partidas: 1 });
});

// --- lo que hace la app normalmente tiene que seguir funcionando ---
await prueba("OK1", "Beto cierra su partida de hoy: 12 de 15 (120 puntos)", "PERMITIDO", () => cerrar(beto, "beto", HOY, 12, 15, 120, { puntos: 0, partidas: 0 }));
await prueba("OK1b", "Volver a cerrar la misma partida", "BLOQUEADO", () => cerrar(beto, "beto", HOY, 15, 15, 160, { puntos: 120, partidas: 1 }));
await prueba("OK2", "Carla crea un grupo con su código (como la app)", "PERMITIDO", () => runTransaction(carla, async (t) => {
  const c = doc(carla, "codigos/QWE789");
  if ((await t.get(c)).exists()) throw new Error("repetido");
  t.set(c, { gid: "g2", creador: "carla", nombre: "Mi grupo", enfoques: 2 });
  t.set(doc(carla, "grupos/g2"), { nombre: "Mi grupo", codigo: "QWE789", creador: "carla", creado: serverTimestamp(), fichas: ["a", "b"], aspectos: [], excluir: [], origen: "" });
}));
await prueba("OK3", "Carla se une a su grupo y guarda su perfil", "PERMITIDO", async () => {
  await setDoc(doc(carla, "grupos/g2/miembros/carla"), miembro("carla", { codigo: "QWE789" }));
  await setDoc(doc(carla, "usuarios/carla"), { apodo: "Carla", foto: FOTO, grupos: ["g2"] }, { merge: true });
});
await prueba("OK4", "Carla edita el grupo y su invitación", "PERMITIDO", async () => {
  await updateDoc(doc(carla, "grupos/g2"), { nombre: "Técnicas 1", fichas: ["a"] });
  await updateDoc(doc(carla, "codigos/QWE789"), { nombre: "Técnicas 1", enfoques: 1 });
});
await prueba("OK5", "Carla empieza la partida de hoy", "PERMITIDO", () => setDoc(doc(carla, `grupos/g2/partidas/${HOY}_carla`), partida("carla", HOY)));
await prueba("OK5b", "Carla la cierra enseguida con 15 respuestas (menos de 2 s por respuesta)", "BLOQUEADO", () => {
  const b = writeBatch(carla);
  b.update(doc(carla, `grupos/g2/partidas/${HOY}_carla`), { correctas: 15, respondidas: 15, puntos: 150, terminada: true });
  b.update(doc(carla, "grupos/g2/miembros/carla"), { puntos: 150, partidas: 1, racha: 1, ultimaFecha: HOY });
  return b.commit();
});
await prueba("OK6", "Cambiar apodo y foto en el grupo", "PERMITIDO", () => updateDoc(doc(beto, "grupos/g1/miembros/beto"), { apodo: "Betito", foto: FOTO }));
await prueba("OK7", "La creadora echa a un miembro", "PERMITIDO", () => deleteDoc(doc(ana, "grupos/g1/miembros/intruso")));
await prueba("OK8", "Borrar mi cuenta: anonimizar mis partidas, dejar el grupo y borrar el perfil", "PERMITIDO", async () => {
  const mias = await getDocs(query(collection(beto, "grupos/g1/partidas"), where("uid", "==", "beto")));
  for (const d of mias.docs) await updateDoc(d.ref, { apodo: "Cuenta borrada" });
  await deleteDoc(doc(beto, "grupos/g1/miembros/beto"));
  await setDoc(doc(beto, "usuarios/beto"), { apodo: "Beto" });
  await deleteDoc(doc(beto, "usuarios/beto"));
});
await prueba("OK9", "Reportar una pregunta", "PERMITIDO", () => setDoc(doc(collection(carla, "reportes")), { uid: "carla", enunciado: "¿?", motivo: "Error", comentario: "", opciones: ["a"] }));

await env.cleanup();
console.log(fallas ? `\n${fallas} prueba(s) no dieron lo esperado.` : "\nTodas las pruebas dieron lo esperado.");
process.exit(fallas ? 1 : 0);
