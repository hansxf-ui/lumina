# PERBAIKAN SISA AUDIT — CATATAN KOORDINATOR (2026-11-09, malam)

Keputusan Vesper (delegasi pemilik "gas lanjutkan sesuai keputusan logis lu aja"):
R2 lapangan TETAP di Hutan Pinus (tanpa perubahan kode). R1 jembatan = GLB datar
baru (gated: render diperiksa Vesper dulu, belum di-install). R6 filter vegetasi
diperkuat. FPS didiagnosa + tuas terbesar diterapkan. Kamera diperbaiki.

## Deploy perbaikan kode (FPS + R6 + kamera) — LIVE

- Deployment: **dpl_G798X2ATBr5ogsxsKdbmfYmw14cC** — READY
- URL: https://kota-lumina-l2l7kjnb0-hansxf.vercel.app
- Alias: https://kota-lumina.vercel.app (utama), https://kota-lumina-hansxf.vercel.app
- Berkas: **76 file, 111,8 MB** (index.html + 69 GLB + 6 non-GLB; daftar dihitung
  ulang dari index.html baru; jembatan-sungai-blender-v1.glb TIDAK ikut — gated)
- MD5 live index.html = lokal = **3da65cd69fe04d4d7a9b00eac060bf6b** ✓
- Marker live: 20261040 2×, sederhanakanBatang 2×, ZONA_LARANG_VEG 7×,
  dorongKeluarTapak 4×, AUDIT 2026-11-09 26× ✓
- GLB karakter live TETAP (cewek b0d8f674…, cowok 0864d699… = lokal) ✓
- Link playtest: **https://kota-lumina.vercel.app/?fresh=20261109perbaikan1**
- Backup sebelum perubahan: index.html.bak-sebelum-perf-20261109 (MD5 ffcbc29e…);
  index.html.bak-audit-20261109 dipertahankan (MD5 0083845b…).

## 1. FPS — tuas: sederhanakan batang instanced jadi lathe 8-segi

- Diagnosis: audit/plan/DIAGNOSIS-FPS.md. Tangga kualitas hanya pixel ratio
  (PR mentok 1,0 tapi tetap 58 ms → bottleneck vertex/tri, bukan piksel).
  Penyumbang terbesar: batang pinus instanced ~1.074.000 tri (267 × 4.026)
  = 56% scene plaza 1,9 jt tri.
- Perbaikan: `sederhanakanBatang()` di `wujudkanInstansiGLB()` (index.html
  ~1217 + 1 baris pemanggil ~1245). Lathe 8-segi dari profil radius asli
  (radius maks per pita tinggi, diukur runtime); material batang tanpa tekstur
  jadi UV tak berpengaruh; bola pembatas zona tetap dari geometri asli.
- Verifikasi Node: `node --check` 3 blok LOLOS; harness /tmp/uji_lathe2.js
  (fungsi asli, Three r128): pinus 2.336v → lathe 144 tri (Y 0..3,00 +
  radius 0,880 utuh), pohon 560v → lathe 144 tri (Y 0..2,05 + radius 0,450
  utuh), guard geometri kecil <400v dikembalikan utuh. Hemat ~1.169.886 tri →
  plaza 1,9 jt → ~730 rb (−62%).
- ANGKA SEBELUM (browser 21:04): senja ~60 fps (tangga 1/5); plaza malam
  ~17 fps (58 ms, tangga 5/5, ~1,9 jt tri); pantai/air ~4 fps (233 ms,
  tangga 5/5). ANGKA SESUDAH: BELUM DIUKUR di browser — Vesper yang mengukur
  (readout DIAG: PR/tangga, ms, fps, calls, tri di titik yang sama, ?jam=21).
  Keyakinan diagnosis: plaza 75–85%, pantai ~40% (butuh A/B
  `laut.visible=false` / `?noshadow=1` — lihat DIAGNOSIS-FPS.md §5).
- Yang TIDAK disentuh: karakter, shader air (tuas sekunder, menunggu A/B),
  jumlah pinus (kerapatan hutan tidak berubah).

## 2. R6 — filter vegetasi tapak nyata (OBB + rect jalan/sungai)

- Usulan: audit/plan/USULAN-R6-KAMERA.md. Tabel `ZONA_LARANG_VEG` (23 OBB:
  pusat visual dari bbox.json + setengah-bentang lokal + ry + maxY) +
  `RECT_LARANG_VEG` (11 rect: jalan terukur probe.py + sungai + perkemahan),
  dicek `diZonaLarangVeg()` di 3 blok acakVeg() SESUDAH semua undian.
- Verifikasi (gerbang determinisme): replay-veg.mjs di-port + dijalankan →
  kota 30/30, padang 76/76, hutan 254/254, awan 9/9; diff vs
  replay-veg-bersih.json: kota 1,78e-15, padang 0, hutan 3,55e-15, awan 0 →
  IDENTIK. scan-seed.py (port R6) → validasi port 20261040: kota/padang/
  hutan/awan-y True; pelanggaran uji segitiga ketat: **0**. Seed 20261040
  TETAP; baseline tidak diubah.
- Catatan jujur: replay-veg.mjs masih mencetak "PELANGGARAN: 9" — itu 9
  artefak validasi AABB-nya (5 bangunan false positive yang sudah dibuktikan
  laporan R6 §B.1 + 1 sungai + 2 jalan E-W + 1 lampu), SAMA PERSIS dengan
  sebelum R6 (posisi tidak berubah). Otoritasnya uji segitiga (0).
- Jendela gelap lantai dasar di malam hari: TIDAK diperbaiki (tidak simpel
  tanpa risiko; dicatat sebagai sisa).

## 3. Kamera — keep-out tapak nyata

- Perbaikan: `dorongKeluarTapak()` (OBB yang sama, hanya bila di bawah atap),
  dipanggil untuk camTarget 2× sesudah S1 + untuk camera.position sesudah
  lerp. Jarak/tinggi/sudut default TIDAK diubah.
- Verifikasi Node: `node --check` LOLOS; harness /tmp/uji_kamera.js (fungsi
  asli, Three r128) 6/6: G09 camTarget (24,3.08,−33) didorong 1,75 m keluar
  (y tetap 3,08); G04 dalam didorong 3,50 m; di atas atap / plaza terbuka /
  luar G09 TIDAK didorong; Kopi Senja dalam didorong 5,99 m.
- Risiko jujur: kamera bisa "melompat" sisi saat orbit melewati garis tengah
  OBB (dilembutkan lerp 6/detik); cakupan hanya 23 tapak (sekolah/konser/
  rumah tidak tercakup — tambah baris tabel bila ada laporan).
