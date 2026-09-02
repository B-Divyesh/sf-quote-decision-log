const VERSION = 'qd-shell-v7';
const ASSET_CACHE = 'qd-assets-v7';
const SHELL = ['/', '/demo', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL);
    const response = await fetch('/index.html', { cache: 'reload' });
    const html = await response.clone().text();
    await cache.put('/index.html', response);
    const builtAssets = Array.from(html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g), (match) => match[1]);
    await cache.addAll(builtAssets);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![VERSION, ASSET_CACHE].includes(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
