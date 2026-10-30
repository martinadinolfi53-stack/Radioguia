# Figuras de pierna, rodilla, rótula y fosa intercondílea. Uso (desde herramientas/ilus3d):  python3 figuras/rodilla.py [id…]
# Ejes del cuerpo: X = izquierda del paciente, Y = arriba, Z = anterior. El cuerpo no se acuesta: lo que gira es la cámara.
# Supino visto de costado: dir = LAT con arriba = (0, 0, 1) (pies a la derecha). Prono visto de costado: dir = MED con
# arriba = (0, 0, -1) (pies a la derecha). Decúbito lateral sobre el lado afectado, desde el tubo: dir = MED, arriba = (0, 0, -1).
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from escena import figura, corte
from posturas import Pose

PIERNA = ['pierna_R', 'pie_R', 'dedos_pie_R', 'rotula_R']
MIEMBRO = ['muslo_R'] + PIERNA
AMBAS = MIEMBRO + ['muslo_L', 'pierna_L', 'pie_L', 'dedos_pie_L', 'rotula_L']
_P = ['rodilla_R', 'vertice_rotula_R', 'base_rotula_R', 'epicondilo_med_fem_R', 'epicondilo_lat_fem_R', 'tuberosidad_tibial_R',
      'cabeza_perone_R', 'tobillo_R', 'maleolo_med_R', 'maleolo_lat_R', 'talon_R', 'cabeza_femur_R', 'base_mt3_R',
      'centro:Right tibia', 'centro:Right fibula', 'centro:Right femur', 'centro:Right patella']
F = {}
SUP, PRONO = (0, 0, 1), (0, 0, -1)
LAT, MED = (1, 0, 0), (-1, 0, 0)

# En reposo el modelo tiene el epicóndilo lateral del fémur unos 5° por delante del medial: con 5° de rotación externa la línea
# entre los epicóndilos queda paralela a la mesa (AP verdadera de rodilla).
R0K = -5
MUSLO = lambda d: [('rodilla_R', 'distal', d)]
RODILLA = [('rodilla_R', 'distal', 0.20), ('rodilla_R', 'proximal', 0.22)]

def fig(id, pose, d, arriba=(0, 1, 0), cortes=MUSLO(0.24), region=MIEMBRO, huesos=MIEMBRO, **kw):
    return figura(id, pose, dir=d, arriba=arriba, huesos=huesos, region=region, cortes=cortes, puntos=_P, **kw)

# ---------- pierna ----------
F['pierna-ap'] = lambda: fig('pierna-ap', Pose().cadera_rot_int('R', R0K), LAT, SUP)
F['pierna-mediolateral'] = lambda: fig('pierna-mediolateral', Pose().cadera_rot_int('R', R0K), MED, PRONO)

# ---------- rodilla ----------
F['rodilla-ap'] = lambda: fig('rodilla-ap', Pose().cadera_rot_int('R', R0K), LAT, SUP, cortes=RODILLA)
# lateral: decúbito sobre el lado afectado, rodilla flexionada 20-30°; vista desde el tubo y desde el costado de la mesa
_lat = lambda g: Pose().cadera_rot_int('R', R0K).cadera_flex('R', g / 2).rodilla_flex('R', g)
F['rodilla-lateral'] = lambda: fig('rodilla-lateral', _lat(25), MED, PRONO, cortes=RODILLA)
F['rodilla-lateral-mesa'] = lambda: fig('rodilla-lateral-mesa', Pose().cadera_rot_int('R', R0K), (0, 0, -1), (1, 0, 0), cortes=RODILLA)
F['fosa-rotula-lateral-rotula'] = lambda: fig('fosa-rotula-lateral-rotula', _lat(8), MED, PRONO, cortes=RODILLA)
# oblicuas: corte a la altura del centro de la rótula, visto desde los pies (lateral a la izquierda); neutra como referencia
_corte = lambda id, r: corte(id, Pose().cadera_rot_int('R', r), 'centro:Right patella', normal=(0, -1, 0), arriba=SUP,
                              huesos=MIEMBRO, region=MIEMBRO, puntos=['epicondilo_med_fem_R', 'epicondilo_lat_fem_R'], radio=12, alisar=3)
