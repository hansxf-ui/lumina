# Uji segitiga (metode audit geometri §1b) utk pasangan kritis rencana Fase B.
# Memuat segitiga lokal GLB, mentransformasi ke posisi BARU, lalu sampling grid 0.1 m.
import sys, json, math
sys.path.insert(0, '/home/hatch/workspace/lumina/audit/plan')
from glb import load_glb, node_mats, accessor_data

W = '/home/hatch/workspace/lumina/'

def all_tris_local(path):
    js, buf, bo = load_glb(path)
    mats = node_mats(js)
    tris = []
    for ni, n in enumerate(js.get('nodes', [])):
        if 'mesh' not in n: continue
        M = mats[ni]
        mesh = js['meshes'][n['mesh']]
        for prim in mesh['primitives']:
            pos = accessor_data(js, buf, bo, prim['attributes']['POSITION'])
            idx = accessor_data(js, buf, bo, prim['indices']) if 'indices' in prim else [(i,) for i in range(len(pos))]
            idx = [i[0] for i in idx]
            for k in range(0, len(idx) - 2, 3):
                tri = []
                for vi in idx[k:k + 3]:
                    p = pos[vi]
                    tri.append([M[0][0]*p[0]+M[0][1]*p[1]+M[0][2]*p[2]+M[0][3],
                                M[1][0]*p[0]+M[1][1]*p[1]+M[1][2]*p[2]+M[1][3],
                                M[2][0]*p[0]+M[2][1]*p[1]+M[2][2]*p[2]+M[2][3]])
                tris.append(tri)
    return tris

_cache = {}
def world_tris(path, x, y, z, ry):
    key = (path, x, y, z, ry)
    if key in _cache: return _cache[key]
    cs, sn = math.cos(ry), math.sin(ry)
    out = []
    for t in all_tris_local(path):
        wt = []
        for (lx, ly, lz) in t:
            wx = lx * cs + lz * sn + x
            wz = -lx * sn + lz * cs + z
            wt.append((wx, ly + y, wz))
        out.append(wt)
    _cache[key] = out
    return out

def index_tris(tris, cell=1.0):
    g = {}
    for t in tris:
        xs = [p[0] for p in t]; zs = [p[2] for p in t]
        for gx in range(math.floor(min(xs) / cell), math.floor(max(xs) / cell) + 1):
            for gz in range(math.floor(min(zs) / cell), math.floor(max(zs) / cell) + 1):
                g.setdefault((gx, gz), []).append(t)
    return g, cell

def _in_tri2(px, pz, t):
    (ax, az), (bx, bz), (cx, cz) = (t[0][0], t[0][2]), (t[1][0], t[1][2]), (t[2][0], t[2][2])
    d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz)
    if abs(d) < 1e-12: return False
    w1 = ((bz - cz) * (px - cx) + (cx - bx) * (pz - cz)) / d
    w2 = ((cz - az) * (px - cx) + (ax - cx) * (pz - cz)) / d
    return w1 >= -1e-9 and w2 >= -1e-9 and (1 - w1 - w2) >= -1e-9

def covering_y(px, pz, idx):
    """daftar interval-y segitiga yang menutupi (px,pz) (proyeksi XZ)."""
    g, cell = idx
    res = []
    for t in g.get((math.floor(px / cell), math.floor(pz / cell)), []):
        if _in_tri2(px, pz, t):
            ys = [p[1] for p in t]
            res.append((min(ys), max(ys)))
    return res

def pair_area(nameA, pathA, posA, nameB, pathB, posB, step=0.1):
    ta = world_tris(pathA, *posA); tb = world_tris(pathB, *posB)
    ia, ib = index_tris(ta), index_tris(tb)
    ax0 = min(min(p[0] for p in t) for t in ta); ax1 = max(max(p[0] for p in t) for t in ta)
    az0 = min(min(p[2] for p in t) for t in ta); az1 = max(max(p[2] for p in t) for t in ta)
    bx0 = min(min(p[0] for p in t) for t in tb); bx1 = max(max(p[0] for p in t) for t in tb)
    bz0 = min(min(p[2] for p in t) for t in tb); bz1 = max(max(p[2] for p in t) for t in tb)
    x0, x1 = max(ax0, bx0), min(ax1, bx1)
    z0, z1 = max(az0, bz0), min(az1, bz1)
    if x0 >= x1 or z0 >= z1:
        print(f"  {nameA} x {nameB}: AABB tidak bersentuhan -> 0.00 m2"); return 0.0
    n = hit = 0
    x = x0
    while x < x1:
        z = z0
        while z < z1:
            n += 1
            ya = covering_y(x, z, ia); yb = covering_y(x, z, ib)
            done = False
            for (a0, a1) in ya:
                for (b0, b1) in yb:
                    if min(a1, b1) - max(a0, b0) > 0.05:
                        hit += 1; done = True; break
                if done: break
            z += step
        x += step
    area = hit * step * step
    print(f"  {nameA} x {nameB}: {area:.2f} m2 (grid {step} m, {hit}/{n} titik)")
    return area

