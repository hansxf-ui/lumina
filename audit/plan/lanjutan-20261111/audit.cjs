// node audit.cjs out.json [query] [evalFile]
const { chromium } = require('/root/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright-core');
const fs = require('fs');
(async () => {
  const ROOT = process.env.ROOT || '/projects/sandbox/lumina';
  const srv = await require('./srv.cjs')(ROOT, 8771);
  const out = process.argv[2], q = process.argv[3] || '?jam=10&nogabung=1', evf = process.argv[4] || 'audit-full.js';
  const b = await chromium.launch({ executablePath:'/inner_container/opt/playwright/chromium_headless_shell-1232/chrome-headless-shell-linux64/chrome-headless-shell', args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','--disable-crash-reporter','--no-zygote','--disable-gpu-sandbox'] });
  const p = await b.newPage({ viewport:{ width:1280, height:720 } });
  const logs = [], reqfail = [];
  p.on('console', m => { const t = m.text(); if (!/mqtt|TUNNEL|hivemq|emqx/i.test(t)) logs.push(m.type() + ': ' + t); });
  p.on('pageerror', e => logs.push('PAGEERR: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  p.on('requestfailed', r => { if (!/unpkg|mqtt/.test(r.url())) reqfail.push(r.url()); });
  p.on('response', r => { if (r.status() >= 400) reqfail.push(r.status() + ' ' + r.url()); });
  if (!process.env.NOINJECT) await p.route('**/index.html*', async route => {
    let html = fs.readFileSync(ROOT + '/index.html', 'utf8');
    const tag = `<script>(function(){var a=THREE.GLTFLoader.prototype.load;THREE.GLTFLoader.prototype.load=function(u,ok,pr,er){return a.call(this,u,function(g){try{g.scene.traverse(function(o){o.userData.src=u;});}catch(e){} ok&&ok(g);},pr,er);};})();</script>`;
    html = html.replace('<script src="GLTFLoader.js"></script>', '<script src="GLTFLoader.js"></script>' + tag);
    if (!process.env.KEEPR2) html = html.replace(/\ngabungMeshStatis\(\);\n/, '\n/*audit: R2 off*/\n');
    route.fulfill({ status:200, contentType:'text/html', body:html });
  });
  await p.goto('http://localhost:8771/index.html' + q);
  const t0 = Date.now();
  await p.waitForFunction(() => typeof REGISTRI_VEG !== 'undefined' && REGISTRI_VEG.length >= 4 && window.__antreMuatSibuk && !window.__antreMuatSibuk() && typeof modelKarakter !== 'undefined' && (modelKarakter.cewek || modelKarakterGagal.cewek), null, { timeout:300000, polling:1000 });
  await p.waitForTimeout(4000);
  const loadMs = Date.now() - t0;
  let res;
  try { res = await p.evaluate(fs.readFileSync(evf, 'utf8')); } catch (e) { res = { err:e.message }; }
  if (process.env.PETA){
    await p.evaluate('window.__PETA=' + fs.readFileSync(process.env.PETA, 'utf8'));
    const imgs = await p.evaluate(fs.readFileSync('peta.js', 'utf8'));
    for (const k of Object.keys(imgs)) fs.writeFileSync('peta-' + k + '.png', Buffer.from(imgs[k].split(',')[1], 'base64'));
  }
  if (process.env.EVAL2){ try { res.eval2 = await p.evaluate(fs.readFileSync(process.env.EVAL2, 'utf8')); } catch (e) { res.eval2 = 'ERR ' + e.message; } }
  fs.writeFileSync(out, JSON.stringify({ loadMs, logs, reqfail, res }, null, 1));
  console.log('done', out, 'load', loadMs, 'ms; logs', logs.length, 'reqfail', reqfail.length);
  await b.close(); srv.close();
})();
