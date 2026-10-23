# separa la malla base de MakeHuman (CC0) en partes para el render plano: piel, pelo, ojos (blanco/iris), cejas, short
import numpy as np, json, sys
V=[];G={};g=None
for l in open('/tmp/claude-0/mh/base.obj'):
    if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
    elif l.startswith('g '): g=l.split()[1]
    elif l.startswith('f '): G.setdefault(g,[]).append([int(t.split('/')[0])-1 for t in l.split()[1:]])
V=np.array(V)*0.1   # dm -> m
F={k:np.array(v) for k,v in G.items()}
def cen(f): return V[f].mean(1)
partes={}
body=F['body']; cb=cen(body)
eyes=[]
for s in ('l','r'):
    e=F[f'helper-{s}-eye']; c=V[np.unique(e)].mean(0); eyes.append(c)
    d=cen(e)-c; d/=np.linalg.norm(d,axis=1,keepdims=True)
    iris=d[:,2]>0.72
    partes[f'iris_{s}']=e[iris]; partes[f'ojo_{s}']=e[~iris]
eyes=np.array(eyes); ex=np.abs(eyes[:,0]).mean(); ey=eyes[:,1].mean(); ez=eyes[:,2].mean()
# cejas: franja sobre cada ojo, en la cara anterior
dx=np.abs(np.abs(cb[:,0])-ex*1.05); dy=cb[:,1]-ey
xr=np.abs(cb[:,0])-ex
arc=0.0215-0.006*(xr/0.024)**2
ceja=(xr>-0.019)&(xr<0.026)&(np.abs(dy-arc)<0.0032)&(cb[:,2]>ez-0.005)
partes['cejas']=body[ceja]
# labios
my=ey-0.072
lab=(np.abs(cb[:,0])<0.022)&(np.abs(cb[:,1]-my)<0.0055*np.clip(1-(cb[:,0]/0.023)**2,0,1))&(cb[:,2]>ez-0.01)
partes['labios']=body[lab]
partes['piel']=body[~ceja&~lab]
c0=np.array([0,ey,ez-0.09]); Q=cb-c0; u=Q[:,1]; fz=Q[:,2]
pelo=(np.linalg.norm(Q,axis=1)<0.15)&(cb[:,1]>ey-0.09)&(u>-0.0025+0.64*fz)&~((np.abs(cb[:,0])>0.062)&(u<0.035)&(fz>-0.04))
hv=(np.linalg.norm(V-c0,axis=1)<0.15)&(V[:,1]>ey-0.09)
lin_=lambda P: -0.0025+0.64*(P[:,2]-c0[2])
den=hv&((V[:,1]-ey)>lin_(V))&~((np.abs(V[:,0])>0.062)&((V[:,1]-ey)<0.035)&((V[:,2]-c0[2])>-0.04))
pf=body[den[body].any(1)]; partes['pelo']=pf
PEL=V.copy(); idx=np.unique(pf); fuera=idx[~den[idx]]
PEL[fuera,1]=ey+np.maximum(lin_(V[fuera]), np.where((np.abs(V[fuera,0])>0.062)&((V[fuera,2]-c0[2])>-0.04),0.035,-1)); partes['piel']=body[~ceja&~lab]
t=F['helper-tights']; tv=(V[:,1]>-0.27)&(V[:,1]<0.06); partes['ropa']=t[tv[t].any(1)]
print({k:len(v) for k,v in partes.items()}, 'ojos', eyes, file=sys.stderr)
with open('/tmp/claude-0/mh/mh.obj','w') as f:
    vo=1
    for k,ff in partes.items():
        f.write(f'o {k}\n')
        VV=V
        if k=='pelo': n=PEL-c0; VV=PEL+n/np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-6)*0.005
        if k=='ropa': VV=V*np.array([1.01,1,1.01]); VV[:,1]=np.clip(VV[:,1],-0.27,0.06)
        for p in VV: f.write('v %.5f %.5f %.5f\n'%tuple(p))
        for q in ff: f.write('f '+' '.join(str(i+vo) for i in q)+'\n')
        vo+=len(V)
