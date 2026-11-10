# Perbaikan render verifikasi (ronde 2): hanya 2 sudut yang gagal.
# - samping: tambah fill light dari arah kamera (-Y) + world lebih terang,
#   supaya sisi deck & abutmen batu terbaca (ronde 1 hitam pekat).
# - atas_jalan: kamera lebih tinggi + lensa lebar supaya seluruh deck,
#   pagar, abutmen & tepi sungai masuk frame (ronde 1 cuma aspal).
import bpy, math, os

OUT = "/home/hatch/workspace/lumina/audit/plan/verifikasi-jembatan"
bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, "jembatan_render.blend"))

scene = bpy.context.scene

# World lebih terang
world = scene.world
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.6

# Fill light: AREA besar dari arah -Y (sisi kamera samping), menghadap +Y
bpy.ops.object.light_add(type='AREA', location=(0, -20, 6))
fill = bpy.context.active_object
fill.name = "FillSamping"
fill.data.energy = 2500.0
fill.data.shape = 'RECTANGLE'
fill.data.size = 30.0
fill.data.size_y = 12.0
fill.rotation_euler = (math.radians(75), 0, 0)  # menghadap +Y / sedikit ke bawah

# Fill kedua dari atas-depan supaya abutmen ujung tidak gelap
bpy.ops.object.light_add(type='AREA', location=(0, 0, 25))
fill2 = bpy.context.active_object
fill2.name = "FillAtas"
fill2.data.energy = 1500.0
fill2.data.size = 40.0

scene.cycles.samples = 64
scene.render.resolution_x = 1280
scene.render.resolution_y = 720

# --- 1) SAMPING: kamera agak mundur + tinggi, target tengah abutmen ---
bpy.data.objects["TargetKosong"].location = (0, 0, -0.5)
cam = bpy.data.objects["Cam_jembatan_samping"]
cam.location = (0, -30, 4.5)
scene.camera = cam
scene.render.filepath = os.path.join(OUT, "jembatan_samping.png")
bpy.ops.render.render(write_still=True)
print("RENDER OK: jembatan_samping (v2)")

# --- 2) ATAS JALAN: kamera tinggi + lensa lebar ---
bpy.data.objects["TargetKosong"].location = (0, 0, 0)
cam2 = bpy.data.objects["Cam_jembatan_atas_jalan"]
cam2.location = (0, 0, 42)
cam2.data.lens = 28
scene.camera = cam2
scene.render.filepath = os.path.join(OUT, "jembatan_atas_jalan.png")
bpy.ops.render.render(write_still=True)
print("RENDER OK: jembatan_atas_jalan (v2)")

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "jembatan_render.blend"))
print("FIX RENDERS DONE")