- Temuan samping (TIDAK diperbaiki, di luar tugas): pemain bisa jalan
  menembus visual G04 (kollider lingkaran di (−15,37.4) r 4,5 berjarak 9,67 m
  dari tapak visual); kamera menu/orbit r 17 m menembus visual G04.

## 4. Jembatan (R1) — SELESAI DIBANGUN + terverifikasi, MENUNGGU vonis Vesper (BELUM di-deploy)

- GLB: ~/workspace/lumina/jembatan-sungai-blender-v1.glb — **163.132 byte
  (159,3 KB)**, MD5 **37e1b168eeaad68959a5af140533813c**. Valid glTF: 1 mesh
  (objek `JembatanSungai`, mesh-data `Cube` — kosmetik), 10 material ter-embed,
  0 tekstur eksternal.
- Dimensi (re-import Blender, diverifikasi koordinator secara independen):
  deck **22 × 16 m**, permukaan atas **Z ≈ −0,05** (96 verts di −0,05 +
  96 di −0,04 — lapis aus/marka); footprint X ±15,50 (deck + abutmen),
  Y ±8,80, Z −2,40..+3,00; origin (0,0,0) = tengah deck; 4.344 verts /
  2.580 tris. **0 verts penghalang di jalur pemain (0<Z<2, tengah)** —
  pemain jalan di y≈0 tanpa tabrakan. Pagar rel atas Z ≈ 1,08 di tepi
  Y = ±7,7; 4 lampu (X=±7, kedua sisi), puncak Z = 3,0.
- Isi: deck aspal + lapis aus + marka tengah kuning putus-putus + garis tepi
  putih, balok tepi beton (puncak +0,30) + lis, pagar (13 tiang/sisi + rel
  atas/tengah + panel bawah), 4 lampu hias, abutmen batu 3 undakan tiap ujung
  (turun ke Z −2,40) + dinding sayap.
- Render (Cycles 1280×720, dibaca koordinator satu per satu — BUKAN percaya
  laporan builder saja), di audit/plan/verifikasi-jembatan/:
  - jembatan_depan.png — dari jalan setinggi mata: deck datar, marka kuning,
    balok tepi + pagar kedua sisi, 2 lampu menyala. BAGUS.
  - jembatan_atas_jalan.png — dari atas: seluruh deck + marka + pagar +
    4 lampu + bayangan, abutmen kedua ujung menyambung ke bank, air biru di
    sekeliling. BAGUS — bukti paling jelas.
  - jembatan_34.png — 3/4 udara: deck + pagar + lampu + air + bank, semua
    terbaca. BAGUS.
  - jembatan_samping.png — profil datar, pagar + 4 lampu terbaca. ADA pita
    hitam di bawah deck (bayangan kolong — realistis, tapi abutmen tidak
    terbaca dari sudut ini).
  - jembatan_abutmen.png — close-up ujung timur: undakan batu turun dari deck
    ke tepi. TERBUKTI ada; undakan ke-3 tersembunyi di balik tanah tepi
    (wajar — tertanam di bank).
- Penilaian jujur koordinator: jembatan LAYAK INSTAL — deck benar-benar datar,
  tidak ada geometri di tengah jalan di atas y=0, pagar hanya di tepi, marka +
  balok tepi memberi kesan jalan sungguhan, lampu rapi, abutmen menyambung
  deck ke tepi, file ringan. Kekurangan (kosmetik, sebagian besar efek
  lighting Cycles — di Three.js akan tampak beda): (1) warna batu abutmen
  putih terang, hampir sama dengan beton balok tepi — kontras batu vs beton
  lemah (perbaiki: gelapkan material `BatuAbutmen` + rebuild ±5 menit, bila
  Vesper minta); (2) aspal abu-biru terang di render (matahari + world Cycles
  terang; di game akan lebih gelap); (3) kolong dari samping murni tetap
  gelap (bayangan) — abutmen dari sudut itu tidak terbaca.
- **Loader TIDAK ditambahkan** (gated — menunggu Vesper memeriksa render di
  atas). Setelah vonis Vesper: tambah loader di (45,−2) tanpa offset, lalu
  deploy ulang + verifikasi live. File kerja builder:
  audit/plan/verifikasi-jembatan/ (build_jembatan.py, render_jembatan.py,
  render_jembatan_fix.py, render_abutmen.py, verify_jembatan.py,
  verify_jembatan2.py, jembatan.blend, jembatan_render.blend + 5 PNG).

## 5. R2 lapangan — tanpa perubahan (keputusan)

- Lapangan tetap di Hutan Pinus (190,−45). Tidak ada perubahan kode.

## 6. Jembatan (R1) — DI-INSTALL + LIVE (ronde jembatan, 2026-11-09 malam)

- Vonis Vesper: render jembatan LAYAK INSTAL → loader dipasang + deploy.
- Deployment: **dpl_FqM22CR5aKtarFB12HfZBpZ4Fdyt** — READY
- URL: https://kota-lumina-4etqetxqw-hansxf.vercel.app
- Alias: https://kota-lumina.vercel.app (utama), https://kota-lumina-hansxf.vercel.app
- Berkas: **77 file, 111,9 MB** (index.html + 70 GLB + 6 non-GLB; daftar dihitung ulang
  dari index.html baru — jembatan-sungai-blender-v1.glb IKUT).
- MD5 live index.html = lokal = **950c8cba8b4c7f1416d02d9d50a2b9e9** (8.429 baris) ✓
- Marker live: jembatan-sungai-blender-v1.glb 1×, pasangJembatanSungaiGLB 1×,
  dorongKeluarTapak 5×, komentar G04 1×, `d2 <= 0.0001` 1× ✓
- GLB jembatan live: HTTP 200, 163.132 byte, MD5 **37e1b168eeaad68959a5af140533813c** = lokal ✓
- GLB karakter live TETAP (cewek b0d8f674…, cowok 0864d699…) ✓
- Link playtest: **https://kota-lumina.vercel.app/?fresh=20261109jembatan1**
- Backup sebelum perubahan: index.html.bak-sebelum-jembatan-20261109 (MD5 3da65cd6…);
  index.html.bak-audit-20261109 dipertahankan (MD5 0083845b…).

### 6.1 Loader jembatan — `pasangJembatanSungaiGLB()` (sesudah `pasangJembatanBatuGLB`)

- `jembatan-sungai-blender-v1.glb` di (45,−2), TANPA offset (origin = tengah deck).
- Pola loader sama dengan jembatan batu (timeout 180 dtk, traverse castShadow/
  receiveShadow). TIDAK ada wiring `LampGlow` — GLB 1 mesh (JembatanSungai),
  tidak ada node lampu terpisah; material `LampuNyala` sudah emissive
  [1, 0.75, 0.4] sendiri. TIDAK dipasang collider (tinggiTanah di sana 0;
  pemain jalan di atas deck y ~ −0,05).
