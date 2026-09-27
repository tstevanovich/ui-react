export function injectLiveReloadScript(hostname = window.location.hostname): void {
  if (hostname !== 'localhost') {
    return;
  }

  if (document.querySelector('script[data-live-reload="true"]')) {
    return;
  }

  const script = document.createElement('script');
  // The local LiveReload server runs over HTTP on 35729.
  script.src = `http://${hostname}:35729/livereload.js?snipver=1`;
  script.async = true;
  script.dataset.liveReload = 'true';
  document.head.appendChild(script);
}
