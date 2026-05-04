/* ============================================================
   File Entropy Analyzer — script.js
   Shannon entropy + byte frequency, detects packing/encryption
   ============================================================ */

function shannonEntropy(bytes) {
    var freq = new Array(256).fill(0);
    bytes.forEach(function (b) { freq[b]++; });
    var e = 0, len = bytes.length;
    freq.forEach(function (c) {
        if (c > 0) { var p = c / len; e -= p * Math.log2(p); }
    });
    return e;
}

function classifyEntropy(e) {
    if (e > 7.5)  return { label: 'Encrypted or compressed', color: 'var(--danger)',  desc: 'Very high entropy (> 7.5 bits/byte). File appears encrypted, compressed, or packed. No recognizable patterns.' };
    if (e > 6.5)  return { label: 'Possibly compressed',     color: 'var(--warning)', desc: 'High entropy (> 6.5). File may be partially compressed or contain mixed sections.' };
    if (e > 4.0)  return { label: 'Normal binary',           color: 'var(--accent-2)','desc': 'Medium entropy. Typical for binary files, executables with mix of code and data.' };
    if (e > 2.0)  return { label: 'Structured data / text',  color: 'var(--accent)',  desc: 'Low-medium entropy. Typical for source code, structured text, or human-readable data.' };
    return       { label: 'Highly structured / sparse',      color: 'var(--success)', desc: 'Low entropy (< 2.0). File is very structured — many repeated byte patterns or sparse data.' };
}

function computeChunked(bytes, chunkSize) {
    var chunks = [];
    for (var i = 0; i < bytes.length; i += chunkSize) {
        var chunk = bytes.slice(i, i + chunkSize);
        chunks.push({ offset: i, entropy: shannonEntropy(Array.from(chunk)) });
    }
    return chunks;
}

function renderChart(chunks, overall) {
    var canvas = document.getElementById('entropyChart');
    var ctx    = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#30363d';
    ctx.lineWidth = 0.5;
    for (var g = 0; g <= 8; g++) {
        var y = H - (g / 8) * H;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Bars
    var barW = Math.max(1, W / chunks.length);
    chunks.forEach(function (c, i) {
        var barH = (c.entropy / 8) * H;
        var ratio = c.entropy / 8;
        var r = Math.round(ratio * 248 + (1-ratio) * 63);
        var g = Math.round(ratio * 81  + (1-ratio) * 185);
        var b = Math.round(ratio * 80  + (1-ratio) * 80);
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillRect(i * barW, H - barH, barW, barH);
    });

    // Overall line
    var lineY = H - (overall / 8) * H;
    ctx.strokeStyle = '#ffffff66';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, lineY); ctx.lineTo(W, lineY); ctx.stroke();
    ctx.setLineDash([]);

    // Y-axis labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#8b949e';
    ctx.font = '10px monospace';
    for (var g2 = 0; g2 <= 8; g2 += 2) {
        var ly = H - (g2 / 8) * H;
        ctx.fillText(g2, 2, ly - 2);
    }
}

function renderFreqChart(bytes) {
    var freq = new Array(256).fill(0);
    bytes.forEach(function (b) { freq[b]++; });
    var max = Math.max.apply(null, freq);
    var canvas = document.getElementById('freqCanvas');
    var ctx    = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var barW = W / 256;
    for (var i = 0; i < 256; i++) {
        var barH = freq[i] / max * H;
        // Color printable vs non-printable
        ctx.fillStyle = (i >= 32 && i <= 126) ? 'var(--accent)' : 'var(--accent-2)';
        if (freq[i] === 0) continue;
        ctx.fillRect(i * barW, H - barH, Math.max(barW, 1), barH);
    }
}

function processFile(file) {
    document.getElementById('fileInfo').textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    var reader = new FileReader();
    reader.onload = function (e) {
        var buffer = e.target.result;
        var bytes  = new Uint8Array(buffer);
        var arr    = Array.from(bytes);

        var overall = shannonEntropy(arr);
        var cls     = classifyEntropy(overall);
        var chunkSize = Math.max(512, Math.floor(bytes.length / 200));
        var chunks  = computeChunked(bytes, chunkSize);

        document.getElementById('entropyValue').textContent   = overall.toFixed(4) + ' bits/byte';
        document.getElementById('entropyValue').style.color   = cls.color;
        document.getElementById('entropyLabel').textContent   = cls.label;
        document.getElementById('entropyLabel').style.color   = cls.color;
        document.getElementById('entropyDesc').textContent    = cls.desc;
        document.getElementById('fileSizeVal').textContent    = bytes.length.toLocaleString() + ' bytes';
        document.getElementById('uniqueBytes').textContent    = arr.filter(function (b, i, a) { return a.indexOf(b) === i; }).length + ' / 256';
        document.getElementById('nullBytes').textContent      = arr.filter(function (b) { return b === 0; }).length.toLocaleString();
        document.getElementById('printableBytes').textContent = arr.filter(function (b) { return b >= 32 && b <= 126; }).length.toLocaleString();

        renderChart(chunks, overall);
        renderFreqChart(arr);

        document.getElementById('resultWrapper').style.display = '';
    };
    reader.readAsArrayBuffer(file);
}

function setupDrop() {
    var zone = document.getElementById('dropZone');
    var inp  = document.getElementById('fileInput');
    zone.addEventListener('click', function () { inp.click(); });
    inp.addEventListener('change', function () { if (this.files[0]) processFile(this.files[0]); });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault(); zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('resultWrapper').style.display = 'none';
    setupDrop();
});
