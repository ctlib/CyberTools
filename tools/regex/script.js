/* ============================================================
   Regex Tester — script.js
   Live highlighting, match groups, replace mode, flags
   ============================================================ */

var lastPattern = null;
var lastFlags = '';

function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getFlags() {
    var f = '';
    if (document.getElementById('flagG').checked) f += 'g';
    if (document.getElementById('flagI').checked) f += 'i';
    if (document.getElementById('flagM').checked) f += 'm';
    if (document.getElementById('flagS').checked) f += 's';
    return f;
}

function buildRegex(pattern, flags) {
    try { return new RegExp(pattern, flags); }
    catch (e) { return null; }
}

function runTest() {
    var pattern = document.getElementById('regexInput').value;
    var text    = document.getElementById('testInput').value;
    var flags   = getFlags();
    var statusEl = document.getElementById('regexStatus');
    var matchCount = document.getElementById('matchCount');
    var highlightEl = document.getElementById('highlightOutput');
    var groupsEl  = document.getElementById('groupsOutput');

    if (!pattern) {
        highlightEl.innerHTML = escHtml(text);
        matchCount.textContent = '';
        groupsEl.innerHTML = '';
        statusEl.textContent = '';
        return;
    }

    var re = buildRegex(pattern, flags);
    if (!re) {
        statusEl.textContent = 'Invalid regular expression';
        statusEl.style.color = 'var(--danger)';
        highlightEl.innerHTML = escHtml(text);
        matchCount.textContent = '';
        groupsEl.innerHTML = '';
        return;
    }
    statusEl.textContent = 'Valid';
    statusEl.style.color = 'var(--success)';

    // Highlight matches
    var matches = [];
    var m;
    if (flags.includes('g')) {
        re.lastIndex = 0;
        while ((m = re.exec(text)) !== null) {
            matches.push(m);
            if (m[0].length === 0) re.lastIndex++;
        }
    } else {
        m = re.exec(text);
        if (m) matches.push(m);
    }

    matchCount.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '');

    // Build highlighted HTML
    var html = '';
    var last = 0;
    var colors = ['var(--accent)', 'var(--accent-2)', 'var(--warning)', 'var(--success)'];
    matches.forEach(function (match, i) {
        var start = match.index;
        var end   = start + match[0].length;
        html += escHtml(text.slice(last, start));
        html += '<mark style="background:' + colors[i % colors.length] + '33;color:inherit;border-radius:2px;outline:1px solid ' + colors[i % colors.length] + ';">' + escHtml(match[0]) + '</mark>';
        last = end;
    });
    html += escHtml(text.slice(last));
    highlightEl.innerHTML = html;

    // Groups table
    if (matches.length === 0) {
        groupsEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:12px;">No matches</div>';
        return;
    }

    var rows = '';
    matches.forEach(function (match, i) {
        rows += '<tr style="border-bottom:1px solid var(--border);">';
        rows += '<td style="padding:6px 12px;font-size:12px;color:var(--text-muted);">' + (i + 1) + '</td>';
        rows += '<td style="padding:6px 12px;font-family:JetBrains Mono,monospace;font-size:12px;">' + escHtml(match[0]) + '</td>';
        rows += '<td style="padding:6px 12px;font-size:12px;color:var(--text-muted);">' + match.index + '–' + (match.index + match[0].length) + '</td>';
        var groups = '';
        for (var g = 1; g < match.length; g++) {
            groups += '<span style="display:inline-block;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:1px 6px;font-family:JetBrains Mono,monospace;font-size:11px;margin:1px;">' +
                'G' + g + ': ' + (match[g] !== undefined ? escHtml(match[g]) : '<em>undefined</em>') + '</span>';
        }
        rows += '<td style="padding:6px 12px;">' + (groups || '<span style="color:var(--text-muted);font-size:12px;">—</span>') + '</td>';
        rows += '</tr>';
    });
    groupsEl.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
        '<thead><tr style="border-bottom:1px solid var(--border);"><th style="text-align:left;padding:6px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">#</th>' +
        '<th style="text-align:left;padding:6px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Match</th>' +
        '<th style="text-align:left;padding:6px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Range</th>' +
        '<th style="text-align:left;padding:6px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Groups</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>';
}

function runReplace() {
    var pattern = document.getElementById('regexInput').value;
    var text    = document.getElementById('testInput').value;
    var repl    = document.getElementById('replaceInput').value;
    var flags   = getFlags();
    var out     = document.getElementById('replaceOutput');

    if (!pattern) { out.value = text; return; }
    var re = buildRegex(pattern, flags);
    if (!re) { out.value = 'Invalid pattern'; return; }
    out.value = text.replace(re, repl);
}

function loadExample(pattern, flags, text) {
    document.getElementById('regexInput').value = pattern;
    document.getElementById('testInput').value = text;
    document.getElementById('flagG').checked = flags.includes('g');
    document.getElementById('flagI').checked = flags.includes('i');
    document.getElementById('flagM').checked = flags.includes('m');
    runTest();
}

document.addEventListener('DOMContentLoaded', function () {
    var inputs = ['regexInput', 'testInput', 'flagG', 'flagI', 'flagM', 'flagS'];
    inputs.forEach(function (id) {
        document.getElementById(id).addEventListener('input', runTest);
        document.getElementById(id).addEventListener('change', runTest);
    });
    document.getElementById('replaceBtn').addEventListener('click', runReplace);
    document.getElementById('replaceInput').addEventListener('input', function () {
        if (document.getElementById('replaceOutput').value) runReplace();
    });
});
