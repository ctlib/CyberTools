/* CyberTools Service Worker — v2.0.0
 * Strategy:
 *   - Navigation (HTML): stale-while-revalidate
 *   - Assets (CSS, JS, fonts, icons): cache-first, 1-year TTL
 */

const CACHE_VERSION = 'cybertools-v9';
const ASSET_CACHE = 'cybertools-assets-v9';

// Shell files to pre-cache on install
const SHELL_FILES = [
    './',
    './index.html',
    './css/tailwind.css',
    './css/design-system.css',
    './css/global.css',
    './css/tool.css',
    './js/app.js',
    './js/components.js',
    './js/theme.js',
    './js/page-init.js',
    './js/homepage.js',
    './js/tools-index.js',
    './js/shortcuts.js',
    './js/smart-detect.js',
    './js/history.js',
    './js/share.js',
    './js/pwa.js',
    './assets/fonts/inter.woff2',
    './assets/fonts/inter-700.woff2',
    './assets/fonts/jetbrains-mono.woff2',
    './tools/base64/index.html',
    './tools/hex-viewer/index.html',
    './tools/jwt-decoder/index.html',
    './tools/rc4/index.html',
    './tools/rot/index.html',
    './tools/steganography/index.html',
    './tools/hash/index.html',
    './tools/hash-identifier/index.html',
    './tools/aes/index.html',
    './tools/password-generator/index.html',
    './tools/url-encoder/index.html',
    './tools/json-formatter/index.html',
    './tools/timestamp/index.html',
    './tools/uuid/index.html',
    './tools/rsa/index.html',
    './tools/xor/index.html',
    './tools/totp/index.html',
    './tools/html-entities/index.html',
    './tools/cookie-decoder/index.html',
    './tools/http-headers/index.html',
    './tools/csp-analyzer/index.html',
    './tools/sri-generator/index.html',
    './tools/regex/index.html',
    './tools/cidr/index.html',
    './tools/ports/index.html',
    './tools/user-agent/index.html',
    './tools/file-entropy/index.html',
    './tools/email-header/index.html',
    './tools/magic-bytes/index.html',
    './tools/strings-extractor/index.html',
    './tools/vigenere/index.html',
    './tools/classical-ciphers/index.html',
    './tools/frequency-analyzer/index.html',
    './tools/cipher-identifier/index.html',
    './tools/reverse-shell/index.html',
    './tools/xss-payloads/index.html',
    './tools/sqli-payloads/index.html',
    './tools/jwt-attacks/index.html',
    './tools/google-dorks/index.html',
    './privacy.html',
    './about.html',
    './tools-index.html',
    './404.html',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_FILES).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_VERSION && k !== ASSET_CACHE).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== self.location.origin) return;

    const path = url.pathname;

    // Assets: fonts, images, icons — cache-first
    if (path.includes('/assets/fonts/') || path.includes('/assets/icons/') || path.includes('/assets/logowb')) {
        event.respondWith(cacheFirst(request, ASSET_CACHE));
        return;
    }

    // CSS and JS files — stale-while-revalidate
    if (path.endsWith('.css') || path.endsWith('.js')) {
        event.respondWith(staleWhileRevalidate(request, CACHE_VERSION));
        return;
    }

    // HTML navigation — stale-while-revalidate
    if (request.mode === 'navigate' || path.endsWith('.html') || path.endsWith('/')) {
        event.respondWith(staleWhileRevalidate(request, CACHE_VERSION));
        return;
    }
});

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (_) {
        return new Response('Offline', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkFetch = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => null);
    return cached || (await networkFetch) || new Response('Offline', { status: 503 });
}
