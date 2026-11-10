# Render malam verifikasi marka emissive — Cycles, dunia gelap + bulan redup.
# Buka jembatan_emissive.blend (tanpa konteks tambahan), kamera 3/4 dari atas
# depan deck supaya garis tengah kuning + garis tepi putih kelihatan.
import bpy, math, os

OUT = "/home/hatch/workspace/lumina/audit/plan/verifikasi-jembatan"
BLEND = os.path.join(OUT, "jembatan_emissive.blend")

bpy.ops.wm.open_mainfile(filepath=BLEND)

# --- langit malam: gelap biru, strength rendah ---
world = bpy.data.worlds.new("LangitMalam")
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.012, 0.016, 0.035, 1.0)
bg.inputs["Strength"].default_value = 0.35
bpy.context.scene.world = world

# Bulan redup (sun lemah, datang dari samping-atas)
bpy.ops.object.light_add(type='SUN', location=(20, -15, 30))
sun = bpy.context.active_object
sun.data.energy = 0.35
sun.rotation_euler = (math.radians(50), 0, math.radians(30))

# --- render settings: Cycles CPU ---
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.device = 'CPU'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# --- kamera 3/4 dari atas-depan deck ---
bpy.ops.object.empty_add(location=(0, 0, 0))
bpy.context.active_object.name = "TargetKosong"
bpy.ops.object.camera_add(location=(7.0, -11.0, 9.0))
c = bpy.context.active_object
c.name = "Cam_MalamMarka"
con = c.constraints.new('TRACK_TO')
con.target = bpy.data.objects["TargetKosong"]
con.track_axis = 'TRACK_NEGATIVE_Z'
con.up_axis = 'UP_Y'
scene.camera = c
scene.render.filepath = os.path.join(OUT, "jembatan_malam_marka.png")
bpy.ops.render.render(write_still=True)
print("RENDER MALAM OK")
