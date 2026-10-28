// Favoritos en la cuenta de Google: el guardado de js/almacen.js se copia tal cual en usuarios/{uid}/privado/favoritos.
// - La primera vez que una cuenta entra en este dispositivo, se juntan las listas de acá con las de la nube (no se pierde nada).
// - Después, cada cambio se sube a los pocos segundos; sin internet queda pendiente y se sube cuando vuelve.
// - Al abrir la app o volver a ella, si la nube cambió desde otro dispositivo, se trae lo de la nube.
// - Al cerrar sesión se borran los favoritos de este dispositivo; los de una cuenta de Google siguen en la nube.
// Sin cuenta o solo con apodo, los favoritos viven solo en este dispositivo y se pierden al cerrar sesión.
import * as nube from "./nube.js";
import { favoritosGuardados as fav } from "./almacen.js";

// qué cuenta y qué versión de la nube tiene este dispositivo, y si quedó algo sin subir: { uid, version, pendiente }
const K = "radioguia.favoritos-nube";
const leerMarca = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch { return {}; } };
const marcar = (m) => { try { localStorage.setItem(K, JSON.stringify(m)); } catch {} };

let alTraer = () => {}, espera = null, enCurso = null, cambios = 0, ultimaCuenta;
const cuenta = () => { const { usuario, conGoogle } = nube.estado(); return conGoogle ? usuario.uid : null; };

// junta dos guardados: las listas de los dos (por id) y, en las que están en ambos, todos los favoritos sin repetir
function unir(aca, alla) {
  const listas = aca.listas.map((l) => ({ ...l, ids: [...l.ids] }));
  for (const l of alla?.listas || []) {
    const igual = listas.find((x) => x.id === l.id);
    if (igual) igual.ids = [...new Set([...igual.ids, ...(l.ids || [])])];
    else listas.push({ ...l, ids: [...(l.ids || [])] });
  }
  return { ...aca, listas };
}

async function subir() {
  clearTimeout(espera); espera = null;
  const uid = cuenta(), m = leerMarca();
  // hasta que no se juntó con la nube, subir pisaría los favoritos guardados desde otro dispositivo
  if (!uid || m.uid !== uid) return;
  const desde = cambios, version = Date.now();
  await nube.guardarFavoritos(fav.leer(), version);
  if (cuenta() === uid) marcar({ uid, version, pendiente: cambios !== desde });
}

function sincronizar() {
  const uid = cuenta();
  if (!uid) return Promise.resolve();
  enCurso ||= (async () => {
    const m = leerMarca(), remoto = await nube.leerFavoritos();
    if (cuenta() !== uid) return;
    const cambio = remoto && remoto.actualizado !== m.version;
    if (m.uid && m.uid !== uid) {
      // quedaron los favoritos de otra cuenta que no cerró sesión: se cambian por los de esta
      fav.reemplazar(remoto?.datos || { v: 1, listas: [] }); alTraer();
      marcar({ uid, version: remoto?.actualizado ?? 0, pendiente: false });
    } else if (m.uid !== uid || m.pendiente) {
      // primera vez de esta cuenta acá, o cambios sin subir: se juntan las dos versiones y se sube el resultado
      if (cambio) { fav.reemplazar(unir(fav.leer(), remoto.datos)); alTraer(); }
      marcar({ uid, version: remoto?.actualizado ?? 0, pendiente: true });
      await subir();
    } else if (cambio) {
      fav.reemplazar(remoto.datos); alTraer();
      marcar({ uid, version: remoto.actualizado, pendiente: false });
    }
  })().catch(() => {}).finally(() => { enCurso = null; });
  return enCurso;
}

export function iniciarSyncFavoritos(redibujar) {
  alTraer = redibujar;
  fav.alCambiar(() => {
    const uid = cuenta(), m = leerMarca();
    if (!uid || m.uid !== uid) return;
    cambios++;
    if (!m.pendiente) marcar({ ...m, pendiente: true });
    clearTimeout(espera); espera = setTimeout(() => subir().catch(() => {}), 1500);
  });
  // al entrar o cambiar de cuenta, al volver a la app y al recuperar internet
  nube.alCambiar(() => { if (cuenta() !== ultimaCuenta) { ultimaCuenta = cuenta(); sincronizar(); } });
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && sincronizar());
  addEventListener("online", () => sincronizar());
}

// sube lo pendiente (si hay cuenta de Google), cierra la sesión y borra los favoritos de este dispositivo
export async function cerrarSesion() {
  if (cuenta() && leerMarca().pendiente) await Promise.race([subir().catch(() => {}), new Promise((ok) => setTimeout(ok, 4000))]);
  try { if (nube.estado().usuario) await nube.salir(); } catch {}
  fav.borrar();
  try { localStorage.removeItem(K); } catch {}
  ultimaCuenta = null;
}
