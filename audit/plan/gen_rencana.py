# Generator rencana.json Fase B — dari MOVES/DELETE verify_rencana.py + bbox.json.
# TIDAK mengubah index.html. Output: ~/workspace/lumina/audit/plan/rencana.json
import ast, json, math, re

W = '/home/hatch/workspace/lumina/'
src = open(W + 'audit/plan/verify_rencana.py').read()
moves_src = re.search(r'MOVES = \{(.*?)\n\}', src, re.S).group(0)
MOVES = ast.literal_eval(moves_src.split('=', 1)[1].strip())
del_src = re.search(r'DELETE = \[(.*?)\]', src, re.S).group(0)
DELETE = ast.literal_eval(del_src.split('=', 1)[1].strip())

BBOX = json.load(open(W + 'audit/bbox.json'))
def find(label, x, z):
    for o in BBOX:
        if o['label'] == label and abs(o['x'] - x) < 1e-9 and abs(o['z'] - z) < 1e-9:
            return o
    raise KeyError((label, x, z))

ALASAN = {
    ('Menara Jam', 0, -18.6): "Di atas jalan lingkar (43,75 m2) + jalan-raya (27 m2); kollider salah tempat. Celah cincin r21-26 terlalu sempit (lebar 5 m < tapak 7,8 m) -> pindah ke sisi barat boulevard; kollider ikut pindah.",
    ('Gedung G04', -12, 30): "Terkubur (alas lokal -14,90). y+14,90 saja TIDAK cukup: uji segitiga alas baru masih 40,44 m2 di cincin -> geser radial +8 m (min-r alas 22,13). WAJIB render-verifikasi Blender sebelum deploy.",
    ('Gedung G02', -29, 4): "Tapak 44 m2 di jalan E-W (z -8..8); slot cincin terjepit G01/G03 -> pindah ke celah cincin timur-laut (antara G05-G07); ry dihitung ulang menghadap plaza (atan2(x,z)+pi). Uji segitiga: alas-di-cincin 0.",
    ('Gedung G05', 6, 33): "Tapak 28,5 m2 di jalan N-S (x -4..4); geser timur 4 m (tepi tapak 1,2 m dari jalan).",
    ('Gedung G10', -6, -33): "Tapak 50 m2 di jalan N-S; geser barat 8 m. Tabrakan AABB vs Kopi (8,65 m2) = artefak: uji segitiga 0,00 m2 (celah nyata 2,0 m).",
    ('Gedung G07', 30, 10): "Tapak 60-68,75 m2 di jalan E-W; geser utara 7 m (keluar koridor pasar; membuka slot kios x26-36). Lampu Bukit 1 ikut geser.",
    ('Gedung G08', 29, -10): "Tapak 28,5 m2 di jalan E-W; geser ke (34.8,-15). Uji segitiga: vs G09 0,00 m2 (celah nyata 1,1 m), vs Jembatan Batu 1 0,00 m2.",
    ('Toko Kopi Senja', -6.2, -44): "Deret toko: jarak 8 m < kedalaman tapak 9,5-11,4 m (tabrakan G2/G3/G4/G6/G10, 8,96-32,10 m2) + tepi tapak 0,7-1,2 m di atas jalan boulevard (x -2..9). Dijarangkan (spasi 12-13 m) + geser keluar jalan; fasad tetap menghadap boulevard.",
    ('Toko Roti & Kopi', -6.2, -52): "Lihat Kopi Senja: dijarangkan ke z -58 (celah ke Kopi 2,6 m, ke Buku 1,4 m) + geser barat keluar jalan.",
    ('Toko Buku & Kertas', -6.2, -60): "Lihat Kopi Senja: dijarangkan ke z -70 + geser barat keluar jalan.",
    ('Toko Bunga', -6.2, -68): "Lihat Kopi Senja: dijarangkan ke z -80 + geser barat keluar jalan. Tetap di darat karena lobus City Walk diperbesar r20->32.",
    ('Toko Es Krim', 13.2, -44): "Lihat Kopi Senja: deret timur dijarangkan + geser timur keluar jalan (tepi 1,6 m).",
    ('Toko Studio Foto', 13.2, -52): "Lihat Kopi Senja: dijarangkan ke z -57 (celah ke Es Krim 2,65 m, ke Teh 1,85 m) + geser timur keluar jalan.",
    ('Toko Teh & Rempah', 13.2, -60): "Lihat Kopi Senja: dijarangkan ke z -68 + geser timur keluar jalan.",
    ('Toko Mainan', 13.2, -68): "Lihat Kopi Senja: dijarangkan ke z -80 + geser timur keluar jalan. Tetap di darat (lobus r32).",
    ('Lapangan Olahraga', 80, -80): "888 m2 di laut + 407 m2 di sungai; tabrakan 105,13 m2 dgn Taman Bermain. Daratan selatan 170x90 TIDAK MUAT tapak 84x56 tanpa melintasi jalan (kuadran maks 80x41) -> alternatif Hutan Pinus (190,-45), darat terkonfirmasi, dekat RUTE_HUTAN; vegetasi pinus di tapak+2 m wajib dikosongkan (seeded RNG).",
    ('Taman Bermain', 120, -60): "Tabrakan 105,13 m2 dengan Lapangan; ikut ke rekreasi selatan, kuadran barat-daya (celah ke Skatepark 30,7 m).",
    ('Rumah Modern', 150, 20): "100% tapak di laut (255,75 m2), tanpa jalan. Pindah berkelompok ke Hutan Pinus (darat dalamArea) di tepi RUTE_HUTAN; jarak antar rumah 9,9 m; setapak spur dari (84.1,-22.2).",
    ('Rumah Tradisional', 165, 35): "100% tapak di laut (201,50 m2), tanpa jalan. Ke Hutan Pinus; jarak ke Modern 9,9 m, ke Cottage 10,7 m; setapak spur dari (110.1,-40.8).",
    ('Rumah Cottage', 140, 45): "100% tapak di laut (306,25 m2), tanpa jalan. Ke Hutan Pinus; setapak spur dari (114.9,-44.2).",
    ('Food Court', 60, 100): "280 m2 di laut + 6,25 m2 di sungai; pindah ke rekreasi selatan, kuadran tenggara (celah ke Konser 12,15 m).",
    ('Kolam Renang', -40, 120): "TEMUAN BARU Fase B: tapak 32x25 (800 m2) 100% di laut di (-40,120) - lolos dari audit geometri (cek DI_DARAT/dalamArea). Pindah ke rekreasi selatan, kuadran timur-laut.",
    ('Gedung Konser', 0, 180): "318-344 m2 di jalan-raya (di atas jalan selatan z 177-183); pindah ke selatan jalan, kuadran tenggara (celah 1,35 m ke jalan & ke tepi daratan).",
    ('Skatepark', -60, 180): "24-29 m2 di jalan-raya; pindah ke utara jalan selatan, kuadran barat-laut.",
    ('Taman Bunga', 60, 180): "12-16 m2 di jalan-raya; pindah ke utara jalan selatan, kuadran timur-laut (celah ke Konser 23,9 m).",
    ('Gerbang Pasar', 13.2, 0): "14 m2 di jalan-raya + 1,25 m2 di cincin + 6,25 m2 di trotoar; geser timur 9,3 m keluar cincin (celah 1,2 m). Tetap melintasi lorong pasar - by design, gerbang pejalan kaki.",
    ('Gerobak Pasar 1', 19.5, -4.2): "3 m2 di cincin + 5 m2 di jalan; geser ke selatan pasar, keluar cincin (celah 1,45 m ke kios).",
    ('Gerobak Pasar 2', 44, 4.2): "6,25 m2 di sungai + 6,25 m2 di jalan; geser ke barat keluar sungai (celah 1,7 m ke tepi sungai).",
    ('Kios Pasar 1', 16, -6.5): "Slot lama di cincin (r<20,5) + menabrak G07/G08 (filter kollider lingkaran) / di sungai (x41-46). Slot baru x 23,5-38,5 z +-6,8: keluar cincin (r>21,3), bebas G07/G08 baru (celah >=1,06 m), bebas sungai (tepi barat sungai x>=42). File tetap merah.",
    ('Kios Pasar 2', 16, 6.5): "Lihat Kios 1. File tetap biru.",
    ('Kios Pasar 3', 21, -6.5): "Lihat Kios 1. File tetap oranye.",
    ('Kios Pasar 4', 21, 6.5): "Lihat Kios 1. File tetap merah.",
    ('Kios Pasar 5', 26, -6.5): "Lihat Kios 1. File tetap biru.",
    ('Kios Pasar 6', 26, 6.5): "Lihat Kios 1. File tetap oranye.",
    ('Kios Pasar 7', 31, -6.5): "Lihat Kios 1. File tetap merah.",
    ('Kios Pasar 8', 31, 6.5): "Lihat Kios 1. File tetap biru.",
    ('Danau', -120, -40): "Air GLB menabrak jalan 90-101 m2; dermaga Danau Cermin (-180,-20) tanpa air terlihat karena air shader 44x44 terkubur di bawah kotak Padang Barat (atas y=0) - F7 terkonfirmasi. GLB pindah ke (-180,-20) supaya airnya (y 0,16-0,22) di bawah dermaga; y+0,03 cegah z-fight dgn rumput; air shader + cincin pasir lama dihapus.",
    ('Air Mancur Sekolah 2', -243, 84): "8 m dari lab (tepi 1,0 m dari dinding); geser timur 5 m (celah ke lab 1,02 m, ke lapangan 1,6 m, ke pagar 1,5 m).",
    ('Pohon T2 (prosedural)', -182, 70): "Tabrakan 4 m2 dengan Aula (G12); geser ke (-189,66) (celah ke Aula 1,8 m, ke Lampu Sekolah 1,85 m).",
    ('Bangku T2 (prosedural)', -226, 67): "Tabrakan 0,58 m2 dengan Perpustakaan (G14); geser ke (-216,67) (celah 1,42 m).",
    ('Bangku City Walk 1', -1.4, -46): "0,54 m2 menabrak Kopi (G15, segitiga 0,56) + 0,75 m2 di jalan boulevard; geser ke strip luar toko barat x=-18 (celah 1,34 m ke Kopi).",
    ('Bangku City Walk 2', -1.4, -74): "0,75 m2 di jalan boulevard; geser ke strip luar toko barat x=-18 (celah 4,25 m ke Buku).",
    ('Bangku City Walk 3', 8.4, -60): "0,75 m2 di jalan boulevard; geser ke strip luar toko barat x=-18 (celah 4,73 m ke Roti).",
    ('Bangku City Walk 4', 8.4, -86): "0,75 m2 di jalan boulevard; geser ke strip luar toko timur x=24 (celah 3,33 m ke Menara Utara 1; di darat lobus utara).",
    ('Palem Pantai', -3.5, 56.5): "3,75 m2 di jalan N-S (x -4..4); geser barat keluar jalan (celah 2,6 m).",
    ('Palem Pantai', 3.8, 58.5): "3,75 m2 di jalan N-S; geser timur keluar jalan ke (9.5,60) (celah 2,2 m ke Gerobak Es Krim).",
    ('Bangku Pasar Malam 1', 50.5, 2.3): "0,75 m2 di jalan E-W + di tepi sungai (x 50,5 di alur sungai z 2); geser ke (43,15), keluar jalan & sungai.",
    ('Bangku Pasar Malam 2', 50.5, -1.5): "0,75 m2 di jalan E-W + di tepi sungai; geser ke (41,-12), keluar jalan & sungai (celah 1,1 m ke G08).",
    ('Lampu Bukit 1', 30.758, 23.361): "0,25 m2 di tapak G07 baru; geser ke (33,26) (celah 2,35 m). y ikuti tinggiTanah di titik baru (bukit).",
}
ALASAN_HAPUS = {
    ('Kios Pasar 9', 36, -6.5): "Slot lama dihapus: diganti slot baru Kios 1-8 (x 23,5-38,5). Slot (36,-6,5) menabrak G08 (8,11 m2).",
    ('Kios Pasar 10', 36, 6.5): "Slot lama dihapus: diganti slot baru Kios 1-8. Slot (36,6,5) menabrak G07 (8,11 m2).",
    ('Kios Pasar 11', 41, -6.5): "Slot lama dihapus: diganti slot baru Kios 1-8. Slot (41,-6,5) menjepit tepi sungai (1,75 m2).",
    ('Kios Pasar 12', 41, 6.5): "Slot lama dihapus: diganti slot baru Kios 1-8. Slot (41,6,5) menjepit tepi sungai (2,25 m2).",
    ('Kios Pasar 13', 46, -6.5): "Slot lama dihapus: diganti slot baru Kios 1-8. Slot (46,-6,5) 100% di sungai (18 m2).",
    ('Kios Pasar 14', 46, 6.5): "Slot lama dihapus: diganti slot baru Kios 1-8. Slot (46,6,5) 100% di sungai (10,5 m2).",
    ('Pagar Tiang Sekolah', -250, 38): "Duplikat D1: 2 instansi di (-250,38) (tiang sudut digambar 2 segmen); hapus SATU, satu tiang tersisa.",
}

