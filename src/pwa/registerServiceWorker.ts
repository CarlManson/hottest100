// Registers /sw.js (built from pwa/service-worker.js) so the installed app opens on bad signal.
// Production builds only: in dev a service worker would serve stale files while editing.
export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed', error);
    });
  });
}
