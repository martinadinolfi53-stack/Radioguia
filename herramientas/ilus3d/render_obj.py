# Render plano (estilo dibujo 2D) de un OBJ con objetos "piel*", "hueso_*" y opcionales "ropa*".
# Lo llama escena.py. Necesita el módulo bpy de Blender (pip install bpy en la carpeta RADIOGUIA_BPY).
# uso: python3 render_obj.py spec.json   (spec: obj, salida, dir, arriba, encuadre[min,max obj], px, muestras, puntos{nombre:[x,y,z]})
import os, sys; sys.path.insert(0, os.environ.get('RADIOGUIA_BPY', '/tmp/claude-0/sp/bpyenv'))
import bpy, mathutils, json, numpy as np
S = json.load(open(sys.argv[-1]))
bl = lambda v: mathutils.Vector((v[0], -v[2], v[1]))      # obj (Y arriba) -> blender (Z arriba)
def lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
COL = {'piel': S.get('color_piel', 'f3cfb8'), 'hueso': 'f1e7cc', 'ropa': S.get('color_ropa', 'c9d6e3'), 'pelo': '6b5141'}
f = bl(S['dir']).normalized(); up = bl(S['arriba']); up = (up - f * up.dot(f)).normalized(); x = up.cross(-f)
Mc = mathutils.Matrix((x, up, -f)).transposed()
# encuadre: proyectar los puntos de encuadre sobre el plano de la cámara
E = np.array([[*bl(p)] for p in S['encuadre']])
cam_pts = np.array([[Mc.col[0].dot(mathutils.Vector(p)), Mc.col[1].dot(mathutils.Vector(p))] for p in E])
lo, hi = cam_pts.min(0), cam_pts.max(0); mid = (lo + hi) / 2; ew, eh = hi - lo
escala = max(ew, eh) * 1.04
RES = (int(S['px'] * ew / eh), S['px']) if eh > ew else (S['px'], int(S['px'] * eh / ew))
AV = {'piel': 'eab496', 'ojo': 'ffffff', 'iris': '3d2b20', 'cejas': '6e4e3a', 'labios': 'c98f7f', 'ropa': 'c9d6e3', 'ombligo': 'c79a84', 'pezon': 'c99383'}
PELO = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figura-base', 'pelo_degrade.json')))
def _realista(sc, objs, mats):
    """materiales del avatar (render con luz, como figura-base/rend.py ESTILO=real): piel con pelo rapado en degradé pintado
    desde las coordenadas de reposo guardadas en la uv"""
    import math
    for o in objs:
        if not o.name.startswith('av_'): continue
        k = o.name[3:].split('.')[0].split('_')[0]
        m = bpy.data.materials.new(o.name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links.new
        bs = N.new('ShaderNodeBsdfPrincipled'); c = lin(AV.get(k, 'ff00ff'))
        bs.inputs['Base Color'].default_value = (*([min(1, v * 1.08) for v in c] if k == 'piel' else c), 1)
        bs.inputs['Roughness'].default_value = 0.55 if k in ('piel', 'labios', 'ombligo', 'pezon') else (0.15 if k in ('ojo', 'iris') else 0.8)
        if k in ('piel', 'labios'):
            bs.inputs['Subsurface Weight'].default_value = 0.25; bs.inputs['Subsurface Radius'].default_value = (0.004, 0.0015, 0.001)
        if k == 'piel':
            bs.inputs['Specular IOR Level'].default_value = 0.25
            def op(o_, a_, b_=None):
                q = N.new('ShaderNodeMath'); q.operation = o_
                for j, v_ in enumerate((a_, b_)):
                    if v_ is None: continue
                    if isinstance(v_, (int, float)): q.inputs[j].default_value = v_
                    else: L(v_, q.inputs[j])
                return q.outputs[0]
            tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L(tc.outputs['UV'], sp.inputs[0])
            U, Vv = sp.outputs[0], sp.outputs[1]; th = op('MINIMUM', U, 1.0); yr = op('SUBTRACT', Vv, 0.5)
            def curva(TB, YB):
                fc = N.new('ShaderNodeFloatCurve'); cu = fc.mapping.curves[0]; lo, hi = min(YB), max(YB); sc_ = hi - lo or 1
                while len(cu.points) < len(TB): cu.points.new(0.5, 0.5)
                for p_, (t_, y_) in zip(cu.points, zip(TB, YB)): p_.location = (t_ / 180, (y_ - lo) / sc_); p_.handle_type = 'VECTOR'
                fc.mapping.update(); L(th, fc.inputs['Value']); return op('ADD', op('MULTIPLY', fc.outputs[0], sc_), lo)
            HL = curva(PELO['TH'], PELO['HH']); LB = curva(PELO['TB'], PELO['YB'])
            borde = op('MINIMUM', op('MAXIMUM', op('DIVIDE', op('SUBTRACT', yr, HL), 0.004), 0), 1)
            ft = op('POWER', op('MINIMUM', op('MAXIMUM', op('DIVIDE', op('SUBTRACT', yr, op('SUBTRACT', LB, 0.035)), 0.035), 0), 1), 1.3)
            fac = op('MULTIPLY', op('MULTIPLY', borde, ft), op('SUBTRACT', 1, op('GREATER_THAN', U, 1.5)))
            mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'
            mx.inputs['A'].default_value = bs.inputs['Base Color'].default_value[:]; mx.inputs['B'].default_value = (*lin('5e4434'), 1)
            L(fac, mx.inputs['Factor']); L(mx.outputs['Result'], bs.inputs['Base Color'])
            L(op('ADD', op('MULTIPLY', fac, 0.35), 0.55), bs.inputs['Roughness']); L(op('SUBTRACT', 0.25, op('MULTIPLY', fac, 0.2)), bs.inputs['Specular IOR Level'])
        L(bs.outputs[0], N['Material Output'].inputs['Surface'])
        o.data.materials.clear(); o.data.materials.append(m)
        o.data.polygons.foreach_set('use_smooth', [True] * len(o.data.polygons)); o.data.update()
        md = o.modifiers.new('s', 'SUBSURF'); md.levels = md.render_levels = 2 if k in ('piel', 'ropa', 'ojo', 'iris') else 1
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
    # pasadas extra: 'lineas' (solo los contornos de la piel, incluidos los internos: un dedo sobre otro) y 'zpiel'/'zhueso'
    # (profundidad desde la cámara codificada en el color, para saber qué hueso queda tapado por otra parte de la piel)
    if modo == 'lineas':
        bpy.context.scene.cycles.transparent_max_bounces = 128
        m = bpy.data.materials.new('nada'); m.use_nodes = True; nt = m.node_tree
        t = nt.nodes.new('ShaderNodeBsdfTransparent'); nt.links.new(t.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
        for k in mats: mats[k] = m
    def zmat(gid):     # R = profundidad (3-7 m desde la cámara), G = número de la parte del cuerpo / 63
        m = bpy.data.materials.new(f'z{gid}'); m.use_nodes = True; nt = m.node_tree
        cd = nt.nodes.new('ShaderNodeCameraData'); mr = nt.nodes.new('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value = 3.0; mr.inputs['From Max'].default_value = 7.0
        cc = nt.nodes.new('ShaderNodeCombineColor'); cc.inputs[1].default_value = gid / 63
        e = nt.nodes.new('ShaderNodeEmission'); nt.links.new(cd.outputs['View Z Depth'], mr.inputs['Value'])
        nt.links.new(mr.outputs['Result'], cc.inputs[0]); nt.links.new(cc.outputs[0], e.inputs['Color'])
        nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface']); return m
    if S.get('realista') and modo == 'piel': _realista(sc, objs, mats)
    for o in objs:
        if o.name.startswith('av_'):
            o.hide_render = modo != 'piel'
            if modo == 'piel': continue
        tipo = 'hueso' if o.name.startswith('hueso') else 'ropa' if o.name.startswith('ropa') else 'pelo' if o.name.startswith('pelo') else 'zp' if o.name.startswith('zp_') else 'piel'
        gid = int(o.name.split('__')[1].split('.')[0]) if '__' in o.name else 0
        o.data.materials.clear(); o.data.materials.append(zmat(gid) if modo in ('zpiel', 'zhueso') else mats[tipo if tipo != 'zp' else 'piel'])
        if modo == 'zpiel': o.hide_render = tipo != 'zp'
        elif modo == 'zhueso': o.hide_render = tipo != 'hueso'
        else: o.hide_render = tipo == 'zp' or ((tipo == 'hueso') != (modo == 'hueso'))
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
    if modo in ('zpiel', 'zhueso'):
        sc.cycles.samples = 1; sc.cycles.pixel_filter_type = 'BOX'; sc.view_settings.view_transform = 'Raw'
        sc.render.image_settings.color_depth = '16'; sc.render.dither_intensity = 0
    if S.get('realista') and modo == 'piel':
        sc.cycles.samples = max(S.get('muestras', 16), 48); sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
        sc.world.use_nodes = True; bg = sc.world.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.75, 0.77, 0.8, 1); bg.inputs[1].default_value = 0.35
        def luz(d, en):
            L = bpy.data.lights.new('sol', 'SUN'); L.energy = en; L.angle = np.radians(35)
            ob = bpy.data.objects.new('sol', L); sc.collection.objects.link(ob); d = d.normalized()
            ob.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
        luz(-f * 0.7 + up * 0.6 - x * 0.5, 4.0); luz(-f * 0.6 + x * 0.8, 0.9); luz(f * 0.8 + up * 0.4, 1.2)
    sc.render.use_freestyle = modo in ('piel', 'hueso', 'lineas'); fs = sc.view_layers[0].freestyle_settings
    ls = fs.linesets[0] if fs.linesets else fs.linesets.new('l')
    ls.select_by_visibility = True; ls.select_by_edge_types = True
    for t in ('silhouette', 'border', 'crease', 'ridge_valley', 'suggestive_contour', 'material_boundary', 'contour', 'external_contour', 'edge_mark'):
        if hasattr(ls, 'select_' + t): setattr(ls, 'select_' + t, t in ('silhouette', 'external_contour', 'material_boundary'))
    ls.linestyle = ls.linestyle or bpy.data.linestyles.new('ls'); ls.linestyle.color = lin('8a6450'); ls.linestyle.thickness = S.get('grosor', 2.4)
    sc.render.filepath = S['salida'] + f'-{modo}.png'; bpy.ops.render.render(write_still=True)
    if modo in ('zpiel', 'zhueso'):     # PIL no lee PNG de 16 bits con color: se guarda como matriz (R, G) en coma flotante
        im = bpy.data.images.load(sc.render.filepath); im.colorspace_settings.name = 'Non-Color'; w_, h_ = im.size
        np.save(S['salida'] + f'-{modo}.npy', np.array(im.pixels[:], np.float32).reshape(h_, w_, 4)[::-1, :, :2])
    return sc, co
def ventana():
    """estilo por capas: un solo render con luz. Avatar realista con una ventana transparente alrededor de la línea del rayo que
    pasa por el centro; adentro, músculos tenues y huesos en 3D (estructuras destacadas en color). Fondo transparente."""
    import math
    V = S['ventana']; R = V['radio']; Cw = bl(V['centro'])
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.obj_import(filepath=S['obj'], forward_axis='NEGATIVE_Z', up_axis='Y')
    sc = bpy.context.scene; objs = [o for o in sc.objects if o.type == 'MESH']
    for o in objs:
        if o.name.startswith('av_ropa'): o.hide_render = True
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = escala
    co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    M = Mc.to_4x4(); M.translation = Mc.col[0] * mid[0] + Mc.col[1] * mid[1] - f * 5.0; co.matrix_world = M; cam.clip_end = 20
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = V.get('muestras', 24); sc.cycles.use_denoising = True
    sc.cycles.transparent_max_bounces = 64; sc.cycles.max_bounces = 64
    sc.render.film_transparent = True; sc.render.resolution_x, sc.render.resolution_y = RES
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.92, 0.93, 0.95, 1); bg.inputs[1].default_value = 0.4
    def luz(d, en):
        L = bpy.data.lights.new('sol', 'SUN'); L.energy = en; L.angle = math.radians(35)
        ob = bpy.data.objects.new('sol', L); sc.collection.objects.link(ob); ob.rotation_euler = (-d.normalized()).to_track_quat('-Z', 'Y').to_euler()
    luz(-f * 0.7 + up * 0.6 - x * 0.5, 3.2); luz(-f * 0.6 + x * 0.8, 1.4); luz(f * 0.8 + up * 0.4, 1.0)
    _realista(sc, objs, {})
    def mat(nombre, build):
        m = bpy.data.materials.new(nombre); m.use_nodes = True; nt = m.node_tree; N = nt.nodes
        N.remove(N['Principled BSDF']); s_ = build(N, nt.links.new); nt.links.new(s_, N['Material Output'].inputs['Surface']); return m
    def dist_linea(N, L):     # distancia de cada punto a la línea del rayo que pasa por el centro de la ventana
        g = N.new('ShaderNodeNewGeometry'); a = N.new('ShaderNodeVectorMath'); a.operation = 'SUBTRACT'; a.inputs[1].default_value = Cw
        b = N.new('ShaderNodeVectorMath'); b.operation = 'CROSS_PRODUCT'; b.inputs[1].default_value = f
        l = N.new('ShaderNodeVectorMath'); l.operation = 'LENGTH'
        L(g.outputs['Position'], a.inputs[0]); L(a.outputs[0], b.inputs[0]); L(b.outputs[0], l.inputs[0]); return l.outputs['Value']
    def rango(N, L, v, a0, a1, b0, b1):
        mr = N.new('ShaderNodeMapRange'); mr.inputs[1].default_value = a0; mr.inputs[2].default_value = a1; mr.inputs[3].default_value = b0; mr.inputs[4].default_value = b1
        L(v, mr.inputs[0]); return mr.outputs[0]
    def mezcla(N, L, fac, sh):
        t = N.new('ShaderNodeBsdfTransparent'); mx = N.new('ShaderNodeMixShader'); L(fac, mx.inputs[0]); L(t.outputs[0], mx.inputs[1]); L(sh, mx.inputs[2]); return mx.outputs[0]
    mm = None
    for o in objs:
        n = o.name
        if n.startswith('av_piel'):
            m = o.data.materials[0]; nt = m.node_tree; N = nt.nodes; L = nt.links.new; bs = [k for k in N if k.type == 'BSDF_PRINCIPLED'][-1]
            L(mezcla(N, L, rango(N, L, dist_linea(N, L), R, R + V.get('borde', 0.03), V.get('piel_dentro', 0.10), V.get('piel', 1.0)), bs.outputs[0]), N['Material Output'].inputs['Surface'])
        elif n.startswith('av_'): continue
        elif n.startswith('musculo'):
            if mm is None:
                def b(N, L):
                    p = N.new('ShaderNodeBsdfPrincipled'); p.inputs['Base Color'].default_value = (*lin('b8574e'), 1); p.inputs['Roughness'].default_value = 0.5
                    return mezcla(N, L, rango(N, L, dist_linea(N, L), R, R + V.get('borde', 0.03), V.get('musculo', 0.18), 0), p.outputs[0])
                mm = mat('mus', b)
            o.data.materials.clear(); o.data.materials.append(mm)
        else:
            col = n.split('_')[1] if n.startswith('destacado_') else 'efe5cc'
            def b(N, L, col=col):
                p = N.new('ShaderNodeBsdfPrincipled'); p.inputs['Base Color'].default_value = (*lin(col), 1); p.inputs['Roughness'].default_value = 0.6; return p.outputs[0]
            o.data.materials.clear(); o.data.materials.append(mat(n, b))
        o.data.polygons.foreach_set('use_smooth', [True] * len(o.data.polygons)); o.data.update()
    sc.render.use_freestyle = True; fs = sc.view_layers[0].freestyle_settings; ls = fs.linesets[0] if fs.linesets else fs.linesets.new('l')
    cl = bpy.data.collections.new('av'); sc.collection.children.link(cl)
    for o in objs:
        if o.name.startswith('av_') and not o.hide_render: cl.objects.link(o)
    ls.select_by_collection = True; ls.collection = cl; ls.select_by_visibility = True
    ls.select_silhouette = True; ls.select_border = False; ls.select_crease = False; ls.select_external_contour = True
    ls.linestyle = ls.linestyle or bpy.data.linestyles.new('ls'); ls.linestyle.thickness = 1.4; ls.linestyle.color = (0.18, 0.13, 0.11)
    sc.render.filepath = S['salida'] + '-ventana.png'; bpy.ops.render.render(write_still=True)
    return sc, co
if S.get('ventana'): sc, co = ventana()
else:
    for modo in ('piel', 'hueso') + (('lineas', 'zpiel', 'zhueso') if S.get('capas') else ()): sc, co = render(modo)
from bpy_extras.object_utils import world_to_camera_view
info = {'res': RES, 'pxm': max(RES) / escala, 'puntos': {}}
for k, v in S.get('puntos', {}).items():
    p = world_to_camera_view(sc, co, bl(v)); info['puntos'][k] = [p.x * RES[0], (1 - p.y) * RES[1]]
json.dump(info, open(S['salida'] + '.json', 'w'))
