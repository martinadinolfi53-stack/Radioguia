# Avatar del paciente a partir de la malla base de MakeHuman (CC0): separa piel, pelo, ojos (blanco/iris), cejas, labios y short
import numpy as np, sys
V=[];G={};g=None
for l in open('/tmp/claude-0/mh/base.obj'):
    if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
    elif l.startswith('g '): g=l.split()[1]
    elif l.startswith('f '): G.setdefault(g,[]).append([int(t.split('/')[0])-1 for t in l.split()[1:]])
V=np.array(V)
# forma del cuerpo: targets macro de MakeHuman (CC0): hombre joven, mezcla de rasgos, musculatura media-alta, algo magro
import os
TG={'caucasian-male-young':1/3,'african-male-young':1/3,'asian-male-young':1/3,'universal-male-young-maxmuscle-averageweight':float(os.environ.get('MUSC','0.6')),'universal-male-young-averagemuscle-minweight':float(os.environ.get('MAGRO','0.25'))}
for s_ in 'lr':
    TG[f'{s_}-eye-height2-incr']=float(os.environ.get('OJO2','0.7')); TG[f'{s_}-eye-height1-incr']=float(os.environ.get('OJO1','0.3')); TG[f'{s_}-eye-scale-incr']=float(os.environ.get('OJOS','0.2'))
for k,w in TG.items():
    for l in open(f'/tmp/claude-0/mh/t/{k}.target'):
        if l[0]=='#' or not l.strip(): continue
        i,dx,dy,dz=l.split(); V[int(i)]+=w*np.array([float(dx),float(dy),float(dz)])
V=V*0.1   # dm -> m
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
ceja=(xr>-0.019)&(xr<0.026)&(np.abs(dy-arc)<0.0024)&(cb[:,2]>ez-0.005)
# labios (superior e inferior), forma de lente
my=ey-0.0695
lab=(np.abs(cb[:,0])<0.023)&(np.abs(cb[:,1]-my)<0.0065*np.clip(1-(cb[:,0]/0.024)**2,0,1))&(cb[:,2]>ez-0.012)
def zona(dentro, borde):
    f_=body[dentro[body].any(1)]; P=V.copy(); i_=np.unique(f_); o_=i_[~dentro[i_]]; P[o_]=borde(V[o_]); return f_, P
xv=np.abs(V[:,0])-ex; dyv=V[:,1]-ey; av=0.0215-0.006*(xv/0.024)**2
cv=(xv>-0.019)&(xv<0.026)&(np.abs(dyv-av)<0.0024)&(V[:,2]>ez-0.005)
def bc(P):
    x_=np.abs(P[:,0])-ex; a_=0.0215-0.006*(x_/0.024)**2; Q=P.copy(); d_=Q[:,1]-ey-a_; Q[:,1]=ey+a_+np.clip(d_,-0.0024,0.0024); return Q
partes['cejas'], verts['cejas'] = zona(cv, bc)
hw=lambda x: 0.0045*np.clip(1-(x/0.021)**2,0,1)
lv=(np.abs(V[:,0])<0.02)&(np.abs(V[:,1]-my)<hw(V[:,0]))&(V[:,2]>ez-0.012)
def bl(P):
    Q=P.copy(); Q[:,0]=np.clip(Q[:,0],-0.02,0.02); h_=hw(Q[:,0]); Q[:,1]=my+np.clip(Q[:,1]-my,-h_,h_); return Q
partes['labios'], verts['labios'] = zona(lv, bl)
for k in ('cejas','labios'): verts[k]=verts[k]+np.array([0,0,0.0008])
bv0=np.unique(body); BV0=V[bv0]; m_=(np.abs(BV0[:,0])<0.006)&(BV0[:,1]>0.08)&(BV0[:,1]<0.30)&(BV0[:,2]>0.05)
P_=BV0[m_]; ys=np.arange(0.09,0.29,0.004); zp=np.array([P_[np.abs(P_[:,1]-y)<0.003,2].max() if (np.abs(P_[:,1]-y)<0.003).any() else np.nan for y in ys])
dip=np.nan_to_num(np.convolve(np.nan_to_num(zp),np.ones(9)/9,'same')-zp,nan=-1); dip[:5]=dip[-5:]=-1; k_=int(np.argmax(dip))
nav=np.array([0,ys[k_],zp[k_]]); print('ombligo',nav,file=sys.stderr); bv=np.unique(body); BV=V[bv]
def _nip(sx):
    m=(np.abs(BV[:,0]-sx*0.09)<0.02)&(np.abs(BV[:,1]-nav[1]-0.166)<0.02); P=BV[m]; return P[P[:,2].argmax()]
