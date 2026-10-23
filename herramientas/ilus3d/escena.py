# Renderiza una figura (cuerpo posado, estilo dibujo plano) y guarda render/<id>.webp + render/<id>.json
# (puntos de referencia proyectados en píxeles de la imagen, y píxeles por centímetro).
import os, re, sys, json, subprocess, pickle, numpy as np
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import rig
from puntos import Puntos
from scipy.spatial import ConvexHull
from PIL import Image, ImageChops, ImageFilter

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
    m = np.isin(dom, ['pelvis', 'muslo_R', 'muslo_L', 'L5']) & (R[:, 1] > 0.72) & (R[:, 1] < 0.98)
    Q = Pp[m]; h = ConvexHull(Q); cen = Q.mean(0)
    return Q + (Q - cen) / np.linalg.norm(Q - cen, axis=1, keepdims=True) * 0.004, h.simplices

def _obj(ruta, partes):
    with open(ruta, 'w') as f:
        vo = 1; to = 1
        for nombre, datos in partes:
            P, I = datos[:2]; uv = datos[2] if len(datos) > 2 else None
            f.write(f'o {nombre}\n'); f.writelines('v %.5f %.5f %.5f\n' % tuple(v) for v in P)
            if uv is not None:
                f.writelines('vt %.5f %.5f\n' % tuple(t) for t in uv)
                f.writelines('f ' + ' '.join(f'{i + vo}/{i + to}' for i in t) + '\n' for t in I); to += len(uv)
            else: f.writelines('f ' + ' '.join(str(i + vo) for i in t) + '\n' for t in I)
            vo += len(P)

TAPADO = 0.006      # m: un hueso con más de esto de piel de OTRA parte delante (otro dedo, la palma) se dibuja tenue
def _grupo(seg):
    """parte del cuerpo para decidir si una piel tapa a un hueso: cada dedo es una parte (f1m, f1a… -> dedo1), la palma otra"""
    seg = str(seg)
    if re.match(r'f\d', seg): return 'dedo' + seg[1]
    if seg.startswith('dedos_pie'): return 'dedospie'
    if re.match(r'(cubito|radio|antebrazo)_[RL]$', seg): return 'antebrazo' + seg[-2:]
    return seg.rsplit('_', 1)[0] if seg.endswith(('_R', '_L')) else seg

