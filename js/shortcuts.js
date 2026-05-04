/* CyberTools — Global Keyboard Shortcuts */

(function (CT) {
    'use strict';

    // g+h and g+t sequence tracking
    let gPressed = false;
    let gTimer = null;

    function clearG() {
        gPressed = false;
        if (gTimer) { clearTimeout(gTimer); gTimer = null; }
    }

    function isTypingTarget(el) {
        const tag = el.tagName;
        return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    document.addEventListener('keydown', function (e) {
        // Always handle Escape
        if (e.key === 'Escape') {
            CT.closePalette && CT.closePalette();
            CT.closeSidebar && CT.closeSidebar();
            const sm = document.getElementById('ct-shortcuts-modal');
            if (sm) sm.remove();
            return;
        }

        const inInput = isTypingTarget(document.activeElement);

        // Ctrl+K / Cmd+K — command palette (works everywhere)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const pal = document.getElementById('ct-palette-modal');
            pal ? CT.closePalette() : CT.openPalette();
            clearG();
            return;
        }

        // Ctrl+Enter — trigger primary action (works everywhere)
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const runBtn = document.querySelector('[data-ct-run]');
            if (runBtn) { e.preventDefault(); runBtn.click(); }
            clearG();
            return;
        }

        // Ctrl+Shift+C — copy output
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            const outputEl = document.querySelector('[data-ct-output]');
            if (outputEl) {
                e.preventDefault();
                CT.copyText && CT.copyText(outputEl.value || outputEl.textContent);
            }
            clearG();
            return;
        }

        // Ctrl+Shift+V — paste and smart-detect
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
            if (navigator.clipboard && CT.smartDetectFromClipboard) {
                e.preventDefault();
                CT.smartDetectFromClipboard();
            }
            clearG();
            return;
        }

        // Skip remaining shortcuts when typing
        if (inInput) { clearG(); return; }

        // / — focus sidebar search
        if (e.key === '/') {
            e.preventDefault();
            const search = document.getElementById('ct-sidebar-search');
            if (search) { CT.openSidebar && CT.openSidebar(); search.focus(); search.select(); }
            clearG();
            return;
        }

        // ? — show shortcut help
        if (e.key === '?') {
            CT.openShortcutHelp && CT.openShortcutHelp();
            clearG();
            return;
        }

        // g sequences: g+h and g+t
        if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            if (gPressed) {
                // second g — ignore
                clearG();
                return;
            }
            gPressed = true;
            gTimer = setTimeout(clearG, 800);
            return;
        }

        if (gPressed) {
            const root = CT._shellRoot || './';
            if (e.key === 'h') {
                e.preventDefault();
                window.location.href = root + 'index.html';
            } else if (e.key === 't') {
                e.preventDefault();
                window.location.href = root + 'tools-index.html';
            }
            clearG();
        }
    });

})(window.CyberTools = window.CyberTools || {});
