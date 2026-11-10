import sys; sys.path.insert(0,'/home/hatch/workspace/lumina/audit/plan')
from glb import *
import math
road=node_triangles('/home/hatch/workspace/lumina/jalan-raya-blender-v1.glb','Roads')
sung=node_triangles('/home/hatch/workspace/lumina/sungai-blender-v4.glb','sungai_water')
print("road tris",len(road),"sungai tris",len(sung))
# grid index
def index(tris,cell=5):
    g={}
    for t in tris:
        xs=[p[0] for p in t]; zs=[p[2] for p in t]
        for gx in range(math.floor(min(xs)/cell),math.floor(max(xs)/cell)+1):
            for gz in range(math.floor(min(zs)/cell),math.floor(max(zs)/cell)+1):
                g.setdefault((gx,gz),[]).append(t)
    return g,cell
def in_tri(px,pz,t):
    (ax,az),(bx,bz),(cx,cz)=(t[0][0],t[0][2]),(t[1][0],t[1][2]),(t[2][0],t[2][2])
    d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz)
    if abs(d)<1e-12: return False
    w1=((bz-cz)*(px-cx)+(cx-bx)*(pz-cz))/d
    w2=((cz-az)*(px-cx)+(ax-cx)*(pz-cz))/d
    w3=1-w1-w2
    return w1>=-1e-9 and w2>=-1e-9 and w3>=-1e-9
def inside(px,pz,idx):
    g,cell=idx
    for t in g.get((math.floor(px/cell),math.floor(pz/cell)),[]):
        if in_tri(px,pz,t): return True
    return False
ri=index(road); si=index(sung)
# ASCII map: x -130..60 step 5 (cols), z -100..200 step 5 (rows top=north z=-100)
print("map 5m cells: R=road S=sungai B=both .=none  (x from -130 left to 60 right, z -100 top to 200 bottom)")
for z in range(-100,201,5):
    row=""
    for x in range(-130,61,5):
        r=inside(x+2.5,z+2.5,ri); s=inside(x+2.5,z+2.5,si)
        row+= 'B' if (r and s) else ('R' if r else ('S' if s else '.'))
    print(f"z={z:4d} {row}")
