// Foto de perfil: obligatoria para jugar (con apodo o con Google). Se elige o se saca con la cámara,
// se recorta cuadrada en el teléfono y se guarda chiquita (JPEG de 160 px) en la cuenta, ver nube.guardarFoto.
// Una copia grande (720 px) va aparte en la cuenta (privado/foto) y en este dispositivo, para la portada, donde ocupa todo el ancho.
// Uso: vistaFoto({ titulo, sub, atras, listo }) dibuja la pantalla; listo() se llama cuando la foto quedó guardada.
import { esc, cabecera, icono, RX_BORDE, AYUDA_ICONO } from "./util.js";
import { nombre } from "./identificacion.js";
import * as nube from "./nube.js";

const LADO = 160, GRANDE = 720;
const K_GRANDE = "radioguia.foto.grande"; // { uid, chica, dato, nube }: copia grande de la foto "chica" de esa cuenta; con otra cuenta u otra foto no se usa.
// nube: ya está también en la cuenta
const MAX_NUBE = 280000; // las reglas aceptan hasta 300000 caracteres en privado/
let pedida = "", subida = ""; // una sola bajada y una sola subida por sesión para cada foto
let elegida = null; // { url, img, ancho, alto, pos, dato } de la foto que se está por usar
let error = "", guardando = false, opciones = {};

export const avatar = (foto, apodo = "", clase = "") => foto
  ? `<img class="ft-av ${clase}" src="${esc(foto)}" alt="">`
  : `<span class="ft-av ${clase}" aria-hidden="true">${esc((apodo.trim()[0] || "?").toUpperCase())}</span>`;

export function vistaFoto(op = {}) {
  opciones = op;
  const actual = nube.estado().perfil?.foto;
  const muestra = elegida?.dato || actual;
  const vertical = elegida && elegida.alto !== elegida.ancho;
  return cabecera({ titulo: op.titulo || "Tu foto", sub: op.sub, atras: op.atras }) + `
  <main class="wrap juegos ft">
    <section class="panel ft-panel">
      <div class="ft-marco">${muestra ? `<img src="${esc(muestra)}" alt="Tu foto">` : `<span>Sin foto</span>`}</div>
      <p class="jg-nota">${actual && !elegida ? "Así te ven tus compañeros en los grupos y el ranking." : "Tus compañeros te van a ver con esta foto en los grupos y el ranking. Elegí una de la galería o sacate una."}</p>
      ${elegida ? vistaPrevia() : ""}
      ${elegida && vertical ? `<label class="ft-mover">Mover <input type="range" id="ft-pos" min="0" max="100" value="${Math.round(elegida.pos * 100)}"></label>` : ""}
      <label class="btn ft-elegir">${muestra ? "Elegir otra foto" : "Elegir o sacar una foto"}<input type="file" id="ft-archivo" accept="image/*" hidden></label>
      ${elegida ? `<button class="rp-empezar" data-ft="usar" ${guardando ? "disabled" : ""}>${guardando ? "Guardando…" : "Usar esta foto"}</button>` : ""}
      ${error ? `<p class="jg-error">${esc(error)}</p>` : ""}
    </section>
  </main>`;
}

async function abrir(archivo) {
  const url = URL.createObjectURL(archivo);
  const img = new Image();
  img.src = url;
  try { await img.decode(); } catch { URL.revokeObjectURL(url); throw new Error("No se pudo abrir esa imagen. Probá con otra."); }
  if (elegida) URL.revokeObjectURL(elegida.url);
  const ancho = img.naturalWidth, alto = img.naturalHeight;
  // en una foto vertical la cara suele estar arriba del centro
  elegida = { url, img, ancho, alto, pos: alto > ancho ? 0.3 : 0.5 };
  recortar();
}

// recorte cuadrado de la foto elegida, de "px" de lado
function cuadrada(px, calidad) {
  const { img, ancho, alto, pos } = elegida, lado = Math.min(ancho, alto), n = Math.min(px, lado);
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, n, n);
  ctx.drawImage(img, (ancho - lado) * (ancho > alto ? pos : 0.5), (alto - lado) * (alto > ancho ? pos : 0.5), lado, lado, 0, 0, n, n);
  return c.toDataURL("image/jpeg", calidad);
}
function recortar() { elegida.dato = cuadrada(LADO, 0.82); elegida.vista = cuadrada(480, 0.75); }

