import sys, math, json
sys.path.insert(0,'.')
from tri_test import world_tris, index_tris, covering_y
W='/home/hatch/workspace/lumina/'
# base footprint G04: segitiga dgn minY<1.0 setelah lift; cari min-r & luas di cincin per geseran radial
def base_ring(cx, cz, step=0.25):
    tris = world_tris(W+'gedung-g04-blender-v2.glb', *(cx, 14.9, cz, 5.9026))
    idx = index_tris(tris)
    xs=[p[0] for t in tris for p in t]; zs=[p[2] for t in tris for p in t]
    x0,x1,z0,z1=min(xs),max(xs),min(zs),max(zs)
    n=hit=0; minr=1e9
    x=x0
    while x<x1:
        z=z0
        while z<z1:
            r=math.hypot(x,z)
            cov=[a for a in covering_y(x,z,idx) if a[0]<1.0]
            if cov:
                minr=min(minr,r)
                if 14<=r<=20.5:
                    n+=1; hit+=1
            z+=step
        x+=step
    return hit*step*step, minr
# arah radial keluar dari plaza: (-12,30)/32.31 = (-0.3714,0.9285)
ux,uz=-12/math.hypot(12,30),30/math.hypot(12,30)
for d in [0,2,4,5,6,7,8]:
    cx,cz=-12+ux*d,30+uz*d
    area,minr=base_ring(cx,cz)
    print(f"geser radial +{d} m -> pusat ({cx:.1f},{cz:.1f}) alas-di-cincin={area:.2f} m2 min-r alas={minr:.2f}")
# titik lampu plaza (-6.159,14.984): apakah di dalam tapak alas G04 lama & baru?
for d in [0,6]:
    cx,cz=-12+ux*d,30+uz*d
    tris = world_tris(W+'gedung-g04-blender-v2.glb', *(cx, 14.9, cz, 5.9026))
    idx = index_tris(tris)
    cov=[a for a in covering_y(-6.159,14.984,idx) if a[0]<1.0]
    print(f"geser {d}: lampu plaza (-6.159,14.984) di tapak alas G04? {cov}")
