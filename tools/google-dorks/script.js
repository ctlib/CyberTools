/* Google Dorks Builder - CyberTools */

const DORK_LIBRARY = [
    { cat: 'Admin Panels', query: 'intitle:"admin panel" site:{target}', desc: 'Find admin panels on a target site' },
    { cat: 'Admin Panels', query: 'inurl:/admin/login site:{target}', desc: 'Admin login pages on target' },
    { cat: 'Admin Panels', query: 'inurl:/wp-admin site:{target}', desc: 'WordPress admin login pages' },
    { cat: 'Admin Panels', query: 'intitle:"phpMyAdmin" inurl:/phpmyadmin/ site:{target}', desc: 'phpMyAdmin database management interfaces' },
    { cat: 'Admin Panels', query: 'intitle:"Plesk" inurl:8443 site:{target}', desc: 'Plesk web hosting control panels' },
    { cat: 'Admin Panels', query: 'intitle:"cPanel" inurl:2082 OR inurl:2083 site:{target}', desc: 'cPanel hosting dashboards' },
    { cat: 'Admin Panels', query: 'inurl:/administrator/index.php intitle:"Joomla" site:{target}', desc: 'Joomla CMS admin panels' },
    { cat: 'Admin Panels', query: 'inurl:/admin.php intitle:"admin" site:{target}', desc: 'Generic PHP admin pages' },

    { cat: 'Open Directories', query: 'intitle:"Index of /" site:{target}', desc: 'Apache/Nginx open directory listings on target' },
    { cat: 'Open Directories', query: 'intitle:"Index of" "parent directory" site:{target}', desc: 'Directories with parent directory links exposed' },
    { cat: 'Open Directories', query: 'intitle:"Index of" ".git" site:{target}', desc: 'Exposed .git directories' },
    { cat: 'Open Directories', query: 'intitle:"Index of" backup site:{target}', desc: 'Backup directories exposed to web' },
    { cat: 'Open Directories', query: 'intitle:"Index of" password site:{target}', desc: 'Directories potentially containing password files' },
    { cat: 'Open Directories', query: 'intitle:"Index of" ".ssh" site:{target}', desc: 'SSH configuration directories exposed' },

    { cat: 'Config & Env', query: 'filetype:env "DB_PASSWORD" site:{target}', desc: 'Exposed .env files with database credentials' },
    { cat: 'Config & Env', query: 'filetype:env "SECRET_KEY" site:{target}', desc: '.env files with application secret keys' },
    { cat: 'Config & Env', query: 'filetype:env "AWS_ACCESS_KEY" site:{target}', desc: '.env files with AWS credentials' },
    { cat: 'Config & Env', query: 'filetype:xml "connectionString" site:{target}', desc: 'XML config files with database connection strings' },
    { cat: 'Config & Env', query: 'filetype:cfg "password" site:{target}', desc: '.cfg configuration files with passwords' },
    { cat: 'Config & Env', query: 'ext:yml "password:" site:{target}', desc: 'YAML config files with password fields on target' },
    { cat: 'Config & Env', query: 'filetype:json "api_key" site:{target}', desc: 'JSON files with API key fields' },
    { cat: 'Config & Env', query: 'filetype:ini "password" site:{target}', desc: '.ini configuration files with passwords' },
    { cat: 'Config & Env', query: 'ext:conf "password" site:{target}', desc: '.conf files with passwords on target' },

    { cat: 'Databases', query: 'filetype:sql "INSERT INTO" site:{target}', desc: 'Exposed SQL database dump files' },
    { cat: 'Databases', query: 'filetype:sql "CREATE TABLE" site:{target}', desc: 'SQL schema files exposing table structure' },
    { cat: 'Databases', query: 'ext:sqlite OR ext:db site:{target}', desc: 'SQLite database files on target' },
    { cat: 'Databases', query: 'filetype:mdb site:{target}', desc: 'Microsoft Access database files' },
    { cat: 'Databases', query: 'intitle:"phpMyAdmin" "Welcome to phpMyAdmin" site:{target}', desc: 'Exposed phpMyAdmin pages' },

    { cat: 'Login Pages', query: 'inurl:login site:{target}', desc: 'Login pages on a specific target' },
    { cat: 'Login Pages', query: 'intitle:"login" inurl:/account/ site:{target}', desc: 'Account login pages' },
    { cat: 'Login Pages', query: 'inurl:/signin filetype:php site:{target}', desc: 'PHP signin pages' },
    { cat: 'Login Pages', query: 'inurl:/login.aspx site:{target}', desc: 'ASP.NET login pages' },

    { cat: 'IP Cameras', query: 'intitle:"webcamXP 5"', desc: 'WebcamXP surveillance cameras' },
    { cat: 'IP Cameras', query: 'inurl:/view/index.shtml "network camera"', desc: 'Axis network camera live views' },
    { cat: 'IP Cameras', query: 'intitle:"Live View / - AXIS"', desc: 'AXIS camera management interfaces' },
    { cat: 'IP Cameras', query: 'inurl:"/mjpg/video.mjpg"', desc: 'Motion JPEG camera streams' },
    { cat: 'IP Cameras', query: 'intitle:"IP Camera" inurl:LVAppl', desc: 'IP camera login pages' },

    { cat: 'Sensitive Files', query: 'filetype:log "password" site:{target}', desc: 'Log files containing password strings' },
    { cat: 'Sensitive Files', query: 'filetype:bak site:{target}', desc: 'Backup files on target site' },
    { cat: 'Sensitive Files', query: 'ext:pem OR ext:key OR ext:p12 site:{target}', desc: 'Private key or certificate files on target' },
    { cat: 'Sensitive Files', query: 'inurl:/.ssh/id_rsa site:{target}', desc: 'Exposed SSH private key files' },
    { cat: 'Sensitive Files', query: 'filetype:xls "username" "password" site:{target}', desc: 'Excel spreadsheets with credentials' },
    { cat: 'Sensitive Files', query: 'filetype:log inurl:"/var/log" site:{target}', desc: 'Server log files accessible via web' },
    { cat: 'Sensitive Files', query: 'ext:txt "BEGIN PRIVATE KEY" site:{target}', desc: 'Text files containing private key PEM data' },

    { cat: 'Code & Repos', query: 'site:github.com "password" "{target}"', desc: 'GitHub repos mentioning target domain with passwords' },
    { cat: 'Code & Repos', query: 'site:pastebin.com "{target}" "password"', desc: 'Pastebin pastes with target and password' },
    { cat: 'Code & Repos', query: 'site:trello.com "{target}"', desc: 'Trello boards mentioning target organization' },
    { cat: 'Code & Repos', query: 'site:jira.{target}', desc: 'Exposed Jira project management instances' },
    { cat: 'Code & Repos', query: 'site:gitlab.{target} "password"', desc: 'Self-hosted GitLab instances with passwords' },
    { cat: 'Code & Repos', query: 'filetype:py "import requests" "password" "{target}"', desc: 'Python scripts with hardcoded passwords and target reference' },

    { cat: 'Network', query: 'intitle:"RouterOS" inurl:winbox', desc: 'MikroTik RouterOS management pages' },
    { cat: 'Network', query: 'intitle:"pfSense" inurl:index.php', desc: 'pfSense firewall admin pages' },
    { cat: 'Network', query: 'inurl:"/dana-na/auth" "Juniper"', desc: 'Juniper VPN login pages' },
    { cat: 'Network', query: 'intitle:"Cisco Systems" "Last login"', desc: 'Cisco device management interfaces' },
    { cat: 'Network', query: 'intitle:"PRTG Network Monitor"', desc: 'PRTG Network Monitor dashboards' },
];

