# LAPORAN AUDIT + RENCANA TATA ULANG — KOTA LUMINA

**Situs:** https://kota-lumina.vercel.app/ · **Tanggal:** 2026-11-09 (WITA)
**Sumber yang diaudit:** `index.html` 8.256 baris, MD5 `0083845b38b99c6d0f9544e5c732962f` (terverifikasi sama sebelum dan sesudah Fase B — **file TIDAK diubah**)
**Cakupan:** Fase A = audit (selesai) · Fase B = rencana zonasi + koordinat baru (dokumen ini) · **Fase C = eksekusi (belum jalan)**
**Bukti ukur:** `audit/bbox.json` (365 instansi), `audit/penempatan.json` (337 entri), `audit/jalan-zonasi.md`, `audit/blink.md`, `audit/geometri.md`, `audit/plan/peta-jalan-sungai.txt`
**Rencana mesin-terbaca:** `audit/plan/rencana.json` · **Peta rencana:** `audit/plan/peta-rencana-baru.svg` · **Verifikasi rencana:** `audit/plan/verify_rencana.py`, `audit/plan/tri_test.py`

---

# BAB 1 — RINGKASAN AUDIT FASE A

## 1.1 Angka per kategori

| Kategori | Jumlah | Rincian |
|---|---|---|
| File GLB di disk | 134 (192,2 MB) | 68 di-load (104,4 MB); 64 file 0-referensi (80,2 MB); 39 duplikat versi lama |
| Instansi kota diukur | 365 (GLB 308 + prosedural 57) | File GLB unik ditempatkan: 64 (+ awan = 65) |
| Tabrakan padat-vs-padat (AABB + Y) | **17** | KRITIS 7, SEDANG 5, RINGAN 5 |
| Tembus permukaan (jalan/air/cincin) | **87** | KRITIS 41, SEDANG 16, RINGAN 28, DIHARAPKAN 2 (jembatan/perahu) |
| Dobel (file + posisi sama persis) | **1** | D1: pagar tiang sekolah 2× di (-250,38) |
| Z-fighting dalam GLB | **0 bidang** | Tapi winding terbalik: **3.508 segitiga** (3.368 di `sungai-blender-v4.glb` = 3,76%) |
| Permukaan tanah sebidang (< 2 cm) | **21 pasangan** | Z1–Z21: lobus/pulau/plaza/jalan bertumpuk di Y yang sama |
| Temuan jalan + zonasi | **18 (A1–A18)** | 4 KRITIS, 9 SEDANG, 5 RINGAN |
| Temuan blink | **B0–B5** | highp sudah aktif (B0); 3 pola blink masih ada (B1–B4) |
| Temuan non-tabrakan | **8 (F1–F8)** | Termasuk G04 terkubur, lampu boulevard satu sisi, dermaga tanpa air |

## 1.2 Temuan terparah

| # | Temuan | Bukti |
|---|---|---|
| 1 | **Lapangan Olahraga 84×56 m berdiri di laut + sungai** (888 m² laut, 407 m² sungai) dan **menabrak Taman Bermain 105,13 m²** | G1, T1–T2 |
| 2 | **3 rumah warga + foodcourt 100% di laut** (201–306 m² tiap rumah, foodcourt 280 m² + 6,25 m² sungai), tanpa jalan | T5–T8, T46, A9 |
| 3 | **Gedung G04 TERKUBUR**: bbox lokal y −14,90..4,16 — ~75% volume di bawah tanah, hanya bola balkon muncul | F8, T10 |
| 4 | **Gedung Konser 318–344 m² di atas jalan-raya** (jalan selatan); G02/G05/G07/G08/G10 + gerbang + toko + konser + skatepark + taman bunga + semua kios memotong jalan-raya | T3, T11–T18, T28–T39 |
| 5 | **Menara Jam di tengah jalan lingkar** (43,75 m²) + jalan-raya (27 m²), dan **kollidernya salah tempat** (r=4,0 di (0,0), model di (0,−18,6)) — pemain bisa jalan menembus menara, air mancur yang terkollide | A1, A7, T13/T17 |
| 6 | **Deret toko City Walk saling menembus** (Roti×Kopi 32,10 m²; Roti×Buku 23,12 m²; Es Krim×Studio 19,06 m²; Teh×Mainan 13,74 m²; Studio×Teh 8,96 m²) — jarak antar toko 8 m < kedalaman tapak 9,5–11,4 m | G2–G4, G6, G10 |
| 7 | **Kios pasar berlubang + di sungai**: hanya 8 dari 14 hidup (filter kollider lingkaran); Kios 13/14 100% di sungai, Kios 11/12 menjepit tepi sungai; G07/G08×Kios 9,77–14,45 m² | A6, G5, G7–G9, G11, T24/T40 |
| 8 | **Sungai × jalan-raya 307 m²** (jalan E–W melintasi sungai tanpa jembatan) dan **Danau × jalan 90–101 m²** | T4, T9 |
| 9 | **Blink**: plaza/jalan/trotoar bertumpuk selisih 1 cm tanpa `polygonOffset` (0 kemunculan di file); kaca toko opacity 0,55 tanpa `depthWrite:false`; pop-in vegetasi 138/148 m; 3 mesh air di satu mancur; air-mancur Hunyuan dimuat tapi tak terlihat | B1–B4 |
| 10 | **Jalan utama tidak terdokumentasi** (`jalan-raya-blender-v1.glb` tanpa transform) + **tidak ada jalan ke 8+ kawasan** (toko, utara, selatan, rumah, perkemahan) | A2, A3 |

