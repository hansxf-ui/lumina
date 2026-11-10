import bpy, os, mathutils
GLB = "/home/hatch/workspace/lumina/jembatan-sungai-blender-v1.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
o = objs[0]
me = o.data
print("objek:", o.name, "verts", len(me.vertices), "tris", len(me.polygons))
bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
xs=[v.x for v in bb]; ys=[v.y for v in bb]; zs=[v.z for v in bb]
print("bbox X %.2f..%.2f (%.2f m)  Y %.2f..%.2f (%.2f m)  Z %.2f..%.2f" %
      (min(xs),max(xs),max(xs)-min(xs),min(ys),max(ys),max(ys)-min(ys),min(zs),max(zs)))
print("origin:", tuple(round(c,3) for c in o.location))
deck_z = None
for poly in me.polygons:
    mat = me.materials[poly.material_index]
    if mat and mat.name in ("Aspal", "AspalGelap"):
        c = o.matrix_world @ poly.center
        if abs(c.x) < 10 and abs(c.y) < 7:
            deck_z = c.z if deck_z is None else max(deck_z, c.z)
print("Deck atas (pusat poligon aspal, tengah): Z =", deck_z)
blockers = []
for vtx in me.vertices:
    v = o.matrix_world @ vtx.co
    if abs(v.x) < 10.5 and abs(v.y) < 7.2 and 0.0 < v.z < 2.0:
        blockers.append((round(v.x,2), round(v.y,2), round(v.z,2)))
print("Vertex penghalang di jalur pemain:", blockers if blockers else "TIDAK ADA")
print("VERIFY NEW DONE")
