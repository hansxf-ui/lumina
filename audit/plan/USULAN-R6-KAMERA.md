# USULAN R6 (FILTER VEGETASI) + PERBAIKAN KAMERA — KOTA LUMINA

**Analis:** subagent Vesper (baca-saja) · **Tanggal:** 2026-11-09, ~21:14–21:40 WITA
**Disampaikan ke:** koordinator (yang menerapkan + verifikasi Node + deploy)
**File yang dianalisis:** `~/workspace/lumina/index.html`
**Dokumen acuan:** `~/workspace/lumina/LAPORAN-AUDIT-LUMINA.md` (Bab 3 §3.1 butir 7, Bab 4 §4.4),
`~/workspace/lumina/audit/plan/LAPORAN-EKSEKUSI.md` (§5), `audit/plan/tri_test.py`,
`audit/plan/verify_rencana.py`, `audit/plan/replay-veg.mjs`, `audit/plan/scan-seed.py`,
`audit/bbox.json`, `audit/plan/rencana.json`, `audit/plan/probe.py`.

> **⚠️ PERINGATAN PENTING — FILE BERUBAH SELAMA ANALISIS.**
> Brief tugas menyebut `index.html` 8.231 baris, MD5 `ffcbc29e89664c0dd1721343894e51ed`.
> Saat analisis berjalan file itu **berubah di luar sesi ini**: sekarang **8.260 baris,
> MD5 `545d7eca107b7907103033c78a17465a`**, mtime 2026-11-09 21:22 WITA.
> Isi semua blok yang dikutip di laporan ini sudah **dicek ulang terhadap file saat ini**
> dan isinya identik dengan versi brief (hanya nomor baris bergeser +24…+29 baris).
> **Semua nomor baris di bawah mengacu ke file saat ini (MD5 `545d7eca…`, 8.260 baris).**
> Koordinator WAJIB menerapkan dengan **exact-match per teks** (pola `terapkan.py`:
> cocokkan teks lama persis + hitung kemunculan; gagal = berhenti), JANGAN hanya
> mengandalkan nomor baris — nomor bisa bergeser lagi sebelum penerapan.
> Usulan saya **TIDAK diterapkan** ke file (tugas baca-saja dipatuhi; tidak ada edit).
> Karakter (kode + GLB cewek/cowok) dan debug overlay tidak disentuh.

## Ringkasan eksekutif

| Usulan | Inti | Bukti verifikasi (sudah dijalankan analis, di `/tmp`) |
|---|---|---|
| **R6 — filter vegetasi** | Satu daftar tapak nyata bersama (`ZONA_LARANG_VEG`: 23 OBB dari `bbox.json` + 7 rect jalan/sungai terukur `probe.py` + 4 rect perkemahan), dicek di 3 blok `acakVeg()` **sesudah semua undian** supaya aliran RNG tidak bergeser | Seed live **20261040: 0 pohon ditolak** di semua zona (30 kota + 76 padang + 254 hutan) → replay byte-identik, seed TETAP. Seed lama 20261023 (replay Python sejati): **8/8 pelanggaran nyata tertangkap** (6 di bangunan + 2 di jalan), harga 1 false positive |
| **Kamera menembus dinding** | Keep-out OBB yang **sama** (`dorongKeluarTapak()`), dipakai untuk `camTarget` (sesudah S1) dan untuk `camera.position` (sesudah lerp) | Skenario G09 terhitung: `camTarget` (24,−33) y 3,08 m di dalam OBB G09 tapi S1 diam (d=7,19 > 5,65) → perbaikan mendorongnya keluar lewat sisi selatan (+1,77 m). Perilaku normal (jarak/tinggi/sudut default) tidak berubah |

Akar yang sama di kedua tugas: **lingkaran kollider kode (r 3,95–5,35) jauh lebih kecil
dari tapak visual GLB**, dan untuk G04 lingkarannya bahkan **tidak menyentuh bangunannya
sama sekali** (pusat kollider 21,01 m dari pusat visual). Filter vegetasi dan S1 kamera
sama-sama buta di luar lingkaran itu.

---

# A. CARA KERJA FILTER VEGETASI SAAT INI + CELAHNYA

## A.1 Aliran acak

- `acakAset()` — mulberry32, seed `20261023` (baris 1156). Dipakai `catatPohon()` /
  `catatPinus()` (baris 1170–1185) untuk `ry` dan variasi skala `v` pohon yang diterima.
  **Tidak boleh bergeser** (replay `POHON_DET` audit).
- `acakVeg()` — mulberry32 **terpisah**, seed `20261040` (baris 1163–1169). Dipakai di
  4 blok, selalu dalam urutan tetap ini:
  1. **Pohon kota** (baris 1775–1807): 30 pohon, `r` 23,5–54,5 m dari (0,0).
  2. **Padang** (baris 4657–4679): 76 pohon, x −246..−80, z −56..86.
  3. **Hutan pinus** (baris 5423–5456): 232 + 22 gunung = 254 pinus.
  4. **Awan** (baris 5887–5900): 9 awan, y 42–72 (di udara — tidak butuh filter tanah).
- Jumlah undian per kandidat (menentukan determinisme — lihat §B.4):
  kota diterima 5 (`a, r, s, reg, ry`), ditolak 2 (`a, r`);
  padang diterima 6 (`x, z, s, ry, warna×2`), ditolak 2;
  hutan diterima 6 (`x, z, s-arg, ry, warna×2`), ditolak 2;
  awan 5 per awan. **Setiap `continue` yang baru mengubah pola terima/tolak
  menggeser semua undian hilir** — kecuali bila cek baru diletakkan sesudah undian
  (usulan §B memakai tepat trik ini).

## A.2 Zona larangan saat ini (verbatim)

**Pohon kota** (baris 1776–1802) — snapshot `terlarang = penabrak.slice()` (baris 1776)
lalu, per kandidat:
- `terlarang.some(...)` jarak < `t.r + 1,6` (baris 1783);
- slot kios baru < 3,2 m (baris 1786);
- jalan-raya N–S `|px| ≤ 4, z −96..195` dan E–W `|pz| ≤ 8, x −122..54` (baris 1787–1788);
- Taman Bukit r<20,5; jalan dermaga; lorong pasar; lobus pasar r<25; boulevard
  `|px−3,5|<7,5, pz<−14`; Pantai Selatan (elips); gundukan mercusuar (baris 1789–1796).

**Padang** (baris 4663–4670): danau r<28; peternakan rect; sekolah rect
x −250..−170, z 38..88; `jarakRute5 < 3,6`; **jalan-raya barat E–W
`z −12..0, x −122..−86`** (baris 4669); dermaga danau `|z+20|<4, x −176..−152`.

**Hutan** (baris 5437–5444): `hypot(x−170,z+90)<15`; `jarakRute5(RUTE_HUTAN)<3,6`;
tapak Lapangan (190,−45)+2 m `x 146..234, z −75..−15`; 3 rumah +2 m
(Modern 65,2..84,8 / −45,3..−24,7; Tradisional 90,3..109,7 / −63,6..−46,4;
Cottage 114,1..135,9 / −40,8..−19,2).

## A.3 Celah struktural (dengan bukti angka)