const CATEGORIES = ['All', ...new Set(DORK_LIBRARY.map((d) => d.cat))];
let activeCat = 'All';
let isRenderingBuilder = false;

function cleanTarget(input) {
    return (input || '')
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/.*$/, '')
        .replace(/[^a-z0-9.-]/gi, '');
}

function currentTarget() {
    return cleanTarget(document.getElementById('f-site').value) || 'example.com';
}

function materializeQuery(query) {
    return query.replace(/\{target\}/g, currentTarget());
}

function initCatTabs() {
    document.getElementById('cat-tabs').innerHTML = CATEGORIES.map((c) =>
        `<button onclick="setCat('${escAttr(c)}')" id="cat-${c.replace(/[^a-z]/gi, '-')}" style="${tabStyle(c === 'All')}">${escHtml(c)}</button>`
    ).join('');
}

function setCat(cat) {
    activeCat = cat;
    CATEGORIES.forEach((c) => {
        const b = document.getElementById('cat-' + c.replace(/[^a-z]/gi, '-'));
        if (b) b.style.cssText = tabStyle(c === cat);
    });
    renderDorks();
}

function tabStyle(active) {
    return `padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:${active ? 'var(--accent)' : 'var(--surface)'};color:${active ? 'var(--bg)' : 'var(--text-muted)'};`;
}

