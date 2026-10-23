// Capa de datos: arma índices a partir de los capítulos y el glosario. Ninguna vista lee los archivos de datos directo.
import { CAPITULOS, FUENTE } from "../datos/indice.js";
import GLOSARIO from "../datos/glosario.js";
import CON_ESQUEMA from "../datos/ilustraciones.js";
import ANG_ROT from "../datos/angulacion-rotacion.js";
import VERSIONES from "../datos/versiones.js";
import { validarDatos } from "./validacion.js";

export { FUENTE, GLOSARIO };

export const CATEGORIAS = ["AP", "PA", "Perfil", "Oblicuas", "Axiales", "Tangenciales", "Decúbitos", "Métodos especiales"];

export const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const capitulos = CAPITULOS.map((c) => ({ ...c, regiones: c.regiones.map((r) => ({ ...r, capitulo: c.capitulo })) }));
export const regiones = capitulos.flatMap((c) => c.regiones);
export const proyecciones = capitulos.flatMap((c) => c.proyecciones.map((p) => ({ ...p, capitulo: c.capitulo })));
// angulación del rayo y rotación de la región (sacadas de los pasos y del RC de cada ficha)
for (const p of proyecciones) if (ANG_ROT[p.id]) p.factores = { ...p.factores, ...Object.fromEntries(Object.entries(ANG_ROT[p.id]).filter(([k]) => !(k in (p.factores || {})))) };
// esquemas didácticos generados (ilustraciones/<id>.svg), sin verificar por un docente
const esquemas = new Set(CON_ESQUEMA);
for (const p of proyecciones) if (!p.ilustracion?.src && esquemas.has(p.id)) p.ilustracion = { src: `ilustraciones/${p.id}.svg`, alt: `Esquema: ${p.nombre}`, verificada: false };
// fichas con varias posiciones del paciente (datos/versiones.js): pasos comunes + una versión por posición, cada una con su esquema
for (const p of proyecciones) {
  const v = VERSIONES[p.id];
  if (!v) continue;
  p.comun = [...(v.comun || [])];
  p.versiones = v.versiones.map((x, i) => {
    const id = `${p.id}--v${i + 1}`;
    return { ...x, posicion: [...x.posicion], ilustracion: esquemas.has(id) ? { src: `ilustraciones/${id}.svg`, alt: `Esquema: ${p.nombre} · ${x.nombre}`, verificada: false } : null };
  });
}

export const regionPorId = Object.fromEntries(regiones.map((r) => [r.id, r]));
export const proyeccionPorId = Object.fromEntries(proyecciones.map((p) => [p.id, p]));
export const terminoPorId = Object.fromEntries(GLOSARIO.map((t) => [t.id, t]));

export const proyeccionesDe = (regionId) => proyecciones.filter((p) => p.region === regionId);

// nombre con el epónimo (método de Grashey, Neer, Lawrence…): muchos lugares conocen la proyección por ese nombre
for (const p of proyecciones) if (p.metodo && !p.nombre.includes(p.metodo)) p.nombre = `${p.nombre} · ${p.metodo}`;

// texto indexado para el buscador: región, nombre, método y categoría pesan más que el resto
for (const p of proyecciones) {
  const r = regionPorId[p.region];
  p._titulo = norm([r?.nombre, r?.detalle, p.nombre, p.metodo, ...(p.categoria || [])].join(" "));
  p._todo = norm([p._titulo, p.rc?.texto, ...(p.posicion || []), ...(p.versiones || []).flatMap((v) => [v.nombre, v.rc?.texto, ...v.posicion]), ...Object.values(p.factores || {})].join(" "));
}

export const problemas = validarDatos({ capitulos, regiones, proyecciones, glosario: GLOSARIO });
if (problemas.length) console.warn("RadioGuía · problemas en los datos:\n" + problemas.join("\n"));
