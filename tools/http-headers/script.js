/* ============================================================
   HTTP Security Headers Analyzer — script.js
   Paste raw response headers, get a security scorecard
   ============================================================ */

var HEADER_RULES = [
    {
        name: 'Strict-Transport-Security',
        abbr: 'HSTS',
        weight: 15,
        check: function (v) {
            if (!v) return { pass: false, sev: 'high', msg: 'Missing HSTS — site can be downgraded to HTTP (MITM risk)' };
            var maxAge = v.match(/max-age\s*=\s*(\d+)/i);
            if (!maxAge) return { pass: false, sev: 'medium', msg: 'HSTS present but missing max-age directive' };
            var age = parseInt(maxAge[1], 10);
            if (age < 31536000) return { pass: 'warn', sev: 'medium', msg: 'HSTS max-age=' + age + ' is less than 1 year (recommended ≥ 31536000)' };
            var good = 'HSTS enabled, max-age=' + age;
            if (/includeSubDomains/i.test(v)) good += ', includeSubDomains';
            if (/preload/i.test(v)) good += ', preload';
            return { pass: true, msg: good };
        },
    },
    {
        name: 'Content-Security-Policy',
        abbr: 'CSP',
        weight: 20,
        check: function (v) {
            if (!v) return { pass: false, sev: 'high', msg: 'Missing CSP — no protection against XSS and code injection' };
            var issues = [];
            if (/unsafe-inline/i.test(v)) issues.push("'unsafe-inline' allows inline scripts/styles (XSS risk)");
            if (/unsafe-eval/i.test(v))   issues.push("'unsafe-eval' allows eval() (XSS risk)");
            if (/\*/.test(v))             issues.push('Wildcard * source allows any origin');
            if (!/default-src/i.test(v) && !/script-src/i.test(v)) issues.push('No default-src or script-src directive');
            if (issues.length)
                return { pass: 'warn', sev: issues.length > 1 ? 'medium' : 'info', msg: 'CSP present with concerns: ' + issues.join('; ') };
            return { pass: true, msg: 'CSP configured without obvious weaknesses' };
        },
    },
    {
        name: 'X-Frame-Options',
        abbr: 'XFO',
        weight: 10,
        check: function (v) {
            if (!v) return { pass: false, sev: 'medium', msg: 'Missing X-Frame-Options — site may be embeddable in iframes (clickjacking)' };
            var val = v.trim().toUpperCase();
            if (val === 'DENY' || val === 'SAMEORIGIN')
                return { pass: true, msg: 'X-Frame-Options: ' + val };
            if (/ALLOW-FROM/i.test(v))
                return { pass: 'warn', sev: 'info', msg: 'ALLOW-FROM is deprecated; use CSP frame-ancestors instead' };
            return { pass: 'warn', sev: 'medium', msg: 'Unrecognized X-Frame-Options value: ' + v };
        },
    },
    {
        name: 'X-Content-Type-Options',
        abbr: 'XCTO',
        weight: 8,
        check: function (v) {
            if (!v) return { pass: false, sev: 'medium', msg: 'Missing X-Content-Type-Options — browsers may MIME-sniff responses' };
            if (v.trim().toLowerCase() === 'nosniff') return { pass: true, msg: 'nosniff — prevents MIME-type sniffing' };
            return { pass: 'warn', sev: 'low', msg: 'Unexpected value: ' + v + ' (expected: nosniff)' };
        },
    },
    {
        name: 'Referrer-Policy',
        abbr: 'RP',
        weight: 7,
        check: function (v) {
            if (!v) return { pass: false, sev: 'low', msg: 'Missing Referrer-Policy — full URL sent as Referer to third parties by default' };
            var safe = ['no-referrer','no-referrer-when-downgrade','origin','origin-when-cross-origin',
                        'same-origin','strict-origin','strict-origin-when-cross-origin'];
            if (safe.includes(v.toLowerCase().trim()))
                return { pass: true, msg: 'Referrer-Policy: ' + v };
            if (v.toLowerCase().trim() === 'unsafe-url')
                return { pass: false, sev: 'medium', msg: 'unsafe-url leaks full URL (including path and query) to all origins' };
            return { pass: 'warn', sev: 'info', msg: 'Non-standard value: ' + v };
        },
    },
    {
        name: 'Permissions-Policy',
        abbr: 'PP',
        weight: 7,
        check: function (v) {
            if (!v) return { pass: false, sev: 'low', msg: 'Missing Permissions-Policy — browser features (camera, mic, etc.) not restricted' };
            return { pass: true, msg: 'Permissions-Policy configured' };
        },
    },
    {
        name: 'Cross-Origin-Opener-Policy',
        abbr: 'COOP',
        weight: 6,
        check: function (v) {
            if (!v) return { pass: false, sev: 'low', msg: 'Missing COOP — window can be opened cross-origin; needed for SharedArrayBuffer' };
            return { pass: true, msg: 'COOP: ' + v };
        },
    },
    {
        name: 'Cross-Origin-Resource-Policy',
        abbr: 'CORP',
        weight: 5,
        check: function (v) {
            if (!v) return { pass: false, sev: 'info', msg: 'Missing CORP — resources loadable cross-origin by default' };
            return { pass: true, msg: 'CORP: ' + v };
        },
    },
    {
        name: 'Cache-Control',
        abbr: 'CC',
        weight: 5,
        check: function (v) {
            if (!v) return { pass: false, sev: 'info', msg: 'Missing Cache-Control — sensitive responses may be cached by proxies/browsers' };
            if (/no-store/i.test(v)) return { pass: true, msg: 'no-store set' };
            if (/private/i.test(v))  return { pass: true, msg: 'private — not stored by shared caches' };
            if (/public/i.test(v))   return { pass: 'warn', sev: 'info', msg: 'public — response may be cached by shared caches (ok for static assets, review for auth pages)' };
            return { pass: 'warn', sev: 'info', msg: 'Cache-Control: ' + v };
        },
    },
    {
        name: 'X-Powered-By',
        abbr: 'XPB',
        weight: 3,
        check: function (v) {
            if (!v) return { pass: true, msg: 'X-Powered-By not exposed (good)' };
            return { pass: false, sev: 'info', msg: 'X-Powered-By: ' + v + ' — reveals server technology (remove this header)' };
        },
    },
    {
        name: 'Server',
        abbr: 'SRV',
        weight: 3,
        check: function (v) {
            if (!v) return { pass: true, msg: 'Server header not exposed (good)' };
            if (/[\d.]/.test(v)) return { pass: false, sev: 'info', msg: 'Server: ' + v + ' — exposes version info (strip version from header)' };
            return { pass: 'warn', sev: 'info', msg: 'Server: ' + v + ' (consider removing or genericizing)' };
        },
    },
];

