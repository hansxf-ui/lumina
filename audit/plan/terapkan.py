#!/usr/bin/env python3
"""Terapkan Fase C+D audit Lumina ke index.html (dari rencana.json + Bab 3).
Base MD5 harus 0083845b38b99c6d0f9544e5c732962f. Setiap penggantian dicek
exact-match (jumlah kemunculan harus sesuai) — gagal = berhenti, file tak ditulis.
Jalankan: python3 terapkan.py
"""
import hashlib, re, sys

P = '/home/hatch/workspace/lumina/index.html'
BASE_MD5 = '0083845b38b99c6d0f9544e5c732962f'

src = open(P, encoding='utf-8').read()
md5 = hashlib.md5(src.encode()).hexdigest()
assert md5 == BASE_MD5, f'Base MD5 beda: {md5} (harap {BASE_MD5}) — BERHENTI'
print('Base MD5 OK:', md5)

log = []
def rep(old, new, n=1, tag=''):
    global src
    c = src.count(old)
    assert c == n, f'[{tag}] kemunculan {c} != {n} untuk: {old[:90]!r}'
    src = src.replace(old, new)
    log.append(f'{tag}: OK ({n}x)')

def rep_re(pat, new, n=1, tag=''):
    global src
    c = len(re.findall(pat, src))
    assert c == n, f'[{tag}] regex kemunculan {c} != {n}: {pat[:90]}'
    src = re.sub(pat, new, src)
    log.append(f'{tag}: OK regex ({n}x)')

def del_iife(fname, tag):
    """Hapus blok `(function fname(){ ... })();` utuh (brace matching)."""
    global src
    start = src.find('(function ' + fname + '(')
    assert start >= 0, f'[{tag}] IIFE {fname} tidak ditemukan'
    i = src.find('{', start)
    depth = 0
    j = i
    while j < len(src):
        if src[j] == '{': depth += 1
        elif src[j] == '}':
            depth -= 1
            if depth == 0: break
        j += 1
    assert depth == 0, f'[{tag}] brace tidak seimbang di {fname}'
    # j menunjuk '}' penutup fungsi; blok berakhir di '})();' setelahnya
    end = src.find(')();', j)
    assert end >= 0, f'[{tag}] penutup IIFE {fname} tidak ditemukan'
    end += len(')();')
    # sertakan baris kosong/comment pendahulu? tidak — hapus blok saja, sisakan komentar penanda
    block = src[start:end]
    assert 'GLTFLoader' in block and 'air-mancur.glb' in block, f'[{tag}] blok {fname} bukan loader air-mancur.glb!'
    src = src[:start] + f'/* AUDIT 2026-11-09 (A4/B3a/F1): loader air-mancur.glb Hunyuan {fname} DIHAPUS — dimuat tapi tak terlihat; primitif tetap sebagai fallback */' + src[end:]
    log.append(f'{tag}: hapus IIFE {fname} ({len(block)} karakter)')

