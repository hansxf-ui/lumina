# Audit Geometri Kota Lumina — temuan bernomor

**Sumber:** `~/workspace/lumina/index.html` — 8.256 baris, MD5 `7dd94c422c5f8f5f0b0d34aa5940713e` (dicek skrip, cocok dengan acuan).
**Waktu audit:** 2026-11-09 10:08 (WITA, Asia/Makassar). **Skrip:** `audit-geometri.mjs` (di direktori ini, bisa diulang).
**Cakupan:** SEMUA objek kota yang ditempatkan (GLB + prosedural). DI LUAR cakupan: karakter (`karakter-*`, `klip-cewek-*`), debug overlay, MQTT, `water.js` (kecuali permukaan air sebagai pembanding).

## Ringkasan statistik (semua angka hasil hitung, bukan perkiraan)

- Instansi diukur: **356** (GLB 299 + prosedural 57); file GLB unik ditempatkan: **64** (+ awan = 65 diaudit z-fight).
- Pasangan padat-vs-padat diuji (AABB XZ + Y): **51681** dari 322 objek padat.
- Tabrakan (tumpang XZ > 0,01 m² DAN tumpang Y > 0,05 m): **2** — KRITIS 0, SEDANG 0, RINGAN 2. (Di luar itu: 97 sambungan modul pagar tiang, masing-masing ~0,02 m² rel-masuk-tiang BY DESIGN — diringkas di akhir §1, bukan dihitung sebagai tabrakan; dan 10 artefak AABB — AABB tumpang tapi segitiga 0,00 m² pada uji segitiga, lihat §1b.)
- Per klasifikasi tabrakan: vegetasi-vegetasi 1, gedung-lain 1.
- Tembus permukaan (sampling grid 0,5 m terhadap segitiga jalan/air + uji radial cincin): **40** — KRITIS 13, SEDANG 2, RINGAN 23, DIHARAPKAN 2.
- Dobel (file + posisi x,z sama persis): **0**.
- Z-fighting dalam GLB (plane-hash normal-aware, `lumina-audit-glb.mjs`): **0 bidang** dengan tumpang nyata; segitiga winding terbalik (dot<0): **3508**.
- Pasangan permukaan tanah sebidang (< 2 cm, footprint tumpang): **21**.
- Tabrakan terparah: Pohon Taman Bukit × Pohon Taman Bukit — 0.67 m².

## Cara baca

- **KRITIS** = dua bangunan/objek besar saling menembus (atau objek besar di tengah jalan/air).
- **SEDANG** = tumpang 1–10 m² antar objek padat, atau objek kecil di tengah jalan/air.
- **RINGAN** = tumpang < 1 m², kanopi pohon bersinggungan, atau lampu/bangku di tepi jalan (sering disengaja).
- **DIHARAPKAN** = jembatan di atas sungai / perahu di laut — dicatat supaya tidak dikira tembus.
- AABB = kotak pembatas sumbu-sejajar dari bbox dunia (sudut terluar setelah rotasi). Luas tumpang = luas irisan AABB di bidang XZ. Untuk jalan/air yang bentuknya bukan persegi, luas tembus dihitung dari sampling titik-di-segitiga (grid 0,5 m), bukan dari AABB jalan (AABB jalan-raya 177,7 × 291 m akan menuduh semua yang di dalamnya).
- Pohon/pinus acak (Math.random) tidak punya posisi tetap per load — lihat §5.

## 1. Tabrakan (AABB)

### G1 — RINGAN — Pohon Taman Bukit × Pohon Taman Bukit

- Klasifikasi: vegetasi-vegetasi (vegetasi × vegetasi). Luas tumpang XZ: **0.67 m²**. Penetrasi (sisi AABB tersempit): **0.26 m**. Tumpang Y: 2.52 m.
- Pusat A di (26.78, 34.54), pusat B di (26.05, 38.04).

### G2 — RINGAN — Gedung G04 × Lampu Plaza (prosedural)

- Klasifikasi: gedung-lain (gedung × perabot). Luas tumpang XZ: **0.36 m²**. Penetrasi (sisi AABB tersempit): **0.60 m**. Tumpang Y: 3.50 m.
- Pusat A di (-7.20, 17.89), pusat B di (-11.00, 11.00).

