const CACHE_NAME = 'loyd-foundation-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/programs.html',
  '/about.html',
  '/impact.html',
  '/donate.html',
  '/contact.html',
  '/offline.html',
  '/404.html',
  '/donate-success.html',
  '/privacy.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  'https://unpkg.com/aos@next/dist/aos.css',
  'https://unpkg.com/aos@next/dist/aos.js',
  // Images and Videos (add WebP if added)
  '/images/home-hero.png',
  '/images/home-hero.mp4',
  '/images/home-impact.jpg',
  '/images/home-farmers.png',
  '/images/home-smes.jpg',
  '/images/home-feeding.png',
  '/images/home-education.jpg',
  '/images/logo-partner1.png',
  '/images/placeholder.png',
  '/images/loydfounder.jpg',
  '/images/about-team.jpg',
  '/images/about-project1.jpg',
  '/images/about-project2.jpg',
  '/images/about-project3.jpg',
  '/images/program-smes-banner.jpg',
  '/images/program-smes-support.jpg',
  '/images/program-farmers-banner.png',
  '/images/program-farmers-support.png',
  '/images/program-feeding-banner.png',
  '/images/program-feeding-support.png',
  '/images/program-education-banner.jpg',
  '/images/program-education-support.jpg',
  '/images/donation-bg.jpg',
  '/images/donation-success.jpg',
  '/images/video-drone.mp4',
  '/images/loydfarmers.mp4',
  '/images/loydfeeding.mp4',
  '/images/loydstudent.mp4',
  '/images/video-sme.mp4',
  '/images/loydfavicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
  // Notify clients of update
  event.waitUntil(self.clients.matchAll().then(clients => clients.forEach(client => client.postMessage({type: 'SW_UPDATED'}))));
});

self.addEventListener('fetch', (event) => {
  // Performance mark
  self.performance.mark('sw-fetch-start');
  event.respondWith(
    (async () => {
      // Runtime caching for Formspree
      if (event.request.url.includes('formspree.io')) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(event.request);
        if (cached) return cached; // Stale-while-revalidate for GET
        try {
          const network = await fetch(event.request);
          cache.put(event.request, network.clone());
          return network;
        } catch (err) {
          return new Response('Form service unavailable offline.', { status: 503 });
        }
      }

      // Standard cache-first with fallback
      const cached = await caches.match(event.request);
      if (cached) {
        self.performance.mark('sw-fetch-end');
        self.performance.measure('sw-fetch-time', 'sw-fetch-start', 'sw-fetch-end');
        return cached;
      }

      // Handle range requests for videos
      if (event.request.headers.has('range')) {
        const cache = await caches.open(CACHE_NAME);
        const cachedRange = await cache.match(event.request);
        if (cachedRange) return cachedRange;
        try {
          return await fetch(event.request);
        } catch (err) {
          return new Response('Video unavailable offline.', { status: 503 });
        }
      }

      // Fallback for navigation
      try {
        const network = await fetch(event.request);
        return network;
      } catch (err) {
        if (event.request.mode === 'navigate') {
          return await caches.match('/offline.html');
        }
        return new Response('Offline and no cache available.', { status: 503 });
      }
    })()
  );
});

// Background sync for queued forms
self.addEventListener('sync', (event) => {
  if (event.tag === 'form-sync') {
    event.waitUntil(syncQueuedForms());
  }
});

async function syncQueuedForms() {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.postMessage({ type: 'sync-forms' }));
  } catch (err) {
    console.error('Sync failed:', err);
    // Retry logic: Re-register sync after 5min
    setTimeout(() => self.registration.sync.register('form-sync'), 300000);
  }
}
