/* ============================================================
   Password Generator — script.js
   Cryptographically random via crypto.getRandomValues()
   ============================================================ */

var CHARSETS = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    digits:  '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
    similar: 'il1Lo0O',
};

var WORDLIST = [
    'alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india',
    'juliet','kilo','lima','mike','november','oscar','papa','quebec','romeo',
    'sierra','tango','uniform','victor','whiskey','xray','yankee','zulu',
    'anchor','badge','cabin','dagger','ember','forge','ghost','haven','ivory',
    'jade','knight','lantern','marble','nexus','orbit','prism','quartz','raven',
    'spark','token','ultra','vault','waltz','xenon','yield','zenith','amber',
    'blaze','coral','drift','elder','flare','grove','hatch','index','jewel',
    'karma','latch','maple','nerve','oaken','pearl','quest','ridge','shore',
    'tiger','umbra','vigor','wheat','axiom','blunt','crisp','dwarf','epoch',
    'flair','gloom','hedge','ingot','joust','knack','lunar','mocha','noble',
    'oxide','plumb','quirk','relay','swift','trove','unify','venom','weave',
];

function getRandInt(max) {
    var arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
}

function buildCharset() {
    var s = '';
    if (document.getElementById('optUpper').checked)   s += CHARSETS.upper;
    if (document.getElementById('optLower').checked)   s += CHARSETS.lower;
    if (document.getElementById('optDigits').checked)  s += CHARSETS.digits;
    if (document.getElementById('optSymbols').checked) s += CHARSETS.symbols;
    if (document.getElementById('optExcludeSimilar').checked) {
        for (var i = 0; i < CHARSETS.similar.length; i++) {
            s = s.split(CHARSETS.similar[i]).join('');
        }
    }
    return s;
}

function calcEntropy(len, charsetSize) {
    if (charsetSize < 2 || len < 1) return 0;
    return Math.log2(Math.pow(charsetSize, len));
}

function renderStrengthBar(entropy) {
    var bar = document.getElementById('strengthBar');
    var label = document.getElementById('strengthLabel');
    var pct, cls, text;
    if (entropy < 40)       { pct = 20;  cls = 'danger';  text = 'Weak'; }
    else if (entropy < 60)  { pct = 40;  cls = 'warning'; text = 'Fair'; }
    else if (entropy < 80)  { pct = 65;  cls = 'accent2'; text = 'Good'; }
    else if (entropy < 100) { pct = 85;  cls = 'accent-2'; text = 'Strong'; }
    else                     { pct = 100; cls = 'accent';  text = 'Very Strong'; }
    bar.style.width = pct + '%';
    bar.style.background = 'var(--' + cls + ')';
    label.textContent = text + ' — ' + Math.round(entropy) + ' bits of entropy';
    label.style.color = 'var(--' + cls + ')';
}

function generatePasswords() {
    var len = parseInt(document.getElementById('pwLength').value, 10);
    var count = parseInt(document.getElementById('pwCount').value, 10);
    var charset = buildCharset();

    if (!charset) {
        document.getElementById('pwOutput').innerHTML = '<div style="color:var(--danger);font-size:13px;">Select at least one character type.</div>';
        return;
    }

    var passwords = [];
    for (var i = 0; i < count; i++) {
        var pw = '';
        for (var j = 0; j < len; j++) pw += charset[getRandInt(charset.length)];
        passwords.push(pw);
    }

    var entropy = calcEntropy(len, charset.length);
    renderStrengthBar(entropy);
    document.getElementById('entropyNote').textContent = 'Charset size: ' + charset.length + ' chars';

    var ul = document.getElementById('pwOutput');
    ul.innerHTML = '';
    passwords.forEach(function (pw) {
        var li = document.createElement('div');
        li.className = 'pw-row';
        var span = document.createElement('span');
        span.className = 'pw-text';
        span.textContent = pw;
        var btn = document.createElement('button');
        btn.className = 'output-copy-btn';
        btn.textContent = 'Copy';
        btn.style.position = 'static';
        btn.style.fontSize = '11px';
        btn.style.padding = '3px 8px';
        btn.addEventListener('click', function () { CyberTools.copyText(pw, btn); });
        li.appendChild(span);
        li.appendChild(btn);
        ul.appendChild(li);
    });
}

function generatePassphrase() {
    var wordCount = parseInt(document.getElementById('phraseWordCount').value, 10);
    var sep = document.getElementById('phraseSep').value;
    var capitalize = document.getElementById('phraseCapitalize').checked;
    var addNum = document.getElementById('phraseNumber').checked;

    var words = [];
    for (var i = 0; i < wordCount; i++) {
        var w = WORDLIST[getRandInt(WORDLIST.length)];
        words.push(capitalize ? w[0].toUpperCase() + w.slice(1) : w);
    }
    var phrase = words.join(sep);
    if (addNum) phrase += sep + getRandInt(100);

    var entropy = Math.log2(Math.pow(WORDLIST.length, wordCount));
    renderStrengthBar(entropy);
    document.getElementById('entropyNote').textContent = 'Wordlist size: ' + WORDLIST.length + ' words';

    document.getElementById('pwOutput').innerHTML = '';
    var row = document.createElement('div');
    row.className = 'pw-row';
    var span = document.createElement('span');
    span.className = 'pw-text';
    span.textContent = phrase;
    var btn = document.createElement('button');
    btn.className = 'output-copy-btn';
    btn.textContent = 'Copy';
    btn.style.cssText = 'position:static;font-size:11px;padding:3px 8px;';
    btn.addEventListener('click', function () { CyberTools.copyText(phrase, btn); });
    row.appendChild(span);
    row.appendChild(btn);
    document.getElementById('pwOutput').appendChild(row);
}

function updateLengthDisplay() {
    document.getElementById('pwLengthDisplay').textContent = document.getElementById('pwLength').value;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('pwLength').addEventListener('input', updateLengthDisplay);
    document.getElementById('generateBtn').addEventListener('click', generatePasswords);
    document.getElementById('generatePhraseBtn').addEventListener('click', generatePassphrase);

    document.querySelectorAll('.pw-option').forEach(function (el) {
        el.addEventListener('change', function () {
            if (document.getElementById('pwOutput').children.length > 0) generatePasswords();
        });
    });
    document.getElementById('pwLength').addEventListener('change', function () {
        if (document.getElementById('pwOutput').children.length > 0) generatePasswords();
    });

    updateLengthDisplay();
    generatePasswords();
});
