# Security Policy

## Supported Versions

| Version                   | Supported |
| ------------------------- | --------- |
| Latest (`main` branch)    | ✅ Yes   |
| Any pinned/forked version | ❌ No     |

Only the current version deployed at <https://ctlib.github.io/CyberTools/> is actively maintained.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

### How to report

Use [GitHub's private security advisory](https://github.com/ctlib/CyberTools/security/advisories/new) to submit a report confidentially.

Alternatively, email: **CTLib@outlook.com**
Subject line: `[CyberTools Security] <brief description>`

### What to include

- Description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept code or screenshots)
- The affected file(s) or URL(s)
- Your suggested fix (optional, but appreciated)

### Response timeline

| Stage                   | Target time                                               |
| ----------------------- | --------------------------------------------------------- |
| Initial acknowledgement | Within **72 hours**                                       |
| Triage and assessment   | Within **7 days**                                         |
| Fix or mitigation       | Within **30 days** (critical), **90 days** (moderate/low) |
| Public disclosure       | After fix is deployed                                     |

We follow a **90-day coordinated disclosure** policy. If a fix cannot be issued within 90 days we will notify you and agree on an extended timeline.

---

## Scope

### In scope

| Category             | Examples                                                           |
| -------------------- | ------------------------------------------------------------------ |
| Client-side XSS      | User-supplied input rendered unsafely to DOM                       |
| Cryptographic errors | Weak randomness, incorrect algorithm, broken cipher implementation |
| Privacy violations   | Outbound network requests during tool use that shouldn't exist     |
| Dependency CVEs      | Known vulnerabilities in any vendored JS library                   |
| CSP bypass           | Ability to load external scripts or exfiltrate data                |
| Prototype pollution  | In tool logic or bundled libraries                                 |

### Out of scope

| Category                            | Reason                                               |
| ----------------------------------- | ---------------------------------------------------- |
| GitHub Pages infrastructure         | Outside our control - report to GitHub               |
| Denial of Service via large input   | Browser tabs are isolated by design                  |
| Missing `Strict-Transport-Security` | GitHub Pages limitation, not configurable            |
| Social engineering / phishing       | Not a software vulnerability                         |
| RC4 tool being insecure             | Documented legacy/educational only; broken by design |

---

## Security Architecture

CyberTools is a **purely static, client-side web application**:

- **No server.** No backend, no API, no database.
- **No outbound requests during tool use.** All operations execute in the user's browser via JavaScript and the [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
- **No cookies.** No session state. No authentication.
- **Self-hosted assets.** All fonts, CSS, and JS are served from the same origin - no third-party CDN at runtime.
- **Content Security Policy** is enforced via `<meta http-equiv="Content-Security-Policy">` on every page. The current policy blocks external scripts, plugins, frames, external connections, and form posts. `unsafe-inline` is temporarily retained for legacy inline event handlers until the UI is fully migrated to delegated listeners.

### Verify it yourself

1. Open DevTools → **Network** tab → clear the log.
2. Use any tool (encode, decrypt, hash, etc.).
3. Zero new network requests will appear. Your data never left the browser.

---

## Dependency Security

All vendored JavaScript libraries are:

- Pinned to a specific version in `package.json`
- Bundled locally in the repo (no CDN runtime dependency)
- Listed on the [privacy page](https://ctlib.github.io/CyberTools/privacy.html)

Run `pnpm audit` from the repository root to check for known vulnerabilities in build-time dependencies.

Run `pnpm audit` plus `pnpm run audit` before shipping. The project audit checks tool registry drift, CSP coverage, executable inline scripts, unsafe external links, and service-worker cache coverage.

---

## Hall of Fame

Responsible disclosures are acknowledged here with permission.

_No reports yet - be the first!_
