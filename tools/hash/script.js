/* ============================================================
   Hash Suite — script.js
   Algorithms: MD5 (pure JS), SHA-1/224/256/384/512 (WebCrypto),
               HMAC (WebCrypto), File hash (FileReader + WebCrypto)
   ============================================================ */

/* ---- MD5 (Paul Johnston, BSD-licensed, pure JS) ---- */
(function () {
    function safeAdd(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function bitRol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
    function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
    function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
    function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

    function binlMD5(x, len) {
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var i, olda, oldb, oldc, oldd,
            a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
        for (i = 0; i < x.length; i += 16) {
            olda = a; oldb = b; oldc = c; oldd = d;
            a = md5ff(a, b, c, d, x[i], 7, -680876936);
            d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5gg(b, c, d, a, x[i], 20, -373897302);
            a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5hh(d, a, b, c, x[i], 11, -358537222);
            c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = md5ii(a, b, c, d, x[i], 6, -198630844);
            d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = safeAdd(a, olda); b = safeAdd(b, oldb);
            c = safeAdd(c, oldc); d = safeAdd(d, oldd);
        }
        return [a, b, c, d];
    }

    function binl2hex(binarray) {
        var hexTab = '0123456789abcdef', str = '';
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                   hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
        }
        return str;
    }

    function str2binl(str) {
        var bin = [], mask = (1 << 8) - 1;
        for (var i = 0; i < str.length * 8; i += 8)
            bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
        return bin;
    }

    function rstr2binl(input) {
        var output = new Array(input.length >> 2);
        for (var i = 0; i < output.length; i++) output[i] = 0;
        for (var i = 0; i < input.length * 8; i += 8)
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        return output;
    }

    window.computeMD5 = function (str) {
        var utf8 = unescape(encodeURIComponent(str));
        return binl2hex(binlMD5(rstr2binl(utf8), utf8.length * 8));
    };
})();