| # | Celah | Bukti |
|---|---|---|
| 1 | **Kollider ≪ tapak GLB.** Lingkaran G01–G10 (baris 1371–1407): `r = max(lebar,dalam)/2 + 0,7` dari ukuran **kotak kode lama** (lebar 6,5–9,3; dalam 6–7,6) → r **3,95–5,35**. Tapak GLB nyata (`bbox.json`): G04 12,93×19,85 m, G09 17,96×18,96 m, G10 16,22×12,27 m, G02 12,79×12,90 m. Setengah-diagonal G09 = **9,48 m** vs r 5,35 → sudut bangunan menonjol **~4 m** keluar lingkaran. | `scan-seed.log`: seed 20261023 menaruh pohon **di dalam G04 (−10,6; 24,1)** dan **G10 (−20,4; −36,0), (−7,1; −31,0)** — persis di zona buta ini |
| 2 | **Toko/gerobak dimuat setelah blok kota** → tidak ada di `terlarang` (snapshot baris 1776). Toko GLB baru ada di baris ~3300–3550, gerobak ~2840. | Pohon seed 20261023 di **teras/pelat toko**: Es Krim (13,0; −45,9), (18,0; −47,0); Kopi (−6,7; −43,7). Kollidermu toko (3 lingkaran r 2,99/3,25, baris 3331/3517) tidak menutupi tapak GLB Kopi 12,83×11,39 m |
| 3 | **Filter padang hanya mengecualikan jalan barat `z −12..0`** (baris 4669). Jalan E–W terukur (`probe.py`, sampling 1 m): `z −8..8, x −90..54` (segmen utama) + stub utara `x −90..−86, z 8..30` + jalan vertikal barat `x −122..−118, z −40..−12` (yang ini tidak disebut di TB6 maupun di filter). | Pohon seed 20261023 di jalan: padang **(−88,1; 2,4)** (E–W `z 0..8`, lolos karena filter berhenti di `z ≤ 0`) dan **(−120,5; −26,2)** (jalan vertikal barat, tidak ada di filter sama sekali) |
| 4 | **Tidak ada larangan sungai** di blok kota. Sungai meander x 42..57 (z −20..20), x 37..63 (z 30..80) — di dalam jangkauan pohon kota (r ≤ 54,5). Yang menyelamatkan selama ini hanya kebetulan: lingkaran lobus pasar `hypot(px−46,pz)<25` (baris 1792) menutupi sebagian alur sungai dekat pusat | Belum ada pelanggaran sungai yang tercatat — tapi tidak ada yang menjaminnya untuk seed lain |
| 5 | **Hutan: perkemahan tidak dikosongkan.** Tenda Meja (163,−95), Tenda Hijau (177,−86), 2 bangku log — tidak ada di filter hutan (hanya Lapangan + 3 rumah + rute) | Belum ada pelanggaran tercatat (seed 20261040 bersih), tapi pinus bisa tumbuh menembus tenda pada seed lain |
| 6 | **G04: kollider tidak menyentuh bangunan visual sama sekali** (ini juga akar masalah kamera §C). GLB `gedung-g04-blender-v2.glb` pusat lokalnya di z −21,01 (diukur dari node GLB: bbox lokal x ±3,2, z −30,42..−11,6) → tapak visual berpusat di **(−7,20; 17,89)**, sementara lingkaran kollider di posisi loader **(−15; 37,4)** r 4,5 (baris 1407; loader baris 1478 `model.position.set(-15, 14.9, 37.4)`). Jarak pusat lingkaran ke titik tapak terdekat (−13,66; 27,82) = **9,67 m > 4,5 m**. Gedung G04 **tidak punya pelindung tabrakan sama sekali** di posisi visualnya | Dampak ganda: pohon bisa tumbuh di G04 (butir 1) DAN pemain/kamera bisa menembus G04 (§C.2, §D) |

**Catatan kejujuran:** filter lama BUKAN tidak bekerja — untuk seed 20261040 ia
menghasilkan 0 pelanggaran (uji segitiga ketat, 360 pohon). Celahnya **struktural dan
laten**: ia bergantung pada keberuntungan seed, bukan pada tapak nyata.

## A.4 Yang TIDAK tercakup R6 (sengaja, di luar cakupan)

- Pohon posisi-tetap (bukan `acakVeg()`): bingkai menara (3 pohon), Taman Bukit
  (pohon ikonik + 7 pohon teras), plaza mini menara utara (4 pohon), `pohonBiasa5()`
  peternakan/pulau (pakai `Math.random()` hanya untuk `ry`) — koordinatnya tetap,
  tidak diundi ulang tiap load.
- Bunga padang 380 (baris ~4685, `Math.random()`) — bukan pohon, di luar §3.1 butir 7.
- Awan (baris 5887–5900): y 42–72, tidak menyentuh tanah; tidak difilter, tapi
  **alirannya ikut bergeser bila blok hulu bergeser** — lihat §B.4.

---

# B. USULAN PENGUATAN R6 — FILTER TAPAK NYATA (OBB + RECT JALAN)

## B.1 Prinsip desain (dan kenapa bukan AABB dunia)

**JANGAN pakai AABB dunia `bbox.json` mentah-mentah.** Saya mengujinya dulu di `/tmp`
(`uji-filter-r6.py`): AABB dunia +1 m **menolak 5 pohon hidup seed 20261040**
— (15,7; −18,5) & (15,0; −18,3) di G09, (−17,7; 24,9) di G03, (−26,8; −8,4) di G01,
(−8,5; 28,1) di G04 — padahal uji segitiga menyatakan kelimanya **bersih**.
Penyebabnya (TB7): AABB dunia mencakup kotak fallback kode + kanopi/teras dan
mengembang untuk bangunan yang **diputar** (sudut AABB ≠ sudut bangunan).
AABB akan mengubah kota live dan menggeser aliran RNG — ditolak.

**Yang dipakai: OBB (oriented bounding box)** — pusat visual + setengah-bentang
lokal + sudut putar, diturunkan dari `bbox.json`:
`cx=(minX+maxX)/2, cz=(minZ+maxZ)/2`, lalu `hx,hz` diselesaikan dari sistem
`Wx=hx·|cos ry|+hz·|sin ry|`, `Wz=hx·|sin ry|+hz·|cos ry|`
(`Wx,Wz` = setengah-bentang AABB dunia). Verifikasi silang: untuk G04 hasil
penyelesaian (hx 3,20; hz 9,41) **persis sama** dengan tapak lokal yang dibaca
langsung dari node GLB (x ±3,2; z −30,42..−11,6 → hz 9,41) — jadi OBB ini
bukan tebakan, melainkan tapak lokal GLB yang sebenarnya. Untuk G01 dipakai
rect perimeter kode (7,85×5,97 di (−27,−14), dari IIFE baris ~1395) karena
OBB-bbox G01 menolak pohon hidup (−26,8; −8,4) yang menurut uji segitiga
bersih (pohon itu berdiri di teras depan yang terbuka, bukan di dalam dinding).

**Margin:** +0,5 m untuk semua OBB, **kecuali G04 +0,3 m** (alasan: tapak G04
non-persegi + pohon hidup (−8,53; 28,10) hanya berjarak 0,56 m di luar sisi OBB —
dengan margin 0,5 ia lolos hanya dengan sisa 0,06 m; dengan 0,3 sisanya 0,26 m.
Margin 0,3 tetap menangkap semua pelanggar G04 yang diketahui karena mereka
berada jauh di dalam tapak). Bukti empiris margin: pada seed 20261040 tidak ada
pohon lain yang berjarak < 1,0 m dari sisi OBB mana pun — jadi margin 0,5 aman
untuk 22 entri lainnya.

## B.2 Tabel tapak (sumber: `audit/bbox.json`, dibulatkan 2 desimal)

Format tiap entri: `[cx, cz, hx, hz, ry, maxY]` — `maxY` dipakai kamera (§C);
untuk filter vegetasi hanya 5 angka pertama yang dipakai.
(G01 disimpan sebagai OBB ry=0: rect kode 7,85×5,97 + margin diterapkan di fungsi cek.)

