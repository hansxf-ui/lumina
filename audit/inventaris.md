# Inventaris GLB — Kota Lumina (audit baca-kode, 2026-11-09)

Sumber: `~/workspace/lumina/index.html` (8.256 baris, 399.826 byte, MD5 `0083845b38b99c6d0f9544e5c732962f` — terverifikasi sama) dan `ls *.glb` di disk. Metode: `grep -o` semua string `*.glb` (96 kemunculan, 82 nama unik) + klasifikasi per baris: baris `.load(`/`pasangTokoGLB(`/`pasangRumahWarga(`/`muatKar(`/`muatKiosGLB([` = LOADED; hanya di komentar = 0-REF; rantai fallback `muatKar` = FALLBACK-ONLY.

## Ringkasan

- File GLB di disk: **134** — total **201.541.932 byte (192.2 MB)**
- **LOADED: 68** file (66 non-karakter + 2 karakter utama `karakter-*-final-v1.glb`) — total 109.479.008 byte (104,4 MB); ditambah FALLBACK-ONLY 7.958.508 byte → total dimuat/disiapkan 117.437.516 byte (112,0 MB, termasuk 4 file karakter 42,1 MB)
- **FALLBACK-ONLY: 2** file (`karakter-cewek.glb`, `karakter-cowok.glb` — rantai fallback `muatKar`, baris 6835/6842; di luar cakupan audit kota)
- **0-REFERENSI: 64** file — total **84.104.416 byte (80.2 MB)** tidak pernah di-load (52 tanpa referensi sama sekali + 12 hanya disebut di komentar)
- **DUPLIKAT-VERSI-LAMA: 39** file (subset dari 0-REF, ditandai di kolom catatan)
- Kemunculan string `.glb` di index.html: **96** (82 nama unik); baris `.load('…glb'` literal: **56** + 4 call-site dinamis (`pasangTokoGLB` 7 file, `pasangRumahWarga` 3 file, `muatKiosGLB` 3 file, `muatKar` 4 file).
- Semua nama file yang disebut di index.html ada di disk (0 referensi yatim).

## Tabel

