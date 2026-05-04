function rc4(key, str) {
    const s = new Uint8Array(256);
    const k = new Uint8Array(256);
    const result = new Uint8Array(str.length);
    for (let i = 0; i < 256; i++) {
        s[i] = i;
        k[i] = key.charCodeAt(i % key.length);
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + k[i]) & 255;
        [s[i], s[j]] = [s[j], s[i]];
    }
    let i = 0;
    j = 0;
    for (let n = 0; n < str.length; n++) {
        i = (i + 1) & 255;
        j = (j + s[i]) & 255;
        [s[i], s[j]] = [s[j], s[i]];
        result[n] = str.charCodeAt(n) ^ s[(s[i] + s[j]) & 255];
    }
    return result;
}

function stringToBase64(str) {
    return btoa(String.fromCharCode(...str));
}

function base64ToString(base64) {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return String.fromCharCode(...bytes);
}

// Encrypt
document.getElementById('rc4EncryptBtn').addEventListener('click', () => {
    const text = document.getElementById('rc4EncryptInput').value;
    const key = document.getElementById('rc4EncryptKey').value;
    if (text && key) {
        const encrypted = rc4(key, text);
        document.getElementById('rc4EncryptedResult').value = stringToBase64(encrypted);
    } else {
        document.getElementById('rc4EncryptedResult').value = '';
    }
});

// Decrypt
document.getElementById('rc4DecryptBtn').addEventListener('click', () => {
    const base64Text = document.getElementById('rc4DecryptInput').value;
    const key = document.getElementById('rc4DecryptKey').value;
    if (base64Text && key) {
        try {
            const str = base64ToString(base64Text);
            const decrypted = rc4(key, str);
            document.getElementById('rc4DecryptedResult').value = String.fromCharCode(...decrypted);
        } catch (e) {
            document.getElementById('rc4DecryptedResult').value = 'Invalid input!';
        }
    } else {
        document.getElementById('rc4DecryptedResult').value = '';
    }
});