| Label | cx | cz | hx | hz | ry | maxY |
|---|---|---|---|---|---|---|
| Gedung G01 (rect kode) | −27,00 | −14,00 | 3,93 | 2,99 | 0,000 | 8,91 |
| Gedung G02 | 14,75 | 19,66 | 4,45 | 4,72 | 3,785 | 13,92 |
| Gedung G03 | −23,83 | 19,86 | 5,05 | 4,62 | 5,404 | 10,98 |
| Gedung G04 | −7,20 | 17,89 | 3,20 | 9,41 | 5,903 | 19,06 |
| Gedung G05 | 9,85 | 32,42 | 3,99 | 4,05 | 0,180 | 15,77 |
| Gedung G06 | −34,54 | −31,40 | 5,20 | 5,11 | 3,797 | 15,34 |
| Gedung G07 | 29,72 | 16,91 | 5,36 | 4,65 | 1,249 | 13,55 |
| Gedung G08 | 34,57 | −14,92 | 3,66 | 3,66 | 1,903 | 15,86 |
| Gedung G09 | 20,71 | −27,53 | 5,40 | 7,80 | 2,504 | 12,48 |
| Gedung G10 | −14,00 | −33,00 | 7,35 | 4,90 | 3,321 | 8,32 |
| Toko Kopi Senja | −9,89 | −44,00 | 5,69 | 6,42 | 1,571 | 7,94 |
| Toko Roti & Kopi | −8,02 | −58,01 | 5,68 | 4,98 | 1,571 | 7,25 |
| Toko Buku & Kertas | −8,69 | −70,00 | 4,87 | 4,71 | 1,571 | 8,92 |
| Toko Bunga | −8,57 | −80,00 | 3,30 | 3,31 | 1,571 | 4,71 |
| Toko Es Krim | 16,64 | −44,00 | 5,62 | 5,79 | −1,571 | 7,39 |
| Toko Studio Foto | 15,21 | −57,00 | 4,75 | 4,01 | −1,571 | 6,58 |
| Toko Teh & Rempah | 15,49 | −68,00 | 4,41 | 3,96 | −1,571 | 6,86 |
| Toko Mainan | 15,38 | −80,00 | 5,32 | 4,75 | −1,571 | 8,62 |
| Menara Jam | −25,00 | −46,45 | 3,90 | 4,35 | 0,000 | 23,75 |
| Gerbang Pasar | 22,44 | 0,00 | 3,40 | 1,06 | 1,571 | 5,13 |
| Gerobak Pasar 1 | 21,84 | −11,69 | 1,19 | 0,55 | 0,500 | 2,09 |
| Gerobak Pasar 2 | 39,77 | 11,31 | 1,19 | 0,55 | −2,200 | 2,09 |
| Gerobak Es Krim | 6,51 | 55,59 | 0,55 | 1,19 | 0,120 | 2,09 |

Rect jalan/sungai/perkemahan (format `[x0, x1, z0, z1]`, dari `probe.py` sampling 1 m):

| Rect | x0..x1 | z0..z1 | Sumber |
|---|---|---|---|
| Jalan N–S | −4..4 | −96..195 | Sudah di filter kota (baris 1787); dipertahankan di helper bersama |
| Jalan E–W utama | −90..54 | −8..8 | `probe.py`: z −8..8 → x −122..54; dipersempit ke −90..54 karena segmen barat ditangani rect sendiri |
| Jalan E–W barat | −122..−86 | −12..0 | Sudah di filter padang (baris 4669) |
| Jalan E–W stub utara | −90..−86 | 0..20 | `probe.py`: x −90..−86 di z 8,10,12,14,16,18,20,25,30 |
| Jalan selatan | −52..52 | 177..183 | `probe.py`: z 178,180,181 → x −52..52 |
| Jalan vertikal barat | −122..−118 | −40..−12 | `probe.py`: x −122..−118 di z −40,−35 (di luar jangkauan kota, relevan untuk padang) |
| Sungai | 41..58 | −22..22 | `probe.py`: x 42..57 (z −20..20); rect sengaja agak longgar. **Trade-off jujur:** rect ini juga menutupi strip jembatan darat timur (x 46..62, z −42..−6) di z −22..−6 — pohon tidak akan tumbuh di strip penyeberangan itu; dinilai dapat diterima (jembatan penyeberangan memang harus bersih dari pohon) |
| Tenda Meja | 161,2..164,8 | −96,7..−93,4 | `bbox.json` +0,5 m (hutan) |
| Tenda Hijau | 174,2..179,8 | −88,9..−83,1 | `bbox.json` +0,5 m (hutan) |
| Bangku Log 1 | 165,6..168,0 | −87,6..−85,3 | `bbox.json` +0,5 m (hutan) |
| Bangku Log 2 | 172,3..174,7 | −95,0..−92,6 | `bbox.json` +0,5 m (hutan) |

**Sengaja TIDAK dimasukkan:** lampu/bangku/tiang pagar/peti (pohon 0,5 m dari tiang
lampu bukan pelanggaran — audit sendiri mengadjudikasi kasus itu 0 segitiga),
tanaman/bunga, danau (sudah ditangani lingkaran r 28 di padang; elips 23×18
berada di dalamnya), sekolah (sudah ditangani rect x −250..−170, z 38..88 di padang;
semua gedung sekolah berada di dalam rect itu).

## B.3 Kode persis

### B.3.1 Sisipan 1 — tabel + helper, sesudah `acakVeg()` (baris 1163–1169)

Teks lama (baris 1163–1169, akhir fungsi `acakVeg` + baris kosong sebelum `catatPohon`):

```js
var _rngVeg = 20261040;   /* AUDIT 2026-11-09: aliran TERPISAH dari _rngAset — acakAset() tidak boleh bergeser (replay POHON_DET + v/ry pohon deterministik tetap sama). Seed diubah 20261023→20261040 sesudah replay: seed lama menaruh 8 pohon di jalan/bangunan (uji segitiga, lih. LAPORAN-EKSEKUSI.md); 20261040 = 0 pelanggaran. */
function acakVeg(){ /* mulberry32, seed 20261040, state terpisah — untuk penempatan vegetasi/awan */
  _rngVeg |= 0; _rngVeg = _rngVeg + 0x6D2B79F5 | 0;
  var t = Math.imul(_rngVeg ^ _rngVeg >>> 15, 1 | _rngVeg);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
```

Teks baru = teks lama + blok berikut (disisipkan persis sesudah `}` penutup `acakVeg`,
sebelum `function catatPohon` baris 1170). Penempatan di sini menjamin tabel tersedia
untuk ketiga blok vegetasi (1775, 4657, 5423) dan untuk kamera (§C):

