// node zfix.js in.glb [out.glb] [--dry] [--delta 0.005] [--minA 0.0005]
// Pemecah z-fighting umum di dalam satu GLB (semua arah bidang, bukan hanya datar).
// 1) Semua segitiga diubah ke koordinat model (rantai transform node).
// 2) Komponen = verteks tersambung per NODE (lintas primitive/material, dilas per posisi 0,1 mm).
// 3) Bidang dikunci (normal dibulatkan 0,02 + jarak d dibulatkan 1,5 mm, cek tetangga d±1).
//    Pasangan segitiga dari komponen BERBEDA atau material berbeda yang koplanar (|Δd| < 1,5 mm)
//    dan luas tumpangnya (klip Sutherland–Hodgman 2D) > minA dicatat:
//      - searah (n·n' > 0,999): muka depan saling tumpuk -> yang luasnya lebih kecil (list/hiasan)
//        digeser +delta searah normalnya (keluar, di depan);
//      - berlawanan (n·n' < -0,999) dan kedua material doubleSided: punggung-ke-punggung ->
//        yang lebih kecil digeser -delta (menjauh dari yang lain).
//    Komponen berbeda: SELURUH komponen digeser (tidak ada retak). Komponen sama: hanya verteks
//    segitiga sisi yang lebih kecil.
// 4) Muka bawah (n.y < -0,9) di y <= 0,05 dilewati (alas di atas tanah, tak pernah terlihat).
// Keluaran: daftar pasangan + total luas; tulis GLB bila tidak --dry.
const L = require('./glblib');
const argv = process.argv.slice(2);
const inF = argv[0], outF = (argv[1] && !argv[1].startsWith('--')) ? argv[1] : inF;
const DRY = argv.includes('--dry');
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? +argv[i + 1] : d; };
const DELTA = opt('--delta', 0.005), MINA = opt('--minA', 0.0005), TOLD = 0.0015;
const g = L.load(inF), J = g.json;

// ---------- matriks ----------
function compose(t, r, s){
  t = t || [0, 0, 0]; r = r || [0, 0, 0, 1]; s = s || [1, 1, 1];
  const [x, y, z, w] = r;
  const R = [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w),
             2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w),
             2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)];   // kolom
  return [R[0] * s[0], R[1] * s[0], R[2] * s[0], 0, R[3] * s[1], R[4] * s[1], R[5] * s[1], 0, R[6] * s[2], R[7] * s[2], R[8] * s[2], 0, t[0], t[1], t[2], 1];
}
function mul(a, b){ const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++){ let v = 0; for (let k = 0; k < 4; k++) v += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = v; } return o; }
function inv(m){ // affine
  const a = m, det = a[0] * (a[5] * a[10] - a[9] * a[6]) - a[4] * (a[1] * a[10] - a[9] * a[2]) + a[8] * (a[1] * a[6] - a[5] * a[2]);
  const i = new Array(16).fill(0);
  i[0] = (a[5] * a[10] - a[9] * a[6]) / det; i[4] = -(a[4] * a[10] - a[8] * a[6]) / det; i[8] = (a[4] * a[9] - a[8] * a[5]) / det;
  i[1] = -(a[1] * a[10] - a[9] * a[2]) / det; i[5] = (a[0] * a[10] - a[8] * a[2]) / det; i[9] = -(a[0] * a[9] - a[8] * a[1]) / det;
  i[2] = (a[1] * a[6] - a[5] * a[2]) / det; i[6] = -(a[0] * a[6] - a[4] * a[2]) / det; i[10] = (a[0] * a[5] - a[4] * a[1]) / det;
  for (let r = 0; r < 3; r++) i[12 + r] = -(i[r] * a[12] + i[4 + r] * a[13] + i[8 + r] * a[14]);
  i[15] = 1; return i;
}
const tp = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
const tv = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2], m[1] * p[0] + m[5] * p[1] + m[9] * p[2], m[2] * p[0] + m[6] * p[1] + m[10] * p[2]];

