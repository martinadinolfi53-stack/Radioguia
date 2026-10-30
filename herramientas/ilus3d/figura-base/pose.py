# Pose del avatar: esqueleto "default" de MakeHuman (CC0) + skinning lineal por vértice.
# Rotaciones en ejes del modelo en reposo (X = izquierda del paciente, Y = arriba, Z = anterior),
# compuestas en jerarquía: G_hueso = G_padre · T(cabeza) · R · T(-cabeza).
import json, numpy as np
R_='/tmp/claude-0/mh/rig/'
SK=json.load(open(R_+'default.mhskel')); WT=json.load(open(R_+'default_weights.mhw'))['weights']
def rot(eje,g):
    e=np.asarray(eje,float); e/=np.linalg.norm(e); a=np.radians(g); K=np.array([[0,-e[2],e[1]],[e[2],0,-e[0]],[-e[1],e[0],0]])
    return np.eye(3)+np.sin(a)*K+(1-np.cos(a))*K@K
def articulaciones(V):   # V ya en metros
    return {k:V[v].mean(0) for k,v in SK['joints'].items()}
def huesos(V):
    J=articulaciones(V); return {b:(J[d['head']],J[d['tail']],d['parent']) for b,d in SK['bones'].items()}
def aplicar(V, pose, extra=()):
    """pose: {hueso: [(eje,grados), ...]} ; devuelve V posado y una función para posar otros arreglos por índice"""
    H=huesos(V); G={}
    def glob(b):
        if b in G: return G[b]
        h,t,p=H[b]; M=np.eye(4)
        if b in pose:
            R=np.eye(3)
            for eje,g in pose[b]: R=rot(eje,g)@R
            M[:3,:3]=R; M[:3,3]=h-R@h
        G[b]=(glob(p) if p else np.eye(4))@M; return G[b]
    for b in H: glob(b)
    n=len(V); W=np.zeros((n,)); A=np.zeros((n,4,4))
    for b,lst in WT.items():
        if b not in G: continue
        idx=np.array([i for i,_ in lst]); w=np.array([x for _,x in lst]); idx_ok=idx<n
        A[idx[idx_ok]]+=w[idx_ok,None,None]*G[b]; W[idx[idx_ok]]+=w[idx_ok]
    sin=W<1e-6; A[~sin]/=W[~sin,None,None]; A[sin]=G.get('head',np.eye(4))
    def posar(P):
        P=np.asarray(P); return np.einsum('nij,nj->ni',A[:,:3,:3],P)+A[:,:3,3]
    return posar, H, G, sin

# ---- ayudas anatómicas (todo en coordenadas de reposo) ----
def _dir(H,b):
    h,t,_=H[b]; d=t-h; return d/np.linalg.norm(d)
def codo_recto(H,lado):
    """eje y ángulo que alinean el antebrazo con el brazo (extensión completa del codo)"""
    u=_dir(H,'upperarm02.'+lado); f=(H['wrist.'+lado][0]-H['lowerarm01.'+lado][0]); f/=np.linalg.norm(f)
    a=np.cross(f,u); return a/np.linalg.norm(a), np.degrees(np.arccos(np.clip(f@u,-1,1)))
