# Figuras de columna (cervical, torácica, lumbar, sacro, cóccix y sacroilíacas) en el estilo por capas (Bontrager 9.ª ed., cap. 6).
# Uso (desde herramientas/ilus3d):  python3 figuras/columna.py [id…]   ->  render/<id>-tubo y render/<id>-otra
# Convenciones de vistas.py: el paciente queda de pie y lo que gira es el rayo. Decúbito supino = rayo AP con la mesa detrás
# (vista de costado con el techo arriba); decúbito lateral = rayo lateral con el lado apoyado contra la mesa.
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from posturas import Pose
from vistas import tubo, costado, arriba, angulado, oblicuo

AP, PA, LAT = (0, 0, -1), (0, 0, 1), (1, 0, 0)        # LAT: lateral izquierda (costado izquierdo contra el RI o la mesa)
CERV = ['cabeza', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'torax', 'cintura_R', 'cintura_L']
TORAC = ['C7', 'torax', 'cintura_R', 'cintura_L', 'L1', 'L2']
LUMB = ['torax', 'L1', 'L2', 'L3', 'L4', 'L5', 'pelvis', 'muslo_R', 'muslo_L']
V = lambda n: 'centro:' + n + ' vertebra'
C4, C5, T1, T7, T12, L3 = V('Fourth cervical'), V('Fifth cervical'), V('First thoracic'), V('Seventh thoracic'), V('Twelfth thoracic'), V('Third lumbar')
CUELLO = [('xifoides', (0, 1, 0), 0.0)]                  # cortes: de la apófisis xifoides para arriba
TORSO = [('sinfisis', (0, 1, 0), 0.10)]                  # hasta un poco por debajo de la pelvis
F = {}
DE_PIE = dict(arriba_img=(0, 1, 0))

def par(id, pose, d, centro, ri, otra='costado', radio=0.12, encuadre=0.26, huesos=CERV, enc_otra=0.45, cortes=CUELLO, **kw):
    """las dos vistas de una ficha"""
    kt = {k: v for k, v in kw.items() if k not in ('desde', 'arriba_img', 'arriba_tubo')}
    if 'arriba_tubo' in kw: kt['arriba'] = kw.pop('arriba_tubo')
    F[id + '-tubo'] = lambda: tubo(id, pose(), d, centro, ri, radio=radio, encuadre=encuadre, huesos=huesos, cortes=cortes, cara=True, **kt)
    if otra == 'costado': F[id + '-otra'] = lambda: costado(id, pose(), d, centro, ri, huesos=huesos, encuadre=enc_otra, cortes=cortes, **kw)
    elif otra == 'arriba': F[id + '-otra'] = lambda: arriba(id, pose(), d, centro, ri, huesos=huesos, cortes=cortes,
                                                          **{k: v for k, v in kw.items() if k not in ('desde', 'arriba_img')})
def _brazo_arriba(p, s): return p.hombro_flex(s, 150).hombro_abd(s, -10).hombro_rot_ext(s, -65).codo_flex(s, 50)
_rodillas = lambda p=None: (p or Pose()).cadera_flex('R', 45).cadera_flex('L', 45).rodilla_flex('R', 80).rodilla_flex('L', 80)    # caderas y rodillas flexionadas
_lateral = lambda: _rodillas(Pose().hombro_flex('R', 90).hombro_flex('L', 90).codo_flex('R', 90).codo_flex('L', 90))  # decúbito lateral, brazos adelante
_hombros_abajo = lambda: Pose().hombro_elevar('R', -10).hombro_elevar('L', -10)
# supino visto de costado con el techo arriba; supino con rayo horizontal (lateral): vista desde el techo con la cabeza arriba
SUP_H = dict(arriba_tubo=(0, 0, 1), desde=(0, 0, -1), arriba_img=(0, 1, 0))