- Tampilan akhir jembatan di Three.js BELUM terbukti — tugas verifikasi browser Vesper.

### 6.2 Kollider pemain G04 — 3 lingkaran pola toko (sesudah blok pohon kota)

- Lingkaran lama (−15,37.4) r 4,5 berjarak 9,67 m dari tapak visual → pemain bisa
  jalan menembus badan visual G04 (pusat visual (−7,20;17,89), slab 6,4×18,8 m,
  ry 5,903). Diganti 3 lingkaran r 4,5 di offset −6/0/+6 sepanjang sumbu panjang
  lokal Z (arah dunia (sin ry, cos ry)); pusat lingkaran (−4.97,12.32),
  (−7.20,17.89), (−9.43,23.46). Sudut tapak terjauh 4,68 m < r+0,55 = 5,05.
- DITARUH sesudah snapshot `terlarang = penabrak.slice()` blok pohon kota
  (baris 1874 → push 1925), BUKAN di loop gedung: lingkaran ini TIDAK boleh
  masuk snapshot pohon — pohon hidup (−8,53;28,10) berjarak 5,15 m dari
  lingkaran ujung < r+1,6 = 6,1 dan akan gugur + menggeser aliran RNG.
  Gerbang replay R6: kota 30/30, padang 76/76, hutan 254/254, awan 9/9,
  posisi byte-identik vs replay-veg-bersih.json ✓ (9 "pelanggaran" AABB
  yang tercetak = artefak lama yang sudah diadjudikasi, sama persis).
- Lingkaran lama (−15,37.4) DIBIARKAN (sudah masuk snapshot pohon; mencabutnya
  juga menggeser pohon) — memblokir petak plaza kosong, kondisi lama.
- Harness /tmp/uji_jembatan_g04.js (fungsi + tabel ASLI diekstrak dari
  index.html; loop dorong pemain diekstrak verbatim): **48/48 LOLOS**.
  Teleport titik batas (4 sudut + 4 tengah sisi + 3 pusat lingkaran + 10 grid)
  semua tertolak ke jarak 5,05 m; jalan masuk dari 8 arah (langkah 0,05 m)
  tidak pernah masuk OBB; 8 titik jalan/plaza di luar tapak tidak bergeser.

### 6.3 Perbaikan loop dorong pemain (temuan harness — bug laten)

- Harness ronde 1 (sebelum perbaikan) menemukan: pemain TEPAT di pusat
  lingkaran (d2~0) TIDAK didorong sama sekali (guard `d2>0.0001` menghindari
  bagi-nol) → terjebak di pusat selamanya. Perbaikan: bila d2 ≤ 0.0001,
  dorong ke titik batas arah +x (deterministik). Hanya berpengaruh <1 cm
  dari pusat (mustahil sambil jalan; hanya teleport/spawn). Aman.
- Catatan jujur: titik PERSIS di sumbu simetri dalam tapak (teleport ke lokal
  (0,±3)) masih osilasi — dorongan radial dua lingkaran yang tumpang tindih
  sama besar berlawanan arah. Sifat push-out radial (sudah ada sebelum ronde
  ini), BUKAN regresi: jalan masuk dari 8 arah membuktikan titik-titik itu
  tidak tercapai sambil jalan; dengan gangguan 0,05 m langsung tertolak.

### 6.4 Kamera orbit layar masuk — 1 baris `dorongKeluarTapak(camTarget)`

- Sesudah `camTarget.set(Math.sin(a) * 17, 6.2, Math.cos(a) * 17)` di cabang
  `!sudahMasuk` perbaruiKamera. Harness orbit (1.257 sampel putaran penuh):
  83 sampel (6,6% busur) didorong, maks 3,50 m, TIDAK PERNAH di dalam OBB
  sesudah dorong; orbit di plaza terbuka tidak berubah.
- Risiko jujur: dorongan maks 3,50 m bisa terlihat melompat di layar masuk
  (dilembutkan lerp 2/detik) — Vesper playtest; bila mengganggu, baris ini
  di-revert.

### 6.5 Yang TIDAK disentuh

- Karakter (kode + GLB cewek/cowok). v24 TIDAK di-deploy. Tidak ada file GLB
  yang dihapus dari disk. Debug overlay dipertahankan. Vegetasi tidak berubah
  (seed 20261040, replay byte-identik).

## 7. Ronde marka + kamera (KAMERA-MARKA) — LIVE 2026-11-10 ~06:00

- Deployment: **dpl_u5H4jvpCDetAw3zRt1Stafv483gL** — READY
- URL: https://kota-lumina-2qd1qb1um-hansxf.vercel.app
- Alias: https://kota-lumina.vercel.app (utama), https://kota-lumina-hansxf.vercel.app
- Berkas: **77 file, 111,9 MB** (index.html + 70 GLB + 6 non-GLB; daftar dihitung
  ulang dari referensi index.html; jembatan-sungai-blender-v1.glb IKUT, versi baru).
- MD5 live index.html = lokal = **ee5589188183bd8f329988fec44fa105** (8.477 baris) ✓
- Marker live: ZONA_LARANG_KAMERA 5×, ZONA_LARANG_VEG 8×, dorongKeluarTapak 7×,
  KAMERA-MARKA 2×, jembatan-sungai-blender-v1.glb 1×, 20261040 3× ✓
- GLB jembatan live: HTTP 200, 163.284 byte, MD5 **61b8ba57abf4a36effb0ead66b821068** = lokal ✓
- GLB karakter live TETAP (cewek b0d8f674…, cowok 0864d699…) ✓
- Link playtest: **https://kota-lumina.vercel.app/?fresh=20261110marka1**
- Backup sebelum perubahan: index.html.bak-sebelum-kamera-marka-20261110 (MD5 950c8cba…);
  index.html.bak-sebelum-jembatan-20261109 dipertahankan (MD5 3da65cd6…).

### 7.1 Marka jembatan emissive — DIPERBAIKI + terverifikasi

- `jembatan.blend` → `jembatan_emissive.blend` (skrip edit_marka_emissive.py):
  MarkaKuning Emission [0.85, 0.65, 0.10] × 0.6; MarkaPutih [0.92, 0.92, 0.88] × 0.3.
- GLB baru (nama file sama): MD5 **61b8ba57…**, 163.284 byte (+152).
  JSON: MarkaKuning emissiveFactor **[0.51, 0.39, 0.06]**; MarkaPutih **[0.276, 0.276, 0.264]**
  (exporter memanggang strength <1 ke emissiveFactor); material lain tidak berubah;
  LampuNyala tetap [1, 0.75, 0.4] + emissiveStrength 2. Geometri identik
  (1 mesh, 10 primitive, 4.344 verts / 2.580 tris, deck 22×16 m, atas Z −0,045).
