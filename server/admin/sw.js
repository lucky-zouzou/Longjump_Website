const CACHE = 'loongjump-manage-offline-v1';
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/manage/offline.html','/manage/style.css'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('loongjump-manage-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  // No customer records, authenticated HTML, APIs, or session responses cached.
  if (event.request.mode === 'navigate' && new URL(event.request.url).pathname.startsWith('/manage')) event.respondWith(fetch(event.request).catch(() => caches.match('/manage/offline.html')));
  else if (new URL(event.request.url).pathname === '/manage/style.css') event.respondWith(fetch(event.request).catch(() => caches.match('/manage/style.css')));
});
