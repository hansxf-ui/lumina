# Scan seed acakVeg: cari seed pengganti 20261023 yang replay-nya 0 pohon di
# jalan/bangunan/air pada UJI SEGITIGA (kriteria ketat: titik pohon tidak
# ditutupi segitiga apa pun dgn minY<4.5 dari bangunan/jalan/air).
# Port Python dari replay-veg.mjs - divalidasi dulu terhadap replay-veg.json.
import sys, json, math
sys.path.insert(0, '/home/hatch/workspace/lumina/audit/plan')
from tri_test import world_tris, index_tris, covering_y
from glb import load_glb, node_mats, accessor_data

W = '/home/hatch/workspace/lumina/'
M32 = 0xFFFFFFFF

def u32(n): return n & M32
def s32(n):
    n &= M32
    return n - 0x100000000 if n >= 0x80000000 else n
def imul32(a, b):
    # Math.imul: hasil int32 bertanda; representasi u32-nya dipakai lanjut
    return (s32(a) * s32(b)) & M32

class RNG:
    def __init__(self, seed): self.a = u32(seed)
    def __call__(self):
        # Salinan bit-persis mulberry32 JS (semua nilai dijaga u32;
        # >>> JS = geser logis = >> Python atas non-negatif)
        a = (self.a + 0x6D2B79F5) & M32
        self.a = a
        t = imul32(a ^ (a >> 15), (1 | a) & M32)
        t = (((t + imul32(t ^ (t >> 7), (61 | t) & M32)) & M32) ^ t) & M32
        return ((t ^ (t >> 14)) & M32) / 4294967296.0

def clamp(v, a, b): return min(b, max(a, v))
def jarak_seg5(x, z, a, b):
    abx, abz = b[0]-a[0], b[1]-a[1]
    t = ((x-a[0])*abx + (z-a[1])*abz) / (abx*abx + abz*abz)
    t = clamp(t, 0, 1)
    return math.hypot(x-(a[0]+abx*t), z-(a[1]+abz*t))
def jarak_rute5(x, z, rute):
    return min(jarak_seg5(x, z, rute[i], rute[i+1]) for i in range(len(rute)-1))
def beda_sudut(a, b):
    d = (a-b) % (math.pi*2)
    if d > math.pi: d -= math.pi*2
    if d < -math.pi: d += math.pi*2
    return abs(d)

RUTE_BARAT = [[-12,8],[-38,16],[-56,28],[-84,32],[-112,24],[-131,17]]
RUTE_DANAU = [[-84,32],[-108,16],[-128,-2],[-146,-14],[-155.5,-17.5],[-159,-18]]
RUTE_SEKOLAH = [[-131,17],[-130,40],[-133,49],[-141,58],[-150,61.5],[-160,60.5],[-176,60]]
RUTE_HUTAN = [[64,-8],[95,-30],[130,-55],[155,-78],[168,-88]]
GUNUNG = (0, -225)
LANDAI_G = [1.5, -2.4, -0.5, 2.6, 0.2]

# R6 (2026-11-09) — port filter tapak nyata dari index.html (ZONA_LARANG_VEG).
# Dipakai di replay() di bawah, SESUDAH semua undian kandidat, supaya aliran
# RNG tidak bergeser (lihat USULAN-R6-KAMERA.md §B.4).
ZONA_LARANG_VEG = [
  [-27.00, -14.00, 3.93, 2.99, 0.000, 8.91],
  [14.75, 19.66, 4.45, 4.72, 3.785, 13.92],
  [-23.83, 19.86, 5.05, 4.62, 5.404, 10.98],
  [-7.20, 17.89, 3.20, 9.41, 5.903, 19.06],
  [9.85, 32.42, 3.99, 4.05, 0.180, 15.77],
  [-34.54, -31.40, 5.20, 5.11, 3.797, 15.34],
  [29.72, 16.91, 5.36, 4.65, 1.249, 13.55],
  [34.57, -14.92, 3.66, 3.66, 1.903, 15.86],
  [20.71, -27.53, 5.40, 7.80, 2.504, 12.48],
  [-14.00, -33.00, 7.35, 4.90, 3.321, 8.32],
  [-9.89, -44.00, 5.69, 6.42, 1.571, 7.94],
  [-8.02, -58.01, 5.68, 4.98, 1.571, 7.25],
  [-8.69, -70.00, 4.87, 4.71, 1.571, 8.92],
  [-8.57, -80.00, 3.30, 3.31, 1.571, 4.71],
  [16.64, -44.00, 5.62, 5.79, -1.571, 7.39],
  [15.21, -57.00, 4.75, 4.01, -1.571, 6.58],
  [15.49, -68.00, 4.41, 3.96, -1.571, 6.86],
  [15.38, -80.00, 5.32, 4.75, -1.571, 8.62],
  [-25.00, -46.45, 3.90, 4.35, 0.000, 23.75],
  [22.44, 0.00, 3.40, 1.06, 1.571, 5.13],
  [21.84, -11.69, 1.19, 0.55, 0.500, 2.09],
  [39.77, 11.31, 1.19, 0.55, -2.200, 2.09],
  [6.51, 55.59, 0.55, 1.19, 0.120, 2.09],
]
RECT_LARANG_VEG = [
  [-4, 4, -96, 195],
  [-90, 54, -8, 8],
  [-122, -86, -12, 0],
  [-90, -86, 0, 20],
  [-52, 52, 177, 183],
  [-122, -118, -40, -12],
  [41, 58, -22, 22],
  [161.2, 164.8, -96.7, -93.4],
  [174.2, 179.8, -88.9, -83.1],
  [165.6, 168.0, -87.6, -85.3],
  [172.3, 174.7, -95.0, -92.6],
]
def _di_obb_veg(x, z, o, m):
    dx, dz = x - o[0], z - o[1]
    c, s = math.cos(o[4]), math.sin(o[4])
    lx, lz = dx * c - dz * s, dx * s + dz * c
    return abs(lx) <= o[2] + m and abs(lz) <= o[3] + m
