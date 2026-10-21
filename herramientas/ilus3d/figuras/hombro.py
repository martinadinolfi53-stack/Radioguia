# Figuras de húmero y cintura escapular. Uso (desde herramientas/ilus3d):  python3 figuras/hombro.py [id…]
# Convenciones: el cuerpo queda quieto y lo que gira es el rayo. d = sentido del rayo en ejes del cuerpo (X = izquierda del
# paciente, Y = arriba, Z = anterior). AP: d = (0, 0, -1); PA: d = (0, 0, 1). La vista "desde el tubo" mira en el sentido d;
# el corte "desde arriba" es un plano horizontal visto desde la cabeza, con el tubo arriba del dibujo (arriba = -d) y el RI abajo.
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import numpy as np
from escena import figura, corte
from posturas import Pose

R0 = -7                        # rotación del húmero que deja los epicóndilos paralelos al plano frontal (ver codo.py)
FLEX = lambda g: g - 15        # flexión de codo del modelo para un ángulo real de 180 - g (ver codo.py)
def rayo(base, grados=0):
    """base 'AP' o 'PA'; grados > 0: oblicua con el lado derecho contra el RI (OPD en AP, OAD en PA)."""
    a = np.radians(grados)
    return (-np.sin(a), 0.0, -np.cos(a)) if base == 'AP' else (-np.sin(a), 0.0, np.cos(a))
def arriba_de(d): return tuple(-np.asarray(d))

HOMBRO = ['cintura_R', 'brazo_R']
BRAZO = HOMBRO + ['cubito_R', 'radio_R', 'mano_R']
_PH = ['coracoides_R', 'acromion_R', 'cabeza_humero_R', 'troquiter_R', 'clavicula_media_R', 'yugular', 'codo_R',
       'epicondilo_lat_R', 'epicondilo_med_R', 'centro:Right humerus', 'centro:Right scapula', 'centro:Right clavicle',
       'acromion_L', 'clavicula_media_L', 'xifoides', 'apofisis_c7', 'grande_R', 'grande_L', 'codo_L', 'cabeza_humero_L']
# cortes que dejan solo la parte de arriba del cuerpo: por debajo de la apófisis xifoides o del codo
SOBRE_XIFOIDES = [('xifoides', (0, 1, 0), 0.02)]
SOBRE_CODO = [('codo_R', (0, 1, 0), 0.12)]
F = {}

def fig(id, pose, d, cortes=SOBRE_XIFOIDES, huesos=HOMBRO, arriba=(0, 1, 0), **kw):
    # con los brazos colgando la figura llega hasta las manos: se le pone el short de paciente
    ropa = any(c[0] == 'grande_R' for c in cortes)
    return figura(id, pose, dir=d, arriba=arriba, huesos=huesos, region=None, cortes=cortes, puntos=_PH, con_ropa=ropa, **kw)
# Para la escápula (Y, laterales) el corte pasa por la mitad de su cuerpo. Si un antebrazo o el brazo sano cruzan el plano del
# corte (mano en el otro hombro, brazo sano levantado), la malla da contornos rotos: el corte se hace con ese segmento fuera del
# plano (codo extendido, brazo sano abajo) y la posición completa se ve en la vista desde el tubo y se cuenta en el texto.
def desde_arriba(id, pose, d, punto=('cabeza_humero_R', 'cabeza_humero_L', 0.5), huesos=HOMBRO + ['cintura_L', 'brazo_L', 'torax']):
    return corte(id, pose, punto, normal=(0, 1, 0), arriba=arriba_de(d), huesos=huesos, radio=30, alisar=1.0,
                 puntos=['cabeza_humero_R', 'cabeza_humero_L', 'yugular', 'centro:Right scapula'])

def costado(d):
    """vista de costado respecto del rayo: horizontal, perpendicular a d y mirando desde la derecha del paciente (el lado afectado)."""
    h = np.array([d[0], 0.0, d[2]]); v = np.cross(h, (0, 1, 0)); v /= np.linalg.norm(v)
    return tuple(v if v[0] >= 0 else -v)
AX = (24, 24, 'R')                                   # suavizado de la axila derecha (brazo separado)
AMBOS = HOMBRO + ['cintura_L', 'brazo_L']
SOBRE_CADERA = [('grande_R', (0, 1, 0), 0.08)]          # brazo colgando: hasta las manos
SOBRE_CINTURA = [('xifoides', (0, 1, 0), 0.25)]