### Sambungan modul pagar tiang sekolah (dikelompokkan — BY DESIGN, bukan tabrakan)

- 97 sambungan modul berurutan, masing-masing tumpang AABB ~0,02 m² (total ~2.17 m²): rel modul (panjang 2,10 m, jarak modul 2,105 m) masuk 0,105 m ke tiang modul berikut (tiang lebar 0,22 m). Geometri modul memang dirancang begitu (rel menancap ke tiang). Tidak dihitung sebagai tabrakan.

### Artefak AABB — AABB tumpang, segitiga TIDAK bersentuhan (bukan tabrakan)

AABB kotak membesar di sudut/tepi; 10 pasangan di bawah tumpang menurut AABB tapi **0,00 m²** pada uji segitiga-vs-segitiga (sampling grid 0,05–0,1 m, 2026-11-09). Dikeluarkan dari daftar tabrakan utama.

- **A1 — Gedung Perpustakaan × Pohon T2 (prosedural)**: AABB menuduh 0.20 m². uji disc r=1,0 m grid 0,05 m (1.264 titik): 0 tumpang — pohon di luar dinding perpustakaan.
- **A2 — Gedung Perpustakaan × Pohon T2 (prosedural)**: AABB menuduh 0.20 m². uji disc r=1,0 m grid 0,05 m (1.264 titik): 0 tumpang — pohon di luar dinding perpustakaan.
- **A3 — Gedung Utama Sekolah × Lampu Sekolah T2**: AABB menuduh 0.33 m². uji segitiga grid 0,1 m: 0 tumpang — tiang lampu di luar dinding sekolah.
- **A4 — Gedung G04 × Lampu Plaza (prosedural)**: AABB menuduh 0.36 m². Fase B (posisi baru (-15,37,4)): uji segitiga 0,00 m2; celah nyata >=5,9 m dari tiang lampu.
- **A5 — Menara Utara 6 × Pohon Plaza Utara**: AABB menuduh 1.60 m². uji segitiga grid 0,1 m: 0 tumpang — pohon di dalam AABB menara tapi di luar geometri menara.
- **A6 — Air Mancur Plaza (Blender) × Bangku Plaza 6**: AABB menuduh 1.95 m². uji segitiga grid 0,1 m: 0 tumpang — piringan mancur r=5,0 m, sudut bangku terdekat r≈5,07 m.
- **A7 — Air Mancur Plaza (Blender) × Bangku Plaza 3**: AABB menuduh 1.95 m². uji segitiga grid 0,1 m: 0 tumpang — piringan mancur r=5,0 m, sudut bangku terdekat r≈5,07 m.
- **A8 — Menara Utara 3 × Pohon Plaza Utara**: AABB menuduh 2.95 m². uji segitiga grid 0,1 m: 0 tumpang — pohon di dalam AABB menara tapi di luar geometri menara.
- **A9 — Gedung G09 × Pohon Bingkai Menara**: AABB menuduh 7.21 m². uji segitiga grid 0,1 m: 0 tumpang — pohon berdiri di lekuk/setback tapak G09.
- **A10 — Gedung G10 × Toko Kopi Senja**: AABB menuduh 8.65 m². uji segitiga grid 0,05 m (1.530 titik): 0 tumpang — hanya sudut AABB yang bersentuhan.

**Kalibrasi AABB vs segitiga (pasangan NYATA yang ikut diuji segitiga — luas segitiga vs luas AABB):** Roti×Kopi 31,14 vs 32,10 m²; Roti×Buku 20,34 vs 23,12; Es Krim×Studio 14,31 vs 19,06; Studio×Teh 8,58 vs 8,96; Teh×Mainan 12,58 vs 13,74; G07×Kios 8 13,96 vs 9,77 (segitiga LEBIH BESAR — AABB kios miring mengecilkan irisan); G08×Kios 7 4,32 vs 14,45; Aula×Pohon T2 0,58 vs 4,00; Kopi Senja×Bangku CW1 0,56 vs 0,54; Kios 1×Lampu Plaza 0,39 vs 0,36; Kios 2×Lampu Plaza 0,39 vs 0,36; Perpustakaan×Bangku T2 0,11 vs 0,58. Pola: AABB biasanya melebihkan 10–70% untuk geometri non-kotak; pengecualian G07×Kios 8 di mana AABB justru mengecilkan.

