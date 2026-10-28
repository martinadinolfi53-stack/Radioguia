# Vistas genéricas en el estilo por capas para las zonas sin figuras propias (pelvis, tórax, columna, cráneo, abdomen).
# Convención de hombro.py: el cuerpo queda quieto (de pie) y lo que gira es el rayo. d = sentido del rayo en ejes del cuerpo
# (X = izquierda del paciente, Y = arriba, Z = anterior). AP: (0, 0, -1); PA: (0, 0, 1); lateral derecha (lado derecho contra
# el RI): (-1, 0, 0). Cada ficha tiene una vista desde el tubo (<id>-tubo) y una segunda vista (<id>-otra): de costado respecto
# del rayo (el RI de canto abajo, el tubo arriba) o desde arriba (desde la cabeza). El esquema (herramientas/ilus/estilo.cjs,
# modelo()) dibuja encima el RI, el RC y los ángulos con los puntos b0-b3 (esquinas del RI), rc_ini (de dónde viene el RC) y el
# punto del RC.
import numpy as np
from escena import figura, ri_detras, cuerpo
from puntos import Puntos

def angulado(d, grados, hacia='cefalico'):
    """rayo d inclinado grados hacia la cabeza ('cefalico') o hacia los pies ('caudal')"""
    d = np.asarray(d, float); d /= np.linalg.norm(d); a = np.radians(grados); y = np.array([0, 1.0 if hacia == 'cefalico' else -1.0, 0])
    return tuple(np.cos(a) * d + np.sin(a) * y)

def oblicuo(base, grados, lado='R'):
    """AP o PA girado grados: lado 'R' = lado derecho contra el RI (OPD en AP, OAD en PA); 'L' = lado izquierdo"""
    a = np.radians(grados) * (1 if lado == 'R' else -1)
    return (-np.sin(a), 0.0, -np.cos(a)) if base == 'AP' else (-np.sin(a), 0.0, np.cos(a))

def _antes(pose, centro, d, dist=0.45):
    c = cuerpo(); c.posar(pose); return Puntos(c).posado(centro) - dist * np.asarray(d, float) / np.linalg.norm(d)

def _horiz(d):
    h = np.array([d[0], 0.0, d[2]]); n = np.linalg.norm(h); return h / n if n > 1e-6 else np.array([0, 0, -1.0])

def _extra(pose, d, centro, ri, normal, debajo_de, arriba_ri, ri_radio=None):
    # con rayo angulado el RI se centra donde sale el RC ("centrar el RI en el RC proyectado")
    return ri_detras(pose, d, centro, *ri, debajo_de=debajo_de, normal=normal, arriba=arriba_ri, radio=ri_radio, al_rc=True) + [('rc_ini', _antes(pose, centro, d))]

def tubo(id, pose, d, centro, ri, radio=0.12, encuadre=0.26, cortes=(), region=None, huesos=(), normal=None, arriba=(0, 1, 0),
         debajo_de=None, arriba_ri=(0, 1, 0), musculos=None, destacar=(), contexto=(), puntos=(), piel_dentro=0.12, vista=None, **kw):
    """vista desde el tubo: cuerpo realista con la ventana sobre el punto del RC y el RI detrás. vista: dirección de la cámara
    cuando no conviene mirar en el sentido del rayo (rayo muy angulado: se mira perpendicular al RI, como en las fotos del libro)"""
    v = dict(punto=centro, radio=radio, encuadre=encuadre, destacar=list(destacar), contexto=list(contexto), piel_dentro=piel_dentro)
    if musculos: v['musculos'] = musculos
    return figura(id + '-tubo', pose, dir=vista if vista is not None else d, arriba=arriba, huesos=huesos, region=region, cortes=cortes, ventana=v,
                  puntos=[centro] + list(puntos) + _extra(pose, d, centro, ri, normal, debajo_de, arriba_ri, kw.pop('ri_radio', None)), **kw)

def costado(id, pose, d, centro, ri, cortes=(), region=None, huesos=(), normal=None, debajo_de=None, arriba_ri=(0, 1, 0),
            destacar=(), contexto=(), puntos=(), desde=None, encuadre=0, arriba_img=None, **kw):
    """vista de costado respecto del rayo: horizontal, perpendicular al rayo, con el tubo arriba del dibujo y el RI de canto abajo
    (arriba_img=(0, 1, 0): paciente de pie, derecho en el dibujo). desde: dirección de la cámara (por defecto, desde la derecha
    del paciente cuando el rayo es AP/PA). Piel semitransparente en todo el cuerpo y huesos adentro."""
    dh = _horiz(normal if normal is not None else d)
    if desde is None:
        desde = np.cross(dh, (0, 1, 0)); desde /= np.linalg.norm(desde)
        if abs(desde[0]) > 0.5 and desde[0] < 0: desde = -desde          # AP/PA: mirar desde la derecha del paciente (X negativo -> +X)
        if abs(desde[2]) > 0.5 and desde[2] > 0: desde = -desde          # lateral: mirar al paciente de frente
    v = dict(punto=centro, radio=-1, piel=0.5, encuadre=encuadre, destacar=list(destacar), contexto=list(contexto))
    return figura(id + '-otra', pose, dir=tuple(desde), arriba=tuple(arriba_img if arriba_img is not None else -dh), huesos=huesos, region=region, cortes=cortes, ventana=v,
                  puntos=[centro] + list(puntos) + _extra(pose, d, centro, ri, normal, debajo_de, arriba_ri, kw.pop('ri_radio', None)), **kw)

def arriba(id, pose, d, centro, ri, cortes=(), region=None, huesos=(), normal=None, debajo_de=None, arriba_ri=(0, 1, 0),
           destacar=(), contexto=(), puntos=(), **kw):
    """vista desde arriba (desde la cabeza) con el tubo arriba del dibujo y el RI abajo"""
    dh = _horiz(normal if normal is not None else d)
    v = dict(punto=centro, radio=-1, piel=0.5, encuadre=0, destacar=list(destacar), contexto=list(contexto))
    return figura(id + '-otra', pose, dir=(0, -1, 0), arriba=tuple(-dh), huesos=huesos, region=region, cortes=cortes, ventana=v,
                  puntos=[centro] + list(puntos) + _extra(pose, d, centro, ri, normal, debajo_de, arriba_ri, kw.pop('ri_radio', None)), **kw)
