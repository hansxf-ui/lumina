# UI POLISH PATCH — Lumina (ikon SVG + tombol halus)

**Sumber:** `~/workspace/lumina/index.html` · **Live:** https://kota-lumina.vercel.app/
**Tujuan:** semua ikon/emoji overlay diganti SVG inline (tanpa dependensi eksternal, tanpa emoji),
tombol dibuat lebih indah + lebih smooth. **Layout dan fungsi TIDAK berubah** — hanya tampilan + ikon.
**Penerapan oleh koordinator:** search/replace persis + assert (nomor baris di bawah hanya referensi,
yang mengikat adalah string pencariannya). **Jangan deploy sebelum verifikasi §E lolos.**

## Gaya yang dipakai (kohesif, rasa Lumina)

- Ikon: gaya garis membulat — `viewBox 0 0 24 24`, `stroke="currentColor"`,
  `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`
  kecuali aksen isi yang dinyatakan `fill="currentColor"`. Karena pakai `currentColor`,
  ikon otomatis putih di tombol kaca gelap dan cokelat tua (`#3a2430`) di chip emote terang.
- Tombol: gradasi halus (terang di atas → gelap di bawah), bayangan lembut berlapis,
  radius tetap membulat penuh (999px), transisi `transform .18s cubic-bezier(.34,1.56,.64,1)`
  (sedikit spring, bukan lompat kasar), tekan = `scale(.93)` + bayangan mengecil.
- Sentuh: ukuran dan posisi tombol TIDAK diubah (min-height 44–52px sudah nyaman di HP ~390px).
- Yang SENGAJA tidak disentuh: kartu masuk gaya clay (pilihan pemilik 23 Okt),
  isi kanvas minimap (gambar live, hanya bingkainya dipoles), readout DIAG debug
  (sementara, akan dihapus saat bug FPS beres), wajah PNG avatar di kartu masuk.

## §A — Pustaka ikon (salin persis)

Setiap ikon dibungkus: `<svg class="ico" viewBox="0 0 24 24" fill="none"
stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
aria-hidden="true">…</svg>`. Isi dalam tiap ikon (ganti `…`):

