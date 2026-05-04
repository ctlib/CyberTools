/* ============================================================
   TOTP / HOTP Generator — script.js
   RFC 6238 / RFC 4226, WebCrypto HMAC-SHA1/256/512
   ============================================================ */

/* ---- Base32 decoder ---- */
function base32Decode(input) {
    var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    input = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    var bits = 0, value = 0, output = [];
    for (var i = 0; i < input.length; i++) {
        var idx = ALPHABET.indexOf(input[i]);
        if (idx === -1) throw new Error('Invalid Base32 character: ' + input[i]);
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) { bits -= 8; output.push((value >>> bits) & 0xFF); }
    }
    return new Uint8Array(output);
}

/* ---- HMAC ---- */
async function hmac(algo, keyBytes, msgBytes) {
    var cryptoKey = await crypto.subtle.importKey(
        'raw', keyBytes, { name: 'HMAC', hash: algo }, false, ['sign']
    );
    return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, msgBytes));
}

/* ---- Dynamic truncation ---- */
function truncate(hmacResult) {
    var offset = hmacResult[hmacResult.length - 1] & 0x0f;
    return ((hmacResult[offset] & 0x7f) << 24 |
             hmacResult[offset+1] << 16 |
             hmacResult[offset+2] << 8 |
             hmacResult[offset+3]) >>> 0;
}

function bigIntToBytes(n) {
    var bytes = new Uint8Array(8);
    for (var i = 7; i >= 0; i--) {
        bytes[i] = Number(n & 0xffn);
        n >>= 8n;
    }
    return bytes;
}

/* ---- HOTP ---- */
async function hotp(secretB32, counter, digits, algo) {
    var key  = base32Decode(secretB32);
    var msg  = bigIntToBytes(BigInt(counter));
    var hash = await hmac('SHA-' + algo.replace('SHA',''), key, msg);
    var code = truncate(hash) % Math.pow(10, digits);
    return String(code).padStart(digits, '0');
}

/* ---- TOTP ---- */
async function totp(secretB32, digits, period, algo) {
    var T = Math.floor(Date.now() / 1000 / period);
    return hotp(secretB32, T, digits, algo);
}

/* ---- Countdown ---- */
var countdownInterval = null;

function startCountdown(period) {
    stopCountdown();
    function tick() {
        var remaining = period - (Math.floor(Date.now() / 1000) % period);
        var pct = (remaining / period) * 100;
        document.getElementById('countdownBar').style.width = pct + '%';
        document.getElementById('countdownSec').textContent = remaining + 's';
        if (remaining === period) refreshTOTP();
    }
    tick();
    countdownInterval = setInterval(tick, 1000);
}

function stopCountdown() {
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
}

async function refreshTOTP() {
    var secret  = document.getElementById('totpSecret').value.replace(/\s/g, '');
    var digits  = parseInt(document.getElementById('totpDigits').value, 10);
    var period  = parseInt(document.getElementById('totpPeriod').value, 10);
    var algo    = document.getElementById('totpAlgo').value;
    var out     = document.getElementById('totpOutput');
    var errEl   = document.getElementById('totpError');
    errEl.textContent = '';
    if (!secret) { out.textContent = '——————'; return; }
    try {
        var code = await totp(secret, digits, period, algo);
        out.textContent = code.slice(0, Math.floor(digits/2)) + ' ' + code.slice(Math.floor(digits/2));
    } catch (e) {
        out.textContent = '——————';
        errEl.textContent = e.message;
    }
}

async function runHOTP() {
    var secret  = document.getElementById('hotpSecret').value.replace(/\s/g, '');
    var counter = parseInt(document.getElementById('hotpCounter').value, 10);
    var digits  = parseInt(document.getElementById('hotpDigits').value, 10);
    var out     = document.getElementById('hotpOutput');
    var errEl   = document.getElementById('hotpError');
    errEl.textContent = '';
    if (!secret) { errEl.textContent = 'Enter a secret key'; return; }
    try {
        out.value = await hotp(secret, counter, digits, 'SHA1');
    } catch (e) {
        out.value = '';
        errEl.textContent = e.message;
    }
}

/* ---- Generate secret ---- */
function generateSecret() {
    var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    var bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    var result = '';
    bytes.forEach(function (b) { result += ALPHABET[b % 32]; });
    document.getElementById('totpSecret').value = result.match(/.{1,4}/g).join(' ');
    refreshTOTP();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('genSecretBtn').addEventListener('click', generateSecret);
    document.getElementById('totpSecret').addEventListener('input', function () {
        var period = parseInt(document.getElementById('totpPeriod').value, 10);
        if (this.value.replace(/\s/g,'')) startCountdown(period);
        else stopCountdown();
    });
    document.getElementById('totpPeriod').addEventListener('change', function () {
        stopCountdown();
        var secret = document.getElementById('totpSecret').value.replace(/\s/g,'');
        if (secret) startCountdown(parseInt(this.value, 10));
    });
    document.getElementById('hotpBtn').addEventListener('click', runHOTP);
    document.getElementById('totpDigits').addEventListener('change', refreshTOTP);
    document.getElementById('totpAlgo').addEventListener('change', refreshTOTP);
});
