# Figuras de mano, dedos, pulgar y muñeca. Uso (desde herramientas/ilus3d):  python3 figuras/mano.py [id…]
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from escena import figura, corte
from posturas import Pose

MANO = ['cubito_R', 'radio_R', 'mano_R']
# En el modelo el pulgar está en reposo, algo separado hacia palmar y con el pulpejo mirando a los otros dedos. Con la palma
# apoyada (en la mesa o en una cuña) se lo lleva al plano de la palma (-15° de abducción palmar: la piel del pulgar queda a
# la altura de la de la palma) y apoyado de costado, con el pulpejo a unos 45° hacia la mesa (rotación +55°): así queda
# oblicuo a 45°, como dice la ficha de la PA oblicua de pulgar («con la mano en pronación… queda oblicuo a unos 45°»).
def plana(p): return p.pulgar('R', abd_palmar=-15, rot=55)
F = {}

# PA de mano: sentado, codo flexionado, antebrazo y mano en pronación completa sobre el RI; vista desde el tubo.
F['mano-pa'] = lambda: figura(
    'mano-pa', plana(Pose().codo_flex('R', 90).prono('R', 180)), dir=(0, -1, 0), horizontal=('grande_R', 'mcf3_R'),
    huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.10)],
    puntos=['mcf3_R', 'grande_R', 'punta_dedo3_R', 'estiloides_radio_R', 'estiloides_cubito_R',
            'centro:Right fourth metacarpal bone', 'centro:Middle phalanx of right little finger', 'centro:Right hamate'])

# PA oblicua de mano: desde la PA, mano y muñeca rotadas 45° hacia lateral (sobre cuña), dedos un poco separados y
# paralelos al RI. Vista desde el tubo y vista desde la punta de los dedos.
_obl = lambda: plana(Pose().codo_flex('R', 90).prono('R', 135).dedos_separar('R', 4))
F['mano-pa-oblicua'] = lambda: figura(
    'mano-pa-oblicua', _obl(), dir=(0, -1, 0), horizontal=('grande_R', 'mcf3_R'), huesos=MANO, region=MANO,
    cortes=[('estiloides_radio_R', 'distal', 0.10)], puntos=['mcf3_R', 'grande_R', 'punta_dedo3_R', 'estiloides_radio_R'])
F['mano-pa-oblicua-corte'] = lambda: corte(
    'mano-pa-oblicua-corte', _obl(), ('grande_R', 'mcf3_R', 0.75), arriba=(0, 1, 0), huesos=MANO, region=MANO)

# Lateral de mano: codo flexionado, mano en lateral con el pulgar arriba (borde cubital sobre el RI); vista desde el tubo.
# En abanico: dedos separados en abanico sobre un soporte escalonado (flexión creciente en las MCF del índice al meñique,
# interfalángicas extendidas). En extensión: dedos juntos y extendidos.
_lat = lambda: Pose().codo_flex('R', 90).prono('R', 90)
F['mano-lateral--v1'] = lambda: figura(
    'mano-lateral--v1', _lat().dedos_flex('R', 0, 0, d=2).dedos_flex('R', 15, 5, d=3).dedos_flex('R', 30, 5, d=4)
    .dedos_flex('R', 45, 5, d=5).pulgar('R', abd_palmar=10), dir=(0, -1, 0), horizontal=('grande_R', 'mcf3_R'),
    huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.10)],
    puntos=['mcf2_R', 'grande_R', 'punta_dedo2_R', 'punta_dedo5_R', 'estiloides_radio_R'])
F['mano-lateral--v2'] = lambda: figura(
    'mano-lateral--v2', _lat().dedos_separar('R', -4).pulgar('R', abd_palmar=10), dir=(0, -1, 0), horizontal=('grande_R', 'mcf3_R'),
    huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.10)],
    puntos=['mcf2_R', 'grande_R', 'punta_dedo2_R', 'estiloides_radio_R'])

