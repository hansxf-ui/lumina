// gedung-aula-v1e.glb = v1d + lambris (panel putih, list emas, list atas plester gelap) di dinding
// depan dalam TIDAK lagi melintang di bukaan pintu utama (x lokal -1,2..1,2): sebelumnya list
// setinggi 0,38–1,41 m menutup pintu (tak terlihat dari luar karena daun pintu, jadi pemain
// tidak bisa masuk). Segitiga dipotong (Sutherland–Hodgman, atribut diinterpolasi) di x = ±1,19,
// ujung ditutup tiang lambris putih 5 cm + tutup list plester gelap.
const L = require('./glblib');
const g = L.load('../lumina/gedung-aula-v1d.glb'), J = g.json;
const XC = 1.19, ZR = [-4.40, -4.27], YR = [0.30, 1.45];
const users = {}; J.nodes.forEach(n => { if (n.mesh != null) users[n.mesh] = (users[n.mesh] || 0) + 1; });

function clipPoly(poly, keep){ // poly: [{p:[x,y,z], n:[..], t:[..]}], keep(x)>=0 kept
  const out = [];
  for (let i = 0; i < poly.length; i++){
    const a = poly[i], b = poly[(i + 1) % poly.length], da = keep(a.p[0]), db = keep(b.p[0]);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)){
      const s = da / (da - db), L3 = (u, v) => u.map((x, k) => x + (v[k] - x) * s);
      const n = L3(a.n, b.n), ln = Math.hypot(...n) || 1;
      out.push({ p:L3(a.p, b.p), n:n.map(x => x / ln), t:L3(a.t, b.t) });
    }
  }
  return out;
}

function proses(nodeName, tambah){
  const node = J.nodes.find(n => n.name === nodeName);
  if (users[node.mesh] !== 1) throw new Error('mesh dipakai bersama ' + nodeName);
  if (node.rotation) throw new Error('rotasi ' + nodeName);
  const T = node.translation || [0, 0, 0], S = node.scale || [1, 1, 1];
  const p = J.meshes[node.mesh].primitives[0];
  const P = L.read(g, p.attributes.POSITION), N = L.read(g, p.attributes.NORMAL), UV = L.read(g, p.attributes.TEXCOORD_0), I = L.read(g, p.indices);
  const W = v => [P[v * 3] * S[0] + T[0], P[v * 3 + 1] * S[1] + T[1], P[v * 3 + 2] * S[2] + T[2]];
  const toLocal = w => [(w[0] - T[0]) / S[0], (w[1] - T[1]) / S[1], (w[2] - T[2]) / S[2]];
  // normal dunia (skala non-seragam): n_w ∝ n / S
  const NW = v => { const n = [N[v * 3] / S[0], N[v * 3 + 1] / S[1], N[v * 3 + 2] / S[2]], l = Math.hypot(...n); return n.map(x => x / l); };
  const NL = n => { const m = [n[0] * S[0], n[1] * S[1], n[2] * S[2]], l = Math.hypot(...m); return m.map(x => x / l); };
  const nP = [...P], nN = [...N], nT = [...UV], nI = [];
  let dipotong = 0, dibuang = 0;
  const addV = vx => { const l = toLocal(vx.p), nl = NL(vx.n); nP.push(...l); nN.push(...nl); nT.push(...vx.t); return nP.length / 3 - 1; };
  for (let t = 0; t < I.length; t += 3){
    const vs = [I[t], I[t + 1], I[t + 2]], w = vs.map(W);
    const mn = a => Math.min(w[0][a], w[1][a], w[2][a]), mx = a => Math.max(w[0][a], w[1][a], w[2][a]);
    const kena = mn(2) >= ZR[0] && mx(2) <= ZR[1] && mn(1) >= YR[0] && mx(1) <= YR[1] && mx(0) > -XC && mn(0) < XC;
    if (!kena){ nI.push(...vs); continue; }
    const poly = vs.map((v, k) => ({ p:w[k], n:NW(v), t:[UV[v * 2], UV[v * 2 + 1]] }));
    let ada = false;
    [x => -XC - x, x => x - XC].forEach(keep => {
      const c = clipPoly(poly, keep);
      if (c.length < 3) return;
      ada = true;
      const ids = c.map(addV);
      for (let k = 1; k + 1 < ids.length; k++) nI.push(ids[0], ids[k], ids[k + 1]);
    });
    if (ada) dipotong++; else dibuang++;
  }
  if (tambah) tambah((pos, nrm, uv) => addV({ p:pos, n:nrm, t:uv }), nI, UV);
  p.attributes.POSITION = L.addAccessor(g, new Float32Array(nP), 'VEC3');
  p.attributes.NORMAL = L.addAccessor(g, new Float32Array(nN), 'VEC3');
  p.attributes.TEXCOORD_0 = L.addAccessor(g, new Float32Array(nT), 'VEC2');
  const big = nP.length / 3 > 65535;
  p.indices = L.addAccessor(g, big ? new Uint32Array(nI) : new Uint16Array(nI), 'SCALAR', true);
  console.log(nodeName, 'dipotong', dipotong, 'dibuang', dibuang, 'verteks', nP.length / 3);
}

// kotak sumbu-sejajar (koordinat model) -> 12 segitiga, CCW keluar
function kotak(add, nI, x0, x1, y0, y1, z0, z1, uv){
  const F = [
    [[1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
    [[-1, 0, 0], [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]]],
    [[0, 1, 0], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
    [[0, -1, 0], [[x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1]]],
    [[0, 0, 1], [[x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]]],
    [[0, 0, -1], [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]],
  ];
  F.forEach(([n, q]) => quad(add, nI, n, q, uv));
}
function quad(add, nI, n, q, uv){
  const ids = q.map((p, k) => add(p, n, [uv[0] + (k === 1 || k === 2 ? 0.01 : 0), uv[1] + (k >= 2 ? 0.01 : 0)]));
  // orientasi: pastikan (b-a)x(c-a) searah n
  const a = q[0], b = q[1], c = q[2], u = b.map((x, i) => x - a[i]), v = c.map((x, i) => x - a[i]);
  const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] >= 0) nI.push(ids[0], ids[1], ids[2], ids[0], ids[2], ids[3]);
  else nI.push(ids[0], ids[2], ids[1], ids[0], ids[3], ids[2]);
}

proses('Merged_Emas');
proses('Merged_Putih', (add, nI, UV) => {
  const uv = [UV[0], UV[1]];
  kotak(add, nI, -XC - 0.05, -XC, 0.375, 1.325, -4.338, -4.303, uv);   // tiang ujung kiri
  kotak(add, nI, XC, XC + 0.05, 0.375, 1.325, -4.338, -4.303, uv);     // tiang ujung kanan
});
proses('Merged_PlesterGelap', (add, nI, UV) => {
  const uv = [UV[0], UV[1]];
  quad(add, nI, [1, 0, 0], [[-XC, 1.315, -4.365], [-XC, 1.405, -4.365], [-XC, 1.405, -4.275], [-XC, 1.315, -4.275]], uv);
  quad(add, nI, [-1, 0, 0], [[XC, 1.315, -4.275], [XC, 1.405, -4.275], [XC, 1.405, -4.365], [XC, 1.315, -4.365]], uv);
});
L.save(g, '../lumina/gedung-aula-v1e.glb');
console.log('tulis gedung-aula-v1e.glb');
