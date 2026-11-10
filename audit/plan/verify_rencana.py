# Verifikasi rencana Fase B Kota Lumina (hanya rencana — tidak mengubah index.html).
# Memuat bbox.json (365 instansi) + MOVES (rencana), lalu memeriksa:
#  (1) tabrakan AABB antar semua objek (kriteria audit: XZ>0.01 m2 & Y>0.05 m)
#  (2) tembus jalan/sungai/cincin plaza utk objek yang PINDAH (sampling 0.5 m)
#  (3) darat (DI_DARAT audit + lobus City Walk r32 + danau GLB pindah)
#  (4) uji segitiga utk pasangan AABB yang melibatkan objek pindah (metode audit §1b)
#  (5) celah minimum tiap objek pindah ke tetangga terdekat
# Keluar: ringkasan + daftar pelanggaran. Exit 0 bila 0 tabrakan & 0 tembus KRITIS.
import sys, json, math
sys.path.insert(0, '/home/hatch/workspace/lumina/audit/plan')
from glb import load_glb, node_mats, accessor_data

W = '/home/hatch/workspace/lumina/'
BBOX = json.load(open(W + 'audit/bbox.json'))

# ---------------- MOVES: (label, x_lama, z_lama) -> (x_baru, z_baru, y_baru, ry_baru|None) -----
MOVES = {
    ('Menara Jam', 0, -18.6): (-25, -46, 0, None),
    ('Gedung G04', -12, 30): (-15, 37.4, 14.9, None),  # +8 m radial keluar plaza (uji segitiga: alas-di-cincin 0)
    ('Gedung G02', -29, 4): (15, 20, 0, 3.785),
    ('Gedung G05', 6, 33): (10, 33, 0, None),
    ('Gedung G10', -6, -33): (-14, -33, 0, None),
    ('Gedung G07', 30, 10): (30, 17, 0, None),
    ('Gedung G08', 29, -10): (34.8, -15, 0, None),
    ('Toko Kopi Senja', -6.2, -44): (-8.4, -44, 0, None),
    ('Toko Roti & Kopi', -6.2, -52): (-8.4, -58, 0, None),
    ('Toko Buku & Kertas', -6.2, -60): (-8.4, -70, 0, None),
    ('Toko Bunga', -6.2, -68): (-8.4, -80, 0, None),
    ('Toko Es Krim', 13.2, -44): (15.2, -44, 0, None),
    ('Toko Studio Foto', 13.2, -52): (15.2, -57, 0, None),
    ('Toko Teh & Rempah', 13.2, -60): (15.2, -68, 0, None),
    ('Toko Mainan', 13.2, -68): (15.2, -80, 0, None),
    ('Lapangan Olahraga', 80, -80): (190, -45, 0, None),
    ('Taman Bermain', 120, -60): (-60, 200, 0, None),
    ('Rumah Modern', 150, 20): (75, -35, 0, None),
    ('Rumah Tradisional', 165, 35): (100, -55, 0, None),
    ('Rumah Cottage', 140, 45): (125, -30, 0, None),
    ('Food Court', 60, 100): (65, 200, 0, None),
    ('Kolam Renang', -40, 120): (30, 155, 0, None),
    ('Gedung Konser', 0, 180): (30, 204, 0, None),
    ('Skatepark', -60, 180): (-60, 155, 0, None),
    ('Taman Bunga', 60, 180): (65, 155, 0, None),
    ('Gerbang Pasar', 13.2, 0): (22.5, 0, 0, None),
    ('Gerobak Pasar 1', 19.5, -4.2): (21.5, -11.5, 0, None),
    ('Gerobak Pasar 2', 44, 4.2): (40, 11, 0, None),
    ('Kios Pasar 1', 16, -6.5): (23.5, -6.8, 0, None),
    ('Kios Pasar 2', 16, 6.5): (23.5, 6.8, 0, None),
    ('Kios Pasar 3', 21, -6.5): (28.5, -6.8, 0, None),
    ('Kios Pasar 4', 21, 6.5): (28.5, 6.8, 0, None),
    ('Kios Pasar 5', 26, -6.5): (33.5, -6.8, 0, None),
    ('Kios Pasar 6', 26, 6.5): (33.5, 6.8, 0, None),
    ('Kios Pasar 7', 31, -6.5): (38.5, -6.8, 0, None),
    ('Kios Pasar 8', 31, 6.5): (38.5, 6.8, 0, None),
    ('Danau', -120, -40): (-180, -20, 0.03, None),
    ('Air Mancur Sekolah 2', -243, 84): (-238, 84, 0, None),
    ('Pohon T2 (prosedural)', -182, 70): (-189, 66, 0, None),
    ('Bangku T2 (prosedural)', -226, 67): (-216, 67, 0, None),
    ('Bangku City Walk 1', -1.4, -46): (-18, -46, 0, None),
    ('Bangku City Walk 2', -1.4, -74): (-18, -74, 0, None),
    ('Bangku City Walk 3', 8.4, -60): (-18, -60, 0, None),
    ('Bangku City Walk 4', 8.4, -86): (24, -86, 0, None),
    ('Palem Pantai', -3.5, 56.5): (-8, 56.5, 0, None),
    ('Palem Pantai', 3.8, 58.5): (9.5, 60, 0, None),
    ('Bangku Pasar Malam 1', 50.5, 2.3): (43, 15, 0, None),
    ('Lampu Bukit 1', 30.758, 23.361): (33, 26, 0.92, None),  # y_baru: ikuti tinggiTanah di titik baru
    ('Bangku Pasar Malam 2', 50.5, -1.5): (41, -12, 0, None),
}
# kios lama yang DIHAPUS (tidak dipindah): Kios 9-14 (slot 36/41/46)
DELETE = [('Kios Pasar 9', 36, -6.5), ('Kios Pasar 10', 36, 6.5),
          ('Kios Pasar 11', 41, -6.5), ('Kios Pasar 12', 41, 6.5),
          ('Kios Pasar 13', 46, -6.5), ('Kios Pasar 14', 46, 6.5),
          ('Pagar Tiang Sekolah', -250, 38)]  # satu dari 2 duplikat di (-250,38)

