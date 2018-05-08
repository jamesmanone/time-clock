import './assets/android-chrome-192x192.png';
import './assets/android-chrome-512x512.png';
import './assets/apple-touch-icon.png';
import './assets/browserconfig.xml';
import './assets/favicon-16x16.png';
import './assets/favicon-32x32.png';
import './assets/favicon.ico';
import './assets/mstile-150x150.png';
import './assets/safari-pinned-tab.svg';
import './assets/site.webmanifest';
import './assets/ipad-splash-landscape.png';
import './assets/ipad-splash.png';
import './assets/iphone-splash.png';

const V = 1.03
const CACHE_NAME = 'timeclock-v1.03';
const urls = [
  '/',
  '/js/app.js',
  '/css/style.css',
  '/favicon.ico'
];

self.addEventListener('activate', evt => {
  evt.waitUntil(caches.keys().then(names =>
    Promise.all(names.map(name => {
      if(name !== CACHE_NAME) return caches.delete(name);
    }))
  ));
});

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urls))
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(res => {
        if(res) return res;
        return fetch(evt.request);
      })
  );
});
