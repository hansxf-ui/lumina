# DIAGNOSIS FPS — Lumina

**Tanggal:** 2026-11-09 · **Sumber:** `~/workspace/lumina/index.html` (8.231 baris, MD5 `ffcbc29e89664c0dd1721343894e51ed`, terverifikasi sama) + `water.js` + hitung segitiga semua GLB dari header/JSON-nya (skrip diagnosis di `/tmp/tri_glb.py`, `/tmp/mesh_tri.py` — tidak ada file proyek yang diubah).
**Gejala (laporan browser 21:04):** senja awal ~60 fps (tangga 1/5) · plaza malam ~17 fps (58 ms, tangga 5/5, ~1,9 jt tri) · pantai/air ~4 fps (233 ms, tangga 5/5, air memenuhi separuh layar).

**Ringkasan eksekutif:** bottleneck plaza adalah **vertex/segitiga, bukan piksel** — buktinya tangga kualitas sudah di PR 1,0 (piksel minimal) tapi tetap 17 fps. Penyumbang terbesarnya satu sumber: **batang pinus instanced, 4.026 tri × ~267 instance terlihat dari plaza ≈ 1,07 jt tri (56% dari 1,9 jt)**. Satu-satunya cahaya berbayang (matahari/bulan) tetap me-render shadow pass di malam hari, tapi itu biaya kedua. Air adalah satu-satunya biaya yang spesifik pantai — tapi dari kode saja, matematik fragment-nya **tidak cukup menjelaskan 233 ms**; perlu ukur A/B di browser (lihat §5).

---

## (a) Apa yang dikontrol tangga kualitas

**Hanya pixel ratio. Tidak ada yang lain.**

- `PR_TANGGA = [1.75, 1.5, 1.3, 1.15, 1.0]` — `index.html:536`.
- `terapkanTanggaPR()` (`:538-541`) hanya memanggil `renderer.setPixelRatio(...)` + `renderer.setSize(...)`. `perbaruiResolusiAdaptif()` (`:542-557`) hanya mengubah `prIdx`.
- Turun bila EMA frame > 24 ms (dicek tiap 2 detik); naik hanya bila < 20 ms pada **dua** penilaian berurutan — praktis satu arah, sesuai konteks tugas. Lantai PR = **1,0 (tidak bisa lebih rendah)**, dan iOS di-cap 1,25 (`:539`).
- Tidak ada cabang yang menyentuh bayangan, air, vegetasi, lampu, atau partikel saat tangga turun. Satu-satunya pengecualian terkait performa di luar tangga: tombol `btnBayangan` (`:7416-7431`, manual, bukan otomatis) dan disiplin jarak vegetasi (`cekJarakVegetasi`, `:1282`, sembunyikan zona > 220 m — independen dari tangga).

**Implikasi:** tangga hanya menolong bila bottleneck-nya fragment/piksel. Fakta bahwa plaza malam mentok di tangga 5/5 (PR 1,0) dan tetap 58 ms membuktikan bottleneck plaza **bukan** piksel — melainkan vertex/segitiga (dan/atau CPU). Menurunkan PR lebih jauh tidak mungkin; satu-satunya jalan adalah mengurangi segitiga yang digambar dan/atau draw call & shadow pass.

## (b) 5 penyumbang segitiga terbesar (rendered, dari plaza, malam)

Dihitung dari JSON tiap GLB (indices/3 per primitif mode-4) + jumlah instance dari kode. Total semua GLB yang dimuat (sekali hitung, tanpa instance, tanpa karakter): **971.462 tri**. Karakter (cewek 89.042 + cowok 75.000 = 164.042 tri) **tidak termasuk** dalam daftar ini sesuai batas tugas — tapi dicatat di rekonsiliasi karena mereka bagian dari 1,9 jt.