## 2. Tembus permukaan (jalan / air / cincin)

### T1 — KRITIS — Sungai × jalan-raya (Roads)

- Klasifikasi: air-jalan. Luas tembus (sampling): **307.55 m²** (titik di dalam: 48/1470). Objek Y -1.00..4.87 m; permukaan maks Y 0.00 m.

### T2 — KRITIS — Gedung G04 × jalan lingkar (r 14–20,5)

- Klasifikasi: gedung-jalan. Luas tembus (sampling): **95.50 m²** (titik di dalam: 382/1040). Objek Y 0.00..19.06 m; permukaan maks Y 0.02 m.

### T3 — KRITIS — Gedung G04 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **28.00 m²** (titik di dalam: 112/1040). Objek Y 0.00..19.06 m; permukaan maks Y 0.00 m.

### T4 — KRITIS — Gedung G02 × jalan lingkar (r 14–20,5)

- Klasifikasi: gedung-jalan. Luas tembus (sampling): **23.00 m²** (titik di dalam: 92/676). Objek Y 0.00..13.92 m; permukaan maks Y 0.02 m.

### T5 — KRITIS — Kios Pasar 1 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **15.75 m²** (titik di dalam: 63/72). Objek Y 0.00..3.36 m; permukaan maks Y 0.00 m.

### T6 — KRITIS — Kios Pasar 4 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **15.75 m²** (titik di dalam: 63/72). Objek Y 0.00..3.36 m; permukaan maks Y 0.00 m.

### T7 — KRITIS — Kios Pasar 7 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **15.75 m²** (titik di dalam: 63/72). Objek Y 0.00..3.36 m; permukaan maks Y 0.00 m.

### T8 — KRITIS — Gerbang Pasar × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **14.00 m²** (titik di dalam: 56/56). Objek Y 0.00..5.13 m; permukaan maks Y 0.00 m.

### T9 — KRITIS — Kios Pasar 2 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **10.50 m²** (titik di dalam: 42/42). Objek Y 0.00..3.50 m; permukaan maks Y 0.00 m.

### T10 — KRITIS — Kios Pasar 3 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **10.50 m²** (titik di dalam: 42/42). Objek Y 0.00..3.50 m; permukaan maks Y 0.00 m.

### T11 — KRITIS — Kios Pasar 5 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **10.50 m²** (titik di dalam: 42/42). Objek Y 0.00..3.50 m; permukaan maks Y 0.00 m.

### T12 — KRITIS — Kios Pasar 6 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **10.50 m²** (titik di dalam: 42/42). Objek Y 0.00..3.50 m; permukaan maks Y 0.00 m.

### T13 — KRITIS — Kios Pasar 8 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **10.50 m²** (titik di dalam: 42/42). Objek Y 0.00..3.50 m; permukaan maks Y 0.00 m.

### T14 — DIHARAPKAN — Perahu Merah × laut (y=-0,45)

- Klasifikasi: objek-laut. Luas tembus (sampling): **10.50 m²** (titik di dalam: 42/42 titik tapak di luar daratan). Objek Y -0.53..0.24 m; permukaan maks Y -0.45 m.

### T15 — SEDANG — Gedung G04 × trotoar plaza (r 13,2–14)

- Klasifikasi: gedung-trotoar. Luas tembus (sampling): **9.75 m²** (titik di dalam: 39/1040). Objek Y 0.00..19.06 m; permukaan maks Y 0.04 m.

### T16 — DIHARAPKAN — Perahu Hijau × laut (y=-0,45)

- Klasifikasi: objek-laut. Luas tembus (sampling): **8.75 m²** (titik di dalam: 35/35 titik tapak di luar daratan). Objek Y -0.53..0.24 m; permukaan maks Y -0.45 m.

### T17 — SEDANG — Pohon Bingkai Menara × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **1.25 m²** (titik di dalam: 5/49). Objek Y 0.00..3.06 m; permukaan maks Y 0.02 m.

