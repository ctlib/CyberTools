/* ============================================================
   Strings Extractor — script.js
   Extract printable ASCII and UTF-16 LE strings from binaries
   ============================================================ */

'use strict';

/* ── Security helper ─────────────────────────────────────────────────────── */
function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

/* ── Pattern matchers ────────────────────────────────────────────────────── */
var RE_URL   = /https?:\/\/\S+/i;
var RE_IP    = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
var RE_EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
var RE_PATH  = /(?:[A-Za-z]:\\|\/(?:usr|var|etc|home|tmp|bin|opt|proc|windows|system32|users|programfiles)[/\\])[^\s<>|"*?]*/i;

function classifyString(s) {
    if (RE_URL.test(s))   return 'url';
    if (RE_IP.test(s))    return 'ip';
    if (RE_EMAIL.test(s)) return 'email';
    if (RE_PATH.test(s))  return 'path';
    return 'none';
}

var CLASS_COLOR = {
    url:   '#60a5fa',
    ip:    '#4ade80',
    email: '#fb923c',
    path:  '#facc15',
    none:  ''
};

/* ── Extraction ──────────────────────────────────────────────────────────── */
function isPrintable(b) {
    return (b >= 0x20 && b <= 0x7e) || b === 0x09 || b === 0x0a || b === 0x0d;
}

function extractAscii(bytes, minLen) {
    var results = [];
    var start = -1;
    for (var i = 0; i <= bytes.length; i++) {
        var b = i < bytes.length ? bytes[i] : -1;
        if (b !== -1 && isPrintable(b)) {
            if (start === -1) start = i;
        } else {
            if (start !== -1) {
                var len = i - start;
                if (len >= minLen) {
                    var s = '';
                    for (var k = start; k < i; k++) s += String.fromCharCode(bytes[k]);
                    results.push({ offset: start, len: len, str: s, enc: 'ASCII' });
                }
                start = -1;
            }
        }
    }
    return results;
}

function extractUtf16Le(bytes, minLen) {
    var results = [];
    var start = -1;
    var i = 0;
    while (i <= bytes.length - 1) {
        // Align to even offset for UTF-16 LE pairs
        if (i % 2 !== 0) { i++; continue; }
        if (i + 1 < bytes.length) {
            var lo = bytes[i];
            var hi = bytes[i + 1];
            if (isPrintable(lo) && hi === 0x00) {
                if (start === -1) start = i;
                i += 2;
                continue;
            }
        }
        if (start !== -1) {
            var charCount = (i - start) / 2;
            if (charCount >= minLen) {
                var s = '';
                for (var k = start; k < i; k += 2) s += String.fromCharCode(bytes[k]);
                results.push({ offset: start, len: charCount, str: s, enc: 'UTF-16LE' });
            }
            start = -1;
        }
        i += 2;
    }
    return results;
}

/* ── State ───────────────────────────────────────────────────────────────── */
var g_allStrings   = [];
var g_currentFile  = null;

/* ── Render ──────────────────────────────────────────────────────────────── */
var DISPLAY_LIMIT = 1000;

function renderRows(strings) {
    var filter = document.getElementById('filterInput').value.toLowerCase();
    var filtered = filter
        ? strings.filter(function (s) { return s.str.toLowerCase().includes(filter); })
        : strings;

    var shown   = filtered.slice(0, DISPLAY_LIMIT);
    var tbody   = document.getElementById('stringsBody');
    var noRes   = document.getElementById('noResults');
    var trunc   = document.getElementById('truncNotice');

    if (!filtered.length) {
        tbody.innerHTML = '';
        noRes.style.display = '';
        trunc.style.display = 'none';
        return;
    }
    noRes.style.display = 'none';

    if (filtered.length > DISPLAY_LIMIT) {
        trunc.style.display = '';
        trunc.textContent   = 'Showing first ' + DISPLAY_LIMIT.toLocaleString() + ' of ' + filtered.length.toLocaleString() + ' matches.';
    } else {
        trunc.style.display = 'none';
    }

    var rows = shown.map(function (s) {
        var cls   = classifyString(s.str);
        var color = CLASS_COLOR[cls];
        var cellStyle = color ? 'color:' + color + ';' : 'color:var(--text);';
        var encBadge = s.enc === 'UTF-16LE'
            ? '<span style="margin-left:5px;background:color-mix(in srgb,var(--accent-2) 15%,var(--surface));color:var(--accent-2);border-radius:3px;padding:1px 5px;font-size:10px;">UTF-16</span>'
            : '';
        return '<tr style="border-bottom:1px solid var(--border);">'
             + '<td style="padding:4px 12px;white-space:nowrap;color:var(--text-muted);">0x' + s.offset.toString(16).padStart(8, '0') + '</td>'
             + '<td style="padding:4px 12px;white-space:nowrap;color:var(--text-muted);">' + s.len + '</td>'
             + '<td style="padding:4px 12px;word-break:break-all;' + cellStyle + '">' + escHtml(s.str) + encBadge + '</td>'
             + '</tr>';
    });
    tbody.innerHTML = rows.join('');
}

function updateStats(strings, file) {
    var maxLen = 0;
    strings.forEach(function (s) { if (s.len > maxLen) maxLen = s.len; });
    var sizeStr = file ? (file.size >= 1048576
        ? (file.size / 1048576).toFixed(2) + ' MB'
        : (file.size / 1024).toFixed(1) + ' KB') : '';
    document.getElementById('statsBar').textContent =
        strings.length.toLocaleString() + ' strings found'
        + (maxLen ? '  |  Longest: ' + maxLen + ' chars' : '')
        + (sizeStr ? '  |  File: ' + sizeStr : '');
}

/* ── Processing pipeline ─────────────────────────────────────────────────── */
var CHUNK = 1024 * 512; // 512 KB chunks for progress feedback

function runExtraction(buffer, file) {
    var minLen  = Math.max(3, Math.min(20, parseInt(document.getElementById('minLen').value, 10) || 4));
    var modeEl  = document.querySelector('input[name="strMode"]:checked');
    var unicode = modeEl && modeEl.value === 'unicode';

    var bytes   = new Uint8Array(buffer);
    var prog    = document.getElementById('progressBar');
    var fill    = document.getElementById('progressFill');
    var label   = document.getElementById('progressLabel');

    prog.style.display = '';
    fill.style.width   = '0%';
    label.textContent  = 'Extracting strings…';

    // For large files, show progress via chunked setTimeout
    // But extraction itself must see the full buffer, so we do it in one pass
    // and just update the progress bar visually
    var asciiStrings   = [];
    var unicodeStrings = [];

    function step1() {
        asciiStrings = extractAscii(bytes, minLen);
        fill.style.width = unicode ? '50%' : '90%';
        label.textContent = unicode ? 'Extracting UTF-16 strings…' : 'Rendering…';
        setTimeout(unicode ? step2 : finish, 0);
    }

    function step2() {
        unicodeStrings = extractUtf16Le(bytes, minLen);
        fill.style.width = '90%';
        label.textContent = 'Rendering…';
        setTimeout(finish, 0);
    }

    function finish() {
        var all = asciiStrings.concat(unicodeStrings);
        // Sort by offset
        all.sort(function (a, b) { return a.offset - b.offset; });

        g_allStrings = all;
        g_currentFile = file;

        fill.style.width = '100%';
        prog.style.display = 'none';

        updateStats(all, file);
        renderRows(all);

        document.getElementById('resultWrapper').style.display = '';
        document.getElementById('resultWrapper').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    setTimeout(step1, 0);
}

function processFile(file) {
    var infoEl = document.getElementById('fileInfo');
    infoEl.textContent = file.name + ' (' + (file.size >= 1048576
        ? (file.size / 1048576).toFixed(2) + ' MB'
        : (file.size / 1024).toFixed(1) + ' KB') + ')';

    var btn = document.getElementById('extractBtn');
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.pointerEvents = '';

    var reader = new FileReader();
    reader.onload = function (e) { runExtraction(e.target.result, file); };
    reader.readAsArrayBuffer(file);
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('resultWrapper').style.display = 'none';
    document.getElementById('progressBar').style.display  = 'none';

    // Drop zone
    var zone = document.getElementById('dropZone');
    var inp  = document.getElementById('fileInput');

    inp.addEventListener('change', function () {
        if (this.files[0]) { g_currentFile = this.files[0]; processFile(this.files[0]); }
    });

    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        zone.style.borderColor = 'var(--accent)';
        zone.style.background  = 'color-mix(in srgb,var(--accent) 5%,var(--surface))';
    });
    zone.addEventListener('dragleave', function () {
        zone.style.borderColor = 'var(--border)';
        zone.style.background  = '';
    });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.style.borderColor = 'var(--border)';
        zone.style.background  = '';
        if (e.dataTransfer.files[0]) { g_currentFile = e.dataTransfer.files[0]; processFile(e.dataTransfer.files[0]); }
    });

    // Extract button (re-run with current options)
    document.getElementById('extractBtn').addEventListener('click', function () {
        if (g_currentFile) processFile(g_currentFile);
    });

    // Live filter
    document.getElementById('filterInput').addEventListener('input', function () {
        if (g_allStrings.length) renderRows(g_allStrings);
    });

    // Copy all
    document.getElementById('copyAllBtn').addEventListener('click', function () {
        var filter = document.getElementById('filterInput').value.toLowerCase();
        var toExport = filter
            ? g_allStrings.filter(function (s) { return s.str.toLowerCase().includes(filter); })
            : g_allStrings;
        var text = toExport.map(function (s) { return s.str; }).join('\n');
        if (!text) return;
        navigator.clipboard.writeText(text).then(function () {
            var btn = document.getElementById('copyAllBtn');
            var orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(function () { btn.textContent = orig; }, 1500);
        }).catch(function () {
            // Fallback for non-https / older browsers
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity  = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        });
    });
});
