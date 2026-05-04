/* ============================================================
   UUID Generator — script.js
   v4 (crypto random), v1 (time-based), v7 (time-ordered),
   ULID, NanoID
   ============================================================ */

/* ---- UUID v4 ---- */
function uuidV4() {
    if (crypto.randomUUID) return crypto.randomUUID();
    var arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;
    function hex(n) { return n.toString(16).padStart(2, '0'); }
    return [
        arr.slice(0, 4).reduce((a, b) => a + hex(b), ''),
        arr.slice(4, 6).reduce((a, b) => a + hex(b), ''),
        arr.slice(6, 8).reduce((a, b) => a + hex(b), ''),
        arr.slice(8, 10).reduce((a, b) => a + hex(b), ''),
        arr.slice(10).reduce((a, b) => a + hex(b), ''),
    ].join('-');
}

/* ---- UUID v1 (simulated — random node, counter=0) ---- */
function uuidV1() {
    var now = Date.now();
    var timeLow = (now & 0xffffffff) >>> 0;
    var timeMid = ((now / 0x100000000) & 0xffff) >>> 0;
    var timeHigh = (((now / 0x100000000) >>> 16) & 0x0fff) | 0x1000;
    var clockSeq = (crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff) | 0x8000;
    var nodeArr = new Uint8Array(6);
    crypto.getRandomValues(nodeArr);
    nodeArr[0] |= 0x01; // multicast bit (simulated node)
    function h(n, pad) { return n.toString(16).padStart(pad, '0'); }
    var node = Array.from(nodeArr).map(b => b.toString(16).padStart(2, '0')).join('');
    return h(timeLow, 8) + '-' + h(timeMid, 4) + '-' + h(timeHigh, 4) + '-' + h(clockSeq, 4) + '-' + node;
}

/* ---- UUID v7 (Unix timestamp ms + random) ---- */
function uuidV7() {
    var ts = BigInt(Date.now());
    var msHi = Number((ts >> 16n) & 0xffffn);
    var msLo = Number(ts & 0xffffn);
    var rand = new Uint8Array(10);
    crypto.getRandomValues(rand);
    var ver = (rand[0] & 0x0f) | 0x70;
    var var_ = (rand[2] & 0x3f) | 0x80;
    function h(n, pad) { return n.toString(16).padStart(pad, '0'); }
    var msHex = Number(ts).toString(16).padStart(12, '0');
    var r1 = (rand[0] & 0x0f).toString(16) + rand.slice(1, 2).reduce((a, b) => a + b.toString(16).padStart(2, '0'), '');
    var r2 = ((rand[2] & 0x3f) | 0x80).toString(16) + rand.slice(3, 4).reduce((a, b) => a + b.toString(16).padStart(2, '0'), '');
    var r3 = Array.from(rand.slice(4)).map(b => b.toString(16).padStart(2, '0')).join('');
    return msHex.slice(0, 8) + '-' + msHex.slice(8, 12) + '-7' + r1.slice(1, 4) + '-' + r2 + '-' + r3;
}

/* ---- ULID ---- */
var ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function ulid() {
    var ts = Date.now();
    var tsChars = '';
    for (var i = 9; i >= 0; i--) {
        tsChars = ENCODING[ts % 32] + tsChars;
        ts = Math.floor(ts / 32);
    }
    var rand = new Uint8Array(10);
    crypto.getRandomValues(rand);
    var randChars = '';
    var n = BigInt(0);
    rand.forEach(function (b) { n = (n << 8n) | BigInt(b); });
    for (var i = 15; i >= 0; i--) {
        randChars = ENCODING[Number(n % 32n)] + randChars;
        n >>= 5n;
    }
    return tsChars + randChars;
}

/* ---- NanoID (21 chars, URL-safe) ---- */
var NANO_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
function nanoid(size) {
    size = size || 21;
    var arr = new Uint8Array(size);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(function (b) { return NANO_ALPHABET[b & 63]; }).join('');
}

/* ---- UI ---- */
function generate() {
    var version = document.querySelector('input[name="uuidVer"]:checked').value;
    var count   = parseInt(document.getElementById('uuidCount').value, 10) || 1;
    var upper   = document.getElementById('uuidUpper').checked;

    var output = document.getElementById('uuidOutput');
    var lines = [];
    for (var i = 0; i < count; i++) {
        var id;
        switch (version) {
            case 'v4':   id = uuidV4(); break;
            case 'v1':   id = uuidV1(); break;
            case 'v7':   id = uuidV7(); break;
            case 'ulid': id = ulid();   break;
            case 'nano': id = nanoid(); break;
            default:     id = uuidV4();
        }
        lines.push(upper && version !== 'ulid' && version !== 'nano' ? id.toUpperCase() : id);
    }
    output.value = lines.join('\n');
}

function copyAll() {
    var val = document.getElementById('uuidOutput').value;
    if (val) CyberTools.copyText(val, document.getElementById('copyAllBtn'));
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('copyAllBtn').addEventListener('click', copyAll);
    generate();
});
