
const CACHE_NAME = 'shangkailan-v3';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

const urls = [
  './',
  './index.html'
];

    await Promise.all(
      urls.map(async url => {
        try {
          const response = await fetch(url, { cache: 'reload' });
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.log('ยังแคชไฟล์ไม่ได้:', url);
        }
      })
    );

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith('shangkailan-') &&
          key !== CACHE_NAME
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);

    if (cached) return cached;

    try {
      const response = await fetch(event.request);

      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch (error) {
if (event.request.mode === 'navigate') {
  const page = await caches.match(
    new URL('./index.html', self.registration.scope).href
  );

  if (page) return page;

  const home = await caches.match(
    new URL('./', self.registration.scope).href
  );

  if (home) return home;
}

      return new Response(
        'ไฟล์นี้ยังไม่ได้บันทึกไว้สำหรับออฟไลน์',
        {
          status: 503,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        }
      );
    }
  })());
});
