# Peta top-down rencana baru Fase B (SVG) — dari rencana.json + bbox.json + segitiga sungai.
# TIDAK mengubah index.html. Output: ~/workspace/lumina/audit/plan/peta-rencana-baru.svg
import sys, json, math
sys.path.insert(0, '/home/hatch/workspace/lumina/audit/plan')
from glb import node_triangles

W = '/home/hatch/workspace/lumina/'
BBOX = json.load(open(W + 'audit/bbox.json'))
REN = json.load(open(W + 'audit/plan/rencana.json'))

# terapkan pindah/hapus
newpos = {}
deleted = set()
for m in REN['pindah']:
    if m['x_baru'] is None:
        deleted.add((m['label'], m['x_lama'], m['z_lama']))
    else:
        newpos[(m['label'], m['x_lama'], m['z_lama'])] = (m['x_baru'], m['z_baru'])

X0, Z0, S = -260, -140, 2.0   # px = (x-X0)*S, py = (z-Z0)*S
Wpx, Hpx = int((250 - X0) * S), int((235 - Z0) * S)
def X(x): return (x - X0) * S
def Z(z): return (z - Z0) * S
def R(r): return r * S

# tepi sungai per z (dari segitiga sungai_water, sampling 1 m)
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
si = index(sung)
west, east = [], []
for z in range(-100, 116, 5):
    xs = [x for x in range(30, 70) if inside(x, z, si)]
    if xs:
        west.append((min(xs), z)); east.append((max(xs), z))
river_pts = west + east[::-1]
river_poly = ' '.join(f'{X(x):.0f},{Z(z):.0f}' for x, z in river_pts)

