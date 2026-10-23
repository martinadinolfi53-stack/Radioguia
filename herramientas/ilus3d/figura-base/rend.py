import sys, json; sys.path.insert(0,'/tmp/claude-0/sp/bpyenv')
import bpy, mathutils, math
out=sys.argv[-1]
import os
COL={'piel':'f3cfb8','pelo':'5b4130','ojo':'ffffff','iris':'3d2b20','cejas':'6e4e3a','labios':'dba596','ropa':'c9d6e3','pelo2':'553b2b','raya':'3a2a20','ombligo':'c79a84','pezon':'dcab98'}
def lin(h):
    c=[int(h[i:i+2],16)/255 for i in (0,2,4)]; return tuple(x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c)
VIEWS={} if 'solo_cuerpo' in sys.argv else {'cab_0':(0,0),'cab_45':(45,0),'cab_90':(90,0),'cab_180':(180,0)}
for a in ([] if 'solo_cab' in sys.argv else ([0,90,180,45] if 'solo_cuerpo' in sys.argv else range(0,360,45))): VIEWS[f'v{a:03d}']=(a,0)
VIEWS.update({} if 'solo_cab' in sys.argv else {'arriba':(0,90)})
if os.environ.get('PELO')=='rapado': COL['pelo']='7d624f'
if os.environ.get('PELO')=='degrade': COL['pelo']='6e5442'; COL['pelo2']='c2a690'
if os.environ.get('PELO')=='militar': COL['pelo']='5f4635'; COL['pelo2']='8a6f5b'
for nombre,(az,el) in VIEWS.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.obj_import(filepath='/tmp/claude-0/mh/mh.obj', forward_axis='NEGATIVE_Z', up_axis='Y')
    sc=bpy.context.scene
    a=math.radians(az)
    import mathutils as mu
    fw=mu.Vector((-math.sin(a), math.cos(a), 0)) if el!=90 else mu.Vector((0,0,-1))
    upv=mu.Vector((0,0,1)) if el!=90 else mu.Vector((0,-1,0)); rt=fw.cross(upv)
    LUZ=tuple((-fw*0.55 + upv*0.65 - rt*0.5).normalized())
    PINTADO=os.environ.get('ESTILO')=='real' and os.environ.get('PELO')=='degrade'
    if PINTADO:
        # rapado pintado sobre la piel: sin malla de pelo, sin bordes, degradé continuo
        for o in [o for o in sc.objects if o.name.split('.')[0]=='pelo']: bpy.data.objects.remove(o)
        import numpy as np; from mathutils.kdtree import KDTree
        Z=np.load('/tmp/claude-0/mh/pelo_fac.npz'); kd=KDTree(len(Z['P']))
        for i,p in enumerate(Z['P']): kd.insert(p,i)
        kd.balance()
    for o in [o for o in sc.objects if o.type=='MESH']:
        k=o.name.split('.')[0]; k2=k.split('_')[0]
        if PINTADO and k2=='piel':
            att=o.data.attributes.new('fade','FLOAT','POINT'); vals=[]
            for v in o.data.vertices:
                co,i,d=kd.find(v.co); vals.append(float(Z['f'][i]) if d<1e-5 else 0.0)
            att.data.foreach_set('value',vals)
        m=bpy.data.materials.new(k); m.use_nodes=True; nt=m.node_tree
        base=COL.get(k2,COL.get(k,'ff00ff')); c=lin(base)
        e=nt.nodes.new('ShaderNodeEmission')
        if k2=='pelo' and os.environ.get('PELO')=='degrade':
            # degradé real: color de piel abajo a pelo arriba, según altura sobre una línea que baja hacia la nuca
            import json, numpy as np
            D=json.load(open('/tmp/claude-0/mh/degrade.json')); c0=D['c0']
            att=o.data.attributes.new('fade','FLOAT','POINT'); vals=[]
            for v in o.data.vertices:
                x,y,z=v.co   # el import deja la malla en coordenadas del modelo (rotación en el objeto)
                th=math.degrees(math.atan2(abs(x-c0[0]), z-c0[2]))
                lb=D['ey']+float(np.interp(th,D['TB'],D['YB']))
                vals.append(float(np.clip((y-(lb-0.035))/0.035,0,1))**1.3)
            att.data.foreach_set('value',vals)
            at=nt.nodes.new('ShaderNodeAttribute'); at.attribute_name='fade'
            mx=nt.nodes.new('ShaderNodeMix'); mx.data_type='RGBA'
            mx.inputs['A'].default_value=(*lin('ecc6ae'),1); mx.inputs['B'].default_value=(*c,1)
            nt.links.new(at.outputs['Fac'],mx.inputs['Factor'])
            geo=nt.nodes.new('ShaderNodeNewGeometry'); dp=nt.nodes.new('ShaderNodeVectorMath'); dp.operation='DOT_PRODUCT'
            dp.inputs[1].default_value=LUZ; nt.links.new(geo.outputs['Normal'],dp.inputs[0])
            cr=nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.interpolation='CONSTANT'
            el_=cr.color_ramp.elements; el_[0].position=0.0; el_[0].color=(0.84,0.84,0.84,1); el_[1].position=0.36; el_[1].color=(1,1,1,1)
            hi=el_.new(0.86); hi.color=(1.06,1.06,1.06,1)
            mp=nt.nodes.new('ShaderNodeMapRange'); mp.inputs['From Min'].default_value=-1; mp.inputs['From Max'].default_value=1
            nt.links.new(dp.outputs['Value'],mp.inputs['Value']); nt.links.new(mp.outputs['Result'],cr.inputs['Fac'])
            mu_=nt.nodes.new('ShaderNodeMix'); mu_.data_type='RGBA'; mu_.blend_type='MULTIPLY'; mu_.inputs['Factor'].default_value=1
            nt.links.new(mx.outputs['Result'],mu_.inputs['A']); nt.links.new(cr.outputs['Color'],mu_.inputs['B']); nt.links.new(mu_.outputs['Result'],e.inputs['Color'])
            cpel=bpy.data.collections.get('pelo') or bpy.data.collections.new('pelo')
            if cpel.name not in sc.collection.children: sc.collection.children.link(cpel)
            for cc in list(o.users_collection): cc.objects.unlink(o)
            cpel.objects.link(o)
        elif k2 in ('piel','ropa','pelo','pelo2'):
            # sombreado plano de 3 tonos (luz desde arriba, adelante y a la izquierda de la cámara): da volumen sin líneas
            geo=nt.nodes.new('ShaderNodeNewGeometry'); dp=nt.nodes.new('ShaderNodeVectorMath'); dp.operation='DOT_PRODUCT'
            dp.inputs[1].default_value=LUZ; nt.links.new(geo.outputs['Normal'],dp.inputs[0])
            cr=nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.interpolation='CONSTANT'
            el_=cr.color_ramp.elements; el_[0].position=0.0; el_[0].color=(*[x*0.84 for x in c],1); el_[1].position=0.36; el_[1].color=(*c,1)
            hi=el_.new(0.86); hi.color=(*[min(1,x*1.06+0.015) for x in c],1)
            
            mp=nt.nodes.new('ShaderNodeMapRange'); mp.inputs['From Min'].default_value=-1; mp.inputs['From Max'].default_value=1
            nt.links.new(dp.outputs['Value'],mp.inputs['Value']); nt.links.new(mp.outputs['Result'],cr.inputs['Fac']); nt.links.new(cr.outputs['Color'],e.inputs['Color'])
        else: e.inputs['Color'].default_value=(*c,1)
        EST=os.environ.get('ESTILO','plano')
        if EST=='suave':
            for nd in nt.nodes:
                if nd.bl_idname=='ShaderNodeValToRGB':
                    nd.color_ramp.interpolation='EASE'; els=nd.color_ramp.elements
                    els[0].color=tuple(x*0.80 if i<3 else 1 for i,x in enumerate(els[0].color))
        if EST=='real':
            bs=nt.nodes.new('ShaderNodeBsdfPrincipled'); bs.inputs['Roughness'].default_value=(0.55 if k2 in('piel','labios','ombligo','pezon') else 0.8)
            mxs=[nd for nd in nt.nodes if nd.bl_idname=='ShaderNodeMix' and nd.blend_type=='MIX' and nd.data_type=='RGBA']
            if mxs: nt.links.new(mxs[0].outputs['Result'],bs.inputs['Base Color'])
            else: bs.inputs['Base Color'].default_value=(*([min(1,x*1.08) for x in lin('eab496')] if k2=='piel' else c),1)
            if k2=='piel': bs.inputs['Specular IOR Level'].default_value=0.25
            if PINTADO and k2=='piel':
                # factor del pelo calculado por píxel desde la posición (liso, sin escalones de la malla)
                D=json.load(open('/tmp/claude-0/mh/degrade.json')); c0=D['c0']; ey=D['ey']
                N=nt.nodes; L=nt.links.new
                def op(o_,a_,b_=None):
                    m_=N.new('ShaderNodeMath'); m_.operation=o_
                    for j,v_ in enumerate((a_,b_)):
                        if v_ is None: continue
                        if isinstance(v_,(int,float)): m_.inputs[j].default_value=v_
                        else: L(v_,m_.inputs[j])
                    return m_.outputs[0]
                tc=N.new('ShaderNodeTexCoord'); sp=N.new('ShaderNodeSeparateXYZ'); L(tc.outputs['Object'],sp.inputs[0])
                X,Y,Zc=sp.outputs[0],sp.outputs[1],sp.outputs[2]
                ax=op('ABSOLUTE',op('SUBTRACT',X,c0[0])); th=op('DIVIDE',op('ARCTAN2',ax,op('SUBTRACT',Zc,c0[2])),math.pi)
                def curva(TB,YB):
                    fc=N.new('ShaderNodeFloatCurve'); cu=fc.mapping.curves[0]
                    lo,hi=min(YB),max(YB); sc_=hi-lo or 1
                    while len(cu.points)<len(TB): cu.points.new(0.5,0.5)
                    for p_,(t_,y_) in zip(cu.points,zip(TB,YB)): p_.location=(t_/180,(y_-lo)/sc_); p_.handle_type='VECTOR'
                    fc.mapping.clip_min_y=0; fc.mapping.clip_max_y=1; fc.mapping.update(); L(th,fc.inputs['Value'])
                    return op('ADD',op('MULTIPLY',fc.outputs[0],sc_),lo)
                HL=curva(D['TH'],D['HH']); LB=curva(D['TB'],D['YB'])
                yr=op('SUBTRACT',Y,ey)
                borde=op('MINIMUM',op('MAXIMUM',op('DIVIDE',op('SUBTRACT',yr,HL),0.004),0),1)
                ft=op('POWER',op('MINIMUM',op('MAXIMUM',op('DIVIDE',op('SUBTRACT',yr,op('SUBTRACT',LB,0.035)),0.035),0),1),1.3)
                oreja=op('MULTIPLY',op('GREATER_THAN',ax,0.0755),op('LESS_THAN',yr,0.040))
                fac=op('MULTIPLY',op('MULTIPLY',borde,ft),op('SUBTRACT',1,oreja))
                mx2=N.new('ShaderNodeMix'); mx2.data_type='RGBA'
                mx2.inputs['A'].default_value=(*[min(1,x*1.08) for x in lin('eab496')],1); mx2.inputs['B'].default_value=(*lin('5e4434'),1)
                L(fac,mx2.inputs['Factor']); L(mx2.outputs['Result'],bs.inputs['Base Color'])
                L(op('ADD',op('MULTIPLY',fac,0.35),0.55),bs.inputs['Roughness']); L(op('SUBTRACT',0.25,op('MULTIPLY',fac,0.2)),bs.inputs['Specular IOR Level'])
            if k2 in('piel','labios','pelo'):
                bs.inputs['Subsurface Weight'].default_value=0.25; bs.inputs['Subsurface Radius'].default_value=(0.004,0.0015,0.001); bs.inputs['Subsurface Scale'].default_value=1.0
            if k2 in('ojo','iris'): bs.inputs['Roughness'].default_value=0.15
            e=bs
        if EST=='linea':
            for l_ in list(e.inputs['Color'].links): nt.links.remove(l_)
            e.inputs['Color'].default_value=(*(lin('3d2b20') if k2=='iris' else (1,1,1)),1) if k2!='iris' else (*lin('3d2b20'),1)
        nt.links.new(e.outputs[0],nt.nodes['Material Output'].inputs['Surface']); o.data.materials.append(m)
        o.data.polygons.foreach_set('use_smooth',[True]*len(o.data.polygons)); o.data.update()
        md=o.modifiers.new('s','SUBSURF'); md.levels=md.render_levels=(2 if k2 in('pelo','pelo2','ojo','iris','piel','ropa') else 1)
        bpy.ops.object.select_all(action='DESELECT')
    cam=bpy.data.cameras.new('c'); cam.type='ORTHO'; cam.ortho_scale=(0.32 if nombre.startswith('cab') else 2.12)
    co=bpy.data.objects.new('c',cam); sc.collection.objects.link(co); sc.camera=co
    a=math.radians(az); r=6
    # modelo: frente hacia -Y de blender (obj +Z)
    co.location=(r*math.sin(a), -r*math.cos(a)-(0.03 if nombre.startswith('cab') else 0.0), (0.785 if nombre.startswith('cab') else 0.03))
    co.rotation_euler=(math.radians(90),0,a)
    if el==90: co.location=(0,0,6); co.rotation_euler=(0,0,math.pi)
    elif not nombre.startswith('cab'):
        xs=[(o.matrix_world @ v.co).dot(rt) for o in sc.objects if o.type=='MESH' for v in o.data.vertices]
        mid=(min(xs)+max(xs))/2; co.location=co.location+rt*mid
    sc.render.engine='CYCLES'; sc.cycles.samples=16; sc.cycles.device='CPU'; sc.render.film_transparent=True
    sc.view_settings.view_transform='Standard'; sc.render.resolution_x=(500 if nombre.startswith('cab') else (1000 if el==90 else 560)); sc.render.resolution_y=(500 if nombre.startswith('cab') else 1000)
    sc.world=bpy.data.worlds.new('w'); sc.render.use_freestyle=True
    EST=os.environ.get('ESTILO','plano')
    if EST=='real':
        sc.render.use_freestyle=(os.environ.get('CONTORNO')=='1'); sc.cycles.samples=64; sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Medium High Contrast'
        sc.world.use_nodes=True; sc.world.node_tree.nodes['Background'].inputs[0].default_value=(0.75,0.77,0.8,1); sc.world.node_tree.nodes['Background'].inputs[1].default_value=0.35
        import mathutils as mu
        def luz(tipo,dirv,en,size=None):
            L=bpy.data.lights.new(tipo,tipo); L.energy=en
            if tipo=='SUN': L.angle=math.radians(35)   # sombras suaves, sin manchas duras sobre el cuerpo
            if size: L.size=size
            ob=bpy.data.objects.new(tipo,L); sc.collection.objects.link(ob)
            d=mu.Vector(dirv).normalized(); ob.location=d*6+mu.Vector((0,0,0.8)); ob.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler()
        luz('SUN',tuple(-fw*0.7+upv*0.6-rt*0.5),4.0); L2=luz('SUN',tuple(-fw*0.6+rt*0.8),0.9)
        luz('SUN',tuple(fw*0.8+upv*0.4),1.2)
    fs=sc.view_layers[0].freestyle_settings; ls=fs.linesets[0] if fs.linesets else fs.linesets.new('l')
    ls.select_by_visibility=True; ls.select_by_edge_types=True
    for t in ('silhouette','border','crease','ridge_valley','suggestive_contour','material_boundary','contour','external_contour','edge_mark'):
        if hasattr(ls,'select_'+t): setattr(ls,'select_'+t, t in ('silhouette','external_contour','material_boundary','border'))
    ls.linestyle=ls.linestyle or bpy.data.linestyles.new('ls'); ls.linestyle.color=lin('8a6450'); ls.linestyle.thickness=2.0
    if os.environ.get('ESTILO')=='linea':
        for t in ('silhouette','border','crease','suggestive_contour','external_contour','material_boundary','contour'):
            if hasattr(ls,'select_'+t): setattr(ls,'select_'+t, True)
        ls.linestyle.color=(0.08,0.08,0.08); ls.linestyle.thickness=1.6; fs.crease_angle=math.radians(120)
    if bpy.data.collections.get('pelo'):
        # el pelo en degradé no lleva borde: solo su silueta exterior
        ls.select_by_collection=True; ls.collection=bpy.data.collections['pelo']; ls.collection_negation='EXCLUSIVE'
        l2=fs.linesets.new('pelo'); l2.select_by_visibility=True; l2.select_by_edge_types=True; l2.select_by_collection=True; l2.collection=bpy.data.collections['pelo']
        for t in ('silhouette','border','crease','ridge_valley','suggestive_contour','material_boundary','contour','external_contour','edge_mark'):
            if hasattr(l2,'select_'+t): setattr(l2,'select_'+t, t=='external_contour')
        l2.linestyle=ls.linestyle
    sc.render.filepath=f'{out}/{nombre}.png'; bpy.ops.render.render(write_still=True)
