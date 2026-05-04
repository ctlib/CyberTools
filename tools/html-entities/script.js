/* ============================================================
   HTML Entity Encoder/Decoder — script.js
   ============================================================ */

var NAMED_ENTITIES = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;',
    '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;',
    '©': '&copy;', '®': '&reg;', '™': '&trade;', '€': '&euro;',
    '£': '&pound;', '¥': '&yen;', '°': '&deg;', '±': '&plusmn;',
    '×': '&times;', '÷': '&divide;', '¢': '&cent;', '¼': '&frac14;',
    '½': '&frac12;', '¾': '&frac34;', '—': '&mdash;', '–': '&ndash;',
    ' ': '&nbsp;', '«': '&laquo;', '»': '&raquo;',
    '←': '&larr;', '→': '&rarr;', '↑': '&uarr;', '↓': '&darr;',
    '♠': '&spades;', '♣': '&clubs;', '♥': '&hearts;', '♦': '&diams;',
    'α': '&alpha;', 'β': '&beta;', 'γ': '&gamma;', 'δ': '&delta;',
    'π': '&pi;', 'Σ': '&Sigma;', 'Ω': '&Omega;', 'μ': '&mu;',
};

function encodeEntities() {
    var input = document.getElementById('entityInput').value;
    var mode  = document.querySelector('input[name="encMode"]:checked').value;
    var out   = document.getElementById('entityOutput');

    if (mode === 'named') {
        out.value = input.replace(/[&<>"'`=\/©®™€£¥°±×÷¢¼½¾—– «»←→↑↓♠♣♥♦αβγδπΣΩμ]/g, function (ch) {
            return NAMED_ENTITIES[ch] || ch;
        });
    } else if (mode === 'decimal') {
        out.value = input.replace(/[^\x20-\x7E]|[&<>"'`]/g, function (ch) {
            return '&#' + ch.codePointAt(0) + ';';
        });
    } else {
        out.value = input.replace(/[^\x20-\x7E]|[&<>"'`]/g, function (ch) {
            return '&#x' + ch.codePointAt(0).toString(16).toUpperCase() + ';';
        });
    }
}

function decodeEntities() {
    var input = document.getElementById('entityDecInput').value;
    var div = document.createElement('div');
    div.innerHTML = input;
    document.getElementById('entityDecOutput').value = div.textContent;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('encodeBtn').addEventListener('click', encodeEntities);
    document.getElementById('decodeBtn').addEventListener('click', decodeEntities);
    document.getElementById('entityInput').addEventListener('input', function () {
        if (this.value) encodeEntities();
    });
    document.getElementById('entityDecInput').addEventListener('input', function () {
        if (this.value) decodeEntities();
    });
});