```js
/* ===== R6 (2026-11-09): TAPAK NYATA untuk filter vegetasi + kamera =====
   Akar: lingkaran kollider kode (G01-G10 r 3,95-5,35, baris 1407) jauh lebih
   kecil dari tapak GLB (G09 setengah-diagonal 9,48 m), toko/gerobak dimuat
   setelah blok kota, dan filter padang hanya mengenal jalan barat z -12..0.
   Seed 20261023 menaruh 8 pohon di jalan/bangunan karena celah ini.
   Bentuk: OBB [cx,cz,hx,hz,ry,maxY] — pusat VISUAL dari audit/bbox.json
   (bukan posisi loader!), hx/hz = setengah-bentang lokal GLB. JANGAN ganti
   dengan AABB dunia: AABB+1 m menolak 5 pohon hidup yang uji segitiga
   nyatakan bersih (sudut bangunan putar + kanopi/teras).
   G01 memakai rect perimeter kode (7,85x5,97) — OBB-bbox-nya menolak pohon
   hidup (-26,8;-8,4) yang berdiri di teras terbuka (uji segitiga bersih).
   maxY dipakai kamera (§C); filter vegetasi memakai 5 angka pertama. */
var ZONA_LARANG_VEG = [
  [-27.00, -14.00, 3.93, 2.99, 0.000, 8.91],   /* G01 (rect kode) */
  [14.75, 19.66, 4.45, 4.72, 3.785, 13.92],    /* G02 */
  [-23.83, 19.86, 5.05, 4.62, 5.404, 10.98],   /* G03 */
  [-7.20, 17.89, 3.20, 9.41, 5.903, 19.06],    /* G04 — pusat VISUAL, bukan loader (-15,37.4)! */
  [9.85, 32.42, 3.99, 4.05, 0.180, 15.77],     /* G05 */
  [-34.54, -31.40, 5.20, 5.11, 3.797, 15.34],  /* G06 */
  [29.72, 16.91, 5.36, 4.65, 1.249, 13.55],    /* G07 */
  [34.57, -14.92, 3.66, 3.66, 1.903, 15.86],   /* G08 */
  [20.71, -27.53, 5.40, 7.80, 2.504, 12.48],   /* G09 */
  [-14.00, -33.00, 7.35, 4.90, 3.321, 8.32],   /* G10 */
  [-9.89, -44.00, 5.69, 6.42, 1.571, 7.94],    /* Toko Kopi Senja */
  [-8.02, -58.01, 5.68, 4.98, 1.571, 7.25],    /* Toko Roti & Kopi */
  [-8.69, -70.00, 4.87, 4.71, 1.571, 8.92],    /* Toko Buku & Kertas */
  [-8.57, -80.00, 3.30, 3.31, 1.571, 4.71],    /* Toko Bunga */
  [16.64, -44.00, 5.62, 5.79, -1.571, 7.39],   /* Toko Es Krim */
  [15.21, -57.00, 4.75, 4.01, -1.571, 6.58],   /* Toko Studio Foto */
  [15.49, -68.00, 4.41, 3.96, -1.571, 6.86],   /* Toko Teh & Rempah */
  [15.38, -80.00, 5.32, 4.75, -1.571, 8.62],   /* Toko Mainan */
  [-25.00, -46.45, 3.90, 4.35, 0.000, 23.75],  /* Menara Jam */
  [22.44, 0.00, 3.40, 1.06, 1.571, 5.13],      /* Gerbang Pasar */
  [21.84, -11.69, 1.19, 0.55, 0.500, 2.09],    /* Gerobak Pasar 1 */
  [39.77, 11.31, 1.19, 0.55, -2.200, 2.09],    /* Gerobak Pasar 2 */
  [6.51, 55.59, 0.55, 1.19, 0.120, 2.09]       /* Gerobak Es Krim */
];
/* Rect [x0,x1,z0,z1] — jalan terukur probe.py + sungai + perkemahan (hutan). */
var RECT_LARANG_VEG = [
  [-4, 4, -96, 195],       /* jalan N-S */
  [-90, 54, -8, 8],        /* jalan E-W utama */
  [-122, -86, -12, 0],     /* jalan E-W barat */
  [-90, -86, 0, 20],       /* jalan E-W stub utara */
  [-52, 52, 177, 183],     /* jalan selatan */
  [-122, -118, -40, -12],  /* jalan vertikal barat */
  [41, 58, -22, 22],       /* sungai (juga menutupi strip jembatan darat timur — sengaja) */
  [161.2, 164.8, -96.7, -93.4],  /* Tenda Meja */
  [174.2, 179.8, -88.9, -83.1],  /* Tenda Hijau */
  [165.6, 168.0, -87.6, -85.3],  /* Bangku Log 1 */
  [172.3, 174.7, -95.0, -92.6]   /* Bangku Log 2 */
];
function diOBBVeg(x, z, o, m){
  var dx = x - o[0], dz = z - o[1];
  var c = Math.cos(o[4]), s = Math.sin(o[4]);
  var lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.abs(lx) <= o[2] + m && Math.abs(lz) <= o[3] + m;
}
function diZonaLarangVeg(x, z){
  var i;
  for (i = 0; i < ZONA_LARANG_VEG.length; i++){
    /* G04 margin 0,3 m (bukan 0,5): tapaknya non-persegi + pohon hidup
       (-8,53; 28,10) hanya 0,56 m di luar sisi OBB — margin 0,5
       menyisakan 0,06 m, terlalu rapuh terhadap pembulatan. */
    var m = (ZONA_LARANG_VEG[i][0] === -7.20 && ZONA_LARANG_VEG[i][1] === 17.89) ? 0.3 : 0.5;
    if (diOBBVeg(x, z, ZONA_LARANG_VEG[i], m)) return true;
  }
  for (i = 0; i < RECT_LARANG_VEG.length; i++){
    var r = RECT_LARANG_VEG[i];
    if (x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3]) return true;
  }
  return false;
}
```

> **Catatan untuk koordinator:** identifikasi G04 lewat `cx/cz` di atas rapuh bila tabel
> diedit. Alternatif yang lebih bersih: simpan margin sebagai elemen ke-7 tiap entri
> (`[..., maxY, margin]`; G04 = 0,3, lainnya 0,5) dan baca `o[6] || 0.5` di
> `diZonaLarangVeg`. Saya membiarkan versi `cx/cz` di atas supaya tabel tetap
> 6 kolom seperti §B.2 — pilih salah satu, JANGAN keduanya; hasil ujinya sama.

### B.3.2 Sisipan 2 — blok pohon kota (baris 1800–1802)

Teks lama (baris 1800–1802):

```js
    var s = 0.85 + acakVeg() * 0.55;
    var reg = 0.9 + acakVeg()*0.3;
    var ry = acakVeg() * Math.PI;
```

Teks baru (satu baris ditambahkan **sesudah** ketiga undian — ini kuncinya, lihat §B.4):

```js
    var s = 0.85 + acakVeg() * 0.55;
    var reg = 0.9 + acakVeg()*0.3;
    var ry = acakVeg() * Math.PI;
    if (diZonaLarangVeg(px, pz)) continue;   /* R6: tapak nyata + jalan/sungai — cek SESUDAH undian s/reg/ry agar aliran acakVeg() kandidat yang ditolak sama dengan yang diterima (5 undian), sehingga pohon yang tetap sama posisinya */
```

### B.3.3 Sisipan 3 — blok padang (baris 4674)

Teks lama (baris 4674):

```js
    warna.setHSL(0.29 + acakVeg() * 0.05, 0.5, 0.3 + acakVeg() * 0.1); /* undian lama dijaga — aliran acak hilir tetap sama */
```

Teks baru (satu baris ditambahkan sesudahnya, sebelum komentar F14 baris 4675):

```js
    warna.setHSL(0.29 + acakVeg() * 0.05, 0.5, 0.3 + acakVeg() * 0.1); /* undian lama dijaga — aliran acak hilir tetap sama */
    if (diZonaLarangVeg(x, z)) continue;   /* R6: tapak nyata + jalan/sungai — cek SESUDAH semua undian (s, ry, warna x2) agar aliran kandidat yang ditolak sama dengan yang diterima (6 undian) */
```

### B.3.4 Sisipan 4 — blok hutan, di dalam `taruh()` (baris 5426–5431)

Teks lama (baris 5426–5431):

```js
  function taruh(x, z, s, zona){
    var y0 = tinggiTanah(x, z);
    var ry = acakVeg() * 6.28;
    warna.setHSL(0.33 + acakVeg() * 0.03, 0.45, 0.16 + acakVeg() * 0.07); /* undian lama dijaga — aliran acak hilir tetap sama */
    /* F14: puncak pinus lama ±5.09×s / GLB 3.20 → faktor 1.594 */
    catatPinus(x, y0, z, ry, s * 1.594, zona);
```

Teks baru (cek disisipkan sesudah undian warna, sebelum `catatPinus` — berlaku
untuk loop hutan 232 maupun loop gunung 22 karena keduanya memanggil `taruh()`):

```js
  function taruh(x, z, s, zona){
    var y0 = tinggiTanah(x, z);
    var ry = acakVeg() * 6.28;
    warna.setHSL(0.33 + acakVeg() * 0.03, 0.45, 0.16 + acakVeg() * 0.07); /* undian lama dijaga — aliran acak hilir tetap sama */
    if (diZonaLarangVeg(x, z)) return;   /* R6: tapak nyata + jalan/sungai/perkemahan — cek SESUDAH semua undian taruh (ry + warna x2) agar aliran kandidat yang ditolak sama dengan yang diterima (6 undian) */
    /* F14: puncak pinus lama ±5.09×s / GLB 3.20 → faktor 1.594 */
    catatPinus(x, y0, z, ry, s * 1.594, zona);
```