- **KAMERA** (btnFoto): `<rect x="3" y="7" width="18" height="13" rx="4"/><path d="M8 7l1.2-2.2A2 2 0 0 1 11 3.8h2a2 2 0 0 1 1.8 1L16 7"/><circle cx="12" cy="13.5" r="3.6"/>`
- **BAYANGAN** (btnBayangan): `<circle cx="12" cy="9" r="3.4"/><path d="M12 3.5v1.4M4.5 9H6M18 9h1.5M7 4.8l1 1M17 4.8l-1 1"/><ellipse cx="12" cy="18.5" rx="6.5" ry="1.8" fill="currentColor" stroke="none" opacity=".55"/>`
- **BULAN** (teks luring): `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>`
- **JEPRET** (btnJepret): `<rect x="3" y="7" width="18" height="13" rx="4"/><path d="M8 7l1.2-2.2A2 2 0 0 1 11 3.8h2a2 2 0 0 1 1.8 1L16 7"/><circle cx="12" cy="13.5" r="3.6"/><circle cx="12" cy="13.5" r="1.3" fill="currentColor" stroke="none"/>`
- **SILANG** (btnKeluarFoto): `<path d="M6 6l12 12M18 6L6 18"/>`
- **KURSI** (btnDuduk): `<path d="M7 3v10M17 3v10M4.5 13h15M7 13v6M17 13v6"/>`
- **PANAH-NAIK** (btnLompat): `<path d="M12 20V5"/><path d="M5.5 11.5 12 5l6.5 6.5"/><path d="M4 20.5h16" opacity=".55"/>`
- **LARI** (btnLari): `<circle cx="16.5" cy="4.8" r="2.1"/><path d="M13.5 8.5 11 13l3.5 3.5"/><path d="M11 10.5 7.5 8.5M11 10.5l4-1.5"/><path d="M11 13 7 19M11 13l4.5 5"/>`
- **ORANG** (chip online): `<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17.5" cy="9" r="2.4"/><path d="M15.5 14.2c2.4.3 4.2 1.9 4.8 4.8"/>`
- **LAMBANG-HALO** (emote Halo!): `<path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10M11 10V4.5a1.5 1.5 0 0 1 3 0V10M14 10.5V6a1.5 1.5 0 0 1 3 0v5"/><path d="M8 11.5c0 3.5 2 6.5 4.5 6.5S17 15 17 11.5"/><path d="M5.5 11.5 8 13"/>`
- **TAWA** (emote Wkwk): `<circle cx="12" cy="12" r="8.5"/><path d="M8 10Q9.25 8.3 10.5 10M13.5 10Q14.75 8.3 16 10"/><path d="M8 13.5c1.2 2.2 2.6 3.2 4 3.2s2.8-1 4-3.2"/>`
- **HATI** (emote Mantap): `<path d="M12 20.5C7 16.5 3.5 13.4 3.5 9.9 3.5 7.4 5.4 5.5 7.8 5.5c1.5 0 3 .8 4.2 2.3C13.2 6.3 14.7 5.5 16.2 5.5c2.4 0 4.3 1.9 4.3 4.4 0 3.5-3.5 6.6-8.5 10.6Z" fill="currentColor" stroke="none"/>`
- **SAMPAI-JUMPA-RAMAI** (emote Halo semua!): `<circle cx="12" cy="8" r="2.8"/><path d="M7 20v-4c0-1.5 2.2-2.5 5-2.5s5 1 5 2.5v4"/><path d="M4.5 5.5l1 1M19.5 5.5l-1 1M3 10h1.5M19.5 10H21"/>`
- **TIDUR** (emote Ngantuk): `<path d="M4 19h6l-6-6h6M14 14h5l-5-5h5"/>`
- **SENJA** (pill + banner acara senja): `<path d="M5 17h14"/><path d="M8 17a4 4 0 0 1 8 0"/><path d="M12 7v1.5M5.5 10.5l1 1M18.5 10.5l-1 1M3 13.5h1.5M19.5 13.5H21"/>`
- **KEMBANG-API** (pill + banner pesta kembang api): `<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M18 6l-2.5 2.5M6 18l2.5-2.5M18 18l-2.5-2.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>`
- **SEGAR** (tombol fallback Muat Ulang): `<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3v4h-4"/>`

## §B — Penggantian HTML statis (cari → ganti, persis)

### B1. Baris info online + luring (sekitar baris 181–182)

CARI:
```
    <div id="infoOnline"><span id="titik" class="kuning"></span><span id="teksOnline">menyambung…</span></div>
    <div id="luring">Mode luring — tetap bisa jalan-jalan sendiri 🌙</div>
```
GANTI:
```
    <div id="infoOnline"><span id="titik" class="kuning"></span><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17.5" cy="9" r="2.4"/><path d="M15.5 14.2c2.4.3 4.2 1.9 4.8 4.8"/></svg><span id="teksOnline">menyambung…</span></div>
    <div id="luring">Mode luring — tetap bisa jalan-jalan sendiri <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg></div>
```
AMAN: JS hanya menulis `textContent` ke `#teksOnline` dan `display` ke `#luring`,
jadi SVG di sebelahnya tidak pernah tertimpa.

### B2. Tombol atas Foto + Bayangan (sekitar baris 185–186)

