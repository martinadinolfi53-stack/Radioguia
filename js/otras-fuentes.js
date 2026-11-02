// Enfoques de los otros libros: para mostrar en Favoritos los que se guardaron desde otra fuente y para que el buscador
// encuentre en todos los libros. Se cargan solo cuando hacen falta y quedan en memoria.
import { armar } from "./datos.js";

const cache = {}, cargando = {};

// { nombres: { <id>: { nombre, region, familia } }, proyecciones, menu } o null mientras carga
// (familia: la clave de js/menu.js, según el menú de ese libro); al terminar de cargar se rehace la pantalla
function cargar(fuente) {
  if (cache[fuente]) return cache[fuente];
  if (!cargando[fuente]) {
    cargando[fuente] = import(`../datos/${fuente}/indice.js`).then((indice) => {
      const { proyecciones, regionPorId } = armar(indice);
      const familia = Object.fromEntries(indice.MENU.flatMap((g) => g.regiones.map((r) => [r, g.familia])));
      const nombres = {};
      for (const p of proyecciones) nombres[p.id] = { nombre: p.nombre, region: regionPorId[p.region]?.nombre || "", familia: familia[p.region] || "" };
      for (const p of proyecciones) p._region = nombres[p.id].region;
      cache[fuente] = { nombres, proyecciones, menu: indice.MENU };
    }).catch(() => { cache[fuente] = { nombres: {}, proyecciones: [], menu: [] }; })
      .then(() => document.dispatchEvent(new Event("rx-rehacer")));
  }
  return null;
}

export const nombresDe = (fuente) => cargar(fuente)?.nombres ?? null;
export const proyeccionesDe = (fuente) => cargar(fuente)?.proyecciones ?? null;
// botones del menú del otro libro (datos/<fuente>/menu.js), con sus enfoques: [{ id, nombre, familia, lista }]
export function gruposDe(fuente) {
  const d = cargar(fuente);
  if (!d) return null;
  return (d.grupos ||= d.menu.map((g) => ({ ...g, lista: g.regiones.flatMap((r) => d.proyecciones.filter((p) => p.region === r)) })));
}
