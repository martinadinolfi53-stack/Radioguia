// Modo edición: permite completar o corregir fichas desde el celular.
// Los cambios se guardan en este dispositivo (localStorage) y, si hay una conexión con GitHub configurada,
// también en datos/ediciones.json del repositorio, así le llegan a todos los que usan la app.
import { esc, cabecera } from "./util.js";

const K_ED = "radioguia.ediciones", K_CLAVE = "radioguia.clave-edicion", K_ACTIVO = "radioguia.edicion-activa", K_GH = "radioguia.github";
const leer = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const escribir = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

let ediciones = leer(K_ED, {});

// correcciones publicadas (datos/ediciones.json); sin conexión el service worker da la última copia
export async function cargarCompartidas() {
  try { const r = await fetch("datos/ediciones.json", { cache: "no-cache" }); return r.ok ? (await r.json()).ediciones || {} : {}; }
  catch { return {}; }
}

// se llama desde datos.js antes de armar el buscador
export function aplicarEdiciones(proyecciones, compartidas = {}) {
  for (const p of proyecciones) {
    const e = ediciones[p.id] || compartidas[p.id];
    if (!e) continue;
    if (e.factores) p.factores = { ...p.factores, ...e.factores };
    if (e.rc) p.rc = { ...p.rc, ...e.rc };
    for (const k of ["posicion", "criterios", "notas"]) if (e[k]) p[k] = e[k];
    p._editada = ediciones[p.id] ? "local" : "compartida";
  }
}