function renderDorks() {
    const search = document.getElementById('dork-search');
    const list = document.getElementById('dork-list');
    if (!search || !list) return;

    const q = (search.value || '').toLowerCase().trim();
    const filtered = DORK_LIBRARY.filter((d) => {
        if (activeCat !== 'All' && d.cat !== activeCat) return false;
        if (!q) return true;
        return d.query.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q);
    });

    document.getElementById('dork-count').textContent = `(${filtered.length})`;

    if (!filtered.length) {
        list.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No dorks match your search.</p>';
        return;
    }

    list.innerHTML = filtered.map((d) => {
        const finalQuery = materializeQuery(d.query);
        return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);">
                <span style="font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--accent);">${escHtml(d.cat)}</span>
                <div style="display:flex;gap:6px;">
                    <button onclick="copyDork('${escAttr(finalQuery)}')" style="background:var(--surface-2);border:1px solid var(--border);border-radius:5px;padding:3px 9px;font-size:12px;color:var(--text-muted);cursor:pointer;">Copy</button>
                    <button onclick="searchDork('${escAttr(finalQuery)}')" style="background:var(--surface-2);border:1px solid var(--border);border-radius:5px;padding:3px 9px;font-size:12px;color:var(--text-muted);cursor:pointer;">Search</button>
                    <button onclick="loadDorkToBuilder('${escAttr(finalQuery)}')" style="background:var(--surface-2);border:1px solid var(--border);border-radius:5px;padding:3px 9px;font-size:12px;color:var(--text-muted);cursor:pointer;">Edit</button>
                </div>
            </div>
            <pre style="margin:0;padding:12px 14px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--text);white-space:pre-wrap;word-break:break-all;">${escHtml(finalQuery)}</pre>
            <div style="padding:8px 14px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">${escHtml(d.desc)}</div>
        </div>`;
    }).join('');
}

function buildQuery() {
    const parts = [];
    const site = cleanTarget(document.getElementById('f-site').value);
    const filetype = document.getElementById('f-filetype').value.trim().replace(/[^a-z0-9]/gi, '');
    const intitle = document.getElementById('f-intitle').value.trim().replace(/"/g, '');
    const inurl = document.getElementById('f-inurl').value.trim().replace(/\s/g, '');
    const intext = document.getElementById('f-intext').value.trim().replace(/"/g, '');
    const custom = document.getElementById('f-custom').value.trim();

    if (site) parts.push(`site:${site}`);
    if (filetype) parts.push(`filetype:${filetype}`);
    if (intitle) parts.push(`intitle:"${intitle}"`);
    if (inurl) parts.push(`inurl:${inurl}`);
    if (intext) parts.push(`intext:"${intext}"`);
    if (custom) parts.push(materializeQuery(custom));

    const query = parts.join(' ');
    document.getElementById('query-preview').textContent = query || '(empty - fill in fields above)';

    if (!isRenderingBuilder) renderDorks();
    return query;
}

function copyQuery() {
    const q = buildQuery();
    if (!q) return;
    navigator.clipboard.writeText(q).catch(() => {});
}

function searchGoogle() {
    const q = buildQuery();
    if (!q) return;
    window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener,noreferrer');
}

function clearBuilder() {
    isRenderingBuilder = true;
    ['f-site', 'f-intitle', 'f-inurl', 'f-intext', 'f-custom'].forEach((id) => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-filetype').value = '';
    isRenderingBuilder = false;
    buildQuery();
}

function copyDork(query) {
    navigator.clipboard.writeText(query).catch(() => {});
}

function searchDork(query) {
    window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank', 'noopener,noreferrer');
}

function loadDorkToBuilder(query) {
    isRenderingBuilder = true;
    clearBuilder();
    document.getElementById('f-custom').value = query;
    isRenderingBuilder = false;
    buildQuery();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function escAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
