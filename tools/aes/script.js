/* ============================================================
   AES Encryption — script.js
   Uses WebCrypto API: AES-GCM, AES-CBC, AES-CTR
   Key sizes: 128, 192, 256 bit
   ============================================================ */

/* ---- Hex/Base64 helpers ---- */
function bufToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBuf(hex) {
    hex = hex.replace(/\s/g, '');
    if (hex.length % 2) throw new Error('Hex string must have even length');
    var arr = new Uint8Array(hex.length / 2);
    for (var i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    return arr.buffer;
}
function bufToBase64(buf) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
}
function base64ToBuf(b64) {
    try {
        var bin = atob(b64.replace(/\s/g, ''));
        var arr = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return arr.buffer;
    } catch (e) { throw new Error('Invalid Base64 input'); }
}
function strToHex(str) {
    return Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function getOutputFormat() {
    return document.querySelector('input[name="outputFmt"]:checked').value;
}
function encodeOutput(buf) {
    return getOutputFormat() === 'base64' ? bufToBase64(buf) : bufToHex(buf);
}
function decodeInput(str) {
    str = str.trim();
    return getOutputFormat() === 'base64' ? base64ToBuf(str) : hexToBuf(str);
}

/* ---- Key derivation (PBKDF2) or raw hex key ---- */
async function deriveKey(password, saltBuf, keyLen, mode) {
    var enc = new TextEncoder();
    var keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: saltBuf, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: mode, length: keyLen },
        false, ['encrypt', 'decrypt']
    );
}

async function importRawKey(hexKey, mode) {
    var buf = hexToBuf(hexKey);
    if (![16, 24, 32].includes(new Uint8Array(buf).length))
        throw new Error('Key must be 128, 192, or 256 bits (32, 48, or 64 hex chars)');
    return crypto.subtle.importKey('raw', buf, { name: mode }, false, ['encrypt', 'decrypt']);
}

/* ---- IV / Nonce generation ---- */
function makeIV(mode) {
    if (mode === 'AES-GCM') return crypto.getRandomValues(new Uint8Array(12));
    if (mode === 'AES-CTR') return crypto.getRandomValues(new Uint8Array(16));
    return crypto.getRandomValues(new Uint8Array(16)); // CBC
}

function ivLength(mode) {
    return mode === 'AES-GCM' ? 12 : 16;
}

/* ---- Encrypt ---- */
async function runEncrypt() {
    var btn = document.getElementById('encBtn');
    var output = document.getElementById('encOutput');
    try {
        var plaintext = document.getElementById('encInput').value;
        if (!plaintext) { output.value = ''; return; }

        var mode = document.getElementById('encMode').value;
        var keySize = parseInt(document.getElementById('encKeySize').value, 10);
        var keyMode = document.querySelector('input[name="encKeyMode"]:checked').value;
        var enc = new TextEncoder();
        var plaintextBuf = enc.encode(plaintext);

        var key, saltHex = '';
        if (keyMode === 'password') {
            var password = document.getElementById('encPassword').value;
            if (!password) throw new Error('Enter a password');
            var salt = crypto.getRandomValues(new Uint8Array(16));
            saltHex = bufToHex(salt.buffer);
            key = await deriveKey(password, salt, keySize, mode);
        } else {
            var hexKey = document.getElementById('encHexKey').value.trim();
            if (!hexKey) throw new Error('Enter a hex key');
            key = await importRawKey(hexKey, mode);
        }

        var iv = makeIV(mode);
        var ivHex = bufToHex(iv.buffer);

        var cipherParams = mode === 'AES-GCM'
            ? { name: 'AES-GCM', iv, tagLength: 128 }
            : mode === 'AES-CTR'
            ? { name: 'AES-CTR', counter: iv, length: 64 }
            : { name: 'AES-CBC', iv };

        var cipherBuf = await crypto.subtle.encrypt(cipherParams, key, plaintextBuf);
        var cipherStr = encodeOutput(cipherBuf);
        var ivStr = getOutputFormat() === 'base64' ? bufToBase64(iv.buffer) : ivHex;
        var saltStr = saltHex ? (getOutputFormat() === 'base64' ? bufToBase64(hexToBuf(saltHex)) : saltHex) : '';

        document.getElementById('encIVOut').value = ivStr;
        document.getElementById('encSaltRow').style.display = saltHex ? '' : 'none';
        document.getElementById('encSaltOut').value = saltStr;
        output.value = cipherStr;
        btn.disabled = false;
    } catch (e) {
        output.value = 'Error: ' + (e.message || e);
    }
    btn.disabled = false;
    btn.textContent = 'Encrypt';
}