// cómo va a quedar la portada con esta foto: la misma composición, achicada (RX y los botones van arriba de la foto)
function vistaPrevia() {
  const apodo = nube.estado().perfil?.apodo || nombre() || "";
  return `<figure class="ft-vista" aria-label="Así se va a ver tu portada"><div class="fv-in">
      <img class="fv-foto" src="${esc(elegida.vista)}" alt="">
      <div class="fv-barra"><span class="fv-boton">${AYUDA_ICONO}</span><span class="fv-rx">${RX_BORDE.replace(/rx-borde/g, "rx-borde-vista")}</span><span class="fv-boton">${icono.ajustes}</span></div>
      <p class="fv-hola">Hola ${esc(apodo)}, ¿qué quieres hacer hoy?</p>
      <div class="fv-ops"><img src="iconos/icono-512.png" alt=""><img src="iconos/juegos-512.jpg" alt=""></div>
    </div></figure>
    <p class="jg-nota">Así se va a ver tu portada.</p>`;
}
// la grande, achicando la calidad (y si hace falta el tamaño) hasta que entre en la cuenta
function grande() {
  for (const [px, q] of [[GRANDE, 0.8], [GRANDE, 0.7], [GRANDE, 0.6], [600, 0.6], [480, 0.6]]) {
    const d = cuadrada(px, q);
    if (d.length <= MAX_NUBE) return d;
  }
  return "";
}
const guardarLocal = (g) => { try { localStorage.setItem(K_GRANDE, JSON.stringify(g)); } catch {} };

// foto de la portada: la copia grande de este dispositivo o, si no hay (la foto se eligió en otro lado), la de la cuenta.
// La portada se dibuja apenas abre la app (también al cambiar de libro, que recarga), antes de que llegue la cuenta:
// mientras tanto se muestra la última foto guardada acá, así no aparece de golpe unos instantes después.
export function fotoGrande() {
  const { listo, usuario, perfil } = nube.estado();
  let g = null;
  try { g = JSON.parse(localStorage.getItem(K_GRANDE)); } catch {}
  if (!listo) return g?.dato || "";
  if (!perfil?.foto) return "";
  const chica = perfil.foto, uid = usuario?.uid;
  // la copia vale si es de esta cuenta y de la foto que tiene ahora (si la cambió en otro celular, ya no);
  // las copias de antes no anotaban la foto chica: se toman como de la foto actual y se completan
  if (g?.uid === uid && g.dato && g.dato !== chica && (g.chica ?? chica) === chica) {
    if (!g.chica) guardarLocal(g = { ...g, chica });
    // las que se eligieron antes de que existiera la copia en la cuenta se suben una vez
    if (!g.nube && subida !== chica) {
      subida = chica;
      nube.guardarFotoGrande(chica, g.dato).then(() => guardarLocal({ ...g, nube: true })).catch(() => { subida = ""; });
    }
    return g.dato;
  }
  // acá no hay copia grande: mientras se busca la de la cuenta, se muestra la chica
  if (pedida !== chica) {
    pedida = chica;
    nube.leerFotoGrande(chica).then((dato) => {
      if (!dato || nube.estado().perfil?.foto !== chica) return;
      guardarLocal({ uid, chica, dato, nube: true });
      const img = document.querySelector(".portada-hero img");
      if (img) img.src = dato;
    }).catch(() => { pedida = ""; });
  }
  return chica;
}

export function iniciarFoto(app, rerender) {
  app.addEventListener("change", async (e) => {
    if (e.target.id !== "ft-archivo" || !e.target.files?.[0]) return;
    error = "";
    try { await abrir(e.target.files[0]); } catch (er) { error = er.message; }
    rerender();
  });
  app.addEventListener("input", (e) => {
    if (e.target.id !== "ft-pos" || !elegida) return;
    elegida.pos = e.target.value / 100;
    recortar();
    const img = app.querySelector(".ft-marco img");
    if (img) img.src = elegida.dato;
    const vista = app.querySelector(".fv-foto");
    if (vista) vista.src = elegida.vista;
  });
  app.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-ft=usar]") || !elegida || guardando) return;
    guardando = true; error = ""; rerender();
    try {
      await nube.guardarFoto(elegida.dato);
      const chica = elegida.dato, dato = grande(), uid = nube.estado().usuario?.uid;
      if (dato) {
        guardarLocal({ uid, chica, dato });
        // la copia en la cuenta no frena: si falla (sin conexión), se sube sola la próxima vez que se abra la portada
        subida = chica;
        nube.guardarFotoGrande(chica, dato).then(() => guardarLocal({ uid, chica, dato, nube: true })).catch(() => { subida = ""; });
      }
      URL.revokeObjectURL(elegida.url);
      elegida = null;
      opciones.listo?.();
    } catch (er) { error = er?.code?.includes("network") || er?.code === "unavailable" ? "No hay conexión. Probá de nuevo cuando tengas internet." : er.message || "No se pudo guardar la foto."; }
    guardando = false;
    rerender();
  });
}
