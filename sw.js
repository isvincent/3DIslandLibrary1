/* 楊梅高中圖書館島 Service Worker
   更新網站內容後，請把 CACHE_VERSION 加 1（例如 v2 → v3），
   使用者下次開啟時會看到「有新版本可以更新」。 */
const CACHE_VERSION = 'v1';
const APP_CACHE = `library-isles-app-${CACHE_VERSION}`;
const RUNTIME_CACHE = `library-isles-runtime-${CACHE_VERSION}`;

const THREE_BASE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.svg',
];
const LIBS = [
  THREE_BASE + 'build/three.module.js',
  THREE_BASE + 'examples/jsm/controls/OrbitControls.js',
  THREE_BASE + 'examples/jsm/renderers/CSS2DRenderer.js',
  THREE_BASE + 'examples/jsm/geometries/RoundedBoxGeometry.js',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await cache.addAll(APP_SHELL);
    // 函式庫個別快取，單一檔案失敗不影響安裝
    await Promise.all(LIBS.map(async url => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (res.ok) await cache.put(url, res);
      } catch (e) { /* 離線安裝時略過，第一次線上使用時會補進快取 */ }
    }));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = [APP_CACHE, RUNTIME_CACHE];
    for (const key of await caches.keys()) if (!keep.includes(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 頁面：網路優先（拿到最新版），離線時用快取
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(APP_CACHE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Three.js（版本固定）與網站本身的檔案：快取優先
  if (url.href.startsWith(THREE_BASE) || url.origin === self.location.origin) {
    event.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(url.origin === self.location.origin ? APP_CACHE : RUNTIME_CACHE)).put(req, res.clone());
      return res;
    })());
    return;
  }

  // Google Fonts：先用快取、背景更新
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })());
  }
});