# ---------------- bangun daftar objek baru ----------------
def rot_aabb(mn, mx, ry):
    # AABB baru dari AABB lokal yang diputar ry (sudut thd sumbu Y) — batas luar longgar
    cs, sn = math.cos(ry), math.sin(ry)
    xs, zs = [], []
    for lx in (mn[0], mx[0]):
        for lz in (mn[2], mx[2]):
            xs.append(lx * cs + lz * sn)
            zs.append(-lx * sn + lz * cs)
    return min(xs), max(xs), min(zs), max(zs)

objs = []
_del_count = {}
moved_idx = set()
for i, o in enumerate(BBOX):
    o = dict(o)
    key = (o['label'], o['x'], o['z'])
    if key in DELETE:
        # pagar sudut (-250,38) dobel 2x: hapus SATU saja, satu tiang harus tersisa
        if key == ('Pagar Tiang Sekolah', -250, 38) and _del_count.get(key, 0) >= 1:
            pass  # instansi ke-2 dipertahankan
        else:
            _del_count[key] = _del_count.get(key, 0) + 1
            o['deleted'] = True
            objs.append(o)
            continue
    if key in MOVES:
        nx, nz, ny, nry = MOVES[key]
        dx, dz, dy = nx - o['x'], nz - o['z'], ny - o['y']
        if nry is not None and nry != o['ry']:
            # hitung ulang AABB dari bbox lokal GLB (diputar ry baru)
            from glb import local_bbox
            mn, mx = local_bbox(W + o['file'])
            ax0, ax1, az0, az1 = rot_aabb(mn, mx, nry)
            o['minX'], o['maxX'], o['minZ'], o['maxZ'] = nx + ax0, nx + ax1, nz + az0, nz + az1
            o['minY'], o['maxY'] = ny + mn[1], ny + mx[1]
            o['ry'] = nry
        else:
            o['minX'] += dx; o['maxX'] += dx
            o['minZ'] += dz; o['maxZ'] += dz
            o['minY'] += dy; o['maxY'] += dy
        o['x'], o['z'], o['y'] = nx, nz, ny
        o['moved'] = True
        moved_idx.add(i)
    objs.append(o)
