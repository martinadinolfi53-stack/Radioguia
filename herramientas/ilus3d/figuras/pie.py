# Figuras de tobillo, pie, calcáneo y dedos del pie. Uso (desde herramientas/ilus3d):  python3 figuras/pie.py [id…]
# Ejes del cuerpo: X = izquierda del paciente, Y = arriba, Z = anterior. El cuerpo no se acuesta: lo que gira es la cámara.
# Decúbito supino visto de costado: dir = (±1, 0, 0) con arriba = (0, 0, 1) (el frente hacia el tubo, la mesa abajo).
# Decúbito prono visto de costado: arriba = (0, 0, -1). Vista "desde los pies": dir = (0, 1, 0).
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from escena import figura, corte, cuerpo
from puntos import Puntos
import numpy as np
from posturas import Pose

PIERNA = ['pierna_R', 'pie_R', 'dedos_pie_R', 'rotula_R']
MIEMBRO = ['muslo_R'] + PIERNA
AMBAS = MIEMBRO + ['muslo_L', 'pierna_L', 'pie_L', 'dedos_pie_L', 'rotula_L']
_P = ['maleolo_med_R', 'maleolo_lat_R', 'tobillo_R', 'base_mt3_R', 'base_mt5_R', 'talon_R', 'rodilla_R', 'cabeza_mt1_R', 'mtf_pie_R',
      'if_dedo1_pie_R', 'ifp_dedo3_pie_R', 'punta_dedo1_pie_R', 'punta_dedo5_pie_R',
      'centro:Right talus', 'centro:Right calcaneus', 'centro:Right first metatarsal bone', 'centro:Right third metatarsal bone',
      'centro:Right fifth metatarsal bone', 'centro:Right tibia', 'centro:Right fibula', 'centro:Navicular bone of right foot']
F = {}
SOBRE_RODILLA = [('rodilla_R', 'distal', 0.14)]
MEDIA_PIERNA = [('tobillo_R', 'distal', 0.22)]
TOBILLO = [('tobillo_R', 'distal', 0.12)]

def fig(id, pose, d, arriba=(0, 1, 0), cortes=MEDIA_PIERNA, region=MIEMBRO, huesos=PIERNA, **kw):
    return figura(id, pose, dir=d, arriba=arriba, huesos=huesos, region=region, cortes=cortes, puntos=_P, **kw)

def desde_dedos(pose):
    """cámara mirando desde la punta de los dedos hacia el talón, en el plano de la mesa (horizontal en decúbito supino)."""
    c = cuerpo(); c.posar(pose); p = Puntos(c)
    v = p.posado('talon_R') - (p.posado('cabeza_mt1_R') + p.posado('base_mt5_R')) / 2; v[2] = 0
    return tuple(v / np.linalg.norm(v))

SUP = (0, 0, 1)        # arriba en decúbito supino
LAT = (1, 0, 0)        # cámara del lado lateral del miembro derecho (mira hacia medial)
MED = (-1, 0, 0)       # cámara del lado medial
PIES = (0, 1, 0)       # desde los pies hacia la cabeza

# ---------- tobillo: decúbito supino, pierna extendida (vista de costado + vista desde los pies) ----------
# En reposo el pie del modelo mira unos 23° hacia afuera: con la pierna rotada 20° hacia medial el eje del pie (talón → 3.er MT)
# queda vertical (AP sin rotación) y la línea intermaleolar a unos 13° del RI. Mortaja: 15° más (línea intermaleolar paralela
# al RI); oblicua: 45° más.
R0P = 20
for _id, _rot in (('tobillo-ap', R0P), ('tobillo-ap-mortaja', R0P + 15), ('tobillo-ap-oblicua-45', R0P + 45)):
    F[_id] = (lambda i=_id, r=_rot: fig(i, Pose().cadera_rot_int('R', r), LAT, SUP, cortes=SOBRE_RODILLA))
    F[_id + '-pies'] = (lambda i=_id, r=_rot: fig(i + '-pies', Pose().cadera_rot_int('R', r), PIES, SUP, region=PIERNA, cortes=TOBILLO))
# estrés: AP vista desde el tubo, pie forzado en inversión o eversión
F['tobillo-ap-estres--v1'] = lambda: fig('tobillo-ap-estres--v1', Pose().cadera_rot_int('R', R0P).pie_inversion('R', 22), (0, 0, -1), region=PIERNA)
F['tobillo-ap-estres--v2'] = lambda: fig('tobillo-ap-estres--v2', Pose().cadera_rot_int('R', R0P).pie_inversion('R', -22), (0, 0, -1), region=PIERNA)

# ---------- decúbito lateral sobre el lado afectado (cara lateral contra el RI), vista desde el tubo = desde medial ----------
# rodilla flexionada, pie a 90°
_lado = lambda: Pose().cadera_flex('R', 30).rodilla_flex('R', 45)
F['tobillo-lateral'] = lambda: fig('tobillo-lateral', _lado(), MED, cortes=[('tobillo_R', 'distal', 0.26)])
F['pie-lateral'] = lambda: fig('pie-lateral', _lado(), MED, cortes=[('tobillo_R', 'distal', 0.20)])
F['calcaneo-lateral'] = lambda: fig('calcaneo-lateral', _lado(), MED, cortes=[('tobillo_R', 'distal', 0.16)])