def figura(id, pose, dir=(0, 0, -1), arriba=(0, 1, 0), huesos=(), region=None, cortes=(), puntos=(), px=800,
           muestras=16, con_ropa=None, fundido=0.02, horizontal=None, vertical=None, suavizar=0, capas=False, cara=False,
           avatar=False):
    """
    pose: posturas.Pose. dir: hacia dónde mira la cámara (= sentido del rayo en una vista desde el tubo), en ejes del cuerpo.
    huesos: segmentos cuyos huesos se dibujan "por transparencia". region: segmentos de piel a dibujar (None = cuerpo entero).
    cortes: [(punto, dirección[, distancia m])] conservar solo lo que queda hacia dirección desde el plano ubicado a esa distancia
      del punto en sentido contrario (p. ej. ('codo_R', 'distal', 0.14): brazo cortado 14 cm por encima del codo); el borde se desvanece.
    puntos: nombres de puntos de referencia (puntos.py) que se proyectan en la imagen.
    horizontal: (A, B) gira la vista para que la línea del punto A al B quede horizontal, de izquierda a derecha (reemplaza arriba).
    vertical: (A, B) idem, con B arriba de A.
    cara: pelo (malla de otro color sobre el cuero cabelludo) y puntos de ojos, cejas y boca del lado que mira a la cámara,
      para que se entienda si el paciente está de frente (se ven los ojos) o de espaldas (se ve la nuca).
    """
    avatar = avatar or os.environ.get('AVATAR') == '1'     # AVATAR=1: todas las figuras con el avatar realista
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
    # en la axila sí se conserva la piel estirada: forma los pliegues axilares (pectoral y dorsal) al separar el brazo
    # (solo la que sigue cerca de la cabeza humeral: al rotar el brazo, esa piel puede quedar estirada hacia abajo)
    cen0 = c.piel_P[I].mean(1)
    axila = np.zeros(len(I), bool)
    for s_ in 'RL': axila |= (np.linalg.norm(cen0 - c.C['brazo_' + s_], axis=1) < 0.09) & (np.linalg.norm(Pp[I].mean(1) - pts.posado('cabeza_humero_' + s_), axis=1) < 0.12)
    I = I[~((lados(Pp) > 2.5 * lados(c.piel_P)) & (lados(Pp) > 0.025)) | mano[I].all(1) | axila]
    # puentes entre el brazo y el tronco (en reposo el brazo toca el costado): triángulos que mezclan vértices del brazo y del
    # tronco y que se estiran al separar el brazo
    ds = dom.astype(str); brazo = np.char.startswith(ds, 'brazo') | np.char.startswith(ds, 'cubito') | np.char.startswith(ds, 'radio') | mano
    tronco = np.char.startswith(ds, 'cintura') | np.char.startswith(ds, 'muslo') | np.isin(ds, ['torax', 'L1', 'L2', 'L3', 'L4', 'L5', 'pelvis'])
    cen0 = c.piel_P[I].mean(1); axila = np.zeros(len(I), bool)
    for s_ in 'RL': axila |= (np.linalg.norm(cen0 - c.C['brazo_' + s_], axis=1) < 0.09) & (np.linalg.norm(Pp[I].mean(1) - pts.posado('cabeza_humero_' + s_), axis=1) < 0.12)
    mezcla = brazo[I].any(1) & tronco[I].any(1) & ~axila
    I = I[~(mezcla & (lados(Pp) > 1.15 * lados(c.piel_P)))]
    if region is not None: I = I[np.isin(dom[I], list(region)).all(1)]
    I = _sin_fragmentos(I, len(Pp))
    planos = []
    for corte in cortes:
        nombre_p, d = corte[:2]; off = corte[2] if len(corte) > 2 else 0
        n = _dir(c, pts, d, nombre_p); p = pts.posado(nombre_p) - n * off; planos.append((p, n))
        I = I[((Pp[I].mean(1) - p) @ n) > -0.002]
    I = _sin_fragmentos(I, len(Pp))
    partes = [('piel', (Pp, I))]
    if avatar:
        # avatar realista: reemplaza la piel del modelo (que sigue sirviendo para el encuadre y los puntos); mismos cortes
        import avatar as _av
        partes = []
        for nombre, V, F, uv in _av.posado(c):
            for p, n in planos: F = F[((V[F].mean(1) - p) @ n) > -0.002]
            if len(F): partes.append((nombre, (V, F, uv)))
        con_ropa = False; cara = False
    if capas:     # copia de la piel separada por partes, solo para la pasada de profundidad (cada parte con su número)
        G = {}; gid = lambda seg: G.setdefault(_grupo(seg), len(G) + 1)
        gf = np.array([gid(x) for x in dom[I[:, 0]]])
        for g_ in np.unique(gf): partes.append((f'zp_{g_}__{g_}', (Pp, I[gf == g_])))
    if cara:
        V, F, rp = _rasgos(c, pts, Pp, I, dir)
        for p, n in planos: F = F[((V[F].mean(1) - p) @ n) > 0]
        if len(F): partes.append(('pelo', (V, F)))
        puntos = list(puntos) + list(rp.items())
    if con_ropa is None: con_ropa = region is None or bool(set(region) & {'pelvis', 'muslo_R', 'muslo_L'})
    if con_ropa:
        V, F = ropa(c, Pp)
        for p, n in planos: F = F[((V[F].mean(1) - p) @ n) > 0]
        partes.append(('ropa', (V, F)))
    for k, (P, Ih) in c.huesos_posados().items():
        if c.huesos[k]['seg'] not in huesos: continue
        for p, n in planos: Ih = Ih[((P[Ih].mean(1) - p) @ n) > -0.002]
        if len(Ih): partes.append(('hueso_' + k + (f'__{gid(c.huesos[k]["seg"])}' if capas else ''), (P, Ih)))
    obj = os.path.join(CACHE, id + '.obj'); _obj(obj, partes)
    usados = Pp[np.unique(I)]
    proy = {(k[0] if isinstance(k, tuple) else k): list(map(float, k[1])) if isinstance(k, tuple) else pts.posado(k).tolist() for k in puntos}     # (nombre, xyz): punto libre
    # suavizar: radio en px del suavizado de la silueta, solo cerca de las axilas (a menos de 15 cm de la cabeza humeral);
    # (radio, cm[, lados]) cambia esa distancia y elige la axila ('R', 'L')
    for s_ in 'RL': proy['_axila' + s_] = pts.posado('cabeza_humero_' + s_).tolist()
    for i, (p, n) in enumerate(planos): proy[f'_corte{i}'] = p.tolist(); proy[f'_corte{i}n'] = (p + n * 0.05).tolist()
    if avatar:
        usados = np.concatenate([d[0][np.unique(d[1])] for n_, d in partes if n_.startswith('av_')])
    spec = dict(obj=obj, salida=os.path.join(CACHE, id), dir=list(map(float, dir)), arriba=list(map(float, arriba)), realista=avatar,
                encuadre=[usados.min(0).tolist(), usados.max(0).tolist()] + usados[::40].tolist() + _extremos(usados, dir, arriba), px=px, muestras=muestras, puntos=proy, capas=capas)
    sp = os.path.join(CACHE, id + '-spec.json'); json.dump(spec, open(sp, 'w'))
    r = subprocess.run([sys.executable, os.path.join(AQUI, 'render_obj.py'), sp], capture_output=True, text=True)
    if r.returncode or 'Traceback' in r.stderr: raise RuntimeError(r.stderr[-3000:])
    info = json.load(open(os.path.join(CACHE, id + '.json')))
    p = Image.open(spec['salida'] + '-piel.png').convert('RGBA'); h = Image.open(spec['salida'] + '-hueso.png').convert('RGBA')
    ax_ = [info['puntos'].pop('_axila' + s_) for s_ in 'RL']
    p = _tapar_agujeros(p, zonas=[(q, 12 * info['pxm'] / 100) for q in ax_])
    if suavizar:
        r_, zc, ld = (tuple(suavizar) + ('RL',))[:3] if isinstance(suavizar, tuple) else (suavizar, 15, 'RL')
        p = _suavizar_silueta(p, r_, [(q, zc * info['pxm'] / 100) for q, s_ in zip(ax_, 'RL') if s_ in ld])
    al = ImageChops.multiply(h.getchannel('A'), p.getchannel('A'))
    if capas:
        # capas: los huesos que quedan detrás de otra parte de la piel (p. ej. el pulgar bajo la palma) se dibujan tenues, y los
        # contornos de la piel (también los internos, dedo sobre dedo) van por encima de los huesos
        zp, zh = (np.load(spec['salida'] + f'-{n}.npy') for n in ('zpiel', 'zhueso'))
        gp, gh = np.rint(zp[..., 1] * 63), np.rint(zh[..., 1] * 63)
        tapado = ((zh[..., 0] - zp[..., 0]) * 4 > TAPADO) & (gp != gh) & (gp > 0) & (gh > 0)
        a_ = np.asarray(al, float); a_[tapado] *= 0.35; al = Image.fromarray(a_.astype(np.uint8))
    if avatar: al = Image.fromarray((np.asarray(al, float) * 0.85).astype(np.uint8))     # huesos apenas translúcidos sobre la piel realista
    out = Image.new('RGBA', p.size, (0, 0, 0, 0)); out.alpha_composite(p); hh = h.copy(); hh.putalpha(al); out.alpha_composite(hh)
    if capas:
        ln = Image.open(spec['salida'] + '-lineas.png').convert('RGBA')
        la = np.asarray(ln.getchannel('A'), float) * (np.asarray(p.getchannel('A')) > 0)
        # contornos internos solo en mano y dedos (en antebrazo y brazo serían pliegues sueltos de la malla)
        ids = [v for k, v in G.items() if k.startswith(('dedo', 'mano'))]
        m_ = Image.fromarray((np.isin(gp, ids) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
        la *= np.maximum(np.asarray(m_) > 0, np.asarray(p.getchannel('A')) < 250)
        ln.putalpha(Image.fromarray(la.astype(np.uint8))); out.alpha_composite(ln)
    # desvanecer los bordes cortados
    W_, H_ = out.size; yy, xx = np.mgrid[0:H_, 0:W_]; A = np.asarray(out.getchannel('A'), float)
    ppc = info['pxm'] / 100
    for i in range(len(planos)):
        a = np.array(info['puntos'][f'_corte{i}']); b = np.array(info['puntos'][f'_corte{i}n']); u = b - a
        if np.linalg.norm(u) < 0.5 * 5 * ppc:     # plano casi de frente a la cámara: el corte queda oculto, no se desvanece
            del info['puntos'][f'_corte{i}'], info['puntos'][f'_corte{i}n']; continue
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

def _rasgos(c, pts, Pp, I, dir):
    """pelo y rasgos de la cara. Ejes de la cabeza a partir de los puntos óseos (acompañan cualquier giro de la cabeza)."""
    hc = (pts.posado('meato_auditivo_R') + pts.posado('meato_auditivo_L')) / 2
    up = pts.posado('vertex') - hc; up /= np.linalg.norm(up)
    an = pts.posado('nasion') - hc; an -= up * (an @ up); an /= np.linalg.norm(an)
    lt = np.cross(up, an)                       # hacia la izquierda del paciente
    Q = Pp - hc; u, f, l = Q @ up, Q @ an, Q @ lt
    cab = np.linalg.norm(Q, axis=1) < 0.15
    # cuero cabelludo: por encima de una línea que va de la frente (6 cm sobre el meato) a la nuca (5 cm por debajo)
    pelo = cab & (u > 0.012 + 0.62 * f) & (u > -0.055) & ~((np.abs(l) > 0.055) & (u < 0.035) & (f > -0.035))
    F = I[pelo[I].all(1)]
    n = Q / np.maximum(np.linalg.norm(Q, axis=1, keepdims=True), 1e-6)
    V = Pp + n * 0.004
    # ojos, cejas y boca: el vértice de piel más cercano a cada posición; solo si esa zona mira hacia la cámara
    d = -np.asarray(dir, float) / np.linalg.norm(dir); ref = pts.posado('nasion')
    def piel(q): return Pp[cab][np.argmin(np.linalg.norm(Pp[cab] - q, axis=1))]
    rp = {}
    for nom, lado in (('R', -1), ('L', 1)):
        nrm = np.cos(np.radians(25)) * an + np.sin(np.radians(25)) * lado * lt
        if nrm @ d < 0.2: continue
        oc = ref + lado * 0.032 * lt - 0.012 * up
        rp[f'cara_ojo{nom}0'] = piel(oc - 0.012 * lt); rp[f'cara_ojo{nom}1'] = piel(oc + 0.012 * lt)
        rp[f'cara_ojo{nom}'] = piel(oc)
        for i, k in enumerate((0.012, 0.03, 0.048)): rp[f'cara_ceja{nom}{i}'] = piel(ref + lado * k * lt + (0.008 - 0.004 * i * (i - 1)) * up)
    if an @ d > 0.2:
        bc = (pts.posado('acantion') * 0.45 + pts.posado('menton') * 0.55)
        for i, k in enumerate((-0.022, 0.0, 0.022)): rp[f'cara_boca{i}'] = piel(bc + k * lt + (0.003 if i == 1 else 0) * up)
    return V, F, {k: v.tolist() for k, v in rp.items()}

def _color_piel(rgb):
    """color más frecuente del dibujo (la piel; con short, la mediana de los claros podía dar el celeste de la ropa)"""
    v, k = np.unique(rgb // 4, axis=0, return_counts=True)
    return (v[k.argmax()] * 4 + 2).astype(np.uint8)

def _tapar_agujeros(im, maximo=0.01, zonas=None):
    """Rellena con color piel los agujeros chicos de la silueta (piel compartida entre brazo y tórax que se pierde al separar
    el brazo) y borra las líneas de contorno que los rodean. zonas: [((x, y), radio px)]; solo se tapan los agujeros que caen
    enteros dentro de alguna (cerca de la axila); un hueco real entre el brazo y el tronco llega más lejos y se respeta."""
    from scipy import ndimage
    a = np.asarray(im).copy(); A = a[..., 3] > 128
    hueco = ndimage.binary_fill_holes(A) & ~A
    lab, n = ndimage.label(hueco)
    rgb = a[..., :3].reshape(-1, 3)[A.ravel()]; color = _color_piel(rgb)
    cerca = np.zeros_like(A); yy, xx = np.mgrid[0:A.shape[0], 0:A.shape[1]]; dentro = np.zeros_like(A)
    limpiar = np.zeros_like(A)
    for (qx, qy), rr in (zonas or ()):
        d2 = (xx - qx) ** 2 + (yy - qy) ** 2; dentro |= d2 < rr * rr; limpiar |= d2 < (1.6 * rr) ** 2
    if n:
        tam = ndimage.sum(hueco, lab, range(1, n + 1)); tope = maximo * A.sum()
        ok = tam < tope
        if zonas is not None:
            ok &= ndimage.minimum(dentro, lab, range(1, n + 1)) > 0
        chicos = np.isin(lab, 1 + np.nonzero(ok)[0])
        zona = ndimage.binary_dilation(chicos, iterations=4)
        a[zona, :3] = color; a[zona, 3] = 255
        cerca = ndimage.binary_dilation(chicos, iterations=40)
    # trocitos sueltos de contorno (menos de 150 px) cerca de esos agujeros o de la axila: restos de bordes de la malla
    cerca |= limpiar; A = a[..., 3] > 128; oscuro = cerca & A & (np.abs(a[..., :3].astype(int) - color.astype(int)).sum(2) > 25)
    lo, m = ndimage.label(oscuro, structure=np.ones((3, 3)))
    if m:
        tam = ndimage.sum(oscuro, lo, range(1, m + 1))
        interior = ndimage.binary_erosion(A, iterations=3)
        toca = ndimage.maximum(interior, lo, range(1, m + 1))
        sueltos = np.isin(lo, 1 + np.nonzero((tam < 150) & (toca > 0))[0])
        a[ndimage.binary_dilation(sueltos, iterations=1) & interior, :3] = color
    return Image.fromarray(a)

def _suavizar_silueta(im, r, zonas=()):
    """Silueta sin dientes: cierre y apertura morfológicos de radio r px; donde cambia el borde se rellena (o se borra) la
    piel y se vuelve a trazar el contorno. Sirve donde la malla se rompe al mover mucho una articulación (axila)."""
    from scipy import ndimage
    a = np.asarray(im).copy(); A = a[..., 3] > 128
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]; disco = xx * xx + yy * yy <= r * r
    B = ndimage.binary_opening(ndimage.binary_closing(np.pad(A, r + 2), disco), disco)[r + 2:-r - 2, r + 2:-r - 2]
    B = ndimage.binary_fill_holes(B) | (A & ndimage.binary_erosion(B, iterations=1))
    if zonas:
        yy, xx = np.mgrid[0:A.shape[0], 0:A.shape[1]]; dentro = np.zeros_like(A)
        for (qx, qy), rr in zonas: dentro |= (xx - qx) ** 2 + (yy - qy) ** 2 < rr * rr
        B = np.where(dentro, B, A)
    if (B == A).all(): return im
    rgb = a[..., :3].reshape(-1, 3)[A.ravel()]; color = _color_piel(rgb)
    linea = np.median(rgb[rgb.sum(1) < np.quantile(rgb.sum(1), 0.03)], 0).astype(np.uint8)
    cambio = ndimage.binary_dilation(A ^ B, iterations=6)
    viejo = A & ~ndimage.binary_erosion(A, iterations=4)             # franja del contorno anterior
    a[cambio & viejo & B, :3] = color                                  # borrar el contorno viejo donde cambió el borde
    a[B & ~A, :3] = color; a[B & ~A, 3] = 255; a[A & ~B, 3] = 0
    borde = B & ~ndimage.binary_erosion(B, iterations=2)
    cerca = ndimage.binary_dilation(cambio, iterations=30)
    _limpiar_trazos(a, color, cerca)
    a[borde & cerca, :3] = linea; a[borde & cerca, 3] = 255
    return Image.fromarray(a)

def _limpiar_trazos(a, color, donde, maximo=150):
    """Pinta de color piel los trocitos sueltos de contorno (menos de maximo px, lejos del borde) dentro de la máscara donde."""
    from scipy import ndimage
    lleno = ndimage.binary_erosion(a[..., 3] > 0, iterations=3)
    tenue = donde & lleno & (a[..., 3] < 250); a[tenue, :3] = color; a[tenue, 3] = 255     # trazos semitransparentes
    A = a[..., 3] > 128; raro = donde & A & (np.abs(a[..., :3].astype(int) - color.astype(int)).sum(2) > 25)
    lo, m = ndimage.label(raro, structure=np.ones((3, 3)))
    if not m: return
    tam = ndimage.sum(raro, lo, range(1, m + 1)); interior = ndimage.binary_erosion(A, iterations=3)
    toca = ndimage.maximum(interior, lo, range(1, m + 1))
    sueltos = np.isin(lo, 1 + np.nonzero((tam < maximo) & (toca > 0))[0])
    a[ndimage.binary_dilation(sueltos, iterations=1) & interior, :3] = color

def _alisar_lazo(q, r, k=10):
    """Contorno de piel de un corte sin pliegues ni dientes (donde la malla se dobla en la axila): se rasteriza a k px/cm, se
    cierra y abre con un disco de r cm y se vuelve a trazar como el borde más externo visto desde el centro, cada medio grado."""
    from scipy import ndimage
    from PIL import ImageDraw
    q = np.asarray(q, float); lo = q.min(0) - 2 * r - 1
    W, H = ((q.max(0) - lo + 2 * r + 1) * k).astype(int) + 1
    im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).polygon([tuple(v) for v in (q - lo) * k], fill=1)
    A = np.asarray(im) > 0; rr = int(r * k); yy, xx = np.mgrid[-rr:rr + 1, -rr:rr + 1]; disco = xx * xx + yy * yy <= rr * rr
    A = ndimage.binary_opening(ndimage.binary_closing(A, disco), disco); A = ndimage.binary_fill_holes(A)
    lab, n = ndimage.label(A)
    if n > 1: A = lab == 1 + np.argmax(ndimage.sum(A, lab, range(1, n + 1)))
    c = _borde(A).astype(float)                        # borde exterior, en píxeles, en orden
    g = np.exp(-0.5 * (np.arange(-3 * k, 3 * k + 1) / (0.4 * k)) ** 2); g /= g.sum()
    c = np.stack([np.convolve(np.r_[c[-3 * k:, i], c[:, i], c[:3 * k, i]], g, 'valid') for i in (0, 1)], 1)
    out = c[::max(1, k // 3), ::-1]                    # (fila, col) → (x, y), un punto cada ~3 mm
    return np.array(out) / k + lo

def _borde(A):
    """Seguimiento de Moore del borde exterior de una máscara binaria (una sola pieza): lista de (fila, col) en orden."""
    A = np.pad(A, 1); ys, xs = np.nonzero(A); i = np.lexsort((xs, ys))[0]; ini = (ys[i], xs[i])
    V = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]
    p, d, out = ini, 2, [ini]
    for _ in range(A.size):
        for j in range(8):
            dd = (d + 5 + j) % 8; q = (p[0] + V[dd][0], p[1] + V[dd][1])
            if A[q]: p, d = q, dd; break
        if p == ini: break
        out.append(p)
    return np.array(out) - 1

def _extremos(P, dir, arriba):
    """los puntos de P más a la izquierda, derecha, arriba y abajo en la imagen (para que el encuadre no corte una punta)"""
    f = np.asarray(dir, float); f /= np.linalg.norm(f); u = np.asarray(arriba, float); u = u - f * (u @ f); u /= np.linalg.norm(u)
    x = np.cross(u, -f); px_, py_ = P @ x, P @ u
    return [P[i].tolist() for i in (px_.argmin(), px_.argmax(), py_.argmin(), py_.argmax())]

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

def corte(id, pose, punto, normal=None, arriba=(0, 1, 0), huesos=(), region=None, puntos=(), desde_normal=True, radio=8, alisar=0):
    """Corte transversal (vector): interseca piel y huesos con un plano y guarda render/<id>.json con polígonos en cm,
    vistos desde el lado hacia el que apunta normal (desde_normal=True; p. ej. normal = hacia distal -> visto desde la punta
    de los dedos) o desde el lado opuesto.
    punto: nombre de punto de referencia, o (A, B, t): el plano pasa por A + t (B - A) y es perpendicular a A->B
    (en ese caso normal = B - A si no se da). arriba: vector del cuerpo que queda hacia arriba en el dibujo.
    radio: cm; se descartan los contornos cuyo centro queda más lejos del punto (otras partes del cuerpo)."""
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
    L = [q for q in L if np.linalg.norm(q.mean(0)) < radio]          # solo lo que está cerca del punto del corte (no otras partes)
    externos = []
    for q in L:
        if not any(_dentro(q.mean(0), e) for e in externos): externos.append(q)
    if alisar and externos: externos[0] = _alisar_lazo(externos[0], alisar)
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

def apoyo_cuna(pose, s='R', grados=45, ancho=0.09, lado=None):
    """Puntos 3D (nombre, xyz) del RI y de una cuña bajo la mano posada, para dibujarlos en una vista en perspectiva.
    El RI es horizontal, a la altura del punto más bajo de la mano. La cuña sube 'grados' desde una arista sobre el RI,
    paralela al eje de la mano, hacia el lado del pulgar (lado=+1) o del meñique (-1), tangente a la piel de la palma."""
    c = cuerpo(); c.posar(pose); pts = Puntos(c); Pp = c.piel_posada()
    dom = np.array(c.nombres_w)[c.W.argmax(1)].astype(str)
    m = np.char.startswith(dom, 'mano_' + s) | (np.char.startswith(dom, 'f') & np.char.endswith(dom, '_' + s))
    H = Pp[m]; Y = np.array([0, 1.0, 0]); ib = np.argsort(H[:, 1])[len(H) // 100]; yri = H[ib, 1]     # percentil 1: sin piel suelta del modelo
    a = pts.posado(f'mcf3_{s}') - pts.posado(f'grande_{s}'); a[1] = 0; a /= np.linalg.norm(a)
    r = np.cross(Y, a); r *= np.sign(r @ (pts.posado(f'mcf2_{s}') - pts.posado(f'mcf5_{s}')))     # horizontal, hacia el pulgar
    if lado is not None: r *= lado
    g = np.radians(grados); n = -np.sin(g) * r + np.cos(g) * Y                                       # normal de la cara inclinada
    base = H[ib].copy()
    Hp = Pp[np.char.startswith(dom, 'mano_' + s)]     # la cuña apoya en la palma (los dedos siguen hasta el RI)
    k = max(0.0, (-((Hp - base) @ n)).max() / np.sin(g)); h0 = base + k * r      # arista de la cuña
    s_ = (H - h0) @ a; a0, a1 = s_.min() - 0.01, s_.max() + 0.01
    sube = np.cos(g) * r + np.sin(g) * Y
    out = [(nom, v) for nom, v in (('cA0', h0 + a0 * a), ('cA1', h0 + a1 * a), ('cT0', h0 + a0 * a + ancho * sube), ('cT1', h0 + a1 * a + ancho * sube),
                   ('cB0', h0 + a0 * a + ancho * np.cos(g) * r), ('cB1', h0 + a1 * a + ancho * np.cos(g) * r))]
    m3 = pts.posado(f'mcf3_{s}'); out += [('rc0', m3), ('rc1', m3 + 0.25 * Y)]     # vertical por la 3.ª MCF (dirección del RC)
    # RI: rectángulo alrededor de la mano (24 x 30 con el lado largo a lo largo de la mano)
    cen = H.mean(0); cen[1] = yri     # centrado bajo la mano
    for nom, (u, w) in (('ri0', (-0.15, -0.12)), ('ri1', (0.15, -0.12)), ('ri2', (0.15, 0.12)), ('ri3', (-0.15, 0.12))):
        out.append((nom, cen + u * a + w * r))
    return out

def rect3d(nombre, centro, u, v, ancho, alto):
    """4 puntos libres (nombre0..3) de un rectángulo centrado en centro, con lados a lo largo de u (ancho) y v (alto)."""
    c = np.asarray(centro, float); u = np.asarray(u, float) / np.linalg.norm(u); v = np.asarray(v, float) / np.linalg.norm(v)
    return [(f'{nombre}{i}', c + su * ancho / 2 * u + sv * alto / 2 * v) for i, (su, sv) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1)))]

