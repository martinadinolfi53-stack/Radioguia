# Avatar del paciente a partir de la malla base de MakeHuman (CC0): separa piel, pelo, ojos (blanco/iris), cejas, labios y short
import numpy as np, sys
V=[];G={};g=None
for l in open('/tmp/claude-0/mh/base.obj'):
    if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
    elif l.startswith('g '): g=l.split()[1]
    elif l.startswith('f '): G.setdefault(g,[]).append([int(t.split('/')[0])-1 for t in l.split()[1:]])
V=np.array(V)*0.1   # dm -> m
F={k:np.array(v) for k,v in G.items()}
cen=lambda f: V[f].mean(1)
body=F['body']; cb=cen(body)
partes={}; verts={}
eyes=[]
for s in ('l','r'):
    e=F[f'helper-{s}-eye']; c=V[np.unique(e)].mean(0); eyes.append(c)
    d=cen(e)-c; d/=np.linalg.norm(d,axis=1,keepdims=True)
    iris=d[:,2]>0.80; partes[f'iris_{s}']=e[iris]; partes[f'ojo_{s}']=e[~iris]
eyes=np.array(eyes); ex=np.abs(eyes[:,0]).mean(); ey=eyes[:,1].mean(); ez=eyes[:,2].mean()
# cejas: arco fino sobre cada ojo
xr=np.abs(cb[:,0])-ex; dy=cb[:,1]-ey
arc=0.0215-0.006*(xr/0.024)**2
ceja=(xr>-0.019)&(xr<0.026)&(np.abs(dy-arc)<0.003)&(cb[:,2]>ez-0.005)
# labios (superior e inferior), forma de lente
my=ey-0.0695
lab=(np.abs(cb[:,0])<0.023)&(np.abs(cb[:,1]-my)<0.0065*np.clip(1-(cb[:,0]/0.024)**2,0,1))&(cb[:,2]>ez-0.012)
def zona(dentro, borde):
    f_=body[dentro[body].any(1)]; P=V.copy(); i_=np.unique(f_); o_=i_[~dentro[i_]]; P[o_]=borde(V[o_]); return f_, P
xv=np.abs(V[:,0])-ex; dyv=V[:,1]-ey; av=0.0215-0.006*(xv/0.024)**2
cv=(xv>-0.019)&(xv<0.026)&(np.abs(dyv-av)<0.003)&(V[:,2]>ez-0.005)
def bc(P):
    x_=np.abs(P[:,0])-ex; a_=0.0215-0.006*(x_/0.024)**2; Q=P.copy(); d_=Q[:,1]-ey-a_; Q[:,1]=ey+a_+np.clip(d_,-0.003,0.003); return Q
partes['cejas'], verts['cejas'] = zona(cv, bc)
hw=lambda x: 0.0065*np.clip(1-(x/0.024)**2,0,1)
lv=(np.abs(V[:,0])<0.023)&(np.abs(V[:,1]-my)<hw(V[:,0]))&(V[:,2]>ez-0.012)
def bl(P):
    Q=P.copy(); Q[:,0]=np.clip(Q[:,0],-0.023,0.023); h_=hw(Q[:,0]); Q[:,1]=my+np.clip(Q[:,1]-my,-h_,h_); return Q
partes['labios'], verts['labios'] = zona(lv, bl)
for k in ('cejas','labios'): verts[k]=verts[k]+np.array([0,0,0.0008])
nav=np.array([0,0.189,0.137]); bv=np.unique(body); BV=V[bv]
def _nip(sx):
    m=(np.abs(BV[:,0]-sx*0.085)<0.012)&(np.abs(BV[:,1]-0.355)<0.012); P=BV[m]; return P[P[:,2].argmax()]
nips=[_nip(1),_nip(-1)]
om=np.linalg.norm(cb-nav,axis=1)<0.0075
pv=np.zeros(len(V),bool)
for q in nips: pv|=np.linalg.norm(V-q,axis=1)<0.012
pz=pv[body].all(1)
partes['ombligo']=body[om]; partes['pezon']=body[pz]
partes['piel']=body[~om&~pz]
# pelo corto: casco sobre el cuero cabelludo con línea del pelo según el ángulo alrededor de la cabeza (0 = frente, 180 = nuca)
c0=np.array([0,ey,ez-0.09])
def th(P): return np.degrees(np.arctan2(np.abs(P[:,0]-c0[0]), P[:,2]-c0[2]))
TH=[0,25,45,62,70,78,84,100,112,125,150,180]
HH=[0.064,0.060,0.052,0.040,0.030,-0.004,0.030,0.034,0.012,-0.030,-0.042,-0.046]
hl=lambda P: np.interp(th(P),TH,HH)
cab=(np.linalg.norm(V-c0,axis=1)<0.155)&(V[:,1]>ey-0.10)
den=cab&((V[:,1]-ey)>hl(V))
pf=body[den[body].any(1)]; partes['pelo']=pf
PEL=V.copy(); idx=np.unique(pf); fuera=idx[~den[idx]]
PEL[fuera,1]=ey+hl(V[fuera])
n=PEL-c0; n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-6)
grosor=0.002+0.010*np.clip((PEL[:,1]-ey-hl(PEL))/0.05,0,1)
verts['pelo']=PEL+n*grosor[:,None]
# short de paciente
t=F['helper-tights']; tv=(V[:,1]>-0.27)&(V[:,1]<0.07); partes['ropa']=t[tv[t].any(1)]
R=V*np.array([1.012,1,1.012]); R[:,1]=np.clip(R[:,1],-0.27,0.07); verts['ropa']=R
print({k:len(v) for k,v in partes.items()}, file=sys.stderr)
with open('/tmp/claude-0/mh/mh.obj','w') as f:
    vo=1
    for k,ff in partes.items():
        VV=verts.get(k,V); f.write(f'o {k}\n')
        for p in VV: f.write('v %.5f %.5f %.5f\n'%tuple(p))
        for q in ff: f.write('f '+' '.join(str(i+vo) for i in q)+'\n')
        vo+=len(VV)
