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
    # miembro inferior
    def cadera_flex(self, s, g): return self.mov('muslo_' + s, X, -g)
    def cadera_abd(self, s, g): return self.mov('muslo_' + s, Z, _sg(s) * g)
    def cadera_rot_int(self, s, g): return self.mov('muslo_' + s, Y, -_sg(s) * g)
    def rodilla_flex(self, s, g): return self.mov('pierna_' + s, 'bisagra', g)
    def tobillo_dorsi(self, s, g): return self.mov('pie_' + s, X, -g)        # dorsiflexión (+) / flexión plantar (-)
    def pie_inversion(self, s, g): return self.mov('pie_' + s, Z, -_sg(s) * g)
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
