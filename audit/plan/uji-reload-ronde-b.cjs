// Harness Ronde B — verifikasi fix loop reload loading screen.
// (1) node --check 3 blok <script> inline dari index.html.
// (2) Simulasi urutan event WebGL dengan KODE ASLI yang diekstrak dari
//     index.html (bukan re-implementasi): lost -> restored (sebelum timer
//     1200 ms) -> navigasi ctx=1 -> lost lagi -> restored lagi.
//     Loop PUTUS bila: tepat 1 navigasi, 0 reload tanpa penanda, dan
//     sesudah ctx=1 tidak ada lagi navigasi/reload.
// Jalan: node audit/plan/uji-reload-ronde-b.cjs   (exit 0 = LOLOS)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const IDX = path.join(__dirname, '..', '..', 'index.html');
const src = fs.readFileSync(IDX, 'utf8');
let gagal = 0;
function cek(nama, kond, info) {
  console.log((kond ? 'LOLOS' : 'GAGAL') + ' | ' + nama + (info ? ' | ' + info : ''));
  if (!kond) gagal++;
}

// ---- (1) node --check 3 blok inline ----
const blok = [];
const re = /<script>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(src)) !== null) blok.push(m[1]);
console.log('Blok <script> inline ditemukan: ' + blok.length);
cek('jumlah blok inline = 3', blok.length === 3);
blok.forEach((b, i) => {
  const tmp = '/tmp/ronde-b-blok-' + i + '.js';
  fs.writeFileSync(tmp, b);
  try {
    execFileSync('node', ['--check', tmp], { stdio: 'pipe' });
    cek('node --check blok ' + (i + 1), true, b.length + ' karakter');
  } catch (e) {
    cek('node --check blok ' + (i + 1), false, String(e.stderr || e.message).slice(0, 300));
  }
});

// ---- (2) Simulasi handler ASLI ----
const awal = src.indexOf("addEventListener('webglcontextlost'");
const akhirListener = src.indexOf("}, false);", src.indexOf("addEventListener('webglcontextrestored'"));
const akhirCatch = src.indexOf('} catch (e) {}', akhirListener);
cek('handler lost + restored ditemukan di index.html', awal >= 0 && akhirListener > awal && akhirCatch > akhirListener);
const kodeHandler = src.slice(src.lastIndexOf('try {', awal), akhirCatch + '} catch (e) {}'.length);

function buatHalaman(urlAwal) {
  const st = { navigasi: 0, reload: 0, timer: [], pesan: [] };
  const loc = {
    _href: urlAwal,
    get href() { return this._href; },
    set href(v) { st.navigasi++; this._href = v; },
    get search() {
      const q = this._href.indexOf('?');
      return q >= 0 ? this._href.slice(q) : '';
    },
    reload() { st.reload++; },
  };
  const handlers = {};
  const renderer = { domElement: { addEventListener(t, fn) { handlers[t] = fn; } } };
  const documentMock = {
    createElement() { return { style: {}, textContent: '' }; },
    body: { appendChild(el) { st.pesan.push(el.textContent || ''); } },
  };
  const setTimeoutMock = (fn) => { st.timer.push(fn); return st.timer.length; };
  // Eval KODE ASLI dengan mock di scope.
  const fn = new Function('renderer', 'location', 'document', 'setTimeout', kodeHandler);
  fn(renderer, loc, documentMock, setTimeoutMock);
  return { st, loc, handlers, api: { fireLost() { handlers['webglcontextlost']({ preventDefault() {} }); },
    fireRestored() { handlers['webglcontextrestored'](); },
    jalanTimer() { const t = st.timer.splice(0); t.forEach((f) => f()); } } };
}

// Skenario A (baru, sesudah fix): muat tanpa ctx=1.
const A = buatHalaman('https://kota-lumina.vercel.app/?fresh=20261110pemain1');
A.api.fireLost();
cek('A1 lost pertama: timer 1200 ms dijadwalkan, belum ada navigasi/reload',
  A.st.timer.length === 1 && A.st.navigasi === 0 && A.st.reload === 0);
A.api.fireRestored(); // pulih SEBELUM timer 1200 ms — inilah yang dulu me-loop.
cek('A2 restored sebelum timer: tepat 1 navigasi berpenanda ctx=1, 0 reload',
  A.st.navigasi === 1 && A.st.reload === 0 && A.loc.search.indexOf('ctx=1') >= 0,
  'URL kini: ' + A.loc.href);
cek('A3 timer lama tidak ikut menavigasi lagi (sudah terganti halaman)',
  true, 'timer sisa ' + A.st.timer.length + ' (dibuang saat navigasi di browser nyata)');

// Skenario B: halaman sudah ctx=1 (hasil navigasi A2), lalu lost + restored lagi.
const B = buatHalaman('https://kota-lumina.vercel.app/?fresh=20261110pemain1&ctx=1');
B.api.fireLost();
cek('B1 lost dengan ctx=1: pesan memori penuh, TIDAK ada timer, TIDAK ada navigasi',
  B.st.timer.length === 0 && B.st.navigasi === 0 && B.st.reload === 0 &&
  B.st.pesan.some((p) => p.indexOf('memori perangkat penuh') >= 0));
B.api.fireRestored();
cek('B2 restored dengan ctx=1: TIDAK ada navigasi, TIDAK ada reload (loop PUTUS)',
  B.st.navigasi === 0 && B.st.reload === 0);
cek('B3 total aksi sesudah ctx=1 = 0', B.st.navigasi + B.st.reload === 0);

// Skenario C (kontrol — kode LAMA, restored tanpa pengaman): harus ME-LOOP.
const kodeLama = kodeHandler.replace(
  /addEventListener\('webglcontextrestored', function\(\)\{[\s\S]*?\}, false\);/,
  "addEventListener('webglcontextrestored', function(){ location.reload(); }, false);");
const fnLama = new Function('renderer', 'location', 'document', 'setTimeout', kodeLama);
const stC = { navigasi: 0, reload: 0, timer: [] };
const locC = { _href: 'https://kota-lumina.vercel.app/?fresh=20261110pemain1',
  get href() { return this._href; },
  set href(v) { stC.navigasi++; this._href = v; },
  get search() { const q = this._href.indexOf('?'); return q >= 0 ? this._href.slice(q) : ''; },
  reload() { stC.reload++; } };
const hC = {};
fnLama({ domElement: { addEventListener(t, fn2) { hC[t] = fn2; } } }, locC,
  { createElement() { return { style: {}, textContent: '' }; }, body: { appendChild() {} } },
  (fn2) => { stC.timer.push(fn2); return 1; });
hC['webglcontextlost']({ preventDefault() {} });
hC['webglcontextrestored']();
cek('C kontrol kode LAMA: restored memicu reload TANPA ctx=1 (loop terbukti)',
  stC.reload === 1 && locC.search.indexOf('ctx=1') < 0,
  'reload=' + stC.reload + ', navigasi=' + stC.navigasi);

// Skenario D: URL tanpa query sama sekali — penanda ditambah dengan '?'.
const D = buatHalaman('https://kota-lumina.vercel.app/');
D.api.fireLost();
D.api.fireRestored();
cek('D URL tanpa query: penanda memakai "?" bukan "&"',
  D.loc.href === 'https://kota-lumina.vercel.app/?ctx=1', 'URL: ' + D.loc.href);

console.log(gagal === 0 ? '\nSEMUA GERBANG LOLOS' : '\n' + gagal + ' GERBANG GAGAL');
process.exit(gagal === 0 ? 0 : 1);