# AP bilateral oblicua (Nørgaard): antebrazos extendidos sobre la mesa, palmas arriba y rotadas 45° (bordes cubitales abajo,
# tocándose; lados del pulgar elevados sobre bloques de 45°). Cada mano se dibuja aparte y se juntan en el esquema.
# v1: dedos en extensión completa; v2 («receptor de pelota»): dedos en flexión parcial.
def _norg(s, flex):
    # dedos juntos y mano alineada con el antebrazo (en reposo el modelo tiene algo de desviación cubital): bordes cubitales paralelos
    p = Pose().codo_flex(s, 90).prono(s, 45).dedos_separar(s, -6).muneca_desv_cubital(s, -10)
    if flex: p.dedos_flex(s, 0, 20, 15).pulgar(s, abd_palmar=10)
    return p
for _v, _fx in (('v1', False), ('v2', True)):
    for _s in 'RL':
        _m = ['cubito_' + _s, 'radio_' + _s, 'mano_' + _s]
        F[f'norgaard-{_v}-{_s}'] = (lambda v=_v, fx=_fx, s=_s, m=_m: figura(
            f'norgaard-{v}-{s}', _norg(s, fx), dir=(0, -1, 0), arriba=(0, 0, 1), huesos=m, region=m,
            cortes=[(f'estiloides_radio_{s}', 'distal', 0.07)],
            puntos=[f'mcf5_{s}', f'mcf3_{s}', f'punta_dedo3_{s}', f'estiloides_cubito_{s}', f'estiloides_radio_{s}']))

# Dedos. PA: como la PA de mano, con los dedos más separados. PA oblicua: mano rotada 45° hacia lateral (ejemplo: 2.º dedo),
# con corte a la altura de las falanges proximales. Lateral: el dedo a estudiar extendido y los demás flexionados (puño)
# para que no se superpongan; 3.º a 5.º con el pulgar arriba (lateromedial), 2.º con el pulgar abajo (mediolateral).
F['dedos-pa'] = lambda: figura(
    'dedos-pa', plana(Pose().codo_flex('R', 90).prono('R', 180).dedos_separar('R', 8)), dir=(0, -1, 0),
    horizontal=('grande_R', 'mcf3_R'), huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.10)],
    puntos=['mcf3_R', 'ifp3_R', 'punta_dedo3_R', 'ifp4_R', 'punta_dedo5_R', 'grande_R'])
_dobl = lambda: plana(Pose().codo_flex('R', 90).prono('R', 135).dedos_separar('R', 8))
F['dedos-pa-oblicua'] = lambda: figura(
    'dedos-pa-oblicua', _dobl(), dir=(0, -1, 0), horizontal=('mcf2_R', 'ifp2_R'), huesos=MANO, region=MANO,
    cortes=[('estiloides_radio_R', 'distal', 0.10)], puntos=['mcf2_R', 'ifp2_R', 'punta_dedo2_R', 'grande_R'])
F['dedos-pa-oblicua-corte'] = lambda: corte(
    'dedos-pa-oblicua-corte', _dobl(), ('mcf3_R', 'ifp3_R', 0.5), arriba=(0, 1, 0), huesos=MANO, region=MANO)
def _puno(p, s, menos):
    for d in (2, 3, 4, 5):
        if d != menos: p.dedos_flex(s, 85, 95, 60, d=d)
    return p
F['dedos-lateral--v1'] = lambda: figura(
    'dedos-lateral--v1', _puno(Pose().codo_flex('R', 90).prono('R', 90), 'R', 3).pulgar('R', abd_palmar=10), dir=(0, -1, 0),
    horizontal=('mcf3_R', 'ifp3_R'), huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.06)],
    puntos=['mcf3_R', 'ifp3_R', 'punta_dedo3_R', 'punta_dedo1_R'])
_pab = lambda: _puno(Pose().hombro_flex('R', 90).prono('R', 180).hombro_rot_ext('R', -90), 'R', 2)
F['dedos-lateral--v2'] = lambda: figura(
    'dedos-lateral--v2', _pab(), dir=(0, -1, 0), horizontal=('mcf2_R', 'ifp2_R'), huesos=MANO, region=MANO,
    cortes=[('estiloides_radio_R', 'distal', 0.06)], puntos=['mcf2_R', 'ifp2_R', 'punta_dedo2_R', 'punta_dedo1_R'])