CARI:
```
    <button class="tombolAtas" id="btnFoto">📷 Foto</button>
    <button class="tombolAtas" id="btnBayangan">Bayangan: Nyala</button>
```
GANTI:
```
    <button class="tombolAtas" id="btnFoto"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="4"/><path d="M8 7l1.2-2.2A2 2 0 0 1 11 3.8h2a2 2 0 0 1 1.8 1L16 7"/><circle cx="12" cy="13.5" r="3.6"/></svg><span>Foto</span></button>
    <button class="tombolAtas" id="btnBayangan"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="3.4"/><path d="M12 3.5v1.4M4.5 9H6M18 9h1.5M7 4.8l1 1M17 4.8l-1 1"/><ellipse cx="12" cy="18.5" rx="6.5" ry="1.8" fill="currentColor" stroke="none" opacity=".55"/></svg><span id="teksBayangan">Bayangan: Nyala</span></button>
```
WAJIB dibarengi §C4 (handler Bayangan harus menulis ke `#teksBayangan`,
bukan ke tombol — kalau tidak, SVG ikut terhapus saat tombol diklik).

### B3. Bar mode foto (sekitar baris 196–197)

CARI:
```
  <button class="emote" id="btnJepret">📸 Jepret</button>
  <button class="emote" id="btnKeluarFoto">✖ Keluar</button>
```
GANTI:
```
  <button class="emote" id="btnJepret"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="4"/><path d="M8 7l1.2-2.2A2 2 0 0 1 11 3.8h2a2 2 0 0 1 1.8 1L16 7"/><circle cx="12" cy="13.5" r="3.6"/><circle cx="12" cy="13.5" r="1.3" fill="currentColor" stroke="none"/></svg><span>Jepret</span></button>
  <button class="emote" id="btnKeluarFoto"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg><span>Keluar</span></button>
```

### B4. Tombol aksi kanan (sekitar baris 203–205)

CARI:
```
  <button class="tombolBulat" id="btnDuduk">🪑 Duduk</button>
  <button class="tombolBulat" id="btnLompat">⬆ Lompat</button>
  <button class="tombolBulat" id="btnLari">🏃 Lari</button>
```
GANTI:
```
  <button class="tombolBulat" id="btnDuduk"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v10M17 3v10M4.5 13h15M7 13v6M17 13v6"/></svg><span>Duduk</span></button>
  <button class="tombolBulat" id="btnLompat"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V5"/><path d="M5.5 11.5 12 5l6.5 6.5"/><path d="M4 20.5h16" opacity=".55"/></svg><span>Lompat</span></button>
  <button class="tombolBulat" id="btnLari"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="16.5" cy="4.8" r="2.1"/><path d="M13.5 8.5 11 13l3.5 3.5"/><path d="M11 10.5 7.5 8.5M11 10.5l4-1.5"/><path d="M11 13 7 19M11 13l4.5 5"/></svg><span>Lari</span></button>
```
AMAN: `setLari()` hanya toggle class `aktif` (tidak menulis teks); handler Lompat
pakai `pointerdown` (tidak menulis teks). `#btnDuduk` tetap `display:none` bawaan
sampai logika bangku menampilkannya — tidak diubah.

## §C — Penggantian JS (cari → ganti, persis)

### C1. Daftar emote: buang emoji, tambah peta ikon (sekitar baris 4634)

