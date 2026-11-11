# Laporan Audit Lanjutan — 11 Nov 2026 (PR 1 dari 2)

Basis: `main` sesudah PR #2 (commit 61ef414). Semua angka "sebelum" diukur ulang dari worktree
`main` itu, bukan dari laporan lama. Tidak ada deploy (proyek Vercel tanpa integrasi Git).

PR ini: **aula bisa dimasuki, G04 bisa dimasuki, glow jendela malam G01–G10, kedip/blink.**
Butir **tumpukan sungai × daratan (R1/T4)** dikerjakan di PR terpisah sesudah ini.

Harness & bukti: `audit/plan/lanjutan-20261111/` (skrip, log, PNG di `bukti/`).

---

## 1. Aula — interior bisa dimasuki

**Temuan**
- Lantai aula tidak ada di peta tinggi (`tinggiTanah`), dan rantai lingkaran collider lama menutup
  seluruh tapak. Pemain tidak bisa masuk.
- Sesudah collider diganti, pemain masih macet di ambang pintu. Raycast menunjukkan lambris dinding
  depan dalam (panel putih `Merged_Putih`, list emas `Merged_Emas`, list atas `Merged_PlesterGelap`,
  setinggi 0,38–1,41 m) **melintang tepat di bukaan pintu** (x lokal −1,65…1,70). Dari luar tidak
  kelihatan karena tertutup daun pintu.
- Lorong antar baris kursi hanya ±1 m. Dengan dorongan pemain standar 0,55 m, lorong itu tertutup.

**Perbaikan**
- `gedung-aula-v1e.glb` (dibuat `fix-aula.js`) = v1d + segitiga lambris dipotong di x lokal ±1,19
  (Sutherland–Hodgman, atribut diinterpolasi), ujung ditutup tiang lambris 5 cm. v1d tetap di disk.
- `LANTAI_GLB` + `bakarLantaiGLB()`: permukaan berjalan dari raycast geometri nyata (grid 0,25 m),
  hanya menimpa `tinggiTanah` di dalam grid itu. Registri kosong saat boot, jadi penempatan
  vegetasi tidak berubah (dicek identik, lihat §5). Diterima sebagai lantai: undakan batu
  0,13 → 0,33 → 0,50, turun ke marmer 0, jalur lantai `Merged_MarmerGelap` (< 0,1 m), panggung
  kayu 0,60. Kursi beludru dan alas pot dihitung sebagai penghalang.
- `pasangColliderOtomatis` mendapat opsi `tanah` (sampel diukur relatif lantai lokal, maks 3×3 sel,
  supaya tepi undakan/panggung bukan penghalang), `susut`, `rmin`, `tanahMaks`. Aula: blok
  0,125 m, badan 0,25–0,30 m dari kursi/dinding. Rantai lingkaran lama dibiarkan sebagai
  `tanpaPemain` + `tanpaKamera` (snapshot vegetasi tidak berubah).
- Kamera: baris `ZONA_LARANG_KAMERA` 23 (aula) ditambahkan; `KAMERA_MASUK` kini menyimpan tinggi
  plafon per gedung (G01 2,75 · G04 3,66 · aula 6,62). Kamera dijepit 0,3 m di bawah plafon.

**Bukti**: `verify.cjs` langkah "masuk aula s.d. panggung" berjalan dari halaman (−176,4; 66) lewat
undakan, pintu dan lorong tengah kursi sampai panggung (y 0,60) tanpa macet; kamera di dalam tapak,
di bawah plafon. `bukti/aula-dalam-siang.png`, `bukti/aula-dalam-malam.png`.

**File**: `index.html` (pasangAulaGLB, LANTAI_GLB, pasangColliderOtomatis, ZONA_LARANG_KAMERA,
KAMERA_MASUK, perbaruiKamera), `gedung-aula-v1e.glb` (baru), `STATUS.md`.

## 2. G04 — bisa dimasuki, pintu dibuka

**Temuan**: pintu model tertutup; lantai interior 0,64 m di atas plinth tanpa tangga; atas badan
etalase kayu (1,49) menembus list tembaga 1,38–1,46 dengan muka samping koplanar (kedip).

**Perbaikan**
- `gedung-g04-blender-v4.glb` (`fix-g04-v4.js`, dari v3): daun pintu diputar 90° ke dalam pada
  engselnya, undakan marmer 3 × 0,20 m di depan pintu, atas etalase kayu diturunkan ke 1,38.
- `gedung-g04-blender-v5.glb` (`fix-g04-v5.js`, dari v4): + 20 panel kaca jendela (lihat §3).
  Loader memakai v5. v2/v3 tetap di disk; v4 hanya langkah antara (tidak di-commit, dibuat ulang
  oleh skripnya).
