// Bangun gedung-g04-blender-v3.glb dari v2: bake semua transform node ke frame model
// yang benar (y ke atas, alas di y=0), node jadi identitas.
// v2 rusak: cangkang (Atap/Badan/Etalase/Balkon_Lantai) TERCERMIN di Y (atap di bawah),
// interior +2,14 m melayang, detail tembaga campur 3 frame, bola balkon & 2 finial atap nyasar.
const L = require('./glblib'), comps = require('./comps');
const SRC = '../lumina/gedung-g04-blender-v2.glb', DST = '../lumina/gedung-g04-blender-v3.glb';
const g = L.load(SRC), J = g.json;
const INT = 12.76;
const LANTAI = 0.6;          // plinth padat 0,6 m (atas alas 37 m2) -> lantai interior naik            // offset interior/pintu/papan (Int_Shell node y -12.76 -> lantai 0)
const node = n => J.nodes.find(x => x.name === n);

// fungsi transform per vertex -> {p:[x,y,z], n:[x,y,z], flip:bool}; null = buang
function mirrorShell(t){ return { f:(x,y,z) => [x + t[0], -(y + t[1]), z + t[2]], fn:(a,b,c) => [a,-b,c], flip:true }; }
function translate(t){ return { f:(x,y,z) => [x + t[0], y + t[1], z + t[2]], fn:(a,b,c) => [a,b,c], flip:false }; }

function bakePrim(mi, pi, chooser){
  const p = J.meshes[mi].primitives[pi];
  const P = L.read(g, p.attributes.POSITION), N = L.read(g, p.attributes.NORMAL);
  const U = p.attributes.TEXCOORD_0 != null ? L.read(g, p.attributes.TEXCOORD_0) : null;
  const I = L.read(g, p.indices);
  const c = comps(g, mi, pi);
  const compOfTri = new Int32Array(I.length / 3);
  c.list.forEach((cc, ci) => cc.tris.forEach(t => compOfTri[t] = ci));
  const vt = new Array(P.length / 3).fill(null);   // transform per vertex (dari komponen)
  const outI = [];
  for (let t = 0; t < I.length / 3; t++){
    const tr = chooser(c.list[compOfTri[t]], compOfTri[t]);
    if (!tr) continue;
    const a = I[t*3], b = I[t*3+1], d = I[t*3+2];
    [a, b, d].forEach(v => { vt[v] = tr; });
    if (tr.flip) outI.push(a, d, b); else outI.push(a, b, d);
  }
  const NP = new Float32Array(P.length), NN = new Float32Array(N.length);
  for (let v = 0; v < P.length / 3; v++){
    const tr = vt[v] || translate([0,0,0]);
    const q = tr.f(P[v*3], P[v*3+1], P[v*3+2]); NP.set(q, v*3);
    const n = tr.fn(N[v*3], N[v*3+1], N[v*3+2]); NN.set(n, v*3);
  }
  p.attributes.POSITION = L.addAccessor(g, NP, 'VEC3');
  p.attributes.NORMAL = L.addAccessor(g, NN, 'VEC3');
  if (U) p.attributes.TEXCOORD_0 = L.addAccessor(g, new Float32Array(U), 'VEC2');
  const IA = P.length / 3 > 65535 ? new Uint32Array(outI) : new Uint16Array(outI);
  p.indices = L.addAccessor(g, IA, 'SCALAR', true);
  return outI.length / 3;
}
function bakeNode(name, chooserFor){
  const n = node(name), mi = n.mesh, t = n.translation || [0,0,0];
  let tris = 0;
  J.meshes[mi].primitives.forEach((pr, pi) => { tris += bakePrim(mi, pi, chooserFor(t)(pi)); });
  delete n.translation; delete n.rotation; delete n.scale;
  console.log(name, 'tris', tris);
}

