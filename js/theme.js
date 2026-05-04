/* CyberTools — early theme bootstrap.
 * This file is intentionally loaded in <head> so CSP can block inline scripts.
 */
(function () {
    'use strict';

    try {
        var theme = localStorage.getItem('ct-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    } catch (_) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();