CARI:
```
var EMOTES = ['👋 Halo!', '📸 Sini, foto!', '😂 Wkwk', '❤ Mantap', '🙌 Halo semua!', '😴 Ngantuk'];
```
GANTI:
```
var EMOTES = ['Halo!', 'Sini, foto!', 'Wkwk', 'Mantap', 'Halo semua!', 'Ngantuk'];
/* POLES UI: ikon SVG chip emote — kunci HARUS sama persis dengan string EMOTES di atas.
   String emote juga dipakai sebagai teks gelembung 3D + validasi multiplayer
   (EMOTES.indexOf), jadi isinya tetap teks polos tanpa emoji. */
var EMOTE_IKON = {
  'Halo!': '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10M11 10V4.5a1.5 1.5 0 0 1 3 0V10M14 10.5V6a1.5 1.5 0 0 1 3 0v5"/><path d="M8 11.5c0 3.5 2 6.5 4.5 6.5S17 15 17 11.5"/><path d="M5.5 11.5 8 13"/></svg>',
  'Sini, foto!': '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="4"/><path d="M8 7l1.2-2.2A2 2 0 0 1 11 3.8h2a2 2 0 0 1 1.8 1L16 7"/><circle cx="12" cy="13.5" r="3.6"/></svg>',
  'Wkwk': '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8 10Q9.25 8.3 10.5 10M13.5 10Q14.75 8.3 16 10"/><path d="M8 13.5c1.2 2.2 2.6 3.2 4 3.2s2.8-1 4-3.2"/></svg>',
  'Mantap': '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5C7 16.5 3.5 13.4 3.5 9.9 3.5 7.4 5.4 5.5 7.8 5.5c1.5 0 3 .8 4.2 2.3C13.2 6.3 14.7 5.5 16.2 5.5c2.4 0 4.3 1.9 4.3 4.4 0 3.5-3.5 6.6-8.5 10.6Z" fill="currentColor" stroke="none"/></svg>',
  'Halo semua!': '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="2.8"/><path d="M7 20v-4c0-1.5 2.2-2.5 5-2.5s5 1 5 2.5v4"/><path d="M4.5 5.5l1 1M19.5 5.5l-1 1M3 10h1.5M19.5 10H21"/></svg>',
  'Ngantuk': '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h6l-6-6h6M14 14h5l-5-5h5"/></svg>'
};
```

### C2. Generator chip emote (tepat di bawah C1)

CARI:
```
    var b = document.createElement('button');
    b.className = 'emote';
    b.textContent = teks;
```
GANTI:
```
    var b = document.createElement('button');
    b.className = 'emote';
    b.innerHTML = (EMOTE_IKON[teks] || '') + '<span>' + teks + '</span>';
```
AMAN: `teks` berasal dari konstanta EMOTES sendiri (bukan input pengguna),
jadi innerHTML di sini tidak membuka injeksi. Handler klik di bawahnya tidak berubah
(`tampilEmote(teks)`, `stateEmote = teks`, `kirimState` tetap pakai string polos).

### C3. Emote bot lokal (sekitar baris 4851)

CARI:
```
  if (detik < botEmoteSampai) emote = '👋 Halo!';
```
GANTI:
```
  if (detik < botEmoteSampai) emote = 'Halo!';
```
ALASAN: string ini dikirim lewat `prosesPesan` → validasi `EMOTES.indexOf`
→ kalau masih pakai emoji lama, gelembung bot tidak tampil di klien baru.

### C4. Handler tombol Bayangan (sekitar baris 5053)

CARI:
```
    $('btnBayangan').textContent = nyala ? 'Bayangan: Nyala' : 'Bayangan: Mati';
```
GANTI:
```
    $('teksBayangan').textContent = nyala ? 'Bayangan: Nyala' : 'Bayangan: Mati';
```
TANPA ini, klik pertama Bayangan akan menghapus SVG dari tombol (textContent
menimpa seluruh isi tombol).

### C5. Daftar acara: ikon jadi kunci + peta SVG (sekitar baris 5061–5066)

CARI:
```
  { id:'senja', ikon:'🌅', nama:'Senja di Dermaga', mulai: 17 * 60 + 30, dur: 15,
    banner:'🌅 Senja di Dermaga dimulai — kumpul di pelabuhan barat!' },
  { id:'kembang', ikon:'🎆', nama:'Pesta Kembang Api', mulai: 19 * 60 + 30, dur: 4,
    banner:'🎆 Pesta Kembang Api dimulai — lihat ke langit barat!' }
];
var pilAcaraEl = $('pilAcara'), bannerEl = $('bannerAcara');
```
GANTI:
```
  { id:'senja', ikon:'senja', nama:'Senja di Dermaga', mulai: 17 * 60 + 30, dur: 15,
    banner:'Senja di Dermaga dimulai — kumpul di pelabuhan barat!' },
  { id:'kembang', ikon:'kembang', nama:'Pesta Kembang Api', mulai: 19 * 60 + 30, dur: 4,
    banner:'Pesta Kembang Api dimulai — lihat ke langit barat!' }
];
/* POLES UI: ikon SVG pill + banner acara — kunci = field ikon di atas. */
var ACARA_IKON = {
  senja: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14"/><path d="M8 17a4 4 0 0 1 8 0"/><path d="M12 7v1.5M5.5 10.5l1 1M18.5 10.5l-1 1M3 13.5h1.5M19.5 13.5H21"/></svg>',
  kembang: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M18 6l-2.5 2.5M6 18l2.5-2.5M18 18l-2.5-2.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>'
};
var pilAcaraEl = $('pilAcara'), bannerEl = $('bannerAcara');
```

