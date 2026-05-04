/* ============================================================
   RSA Encryption — script.js
   WebCrypto RSA-OAEP (encrypt/decrypt) + RSA-PSS (sign/verify)
   PEM import/export
   ============================================================ */

/* ---- PEM helpers ---- */
function bufToPem(buf, label) {
    var b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
    var lines = b64.match(/.{1,64}/g).join('\n');
    return '-----BEGIN ' + label + '-----\n' + lines + '\n-----END ' + label + '-----';
}

function pemToBuf(pem) {
    var b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr.buffer;
}

function bufToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

/* ---- Key Generation ---- */
async function generateKeyPair() {
    var keySize = parseInt(document.getElementById('keySize').value, 10);
    var hashAlgo = document.getElementById('hashAlgo').value;
    var btn = document.getElementById('genKeyBtn');
    btn.disabled = true; btn.textContent = 'Generating…';

    try {
        var kp = await crypto.subtle.generateKey(
            { name: 'RSA-OAEP', modulusLength: keySize, publicExponent: new Uint8Array([1,0,1]), hash: hashAlgo },
            true, ['encrypt', 'decrypt']
        );
        var pubDer = await crypto.subtle.exportKey('spki', kp.publicKey);
        var privDer= await crypto.subtle.exportKey('pkcs8', kp.privateKey);
        document.getElementById('pubKeyOut').value  = bufToPem(pubDer,  'PUBLIC KEY');
        document.getElementById('privKeyOut').value = bufToPem(privDer, 'PRIVATE KEY');
        document.getElementById('keyPairResult').style.display = '';

        // Also generate a PSS key pair for sign/verify
        var pssKP = await crypto.subtle.generateKey(
            { name: 'RSA-PSS', modulusLength: keySize, publicExponent: new Uint8Array([1,0,1]), hash: hashAlgo },
            true, ['sign', 'verify']
        );
        var pssPubDer  = await crypto.subtle.exportKey('spki',  pssKP.publicKey);
        var pssPrivDer = await crypto.subtle.exportKey('pkcs8', pssKP.privateKey);
        document.getElementById('signPubKey').value  = bufToPem(pssPubDer,  'PUBLIC KEY');
        document.getElementById('signPrivKey').value = bufToPem(pssPrivDer, 'PRIVATE KEY');
    } catch (e) {
        alert('Key generation failed: ' + e.message);
    }
    btn.disabled = false; btn.textContent = 'Generate Key Pair';
}

/* ---- Encrypt ---- */
async function runEncrypt() {
    var pubPem  = document.getElementById('encPubKey').value.trim();
    var msg     = document.getElementById('encMessage').value;
    var hashAlgo= document.getElementById('encHash').value;
    var out     = document.getElementById('encOutput');
    if (!pubPem || !msg) { out.value = ''; return; }
    try {
        var pubKey = await crypto.subtle.importKey('spki', pemToBuf(pubPem), { name: 'RSA-OAEP', hash: hashAlgo }, false, ['encrypt']);
        var enc    = new TextEncoder().encode(msg);
        var cipher = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, enc);
        out.value  = btoa(String.fromCharCode.apply(null, new Uint8Array(cipher)));
    } catch (e) { out.value = 'Error: ' + e.message; }
}

/* ---- Decrypt ---- */
async function runDecrypt() {
    var privPem = document.getElementById('decPrivKey').value.trim();
    var cipher  = document.getElementById('decCipher').value.trim();
    var hashAlgo= document.getElementById('decHash').value;
    var out     = document.getElementById('decOutput');
    if (!privPem || !cipher) { out.value = ''; return; }
    try {
        var privKey = await crypto.subtle.importKey('pkcs8', pemToBuf(privPem), { name: 'RSA-OAEP', hash: hashAlgo }, false, ['decrypt']);
        var cipherBuf = Uint8Array.from(atob(cipher.replace(/\s/g,'')), function (c) { return c.charCodeAt(0); });
        var plain = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privKey, cipherBuf);
        out.value = new TextDecoder().decode(plain);
    } catch (e) { out.value = 'Error: ' + e.message; }
}

/* ---- Sign ---- */
async function runSign() {
    var privPem = document.getElementById('signPrivKey').value.trim();
    var msg     = document.getElementById('signMessage').value;
    var hashAlgo= document.getElementById('signHash').value;
    var out     = document.getElementById('signOutput');
    if (!privPem || !msg) { out.value = ''; return; }
    try {
        var privKey = await crypto.subtle.importKey('pkcs8', pemToBuf(privPem), { name: 'RSA-PSS', hash: hashAlgo }, false, ['sign']);
        var sig = await crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, privKey, new TextEncoder().encode(msg));
        out.value = btoa(String.fromCharCode.apply(null, new Uint8Array(sig)));
    } catch (e) { out.value = 'Error: ' + e.message; }
}

/* ---- Verify ---- */
async function runVerify() {
    var pubPem  = document.getElementById('signPubKey').value.trim();
    var msg     = document.getElementById('verifyMessage').value;
    var sig     = document.getElementById('verifySig').value.trim();
    var hashAlgo= document.getElementById('signHash').value;
    var out     = document.getElementById('verifyResult');
    if (!pubPem || !msg || !sig) { out.textContent = ''; return; }
    try {
        var pubKey = await crypto.subtle.importKey('spki', pemToBuf(pubPem), { name: 'RSA-PSS', hash: hashAlgo }, false, ['verify']);
        var sigBuf = Uint8Array.from(atob(sig.replace(/\s/g,'')), function (c) { return c.charCodeAt(0); });
        var valid  = await crypto.subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, pubKey, sigBuf, new TextEncoder().encode(msg));
        out.textContent = valid ? '✅ Signature valid' : '❌ Signature invalid';
        out.style.color = valid ? 'var(--success)' : 'var(--danger)';
    } catch (e) { out.textContent = 'Error: ' + e.message; out.style.color = 'var(--danger)'; }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('genKeyBtn').addEventListener('click', generateKeyPair);
    document.getElementById('encBtn').addEventListener('click', runEncrypt);
    document.getElementById('decBtn').addEventListener('click', runDecrypt);
    document.getElementById('signBtn').addEventListener('click', runSign);
    document.getElementById('verifyBtn').addEventListener('click', runVerify);
    document.getElementById('keyPairResult').style.display = 'none';
});
