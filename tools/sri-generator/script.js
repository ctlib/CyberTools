/* ============================================================
   SRI Hash Generator — script.js
   Subresource Integrity hash via WebCrypto
   ============================================================ */

async function digestBuf(algo, buffer) {
    var hashBuf = await crypto.subtle.digest(algo, buffer);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuf)));
}

async function generateFromText() {
    var content = document.getElementById('sriTextInput').value;
    if (!content) return;
    var buf = new TextEncoder().encode(content);
    await renderHashes(buf.buffer);
}

async function generateFromFile(file) {
    var buf = await file.arrayBuffer();
    document.getElementById('fileInfo').textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    await renderHashes(buf);
}

async function renderHashes(buffer) {
    var algos = ['SHA-256', 'SHA-384', 'SHA-512'];
    var wrapper = document.getElementById('sriResultWrapper');
    wrapper.style.display = '';

    var rows = await Promise.all(algos.map(async function (algo) {
        var b64 = await digestBuf(algo, buffer);
        var prefix = 'sha' + algo.replace('SHA-', '');
        var sri = prefix + '-' + b64;
        var tag = document.getElementById('sriTagType').value;
        var attr = tag === 'script'
            ? '<script src="YOUR_URL" integrity="' + sri + '" crossorigin="anonymous"></script>'
            : '<link rel="stylesheet" href="YOUR_URL" integrity="' + sri + '" crossorigin="anonymous">';
        return { algo, b64, sri, tag: attr };
    }));

    var html = rows.map(function (r) {
        return '<div class="tool-panel" style="margin-bottom:12px;">' +
            '<div class="tool-panel-label" style="margin-bottom:6px;">' + r.algo + '</div>' +
            '<div style="display:flex;gap:8px;margin-bottom:8px;">' +
            '<input class="input" type="text" readonly value="' + r.sri.replace(/"/g, '&quot;') + '" style="flex:1;font-family:JetBrains Mono,monospace;font-size:12px;" />' +
            '<button class="output-copy-btn" style="position:static;font-size:11px;padding:3px 8px;" onclick="CyberTools.copyText(\'' + r.sri.replace(/'/g, "\\'") + '\',this)">Copy hash</button>' +
            '</div>' +
            '<textarea class="output-area" readonly rows="2" style="font-size:12px;font-family:JetBrains Mono,monospace;">' + r.tag.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</textarea>' +
            '<button class="output-copy-btn" style="position:static;margin-top:6px;font-size:11px;padding:3px 8px;" onclick="CyberTools.copyText(this.previousElementSibling.value,this)">Copy tag</button>' +
            '</div>';
    }).join('');

    document.getElementById('sriResults').innerHTML = html;
}

function setupDropZone() {
    var zone  = document.getElementById('fileDropZone');
    var input = document.getElementById('fileInput');

    zone.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
        if (this.files[0]) generateFromFile(this.files[0]);
    });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function ()  { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault(); zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) generateFromFile(e.dataTransfer.files[0]);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('sriResultWrapper').style.display = 'none';
    document.getElementById('generateTextBtn').addEventListener('click', generateFromText);
    document.getElementById('sriTagType').addEventListener('change', function () {
        var btn = document.getElementById('generateTextBtn');
        if (document.getElementById('sriTextInput').value) btn.click();
    });
    document.getElementById('sriTextInput').addEventListener('input', function () {
        if (this.value) generateFromText();
    });
    setupDropZone();
});
