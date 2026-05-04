/* ============================================================
   Magic Bytes Identifier — script.js
   Identify file types from file signatures / magic numbers
   ============================================================ */

'use strict';

/* ── Security helper ─────────────────────────────────────────────────────── */
function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

/* ── Signature database ──────────────────────────────────────────────────── */
var SIGNATURES = [
    // Images
    { magic: [0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A], offset:0, type:'PNG Image',             ext:['png'],                      desc:'Portable Network Graphics' },
    { magic: [0xFF,0xD8,0xFF],                            offset:0, type:'JPEG Image',            ext:['jpg','jpeg'],               desc:'JPEG/JFIF image' },
    { magic: [0x47,0x49,0x46,0x38,0x37,0x61],            offset:0, type:'GIF87a Image',           ext:['gif'],                      desc:'Graphics Interchange Format 87a' },
    { magic: [0x47,0x49,0x46,0x38,0x39,0x61],            offset:0, type:'GIF89a Image',           ext:['gif'],                      desc:'Graphics Interchange Format 89a' },
    { magic: [0x42,0x4D],                                 offset:0, type:'BMP Image',              ext:['bmp'],                      desc:'Windows Bitmap' },
    { magic: [0x49,0x49,0x2A,0x00],                       offset:0, type:'TIFF Image (LE)',        ext:['tif','tiff'],               desc:'Tagged Image File Format (little-endian)' },
    { magic: [0x4D,0x4D,0x00,0x2A],                       offset:0, type:'TIFF Image (BE)',        ext:['tif','tiff'],               desc:'Tagged Image File Format (big-endian)' },
    { magic: [0x00,0x00,0x01,0x00],                       offset:0, type:'Windows ICO',            ext:['ico'],                      desc:'Windows icon file' },
    { magic: [0x52,0x49,0x46,0x46],                       offset:0, type:'WEBP / WAV / AVI',       ext:['webp','wav','avi'],          desc:'RIFF container (WebP image, WAV audio, or AVI video — check bytes 8–11 for sub-type)' },
    // Documents
    { magic: [0x25,0x50,0x44,0x46],                       offset:0, type:'PDF Document',           ext:['pdf'],                      desc:'Portable Document Format' },
    { magic: [0xD0,0xCF,0x11,0xE0,0xA1,0xB1,0x1A,0xE1], offset:0, type:'MS Office 97–2003',      ext:['doc','xls','ppt'],          desc:'Microsoft Office 97-2003 compound document (OLE2)' },
    { magic: [0x50,0x4B,0x03,0x04],                       offset:0, type:'ZIP / Office Open XML',  ext:['zip','docx','xlsx','pptx','jar','apk'], desc:'ZIP archive or Office Open XML (docx, xlsx, pptx), JAR, or APK' },
    { magic: [0x50,0x4B,0x05,0x06],                       offset:0, type:'ZIP (empty)',             ext:['zip'],                      desc:'Empty ZIP archive' },
    // Archives
    { magic: [0x52,0x61,0x72,0x21,0x1A,0x07,0x01,0x00], offset:0, type:'RAR Archive (v5+)',       ext:['rar'],                      desc:'RAR compressed archive version 5+' },
    { magic: [0x52,0x61,0x72,0x21,0x1A,0x07,0x00],       offset:0, type:'RAR Archive (v1.5+)',     ext:['rar'],                      desc:'RAR compressed archive v1.5–4.x' },
    { magic: [0x37,0x7A,0xBC,0xAF,0x27,0x1C],            offset:0, type:'7-Zip Archive',           ext:['7z'],                       desc:'7-Zip compressed archive' },
    { magic: [0x1F,0x8B],                                 offset:0, type:'GZIP',                   ext:['gz','tgz'],                 desc:'GNU zip compressed data' },
    { magic: [0x42,0x5A,0x68],                            offset:0, type:'BZIP2',                  ext:['bz2'],                      desc:'Bzip2 compressed data' },
    { magic: [0xFD,0x37,0x7A,0x58,0x5A,0x00],            offset:0, type:'XZ Archive',              ext:['xz'],                       desc:'XZ compressed archive' },
    { magic: [0x1F,0x9D],                                 offset:0, type:'Compress (.Z)',           ext:['z'],                        desc:'Unix compress (.Z) file' },
    { magic: [0x04,0x22,0x4D,0x18],                       offset:0, type:'LZ4 Frame',              ext:['lz4'],                      desc:'LZ4 compressed data' },
    // Executables
    { magic: [0x4D,0x5A],                                 offset:0, type:'Windows PE / DOS EXE',   ext:['exe','dll','sys','com'],     desc:'Windows Portable Executable or MS-DOS executable (MZ header)' },
    { magic: [0x7F,0x45,0x4C,0x46],                       offset:0, type:'ELF Executable',         ext:['elf','so','o'],              desc:'Linux/Unix ELF binary (executable, shared object, or object file)' },
    { magic: [0xCE,0xFA,0xED,0xFE],                       offset:0, type:'Mach-O (32-bit)',        ext:['macho'],                    desc:'macOS Mach-O 32-bit binary' },
    { magic: [0xCF,0xFA,0xED,0xFE],                       offset:0, type:'Mach-O (64-bit)',        ext:['macho'],                    desc:'macOS Mach-O 64-bit binary' },
    { magic: [0xCA,0xFE,0xBA,0xBE],                       offset:0, type:'Java Class / Mach-O Fat',ext:['class'],                    desc:'Java .class file or macOS Mach-O fat binary' },
    // Databases & scripts
    { magic: [0x53,0x51,0x4C,0x69,0x74,0x65,0x20,0x66,0x6F,0x72,0x6D,0x61,0x74,0x20,0x33,0x00], offset:0, type:'SQLite Database', ext:['db','sqlite','sqlite3'], desc:'SQLite database file' },
    { magic: [0x23,0x21],                                 offset:0, type:'Script (shebang)',        ext:['sh','py','pl','rb'],         desc:'Unix script file with shebang (#!) line' },
    // Media
    { magic: [0x00,0x00,0x00,0x20,0x66,0x74,0x79,0x70], offset:0, type:'MP4 Video (ftyp)',        ext:['mp4','m4v','m4a'],          desc:'MPEG-4 media file (ftyp box at offset 0)' },
    { magic: [0x66,0x74,0x79,0x70],                       offset:4, type:'MP4 Video',              ext:['mp4'],                      desc:'MPEG-4 media file (ftyp box at offset 4)' },
    { magic: [0x49,0x44,0x33],                            offset:0, type:'MP3 Audio (ID3)',         ext:['mp3'],                      desc:'MP3 audio file with ID3v2 metadata tag' },
    { magic: [0xFF,0xFB],                                 offset:0, type:'MP3 Audio',               ext:['mp3'],                      desc:'MP3 audio frame sync (no ID3 tag)' },
    { magic: [0x4F,0x67,0x67,0x53],                       offset:0, type:'OGG Media',              ext:['ogg','ogv','oga'],           desc:'Ogg multimedia container' },
    { magic: [0x66,0x4C,0x61,0x43],                       offset:0, type:'FLAC Audio',             ext:['flac'],                     desc:'Free Lossless Audio Codec' },
    // Disk images
    { magic: [0x43,0x44,0x30,0x30,0x31],                  offset:0x8001, type:'ISO 9660 Disc Image',ext:['iso'],                     desc:'ISO 9660 CD/DVD image (volume descriptor at sector 16)' },
    // Fonts
    { magic: [0x00,0x01,0x00,0x00,0x00],                  offset:0, type:'TrueType Font',          ext:['ttf'],                      desc:'TrueType font file' },
    { magic: [0x4F,0x54,0x54,0x4F],                       offset:0, type:'OpenType Font (CFF)',    ext:['otf'],                      desc:'OpenType font with CFF outlines' },
    { magic: [0x77,0x4F,0x46,0x46],                       offset:0, type:'WOFF Font',              ext:['woff'],                     desc:'Web Open Font Format' },
    { magic: [0x77,0x4F,0x46,0x32],                       offset:0, type:'WOFF2 Font',             ext:['woff2'],                    desc:'Web Open Font Format 2' },
    // Text / misc
    { magic: [0xEF,0xBB,0xBF],                            offset:0, type:'UTF-8 BOM Text',         ext:['txt'],                      desc:'Text file with UTF-8 byte order mark' },
    { magic: [0xFF,0xFE],                                 offset:0, type:'UTF-16 LE Text',          ext:['txt'],                      desc:'Text file with UTF-16 little-endian byte order mark' },
    { magic: [0xFE,0xFF],                                 offset:0, type:'UTF-16 BE Text',          ext:['txt'],                      desc:'Text file with UTF-16 big-endian byte order mark' },
    { magic: [0x25,0x21,0x50,0x53],                       offset:0, type:'PostScript',             ext:['ps'],                       desc:'PostScript document' },
    { magic: [0x7B,0x5C,0x72,0x74,0x66],                  offset:0, type:'RTF Document',           ext:['rtf'],                      desc:'Rich Text Format document' },
];