| # | Penyumbang | Perkiraan tri (rendered dari plaza) | Keterangan |
|---|---|---|---|
| 1 | **Batang pinus instanced** (`pinus-blender-v1.glb`, mesh pertama saja) | **~1.074.000** (267 instance × 4.026) | 232 hutan + ~25 padang + ~10 kota; zona gunung (+22) tersembunyi disiplin jarak dari plaza. Satu instance = silinder batang 2.313 verts, r≈0,16–0,88, h=3,0 m. |
| 2 | **Gedung plaza G01–G10** (v2/v3) | **~312.000** | G06-v2 61.392 + G01-v3 55.888 + G02-v3 55.163 + G04-v2 38.572 + G05-v2 28.671 + G03-v2 19.348 + G08-v2 19.356 + G09-v2 12.894 + G07-v2 11.348 + G10-v2 9.512. Sekali instance tiap gedung. |
| 3 | **Gedung sekolah** (utama + perpus + aula + kantin + gym + lab) | **~151.000** | Perpus-v4 59.222 + utama-v4 40.850 + aula-v1d 22.422 + kantin-v2 10.764 + lab-v6 11.128 + gym-v4 7.452. |
| 4 | **Batang pohon instanced** (`pohon-blender-v1.glb`) | **~145.000** (84 instance × 1.732) | ~51 padang + 20 kota + 8 taman + ~5 `pohonBiasa5`. Satu instance = 548 verts, h=2,05 m. |
| 5 | **Sungai v4** (`sungai-blender-v4.glb`) | **89.572** | Didominasi dedaunan icosphere 38.400 + batu 22.720 + semak 10.880 + bunga 7.680 tri. Sekali instance. |

**Rekonsiliasi dengan 1,9 jt tri (readout browser):** 1.074.000 (pinus) + 145.000 (pohon) + 312.000 (plaza) + ~151.000 (sekolah, bila dalam frustum) + 164.000 (karakter) + ~90.000 (sungai) + 28.800 (air laut) + sisa toko/menara/kios/lampu/perahu dalam frustum (~100–200 rb) ≈ **1,9–2,1 jt** — cocok dengan readout, dengan selisih dijelaskan frustum culling per arah pandang. **Kesimpulan: ~56% segitiga plaza adalah batang pinus.**

**Temuan samping (visual, bukan tuas):** `wujudkanInstansiGLB()` (`:1211-1216`) hanya mengambil **mesh pertama** GLB (`if (o.isMesh && !geo)`). Untuk pinus, mesh pertama = batang (`pinus_wood`, 4.026 tri); dedaunan pinus (`pinus_needles`, 67.080 tri) **dimuat tapi tidak pernah dirender** — pinus yang terlihat sekarang praktis hanya batang (+ tonjolan). Ini justru yang membuat tuas §(e) aman secara visual: siluet yang ada sekarang = profil batang itu sendiri.

## (c) Biaya shader air + tuasnya (tersangka gejala pantai ~4 fps)

**Implementasi** (`water.js`, dipakai `index.html:810-813`):

- Satu mesh laut: `PlaneGeometry(840, 840, 120, 120)` = **28.800 tri**, `frustumCulled = false` (selalu digambar), y = −0,45. Satu pass, **tanpa** render target pantulan/refraksi — "pantulan" hanya sampling warna langit dari uniform (`uSky`) + kilau matahari/bulan analitis.
- Vertex shader: tiap verteks menghitung tinggi gelombang 3× (`hf()` = 3 sinus → 9 sinus/verteks) + normal dari 3 evaluasi `hf()`. 14.641 verteks — murah.
- Fragment shader, per piksel: `pow(g,24)`, `pow(g,400)`, `pow(g,60)` (bulan), Fresnel `pow(...,4)`, kilau `pow(...,180)` + `pow(...,120)` (keduanya dihitung walau salah satu dikali 0), fog `exp()`, tone mapping `exp()` + `pow(c, 0.4545)` (3×). Total **~9× `pow()` + 2× `exp()` per fragment** — berat untuk GPU HP, apalagi dengan `precision: 'highp'` yang dipaksa (`index.html:487`).
- Air **dirender di resolusi penuh** (pass utama, PR yang sama dengan scene). Tidak ada downscale, tidak ada LOD. Empat material air tambahan (`daftarAirShader`: mancur `:1005`, sungai `:1035`, kolam `:8061`, danau `:8088`) memakai shader yang sama di mesh GLB kecil — biayanya kecil.
- Malam tidak mengubah biaya air (hanya uniform `uNight`/`uSky`).

