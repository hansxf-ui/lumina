# LAPORAN EKSEKUSI — Fase C+D Audit Lumina (2026-11-09)

Eksekutor: subagent Vesper. Rencana: `rencana.json` (56 entri: 49 pindah + 7 hapus; 17 perbaikan kode).
Base `index.html` MD5 `0083845b38b99c6d0f9544e5c732962f` (8.256 baris, live saat itu).
Backup SEBELUM edit: `index.html.bak-audit-20261109` (MD5 = base, terverifikasi).
`index.html.bak-v24-20261109` TIDAK dipakai (pose cewek v24 belum disetujui pemilik).

## 1. Penerapan (applier `terapkan.py`)

85 perubahan diterapkan dgn exact-match count-check per penggantian (gagal = berhenti,
file tak ditulis). Hasil: `index.html` 8.232 baris, MD5 akhir
`ffcbc29e89664c0dd1721343894e51ed` (sesudah perubahan seed §5).
`node --check` pada 3 blok `<script>` inline (382.966 byte): LOLOS.

### 1.1 Tabel perpindahan (56 entri rencana.json)

| # | Objek | Lama (x, z, y, ry) | Baru (x, z, y, ry) |
|---|---|---|---|
| 1 | Air Mancur Sekolah 2 | (-243, 84, 0, 0) | (-238, 84, 0, 0) |
| 2 | Bangku City Walk 1 | (-1.4, -46, 0, 1.5708) | (-18, -46, 0, 1.5708) |
| 3 | Bangku City Walk 2 | (-1.4, -74, 0, 1.5708) | (-18, -74, 0, 1.5708) |
| 4 | Bangku City Walk 3 | (8.4, -60, 0, -1.5708) | (-18, -60, 0, -1.5708) |
| 5 | Bangku City Walk 4 | (8.4, -86, 0, -1.5708) | (24, -86, 0, -1.5708) |
| 6 | Bangku Pasar Malam 1 | (50.5, 2.3, 0, 3.1416) | (43, 15, 0, 3.1416) |
| 7 | Bangku Pasar Malam 2 | (50.5, -1.5, 0, 0) | (41, -12, 0, 0) |
| 8 | Bangku T2 (prosedural) | (-226, 67, 0, 0) | (-216, 67, 0, 0) |
| 9 | Danau | (-120, -40, 0, 0) | (-180, -20, 0.03, 0) |
| 10 | Food Court | (60, 100, 0, 0) | (65, 200, 0, 0) |
| 11 | Gedung G02 | (-29, 4, 0, 1.7079) | (15, 20, 0, 3.785) |
| 12 | Gedung G04 | (-12, 30, 0, 5.9026) | (-15, 37.4, 14.9, 5.9026) |
| 13 | Gedung G05 | (6, 33, 0, 0.1797) | (10, 33, 0, 0.1797) |
| 14 | Gedung G07 | (30, 10, 0, 1.2491) | (30, 17, 0, 1.2491) |
| 15 | Gedung G08 | (29, -10, 0, 1.9029) | (34.8, -15, 0, 1.9029) |
| 16 | Gedung G10 | (-6, -33, 0, 3.3215) | (-14, -33, 0, 3.3215) |
| 17 | Gedung Konser | (0, 180, 0, 0) | (30, 204, 0, 0) |
| 18 | Gerbang Pasar | (13.2, 0, 0, 1.5708) | (22.5, 0, 0, 1.5708) |
| 19 | Gerobak Pasar 1 | (19.5, -4.2, 0, 0.5) | (21.5, -11.5, 0, 0.5) |
| 20 | Gerobak Pasar 2 | (44, 4.2, 0, -2.2) | (40, 11, 0, -2.2) |
| 21 | Kios Pasar 1 | (16, -6.5, 0, 0) | (23.5, -6.8, 0, 0) |
| 22 | Kios Pasar 2 | (16, 6.5, 0, 3.1416) | (23.5, 6.8, 0, 3.1416) |
| 23 | Kios Pasar 3 | (21, -6.5, 0, 0) | (28.5, -6.8, 0, 0) |
| 24 | Kios Pasar 4 | (21, 6.5, 0, 3.1416) | (28.5, 6.8, 0, 3.1416) |
| 25 | Kios Pasar 5 | (26, -6.5, 0, 0) | (33.5, -6.8, 0, 0) |
| 26 | Kios Pasar 6 | (26, 6.5, 0, 3.1416) | (33.5, 6.8, 0, 3.1416) |
| 27 | Kios Pasar 7 | (31, -6.5, 0, 0) | (38.5, -6.8, 0, 0) |
| 28 | Kios Pasar 8 | (31, 6.5, 0, 3.1416) | (38.5, 6.8, 0, 3.1416) |
| 29 | Kolam Renang | (-40, 120, 0, 0) | (30, 155, 0, 0) |
| 30 | Lampu Bukit 1 | (30.758, 23.361, 0.92, 0) | (33, 26, 0.92, 0) |
| 31 | Lapangan Olahraga | (80, -80, 0, 0) | (190, -45, 0, 0) |
| 32 | Menara Jam | (0, -18.6, 0, 0) | (-25, -46, 0, 0) |
| 33 | Palem Pantai | (-3.5, 56.5, 0, 0) | (-8, 56.5, 0, 0) |
| 34 | Palem Pantai | (3.8, 58.5, 0, 0) | (9.5, 60, 0, 0) |
| 35 | Pohon T2 (prosedural) | (-182, 70, 0, 0) | (-189, 66, 0, 0) |
| 36 | Rumah Cottage | (140, 45, 0, 0.8) | (125, -30, 0, 0.8) |
| 37 | Rumah Modern | (150, 20, 0, 0.5) | (75, -35, 0, 0.5) |
| 38 | Rumah Tradisional | (165, 35, 0, -0.3) | (100, -55, 0, -0.3) |
| 39 | Skatepark | (-60, 180, 0, 0) | (-60, 155, 0, 0) |
| 40 | Taman Bermain | (120, -60, 0, 0) | (-60, 200, 0, 0) |
| 41 | Taman Bunga | (60, 180, 0, 0) | (65, 155, 0, 0) |
| 42 | Toko Buku & Kertas | (-6.2, -60, 0, 1.5708) | (-8.4, -70, 0, 1.5708) |
| 43 | Toko Bunga | (-6.2, -68, 0, 1.5708) | (-8.4, -80, 0, 1.5708) |
| 44 | Toko Es Krim | (13.2, -44, 0, -1.5708) | (15.2, -44, 0, -1.5708) |
| 45 | Toko Kopi Senja | (-6.2, -44, 0, 1.5708) | (-8.4, -44, 0, 1.5708) |
| 46 | Toko Mainan | (13.2, -68, 0, -1.5708) | (15.2, -80, 0, -1.5708) |
| 47 | Toko Roti & Kopi | (-6.2, -52, 0, 1.5708) | (-8.4, -58, 0, 1.5708) |
| 48 | Toko Studio Foto | (13.2, -52, 0, -1.5708) | (15.2, -57, 0, -1.5708) |
| 49 | Toko Teh & Rempah | (13.2, -60, 0, -1.5708) | (15.2, -68, 0, -1.5708) |
| 50 | Kios Pasar 9 | (36, -6.5, 0, 0) | **DIHAPUS** |
| 51 | Kios Pasar 10 | (36, 6.5, 0, 3.1416) | **DIHAPUS** |
| 52 | Kios Pasar 11 | (41, -6.5, 0, 0) | **DIHAPUS** |
| 53 | Kios Pasar 12 | (41, 6.5, 0, 3.1416) | **DIHAPUS** |
| 54 | Kios Pasar 13 | (46, -6.5, 0, 0) | **DIHAPUS** |
| 55 | Kios Pasar 14 | (46, 6.5, 0, 3.1416) | **DIHAPUS** |
| 56 | Pagar Tiang Sekolah | (-250, 38, 0, 0) | **DIHAPUS** |

