# posición anatómica: brazos al costado, codos extendidos, palmas hacia adelante
import numpy as np, pose as P
V=P.V_REPOSO
H=P.huesos(V)
POSE={}
for s,sg in (('L',-1),('R',1)):
    POSE['upperarm01.'+s]=[((0,0,1),sg*38)]
    a,g=P.codo_recto(H,s); POSE['lowerarm01.'+s]=[(tuple(a),g)]
    f=H['wrist.'+s][0]-H['lowerarm01.'+s][0]
    POSE['lowerarm02.'+s]=[(tuple(f),float(__import__('os').environ.get('SUP','90'))*sg)]
