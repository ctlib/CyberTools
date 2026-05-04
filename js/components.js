/* CyberTools - Shell Components
 * Injects shared nav, trust banner, sidebar, and footer into every page.
 * Call CyberTools.initShell({ activeTool, toolSourcePath }) at bottom of <body>.
 */

(function (CT) {
    'use strict';

    // ── Tool Registry (single source of truth) ──────────────────────────────
    CT.TOOLS = [
        // Encoding & Decoding
        { id: 'base64', name: 'Base64', desc: 'Encode and decode Base64 (standard, URL-safe, MIME)', path: 'tools/base64/', category: 'encoding', tags: ['encode', 'decode', 'base64', 'atob', 'btoa'] },
        { id: 'rot', name: 'ROT Cipher', desc: 'ROT1/5/13/18/47/48 encode and decode with auto-detect', path: 'tools/rot/', category: 'encoding', tags: ['rot13', 'caesar', 'cipher', 'encode', 'decode'] },
        { id: 'url-encoder', name: 'URL Encoder', desc: 'URL encode/decode - full, partial, double, form encoding', path: 'tools/url-encoder/', category: 'encoding', tags: ['url', 'encode', 'decode', 'percent', 'urlencode', 'query', 'string'] },
        {
            id: 'html-entities',
            name: 'HTML Entities',
            desc: 'Encode/decode HTML entities - named, decimal, and hex modes',
            path: 'tools/html-entities/',
            category: 'encoding',
            tags: ['html', 'entities', 'encode', 'decode', 'escape', 'xss', 'named', 'decimal', 'hex'],
        },

        // Hashing
        { id: 'hash', name: 'Hash Calculator', desc: 'MD5, SHA-1, SHA-256, SHA-384, SHA-512, HMAC, file hash', path: 'tools/hash/', category: 'hashing', tags: ['md5', 'sha256', 'sha512', 'sha1', 'hash', 'hmac', 'digest', 'checksum'] },
        {
            id: 'hash-identifier',
            name: 'Hash Identifier',
            desc: 'Paste any hash and get the top guesses (MD5, SHA family, NTLM, bcrypt, Argon2, …)',
            path: 'tools/hash-identifier/',
            category: 'hashing',
            tags: ['hash', 'identifier', 'detect', 'md5', 'sha1', 'sha256', 'ntlm', 'bcrypt', 'argon2', 'hashcat', 'ctf'],
        },

        // JWT & Tokens
        { id: 'jwt', name: 'JWT Decoder', desc: 'Decode, inspect, and encode JSON Web Tokens', path: 'tools/jwt-decoder/', category: 'jwt', tags: ['jwt', 'token', 'json web token', 'decode', 'encode', 'bearer'] },
        { id: 'totp', name: 'TOTP Generator', desc: 'RFC 6238 time-based one-time password generator (2FA/MFA)', path: 'tools/totp/', category: 'jwt', tags: ['totp', 'hotp', 'otp', '2fa', 'mfa', 'authenticator', 'rfc6238', 'hmac', 'token'] },

        // Modern Crypto
        { id: 'aes', name: 'AES Encryption', desc: 'AES-GCM / CBC / CTR with 128/192/256-bit keys (WebCrypto)', path: 'tools/aes/', category: 'crypto', tags: ['aes', 'aes-gcm', 'aes-cbc', 'encrypt', 'decrypt', 'symmetric', 'webcrypto', 'pbkdf2'] },
        {
            id: 'rsa',
            name: 'RSA Encryption',
            desc: 'RSA-OAEP encrypt/decrypt and RSA-PSS sign/verify with PEM export',
            path: 'tools/rsa/',
            category: 'crypto',
            tags: ['rsa', 'rsa-oaep', 'rsa-pss', 'asymmetric', 'public key', 'private key', 'encrypt', 'decrypt', 'sign', 'verify', 'pem'],
        },
        { id: 'xor', name: 'XOR Cipher', desc: 'XOR encrypt/decrypt with repeating key, hex/base64 I/O, entropy analysis', path: 'tools/xor/', category: 'crypto', tags: ['xor', 'cipher', 'encrypt', 'decrypt', 'key', 'entropy', 'ctf'] },
        { id: 'rc4', name: 'RC4', desc: 'RC4 stream cipher - legacy/educational only', path: 'tools/rc4/', category: 'crypto', tags: ['rc4', 'cipher', 'legacy', 'stream', 'encrypt', 'decrypt'] },

        // Web Security
        {
            id: 'cookie-decoder',
            name: 'Cookie Decoder',
            desc: 'Parse and audit Set-Cookie headers for security flags',
            path: 'tools/cookie-decoder/',
            category: 'web-security',
            tags: ['cookie', 'set-cookie', 'httponly', 'secure', 'samesite', 'session', 'parser'],
        },
        {
            id: 'http-headers',
            name: 'HTTP Headers Analyzer',
            desc: 'Analyze security headers: CSP, HSTS, X-Frame-Options, and more',
            path: 'tools/http-headers/',
            category: 'web-security',
            tags: ['http', 'headers', 'security', 'csp', 'hsts', 'x-frame-options', 'cors', 'referrer'],
        },
        {
            id: 'csp-analyzer',
            name: 'CSP Analyzer',
            desc: 'Parse and audit Content-Security-Policy headers - detects unsafe-inline, wildcards, missing directives',
            path: 'tools/csp-analyzer/',
            category: 'web-security',
            tags: ['csp', 'content security policy', 'unsafe-inline', 'unsafe-eval', 'xss', 'clickjacking', 'web security'],
        },
        {
            id: 'sri-generator',
            name: 'SRI Hash Generator',
            desc: 'Generate Subresource Integrity hashes for <script> and <link> tags',
            path: 'tools/sri-generator/',
            category: 'web-security',
            tags: ['sri', 'subresource integrity', 'sha256', 'sha384', 'sha512', 'script', 'link', 'cdn'],
        },
        {
            id: 'regex',
            name: 'Regex Tester',
            desc: 'Live regex tester with match highlighting, groups, replace, and flags',
            path: 'tools/regex/',
            category: 'web-security',
            tags: ['regex', 'regexp', 'regular expression', 'match', 'capture', 'replace', 'test', 'pattern'],
        },

        // Network & DNS
        {
            id: 'cidr',
            name: 'IP / CIDR Calculator',
            desc: 'Network address, broadcast, usable hosts, subnet splitting for IPv4/IPv6',
            path: 'tools/cidr/',
            category: 'network',
            tags: ['cidr', 'ip', 'subnet', 'network', 'broadcast', 'ipv4', 'ipv6', 'mask', 'split'],
        },
        {
            id: 'ports',
            name: 'Common Ports Reference',
            desc: '70+ common TCP/UDP ports with protocols and security risk labels',
            path: 'tools/ports/',
            category: 'network',
            tags: ['ports', 'tcp', 'udp', 'protocol', 'network', 'ssh', 'http', 'dns', 'ftp', 'smb'],
        },
        {
            id: 'user-agent',
            name: 'User-Agent Parser',
            desc: 'Parse browser, OS, device type, and rendering engine from UA strings',
            path: 'tools/user-agent/',
            category: 'network',
            tags: ['user-agent', 'browser', 'os', 'device', 'parser', 'chrome', 'firefox', 'safari', 'bot'],
        },

        // Utilities
        {
            id: 'password-generator',
            name: 'Password Generator',
            desc: 'Cryptographically random passwords and passphrases with entropy meter',
            path: 'tools/password-generator/',
            category: 'utilities',
            tags: ['password', 'generator', 'random', 'entropy', 'passphrase', 'diceware', 'secure'],
        },
        { id: 'json-formatter', name: 'JSON Formatter', desc: 'Format, validate, minify, and sort JSON', path: 'tools/json-formatter/', category: 'utilities', tags: ['json', 'format', 'validate', 'minify', 'pretty', 'lint'] },
        {
            id: 'timestamp',
            name: 'Timestamp Converter',
            desc: 'Unix ↔ ISO 8601 ↔ human readable, all timezones',
            path: 'tools/timestamp/',
            category: 'utilities',
            tags: ['timestamp', 'unix', 'epoch', 'iso8601', 'date', 'time', 'convert', 'timezone'],
        },
        { id: 'uuid', name: 'UUID Generator', desc: 'Generate UUID v1/v4/v7, ULID, NanoID in bulk', path: 'tools/uuid/', category: 'utilities', tags: ['uuid', 'guid', 'ulid', 'nanoid', 'identifier', 'random', 'unique'] },

        // Forensics
        { id: 'hex-viewer', name: 'Hex Viewer', desc: 'View and edit binary files in hex and ASCII', path: 'tools/hex-viewer/', category: 'forensics', tags: ['hex', 'binary', 'file', 'viewer', 'editor', 'ascii', 'bytes'] },
        { id: 'steganography', name: 'Steganography', desc: 'Hide and extract messages in images using LSB', path: 'tools/steganography/', category: 'forensics', tags: ['stego', 'steganography', 'image', 'lsb', 'hide', 'extract', 'png'] },
        {
            id: 'file-entropy',
            name: 'File Entropy Analyzer',
            desc: 'Shannon entropy analysis with per-chunk chart and byte frequency histogram',
            path: 'tools/file-entropy/',
            category: 'forensics',
            tags: ['entropy', 'shannon', 'file', 'binary', 'analysis', 'encrypted', 'compressed', 'forensics'],
        },
        {
            id: 'email-header',
            name: 'Email Header Analyzer',
            desc: 'Parse email headers, trace relay hops, check SPF/DKIM/DMARC results',
            path: 'tools/email-header/',
            category: 'forensics',
            tags: ['email', 'header', 'spf', 'dkim', 'dmarc', 'phishing', 'forensics', 'smtp', 'received'],
        },
        {
            id: 'magic-bytes',
            name: 'Magic Bytes Identifier',
            desc: 'Identify file types from magic bytes / file signatures (100+ signatures)',
            path: 'tools/magic-bytes/',
            category: 'forensics',
            tags: ['magic bytes', 'file signature', 'hex', 'identify', 'forensics', 'ctf', 'pe', 'elf', 'png', 'zip'],
        },
        {
            id: 'strings-extractor',
            name: 'Strings Extractor',
            desc: 'Extract printable ASCII and Unicode strings from binary files',
            path: 'tools/strings-extractor/',
            category: 'forensics',
            tags: ['strings', 'binary', 'forensics', 'malware', 'pe', 'elf', 'ascii', 'unicode', 'ctf'],
        },

        // Classical Ciphers
        {
            id: 'vigenere',
            name: 'Vigenère Cipher',
            desc: 'Polyalphabetic substitution cipher with Kasiski key-length analysis',
            path: 'tools/vigenere/',
            category: 'classical',
            tags: ['vigenere', 'cipher', 'polyalphabetic', 'kasiski', 'key recovery', 'ctf'],
        },
        {
            id: 'classical-ciphers',
            name: 'Classical Ciphers',
            desc: 'Atbash, Affine, A1Z26, Polybius, Rail Fence, Beaufort in one tool',
            path: 'tools/classical-ciphers/',
            category: 'classical',
            tags: ['atbash', 'affine', 'a1z26', 'polybius', 'rail fence', 'beaufort', 'cipher', 'ctf'],
        },
        {
            id: 'frequency-analyzer',
            name: 'Frequency Analyzer',
            desc: 'Character frequency analysis with n-gram charts and Caesar brute force',
            path: 'tools/frequency-analyzer/',
            category: 'classical',
            tags: ['frequency', 'monogram', 'bigram', 'trigram', 'ioc', 'chi-squared', 'caesar', 'ctf', 'crypto'],
        },
        {
            id: 'cipher-identifier',
            name: 'Cipher Identifier',
            desc: 'Paste ciphertext and get the top-3 most likely cipher type guesses',
            path: 'tools/cipher-identifier/',
            category: 'classical',
            tags: ['cipher', 'identifier', 'detect', 'ctf', 'crypto analysis', 'auto'],
        },

        // Web App Pentest
        {
            id: 'reverse-shell',
            name: 'Reverse Shell Generator',
            desc: 'Generate reverse shell one-liners in 10+ languages with auto IP/PORT substitution',
            path: 'tools/reverse-shell/',
            category: 'pentest',
            tags: ['reverse shell', 'bash', 'python', 'php', 'powershell', 'netcat', 'socat', 'ctf', 'pentest'],
        },
        {
            id: 'xss-payloads',
            name: 'XSS Payload Library',
            desc: 'XSS payloads organized by injection context - HTML, JS, URL, CSS, SVG',
            path: 'tools/xss-payloads/',
            category: 'pentest',
            tags: ['xss', 'cross-site scripting', 'payload', 'bypass', 'ctf', 'pentest', 'web security'],
        },
        {
            id: 'sqli-payloads',
            name: 'SQLi Payload Library',
            desc: 'SQL injection payloads organized by DBMS and technique',
            path: 'tools/sqli-payloads/',
            category: 'pentest',
            tags: ['sql injection', 'sqli', 'mysql', 'postgresql', 'mssql', 'oracle', 'sqlite', 'blind', 'union', 'ctf', 'pentest'],
        },
        {
            id: 'jwt-attacks',
            name: 'JWT Attacks Toolkit',
            desc: 'alg:none, RS256→HS256 confusion, weak secret crack, kid injection',
            path: 'tools/jwt-attacks/',
            category: 'pentest',
            tags: ['jwt', 'attacks', 'alg none', 'rs256 hs256', 'secret crack', 'kid injection', 'ctf', 'pentest'],
        },

        // OSINT
        {
            id: 'google-dorks',
            name: 'Google Dorks Builder',
            desc: 'Build Google dorking queries and browse a library of 50+ presets',
            path: 'tools/google-dorks/',
            category: 'osint',
            tags: ['google dorks', 'dorking', 'osint', 'recon', 'search', 'exposed', 'admin', 'ctf', 'pentest'],
        },
    ];

    CT.CATEGORIES = [
        { id: 'encoding', label: 'ENCODING & DECODING' },
        { id: 'hashing', label: 'HASHING' },
        { id: 'jwt', label: 'JWT & TOKENS' },
        { id: 'crypto', label: 'CRYPTOGRAPHY' },
        { id: 'web-security', label: 'WEB SECURITY' },
        { id: 'network', label: 'NETWORK & DNS' },
        { id: 'utilities', label: 'UTILITIES' },
        { id: 'forensics', label: 'FORENSICS' },
        { id: 'classical', label: 'CLASSICAL CIPHERS' },
        { id: 'pentest', label: 'WEB APP PENTEST' },
        { id: 'osint', label: 'OSINT' },
    ];

    // ── Helpers ──────────────────────────────────────────────────────────────

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function resolveRoot(toolPageDepth) {
        // tool pages are at depth 2 (tools/name/index.html), root pages at depth 0
        return toolPageDepth === 2 ? '../../' : toolPageDepth === 1 ? '../' : './';
    }

    // ── Theme ────────────────────────────────────────────────────────────────

    CT.getTheme = function () {
        try {
            return localStorage.getItem('ct-theme') || 'dark';
        } catch (_) {
            return 'dark';
        }
    };

    CT.setTheme = function (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('ct-theme', theme);
        } catch (_) {}
        const btn = document.getElementById('ct-theme-toggle');
        if (btn) btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
        const icon = document.getElementById('ct-theme-icon');
        if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    };

    CT.toggleTheme = function () {
        CT.setTheme(CT.getTheme() === 'dark' ? 'light' : 'dark');
    };

    // ── Top Nav ──────────────────────────────────────────────────────────────

    function renderTopNav(root, activeTool) {
        const nav = document.createElement('nav');
        nav.id = 'ct-topnav';
        nav.setAttribute('aria-label', 'Main navigation');
        nav.innerHTML = `
<div style="max-width:1400px;margin:0 auto;height:100%;display:flex;align-items:center;gap:12px;padding:0 20px;">
  <button id="ct-sidebar-toggle" aria-label="Toggle navigation" aria-expanded="false"
    style="background:none;border:1px solid var(--border);cursor:pointer;color:var(--text-muted);padding:6px 8px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all 150ms;"
    onmouseover="this.style.color='var(--text)';this.style.borderColor='var(--text-muted)'" onmouseout="this.style.color='var(--text-muted)';this.style.borderColor='var(--border)'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  </button>

  <a href="${root}index.html" id="ct-topnav-logo" style="display:flex;align-items:center;gap:9px;font-size:16px;font-weight:800;color:var(--text);text-decoration:none;letter-spacing:0;white-space:nowrap;"
    aria-label="CyberTools home"><img src="${root}assets/logowb.png" alt="" width="28" height="28" style="width:28px;height:28px;object-fit:contain;" />CyberTools</a>

  <div style="flex:1;"></div>

  <button id="ct-palette-btn" aria-label="Open command palette (Ctrl+K)"
    style="display:flex;align-items:center;gap:8px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:6px 12px;color:var(--text-muted);font-size:13px;cursor:pointer;transition:all 150ms;min-width:160px;"
    onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <span>Search tools...</span>
  </button>

  <a href="${root}tools-index.html"
    style="font-size:13px;color:var(--text-muted);text-decoration:none;padding:6px 10px;border-radius:6px;transition:color 150ms;white-space:nowrap;"
    onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-muted)'">All Tools</a>

  <button id="ct-theme-toggle" aria-label="Switch theme"
    style="background:none;border:1px solid var(--border);border-radius:6px;padding:6px 10px;cursor:pointer;color:var(--text-muted);font-size:14px;transition:all 150ms;"
    onclick="CyberTools.toggleTheme()"
    onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
    <span id="ct-theme-icon" aria-hidden="true">☀️</span>
  </button>

  <a href="https://github.com/ctlib/CyberTools" target="_blank" rel="noopener noreferrer"
    aria-label="View CyberTools on GitHub"
    style="color:var(--text-muted);transition:color 150ms;display:flex;align-items:center;"
    onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-muted)'">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  </a>
</div>`;
        return nav;
    }

    // ── Trust Banner ─────────────────────────────────────────────────────────

    function renderTrustBanner(root) {
        const banner = document.createElement('div');
        banner.id = 'ct-trust-banner';
        banner.setAttribute('role', 'banner');
        banner.innerHTML = `
<div style="max-width:1400px;margin:0 auto;height:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 20px;font-size:12px;color:var(--text-muted);">
  <span aria-hidden="true" style="width:7px;height:7px;border-radius:50%;background:var(--success);display:inline-block;"></span>
  <span>Private by design: tools run locally in your browser.</span>
  <a href="${root}privacy.html" style="color:var(--accent-2);white-space:nowrap;">Privacy details</a>
</div>`;
        return banner;
    }

    // ── Sidebar ──────────────────────────────────────────────────────────────

    function renderSidebar(root, activeTool) {
        const recent = CT.getRecent();
        const favorites = CT.getFavorites();

        let sections = '';

        if (favorites.length > 0) {
            const items = favorites.map((id) => sidebarItem(root, id, activeTool, '⭐ ')).join('');
            sections += sidebarSection('FAVORITES', items);
        }

        if (recent.length > 0) {
            const items = recent.map((id) => sidebarItem(root, id, activeTool, '')).join('');
            sections += sidebarSection('RECENT', items);
        }

        CT.CATEGORIES.forEach((cat) => {
            const tools = CT.TOOLS.filter((t) => t.category === cat.id);
            if (tools.length === 0) return;
            const items = tools.map((t) => sidebarItem(root, t.id, activeTool, '')).join('');
            sections += sidebarSection(cat.label, items);
        });

        const sidebar = document.createElement('aside');
        sidebar.id = 'ct-sidebar';
        sidebar.setAttribute('aria-label', 'Tool navigation');
        sidebar.innerHTML = `
<div id="ct-sidebar-head">
  <a href="${root}index.html" id="ct-sidebar-logo" aria-label="CyberTools home">
    <img src="${root}assets/logowb.png" alt="" width="26" height="26" />
    <span>CyberTools</span>
  </a>
  <button id="ct-sidebar-close-btn" aria-label="Close navigation">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>

<div id="ct-sidebar-search-wrap">
  <svg id="ct-sidebar-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
  <input id="ct-sidebar-search" type="search" placeholder="Search tools..." autocomplete="off"
    aria-label="Search tools"
    oninput="CyberTools.filterSidebar(this.value)" />
</div>

<a href="${root}index.html" id="ct-sidebar-home-link">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
  Home
</a>

<div id="ct-sidebar-content" style="flex:1;overflow-y:auto;padding:0 0 24px;">${sections}</div>`;
        return sidebar;
    }

    function sidebarSection(label, items) {
        return `<div class="ct-sidebar-section">
  <div class="ct-sidebar-section-title">${esc(label)}</div>
  ${items}
</div>`;
    }

    function sidebarItem(root, toolId, activeTool, prefix) {
        const tool = CT.TOOLS.find((t) => t.id === toolId);
        if (!tool) return '';
        const isActive = toolId === activeTool;
        const activeStyle = isActive ? 'color:var(--accent);font-weight:800;' : '';
        return `<a class="ct-sidebar-tool" href="${root}${tool.path}index.html" data-tool-id="${esc(tool.id)}"
  style="${activeStyle}"
  onmouseover="if(this.getAttribute('aria-current')!=='page'){this.style.color='var(--text)';this.style.background='var(--surface-2)';}"
  onmouseout="if(this.getAttribute('aria-current')!=='page'){this.style.color='';this.style.background='';}"
  aria-current="${isActive ? 'page' : 'false'}"><span class="ct-tool-dot" aria-hidden="true"></span><span>${esc(prefix + tool.name)}</span></a>`;
    }

    CT.filterSidebar = function (query) {
        const q = query.toLowerCase().trim();
        document.querySelectorAll('#ct-sidebar-content a[data-tool-id]').forEach((el) => {
            const id = el.getAttribute('data-tool-id');
            const tool = CT.TOOLS.find((t) => t.id === id);
            if (!tool) return;
            const match = !q || tool.name.toLowerCase().includes(q) || tool.tags.some((t) => t.includes(q));
            el.style.display = match ? '' : 'none';
        });
        document.querySelectorAll('.ct-sidebar-section').forEach((section) => {
            const visible = [...section.querySelectorAll('a[data-tool-id]')].some((a) => a.style.display !== 'none');
            section.style.display = visible ? '' : 'none';
        });
    };

    // ── Footer ───────────────────────────────────────────────────────────────

    function renderFooter(root, toolSourcePath) {
        const footer = document.createElement('footer');
        footer.id = 'ct-footer';
        const sourceLink = toolSourcePath
            ? `<a href="https://github.com/ctlib/CyberTools/blob/main/${toolSourcePath}" target="_blank" rel="noopener noreferrer" style="color:var(--text-muted);text-decoration:none;transition:color 150ms;" onmouseover="this.style.color='var(--accent-2)'" onmouseout="this.style.color='var(--text-muted)'">View source of this tool</a> ·`
            : '';
        footer.innerHTML = `
<div style="max-width:1400px;margin:0 auto;padding:12px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:var(--text-muted);">
  <span>v1.0.0 · <a href="https://github.com/ctlib/CyberTools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" style="color:var(--text-muted);text-decoration:none;" onmouseover="this.style.color='var(--accent-2)'" onmouseout="this.style.color='var(--text-muted)'">MIT License</a></span>
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
    ${sourceLink}
    <a href="https://github.com/ctlib/CyberTools" target="_blank" rel="noopener noreferrer" style="color:var(--text-muted);text-decoration:none;" onmouseover="this.style.color='var(--accent-2)'" onmouseout="this.style.color='var(--text-muted)'">GitHub</a> ·
    <a href="${root}privacy.html" style="color:var(--text-muted);text-decoration:none;" onmouseover="this.style.color='var(--accent-2)'" onmouseout="this.style.color='var(--text-muted)'">Privacy &amp; Security</a> ·
    <a href="https://github.com/ctlib/CyberTools/issues/new" target="_blank" rel="noopener noreferrer" style="color:var(--text-muted);text-decoration:none;" onmouseover="this.style.color='var(--accent-2)'" onmouseout="this.style.color='var(--text-muted)'">Report issue</a> ·
    <span id="ct-offline-indicator" style="display:inline-flex;align-items:center;gap:4px;">
      <span style="width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block;"></span>Offline-ready
    </span>
  </div>
</div>`;
        return footer;
    }

    // ── Sidebar overlay (mobile) ─────────────────────────────────────────────

    function renderSidebarOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'ct-sidebar-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.addEventListener('click', CT.closeSidebar);
        return overlay;
    }

    var _sidebarTrapHandler = null;

    CT.openSidebar = function () {
        const s = document.getElementById('ct-sidebar');
        const o = document.getElementById('ct-sidebar-overlay');
        const t = document.getElementById('ct-sidebar-toggle');
        if (s) {
            s.classList.add('open');
            s.setAttribute('aria-hidden', 'false');
        }
        if (o) o.classList.add('open');
        if (t) t.setAttribute('aria-expanded', 'true');

        // Focus trap - only active on mobile where sidebar is a drawer
        if (s && window.innerWidth <= 768) {
            const focusable = s.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (first) first.focus();

            _sidebarTrapHandler = function (e) {
                if (e.key !== 'Tab') return;
                if (focusable.length === 0) {
                    e.preventDefault();
                    return;
                }
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            };
            s.addEventListener('keydown', _sidebarTrapHandler);
        }
    };

    CT.closeSidebar = function () {
        const s = document.getElementById('ct-sidebar');
        const o = document.getElementById('ct-sidebar-overlay');
        const t = document.getElementById('ct-sidebar-toggle');
        if (s) {
            s.classList.remove('open');
            s.setAttribute('aria-hidden', 'true');
            if (_sidebarTrapHandler) {
                s.removeEventListener('keydown', _sidebarTrapHandler);
                _sidebarTrapHandler = null;
            }
        }
        if (o) o.classList.remove('open');
        if (t) {
            t.setAttribute('aria-expanded', 'false');
            t.focus();
        }
    };

    // ── Command Palette ──────────────────────────────────────────────────────

    CT.openPalette = function () {
        const existing = document.getElementById('ct-palette-modal');
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'ct-palette-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-label', 'Command palette');
        modal.setAttribute('aria-modal', 'true');
        modal.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;background:rgba(0,0,0,0.6);';
        modal.innerHTML = `
<div style="width:100%;max-width:560px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.5);">
  <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input id="ct-palette-input" type="text" placeholder="Search tools…" autocomplete="off" autocorrect="off" spellcheck="false"
      aria-label="Search tools"
      style="flex:1;background:none;border:none;outline:none;font-size:16px;color:var(--text);font-family:inherit;"/>
    <kbd style="background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-size:11px;color:var(--text-muted);">Esc</kbd>
  </div>
  <div id="ct-palette-results" style="max-height:360px;overflow-y:auto;" role="listbox" aria-label="Tool results"></div>
  <div style="padding:8px 16px;border-top:1px solid var(--border);font-size:11px;color:var(--text-muted);display:flex;gap:16px;">
    <span><kbd style="background:var(--surface-2);border:1px solid var(--border);border-radius:3px;padding:1px 4px;">↑↓</kbd> navigate</span>
    <span><kbd style="background:var(--surface-2);border:1px solid var(--border);border-radius:3px;padding:1px 4px;">↵</kbd> open</span>
    <span><kbd style="background:var(--surface-2);border:1px solid var(--border);border-radius:3px;padding:1px 4px;">Esc</kbd> close</span>
  </div>
</div>`;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) CT.closePalette();
        });

        const input = document.getElementById('ct-palette-input');
        input.focus();
        CT._paletteIndex = -1;
        CT._renderPaletteResults('');

        input.addEventListener('input', () => {
            CT._paletteIndex = -1;
            CT._renderPaletteResults(input.value);
        });
        input.addEventListener('keydown', CT._paletteKeydown);
    };

    CT.closePalette = function () {
        const modal = document.getElementById('ct-palette-modal');
        if (modal) modal.remove();
    };

    CT._renderPaletteResults = function (query) {
        const q = query.toLowerCase().trim();
        const results = q ? CT.TOOLS.filter((t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)) || t.desc.toLowerCase().includes(q)) : CT.TOOLS;

        const container = document.getElementById('ct-palette-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:14px;">No tools found</div>';
            return;
        }

        container.innerHTML = results
            .map(
                (tool, i) => `
<div role="option" aria-selected="false" data-palette-idx="${i}" data-tool-path="${esc(tool.path)}"
  style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;border-bottom:1px solid var(--border);transition:background 100ms;"
  onmouseover="CyberTools._setPaletteIndex(${i})"
  onclick="CyberTools._paletteNavigate('${esc(tool.path)}')">
  <div style="flex:1;min-width:0;">
    <div style="font-size:14px;font-weight:500;color:var(--text);">${esc(tool.name)}</div>
    <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(tool.desc)}</div>
  </div>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
</div>`,
            )
            .join('');
    };

    CT._setPaletteIndex = function (idx) {
        CT._paletteIndex = idx;
        document.querySelectorAll('#ct-palette-results [data-palette-idx]').forEach((el, i) => {
            const active = i === idx;
            el.style.background = active ? 'var(--surface-2)' : '';
            el.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    };

    CT._paletteNavigate = function (path) {
        CT.closePalette();
        const root = CT._shellRoot || './';
        window.location.href = root + path + 'index.html';
    };

    CT._paletteKeydown = function (e) {
        const items = document.querySelectorAll('#ct-palette-results [data-palette-idx]');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            CT._setPaletteIndex(Math.min(CT._paletteIndex + 1, items.length - 1));
            items[CT._paletteIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            CT._setPaletteIndex(Math.max(CT._paletteIndex - 1, 0));
            items[CT._paletteIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            const active = document.querySelector(`#ct-palette-results [data-palette-idx="${CT._paletteIndex}"]`);
            if (active) CT._paletteNavigate(active.getAttribute('data-tool-path'));
        } else if (e.key === 'Escape') {
            CT.closePalette();
        }
    };

    // ── Shortcut help modal ──────────────────────────────────────────────────

    CT.openShortcutHelp = function () {
        const existing = document.getElementById('ct-shortcuts-modal');
        if (existing) {
            existing.remove();
            return;
        }

        const shortcuts = [
            ['/', 'Focus sidebar search'],
            ['Ctrl+K / Cmd+K', 'Open command palette'],
            ['Ctrl+Enter', 'Run primary tool action'],
            ['Ctrl+Shift+C', 'Copy output'],
            ['Ctrl+Shift+V', 'Paste & smart-detect'],
            ['Esc', 'Close modals / overlays'],
            ['?', 'Show this help'],
            ['g h', 'Go to home'],
            ['g t', 'Go to tools index'],
        ];

        const modal = document.createElement('div');
        modal.id = 'ct-shortcuts-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-label', 'Keyboard shortcuts');
        modal.setAttribute('aria-modal', 'true');
        modal.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);';
        modal.innerHTML = `
<div style="width:100%;max-width:420px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.5);">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);">
    <span style="font-size:15px;font-weight:600;color:var(--text);">Keyboard Shortcuts</span>
    <button onclick="document.getElementById('ct-shortcuts-modal').remove()" aria-label="Close"
      style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:20px;line-height:1;padding:0 4px;">×</button>
  </div>
  <div style="padding:8px 0;">
    ${shortcuts
        .map(
            ([key, desc]) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 20px;gap:16px;">
      <span style="font-size:13px;color:var(--text-muted);">${esc(desc)}</span>
      <kbd style="background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:2px 8px;font-size:12px;font-family:inherit;white-space:nowrap;flex-shrink:0;">${esc(key)}</kbd>
    </div>`,
        )
        .join('')}
  </div>