F['rodilla-corte-neutra'] = lambda: _corte('rodilla-corte-neutra', R0K)
F['rodilla-ap-oblicuas--v1'] = lambda: _corte('rodilla-ap-oblicuas--v1', R0K + 45)
F['rodilla-ap-oblicuas--v2'] = lambda: _corte('rodilla-ap-oblicuas--v2', R0K - 45)

# ---------- de pie ----------
# Rosenberg: PA de pie, rodillas flexionadas 45° (muslo 22,5° hacia adelante, pierna 22,5° hacia atrás), pies planos
_ros = lambda: Pose().cadera_flex('R', 22.5).rodilla_flex('R', 45).tobillo_dorsi('R', 22.5)
F['rodilla-pa-axial-bilateral-rosenberg'] = lambda: fig('rodilla-pa-axial-bilateral-rosenberg', _ros(), LAT, cortes=MUSLO(0.24))
F['rodilla-ap-pa-bilateral-carga--v1'] = lambda: fig('rodilla-ap-pa-bilateral-carga--v1', Pose(), LAT, cortes=MUSLO(0.24))
_pa20 = lambda: Pose().cadera_flex('R', 10).rodilla_flex('R', 20).tobillo_dorsi('R', 10)
F['rodilla-ap-pa-bilateral-carga--v2'] = lambda: fig('rodilla-ap-pa-bilateral-carga--v2', _pa20(), LAT, cortes=MUSLO(0.24))

# ---------- rótula y fosa intercondílea ----------
F['fosa-rotula-pa-rotula'] = lambda: fig('fosa-rotula-pa-rotula', Pose().cadera_rot_int('R', R0K), MED, PRONO, cortes=MUSLO(0.22))
# Camp Coventry: prono, rodilla flexionada 40-50°
F['fosa-rotula-tunel--v1'] = lambda: fig('fosa-rotula-tunel--v1', Pose().cadera_rot_int('R', R0K).rodilla_flex('R', 45), MED, PRONO, cortes=MUSLO(0.22))
# Holmblad: arrodillado, pierna apoyada en la mesa y muslo inclinado 20-30° hacia adelante (rodilla a unos 115°)
F['fosa-rotula-tunel--v2'] = lambda: fig('fosa-rotula-tunel--v2', Pose().cadera_rot_int('R', R0K).rodilla_flex('R', 115).tobillo_dorsi('R', -35),
    LAT, horizontal=('tobillo_R', 'rodilla_R'), cortes=MUSLO(0.22))
# Settegast (rodilla a 90°) y Hughston (50-60°), en prono
F['fosa-rotula-axial-settegast-hughston--v1'] = lambda: fig('fosa-rotula-axial-settegast-hughston--v1', Pose().cadera_rot_int('R', R0K).rodilla_flex('R', 90), MED, PRONO, cortes=MUSLO(0.22))
F['fosa-rotula-axial-settegast-hughston--v2'] = lambda: fig('fosa-rotula-axial-settegast-hughston--v2', Pose().cadera_rot_int('R', R0K).rodilla_flex('R', 55).tobillo_dorsi('R', -20), MED, PRONO, cortes=MUSLO(0.22))
# Hobbs: sentado, rodillas flexionadas con los pies debajo de la silla; cuerpo entero visto de costado
_sent = lambda: (Pose().cadera_flex('R', 90).cadera_flex('L', 90).rodilla_flex('R', 110).rodilla_flex('L', 110)
                 .hombro_flex('R', 5).codo_flex('R', 75).hombro_flex('L', 5).codo_flex('L', 75))
F['fosa-rotula-tangencial-hobbs'] = lambda: fig('fosa-rotula-tangencial-hobbs', _sent(), LAT, cortes=(), region=None, huesos=MIEMBRO)

if __name__ == '__main__':
    for k in (sys.argv[1:] or list(F)):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc', 'piel', 'huesos')}, flush=True)
