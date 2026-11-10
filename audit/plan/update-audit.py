#!/usr/bin/env python3
"""Update inventory audit-geometri.mjs ke posisi paska-audit Fase C+D (2026-11-09).
Skrip audit meng-hardcode penempatan; tanpa update ini, re-run mengukur posisi LAMA.
Tidak mengubah logika ukur — hanya data penempatan + narasi yang sudah basi.
"""
P = '/home/hatch/workspace/lumina/audit/audit-geometri.mjs'
src = open(P, encoding='utf-8').read()
log = []
def rep(old, new, n=1, tag=''):
    global src
    c = src.count(old)
    assert c == n, f'[{tag}] kemunculan {c} != {n}: {old[:100]!r}'
    src = src.replace(old, new)
    log.append(f'{tag}: OK')

# --- header: catat ini re-run paska-audit
rep("// Sumber penempatan: ~/workspace/lumina/index.html (8256 baris,\n//   MD5 0083845b38b99c6d0f9544e5c732962f — dicek di awal, batal bila beda).",
    "// Sumber penempatan: ~/workspace/lumina/index.html — RE-RUN PASKA-AUDIT Fase C+D\n//   (2026-11-09; MD5 baru 7dd94c422c5f8f5f0b0d34aa5940713e; inventory di bawah\n//   diperbarui ke posisi baru rencana.json; MD5 lama hanya acuan Fase A).",
    tag='header')

# --- GLB tunggal
rep("add('menara-jam-blender-v1.glb', 'Menara Jam', 'menara', 0, 0, -18.6, 0, 1, 975);",
    "add('menara-jam-blender-v1.glb', 'Menara Jam', 'menara', -25, 0, -46, 0, 1, 975);", tag='Menara Jam')
rep("add('gedung-g04-blender-v2.glb', 'Gedung G04', 'gedung', -12, 0, 30, 2.761 + Math.PI, 1, 1464);",
    "add('gedung-g04-blender-v2.glb', 'Gedung G04', 'gedung', -15, 14.9, 37.4, 2.761 + Math.PI, 1, 1464);", tag='G04')
rep("add('gedung-g05-blender-v2.glb', 'Gedung G05', 'gedung', 6, 0, 33, 0.1797, 1, 1499);",
    "add('gedung-g05-blender-v2.glb', 'Gedung G05', 'gedung', 10, 0, 33, 0.1797, 1, 1499);", tag='G05')
rep("add('gedung-g02-blender-v3.glb', 'Gedung G02', 'gedung', -29, 0, 4, 1.7079, 1, 1566);",
    "add('gedung-g02-blender-v3.glb', 'Gedung G02', 'gedung', 15, 0, 20, 3.785, 1, 1566);", tag='G02')
rep("add('gedung-g10-blender-v2.glb', 'Gedung G10', 'gedung', -6, 0, -33, 3.3215, 1, 1643);",
    "add('gedung-g10-blender-v2.glb', 'Gedung G10', 'gedung', -14, 0, -33, 3.3215, 1, 1643);", tag='G10')
rep("add('gedung-g08-blender-v2.glb', 'Gedung G08', 'gedung', 29, 0, -10, 1.9029, 1, 1679);",
    "add('gedung-g08-blender-v2.glb', 'Gedung G08', 'gedung', 34.8, 0, -15, 1.9029, 1, 1679);", tag='G08')
rep("add('gedung-g07-blender-v2.glb', 'Gedung G07', 'gedung', 30, 0, 10, 1.2491, 1, 1718);",
    "add('gedung-g07-blender-v2.glb', 'Gedung G07', 'gedung', 30, 0, 17, 1.2491, 1, 1718);", tag='G07')
rep("add('gerbang-pasar-blender-v1.glb', 'Gerbang Pasar', 'pasar', 13.2, 0, 0, Math.PI / 2, 1, 2643);",
    "add('gerbang-pasar-blender-v1.glb', 'Gerbang Pasar', 'pasar', 22.5, 0, 0, Math.PI / 2, 1, 2643);", tag='Gerbang')
