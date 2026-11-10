/* Harness pemain TUGAS 4 — penabrak pemain OBB (2026-11-10), Lumina.
   - Fungsi dorongPemainKeluarTapak + dorongPemainSemua + tabel ZONA_LARANG_PEMAIN
     diekstrak VERBATIM dari index.html hasil edit (brace-counting, bukan salinan
     tangan). Fungsi kamera dorongKeluarTapak + jarakDollyBersih + tabel
     ZONA_LARANG_KAMERA juga diekstrak verbatim (untuk gerbang LOS).
   - ZONA_LARANG_VEG diverifikasi TIDAK BERUBAH vs backup pra-kamera-marka.
   - THREE r128 dari three.min.js (file yang dipakai game).
   - penabrak di harness = rekonstruksi setia index.html hasil edit (loop ring
     G01 dihapus / G04 lama tanpaPemain, rantai G01, 3 lingkaran G04, toko,
     kios, rantai konser/skatepark/taman BARU, 4 lingkaran kecil baru, bangku
     plaza, mancur, menara jam). Lingkaran kecil lain (lampu, papan, properti)
     tidak memengaruhi titik uji (jarak >15 m) — dicatat, bukan diabaikan diam-diam.
   - Gerbang: (1) jalan masuk 8 arah ke G09/G02 — TIDAK PERNAH masuk tapak
     (jarak ke OBB > 0 di semua langkah); (2) teleport (b) terdorong KELUAR;
     (3) teleport (c) terdorong ke jarak >= target dari muka dinding;
     (4) regresi gerakan (plaza, jalan E-W pasar, koridor City Walk, bangku,
     pintu G01, petak G04 lama); (5) LOS ulang (a)/(b)/(c) — baseline angka
     Tugas 3 mode 'baru' (a) 0/180, (b) 180/180, (c) 40/180 (logika kamera
     TIDAK diubah ronde ini, jadi baseline tetap valid; hanya posisi pemain
     yang berubah karena dorongan baru).
   Jalankan: node audit/plan/uji-pemain-tugas4.cjs
   Keluar 0 bila semua gerbang lolos; 1 bila ada yang gagal. */
const fs = require('fs');
const THREE = require('/home/hatch/workspace/lumina/three.min.js');
if (THREE.REVISION !== '128') { console.error('REVISI THREE BUKAN r128:', THREE.REVISION); process.exit(1); }