- Render malam (Cycles, world gelap): audit/plan/verifikasi-jembatan/jembatan_malam_marka.png
  — 6 dash kuning hangat terbaca jelas di atas deck nyaris hitam, garis tepi putih
  kelihatan, tidak menyilaukan. Framing rapat (hanya sebagian deck) — bukti sah.
- Tampilan akhir di Three.js BELUM terbukti — tugas verifikasi browser Vesper.

### 7.2 Kamera titik sempit — TEMUAN JUJUR: BUKAN OBB yang hilang

- Identifikasi (bbox.json + GLB per-mesh + loader): (a) G05 Rose Boutique (putih,
  (9,85; 32,42), ry 0,180) + G02 Bakery (bata merah, (14,75; 19,66), ry 3,785);
  (b) G09 Toko Buku (primer, (20,71; −27,53), ry 2,504) + Toko Es Krim (sekunder,
  (16,64; −44,00), ry −1,571); (c) G02 Bakery. **Semua SUDAH ada di ZONA_LARANG_VEG.**
  (b): pemain (18,48; −32,72) 5,92 m dari pusat kollider G09 — tepat di tepi lingkaran
  (r+0,55 = 5,90); ray-cast segitiga: titik itu di dalam material dinding G09.
- Perubahan kode: tabel baru **ZONA_LARANG_KAMERA** (salinan VERBATIM 23/23 nilai
  ZONA_LARANG_VEG — TIDAK ADA baris baru, TIDAK ADA koreksi nilai; audit tapak nyata:
  under-cover maks 0,013 m, murni pembulatan); dorongKeluarTapak() dialihkan ke
  tabel kamera; logika dorong TIDAK diubah; **ZONA_LARANG_VEG TIDAK berubah**.
- Harness audit/plan/uji-kamera-marka.cjs (fungsi+tabel verbatim dari index.html,
  Three r128): **43 LULUS / 0 GAGAL, exit 0** — diverifikasi ulang koordinator.
  Sesudah dorong, camTarget + camera.position di luar dinding di semua sektor yaw
  (540/540 sampel, DINDING=[]). Orbit layar masuk identik (360 titik: 23 didorong
  di tabel lama maupun baru, selisih dorong maks 0,000 m).
- **TAPI: insiden (a)/(b)/(c) TIDAK diperbaiki ronde ini.** Sapuan yaw penuh:
  LOS terhalang sesudah dorong (a) 109/180, (b) 180/180, (c) 81/180 — padahal
  0 sampel tersisa di dalam dinding. Dua mekanisme: **M1** dorongan ke sisi jauh
  (gedung tetap di antara kamera dan pemain); **M2** sudut bangunan memotong garis
  pandang (kamera sudah di luar OBB tapi garis kamera→pemain tertembus sudut,
  mis. (c) yaw 0: kamera (10,00; 26,00) tidak didorong sama sekali tapi LOS menembus
  sudut G02). Dorongan >3,5 m dilaporkan jujur: maks 4,75 m (sapuan yaw (b)),
  4,42 m (a), 4,19 m (b yaw 0), 4,17 m (a yaw 140) — perilaku tabel lama juga.
- Gerbang replay R6: kota 30/30, padang 76/76, hutan 254/254, awan 9/9;
  367/369 posisi bit-identik vs replay-veg-bersih.json; 2 posisi selisih ≤3,55e-15 m
  (noise libm, replay tidak membaca index.html). PELANGGARAN: 9 = artefak AABB lama.
  node --check 3/3 LOLOS.
- Temuan samping: OBB G10 ↔ Kopi Senja BERTUMPUK (586 titik margin 0,3; 173 titik
  margin 0, sekitar (−13,5; −38,2)) — titik di zona tumpuk ping-pong antar OBB,
  mendarat tetap di dalam keduanya sesudah 2× dorong (dinding kosong — audit
  segitiga 0 — kamera hanya "melompat" di udara terbuka). G04 strip selatan 12 m
  kosong di bawah y 4,5 m (OBB VEG meng-cover ruang kosong; kamera kena dorongan
  palsu). bbox.json AABB ~0,05–0,45 m lebih besar dari GLB saat ini (utang data audit).
- **Tindak lanjut yang diusulkan (Tugas 3):** (1) dorong sadar-pemain — oper posisi
  pemain ke dorongKeluarTapak(), pilih sisi yang menghadap pemain (bukan sisi
  terdekat); (2) dolly-in sadar-garis-pandang — raycast pemain→kamera terhadap OBB,
  pendekkan camJarak efektif sampai garis bersih. Gerbang: playtest browser di
  ketiga titik. JANGAN umumkan insiden (a)/(b)/(c) sebagai "diperbaiki".

### 7.3 Yang TIDAK disentuh

- Karakter (kode + GLB cewek/cowok). v24 TIDAK di-deploy. Tidak ada file GLB
  yang dihapus dari disk. Debug overlay dipertahankan. Vegetasi tidak berubah
  (seed 20261040, replay lolos).

## 8. TUGAS 3 — PERBAIKAN LOS KAMERA (dolly-in + dorong sadar-pemain) — DEPLOY 2026-11-10

- **Deploy:** `dpl_9NoswtBTLcsCVot4q5eMTMj2xkvR` — READY; URL
  https://kota-lumina-ejrnbtrlv-hansxf.vercel.app; alias kota-lumina.vercel.app
  (utama), kota-lumina-hansxf.vercel.app. **77 file, 111,9 MB** (index.html +
  70 GLB + 6 non-GLB; daftar dihitung ulang dari index.html — komentar
  dihapus dulu supaya GLB yang hanya disebut di komentar tidak ikut; berkas
  dengan query string `?v=1` ikut terhitung).
- **MD5 live index.html = lokal = `5dec5117a41a8e3c9fae32981a89602e`** (8.570
  baris) ✓. Marker live: `jarakDollyBersih` 2×, `camJarakEfektif` 7×,
  `ZONA_LARANG_KAMERA` 8×, `20261040` 3×, `LOS` 2×, `dorongKeluarTapak` 7×.
- **GLB karakter live TIDAK BERUBAH** (cewek `b0d8f674…`, cowok `0864d699…`,
  jembatan `61b8ba57…`) ✓.
- **Playtest:** https://kota-lumina.vercel.app/?fresh=20261110los1
- **Backup sebelum deploy:** `index.html.bak-sebelum-los2-20261110` (MD5
  `5dec5117…` — sama dengan hasil akhir; backup dibuat sesudah edit terakhir,
  jadi isinya = build LOS ini, BUKAN build KAMERA-MARKA).
  Backup KAMERA-MARKA tetap: `index.html.bak-sebelum-los-20261110` (MD5
  `ee558918…`).

