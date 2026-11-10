# Blink / Glitch — temuan dari kode (audit baca-kode, 2026-11-09)

Sumber: `~/workspace/lumina/index.html` (MD5 `0083845b38b99c6d0f9544e5c732962f`).
Semua klaim di bawah dikutip dari baris kode/komentar — tidak ada tebakan.
Yang TIDAK dilakukan: menjalankan game / memeriksa geometri GLB (itu audit bagian 2).

## B0. Fix highp — MASIH ADA DAN AKTIF ✓

Baris 487:

```js
renderer = new THREE.WebGLRenderer({ antialias: !ADALAH_IOS, precision: 'highp' });
/* FIX 2026-11-04: paksa highp — GPU HP default mediump bikin vertex jitter/kedip
   di koordinat besar (dunia ±330) */
```

- Verifikasi: string `precision: 'highp'` ada tepat satu kali (baris 487), di dalam
  `try` pembuatan renderer; tidak ada `precision` lain di file. Fix aktif.
- Batasan fix ini (dari komentarnya sendiri): hanya mengatasi **vertex jitter di koordinat
  besar** (±330). Ia TIDAK memperbaiki z-fighting antar permukaan koplanar, TIDAK memperbaiki
  transparan bertumpuk, dan TIDAK memperbaiki objek dobel — tiga pola di bawah tetap ada.
- Konteks: dunia membentang ±330 (awan drift membungkus di ±330, baris 5890-an; laut 840×840).
  Dengan `mediump` (16-bit float, ~3 digit desimal presisi) posisi dunia ±330 memang
  bergetar; `highp` menaikkan ke 32-bit. Jadi blink "gedung bergetar di kejauhan" sudah
  ditangani — blink "permukaan berkedip di jarak dekat" belum tentu.

## B1. Permukaan koplanar / z-fighting — MASIH ADA (3 tumpukan terkonfirmasi dari kode)

### B1a. Plaza: 3 bidang bertumpuk dalam 1,8 cm (baris 922–937)

```js
plaza.rotation.x = -Math.PI/2; plaza.position.y = 0.03;    // CircleGeometry r=14
jalan.rotation.x = -Math.PI/2; jalan.position.y = 0.022;    // RingGeometry r=14..20.5
trotoar.rotation.x = -Math.PI/2; trotoar.position.y = 0.04; // RingGeometry r=13.2..14
```

- Trotoar (y=0,04) menumpang plaza (y=0,03) di annulus r 13,2–14 — selisih vertikal
  **hanya 1 cm**. Jalan lingkar (y=0,022) bersentuhan dengan trotoar tepat di r=14
  (batas bersama). Pada jarak pandang 20–60 m dengan depth buffer 24-bit, pemisahan
  1 cm di bidang datar yang luas adalah kandidat z-fighting klasik (kedip saat kamera
  bergerak). Tidak ada `polygonOffset` di mana pun di file (grep: 0 hasil).

### B1b. Jalan setapak tanah di y=0,02 vs jalan lingkar y=0,022 (baris 4402, 922–931)

- `jalanStrip5` menaruh strip di `y=0,02`; jalan lingkar di `y=0,022` — **selisih 2 mm**.
  RUTE_BARAT mulai (-12,8) di r=14,4 — tepat di atas cincin jalan lingkar — dan
  RUTE_SEKOLAH/RUTE_DANAU memotong area plaza lingkar. Di titik-titik persilangan itu
  dua bidang hampir koplanar (2 mm) → kedip.
- Strip-strip RUTE yang saling bersinggungan di junction (-131,17) dan (-84,32) juga
  bertumpuk di y yang sama persis (0,02) — tumpang tindih antar strip di titik belok.

### B1c. Garis lapangan & paving di y 0,02–0,04 (baris 4902–4913, 5415–5422)

- `lapOlSk` (lapangan sekolah) y=0,02; garis putih berupa Box 0,02 tebal di y=0,03
  (rentang y 0,02–0,04) — alas garis persis koplanar dengan lapangan. `park` (parkir
  sekolah, -180,84,5) y=0,03 dengan garis y=0,04. Pola yang sama: bidang di atas
  bidang dengan selisih ≤1 cm dan tanpa polygonOffset.

