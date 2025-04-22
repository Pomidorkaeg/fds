const CACHE_NAME = 'fc-gudauta-v1';
const urlsToCache = [
  '/bds/',
  '/bds/index.html',
  '/bds/assets/index.css',
  '/bds/assets/index.js',
  '/bds/lovable-uploads/e711e51e-481c-438c-987e-2aa5f999290a.png',
  '/bds/lovable-uploads/10641be5-36c7-4f6d-a5b4-ee39048e40ac.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});