**Penilaian jujur:** air adalah satu-satunya biaya yang spesifik pantai, TAPI matematiknya saja tidak menjelaskan 233 ms. Di PR 1,0, layar HP ~390×844 CSS ≈ 330 rb piksel; separuh layar air ≈ 165 rb fragment × ~20 operasi transenden ≈ 3,3 jt operasi — GPU HP kelas apa pun mengeksekusinya dalam orde milidetik, bukan 233 ms. Jadi salah satu dari ini pasti ikut bermain (tidak bisa dipastikan dari kode saja): (i) titik pandang pantai ikut memuat kota/hutan dalam frustum (vertex load 1,9 jt yang sama), (ii) GPU HP pengujian lemah/thermal-throttle setelah 2,5 jam + `highp` fragment yang lambat di GPU itu, atau (iii) kombinasi keduanya. **Yang perlu diukur di browser:** di titik pantai yang sama, `laut.visible=false` via console (lalu `true` lagi) dan `?noshadow=1` — lihat ms sebelum/sesudah (protokol di §5).

**Tuas air (sekunder, bukan rekomendasi utama):** sederhanakan fragment shader — hapus `pow(g,400)` + `pow(...,180)` (kilau tajam, nyaris tak terlihat di malam hari), ganti Fresnel `pow(...,4)` dengan aproksimasi polinomial, dan/atau turunkan segmen laut 120×120 → 60×60 (28.800 → 7.200 tri; kecil efeknya karena vertex bukan masalah). Perkiraan efek: membantu gejala (b) bila memang fragment-bound; **tidak membantu (a) sama sekali**.

## (d) Biaya malam + tuasnya (tersangka gejala plaza ~17 fps)

Yang berubah saat malam (`terapkanLangit()`, `:660-723` + `perbaruiF3()`, `:7674-7695`):

1. **Shadow pass TETAP JALAN di malam hari.** Satu-satunya lampu berbayang, `matahari` (DirectionalLight, `castShadow = true`, `:616-625`), di malam hari menjadi "bulan": intensitas **0,28** (bukan 0), shadow map **1024×1024, PCFSoft, radius 4**, frustum **±42 m mengikuti pemain**. Three.js me-render shadow map untuk semua caster di kotak 84×84 m itu **setiap frame, siang maupun malam** — tidak ada cabang yang mematikan `castShadow` di malam hari. Caster di sekitar plaza: gedung G01–G10 (~312 rb tri) + karakter + bangku/kios/lampu (133× `castShadow = true` di kode + traverse `castShadow=true` di sebagian besar loader GLB). Perkiraan kasar: shadow pass me-render ulang **~350–500 rb tri/frame** di plaza + sampling PCFSoft di semua fragment yang diterangi. Ini biaya nyata, tapi **bukan biaya khusus malam** (siang juga sama) dan bukan mayoritas dari 1,9 jt tri.
2. **Glow sprite malam:** ~50 sprite `lampuGlow` (12 taman + ~30 `lampuF2` + 6 boulevard + mercu + jembatan) + `kiosGlowList` + `lampionGlowList` + `senjaGlowList` + `jamGlow` — `visible` di malam hari, `opacity = night × 0,85`. Masing-masing 1 draw call + overdraw transparan (tanpa `depthWrite`). Puluhan draw call tambahan + overdraw — terasa di GPU lemah, tapi orde puluhan ms? Tidak — ini biaya kecil-menengah.
3. **Emissive jendela:** `bahanJendela[].emissiveIntensity = night × 1,35` (`:702`) — hanya update uniform per material, murah.
4. **Bintang** (`bintangLangit`, Points, opacity = night × 0,95) — murah.
5. **Kembang api: BUKAN tersangka.** Pool 900 partikel + 6 roket sprite (`:7535-7600`), hanya aktif saat acara 19:30–19:34 waktu lokal; pengujian 21:04 di luar jadwal. Bahkan saat aktif: 900 titik + loop CPU 900/frame = murah.

**Kesimpulan (d):** malam hanya menambah sedikit biaya (glow sprite + emissive). **Tidak ada yang menjelaskan lonjakan senja 60 fps → plaza malam 17 fps dari sisi "malam" itu sendiri** — perbandingan itu tercemar lokasi: senja awal diukur di awal (kemungkinan titik lahir / arah pandang ringan), plaza malam di tengah 1,9 jt tri. Gejala (a) pada dasarnya adalah **gejala plaza (vertex load)**, bukan gejala malam.

**Tuas malam (sekunder):** matikan bayangan saat `langit.night` tinggi (`matahari.castShadow = false` bila night > 0,85, dengan guard agar hanya berubah sekali saat melewati ambang — ganti nilai memicu recompile material). Perkiraan efek: menghilangkan satu pass ~350–500 rb tri di plaza + sampling shadow di main pass; aman secara visual di malam hari (cahaya bulan 0,28 vs hemi ~0,32 — bayangan nyaris tak terlihat). Membantu (a) sebagian; tidak menyentuh (b) bila pantai tidak memuat kota.

