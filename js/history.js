/* CyberTools — Tool History & Favorites (localStorage) */

(function (CT) {
    'use strict';

    const HISTORY_KEY = 'ct-history';
    const FAVORITES_KEY = 'ct-favorites';
    const MAX_HISTORY = 10;

    CT.recordVisit = function (toolId) {
        let history = CT.getRecent();
        history = history.filter((id) => id !== toolId);
        history.unshift(toolId);
        if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (_) {}
    };

    CT.getRecent = function () {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (_) { return []; }
    };

    CT.getFavorites = function () {
        try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch (_) { return []; }
    };

    CT.toggleFavorite = function (toolId) {
        let favs = CT.getFavorites();
        if (favs.includes(toolId)) {
            favs = favs.filter((id) => id !== toolId);
        } else {
            favs.unshift(toolId);
        }
        try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs)); } catch (_) {}
        return favs.includes(toolId);
    };

    CT.isFavorite = function (toolId) {
        return CT.getFavorites().includes(toolId);
    };

    CT.clearHistory = function () {
        try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
    };

})(window.CyberTools = window.CyberTools || {});
