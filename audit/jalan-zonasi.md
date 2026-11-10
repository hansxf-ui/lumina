# Jalan + Zonasi — Kota Lumina (audit baca-kode, 2026-11-09)

Sumber: `~/workspace/lumina/index.html` (8.256 baris, MD5 `0083845b38b99c6d0f9544e5c732962f`).
Semua koordinat (x,z) dari kode; jarak dihitung dari koordinat literal (script Python, bukan perkiraan).
Batas penting: **geometri di DALAM file GLB tidak bisa dibaca dari kode** — tapak/jejak sebenarnya
gedung, sungai, dan jalan-raya hanya diketahui dari komentar/kollider kode. Temuan yang butuh
geometri ditandai `BUTUH GEOMETRI` (untuk audit bagian 2).

## 1. Peta jalan

### 1a. Jalan GLB — `jalan-raya-blender-v1.glb` (baris 8226–8245)

```js
new THREE.GLTFLoader().load('jalan-raya-blender-v1.glb', function(gltf){
  var model = gltf.scene;
  model.traverse(function(o){ if (o.isMesh){ o.receiveShadow = true; } });
  scene.add(model);   // <-- TANPA position / rotation / scale
```

- **Satu instansi, tanpa transform sama sekali.** Seluruh jaringan jalan aspal+trotoar+marka
  "baked" di dalam GLB: dari kode TIDAK BISA diketahui ada berapa segmen, ke mana arahnya,
  atau apakah ujung-ujungnya nyambung. Ini lubang audit terbesar: jalan utama kota tidak
  terdokumentasi di kode.
- Komentar baris 2547/3044: `jalanPasar` dan `jalanBoulevard` (jalan kode) **DIHAPUS 2026-11-04,
  diganti GLB jalan-raya**. Komentar STATUS.md mengklaim GLB ini "ganti semua jalan kode" —
  klaim itu tidak bisa diverifikasi dari kode.
- `jalan-muse-town-v1.glb` 0 referensi (baris 1075: dihapus per pemilik 2026-11-02).

### 1b. Jalan kode yang tersisa

| Elemen | Baris | Geometri |
|---|---|---|
| Plaza (lingkaran paving r=14, y=0,03) | 922–926 | `CircleGeometry(14)`, tekstur ubin |
| Jalan lingkar (cincin r=14–20,5, y=0,022) | 927–931 | `RingGeometry(14, 20.5)`, warna 0x77664e |
| Trotoar (cincin r=13,2–14, y=0,04) | 933–937 | `RingGeometry(13.2, 14)` |
| Jalan setapak tanah `jalanStrip5` (y=0,02) | 4393–4420 | 5 rute, total 22 segmen (lihat 1c) |
| Jalan dalam sekolah (poros z=60 + cabang) | 5293–5294 | 2 strip: (-176,60)→(-190,60) dan (-171,8,61,6)→(-171,8,70) |
| Plaza mini utara (lingkaran r=14 di (0,-105), y=0,032) | 3668–3674 | `CircleGeometry(14)` |

### 1c. Rute setapak tanah (`jalanRute5`, baris 4415–4420) — 22 segmen

| Rute | Titik (x,z) | Segmen |
|---|---|---|
| RUTE_SEKOLAH | (-131,17) → (-130,40) → (-133,49) → (-141,58) → (-150,61.5) → (-160,60.5) → (-176,60) | 6 |
| RUTE_BARAT | (-12,8) → (-38,16) → (-56,28) → (-84,32) → (-112,24) → (-131,17) | 5 |
| RUTE_DANAU | (-84,32) → (-108,16) → (-128,-2) → (-146,-14) → (-155.5,-17.5) | 4 |
| RUTE_HUTAN | (64,-8) → (95,-30) → (130,-55) → (155,-78) → (168,-88) | 4 |
| RUTE_GUNUNG | (3.5,-124) → (1,-150) → (0,-165) | 2 |