## 1.3 Temuan TAMBAHAN Fase B (tidak ada di audit Fase A — ditemukan saat menyusun rencana)

| # | Temuan | Bukti |
|---|---|---|
| TB1 | **Kolam Renang 32×25 m (800 m²) 100% di laut di (−40,120)** — lolos dari daftar T audit. Terkonfirmasi dengan `DI_DARAT` audit + `dalamArea()`: tidak satu pun klausul darat mencakup titik itu. | Cek ulang §2.2; kolam dipindah ke (30,155) |
| TB2 | **`dalamArea()` tidak mengenal daratan selatan** (x −85..85, z 135..225) — pemain tidak bisa jalan di seluruh zona rekreasi selatan (`langkahSah` memblokir). | `index.html` 2042–2069; perbaikan kode #12 |
| TB3 | **F7 terkonfirmasi**: air shader Danau Cermin 44×44 di (−180,−20) y=−0,12 **terkubur di bawah kotak Padang Barat** (atas y=0, `daratan5(-250,-61,-71,91)`) sehingga tak terlihat; cincin pasir y=0,012 adalah satu-satunya yang tampak. | `index.html` 4385, 4437–4445 |
| TB4 | **Markings jalan-raya HANYA di jalan N–S** (372 tris, x −3,5..3,5, z 22..177,8). Jalan E–W (z −8..8, lebar 16 m) tanpa satu pun marka kendaraan → dasar keputusan koridor pasar pejalan kaki. | Node `Markings` GLB jalan-raya |
| TB5 | **Angkat G04 (y+14,90) saja TIDAK cukup**: uji segitiga alas baru masih 40,44 m² di cincin plaza (min-r alas 14,13). Perlu geser radial +8 m. | `audit/plan/tri_test.py`, `g04_diag.py` |
| TB6 | **Jalan terukur (bukan perkiraan)**: N–S x −4..4 (bukan 0..10); E–W z −8..8, x −122..54; selatan z 177..183, x −52..52; barat x −90..−86. Sungai meander, tepi barat x 42–49 (z −20..20). | `audit/plan/probe.py` (sampling 1 m) |
| TB7 | **AABB `bbox.json` lebih longgar dari geometri GLB** (mencakup kotak fallback kode, mis. Kopi Senja Y maks 7,94 vs GLB 4,67) → tabrakan AABB harus diadjudikasi uji segitiga sebelum dinyatakan nyata. | `tri_test.py` |

---

# BAB 2 — RENCANA ZONASI + PERPINDAHAN

## 2.1 Zonasi baru (kerangka tetap, jalan GLB tidak digeser)

| Zona | Wilayah | Isi setelah rencana |
|---|---|---|
| 1. Plaza pusat | r 0–35 di (0,0) | Air mancur (0,0) + cincin G01–G10 (G02 pindah ke celah timur-laut, G04 terangkat + geser, G05/G07/G08/G10 keluar jalan) |
| 2. Tulang punggung jalan | N–S x −4..4; E–W z −8..8 (koridor pasar pejalan kaki); selatan z 177..183 | Tetap (GLB baked). Semua bangunan keluar dari permukaannya |
| 3. City Walk | Lobus (3,5,−58) **diperbesar r 20→32** | 8 toko dijarangkan (spasi 12–13 m) + geser keluar jalan boulevard; fasad tetap menghadap boulevard |
| 4. Pasar Malam | Koridor x 10,5–46, z ±10,5 | Gerbang (22,5,0); 8 kios baru x 23,5–38,5, z ±6,8; 2 gerobak di luar cincin/sungai; lorong tengah z −4,5..4,5 bebas |
| 5. Sekolah | x −250..−170, z 38..88 (tetap) | Hanya mancur kedua, pohon T2, bangku T2, 1 tiang pagar yang berubah; lapangan vs perpus TETAP (celah 2,9 m) |
| 6. Rekreasi selatan | Daratan (0,180) 170×90, 4 kuadran | Utara jalan: skatepark, kolam, taman bunga · Selatan jalan: taman bermain, konser, foodcourt (lihat §2.3) |
| 7. Timur (Hutan Pinus) | x 60–245, z −165..−15 | **Lapangan Olahraga (190,−45)** + 3 rumah berkelompok (75,−35) / (100,−55) / (125,−30), akses via RUTE_HUTAN + spur |
| 8. Air di tepi | Sungai x 40–57; Danau Cermin (−180,−20); laut sekeliling | Danau GLB pindah ke (−180,−20) di bawah dermaga; semua bangunan/kios/gerobak keluar dari air |

## 2.2 Keputusan besar (yang ditetapkan — dengan justifikasi)

