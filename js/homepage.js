/* CyberTools homepage catalog. */
(function (CT) {
    'use strict';

    var activeCategory = 'all';

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    function categoryLabel(id) {
        var cat = CT.CATEGORIES && CT.CATEGORIES.find(function (c) { return c.id === id; });
        return cat ? cat.label : id;
    }

    function shortCategory(label) {
        return String(label)
            .replace('ENCODING & DECODING', 'ENCODING')
            .replace('JWT & TOKENS', 'TOKENS')
            .replace('WEB SECURITY', 'WEB SEC')
            .replace('NETWORK & DNS', 'NETWORK')
            .replace('CLASSICAL CIPHERS', 'CLASSICAL')
            .replace('WEB APP PENTEST', 'PENTEST');
    }

    function categoryTone(category) {
        var tones = {
            encoding: '#58a6ff',
            hashing: '#79c0ff',
            jwt: '#a5d6ff',
            crypto: '#3fb950',
            'web-security': '#f85149',
            network: '#d29922',
            utilities: '#3fb950',
            forensics: '#bc8cff',
            classical: '#ff7b72',
            pentest: '#ff7b72',
            osint: '#58a6ff'
        };
        return tones[category] || '#58a6ff';
    }

    function matchesQuery(tool, query) {
        if (!query) return true;
        return tool.name.toLowerCase().includes(query) ||
            tool.desc.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query) ||
            tool.tags.some(function (tag) { return tag.includes(query); });
    }

    function toolCard(tool) {
        var legacy = tool.id === 'rc4' ? '<span class="ct-tool-badge">LEGACY</span>' : '';
        var authorized = tool.category === 'pentest' ? '<span class="ct-tool-badge ct-tool-badge-danger">AUTHORIZED USE</span>' : '';
        return '' +
            '<a class="ct-tool-card" href="' + esc(tool.path) + 'index.html" style="--card-tone:' + categoryTone(tool.category) + ';">' +
                '<div class="ct-tool-card-top">' +
                    '<div class="ct-tool-card-category">' + esc(shortCategory(categoryLabel(tool.category))) + '</div>' +
                    legacy + authorized +
                '</div>' +
                '<div class="ct-tool-card-title">' + esc(tool.name) + '</div>' +
                '<div class="ct-tool-card-desc">' + esc(tool.desc) + '</div>' +
            '</a>';
    }

    function renderTabs() {
        var tabs = document.getElementById('home-category-tabs');
        if (!tabs || !CT.CATEGORIES) return;

        var buttons = [{ id: 'all', label: 'All' }].concat(CT.CATEGORIES.map(function (cat) {
            return { id: cat.id, label: shortCategory(cat.label) };
        }));

        tabs.innerHTML = buttons.map(function (cat) {
            return '<button class="ct-filter-tab" type="button" data-category="' + esc(cat.id) + '" aria-pressed="' + (cat.id === activeCategory ? 'true' : 'false') + '">' + esc(cat.label) + '</button>';
        }).join('');

        tabs.querySelectorAll('[data-category]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = this.getAttribute('data-category') || 'all';
                renderHomepage();
            });
        });
    }

    function renderHomepage() {
        var grid = document.getElementById('home-tools-grid');
        if (!grid || !CT.TOOLS) return;

        var search = document.getElementById('home-search');
        var query = search ? search.value.toLowerCase().trim() : '';
        var filtered = CT.TOOLS.filter(function (tool) {
            var categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
            return categoryMatch && matchesQuery(tool, query);
        });

        var total = document.getElementById('home-tools-count');
        if (total) total.textContent = String(CT.TOOLS.length);

        var match = document.getElementById('home-match-count');
        if (match) match.textContent = filtered.length + (filtered.length === 1 ? ' tool' : ' tools');

        document.querySelectorAll('#home-category-tabs [data-category]').forEach(function (button) {
            button.setAttribute('aria-pressed', button.getAttribute('data-category') === activeCategory ? 'true' : 'false');
        });

        grid.innerHTML = filtered.length
            ? filtered.map(toolCard).join('')
            : '<div class="ct-empty-state">No tools match this search.</div>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderTabs();
        var search = document.getElementById('home-search');
        if (search) search.addEventListener('input', renderHomepage);
        renderHomepage();
    });
})(window.CyberTools = window.CyberTools || {});
