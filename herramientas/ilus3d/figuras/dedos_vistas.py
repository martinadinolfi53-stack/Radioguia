# AP oblicuas de dedos del pie en el estilo por capas de dos vistas (Bontrager 9.ª ed.): desde el tubo, toda la pierna con la
# rodilla flexionada y el pie inclinado sobre el RI; y desde los dedos, con la planta a 37,5° del RI (centro de 30-45°).
# Uso (desde herramientas/ilus3d):  python3 figuras/dedos_vistas.py [id…]  ->  render/<id>-tubo y render/<id>-otra
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from vistas import tubo, costado
from pie import _obl_med, _obl_lat, desde_dedos, PIERNA, MIEMBRO

AP = (0, 0, -1)
PUNTOS = ['cabeza_mt1_R', 'base_mt5_R', 'mtf_pie_R', 'rodilla_R']
F = {}
for v, pose in (('v1', _obl_med), ('v2', _obl_lat)):
    id = f'dedos-pie-ap-oblicua--{v}'
    F[id + '-tubo'] = lambda id=id, pose=pose: tubo(id, pose(), AP, 'mtf_pie_R', (0.18, 0.24), huesos=PIERNA, region=MIEMBRO,
        cortes=[('rodilla_R', 'proximal', 0.10)], radio=0.06, encuadre=0.34, puntos=PUNTOS, ri_radio=0.045)
    F[id + '-otra'] = lambda id=id, pose=pose: costado(id, pose(), AP, 'mtf_pie_R', (0.18, 0.24), huesos=PIERNA, region=PIERNA,
        cortes=[('tobillo_R', 'distal', 0.20)], desde=desde_dedos(pose()), arriba_img=(0, 0, 1), encuadre=0.30, puntos=PUNTOS, ri_radio=0.045)

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