# ============================================================ 1. PINDAH (49)
# --- menara jam
rep('model.position.set(0, 0, -18.6);', 'model.position.set(-25, 0, -46);', tag='Menara Jam')
# --- G04 / G05 / G02 / G07 / G08 / G10
rep('model.position.set(-12, 0, 30);', 'model.position.set(-15, 14.9, 37.4);', tag='G04')
rep('model.position.set(6, 0, 33);', 'model.position.set(10, 0, 33);', tag='G05')
rep('model.rotation.y = 1.7079;', 'model.rotation.y = 3.785;', tag='G02 ry')
rep('model.position.set(-29, 0, 4);', 'model.position.set(15, 0, 20);', tag='G02')
rep('model.position.set(30, 0, 10);', 'model.position.set(30, 0, 17);', tag='G07')
rep('model.position.set(29, 0, -10);', 'model.position.set(34.8, 0, -15);', tag='G08')
rep('model.position.set(-6, 0, -33);', 'model.position.set(-14, 0, -33);', tag='G10')
# --- gerbang + gerobak + bangku pasar
rep('model.position.set(13.2, 0, 0);', 'model.position.set(22.5, 0, 0);', tag='Gerbang Pasar')
rep('buatGerobak(19.5, -4.2, 0.5);', 'buatGerobak(21.5, -11.5, 0.5);', tag='Gerobak 1')
rep('buatGerobak(44, 4.2, -2.2);', 'buatGerobak(40, 11, -2.2);', tag='Gerobak 2')
rep('buatBangkuF2(50.5, 2.3, Math.PI);', 'buatBangkuF2(43, 15, Math.PI);', tag='Bangku Pasar 1')
rep('buatBangkuF2(50.5, -1.5, 0);', 'buatBangkuF2(41, -12, 0);', tag='Bangku Pasar 2')
# --- bangku City Walk
rep('buatBangkuF2(-1.4, -46, Math.PI / 2);', 'buatBangkuF2(-18, -46, Math.PI / 2);', tag='Bangku CW1')
rep('buatBangkuF2(-1.4, -74, Math.PI / 2);', 'buatBangkuF2(-18, -74, Math.PI / 2);', tag='Bangku CW2')
rep('buatBangkuF2(8.4, -60, -Math.PI / 2);', 'buatBangkuF2(-18, -60, -Math.PI / 2);', tag='Bangku CW3')
rep('buatBangkuF2(8.4, -86, -Math.PI / 2);', 'buatBangkuF2(24, -86, -Math.PI / 2);', tag='Bangku CW4')
# --- toko (GLB; kode fallback tetap di posisi lama — hanya tampil bila GLB gagal)
rep("pasangTokoGLB('TOKO_KOPI_SENJA', 'kopi-senja-toko-blender-v1.glb', -6.2, -44, 1.5708, 1.7,",
    "pasangTokoGLB('TOKO_KOPI_SENJA', 'kopi-senja-toko-blender-v1.glb', -8.4, -44, 1.5708, 1.7,", tag='Toko Kopi')
rep("pasangTokoGLB('TOKO_BUKU_KERTAS', 'buku-kertas-toko-blender-v1.glb', -6.2, -60, 1.5708, 1.5,",
    "pasangTokoGLB('TOKO_BUKU_KERTAS', 'buku-kertas-toko-blender-v1.glb', -8.4, -70, 1.5708, 1.5,", tag='Toko Buku')
rep("pasangTokoGLB('TOKO_ES_KRIM', 'es-krim-toko-blender-v1.glb', 13.2, -44, -1.5708, 1.5,",
    "pasangTokoGLB('TOKO_ES_KRIM', 'es-krim-toko-blender-v1.glb', 15.2, -44, -1.5708, 1.5,", tag='Toko Es Krim')
rep("pasangTokoGLB('TOKO_STUDIO_FOTO', 'studio-foto-toko-blender-v1.glb', 13.2, -52, -1.5708, 1.5,",
    "pasangTokoGLB('TOKO_STUDIO_FOTO', 'studio-foto-toko-blender-v1.glb', 15.2, -57, -1.5708, 1.5,", tag='Toko Studio')
rep("pasangTokoGLB('TOKO_BUNGA', 'bunga-toko-blender-v1.glb', -6.2, -68, 1.5708, 1.0,",
    "pasangTokoGLB('TOKO_BUNGA', 'bunga-toko-blender-v1.glb', -8.4, -80, 1.5708, 1.0,", tag='Toko Bunga')
rep("pasangTokoGLB('TOKO_TEH_REMPAH', 'teh-rempah-toko-blender-v1.glb', 13.2, -60, -1.5708, 1.4,",
    "pasangTokoGLB('TOKO_TEH_REMPAH', 'teh-rempah-toko-blender-v1.glb', 15.2, -68, -1.5708, 1.4,", tag='Toko Teh')
rep("pasangTokoGLB('TOKO_MAINAN', 'mainan-toko-blender-v4.glb', 13.2, -68, -1.5708, 1.5,",
    "pasangTokoGLB('TOKO_MAINAN', 'mainan-toko-blender-v4.glb', 15.2, -80, -1.5708, 1.5,", tag='Toko Mainan')
rep('grup.position.set(-6.2, 0, -52);', 'grup.position.set(-8.4, 0, -58);', tag='Toko Roti')
# --- rekreasi selatan + timur
rep('model.position.set(80, 0, -80);', 'model.position.set(190, 0, -45);', tag='Lapangan')
rep('model.position.set(120, 0, -60);', 'model.position.set(-60, 0, 200);', tag='Taman Bermain')
rep("pasangRumahWarga('rumah-modern-v1.glb', 150, 20, 0.5);",
    "pasangRumahWarga('rumah-modern-v1.glb', 75, -35, 0.5);", tag='Rumah Modern')
