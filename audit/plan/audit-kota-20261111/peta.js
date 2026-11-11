/* window.__PETA = [{n, x0,z0,x1,z1}] -> dataURL per crop */
(function(){
  var A = window.__aud, out = {};
  window.__PETA.forEach(function(w){
    var px = Math.round((w.x1 - w.x0) / A.CELL), pz = Math.round((w.z1 - w.z0) / A.CELL), S = Math.max(1, Math.floor(900 / Math.max(px, pz)));
    var cv = document.createElement('canvas'); cv.width = px * S; cv.height = pz * S; var x = cv.getContext('2d');
    var lab = {};
    for (var j = 0; j < pz; j++) for (var i = 0; i < px; i++){
      var gx = Math.floor((w.x0 + (i + 0.5) * A.CELL - A.X0) / A.CELL), gz = Math.floor((w.z0 + (j + 0.5) * A.CELL - A.Z0) / A.CELL);
      var k = gz * A.NX + gx, o = A.own[k], c;
      if (o >= 0){ var h = (o * 137) % 360; c = 'hsl(' + h + ',55%,' + (A.reach[k] ? '45%' : '28%') + ')'; var L = lab[o] || (lab[o] = { n:0, x:0, z:0 }); L.n++; L.x += i; L.z += j; if (A.reach[k]){ x.fillStyle = c; x.fillRect(i * S, j * S, S, S); x.fillStyle = '#ff0'; x.fillRect(i * S + S / 3, j * S + S / 3, Math.max(1, S / 3), Math.max(1, S / 3)); continue; } }
      else if (A.area[k] === 0) c = '#334a66';
      else if (A.reach[k]) c = '#cfe8c0';
      else if (A.area[k] === 1 && A.fis[k]) c = '#ff5a5a';
      else if (A.area[k] === 1) c = '#e8b4b4';
      else c = '#9fb59a';
      x.fillStyle = c; x.fillRect(i * S, j * S, S, S);
    }
    /* lingkaran penabrak */
    x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 1;
    A.circ.forEach(function(t){ if (t.x < w.x0 - 6 || t.x > w.x1 + 6 || t.z < w.z0 - 6 || t.z > w.z1 + 6) return; x.beginPath(); x.arc((t.x - w.x0) / A.CELL * S, (t.z - w.z0) / A.CELL * S, (t.r + 0.55) / A.CELL * S, 0, 7); x.stroke(); });
    x.font = '11px sans-serif';
    Object.keys(lab).forEach(function(o){ var L = lab[o]; if (L.n < 6) return; x.fillStyle = '#000'; x.fillText(A.owners[o].slice(0, 34), L.x / L.n * S - 30, L.z / L.n * S); });
    /* grid 5 m */
    x.fillStyle = '#000'; for (var gx2 = Math.ceil(w.x0 / 5) * 5; gx2 <= w.x1; gx2 += 5){ x.fillRect((gx2 - w.x0) / A.CELL * S, 0, 1, 6); if (gx2 % 10 === 0) x.fillText(gx2, (gx2 - w.x0) / A.CELL * S + 2, 16); }
    for (var gz2 = Math.ceil(w.z0 / 5) * 5; gz2 <= w.z1; gz2 += 5){ x.fillRect(0, (gz2 - w.z0) / A.CELL * S, 6, 1); if (gz2 % 10 === 0) x.fillText(gz2, 8, (gz2 - w.z0) / A.CELL * S + 4); }
    out[w.n] = cv.toDataURL('image/png');
  });
  return out;
})()
