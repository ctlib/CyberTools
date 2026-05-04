/* ============================================================
   Email Header Analyzer — script.js
   Parse email headers, relay hops, SPF/DKIM/DMARC
   ============================================================ */

'use strict';

/* ── Security helper ─────────────────────────────────────────────────────── */
function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

/* ── Header parser ───────────────────────────────────────────────────────── */
/**
 * Parse raw email headers into an array of {name, value} objects.
 * Handles folded headers (continuation lines start with whitespace).
 */
function parseHeaders(raw) {
    var lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    var headers = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        // Continuation line
        if (/^[ \t]/.test(line)) {
            if (current) {
                current.value += ' ' + line.trim();
            }
            continue;
        }
        var colon = line.indexOf(':');
        if (colon < 1) continue;
        current = {
            name: line.substring(0, colon).trim(),
            value: line.substring(colon + 1).trim()
        };
        headers.push(current);
    }
    return headers;
}

/* ── Authentication parser ───────────────────────────────────────────────── */
function parseAuth(headers) {
    var result = { spf: null, dkim: null, dmarc: null, raw: null };
    for (var i = 0; i < headers.length; i++) {
        if (headers[i].name.toLowerCase() === 'authentication-results') {
            result.raw = headers[i].value;
            var val = headers[i].value.toLowerCase();

            var spfM   = val.match(/\bspf=(pass|fail|softfail|neutral|none|temperror|permerror)/);
            var dkimM  = val.match(/\bdkim=(pass|fail|none|policy|neutral|temperror|permerror)/);
            var dmarcM = val.match(/\bdmarc=(pass|fail|none|temperror|permerror)/);

            if (spfM)   result.spf   = spfM[1];
            if (dkimM)  result.dkim  = dkimM[1];
            if (dmarcM) result.dmarc = dmarcM[1];
            break;
        }
    }
    return result;
}

/* ── Received header parser ──────────────────────────────────────────────── */
var RE_IPV4 = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
var RE_IPV6 = /\b([0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{0,4}){2,7})\b/g;

function extractIPs(str) {
    var ips = [];
    var m;
    RE_IPV4.lastIndex = 0;
    while ((m = RE_IPV4.exec(str)) !== null) { ips.push(m[1]); }
    RE_IPV6.lastIndex = 0;
    while ((m = RE_IPV6.exec(str)) !== null) { ips.push(m[1]); }
    return ips.filter(function (v, i, a) { return a.indexOf(v) === i; });
}

function parseReceived(value) {
    // from ... by ... via ... ; timestamp
    var fromM = value.match(/\bfrom\s+(\S+)/i);
    var byM   = value.match(/\bby\s+(\S+)/i);
    var viaM  = value.match(/\bvia\s+(\S+)/i);
    var withM = value.match(/\bwith\s+(\S+)/i);
    var dateM = value.match(/;\s*(.+)$/);

    return {
        from: fromM ? fromM[1] : '',
        by:   byM   ? byM[1]   : '',
        via:  viaM  ? viaM[1]  : (withM ? withM[1] : ''),
        date: dateM ? dateM[1].trim() : '',
        ips:  extractIPs(value)
    };
}

/* ── Badge helper ────────────────────────────────────────────────────────── */
function authBadge(label, status) {
    if (!status) return '<span style="font-size:12px;color:var(--text-muted);">n/a</span>';
    var color = 'var(--text-muted)';
    if (status === 'pass')     color = 'var(--success)';
    else if (status === 'fail' || status === 'permerror') color = 'var(--danger)';
    else if (status === 'softfail' || status === 'neutral' || status === 'temperror') color = 'var(--warning)';
    var bg = color.replace('var(', 'color-mix(in srgb,').replace(')', ' 12%,var(--surface))');
    return '<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:700;background:' + bg + ';color:' + color + ';border:1px solid color-mix(in srgb,' + color + ' 30%,var(--border));">' + escHtml(label) + ': ' + escHtml(status.toUpperCase()) + '</span>';
}

/* ── Render functions ────────────────────────────────────────────────────── */
function renderKeyFields(headers) {
    var keys = ['from', 'to', 'subject', 'date', 'message-id', 'reply-to', 'return-path'];
    var rows = '';
    var map = {};
    headers.forEach(function (h) { map[h.name.toLowerCase()] = h.value; });
    keys.forEach(function (k) {
        if (map[k] !== undefined) {
            rows += '<tr style="border-bottom:1px solid var(--border);">'
                  + '<td style="padding:8px 12px;font-size:12px;font-weight:600;color:var(--text-muted);white-space:nowrap;width:120px;">' + escHtml(k.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();})) + '</td>'
                  + '<td style="padding:8px 12px;font-size:13px;color:var(--text);word-break:break-all;font-family:\'JetBrains Mono\',monospace;">' + escHtml(map[k]) + '</td>'
                  + '</tr>';
        }
    });
    if (!rows) {
        rows = '<tr><td colspan="2" style="padding:12px;color:var(--text-muted);font-size:13px;">No standard key fields found.</td></tr>';
    }
    return '<table style="width:100%;border-collapse:collapse;">' + rows + '</table>';
}

