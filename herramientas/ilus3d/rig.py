# Esqueleto articulado de BodyParts3D (modelo masculino adulto) para posar el cuerpo entero.
# Unidades: metros. Ejes del modelo: X = izquierda del paciente, Y = arriba, Z = anterior.
import json, gzip, re, numpy as np
from scipy.spatial import cKDTree

import os
B = os.environ.get('RADIOGUIA_MODELO', os.path.join(os.path.dirname(os.path.abspath(__file__)), '.modelo', 'package', 'model')) + '/'
NO_HUESO = re.compile(r'fibularis|tibialis|iliotibial|subscapularis|levator|gingiva|cartilage$|disk', re.I)
CERV = ['Atlas', 'Axis'] + [f'{n} cervical vertebra' for n in ('Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh')]
LUMB = [f'{n} lumbar vertebra' for n in ('First', 'Second', 'Third', 'Fourth', 'Fifth')]

def lado(n):
    l = n.lower()
    return 'R' if re.search(r'\bright\b', l) else 'L' if re.search(r'\bleft\b', l) else ''

DEDOS = {'thumb': 1, 'index': 2, 'middle': 3, 'ring': 4, 'little': 5}
def dedo(n):
    """segmento propio de cada falange (y del 1.er metacarpiano): 'f<dedo><m|a|b|c>_<lado>' (m = metacarpiano, a/b/c = falange
    proximal/media/distal)"""
    l = n.lower(); s = lado(n)
    if 'first metacarpal' in l: return 'f1m_' + s
    m = re.match(r'(proximal|middle|distal) phalanx of (right|left) (thumb|index finger|middle finger|ring finger|little finger)', l)
    if m: return 'f%d%s_%s' % (DEDOS[m.group(3).split()[0]], {'proximal': 'a', 'middle': 'b', 'distal': 'c'}[m.group(1)], s)
    return None

def es_mano(n): return segmento(n) is not None and (segmento(n).startswith('mano_') or dedo(n) is not None)

def segmento(n):
    l = n.lower(); s = lado(n)
    if n in CERV: return 'C%d' % (CERV.index(n) + 1)
    if n in LUMB: return 'L%d' % (LUMB.index(n) + 1)
    if 'thoracic vertebra' in l or re.search(r'\brib\b|costal|sternum|manubrium|xiphoid', l): return 'torax'
    if re.search(r'hip bone|sacrum|coccy', l): return 'pelvis'
    if re.search(r'hyoid|thyroid|cricoid', l): return 'C4'
    if re.search(r'clavicle|scapula', l): return 'cintura_' + s
    if 'humerus' in l: return 'brazo_' + s
    if 'ulna' in l: return 'cubito_' + s
    if 'radius' in l: return 'radio_' + s
    d = dedo(n)
    if d: return d
    if re.search(r'scaphoid|lunate|triquetr|pisiform|trapezi|trapezoid|capitate|hamate|metacarpal|finger|thumb|sesamoid bone of (right|left) hand', l): return 'mano_' + s
    if 'femur' in l: return 'muslo_' + s
    if 'patella' in l: return 'rotula_' + s
    if re.search(r'tibia|fibula', l): return 'pierna_' + s
    if re.search(r'talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|toe|sesamoid bone of (right|left) foot', l): return 'pie_' + s
    if re.search(r'frontal|parietal|occipital|temporal|sphenoid|ethmoid|maxilla|mandible|nasal|palatine|zygomatic|vomer|lacrimal|concha|tooth', l): return 'cabeza'
    return None

PADRE = {'pelvis': None, 'L5': 'pelvis', 'L4': 'L5', 'L3': 'L4', 'L2': 'L3', 'L1': 'L2', 'torax': 'L1',
         'C7': 'torax', 'C6': 'C7', 'C5': 'C6', 'C4': 'C5', 'C3': 'C4', 'C2': 'C3', 'C1': 'C2', 'cabeza': 'C1'}
