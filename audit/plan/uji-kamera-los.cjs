/* Harness kamera TUGAS 3 — LOS (2026-11-10), Lumina.
   Menguji perbaikan LOS: dorongKeluarTapak SADAR-PEMAIN (M1) + dolly-in
   sadar-garis-pandang jarakDollyBersih (M2).
   - Fungsi dorongKeluarTapak + jarakDollyBersih + tabel ZONA_LARANG_KAMERA
     diekstrak VERBATIM dari index.html hasil edit (brace-counting, bukan
     salinan tangan). Fungsi lama diekstrak dari backup
     index.html.bak-sebelum-kamera-marka-20261110 (baseline + regresi orbit).
   - THREE r128 dari three.min.js (file yang dipakai game).
   - Tapak dinding SEJATI (wall rect, loader-local) dari GLB per-mesh
     (sama seperti harness KAMERA-MARKA) = ground truth LOS + "di dinding".
   - Simulasi pipeline per-frame PENUH (cermin perbaruiKamera cabang
     sudahMasuk): camTarget (yaw/pitch/camJarak) -> ground clamp -> S1
     (2 pass, lingkaran penabrak) -> dorong (2x) -> dolly-in (lerp masuk
     8/detik, keluar 2/detik, min 2,0 m) -> lerp camera.position (6/detik)
     -> dorong camera.position (1x). 240 frame @ dt=1/60 per sektor yaw.
   - Konvensi sudut: camJarak horizontal 8,4 m, y kamera 3,08 m (SAMA
     dengan harness KAMERA-MARKA, supaya angka sebelum/sesudah bisa
     dibandingkan langsung dengan baseline (a) 109/180, (b) 180/180,
     (c) 81/180. Catatan jujur: game nyata memakai horizontal
     8,4*cos(0,30)=8,02 m — harness memakai 8,4 m (kamera sedikit LEBIH
     JAUH = uji LOS sedikit LEBIH KERAS, konservatif).
   - Mata pemain (eye) y = 1,7 m (default prosedural; bidikY cewek 1,62 /
     cowok 1,98 — gerbang LOS 2D tidak terpengaruh tinggi mata karena
     semua dinding insiden jauh lebih tinggi dari kamera).
   - Tanah datar y=0 di ketiga titik (plaza), ground clamp y>=0,7.
   Jalankan: node audit/plan/uji-kamera-los.cjs
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
const KAM = extractTable(html, 'ZONA_LARANG_KAMERA');
const VEG_NOW = extractTable(html, 'ZONA_LARANG_VEG');
const VEG_BAK = extractTable(bak, 'ZONA_LARANG_VEG');
const FN_DORONG_BARU = extractFn(html, 'function dorongKeluarTapak(v, px, pz)');
const FN_DOLLY = extractFn(html, 'function jarakDollyBersih(px, py, pz, tx, ty, tz)');
const FN_DORONG_LAMA = extractFn(bak, 'function dorongKeluarTapak(v)');
if (!FN_DORONG_BARU.includes('sadarPemain')) throw new Error('dorong baru TIDAK sadar-pemain');
if (!FN_DORONG_BARU.includes('ZONA_LARANG_KAMERA')) throw new Error('dorong baru TIDAK memakai ZONA_LARANG_KAMERA');
if (!FN_DOLLY.includes('ZONA_LARANG_KAMERA')) throw new Error('jarakDollyBersih TIDAK memakai ZONA_LARANG_KAMERA');
if (FN_DOLLY.includes('ZONA_LARANG_VEG')) throw new Error('jarakDollyBersih menyebut ZONA_LARANG_VEG');
if (JSON.stringify(VEG_NOW) !== JSON.stringify(VEG_BAK)) throw new Error('ZONA_LARANG_VEG BERUBAH — dilarang!');
if (JSON.stringify(KAM) !== JSON.stringify(VEG_NOW)) throw new Error('ZONA_LARANG_KAMERA bukan salinan verbatim VEG');
console.log('tabel: KAMERA=' + KAM.length + ' baris, VEG=' + VEG_NOW.length + ' baris (VEG identik backup OK; KAMERA verbatim OK)');
console.log('fungsi: dorong sadar-pemain OK; jarakDollyBersih OK (memakai KAMERA, bukan VEG)');

function makeFn(table, src, retName) {
  const s2 = src.replace(/ZONA_LARANG_KAMERA/g, 'TABEL').replace(/ZONA_LARANG_VEG/g, 'TABEL');
  return new Function('TABEL', s2 + '\nreturn ' + retName + ';')(table);
}
const dorongBaru = makeFn(KAM, FN_DORONG_BARU, 'dorongKeluarTapak');
const dollyBersih = makeFn(KAM, FN_DOLLY, 'jarakDollyBersih');
const dorongLama = makeFn(VEG_BAK, FN_DORONG_LAMA, 'dorongKeluarTapak');

// ---- Tapak dinding sejati (GLB per-mesh) ----
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

// ---- Lingkaran penabrak S1 (relevan titik insiden; r = max(lebar,dalam)/2+0,7) ----
const S1 = [
  { x: -27, z: -14, r: 3.95 }, { x: 15, z: 20, r: 4.65 }, { x: -24, z: 20, r: 5.35 },
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
/* Satu frame pipeline (cermin perbaruiKamera cabang sudahMasuk).
   mode: 'baru' (dorong sadar-pemain + dolly-in) atau 'lama' (dorong lama + tanpa dolly-in).
   state: {camPos:Vector3, camJarakEfektif:number}. Mengembalikan camTarget akhir. */