1. **G04: y +14,90 DAN geser radial +8 m ke (−15,37,4).** Alasan: angkat saja tidak cukup (TB5: alas baru 40,44 m² di cincin). Setelah +8 m: alas-di-cincin 0,00 m² (uji segitiga), min-r alas 22,13. **Wajib render-verifikasi Blender sebelum deploy** (badan terangkat y 0..14,9; bola balkon 14,9..19,06).
2. **Menara Jam → (−25,−46)** (sisi barat boulevard). Alasan: celah cincin r 21–26 terlalu sempit (lebar 5 m < tapak 7,8 m) → opsi cincin GAGAL; ujung boulevard utara ditempati cincin Menara Utara. Kollidermu ikut pindah ke (−25,−46, r 4,0); kollider (0,0) dipertahankan dengan label benar "air mancur".
3. **Deret toko: PERBESAR lobus (r 20→32), bukan pindah ke selatan.** Alasan: City Walk adalah distrik bernama dengan 8 toko + lampu + bangku yang sudah jadi; memindah deret berarti membangun distrik baru. Perbesar lobus = 1 angka silinder + 1 klausul `dalamArea` (19,5→31,5). Toko dijarangkan ke spasi 12–13 m (dari footprint asli + celah ≥1 m) dan digeser keluar jalan boulevard (barat x −8,4 / timur x 15,2).
4. **Lapangan Olahraga → Hutan Pinus (190,−45), BUKAN daratan selatan.** Alasan: daratan selatan terbagi jalan N–S + jalan selatan menjadi 4 kuadran maks 80×41 m; tapak 84×56 tidak muat di kuadran mana pun tanpa melintasi jalan. Alternatif ini dicatat eksplisit (bukan diam-diam ganti). Taman Bermain tetap ke rekreasi selatan (−60,200).
5. **3 rumah + foodcourt ke darat terkonfirmasi.** Rumah berkelompok di Hutan Pinus (jarak antar rumah 9,9–10,7 m, semua titik tapak lolos `DI_DARAT`/`dalamArea` + bebas sungai/jalan) + setapak spur ke RUTE_HUTAN. Foodcourt ke rekreasi selatan (65,200).
6. **Koridor pasar E–W = JALAN PASAR PEJALAN KAKI (bukan jalan kendaraan).** Alasan: node `Markings` hanya ada di jalan N–S (TB4); lebar 16 m tanpa marka; gerbang + gerobak memang di tengahnya by design. Konsekuensi: kios boleh di z ±6,8 (tepi), lorong tengah z −4,5..4,5 wajib bebas, gerbang melintasi lorong by design (seperti jembatan di atas sungai).
7. **Filter kios diperbaiki (footprint asli, bukan kollider lingkaran).** Slot baru 8 kios (x 23,5/28,5/33,5/38,5 × z ±6,8); 6 slot lama dihapus (2 di cincin, 2 di sungai, 2 menabrak G07/G08).
8. **Danau: pindahkan danau GLB ke (−180,−20), BUKAN pindahkan dermaga.** Alasan: dermaga adalah kode (dek + `dalamArea` + `tinggiTanah` + RUTE_DANAU + lampu + bangku + peti) — memindahnya rewrite besar; GLB pindah = 1 posisi (+0,03 cegah z-fight). Air GLB (y 0,16–0,22) jadi terlihat di bawah dermaga; air shader + cincin pasir lama dihapus.
9. **Mancur kedua → (−238,84)** (geser timur 5 m; celah ke lab 1,02 m).
10. **Lapangan sekolah TETAP** (celah 2,9 m ke Perpustakaan sudah ≥1 m — tidak perlu geser). **Lampu jalan/boulevard/plaza TETAP** di tepi jalan (tiang 0,25–0,5 m², RINGAN, penempatan normal). **Pohon Bingkai Menara di cincin TETAP** (tajuk di atas jalan, batang di luar jalan — T59 diterima).

## 2.3 Denah rekreasi selatan (daratan 170×90, jalan N–S x −4..4 + jalan selatan z 177..183)

| Kuadran | Objek (posisi baru) | Celah terdekat |
|---|---|---|
| Barat-laut (x −85..−5, z 135..176) | Skatepark (−60,155) | 30,7 m ke Taman Bermain |
| Timur-laut (x 5..85, z 135..176) | Kolam Renang (30,155); Taman Bunga (65,155) | 9,0 m antar keduanya |
| Barat-daya (x −85..−5, z 184..225) | Taman Bermain (−60,200) | 30,7 m ke Skatepark |
| Tenggara (x 5..85, z 184..225) | Gedung Konser (30,204); Food Court (65,200) | Konser 1,35 m ke jalan selatan & ke tepi daratan; 12,15 m ke Foodcourt |

## 2.4 Tabel perpindahan (49 pindah + 7 hapus; detail alasan di `rencana.json`)

