// =====================================================================
// AUDIT GEOMETRI KOTA LUMINA — bbox dunia + tabrakan + tembus + dobel + z-fight
// READ-ONLY terhadap index.html & GLB (hanya MEMBACA). Menulis hasil ke dir ini.
// Jalankan:  node audit-geometri.mjs
//   (dari ~/workspace/lumina/audit; butuh node >= 18, tanpa dependensi)
// Sumber penempatan: ~/workspace/lumina/index.html — RE-RUN PASKA-AUDIT Fase C+D
//   (2026-11-09; MD5 baru 7dd94c422c5f8f5f0b0d34aa5940713e; inventory di bawah
//   diperbarui ke posisi baru rencana.json; MD5 lama hanya acuan Fase A).
// Metode:
//  - Bbox LOKAL tiap GLB dihitung dari JSON GLB langsung (semua node + mesh,
//    pakai matriks dunia node — setara THREE.Box3.setFromObject, tanpa
//    perlu three.js; pola parsing dari ~/workspace/lumina-audit-glb.mjs).
//  - Bbox DUNIA = transform penempatan (offset model + skala + rotasi Y
//    model + rotasi Y grup + posisi grup) diterapkan ke 8 sudut bbox lokal.
//  - Tabrakan = tumpang tindih AABB footprint (XZ) > 0,01 m2 DAN tumpang
//    tindih Y > 0,05 m, antar objek padat (bukan permukaan tanah/jalan/air).
//  - Tembus = uji titik-di-segitiga (sampling grid 0,5 m) terhadap
//    segitiga permukaan jalan-raya ("Roads"), air sungai/danau/kolam, dan
//    cincin jalan lingkar + trotoar + plaza (uji radial).
//  - Z-fighting dalam GLB = memanggil lumina-audit-glb.mjs per file unik
//    (metode plane-hash normal-aware yang sudah ada — dipakai ulang, bukan
//    ditulis ulang) dan merangkum keluarannya.
//  - Pohon/pinus/awan acak (Math.random di halaman) TIDAK punya posisi
//    deterministik: yang diukur hanya instansi deterministik (replay RNG
//    mulberry32 halaman untuk skala/rotasi), sisanya dilaporkan sebagai
//    ZONA sebaran + jumlah + aturan penghindaran.
// Keluaran: bbox.json, geometri.md, peta-rencana.svg (di direktori ini).
// =====================================================================
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const DIR = dirname(fileURLToPath(import.meta.url));
const LUMINA = '/home/hatch/workspace/lumina';
const HTML = join(LUMINA, 'index.html');
const AUDIT_GLB = '/home/hatch/workspace/lumina-audit-glb.mjs';

const html = readFileSync(HTML, 'utf8');
const md5 = createHash('md5').update(html).digest('hex');
console.log('index.html MD5:', md5);
if (md5 !== '0083845b38b99c6d0f9544e5c732962f') {
  console.error('PERINGATAN: MD5 index.html BERBEDA dari MD5 acuan audit — penempatan mungkin berubah; lanjut dengan nomor baris acuan, cek manual.');
}

// ---------- fungsi tanah (disalin verbatim dari index.html baris 1936-2039) ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const BUKIT = { x: 37, z: 37 };
const LANDAI1 = -2.0, LANDAI2 = 0.4, LANDAI3 = 2.8;
const MERCU = { x: -38, z: 72 };
const LANDAI_MERCU = -0.8;
const GUNUNG = { x: 0, z: -225 };
const LANDAI_G = [1.5, -2.4, -0.5, 2.6, 0.2];
function tinggiGunung(d, a) {
  if (d >= 58) return 0;
  if (d >= 47) return 2.8 * ((58 - d) / 11) * sektor(a, LANDAI_G[0]);
  if (d >= 38) return 2.8 + 2.8 * ((47 - d) / 9) * sektor(a, LANDAI_G[1]);
  if (d >= 30) return 5.6 + 2.8 * ((38 - d) / 8) * sektor(a, LANDAI_G[2]);
  if (d >= 23) return 8.4 + 2.8 * ((30 - d) / 7) * sektor(a, LANDAI_G[3]);
  if (d >= 17) return 11.2 + 2.8 * ((23 - d) / 6) * sektor(a, LANDAI_G[4]);
  return 14;
}
function jembatanInfo(x, z) {
  const ax = -52, az = 76, bx = -77, bz = 91;
  const abx = bx - ax, abz = bz - az;
  let t = ((x - ax) * abx + (z - az) * abz) / (abx * abx + abz * abz);
  t = clamp(t, 0, 1);
  return { t, d: Math.hypot(x - (ax + abx * t), z - (az + abz * t)) };
}
function tinggiDekJembatan(t) {
  if (t < 0.12) return 0.5 * t / 0.12;
  if (t > 0.88) return 0.5 * (1 - t) / 0.12;
  return 0.5;
}
function tinggiMercu(d, a) {
  if (d >= 8) return 0;
  if (d >= 4.2) return 2.5 * ((8 - d) / 3.8) * sektor(a, LANDAI_MERCU);
  return 2.5;
}
function bedaSudut(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}
function sektor(a, ac) {
  const s = clamp(1 - (bedaSudut(a, ac) - 0.30) / 0.24, 0, 1);
  return s * s * (3 - 2 * s);
}
function tinggiBukit(d, a) {
  if (d >= 17.5) return 0;
  if (d >= 12.5) return 1.8 * ((17.5 - d) / 5) * sektor(a, LANDAI1);
  if (d >= 8) return 1.8 + 1.8 * ((12.5 - d) / 4.5) * sektor(a, LANDAI2);
  if (d >= 4.5) return 3.6 + 1.8 * ((8 - d) / 3.5) * sektor(a, LANDAI3);
  return 5.4;
}
function tinggiTanah(x, z) {
  let h = 0;
  const dx = x - BUKIT.x, dz = z - BUKIT.z;
  const d = Math.sqrt(dx * dx + dz * dz);
  if (d < 17.5) { const hb = tinggiBukit(d, Math.atan2(dz, dx)) + 0.02; if (hb > h) h = hb; }
  const mx = x - MERCU.x, mz = z - MERCU.z;
  const md = Math.sqrt(mx * mx + mz * mz);
  if (md < 8) { const hm = tinggiMercu(md, Math.atan2(mz, mx)) + 0.02; if (hm > h) h = hm; }
  if (x < -56.4 && Math.abs(z) < 3.4) { const hd = clamp((-57 - x) / 3 * 0.5, 0, 0.5); if (hd > h) h = hd; }
  if (z > -21.8 && z < -18.2 && x < -156.6 && x > -174) { const hdan = clamp((-157 - x) / 3, 0, 1) * 0.5; if (hdan > h) h = hdan; }
  const jbi = jembatanInfo(x, z);
  if (jbi.d < 1.7) { const hjb = tinggiDekJembatan(jbi.t); if (hjb > h) h = hjb; }
  const gx = x - GUNUNG.x, gz = z - GUNUNG.z;
  const gd = Math.sqrt(gx * gx + gz * gz);
  if (gd < 58) { const hg = tinggiGunung(gd, Math.atan2(gz, gx)) + 0.02; if (hg > h) h = hg; }
  return h;
}