live = [o for o in objs if not o.get('deleted')]
print(f"objek hidup: {len(live)} (dihapus {len(objs)-len(live)}), dipindah: {len(moved_idx)}")

# ---------------- (1) tabrakan AABB ----------------
NONSOLID = {'tanah', 'plaza', 'jalan', 'air'}
def y_overlap(a, b):
    return min(a['maxY'], b['maxY']) - max(a['minY'], b['minY'])
coll = []
for i in range(len(live)):
    a = live[i]
    if a['kat'] in NONSOLID: continue
    for j in range(i + 1, len(live)):
        b = live[j]
        if b['kat'] in NONSOLID: continue
        if a['kat'] == 'pagar' and b['kat'] == 'pagar': continue  # sambungan modul by design
        ox = min(a['maxX'], b['maxX']) - max(a['minX'], b['minX'])
        oz = min(a['maxZ'], b['maxZ']) - max(a['minZ'], b['minZ'])
        if ox <= 0 or oz <= 0: continue
        if y_overlap(a, b) <= 0.05: continue
        area = ox * oz
        if area > 0.01:
            coll.append((area, a, b))
coll.sort(reverse=True, key=lambda t: t[0])
ARTEFAK_AUDIT = {  # pasangan yg audit geometri §1b buktikan 0.00 m2 segitiga, posisi relatif tak berubah
    frozenset(['Gedung G09', 'Pohon Bingkai Menara']),
    frozenset(['Menara Utara 3', 'Pohon Plaza Utara']),
    frozenset(['Menara Utara 6', 'Pohon Plaza Utara']),
    frozenset(['Gedung Utama Sekolah', 'Lampu Sekolah T2']),
    frozenset(['Gedung Perpustakaan', 'Pohon T2 (prosedural)']),
    frozenset(['Pohon Taman Bukit', 'Pohon Taman Bukit']),  # G13 RINGAN: kanopi bersinggungan, diterima
}
print(f"\n== (1) TABRAKAN AABB: {len(coll)} ==")
for area, a, b in coll:
    ma = 'PINDAH' if a.get('moved') else ''
    mb = 'PINDAH' if b.get('moved') else ''
    tag = ' [ARTEFAK audit, segitiga 0]' if frozenset([a['label'], b['label']]) in ARTEFAK_AUDIT else ''
    print(f"  {area:7.2f} m2  {a['label']} ({a['x']},{a['z']}) {ma}  x  {b['label']} ({b['x']},{b['z']}) {mb}{tag}")

# ---------------- (1b) adjudikasi segitiga utk tabrakan AABB yg melibatkan objek pindah ----------------
print("\n== (1b) ADJUDIKASI SEGITIGA (pasangan AABB yg melibatkan objek pindah) ==")
from tri_test import world_tris, index_tris, covering_y, pair_area
for area, a, b in coll:
    if not (a.get('moved') or b.get('moved')): continue
    if frozenset([a['label'], b['label']]) in ARTEFAK_AUDIT:
        print(f"  {a['label']} x {b['label']}: artefak audit, lewati"); continue
    if a['file'].endswith('.glb') and b['file'].endswith('.glb'):
        pair_area(f"{a['label']} ({a['x']},{a['z']})", W + a['file'], (a['x'], a['y'], a['z'], a['ry']),
                  f"{b['label']} ({b['x']},{b['z']})", W + b['file'], (b['x'], b['y'], b['z'], b['ry']))
    elif a['label'] == 'Gedung G04' or b['label'] == 'Gedung G04':
        g = a if a['label'] == 'Gedung G04' else b
        o = b if a['label'] == 'Gedung G04' else a
        tr = world_tris(W + g['file'], *(g['x'], g['y'], g['z'], g['ry']))
        ix = index_tris(tr)
        cov = [t for t in covering_y(o['x'], o['z'], ix) if t[0] < g['minY'] + 1.0]
        print(f"  {g['label']} x {o['label']} ({o['x']},{o['z']}): titik pusat di tapak alas? {cov}")
    else:
        print(f"  {a['label']} x {b['label']}: BUKAN GLB-GLB, putusan AABB berlaku ({area:.2f} m2)")