| Objek | Posisi lama → baru | Alasan singkat |
|---|---|---|
| Menara Jam | (0,−18,6) → (−25,−46) | Di atas jalan lingkar + jalan-raya; kollider salah tempat |
| Gedung G04 | (−12,30,y 0) → (−15,37,4,y 14,9) | Terkubur; angkat saja tidak cukup (alas 40,44 m² di cincin) → geser radial +8 m |
| Gedung G02 | (−29,4) → (15,20), ry 3,785 | 44 m² di jalan E–W; celah cincin timur-laut; ry menghadap plaza |
| Gedung G05 | (6,33) → (10,33) | 28,5 m² di jalan N–S; geser timur 4 m |
| Gedung G07 | (30,10) → (30,17) | 60–68,75 m² di jalan E–W; geser utara 7 m |
| Gedung G08 | (29,−10) → (34,8,−15) | 28,5 m² di jalan E–W; celah segitiga ke G09 1,1 m |
| Gedung G10 | (−6,−33) → (−14,−33) | 50 m² di jalan N–S; geser barat 8 m |
| Toko Kopi Senja | (−6,2,−44) → (−8,4,−44) | Deret saling menembus (8,96–32,10 m²) + tepi di jalan boulevard; dijarangkan + geser keluar jalan |
| Toko Roti & Kopi | (−6,2,−52) → (−8,4,−58) | Idem; celah ke Kopi 2,6 m, ke Buku 1,4 m |
| Toko Buku & Kertas | (−6,2,−60) → (−8,4,−70) | Idem |
| Toko Bunga | (−6,2,−68) → (−8,4,−80) | Idem; tetap di darat (lobus r32) |
| Toko Es Krim | (13,2,−44) → (15,2,−44) | Idem (deret timur); tepi 1,6 m ke jalan |
| Toko Studio Foto | (13,2,−52) → (15,2,−57) | Idem; celah ke Es Krim 2,65 m, ke Teh 1,85 m |
| Toko Teh & Rempah | (13,2,−60) → (15,2,−68) | Idem |
| Toko Mainan | (13,2,−68) → (15,2,−80) | Idem; tetap di darat (lobus r32) |
| Lapangan Olahraga | (80,−80) → (190,−45) | 888 m² laut + 407 m² sungai + tabrakan 105,13 m²; selatan tidak muat → Hutan Pinus |
| Taman Bermain | (120,−60) → (−60,200) | Tabrakan 105,13 m² dengan Lapangan; ke rekreasi selatan |
| Rumah Modern | (150,20) → (75,−35) | 255,75 m² di laut, tanpa jalan; ke Hutan Pinus, spur dari (84,1,−22,2) |
| Rumah Tradisional | (165,35) → (100,−55) | 201,50 m² di laut, tanpa jalan; ke Hutan Pinus, spur dari (110,1,−40,8) |
| Rumah Cottage | (140,45) → (125,−30) | 306,25 m² di laut, tanpa jalan; ke Hutan Pinus, spur dari (114,9,−44,2) |
| Food Court | (60,100) → (65,200) | 280 m² laut + 6,25 m² sungai; ke rekreasi selatan |
| Kolam Renang | (−40,120) → (30,155) | TEMUAN BARU: 800 m² di laut (lolos audit); ke rekreasi selatan |
| Gedung Konser | (0,180) → (30,204) | 318–344 m² di jalan selatan; ke selatan jalan |
| Skatepark | (−60,180) → (−60,155) | 24–29 m² di jalan selatan; ke utara jalan |
| Taman Bunga | (60,180) → (65,155) | 12–16 m² di jalan selatan; ke utara jalan |
| Gerbang Pasar | (13,2,0) → (22,5,0) | 14 m² jalan + 1,25 m² cincin; geser timur keluar cincin (tetap lintasi lorong — by design) |
| Gerobak Pasar 1 | (19,5,−4,2) → (21,5,−11,5) | 3 m² cincin + 5 m² jalan; keluar cincin |
| Gerobak Pasar 2 | (44,4,2) → (40,11) | 6,25 m² sungai + 6,25 m² jalan; keluar sungai |


...[truncated 13555 chars]| Kios Pasar 1 (merah) | (16,−6,5) → (23,5,−6,8) | Slot lama di cincin; slot baru keluar cincin (r>21,3), bebas G07/G08 & sungai |
| Kios Pasar 2 (biru) | (16,6,5) → (23,5,6,8) | Idem |
| Kios Pasar 3 (oranye) | (21,−6,5) → (28,5,−6,8) | Idem |
| Kios Pasar 4 (merah) | (21,6,5) → (28,5,6,8) | Idem |
| Kios Pasar 5 (biru) | (26,−6,5) → (33,5,−6,8) | Idem |
| Kios Pasar 6 (oranye) | (26,6,5) → (33,5,6,8) | Idem |
| Kios Pasar 7 (merah) | (31,−6,5) → (38,5,−6,8) | Idem |
| Kios Pasar 8 (biru) | (31,6,5) → (38,5,6,8) | Idem |
| Danau (GLB) | (−120,−40,y 0) → (−180,−20,y 0,03) | Air GLB menabrak jalan 90–101 m²; dermaga tanpa air (F7) → GLB ke bawah dermaga |
| Air Mancur Sekolah 2 | (−243,84) → (−238,84) | 8 m dari lab; geser timur 5 m (celah ke lab 1,02 m) |
| Pohon T2 (prosedural) | (−182,70) → (−189,66) | Tabrakan 4 m² dengan Aula (G12) |
| Bangku T2 (prosedural) | (−226,67) → (−216,67) | Tabrakan 0,58 m² dengan Perpustakaan (G14) |
| Bangku City Walk 1 | (−1,4,−46) → (−18,−46) | 0,54 m² menabrak Kopi + 0,75 m² di jalan boulevard; ke strip luar toko barat |
| Bangku City Walk 2 | (−1,4,−74) → (−18,−74) | 0,75 m² di jalan boulevard; ke strip luar toko barat |
| Bangku City Walk 3 | (8,4,−60) → (−18,−60) | 0,75 m² di jalan boulevard; ke strip luar toko barat |
| Bangku City Walk 4 | (8,4,−86) → (24,−86) | 0,75 m² di jalan boulevard; ke strip luar toko timur |
| Palem Pantai | (−3,5,56,5) → (−8,56,5) | 3,75 m² di jalan N–S; geser barat keluar jalan |
| Palem Pantai | (3,8,58,5) → (9,5,60) | 3,75 m² di jalan N–S; geser timur keluar jalan |
| Bangku Pasar Malam 1 | (50,5,2,3) → (43,15) | 0,75 m² jalan E–W + di tepi sungai; keluar jalan & sungai |
| Bangku Pasar Malam 2 | (50,5,−1,5) → (41,−12) | 0,75 m² jalan E–W + di tepi sungai; keluar jalan & sungai |
| Lampu Bukit 1 | (30,758,23,361) → (33,26) | 0,25 m² di tapak G07 baru; y ikuti `tinggiTanah` di titik baru |

**Total: 49 objek dipindah** (G04 tercatat sekali; Palem Pantai dua instansi). Semua posisi baru terverifikasi: **0 tabrakan segitiga, 0 tembus KRITIS** (lihat §2.7).

