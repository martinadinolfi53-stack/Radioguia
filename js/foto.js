// Foto de perfil: obligatoria para jugar (con apodo o con Google). Se elige o se saca con la cámara,
// se recorta cuadrada en el teléfono y se guarda chiquita (JPEG de 160 px) en la cuenta, ver nube.guardarFoto.
// Uso: vistaFoto({ titulo, sub, atras, listo }) dibuja la pantalla; listo() se llama cuando la foto quedó guardada.
import { esc, cabecera } from "./util.js";
import * as nube from "./nube.js";

const LADO = 160;
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

function recortar() {
  const { img, ancho, alto, pos } = elegida, lado = Math.min(ancho, alto);
  const c = document.createElement("canvas");
  c.width = c.height = LADO;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, LADO, LADO);
  ctx.drawImage(img, (ancho - lado) * (ancho > alto ? pos : 0.5), (alto - lado) * (alto > ancho ? pos : 0.5), lado, lado, 0, 0, LADO, LADO);
  elegida.dato = c.toDataURL("image/jpeg", 0.82);
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
  });
  app.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-ft=usar]") || !elegida || guardando) return;
    guardando = true; error = ""; rerender();
    try {
      await nube.guardarFoto(elegida.dato);
      URL.revokeObjectURL(elegida.url);
      elegida = null;
      opciones.listo?.();
    } catch (er) { error = er?.code?.includes("network") || er?.code === "unavailable" ? "No hay conexión. Probá de nuevo cuando tengas internet." : er.message || "No se pudo guardar la foto."; }
    guardando = false;
    rerender();
  });
}