# ---------- cervical ----------
par('columna-cervical-ap-boca-abierta', Pose, AP, 'medio:centro:Atlas|centro:Axis', (0.18, 0.24), radio=0.08, encuadre=0.18, **DE_PIE)
_menton = lambda: Pose().cabeza_flex(-30)
par('columna-cervical-odontoides-fuchs', _menton, AP, 'centro:Axis', (0.24, 0.18), radio=0.08, encuadre=0.18)
par('columna-cervical-odontoides-judd', _menton, PA, 'centro:Axis', (0.24, 0.18), radio=0.08, encuadre=0.18)
par('columna-cervical-ap-axial', lambda: Pose().cabeza_flex(-10), angulado(AP, 17, 'cefalico'), C5, (0.18, 0.24), normal=AP, **DE_PIE)
OPD, OAD = oblicuo('AP', 45, 'R'), oblicuo('PA', 45, 'R')
par('columna-cervical-oblicuas--v1', lambda: Pose().cabeza_flex(-10), angulado(OPD, 17, 'cefalico'), C4, (0.24, 0.30), normal=OPD, otra='arriba',
    puntos=['cabeza_humero_R', 'cabeza_humero_L'])
par('columna-cervical-oblicuas--v2', lambda: Pose().cabeza_flex(-10), angulado(OAD, 17, 'caudal'), C4, (0.24, 0.30), normal=OAD, otra='arriba',
    puntos=['cabeza_humero_R', 'cabeza_humero_L'])
par('columna-cervical-lateral-erguida', lambda: _hombros_abajo().cabeza_flex(-10), LAT, C4, (0.24, 0.30), **DE_PIE)
_nadador = lambda: _brazo_arriba(Pose(), 'L').hombro_elevar('R', -15)
par('columna-cervical-nadador', _nadador, LAT, T1, (0.24, 0.30), **DE_PIE)
par('columna-cervical-lateral-flexion-extension--v1', lambda: _hombros_abajo().cuello_flex(35).cabeza_flex(15), LAT, C4, (0.24, 0.30), **DE_PIE)
par('columna-cervical-lateral-flexion-extension--v2', lambda: _hombros_abajo().cuello_flex(-30).cabeza_flex(-20), LAT, C4, (0.24, 0.30), **DE_PIE)
# traumatismo: decúbito supino, sin mover al paciente (el collarín no se dibuja)
par('columna-cervical-trauma-lateral-horizontal', _hombros_abajo, LAT, C4, (0.24, 0.30), **SUP_H)
par('columna-cervical-trauma-ap', _hombros_abajo, angulado(AP, 17, 'cefalico'), C4, (0.24, 0.30), normal=AP)
par('columna-cervical-trauma-ap-axial-oblicua', _hombros_abajo, angulado(OPD, 15, 'cefalico'), C4, (0.24, 0.30), normal=AP, otra='arriba',
    puntos=['cabeza_humero_R', 'cabeza_humero_L'])
par('columna-cervical-trauma-cervicotoracica', _nadador, LAT, T1, (0.24, 0.30), **SUP_H)

# ---------- torácica ----------
par('columna-toracica-ap', _rodillas, AP, T7, (0.35, 0.43), radio=0.20, encuadre=0.36, huesos=TORAC, cortes=TORSO)
par('columna-toracica-lateral', _lateral, LAT, T7, (0.35, 0.43), radio=0.20, encuadre=0.36, huesos=TORAC, cortes=TORSO)
# oblicua: OPD a 70° (20° de rotación posterior desde la lateral); brazo alejado del RI detrás de la espalda, el cercano arriba
_obl_t = lambda: _brazo_arriba(Pose(), 'R').hombro_flex('L', -30).codo_flex('L', 90)
par('columna-toracica-oblicua', _obl_t, oblicuo('AP', 70, 'R'), T7, (0.35, 0.43), radio=0.20, encuadre=0.36, huesos=TORAC, cortes=TORSO,
    otra='arriba', puntos=['cabeza_humero_R', 'cabeza_humero_L'])

# ---------- lumbar ----------
par('columna-lumbar-ap', _rodillas, AP, L3, (0.30, 0.35), radio=0.16, encuadre=0.30, huesos=LUMB, cortes=TORSO)
par('columna-lumbar-lateral', _rodillas, LAT, L3, (0.30, 0.35), radio=0.16, encuadre=0.30, huesos=LUMB, cortes=TORSO)
par('columna-lumbar-lateral-l5-s1', _rodillas, LAT, 'medio:centro:Fifth lumbar vertebra|centro:Sacrum|0.3', (0.18, 0.24), radio=0.10, encuadre=0.22,
    huesos=LUMB, cortes=TORSO)