</div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    };

    // ── initShell ────────────────────────────────────────────────────────────

    CT.initShell = function (opts) {
        opts = opts || {};
        const activeTool = opts.activeTool || '';
        const toolSourcePath = opts.toolSourcePath || '';

        // Determine depth from location path
        const pathParts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
        let depth = 0;
        if (pathParts.includes('tools')) depth = 2;
        CT._shellRoot = resolveRoot(depth);
        const root = CT._shellRoot;

        // Apply theme before render to avoid flash
        document.documentElement.setAttribute('data-theme', CT.getTheme());

        // Wrap existing body content in main
        const existingContent = Array.from(document.body.childNodes);
        const main = document.createElement('main');
        main.id = 'ct-main';
        existingContent.forEach((n) => main.appendChild(n));

        // Build shell
        const shell = document.createElement('div');
        shell.id = 'ct-shell';

        const topNav = renderTopNav(root, activeTool);
        const trustBanner = renderTrustBanner(root);
        const body = document.createElement('div');
        body.id = 'ct-body';
        const sidebar = renderSidebar(root, activeTool);
        const sidebarOverlay = renderSidebarOverlay();
        const footer = renderFooter(root, toolSourcePath);

        body.appendChild(sidebar);
        body.appendChild(main);

        shell.appendChild(topNav);
        shell.appendChild(trustBanner);
        shell.appendChild(body);
        shell.appendChild(footer);

        document.body.appendChild(shell);
        document.body.appendChild(sidebarOverlay);

        // Apply theme icon
        CT.setTheme(CT.getTheme());

        // Record tool visit
        if (activeTool) CT.recordVisit(activeTool);

        // Sidebar toggle button (mobile only - CSS hides on desktop)
        const toggleBtn = document.getElementById('ct-sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const s = document.getElementById('ct-sidebar');
                s && s.classList.contains('open') ? CT.closeSidebar() : CT.openSidebar();
            });
        }

        // Sidebar close button (inside drawer)
        const closeBtn = document.getElementById('ct-sidebar-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', CT.closeSidebar);

        // Command palette button
        const paletteBtn = document.getElementById('ct-palette-btn');
        if (paletteBtn) paletteBtn.addEventListener('click', CT.openPalette);

        // Close sidebar on tool link click (mobile)
        document.querySelectorAll('#ct-sidebar-content a[data-tool-id], #ct-sidebar-home-link').forEach((el) => {
            el.addEventListener('click', () => {
                if (window.innerWidth <= 768) CT.closeSidebar();
            });
        });

        document.dispatchEvent(
            new CustomEvent('ct:shell-ready', {
                detail: { activeTool, root },
            }),
        );
    };

    // ── Copy utility ─────────────────────────────────────────────────────────

    CT.copyText = function (text, btnEl) {
        if (!navigator.clipboard) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        } else {
            navigator.clipboard.writeText(text).catch(() => {});
        }
        if (btnEl) {
            const orig = btnEl.textContent;
            btnEl.textContent = 'Copied!';
            btnEl.classList.add('copied');
            setTimeout(() => {
                btnEl.textContent = orig;
                btnEl.classList.remove('copied');
            }, 1500);
        }
    };
})((window.CyberTools = window.CyberTools || {}));
