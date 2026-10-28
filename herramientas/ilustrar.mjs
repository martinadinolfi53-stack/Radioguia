// Genera los esquemas didácticos (SVG) de las fichas.
// Cada archivo herramientas/ilus/<zona>.cjs exporta { "<id de proyección>": () => "<svg…>" } usando las primitivas de estilo.cjs.
// Para las fichas con versiones (datos/bontrager/versiones.js), las claves "<id>--v1", "<id>--v2"… dan un esquema por versión.
// Este script escribe ilustraciones/<id>.svg y una vista previa PNG opcional.
// Uso (desde la carpeta radioguia):  node herramientas/ilustrar.mjs [zona…]   (sin zonas = todas)
// Después correr  node herramientas/preparar.mjs  para que la app las tome.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(fileURLToPath(import.meta.url), "..", "..");
const require = createRequire(import.meta.url);
const { CAPITULOS } = await import(pathToFileURL(join(raiz, "datos/bontrager/indice.js")));
const ids = new Set(CAPITULOS.flatMap((c) => c.proyecciones.map((p) => p.id)));
const VERSIONES = (await import(pathToFileURL(join(raiz, "datos/bontrager/versiones.js")))).default;
// "<id>" o "<id>--v<N>" con N entre 1 y la cantidad de versiones de esa ficha; devuelve el motivo si no vale
function claveInvalida(clave) {
  const m = clave.match(/^(.+)--v(\d+)$/);
  if (!m) return ids.has(clave) ? null : "no es una proyección de la app";
  const [, base, n] = m;
  if (!ids.has(base)) return `"${base}" no es una proyección de la app`;
  const cant = VERSIONES[base]?.versiones.length || 0;
  if (!cant) return `"${base}" no tiene versiones en datos/bontrager/versiones.js`;
  if (+n < 1 || +n > cant) return `versión ${n} fuera de rango (la ficha tiene ${cant})`;
  return null;
}
const zonas = process.argv.slice(2);
const archivos = readdirSync(join(raiz, "herramientas/ilus")).filter((f) => f.endsWith(".cjs") && f !== "estilo.cjs" && !f.startsWith("referencia-"))
  .filter((f) => !zonas.length || zonas.includes(f.replace(/\.cjs$/, "")));
mkdirSync(join(raiz, "ilustraciones"), { recursive: true });
const problemas = [];
let n = 0;
for (const f of archivos) {
  const mod = require(join(raiz, "herramientas/ilus", f));
  for (const [id, dibujar] of Object.entries(mod)) {
    const mal = claveInvalida(id);
    if (mal) { problemas.push(`${f}: "${id}": ${mal}`); continue; }
    const s = dibujar();
    if (!s.startsWith("<svg") || /NaN|undefined/.test(s)) { problemas.push(`${f}: "${id}" generó un SVG inválido`); continue; }
    writeFileSync(join(raiz, "ilustraciones", id + ".svg"), s);
    n++;
  }
}
console.log(`${n} esquemas escritos en ilustraciones/`);
if (problemas.length) { console.error(problemas.join("\n")); process.exit(1); }