## 2.5 Objek dihapus (7)

| Objek | Posisi lama → — | Alasan |
|---|---|---|
| Kios Pasar 9 | (36,−6,5) → — | Diganti slot baru 1–8; menabrak G08 (8,11 m²) |
| Kios Pasar 10 | (36,6,5) → — | Diganti slot baru 1–8; menabrak G07 (8,11 m²) |
| Kios Pasar 11 | (41,−6,5) → — | Diganti slot baru 1–8; menjepit tepi sungai (1,75 m²) |
| Kios Pasar 12 | (41,6,5) → — | Diganti slot baru 1–8; menjepit tepi sungai (2,25 m²) |
| Kios Pasar 13 | (46,−6,5) → — | Diganti slot baru 1–8; 100% di sungai (18 m²) |
| Kios Pasar 14 | (46,6,5) → — | Diganti slot baru 1–8; 100% di sungai (10,5 m²) |
| Pagar Tiang Sekolah | (−250,38) → — | Duplikat D1: hapus SATU dari 2 instansi di titik yang sama (satu tiang tersisa) |

**Hidup setelah rencana: 358 objek** (365 − 7).

## 2.6 Yang TIDAK dipindah (keputusan "tetap", dicatat agar tidak diusulkan ulang)

- **Lapangan sekolah (−225,76)**: celah 2,9 m ke Perpustakaan sudah ≥1 m (T29/T30 diterima).
- **Lampu boulevard/plaza/pasar/utara**: tiang di tepi jalan adalah perabot jalan (tembus ≤0,5 m²/tiang, RINGAN) — TIDAK dipindah; yang diperbaiki adalah **rumus sisi** lampu boulevard (semua di x=8,2 → bergantian −1,2/8,2).
- **Pohon Bingkai Menara di cincin (T59, 1,25 m²)**: tajuk pohon di atas jalan, batang di luar jalan — diterima (SEDANG, tidak dipindah).
- **G01, G03, G06, G09**: tidak menabrak / tidak menembus — tetap.
- **Gerbang Pasar tetap melintasi lorong pasar** (by design — keputusan §2.2 butir 6).
- **Kios tetap di atas jalan E–W (z ±6,8)** — jalan itu koridor pejalan kaki, bukan jalan kendaraan (keputusan §2.2 butir 6).
- **Menara Utara 1–8, Mercusuar, Dermaga Barat, Jembatan Batu 1–2, Perkemahan**: tetap (tidak ada temuan KRITIS).

## 2.7 Verifikasi rencana (metode + hasil)

**Metode** (`audit/plan/verify_rencana.py` + `audit/plan/tri_test.py`):
- Setiap objek pindah: AABB baru vs semua 358 objek hidup + tapak segitiga alas (grid 0,5 m) vs jalan-raya, sungai, cincin plaza, dan darat (`DI_DARAT` audit / `dalamArea`).
- Adjudikasi akhir memakai **uji segitiga grid 0,1 m** (`tri_test.pair_area` / `ring_area`), karena AABB `bbox.json` lebih longgar dari geometri GLB (mencakup kotak fallback kode).
- Kios/gerobak/gerbang di koridor E–W dikecualikan dari "jalan kendaraan" sesuai keputusan koridor pasar (§2.2 butir 6); lorong tengah z −4,5..4,5 dicek bebas.

**Hasil:**

| Ukuran | Sebelum rencana | Setelah rencana |
|---|---|---|
| Tabrakan (AABB, semua objek) | 17 | **10** — 6 artefak audit yang sudah terbukti segitiga 0 (G09×Pohon Bingkai Menara; Menara Utara 3/6×Pohon Plaza Utara; Gedung Utama×Lampu Sekolah T2; Perpus×Pohon T2 ×2) + 1 RINGAN kanopi pohon (G13, tidak berubah) + 3 yang melibatkan objek pindah tapi **uji segitiga 0,00 m²** (G10×Kopi Senja; G04×Lampu Plaza ×2) |
| Tabrakan **nyata** (uji segitiga) | 17 | **0** |
| Tembus KRITIS | 41 | **1 — T4 saja** (sungai × jalan-raya 307 m², bukan objek pindah — lihat Risiko Terbuka) |
| Tembus SEDANG tersisa | 16 | **1 — T59** (tajuk pohon di atas cincin, diterima, §2.6) |
| Tembus RINGAN tersisa | 28 | Tiang lampu/bangku di tepi jalan (penempatan normal, diterima) |
| Celah minimum (AABB) | — | **≥1,02 m** untuk semua objek pindah, kecuali 3 artefak AABB yang celah segitiga-sejatinya: G04–Lampu Plaza ≥5,9 m; G10–Kopi 2,0 m; G08–G09 1,1 m |

**Catatan kejujuran metode:** tinggi tapak dihitung dari `bbox.json` (AABB dunia); tapak segitiga GLB hanya tersedia untuk objek GLB yang diproses `tri_test.py` (G02/G04/G08/G09/G10/jembatan/lampu). Objek prosedural (kios, bangku, palem, mancur) diverifikasi AABB + jarak tepi.

---

# BAB 3 — RENCANA PERBAIKAN BLINK / KODE + RISIKO TERBUKA

## 3.1 Perbaikan blink (rencana kode — eksekutor yang menerapkan)

**Keputusan utama: pilih `polygonOffset`, JANGAN ubah nilai Y.** Alasan: menggeser Y bidang datar berisiko memotong geometri lain (mis. alas mancur y=−0,12, air danau y=−0,12); `polygonOffset` bertingkat konsisten menyelesaikan B1/B4 tanpa mengubah geometri.

