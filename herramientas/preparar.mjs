// Prepara RadioGuía para publicar:
//   1. valida los datos (campos faltantes, referencias rotas, glosario)
//   2. genera sw-archivos.js con la lista de archivos a guardar sin conexión y una versión basada en su contenido
// Uso (desde la carpeta radioguia):  node herramientas/preparar.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(fileURLToPath(import.meta.url), "..", "..");
const GLOSARIO = (await import(pathToFileURL(join(raiz, "datos/glosario.js")))).default;
const { validarDatos } = await import(pathToFileURL(join(raiz, "js/validacion.js")));
const FUENTES = (await import(pathToFileURL(join(raiz, "datos/fuentes.js")))).default;
const { FAMILIAS } = await import(pathToFileURL(join(raiz, "js/menu.js")));
const problemas = [];
const resumen = [];

// cada fuente (datos/<id>/) se revisa por separado: sus fichas, su menú y sus esquemas
for (const { id: fid, lista: fLista } of FUENTES) {
  const dir = `datos/${fid}`;
  const { CAPITULOS, MENU, FUENTE } = await import(pathToFileURL(join(raiz, dir, "indice.js")));
  const antes = problemas.length;
  const regiones = CAPITULOS.flatMap((c) => c.regiones);
  const proyecciones = CAPITULOS.flatMap((c) => c.proyecciones);
  problemas.push(...validarDatos({ capitulos: CAPITULOS, regiones, proyecciones, glosario: GLOSARIO }).map((x) => `${fid}: ${x}`));
  if (fLista && !proyecciones.length) problemas.push(`${fid}: está marcada como lista en datos/fuentes.js pero no tiene fichas`);

  // cada región del libro tiene que estar en un solo botón del menú principal
  const enMenu = MENU.flatMap((g) => g.regiones);
  for (const g of MENU) if (!FAMILIAS[g.familia]) problemas.push(`${dir}/menu.js: familia desconocida "${g.familia}" en ${g.id}`);
  for (const r of regiones) if (!enMenu.includes(r.id)) problemas.push(`Región sin botón en el menú (${dir}/menu.js): ${r.id}`);
  enMenu.forEach((id, i) => { if (enMenu.indexOf(id) !== i || !regiones.some((r) => r.id === id)) problemas.push(`Región repetida o inexistente en ${dir}/menu.js: ${id}`); });

  // angulación y rotación: una entrada por ficha, con «Sí…», «No…» o null
  const ANG = (await import(pathToFileURL(join(raiz, dir, "angulacion-rotacion.js")))).default;
  // (o, como en el Merrill, directamente en los factores de la ficha)
  for (const p of proyecciones) if (!ANG[p.id] && !(p.factores && "angulacion" in p.factores && "rotacion" in p.factores)) problemas.push(`[${p.id}] falta en ${dir}/angulacion-rotacion.js (o angulacion y rotacion en sus factores)`);
  for (const [id, v] of Object.entries(ANG)) {
    if (!proyecciones.some((p) => p.id === id)) problemas.push(`${dir}/angulacion-rotacion.js: "${id}" no es una proyección`);
    for (const k of ["angulacion", "rotacion"]) if (v[k] !== null && !/^(Sí|No)(\s|;|$)/.test(v[k] ?? "")) problemas.push(`[${id}] ${k} tiene que empezar con Sí o No`);
  }
  for (const p of proyecciones) for (const k of ["angulacion", "rotacion"]) if (p.factores?.[k] && !/^(Sí|No)(\s|;|$)/.test(p.factores[k])) problemas.push(`[${p.id}] ${k} tiene que empezar con Sí o No`);

  // archivos de datos que existen pero no están en el índice
  const enIndice = readFileSync(join(raiz, dir, "indice.js"), "utf8");
  for (const f of readdirSync(join(raiz, dir))) if (/^cap\d+.*\.js$/.test(f) && !enIndice.includes(f)) problemas.push(`${dir}/${f} no está importado en ${dir}/indice.js`);
  // ilustraciones referenciadas que no existen
  for (const p of proyecciones) if (p.ilustracion?.src) { try { statSync(join(raiz, p.ilustracion.src)); } catch { problemas.push(`[${p.id}] ilustración inexistente: ${p.ilustracion.src}`); } }

  // fichas con varias posiciones del paciente: versiones.js de la fuente
  const VERSIONES = (await import(pathToFileURL(join(raiz, dir, "versiones.js")))).default;
  for (const [id, v] of Object.entries(VERSIONES)) {
    if (!proyecciones.some((p) => p.id === id)) problemas.push(`${dir}/versiones.js: "${id}" no es una proyección`);
    if (!Array.isArray(v.comun) || !Array.isArray(v.versiones) || v.versiones.length < 2) problemas.push(`${dir}/versiones.js: "${id}" necesita comun (lista) y al menos dos versiones`);
    for (const [i, x] of (v.versiones || []).entries()) {
      if (!x.nombre || !Array.isArray(x.posicion)) problemas.push(`${dir}/versiones.js: "${id}" versión ${i + 1} sin nombre o sin lista de posición`);
      if (!x.posicion?.length && !x.rc) problemas.push(`${dir}/versiones.js: "${id}" versión ${i + 1} vacía`);
      if (x.rc && !x.rc.texto) problemas.push(`${dir}/versiones.js: "${id}" versión ${i + 1}: rc sin texto`);
    }
  }

  // esquemas presentes en la carpeta de la fuente → datos/<fuente>/ilustraciones.js (la app los asigna a cada ficha o a cada versión: <id>--v<N>.svg)
  const conEsquema = readdirSync(join(raiz, FUENTE.ilustraciones)).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort();
  for (const id of conEsquema) {
    const m = id.match(/^(.+)--v(\d+)$/);
    if (!m) { if (!proyecciones.some((p) => p.id === id)) problemas.push(`${FUENTE.ilustraciones}${id}.svg no corresponde a ninguna proyección`); continue; }
    const cant = VERSIONES[m[1]]?.versiones.length || 0;
    if (!proyecciones.some((p) => p.id === m[1])) problemas.push(`${FUENTE.ilustraciones}${id}.svg: "${m[1]}" no es una proyección`);
    else if (+m[2] < 1 || +m[2] > cant) problemas.push(`${FUENTE.ilustraciones}${id}.svg: versión fuera de rango (la ficha tiene ${cant} en ${dir}/versiones.js)`);
  }
  // una ficha con esquemas por versión no debería conservar el combinado
  for (const [id, v] of Object.entries(VERSIONES)) {
    const conVer = v.versiones.map((_, i) => conEsquema.includes(`${id}--v${i + 1}`));
    if (conVer.every(Boolean) && conEsquema.includes(id)) problemas.push(`${FUENTE.ilustraciones}${id}.svg sobra: la ficha ya tiene un esquema por versión`);
    if (conVer.some(Boolean) && !conVer.every(Boolean)) problemas.push(`[${id}] faltan esquemas de versión: ${conVer.map((x, i) => (x ? "" : `--v${i + 1}`)).filter(Boolean).join(", ")}`);
  }
  writeFileSync(join(raiz, dir, "ilustraciones.js"), `// Generado por herramientas/preparar.mjs: fichas con esquema en ${FUENTE.ilustraciones}<id>.svg. No editar a mano.\nexport default ${JSON.stringify(conEsquema)};\n`);
  for (const p of proyecciones) {
    if (!p.ilustracion?.src && conEsquema.includes(p.id)) p.ilustracion = { src: `${FUENTE.ilustraciones}${p.id}.svg` };
    const v = VERSIONES[p.id];
    if (v) p.versiones = v.versiones.map((x, i) => ({ ...x, ilustracion: conEsquema.includes(`${p.id}--v${i + 1}`) ? { src: `${FUENTE.ilustraciones}${p.id}--v${i + 1}.svg` } : null }));
    // con un esquema por versión, la ficha cuenta como ilustrada
    if (!p.ilustracion?.src && p.versiones?.every((x) => x.ilustracion)) p.ilustracion = { src: p.versiones[0].ilustracion.src };
  }

  const pend = proyecciones.filter((p) => p.estado !== "validado").length;
  const sinIlus = proyecciones.filter((p) => !p.ilustracion?.src).length;
  resumen.push(`${FUENTE.corto}: ${CAPITULOS.length} capítulos · ${regiones.length} regiones · ${proyecciones.length} proyecciones · pendientes de revisión: ${pend} · sin ilustración: ${sinIlus} · con avisos "para revisar": ${proyecciones.filter((p) => p.revision?.length).length}${problemas.length > antes ? ` · ${problemas.length - antes} problemas` : ""}`);
}