// ---------- RNG deterministik halaman (mulberry32, seed 20261023, index.html:1186) ----------
// Dipakai catatPohon/catatPinus untuk variasi skala (v) + rotasi (ry null).
// Urutan konsumsi acakAset() di halaman (page order):
//   loop pohon kota (baris ~1768): 30x catat (v saja, ry dari Math.random)
//   bingkai menara (1928): 3x (v + ry) | bukit (2437,2445): 8x (v + ry)
//   plaza utara (3739): 4x (v + ry) | peternakan pohonBiasa5 (4625): 3x (v)
//   padang (4649): 76x (v) | hutan pinus (5432): 232x (v)
//   pulau pohonBiasa5 (5726): 1x (v)
let _rngAset = 20261023;
function acakAset() {
  _rngAset |= 0; _rngAset = _rngAset + 0x6D2B79F5 | 0;
  let t = Math.imul(_rngAset ^ _rngAset >>> 15, 1 | _rngAset);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function replayPohon() {
  // konsumsi 30 (loop kota) lalu kembalikan {v, ry} per pohon deterministik
  for (let i = 0; i < 30; i++) acakAset();
  const ambil = () => ({ v: 0.85 + acakAset() * 0.30, ry: acakAset() * Math.PI * 2 });
  const menara = [[-11, -23.5, 1.15], [12, -21, 1.0], [17.5, -13, 0.9]].map(t => ({ ...ambil(), x: t[0], z: t[1], sBase: t[2] * 1.153 }));
  const bukit = [{ x: 39.5, z: 34.5, sBase: 2.28 }].map(t => ({ ...ambil(), ...t }));
  [[14.5, -0.6], [15.5, 1.6], [10.5, -2.9], [10, 2.0], [6.2, 1.2], [15, -1.25], [11, 3.05]].forEach((t, i) => {
    bukit.push({ ...ambil(), x: BUKIT.x + Math.cos(t[1]) * t[0], z: BUKIT.z + Math.sin(t[1]) * t[0], sBase: (0.9 + (i % 3) * 0.15) * 1.122 });
  });
  const utara = [1.2, 2.6, 4.0, 5.5].map(a => ({ ...ambil(), x: Math.sin(a) * 12.5, z: -105 + Math.cos(a) * 12.5, sBase: 1.05 * 1.153 }));
  const peternakan = [[-160, 24, 1.35], [-139, 26, 1.2], [-161, -0.5, 1.25]].map(t => ({ v: 0.85 + acakAset() * 0.30, ry: null, x: t[0], z: t[1], sBase: t[2] * 1.502 }));
  for (let i = 0; i < 76; i++) acakAset();   // padang
  for (let i = 0; i < 232; i++) acakAset();  // hutan pinus
  const pulau = { v: 0.85 + acakAset() * 0.30, ry: null, x: -93.5, z: 103.5, sBase: 1.55 * 1.502 };
  return { menara, bukit, utara, peternakan, pulau };
}
const POHON_DET = replayPohon();

// ---------- tabel penempatan ----------
// file: nama GLB (relatif ke ~/workspace/lumina) | '(prosedural)' = bbox eksplisit
// x,y,z: posisi GRUP | ry: rotasi Y grup | s: skala seragam model
// ox,oy,oz: offset model di dalam grup | mry: rotasi Y model di dalam grup
// tampil:false = dimuat tapi grupnya tidak pernah scene.add (temuan!)
// kat: kategori untuk peta + klasifikasi tabrakan
// line: nomor baris index.html sumber transform
const I = [];
function add(file, label, kat, x, y, z, ry, s, line, extra = {}) {
  I.push({ file, label, kat, x, y, z, ry, s, line, tampil: extra.tampil !== false, ox: extra.ox || 0, oy: extra.oy || 0, oz: extra.oz || 0, mry: extra.mry || 0, note: extra.note || '' });
}
// --- tunggal (callback loader.load) ---
add('menara-jam-blender-v1.glb', 'Menara Jam', 'menara', -25, 0, -46, 0, 1, 975);
add('air-mancur-blender-v1.glb', 'Air Mancur Plaza (Blender)', 'air', 0, 0, 0, 0, 1, 995);
add('sungai-blender-v4.glb', 'Sungai', 'air', 0, 0, 0, 0, 1, 1021, { note: 'mesh sungai_bridge_* disembunyikan kode (baris 1028) — dikeluarkan dari bbox' });
add('jembatan-batu-blender-v1.glb', 'Jembatan Batu 1', 'jalan', 45.3, 0, -21.7, 0, 1, 1055);
add('jembatan-batu-blender-v1.glb', 'Jembatan Batu 2', 'jalan', 44.4, 0, 56.0, 0, 1, 1055);
add('air-mancur.glb', 'Air Mancur Plaza (Hunyuan)', 'air', 0, 0, 0, 0, 4.4 / 3.05, 1087, { tampil: false, note: 'TIDAK TAMPIL: ditambah ke grup mancur yang scene.add-nya dikomentari (baris 965, "FOUNTAIN REMOVED 2026-11-01")' });
add('gedung-g01-blender-v3.glb', 'Gedung G01', 'gedung', -27, 0, -14, 1.091 + Math.PI, 1, 1434);
add('gedung-g04-blender-v2.glb', 'Gedung G04', 'gedung', -15, 14.9, 37.4, 2.761 + Math.PI, 1, 1464);
add('gedung-g05-blender-v2.glb', 'Gedung G05', 'gedung', 10, 0, 33, 0.1797, 1, 1499);
add('gedung-g03-blender-v2.glb', 'Gedung G03', 'gedung', -24, 0, 20, 2.2629 + Math.PI, 1, 1537);
add('gedung-g02-blender-v3.glb', 'Gedung G02', 'gedung', 15, 0, 20, 3.785, 1, 1566);
add('gedung-g09-blender-v2.glb', 'Gedung G09', 'gedung', 20, 0, -27, 2.5041, 1, 1604);
add('gedung-g10-blender-v2.glb', 'Gedung G10', 'gedung', -14, 0, -33, 3.3215, 1, 1643);
add('gedung-g08-blender-v2.glb', 'Gedung G08', 'gedung', 34.8, 0, -15, 1.9029, 1, 1679);
add('gedung-g07-blender-v2.glb', 'Gedung G07', 'gedung', 30, 0, 17, 1.2491, 1, 1718);
add('gedung-g06-blender-v2.glb', 'Gedung G06', 'gedung', -35, 0, -32, 3.7973, 1, 1751);
add('perahu-blender-v1.glb', 'Perahu Merah', 'air', -68.5, -0.28, 5.8, 0.5, 1, 2304, { oy: -0.25, mry: Math.PI });
add('perahu-biru-blender-v1.glb', 'Perahu Biru', 'air', -75, -0.28, -5.9, -0.35, 1, 2344, { oy: -0.25 });
add('perahu-hijau-blender-v1.glb', 'Perahu Hijau', 'air', -62.5, -0.28, -5.3, 1.25, 1, 2381, { oy: -0.25 });
add('gerbang-pasar-blender-v1.glb', 'Gerbang Pasar', 'pasar', 22.5, 0, 0, Math.PI / 2, 1, 2643);
add('gerobak-blender-v1.glb', 'Gerobak Pasar 1', 'pasar', 21.5, 0, -11.5, 0.5, 1, 2848, { mry: -Math.PI / 2, note: 'komentar baris 2818 klaim skala 1,76 — kode setScalar(1.0)' });
add('gerobak-blender-v1.glb', 'Gerobak Pasar 2', 'pasar', 40, 0, 11, -2.2, 1, 2848, { mry: -Math.PI / 2, note: 'komentar baris 2818 klaim skala 1,76 — kode setScalar(1.0)' });
add('roti-kopi-toko-blender-v1.glb', 'Toko Roti & Kopi', 'toko', -8.4, 0, -58, Math.PI / 2, 1.6, 3550, { ox: 0.0073, oy: -0.0005, oz: 0.3833 });
add('kopi-senja-toko-blender-v1.glb', 'Toko Kopi Senja', 'toko', -8.4, 0, -44, 1.5708, 1.7, 3630);
add('buku-kertas-toko-blender-v1.glb', 'Toko Buku & Kertas', 'toko', -8.4, 0, -70, 1.5708, 1.5, 3632);
add('es-krim-toko-blender-v1.glb', 'Toko Es Krim', 'toko', 15.2, 0, -44, -1.5708, 1.5, 3634);
add('studio-foto-toko-blender-v1.glb', 'Toko Studio Foto', 'toko', 15.2, 0, -57, -1.5708, 1.5, 3636);
add('bunga-toko-blender-v1.glb', 'Toko Bunga', 'toko', -8.4, 0, -80, 1.5708, 1.0, 3640);
add('teh-rempah-toko-blender-v1.glb', 'Toko Teh & Rempah', 'toko', 15.2, 0, -68, -1.5708, 1.4, 3642);
add('mainan-toko-blender-v4.glb', 'Toko Mainan', 'toko', 15.2, 0, -80, -1.5708, 1.5, 3644);
add('menara-1-blender-v1.glb', 'Menara Utara 1', 'menara', 15.03, 0, -91.80, -2.292, 1, 3752);
add('menara-2-blender-v1.glb', 'Menara Utara 2', 'menara', 19.83, 0, -107.58, -1.442, 1, 3789);
add('menara-3-blender-v1.glb', 'Menara Utara 3', 'menara', 11.15, 0, -121.6, -0.592, 1, 3818);
add('menara-4-blender-v1.glb', 'Menara Utara 4', 'menara', -9.74, 0, -122.47, 0.508, 1, 3847);
add('menara-5-blender-v1.glb', 'Menara Utara 5', 'menara', -19.55, 0, -109.22, 1.358, 1, 3876);
add('menara-6-blender-v1.glb', 'Menara Utara 6', 'menara', -16.07, 0, -93.09, 2.208, 1, 3905);
add('gerobak-es-krim-blender-v1.glb', 'Gerobak Es Krim', 'pasar', 6.5, 0, 55.5, 0.12, 1, 4146, { oz: -0.3006, mry: Math.PI, note: 'komentar baris ~4110 klaim skala 2,1593 — kode setScalar(1.0)' });
add('mercu-blender-v1.glb', 'Mercusuar', 'menara', MERCU.x, tinggiTanah(MERCU.x, MERCU.z), MERCU.z, 0, 1, 4219, { note: 'y = tinggiTanah(-38,72) = 2,52 (puncak gundukan)' });
add('gedung-utama-sekolah-v4.glb', 'Gedung Utama Sekolah', 'sekolah', -205, -0.3, 45.3, 0, 1, 4741);
add('gedung-perpustakaan-v4.glb', 'Gedung Perpustakaan', 'sekolah', -228, -0.02, 60, 0, 1, 4789);
/* AUDIT 2026-11-09: loader air-mancur.glb sekolah DIHAPUS (Fase C+D) — entri dibuang */
add('gedung-kantin-v2.glb', 'Gedung Kantin', 'sekolah', -207, 0, 76, 0, 1, 5162);
add('gedung-aula-v1d.glb', 'Gedung Aula', 'sekolah', -178, -0.01, 75.5, 0, 1, 5193, { note: 'daun pintu dibuka 90° di kode — bbox pintu ikut terbuka ±1,2 m (di luar tapak)' });
add('gedung-gym-v4.glb', 'Gedung Gym', 'sekolah', -193, 0, 76, 0, 1, 5237, { note: 'daun pintu dibuka 90° di kode' });
add('gedung-lab-v6.glb', 'Gedung Lab', 'sekolah', -243, -0.5, 76, 0, 1, 5280, { note: 'node Ground disembunyikan kode (baris 5284) — dikeluarkan dari bbox' });
/* AUDIT 2026-11-09: loader air-mancur.glb mancur2 DIHAPUS (Fase C+D); primitif pindah ke (-238,84) — entri dibuang */
add('tenda-meja-blender-v1.glb', 'Tenda Meja (Perkemahan)', 'rekreasi', 163, 0, -95, 0.6, 1, 5500);
add('tenda-hijau-blender-v1.glb', 'Tenda Hijau (Perkemahan)', 'rekreasi', 177, 0, -86, -0.9, 1, 5531);
add('lapangan-olahraga-blender-v1.glb', 'Lapangan Olahraga', 'rekreasi', 190, 0, -45, 0, 1, 7989);
add('taman-bermain-blender-v1.glb', 'Taman Bermain', 'rekreasi', -60, 0, 200, 0, 1, 8010);
add('rumah-modern-v1.glb', 'Rumah Modern', 'rumah', 75, 0, -35, 0.5, 1, 8045);
add('rumah-tradisional-v1.glb', 'Rumah Tradisional', 'rumah', 100, 0, -55, -0.3, 1, 8046);
add('rumah-cottage-v1.glb', 'Rumah Cottage', 'rumah', 125, 0, -30, 0.8, 1, 8047);
add('foodcourt-blender-v1.glb', 'Food Court', 'rekreasi', 65, 0, 200, 0, 1, 8056);
add('kolam-renang-blender-v1.glb', 'Kolam Renang', 'air', 30, 0, 155, 0, 1, 8077);
add('danau-blender-v1.glb', 'Danau', 'air', -180, 0.03, -20, 0, 1, 8104);
add('gedung-konser-blender-v1.glb', 'Gedung Konser', 'gedung', 30, 0, 204, 0, 1, 8145);
add('skatepark-blender-v1.glb', 'Skatepark', 'rekreasi', -60, 0, 155, 0, 1, 8177);
add('taman-bunga-blender-v1.glb', 'Taman Bunga', 'rekreasi', 65, 0, 155, 0, 1, 8209);
add('jalan-raya-blender-v1.glb', 'Jalan Raya', 'jalan', 0, 0, 0, 0, 1, 8231);
// --- kios pasar (8 slot baru Fase C+D: sx 23,5..38,5 x sz ±6,8;
//      filter baru: footprint AABB G07/G08 + lingkaran penabrak lain) ---
{
  const files = ['kios-merah-blender-v1.glb', 'kios-biru-blender-v1.glb', 'kios-oranye-blender-v1.glb'];
  let idx = 0;
  for (const sx of [23.5, 28.5, 33.5, 38.5]) for (const sz of [-6.8, 6.8]) {
    add(files[idx % 3], 'Kios Pasar ' + (idx + 1), 'pasar', sx, 0, sz, sz > 0 ? Math.PI : 0, 3.5 / 2.8, 2804, { note: 'idx ' + idx + ' → ' + files[idx % 3] });
    idx++;
  }
}
// --- lampu jalan GLB (30): lampuF2 (24) + boulevard City Walk (6, baris 3052-3065) ---
//     CATATAN BUG: sisi boulevard = ((zl/12)%2===0) ? -1,2 : 8,2; zl = -28..-88
//     step -12 -> zl/12 tidak pernah bulat genap -> SEMUA 6 lampu di x=8,2
//     (sisi barat x=-1,2 kosong). Bukan tebakan: dievaluasi dari rumus kode.
for (const [x, z] of [[-64, -2.55], [-72, 2.55], [-79.2, -2.55]]) add('lampu-jalan-blender-v1.glb', 'Lampu Dermaga', 'perabot', x, tinggiTanah(x, z), z, 0, 1, 2246);
add('lampu-jalan-blender-v1.glb', 'Lampu Bukit 1', 'perabot', 33, tinggiTanah(33, 26), 26, 0, 1, 2483);
add('lampu-jalan-blender-v1.glb', 'Lampu Bukit 2', 'perabot', 37 + Math.cos(LANDAI2) * 10.2, tinggiTanah(37 + Math.cos(LANDAI2) * 10.2, 37 + Math.sin(LANDAI2) * 10.2), 37 + Math.sin(LANDAI2) * 10.2, 0, 1, 2484);
add('lampu-jalan-blender-v1.glb', 'Lampu Bukit 3', 'perabot', 35.2, tinggiTanah(35.2, 39.6), 39.6, 0, 1, 2485);
for (const a of [0.4, 1.9, 3.4, 4.9]) add('lampu-jalan-blender-v1.glb', 'Lampu Plaza Utara', 'perabot', Math.sin(a) * 11.5, tinggiTanah(Math.sin(a) * 11.5, -105 + Math.cos(a) * 11.5), -105 + Math.cos(a) * 11.5, 0, 1, 3732);
for (const [x, z] of [[-120, 42], [-145, 48], [-166, 55], [-186, 66], [-217, 54], [-193, 67]]) add('lampu-jalan-blender-v1.glb', 'Lampu Sekolah', 'perabot', x, tinggiTanah(x, z), z, 0, 1, 5028);
for (const [x, z] of [[-218, 51], [-189, 52], [-200, 67], [-178, 68]]) add('lampu-jalan-blender-v1.glb', 'Lampu Sekolah T2', 'perabot', x, tinggiTanah(x, z), z, 0, 1, 5398);
add('lampu-jalan-blender-v1.glb', 'Lampu Perkemahan', 'perabot', 164.5, tinggiTanah(164.5, -82.5), -82.5, 0, 1, 5583);
add('lampu-jalan-blender-v1.glb', 'Lampu Gunung Awan 1', 'perabot', 5.6, tinggiTanah(5.6, -229.5), -229.5, 0, 1, 5678);
add('lampu-jalan-blender-v1.glb', 'Lampu Gunung Awan 2', 'perabot', -5.6, tinggiTanah(-5.6, -220.5), -220.5, 0, 1, 5679);
add('lampu-jalan-blender-v1.glb', 'Lampu Peternakan', 'perabot', -171.5, tinggiTanah(-171.5, -18.9), -18.9, 0, 1, 4464);
for (let _il = 0, zl = -28; zl >= -88; zl -= 12, _il++) {
  const sisi = (_il % 2 === 0) ? -1.2 : 8.2; // AUDIT 2026-11-09: rumus indeks loop — 3 barat + 3 timur
  add('lampu-jalan-blender-v1.glb', 'Lampu Boulevard z=' + zl, 'perabot', sisi, tinggiTanah(sisi, zl), zl, 0, 1, 3052, { note: 'sisi=' + sisi });
}
// --- bangku GLB / kursi (29): daftarBangkuGLB — klon kursi skala 1, geser z -0,05 ---
function bangku(x, z, ry, label, line) {
  add('kursi-blender-v1.glb', label, 'perabot', x, tinggiTanah(x, z), z, ry, 1, line, { oz: -0.05 });
}
for (let i = 0; i < 6; i++) {
  const a = i / 6 * Math.PI * 2 + 0.26, bx = Math.cos(a) * 6.1, bz = Math.sin(a) * 6.1;
  bangku(bx, bz, Math.atan2(-bx, -bz), 'Bangku Plaza ' + (i + 1), 1864);
}
bangku(-77.4, -1.35, -Math.PI / 2, 'Bangku Dermaga 1', 2247);
bangku(-77.4, 1.35, -Math.PI / 2, 'Bangku Dermaga 2', 2248);
bangku(34.9, 34.9, Math.atan2(-0.707, -0.707), 'Bangku Bukit 1', 2486);
bangku(39.3, 39.3, Math.atan2(0.707, 0.707), 'Bangku Bukit 2', 2487);
bangku(43, 15, Math.PI, 'Bangku Pasar Malam 1', 2895);
bangku(41, -12, 0, 'Bangku Pasar Malam 2', 2896);
bangku(-18, -46, Math.PI / 2, 'Bangku City Walk 1', 3106);
bangku(-18, -74, Math.PI / 2, 'Bangku City Walk 2', 3107);
bangku(-18, -60, -Math.PI / 2, 'Bangku City Walk 3', 3108);
bangku(24, -86, -Math.PI / 2, 'Bangku City Walk 4', 3109);
for (const a of [1.1, 2.2, 3.6, 4.7]) {
  const bx = Math.sin(a) * 4.2, bz = -105 + Math.cos(a) * 4.2;
  bangku(bx, bz, Math.atan2(-bx, -(bz + 105)), 'Bangku Plaza Utara', 3736);
}
bangku(-13, 74.5, 0, 'Bangku Pantai 1', 4033);
bangku(15, 75, 0, 'Bangku Pantai 2', 4034);
bangku(-35.2, 69.9, -0.55, 'Bangku Mercu', 4283);
bangku(-170.5, -20, -Math.PI / 2, 'Bangku Peternakan', 4465);
bangku(2.2, -218.8, 0, 'Bangku Gunung Awan 1', 5676);
bangku(-2.2, -218.8, 0, 'Bangku Gunung Awan 2', 5677);
bangku(-84, 95.4, 1.84, 'Bangku Kuil', 5745);
bangku(166.8, -86.4, 2.414, 'Bangku Log Perkemahan 1', 5580);
bangku(173.5, -93.8, -0.745, 'Bangku Log Perkemahan 2', 5580);
// --- pohon deterministik (19) — skala & ry dari replay RNG halaman ---
for (const t of POHON_DET.menara) add('pohon-blender-v1.glb', 'Pohon Bingkai Menara', 'vegetasi', t.x, 0, t.z, t.ry, t.sBase * t.v, 1928);
for (const t of POHON_DET.bukit) add('pohon-blender-v1.glb', 'Pohon Taman Bukit', 'vegetasi', t.x, tinggiTanah(t.x, t.z), t.z, t.ry, t.sBase * t.v, 2437);
for (const t of POHON_DET.utara) add('pohon-blender-v1.glb', 'Pohon Plaza Utara', 'vegetasi', t.x, 0, t.z, t.ry, t.sBase * t.v, 3739);
for (const t of POHON_DET.peternakan) add('pohon-blender-v1.glb', 'Pohon Peternakan', 'vegetasi', t.x, tinggiTanah(t.x, t.z), t.z, 0, t.sBase * t.v, 4625, { note: 'ry acak Math.random (tak deterministik) — dipakai 0' });
add('pohon-blender-v1.glb', 'Pohon Pulau Kecil', 'vegetasi', POHON_DET.pulau.x, tinggiTanah(POHON_DET.pulau.x, POHON_DET.pulau.z), POHON_DET.pulau.z, 0, POHON_DET.pulau.sBase * POHON_DET.pulau.v, 5726, { note: 'ry acak Math.random — dipakai 0' });
// --- pagar GLB segmen peternakan (56): LEBAR = 1,0859*2,08 = 2,2587 (baris 4562-4595) ---
{
  const LEBAR = 1.0859 * 2.08;
  const bX = (z, x1, x2, rotY) => {
    const n = Math.max(1, Math.round((x2 - x1) / LEBAR)), st = (x2 - x1) / n;
    for (let i = 0; i < n; i++) add('pagar-blender-v1-segmen.glb', 'Pagar Peternakan', 'pagar', x1 + st * (i + 0.5), 0, z, rotY, 1, 4562);
  };
  const bZ = (x, z1, z2, rotY) => {
    const n = Math.max(1, Math.round((z2 - z1) / LEBAR)), st = (z2 - z1) / n;
    for (let i = 0; i < n; i++) add('pagar-blender-v1-segmen.glb', 'Pagar Peternakan', 'pagar', x, 0, z1 + st * (i + 0.5), rotY, 1, 4562);
  };
  bX(-4, -166, -134, 0); bX(30, -166, -134, Math.PI);
  bZ(-166, -4, 30, Math.PI / 2); bZ(-134, -4, 13.5, -Math.PI / 2); bZ(-134, 19.5, 30, -Math.PI / 2);
}
// --- pagar tiang sekolah (100): pagarModulSk, segmen 2,1 m (baris 4932-4960) ---
{
  const segs = [[-250, 38, -170, 38], [-250, 88, -170, 88], [-250, 38, -250, 88]];
  const _sudahTiang = new Set(); // AUDIT 2026-11-09 (D1): dedup tiang sudut (-250,38)
  for (const [x1, z1, x2, z2] of segs) {
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    const ux = dx / len, uz = dz / len, n = Math.max(1, Math.round(len / 2.1)), ry = Math.atan2(-uz, ux);
    for (let k = 0; k < n; k++) {
      const _px = x1 + ux * len * k / n, _pz = z1 + uz * len * k / n, _kk = _px.toFixed(2) + ',' + _pz.toFixed(2);
      if (_sudahTiang.has(_kk)) continue; _sudahTiang.add(_kk);
      add('pagar-blender-v1-tiang.glb', 'Pagar Tiang Sekolah', 'pagar', _px, 0, _pz, ry, 1, 4960);
    }
  }
}

// ---------- instansi prosedural (bbox eksplisit, dari geometri kode) ----------
// bentuk: rect | circle | ring (annulus) — dipakai untuk uji tembus & peta
const P = [];
function addP(label, kat, minX, maxX, minY, maxY, minZ, maxZ, line, extra = {}) {
  P.push({ label, kat, minX, maxX, minY, maxY, minZ, maxZ, line, bentuk: extra.bentuk || 'rect', cx: extra.cx, cz: extra.cz, r0: extra.r0, r1: extra.r1, solid: !!extra.solid, note: extra.note || '' });
}
addP('Pulau Utama', 'tanah', -60, 60, -2.4, 0, -60, 60, 820, { bentuk: 'circle', cx: 0, cz: 0, r1: 60 });
addP('Lobus Tenggara', 'tanah', 15, 65, -2.4, 0, 15, 65, 830, { bentuk: 'circle', cx: 40, cz: 40, r1: 25 });
addP('Daratan Selatan', 'tanah', -85, 85, -2.4, 0, 135, 225, 840);
addP('Lobus Utara', 'tanah', -34, 34, -2.39, 0.01, -134, -66, 3650, { bentuk: 'circle', cx: 0, cz: -100, r1: 34 });
addP('Alas Gunung Awan', 'tanah', -68, 68, -2.8, -0.2, -293, -157, 5586, { bentuk: 'circle', cx: 0, cz: -225, r1: 68 });
addP('Plaza', 'plaza', -14, 14, 0.03, 0.03, -14, 14, 915, { bentuk: 'circle', cx: 0, cz: 0, r1: 14 });
addP('Plaza Mini Utara', 'plaza', -14, 14, 0.032, 0.032, -119, -91, 3656, { bentuk: 'circle', cx: 0, cz: -105, r1: 14 });
addP('Jalan Lingkar', 'jalan', -20.5, 20.5, 0.022, 0.022, -20.5, 20.5, 922, { bentuk: 'ring', cx: 0, cz: 0, r0: 14, r1: 20.5 });
addP('Trotoar Plaza', 'plaza', -14, 14, 0.04, 0.04, -14, 14, 930, { bentuk: 'ring', cx: 0, cz: 0, r0: 13.2, r1: 14 });
addP('Gundukan Mercu', 'tanah', -47.5, -28.5, 0, 2.52, 62.5, 81.5, 4170);
addP('Bukit Taman', 'tanah', 19.5, 54.5, 0, 5.42, 19.5, 54.5, 2425, { bentuk: 'circle', cx: 37, cz: 37, r1: 17.5 });
addP('Gudang Peternakan', 'gedung', -155, -149, 0, 5.2, 2, 10, 4504, { solid: true });
addP('Silo Peternakan', 'gedung', -145.1, -141.9, 0, 8.4, -0.6, 2.6, 4522, { bentuk: 'circle', cx: -143.5, cz: 1, r1: 1.6, solid: true });
addP('Tugu Plaza Utara', 'menara', -1.5, 1.5, 0, 7.9, -106.5, -103.5, 3670, { solid: true });
addP('Kuil Pulau Kecil', 'rekreasi', -84.95, -83.05, 0, 2.15, 92.05, 93.95, 5728, { solid: true });
addP('Bedeng Bunga 1', 'tanah', -223, -217, 0.03, 0.15, 83.25, 84.75, 5379);
addP('Bedeng Bunga 2', 'tanah', -189, -183, 0.03, 0.15, 54.25, 55.75, 5380);
addP('Parkir Sekolah', 'jalan', -186, -174, 0.03, 0.03, 83, 86, 5414);
addP('Lobus Timur', 'tanah', 20, 72, -2.4, 0, -26, 26, 2501, { bentuk: 'circle', cx: 46, cz: 0, r1: 26 });
addP('Lobus City Walk', 'tanah', -28.5, 35.5, -2.4, 0, -90, -26, 3121, { bentuk: 'circle', cx: 3.5, cz: -58, r1: 32 });
addP('Pantai Selatan', 'tanah', -48, 48, -2.35, 0.025, 41, 83, 3956, { bentuk: 'ellipse', cx: 0, cz: 62, r1: 48, r0: 21, note: 'elips 48x21 (skala silinder)' });
addP('Pulau Kecil', 'tanah', -102, -74, -2.4, 0, 84, 112, 5715, { bentuk: 'circle', cx: -88, cz: 98, r1: 14 });
addP('Padang Barat', 'tanah', -250, -71, -2.4, 0, -61, 91, 4385, { note: 'kotak daratan5; ada lubang air danau di (-180,-20) r 20,8 (veto dalamArea)' });
addP('Penghubung Selatan', 'tanah', -71.5, -38, -2.4, -0.004, 8, 80, 4386);
addP('Penghubung Utara', 'tanah', -71.5, -44, -2.4, -0.004, -60, -8, 4387);
addP('Hutan Pinus (daratan)', 'tanah', 60, 245, -2.4, 0, -165, -15, 4388);
addP('Jembatan Darat Timur', 'tanah', 46, 62, -2.4, -0.004, -42, -6, 4389);
addP('Jembatan Darat Utara', 'tanah', 28, 80, -2.4, -0.004, -138, -92, 4390);
addP('Penghubung Gunung', 'tanah', -45, 45, -2.4, -0.004, -210, -128, 4391);
addP('Lapangan Upacara Sekolah', 'plaza', -220, -190, 0.02, 0.02, 52, 68, 4844);
addP('Lapangan Sekolah', 'rekreasi', -234, -216, 0, 0.05, 70, 82, 5411, { note: 'tapak 18x12 dari komentar RAPiH baris 5042 + ring tengah baris 5411' });
addP('Tiang Bendera Sekolah', 'menara', -205.18, -204.82, 0, 8.3, 55.82, 56.18, 4846, { bentuk: 'circle', cx: -205, cz: 56, r1: 0.18, solid: true });
for (const [x, z, ry] of [[-216, 53.5, 0], [-184, 53, 0], [-216, 67, Math.PI / 2], [-178, 55, 0]]) {
  const w = ry === 0 ? 1.9 : 0.55, d = ry === 0 ? 0.55 : 1.9;
  addP('Bangku T2 (prosedural)', 'perabot', x - w / 2, x + w / 2, 0, 1.03, z - d / 2, z + d / 2, 5392, { solid: true, note: 'tanpa swap GLB (bangkuT2 tidak memanggil daftarBangkuGLB)' });
}
for (const [x, z] of [[-232, 52], [-224, 52], [-178, 64], [-189, 66]])
  addP('Pohon T2 (prosedural)', 'vegetasi', x - 1, x + 1, 0, 4.5, z - 1, z + 1, 5352, { bentuk: 'circle', cx: x, cz: z, r1: 1, solid: true });
for (const [x, z, s] of [[-8, 56.5, 1.05], [9.5, 60, 0.95], [-20, 50, 1.1], [24, 52, 1.0], [34, 66, 1.08]])
  addP('Palem Pantai', 'vegetasi', x - 1.3 * s, x + 1.3 * s, 0, 6, z - 1.3 * s, z + 1.3 * s, 4098, { bentuk: 'circle', cx: x, cz: z, r1: 1.3 * s, solid: true });
for (let i = 0; i < 8; i++) {
  const a = i / 8 * Math.PI * 2 + 0.39, x = Math.cos(a) * 16.2, z = Math.sin(a) * 16.2;
  addP('Lampu Plaza (prosedural)', 'perabot', x - 0.3, x + 0.3, 0, 3.5, z - 0.3, z + 0.3, 1832, { bentuk: 'circle', cx: x, cz: z, r1: 0.3, solid: true, note: 'berdiri di atas jalan lingkar (r=16,2)' });
}
for (const [x, z] of [[-11, -11], [11, 11], [11, -11], [-11, 11]])
  addP('Lampu Plaza (prosedural)', 'perabot', x - 0.3, x + 0.3, 0, 3.5, z - 0.3, z + 0.3, 1832, { bentuk: 'circle', cx: x, cz: z, r1: 0.3, solid: true });

// ---------- parser GLB (JSON chunk; semua node + mesh; pola lumina-audit-glb.mjs) ----------
function parseGLB(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32LE(0) !== 0x46546C67) throw new Error('bukan GLB: ' + path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  let binOffset = 20 + jsonLen, bin = Buffer.alloc(0);
  if (buf.readUInt32LE(binOffset + 4) === 0x004E4942) { const bl = buf.readUInt32LE(binOffset); bin = buf.slice(binOffset + 8, binOffset + 8 + bl); }
  const COMP = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  function accData(acc) {
    const bv = json.bufferViews[acc.bufferView];
    const C = COMP[acc.componentType], nc = NCOMP[acc.type];
    const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const stride = bv.byteStride || (C.BYTES_PER_ELEMENT * nc);
    const out = new Array(acc.count);
    for (let i = 0; i < acc.count; i++) {
      const row = new Array(nc);
      for (let c = 0; c < nc; c++) {
        const dv = new DataView(bin.buffer, bin.byteOffset + off + i * stride + c * C.BYTES_PER_ELEMENT, C.BYTES_PER_ELEMENT);
        row[c] = C === Int8Array ? dv.getInt8(0) : C === Uint8Array ? dv.getUint8(0) : C === Int16Array ? dv.getInt16(0, true) : C === Uint16Array ? dv.getUint16(0, true) : C === Uint32Array ? dv.getUint32(0, true) : dv.getFloat32(0, true);
      }
      out[i] = nc === 1 ? row[0] : row;
    }
    return out;
  }
  const matMul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };
  function nodeLocal(n) {
    if (n.matrix) return n.matrix.slice();
    const t = n.translation || [0, 0, 0], r = n.rotation || [0, 0, 0, 1], s = n.scale || [1, 1, 1];
    const [x, y, z, w] = r;
    const r00 = 1 - 2 * (y * y + z * z), r01 = 2 * (x * y - z * w), r02 = 2 * (x * z + y * w);
    const r10 = 2 * (x * y + z * w), r11 = 1 - 2 * (x * x + z * z), r12 = 2 * (y * z - x * w);
    const r20 = 2 * (x * z - y * w), r21 = 2 * (y * z + x * w), r22 = 1 - 2 * (x * x + y * y);
    return [r00 * s[0], r10 * s[0], r20 * s[0], 0, r01 * s[1], r11 * s[1], r21 * s[1], 0, r02 * s[2], r12 * s[2], r22 * s[2], 0, t[0], t[1], t[2], 1];
  }
  const nodeMats = [];
  function walk(idx, parent) {
    const n = json.nodes[idx], local = nodeLocal(n), world = parent ? matMul(parent, local) : local;
    nodeMats[idx] = world;
    (n.children || []).forEach(c => walk(c, world));
  }
  (json.scenes[json.scene || 0].nodes || []).forEach(i => walk(i, null));
  const xp = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
  // bbox lokal; excludeNodes = regex nama node yang disembunyikan kode halaman
  function localBBox(excludeRe) {
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    let nTri = 0, nMesh = 0;
    for (let ni = 0; ni < json.nodes.length; ni++) {
      const nd = json.nodes[ni];
      if (nd.mesh === undefined) continue;
      if (excludeRe && excludeRe.test(nd.name || '')) continue;
      const mesh = json.meshes[nd.mesh]; nMesh++;
      const mat = nodeMats[ni] || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      for (const prim of mesh.primitives) {
        if (prim.mode !== undefined && prim.mode !== 4) continue;
        const pos = accData(json.accessors[prim.attributes.POSITION]);
        const idx = prim.indices !== undefined ? accData(json.accessors[prim.indices]) : pos.map((_, i) => i);
        nTri += idx.length / 3;
        for (let t = 0; t < idx.length; t++) { const p = xp(mat, pos[idx[t]]); for (let k = 0; k < 3; k++) { if (p[k] < mn[k]) mn[k] = p[k]; if (p[k] > mx[k]) mx[k] = p[k]; } }
      }
    }
    return { min: mn, max: mx, tris: nTri, meshes: nMesh };
  }
  // segitiga dunia (XZ) untuk satu node bernama — dipakai uji tembus jalan/air
  function nodeTriangles(nodeName) {
    const out = [];
    for (let ni = 0; ni < json.nodes.length; ni++) {
      const nd = json.nodes[ni];
      if (nd.mesh === undefined || nd.name !== nodeName) continue;
      const mesh = json.meshes[nd.mesh];
      const mat = nodeMats[ni] || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      for (const prim of mesh.primitives) {
        if (prim.mode !== undefined && prim.mode !== 4) continue;
        const pos = accData(json.accessors[prim.attributes.POSITION]);
        const idx = prim.indices !== undefined ? accData(json.accessors[prim.indices]) : pos.map((_, i) => i);
        for (let t = 0; t + 2 < idx.length; t += 3) {
          const a = xp(mat, pos[idx[t]]), b = xp(mat, pos[idx[t + 1]]), c = xp(mat, pos[idx[t + 2]]);
          out.push({ a, b, c, minY: Math.min(a[1], b[1], c[1]), maxY: Math.max(a[1], b[1], c[1]) });
        }
      }
    }
    return out;
  }
  // rentang Y per node (untuk selisih marking vs jalan, dsb.)
  function nodeYRange(nodeName) {
    let mn = 1e9, mx = -1e9;
    for (let ni = 0; ni < json.nodes.length; ni++) {
      const nd = json.nodes[ni];
      if (nd.mesh === undefined || nd.name !== nodeName) continue;
      const mesh = json.meshes[nd.mesh];
      const mat = nodeMats[ni] || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      for (const prim of mesh.primitives) {
        if (prim.mode !== undefined && prim.mode !== 4) continue;
        const pos = accData(json.accessors[prim.attributes.POSITION]);
        for (const p of pos) { const w = xp(mat, p); if (w[1] < mn) mn = w[1]; if (w[1] > mx) mx = w[1]; }
      }
    }
    return { min: mn, max: mx };
  }
  return { localBBox, nodeTriangles, nodeYRange, meshCount: (json.meshes || []).length };
}

