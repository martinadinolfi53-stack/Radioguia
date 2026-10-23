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
def _datos(c):
    """reposo del avatar puesto en la posición anatómica del modelo (brazos al costado, palmas adelante) y llevado a su
    escala y lugar: matrices por hueso de MakeHuman = S(segmento) · G_anatómica"""
    global _D
    if _D is not None: return _D
    R = pickle.load(open(os.path.join(AQUI, '.cache', 'avatar_reposo.pkl'), 'rb'))
    V = R['V']; P.V_REPOSO = V; H = P.huesos(V)
    import runpy
    anat = runpy.run_path(os.path.join(AQUI, 'figura-base', 'pose_anat.py'))['POSE']
    _, _, Ga, _ = P.aplicar(V, anat)
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

def posado(c):
    """partes del avatar posadas como el cuerpo c (después de c.posar): lista de (nombre, P, caras, uv o None)"""
    D = _datos(c); R = D['R']; V = R['V']
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
        out.append(('av_' + k, pos(R['verts'].get(k, V)), np.asarray(F), R['UV'] if k == 'piel' else None))
    return out
