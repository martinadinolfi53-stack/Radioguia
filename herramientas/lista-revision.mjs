// Genera docs/para-revisar.md con todos los avisos "para revisar" de las fichas, por capítulo.
import { writeFileSync } from "node:fs";
const { CAPITULOS } = await import("../datos/indice.js");
let md = "# RadioGuía · datos para revisar\n\nDudas o contradicciones encontradas en el Bontrager 9ª ed. Cada una figura también en su ficha, en el recuadro «Para revisar».\n";
let n = 0;
for (const c of CAPITULOS) {
  const con = c.proyecciones.filter((p) => p.revision?.length);
  if (!con.length) continue;
  md += `\n## Capítulo ${c.capitulo} · ${c.titulo}\n`;
  for (const p of con) for (const r of p.revision) { n++; md += `\n${n}. **${p.nombre}** (pág. ${p.fuente.paginas.join(", ")}): ${r}\n`; }
}
writeFileSync(new URL("../../docs/para-revisar.md", import.meta.url), md);
console.log(n, "avisos");