def di_zona_larang_veg(x, z):
    for o in ZONA_LARANG_VEG:
        m = 0.3 if (o[0] == -7.20 and o[1] == 17.89) else 0.5
        if _di_obb_veg(x, z, o, m):
            return True
    for r in RECT_LARANG_VEG:
        if r[0] <= x <= r[1] and r[2] <= z <= r[3]:
            return True
    return False

# penabrak eksak saat blok kota (lihat replay-veg.mjs)
def penabrak_awal():
    p = [{ 'x': -25, 'z': -46, 'r': 4.0 }, { 'x': 0, 'z': 0, 'r': 4.0 }]
    posisi = [[-27,-14],[15,20],[-24,20],[-15,37.4],[10,33],[-35,-32],[30,17],[34.8,-15],[20,-27],[-14,-33]]
    for i, (px, pz) in enumerate(posisi):
        lebar = 6.5 + (i % 3)*1.4; dalam = 6 + (i % 2)*1.6
        p.append({ 'x': px, 'z': pz, 'r': max(lebar, dalam)/2 + 0.7 })
    cx, cz, w, d = -27, -14, 7.85, 5.97
    x0, x1, z0, z1 = cx-w/2, cx+w/2, cz-d/2, cz+d/2
    x = x0
    while x <= x1 + 0.01: p.append({ 'x': x, 'z': z0, 'r': 0.6 }); x += 1
    z = z0
    while z <= z1 + 0.01: p.append({ 'x': x0, 'z': z, 'r': 0.6 }); p.append({ 'x': x1, 'z': z, 'r': 0.6 }); z += 1
    dx0, dx1 = cx-0.9, cx+0.9
    x = x0
    while x <= x1 + 0.01:
        if x < dx0-0.3 or x > dx1+0.3: p.append({ 'x': x, 'z': z1, 'r': 0.6 })
        x += 1
    z = z0+1
    while z <= z1-1: p.append({ 'x': x0+0.5, 'z': z, 'r': 0.5 }); p.append({ 'x': x1-0.5, 'z': z, 'r': 0.5 }); z += 1
    x = x0+1
    while x <= x1-1: p.append({ 'x': x, 'z': z0+0.5, 'r': 0.5 }); x += 1
    return p

