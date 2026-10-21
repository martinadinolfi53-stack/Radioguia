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

def figura(id, pose, dir=(0, 0, -1), arriba=(0, 1, 0), huesos=(), region=None, cortes=(), puntos=(), px=800,
           muestras=16, con_ropa=None, fundido=0.02, horizontal=None, vertical=None):
    """
    pose: posturas.Pose. dir: hacia dónde mira la cámara (= sentido del rayo en una vista desde el tubo), en ejes del cuerpo.
    huesos: segmentos cuyos huesos se dibujan "por transparencia". region: segmentos de piel a dibujar (None = cuerpo entero).
    cortes: [(punto, dirección[, distancia m])] conservar solo lo que queda hacia dirección desde el plano ubicado a esa distancia
      del punto en sentido contrario (p. ej. ('codo_R', 'distal', 0.14): brazo cortado 14 cm por encima del codo); el borde se desvanece.
    puntos: nombres de puntos de referencia (puntos.py) que se proyectan en la imagen.
    horizontal: (A, B) gira la vista para que la línea del punto A al B quede horizontal, de izquierda a derecha (reemplaza arriba).
    vertical: (A, B) idem, con B arriba de A.
    """
    c = cuerpo(); c.posar(pose); pts = Puntos(c)
    huesos = _con_dedos(huesos); region = None if region is None else _con_dedos(region)
    Pp = c.piel_posada(); I = c.piel_I
    if horizontal or vertical:
        f = np.asarray(dir, float); f /= np.linalg.norm(f)
        A_, B_ = horizontal or vertical
        v = pts.posado(B_) - pts.posado(A_); v -= f * (v @ f); v /= np.linalg.norm(v)
        arriba = np.cross(-f, v) if horizontal else v
    def lados(P): return np.stack([np.linalg.norm(P[I[:, a]] - P[I[:, b]], axis=1) for a, b in ((0, 1), (1, 2), (2, 0))], 1).max(1)
    dom = np.array(c.nombres_w)[c.W.argmax(1)]
    # (en la mano no: ahí los pliegues entre dedos se estiran sin ser puentes falsos)
    mano = np.char.startswith(dom.astype(str), 'f') | np.char.startswith(dom.astype(str), 'mano')
    I = I[~((lados(Pp) > 2.5 * lados(c.piel_P)) & (lados(Pp) > 0.025)) | mano[I].all(1)]
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
    # apoyo: punto más bajo del dibujo (donde la figura toca la mesa o el RI en una vista horizontal), y extremos izq./der.
    A2 = np.asarray(out.getchannel('A')) > 128; ys, xs = np.nonzero(A2)
    info['apoyo'] = [float(xs[ys >= ys.max() - 2].mean()), float(ys.max())]
    # silueta gruesa: por cada fila (cada 6 px) el x mínimo y máximo con dibujo
    sil = []
    for y in range(0, A2.shape[0], 6):
        fila = np.nonzero(A2[y])[0]
        if len(fila): sil.append([y, int(fila.min()), int(fila.max())])
    info['silueta'] = sil
    col = []
    for x in range(0, A2.shape[1], 6):
        c_ = np.nonzero(A2[:, x])[0]
        if len(c_): col.append([x, int(c_.min()), int(c_.max())])
    info['columnas'] = col
    out.save(os.path.join(SALIDA, id + '.webp'), quality=80, method=6)
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

def _con_dedos(segs):
    """'mano_X' incluye los segmentos de los dedos de ese lado."""
    segs = list(segs)
    for s in list(segs):
        if s.startswith('mano_'): segs += [k for k in rig.PADRE if k.startswith('f') and k.endswith(s[-2:])]
    return segs

