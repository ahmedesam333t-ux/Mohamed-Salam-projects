/* Sanad Accounts — Service Worker (V220)
   الصفحة: network-first مع الرجوع للكاش (تعمل بلا إنترنت) · الملفات الثابتة: cache-first مع تحديث بالخلفية.
   لا يتدخل في أي طلب خارج نفس الأصل (مثل api.anthropic.com) ولا في غير GET. */
'use strict';
const CACHE = 'sanad-v220';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sanad-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); } return res; })
      .catch(() => caches.match('index.html').then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