### C6. Pembangun teks pill acara (fungsi perbaruiPilAcara)

CARI (deklarasi):
```
  var now = menitSekarang(), teks = null, i;
```
GANTI:
```
  var now = menitSekarang(), teks = null, html = '', i;
```

CARI (cabang sedang berlangsung):
```
      teks = a.ikon + ' ' + a.nama + ' sedang berlangsung!';
```
GANTI:
```
      teks = a.nama + ' sedang berlangsung!';
      html = (ACARA_IKON[a.ikon] || '') + '<span>' + teks + '</span>';
```

CARI (cabang hitung mundur):
```
      teks = best.ikon + ' ' + best.nama + ' · ' + jamFmt(best.mulai) + ' — mulai ' + sisaFmt(bestSisa);
```
GANTI:
```
      teks = best.nama + ' · ' + jamFmt(best.mulai) + ' — mulai ' + sisaFmt(bestSisa);
      html = (ACARA_IKON[best.ikon] || '') + '<span>' + teks + '</span>';
```

CARI (penulis pill):
```
    if (teks !== perbaruiPilAcara._teks){ pilAcaraEl.textContent = teks; perbaruiPilAcara._teks = teks; }
```
GANTI:
```
    if (teks !== perbaruiPilAcara._teks){ pilAcaraEl.innerHTML = html; perbaruiPilAcara._teks = teks; }
```
AMAN: `teks` di sini dibangun dari nama acara konstanta + jam, bukan input pengguna.
Deteksi perubahan tetap pakai string polos `teks` (bukan HTML) supaya tidak
render ulang tiap 500 ms.

### C7. Banner acara pakai ikon (fungsi tampilBanner + 2 pemanggilnya)

CARI:
```
function tampilBanner(teks){
  bannerEl.textContent = teks;
```
GANTI:
```
function tampilBanner(teks, ikon){
  bannerEl.innerHTML = (ikon ? (ACARA_IKON[ikon] || '') : '') + '<span>' + teks + '</span>';
```

CARI (pemanggil di masuk(), sekitar baris 4992):
```
      tampilBanner(aktifTelat.banner);
```
GANTI:
```
      tampilBanner(aktifTelat.banner, aktifTelat.ikon);
```

CARI (pemanggil di cekAcara(), sekitar baris 5102):
```
      tampilBanner(aktif.banner);
```
GANTI:
```
      tampilBanner(aktif.banner, aktif.ikon);
```

### C8. (Opsional, risiko rendah) Tombol fallback Muat Ulang (sekitar baris 237)

CARI:
```
    tombol27.textContent = '↻ Muat Ulang';
```
GANTI:
```
    tombol27.innerHTML = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3v4h-4"/></svg><span>Muat Ulang</span>';
```
CATATAN: tombol ini hanya muncul bila mesin 3D gagal dimuat. Boleh dilewat
kalau koordinator mau meminimalkan diff — tapi biayanya satu baris saja.

## §D — Blok CSS baru (tempel UTUH tepat sebelum `</style>`, tanpa menghapus CSS lama)

