# Figuras de cráneo, huesos faciales, arcos cigomáticos, nasales, mandíbula, ATM y senos paranasales en el estilo por capas
# (Bontrager 9.ª ed., cap. 8). Uso (desde herramientas/ilus3d):  python3 figuras/craneo.py [id…]
# Líneas de la cabeza: se toma la cabeza del modelo en posición anatómica con la LIOM (plano de Frankfort) horizontal; la LOM
# queda 7° más empinada (adelante más alta). Con eso, "LOM ⊥ al RI" en una AP/PA es bajar el mentón 7°, y en la Waters
# (LOM a 37° del RI) se levanta el mentón 46° (la LOM pasa de 83° a 37° respecto del plano del RI). Las extensiones grandes se
# reparten entre el cuello y la cabeza. La boca abierta no se puede dibujar (el modelo no abre la mandíbula).
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import numpy as np
from posturas import Pose
from vistas import tubo, costado, arriba, angulado, oblicuo

AP, PA = (0, 0, -1), (0, 0, 1)
LAT_I, LAT_D = (1, 0, 0), (-1, 0, 0)        # lateral izquierda / derecha (ese lado contra el RI)
CRANEO = ['cabeza', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']
CUELLO = [('yugular', (0, 1, 0), 0.0)]
DE_PIE = dict(arriba_img=(0, 1, 0))
SUP_H = dict(arriba_tubo=(0, 0, 1), desde=(0, 0, -1), arriba_img=(0, 1, 0))     # supino con rayo horizontal: vista desde el techo
F = {}

def par(id, pose, d, centro, ri, otra='costado', radio=0.09, encuadre=0.20, huesos=CRANEO, enc_otra=0.30, cortes=CUELLO, **kw):
    """las dos vistas de una ficha"""
    kt = {k: v for k, v in kw.items() if k not in ('desde', 'arriba_img', 'arriba_tubo')}
    if 'arriba_tubo' in kw: kt['arriba'] = kw.pop('arriba_tubo')
    F[id + '-tubo'] = lambda: tubo(id, pose(), d, centro, ri, radio=radio, encuadre=encuadre, huesos=huesos, cortes=cortes, cara=True, **kt)
    if otra == 'costado': F[id + '-otra'] = lambda: costado(id, pose(), d, centro, ri, huesos=huesos, encuadre=enc_otra, cortes=cortes, **kw)
    elif otra == 'arriba': F[id + '-otra'] = lambda: arriba(id, pose(), d, centro, ri, huesos=huesos, cortes=cortes,
                                                          **{k: v for k, v in kw.items() if k not in ('desde', 'arriba_img')})
def cabeza(g, p=None):
    """flexión (+, mentón abajo) o extensión (-) de la cabeza; si pasa de 25°, la mitad la hace el cuello"""
    p = p or Pose()
    return p.cabeza_flex(g) if abs(g) <= 25 else p.cuello_flex(g / 2).cabeza_flex(g / 2)
LOM_PERP = lambda: cabeza(7)                 # LOM ⊥ al RI
WATERS = lambda: cabeza(-46)                 # LOM a 37° del RI (LMM ⊥)
WATERS_MOD = lambda: cabeza(-28)             # LOM a 55° del RI (LLM ⊥)
SMV = lambda: cabeza(-90)                    # cuello hiperextendido, LIOM paralela al RI (vértex contra el RI)
SOBRE_MAE = 'medio:meato_auditivo_R|vertex|0.5'            # ≈5 cm por encima del MAE
MALAR = 'medio:meato_auditivo_R|nasion|0.55'               # entre el MAE y el canto externo
GONIONES = 'medio:gonion_R+gonion_L|menton|0.3'            # entre los ángulos de la mandíbula, por debajo de la sínfisis

# ---------- cráneo ----------
par('craneo-ap-axial-towne', LOM_PERP, angulado(AP, 30, 'caudal'), 'medio:glabela|vertex|0.45', (0.24, 0.30), normal=AP)
par('craneo-lateral', Pose, LAT_I, SOBRE_MAE, (0.30, 0.24), **DE_PIE)
par('craneo-pa-caldwell', LOM_PERP, angulado(PA, 15, 'caudal'), 'nasion', (0.24, 0.30), normal=PA, **DE_PIE)
par('craneo-smv', SMV, AP, 'medio:meato_auditivo_R+meato_auditivo_L|nasion|0.2', (0.24, 0.30), **DE_PIE)
par('craneo-trauma-lateral', Pose, LAT_I, SOBRE_MAE, (0.30, 0.24), **SUP_H)
# traumatismo: la cabeza no se mueve; AP con el RC paralelo a la LOM (7° caudal respecto de la cabeza en posición anatómica)
par('craneo-trauma-ap-axial', Pose, angulado(AP, 7, 'caudal'), 'glabela', (0.24, 0.30), normal=AP)

# ---------- huesos faciales ----------
par('faciales-lateral', Pose, LAT_I, MALAR, (0.18, 0.24), **DE_PIE)
par('faciales-parietoacantial-waters--v1', WATERS, PA, 'acantion', (0.18, 0.24), **DE_PIE)
par('faciales-parietoacantial-waters--v2', WATERS_MOD, PA, 'acantion', (0.18, 0.24), **DE_PIE)
par('faciales-pa-axial-caldwell', LOM_PERP, angulado(PA, 15, 'caudal'), 'nasion', (0.18, 0.24), normal=PA, **DE_PIE)
par('faciales-trauma-lateral', Pose, LAT_I, MALAR, (0.18, 0.24), **SUP_H)
# Waters inversa: RC paralelo a la LMM (46° cefálico respecto de la LIOM horizontal)
par('faciales-trauma-waters-inversa', Pose, angulado(AP, 46, 'cefalico'), 'acantion', (0.18, 0.24), normal=AP)
# Rhese: PMS a 53° del RI (cabeza girada 37° desde la PA), órbita derecha abajo
par('agujeros-opticos-rhese', lambda: cabeza(-8), oblicuo('PA', 37, 'R'), 'medio:nasion|centro:Right zygomatic bone|0.5', (0.24, 0.18), otra='arriba',
    puntos=['meato_auditivo_R', 'meato_auditivo_L'])

# ---------- arcos cigomáticos y nasales ----------
par('arcos-smv', SMV, AP, GONIONES, (0.30, 0.24), **DE_PIE)
par('arcos-tangencial', lambda: SMV().cabeza_rot('R', 15).cabeza_lat('R', 15), AP, 'centro:Right zygomatic bone', (0.18, 0.24), **DE_PIE)
par('arcos-ap-axial-towne', LOM_PERP, angulado(AP, 30, 'caudal'), 'medio:nasion|vertex|0.2', (0.24, 0.18), normal=AP)
par('nasales-lateral', Pose, LAT_I, 'medio:nasion|acantion|0.2', (0.24, 0.18), radio=0.06, encuadre=0.15, **DE_PIE)
# superoinferior: mentón extendido sobre el RI horizontal; RC paralelo a la línea glabeloalveolar, tangencial a la glabela
def _lga():
    from escena import cuerpo; from puntos import Puntos
    c = cuerpo(); c.posar(cabeza(-30)); P_ = Puntos(c); v = P_.posado('acantion') - P_.posado('glabela'); return tuple(v / np.linalg.norm(v))
par('nasales-superoinferior', lambda: cabeza(-30), _lga(), 'medio:nasion|acantion|0.2', (0.24, 0.18), radio=0.06, encuadre=0.15, **DE_PIE)

# ---------- mandíbula ----------
par('mandibula-pa', LOM_PERP, PA, 'medio:acantion|menton|0.5', (0.18, 0.24), **DE_PIE)
# axiolateral: lado de interés (derecho) contra el RI, mentón extendido; RC 25° cefálico
par('mandibula-axiolateral', lambda: cabeza(-15), angulado(LAT_D, 25, 'cefalico'), 'medio:gonion_R|menton|0.4', (0.24, 0.18), normal=LAT_D, **DE_PIE)
_dtr = angulado(LAT_D, 25, 'cefalico'); _dtr = tuple(np.add(_dtr, (0, 0, -0.15)) / np.linalg.norm(np.add(_dtr, (0, 0, -0.15))))
par('mandibula-axiolateral-trauma', Pose, _dtr, 'medio:gonion_R|menton|0.4', (0.24, 0.18), normal=LAT_D, **SUP_H)
par('mandibula-ap-axial', LOM_PERP, angulado(AP, 35, 'caudal'), 'glabela', (0.24, 0.18), normal=AP)

# ---------- ATM (lado afectado abajo = derecho; la segunda exposición, con la boca abierta, no se puede dibujar) ----------
for v in ('v1', 'v2'):
    par(f'atm-law-modificado--{v}', lambda: Pose().cabeza_rot('R', 15), angulado(LAT_D, 15, 'caudal'), 'medio:meato_auditivo_L|vertex|0.45', (0.24, 0.18),
        normal=LAT_D, **DE_PIE)
    par(f'atm-schuller--{v}', Pose, angulado(LAT_D, 27, 'caudal'), 'medio:meato_auditivo_L|vertex|0.55', (0.24, 0.18), normal=LAT_D, **DE_PIE)

# ---------- senos paranasales (sentado, RC horizontal) ----------
par('senos-lateral', Pose, LAT_I, MALAR, (0.18, 0.24), **DE_PIE)
_v15 = (0, np.cos(np.radians(15)), np.sin(np.radians(15)))           # vertical de la sala con la cabeza a 15°
par('senos-pa-caldwell--v1', LOM_PERP, angulado(PA, 15, 'caudal'), 'nasion', (0.18, 0.24), normal=PA, arriba_tubo=_v15, arriba_img=_v15)   # RI inclinado 15°
par('senos-pa-caldwell--v2', LOM_PERP, angulado(PA, 15, 'caudal'), 'nasion', (0.18, 0.24), arriba_tubo=_v15, arriba_img=_v15)              # cabeza inclinada
par('senos-parietoacantial-waters', WATERS, PA, 'acantion', (0.18, 0.24), **DE_PIE)
par('senos-smv', SMV, AP, GONIONES, (0.18, 0.24), **DE_PIE)

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
