const CACHE_NAME = 'ingilizce-oyküm-v1';

// Cache'e alınacak dosyalar
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Eski cache temizleme
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Ağ isteği yönetimi: önce ağ, olmadığında cache
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Sadece http ve https protokolündeki istekleri işle, chrome-extension vb. istekleri pas geç
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  // API isteklerini cache'leme — her zaman ağdan getir
  if (url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Diğer istekler: ağ önce, cache yedek
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı yanıtı cache'e koy
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(err => {
              console.warn('Cache.put failed:', err);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Ağ yoksa cache'den getir
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Ana sayfa fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Çevrimdışı - İnternet bağlantısı gerekli', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});
