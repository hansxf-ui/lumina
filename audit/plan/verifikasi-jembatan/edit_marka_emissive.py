# Tugas 1 Lumina: tambah emissive ke MarkaKuning + MarkaPutih saja.
# Buka jembatan.blend, set Emission Color/Strength di Principled BSDF,
# simpan blend baru (jembatan_emissive.blend), re-export GLB ke nama file sama.
import bpy, os, mathutils

OUT = "/home/hatch/workspace/lumina/audit/plan/verifikasi-jembatan"
BLEND = os.path.join(OUT, "jembatan.blend")
BLEND_NEW = os.path.join(OUT, "jembatan_emissive.blend")
GLB = "/home/hatch/workspace/lumina/jembatan-sungai-blender-v1.glb"

bpy.ops.wm.open_mainfile(filepath=BLEND)

def set_emit(mat_name, color, strength):
    m = bpy.data.materials[mat_name]
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Emission Color"].default_value = (*color, 1.0)
    bsdf.inputs["Emission Strength"].default_value = strength
    print("SET EMIT:", mat_name, color, strength)

set_emit("MarkaKuning", (0.85, 0.65, 0.10), 0.6)
set_emit("MarkaPutih", (0.92, 0.92, 0.88), 0.3)

# Pastikan material lain TIDAK punya emission (cek, bukan ubah)
for m in bpy.data.materials:
    if m.name in ("MarkaKuning", "MarkaPutih"):
        continue
    bsdf = m.node_tree.nodes.get("Principled BSDF") if m.use_nodes else None
    if bsdf is not None:
        s = bsdf.inputs["Emission Strength"].default_value
        c = tuple(round(v, 3) for v in bsdf.inputs["Emission Color"].default_value[:3])
        print("LAIN:", m.name, "emit_strength=", s, "emit_color=", c)

# Cek geometri sebelum export (harus identik dengan build: 4344 verts / 2580 tris)
o = bpy.data.objects["JembatanSungai"]
me = o.data
print("PRE-EXPORT verts:", len(me.vertices), "tris:", len(me.polygons))
bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
xs=[v.x for v in bb]; ys=[v.y for v in bb]; zs=[v.z for v in bb]
print("PRE-EXPORT bbox X %.2f..%.2f (%.2f) Y %.2f..%.2f (%.2f) Z %.2f..%.2f" %
      (min(xs),max(xs),max(xs)-min(xs),min(ys),max(ys),max(ys)-min(ys),min(zs),max(zs)))
print("PRE-EXPORT origin:", tuple(round(c,3) for c in o.location))

bpy.ops.wm.save_as_mainfile(filepath=BLEND_NEW)
print("SAVED BLEND:", BLEND_NEW)

bpy.ops.export_scene.gltf(filepath=GLB, export_format='GLB',
                          export_apply=True, export_yup=True)
print("EXPORTED GLB bytes:", os.path.getsize(GLB))
print("EDIT DONE")