function renderAuth(auth) {
    if (!auth.raw) {
        return '<div style="padding:10px 14px;background:color-mix(in srgb,var(--warning) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--warning) 30%,var(--border));border-radius:6px;font-size:13px;color:var(--warning);">No Authentication-Results header found in these headers.</div>';
    }
    return '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;">'
         + authBadge('SPF', auth.spf)
         + authBadge('DKIM', auth.dkim)
         + authBadge('DMARC', auth.dmarc)
         + '</div>'
         + '<div style="font-size:11px;color:var(--text-muted);font-family:\'JetBrains Mono\',monospace;background:var(--surface-2);padding:8px 10px;border-radius:6px;word-break:break-all;">' + escHtml(auth.raw) + '</div>';
}

function renderHops(receivedHeaders) {
    if (!receivedHeaders.length) {
        return '<div style="color:var(--text-muted);font-size:13px;">No Received headers found.</div>';
    }
    // Bottom = earliest, so reverse for chronological order
    var hops = receivedHeaders.slice().reverse();
    var html = '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">'
             + hops.length + ' hop' + (hops.length !== 1 ? 's' : '') + ' total — listed earliest first</div>';

    hops.forEach(function (h, idx) {
        var parsed = parseReceived(h.value);
        var ipHtml = parsed.ips.length
            ? parsed.ips.map(function (ip) {
                return '<span style="background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 30%,var(--border));border-radius:3px;padding:1px 6px;font-size:11px;font-family:\'JetBrains Mono\',monospace;">' + escHtml(ip) + '</span>';
              }).join(' ')
            : '';

        html += '<div style="border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin-bottom:10px;background:var(--surface);">'
              + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
              + '<span style="background:var(--accent);color:var(--bg);border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">' + (idx + 1) + '</span>'
              + (ipHtml ? '<div style="display:flex;flex-wrap:wrap;gap:4px;">' + ipHtml + '</div>' : '')
              + '</div>';

        if (parsed.from) html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:3px;"><span style="font-weight:600;">from</span> <span style="color:var(--text);font-family:\'JetBrains Mono\',monospace;">' + escHtml(parsed.from) + '</span></div>';
        if (parsed.by)   html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:3px;"><span style="font-weight:600;">by</span> <span style="color:var(--text);font-family:\'JetBrains Mono\',monospace;">' + escHtml(parsed.by) + '</span></div>';
        if (parsed.via)  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:3px;"><span style="font-weight:600;">via</span> <span style="color:var(--text);font-family:\'JetBrains Mono\',monospace;">' + escHtml(parsed.via) + '</span></div>';
        if (parsed.date) html += '<div style="font-size:11px;color:var(--text-muted);margin-top:5px;">' + escHtml(parsed.date) + '</div>';

        html += '</div>';
    });
    return html;
}

function renderRawTable(headers) {
    var sorted = headers.slice().sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
    var rows = sorted.map(function (h) {
        return '<tr style="border-bottom:1px solid var(--border);">'
             + '<td style="padding:6px 12px;font-size:12px;font-weight:600;color:var(--text-muted);white-space:nowrap;vertical-align:top;font-family:\'JetBrains Mono\',monospace;">' + escHtml(h.name) + '</td>'
             + '<td style="padding:6px 12px;font-size:12px;color:var(--text);word-break:break-all;font-family:\'JetBrains Mono\',monospace;">' + escHtml(h.value) + '</td>'
             + '</tr>';
    }).join('');
    return '<table style="width:100%;border-collapse:collapse;">' + rows + '</table>';
}

/* ── Main analyze ────────────────────────────────────────────────────────── */
function analyze() {
    var raw = document.getElementById('headerInput').value.trim();
    if (!raw) return;

    var headers  = parseHeaders(raw);
    if (!headers.length) {
        alert('Could not parse any headers from the input. Please paste raw email headers.');
        return;
    }

    var received = headers.filter(function (h) { return h.name.toLowerCase() === 'received'; });
    var auth     = parseAuth(headers);

    document.getElementById('keyFieldsTable').innerHTML  = renderKeyFields(headers);
    document.getElementById('authResults').innerHTML     = renderAuth(auth);
    document.getElementById('relayHops').innerHTML       = renderHops(received);
    document.getElementById('rawHeaderTable').innerHTML  = renderRawTable(headers);
    document.getElementById('rawHeaderCount').textContent = '(' + headers.length + ' headers)';

    document.getElementById('resultWrapper').style.display = '';
    document.getElementById('resultWrapper').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('resultWrapper').style.display = 'none';

    document.getElementById('analyzeBtn').addEventListener('click', analyze);

    document.getElementById('clearBtn').addEventListener('click', function () {
        document.getElementById('headerInput').value = '';
        document.getElementById('resultWrapper').style.display = 'none';
    });

    document.getElementById('headerInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { analyze(); }
    });
});
