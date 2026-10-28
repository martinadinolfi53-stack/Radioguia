# Avatar realista (MakeHuman, CC0) vestido sobre el esqueleto de BodyParts3D: la piel del avatar sigue las mismas
# transformaciones por segmento que posturas.Pose le da a rig.Cuerpo, así los huesos, los puntos de referencia, el RI y el
# RC siguen saliendo del modelo anatómico y el paciente que se ve es el avatar.
# Datos de reposo: figura-base/partes.py con GUARDAR=.cache/avatar_reposo.pkl (ver figura-base/LEEME.md).
import os, sys, pickle, numpy as np
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, 'figura-base'))
import pose as P          # esqueleto default de MakeHuman + skinning

# hueso de MakeHuman -> segmento de rig.Cuerpo que lo mueve
def _seg(b):
    s = b[-1] if b[-2:] in ('.L', '.R') else ''
    if b in ('root',) or b.startswith('pelvis'): return 'pelvis'
    if b == 'spine05': return 'L5'
    if b == 'spine04': return 'L3'
    if b == 'spine03': return 'L1'
    if b.startswith(('spine02', 'spine01', 'breast')): return 'torax'
    if b == 'neck01': return 'C6'
    if b == 'neck02': return 'C4'
    if b == 'neck03': return 'C2'
    if b.startswith(('clavicle', 'shoulder01')): return 'cintura_' + s
    if b.startswith('upperarm'): return 'brazo_' + s
    if b.startswith('lowerarm01'): return 'cubito_' + s
    if b.startswith('lowerarm02'): return 'radio_' + s
    if b.startswith(('wrist', 'metacarpal')): return 'mano_' + s
    if b.startswith('finger1-'): return {'1': 'f1m_', '2': 'f1a_', '3': 'f1c_'}[b[8]] + s
    if b.startswith('finger'): return f'f{b[6]}' + {'1': 'a_', '2': 'b_', '3': 'c_'}[b[8]] + s
    if b.startswith('upperleg'): return 'muslo_' + s
    if b.startswith('lowerleg'): return 'pierna_' + s
    if b.startswith('foot'): return 'pie_' + s
    if b.startswith('toe'): return 'dedos_pie_' + s
    return 'cabeza'      # cabeza, mandíbula, ojos, lengua, músculos de la cara
# articulación del avatar (cabeza del hueso) que corresponde al centro de cada segmento del modelo anatómico
REF = {'pelvis': 'root', 'L5': 'spine05', 'L1': 'spine03', 'C6': 'neck01', 'cabeza': 'head'}
for s in 'RL':
    REF.update({f'cintura_{s}': f'clavicle.{s}', f'brazo_{s}': f'upperarm01.{s}', f'cubito_{s}': f'lowerarm01.{s}',
                f'mano_{s}': f'wrist.{s}', f'muslo_{s}': f'upperleg01.{s}', f'pierna_{s}': f'lowerleg01.{s}', f'pie_{s}': f'foot.{s}'})

_D = None
def _rotar(u, t):
    u = u / np.linalg.norm(u); t = t / np.linalg.norm(t); v = np.cross(u, t); s_ = np.linalg.norm(v)
    if s_ < 1e-9: return np.eye(3)
    return P.rot(v, np.degrees(np.arctan2(s_, u @ t)))
def _retarget(c, V, H):
    """pose de reposo del avatar alineada hueso por hueso con el modelo anatómico: cada segmento largo del avatar se gira
    para apuntar como el del modelo (brazo, antebrazo, mano, muslo, pierna, pie, clavícula) y el antebrazo se gira sobre su
    eje para que la palma mire como en el modelo. Devuelve las matrices globales por hueso."""
    Cc = c.C; nom = c.id_por_nombre
    cen = lambda n: c.huesos[nom[n]]['P'].mean(0)
    obj = {}
    for s in 'RL':
        lado = 'Right' if s == 'R' else 'Left'
        obj[f'clavicle.{s}'] = Cc[f'brazo_{s}'] - Cc[f'cintura_{s}']
        obj[f'upperarm01.{s}'] = Cc[f'cubito_{s}'] - Cc[f'brazo_{s}']
        obj[f'lowerarm01.{s}'] = Cc[f'mano_{s}'] - Cc[f'cubito_{s}']
        obj[f'wrist.{s}'] = Cc[f'f3a_{s}'] - Cc[f'mano_{s}']
        obj[f'upperleg01.{s}'] = Cc[f'pierna_{s}'] - Cc[f'muslo_{s}']
        obj[f'lowerleg01.{s}'] = Cc[f'pie_{s}'] - Cc[f'pierna_{s}']
        obj[f'foot.{s}'] = Cc[f'dedos_pie_{s}'] - Cc[f'pie_{s}']
        obj[f'giro.{s}'] = cen(f'{lado} second metacarpal bone') - cen(f'{lado} fifth metacarpal bone')
    padre = {b: d['parent'] for b, d in P.SK['bones'].items()}
    orden = []
    def vis(b):
        if b in orden: return
        if padre[b]: vis(padre[b])
        orden.append(b)
    for b in padre: vis(b)
    G = {}
    ap = lambda M, p: (M @ np.r_[p, 1])[:3]
    def girar(M0, centro, R):
        T = np.eye(4); T[:3, :3] = R; T[:3, 3] = centro - R @ centro; return T @ M0
    for b in orden:
        M = G[padre[b]] if padre[b] else np.eye(4)
        if b in obj:
            h, t = ap(M, H[b][0]), ap(M, H[b][1]); M = girar(M, h, _rotar(t - h, obj[b]))
        if b.startswith('lowerarm02'):
            s = b[-1]; ax = ap(M, H[b][1]) - ap(M, H[b][0]); ax /= np.linalg.norm(ax)
            k = ap(M, H[f'finger2-1.{s}'][0]) - ap(M, H[f'finger5-1.{s}'][0]); o = obj[f'giro.{s}']
            k -= ax * (k @ ax); o = o - ax * (o @ ax)
            ang = np.degrees(np.arctan2(np.cross(k, o) @ ax, k @ o)); M = girar(M, ap(M, H[b][0]), P.rot(ax, ang))
        G[b] = M
    return G
