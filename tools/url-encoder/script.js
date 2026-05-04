/* ============================================================
   URL Encoder/Decoder — script.js
   ============================================================ */

function encodeURL() {
    var input = document.getElementById('urlInput').value;
    var mode = document.querySelector('input[name="encodeMode"]:checked').value;
    var output = document.getElementById('urlOutput');
    try {
        if (mode === 'full') {
            output.value = encodeURIComponent(input);
        } else if (mode === 'partial') {
            output.value = encodeURI(input);
        } else if (mode === 'double') {
            output.value = encodeURIComponent(encodeURIComponent(input));
        } else if (mode === 'form') {
            output.value = encodeURIComponent(input).replace(/%20/g, '+');
        }
    } catch (e) {
        output.value = 'Error: ' + e.message;
    }
}

function decodeURL() {
    var input = document.getElementById('urlDecInput').value;
    var output = document.getElementById('urlDecOutput');
    try {
        var decoded = input.replace(/\+/g, ' ');
        var prev;
        do {
            prev = decoded;
            decoded = decodeURIComponent(decoded);
        } while (decoded !== prev && decoded.indexOf('%') !== -1);
        output.value = decoded;
    } catch (e) {
        output.value = 'Error: ' + e.message;
    }
}

function parseQueryString() {
    var input = document.getElementById('qsInput').value.trim();
    var tbody = document.getElementById('qsTable');
    tbody.innerHTML = '';
    if (!input) return;

    var qs = input.startsWith('?') ? input.slice(1) : input;
    var parts = qs.split('&');
    parts.forEach(function (part) {
        var idx = part.indexOf('=');
        var key = idx === -1 ? part : part.slice(0, idx);
        var val = idx === -1 ? '' : part.slice(idx + 1);
        try { key = decodeURIComponent(key.replace(/\+/g, ' ')); } catch (e) {}
        try { val = decodeURIComponent(val.replace(/\+/g, ' ')); } catch (e) {}
        var tr = document.createElement('tr');
        var escKey = document.createTextNode(key);
        var escVal = document.createTextNode(val);
        var tdKey = document.createElement('td');
        var tdVal = document.createElement('td');
        tdKey.style.cssText = 'padding:8px 12px;border-bottom:1px solid var(--border);font-family:JetBrains Mono,monospace;font-size:12px;color:var(--accent2);';
        tdVal.style.cssText = 'padding:8px 12px;border-bottom:1px solid var(--border);font-family:JetBrains Mono,monospace;font-size:12px;word-break:break-all;';
        tdKey.appendChild(escKey);
        tdVal.appendChild(escVal);
        tr.appendChild(tdKey);
        tr.appendChild(tdVal);
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('encodeBtn').addEventListener('click', encodeURL);
    document.getElementById('decodeBtn').addEventListener('click', decodeURL);
    document.getElementById('parseQSBtn').addEventListener('click', parseQueryString);

    document.getElementById('urlInput').addEventListener('input', function () {
        if (this.value) encodeURL();
    });
    document.getElementById('urlDecInput').addEventListener('input', function () {
        if (this.value) decodeURL();
    });
});
