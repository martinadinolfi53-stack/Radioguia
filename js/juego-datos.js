// Fichas para el repaso y los Juegos: las del libro abierto o, con "Ambos", las de todos los libros mezcladas.
// Exporta los mismos nombres que js/datos.js y js/menu.js, así repaso, juegos y grupos no tienen que saber de dónde salen.
// Con Ambos, las fichas, regiones y zonas de los otros libros llevan el id con prefijo ("merrill:codo-ap"), como en Favoritos,
// y cada pregunta toma los distractores solo de su propio libro (si no, una opción "incorrecta" podría ser la del otro libro).
import { proyecciones as propias, regionPorId as regionesPropias, armar } from "./datos.js";
import { GRUPOS as gruposPropios, FAMILIAS } from "./menu.js";
import { generarPreguntas as generar, azar, mezclar } from "./repaso-preguntas.js";
import { FUENTES, fuenteId, ambos, clave as claveLibro } from "./fuente.js";
import { esc } from "./util.js";

export const mezcla = ambos();
// lo que el repaso y los grupos guardan con Ambos va aparte del de cada libro
export const clave = (k) => (mezcla ? `${k}.ambos` : claveLibro(k));
// el "libro" de los juegos: el abierto o "ambos"; es el que se anota en los grupos nuevos
export const libroJuego = mezcla ? "ambos" : fuenteId;

const libros = [{ id: fuenteId, fichas: propias }];
export const proyecciones = [...propias];
export const regionPorId = { ...regionesPropias };
export const GRUPOS = [...gruposPropios];
if (mezcla) {
  for (const f of FUENTES.filter((x) => x.lista && x.id !== fuenteId)) {
    const indice = await import(`../datos/${f.id}/indice.js`);
    const d = armar(indice), pre = `${f.id}:`;
    const fichas = d.proyecciones.map((p) => ({ ...p, id: pre + p.id, region: pre + p.region }));
    libros.push({ id: f.id, fichas });
    proyecciones.push(...fichas);
    for (const r of d.regiones) regionPorId[pre + r.id] = r;
    for (const g of indice.MENU) GRUPOS.push({ ...g, id: pre + g.id, nombre: `${g.nombre} (${f.nombre})`, familia: FAMILIAS.find((x) => x.id === g.familia), regiones: g.regiones.map((r) => pre + r) });
  }
}
for (const g of GRUPOS) g.color ||= g.familia?.color;
export const proyeccionPorId = Object.fromEntries(proyecciones.map((p) => [p.id, p]));
export const grupoDeRegion = Object.fromEntries(GRUPOS.flatMap((g) => g.regiones.map((r) => [r, g])));

const libroDe = (id) => (String(id).includes(":") ? id.slice(0, id.indexOf(":")) : fuenteId);
// con Ambos, cada pregunta muestra de qué libro sale (los datos pueden cambiar de un libro a otro)
export function etiquetaLibro(id) {
  if (!mezcla) return "";
  const f = FUENTES.find((x) => x.id === libroDe(id));
  return f ? `<span class="fuente-tag f-${esc(f.id)} rp-libro">${esc(f.nombre)}</span>` : "";
}

// atributos del link a una ficha: las de otro libro cambian a ese libro (ver el click de [data-ir-fuente] en js/main.js)
export function linkFicha(id) {
  const libro = libroDe(id), suyo = libro === fuenteId ? id : id.slice(libro.length + 1);
  return libro === fuenteId ? `href="#p-${esc(id)}"` : `href="#p-${esc(suyo)}" data-ir-fuente="${esc(libro)}" data-ir-ficha="${esc(suyo)}"`;
}

// mismos datos que generarPreguntas de js/repaso-preguntas.js ("todas" se ignora: se usan las del libro de cada ficha)
export function generarPreguntas(args) {
  if (!mezcla) return generar({ ...args, todas: propias });
  const partes = libros.map((l) => {
    const fichas = args.fichas.filter((p) => libroDe(p.id) === l.id);
    return fichas.length ? generar({ ...args, fichas, todas: l.fichas, cantidad: Infinity }) : [];
  });
  // misma semilla, mismo orden: todo el grupo recibe las mismas preguntas
  return mezclar(partes.flat(), azar(`${args.semilla}|ambos`)).slice(0, args.cantidad || Infinity);
}
