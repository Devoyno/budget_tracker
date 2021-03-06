const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/db.js',
  '/index.js',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

var CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(FILES_TO_CACHE)
      })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cachedResponse) => {
       return fetch(event.request).then(response => {
         if (response.status === 200) {
           cachedResponse.put(event.request.url, response.clone())
         } 
         return response; 
       }).catch(error => {
         return cachedResponse.match(event.request)
       });
      }).catch(error => {
        console.log(error);
      })
    );
    return;
  }
  event.respondWith(fetch(event.request).catch(function() {
    return caches.match(event.request).then(response => {
      if (response) {
        return response
      } else if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('/')
      }
    })
  }))
});