const html = fs.readFileSync('/home/hatch/workspace/lumina/index.html', 'utf8');
const bak = fs.readFileSync('/home/hatch/workspace/lumina/index.html.bak-sebelum-kamera-marka-20261110', 'utf8');
function extractTable(src, name) {
  const m = src.match(new RegExp('var ' + name + ' = \\[([\\s\\S]*?)\\];'));
  if (!m) throw new Error('tabel ' + name + ' tidak ketemu');
  return eval('[' + m[1].replace(/\/\*.*?\*\//g, '') + ']');
}
function extractFn(src, sig) {
  const i = src.indexOf(sig);
  if (i < 0) throw new Error('fungsi ' + sig + ' tidak ketemu');
  let j = src.indexOf('{', i), depth = 0, k = j;
  for (; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) throw new Error('brace tidak seimbang untuk ' + sig);
  return src.slice(i, k + 1);
}
const PEMAIN = extractTable(html, 'ZONA_LARANG_PEMAIN');
const KAM = extractTable(html, 'ZONA_LARANG_KAMERA');
const VEG_NOW = extractTable(html, 'ZONA_LARANG_VEG');
const VEG_BAK = extractTable(bak, 'ZONA_LARANG_VEG');
const FN_DORONG_PEMAIN = extractFn(html, 'function dorongPemainKeluarTapak(v)');
const FN_DORONG_SEMUA = extractFn(html, 'function dorongPemainSemua(v)');
const FN_DORONG_KAM = extractFn(html, 'function dorongKeluarTapak(v, px, pz)');
const FN_DOLLY = extractFn(html, 'function jarakDollyBersih(px, py, pz, tx, ty, tz)');
if (PEMAIN.length !== 21) throw new Error('ZONA_LARANG_PEMAIN bukan 21 baris: ' + PEMAIN.length);
if (!FN_DORONG_PEMAIN.includes('ZONA_LARANG_PEMAIN')) throw new Error('dorongPemainKeluarTapak tidak memakai tabel pemain');
if (!FN_DORONG_SEMUA.includes('tanpaPemain')) throw new Error('dorongPemainSemua tidak memeriksa tanpaPemain');
if (!FN_DORONG_SEMUA.includes('dorongPemainKeluarTapak')) throw new Error('dorongPemainSemua tidak memanggil dorong OBB');
if (JSON.stringify(VEG_NOW) !== JSON.stringify(VEG_BAK)) throw new Error('ZONA_LARANG_VEG BERUBAH — dilarang!');
if (JSON.stringify(KAM) !== JSON.stringify(VEG_NOW)) throw new Error('ZONA_LARANG_KAMERA bukan salinan verbatim VEG');
console.log('tabel: PEMAIN=' + PEMAIN.length + ' baris, KAMERA=' + KAM.length + ' baris, VEG identik backup OK');
console.log('fungsi: dorongPemainKeluarTapak + dorongPemainSemua + dorongKeluarTapak + jarakDollyBersih diekstrak verbatim OK');

// ---- penabrak (rekonstruksi setia index.html hasil edit) ----
const penabrak = [];
function P(x, z, r, extra) { const o = { x, z, r }; if (extra) Object.assign(o, extra); penabrak.push(o); }
P(-25, -46, 4.0); P(0, 0, 4.0); // menara jam + mancur plaza
{
  const posisi = [[-27, -14], [15, 20], [-24, 20], [-15, 37.4], [10, 33], [-35, -32], [30, 17], [34.8, -15], [20, -27], [-14, -33]];
  posisi.forEach((p, i) => {
    const lebar = 6.5 + (i % 3) * 1.4, dalam = 6 + (i % 2) * 1.6;
    const r = Math.max(lebar, dalam) / 2 + 0.7;
    if (i === 0) return; // G01 DIHAPUS (Tugas 4)
    if (i === 3) P(p[0], p[1], r, { tanpaPemain: true }); // G04 lama
    else P(p[0], p[1], r);
  });
}
{ // rantai dinding G01 (enterable) — salinan loop pasangGedungG01v3
  const cx = -27, cz = -14, w = 7.85, d = 5.97;
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
  for (let x = x0; x <= x1 + 0.01; x += 1) P(x, z0, 0.6);
  for (let z = z0; z <= z1 + 0.01; z += 1) { P(x0, z, 0.6); P(x1, z, 0.6); }
  const dx0 = cx - 0.9, dx1 = cx + 0.9;
  for (let x = x0; x <= x1 + 0.01; x += 1) { if (x < dx0 - 0.3 || x > dx1 + 0.3) P(x, z1, 0.6); }
  for (let z = z0 + 1; z <= z1 - 1; z += 1) { P(x0 + 0.5, z, 0.5); P(x1 - 0.5, z, 0.5); }
  for (let x = x0 + 1; x <= x1 - 1; x += 1) P(x, z0 + 0.5, 0.5);
}
[-6, 0, 6].forEach(off => { // 3 lingkaran G04 (visual)
  const sx = Math.sin(5.903), sz = Math.cos(5.903);
  P(-7.20 + sx * off, 17.89 + sz * off, 4.5);
});
{ // toko City Walk: 3 lingkaran (r 2.99; roti barat r 3.25)
  const zToko = [-44, -52, -60, -68];
  zToko.forEach((pz, i) => {
    const rBarat = (i === 1) ? 3.25 : 2.99;
    [-2.33, 0, 2.33].forEach(off => P(-6.2, pz - off, rBarat));
    [-2.33, 0, 2.33].forEach(off => P(13.2, pz + off, 2.99));
  });
}
[23.5, 28.5, 33.5, 38.5].forEach(sx => [-6.8, 6.8].forEach(sz => P(sx, sz, 1.53))); // kios pasar (8)
{ // rantai konser BARU (30,203.2): pintu utara, panggung selatan
  const cx = 30, cz = 203.2, hw = 12.85, hd = 19.65;
  for (let px = cx - hw; px <= cx + hw; px++) P(px, cz + hd, 0.6);
  for (let px = cx - hw; px <= cx + hw; px++) { if (px >= 26.76 && px <= 33.24) continue; P(px, cz - hd, 0.6); }
  for (let pz = cz - hd; pz <= cz + hd; pz++) { P(cx - hw, pz, 0.6); P(cx + hw, pz, 0.6); }
  for (let px = 21.9; px <= 38.1; px++) { for (let pz = 213.94; pz <= 221.5; pz++) P(px, pz, 0.5); }
}
{ // pagar skatepark BARU (-60,155)
  const cx = -60, cz = 155, hw = 12, hd = 9;
  for (let px = cx - hw; px <= cx + hw; px++) P(px, cz - hd, 0.6);
  for (let px = cx - hw; px <= cx + hw; px++) { if (px >= cx - 2 && px <= cx + 2) continue; P(px, cz + hd, 0.6); }
  for (let pz = cz - hd; pz <= cz + hd; pz++) { P(cx - hw, pz, 0.6); P(cx + hw, pz, 0.6); }
}
{ // pagar taman bunga BARU (65,155)
  const cx = 65, cz = 155, hw = 10, hd = 8;
  for (let px = cx - hw; px <= cx + hw; px++) P(px, cz - hd, 0.6);
  for (let px = cx - hw; px <= cx + hw; px++) { if (px >= cx - 2 && px <= cx + 2) continue; P(px, cz + hd, 0.6); }
  for (let pz = cz - hd; pz <= cz + hd; pz++) { P(cx - hw, pz, 0.6); P(cx + hw, pz, 0.6); }
}
P(-38, 72, 2.31); P(-152, 6, 5.0); P(177, -86, 3.29); P(6.5, 55.5, 1.31); // 4 lingkaran kecil baru
for (let i = 0; i < 6; i++) { // 6 bangku plaza (radius 6.1)
  const a = i / 6 * Math.PI * 2 + 0.26;
  const bx = Math.cos(a) * 6.1, bz = Math.sin(a) * 6.1;
  const ry = Math.atan2(-bx, -bz);
  const lx = Math.cos(ry), lz = -Math.sin(ry), fx = Math.sin(ry), fz = Math.cos(ry);
  [-0.3375, 0.3375].forEach(off => P(bx + lx * off + fx * (-0.05), bz + lz * off + fz * (-0.05), 0.54));
}
console.log('penabrak harness: ' + penabrak.length + ' lingkaran (G01 ring HILANG, G04 lama tanpaPemain=' +
  penabrak.filter(t => t.tanpaPemain).length + ')');

// ---- instansiasi fungsi hasil ekstrak ----
const dorongPemainKeluarTapak = new Function('ZONA_LARANG_PEMAIN', FN_DORONG_PEMAIN + '\nreturn dorongPemainKeluarTapak;')(PEMAIN);
const dorongPemainSemua = new Function('penabrak', 'dorongPemainKeluarTapak', FN_DORONG_SEMUA + '\nreturn dorongPemainSemua;')(penabrak, dorongPemainKeluarTapak);
function makeFnKam(src, retName) {
  const s2 = src.replace(/ZONA_LARANG_KAMERA/g, 'TABEL').replace(/ZONA_LARANG_VEG/g, 'TABEL');
  return new Function('TABEL', s2 + '\nreturn ' + retName + ';')(KAM);
}
const dorongBaru = makeFnKam(FN_DORONG_KAM, 'dorongKeluarTapak');
const dollyBersih = makeFnKam(FN_DOLLY, 'jarakDollyBersih');

// ---- jarak bertanda ke OBB tapak (negatif = di dalam, positif = di luar) ----
function jarakKeOBB(x, z, o) {
  const dx = x - o[0], dz = z - o[1];
  const c = Math.cos(o[4]), s = Math.sin(o[4]);
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  const ex = Math.max(Math.abs(lx) - o[2], 0), ez = Math.max(Math.abs(lz) - o[3], 0);
  const luar = Math.hypot(ex, ez);
  if (luar > 0) return luar;
  return -Math.min(o[2] - Math.abs(lx), o[3] - Math.abs(lz));
}
function jarakMinSemuaOBB(x, z) {
  let m = Infinity, idx = -1;
  for (let i = 0; i < PEMAIN.length; i++) { const d = jarakKeOBB(x, z, PEMAIN[i]); if (d < m) { m = d; idx = i; } }
  return { d: m, idx };
}
const IDX = { G02: 0, G03: 1, G04: 2, G05: 3, G06: 4, G07: 5, G08: 6, G09: 7, G10: 8, MENARA_JAM: 9 };

let FAIL = 0;
function gate(ok, msg) { console.log((ok ? '  LULUS  ' : '  GAGAL  ') + msg); if (!ok) FAIL++; }

console.log('\n=== 1. Jalan masuk 8 arah ke G09 dan G02 (langkah 0,1 m, dorong tiap langkah) ===');
for (const [nama, oi, cx, cz] of [['G09', IDX.G09, 20.71, -27.53], ['G02', IDX.G02, 14.75, 19.66]]) {
  let minD = Infinity, minSemua = Infinity, langkahMasuk = 0;
  for (let a = 0; a < 8; a++) {
    const ang = a / 8 * Math.PI * 2;
    let x = cx + Math.cos(ang) * 25, z = cz + Math.sin(ang) * 25;
    for (let s = 0; s < 250; s++) {
      const d0 = Math.hypot(cx - x, cz - z);
      if (d0 < 0.05) break;
      const nx = x + (cx - x) / d0 * 0.1, nz = z + (cz - z) / d0 * 0.1;
      const v = { x: nx, z: nz };
      dorongPemainSemua(v);
      x = v.x; z = v.z;
      const dT = jarakKeOBB(x, z, PEMAIN[oi]);
      const dS = jarakMinSemuaOBB(x, z).d;
      if (dT < minD) minD = dT;
      if (dS < minSemua) minSemua = dS;
      if (dT <= 0) langkahMasuk++;
    }
  }
  console.log('    ' + nama + ': jarak min ke tapak sendiri ' + minD.toFixed(2) + ' m, ke semua OBB ' + minSemua.toFixed(2) + ' m, langkah di dalam tapak: ' + langkahMasuk);
  gate(minD > 0, nama + ' TIDAK PERNAH masuk tapak (jarak min ' + minD.toFixed(2) + ' m > 0)');
  gate(minD >= 1.4, nama + ' margin ~1,5 m terjaga (jarak min ' + minD.toFixed(2) + ' m >= 1,40)');
}

console.log('\n=== 2. Teleport ke titik insiden (b) dan (c) ===');
(function () {
  const v = { x: 18.47, z: -32.72 };
  const dSebelum = jarakKeOBB(v.x, v.z, PEMAIN[IDX.G09]);
  dorongPemainSemua(v);
  const dSesudah = jarakKeOBB(v.x, v.z, PEMAIN[IDX.G09]);
  console.log('    (b) G09 (18.47,-32.72): jarak ke tapak G09 sebelum ' + dSebelum.toFixed(2) + ' m (negatif = di dalam dinding) -> sesudah (' + v.x.toFixed(2) + ',' + v.z.toFixed(2) + ') ' + dSesudah.toFixed(2) + ' m');
  gate(dSesudah > 0, '(b) pemain KELUAR dari dinding G09 (jarak ' + dSesudah.toFixed(2) + ' m)');
  gate(dSesudah >= 1.4, '(b) jarak ke dinding >= 1,40 m (target ~1,5 m)');
})();
(function () {
  const v = { x: 10, z: 17.6 };
  const dSebelum = jarakKeOBB(v.x, v.z, PEMAIN[IDX.G02]);
  dorongPemainSemua(v);
  const dSesudah = jarakKeOBB(v.x, v.z, PEMAIN[IDX.G02]);
  console.log('    (c) G02 (10,17.6): jarak ke tapak G02 sebelum ' + dSebelum.toFixed(2) + ' m -> sesudah (' + v.x.toFixed(2) + ',' + v.z.toFixed(2) + ') ' + dSesudah.toFixed(2) + ' m');
  gate(dSesudah >= 1.4, '(c) pemain terdorong ke jarak >= 1,40 m dari muka dinding G02 (dapat ' + dSesudah.toFixed(2) + ' m; sebelum ' + dSebelum.toFixed(2) + ' m)');
})();

console.log('\n=== 3. Regresi gerakan (jalan rakus: coba 7 arah, ambil yang mendekati target) ===');
function jalanKe(sx, sz, tx, tz, maksLangkah) {
  let x = sx, z = sz, langkah = 0, macet = 0;
  while (langkah < maksLangkah) {
    const d0 = Math.hypot(tx - x, tz - z);
    if (d0 <= 0.5) break;
    const arah = Math.atan2(tx - x, tz - z);
    let terbaik = null, dTerbaik = d0;
    for (const dev of [0, 0.5, -0.5, 1.0, -1.0, 1.57, -1.57]) {
      const a = arah + dev;
      const v = { x: x + Math.sin(a) * 0.1, z: z + Math.cos(a) * 0.1 };
      dorongPemainSemua(v);
      const d1 = Math.hypot(tx - v.x, tz - v.z);
      if (d1 < dTerbaik - 1e-9) { dTerbaik = d1; terbaik = v; }
    }
    if (!terbaik) { macet++; if (macet > 200) break; }
    else { x = terbaik.x; z = terbaik.z; macet = 0; }
    langkah++;
  }
  return { x, z, jarak: Math.hypot(tx - x, tz - z), langkah, macet };
}
const RUTE = [
  ['plaza E-W (lewat mancur)', -20, 0, 20, 0, 1.0],
  ['jalan E-W pasar (antar kios)', 10, 0, 45, 0, 1.0],
  ['koridor City Walk (antar toko)', 3.5, -40, 3.5, -85, 1.0],
  ['bangku selatan mancur (Duduk)', 0, 0, 1.08, 7.42, 1.5],
  ['pintu G01 (masuk toko)', -27, -5, -27, -14, 1.0],
  ['petak G04 lama (tembok tak terlihat)', -15, 30, -15, 37.4, 1.0],
];
for (const [nama, sx, sz, tx, tz, tol] of RUTE) {
  const r = jalanKe(sx, sz, tx, tz, 6000);
  console.log('    ' + nama + ': akhir (' + r.x.toFixed(2) + ',' + r.z.toFixed(2) + ') jarak ke target ' + r.jarak.toFixed(2) + ' m, ' + r.langkah + ' langkah, macet ' + r.macet);
  gate(r.jarak <= tol, nama + ' tercapai (jarak ' + r.jarak.toFixed(2) + ' m <= ' + tol + ' m)');
}

// ---- posisi pemain pasca-dorong untuk LOS ----
const POS_LOS = {};
for (const [nama, px, pz] of [['(a)', 10, 26], ['(b)', 18.48, -32.72], ['(c)', 10, 17.6]]) {
  const v = { x: px, z: pz };
  dorongPemainSemua(v);
  POS_LOS[nama] = [v.x, v.z];
  console.log('\nposisi LOS ' + nama + ': (' + px + ',' + pz + ') -> (' + v.x.toFixed(2) + ',' + v.z.toFixed(2) + ')');

  /* === LOS: adaptasi harness Tugas 3 (uji-kamera-los.cjs) — mode 'baru' saja === */
}
const WALLS = [
  ['G02', 15, 20, 3.785, 1.0, -4.40, 4.40, -4.25, 4.45],
  ['G05', 10, 33, 0.1797, 1.0, -4.03, 3.95, -4.65, 3.45],
  ['G09', 20, -27, 2.5041, 1.0, -5.35, 5.15, -6.83, 8.35],
  ['G04', -15, 37.4, 5.9026, 1.0, -3.20, 3.20, -30.42, -11.60],
  ['G07', 30, 17, 1.2491, 1.0, -5.36, 5.36, -4.39, 4.35],
  ['G08', 34.8, -15, 1.9029, 1.0, -3.67, 3.67, -3.90, 3.42],
  ['EsKrim', 15.2, -44, -1.5708, 1.5, -3.75, 3.75, -4.82, 2.90],
  ['G10', -14, -33, 3.3215, 1.0, -7.35, 7.35, -4.90, 4.90],
  ['Kopi', -8.4, -44, 1.5708, 1.7, -3.35, 3.35, -4.65, 2.90],
];
function inWall(x, z, w) {
  const px = w[1], pz = w[2], ry = w[3], sc = w[4];
  const dx = (x - px) / sc, dz = (z - pz) / sc, c = Math.cos(ry), s = Math.sin(ry);
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return w[5] <= lx && lx <= w[6] && w[7] <= lz && lz <= w[8];
}
function segHitsWall(ax, az, bx, bz, w) {
  const px = w[1], pz = w[2], ry = w[3], sc = w[4], c = Math.cos(ry), s = Math.sin(ry);
  function loc(x, z) { const dx = (x - px) / sc, dz = (z - pz) / sc; return [dx * c - dz * s, dx * s + dz * c]; }
  const A = loc(ax, az), B = loc(bx, bz);
  const dx = B[0] - A[0], dz = B[1] - A[1];
  let t0 = 0, t1 = 1;
  const ps = [[-dx, A[0] - w[5]], [dx, w[6] - A[0]], [-dz, A[1] - w[7]], [dz, w[8] - A[1]]];
  for (const pq of ps) {
    const p = pq[0], q = pq[1];
    if (Math.abs(p) < 1e-12) { if (q < 0) return false; }
    else {
      const t = q / p;
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return t0 <= t1 && t1 >= 0 && t0 <= 1 && !(t0 === 0 && t1 === 0);
}
function wallList(x, z) { return WALLS.filter(w => inWall(x, z, w)).map(w => w[0]); }
function losList(px, pz, cx, cz) { return WALLS.filter(w => segHitsWall(px, pz, cx, cz, w)).map(w => w[0]); }
function dist(ax, az, bx, bz) { return Math.hypot(bx - ax, bz - az); }
// S1 kamera = lingkaran penabrak (Tugas 3) TANPA lingkaran G01 (dihapus Tugas 4;
// G01 di (-27,-14) >30 m dari ketiga titik uji, jadi tidak memengaruhi angka).
const S1 = [
  { x: 15, z: 20, r: 4.65 }, { x: -24, z: 20, r: 5.35 },
  { x: -15, z: 37.4, r: 4.5 }, { x: 10, z: 33, r: 4.65 }, { x: -35, z: -32, r: 5.35 },
  { x: 30, z: 17, r: 3.95 }, { x: 34.8, z: -15, r: 4.65 }, { x: 20, z: -27, r: 5.35 },
  { x: -14, z: -33, r: 4.5 }, { x: 0, z: 0, r: 4.0 }, { x: -25, z: -46, r: 4.0 },
  { x: -4.97, z: 12.32, r: 4.5 }, { x: -7.20, z: 17.89, r: 4.5 }, { x: -9.43, z: 23.46, r: 4.5 },
  { x: 16.64, z: -46.33, r: 2.99 }, { x: 16.64, z: -44, r: 2.99 }, { x: 16.64, z: -41.67, r: 2.99 },
  { x: -9.89, z: -41.67, r: 2.99 }, { x: -9.89, z: -44, r: 2.99 }, { x: -9.89, z: -46.33, r: 2.99 },
];
function dorongS1(v) {
  for (let pass = 0; pass < 2; pass++) {
    for (const c of S1) {
      const dx = v.x - c.x, dz = v.z - c.z;
      const d = Math.sqrt(dx * dx + dz * dz), r = c.r + 0.3;
      if (d < r) {
        if (d < 0.001) { v.x = c.x + r; v.z = c.z; }
        else { v.x = c.x + dx / d * r; v.z = c.z + dz / d * r; }
      }
    }
  }
}
const EYE_Y = 1.7, CAM_JARAK = 8.4, CAM_PITCH = 0.30, DT = 1 / 60, FRAME = 240;
const DOLLY_MIN = 2.0, DOLLY_MARGIN = 0.3;
function langkah(px, pz, yawDeg, state) {
  const yaw = yawDeg * Math.PI / 180;
  const cp = Math.cos(CAM_PITCH), sp = Math.sin(CAM_PITCH);
  const camTarget = new THREE.Vector3(
    px + Math.sin(yaw) * cp * CAM_JARAK,
    sp * CAM_JARAK + 0.6,
    pz + Math.cos(yaw) * cp * CAM_JARAK
  );
  if (camTarget.y < 0.7) camTarget.y = 0.7;
  dorongS1(camTarget);
  dorongBaru(camTarget, px, pz); dorongBaru(camTarget, px, pz);
  const bidikY = EYE_Y;
  const ex = camTarget.x - px, ey = camTarget.y - bidikY, ez = camTarget.z - pz;
  const d0 = Math.sqrt(ex * ex + ey * ey + ez * ez);
  if (d0 > 1e-6) {
    const dBersih = dollyBersih(px, bidikY, pz, camTarget.x, camTarget.y, camTarget.z);
    let dTujuan = (dBersih < d0) ? Math.min(d0, dBersih - DOLLY_MARGIN) : d0;
    if (dTujuan < DOLLY_MIN) dTujuan = DOLLY_MIN;
    if (dTujuan > d0) dTujuan = d0;
    if (state.camJarakEfektif > CAM_JARAK) state.camJarakEfektif = CAM_JARAK;
    const laju = (dTujuan < state.camJarakEfektif) ? 8 : 2;
    state.camJarakEfektif += (dTujuan - state.camJarakEfektif) * (1 - Math.exp(-DT * laju));
    if (state.camJarakEfektif < DOLLY_MIN) state.camJarakEfektif = DOLLY_MIN;
    if (state.camJarakEfektif > CAM_JARAK) state.camJarakEfektif = CAM_JARAK;
    const skala = state.camJarakEfektif / d0;
    if (skala < 1) {
      camTarget.x = px + ex * skala;
      camTarget.y = bidikY + ey * skala;
      camTarget.z = pz + ez * skala;
      if (camTarget.y < 0.7) camTarget.y = 0.7;
    }
  }
  state.camPos.lerp(camTarget, 1 - Math.exp(-DT * 6));
  dorongBaru(state.camPos, px, pz);
  return camTarget;
}
console.log('\n=== 4. LOS ulang (a)/(b)/(c) — 180 sektor, 240 frame/sektor, mode baru ===');
console.log('    Baseline Tugas 3 (mode baru, posisi pemain LAMA): (a) 0/180, (b) 180/180, (c) 40/180 LOS terhalang camera.position.');
const LOS_HASIL = {};
for (const [nama, pos] of [['(a) gang G02-G05', POS_LOS['(a)']], ['(b) City Walk/G09', POS_LOS['(b)']], ['(c) tenggara plaza', POS_LOS['(c)']]]) {
  const px = pos[0], pz = pos[1];
  let nLosT = 0, nLosP = 0, nWallT = 0, nWallP = 0, minDist = Infinity, maxDolly = 0, nMinDist = 0, frameBersihMax = 0;
  for (let d = 0; d < 360; d += 2) {
    const yaw = d * Math.PI / 180;
    const state = {
      camPos: new THREE.Vector3(px + Math.sin(yaw) * Math.cos(CAM_PITCH) * CAM_JARAK, Math.sin(CAM_PITCH) * CAM_JARAK + 0.6, pz + Math.cos(yaw) * Math.cos(CAM_PITCH) * CAM_JARAK),
      camJarakEfektif: CAM_JARAK,
    };
    let tgt = null, fBersih = -1;
    for (let f = 0; f < FRAME; f++) {
      tgt = langkah(px, pz, d, state);
      if (fBersih < 0 && losList(px, pz, state.camPos.x, state.camPos.z).length === 0) fBersih = f;
    }
    if (fBersih >= 0) frameBersihMax = Math.max(frameBersihMax, fBersih);
    if (losList(px, pz, tgt.x, tgt.z).length) nLosT++;
    if (losList(px, pz, state.camPos.x, state.camPos.z).length) nLosP++;
    if (wallList(tgt.x, tgt.z).length) nWallT++;
    if (wallList(state.camPos.x, state.camPos.z).length) nWallP++;
    const dd = dist(px, pz, state.camPos.x, state.camPos.z);
    if (dd < minDist) minDist = dd;
    maxDolly = Math.max(maxDolly, CAM_JARAK - state.camJarakEfektif);
    if (state.camJarakEfektif <= DOLLY_MIN + 1e-9) nMinDist++;
  }
  console.log('    ' + nama + ' pemain (' + px.toFixed(2) + ',' + pz.toFixed(2) + '): LOS terhalang camTarget ' + nLosT + '/180, camera.position ' + nLosP + '/180 | di dinding camTarget ' + nWallT + ', camPos ' + nWallP + ' | jarak kamera min ' + minDist.toFixed(2) + ' m | dolly-in maks ' + maxDolly.toFixed(2) + ' m | sektor di jarak min ' + nMinDist + '/180 | frame terakhir LOS bersih (maks) ' + frameBersihMax);
  LOS_HASIL[nama] = { nLosT, nLosP, nWallT, nWallP, minDist, maxDolly, nMinDist, frameBersihMax };
}
gate(LOS_HASIL['(a) gang G02-G05'].nLosP === 0, '(a) LOS terhalang camera.position 0/180');
gate(LOS_HASIL['(b) City Walk/G09'].nLosP === 0, '(b) LOS terhalang camera.position 0/180 (target Tugas 4)');
gate(LOS_HASIL['(a) gang G02-G05'].nWallP === 0 && LOS_HASIL['(b) City Walk/G09'].nWallP === 0 && LOS_HASIL['(c) tenggara plaza'].nWallP === 0, 'camera.position di luar dinding 180/180 di (a)+(b)+(c)');

console.log('\n' + (FAIL === 0 ? 'SEMUA GERBANG LULUS' : FAIL + ' GERBANG GAGAL'));
process.exit(FAIL === 0 ? 0 : 1);
