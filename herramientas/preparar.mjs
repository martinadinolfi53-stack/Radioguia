// Prepara RadioGuía para publicar:
//   1. valida los datos (campos faltantes, referencias rotas, glosario)
//   2. genera sw-archivos.js con la lista de archivos a guardar sin conexión y una versión basada en su contenido
// Uso (desde la carpeta radioguia):  node herramientas/preparar.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(fileURLToPath(import.meta.url), "..", "..");
const { CAPITULOS } = await import(pathToFileURL(join(raiz, "datos/indice.js")));
const GLOSARIO = (await import(pathToFileURL(join(raiz, "datos/glosario.js")))).default;
const { validarDatos } = await import(pathToFileURL(join(raiz, "js/validacion.js")));

const regiones = CAPITULOS.flatMap((c) => c.regiones);
const proyecciones = CAPITULOS.flatMap((c) => c.proyecciones);
const problemas = validarDatos({ capitulos: CAPITULOS, regiones, proyecciones, glosario: GLOSARIO });

// cada región del manual tiene que estar en un solo botón del menú principal
const { GRUPOS } = await import(pathToFileURL(join(raiz, "js/menu.js")));
const enMenu = GRUPOS.flatMap((g) => g.regiones);
for (const r of regiones) if (!enMenu.includes(r.id)) problemas.push(`Región sin botón en el menú (js/menu.js): ${r.id}`);
enMenu.forEach((id, i) => { if (enMenu.indexOf(id) !== i || !regiones.some((r) => r.id === id)) problemas.push(`Región repetida o inexistente en js/menu.js: ${id}`); });

// archivos de datos que existen pero no están en el índice
const enIndice = readFileSync(join(raiz, "datos/indice.js"), "utf8");
for (const f of readdirSync(join(raiz, "datos"))) if (/^cap\d+.*\.js$/.test(f) && !enIndice.includes(f)) problemas.push(`datos/${f} no está importado en datos/indice.js`);
// ilustraciones referenciadas que no existen
for (const p of proyecciones) if (p.ilustracion?.src) { try { statSync(join(raiz, p.ilustracion.src)); } catch { problemas.push(`[${p.id}] ilustración inexistente: ${p.ilustracion.src}`); } }

// esquemas presentes en ilustraciones/ → datos/ilustraciones.js (la app los asigna a cada ficha)
const conEsquema = readdirSync(join(raiz, "ilustraciones")).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort();
for (const id of conEsquema) if (!proyecciones.some((p) => p.id === id)) problemas.push(`ilustraciones/${id}.svg no corresponde a ninguna proyección`);
writeFileSync(join(raiz, "datos/ilustraciones.js"), `// Generado por herramientas/preparar.mjs: fichas con esquema en ilustraciones/<id>.svg. No editar a mano.\nexport default ${JSON.stringify(conEsquema)};\n`);
for (const p of proyecciones) if (!p.ilustracion?.src && conEsquema.includes(p.id)) p.ilustracion = { src: `ilustraciones/${p.id}.svg` };

const INCLUIR = ["index.html", "manifest.webmanifest", "css", "js", "datos", "config", "iconos", "fuentes", "ilustraciones"];
const archivos = [];
const recorrer = (p) => statSync(p).isDirectory() ? readdirSync(p).forEach((f) => recorrer(join(p, f))) : archivos.push(p);
INCLUIR.forEach((x) => recorrer(join(raiz, x)));
const lista = archivos.filter((f) => !/README|\.md$|\.DS_Store/.test(f)).map((f) => relative(raiz, f).split(sep).join("/")).sort();
const hash = createHash("sha256");
for (const f of lista) hash.update(f).update(readFileSync(join(raiz, f)));
const version = hash.digest("hex").slice(0, 10);
writeFileSync(join(raiz, "sw-archivos.js"), `// Generado por herramientas/preparar.mjs. No editar a mano.\nself.RG_VERSION = "${version}";\nself.RG_ARCHIVOS = ${JSON.stringify(["./", ...lista], null, 1)};\n`);

const pend = proyecciones.filter((p) => p.estado !== "validado").length;
const sinIlus = proyecciones.filter((p) => !p.ilustracion?.src).length;
console.log(`${CAPITULOS.length} capítulos · ${regiones.length} regiones · ${proyecciones.length} proyecciones · ${GLOSARIO.length} términos`);
console.log(`Pendientes de revisión: ${pend} · sin ilustración: ${sinIlus} · con avisos "para revisar": ${proyecciones.filter((p) => p.revision?.length).length}`);
console.log(`sw-archivos.js: ${lista.length} archivos, versión ${version}`);
if (problemas.length) { console.error("\nPROBLEMAS:\n" + problemas.join("\n")); process.exit(1); }
console.log("Datos sin problemas.");