### 1.2 Perbaikan kode (17 entri rencana.json)

| # | Lokasi | Perubahan |
|---|---|---|
| 1 | index.html ~3052 (lampu boulevard) | Rumus sisi pakai indeks loop: sisi = (i%2===0) ? -1.2 : 8.2 (3 lampu barat + 3 timur bergantian). Sebelumnya ((zl/12)%2===0) tak pernah benar untuk zl -28..-88 sehingga semua 6 lampu di x=8.2. |
| 2 | index.html ~2800 (filter kios) | Ganti uji tabrakan kollider lingkaran G07/G08 (r 3,95/4,65) dengan footprint AABB asli (G07 posisi baru, G08 posisi baru); slot baru [23.5,28.5,33.5,38.5] x z +-6.8; hapus slot 16/21/36/41/46. |
| 3 | index.html ~922-937, 4402, 4902 (bidang tanah datar) | Aktifkan polygonOffset di material plaza/jalan lingkar/trotoar/setapak/garis lapangan (dan lobus daratan Z1-Z7): polygonOffset:true, factor/units bertingkat (setapak 0, jalan lingkar -1, plaza -2, trotoar -3, garis -4). Nilai Y TIDAK diubah. Dipilih polygonOffset (bukan ubah Y) agar tidak menggeser geometri lain (mis. alas mancur y -0,12). |
| 4 | index.html ~3312 (matRkKaca) | Tambah depthWrite:false pada kaca toko (opacity 0,55). |
| 5 | air-mancur-blender-v1.glb (cek Blender, bukan kode) | Ukur 3 mesh air (water_main/bowl/top): bila ada 2 yang sebidang (selisih Y <2 mm) hapus/geser 1; bila hanya beda tinggi, catat bukan-masalah dan tidak ada perubahan. |
| 6 | index.html ~1297-1322 (disiplin jarak vegetasi) | Ambang tampil <=200 m / sembunyi >220 m (sebelumnya 138/148 m, cek 2x/detik). |
| 7 | index.html ~1771-1795, 4643-4654, 5424-5445, 5899-5908 (RNG vegetasi/awan) | Ganti Math.random() dengan mulberry32 seed 20261023 (sudah dipakai pohon deterministik). Zona larangan: <2,1 m dari slot kios baru, di atas segitiga jalan-raya, di dalam footprint bangunan (rencana.json), di dalam tapak Lapangan (190,-45)+2 m & 3 rumah+2 m. |
| 8 | index.html ~1021-1036 (material sungai) | Material sungai: side: THREE.DoubleSide. Tanpa rebuild GLB. |
| 9 | index.html 1087, 4888, 5338 (loader air-mancur.glb Hunyuan) | Hapus ketiga loader (plaza, sekolah, mancur2) beserta grup mancur yang mati. Dicek: loader ini TIDAK mendaftarkan apa pun ke daftarAirShader (hanya matAirMancur) sehingga pencabutan aman; mancurPrimitif tetap sebagai fallback bila Blender gagal. |
| 10 | index.html ~968-969, ~1406 (kollider) | penabrak menara jam {x:0,z:0,r:4.0} -> {x:-25,z:-46,r:4.0}; penabrak {x:0,z:0,r:4.0} dipertahankan dengan komentar yang benar ('air mancur', bukan 'clock tower'); kollider G07/G08 diganti footprint AABB asli (lihat filter kios). |
| 11 | index.html ~3121 (lobus City Walk) + ~2052 (dalamArea) | Lobus City Walk r 20 -> 32 (silinder prosedural); klausul dalamArea hypot(x-3.5,z+58)<=19.5 -> <=31.5. |
| 12 | index.html ~2042-2069 (dalamArea) | Tambah daratan selatan: x -85..85, z 135..225 -> true. TEMUAN BARU: pemain tidak bisa jalan di zona rekreasi selatan karena dalamArea tidak mengenalnya (langkahSah memblokir seluruh zona). |
| 13 | index.html komentar (G01 ~1407, G04 ~1452, G07/G08 ~1476-1487, gerobak ~2818/~4110, lampu ~3045) | Perbaiki komentar basi: skala G01/G04 '10.0/15.45' -> skala 1.0 (ukuran dari GLB); kollider G07/G08 -> footprint AABB; skala gerobak '1,76/2,1593' -> 1.0; komentar lampu boulevard menyesuaikan rumus baru. |
| 14 | index.html ~4932-4960 (pagarModulSk) | Dedup tiang sudut: lewati tiang pertama segmen bila posisinya sama dengan tiang terakhir segmen sebelumnya (kasus (-250,38)). |
| 15 | index.html ~4413 (RUTE_DANAU) + jalanStrip5 | Perpanjang RUTE_DANAU 3 m ke (-159,-18) (tepi danau GLB baru); tambah 3 setapak spur dari RUTE_HUTAN ke rumah: Modern dari (84.1,-22.2) sejauh ~16 m, Tradisional dari (110.1,-40.8) ~17 m, Cottage dari (114.9,-44.2) ~17 m (titik terdekat polyline; executor sesuaikan ke pintu). |
| 16 | index.html ~4437-4445 (Danau Cermin) | Saat danau GLB pindah: hapus airDanau shader (44x44, terkubur) + cincin pasir (RingGeometry 20.3-25.2) - air & pasir digantikan GLB; hemat 1 shader update/frame. |
| 17 | index.html ~8056-8209 + ~7989-8010 (posisi rekreasi/lapangan) | Terapkan posisi baru rencana.json. G04 y+14.9 + posisi (-15,37.4): WAJIB render-verifikasi Blender sebelum deploy (badan terangkat y 0..14,9, bola balkon 14,9..19,06). |