def _datos(c):
    """reposo del avatar puesto en la posición anatómica del modelo (brazos al costado, palmas adelante) y llevado a su
    escala y lugar: matrices por hueso de MakeHuman = S(segmento) · G_anatómica"""
    global _D
    if _D is not None: return _D
    R = pickle.load(open(os.path.join(AQUI, '.cache', 'avatar_reposo.pkl'), 'rb'))
    V = R['V']; P.V_REPOSO = V; H = P.huesos(V)
    import runpy
    Ga = _retarget(c, V, H)
    J = {b: (Ga[b] @ np.r_[H[b][0], 1])[:3] for b in H}
    # semejanza (escala + traslación) que mejor lleva las articulaciones del avatar a los centros del modelo
    ks = [k for k in REF if k in c.C]
    A = np.array([J[REF[k]] for k in ks]); B = np.array([c.C[k] for k in ks])
    am, bm = A.mean(0), B.mean(0); esc = np.sqrt(((B - bm) ** 2).sum() / ((A - am) ** 2).sum())
    t = bm - esc * am
    # corrección por segmento: lo que le falta a cada articulación para caer en el centro del modelo (se reparte por los pesos)
    off = {k: c.C[k] - (esc * J[REF[k]] + t) for k in ks}
    def off_de(seg):
        if seg in off: return off[seg]
        base = seg.rstrip('_RL')
        for k in off:      # segmentos sin referencia propia (dedos, vértebras): la del segmento más cercano de la cadena
            pass
        p = c.C.get(seg)
        if p is None: return np.zeros(3)
        k = min(off, key=lambda k: np.linalg.norm(c.C[k] - p)); return off[k]
    S = {}
    for b in H:
        seg = _seg(b); M = np.eye(4); M[:3, :3] *= esc; M[:3, 3] = t + off_de(seg); S[b] = M @ Ga[b]
    _D = dict(R=R, H=H, S=S, esc=esc)
    return _D

def _grupo(seg):
    seg = str(seg)
    if seg.startswith(('cubito', 'radio')): return 'antebrazo' + seg[-1]
    if seg.startswith(('mano', 'f')) and seg[-2:] in ('_R', '_L'): return 'mano' + seg[-1]
    if seg.startswith(('pie', 'dedos_pie')): return 'pie' + seg[-1]
    if seg.startswith(('brazo', 'muslo', 'pierna')): return seg
    if seg.startswith(('cabeza', 'C')): return 'cabeza'
    return 'tronco'

def _matrices(c, G):
    D = _datos(c); V = D['R']['V']; n = len(V); A = np.zeros((n, 4, 4)); W = np.zeros(n)
    for b, lst in P.WT.items():
        if b not in G: continue
        idx = np.array([i for i, _ in lst]); w = np.array([x for _, x in lst]); ok = idx < n
        A[idx[ok]] += w[ok, None, None] * G[b]; W[idx[ok]] += w[ok]
    m = W > 1e-6; A[m] /= W[m, None, None]; A[~m] = G['head']
    return A