moves = []
for (label, xl, zl), (xb, zb, yb, ryb) in sorted(MOVES.items()):
    o = find(label, xl, zl)
    moves.append({
        "label": label, "file": o['file'],
        "x_lama": o['x'], "z_lama": o['z'], "y_lama": o['y'], "ry_lama": o['ry'],
        "x_baru": xb, "z_baru": zb, "y_baru": yb,
        "ry_baru": ryb if ryb is not None else o['ry'],
        "alasan": ALASAN[(label, xl, zl)],
        "loader_line": o.get('loader_line'),
    })
for (label, xl, zl) in DELETE:
    o = find(label, xl, zl)
    moves.append({
        "label": label, "file": o['file'],
        "x_lama": o['x'], "z_lama": o['z'], "y_lama": o['y'], "ry_lama": o['ry'],
        "x_baru": None, "z_baru": None, "y_baru": None, "ry_baru": None,
        "alasan": ALASAN_HAPUS[(label, xl, zl)],
        "loader_line": o.get('loader_line'),
    })

perbaikan_kode = [
    {"lokasi": "index.html ~3052 (lampu boulevard)", "perubahan": "Rumus sisi pakai indeks loop: sisi = (i%2===0) ? -1.2 : 8.2 (3 lampu barat + 3 timur bergantian). Sebelumnya ((zl/12)%2===0) tak pernah benar untuk zl -28..-88 sehingga semua 6 lampu di x=8.2.", "alasan": "A5/F2"},
    {"lokasi": "index.html ~2800 (filter kios)", "perubahan": "Ganti uji tabrakan kollider lingkaran G07/G08 (r 3,95/4,65) dengan footprint AABB asli (G07 posisi baru, G08 posisi baru); slot baru [23.5,28.5,33.5,38.5] x z +-6.8; hapus slot 16/21/36/41/46.", "alasan": "A6; filter lama menggugurkan slot yang sebenarnya bebas + meloloskan slot di sungai"},
    {"lokasi": "index.html ~922-937, 4402, 4902 (bidang tanah datar)", "perubahan": "Aktifkan polygonOffset di material plaza/jalan lingkar/trotoar/setapak/garis lapangan (dan lobus daratan Z1-Z7): polygonOffset:true, factor/units bertingkat (setapak 0, jalan lingkar -1, plaza -2, trotoar -3, garis -4). Nilai Y TIDAK diubah. Dipilih polygonOffset (bukan ubah Y) agar tidak menggeser geometri lain (mis. alas mancur y -0,12).", "alasan": "B1/B4: selisih Y hanya 1-2 cm, polygonOffset 0 di file"},
    {"lokasi": "index.html ~3312 (matRkKaca)", "perubahan": "Tambah depthWrite:false pada kaca toko (opacity 0,55).", "alasan": "B2: satu-satunya transparan tanpa depthWrite:false selain air mancur GLB"},
    {"lokasi": "air-mancur-blender-v1.glb (cek Blender, bukan kode)", "perubahan": "Ukur 3 mesh air (water_main/bowl/top): bila ada 2 yang sebidang (selisih Y <2 mm) hapus/geser 1; bila hanya beda tinggi, catat bukan-masalah dan tidak ada perubahan.", "alasan": "B3c: koplanar belum terbukti dari kode (hanya pola nama /^water/)"},
    {"lokasi": "index.html ~1297-1322 (disiplin jarak vegetasi)", "perubahan": "Ambang tampil <=200 m / sembunyi >220 m (sebelumnya 138/148 m, cek 2x/detik).", "alasan": "B4.3 pop-in vegetasi"},
    {"lokasi": "index.html ~1771-1795, 4643-4654, 5424-5445, 5899-5908 (RNG vegetasi/awan)", "perubahan": "Ganti Math.random() dengan mulberry32 seed 20261023 (sudah dipakai pohon deterministik). Zona larangan: <2,1 m dari slot kios baru, di atas segitiga jalan-raya, di dalam footprint bangunan (rencana.json), di dalam tapak Lapangan (190,-45)+2 m & 3 rumah+2 m.", "alasan": "A18: vegetasi acak tiap load, pohon bisa tumbuh menabrak kios"},
    {"lokasi": "index.html ~1021-1036 (material sungai)", "perubahan": "Material sungai: side: THREE.DoubleSide. Tanpa rebuild GLB.", "alasan": "3.368 segitiga winding terbalik di sungai-blender-v4.glb"},
    {"lokasi": "index.html 1087, 4888, 5338 (loader air-mancur.glb Hunyuan)", "perubahan": "Hapus ketiga loader (plaza, sekolah, mancur2) beserta grup mancur yang mati. Dicek: loader ini TIDAK mendaftarkan apa pun ke daftarAirShader (hanya matAirMancur) sehingga pencabutan aman; mancurPrimitif tetap sebagai fallback bila Blender gagal.", "alasan": "A4/B3a/F1: dimuat tapi tak terlihat (scene.add dikomentari)"},
    {"lokasi": "index.html ~968-969, ~1406 (kollider)", "perubahan": "penabrak menara jam {x:0,z:0,r:4.0} -> {x:-25,z:-46,r:4.0}; penabrak {x:0,z:0,r:4.0} dipertahankan dengan komentar yang benar ('air mancur', bukan 'clock tower'); kollider G07/G08 diganti footprint AABB asli (lihat filter kios).", "alasan": "A1/A7"},
    {"lokasi": "index.html ~3121 (lobus City Walk) + ~2052 (dalamArea)", "perubahan": "Lobus City Walk r 20 -> 32 (silinder prosedural); klausul dalamArea hypot(x-3.5,z+58)<=19.5 -> <=31.5.", "alasan": "Deret toko baru (Bunga/Mainan z -80) butuh darat; A13"},
    {"lokasi": "index.html ~2042-2069 (dalamArea)", "perubahan": "Tambah daratan selatan: x -85..85, z 135..225 -> true. TEMUAN BARU: pemain tidak bisa jalan di zona rekreasi selatan karena dalamArea tidak mengenalnya (langkahSah memblokir seluruh zona).", "alasan": "Zona rekreasi selatan tak terjangkau pejalan kaki"},
    {"lokasi": "index.html komentar (G01 ~1407, G04 ~1452, G07/G08 ~1476-1487, gerobak ~2818/~4110, lampu ~3045)", "perubahan": "Perbaiki komentar basi: skala G01/G04 '10.0/15.45' -> skala 1.0 (ukuran dari GLB); kollider G07/G08 -> footprint AABB; skala gerobak '1,76/2,1593' -> 1.0; komentar lampu boulevard menyesuaikan rumus baru.", "alasan": "A12/F3"},
    {"lokasi": "index.html ~4932-4960 (pagarModulSk)", "perubahan": "Dedup tiang sudut: lewati tiang pertama segmen bila posisinya sama dengan tiang terakhir segmen sebelumnya (kasus (-250,38)).", "alasan": "D1"},
    {"lokasi": "index.html ~4413 (RUTE_DANAU) + jalanStrip5", "perubahan": "Perpanjang RUTE_DANAU 3 m ke (-159,-18) (tepi danau GLB baru); tambah 3 setapak spur dari RUTE_HUTAN ke rumah: Modern dari (84.1,-22.2) sejauh ~16 m, Tradisional dari (110.1,-40.8) ~17 m, Cottage dari (114.9,-44.2) ~17 m (titik terdekat polyline; executor sesuaikan ke pintu).", "alasan": "A8/A9: akses rumah + dermaga danau"},
    {"lokasi": "index.html ~4437-4445 (Danau Cermin)", "perubahan": "Saat danau GLB pindah: hapus airDanau shader (44x44, terkubur) + cincin pasir (RingGeometry 20.3-25.2) - air & pasir digantikan GLB; hemat 1 shader update/frame.", "alasan": "F7: air shader tak terlihat, cincin pasir ganda"},
    {"lokasi": "index.html ~8056-8209 + ~7989-8010 (posisi rekreasi/lapangan)", "perubahan": "Terapkan posisi baru rencana.json. G04 y+14.9 + posisi (-15,37.4): WAJIB render-verifikasi Blender sebelum deploy (badan terangkat y 0..14,9, bola balkon 14,9..19,06).", "alasan": "F8"},
]

