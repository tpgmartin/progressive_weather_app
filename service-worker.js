// separate caches for app shell from data
var cacheName = 'weatherPWA-step-5-2';
var dataCacheName = 'weatherData-v1';
// include all permutations of file names, simpler to do so here than modifying fetch method
var filesToCache = [
  '/',  
'/index.html',  
'/scripts/app.js',  
'/styles/inline.css',  
'/images/clear.png',  
'/images/cloudy-scattered-showers.png',  
'/images/cloudy.png',  
'/images/fog.png',  
'/images/ic\_add\_white\_24px.svg',  
'/images/ic\_refresh\_white\_24px.svg',  
'/images/partly-cloudy.png',  
'/images/rain.png',  
'/images/scattered-showers.png',  
'/images/sleet.png',  
'/images/snow.png',  
'/images/thunderstorm.png',  
'/images/wind.png' 
];

self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      // fetch resources from the server and add response to cache - this is atomic
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        // delete unused content
        console.log('[ServiceWorker] Removing old cache', key);
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// intercept and handle subequent network requests
self.addEventListener('fetch', function (e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = 'https://publicdata-weather.firebaseio.com/';
  if (e.request.url.indexOf(dataUrl) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(function (response) {
          return caches.open(dataCacheName).then(function (cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched&Cached Data');
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function (response) {
        // either return resource if in cache, or make network request
        return response || fetch(e.request);
      })
    );  
  }
});