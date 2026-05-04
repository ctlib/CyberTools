/* ============================================================
   Vigenère Cipher — script.js
   Encrypt/Decrypt + Kasiski analysis + IoC key recovery
   ============================================================ */

/* ---------- Core cipher ---------- */

function vigEncrypt(plaintext, key) {
    var k = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!k.length) throw new Error('Key must contain at least one letter.');
    var ki = 0;
    return plaintext.split('').map(function (ch) {
        var code = ch.toUpperCase().charCodeAt(0);
        if (code < 65 || code > 90) return ch; // non-alpha passthrough
        var shift = k.charCodeAt(ki % k.length) - 65;
        ki++;
        var enc = (ch.charCodeAt(0) - (ch === ch.toUpperCase() ? 65 : 97) + shift) % 26;
        return ch === ch.toUpperCase()
            ? String.fromCharCode(enc + 65)
            : String.fromCharCode(enc + 97);
    }).join('');
}

function vigDecrypt(ciphertext, key) {
    var k = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!k.length) throw new Error('Key must contain at least one letter.');
    var ki = 0;
    return ciphertext.split('').map(function (ch) {
        var code = ch.toUpperCase().charCodeAt(0);
        if (code < 65 || code > 90) return ch;
        var shift = k.charCodeAt(ki % k.length) - 65;
        ki++;
        var dec = (ch.charCodeAt(0) - (ch === ch.toUpperCase() ? 65 : 97) - shift + 26) % 26;
        return ch === ch.toUpperCase()
            ? String.fromCharCode(dec + 65)
            : String.fromCharCode(dec + 97);
    }).join('');
}

/* ---------- Index of Coincidence ---------- */

function indexOfCoincidence(text) {
    var letters = text.toUpperCase().replace(/[^A-Z]/g, '');
    var N = letters.length;
    if (N < 2) return 0;
    var freq = new Array(26).fill(0);
    for (var i = 0; i < N; i++) freq[letters.charCodeAt(i) - 65]++;
    var sum = 0;
    for (var j = 0; j < 26; j++) sum += freq[j] * (freq[j] - 1);
    return sum / (N * (N - 1));
}

/* ---------- Kasiski / key-length analysis ---------- */

function kasiskiKeyLengths(ciphertext) {
    var text = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    // Find repeated trigrams and their distances
    var distances = [];
    var seen = {};
    for (var i = 0; i < text.length - 2; i++) {
        var tri = text.substr(i, 3);
        if (seen[tri] !== undefined) {
            distances.push(i - seen[tri]);
        }
        seen[tri] = i;
    }

    // Factor all distances
    var factorCount = new Array(21).fill(0); // index 1-20
    distances.forEach(function (d) {
        for (var f = 2; f <= 20; f++) {
            if (d % f === 0) factorCount[f]++;
        }
    });

    // Compute average IoC for each key length 1-20
    var results = [];
    for (var kl = 1; kl <= 20; kl++) {
        var avgIoC = avgIoCForKeyLen(text, kl);
        results.push({
            keyLen: kl,
            ioc: avgIoC,
            kasiskiScore: factorCount[kl] || 0,
            distToEng: Math.abs(avgIoC - 0.065)
        });
    }
    return results;
}

function avgIoCForKeyLen(text, k) {
    var iocs = [];
    for (var i = 0; i < k; i++) {
        var col = '';
        for (var j = i; j < text.length; j += k) col += text[j];
        iocs.push(indexOfCoincidence(col));
    }
    return iocs.reduce(function (a, b) { return a + b; }, 0) / iocs.length;
}

/* ---------- Key letter recovery ---------- */

// English expected frequencies (fraction)
var ENG_FREQ = [0.082,0.015,0.028,0.043,0.127,0.022,0.020,0.061,0.070,
                0.0015,0.0077,0.040,0.024,0.067,0.075,0.019,0.0010,
                0.060,0.063,0.091,0.028,0.0098,0.024,0.0015,0.020,0.00074];

function recoverKeyLetters(text, keyLen) {
    var letters = [];
    for (var pos = 0; pos < keyLen; pos++) {
        // Extract every keyLen-th character
        var col = '';
        for (var i = pos; i < text.length; i += keyLen) col += text[i];
        var N = col.length;
        var freq = new Array(26).fill(0);
        for (var j = 0; j < N; j++) freq[col.charCodeAt(j) - 65]++;

        // For each possible shift (key letter), compute chi-squared against English
        var bestShift = 0;
        var bestChi = Infinity;
        for (var shift = 0; shift < 26; shift++) {
            var chi = 0;
            for (var c = 0; c < 26; c++) {
                var observed = freq[(c + shift) % 26] / N;
                var expected = ENG_FREQ[c];
                chi += Math.pow(observed - expected, 2) / expected;
            }
            if (chi < bestChi) { bestChi = chi; bestShift = shift; }
        }
        letters.push({ pos: pos, letter: String.fromCharCode(bestShift + 65), shift: bestShift });
    }
    return letters;
}

/* ---------- UI ---------- */

function switchTab(tab) {
    document.querySelectorAll('.vig-tab').forEach(function (el, idx) {
        var tabs = ['cipher', 'kasiski'];
        el.classList.toggle('active', tabs[idx] === tab);
    });
    document.querySelectorAll('.vig-panel').forEach(function (el) {
        el.classList.remove('active');
    });
    document.getElementById('panel-' + tab).classList.add('active');
}

