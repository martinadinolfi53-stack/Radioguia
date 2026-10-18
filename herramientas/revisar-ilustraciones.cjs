// Uso (desde la carpeta radioguia): NODE_PATH=/opt/node-tools/node_modules node herramientas/revisar-ilustraciones.cjs <carpeta png> ilustraciones/<id>.svg…
// Renderiza cada SVG a PNG y avisa si hay textos que se pisan entre sí o se salen del dibujo.
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
(async () => {
  const [out, ...files] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1140, height: 600 }, deviceScaleFactor: 1 });
  let malos = 0;
  for (const f of files) {
    await p.setContent(`<body style="margin:0">${fs.readFileSync(f, "utf8")}</body><style>svg{width:1140px;height:auto;display:block}</style>`);
    const r = await p.evaluate(() => {
      const svg = document.querySelector("svg"), sb = svg.getBoundingClientRect();
      const ts = [...svg.querySelectorAll("text")].map((t) => ({ t: t.textContent.slice(0, 40), b: t.getBoundingClientRect() })).filter((x) => x.b.width > 0);
      const over = [];
      for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
        const a = ts[i].b, c = ts[j].b;
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        if (ox > 2 && oy > 2) over.push(`"${ts[i].t}" ↔ "${ts[j].t}"`);
      }
      const fuera = ts.filter((x) => x.b.left < sb.left - 1 || x.b.right > sb.right + 1 || x.b.top < sb.top - 1 || x.b.bottom > sb.bottom + 1).map((x) => x.t);
      return { over, fuera };
    });
    await p.locator("svg").screenshot({ path: path.join(out, path.basename(f, ".svg") + ".png") });
    if (r.over.length || r.fuera.length) { malos++; console.log(path.basename(f), r.over.length ? "SE PISAN: " + r.over.join(" | ") : "", r.fuera.length ? "SE SALEN: " + r.fuera.join(" | ") : ""); }
  }
  console.log(`${files.length} revisados, ${malos} con problemas de texto. PNG en ${out}`);
  await b.close();
})();
