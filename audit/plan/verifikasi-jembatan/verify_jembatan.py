# Verifikasi GLB jembatan: re-import, ukur dimensi + deck atas + hitung verts/tris.
import bpy, os, mathutils

GLB = "/home/hatch/workspace/lumina/jembatan-sungai-blender-v1.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)

objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print("VERIFY: jumlah objek mesh:", len(objs))
tot_v = tot_t = 0
for o in objs:
    me = o.data
    tot_v += len(me.vertices); tot_t += len(me.polygons)
    print(" -", o.name, "verts", len(me.vertices), "tris", len(me.polygons),
          "mats", [m.name if m else None for m in me.materials])
    bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
    xs=[v.x for v in bb]; ys=[v.y for v in bb]; zs=[v.z for v in bb]
    print("   bbox X %.2f..%.2f  Y %.2f..%.2f  Z %.2f..%.2f" %
          (min(xs),max(xs),min(ys),max(ys),min(zs),max(zs)))
    print("   origin:", tuple(round(c,3) for c in o.location))
print("TOTAL verts:", tot_v, "tris:", tot_t)
print("file bytes:", os.path.getsize(GLB), "=", round(os.path.getsize(GLB)/1024,1), "KB")

# Deck: cari vertex tertinggi dari material Aspal/AspalGelap di tengah ( |x|<10, |y|<7 )
deck_top = None
for o in objs:
    me = o.data
    for poly in me.polygons:
        mat = me.materials[poly.material_index] if poly.material_index < len(me.materials) else None
        if mat and mat.name in ("Aspal", "AspalGelap"):
            for vi in poly.vertices:
                v = o.matrix_world @ me.vertices[vi].co
                if abs(v.x) < 10 and abs(v.y) < 7:
                    deck_top = v.z if deck_top is None else max(deck_top, v.z)
print("Deck atas (tengah, |x|<10,|y|<7): Z =", deck_top)
# Titik tertinggi di tengah deck (semua material) — harus < 0
top_mid = None
for o in objs:
    me = o.data
    for vtx in me.vertices:
        v = o.matrix_world @ vtx.co
        if abs(v.x) < 10 and abs(v.y) < 7:
            top_mid = v.z if top_mid is None else max(top_mid, v.z)
print("Titik tertinggi di tengah deck (|x|<10,|y|<7): Z =", top_mid)
print("VERIFY DONE")
