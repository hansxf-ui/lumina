/* Audit total Lumina — dijalankan di halaman game (page.evaluate).
   Mengembalikan JSON temuan. Prasyarat: ?nogabung=1 + gabungMeshStatis() dimatikan
   (injeksi harness) supaya identitas objek utuh; GLTFLoader ditandai userData.src. */
(function(){
  var T0 = performance.now();
  var CELL = 0.25, X0 = -270, Z0 = -290, NX = 2160, NZ = 2160;
  var N = NX * NZ;
  function ci(x, z){ var i = Math.floor((x - X0) / CELL), j = Math.floor((z - Z0) / CELL); if (i < 0 || j < 0 || i >= NX || j >= NZ) return -1; return j * NX + i; }
  function cx(i){ return X0 + (i % NX + 0.5) * CELL; }
  function cz(i){ return Z0 + (Math.floor(i / NX) + 0.5) * CELL; }
  function vis(o){ while (o){ if (!o.visible) return false; o = o.parent; } return true; }
  scene.updateMatrixWorld(true);

  /* ---------- kepemilikan objek ---------- */
  var larangRoot = new Set();
  if (pemain && pemain.av) larangRoot.add(pemain.av.grup);
  remotes.forEach(function(r){ if (r.av) larangRoot.add(r.av.grup); });
  perahuList.forEach(function(b){ larangRoot.add(b.g); });
  awanList.forEach(function(a){ larangRoot.add(a); });
  if (typeof sinarMercu !== 'undefined' && sinarMercu) larangRoot.add(sinarMercu);
  var vegSet = new Set(); REGISTRI_VEG.forEach(function(z){ vegSet.add(z.mesh); vegSet.add(z.blob); });
  if (typeof REGISTRI_RUMPUT !== 'undefined') REGISTRI_RUMPUT.forEach(function(g){ vegSet.add(g.mesh); });
  function dilarang(o){ while (o){ if (larangRoot.has(o)) return true; o = o.parent; } return false; }
  var owners = [], ownerOf = new Map();
  function rootGLB(o){ var r = null, p = o; while (p && p !== scene){ if (p.userData && p.userData.src) r = p; p = p.parent; } return r; }
  function topChild(o){ var p = o; while (p.parent && p.parent !== scene) p = p.parent; return p; }
  var v3 = new THREE.Vector3(), bb = new THREE.Box3(), tb = new THREE.Box3();
  /* kode: gabung mesh kode top-level yang AABB-nya bersentuhan (1 objek dirakit dari banyak mesh) */
  var meshes = [];
  scene.traverse(function(o){
    if (!o.isMesh || o.isSkinnedMesh || !vis(o) || dilarang(o) || vegSet.has(o)) return;
    var mats = Array.isArray(o.material) ? o.material : [o.material];
    if (mats.every(function(m){ return m.isShaderMaterial; })) return;   /* air shader */
    meshes.push(o);
  });
  function labelGLB(r){ r.getWorldPosition(v3); return r.userData.src.replace(/\.glb.*$/, '') + '@' + v3.x.toFixed(1) + ',' + v3.z.toFixed(1); }
  var kodeList = [];
  meshes.forEach(function(o){
    var r = rootGLB(o);
    if (r){
      var key = r.uuid;
      if (!ownerOf.has(key)){ ownerOf.set(key, owners.length); owners.push({ id:owners.length, label:labelGLB(r), glb:true, root:r, src:r.userData.src }); }
      o.userData.__own = ownerOf.get(key);
    } else kodeList.push(o);
  });
  /* union-find kode per kedekatan AABB (toleransi 5 cm) */
  var kb = kodeList.map(function(o){ if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); var b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); if (o.isInstancedMesh){ b = new THREE.Box3(); var m4 = new THREE.Matrix4(); for (var k = 0; k < o.count; k++){ o.getMatrixAt(k, m4); b.union(o.geometry.boundingBox.clone().applyMatrix4(m4).applyMatrix4(o.matrixWorld)); } } return b.expandByScalar(0.05); });
  var par = kodeList.map(function(_, i){ return i; });
  function f(i){ while (par[i] !== i){ par[i] = par[par[i]]; i = par[i]; } return i; }
  var big = kb.map(function(b){ return (b.max.x - b.min.x) > 40 || (b.max.z - b.min.z) > 40; });   /* tanah/laut: jangan dijadikan perekat */
  var bucket = new Map();
  kb.forEach(function(b, i){ if (big[i]) return; for (var gx = Math.floor(b.min.x / 8); gx <= Math.floor(b.max.x / 8); gx++) for (var gz = Math.floor(b.min.z / 8); gz <= Math.floor(b.max.z / 8); gz++){ var k = gx + ',' + gz; (bucket.get(k) || bucket.set(k, []).get(k)).push(i); } });
  bucket.forEach(function(list){ for (var a = 0; a < list.length; a++) for (var c = a + 1; c < list.length; c++){ if (kb[list[a]].intersectsBox(kb[list[c]])) par[f(list[a])] = f(list[c]); } });
  var kodeOwner = new Map();
  kodeList.forEach(function(o, i){
    var r = f(i);
    if (!kodeOwner.has(r)){
      var b = kb[r].clone(); kodeOwner.set(r, owners.length);
      owners.push({ id:owners.length, label:'', glb:false, meshes:[] });
    }
    var ow = owners[kodeOwner.get(r)]; ow.meshes.push(o);
    o.userData.__own = ow.id;
  });
  owners.forEach(function(ow){
    if (ow.glb) return;
    var b = new THREE.Box3(); ow.meshes.forEach(function(o){ b.union(kb[kodeList.indexOf(o)]); });
    var c = b.getCenter(new THREE.Vector3());
    var nm = ow.meshes.map(function(o){ var t = topChild(o); return t.name || o.name || ''; }).filter(Boolean)[0] || ow.meshes[0].geometry.type.replace('Geometry', '');
    ow.label = 'kode:' + nm + '@' + c.x.toFixed(1) + ',' + c.z.toFixed(1) + ' [' + ow.meshes.length + 'm]';
    ow.big = (b.max.x - b.min.x) > 40 || (b.max.z - b.min.z) > 40;
  });

  /* ---------- rasterisasi geometri setinggi badan ---------- */
  var own = new Int32Array(N).fill(-1), own2 = new Int32Array(N).fill(-1);
  var pair = new Map();
  var stats = { tri:0, triSlab:0 };
  var hY = new Float32Array(N).fill(NaN), hOwn = new Int32Array(N).fill(-1), hMat = new Int32Array(N).fill(-1), hPO = new Uint8Array(N);
  var zfight = new Map();
  var matIds = new Map();
  function matId(m){ if (!matIds.has(m.uuid)) matIds.set(m.uuid, matIds.size); return matIds.get(m.uuid); }
  var flip = new Map();   /* owner -> {tri, flipped} */
  function tandai(idx, o){
    if (idx < 0) return;
    var cur = own[idx];
    if (cur === -1){ own[idx] = o; return; }
    if (cur === o) return;
    if (own2[idx] === o) return;
    own2[idx] = o;
    var a = Math.min(cur, o), b = Math.max(cur, o), k = a + '|' + b;
    pair.set(k, (pair.get(k) || 0) + 1);
  }
  function seg(ax, az, bx, bz, o){
    var n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(bz - az)) / (CELL * 0.5)));
    for (var s = 0; s <= n; s++){ var t = s / n; tandai(ci(ax + (bx - ax) * t, az + (bz - az) * t), o); }
  }
  function isiPoli(P, o){
    /* P: [[x,z],...] — isi sel yang pusatnya di dalam (scanline) + tepi */
    var zmin = Infinity, zmax = -Infinity, k;
    for (k = 0; k < P.length; k++){ zmin = Math.min(zmin, P[k][1]); zmax = Math.max(zmax, P[k][1]); seg(P[k][0], P[k][1], P[(k + 1) % P.length][0], P[(k + 1) % P.length][1], o); }
    var j0 = Math.floor((zmin - Z0) / CELL), j1 = Math.floor((zmax - Z0) / CELL);
    for (var j = j0; j <= j1; j++){
      var zc = Z0 + (j + 0.5) * CELL, xs = [];
      for (k = 0; k < P.length; k++){ var p = P[k], q = P[(k + 1) % P.length]; if ((p[1] <= zc) !== (q[1] <= zc)){ xs.push(p[0] + (zc - p[1]) / (q[1] - p[1]) * (q[0] - p[0])); } }
      xs.sort(function(a, b){ return a - b; });
      for (k = 0; k + 1 < xs.length; k += 2){
        var i0 = Math.ceil((xs[k] - X0) / CELL - 0.5), i1 = Math.floor((xs[k + 1] - X0) / CELL - 0.5);
        for (var i = i0; i <= i1; i++){ if (i >= 0 && i < NX && j >= 0 && j < NZ) tandai(j * NX + i, o); }
      }
    }
  }
  function clipY(poly, y, atas){ /* simpan bagian y>=y (atas) atau y<=y */
    var out = [];
    for (var k = 0; k < poly.length; k++){
      var p = poly[k], q = poly[(k + 1) % poly.length];
      var pin = atas ? p[1] >= y : p[1] <= y, qin = atas ? q[1] >= y : q[1] <= y;
      if (pin) out.push(p);
      if (pin !== qin){ var t = (y - p[1]) / (q[1] - p[1]); out.push([p[0] + (q[0] - p[0]) * t, y, p[2] + (q[2] - p[2]) * t]); }
    }
    return out;
  }
  var pa = new THREE.Vector3(), pb = new THREE.Vector3(), pc = new THREE.Vector3(), m4 = new THREE.Matrix4(), mw = new THREE.Matrix4();
  var nA = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nrm = new THREE.Vector3();
  meshes.forEach(function(o){
    var ow = o.userData.__own; if (owners[ow].glb ? owners[ow].big : big[kodeList.indexOf(o)]) return;
    var g = o.geometry, pos = g.attributes.position, nor = g.attributes.normal, ix = g.index ? g.index.array : null;
    var mats = Array.isArray(o.material) ? o.material : [o.material];
    var groups = Array.isArray(o.material) && g.groups.length ? g.groups : [{ start:0, count:ix ? ix.length : pos.count, materialIndex:0 }];
    var inst = o.isInstancedMesh ? o.count : 1;
    var fl = flip.get(ow) || { tri:0, flip:0 }; flip.set(ow, fl);
    var nm3 = new THREE.Matrix3();
    for (var ii = 0; ii < inst; ii++){
      if (o.isInstancedMesh){ o.getMatrixAt(ii, m4); mw.multiplyMatrices(o.matrixWorld, m4); } else mw.copy(o.matrixWorld);
      nm3.getNormalMatrix(mw);
      var det = mw.determinant();
      groups.forEach(function(gr){
        var mat = mats[gr.materialIndex] || mats[0];
        if (!mat || mat.isShaderMaterial) return;
        var end = Math.min(gr.start + gr.count, ix ? ix.length : pos.count);
        for (var t = gr.start; t + 2 < end; t += 3){
          var a = ix ? ix[t] : t, b = ix ? ix[t + 1] : t + 1, c = ix ? ix[t + 2] : t + 2;
          pa.fromBufferAttribute(pos, a).applyMatrix4(mw); pb.fromBufferAttribute(pos, b).applyMatrix4(mw); pc.fromBufferAttribute(pos, c).applyMatrix4(mw);
          stats.tri++;
          e1.subVectors(pb, pa); e2.subVectors(pc, pa); nrm.crossVectors(e1, e2);
          var luas = nrm.length() / 2; if (luas < 1e-7) continue;
          nrm.normalize();
          /* winding vs normal vertex (muka terbalik pada material satu sisi = lubang/tak terlihat) */
          if (nor && mat.side === THREE.FrontSide && !o.isInstancedMesh){
            nA.fromBufferAttribute(nor, a).applyMatrix3(nm3).normalize();
            fl.tri++; if (nrm.dot(nA) < -0.3) fl.flip++;
          }
          var gx = (pa.x + pb.x + pc.x) / 3, gz = (pa.z + pb.z + pc.z) / 3, gnd = tinggiTanah(gx, gz);
          /* permukaan datar: kandidat z-fighting */
          if (Math.abs(nrm.y) > 0.995 && luas > 0.02){
            var yy = (pa.y + pb.y + pc.y) / 3, mid = matId(mat), po = mat.polygonOffset ? 1 : 0;
            var P2 = [[pa.x, pa.z], [pb.x, pb.z], [pc.x, pc.z]];
            var zmin = Math.min(pa.z, pb.z, pc.z), zmax = Math.max(pa.z, pb.z, pc.z), xmin = Math.min(pa.x, pb.x, pc.x), xmax = Math.max(pa.x, pb.x, pc.x);
            if ((xmax - xmin) < 60 && (zmax - zmin) < 60){
              for (var jz = Math.floor((zmin - Z0) / CELL) ; jz <= Math.floor((zmax - Z0) / CELL); jz += 2){
                for (var jx = Math.floor((xmin - X0) / CELL); jx <= Math.floor((xmax - X0) / CELL); jx += 2){
                  var px = X0 + (jx + 0.5) * CELL, pz = Z0 + (jz + 0.5) * CELL;
                  /* titik di dalam segitiga? */
                  var d1 = (px - P2[1][0]) * (P2[0][1] - P2[1][1]) - (P2[0][0] - P2[1][0]) * (pz - P2[1][1]);
                  var d2 = (px - P2[2][0]) * (P2[1][1] - P2[2][1]) - (P2[1][0] - P2[2][0]) * (pz - P2[2][1]);
                  var d3 = (px - P2[0][0]) * (P2[2][1] - P2[0][1]) - (P2[2][0] - P2[0][0]) * (pz - P2[0][1]);
                  if (((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0))) continue;
                  var hi = jz * NX + jx; if (hi < 0 || hi >= N) continue;
                  if (!isNaN(hY[hi]) && hMat[hi] !== mid && Math.abs(hY[hi] - yy) < 0.006 && !(hPO[hi] && po)){
                    var oa = Math.min(hOwn[hi], ow), ob = Math.max(hOwn[hi], ow), kk = oa + '|' + ob + '|' + yy.toFixed(3);
                    var zf = zfight.get(kk) || { n:0, x:px, z:pz, y:yy, po:hPO[hi] + po }; zf.n++; zfight.set(kk, zf);
                  }
                  if (isNaN(hY[hi]) || yy > hY[hi]){ hY[hi] = yy; hOwn[hi] = ow; hMat[hi] = mid; hPO[hi] = po; }
                }
              }
            }
          }
          var lo = gnd + 0.45, hi2 = gnd + 1.6;
          if (Math.max(pa.y, pb.y, pc.y) < lo || Math.min(pa.y, pb.y, pc.y) > hi2) continue;
          var poly = clipY(clipY([[pa.x, pa.y, pa.z], [pb.x, pb.y, pb.z], [pc.x, pc.y, pc.z]], lo, true), hi2, false);
          if (poly.length < 2) continue;
          stats.triSlab++;
          isiPoli(poly.map(function(p){ return [p[0], p[2]]; }), ow);
        }
      });
    }
  });
  /* tandai -2 untuk sel bertumpuk (tak dipakai lagi) — owner pertama dipertahankan */

  /* batang pohon instanced: lingkaran solid r_batang */
  var batang = [];
  DAFTAR_POHON.forEach(function(p){ batang.push({ x:p.x, z:p.z, r:0.13 * p.s, s:p.s, j:'pohon', zona:p.zona }); });
  DAFTAR_PINUS.forEach(function(p){ batang.push({ x:p.x, z:p.z, r:0.15 * p.s, s:p.s, j:'pinus', zona:p.zona }); });
  var ownPohon = owners.length; owners.push({ id:ownPohon, label:'batang pohon/pinus (instanced)', glb:false });
  batang.forEach(function(t){ var rr = Math.max(t.r, CELL * 0.5); for (var x = t.x - rr; x <= t.x + rr; x += CELL) for (var z = t.z - rr; z <= t.z + rr; z += CELL){ if (Math.hypot(x - t.x, z - t.z) <= rr) tandai(ci(x, z), ownPohon); } });

  /* ---------- peta gameplay: boleh berdiri? ---------- */
  var circ = penabrak.filter(function(t){ return !t.tanpaPemain; });
  var hash = new Map(), HB = 4;
  circ.forEach(function(t, k){ var rr = t.r + 0.55; for (var gx = Math.floor((t.x - rr) / HB); gx <= Math.floor((t.x + rr) / HB); gx++) for (var gz = Math.floor((t.z - rr) / HB); gz <= Math.floor((t.z + rr) / HB); gz++){ var key = gx * 100000 + gz; (hash.get(key) || hash.set(key, []).get(key)).push(k); } });
  function penyebab(x, z){
    var l = hash.get(Math.floor(x / HB) * 100000 + Math.floor(z / HB));
    if (l) for (var k = 0; k < l.length; k++){ var t = circ[l[k]], rr = t.r + 0.55; if ((x - t.x) * (x - t.x) + (z - t.z) * (z - t.z) < rr * rr) return 'C' + l[k]; }
    for (var q = 0; q < ZONA_LARANG_PEMAIN.length; q++){
      var o = ZONA_LARANG_PEMAIN[q], dx = x - o[0], dz = z - o[1], c = Math.cos(o[4]), s = Math.sin(o[4]);
      var lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) <= o[2] + 1.5 && Math.abs(lz) <= o[3] + 1.5) return 'O' + q;
    }
    return null;
  }
  var area = new Uint8Array(N);   /* 0 = di luar area, 1 = area tapi diblok penabrak, 2 = boleh */
  var gndArr = new Float32Array(N);
  for (var i = 0; i < N; i++){
    var x = cx(i), z = cz(i);
    if (!dalamArea(x, z)) continue;
    gndArr[i] = tinggiTanah(x, z);
    area[i] = penyebab(x, z) ? 1 : 2;
  }
  /* jangkauan dari titik lahir (0,15.5), langkah <=0.8 m beda tinggi (per 0,25 m: pakai 0.8 seperti langkahSah) */
  var reach = new Uint8Array(N), q = new Int32Array(N), qh = 0, qt = 0;
  var s0 = ci(0, 15.5); reach[s0] = 1; q[qt++] = s0;
  while (qh < qt){
    var c0 = q[qh++], ii0 = c0 % NX, jj0 = (c0 / NX) | 0;
    var nb = [ii0 > 0 ? c0 - 1 : -1, ii0 < NX - 1 ? c0 + 1 : -1, jj0 > 0 ? c0 - NX : -1, jj0 < NZ - 1 ? c0 + NX : -1];
    for (var k2 = 0; k2 < 4; k2++){ var n2 = nb[k2]; if (n2 < 0 || reach[n2] || area[n2] !== 2) continue; if (Math.abs(gndArr[n2] - gndArr[c0]) > 0.8) continue; reach[n2] = 1; q[qt++] = n2; }
  }
  var nReach = qt;

  /* ---------- temuan A: NEMBUS (bisa berdiri di dalam geometri) ---------- */
  var nembus = new Map();
  for (i = 0; i < N; i++){
    if (!reach[i]) continue;
    var o2 = own[i];
    if (o2 < 0) continue;
    var e = nembus.get(o2) || { n:0, xs:0, zs:0, sx:cx(i), sz:cz(i) }; e.n++; e.xs += cx(i); e.zs += cz(i); nembus.set(o2, e);
  }
  var hasilNembus = [];
  nembus.forEach(function(e, o3){ if (e.n >= 3) hasilNembus.push({ obj:owners[o3].label, m2:+(e.n * CELL * CELL).toFixed(2), pusat:[+(e.xs / e.n).toFixed(1), +(e.zs / e.n).toFixed(1)], contoh:[+e.sx.toFixed(2), +e.sz.toFixed(2)] }); });
  hasilNembus.sort(function(a, b){ return b.m2 - a.m2; });

  /* ---------- temuan B: TEMBOK TAK TERLIHAT (diblok, tanpa geometri dalam 2 m) ---------- */
  var dist = new Uint8Array(N).fill(255); qh = 0; qt = 0;
  for (i = 0; i < N; i++){ if (own[i] >= 0){ dist[i] = 0; q[qt++] = i; } }
  while (qh < qt){ var c1 = q[qh++]; if (dist[c1] >= 12) continue; var i1 = c1 % NX, j1 = (c1 / NX) | 0; var nb1 = [i1 > 0 ? c1 - 1 : -1, i1 < NX - 1 ? c1 + 1 : -1, j1 > 0 ? c1 - NX : -1, j1 < NZ - 1 ? c1 + NX : -1]; for (var k3 = 0; k3 < 4; k3++){ var n3 = nb1[k3]; if (n3 >= 0 && dist[n3] === 255){ dist[n3] = dist[c1] + 1; q[qt++] = n3; } } }
  /* jangkauan FISIK (abaikan penabrak, hanya geometri + area + langkah) */
  var fis = new Uint8Array(N); qh = 0; qt = 0; fis[s0] = 1; q[qt++] = s0;
  while (qh < qt){
    var c4 = q[qh++], i4 = c4 % NX, j4 = (c4 / NX) | 0;
    var nb4 = [i4 > 0 ? c4 - 1 : -1, i4 < NX - 1 ? c4 + 1 : -1, j4 > 0 ? c4 - NX : -1, j4 < NZ - 1 ? c4 + NX : -1];
    for (var k4 = 0; k4 < 4; k4++){ var n4 = nb4[k4]; if (n4 < 0 || fis[n4] || area[n4] === 0 || dist[n4] < 1) continue; if (Math.abs(gndArr[n4] - gndArr[c4]) > 0.8) continue; fis[n4] = 1; q[qt++] = n4; }
  }
  var hantu = new Map();
  for (i = 0; i < N; i++){
    if (area[i] !== 1 || !fis[i] || dist[i] <= 8) continue;   /* bisa dicapai fisik, diblok penabrak, > 2 m dari geometri apa pun */
    var p0 = penyebab(cx(i), cz(i));
    var e2b = hantu.get(p0) || { n:0, xs:0, zs:0 }; e2b.n++; e2b.xs += cx(i); e2b.zs += cz(i); hantu.set(p0, e2b);
  }
  var hasilHantu = [];
  hantu.forEach(function(e, k){
    var info = k[0] === 'C' ? circ[+k.slice(1)] : ZONA_LARANG_PEMAIN[+k.slice(1)];
    hasilHantu.push({ penabrak:k, def:k[0] === 'C' ? [info.x, info.z, info.r] : info.slice(0, 5), m2:+(e.n * CELL * CELL).toFixed(2), pusat:[+(e.xs / e.n).toFixed(1), +(e.zs / e.n).toFixed(1)] });
  });
  hasilHantu.sort(function(a, b){ return b.m2 - a.m2; });

  /* ---------- temuan C: OBJEK SALING TEMBUS (sel setinggi badan dipakai 2 objek) ---------- */
  var hasilTumpuk = [];
  pair.forEach(function(n, k){
    var ab = k.split('|').map(Number), A = owners[ab[0]], B = owners[ab[1]];
    if (!A.glb && !B.glb) return;   /* kode-kode sudah digabung per kedekatan */
    if (ab[0] === ownPohon || ab[1] === ownPohon){ if (n < 2) return; }
    else if (n < 4) return;
    hasilTumpuk.push({ a:A.label, b:B.label, m2:+(n * CELL * CELL).toFixed(2) });
  });
  hasilTumpuk.sort(function(a, b){ return b.m2 - a.m2; });

  /* ---------- temuan D: MELAYANG / TENGGELAM ---------- */
  var hasilY = [];
  owners.forEach(function(ow){
    if (ow.id === ownPohon || ow.big) return;
    var list = ow.glb ? [] : ow.meshes;
    if (ow.glb) ow.root.traverse(function(o){ if (o.isMesh && vis(o) && o.userData.__own === ow.id) list.push(o); });
    var ymin = Infinity, ymax = -Infinity, bot = [];
    list.forEach(function(o){
      var pos = o.geometry.attributes.position, step = Math.max(1, Math.floor(pos.count / 3000));
      var inst = o.isInstancedMesh ? Math.min(o.count, 4) : 1;
      for (var ii = 0; ii < inst; ii++){
        if (o.isInstancedMesh){ o.getMatrixAt(ii, m4); mw.multiplyMatrices(o.matrixWorld, m4); } else mw.copy(o.matrixWorld);
        for (var k = 0; k < pos.count; k += step){ v3.fromBufferAttribute(pos, k).applyMatrix4(mw); if (v3.y < ymin) ymin = v3.y; if (v3.y > ymax) ymax = v3.y; bot.push(v3.x, v3.y, v3.z); }
      }
    });
    if (!isFinite(ymin)) return;
    /* celah terkecil ke tanah di antara titik-titik terendah */
    var gapMin = Infinity, gnds = [], nb2 = 0, sinkMax = -Infinity;
    for (var k = 0; k < bot.length; k += 3){
      if (bot[k + 1] > ymin + 0.3) continue;
      var gg = tinggiTanah(bot[k], bot[k + 2]); nb2++;
      var gap = bot[k + 1] - gg; if (gap < gapMin) gapMin = gap;
    }
    var tinggi = ymax - ymin;
    var lbl = ow.label;
    if (gapMin > 0.12 && nb2) hasilY.push({ obj:lbl, jenis:'melayang', celah:+gapMin.toFixed(2), tinggi:+tinggi.toFixed(1) });
    else if (gapMin < -0.35 && tinggi < 6) hasilY.push({ obj:lbl, jenis:'tenggelam', dalam:+(-gapMin).toFixed(2), tinggi:+tinggi.toFixed(1) });
    else if (ymax < 0.05 - 0.0 && tinggi > 0.2 && !ow.glb) {}
  });
  /* pohon/pinus instanced: y vs tanah */
  var pohonY = [];
  DAFTAR_POHON.concat(DAFTAR_PINUS).forEach(function(p){ var gg = tinggiTanah(p.x, p.z); if (Math.abs(p.y - gg) > 0.12) pohonY.push({ x:+p.x.toFixed(1), z:+p.z.toFixed(1), y:+p.y.toFixed(2), tanah:+gg.toFixed(2), zona:p.zona }); });
  /* pohon di luar area daratan / di jalan / di dalam bangunan */
  var pohonSalah = [];
  batang.forEach(function(t){
    var i5 = ci(t.x, t.z);
    var onLand = dalamArea(t.x, t.z) || dalamArea(t.x + 0.5, t.z) || dalamArea(t.x - 0.5, t.z);
    var kenaGLB = -1;
    for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++){ var i6 = i5 + dx + dz * NX; var oo = own[i6]; if (oo >= 0 && oo !== ownPohon && owners[oo].glb) kenaGLB = oo; }
    if (!onLand || kenaGLB >= 0) pohonSalah.push({ j:t.j, x:+t.x.toFixed(1), z:+t.z.toFixed(1), zona:t.zona, darat:onLand, kena:kenaGLB >= 0 ? owners[kenaGLB].label : null });
  });

  /* ---------- temuan E: Z-FIGHTING ---------- */
  var hasilZ = [];
  zfight.forEach(function(e, k){ if (e.n < 6) return; var ab = k.split('|'); hasilZ.push({ a:owners[+ab[0]].label, b:owners[+ab[1]].label, y:e.y.toFixed(3), m2:+(e.n * 4 * CELL * CELL).toFixed(1), titik:[+e.x.toFixed(1), +e.z.toFixed(1)], po:e.po }); });
  hasilZ.sort(function(a, b){ return b.m2 - a.m2; });

  /* ---------- temuan F: MUKA TERBALIK ---------- */
  var hasilFlip = [];
  flip.forEach(function(e, o4){ if (e.flip >= 20 && e.flip / Math.max(1, e.tri) > 0.01) hasilFlip.push({ obj:owners[o4].label, terbalik:e.flip, dari:e.tri }); });
  hasilFlip.sort(function(a, b){ return b.terbalik - a.terbalik; });

  /* ---------- temuan G: TEKSTUR ---------- */
  var tex = [], cekMat = new Set();
  meshes.forEach(function(o){
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(function(m){
      if (!m || cekMat.has(m.uuid)) return; cekMat.add(m.uuid);
      ['map', 'normalMap', 'emissiveMap', 'roughnessMap'].forEach(function(k){
        var t = m[k]; if (!t) return;
        var im = t.image;
        var ok = im && ((im.width > 0 && im.height > 0) || (im.naturalWidth > 0));
        if (!ok) tex.push({ obj:owners[o.userData.__own].label, mat:m.name || m.type, slot:k, masalah:'gambar kosong/gagal' });
        else if ((im.width || im.naturalWidth) <= 4) tex.push({ obj:owners[o.userData.__own].label, mat:m.name, slot:k, masalah:'tekstur ' + (im.width || im.naturalWidth) + 'px' });
      });
      if (o.geometry && (m.map || m.normalMap) && !o.geometry.attributes.uv) tex.push({ obj:owners[o.userData.__own].label, mat:m.name, masalah:'punya tekstur tapi tanpa UV' });
      if (o.geometry && !o.geometry.attributes.normal && !m.isMeshBasicMaterial) tex.push({ obj:owners[o.userData.__own].label, mat:m.name, masalah:'tanpa normal' });
    });
  });

  /* ---------- temuan H: BANGKU ---------- */
  var hasilBangku = [];
  bangkuList.forEach(function(b, k){
    var ent = bangkuSwapList.filter(function(e){ return Math.hypot(e.g.position.x - b.x, e.g.position.z - b.z) < 0.3; })[0];
    var r = { k:k, x:+b.x.toFixed(1), z:+b.z.toFixed(1) };
    if (!ent){ r.masalah = 'tidak ada model bangku di titik bangkuList'; hasilBangku.push(r); return; }
    var glb = ent.g.getObjectByName('KursiGLB');
    if (!glb || !vis(glb)) r.masalah = 'GLB kursi tidak tampil';
    var gg = tinggiTanah(b.x, b.z); if (Math.abs(ent.g.position.y - gg) > 0.06) r.y = +(ent.g.position.y - gg).toFixed(2);
    /* duduk bisa dicapai? ada sel terjangkau dalam 2,2 m */
    var bisa = false;
    for (var dx = -2.2; dx <= 2.2 && !bisa; dx += CELL) for (var dz = -2.2; dz <= 2.2 && !bisa; dz += CELL){ if (dx * dx + dz * dz > 4.84) continue; var i7 = ci(b.x + dx, b.z + dz); if (i7 >= 0 && reach[i7]) bisa = true; }
    if (!bisa) r.tak_terjangkau = true;
    /* depan bangku terhalang? (arah hadap +z lokal) */
    var fx = Math.sin(b.ry), fz = Math.cos(b.ry), halang = null;
    for (var d = 0.5; d <= 1.0; d += CELL){ var i8 = ci(b.x + fx * d, b.z + fz * d); var o5 = i8 >= 0 ? own[i8] : -1; if (o5 >= 0 && owners[o5].label.indexOf('kursi') < 0 && o5 !== (glb ? glb.userData.__own : -9)){ halang = owners[o5].label; break; } }
    if (halang) r.depan_terhalang = halang;
    /* bangku menabrak objek lain */
    if (r.masalah || r.y !== undefined || r.tak_terjangkau || r.depan_terhalang) hasilBangku.push(r);
  });

  /* ---------- temuan I: PINTU / INTERIOR yang bisa dimasuki ---------- */
  var interior = { 'G01 dalam':[-27, -14.8], 'Aula dalam':[-176, 74], 'Gym dalam':[-193, 76], 'Lab dalam':[-243, 76], 'Perpustakaan dalam':[-228, 60], 'Sekolah lobi':[-205, 45.3], 'Kantin dalam':[-207, 76], 'Konser dalam':[30, 200], 'G02 dalam':[14.75, 19.66], 'G05 dalam':[9.85, 32.42], 'G07 dalam':[29.72, 16.91], 'G06 dalam':[-34.54, -31.4], 'G08 dalam':[34.57, -14.92], 'G09 dalam':[20.71, -27.53], 'G10 dalam':[-14, -33], 'G04 dalam':[-7.2, 17.89] };
  var hasilPintu = {};
  Object.keys(interior).forEach(function(k){
    var p = interior[k], best = null;
    for (var dx = -1.5; dx <= 1.5; dx += CELL) for (var dz = -1.5; dz <= 1.5; dz += CELL){ var i9 = ci(p[0] + dx, p[1] + dz); if (i9 >= 0 && reach[i9]){ best = [p[0] + dx, p[1] + dz]; dx = 9; break; } }
    var i10 = ci(p[0], p[1]);
    hasilPintu[k] = { terjangkau:!!best, area:area[i10], penyebab:penyebab(p[0], p[1]) };
  });

  window.__aud = { own:own, reach:reach, area:area, fis:fis, owners:owners.map(function(o){ return o.label; }), X0:X0, Z0:Z0, CELL:CELL, NX:NX, NZ:NZ, circ:circ };
  return {
    ms:Math.round(performance.now() - T0), owners:owners.length, stats:stats, selTerjangkau:nReach,
    nembus:hasilNembus.slice(0, 120), hantu:hasilHantu.slice(0, 120), tumpuk:hasilTumpuk.slice(0, 150),
    melayangTenggelam:hasilY, pohonY:pohonY.slice(0, 60), pohonSalah:pohonSalah.slice(0, 80), pohonSalahN:pohonSalah.length,
    zfight:hasilZ.slice(0, 80), mukaTerbalik:hasilFlip, tekstur:tex, bangku:hasilBangku, pintu:hasilPintu,
    jmlBangku:bangkuList.length
  };
})()