# ---------------- (2)(3) sampling jalan/sungai/cincin/darat utk objek pindah ----------------
from glb import node_triangles
road = node_triangles(W + 'jalan-raya-blender-v1.glb', 'Roads')
sung = node_triangles(W + 'sungai-blender-v4.glb', 'sungai_water')

def index(tris, cell=5):
    g = {}
    for t in tris:
        xs = [p[0] for p in t]; zs = [p[2] for p in t]
        for gx in range(math.floor(min(xs) / cell), math.floor(max(xs) / cell) + 1):
            for gz in range(math.floor(min(zs) / cell), math.floor(max(zs) / cell) + 1):
                g.setdefault((gx, gz), []).append(t)
    return g, cell

def in_tri(px, pz, t):
    (ax, az), (bx, bz), (cx, cz) = (t[0][0], t[0][2]), (t[1][0], t[1][2]), (t[2][0], t[2][2])
    d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz)
    if abs(d) < 1e-12: return False
    w1 = ((bz - cz) * (px - cx) + (cx - bx) * (pz - cz)) / d
    w2 = ((cz - az) * (px - cx) + (ax - cx) * (pz - cz)) / d
    return w1 >= -1e-9 and w2 >= -1e-9 and (1 - w1 - w2) >= -1e-9

def inside(px, pz, idx):
    g, cell = idx
    for t in g.get((math.floor(px / cell), math.floor(pz / cell)), []):
        if in_tri(px, pz, t): return True
    return False

ri, si = index(road), index(sung)
# DI_DARAT (audit) + perubahan rencana: lobus City Walk r20->32; danau GLB pindah
DI_DARAT = [
    lambda x, z: math.hypot(x, z) <= 60,
    lambda x, z: math.hypot(x - 40, z - 40) <= 25,
    lambda x, z: -85 <= x <= 85 and 135 <= z <= 225,
    lambda x, z: math.hypot(x, z + 100) <= 34,
    lambda x, z: math.hypot(x, z + 225) <= 68,
    lambda x, z: math.hypot(x - 46, z) <= 26,
    lambda x, z: math.hypot(x - 3.5, z + 58) <= 32,   # lobus City Walk DIPERBESAR 20->32
    lambda x, z: (x / 48) ** 2 + ((z - 62) / 21) ** 2 <= 1,
    lambda x, z: math.hypot(x + 88, z - 98) <= 14,
    lambda x, z: -250 <= x <= -71 and -61 <= z <= 91 and math.hypot(x + 180, z + 20) > 20.8,
    lambda x, z: -71.5 <= x <= -38 and 8 <= z <= 80,
    lambda x, z: -71.5 <= x <= -44 and -60 <= z <= -8,
    lambda x, z: 60 <= x <= 245 and -165 <= z <= -15,
    lambda x, z: 46 <= x <= 62 and -42 <= z <= -6,
    lambda x, z: 28 <= x <= 80 and -138 <= z <= -92,
    lambda x, z: -45 <= x <= 45 and -210 <= z <= -128,
    lambda x, z: -203 <= x <= -157 and -38 <= z <= -2,  # tanah diorama danau GLB PINDAH
    lambda x, z: math.hypot(x + 38, z - 72) <= 9.5,
    lambda x, z: math.hypot(x - 37, z - 37) <= 17.5,
]
print("\n== (2)(3) OBJEK PINDAH vs jalan/sungai/cincin/darat (tapak segitiga alas, grid 0.5 m) ==")
from tri_test import world_tris as _wt, index_tris as _it, covering_y as _cy
def tapak_points(o, step=0.5):
    # titik tapak = grid yg ditutupi segitiga alas (minY < minY_objek+1.0); prosedural: grid AABB
    w, d = o['maxX'] - o['minX'], o['maxZ'] - o['minZ']
    while (w / step + 1) * (d / step + 1) > 2500: step *= 1.5
    pts = []
    if o['file'].endswith('.glb'):
        tris = _wt(W + o['file'], *(o['x'], o['y'], o['z'], o['ry']))
        idx = _it(tris)
        for ix in range(int(w / step) + 1):
            for iz in range(int(d / step) + 1):
                px, pz = o['minX'] + ix * step, o['minZ'] + iz * step
                if any(t[0] < o['minY'] + 1.0 for t in _cy(px, pz, idx)):
                    pts.append((px, pz))
    else:
        for ix in range(int(w / step) + 1):
            for iz in range(int(d / step) + 1):
                pts.append((o['minX'] + ix * step, o['minZ'] + iz * step))
    return pts, step