rep("pasangRumahWarga('rumah-tradisional-v1.glb', 165, 35, -0.3);",
    "pasangRumahWarga('rumah-tradisional-v1.glb', 100, -55, -0.3);", tag='Rumah Tradisional')
rep("pasangRumahWarga('rumah-cottage-v1.glb', 140, 45, 0.8);",
    "pasangRumahWarga('rumah-cottage-v1.glb', 125, -30, 0.8);", tag='Rumah Cottage')
rep('model.position.set(60, 0, 100);', 'model.position.set(65, 0, 200);', tag='Food Court')
rep('model.position.set(-40, 0, 120);', 'model.position.set(30, 0, 155);', tag='Kolam Renang')
rep('model.position.set(-120, 0, -40);', 'model.position.set(-180, 0.03, -20);', tag='Danau')
rep('model.position.set(0, 0, 180);', 'model.position.set(30, 0, 204);', tag='Gedung Konser')
rep('model.position.set(-60, 0, 180);', 'model.position.set(-60, 0, 155);', tag='Skatepark')
rep('model.position.set(60, 0, 180);', 'model.position.set(65, 0, 155);', tag='Taman Bunga')
# --- sekolah / pantai
rep('mancur2.position.set(-243, 0, 84);', 'mancur2.position.set(-238, 0, 84);', tag='Mancur Sekolah 2 (grup primitif)')
rep('penabrak.push({ x:-243, z:84, r:2.5 });', 'penabrak.push({ x:-238, z:84, r:2.5 });', tag='Kollider Mancur 2')
rep('pohonT2(-232, 52); pohonT2(-224, 52); pohonT2(-178, 64); pohonT2(-182, 70);',
    'pohonT2(-232, 52); pohonT2(-224, 52); pohonT2(-178, 64); pohonT2(-189, 66);', tag='Pohon T2')
rep('bangkuT2(-226, 67, Math.PI / 2);', 'bangkuT2(-216, 67, Math.PI / 2);', tag='Bangku T2')
rep('palem(-3.5, 56.5, 2.6, 1.05);', 'palem(-8, 56.5, 2.6, 1.05);', tag='Palem 1')
rep('palem(3.8, 58.5, 0.4, 0.95);', 'palem(9.5, 60, 0.4, 0.95);', tag='Palem 2')
# --- lampu bukit 1 (posisi dari rumus BUKIT/LANDAI1 = (30.758, 23.361))
rep('lampuF2(BUKIT.x + Math.cos(LANDAI1) * 15, BUKIT.z + Math.sin(LANDAI1) * 15);',
    'lampuF2(33, 26);   /* AUDIT 2026-11-09: geser dari (30.76,23.36) — 0,25 m2 di tapak G07 baru */', tag='Lampu Bukit 1')

# ============================================================ 2. KOLLIDER ikut pindah
# posisi[] box kode G01-G10: hanya kollider yang dipakai (box dilewati) — x,z ikut GLB
rep("""  var posisi = [
    [-27, -14, 0.5], [-29, 4, 1.1], [-24, 20, 1.8], [-12, 30, 2.4], [6, 33, 3.0],
    [-35, -32, 0.35], [30, 10, 4.3], [29, -10, 5.0], [20, -27, 5.6], [-6, -33, 0.2]
  ];""",
"""  var posisi = [
    [-27, -14, 0.5], [15, 20, 3.785], [-24, 20, 1.8], [-15, 37.4, 2.4], [10, 33, 3.0],
    [-35, -32, 0.35], [30, 17, 4.3], [34.8, -15, 5.0], [20, -27, 5.6], [-14, -33, 0.2]
  ];   /* AUDIT 2026-11-09: kollider ikut GLB pindah (G02/G04/G05/G07/G08/G10) */""",
    tag='Kollider posisi[] G01-G10')
# menara jam: kollider pindah + kollider air mancur (0,0) dipertahankan berlabel benar
rep("penabrak.push({ x:0, z:0, r:4.0 });   /* clock tower 7x7m */",
    "penabrak.push({ x:-25, z:-46, r:4.0 });   /* AUDIT 2026-11-09: menara jam pindah ke (-25,-46) */\npenabrak.push({ x:0, z:0, r:4.0 });   /* air mancur plaza (0,0) */",
    tag='Kollider menara jam + mancur')