# ---------- AP de húmero y de hombro ----------
# Brazo un poco separado; rotación externa = epicóndilos paralelos al RI (mano en supinación); interna = perpendiculares
# (mano en pronación, dorso hacia el muslo); neutra = a mitad de camino (palma hacia el muslo).
_ext = lambda: Pose().hombro_abd('R', 15).hombro_rot_ext('R', R0)
_int = lambda: Pose().hombro_abd('R', 20).hombro_rot_ext('R', R0 - 90).prono('R', 0)
_neu = lambda: Pose().hombro_abd('R', 20).hombro_rot_ext('R', R0 - 45).prono('R', 45)
F['humero-ap'] = lambda: fig('humero-ap', _ext(), rayo('AP'), cortes=SOBRE_CODO, huesos=BRAZO, suavizar=AX)
F['hombro-ap-rotacion--v1'] = lambda: fig('hombro-ap-rotacion--v1', _ext(), rayo('AP'), cortes=SOBRE_CODO, huesos=BRAZO, suavizar=AX)
F['hombro-ap-rotacion--v2'] = lambda: fig('hombro-ap-rotacion--v2', _int(), rayo('AP'), cortes=SOBRE_CODO, huesos=BRAZO, suavizar=AX)
F['hombro-ap-neutra'] = lambda: fig('hombro-ap-neutra', _neu(), rayo('AP'), cortes=SOBRE_CODO, huesos=BRAZO, suavizar=AX)

# ---------- húmero lateral ----------
# v1: de pie en PA, rotado 15-20° (OAD) hasta apoyar húmero y hombro; codo a 90° con el antebrazo por delante del abdomen
# (rotación interna: epicóndilos perpendiculares al RI). Corte horizontal visto desde arriba.
_latrot = lambda: Pose().hombro_abd('R', 10).hombro_rot_ext('R', R0 - 80).codo_flex('R', FLEX(90)).prono('R', 90)
F['humero-lateral-rotacion--v1'] = lambda: desde_arriba('humero-lateral-rotacion--v1', _latrot(), rayo('PA', 17.5))
# v2: AP, codo un poco flexionado, brazo y muñeca rotados hasta la lateral (palma hacia atrás)
F['humero-lateral-rotacion--v2'] = lambda: fig('humero-lateral-rotacion--v2',
    Pose().hombro_abd('R', 20).hombro_rot_ext('R', R0 - 90).codo_flex('R', 10).prono('R', 180), rayo('AP'),
    cortes=[('grande_R', (0, 1, 0), 0.14)], huesos=BRAZO, suavizar=AX)
# por traumatismo: decúbito supino, brazo apoyado y separado del tórax, codo a 90° (antebrazo hacia arriba, mano en
# lateral, como en la foto del libro); visto desde el tubo: rayo horizontal desde lateral, el frente del paciente hacia arriba
F['humero-lateral-trauma'] = lambda: fig('humero-lateral-trauma',
    Pose().hombro_abd('R', 20).hombro_rot_ext('R', R0).codo_flex('R', FLEX(90)).prono('R', 90), (1, 0, 0), arriba=(0, 0, 1),
    cortes=SOBRE_CADERA, huesos=BRAZO)
# transtorácicas: lado afectado contra el RI, brazo opuesto por encima de la cabeza (Lawrence: además, hombro sano elevado)
# (como en la foto del libro: antebrazo sano apoyado por encima de la cabeza)
_tt = lambda elevar: (Pose().hombro_rot_ext('R', R0 - 45).prono('R', 45).hombro_abd('L', 165).hombro_rot_ext('L', 60)
    .codo_flex('L', FLEX(110)).hombro_elevar('L', elevar))
BRAZOS_TT = BRAZO + ['cintura_L', 'brazo_L', 'cubito_L', 'radio_L', 'mano_L']
F['humero-transtoracica'] = lambda: fig('humero-transtoracica', _tt(0), rayo('AP'), cortes=SOBRE_CADERA,
    huesos=BRAZOS_TT, suavizar=(24, 24, 'L'))
F['hombro-transtoracica-lawrence'] = lambda: fig('hombro-transtoracica-lawrence', _tt(10), rayo('AP'), cortes=SOBRE_CADERA,
    huesos=BRAZOS_TT, suavizar=(24, 24, 'L'))