- Lantai interior (`Int_Shell`, `Int_Rug`, `Undakan_Pintu`, ambang pintu) di `LANTAI_GLB`; collider
  dari geometri (dinding, etalase, alas zamrud, konter) dengan bukaan pintu |x lokal| < 0,52;
  baris G04 dihapus dari `ZONA_LARANG_PEMAIN` (baris kamera tetap); `KAMERA_MASUK[3]` = 3,66.
- Kamera: di dalam gedung enterable, jarak dolly minimum 0,9 m (di luar tetap 2,0 m). Dengan
  2,0 m kamera menembus dinding depan G04 (toko hanya 5,6 m) saat pemain dekat pintu
  (`gedungMasukDi()` baru dipakai bersama penjepit plafon).

**Bukti**: `verify.cjs` "masuk G04" berjalan dari plaza lewat undakan & pintu ke dalam toko (lokal
z > −16,5; pintu di −17,85), y lantai 0,64–0,68; "kamera ikut masuk G04" lolos.
`bukti/g04-dalam-siang.png`, `bukti/g04-dalam-arah-etalase.png`.

**File**: `index.html` (pasangGedungG04Blender, ZONA_LARANG_PEMAIN, perbaruiKamera),
`gedung-g04-blender-v5.glb` (baru).

## 3. Jendela G01–G10 menyala malam

**Temuan**: komentar loader G01–G10 sendiri mencatat "GLB ini tidak membawa glow itu — malam
hari gelap". G04 v3/v4 bahkan tidak punya kaca: 20 jendela atas hanya kotak kusen krem padat.

**Perbaikan**: `pasangJendelaMalam(model, reKaca)` — kaca luar tiap gedung dipecah per panel
(komponen terhubung). Panel lantai dasar (etalase, pusat < 3,2 m) selalu menyala; panel atas
menyala bila hash posisi dunia < 0,6, jadi polanya tetap dan tidak acak tiap muat. Panel menyala
= mesh kedua yang berbagi atribut geometri asal + klon material kaca ber-emissive (80 % kuning
hangat 0xc98a45, 20 % krem 0xd2b48a), didaftarkan ke `bahanJendela`, sehingga intensitasnya
ikut `langit.night × 1,35` seperti jendela kode dan tidak dilipat pass gabung. Siang hari
emissive 0, tampilan siang tidak berubah. Material: G01/G03 `Kaca|KacaToko`, G02 `Kaca`,
G04 `KacaJendela` (baru di v5), G05–G10 `KacaGelap`.

**Bukti**: `bukti/malam-g01-g10-sebelum.png` vs `bukti/malam-g01-g10-glow.png` (?jam=21).

**File**: `index.html` (pasangJendelaMalam + 10 loader), `gedung-g04-blender-v5.glb`.

## 4. Blink / kedip

**Cara ukur (baru)**: `flicker.js` + `fl.cjs` me-render adegan yang sama dengan near ×1,000 vs
×1,003/1,007/1,012 di framebuffer default (depth 24-bit; render target r128 hanya 16-bit).
Proyeksi x,y tidak bergantung pada near, jadi piksel yang warnanya berubah = urutan depth
ambigu = berkedip saat kamera bergerak. Piksel < 0,15 m dari near plane dibuang (garis potong
near, bukan kedip). Pasangan objek dinamai lewat raycast. 42 sudut pandang: 30 tur kota + 12
dalam ruangan/tanah (in-g01, in-aula, in-gym, in-lab, in-kantin, in-perpus, in-lobi, in-konser,
in-g04, tanah-plaza/cw/sekolah). Detektor yang sama dijalankan pada worktree `main` dan branch.

**Temuan & perbaikan**
- **Tanah koplanar dengan lantai GLB di y 0** (penyumbang terbesar: alas lapangan olahraga
  10.238 px dalam satu view, baki kapur & lantai kelas lobi sekolah 2.700 px, lantai lab, perpus,
  kantin, dek kolam, skate park, food court, jalan raya). Perbaikan: material tanah kode
  (`bahanRumput` + padang bertekstur) diberi `polygonOffset +1/+1` (`OFFSET_TANAH`), jadi apa pun
  yang koplanar dengan tanah selalu menang. Posisi geometri tidak berubah.
- **Near plane kamera 0,1** terlalu kecil: list/papan nama/kusen menempel di dinding berkedip
  dari jauh (papan konser dari plaza, kusen menara utara, list G01/G08). Near → 0,25 (2,5× lebih
  presisi di semua jarak). Kamera game tidak pernah < 0,25 m dari geometri.