### T18 — RINGAN — Bangku Peternakan × air danau (water)

- Klasifikasi: objek-air. Luas tembus (sampling): **0.75 m²** (titik di dalam: 3/3). Objek Y 0.50..1.42 m; permukaan maks Y 0.10 m.

### T19 — RINGAN — Lampu Plaza Utara × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.00..2.90 m; permukaan maks Y 0.00 m.

### T20 — RINGAN — Lampu Peternakan × air danau (water)

- Klasifikasi: objek-air. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.50..3.40 m; permukaan maks Y 0.10 m.

### T21 — RINGAN — Lampu Boulevard z=-28 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.00..2.90 m; permukaan maks Y 0.00 m.

### T22 — RINGAN — Lampu Boulevard z=-40 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.00..2.90 m; permukaan maks Y 0.00 m.

### T23 — RINGAN — Lampu Boulevard z=-52 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.00..2.90 m; permukaan maks Y 0.00 m.

### T24 — RINGAN — Lampu Boulevard z=-64 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.00..2.90 m; permukaan maks Y 0.00 m.

### T25 — RINGAN — Lampu Boulevard z=-76 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.00..2.90 m; permukaan maks Y 0.00 m.

### T26 — RINGAN — Lampu Boulevard z=-88 × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.50 m²** (titik di dalam: 2/2). Objek Y 0.00..2.90 m; permukaan maks Y 0.00 m.

### T27 — RINGAN — Lampu Plaza (prosedural) × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.00 m.

### T28 — RINGAN — Lampu Plaza (prosedural) × jalan-raya (Roads)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.00 m.

### T29 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T30 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T31 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T32 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T33 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T34 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T35 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T36 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T37 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T38 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T39 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

### T40 — RINGAN — Lampu Plaza (prosedural) × jalan lingkar (r 14–20,5)

- Klasifikasi: objek-jalan. Luas tembus (sampling): **0.25 m²** (titik di dalam: 1/1). Objek Y 0.00..3.50 m; permukaan maks Y 0.02 m.

## 3. Dobel (objek ganda di titik yang sama)

Tidak ada pasangan file + posisi (x,z) yang sama persis.


## 4. Z-fighting

### 4a. Di dalam tiap GLB (lumina-audit-glb.mjs — plane-hash, normal-aware)

