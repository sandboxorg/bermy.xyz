// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  "/",
  "/ferry-schedules/",
  "/bus-schedules/",
  "/bus-schedules/1-grotto-bay/",
  "/bus-schedules/3-grotto-bay/",
  "/bus-schedules/1-st-georges/",
  "/bus-schedules/3-st-georges/",
  "/bus-schedules/6-st-georges/",
  "/bus-schedules/10-st-georges/",
  "/bus-schedules/11-st-georges/",
  "/bus-schedules/4-spanish-point/",
  "/bus-schedules/5-pond-hill/",
  "/bus-schedules/9-prospect/",
  "/bus-schedules/2-ord-road/",
  "/bus-schedules/7-barnes-corner/",
  "/bus-schedules/7-dockyard/",
  "/bus-schedules/8-dockyard/",
  "/bus-schedules/8-somerset/",
  "/bus-schedules/8-cedar-hill/",
  "/css/tachyons.min.css",
  "/img/bermy-logo@1x.png",
  "/img/bermy-logo@2x.png",
  "/img/bermy-logo@3x.png"
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});