rep("add('gerobak-blender-v1.glb', 'Gerobak Pasar 1', 'pasar', 19.5, 0, -4.2, 0.5, 1, 2848, { mry: -Math.PI / 2, note: 'komentar baris 2818 klaim skala 1,76 — kode setScalar(1.0)' });",
    "add('gerobak-blender-v1.glb', 'Gerobak Pasar 1', 'pasar', 21.5, 0, -11.5, 0.5, 1, 2848, { mry: -Math.PI / 2, note: 'komentar baris 2818 klaim skala 1,76 — kode setScalar(1.0)' });", tag='Gerobak 1')
rep("add('gerobak-blender-v1.glb', 'Gerobak Pasar 2', 'pasar', 44, 0, 4.2, -2.2, 1, 2848, { mry: -Math.PI / 2, note: 'komentar baris 2818 klaim skala 1,76 — kode setScalar(1.0)' });",
    "add('gerobak-blender-v1.glb', 'Gerobak Pasar 2', 'pasar', 40, 0, 11, -2.2, 1, 2848, { mry: -Math.PI / 2, note: 'komentar baris 2818 klaim skala 1,76 — kode setScalar(1.0)' });", tag='Gerobak 2')
# toko
rep("add('roti-kopi-toko-blender-v1.glb', 'Toko Roti & Kopi', 'toko', -6.2, 0, -52, Math.PI / 2, 1.6, 3550, { ox: 0.0073, oy: -0.0005, oz: 0.3833 });",
    "add('roti-kopi-toko-blender-v1.glb', 'Toko Roti & Kopi', 'toko', -8.4, 0, -58, Math.PI / 2, 1.6, 3550, { ox: 0.0073, oy: -0.0005, oz: 0.3833 });", tag='Toko Roti')
rep("add('kopi-senja-toko-blender-v1.glb', 'Toko Kopi Senja', 'toko', -6.2, 0, -44, 1.5708, 1.7, 3630);",
    "add('kopi-senja-toko-blender-v1.glb', 'Toko Kopi Senja', 'toko', -8.4, 0, -44, 1.5708, 1.7, 3630);", tag='Toko Kopi')
rep("add('buku-kertas-toko-blender-v1.glb', 'Toko Buku & Kertas', 'toko', -6.2, 0, -60, 1.5708, 1.5, 3632);",
    "add('buku-kertas-toko-blender-v1.glb', 'Toko Buku & Kertas', 'toko', -8.4, 0, -70, 1.5708, 1.5, 3632);", tag='Toko Buku')
rep("add('es-krim-toko-blender-v1.glb', 'Toko Es Krim', 'toko', 13.2, 0, -44, -1.5708, 1.5, 3634);",
    "add('es-krim-toko-blender-v1.glb', 'Toko Es Krim', 'toko', 15.2, 0, -44, -1.5708, 1.5, 3634);", tag='Toko Es Krim')
rep("add('studio-foto-toko-blender-v1.glb', 'Toko Studio Foto', 'toko', 13.2, 0, -52, -1.5708, 1.5, 3636);",
    "add('studio-foto-toko-blender-v1.glb', 'Toko Studio Foto', 'toko', 15.2, 0, -57, -1.5708, 1.5, 3636);", tag='Toko Studio')
rep("add('bunga-toko-blender-v1.glb', 'Toko Bunga', 'toko', -6.2, 0, -68, 1.5708, 1.0, 3640);",
    "add('bunga-toko-blender-v1.glb', 'Toko Bunga', 'toko', -8.4, 0, -80, 1.5708, 1.0, 3640);", tag='Toko Bunga')
rep("add('teh-rempah-toko-blender-v1.glb', 'Toko Teh & Rempah', 'toko', 13.2, 0, -60, -1.5708, 1.4, 3642);",
    "add('teh-rempah-toko-blender-v1.glb', 'Toko Teh & Rempah', 'toko', 15.2, 0, -68, -1.5708, 1.4, 3642);", tag='Toko Teh')
rep("add('mainan-toko-blender-v4.glb', 'Toko Mainan', 'toko', 13.2, 0, -68, -1.5708, 1.5, 3644);",
    "add('mainan-toko-blender-v4.glb', 'Toko Mainan', 'toko', 15.2, 0, -80, -1.5708, 1.5, 3644);", tag='Toko Mainan')