def corte(id, pose, punto, normal=None, arriba=(0, 1, 0), huesos=(), region=None, puntos=(), desde_normal=True):
    """Corte transversal (vector): interseca piel y huesos con un plano y guarda render/<id>.json con polígonos en cm,
    vistos desde el lado hacia el que apunta normal (desde_normal=True; p. ej. normal = hacia distal -> visto desde la punta
    de los dedos) o desde el lado opuesto.
    punto: nombre de punto de referencia, o (A, B, t): el plano pasa por A + t (B - A) y es perpendicular a A->B
    (en ese caso normal = B - A si no se da). arriba: vector del cuerpo que queda hacia arriba en el dibujo."""
    c = cuerpo(); c.posar(pose); pts = Puntos(c)
    huesos = _con_dedos(huesos); region = None if region is None else _con_dedos(region)
    if isinstance(punto, str): p0 = pts.posado(punto)
    else:
        A, Bp, tt = pts.posado(punto[0]), pts.posado(punto[1]), punto[2]; p0 = A + tt * (Bp - A)
        if normal is None: normal = Bp - A
    n = np.asarray(normal, float); n /= np.linalg.norm(n)
    up = np.asarray(arriba, float); up = up - n * (up @ n); up /= np.linalg.norm(up)
    f = -n if desde_normal else n            # sentido en que se mira
    x = np.cross(up, -f)                     # derecha del dibujo (misma convención que render_obj)
    def plano2d(P): Q = P - p0; return np.stack([Q @ x, -(Q @ up)], 1) * 100   # cm, y hacia abajo
    def lazos(P, I):
        d = (P - p0) @ n; s = d > 0
        cruza = I[(s[I].sum(1) == 1) | (s[I].sum(1) == 2)]
        if not len(cruza): return []
        seg = {}
        def pe(a, b):
            k = (min(a, b), max(a, b)); return k
        pos = {}
        for tri in cruza:
            es = [pe(tri[i], tri[(i + 1) % 3]) for i in range(3)]
            es = [e for e in es if s[e[0]] != s[e[1]]]
            if len(es) != 2: continue
            for e in es:
                if e not in pos:
                    a, b = e; u = d[a] / (d[a] - d[b]); pos[e] = P[a] + u * (P[b] - P[a])
            seg.setdefault(es[0], []).append(es[1]); seg.setdefault(es[1], []).append(es[0])
        out, visto = [], set()
        for e0 in seg:
            if e0 in visto: continue
            lazo = [e0]; visto.add(e0); prev = None; cur = e0
            while True:
                nx = [e for e in seg[cur] if e != prev and e not in visto]
                if not nx: break
                prev, cur = cur, nx[0]; visto.add(cur); lazo.append(cur)
            if len(lazo) >= 2: out.append(plano2d(np.array([pos[e] for e in lazo])).round(2).tolist())
        return out
    Pp = c.piel_posada(); I = c.piel_I
    dom = np.array(c.nombres_w)[c.W.argmax(1)]
    if region is not None: I = I[np.isin(dom[I], list(region)).any(1)]
    # piel: quedarse con los contornos externos (la malla tiene capas casi superpuestas) y descartar trocitos
    L = [np.array(l) for l in lazos(Pp, I)]
    area = lambda q: abs(np.dot(q[:, 0], np.roll(q[:, 1], 1)) - np.dot(q[:, 1], np.roll(q[:, 0], 1))) / 2
    per = lambda q: np.linalg.norm(q - np.roll(q, 1, 0), axis=1).sum()
    L = [q for q in L if area(q) > 0.03 * per(q) ** 2]          # fuera astillas (contornos abiertos cerrados a la fuerza)
    L = sorted(L, key=area, reverse=True); L = [q for q in L if area(q) > 0.05 * area(L[0])] if L else []
    L = [q for q in L if np.linalg.norm(q.mean(0)) < 8]          # solo lo que está cerca del punto del corte (no otras partes)
    externos = []
    for q in L:
        if not any(_dentro(q.mean(0), e) for e in externos): externos.append(q)
    info = {'piel': [q.tolist() for q in externos], 'huesos': {}}
    # huesos: el corte de una diáfisis es casi convexo; la envolvente convexa evita contornos abiertos por mallas imperfectas
    for k, (P, Ih) in c.huesos_posados().items():
        if c.huesos[k]['seg'] not in huesos: continue
        Q = np.vstack([np.array(l) for l in lazos(P, Ih)] or [np.zeros((0, 2))])
        if len(Q) >= 3: info['huesos'][c.huesos[k]['nombre']] = [Q[ConvexHull(Q).vertices].round(2).tolist()]
    info['puntos'] = {k: plano2d(pts.posado(k)[None])[0].round(2).tolist() for k in puntos}
    todo = np.vstack([np.array(l) for l in info['piel']]) if info['piel'] else np.zeros((1, 2))
    info['apoyo'] = [float(todo[todo[:, 1].argmax(), 0]), float(todo[:, 1].max())]
    info['unidad'] = 'cm'
    json.dump(info, open(os.path.join(SALIDA, id + '.json'), 'w'))
    return {k: (len(v) if k != 'puntos' else v) for k, v in info.items()}

def _dentro(p, q):
    """punto p dentro del polígono q (regla par-impar)"""
    x, y = p; a = q; b = np.roll(q, -1, 0)
    c = ((a[:, 1] > y) != (b[:, 1] > y)) & (x < (b[:, 0] - a[:, 0]) * (y - a[:, 1]) / (b[:, 1] - a[:, 1] + 1e-12) + a[:, 0])
    return c.sum() % 2 == 1
