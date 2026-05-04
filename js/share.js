/* CyberTools — URL-hash state sharing
 * Encodes tool input/options into the URL fragment so links are shareable
 * without touching any server.
 */

(function (CT) {
    'use strict';

    CT.encodeState = function (obj) {
        try {
            const json = JSON.stringify(obj);
            const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
            return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        } catch (_) {
            return '';
        }
    };

    CT.decodeState = function () {
        const hash = window.location.hash.slice(1);
        if (!hash || !hash.startsWith('state=')) return null;
        const b64 = hash.slice(6).replace(/-/g, '+').replace(/_/g, '/');
        try {
            const json = decodeURIComponent(
                atob(b64)
                    .split('')
                    .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                    .join('')
            );
            return JSON.parse(json);
        } catch (_) {
            return null;
        }
    };

    CT.pushState = function (obj) {
        const encoded = CT.encodeState(obj);
        if (encoded) {
            history.replaceState(null, '', '#state=' + encoded);
        }
    };

    CT.clearState = function () {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    };

})(window.CyberTools = window.CyberTools || {});
