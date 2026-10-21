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
                  'mano_' + s: 'radio_' + s, 'muslo_' + s: 'pelvis', 'rotula_' + s: 'muslo_' + s, 'pierna_' + s: 'muslo_' + s, 'pie_' + s: 'pierna_' + s})
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
            ks = [k for k, h in self.huesos.items() if segmento(h['nombre']) == 'mano_' + s]
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

    # ---- posar ----
    def posar(self, pose, raiz=np.eye(4)):
        """pose: dict segmento -> lista de (eje, grados) en el marco de reposo; 'radio_X' admite ('prono', grados)."""
        T = {}
        for s in ORDEN:
            M = np.eye(4)
            for eje, g in pose.get(s, []):
                if eje == 'prono':
                    a, b = self.eje_prono[s[-1]]; ax = b - a
                    # pronación positiva: el pulgar va hacia medial
                    Rr = rotm(ax, np.radians(g) * (1 if s[-1] == 'R' else -1)); c = a
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
        W /= W.sum(1, keepdims=True); self.W = W; self.nombres_w = nombres
        return W

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
        P = self.piel_P; out = np.zeros_like(P)
        for j, s in enumerate(self.nombres_w):
            w = self.W[:, j]; m = w > 1e-4
            if m.any(): out[m] += w[m, None] * aplicar(self.T[s], P[m])
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