- **Muka koplanar di dalam GLB**: `zfix.js` (detektor + pemecah 3D semua arah) di 55 GLB yang
  dipakai: 7.321 pasangan / 916 m² muka searah yang bertumpuk. Komponen yang lebih kecil
  (list, hiasan, panel) digeser 5 mm searah normalnya, berulang sampai < 0,3 m². Sisa: 4,3 m²
  (169 pasangan kecil, kebanyakan < 0,1 m²). Punggung-ke-punggung dan muka ganda internal satu
  material diabaikan (tidak terlihat). Mesh yang dipakai bersama node lain tidak disentuh.
- **"Fix paksa highp" & `?noshadow=1`**: `precision:'highp'` masih aktif di renderer, shadow bias
  +0,0001 / normalBias 0,03. Catatan lama benar: blink tetap ada walau bayangan mati, karena
  penyebabnya z-fighting (tiga butir di atas), bukan shadow acne. Tidak ada perubahan bayangan.
- Muka terbalik: audit raster 0 temuan (`mukaTerbalik: []`).

**Angka (piksel kedip, 960×540, sama persis sudut pandangnya)**

| Sudut pandang | main | branch |
|---|---:|---:|
| 01-plaza-g04 | 458 | 47 |
| 02-plaza-g03 | 223 | 56 |
| 03-plaza-g01 | 1032 | 38 |
| 04-plaza-g06g10 | 164 | 7 |
| 05-plaza-g09 | 621 | 57 |
| 06-plaza-g02g05 | 1085 | 75 |
| 07-pasar | 576 | 70 |
| 08-sungai-jembatan | 300 | 133 |
| 09-citywalk | 451 | 152 |
| 10-citywalk-barat | 102 | 20 |
| 11-utara | 259 | 93 |
| 12-menara-jam | 27 | 6 |
| 13-pantai | 406 | 71 |
| 14-mercu | 172 | 41 |
| 15-bukit | 176 | 34 |
| 16-dermaga | 108 | 56 |
| 17-padang | 267 | 104 |
| 18-danau | 253 | 31 |
| 19-sekolah | 71 | 23 |
| 20-sekolah2 | 551 | 16 |
| 21-hutan-rumah | 12 | 10 |
| 22-lapangan | 10566 | 33 |
| 23-kemah | 13 | 11 |
| 24-selatan-skate | 100 | 22 |
| 25-selatan-kolam | 227 | 55 |
| 26-selatan-konser | 219 | 144 |
| 27-selatan-food | 171 | 33 |
| 28-taman-bermain | 38 | 17 |
| 29-gunung | 2 | 2 |
| 30-pulau | 668 | 16 |
| in-g01 | 6 | 3 |
| in-aula | 778 | 674 |
| in-gym | 839 | 124 |
| in-lab | 0 | 0 |
| in-kantin | 610 | 312 |
| in-perpus | 225 | 33 |
| in-lobi | 2629 | 0 |
| in-konser | 470 | 206 |
| in-g04 | 212 | 36 |
| tanah-plaza | 721 | 117 |
| tanah-cw | 712 | 153 |
| tanah-sekolah | 175 | 7 |
| **Total 42 view** | **26695** | **3138** |

Sisa terbesar (branch): list emas & kursi aula (±560 px di view dalam aula, muka emas kecil
berbeda normal), kaca studio foto vs plester (154 px), sambungan pagar modul (143 px), meja
dapur kantin (75 px). Akan dikejar lagi bersama PR sungai.

**File**: `index.html` (OFFSET_TANAH, near kamera), 53 GLB yang ada (muka digeser 5 mm, nama file
tetap, lihat `zfix-log.txt`), `gedung-aula-v1e.glb`, `gedung-g04-blender-v5.glb`.

## 5. Verifikasi (headless Chromium, tanpa injeksi)

`verify.cjs` siang (`?jam=10`) dan malam (`?jam=21`): **14/14 OK** keduanya — muat, layar masuk,
masuk kota, jalan, duduk di bangku, jalan ke daratan selatan, collider otomatis, kamera masuk G01,
G04 tegak, **masuk aula s.d. panggung, kamera masuk aula, masuk G04, kamera masuk G04,
tanpa error JS**.

Vegetasi (seed 20261040): `DAFTAR_POHON` 90 dan `DAFTAR_PINUS` 289 **identik** dengan main.

Tidak disentuh: karakter, debug overlay, MQTT, `water.js`, cowok & G03 (parkir), sekolah v4,
lapangan olahraga, posisi kios/gerbang, lampu & bangku tepi jalan, Pohon Bingkai.
