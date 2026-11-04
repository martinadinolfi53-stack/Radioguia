# Figuras de pelvis, caderas, acetábulo y fémur en el estilo por capas (Bontrager 9.ª ed., cap. 5).
# Uso (desde herramientas/ilus3d):  python3 figuras/pelvis.py [id…]   ->  render/<id>-tubo y render/<id>-otra
# Convenciones de vistas.py: el paciente queda de pie y lo que gira es el rayo; "decúbito supino" = rayo AP con la mesa
# (y el RI) detrás. Las caderas pediátricas siguen con el dibujo a mano (el modelo es adulto).
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from posturas import Pose
from vistas import tubo, costado, arriba, angulado, oblicuo

AP, PA = (0, 0, -1), (0, 0, 1)
R0K = -5                         # rotación del muslo que deja los epicóndilos femorales paralelos a la mesa (ver rodilla.py)
ROT = lambda g: R0K + g          # rotación interna de g grados desde esa posición neutra
PELVIS = ['pelvis', 'muslo_R', 'muslo_L', 'L5', 'L4', 'L3']
FEMUR = ['pelvis', 'muslo_R', 'rotula_R', 'pierna_R']
F = {}
def par(id, pose, d, centro, ri, otra='costado', radio=0.15, encuadre=0.27, huesos=PELVIS, enc_otra=0.40, **kw):
    """las dos vistas de una ficha"""
    kt = {k: v for k, v in kw.items() if k not in ('desde', 'arriba_img', 'arriba_tubo')}
    if 'arriba_tubo' in kw: kt['arriba'] = kw.pop('arriba_tubo')
    if 'region_tubo' in kw: kt['region'] = kw.pop('region_tubo'); kt.pop('region_tubo', None)
    F[id + '-tubo'] = lambda: tubo(id, pose(), d, centro, ri, radio=radio, encuadre=encuadre, huesos=huesos, **kt)
    kw = {k: v for k, v in kw.items() if k not in ('huesos_hasta', 'piel_modelo')}
    if 'region_otra' in kw: kw['region'] = kw.pop('region_otra'); kt.pop('region_otra', None)
    if otra == 'costado': F[id + '-otra'] = lambda: costado(id, pose(), d, centro, ri, huesos=huesos, encuadre=enc_otra, **kw)
    # desde la cabeza: el tronco cortado 4 cm por encima de la cresta, para ver el giro de la pelvis sin el tórax delante
    elif otra == 'arriba': F[id + '-otra'] = lambda: arriba(id, pose(), d, centro, ri, huesos=huesos, cortes=[('cresta_iliaca_R', (0, -1, 0), 0.04)], region=TRONCO_BAJO,
                                                          **{k: v for k, v in kw.items() if k not in ('desde', 'arriba_img')})

TRONCO_BAJO = ['pelvis', 'L3', 'L5', 'muslo_R', 'muslo_L', 'pierna_R', 'pierna_L']     # sin brazos ni pies: solo el giro de la pelvis
_rot = lambda g=17: Pose().cadera_rot_int('R', ROT(g)).cadera_rot_int('L', ROT(g))       # las dos piernas con rotación interna 15-20°
EIAS = 'eias_R+eias_L'
# AP de pelvis: RC a mitad de camino entre las EIAS y la sínfisis
par('pelvis-ap', _rot, AP, f'medio:{EIAS}|sinfisis', (0.43, 0.35))
# AP bilateral de caderas: RC en el punto medio entre las cabezas femorales
par('caderas-ap-bilateral', _rot, AP, 'medio:cabeza_femur_R+cabeza_femur_L|sinfisis|0.2', (0.43, 0.35))
# AP unilateral: RC 2,5-5 cm distal a la mitad del cuello femoral
par('caderas-ap-unilateral', lambda: _rot(17), AP, 'medio:cabeza_femur_R+trocanter_mayor_R|rodilla_R|0.08', (0.24, 0.30), radio=0.11, encuadre=0.22)
# inlet: RC 40° caudal a la altura de las EIAS; outlet: 20-45° cefálico, 2,5-5 cm por debajo de la sínfisis
par('pelvis-ap-axial-inlet', Pose, angulado(AP, 40, 'caudal'), f'medio:{EIAS}|{EIAS}', (0.43, 0.35), normal=AP)
par('pelvis-ap-axial-outlet', Pose, angulado(AP, 32, 'cefalico'), 'medio:sinfisis|rodilla_R+rodilla_L|0.08', (0.43, 0.35), normal=AP)
# rana: las caderas quedan muy flexionadas y abducidas, y la piel del avatar no acompaña del todo a los huesos (la rodilla
# asomaba): desde el tubo se dibujan solo los huesos a menos de 18 cm del RC (pelvis y fémur proximal). La segunda vista es desde los pies, con la mesa abajo, para que se vea el
# ángulo del muslo con la vertical (medido proyectando cabeza femoral -> rodilla sobre el plano transversal).
PIES = (0, 1, 0)
# rana bilateral: caderas y rodillas flexionadas, fémures abducidos 40-45° desde la vertical (acá 42°), plantas juntas
_rana = lambda: (Pose().cadera_flex('R', 60).cadera_abd('R', 40).rodilla_flex('R', 95)
                 .cadera_flex('L', 60).cadera_abd('L', 40).rodilla_flex('L', 95))
