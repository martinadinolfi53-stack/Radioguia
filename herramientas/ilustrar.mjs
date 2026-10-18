// Genera los esquemas didácticos (SVG) de las fichas.
// Cada archivo herramientas/ilus/<zona>.cjs exporta { "<id de proyección>": () => "<svg…>" } usando las primitivas de estilo.cjs.
// Este script escribe ilustraciones/<id>.svg y una vista previa PNG opcional.
// Uso (desde la carpeta radioguia):  node herramientas/ilustrar.mjs [zona…]   (sin zonas = todas)
// Después correr  node herramientas/preparar.mjs  para que la app las tome.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(fileURLToPath(import.meta.url), "..", "..");
const require = createRequire(import.meta.url);
const { CAPITULOS } = await import(pathToFileURL(join(raiz, "datos/indice.js")));
const ids = new Set(CAPITULOS.flatMap((c) => c.proyecciones.map((p) => p.id)));
const zonas = process.argv.slice(2);
const archivos = readdirSync(join(raiz, "herramientas/ilus")).filter((f) => f.endsWith(".cjs") && f !== "estilo.cjs" && !f.startsWith("referencia-"))
  .filter((f) => !zonas.length || zonas.includes(f.replace(/\.cjs$/, "")));
mkdirSync(join(raiz, "ilustraciones"), { recursive: true });
const problemas = [];
let n = 0;
for (const f of archivos) {
  const mod = require(join(raiz, "herramientas/ilus", f));
  for (const [id, dibujar] of Object.entries(mod)) {
    if (!ids.has(id)) { problemas.push(`${f}: "${id}" no es una proyección de la app`); continue; }
    const s = dibujar();
    if (!s.startsWith("<svg") || /NaN|undefined/.test(s)) { problemas.push(`${f}: "${id}" generó un SVG inválido`); continue; }
    writeFileSync(join(raiz, "ilustraciones", id + ".svg"), s);
    n++;
  }
}
console.log(`${n} esquemas escritos en ilustraciones/`);
if (problemas.length) { console.error(problemas.join("\n")); process.exit(1); }