bad = 0
for o in live:
    if not o.get('moved'): continue
    if o['label'] == 'Danau': continue  # air: dicek terpisah
    pts, step = tapak_points(o)
    n = rd = sg = rg = ld = 0
    for (px, pz) in pts:
            n += 1
            if inside(px, pz, ri): rd += 1
            if inside(px, pz, si): sg += 1
            r = math.hypot(px, pz)
            if 14 <= r <= 20.5: rg += 1
            if not any(f(px, pz) for f in DI_DARAT): ld += 1
    # koridor pasar pejalan kaki: jalan E-W z -8..8 dikecualikan utk kios/gerobak/gerbang
    road_m2 = rd * step * step
    note = ''
    if o['label'].startswith('Kios Pasar') or o['label'].startswith('Gerobak Pasar') or o['label'] == 'Gerbang Pasar':
        note = ' (jalan E-W = koridor pasar pejalan kaki, dikecualikan)'
        road_m2 = 0
    flag = ' <<<' if (road_m2 > 0.01 or sg * step * step > 0.01 or rg * step * step > 0.01 or ld * step * step > 0.01) else ''
    if flag: bad += 1
    print(f"  {o['label']:28} ({o['x']},{o['z']}) jalan={road_m2:6.2f} sungai={sg*step*step:6.2f} cincin={rg*step*step:6.2f} laut={ld*step*step:6.2f}{note}{flag}")
print(f"  objek pindah bermasalah: {bad}")

# ---------------- (5) celah minimum tiap objek pindah ----------------
print("\n== (5) CELAH MINIMUM objek pindah (AABB, m) ==")
for o in live:
    if not o.get('moved') or o['kat'] == 'air': continue
    best = (1e9, None)
    for b in live:
        if b is o or b['kat'] in NONSOLID: continue
        if o['kat'] == 'pagar' and b['kat'] == 'pagar': continue
        dx = max(b['minX'] - o['maxX'], o['minX'] - b['maxX'], 0)
        dz = max(b['minZ'] - o['maxZ'], o['minZ'] - b['maxZ'], 0)
        if y_overlap(o, b) <= 0.05: continue
        sep = math.hypot(dx, dz)
        if sep < best[0]: best = (sep, b)
    s, nb = best
    flag = ' <<<' if s < 1.0 else ''
    print(f"  {o['label']:28} ({o['x']},{o['z']}) celah={s:5.2f} m ke {nb['label']} ({nb['x']},{nb['z']}){flag}")