const INCLUIR = ["index.html", "manifest.webmanifest", "css", "js", "datos", "config", "iconos", "fuentes", "ilustraciones"];
const archivos = [];
const recorrer = (p) => statSync(p).isDirectory() ? readdirSync(p).forEach((f) => recorrer(join(p, f))) : archivos.push(p);
INCLUIR.forEach((x) => recorrer(join(raiz, x)));
const lista = archivos.filter((f) => !/README|\.md$|\.DS_Store/.test(f)).map((f) => relative(raiz, f).split(sep).join("/")).sort();
const hash = createHash("sha256");
for (const f of lista) hash.update(f).update(readFileSync(join(raiz, f)));
const version = hash.digest("hex").slice(0, 10);
writeFileSync(join(raiz, "sw-archivos.js"), `// Generado por herramientas/preparar.mjs. No editar a mano.\nself.RG_VERSION = "${version}";\nself.RG_ARCHIVOS = ${JSON.stringify(["./", ...lista], null, 1)};\n`);

console.log(resumen.join("\n") + ` · glosario: ${GLOSARIO.length} términos`);
console.log(`sw-archivos.js: ${lista.length} archivos, versión ${version}`);
if (problemas.length) { console.error("\nPROBLEMAS:\n" + problemas.join("\n")); process.exit(1); }
console.log("Datos sin problemas.");
