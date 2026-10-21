# Render plano (estilo dibujo 2D) de un OBJ con objetos "piel*", "hueso_*" y opcionales "ropa*".
# Lo llama escena.py. Necesita el módulo bpy de Blender (pip install bpy en la carpeta RADIOGUIA_BPY).
# uso: python3 render_obj.py spec.json   (spec: obj, salida, dir, arriba, encuadre[min,max obj], px, muestras, puntos{nombre:[x,y,z]})
import os, sys; sys.path.insert(0, os.environ.get('RADIOGUIA_BPY', '/tmp/claude-0/sp/bpyenv'))
import bpy, mathutils, json, numpy as np
S = json.load(open(sys.argv[-1]))
bl = lambda v: mathutils.Vector((v[0], -v[2], v[1]))      # obj (Y arriba) -> blender (Z arriba)
def lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
COL = {'piel': S.get('color_piel', 'f3cfb8'), 'hueso': 'f1e7cc', 'ropa': S.get('color_ropa', 'c9d6e3')}
f = bl(S['dir']).normalized(); up = bl(S['arriba']); up = (up - f * up.dot(f)).normalized(); x = up.cross(-f)
Mc = mathutils.Matrix((x, up, -f)).transposed()
# encuadre: proyectar los puntos de encuadre sobre el plano de la cámara
E = np.array([[*bl(p)] for p in S['encuadre']])
cam_pts = np.array([[Mc.col[0].dot(mathutils.Vector(p)), Mc.col[1].dot(mathutils.Vector(p))] for p in E])
lo, hi = cam_pts.min(0), cam_pts.max(0); mid = (lo + hi) / 2; ew, eh = hi - lo
escala = max(ew, eh) * 1.04
RES = (int(S['px'] * ew / eh), S['px']) if eh > ew else (S['px'], int(S['px'] * eh / ew))
def render(modo):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.obj_import(filepath=S['obj'], forward_axis='NEGATIVE_Z', up_axis='Y')
    sc = bpy.context.scene
    objs = [o for o in sc.objects if o.type == 'MESH']
    mats = {}
    for k, h in COL.items():
        m = bpy.data.materials.new(k); m.use_nodes = True; nt = m.node_tree
        e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*lin(h), 1)
        nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface']); mats[k] = m
    for o in objs:
        tipo = 'hueso' if o.name.startswith('hueso') else 'ropa' if o.name.startswith('ropa') else 'piel'
        o.data.materials.clear(); o.data.materials.append(mats[tipo])
        o.hide_render = (tipo == 'hueso') != (modo == 'hueso')
        if tipo == 'piel' and S.get('suavizar', 1):     # malla de piel de pocos polígonos: subdividir para que no queden facetas ni pliegues falsos
            md = o.modifiers.new('sub', 'SUBSURF'); md.levels = md.render_levels = S.get('suavizar', 1)
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = escala
    co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    M = Mc.to_4x4(); M.translation = Mc.col[0] * mid[0] + Mc.col[1] * mid[1] - f * 5.0
    # centrar en profundidad: la posición a lo largo de f no importa en ortográfica (clip_end grande)
    co.matrix_world = M; cam.clip_end = 20
    sc.world = bpy.data.worlds.new('w')
    sc.render.engine = 'CYCLES'; sc.cycles.samples = S.get('muestras', 16); sc.cycles.device = 'CPU'
    sc.render.film_transparent = True; sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x, sc.render.resolution_y = RES
    sc.render.use_freestyle = True; fs = sc.view_layers[0].freestyle_settings
    ls = fs.linesets[0] if fs.linesets else fs.linesets.new('l')
    ls.select_by_visibility = True; ls.select_by_edge_types = True
    for t in ('silhouette', 'border', 'crease', 'ridge_valley', 'suggestive_contour', 'material_boundary', 'contour', 'external_contour', 'edge_mark'):
        if hasattr(ls, 'select_' + t): setattr(ls, 'select_' + t, t in ('silhouette', 'external_contour', 'material_boundary'))
    ls.linestyle = ls.linestyle or bpy.data.linestyles.new('ls'); ls.linestyle.color = lin('8a6450'); ls.linestyle.thickness = S.get('grosor', 2.4)
    sc.render.filepath = S['salida'] + f'-{modo}.png'; bpy.ops.render.render(write_still=True)
    return sc, co
for modo in ('piel', 'hueso'): sc, co = render(modo)
from bpy_extras.object_utils import world_to_camera_view
info = {'res': RES, 'pxm': max(RES) / escala, 'puntos': {}}
for k, v in S.get('puntos', {}).items():
    p = world_to_camera_view(sc, co, bl(v)); info['puntos'][k] = [p.x * RES[0], (1 - p.y) * RES[1]]
json.dump(info, open(S['salida'] + '.json', 'w'))
