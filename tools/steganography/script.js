const STEGO_MAGIC = [67, 84, 83, 71];
const STEGO_HEADER_BYTES = 8;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

function previewImage(file, canvasSelector, callback) {
    if (!file) return;

    const image = new Image();
    const canvas = document.querySelector(canvasSelector);
    const ctx = canvas.getContext('2d');
    const objectUrl = URL.createObjectURL(file);

    image.onload = function () {
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.style.display = 'block';

        ctx.drawImage(image, 0, 0);
        URL.revokeObjectURL(objectUrl);

        if (callback) callback();
    };

    image.src = objectUrl;
}

function getCanvasContext(canvasId) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
        alert('Please choose an image first!');
        return null;
    }

    return {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        width: canvas.width,
        height: canvas.height
    };
}

function getCapacityBytes(width, height) {
    return Math.floor((width * height * 3) / 8);
}

function numberToBytes(value) {
    return [
        Math.floor(value / 16777216) & 255,
        (value >> 16) & 255,
        (value >> 8) & 255,
        value & 255
    ];
}

function bytesToNumber(bytes, offset) {
    return (
        bytes[offset] * 16777216 +
        (bytes[offset + 1] << 16) +
        (bytes[offset + 2] << 8) +
        bytes[offset + 3]
    );
}

function bytesToBits(bytes) {
    const bits = [];

    for (let i = 0; i < bytes.length; i++) {
        for (let bit = 7; bit >= 0; bit--) {
            bits.push((bytes[i] >> bit) & 1);
        }
    }

    return bits;
}

function writeBitsToPixels(pixels, bits) {
    let bitIndex = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        for (let offset = 0; offset < 3; offset++) {
            if (bitIndex >= bits.length) return;

            pixels[i + offset] = (pixels[i + offset] & 254) | bits[bitIndex];
            bitIndex++;
        }
    }
}

function readBytesFromPixels(pixels, byteCount) {
    const bytes = new Uint8Array(byteCount);
    let byteIndex = 0;
    let currentByte = 0;
    let bitCount = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        for (let offset = 0; offset < 3; offset++) {
            currentByte = (currentByte << 1) | (pixels[i + offset] & 1);
            bitCount++;

            if (bitCount === 8) {
                bytes[byteIndex] = currentByte;
                byteIndex++;

                if (byteIndex >= byteCount) {
                    return bytes;
                }

                currentByte = 0;
                bitCount = 0;
            }
        }
    }

    return bytes.slice(0, byteIndex);
}

function hasStegoMagic(bytes) {
    for (let i = 0; i < STEGO_MAGIC.length; i++) {
        if (bytes[i] !== STEGO_MAGIC[i]) return false;
    }

    return true;
}

function decodeLegacyMessage(pixels) {
    let output = '';
    let currentByte = 0;
    let bitCount = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        for (let offset = 0; offset < 3; offset++) {
            currentByte = (currentByte << 1) | (pixels[i + offset] & 1);
            bitCount++;

            if (bitCount === 8) {
                if (currentByte === 0) return output;

                output += String.fromCharCode(currentByte);
                currentByte = 0;
                bitCount = 0;
            }
        }
    }

    return output;
}

function encodeMessage() {
    const text = document.getElementById('encodeText').value;

    if (!text) {
        alert('Please enter a message!');
        return;
    }

    const canvasContext = getCanvasContext('encodeCanvas');

    if (!canvasContext) return;

    const canvas = canvasContext.canvas;
    const ctx = canvasContext.ctx;
    const width = canvasContext.width;
    const height = canvasContext.height;
    const messageBytes = textEncoder.encode(text);
    const payload = new Uint8Array(STEGO_HEADER_BYTES + messageBytes.length);

    payload.set(STEGO_MAGIC, 0);
    payload.set(numberToBytes(messageBytes.length), 4);
    payload.set(messageBytes, STEGO_HEADER_BYTES);

    if (payload.length > getCapacityBytes(width, height)) {
        alert('Text too long for chosen image!');
        return;
    }

    const messageData = ctx.getImageData(0, 0, width, height);
    const pixels = messageData.data;

    writeBitsToPixels(pixels, bytesToBits(payload));
    ctx.putImageData(messageData, 0, 0);

    const link = document.getElementById('downloadLink');
    link.href = canvas.toDataURL('image/png');
    link.download = 'encoded.png';
    link.classList.remove('hidden');
    link.style.display = 'inline-block';
    link.textContent = 'Download Encoded Image';
    link.click();
}

function decodeMessage() {
    const canvasContext = getCanvasContext('decodeCanvas');

    if (!canvasContext) return;

    const ctx = canvasContext.ctx;
    const width = canvasContext.width;
    const height = canvasContext.height;
    const capacityBytes = getCapacityBytes(width, height);
    const original = ctx.getImageData(0, 0, width, height);
    const pixels = original.data;
    const header = readBytesFromPixels(pixels, STEGO_HEADER_BYTES);

    if (header.length < STEGO_HEADER_BYTES) {
        document.getElementById('decodedText').textContent = 'No hidden message found.';
        return;
    }

    if (!hasStegoMagic(header)) {
        const legacyOutput = decodeLegacyMessage(pixels);
        document.getElementById('decodedText').textContent = legacyOutput || 'No hidden message found.';
        return;
    }

    const messageLength = bytesToNumber(header, 4);

    if (messageLength <= 0 || messageLength > capacityBytes - STEGO_HEADER_BYTES) {
        document.getElementById('decodedText').textContent = 'No hidden message found.';
        return;
    }

    const payload = readBytesFromPixels(pixels, STEGO_HEADER_BYTES + messageLength);
    const messageBytes = payload.slice(STEGO_HEADER_BYTES);
    const output = textDecoder.decode(messageBytes);

    document.getElementById('decodedText').textContent = output || 'No hidden message found.';
}

document.getElementById('encodeImage').addEventListener('change', function (e) {
    previewImage(e.target.files[0], '#encodeCanvas', function () {
        console.log('Image ready for encoding');
    });
});

document.getElementById('decodeImage').addEventListener('change', function (e) {
    previewImage(e.target.files[0], '#decodeCanvas', function () {
        console.log('Image ready for decoding');
    });
});

document.getElementById('encodeBtn').addEventListener('click', function (e) {
    e.preventDefault();
    encodeMessage();
});

document.getElementById('decodeBtn').addEventListener('click', function (e) {
    e.preventDefault();
    decodeMessage();
});
