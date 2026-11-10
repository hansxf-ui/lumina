# Close-up abutmen timur (ronde 3): membuktikan undakan batu menyambung deck ke tepi.
import bpy, os

OUT = "/home/hatch/workspace/lumina/audit/plan/verifikasi-jembatan"
bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, "jembatan_render.blend"))
scene = bpy.context.scene
bpy.data.objects["TargetKosong"].location = (13.0, 0, -1.0)
cam = bpy.data.objects["Cam_jembatan_samping"]
cam.location = (26.0, -15.0, 2.5)
cam.data.lens = 50
scene.camera = cam
scene.render.filepath = os.path.join(OUT, "jembatan_abutmen.png")
bpy.ops.render.render(write_still=True)
print("RENDER OK: jembatan_abutmen")