## 2. Adaptasi saat eksekusi (penyimpangan dari rencana — semua dicatat)

1. **Kollider ikut GLB pindah.** Array `posisi[]` box kode G01–G10 (hanya kollider yang
   dipakai, box dilewati) di-update x,z untuk G02 (15,20), G04 (-15,37.4), G05 (10,33),
   G07 (30,17), G08 (34.8,-15), G10 (-14,-33). Tanpa ini kollider tak terlihat tetap di
   posisi lama + bangunan baru tanpa kollider. Kollidermu menara jam (0,0,r4.0) → (-25,-46,r4.0)
   + push baru (0,0,r4.0) "air mancur plaza".
2. **RNG seeded — aliran TERPISAH `acakVeg()`.** Rencana: ganti `Math.random()` dgn mulberry32
   seed 20261023 (sudah dipakai `acakAset()`). Memakai `acakAset()` langsung akan menggeser
   konsumsi downstream → replay `POHON_DET` audit rusak + v/ry semua pohon deterministik
   berubah. Implementasi: `var _rngVeg = 20261040; function acakVeg(){...}` (state terpisah),
   dipakai di 4 blok: pohon kota, padang, hutan pinus, awan. Konsumsi `acakAset()` tidak
   berubah → replay audit tetap valid. (Nilai seed diubah dari rencana — lihat §5.)