| File | Ukuran (byte) | Status | Baris index.html | Catatan |
|---|---|---|---|---|
| `air-mancur-blender-v1.glb` | 686.808 | LOADED | 995 | Dipakai (lihat penempatan.json) |
| `air-mancur.glb` | 1.449.672 | LOADED | 1087,4688,4888,5338 | Dipakai (lihat penempatan.json) |
| `awan-blender-v1.glb` | 317.020 | LOADED | 5899 | Dipakai (lihat penempatan.json) |
| `awan.glb` | 494.368 | 0-REF | — |  |
| `buku-kertas-toko-blender-v1.glb` | 1.421.128 | LOADED | 3632 | Dipakai (lihat penempatan.json) |
| `buku-kertas.glb` | 743.688 | 0-REF | — |  |
| `bunga-toko-blender-v1.glb` | 617.348 | LOADED | 3640 | Dipakai (lihat penempatan.json) |
| `bunga.glb` | 860.256 | 0-REF | — |  |
| `danau-blender-v1.glb` | 919.764 | LOADED | 8104 | Dipakai (lihat penempatan.json) |
| `es-krim-toko-blender-v1.glb` | 835.312 | LOADED | 3634 | Dipakai (lihat penempatan.json) |
| `es-krim.glb` | 783.252 | 0-REF | — |  |
| `foodcourt-blender-v1.glb` | 932.896 | LOADED | 8056 | Dipakai (lihat penempatan.json) |
| `gedung-aula-v1d.glb` | 3.849.892 | LOADED | 5193 | Dipakai (lihat penempatan.json) |
| `gedung-g01-blender-v2.glb` | 1.473.744 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g01-blender-v3.glb` | 4.012.228 | LOADED | 1434 | Dipakai (lihat penempatan.json) |
| `gedung-g02-blender-v2.glb` | 3.463.120 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g02-blender-v3.glb` | 4.237.372 | LOADED | 1566 | Dipakai (lihat penempatan.json) |
| `gedung-g03-blender-v2.glb` | 1.508.612 | LOADED | 1537 | Dipakai (lihat penempatan.json) |
| `gedung-g04-blender-v1.glb` | 2.735.832 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g04-blender-v2.glb` | 3.131.000 | LOADED | 1464 | Dipakai (lihat penempatan.json) |
| `gedung-g05-blender-v1.glb` | 1.369.556 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g05-blender-v2.glb` | 1.975.152 | LOADED | 1499 | Dipakai (lihat penempatan.json) |
| `gedung-g06-blender-v1.glb` | 1.413.356 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g06-blender-v2.glb` | 5.016.664 | LOADED | 1751 | Dipakai (lihat penempatan.json) |
| `gedung-g07-blender-v1.glb` | 1.318.612 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g07-blender-v2.glb` | 769.612 | LOADED | 1718 | Dipakai (lihat penempatan.json) |
| `gedung-g08-blender-v1.glb` | 1.196.208 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g08-blender-v2.glb` | 1.629.380 | LOADED | 1679 | Dipakai (lihat penempatan.json) |
| `gedung-g09-blender-v1.glb` | 730.656 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g09-blender-v2.glb` | 895.624 | LOADED | 1604 | Dipakai (lihat penempatan.json) |
| `gedung-g10-blender-v1.glb` | 359.024 | 0-REF | — | DUPLIKAT-LAMA (versi Blender lebih tua; yang live v2/v3) |
| `gedung-g10-blender-v2.glb` | 708.688 | LOADED | 1643 | Dipakai (lihat penempatan.json) |
| `gedung-gym-v4.glb` | 2.797.272 | LOADED | 5237 | Dipakai (lihat penempatan.json) |
| `gedung-kantin-v2.glb` | 1.253.380 | LOADED | 5162 | Dipakai (lihat penempatan.json) |
| `gedung-konser-blender-v1.glb` | 1.100.600 | LOADED | 8145 | Dipakai (lihat penempatan.json) |
| `gedung-lab-v6.glb` | 840.080 | LOADED | 5280 | Dipakai (lihat penempatan.json) |
| `gedung-perpustakaan-v4.glb` | 4.082.388 | LOADED | 4755,4789 | Dipakai (lihat penempatan.json) |
| `gedung-plaza-G01.glb` | 1.599.716 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g02.glb` | 1.741.876 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g03.glb` | 2.198.340 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g04.glb` | 1.953.180 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g05.glb` | 1.686.164 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g06.glb` | 1.774.756 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g07.glb` | 1.896.004 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g08.glb` | 1.586.192 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g09.glb` | 1.629.412 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-plaza-g10.glb` | 1.704.640 | 0-REF | — | DUPLIKAT-LAMA (plaza G01..G10, diganti deret G01..G10 Blender) |
| `gedung-utama-sekolah-v4.glb` | 3.246.464 | LOADED | 4706,4741 | Dipakai (lihat penempatan.json) |
| `gerbang-pasar-blender-v1.glb` | 279.436 | LOADED | 2643 | Dipakai (lihat penempatan.json) |
| `gerbang-pasar.glb` | 756.540 | 0-REF (komentar saja) | 2574,2591 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `gerobak-blender-v1.glb` | 866.836 | LOADED | 2848 | Dipakai (lihat penempatan.json) |
| `gerobak-es-krim-blender-v1.glb` | 773.048 | LOADED | 4146 | Dipakai (lihat penempatan.json) |
| `gerobak-es-krim.glb` | 920.708 | 0-REF (komentar saja) | 2827,4107 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `gerobak.glb` | 856.240 | 0-REF (komentar saja) | 2809 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `jalan-muse-town-v1.glb` | 3.175.544 | 0-REF | — |  |
| `jalan-raya-blender-v1.glb` | 915.404 | LOADED | 8231 | Dipakai (lihat penempatan.json) |
| `jembatan-batu-blender-v1.glb` | 1.349.668 | LOADED | 1055 | Dipakai (lihat penempatan.json) |
| `karakter-cewek-final-v1.glb` | 29.224.400 | LOADED | 6834 | Karakter — template utama muatKar (di luar cakupan audit kota) |
| `karakter-cewek.glb` | 4.018.948 | FALLBACK-ONLY | 6835 | Karakter — fallback berantai di muatKar (di luar cakupan audit kota; dicatat saja) |
| `karakter-cewek9.glb` | 13.764.212 | 0-REF | — | DUPLIKAT-LAMA (karakter cewek v9, 0 referensi) |
| `karakter-cowok-final-v1.glb` | 4.913.932 | LOADED | 6841 | Karakter — template utama muatKar (di luar cakupan audit kota) |
| `karakter-cowok.glb` | 3.939.560 | FALLBACK-ONLY | 6842 | Karakter — fallback berantai di muatKar (di luar cakupan audit kota; dicatat saja) |
| `kios-biru-blender-v1.glb` | 666.456 | LOADED | 2773 | Dipakai (lihat penempatan.json) |
| `kios-biru.glb` | 1.017.000 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live kios-*-blender-v1) |
| `kios-merah-blender-v1.glb` | 893.928 | LOADED | 2773 | Dipakai (lihat penempatan.json) |
| `kios-merah.glb` | 985.700 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live kios-*-blender-v1) |
| `kios-oranye-blender-v1.glb` | 1.284.880 | LOADED | 2773 | Dipakai (lihat penempatan.json) |
| `kios-oranye.glb` | 972.328 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live kios-*-blender-v1) |
| `klip-cewek-idle.glb` | 186.640 | 0-REF | — | DUPLIKAT-LAMA (klip animasi cewek, 0 referensi) |
| `klip-cewek-run.glb` | 17.596 | 0-REF | — | DUPLIKAT-LAMA (klip animasi cewek, 0 referensi) |
| `klip-cewek-sit-pose.glb` | 11.200 | 0-REF | — | DUPLIKAT-LAMA (klip animasi cewek, 0 referensi) |
| `klip-cewek-sit-to-stand.glb` | 34.876 | 0-REF | — | DUPLIKAT-LAMA (klip animasi cewek, 0 referensi) |
| `klip-cewek-stand-to-sit.glb` | 34.540 | 0-REF | — | DUPLIKAT-LAMA (klip animasi cewek, 0 referensi) |
| `klip-cewek-walk.glb` | 23.224 | 0-REF | — | DUPLIKAT-LAMA (klip animasi cewek, 0 referensi) |
| `kolam-renang-blender-v1.glb` | 273.136 | LOADED | 8077 | Dipakai (lihat penempatan.json) |
| `kopi-senja-blender-v1.glb` | 801.952 | 0-REF | — | DUPLIKAT-LAMA (varian nama lama; live versi *-toko-blender-v1) |
| `kopi-senja-toko-blender-v1.glb` | 860.128 | LOADED | 3630 | Dipakai (lihat penempatan.json) |
| `kopi-senja.glb` | 714.252 | 0-REF | — |  |
| `kursi-blender-v1.glb` | 672.416 | LOADED | 800 | Dipakai (lihat penempatan.json) |
| `kursi.glb` | 253.712 | 0-REF (komentar saja) | 727,779 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `lampu-jalan-blender-v1.glb` | 145.612 | LOADED | 2120,3072 | Dipakai (lihat penempatan.json) |
| `lampu-jalan.glb` | 735.060 | 0-REF (komentar saja) | 2092,3046,4688 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `lapangan-olahraga-blender-v1.glb` | 559.040 | LOADED | 7989 | Dipakai (lihat penempatan.json) |
| `mainan-toko-blender-v4.glb` | 594.600 | LOADED | 3644 | Dipakai (lihat penempatan.json) |
| `mainan.glb` | 827.580 | 0-REF | — |  |
| `menara-1-blender-v1.glb` | 634.864 | LOADED | 3752 | Dipakai (lihat penempatan.json) |
| `menara-1.glb` | 1.053.184 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live menara-*-blender-v1) |
| `menara-2-blender-v1.glb` | 396.464 | LOADED | 3789 | Dipakai (lihat penempatan.json) |
| `menara-2.glb` | 1.017.380 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live menara-*-blender-v1) |
| `menara-3-blender-v1.glb` | 388.364 | LOADED | 3818 | Dipakai (lihat penempatan.json) |
| `menara-3.glb` | 1.025.832 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live menara-*-blender-v1) |
| `menara-4-blender-v1.glb` | 441.016 | LOADED | 3847 | Dipakai (lihat penempatan.json) |
| `menara-4.glb` | 1.010.280 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live menara-*-blender-v1) |
| `menara-5-blender-v1.glb` | 538.728 | LOADED | 3876 | Dipakai (lihat penempatan.json) |
| `menara-5.glb` | 1.060.496 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live menara-*-blender-v1) |
| `menara-6-blender-v1.glb` | 486.756 | LOADED | 3905 | Dipakai (lihat penempatan.json) |
| `menara-6.glb` | 1.012.248 | 0-REF | — | DUPLIKAT-LAMA (Hunyuan; live menara-*-blender-v1) |
| `menara-jam-blender-v1.glb` | 973.024 | LOADED | 975 | Dipakai (lihat penempatan.json) |
| `mercu-blender-v1.glb` | 618.980 | LOADED | 4219 | Dipakai (lihat penempatan.json) |
| `mercu.glb` | 901.384 | 0-REF (komentar saja) | 4211 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `pagar-blender-v1-segmen.glb` | 26.532 | LOADED | 4562 | Dipakai (lihat penempatan.json) |
| `pagar-blender-v1-tiang.glb` | 37.740 | LOADED | 4968 | Dipakai (lihat penempatan.json) |
| `pagar.glb` | 717.872 | 0-REF (komentar saja) | 4535 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `perahu-biru-blender-v1.glb` | 485.520 | LOADED | 2344 | Dipakai (lihat penempatan.json) |
| `perahu-biru.glb` | 911.848 | 0-REF (komentar saja) | 2281,2319 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `perahu-blender-v1.glb` | 919.000 | LOADED | 2304 | Dipakai (lihat penempatan.json) |
| `perahu-hijau-blender-v1.glb` | 485.528 | LOADED | 2381 | Dipakai (lihat penempatan.json) |
| `perahu-hijau.glb` | 930.372 | 0-REF (komentar saja) | 2282,2358 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `perahu.glb` | 1.030.432 | 0-REF (komentar saja) | 2281 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `pinus-blender-v1.glb` | 1.549.212 | LOADED | 1294 | Dipakai (lihat penempatan.json) |
| `pinus.glb` | 234.304 | 0-REF | — |  |
| `pohon-blender-v1.glb` | 55.468 | LOADED | 1293 | Dipakai (lihat penempatan.json) |
| `pohon.glb` | 254.448 | 0-REF | — |  |
| `roti-kopi-blender-v1.glb` | 889.840 | 0-REF | — | DUPLIKAT-LAMA (varian nama lama; live versi *-toko-blender-v1) |
| `roti-kopi-toko-blender-v1.glb` | 1.250.444 | LOADED | 3550 | Dipakai (lihat penempatan.json) |
| `roti-kopi.glb` | 704.340 | 0-REF | — |  |
| `rumah-cottage-v1.glb` | 151.968 | LOADED | 8047 | Dipakai (lihat penempatan.json) |
| `rumah-modern-v1.glb` | 102.284 | LOADED | 8045 | Dipakai (lihat penempatan.json) |
| `rumah-tradisional-v1.glb` | 109.184 | LOADED | 8046 | Dipakai (lihat penempatan.json) |
| `rumput.glb` | 9.252 | 0-REF | — |  |
| `skatepark-blender-v1.glb` | 219.652 | LOADED | 8177 | Dipakai (lihat penempatan.json) |
| `studio-foto-toko-blender-v1.glb` | 1.039.756 | LOADED | 3636 | Dipakai (lihat penempatan.json) |
| `studio-foto.glb` | 739.168 | 0-REF | — |  |
| `sungai-blender-v3.glb` | 6.386.032 | 0-REF | — | DUPLIKAT-LAMA (live sungai-blender-v4) |
| `sungai-blender-v4.glb` | 3.136.760 | LOADED | 1021 | Dipakai (lihat penempatan.json) |
| `taman-bermain-blender-v1.glb` | 758.348 | LOADED | 8010 | Dipakai (lihat penempatan.json) |
| `taman-bunga-blender-v1.glb` | 377.760 | LOADED | 8209 | Dipakai (lihat penempatan.json) |
| `teh-rempah-blender-v1.glb` | 719.116 | 0-REF | — | DUPLIKAT-LAMA (varian nama lama; live versi *-toko-blender-v1) |
| `teh-rempah-toko-blender-v1.glb` | 972.688 | LOADED | 3642 | Dipakai (lihat penempatan.json) |
| `teh-rempah.glb` | 886.464 | 0-REF | — |  |
| `tenda-hijau-blender-v1.glb` | 301.272 | LOADED | 5531 | Dipakai (lihat penempatan.json) |
| `tenda-hijau.glb` | 929.060 | 0-REF (komentar saja) | 5493,5518 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |
| `tenda-meja-blender-v1.glb` | 514.420 | LOADED | 5500 | Dipakai (lihat penempatan.json) |
| `tenda-meja.glb` | 880.208 | 0-REF (komentar saja) | 5493 | Hanya disebut di komentar/kode lama; TIDAK pernah di-load — file Hunyuan lama |

## Catatan penting

- `gedung-g03-blender-v2.glb` berstatus LOADED (baris 1537, posisi -24,0,20) walaupun STATUS.md menyebutnya DIPARKIR — file tetap dimuat dan tampil.
- `jalan-muse-town-v1.glb` (3.175.544 byte) 0 referensi; komentar baris 1075: jalan muse town dihapus per pemilik 2026-11-02. `jalan-raya-blender-v1.glb` adalah satu-satunya jalan GLB yang di-load.
- 12 file 'komentar saja' adalah sisa Hunyuan yang komentarnya masih menyebut nama lama (mis. baris 727/779 `kursi.glb`, baris 2092/3046 `lampu-jalan.glb`) padahal loader-nya sudah memuat versi `-blender-v1`.
- File 0-REF terbesar: `karakter-cewek9.glb` (13.764.212 byte), `sungai-blender-v3.glb` (6.386.032 byte), `gedung-g02-blender-v2.glb` (3.463.120 byte).
