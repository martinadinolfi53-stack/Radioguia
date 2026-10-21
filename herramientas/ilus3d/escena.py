# Renderiza una figura (cuerpo posado, estilo dibujo plano) y guarda render/<id>.webp + render/<id>.json
# (puntos de referencia proyectados en píxeles de la imagen, y píxeles por centímetro).
import os, sys, json, subprocess, pickle, numpy as np
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import rig
from puntos import Puntos
from scipy.spatial import ConvexHull
from PIL import Image, ImageChops

CACHE = os.path.join(AQUI, '.cache'); os.makedirs(CACHE, exist_ok=True)
SALIDA = os.path.join(AQUI, 'render'); os.makedirs(SALIDA, exist_ok=True)
_C = None
def cuerpo():
    global _C
    if _C is None:
        pk = os.path.join(CACHE, 'cuerpo.pkl')
        if os.path.exists(pk): _C = pickle.load(open(pk, 'rb'))
        else:
            _C = rig.Cuerpo(); _C.pesos_piel(); pickle.dump(_C, open(pk, 'wb'))
    return _C

def ropa(c, Pp):
    """Short de paciente que cubre la pelvis: envolvente convexa de la piel de esa zona, ya posada."""
    R = c.piel_P; dom = np.array(c.nombres_w)[c.W.argmax(1)]
    m = np.isin(dom, ['pelvis', 'muslo_R', 'muslo_L', 'L5', 'L4']) & (R[:, 1] > 0.79) & (R[:, 1] < 1.0)
    Q = Pp[m]; h = ConvexHull(Q); cen = Q.mean(0)
    return Q + (Q - cen) / np.linalg.norm(Q - cen, axis=1, keepdims=True) * 0.004, h.simplices

def _obj(ruta, partes):
    with open(ruta, 'w') as f:
        vo = 1
        for nombre, (P, I) in partes:
            f.write(f'o {nombre}\n'); f.writelines('v %.5f %.5f %.5f\n' % tuple(v) for v in P)
            f.writelines('f %d %d %d\n' % tuple(t + vo) for t in I); vo += len(P)

