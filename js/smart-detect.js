/* CyberTools — Smart Detect
 * Analyzes a string and returns the most likely type + suggested tool.
 */

(function (CT) {
    'use strict';

    const DETECTORS = [
        {
            name: 'JWT',
            confidence: 0.95,
            toolId: 'jwt',
            test: (s) => /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(s.trim()) && s.trim().split('.').length === 3,
        },
        {
            name: 'Base64',
            confidence: 0.8,
            toolId: 'base64',
            test: (s) => {
                const t = s.trim();
                return t.length >= 8 && /^[A-Za-z0-9+/]+=*$/.test(t) && t.length % 4 === 0 && !/^[0-9a-fA-F]+$/.test(t);
            },
        },
        {
            name: 'Base64 URL-safe',
            confidence: 0.78,
            toolId: 'base64',
            test: (s) => {
                const t = s.trim();
                return t.length >= 8 && /^[A-Za-z0-9_-]+=*$/.test(t) && !t.includes('.');
            },
        },
        {
            name: 'SHA-256 hash',
            confidence: 0.92,
            toolId: 'hash',
            test: (s) => /^[0-9a-fA-F]{64}$/.test(s.trim()),
        },
        {
            name: 'SHA-512 hash',
            confidence: 0.92,
            toolId: 'hash',
            test: (s) => /^[0-9a-fA-F]{128}$/.test(s.trim()),
        },
        {
            name: 'MD5 hash',
            confidence: 0.85,
            toolId: 'hash',
            test: (s) => /^[0-9a-fA-F]{32}$/.test(s.trim()),
        },
        {
            name: 'SHA-1 hash',
            confidence: 0.87,
            toolId: 'hash',
            test: (s) => /^[0-9a-fA-F]{40}$/.test(s.trim()),
        },
        {
            name: 'Hex string',
            confidence: 0.7,
            toolId: 'hex-viewer',
            test: (s) => {
                const t = s.trim().replace(/\s/g, '');
                return t.length >= 8 && /^[0-9a-fA-F]+$/.test(t) && t.length % 2 === 0;
            },
        },
        {
            name: 'URL-encoded string',
            confidence: 0.88,
            toolId: 'base64',
            test: (s) => /%[0-9A-Fa-f]{2}/.test(s),
        },
        {
            name: 'ROT-13 (likely)',
            confidence: 0.6,
            toolId: 'rot',
            test: (s) => {
                // Heuristic: all alpha chars shift to common English words
                const t = s.trim();
                return /^[A-Za-z\s.,!?]+$/.test(t) && t.length > 5;
            },
        },
    ];

    CT.detectType = function (str) {
        if (!str || str.trim().length < 4) return null;
        for (const d of DETECTORS) {
            try {
                if (d.test(str)) {
                    return { name: d.name, confidence: d.confidence, toolId: d.toolId };
                }
            } catch (_) {}
        }
        return null;
    };

    CT.showSmartDetectBanner = function (result, root) {
        const existing = document.getElementById('ct-smart-banner');
        if (existing) existing.remove();
        if (!result) return;

        root = root || CT._shellRoot || './';
        const tool = CT.TOOLS && CT.TOOLS.find((t) => t.id === result.toolId);
        if (!tool) return;

        const pct = Math.round(result.confidence * 100);
        const banner = document.createElement('div');
        banner.id = 'ct-smart-banner';
        banner.setAttribute('role', 'alert');
        banner.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:80;max-width:360px;background:var(--surface);border:1px solid var(--accent);border-radius:10px;padding:14px 16px;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
        banner.innerHTML = `
<div style="display:flex;align-items:flex-start;gap:10px;">
  <span style="font-size:18px;" aria-hidden="true">🔍</span>
  <div style="flex:1;min-width:0;">
    <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px;">Looks like ${result.name}</div>
    <div style="font-size:12px;color:var(--text-muted);">${pct}% confidence — open in ${tool.name}?</div>
  </div>
  <button onclick="document.getElementById('ct-smart-banner').remove()" aria-label="Dismiss"
    style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;line-height:1;padding:0;flex-shrink:0;">×</button>
</div>
<div style="display:flex;gap:8px;margin-top:10px;">
  <a href="${root}${tool.path}index.html"
    style="flex:1;display:block;text-align:center;padding:6px;background:var(--accent);color:var(--bg);border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">
    Open ${tool.name}
  </a>
  <button onclick="document.getElementById('ct-smart-banner').remove()"
    style="padding:6px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;font-size:12px;color:var(--text-muted);cursor:pointer;font-family:inherit;">
    Dismiss
  </button>
</div>`;
        document.body.appendChild(banner);
        setTimeout(() => { const b = document.getElementById('ct-smart-banner'); if (b) b.remove(); }, 8000);
    };

    CT.smartDetectFromClipboard = function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.readText().then((text) => {
            const result = CT.detectType(text);
            CT.showSmartDetectBanner(result);
        }).catch(() => {});
    };

})(window.CyberTools = window.CyberTools || {});