// ---------- hitung bbox dunia ----------
const EXCLUDE = { 'sungai-blender-v4.glb': /^sungai_bridge_/, 'gedung-lab-v6.glb': /^Ground$/ };
const uniqueFiles = [...new Set(I.filter(i => i.file !== '(prosedural)').map(i => i.file))];
console.log('file GLB unik ditempatkan:', uniqueFiles.length);
const local = {};
for (const f of uniqueFiles) {
  const g = parseGLB(join(LUMINA, f));
  local[f] = g.localBBox(EXCLUDE[f]);
  console.log('  ' + f + '  bbox lokal [' + local[f].min.map(v => v.toFixed(2)).join(',') + '] .. [' + local[f].max.map(v => v.toFixed(2)).join(',') + ']  tris=' + local[f].tris + ' mesh=' + local[f].meshes);
}
// segitiga permukaan jalan & air (untuk uji tembus titik-di-segitiga)
const jalanGLB = parseGLB(join(LUMINA, 'jalan-raya-blender-v1.glb'));
const triJalan = jalanGLB.nodeTriangles('Roads');
const triTrotoarJalan = jalanGLB.nodeTriangles('Sidewalks');
const yRoads = jalanGLB.nodeYRange('Roads'), ySide = jalanGLB.nodeYRange('Sidewalks'), yMark = jalanGLB.nodeYRange('Markings');
const sungaiGLB = parseGLB(join(LUMINA, 'sungai-blender-v4.glb'));
const triSungai = sungaiGLB.nodeTriangles('sungai_water');
const danauGLB = parseGLB(join(LUMINA, 'danau-blender-v1.glb'));
const triDanau = danauGLB.nodeTriangles('water');
const kolamGLB = parseGLB(join(LUMINA, 'kolam-renang-blender-v1.glb'));
const triKolam = kolamGLB.nodeTriangles('Kolam_Water');
// PENTING: segitiga node di atas masih koordinat LOKAL GLB — terapkan
// penempatan halaman (jalan & sungai di (0,0,0) jadi tak berubah):
function geserTris(tris, dx, dz) { for (const t of tris) for (const p of [t.a, t.b, t.c]) { p[0] += dx; p[2] += dz; } return tris; }
geserTris(triDanau, -180, -20);   // danau di (-180,0.03,-20), baris 8104 (Fase C+D)
geserTris(triKolam, 30, 155);    // kolam di (30,0,155), baris 8077 (Fase C+D)
console.log('segitiga Roads:', triJalan.length, '| Sidewalks:', triTrotoarJalan.length, '| sungai_water:', triSungai.length, '| danau water:', triDanau.length, '| kolam water:', triKolam.length);
console.log('Y Roads:', JSON.stringify(yRoads), '| Sidewalks:', JSON.stringify(ySide), '| Markings:', JSON.stringify(yMark));

