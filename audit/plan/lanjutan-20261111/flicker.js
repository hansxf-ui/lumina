/* Detektor KEDIP berbasis render (eksak): proyeksi x,y kamera perspektif TIDAK bergantung pada
   near; hanya nilai depth yang berubah. Render ulang adegan yang sama dengan near 0,1 vs
   0,1003/0,1007/0,1012 -> piksel yang warnanya berubah = piksel yang urutan depth-nya
   ambigu (z-fighting) = yang berkedip saat kamera bergerak di HP. Lalu raycast piksel kedip
   untuk menamai pasangan objek.
   window.__FL = { views:[{n, p:[x,y,z], t:[x,y,z]}], W, H, simpan:true } */
(function(){
  var O = window.__FL, gl = renderer.getContext();
  var W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;   /* framebuffer default (depth 24-bit seperti di HP), BUKAN render target (r128: DEPTH_COMPONENT16) */
  var oldAsp = camera.aspect, oldNear = camera.near, oldPos = camera.position.clone(), oldQ = camera.quaternion.clone();
  camera.aspect = W / H;
  function shot(near){
    camera.near = near; camera.updateProjectionMatrix();
    renderer.setRenderTarget(null); renderer.render(scene, camera);
    var buf = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    return buf;
  }
  function nama(o){ var s = [], p = o; while (p && p !== scene && s.length < 2){ s.push((p.name || p.type) + (p.userData && p.userData.src ? '<' + p.userData.src.replace(/\.glb.*/, '') + '>' : '')); p = p.parent; } return s.join('/'); }
  function matNama(h){ var m = h.object.material; if (Array.isArray(m)) m = m[(h.face && h.face.materialIndex) || 0]; return m ? (m.name || m.type) + (m.color ? '#' + m.color.getHexString() : '') : '?'; }
  var rc = new THREE.Raycaster(); rc.camera = camera;
  var hasil = [], pasangan = {};
  O.views.forEach(function(v){
    camera.position.set(v.p[0], v.p[1], v.p[2]); camera.lookAt(v.t[0], v.t[1], v.t[2]); camera.updateMatrixWorld(true);
    var N0 = O.near || oldNear, base = shot(N0), mask = new Uint8Array(W * H), n = 0;
    [1.003, 1.007, 1.012].forEach(function(fk){
      var b = shot(N0 * fk);
      for (var i = 0; i < W * H; i++){
        var d = Math.abs(b[i * 4] - base[i * 4]) + Math.abs(b[i * 4 + 1] - base[i * 4 + 1]) + Math.abs(b[i * 4 + 2] - base[i * 4 + 2]);
        if (d > 24 && !mask[i]){ mask[i] = 1; n++; }
      }
    });
    camera.near = N0; camera.updateProjectionMatrix();
    /* buang piksel KLIP NEAR (geometri < 0,25 m dari kamera: garis potong near plane ikut
       bergeser saat near diubah — bukan z-fighting, dan kamera game tidak pernah sedekat itu) */
    var rcN = new THREE.Raycaster(); rcN.camera = camera; rcN.far = N0 + 0.15;
    for (var iN = 0; iN < W * H; iN++){
      if (!mask[iN]) continue;
      rcN.setFromCamera({ x:((iN % W) + 0.5) / W * 2 - 1, y:(Math.floor(iN / W) + 0.5) / H * 2 - 1 }, camera);
      if (rcN.intersectObjects(scene.children, true).some(function(h){ return h.object.isMesh && h.object.visible; })){ mask[iN] = 0; n--; }
    }
    /* identifikasi: sampel piksel kedip */
    var idx = []; for (var i2 = 0; i2 < W * H; i2++) if (mask[i2]) idx.push(i2);
    var step = Math.max(1, Math.floor(idx.length / 80)), lokal = {};
    for (var k = 0; k < idx.length; k += step){
      var px = idx[k] % W, py = Math.floor(idx[k] / W);   /* readPixels: baris 0 = bawah */
      rc.setFromCamera({ x:(px + 0.5) / W * 2 - 1, y:(py + 0.5) / H * 2 - 1 }, camera);
      var hits = rc.intersectObjects(scene.children, true).filter(function(h){ return h.object.isMesh && !h.object.isSkinnedMesh && h.object.visible; });
      var pr = null;
      for (var a = 0; a + 1 < hits.length && a < 6; a++){
        if (hits[a + 1].distance - hits[a].distance < Math.max(0.02, hits[a].distance * 0.0015)){
          var A = nama(hits[a].object) + ' :: ' + matNama(hits[a]), B = nama(hits[a + 1].object) + ' :: ' + matNama(hits[a + 1]);
          pr = (A < B ? A + ' || ' + B : B + ' || ' + A) + ' @y' + hits[a].point.y.toFixed(2);
          lokal[pr] = lokal[pr] || { c:0, p:hits[a].point.toArray().map(function(x){ return +x.toFixed(2); }), d:+(hits[a + 1].distance - hits[a].distance).toFixed(4), dist:+hits[a].distance.toFixed(1) };
          lokal[pr].c += step; break;
        }
      }
      if (!pr){ var h0 = hits[0]; var kx = h0 ? '(tunggal) ' + nama(h0.object) + ' :: ' + matNama(h0) : '(langit)'; lokal[kx] = lokal[kx] || { c:0, p:h0 ? h0.point.toArray().map(function(x){ return +x.toFixed(2); }) : null }; lokal[kx].c += step; }
    }
    Object.keys(lokal).forEach(function(kk){ var e = pasangan[kk] || (pasangan[kk] = { px:0, views:[], p:lokal[kk].p, d:lokal[kk].d, dist:lokal[kk].dist }); e.px += lokal[kk].c; e.views.push(v.n); });
    var img = null;
    if (O.simpan && n > 0){
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var x = cv.getContext('2d'), id = x.createImageData(W, H);
      for (var y = 0; y < H; y++) for (var xx = 0; xx < W; xx++){ var s = ((H - 1 - y) * W + xx) * 4, t = (y * W + xx) * 4, mm = mask[(H - 1 - y) * W + xx];
        id.data[t] = mm ? 255 : base[s] * 0.6; id.data[t + 1] = mm ? 0 : base[s + 1] * 0.6; id.data[t + 2] = mm ? 255 : base[s + 2] * 0.6; id.data[t + 3] = 255; }
      x.putImageData(id, 0, 0); img = cv.toDataURL('image/png');
    }
    hasil.push({ n:v.n, px:n, img:img });
  });
  camera.aspect = oldAsp; camera.near = oldNear; camera.updateProjectionMatrix(); camera.position.copy(oldPos); camera.quaternion.copy(oldQ);
  var daftar = Object.keys(pasangan).map(function(k){ var e = pasangan[k]; return { k:k, px:e.px, nv:e.views.length, views:e.views.slice(0, 6), p:e.p, d:e.d, dist:e.dist }; }).sort(function(a, b){ return b.px - a.px; });
  return { views:hasil, pasangan:daftar, depthBits:gl.getParameter(gl.DEPTH_BITS), W:W, H:H };
})()