Konektivitas rute setapak (dari koordinat ujung):
- **Nyambung:** RUTE_BARAT ujung (-131,17) = awal RUTE_SEKOLAH ✓; RUTE_BARAT titik (-84,32) = awal
  RUTE_DANAU ✓. Jadi Barat–Sekolah–Danau membentuk satu rantai kontinu.
- **Buntu:** RUTE_DANAU berakhir (-155,5,-17,5) — 24,5 m dari tepi Danau Cermin (-180,-20, air 44×44
  di (-180,-20)); tidak ada strip lanjutan ke dermaga Danau Cermin (dermaga papan x -157,2..-172,4
  di z=-20). RUTE_HUTAN berakhir (168,-88) di tengah Hutan Pinus tanpa tujuan. RUTE_GUNUNG
  berakhir (0,-165) — 60 m sebelum puncak Gunung Awan (0,-225, teras atas); jalur ke puncak
  hanya "landai spiral" di mesh gunung, bukan jalan.
- **Awal RUTE_BARAT (-12,8)** berada di r=14,4 — tepat di atas jalan lingkar plaza (cincin
  r 14–20,5). Awal RUTE_HUTAN (64,-8) tidak tersambung ke apa pun (ujung bebas di padang timur).

### 1d. Penilaian jaringan jalan

**Bukan kota yang bisa dilalui — tempelan + rantai setapak.** Alasannya:
1. Jalan utama (jalan-raya GLB) tidak terdokumentasi di kode — tidak ada yang bisa membuktikan
   ia menghubungkan plaza ↔ boulevard City Walk ↔ pasar ↔ sekolah ↔ distrik selatan.
2. Rute setapak hanya melayani koridor barat (plaza → pelabuhan → danau → sekolah). **Tidak ada
   jalan kode sama sekali ke:** deret toko City Walk (z -44..-68), distrik utara/menara
   (z -92..-122), kawasan selatan (foodcourt/kolam/konser/skatepark/taman bunga, z 100..180),
   3 rumah warga (x 140–165), perkemahan/tenda (x 163–177, z -86..-95), danau GLB (-120,-40).
3. Kawasan selatan (daratan 170×90 di (0,180)) hanya punya plaza/konser/skatepark/taman bunga
   yang diletakkan 60 m berjauhan tanpa satu pun jalan penghubung di kode.
4. Satu-satunya "jalan" yang pasti kontinu adalah cincin plaza r 14–20,5 + rantai setapak barat.

## 2. Zonasi

Titik nol: air mancur Blender di (0,0,0) + menara jam di (0,0,-18,6). Pulau utama silinder r=60
di (0,0); lobus tenggara r=25 di (40,40); lobus utara r=34 di (0,-100); lobus City Walk r=20
di (3,5,-58); daratan selatan kotak 170×90 di (0,180).

### 2a. Plaza pusat (r ≈ 0–35)
Gedung G01–G10 membentuk cincin r 27–35 mengelilingi plaza; jarak antar gedung berurutan
15,6–20,0 m (G01–G02 18,1; G02–G03 16,8; G03–G04 15,6; G04–G05 18,2; G07–G08 20,0;
G08–G09 19,2; G06–G01 19,7). Semua fasad diputar menghadap air mancur (0,0) — komentar
tiap blok mengklaim itu dan rotasi konsisten (mis. G01 ry=1,091+π, G04 ry=2,761+π).
Kollider tiap gedung = 1 lingkaran r 3,95–5,35 di pusat (baris 1406; lebar/dalam kode).
**Catatan:** komentar tiap gedung mengklaim "Skala seragam 10.0 / 15.45 …" (mis. G01 baris
1407, G04 baris 1452) tetapi **callback loader TIDAK PERNAH memanggil `scale`** — semua
G01–G10 dimuat skala 1,0. Komentar skala itu basi (era Hunyuan) atau skalanya hilang;
ukuran sebenarnya hanya ada di dalam GLB (`BUTUH GEOMETRI`).

