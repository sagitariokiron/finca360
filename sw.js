// Le ponemos "v2" para obligar al celular a notar que hay una actualización
const CACHE_NAME = 'finca360-offline-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  './Logo_Finca360_Final2.png'
];

// 1. Instalación: Forzamos a que el nuevo celador tome el control de inmediato
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 2. Activación: El celador nuevo hace limpieza automática y borra la caché vieja
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control sin tener que cerrar la app
  );
});

// 3. Estrategia "Red primero, Caché como respaldo"
self.addEventListener('fetch', event => {
  // Ignoramos los enlaces directos de Google para que no interfiera con tu tablero
  if (event.request.url.includes('script.google.com')) {
      return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay internet, devuelve la página normal
        return response;
      })
      .catch(() => {
        // Si NO hay internet (falla el fetch), saca tu pantalla bonita de la caché
        return caches.match(event.request).then(response => {
            return response || caches.match('./index.html');
        });
      })
  );
});
