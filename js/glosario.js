// Glosario interactivo: marca los términos en el texto de las fichas y muestra la explicación en una hoja inferior.
import { GLOSARIO, terminoPorId, norm } from "./datos.js";
import { esc, abrirHoja } from "./util.js";

// una sola expresión con todas las formas, de la más larga a la más corta, para que "decúbito supino" gane a "decúbito"
const formas = GLOSARIO.flatMap((t) => t.formas.map((f) => ({ id: t.id, f: norm(f), sigla: /^[A-ZÁÉÍÓÚÑ]{2,}$/.test(f) ? f : null }))).sort((a, b) => b.f.length - a.f.length);
const porForma = Object.fromEntries(formas.map((x) => [x.f, x.id]));
// las siglas (RI, CAE, MAE...) solo cuentan escritas en mayúsculas, así "cae" o "si" no se marcan
const siglas = Object.fromEntries(formas.filter((x) => x.sigla).map((x) => [x.f, x.sigla]));
const valida = (forma, original) => !siglas[forma] || norm(original).toUpperCase() === norm(siglas[forma]).toUpperCase() && original === original.toUpperCase();
const patron = new RegExp(`(?<![\\p{L}\\p{N}])(${formas.map((x) => x.f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\p{N}])`, "gu");

// Marca el texto ya escapado. "vistos" evita marcar el mismo término muchas veces en una sección.
export function marcar(texto, vistos) {
  const plano = esc(texto);
  if (!formas.length) return plano;
  // se busca sobre la versión sin tildes, que mide lo mismo que el original salvo por los diacríticos combinados
  const base = texto.normalize("NFC");
  const sinTildes = norm(base);
  if (sinTildes.length !== base.length) return plano;
  let out = "", ultimo = 0;
  for (const m of sinTildes.matchAll(patron)) {
    const id = porForma[m[1]];
    if (!id || vistos.has(id) || !valida(m[1], base.slice(m.index, m.index + m[1].length))) continue;
    vistos.add(id);
    out += esc(base.slice(ultimo, m.index)) + `<button class="term" data-term="${id}">${esc(base.slice(m.index, m.index + m[1].length))}</button>`;
    ultimo = m.index + m[1].length;
  }
  return out + esc(base.slice(ultimo));
}

// términos que aparecen en una ficha, para el apartado del final
export function terminosDe(p) {
  const orig = [p.nombre, p.rc?.texto, ...(p.posicion || []), ...Object.values(p.factores || {}).filter(Boolean),
    ...(p.criterios || []).flatMap(([t, it]) => [t, ...it]), ...(p.notas || [])].join(" \n ").normalize("NFC");
  const txt = norm(orig);
  const ids = new Set(p.glosario || []);
  const mismoLargo = txt.length === orig.length;
  for (const m of txt.matchAll(patron)) {
    if (!porForma[m[1]]) continue;
    if (siglas[m[1]] && (!mismoLargo || !valida(m[1], orig.slice(m.index, m.index + m[1].length)))) continue;
    ids.add(porForma[m[1]]);
  }
  return GLOSARIO.filter((t) => ids.has(t.id));
}

export const definicionHTML = (t) => `
  <p class="def">${esc(t.definicion || "Sin definición cargada.")}</p>
  ${t.sinonimo ? `<p class="sin"><b>También:</b> ${esc(t.sinonimo)}</p>` : ""}
  ${t.estado !== "aprobado" ? `<p class="pend">Definición pendiente de aprobación</p>` : ""}`;

export function mostrarTermino(id) {
  const t = terminoPorId[id];
  if (t) abrirHoja(t.termino, definicionHTML(t));
}
