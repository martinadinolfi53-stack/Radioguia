# Figuras de abdomen, estudios contrastados y portátiles en el estilo por capas (Bontrager 9.ª ed., caps. 9 y 10).
# Uso (desde herramientas/ilus3d):  python3 figuras/abdomen.py [id…]   ->  render/<id>-tubo y render/<id>-otra
# Siguen con el dibujo a mano: las pediátricas (el modelo es adulto), las intraoperatorias con arco en C y la axiolateral
# modificada de Clements (la geometría del tubo no se puede dibujar sin inventar).
# El modelo no tiene órganos: la ventana muestra la columna, la pelvis y las costillas como referencia.
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import numpy as np
from posturas import Pose
from vistas import tubo, costado, arriba, angulado, oblicuo

AP, PA, LAT_I, LAT_D = (0, 0, -1), (0, 0, 1), (1, 0, 0), (-1, 0, 0)
ABD = ['torax', 'L1', 'L2', 'L3', 'L4', 'L5', 'pelvis', 'muslo_R', 'muslo_L']
TOR = ['torax', 'cintura_R', 'cintura_L', 'C7', 'L1', 'L2']
CORTE = [('rodilla_R', (0, 1, 0), -0.10)]                # hasta un poco por encima de las rodillas
CRESTAS = 'medio:cresta_iliaca_R+cresta_iliaca_L|cresta_iliaca_R+cresta_iliaca_L'
SOBRE_CRESTA = 'medio:cresta_iliaca_R+cresta_iliaca_L|xifoides|0.25'      # ≈5 cm por encima de la cresta (incluye el diafragma)
L1 = 'centro:First lumbar vertebra'
L1_IZQ = f'medio:{L1}|centro:Left eleventh rib|0.25'      # L1, ≈2,5 cm a la izquierda de la columna
L1_MITAD_IZQ = f'medio:{L1}|centro:Left eleventh rib|0.5'
T6 = 'centro:Sixth thoracic vertebra'
SOBRE_SINF = 'medio:sinfisis|eias_R+eias_L|0.55'
DE_PIE = dict(arriba_img=(0, 1, 0))
SUP_H = dict(arriba_tubo=(0, 0, 1), desde=(0, 0, -1), arriba_img=(0, 1, 0))      # supino con rayo horizontal: vista desde el techo
DEC_I = dict(arriba_tubo=(-1, 0, 0), desde=(0, 1, 0), arriba_img=(-1, 0, 0))     # decúbito lateral izquierdo con rayo AP horizontal
F = {}

def par(id, pose, d, centro, ri, otra='costado', radio=0.20, encuadre=0.36, huesos=ABD, enc_otra=0.5, cortes=CORTE, **kw):
    """las dos vistas de una ficha"""
    kt = {k: v for k, v in kw.items() if k not in ('desde', 'arriba_img', 'arriba_tubo')}
    if 'arriba_tubo' in kw: kt['arriba'] = kw.pop('arriba_tubo')
    F[id + '-tubo'] = lambda: tubo(id, pose(), d, centro, ri, radio=radio, encuadre=encuadre, huesos=huesos, cortes=cortes, **kt)
    if otra == 'costado': F[id + '-otra'] = lambda: costado(id, pose(), d, centro, ri, huesos=huesos, encuadre=enc_otra, cortes=cortes, **kw)
    elif otra == 'arriba': F[id + '-otra'] = lambda: arriba(id, pose(), d, centro, ri, huesos=huesos, cortes=cortes,
                                                          **{k: v for k, v in kw.items() if k not in ('desde', 'arriba_img')})
def _arriba(p, s): return p.hombro_flex(s, 150).hombro_abd(s, -10).hombro_rot_ext(s, -65).codo_flex(s, 50)
_brazos = lambda: _arriba(_arriba(Pose(), 'R'), 'L')
_rod = lambda p, g=30: p.cadera_flex('R', g).cadera_flex('L', g).rodilla_flex('R', g * 1.5).rodilla_flex('L', g * 1.5)
_dec = lambda: _rod(_brazos(), 20)                       # decúbito lateral: brazos arriba, rodillas algo flexionadas
_un_brazo = lambda s: lambda: _arriba(Pose(), s)        # el brazo s arriba, el otro abajo
OBL = dict(otra='arriba', puntos=['cabeza_humero_L'])
R35, R3043, R2430 = (0.35, 0.43), (0.30, 0.35), (0.24, 0.30)

