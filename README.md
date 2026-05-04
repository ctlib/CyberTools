# CyberTools

> A privacy-first cybersecurity toolkit that runs entirely in the browser.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/hosted-GitHub%20Pages-blue.svg)](https://ctlib.github.io/CyberTools/)

Live site: <https://ctlib.github.io/CyberTools/>

## Why People Can Trust It

- Client-side by design: no backend, no API, no database.
- No analytics, cookies, ads, tracking pixels, or signups.
- No runtime CDN: fonts, CSS, JS, and icons are self-hosted.
- Open source: every tool can be reviewed from the browser or GitHub.
- Offline-ready PWA for repeat daily use.
- Release audit checks registry drift, CSP presence, inline scripts, external-link safety, and service-worker coverage.

## Tool Categories

| Category | Tools |
| --- | --- |
| Encoding & decoding | Base64, ROT, URL Encoder, HTML Entities |
| Hashing | Hash Calculator, Hash Identifier |
| JWT & tokens | JWT Decoder, TOTP Generator |
| Cryptography | AES, RSA, XOR, RC4 legacy |
| Web security | Cookie Decoder, HTTP Headers, CSP Analyzer, SRI Generator, Regex Tester |
| Network | IP/CIDR Calculator, Common Ports, User-Agent Parser |
| Utilities | Password Generator, JSON Formatter, Timestamp Converter, UUID Generator |
| Forensics | Hex Viewer, Steganography, File Entropy, Email Header, Magic Bytes, Strings Extractor |
| Classical ciphers | Vigenere, Classical Ciphers, Frequency Analyzer, Cipher Identifier |
| Authorized testing | Reverse Shell, XSS Payloads, SQLi Payloads, JWT Attacks |
| OSINT | Google Dorks Builder |

Total: 39 tools.

## Local Development

```bash
pnpm install
pnpm build
pnpm run audit
pnpm audit
```

The site is static. You can open `index.html` directly, or serve the folder locally when testing service-worker behavior.

Requirements: Node.js 18+ and pnpm 10+. Runtime users do not need Node.js.

## Security Model

CyberTools is intended for defensive analysis, authorized testing, education, and daily utility workflows. Tools under "Authorized testing" are dual-use and must only be used against systems you own or have explicit written permission to test.

See [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md) for the full policy and verification steps.

## Project Hygiene

Internal build notes and old prompts are archived under `test/archive/` instead of being mixed into the public product surface.

## License

MIT - see [LICENSE](LICENSE).