par('cadera-lateral-rana-bilateral', _rana, AP, 'medio:cabeza_femur_R+cabeza_femur_L|cabeza_femur_R+cabeza_femur_L', (0.43, 0.35), encuadre=0.42, enc_otra=0.55,
    desde=PIES, huesos_hasta=0.18, puntos=['rodilla_R', 'rodilla_L', 'cabeza_femur_R', 'cabeza_femur_L'])
# rana unilateral: v1 cuello femoral (fémur abducido 45° desde la vertical)
_rana1 = lambda: Pose().cadera_flex('R', 60).cadera_abd('R', 43).rodilla_flex('R', 95)
par('cadera-lateral-rana-unilateral--v1', _rana1, AP, 'medio:cabeza_femur_R|trocanter_mayor_R', (0.30, 0.24), radio=0.11, encuadre=0.30, enc_otra=0.5,
    desde=PIES, huesos_hasta=0.14, puntos=['rodilla_R', 'cabeza_femur_R'])
# v2 cabeza y acetábulo: paciente oblicuo 35-45° hacia el lado afectado (acá 40°) y el muslo abducido hasta apoyarse en la
# mesa. Pose buscada para que rodilla y tobillo queden a la altura de la mesa (≈7 y ≈6 cm sobre el apoyo, el grosor del muslo
# y de la pierna) y no colgando por debajo: el muslo queda a 99° de la vertical, con algo de rotación externa
_rana2 = lambda: Pose().cadera_flex('R', 75).cadera_abd('R', 60).rodilla_flex('R', 100).cadera_rot_int('R', -20)
par('cadera-lateral-rana-unilateral--v2', _rana2, oblicuo('AP', 40, 'R'), 'medio:cabeza_femur_R|trocanter_mayor_R', (0.30, 0.24), radio=0.11, encuadre=0.30,
    enc_otra=0.5, desde=PIES, huesos_hasta=0.14, normal=oblicuo('AP', 40, 'R'), puntos=['rodilla_R', 'cabeza_femur_R', 'eias_R', 'eias_L'])
# Danelius-Miller: decúbito supino, pierna sana flexionada y levantada, afectada con 15° de rotación interna; RC horizontal
# (paralelo a la mesa) desde abajo y medial, perpendicular al cuello femoral; RI vertical contra el costado, sobre la cresta
_dm = lambda: Pose().cadera_flex('L', 90).rodilla_flex('L', 90).cadera_rot_int('R', ROT(15))
par('cadera-axiolateral-danelius-miller', _dm, (-0.62, 0.78, 0.0), 'medio:cabeza_femur_R|trocanter_mayor_R', (0.30, 0.24), radio=0.11,
    encuadre=0.30, desde=(0, 0, -1), arriba_img=(0, 1, 0), ri_radio=0.16, arriba_tubo=(0, 0, 1))   # desde el tubo: el techo arriba, como acostado
