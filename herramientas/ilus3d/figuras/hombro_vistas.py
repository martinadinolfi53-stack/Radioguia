# Fichas de hombro rehechas con las vistas genéricas (vistas.py) tras la revisión de Martin contra el Bontrager:
# Garth (págs. 90-91, fig. 3.34), PA transaxilar de Hobbs (pág. 77, fig. 3.17) y oblicua PA / Neer (pág. 85, figs. 3.26-3.27).
# Uso (desde herramientas/ilus3d):  python3 figuras/hombro_vistas.py [id…]  ->  render/<id>-tubo y render/<id>-otra
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from posturas import Pose
from vistas import tubo, costado, arriba, angulado, oblicuo
from hombro import R0, MUSCULOS, ventana

TORSO = ['cintura_R', 'brazo_R', 'cubito_R', 'radio_R', 'torax', 'C7', 'C6', 'cintura_L', 'brazo_L']     # sin las manos: los dedos del avatar no coinciden con los huesos
SIN_ANTEBRAZO = ['cintura_R', 'brazo_R', 'torax', 'C7', 'C6', 'cintura_L']   # antebrazo cruzado o brazo sano flexionado: los huesos asomaban por la piel del avatar
CORTE = [('xifoides', (0, 1, 0), 0.10)]
HOMBRO_V = dict(musculos=MUSCULOS, destacar=ventana('cabeza_humero_R')['destacar'], contexto=['torax', 'C7', 'C6'])
F = {}

# Garth: de pie, oblicua posterior 45° con el hombro afectado contra el RI, codo flexionado y mano sobre el otro hombro;
# RC 45° caudal a la cara medial de la articulación escapulohumeral. Desde el tubo se mira de frente al RI (como la fig. 3.34)
# y de costado se ve el RC bajando 45° hacia el RI vertical.
_garth = lambda: Pose().hombro_flex('R', 50).mov('brazo_R', (0, 0, 1), 20).hombro_rot_ext('R', -100).codo_flex('R', 100)
G = oblicuo('AP', 45, 'R')
F['hombro-garth-tubo'] = lambda: tubo('hombro-garth', _garth(), angulado(G, 45, 'caudal'), 'cabeza_humero_R', (0.24, 0.30), normal=G, vista=G,
    huesos=SIN_ANTEBRAZO, cortes=CORTE, radio=0.10, encuadre=0.30, cara=True, **HOMBRO_V)
F['hombro-garth-otra'] = lambda: costado('hombro-garth', _garth(), angulado(G, 45, 'caudal'), 'cabeza_humero_R', (0.24, 0.30), normal=G,
    huesos=SIN_ANTEBRAZO, cortes=CORTE, encuadre=0.45, arriba_img=(0, 1, 0), puntos=['cabeza_humero_L'])

# Hobbs: PA, de pie o en decúbito; brazo afectado elevado en extensión completa (junto a la cabeza) y cabeza girada al otro lado;
# RC perpendicular al RI, centrado en la articulación glenohumeral. RI 18 × 24 vertical.
_hobbs = lambda: Pose().hombro_flex('R', 170).hombro_abd('R', -8).hombro_rot_ext('R', R0).cabeza_rot('L', 60)
F['hombro-transaxilar-hobbs-tubo'] = lambda: tubo('hombro-transaxilar-hobbs', _hobbs(), (0, 0, 1), 'cabeza_humero_R', (0.18, 0.24),
    huesos=TORSO, cortes=CORTE, radio=0.10, encuadre=0.40, cara=True, **HOMBRO_V)
F['hombro-transaxilar-hobbs-otra'] = lambda: costado('hombro-transaxilar-hobbs', _hobbs(), (0, 0, 1), 'cabeza_humero_R', (0.18, 0.24),
    huesos=TORSO, cortes=CORTE, encuadre=0.55, arriba_img=(0, 1, 0))

# Y de escápula / Neer: desde la PA, oblicua anterior 45-60° (52°) con el hombro afectado contra el RI (cuerpo de la escápula
# perpendicular al RI); brazo sano hacia arriba por delante (mano en la nuca, como en las fotos), afectado abajo. RC ⊥ a la
# articulación escapulohumeral; Neer: 10-15° caudal al borde superior de la cabeza humeral. Desde arriba se ve el giro.
_neer = lambda: (Pose().hombro_abd('R', 10).hombro_rot_ext('R', R0 - 45).prono('R', 45)
                 .hombro_flex('L', 60).hombro_abd('L', 110).hombro_rot_ext('L', R0 + 40).codo_flex('L', 120))
N = oblicuo('PA', 52, 'R')
F['hombro-y-escapula-neer-tubo'] = lambda: tubo('hombro-y-escapula-neer', _neer(), N, 'cabeza_humero_R', (0.24, 0.30),
    huesos=SIN_ANTEBRAZO, cortes=CORTE, radio=0.11, encuadre=0.36, cara=True, **HOMBRO_V)
F['hombro-y-escapula-neer-otra'] = lambda: arriba('hombro-y-escapula-neer', _neer(), N, 'cabeza_humero_R', (0.24, 0.30),
    huesos=SIN_ANTEBRAZO, cortes=CORTE, puntos=['cabeza_humero_L'])

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
