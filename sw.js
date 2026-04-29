const CACHE = 'jeju-trend-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// 설치 시 기본 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting(); // 즉시 활성화
});

// 이전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 즉시 모든 탭 제어
});

// 네트워크 우선 → 실패 시 캐시 (항상 최신 버전 우선)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 네트워크 성공 시 캐시 갱신
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request)) // 오프라인 시 캐시 사용
  );
});

// 새 버전 감지 시 클라이언트에 알림
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
