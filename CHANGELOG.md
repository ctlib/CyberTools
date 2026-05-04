# Changelog

All notable changes to CyberTools are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) · Versioning: [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### Added
- **Hash Identifier** (`tools/hash-identifier/`) — heuristic identification of 50+ hash formats by length, charset, and structural prefix (MD5, SHA family, SHA-3, NTLM, LM, bcrypt, Argon2id/i/d, SHA-512crypt, SHA-256crypt, MD5crypt, phpass, scrypt, PBKDF2-Django, MySQL5, BLAKE2b, Whirlpool, RIPEMD-160, GOST, etc.). Returns top guesses with confidence %, hashcat mode reference, and security/use info. Anchor-pattern detection for empty-LM and empty-NTLM sentinel hashes.
- **Examples sections** wired into 10 more tools (vigenere, classical-ciphers atbash/a1z26, frequency-analyzer, cipher-identifier, timestamp, sri-generator, totp, xor, email-header, jwt-attacks). 24/37 tools now have click-to-load examples; remaining 12 are libraries/file-input/generators that don't need examples; RSA uses key-gen button as example workflow.

### Changed
- **Build pipeline migrated from npm → pnpm** (per ADR-005). `pnpm-lock.yaml` replaces `package-lock.json`. `packageManager: pnpm@10.33.0` pinned in package.json. README install instructions updated. Faster installs (~3×) and stricter dependency resolution. No runtime change.
- Added `pnpm audit:drift` script for one-command drift detection.

---

## [3.0.0] — 2026-05-02

### Phase 4 — 12 new CTF & Pentest tools (37 total)

#### Added

**Classical Ciphers**
- **Vigenère Cipher** (`tools/vigenere/`) — encrypt/decrypt with any ASCII key; Kasiski test finds repeated trigrams and computes GCD-derived key lengths; brute-forces key lengths 1–20 ranked by chi-squared English score
- **Classical Ciphers** (`tools/classical-ciphers/`) — tabbed single-page tool: Atbash, Affine (a/b params + key validation), A1Z26, Polybius square, Rail Fence (n rails), Beaufort — each with encode/decode
- **Frequency Analyzer** (`tools/frequency-analyzer/`) — mono-gram frequency chart vs expected English distribution, Index of Coincidence, chi-squared-ranked Caesar/ROT brute force across all 25 shifts
- **Cipher Identifier** (`tools/cipher-identifier/`) — heuristic analysis of character set, length, spacing, and IoC produces a top-5 ranked list of likely cipher types with confidence % and links to relevant tools

**Forensics**
- **Email Header Analyzer** (`tools/email-header/`) — parses RFC 5322 headers; extracts all IP addresses from Received: hops; displays SPF/DKIM/DMARC pass/fail/none badges; renders ordered relay path timeline
- **Magic Bytes Identifier** (`tools/magic-bytes/`) — identifies file types from the first 32 bytes using a 100+ signature database (PNG, JPEG, GIF, PDF, ZIP, RAR, 7z, ELF, PE/MZ, MP4, SQLite, DOCX, and more); shows first 64 bytes in hex+ASCII
- **Strings Extractor** (`tools/strings-extractor/`) — extracts printable ASCII strings (min-length configurable) and UTF-16 LE strings from binary files; displays file offset for each string; highlights matches for URLs, emails, and IPs

**Web App Pentest**
- **Reverse Shell Generator** (`tools/reverse-shell/`) — 14 shell templates across Unix (Bash, Python 2/3, Perl, Ruby, Netcat, Netcat mkfifo, Socat, PHP, Node.js, Awk, OpenSSL), Windows (PowerShell TCPClient, PowerShell base64, CMD Bitsadmin), and Web Languages (JSP); auto-substitutes IP and PORT
- **XSS Payload Library** (`tools/xss-payloads/`) — 45+ payloads across 7 contexts: HTML Body, HTML Attribute, JavaScript, URL, SVG, Filter Bypass, Polyglot; each with copy button and technique explanation
- **SQLi Payload Library** (`tools/sqli-payloads/`) — 55+ payloads across 6 DBMS (MySQL, PostgreSQL, MSSQL, SQLite, Oracle) and 7 techniques (Auth Bypass, Union, Boolean, Time, Error, Stacked, Comment); dual-filter UI
- **JWT Attacks Toolkit** (`tools/jwt-attacks/`) — alg:none/None/NONE variants; RS256→HS256 confusion attack (PEM public key as HMAC secret via WebCrypto); weak secret wordlist cracker with progress bar; kid header injection with preset SQL/path payloads; all in-browser via WebCrypto

**OSINT**
- **Google Dorks Builder** (`tools/google-dorks/`) — form-based builder for site:, filetype:, intitle:, inurl:, intext:, and custom operators with live query preview; 55+ preset dorks in 9 categories (Admin Panels, Open Directories, Config & Env, Databases, Login Pages, IP Cameras, Sensitive Files, Code & Repos, Network)

#### Changed

- `js/components.js` — CT.TOOLS expanded from 25 to 37 entries; CT.CATEGORIES expanded from 8 to 11 (added CLASSICAL CIPHERS, WEB APP PENTEST, OSINT)
- `index.html` — tools grid expanded from 25 to 37 cards; count updated
- `sitemap.xml` — 12 new tool URLs added with `<lastmod>2026-05-02</lastmod>`
- `manifest.webmanifest` — shortcuts updated: added Reverse Shell Generator, JWT Attacks Toolkit, Vigenère Cipher, Frequency Analyzer, Google Dorks Builder
- `service-worker.js` — bumped to `cybertools-v4`; all 12 new tool HTML files added to SHELL_FILES pre-cache list
- `ROADMAP.md` — Phase 4 items marked complete; version bumped to v3.0.0

---

## [2.0.0] — 2026-05-01

### Phase 2 — 12 new Tier-S daily tools (25 total)

#### Added

- **RSA Encryption** (`tools/rsa/`) — RSA-OAEP encrypt/decrypt, RSA-PSS sign/verify, key pair generation (1024–4096 bit), PEM export (SPKI/PKCS8)
- **XOR Cipher** (`tools/xor/`) — multi-byte repeating key, hex/base64 I/O, Shannon entropy analysis, byte-frequency bar chart
- **TOTP Generator** (`tools/totp/`) — RFC 6238 / RFC 4226, HMAC-SHA1/256/512, live 30-second countdown bar, HOTP mode, pure-JS Base32 decoder
- **HTML Entities** (`tools/html-entities/`) — encode/decode named (`&amp;`), decimal (`&#65;`), hex (`&#x41;`) modes; 40+ named entity map
- **Cookie Decoder** (`tools/cookie-decoder/`) — parses Set-Cookie headers; flags missing HttpOnly (high), Secure (high), SameSite (medium), SameSite=None without Secure (high)
- **HTTP Headers Analyzer** (`tools/http-headers/`) — weighted scoring for 11 security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, CORP, Cache-Control, X-Powered-By, Server)
- **SRI Hash Generator** (`tools/sri-generator/`) — SHA-256/384/512 Subresource Integrity via WebCrypto; URL fetch + file drag-drop; generates ready-to-paste `<script>` and `<link>` tags
- **Regex Tester** (`tools/regex/`) — live match highlighting with color-coded groups, global/i/m/s flags, capture group detail table, replace mode with `$1`/`$2` backreferences
- **IP / CIDR Calculator** (`tools/cidr/`) — IPv4 and IPv6, network/broadcast/hosts/mask/binary, CIDR class and type, subnet splitter up to 256 child subnets
- **Common Ports Reference** (`tools/ports/`) — 70+ TCP/UDP ports, RISKY/COMMON TARGET risk badges, live search by port, protocol, name, or description
- **User-Agent Parser** (`tools/user-agent/`) — browser, OS, device type (mobile/tablet/bot/desktop), rendering engine; auto-loads current browser UA
- **File Entropy Analyzer** (`tools/file-entropy/`) — Shannon entropy with per-64-byte-chunk canvas chart, entropy classification (encrypted/compressed/binary/structured/sparse), 256-bin byte frequency histogram
- Two new sidebar categories: **WEB SECURITY** and **NETWORK & DNS**
- `sitemap.xml` — 12 new tool URLs added
- `manifest.webmanifest` — shortcuts updated to include TOTP, HTTP Headers, CIDR, Regex
- `service-worker.js` — bumped to `cybertools-v3`, all 12 new tool HTML files pre-cached

