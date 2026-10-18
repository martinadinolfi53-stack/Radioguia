// Controles de integridad de los datos. Lo usan la app (aviso en consola) y herramientas/validar.mjs.
const CATEGORIAS = ["AP", "PA", "Perfil", "Oblicuas", "Axiales", "Tangenciales", "Decúbitos", "Métodos especiales"];
const DIRECCIONES = ["perpendicular", "cefálico", "caudal", "horizontal", "angulado", "variable", "sin-dato"];
const ESTADOS = ["pendiente-revision", "validado"];

export function validarDatos({ capitulos, regiones, proyecciones, glosario }) {
  const out = [];
  const ids = new Set(), regionIds = new Set();
  for (const r of regiones) {
    if (regionIds.has(r.id)) out.push(`Región repetida: ${r.id}`);
    regionIds.add(r.id);
  }
  for (const p of proyecciones) {
    const q = `[${p.id || "sin id"}]`;
    if (!p.id) out.push(`${q} falta id`);
    if (ids.has(p.id)) out.push(`${q} id repetido`);
    ids.add(p.id);
    if (!regionIds.has(p.region)) out.push(`${q} región inexistente: ${p.region}`);
    if (!p.nombre) out.push(`${q} falta nombre`);
    if (!Array.isArray(p.categoria) || !p.categoria.length) out.push(`${q} falta categoría`);
    else p.categoria.forEach((c) => CATEGORIAS.includes(c) || out.push(`${q} categoría desconocida: ${c}`));
    if (![null, "R", "E"].includes(p.tipo)) out.push(`${q} tipo debe ser R (rutina), E (especial) o null (el libro no lo marca)`);
    if (!p.factores) out.push(`${q} faltan factores técnicos`);
    else // null = el manual no indica ese dato para esa proyección (la ficha lo muestra así)
      ["ri", "dfri", "respiracion"].forEach((k) => (p.factores[k] || p.factores[k] === null) || out.push(`${q} factores: falta ${k} (usar null si el manual no lo indica)`));
    if (!p.rc?.texto) out.push(`${q} falta el rayo central`);
    if (p.rc && !DIRECCIONES.includes(p.rc.direccion)) out.push(`${q} dirección de RC desconocida: ${p.rc.direccion}`);
    if (p.rc && ["cefálico", "caudal", "angulado"].includes(p.rc.direccion) && !p.rc.angulo) out.push(`${q} RC angulado sin ángulo`);
    if (!p.posicion?.length) out.push(`${q} falta posición del paciente`);
    if (!Array.isArray(p.criterios)) out.push(`${q} faltan criterios de evaluación (usar [] si el manual no los trae)`);
    if (!p.fuente?.paginas?.length) out.push(`${q} falta referencia de página`);
    if (!ESTADOS.includes(p.estado)) out.push(`${q} estado de validación desconocido: ${p.estado}`);
    (p.glosario || []).forEach((t) => glosario.some((g) => g.id === t) || out.push(`${q} término de glosario inexistente: ${t}`));
  }
  const terminos = new Set();
  for (const g of glosario) {
    if (terminos.has(g.id)) out.push(`Glosario: id repetido ${g.id}`);
    terminos.add(g.id);
    if (!g.formas?.length) out.push(`Glosario ${g.id}: faltan formas`);
    if (!["pendiente", "aprobado"].includes(g.estado)) out.push(`Glosario ${g.id}: estado desconocido`);
  }
  return out;
}
