// node verify.cjs <query> <prefix>  — smoke test gameplay di headless Chromium (tanpa injeksi apa pun)
const { chromium } = require('/root/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright-core');
(async () => {
  const srv = await require('./srv.cjs')(process.env.ROOT || '/projects/sandbox/lumina', 8767);
  const q = process.argv[2] || '?jam=10', pre = process.argv[3] || 'r/vf';
  const b = await chromium.launch({ executablePath:'/inner_container/opt/playwright/chromium_headless_shell-1232/chrome-headless-shell-linux64/chrome-headless-shell', args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','--disable-crash-reporter','--no-zygote','--disable-gpu-sandbox'] });
  const p = await b.newPage({ viewport:{ width:1280, height:720 } });
  const err = [], warn = [];
  p.on('console', m => { const t = m.text(); if (/mqtt|TUNNEL|hivemq|emqx|WebSocket/i.test(t)) return; if (m.type() === 'error') err.push('console.error: ' + t); else if (m.type() === 'warning') warn.push(t); });
  p.on('pageerror', e => err.push('PAGEERR: ' + e.message));
  p.on('requestfailed', r => { if (!/unpkg|mqtt|hivemq|emqx/.test(r.url())) err.push('REQFAIL ' + r.url()); });
  p.on('response', r => { if (r.status() >= 400) err.push('HTTP ' + r.status() + ' ' + r.url()); });
  const hasil = {};
  const cek = (n, ok, info) => { hasil[n] = { ok:!!ok, info }; console.log((ok ? 'OK   ' : 'GAGAL') + ' ' + n + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
  const t0 = Date.now();
  await p.goto('http://localhost:8767/index.html' + q);
  await p.waitForFunction(() => window.__antreMuatSibuk && !window.__antreMuatSibuk() && typeof modelKarakter !== 'undefined' && (modelKarakter.cewek || modelKarakterGagal.cewek), null, { timeout:300000, polling:1000 });
  await p.waitForTimeout(3000);
  cek('muat', true, { detik:((Date.now() - t0) / 1000).toFixed(1) });
  const masukTampil = await p.evaluate(() => { const e = document.getElementById('btnMasuk'); return !!e && e.offsetParent !== null && !sudahMasuk; });
  await p.screenshot({ path:pre + '-1-layar-masuk.png', timeout:180000 });
  cek('layar masuk tampil', masukTampil);
  await p.evaluate(() => document.getElementById('btnMasuk').click());
  await p.waitForTimeout(5000);
  cek('masuk kota', await p.evaluate(() => sudahMasuk === true));
  await p.screenshot({ path:pre + '-2-kota.png', timeout:180000 });
  // jalan
  const jalan = await p.evaluate(async () => { const a = [pemain.x, pemain.z]; keys['KeyW'] = true; await new Promise(r => setTimeout(r, 3000)); keys['KeyW'] = false; return { dari:a, ke:[pemain.x, pemain.z], m:Math.hypot(pemain.x - a[0], pemain.z - a[1]) }; });
  cek('jalan (W 3 dtk; swiftshader ~2-5 fps)', jalan.m > 0.1, jalan);
  await p.screenshot({ path:pre + '-3-jalan.png', timeout:180000 });
  // duduk
  const duduk = await p.evaluate(async () => {
    const bk = bangkuList[0]; pemain.x = bk.x + Math.sin(bk.ry || 0) * 0.9; pemain.z = bk.z + Math.cos(bk.ry || 0) * 0.9;
    await new Promise(r => setTimeout(r, 1500));
    const tampil = getComputedStyle(document.getElementById('btnDuduk')).display;
    document.getElementById('btnDuduk').click();
    await new Promise(r => setTimeout(r, 2500));
    return { tombol:tampil, duduk:!!pemain.duduk, n:bangkuList.length };
  });
  cek('duduk di bangku', duduk.tombol === 'block' && duduk.duduk, duduk);
  await p.screenshot({ path:pre + '-4-duduk.png', timeout:180000 });
  await p.evaluate(async () => { document.getElementById('btnDuduk').click(); await new Promise(r => setTimeout(r, 800)); });
  // jembatan darat selatan: jalan dari pantai ke daratan selatan
  const sel = await p.evaluate(async () => {
    /* langkah 0,3 m memakai logika gerak game sendiri (langkahSah + dorongPemainSemua) —
       swiftshader terlalu lambat untuk menahan tombol W 75 m */
    pemain.x = 0.5; pemain.z = 70; let macet = null;
    for (let i = 0; i < 300 && pemain.z < 150; i++){
      const nz = pemain.z + 0.3;
      if (langkahSah(pemain.x, nz)) pemain.z = nz; else { macet = [pemain.x, nz]; break; }
      dorongPemainSemua(pemain);
    }
    camYaw = Math.PI; await new Promise(r => setTimeout(r, 2500));
    return { z:+pemain.z.toFixed(2), x:+pemain.x.toFixed(2), macet };
  });
  cek('jalan ke daratan selatan', sel.z > 140, sel);
  await p.screenshot({ path:pre + '-5-selatan.png', timeout:180000 });
  // playground: collider otomatis aktif
  const oto = await p.evaluate(() => penabrak.filter(t => t.oto).length);
  cek('collider otomatis rekreasi selatan', oto > 300, { lingkaran:oto });
  // G01: kamera ikut masuk
  const g01 = await p.evaluate(async () => {
    { const th = 1.091 + Math.PI; pemain.x = -27 + 0.3 * Math.sin(th); pemain.z = -14 + 0.3 * Math.cos(th); } camYaw = 1.091;   /* tengah toko, kamera di belakang ke arah pintu (sisi lokal -Z, menghadap plaza) */
    await new Promise(r => setTimeout(r, 9000));
    const o = ZONA_LARANG_KAMERA[0], c = Math.cos(o[4]), s = Math.sin(o[4]);
    const dx = camera.position.x - o[0], dz = camera.position.z - o[1];
    const lx = dx * c - dz * s, lz = dx * s + dz * c;
    return { cam:[+camera.position.x.toFixed(2), +camera.position.y.toFixed(2), +camera.position.z.toFixed(2)], dalam:Math.abs(lx) <= o[2] && Math.abs(lz) <= o[3] };
  });
  cek('kamera ikut masuk G01', g01.dalam, g01);
  await p.screenshot({ path:pre + '-6-g01.png', timeout:180000 });
  // G04 berdiri tegak
  const g04 = await p.evaluate(() => {
    const th = 2.761 + Math.PI, c = Math.cos(th), s = Math.sin(th);
    const W = (x, z) => [-15 + x * c + z * s, 37.4 - x * s + z * c];
    const rc = new THREE.Raycaster(), hasil = {}; rc.camera = camera;
    [['bubungan', 0, -14.9], ['tepi-atap', 2.9, -17.2], ['plinth', 0, -11.75]].forEach(t => {
      const w = W(t[1], t[2]); rc.set(new THREE.Vector3(w[0], 40, w[1]), new THREE.Vector3(0, -1, 0));
      const h = rc.intersectObjects(scene.children, true).filter(i => i.object.isMesh && i.object.visible && !i.object.isSprite)[0];
      hasil[t[0]] = h ? +h.point.y.toFixed(2) : null;
    });
    return hasil;
  });
  cek('G04 tegak (atap di atas, etalase di bawah)', g04.bubungan > 14.5 && g04['tepi-atap'] < 14.2 && g04['tepi-atap'] > 12.5, g04);
  await p.evaluate(async () => { pemain.x = -3; pemain.z = 13; camYaw = Math.atan2(-3 + 9.4, 13 - 23.4) + Math.PI; await new Promise(r => setTimeout(r, 2500)); });
  await p.screenshot({ path:pre + '-7-g04.png', timeout:180000 });
  // jalan langkah 0,1 m memakai logika gerak game (langkahSah + dorongPemainSemua)
  const jalanKe = async (rute) => p.evaluate(async (rute) => {
    pemain.x = rute[0][0]; pemain.z = rute[0][1]; pemain.y = tinggiTanah(pemain.x, pemain.z);
    let macet = null, n = 0;
    for (let k = 1; k < rute.length && !macet; k++){
      const tx = rute[k][0], tz = rute[k][1];
      for (let i = 0; i < 600; i++){
        const dx = tx - pemain.x, dz = tz - pemain.z, d = Math.hypot(dx, dz);
        if (d < 0.12) break;
        const nx = pemain.x + dx / d * 0.1, nz = pemain.z + dz / d * 0.1;
        if (langkahSah(nx, nz)){ pemain.x = nx; pemain.z = nz; } else { macet = [+nx.toFixed(2), +nz.toFixed(2)]; break; }
        dorongPemainSemua(pemain); n++;
        if (i === 599) macet = ['tak sampai', +pemain.x.toFixed(2), +pemain.z.toFixed(2)];
      }
    }
    return { x:+pemain.x.toFixed(2), z:+pemain.z.toFixed(2), y:+tinggiTanah(pemain.x, pemain.z).toFixed(2), langkah:n, macet };
  }, rute);
  const kamDalam = async (row, yaw, tunggu) => p.evaluate(async ([row, yaw, tunggu]) => {
    camYaw = yaw; const t0 = performance.now(); let r0;
    const o = ZONA_LARANG_KAMERA[row], c = Math.cos(o[4]), s = Math.sin(o[4]);
    do {
      await new Promise(r => setTimeout(r, 1000));
      const dx = camera.position.x - o[0], dz = camera.position.z - o[1], lx = dx * c - dz * s, lz = dx * s + dz * c;
      const pdx = pemain.x - o[0], pdz = pemain.z - o[1];
      r0 = { cam:[+camera.position.x.toFixed(2), +camera.position.y.toFixed(2), +camera.position.z.toFixed(2)], pemain:[+pemain.x.toFixed(2), +pemain.z.toFixed(2)], pemainDalam:Math.abs(pdx * c - pdz * s) <= o[2] && Math.abs(pdx * s + pdz * c) <= o[3], dalam:Math.abs(lx) <= o[2] && Math.abs(lz) <= o[3], plafon:KAMERA_MASUK[row], detik:+((performance.now() - t0) / 1000).toFixed(1) };
    } while (!(r0.dalam && r0.cam[1] < r0.plafon && r0.detik > 3) && performance.now() - t0 < tunggu);
    return r0;
  }, [row, yaw, tunggu]);
  // aula: dari halaman lewat undakan & pintu, lorong tengah kursi, ke panggung
  const aula = await jalanKe([[-176.4, 66], [-178, 69.2], [-178, 72], [-178, 76.9], [-178, 78.2]]);
  cek('masuk aula s.d. panggung', !aula.macet && aula.z > 78 && Math.abs(aula.y - 0.6) < 0.05, aula);
  await p.evaluate(() => { pemain.x = -178; pemain.z = 73.9; });
  const kA = await kamDalam(23, 0, 150000);
  cek('kamera ikut masuk aula (di bawah plafon)', kA.dalam && kA.cam[1] < kA.plafon, kA);
  await p.screenshot({ path:pre + '-8-aula.png', timeout:180000 });
  // G04: dari plaza lewat undakan marmer & pintu terbuka ke tengah toko (koordinat lokal model)
  const g04j = await p.evaluate(() => { const th = 2.761 + Math.PI, c = Math.cos(th), s = Math.sin(th); return [[0, -21], [0.05, -18.4], [0.05, -17.2], [0, -16.3]].map(l => [-15 + l[0] * c + l[1] * s, 37.4 - l[0] * s + l[1] * c]); });
  const g4 = await jalanKe(g04j);
  const g4l = await p.evaluate(() => { const th = 2.761 + Math.PI, c = Math.cos(th), s = Math.sin(th), dx = pemain.x + 15, dz = pemain.z - 37.4; return [+(dx * c - dz * s).toFixed(2), +(dx * s + dz * c).toFixed(2)]; });
  cek('masuk G04 (lokal z > -16,5; pintu -17,85)', !g4.macet && g4l[1] > -16.5 && g4.y > 0.6, Object.assign(g4, { lokal:g4l }));
  const kG = await kamDalam(3, 2.761 + Math.PI, 150000);
  cek('kamera ikut masuk G04 (di bawah plafon)', kG.dalam && kG.cam[1] < kG.plafon, kG);
  await p.screenshot({ path:pre + '-9-g04-dalam.png', timeout:180000 });
  cek('tanpa error JS', err.length === 0, err.slice(0, 8));
  console.log('RINGKAS', JSON.stringify(Object.fromEntries(Object.entries(hasil).map(([k, v]) => [k, v.ok]))));
  await b.close(); srv.close();
})().catch(e => { console.log('FATAL', e.message); process.exit(1); });