# loader Hunyuan yang dihapus — keluarkan dari inventory (primitif tetap, bukan GLB)
rep("add('air-mancur.glb', 'Air Mancur Sekolah', 'air', -205, 0, 60, 0, 4.4 / 3.05, 4888);\n",
    "/* AUDIT 2026-11-09: loader air-mancur.glb sekolah DIHAPUS (Fase C+D) — entri dibuang */\n", tag='Hapus Mancur Sekolah')
rep("add('air-mancur.glb', 'Air Mancur Sekolah 2', 'air', -243, 0, 84, 0, 4.4 / 3.05 * 1.1, 5338);\n",
    "/* AUDIT 2026-11-09: loader air-mancur.glb mancur2 DIHAPUS (Fase C+D); primitif pindah ke (-238,84) — entri dibuang */\n", tag='Hapus Mancur 2')
# rekreasi
rep("add('lapangan-olahraga-blender-v1.glb', 'Lapangan Olahraga', 'rekreasi', 80, 0, -80, 0, 1, 7989);",
    "add('lapangan-olahraga-blender-v1.glb', 'Lapangan Olahraga', 'rekreasi', 190, 0, -45, 0, 1, 7989);", tag='Lapangan')
rep("add('taman-bermain-blender-v1.glb', 'Taman Bermain', 'rekreasi', 120, 0, -60, 0, 1, 8010);",
    "add('taman-bermain-blender-v1.glb', 'Taman Bermain', 'rekreasi', -60, 0, 200, 0, 1, 8010);", tag='Taman Bermain')
rep("add('rumah-modern-v1.glb', 'Rumah Modern', 'rumah', 150, 0, 20, 0.5, 1, 8045);",
    "add('rumah-modern-v1.glb', 'Rumah Modern', 'rumah', 75, 0, -35, 0.5, 1, 8045);", tag='Rumah Modern')
rep("add('rumah-tradisional-v1.glb', 'Rumah Tradisional', 'rumah', 165, 0, 35, -0.3, 1, 8046);",
    "add('rumah-tradisional-v1.glb', 'Rumah Tradisional', 'rumah', 100, 0, -55, -0.3, 1, 8046);", tag='Rumah Tradisional')
rep("add('rumah-cottage-v1.glb', 'Rumah Cottage', 'rumah', 140, 0, 45, 0.8, 1, 8047);",
    "add('rumah-cottage-v1.glb', 'Rumah Cottage', 'rumah', 125, 0, -30, 0.8, 1, 8047);", tag='Rumah Cottage')
rep("add('foodcourt-blender-v1.glb', 'Food Court', 'rekreasi', 60, 0, 100, 0, 1, 8056);",
    "add('foodcourt-blender-v1.glb', 'Food Court', 'rekreasi', 65, 0, 200, 0, 1, 8056);", tag='Food Court')
rep("add('kolam-renang-blender-v1.glb', 'Kolam Renang', 'air', -40, 0, 120, 0, 1, 8077);",
    "add('kolam-renang-blender-v1.glb', 'Kolam Renang', 'air', 30, 0, 155, 0, 1, 8077);", tag='Kolam')
rep("add('danau-blender-v1.glb', 'Danau', 'air', -120, 0, -40, 0, 1, 8104);",
    "add('danau-blender-v1.glb', 'Danau', 'air', -180, 0.03, -20, 0, 1, 8104);", tag='Danau')
rep("add('gedung-konser-blender-v1.glb', 'Gedung Konser', 'gedung', 0, 0, 180, 0, 1, 8145);",
    "add('gedung-konser-blender-v1.glb', 'Gedung Konser', 'gedung', 30, 0, 204, 0, 1, 8145);", tag='Konser')
rep("add('skatepark-blender-v1.glb', 'Skatepark', 'rekreasi', -60, 0, 180, 0, 1, 8177);",
    "add('skatepark-blender-v1.glb', 'Skatepark', 'rekreasi', -60, 0, 155, 0, 1, 8177);", tag='Skatepark')
rep("add('taman-bunga-blender-v1.glb', 'Taman Bunga', 'rekreasi', 60, 0, 180, 0, 1, 8209);",
    "add('taman-bunga-blender-v1.glb', 'Taman Bunga', 'rekreasi', 65, 0, 155, 0, 1, 8209);", tag='Taman Bunga')