### B1d. Komentar audit z-fight yang dikutip tugas — hasil cek

| Komentar | Baris | Isi & status |
|---|---|---|
| Gerbang pasar | 2599 | "tidak coplanar, tidak z-fight, melayang <6 cm" — overlay papan teks di Z -0,078, 0,0104 akar (0,056 m dunia) DI DEPAN muka papan. **Ini contoh penanganan yang benar** (jarak 5,6 cm, bukan 0). |
| Lobus City Walk | 3117 | "menyatu dengan pulau tanpa z-fighting terlihat (material atasnya sama dengan pulau)" — klaim visual, bukan pengukuran. Lobus (3,5,-58) r=20 menumpang pulau utama r=60 di y yang sama (atas rumput y=0); dua silinder rumput yang beririsan di bidang y=0 yang sama → tepi perpotongan berisiko z-fight; klaim "tanpa z-fighting terlihat" tidak didukung angka. |
| Perpustakaan | 4756 | "(59.222 tris, 0 flipped, 0 z-fight — audit lumina-audit-glb.mjs)" — audit GLB eksternal, bukan dari kode index.html; file `lumina-audit-glb.mjs` tidak ada di `~/workspace/lumina/` (cek: tidak ditemukan) sehingga klaim ini **tidak bisa diverifikasi** dari repo. |

## B2. Material transparan bertumpuk — BANYAK, tanpa depthWrite discipline yang konsisten

Transparan yang aktif bersamaan di satu frame (grep `transparent:true` — 25 kemunculan):

| Lapisan transparan | Baris | depthWrite | Keterangan |
|---|---|---|---|
| Air mancur primitif `airBak` (Phong, opacity 0,82) | 959 | (default true) | Di `mancurPrimitif` — grup TIDAK di-scene (lihat B3), jadi tidak tampil |
| Air mancur GLB `matAirMancur` (opacity 0,94) | 1096 | (default true) | Material GLB `Air` dibuat transparan di runtime |
| Air shader pemilik (`createWaterMaterial`) | 1004, 1032, 8086, 8113 | ? (water.js, di luar cakupan baca) | Laut + mancur + sungai + kolam + danau — 6+ mesh air shader |
| Blob bayangan pohon/pinus (InstancedMesh, opacity via texture) | 1229, 1283 | `depthWrite:false`, `renderOrder=1` | Benar: blob di-render setelah opaque |
| Awan GLB (opacity 0,75) | 5902–5909 | `depthWrite:false`, `fog:false` | Benar; 9 awan saling tumpang tindih di langit |
| Sprite glow lampu/lampion/api/mercu (opacity 0–0,9) | 1822, 2105, 2745, 3057, 4230, 5564, 5738, 7551 | `depthWrite:false` | Benar; puluhan sprite |
| Sinar mercu (AdditiveBlending) | 4255–4260 | `depthWrite:false`, `DoubleSide` | Benar |
| Kaca toko `matRkKaca` (opacity 0,55) | 3312 | (default true) | **Transparan dengan depthWrite default (true)** — kaca toko menutupi interior; urutan render vs papan/overlay toko rawan |
| Label nama + gelembung karakter (sprite) | 6494, 6504 | `depthWrite:false` | Di luar cakupan kota, dicatat saja |
| Partikel api/kembang api | 7587–7603 | `depthWrite:false` | Benar |

**Penilaian:** sebagian besar transparan sudah `depthWrite:false` (pola benar). Satu-satunya
yang janggal: kaca toko (baris 3312, opacity 0,55, depthWrite tidak dimatikan) dan material
air mancur GLB (opacity 0,94, depthWrite tidak dimatikan) — keduanya menumpuk dengan
mesh air shader di posisi yang sama (air mancur punya mesh `water*` bershader + `Air`
transparan; kolam/danau punya mesh air shader + kemungkinan permukaan kedua di GLB).
Tanpa membaca water.js (di luar cakupan), tidak bisa dipastikan apakah mesh air shader
itu sendiri transparan/depthWrite — **audit bagian 2 wajib memeriksa `water.js`
`createWaterMaterial` (apakah `transparent:true`, `depthWrite`, dan apakah ada 2
permukaan air di posisi yang sama: mesh GLB `water` + bidang air kode).**