for s in 'RL':
    PADRE.update({'cintura_' + s: 'torax', 'brazo_' + s: 'cintura_' + s, 'cubito_' + s: 'brazo_' + s, 'radio_' + s: 'cubito_' + s,
                  'mano_' + s: 'radio_' + s, 'f1m_' + s: 'mano_' + s, 'f1a_' + s: 'f1m_' + s, 'f1c_' + s: 'f1a_' + s, 'muslo_' + s: 'pelvis', 'rotula_' + s: 'muslo_' + s, 'pierna_' + s: 'muslo_' + s, 'pie_' + s: 'pierna_' + s})
    for d in '2345':
        PADRE.update({f'f{d}a_' + s: 'mano_' + s, f'f{d}b_' + s: f'f{d}a_' + s, f'f{d}c_' + s: f'f{d}b_' + s})
ORDEN = []
def _ord(p):
    for k, v in PADRE.items():
        if v == p: ORDEN.append(k); _ord(k)
ORDEN.append('pelvis'); _ord('pelvis')

def rotm(axis, ang):
    a = np.asarray(axis, float); a = a / np.linalg.norm(a)
    K = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
    return np.eye(3) + np.sin(ang) * K + (1 - np.cos(ang)) * K @ K

def esfera(P):
    A = np.c_[2 * P, np.ones(len(P))]; s = np.linalg.lstsq(A, (P ** 2).sum(1), rcond=None)[0]
    return s[:3], np.sqrt(s[3] + (s[:3] ** 2).sum())

