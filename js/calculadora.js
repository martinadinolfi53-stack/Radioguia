// Calculadora de técnica (kVp y mAs según espesor). La lógica de cálculo vive en config/calculadora.js;
// esta vista solo la usa. Sin fórmulas configuradas muestra "Pendiente de configuración" y no calcula.
import CONFIG from "../config/calculadora.js";
import { proyeccionPorId, regionPorId } from "./datos.js";
import { esc, icono, cabecera } from "./util.js";

export const calcEstado = { espesor: "" };

function formulasPara(p) {
  const propia = p && CONFIG.porProyeccion?.[p.id];
  return { kvp: propia?.kvp || CONFIG.kvp, mas: propia?.mas || CONFIG.mas };
}

export function calcular(espesorTxt, p) {
  if (!CONFIG.configurada) return { pendiente: true };
  const f = formulasPara(p);
  if (typeof f.kvp !== "function" || typeof f.mas !== "function") return { pendiente: true };
  const e = Number(String(espesorTxt).replace(",", "."));
  if (!espesorTxt || !Number.isFinite(e) || e <= 0) return { error: "Ingresá el espesor en centímetros." };
  if (CONFIG.espesor && (e < CONFIG.espesor.min || e > CONFIG.espesor.max)) return { error: `El espesor tiene que estar entre ${CONFIG.espesor.min} y ${CONFIG.espesor.max} cm.` };
  const aviso = CONFIG.validar?.(e, p) || null;
  return { kvp: f.kvp(e, p), mas: f.mas(e, p), aviso };
}

const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString("es-AR", { maximumFractionDigits: 1 }) : "—");

export function resultadoHTML(res) {
  if (res.pendiente) return `<div class="calc-res pend"><div><span>kVp</span><b>—</b></div><div><span>mAs</span><b>—</b></div><p>Pendiente de configuración: todavía no se cargaron las fórmulas.</p></div>`;
  if (res.error) return `<div class="calc-res"><div><span>kVp</span><b>—</b></div><div><span>mAs</span><b>—</b></div><p>${esc(res.error)}</p></div>`;
  return `<div class="calc-res ok"><div><span>kVp</span><b>${fmt(res.kvp)}</b></div><div><span>mAs</span><b>${fmt(res.mas)}</b></div>${res.aviso ? `<p class="aviso">${esc(res.aviso)}</p>` : ""}</div>`;
}

export function vistaCalculadora(idProyeccion, volver) {
  const p = idProyeccion ? proyeccionPorId[idProyeccion] : null;
  return cabecera({ titulo: "Calculadora de técnica", sub: p ? `${p.nombre} · ${regionPorId[p.region]?.nombre}` : "Sin proyección seleccionada", atras: volver }) + `
  <main class="wrap calc">
    ${!CONFIG.configurada ? `<div class="estado-pend">${icono.calc}<div><b>Pendiente de configuración</b><p>La calculadora está lista para recibir las fórmulas de kVp y mAs. Hasta entonces no muestra resultados.</p></div></div>` : ""}
    <section class="panel">
      <h2>Proyección</h2>
      <p>${p ? `<b>${esc(p.nombre)}</b> · ${esc(regionPorId[p.region]?.nombre)}` : "Abrila desde una ficha para calcular con la proyección elegida."}</p>
    </section>
    <section class="panel">
      <label for="espesor"><h2>Espesor del paciente</h2></label>
      <div class="campo"><input id="espesor" type="text" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(calcEstado.espesor)}" ${CONFIG.configurada ? "" : "disabled"} aria-describedby="medicion"><span>cm</span></div>
      <div id="medicion" class="medicion">
        ${CONFIG.ilustracionMedicion ? `<img src="${esc(CONFIG.ilustracionMedicion)}" alt="Cómo medir el espesor">` : `<div class="ilus pendiente mini">${icono.imagen}<span>Ilustración de la medición pendiente</span></div>`}
        <p>${CONFIG.medicion ? esc(CONFIG.medicion) : "Las reglas para medir el espesor están pendientes de configuración."}</p>
      </div>
    </section>
    <section class="panel" aria-live="polite"><h2>Resultado</h2><div id="calc-res">${resultadoHTML(calcular(calcEstado.espesor, p))}</div></section>
    ${CONFIG.advertencia ? `<p class="pie">${esc(CONFIG.advertencia)}</p>` : ""}
  </main>`;
}