## B3. Objek dobel di posisi yang sama — TERKONFIRMASI 3 KASUS

### B3a. Air mancur plaza: Blender vs Hunyuan vs primitif (baris 990–1110)

- `air-mancur-blender-v1.glb` di (0,0,0), `scene.add` langsung (baris 995–1008).
- `air-mancur.glb` (Hunyuan) dimuat ke grup `mancur` (baris 1087–1107) — tetapi grup
  `mancur` **tidak pernah masuk scene** (`// scene.add(mancur);` baris 971,
  "FOUNTAIN REMOVED 2026-11-01"). Jadi model Hunyuan dimuat (biaya bandwidth +
  memori) lalu tidak terlihat. **Bukan dobel-tampil, tapi dobel-muat yang sia-sia.**
- `mancurPrimitif` (bak + bibir + tiang + mangkuk + `airBak` transparan, baris 941–966)
  juga di dalam grup `mancur` yang mati — tidak tampil.
- Catatan: bila suatu saat `scene.add(mancur)` dihidupkan lagi tanpa mematikan
  Blender, dua air mancur akan menumpuk persis di (0,0,0) → z-fight total.

### B3b. Menara kode vs menara GLB (baris 3690–3919) dan gedung kode vs GLB

- 6 menara kode `MENARA_U0..5` dibangun lengkap (dinding + pelat atap) di posisi cincin
  r=20, lalu tiap GLB menara-1..6 dimuat di posisi yang **sama persis** dan
  `grupLama.visible=false` (baris 3766, 3803, 3832, 3861, 3890, 3919).
  Swap-nya benar (kode disembunyikan), tetapi selama GLB belum tiba, menara kode tampil;
  dan bila GLB gagal/timeout (180 dtk), menara kode tetap tampil — perilaku fallback
  yang disengaja. Bukan bug tampil, tapi **beban ganda**: 12 menara dibangun untuk 6 slot.
- Pola yang sama di toko (8 toko kode + 8 GLB, `grupLama.visible=false` baris 3567),
  kursi/bangku (primitif + klon GLB, `prim.visible=false` baris 773–780), kios
  (kode + GLB, `gKode.visible=false` baris 2795), pagar sekolah (primitif + klon GLB),
  roti (baris 3567). **Risiko blink:** bila `visible=false` gagal/terlambat (mis. GLB
  tiba setelah timeout 180 dtk — `sudah=true` memblokir swap, baris 3590–3595),
  primitif dan GLB tampil bersamaan di posisi yang sama.

### B3c. `daftarAirShader` — air yang sama terdaftar berkali-kali?

- `daftarAirShader` diisi dari: mancur Blender (baris 1004), sungai (1032),
  Danau Cermin (4439), kolam (8086), danau GLB (8113) — masing-masing satu `wm`
  per mesh `water*`. Tidak ada dobel-push untuk mesh yang sama di kode.
- **Tetapi:** `air-mancur.glb` dimuat **3 kali** (plaza baris 1087, sekolah 4888,
  mancur2 5338) dan tiap load membuat `matAirMancur` baru (variabel global yang
  ditimpa tiap load — baris 1093: `matAirMancur = o.material`). Load terakhir yang
  selesai menang; animasi "riak/kilau halus" di loop utama hanya menyentuh satu
  material terakhir. Mancur sekolah & mancur2 berbagi nasib material yang sama.
- Laut (`airLaut`, baris 810–812) + Danau Cermin (44×44 di (-180,-20)) + danau GLB
  (-120,-40) + kolam (-40,120) + sungai + mancur: **6 permukaan air shader dalam
  satu scene**, semua di-update tiap frame (`daftarAirShader.forEach(w => w.update(detik))`
  baris 7723) dan `setSky` bareng (baris 673). Bila dua permukaan air bersinggungan
  (mis. danau GLB vs Danau Cermin berjarak 67 m — tidak bersinggungan; sungai vs
  danau — tidak diketahui dari kode), risikonya rendah. **Yang pasti bertumpuk:
  di dalam satu GLB air mancur ada mesh `water_main`/`water_bowl`/`water_top`
  (STATUS.md) — tiga mesh air dalam satu mancur, semuanya diganti shader
  (baris 1002: `/^water/`). Tiga permukaan air shader bertumpuk vertikal dalam
  satu air mancur = kandidat kedip air mancur.**

