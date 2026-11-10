import bpy, sys
# Ukur footprint GLB dgn sumbu BENAR (Blender: plan = X,Y ; tinggi = Z).
# Pakai: blender --background --python ukur_glb2.py -- <file...>
argv = sys.argv[sys.argv.index("--") + 1:]
for path in argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    xs, ys, zs = [], [], []
    per = []
    for o in meshes:
        pts = [o.matrix_world @ __import__('mathutils').Vector(c) for c in o.bound_box]
        mx = [p.x for p in pts]; my = [p.y for p in pts]; mz = [p.z for p in pts]
        xs += mx; ys += my; zs += mz
        per.append((o.name, round(min(mx),2), round(max(mx),2), round(min(my),2), round(max(my),2), round(min(mz),2), round(max(mz),2)))
    print(f"== {path} ==")
    print(f"  GABUNGAN plan X[{min(xs):.2f},{max(xs):.2f}] Y[{min(ys):.2f},{max(ys):.2f}] w={max(xs)-min(xs):.2f} d={max(ys)-min(ys):.2f} cx={(min(xs)+max(xs))/2:.2f} cy={(min(ys)+max(ys))/2:.2f} | tinggi Z[{min(zs):.2f},{max(zs):.2f}]")
    for (nm, x0, x1, y0, y1, z0, z1) in per:
        print(f"    {nm[:40]:40s} X[{x0:7.2f},{x1:7.2f}] Y[{y0:7.2f},{y1:7.2f}] Z[{z0:5.2f},{z1:5.2f}]")
