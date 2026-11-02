# Fichas de rodilla y rótula en el estilo por capas que faltaban (Bontrager 9.ª ed.): AP oblicuas con rotación medial y lateral
# (págs. 131-132) y axial tangencial bilateral de rótula de Merchant (pág. 142).
# Uso (desde herramientas/ilus3d):  python3 figuras/rodilla_vistas.py [id…]  ->  render/<id>-tubo y render/<id>-otra
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import numpy as np
from posturas import Pose
from vistas import tubo, costado
from rodilla import R0K, MIEMBRO, AMBAS

AP = (0, 0, -1)
PUNTOS = ['epicondilo_med_fem_R', 'epicondilo_lat_fem_R', 'vertice_rotula_R']
F = {}

# AP oblicuas: semidecúbito supino, pierna extendida; toda la extremidad rotada 45° hacia adentro (medial) o hacia afuera
# (lateral). RC ⊥ en la parte media del espacio articular, 1,25 cm por debajo del vértice de la rótula. La segunda vista mira
# desde los pies con la pierna cortada a la altura de la tuberosidad tibial: se ven la tibia, el peroné y los epicóndilos girados.
ESPACIO = 'medio:vertice_rotula_R|tuberosidad_tibial_R|0.3'
# El muslo se corta cerca de la rodilla: más arriba la piel se mezcla con la pelvis y no acompaña del todo el giro de 45° del fémur.
MUSLO = [('rodilla_R', 'distal', 0.15), ('rodilla_R', 'proximal', 0.22)]
BAJO_RODILLA = [('tuberosidad_tibial_R', (0, 1, 0), 0.0)]
for v, g in (('v1', 45), ('v2', -45)):
    pose = lambda g=g: Pose().cadera_rot_int('R', R0K + g)
    F[f'rodilla-ap-oblicuas--{v}-tubo'] = lambda id=f'rodilla-ap-oblicuas--{v}', pose=pose: tubo(id, pose(), AP, ESPACIO, (0.24, 0.30),
        huesos=MIEMBRO, cortes=MUSLO, radio=0.10, encuadre=0.22, puntos=PUNTOS)
    F[f'rodilla-ap-oblicuas--{v}-otra'] = lambda id=f'rodilla-ap-oblicuas--{v}', pose=pose: costado(id, pose(), AP, ESPACIO, (0.24, 0.30),
        huesos=MIEMBRO, region=['muslo_R', 'pierna_R'], cortes=BAJO_RODILLA, desde=(0, 1, 0), arriba_img=(0, 0, 1), encuadre=0.30, puntos=PUNTOS)

# Merchant: decúbito supino, rodillas flexionadas 40° sobre soportes (fémures sobre la mesa, piernas colgando); RC 30° respecto
# de la horizontal, desde el lado de la cabeza hacia los pies, al punto medio entre las rótulas; RI apoyado contra las piernas
# unos 30 cm distal a las rótulas, perpendicular al RC. Supino con el cuerpo de pie: el techo es +Z y los pies -Y.
_merchant = lambda: Pose().rodilla_flex('R', 40).rodilla_flex('L', 40)
D_M = (0, -np.cos(np.radians(30)), -np.sin(np.radians(30)))
ROTULAS = 'medio:centro:Right patella|centro:Left patella'
# Corte de los muslos con un plano que contiene la dirección del RC: desde el tubo el corte queda de canto y no se ve el interior.
_N = (0, -np.sin(np.radians(30)), np.cos(np.radians(30)))
CADERAS = [('rodilla_R', _N, 0.10)]
PIERNAS = ['muslo_R', 'pierna_R', 'pie_R', 'dedos_pie_R', 'muslo_L', 'pierna_L', 'pie_L', 'dedos_pie_L']
F['fosa-rotula-axial-merchant-tubo'] = lambda: tubo('fosa-rotula-axial-merchant', _merchant(), D_M, ROTULAS, (0.24, 0.18),
    huesos=AMBAS, region=PIERNAS, cortes=CADERAS, radio=0.12, encuadre=0.30, arriba=(0, 0, 1), ri_radio=0.40, piel_modelo=True, puntos=['centro:Right patella', 'centro:Left patella'])
F['fosa-rotula-axial-merchant-otra'] = lambda: costado('fosa-rotula-axial-merchant', _merchant(), D_M, ROTULAS, (0.24, 0.18),
    huesos=MIEMBRO, region=MIEMBRO, cortes=[('rodilla_R', 'distal', 0.30)], desde=(-1, 0, 0), arriba_img=(0, 0, 1), encuadre=0.6, ri_radio=0.40, piel_modelo=True,
    puntos=['centro:Right patella', 'centro:Right femur'])

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
