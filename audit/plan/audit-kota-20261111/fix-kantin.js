// gedung-kantin-v3.glb: 4 mesh bertekstur (Batu/Terakota/Plester/MejaTop) di v2 TANPA TEXCOORD_0
// -> tekstur jatuh ke 1 texel (warna rata). UV planar per muka (geomfix.remapUV), densitas per meter.
const L = require('./glblib'), GF = require('./geomfix');
const g = L.load('../lumina/gedung-kantin-v2.glb'), J = g.json;
const dens = { Batu:0.5, Terakota:0.25, Plester:0.5, MejaTop:1.0 };
J.meshes.forEach((m, mi) => m.primitives.forEach((p, pi) => {
  const mat = J.materials[p.material];
  if (!mat.pbrMetallicRoughness || !mat.pbrMetallicRoughness.baseColorTexture) return;
  if (p.attributes.TEXCOORD_0 != null) return;
  const d = dens[mat.name] || 0.5;
  const geo = GF.remapUV(g, mi, pi, d, {});
  GF.writePrim(g, mi, pi, geo);
  console.log('UV', m.name, mat.name, 'dens', d, 'tris', geo.I.length / 3);
}));
L.save(g, '../lumina/gedung-kantin-v3.glb');
