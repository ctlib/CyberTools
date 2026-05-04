/* Cipher Identifier — CyberTools */

let debounceTimer;
function debounceIdentify() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(identify, 400);
}

const TOOL_LINKS = {
    base64: '../../tools/base64/index.html',
    vigenere: '../../tools/vigenere/index.html',
    rot: '../../tools/rot/index.html',
    'hex-viewer': '../../tools/hex-viewer/index.html',
    'url-encoder': '../../tools/url-encoder/index.html',
    jwt: '../../tools/jwt-decoder/index.html',
    hash: '../../tools/hash/index.html',
    'frequency-analyzer': '../../tools/frequency-analyzer/index.html',
    'classical-ciphers': '../../tools/classical-ciphers/index.html',
};

function ioc(text) {
    const upper = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (upper.length < 2) return 0;
    const counts = {};
    for (const ch of upper) counts[ch] = (counts[ch] || 0) + 1;
    let sum = 0;
    for (const k in counts) sum += counts[k] * (counts[k] - 1);
    return sum / (upper.length * (upper.length - 1));
}

function analyze(raw) {
    const text = raw.trim();
    const scores = [];

    const onlyAlpha = /^[A-Za-z\s]+$/.test(text);
    const onlyAlphaNoSpace = /^[A-Za-z]+$/.test(text);
    const onlyHex = /^[0-9a-fA-F]+$/.test(text);
    const onlyB64 = /^[A-Za-z0-9+/]+=*$/.test(text);
    const onlyB64url = /^[A-Za-z0-9\-_]+=*$/.test(text);
    const onlyDigitsHyphens = /^[\d\-\s]+$/.test(text);
    const onlyBinary = /^[01\s]+$/.test(text);
    const onlyMorse = /^[.\-\/\s]+$/.test(text);
    const len = text.replace(/\s/g, '').length;
    const ic = ioc(text);

    // JWT
    const jwtParts = text.split('.');
    if (jwtParts.length === 3 && jwtParts.every(p => /^[A-Za-z0-9\-_]*$/.test(p)) && jwtParts[0].length > 4) {
        try {
            const hdr = JSON.parse(atob(jwtParts[0].replace(/-/g,'+').replace(/_/g,'/')));
            if (hdr.alg || hdr.typ) {
                scores.push({ name:'JSON Web Token (JWT)', score:99, why:`Three base64url segments with valid header (alg: ${hdr.alg || '?'}, typ: ${hdr.typ || '?'})`, tool:'jwt', toolLabel:'JWT Decoder' });
            }
        } catch(e) {}
    }

    // Hash types (hex only)
    if (onlyHex) {
        const cleanLen = text.replace(/\s/g,'').length;
        if (cleanLen === 32) scores.push({ name:'MD5 Hash', score:95, why:'32 hexadecimal characters — matches MD5 output length', tool:'hash', toolLabel:'Hash Calculator' });
        if (cleanLen === 40) scores.push({ name:'SHA-1 Hash', score:95, why:'40 hexadecimal characters — matches SHA-1 output length', tool:'hash', toolLabel:'Hash Calculator' });
        if (cleanLen === 56) scores.push({ name:'SHA-224 Hash', score:93, why:'56 hexadecimal characters — matches SHA-224 output length', tool:'hash', toolLabel:'Hash Calculator' });
        if (cleanLen === 64) scores.push({ name:'SHA-256 Hash', score:95, why:'64 hexadecimal characters — matches SHA-256 output length', tool:'hash', toolLabel:'Hash Calculator' });
        if (cleanLen === 96) scores.push({ name:'SHA-384 Hash', score:93, why:'96 hexadecimal characters — matches SHA-384 output length', tool:'hash', toolLabel:'Hash Calculator' });
        if (cleanLen === 128) scores.push({ name:'SHA-512 Hash', score:93, why:'128 hexadecimal characters — matches SHA-512 output length', tool:'hash', toolLabel:'Hash Calculator' });
        if (cleanLen % 2 === 0 && cleanLen > 4) {
            scores.push({ name:'Hex-encoded Data', score:cleanLen >= 16 ? 80 : 60, why:`${cleanLen} hexadecimal characters — even length, could be hex-encoded bytes`, tool:'hex-viewer', toolLabel:'Hex Viewer' });
        }
    }

    // Base64
    if (onlyB64 && len % 4 === 0 && len >= 4) {
        let b64score = 82;
        if (text.endsWith('=') || text.endsWith('==')) b64score = 92;
        scores.push({ name:'Base64', score:b64score, why:`Valid Base64 charset${text.includes('=') ? ', padding present' : ''}; length divisible by 4`, tool:'base64', toolLabel:'Base64 Decoder' });
    }

    // URL encoded
    if (/%[0-9a-fA-F]{2}/.test(text)) {
        const pctCount = (text.match(/%[0-9a-fA-F]{2}/g) || []).length;
        scores.push({ name:'URL-encoded String', score:Math.min(70 + pctCount * 5, 95), why:`Found ${pctCount} percent-encoded sequence(s)`, tool:'url-encoder', toolLabel:'URL Decoder' });
    }

    // Binary
    if (onlyBinary && text.replace(/\s/g,'').length % 8 === 0) {
        scores.push({ name:'Binary (8-bit)', score:88, why:`Only 0s and 1s; length divisible by 8 (${text.replace(/\s/g,'').length / 8} bytes)`, tool:null, toolLabel:null });
    }

    // Morse code
    if (onlyMorse && /[.\-]/.test(text)) {
        scores.push({ name:'Morse Code', score:90, why:'Only dots, dashes, spaces, and slashes', tool:null, toolLabel:null });
    }

    // A1Z26
    if (onlyDigitsHyphens && text.includes('-')) {
        const nums = text.split(/[\s\-]+/).filter(Boolean).map(Number);
        if (nums.every(n => n >= 1 && n <= 26)) {
            scores.push({ name:'A1Z26 (A=1, Z=26)', score:88, why:`All numbers between 1-26 separated by hyphens (${nums.length} values)`, tool:'classical-ciphers', toolLabel:'Classical Ciphers' });
        }
    }

    // Alpha-only ciphers
    if (onlyAlpha && len >= 10) {
        const alphaText = text.replace(/[^A-Za-z]/g,'');
        // Monoalphabetic substitution (IoC close to English)
        if (ic > 0.060) {
            scores.push({ name:'Monoalphabetic Substitution / ROT', score:Math.round(60 + ic * 300), why:`Index of Coincidence = ${ic.toFixed(4)} (> 0.060 → English letter frequency preserved, monoalphabetic)`, tool:'frequency-analyzer', toolLabel:'Frequency Analyzer' });
            // Check if it could simply be ROT
            scores.push({ name:'Caesar / ROT Cipher', score:Math.round(50 + ic * 250), why:`Alpha-only text with IoC ${ic.toFixed(4)} consistent with a simple Caesar shift`, tool:'rot', toolLabel:'ROT Cipher' });
        }
        // Vigenère (IoC between random and monoalphabetic)
        if (ic >= 0.038 && ic <= 0.060) {
            scores.push({ name:'Vigenère Cipher', score:Math.round(40 + (0.065 - Math.abs(ic - 0.052)) * 500), why:`IoC = ${ic.toFixed(4)} — between random (0.038) and monoalphabetic (0.065), suggesting a polyalphabetic cipher`, tool:'vigenere', toolLabel:'Vigenère Cipher' });
        }
        // Atbash check: if reversing alphabet gives English IoC
        const atbashTest = alphaText.toLowerCase().split('').map(c => String.fromCharCode(219 - c.charCodeAt(0))).join('');
        const atIc = ioc(atbashTest);
        if (atIc > 0.055) {
            scores.push({ name:'Atbash Cipher', score:72, why:`After Atbash reversal, IoC = ${atIc.toFixed(4)} — close to English, suggesting A↔Z mapping`, tool:'classical-ciphers', toolLabel:'Classical Ciphers' });
        }
    }

    // Polybius check (only digits 1-5, even length)
    if (/^[1-5\s]+$/.test(text) && text.replace(/\s/g,'').length % 2 === 0) {
        scores.push({ name:'Polybius Square', score:78, why:'Only digits 1-5, even character count — matches Polybius coordinate pairs', tool:'classical-ciphers', toolLabel:'Classical Ciphers' });
    }

    // Rail fence hint (alpha only, no clear frequency pattern)
    if (onlyAlpha && ic > 0.055 && ic < 0.068 && len > 20) {
        scores.push({ name:'Rail Fence Cipher', score:45, why:'Alpha text with near-English IoC but no single-shift Caesar match — could be transposition', tool:'classical-ciphers', toolLabel:'Classical Ciphers' });
    }

    scores.sort((a,b) => b.score - a.score);
    return scores.slice(0, 5);
}

