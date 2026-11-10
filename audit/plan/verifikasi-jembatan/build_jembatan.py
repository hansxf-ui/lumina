# Build jembatan datar Lumina — GLB jembatan-sungai-blender-v1.glb
# Sumbu Blender: X = arah jalan (timur-barat), Y = melintang sungai, Z = atas.
# Origin (0,0,0) = tengah permukaan deck. Deck atas Z=-0.05, 22 x 16 m.
# Semua bagian digabung jadi SATU mesh dg beberapa material slot (tanpa tekstur eksternal).
import bpy, math, mathutils, os

OUT_DIR = "/home/hatch/workspace/lumina/audit/plan/verifikasi-jembatan"
BLEND = os.path.join(OUT_DIR, "jembatan.blend")
GLB = "/home/hatch/workspace/lumina/jembatan-sungai-blender-v1.glb"

# --- scene bersih ---
bpy.ops.wm.read_factory_settings(use_empty=True)

def make_mat(name, color, rough=0.9, metal=0.0, emit=None, emit_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit is not None:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emit_strength
    return m

MAT_ASPAL  = make_mat("Aspal",  (0.13, 0.13, 0.14), rough=0.95)
MAT_ASPAL2 = make_mat("AspalGelap", (0.09, 0.09, 0.10), rough=0.95)
MAT_BETON  = make_mat("BetonTepi", (0.62, 0.58, 0.50), rough=0.85)
MAT_BATU   = make_mat("BatuAbutmen", (0.48, 0.43, 0.36), rough=0.95)
MAT_BATU2  = make_mat("BatuGelap", (0.36, 0.32, 0.27), rough=0.95)
MAT_MARKA  = make_mat("MarkaPutih", (0.92, 0.92, 0.88), rough=0.6)
MAT_KUNING = make_mat("MarkaKuning", (0.85, 0.65, 0.10), rough=0.6)
MAT_BESI   = make_mat("BesiPagar", (0.16, 0.20, 0.19), rough=0.45, metal=0.65)
MAT_LAMPU  = make_mat("LampuLogam", (0.10, 0.10, 0.11), rough=0.4, metal=0.7)
MAT_CAHAYA = make_mat("LampuNyala", (1.0, 0.85, 0.55), rough=0.3,
                      emit=(1.0, 0.75, 0.4), emit_strength=2.0)

def box(name, loc, dims, mat, rot_z=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.dimensions = dims
    o.rotation_euler[2] = rot_z
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    return o

def cyl(name, loc, radius, depth, mat, verts=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(mat)
    return o

parts = []

# ============ DECK ============
# Pelat utama: 22 x 16 x 0.6, permukaan atas Z=-0.05 -> pusat Z=-0.35
parts.append(box("Deck", (0, 0, -0.35), (22.0, 16.0, 0.6), MAT_ASPAL))
# Lapis aus tengah (nuansa aspal sedikit beda, 0.01 di bawah permukaan, tetap < 0)
parts.append(box("DeckTengah", (0, 0, -0.055), (22.0, 14.6, 0.02), MAT_ASPAL2))

# Marka jalan (tipis, puncak Z=-0.04 -> di bawah y=0 game, tidak menghalangi pemain)
# Garis tengah putus-putus kuning
for i in range(9):
    x = -10.0 + i * 2.5
    parts.append(box("MarkaTengah", (x, 0, -0.045), (1.4, 0.18, 0.01), MAT_KUNING))
# Garis tepi putih kontinu
for y in (-7.0, 7.0):
    parts.append(box("MarkaTepi", (0, y, -0.045), (22.0, 0.15, 0.01), MAT_MARKA))

# ============ BALOK TEPI (edge beam) ============
# Y=+-7.7, lebar 0.6 (Y 7.4..8.0), dari Z=-0.65 sampai +0.30 (tinggi 0.95)
for s in (-1, 1):
    parts.append(box("BalokTepi", (0, s*7.7, -0.175), (22.0, 0.6, 0.95), MAT_BETON))
    # Lis atas balok (sedikit menonjol ke dalam jalan, aksen batu muda)
    parts.append(box("LisTepi", (0, s*7.55, 0.28), (22.0, 0.25, 0.06), MAT_BATU2))

# ============ PAGAR ============
# Tiang vertikal tiap ~1.83 m di atas balok tepi (Z 0.30 -> 1.05), rel atas + rel tengah
for s in (-1, 1):
    y = s * 7.7
    for i in range(13):
        x = -11.0 + i * (22.0/12)
        parts.append(cyl("TiangPagar", (x, y, 0.675), 0.05, 0.75, MAT_BESI))
    parts.append(box("RelAtas", (0, y, 1.03), (22.0, 0.14, 0.10), MAT_BESI))
    parts.append(box("RelTengah", (0, y, 0.68), (22.0, 0.08, 0.08), MAT_BESI))
    # Panel bawah pagar (kisi tipis antara rel tengah dan balok, memberi kesan kokoh)
    parts.append(box("PanelBawah", (0, y, 0.47), (22.0, 0.05, 0.28), MAT_BESI))

# ============ LAMPU (4 tiang, di atas balok tepi) ============
for (x, s) in [(-7.0, -1), (-7.0, 1), (7.0, -1), (7.0, 1)]:
    y = s * 7.7
    parts.append(cyl("TiangLampu", (x, y, 1.65), 0.07, 2.7, MAT_LAMPU))
    # alas lampu
    parts.append(cyl("AlasLampu", (x, y, 0.38), 0.14, 0.16, MAT_LAMPU))
    # lengan melengkung ke arah jalan (kotak miring sederhana)
    parts.append(box("LenganLampu", (x, y - s*0.55, 2.95), (0.12, 1.15, 0.10), MAT_LAMPU))
    # kepala lampu + kaca menyala menghadap ke bawah/jalan
    parts.append(box("KepalaLampu", (x, y - s*1.05, 2.88), (0.55, 0.28, 0.12), MAT_LAMPU))
    parts.append(box("KacaLampu", (x, y - s*1.05, 2.81), (0.45, 0.20, 0.04), MAT_CAHAYA))

# ============ ABUTMEN BATU (kedua ujung, berundak turun ke air) ============
# Ujung +X dan -X, simetris. Tangga 3 undakan, lebar selebar deck (16 m).
for s in (1, -1):
    # Undakan 1: X 11..12.5, puncak -0.05 (sambung deck), dasar -1.2
    parts.append(box("Abutmen1", (s*11.75, 0, -0.625), (1.5, 16.0, 1.15), MAT_BATU))
    # Undakan 2: X 12.5..14, puncak -0.65, dasar -1.8
    parts.append(box("Abutmen2", (s*13.25, 0, -1.225), (1.5, 16.0, 1.15), MAT_BATU2))
    # Undakan 3: X 14..15.5, puncak -1.25, dasar -2.4 (masuk air/tanah)
    parts.append(box("Abutmen3", (s*14.75, 0, -1.825), (1.5, 16.0, 1.15), MAT_BATU))
    # Dinding sayap (wing wall) di tepi luar abutmen, menahan tanah tepi sungai
    for ys in (-1, 1):
        parts.append(box("SayapAbutmen", (s*12.6, ys*8.4, -0.9), (3.4, 0.8, 1.5), MAT_BATU2))

# ============ GABUNG jadi satu objek ============
bpy.ops.object.select_all(action='DESELECT')
for o in parts:
    o.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
jembatan = bpy.context.active_object
jembatan.name = "JembatanSungai"

# Join mewarisi location objek aktif (Deck, Z=-0.35): bake location ke mesh
# supaya origin (0,0,0) = tengah permukaan deck dan geometri di koordinat dunia.
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# --- simpan blend ---
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

# --- export GLB ---
bpy.ops.export_scene.gltf(filepath=GLB, export_format='GLB',
                          export_apply=True, export_yup=True)

# --- laporan build ---
import collections
mesh = jembatan.data
print("BUILD OK")
print("verts:", len(mesh.vertices), "tris:", len(mesh.polygons))
print("mats:", [m.name if m else None for m in mesh.materials])
bb = [jembatan.matrix_world @ mathutils.Vector(c) for c in jembatan.bound_box]
xs = [v.x for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
print("bbox X: %.2f..%.2f (%.2f m)" % (min(xs), max(xs), max(xs)-min(xs)))
print("bbox Y: %.2f..%.2f (%.2f m)" % (min(ys), max(ys), max(ys)-min(ys)))
print("bbox Z: %.2f..%.2f (%.2f m)" % (min(zs), max(zs), max(zs)-min(zs)))
print("glb bytes:", os.path.getsize(GLB))