# ---------- planta apoyada: decúbito supino con la rodilla flexionada, planta sobre el RI ----------
# muslo 60° y rodilla 110°: la pierna queda a 50° de la mesa y el pie, con 40° de flexión plantar, apoya plano
_planta = lambda: Pose().cadera_flex('R', 60).rodilla_flex('R', 110).tobillo_dorsi('R', -40)
F['pie-ap-dorsoplantar'] = lambda: fig('pie-ap-dorsoplantar', _planta(), LAT, SUP, cortes=SOBRE_RODILLA, huesos=MIEMBRO)
F['dedos-pie-ap'] = lambda: fig('dedos-pie-ap', _planta(), LAT, SUP, cortes=[('tobillo_R', 'distal', 0.10)])
# oblicuas: la rodilla cae hacia medial (o lateral) y el pie queda a 30-45° del RI; vista desde los dedos
# (con el pie apoyado, inclinar la rodilla hacia medial lleva el dorso del pie hacia medial: aducción de 30° ≈ 32° de oblicuidad)
_obl = lambda g: Pose().cadera_flex('R', 60).cadera_abd('R', -g).rodilla_flex('R', 110).tobillo_dorsi('R', -40)
F['pie-ap-oblicua-medial'] = lambda: fig('pie-ap-oblicua-medial', _obl(35), desde_dedos(_obl(35)), SUP, region=PIERNA, cortes=[('tobillo_R', 'distal', 0.20)])
F['dedos-pie-ap-oblicua--v1'] = lambda: fig('dedos-pie-ap-oblicua--v1', _obl(37.5), desde_dedos(_obl(37.5)), SUP, region=PIERNA, cortes=[('tobillo_R', 'distal', 0.20)])
F['dedos-pie-ap-oblicua--v2'] = lambda: fig('dedos-pie-ap-oblicua--v2', _obl(-37.5), desde_dedos(_obl(-37.5)), SUP, region=PIERNA, cortes=[('tobillo_R', 'distal', 0.20)])
F['pie-plano-pies'] = lambda: fig('pie-plano-pies', _planta(), desde_dedos(_planta()), SUP, region=PIERNA, cortes=[('tobillo_R', 'distal', 0.20)])

# ---------- calcáneo axial: supino, pierna extendida, pie en flexión dorsal ----------
F['calcaneo-plantodorsal-axial'] = lambda: fig('calcaneo-plantodorsal-axial', Pose().cadera_rot_int('R', R0P).tobillo_dorsi('R', 15), LAT, SUP, cortes=SOBRE_RODILLA)

# ---------- de pie (carga) ----------
F['pie-ap-lateral-carga--v1'] = lambda: fig('pie-ap-lateral-carga--v1', Pose(), LAT)
F['pie-ap-lateral-carga--v2'] = lambda: fig('pie-ap-lateral-carga--v2', Pose(), (0, -1, 0), (0, 0, 1), region=AMBAS, huesos=AMBAS, cortes=TOBILLO)

# ---------- lateral de dedos ----------
F['dedos-pie-lateral--v1'] = lambda: fig('dedos-pie-lateral--v1', Pose(), LAT, region=['pie_R', 'dedos_pie_R'], cortes=[('base_mt3_R', (0, 0, 1), 0.02)])
F['dedos-pie-lateral--v2'] = lambda: fig('dedos-pie-lateral--v2', Pose(), MED, region=['pie_R', 'dedos_pie_R'], cortes=[('base_mt3_R', (0, 0, 1), 0.02)])

# ---------- sesamoideos ----------
# v1 prono: rodilla apenas flexionada (la pierna sube hacia el tobillo), planta a 15-20° de la vertical, dedos en flexión dorsal
# apoyados en el RI. Vista desde medial (lado del 1.er dedo), con la espalda hacia arriba.
F['dedos-pie-tangencial-sesamoideos--v1'] = lambda: fig('dedos-pie-tangencial-sesamoideos--v1',
    Pose().rodilla_flex('R', 12).tobillo_dorsi('R', 5).dedos_pie_dorsi('R', 65), MED, (0, 0, -1), cortes=SOBRE_RODILLA)
# v2 supino: pierna extendida, pie en flexión dorsal y dedos tirados hacia atrás con una gasa
F['dedos-pie-tangencial-sesamoideos--v2'] = lambda: fig('dedos-pie-tangencial-sesamoideos--v2',
    Pose().cadera_rot_int('R', R0P).tobillo_dorsi('R', 10).dedos_pie_dorsi('R', 65), LAT, SUP, cortes=SOBRE_RODILLA)

if __name__ == '__main__':
    for k in (sys.argv[1:] or [k for k in F if not k.startswith('t-')]):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc', 'piel', 'huesos')})