nips=[_nip(1),_nip(-1)]
om=np.linalg.norm(cb-nav,axis=1)<0.0075
pv=np.zeros(len(V),bool)
for q in nips: pv|=np.linalg.norm(V-q,axis=1)<0.0075
pz=pv[body].sum(1)>=2
partes['ombligo']=body[om]; partes['pezon']=body[pz]
partes['piel']=body[~om&~pz]
# pelo corto: casco sobre el cuero cabelludo con línea del pelo según el ángulo alrededor de la cabeza (0 = frente, 180 = nuca)
c0=np.array([0,ey,ez-0.09])
def th(P): return np.degrees(np.arctan2(np.abs(P[:,0]-c0[0]), P[:,2]-c0[2]))
TH=[0,25,45,62,70,78,84,100,112,125,150,180]
HH=[0.064,0.060,0.052,0.040,0.030,-0.004,0.022,0.022,0.012,-0.010,-0.035,-0.042]
if os.environ.get('PELO')=='flequillo': HH=[0.038,0.041,0.047]+HH[3:]
hl=lambda P: np.interp(th(P),TH,HH)
cab=(np.linalg.norm(V-c0,axis=1)<0.155)&(V[:,1]>ey-0.10)
den=cab&((V[:,1]-ey)>hl(V))
pf=body[den[body].any(1)]; partes['pelo']=pf
PEL=V.copy(); idx=np.unique(pf); fuera=idx[~den[idx]]
PEL[fuera,1]=ey+hl(V[fuera])
n=PEL-c0; n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-6)
ESTILO=os.environ.get('PELO','actual')
alto=np.clip((PEL[:,1]-ey-hl(PEL))/0.05,0,1); fr=(PEL[:,2]-c0[2])/0.09; lado=np.abs(PEL[:,0])
if ESTILO=='volumen':
    # laterales cortos, volumen arriba que crece hacia la frente (copete suave peinado hacia atrás)
    arriba_=np.clip((PEL[:,1]-ey-0.045)/0.05,0,1)*np.clip(1-(lado-0.045)/0.04,0,1)
    grosor=0.002+0.005*alto+0.030*arriba_*np.clip(0.45+0.55*fr,0.2,1.0)
    PELd=PEL+n*grosor[:,None]; PELd[:,2]+=0.012*arriba_*np.clip(fr,0,1)**1.5
    verts['pelo']=PELd
elif ESTILO=='flequillo':
    # flequillo corto que cae sobre la frente, peinado hacia adelante; laterales y nuca prolijos
    frente=np.clip(fr,0,1)**2*np.clip(1-(lado-0.02)/0.05,0,1)
    grosor=0.002+0.012*alto+0.006*frente
    PELd=PEL+n*grosor[:,None]; PELd[:,2]+=0.007*frente*alto; PELd[:,1]-=0.004*frente
    verts['pelo']=PELd
elif ESTILO=='degrade':
    # degradé real: un solo casco; el color pasa de piel a pelo en rend.py según la altura (ver degrade.json)
    TB=[0,45,60,90,130,180]; YB=[0.0,0.0,0.040,0.042,0.030,0.020]
    lb=lambda P: ey+np.interp(th(P),TB,YB)
    ft=np.clip((PEL[:,1]-(lb(PEL)-0.035))/0.035,0,1)
    grosor=0.0005+0.0022*ft; verts['pelo']=PEL+n*grosor[:,None]
    import json; json.dump({'ey':float(ey),'c0':[float(x) for x in c0],'TB':TB,'YB':YB},open('/tmp/claude-0/mh/degrade.json','w'))
elif ESTILO=='militar':
    # dos zonas: arriba (pelo) y costados/nuca (pelo2) más cortos; degradé = costados casi al ras
    # línea de corte lisa: horizontal a los costados, baja hacia la nuca; nada adelante
    TB=[0,45,60,90,130,180]; YB=[-1,-1,0.050,0.054,0.044,0.034]
    lb=lambda P: ey+np.interp(th(P),TB,YB)
    # pelo2 = casco completo al ras; pelo = capa de arriba encima (sin huecos entre zonas)
    sup=(PEL[pf][:,:,1]>lb(PEL[pf].reshape(-1,3)).reshape(pf.shape)).any(1)
    partes['pelo']=pf[sup]; partes['pelo2']=pf
    arr=np.clip((PEL[:,1]-lb(PEL))/0.015,0,1)
    if ESTILO=='degrade': g1=0.0024+0.0006*alto; g2=0.0004+0.0006*alto
    else: g1=0.0012+0.0058*arr*np.clip(0.6+0.4*fr,0.3,1)+0.0012; g2=0.0012+0.0004*alto
    A=PEL.copy(); B=PEL.copy(); yl=lb(PEL); m=yl>ey-0.5
    A[m,1]=np.maximum(A[m,1],yl[m])
    verts['pelo']=A+n*g1[:,None]; verts['pelo2']=B+n*g2[:,None]
elif ESTILO=='rapado':
    grosor=0.0012+0.0008*alto; verts['pelo']=PEL+n*grosor[:,None]
else:
    grosor=0.002+0.013*alto; verts['pelo']=PEL+n*grosor[:,None]
# short de paciente
# short: la piel de la pelvis y los muslos (sin manos), separada 3 mm hacia afuera, con bordes rectos
nrm=np.zeros_like(V)
for f_ in body:
    a_,b_,c_=V[f_[0]],V[f_[1]],V[f_[2]]; n_=np.cross(b_-a_,c_-a_); nrm[f_]+=n_
nrm/=np.maximum(np.linalg.norm(nrm,axis=1,keepdims=True),1e-9)
sv=(V[:,1]>-0.27)&(V[:,1]<0.07)&(np.abs(V[:,0])<0.24)
partes['ropa']=body[sv[body].all(1)|(sv[body].sum(1)>=2)]
R=V+nrm*0.003; R[:,1]=np.clip(R[:,1],-0.27,0.07); verts['ropa']=R
print({k:len(v) for k,v in partes.items()}, file=sys.stderr)
with open('/tmp/claude-0/mh/mh.obj','w') as f:
    # las partes con vértices propios (verts) pueden tener otra cantidad de vértices
    vo=1
    for k,ff in partes.items():
        VV=verts.get(k,V); f.write(f'o {k}\n')
        for p in VV: f.write('v %.5f %.5f %.5f\n'%tuple(p))
        for q in ff: f.write('f '+' '.join(str(i+vo) for i in q)+'\n')
        vo+=len(VV)
