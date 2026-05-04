/* ============================================================
   User-Agent Parser — script.js
   Regex-based UA string parsing
   ============================================================ */

function parseUA(ua) {
    if (!ua) return null;
    var result = { browser: '?', browserVersion: '', os: '?', osVersion: '', device: 'Desktop', engine: '', raw: ua };

    // Browser detection
    var browsers = [
        [/Edg\/([^\s;]+)/, 'Edge'],
        [/OPR\/([^\s;]+)/, 'Opera'],
        [/Opera\/([^\s;]+)/, 'Opera'],
        [/SamsungBrowser\/([^\s;]+)/, 'Samsung Internet'],
        [/YaBrowser\/([^\s;]+)/, 'Yandex Browser'],
        [/UCBrowser\/([^\s;]+)/, 'UC Browser'],
        [/CriOS\/([^\s;]+)/, 'Chrome (iOS)'],
        [/FxiOS\/([^\s;]+)/, 'Firefox (iOS)'],
        [/Firefox\/([^\s;]+)/, 'Firefox'],
        [/Chrome\/([^\s;]+)/, 'Chrome'],
        [/Safari\/([^\s;]+)/, 'Safari'],
        [/MSIE ([^\s;]+)/, 'Internet Explorer'],
        [/Trident\/.*rv:([^\s;)]+)/, 'Internet Explorer 11'],
        [/Wget\/([^\s;]+)/, 'Wget'],
        [/curl\/([^\s;]+)/, 'cURL'],
        [/python-requests\/([^\s;]+)/, 'Python Requests'],
        [/Go-http-client\/([^\s;]+)/, 'Go HTTP Client'],
        [/Googlebot\/([^\s;]+)/, 'Googlebot'],
        [/bingbot\/([^\s;]+)/, 'Bingbot'],
        [/Slurp/, 'Yahoo! Slurp'],
    ];
    for (var i = 0; i < browsers.length; i++) {
        var m = ua.match(browsers[i][0]);
        if (m) { result.browser = browsers[i][1]; result.browserVersion = m[1] || ''; break; }
    }

    // OS detection
    var osList = [
        [/Windows NT 10\.0/, 'Windows', '10 / 11'],
        [/Windows NT 6\.3/, 'Windows', '8.1'],
        [/Windows NT 6\.2/, 'Windows', '8'],
        [/Windows NT 6\.1/, 'Windows', '7'],
        [/Windows NT 6\.0/, 'Windows', 'Vista'],
        [/Windows NT 5\.1/, 'Windows', 'XP'],
        [/Windows Phone ([^\s;)]+)/, 'Windows Phone', ''],
        [/Windows/, 'Windows', ''],
        [/Android ([^\s;)]+)/, 'Android', ''],
        [/iPhone OS ([^\s;)]+)/, 'iOS', ''],
        [/iPad.*OS ([^\s;)]+)/, 'iPadOS', ''],
        [/Mac OS X ([^\s;)]+)/, 'macOS', ''],
        [/CrOS [^\s]+ ([^\s;)]+)/, 'Chrome OS', ''],
        [/Linux/, 'Linux', ''],
        [/Ubuntu/, 'Ubuntu Linux', ''],
        [/Debian/, 'Debian Linux', ''],
        [/Fedora/, 'Fedora Linux', ''],
    ];
    for (var j = 0; j < osList.length; j++) {
        var om = ua.match(osList[j][0]);
        if (om) {
            result.os = osList[j][1];
            result.osVersion = osList[j][2] || (om[1] ? om[1].replace(/_/g, '.') : '');
            break;
        }
    }

    // Device type
    if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) result.device = 'Mobile';
    else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) result.device = 'Tablet';
    else if (/bot|crawler|spider|slurp|wget|curl|python|go-http/i.test(ua)) result.device = 'Bot / CLI';

    // Rendering engine
    if (/Gecko\/\d/.test(ua) && !/like Gecko/.test(ua)) result.engine = 'Gecko';
    else if (/AppleWebKit\/([^\s;]+)/.test(ua)) result.engine = 'WebKit / Blink';
    else if (/Trident\//.test(ua)) result.engine = 'Trident (IE)';
    else if (/Presto\//.test(ua)) result.engine = 'Presto (Opera Legacy)';

    return result;
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderResult(r) {
    var rows = [
        ['Browser',         r.browser + (r.browserVersion ? ' ' + r.browserVersion : '')],
        ['OS',              r.os + (r.osVersion ? ' ' + r.osVersion : '')],
        ['Device type',     r.device],
        ['Engine',          r.engine || '—'],
        ['Raw UA string',   r.raw],
    ];
    var html = rows.map(function (row) {
        return '<tr style="border-bottom:1px solid var(--border);">' +
            '<td style="padding:9px 12px;font-size:12px;color:var(--text-muted);white-space:nowrap;width:140px;">' + row[0] + '</td>' +
            '<td style="padding:9px 12px;font-size:13px;font-family:' + (row[0] === 'Raw UA string' ? 'JetBrains Mono,monospace' : 'inherit') + ';word-break:break-all;">' + escHtml(row[1]) + '</td></tr>';
    }).join('');
    document.getElementById('uaResultTable').innerHTML = '<tbody>' + html + '</tbody>';
    document.getElementById('uaResultWrapper').style.display = '';
}

function runParse() {
    var ua = document.getElementById('uaInput').value.trim();
    if (!ua) { document.getElementById('uaResultWrapper').style.display = 'none'; return; }
    renderResult(parseUA(ua));
}

function loadMyUA() {
    document.getElementById('uaInput').value = navigator.userAgent;
    runParse();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('parseBtn').addEventListener('click', runParse);
    document.getElementById('myUABtn').addEventListener('click', loadMyUA);
    document.getElementById('uaInput').addEventListener('input', function () { if (this.value) runParse(); });
    document.getElementById('uaResultWrapper').style.display = 'none';
    loadMyUA();
});