// Sort by magic length descending (longer = more specific, check first)
SIGNATURES.sort(function (a, b) { return b.magic.length - a.magic.length; });

/* ── Matching ────────────────────────────────────────────────────────────── */
function matchSignatures(bytes) {
    var matches = [];
    for (var i = 0; i < SIGNATURES.length; i++) {
        var sig = SIGNATURES[i];
        var off = sig.offset;
        if (off + sig.magic.length > bytes.length) continue;
        var ok = true;
        for (var j = 0; j < sig.magic.length; j++) {
            if (bytes[off + j] !== sig.magic[j]) { ok = false; break; }
        }
        if (ok) matches.push(sig);
    }
    return matches;
}

/* ── Hex dump ─────────────────────────────────────────────────────────────── */
function hexDump(bytes) {
    var limit = Math.min(bytes.length, 64);
    var lines = [];
    for (var row = 0; row < limit; row += 16) {
        var rowBytes = bytes.slice(row, Math.min(row + 16, limit));
        var offset = row.toString(16).padStart(8, '0');
        var hex = '';
        var asc = '';
        for (var col = 0; col < 16; col++) {
            if (col === 8) hex += ' ';
            if (col < rowBytes.length) {
                var b = rowBytes[col];
                hex += b.toString(16).padStart(2, '0') + ' ';
                asc += (b >= 0x20 && b <= 0x7e) ? String.fromCharCode(b) : '.';
            } else {
                hex += '   ';
                asc += ' ';
            }
        }
        lines.push(offset + '  ' + hex + ' |' + asc + '|');
    }
    return lines.join('\n');
}

