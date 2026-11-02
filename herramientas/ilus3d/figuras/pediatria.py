# Fichas pediátricas con el avatar de nene (nene.py), sin huesos: no hay esqueleto infantil en el modelo y el del adulto no
# calza en un cuerpo de 2-3 años. Muestran la posición, el RC y el RI; la inmovilización y el Pigg-O-Stat van en el cjs.
# Bontrager 9.ª ed. Uso (desde herramientas/ilus3d):  python3 figuras/pediatria.py [id…]  ->  render/<id>-tubo y render/<id>-otra
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import numpy as np
import nene
from posturas import Pose
from vistas import tubo, costado

nene.activar()
AP, PA, LAT_I = (0, 0, -1), (0, 0, 1), (1, 0, 0)
F = {}

def par(id, pose, d, centro, ri, encuadre=0.22, enc_otra=0.40, **kw):
    """las dos vistas, sin ventana (no hay huesos que mostrar). arriba_tubo: arriba de la vista desde el tubo"""
    kt = {k: v for k, v in kw.items() if k not in ('desde', 'arriba_img')}
    if 'arriba_tubo' in kt: kt['arriba'] = kt.pop('arriba_tubo')
    ko = {k: v for k, v in kw.items() if k != 'arriba_tubo'}
    if 'region_otra' in kw: ko['region'] = ko.pop('region_otra'); kt.pop('region_otra', None)
    F[id + '-tubo'] = lambda: tubo(id, pose(), d, centro, ri, radio=-1, encuadre=encuadre, **kt)
    F[id + '-otra'] = lambda: costado(id, pose(), d, centro, ri, encuadre=enc_otra, **ko)

def brazos_arriba(p): return p.hombro_flex('R', 165).hombro_flex('L', 165).hombro_abd('R', 10).hombro_abd('L', 10)
def sentado(p): return p.cadera_flex('R', 90).cadera_flex('L', 90).rodilla_flex('R', 90).rodilla_flex('L', 90)

# ---------- tórax (págs. 37-38): RC a la altura de la línea mamilar ----------
# AP en la mesa: decúbito supino, brazos arriba y piernas extendidas (inmovilizados)
par('torax-ped-ap-mesa', lambda: brazos_arriba(Pose()), AP, 'linea_mamilar', (0.24, 0.18))
# PA y lateral en el Pigg-O-Stat: sentado con las piernas por las aberturas, brazos arriba entre las piezas laterales
par('torax-ped-pa-pigg', lambda: brazos_arriba(sentado(Pose())), PA, 'linea_mamilar', (0.24, 0.18), enc_otra=0.45, puntos=['caderas'],
    arriba_img=(0, 1, 0), ri_radio=0.10)
par('torax-ped-lateral-pigg', lambda: brazos_arriba(sentado(Pose())), LAT_I, 'linea_mamilar', (0.18, 0.24), enc_otra=0.45,
    desde=(0, 0, -1), puntos=['caderas'], arriba_img=(0, 1, 0), ri_radio=0.10)
# lateral en la mesa: decúbito lateral izquierdo, brazos arriba, piernas flexionadas; rayo vertical (de derecha a izquierda)
# brazos paralelos a la cabeza (abd -10): con 10° de abducción el brazo de abajo atravesaba la mesa
_lat_mesa = lambda: Pose().hombro_flex('R', 165).hombro_flex('L', 165).hombro_abd('R', -10).hombro_abd('L', -10).cadera_flex('R', 45).cadera_flex('L', 45).rodilla_flex('R', 60).rodilla_flex('L', 60)
par('torax-ped-lateral-mesa', _lat_mesa, LAT_I, 'linea_mamilar', (0.18, 0.24), enc_otra=0.45,
    desde=(0, 0, -1), arriba_img=(-1, 0, 0))

