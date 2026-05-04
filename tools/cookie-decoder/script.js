/* ============================================================
   Cookie Decoder — script.js
   Parse Set-Cookie headers, flag missing security attributes
   ============================================================ */

function parseCookie(raw) {
    raw = raw.trim();
    if (!raw) return null;

    var parts = raw.split(';').map(function (p) { return p.trim(); });
    var nameval = parts[0];
    var eqIdx = nameval.indexOf('=');
    var name  = eqIdx === -1 ? nameval : nameval.slice(0, eqIdx);
    var value = eqIdx === -1 ? '' : nameval.slice(eqIdx + 1);

    var attrs = {
        name:     name,
        value:    value,
        path:     null, domain: null, expires: null, maxAge: null,
        httpOnly: false, secure: false, sameSite: null, partitioned: false,
    };

    parts.slice(1).forEach(function (p) {
        var lower = p.toLowerCase();
        if (lower === 'httponly')   { attrs.httpOnly = true; return; }
        if (lower === 'secure')     { attrs.secure = true; return; }
        if (lower === 'partitioned'){ attrs.partitioned = true; return; }
        var kv = p.split('='); var k = kv[0].toLowerCase().trim(); var v = kv.slice(1).join('=').trim();
        if (k === 'path')       attrs.path     = v;
        if (k === 'domain')     attrs.domain   = v;
        if (k === 'expires')    attrs.expires  = v;
        if (k === 'max-age')    attrs.maxAge   = v;
        if (k === 'samesite')   attrs.sameSite = v;
    });

    return attrs;
}

function scoreRisks(a) {
    var issues = [], good = [];

    if (!a.httpOnly)  issues.push({ sev: 'high',   msg: 'Missing HttpOnly — cookie accessible via JavaScript (XSS risk)' });
    else              good.push('HttpOnly set');

    if (!a.secure)    issues.push({ sev: 'high',   msg: 'Missing Secure — cookie sent over plain HTTP connections' });
    else              good.push('Secure flag set');

    if (!a.sameSite)  issues.push({ sev: 'medium', msg: 'Missing SameSite — vulnerable to CSRF attacks (add SameSite=Lax or Strict)' });
    else if (a.sameSite.toLowerCase() === 'none' && !a.secure)
                      issues.push({ sev: 'high',   msg: 'SameSite=None without Secure — invalid combination, modern browsers will reject' });
    else if (a.sameSite.toLowerCase() === 'none')
                      issues.push({ sev: 'info',   msg: 'SameSite=None — cookie sent cross-site. Ensure this is intentional (e.g. third-party embed).' });
    else              good.push('SameSite=' + a.sameSite);

    if (!a.maxAge && !a.expires) issues.push({ sev: 'info', msg: 'No expiry — session cookie (deleted on browser close). OK for session tokens.' });

    if (a.domain && a.domain.startsWith('.'))
        issues.push({ sev: 'info', msg: 'Domain starts with "." — scoped to all subdomains of ' + a.domain.slice(1) });

    return { issues, good };
}

function renderCookies(cookies) {
    var wrap = document.getElementById('cookieResults');
    wrap.innerHTML = '';

    cookies.forEach(function (c) {
        if (!c) return;
        var risk = scoreRisks(c);
        var severityColor = risk.issues.some(function (i) { return i.sev === 'high'; }) ? 'var(--danger)'
            : risk.issues.some(function (i) { return i.sev === 'medium'; }) ? 'var(--warning)' : 'var(--success)';

        var attrsHtml = [
            ['Name', c.name], ['Value', c.value || '(empty)'],
            ['Domain', c.domain || '(not set)'], ['Path', c.path || '/'],
            ['Expires', c.expires || (c.maxAge ? 'Max-Age: ' + c.maxAge : 'Session')],
            ['HttpOnly', c.httpOnly ? '✅ Yes' : '❌ No'],
            ['Secure', c.secure ? '✅ Yes' : '❌ No'],
            ['SameSite', c.sameSite || '(not set)'],
        ].map(function (row) {
            var isGood = (row[0] === 'HttpOnly' || row[0] === 'Secure') && row[1].startsWith('✅');
            var isBad  = (row[0] === 'HttpOnly' || row[0] === 'Secure') && row[1].startsWith('❌');
            var color  = isGood ? 'color:var(--success);' : isBad ? 'color:var(--danger);' : '';
            return '<tr style="border-bottom:1px solid var(--border);">' +
                '<td style="padding:7px 12px;font-size:12px;color:var(--text-muted);white-space:nowrap;">' + row[0] + '</td>' +
                '<td style="padding:7px 12px;font-size:13px;font-family:JetBrains Mono,monospace;' + color + '">' + escHtml(String(row[1])) + '</td></tr>';
        }).join('');

        var issuesHtml = risk.issues.map(function (i) {
            var color = i.sev === 'high' ? 'var(--danger)' : i.sev === 'medium' ? 'var(--warning)' : 'var(--text-muted)';
            var badge = i.sev === 'high' ? 'HIGH' : i.sev === 'medium' ? 'MEDIUM' : 'INFO';
            return '<div style="display:flex;gap:8px;margin-bottom:6px;font-size:13px;">' +
                '<span style="background:' + color + ';color:#0d1117;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;align-self:flex-start;">' + badge + '</span>' +
                '<span>' + i.msg + '</span></div>';
        }).join('');

        var goodHtml = risk.good.map(function (g) {
            return '<span style="display:inline-block;background:color-mix(in srgb,var(--success) 15%,transparent);border:1px solid color-mix(in srgb,var(--success) 40%,transparent);color:var(--success);font-size:11px;border-radius:4px;padding:2px 8px;margin:2px;">✅ ' + g + '</span>';
        }).join(' ');

        wrap.innerHTML += '<div class="tool-panel" style="margin-bottom:16px;border-left:3px solid ' + severityColor + ';">' +
            '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:12px;font-family:JetBrains Mono,monospace;">' + escHtml(c.name) + '</div>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:12px;">' + attrsHtml + '</table>' +
            (issuesHtml ? '<div style="margin-bottom:8px;">' + issuesHtml + '</div>' : '') +
            (goodHtml ? '<div>' + goodHtml + '</div>' : '') +
            '</div>';
    });
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function runDecode() {
    var raw = document.getElementById('cookieInput').value;
    var lines = raw.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    // Handle "Cookie: " header prefix
    lines = lines.map(function (l) { return l.replace(/^(set-cookie|cookie)\s*:\s*/i, ''); });
    var cookies = lines.map(parseCookie).filter(Boolean);
    if (!cookies.length) {
        document.getElementById('cookieResults').innerHTML = '<div style="color:var(--text-muted);font-size:13px;">No cookies to parse.</div>';
        return;
    }
    renderCookies(cookies);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('decodeBtn').addEventListener('click', runDecode);
    document.getElementById('cookieInput').addEventListener('input', function () {
        if (this.value.trim()) runDecode();
    });
});
