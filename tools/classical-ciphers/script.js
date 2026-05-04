/* ============================================================
   Classical Ciphers — script.js
   Atbash, Affine, A1Z26, Polybius, Rail Fence, Beaufort
   ============================================================ */

/* ---------- Tab switching ---------- */

function switchCCTab(name) {
    var tabNames = ['atbash', 'affine', 'a1z26', 'polybius', 'railfence', 'beaufort'];
    document.querySelectorAll('.cc-tab').forEach(function (el, i) {
        el.classList.toggle('active', tabNames[i] === name);
    });
    document.querySelectorAll('.cc-panel').forEach(function (el) {
        el.classList.remove('active');
    });
    document.getElementById('panel-' + name).classList.add('active');
}

/* ---------- Atbash ---------- */

function runAtbash(mode) {
    var input = document.getElementById('atbashInput').value;
    document.getElementById('atbashError').textContent = '';
    if (!input.trim()) { document.getElementById('atbashError').textContent = 'Enter some text.'; return; }
    var result = input.split('').map(function (ch) {
        var u = ch.toUpperCase().charCodeAt(0);
        if (u >= 65 && u <= 90) {
            var mirrored = 90 - (u - 65);
            return ch === ch.toUpperCase() ? String.fromCharCode(mirrored) : String.fromCharCode(mirrored + 32);
        }
        return ch;
    }).join('');
    document.getElementById('atbashOutput').value = result;
}

/* ---------- Affine ---------- */

// Modular inverse using extended Euclidean algorithm
function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (var x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return null;
}

function runAffine(mode) {
    var input = document.getElementById('affineInput').value;
    var errEl = document.getElementById('affineError');
    errEl.textContent = '';
    var a = parseInt(document.getElementById('affineA').value, 10);
    var b = parseInt(document.getElementById('affineB').value, 10);
    b = ((b % 26) + 26) % 26;

    if (!input.trim()) { errEl.textContent = 'Enter some text.'; return; }

    var aInv = modInverse(a, 26);
    if (aInv === null) { errEl.textContent = 'a=' + a + ' has no inverse mod 26. Choose a coprime to 26.'; return; }

    var result = input.split('').map(function (ch) {
        var isUpper = ch >= 'A' && ch <= 'Z';
        var isLower = ch >= 'a' && ch <= 'z';
        if (!isUpper && !isLower) return ch;
        var x = ch.toUpperCase().charCodeAt(0) - 65;
        var y;
        if (mode === 'encode') {
            y = (a * x + b) % 26;
        } else {
            y = (aInv * (x - b + 26)) % 26;
        }
        return isUpper ? String.fromCharCode(y + 65) : String.fromCharCode(y + 97);
    }).join('');
    document.getElementById('affineOutput').value = result;
}

/* ---------- A1Z26 ---------- */

function runA1Z26(mode) {
    var input = document.getElementById('a1z26Input').value.trim();
    var errEl = document.getElementById('a1z26Error');
    errEl.textContent = '';
    if (!input) { errEl.textContent = 'Enter some text.'; return; }

    var result;
    if (mode === 'encode') {
        // Letters → numbers separated by hyphens, words by " / "
        result = input.toUpperCase().split('').map(function (ch) {
            if (ch === ' ') return '/';
            var code = ch.charCodeAt(0);
            if (code >= 65 && code <= 90) return (code - 64).toString();
            return ch;
        }).join('-').replace(/-\/-/g, ' / ').replace(/^-+|-+$/g, '');
    } else {
        // Numbers → letters
        // Replace " / " with placeholder, split by -, convert
        var normalized = input.replace(/\s*\/\s*/g, ' SLASH ');
        var parts = normalized.split(/[-\s]+/);
        result = parts.map(function (p) {
            if (p === 'SLASH') return ' ';
            var n = parseInt(p, 10);
            if (isNaN(n) || n < 1 || n > 26) {
                errEl.textContent = 'Invalid value "' + p + '": must be 1–26.';
                return '?';
            }
            return String.fromCharCode(n + 64);
        }).join('');
    }
    document.getElementById('a1z26Output').value = result;
}

/* ---------- Polybius ---------- */

var POLYBIUS_SQUARE = [
    ['A','B','C','D','E'],
    ['F','G','H','I','K'],
    ['L','M','N','O','P'],
    ['Q','R','S','T','U'],
    ['V','W','X','Y','Z']
];

