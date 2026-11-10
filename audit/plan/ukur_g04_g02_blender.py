# Ukur mandiri Vesper: tapak dunia G04/G02 per pita tinggi (three coords).
# Blender Z-up; three (x,y,z) -> Blender (x,-z,y); rot three-Y ry -> Blender Rz(+ry).
# Untuk tiap pita tinggi: raster grid 0,25 m dari segitiga yg memotong pita,
# hitung min-r dari (0,0) dan luas di cincin (14<=r<=20.5), trotoar (13.2<=r<14), plaza (r<13.2).
import bpy, sys, math
from mathutils import Vector, Matrix

def measure(path, pos_three, ry, label):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    # placement: Blender pos (x,-z,y), rot Z ry
    px, py, pz = pos_three
    R = Matrix.Rotation(ry, 4, 'Z')
    T = Matrix.Translation((px, -pz, py))
    M = T @ R
    tris = []  # (v0,v1,v2) in three coords (x,y,z)
    dg = bpy.context.evaluated_depsgraph_get()
    for ob in bpy.context.scene.objects:
        if ob.type != 'MESH':
            continue
        ev = ob.evaluated_get(dg)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        mw = M @ ob.matrix_world
        for t in me.loop_triangles:
            vs = []
            for vi in t.vertices:
                w = mw @ me.vertices[vi].co  # Blender coords
                vs.append((w.x, w.z, -w.y))  # -> three (x,y,z)
            tris.append(vs)
        ev.to_mesh_clear()
    print(f"== {label}: {len(tris)} segitiga ==")
    # bbox dunia
    xs = [v[0] for t in tris for v in t]; ys = [v[1] for t in tris for v in t]; zs = [v[2] for t in tris for v in t]
    print(f"   bbox dunia three: x {min(xs):.2f}..{max(xs):.2f}  y {min(ys):.2f}..{max(ys):.2f}  z {min(zs):.2f}..{max(zs):.2f}")
    # min radius of any vertex
    rs = [math.hypot(v[0], v[2]) for t in tris for v in t]
    print(f"   min-r verteks: {min(rs):.2f} m")
    def pt_in_tri(px_, pz_, a, b, c):
        def s(p, q, r): return (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])
        d1 = s((px_, pz_), a, b); d2 = s((px_, pz_), b, c); d3 = s((px_, pz_), c, a)
        neg = (d1 < -1e-9) or (d2 < -1e-9) or (d3 < -1e-9)
        pos = (d1 > 1e-9) or (d2 > 1e-9) or (d3 > 1e-9)
        return not (neg and pos)
    bands = [(0.0, 0.5, "ALAS y0-0.5"), (0.5, 3.0, "lantai1 y0.5-3"), (3.0, 6.0, "y3-6"), (6.0, 10.0, "y6-10"), (10.0, 15.0, "y10-15"), (15.0, 19.1, "y15-19")]
    for h0, h1, name in bands:
        cells = set()
        for t in tris:
            ys_t = [v[1] for v in t]
            if max(ys_t) < h0 or min(ys_t) > h1:
                continue
            pts = [(v[0], v[2]) for v in t]
            gx0 = math.floor(min(p[0] for p in pts) / 0.25); gx1 = math.floor(max(p[0] for p in pts) / 0.25)
            gz0 = math.floor(min(p[1] for p in pts) / 0.25); gz1 = math.floor(max(p[1] for p in pts) / 0.25)
            for ix in range(gx0, gx1 + 1):
                for iz in range(gz0, gz1 + 1):
                    cx, cz = (ix + 0.5) * 0.25, (iz + 0.5) * 0.25
                    if pt_in_tri(cx, cz, pts[0], pts[1], pts[2]):
                        cells.add((ix, iz))
        if not cells:
            print(f"   {name}: KOSONG")
            continue
        rs_c = [math.hypot((ix + 0.5) * 0.25, (iz + 0.5) * 0.25) for ix, iz in cells]
        a_ring = sum(1 for r in rs_c if 14.0 <= r <= 20.5) * 0.0625
        a_trot = sum(1 for r in rs_c if 13.2 <= r < 14.0) * 0.0625
        a_plaza = sum(1 for r in rs_c if r < 13.2) * 0.0625
        print(f"   {name}: sel={len(cells)} ({len(cells)*0.0625:.1f} m2) min-r={min(rs_c):.2f} | cincin={a_ring:.2f} trotoar={a_trot:.2f} plaza={a_plaza:.2f} m2")

measure('/home/hatch/workspace/lumina/gedung-g04-blender-v2.glb', (-15, 14.9, 37.4), 5.9026, 'G04')
measure('/home/hatch/workspace/lumina/gedung-g02-blender-v3.glb', (15, 0, 20), 3.785, 'G02')
print("SELESAI")
