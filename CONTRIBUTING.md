# Contributing to CyberTools

Thanks for your interest in contributing. This guide covers how to add a new tool, report a bug, or improve an existing one.

---

## Ground rules

1. **No CDN dependencies at runtime.** Every library must be self-hosted in the repo.
2. **No `innerHTML` with user-supplied strings.** Use `textContent` or sanitize first.
3. **No `Math.random()` in security-sensitive code.** Use `crypto.getRandomValues()`.
4. **No `eval()` or `Function()` constructor.**
5. **Client-side only.** Tools must not make any outbound network requests during use.
6. **Mobile-first.** Every tool must be usable at 375 px width.

---

## How to add a new tool

### 1. Create the folder

```
tools/<tool-id>/
├── index.html
└── script.js
```

### 2. Use the standard HTML template

```html
<!doctype html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tool Name - CyberTools</title>
    <meta name="description" content="One sentence, ≤140 chars." />
    <link rel="canonical" href="https://ctlib.github.io/CyberTools/tools/<tool-id>/" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" />

    <link rel="icon" href="../../assets/logowb.png" type="image/png" />
    <link rel="preload" href="../../assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="../../assets/fonts/jetbrains-mono.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="../../css/design-system.css" />
    <link rel="stylesheet" href="../../css/global.css" />
    <link rel="stylesheet" href="../../css/tailwind.css" />
    <link rel="stylesheet" href="../../css/tool.css" />
    <script>(function(){var t=localStorage.getItem('ct-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();</script>
</head>
<body>
    <main id="ct-main">
        <div class="tool-header">
            <h1 class="tool-title">Tool Name</h1>
            <p class="tool-description">One sentence description.</p>
        </div>

        <!-- Tool UI here -->

        <details class="tool-docs">
            <summary>How it works</summary>
            <div class="tool-docs-content">
                <p>Explanation with links to relevant RFCs/standards.</p>
            </div>
        </details>

        <div class="tool-meta-links">
            <a href="https://github.com/ctlib/CyberTools/blob/main/tools/<tool-id>/script.js"
               target="_blank" rel="noopener noreferrer">View source of this tool</a>
            <a href="https://github.com/ctlib/CyberTools/issues/new" target="_blank" rel="noopener noreferrer">Report issue</a>
        </div>
    </main>

    <script src="../../js/app.js" defer></script>
    <script src="../../js/history.js" defer></script>
    <script src="../../js/share.js" defer></script>
    <script src="../../js/smart-detect.js" defer></script>
    <script src="../../js/components.js" defer></script>
    <script src="../../js/shortcuts.js" defer></script>
    <script src="../../js/pwa.js" defer></script>
    <script src="script.js" defer></script>
    <script defer>
        document.addEventListener('DOMContentLoaded', function () {
            CyberTools.initShell({ activeTool: '<tool-id>', toolSourcePath: 'tools/<tool-id>/script.js' });
        });
    </script>
</body>
</html>
```

### 3. Register the tool in `js/components.js`

Add an entry to the `CT.TOOLS` array:

```js
{ id: 'tool-id', name: 'Tool Name', desc: 'One sentence ≤140 chars.', path: 'tools/tool-id/', category: 'category-id', tags: ['tag1', 'tag2'] }
```

Valid categories: `encoding`, `hashing`, `jwt`, `crypto`, `forensics` (add new ones to `CT.CATEGORIES` if needed).

### 4. Add to `index.html` and `tools-index.html`

Add a card in the "Available Tools" grid on `index.html`, and it will appear automatically on `tools-index.html` since that page reads from `CT.TOOLS`.

### 5. Update `sitemap.xml`

Add a `<url>` entry for the new tool page.

### 6. Rebuild CSS

```bash
npm run build
```

---

## Pull request checklist

Before opening a PR, verify:

- [ ] Zero outbound requests during tool use (DevTools Network tab)
- [ ] No CDN `<script>` or `<link>` tags
- [ ] No `innerHTML` with unsanitized user input
- [ ] No `Math.random()` in any security path
- [ ] Tool registered in `CT.TOOLS` in `js/components.js`
- [ ] Tool works at 375 px width (mobile)
- [ ] Tool has a "How it works" `<details>` section
- [ ] Tool has at least 2 example inputs
- [ ] Tool has a "View source on GitHub" link
- [ ] `npm run build` runs without errors
- [ ] Commit message follows conventional commits: `feat(tool-id): description`

---

## Design system reference

| Class | Usage |
| ----- | ----- |
| `.tool-panel` | White/surface card container |
| `.tool-panel-label` | Small uppercase label above inputs |
| `.btn-primary` | Green primary action button |
| `.btn-ghost` | Ghost/secondary button |
| `.btn-danger` | Red destructive button |
| `.input` | Standard text input |
| `.textarea` | Monospace textarea |
| `.output-area` | Readonly output textarea |
| `.output-wrapper` | Wrapper for output + copy button |
| `.output-copy-btn` | Floating copy button |
| `.code-block` | Preformatted code display |
| `.tool-docs` | Collapsible "How it works" section |
| `.security-note` | Left-bordered info/warning note |
| `.legacy-banner` | Yellow warning for deprecated tools |
| `.tool-meta-links` | Footer row with GitHub/report links |

CSS variables: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-2`, `--warning`, `--danger`, `--success`.

---

## Reporting bugs

Open a [GitHub issue](https://github.com/ctlib/CyberTools/issues/new). Include:

- Browser and OS
- Steps to reproduce
- Expected vs actual behaviour
- Console errors (if any)

For security vulnerabilities, see [SECURITY.md](SECURITY.md).
