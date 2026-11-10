import bpy, sys, math, json
# Ukur footprint GLB (ruang lokal) + daftar mesh (utk stand/baskom/pintu).
# Pakai: blender --background --python ukur_glb.py -- <file1> <file2> ...
argv = sys.argv[sys.argv.index("--") + 1:]
for path in argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    # AABB lokal gabungan (semua mesh, koordinat dunia = lokal krn scene kosong)
    xs, zs = [], []
    per = []
    for o in meshes:
        # bound_box dalam ruang objek -> dunia (matrix_world)
        pts = [o.matrix_world @ __import__('mathutils').Vector(c) for c in o.bound_box]
        mx = [p.x for p in pts]; mz = [p.z for p in pts]
        xs += mx; zs += mz
        per.append((o.name, round(min(mx),2), round(max(mx),2), round(min(mz),2), round(max(mz),2), round(max(p.y for p in pts),2)))
    print(f"== {path} ==")
    print(f"  GABUNGAN lokal X[{min(xs):.2f},{max(xs):.2f}] Z[{min(zs):.2f},{max(zs):.2f}] w={max(xs)-min(xs):.2f} d={max(zs)-min(zs):.2f} cx={(min(xs)+max(xs))/2:.2f} cz={(min(zs)+max(zs))/2:.2f}")
    for (nm, x0, x1, z0, z1, ymax) in per:
        print(f"    mesh {nm[:44]:44s} X[{x0:7.2f},{x1:7.2f}] Z[{z0:7.2f},{z1:7.2f}] ymax={ymax:6.2f}")
