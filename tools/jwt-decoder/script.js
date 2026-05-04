function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    str += '=='.slice((2 - str.length * 3) & 3);
    return decodeURIComponent(
        atob(str)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
    );
}

function base64UrlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Decode JWT
document.getElementById('decodeBtn').addEventListener('click', () => {
    const token = document.getElementById('jwtInput').value.trim();
    if (!token) return alert('Please enter a JWT.');

    const parts = token.split('.');
    if (parts.length !== 3) return alert('Invalid JWT format.');

    try {
        document.getElementById('headerOutput').textContent = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
        document.getElementById('payloadOutput').textContent = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
        document.getElementById('signatureOutput').textContent = parts[2];
    } catch (e) {
        alert('Invalid JWT content.');
    }
});

document.getElementById('clearDecodeBtn').addEventListener('click', () => {
    document.getElementById('jwtInput').value = '';
    document.getElementById('headerOutput').textContent = '';
    document.getElementById('payloadOutput').textContent = '';
    document.getElementById('signatureOutput').textContent = '';
});

// Encode JWT
document.getElementById('encodeBtn').addEventListener('click', () => {
    try {
        const header = JSON.stringify(JSON.parse(document.getElementById('headerInput').value));
        const payload = JSON.stringify(JSON.parse(document.getElementById('payloadInput').value));
        const jwt = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
        document.getElementById('encodedOutput').value = jwt;
    } catch (e) {
        alert('Invalid JSON input.');
    }
});

document.getElementById('clearEncodeBtn').addEventListener('click', () => {
    document.getElementById('headerInput').value = '';
    document.getElementById('payloadInput').value = '';
    document.getElementById('encodedOutput').value = '';
});