| # | Lokasi | Perubahan | Alasan |
|---|---|---|---|
| 1 | `index.html` ~3052 (lampu boulevard) | Rumus sisi pakai indeks loop: `(i%2===0) ? -1,2 : 8,2` — 3 barat + 3 timur bergantian | A5/F2: rumus lama `((zl/12)%2===0)` tak pernah benar → semua di x=8,2 |
| 2 | `index.html` ~2800 (filter kios) | Ganti uji kollider lingkaran G07/G08 dengan footprint AABB asli; slot baru [23,5/28,5/33,5/38,5] × z ±6,8; hapus slot 16/21/36/41/46 | A6: filter lama menggugurkan slot yang bebas + meloloskan slot di sungai |
| 3 | `index.html` ~922–937, 4402, 4902 (bidang datar) | Aktifkan `polygonOffset` bertingkat (setapak 0, jalan lingkar −1, plaza −2, trotoar −3, garis −4) di material plaza/jalan lingkar/trotoar/setapak/garis lapangan + lobus daratan Z1–Z7. Y tidak diubah | B1/B4: selisih Y hanya 1–2 cm, `polygonOffset` = 0 di seluruh file |
| 4 | `index.html` ~3312 (`matRkKaca`) | Tambah `depthWrite:false` pada kaca toko (opacity 0,55) | B2: satu-satunya transparan tanpa `depthWrite:false` selain air mancur GLB |
| 5 | `air-mancur-blender-v1.glb` (cek Blender, bukan kode) | Ukur 3 mesh air: bila 2 sebidang (selisih Y <2 mm) hapus/geser 1; bila hanya beda tinggi, catat bukan-masalah | B3c: koplanar belum terbukti dari kode |
| 6 | `index.html` ~1297–1322 (disiplin jarak vegetasi) | Ambang tampil ≤200 m / sembunyi >220 m (dari 138/148 m) | B4.3 pop-in vegetasi |
| 7 | `index.html` ~1771–1795, 4643–4654, 5424–5445, 5899–5908 (RNG vegetasi/awan) | Ganti `Math.random()` dengan mulberry32 seed 20261023 + zona larangan (<2,1 m dari slot kios baru; di atas segitiga jalan-raya; di dalam footprint bangunan; di dalam tapak Lapangan (190,−45)+2 m & 3 rumah+2 m) | A18: vegetasi acak tiap load, pohon bisa tumbuh menabrak kios |
| 8 | `index.html` ~1021–1036 (material sungai) | `side: THREE.DoubleSide`. Tanpa rebuild GLB | 3.368 segitiga winding terbalik di `sungai-blender-v4.glb` |
| 9 | `index.html` 1087, 4888, 5338 (loader `air-mancur.glb` Hunyuan) | Hapus ketiga loader + grup mancur yang mati. Dicek aman: loader ini **tidak** mendaftarkan apa pun ke `daftarAirShader` (hanya `matAirMancur`); `mancurPrimitif` tetap sebagai fallback | A4/B3a/F1: dimuat tapi tak terlihat |
| 10 | `index.html` ~968–969, ~1406 (kollider) | Kollidermu menara jam → (−25,−46, r 4,0); kollider (0,0, r 4,0) dipertahankan dengan komentar benar "air mancur"; kollider G07/G08 → footprint AABB asli | A1/A7 |
| 11 | `index.html` ~3121 (lobus City Walk) + ~2052 (`dalamArea`) | Lobus r 20→32; klausul `dalamArea` `hypot(x-3,5,z+58)<=19,5` → `<=31,5` | Deret toko baru (Bunga/Mainan z −80) butuh darat; A13 |
| 12 | `index.html` ~2042–2069 (`dalamArea`) | Tambah daratan selatan: x −85..85, z 135..225 → `true` | TB2: pemain tidak bisa jalan di zona rekreasi selatan |
| 13 | Komentar (G01 ~1407, G04 ~1452, G07/G08 ~1476–1487, gerobak ~2818/~4110, lampu ~3045) | Perbaiki komentar basi: skala G01/G04 "10.0/15.45" → skala 1,0; kollider G07/G08 → footprint AABB; skala gerobak "1,76/2,1593" → 1,0; komentar lampu menyesuaikan rumus baru | A12/F3 |
| 14 | `index.html` ~4932–4960 (`pagarModulSk`) | Dedup tiang sudut: lewati tiang pertama segmen bila sama dengan tiang terakhir segmen sebelumnya | D1 |
| 15 | `index.html` ~4413 (RUTE_DANAU) + `jalanStrip5` | Perpanjang RUTE_DANAU ~3 m ke (−159,−18); tambah 3 setapak spur dari RUTE_HUTAN ke rumah (Modern dari (84,1,−22,2) ~16 m; Tradisional dari (110,1,−40,8) ~17 m; Cottage dari (114,9,−44,2) ~17 m — titik terdekat polyline; executor sesuaikan ke pintu) | A8/A9: akses rumah + dermaga danau |
| 16 | `index.html` ~4437–4445 (Danau Cermin) | Saat danau GLB pindah: hapus `airDanau` shader (44×44, terkubur) + cincin pasir (RingGeometry 20,3–25,2) — air & pasir digantikan GLB | F7: air shader tak terlihat, cincin pasir ganda |
| 17 | `index.html` ~8056–8209 + ~7989–8010 (posisi rekreasi/lapangan) | Terapkan posisi baru `rencana.json`. G04 y+14,9 + posisi (−15,37,4): **WAJIB render-verifikasi Blender sebelum deploy** | F8 |