function rotY(a, p) { const c = Math.cos(a), s = Math.sin(a); return [c * p[0] + s * p[2], p[1], -s * p[0] + c * p[2]]; }
function worldBBox(inst) {
  const L = local[inst.file];
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const cx of [L.min[0], L.max[0]]) for (const cy of [L.min[1], L.max[1]]) for (const cz of [L.min[2], L.max[2]]) {
    let p = [cx * inst.s, cy * inst.s, cz * inst.s];
    p = rotY(inst.mry, p);
    p = [p[0] + inst.ox, p[1] + inst.oy, p[2] + inst.oz];
    p = rotY(inst.ry, p);
    p = [p[0] + inst.x, p[1] + inst.y, p[2] + inst.z];
    for (let k = 0; k < 3; k++) { if (p[k] < mn[k]) mn[k] = p[k]; if (p[k] > mx[k]) mx[k] = p[k]; }
  }
  return { minX: mn[0], maxX: mx[0], minY: mn[1], maxY: mx[1], minZ: mn[2], maxZ: mx[2] };
}
const rows = I.map(inst => {
  const b = worldBBox(inst);
  return { file: inst.file, label: inst.label, kat: inst.kat, x: inst.x, y: inst.y, z: inst.z, ry: +inst.ry.toFixed(4), scale: inst.s, tampil: inst.tampil, loader_line: inst.line, note: inst.note, ...Object.fromEntries(Object.entries(b).map(([k, v]) => [k, +v.toFixed(3)])) };
});
// prosedural solid + permukaan ikut ke daftar uji (dengan flag prosedural)
for (const p of P) rows.push({ file: '(prosedural)', label: p.label, kat: p.kat, x: p.cx ?? (p.minX + p.maxX) / 2, y: p.minY, z: p.cz ?? (p.minZ + p.maxZ) / 2, ry: 0, scale: 1, tampil: true, loader_line: p.line, note: p.note, minX: p.minX, maxX: p.maxX, minY: p.minY, maxY: p.maxY, minZ: p.minZ, maxZ: p.maxZ, bentuk: p.bentuk, solid: p.solid, cx: p.cx, cz: p.cz, r0: p.r0, r1: p.r1 });
const R3 = (v) => Math.round(v * 1000) / 1000;
writeFileSync(join(DIR, 'bbox.json'), JSON.stringify(rows.map(r => ({
  file: r.file, label: r.label, kat: r.kat, x: R3(r.x), y: R3(r.y), z: R3(r.z), ry: r.ry, scale: r.scale,
  minX: r.minX, maxX: r.maxX, minY: r.minY, maxY: r.maxY, minZ: r.minZ, maxZ: r.maxZ,
  tampil: r.tampil, loader_line: r.loader_line, note: r.note || undefined
})), null, 1));
console.log('instansi di bbox.json:', rows.length, '(GLB:', I.length, '| prosedural:', P.length, ')');