F['dedos-lateral--v1-corte'] = lambda: corte(
    'dedos-lateral--v1-corte', _puno(Pose().codo_flex('R', 90).prono('R', 90), 'R', 3).pulgar('R', abd_palmar=10),
    ('grande_R', 'mcf3_R', 0.15), arriba=(0, 1, 0), huesos=MANO, region=MANO)
F['dedos-lateral--v2-corte'] = lambda: corte(
    'dedos-lateral--v2-corte', _pab(), ('grande_R', 'mcf2_R', 0.15), arriba=(0, 1, 0), huesos=MANO, region=MANO)

# Pulgar. AP (y AP axial de Roberts): brazo hacia adelante, mano en rotación interna con la palma hacia afuera, la cara
# posterior del pulgar apoyada en el RI (rotación interna del hombro de 90° desde la pronación: el pulpejo del pulgar queda
# mirando arriba). Pulgar extendido. Vista desde el tubo con el pulgar vertical; corte desde la punta de los dedos; para
# Roberts, vista de costado (desde lateral) con el pulgar sobre el RI.
# (+16° de desviación cubital: así el eje del pulgar queda paralelo al RI y el pulgar apoya en toda su cara posterior)
_pap = lambda: Pose().hombro_flex('R', 90).prono('R', 180).hombro_rot_ext('R', -90).muneca_desv_cubital('R', 16)
_PULG = ['cmc1_R', 'mcf1_R', 'if1_R', 'punta_dedo1_R', 'centro:Right trapezium', 'centro:Right first metacarpal bone']
F['pulgar-ap'] = lambda: figura(
    'pulgar-ap', _pap(), dir=(0, -1, 0), vertical=('cmc1_R', 'punta_dedo1_R'), huesos=MANO, region=MANO,
    cortes=[('estiloides_radio_R', 'distal', 0.07)], puntos=_PULG)
F['pulgar-ap-corte'] = lambda: corte(
    'pulgar-ap-corte', _pap(), ('grande_R', 'mcf3_R', 0.3), arriba=(0, 1, 0), huesos=MANO, region=MANO)
F['pulgar-ap-costado'] = lambda: figura(
    'pulgar-ap-costado', _pap(), dir=(1, 0, 0), arriba=(0, 1, 0), huesos=MANO, region=MANO,
    cortes=[('estiloides_radio_R', 'distal', 0.07)], puntos=_PULG)
# PA oblicua: PA de mano (pulgar apoyado de costado, oblicuo) con el pulgar en leve abducción.
F['pulgar-pa-oblicua'] = lambda: figura(
    'pulgar-pa-oblicua', plana(Pose().codo_flex('R', 90).prono('R', 180)).pulgar('R', abd_radial=15), dir=(0, -1, 0),
    horizontal=('grande_R', 'mcf3_R'), huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.10)], puntos=_PULG)
# Lateral: desde la pronación, mano un poco arqueada (dedos algo flexionados) y rotada hacia medial (45°: con eso el pulpejo
# del pulgar queda horizontal, es decir, el pulgar en lateral verdadera).
F['pulgar-lateral'] = lambda: figura(
    'pulgar-lateral', plana(Pose().hombro_flex('R', 90).prono('R', 180).hombro_rot_ext('R', -45)).dedos_flex('R', 30, 30),
    dir=(0, -1, 0), horizontal=('grande_R', 'mcf3_R'), huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.10)],
    puntos=_PULG)

# Muñeca. PA: pronación, dedos flexionados y mano un poco arqueada (la muñeca apoya de lleno); vista desde el tubo y de costado
# (desde lateral, el codo a la izquierda). Oblicua: rotada 45° hacia lateral, dedos flexionados para sostenerla. Lateral:
# lateral verdadera con el pulgar arriba. Desviaciones radial y cubital: desde la PA, mano llevada al lado radial o cubital
# (dedos extendidos para que se vea el eje). Stecher modificado: PA con la mano apoyada en un bloque de 20° (muñeca en 20° de
# flexión dorsal). Túnel carpiano: muñeca en hiperextensión (los dedos sostenidos hacia atrás) y rotada unos 10° hacia interno.
_WP = ['codo_R', 'grande_R', 'escafoides_R', 'estiloides_radio_R', 'estiloides_cubito_R', 'mcf3_R', 'base_mc3_R', 'punta_dedo3_R',
       'punta_dedo2_R', 'punta_dedo5_R', 'punta_dedo1_R', 'centro:Right lunate', 'centro:Right hamate']