| File | Bidang z-fight | Segitiga terbalik (dot<0) | Bidang terparah (luas tumpang) |
|---|---|---|---|
| menara-jam-blender-v1.glb | 0 | 0 (0%) | — |
| air-mancur-blender-v1.glb | 0 | 0 (0%) | — |
| sungai-blender-v4.glb | 0 | 3368 (3.76%) | — |
| jembatan-batu-blender-v1.glb | 0 | 0 (0%) | — |
| air-mancur.glb | 0 | 63 (0.26%) | — |
| gedung-g01-blender-v3.glb | 0 | 0 (0%) | — |
| gedung-g04-blender-v2.glb | 0 | 0 (0%) | — |
| gedung-g05-blender-v2.glb | 0 | 0 (0%) | — |
| gedung-g03-blender-v2.glb | 0 | 0 (0%) | — |
| gedung-g02-blender-v3.glb | 0 | 0 (0%) | — |
| gedung-g09-blender-v2.glb | 0 | 0 (0%) | — |
| gedung-g10-blender-v2.glb | 0 | 0 (0%) | — |
| gedung-g08-blender-v2.glb | 0 | 0 (0%) | — |
| gedung-g07-blender-v2.glb | 0 | 62 (0.55%) | — |
| gedung-g06-blender-v2.glb | 0 | 0 (0%) | — |
| perahu-blender-v1.glb | 0 | 0 (0%) | — |
| perahu-biru-blender-v1.glb | 0 | 0 (0%) | — |
| perahu-hijau-blender-v1.glb | 0 | 0 (0%) | — |
| gerbang-pasar-blender-v1.glb | 0 | 0 (0%) | — |
| gerobak-blender-v1.glb | 0 | 0 (0%) | — |
| roti-kopi-toko-blender-v1.glb | 0 | 0 (0%) | — |
| kopi-senja-toko-blender-v1.glb | 0 | 0 (0%) | — |
| buku-kertas-toko-blender-v1.glb | 0 | 0 (0%) | — |
| es-krim-toko-blender-v1.glb | 0 | 0 (0%) | — |
| studio-foto-toko-blender-v1.glb | 0 | 0 (0%) | — |
| bunga-toko-blender-v1.glb | 0 | 9 (0.06%) | — |
| teh-rempah-toko-blender-v1.glb | 0 | 0 (0%) | — |
| mainan-toko-blender-v4.glb | 0 | 6 (0.04%) | — |
| menara-1-blender-v1.glb | 0 | 0 (0%) | — |
| menara-2-blender-v1.glb | 0 | 0 (0%) | — |
| menara-3-blender-v1.glb | 0 | 0 (0%) | — |
| menara-4-blender-v1.glb | 0 | 0 (0%) | — |
| menara-5-blender-v1.glb | 0 | 0 (0%) | — |
| menara-6-blender-v1.glb | 0 | 0 (0%) | — |
| gerobak-es-krim-blender-v1.glb | 0 | 0 (0%) | — |
| mercu-blender-v1.glb | 0 | 0 (0%) | — |
| gedung-utama-sekolah-v4.glb | 0 | 0 (0%) | — |
| gedung-perpustakaan-v4.glb | 0 | 0 (0%) | — |
| gedung-kantin-v2.glb | 0 | 0 (0%) | — |
| gedung-aula-v1d.glb | 0 | 0 (0%) | — |
| gedung-gym-v4.glb | 0 | 0 (0%) | — |
| gedung-lab-v6.glb | 0 | 0 (0%) | — |
| tenda-meja-blender-v1.glb | 0 | 0 (0%) | — |
| tenda-hijau-blender-v1.glb | 0 | 0 (0%) | — |
| lapangan-olahraga-blender-v1.glb | 0 | 0 (0%) | — |
| taman-bermain-blender-v1.glb | 0 | 0 (0%) | — |
| rumah-modern-v1.glb | 0 | 0 (0%) | — |
| rumah-tradisional-v1.glb | 0 | 0 (0%) | — |
| rumah-cottage-v1.glb | 0 | 0 (0%) | — |
| foodcourt-blender-v1.glb | 0 | 0 (0%) | — |
| kolam-renang-blender-v1.glb | 0 | 0 (0%) | — |
| danau-blender-v1.glb | 0 | 0 (0%) | — |
| gedung-konser-blender-v1.glb | 0 | 0 (0%) | — |
| skatepark-blender-v1.glb | 0 | 0 (0%) | — |
| taman-bunga-blender-v1.glb | 0 | 0 (0%) | — |
| jalan-raya-blender-v1.glb | 0 | 0 (0%) | — |
| kios-merah-blender-v1.glb | 0 | 0 (0%) | — |
| kios-biru-blender-v1.glb | 0 | 0 (0%) | — |
| kios-oranye-blender-v1.glb | 0 | 0 (0%) | — |
| lampu-jalan-blender-v1.glb | 0 | 0 (0%) | — |
| kursi-blender-v1.glb | 0 | 0 (0%) | — |
| pohon-blender-v1.glb | 0 | 0 (0%) | — |
| pagar-blender-v1-segmen.glb | 0 | 0 (0%) | — |
| pagar-blender-v1-tiang.glb | 0 | 0 (0%) | — |
| awan-blender-v1.glb | 0 | 0 (0%) | — |

### 4b. Antar-permukaan tanah (selisih Y < 2 cm, footprint AABB tumpang)