// ---------- uji tabrakan AABB (padat vs padat) ----------
const SOLID_KAT = new Set(['gedung', 'sekolah', 'toko', 'rumah', 'menara', 'rekreasi', 'pasar', 'perabot', 'vegetasi', 'pagar']);
const EXCLUDE_AABB = new Set(['Sungai', 'Danau', 'Kolam Renang', 'Jalan Raya']);
const solids = rows.filter(r => r.tampil && !EXCLUDE_AABB.has(r.label) && (r.file === '(prosedural)' ? r.solid : (SOLID_KAT.has(r.kat) || r.kat === 'air')));
console.log('objek padat diuji tabrakan:', solids.length);
function xzOverlap(a, b) {
  const ox = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const oz = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  if (ox <= 0 || oz <= 0) return null;
  return { ox, oz, area: ox * oz };
}
function yOverlap(a, b) { return Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY); }
function klasifikasi(a, b) {
  const k = [a.kat, b.kat].sort().join('+');
  if ((a.kat === 'gedung' || a.kat === 'sekolah') && (b.kat === 'gedung' || b.kat === 'sekolah')) return 'gedung-gedung';
  if (a.kat === 'gedung' || b.kat === 'gedung' || a.kat === 'sekolah' || b.kat === 'sekolah') return 'gedung-lain';
  if (a.kat === 'toko' || b.kat === 'toko') return 'toko-lain';
  if (a.kat === 'menara' || b.kat === 'menara') return 'menara-lain';
  if (a.kat === 'rumah' || b.kat === 'rumah') return 'rumah-lain';
  if (a.kat === 'vegetasi' && b.kat === 'vegetasi') return 'vegetasi-vegetasi';
  if (a.kat === 'perabot' || b.kat === 'perabot') return 'perabot-lain';
  if (a.kat === 'pagar' || b.kat === 'pagar') return 'pagar-lain';
  return k;
}
const tabrakan = [];
for (let i = 0; i < solids.length; i++) for (let j = i + 1; j < solids.length; j++) {
  const a = solids[i], b = solids[j];
  const o = xzOverlap(a, b);
  if (!o || o.area <= 0.01) continue;
  const oy = yOverlap(a, b);
  if (oy <= 0.05) continue; // tidak berbagi ruang Y (mis. kanopi di atas jalan)
  const pen = Math.min(o.ox, o.oz);
  let sev = 'RINGAN';
  const besar = (a.kat === 'gedung' || a.kat === 'sekolah' || a.kat === 'toko' || a.kat === 'rumah' || a.kat === 'menara');
  const besarB = (b.kat === 'gedung' || b.kat === 'sekolah' || b.kat === 'toko' || b.kat === 'rumah' || b.kat === 'menara');
  if (o.area > 10 || (besar && besarB && o.area > 1)) sev = 'KRITIS';
  else if (o.area > 1) sev = 'SEDANG';
  if (a.kat === 'vegetasi' && b.kat === 'vegetasi') sev = 'RINGAN';
  tabrakan.push({ a: a.label, b: b.label, ka: a.kat, kb: b.kat, area: +o.area.toFixed(2), pen: +pen.toFixed(2), yov: +oy.toFixed(2), klas: klasifikasi(a, b), sev, ax: (a.minX + a.maxX) / 2, az: (a.minZ + a.maxZ) / 2, bx: (b.minX + b.maxX) / 2, bz: (b.minZ + b.maxZ) / 2 });
}
tabrakan.sort((p, q) => q.area - p.area);
// Sambungan modul pagar tiang (rel masuk ke tiang berikut, 0,02 m² per
// sambungan, BY DESIGN dari geometri modul) — dikeluarkan dari daftar
// utama supaya tidak menenggelamkan temuan beneran; diringkas jadi 1 baris.
const sambunganPagar = tabrakan.filter(t => t.a === 'Pagar Tiang Sekolah' && t.b === 'Pagar Tiang Sekolah' && t.area <= 0.05);
for (let i = tabrakan.length - 1; i >= 0; i--) {
  const t = tabrakan[i];
  if (t.a === 'Pagar Tiang Sekolah' && t.b === 'Pagar Tiang Sekolah' && t.area <= 0.05) tabrakan.splice(i, 1);
}
// Artefak AABB: pasangan yang AABB-nya tumpang tapi SEGITIGA-nya tidak
// bersentuhan sama sekali (diverifikasi uji segitiga-vs-segitiga,
// sampling grid 0,05–0,1 m, 2026-11-09). Dikeluarkan dari daftar tabrakan
// utama; dicatat di §1b dengan angka verifikasinya. Kunci: pasangan label
// (urutan bebas); untuk pohon, posisi instansi pohon harus cocok.
const ARTEFAK = [
  { a: 'Gedung G04', b: 'Air Mancur Plaza (Blender)', ket: 'uji segitiga grid 0,1 m (10.201 titik): 0 tumpang; verteks G04 terdekat r=1,89 m di y=3,30 — di ATAS puncak mancur 2,48 m; iris G04 di y=0,1–0,5 berjarak 13,74 m dari basin' },
  { a: 'Gedung G04', b: 'Bangku Plaza 2', ket: 'uji segitiga grid 0,05 m: 0 tumpang; iris G04 di y=0,1–0,5 berjarak 11,57 m dari bangku' },
  { a: 'Gedung G04', b: 'Bangku Plaza 3', ket: 'uji segitiga grid 0,05 m: 0 tumpang; iris G04 di y=0,1–0,5 berjarak 10,72 m dari bangku' },
  { a: 'Gedung G10', b: 'Toko Kopi Senja', ket: 'uji segitiga grid 0,05 m (1.530 titik): 0 tumpang — hanya sudut AABB yang bersentuhan' },
  { a: 'Toko Buku & Kertas', b: 'Toko Bunga', ket: 'uji segitiga grid 0,1 m: 0 tumpang — geometri toko menyusut di tepi, AABB membesar' },
  { a: 'Gedung G09', b: 'Pohon Bingkai Menara', px: 12, pz: -21, ket: 'uji segitiga grid 0,1 m: 0 tumpang — pohon berdiri di lekuk/setback tapak G09' },
  { a: 'Menara Utara 3', b: 'Pohon Plaza Utara', px: 6.44, pz: -115.71, ket: 'uji segitiga grid 0,1 m: 0 tumpang — pohon di dalam AABB menara tapi di luar geometri menara' },
  { a: 'Menara Utara 6', b: 'Pohon Plaza Utara', px: -8.82, pz: -96.14, ket: 'uji segitiga grid 0,1 m: 0 tumpang — pohon di dalam AABB menara tapi di luar geometri menara' },
  { a: 'Air Mancur Plaza (Blender)', b: 'Bangku Plaza 3', ket: 'uji segitiga grid 0,1 m: 0 tumpang — piringan mancur r=5,0 m, sudut bangku terdekat r≈5,07 m' },
  { a: 'Air Mancur Plaza (Blender)', b: 'Bangku Plaza 6', ket: 'uji segitiga grid 0,1 m: 0 tumpang — piringan mancur r=5,0 m, sudut bangku terdekat r≈5,07 m' },
  { a: 'Gedung Perpustakaan', b: 'Pohon T2 (prosedural)', px: -232, pz: 52, ket: 'uji disc r=1,0 m grid 0,05 m (1.264 titik): 0 tumpang — pohon di luar dinding perpustakaan' },
  { a: 'Gedung Perpustakaan', b: 'Pohon T2 (prosedural)', px: -224, pz: 52, ket: 'uji disc r=1,0 m grid 0,05 m (1.264 titik): 0 tumpang — pohon di luar dinding perpustakaan' },
  { a: 'Toko Roti & Kopi', b: 'Bangku City Walk 1', ket: 'uji segitiga grid 0,1 m: 0 tumpang — bangku di depan toko, hanya AABB yang bersentuhan' },
  { a: 'Gedung G04', b: 'Lampu Plaza (prosedural)', px: -6.16, pz: 14.98, ket: 'Fase B (posisi baru (-15,37,4)): uji segitiga 0,00 m2; celah nyata >=5,9 m dari tiang lampu' },
  { a: 'Gedung Utama Sekolah', b: 'Lampu Sekolah T2', px: -218, pz: 51, ket: 'uji segitiga grid 0,1 m: 0 tumpang — tiang lampu di luar dinding sekolah' },
  { a: 'Gerobak Pasar 2', b: 'Kios Pasar 14', ket: 'uji segitiga grid 0,1 m: 0 tumpang — gerobak di depan kios, hanya AABB yang bersentuhan' },
  { a: 'Gerobak Pasar 1', b: 'Kios Pasar 3', ket: 'uji segitiga grid 0,1 m: 0 tumpang — gerobak di depan kios, hanya AABB yang bersentuhan' },
  { a: 'Gerobak Pasar 2', b: 'Kios Pasar 12', ket: 'uji segitiga grid 0,1 m: 0 tumpang — gerobak di depan kios, hanya AABB yang bersentuhan' },
  { a: 'Toko Mainan', b: 'Lampu Boulevard z=-64', ket: 'uji segitiga grid 0,1 m: 0 tumpang — tiang lampu di luar dinding toko' },
  { a: 'Toko Es Krim', b: 'Lampu Boulevard z=-40', ket: 'uji segitiga grid 0,1 m: 0 tumpang — tiang lampu di luar dinding toko' },
];
const artefakAABB = [];
for (let i = tabrakan.length - 1; i >= 0; i--) {
  const t = tabrakan[i];
  const hit = ARTEFAK.find(f => {
    const lab = (f.a === t.a && f.b === t.b) || (f.a === t.b && f.b === t.a);
    if (!lab) return false;
    if (f.px === undefined) return true;
    const cx = f.b === t.a ? t.ax : t.bx, cz = f.b === t.a ? t.az : t.bz;
    return Math.abs(cx - f.px) < 1 && Math.abs(cz - f.pz) < 1;
  });
  if (hit) { artefakAABB.push({ ...t, ket: hit.ket }); tabrakan.splice(i, 1); }
}
console.log('pasangan diuji:', solids.length * (solids.length - 1) / 2, '| tabrakan:', tabrakan.length, '| sambungan pagar (dikelompokkan):', sambunganPagar.length, '| artefak AABB:', artefakAABB.length);