3. **Zona larangan vegetasi.** Pohon kota — slot kios baru <**3,2 m** (bukan 2,1 m di rencana,
   karena filter kios pakai r pohon + 2,1 m; 3,2 m = aman) + jalan-raya N-S (x ±4, z -96..195)
   + E-W (z ±8, x -122..54). Padang — jalan-raya barat E-W (z -12..0, x -122..-86).
   Hutan pinus — tapak Lapangan (190,-45) +2 m (x 146..234, z -75..-15) + 3 rumah +2 m
   (Modern x 65,2..84,8 z -45,3..-24,7; Tradisional x 90,3..109,7 z -63,6..-46,4;
   Cottage x 114,1..135,9 z -40,8..-19,2; dari bbox dunia GLB lama).
4. **Kios filter (#2).** Slot [23.5,28.5,33.5,38.5] × z ±6.8; uji lingkaran vs `penabrakAsli`
   KECUALI G07/G08 (dikenali posisi (30,17)/(34.8,-15)) + uji AABB footprint asli:
   G07 x 23,61..35,82 z 10,35..23,46; G08 x 29,92..39,22 z -19,58..-10,26 (dari bbox dunia
   GLB lama digeser — rotasi tak berubah). Urutan file kios tetap merah/biru/oranye sesuai
   rencana (Kios 1 merah … 8 biru).
5. **Mancur Sekolah 2.** Loader GLB 5338 sudah dihapus per #9, jadi "pindah" diterapkan ke grup
   primitif `mancur2.position.set(-243,0,84)` → (-238,0,84) + kollidermu (-243,84,r2.5) → (-238,84).
   Tiga loader `air-mancur.glb` Hunyuan dihapus utuh via brace-matching IIFE:
   `pasangMancurGLB` (plaza), `pasangMancurSekolahGLB`, `pasangMancur2GLB`; masing-masing diganti
   komentar penanda. Aman: `matAirMancur` dipakai di loop dgn guard `if (matAirMancur)`;
   mancur primitif tetap fallback. Sisa `grep air-mancur.glb` = 4: 3 komentar hapus + 1 komentar
   lama; tidak ada `load('air-mancur.glb'` tersisa.
6. **R4 veto danau — trivial, diterapkan.** `Math.hypot(x+180,z+20) > 20.8` → elips tapak GLB
   danau 46×36 (half 23×18): `_dl = ((x+180)/23)² + ((z+20)/18)²; if (_dl > 1)`.
   Danau GLB lokal: x ±23, z ±18 (bbox dunia lama -143..-97, -58..-22 di pusat (-120,-40)).
7. **PolygonOffset (#3).** Plaza factor -2, jalan lingkar -1, trotoar -3, setapak
   (`jalanStrip5`) 0, garis lapangan (`matGarisSk`, `matGaris2`) -4; Y tidak diubah.
   Lobus City Walk: bahan atas di-clone (`bahanRumputLobusCW`, factor -1) supaya tidak z-fight
   dgn pulau utama (y=0 sama); bahan shared `bahanRumput`/`bahanSisiPulau` TIDAK disentuh.
   Lobus r 20→32 (silinder (32, 28.8, 2.4, 48)); `dalamArea` lobus 19.5→31.5.
8. **Lainnya diterapkan.** #1 lampu boulevard rumus indeks loop (`_il % 2`, 3 barat x=-1,2 +
   3 timur x=8,2); #4 `matRkKaca` + `depthWrite:false`; #6 ambang vegetasi 200/220 m
   (dari 138/148); #8 sungai `side: THREE.DoubleSide` di traverse loader (handle material
   array); #11 lobus (butir 7); #12 daratan selatan `dalamArea` (x -85..85, z 135..225 → true);
   #13 komentar basi (G01 "10.0"→skala 1.0; G04 "15.45"→skala 1.0; G07/G08 kollider→catatan
   footprint AABB; gerobak "1,76"/"2,1593"→skala kode 1.0 dgn catatan angka turunan basi);
   #14 dedup tiang pagar via Set `_tiangPagarSudah` (kunci `px.toFixed(2)+','+pz.toFixed(2)`,
   skip bila sudah dipasang — kasus (-250,38)); #15 `RUTE_DANAU` + `[-159,-18]` + 3 spur
   `jalanRute5` dari (84.1,-22.2)→(75,-35), (110.1,-40.8)→(100,-55), (114.9,-44.2)→(125,-30);
   #16 hapus `airDanau` shader + cincin pasir (`RingGeometry(20.3,25.2)`) di `danauCermin()` —
   tidak ada lagi `createWater(...[44,44]...)` / `daftarAirShader.push(airDanau)`; #17 = semua
   pindah di atas.
