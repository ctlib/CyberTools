/* ============================================================
   Timestamp Converter — script.js
   Unix ↔ ISO 8601 ↔ human readable, all timezones
   ============================================================ */

var TIMEZONES = [
    'UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
    'America/Sao_Paulo','Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow',
    'Asia/Dubai','Asia/Kolkata','Asia/Dhaka','Asia/Bangkok','Asia/Singapore',
    'Asia/Shanghai','Asia/Tokyo','Asia/Seoul','Australia/Sydney','Pacific/Auckland',
];

function pad(n) { return String(n).padStart(2, '0'); }

function formatInTZ(date, tz) {
    try {
        var opt = { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        var parts = new Intl.DateTimeFormat('en-US', opt).formatToParts(date);
        var p = {};
        parts.forEach(function (x) { p[x.type] = x.value; });
        return p.year + '-' + p.month + '-' + p.day + ' ' + p.hour + ':' + p.minute + ':' + p.second;
    } catch (e) { return 'N/A'; }
}

function getTZOffset(date, tz) {
    try {
        var local = new Date(date.toLocaleString('en-US', { timeZone: tz }));
        var utc   = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        var diff  = (local - utc) / 60000;
        var sign  = diff >= 0 ? '+' : '-';
        var abs   = Math.abs(diff);
        return 'UTC' + sign + pad(Math.floor(abs / 60)) + ':' + pad(abs % 60);
    } catch (e) { return ''; }
}

function renderAll(date) {
    if (isNaN(date.getTime())) {
        document.getElementById('resultBlock').style.display = 'none';
        document.getElementById('parseError').style.display = '';
        return;
    }
    document.getElementById('parseError').style.display = 'none';
    document.getElementById('resultBlock').style.display = '';

    document.getElementById('outUnixSec').value  = Math.floor(date.getTime() / 1000);
    document.getElementById('outUnixMs').value   = date.getTime();
    document.getElementById('outISO').value      = date.toISOString();
    document.getElementById('outRFC2822').value  = date.toUTCString();
    document.getElementById('outRelative').value = relativeTime(date);

    var tbody = document.getElementById('tzTableBody');
    tbody.innerHTML = '';
    TIMEZONES.forEach(function (tz) {
        var tr = document.createElement('tr');
        var tdTZ = document.createElement('td');
        var tdTime = document.createElement('td');
        var tdOffset = document.createElement('td');
        tdTZ.style.cssText    = 'padding:6px 12px;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-muted);white-space:nowrap;';
        tdTime.style.cssText   = 'padding:6px 12px;border-bottom:1px solid var(--border);font-family:JetBrains Mono,monospace;font-size:12px;';
        tdOffset.style.cssText = 'padding:6px 12px;border-bottom:1px solid var(--border);font-size:11px;color:var(--text-muted);white-space:nowrap;';
        tdTZ.textContent     = tz;
        tdTime.textContent   = formatInTZ(date, tz);
        tdOffset.textContent = getTZOffset(date, tz);
        tr.appendChild(tdTZ); tr.appendChild(tdTime); tr.appendChild(tdOffset);
        tbody.appendChild(tr);
    });
}

function relativeTime(date) {
    var diff = Date.now() - date.getTime();
    var abs  = Math.abs(diff);
    var future = diff < 0;
    var s = Math.floor(abs / 1000);
    var m = Math.floor(s / 60);
    var h = Math.floor(m / 60);
    var d = Math.floor(h / 24);
    var mo = Math.floor(d / 30);
    var y  = Math.floor(d / 365);
    var str;
    if      (s < 10)  str = 'just now';
    else if (s < 60)  str = s + ' seconds';
    else if (m < 60)  str = m + ' minute' + (m > 1 ? 's' : '');
    else if (h < 24)  str = h + ' hour' + (h > 1 ? 's' : '');
    else if (d < 30)  str = d + ' day' + (d > 1 ? 's' : '');
    else if (mo < 12) str = mo + ' month' + (mo > 1 ? 's' : '');
    else              str = y + ' year' + (y > 1 ? 's' : '');
    if (str === 'just now') return str;
    return future ? 'in ' + str : str + ' ago';
}

function parseInput(val) {
    val = val.trim();
    if (!val) return new Date();

    // Unix timestamp (seconds or ms)
    if (/^\d+$/.test(val)) {
        var n = parseInt(val, 10);
        return new Date(n > 1e10 ? n : n * 1000);
    }

    // ISO 8601 or other parseable strings
    var d = new Date(val);
    if (!isNaN(d.getTime())) return d;

    return new Date(NaN);
}

function convertNow() {
    var val = document.getElementById('tsInput').value.trim();
    renderAll(parseInput(val));
}

function setNow() {
    document.getElementById('tsInput').value = Math.floor(Date.now() / 1000);
    convertNow();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('convertBtn').addEventListener('click', convertNow);
    document.getElementById('nowBtn').addEventListener('click', setNow);
    document.getElementById('tsInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') convertNow();
    });

    document.getElementById('resultBlock').style.display = 'none';
    document.getElementById('parseError').style.display = 'none';

    setNow();
});
