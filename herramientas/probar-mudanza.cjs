// Pruebas de js/mudanza.js (el link "#mudanza=" que lleva los datos del sitio viejo al nuevo). No toca internet:
// los dos sitios (github.io y web.app) se simulan sirviendo los archivos de esta carpeta. Desde la raíz del repo:
//   node herramientas/probar-mudanza.cjs .
// (necesita Playwright con Chromium). Cada línea dice qué tiene que pasar; si alguna falla, termina con error.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const RAIZ = path.resolve(process.argv[2] || '.');
const tipo = (f) => f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream';
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const ANON = { clave: 'firebase:authUser:KEY:[DEFAULT]', valor: { uid: 'atacante', isAnonymous: true, stsTokenManager: { refreshToken: 'x' } } };
const GOOGLE = { clave: 'firebase:authUser:KEY:[DEFAULT]', valor: { uid: 'atacante', isAnonymous: false, stsTokenManager: { refreshToken: 'x' } } };
let fallas = 0;
async function abrir(b, url, dialogo) {
  const ctx = await b.newContext();
  await ctx.route('**/*', async (r) => {
    const u = new URL(r.request().url());
    if (!/github\.io$|web\.app$/.test(u.hostname)) return r.abort();
    let p = u.pathname.replace(/^\/Radioguia/, ''); if (p.endsWith('/')) p += 'index.html';
    if (p === '/js/main.js' || p === '/sw-archivos.js') return r.fulfill({ body: '', contentType: 'text/javascript' });
    const f = path.join(RAIZ, p); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ body: fs.readFileSync(f), contentType: tipo(f) });
  });
  const p = await ctx.newPage(); let pregunto = false;
  p.on('dialog', (d) => { pregunto = true; dialogo === 'aceptar' ? d.accept() : d.dismiss(); });
  return { ctx, p, preguntado: () => pregunto };
}
async function caso(b, nombre, datos, dialogo, esperado) {
  const { ctx, p, preguntado } = await abrir(b, null, dialogo);
  await p.goto('https://app-rx-188a6.web.app/#mudanza=' + b64(datos)); await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ sesion: !!localStorage.getItem('firebase:authUser:KEY:[DEFAULT]'), listas: !!localStorage.getItem('radioguia.listas'), foto: !!localStorage.getItem('radioguia.foto.grande'), destino: !!localStorage.getItem('radioguia.destino'), hash: location.hash }));
  r.pregunto = preguntado();
  const ok = Object.keys(esperado).every((k) => r[k] === esperado[k]);
  if (!ok) fallas++;
  console.log(ok ? 'ok  ' : 'FALLA', nombre, JSON.stringify(r));
  await ctx.close();
}
(async () => {
  const b = await chromium.launch(), ahora = Date.now();
  const ls = { 'radioguia.nombre': 'Ana', 'radioguia.listas': '{"v":1,"listas":[]}' };
  await caso(b, 'M1 link armado por otro con su sesión de Google: no se copia la sesión', { v: 1, t: ahora, hash: '', ls, auth: GOOGLE }, 'aceptar', { sesion: false });
  await caso(b, 'M2 link con sesión de apodo y la persona dice que no es suya: no se copia nada', { v: 1, t: ahora, hash: '', ls, auth: ANON }, 'cancelar', { sesion: false, listas: false, pregunto: true });
  await caso(b, 'M3 link viejo (2 horas): no se copia nada', { v: 1, t: ahora - 2 * 3600e3, hash: '', ls, auth: ANON }, 'aceptar', { sesion: false, listas: false });
  await caso(b, 'M4 link sin fecha (de la app vieja todavía sin actualizar): pregunta antes de llevar la sesión', { v: 1, hash: '', ls, auth: ANON }, 'cancelar', { sesion: false, listas: false, pregunto: true });
  await caso(b, 'M4b link sin fecha con sesión de Google: no se copia la sesión', { v: 1, hash: '', ls, auth: GOOGLE }, 'aceptar', { sesion: false });
  await caso(b, 'M5 claves internas (foto grande, destino) no se copian', { v: 1, t: ahora, hash: '', ls: { ...ls, 'radioguia.foto.grande': '{"dato":"x"}', 'radioguia.destino': '#juegos' }, auth: null }, 'aceptar', { foto: false, destino: false, listas: true });
  await caso(b, 'M6 flujo legítimo con apodo: confirma y se copia todo, y vuelve a la pantalla', { v: 1, t: ahora, hash: '#favoritos', ls, auth: ANON }, 'aceptar', { sesion: true, listas: true, pregunto: true, hash: '#favoritos' });
  // M7 punta a punta: el sitio viejo arma el link y el nuevo lo recibe
  { const { ctx, p } = await abrir(b, null, 'aceptar');
    await p.goto('https://martinadinolfi53-stack.github.io/Radioguia/404-vacia');
    await p.evaluate(async (a) => { localStorage.setItem('radioguia.nombre', 'Ana'); localStorage.setItem('radioguia.listas', '{"v":1,"listas":[{"id":"fav","ids":["torax-pa"]}]}');
      await new Promise((ok) => { const q = indexedDB.open('firebaseLocalStorageDb', 1); q.onupgradeneeded = () => q.result.createObjectStore('firebaseLocalStorage', { keyPath: 'fbase_key' }); q.onsuccess = () => { const t = q.result.transaction('firebaseLocalStorage', 'readwrite'); t.objectStore('firebaseLocalStorage').put({ fbase_key: a.clave, value: a.valor }); t.oncomplete = () => { q.result.close(); ok(); }; }; }); }, ANON);
    await p.goto('https://martinadinolfi53-stack.github.io/Radioguia/#favoritos');
    await p.waitForURL(/web\.app/, { timeout: 8000 }); await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({ host: location.host, hash: location.hash, sesion: !!localStorage.getItem('firebase:authUser:KEY:[DEFAULT]'), listas: localStorage.getItem('radioguia.listas') }));
    const ok = r.host === 'app-rx-188a6.web.app' && r.hash === '#favoritos' && r.sesion && /torax-pa/.test(r.listas || '');
    if (!ok) fallas++; console.log(ok ? 'ok  ' : 'FALLA', 'M7 mudanza real de punta a punta (sitio viejo -> nuevo)', JSON.stringify(r)); await ctx.close(); }
  await b.close();
  console.log(fallas ? `${fallas} prueba(s) fallaron` : 'Todas las pruebas de la mudanza dieron lo esperado.'); process.exit(fallas ? 1 : 0);
})();
