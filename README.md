# Lumina — Kota Virtual 3D

Kota virtual 3D interaktif berbasis [Three.js](https://threejs.org/) yang bisa dijelajahi langsung dari browser — jalan-jalan keliling kota senja, masuk ke gedung dan toko, duduk di bangku, sampai naik perahu di danau.

🌐 **Live:** https://kota-lumina.vercel.app/

## Fitur

- **Kota 3D lengkap** — sekolah, perpustakaan, aula, gym, lab, kantin, gedung konser, 10 gedung toko (G01–G10), pasar, taman bunga, skate park, kolam renang, danau, sungai, dan jalan raya — sebagian besar aset dimodelkan di Blender dan diekspor sebagai GLB.
- **Karakter 3D** — avatar cowok/cewek dengan animasi jalan, lari, lompat, dan duduk (klip animasi Mixamo + prosedural).
- **Siang–malam mengikuti jam asli** — langit, pencahayaan, dan lampu jalan berubah mengikuti waktu nyata; shader air realistis (laut, danau, sungai, kolam, air mancur).
- **Multiplayer ringan** — pemain lain terlihat secara live lewat MQTT publik (broker EMQX / HiveMQ, tanpa kredensial).
- **Kontrol HP & desktop** — joystick virtual + tombol aksi di layar sentuh, WASD + mouse di desktop; minimap live, mode foto, dan pengaturan bayangan.

## Cara menjalankan

Tidak butuh build step — ini situs statis:

```bash
# cara 1: server statis apa saja, misal Python
python3 -m http.server 8000
# lalu buka http://localhost:8000/

# cara 2: deploy ke Vercel / GitHub Pages / Netlify
# cukup arahkan root project ke folder ini (entry point: index.html)
```

Buka `index.html` — semua aset (GLB, JS, gambar) dimuat relatif dari folder ini, jadi pastikan seluruh isi repo ikut ter-deploy.

## Struktur

| File / folder | Isi |
|---|---|
| `index.html` | Aplikasi utama: scene Three.js, kontrol, UI, multiplayer |
| `water.js` | Shader air realistis (laut, danau, sungai, kolam) |
| `three.min.js`, `GLTFLoader.js`, `SkeletonUtils.js` | Three.js + loader GLB |
| `*.glb` | Aset 3D Blender: gedung, toko, alam, kendaraan, karakter |
| `klip-cewek-*.glb` | Klip animasi karakter |
| `ikon-*.png` | Ikon avatar cowok/cewek |
| `STATUS.md` | Daftar aset yang sudah terpasang live |
| `ui-polish-patch.md` | Catatan polish UI (ikon SVG + tombol) |
| `cek-toko/` | Utilitas cek toko |

## Teknologi

- Three.js (GLTFLoader) — render 3D
- Blender — pemodelan aset (GLB)
- MQTT.js via broker publik (EMQX / HiveMQ) — multiplayer
- Vanilla JS + HTML/CSS — tanpa framework build

## Lisensi

MIT — lihat [LICENSE](LICENSE).
