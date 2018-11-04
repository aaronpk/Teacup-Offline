"use strict";

self.importScripts('js/pouchdb-7.0.0.min.js');

// Update this when you need to force the cache to reload
const version = 70;
const staticCacheName = 'teacup-'+version;

// Set up the local database in IndexDB
var DB = new PouchDB('teacup-1', {
  adapter: 'idb'
});

console.log('Cache version: '+staticCacheName);

// Cache all the required assets when the ServiceWorker installs
addEventListener('install', function (event) {
  console.log('The service worker is installing...');
  skipWaiting();
  event.waitUntil(
    cacheAssets()
  ); // end waitUntil
});

// When the ServiceWorker is activated, update the cache if the cache name changed
addEventListener('activate', activateEvent => {
  console.log('The service worker is activated.');

  activateEvent.waitUntil(
    caches.keys()
    .then( cacheNames => {
      return Promise.all(
        cacheNames.map( cacheName => {
          if (cacheName != staticCacheName) {
            return caches.delete(cacheName);
          } // end if
        }) // end map
      ); // end return Promise.all
    }) // end keys then
    .then( () => {
      var claim = clients.claim();
      sendAlert('version-'+version);
      return claim;
    }) // end then
  );

});

addEventListener('message', messageEvent => {
  console.log('Got message', messageEvent);

  if(messageEvent.data == 'version') {
    sendAlert('version-'+version);
    return;
  }

  if(messageEvent.data.action == 'create') {
    addNewPost(messageEvent.data.post, function(){
      console.log('Saved new post');
      sendAlert('new-post');
    });
    return;
  }

});

// Intercept HTTP requests
addEventListener("fetch", fetchEvent => {
  var t = fetchEvent.request, a = new URL(t.url);

  const request = fetchEvent.request;
  fetchEvent.respondWith(

    // First look in the cache
    caches.match(request)
    .then(responseFromCache => {
      if(responseFromCache) {
        return responseFromCache;
      }

      // Otherwise fetch from the network
      return fetch(request);

    }) // end match then

  ); // end respondWith
}); // end event listener


function cacheAssets() {
  caches.open(staticCacheName)
  .then( cache => {
    // Nice to have, won't error if these fail
    cache.addAll([
      'images/teacup-16px.png',
      'images/teacup-icon-57.png',
      'images/teacup-icon-72.png',
      'images/teacup-icon-114.png',
      'images/teacup-icon-144.png',
    ]);

    // Must have, will error if they fail to download
    return cache.addAll([
      '/',
      '/settings.html',
      '/style.css',
      '/js/jquery-3.3.1.js',
      '/js/pouchdb-7.0.0.min.js',
      '/js/script.js',
      '/images/teacup-144.png',
      '/bootstrap-4.1.3/css/bootstrap.min.css',
      '/bootstrap-4.1.3/js/bootstrap.min.js',
    ]);
  })
}

// Write a post to the local database
function addNewPost(post, callback) {
  // Generate a unique ID for PouchDB
  post['_id'] = ''+(new Date()).getTime();
  DB.put(post).then(response => {
    console.log('saved to database', response);
    callback();
  })
  .catch(err => {
    console.log('error saving to database', err);
  })
}

// Load posts from the database
function loadAllPosts(callback) {
  console.log(DB);

  DB.allDocs({
    include_docs: true
  }).then(items => {
    console.log('Loaded posts', items);
    callback(items)
  }).catch(e => {
    console.log('Error loading posts', e);
  });
}

function sendAlert(alert) {
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(alert);
    })
  })
}
