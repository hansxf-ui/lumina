// gedung-g04-blender-v4.glb = v3 + pintu terbuka ke dalam + undakan marmer di depan pintu
// + badan etalase kayu tidak lagi koplanar dengan list tembaga (kedip).
const L = require('./glblib'), GF = require('./geomfix');
const g = L.load('../lumina/gedung-g04-blender-v3.glb'), J = g.json;
const node = n => J.nodes.find(x => x.name === n);
function edit(nodeName, pi, fn){
  const p = J.meshes[node(nodeName).mesh].primitives[pi];
  const P = L.read(g, p.attributes.POSITION), N = L.read(g, p.attributes.NORMAL);
  const c = fn(P, N);
  p.attributes.POSITION = L.addAccessor(g, P, 'VEC3'); p.attributes.NORMAL = L.addAccessor(g, N, 'VEC3');
  console.log(nodeName, pi, 'verteks diubah', c);
}
// 1) daun pintu (Etalase_Isi, komponen x -0,55..0,55, z -17,97..-17,89): putar 90° ke dalam
//    pada engsel (x -0,55, z -17,89); bagian di bawah lantai interior (y < 0,64) dipotong.
edit('Etalase_Isi_-1.6', 0, (P, N) => {
  let c = 0; const hx = -0.55, hz = -17.89;
  for (let i = 0; i < P.length; i += 3){
    const x = P[i], y = P[i + 1], z = P[i + 2];
    if (x < -0.56 || x > 0.56 || z < -17.98 || z > -17.88 || y < 0.04 || y > 2.56) continue;
    const dx = x - hx, dz = z - hz;           // putar +90° (sin 1, cos 0): (dx,dz) -> (-dz, dx)
    P[i] = hx - dz; P[i + 2] = hz + dx;
    if (P[i + 1] < 0.64) P[i + 1] = 0.64;
    const nx = N[i], nz = N[i + 2]; N[i] = -nz; N[i + 2] = nx;
    c++;
  }
  return c;
});
// 2) badan etalase kayu (Int_Cases prim 0, atas 1,49) menembus list tembaga 1,38–1,46 dengan
//    muka samping koplanar -> atas kayu diturunkan ke 1,38 (list tembaga duduk di atasnya).
edit('Int_Cases', 0, (P) => { let c = 0; for (let i = 0; i < P.length; i += 3) if (Math.abs(P[i + 1] - 1.49) < 0.005){ P[i + 1] = 1.38; c++; } return c; });
// 3) undakan marmer 3 anak tangga (0,20 m) di depan pintu, di antara pilaster pintu (x ±0,85)
const B = new GF.Builder();
function box(x0,x1,y0,y1,z0,z1){
  const c=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2], o={inside:c};
  B.poly([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],1,o); B.poly([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],1,o);
  B.poly([[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],1,o); B.poly([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],1,o);
  B.poly([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],1,o);
}
const ZF = -18.0;   // muka depan plinth
[[0.00, 0.20, ZF - 0.75], [0.20, 0.40, ZF - 0.50], [0.40, 0.60, ZF - 0.25]].forEach(([y0, y1, z0]) => {
  box(-0.84, 0.84, y0, y1 - 0.025, z0, ZF);                 // badan anak tangga
  box(-0.86, 0.86, y1 - 0.025, y1, z0 - 0.02, ZF);          // tutup + hidung 2 cm
});
const geo = GF.weld(B);
J.meshes.push({ name:'Undakan_Pintu', primitives:[{ attributes:{}, material:8, mode:4 }] });   // mat 8 = Marmer
GF.writePrim(g, J.meshes.length - 1, 0, geo);
J.nodes.push({ name:'Undakan_Pintu', mesh:J.meshes.length - 1 });
J.scenes[J.scene || 0].nodes.push(J.nodes.length - 1);
console.log('undakan tris', geo.I.length / 3);
L.save(g, '../lumina/gedung-g04-blender-v4.glb');
console.log('saved v4');