# kios: 14 slot lama -> 8 slot baru
rep("""// --- kios pasar (14 nominal; baris 2798-2804: sx 16..46 step 5 x sz ±6,5;
//      slot bisa batal bila penabrak acak (pohon kota) mendarat < 2,1 m —
//      tidak deterministik, jadi 14 dihitung sebagai nominal) ---
{
  const files = ['kios-merah-blender-v1.glb', 'kios-biru-blender-v1.glb', 'kios-oranye-blender-v1.glb'];
  let idx = 0;
  for (const sx of [16, 21, 26, 31, 36, 41, 46]) for (const sz of [-6.5, 6.5]) {""",
"""// --- kios pasar (8 slot baru Fase C+D: sx 23,5..38,5 x sz ±6,8;
//      filter baru: footprint AABB G07/G08 + lingkaran penabrak lain) ---
{
  const files = ['kios-merah-blender-v1.glb', 'kios-biru-blender-v1.glb', 'kios-oranye-blender-v1.glb'];
  let idx = 0;
  for (const sx of [23.5, 28.5, 33.5, 38.5]) for (const sz of [-6.8, 6.8]) {""",
    tag='Kios slot baru')
# lampu bukit 1 + boulevard
rep("add('lampu-jalan-blender-v1.glb', 'Lampu Bukit 1', 'perabot', 37 + Math.cos(LANDAI1) * 15, tinggiTanah(37 + Math.cos(LANDAI1) * 15, 37 + Math.sin(LANDAI1) * 15), 37 + Math.sin(LANDAI1) * 15, 0, 1, 2483);",
    "add('lampu-jalan-blender-v1.glb', 'Lampu Bukit 1', 'perabot', 33, tinggiTanah(33, 26), 26, 0, 1, 2483);", tag='Lampu Bukit 1')
rep("""for (let zl = -28; zl >= -88; zl -= 12) {
  const sisi = ((zl / 12) % 2 === 0) ? -1.2 : 8.2; // selalu 8,2 (lihat catatan di atas)
  add('lampu-jalan-blender-v1.glb', 'Lampu Boulevard z=' + zl, 'perabot', sisi, tinggiTanah(sisi, zl), zl, 0, 1, 3052, { note: 'sisi=' + sisi + ' (rumus (zl/12)%2===0 tidak pernah benar)' });
}""",
"""for (let _il = 0, zl = -28; zl >= -88; zl -= 12, _il++) {
  const sisi = (_il % 2 === 0) ? -1.2 : 8.2; // AUDIT 2026-11-09: rumus indeks loop — 3 barat + 3 timur
  add('lampu-jalan-blender-v1.glb', 'Lampu Boulevard z=' + zl, 'perabot', sisi, tinggiTanah(sisi, zl), zl, 0, 1, 3052, { note: 'sisi=' + sisi });
}""",
    tag='Lampu boulevard')
# bangku
rep("bangku(50.5, 2.3, Math.PI, 'Bangku Pasar Malam 1', 2895);",
    "bangku(43, 15, Math.PI, 'Bangku Pasar Malam 1', 2895);", tag='Bangku Pasar 1')
rep("bangku(50.5, -1.5, 0, 'Bangku Pasar Malam 2', 2896);",
    "bangku(41, -12, 0, 'Bangku Pasar Malam 2', 2896);", tag='Bangku Pasar 2')
rep("bangku(-1.4, -46, Math.PI / 2, 'Bangku City Walk 1', 3106);",
    "bangku(-18, -46, Math.PI / 2, 'Bangku City Walk 1', 3106);", tag='Bangku CW1')
rep("bangku(-1.4, -74, Math.PI / 2, 'Bangku City Walk 2', 3107);",
    "bangku(-18, -74, Math.PI / 2, 'Bangku City Walk 2', 3107);", tag='Bangku CW2')
rep("bangku(8.4, -60, -Math.PI / 2, 'Bangku City Walk 3', 3108);",
    "bangku(-18, -60, -Math.PI / 2, 'Bangku City Walk 3', 3108);", tag='Bangku CW3')