- Z1 — Pulau Utama × Lobus Tenggara: selisih Y **0 mm**, luas AABB tumpang ~2025 m².
- Z2 — Pulau Utama × Lobus Timur: selisih Y **0 mm**, luas AABB tumpang ~2080 m².
- Z3 — Pulau Utama × Lobus City Walk: selisih Y **0 mm**, luas AABB tumpang ~2176 m².
- Z4 — Pulau Utama × Penghubung Selatan: selisih Y **0 mm**, luas AABB tumpang ~1144 m².
- Z5 — Pulau Utama × Penghubung Utara: selisih Y **0 mm**, luas AABB tumpang ~832 m².
- Z6 — Pulau Utama × Jembatan Darat Timur: selisih Y **0 mm**, luas AABB tumpang ~504 m².
- Z7 — Lobus Tenggara × Lobus Timur: selisih Y **0 mm**, luas AABB tumpang ~495 m².
- Z8 — Lobus Utara × Lobus City Walk: selisih Y **10 mm**, luas AABB tumpang ~1500 m².
- Z9 — Lobus Utara × Jembatan Darat Utara: selisih Y **10 mm**, luas AABB tumpang ~252 m².
- Z10 — Lobus Utara × Penghubung Gunung: selisih Y **10 mm**, luas AABB tumpang ~408 m².
- Z11 — Plaza × Jalan Lingkar: selisih Y **8 mm**, luas AABB tumpang ~784 m².
- Z12 — Plaza × Trotoar Plaza: selisih Y **10 mm**, luas AABB tumpang ~784 m².
- Z13 — Jalan Lingkar × Trotoar Plaza: selisih Y **18 mm**, luas AABB tumpang ~784 m².
- Z14 — Lobus Timur × Hutan Pinus (daratan): selisih Y **0 mm**, luas AABB tumpang ~132 m².
- Z15 — Lobus Timur × Jembatan Darat Timur: selisih Y **0 mm**, luas AABB tumpang ~320 m².
- Z16 — Pulau Kecil × Padang Barat: selisih Y **0 mm**, luas AABB tumpang ~196 m².
- Z17 — Padang Barat × Penghubung Selatan: selisih Y **0 mm**, luas AABB tumpang ~36 m².
- Z18 — Padang Barat × Penghubung Utara: selisih Y **0 mm**, luas AABB tumpang ~26 m².
- Z19 — Hutan Pinus (daratan) × Jembatan Darat Timur: selisih Y **0 mm**, luas AABB tumpang ~54 m².
- Z20 — Hutan Pinus (daratan) × Jembatan Darat Utara: selisih Y **0 mm**, luas AABB tumpang ~920 m².
- Z21 — Jembatan Darat Utara × Penghubung Gunung: selisih Y **0 mm**, luas AABB tumpang ~170 m².

### 4c. Lapisan jalan-raya GLB (node Y)

- Roads Y 0.000..0.050 m; Sidewalks Y 0.000..0.170 m; Markings Y 0.050..0.074 m.
- Gap Markings–Roads: -0.000 m (marking di atas jalan). Gap Sidewalks–Roads: -0.050 m.

## 5. Yang TIDAK bisa diukur dari kode (posisi berubah tiap load)

- **Pohon kota (30)**: loop baris 1768–1795, posisi acak annulus r 23,5–54,5 m di sekitar (0,0), dijauhi dari penabrak (jarak > r+1,6 m), Taman Bukit, jalan dermaga, lorong Pasar Malam, lobus pasar, boulevard, Pantai Selatan, gundukan mercu. Skala/rotasi dari acakAset (tetap). **Fase C+D: penempatan pohon kota/padang/hutan/awan seeded (acakVeg, mulberry32 seed 20261023, aliran terpisah) + zona larangan kios/jalan/lapangan/rumah.**
- **Pohon/pinus padang (76)**: baris 4636–4655, x −246..−80, z −56..86, dijauhi sekolah/peternakan/rute. **Hutan pinus (±232)**: baris 5424–, x 84..242, z −162..−18, dijauhi rute hutan + titik (170,−90) r 15.
- **Awan (9)**: baris 5889–5898, posisi/ukuran/kecepatan acak penuh, y 42–72 m (di atas segalanya — tidak mungkin bertabrakan).
- **Kios pasar**: 8 slot baru (Fase C+D, x 23,5–38,5 z ±6,8); filter baru pakai footprint AABB G07/G08; pohon kota dijauhi <3,2 m dari slot (seeded).
- Pohon deterministik yang terukur: 19 (bingkai menara 3 + Taman Bukit 8 + Plaza Utara 4 + peternakan 3 + Pulau Kecil 1) — skala/rotasi direplay dari RNG halaman (mulberry32, seed 20261023).

## 6. Temuan non-tabrakan (dari pembacaan kode — diverifikasi barisnya)