def ajuste(c):
    """Desplazamiento (en el reposo de MakeHuman) que lleva la piel del avatar a la superficie de la piel de BodyParts3D:
    así el cuerpo que se ve es el del modelo anatómico y los huesos quedan siempre adentro. La cabeza conserva la cara
    del avatar (se ajusta a medias)."""
    import pickle
    from scipy.spatial import cKDTree
    from posturas import Pose
    ruta = os.path.join(AQUI, '.cache', 'avatar_ajuste.pkl')
    if os.path.exists(ruta): return pickle.load(open(ruta, 'rb'))
    D = _datos(c); R = D['R']; V = R['V']
    c.posar(Pose()); A = _matrices(c, {b: c.T.get(_seg(b), c.T['pelvis']) @ M for b, M in D['S'].items()})
    Va = np.einsum('nij,nj->ni', A[:, :3, :3], V) + A[:, :3, 3]
    # superficie de BodyParts3D muestreada (6 puntos por triángulo) con el grupo de cada muestra
    Pb, Ib = c.piel_P, c.piel_I; domb = np.array([_grupo(s) for s in np.array(c.nombres_w)[c.W.argmax(1)]])
    bc = np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1], [1/3, 1/3, 1/3], [.5, .5, 0], [0, .5, .5], [.5, 0, .5]])
    S = np.concatenate([(Pb[Ib] * w[None, :, None]).sum(1) for w in bc]); gS = np.tile(domb[Ib[:, 0]], len(bc))
    # grupo de cada vértice del avatar: segmento del hueso de MakeHuman con más peso
    best = np.full(len(V), -1.0); gv = np.array(['tronco'] * len(V), dtype=object)
    for b, lst in P.WT.items():
        g = _grupo(_seg(b))
        for i, w in lst:
            if i < len(V) and w > best[i]: best[i] = w; gv[i] = g
    T = Va.copy()
    for g in np.unique(gv):
        m = gv == g; ms = gS == g
        if not ms.any(): continue
        T[m] = S[ms][cKDTree(S[ms]).query(Va[m])[1]]
    Dp = T - Va
    peso = np.where(gv == 'cabeza', 0.5, 1.0)
    # suavizado del desplazamiento sobre la malla (Laplaciano): sin escalones entre grupos
    F = R['partes']['piel']; vec = [[] for _ in range(len(V))]
    for q in F:
        for a_ in range(len(q)): vec[q[a_]].append(q[(a_ + 1) % len(q)]); vec[q[a_]].append(q[a_ - 1])
    vec = [np.unique(v) if v else np.array([i]) for i, v in enumerate(vec)]
    for _ in range(25):
        Dp = 0.5 * Dp + 0.5 * np.array([Dp[v].mean(0) for v in vec])
    Vb = Va + Dp * peso[:, None]
    Ai = np.linalg.inv(A)
    Vd = np.einsum('nij,nj->ni', Ai[:, :3, :3], Vb) + Ai[:, :3, 3]
    delta = Vd - V
    pickle.dump(delta, open(ruta, 'wb')); return delta

def segmentos(c):
    """segmento dominante de cada vértice de la piel del avatar (el hueso con más peso), para recortar por región"""
    n = len(_datos(c)['R']['V']); w0 = np.zeros(n); seg = np.full(n, 'cabeza', dtype=object)
    for b, lst in P.WT.items():
        for i, w in lst:
            if i < n and w > w0[i]: w0[i] = w; seg[i] = _seg(b)
    return seg.astype(str)

def posado(c, ajustado=None):
    """partes del avatar posadas como el cuerpo c (después de c.posar): lista de (nombre, P, caras, uv o None).
    ajustado: piel llevada a la forma del cuerpo de BodyParts3D (AVATAR_AJUSTE=1)"""
    if ajustado is None: ajustado = os.environ.get('AVATAR_AJUSTE') == '1'
    D = _datos(c); R = D['R']; V = R['V']
    if ajustado:
        est = (c.T, getattr(c, 'prono', {}), getattr(c, '_pose', {})); delta = ajuste(c); c.T, c.prono, c._pose = est
    else: delta = 0
    G = {}
    for b, M in D['S'].items():
        seg = _seg(b); T = c.T.get(seg, c.T['pelvis'])
        if seg.startswith('radio_') and seg in c.T:
            # la pronosupinación del modelo es un giro del radio alrededor de su eje: el antebrazo del avatar la reparte entre
            # lowerarm01 (nada) y lowerarm02 (todo), como el giro escalonado de rig.piel_posada
            pass
        G[b] = T @ M
    n = len(V); A = np.zeros((n, 4, 4)); W = np.zeros(n)
    for b, lst in P.WT.items():
        if b not in G: continue
        idx = np.array([i for i, _ in lst]); w = np.array([x for _, x in lst]); ok = idx < n
        A[idx[ok]] += w[ok, None, None] * G[b]; W[idx[ok]] += w[ok]
    m = W > 1e-6; A[m] /= W[m, None, None]; A[~m] = G['head']
    pos = lambda Q: np.einsum('nij,nj->ni', A[:, :3, :3], Q) + A[:, :3, 3]
    out = []
    for k, F in R['partes'].items():
        if k == 'pelo': continue      # el rapado va pintado sobre la piel (uv)
        out.append(('av_' + k, pos(R['verts'].get(k, V) + delta), np.asarray(F), R['UV'] if k == 'piel' else None))
    return out