// ---------- uji tembus: titik-di-segitiga (sampling grid) ----------
function indexTris(tris, cell = 5) {
  const g = new Map();
  for (const t of tris) {
    const x0 = Math.floor(Math.min(t.a[0], t.b[0], t.c[0]) / cell), x1 = Math.floor(Math.max(t.a[0], t.b[0], t.c[0]) / cell);
    const z0 = Math.floor(Math.min(t.a[2], t.b[2], t.c[2]) / cell), z1 = Math.floor(Math.max(t.a[2], t.b[2], t.c[2]) / cell);
    for (let gx = x0; gx <= x1; gx++) for (let gz = z0; gz <= z1; gz++) {
      const k = gx + ',' + gz; if (!g.has(k)) g.set(k, []); g.get(k).push(t);
    }
  }
  return { g, cell };
}
function inTri2D(px, pz, t) {
  const [ax, az] = [t.a[0], t.a[2]], [bx, bz] = [t.b[0], t.b[2]], [cx, cz] = [t.c[0], t.c[2]];
  const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
  if (Math.abs(d) < 1e-12) return false;
  const w1 = ((bz - cz) * (px - cx) + (cx - bx) * (pz - cz)) / d;
  const w2 = ((cz - az) * (px - cx) + (ax - cx) * (pz - cz)) / d;
  const w3 = 1 - w1 - w2;
  return w1 >= -1e-9 && w2 >= -1e-9 && w3 >= -1e-9;
}
function sampleInside(obj, idxTris, step0 = 0.5, maxSamples = 2500) {
  const w = obj.maxX - obj.minX, d = obj.maxZ - obj.minZ;
  let step = step0;
  while ((w / step + 1) * (d / step + 1) > maxSamples) step *= 1.5;
  let inside = 0, total = 0, maxY = -1e9;
  for (let x = obj.minX + step / 2; x < obj.maxX; x += step) for (let z = obj.minZ + step / 2; z < obj.maxZ; z += step) {
    total++;
    const k = Math.floor(x / idxTris.cell) + ',' + Math.floor(z / idxTris.cell);
    const cands = idxTris.g.get(k) || [];
    for (const t of cands) if (inTri2D(x, z, t)) { inside++; if (t.maxY > maxY) maxY = t.maxY; break; }
  }
  return { inside, total, step, area: inside * step * step, surfMaxY: maxY === -1e9 ? null : maxY };
}
const idxJalan = indexTris(triJalan), idxSungai = indexTris(triSungai), idxDanau = indexTris(triDanau), idxKolam = indexTris(triKolam);
const tembus = [];
function ujiPermukaan(obj, idx, namaPermukaan, klas) {
  const r = sampleInside(obj, idx);
  if (r.inside === 0) return;
  tembus.push({ obj: obj.label, kat: obj.kat, permukaan: namaPermukaan, klas, area: +r.area.toFixed(2), titik: r.inside + '/' + r.total, objMinY: +obj.minY.toFixed(2), objMaxY: +obj.maxY.toFixed(2), surfMaxY: r.surfMaxY === null ? null : +r.surfMaxY.toFixed(2), sev: '' });
}
for (const o of solids) {
  if (o.label === 'Jalan Raya') continue;
  ujiPermukaan(o, idxJalan, 'jalan-raya (Roads)', 'objek-jalan');
  ujiPermukaan(o, idxSungai, 'air sungai (sungai_water)', 'objek-air');
  ujiPermukaan(o, idxDanau, 'air danau (water)', 'objek-air');
  ujiPermukaan(o, idxKolam, 'air kolam (Kolam_Water)', 'objek-air');
}
// sungai/danau/kolam sendiri vs jalan-raya (sungai memotong jalan?)
for (const w of rows.filter(r => ['Sungai', 'Danau', 'Kolam Renang'].includes(r.label))) {
  ujiPermukaan(w, idxJalan, 'jalan-raya (Roads)', 'air-jalan');
}
// cincin jalan lingkar / trotoar / plaza (uji radial, sampling 0,5 m)
function sampleRadial(obj, test) {
  const w = obj.maxX - obj.minX, d = obj.maxZ - obj.minZ;
  let step = 0.5;
  while ((w / step + 1) * (d / step + 1) > 2500) step *= 1.5;
  let inside = 0, total = 0;
  for (let x = obj.minX + step / 2; x < obj.maxX; x += step) for (let z = obj.minZ + step / 2; z < obj.maxZ; z += step) {
    total++; if (test(x, z)) inside++;
  }
  return { area: inside * step * step, inside, total };
}
const r2 = (x, z, cx, cz) => Math.hypot(x - cx, z - cz);
for (const o of solids) {
  if (o.kat === 'perabot' || o.kat === 'vegetasi') {
    const rr = sampleRadial(o, (x, z) => { const r = r2(x, z, 0, 0); return r >= 14 && r <= 20.5; });
    if (rr.area > 0.01) tembus.push({ obj: o.label, kat: o.kat, permukaan: 'jalan lingkar (r 14–20,5)', klas: 'objek-jalan', area: +rr.area.toFixed(2), titik: rr.inside + '/' + rr.total, objMinY: +o.minY.toFixed(2), objMaxY: +o.maxY.toFixed(2), surfMaxY: 0.02, sev: '' });
  } else {
    const rr = sampleRadial(o, (x, z) => { const r = r2(x, z, 0, 0); return r >= 14 && r <= 20.5; });
    if (rr.area > 0.01) tembus.push({ obj: o.label, kat: o.kat, permukaan: 'jalan lingkar (r 14–20,5)', klas: 'gedung-jalan', area: +rr.area.toFixed(2), titik: rr.inside + '/' + rr.total, objMinY: +o.minY.toFixed(2), objMaxY: +o.maxY.toFixed(2), surfMaxY: 0.02, sev: '' });
    const rt = sampleRadial(o, (x, z) => { const r = r2(x, z, 0, 0); return r >= 13.2 && r <= 14; });
    if (rt.area > 0.01) tembus.push({ obj: o.label, kat: o.kat, permukaan: 'trotoar plaza (r 13,2–14)', klas: 'gedung-trotoar', area: +rt.area.toFixed(2), titik: rt.inside + '/' + rt.total, objMinY: +o.minY.toFixed(2), objMaxY: +o.maxY.toFixed(2), surfMaxY: 0.04, sev: '' });
  }
}
// laut: sampling tapak — titik di luar SEMUA daratan (daftar daratan =
// dalamArea() + mesh daratan5/lobus; lubang air danau (-180,-20)
// elips 23x18 BUKAN daratan). Hanya objek yang alasnya menyentuh/
// di bawah permukaan laut (minY < 0,02) yang dihitung.
const DI_DARAT = [
  (x, z) => Math.hypot(x, z) <= 60,
  (x, z) => Math.hypot(x - 40, z - 40) <= 25,
  (x, z) => x >= -85 && x <= 85 && z >= 135 && z <= 225,
  (x, z) => Math.hypot(x, z + 100) <= 34,
  (x, z) => Math.hypot(x, z + 225) <= 68,
  (x, z) => Math.hypot(x - 46, z) <= 26,
  (x, z) => Math.hypot(x - 3.5, z + 58) <= 32,
  (x, z) => (x / 48) * (x / 48) + ((z - 62) / 21) * ((z - 62) / 21) <= 1,
  (x, z) => Math.hypot(x + 88, z - 98) <= 14,
  (x, z) => x >= -250 && x <= -71 && z >= -61 && z <= 91 && (((x + 180) / 23) * ((x + 180) / 23) + ((z + 20) / 18) * ((z + 20) / 18) > 1),
  (x, z) => x >= -71.5 && x <= -38 && z >= 8 && z <= 80,
  (x, z) => x >= -71.5 && x <= -44 && z >= -60 && z <= -8,
  (x, z) => x >= 60 && x <= 245 && z >= -165 && z <= -15,
  (x, z) => x >= 46 && x <= 62 && z >= -42 && z <= -6,
  (x, z) => x >= 28 && x <= 80 && z >= -138 && z <= -92,
  (x, z) => x >= -45 && x <= 45 && z >= -210 && z <= -128,
  (x, z) => x >= -203 && x <= -157 && z >= -38 && z <= -2, // tanah diorama danau GLB (pindah ke (-180,-20))
  (x, z) => Math.hypot(x + 38, z - 72) <= 9.5,              // gundukan mercu
  (x, z) => Math.hypot(x - 37, z - 37) <= 17.5,             // bukit taman
];
for (const o of solids) {
  if (o.minY >= 0.02) continue;
  const w = o.maxX - o.minX, d = o.maxZ - o.minZ;
  let step = 0.5;
  while ((w / step + 1) * (d / step + 1) > 2500) step *= 1.5;
  let inside = 0, total = 0;
  for (let x = o.minX + step / 2; x < o.maxX; x += step) for (let z = o.minZ + step / 2; z < o.maxZ; z += step) {
    total++; if (!DI_DARAT.some(f => f(x, z))) inside++;
  }
  const area = inside * step * step;
  if (area > 0.01) {
    tembus.push({ obj: o.label, kat: o.kat, permukaan: 'laut (y=-0,45)', klas: 'objek-laut', area: +area.toFixed(2), titik: inside + '/' + total + ' titik tapak di luar daratan', objMinY: +o.minY.toFixed(2), objMaxY: +o.maxY.toFixed(2), surfMaxY: -0.45, sev: '' });
  }
}
// severitas tembus
for (const t of tembus) {
  const jembatan = t.obj.startsWith('Jembatan Batu');
  const lampu = t.obj.startsWith('Lampu');
  const perahu = t.obj.startsWith('Perahu');
  if (jembatan && t.permukaan.startsWith('air sungai')) t.sev = 'DIHARAPKAN';
  else if (perahu && t.permukaan.startsWith('laut')) t.sev = 'DIHARAPKAN';
  else if (lampu && t.permukaan.startsWith('jalan lingkar')) t.sev = 'RINGAN';
  else if (t.area > 10) t.sev = 'KRITIS';
  else if (t.area > 1) t.sev = 'SEDANG';
  else t.sev = 'RINGAN';
}
tembus.sort((a, b) => b.area - a.area);
console.log('tembus (permukaan):', tembus.length);

// ---------- dobel (file + posisi x,z sama persis) ----------
const dobel = [];
{
  const g = new Map();
  for (const r of rows.filter(r => r.tampil && r.file !== '(prosedural)')) { // GLB saja: prosedural berbagi pusat (pulau/plaza) bukan dobel
    const k = r.file + '|' + r.x.toFixed(3) + ',' + r.z.toFixed(3);
    if (!g.has(k)) g.set(k, []); g.get(k).push(r);
  }
  for (const [k, v] of g) if (v.length > 1) dobel.push({ key: k, file: v[0].file, x: v[0].x, z: v[0].z, jumlah: v.length, label: v.map(x => x.label).join(' / ') });
}
console.log('dobel:', dobel.length);

// ---------- z-fighting dalam GLB (pakai lumina-audit-glb.mjs) ----------
const zfight = [];
const zFiles = [...uniqueFiles, 'awan-blender-v1.glb'];
for (const f of zFiles) {
  try {
    const out = execFileSync('node', [AUDIT_GLB, join(LUMINA, f)], { encoding: 'utf8', timeout: 120000 });
    const mZ = out.match(/z-fight planes with real overlap: (\d+)/);
    const mF = out.match(/FLIPPED \(dot<0\): (\d+) \(([\d.]+)%\)/);
    const mB = out.match(/bbox min: ([-\d.,]+) max: ([-\d.,]+)/);
    const zLines = [...out.matchAll(/ZFIGHT n=\[([^\]]+)\] d=([-\d.]+) pairs=(\d+) ovArea=([\d.]+)m2 meshes=(\d+) at \(([^)]+)\)/g)].slice(0, 3)
      .map(m => ({ n: m[1], d: +m[2], pairs: +m[3], area: +m[4], meshes: +m[5], at: m[6] }));
    zfight.push({ file: f, zPlanes: mZ ? +mZ[1] : null, flipped: mF ? +mF[1] : null, flippedPct: mF ? +mF[2] : null, top: zLines });
  } catch (e) { zfight.push({ file: f, error: String(e.message || e).slice(0, 120) }); }
}
const zTotal = zfight.reduce((s, z) => s + (z.zPlanes || 0), 0);
const flipTotal = zfight.reduce((s, z) => s + (z.flipped || 0), 0);
console.log('z-fight planes total:', zTotal, '| flipped tris total:', flipTotal);

// ---------- z-fighting antar-permukaan tanah (selisih Y < 2 cm, footprint tumpang) ----------
const TANAH = P.filter(p => ['tanah', 'plaza', 'jalan'].includes(p.kat));
const zAntar = [];
for (let i = 0; i < TANAH.length; i++) for (let j = i + 1; j < TANAH.length; j++) {
  const a = TANAH[i], b = TANAH[j];
  const ox = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const oz = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  if (ox <= 0 || oz <= 0) continue;
  const dy = Math.abs(a.minY - b.minY);
  if (dy < 0.02) zAntar.push({ a: a.label, b: b.label, dy: +(dy * 1000).toFixed(1), areaAABB: +(ox * oz).toFixed(1) });
}
console.log('pasangan permukaan tanah <2cm:', zAntar.length, '| gap Roads/Sidewalks/Markings Y:', JSON.stringify({ roads: yRoads, sidewalks: ySide, markings: yMark }));

