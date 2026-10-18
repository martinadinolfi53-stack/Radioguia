// Instalación y funcionamiento sin conexión.
import { preferencias } from "./almacen.js";

let evtInstalar = null;
let listoOffline = false;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

export const pwa = {
  iniciar(alCambiar) {
    addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); evtInstalar = e; alCambiar(); });
    if (!("serviceWorker" in navigator) || !/^https:|^http:\/\/localhost/.test(location.href) || window.RADIOGUIA_VISTA_PREVIA) return;
    navigator.serviceWorker.register("sw.js").then((reg) => {
      navigator.serviceWorker.ready.then(() => { listoOffline = true; alCambiar(); });
      // versión nueva instalada: se activa y se recarga una sola vez
      reg.addEventListener("updatefound", () => {
        const nuevo = reg.installing;
        nuevo?.addEventListener("statechange", () => { if (nuevo.state === "installed" && navigator.serviceWorker.controller) nuevo.postMessage("activar"); });
      });
    }).catch(() => {});
    let recargado = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (!recargado) { recargado = true; location.reload(); } });
  },
  aviso() {
    if (standalone() || !preferencias.get("avisoInstalar") || window.RADIOGUIA_VISTA_PREVIA) return "";
    const como = evtInstalar ? "Instalala para abrirla como una app y usarla sin internet."
      : ios ? "En Safari tocá Compartir y después “Agregar a inicio”."
      : "En el menú del navegador tocá “Instalar app” o “Agregar a pantalla de inicio”.";
    return `<div class="aviso-inst"><b>Tenela en tu pantalla de inicio</b><span>${como}</span>
      <div class="acc">${evtInstalar ? `<button class="pri" data-instalar>Instalar</button>` : ""}<button data-cerrar-aviso>Ahora no</button></div></div>`;
  },
  async instalar() { if (!evtInstalar) return; evtInstalar.prompt(); await evtInstalar.userChoice.catch(() => {}); evtInstalar = null; },
  estadoOffline() {
    if (window.RADIOGUIA_VISTA_PREVIA) return "Esta es una vista previa: el modo sin conexión funciona en la versión instalada.";
    return listoOffline ? "Listo: todas las fichas quedaron guardadas en este dispositivo y funcionan sin internet."
      : "Preparando el modo sin conexión. Abrí la app una vez con internet para descargar el contenido.";
  },
};