**Tidak ada perubahan lain.** Filter-filter lama (kios 3,2 m, jalan N–S/E–W, Taman
Bukit, lobus pasar, boulevard, Pantai, mercusuar, danau r 28, sekolah rect,
`jarakRute5`, Lapangan + 3 rumah) **tetap apa adanya** — R6 hanya menambah,
tidak mengganti. Blok awan tidak diubah. Seed `20261040` tidak diubah.

## B.4 Determinisme — kenapa urutan undian tetap (dan kapan tidak)

Kunci: cek R6 diletakkan **sesudah semua undian yang dilakukan untuk kandidat
yang diterima**, dan sebelum pencatatan. Maka:

- Kandidat yang **lolos** filter lama + R6: undiannya persis sama seperti dulu
  (kota 5, padang 6, hutan 6) → posisi + `s/reg/ry` + warna identik.
- Kandidat yang **lolos filter lama tapi ditolak R6**: undiannya JUGA sudah
  terlanjur ditarik semua (5/6/6) → kandidat berikutnya mulai dari offset aliran
  yang sama seperti bila kandidat itu diterima. **Posisi semua pohon yang
  bertahan di dalam blok itu tidak berubah.**
- **Satu-satunya pergeseran yang tersisa: refill.** Loop berjalan sampai kuota
  (`jadi<30`, `<76`, `<232+22`) — pohon yang dibuang R6 digantikan kandidat
  tambahan di ujung loop, yang menarik undian **di luar** ujung aliran lama
  blok itu → blok hilir (padang → hutan → awan) bergeser. Ini tak terhindarkan
  bila kuota dipertahankan, dan tidak ada jalan menghindarinya tanpa mengubah
  semantik loop (mis. undian dummy tidak membantu: ia menjaga per-kandidat,
  bukan total blok — refill tetap menambah konsumsi total).
- **Untuk seed live 20261040 pergeseran ini TIDAK TERJADI SAMA SEKALI** karena
  R6 menolak 0 pohon (bukti §B.5) → tidak ada refill → aliran utuh, replay
  byte-identik. Syarat seed di §B.6 adalah konsekuensi langsung dari fakta ini.

## B.5 Bukti uji (dijalankan analis, skrip di `/tmp` — koordinator wajib re-run, §B.6)

Metode: port Python dari `replay-veg.mjs`/`scan-seed.py` (mulberry32 bit-persis,
divalidasi vs `replay-veg.json`), filter spek-final diterapkan pada posisi replay.

| Uji | Hasil |
|---|---|
| Seed **20261040** (live): kota 30, padang 76, hutan 254 | **Ditolak R6: 0 / 0 / 0** (termasuk tenda/bangku). Replay identik → seed TETAP, tidak perlu cari seed baru |
| Seed 20261023 (replay Python sejati — lihat catatan §D): kota | **Ditolak 7**: 6 pelanggar nyata (G04 (−10,6; 24,1); G10 (−20,4; −36,0), (−7,1; −31,0); Es Krim (13,0; −45,9), (18,0; −47,0); Kopi (−6,7; −43,7)) + **1 false positive** (15,3; −39,5) di Es Krim — titik itu 1,1 m di dalam sisi OBB tapi uji segitiga menyatakan bersih (kemungkinan relung/teras masuk; OBB tidak bisa membedakan relung dari dinding) |
| Seed 20261023: padang | **Ditolak 2**: (−88,1; 2,4) jalan E–W dan (−120,5; −26,2) jalan vertikal barat — **kedua pelanggar jalan tertangkap** |
| Seed 20261023: hutan | Ditolak 0 (tidak ada pelanggaran hutan pada seed itu) |
| Total | **8/8 pelanggaran nyata seed 20261023 tertangkap**; false positive 1/360 pohon (0,3%) pada seed lama, 0/360 pada seed live |
| Kontrol negatif | AABB dunia +1 m (alternatif yang ditolak §B.1) menolak **5 pohon hidup** seed 20261040 — membuktikan OBB adalah pilihan yang benar |

## B.6 Cara verifikasi (koordinator)

1. **Perbarui skrip replay/cek** (bukan `index.html`): salin logika `diZonaLarangVeg`
   (tabel + `diOBBVeg`) ke `audit/plan/replay-veg.mjs` (tiga blok: kota/padang/hutan,
   pada posisi yang sama — sesudah undian) dan ke `audit/plan/scan-seed.py`
   (`replay()`). Ini wajib: replay lama tidak mengenal filter baru.
2. `cd ~/workspace/lumina/audit/plan && node replay-veg.mjs` → harus mencetak
   `kota: 30/30, padang: 76/76, hutan: 254/254` dan `PELANGGARAN: 0`.
3. **Gerbang determinisme (WAJIB LOLOS):** `diff` posisi baru vs
   `audit/plan/replay-veg-bersih.json` (seed 20261040) → **harus identik persis**
   (semua 360 + 9 awan). Bila ada satu titik pun berbeda → STOP, jangan deploy;
   kemungkinan penyebab: pembulatan tabel (khususnya G04 — lihat §B.1) atau
   cek diletakkan sebelum undian. Perbaiki sampai diff kosong.
4. `python3 scan-seed.py` → validasi port harus tetap `True` untuk seed 20261040
   (bukan 20261023 — lihat §D soal file JSON yang tertimpa) dan pelanggaran 0.
5. `node --check` pada 3 blok `<script>` inline (pola LAPORAN-EKSEKUSI §6).
6. **Syarat seed:** seed `20261040` **TETAP** bila langkah 2–4 lolos (yang
   diharapkan dari §B.5). Bila langkah 3 gagal dan tidak bisa diperbaiki dengan
   penyesuaian margin/pembulatan: JANGAN paksakan seed lama — jalankan
   `scan-seed.py` untuk mencari seed bersih baru (loop `20261024..20261223`
   sudah ada di skrip) dan laporkan seed barunya ke pemilik; posisi kota akan
   berubah total (itu konsekuensi yang harus disetujui, bukan disembunyikan).
7. Playtest visual (browser, oleh koordinator): bandingkan screenshot kota
   sebelum/sesudah dari titik lahir — harus **tidak ada perbedaan yang terlihat**
   (filter ini no-op pada seed live). Bila ada pohon yang hilang/berpindah →
   gerbang langkah 3 pasti gagal juga; jangan deploy.

## B.7 Risiko R6 (jujur)

1. **OBB ≠ segitiga.** OBB adalah persegi panjang; tapak nyata punya relung,
   teras, dan kanopi (bukti: 1 false positive Es Krim pada seed lama). Filter
   ini **mengurangi** pelanggaran secara drastis, bukan menghilangkannya secara
   matematis. Gerbang akhir tetap uji segitiga (`scan-seed.py` + `tri_test.py`)
   untuk seed apa pun yang dipakai — filter tidak menggantikan scan seed.
2. **Rapuh pembulatan di G04** (sisa 0,26 m dengan margin 0,3). Bila koordinator
   membulatkan tabel ke 1 desimal, uji ulang §B.6 langkah 3 adalah penangkapnya.
3. **Tabel bisa basi.** Bila ada GLB yang dipindah/diganti (posisi/rotasi/skala),
   `ZONA_LARANG_VEG` harus ikut dihitung ulang dari `bbox.json` (prosedur
   §B.1: 2 baris Python). Ini utang perawatan baru — tapi utang yang sama
   sudah ada pada `penabrak` dan filter kios; tidak ada yang baru secara prinsip.
