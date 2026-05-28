/* ── 하와이여행 Service Worker ── */
const CACHE = 'hw26-v4';

/* 설치 즉시 활성화 */
self.addEventListener('install', e => {
  self.skipWaiting();
});

/* 이전 캐시 정리 */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* 요청 처리: Open-Meteo는 항상 네트워크, 나머지는 캐시 우선 */
self.addEventListener('fetch', e => {
  if (e.request.url.includes('open-meteo.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