def ri_detras(pose, d, centro, ancho=0.45, alto=0.55, nombre='b', margen=0.005, debajo_de=None, arriba=(0, 1, 0), radio=None):
    """RI (o bucky) perpendicular al rayo d, apoyado contra el paciente del lado de salida del rayo, centrado en el punto
    centro (proyectado sobre el plano). debajo_de: punto del cuerpo; solo se tiene en cuenta la piel por encima de él."""
    c = cuerpo(); c.posar(pose); pts = Puntos(c); Pp = c.piel_posada()
    d = np.asarray(d, float); d /= np.linalg.norm(d)
    if debajo_de: Pp = Pp[Pp[:, 1] > pts.posado(debajo_de)[1]]
    if radio: Pp = Pp[np.linalg.norm(Pp - pts.posado(centro), axis=1) < radio]     # solo la piel cerca del punto (p. ej. el hombro)
    cen = pts.posado(centro); prof = (Pp @ d).max() + margen; cen = cen + (prof - cen @ d) * d
    v = np.asarray(arriba, float); v = v - d * (v @ d); u = np.cross(v, d)
    return rect3d(nombre, cen, u, v, ancho, alto) + [(nombre + 'c', cen), (nombre + 'n', cen - 0.25 * d)]

def camara(d, az=35, el=30, arriba=(0, 1, 0)):
    """dirección de una cámara en perspectiva de la escena: mira hacia donde va el rayo d, girada az° hacia un costado y
    bajando el° desde arriba (como una foto del libro tomada desde adelante y arriba)."""
    Y = np.asarray(arriba, float); d = np.asarray(d, float); d = d - Y * (d @ Y); d /= np.linalg.norm(d)
    s = np.cross(d, Y); a, e = np.radians(az), np.radians(el)
    return tuple(np.cos(e) * (np.cos(a) * d + np.sin(a) * s) - np.sin(e) * Y)

def mesa(pose, ancho=0.62, largo=1.1, nombre='m'):
    """camilla bajo un paciente en decúbito supino (el modelo está de pie: la camilla es el plano frontal detrás de la espalda)"""
    c = cuerpo(); c.posar(pose); pts = Puntos(c); Pp = c.piel_posada()
    z = Pp[Pp[:, 1] > pts.posado('grande_R')[1], 2].min() - 0.01
    cen = (pts.posado('cabeza_humero_R') + pts.posado('cabeza_humero_L')) / 2; cen = np.array([cen[0], cen[1] - 0.3, z])
    return rect3d(nombre, cen, (1, 0, 0), (0, 1, 0), ancho, largo)
