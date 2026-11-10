// Replay penempatan vegetasi seeded (Fase C+D) — memutar ulang aliran acakVeg
// (mulberry32 seed 20261023, state terpisah) + filter eksplisit persis index.html,
// lalu memeriksa posisi diterima terhadap zona larangan + tapak bangunan.
// CATATAN: daftar penabrak direkonstruksi dari audit/bbox.json (entri loader_line
// < blok, r = setengah bentang maks + 0,7 — rumus push bangunan). Posisi hasil
// replay bisa berbeda dari halaman live bila penabrak aproksimasi berbeda;
// yang diverifikasi: mekanisme seed + filter menghasilkan posisi aman.
import { readFileSync } from 'fs';

const W = '/home/hatch/workspace/lumina/';
const bb = JSON.parse(readFileSync(W + 'audit/bbox.json', 'utf8'));

let _rngVeg = 20261040;
function acakVeg() {
  _rngVeg |= 0; _rngVeg = _rngVeg + 0x6D2B79F5 | 0;
  let t = Math.imul(_rngVeg ^ _rngVeg >>> 15, 1 | _rngVeg);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
/* R6 (2026-11-09) — port filter tapak nyata dari index.html (ZONA_LARANG_VEG).
   Dipakai di 3 blok di bawah, SESUDAH semua undian kandidat, supaya aliran
   acakVeg() tidak bergeser (lihat USULAN-R6-KAMERA.md §B.4). */
const ZONA_LARANG_VEG = [
  [-27.00, -14.00, 3.93, 2.99, 0.000, 8.91],
  [14.75, 19.66, 4.45, 4.72, 3.785, 13.92],
  [-23.83, 19.86, 5.05, 4.62, 5.404, 10.98],
  [-7.20, 17.89, 3.20, 9.41, 5.903, 19.06],
  [9.85, 32.42, 3.99, 4.05, 0.180, 15.77],
  [-34.54, -31.40, 5.20, 5.11, 3.797, 15.34],
  [29.72, 16.91, 5.36, 4.65, 1.249, 13.55],
  [34.57, -14.92, 3.66, 3.66, 1.903, 15.86],
  [20.71, -27.53, 5.40, 7.80, 2.504, 12.48],
  [-14.00, -33.00, 7.35, 4.90, 3.321, 8.32],
  [-9.89, -44.00, 5.69, 6.42, 1.571, 7.94],
  [-8.02, -58.01, 5.68, 4.98, 1.571, 7.25],
  [-8.69, -70.00, 4.87, 4.71, 1.571, 8.92],
  [-8.57, -80.00, 3.30, 3.31, 1.571, 4.71],
  [16.64, -44.00, 5.62, 5.79, -1.571, 7.39],
  [15.21, -57.00, 4.75, 4.01, -1.571, 6.58],
  [15.49, -68.00, 4.41, 3.96, -1.571, 6.86],
  [15.38, -80.00, 5.32, 4.75, -1.571, 8.62],
  [-25.00, -46.45, 3.90, 4.35, 0.000, 23.75],
  [22.44, 0.00, 3.40, 1.06, 1.571, 5.13],
  [21.84, -11.69, 1.19, 0.55, 0.500, 2.09],
  [39.77, 11.31, 1.19, 0.55, -2.200, 2.09],
  [6.51, 55.59, 0.55, 1.19, 0.120, 2.09]
];
const RECT_LARANG_VEG = [
  [-4, 4, -96, 195],
  [-90, 54, -8, 8],
  [-122, -86, -12, 0],
  [-90, -86, 0, 20],
  [-52, 52, 177, 183],
  [-122, -118, -40, -12],
  [41, 58, -22, 22],
  [161.2, 164.8, -96.7, -93.4],
  [174.2, 179.8, -88.9, -83.1],
  [165.6, 168.0, -87.6, -85.3],
  [172.3, 174.7, -95.0, -92.6]
];
function diOBBVeg(x, z, o, m) {
  const dx = x - o[0], dz = z - o[1];
  const c = Math.cos(o[4]), s = Math.sin(o[4]);
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.abs(lx) <= o[2] + m && Math.abs(lz) <= o[3] + m;
}
function diZonaLarangVeg(x, z) {
  for (let i = 0; i < ZONA_LARANG_VEG.length; i++) {
    const m = (ZONA_LARANG_VEG[i][0] === -7.20 && ZONA_LARANG_VEG[i][1] === 17.89) ? 0.3 : 0.5;
    if (diOBBVeg(x, z, ZONA_LARANG_VEG[i], m)) return true;
  }
  for (let i = 0; i < RECT_LARANG_VEG.length; i++) {
    const r = RECT_LARANG_VEG[i];
    if (x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3]) return true;
  }
  return false;
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function jarakSeg5(x, z, a, b) {
  const abx = b[0] - a[0], abz = b[1] - a[1];
  let t = ((x - a[0]) * abx + (z - a[1]) * abz) / (abx * abx + abz * abz);
  t = clamp(t, 0, 1);
  return Math.hypot(x - (a[0] + abx * t), z - (a[1] + abz * t));
}
function jarakRute5(x, z, rute) {
  let dm = 1e9;
  for (let i = 0; i < rute.length - 1; i++) dm = Math.min(dm, jarakSeg5(x, z, rute[i], rute[i + 1]));
  return dm;
}
function bedaSudut(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}
const RUTE_BARAT = [[-12, 8], [-38, 16], [-56, 28], [-84, 32], [-112, 24], [-131, 17]];
const RUTE_DANAU = [[-84, 32], [-108, 16], [-128, -2], [-146, -14], [-155.5, -17.5], [-159, -18]];
const RUTE_SEKOLAH = [[-131, 17], [-130, 40], [-133, 49], [-141, 58], [-150, 61.5], [-160, 60.5], [-176, 60]];
const RUTE_HUTAN = [[64, -8], [95, -30], [130, -55], [155, -78], [168, -88]];
const GUNUNG = { x: 0, z: -225 };
const LANDAI_G = [1.5, -2.4, -0.5, 2.6, 0.2];

// ---- penabrak EKSKAK saat blok kota jalan (index.html, sinkron, < baris 1745) ----
// - Menara jam (-25,-46,r4.0) + mancur plaza (0,0,r4.0)
// - 10 lingkaran kode G01-G10 (posisi.forEach ~1347): r = max(lebar,dalam)/2+0.7
// - Perimeter + interior G01 (cx=-27,cz=-14,w=7.85,d=5.97) — IIFE ~1390
// - TIDAK ADA: bangku (tambahTabrakBangku pertama di 1848), toko (3630+),
//   gerobak (4148), pohon T2 (1928+) — semuanya dimuat SETELAH blok kota.
// - Pohon kota yang diterima ikut mendorong penabrak (catatPohon, r=0.55*s;
//   catatPinus TIDAK mendorong).
const penabrak = [{ x: -25, z: -46, r: 4.0 }, { x: 0, z: 0, r: 4.0 }];
{
  const posisi = [[-27, -14], [15, 20], [-24, 20], [-15, 37.4], [10, 33], [-35, -32], [30, 17], [34.8, -15], [20, -27], [-14, -33]];
  posisi.forEach((p, i) => {
    const lebar = 6.5 + (i % 3) * 1.4, dalam = 6 + (i % 2) * 1.6;
    penabrak.push({ x: p[0], z: p[1], r: Math.max(lebar, dalam) / 2 + 0.7 });
  });
  const cx = -27, cz = -14, w = 7.85, d = 5.97;
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
  for (let x = x0; x <= x1 + 0.01; x += 1) penabrak.push({ x, z: z0, r: 0.6 });
  for (let z = z0; z <= z1 + 0.01; z += 1) { penabrak.push({ x: x0, z, r: 0.6 }); penabrak.push({ x: x1, z, r: 0.6 }); }
  const dx0 = cx - 0.9, dx1 = cx + 0.9;
  for (let x = x0; x <= x1 + 0.01; x += 1) if (x < dx0 - 0.3 || x > dx1 + 0.3) penabrak.push({ x, z: z1, r: 0.6 });
  for (let z = z0 + 1; z <= z1 - 1; z += 1) { penabrak.push({ x: x0 + 0.5, z, r: 0.5 }); penabrak.push({ x: x1 - 0.5, z, r: 0.5 }); }
  for (let x = x0 + 1; x <= x1 - 1; x += 1) penabrak.push({ x, z: z0 + 0.5, r: 0.5 });
}
console.log(`penabrak eksak saat blok kota: ${penabrak.length} entri`);

// ---- 1. pohon kota (30) — filter verbatim index.html:1748-1780 ----
const kota = [];
{
  const terlarang = penabrak.slice(); // snapshot — push catatPohon TIDAK masuk sini
  let jadi = 0, coba = 0;
  while (jadi < 30 && coba < 300) {
    coba++;
    const a = acakVeg() * Math.PI * 2;
    const r = 23.5 + acakVeg() * 31;
    const px = Math.cos(a) * r, pz = Math.sin(a) * r;
    if (terlarang.some(t => { const dx = px - t.x, dz = pz - t.z; return dx * dx + dz * dz < (t.r + 1.6) * (t.r + 1.6); })) continue;
    if ([23.5, 28.5, 33.5, 38.5].some(sx => [-6.8, 6.8].some(sz => Math.hypot(px - sx, pz - sz) < 3.2))) continue;
    if (Math.abs(px) <= 4 && pz >= -96 && pz <= 195) continue;
    if (Math.abs(pz) <= 8 && px >= -122 && px <= 54) continue;
    if (Math.hypot(px - 37, pz - 37) < 20.5) continue;
    if (px < -13 && Math.abs(pz) < 4.6) continue;
    if (px > 10.5 && Math.abs(pz) < 10.5) continue;
    if (Math.hypot(px - 46, pz) < 25) continue;
    if (Math.abs(px - 3.5) < 7.5 && pz < -14) continue;
    const epP = (px / 47) * (px / 47) + ((pz - 61.5) / 20) * ((pz - 61.5) / 20);
    if (pz > 40 && epP <= 1) continue;
    if (Math.hypot(px + 38, pz - 72) < 10.5) continue;
    const s = 0.85 + acakVeg() * 0.55;
    const reg = 0.9 + acakVeg() * 0.3;
    const ry = acakVeg() * Math.PI;
    if (diZonaLarangVeg(px, pz)) continue;   /* R6: tapak nyata — sesudah undian */
    if (jadi % 3 === 2) { /* pinus: catatPinus TIDAK mendorong penabrak */ }
    else { /* catatPohon mendorong penabrak LIVE — tapi uji kota memakai SNAPSHOT terlarang, jadi tidak berpengaruh */ }
    kota.push([px, pz]); jadi++;
  }
  console.log(`kota: ${kota.length}/30 diterima, ${coba} percobaan`);
}

// ---- 2. padang (76) — verbatim index.html:4635-4650 ----
const RUTE_SEMUA = RUTE_BARAT.concat(RUTE_DANAU, RUTE_SEKOLAH);
const padang = [];
{
  let nb = 0, nk = 0, nyoba = 0;
  while ((nb + nk) < 76 && nyoba++ < 900) {
    const x = -246 + acakVeg() * 166, z = -56 + acakVeg() * 142;
    if (Math.hypot(x + 180, z + 20) < 28) continue;
    if (x > -170 && x < -128 && z > -9 && z < 35) continue;
    if (x >= -250 && x <= -170 && z >= 38 && z <= 88) continue;
    if (jarakRute5(x, z, RUTE_SEMUA) < 3.6) continue;
    if (z >= -12 && z <= 0 && x >= -122 && x <= -86) continue;
    if (Math.abs(z + 20) < 4 && x > -176 && x < -152) continue;
    acakVeg(); acakVeg(); acakVeg(); acakVeg(); // s, ry, warna x2
    if (diZonaLarangVeg(x, z)) continue;   /* R6: tapak nyata — sesudah undian */
    if ((nb + nk) % 3 !== 2) nb++; else nk++;
    padang.push([x, z]);
  }
  console.log(`padang: ${padang.length}/76 diterima (bulat ${nb}, pinus ${nk}), ${nyoba} percobaan`);
}

// ---- 3. hutan pinus (232 + 22 gunung) — verbatim index.html:5408-5425 ----
const hutan = [];
{
  let n = 0, nyoba = 0;
  const taruh = (x, z) => { acakVeg(); acakVeg(); acakVeg(); if (diZonaLarangVeg(x, z)) return; hutan.push([x, z]); n++; };
  while (n < 232 && nyoba++ < 6000) {
    const x = 84 + acakVeg() * 158, z = -162 + acakVeg() * 144;
    if (Math.hypot(x - 170, z + 90) < 15) continue;
    if (jarakRute5(x, z, RUTE_HUTAN) < 3.6) continue;
    if (x >= 146 && x <= 234 && z >= -75 && z <= -15) continue;
    if (x >= 65.2 && x <= 84.8 && z >= -45.3 && z <= -24.7) continue;
    if (x >= 90.3 && x <= 109.7 && z >= -63.6 && z <= -46.4) continue;
    if (x >= 114.1 && x <= 135.9 && z >= -40.8 && z <= -19.2) continue;
    taruh(x, z, 0.8 + acakVeg() * 0.7);
  }
  console.log(`hutan: ${n}/232 diterima, ${nyoba} percobaan`);
  nyoba = 0;
  const targetG = n + 22;
  while (n < targetG && nyoba++ < 900) {
    const d = 40 + acakVeg() * 15, a = acakVeg() * Math.PI * 2;
    if (Math.abs(bedaSudut(a, LANDAI_G[0])) < 0.7) continue;
    if (d < 49 && Math.abs(bedaSudut(a, LANDAI_G[1])) < 0.65) continue;
    taruh(GUNUNG.x + Math.cos(a) * d, GUNUNG.z + Math.sin(a) * d, 0.8 + acakVeg() * 0.5);
  }
  console.log(`hutan+gunung: ${hutan.length}/254 diterima, ${nyoba} percobaan gunung`);
}

// ---- 4. awan (9) — y 42-72, tidak menyentuh tanah ----
const awan = [];
for (let i = 0; i < 9; i++) {
  const a2 = acakVeg() * Math.PI * 2, r2 = 120 + acakVeg() * 160;
  awan.push([Math.cos(a2) * r2, 42 + acakVeg() * 30, Math.sin(a2) * r2]);
  acakVeg(); acakVeg();
}
console.log(`awan: ${awan.length}/9, y ${Math.min(...awan.map(c => c[1])).toFixed(1)}..${Math.max(...awan.map(c => c[1])).toFixed(1)}`);

// ---- validasi posisi diterima terhadap zona + tapak bangunan ----
const SKIP = /jalan|sungai|danau|laut|langit|awan|perahu|marking|trotoar|cincin/i;
const sungai = bb.find(e => e.label === 'Sungai');
const pelanggaran = [];
function cek(nama, pts) {
  for (const [x, z] of pts) {
    if (Math.abs(x) <= 4 && z >= -96 && z <= 195) pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) jalan-raya N-S`);
    if (Math.abs(z) <= 8 && x >= -122 && x <= 54) pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) jalan-raya E-W`);
    if ([23.5, 28.5, 33.5, 38.5].some(sx => [-6.8, 6.8].some(sz => Math.hypot(x - sx, z - sz) < 3.2))) pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) slot kios`);
    if (sungai && x >= sungai.minX && x <= sungai.maxX && z >= sungai.minZ && z <= sungai.maxZ) pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) sungai`);
    if (((x + 180) / 23) ** 2 + ((z + 20) / 18) ** 2 <= 1) pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) tapak danau GLB`);
    if (x >= 146 && x <= 234 && z >= -75 && z <= -15) pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) tapak Lapangan`);
    if (x >= -250 && x <= -170 && z >= 38 && z <= 88) pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) tapak Sekolah`);
    for (const e of bb) {
      if (e.kat === 'vegetasi' || SKIP.test(e.label)) continue;
      const ex = e.maxX - e.minX, ez = e.maxZ - e.minZ;
      if (ex > 40 || ez > 40) continue;
      if (x >= e.minX - 1 && x <= e.maxX + 1 && z >= e.minZ - 1 && z <= e.maxZ + 1)
        pelanggaran.push(`${nama} (${x.toFixed(1)},${z.toFixed(1)}) di tapak ${e.label} (+1m)`);
    }
  }
}
cek('kota', kota); cek('padang', padang); cek('hutan', hutan);
console.log(`\nPELANGGARAN: ${pelanggaran.length}`);
for (const p of pelanggaran.slice(0, 20)) console.log(' -', p);
console.log(pelanggaran.length === 0 && kota.length === 30 && padang.length === 76 && hutan.length === 254
  ? 'REPLAY VEGETASI: LOLOS — semua loop penuh, 0 pohon di jalan/bangunan/air'
  : 'REPLAY VEGETASI: PERIKSA — lihat angka di atas');
import { writeFileSync } from 'fs';
writeFileSync('/home/hatch/workspace/lumina/audit/plan/replay-veg.json',
  JSON.stringify({ kota, padang, hutan, awan, pelanggaran }, null, 1));
console.log('posisi ditulis: audit/plan/replay-veg.json');
