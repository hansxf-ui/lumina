// gedung-g04-blender-v5.glb = v4 + kaca jendela. Di v3/v4 ke-20 jendela lantai atas hanya kotak
// kusen krem padat (tidak ada kaca), jadi malam hari tidak ada yang bisa menyala. v5 menambah
// node Jendela_Kaca: 20 panel kaca 1,05 x 1,45 m, 5 mm di depan muka luar kotak kusen (kusen
// krem tetap terlihat sebagai bingkai 0,10 m; mullion silang 1 cm di depan kaca tetap terlihat).
const L = require('./glblib'), comps = require('./comps');
const g = L.load('../lumina/gedung-g04-blender-v4.glb'), J = g.json;
const nodeB = J.nodes.find(n => n.name === 'Balkon_Lantai');
if (nodeB.translation || nodeB.rotation || nodeB.scale) throw new Error('Balkon_Lantai bertransform');
const c = comps(g, nodeB.mesh, 0);
const P = [], N = [], U = [], I = [];
let n = 0;
function quad(cx, cy, cz, ax, sgn, w, h){
  // ax: sumbu normal (0 = x, 2 = z); sgn: arah keluar
  const base = P.length / 3, hw = w / 2, hh = h / 2;
  const pts = ax === 2
    ? [[cx - hw, cy - hh, cz], [cx + hw, cy - hh, cz], [cx + hw, cy + hh, cz], [cx - hw, cy + hh, cz]]
    : [[cx, cy - hh, cz - hw], [cx, cy - hh, cz + hw], [cx, cy + hh, cz + hw], [cx, cy + hh, cz - hw]];
  const nn = ax === 2 ? [0, 0, sgn] : [sgn, 0, 0];
  pts.forEach((p, k) => { P.push(...p); N.push(...nn); U.push(k === 1 || k === 2 ? 1 : 0, k >= 2 ? 1 : 0); });
  // winding CCW dilihat dari luar
  const e1 = [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]], e2 = [pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], pts[2][2] - pts[0][2]];
  const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  if (cr[0] * nn[0] + cr[1] * nn[1] + cr[2] * nn[2] > 0) I.push(base, base + 1, base + 2, base, base + 2, base + 3);
  else I.push(base, base + 2, base + 1, base, base + 3, base + 2);
  n++;
}
c.list.forEach(cc => {
  const d = [0, 1, 2].map(k => cc.max[k] - cc.min[k]), m = [0, 1, 2].map(k => (cc.max[k] + cc.min[k]) / 2);
  if (Math.abs(d[1] - 1.65) > 0.01) return;
  if (Math.abs(d[0] - 1.25) < 0.01 && Math.abs(d[2] - 0.12) < 0.01) quad(m[0], m[1], cc.min[2] - 0.005, 2, -1, 1.05, 1.45);   // fasad depan (-Z)
  else if (Math.abs(d[2] - 1.25) < 0.01 && Math.abs(d[0] - 0.12) < 0.01){
    const s = m[0] > 0 ? 1 : -1;
    quad(s > 0 ? cc.max[0] + 0.005 : cc.min[0] - 0.005, m[1], m[2], 0, s, 1.05, 1.45);              // sisi ±X
  }
});
if (n !== 20) throw new Error('jumlah jendela ' + n);
J.materials.push({ name:'KacaJendela', doubleSided:false, pbrMetallicRoughness:{ baseColorFactor:[0.035, 0.07, 0.065, 1], metallicFactor:0.35, roughnessFactor:0.12 } });
const mat = J.materials.length - 1;
J.meshes.push({ name:'Jendela_Kaca', primitives:[{ attributes:{
  POSITION:L.addAccessor(g, new Float32Array(P), 'VEC3'), NORMAL:L.addAccessor(g, new Float32Array(N), 'VEC3'), TEXCOORD_0:L.addAccessor(g, new Float32Array(U), 'VEC2') },
  indices:L.addAccessor(g, new Uint16Array(I), 'SCALAR', true), material:mat }] });
J.nodes.push({ name:'Jendela_Kaca', mesh:J.meshes.length - 1 });
J.scenes[J.scene || 0].nodes.push(J.nodes.length - 1);
L.save(g, '../lumina/gedung-g04-blender-v5.glb');
console.log('tulis gedung-g04-blender-v5.glb, panel kaca', n);
