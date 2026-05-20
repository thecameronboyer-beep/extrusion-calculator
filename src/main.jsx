import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const baseUrl = new URL(import.meta.env.BASE_URL, window.location.href);
      const registration = await navigator.serviceWorker.register(
        new URL('sw.js', baseUrl),
        { scope: baseUrl.pathname }
      );
      const resourceUrls = performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => new URL(url).origin === window.location.origin);

      const sendCacheMessage = () => {
        const worker =
          registration.active || registration.waiting || registration.installing;

        worker?.postMessage({
          type: 'CACHE_URLS',
          urls: [baseUrl.href, ...resourceUrls],
        });
      };

      if (registration.installing) {
        registration.installing.addEventListener('statechange', sendCacheMessage);
      }

      sendCacheMessage();
    } catch {
      // The calculator still works online if install support is unavailable.
    }
  });
}