### 8.1 Mekanisme (index.html saja; ZONA_LARANG_VEG TIDAK disentuh)

1. **`dorongKeluarTapak(v, px, pz)` — dorong sadar-pemain (M1).** Parameter
   pemain opsional; bila diberikan, dari 4 kandidat keluar dipilih yang
   titiknya paling dekat ke pemain (bukan penetrasi terkecil). Bila tidak
   diberikan (orbit layar masuk), logika lama dipertahankan.
2. **`jarakDollyBersih(px, py, pz, tx, ty, tz)` — raycast 3D OBB.** Slab 2D XZ
   + cek atap (tRoof; OBB yang atapnya di bawah mata tidak menghalangi).
   Mengembalikan jarak bersih maksimum sepanjang sinar; OBB yang memuat
   mata pemain DI-LEWATI (dorong sadar-pemain sudah menempatkan kamera di
   sisi pemain, jadi OBB itu positif palsu dari strip margin). Kembalikan
   jarak penuh bila bersih.
3. **Dolly-in di `perbaruiKamera` (cabang dalam game).** Sesudah S1 2× +
   `dorongKeluarTapak(camTarget, px, pz)` 2×: hitung jarak bersih; bila
   terhalang, target = min(d0, dBersih − 0,3); `camJarakEfektif` di-lerp ke
   target (masuk cepat 8/dtk, keluar lambat 2/dtk); minimum **2,0 m**;
   camTarget diskalakan ke arah mata; ground clamp diterapkan ulang.
   Orbit layar masuk TIDAK berubah (tanpa pemain, tanpa dolly-in).
4. **Bug margin yang ditemukan + diperbaiki saat verifikasi:** versi pertama
   selalu mengurangi 0,3 m bahkan tanpa penghalang (`min(d0, dBersih − 0,3)`)
   → kamera selalu tertarik 0,3 m, bahkan di plaza terbuka. Diperbaiki:
   margin hanya bila `dBersih < d0`.

### 8.2 Harness Node (`audit/plan/uji-kamera-los.cjs`)

Fungsi asli dari index.html hasil edit (ekstraksi verbatim + `ZONA_LARANG_KAMERA`
verbatim; VEG identik backup; KAMERA verbatim). Simulasi pipeline per-frame
penuh (camTarget → ground clamp → S1 2× → dorong 2× → dolly-in + lerp 6/dtk →
dorong camera.position 1×), 240 frame @ dt=1/60 per sektor yaw, 180 sektor
per titik. `node --check` 3/3 LOLOS.

| Titik | LOS terhalang camPos — sebelum (KAMERA-MARKA) | LOS terhalang camPos — sesudah | Kamera di luar dinding | camTarget di luar dinding |
|---|---|---|---|---|
| (a) gang G02–G05 | 109/180 | **0/180 ✓** | 180/180 ✓ | 180/180 ✓ |
| (b) City Walk / G09 | 180/180 | **180/180 ✗** | 180/180 ✓ | 180/180 ✓ |
| (c) tenggara plaza | 81/180 | **40/180** (membaik, belum 0) | 180/180 ✓ | 168/180 (12 di dalam) |

- **Jarak dolly-in maks: 6,40 m** (di semua titik). Jarak kamera minimum:
  (a) 1,94 m; (b) 0,82 m; (c) 0,52 m. Sektor di jarak minimum: (a) 5/180,
  (b) 13/180, (c) 10/180. Konvergensi paling lambat (a): 28 frame (~0,47 dtk).
- **Regresi orbit layar masuk: LOLOS** — 360 titik: didorong LAMA 23 (maks
  3,48 m), BARU 23 (maks 3,48 m); 0 titik berubah; selisih maks 0,000 m.
- **Kontrol plaza terbuka: LOLOS** — jarak horizontal tetap 8,02 m,
  camJarakEfektif 8,14 m (= jarak 3D mata→target tanpa dolly-in), LOS bersih.
- **Gerbang replay R6: LOLOS** — kota 30/30, padang 76/76, hutan 254/254,
  awan 9/9; 367/369 posisi bit-identik vs replay-veg-bersih.json; 2 posisi
  selisih 1,78e-15 / 3,55e-15 m (noise libm, sama seperti ronde sebelumnya).
  PELANGGARAN: 9 = artefak AABB lama yang sama.

### 8.3 Penilaian jujur — insiden (a)/(b)/(c) TIDAK semuanya diperbaiki

- **(a) DIPERBAIKI.** LOS terhalang 109/180 → **0/180**. Gang selatan plaza
  kini bersih di semua arah yaw.
- **(b) TIDAK DIPERBAIKI — dan tidak bisa diperbaiki oleh kerja kamera.**
  Pemain (18,47; −32,72) berada **DI DALAM dinding G09** (0,52 m di dalam
  muka +x; jarak dinding 0,00 m di semua 180 sektor). LOS mustahil bersih
  karena pemainnya sendiri di dalam tembok. Yang membaik: kamera kini di
  luar dinding (180/180) dan sedekat 0,82 m dari pemain — insiden "kamera
  TERKUNCI di dalam/di balik dinding" sebagai posisi kamera sudah tidak ada,
  tapi pandangan tetap terhalang karena pemain di dalam dinding. Mekanisme
  yang tersisa: **lingkaran penabrak pemain G09 (S1 r 5,35) terlalu kecil**
  dibanding setengah-diagonal bangunan 9,48 m — pemain bisa masuk ke dalam
  dinding. Perlu perbaikan penabrak pemain (di luar lingkup Tugas 3).
- **(c) MEMBAIK tapi TIDAK TUNTAS.** LOS terhalang 81/180 → **40/180**.
  Sektor yang tersisa (yaw 0–20, 106–122, 322–358) adalah arah-arah di mana
  dinding G02 berada **< 2,0 m dari pemain** (pemain berdiri 0,47–0,6 m dari
  muka dinding; di yaw 0 dinding hanya 0,6 m; di yaw 106 dinding 1,32 m).
  Tidak ada dolly-in dengan minimum yang wajar yang bisa membersihkannya —
  kamera harus berada dalam 0,6 m dari pemain, itu "menempel ke kepala".
  Menurunkan minimum di bawah 2,0 m pun tidak mencapai 0/180 (di yaw 0
  dinding 0,6 m < minimum berapa pun yang wajar). Mekanisme yang tersisa:
  **pemain terlalu dekat dengan dinding** (kasus ekstrem "menempel tembok");
  perbaikan yang mungkin di masa depan adalah reposisi kamera ke sisi
  pemain bila LOS tetap terhalang sesudah dolly-in (mekanisme ketiga, di
  luar pendekatan yang ditetapkan tugas ini) — atau penabrak pemain yang
  mencegah pemain sedekat itu ke dinding.
