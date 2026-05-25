/* ── 하와이여행 Service Worker ── */
const CACHE = 'hw26-v2';

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

/* 요청 처리: 캐시 우선, 백그라운드에서 최신화 */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached); /* 오프라인이면 캐시 반환 */
        return cached || fresh;
      })
    )
  );
});