out = {
    "meta": {
        "fase": "B (rencana saja - index.html TIDAK diubah)",
        "tanggal": "2026-11-09",
        "sumber": "audit/bbox.json (365 instansi), audit/penempatan.json, audit/jalan-zonasi.md (A1-A18), audit/blink.md (B1-B4), audit/geometri.md (G1-G17, T1-T87, D1, F1-F8), audit/plan/peta-jalan-sungai.txt",
        "index_md5": "0083845b38b99c6d0f9544e5c732962f",
        "verifikasi": "audit/plan/verify_rencana.py (AABB + tapak segitiga alas grid 0.5 m vs jalan/sungai/cincin/darat) + audit/plan/tri_test.py (uji segitiga grid 0.1 m)",
        "hasil_verifikasi": {
            "objek_dipindah": 49, "objek_dihapus": 7,
            "tabrakan_AABB_total": 10, "tabrakan_AABB_rincian": "6 artefak audit (segitiga 0, posisi tak berubah) + 1 kanopi pohon RINGAN (G13) + 3 adjudikasi segitiga 0,00 m2 (G10-Kopi, G04-Lampu Plaza x2)",
            "tabrakan_segitiga_nyata": 0,
            "tembus_kritis_tersisa": 1,
            "tembus_kritis_rincian": "T4 sungai x jalan-raya 307 m2 (bukan objek pindah; butuh jembatan GLB baru - RISIKO TERBUKA)",
            "celah_minimum_AABB": ">=1,02 m untuk semua objek pindah, kecuali 3 artefak AABB (celah segitiga nyata: G04-Lampu Plaza >=5,9 m; G10-Kopi 2,0 m; G08-G09 1,1 m)"
        }
    },
    "pindah": moves,
    "perbaikan_kode": perbaikan_kode,
    "catatan_jalan_sungai": {
        "keputusan_koridor_pasar": "Jalan E-W z -8..8 = JALAN PASAR PEJALAN KAKI (bukan jalan kendaraan). Bukti: node Markings jalan-raya hanya ada di jalan N-S (372 tris, x -3,5..3,5, z 22..177,8) - E-W 16 m lebar tanpa satu pun marka kendaraan; gerbang + gerobak memang di tengahnya by design. Konsekuensi: kios boleh di z +-6,8 (tepi); lorong tengah z -4,5..4,5 WAJIB bebas; gerbang (22,5,0) melintasi lorong by design (seperti jembatan di atas sungai).",
        "jalan_kendaraan": "N-S x -4..4, z -96..-19 & 20..195 (marka z 22..177,8); selatan z 177..183, x -52..52; barat x -90..-86 (z -12..10) & E-W barat x -122..-86 (z -12..0). Semua harus bebas bangunan (kecuali lampu/bangku tepi jalan).",
        "sungai": "Alur N-S meander x 40..57 (tepi barat x 42-49 di z -20..20, menyempit ke x 40 di z 70); jembatan batu (45,3,-21,7) & (44,4,56) dekoratif - BUKAN di persilangan jalan; persilangan jalan-sungai yang benar di z -5..0 (E-W x sungai, 307 m2) tanpa jembatan = RISIKO TERBUKA.",
        "danau_barat": "Danau Cermin (-180,-20): air shader 44x44 TERKUBUR di bawah kotak Padang Barat (atas y=0) sehingga tak terlihat (F7 terkonfirmasi). Danau GLB pindah ke sana; air GLB (y 0,16-0,22) di bawah dermaga.",
        "lapangan_selatan_tidak_muat": "Daratan selatan 170x90 terbagi jalan N-S (x -4..4) + jalan selatan (z 177..183) menjadi 4 kuadran maks 80x41 m; Lapangan 84x56 tidak muat di kuadran mana pun tanpa melintasi jalan -> alternatif Hutan Pinus (190,-45).",
        "keputusan_tidak_pindah": "Lapangan sekolah (-225,76) TETAP: celah 2,9 m ke Perpustakaan sudah >=1 m. Lampu jalan/boulevard/plaza TETAP di tepi jalan (tiang 0,25-0,5 m2, RINGAN, penempatan normal). Pohon Bingkai Menara di cincin TETAP (tajuk di atas jalan, batang di luar jalan - T59 SEDANG diterima)."
    },
}
json.dump(out, open(W + 'audit/plan/rencana.json', 'w'), indent=2, ensure_ascii=False)
print(f"rencana.json: {len(moves)} entri pindah/hapus, {len(perbaikan_kode)} perbaikan kode")
# validasi: semua x_baru bukan null punya angka; cek duplikat label+posisi baru
seen = {}
for m in moves:
    if m['x_baru'] is not None:
        k = (m['label'], m['x_baru'], m['z_baru'])
        assert k not in seen, k
        seen[k] = 1
print("validasi OK: tidak ada duplikat posisi baru")
