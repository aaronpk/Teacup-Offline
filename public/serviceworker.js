"use strict";

self.importScripts('js/pouchdb-7.0.0.min.js');

const staticCacheName = 'teacup-47';

var DB = new PouchDB('teacup-1', {
  adapter: 'idb'
});

console.log('Cache version: '+staticCacheName);

addEventListener('install', function (event) {
  console.log('The service worker is installing...');
  skipWaiting();
  event.waitUntil(
    cacheAssets()
  ); // end waitUntil
});

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
      return clients.claim();
    }) // end then
  );

});

addEventListener("fetch", fetchEvent => {
  var t = fetchEvent.request, a = new URL(t.url);
  //console.log(t);

  const request = fetchEvent.request;
  fetchEvent.respondWith(
    
    // First look in the cache
    caches.match(request)
    .then(responseFromCache => {
      if(responseFromCache) {
        return responseFromCache;
      }
      
      // Check if it matches the path to save posts
      var url = new URL(t.url);

      if(url.pathname == "/save") {
        console.log("catching /save");
        console.log(request);
        
        request.json().then(data => {

          var post = {
            date: data['date'],
            time: data['time'],
            tzoffset: data['tzoffset'],
            name: data['name'],
            type: data['type'],
          }
          
          addNewPost(post, function(){
            console.log('Complete');

            // Notify the front-end that the post was created
            clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage('new-post');
              })
            });
          });

        })
        .catch(e => {
          sendAlert(e.message);
        })
        return new Response("saved");
      }
      
      // Otherwise fetch from the network
      return fetch(request);
    }) // end match then

  ); // end respondWith
}); // end event listener


function cacheAssets() {
  caches.open(staticCacheName)
  .then( cache => {
    // Nice to have 
    //cache.addAll([
    //]);

    // Must have
    return cache.addAll([
      '/',
      '/settings.html',
      '/style.css',
      '/js/jquery-3.3.1.js',
      '/js/pouchdb-7.0.0.min.js',
      '/js/script.js',
    ]);
  })
}

function addNewPost(post, callback) {
  post['_id'] = ''+(new Date()).getTime();
  DB.put(post).then(response => {
    console.log('saved to database', response);
    callback();
  })
  .catch(err => {
    console.log('error saving to database', err);
  })
}

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