class Cuerpo:
    def __init__(self):
        d = json.load(open(B + 'atlas.json')); cache = {}
        def ch(i):
            if i not in cache: cache[i] = gzip.open(B + d['chunks'][i]['gzip']).read()
            return cache[i]
        def malla(p):
            c = ch(p['chunk']); n = p['vertexCount']
            P = np.frombuffer(c, np.float32, n * 3, p['positions']).reshape(-1, 3).astype(np.float64)
            I = np.frombuffer(c, np.uint32, p['indexCount'], p['indices']).reshape(-1, 3).astype(np.int64)
            return P, I
        self.huesos = {}       # id -> dict(nombre, seg, P, I)
        for p in d['parts']:
            if p['name'] == 'Skin': self.piel_P, self.piel_I = malla(p)
            if p['system'] != 'skeletal' or NO_HUESO.search(p['name']): continue
            s = segmento(p['name'])
            if s is None: continue
            P, I = malla(p); self.huesos[p['id']] = dict(nombre=p['name'], seg=s, P=P, I=I)
        self._estirar_dedos()
        self.segs = {s: np.vstack([h['P'] for h in self.huesos.values() if h['seg'] == s]) for s in PADRE}
        self.id_por_nombre = {h['nombre']: k for k, h in self.huesos.items()}
        self._centros()

    def _estirar_dedos(self):
        """En el modelo los dedos están algo flexionados (mano en reposo): se extienden las MCF e IF de los dedos 2-5."""
        dedos = ('index', 'middle', 'ring', 'little'); mc = ('second', 'third', 'fourth', 'fifth')
        nom = {h['nombre']: k for k, h in self.huesos.items()}
        def eje(P):
            c = P.mean(0); a = np.linalg.svd(P - c)[2][0]
            if a[1] > 0: a = -a
            t = (P - c) @ a; return a, c + a * t.min(), c + a * t.max()
        Pp, I = self.piel_P, self.piel_I
        for s, side in (('R', 'right'), ('L', 'left')):
            rayos = [[nom[f'{side.capitalize()} {m} metacarpal bone'], nom[f'Proximal phalanx of {side} {d} finger'],
                      nom[f'Middle phalanx of {side} {d} finger'], nom[f'Distal phalanx of {side} {d} finger']] for m, d in zip(mc, dedos)]
            M = np.vstack([self.huesos[r[0]]['P'] for r in rayos]); n = np.linalg.svd(M - M.mean(0))[2][2]
            if n[2] < 0: n = -n
            T = {k: (np.eye(3), np.zeros(3)) for r in rayos for k in r}
            ap = lambda k: self.huesos[k]['P'] @ T[k][0].T + T[k][1]
            for r in rayos:
                for j in range(1, 4):
                    a_p, _, dP = eje(ap(r[j - 1])); a_c, pC, _ = eje(ap(r[j]))
                    ce = (dP + pC) / 2; want = a_c - (a_c @ n) * n + (a_p @ n) * n
                    v = np.cross(a_c, want); sn = np.linalg.norm(v)
                    if sn < 1e-9: continue
                    Rr = rotm(v, np.arcsin(min(1, sn / np.linalg.norm(want))))
                    for k in r[j:]:
                        Mk, t = T[k]; T[k] = (Rr @ Mk, Rr @ (t - ce) + ce)
            # piel de la mano: mezcla con los 2 huesos de la mano más cercanos
            ks = [k for k, h in self.huesos.items() if es_mano(h['nombre']) and lado(h['nombre']) == s]
            hand = np.vstack([self.huesos[k]['P'] for k in ks])
            cerca = cKDTree(hand).query(Pp)[0] < 0.03
            arm = np.vstack([self.huesos[k]['P'] for k, h in self.huesos.items() if segmento(h['nombre']) in ('radio_' + s, 'cubito_' + s)])
            cerca &= cKDTree(hand).query(Pp)[0] < cKDTree(arm).query(Pp)[0]
            segs = [eje(self.huesos[k]['P'])[1:] for k in ks]
            Q = Pp[cerca]
            dd = np.stack([np.linalg.norm(Q - (A + np.clip(((Q - A) @ (Bb - A)) / ((Bb - A) @ (Bb - A)), 0, 1)[:, None] * (Bb - A)), axis=1) for A, Bb in segs], 1)
            od = np.argsort(dd, 1)[:, :2]; d2 = np.take_along_axis(dd, od, 1); w = 1 / (d2 + 1e-4) ** 4; w /= w.sum(1, keepdims=True)
            nv = np.zeros_like(Q)
            for j in range(2):
                for hi, k in enumerate(ks):
                    m = od[:, j] == hi
                    if m.any():
                        Mk, t = T.get(k, (np.eye(3), np.zeros(3))); nv[m] += w[m, j, None] * (Q[m] @ Mk.T + t)
            Pp[cerca] = nv
            for k, (Mk, t) in T.items(): self.huesos[k]['P'] = self.huesos[k]['P'] @ Mk.T + t

    def puntos(self, nombre): return self.huesos[self.id_por_nombre[nombre]]['P']

    def _contacto(self, a, b, r=0.008):
        A, Bp = self.segs[a], self.segs[b]
        ta, tb = cKDTree(A), cKDTree(Bp)
        return np.vstack([A[tb.query(A)[0] < r], Bp[ta.query(Bp)[0] < r]])

    def _centros(self):
        C = {}
        for s, p in PADRE.items():
            if p is None: C[s] = self.segs[s].mean(0); continue
            k = s.split('_')[0]
            if k in ('brazo', 'muslo'):          # articulaciones esféricas: centro de la cabeza humeral / femoral
                P = self.segs[s]; top = P[P[:, 1] > P[:, 1].max() - 0.05]
                # la cabeza es la parte más medial del extremo proximal
                med = np.abs(top[:, 0]); cab = top[med < np.percentile(med, 35)]
                C[s] = esfera(cab)[0]
            elif k == 'rotula':
                C[s] = C.get('pierna_' + s[-1]) if 'pierna_' + s[-1] in C else None
            else:
                Q = self._contacto(p, s)
                if len(Q) < 6: Q = self._contacto(p, s, 0.02)
                C[s] = esfera(Q)[0] if k in ('cubito', 'pierna') and len(Q) > 20 else Q.mean(0)
        C['rotula_R'], C['rotula_L'] = C['pierna_R'], C['pierna_L']
        self.C = C
        self._dedos()
        # ejes de bisagra (codo y rodilla): línea entre epicóndilos, orientada para que + sea flexión
        self.bisagra = {}
        for s in 'RL':
            for k, prox, sentido in (('cubito_', 'brazo_', 1), ('pierna_', 'muslo_', -1)):
                P = self.segs[prox + s]; low = P[P[:, 1] < P[:, 1].min() + 0.06]
                a = low[low[:, 0].argmax()] - low[low[:, 0].argmin()]; a /= np.linalg.norm(a)
                v = rotm(a, 0.3) @ np.array([0, -1, 0.])
                if np.sign(v[2]) != sentido: a = -a
                self.bisagra[k + s] = a
        # eje de pronosupinación: cabeza del radio -> cabeza del cúbito
        self.eje_prono = {}
        for s in 'RL':
            r, u = self.segs['radio_' + s], self.segs['cubito_' + s]
            self.eje_prono[s] = (r[r[:, 1].argmax()], u[u[:, 1].argmin()])

    def _dedos(self):
        """centros y ejes de las articulaciones de los dedos (mano en reposo con los dedos extendidos).
        eje_flex[seg]: + = flexión (la punta va hacia la palma). eje_abd[seg]: + = se separa del dedo medio (para el medio:
        hacia radial). Pulgar: eje_flex = flexión hacia el meñique; f1m además tiene eje_abd_palmar y eje_rot (eje largo)."""
        self.eje_flex, self.eje_abd = {}, {}; self.eje_abd_palmar, self.eje_rot = {}, {}
        def eje(P):
            c = P.mean(0); a = np.linalg.svd(P - c)[2][0]
            if a[1] > 0: a = -a
            t = (P - c) @ a; return a, c + a * t.min(), c + a * t.max()       # dirección distal, extremo proximal, distal
        for s in 'RL':
            S = 'Right' if s == 'R' else 'Left'; sl = S.lower()
            mc = {2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth'}
            M = np.vstack([self.puntos(f'{S} {mc[d]} metacarpal bone') for d in mc]); n = np.linalg.svd(M - M.mean(0))[2][2]
            if n[2] < 0: n = -n                                           # normal palmar (hacia anterior en reposo)
            radial = np.array([-1. if s == 'R' else 1., 0, 0])               # el pulgar queda hacia lateral en reposo
            u3 = eje(self.puntos(f'{S} third metacarpal bone'))[0]
            for d, nom in ((2, 'index'), (3, 'middle'), (4, 'ring'), (5, 'little')):
                cadena = [f'{S} {mc[d]} metacarpal bone'] + [f'{k} phalanx of {sl} {nom} finger' for k in ('Proximal', 'Middle', 'Distal')]
                for j, k in enumerate('abc'):
                    up, _, dP = eje(self.puntos(cadena[j])); uc, pC, _ = eje(self.puntos(cadena[j + 1]))
                    seg = f'f{d}{k}_{s}'; self.C[seg] = (dP + pC) / 2
                    a = np.cross(uc, n); self.eje_flex[seg] = a / np.linalg.norm(a)
                    lejos = (radial if d <= 3 else -radial) if d != 3 else radial
                    b = n.copy() if np.cross(n, uc) @ lejos > 0 else -n      # rotar uc alrededor de b lo lleva hacia 'lejos'
                    self.eje_abd[seg] = b
            # pulgar
            cad = [f'{S} first metacarpal bone', f'Proximal phalanx of {sl} thumb', f'Distal phalanx of {sl} thumb']
            u1, p1, _ = eje(self.puntos(cad[0]))
            self.C['f1m_' + s] = p1
            hacia5 = self.puntos(f'{S} fifth metacarpal bone').mean(0) - self.puntos(cad[0]).mean(0)
            for j, k in enumerate('mac'):
                uc, pC, dC = eje(self.puntos(cad[j]))
                if j: self.C[f'f1{k}_{s}'] = (eje(self.puntos(cad[j - 1]))[2] + pC) / 2
                t = hacia5 - (hacia5 @ uc) * uc; a = np.cross(uc, t); self.eje_flex[f'f1{k}_{s}'] = a / np.linalg.norm(a)
            a = np.cross(u1, n); self.eje_abd_palmar['f1m_' + s] = a / np.linalg.norm(a)    # el pulgar se aleja de la palma
            self.eje_rot['f1m_' + s] = u1 * (1 if s == 'R' else -1)
            b = n.copy() if np.cross(n, u1) @ radial > 0 else -n
            self.eje_abd['f1m_' + s] = b                                    # abducción radial (en el plano de la palma)
            self.normal_palma = getattr(self, 'normal_palma', {}); self.normal_palma[s] = n

    # ---- posar ----
    def posar(self, pose, raiz=np.eye(4)):
        """pose: dict segmento -> lista de (eje, grados) en el marco de reposo; 'radio_X' admite ('prono', grados)."""
        T = {}; self.prono = {}
        for s in ORDEN:
            M = np.eye(4)
            for eje, g in pose.get(s, []):
                if eje == 'prono':
                    a, b = self.eje_prono[s[-1]]; ax = b - a
                    # pronación positiva: la palma gira hacia medial (eje hacia distal: signo negativo en el lado derecho)
                    Rr = rotm(ax, np.radians(g) * (-1 if s[-1] == 'R' else 1)); c = a
                    self.prono[s[-1]] = self.prono.get(s[-1], 0) + np.radians(g) * (-1 if s[-1] == 'R' else 1)
                elif eje in ('flex', 'abd', 'abd_palmar', 'rot'):
                    Rr = rotm({'flex': self.eje_flex, 'abd': self.eje_abd, 'abd_palmar': self.eje_abd_palmar, 'rot': self.eje_rot}[eje][s], np.radians(g)); c = self.C[s]
                elif eje == 'bisagra':
                    Rr = rotm(self.bisagra[s], np.radians(g)); c = self.C[s]
                else:
                    Rr = rotm(eje, np.radians(g)); c = self.C[s]
                Mi = np.eye(4); Mi[:3, :3] = Rr; Mi[:3, 3] = c - Rr @ c; M = M @ Mi
            T[s] = (raiz if PADRE[s] is None else T[PADRE[s]]) @ M
        if 'rotula_media' not in pose:   # la rótula acompaña a medias la flexión de la rodilla
            for s in 'RL':
                Tm, Tp = T['muslo_' + s], T['pierna_' + s]
                L = np.linalg.inv(Tm) @ Tp; R = L[:3, :3]; c = self.C['pierna_' + s]
                ang = np.arccos(np.clip((np.trace(R) - 1) / 2, -1, 1))
                if ang > 1e-6:
                    ax = np.array([R[2, 1] - R[1, 2], R[0, 2] - R[2, 0], R[1, 0] - R[0, 1]]) / (2 * np.sin(ang))
                    Rh = rotm(ax, ang / 2); Mh = np.eye(4); Mh[:3, :3] = Rh; Mh[:3, 3] = c - Rh @ c
                    T['rotula_' + s] = Tm @ Mh
        self.T = T
        return T

    def pesos_piel(self, sigma=0.012):
        P = self.piel_P; nombres = list(PADRE)
        D = np.stack([cKDTree(self.segs[s]).query(P)[0] for s in nombres], 1)
        # vecinos en la jerarquía del segmento más cercano
        ady = {s: {s, PADRE[s]} | {k for k, v in PADRE.items() if v == s} for s in nombres}
        cerca = D.argmin(1)
        # corregir islas: vértices cuyo segmento más cercano no está conectado por la malla con el resto de ese segmento
        cerca = self._sin_islas(cerca, D, nombres)
        W = np.zeros_like(D)
        for i, s in enumerate(nombres):
            m = cerca == i
            if not m.any(): continue
            cols = [nombres.index(x) for x in ady[s] if x]
            dm = D[m][:, [i]]
            W[np.ix_(m, cols)] = np.exp(-(D[m][:, cols] - dm) / sigma)
        W /= W.sum(1, keepdims=True); self.nombres_w = nombres
        for lado_ in 'RL': self._pesos_mano(W, lado_)
        self.W = W
        return W

    def _pesos_mano(self, W, s, ancho=0.012):
        """Piel de la mano: cada vértice se asigna al rayo (dedo) más cercano y, a lo largo de ese rayo, a la falange en la que
        cae; cerca de cada articulación se mezcla con la vecina (transición de +-ancho). Así la piel de los dedos se dobla
        con ellos sin estirarse hacia la palma."""
        nw = self.nombres_w; idx = {k: i for i, k in enumerate(nw)}
        cols = [idx['mano_' + s]] + [idx[k] for k in nw if k.startswith('f') and k.endswith('_' + s)]
        wm = W[:, cols].sum(1); sel = np.where(wm > 1e-4)[0]
        if not len(sel): return
        Q = self.piel_P[sel]
        S = 'Right' if s == 'R' else 'Left'; sl = S.lower()
        rayos = []
        for d, nom in ((2, 'index'), (3, 'middle'), (4, 'ring'), (5, 'little')):
            punta = self.puntos(f'Distal phalanx of {sl} {nom} finger')
            mcb = self.puntos(f'{S} ' + {2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth'}[d] + ' metacarpal bone')
            j = [self.C[f'f{d}{k}_{s}'] for k in 'abc']
            ax = j[2] - j[1]; ax /= np.linalg.norm(ax)
            tip = punta[((punta - j[2]) @ ax).argmax()]
            base = mcb[((mcb - j[0]) @ (j[0] - j[1])).argmax()]
            rayos.append(([base] + j + [tip], ['mano_' + s] + [f'f{d}{k}_{s}' for k in 'abc']))
        punta = self.puntos(f'Distal phalanx of {sl} thumb'); j = [self.C[f'f1{k}_{s}'] for k in 'mac']
        ax = j[2] - j[1]; ax /= np.linalg.norm(ax); tip = punta[((punta - j[2]) @ ax).argmax()]
        base = j[0] - (j[1] - j[0]) * 0.3
        rayos.append(([base] + j + [tip], ['mano_' + s] + [f'f1{k}_{s}' for k in 'mac']))
        # distancia de cada vértice a cada rayo (polilínea) y parámetro a lo largo
        def proy(P, A, B):
            v = B - A; t = np.clip(((P - A) @ v) / (v @ v), 0, 1); return np.linalg.norm(P - (A + t[:, None] * v), axis=1)
        D = np.stack([np.min(np.stack([proy(Q, r[0][i], r[0][i + 1]) for i in range(len(r[0]) - 1)], 1), 1) for r in rayos], 1)
        cual = D.argmin(1)
        nuevo = np.zeros((len(sel), len(nw)))
        for ri, (pts, segs) in enumerate(rayos):
            m = cual == ri
            if not m.any(): continue
            P = Q[m]; wv = np.zeros((m.sum(), len(segs)))
            # posición a lo largo del rayo: por cada articulación k (pts[1..3]), lado distal si (P - Jk)·dir_k > 0
            lado_d = []
            for k in range(1, 4):
                dk = pts[k + 1] - pts[k - 1]; dk /= np.linalg.norm(dk)
                lado_d.append(np.clip(((P - pts[k]) @ dk) / ancho * 0.5 + 0.5, 0, 1))   # 0 = proximal, 1 = distal
            # peso de cada segmento: producto de estar distal a su articulación proximal y proximal a la distal
            wv[:, 0] = 1 - lado_d[0]
            wv[:, 1] = lado_d[0] * (1 - lado_d[1])
            wv[:, 2] = lado_d[1] * (1 - lado_d[2])
            wv[:, 3] = lado_d[2]
            for c_, sg in enumerate(segs): nuevo[m, idx[sg]] += wv[:, c_]
        nuevo /= np.maximum(nuevo.sum(1, keepdims=True), 1e-9)
        W[sel[:, None], cols] = 0
        W[sel] += nuevo * wm[sel, None]

    def _sin_islas(self, cerca, D, nombres):
        I = self.piel_I; n = len(self.piel_P)
        for _ in range(4):
            par = np.arange(n)
            def raiz(a):
                while par[a] != a: par[a] = par[par[a]]; a = par[a]
                return a
            for a, b in np.vstack([I[:, [0, 1]], I[:, [1, 2]], I[:, [2, 0]]]):
                if cerca[a] == cerca[b]:
                    ra, rb = raiz(a), raiz(b)
                    if ra != rb: par[rb] = ra
            r = np.array([raiz(i) for i in range(n)])
            cambio = 0
            for i in range(len(nombres)):
                m = np.where(cerca == i)[0]
                if len(m) == 0: continue
                comps, cnt = np.unique(r[m], return_counts=True)
                if len(comps) < 2: continue
                big = comps[cnt.argmax()]
                malos = m[(r[m] != big)]
                malos = malos[np.isin(r[malos], comps[cnt < 0.2 * cnt.max()])]
                if len(malos):
                    D2 = D[malos].copy(); D2[:, i] = np.inf; cerca[malos] = D2.argmin(1); cambio += len(malos)
            if not cambio: break
        return cerca

    def piel_posada(self):
        P = self.piel_P; out = np.zeros_like(P); nw = self.nombres_w
        for j, s in enumerate(nw):
            if s.startswith('radio_'): continue
            w = self.W[:, j].copy(); m = w > 1e-4
            if not m.any(): continue
            if s.startswith('cubito_'):
                # piel del antebrazo: la pronosupinación se reparte a lo largo del antebrazo (0 en el codo, todo en la muñeca),
                # en vez de que la piel sobre el radio gire y la de sobre el cúbito no (eso la rasga)
                w = w + self.W[:, nw.index('radio_' + s[-1])]; m = w > 1e-4
                a, b = self.eje_prono[s[-1]]; ax = b - a
                t = np.clip((P[m] - a) @ ax / (ax @ ax), 0, 1)
                k = np.round(t * 40).astype(int); Q = np.zeros((m.sum(), 3))
                for i in np.unique(k):
                    Rr = rotm(ax, self.prono.get(s[-1], 0) * i / 40); Mi = np.eye(4); Mi[:3, :3] = Rr; Mi[:3, 3] = a - Rr @ a
                    sel = k == i; Q[sel] = aplicar(self.T[s] @ Mi, P[m][sel])
                out[m] += w[m, None] * Q
            else:
                out[m] += w[m, None] * aplicar(self.T[s], P[m])
        return out

    def huesos_posados(self):
        return {k: (aplicar(self.T[h['seg']], h['P']), h['I']) for k, h in self.huesos.items()}

def aplicar(T, P): return P @ T[:3, :3].T + T[:3, 3]

def interp(A, Bm, t):
    # interpolación simple de transformaciones rígidas (rotación por eje-ángulo)
    R = A[:3, :3].T @ Bm[:3, :3]
    ang = np.arccos(np.clip((np.trace(R) - 1) / 2, -1, 1))
    if ang < 1e-6: return A.copy()
    ax = np.array([R[2, 1] - R[1, 2], R[0, 2] - R[2, 0], R[1, 0] - R[0, 1]]) / (2 * np.sin(ang))
    Rt = A[:3, :3] @ rotm(ax, ang * t)
    M = np.eye(4); M[:3, :3] = Rt; M[:3, 3] = A[:3, 3] * (1 - t) + Bm[:3, 3] * t
    return M
