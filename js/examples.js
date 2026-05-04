/* CyberTools — Shared Examples Button Component
 *
 * Usage:
 *   CyberTools.Examples.init({
 *     containerId: 'my-actions-row',   // id of element to append the button into
 *     examples: [
 *       { label: 'Short description', input: 'the value to insert', note: 'optional tooltip' },
 *     ],
 *     onInsert: function(example) {
 *       document.getElementById('my-input').value = example.input;
 *     }
 *   });
 *
 * The button is keyboard accessible:
 *   Tab   — focus button
 *   Enter / Space — toggle dropdown
 *   ↓ / ↑  — navigate items
 *   Enter  — insert focused item
 *   Esc    — close dropdown
 */

(function (CT) {
    'use strict';

    var Examples = {};

    Examples.init = function (opts) {
        opts = opts || {};
        var examples = opts.examples || [];
        var onInsert = opts.onInsert || function () {};
        var container = opts.containerId
            ? document.getElementById(opts.containerId)
            : null;

        if (!container || examples.length === 0) return;

        // ── Build button ──────────────────────────────────────────────────────

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:relative;display:inline-block;';

        var btn = document.createElement('button');
        btn.id = 'ct-examples-btn';
        btn.type = 'button';
        btn.setAttribute('aria-haspopup', 'listbox');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Show examples');
        btn.style.cssText = [
            'display:inline-flex;align-items:center;gap:6px;',
            'background:var(--surface-2);border:1px solid var(--border);border-radius:6px;',
            'padding:7px 12px;font-size:13px;font-weight:500;color:var(--text-muted);',
            'cursor:pointer;transition:all 150ms;font-family:inherit;',
        ].join('');
        btn.innerHTML = [
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">',
            '<polyline points="9 18 15 12 9 6"/>',
            '</svg>',
            '<span>Examples</span>',
            '<svg id="ct-examples-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition:transform 150ms;" aria-hidden="true">',
            '<polyline points="6 9 12 15 18 9"/>',
            '</svg>',
        ].join('');

        btn.addEventListener('mouseover', function () {
            btn.style.borderColor = 'var(--accent)';
            btn.style.color = 'var(--text)';
        });
        btn.addEventListener('mouseout', function () {
            if (!_isOpen()) {
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--text-muted)';
            }
        });

        // ── Build dropdown ────────────────────────────────────────────────────

        var dropdown = document.createElement('ul');
        dropdown.id = 'ct-examples-dropdown';
        dropdown.setAttribute('role', 'listbox');
        dropdown.setAttribute('aria-label', 'Example inputs');
        dropdown.style.cssText = [
            'position:absolute;left:0;top:calc(100% + 6px);z-index:200;',
            'background:var(--surface);border:1px solid var(--border);border-radius:8px;',
            'padding:4px;min-width:260px;max-width:380px;',
            'box-shadow:0 8px 24px rgba(0,0,0,0.35);',
            'display:none;list-style:none;margin:0;',
        ].join('');

        examples.forEach(function (ex, i) {
            var li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', 'false');
            li.setAttribute('tabindex', '-1');
            li.dataset.idx = i;
            li.style.cssText = [
                'padding:8px 10px;border-radius:6px;cursor:pointer;',
                'transition:background 100ms;',
            ].join('');
            li.innerHTML = [
                '<div style="font-size:13px;font-weight:500;color:var(--text);">' + _esc(ex.label) + '</div>',
                ex.note
                    ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + _esc(ex.note) + '</div>'
                    : '',
            ].join('');

            li.addEventListener('mouseover', function () {
                _setActive(i);
            });
            li.addEventListener('mouseout', function () {
                li.style.background = '';
                li.setAttribute('aria-selected', 'false');
            });
            li.addEventListener('click', function () {
                _insert(i);
            });
            dropdown.appendChild(li);
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);
        container.appendChild(wrapper);

        // ── State helpers ─────────────────────────────────────────────────────

        var _activeIdx = -1;

        function _isOpen() {
            return dropdown.style.display !== 'none';
        }

        function _open() {
            dropdown.style.display = 'block';
            btn.setAttribute('aria-expanded', 'true');
            btn.style.borderColor = 'var(--accent)';
            btn.style.color = 'var(--text)';
            var chevron = document.getElementById('ct-examples-chevron');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            _activeIdx = -1;
        }

        function _close() {
            dropdown.style.display = 'none';
            btn.setAttribute('aria-expanded', 'false');
            btn.style.borderColor = 'var(--border)';
            btn.style.color = 'var(--text-muted)';
            var chevron = document.getElementById('ct-examples-chevron');
            if (chevron) chevron.style.transform = '';
            _activeIdx = -1;
            // Clear active styles
            dropdown.querySelectorAll('li').forEach(function (li) {
                li.style.background = '';
                li.setAttribute('aria-selected', 'false');
            });
        }

        function _setActive(idx) {
            dropdown.querySelectorAll('li').forEach(function (li, i) {
                var active = i === idx;
                li.style.background = active ? 'var(--surface-2)' : '';
                li.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            _activeIdx = idx;
        }

        function _insert(idx) {
            var ex = examples[idx];
            if (!ex) return;
            onInsert(ex);
            _close();
            btn.focus();
        }

        // ── Button events ─────────────────────────────────────────────────────

        btn.addEventListener('click', function () {
            _isOpen() ? _close() : _open();
        });

        btn.addEventListener('keydown', function (e) {
            var items = dropdown.querySelectorAll('li');
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                _isOpen() ? _close() : _open();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!_isOpen()) _open();
                _setActive(Math.min(_activeIdx + 1, items.length - 1));
                if (items[_activeIdx]) items[_activeIdx].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                _setActive(Math.max(_activeIdx - 1, 0));
                if (items[_activeIdx]) items[_activeIdx].focus();
            } else if (e.key === 'Escape') {
                _close();
            }
        });

        // ── Dropdown item keyboard ────────────────────────────────────────────

        dropdown.addEventListener('keydown', function (e) {
            var items = dropdown.querySelectorAll('li');
            var idx = parseInt(document.activeElement.dataset.idx, 10);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                var next = Math.min(idx + 1, items.length - 1);
                _setActive(next);
                items[next].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                var prev = Math.max(idx - 1, 0);
                _setActive(prev);
                if (prev === 0 && idx === 0) { btn.focus(); _activeIdx = -1; return; }
                items[prev].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                _insert(idx);
            } else if (e.key === 'Escape' || e.key === 'Tab') {
                _close();
                btn.focus();
            }
        });

        // ── Close on outside click ────────────────────────────────────────────

        document.addEventListener('click', function (e) {
            if (_isOpen() && !wrapper.contains(e.target)) _close();
        });
    };

    function _esc(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    CT.Examples = Examples;

})(window.CyberTools = window.CyberTools || {});