9. **Toko fallback (caveat).** Hanya `pasangTokoGLB` yang dipindah; box kode toko (`zToko` loop,
   -6.2/13.2) tetap di posisi lama — hanya tampil bila GLB gagal.

## 3. G04 — verifikasi Blender (WAJIB sebelum deploy — LOLOS)

Skrip `render-g04.py` / `render-g04b.py` (Blender 4.2.9 `~/workspace/blender/blender`,
Cycles 24 sampel, 480×360), transform three (-15,14.9,37.4) ry 5.9026 → Blender
(-15,-37.4,14.9) Rz +5.9026. Hasil: **world min-Z = 0.0 persis**, bbox dunia
x -13,66..-3,63, z (three) 9,15..27,82, tinggi 0..19,06; `g04_diag.py` re-run:
alas-di-cincin **0,00 m²**, min-r alas 22,13 (vs 40,44 m² / 14,13 di posisi lama).
Render 4 sisi + dari plaza setinggi mata di `verifikasi-g04/` (g04-utara/timur/selatan/
barat/plaza-mata.png) — fasad lengkap ("EMERALD GLOW", pintu lantai dasar menapak tanah,
bola balkon di atas). Render pertama tanpa ground plane; render ulang dgn bidang tanah
y=0 — hanya strip tanah tipis terlihat (kamera hampir horizontal), tapi bukti numerik
min-Z=0,0 + fasad utuh sudah cukup.
B3c (air mancur Blender): bukan masalah, tanpa perubahan — water meshes air-mancur-blender
y 0,55–0,62 / 1,22–1,27 / 1,68–1,73, beda tinggi >>2 mm, tidak koplanar.

