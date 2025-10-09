const CACHE_NAME = 'loyd-foundation-v1';
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
  '/style.css',
  '/main.js',
  '/manifest.json',
  'https://unpkg.com/aos@next/dist/aos.css',
  'https://unpkg.com/aos@next/dist/aos.js',
  // Images and Videos
  '/images/home-hero.png',
  '/images/home-hero.mp4',
  '/images/home-impact.jpg',
  '/images/home-farmers.png',
  '/images/home-smes.jpg',
  '/images/home-feeding.png',
  '/images/home-education.jpg',
  '/images/logo-partner1.png',
  '/images/placeholder.png',  // For coming soon partners
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
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Offline and no cache available.', { status: 503 });
      });
    })
  );
});