4. **Rect sungai menutupi strip jembatan darat timur** (dinyatakan di §B.2).
   Bila pemilik ingin pohon di strip itu, rect sungai harus dipecah mengikuti
   meander (dua rect, lihat data `probe.py` §B.2) — bukan alasan menolak R6.
5. **Alternatif yang lebih aman (bila koordinator ragu):** terapkan HANYA rect
   jalan/sungai + OBB untuk 4 bangunan yang TERBUKTI bocor (G04, G10, Es Krim,
   Kopi) — 8/8 pelanggaran seed lama tetap tertangkap, tabel 5x lebih kecil,
   dan risiko false positive di bangunan lain hilang. Kerugiannya: bangunan
   lain tetap mengandalkan keberuntungan seed. Saya tetap merekomendasikan
   tabel penuh (§B.2) karena buktinya 0-perubahan pada seed live.

# C. KAMERA MENEMBUS DINDING

## C.1 Cara kerja kamera saat ini

Lokasi: `perbaruiKamera(dt, detik)` baris 7308–7345. Variabel: `camPos`
(baris 7304, tidak dipakai di follow), `camTarget` (7305), `camJarak = 8.4`
(7306), `camYaw = 0, camPitch = 0.30` (baris 6853), `camPitch` di-clamp
`0,06..1,15` (baris 6907), `camJarak` di-clamp `3,5..16` (baris 6900, 6927).

Rumus target (baris 7318–7322):

```js
camTarget.set(
  px + Math.sin(camYaw) * cp * camJarak,
  py + sp * camJarak + 0.6,
  pz + Math.cos(camYaw) * cp * camJarak
);
```

dengan `cp = cos(camPitch)`, `sp = sin(camPitch)`. Tinggi kamera di atas tanah
pemain: `sin(pitch)·8,4 + 0,6` → **1,10 m (pitch min) – 8,28 m (pitch maks)**,
default pitch 0,30 → **3,08 m**. Jadi kamera hampir selalu berada di dalam
rentang tinggi dinding gedung plaza (8–19 m) dan toko (4,7–8,9 m).

Perlindungan yang sudah ada:

1. **Lantai tanah** (baris 7326–7327): `if (camTarget.y < tanahCam + 0,7)`
   naikkan ke `tanahCam + 0,7` — hanya lantai, tidak ada atap/dinding.
2. **S1** (baris 7328–7342): dorong `camTarget` keluar lingkaran `penabrak`
   (`r + 0,3`) secara radial, 2 pass. Komentar kodenya sendiri mengakui batasnya:
   *"Dijamin = posisi diam; sapuan lerp saat orbit cepat masih bisa menyenggol
   sudut sesaat."* (baris 7330–7331).
3. Lerp posisi (baris 7343): `camera.position.lerp(camTarget, 1 - exp(-dt·6))`,
   lalu `lookAt` pemain (baris 7344). **Hanya `camTarget` yang dijepit —
   `camera.position` hasil lerp tidak pernah dijepit.**

## C.2 Kenapa kamera masih bisa masuk dinding (3 mekanisme, semua terhitung)

**Mekanisme 1 — S1 buta di sudut bangunan persegi yang diputar (utama).**
S1 hanya mengenal lingkaran. Untuk bangunan persegi yang diputar, sudutnya
jauh di luar lingkaran. Contoh terhitung — **Gedung G09**:
kollider lingkaran di (20,−27) r 5,35 (baris 1407: i=8, lebar 9,3, dalam 6,0);
tapak visual OBB pusat (20,71; −27,53), hx 5,40, hz 7,80, ry 2,5041,
setengah-diagonal **9,48 m**, atap 12,48 m.
Skenario: pemain di **(24, −41)** (di selatan G09, di luar lingkaran —
jarak ke pusat lingkaran 14,56 m > 5,90 batas dorong pemain, jadi pemain
boleh berdiri di sana), menghadap utara (`camYaw = 0`), pitch 0,30,
`camJarak` 8,4 → `camTarget = (24,00; 3,08; −32,98)`.
- Koordinat lokal G09: lx 0,59 (hx 5,40), lz 6,33 (hz 7,80) → **di dalam OBB**,
  dan y 3,08 < atap 12,48 → **kamera di dalam dinding G09**.
- S1: jarak `camTarget` ke pusat lingkaran (20,−27) = **7,19 m > 5,65** →
  **S1 diam total.** Tidak ada mekanisme lain yang bergerak.
- Perbaikan §C.3 mendorong target keluar lewat sisi selatan OBB (jarak ke
  sisi lz hanya 1,77 m) → kamera berhenti 0,3 m di luar dinding.

**Mekanisme 2 — G04: kollidermu tidak ada di bangunan visual (kasus ekstrem).**
Lihat §A.3 butir 6: lingkaran G04 di (−15, 37,4) r 4,5 berjarak 9,67 m dari
titik tapak visual terdekat — **tidak bersentuhan**. S1 tidak akan pernah
mendorong kamera keluar dari visual G04 (pusat (−7,20; 17,89), tapak
6,4×18,8 m, atap 19,06 m). Pemain yang menempel dinding G04 akan
menempatkan kamera **di tengah bangunan**. Satu-satunya penolong selama ini
adalah posisi G04 yang agak jauh dari jalur pejalan kaki biasa.

**Mekanisme 3 — sapuan lerp (diakui kode sendiri).**
`camera.position` tidak dijepit; segmen lurus dari posisi lama ke `camTarget`
baru bisa memotong sudut bangunan walau kedua ujungnya di luar tapak
(mis. orbit cepat / pemain berbelok tajam di sudut gedung). Ini menjelaskan
keluhan "kadang-kadang menembus" yang tidak bisa direproduksi dari posisi
diam: posisi diam dijamin S1, sapuannya tidak.

(Dua faktor pendukung: toko Kopi/Es Krim pusat visualnya bergeser 1,44–1,49 m
dari posisi kollidermu (3 lingkaran r 2,99/3,25, baris 3331/3517) sehingga
sudut etalase terbuka; dan pemain didorong oleh lingkaran yang sama
(baris 7264: `rr = t.r + 0,55`) — jadi pemain bisa berdiri menempel dinding
visual sementara kamera 8,4 m di belakangnya sudah berada di dalam bangunan
sebelahnya.)

**Perilaku normal yang dipertahankan:** jarak 8,4 / pitch 0,30 / yaw bebas /
clamp 3,5–16 dan 0,06–1,15 / lantai tanah +0,7 / lerp 6/detik / `lookAt`
bidikY — semuanya **tidak diubah**. Perbaikan hanya mendorong titik yang
terbukti berada di dalam tapak di bawah atap.

## C.3 Kode persis

### C.3.1 Sisipan 1 — helper, sebelum `perbaruiKamera` (baris 7307–7308)

Teks lama (baris 7304–7308):

```js
var camPos = new THREE.Vector3(0, 6, 20);
var camTarget = new THREE.Vector3();
var camJarak = 8.4;
var modeFoto = false;
function perbaruiKamera(dt, detik){
```

Teks baru (helper disisipkan antara `var modeFoto = false;` dan
`function perbaruiKamera(dt, detik){` — memakai `ZONA_LARANG_VEG` dari §B.3.1,
jadi sisipan R6 harus diterapkan dulu; bila R6 ditunda, tabel §B.2 harus ikut
disisipkan bersama helper ini):

