const VERSION = 'qd-shell-v13';
const ASSET_CACHE = 'qd-assets-v13';
const SHELL = ['/', '/demo', '/index.html', '/offline.html', '/legal.css', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'];

// Cache Storage keeps a decoded response body. Preserve every useful response
// header, but not the transport encoding that would make an offline browser
// try to decode that body a second time.
async function cacheDecodedResponse(cache, request, response) {
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  headers.delete('vary');
  await cache.put(request, new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  }));
}

async function cacheUrls(cache, urls) {
  for (const url of urls) {
    const response = await fetch(url, { cache: 'reload' });
    if (!response.ok) throw new Error(`Could not precache ${url}.`);
    await cacheDecodedResponse(cache, url, response);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cacheUrls(cache, SHELL);
    const response = await fetch('/index.html', { cache: 'reload' });
    const html = await response.clone().text();
    await cacheDecodedResponse(cache, '/index.html', response);
    const builtAssets = Array.from(html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g), (match) => match[1]);
    await cacheUrls(cache, builtAssets);
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
      caches.open(VERSION).then((cache) => cacheDecodedResponse(cache, event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(ASSET_CACHE).then((cache) => cacheDecodedResponse(cache, event.request, response.clone()));
    return response;
  })));
});