- **Catatan camTarget di dalam dinding (c) 12/180 sektor** (yaw 48–62,
  82–100): penskalaan dolly-in bisa mendaratkan target di dalam dinding
  G02 (raycast melewati OBB yang memuat mata pemain). Kamera yang dirender
  (camera.position) tetap bersih di sektor-sektor itu (LOS bersih, di luar
  dinding) karena dorong camera.position mengeluarkannya — jadi ini cacat
  kosmetik pada target, bukan pada gambar. Dicoba diperbaiki dengan dorong
  pasca-dolly-in pada camTarget: camTarget bersih 0/180, TAPI LOS
  camera.position di (c) memburuk 40 → 43/180 — jadi perubahan itu
  **DI-REVERT** (metrik yang dirasakan pemain lebih penting dari cacat
  target yang tidak terlihat).

### 8.4 Yang TIDAK disentuh

- Karakter (kode + GLB cewek/cowok). v24 TIDAK di-deploy. Tidak ada file GLB
  yang dihapus dari disk. Debug overlay dipertahankan. Tabel vegetasi
  (`ZONA_LARANG_VEG`, seed 20261040) TIDAK disentuh — gerbang replay R6 lolos.
  Tidak ada baris OBB halo/wedge baru. Perilaku plaza terbuka + orbit layar
  masuk identik.

## 9. TUGAS 4 — PENABRAK PEMAIN BERBASIS OBB + AUDIT TEMBOK TAK TERLIHAT — DEPLOY 2026-11-10

**Perintah pemilik 06:33** ("Gas, benerin penabrak pemain") + **perluasan 06:34**
("Banyak tembok tak terlihat jir, benerin" — audit SEMUA penabrak vs geometri
terlihat). Deploy `dpl_8vXuxAMW6k79AiyHv438ZDSLzRjw`, live MD5
`ca35c2e03ac79bc0e514f6a787aa5d85` = lokal (8.664 baris), 77 file / 111,9 MB,
link playtest https://kota-lumina.vercel.app/?fresh=20261110pemain1.
Backup: `index.html.bak-sebelum-pemain-20261110` (MD5 `5dec5117…` = build LOS).

### 9.1 Mekanisme: penabrak OBB pemain + margin 1,5 m

- Tabel baru **`ZONA_LARANG_PEMAIN` (21 baris)** — OBB tapak nyata (pusat
  visual dari bbox.json / ukur GLB per-mesh), format `[cx, cz, hx, hz, ry, maxY]`:
  G02–G10 + Menara Jam (10 baris dari tabel kamera), 3 rumah warga
  (Modern/Tradisional/Cottage — sebelumnya TANPA collider sama sekali),
  6 Menara Utara (dimensi dari **kotak kode**, bukan GLB — pengukuran GLB
  terkontaminasi kubus tanah Hunyuan), Food Court (65,200), air Kolam (30,155).
  G01 TIDAK ADA (enterable — rantai lingkaran), 8 toko City Walk TIDAK ADA
  (pola 3-lingkaran sudah benar; kanopi di atas kepala boleh dilewati),
  Gerbang Pasar TIDAK ADA (boleh dilewati).
- Fungsi baru **`dorongPemainKeluarTapak(v)`** — dorong pemain keluar OBB +
  margin; sisi penetrasi terkecil (benar untuk mendorong pemain KELUAR);
  tanpa cek maxY (pemain selalu di tanah); tanpa pilihan sisi sadar-pemain.
- Fungsi baru **`dorongPemainSemua(v)`** — lingkaran (kecuali `tanpaPemain`)
  + OBB, iterasi maks 3 pass (lingkaran → OBB) sampai konvergen; dipanggil
  `perbaruiPemain` menggantikan forEach lingkaran lama (logika pusat-lingkaran
  d2~0 dipertahankan verbatim di dalamnya).
- **Margin 1,5 m (BUKAN 1,0 m seperti target awal)** — eksperimen membuktikan
  1,0 m menyisakan 1/180 sektor LOS terhalang di (b) (yaw 232°: kamera
  terjepit di tepi OBB Es Krim, garis pandang menyentuh sudut G09);
  1,5 m membersihkan (b) sepenuhnya (camPos 0/180 DAN camTarget 0/180) dan
  TIDAK mengunci gerakan (gang G02–G05 masih lega 2,24 m; koridor City Walk
  pakai lingkaran, bukan OBB — tidak terpengaruh). Jarak kamera minimum di
  (b)/(c) naik 0,70 m → 1,20 m (kamera tidak lagi "menempel ke kepala").

### 9.2 Audit tembok tak terlihat — daftar lengkap

| # | Penabrak | Temuan | Perbaikan |
|---|---|---|---|
| 1 | G09 ring r 5,35 vs ½-diag 9,48 m | Pemain bisa masuk sudut/dinding (insiden (b)) | OBB pemain G09 (margin 1,5 m) |
| 2 | G02 ring r 4,65 vs ½-diag 6,49 m | Pemain menempel 0,47–0,6 m ke dinding (insiden (c)) | OBB pemain G02 |
| 3 | G03/G05/G06/G07/G08/G10/Menara Jam | Lingkaran lebih kecil dari ½-diag (overhang 0,53–4,33 m) | OBB pemain masing-masing |
| 4 | G01 ring r 3,95 | **Menutup pintu toko enterable** (pintu 2,99 m dari pusat < 4,50 m jangkau lingkaran) — fitur "lolos" pemilik 31 Okt tidak pernah bisa dipakai | **DIHAPUS** (replay R6: pohon tidak bergeser, maxDiff 1,8e-15 m) |
| 5 | G04 lama (−15,37.4) r 4,5 | Memblokir petak plaza kosong, 9,67 m dari tapak visual | **Bendera `tanpaPemain`** (dilewati dorong pemain saja). Pencabutan penuh DITOLAK oleh replay: menggeser 2 pohon kota s.d. 9,04 m |
| 6 | Rantai Gedung Konser (0,180) | Posisi PRA-AUDIT; GLB di (30,204) tanpa collider; pola TERBALIK (pintu selatan, panggung utara) vs GLB (pintu utara, panggung selatan) | Dipindah ke (30,203.2), hw 12,85 hd 19,65; celah pintu UTARA x[26.76,33.24]; panggung diblokir di SELATAN x[21.90,38.10] z[213.94,221.50] |
| 7 | Pagar Skatepark (−60,180) | Posisi PRA-AUDIT; GLB di (−60,155) tanpa pagar | Dipindah ke (−60,155) |
| 8 | Pagar Taman Bunga (60,180) | Posisi PRA-AUDIT; GLB di (65,155) tanpa pagar | Dipindah ke (65,155) |
| 9 | 3 rumah warga | TANPA collider — pemain jalan menembus dinding | OBB pemain (dinding saja, taman/pagar tidak) |
| 10 | Food Court (65,200) | TANPA collider | OBB pemain [65,200.40,9.66,6.06,0,3.41] |
| 11 | Kolam (30,155) | TANPA collider — pemain jalan di atas air | OBB pemain air [30.85,157.60,11.80,5.55,0,1.0] (pagar tidak — lokasi gerbang tak pasti) |
| 12 | Mercusuar r 1,9 → 2,31; Gudang Peternakan r 4,4 → 5,0; Tenda Hijau r 2,0 → 3,29; Gerobak Es Krim r 1,1 → 1,31 | Lingkaran lebih kecil dari ½-diagonal tapak | Diperbesar ke ½-diagonal |
| 13 | Menara Utara 1–6 (r 5,2/5,7) | Overhang 0,8–2,9 m vs tapak kode | OBB pemain dari kotak kode |
| — | 8 toko City Walk (3-lingkaran) | Benar (penetrasi sudut 0,00 m) | TIDAK disentuh |
| — | Danau | Sudah dicegah `dalamArea` (veto elips + dermaga) | TIDAK disentuh |
| — | Taman bermain (−60,200), Gerbang Pasar | Tanpa collider (peralatan tersebar / tiang tipis) | SENGAJA DIBIARKAN — celah kecil, dicatat |

