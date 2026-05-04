const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');

encodeBtn.addEventListener('click', () => {
    const text = document.getElementById('encodeText').value;
    if (text) {
        document.getElementById('encodedResult').value = btoa(unescape(encodeURIComponent(text)));
    } else {
        document.getElementById('encodedResult').value = '';
    }
});

decodeBtn.addEventListener('click', () => {
    const text = document.getElementById('decodeText').value;
    if (text) {
        try {
            document.getElementById('decodedResult').value = decodeURIComponent(escape(atob(text)));
        } catch (e) {
            document.getElementById('decodedResult').value = 'Invalid Base64 string!';
        }
    } else {
        document.getElementById('decodedResult').value = '';
    }
});