# ============================================================ 3. PERBAIKAN KODE (17)
# --- #1 lampu boulevard: rumus sisi pakai indeks loop
rep("""  var grupLampuJalan = [];
  var zl;
  for (zl = -28; zl >= -88; zl -= 12){
    var sisi = ((zl / 12) % 2 === 0) ? -1.2 : 8.2;""",
"""  var grupLampuJalan = [];
  var zl, _il;
  for (zl = -28, _il = 0; zl >= -88; zl -= 12, _il++){
    var sisi = (_il % 2 === 0) ? -1.2 : 8.2;   /* AUDIT 2026-11-09 (A5/F2): rumus lama tak pernah benar — semua 6 lampu di x=8,2 */""",
    tag='#1 lampu boulevard')
rep("/* lampu jalan dua baris bergantian sisi tiap ±12 m (pola lampu yang ada) */",
    "/* lampu jalan dua baris bergantian sisi tiap ±12 m (pola lampu yang ada; AUDIT 2026-11-09: rumus sisi kini indeks loop) */",
    tag='#1 komentar lampu')

# --- #2 filter kios: slot baru + footprint AABB G07/G08
rep("""  var penabrakAsli = penabrak.slice();
  var idxKios = 0;
  [16, 21, 26, 31, 36, 41, 46].forEach(function(sx){
    [-6.5, 6.5].forEach(function(sz){
      var tabrak = penabrakAsli.some(function(t){
        var dx = sx - t.x, dz = sz - t.z;
        return dx * dx + dz * dz < (t.r + 2.1) * (t.r + 2.1);
      });
      if (tabrak) return;
      buatKios(sx, sz, sz > 0 ? Math.PI : 0, idxKios++);
    });
  });""",
"""  var penabrakAsli = penabrak.slice();
  /* AUDIT 2026-11-09 (A6): slot baru x 23,5-38,5 z +-6,8; uji tabrakan pakai
     footprint AABB asli G07/G08 (posisi baru), bukan kollider lingkaran
     (r 3,95/4,65) yang menggugurkan slot bebas + meloloskan slot di sungai.
     AABB dari bbox dunia GLB: G07 (30,17) x 23,61..35,82 z 10,35..23,46;
     G08 (34,8,-15) x 29,92..39,22 z -19,58..-10,26. */
  var AABB_G07 = { x0:23.61, x1:35.82, z0:10.35, z1:23.46 };
  var AABB_G08 = { x0:29.92, x1:39.22, z0:-19.58, z1:-10.26 };
  function tabrakAABB(sx, sz, b){
    return sx + 2.1 > b.x0 && sx - 2.1 < b.x1 && sz + 2.1 > b.z0 && sz - 2.1 < b.z1;
  }
  var idxKios = 0;
  [23.5, 28.5, 33.5, 38.5].forEach(function(sx){
    [-6.8, 6.8].forEach(function(sz){
      var tabrak = penabrakAsli.some(function(t){
        if ((t.x === 30 && t.z === 17) || (t.x === 34.8 && t.z === -15)) return false; /* G07/G08: diuji AABB di bawah */
        var dx = sx - t.x, dz = sz - t.z;
        return dx * dx + dz * dz < (t.r + 2.1) * (t.r + 2.1);
      });
      if (tabrak || tabrakAABB(sx, sz, AABB_G07) || tabrakAABB(sx, sz, AABB_G08)) return;
      buatKios(sx, sz, sz > 0 ? Math.PI : 0, idxKios++);
    });
  });""",
    tag='#2 filter kios')

# --- #3 polygonOffset bertingkat (Y tidak diubah)
rep("""var plaza = new THREE.Mesh(
  new THREE.CircleGeometry(14, 44),
  new THREE.MeshLambertMaterial({ map: buatTeksturPlaza() })
);""",
"""var plaza = new THREE.Mesh(
  new THREE.CircleGeometry(14, 44),
  new THREE.MeshLambertMaterial({ map: buatTeksturPlaza(), polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 })
);""",
    tag='#3 plaza -2')
rep("""  new THREE.RingGeometry(14, 20.5, 44),
  new THREE.MeshLambertMaterial({ color:0x77664e })""",
"""  new THREE.RingGeometry(14, 20.5, 44),
  new THREE.MeshLambertMaterial({ color:0x77664e, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-1 })""",
    tag='#3 jalan lingkar -1')