# ---------- hombro: proyecciones especiales ----------
_lado = lambda: Pose().hombro_abd('R', 10).hombro_rot_ext('R', R0 - 45).prono('R', 45)       # brazo al costado, mano neutra
# AP axial apical: sin rotación, RC 30° caudal. De frente y de costado.
F['hombro-ap-axial-apical'] = lambda: fig('hombro-ap-axial-apical', _lado(), rayo('AP'), huesos=BRAZO, cortes=SOBRE_CODO)
F['hombro-ap-axial-apical-costado'] = lambda: fig('hombro-ap-axial-apical-costado', _lado(), costado(rayo('AP')), huesos=BRAZO, cortes=SOBRE_CODO)
# Grashey: oblicua posterior 35-45° hacia el lado afectado, brazo en rotación neutra
F['hombro-grashey'] = lambda: desde_arriba('hombro-grashey', _lado(), rayo('AP', 40))
F['hombro-grashey-tubo'] = lambda: fig('hombro-grashey-tubo', _lado(), rayo('AP', 40), huesos=BRAZO, cortes=SOBRE_CODO)
# Garth: oblicua posterior 45°, codo flexionado y mano sobre el otro hombro; RC 45° caudal
_garth = lambda: Pose().hombro_flex('R', 50).mov('brazo_R', (0, 0, 1), 20).hombro_rot_ext('R', -100).codo_flex('R', 100)
_garth_corte = lambda: Pose().hombro_flex('R', 50).mov('brazo_R', (0, 0, 1), 20).hombro_rot_ext('R', -100)   # ídem, codo extendido
F['hombro-garth'] = lambda: desde_arriba('hombro-garth', _garth_corte(), rayo('AP', 45))
F['hombro-garth-tubo'] = lambda: fig('hombro-garth-tubo', _garth(), rayo('AP', 45), huesos=BRAZO)
# Y de escápula y Neer: desde la PA, oblicua anterior 45-60° (52°), brazo sano adelante y arriba, afectado abajo
_neer = lambda: _lado().hombro_flex('L', 100)
F['hombro-y-escapula-neer'] = lambda: desde_arriba('hombro-y-escapula-neer', _lado(), rayo('PA', 52), punto='centro:Right scapula')
F['hombro-y-escapula-neer-tubo'] = lambda: fig('hombro-y-escapula-neer-tubo', _neer(), rayo('PA', 52), huesos=BRAZO)
# Lawrence axial: decúbito supino, brazo a 90° en rotación externa (mano en supinación), cabeza girada al otro lado; desde arriba
F['hombro-axial-lawrence'] = lambda: fig('hombro-axial-lawrence', Pose().hombro_abd('R', 90).hombro_rot_ext('R', R0).cabeza_rot('L', 40),
    rayo('AP'), huesos=BRAZO, suavizar=AX)
# Hobbs: PA, brazo afectado elevado en extensión completa, cabeza girada al otro lado
F['hombro-transaxilar-hobbs'] = lambda: fig('hombro-transaxilar-hobbs', Pose().hombro_flex('R', 165).hombro_rot_ext('R', R0).cabeza_rot('L', 40),
    rayo('PA'), huesos=BRAZO, suavizar=AX)
# Clements: decúbito lateral sobre el lado sano, brazo afectado a 90° (hacia el techo). De frente: el lado derecho queda arriba.
F['hombro-axial-clements'] = lambda: fig('hombro-axial-clements', Pose().hombro_abd('R', 90).hombro_rot_ext('R', R0),
    rayo('AP'), arriba=(-1, 0, 0), huesos=BRAZO, cortes=SOBRE_CINTURA, suavizar=AX)
# Fisk: v1 decúbito supino, brazo un poco separado y mano en supinación (de costado, el frente hacia arriba);
# v2 de pie, inclinado hacia adelante sobre la mesa, húmero a 10-15° de la vertical y antebrazo apoyado (con el tronco
# inclinado 40°, flexión de hombro de 52° deja el húmero 12° por delante de la vertical)
F['hombro-fisk--v1'] = lambda: fig('hombro-fisk--v1', Pose().hombro_abd('R', 10).hombro_rot_ext('R', R0), (1, 0, 0), arriba=(0, 0, 1),
    huesos=BRAZO, cortes=SOBRE_CADERA)
F['hombro-fisk--v2'] = lambda: fig('hombro-fisk--v2', Pose().lumbar_flex(40).hombro_flex('R', 52).hombro_rot_ext('R', R0).codo_flex('R', FLEX(78)).prono('R', 180),
    (1, 0, 0), huesos=BRAZO, cortes=SOBRE_CADERA)

# ---------- clavícula, escápula y AC ----------
F['clavicula-ap'] = lambda: fig('clavicula-ap', _lado(), rayo('AP'), huesos=BRAZO, cortes=SOBRE_CODO)
F['clavicula-costado'] = lambda: fig('clavicula-costado', _lado(), costado(rayo('AP')), huesos=BRAZO, cortes=SOBRE_CODO)
F['escapula-ap'] = lambda: fig('escapula-ap', Pose().hombro_abd('R', 90).hombro_rot_ext('R', R0), rayo('AP'), huesos=BRAZO,
    cortes=[('xifoides', (0, 1, 0), 0.06)], suavizar=AX)
_cruzado = _garth
F['escapula-lateral--v1'] = lambda: desde_arriba('escapula-lateral--v1', _garth_corte(), rayo('PA', 52), punto='centro:Right scapula')
F['escapula-lateral--v2'] = lambda: desde_arriba('escapula-lateral--v2',
    Pose().hombro_flex('R', -15).hombro_rot_ext('R', R0 - 70).codo_flex('R', FLEX(90)), rayo('PA', 52), punto='centro:Right scapula')
F['ac-pearson'] = lambda: fig('ac-pearson', Pose().hombro_rot_ext('R', R0 - 45).prono('R', 45).hombro_rot_ext('L', R0 - 45).prono('L', 45),
    rayo('AP'), huesos=AMBOS + ['cubito_R', 'radio_R', 'mano_R', 'cubito_L', 'radio_L', 'mano_L'], cortes=SOBRE_CADERA)

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc', 'piel', 'huesos')})
