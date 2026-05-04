/* Frequency Analyzer — CyberTools */

const EN_FREQ = {
    A:8.2,B:1.5,C:2.8,D:4.3,E:12.7,F:2.2,G:2.0,H:6.1,I:7.0,J:0.15,
    K:0.77,L:4.0,M:2.4,N:6.7,O:7.5,P:1.9,Q:0.10,R:6.0,S:6.3,T:9.1,
    U:2.8,V:0.98,W:2.4,X:0.15,Y:2.0,Z:0.074
};

let lastAnalysis = null;

function autoAnalyze() {
    const txt = document.getElementById('input').value;
    if (txt.trim().length >= 20) analyze();
    else if (!txt.trim()) clearResults();
}

function analyze() {
    const raw = document.getElementById('input').value;
    if (!raw.trim()) return;
    const text = raw.toUpperCase().replace(/[^A-Z]/g, '');
    if (text.length < 2) return;

    const counts = {};
    for (let c = 65; c <= 90; c++) counts[String.fromCharCode(c)] = 0;
    for (const ch of text) counts[ch]++;
    const N = text.length;

    // IoC
    let iocSum = 0;
    for (const k in counts) iocSum += counts[k] * (counts[k] - 1);
    const ioc = N > 1 ? iocSum / (N * (N - 1)) : 0;

    lastAnalysis = { counts, N, ioc, raw };
    renderChart(counts, N);
    renderStats(N, ioc, raw);
    renderCaesar(raw);
    document.getElementById('results').style.display = '';
    document.getElementById('stats-bar').textContent = `${N} letters · IoC ${ioc.toFixed(4)}`;
}

function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('stats-bar').textContent = '';
}

function renderChart(counts, N) {
    const maxObs = Math.max(...Object.values(counts)) / N * 100 || 1;
    const maxExp = Math.max(...Object.values(EN_FREQ));
    const scale = Math.max(maxObs, maxExp);

    let html = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    letters.forEach(ch => {
        const obs = N > 0 ? (counts[ch] / N * 100) : 0;
        const exp = EN_FREQ[ch];
        const obsW = (obs / scale * 100).toFixed(1);
        const expW = (exp / scale * 100).toFixed(1);
        html += `<div style="display:flex;align-items:center;gap:8px;font-size:12px;">
            <span style="width:14px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;flex-shrink:0;">${ch}</span>
            <div style="flex:1;position:relative;height:16px;">
                <div style="position:absolute;top:0;left:0;height:100%;width:${obsW}%;background:var(--accent);opacity:0.85;border-radius:2px;transition:width 300ms;"></div>
                <div style="position:absolute;top:4px;left:0;height:8px;width:${expW}%;background:var(--border);border-radius:2px;"></div>
            </div>
            <span style="width:44px;text-align:right;color:var(--text);font-family:'JetBrains Mono',monospace;">${obs.toFixed(1)}%</span>
            <span style="width:32px;text-align:right;color:var(--text-muted);font-size:11px;">${counts[ch]}</span>
        </div>`;
    });
    document.getElementById('freq-chart').innerHTML = html;
}

function renderStats(N, ioc, raw) {
    const iocLabel = ioc > 0.060 ? 'Likely monoalphabetic substitution or English' :
                     ioc > 0.047 ? 'Possibly short key Vigenère or mixed' :
                     'Likely polyalphabetic / random';
    const items = [
        ['Total characters (raw)', raw.length],
        ['Alphabetic characters', N],
        ['Unique letters used', Object.values(lastAnalysis.counts).filter(v=>v>0).length],
        ['Index of Coincidence', ioc.toFixed(5)],
        ['IoC interpretation', iocLabel],
        ['English IoC', '≈ 0.06500'],
        ['Random IoC', '≈ 0.03846'],
    ];
    document.getElementById('stats-grid').innerHTML = items.map(([k,v]) =>
        `<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:12px;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">${escHtml(k)}</div>
            <div style="font-size:14px;font-weight:600;color:var(--text);font-family:'JetBrains Mono',monospace;">${escHtml(String(v))}</div>
        </div>`
    ).join('');
}

function rotShift(text, n) {
    return text.replace(/[a-zA-Z]/g, ch => {
        const base = ch <= 'Z' ? 65 : 97;
        return String.fromCharCode((ch.charCodeAt(0) - base + n) % 26 + base);
    });
}

function chiSquared(text) {
    const upper = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (!upper.length) return 9999;
    const counts = {};
    for (let c = 65; c <= 90; c++) counts[String.fromCharCode(c)] = 0;
    for (const ch of upper) counts[ch]++;
    const N = upper.length;
    let chi = 0;
    for (const k in EN_FREQ) {
        const observed = counts[k];
        const expected = EN_FREQ[k] / 100 * N;
        chi += Math.pow(observed - expected, 2) / expected;
    }
    return chi;
}

function renderCaesar(raw) {
    const rows = [];
    for (let shift = 1; shift <= 25; shift++) {
        const decoded = rotShift(raw, shift);
        const chi = chiSquared(decoded);
        rows.push({ shift, decoded, chi });
    }
    rows.sort((a, b) => a.chi - b.chi);

    let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">';
    html += '<thead><tr>';
    ['Rank','Shift','Chi²','Preview (first 80 chars)'].forEach(h => {
        html += `<th style="text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-muted);font-weight:600;white-space:nowrap;">${h}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.forEach((row, i) => {
        const preview = row.decoded.substring(0, 80) + (row.decoded.length > 80 ? '…' : '');
        const highlight = i === 0 ? 'background:rgba(var(--accent-rgb,0,255,136),0.08);' : '';
        html += `<tr style="${highlight}cursor:pointer;" onclick="copyAndHighlight(this,'${escHtml(row.decoded.replace(/'/g,"\\'"))}')" title="Click to copy full decryption">
            <td style="padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-muted);">${i+1}</td>
            <td style="padding:8px 10px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;color:var(--accent);font-weight:700;">ROT${row.shift}</td>
            <td style="padding:8px 10px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;color:${i<3?'var(--success)':'var(--text-muted)'};">${row.chi.toFixed(1)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;word-break:break-all;">${escHtml(preview)}</td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    document.getElementById('caesar-table').innerHTML = html;
}

function copyAndHighlight(row, text) {
    navigator.clipboard.writeText(text).catch(() => {});
    row.style.outline = '2px solid var(--accent)';
    setTimeout(() => row.style.outline = '', 1200);
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}