Aturan lama dibiarkan apa adanya; blok ini menang karena posisinya lebih akhir
dengan spesifisitas yang sama. JANGAN menambahkan `transform` ke `#joyKnob`
(transform-nya milik JS joystick: `translate(-50%,-50%) translate(dx,dy)`).

```css
  /* ===== POLES UI (ikon SVG + tombol halus) — tempel di akhir <style> ===== */
  .tombolAtas, .tombolBulat, .emote {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    transition:transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease,
      background-color .18s ease, filter .18s ease;
  }
  .tombolAtas .ico, .tombolBulat .ico, .emote .ico, #pilAcara .ico, #bannerAcara .ico { flex:none; }
  .tombolAtas .ico { width:18px; height:18px; }
  .tombolBulat .ico { width:20px; height:20px; }
  .tombolBulat { gap:8px; }
  .emote .ico { width:19px; height:19px; }
  .tombolAtas {
    background:linear-gradient(180deg, rgba(52,38,72,.78), rgba(26,20,38,.62));
    box-shadow:0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.22);
  }
  .tombolAtas:active { transform:scale(.93); box-shadow:0 2px 8px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.22); }
  .tombolBulat {
    background:linear-gradient(180deg, rgba(52,38,72,.78), rgba(26,20,38,.62));
    box-shadow:0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.22);
  }
  .tombolBulat:active { transform:scale(.93); box-shadow:0 2px 8px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.22); }
  #btnDuduk { background:linear-gradient(180deg, #f08a4b, #e2703a); border-color:#ffb98a; }
  #btnLari.aktif {
    background:linear-gradient(180deg, #3cb96b, #2e9e5b); border-color:#8fe3ae;
    box-shadow:0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.25);
  }
  @media (hover:hover) {
    .tombolAtas:hover, .tombolBulat:hover { filter:brightness(1.12); }
    .emote:hover { filter:brightness(1.03); }
  }
  .tombolAtas:focus-visible, .tombolBulat:focus-visible, .emote:focus-visible {
    outline:2px solid rgba(255,217,138,.9); outline-offset:2px;
  }
  .emote {
    background:linear-gradient(180deg, #fffdf8, #ffedc9);
    box-shadow:0 3px 10px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.9);
  }
  .emote:active { transform:scale(.92); background:#ffe9a8; box-shadow:0 1px 4px rgba(0,0,0,.28); }
  #pilAcara {
    background:linear-gradient(180deg, rgba(52,38,72,.72), rgba(26,20,38,.62));
    box-shadow:0 8px 22px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.18);
  }
  #pilAcara .ico { width:18px; height:18px; vertical-align:-4px; margin-right:7px; }
  #bannerAcara {
    background:linear-gradient(180deg, rgba(56,40,74,.88), rgba(26,20,38,.78));
    box-shadow:0 16px 44px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.15);
  }
  #bannerAcara .ico { width:21px; height:21px; vertical-align:-4px; margin-right:8px; }
  #joy {
    background:radial-gradient(circle at 50% 38%, rgba(255,255,255,.20), rgba(255,255,255,.07) 70%);
    box-shadow:0 8px 22px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.25), inset 0 0 0 1px rgba(255,255,255,.12);
  }
  #joyKnob {
    background:radial-gradient(circle at 50% 32%, #fffdf8, #ffe9c4 78%);
    box-shadow:0 5px 16px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(255,255,255,.35);
  }
  #minimap {
    border:3px solid rgba(255,255,255,.55);
    box-shadow:0 8px 22px rgba(0,0,0,.45), 0 0 0 4px rgba(255,255,255,.08);
  }
  #infoOnline .ico { width:15px; height:15px; opacity:.9; }
  #luring .ico { width:14px; height:14px; vertical-align:-2px; margin-left:2px; }
```

## §E — Urutan penerapan + assert + verifikasi (koordinator)

