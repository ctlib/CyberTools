/* ============================================================
   XOR Cipher — script.js
   Multi-byte key, hex/text/base64 I/O, key analyzer
   ============================================================ */

function strToBytes(s) {
    return Array.from(new TextEncoder().encode(s));
}
function bytesToStr(arr) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(arr)); }
    catch (e) { return null; }
}
function bytesToHex(arr) {
    return arr.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}
function hexToBytes(hex) {
    hex = hex.replace(/\s/g, '');
    if (hex.length % 2) throw new Error('Hex string must have even length');
    var arr = [];
    for (var i = 0; i < hex.length; i += 2) arr.push(parseInt(hex.substr(i, 2), 16));
    return arr;
}
function base64ToBytes(b64) {
    var bin = atob(b64.replace(/\s/g, ''));
    return Array.from(bin).map(function (c) { return c.charCodeAt(0); });
}
function bytesToBase64(arr) {
    return btoa(String.fromCharCode.apply(null, arr));
}

function xorBytes(data, key) {
    return data.map(function (b, i) { return b ^ key[i % key.length]; });
}

function getInputBytes() {
    var val   = document.getElementById('xorInput').value;
    var fmt   = document.querySelector('input[name="inputFmt"]:checked').value;
    if (fmt === 'text') return strToBytes(val);
    if (fmt === 'hex')  return hexToBytes(val);
    if (fmt === 'b64')  return base64ToBytes(val);
}
function getKeyBytes() {
    var val = document.getElementById('xorKey').value;
    var fmt = document.querySelector('input[name="keyFmt"]:checked').value;
    if (!val) throw new Error('Enter a key');
    if (fmt === 'text') return strToBytes(val);
    if (fmt === 'hex')  return hexToBytes(val);
}
function setOutput(bytes) {
    var fmt = document.querySelector('input[name="outputFmt"]:checked').value;
    var ta  = document.getElementById('xorOutput');
    if (fmt === 'text') {
        var s = bytesToStr(bytes);
        ta.value = s !== null ? s : '[Non-UTF-8 output — switch output to Hex or Base64]';
    } else if (fmt === 'hex') {
        ta.value = bytesToHex(bytes);
    } else {
        ta.value = bytesToBase64(bytes);
    }
}

function runXOR() {
    var errEl = document.getElementById('xorError');
    errEl.textContent = '';
    try {
        var data = getInputBytes();
        var key  = getKeyBytes();
        var result = xorBytes(data, key);
        setOutput(result);
        analyzeKey(key, data, result);
    } catch (e) {
        errEl.textContent = e.message;
        document.getElementById('xorOutput').value = '';
    }
}

/* ---- Key Analyzer ---- */
function analyzeKey(key, plainBytes, cipherBytes) {
    var wrap = document.getElementById('analyzerWrap');
    wrap.style.display = '';

    document.getElementById('keyHex').textContent = bytesToHex(key);
    document.getElementById('keyLen').textContent = key.length + ' byte' + (key.length !== 1 ? 's' : '');
    document.getElementById('keyEntropy').textContent = shannonEntropy(key).toFixed(2) + ' bits/byte';

    // Byte frequency chart
    var freq = new Array(256).fill(0);
    cipherBytes.forEach(function (b) { freq[b]++; });
    var max = Math.max.apply(null, freq.filter(function (v) { return v > 0; }));
    var topBytes = freq.map(function (c, i) { return { byte: i, count: c }; })
        .filter(function (x) { return x.count > 0; })
        .sort(function (a, b) { return b.count - a.count; })
        .slice(0, 16);

    var bars = topBytes.map(function (x) {
        var pct = Math.round((x.count / max) * 80);
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">' +
            '<span style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text-muted);width:28px;">0x' + x.byte.toString(16).padStart(2,'0') + '</span>' +
            '<div style="height:10px;width:' + pct + '%;background:var(--accent);border-radius:2px;min-width:2px;"></div>' +
            '<span style="font-size:11px;color:var(--text-muted);">' + x.count + '</span></div>';
    }).join('');
    document.getElementById('freqChart').innerHTML = bars;
}

function shannonEntropy(bytes) {
    if (!bytes.length) return 0;
    var freq = new Array(256).fill(0);
    bytes.forEach(function (b) { freq[b]++; });
    var e = 0;
    freq.forEach(function (c) {
        if (c > 0) { var p = c / bytes.length; e -= p * Math.log2(p); }
    });
    return e;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('xorBtn').addEventListener('click', runXOR);
    document.getElementById('xorInput').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') runXOR();
    });
    document.getElementById('analyzerWrap').style.display = 'none';
});