rep("""  new THREE.RingGeometry(13.2, 14, 44),
  new THREE.MeshLambertMaterial({ color:0xa98f66 })""",
"""  new THREE.RingGeometry(13.2, 14, 44),
  new THREE.MeshLambertMaterial({ color:0xa98f66, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 })""",
    tag='#3 trotoar -3')
rep("var m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex }));",
    "var m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, polygonOffset:true, polygonOffsetFactor:0, polygonOffsetUnits:0 }));",
    tag='#3 setapak 0')
rep("var matGarisSk = new THREE.MeshBasicMaterial({ color:0xffffff });",
    "var matGarisSk = new THREE.MeshBasicMaterial({ color:0xffffff, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4 });",
    tag='#3 garis lapangan -4a')
rep("var matGaris2 = new THREE.MeshBasicMaterial({ color:0xffffff });",
    "var matGaris2 = new THREE.MeshBasicMaterial({ color:0xffffff, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4 });",
    tag='#3 garis lapangan -4b')
# lobus City Walk: bahan atas di-clone + polygonOffset (hindari z-fight dgn pulau utama y=0)
rep("""(function(){
  var lobusCityWalk = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 18, 2.4, 48),
    [bahanSisiPulau, bahanRumput, bahanSisiPulau]
  );""",
"""(function(){
  /* AUDIT 2026-11-09: lobus r 20->32 (deret toko z -80 butuh darat); bahan atas
     di-clone + polygonOffset -1 supaya tidak z-fight dengan pulau utama (y=0 sama) */
  var bahanRumputLobusCW = bahanRumput.clone();
  bahanRumputLobusCW.polygonOffset = true; bahanRumputLobusCW.polygonOffsetFactor = -1; bahanRumputLobusCW.polygonOffsetUnits = -1;
  var lobusCityWalk = new THREE.Mesh(
    new THREE.CylinderGeometry(32, 28.8, 2.4, 48),
    [bahanSisiPulau, bahanRumputLobusCW, bahanSisiPulau]
  );""",
    tag='#3+#11 lobus City Walk r32')

# --- #4 kaca toko depthWrite:false
rep("var matRkKaca    = new THREE.MeshLambertMaterial({ map:teksturKacaLembut(), transparent:true, opacity:0.55, emissive:0x7a4d16, emissiveIntensity:0 });",
    "var matRkKaca    = new THREE.MeshLambertMaterial({ map:teksturKacaLembut(), transparent:true, depthWrite:false, opacity:0.55, emissive:0x7a4d16, emissiveIntensity:0 });",
    tag='#4 matRkKaca depthWrite:false')

# --- #6 disiplin jarak vegetasi 200/220
rep("var target = z.mesh.visible ? (jauh <= 148) : (jauh <= 138);",
    "var target = z.mesh.visible ? (jauh <= 220) : (jauh <= 200);",
    tag='#6 ambang vegetasi 200/220')
rep("Zona yang pusatnya > ±140 m dari pemain disembunyikan (mesh + blob),",
    "Zona yang pusatnya > ±220 m dari pemain disembunyikan (mesh + blob),",
    tag='#6 komentar 220')
rep("dicek 2x/detik dengan histeresis tampil <=138 m / sembunyi >148 m agar",
    "dicek 2x/detik dengan histeresis tampil <=200 m / sembunyi >220 m agar",
    tag='#6 komentar histeresis')

# --- #8 material sungai DoubleSide (tanpa rebuild GLB)
rep("""      model.traverse(function(o){
        if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; }
        /* jembatan kayu lama DISEMBUNYIKAN — diganti jembatan batu v1 (2026-11-05, vonis Ryan "gas") */""",
"""      model.traverse(function(o){
        if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; }
        /* AUDIT 2026-11-09: 3.368 segitiga winding terbalik di sungai GLB — DoubleSide, tanpa rebuild GLB */
        if (o.isMesh && o.material){ (Array.isArray(o.material) ? o.material : [o.material]).forEach(function(mt){ mt.side = THREE.DoubleSide; }); }
        /* jembatan kayu lama DISEMBUNYIKAN — diganti jembatan batu v1 (2026-11-05, vonis Ryan "gas") */""",
    tag='#8 sungai DoubleSide')