function buildPolybiusGrid() {
    var grid = document.getElementById('polybiusGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Header row (col labels)
    grid.appendChild(Object.assign(document.createElement('div'), { className: 'cell header' })); // corner
    for (var c = 1; c <= 5; c++) {
        var h = document.createElement('div');
        h.className = 'cell header';
        h.textContent = c;
        grid.appendChild(h);
    }
    // Letter rows
    for (var r = 0; r < 5; r++) {
        var rh = document.createElement('div');
        rh.className = 'cell header';
        rh.textContent = r + 1;
        grid.appendChild(rh);
        for (var cc = 0; cc < 5; cc++) {
            var lc = document.createElement('div');
            lc.className = 'cell letter-cell';
            lc.textContent = POLYBIUS_SQUARE[r][cc];
            grid.appendChild(lc);
        }
    }
}

function polybiusEncode(text) {
    return text.toUpperCase().split('').map(function (ch) {
        if (ch === ' ') return '/';
        if (ch === 'J') ch = 'I';
        for (var r = 0; r < 5; r++) {
            for (var c = 0; c < 5; c++) {
                if (POLYBIUS_SQUARE[r][c] === ch) return (r + 1).toString() + (c + 1).toString();
            }
        }
        return ch; // non-alpha passthrough
    }).join(' ');
}

function polybiusDecode(text) {
    var parts = text.trim().split(/\s+/);
    return parts.map(function (p) {
        if (p === '/') return ' ';
        if (/^\d{2}$/.test(p)) {
            var r = parseInt(p[0], 10) - 1;
            var c = parseInt(p[1], 10) - 1;
            if (r >= 0 && r < 5 && c >= 0 && c < 5) return POLYBIUS_SQUARE[r][c];
        }
        return p;
    }).join('');
}

function runPolybius(mode) {
    var input = document.getElementById('polybiusInput').value;
    var errEl = document.getElementById('polybiusError');
    errEl.textContent = '';
    if (!input.trim()) { errEl.textContent = 'Enter some text.'; return; }
    try {
        var result = mode === 'encode' ? polybiusEncode(input) : polybiusDecode(input);
        document.getElementById('polybiusOutput').value = result;
    } catch (e) {
        errEl.textContent = e.message;
    }
}

/* ---------- Rail Fence ---------- */

function railFenceEncode(text, rails) {
    if (rails < 2) throw new Error('Need at least 2 rails.');
    var fence = [];
    for (var i = 0; i < rails; i++) fence.push([]);
    var rail = 0, dir = 1;
    for (var j = 0; j < text.length; j++) {
        fence[rail].push(text[j]);
        if (rail === 0) dir = 1;
        else if (rail === rails - 1) dir = -1;
        rail += dir;
    }
    return fence.map(function (r) { return r.join(''); }).join('');
}

function railFenceDecode(text, rails) {
    if (rails < 2) throw new Error('Need at least 2 rails.');
    var n = text.length;
    // Figure out how many chars go on each rail
    var pattern = [];
    var rail = 0, dir2 = 1;
    for (var i = 0; i < n; i++) {
        pattern.push(rail);
        if (rail === 0) dir2 = 1;
        else if (rail === rails - 1) dir2 = -1;
        rail += dir2;
    }
    var counts = new Array(rails).fill(0);
    pattern.forEach(function (r) { counts[r]++; });

    // Split text into rail chunks
    var chunks = [];
    var pos = 0;
    for (var r = 0; r < rails; r++) {
        chunks.push(text.substr(pos, counts[r]).split(''));
        pos += counts[r];
    }

    // Reconstruct
    var indices = new Array(rails).fill(0);
    var result = [];
    for (var j = 0; j < n; j++) {
        var rr = pattern[j];
        result.push(chunks[rr][indices[rr]]);
        indices[rr]++;
    }
    return result.join('');
}

function runRailFence(mode) {
    var input = document.getElementById('railInput').value;
    var errEl = document.getElementById('railError');
    errEl.textContent = '';
    var rails = parseInt(document.getElementById('railCount').value, 10);
    if (isNaN(rails) || rails < 2 || rails > 10) {
        errEl.textContent = 'Rails must be between 2 and 10.';
        return;
    }
    if (!input.trim()) { errEl.textContent = 'Enter some text.'; return; }
    try {
        var result = mode === 'encode' ? railFenceEncode(input, rails) : railFenceDecode(input, rails);
        document.getElementById('railOutput').value = result;
    } catch (e) {
        errEl.textContent = e.message;
    }
}

/* ---------- Beaufort ---------- */

function runBeaufort() {
    var input = document.getElementById('beaufortInput').value;
    var key = document.getElementById('beaufortKey').value.toUpperCase().replace(/[^A-Z]/g, '');
    var errEl = document.getElementById('beaufortError');
    errEl.textContent = '';
    if (!input.trim()) { errEl.textContent = 'Enter some text.'; return; }
    if (!key) { errEl.textContent = 'Enter a key (letters only).'; return; }

    var ki = 0;
    var result = input.split('').map(function (ch) {
        var isUpper = ch >= 'A' && ch <= 'Z';
        var isLower = ch >= 'a' && ch <= 'z';
        if (!isUpper && !isLower) return ch;
        var p = ch.toUpperCase().charCodeAt(0) - 65;
        var k = key.charCodeAt(ki % key.length) - 65;
        ki++;
        var c = ((k - p) % 26 + 26) % 26;
        return isUpper ? String.fromCharCode(c + 65) : String.fromCharCode(c + 97);
    }).join('');
    document.getElementById('beaufortOutput').value = result;
}

/* ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', function () {
    buildPolybiusGrid();

    // Key auto-uppercase
    document.getElementById('beaufortKey').addEventListener('input', function () {
        var cur = this.selectionStart;
        this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '');
        this.setSelectionRange(cur, cur);
    });

    // Ctrl+Enter on each panel's textarea
    var handlers = [
        { id: 'atbashInput', fn: function () { runAtbash('encode'); } },
        { id: 'affineInput', fn: function () { runAffine('encode'); } },
        { id: 'a1z26Input', fn: function () { runA1Z26('encode'); } },
        { id: 'polybiusInput', fn: function () { runPolybius('encode'); } },
        { id: 'railInput', fn: function () { runRailFence('encode'); } },
        { id: 'beaufortInput', fn: runBeaufort },
    ];
    handlers.forEach(function (h) {
        var el = document.getElementById(h.id);
        if (el) el.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key === 'Enter') h.fn();
        });
    });
});