## B4. Pola lain yang bisa berkedip (dari kode)

1. **Tidak ada `polygonOffset` di seluruh file** (grep: 0 hasil) — padahal file ini
   penuh bidang bertumpuk (B1a–B1c). Satu-satunya mitigasi adalah jarak vertikal
   1–2 cm, yang rapuh.
2. **`bekuMatriksStatis()`** (definisi baris 7885, dipanggil baris 8244) — membekukan matriks objek statis; bila ada
   objek yang seharusnya bergerak tapi ikut dibekukan, ia akan "berkedip" diam di
   tempat. Dari namanya saja tidak bisa dinilai; perlu baca implementasinya
   (di luar temuan utama, dicatat untuk audit bagian 2).
3. **Pohon/pinus InstancedMesh per zona dengan `boundingSphere` buatan** (baris
   1240–1262): bola pembatas zona dihitung dari centroid + jangkauan; bila bola
   salah (mis. zona padang yang tersebar 166×142 m), frustum culling bisa
   mematikan/menghidupkan seluruh zona vegetasi secara tiba-tiba saat kamera
   bergerak — terlihat sebagai "pohon muncul/hilang berkedip" di tepi layar.
   Ditambah disiplin jarak F18 (baris 1297–1322, ambang di baris 1300/1309): zona >140 m disembunyikan,
   ≤138 m ditampilkan, dicek 2×/detik dengan histeresis — **pop-in/pop-out
   vegetasi tiap 0,5 detik di batas 138–148 m adalah perilaku yang dikodekan**,
   bukan bug, tapi terasa seperti blink dari jauh.
4. **Awan transparan 9× saling tumpang tindih** (opacity 0,75, depthWrite false,
   tanpa renderOrder eksplisit) — urutan gambar awan yang tumpang tindih bisa
   berputar tiap frame (sorting transparan per jarak) → kedip halus di langit.
5. **`?noshadow=1` mematikan bayangan total "diagnostik blink"** (baris 493) —
   mengisyaratkan tim sudah mencurigai shadow map sebagai sumber blink; tidak ada
   kesimpulan tertulis di kode.

## B5. Ringkasan penyebab blink (peringkat berdasarkan bukti kode)

| # | Penyebab | Bukti | Tingkat keyakinan |
|---|---|---|---|
| 1 | Z-fighting plaza (3 bidang, selisih 1 cm) + setapak (2 mm) | B1a, B1b — baris 922–937, 4402 | TINGGI — angka dari kode |
| 2 | Tiga mesh air shader bertumpuk dalam satu air mancur (`water_main`/`water_bowl`/`water_top`) | B3c — baris 1002, STATUS.md | SEDANG — nama mesh dari STATUS.md, pola `/^water/` dari kode |
| 3 | Pop-in/pop-out vegetasi (culling zona + disiplin jarak 138/148 m, cek 2×/detik) | B4.3 — baris 1296–1322 | SEDANG — perilaku dikodekan, terasa seperti blink |
| 4 | Dobel-bangun kode+GLB (menara/toko/kursi/kios/pagar) — risiko tampil bersama bila swap gagal/timeout | B3b — baris 3567, 3766, 2795 | SEDANG — mekanisme ada, kejadian butuh timeout |
| 5 | Transparan kaca toko & air mancur GLB tanpa depthWrite:false | B2 — baris 3312, 1096 | RENDAH–SEDANG — butuh cek visual |
| 6 | Vertex jitter koordinat besar | B0 — baris 487 | SUDAH DIPERBAIKI (highp aktif) |
| 7 | Air mancur Hunyuan plaza dimuat tapi tak terlihat | B3a — baris 971, 1087 | Bukan blink — buang-buang muat |