## 4. R1 — jembatan batu (T4, 307 m²) — DIPUTUSKAN TETAP TERBUKA

Ukur `jembatan-batu-blender-v1.glb`: 18 m (X) × 5,14 m (Z), deck y 0,53–2,86 (melengkung),
Body multi-arch dgn kaki pier y 0–0,55 m di 8 posisi-x dan soffit lengkung ~1,5–1,6 m.
Air sungai di persilangan z -5..0: x 41,1–49,6 (lebar ~8,5 m) — panjang jembatan menutupi.
TAPI deck melengkung sementara jalan-raya + pemain tetap y≈0 → kamera menembus deck di
tengah jembatan. Render bukti `verifikasi-g04/r1-jalan-mata.png` (dari jalan setinggi mata,
deck naik di depan) dan `r1-samping.png` (profil 3-arch). Rencana Bab 3 R1 sendiri bilang
butuh GLB jembatan baru / rebuild jalan — di luar cakupan. R1 tetap satu-satunya tembus
KRITIS nyata (T4, 307 m²). Jembatan TIDAK dipindah.

## 5. Vegetasi seeded — seed rencana GAGAL verifikasi, diganti 20261023→20261040

**Temuan (bukan di rencana).** Replay eksak aliran `acakVeg()` (`replay-veg.mjs`, Node —
penabrak eksak saat blok kota direkonstruksi dari kode: 51 entri; filter verbatim;
catatPohon snapshot `terlarang` — push pohon kota TIDAK masuk snapshot) + adjudikasi
segitiga (`tri_test.py`, grid 0,1 m) menunjukkan seed rencana **20261023 menaruh 8 pohon
di jalan/bangunan**:
- 2 pohon DI DALAM gedung: kota (-10.6,24.1) di lantai dasar G04 (segitiga dinding y 1,78–2,22
  menutupi titik); kota (-20.4,-36.0) di G10 (dinding y 2,4–4,0).
- 4 pohon di pelat dasar/teras toko (luar dinding, di bawah atap): (-7.1,-31.0) G10;
  (13.0,-45.9), (18.0,-47.0) Es Krim; (-6.7,-43.7) Kopi.
- 2 pohon DI JALAN: padang (-88.1,2.4) dan (-120.5,-26.2) di permukaan Roads.
Akar masalah: kollider kode G01–G10 (r 3,95–5,35, dari box kode lama) LEBIH KECIL dari tapak
GLB Hunyuan (G04 v2: 10×18,7 m vs kode 6,5×7,6); toko/gerobak dimuat SETELAH blok kota
sehingga tidak ada di `penabrak` saat filter jalan; filter padang hanya mengecualikan
jalan-raya barat z -12..0 (jalan E-W lebar z ±8). Kondisi ini PRA-ADA (versi Math.random
lama juga bisa menaruh pohon di sana, hanya tidak deterministik) — seed membuatnya
terlihat dan terukur.

