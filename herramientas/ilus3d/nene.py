# Paciente pediátrico: el avatar de nene (figura-base/partes.py con EDAD=años, guardado en .cache/avatar_nene.pkl) posado
# con el mismo rig que el adulto, pero con las articulaciones del nene. No hay esqueleto infantil: las fichas pediátricas se
# dibujan sin huesos, y los puntos de referencia salen de las articulaciones y de la piel del nene (PUNTOS, abajo).
# Uso: import nene; nene.activar()  antes de llamar a vistas.tubo / vistas.costado (reemplaza el cuerpo y el avatar).
import os, copy, pickle, numpy as np
import escena, avatar as av
from avatar import P, _seg, _retarget, REF

AQUI = os.path.dirname(os.path.abspath(__file__))
# segmentos del rig sin referencia en avatar.REF -> articulación de MakeHuman (cabeza del hueso) que hace de centro
EXTRA = {'L4': ('spine05', 'spine04'), 'L3': 'spine04', 'L2': ('spine04', 'spine03'), 'torax': 'spine02', 'C7': 'neck01',
         'C5': ('neck01', 'neck02'), 'C4': 'neck02', 'C3': ('neck02', 'neck03'), 'C2': 'neck03', 'C1': 'head'}
for s in 'RL':
    EXTRA.update({f'radio_{s}': f'lowerarm01.{s}', f'rotula_{s}': f'lowerleg01.{s}', f'f1m_{s}': f'finger1-1.{s}',
                  f'f1a_{s}': f'finger1-2.{s}', f'f1c_{s}': f'finger1-3.{s}',
                  f'dedos_pie_{s}': tuple(f'toe{d}-1.{s}' for d in range(1, 6))})
    for d in range(2, 6):
        for k, n in zip('abc', '123'): EXTRA[f'f{d}{k}_{s}'] = f'finger{d}-{n}.{s}'

def activar():
    c0 = escena.cuerpo(); c = copy.deepcopy(c0)
    R = pickle.load(open(os.path.join(AQUI, '.cache', 'avatar_nene.pkl'), 'rb'))
    V = R['V']; P.V_REPOSO = V; H = P.huesos(V)
    Ga = _retarget(c, V, H)                       # miembros del nene apuntando como los del modelo en reposo
    J = {b: (Ga[b] @ np.r_[H[b][0], 1])[:3] for b in H}
    t = c.C['pelvis'] - J['root']                 # el nene, a tamaño real, con la pelvis donde la tiene el adulto
    Mt = np.eye(4); Mt[:3, 3] = t
    S = {b: Mt @ Ga[b] for b in H}
    jj = lambda q: np.mean([J[x] for x in (q if isinstance(q, tuple) else (q,))], 0) + t
    viejo = dict(c.C)
    for k, b in list(REF.items()) + list(EXTRA.items()):
        if k in c.C: c.C[k] = jj(b)
    # el resto de lo que sale de los huesos del adulto (nubes por segmento, ejes de pronación) se traslada con su segmento
    for s, pts in c.segs.items():
        if s in viejo: c.segs[s] = pts + (c.C[s] - viejo[s])
    for k, h in c.huesos.items():
        s = h['seg']
        if s in viejo: h['P'] = h['P'] + (c.C[s] - viejo[s])
    for s in 'RL': c.eje_prono[s] = (jj(f'lowerarm01.{s}'), jj(f'wrist.{s}'))
    # piel del rig = piel del nene en reposo (posada con S), con los pesos de MakeHuman llevados a los segmentos del rig
    n = len(V); A = np.zeros((n, 4, 4)); Wt = np.zeros(n)
    nw = list(c.nombres_w); Wm = np.zeros((n, len(nw)))
    for b, lst in P.WT.items():
        idx = np.array([i for i, _ in lst]); w = np.array([x for _, x in lst]); ok = idx < n
        A[idx[ok]] += w[ok, None, None] * S[b]; Wt[idx[ok]] += w[ok]
        sg = _seg(b)
        if sg not in nw: sg = 'cubito_' + sg[-1] if sg.startswith('radio_') else 'cabeza'
        np.add.at(Wm[:, nw.index(sg)], idx[ok], w[ok])
    m = Wt > 1e-6; A[m] /= Wt[m, None, None]; A[~m] = S['head']
    Vr = np.einsum('nij,nj->ni', A[:, :3, :3], V) + A[:, :3, 3]
    Wm[Wm.sum(1) < 1e-9, nw.index('cabeza')] = 1; Wm /= Wm.sum(1, keepdims=True)
    F = np.asarray(R['partes']['piel']); F = np.concatenate([F[:, [0, 1, 2]], F[:, [0, 2, 3]]]) if F.shape[1] == 4 else F
    c.piel_P, c.piel_I, c.W = Vr, F, Wm
    # puntos de referencia del nene (en reposo, atados a un segmento)
    mk = {k: v + t for k, v in R['marcas'].items()}
    ex = {}
    for s in 'RL':
        ex[f'cabeza_femur_{s}'] = ('muslo_' + s, c.C['muslo_' + s])
        ex[f'rodilla_{s}'] = ('muslo_' + s, c.C['pierna_' + s])
        ex[f'codo_{s}'] = ('brazo_' + s, c.C['cubito_' + s])
        ex[f'muneca_{s}'] = ('cubito_' + s, c.C['mano_' + s])
        ex[f'tobillo_{s}'] = ('pierna_' + s, c.C['pie_' + s])
        ex[f'mtf_pie_{s}'] = ('dedos_pie_' + s, c.C['dedos_pie_' + s])
        ex[f'mitad_brazo_{s}'] = ('brazo_' + s, (c.C['brazo_' + s] + c.C['cubito_' + s]) / 2)
        ex[f'mitad_antebrazo_{s}'] = ('cubito_' + s, (c.C['cubito_' + s] + c.C['mano_' + s]) / 2)
        ex[f'mitad_muslo_{s}'] = ('muslo_' + s, (c.C['muslo_' + s] + c.C['pierna_' + s]) / 2)
        ex[f'mitad_pierna_{s}'] = ('pierna_' + s, (c.C['pierna_' + s] + c.C['pie_' + s]) / 2)
        ex[f'mediotarso_{s}'] = ('pie_' + s, c.C['pie_' + s] + 0.45 * (c.C['dedos_pie_' + s] - c.C['pie_' + s]))
        ex[f'base_mt_{s}'] = ('pie_' + s, c.C['pie_' + s] + 0.65 * (c.C['dedos_pie_' + s] - c.C['pie_' + s]))
    ex['caderas'] = ('pelvis', (c.C['muslo_R'] + c.C['muslo_L']) / 2)
    z_col = c.C['torax'][2]
    ex['linea_mamilar'] = ('torax', np.array([0, mk['pezon_R'][1], z_col]))
    ex['ombligo'] = ('L3', np.array([0, mk['ombligo'][1], c.C['L3'][2]]))
    ex['sobre_cresta'] = ('L3', np.array([0, c.C['L4'][1] + 0.0375, c.C['L3'][2]]))    # cresta ≈ L4; 2,5-5 cm por encima
    c.extra = ex
    c.nene = True
    escena._C = c
    av._D = dict(R=R, H=H, S=S, esc=1.0)
    av.ajuste = lambda c_: 0          # nada de llevar la piel a la del adulto
    return c