# --- #9 hapus 3 loader air-mancur.glb Hunyuan (plaza, sekolah, mancur2)
del_iife('pasangMancurGLB', '#9 plaza')
del_iife('pasangMancurSekolahGLB', '#9 sekolah')
del_iife('pasangMancur2GLB', '#9 mancur2')

# --- #11 lobus City Walk dalamArea 19.5 -> 31.5
rep("if (Math.hypot(x - 3.5, z + 58) <= 19.5) return true; /* lobus City Walk: tanah deretan toko */",
    "if (Math.hypot(x - 3.5, z + 58) <= 31.5) return true; /* lobus City Walk: tanah deretan toko */",
    tag='#11 dalamArea lobus 31.5')

# --- #12 daratan selatan di dalamArea + #4 (R4) veto danau elips tapak GLB 46x36
rep("""  /* danau adalah air: veto untuk semua daratan padang di bawah ini */
  if (Math.hypot(x + 180, z + 20) > 20.8){""",
"""  /* danau adalah air: veto untuk semua daratan padang di bawah ini.
     AUDIT 2026-11-09 (R4): veto disesuaikan tapak GLB danau baru 46x36
     (elips half 23x18 di (-180,-20); dulu lingkaran r 20,8) */
  var _dl = ((x + 180) / 23) * ((x + 180) / 23) + ((z + 20) / 18) * ((z + 20) / 18);
  if (_dl > 1){""",
    tag='R4 veto danau elips')
rep("""    if (Math.hypot(x - GUNUNG.x, z - GUNUNG.z) <= 56.5) return true; /* cakram Gunung Awan */
  }
  return false;
}""",
"""    if (Math.hypot(x - GUNUNG.x, z - GUNUNG.z) <= 56.5) return true; /* cakram Gunung Awan */
  }
  /* AUDIT 2026-11-09 (TB2): daratan selatan rekreasi x -85..85, z 135..225 */
  if (x >= -85 && x <= 85 && z >= 135 && z <= 225) return true;
  return false;
}""",
    tag='#12 daratan selatan')

# --- #13 komentar basi
rep("Skala seragam\n     10.0: tinggi 8.05 m (kode 8.7)",
    "Skala 1.0 (ukuran dari GLB): tinggi 8.05 m (kode 8.7)", tag='#13 G01 skala')
rep("Skala seragam 15.45 dari tinggi: tinggi 17.40 m",
    "Skala 1.0 (ukuran dari GLB): tinggi 17.40 m", tag='#13 G04 skala')
rep("""tapi setengah-diagonal 3.98 m < collider
     r 4.65, jadi NOL tonjolan sudut, tidak seperti G02/G03/G10;""",
"""tapi setengah-diagonal 3.98 m < collider lingkaran lama
     r 4.65 (AUDIT 2026-11-09: filter kios kini pakai footprint AABB asli, bukan lingkaran), jadi NOL tonjolan sudut, tidak seperti G02/G03/G10;""",
    tag='#13 G08 kollider')
rep("""setengah-diagonal 5.15 m vs collider
     r 3.95 (sudut menonjol 1.20 m dari collider, di antara preseden""",
"""setengah-diagonal 5.15 m vs collider lingkaran lama
     r 3.95 (AUDIT 2026-11-09: filter kios kini pakai footprint AABB asli, bukan lingkaran) (sudut menonjol 1.20 m dari collider, di antara preseden""",
    tag='#13 G07 kollider')
rep("Skala seragam 1,76 (ikut panjang, tanpa distorsi):",
    "Skala 1,0 di kode (setScalar(1.0); AUDIT 2026-11-09: klaim lama '1,76' basi, angka turunan di bawah memakai skala lama):",
    tag='#13 gerobak skala')
rep("Skala seragam 2,1593 (ikut tinggi, tanpa distorsi):",
    "Skala 1,0 di kode (setScalar(1.0); AUDIT 2026-11-09: klaim lama '2,1593' basi, angka turunan di bawah memakai skala lama):",
    tag='#13 gerobak es krim skala')

# --- #14 dedup tiang pagar (pagarModulSk)
rep("""  var grupPagarModul = [];   /* grup posisi menunggu template GLB */
  var modelPagarModul = null;""",
"""  var grupPagarModul = [];   /* grup posisi menunggu template GLB */
  var modelPagarModul = null;
  var _tiangPagarSudah = {};   /* AUDIT 2026-11-09 (D1): dedup tiang sudut (-250,38) */""",
    tag='#14 var dedup pagar')
