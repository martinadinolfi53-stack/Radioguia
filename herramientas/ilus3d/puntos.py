# Puntos de referencia anatómicos (para ubicar RC, rótulos y líneas). Cada punto se calcula en la pose de reposo
# a partir de la geometría de los huesos y queda atado a un segmento del esqueleto, así acompaña la pose.
# Ejes del modelo: X = izquierda del paciente, Y = arriba, Z = anterior.  s = 'R' / 'L'.
import numpy as np

def _lado(s): return 'Right' if s == 'R' else 'Left'
def _sg(s): return -1 if s == 'R' else 1      # dirección lateral del lado s (en X)

class Puntos:
    def __init__(self, c):
        self.c = c; self._cache = {}

    def P(self, nombre):            # puntos de un hueso por nombre del modelo
        return self.c.puntos(nombre)

    def extremo(self, nombre, d, frac=0.0):
        """vértice del hueso más lejos en la dirección d (si frac>0: promedio del frac más extremo)"""
        P = self.P(nombre); t = P @ np.asarray(d, float)
        if frac <= 0: return P[t.argmax()]
        return P[t >= np.quantile(t, 1 - frac)].mean(0)

    def centro(self, nombre): return self.P(nombre).mean(0)

    # --- definiciones: nombre -> (segmento, función que da el punto en reposo) ---
    def definir(self, nombre):
        m = __import__('re').match(r'(mcf|ifp|ifd|if|cmc)(\d)_([RL])$', nombre)
        if m:   # articulaciones de los dedos: centro articular, atado al segmento proximal
            k, d, s_ = m.groups(); seg = {'mcf': 'f%sa', 'ifp': 'f%sb', 'ifd': 'f%sc', 'if': 'f%sc', 'cmc': 'f%sm'}[k] % d + '_' + s_
            return __import__('rig').PADRE[seg], (lambda: self.c.C[seg])
        m = __import__('re').match(r'punta_dedo(\d)_([RL])$', nombre)
        if m:
            d, s_ = m.groups(); L_ = _lado(s_).lower(); nm = 'thumb' if d == '1' else {'2': 'index', '3': 'middle', '4': 'ring', '5': 'little'}[d] + ' finger'
            seg = f'f{d}c_{s_}'
            return seg, lambda: self.extremo(f'Distal phalanx of {L_} {nm}', self._dir_dedo(d, s_))
        if nombre.startswith('medio:'):       # 'medio:A|B|t': punto a fracción t (0,5 si falta) de A a B; 'A+B' promedia puntos
            pr = nombre[6:].split('|'); t = float(pr[2]) if len(pr) > 2 else 0.5
            prom = lambda x: np.mean([self.definir(n)[1]() for n in x.split('+')], 0)
            return self.definir(pr[0].split('+')[0])[0], lambda: prom(pr[0]) + t * (prom(pr[1]) - prom(pr[0]))
        if nombre.startswith('centro:'):      # centro de cualquier hueso por su nombre en el modelo, p. ej. 'centro:Right capitate'
            hb = nombre[7:]; return self.c.huesos[self.c.id_por_nombre[hb]]['seg'], lambda: self.centro(hb)
        k, _, s = nombre.rpartition('_') if nombre[-2:] in ('_R', '_L') else (nombre, '', '')
        L = _lado(s) if s else ''; sg = _sg(s) if s else 0
        X, Y, Z = np.eye(3)
        lat = np.array([sg, 0, 0])
        D = {
            # miembro superior
            'mcf3': ('mano_' + s, lambda: (self.extremo(f'{L} third metacarpal bone', -Y) + self.extremo(f'Proximal phalanx of {L.lower()} middle finger', Y)) / 2),
            'grande': ('mano_' + s, lambda: self.centro(f'{L} capitate')),
            'base_mc3': ('mano_' + s, lambda: self.extremo(f'{L} third metacarpal bone', Y, 0.02)),
            'escafoides': ('mano_' + s, lambda: self.centro(f'{L} scaphoid')),
            'estiloides_radio': ('radio_' + s, lambda: self.extremo(f'{L} radius', -Y + 0.6 * lat, 0.01)),
            'estiloides_cubito': ('cubito_' + s, lambda: self.extremo(f'{L} ulna', -Y - 0.6 * lat, 0.01)),
            'epicondilo_lat': ('brazo_' + s, lambda: self._epic('humerus', s, 1)),
            'epicondilo_med': ('brazo_' + s, lambda: self._epic('humerus', s, -1)),
            'codo': ('brazo_' + s, lambda: (self._epic('humerus', s, 1) + self._epic('humerus', s, -1)) / 2),
            'olecranon': ('cubito_' + s, lambda: self.extremo(f'{L} ulna', Y)),
            'cabeza_humero': ('brazo_' + s, lambda: self.c.C['brazo_' + s]),
            'troquiter': ('brazo_' + s, lambda: self.extremo(f'{L} humerus', lat + 0.3 * Y, 0.01)),
            'acromion': ('cintura_' + s, lambda: self.extremo(f'{L} scapula', lat + 0.8 * Y, 0.005)),
            'coracoides': ('cintura_' + s, lambda: self.extremo(f'{L} scapula', Z + 0.2 * Y, 0.005)),
            'clavicula_media': ('cintura_' + s, lambda: self.centro(f'{L} clavicle')),
            # miembro inferior
            'epicondilo_lat_fem': ('muslo_' + s, lambda: self._epic('femur', s, 1)),
            'epicondilo_med_fem': ('muslo_' + s, lambda: self._epic('femur', s, -1)),
            'rodilla': ('muslo_' + s, lambda: (self._epic('femur', s, 1) + self._epic('femur', s, -1)) / 2),
            'vertice_rotula': ('rotula_' + s, lambda: self.extremo(f'{L} patella', -Y)),
            'base_rotula': ('rotula_' + s, lambda: self.extremo(f'{L} patella', Y)),
            'tuberosidad_tibial': ('pierna_' + s, lambda: self._tuberosidad(s)),
            'cabeza_perone': ('pierna_' + s, lambda: self.extremo(f'{L} fibula', Y, 0.01)),
            'maleolo_med': ('pierna_' + s, lambda: self.extremo(f'{L} tibia', -Y - 0.5 * lat, 0.005)),
            'maleolo_lat': ('pierna_' + s, lambda: self.extremo(f'{L} fibula', -Y + 0.5 * lat, 0.005)),
            'tobillo': ('pierna_' + s, lambda: (self.extremo(f'{L} tibia', -Y - 0.5 * lat, 0.005) + self.extremo(f'{L} fibula', -Y + 0.5 * lat, 0.005)) / 2),
            'base_mt5': ('pie_' + s, lambda: self.extremo(f'{L} fifth metatarsal bone', -Z + 0.3 * lat, 0.01)),
            'base_mt3': ('pie_' + s, lambda: self.extremo(f'{L} third metatarsal bone', -Z, 0.02)),
            'cabeza_mt1': ('pie_' + s, lambda: self.extremo(f'{L} first metatarsal bone', Z, 0.02)),
            'mtf_pie': ('dedos_pie_' + s, lambda: self.c.C['dedos_pie_' + s]),
            'if_dedo1_pie': ('dedos_pie_' + s, lambda: self.extremo(f'Proximal phalanx of {L.lower()} big toe', Z, 0.03)),
            'ifp_dedo3_pie': ('dedos_pie_' + s, lambda: self.extremo(f'Proximal phalanx of {L.lower()} third toe', Z, 0.03)),
            'punta_dedo1_pie': ('dedos_pie_' + s, lambda: self.extremo(f'Distal phalanx of {L.lower()} big toe', Z, 0.01)),
            'punta_dedo5_pie': ('dedos_pie_' + s, lambda: self.extremo(f'Distal phalanx of {L.lower()} little toe', Z, 0.01)),
            'talon': ('pie_' + s, lambda: self.extremo(f'{L} calcaneus', -Z - 0.3 * Y, 0.01)),
            'trocanter_mayor': ('muslo_' + s, lambda: self.extremo(f'{L} femur', lat + 0.4 * Y, 0.003)),
            'cabeza_femur': ('muslo_' + s, lambda: self.c.C['muslo_' + s]),
            'eias': ('pelvis', lambda: self.extremo(f'{L} hip bone', Z + 0.25 * lat - 0.1 * Y, 0.003)),
            'cresta_iliaca': ('pelvis', lambda: self.extremo(f'{L} hip bone', Y + 0.2 * lat, 0.003)),
            # tronco
            'sinfisis': ('pelvis', lambda: (self.extremo('Right hip bone', Z - 0.6 * Y + 0.4 * X, 0.003) + self.extremo('Left hip bone', Z - 0.6 * Y - 0.4 * X, 0.003)) / 2),
            'coxis': ('pelvis', lambda: self.extremo('Sacrum', -Y - 0.3 * Z, 0.003)),     # punta del sacro (el modelo no trae el cóccix)
            'yugular': ('torax', lambda: self.extremo('Manubrium', Y, 0.02)),
            'xifoides': ('torax', lambda: self.extremo('Xiphoid process', -Y)),
            'esternon_medio': ('torax', lambda: self.centro('Body of sternum')),
            'apofisis_c7': ('C7', lambda: self.extremo('Seventh cervical vertebra', -Z)),
            'L3': ('L3', lambda: self.centro('Third lumbar vertebra')),
            'L4': ('L4', lambda: self.centro('Fourth lumbar vertebra')),
            'T7': ('torax', lambda: self.centro('Seventh thoracic vertebra')),
            # cabeza
            'nasion': ('cabeza', lambda: self._nasion()),
            'glabela': ('cabeza', lambda: self.extremo('Frontal bone', Z - 0.35 * Y, 0.001)),
            'menton': ('cabeza', lambda: self.extremo('Mandible', Z - 0.8 * Y, 0.002)),
            'gonion': ('cabeza', lambda: self.extremo('Mandible', -Z - Y + 0.6 * lat, 0.003)),
            'vertex': ('cabeza', lambda: (self.extremo('Right parietal bone', Y) + self.extremo('Left parietal bone', Y)) / 2),
            'inion': ('cabeza', lambda: self.extremo('Occipital bone', -Z - 0.2 * Y, 0.002)),
            'meato_auditivo': ('cabeza', lambda: self._meato(s)),
            'acantion': ('cabeza', lambda: self._acantion()),
        }
        if k not in D: raise KeyError('punto desconocido: ' + nombre)
        return D[k]

    def _dir_dedo(self, d, s):
        a, b = (self.c.C[f'f{d}b_{s}'], self.c.C[f'f{d}c_{s}']) if d != '1' else (self.c.C[f'f1a_{s}'], self.c.C[f'f1c_{s}'])
        v = b - a; return v / np.linalg.norm(v)

    def _epic(self, hueso, s, lado):     # lado +1 lateral, -1 medial
        P = self.P(f'{_lado(s)} {hueso}'); low = P[P[:, 1] < P[:, 1].min() + 0.07]
        return low[(low[:, 0] * _sg(s) * lado).argmax()]

    def _tuberosidad(self, s):
        P = self.P(f'{_lado(s)} tibia'); top = P[P[:, 1] > P[:, 1].max() - 0.08]
        return top[top[:, 2].argmax()]

    def _nasion(self):
        F = self.P('Frontal bone'); N = np.vstack([self.P('Right nasal bone'), self.P('Left nasal bone')])
        top = N[N[:, 1] > N[:, 1].max() - 0.003].mean(0); return top

    def _acantion(self):
        M = np.vstack([self.P('Right maxilla'), self.P('Left maxilla')])
        mid = M[np.abs(M[:, 0]) < 0.006]; cand = mid[mid[:, 2] > np.quantile(mid[:, 2], 0.97)]
        return cand[cand[:, 1].argmin()] if len(cand) else mid[mid[:, 2].argmax()]

    def _meato(self, s):
        T = self.P(f'{_lado(s)} temporal bone'); sg = _sg(s)
        # el poro acústico externo: zona lateral del temporal, en la altura media de su porción timpánica
        lat = T[T[:, 0] * sg > np.quantile(T[:, 0] * sg, 0.9)]
        return lat[np.argsort(np.abs(lat[:, 1] - np.median(lat[:, 1])) + np.abs(lat[:, 2] - np.median(lat[:, 2])))[:15]].mean(0)

    def posado(self, nombre):
        if nombre not in self._cache:
            seg, f = self.definir(nombre); self._cache[nombre] = (seg, f())
        seg, p = self._cache[nombre]; T = self.c.T[seg]
        return T[:3, :3] @ p + T[:3, 3]