/* ── Render ──────────────────────────────────────────────────────────────── */
function categoryIcon(type) {
    var t = type.toLowerCase();
    if (t.includes('image') || t.includes('png') || t.includes('jpeg') || t.includes('gif') || t.includes('bmp') || t.includes('ico') || t.includes('tiff') || t.includes('webp')) return '🖼';
    if (t.includes('pdf'))   return '📄';
    if (t.includes('zip') || t.includes('rar') || t.includes('7-zip') || t.includes('gzip') || t.includes('bzip') || t.includes('xz') || t.includes('lz4')) return '📦';
    if (t.includes('exe') || t.includes('elf') || t.includes('mach') || t.includes('java')) return '⚙';
    if (t.includes('mp4') || t.includes('avi') || t.includes('ogg') || t.includes('mkv')) return '🎬';
    if (t.includes('mp3') || t.includes('flac') || t.includes('wav') || t.includes('audio')) return '🎵';
    if (t.includes('font') || t.includes('woff') || t.includes('ttf') || t.includes('otf')) return '🔤';
    if (t.includes('sql') || t.includes('database')) return '🗄';
    if (t.includes('script') || t.includes('shebang')) return '📜';
    if (t.includes('office') || t.includes('doc') || t.includes('xls')) return '📊';
    return '📁';
}

