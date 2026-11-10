# Render verifikasi jembatan — Cycles, 4 sudut. Buka jembatan.blend, tambah konteks
# (tepi sungai + air) HANYA untuk render; file blend render disimpan terpisah.
import bpy, math, os

OUT = "/home/hatch/workspace/lumina/audit/plan/verifikasi-jembatan"
BLEND = os.path.join(OUT, "jembatan.blend")

bpy.ops.wm.open_mainfile(filepath=BLEND)

# --- konteks: tepi sungai (tanah) + air, di bawah/sekitar jembatan ---
def mat_simple(name, color, rough=0.9):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1.0)
    b.inputs["Roughness"].default_value = rough
    return m

MAT_TANAH = mat_simple("Tanah", (0.42, 0.48, 0.30), 1.0)
MAT_AIR   = mat_simple("Air", (0.15, 0.35, 0.55), 0.25)

def box(name, loc, dims, mat):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    return o

# Tanah tepi sungai: dua bank di luar ujung abutmen (X > 15.5 dan X < -15.5),
# permukaan di Z=-0.05 (sejajar jalan), memanjang Y -30..30
box("BankTimur", (23.0, 0, -1.05), (15.0, 60.0, 2.0), MAT_TANAH)
box("BankBarat", (-23.0, 0, -1.05), (15.0, 60.0, 2.0), MAT_TANAH)
# Air sungai: strip X -15.5..15.5, Y -30..30, permukaan Z=-1.2
box("AirSungai", (0, 0, -1.25), (31.0, 60.0, 0.1), MAT_AIR)

# --- langit + matahari ---
world = bpy.data.worlds.new("Langit")
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.55, 0.75, 0.95, 1.0)
bg.inputs["Strength"].default_value = 1.0
bpy.context.scene.world = world

bpy.ops.object.light_add(type='SUN', location=(20, -15, 30))
sun = bpy.context.active_object
sun.data.energy = 4.0
sun.rotation_euler = (math.radians(50), 0, math.radians(30))

# --- render settings: Cycles CPU ---
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.device = 'CPU'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# --- kamera ---
def cam(name, loc, target):
    bpy.ops.object.camera_add(location=loc)
    c = bpy.context.active_object
    c.name = name
    d = (target[0]-loc[0], target[1]-loc[1], target[2]-loc[2])
    c.rotation_euler = (math.atan2(math.hypot(d[0], d[1]), -d[2]) + math.pi/2 * 0, 0, 0)
    # arahkan dengan benar: pakai track-to via constraint
    c.rotation_euler = (0, 0, 0)
    con = c.constraints.new('TRACK_TO')
    con.target = bpy.data.objects["TargetKosong"]
    con.track_axis = 'TRACK_NEGATIVE_Z'
    con.up_axis = 'UP_Y'
    return c

bpy.ops.object.empty_add(location=(0, 0, 0))
bpy.context.active_object.name = "TargetKosong"

views = [
    ("jembatan_depan",       (-17.0, 0.0, 1.6),  (6.0, 0.0, 0.4)),   # dari jalan, setinggi mata
    ("jembatan_samping",     (0.0, -24.0, 3.0),  (0.0, 0.0, -0.2)),  # dari tepi sungai, profil
    ("jembatan_atas_jalan",  (3.0, 0.0, 15.0),   (0.0, 0.0, -0.1)),  # dari atas deck ke bawah
    ("jembatan_34",          (-17.0, -17.0, 11.0),(0.0, 0.0, 0.0)),   # 3/4 udara
]
for name, loc, tgt in views:
    bpy.data.objects["TargetKosong"].location = tgt
    c = cam("Cam_" + name, loc, tgt)
    scene.camera = c
    scene.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("RENDER OK:", name)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "jembatan_render.blend"))
print("ALL RENDERS DONE")