def figura(id, pose, dir=(0, 0, -1), arriba=(0, 1, 0), huesos=(), region=None, cortes=(), puntos=(), px=1200,
           muestras=16, con_ropa=None, fundido=0.02):
    """
    pose: posturas.Pose. dir: hacia dónde mira la cámara (= sentido del rayo en una vista desde el tubo), en ejes del cuerpo.
    huesos: segmentos cuyos huesos se dibujan "por transparencia". region: segmentos de piel a dibujar (None = cuerpo entero).
    cortes: [(punto, dirección[, distancia m])] conservar solo lo que queda hacia dirección desde el plano ubicado a esa distancia
      del punto en sentido contrario (p. ej. ('codo_R', 'distal', 0.14): brazo cortado 14 cm por encima del codo); el borde se desvanece.
    puntos: nombres de puntos de referencia (puntos.py) que se proyectan en la imagen.
    """
    c = cuerpo(); c.posar(pose); pts = Puntos(c)
    Pp = c.piel_posada(); I = c.piel_I
    def lados(P): return np.stack([np.linalg.norm(P[I[:, a]] - P[I[:, b]], axis=1) for a, b in ((0, 1), (1, 2), (2, 0))], 1).max(1)
    I = I[~((lados(Pp) > 2.5 * lados(c.piel_P)) & (lados(Pp) > 0.025))]
    dom = np.array(c.nombres_w)[c.W.argmax(1)]
    if region is not None: I = I[np.isin(dom[I], list(region)).all(1)]
    I = _sin_fragmentos(I, len(Pp))
    planos = []
    for corte in cortes:
        nombre_p, d = corte[:2]; off = corte[2] if len(corte) > 2 else 0
        n = _dir(c, pts, d, nombre_p); p = pts.posado(nombre_p) - n * off; planos.append((p, n))
        I = I[((Pp[I].mean(1) - p) @ n) > -0.002]
    I = _sin_fragmentos(I, len(Pp))
    partes = [('piel', (Pp, I))]
    if con_ropa is None: con_ropa = region is None or bool(set(region) & {'pelvis', 'muslo_R', 'muslo_L'})
    if con_ropa:
        V, F = ropa(c, Pp)
        for p, n in planos: F = F[((V[F].mean(1) - p) @ n) > 0]
        partes.append(('ropa', (V, F)))
    for k, (P, Ih) in c.huesos_posados().items():
        if c.huesos[k]['seg'] not in huesos: continue
        for p, n in planos: Ih = Ih[((P[Ih].mean(1) - p) @ n) > -0.002]
        if len(Ih): partes.append(('hueso_' + k, (P, Ih)))
    obj = os.path.join(CACHE, id + '.obj'); _obj(obj, partes)
    usados = Pp[np.unique(I)]
    proy = {k: pts.posado(k).tolist() for k in puntos}
    for i, (p, n) in enumerate(planos): proy[f'_corte{i}'] = p.tolist(); proy[f'_corte{i}n'] = (p + n * 0.05).tolist()
    spec = dict(obj=obj, salida=os.path.join(CACHE, id), dir=list(map(float, dir)), arriba=list(map(float, arriba)),
                encuadre=[usados.min(0).tolist(), usados.max(0).tolist()] + usados[::40].tolist(), px=px, muestras=muestras, puntos=proy)
    sp = os.path.join(CACHE, id + '-spec.json'); json.dump(spec, open(sp, 'w'))
    r = subprocess.run([sys.executable, os.path.join(AQUI, 'render_obj.py'), sp], capture_output=True, text=True)
    if r.returncode or 'Traceback' in r.stderr: raise RuntimeError(r.stderr[-3000:])
    info = json.load(open(os.path.join(CACHE, id + '.json')))
    p = Image.open(spec['salida'] + '-piel.png').convert('RGBA'); h = Image.open(spec['salida'] + '-hueso.png').convert('RGBA')
    al = ImageChops.multiply(h.getchannel('A'), p.getchannel('A'))
    out = Image.new('RGBA', p.size, (0, 0, 0, 0)); out.alpha_composite(p); hh = h.copy(); hh.putalpha(al); out.alpha_composite(hh)
    # desvanecer los bordes cortados
    W_, H_ = out.size; yy, xx = np.mgrid[0:H_, 0:W_]; A = np.asarray(out.getchannel('A'), float)
    ppc = info['pxm'] / 100
    for i in range(len(planos)):
        a = np.array(info['puntos'][f'_corte{i}']); b = np.array(info['puntos'][f'_corte{i}n']); u = b - a
        if np.linalg.norm(u) < 1e-6: continue
        u /= np.linalg.norm(u); dist = (xx - a[0]) * u[0] + (yy - a[1]) * u[1]
        A *= np.clip(dist / (fundido * 100 * ppc), 0, 1)
        del info['puntos'][f'_corte{i}'], info['puntos'][f'_corte{i}n']
    out.putalpha(Image.fromarray(A.astype(np.uint8)))
    bb = out.getbbox(); out = out.crop(bb)
    info['puntos'] = {k: [v[0] - bb[0], v[1] - bb[1]] for k, v in info['puntos'].items()}
    info['res'] = list(out.size); info['ppc'] = ppc; del info['pxm']
    out.save(os.path.join(SALIDA, id + '.webp'), quality=82, method=6)
    json.dump(info, open(os.path.join(SALIDA, id + '.json'), 'w'), indent=0)
    out.save(os.path.join(CACHE, id + '.png'))
    return info

def _dir(c, pts, d, ref):
    """dirección de corte: vector, o 'distal'/'proximal' a lo largo del segmento del punto de referencia."""
    if not isinstance(d, str): v = np.asarray(d, float); return v / np.linalg.norm(v)
    seg = pts.definir(ref)[0]
    # eje largo del segmento en reposo (hacia abajo = distal en reposo anatómico), llevado a la pose
    P = c.segs[seg]; a = np.linalg.svd(P - P.mean(0))[2][0]
    if a[1] > 0: a = -a
    a = c.T[seg][:3, :3] @ a
    return a if d == 'distal' else -a

def _sin_fragmentos(I, nv, minimo=0.02):
    """descarta trozos de piel sueltos (componentes conexas con menos del 2 % de los triángulos)."""
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    if not len(I): return I
    e = np.vstack([I[:, [0, 1]], I[:, [1, 2]], I[:, [2, 0]]])
    n, lab = connected_components(coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(nv, nv)), directed=False)
    lt = lab[I[:, 0]]; cuenta = np.bincount(lt, minlength=n)
    return I[cuenta[lt] >= minimo * len(I)]