def replay(seed):
    rng = RNG(seed)
    # 1. kota
    terlarang = penabrak_awal()
    kota = []
    jadi = coba = 0
    while jadi < 30 and coba < 300:
        coba += 1
        a = rng() * math.pi * 2
        r = 23.5 + rng() * 31
        px, pz = math.cos(a)*r, math.sin(a)*r
        if any((px-t['x'])**2 + (pz-t['z'])**2 < (t['r']+1.6)**2 for t in terlarang): continue
        if any(math.hypot(px-sx, pz-sz) < 3.2 for sx in [23.5,28.5,33.5,38.5] for sz in [-6.8,6.8]): continue
        if abs(px) <= 4 and -96 <= pz <= 195: continue
        if abs(pz) <= 8 and -122 <= px <= 54: continue
        if math.hypot(px-37, pz-37) < 20.5: continue
        if px < -13 and abs(pz) < 4.6: continue
        if px > 10.5 and abs(pz) < 10.5: continue
        if math.hypot(px-46, pz) < 25: continue
        if abs(px-3.5) < 7.5 and pz < -14: continue
        epP = (px/47)**2 + ((pz-61.5)/20)**2
        if pz > 40 and epP <= 1: continue
        if math.hypot(px+38, pz-72) < 10.5: continue
        rng(); rng(); rng()  # s, reg, ry
        if di_zona_larang_veg(px, pz): continue  # R6: tapak nyata — sesudah undian
        kota.append((px, pz)); jadi += 1
    # 2. padang
    RUTE_SEMUA = RUTE_BARAT + RUTE_DANAU + RUTE_SEKOLAH
    padang = []
    nb = nk = nyoba = 0
    while (nb+nk) < 76 and nyoba < 900:
        nyoba += 1
        x = -246 + rng()*166; z = -56 + rng()*142
        if math.hypot(x+180, z+20) < 28: continue
        if -170 < x < -128 and -9 < z < 35: continue
        if -250 <= x <= -170 and 38 <= z <= 88: continue
        if jarak_rute5(x, z, RUTE_SEMUA) < 3.6: continue
        if -12 <= z <= 0 and -122 <= x <= -86: continue
        if abs(z+20) < 4 and -176 < x < -152: continue
        rng(); rng(); rng(); rng()  # s, ry, warna x2
        if di_zona_larang_veg(x, z): continue  # R6: tapak nyata — sesudah undian
        if (nb+nk) % 3 != 2: nb += 1
        else: nk += 1
        padang.append((x, z))
    # 3. hutan
    hutan = []
    n = nyoba = 0
    def taruh(x, z, _s=None):
        nonlocal n
        rng(); rng(); rng()
        if di_zona_larang_veg(x, z): return  # R6: tapak nyata — sesudah undian
        hutan.append((x, z)); n += 1
    while n < 232 and nyoba < 6000:
        nyoba += 1
        x = 84 + rng()*158; z = -162 + rng()*144
        if math.hypot(x-170, z+90) < 15: continue
        if jarak_rute5(x, z, RUTE_HUTAN) < 3.6: continue
        if 146 <= x <= 234 and -75 <= z <= -15: continue
        if 65.2 <= x <= 84.8 and -45.3 <= z <= -24.7: continue
        if 90.3 <= x <= 109.7 and -63.6 <= z <= -46.4: continue
        if 114.1 <= x <= 135.9 and -40.8 <= z <= -19.2: continue
        taruh(x, z, 0.8 + rng()*0.7)
    nyoba = 0
    targetG = n + 22
    while n < targetG and nyoba < 900:
        nyoba += 1
        d = 40 + rng()*15; a = rng()*math.pi*2
        if abs(beda_sudut(a, LANDAI_G[0])) < 0.7: continue
        if d < 49 and abs(beda_sudut(a, LANDAI_G[1])) < 0.65: continue
        taruh(GUNUNG[0]+math.cos(a)*d, GUNUNG[1]+math.sin(a)*d, 0.8 + rng()*0.5)
    # 4. awan
    awan = []
    for _ in range(9):
        a2 = rng()*math.pi*2; r2 = 120 + rng()*160
        awan.append((math.cos(a2)*r2, 42 + rng()*30, math.sin(a2)*r2))
        rng(); rng()
    return kota, padang, hutan, awan

# ---------- adjudikasi segitiga ----------
bb = json.load(open(W + 'audit/bbox.json'))
SKIP = ('jalan', 'sungai', 'danau', 'laut', 'langit', 'awan', 'perahu', 'marking', 'trotoar', 'cincin')
def node_tris(path, name, x, y, z, ry):
    js, buf, bo = load_glb(path)
    mats = node_mats(js)
    cs, sn = math.cos(ry), math.sin(ry)
    out = []
    for ni, n in enumerate(js.get('nodes', [])):
        if n.get('name') != name or 'mesh' not in n: continue
        M = mats[ni]; mesh = js['meshes'][n['mesh']]
        for prim in mesh['primitives']:
            pos = accessor_data(js, buf, bo, prim['attributes']['POSITION'])
            idx = accessor_data(js, buf, bo, prim['indices']) if 'indices' in prim else [(i,) for i in range(len(pos))]
            idx = [i[0] for i in idx]
            for k in range(0, len(idx)-2, 3):
                tri = []
                for vi in idx[k:k+3]:
                    p = pos[vi]
                    lx = M[0][0]*p[0]+M[0][1]*p[1]+M[0][2]*p[2]+M[0][3]
                    ly = M[1][0]*p[0]+M[1][1]*p[1]+M[1][2]*p[2]+M[1][3]
                    lz = M[2][0]*p[0]+M[2][1]*p[1]+M[2][2]*p[2]+M[2][3]
                    tri.append((lx*cs+lz*sn+x, ly+y, -lx*sn+lz*cs+z))
                out.append(tri)
    return out

