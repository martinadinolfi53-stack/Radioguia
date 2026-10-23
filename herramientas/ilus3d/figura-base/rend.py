import sys; sys.path.insert(0,'/tmp/claude-0/sp/bpyenv')
import bpy, mathutils, math
out=sys.argv[-1]
COL={'piel':'f3cfb8','pelo':'5b4130','ojo':'ffffff','iris':'3d2b20','cejas':'5b4130','labios':'d99a8a','ropa':'c9d6e3'}
def lin(h):
    c=[int(h[i:i+2],16)/255 for i in (0,2,4)]; return tuple(x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c)
VIEWS={'cabeza':(20,0),'frente':(0,0),'tres_cuartos':(35,0),'costado':(90,0),'espalda':(180,0)}
for nombre,(az,el) in VIEWS.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.obj_import(filepath='/tmp/claude-0/mh/mh.obj', forward_axis='NEGATIVE_Z', up_axis='Y')
    sc=bpy.context.scene
    for o in [o for o in sc.objects if o.type=='MESH']:
        k=o.name.split('.')[0]; k2=k.split('_')[0]
        m=bpy.data.materials.new(k); m.use_nodes=True; nt=m.node_tree
        e=nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value=(*lin(COL.get(k2,COL.get(k,'ff00ff'))),1)
        nt.links.new(e.outputs[0],nt.nodes['Material Output'].inputs['Surface']); o.data.materials.append(m)
        md=o.modifiers.new('s','SUBSURF'); md.levels=md.render_levels=(2 if k2 in('pelo','ojo','iris') else 1)
        bpy.ops.object.select_all(action='DESELECT')
    cam=bpy.data.cameras.new('c'); cam.type='ORTHO'; cam.ortho_scale=(0.32 if nombre=='cabeza' else 1.85)
    co=bpy.data.objects.new('c',cam); sc.collection.objects.link(co); sc.camera=co
    a=math.radians(az); r=6
    # modelo: frente hacia -Y de blender (obj +Z)
    co.location=(r*math.sin(a), -r*math.cos(a), (0.73 if nombre=='cabeza' else 0.0))
    co.rotation_euler=(math.radians(90),0,a)
    sc.render.engine='CYCLES'; sc.cycles.samples=16; sc.cycles.device='CPU'; sc.render.film_transparent=True
    sc.view_settings.view_transform='Standard'; sc.render.resolution_x=(600 if nombre=='cabeza' else 520); sc.render.resolution_y=(600 if nombre=='cabeza' else 1000)
    sc.world=bpy.data.worlds.new('w'); sc.render.use_freestyle=True
    fs=sc.view_layers[0].freestyle_settings; ls=fs.linesets[0] if fs.linesets else fs.linesets.new('l')
    ls.select_by_visibility=True; ls.select_by_edge_types=True
    for t in ('silhouette','border','crease','ridge_valley','suggestive_contour','material_boundary','contour','external_contour','edge_mark'):
        if hasattr(ls,'select_'+t): setattr(ls,'select_'+t, t in ('silhouette','external_contour','material_boundary','border'))
    ls.linestyle=ls.linestyle or bpy.data.linestyles.new('ls'); ls.linestyle.color=lin('8a6450'); ls.linestyle.thickness=2.0
    sc.render.filepath=f'{out}/{nombre}.png'; bpy.ops.render.render(write_still=True)