### 2b. City Walk / deret toko (boulevard x -6,2 / 13,2; z -44..-68)
- 8 toko: barat x=-6,2 (Kopi Senja -44, Roti -52, Buku -60, Bunga -68), timur x=13,2
  (Es Krim -44, Studio Foto -52, Teh -60, Mainan -68). Jarak antar toko sebaris 8 m;
  kollider tiap toko = 3 lingkaran r 2,99/3,25 sepanjang sumbu hadap (baris 3300/3486).
  Fasad menghadap boulevard (barat ry=+π/2, timur ry=-π/2) — benar.
- Lobus City Walk (3,5,-58) r=20 menutupi toko z -44..-68 — komentar baris 3112–3117
  mengakui toko tadinya "berdiri di atas air" (pulau utama r=60 habis di z=-60).
  Lobus r=20 berpusat (3,5,-58): toko Bunga/Mainan di z=-68 berada 10 m dari pusat lobus,
  masih di dalam r=20 (tepi lobus z=-78) — pas-pasan, 10 m dari tepi air.
- **Lampu boulevard: SEMUA 6 lampu di x=8,2** (baris 3054–3062). Komentar mengklaim "dua
  baris bergantian sisi tiap ±12 m", tetapi rumus `((zl/12)%2===0)?-1.2:8.2` untuk
  zl=-28,-40,-52,-64,-76,-88 TIDAK PERNAH menghasilkan -1,2 (zl/12 = -2,33…-7,33, %2 ≠ 0).
  Akibat: sisi barat boulevard gelap total; 6 lampu berderet di sisi timur, di tengah
  jalur antara toko timur (x=13,2) dan bangku timur (x=8,4).

### 2c. Pasar Malam (koridor x 10,5–46, z ±10,5)
- Gerbang pasar (13,2,0,0) di mulut koridor ✓. Kios: 14 kandidat (x=16..46 step 5 × z=±6,5),
  filter tabrakan menggugurkan 6 → **8 kios hidup**: (16,±6,5), (21,6,5), (36,±6,5),
  (41,±6,5), (46,-6,5). Yang gugur: (21,-6,5) & (46,6,5) karena gerobak; (26,6,5),
  (31,6,5) karena kollider G07 r=3,95; (26,-6,5), (31,-6,5) karena kollider G08 r=4,65.
  (Hitung dari `penabrakAsli` + kollider kode; pohon acak kota bisa menggugurkan tambahan
  saat runtime — jumlah akhir runtime-dependent.)
- **Kios TIDAK berderet rapi:** ada lubang 10 m di x=26–31 (kedua sisi) tepat di depan
  G07/G08 — koridor pasar terpotong dua deret gedung plaza. Kios (16,±6,5) hanya 7,1 m
  dari gerbang — macet di pintu masuk.
- Gerobak pasar (19,5,-4,2) dan (44,4,2); gerobak es krim pantai (6,5,55,5) — jauh dari
  pasar, di Pantai Selatan, sendirian.

### 2d. Sekolah (rect x -250..-170, z 38..88; gerbang (-170,60) celah z 57–63)
- Gedung utama (-205,45,3), perpustakaan (-228,60), kantin (-207,76), aula (-178,75,5),
  gym (-193,76), lab (-243,76). Baris z=76: aula–gym 15,0 m, gym–kantin 14,0 m — rapat
  tetapi tidak tumpang tindih (lebar gedung kode kantin 10 m, aula/gym belum terukur).
- **Lapangan olahraga kode (-225,76) 18×12 tumpang tindih dengan baris gedung?**
  Lapangan x -234..-216, z 70..82; kantin di (-207,76) di luar x lapangan ✓; lab di
  (-243,76) di luar ✓; tetapi **perpustakaan (-228,60) hanya 16,3 m dari pusat lapangan
  dan 10 m dari tepi lapangan (z=70)** — lapangan menempel nyaris ke perpus.