_wpa = lambda: plana(Pose().codo_flex('R', 90).prono('R', 180)).dedos_flex('R', 20, 40).muneca_flex('R', -18)
_CORTE_ANTEBRAZO = [('estiloides_radio_R', 'distal', 0.12)]
F['muneca-pa'] = lambda: figura('muneca-pa', _wpa(), dir=(0, -1, 0), horizontal=('codo_R', 'grande_R'),
    huesos=MANO, region=MANO, cortes=_CORTE_ANTEBRAZO, puntos=_WP)
F['muneca-pa-costado'] = lambda: figura('muneca-pa-costado', _wpa(), dir=(1, 0, 0), horizontal=('codo_R', 'grande_R'),
    huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.18)], puntos=_WP)
_wobl = lambda: plana(Pose().codo_flex('R', 90).prono('R', 135)).dedos_flex('R', 40, 60)
F['muneca-pa-oblicua'] = lambda: figura('muneca-pa-oblicua', _wobl(), dir=(0, -1, 0), horizontal=('codo_R', 'grande_R'),
    huesos=MANO, region=MANO, cortes=_CORTE_ANTEBRAZO, puntos=_WP)
F['muneca-pa-oblicua-corte'] = lambda: corte('muneca-pa-oblicua-corte', _wobl(), ('grande_R', 'mcf3_R', 0.4), arriba=(0, 1, 0),
    huesos=MANO, region=MANO)
_wlat = lambda: Pose().codo_flex('R', 90).prono('R', 90).pulgar('R', abd_palmar=-10)
F['muneca-lateral'] = lambda: figura('muneca-lateral', _wlat(), dir=(0, -1, 0), horizontal=('codo_R', 'grande_R'),
    huesos=MANO, region=MANO, cortes=_CORTE_ANTEBRAZO, puntos=_WP)
F['muneca-lateral-corte'] = lambda: corte('muneca-lateral-corte', _wlat(), ('grande_R', 'mcf3_R', 0.4), arriba=(0, 1, 0),
    huesos=MANO, region=MANO)
F['muneca-desviacion-radial'] = lambda: figura('muneca-desviacion-radial',
    plana(Pose().codo_flex('R', 90).prono('R', 180)).muneca_desv_cubital('R', -20), dir=(0, -1, 0),
    horizontal=('codo_R', 'centro:Right lunate'), huesos=MANO, region=MANO, cortes=_CORTE_ANTEBRAZO, puntos=_WP)
F['muneca-desviacion-cubital--v1'] = lambda: figura('muneca-desviacion-cubital--v1',
    plana(Pose().codo_flex('R', 90).prono('R', 180)).muneca_desv_cubital('R', 30), dir=(0, -1, 0),
    horizontal=('codo_R', 'centro:Right lunate'), huesos=MANO, region=MANO, cortes=_CORTE_ANTEBRAZO, puntos=_WP)
F['muneca-desviacion-cubital--v2'] = lambda: figura('muneca-desviacion-cubital--v2',
    plana(Pose().codo_flex('R', 90).prono('R', 180)).muneca_flex('R', -20), dir=(1, 0, 0), horizontal=('codo_R', 'grande_R'),
    huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.18)], puntos=_WP)
F['muneca-tunel-carpiano'] = lambda: figura('muneca-tunel-carpiano',
    Pose().codo_flex('R', 90).prono('R', 170).muneca_flex('R', -75).dedos_flex('R', -10, 0, 0).pulgar('R', abd_radial=10),
    dir=(1, 0, 0), horizontal=('codo_R', 'grande_R'), huesos=MANO, region=MANO, cortes=[('estiloides_radio_R', 'distal', 0.18)], puntos=_WP)

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        print(k, F[k]())
