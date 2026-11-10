import bpy, math, os
from mathutils import Vector
OUT = '/home/hatch/workspace/lumina/audit/plan/verifikasi-g04'
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
# jembatan batu di (45,0,-2) — three (x,y,z) -> Blender (x,-z,y)
bpy.ops.import_scene.gltf(filepath='/home/hatch/workspace/lumina/jembatan-batu-blender-v1.glb')
grp = bpy.context.scene.objects.get('Body')
# bungkus semua dalam empty
bpy.ops.object.empty_add(location=(0, 0, 0))
e = bpy.context.active_object; e.name = 'Jembatan'
e.location = (45, 2, 0)   # Blender y = -z_three -> -(-2)=+2
for o in list(bpy.context.scene.objects):
    if o.type == 'MESH' and o.parent is None and o is not e:
        o.parent = e
bpy.context.view_layer.update()
# jalan datar y=0.02 (abu-abu) selebar 16 m + air sungai y=-0.3 (biru) x 41..50
def strip(nama, x0, x1, z0, z1, y, warna):
    bpy.ops.mesh.primitive_cube_add(size=1, location=((x0+x1)/2, -(z0+z1)/2, y))
    m = bpy.context.active_object; m.name = nama
    m.scale = ((x1-x0), (z1-z0), 0.05)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mat = bpy.data.materials.new(nama); mat.use_nodes = True
    mat.node_tree.nodes['Principled BSDF'].inputs[0].default_value = warna
    m.data.materials.append(mat)
strip('Jalan_EW', 20, 70, -8, 8, 0.0, (0.45, 0.42, 0.35, 1))
strip('Air_Sungai', 20, 70, -8, 8, -0.32, (0.1, 0.35, 0.6, 1))  # hanya di bawah jembatan divisualkan sbg air
# air hanya di alur sungai: potong dengan menutup jalan di atasnya? tidak — jalan digambar di atas air (causeway), sesuai live
world = bpy.data.worlds.new('W'); bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.85, 0.9, 1.0, 1)
sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
sun.data.energy = 3.0; sun.rotation_euler = (math.radians(50), 0, math.radians(30))
bpy.context.scene.collection.objects.link(sun)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'; scene.cycles.samples = 24; scene.cycles.use_denoising = False
scene.render.resolution_x = 640; scene.render.resolution_y = 360
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
# dari jalan setinggi mata, 25 m barat jembatan, menghadap timur (jalur pejalan)
render_dari('r1-jalan-mata', (20, 2, 1.7), (60, 2, 1.5))
# dari samping (utara), lihat profil jembatan vs jalan datar
render_dari('r1-samping', (45, 30, 6), (45, 2, 1.0))
print('SELESAI R1')