## 3.2 Risiko terbuka (target 0 tidak tercapai penuh — dicatat, bukan disembunyikan)

| # | Risiko | Dampak | Yang dibutuhkan (di luar Fase B) |
|---|---|---|---|
| R1 | **T4: sungai × jalan-raya 307 m²** — jalan E–W melintasi sungai di z ≈−5..0 tanpa jembatan (2 jembatan batu di (45,3,−21,7) + (44,4,56,0) dekoratif, bukan di persilangan). | Pemain/kendaraan "menyeberang" air tanpa jembatan; satu-satunya tembus KRITIS tersisa. | GLB jembatan baru di ~(45,−2) yang menyatu dengan jalan, ATAU rebuild jalan-raya. Tidak bisa diperbaiki dengan memindah bangunan. |
| R2 | **Mandat lapangan ke daratan selatan tidak dapat dipenuhi** — kuadran selatan maks 80×41 m vs tapak 84×56 m. | Lapangan ke Hutan Pinus (alternatif yang dicatat) — jauh dari zona rekreasi; butuh akses RUTE_HUTAN + pengosongan pinus di tapak+2 m. | Keputusan pemilik: terima alternatif Hutan Pinus, atau terima lapangan lebih kecil di selatan (bukan 84×56). |
| R3 | **G04 wajib render-verifikasi Blender sebelum deploy** — badan terangkat y 0..14,9 (alas −14,90→0) mengubah tampilan total; bola balkon di 14,9..19,06. | Kalau alas GLB ternyata bukan di y lokal −14,90 (mis. ada geometri di bawah), bangunan bisa melayang/terkubur lagi. | Eksekutor: render Blender dari 4 sisi + cek `minY` dunia = 0 sebelum deploy. |
| R4 | **Veto `dalamArea` r 20,8 di Danau Cermin lebih kecil dari tapak danau GLB** (46×36) — tepi danau GLB tidak bisa diinjak. | Pemain tidak bisa jalan di tepi danau (hanya area r 20,8). | Follow-up kecil: sesuaikan klausul veto dengan tapak GLB baru. |
| R5 | **Vegetasi seeded + zona larangan butuh replay** — `Math.random()` dipakai di 4+ lokasi (vegetasi, awan, ikan, partikel); seeded RNG mengubah tampilan kota. | Tampilan vegetasi berubah dari live (acak) — perlu sekali cek visual sesudah seed. | Eksekutor: bandingkan screenshot sebelum/sesudah seed. |

## 3.3 Yang TIDAK termasuk rencana ini (di luar cakupan Fase B)

- Rebuild GLB apa pun (jalan, sungai, jembatan, danau) — hanya posisi/sudut/parameter kode.
- Karakter, debug overlay, MQTT, `water.js` — tidak disentuh.
- Optimasi ukuran file / hapus 64 GLB 0-referensi (80,2 MB) — tercatat di audit, eksekusi terpisah.
- Perbaikan winding 3.368 segitiga di `sungai-blender-v4.glb` — ditangani sementara dengan DoubleSide (butir 8); rebuild GLB adalah pekerjaan terpisah.

---

## Lampiran — Cara memverifikasi ulang rencana ini

```bash
cd ~/workspace/lumina/audit/plan
python3 verify_rencana.py    # AABB + tapak segitiga vs jalan/sungai/cincin/darat
python3 tri_test.py           # uji segitiga grid 0,1 m (adjudikasi akhir)
python3 gen_rencana.py        # bangun ulang rencana.json dari MOVES/DELETE verify_rencana.py
python3 make_svg.py           # bangun ulang peta-rencana-baru.svg
python3 probe.py              # ukur ulang jejak jalan/sungai/darat dari GLB
md5sum ../index.html          # harus tetap 0083845b38b99c6d0f9544e5c732962f
```

**File deliverable Fase B:**
- `~/workspace/lumina/LAPORAN-AUDIT-LUMINA.md` (dokumen ini)
- `~/workspace/lumina/audit/plan/rencana.json` (56 entri: 49 pindah + 7 hapus; 17 perbaikan kode; catatan jalan/sungai)
- `~/workspace/lumina/audit/plan/peta-rencana-baru.svg` (top-down 2D, 1020×750, 249 elemen, tervalidasi XML)
- Skrip: `audit/plan/verify_rencana.py`, `audit/plan/tri_test.py`, `audit/plan/gen_rencana.py`, `audit/plan/make_svg.py`, `audit/plan/probe.py`, `audit/plan/g04_diag.py`
---

# BAB 4 — EKSEKUSI FASE C+D (2026-11-09, DEPLOYED)

Detail lengkap: `audit/plan/LAPORAN-EKSEKUSI.md`. Ringkasan di bawah ini.

## 4.1 Yang diterapkan

- **Base + backup:** `index.html` MD5 `0083845b38b99c6d0f9544e5c732962f` (8.256 baris) → backup
  `index.html.bak-audit-20261109` (MD5 sama) → **85 perubahan** via `audit/plan/terapkan.py`
  (exact-match count-check) → 8.232 baris, MD5 akhir `ffcbc29e89664c0dd1721343894e51ed`.
  `node --check` 3 blok `<script>` inline: LOLOS. `index.html.bak-v24-20261109` tidak dipakai.
- **56 entri rencana.json: 49 pindah + 7 hapus, SEMUA diterapkan** (tabel lengkap di
  LAPORAN-EKSEKUSI.md §1.1) + **17 perbaikan kode, SEMUA diterapkan** (§1.2).
