# STATUS.md — Lumina: aset yang TERPASANG live (sumber kebenaran)

File ini adalah sumber kebenaran soal apa yang SUDAH ada di Lumina.
Dibuat 2026-11-02 setelah agent berulang kali mengklaim aset "belum ada"
padahal sudah terpasang (insiden: aula & gym dibilang belum ada interior;
pintu dibilang "pintu kode" padahal termodel).

ATURAN: sebelum mengklaim sesuatu "belum ada" / mengusulkan membangun ulang,
WAJIB cek file ini + verifikasi ke file aslinya (ls ~/workspace/lumina/*.glb,
grep index.html). Jangan pernah ngomong dari ingatan.

## Gedung sekolah & fasilitas (live di index.html)
- gedung-utama-sekolah-v4.glb — sekolah v4 (diterima pemilik apa adanya 30 Okt)
- gedung-perpustakaan-v4.glb — perpustakaan v4 (enterable)
- gedung-aula-v1d.glb — aula v1d (ENTERABLE + interior; pintu ganda mahoni TERMODEL di GLB, bukan pintu kode)
- gedung-gym-v4.glb — gym v4 (sudah ADA interiornya — jangan usulkan bikin interior lagi)
- gedung-lab-v6.glb — lab v6
- gedung-kantin-v2.glb — kantin v2
- gedung-g01-blender-v3.glb — G01 v3 (enterable)
- gedung-g02-blender-v3.glb — G02 v3 (enterable, bakery interior) ✓
- gedung-g04-blender-v2.glb — G04 v2 "Emerald Glow" (enterable, jewelry interior + shop sign) ✓
- gedung-g05-blender-v2.glb — G05 v2 "Rose Boutique" (enterable, clothing interior) ✓
- gedung-g07-blender-v2.glb — G07 v2 "Café Coral" (enterable, café interior) ✓
- gedung-g06-blender-v2.glb — G06 v2 "Lavender Bloom" (enterable, flower shop interior) ✓
- gedung-g08-blender-v2.glb — G08 v2 "Azure Scoop" (enterable, ice cream interior) ✓
- gedung-g10-blender-v2.glb — G10 v2 "Teal Leaf" (enterable, tea shop interior) ✓
- gedung-g09-blender-v2.glb — G09 v2 "Toko Buku" (enterable, bookstore interior) ✓
- gedung-konser-blender-v1.glb — Gedung Konser v1 (enterable, aula musik mewah: panggung + organ pipa + balkon + lampu kristal) ✓
- skatepark-blender-v1.glb — Skate Park v1 (half-pipe + quarter pipe + ramp + rail + funbox, area terbuka) ✓
- taman-bunga-blender-v1.glb — Taman Bunga v1 (4 bedeng + gapura + air mancur mini, spot foto) ✓
- jalan-raya-blender-v1.glb — Jalan Raya v1 (aspal + trotoar + marka, ganti semua jalan kode) ✓
gedung-g03-blender-v2.glb — G03 (DIPARKIR — tetap v2, belum enterable)

## Toko (semua Blender, live)
- bunga-toko-blender-v1.glb (Toko Bunga v1), mainan-toko-blender-v4.glb (Toko Mainan v4),
  kopi-senja-toko-blender-v1.glb, roti-kopi-toko-blender-v1.glb, es-krim-toko-blender-v1.glb,
  teh-rempah-toko-blender-v1.glb, studio-foto-toko-blender-v1.glb, buku-kertas-toko-blender-v1.glb
- kios-biru/merah/oranye-blender-v1.glb

## Menara & landmark (semua Blender, live)
- menara-1..6-blender-v1.glb (6/6), air-mancur-blender-v1.glb, lampu-jalan-blender-v1.glb,
  mercu-blender-v1.glb, sungai-blender-v4.glb, awan-blender-v1.glb
- jembatan-batu-blender-v1.glb — Jembatan Batu v1 (3 lengkung, 6 lampu nyala malam via bahanJendela, LIVE 5 Nov 21:36, ganti 2 jembatan kayu sungai — mesh kayu lama disembunyikan di loader, posisi Lumina (45.3,-21.7) + (44.4,56.0))

## Alam & properti (live)
- pohon-blender-v1.glb, pinus-blender-v1.glb, perahu-blender-v1.glb,
  perahu-biru-blender-v1.glb, perahu-hijau-blender-v1.glb, kursi-blender-v1.glb,
  pagar-blender-v1-tiang.glb (tiang pagar baru, live 3 Nov),
  lapangan-olahraga-blender-v1.glb (lapangan olahraga, live 3 Nov),
  taman-bermain-blender-v1.glb (taman bermain, live 3 Nov),
  rumah-modern-v1.glb, rumah-tradisional-v1.glb, rumah-cottage-v1.glb (3 rumah warga, live 3 Nov),
  foodcourt-blender-v1.glb (food court outdoor, live 3 Nov),
  kolam-renang-blender-v1.glb (kolam renang umum, live 3 Nov),
  danau-blender-v1.glb (danau + dermaga, live 3 Nov)
  (catatan: tekstur kayu kursi/bangku sedang direvisi — pemilik: "masa papannya polos")

## Air — shader pemilik (water.js, live 2026-11-05)
- **Laut** (laut, 840×840) + **Danau Cermin** (-180,-20) + **danau GLB** (mesh `water`) + **kolam renang GLB** (mesh `Kolam_Water`) + **air mancur GLB** (mesh `water_main`/`water_bowl`/`water_top`) + **sungai GLB** (mesh `sungai_water`) — SEMUA pakai shader air pemilik (gelombang + pantulan langit + kilau matahari/bulan, ikut jam asli via terapkanLangit).
- Cara kerja: `createWaterMaterial(THREE)` di water.js → material shader ditempel ke mesh air GLB saat load (bukan material GLB). Semua air terdaftar di `daftarAirShader` (update + setSky bareng di animate/terapkanLangit).
- CATATAN: v2 GLB danau/kolam (material Principled aproksimasi, 5 Nov 18:28) DITOLAK pemilik — "masih pake air kayak tempelan" — diganti pendekatan shader-runtime ini.
- **BUG 5 Nov 18:40:** layar hitam total (0 call, 0k tri) — `terapkanLangit()` manggil `laut.material.color.copy()` padahal material laut sekarang ShaderMaterial (tanpa `.color`) → TypeError matiin render. Fix: guard `laut.material && laut.material.color`. Deploy 18:45.
- (kosong — pagar tiang sudah live 3 Nov)

## Cara cek cepat
ls ~/workspace/lumina/*.glb | grep -i <nama>   # file ada?
grep -c "<nama-file>" ~/workspace/lumina/index.html  # live? (>0 = live)

## Konteks kerja (perintah tetap pemilik)
- Perintah pemilik 2026-11-02 ~09:56 WITA: "semua yang ada di Lumina yang belum blender, kita buat blender" — konversi semua aset non-Blender ke Blender, satu per satu.
- Ritme kerja: build → render verifikasi → VONIS pemilik → baru pasang. TIDAK ADA yang dipasang sebelum pemilik bilang "pasang".
- Setiap ada render revisi: WAJIB diff vs versi lama sebelum present ke pemilik.
- Standar: NO LOW POLY (hukum pemilik) — semua aset kualitas hero, detail rapi, material bertekstur.
- Antrean 2026-11-02 (update saat selesai): lampu jalan ✓ live → bangku (revisi tekstur kayu, menunggu vonis) → pagar (file jadi, menunggu vonis "pasang") → pohon ✓ → pinus ✓ → perahu ✓ → perahu biru ✓ → perahu hijau ✓ → awan ✓ → mercu ✓ → menara 1-6 ✓ → toko bunga ✓ → toko mainan v4 ✓.
- Sisa: kios, tenda, gerobak, gerbang pasar, dan aset non-Blender lain yang belum dikonversi.

## Karakter (live 2026-11-08 — integrasi cewek final v1)
- `karakter-cewek-final-v1.glb` — karakter cewek final MPFB (merged: 1 mesh, 8 material/primitif, 29,2 MB, MD5 `b0d8f674…`); template UTAMA cewek (ganti Hunyuan). Deploy 2026-11-08 (76 berkas, deployment `dpl_CCKBrazksWKz6PiC3C3XUigWAsQZ`, alias `kota-lumina.vercel.app`); verifikasi live: MD5 index.html + GLB cocok.
- `karakter-cewek.glb` (Hunyuan v4, 4,0 MB) TETAP sebagai fallback berantai (baru → lama → prosedural); `karakter-cowok.glb` (Hunyuan) TIDAK DIUBAH — cowok DIPARKIR.
- Animasi: jalan/lari pakai klip Mixamo bawaan GLB (Mixer + crossfade, timeScale dinamis anti-selip); lompat + duduk bangku prosedural + adaptor sumbu Mixamo (klip jump/sit tidak cocok mentah). `turunDuduk` cewek baru **−0,218** (terukur); label 1,60 / gelembung 2,24; kamera bidik py+1,62 (model baru).
- ⚠️ LUBANG PINGGANG cewek (torso z 0,80–0,94 kosong, tertutup crop top) — JANGAN lepas/ganti crop top, JANGAN tambah ganti baju.
- Catatan playtest: kaki menggantung ±17 cm di atas lantai saat duduk di bangku (anatomi betis+paha < bangku 0,52 m) — dibiarkan apa adanya, keputusan pemilik.
- `karakter-cewek9.glb` + `klip-cewek-*.glb` tetap TIDAK terpakai (0 referensi).
