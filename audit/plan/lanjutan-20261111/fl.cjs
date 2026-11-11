// node fl.cjs views.json outPrefix [query]  — jalankan flicker.js per batch, simpan gambar + json
const { chromium } = require('/root/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright-core');
const fs = require('fs');
(async () => {
  const ROOT = process.env.ROOT || '/projects/sandbox/lumina';
  const srv = await require('./srv.cjs')(ROOT, 8772);
  const views = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), pre = process.argv[3], q = process.argv[4] || '?jam=10&nogabung=1';
  const b = await chromium.launch({ executablePath:'/inner_container/opt/playwright/chromium_headless_shell-1232/chrome-headless-shell-linux64/chrome-headless-shell', args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','--disable-crash-reporter','--no-zygote','--disable-gpu-sandbox'] });
  const p = await b.newPage({ viewport:{ width:+(process.env.VW||960), height:+(process.env.VH||540) } });
  const err = [];
  p.on('pageerror', e => err.push('PAGEERR ' + e.message));
  await p.route('**/index.html*', async route => {
    let html = fs.readFileSync(ROOT + '/index.html', 'utf8');
    const tag = `<script>(function(){var a=THREE.GLTFLoader.prototype.load;THREE.GLTFLoader.prototype.load=function(u,ok,pr,er){return a.call(this,u,function(g){try{g.scene.traverse(function(o){o.userData.src=u;});}catch(e){} ok&&ok(g);},pr,er);};})();</script>`;
    html = html.replace('<script src="GLTFLoader.js"></script>', '<script src="GLTFLoader.js"></script>' + tag);
    if (!process.env.KEEPR2) html = html.replace(/\ngabungMeshStatis\(\);\n/, '\n/*audit: R2 off*/\n');
    route.fulfill({ status:200, contentType:'text/html', body:html });
  });
  await p.goto('http://localhost:8772/index.html' + q);
  await p.waitForFunction(() => typeof REGISTRI_VEG !== 'undefined' && window.__antreMuatSibuk && !window.__antreMuatSibuk() && typeof modelKarakter !== 'undefined' && (modelKarakter.cewek || modelKarakterGagal.cewek), null, { timeout:300000, polling:1000 });
  await p.waitForTimeout(3000);
  if (process.env.PRE_JS) await p.evaluate(fs.readFileSync(process.env.PRE_JS, 'utf8'));
  const src = fs.readFileSync('flicker.js', 'utf8'), all = { views:[], pasangan:{} };
  const BATCH = +(process.env.BATCH || 6);
  for (let i = 0; i < views.length; i += BATCH){
    const part = views.slice(i, i + BATCH);
    const r = await p.evaluate('window.__FL=' + JSON.stringify({ views:part, W:+(process.env.W || 480), H:+(process.env.H || 270), simpan:!process.env.NOIMG }) + ';' + src);
    r.views.forEach(v => { if (v.img) fs.writeFileSync(pre + '-' + v.n + '.png', Buffer.from(v.img.split(',')[1], 'base64')); all.views.push({ n:v.n, px:v.px }); });
    r.pasangan.forEach(e => { const a = all.pasangan[e.k] || (all.pasangan[e.k] = { px:0, nv:0, views:[], p:e.p, d:e.d, dist:e.dist }); a.px += e.px; a.nv += e.nv; a.views.push(...e.views); });
    process.stdout.write('.'); if (i === 0) console.log('depthBits', r.depthBits, r.W + 'x' + r.H);
  }
  const list = Object.entries(all.pasangan).map(([k, v]) => Object.assign({ k }, v)).sort((a, b) => b.px - a.px);
  fs.writeFileSync(pre + '.json', JSON.stringify({ views:all.views, pasangan:list, err }, null, 1));
  const tot = all.views.reduce((s, v) => s + v.px, 0);
  console.log('\nviews', all.views.length, 'piksel kedip total', tot, 'err', err.length);
  await b.close(); srv.close();
})();
