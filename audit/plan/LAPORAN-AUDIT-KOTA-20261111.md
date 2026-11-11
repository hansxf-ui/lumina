# Laporan Audit Kota Lumina — 2026-11-11

Audit sistematis seluruh kota (semua area, semua objek) + perbaikan semua temuan yang bisa
diperbaiki tanpa mengubah gameplay. Dasar: LAPORAN-AUDIT-LUMINA.md + audit/plan/*.md; butir
yang sudah beres atau sudah DITERIMA pemilik tidak dikerjakan ulang.

## Metode

- **Audit raster 0,25 m** di halaman game asli (headless Chromium, swiftshader), bukan AABB
  bbox.json (AABB lama 0,05–0,45 m terlalu longgar). Semua segitiga setinggi badan (0,45–1,6 m
  di atas tanah) dirasterisasi per objek; R2/GLB merge dimatikan saat audit supaya identitas
  objek utuh. Kategori: *nembus* (pemain bisa berdiri di dalam geometri), *tembok tak terlihat*
  (diblok collider tapi >2 m dari geometri apa pun dan bisa dicapai fisik), objek saling tembus,
  melayang/tenggelam, z-fighting (muka datar koplanar beda material), muka terbalik, tekstur
  tanpa UV, bangku, jangkauan interior gedung enterable.
- Harness: `audit/plan/audit-kota-20261111/` (audit-full.js, audit.cjs, peta.js, verify.cjs,
  skrip GLB fix-g04.js, fix-kantin.js, liftfaces.js, coplanar.js + pustaka glblib/geomfix/comps).
- Render 4 sisi semua GLB terpakai (56 file) + tur 30 titik kota + peta collider per area.

## Angka sebelum → sesudah (raster 0,25 m, `?jam=10`)

| Metrik | main | PR ini |
|---|---|---|
| Tembok tak terlihat (z ≤ 130, area lama) | 488 m² | **202 m²** |
| Area kota yang bisa diinjak | 82.908 m² | **97.357 m²** (+daratan selatan) |
| Interior gym / kantin / konser terjangkau | 0 / 0 / 0 m² | **57 / 15 / 177 m²** |
| Objek melayang/tenggelam | 99 | **48** |
| Z-fighting | 563 m² | **498 m²** |
| Material bertekstur tanpa UV | 4 | **0** |
| Error JS (masuk, jalan, duduk, siang & malam) | 0 | **0** |
| Posisi vegetasi seed 20261040 (90 pohon + 289 pinus) | — | **byte-identik dengan main** |

Sisa "tembok tak terlihat" di selatan (298 m²) = air kolam renang (OBB air, memang tidak boleh
dimasuki; airnya di bawah tinggi badan sehingga terhitung "tanpa geometri"). Sisa "nembus" di
area lama (643 m²) hampir semua permukaan yang memang diinjak/dilewati: dek jembatan batu &
jembatan sungai, tepi sungai, lapangan olahraga (garis/gawang rendah), teras & kanopi toko City
Walk, PLAZA_INLAY — bukan clipping.

## Per area: temuan → perbaikan → file

### 1. Plaza pusat

| Temuan | Perbaikan | File |
|---|---|---|
| **G04 "Emerald Glow" terbalik.** Cangkang GLB v2 (atap, badan, etalase, lantai balkon) tercermin di Y: atap menancap di tanah, alas di 14,9 m; `position.y = 14.9` hanya menutupi gejala. Interior melayang 2,1 m, 8 bola balkon & 2 finial atap nyasar 4–12 m dari badan, lubang pintu terpotong di lantai teratas, pelat tembaga padat menutup kaca etalase, pot bunga melayang. Tapak "slab 6,4×18,8 m" di tabel OBB = artefak v2. | **gedung-g04-blender-v3.glb**: semua transform node di-bake ke frame benar (alas y 0), badan dibangun ulang (dinding 5 cm, bukaan etalase + pintu di lantai dasar), bingkai etalase tembaga, kaca tembus pandang (interior perhiasan terlihat), bola balkon di pegangan, finial di ujung bubungan, kabel lampu ke plafon. Loader y 0. OBB G04 di ZONA_LARANG_PEMAIN & _KAMERA = tapak nyata (−9,42; 23,45) 3,15×3,30. 3 lingkaran r 4,5 sepanjang slab dicabut (di luar snapshot pohon → vegetasi tak bergeser). Lingkaran lama di loader (−15,37,4) kini juga dilewati kamera (`tanpaKamera`). | gedung-g04-blender-v3.glb (baru), index.html |
| Tembok tak terlihat di sekeliling G02–G10: lingkaran ring (setengah-diagonal box kode lama + 0,7) menahan pemain s.d. 2,4 m dari dinding; G09 33 m², G06 23 m², G03 13 m², G02 14 m². | Lingkaran ring ditandai `tanpaPemain` (tetap untuk kamera S1 + snapshot vegetasi); pemain memakai OBB tapak nyata. Baris OBB G02/G03/G05–G10 + Menara Jam di ZONA_LARANG_PEMAIN dikoreksi ke tapak raster (+1,5 m margin bawaan tetap). ZONA_LARANG_VEG tidak disentuh. | index.html |
| **G01 (enterable): kamera tidak bisa ikut masuk** (baris G01 di ZONA_LARANG_KAMERA mendorong kamera ke luar dinding, pemain hilang di balik tembok). Collider G01 = rantai **sejajar sumbu** padahal model diputar 62° → pemain menembus sudut dinding, tertahan tembok tak terlihat di dalam toko. | Kamera: baris G01 di ZONA_LARANG_KAMERA diputar sesuai model; tabel `KAMERA_MASUK` — selama pemain di dalam tapak gedung enterable, tapak itu tidak mendorong kamera dan dolly menahan kamera 1,2 m di dalam tepi tapak. Collider: dari geometri GLB nyata (dinding, rak, kasir) dengan ambang pintu lengkung terbuka; rantai lama `tanpaPemain`+`tanpaKamera`. Terverifikasi: kamera di dalam toko, pemain + rak terlihat. | index.html |

### 2. Pasar & sungai

| Temuan | Perbaikan | File |
|---|---|---|
| Air sungai menembus daratan sebagai tambalan bergerigi: vertex shader air **mengganti** y verteks dengan tinggi gelombang (±0,15), padahal air sungai di-bake di y −0,24..−0,37 dengan node y 0 → permukaan naik ke y ≈ 0 = tinggi rumput. | Node `sungai_water` diturunkan ke rata-rata y verteksnya (puncak gelombang −0,15 < tanah 0). water.js tidak disentuh. | index.html |
| Catatan: tumpukan lobus darat di atas alur sungai GLB (R1/T4 di laporan lama) tetap terbuka — butuh desain ulang daratan/sungai, di luar cakupan. | — | — |

### 3. City Walk

| Temuan | Perbaikan | File |
|---|---|---|
| Toko Roti & Kopi v2: lantai kayu koplanar dengan alas batu di y 0,30 (z-fight 26 m², berkedip). | Lantai kayu diangkat 4 mm. | roti-kopi-toko-blender-v2.glb |
| Toko Es Krim: kaca etalase koplanar dengan rak putih (1,6 m²). | Kaca diangkat 3 mm. | es-krim-toko-blender-v1.glb |
| Menara Jam: muka atas krim/bata koplanar di y 16,2 (3 m²). | Diangkat 3 mm. | menara-jam-blender-v1.glb |

### 4. Distrik utara (menara)

| Temuan | Perbaikan | File |
|---|---|---|
| Lingkaran r 5,2–5,7 Menara Utara 1–6 + OBB berbasis bbox menahan pemain s.d. 2,5 m dari dinding (tembok tak terlihat 12–28 m² per menara). | Lingkaran `tanpaPemain` (tetap kamera); OBB pemain Menara Utara 1–6 = tapak nyata. Sisa O16/O17 (Menara 4/5) = kolong lobi berpilar yang memang tertutup dinding pilar. | index.html |

### 5. Sekolah

| Temuan | Perbaikan | File |
|---|---|---|
| **Kantin**: atap terakota, plester, batu, meja punya tekstur tapi **tanpa UV** (tekstur jatuh ke 1 texel = warna rata). | **gedung-kantin-v3.glb** = v2 + UV planar per muka (ubin atap, plester, batu, meja kini tampil). | gedung-kantin-v3.glb (baru), index.html |
| **Kantin & gym tidak bisa dimasuki**: rantai kantin menutup dinding utara penuh padahal pintu ganda GLB terbuka; lingkaran pipi tangga gym menyatu dengan dinding kantin dan menutup satu-satunya lorong ke pintu gym (interior gym 0 m² terjangkau). | Kantin: celah pintu + daun pintu + 4 meja + konter ber-collider. Gym: lingkaran pipi tangga dicabut (tangga rendah tanpa pipi). Kini kantin 15 m², gym 57 m² terjangkau. | index.html |
| Sayap kode sekolah (−228/−182, 45) menembus ujung gedung utama v4 0,25 m (2,6 + 1,9 m²). | Sayap digeser 0,4 m keluar (collider ikut, dibuat di dalam `gedungT2`). | index.html |
| Aula: rantai tangan menutup seluruh interior. | Collider dari geometri GLB (dinding, kursi, panggung, daun pintu terbuka). **Interior tetap tidak bisa dimasuki**: lantai aula di GLB ±1,5 m di atas tanah (undakan di luar pintu), sedangkan peta tinggi `tinggiTanah` tidak mengenal lantai itu, dan lorong antar kursi < lebar badan pemain. Butuh keputusan pemilik (tambah lantai di peta tinggi = perubahan gameplay). | index.html |
| Z-fighting perpustakaan (batu/nat 181 m² di y 0, list 0,9/5,5, kayu 3,02), gym, lab, gedung utama (ambang 1,1/5,6/10,1). | Muka atas yang koplanar diangkat 3–4 mm. | gedung-perpustakaan-v4.glb, gedung-gym-v4.glb, gedung-lab-v6.glb, gedung-utama-sekolah-v4.glb |
| Lampu (−120, 42) berdiri 0,44 m dari batang pinus padang — lentera tenggelam di tajuk. | Lampu digeser ke (−117,2; 41,2) (collider ikut). Vegetasi tidak disentuh. | index.html |

### 6. Padang barat

| Temuan | Perbaikan | File |
|---|---|---|
| **Pagar halaman lumbung melayang 0,5 m**: `pagar-blender-v1-segmen.glb` hanya panel rel tanpa tiang, alas y 0,50. | Diganti modul `pagar-blender-v1-tiang.glb` (tiang + panel, sama dengan pagar sekolah), tiap bentang dibagi bulat dan diregang ≤5%, rantai sudut tertutup, gerbang timur tetap terbuka. Collider tidak berubah (garis pagar sama). | index.html |
| **Dek dermaga menjalar 190 m**: profil tinggi dek (0,5 m, z ±3,4) tanpa batas barat — sejak Padang Barat menyambung di x −71, pemain melayang 0,5 m di pita itu sampai x −250 (pagar, lumbung, pohon di pita tampak tenggelam). | Batas barat x > −80,5 (ujung papan dek). | index.html |
| Lumbung: lingkaran r 5 menahan pemain 3 m dari dinding panjang. | OBB lumbung di ZONA_LARANG_PEMAIN (margin 0,55 = jari-jari pemain, kolom margin opsional baru); lingkaran tetap untuk kamera/vegetasi. | index.html |

### 7. Daratan selatan (konser, kolam, skate park, food court, taman bunga, taman bermain)

| Temuan | Perbaikan | File |
|---|---|---|
| **Seluruh daratan selatan mustahil dicapai pemain**: jalan N–S GLB melintas laut z ≈ 80..135 sebagai pita aspal tanpa daratan, dan `dalamArea()` tidak mengizinkannya. | Jembatan darat selatan x −12..12, z 76..137 (pola sama dengan jembatan darat timur/utara) + `dalamArea`. Terverifikasi: pemain berjalan dari pantai (z 70) ke z 150 tanpa macet. | index.html |
| Taman bermain, kolam renang (pagar, kursi santai, payung, pot, seluncur), skate park (ramp, rail, funbox), taman bunga (gapura, air mancur, bangku) **tanpa collider** — pemain menembus semuanya. | `pasangColliderOtomatis(model)`: collider deterministik dari geometri GLB setinggi badan (blok 0,75 m, r ≤ 0,6), dipasang di callback muat (sesudah semua snapshot vegetasi). Air kolam dikecualikan (sudah OBB). | index.html |
| Gedung Konser: rantai 2 m di utara dinding nyata (tembok tak terlihat 15 m²), 65 m² deret kursi + balkon bisa ditembus. | Collider geometri GLB (pintu utara x 26,76–33,24 tetap terbuka); rantai lama `tanpaPemain`. Interior 177 m² terjangkau. | index.html |
| Konser: plafon marmer koplanar dengan atap di y 12 (35 m²). | Plafon diturunkan 2 cm. | gedung-konser-blender-v1.glb |
| Food court: OBB 9,66×6,06 menutup seluruh area makan terbuka (38 m² tembok tak terlihat). | OBB dicabut; collider geometri (stand, meja, payung). | index.html |
| Kolam: dek koplanar dengan ubin kolam (5,4 m²). | Dek diangkat 3 mm. | kolam-renang-blender-v1.glb |

### 8. Plaza gedung lain (z-fighting kecil)

G08 (list putih & dak atap), G06 (list putih) — muka koplanar diangkat 3 mm.
File: gedung-g08-blender-v2.glb, gedung-g06-blender-v2.glb.

## Tidak dikerjakan (alasan)

- **Diterima pemilik / jangan disentuh** (STATUS + laporan lama): kaki cewek 17 cm saat duduk,
  crop top, cowok & G03 parkir, sekolah v4, pintu aula termodel, shader air (water.js termasuk
  `pow(g,400.)`), gaya UI clay, posisi lapangan/kios/gerbang, lampu & bangku tepi jalan, Pohon
  Bingkai, seed vegetasi, karakter, overlay debug, MQTT.
- **Jendela malam G01–G10 gelap**: komentar loader menyatakan sengaja tidak dikarang; menambah
  glow = mengarang desain, butuh vonis pemilik.
- **G04 tetap tidak dimasuki**: pintu di model tertutup (panel kayu), dan sebelumnya pun tidak
  pernah bisa dimasuki (tertutup lingkaran collider).
- **Aula interior**: lihat butir sekolah (lantai GLB terangkat, butuh keputusan pemilik).
- **Sungai × daratan (R1/T4)**: alur sungai GLB tertutup lobus/jembatan darat — desain ulang.
- **GLB lama tak terpakai**: tidak ada GLB yang dihapus (kebijakan laporan lama); v2 G04 &
  kantin tetap di disk.

## Verifikasi (headless Chromium, swiftshader)

`verify.cjs` siang (`?jam=10`) dan malam (`?jam=21`), tanpa injeksi:
layar masuk tampil ✓, masuk kota ✓, jalan (W) ✓, duduk di bangku (tombol Duduk muncul + duduk) ✓,
jalan ke daratan selatan ✓, collider otomatis terpasang ✓, kamera ikut masuk G01 ✓,
G04 tegak (bubungan 14,9 m, tepi atap 13,3 m) ✓, **0 error JS / 0 request gagal** ✓.
Replay vegetasi: 90 pohon + 289 pinus byte-identik dengan main.
Render bukti: `audit/plan/verifikasi-audit-20261111/`.
