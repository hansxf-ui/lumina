(function(){
  var A = window.__aud, res = [];
  /* map owner id -> root via label; recompute roots */
  var roots = {};
  scene.traverse(function(o){ if (o.userData && o.userData.src && (!o.parent || !o.parent.userData.src)) { var v = new THREE.Vector3(); o.getWorldPosition(v); roots[o.userData.src.replace(/\.glb.*$/,'') + '@' + v.x.toFixed(1) + ',' + v.z.toFixed(1)] = o; } });
  var cells = {};
  for (var k = 0; k < A.own.length; k++){ var o = A.own[k]; if (o < 0) continue; (cells[o] = cells[o] || []).push(k); }
  Object.keys(cells).forEach(function(o){
    var lab = A.owners[o], r = roots[lab]; if (!r) return;
    if (cells[o].length < 40) return;
    var q = new THREE.Quaternion(); r.getWorldQuaternion(q); var e = new THREE.Euler().setFromQuaternion(q, 'YXZ'); var ry = e.y;
    var c = Math.cos(ry), s = Math.sin(ry), xs = [], zs = [], sx = 0, sz = 0;
    cells[o].forEach(function(k){ var x = A.X0 + (k % A.NX + 0.5) * A.CELL, z = A.Z0 + (Math.floor(k / A.NX) + 0.5) * A.CELL; sx += x; sz += z; });
    var mx = sx / cells[o].length, mz = sz / cells[o].length;
    cells[o].forEach(function(k){ var x = A.X0 + (k % A.NX + 0.5) * A.CELL - mx, z = A.Z0 + (Math.floor(k / A.NX) + 0.5) * A.CELL - mz; xs.push(x * c - z * s); zs.push(x * s + z * c); });
    xs.sort(function(a,b){return a-b;}); zs.sort(function(a,b){return a-b;});
    var p = function(a, f){ return a[Math.floor((a.length - 1) * f)]; };
    var lx0 = p(xs, 0.003), lx1 = p(xs, 0.997), lz0 = p(zs, 0.003), lz1 = p(zs, 0.997);
    var ox = (lx0 + lx1) / 2, oz = (lz0 + lz1) / 2;
    var cxw = mx + ox * c + oz * s, czw = mz - ox * s + oz * c;
    res.push([lab, +cxw.toFixed(2), +czw.toFixed(2), +((lx1 - lx0) / 2 + 0.125).toFixed(2), +((lz1 - lz0) / 2 + 0.125).toFixed(2), +ry.toFixed(3), cells[o].length]);
  });
  return res;
})()