#### Changed

- `index.html` — tools grid expanded from 13 to 25 cards; "Coming soon" placeholder section removed
- `js/components.js` `CT.TOOLS` — 12 new tool entries added across encoding, crypto, jwt, web-security, network, forensics categories
- `ROADMAP.md` — Phase 2 items marked complete; version bumped to v2.0.0

---

## [1.0.0] — 2026-04-29

### Phase 1 — Foundation rebuild

Complete redesign from isolated CDN-based pages to a coherent, production-quality application shell.

#### Added

- **Design system** — CSS custom property tokens for dark (default) and light themes (`css/design-system.css`)
- **Self-hosted Tailwind CSS** — replaced runtime CDN with locally built `css/tailwind.css` (zero CDN requests)
- **Self-hosted fonts** — Inter and JetBrains Mono served as woff2 from `assets/fonts/` (no Google Fonts)
- **Shell component system** — `js/components.js` injects shared nav, trust banner, categorized sidebar, and footer on every page
- **Dark/light theme toggle** — persisted to `localStorage`, no flash of wrong theme on load
- **Command palette** — `Ctrl+K` / `Cmd+K` fuzzy search across all tools with keyboard navigation
- **Global keyboard shortcuts** — `/` search, `Ctrl+Enter` run, `Ctrl+Shift+C` copy, `g h` home, `g t` tools index, `?` help
- **Smart detect** — `Ctrl+Shift+V` pastes from clipboard and suggests the relevant tool (JWT, Base64, SHA-256, etc.)
- **Tool history** — last 10 visited tools shown in sidebar Recent section (localStorage, no data sent anywhere)
- **URL-hash state sharing** — tool inputs can be encoded into the URL fragment for shareable links
- **Progressive Web App** — `manifest.webmanifest` + `service-worker.js` with stale-while-revalidate caching; works fully offline after first visit
- **CSP meta tag** — `default-src 'self'; script-src 'self'` enforced on every page
- **New pages** — `privacy.html`, `about.html`, `tools-index.html` (searchable), `404.html`
- **Static files** — `sitemap.xml`, `robots.txt`, `humans.txt`
- **SECURITY.md** — full vulnerability disclosure policy, response timeline, scope, architecture notes
- **PRIVACY.md** — expanded with data handling table, localStorage audit, DevTools verification steps, dependency table
- **README.md** — full project description, tool table, local dev instructions
- **CONTRIBUTING.md** — tool template, PR checklist, design system reference
- **ROADMAP.md** — Tier S/A/B/C tool backlog

#### Changed

- All 6 existing tools refactored into the new shell:
    - `tools/base64/` — new design system layout, examples panel, "How it works" section
    - `tools/jwt-decoder/` — new layout, structured header/payload/signature output
    - `tools/hex-viewer/` — new layout, styled viewer table
    - `tools/steganography/` — new layout, styled drag-drop zone
    - `tools/rot/` — new layout, examples, auto-detect mode preserved
    - `tools/rc4/` — new layout + **legacy warning banner** (RC4 is cryptographically broken)
- `index.html` — rebuilt hero, trust stats bar, tools grid with "Coming soon" placeholders
- `css/global.css` — base resets, `@font-face` declarations, shell layout rules

#### Removed

- All `<script src="https://cdn.tailwindcss.com">` CDN script tags from every page
- Hardcoded navigation headers from all tool pages (now injected by `components.js`)

---

## [0.1.0] — 2025 (initial)

Original release with 6 standalone tools:

- Base64 Encoder/Decoder
- JWT Encoder/Decoder
- Hex Viewer/Editor
- Steganography (LSB)
- ROT Cipher (ROT1/5/13/18/47/48)
- RC4 Encryption/Decryption
