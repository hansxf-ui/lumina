(function(){
  var A = window.__aud, RX = [/^taman-bermain-blender-v1@/, /^kolam-renang-blender-v1@/, /^gerbang-pasar-blender-v1@/, /^skatepark-blender-v1@/, /^taman-bunga-blender-v1@/];
  var out = {};
  var ids = {};
  A.owners.forEach(function(l, i){ RX.forEach(function(r){ if (r.test(l)) ids[i] = l; }); });
  var B = 0.75, blocks = {};
  for (var k = 0; k < A.own.length; k++){
    var o = A.own[k]; if (o < 0 || !(o in ids)) continue;
    var x = A.X0 + (k % A.NX + 0.5) * A.CELL, z = A.Z0 + (Math.floor(k / A.NX) + 0.5) * A.CELL;
    var key = o + ':' + Math.floor(x / B) + ',' + Math.floor(z / B);
    var b = blocks[key] || (blocks[key] = { o:o, n:0, xs:0, zs:0, pts:[] }); b.n++; b.xs += x; b.zs += z; b.pts.push([x, z]);
  }
  Object.keys(blocks).forEach(function(key){
    var b = blocks[key]; if (b.n < 2) return;
    var cx = b.xs / b.n, cz = b.zs / b.n, r = 0;
    b.pts.forEach(function(p){ r = Math.max(r, Math.hypot(p[0] - cx, p[1] - cz)); });
    (out[ids[b.o]] = out[ids[b.o]] || []).push([+cx.toFixed(2), +cz.toFixed(2), +Math.min(0.6, r + 0.125).toFixed(2)]);
  });
  var cnt = {}; Object.keys(out).forEach(function(k){ cnt[k] = out[k].length; });
  return { cnt:cnt, out:out };
})()