- **Adaptasi tercatat:** kollider ikut GLB pindah (G02/G04/G05/G07/G08/G10 + menara jam);
  RNG vegetasi aliran terpisah `acakVeg()` (bukan `acakAset()`, supaya replay `POHON_DET`
  audit tidak rusak); zona larangan kios 3,2 m + jalan-raya; filter kios dgn footprint AABB
  G07/G08; Mancur Sekolah 2 diterapkan ke grup primitif (loader GLB-nya sudah dihapus #9);
  3 loader `air-mancur.glb` Hunyuan dihapus utuh; **R4 veto danau → elips 23×18** (trivial,
  diterapkan); polygonOffset bertingkat; lobus r 20→32; daratan selatan ke `dalamArea`;
  dedup tiang pagar via Set; RUTE_DANAU + 3 spur; hapus `airDanau` shader + cincin pasir.
  Caveat: box kode toko fallback tetap di posisi lama (hanya tampil bila GLB gagal).

## 4.2 G04 — verifikasi Blender LOLOS

Render 4 sisi + dari plaza setinggi mata (Blender 4.2.9, Cycles 24 sampel):
**min-Z dunia = 0.0 persis** (tidak melayang, tidak terkubur), alas-di-cincin **0,00 m²**
(dari 40,44 m²), min-r alas 22,13 (dari 14,13). Fasad lengkap ("EMERALD GLOW", pintu
lantai dasar menapak tanah). Render di `audit/plan/verifikasi-g04/`.

## 4.3 R1 — tetap terbuka (diputuskan, bukan gagal)

Jembatan batu (18 × 5,14 m, deck melengkung y 0,53–2,86) TIDAK dipindah ke (45,-2):
deck melengkung vs jalan/pemain y≈0 → kamera menembus deck di tengah jembatan
(render bukti `verifikasi-g04/r1-jalan-mata.png`, `r1-samping.png`). Butuh GLB jembatan
baru / rebuild jalan (di luar cakupan). **T4 sungai×jalan-raya 307 m² tetap satu-satunya
tembus KRITIS nyata.**

## 4.4 Vegetasi seeded — seed rencana diganti 20261023→20261040

Replay eksak `acakVeg()` + adjudikasi segitiga menemukan seed rencana **20261023 menaruh
8 pohon di jalan/bangunan** (2 di dalam G04/G10, 4 di pelat teras toko, 2 di jalan).
Akar: kollider kode (r 3,95–5,35) lebih kecil dari tapak GLB; toko/gerobak dimuat setelah
blok kota; filter padang hanya mengecualikan jalan z -12..0. Kondisi pra-ada (versi
`Math.random` lama juga bisa begitu). Perbaikan minimal: scan seed → **20261040 = 0
pelanggaran** (uji segitiga ketat, 360 pohon; JS vs Python identik). Hanya konstanta
`_rngVeg` yang berubah. **Risiko baru R6:** celah filter struktural tetap ada — perbaikan
filter adalah pekerjaan susulan.

## 4.5 Hasil verifikasi Node (re-run `audit-geometri.mjs`, skrip di-update 57 perubahan)

| Metrik | Fase A | Sesudah |
|---|---|---|
| Instansi | 365 | 356 (−6 kios, −2 mancur Hunyuan, −1 tiang pagar) |
| Tabrakan | 17 (7 KRITIS, 5 SEDANG, 5 RINGAN) | **2 (0 KRITIS, 0 SEDANG, 2 RINGAN)** — kanopi pohon + G04×Lampu (segitiga 0,00) |
| Tembus | 87 (41 KRITIS, 16 SEDANG, 28 RINGAN, 2 DIHARAPKAN) | **40 (13 KRITIS, 2 SEDANG, 23 RINGAN, 2 DIHARAPKAN)** |
| Dobel / Z-fight | 0 / 0 | 0 / 0 |

KRITIS 13 terurai: T1 = R1 nyata (307,55 m²); T2/T3/T4 = AABB saja (segitiga 0,00 m²);
T5–T13 = 8 kios + gerbang di koridor pasar (by design, jalan pejalan kaki). SEDANG 2:
G04×trotoar (AABB saja) + tajuk Pohon Bingkai Menara di atas cincin (diterima §2.6).
Referensi GLB: 69 di kode + 6 non-GLB + index.html = **76 berkas, semua ada di disk**.
Tidak disentuh: karakter, debug overlay, MQTT, `water.js`.

## 4.6 Deploy

- Deployment **`dpl_JCoB1mSAuNkhuYF6xoLV3if82f1p`** (READY), proyek `kota-lumina`, akun hansxf-ui.
- Alias: https://kota-lumina.vercel.app
- **Verifikasi live:** MD5 `index.html` live `ffcbc29e89664c0dd1721343894e51ed` = lokal ✓;
  marker `20261040` 2×, `AUDIT 2026-11-09` 26× ✓;
  `karakter-cewek-final-v1.glb` live MD5 `b0d8f674b5ccd4e8ea1bcde1698abecd` = lokal ✓.
- **Link playtest:** https://kota-lumina.vercel.app/?fresh=20261109audit1
- Deploy sebelumnya: `dpl_CCKBrazksWKz6PiC3C3XUigWAsQZ` (2026-11-08).

## 4.7 Risiko terbuka sesudah deploy

- **R1 (tetap):** T4 307 m² — butuh GLB jembatan baru / rebuild jalan.
- **R6 (baru):** celah filter vegetasi struktural (§4.4) — seed 20261040 bersih, filter belum diperbaiki.