### 9.3 Harness (`audit/plan/uji-pemain-tugas4.cjs`) — SEMUA GERBANG LULUS

Fungsi + tabel diekstrak VERBATIM dari index.html hasil edit; penabrak
harness = rekonstruksi setia (516 lingkaran). `node --check` 3/3 blok script
+ harness OK. `ZONA_LARANG_VEG` identik backup (tidak disentuh).

- **(1) Jalan masuk 8 arah G09 + G02** (langkah 0,1 m): jarak min ke tapak
  **1,50 m** di keduanya, **0 langkah di dalam tapak**. Sebelum: pemain bisa
  masuk 0,51 m (G09) / 0,22 m (G02) ke dalam dinding.
- **(2) Teleport (b) (18.47,−32.72)**: −0,51 m (di dalam dinding) →
  (16.85,−33.92) **+1,50 m**. **(3) Teleport (c) (10,17.6)**: −0,22 m →
  (8.97,16.22) **+1,50 m**.
- **(4) Regresi gerakan** (jalan rakus 7 arah): plaza E-W 0,47 m; jalan E-W
  pasar 0,50 m; koridor City Walk 0,40 m; bangku Duduk 0,44 m; **pintu G01
  0,40 m (pemain kini BISA masuk toko)**; **petak G04 lama 0,50 m (tembok tak
  terlihat hilang)**. Semua tercapai, macet 0.
- **(5) LOS ulang (a)/(b)/(c)** (180 sektor, 240 frame, mode baru Tugas 3,
  posisi pemain pasca-dorong) — camera.position:
  **(a) 0/180** (tetap), **(b) 0/180** (dari 180/180), **(c) 0/180**
  (dari 40/180). camTarget juga 0/180 di ketiganya (dari (b) 180/180,
  (c) 40/180). Camera.position di luar dinding 180/180 di semua titik.
  Jarak kamera min: (a) 1,94 m, (b) 1,21 m, (c) 1,20 m.
- **(7) Gerbang replay R6**: kota 30/30, padang 76/76, hutan 254/254,
  awan 9/9; posisi byte-identik vs `replay-veg-bersih.json` (maxDiff
  kota 1,8e-15 m, padang 0, hutan 3,6e-15 m, awan 0); pelanggaran 9 =
  artefak AABB lama yang sama. **Keamanan pohon per-edit dibuktikan
  terpisah** (replay termodifikasi): cabut G01 saja → pohon tidak bergerak;
  cabut G04 lama saja → 2 pohon bergerak s.d. 9,04 m (alasan bendera).
  Rantai konser/skatepark/taman + 4 lingkaran kecil berada SETELAH kedua
  snapshot (baris 1919 & 2976) → tidak memengaruhi pohon.

### 9.4 Yang TIDAK disentuh / batasan jujur

- Logika kamera Tugas 3 (dolly-in + dorong sadar-pemain) TIDAK diubah.
  Karakter (kode + GLB cewek/cowok/jembatan) TIDAK disentuh — MD5 live
  cewek `b0d8f674…`, cowok `0864d699…`, jembatan `61b8ba57…` sama seperti
  sebelumnya. v24 TIDAK di-deploy. Debug overlay dipertahankan.
  `ZONA_LARANG_VEG` + seed 20261040 TIDAK disentuh.
- **Kamera masih tidak bisa mengikuti pemain ke DALAM G01** (OBB kamera
  G01 tetap mendorong kamera keluar) — tindak lanjut terpisah, bukan
  penabrak pemain.