```js
var camPos = new THREE.Vector3(0, 6, 20);
var camTarget = new THREE.Vector3();
var camJarak = 8.4;
var modeFoto = false;
/* R6-KAMERA (2026-11-09): dorong satu titik (Vector3) keluar dari tapak
   nyata (OBB ZONA_LARANG_VEG, pusat visual dari bbox.json) bila titik itu
   berada di dalam tapak DAN di bawah atap bangunan tsb (v.y < maxY).
   Keluar lewat sisi OBB terdekat (sumbu lokal), margin 0,3 m. Dipakai
   untuk camTarget dan camera.position — S1 (lingkaran kollider) buta di
   sudut bangunan persegi yang diputar (G09: setengah-diagonal 9,48 m vs
   lingkaran r 5,35) dan buta total untuk G04 yang kollidermu tidak
   menyentuh bangunan visualnya. Mengembalikan true bila ada dorongan. */
function dorongKeluarTapak(v){
  var terdorong = false;
  for (var i = 0; i < ZONA_LARANG_VEG.length; i++){
    var o = ZONA_LARANG_VEG[i];
    if (v.y >= o[5]) continue;   /* di atas atap: bebas, jangan didorong */
    var dx = v.x - o[0], dz = v.z - o[1];
    var c = Math.cos(o[4]), s = Math.sin(o[4]);
    var lx = dx * c - dz * s, lz = dx * s + dz * c;
    if (Math.abs(lx) <= o[2] + 0.3 && Math.abs(lz) <= o[3] + 0.3){
      if (o[2] + 0.3 - Math.abs(lx) < o[3] + 0.3 - Math.abs(lz)) lx = (lx >= 0 ? 1 : -1) * (o[2] + 0.3);
      else lz = (lz >= 0 ? 1 : -1) * (o[3] + 0.3);
      v.x = o[0] + lx * c + lz * s;
      v.z = o[1] - lx * s + lz * c;
      terdorong = true;
    }
  }
  return terdorong;
}
function perbaruiKamera(dt, detik){
```

### C.3.2 Sisipan 2 — di `perbaruiKamera`, sesudah loop S1 dan sesudah lerp

Teks lama (baris 7342–7344 — penutup loop S1, lerp, `lookAt`):

```js
  }
  camera.position.lerp(camTarget, 1 - Math.exp(-dt * 6));
  camera.lookAt(px, py + ((pemain.av && pemain.av.bidikY) || ((pemain.av && pemain.av.modelBaru) ? 1.62 : 1.7)), pz);   /* bidik per karakter: cewek baru 1,62; cowok baru 1,98; lama/prosedural 1,7 */
```

Teks baru:

```js
  }
  /* R6-KAMERA: keep-out tapak nyata untuk TARGET — S1 di atas tidak
     menutupi sudut bangunan persegi yang diputar; jarak/tinggi/sudut
     default TIDAK diubah, dorongan hanya bila target memang di dalam
     tapak di bawah atap. 2x panggil (cerminan 2 pass S1) untuk tapak
     yang bersebelahan. */
  dorongKeluarTapak(camTarget);
  dorongKeluarTapak(camTarget);
  camera.position.lerp(camTarget, 1 - Math.exp(-dt * 6));
  /* R6-KAMERA: jepit JUGA posisi hasil lerp — segmen lerp dari posisi lama
     ke target baru bisa memotong sudut bangunan walau kedua ujungnya di
     luar tapak (pengakuan S1 sendiri di komentarnya). Dorongan ini
     hanya mengubah posisi render, bukan target; y tidak diubah sehingga
     lantai tanah +0,7 tetap berlaku. */
  dorongKeluarTapak(camera.position);
  camera.lookAt(px, py + ((pemain.av && pemain.av.bidikY) || ((pemain.av && pemain.av.modelBaru) ? 1.62 : 1.7)), pz);   /* bidik per karakter: cewek baru 1,62; cowok baru 1,98; lama/prosedural 1,7 */
```

**Yang sengaja TIDAK diusulkan (dan kenapa):**
- *Tarik kamera mendekat (dolly-in / raycast) bila terhalang* — itu perbaikan
  yang lebih benar secara sinematik (kamera memendek, bukan menggeser ke
  samping), tapi butuh raycast terhadap mesh/OBB di sepanjang sinar
  pemain→kamera + perubahan `camJarak` efektif per frame. Risiko perilaku
  (zoom yang berdenyut saat orbit) lebih besar; keep-out geser-sisi ini
  minimal dan perilakunya dapat diprediksi. Bila pemilik mengeluh kamera
  "melompat ke samping" di sudut gedung, dolly-in adalah langkah berikutnya.
- *Angkat kamera ke atas atap* — tidak diusulkan: melompat 8–19 m ke atas
  jauh lebih mengganggu daripada geser sisi 1–2 m.
- *Cabang menu/orbit (`!sudahMasuk`, baris 7309–7315)* — tidak diubah (lihat §D).

## C.4 Cara verifikasi

1. `node --check` pada 3 blok `<script>` inline (pola LAPORAN-EKSEKUSI §6).
2. **Uji browser (koordinator, wajib sebelum deploy):**
   - Skenario G09 (§C.2): pemain ke **(24, −41)**, hadap utara, pitch default.
     Sebelum perbaikan: gedung G09 menutupi layar / kamera di dalam dinding.
     Sesudah: kamera berhenti di luar dinding selatan G09, pemain tetap terlihat.
   - Skenario G04: pemain menempel dinding visual G04 dari arah plaza
     (sekitar (−7, 10) menghadap utara) → kamera tidak lagi masuk ke badan G04.
   - Orbit cepat: putar kamera 360° sambil menempel di sudut G07/G08/G10 →
     tidak ada frame di dalam dinding (perhatikan transisi sudut — di sinilah
     jepitan posisi lerp bekerja).
   - Regresi perilaku normal: jalan di plaza terbuka, pitch min/maks, zoom
     pinch/wheel 3,5–16 m → jarak/tinggi/sudut terasa sama seperti sebelum
     (tidak ada dorongan bila tidak ada bangunan di dekat kamera).
   - Menu masuk (`!sudahMasuk`): orbit kamera tetap seperti biasa (cabang ini
     tidak diubah).
3. Biaya: helper meloop 23 entri OBB (2x target + 1x posisi) per frame —
   dapat diabaikan dibanding S1 yang meloop seluruh `penabrak` 2x per frame
   (126 situs push di kode, ratusan entri saat jalan).

## C.5 Risiko kamera (jujur)

1. **Kamera bisa "melompat" ke sisi lain saat orbit melewati sudut.** Dorongan
   sisi-terdekat diskontinu di garis tengah OBB: bila `camTarget` melintasi
   garis tengah bangunan saat orbit, sisi dorong berpindah dan kamera melompat
   beberapa meter dalam 1 frame (dilembutkan sebagian oleh lerp 6/detik, tapi
   tetap terasa). Ini harga dari keep-out tanpa raycast. Bila terasa
   mengganggu, mitigasinya: histeresis sisi (ingat sisi terakhir) atau beralih
   ke dolly-in — keduanya pekerjaan susulan, bukan alasan menolak keep-out ini
   (kamera di dalam dinding lebih buruk daripada kamera yang melompat).
2. **Dua OBB yang bersebelahan:** dorongan dari satu OBB secara teori bisa
   mendarat di OBB tetangga (celah antar bangunan ≥1 m di rencana audit;
   dorongan maksimum ~setengah lebar bangunan). Dipanggil 2x untuk target,
   tapi tidak ada jaminan konvergensi mutlak. Praktiknya: 23 OBB di tabel
   tidak ada yang tumpang tindih (jarak antar tapak ≥1 m), dan jepitan posisi
   lerp menjadi pertahanan kedua. Bila ditemukan kasus kamera terjepit di
   antara dua bangunan, tambahkan pass ketiga — bukan redesign.
3. **G01 teras/kanopi:** tabel memakai rect kode G01 (demi R6), sehingga kamera
   masih bisa berada di bawah kanopi teras depan G01 — itu ruang terbuka
   (bukan di dalam dinding), dapat diterima.
4. **Cakupan terbatas:** hanya 23 tapak plaza/toko/menara/gerbang/gerobak.
   Gedung sekolah (dinding perimeter lingkaran r 0,6 rapat — S1 cukup),
   konser, rumah, kolam, dsb. **tidak** tercakup. Bila pemilik melaporkan
   tembus di sana, tambah baris OBB dari `bbox.json` ke tabel yang sama
   (helper tidak berubah) — bukan perbaikan baru.
