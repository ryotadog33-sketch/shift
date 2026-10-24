// アプリの画面部品を端末に保存して、電波が弱くても起動できるようにする。
// データ（Apps Script への通信）は保存しない。中身を直したら CACHE の番号を上げる。
const CACHE = 'shift-v1';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 保存してある画面をすぐ出し、裏で最新版を取りに行く（次に開いたとき反映）
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r.ok) c.put(u.search ? new Request(u.origin + u.pathname) : e.request, r.clone());
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