# ---------- abdomen ----------
par('abdomen-ap-supino', Pose, AP, CRESTAS, R35)
par('abdomen-ap-bipedestacion', Pose, AP, SOBRE_CRESTA, R35, **DE_PIE)
par('abdomen-decubito-lateral', _dec, AP, SOBRE_CRESTA, (0.43, 0.35), **DEC_I)
par('abdomen-decubito-dorsal', _brazos, LAT_I, SOBRE_CRESTA, (0.43, 0.35), **SUP_H)
# ---------- esófago (decúbito; T6) ----------
par('esofagograma-oad', _un_brazo('L'), oblicuo('PA', 37, 'R'), T6, R35, huesos=TOR, cortes=(), **OBL)
par('esofagograma-lateral', lambda: Pose().hombro_flex('R', 90), LAT_D, f'medio:{T6}|esternon_medio', R35, huesos=TOR, cortes=())
par('esofagograma-ap-pa', Pose, AP, T6, R35, huesos=TOR, cortes=())
# ---------- estómago (esténico: L1) ----------
par('estomago-pa', _brazos, PA, L1_IZQ, R35)
par('estomago-oad', lambda: _un_brazo('L')().cadera_flex('L', 30).rodilla_flex('L', 40), oblicuo('PA', 50, 'R'), L1_MITAD_IZQ, R3043, **OBL)
par('estomago-lateral-derecha', lambda: _rod(_brazos(), 20), LAT_D, f'medio:{L1}|xifoides|0.4', R3043)
par('estomago-ap', Pose, AP, L1_IZQ, R3043)
par('estomago-opi', lambda: Pose().cadera_flex('R', 30).rodilla_flex('R', 40), oblicuo('AP', 45, 'L'), L1_MITAD_IZQ, R3043, **OBL)
par('intestino-delgado-pa', Pose, PA, SOBRE_CRESTA, R35)
# ---------- colon (enema opaco) ----------
par('enema-opaco-pa-ap', Pose, PA, CRESTAS, R35)
par('enema-opaco-oblicuas--v1', _un_brazo('L'), oblicuo('PA', 40, 'R'), SOBRE_CRESTA, R35, **OBL)
par('enema-opaco-oblicuas--v2', _un_brazo('R'), oblicuo('PA', 40, 'L'), SOBRE_CRESTA, R35, **OBL)
par('enema-opaco-lateral-recto', lambda: _rod(Pose(), 30), LAT_I, 'medio:eias_L|centro:Sacrum|0.5', R2430, radio=0.14, encuadre=0.28)
par('enema-opaco-decubito-lateral', _dec, AP, CRESTAS, R35, **DEC_I)
BAJO_EIAS = 'medio:eias_R+eias_L|sinfisis|0.55'
par('enema-opaco-ap-pa-axial--v1', Pose, angulado(AP, 35, 'cefalico'), BAJO_EIAS, R3043, normal=AP)
par('enema-opaco-ap-pa-axial--v2', Pose, angulado(PA, 35, 'caudal'), 'medio:eias_R+eias_L|eias_R+eias_L', R3043, normal=PA)
_opi = oblicuo('AP', 35, 'L')
par('enema-opaco-ap-pa-axial--v3', Pose, angulado(_opi, 35, 'cefalico'), 'medio:eias_R|sinfisis|0.5', R3043, normal=_opi, **OBL)
# ---------- urinario ----------
par('urografia-ap', lambda: _rod(Pose(), 15), AP, CRESTAS, R35)
par('urografia-oblicuas', lambda: Pose().cadera_flex('L', 30).rodilla_flex('L', 45).codo_flex('L', 90), oblicuo('AP', 30, 'R'), CRESTAS, R35, **OBL)
par('urografia-ap-posmiccional', Pose, AP, 'medio:cresta_iliaca_R+cresta_iliaca_L|sinfisis|0.2', R35, **DE_PIE)
par('cistografia-ap-axial', Pose, angulado(AP, 12, 'caudal'), SOBRE_SINF, R3043, normal=AP, radio=0.14, encuadre=0.28)
par('cistografia-oblicuas', lambda: Pose().cadera_flex('L', 30).rodilla_flex('L', 45), oblicuo('AP', 50, 'R'), 'medio:sinfisis|eias_L|0.45', R3043,
    radio=0.14, encuadre=0.28, **OBL)
par('cistografia-lateral', Pose, LAT_I, 'medio:sinfisis|centro:Sacrum|0.35', R3043, radio=0.14, encuadre=0.28)
# ---------- portátiles ----------
T7 = 'centro:Seventh thoracic vertebra'
par('port-torax-ap--v1', Pose, angulado(AP, 4, 'caudal'), T7, (0.43, 0.35), normal=AP, huesos=TOR, cortes=())
_semi = lambda: Pose().cadera_flex('R', 50).cadera_flex('L', 50)
_v50 = (0, np.cos(np.radians(40)), np.sin(np.radians(40)))      # respaldo levantado: vertical de la sala con el tronco a 50°
par('port-torax-ap--v2', _semi, angulado(AP, 4, 'caudal'), T7, (0.43, 0.35), normal=AP, huesos=TOR, cortes=(), arriba_img=_v50)
par('port-abdomen-ap-supino', Pose, AP, CRESTAS, R35)
par('port-abdomen-decubito-lateral', _dec, AP, SOBRE_CRESTA, R35, **DEC_I)
_rot15 = lambda: Pose().cadera_rot_int('R', 10).cadera_rot_int('L', 10)
par('port-pelvis-cadera-ap--v1', _rot15, AP, 'medio:eias_R+eias_L|sinfisis', (0.43, 0.35), radio=0.15, encuadre=0.27)
par('port-pelvis-cadera-ap--v2', _rot15, AP, 'medio:eias_R|trocanter_mayor_R|0.5', R2430, radio=0.11, encuadre=0.22)
_dm = lambda: Pose().cadera_flex('L', 90).rodilla_flex('L', 90)
par('port-cadera-axiolateral-danelius', _dm, (-0.62, 0.78, 0.0), 'medio:cabeza_femur_R|trocanter_mayor_R', (0.30, 0.24), radio=0.11, encuadre=0.30,
    desde=(0, 0, -1), arriba_img=(0, 1, 0), ri_radio=0.16, arriba_tubo=(0, 0, 1))

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