1. Terapkan §B (HTML statis) → §C (JS) → §D (CSS, tepat sebelum `</style>`).
   Jangan membalik §B2 dan §C4: tombol Bayangan harus punya `#teksBayangan`
   SEBELUM handler-nya diubah (atau terapkan keduanya dalam satu edit).
2. Assert (harus lolos semua, tanpa kecuali):
   - `grep -c '📷\|📸\|✖\|🪑\|⬆\|🏃\|👋\|😂\|🙌\|😴\|🌙\|🌅\|🎆' index.html` → **0**
     (satu-satunya ❤ yang tersisa tidak ada — ❤ lama hanya ada di EMOTES yang sudah diganti).
   - `grep -c 'teksBayangan' index.html` → **2** (satu di HTML, satu di handler).
   - `grep -c 'EMOTE_IKON\|ACARA_IKON' index.html` → EMOTE_IKON ≥ 3, ACARA_IKON ≥ 4
     (definisi + pemakaian).
   - `grep -c 'POLES UI' index.html` → **3** (komentar CSS + 2 komentar JS).
   - Ekstrak skrip utama (baris setelah `<script>` utama s/d sebelum `</script>` penutup)
     ke berkas `.js` lalu `node --check` → **OK**. (PERHATIAN: jangan pakai rentang
     baris lama yang kaku — hitung ulang nomor `</script>` setelah edit, karena
     file bertambah ±30 baris; kegagalan cek sintaks karena rentang basi
     pernah terjadi di ronde 4.)
   - `grep -n 'joyKnob' index.html` → pastikan blok CSS baru TIDAK mengandung
     `transform` untuk `#joyKnob`.
3. Verifikasi visual (wajib sebelum deploy, di HP pada lebar ~390px):
   buka halaman → semua tombol menampilkan SVG (bukan kotak/tofu/emoji);
   tekan tiap tombol → mengecil halus lalu kembali (tidak lompat kasar);
   klik Bayangan 2× → ikon tetap ada, teks Nyala↔Mati berganti;
   chip emote → 6 chip berikon + label; kirim satu emote → gelembung 3D
   tampil teks polos (tanpa emoji); joystick → knob tetap mengikuti jari
   (transform JS tidak rusak); minimap → bingkai bercincin lembut.
4. Catatan rollout: string emote adalah bagian protokol multiplayer
   (`EMOTES.indexOf` memvalidasi emote remote). Selama masa transisi, klien
   dengan HTML lama yang masih mengirim emote emoji akan diabaikan klien baru
   (gelembung tidak tampil, tanpa crash). Hilang sendiri setelah semua klien
   memuat ulang halaman.

## §F — Yang TIDAK bisa diganti SVG dengan aman (dan alasannya)

1. **Gelembung chat di atas avatar (dunia 3D).** Digambar dengan `canvas.fillText`
   di `tampilEmote` — kanvas tidak bisa merender SVG inline. Solusi yang dipakai:
   gelembung otomatis bebas emoji karena memakai string EMOTES yang sudah
   dibersihkan; isinya tetap teks (itu sifatnya, bukan ikon).
2. **Isi kanvas minimap.** Gambar live (jalan, pemain, titik) yang digambar
   per frame via canvas 2D — bukan ikon. Hanya bingkai luarnya yang dipoles (§D).
3. **Wajah PNG avatar di kartu masuk** (`ikon-cewek.png`, `ikon-cowok.png`).
   Itu potret raster karakter, bukan ikon UI — tidak diganti, tidak disentuh.
4. **Kartu masuk gaya clay** (`#kartuMasuk`, `#btnMasuk`, `.pilKarBtn`).
   Gaya ini pilihan pemilik (23 Okt) — sengaja tidak diutak-atik.
5. **Readout DIAG debug** (`#dbgRes`). Elemen debug sementara yang akan dihapus
   saat bug FPS beres — memolesnya hanya membuang waktu.
6. **Objek 3D di dunia** (papan toko, dekorasi, dsb.). Bukan overlay UI;
   di luar cakupan tugas ini.