5. **Atap `maxY` toko mengandung kotak fallback** (TB7: Kopi 7,94 vs GLB 4,67)
   → kamera di 4,67–7,94 m dekat toko kadang didorong ke samping tanpa perlu.
   Efeknya kecil (kamera jarang setinggi itu di dekat toko) dan arahnya
   konservatif (tidak pernah membiarkan tembus).

---

# D. TEMUAN SAMPING (di luar tugas — JANGAN diterapkan tanpa keputusan koordinator)

1. **Pemain bisa jalan menembus visual G04.** Akar yang sama dengan §A.3 butir 6
   / §C.2 mekanisme 2: satu-satunya kollider G04 adalah lingkaran di
   (−15, 37,4) r 4,5 (baris 1407) yang berjarak 9,67 m dari tapak visual.
   Pemain didorong oleh lingkaran yang sama (baris 7264, `rr = t.r + 0,55`),
   jadi tidak ada yang menghalangi pemain masuk ke badan visual G04
   (pusat (−7,20; 17,89), 6,4×18,8 m). Perbaikan pemain adalah pekerjaan
   terpisah (mis. 3 lingkaran di sepanjang sumbu slab G04, pola toko baris
   3331) — **tidak** termasuk dalam usulan ini karena tugas ini hanya kamera
   + vegetasi, dan mengubah kollider pemain memengaruhi gerakan/level design.
   Dilaporkan di sini supaya koordinator tahu kamera bukan satu-satunya
   korban kollider G04.
2. **Kamera menu/orbit (`!sudahMasuk`, baris 7309–7315) menembus visual G04.**
   Orbit r 17 m, y 6,2 m: pusat OBB G04 berjarak 19,3 m dari (0,0) dan OBB
   menjangkau ~9,9 m → orbit memotong badan G04 (atap 19,06 m) pada busur
   yang lebar. Ini bug visual layar masuk yang sudah ada (bukan dari follow
   camera). Opsi perbaikan 1 baris: `dorongKeluarTapak(camTarget);` sesudah
   baris 7311 — **sengaja TIDAK saya usulkan sebagai bagian tugas** karena
   orbit yang didorong akan terlihat melompat-lompat di layar masuk tanpa
   playtest; perlu keputusan + playtest terpisah.
3. **`replay-veg.json` di disk sudah tertimpa data seed 20261040.**
   `replay-veg.mjs` kini berisi `_rngVeg = 20261040` (komentar di dalamnya
   masih menyebut 20261023), dan `replay-veg.json` isinya **identik persis**
   dengan `replay-veg-bersih.json` (dicek: kota/padang/hutan sama 100%).
   Akibatnya validasi `scan-seed.py` ("port seed 20261023 harus sama dengan
   `replay-veg.json`", tercatat `True` di `scan-seed.log`) **tidak lagi dapat
   direproduksi dari file yang ada** — replay Python sejati untuk 20261023
   berbeda dari JSON tersebut (saya memakainya untuk §B.5). Koordinator:
   bila butuh posisi 20261023 yang asli, generate ulang dari `scan-seed.py`
   `replay(20261023)` (jangan dari `replay-veg.json`), dan pertimbangkan
   mengembalikan `replay-veg.mjs` ke mode seed-parameter agar satu file
   tidak menimpa artefak seed lain. Ini tidak memengaruhi kebenaran usulan
   R6 (yang memakai replay Python + `replay-veg-bersih.json` sebagai acuan).

---

# E. PENILAIAN JUJUR ATAS RISIKO (ringkas)

| Usulan | Risiko terbesar | Seberapa besar | Penangkap / mitigasi |
|---|---|---|---|
| R6 tabel penuh | OBB menolak pohon yang sebenarnya bersih (false positive) — terbukti 1/360 pada seed lama | Kecil; 0 pada seed live | Gerbang diff replay (§B.6 langkah 3) — bila ada pohon berubah, STOP |
| R6 tabel penuh | Tabel basi bila GLB dipindah/diganti | Sedang (utang perawatan) | Prosedur hitung-ulang §B.1 (2 baris Python dari `bbox.json`) |
| R6 tabel penuh | Margin G04 rapuh pembulatan (sisa 0,26 m) | Kecil | Margin G04 0,3 (bukan 0,5); gerbang diff menangkap bila lolos |
| R6 (umum) | Bukan jaminan matematis 0 pelanggaran untuk semua seed (OBB ≈ segitiga) | Dinyatakan, bukan disembunyikan | Scan seed tetap menjadi gerbang (§B.6 langkah 4) |
| Kamera keep-out | Kamera melompat sisi saat orbit melewati garis tengah OBB | Sedang (terasa, tidak merusak) | Lerp 6/detik melembutkan; bila mengganggu → histeresis sisi / dolly-in (susulan) |
| Kamera keep-out | Dorongan antar-OBB yang bersebelahan (tanpa jaminan konvergensi) | Kecil (tidak ada OBB tumpang tindih) | 2x panggil target + jepitan posisi lerp |
| Kamera keep-out | Cakupan hanya 23 tapak (sekolah/konser/rumah tidak tercakup) | Sedang (bisa ada laporan susulan) | Tambah baris tabel saja, helper tetap |
| Keduanya | File berubah selama analisis (MD5/8.260 baris) — nomor baris bisa bergeser lagi | Nyata | Terapkan by exact-text + count-check; verifikasi ulang `node --check` + replay-diff sebelum deploy |

**Rekomendasi akhir analis:** terapkan **keduanya sekaligus** (mereka berbagi satu
tabel `ZONA_LARANG_VEG`; menerapkan satu tanpa yang lain membuang separuh nilai
tabel itu). Bila koordinator harus memilih satu karena waktu: dahulukan **kamera**
(keluhan pemain terlihat langsung di layar), lalu R6 (latent, seed live sudah
bersih — nilainya adalah mencegah regresi seed, bukan memperbaiki yang terlihat).
Dalam kedua kasus, **jangan ubah seed 20261040** dan **jangan lewati gerbang
diff replay** — itu satu-satunya bukti bahwa kota live tidak berubah.

## Lampiran — jejak uji analis

- `/tmp/uji-filter-r6.py` — AABB dunia +1 m menolak 5 pohon hidup 20261040
  (bukti §B.1); pembanding semua-bbox +1 m: kota 5, padang 1 (tiang lampu —
  adjudikasi 0), hutan 0.
- `/tmp/uji-obb.py` — OBB turunan `bbox.json` + validasi vs node GLB G04;
  margin 0/0,5/1,0 pada kedua seed; 6 pelanggar bangunan tertangkap di semua
  margin, pohon hidup (−8,5; 28,1) tertangkap hanya pada margin 1,0.
- `/tmp/uji-tier1.py` — spek Tier-1 (OBB+0,5, G04+0,3, G01 rect kode) +
  rect jalan/sungai; margin 0,5 → 0 penolakan pada 20261040.
- `/tmp/uji-final-r6-kamera.py` — spek final pada replay Python sejati
  20261023 + 20261040 (hasil §B.5) + skenario kamera G09 (§C.2) + jarak
  kollider G04 (§A.3 butir 6).
- `probe.py` (re-run) — rect jalan/sungai terukur §B.2 (E–W utama/stub,
  vertikal barat x −122..−118 z −40..−12, selatan z 177..183, sungai meander).
- Skrip `/tmp` bersifat sementara (VM bisa restart); koordinator harap
  mereproduksi dari spesifikasi di atas, bukan mengandalkan file `/tmp` ini.

*— Akhir laporan. File ini (baca-saja) disimpan di
`~/workspace/lumina/audit/plan/USULAN-R6-KAMERA.md` sesuai brief. Tidak ada
file lain yang diubah oleh analis.*