/* ---- Decrypt ---- */
async function runDecrypt() {
    var btn = document.getElementById('decBtn');
    var output = document.getElementById('decOutput');
    try {
        var cipherStr = document.getElementById('decInput').value.trim();
        var ivStr = document.getElementById('decIV').value.trim();
        if (!cipherStr || !ivStr) { output.value = ''; return; }

        var mode = document.getElementById('decMode').value;
        var keySize = parseInt(document.getElementById('decKeySize').value, 10);
        var keyMode = document.querySelector('input[name="decKeyMode"]:checked').value;

        var cipherBuf = decodeInput(cipherStr);
        var ivBuf = decodeInput(ivStr);

        var key;
        if (keyMode === 'password') {
            var password = document.getElementById('decPassword').value;
            if (!password) throw new Error('Enter a password');
            var saltStr = document.getElementById('decSalt').value.trim();
            if (!saltStr) throw new Error('Enter the salt used during encryption');
            var saltBuf = decodeInput(saltStr);
            key = await deriveKey(password, saltBuf, keySize, mode);
        } else {
            var hexKey = document.getElementById('decHexKey').value.trim();
            if (!hexKey) throw new Error('Enter a hex key');
            key = await importRawKey(hexKey, mode);
        }

        var ivArr = new Uint8Array(ivBuf);
        var cipherParams = mode === 'AES-GCM'
            ? { name: 'AES-GCM', iv: ivArr, tagLength: 128 }
            : mode === 'AES-CTR'
            ? { name: 'AES-CTR', counter: ivArr, length: 64 }
            : { name: 'AES-CBC', iv: ivArr };

        var plainBuf = await crypto.subtle.decrypt(cipherParams, key, cipherBuf);
        output.value = new TextDecoder().decode(plainBuf);
    } catch (e) {
        output.value = 'Error: ' + (e.message || String(e));
    }
    btn.disabled = false;
    btn.textContent = 'Decrypt';
}

/* ---- Key generator ---- */
async function generateKey() {
    var keySize = parseInt(document.getElementById('genKeySize').value, 10);
    var mode = document.getElementById('encMode').value;
    var key = await crypto.subtle.generateKey({ name: mode, length: keySize }, true, ['encrypt', 'decrypt']);
    var rawBuf = await crypto.subtle.exportKey('raw', key);
    document.getElementById('generatedKey').value = bufToHex(rawBuf);
}

/* ---- Sync mode selects ---- */
function syncModes() {
    var encMode = document.getElementById('encMode').value;
    var decMode = document.getElementById('decMode');
    decMode.value = encMode;
    var gcmNote = document.getElementById('gcmNote');
    gcmNote.style.display = encMode === 'AES-GCM' ? '' : 'none';
}

/* ---- Key mode toggles ---- */
function toggleEncKeyMode() {
    var mode = document.querySelector('input[name="encKeyMode"]:checked').value;
    document.getElementById('encPasswordGroup').style.display = mode === 'password' ? '' : 'none';
    document.getElementById('encHexKeyGroup').style.display  = mode === 'hex'      ? '' : 'none';
}
function toggleDecKeyMode() {
    var mode = document.querySelector('input[name="decKeyMode"]:checked').value;
    document.getElementById('decPasswordGroup').style.display = mode === 'password' ? '' : 'none';
    document.getElementById('decHexKeyGroup').style.display   = mode === 'hex'      ? '' : 'none';
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('encBtn').addEventListener('click', function () {
        this.disabled = true; this.textContent = 'Encrypting…'; runEncrypt();
    });
    document.getElementById('decBtn').addEventListener('click', function () {
        this.disabled = true; this.textContent = 'Decrypting…'; runDecrypt();
    });
    document.getElementById('genKeyBtn').addEventListener('click', generateKey);
    document.getElementById('encMode').addEventListener('change', syncModes);
    document.querySelectorAll('input[name="encKeyMode"]').forEach(function (r) {
        r.addEventListener('change', toggleEncKeyMode);
    });
    document.querySelectorAll('input[name="decKeyMode"]').forEach(function (r) {
        r.addEventListener('change', toggleDecKeyMode);
    });

    document.getElementById('encSaltRow').style.display = 'none';
    document.getElementById('gcmNote').style.display = '';
    toggleEncKeyMode();
    toggleDecKeyMode();
});