par('columna-lumbar-oblicua--v1', Pose, oblicuo('AP', 45, 'R'), L3, (0.30, 0.35), radio=0.16, encuadre=0.30, huesos=LUMB, cortes=TORSO,
    otra='arriba', puntos=['cabeza_humero_R', 'cabeza_humero_L'])
par('columna-lumbar-oblicua--v2', Pose, oblicuo('PA', 45, 'R'), L3, (0.30, 0.35), radio=0.16, encuadre=0.30, huesos=LUMB, cortes=TORSO,
    otra='arriba', puntos=['cabeza_humero_R', 'cabeza_humero_L'])
par('columna-lumbar-ap-flexion-lateral--v1', lambda: Pose().lumbar_lat('R', 25), AP, L3, (0.35, 0.43), radio=0.20, encuadre=0.36, huesos=LUMB + ['torax'],
    cortes=TORSO, **DE_PIE)
par('columna-lumbar-ap-flexion-lateral--v2', lambda: Pose().lumbar_lat('L', 25), AP, L3, (0.35, 0.43), radio=0.20, encuadre=0.36, huesos=LUMB,
    cortes=TORSO, **DE_PIE)
par('columna-lumbar-lateral-flexion-extension--v1', lambda: Pose().lumbar_flex(40), LAT, L3, (0.35, 0.43), radio=0.20, encuadre=0.36, huesos=LUMB,
    cortes=TORSO, **DE_PIE)
par('columna-lumbar-lateral-flexion-extension--v2', lambda: Pose().lumbar_flex(-25), LAT, L3, (0.35, 0.43), radio=0.20, encuadre=0.36, huesos=LUMB,
    cortes=TORSO, **DE_PIE)
# escoliosis (PA de pie, brazos a los costados): v1 sin alza; v2 igual, con el alza bajo el pie del lado convexo (no se dibuja)
for v in ('v1', 'v2'):
    par(f'columna-escoliosis-pa-ferguson--{v}', Pose, PA, T12, (0.35, 0.43), radio=0.26, encuadre=0.45, huesos=TORAC + LUMB, cortes=(), **DE_PIE)

# ---------- sacro, cóccix y sacroilíacas ----------
SOBRE_SINF = 'medio:sinfisis|eias_R+eias_L|0.55'          # ≈5 cm por encima de la sínfisis
par('columna-sacro-ap-axial', Pose, angulado(AP, 15, 'cefalico'), SOBRE_SINF, (0.24, 0.30), normal=AP, radio=0.12, encuadre=0.24, huesos=LUMB, cortes=TORSO)
par('columna-coccix-ap-axial', Pose, angulado(AP, 10, 'caudal'), SOBRE_SINF, (0.18, 0.24), normal=AP, radio=0.10, encuadre=0.22, huesos=LUMB, cortes=TORSO)
par('columna-sacro-coccix-lateral', _rodillas, LAT, 'centro:Sacrum', (0.24, 0.30), radio=0.12, encuadre=0.24, huesos=LUMB, cortes=TORSO)
par('columna-coccix-lateral', lambda: Pose().cadera_flex('R', 90).cadera_flex('L', 90).rodilla_flex('R', 90).rodilla_flex('L', 90), LAT, 'coxis',
    (0.18, 0.24), radio=0.10, encuadre=0.22, huesos=LUMB, cortes=TORSO)
par('columna-sacroiliacas-ap-axial', Pose, angulado(AP, 32, 'cefalico'), 'medio:eias_R+eias_L|sinfisis|0.55', (0.24, 0.30), normal=AP, radio=0.12,
    encuadre=0.24, huesos=LUMB, cortes=TORSO)
# oblicua posterior 25-30° con el lado a estudiar levantado: acá la SI derecha (OPI, lado izquierdo contra la mesa)
par('columna-sacroiliacas-oblicua-posterior', Pose, oblicuo('AP', 27, 'L'), 'medio:eias_R|eias_L|0.12', (0.24, 0.30), radio=0.12, encuadre=0.24,
    huesos=LUMB, cortes=TORSO, otra='arriba', puntos=['cabeza_humero_R', 'cabeza_humero_L'])

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