## (e) SATU tuas perbaikan terbesar yang direkomendasikan

**Tuas: sederhanakan geometri batang instanced (pinus + pohon) menjadi lathe 8-segi dari profil radius aslinya, di dalam `wujudkanInstansiGLB()`.**

Alasan ini yang terbesar & teraman:
- Menghapus **~1,17 jt tri** dari scene (pinus 267×(4.026−144) + pohon 84×(1.732−144)) — plaza **1,9 jt → ~0,73 jt tri (−62%)**, tanpa mengubah jumlah draw call, tanpa mengubah posisi/skala/zona/culling (bola pembatas zona dihitung dari geometri ASLI sebelum penggantian), tanpa menyentuh karakter/GLB lain.
- Aman visual: material batang **tanpa tekstur** (hanya `baseColorFactor` — `pinus_bark` 0,22/0,14/0,09; `Bark` 0,30/0,19/0,11; 0 image di kedua GLB), jadi UV lathe tidak berpengaruh; siluet dipertahankan oleh konstruksi (profil = radius maksimum asli per pita ketinggian, diukur runtime dari geometri itu sendiri — bukan angka tebak-tebakan); yang berubah hanya kehalusan radial (8 sisi vs ~40–96 segmen) — tak terlihat pada jarak 100 m+ dalam kabut, dan batang di dekat pemain pun tetap siluet yang sama. Dedaunan pinus memang sudah tidak dirender (lihat §b), jadi tidak ada yang hilang.
- Satu titik perubahan, 1 baris pemanggil + 1 fungsi baru; semua pemakaian instancing (pohon & pinus) lewat fungsi ini.

### Kode persis

**Lokasi:** `~/workspace/lumina/index.html`, fungsi `wujudkanInstansiGLB`, baris 1211–1216.

**Teks lama (baris 1211–1216):**
```js
function wujudkanInstansiGLB(gltf, daftar, tebalZ, rBlob){
  var geo = null, mat = null;
  gltf.scene.traverse(function(o){ if (o.isMesh && !geo){ geo = o.geometry; mat = o.material; } });
  if (!geo || !daftar.length) return;
  geo.computeBoundingSphere();
  var pusatGeo = geo.boundingSphere.center, rGeo = geo.boundingSphere.radius;
```

**Teks baru — sisipkan fungsi baru tepat sebelum baris 1211, dan 1 baris sesudah baris 1216:**
```js
/* PERF (diagnosis FPS 2026-11-09): geometri batang instanced terlalu padat —
   pinus 4.026 tri & pohon 1.732 tri per instance, ~350 instance = ~1,2 jt tri
   (~60% scene plaza). Ganti dengan lathe 8-segi dari profil radius aslinya:
   siluet sama (profil = radius maks asli per pita tinggi), material tanpa
   tekstur jadi UV lathe tak berpengaruh. Bola pembatas zona tetap dihitung
   dari geometri ASLI (di bawah), jadi culling/disiplin jarak tak berubah. */
function sederhanakanBatang(geo){
  var pos = geo.attributes.position;
  if (!pos || pos.count < 400) return geo;   /* sudah ringan: jangan sentuh */
  var ymin = Infinity, ymax = -Infinity, i, y;
  for (i = 0; i < pos.count; i++){ y = pos.getY(i); if (y < ymin) ymin = y; if (y > ymax) ymax = y; }
  if (!(ymax > ymin)) return geo;
  var N = 10, profil = [], b, r, rmax = 0;
  for (b = 0; b < N; b++){
    var ya = ymin + (ymax - ymin) * b / (N - 1), yb = ymin + (ymax - ymin) * (b + 1) / (N - 1);
    r = 0;
    for (i = 0; i < pos.count; i++){
      y = pos.getY(i);
      if (y >= ya && y <= yb){ var rr = Math.hypot(pos.getX(i), pos.getZ(i)); if (rr > r) r = rr; }
    }
    if (r > rmax) rmax = r;
    profil.push(new THREE.Vector2(Math.max(r, 0.01), ya));
  }
  if (!rmax) return geo;
  var lathe = new THREE.LatheGeometry(profil, 8);
  lathe.computeBoundingSphere();
  return lathe;
}
function wujudkanInstansiGLB(gltf, daftar, tebalZ, rBlob){
  var geo = null, mat = null;
  gltf.scene.traverse(function(o){ if (o.isMesh && !geo){ geo = o.geometry; mat = o.material; } });
  if (!geo || !daftar.length) return;
  geo.computeBoundingSphere();
  var pusatGeo = geo.boundingSphere.center, rGeo = geo.boundingSphere.radius;
  geo = sederhanakanBatang(geo);   /* PERF: batang 4.026/1.732 tri -> lathe ~144 tri */
```