# Judet: oblicua posterior 45°; acá la cadera de abajo (derecha): RC 5 cm distal y 5 cm medial a la EIAS
par('acetabulo-oblicua-posterior-judet', Pose, oblicuo('AP', 45, 'R'), 'medio:eias_R|sinfisis|0.4', (0.24, 0.30), radio=0.12, encuadre=0.24,
    otra='arriba')
# Teufel: semidecúbito prono sobre el lado afectado, oblicua anterior 35-40°, RC 12° cefálico al acetábulo
par('acetabulo-pa-oblicua-axial-teufel', Pose, angulado(oblicuo('PA', 37, 'R'), 12, 'cefalico'), 'medio:cabeza_femur_R|cresta_iliaca_R|0.08',
    (0.24, 0.30), normal=oblicuo('PA', 37, 'R'), radio=0.12, encuadre=0.24)
# fémur: AP con ≈5° de rotación interna; lateral en decúbito lateral sobre el lado afectado, rodilla a 45° y la pierna sana
# hacia atrás; lateral con haz horizontal en supino, RI entre las piernas
# fémur: el avatar se ve semitransparente en toda la ventana (es larga), así que desde el tubo se dibuja solo la pierna
# derecha y la pelvis (sin la mano ni la otra pierna, que se veían como fantasmas encima del muslo), con la piel del modelo
# anatómico: la del avatar es más fina y el fémur distal asomaba por delante del muslo
PIERNA_D = ['pelvis', 'muslo_R', 'rotula_R', 'pierna_R', 'pie_R', 'dedos_pie_R']
# Martin (4/11, tarjeta de decisión): el fémur va en UN solo RI que tenga dentro las dos articulaciones (rodilla y
# femoroacetabular). En el modelo hay 46,6 cm de la cabeza femoral a la interlínea de la rodilla, así que el RI se dibuja de
# 53 cm de alto (esquema no a escala, el rótulo sigue diciendo 35 × 43) con ≈3 cm de margen más allá de cada articulación;
# el centro (RC "a la parte media del RI") queda a mitad de camino entre la interlínea (2,7 cm bajo rodilla_R) y el techo
# del acetábulo (≈2 cm sobre la cabeza): 0,49 del camino de rodilla_R a la cabeza femoral.
FEMUR_RC = 'medio:rodilla_R|cabeza_femur_R|0.49'
FEMUR_RI = (0.35, 0.53)
# haz horizontal: fémur medio y distal (trauma), RI de 43 con la rodilla, borde inferior ≈5 cm bajo la interlínea
FEMUR_DIST_RC = 'medio:rodilla_R|cabeza_femur_R|0.335'
# Martin (4/11): en fémur solo tienen que verse la rodilla y la articulación femoroacetabular, no la cadera entera: de la pelvis
# se dibuja solo lo que está a menos de 7 cm de la cabeza femoral (el acetábulo)
ACETABULO = [('pelvis', 'cabeza_femur_R', 0.07)]
par('femur-ap', lambda: Pose().cadera_rot_int('R', ROT(5)), AP, FEMUR_RC, FEMUR_RI, radio=0.30, encuadre=0.50, huesos=FEMUR, otra=None, piel_modelo=True, hueso_cerca=ACETABULO)
par('femur-lateral', lambda: Pose().rodilla_flex('R', 45).cadera_flex('R', 20).cadera_flex('L', -35), (-1, 0, 0), FEMUR_RC, FEMUR_RI,
    radio=0.30, encuadre=0.50, huesos=FEMUR, ri_radio=0.33, region_tubo=PIERNA_D, piel_modelo=True, otra=None, hueso_cerca=ACETABULO)
par('femur-lateral-haz-horizontal', lambda: Pose().cadera_flex('R', 8).cadera_abd('L', 12), (1, 0, 0), FEMUR_DIST_RC, (0.35, 0.43), radio=0.27,
    encuadre=0.34, huesos=FEMUR, ri_radio=0.12, arriba_tubo=(0, 0, 1), desde=(0, 0, -1), arriba_img=(0, 1, 0), enc_otra=0.75, region_tubo=PIERNA_D,
    piel_modelo=True, hueso_cerca=ACETABULO)

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