def ring_area(name, path, pos, step=0.25):
    """Luas tapak alas (segitiga dgn minY<1.0) yg jatuh di cincin r 14..20.5."""
    tris = world_tris(path, *pos)
    idx = index_tris(tris)
    xs = [p[0] for t in tris for p in t]; zs = [p[2] for t in tris for p in t]
    x0, x1, z0, z1 = min(xs), max(xs), min(zs), max(zs)
    n = hit = 0
    x = x0
    while x < x1:
        z = z0
        while z < z1:
            r = math.hypot(x, z)
            if 14 <= r <= 20.5:
                n += 1
                for (a0, a1) in covering_y(x, z, idx):
                    if a0 < 1.0:
                        hit += 1; break
            z += step
        x += step
    print(f"  {name} alas-di-cincin: {hit*step*step:.2f} m2 (grid {step} m, {hit}/{n} titik cincin)")
    return hit * step * step

if __name__ == '__main__':
  print("== UJI SEGITIGA RENCANA ==")
  # 1. G04 terangkat vs cincin + vs mancur + vs bangku/lampu plaza
  ring_area('G04 terangkat y+14.9', W + 'gedung-g04-blender-v2.glb', (-12, 14.9, 30, 5.9026))
  pair_area('G04 terangkat', W + 'gedung-g04-blender-v2.glb', (-12, 14.9, 30, 5.9026),
            'Mancur Blender', W + 'air-mancur-blender-v1.glb', (0, 0, 0, 0))
  # bangku plaza 2/3 & lampu plaza: posisi dari bbox.json
  bb = json.load(open(W + 'audit/bbox.json'))
  def find(label, x, z):
      for o in bb:
          if o['label'] == label and abs(o['x'] - x) < 0.01 and abs(o['z'] - z) < 0.01: return o
      raise KeyError((label, x, z))
  for lab, x, z in [('Bangku Plaza 2', 1.589, 5.889), ('Bangku Plaza 3', -4.306, 4.321)]:
      o = find(lab, x, z)
      pair_area('G04 terangkat', W + 'gedung-g04-blender-v2.glb', (-12, 14.9, 30, 5.9026),
                lab, W + o['file'], (o['x'], o['y'], o['z'], o['ry']))
  # Lampu Plaza prosedural (tiang): cek titik pusatnya thd tapak alas G04
  _tr = world_tris(W + 'gedung-g04-blender-v2.glb', *(-12, 14.9, 30, 5.9026))
  _ix = index_tris(_tr)
  _cov = [a for a in covering_y(-6.159, 14.984, _ix) if a[0] < 1.0]
  print(f"  G04 terangkat x Lampu Plaza (-6.159,14.984): tapak alas menutupi tiang? {_cov}")
  # 2. G02 baru vs cincin
  ring_area('G02 baru (16,21) ry3.794', W + 'gedung-g02-blender-v3.glb', (16, 0, 21, 3.794))
  ring_area('G02 baru (15,20) ry3.785', W + 'gedung-g02-blender-v3.glb', (15, 0, 20, 3.785))
  # 3. G10 baru vs Kopi baru
  pair_area('G10 baru (-14,-33)', W + 'gedung-g10-blender-v2.glb', (-14, 0, -33, 3.3215),
            'Kopi baru (-8.4,-44)', W + 'kopi-senja-toko-blender-v1.glb', (-8.4, 0, -44, 1.5708))
  # 4. G08 baru (34,-15) vs G09 & jembatan batu 1
  pair_area('G08 baru (34,-15)', W + 'gedung-g08-blender-v2.glb', (34, 0, -15, 1.9029),
            'G09', W + 'gedung-g09-blender-v2.glb', (20, 0, -27, 2.5041))
  pair_area('G08 baru (34,-15)', W + 'gedung-g08-blender-v2.glb', (34, 0, -15, 1.9029),
            'Jembatan Batu 1', W + 'jembatan-batu-blender-v1.glb', (45.3, 0, -21.7, 0))
  # 5. G07 baru (30,17) vs Lampu Bukit 1 baru (33,26)
  pair_area('G07 baru (30,17)', W + 'gedung-g07-blender-v2.glb', (30, 0, 17, 1.2491),
            'Lampu Bukit 1 baru (33,26)', W + 'lampu-jalan-blender-v1.glb', (33, 0.92, 26, 0))