// ---------- tulis geometri.md ----------
const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
const nGLB = I.length, nProc = P.length;
const byKlas = {};
for (const t of tabrakan) byKlas[t.klas] = (byKlas[t.klas] || 0) + 1;
const bySev = {};
for (const t of tabrakan) bySev[t.sev] = (bySev[t.sev] || 0) + 1;
const bySevT = {};
for (const t of tembus) bySevT[t.sev] = (bySevT[t.sev] || 0) + 1;
const fmt = (v) => typeof v === 'number' ? v.toFixed(2) : v;
let md = `# Audit Geometri Kota Lumina — temuan bernomor\n\n` +
`**Sumber:** \`~/workspace/lumina/index.html\` — 8.256 baris, MD5 \`${md5}\` (dicek skrip, cocok dengan acuan).\n` +
`**Waktu audit:** ${now} (WITA, Asia/Makassar). **Skrip:** \`audit-geometri.mjs\` (di direktori ini, bisa diulang).\n` +
`**Cakupan:** SEMUA objek kota yang ditempatkan (GLB + prosedural). DI LUAR cakupan: karakter (\`karakter-*\`, \`klip-cewek-*\`), debug overlay, MQTT, \`water.js\` (kecuali permukaan air sebagai pembanding).\n\n` +
`## Ringkasan statistik (semua angka hasil hitung, bukan perkiraan)\n\n` +
`- Instansi diukur: **${rows.length}** (GLB ${nGLB} + prosedural ${nProc}); file GLB unik ditempatkan: **${uniqueFiles.length}** (+ awan = ${zFiles.length} diaudit z-fight).\n` +
`- Pasangan padat-vs-padat diuji (AABB XZ + Y): **${solids.length * (solids.length - 1) / 2}** dari ${solids.length} objek padat.\n` +
`- Tabrakan (tumpang XZ > 0,01 m² DAN tumpang Y > 0,05 m): **${tabrakan.length}** — KRITIS ${bySev.KRITIS || 0}, SEDANG ${bySev.SEDANG || 0}, RINGAN ${bySev.RINGAN || 0}. (Di luar itu: ${sambunganPagar.length} sambungan modul pagar tiang, masing-masing ~0,02 m² rel-masuk-tiang BY DESIGN — diringkas di akhir §1, bukan dihitung sebagai tabrakan; dan ${artefakAABB.length} artefak AABB — AABB tumpang tapi segitiga 0,00 m² pada uji segitiga, lihat §1b.)\n` +
`- Per klasifikasi tabrakan: ${Object.entries(byKlas).map(([k, v]) => `${k} ${v}`).join(', ') || '—'}.\n` +
`- Tembus permukaan (sampling grid 0,5 m terhadap segitiga jalan/air + uji radial cincin): **${tembus.length}** — KRITIS ${bySevT.KRITIS || 0}, SEDANG ${bySevT.SEDANG || 0}, RINGAN ${bySevT.RINGAN || 0}, DIHARAPKAN ${bySevT.DIHARAPKAN || 0}.\n` +
`- Dobel (file + posisi x,z sama persis): **${dobel.length}**.\n` +
`- Z-fighting dalam GLB (plane-hash normal-aware, \`lumina-audit-glb.mjs\`): **${zTotal} bidang** dengan tumpang nyata; segitiga winding terbalik (dot<0): **${flipTotal}**.\n` +
`- Pasangan permukaan tanah sebidang (< 2 cm, footprint tumpang): **${zAntar.length}**.\n` +
`- Tabrakan terparah: ${tabrakan[0] ? `${tabrakan[0].a} × ${tabrakan[0].b} — ${tabrakan[0].area} m²` : '—'}.\n\n` +
`## Cara baca\n\n` +
`- **KRITIS** = dua bangunan/objek besar saling menembus (atau objek besar di tengah jalan/air).\n` +
`- **SEDANG** = tumpang 1–10 m² antar objek padat, atau objek kecil di tengah jalan/air.\n` +
`- **RINGAN** = tumpang < 1 m², kanopi pohon bersinggungan, atau lampu/bangku di tepi jalan (sering disengaja).\n` +
`- **DIHARAPKAN** = jembatan di atas sungai / perahu di laut — dicatat supaya tidak dikira tembus.\n` +
`- AABB = kotak pembatas sumbu-sejajar dari bbox dunia (sudut terluar setelah rotasi). Luas tumpang = luas irisan AABB di bidang XZ. Untuk jalan/air yang bentuknya bukan persegi, luas tembus dihitung dari sampling titik-di-segitiga (grid 0,5 m), bukan dari AABB jalan (AABB jalan-raya 177,7 × 291 m akan menuduh semua yang di dalamnya).\n` +
`- Pohon/pinus acak (Math.random) tidak punya posisi tetap per load — lihat §5.\n\n` +
`## 1. Tabrakan (AABB)\n\n`;
tabrakan.forEach((t, i) => {
  md += `### G${i + 1} — ${t.sev} — ${t.a} × ${t.b}\n\n- Klasifikasi: ${t.klas} (${t.ka} × ${t.kb}). Luas tumpang XZ: **${fmt(t.area)} m²**. Penetrasi (sisi AABB tersempit): **${fmt(t.pen)} m**. Tumpang Y: ${fmt(t.yov)} m.\n- Pusat A di (${fmt(t.ax)}, ${fmt(t.az)}), pusat B di (${fmt(t.bx)}, ${fmt(t.bz)}).\n\n`;
});
if (sambunganPagar.length) {
  const tot = sambunganPagar.reduce((s, t) => s + t.area, 0);
  md += `### Sambungan modul pagar tiang sekolah (dikelompokkan — BY DESIGN, bukan tabrakan)\n\n- ${sambunganPagar.length} sambungan modul berurutan, masing-masing tumpang AABB ~0,02 m² (total ~${tot.toFixed(2)} m²): rel modul (panjang 2,10 m, jarak modul 2,105 m) masuk 0,105 m ke tiang modul berikut (tiang lebar 0,22 m). Geometri modul memang dirancang begitu (rel menancap ke tiang). Tidak dihitung sebagai tabrakan.\n\n`;
}
if (artefakAABB.length) {
  md += `### Artefak AABB — AABB tumpang, segitiga TIDAK bersentuhan (bukan tabrakan)\n\nAABB kotak membesar di sudut/tepi; ${artefakAABB.length} pasangan di bawah tumpang menurut AABB tapi **0,00 m²** pada uji segitiga-vs-segitiga (sampling grid 0,05–0,1 m, 2026-11-09). Dikeluarkan dari daftar tabrakan utama.\n\n`;
  artefakAABB.forEach((t, i) => {
    md += `- **A${i + 1} — ${t.a} × ${t.b}**: AABB menuduh ${fmt(t.area)} m². ${t.ket}.\n`;
  });
  md += `\n**Kalibrasi AABB vs segitiga (pasangan NYATA yang ikut diuji segitiga — luas segitiga vs luas AABB):** Roti×Kopi 31,14 vs 32,10 m²; Roti×Buku 20,34 vs 23,12; Es Krim×Studio 14,31 vs 19,06; Studio×Teh 8,58 vs 8,96; Teh×Mainan 12,58 vs 13,74; G07×Kios 8 13,96 vs 9,77 (segitiga LEBIH BESAR — AABB kios miring mengecilkan irisan); G08×Kios 7 4,32 vs 14,45; Aula×Pohon T2 0,58 vs 4,00; Kopi Senja×Bangku CW1 0,56 vs 0,54; Kios 1×Lampu Plaza 0,39 vs 0,36; Kios 2×Lampu Plaza 0,39 vs 0,36; Perpustakaan×Bangku T2 0,11 vs 0,58. Pola: AABB biasanya melebihkan 10–70% untuk geometri non-kotak; pengecualian G07×Kios 8 di mana AABB justru mengecilkan.\n\n`;
}
md += `## 2. Tembus permukaan (jalan / air / cincin)\n\n`;
tembus.forEach((t, i) => {
  md += `### T${i + 1} — ${t.sev} — ${t.obj} × ${t.permukaan}\n\n- Klasifikasi: ${t.klas}. Luas tembus (sampling): **${fmt(t.area)} m²** (titik di dalam: ${t.titik}). Objek Y ${fmt(t.objMinY)}..${fmt(t.objMaxY)} m; permukaan maks Y ${t.surfMaxY === null ? '—' : fmt(t.surfMaxY) + ' m'}.\n\n`;
});
md += `## 3. Dobel (objek ganda di titik yang sama)\n\n`;
if (dobel.length === 0) md += `Tidak ada pasangan file + posisi (x,z) yang sama persis.\n\n`;
else dobel.forEach((d, i) => { md += `- D${i + 1} — ${d.file} di (${d.x}, ${d.z}): ${d.jumlah}× — ${d.label}.\n`; });
md += `\n## 4. Z-fighting\n\n### 4a. Di dalam tiap GLB (lumina-audit-glb.mjs — plane-hash, normal-aware)\n\n| File | Bidang z-fight | Segitiga terbalik (dot<0) | Bidang terparah (luas tumpang) |\n|---|---|---|---|\n`;
for (const z of zfight) {
  const top = z.top && z.top[0] ? z.top[0].area.toFixed(3) + ' m² (' + z.top[0].pairs + ' pasang, n=[' + z.top[0].n + '])' : '—';
  md += `| ${z.file} | ${z.zPlanes ?? 'ERR'} | ${z.flipped ?? '?'} (${z.flippedPct ?? '?'}%) | ${z.error ? 'ERR: ' + z.error : top} |\n`;
}
md += `\n### 4b. Antar-permukaan tanah (selisih Y < 2 cm, footprint AABB tumpang)\n\n`;
if (zAntar.length === 0) md += `Tidak ada pasangan permukaan tanah dengan selisih < 2 cm.\n\n`;
else zAntar.forEach((z, i) => { md += `- Z${i + 1} — ${z.a} × ${z.b}: selisih Y **${z.dy} mm**, luas AABB tumpang ~${z.areaAABB} m².\n`; });
md += `\n### 4c. Lapisan jalan-raya GLB (node Y)\n\n- Roads Y ${yRoads.min.toFixed(3)}..${yRoads.max.toFixed(3)} m; Sidewalks Y ${ySide.min.toFixed(3)}..${ySide.max.toFixed(3)} m; Markings Y ${yMark.min.toFixed(3)}..${yMark.max.toFixed(3)} m.\n- Gap Markings–Roads: ${(yMark.min - yRoads.max).toFixed(3)} m (marking di atas jalan). Gap Sidewalks–Roads: ${(ySide.min - yRoads.max).toFixed(3)} m.\n\n` +
`## 5. Yang TIDAK bisa diukur dari kode (posisi berubah tiap load)\n\n` +
`- **Pohon kota (30)**: loop baris 1768–1795, posisi acak annulus r 23,5–54,5 m di sekitar (0,0), dijauhi dari penabrak (jarak > r+1,6 m), Taman Bukit, jalan dermaga, lorong Pasar Malam, lobus pasar, boulevard, Pantai Selatan, gundukan mercu. Skala/rotasi dari acakAset (tetap). **Fase C+D: penempatan pohon kota/padang/hutan/awan seeded (acakVeg, mulberry32 seed 20261040, aliran terpisah) + zona larangan kios/jalan/lapangan/rumah.**\n` +
`- **Pohon/pinus padang (76)**: baris 4636–4655, x −246..−80, z −56..86, dijauhi sekolah/peternakan/rute. **Hutan pinus (±232)**: baris 5424–, x 84..242, z −162..−18, dijauhi rute hutan + titik (170,−90) r 15.\n` +
`- **Awan (9)**: baris 5889–5898, posisi/ukuran/kecepatan acak penuh, y 42–72 m (di atas segalanya — tidak mungkin bertabrakan).\n` +
`- **Kios pasar**: 8 slot baru (Fase C+D, x 23,5–38,5 z ±6,8); filter baru pakai footprint AABB G07/G08; pohon kota dijauhi <3,2 m dari slot (seeded).\n` +
`- Pohon deterministik yang terukur: 19 (bingkai menara 3 + Taman Bukit 8 + Plaza Utara 4 + peternakan 3 + Pulau Kecil 1) — skala/rotasi direplay dari RNG halaman (mulberry32, seed 20261023).\n\n` +
`## 6. Temuan non-tabrakan (dari pembacaan kode — diverifikasi barisnya)\n\n` +
`- **F1 — Air mancur plaza (Hunyuan) TIDAK TAMPIL.** \`air-mancur.glb\` baris 1087 dimuat lalu \`mancur.add(model)\`, tetapi \`scene.add(mancur)\` dikomentari di baris 965 ("FOUNTAIN REMOVED 2026-11-01"). Yang tampil di (0,0,0) adalah \`air-mancur-blender-v1.glb\` (baris 995). Instansi ini tetap dihitung di bbox.json dengan \`tampil:false\`.\n` +
`- **F2 — Lampu boulevard menumpuk di satu sisi.** Baris 3052: \`sisi = ((zl/12)%2===0) ? -1,2 : 8,2\`, zl = −28..−88 step −12 → zl/12 tidak pernah bulat genap → keenam lampu di x=8,2; sisi barat (x=−1,2) kosong. Dievaluasi dari rumus, bukan tebakan.\n` +
`- **F3 — Komentar skala gerobak ≠ kode.** Komentar baris 2818 klaim gerobak skala 1,76 dan baris ~4110 klaim gerobak es krim skala 2,1593 — tetapi callback memakai \`setScalar(1.0)\` (baris 2850 & 4151). Gerobak tampil ~57% / ~46% dari ukuran yang dikomentari (gerobak pasar 0,96 m vs 1,70 m; es krim 0,95 m vs 2,05 m).\n` +
`- **F4 — Toko lama & menara lama tetap ada sebagai fallback tersembunyi.** Bila GLB toko/menara gagal muat, kotak kode lama tampil di titik yang sama (grupLama.visible=false hanya bila GLB sukses). Bukan dobel — tapi bila GLB gagal, tapak toko lama (±kotak) ≠ tapak GLB.\n` +
`- **F5 — Fungsi \`tenda()\` perkemahan (baris 5477) tidak pernah dipanggil** — hanya tenda GLB (163,−95) & (177,−86) yang tampil. \`bangkuT2\` (4 bangku sekolah) juga prosedural murni tanpa swap GLB.\n` +
`- **F6 — Pintu aula & gym dibuka 90° oleh kode** (baris 5193–5213, 5237–5256) — daun pintu menonjol ~1,2 m ke luar tapak; bbox dihitung dari geometri GLB mentah (pintu tertutup), jadi tumpang pintu-vs-objek di depan pintu tidak tertangkap AABB ini.\n\n` +
`- **F7 — Dermaga danau tanpa air.** \`tinggiTanah()\` mengenal "dek dermaga danau" (baris 2021: x −157..−160, z ≈ −20) dan \`dalamArea()\` mem-veto lubang air di (−180,−20) r 20,8 — tetapi satu-satunya air danau yang ber-mesh adalah GLB di (−120,−40), ±60 m di timur. Dermaga + lubang jalan kaki itu tidak punya permukaan air yang terlihat. **Fase C+D: GLB danau dipindah ke (−180,−20) di bawah dermaga; air shader + cincin pasir lama dihapus.**\n` +
`- **F8 — Gedung G04 TERKUBUR (bukan salah ukur).** Bbox lokal \`gedung-g04-blender-v2.glb\` = y −14,90..4,16 m (badan/atap y −14,9..0; hanya bola balkon yang muncul sampai 4,16 m) — DIVERIFIKASI silang dengan THREE.GLTFLoader Box3 (hasil identik: min −3,20/−14,90/−30,42, max 3,20/4,16/−11,60). Di penempatan LAMA (−12,0,30) ry 5,90, ~75% volume gedung berada DI BAWAH tanah (y<0). **Fase C+D: G04 diangkat y+14,90 + geser ke (−15,37,4) — minY dunia 0,0 terverifikasi Blender; alas-di-cincin 0,00 m².** Konsekuensi: tumpang AABB G04-vs-air-mancur adalah ARTEFAK — uji segitiga-vs-segitiga (grid 0,1 m, 10.201 titik) menunjukkan NOL sentuhan antara bagian G04 di atas tanah dan air mancur (verteks G04 terdekat r=1,89 m di y=3,30 — di ATAS puncak air mancur 2,48 m). Dicatat di §1b (Artefak AABB), bukan di daftar tabrakan. Bola yang sama menembus permukaan jalan lingkar (168 segitiga memotong y=0,022 pada r 16,9–18,0 m) — lihat §2.\n\n`;
`## 7. Batasan & catatan metode\n\n` +
`- Bbox lokal GLB = semua node+mesh, KECUALI node yang disembunyikan kode halaman (jembatan kayu sungai, Ground lab) — dikeluarkan supaya tidak menuduh.\n` +
`- AABB setelah rotasi Y melebih-lebihkan tapak objek yang diputar miring (sudut AABB > tapak asli). Pasangan KRITIS/SEDANG di atas tetap perlu cek visual sebelum digeser.\n` +
`- Kanopi pohon/pinus (vegetasi) dihitung penuh — tumpang kanopi-vs-kanopi dinilai RINGAN karena lazim.\n` +
`- Jalan-raya GLB (Roads) hanya 660 segitiga: uji tembus jalan memakai segitiga aslinya, bukan AABB 177,7 × 291 m.\n` +
`- Tanah/plaza/jalan adalah permukaan: objek yang berdiri DI ATASNYA bukan tabrakan; yang diuji sebagai tembus hanya bila menembus badan jalan/air.\n` +
`- \`water.js\` (laut shader) tidak diaudit isinya; laut dipakai hanya sebagai bidang y=−0,45.\n`;
writeFileSync(join(DIR, 'geometri.md'), md);
console.log('geometri.md ditulis:', md.length, 'byte');