/* ---- WebCrypto helpers ---- */
async function digestSHA(algorithm, str) {
    var enc = new TextEncoder();
    var buf = await crypto.subtle.digest(algorithm, enc.encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function digestSHABuffer(algorithm, buffer) {
    var buf = await crypto.subtle.digest(algorithm, buffer);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function computeHMAC(algorithm, keyStr, msgStr) {
    var enc = new TextEncoder();
    var keyBuf = enc.encode(keyStr);
    var msgBuf = enc.encode(msgStr);
    var cryptoKey = await crypto.subtle.importKey(
        'raw', keyBuf,
        { name: 'HMAC', hash: { name: algorithm } },
        false, ['sign']
    );
    var sig = await crypto.subtle.sign('HMAC', cryptoKey, msgBuf);
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ---- UI helpers ---- */
function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderHashRow(algo, hash) {
    return `<tr>
        <td class="hash-algo-cell">${escHtml(algo)}</td>
        <td class="hash-value-cell"><span class="hash-value-text">${escHtml(hash)}</span></td>
        <td class="hash-copy-cell"><button class="output-copy-btn" onclick="CyberTools.copyText('${escHtml(hash)}',this)">Copy</button></td>
    </tr>`;
}

function renderHashError(algo, msg) {
    return `<tr>
        <td class="hash-algo-cell">${escHtml(algo)}</td>
        <td class="hash-value-cell" colspan="2" style="color:var(--danger);font-size:12px;">${escHtml(msg)}</td>
    </tr>`;
}

function setResultState(tableEl, state) {
    var wrapper = document.getElementById('hashResultWrapper');
    if (state === 'empty') {
        wrapper.style.display = 'none';
    } else {
        wrapper.style.display = '';
    }
}

/* ---- Text hash ---- */
var ALGORITHMS = [
    { id: 'md5',    label: 'MD5',     fn: async s => computeMD5(s) },
    { id: 'sha1',   label: 'SHA-1',   fn: s => digestSHA('SHA-1', s) },
    { id: 'sha256', label: 'SHA-256', fn: s => digestSHA('SHA-256', s) },
    { id: 'sha384', label: 'SHA-384', fn: s => digestSHA('SHA-384', s) },
    { id: 'sha512', label: 'SHA-512', fn: s => digestSHA('SHA-512', s) },
];

async function runTextHash() {
    var input = document.getElementById('hashInput').value;
    var tableBody = document.getElementById('hashTableBody');
    var btn = document.getElementById('hashBtn');

    if (!input) {
        tableBody.innerHTML = '';
        setResultState(null, 'empty');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Hashing…';
    setResultState(null, 'show');
    tableBody.innerHTML = ALGORITHMS.map(a => `<tr><td class="hash-algo-cell">${escHtml(a.label)}</td><td class="hash-value-cell" colspan="2" style="color:var(--text-muted);font-style:italic;">computing…</td></tr>`).join('');

    var rows = await Promise.all(
        ALGORITHMS.map(async a => {
            try {
                var hash = await a.fn(input);
                return renderHashRow(a.label, hash);
            } catch (e) {
                return renderHashError(a.label, e.message || 'Error');
            }
        })
    );
    tableBody.innerHTML = rows.join('');
    btn.disabled = false;
    btn.textContent = 'Hash';
}

/* ---- HMAC ---- */
async function runHMAC() {
    var msg = document.getElementById('hmacMsg').value;
    var key = document.getElementById('hmacKey').value;
    var algo = document.getElementById('hmacAlgo').value;
    var out  = document.getElementById('hmacOutput');
    var btn  = document.getElementById('hmacBtn');

    if (!msg || !key) {
        out.value = '';
        return;
    }

    var algoMap = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512' };
    var cryptoAlgo = algoMap[algo] || 'SHA-256';

    btn.disabled = true;
    btn.textContent = 'Computing…';
    try {
        var result = await computeHMAC(cryptoAlgo, key, msg);
        out.value = result;
    } catch (e) {
        out.value = 'Error: ' + (e.message || e);
    }
    btn.disabled = false;
    btn.textContent = 'Compute HMAC';
}

/* ---- File hash ---- */
var fileHashAlgos = [
    { id: 'md5',    label: 'MD5' },
    { id: 'sha1',   label: 'SHA-1' },
    { id: 'sha256', label: 'SHA-256' },
    { id: 'sha384', label: 'SHA-384' },
    { id: 'sha512', label: 'SHA-512' },
];

async function hashFileBuffer(buffer) {
    var tableBody = document.getElementById('fileHashTableBody');
    document.getElementById('fileHashWrapper').style.display = '';
    tableBody.innerHTML = fileHashAlgos.map(a => `<tr><td class="hash-algo-cell">${escHtml(a.label)}</td><td class="hash-value-cell" colspan="2" style="color:var(--text-muted);font-style:italic;">computing…</td></tr>`).join('');

    var rows = await Promise.all(fileHashAlgos.map(async a => {
        try {
            var hash = a.id === 'md5'
                ? computeMD5(String.fromCharCode.apply(null, new Uint8Array(buffer)))
                : await digestSHABuffer(a.label.replace('SHA-', 'SHA-'), buffer);
            return renderHashRow(a.label, hash);
        } catch (e) {
            return renderHashError(a.label, e.message || 'Error');
        }
    }));
    tableBody.innerHTML = rows.join('');
}

function setupFileDrop() {
    var zone = document.getElementById('fileDropZone');
    var input = document.getElementById('fileHashInput');
    var info = document.getElementById('fileInfo');

    function processFile(file) {
        if (!file) return;
        info.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
        var reader = new FileReader();
        reader.onload = function (e) { hashFileBuffer(e.target.result); };
        reader.readAsArrayBuffer(file);
    }

    zone.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { processFile(this.files[0]); });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        processFile(e.dataTransfer.files[0]);
    });
}

/* ---- Compare section ---- */
function runCompare() {
    var a = document.getElementById('compareA').value.trim().toLowerCase();
    var b = document.getElementById('compareB').value.trim().toLowerCase();
    var result = document.getElementById('compareResult');
    if (!a || !b) { result.textContent = ''; result.className = ''; return; }
    if (a === b) {
        result.textContent = 'Match — hashes are identical';
        result.style.color = 'var(--success)';
    } else {
        result.textContent = 'No match — hashes differ';
        result.style.color = 'var(--danger)';
    }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('hashBtn').addEventListener('click', runTextHash);
    document.getElementById('hashInput').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') runTextHash();
    });
    document.getElementById('hmacBtn').addEventListener('click', runHMAC);
    document.getElementById('compareA').addEventListener('input', runCompare);
    document.getElementById('compareB').addEventListener('input', runCompare);

    document.getElementById('hashResultWrapper').style.display = 'none';
    document.getElementById('fileHashWrapper').style.display = 'none';

    setupFileDrop();
});