**Perbaikan (minimal, terverifikasi).** Scan seed (`scan-seed.py`, port Python mulberry32 —
divalidasi bit-per-bit vs JS + posisi replay-veg.json cocok persis): seed **20261040**
= **0 pelanggaran nyata** (kriteria ketat: titik pohon tidak ditutupi segitiga apa pun
dgn minY<4,5 dari bangunan/jalan/air; 360 pohon: kota 30/30, padang 76/76, hutan 254/254,
awan 9/9, y 42,6–69,6). Seed 20261040 adalah seed bersih pertama (scan 20261024–20261040).
Posisi JS vs Python identik persis; 9 flag AABB sisa diadjudikasi 0 segitiga (satu pohon
padang 0,50 m dari tiang Lampu Sekolah — tidak bersentuhan).
Perubahan di `index.html`: hanya konstanta `_rngVeg` 20261023→20261040 (+ komentar alasan).
`_rngAset` TIDAK berubah. Aliran `acakVeg()` terpisah tetap terjaga.
**Risiko baru R6 (terbuka, dicatat):** celah filter struktural di atas tetap ada — seed lain
bisa mengulang pelanggaran; perbaikan filter (kollider GLB / toko pra-kota / jalan padang
z 0..8) adalah pekerjaan susulan, bukan bagian Fase C+D. Bunga padang (380) masih
`Math.random()` — di luar cakupan #7 (bukan pohon).

## 6. Verifikasi Node (sebelum deploy)

Skrip audit di-update dulu (`update-audit.py`, 57 perubahan: `audit-geometri.mjs` meng-hardcode
semua penempatan, jadi re-run tanpa update mengukur posisi LAMA; backup
`audit-geometri.mjs.bak-faseA` disimpan).

| Metrik | Fase A (sebelum) | Sesudah (re-run) |
|---|---|---|
| Instansi | 365 (GLB 308 + prosedural 57) | 356 (GLB 299 + prosedural 57) — −9 = 6 kios + 2 mancur Hunyuan + 1 tiang pagar dedup |
| Tabrakan AABB | 17 (KRITIS 7, SEDANG 5, RINGAN 5) | **2 (KRITIS 0, SEDANG 0, RINGAN 2)** |
| Tembus permukaan | 87 (KRITIS 41, SEDANG 16, RINGAN 28, DIHARAPKAN 2) | **40 (KRITIS 13, SEDANG 2, RINGAN 23, DIHARAPKAN 2)** |
| Dobel | 0 | 0 |
| Z-fight bidang | 0 | 0 |