def circle(cx, cz, r, fill, stroke='none', sw=0, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return (f'<circle cx="{X(cx):.0f}" cy="{Z(cz):.0f}" r="{R(r):.0f}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}"{d}/>')
def rect(x0, z0, x1, z1, fill, stroke='none', sw=0, dash=None, op=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    o = f' opacity="{op}"' if op else ''
    return (f'<rect x="{X(x0):.0f}" y="{Z(z0):.0f}" width="{(x1-x0)*S:.0f}" height="{(z1-z0)*S:.0f}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}{o}/>')
import html as _html
def text(x, z, s, size=8, fill='#222', anchor='middle', weight=''):
    s = _html.escape(str(s))
    w = f' font-weight="{weight}"' if weight else ''
    return (f'<text x="{X(x):.0f}" y="{Z(z):.0f}" font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}" font-family="sans-serif"{w}>{s}</text>')

parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wpx}" height="{Hpx}" viewBox="0 0 {Wpx} {Hpx}">']
parts.append(f'<rect width="{Wpx}" height="{Hpx}" fill="#8ecae6"/>')  # laut
# daratan
parts.append(rect(-250, -61, -71, 91, '#a8c686'))        # Padang Barat
parts.append(rect(60, -165, 245, -15, '#8fb573'))       # Hutan Pinus
parts.append(rect(-85, 135, 85, 225, '#b5d99a'))        # Daratan Selatan
parts.append(rect(-71.5, 8, -38, 80, '#a8c686'))
parts.append(rect(-71.5, -60, -44, -8, '#a8c686'))
parts.append(rect(46, -42, 62, -6, '#a8c686'))
parts.append(rect(28, -138, 80, -92, '#a8c686'))
parts.append(rect(-45, -210, 45, -128, '#a8c686'))
parts.append(circle(-88, 98, 14, '#a8c686'))
parts.append(circle(0, 0, 60, '#b9d98a'))               # Pulau Utama
parts.append(circle(40, 40, 25, '#b9d98a'))
parts.append(circle(46, 0, 26, '#b9d98a'))
parts.append(circle(0, -100, 34, '#b9d98a'))
parts.append(circle(3.5, -58, 32, '#b9d98a', '#1d6fb8', 2, '6 3'))  # lobus CW BARU r32
parts.append(f'<ellipse cx="{X(0):.0f}" cy="{Z(62):.0f}" rx="{48*S:.0f}" ry="{21*S:.0f}" fill="#e8d9a0"/>')  # Pantai Selatan
# zona (tint transparan + label zona)
parts.append(rect(-16, -90, 24, -26, '#3a86ff', 'none', 0, None, 0.10))
parts.append(rect(10, -12, 55, 12, '#ff9f1c', 'none', 0, None, 0.15))
parts.append(rect(-250, 38, -170, 88, '#2ec4b6', 'none', 0, None, 0.12))
parts.append(rect(-85, 135, 85, 225, '#8338ec', 'none', 0, None, 0.08))
parts.append(text(4, -92, 'CITY WALK (lobus r32 BARU)', 9, '#1d4e89', 'middle', 'bold'))
parts.append(text(32, -14, 'PASAR (pejalan kaki)', 9, '#7a4a00', 'middle', 'bold'))
parts.append(text(-210, 36, 'SEKOLAH', 10, '#0b5e55', 'middle', 'bold'))
parts.append(text(0, 132, 'REKREASI SELATAN', 10, '#4a148c', 'middle', 'bold'))
parts.append(text(150, -92, 'HUTAN PINUS — rumah + lapangan (BARU)', 9, '#1e4d2b', 'middle', 'bold'))
# air
parts.append(f'<polygon points="{river_poly}" fill="#4a90d9"/>')
parts.append(text(46, -60, 'SUNGAI', 8, '#0b3d91', 'middle', 'bold'))
parts.append(circle(-180, -20, 20.8, '#4a90d9'))
parts.append(rect(-203, -38, -157, -2, '#4a90d9', '#0b3d91', 1.5, '4 2'))
parts.append(text(-180, -42, 'DANAU CERMIN + danau GLB (PINDAH)', 8, '#0b3d91', 'middle', 'bold'))
# jalan (kendaraan)
parts.append(rect(-4, -96, 4, -19, '#4a4e54'))
parts.append(rect(-4, 20, 4, 195, '#4a4e54'))
parts.append(rect(-122, -8, 54, 8, '#4a4e54'))
parts.append(rect(-52, 177, 52, 183, '#4a4e54'))
parts.append(rect(-90, -12, -86, 10, '#4a4e54'))
parts.append(f'<line x1="{X(0):.0f}" y1="{Z(20):.0f}" x2="{X(0):.0f}" y2="{Z(195):.0f}" stroke="#fff" stroke-width="1.5" stroke-dasharray="8 8"/>')
parts.append(text(0, -100, 'JALAN N-S', 8, '#fff', 'middle', 'bold'))
parts.append(text(-30, 176, 'JALAN SELATAN z 177-183', 8, '#fff', 'middle', 'bold'))
# plaza
parts.append(circle(0, 0, 20.5, '#c9a86a'))
parts.append(circle(0, 0, 14, '#e8dcc0'))
parts.append(text(0, 2, 'PLAZA', 9, '#5a4632', 'middle', 'bold'))

# objek: AABB baru (pindah = merah, tetap = abu-abu/hijau gelap)
moved_keys = set(newpos.keys())
for o in BBOX:
    key = (o['label'], o['x'], o['z'])
    if key in deleted: continue
    if o['kat'] in ('tanah', 'air', 'jalan', 'plaza'): continue
    if o.get('tampil') is False: continue
    if key in newpos:
        nx, nz = newpos[key]
        dx, dz = nx - o['x'], nz - o['z']
        x0, x1 = o['minX'] + dx, o['maxX'] + dx
        z0, z1 = o['minZ'] + dz, o['maxZ'] + dz
        fill, stroke = '#e63946', '#7f1d1d'
    else:
        x0, x1, z0, z1 = o['minX'], o['maxX'], o['minZ'], o['maxZ']
        fill, stroke = '#6c757d', '#343a40'
        if o['kat'] == 'pagar': continue  # 156 tiang: terlalu ramai, lewati
    parts.append(rect(x0, z0, x1, z1, fill, stroke, 0.7))
# label objek pindah (besar saja + kios/gerobak/bangku sebagai titik)
for m in REN['pindah']:
    if m['x_baru'] is None: continue
    lab = m['label']
    big = lab in ('Menara Jam', 'Gedung G04', 'Gedung G02', 'Gedung G05', 'Gedung G07', 'Gedung G08',
                  'Gedung G10', 'Lapangan Olahraga', 'Taman Bermain', 'Rumah Modern', 'Rumah Tradisional',
                  'Rumah Cottage', 'Food Court', 'Kolam Renang', 'Gedung Konser', 'Skatepark', 'Taman Bunga',
                  'Danau', 'Air Mancur Sekolah 2', 'Gerbang Pasar') or lab.startswith('Toko ')
    if big:
        parts.append(text(m['x_baru'], m['z_baru'], lab, 7.5, '#7f1d1d', 'middle', 'bold'))
# label landmark tetap
for lab, x, z in [('G01', -27, -14), ('G03', -24, 20), ('G06', -35, -32), ('G09', 20, -27),
                  ('Mercusuar', -38, 72), ('Dermaga Barat', -70, 0), ('Plaza Utara', 0, -105),
                  ('Perkemahan', 170, -90)]:
    parts.append(text(x, z, lab, 7.5, '#333', 'middle', ''))
# legenda + judul
parts.append(rect(-258, -138, -160, -118, '#ffffff', '#333', 1))
parts.append(rect(-256, -136, -248, -128, '#e63946', '#7f1d1d', 0.7))
parts.append(text(-246, -130, '= objek PINDAH (49)', 8, '#222', 'start'))
parts.append(rect(-256, -126, -248, -120, '#6c757d', '#343a40', 0.7))
parts.append(text(-246, -121, '= objek tetap', 8, '#222', 'start'))
parts.append(text(0, -138, 'KOTA LUMINA — PETA RENCANA BARU (Fase B, 2026-11-09) — merah = pindah, garis putus-putus = lobus City Walk r32 / danau GLB pindah', 10, '#10243e', 'middle', 'bold'))
parts.append(text(0, 232, 'Jalan E-W z -8..8 = KORIDOR PASAR PEJALAN KAKI (tanpa marka kendaraan) | Lapangan 84x56 -> Hutan Pinus (daratan selatan tidak muat) | Persilangan jalan-sungai z -5..0 tanpa jembatan = RISIKO TERBUKA (T4)', 8, '#10243e', 'middle', ''))
parts.append('</svg>')
open(W + 'audit/plan/peta-rencana-baru.svg', 'w').write('\n'.join(parts))
print(f"peta-rencana-baru.svg: {len(parts)} elemen, {Wpx}x{Hpx}")