function langkah(px, pz, yawDeg, state, mode) {
  const yaw = yawDeg * Math.PI / 180;
  const cp = Math.cos(CAM_PITCH), sp = Math.sin(CAM_PITCH);
  const camTarget = new THREE.Vector3(
    px + Math.sin(yaw) * cp * CAM_JARAK,
    sp * CAM_JARAK + 0.6,
    pz + Math.cos(yaw) * cp * CAM_JARAK
  );
  if (camTarget.y < 0.7) camTarget.y = 0.7;   /* tanah datar 0 */
  dorongS1(camTarget);
  if (mode === 'baru') { dorongBaru(camTarget, px, pz); dorongBaru(camTarget, px, pz); }
  else { dorongLama(camTarget); dorongLama(camTarget); }
  if (mode === 'baru') {
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
  }
  state.camPos.lerp(camTarget, 1 - Math.exp(-DT * 6));
  if (mode === 'baru') dorongBaru(state.camPos, px, pz);
  else dorongLama(state.camPos);
  return camTarget;
}

let FAIL = 0;
function gate(ok, msg) { console.log((ok ? '  LULUS  ' : '  GAGAL  ') + msg); if (!ok) FAIL++; }

console.log('\n=== A. Sapuan yaw penuh per titik (180 sektor, 240 frame/sektor) ===');
console.log('    Baseline ronde KAMERA-MARKA (harness lama, tanpa S1): (a) 109/180, (b) 180/180, (c) 81/180 LOS terhalang.');
const HASIL = {};
for (const pt of [[10, 26, '(a) gang G02-G05'], [18.48, -32.72, '(b) City Walk/G09'], [10, 17.6, '(c) tenggara plaza']]) {
  const px = pt[0], pz = pt[1];
  for (const mode of ['lama', 'baru']) {
    let nLosT = 0, nLosP = 0, nWallT = 0, nWallP = 0, minDist = Infinity, maxDolly = 0, nMinDist = 0;
    let frameBersihMax = 0;
    for (let d = 0; d < 360; d += 2) {
      const yaw = d * Math.PI / 180;
      const state = {
        camPos: new THREE.Vector3(px + Math.sin(yaw) * Math.cos(CAM_PITCH) * CAM_JARAK, Math.sin(CAM_PITCH) * CAM_JARAK + 0.6, pz + Math.cos(yaw) * Math.cos(CAM_PITCH) * CAM_JARAK),
        camJarakEfektif: CAM_JARAK,
      };
      let tgt = null, fBersih = -1;
      for (let f = 0; f < FRAME; f++) {
        tgt = langkah(px, pz, d, state, mode);
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
    console.log(pt[2] + ' mode ' + mode + ': 180 sektor — LOS terhalang camTarget ' + nLosT + '/180, camera.position ' + nLosP + '/180 | di dinding camTarget ' + nWallT + ', camPos ' + nWallP + ' | jarak kamera min ' + minDist.toFixed(2) + ' m | dolly-in maks ' + maxDolly.toFixed(2) + ' m | sektor di jarak min ' + nMinDist + '/180 | frame terakhir LOS bersih (maks) ' + frameBersihMax);
    HASIL[pt[2] + '/' + mode] = { nLosT, nLosP, nWallT, nWallP, minDist, maxDolly, nMinDist, frameBersihMax };
  }
  gate(HASIL[pt[2] + '/baru'].nLosP === 0, pt[2] + ' LOS terhalang camera.position 0/180 (baru)');
  gate(HASIL[pt[2] + '/baru'].nWallP === 0, pt[2] + ' camera.position di luar dinding 180/180 (baru)');
  gate(HASIL[pt[2] + '/baru'].nWallT === 0, pt[2] + ' camTarget di luar dinding 180/180 (baru)');
}

console.log('\n=== B. Regresi orbit layar masuk (r=17 m, y=6,2) — dorong LAMA vs BARU (tanpa pemain) ===');
(function () {
  let nOld = 0, nNew = 0, mxOld = 0, mxNew = 0, mxDelta = 0, nDelta = 0;
  for (let d = 0; d < 360; d++) {
    const a = d * Math.PI / 180;
    const x0 = Math.sin(a) * 17, z0 = Math.cos(a) * 17, y = 6.2;
    const vO = new THREE.Vector3(x0, y, z0); dorongLama(vO);
    const vN = new THREE.Vector3(x0, y, z0); dorongBaru(vN);
    const dO = dist(x0, z0, vO.x, vO.z), dN = dist(x0, z0, vN.x, vN.z);
    if (dO > 0) { nOld++; mxOld = Math.max(mxOld, dO); }
    if (dN > 0) { nNew++; mxNew = Math.max(mxNew, dN); }
    const dl = Math.abs(dN - dO);
    if (dl > 1e-9) { nDelta++; mxDelta = Math.max(mxDelta, dl); }
  }
  console.log('    360 titik orbit: didorong LAMA ' + nOld + ' titik (maks ' + mxOld.toFixed(2) + ' m), BARU ' + nNew + ' titik (maks ' + mxNew.toFixed(2) + ' m); titik berubah ' + nDelta + ', selisih maks ' + mxDelta.toFixed(3) + ' m');
  gate(nNew === nOld, 'jumlah titik orbit yang didorong SAMA');
  gate(mxDelta <= 0.001, 'selisih dorong orbit <= 0,001 m (maks ' + mxDelta.toFixed(4) + ' m)');
})();

console.log('\n=== C. Kasus kendali: plaza terbuka + titik jauh dari gedung ===');
(function () {
  // Plaza terbuka (0,0): tidak ada dorongan/dolly-in, kamera tetap 8,4 m.
  const px = 0, pz = 0;
  const state = { camPos: new THREE.Vector3(0, 3.08, 8.4), camJarakEfektif: CAM_JARAK };
  let tgt = null;
  for (let f = 0; f < FRAME; f++) tgt = langkah(px, pz, 0, state, 'baru');
  const dd = dist(px, pz, state.camPos.x, state.camPos.z);
  const d0exp = Math.sqrt(Math.pow(CAM_JARAK * Math.cos(CAM_PITCH), 2) + Math.pow(Math.sin(CAM_PITCH) * CAM_JARAK + 0.6 - EYE_Y, 2));
  console.log('    plaza (0,0) yaw 0: jarak kamera akhir (horizontal) ' + dd.toFixed(2) + ' m (ekspektasi tanpa dolly-in: ' + (CAM_JARAK * Math.cos(CAM_PITCH)).toFixed(2) + ' m), camJarakEfektif ' + state.camJarakEfektif.toFixed(2) + ' m (ekspektasi: ' + d0exp.toFixed(2) + ' m = jarak 3D mata->target), LOS ' + JSON.stringify(losList(px, pz, state.camPos.x, state.camPos.z)));
  gate(Math.abs(state.camJarakEfektif - d0exp) < 0.05, 'plaza terbuka: jarak efektif = jarak 3D tanpa dolly-in (' + state.camJarakEfektif.toFixed(2) + ' m)');
  gate(Math.abs(dd - CAM_JARAK * Math.cos(CAM_PITCH)) < 0.05, 'plaza terbuka: jarak kamera horizontal tetap (tidak ada dolly-in)');
})();

console.log('\n' + (FAIL === 0 ? 'SEMUA GERBANG LULUS' : FAIL + ' GERBANG GAGAL'));
process.exit(FAIL === 0 ? 0 : 1);