function runCipher(mode) {
    var errEl = document.getElementById('vigError');
    errEl.textContent = '';
    document.getElementById('vigKeyError').textContent = '';
    try {
        var input = document.getElementById('vigInput').value;
        var key = document.getElementById('vigKey').value.trim();
        if (!input) throw new Error('Enter some text first.');
        if (!key) throw new Error('Enter a key.');
        if (/[^A-Za-z]/.test(key)) {
            document.getElementById('vigKeyError').textContent = 'Key must contain only letters.';
            return;
        }
        var result = mode === 'encrypt' ? vigEncrypt(input, key) : vigDecrypt(input, key);
        document.getElementById('vigOutput').value = result;

        // Stats
        var alphaCount = input.replace(/[^A-Za-z]/g, '').length;
        document.getElementById('vigStats').textContent =
            mode.charAt(0).toUpperCase() + mode.slice(1) + 'ed ' + alphaCount +
            ' letter' + (alphaCount !== 1 ? 's' : '') + ' with key "' + key.toUpperCase() + '" (length ' + key.length + ')';
    } catch (e) {
        errEl.textContent = e.message;
        document.getElementById('vigOutput').value = '';
    }
}

function runKasiski() {
    var statusEl = document.getElementById('kasiskiStatus');
    var input = document.getElementById('kasiskiInput').value;
    var text = input.toUpperCase().replace(/[^A-Z]/g, '');

    document.getElementById('kasiskiResults').style.display = 'none';

    if (text.length < 20) {
        statusEl.textContent = 'Need at least 20 letters for meaningful analysis.';
        return;
    }
    statusEl.textContent = '';

    // Overall IoC
    var ioC = indexOfCoincidence(text);
    document.getElementById('overallIoC').textContent = ioC.toFixed(4);
    var iocLabel = '';
    if (ioC > 0.060) iocLabel = 'Suggests monoalphabetic substitution or short key';
    else if (ioC > 0.045) iocLabel = 'Suggests polyalphabetic cipher (Vigenère likely)';
    else iocLabel = 'Near-random — may be transposition or binary data';
    document.getElementById('iocLabel').textContent = iocLabel;

    // Key length analysis
    var klResults = kasiskiKeyLengths(text);
    // Sort by distance to English IoC
    var sorted = klResults.slice(1).sort(function (a, b) { return a.distToEng - b.distToEng; }); // skip kl=0
    var top3 = sorted.slice(0, 3).map(function (r) { return r.keyLen; });
    var topLen = top3[0];

    document.getElementById('topKeyLen').textContent = topLen;
    document.getElementById('topKeyLenLabel').textContent =
        'IoC avg: ' + klResults[topLen].ioc.toFixed(4) + ' (2nd: ' + top3[1] + ', 3rd: ' + top3[2] + ')';

    // Build table
    var tbody = document.getElementById('iocTableBody');
    tbody.innerHTML = '';
    for (var kl = 1; kl <= 20; kl++) {
        var r = klResults[kl];
        var isTop = top3.indexOf(kl) !== -1;
        var rank = top3.indexOf(kl) + 1;
        var tr = document.createElement('tr');
        if (isTop) tr.className = 'top-guess';
        var starLabel = isTop ? (' ⭐' + rank) : '';
        tr.innerHTML =
            '<td>' + kl + starLabel + '</td>' +
            '<td>' + r.ioc.toFixed(4) + '</td>' +
            '<td>' + r.distToEng.toFixed(4) + '</td>' +
            '<td>' + (isTop ? (rank === 1 ? 'Best' : 'Top ' + rank) : '') + '</td>';
        tbody.appendChild(tr);
    }

    // Key letter recovery using top key length
    var keyLetters = recoverKeyLetters(text, topLen);
    document.getElementById('keyLenUsed').textContent = '(key length = ' + topLen + ')';

    var grid = document.getElementById('keyLetterGrid');
    grid.innerHTML = '';
    keyLetters.forEach(function (kl_item) {
        var card = document.createElement('div');
        card.className = 'key-letter-card';
        card.innerHTML =
            '<div class="pos">pos ' + (kl_item.pos + 1) + '</div>' +
            '<div class="letter">' + kl_item.letter + '</div>' +
            '<div class="shift">shift ' + kl_item.shift + '</div>';
        grid.appendChild(card);
    });

    var recoveredKey = keyLetters.map(function (kl_item) { return kl_item.letter; }).join('');
    document.getElementById('recoveredKey').textContent = recoveredKey;
    document.getElementById('kasiskiResults').style.display = '';

    // "Use this key" button handler
    document.getElementById('useKeyBtn').onclick = function () {
        document.getElementById('vigKey').value = recoveredKey;
        switchTab('cipher');
    };
}

document.addEventListener('DOMContentLoaded', function () {
    // Force key to uppercase letters only
    document.getElementById('vigKey').addEventListener('input', function () {
        var v = this.value.toUpperCase().replace(/[^A-Z]/g, '');
        this.value = v;
    });

    document.getElementById('vigEncryptBtn').addEventListener('click', function () { runCipher('encrypt'); });
    document.getElementById('vigDecryptBtn').addEventListener('click', function () { runCipher('decrypt'); });
    document.getElementById('kasiskiBtn').addEventListener('click', runKasiski);

    // Ctrl+Enter shortcuts
    document.getElementById('vigInput').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') runCipher('encrypt');
    });
    document.getElementById('kasiskiInput').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') runKasiski();
    });
});