- Taman bermain + Gerbang Pasar masih tanpa collider (celah kecil, §9.2 #13).
- Tampilan akhir di Three.js BELUM terbukti — verifikasi browser tugas Vesper.

## 10. RONDE B — FIX LOOP RELOAD LOADING SCREEN + RAPIHIN UI — DEPLOY 2026-11-10

**Perintah pemilik 06:34** ("banyak tembok tak terlihat jir, benerin, di halaman
loading screen juga suka ke reload-reload, tampilan UI juga tolong di rapihin
dibuat bagus"). Catatan: "tembok tak terlihat" sudah ditangani Tugas 4 (§9);
Ronde B menangani dua sisanya: loop reload + UI. Deploy
`dpl_HUnvcPfdxPSPE6e3XEbCDbm7Wqr4`, live MD5
`6aea3a6a5963885928d069d57110547c` = lokal (8.741 baris), 77 file / 111,9 MB,
link playtest https://kota-lumina.vercel.app/?fresh=20261110rondeb.
Backup: `index.html.bak-sebelum-ronde-b-20261110` (MD5 `ca35c2e0…` = build
Tugas 4) + `index.html.bak-sebelum-ui-ronde-b` (MD5 `bea0f62f…` = sesudah
fix reload, sebelum poles UI).

### 10.1 Fix loop reload (Tugas 1 — diagnosis Vesper, sudah pasti)

- Biang (index.html, baris ~515–544): handler `webglcontextlost` sudah
  benar (pesan + reload berpenanda ctx=1 sesudah 1200 ms; bila ctx=1 sudah
  ada, tampilkan pesan "memori perangkat penuh" tanpa reload). TAPI handler
  `webglcontextrestored` melakukan `location.reload()` TANPA PENGAMAN dan
  tanpa penanda. Saat memori HP ketekan waktu loading, urutannya: konteks
  hilang → pulih → restored reload LANGSUNG (tanpa ctx=1) dan selalu
  mengalahkan reload berpenanda yang dijadwalkan 1200 ms → ctx=1 tidak
  pernah nempel → loop reload tanpa henti di layar loading.
- Sebelum:
  `renderer.domElement.addEventListener('webglcontextrestored', function(){ location.reload(); }, false);`
- Sesudah: restored memakai pengaman ctx=1 yang sama — hanya reload SEKALI
  dengan ctx=1; bila ctx=1 sudah ada di URL, JANGAN reload (konteks sudah
  pulih, renderer boleh lanjut):
  ```js
  renderer.domElement.addEventListener('webglcontextrestored', function(){
    try {
      if (location.search.indexOf('ctx=1') >= 0) return;
      var uRes = location.href;
      location.href = uRes + (uRes.indexOf('?') >= 0 ? '&' : '?') + 'ctx=1';
    } catch (e2) {}
  }, false);
  ```
  Handler lost TIDAK diubah. Catch `location.reload()` di dalam handler
  lost (jalur exception, hampir tak pernah tercapai) dibiarkan apa adanya.
- Harness `audit/plan/uji-reload-ronde-b.cjs` — SEMUA GERBANG LOLOS (exit 0,
  dijalankan koordinator pada file hasil edit; diulang sesudah poles UI,
  tetap lolos): `node --check` 3/3 blok inline; simulasi dengan KODE ASLI
  yang diekstrak dari index.html (mock location/document/renderer):
  (A) lost → restored sebelum timer → tepat 1 navigasi berpenanda ctx=1,
  0 reload; (B) halaman sudah ctx=1, lost + restored lagi → 0 navigasi,
  0 reload (loop PUTUS); (C) kontrol kode LAMA → restored memicu reload
  TANPA ctx=1 (loop terbukti); (D) URL tanpa query → penanda memakai "?"
  bukan "&".

### 10.2 Rapihin UI (Tugas 2 — CSS/HTML saja, dikerjakan subagent)

- Layar loading `#layarMuat`: latar #1c1430 polos → gradasi senja 5-stop
  (#ffd98a → #ff9e7d → #e2543e → #7b3a6e → #2a1745) + 2 radial glow;
  judul `.muatJudul` 46px + subjudul baru "KOTA SENJA"; bar progres
  `.muatBar` 14px ber-border + `#barMuat` gradasi emas-oranye + glow +
  transisi width .45s; `#teksMuat` jadi pill gelap ber-border + blur
  (script sudah menulis `n/total` di sini — persentase tampil di pill);
  catatan `.muatCatatan` lebih rapih. Inline style dipindah ke <style>
  (seksi "gerbang"); `style="display:none"` dipertahankan; script tetap
  mengatur `display:flex`.
- Kartu masuk `#masuk` / `#kartuMasuk`: gaya CLAY GEMBUL DIPERTAHANKAN
  (pilihan pemilik); latar jadi gradasi vertikal + aksen pil 3-warna di atas
  judul; subjudul baru "✦ Kota Senja ✦"; ritme dirapatkan (padding,
  margin label/tombol); status `.pilih` diperkuat (outer ring oranye);
  paket landscape `max-height:520px` lengkap (h1 24px, padding/wajah/
  tombol mengecil) supaya kartu muat tanpa scroll berlebihan.
- HUD: bahasa visual disatukan ke seksi POLES UI — `#judulKecil` LUMINA
  jadi pill gradasi gelap; `#infoOnline` + `#luring` jadi pill
  (`width:max-content`); `.emote` dapat border coklat 2px (palet clay);
  `#joyKnob::after` cincin grip dekoratif. `#pilAcara`, `#bannerAcara`,
  `#barFoto`, `#barEmote`, `#joy`, `#aksiKanan`, `#minimap` tidak diubah
  isinya (sudah konsisten); posisi fungsional tidak disentuh.
- Overlay putar-HP `#putarHP`: latar gradasi senja SAMA PERSIS dengan
  layar loading; ikon HP + judul/subteks dirapihkan; animasi
  `putarGoyang` dipertahankan; `style="display:none"` + z-index 9999
  dipertahankan.
- Verifikasi (koordinator memeriksa sendiri, bukan sekadar menerima
  laporan subagent): MD5 hasil edit `6aea3a6a…`, 8741 baris (+65);
  `node --check` 3/3; diff vs backup UI hanya baris 24–289 (area <style> +
  HTML UI); region script (baris 301..EOF lama vs 366..EOF baru)
  IDENTIK 100% — UI tidak menyentuh JS sama sekali; inventaris id
  IDENTIK 35/35 tanpa duplikat; kurung kurawal <style> seimbang 111/111;
  HTML well-formed; z-index/display/safe-area/`body:has(#masuk…)`/
  `#btnDuduk { display:none }` utuh; `#barMuat` inline kini hanya
  `width:0%` (gradasi CSS tampil, script tetap mengisi width); script
  `lm0.style.display='flex'` + `ph.style.display` terkonfirmasi bekerja
  dengan aturan CSS baru.

### 10.3 Yang TIDAK disentuh / batasan jujur

- Karakter (kode + GLB cewek/cowok/jembatan) TIDAK disentuh — MD5 live
  cewek `b0d8f674…`, cowok `0864d699…`, jembatan `61b8ba57…` sama seperti
  sebelumnya. v24 TIDAK di-deploy. Debug overlay dipertahankan.
  `ZONA_LARANG_VEG` + seed 20261040 TIDAK disentuh (region script
  byte-identik vs build Tugas 4; gerbang replay R6 tidak perlu diulang
  karena perubahan hanya CSS/HTML — hitungan "20261040: 4×" di live
  adalah 3 kemunculan kode + 1 komentar, bukan perubahan seed).
  Logika penabrak/kamera Tugas 3–4 TIDAK diubah.
- **Tampilan akhir di Three.js BELUM terbukti** — verifikasi browser
  tugas Vesper. Risiko kecil yang dicatat subagent UI: (1) `#judulKecil`
  kini pill — tingginya +~12px; tumpukan atas (10px padding + pill judul
  ~38px + pill online ~28px + margin) ≈ 82px vs `#pilAcara` di top 98px —
  masih ada celah ~16px, tapi di layar sangat pendek perlu cek visual;
  (2) `.muatSub` pakai `margin-top:-6px` — aman di layout flex, jarak
  bisa sedikit berubah bila font fallback berbeda.