// ---------- kumpulkan node bermesh + matriks dunia ----------
const nodesW = [];
function walk(ni, M){
  const n = J.nodes[ni]; const W = mul(M, n.matrix || compose(n.translation, n.rotation, n.scale));
  if (n.mesh != null) nodesW.push({ ni, W });
  (n.children || []).forEach(c => walk(c, W));
}
J.scenes[J.scene || 0].nodes.forEach(ni => walk(ni, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
const meshUse = {}; nodesW.forEach(e => { const m = J.nodes[e.ni].mesh; meshUse[m] = (meshUse[m] || 0) + 1; });

// ---------- segitiga ----------
const parts = [];   // {ni, pi, P(Float32 lokal), I, W, Winv, vbase}
const TRI = [];     // {part, a,b,c (indeks verteks global), n, d, area, comp, mat, ds}
let gv = 0; const VW = []; // posisi dunia per verteks global
nodesW.forEach(({ ni, W }) => {
  const node = J.nodes[ni];
  J.meshes[node.mesh].primitives.forEach((p, pi) => {
    if (p.mode != null && p.mode !== 4) return;
    const P = L.read(g, p.attributes.POSITION), N = p.attributes.NORMAL != null ? L.read(g, p.attributes.NORMAL) : null;
    const I = p.indices != null ? L.read(g, p.indices) : Uint32Array.from({ length:P.length / 3 }, (_, i) => i);
    const part = { ni, pi, p, P, N, I, W, Winv:inv(W), vbase:gv, shared:meshUse[node.mesh] > 1 };
    parts.push(part);
    for (let i = 0; i < P.length / 3; i++) VW.push(tp(W, [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]));
    gv += P.length / 3;
    const mat = J.materials[p.material] || {};
    for (let t = 0; t < I.length; t += 3){
      const a = part.vbase + I[t], b = part.vbase + I[t + 1], c = part.vbase + I[t + 2];
      const A = VW[a], B = VW[b], C = VW[c];
      const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
      let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const l = Math.hypot(...n); if (l < 1e-9) continue;
      n = n.map(x => x / l);
      if (N){ const vn = tv(W, [N[I[t] * 3], N[I[t] * 3 + 1], N[I[t] * 3 + 2]]); if (vn[0] * n[0] + vn[1] * n[1] + vn[2] * n[2] < 0) n = n.map(x => -x); }
      const d = n[0] * A[0] + n[1] * A[1] + n[2] * A[2];
      if (n[1] < -0.9 && Math.max(A[1], B[1], C[1]) <= 0.05) continue;
      TRI.push({ part:parts.length - 1, ti:t, a, b, c, n, d, area:l / 2, mat:p.material, matName:mat.name || ('m' + p.material), ds:!!mat.doubleSided, node:node.name });
    }
  });
});
// ---------- komponen per node (las posisi lintas primitive) ----------
const par = new Int32Array(gv); for (let i = 0; i < gv; i++) par[i] = i;
const f = x => { while (par[x] !== x){ par[x] = par[par[x]]; x = par[x]; } return x; };
const un = (a, b) => { a = f(a); b = f(b); if (a !== b) par[b] = a; };
{ const key = new Map(); let pi = 0;
  parts.forEach(pt => { for (let i = 0; i < pt.P.length / 3; i++){ const w = VW[pt.vbase + i]; const k = pt.ni + '|' + w.map(x => Math.round(x * 1e4)).join(','); if (key.has(k)) un(key.get(k), pt.vbase + i); else key.set(k, pt.vbase + i); } }); }
TRI.forEach(t => { un(t.a, t.b); un(t.a, t.c); });
TRI.forEach(t => { t.comp = f(t.a); });
// ---------- komponen KEMBAR (geometri identik, material sama) -> hapus salinannya ----------
// Salinan identik tak terlihat berkedip (warna sama) tetapi menggandakan muka koplanar; bila
// salah satunya digeser sebagian (konflik dengan benda lain) kedipnya justru muncul.
const compTris = new Map(); TRI.forEach((t, i) => { (compTris.get(t.comp) || compTris.set(t.comp, []).get(t.comp)).push(i); });
const sig = new Map(), buang = new Set(); let nKembar = 0;
for (const [c, list] of compTris){
  const pts = []; list.forEach(i => { const t = TRI[i]; [t.a, t.b, t.c].forEach(v => pts.push(VW[v].map(x => Math.round(x * 1e4)).join(','))); });
  pts.sort();
  const k = TRI[list[0]].mat + '|' + list.length + '|' + pts.join(';');
  if (sig.has(k)){ list.forEach(i => buang.add(i)); nKembar++; } else sig.set(k, c);
}
const TRI_ALL = TRI.slice();
if (buang.size){ const keep = TRI.filter((t, i) => !buang.has(i)); TRI.length = 0; keep.forEach(t => TRI.push(t)); }
const compArea = new Map(); TRI.forEach(t => compArea.set(t.comp, (compArea.get(t.comp) || 0) + t.area));

// ---------- 2D overlap ----------
function basis(n){ const a = Math.abs(n[0]) > Math.abs(n[1]) ? (Math.abs(n[0]) > Math.abs(n[2]) ? 0 : 2) : (Math.abs(n[1]) > Math.abs(n[2]) ? 1 : 2); return [[1, 2], [0, 2], [0, 1]][a]; }
function poly2(t, ax){ return [VW[t.a], VW[t.b], VW[t.c]].map(p => [p[ax[0]], p[ax[1]]]); }
function areaP(P){ let s = 0; for (let i = 0; i < P.length; i++){ const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function clip(subj, clipP){
  let out = subj; const cw = areaP(clipP) < 0 ? clipP.slice().reverse() : clipP;
  for (let i = 0; i < cw.length && out.length; i++){
    const A = cw[i], B = cw[(i + 1) % cw.length], inp = out; out = [];
    const side = p => (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]);
    for (let j = 0; j < inp.length; j++){
      const P = inp[j], Q = inp[(j + 1) % inp.length], sp = side(P), sq = side(Q);
      if (sp >= 0) out.push(P);
      if ((sp >= 0) !== (sq >= 0)){ const s = sp / (sp - sq); out.push([P[0] + (Q[0] - P[0]) * s, P[1] + (Q[1] - P[1]) * s]); }
    }
  }
  return out.length >= 3 ? Math.abs(areaP(out)) : 0;
}
// ---------- bucket bidang ----------
const B = new Map();
const kN = n => n.map(x => Math.round(x * 50)).join(',');
TRI.forEach((t, i) => {
  const kd = Math.round(t.d / TOLD);
  const k = kN(t.n) + '|' + kd; (B.get(k) || B.set(k, []).get(k)).push(i);
});
const pairs = new Map();   // key compA|compB|jenis -> {area, ...}
function bb(t, ax){ const P = poly2(t, ax); return [Math.min(P[0][0], P[1][0], P[2][0]), Math.min(P[0][1], P[1][1], P[2][1]), Math.max(P[0][0], P[1][0], P[2][0]), Math.max(P[0][1], P[1][1], P[2][1])]; }
const seen = new Set();
for (const [k, list] of B){
  const [nk, kdS] = k.split('|'), kd = +kdS;
  const nArr = nk.split(',').map(Number), nNeg = nArr.map(x => -x).join(',');
  const cand = [];
  for (const dd of [-1, 0, 1]){ const l2 = B.get(nk + '|' + (kd + dd)); if (l2) cand.push(...l2.map(i => [i, 1])); }
  for (const dd of [-1, 0, 1]){ const l2 = B.get(nNeg + '|' + (-kd + dd)); if (l2) cand.push(...l2.map(i => [i, -1])); }
  for (const i of list){
    const ti = TRI[i], ax = basis(ti.n), bi = bb(ti, ax);
    for (const [j, sg] of cand){
      if (j === i) continue;
      const tj = TRI[j];
      if (j <= i) continue;   // pasangan tak berurut sekali (relasi tetangga d±1 simetris)
      const dot = ti.n[0] * tj.n[0] + ti.n[1] * tj.n[1] + ti.n[2] * tj.n[2];
      if (sg > 0 ? dot < 0.999 : dot > -0.999) continue;
      if (Math.abs(sg > 0 ? ti.d - tj.d : ti.d + tj.d) > TOLD) continue;
      if (sg < 0) continue;   // punggung-ke-punggung = benda padat bertumpuk (alas di atas lantai): permukaan tertutup, tak terlihat
      if (ti.comp === tj.comp && ti.mat === tj.mat) continue;   // satu benda, satu material: muka ganda internal, warna/tekstur sama
      if (ti.comp === tj.comp && sg < 0) continue;   // punggung-ke-punggung dalam satu benda = cangkang tipis, wajar
      const bj = bb(tj, ax);
      if (bi[2] < bj[0] || bj[2] < bi[0] || bi[3] < bj[1] || bj[3] < bi[1]) continue;
      const A = clip(poly2(ti, ax), poly2(tj, ax));
      if (A <= 1e-7) continue;
      // proyeksi ke sumbu dominan: luas sebenarnya = A / |n[axis]|
      const nax = [0, 1, 2].find(q => !ax.includes(q)), Ar = A / Math.abs(ti.n[nax]);
      const key = (ti.comp === tj.comp ? 'S' : 'K') + (sg > 0 ? '+' : '-') + '|' + Math.min(ti.comp, tj.comp) + '|' + Math.max(ti.comp, tj.comp) + (ti.comp === tj.comp ? '|' + Math.min(ti.mat, tj.mat) + '|' + Math.max(ti.mat, tj.mat) : '');
      const e = pairs.get(key) || { area:0, sg, ci:ti.comp, cj:tj.comp, tris:{}, n:ti.n, d:ti.d, names:[ti.node + ':' + ti.matName, tj.node + ':' + tj.matName], contoh:VW[ti.a] };
      e.area += Ar; (e.tris[ti.comp + ':' + ti.mat] = e.tris[ti.comp + ':' + ti.mat] || new Set()).add(i); (e.tris[tj.comp + ':' + tj.mat] = e.tris[tj.comp + ':' + tj.mat] || new Set()).add(j);
      pairs.set(key, e);
    }
  }
}
// ---------- keputusan geser ----------
const geserKomp = new Map();   // comp -> [dx,dy,dz]
const geserVert = new Map();   // vertex global -> [dx,dy,dz]
let tot = 0; const lapor = [];
for (const [key, e] of pairs){
  if (e.area < MINA) continue;
  tot += e.area;
  const sides = Object.keys(e.tris);
  // sisi kecil: bila komponen berbeda -> komponen luas total lebih kecil; bila sama -> himpunan segitiga lebih kecil
  let move, nrm;
  if (key[0] === 'K'){
    const ai = compArea.get(e.ci), aj = compArea.get(e.cj); const c = ai <= aj ? e.ci : e.cj;
    const tri0 = TRI[[...e.tris[sides.find(s => +s.split(':')[0] === c)]][0]];
    nrm = tri0.n.map(x => x * (e.sg > 0 ? 1 : -1) * DELTA);
    const prev = geserKomp.get(c) || [0, 0, 0];
    // gabung arah unik (maks per sumbu bertanda)
    geserKomp.set(c, prev.map((v, q) => Math.abs(nrm[q]) > Math.abs(v) ? nrm[q] : v));
    move = 'komponen ' + c;
  } else {
    const srt = sides.map(s => [s, [...e.tris[s]].reduce((a, i) => a + TRI[i].area, 0)]).sort((a, b) => a[1] - b[1]);
    const sa = srt[0][0], sb = srt.length > 1 ? srt[1][0] : null;
    // hanya verteks milik sisi kecil yang TIDAK dipakai sisi lain (verteks bersama = menggeser
    // keduanya, tidak memisahkan, dan menumpuk geseran tiap pass)
    const lain = new Set(); if (sb) [...e.tris[sb]].forEach(i => { const t = TRI[i]; lain.add(t.a); lain.add(t.b); lain.add(t.c); });
    let nGeser = 0;
    [...e.tris[sa]].forEach(i => { const t = TRI[i]; const nn = t.n.map(x => x * DELTA); [t.a, t.b, t.c].forEach(v => { if (lain.has(v)) return; nGeser++; const prev = geserVert.get(v) || [0, 0, 0]; geserVert.set(v, prev.map((q, k) => Math.abs(nn[k]) > Math.abs(q) ? nn[k] : q)); }); });
    move = nGeser ? 'segitiga ' + sa : 'LEWAT (verteks bersama)';
  }
  lapor.push({ m2:+e.area.toFixed(3), jenis:key.slice(0, 2), a:e.names[0], b:e.names[1], n:e.n.map(x => +x.toFixed(2)), contoh:e.contoh.map(x => +x.toFixed(2)), geser:move });
}
lapor.sort((a, b) => b.m2 - a.m2);
console.log(JSON.stringify({ file:inF, tri:TRI.length, pasangan:lapor.length, m2:+tot.toFixed(2), komp:geserKomp.size, vert:geserVert.size, kembar:nKembar, segitigaKembar:buang.size }));
lapor.slice(0, +(process.env.TOP || 25)).forEach(r => console.log('  ', r.m2, r.jenis, r.n.join(','), r.contoh.join(','), r.a, '||', r.b, '->', r.geser));
if (DRY || (!lapor.length && !buang.size)) process.exit(0);
// ---------- terapkan ----------
let ubah = 0;
parts.forEach(pt => {
  if (pt.shared){ return; }
  let kena = false; const P = pt.P;
  for (let i = 0; i < P.length / 3; i++){
    const gvI = pt.vbase + i; const c = f(gvI);
    const dK = geserKomp.get(c), dV = geserVert.get(gvI);
    if (!dK && !dV) continue;
    const w = VW[gvI].slice(); const d = [0, 1, 2].map(q => (dK ? dK[q] : 0) + (dV ? dV[q] : 0));
    const l = tp(pt.Winv, [w[0] + d[0], w[1] + d[1], w[2] + d[2]]);
    P[i * 3] = l[0]; P[i * 3 + 1] = l[1]; P[i * 3 + 2] = l[2]; kena = true; ubah++;
  }
  if (kena) pt.p.attributes.POSITION = L.addAccessor(g, P, 'VEC3');
});
// hapus segitiga salinan kembar dari index primitive-nya
if (buang.size){
  const perPart = new Map(); [...buang].forEach(i => { const t = TRI_ALL[i]; (perPart.get(t.part) || perPart.set(t.part, new Set()).get(t.part)).add(t.ti); });
  for (const [pi, set] of perPart){
    const pt = parts[pi]; if (pt.shared) continue;
    const I2 = []; for (let t = 0; t < pt.I.length; t += 3) if (!set.has(t)) I2.push(pt.I[t], pt.I[t + 1], pt.I[t + 2]);
    const big = pt.P.length / 3 > 65535;
    pt.p.indices = L.addAccessor(g, big ? new Uint32Array(I2) : new Uint16Array(I2), 'SCALAR', true);
  }
}
const shared = parts.filter(p => p.shared).length;
L.save(g, outF);
console.log('tulis', outF, 'verteks digeser', ubah, shared ? '(lewati ' + shared + ' primitive mesh bersama)' : '');