**Verifikasi sebelum klaim berhasil (oleh koordinator, di HP yang sama dengan laporan browser):**
1. `node --check` / sintaks lolos + MD5 live = lokal setelah deploy.
2. Di titik yang sama persis dengan laporan (plaza, malam — pakai `?jam=21` bila perlu agar jam sama; dan pantai, `?jam=21`), baca readout `DIAG` (baris 606–608): catat **PR/tangga, ms, fps, calls, tri** sebelum vs sesudah. Ekspektasi: tri plaza ~1,9 jt → **~0,7 jt**; calls tetap; ms turun besar bila vertex-bound.
3. Screenshot batang dekat (pohon kota di sekitar titik lahir) + hutan pinus dari jauh — pastikan siluet batang tidak berubah.
4. Isolasi gejala (b) — di titik pantai yang sama, sebelum/sesudah: (i) `laut.visible=false` di console → bila ms jatuh drastis, air fragment-bound dan tuas sekunder §(c) perlu dikerjakan; (ii) `?noshadow=1` → bila ms jatuh, shadow pass ikut besar. Laporkan ketiga angka (normal / tanpa-air / tanpa-bayang) agar tuas berikutnya bisa dipilih dengan bukti, bukan teori.

### Penilaian jujur

- **Gejala (a) plaza malam ~17 fps — yakin tinggi (perkiraan 75–85%).** Bukti kuat: tangga PR sudah mentok di 1,0 (bukan piksel), 1,9 jt tri terukur, dan ~56%-nya adalah satu sumber yang tuas ini hapus (−62% tri). Bila bottleneck-nya memang vertex (sangat mungkin di GPU HP dengan 1,9 jt tri + `highp`), fps plaza seharusnya naik besar (17 → 30-an atau lebih; angka pastinya hanya bisa dari ukur). Risiko utama: bila bottleneck sebenarnya CPU (JS per frame) bukan GPU-vertex, efeknya kecil — tapi tidak ada kandidat CPU besar yang ditemukan (loop per frame: glow ±100 item, kembang api 900 partikel, 2 mixer karakter — semuanya ringan).
- **Gejala (b) pantai ~4 fps — yakin sedang-rendah (~40%).** Tuas ini membantu (b) **hanya bila** frustum pantai ikut memuat kota/hutan (vertex load yang sama). Bila titik pantai menghadap laut lepas (hanya air + langit dalam frustum), tuas ini hampir tidak berpengaruh dan biang sebenarnya adalah shader air di GPU HP itu dan/atau thermal throttle — yang harus dibuktikan dulu lewat A/B `laut.visible=false` di §5. 233 ms terlalu ekstrem untuk dijelaskan satu shader saja; ada kemungkinan faktor perangkat (panas setelah 2,5 jam pengujian) yang tidak bisa didiagnosis dari kode.
- **Yang masih belum pasti:** (1) arah pandang & frustum persis saat kedua gejala diukur (menentukan berapa tri yang benar-benar digambar di pantai); (2) besar kontribusi shadow pass malam vs vertex load (butuh A/B `?noshadow=1`); (3) apakah GPU HP pengujian thermal-throttle; (4) draw calls plaza (tidak tercatat di laporan — readout memilikinya, minta angka `calls` sebelum/sesudah).

### Yang TIDAK direkomendasikan (sengaja tidak dipilih)

- Menambah tangga PR di bawah 1,0: tidak ada gunanya — plaza sudah membuktikan bukan piksel.
- Mengurangi jumlah pinus hutan (232 → 116): memotong tri juga, tapi mengubah kerapatan hutan secara kasat mata; lathe mencapai pengurangan lebih besar tanpa mengubah penempatan.
- Merombak shader air sebagai tuas pertama: hanya menebak gejala (b) dan tidak menyentuh (a); dikerjakan sesudah A/B membuktikan air memang biangnya.
- Menyentuh karakter: di luar batas tugas.
