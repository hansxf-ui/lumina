import sys; sys.path.insert(0,'.')
from glb import *
import math
road=node_triangles('/home/hatch/workspace/lumina/jalan-raya-blender-v1.glb','Roads')
sung=node_triangles('/home/hatch/workspace/lumina/sungai-blender-v4.glb','sungai_water')
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
    return w1>=-1e-9 and w2>=-1e-9 and (1-w1-w2)>=-1e-9
def inside(px,pz,idx):
    g,cell=idx
    for t in g.get((math.floor(px/cell),math.floor(pz/cell)),[]):
        if in_tri(px,pz,t): return True
    return False
ri=index(road); si=index(sung)
def road_x_range(z):
    xs=[x for x in range(-130,61) if inside(x,z,ri)]
    return (min(xs),max(xs)) if xs else None
def river_x_range(z):
    xs=[x for x in range(-130,131) if inside(x,z,si)]
    return (min(xs),max(xs)) if xs else None
print("ROAD x-range per z (pasar & selatan):")
for z in [-12,-10,-8,-6,-5,-4,-2,0,2,4,5,6,8,10,135,150,170,174,175,176,178,180,181,185,190,192,195,200,220]:
    print(f" z={z:4d} road={road_x_range(z)} river={river_x_range(z)}")
print("ROAD z-range per x (N-S road):")
for x in [-2,0,2,5,8,10,12]:
    zs=[z for z in range(-110,201) if inside(x,z,ri)]
    # compress to runs
    runs=[]
    for z in zs:
        if runs and z==runs[-1][1]+1: runs[-1][1]=z
        else: runs.append([z,z])
    print(f" x={x:3d} runs={runs}")
print("RIVER x-range per z (z -20..20 step 2, and z 50..70):")
for z in list(range(-20,21,2))+list(range(50,71,2)):
    print(f" z={z:4d} river={river_x_range(z)}")
print("ROAD around City Walk toko (x -15..22, z -90..-25): sample 1m, rows z=-44,-52,-60,-68:")
for z in [-44,-52,-60,-68]:
    xs=[x for x in range(-20,26) if inside(x,z,ri)]
    print(f" z={z} road x={xs}")
print("ROAD around G02/G05/G07/G08/G10 footprints (1m sample counts):")
import json
b=json.load(open('../bbox.json'))
for o in b:
    if o['label'] in ('Gedung G02','Gedung G05','Gedung G07','Gedung G08','Gedung G10','Gedung G04','Toko Roti & Kopi','Toko Kopi Senja','Toko Es Krim','Toko Studio Foto','Toko Buku & Kertas','Toko Teh & Rempah','Toko Mainan','Toko Bunga','Kolam Renang','Gedung Konser','Skatepark','Taman Bunga','Food Court'):
        n=r=s=0
        x0,x1,z0,z1=o['minX'],o['maxX'],o['minZ'],o['maxZ']
        nx=int((x1-x0)/0.5); nz=int((z1-z0)/0.5)
        for i in range(nx+1):
            for j in range(nz+1):
                px=x0+i*0.5; pz=z0+j*0.5; n+=1
                if inside(px,pz,ri): r+=1
                if inside(px,pz,si): s+=1
        print(f" {o['label']:22} pts={n} road={r} ({r*0.25:.2f}m2) river={s} ({s*0.25:.2f}m2)")