// 1) cangkang: cermin Y
['Atap', 'Badan', 'Etalase_Isi_-1.6', 'Balkon_Lantai'].forEach(nm => bakeNode(nm, t => () => () => mirrorShell(t)));
// Etalase_Kaca: buang 2 bidang silang nyasar di pusat lantai (komp. dengan |z|<0.6 & tengah)
bakeNode('Etalase_Kaca_-1.6', t => () => (cc) => (cc.max[2] > -1 ? null : mirrorShell(t)));
// 2) Balkon_Bola (tembaga gabungan 3 frame)
bakeNode('Balkon_Bola_0', t => () => (cc) => {
  const sz = [0,1,2].map(k => cc.max[k] - cc.min[k]);
  // bola balkon: 8 bola r 0,06 di y~0,z~0 -> taruh di atas pegangan atas balkon (h 7,54, z -19,0)
  if (Math.max(...sz) < 0.14 && Math.abs(cc.c[1]) < 0.07 && Math.abs(cc.c[2]) < 0.07)
    return { f:(x,y,z) => [x + t[0], y + 7.60, z - 19.0], fn:(a,b,c) => [a,b,c], flip:false };
  // 2 finial ujung bubungan atap (frame diputar 90 deg di X): (x,y,z)->(x, 7.2 - z, y - 10.8)
  if (cc.max[2] < -7)
    return { f:(x,y,z) => [x + t[0], 7.2 - z, y - 10.8], fn:(a,b,c) => [a,-c,b], flip:false };
  // batang kecil nyasar (60 tri, 0,06 m) di dalam gedung: buang
  if (cc.min[2] > 5.7 && cc.tris.length <= 60) return null;
  // pelat tembaga PADAT 2,2x2,4 m menutup kaca etalase & pintu (bevel-box, bukan bingkai) -> diganti bingkai
  if (cc.min[1] < -6.7 && cc.max[1] > -4.5 && cc.max[1] < -4.0 && cc.min[2] > 4.0 && cc.max[2] < 4.35 && (cc.max[0]-cc.min[0]) > 1.3) return null;
  return mirrorShell(t);
});
// 3) pot bunga: daun & bunga ke atas kotak pot lantai 1 (top h 3,92, pusat z -18,08)
['Daun_-1.8_0', 'Bunga_-1.8_0'].forEach(nm => bakeNode(nm, t => () => () => translate([t[0], t[1] + 0.78, t[2] + 0.82])));
// 4) pintu + papan nama (eksterior): +INT
['Door_Trim', 'Shop_Sign'].forEach(nm => bakeNode(nm, t => () => () => translate([t[0], t[1] + INT, t[2]])));
// 5) interior: +INT +0,6 (lantai naik ke atas plinth 0,6 m)
['Int_Shell', 'Int_Cases', 'Int_Gems', 'Int_Counter', 'Int_Rug'].forEach(nm => bakeNode(nm, t => () => () => translate([t[0], t[1] + INT + LANTAI, t[2]])));
// 6) lampu gantung: kap tetap (membuka ke bawah), kabel dipindah ke ATAS kap sampai plafon
bakeNode('Int_Lights', t => pi => (cc) => {
  const H = 2.75, CEIL = 3.11;
  const isKabel = pi === 0 && (cc.max[0] - cc.min[0]) < 0.05 && cc.min[1] < -1;
  if (isKabel) return { f:(x,y,z) => [x + t[0], H + 0.17 + (y + 1.65) / 1.5 * (CEIL - H - 0.17), z + t[2]], fn:(a,b,c) => [a,b,c], flip:false };
  return translate([t[0], H, t[2]]);
});
// 7) bingkai tembaga etalase + pintu (pengganti pelat padat)
const GF = require('./geomfix');
const B = new GF.Builder();
function box(x0,x1,y0,y1,z0,z1){
  const c=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2], o={inside:c};
  B.poly([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],1,o); B.poly([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],1,o);
  B.poly([[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],1,o); B.poly([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],1,o);
  B.poly([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],1,o); B.poly([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],1,o);
}
const ZF0 = -18.00, ZF1 = -17.84;
[[-2.7,-0.5],[0.5,2.7]].forEach(([a,b]) => {
  box(a, a+0.1, 0.3, 2.7, ZF0, ZF1); box(b-0.1, b, 0.3, 2.7, ZF0, ZF1);     // tiang kiri/kanan
  box(a, b, 0.3, 0.4, ZF0, ZF1); box(a, b, 2.6, 2.7, ZF0, ZF1);             // ambang bawah/atas
  const m = (a+b)/2; box(m-0.03, m+0.03, 0.4, 2.6, ZF0+0.01, ZF1-0.01);     // mullion
  box(a+0.1, b-0.1, 1.97, 2.03, ZF0+0.01, ZF1-0.01);                        // transom
});
box(-0.7,-0.55,0,2.7,ZF0-0.02,ZF1+0.02); box(0.55,0.7,0,2.7,ZF0-0.02,ZF1+0.02); box(-0.7,0.7,2.55,2.7,ZF0-0.02,ZF1+0.02);  // kusen pintu
const geo = GF.weld(B);
J.meshes.push({ name:'BingkaiEtalase', primitives:[{ attributes:{}, material:5, mode:4 }] });
GF.writePrim(g, J.meshes.length - 1, 0, geo);
J.nodes.push({ name:'Bingkai_Etalase', mesh:J.meshes.length - 1 });
J.scenes[J.scene || 0].nodes.push(J.nodes.length - 1);
console.log('bingkai tris', geo.I.length / 3);
// 9) Badan dibangun ulang: v2 punya lubang pintu 1,8x3 m yang dipotong di frame TERBALIK
//    (jadi muncul di lantai teratas) + segitiga boolean berantakan. Kotak dinding tebal 5 cm,
//    bukaan etalase + pintu di lantai dasar (interior terlihat lewat kaca).
{
  const W = new GF.Builder(), X = 2.9, Z0 = -17.9, Z1 = -11.9, H = 12.8, T = 0.05;
  const away = (pts, far) => W.poly(pts, 1, { inside:far });
  const ops = [[-2.6,-0.6,0.4,2.6],[0.6,2.6,0.4,2.6],[-0.55,0.55,0.05,2.55]];
  const xs = [-X,-2.6,-0.6,-0.55,0.55,0.6,2.6,X], ys = [0,0.05,0.4,2.55,2.6,H];
  const buka = (x,y) => ops.some(o => x > o[0] && x < o[1] && y > o[2] && y < o[3]);
  for (let i = 0; i < xs.length-1; i++) for (let j = 0; j < ys.length-1; j++){
    const a = xs[i], b = xs[i+1], c = ys[j], d = ys[j+1];
    if (buka((a+b)/2, (c+d)/2)) continue;
    away([[a,c,Z0],[b,c,Z0],[b,d,Z0],[a,d,Z0]], [0,6,0]);                 // luar depan (normal -z)
    away([[a,c,Z0+T],[b,c,Z0+T],[b,d,Z0+T],[a,d,Z0+T]], [0,6,-40]);       // dalam depan (normal +z)
  }
  ops.forEach(o => {   // kusen dalam (tebal dinding)
    const [a,b,c,d] = o, cz = [ (a+b)/2, (c+d)/2, Z0+T/2 ];
    W.poly([[a,c,Z0],[a,d,Z0],[a,d,Z0+T],[a,c,Z0+T]],1,{inside:[a-1,cz[1],cz[2]]});
    W.poly([[b,c,Z0],[b,d,Z0],[b,d,Z0+T],[b,c,Z0+T]],1,{inside:[b+1,cz[1],cz[2]]});
    W.poly([[a,c,Z0],[b,c,Z0],[b,c,Z0+T],[a,c,Z0+T]],1,{inside:[cz[0],c-1,cz[2]]});
    W.poly([[a,d,Z0],[b,d,Z0],[b,d,Z0+T],[a,d,Z0+T]],1,{inside:[cz[0],d+1,cz[2]]});
  });
  const C = [0, H/2, (Z0+Z1)/2];
  away([[-X,0,Z1],[X,0,Z1],[X,H,Z1],[-X,H,Z1]], C);                         // belakang luar
  away([[-X+T,0,Z1-T],[X-T,0,Z1-T],[X-T,H,Z1-T],[-X+T,H,Z1-T]], [0,6,40]);   // belakang dalam
  [-1,1].forEach(sx => {
    away([[sx*X,0,Z0],[sx*X,0,Z1],[sx*X,H,Z1],[sx*X,H,Z0]], C);              // samping luar
    away([[sx*(X-T),0,Z0+T],[sx*(X-T),0,Z1-T],[sx*(X-T),H,Z1-T],[sx*(X-T),H,Z0+T]], [sx*40,6,-14.9]);
  });
  away([[-X,H-0.01,Z0],[X,H-0.01,Z0],[X,H-0.01,Z1],[-X,H-0.01,Z1]], [0,0,-14.9]);   // tutup atas (1 cm di bawah kornis Balkon_Lantai: cegah z-fight)
  const gb = GF.weld(W);
  GF.writePrim(g, 1, 0, gb);
  console.log('Badan baru tris', gb.I.length / 3);
}
// 8) kaca etalase: tembus pandang (interior perhiasan terlihat)
const kaca = J.materials[2]; kaca.pbrMetallicRoughness.baseColorFactor = [0.02, 0.05, 0.045, 0.38]; kaca.alphaMode = 'BLEND';
L.save(g, DST);
console.log('saved', DST);