function identify() {
    const text = document.getElementById('input').value.trim();
    const res = document.getElementById('results');
    if (!text) { res.style.display = 'none'; return; }

    const top = analyze(text);

    if (!top.length) {
        res.innerHTML = `<div class="tool-panel" style="color:var(--text-muted);font-size:14px;">No strong cipher match detected. The input may be random data, an unknown encoding, or requires more text.</div>`;
        res.style.display = '';
        return;
    }

    let html = `<h2 style="font-size:15px;font-weight:700;color:var(--text);margin:0 0 14px;">Results</h2>`;
    top.forEach((r, i) => {
        const color = i === 0 ? 'var(--accent)' : i === 1 ? 'var(--accent-2)' : 'var(--text-muted)';
        const barW = r.score;
        html += `<div class="tool-panel" style="margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="background:${color};color:var(--bg);font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">#${i+1}</span>
                    <span style="font-size:16px;font-weight:700;color:var(--text);">${escHtml(r.name)}</span>
                </div>
                <span style="font-size:13px;font-weight:600;color:${color};">${r.score}%</span>
            </div>
            <div style="background:var(--surface-2);border-radius:4px;height:6px;margin-bottom:10px;overflow:hidden;">
                <div style="height:100%;width:${barW}%;background:${color};border-radius:4px;transition:width 400ms;"></div>
            </div>
            <p style="font-size:13px;color:var(--text-muted);margin:0 0 10px;">Why: ${escHtml(r.why)}</p>
            ${r.tool ? `<a href="${TOOL_LINKS[r.tool] || '#'}" style="font-size:13px;color:var(--accent);text-decoration:none;">Try in ${escHtml(r.toolLabel)} →</a>` : ''}
        </div>`;
    });

    res.innerHTML = html;
    res.style.display = '';
}

function escHtml(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}