- Mancur sekolah (-205,60) tepat di tengah poros gerbang→lapangan ✓ (komentar baris
  4688–4690 mengklaim poros lurus z=60 — terkonfirmasi: gerbang (-170,60), mancur
  (-205,60), gedung utama (-205,45,3)).
- **Mancur kedua (-243,84) hanya 8,0 m dari lab (-243,76)** — mancur menempel dinding
  lab (kollider mancur r=2,5; tapak lab belum terukur — `BUTUH GEOMETRI`).
- Pagar sekolah: 121 modul tiang menutup semua sisi kecuali celah gerbang z 57–63 ✓;
  pagar peternakan: 56 segmen, celah timur x=-134, z 13,5–19,5 (5,3 m, disengaja).

### 2e. Distrik utara (lobus (0,-100) r=34; plaza mini r=14 di (0,-105))
- 6 menara persis di cincin r=20,0 mengelilingi (0,-105) ✓ (jarak berurutan 16,5–20,9 m).
  Tugu di (0,-105) pusat plaza mini ✓. Lampu 4 + bangku 4 + pohon 4 di cincin r 11,5/4,2/12,5 ✓.
- Menara kode lama (MENARA_U0..5) tetap dibangun lalu `visible=false` saat GLB sukses —
  pola swap benar; tetapi **menara GLB dan menara kode berbagi posisi yang sama** (grupLama
  di (px,pz) yang sama) — bila GLB gagal, kota tetap punya menara kode; bila sukses,
  kode disembunyikan. Bukan dobel-tampil, tapi dobel-bangun.
- **Celah selatan cincin menara (sudut 3,65 rad kosong)** disengaja untuk boulevard —
  tetapi boulevard (jalan-raya GLB) tidak terdokumentasi, jadi tidak bisa dipastikan
  celah itu benar-benar tersambung jalan.

### 2f. Rekreasi selatan (daratan (0,180), 170×90)
- Konser (0,180), skatepark (-60,180), taman bunga (60,180) — segaris z=180, jarak
  60 m satu sama lain, tanpa jalan penghubung di kode. Foodcourt (60,100) 80 m dari
  taman bunga; kolam (-40,120) 102 m dari foodcourt. Semua berdiri sendiri di hamparan
  rumput 170×90 tanpa trotoar/jalan.
- Lapangan olahraga GLB (80,-80) dan taman bermain (120,-60) di timur: jarak 44,7 m,
  tanpa jalan. Rumah warga (150,20), (165,35), (140,45): jarak 21–27 m, **tanpa jalan
  sama sekali** — RUTE_HUTAN terdekat berakhir (168,-88), ~110 m dari rumah terdekat.
  Perkemahan/tenda (163,-95) & (177,-86) + api unggun (170,-90): juga tanpa jalan
  (RUTE_HUTAN lewat (155,-78), 17–20 m dari tenda — nyaris, tapi tidak sampai).

### 2g. Air & pelabuhan
- **Dua danau di barat yang berdekatan:** Danau Cermin (air shader 44×44 di (-180,-20),
  baris 4437) dan danau GLB di (-120,-40) (baris 8104). Jarak pusat 67 m. RUTE_DANAU
  berakhir (-155,5,-17,5) — di antara keduanya, tidak mencapai dermaga mana pun.
  Dermaga Danau Cermin: papan x -157,2..-172,4 di z=-20 (menjulur dari darat ke danau ✓).
- **Sungai GLB (0,0,0, tanpa transform):** geometri baked — dari kode tidak diketahui
  sungai mengalir ke mana. Dua jembatan batu di (45,3,-21,7) dan (44,4,56,0) —
  keduanya di x≈45, selisih z 77,7 m — mengisyaratkan sungai mengalir utara–selatan
  di sekitar x≈45, TETAPI toko timur (x=13,2) dan kios (x≤46) berada di koridor yang
  sama; apakah sungai memotong koridor pasar / jalan ke dermaga tidak bisa dijawab
  dari kode (`BUTUH GEOMETRI` — audit bagian 2 wajib mengukur bbox sungai).