// ---------- peta rencana SVG ----------
const KAT_WARNA = { gedung: '#8d6e63', sekolah: '#c0392b', toko: '#2980b9', rumah: '#8e44ad', menara: '#f39c12', rekreasi: '#27ae60', air: '#3498db', jalan: '#7f8c8d', vegetasi: '#2ecc71', perabot: '#95a5a6', pasar: '#e67e22', pagar: '#6c3483', tanah: '#a8d08d', plaza: '#d9c08a' };
const tabrakSet = new Set();
for (const t of tabrakan) { tabrakSet.add(t.a + '|' + t.b); }
const pairKey = (a, b) => tabrakan.some(t => (t.a === a.label && t.b === b.label) || (t.a === b.label && t.b === a.label));
const X0 = -260, X1 = 260, Z0 = -300, Z1 = 240, S = 1.8;
const W = (X1 - X0) * S, H = (Z1 - Z0) * S;
const sx = (x) => (x - X0) * S, sz = (z) => (z - Z0) * S;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W + 20}" height="${H + 90}" viewBox="0 0 ${W + 20} ${H + 90}">\n` +
`<rect x="0" y="0" width="${W + 20}" height="${H + 90}" fill="#ffffff"/>\n` +
`<text x="10" y="24" font-family="sans-serif" font-size="17" font-weight="bold">Peta Rencana Kota Lumina — top-down (X →, Z ↓) — audit ${now}</text>\n` +
`<text x="10" y="44" font-family="sans-serif" font-size="11">Merah = pasangan tabrakan (AABB). Garis putus-putus = AABB jalan-raya GLB (177,7 × 291 m). Titik (0,0) = plaza / air mancur.</text>\n` +
`<g transform="translate(10,52)">\n<rect x="0" y="0" width="${W}" height="${H}" fill="#bcd8e8"/>\n`;
// daratan
for (const p of P.filter(p => p.kat === 'tanah' && p.bentuk === 'ellipse')) svg += `<ellipse cx="${sx(p.cx)}" cy="${sz(p.cz)}" rx="${p.r1 * S}" ry="${p.r0 * S}" fill="#a8d08d" stroke="#7ba05b"/>\n`;
for (const p of P.filter(p => p.kat === 'tanah' && p.bentuk === 'circle')) svg += `<circle cx="${sx(p.cx)}" cy="${sz(p.cz)}" r="${p.r1 * S}" fill="#a8d08d" stroke="#7ba05b"/>\n`;
for (const p of P.filter(p => p.kat === 'tanah' && p.bentuk !== 'circle')) svg += `<rect x="${sx(p.minX)}" y="${sz(p.minZ)}" width="${(p.maxX - p.minX) * S}" height="${(p.maxZ - p.minZ) * S}" fill="#a8d08d" stroke="#7ba05b"/>\n`;
// plaza + jalan lingkar + trotoar
for (const p of P.filter(p => p.kat === 'plaza')) {
  if (p.bentuk === 'circle') svg += `<circle cx="${sx(p.cx)}" cy="${sz(p.cz)}" r="${p.r1 * S}" fill="#d9c08a" stroke="#a08c5b"/>\n`;
  else svg += `<circle cx="${sx(p.cx)}" cy="${sz(p.cz)}" r="${p.r1 * S}" fill="none" stroke="#a08c5b" stroke-width="2"/>\n`;
}
svg += `<circle cx="${sx(0)}" cy="${sz(0)}" r="${20.5 * S}" fill="none" stroke="#7f8c8d" stroke-width="${6.5 * S}" opacity="0.55"/>\n`;
// jalan-raya AABB
svg += `<rect x="${sx(-123.7)}" y="${sz(-96)}" width="${177.7 * S}" height="${291 * S}" fill="none" stroke="#555" stroke-dasharray="6 4"/>\n<text x="${sx(-123.7) + 4}" y="${sz(-96) + 12}" font-family="sans-serif" font-size="10" fill="#555">AABB jalan-raya</text>\n`;
// air (sungai/danau/kolam AABB, biru muda)
for (const r of rows.filter(r => ['Sungai', 'Danau', 'Kolam Renang'].includes(r.label))) {
  svg += `<rect x="${sx(r.minX)}" y="${sz(r.minZ)}" width="${(r.maxX - r.minX) * S}" height="${(r.maxZ - r.minZ) * S}" fill="#7fb3d5" opacity="0.45" stroke="#2e86c1" stroke-dasharray="4 3"/>\n`;
}
// objek
const labelRows = rows.filter(r => r.tampil);
for (const r of labelRows) {
  const w = Math.max((r.maxX - r.minX) * S, 1.5), h = Math.max((r.maxZ - r.minZ) * S, 1.5);
  const inTabrak = tabrakan.some(t => t.a === r.label || t.b === r.label);
  const fill = KAT_WARNA[r.kat] || '#999';
  svg += `<rect x="${sx(r.minX)}" y="${sz(r.minZ)}" width="${w}" height="${h}" fill="${fill}" fill-opacity="0.75" stroke="${inTabrak ? '#ff0000' : '#333'}" stroke-width="${inTabrak ? 2.5 : 0.7}"/>\n`;
}
// garis penghubung pasangan tabrakan + nomor
tabrakan.forEach((t, i) => {
  svg += `<line x1="${sx(t.ax)}" y1="${sz(t.az)}" x2="${sx(t.bx)}" y2="${sz(t.bz)}" stroke="#ff0000" stroke-width="1.6"/>\n` +
  `<circle cx="${sx((t.ax + t.bx) / 2)}" cy="${sz((t.az + t.bz) / 2)}" r="8" fill="#ff0000"/><text x="${sx((t.ax + t.bx) / 2)}" y="${sz((t.az + t.bz) / 2) + 3.5}" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">G${i + 1}</text>\n`;
});
// label objek besar
for (const r of labelRows) {
  const area = (r.maxX - r.minX) * (r.maxZ - r.minZ);
  if (area >= 25 || ['sekolah', 'toko', 'menara', 'rumah'].includes(r.kat)) {
    svg += `<text x="${sx((r.minX + r.maxX) / 2)}" y="${sz((r.minZ + r.maxZ) / 2) + 3}" font-family="sans-serif" font-size="9" fill="#111" text-anchor="middle">${esc(r.label)}</text>\n`;
  }
}
// titik nol
svg += `<line x1="${sx(0) - 8}" y1="${sz(0)}" x2="${sx(0) + 8}" y2="${sz(0)}" stroke="#000" stroke-width="1.5"/><line x1="${sx(0)}" y1="${sz(0) - 8}" x2="${sx(0)}" y2="${sz(0) + 8}" stroke="#000" stroke-width="1.5"/>\n<text x="${sx(0) + 10}" y="${sz(0) - 8}" font-family="sans-serif" font-size="10" font-weight="bold">0,0 plaza</text>\n`;
svg += `</g>\n<g transform="translate(10,${H + 62})" font-family="sans-serif" font-size="11">\n`;
let lx = 0;
for (const [k, v] of Object.entries(KAT_WARNA)) {
  svg += `<rect x="${lx}" y="0" width="12" height="12" fill="${v}"/><text x="${lx + 15}" y="10">${esc(k)}</text>\n`;
  lx += 15 + k.length * 6.5 + 22;
}
svg += `</g>\n<text x="10" y="${H + 86}" font-family="sans-serif" font-size="11">Tabrakan: ${tabrakan.length} (KRITIS ${bySev.KRITIS || 0} / SEDANG ${bySev.SEDANG || 0} / RINGAN ${bySev.RINGAN || 0}) · Tembus: ${tembus.length} · Dobel: ${dobel.length} · Z-fight bidang: ${zTotal} · Instansi: ${rows.length}</text>\n</svg>\n`;
writeFileSync(join(DIR, 'peta-rencana.svg'), svg);
console.log('peta-rencana.svg ditulis:', svg.length, 'byte');
console.log('SELESAI. Tabrakan:', tabrakan.length, '| Tembus:', tembus.length, '| Dobel:', dobel.length, '| Z-fight bidang:', zTotal);
