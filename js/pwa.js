/* CyberTools — PWA: service worker registration + install prompt */

(function () {
    'use strict';

    // Register service worker
    function resolveRoot() {
        if (window.CyberTools && window.CyberTools._shellRoot) return window.CyberTools._shellRoot;
        return window.location.pathname.indexOf('/tools/') !== -1 ? '../../' : './';
    }

    if ('serviceWorker' in navigator) {
        const swPath = resolveRoot() + 'service-worker.js';
        navigator.serviceWorker.register(swPath).catch(function () {});
    }

    // Install prompt: track visits and show banner after 3rd visit
    const VISIT_KEY = 'ct-visit-count';
    let visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1;
    try { localStorage.setItem(VISIT_KEY, String(visits)); } catch (_) {}

    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        if (visits >= 3 && !localStorage.getItem('ct-install-dismissed')) {
            showInstallBanner();
        }
    });

    function showInstallBanner() {
        if (document.getElementById('ct-install-banner')) return;
        const banner = document.createElement('div');
        banner.id = 'ct-install-banner';
        banner.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:80;max-width:300px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 16px;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
        banner.innerHTML = `
<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;">Install CyberTools</div>
<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Use it offline, like a native app.</div>
<div style="display:flex;gap:8px;">
  <button id="ct-install-yes" style="flex:1;padding:6px;background:var(--accent);color:var(--bg);border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">Install</button>
  <button id="ct-install-no" style="padding:6px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;font-size:12px;color:var(--text-muted);cursor:pointer;font-family:inherit;">Not now</button>
</div>`;
        document.body.appendChild(banner);

        document.getElementById('ct-install-yes').addEventListener('click', function () {
            banner.remove();
            if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; }
        });
        document.getElementById('ct-install-no').addEventListener('click', function () {
            banner.remove();
            try { localStorage.setItem('ct-install-dismissed', '1'); } catch (_) {}
        });
    }

    // Update offline indicator based on connectivity
    function updateOfflineIndicator() {
        const el = document.getElementById('ct-offline-indicator');
        if (!el) return;
        const dot = el.querySelector('span');
        if (navigator.onLine) {
            if (dot) dot.style.background = 'var(--success)';
        } else {
            if (dot) dot.style.background = 'var(--warning)';
            el.textContent = '';
            if (dot) el.appendChild(dot);
            el.appendChild(document.createTextNode('Offline'));
        }
    }

    window.addEventListener('online', updateOfflineIndicator);
    window.addEventListener('offline', updateOfflineIndicator);
    document.addEventListener('DOMContentLoaded', updateOfflineIndicator);
    document.addEventListener('ct:shell-ready', updateOfflineIndicator);

})();
