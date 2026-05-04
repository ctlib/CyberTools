/* CyberTools all-tools catalog rendering. */
(function (CT) {
    'use strict';

    var activeCategory = 'all';

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
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

    function categoryLabel(id) {
        var cat = CT.CATEGORIES && CT.CATEGORIES.find(function (c) { return c.id === id; });
        return cat ? cat.label : id;
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
            tool.tags.some(function (tag) { return tag.includes(query); });
    }

    function renderTabs() {
        var tabs = document.getElementById('tools-category-tabs');
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
                renderToolsGrid(document.getElementById('tools-search') ? document.getElementById('tools-search').value : '');
            });
        });
    }

    function renderCard(tool) {
        var legacy = tool.id === 'rc4' ? '<span class="ct-tool-badge">LEGACY</span>' : '';
        var authorized = tool.category === 'pentest' ? '<span class="ct-tool-badge ct-tool-badge-danger">AUTHORIZED USE</span>' : '';
        return '<a class="ct-tool-card ct-tool-card-compact" href="' + esc(tool.path) + 'index.html" data-name="' + esc(tool.name) + '" data-tags="' + esc(tool.tags.join(' ')) + '" style="--card-tone:' + categoryTone(tool.category) + ';">' +
            '<div class="ct-tool-card-top">' +
                '<div class="ct-tool-card-category">' + esc(shortCategory(categoryLabel(tool.category))) + '</div>' +
                legacy + authorized +
            '</div>' +
            '<div class="ct-tool-card-title">' + esc(tool.name) + '</div>' +
            '<div class="ct-tool-card-desc">' + esc(tool.desc) + '</div>' +
        '</a>';
    }

    function syncQueryParam(query) {
        var url = new URL(window.location.href);
        if (query) url.searchParams.set('q', query);
        else url.searchParams.delete('q');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    function renderToolsGrid(query) {
        var grid = document.getElementById('tools-grid');
        if (!grid || !CT.TOOLS || !CT.CATEGORIES) return;

        var q = String(query || '').toLowerCase().trim();
        var html = '';

        document.querySelectorAll('#tools-category-tabs [data-category]').forEach(function (button) {
            button.setAttribute('aria-pressed', button.getAttribute('data-category') === activeCategory ? 'true' : 'false');
        });

        CT.CATEGORIES.forEach(function (cat) {
            if (activeCategory !== 'all' && activeCategory !== cat.id) return;

            var catTools = CT.TOOLS.filter(function (tool) {
                return tool.category === cat.id && matchesQuery(tool, q);
            });
            if (catTools.length === 0) return;

            html += '<section style="margin-bottom:28px;">';
            html += '<div class="ct-section-head" style="margin-top:0;">';
            html += '<div><h2 class="ct-section-title">' + esc(cat.label) + '</h2>';
            html += '<p class="ct-section-subtitle">' + catTools.length + (catTools.length === 1 ? ' tool' : ' tools') + '</p></div>';
            html += '</div>';
            html += '<div class="ct-tool-grid">';
            html += catTools.map(renderCard).join('');
            html += '</div></section>';
        });

        grid.innerHTML = html || '<div class="ct-empty-state">No tools match this search.</div>';
    }

    window.CyberToolsRenderToolsIndex = renderToolsGrid;

    document.addEventListener('DOMContentLoaded', function () {
        renderTabs();
        var search = document.getElementById('tools-search');
        if (search) {
            var initialQuery = new URLSearchParams(window.location.search).get('q') || '';
            search.value = initialQuery;
            search.addEventListener('input', function () {
                syncQueryParam(this.value.trim());
                renderToolsGrid(this.value);
            });
        }
        renderToolsGrid(search ? search.value : '');
    });
})(window.CyberTools = window.CyberTools || {});