- Perahu: merah (-68,5,5,8), biru (-75,-5,9), hijau (-62,5,-5,3) — ketiganya di ujung
  dermaga barat (dek x -59,9..-80,6, z 0) ✓, mengapung di laut (y -0,28, air laut y -0,45).
- Laut: shader 840×840 di y=-0,45 menutup seluruh dunia; pulau r=60 + lobus-lobus di
  atasnya. Pantai Selatan: elips (x/47)²+((z-61,5)/20)²≤1 di sekitar (3,5,61,5) —
  gerobak es krim (6,5,55,5) di dalam elips ✓; foodcourt (60,100) di luar elips ✓.

## 3. Daftar temuan bernomor

Skala keparahan: **KRITIS** = merusak fungsi/terlihat jelas di permainan; **SEDANG** = salah
logika tapi masih bisa dimainkan; **RINGAN** = kosmetik/dokumentasi.

| No | Temuan | Lokasi | Bukti (baris) | Parah |
|---|---|---|---|---|
| A1 | **Menara jam berdiri DI ATAS jalan lingkar plaza** (r=18,6; cincin jalan r 14–20,5) dan **kollidernya salah tempat**: `penabrak r=4,0` di (0,0) padahal model di (0,-18,6) — pemain bisa jalan menembus menara jam, dan air mancur di (0,0) yang dikollide | (0,-18,6) & (0,0) | 975–982 (posisi), 968–969 (kollider di 0,0, komentar "clock tower 7x7m") | KRITIS |
| A2 | **Jalan utama kota tidak terdokumentasi**: `jalan-raya-blender-v1.glb` dimuat tanpa transform; segmen/konektivitas hanya ada di dalam file GLB, tidak di kode | seluruh kota | 8226–8245 (tanpa position/rotation/scale) | KRITIS |
| A3 | **Tidak ada jalan ke 8+ kawasan**: toko City Walk, distrik utara, kawasan selatan (konser/skatepark/taman bunga/foodcourt/kolam), 3 rumah warga, perkemahan — hanya koridor barat yang punya rute setapak | kota timur/selatan/utara | 4415–4420 (hanya 5 rute barat), 8226 (jalan GLB tanpa data) | KRITIS |
| A4 | **Air mancur Hunyuan plaza dimuat tapi tidak terlihat**: grup `mancur` tidak pernah `scene.add` (baris 971, `// scene.add(mancur);` — "FOUNTAIN REMOVED 2026-11-01") tetapi loader `air-mancur.glb` baris 1087 tetap jalan dan menempelkan model ke grup mati | (0,0,0) | 938–939, 968–971, 1087–1107 | SEDANG |
| A5 | **Lampu boulevard semua di satu sisi**: 6 lampu di x=8,2; rumus sisi `((zl/12)%2===0)` tidak pernah benar untuk zl=-28..-88; komentar "dua baris bergantian" salah | boulevard x=8,2, z -28..-88 | 3054–3062 (rumus), 3045–3047 (komentar) | SEDANG |
| A6 | **Kios pasar berlubang**: hanya 8 dari 14 kandidat hidup; lubang 10 m di x=26–31 kedua sisi karena kollider G07/G08 — koridor pasar terpotong gedung plaza | pasar x 16–46, z ±6,5 | 2800–2806 (filter), 1406 (kollider G r 3,95/4,65) | SEDANG |
| A7 | **Kollider menara jam salah + air mancur dikollide ganda**: r=4,0 di (0,0) menutupi air mancur Blender (Ø 4,4 m) yang memang di (0,0) — kollider itu benar untuk mancur tapi dikomentari "clock tower" | (0,0) | 968–969 | SEDANG |
| A8 | **Dua danau barat tanpa akses jalan**: Danau Cermin (-180,-20) dan danau GLB (-120,-40); RUTE_DANAU buntu di (-155,5,-17,5) | barat x -120..-180 | 4413 (RUTE_DANAU), 4437, 8104 | SEDANG |
| A9 | **Rumah warga tanpa jalan**: 3 rumah (150,20), (165,35), (140,45) — jalan terdekat RUTE_HUTAN berakhir (168,-88), ~110 m jauhnya | timur x 140–165 | 8045–8047, 4413 | SEDANG |
| A10 | **Mancur kedua menempel lab**: (-243,84) hanya 8,0 m dari lab (-243,76) | sekolah (-243,84) | 5287, 5311 | SEDANG |
| A11 | **Sungai misterius**: posisi (0,0,0) tanpa transform; dua jembatan di x≈45 mengisyaratkan alur N–S, tapi apakah sungai memotong pasar/jalan tidak bisa dijawab dari kode | x≈45, z -21,7 & 56,0 | 1021–1036, 1055–1067 | SEDANG |
| A12 | **Komentar skala gedung basi/salah**: G01 "Skala 10.0", G04 "Skala 15.45" di komentar tetapi callback tidak pernah set skala (semua skala 1,0); komentar kollider G07 "r 5,35" vs kode r=3,95, G08 "r 3,95" vs kode r=4,65 | G01–G10 | 1407, 1452, 1739, 1476–1487 | RINGAN |
| A13 | **Toko Bunga/Mainan di ujung lobus**: z=-68, tepi lobus City Walk z=-78 — hanya 10 m dari air; komentar mengakui toko tadinya berdiri di atas air | (∓6,2/13,2,-68) | 3112–3124 | RINGAN |
| A14 | **Rute setapak buntu**: RUTE_DANAU, RUTE_HUTAN, RUTE_GUNUNG berakhir tanpa tujuan (danau/puncak/hutan) | (-155,5,-17,5), (168,-88), (0,-165) | 4415–4420 | RINGAN |
| A15 | **Lapangan sekolah menempel perpustakaan**: tepi lapangan z=70 hanya 10 m dari perpus (-228,60) | sekolah (-225,76) | 4902, 4795 | RINGAN |
| A16 | **Jalan lingkar + plaza + trotoar bertumpuk**: 3 bidang di y 0,022/0,03/0,04 dengan tumpang tindih annulus r 13,2–14 (jarak vertikal 1 cm) — lihat blink.md B4 | plaza r 13,2–14 | 922–937 | SEDANG |
| A17 | **Gerbang pasar 7,1 m dari kios pertama** (16,6,5) — antrean masuk pasar langsung menabrak kios | (13,2,0) → (16,6,5) | 2643–2651, 2800 | RINGAN |
| A18 | **Pohon/pinus/awan acak tiap load**: 379 vegetasi + 9 awan memakai `Math.random()` — tata letak kota berubah setiap kali halaman dibuka; pohon bisa tumbuh menabrak kios (filter kios memakai `penabrakAsli` yang berisi pohon acak) | seluruh kota | 1771–1795, 4643–4654, 5424–5445, 5899–5908 | SEDANG |

## 4. Yang BENAR dari kode (untuk keadilan audit)

- Semua fasad G01–G10 diputar menghadap plaza (0,0) — konsisten.
- 6 menara tepat di cincin r=20,0 mengelilingi plaza mini (0,-105); tugu di tengah.
- Sekolah: poros gerbang→mancur→gedung utama lurus di z=60; pagar menutup semua sisi kecuali celah gerbang z 57–63.
- Perahu bertiga di ujung dermaga; jembatan batu 2× di x≈45; foodcourt/kolam/konser/skatepark/taman bunga semua di dalam daratan selatan 170×90.
- Kollider gedung/toko/kios/gerobak diukur dari bbox GLB (komentar audit 2026-10-25 #B3) — niatnya benar; masalahnya ada di penempatan, bukan di kollidernya.
