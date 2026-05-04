/* CyberTools — CSP Analyzer
 *
 * Parses a Content-Security-Policy header value into directives, then
 * scores it against ~25 known security pitfalls and best practices.
 *
 * References:
 *   - https://www.w3.org/TR/CSP3/
 *   - https://csp-evaluator.withgoogle.com/
 *   - https://content-security-policy.com/
 */

(function () {
    'use strict';

    var FETCH_DIRECTIVES = [
        'default-src', 'script-src', 'script-src-elem', 'script-src-attr',
        'style-src', 'style-src-elem', 'style-src-attr',
        'img-src', 'font-src', 'connect-src', 'media-src', 'object-src',
        'child-src', 'frame-src', 'worker-src', 'manifest-src', 'prefetch-src',
    ];
    var DOCUMENT_DIRECTIVES = ['base-uri', 'sandbox', 'plugin-types'];
    var NAVIGATION_DIRECTIVES = ['form-action', 'frame-ancestors', 'navigate-to'];
    var REPORTING_DIRECTIVES = ['report-uri', 'report-to'];
    var OTHER_DIRECTIVES = ['require-trusted-types-for', 'trusted-types', 'upgrade-insecure-requests', 'block-all-mixed-content'];

    var ALL_DIRECTIVES = [].concat(FETCH_DIRECTIVES, DOCUMENT_DIRECTIVES, NAVIGATION_DIRECTIVES, REPORTING_DIRECTIVES, OTHER_DIRECTIVES);

    // ── Parse ────────────────────────────────────────────────────────────────

    function parse(input) {
        var directives = {};
        var raw = input.trim();
        if (!raw) return directives;

        // Strip "Content-Security-Policy:" prefix if present
        raw = raw.replace(/^content-security-policy(-report-only)?\s*:\s*/i, '');

        // Split on semicolons; each part = one directive
        var parts = raw.split(';');
        for (var i = 0; i < parts.length; i++) {
            var trimmed = parts[i].trim();
            if (!trimmed) continue;
            var tokens = trimmed.split(/\s+/);
            var name = tokens.shift().toLowerCase();
            directives[name] = tokens;
        }
        return directives;
    }

    // ── Audit rules ──────────────────────────────────────────────────────────

    function audit(directives) {
        var findings = [];
        var hasAny = Object.keys(directives).length > 0;

        if (!hasAny) {
            findings.push({ level: 'error', directive: '(none)', msg: 'No directives parsed. Empty or invalid CSP.' });
            return findings;
        }

        // Unknown directives
        Object.keys(directives).forEach(function (d) {
            if (ALL_DIRECTIVES.indexOf(d) === -1) {
                findings.push({ level: 'warn', directive: d, msg: 'Unknown or non-standard directive. Ignored by browsers that don\'t recognize it.' });
            }
        });

        // No default-src AND no script-src
        if (!directives['default-src'] && !directives['script-src']) {
            findings.push({ level: 'error', directive: '(missing)', msg: 'No default-src and no script-src — scripts may be unrestricted depending on browser.' });
        }

        // Check each fetch directive for unsafe values
        FETCH_DIRECTIVES.forEach(function (d) {
            var values = directives[d];
            if (!values) return;
            values.forEach(function (v) {
                var vLower = v.toLowerCase();
                if (vLower === "'unsafe-inline'") {
                    var sev = (d === 'script-src' || d === 'script-src-elem' || d === 'script-src-attr' || d === 'default-src') ? 'error' : 'warn';
                    findings.push({ level: sev, directive: d, msg: "'unsafe-inline' allows inline scripts/styles — defeats CSP's main XSS-prevention purpose for script-src. Use nonces or hashes instead." });
                } else if (vLower === "'unsafe-eval'") {
                    findings.push({ level: 'error', directive: d, msg: "'unsafe-eval' permits eval(), new Function(), setTimeout('string'), setInterval('string') — major XSS amplifier." });
                } else if (vLower === "'unsafe-hashes'") {
                    findings.push({ level: 'warn', directive: d, msg: "'unsafe-hashes' allows hashed inline event handlers — only use if absolutely required." });
                } else if (v === '*') {
                    findings.push({ level: 'error', directive: d, msg: 'Wildcard (*) allows any origin — almost equivalent to no CSP for this directive.' });
                } else if (v === 'https:' || v === 'http:' || v === 'data:' || v === 'blob:' || v === 'filesystem:') {
                    var msg = 'Schema-only source (' + v + ') allows any origin matching that scheme.';
                    if (v === 'data:' && (d === 'script-src' || d === 'default-src')) {
                        findings.push({ level: 'error', directive: d, msg: msg + ' For script-src this allows arbitrary data: URI scripts — major XSS vector.' });
                    } else {
                        findings.push({ level: 'warn', directive: d, msg: msg });
                    }
                } else if (v.indexOf('*.') === 0 && (d === 'script-src' || d === 'default-src')) {
                    findings.push({ level: 'warn', directive: d, msg: 'Wildcard subdomain (' + v + ') for script-src widens the attack surface — every subdomain becomes a potential XSS source.' });
                }
            });

            // strict-dynamic check
            if (d === 'script-src' && values.indexOf("'strict-dynamic'") !== -1) {
                findings.push({ level: 'good', directive: d, msg: "'strict-dynamic' is enabled — modern best practice. Trusts dynamically-loaded scripts via nonce/hash chain." });
            }

            // Nonce / hash detection
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                if (/^'nonce-[A-Za-z0-9+/=_-]+'$/.test(v)) {
                    findings.push({ level: 'good', directive: d, msg: 'Uses nonce — strong defense if nonce is per-request and unguessable.' });
                    break;
                }
                if (/^'sha(256|384|512)-[A-Za-z0-9+/=]+'$/.test(v)) {
                    findings.push({ level: 'good', directive: d, msg: 'Uses script hash — pinning is fine for static inline scripts.' });
                    break;
                }
            }
        });

        // object-src
        if (!directives['object-src'] && !directives['default-src']) {
            findings.push({ level: 'warn', directive: '(missing)', msg: "No object-src or default-src — Flash/Java applets/<embed> can load from any origin (legacy XSS vector)." });
        } else if (directives['object-src']) {
            if (directives['object-src'].indexOf("'none'") === -1 && directives['object-src'].indexOf('*') === -1) {
                // any value other than 'none' is a finding
                findings.push({ level: 'warn', directive: 'object-src', msg: "object-src not set to 'none' — recommended for modern apps that don't use plugins." });
            } else if (directives['object-src'].indexOf("'none'") !== -1) {
                findings.push({ level: 'good', directive: 'object-src', msg: "object-src 'none' — blocks legacy plugins entirely." });
            }
        }

        // base-uri
        if (!directives['base-uri']) {
            findings.push({ level: 'warn', directive: '(missing)', msg: "No base-uri — attackers who control any HTML can change the document base via injected <base> tag, redirecting relative URLs." });
        } else if (directives['base-uri'].indexOf("'none'") !== -1 || directives['base-uri'].indexOf("'self'") !== -1) {
            findings.push({ level: 'good', directive: 'base-uri', msg: "base-uri restricted — prevents <base> tag injection." });
        }

        // frame-ancestors (clickjacking)
        if (!directives['frame-ancestors']) {
            findings.push({ level: 'warn', directive: '(missing)', msg: "No frame-ancestors — relies on legacy X-Frame-Options for clickjacking protection. CSP's frame-ancestors supersedes it." });
        } else if (directives['frame-ancestors'].indexOf("'none'") !== -1) {
            findings.push({ level: 'good', directive: 'frame-ancestors', msg: "frame-ancestors 'none' — page cannot be embedded anywhere (clickjacking-proof)." });
        } else if (directives['frame-ancestors'].indexOf("'self'") !== -1) {
            findings.push({ level: 'good', directive: 'frame-ancestors', msg: "frame-ancestors 'self' — only same-origin can embed (typical safe choice)." });
        }

        // form-action
        if (!directives['form-action']) {
            findings.push({ level: 'warn', directive: '(missing)', msg: "No form-action — forms can post to any origin. Set to 'self' to prevent injected forms exfiltrating to attackers." });
        }

        // upgrade-insecure-requests
        if (directives['upgrade-insecure-requests']) {
            findings.push({ level: 'good', directive: 'upgrade-insecure-requests', msg: 'HTTP subresources auto-upgraded to HTTPS — good defense in depth.' });
        }

        // report-to / report-uri
        if (!directives['report-to'] && !directives['report-uri']) {
            findings.push({ level: 'info', directive: '(missing)', msg: 'No report-to or report-uri — violations are silent. Adding a reporting endpoint helps catch real-world breakages and attacks.' });
        }

        return findings;
    }

    // ── Render ───────────────────────────────────────────────────────────────

    var LEVEL_STYLE = {
        good:  { color: 'var(--success)', label: 'GOOD' },
        info:  { color: 'var(--accent-2)', label: 'INFO' },
        warn:  { color: 'var(--warning)', label: 'WARN' },
        error: { color: 'var(--danger)',  label: 'FAIL' },
    };

    function score(findings) {
        var s = 100;
        for (var i = 0; i < findings.length; i++) {
            if (findings[i].level === 'error') s -= 20;
            else if (findings[i].level === 'warn') s -= 8;
            else if (findings[i].level === 'info') s -= 1;
        }
        return Math.max(0, s);
    }

    function render(directives, findings) {
        var box = document.getElementById('result');
        var s = score(findings);
        var sLabel = s >= 90 ? 'Excellent' : s >= 70 ? 'Good' : s >= 50 ? 'Weak' : 'Poor';
        var sColor = s >= 90 ? 'var(--success)' : s >= 70 ? 'var(--accent)' : s >= 50 ? 'var(--warning)' : 'var(--danger)';

        var html = '<div class="tool-panel" style="margin-bottom:16px;">' +
            '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
                '<div style="font-size:48px;font-weight:800;line-height:1;color:' + sColor + ';">' + s + '</div>' +
                '<div>' +
                    '<div style="font-size:14px;font-weight:600;color:var(--text);">' + sLabel + '</div>' +
                    '<div style="font-size:12px;color:var(--text-muted);">CSP score (heuristic, not a guarantee)</div>' +
                '</div>' +
            '</div></div>';

        // Findings
        html += '<div class="tool-panel" style="margin-bottom:16px;">';
        html += '<div class="tool-panel-label">Findings — ' + findings.length + '</div>';
        if (findings.length === 0) {
            html += '<div style="color:var(--text-muted);font-size:14px;">No issues found.</div>';
        } else {
            findings.forEach(function (f) {
                var st = LEVEL_STYLE[f.level] || LEVEL_STYLE.info;
                html += '<div style="margin:10px 0;padding:10px 12px;border-radius:6px;background:var(--surface-2);border-left:3px solid ' + st.color + ';">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                        '<span style="font-size:11px;font-weight:700;color:' + st.color + ';font-family:\'JetBrains Mono\',monospace;">' + st.label + '</span>' +
                        '<code style="font-size:12px;color:var(--text);">' + escapeHTML(f.directive) + '</code>' +
                    '</div>' +
                    '<div style="font-size:13px;color:var(--text);margin-top:6px;">' + escapeHTML(f.msg) + '</div>' +
                '</div>';
            });
        }
        html += '</div>';

        // Parsed directives table
        html += '<div class="tool-panel">';
        html += '<div class="tool-panel-label">Parsed directives — ' + Object.keys(directives).length + '</div>';
        var keys = Object.keys(directives).sort();
        if (keys.length === 0) {
            html += '<div style="color:var(--text-muted);">(none)</div>';
        } else {
            html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">';
            html += '<thead><tr style="border-bottom:1px solid var(--border);"><th style="text-align:left;padding:8px;color:var(--text-muted);font-weight:600;">Directive</th><th style="text-align:left;padding:8px;color:var(--text-muted);font-weight:600;">Sources</th></tr></thead><tbody>';
            keys.forEach(function (k) {
                html += '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:8px;font-family:\'JetBrains Mono\',monospace;color:var(--accent);">' + escapeHTML(k) + '</td>' +
                    '<td style="padding:8px;font-family:\'JetBrains Mono\',monospace;color:var(--text);word-break:break-all;">' + (directives[k].length === 0 ? '<em style="color:var(--text-muted);">(empty)</em>' : escapeHTML(directives[k].join(' '))) + '</td>' +
                '</tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';

        box.innerHTML = html;
        box.style.display = 'block';

        var scoreLabel = document.getElementById('cspScore');
        if (scoreLabel) scoreLabel.textContent = 'score=' + s + '/100';
    }

    function escapeHTML(s) {
        var d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    // ── Wire up ──────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('analyzeBtn');
        if (btn) {
            btn.addEventListener('click', function () {
                var input = document.getElementById('cspInput').value;
                var directives = parse(input);
                var findings = audit(directives);
                render(directives, findings);
            });
        }
    });
})();