_cache = {}
def get_index(key, tris):
    if key not in _cache: _cache[key] = index_tris(tris)
    return _cache[key]

# indeks permukaan: Roads, sungai, danau water, kolam water
SURF = []
_roads = node_tris(W+'jalan-raya-blender-v1.glb', 'Roads', 0, 0, 0, 0)
SURF.append(('jalan-raya', get_index('roads', _roads)))
_sungai = world_tris(W+'sungai-blender-v4.glb', 0, 0, 0, 0)
SURF.append(('sungai', get_index('sungai', _sungai)))
# (air danau tidak dicek segitiga: filter padang menolak r<28 dari pusat danau,
#  sementara tapak air GLB hanya 23x18 — aman by construction; elips dicek di replay)
print('indeks permukaan siap (roads/sungai)')

def cari_bangunan(x, z):
    out = []
    for e in bb:
        if e['kat'] == 'vegetasi': continue
        if any(s in e['label'].lower() for s in SKIP): continue
        if e['maxX']-e['minX'] > 40 or e['maxZ']-e['minZ'] > 40: continue
        if e['minX']-1 <= x <= e['maxX']+1 and e['minZ']-1 <= z <= e['maxZ']+1:
            out.append(e)
    return out

def pelanggaran(zona, pts):
    bad = []
    for (x, z) in pts:
        # permukaan
        for (nm, ix) in SURF:
            cov = [a for a in covering_y(x, z, ix) if a[0] < 4.5]
            if cov: bad.append((zona, round(x,1), round(z,1), nm, cov[:2])); break
        else:
            for e in cari_bangunan(x, z):
                if e['file'] == '(prosedural)': continue
                ix = get_index(e['file']+str(e['x'])+str(e['z']),
                               world_tris(W+e['file'], e['x'], e['y'], e['z'], e['ry']))
                cov = [a for a in covering_y(x, z, ix) if a[0] < 4.5]
                if cov: bad.append((zona, round(x,1), round(z,1), e['label'], cov[:2])); break
    return bad

if __name__ == '__main__':
    # 1) validasi port: seed LIVE 20261040 harus sama persis dgn replay-veg-bersih.json
    # (R6 2026-11-09: replay-veg.json kini berisi 20261040 juga, dan validasi lama
    #  20261023 sudah tidak dapat direproduksi dari file itu — lih. USULAN-R6-KAMERA.md §D.3)
    ref = json.load(open('/home/hatch/workspace/lumina/audit/plan/replay-veg-bersih.json'))
    k, p, h, a = replay(20261040)
    def sama(A, B): return len(A) == len(B) and all(abs(a[0]-b[0]) < 1e-9 and abs(a[1]-b[1]) < 1e-9 for a, b in zip(A, B))
    print('validasi port seed 20261040:',
          'kota', sama(k, [tuple(v) for v in ref['kota']]),
          'padang', sama(p, [tuple(v) for v in ref['padang']]),
          'hutan', sama(h, [tuple(v) for v in ref['hutan']]),
          'awan-y', all(abs(a[1]-b[1]) < 1e-9 for a, b in zip(a, ref['awan'])))
    bad40 = pelanggaran('kota', k) + pelanggaran('padang', p) + pelanggaran('hutan', h)
    print(f'pelanggaran seed 20261040 (uji segitiga ketat): {len(bad40)}')
    for v in bad40:
        print('  ', v)
    if bad40:
        print('SEED LIVE 20261040 KOTOR — cari seed bersih baru:')
        # 2) scan seed (HANYA bila seed live kotor; baseline tidak ditimpa bila 20261040 bersih)
        for seed in range(20261024, 20261224):
            k, p, h, a = replay(seed)
            if len(k) != 30 or len(p) != 76 or len(h) != 254:
                print(f'seed {seed}: loop tak penuh ({len(k)}/{len(p)}/{len(h)})'); continue
            bad = pelanggaran('kota', k) + pelanggaran('padang', p) + pelanggaran('hutan', h)
            print(f'seed {seed}: pelanggaran nyata = {len(bad)}' + (f' {bad[:4]}' if bad else ''))
            if not bad:
                print(f'>>> SEED BERSIH: {seed}')
                json.dump({'seed': seed, 'kota': k, 'padang': p, 'hutan': h, 'awan': a},
                          open('/home/hatch/workspace/lumina/audit/plan/replay-veg-bersih.json', 'w'))
                break
    else:
        print('SEED LIVE 20261040 BERSIH — baseline tidak diubah.')
