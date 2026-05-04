/* CyberTools — Hash Identifier
 *
 * Heuristic identification of common hash formats. Returns top-3 candidates by score.
 *
 * Sources cross-checked against:
 *   - https://hashcat.net/wiki/doku.php?id=example_hashes
 *   - https://github.com/blackploit/hash-identifier
 *   - RFC 1320 (MD4), RFC 1321 (MD5), FIPS 180-4 (SHA family)
 */

(function () {
    'use strict';

    // ── Hash signature database ──────────────────────────────────────────────
    //
    // Each entry: { name, len?, charset, prefix?, regex?, hashcatMode?, weight? }
    //   - len: required length (or array of allowed lengths) of the hash payload
    //   - charset: 'hex' | 'b64' | 'printable' (used to validate)
    //   - prefix: required string prefix (matched literally, e.g. "$2a$")
    //   - regex: alternative full-string match
    //   - hashcatMode: hashcat mode number (for reference)
    //   - weight: 1.0 default, raise/lower to break ties
    //
    var SIGS = [
        // ── Crypt-style (prefix-based, very high confidence) ─────────────────
        { name: 'bcrypt',           prefix: '$2a$',         hashcatMode: 3200, charset: 'printable', weight: 1.5, info: 'Blowfish-based, work factor in $XX (4–31)' },
        { name: 'bcrypt',           prefix: '$2b$',         hashcatMode: 3200, charset: 'printable', weight: 1.5, info: 'OpenBSD bcrypt (post-2014)' },
        { name: 'bcrypt',           prefix: '$2y$',         hashcatMode: 3200, charset: 'printable', weight: 1.5, info: 'PHP bcrypt' },
        { name: 'Argon2id',         prefix: '$argon2id$',   hashcatMode: null, charset: 'printable', weight: 1.5, info: 'Memory-hard KDF (PHC winner)' },
        { name: 'Argon2i',          prefix: '$argon2i$',    hashcatMode: null, charset: 'printable', weight: 1.5, info: 'Argon2 (data-independent)' },
        { name: 'Argon2d',          prefix: '$argon2d$',    hashcatMode: null, charset: 'printable', weight: 1.5, info: 'Argon2 (data-dependent)' },
        { name: 'SHA-512crypt',     prefix: '$6$',          hashcatMode: 1800, charset: 'printable', weight: 1.4, info: '/etc/shadow on modern Linux' },
        { name: 'SHA-256crypt',     prefix: '$5$',          hashcatMode: 7400, charset: 'printable', weight: 1.4, info: '/etc/shadow (older)' },
        { name: 'MD5crypt',         prefix: '$1$',          hashcatMode: 500,  charset: 'printable', weight: 1.4, info: 'Legacy /etc/shadow / Cisco IOS' },
        { name: 'phpass',           prefix: '$P$',          hashcatMode: 400,  charset: 'printable', weight: 1.4, info: 'WordPress, Joomla, phpBB' },
        { name: 'phpass',           prefix: '$H$',          hashcatMode: 400,  charset: 'printable', weight: 1.4, info: 'phpBB3 phpass variant' },
        { name: 'scrypt',           prefix: 'SCRYPT:',      hashcatMode: 8900, charset: 'printable', weight: 1.4, info: 'RFC 7914' },
        { name: 'PBKDF2-SHA256 (Django)', prefix: 'pbkdf2_sha256$', hashcatMode: 10000, charset: 'printable', weight: 1.4, info: 'Django default' },
        { name: 'PBKDF2-SHA1 (Django)',   prefix: 'pbkdf2_sha1$',   hashcatMode: null,  charset: 'printable', weight: 1.4, info: 'Django legacy' },
        { name: 'MySQL5 (SHA-1)',   prefix: '*',            len: 41, hashcatMode: 300, charset: 'printable', weight: 1.4, info: 'MySQL 4.1+ (PASSWORD())' },

        // ── Hex hashes by length ─────────────────────────────────────────────
        { name: 'MD4',              len: 32, charset: 'hex', hashcatMode: 900,  weight: 0.7, info: 'RFC 1320 — broken' },
        { name: 'MD5',              len: 32, charset: 'hex', hashcatMode: 0,    weight: 1.2, info: 'RFC 1321 — broken for security' },
        { name: 'NTLM',             len: 32, charset: 'hex', hashcatMode: 1000, weight: 1.0, info: 'Windows NT LAN Manager' },
        { name: 'LM',               len: 32, charset: 'hex', hashcatMode: 3000, weight: 0.6, info: 'Pre-NT LAN Manager (broken)' },
        { name: 'MD5(Half)',        len: 16, charset: 'hex', hashcatMode: 5100, weight: 0.6, info: 'Cisco PIX MD5 (truncated)' },
        { name: 'CRC-32',           len: 8,  charset: 'hex', hashcatMode: 11500, weight: 0.5, info: 'Checksum, NOT a hash' },
        { name: 'SHA-1',            len: 40, charset: 'hex', hashcatMode: 100,  weight: 1.2, info: 'FIPS 180 — collisions broken (SHAttered)' },
        { name: 'SHA-224',          len: 56, charset: 'hex', hashcatMode: 1300, weight: 1.0, info: 'FIPS 180-4' },
        { name: 'SHA-256',          len: 64, charset: 'hex', hashcatMode: 1400, weight: 1.2, info: 'FIPS 180-4' },
        { name: 'SHA-384',          len: 96, charset: 'hex', hashcatMode: 10800, weight: 1.0, info: 'FIPS 180-4' },
        { name: 'SHA-512',          len: 128, charset: 'hex', hashcatMode: 1700, weight: 1.2, info: 'FIPS 180-4' },
        { name: 'SHA3-224',         len: 56, charset: 'hex', hashcatMode: 17300, weight: 0.9, info: 'FIPS 202' },
        { name: 'SHA3-256',         len: 64, charset: 'hex', hashcatMode: 17400, weight: 0.9, info: 'FIPS 202' },
        { name: 'SHA3-384',         len: 96, charset: 'hex', hashcatMode: 17500, weight: 0.9, info: 'FIPS 202' },
        { name: 'SHA3-512',         len: 128, charset: 'hex', hashcatMode: 17600, weight: 0.9, info: 'FIPS 202' },
        { name: 'Keccak-256',       len: 64, charset: 'hex', hashcatMode: 17800, weight: 0.7, info: 'Original Keccak (Ethereum)' },
        { name: 'Keccak-512',       len: 128, charset: 'hex', hashcatMode: 18000, weight: 0.7, info: 'Original Keccak' },
        { name: 'BLAKE2b-512',      len: 128, charset: 'hex', hashcatMode: 600, weight: 0.9, info: 'RFC 7693' },
        { name: 'RIPEMD-160',       len: 40, charset: 'hex', hashcatMode: 6000, weight: 0.7, info: 'Bitcoin address derivation' },
        { name: 'Tiger-192',        len: 48, charset: 'hex', hashcatMode: null, weight: 0.5, info: 'Designed for 64-bit platforms' },
        { name: 'Whirlpool',        len: 128, charset: 'hex', hashcatMode: 6100, weight: 0.7, info: 'ISO/IEC 10118-3' },
        { name: 'Skein-256',        len: 64, charset: 'hex', hashcatMode: null, weight: 0.5, info: 'SHA-3 finalist' },
        { name: 'Skein-512',        len: 128, charset: 'hex', hashcatMode: null, weight: 0.5, info: 'SHA-3 finalist' },
        { name: 'GOST R 34.11-94',  len: 64, charset: 'hex', hashcatMode: 6900, weight: 0.5, info: 'Russian standard' },
        { name: 'Snefru-256',       len: 64, charset: 'hex', hashcatMode: null, weight: 0.4, info: 'Old hash (1990)' },
    ];

    // ── Anchor patterns (when present, very strong signal) ────────────────────

    var ANCHORS = [
        { name: 'LM (empty password)',  pattern: /^aad3b435b51404eeaad3b435b51404ee$/i, weight: 2.0, info: 'Empty password LM hash — sentinel value' },
        { name: 'NTLM (empty password)', pattern: /^31d6cfe0d16ae931b73c59d7e0c089c0$/i, weight: 2.0, info: 'Empty password NTLM hash' },
    ];

    // ── Helpers ──────────────────────────────────────────────────────────────

    function isHex(s)        { return /^[0-9a-fA-F]+$/.test(s); }
    function isBase64(s)     { return /^[A-Za-z0-9+/]+=*$/.test(s); }
    function isPrintable(s)  { return /^[\x20-\x7e]+$/.test(s); }

    // ── Main identify ────────────────────────────────────────────────────────

    function classify(input) {
        var hash = input.trim();
        if (!hash) return [];

        var matches = [];

        // Anchor matches first (highest priority)
        for (var i = 0; i < ANCHORS.length; i++) {
            var a = ANCHORS[i];
            if (a.pattern.test(hash)) {
                matches.push({ name: a.name, score: a.weight, info: a.info, hashcatMode: a.hashcatMode || null });
            }
        }

        // Charset detection
        var hex = isHex(hash);
        var b64 = !hex && isBase64(hash);
        var printable = isPrintable(hash);

        // Score each signature
        for (var j = 0; j < SIGS.length; j++) {
            var sig = SIGS[j];
            var score = 0;

            // Prefix match
            if (sig.prefix) {
                if (hash.indexOf(sig.prefix) === 0) {
                    score = (sig.weight || 1.0) * 1.0; // strong signal
                    // Length check (if specified, and we want exactness)
                    if (sig.len && hash.length !== sig.len) {
                        score *= 0.7; // soft penalty
                    }
                }
            } else {
                // Length-based match
                if (sig.len && hash.length === sig.len) {
                    if (sig.charset === 'hex' && hex) {
                        score = (sig.weight || 1.0) * 0.6;
                    } else if (sig.charset === 'b64' && b64) {
                        score = (sig.weight || 1.0) * 0.6;
                    } else if (sig.charset === 'printable' && printable) {
                        score = (sig.weight || 1.0) * 0.5;
                    }
                }
            }

            if (score > 0) {
                matches.push({
                    name: sig.name,
                    score: score,
                    info: sig.info,
                    hashcatMode: sig.hashcatMode || null,
                });
            }
        }

        // Sort by score descending, dedupe by name (keep highest)
        matches.sort(function (a, b) { return b.score - a.score; });
        var seen = {};
        var unique = [];
        for (var k = 0; k < matches.length; k++) {
            if (!seen[matches[k].name]) {
                seen[matches[k].name] = true;
                unique.push(matches[k]);
            }
        }

        return unique.slice(0, 7); // top 7
    }

    // ── Render results ───────────────────────────────────────────────────────

    function render(input, results) {
        var box = document.getElementById('results');
        if (results.length === 0) {
            box.innerHTML = '<div class="tool-panel" style="border-left:3px solid var(--warning);">' +
                '<strong>No matches found.</strong> The input does not match any known hash format. ' +
                'Common reasons: extra whitespace, mixed case in hex, truncated, or this is plaintext / encoded data (not a hash). ' +
                'Try the <a href="../cipher-identifier/">Cipher Identifier</a> instead.</div>';
            box.style.display = 'block';
            return;
        }

        var maxScore = results[0].score;
        var html = '<div class="tool-panel"><div class="tool-panel-label">Top guesses</div>';
        html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Length: <code>' + input.length + '</code> · Sorted by confidence</div>';

        for (var i = 0; i < Math.min(results.length, 5); i++) {
            var r = results[i];
            var pct = Math.round((r.score / maxScore) * 100);
            html += '<div style="margin-bottom:14px;padding:10px 12px;background:var(--surface-2);border-radius:8px;border-left:3px solid ' + (i === 0 ? 'var(--accent)' : 'var(--border)') + ';">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">' +
                  '<span style="font-size:14px;font-weight:700;color:var(--text);">' + escapeHTML(r.name) + '</span>' +
                  '<span style="font-size:11px;color:var(--text-muted);font-family:\'JetBrains Mono\',monospace;">' + pct + '%</span>' +
                '</div>' +
                (r.info ? '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + escapeHTML(r.info) + '</div>' : '') +
                (r.hashcatMode !== null ? '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-family:\'JetBrains Mono\',monospace;">hashcat -m ' + r.hashcatMode + '</div>' : '') +
                '</div>';
        }

        if (results.length > 5) {
            html += '<details style="margin-top:8px;"><summary style="font-size:12px;color:var(--text-muted);cursor:pointer;">Show ' + (results.length - 5) + ' more candidates</summary><div style="margin-top:8px;">';
            for (var j = 5; j < results.length; j++) {
                html += '<div style="font-size:13px;padding:6px 10px;color:var(--text-muted);"><code style="color:var(--text);">' + escapeHTML(results[j].name) + '</code> — ' + Math.round((results[j].score / maxScore) * 100) + '%</div>';
            }
            html += '</div></details>';
        }

        html += '</div>';
        box.innerHTML = html;
        box.style.display = 'block';
    }

    function escapeHTML(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    var debounceTimer;

    window.identify = function () {
        var input = document.getElementById('input').value;
        var len = document.getElementById('lengthInfo');
        if (len) len.textContent = input.trim() ? 'len=' + input.trim().length : '';
        var results = classify(input);
        render(input, results);
    };

    window.debounceIdentify = function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(window.identify, 200);
    };
})();