rep("""    for (var k = 0; k < n; k++){
      var px = x1 + ux * len * k / n, pz = z1 + uz * len * k / n;
      var g = new THREE.Group();""",
"""    for (var k = 0; k < n; k++){
      var px = x1 + ux * len * k / n, pz = z1 + uz * len * k / n;
      var _kunciTiang = px.toFixed(2) + ',' + pz.toFixed(2);
      if (_tiangPagarSudah[_kunciTiang]) continue;   /* tiang sudut sudah dipasang segmen sebelumnya */
      _tiangPagarSudah[_kunciTiang] = true;
      var g = new THREE.Group();""",
    tag='#14 dedup tiang')

# --- #15 RUTE_DANAU + spur ke 3 rumah
rep("var RUTE_DANAU = [[-84, 32], [-108, 16], [-128, -2], [-146, -14], [-155.5, -17.5]];",
    "var RUTE_DANAU = [[-84, 32], [-108, 16], [-128, -2], [-146, -14], [-155.5, -17.5], [-159, -18]];   /* AUDIT 2026-11-09: perpanjang 3 m ke tepi danau GLB baru */",
    tag='#15 RUTE_DANAU')
rep("""jalanRute5(RUTE_GUNUNG, 3);""",
"""jalanRute5(RUTE_GUNUNG, 3);
jalanRute5([[84.1, -22.2], [75, -35]], 3);   /* AUDIT 2026-11-09: spur ke Rumah Modern */
jalanRute5([[110.1, -40.8], [100, -55]], 3);   /* AUDIT 2026-11-09: spur ke Rumah Tradisional */
jalanRute5([[114.9, -44.2], [125, -30]], 3);   /* AUDIT 2026-11-09: spur ke Rumah Cottage */""",
    tag='#15 spur rumah')

# --- #16 hapus airDanau shader + cincin pasir
rep("""(function danauCermin(){
  var airDanau = createWater(THREE, { size: [44, 44], segments: [44, 44], y: -0.12 });
  airDanau.mesh.position.set(-180, -0.12, -20);
  airDanau.mesh.rotation.y = 0;
  scene.add(airDanau.mesh);
  daftarAirShader.push(airDanau);
  var pasir = new THREE.Mesh(new THREE.RingGeometry(20.3, 25.2, 40),
    new THREE.MeshLambertMaterial({ color:0xdcc48f }));
  pasir.rotation.x = -Math.PI / 2;
  pasir.position.set(-180, 0.012, -20);
  pasir.receiveShadow = true;
  scene.add(pasir);""",
"""(function danauCermin(){
  /* AUDIT 2026-11-09 (F7): airDanau shader + cincin pasir DIHAPUS — air & pasir
     digantikan danau GLB yang pindah ke (-180,-20); shader lama terkubur di
     bawah Padang Barat (tak terlihat) + hemat 1 shader update/frame. */""",
    tag='#16 hapus airDanau + pasir')

# ============================================================ 4. RNG SEEDED (#7)
# Aliran TERPISAH dari acakAset() (seed sama 20261023, state sendiri):
# memakai acakAset() langsung akan menggeser konsumsi downstream (replay POHON_DET
# audit + v/ry semua pohon deterministik berubah). acakVeg menjaga keduanya tetap.
rep("""function catatPohon(x, y, z, ry, s, zona, tanpaTabrak){""",
"""var _rngVeg = 20261023;   /* AUDIT 2026-11-09: aliran TERPISAH dari _rngAset — acakAset() tidak boleh bergeser (replay POHON_DET + v/ry pohon deterministik tetap sama) */
function acakVeg(){ /* mulberry32, seed 20261023, state terpisah — untuk penempatan vegetasi/awan */
  _rngVeg |= 0; _rngVeg = _rngVeg + 0x6D2B79F5 | 0;
  var t = Math.imul(_rngVeg ^ _rngVeg >>> 15, 1 | _rngVeg);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function catatPohon(x, y, z, ry, s, zona, tanpaTabrak){""",
    tag='#7 acakVeg')

