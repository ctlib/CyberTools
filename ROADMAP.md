# Roadmap

This roadmap outlines planned tools by priority tier. Vote on features by reacting to GitHub issues with ðŸ‘.

**Current version:** v3.0.0 (Phase 4 - CTF & Pentest Tools)
**Live site:** <https://ctlib.github.io/CyberTools/>

---

## Phase 2 - Tier S Daily Tools ✅

> Released v2.0.0 - 25 tools total

---

## Phase 4 - CTF & Pentest Tools ✅

> Released v3.0.0 - 37 tools total

### Hashing & Identification

- [x] MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512
- [ ] SHA-3 family (224/256/384/512), Keccak - _requires pure-JS library_
- [ ] BLAKE2b, BLAKE2s, BLAKE3 - _requires pure-JS library_
- [x] HMAC for all hash functions
- [ ] bcrypt, scrypt, Argon2id - _require WASM_
- [ ] NTLM, LM, MySQL, MSSQL hashes
- [ ] CRC32, Adler-32
- [x] **Hash Identifier** - paste any hash, get top guesses (length + charset + prefix heuristics, 50+ formats including bcrypt/Argon2/NTLM)
- [x] File hash calculator (drag-drop file → all hashes)
- [ ] File checksum compare

### Modern Cryptography

- [x] **AES** - GCM/CBC/CTR, 128/192/256-bit, WebCrypto API
- [x] **RSA** - key generation, RSA-OAEP encrypt/decrypt, RSA-PSS sign/verify, PEM import/export
- [ ] ChaCha20-Poly1305 (AEAD)
- [ ] Ed25519 sign/verify
- [ ] ECDSA (P-256, P-384, P-521) sign/verify
- [ ] ECDH key exchange demo
- [x] XOR cipher with multi-byte key and entropy analyzer
- [ ] PGP/GPG encrypt/decrypt/sign - _requires OpenPGP.js_
- [x] TOTP/HOTP generator (RFC 6238, live countdown)
- [ ] X.509 certificate parser
- [ ] Shamir's Secret Sharing

### Web Security

- [x] **HTTP Security Headers Analyzer** - HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, CORP
- [ ] **CSP Analyzer & Builder**
- [x] Cookie Decoder - flags missing HttpOnly/Secure/SameSite
- [x] SRI Hash Generator - SHA-256/384/512, script + link tag output
- [ ] SSL/TLS Cipher Suite Analyzer

### Network & DNS

- [x] **IP / Subnet / CIDR Calculator** - IPv4 + IPv6, subnet splitter
- [ ] DNS lookup via DNS-over-HTTPS (Cloudflare/Google, with explicit user notice)
- [x] Common Ports Reference - 70+ ports, searchable, risk labels
- [ ] MAC Address / OUI Vendor Lookup - _requires offline database_
- [x] User-Agent Parser - browser, OS, device, engine detection

### Utilities

- [x] **Regex Tester** - live highlighting, capture groups, replace mode, flag toggles
- [x] JSON Formatter / Validator / Minifier
- [ ] JSON ↔ YAML ↔ XML ↔ CSV converters
- [ ] Diff Viewer - side-by-side with character-level highlighting
- [x] UUID Generator (v1, v4, v7, ULID, NanoID) - bulk mode
- [x] Timestamp Converter - Unix ↔ ISO 8601 ↔ human readable, all timezones
- [x] **Password Generator** - entropy meter, diceware, exclude-similar chars
- [ ] Password Strength Meter (bundled zxcvbn)
- [ ] QR Code Generator + Reader - _requires library_
- [x] File Entropy Analyzer - Shannon entropy + chunk chart + byte frequency histogram
- [x] URL Encoder/Decoder - full, partial, double, form encoding
- [x] HTML Entity Encoder/Decoder - named, decimal, hex modes

---

## Phase 3 - Recipe Builder (The Killer Feature)

- [ ] Drag-and-drop operation chaining (CyberChef-style)
- [ ] Live recompute as any input/option changes
- [ ] Save/load recipes as JSON
- [ ] Share recipe + input via URL hash
- [ ] 30+ initial operations

---

## Phase 4 - Tier A: CTF & Pentest

### Classical Ciphers

- [x] Vigenère + Kasiski / Index of Coincidence key recovery
- [x] Atbash, Affine, A1Z26, Polybius, Rail Fence, Beaufort (Classical Ciphers tool)
- [x] **Cipher Identifier** - paste ciphertext, get top-5 type guesses with confidence
- [x] Frequency Analyzer - mono-gram visual chart, chi-squared Caesar brute force

### Forensics & Malware Triage

- [x] **Magic Bytes / File Signature Identifier** - drag file, identify true type (100+ signatures)
- [x] **Strings Extractor** - ASCII + UTF-16, like Linux `strings`, with offset display
- [ ] Hex Viewer upgrade - search, goto offset, structure templates
- [ ] EXIF metadata viewer & stripper
- [ ] PE File Inspector - headers, sections, imports, packer detection
- [ ] ELF File Inspector
- [x] Email Header Analyzer - phishing investigation, SPF/DKIM/DMARC

### Web App Pentest

- [x] XSS Payload Library (by context - HTML, JS, URL, SVG, filter bypass, polyglot)
- [x] SQLi Payload Library (by DBMS - MySQL, PostgreSQL, MSSQL, SQLite, Oracle)
- [x] **Reverse Shell Generator** - 14+ shells, auto-substitute IP + PORT
- [ ] SSRF Helper - URL parser, gopher/file scheme builder
- [x] JWT Attacks Toolkit - alg=none, RS→HS confusion, kid injection, weak key crack

### OSINT

- [ ] Username Search Aggregator (link generation, no scraping)
- [ ] HaveIBeenPwned email check (k-anonymity API)
- [x] Google Dorks Builder - 55+ presets in 9 categories
- [ ] Certificate Transparency Search (crt.sh for subdomains)

---

## Phase 5 - Reverse Engineering & Crypto-Math

- [ ] x86/x64/ARM assembler + disassembler (Keystone-WASM + Capstone-WASM)
- [ ] Shellcode analyzer
- [ ] Linux + Windows Syscall Reference tables
- [ ] x86 Opcode Reference
- [ ] Endianness Converter
- [ ] Number theory tools - GCD, extended Euclidean, CRT, discrete log
- [ ] RSA weak-key tools - small e, Wiener attack, factordb helper
- [ ] ASN.1 decoder

---

## Phase 6 - Differentiators

- [ ] **Smart Detect** - clipboard paste detection (partially done in Phase 1)
- [ ] **Tool-to-tool piping** - "Send output to…" dropdown connects tools
- [ ] **Bulk processing** - accept files/lists in every applicable tool
- [ ] Browser extension (Chrome + Firefox) - right-click → Send to CyberTools
- [ ] CLI companion - `npx cybertools <tool> <input>`
- [ ] Tool JS API - `window.CyberTools.<tool>(input, options)` for power users

---

## Phase 7 - Launch

- [ ] Per-tool documentation in `/docs/`
- [ ] Marketing assets (Product Hunt, Show HN, Reddit, demo GIFs)
- [ ] Lighthouse ≥ 95 on all pages verified
- [ ] Custom domain configured
- [ ] Sitemap submitted to Google Search Console + Bing
- [ ] PRs submitted to awesome-hacking, awesome-security, awesome-ctf, awesome-osint, etc.

---

## Suggestions

Open a [GitHub issue](https://github.com/ctlib/CyberTools/issues/new?labels=feature-request&title=Tool+request:) with the `feature-request` label and react with ðŸ‘ to vote on existing requests.
