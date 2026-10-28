// Nombres de los enfoques de otros libros, para mostrar en Favoritos los que se guardaron desde otra fuente.
// Se cargan solo cuando hacen falta (la primera vez que se abre Favoritos con enfoques de otro libro) y quedan en memoria.
const cache = {}, cargando = {};

// devuelve { <id>: { nombre, region } } o null mientras carga; alListo se llama cuando termina de cargar
export function nombresDe(fuente, alListo) {
  if (cache[fuente]) return cache[fuente];
  if (!cargando[fuente]) {
    cargando[fuente] = import(`../datos/${fuente}/indice.js`).then(({ CAPITULOS }) => {
      const m = {};
      for (const c of CAPITULOS) {
        const reg = Object.fromEntries(c.regiones.map((r) => [r.id, r.nombre]));
        for (const p of c.proyecciones) m[p.id] = { nombre: p.metodo && !p.nombre.includes(p.metodo) ? `${p.nombre} · ${p.metodo}` : p.nombre, region: reg[p.region] || "" };
      }
      cache[fuente] = m;
    }).catch(() => { cache[fuente] = {}; }).then(() => alListo?.());
  }
  return null;
}
