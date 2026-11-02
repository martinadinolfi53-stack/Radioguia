# AP oblicuas de rodilla con rotación medial y lateral en el estilo por capas (Bontrager 9.ª ed., págs. 131-132).
# Uso (desde herramientas/ilus3d):  python3 figuras/rodilla_vistas.py [id…]  ->  render/<id>-tubo y render/<id>-otra
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import numpy as np
from posturas import Pose
from vistas import tubo, costado
from rodilla import R0K, MIEMBRO

AP = (0, 0, -1)
PUNTOS = ['epicondilo_med_fem_R', 'epicondilo_lat_fem_R', 'vertice_rotula_R']
F = {}

# AP oblicuas: semidecúbito supino, pierna extendida; toda la extremidad rotada 45° hacia adentro (medial) o hacia afuera
# (lateral). RC ⊥ en la parte media del espacio articular, 1,25 cm por debajo del vértice de la rótula. La segunda vista mira
# desde los pies, con toda la pierna: se ve el pie girado 45° y, por transparencia, el fémur con sus epicóndilos. Sin la rótula:
# en el avatar la piel de delante de la rodilla queda 1-2 cm por detrás de la rótula del modelo anatómico y la rótula asomaría.
ESPACIO = 'medio:vertice_rotula_R|tuberosidad_tibial_R|0.3'
# El muslo se corta cerca de la rodilla: más arriba la piel se mezcla con la pelvis y no acompaña del todo el giro de 45° del fémur.
MUSLO = [('rodilla_R', 'distal', 0.15), ('rodilla_R', 'proximal', 0.22)]
BAJO_RODILLA = [('tuberosidad_tibial_R', (0, 1, 0), 0.0)]
for v, g in (('v1', 45), ('v2', -45)):
    pose = lambda g=g: Pose().cadera_rot_int('R', R0K + g)
    F[f'rodilla-ap-oblicuas--{v}-tubo'] = lambda id=f'rodilla-ap-oblicuas--{v}', pose=pose: tubo(id, pose(), AP, ESPACIO, (0.24, 0.30),
        huesos=MIEMBRO, cortes=MUSLO, radio=0.10, encuadre=0.22, puntos=PUNTOS)
    F[f'rodilla-ap-oblicuas--{v}-otra'] = lambda id=f'rodilla-ap-oblicuas--{v}', pose=pose: costado(id, pose(), AP, ESPACIO, (0.24, 0.30),
        huesos=['muslo_R', 'pierna_R'], region=MIEMBRO, cortes=[('rodilla_R', 'distal', 0.15)], desde=(0, 1, 0), arriba_img=(0, 0, 1), encuadre=0.36,
        puntos=PUNTOS)

# Merchant (pág. 142) queda con el dibujo a mano: con las rodillas flexionadas la piel del avatar queda 1-3 cm por detrás de la
# rótula y del fémur del modelo anatómico y los huesos asoman por delante de la piel.

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
