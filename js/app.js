/* CyberTools — Main Bootstrap
 * Loaded on every page. Depends on components.js being loaded first.
 */

(function (CT) {
    'use strict';

    // Apply theme immediately (before DOMContentLoaded) to prevent flash
    (function () {
        const theme = localStorage.getItem('ct-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    })();

    // ── Tool JS API (window.CyberTools.<tool>(input, options)) ───────────────
    // Populated by individual tool scripts when their pages load.
    CT.api = CT.api || {};

    // ── Shortcuts ────────────────────────────────────────────────────────────
    // Loaded from shortcuts.js

    // ── Smart detect ─────────────────────────────────────────────────────────
    // Loaded from smart-detect.js

})(window.CyberTools = window.CyberTools || {});