rep("bangku(8.4, -86, -Math.PI / 2, 'Bangku City Walk 4', 3109);",
    "bangku(24, -86, -Math.PI / 2, 'Bangku City Walk 4', 3109);", tag='Bangku CW4')
# pagar tiang: dedup (cerminkan pagarModulSk)
rep("""  const segs = [[-250, 38, -170, 38], [-250, 88, -170, 88], [-250, 38, -250, 88]];
  for (const [x1, z1, x2, z2] of segs) {
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    const ux = dx / len, uz = dz / len, n = Math.max(1, Math.round(len / 2.1)), ry = Math.atan2(-uz, ux);
    for (let k = 0; k < n; k++) add('pagar-blender-v1-tiang.glb', 'Pagar Tiang Sekolah', 'pagar', x1 + ux * len * k / n, 0, z1 + uz * len * k / n, ry, 1, 4960);
  }""",
"""  const segs = [[-250, 38, -170, 38], [-250, 88, -170, 88], [-250, 38, -250, 88]];
  const _sudahTiang = new Set(); // AUDIT 2026-11-09 (D1): dedup tiang sudut (-250,38)
  for (const [x1, z1, x2, z2] of segs) {
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    const ux = dx / len, uz = dz / len, n = Math.max(1, Math.round(len / 2.1)), ry = Math.atan2(-uz, ux);
    for (let k = 0; k < n; k++) {
      const _px = x1 + ux * len * k / n, _pz = z1 + uz * len * k / n, _kk = _px.toFixed(2) + ',' + _pz.toFixed(2);
      if (_sudahTiang.has(_kk)) continue; _sudahTiang.add(_kk);
      add('pagar-blender-v1-tiang.glb', 'Pagar Tiang Sekolah', 'pagar', _px, 0, _pz, ry, 1, 4960);
    }
  }""",
    tag='Pagar dedup')
# prosedural P: lobus, bangku T2, pohon T2, palem
rep("addP('Lobus City Walk', 'tanah', -16.5, 23.5, -2.4, 0, -78, -38, 3121, { bentuk: 'circle', cx: 3.5, cz: -58, r1: 20 });",
    "addP('Lobus City Walk', 'tanah', -28.5, 35.5, -2.4, 0, -90, -26, 3121, { bentuk: 'circle', cx: 3.5, cz: -58, r1: 32 });", tag='Lobus CW addP')
rep("for (const [x, z, ry] of [[-216, 53.5, 0], [-184, 53, 0], [-226, 67, Math.PI / 2], [-178, 55, 0]]) {",
    "for (const [x, z, ry] of [[-216, 53.5, 0], [-184, 53, 0], [-216, 67, Math.PI / 2], [-178, 55, 0]]) {", tag='Bangku T2 addP')
rep("for (const [x, z] of [[-232, 52], [-224, 52], [-178, 64], [-182, 70]])",
    "for (const [x, z] of [[-232, 52], [-224, 52], [-178, 64], [-189, 66]])", tag='Pohon T2 addP')
rep("for (const [x, z, s] of [[-3.5, 56.5, 1.05], [3.8, 58.5, 0.95], [-20, 50, 1.1], [24, 52, 1.0], [34, 66, 1.08]])",
    "for (const [x, z, s] of [[-8, 56.5, 1.05], [9.5, 60, 0.95], [-20, 50, 1.1], [24, 52, 1.0], [34, 66, 1.08]])", tag='Palem addP')
# geserTris danau/kolam
rep("geserTris(triDanau, -120, -40);   // danau di (-120,0,-40), baris 8104",
    "geserTris(triDanau, -180, -20);   // danau di (-180,0.03,-20), baris 8104 (Fase C+D)", tag='geser danau')
rep("geserTris(triKolam, -40, 120);    // kolam di (-40,0,120), baris 8077",
    "geserTris(triKolam, 30, 155);    // kolam di (30,0,155), baris 8077 (Fase C+D)", tag='geser kolam')
# DI_DARAT: lobus 20->32; veto danau elips; diorama danau pindah
rep("  (x, z) => Math.hypot(x - 3.5, z + 58) <= 20,",
    "  (x, z) => Math.hypot(x - 3.5, z + 58) <= 32,", tag='DI_DARAT lobus')
