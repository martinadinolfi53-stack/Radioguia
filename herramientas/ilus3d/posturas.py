# Vocabulario de movimientos articulares -> pose para rig.Cuerpo.posar(). Grados positivos = el movimiento nombrado.
# Ejes del modelo: X = izquierda del paciente, Y = arriba, Z = anterior. s = 'R' (derecho) o 'L' (izquierdo).
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)
def _sg(s): return -1 if s == 'R' else 1          # signo para movimientos que se reflejan entre lados

class Pose(dict):
    def mov(self, seg, eje, g):
        if g: self.setdefault(seg, []).append((eje, g))
        return self
    # miembro superior
    def hombro_flex(self, s, g): return self.mov('brazo_' + s, X, -g)
    def hombro_abd(self, s, g):
        # ritmo escapulohumeral: un tercio de la abducción lo hace la escápula (a partir de 30°)
        esc = max(0, g - 30) / 3
        self.mov('cintura_' + s, Z, _sg(s) * esc)
        return self.mov('brazo_' + s, Z, _sg(s) * (g - esc))
    def hombro_rot_ext(self, s, g): return self.mov('brazo_' + s, Y, _sg(s) * g)
    def hombro_elevar(self, s, g): return self.mov('cintura_' + s, Z, _sg(s) * g)   # hombro hacia arriba (+) o abajo (-)
    def codo_flex(self, s, g): return self.mov('cubito_' + s, 'bisagra', g)
    def prono(self, s, g): return self.mov('radio_' + s, 'prono', g)        # 0 = supinación (posición anatómica), 90 = neutra, 180 = pronación
    def muneca_flex(self, s, g): return self.mov('mano_' + s, X, -g)        # flexión palmar (+) / dorsal (-)
    def muneca_desv_cubital(self, s, g): return self.mov('mano_' + s, Z, -_sg(s) * g)
    # dedos: d = 1..5 (o lista). Grados + = flexión / separación (abducción respecto del dedo medio).
    def dedos_flex(self, s, mcf=0, ifp=0, ifd=None, d=(2, 3, 4, 5)):
        for k in ([d] if isinstance(d, int) else d):
            if k == 1: self.mov('f1a_' + s, 'flex', mcf); self.mov('f1c_' + s, 'flex', ifp); continue
            self.mov(f'f{k}a_' + s, 'flex', mcf); self.mov(f'f{k}b_' + s, 'flex', ifp)
            self.mov(f'f{k}c_' + s, 'flex', ifp * 0.7 if ifd is None else ifd)
        return self
    def dedos_separar(self, s, g, d=(2, 3, 4, 5)):
        for k in ([d] if isinstance(d, int) else d): self.mov(f'f{k}a_' + s, 'abd', g * (0.3 if k == 3 else 1))
        return self
    def pulgar(self, s, abd_radial=0, abd_palmar=0, rot=0, flex_cmc=0):
        if abd_radial: self.mov('f1m_' + s, 'abd', abd_radial)
        if abd_palmar: self.mov('f1m_' + s, 'abd_palmar', abd_palmar)
        if flex_cmc: self.mov('f1m_' + s, 'flex', flex_cmc)
        if rot: self.mov('f1m_' + s, 'rot', rot)
        return self
    # miembro inferior
    def cadera_flex(self, s, g): return self.mov('muslo_' + s, X, -g)
    def cadera_abd(self, s, g): return self.mov('muslo_' + s, Z, _sg(s) * g)
    def cadera_rot_int(self, s, g): return self.mov('muslo_' + s, Y, -_sg(s) * g)
    def rodilla_flex(self, s, g): return self.mov('pierna_' + s, 'bisagra', g)
    def tobillo_dorsi(self, s, g): return self.mov('pie_' + s, X, -g)        # dorsiflexión (+) / flexión plantar (-)
    def pie_inversion(self, s, g): return self.mov('pie_' + s, Z, -_sg(s) * g)
    def dedos_pie_dorsi(self, s, g): return self.mov('dedos_pie_' + s, X, -g)    # flexión dorsal de los dedos del pie en las MTF (+)
    def pie_rot_int(self, s, g): return self.mov('pie_' + s, Y, -_sg(s) * g)
    # columna y cabeza (repartido entre vértebras)
    def _rep(self, segs, eje, g):
        for k in segs: self.mov(k, eje, g / len(segs))
        return self
    def lumbar_flex(self, g): return self._rep(['L1', 'L2', 'L3', 'L4', 'L5'], X, g)
    def lumbar_lat(self, s, g): return self._rep(['L1', 'L2', 'L3', 'L4', 'L5'], Z, -_sg(s) * g)   # inclinación hacia el lado s
    def tronco_rot(self, s, g): return self._rep(['L1', 'L2', 'L3', 'L4', 'L5'], Y, _sg(s) * g)    # el frente gira hacia el lado s
    def cuello_flex(self, g): return self._rep(['C2', 'C3', 'C4', 'C5', 'C6', 'C7'], X, g)
    def cuello_lat(self, s, g): return self._rep(['C2', 'C3', 'C4', 'C5', 'C6', 'C7'], Z, -_sg(s) * g)
    def cabeza_flex(self, g): return self.mov('cabeza', X, g)                # mentón hacia el pecho (+) / extensión (-)
    def cabeza_rot(self, s, g): return self._rep(['C1', 'C2'], Y, _sg(s) * g)   # la cara gira hacia el lado s
    def cabeza_lat(self, s, g): return self.mov('cabeza', Z, -_sg(s) * g)
    def pelvis(self, eje, g): return self.mov('pelvis', eje, g)