- **F1 — Air mancur plaza (Hunyuan) TIDAK TAMPIL.** `air-mancur.glb` baris 1087 dimuat lalu `mancur.add(model)`, tetapi `scene.add(mancur)` dikomentari di baris 965 ("FOUNTAIN REMOVED 2026-11-01"). Yang tampil di (0,0,0) adalah `air-mancur-blender-v1.glb` (baris 995). Instansi ini tetap dihitung di bbox.json dengan `tampil:false`.
- **F2 — Lampu boulevard menumpuk di satu sisi.** Baris 3052: `sisi = ((zl/12)%2===0) ? -1,2 : 8,2`, zl = −28..−88 step −12 → zl/12 tidak pernah bulat genap → keenam lampu di x=8,2; sisi barat (x=−1,2) kosong. Dievaluasi dari rumus, bukan tebakan.
- **F3 — Komentar skala gerobak ≠ kode.** Komentar baris 2818 klaim gerobak skala 1,76 dan baris ~4110 klaim gerobak es krim skala 2,1593 — tetapi callback memakai `setScalar(1.0)` (baris 2850 & 4151). Gerobak tampil ~57% / ~46% dari ukuran yang dikomentari (gerobak pasar 0,96 m vs 1,70 m; es krim 0,95 m vs 2,05 m).
- **F4 — Toko lama & menara lama tetap ada sebagai fallback tersembunyi.** Bila GLB toko/menara gagal muat, kotak kode lama tampil di titik yang sama (grupLama.visible=false hanya bila GLB sukses). Bukan dobel — tapi bila GLB gagal, tapak toko lama (±kotak) ≠ tapak GLB.
- **F5 — Fungsi `tenda()` perkemahan (baris 5477) tidak pernah dipanggil** — hanya tenda GLB (163,−95) & (177,−86) yang tampil. `bangkuT2` (4 bangku sekolah) juga prosedural murni tanpa swap GLB.
- **F6 — Pintu aula & gym dibuka 90° oleh kode** (baris 5193–5213, 5237–5256) — daun pintu menonjol ~1,2 m ke luar tapak; bbox dihitung dari geometri GLB mentah (pintu tertutup), jadi tumpang pintu-vs-objek di depan pintu tidak tertangkap AABB ini.

- **F7 — Dermaga danau tanpa air.** `tinggiTanah()` mengenal "dek dermaga danau" (baris 2021: x −157..−160, z ≈ −20) dan `dalamArea()` mem-veto lubang air di (−180,−20) r 20,8 — tetapi satu-satunya air danau yang ber-mesh adalah GLB di (−120,−40), ±60 m di timur. Dermaga + lubang jalan kaki itu tidak punya permukaan air yang terlihat. **Fase C+D: GLB danau dipindah ke (−180,−20) di bawah dermaga; air shader + cincin pasir lama dihapus.**
- **F8 — Gedung G04 TERKUBUR (bukan salah ukur).** Bbox lokal `gedung-g04-blender-v2.glb` = y −14,90..4,16 m (badan/atap y −14,9..0; hanya bola balkon yang muncul sampai 4,16 m) — DIVERIFIKASI silang dengan THREE.GLTFLoader Box3 (hasil identik: min −3,20/−14,90/−30,42, max 3,20/4,16/−11,60). Di penempatan LAMA (−12,0,30) ry 5,90, ~75% volume gedung berada DI BAWAH tanah (y<0). **Fase C+D: G04 diangkat y+14,90 + geser ke (−15,37,4) — minY dunia 0,0 terverifikasi Blender; alas-di-cincin 0,00 m².** Konsekuensi: tumpang AABB G04-vs-air-mancur adalah ARTEFAK — uji segitiga-vs-segitiga (grid 0,1 m, 10.201 titik) menunjukkan NOL sentuhan antara bagian G04 di atas tanah dan air mancur (verteks G04 terdekat r=1,89 m di y=3,30 — di ATAS puncak air mancur 2,48 m). Dicatat di §1b (Artefak AABB), bukan di daftar tabrakan. Bola yang sama menembus permukaan jalan lingkar (168 segitiga memotong y=0,022 pada r 16,9–18,0 m) — lihat §2.