rep("  (x, z) => x >= -250 && x <= -71 && z >= -61 && z <= 91 && Math.hypot(x + 180, z + 20) > 20.8,",
    "  (x, z) => x >= -250 && x <= -71 && z >= -61 && z <= 91 && (((x + 180) / 23) * ((x + 180) / 23) + ((z + 20) / 18) * ((z + 20) / 18) > 1),",
    tag='DI_DARAT veto elips')
rep("  (x, z) => x >= -143 && x <= -97 && z >= -58 && z <= -22, // tanah diorama danau GLB",
    "  (x, z) => x >= -203 && x <= -157 && z >= -38 && z <= -2, // tanah diorama danau GLB (pindah ke (-180,-20))",
    tag='DI_DARAT diorama')
rep("// dalamArea() baris 2042-2069 + mesh daratan5/lobus; lubang air danau\n// (-180,-20) r 20,8 BUKAN daratan). Hanya objek yang alasnya menyentuh/",
    "// dalamArea() + mesh daratan5/lobus; lubang air danau (-180,-20)\n// elips 23x18 BUKAN daratan). Hanya objek yang alasnya menyentuh/",
    tag='DI_DARAT komentar')
# ARTEFAK G04 x Lampu Plaza: ket lama (posisi lama) -> ket Fase B
rep("{ a: 'Gedung G04', b: 'Lampu Plaza (prosedural)', px: -6.16, pz: 14.98, ket: 'uji kotak 0,05 m (156 titik): 0 tumpang; iris G04 di y=0,1–0,5 berjarak 0,34 m dari tiang lampu' },",
    "{ a: 'Gedung G04', b: 'Lampu Plaza (prosedural)', px: -6.16, pz: 14.98, ket: 'Fase B (posisi baru (-15,37,4)): uji segitiga 0,00 m2; celah nyata >=5,9 m dari tiang lampu' },",
    tag='ARTEFAK G04-Lampu')
# narasi basi di md generator: kios 14 -> 8; F7 danau; F8 G04; pohon kota RNG
rep("14 slot nominal; satu slot bisa batal bila pohon kota acak mendarat < 2,1 m dari slotnya (baris 2798–2803) — jadi jumlah kios per load bisa 12–14.",
    "8 slot baru (Fase C+D, x 23,5–38,5 z ±6,8); filter baru pakai footprint AABB G07/G08; pohon kota dijauhi <3,2 m dari slot (seeded).",
    tag='narasi kios')
rep("tetapi satu-satunya air danau yang ber-mesh adalah GLB di (−120,−40), ±60 m di timur. Dermaga + lubang jalan kaki itu tidak punya permukaan air yang terlihat.",
    "tetapi satu-satunya air danau yang ber-mesh adalah GLB di (−120,−40), ±60 m di timur. Dermaga + lubang jalan kaki itu tidak punya permukaan air yang terlihat. **Fase C+D: GLB danau dipindah ke (−180,−20) di bawah dermaga; air shader + cincin pasir lama dihapus.**",
    tag='narasi F7')
rep("Di penempatan (−12,0,30) ry 5,90, ~75% volume gedung berada DI BAWAH tanah (y<0). Konsekuensi: tumpang AABB G04-vs-air-mancur adalah ARTEFAK",
    "Di penempatan LAMA (−12,0,30) ry 5,90, ~75% volume gedung berada DI BAWAH tanah (y<0). **Fase C+D: G04 diangkat y+14,90 + geser ke (−15,37,4) — minY dunia 0,0 terverifikasi Blender; alas-di-cincin 0,00 m².** Konsekuensi: tumpang AABB G04-vs-air-mancur adalah ARTEFAK",
    tag='narasi F8')
rep("Skala/rotasi acak (Math.random).",
    "Skala/rotasi dari acakAset (tetap). **Fase C+D: penempatan pohon kota/padang/hutan/awan seeded (acakVeg, mulberry32 seed 20261023, aliran terpisah) + zona larangan kios/jalan/lapangan/rumah.**",
    tag='narasi pohon kota')

open(P, 'w', encoding='utf-8').write(src)
print(f'{len(log)} perubahan audit script:')
for l in log: print(' -', l)