function renderMatch(matches, bytes) {
    var el = document.getElementById('matchContent');
    if (!matches.length) {
        el.innerHTML = '<div style="display:flex;align-items:center;gap:10px;">'
            + '<span style="font-size:28px;">❓</span>'
            + '<div><div style="font-size:16px;font-weight:700;color:var(--text);">Unknown File Type</div>'
            + '<div style="font-size:13px;color:var(--text-muted);margin-top:3px;">No matching signature found for the first bytes.</div>'
            + '<div style="font-size:12px;font-family:\'JetBrains Mono\',monospace;color:var(--text-muted);margin-top:6px;">'
            + Array.from(bytes.slice(0, 8)).map(function(b){return b.toString(16).padStart(2,'0');}).join(' ')
            + '</div></div></div>';
        return;
    }

    var html = '';
    matches.forEach(function (sig, idx) {
        var magicHex = sig.magic.map(function (b) { return b.toString(16).padStart(2, '0'); }).join(' ');
        html += '<div style="' + (idx > 0 ? 'margin-top:14px;padding-top:14px;border-top:1px solid var(--border);' : '') + '">'
              + '<div style="display:flex;align-items:flex-start;gap:14px;">'
              + '<div style="font-size:32px;line-height:1;">' + categoryIcon(sig.type) + '</div>'
              + '<div style="flex:1;">'
              + '<div style="font-size:18px;font-weight:700;color:var(--text);">' + escHtml(sig.type) + '</div>'
              + '<div style="font-size:13px;color:var(--text-muted);margin-top:3px;">' + escHtml(sig.desc) + '</div>'
              + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">'
              + sig.ext.map(function(e){ return '<span style="background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 30%,var(--border));border-radius:4px;padding:2px 8px;font-size:12px;font-weight:600;">.' + escHtml(e) + '</span>'; }).join('')
              + '</div>'
              + '<div style="margin-top:10px;">'
              + '<span style="font-size:11px;font-weight:600;color:var(--text-muted);">MAGIC BYTES'
              + (sig.offset ? ' @ offset 0x' + sig.offset.toString(16) : '')
              + '</span><br>'
              + '<code style="font-size:12px;font-family:\'JetBrains Mono\',monospace;color:var(--accent-2);">' + escHtml(magicHex) + '</code>'
              + '</div>'
              + '</div></div></div>';
    });
    el.innerHTML = html;
}

function renderHexDump(bytes) {
    var el = document.getElementById('hexDump');
    el.textContent = hexDump(bytes);
}

/* ── Process ─────────────────────────────────────────────────────────────── */
function identify(bytes) {
    var matches = matchSignatures(bytes);
    renderMatch(matches, bytes);
    renderHexDump(bytes);
    document.getElementById('resultWrapper').style.display = '';
    document.getElementById('resultWrapper').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function processFile(file) {
    document.getElementById('fileInfo').textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    var reader = new FileReader();
    reader.onload = function (e) {
        var bytes = new Uint8Array(e.target.result);
        identify(bytes);
    };
    reader.readAsArrayBuffer(file);
}

function processHex() {
    var raw = document.getElementById('hexInput').value.replace(/\s+/g, '').replace(/^0x/i, '');
    if (!raw) { alert('Please paste hex bytes first.'); return; }
    if (!/^[0-9a-fA-F]+$/.test(raw)) { alert('Input contains non-hex characters.'); return; }
    if (raw.length % 2 !== 0) { raw = raw + '0'; }
    var bytes = new Uint8Array(raw.length / 2);
    for (var i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(raw.substr(i * 2, 2), 16);
    }
    document.getElementById('fileInfo').textContent = 'Hex input (' + bytes.length + ' bytes)';
    identify(bytes);
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('resultWrapper').style.display = 'none';

    var zone = document.getElementById('dropZone');
    var inp  = document.getElementById('fileInput');

    inp.addEventListener('change', function () { if (this.files[0]) processFile(this.files[0]); });

    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        zone.style.borderColor = 'var(--accent)';
        zone.style.background  = 'color-mix(in srgb,var(--accent) 5%,var(--surface))';
    });
    zone.addEventListener('dragleave', function () {
        zone.style.borderColor = 'var(--border)';
        zone.style.background  = '';
    });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.style.borderColor = 'var(--border)';
        zone.style.background  = '';
        if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
    });

    document.getElementById('identifyBtn').addEventListener('click', processHex);

    document.getElementById('clearBtn').addEventListener('click', function () {
        document.getElementById('hexInput').value = '';
        document.getElementById('fileInfo').textContent = '';
        document.getElementById('resultWrapper').style.display = 'none';
        inp.value = '';
    });
});
