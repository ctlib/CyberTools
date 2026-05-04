/* ============================================================
   JSON Formatter/Validator — script.js
   ============================================================ */

function getIndent() {
    var v = document.querySelector('input[name="indent"]:checked').value;
    return v === 'tab' ? '\t' : parseInt(v, 10);
}

function formatJSON() {
    var input = document.getElementById('jsonInput').value;
    var output = document.getElementById('jsonOutput');
    var statusEl = document.getElementById('jsonStatus');

    if (!input.trim()) {
        output.value = '';
        setStatus('', '');
        return;
    }

    try {
        var parsed = JSON.parse(input);
        var indent = getIndent();
        output.value = JSON.stringify(parsed, null, indent);
        var stats = getStats(parsed);
        setStatus('valid', 'Valid JSON — ' + stats);
    } catch (e) {
        output.value = '';
        setStatus('error', 'Invalid JSON: ' + e.message);
    }
}

function minifyJSON() {
    var input = document.getElementById('jsonInput').value;
    var output = document.getElementById('jsonOutput');
    try {
        output.value = JSON.stringify(JSON.parse(input));
        setStatus('valid', 'Minified');
    } catch (e) {
        output.value = '';
        setStatus('error', 'Invalid JSON: ' + e.message);
    }
}

function sortKeysJSON() {
    var input = document.getElementById('jsonInput').value;
    var output = document.getElementById('jsonOutput');
    try {
        var parsed = JSON.parse(input);
        var indent = getIndent();
        output.value = JSON.stringify(sortKeys(parsed), null, indent);
        setStatus('valid', 'Keys sorted alphabetically');
    } catch (e) {
        output.value = '';
        setStatus('error', 'Invalid JSON: ' + e.message);
    }
}

function sortKeys(obj) {
    if (Array.isArray(obj)) return obj.map(sortKeys);
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).sort().reduce(function (acc, k) {
            acc[k] = sortKeys(obj[k]);
            return acc;
        }, {});
    }
    return obj;
}

function getStats(obj) {
    var keys = 0, depth = 0;
    function walk(o, d) {
        if (d > depth) depth = d;
        if (Array.isArray(o)) {
            o.forEach(function (v) { walk(v, d + 1); });
        } else if (o !== null && typeof o === 'object') {
            Object.keys(o).forEach(function (k) { keys++; walk(o[k], d + 1); });
        }
    }
    walk(obj, 0);
    return keys + ' keys, depth ' + depth;
}

function setStatus(type, msg) {
    var el = document.getElementById('jsonStatus');
    el.textContent = msg;
    el.style.color = type === 'error' ? 'var(--danger)' : type === 'valid' ? 'var(--success)' : 'var(--text-muted)';
}

function escapeForString(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('formatBtn').addEventListener('click', formatJSON);
    document.getElementById('minifyBtn').addEventListener('click', minifyJSON);
    document.getElementById('sortBtn').addEventListener('click', sortKeysJSON);
    document.getElementById('clearBtn').addEventListener('click', function () {
        document.getElementById('jsonInput').value = '';
        document.getElementById('jsonOutput').value = '';
        setStatus('', '');
    });
    document.getElementById('useOutputBtn').addEventListener('click', function () {
        var out = document.getElementById('jsonOutput').value;
        if (out) { document.getElementById('jsonInput').value = out; formatJSON(); }
    });

    document.getElementById('jsonInput').addEventListener('input', function () {
        if (this.value) formatJSON();
        else { document.getElementById('jsonOutput').value = ''; setStatus('', ''); }
    });
});
