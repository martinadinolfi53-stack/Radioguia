# Figuras de antebrazo y codo. Uso (desde herramientas/ilus3d):  python3 figuras/codo.py [id…]
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from escena import figura, corte
from posturas import Pose

BRAZO = ['brazo_R', 'cubito_R', 'radio_R', 'mano_R']
_P = ['codo_R', 'grande_R', 'epicondilo_lat_R', 'epicondilo_med_R', 'olecranon_R', 'estiloides_radio_R', 'estiloides_cubito_R',
      'mcf3_R', 'punta_dedo3_R', 'punta_dedo1_R', 'centro:Right radius', 'centro:Right ulna']
F = {}

# AP (antebrazo y codo): sentado al costado de la mesa, brazo extendido hacia adelante sobre la mesa, mano en supinación
# (palma arriba) y epicóndilos paralelos al RI. Vista desde el tubo; el húmero se corta unos 12-14 cm por encima del codo.
# (el modelo tiene el húmero rotado unos 7° hacia externo en reposo: -7° deja los epicóndilos paralelos al RI)
R0 = -7
# En el modelo el antebrazo en reposo ya forma unos 15° con el húmero (ángulo de carga): codo_flex(g) deja un ángulo entre
# húmero y antebrazo de 165° - g. FLEX(90) da los 90° reales de la ficha.
FLEX = lambda g: g - 15
_ap = lambda: Pose().hombro_flex('R', 90).hombro_rot_ext('R', R0)
F['antebrazo-ap'] = lambda: figura('antebrazo-ap', _ap(), dir=(0, -1, 0), horizontal=('codo_R', 'grande_R'),
    huesos=BRAZO, region=BRAZO, cortes=[('codo_R', 'distal', 0.12)], puntos=_P)
F['codo-ap--v1'] = lambda: figura('codo-ap--v1', _ap(), dir=(0, -1, 0), horizontal=('codo_R', 'grande_R'),
    huesos=BRAZO, region=BRAZO, cortes=[('codo_R', 'distal', 0.14), ('codo_R', (0, 0, -1), 0.16)], puntos=_P)
# corte del codo en extensión, visto desde la mano (para mostrar los epicóndilos paralelos al RI)
F['codo-ap-corte'] = lambda: corte('codo-ap-corte', _ap(), 'codo_R', normal=(0, 0, 1), arriba=(0, 1, 0), huesos=BRAZO, region=BRAZO,
    puntos=['epicondilo_lat_R', 'epicondilo_med_R'])

# Flexión parcial (codo que no se extiende): vista de costado, desde lateral. v2: húmero apoyado y antebrazo levantado;
# v3: antebrazo apoyado y húmero levantado. Se dibuja con el codo flexionado unos 35°.
F['codo-ap--v2'] = lambda: figura('codo-ap--v2', Pose().hombro_flex('R', 90).hombro_rot_ext('R', R0).codo_flex('R', 35), dir=(1, 0, 0),
    huesos=BRAZO, region=BRAZO, cortes=[('codo_R', 'distal', 0.18), ('olecranon_R', 'proximal', 0.2)], puntos=_P)
F['codo-ap--v3'] = lambda: figura('codo-ap--v3', Pose().hombro_flex('R', 55).hombro_rot_ext('R', R0).codo_flex('R', 35), dir=(1, 0, 0),
    huesos=BRAZO, region=BRAZO, cortes=[('codo_R', 'distal', 0.18), ('olecranon_R', 'proximal', 0.2)], puntos=_P)

# Oblicuas: desde la AP, todo el miembro rotado 45° hacia interno (mano en pronación) o hacia externo (supinación).
# Se muestran desde el tubo y con un corte a la altura de los epicóndilos visto desde la mano.
_obm = lambda: Pose().hombro_flex('R', 90).hombro_rot_ext('R', R0 - 45).prono('R', 180)
_obl = lambda: Pose().hombro_flex('R', 90).hombro_rot_ext('R', R0 + 45)
for _v, _p in (('v1', _obm), ('v2', _obl)):
    F[f'codo-ap-oblicua--{_v}'] = (lambda v=_v, p=_p: figura(f'codo-ap-oblicua--{v}', p(), dir=(0, -1, 0),
        horizontal=('codo_R', 'grande_R'), huesos=BRAZO, region=BRAZO,
        cortes=[('codo_R', 'distal', 0.14), ('codo_R', (0, 0, -1), 0.16)], puntos=_P))
    F[f'codo-ap-oblicua--{_v}-corte'] = (lambda v=_v, p=_p: corte(f'codo-ap-oblicua--{v}-corte', p(), 'codo_R', normal=(0, 0, 1),
        arriba=(0, 1, 0), huesos=BRAZO, region=BRAZO, puntos=['epicondilo_lat_R', 'epicondilo_med_R']))

# Lateromedial (antebrazo y codo): codo a 90°, hombro bajado para que húmero y antebrazo apoyen en el mismo plano,
# mano y muñeca en lateral verdadera (pulgar arriba). Vista desde el tubo. Con el hombro en abducción, la supinación del
# modelo (prono 0) deja el pulgar arriba; la pronación de Coyle (palma abajo) es prono 90.
_lat = lambda: Pose().hombro_abd('R', 90).hombro_rot_ext('R', R0).codo_flex('R', FLEX(90))
F['antebrazo-lateral'] = lambda: figura('antebrazo-lateral', _lat(), dir=(0, -1, 0), vertical=('codo_R', 'centro:Right humerus'),
    huesos=BRAZO, region=BRAZO, cortes=[('codo_R', 'distal', 0.12)], puntos=_P)
F['codo-lateral'] = lambda: figura('codo-lateral', _lat(), dir=(0, -1, 0), vertical=('codo_R', 'centro:Right humerus'),
    huesos=BRAZO, region=BRAZO, cortes=[('codo_R', 'distal', 0.14), ('codo_R', (0, 0, -1), 0.16)], puntos=_P)

# Coyle: lateral de codo con el RC angulado 45°. v1 (cabeza del radio): codo a 90°, mano en pronación, RC hacia el hombro.
# v2 (coronoides): codo flexionado solo 80°, RC alejándose del hombro. Vista desde el tubo, como la lateral.
F['codo-axial-coyle--v1'] = lambda: figura('codo-axial-coyle--v1', Pose().hombro_abd('R', 90).hombro_rot_ext('R', R0).codo_flex('R', FLEX(90)).prono('R', 90),
    dir=(0, -1, 0), vertical=('codo_R', 'centro:Right humerus'), huesos=BRAZO, region=BRAZO,
    cortes=[('codo_R', 'distal', 0.14), ('codo_R', (0, 0, -1), 0.18)], puntos=_P)
F['codo-axial-coyle--v2'] = lambda: figura('codo-axial-coyle--v2', Pose().hombro_abd('R', 90).hombro_rot_ext('R', R0).codo_flex('R', FLEX(80)).prono('R', 90),
    dir=(0, -1, 0), vertical=('codo_R', 'centro:Right humerus'), huesos=BRAZO, region=BRAZO,
    cortes=[('codo_R', 'distal', 0.14), ('codo_R', (0, 0, -1), 0.18)], puntos=_P)

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        print(k, F[k]())
