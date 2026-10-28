# Figuras de tórax, vía aérea, esternón, esternoclaviculares y costillas en el estilo por capas (Bontrager 9.ª ed., caps. 1 y 7).
# Uso (desde herramientas/ilus3d):  python3 figuras/torax.py [id…]   ->  render/<id>-tubo y render/<id>-otra
# Las de tórax pediátrico siguen con el dibujo a mano (el modelo es adulto).
import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import numpy as np
from posturas import Pose
from vistas import tubo, costado, arriba, angulado, oblicuo

AP, PA, LAT = (0, 0, -1), (0, 0, 1), (1, 0, 0)        # LAT: lateral izquierda (costado izquierdo contra el RI)
TORAX = ['torax', 'cintura_R', 'cintura_L', 'C7', 'L1', 'L2']
CUELLO = ['C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'torax', 'cintura_R', 'cintura_L']
T7 = 'centro:Seventh thoracic vertebra'
BAJO_CADERA = [('cresta_iliaca_R', (0, 1, 0), 0.08)]     # corte un poco por debajo de las crestas ilíacas
F = {}

def lado(s):
    o = 'L' if s == 'R' else 'R'
    return o
# poses (buscadas con los puntos del modelo): manos en las caderas con las palmas hacia afuera; brazo arriba con la mano sobre la
# cabeza; brazos cruzados por encima de la cabeza
def _caderas(p, s):  return p.hombro_abd(s, 40).hombro_flex(s, -35).hombro_rot_ext(s, -85).codo_flex(s, 75).prono(s, 150)
def _arriba(p, s):   return p.hombro_flex(s, 150).hombro_abd(s, -10).hombro_rot_ext(s, -65).codo_flex(s, 50)
_pa = lambda: _caderas(_caderas(Pose(), 'R'), 'L')
_brazos_arriba = lambda: _arriba(_arriba(Pose(), 'R'), 'L')
def _obl(arriba_s): return lambda: _caderas(_arriba(Pose(), arriba_s), lado(arriba_s))     # un brazo arriba, el otro en la cadera

def par(id, pose, d, centro, ri, otra='costado', radio=0.18, encuadre=0.34, huesos=TORAX, enc_otra=0.45, cortes=BAJO_CADERA, **kw):
    """las dos vistas de una ficha"""
    kt = {k: v for k, v in kw.items() if k not in ('desde', 'arriba_img', 'arriba_tubo')}
    if 'arriba_tubo' in kw: kt['arriba'] = kw.pop('arriba_tubo')
    F[id + '-tubo'] = lambda: tubo(id, pose(), d, centro, ri, radio=radio, encuadre=encuadre, huesos=huesos, cortes=cortes, cara=True, **kt)
    if otra == 'costado': F[id + '-otra'] = lambda: costado(id, pose(), d, centro, ri, huesos=huesos, encuadre=enc_otra, cortes=cortes, **kw)
    elif otra == 'arriba': F[id + '-otra'] = lambda: arriba(id, pose(), d, centro, ri, huesos=huesos, cortes=cortes,
                                                          **{k: v for k, v in kw.items() if k not in ('desde', 'arriba_img')})
DE_PIE = dict(arriba_img=(0, 1, 0))
MITAD = f'medio:{T7}|esternon_medio'                      # mitad del tórax (de adelante atrás) a la altura de T7

# PA: de pie, manos en las caderas con las palmas afuera y hombros adelante; RC en T7 (18-20 cm por debajo de la vértebra prominente)
par('torax-pa', _pa, PA, T7, (0.35, 0.43), **DE_PIE)
# lateral izquierda: brazos cruzados sobre la cabeza; RC en la mitad del tórax a la altura de T7
par('torax-lateral', _brazos_arriba, LAT, MITAD, (0.35, 0.43), **DE_PIE)
# lateral en camilla o silla de ruedas: sentado derecho, brazos sobre la cabeza
_sentado = lambda: _brazos_arriba().cadera_flex('R', 90).cadera_flex('L', 90).rodilla_flex('R', 90).rodilla_flex('L', 90)
par('torax-lateral-camilla', _sentado, LAT, MITAD, (0.35, 0.43), cortes=(), enc_otra=0.6, **DE_PIE)
# decúbito lateral (sobre el costado izquierdo), RC horizontal AP a T7 (8-10 cm por debajo de la escotadura yugular);
# el techo queda del lado derecho del paciente: las dos vistas con ese lado arriba
_dec = (-1, 0, 0)
par('torax-decubito-lateral', _brazos_arriba, AP, T7, (0.35, 0.43), arriba_tubo=_dec, desde=(0, 1, 0), arriba_img=_dec)
# AP lordótica: de pie a unos 30 cm del RI, inclinado hacia atrás hasta apoyar los hombros; RC ⊥ al RI en la mitad del
# esternón. Con el cuerpo quieto, el rayo horizontal entra desde abajo respecto del cuerpo
LORD = 20                                                  # inclinación del paciente para el dibujo (el libro no da el ángulo)
_vert_lord = (0, np.cos(np.radians(LORD)), np.sin(np.radians(LORD)))     # vertical de la sala en ejes del cuerpo
par('torax-ap-lordotica', _pa, angulado(AP, LORD, 'cefalico'), 'esternon_medio', (0.35, 0.43), arriba_tubo=_vert_lord, arriba_img=_vert_lord)
# oblicuas anteriores 45°: OAD (v1, hombro derecho contra el RI, brazo izquierdo arriba) y OAI (v2)
par('torax-oblicua-anterior--v1', _obl('L'), oblicuo('PA', 45, 'R'), T7, (0.35, 0.43), otra='arriba', puntos=['cabeza_humero_L'])
par('torax-oblicua-anterior--v2', _obl('R'), oblicuo('PA', 45, 'L'), T7, (0.35, 0.43), otra='arriba', puntos=['cabeza_humero_L'])
# vía aérea superior: AP (v1) y lateral (v2, hombros abajo y atrás); RC a la altura de C6-C7
VA = 'centro:Sixth cervical vertebra'
par('via-aerea-ap-lateral--v1', Pose, AP, VA, (0.24, 0.30), radio=0.09, encuadre=0.22, huesos=CUELLO, cortes=[('xifoides', (0, 1, 0), 0.0)], **DE_PIE)
par('via-aerea-ap-lateral--v2', lambda: Pose().hombro_flex('R', -15).hombro_flex('L', -15), LAT, f'medio:{VA}|yugular', (0.24, 0.30), radio=0.09,
    encuadre=0.22, huesos=CUELLO, cortes=[('xifoides', (0, 1, 0), 0.0)], **DE_PIE)
# esternón: OAD 15-20°; lateral con los hombros hacia atrás
par('esternon-oad', _obl('L'), oblicuo('PA', 17, 'R'), 'esternon_medio', (0.24, 0.30), radio=0.13, encuadre=0.26, otra='arriba', puntos=['cabeza_humero_L'])
par('esternon-lateral', lambda: Pose().hombro_flex('R', -25).hombro_flex('L', -25), LAT, 'esternon_medio', (0.24, 0.30), radio=0.13, encuadre=0.26, **DE_PIE)
# esternoclaviculares: PA a T2-T3 (unos 3 cm por debajo de la escotadura yugular), cabeza girada; oblicua anterior 10-15°
EC = 'medio:yugular|esternon_medio|0.35'
par('esternoclaviculares-pa', lambda: Pose().cabeza_rot('L', 60), PA, EC, (0.24, 0.18), radio=0.09, encuadre=0.20, **DE_PIE)
par('esternoclaviculares-oblicua', lambda: Pose().cabeza_rot('L', 60), oblicuo('PA', 12, 'R'), EC, (0.24, 0.18), radio=0.09, encuadre=0.20,
    otra='arriba', puntos=['cabeza_humero_L'])
# costillas: AP por encima del diafragma (T7) y por debajo (entre el xifoides y el borde costal inferior);
# axilares superiores en OAD 45° y axilares inferiores en OPI 45° (brazo del lado del RI arriba, la otra mano en la cintura)
par('costillas-ap-encima-diafragma', Pose, AP, T7, (0.43, 0.35), **DE_PIE)
DEB = 'medio:xifoides|centro:Second lumbar vertebra'
par('costillas-ap-debajo-diafragma', Pose, AP, DEB, (0.43, 0.35), **DE_PIE)
par('costillas-axilares-oad-superiores', _obl('L'), oblicuo('PA', 45, 'R'), T7, (0.35, 0.43), otra='arriba', puntos=['cabeza_humero_L'])
par('costillas-axilares-opi-inferiores', _obl('L'), oblicuo('AP', 45, 'L'), DEB, (0.35, 0.43), otra='arriba', puntos=['cabeza_humero_L'])

if __name__ == '__main__':
    for k in (sys.argv[1:] or F):
        r = F[k](); print(k, {q: v for q, v in r.items() if q in ('res', 'ppc')})