function parseHeaders(raw) {
    var map = {};
    raw.split('\n').forEach(function (line) {
        line = line.trim();
        if (!line || line.match(/^HTTP\//i)) return;
        var idx = line.indexOf(':');
        if (idx === -1) return;
        var key = line.slice(0, idx).trim().toLowerCase();
        var val = line.slice(idx + 1).trim();
        map[key] = val;
    });
    return map;
}

function analyze() {
    var raw = document.getElementById('headersInput').value.trim();
    if (!raw) return;

    var headers = parseHeaders(raw);
    var results = [];
    var totalWeight = 0, earned = 0;

    HEADER_RULES.forEach(function (rule) {
        var val = headers[rule.name.toLowerCase()];
        var r   = rule.check(val);
        totalWeight += rule.weight;
        if (r.pass === true) earned += rule.weight;
        else if (r.pass === 'warn') earned += rule.weight * 0.5;
        results.push({ rule, val, result: r });
    });

    var score = Math.round((earned / totalWeight) * 100);
    renderResults(results, score, headers);
}

function renderResults(results, score, allHeaders) {
    var wrap = document.getElementById('headersResultWrapper');
    wrap.style.display = '';

    var scoreColor = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
    document.getElementById('scoreCircle').style.color = scoreColor;
    document.getElementById('scoreNum').textContent = score;
    document.getElementById('scoreLabel').textContent = score >= 80 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';
    document.getElementById('scoreLabel').style.color = scoreColor;

    var rows = results.map(function (item) {
        var icon = item.result.pass === true ? '✅' : item.result.pass === 'warn' ? '⚠️' : '❌';
        var color = item.result.pass === true ? 'var(--success)' : item.result.pass === 'warn' ? 'var(--warning)' : 'var(--danger)';
        return '<tr style="border-bottom:1px solid var(--border);">' +
            '<td style="padding:8px 12px;font-size:12px;font-weight:600;white-space:nowrap;">' + item.rule.name + '</td>' +
            '<td style="padding:8px 12px;font-size:13px;text-align:center;"><span style="color:' + color + ';font-weight:700;">' + icon + '</span></td>' +
            '<td style="padding:8px 12px;font-size:12px;font-family:JetBrains Mono,monospace;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
                (item.val ? escHtml(item.val) : '<em>not set</em>') + '</td>' +
            '<td style="padding:8px 12px;font-size:12px;color:' + color + ';">' + item.result.msg + '</td></tr>';
    }).join('');

    document.getElementById('headersTable').innerHTML = '<thead><tr style="border-bottom:1px solid var(--border);">' +
        '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Header</th>' +
        '<th style="padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;"></th>' +
        '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Value</th>' +
        '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Finding</th>' +
        '</tr></thead><tbody>' + rows + '</tbody>';

    // Other headers
    var known = HEADER_RULES.map(function (r) { return r.name.toLowerCase(); });
    var other = Object.keys(allHeaders).filter(function (k) { return !known.includes(k); });
    if (other.length) {
        var otherRows = other.map(function (k) {
            return '<tr style="border-bottom:1px solid var(--border);">' +
                '<td style="padding:7px 12px;font-size:12px;color:var(--text-muted);font-family:JetBrains Mono,monospace;">' + escHtml(k) + '</td>' +
                '<td style="padding:7px 12px;font-size:12px;font-family:JetBrains Mono,monospace;">' + escHtml(allHeaders[k]) + '</td></tr>';
        }).join('');
        document.getElementById('otherHeadersWrap').style.display = '';
        document.getElementById('otherHeadersTable').innerHTML = '<tbody>' + otherRows + '</tbody>';
    } else {
        document.getElementById('otherHeadersWrap').style.display = 'none';
    }
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('analyzeBtn').addEventListener('click', analyze);
    document.getElementById('headersResultWrapper').style.display = 'none';
    document.getElementById('otherHeadersWrap').style.display = 'none';
});