def ganti_random_dalam(anchor_start, anchor_end, tag):
    """Ganti semua Math.random() -> acakVeg() di antara dua anchor (inklusif)."""
    global src
    a = src.find(anchor_start)
    assert a >= 0, f'[{tag}] anchor awal tidak ditemukan: {anchor_start[:60]}'
    b = src.find(anchor_end, a)
    assert b >= 0, f'[{tag}] anchor akhir tidak ditemukan: {anchor_end[:60]}'
    b += len(anchor_end)
    seg = src[a:b]
    n = seg.count('Math.random()')
    assert n > 0, f'[{tag}] tidak ada Math.random() di segmen'
    src = src[:a] + seg.replace('Math.random()', 'acakVeg()') + src[b:]
    log.append(f'{tag}: Math.random()->acakVeg() {n}x')

# pohon kota (loop ~1771-1795)
ganti_random_dalam("  while (jadi < 30 && coba < 300){",
                  "    if (jadi % 3 === 2) catatPinus(px, 0, pz, ry, s * reg * 1.111, 'kota');",
                  '#7 pohon kota')
# zona larangan tambahan di loop pohon kota (setelah uji nabrak)
rep("""    var nabrak = terlarang.some(function(t){ var dx = px-t.x, dz = pz-t.z; return dx*dx + dz*dz < (t.r + 1.6)*(t.r + 1.6); });
    if (nabrak) continue;""",
"""    var nabrak = terlarang.some(function(t){ var dx = px-t.x, dz = pz-t.z; return dx*dx + dz*dz < (t.r + 1.6)*(t.r + 1.6); });
    if (nabrak) continue;
    /* AUDIT 2026-11-09 (A18): zona larangan — slot kios baru (filter kios: r pohon + 2,1 m, pakai 3,2 m aman) + jalan-raya */
    if ([23.5, 28.5, 33.5, 38.5].some(function(sx){ return [-6.8, 6.8].some(function(sz){ return Math.hypot(px - sx, pz - sz) < 3.2; }); })) continue;
    if (Math.abs(px) <= 4 && pz >= -96 && pz <= 195) continue;   /* jalan-raya N-S */
    if (Math.abs(pz) <= 8 && px >= -122 && px <= 54) continue;   /* jalan-raya E-W */""",
    tag='#7 zona larangan kota')
# pepohonan padang (IIFE pohonPadang)
ganti_random_dalam("(function pohonPadang(){",
                  "  /* rumpun bunga warna-warni instanced */",
                  '#7 padang')
rep("""    if (jarakRute5(x, z, RUTE_SEMUA) < 3.6) continue;""",
"""    if (jarakRute5(x, z, RUTE_SEMUA) < 3.6) continue;
    if (z >= -12 && z <= 0 && x >= -122 && x <= -86) continue;   /* AUDIT: jalan-raya barat E-W */""",
    tag='#7 zona larangan padang')
# hutan pinus (IIFE hutanPinus)
ganti_random_dalam("(function hutanPinus(){",
                  "})();\n\n/* ----- Perkemahan:",
                  '#7 hutan pinus')
rep("""    if (jarakRute5(x, z, RUTE_HUTAN) < 3.6) continue;""",
"""    if (jarakRute5(x, z, RUTE_HUTAN) < 3.6) continue;
    /* AUDIT 2026-11-09 (A18): kosongkan tapak Lapangan (190,-45) + 3 rumah (+2 m) */
    if (x >= 146 && x <= 234 && z >= -75 && z <= -15) continue;
    if (x >= 65.2 && x <= 84.8 && z >= -45.3 && z <= -24.7) continue;   /* Rumah Modern */
    if (x >= 90.3 && x <= 109.7 && z >= -63.6 && z <= -46.4) continue;   /* Rumah Tradisional */
    if (x >= 114.1 && x <= 135.9 && z >= -40.8 && z <= -19.2) continue;   /* Rumah Cottage */""",
    tag='#7 zona larangan hutan')
# awan (loop tempat 9 awan)
ganti_random_dalam("""  for (i=0; i<9; i++){
    var a2 = Math.random() * Math.PI * 2, r2 = 120 + Math.random() * 160;""",
                  """      lebar: 34 + Math.random() * 30, kecepatan: 0.35 + Math.random() * 0.5""",
                  '#7 awan')

open(P, 'w', encoding='utf-8').write(src)
print(f'\n{len(log)} perubahan diterapkan:')
for l in log:
    print(' -', l)
print('MD5 baru:', hashlib.md5(src.encode()).hexdigest())
print('Baris baru:', src.count(chr(10)) + 1)
