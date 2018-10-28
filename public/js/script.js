window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus(event) {
  if(navigator.onLine) {
    $("body").addClass("online").removeClass("offline");
    if(window.syncAllPosts) {
      console.log('syncing posts');
      refreshSavedPosts();
      syncAllPosts();    
    }
  } else {
    $("body").addClass("offline").removeClass("online");
    if(window.refreshSavedPosts) {
      console.log('loading posts');
      refreshSavedPosts();
    }
  }
}
