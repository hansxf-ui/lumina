/* Harness kamera KAMERA-MARKA (2026-11-10) — Lumina.
   Merekonstruksi harness ronde sebelumnya (file /tmp hilang):
   - Fungsi dorongKeluarTapak() + tabel ZONA_LARANG_KAMERA diekstrak
     VERBATIM dari index.html hasil edit (regex, bukan salinan tangan).
   - Tabel lama ZONA_LARANG_VEG diekstrak dari backup
     index.html.bak-sebelum-kamera-marka-20261110 (untuk regresi orbit).
   - THREE r128 dari three.min.js (file yang dipakai game).
   - Tapak dinding SEJATI (wall rect, loader-local) diukur dari GLB
     per-mesh (glb.py): itulah ground truth "di dalam dinding".
     OBB adalah taksiran; dinding adalah kenyataan.
   - KOREKSI 2026-11-10: draf pertama harness ini sempat menguji
     "celah G04 0,085 m" dari hitung tangan (cos/sin dibulatkan) —
     SALAH. Hitung eksak membuktikan under-cover semua OBB hanya
     0,003-0,013 m (pembulatan 2 desimal), jauh di dalam margin
     dorong 0,3 m. Tidak ada celah; tabel kamera = salinan verbatim.
   - CATATAN TEPI: titik hasil dorong duduk TEPAT di tepi +0,3 m,
     jadi uji inklusif (<=) masih mencantumkan OBB-nya sesudah
     dorong. Itu artefak uji, bukan kegagalan: buktinya DINDING=[]
     — kamera 0,3 m di luar muka dinding. Gerbang memakai DINDING.
   Jalankan: node audit/plan/uji-kamera-marka.cjs
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
function extractFn(src) {
  const m = src.match(/function dorongKeluarTapak\(v\)\{[\s\S]*?\n\}/);
  if (!m) throw new Error('dorongKeluarTapak tidak ketemu');
  return m[0];
}
const KAM = extractTable(html, 'ZONA_LARANG_KAMERA');
const VEG = extractTable(bak, 'ZONA_LARANG_VEG');
const FN_SRC = extractFn(html);
if (!FN_SRC.includes('ZONA_LARANG_KAMERA')) throw new Error('fungsi hasil edit TIDAK memakai ZONA_LARANG_KAMERA');
if (FN_SRC.includes('ZONA_LARANG_VEG')) throw new Error('fungsi hasil edit masih menyebut ZONA_LARANG_VEG');
// Tabel VEG di file hasil edit harus identik dengan backup:
const VEG_NOW = extractTable(html, 'ZONA_LARANG_VEG');
if (JSON.stringify(VEG_NOW) !== JSON.stringify(VEG)) throw new Error('ZONA_LARANG_VEG BERUBAH — dilarang!');
console.log('tabel: KAMERA=' + KAM.length + ' baris, VEG=' + VEG.length + ' baris (VEG identik backup OK)');
console.log('fungsi memakai ZONA_LARANG_KAMERA OK; logika dorong tidak disentuh (dicek string).');

// Bangun fungsi dorong untuk tabel mana pun (sumber verbatim, tabel diparameterisasi
// lewat pergantian nama — isi logika SAMA PERSIS dengan yang di index.html).
function makeDorong(table) {
  const src = FN_SRC.replace(/ZONA_LARANG_KAMERA/g, 'TABEL');
  const fn = new Function('TABEL', src + '\nreturn dorongKeluarTapak;')(table);
  return fn;
}
const dorongKam = makeDorong(KAM);
const dorongVeg = makeDorong(VEG);

// ---- Tapak dinding sejati (GLB per-mesh, loader-local) ----
// [nama, loaderX, loaderZ, ry, scale, x0, x1, z0, z1]
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
function inOBB(x, z, o, m) {
  const dx = x - o[0], dz = z - o[1], c = Math.cos(o[4]), s = Math.sin(o[4]);
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.abs(lx) <= o[2] + m && Math.abs(lz) <= o[3] + m;
}
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
const OBB_NAMES = ['G01','G02','G03','G04','G05','G06','G07','G08','G09','G10','Kopi','Roti','Buku','Bunga','EsKrim','StudioFoto','Teh','Mainan','MenaraJam','Gerbang','Gerobak1','Gerobak2','GerobakEs'];
function obbList(x, z, y, table) {
  const out = [];
  for (let i = 0; i < table.length; i++) if (y < table[i][5] && inOBB(x, z, table[i], 0.3)) out.push(OBB_NAMES[i]);
  return out;
}
function wallList(x, z) { return WALLS.filter(w => inWall(x, z, w)).map(w => w[0]); }
function losList(px, pz, cx, cz) { return WALLS.filter(w => segHitsWall(px, pz, cx, cz, w)).map(w => w[0]); }
function dist(ax, az, bx, bz) { return Math.hypot(bx - ax, bz - az); }

let FAIL = 0;
function gate(ok, msg) { console.log((ok ? '  LULUS  ' : '  GAGAL  ') + msg); if (!ok) FAIL++; }

console.log('\n=== A. Titik insiden: camTarget (2x dorong) & camera.position (1x dorong) ===');
console.log('    y kamera 3,08 m (pitch default 0,30, camJarak 8,4). Kriteria: sesudah dorong');
console.log('    titik HARUS di luar semua DINDING (ground truth GLB) + di luar/di tepi OBB.');
const CASES = [
  // [label, px, pz, yawDeg, keterangan]
  ['(a) gang G02-G05, yaw 0 (kamera selatan, default)', 10, 26, 0, 'camTarget di dalam G05'],
  ['(a) gang G02-G05, yaw 140 (kamera utara)', 10, 26, 140, 'camTarget di dalam G02'],
  ['(a) gang G02-G05, yaw 90 (kamera timur)', 10, 26, 90, 'camTarget di luar OBB, LOS terhalang G02'],
  ['(a) gang G02-G05, yaw 180 (kamera utara, =titik c)', 10, 26, 180, 'camTarget di dalam G02'],
  ['(b) City Walk/G09, yaw 0 (kamera utara)', 18.48, -32.72, 0, 'camTarget di dalam G09'],
  ['(b) City Walk/G09, yaw 90 (kamera timur)', 18.48, -32.72, 90, 'camTarget di dalam G09 (tepi)'],
  ['(b) City Walk/G09, yaw 180 (kamera selatan)', 18.48, -32.72, 180, 'camTarget di dalam Es Krim'],
  ['(b) City Walk/G09, yaw 270 (kamera barat)', 18.48, -32.72, 270, 'camTarget di luar OBB, LOS terhalang G09'],
  ['(b) City Walk/G09, yaw 150 (kamera tenggara)', 18.48, -32.72, 150, 'camTarget di dalam Es Krim'],
  ['(c) tenggara plaza, yaw 0 (kamera selatan, default)', 10, 17.6, 0, 'camTarget di luar OBB, LOS terhalang G02'],
  ['(c) tenggara plaza, yaw 60 (kamera tenggara)', 10, 17.6, 60, 'camTarget di dalam G02'],
  ['(c) tenggara plaza, yaw 180 (kamera utara, kontrol bersih)', 10, 17.6, 180, 'tidak ada dorongan, LOS bersih'],
  ['(c) tenggara plaza, yaw 270 (kamera barat, kontrol bersih)', 10, 17.6, 270, 'tidak ada dorongan, LOS bersih'],
];
let maxPush = 0, maxPushCase = '';
for (const c of CASES) {
  const label = c[0], px = c[1], pz = c[2], yaw = c[3] * Math.PI / 180;
  const cx0 = px + Math.sin(yaw) * 8.4, cz0 = pz + Math.cos(yaw) * 8.4, y = 3.08;
  const preO = obbList(cx0, cz0, y, KAM), preW = wallList(cx0, cz0), preL = losList(px, pz, cx0, cz0);
  // camTarget: 2x dorong (seperti kode)
  const vT = new THREE.Vector3(cx0, y, cz0);
  dorongKam(vT); dorongKam(vT);
  const dT = dist(cx0, cz0, vT.x, vT.z);
  const postTO = obbList(vT.x, vT.z, y, KAM), postTW = wallList(vT.x, vT.z), postTL = losList(px, pz, vT.x, vT.z);
  // camera.position: 1x dorong (seperti kode, sesudah lerp)
  const vP = new THREE.Vector3(cx0, y, cz0);
  dorongKam(vP);
  const dP = dist(cx0, cz0, vP.x, vP.z);
  const postPO = obbList(vP.x, vP.z, y, KAM), postPW = wallList(vP.x, vP.z), postPL = losList(px, pz, vP.x, vP.z);
  if (dT > maxPush) { maxPush = dT; maxPushCase = label + ' (camTarget)'; }
  console.log(label + ' — ' + c[4]);
  console.log('    sebelum: OBB=' + JSON.stringify(preO) + ' DINDING=' + JSON.stringify(preW) + ' LOS=' + JSON.stringify(preL));
  console.log('    camTarget 2x: dorong ' + dT.toFixed(2) + ' m -> (' + vT.x.toFixed(2) + ',' + vT.z.toFixed(2) + ') OBB=' + JSON.stringify(postTO) + ' DINDING=' + JSON.stringify(postTW) + ' LOS=' + JSON.stringify(postTL));
  console.log('    camPos    1x: dorong ' + dP.toFixed(2) + ' m -> (' + vP.x.toFixed(2) + ',' + vP.z.toFixed(2) + ') OBB=' + JSON.stringify(postPO) + ' DINDING=' + JSON.stringify(postPW) + ' LOS=' + JSON.stringify(postPL));
  gate(postTW.length === 0, 'camTarget keluar dinding: ' + label);
  gate(postPW.length === 0, 'camera.position keluar dinding: ' + label);
}
console.log('    Dorongan maksimum di titik insiden: ' + maxPush.toFixed(2) + ' m — ' + maxPushCase);
if (maxPush > 3.5) console.log('    PERHATIAN JUJUR: dorongan >3,5 m ADA (' + maxPush.toFixed(2) + ' m) — kamera didorong selebar setengah bangunan; itu perilaku tabel lama juga (nilai OBB sama), bukan efek edit ini.');

console.log('\n=== B. Sapuan yaw penuh per titik (langkah 2 deg, y=3,08) ===');
for (const pt of [[10, 26, '(a)'], [18.48, -32.72, '(b)'], [10, 17.6, '(c)']]) {
  const px = pt[0], pz = pt[1];
  let nPreO = 0, nPreW = 0, nPostW = 0, nPostLos = 0, nLosPre = 0, mx = 0;
  for (let d = 0; d < 360; d += 2) {
    const yaw = d * Math.PI / 180;
    const cx0 = px + Math.sin(yaw) * 8.4, cz0 = pz + Math.cos(yaw) * 8.4, y = 3.08;
    if (obbList(cx0, cz0, y, KAM).length) nPreO++;
    if (wallList(cx0, cz0).length) nPreW++;
    if (losList(px, pz, cx0, cz0).length) nLosPre++;
    const v = new THREE.Vector3(cx0, y, cz0);
    dorongKam(v); dorongKam(v);
    if (wallList(v.x, v.z).length) nPostW++;
    if (losList(px, pz, v.x, v.z).length) nPostLos++;
    mx = Math.max(mx, dist(cx0, cz0, v.x, v.z));
  }
  console.log(pt[2] + ' pemain (' + px + ',' + pz + '): 180 sampel — sebelum: di OBB ' + nPreO + ', di DINDING ' + nPreW + ', LOS terhalang ' + nLosPre + ' | sesudah 2x: di DINDING ' + nPostW + ', LOS terhalang ' + nPostLos + ' | dorong maks ' + mx.toFixed(2) + ' m');
  gate(nPostW === 0, pt[2] + ' tidak ada sampel tersisa di dalam dinding sesudah dorong');
}

console.log('\n=== C. Audit cakupan: setiap titik dinding HARUS memicu dorongan ===');
console.log('    (under-cover OBB vs wall rect, diukur eksak; gerbang: under-cover < 0,30 m');
console.log('    = dinding selalu di dalam zona dorong +0,3 m, jadi kamera di dalam dinding pasti didorong)');
(function () {
  // [nama, loaderX, loaderZ, ry, scale, x0,x1, z0,z1, obbIdx] — wall rect GLB
  const AUDIT = [
    ['G02', 15, 20, 3.785, 1.0, -4.40, 4.40, -4.25, 4.45, 1],
    ['G03', -24, 20, 5.4045, 1.0, -5.05, 5.05, -4.84, 4.41, 2],
    ['G04', -15, 37.4, 5.9026, 1.0, -3.20, 3.20, -30.42, -11.60, 3],
    ['G05', 10, 33, 0.1797, 1.0, -4.03, 3.95, -4.65, 3.45, 4],
    ['G07', 30, 17, 1.2491, 1.0, -5.36, 5.36, -4.39, 4.35, 6],
    ['G08', 34.8, -15, 1.9029, 1.0, -3.67, 3.67, -3.90, 3.42, 7],
    ['G09', 20, -27, 2.5041, 1.0, -5.35, 5.15, -6.83, 8.35, 8],
    ['G10', -14, -33, 3.3215, 1.0, -7.35, 7.35, -4.90, 4.90, 9],
    ['EsKrim', 15.2, -44, -1.5708, 1.5, -3.75, 3.75, -4.82, 2.90, 14],
    ['Kopi', -8.4, -44, 1.5708, 1.7, -3.35, 3.35, -4.65, 2.90, 10],
  ];
  let worst = 0, worstName = '';
  for (const a of AUDIT) {
    const px = a[1], pz = a[2], ry = a[3], sc = a[4], o = KAM[a[9]];
    const c = Math.cos(ry), s = Math.sin(ry), co = Math.cos(o[4]), so = Math.sin(o[4]);
    function toObb(lx, lz) {
      const wx = px + sc * (lx * c + lz * s), wz = pz + sc * (-lx * s + lz * c);
      const dx = wx - o[0], dz = wz - o[1];
      return [dx * co - dz * so, dx * so + dz * co];
    }
    const cs = [toObb(a[5], a[7]), toObb(a[5], a[8]), toObb(a[6], a[7]), toObb(a[6], a[8])];
    const ox = cs.map(q => q[0]), oz = cs.map(q => q[1]);
    const under = Math.max(-o[2] - Math.min(...ox), Math.max(...ox) - o[2], -o[3] - Math.min(...oz), Math.max(...oz) - o[3]);
    if (under > worst) { worst = under; worstName = a[0]; }
    console.log('    ' + a[0] + ': under-cover ' + under.toFixed(3) + ' m' + (under < 0.3 ? '' : ' <<< MELEBIHI MARGIN'));
    gate(under < 0.3, a[0] + ' dinding tertutup zona dorong (under-cover ' + under.toFixed(3) + ' m < 0,30 m)');
  }
  console.log('    under-cover terburuk: ' + worst.toFixed(3) + ' m (' + worstName + ') — murni pembulatan, bukan celah.');
  // Tabel kamera harus identik dengan VEG (verbatim):
  gate(JSON.stringify(KAM) === JSON.stringify(VEG), 'ZONA_LARANG_KAMERA identik ZONA_LARANG_VEG (salinan verbatim, 23/23 nilai sama)');
})();

console.log('\n=== D. Regresi orbit layar masuk (r=17 m, y=6,2) — tabel LAMA vs BARU ===');
(function () {
  let nOld = 0, nNew = 0, mxOld = 0, mxNew = 0, mxDelta = 0, nDelta = 0;
  for (let d = 0; d < 360; d++) {
    const a = d * Math.PI / 180;
    const x0 = Math.sin(a) * 17, z0 = Math.cos(a) * 17, y = 6.2;
    const vO = new THREE.Vector3(x0, y, z0); dorongVeg(vO);
    const vN = new THREE.Vector3(x0, y, z0); dorongKam(vN);
    const dO = dist(x0, z0, vO.x, vO.z), dN = dist(x0, z0, vN.x, vN.z);
    if (dO > 0) { nOld++; mxOld = Math.max(mxOld, dO); }
    if (dN > 0) { nNew++; mxNew = Math.max(mxNew, dN); }
    const dl = Math.abs(dN - dO);
    if (dl > 1e-9) { nDelta++; mxDelta = Math.max(mxDelta, dl); }
  }
  console.log('    360 titik orbit: didorong LAMA ' + nOld + ' titik (maks ' + mxOld.toFixed(2) + ' m, busur G04 — by design sejak JEMBATAN), BARU ' + nNew + ' titik (maks ' + mxNew.toFixed(2) + ' m)');
  console.log('    titik yang berubah perilakunya: ' + nDelta + ', selisih dorong maks ' + mxDelta.toFixed(3) + ' m (tabel baru = salinan verbatim, jadi harus 0)');
  gate(nNew === nOld, 'jumlah titik orbit yang didorong SAMA (tidak ada titik terbuka baru yang didorong)');
  gate(mxDelta <= 0.10, 'selisih dorong orbit <= 0,10 m (maks ' + mxDelta.toFixed(3) + ' m)');
})();

console.log('\n=== E. Temuan samping (INFO, bukan gerbang): tumpang-tindih OBB G10<->Kopi ===');
(function () {
  // Titik di zona tumpuk (grid 0,1 m): (-13,5,-38,2) — di dalam kedua OBB +0,3
  const v = new THREE.Vector3(-13.5, 3.08, -38.2);
  console.log('    titik (-13,50,-38,20): OBB=' + JSON.stringify(obbList(v.x, v.z, 3.08, KAM)) + ' DINDING=' + JSON.stringify(wallList(v.x, v.z)));
  dorongKam(v); dorongKam(v);
  console.log('    sesudah 2x dorong -> (' + v.x.toFixed(2) + ',' + v.z.toFixed(2) + ') OBB=' + JSON.stringify(obbList(v.x, v.z, 3.08, KAM)) + ' (ping-pong G10<->Kopi: titik mendarat di tepi OBB tetangga; bukan titik insiden a/b/c — dilaporkan untuk tindak lanjut)');
})();

console.log('\n' + (FAIL === 0 ? 'SEMUA GERBANG LULUS' : FAIL + ' GERBANG GAGAL'));
process.exit(FAIL === 0 ? 0 : 1);
