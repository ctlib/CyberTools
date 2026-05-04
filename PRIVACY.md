# Privacy Policy

**Last updated: 2026-05-03**

---

## The one-sentence version

Every operation - encryption, decoding, hashing, steganography, analysis - runs entirely inside your browser. Your input never leaves your device. There are no servers. There is nothing to leak.

---

## What we collect

| Data type                                  | Sent to server?        | Stored?                          |
| ------------------------------------------ | ---------------------- | -------------------------------- |
| Tool inputs (text, files, keys, passwords) | **Never**              | Not persisted                    |
| Analytics or usage data                    | **Never**              | Nothing collected                |
| Cookies                                    | **None set**           | No server, no cookies            |
| IP address                                 | **Never logged by us** | GitHub Pages may log (see below) |
| Your browser/OS                            | **Never logged by us** | -                                |
| localStorage data                          | **Never**              | Stays on your device only        |

---

## How to verify this yourself - in 60 seconds

Trust should not require faith. Open DevTools and check:

1. Open any CyberTools page.
2. Open DevTools: `F12` (Windows/Linux) or `Cmd+Option+I` (Mac).
3. Click the **Network** tab. Click the clear button (🚫) to empty the log.
4. Use a tool - paste text, encode something, decrypt a JWT, compute a hash.
5. **Observe the Network tab.** Zero new requests will appear after the initial page load. Your data stayed entirely in your browser.

---

## localStorage usage

CyberTools uses your browser's `localStorage` for convenience. This data **never leaves your device**:

| Key                    | Contents                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| `ct-theme`             | Your dark/light preference (`"dark"` or `"light"`)                |
| `ct-history`           | IDs of the last 10 tools visited - no input data, just tool names |
| `ct-favorites`         | Tool IDs you have starred                                         |
| `ct-visit-count`       | Visit count integer used for the PWA install prompt               |
| `ct-install-dismissed` | Whether you dismissed the install prompt (`"1"` or absent)        |

**To clear everything:** Open DevTools → Application → Storage → Clear Site Data.

---

## Third-party dependencies

CyberTools self-hosts every dependency. **No external CDN requests are made at runtime.** All assets are served from the same GitHub Pages origin.

| Dependency     | Version | Purpose                | Source                                                      |
| -------------- | ------- | ---------------------- | ----------------------------------------------------------- |
| Tailwind CSS   | 3.x     | Styling utilities      | Built locally from `package.json`, committed to repo        |
| Inter font     | 5.x     | UI typography          | `@fontsource/inter` - woff2 file committed to repo          |
| JetBrains Mono | 5.x     | Code/output typography | `@fontsource/jetbrains-mono` - woff2 file committed to repo |

Run `pnpm audit` from the repo root to verify the dependency tree has no known CVEs.

---

## Open-source transparency

CyberTools is fully open-source under the **MIT License**. Every line of code is publicly auditable at <https://github.com/ctlib/CyberTools>.

If you find a discrepancy between this policy and the actual code, the code is authoritative - and please [open an issue](https://github.com/ctlib/CyberTools/issues/new).

---

## GitHub Pages hosting

CyberTools is hosted on **GitHub Pages**. GitHub may collect standard web server logs (IP address, timestamp, user-agent) as part of serving the static files. This is GitHub's standard infrastructure logging and is outside of CyberTools' control.

See [GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) for details.

CyberTools adds **zero tracking** on top of what GitHub Pages provides by default.

---

## Security disclosures

To report a security vulnerability, see [SECURITY.md](./SECURITY.md) or use [GitHub's private security advisory](https://github.com/ctlib/CyberTools/security/advisories/new).

---

## Contact

For privacy-related questions that are not security vulnerabilities:  
Open a [GitHub issue](https://github.com/ctlib/CyberTools/issues/new?labels=privacy) with the `privacy` label.