**Tabrakan sisa (2 RINGAN):** G1 Pohon Taman Bukit × Pohon Taman Bukit 0,67 m² (kanopi,
pra-ada G13); G2 Gedung G04 × Lampu Plaza 0,36 m² — AABB saja, uji segitiga 0,00 di kedua
posisi lampu (-11,11) dan (-6.159,14.984). Artefak AABB: 10 (segitiga 0,00 m²).
**Tembus KRITIS 13 — terurai:** T1 Sungai×jalan-raya 307,55 m² = R1 nyata (tetap terbuka,
§4); T2 G04×cincin 95,50 m² + T3 G04×jalan 28,00 m² + T4 G02×cincin 23,00 m² = AABB saja —
uji segitiga 0,00 m² (G04 alas-di-cincin 0,00; G02 alas-di-cincin 0,00; G04×Jalan Raya GLB
0,00; G02×Jalan Raya GLB 0,00; grid 0,1/0,25 m); T5–T13 = 8 Kios Pasar + Gerbang Pasar
× jalan-raya — BY DESIGN (koridor pasar E-W = jalan pejalan kaki, Bab 2 §2.2 butir 6).
**Tembus SEDANG 2:** T15 G04×trotoar 9,75 m² (AABB saja; min-r alas G04 22,13 > 14 → 0,00);
T17 Pohon Bingkai Menara×cincin 1,25 m² (diterima rencana §2.6 T59, tajuk di atas jalan).
**Tembus RINGAN 23:** T18/T20 bangku+lampu dermaga di atas air danau (minY 0,5 > air 0,10 —
berdiri di dek dermaga, bukan di air) + 21 lampu di tepi jalan (normal, §2.6).
**DIHARAPKAN 2:** perahu × laut.
**Referensi GLB:** 69 GLB di kode (65 + karakter-cewek/cowok final-v1 dgn `?v=1` + karakter-cewek/
cowok fallback) + 6 non-GLB + index.html = **76 berkas deploy**; semua ada di disk (0 hilang).
13 nama GLB lama hanya muncul di komentar — tidak di-deploy. `karakter-cewek9.glb` di disk
tidak dirujuk — tidak di-deploy.
**Tidak disentuh:** kode/GLB karakter, debug overlay (`debug=1`, baris 323–363 utuh), MQTT,
`water.js` (tidak ada load eksternal di dalamnya). `node --check` lolos.

## 7. Deploy

- Alat: `vercel_deploy.py` (akun hansxf-ui, pemilik, kredensial custom.vercel).
- Daftar berkas: dihitung ulang dari referensi `index.html` baru — **76 berkas, 112 MB**
  (sama dgn jumlah deploy 2026-11-08).
- Deployment: **`dpl_JCoB1mSAuNkhuYF6xoLV3if82f1p`** — READY.
- URL: https://kota-lumina-4pdc584l6-hansxf.vercel.app
- Alias: https://kota-lumina.vercel.app (alias utama), https://kota-lumina-hansxf.vercel.app
- **Verifikasi live:** MD5 `index.html` live = `ffcbc29e89664c0dd1721343894e51ed` = lokal ✓;
  marker `20261040` 2×, `AUDIT 2026-11-09` 26× di live ✓;
  `karakter-cewek-final-v1.glb` live MD5 `b0d8f674b5ccd4e8ea1bcde1698abecd` = lokal ✓
  (cocok dgn MD5 tercatat STATUS.md).
- **Link playtest:** https://kota-lumina.vercel.app/?fresh=20261109audit1
- Deploy sebelumnya: `dpl_CCKBrazksWKz6PiC3C3XUigWAsQZ` (2026-11-08, 76 berkas).

## 8. Risiko terbuka sesudah deploy

- **R1 (tetap):** T4 sungai×jalan-raya 307 m² — butuh GLB jembatan baru / rebuild jalan.
- **R6 (baru):** celah filter vegetasi struktural (§5) — seed 20261040 bersih, tapi filter
  belum diperbaiki; seed/filter lain bisa mengulang.
- **Caveat:** box kode toko fallback tetap di posisi lama (hanya tampil bila GLB gagal);
  bunga padang masih `Math.random()`.

## 9. Berkas kerja

- `~/workspace/lumina/audit/plan/terapkan.py` (applier, 85 perubahan)
- `~/workspace/lumina/audit/plan/update-audit.py` (57 perubahan skrip audit)
- `~/workspace/lumina/audit/plan/replay-veg.mjs` + `replay-veg.json` (replay seed 20261040)
- `~/workspace/lumina/audit/plan/scan-seed.py` + `scan-seed.log` + `replay-veg-bersih.json`
- `~/workspace/lumina/audit/plan/render-g04.py`, `render-g04b.py`, `render-r1.py`,
  `g04_diag.py`, `verifikasi-g04/` (render G04 4 sisi + plaza-mata, R1 2 render)
- `~/workspace/lumina/audit/audit-geometri.mjs` (ter-update) + `audit/bbox.json`,
  `audit/geometri.md`, `audit/peta-rencana.svg` (hasil re-run)
- Backup: `index.html.bak-audit-20261109`, `audit/audit-geometri.mjs.bak-faseA`
