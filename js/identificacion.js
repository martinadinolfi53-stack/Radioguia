// Identificación al entrar: se pide una sola vez (apodo o Google, con la cuenta de js/nube.js) y queda guardada.
// El nombre también se guarda en este dispositivo, así la app abre directo y funciona sin internet.
import * as nube from "./nube.js";
import { esc } from "./util.js";

const CLAVE = "radioguia.nombre";
const DESTINO = "radioguia.destino";
const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const escribir = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };

let error = "", ocupado = false;

export const nombre = () => leer(CLAVE) || "";
export const identificado = () => !!nombre();

// adónde iba la persona antes de identificarse (por ejemplo, el link de un grupo)
export function recordarDestino(h) { if (h && h !== "#") escribir(DESTINO, h); }

export function iniciarIdentificacion(app, render) {
  // si la sesión ya existe, el apodo de la cuenta manda; si la persona sale de la cuenta, se vuelve a pedir
  nube.alCambiar(() => {
    const { listo, usuario, perfil } = nube.estado();
    if (!listo) return;
    const antes = nombre();
    if (usuario && perfil?.apodo) escribir(CLAVE, perfil.apodo);
    else if (!usuario) escribir(CLAVE, null);
    if (antes !== nombre()) render();
  });
  if (identificado()) nube.iniciar().catch(() => {});

  const entrar = async (fn) => {
    if (ocupado) return;
    ocupado = true; error = ""; render();
    try {
      await fn();
      const { perfil } = nube.estado();
      if (perfil?.apodo) escribir(CLAVE, perfil.apodo);
      const destino = leer(DESTINO) || "#";
      escribir(DESTINO, null);
      ocupado = false;
      if (location.hash === destino || (destino === "#" && !location.hash)) render(); else location.hash = destino;
    } catch (e) {
      ocupado = false; error = mensaje(e); render();
    }
  };

  app.addEventListener("submit", (e) => {
    if (e.target.id !== "id-apodo") return;
    e.preventDefault();
    entrar(() => nube.entrarAnonimo(new FormData(e.target).get("apodo")));
  });
  app.addEventListener("click", (e) => {
    if (e.target.closest("[data-id-google]")) entrar(() => nube.entrarGoogle());
    const c = e.target.closest("[data-copiar-link]");
    if (c) {
      const listo = () => { c.textContent = "Copiado"; setTimeout(() => (c.textContent = "Copiar"), 1800); };
      navigator.clipboard?.writeText(c.dataset.copiarLink).then(listo, () => getSelection().selectAllChildren(c.previousElementSibling)) ?? getSelection().selectAllChildren(c.previousElementSibling);
    }
  });
}

function mensaje(e) {
  const c = e?.code || "";
  if (c.includes("network") || c === "unavailable") return "No hay conexión. La primera vez hace falta internet para identificarte.";
  if (c.includes("popup-closed") || c.includes("cancelled-popup")) return "Se cerró la ventana de Google antes de terminar.";
  if (c.includes("popup-blocked")) return "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes e intentá otra vez.";
  if (c.includes("credential-already-in-use")) return "Esa cuenta de Google ya está usada por otro jugador. Recargá la app y entrá directamente con Google.";
  if (c.includes("unauthorized-domain")) return "Falta autorizar esta página en Firebase.";
  if (/Failed to fetch|import/i.test(e?.message || "")) return "No hay conexión. La primera vez hace falta internet para identificarte.";
  return e?.message || "Algo salió mal.";
}

export function vistaIdentificacion() {
  return `<main class="portada ident">
    <p class="portada-rx">RX</p>
    <p class="portada-ayuda">Para empezar, identificate. Se pide una sola vez en este dispositivo.</p>
    <form id="id-apodo" class="ident-form">
      <label for="id-apodo-in">Tu nombre o apodo</label>
      <div class="ident-fila"><input id="id-apodo-in" name="apodo" maxlength="24" autocomplete="nickname" placeholder="Por ejemplo, Martin" required ${ocupado ? "disabled" : ""}>
      <button class="ident-btn" type="submit" ${ocupado ? "disabled" : ""}>Entrar</button></div>
      <small>Es lo que ven tus compañeros en los juegos.</small>
    </form>
    <p class="ident-o">o</p>
    <button class="ident-google" data-id-google ${ocupado ? "disabled" : ""}>Entrar con Google</button>
    <small class="ident-nota">Con Google no perdés tus grupos, tus puntos ni tus favoritos si cambiás de celular.</small>
    ${ocupado ? `<p class="ident-estado">Entrando…</p>` : ""}
    ${error ? `<p class="ident-error" role="alert">${esc(error)}</p>` : ""}
  </main>`;
}