# ---------- miembro superior (pág. 95): supino, brazo separado; RC en la parte media de la extremidad ----------
par('ped-ext-sup-ap', lambda: Pose().hombro_abd('R', 35), AP, 'codo_R', (0.18, 0.30), encuadre=0.26, arriba_ri=(-0.57, 0.82, 0))
# lateral: codo flexionado 90° y toda la extremidad girada (antebrazo apoyado hacia la cabeza, pulgar hacia el tubo)
_sup_lat = lambda: Pose().hombro_abd('R', 60).hombro_rot_ext('R', 90).codo_flex('R', 90).prono('R', 180)
par('ped-ext-sup-lateral', _sup_lat, AP, 'codo_R', (0.24, 0.24), encuadre=0.26)

# ---------- miembro inferior (pág. 167): RC en la parte media de la extremidad ----------
par('ped-ext-inf-ap', Pose, AP, 'rodilla_R', (0.24, 0.43), encuadre=0.30)
# lateral: semidecúbito, la pierna afectada en abducción (pata de rana)
_rana_d = lambda: Pose().cadera_flex('R', 40).cadera_abd('R', 55).rodilla_flex('R', 45)
par('ped-ext-inf-lateral', _rana_d, AP, 'rodilla_R', (0.30, 0.40), encuadre=0.30)
# Kite (pág. 168): AP con la rodilla flexionada y la planta sobre el RI; lateral con la pierna de costado, lado afectado abajo
# AP: sentado sobre un apoyo, la pierna inclinada hacia adelante (rodilla a 60°) y la planta apoyada en el RI del piso (tobillo
# en flexión dorsal de 30°): el pie queda por delante de la rodilla y se ve desde arriba; rayo vertical hacia abajo
_kite_ap = lambda: Pose().cadera_flex('R', 90).rodilla_flex('R', 60).tobillo_dorsi('R', 30).cadera_flex('L', 90).rodilla_flex('L', 90)
par('ped-pie-ap-mediolateral-kite--v1', _kite_ap, (0, -1, 0), 'mediotarso_R', (0.18, 0.24), encuadre=0.20, arriba_tubo=(0, 0, 1),
    arriba_ri=(0, 0, 1), arriba_img=(0, 1, 0), ri_radio=0.10, region=['pelvis', 'muslo_R', 'pierna_R', 'pie_R', 'dedos_pie_R'],
    region_otra=None, puntos=['caderas'])     # de costado: el nene entero sentado en el apoyo
_kite_lat = lambda: Pose().cadera_abd('R', 40).cadera_rot_int('R', -60).rodilla_flex('R', 30)
par('ped-pie-ap-mediolateral-kite--v2', _kite_lat, AP, 'base_mt_R', (0.18, 0.24), encuadre=0.20)

# ---------- caderas y pelvis (pág. 206): RC a la altura de las caderas ----------
par('caderas-pelvis-pediatricas-ap', lambda: brazos_arriba(Pose()).cadera_rot_int('R', 15).cadera_rot_int('L', 15), AP, 'caderas', (0.30, 0.24))
_rana = lambda: (brazos_arriba(Pose()).cadera_flex('R', 60).cadera_flex('L', 60).cadera_abd('R', 55).cadera_abd('L', 55)
                 .rodilla_flex('R', 95).rodilla_flex('L', 95).pie_inversion('R', 25).pie_inversion('L', 25))
par('caderas-pelvis-pediatricas-lateral-rana', _rana, AP, 'caderas', (0.30, 0.24))

# ---------- abdomen (pág. 360): supino brazos arriba, RC en el ombligo; de pie/sentado en el Pigg-O-Stat ----------
par('abdomen-ped-ap-supino', lambda: brazos_arriba(Pose()), AP, 'ombligo', (0.24, 0.30))
par('abdomen-ped-ap-bipedestacion', lambda: brazos_arriba(sentado(Pose())), AP, 'sobre_cresta', (0.24, 0.30), enc_otra=0.45,
    puntos=['caderas'], arriba_img=(0, 1, 0), ri_radio=0.12)

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')}, flush=True)