export const edicion = {
  activa: () => leer(K_ACTIVO, false) === true,
  tieneClave: () => !!leer(K_CLAVE, null),
  cantidad: () => Object.keys(ediciones).length,
  editada: (id) => !!ediciones[id],
  salir() { escribir(K_ACTIVO, false); },
  async entrar(clave) {
    const h = await hash(clave);
    const guardada = leer(K_CLAVE, null);
    if (!guardada) { escribir(K_CLAVE, h); escribir(K_ACTIVO, true); return true; }
    if (guardada !== h) return false;
    escribir(K_ACTIVO, true); return true;
  },
  editadaEn: (p) => !!(ediciones[p.id] || p._editada),
  guardarLocal(id, cambios) { ediciones = { ...ediciones, [id]: cambios }; return escribir(K_ED, ediciones); },
  restaurarLocal(id) { const { [id]: _, ...resto } = ediciones; ediciones = resto; escribir(K_ED, ediciones); },
  github: () => leer(K_GH, null),
  configurarGithub(cfg) { escribir(K_GH, cfg); },
  // guarda en el celular y, si está configurado, publica en GitHub. Devuelve un texto para mostrar.
  async guardar(id, cambios) {
    if (!edicion.guardarLocal(id, cambios)) throw new Error("No se pudo guardar en este dispositivo.");
    if (!edicion.github()) return "Guardado en este celular. Para que le llegue a todos, conectá GitHub en Ajustes.";
    await publicar((todas) => ({ ...todas, [id]: cambios }), `Editar ficha ${id}`);
    return "Guardado y publicado. Los demás lo ven en un par de minutos.";
  },
  async restaurar(id) {
    edicion.restaurarLocal(id);
    if (edicion.github()) await publicar(({ [id]: _, ...resto }) => resto, `Restaurar ficha ${id}`);
  },
  probarGithub: () => gh("GET", "").then(() => true),
  exportar() {
    const blob = new Blob([JSON.stringify({ app: "RadioGuía", fecha: new Date().toISOString(), ediciones }, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `radioguia-ediciones-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};

// ---- GitHub: API de contenidos, con un token que queda guardado solo en este dispositivo ----
const RUTA = "datos/ediciones.json";
async function gh(metodo, ruta, cuerpo) {
  const c = edicion.github();
  const url = `https://api.github.com/repos/${c.repo}/contents/${ruta || RUTA}${metodo === "GET" ? `?ref=${encodeURIComponent(c.rama || "main")}` : ""}`;
  const r = await fetch(url, { method: metodo, headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json" }, body: cuerpo && JSON.stringify(cuerpo) });
  if (!r.ok) throw new Error(r.status === 401 ? "El token de GitHub no es válido o venció." : r.status === 404 ? "No encontré el repositorio o el archivo en GitHub." : `GitHub respondió ${r.status}.`);
  return r.json();
}
const aBase64 = (txt) => btoa(String.fromCharCode(...new TextEncoder().encode(txt)));
const deBase64 = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, "")), (ch) => ch.charCodeAt(0)));
async function publicar(cambiar, mensaje) {
  const c = edicion.github();
  const actual = await gh("GET");
  const todas = JSON.parse(deBase64(actual.content)).ediciones || {};
  const nuevo = JSON.stringify({ ediciones: cambiar(todas) }, null, 2) + "\n";
  await gh("PUT", "", { message: mensaje, content: aBase64(nuevo), sha: actual.sha, branch: c.rama || "main" });
}

async function hash(txt) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("radioguia:" + txt));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---- formulario ----
const DIRS = [["perpendicular", "Perpendicular"], ["cefálico", "Cefálico"], ["caudal", "Caudal"], ["horizontal", "Horizontal"], ["angulado", "Angulado"], ["variable", "Variable"], ["sin-dato", "Sin dato"]];
const FACT = [["ri", "Tamaño del RI"], ["dfri", "DFRI"], ["respiracion", "Respiración"], ["parrilla", "Parrilla (Bucky)"], ["colimacion", "Colimación"]];
const lineas = (arr) => (arr || []).join("\n");
// criterios: una línea "## Título" abre un grupo; las siguientes son sus ítems
const criteriosATexto = (cr) => (cr || []).map(([t, it]) => `## ${t}\n${it.join("\n")}`).join("\n\n");
function textoACriterios(txt) {
  const out = [];
  for (const l of txt.split("\n").map((x) => x.trim()).filter(Boolean)) {
    if (l.startsWith("##")) out.push([l.replace(/^#+\s*/, ""), []]);
    else { if (!out.length) out.push(["Criterios", []]); out.at(-1)[1].push(l); }
  }
  return out;
}

export function vistaEditar(p, volver) {
  const campo = (name, label, val, area) => `<label class="ed-campo"><span>${label}</span>${area
    ? `<textarea name="${name}" rows="${Math.max(3, String(val || "").split("\n").length + 1)}">${esc(val || "")}</textarea>`
    : `<input name="${name}" type="text" value="${esc(val || "")}" autocomplete="off">`}</label>`;
  return cabecera({ titulo: "Editar ficha", sub: p.nombre, atras: volver }) + `
  <main class="wrap">
    <form id="form-edicion" data-id="${esc(p.id)}" class="edicion">
      <section class="panel"><h2>Factores técnicos</h2>${FACT.map(([k, n]) => campo("f-" + k, n, p.factores?.[k])).join("")}</section>
      <section class="panel"><h2>Rayo central</h2>
        <label class="ed-campo"><span>Dirección</span><select name="rc-direccion">${DIRS.map(([v, t]) => `<option value="${v}" ${p.rc?.direccion === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        ${campo("rc-angulo", "Ángulo (si está angulado)", p.rc?.angulo)}
        ${campo("rc-texto", "Descripción", p.rc?.texto, true)}
      </section>
      <section class="panel"><h2>Posición del paciente</h2><p class="ayuda">Un paso por renglón.</p>${campo("posicion", "Pasos", lineas(p.posicion), true)}</section>
      <section class="panel"><h2>Criterios de evaluación</h2><p class="ayuda">Un criterio por renglón. Para un subtítulo, empezá el renglón con ## (por ejemplo: ## Posicionamiento).</p>${campo("criterios", "Criterios", criteriosATexto(p.criterios), true)}</section>
      <section class="panel"><h2>Notas</h2>${campo("notas", "Una nota por renglón", lineas(p.notas), true)}</section>
      <div class="ed-acciones">
        <button type="submit" class="pri">Guardar cambios</button>
        ${edicion.editadaEn(p) ? `<button type="button" data-restaurar="${esc(p.id)}">Volver al original</button>` : ""}
      </div>
      <p class="ed-estado" id="ed-estado" role="status"></p>
      <p class="pie">${edicion.github() ? "Al guardar se publica en GitHub para todos." : "Los cambios se guardan en este celular. Conectá GitHub en Ajustes para publicarlos."}</p>
    </form>
  </main>`;
}

export function leerFormulario(form) {
  const v = (n) => form.elements[n]?.value.trim() ?? "";
  const lista = (n) => v(n).split("\n").map((x) => x.trim()).filter(Boolean);
  const factores = Object.fromEntries(FACT.map(([k]) => [k, v("f-" + k) || null]));
  return {
    factores,
    rc: { direccion: v("rc-direccion"), angulo: v("rc-angulo") || undefined, texto: v("rc-texto") },
    posicion: lista("posicion"),
    criterios: textoACriterios(v("criterios")),
    notas: lista("notas"),
  };
}

export function panelEdicionAjustes() {
  if (!edicion.activa()) return `<section class="panel"><h2>Modo edición</h2>
    <p>Para completar o corregir fichas desde este celular. ${edicion.tieneClave() ? "Ingresá tu clave." : "La primera vez, la clave que escribas queda como tu clave."}</p>
    <form id="form-clave" class="ed-clave"><input name="clave" type="password" autocomplete="current-password" placeholder="Clave" aria-label="Clave de edición"><button class="pri" type="submit">Entrar</button></form>
    <p class="ed-error" id="clave-error" hidden>Clave incorrecta.</p></section>`;
  const n = edicion.cantidad();
  return `<section class="panel"><h2>Modo edición activado</h2>
    <p>En cada ficha aparece el botón «Editar». ${n ? `Tenés ${n} ${n === 1 ? "ficha editada" : "fichas editadas"} en este celular.` : "Todavía no editaste ninguna ficha."}</p>
    <div class="opciones">${n ? `<button class="opcion" data-exportar>Exportar cambios</button>` : ""}<button class="opcion" data-salir-edicion>Salir del modo edición</button></div></section>
  <section class="panel"><h2>Publicar en GitHub</h2>
    <p>${edicion.github() ? `Conectado a <b>${esc(edicion.github().repo)}</b>. Lo que guardes se publica para todos.` : "Con esto, lo que edites le llega a todos los que usan la app."}</p>
    <form id="form-github" class="edicion">
      <label class="ed-campo"><span>Repositorio (usuario/nombre)</span><input name="repo" value="${esc(edicion.github()?.repo || "")}" placeholder="usuario/radioguia" autocomplete="off" autocapitalize="off"></label>
      <label class="ed-campo"><span>Token de GitHub</span><input name="token" type="password" value="${esc(edicion.github()?.token || "")}" autocomplete="off"></label>
      <div class="ed-acciones"><button class="pri" type="submit">${edicion.github() ? "Actualizar" : "Conectar"}</button>${edicion.github() ? `<button type="button" data-desconectar>Desconectar</button>` : ""}</div>
      <p class="ed-estado" id="gh-estado" role="status"></p>
    </form></section>`;
}
