import bpy, math, os
from mathutils import Vector

OUT = '/home/hatch/workspace/lumina/audit/plan/verifikasi-g04'
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)

# --- import G04, terapkan transform rencana: (-15, 14.9, 37.4), ry 5.9026
bpy.ops.import_scene.gltf(filepath='/home/hatch/workspace/lumina/gedung-g04-blender-v2.glb')
objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print('MESH COUNT:', len(objs))
# bungkus dalam empty supaya rotasi+posisi seperti three (rotasi Y grup, posisi grup)
bpy.ops.object.empty_add(location=(0, 0, 0))
grp = bpy.context.active_object
grp.name = 'G04_group'
# Sumbu: three (x, y_up, z) -> Blender (x, -z, y_up); konjugasi rotasi proper
# mempertahankan sudut: three Ry(5.9026) == Blender Rz(+5.9026).
grp.location = (-15, -37.4, 14.9)
grp.rotation_euler = (0, 0, 5.9026)
for o in objs:
    o.parent = grp
    # ubah koordinat lokal mesh three->Blender: putar -90 deg X pada objek? 
    # Importer glTF Blender SUDAH memetakan (Y-up three -> Z-up Blender) dengan benar.
    pass
bpy.context.view_layer.update()
# --- minY dunia (dari semua vertex mesh, setelah transform grup)
import mathutils
mn = [1e9]*3; mx = [-1e9]*3
for o in objs:
    for v in o.data.vertices:
        w = o.matrix_world @ v.co
        for i in range(3):
            mn[i] = min(mn[i], w[i]); mx[i] = max(mx[i], w[i])
print('WORLD BBOX Blender (x,y,z): min', [round(v,3) for v in mn], 'max', [round(v,3) for v in mx])
print('MIN-Z (tinggi dunia, harus 0.0):', round(mn[2], 4))
cx, cy, cz = (mn[0]+mx[0])/2, (mn[1]+mx[1])/2, (mn[2]+mx[2])/2
print('CENTER:', round(cx,2), round(cy,2), round(cz,2), 'SIZE:', [round(mx[i]-mn[i],2) for i in range(3)])

# --- cahaya + dunia
world = bpy.data.worlds.new('W'); bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.85, 0.9, 1.0, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 1.0
sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
sun.data.energy = 3.0; sun.rotation_euler = (math.radians(50), 0, math.radians(30))
bpy.context.scene.collection.objects.link(sun)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.use_denoising = False
scene.render.resolution_x = 480; scene.render.resolution_y = 360

def render_dari(nama, lokasi, target):
    cam_data = bpy.data.cameras.new(nama); cam_data.lens = 35
    cam = bpy.data.objects.new(nama, cam_data)
    scene.collection.objects.link(cam)
    cam.location = lokasi
    d = Vector(target) - Vector(lokasi)
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam
    scene.render.filepath = os.path.join(OUT, nama + '.png')
    bpy.ops.render.render(write_still=True)
    print('RENDER:', scene.render.filepath)

tgt = (cx, cy, 8.0)
render_dari('g04-utara', (cx, cy - 38, 12), tgt)   # dari utara (plaza)
render_dari('g04-timur', (cx + 38, cy, 12), tgt)
render_dari('g04-selatan', (cx, cy + 38, 12), tgt)
render_dari('g04-barat', (cx - 38, cy, 12), tgt)
render_dari('g04-plaza-mata', (0, 0, 1.7), (cx, cy, 6))  # dari plaza setinggi mata
print('SELESAI G04')
