/* ============================================================
   IP / CIDR Calculator — script.js
   IPv4 + basic IPv6 support
   ============================================================ */

/* ---- IPv4 ---- */
function ipToLong(ip) {
    var parts = ip.split('.');
    if (parts.length !== 4) throw new Error('Invalid IPv4 address');
    var n = 0;
    parts.forEach(function (p) {
        var v = parseInt(p, 10);
        if (isNaN(v) || v < 0 || v > 255) throw new Error('Invalid octet: ' + p);
        n = (n * 256 + v) >>> 0;
    });
    return n;
}

function longToIP(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function cidrToMask(prefix) {
    if (prefix < 0 || prefix > 32) throw new Error('Prefix must be 0–32');
    return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function calcIPv4(input) {
    input = input.trim();
    var cidrMatch = input.match(/^([\d.]+)\/(\d+)$/);
    var ip, prefix, mask;

    if (cidrMatch) {
        ip     = cidrMatch[1];
        prefix = parseInt(cidrMatch[2], 10);
    } else if (input.match(/^[\d.]+$/)) {
        ip     = input;
        prefix = 32;
    } else {
        throw new Error('Enter an IPv4 address with optional CIDR (e.g. 192.168.1.0/24)');
    }

    var ipLong  = ipToLong(ip);
    mask        = cidrToMask(prefix);
    var network = (ipLong & mask) >>> 0;
    var bcast   = (network | (~mask >>> 0)) >>> 0;
    var first   = prefix < 31 ? (network + 1) >>> 0 : network;
    var last    = prefix < 31 ? (bcast  - 1) >>> 0 : bcast;
    var hosts   = prefix >= 31 ? Math.pow(2, 32 - prefix) : Math.pow(2, 32 - prefix) - 2;
    var wildcard = longToIP(~mask >>> 0);

    function toBin(n) {
        return ((n >>> 24) & 255).toString(2).padStart(8,'0') + '.' +
               ((n >>> 16) & 255).toString(2).padStart(8,'0') + '.' +
               ((n >>> 8)  & 255).toString(2).padStart(8,'0') + '.' +
               (n & 255).toString(2).padStart(8,'0');
    }

    return [
        ['IP address',           longToIP(ipLong), toBin(ipLong)],
        ['Network address',      longToIP(network), toBin(network)],
        ['Broadcast address',    longToIP(bcast), toBin(bcast)],
        ['Subnet mask',          longToIP(mask), toBin(mask)],
        ['Wildcard mask',        wildcard, toBin(~mask >>> 0)],
        ['First usable host',    longToIP(first), ''],
        ['Last usable host',     longToIP(last), ''],
        ['Usable hosts',         hosts.toLocaleString(), ''],
        ['CIDR notation',        longToIP(network) + '/' + prefix, ''],
        ['IP class',             getClass(ipLong), ''],
        ['Type',                 getType(network, prefix), ''],
    ];
}

function getClass(ip) {
    if ((ip >>> 28) < 8)  return 'A';
    if ((ip >>> 29) < 12) return 'B';
    if ((ip >>> 29) < 14) return 'C';
    if ((ip >>> 28) === 14) return 'D (Multicast)';
    return 'E (Reserved)';
}

function getType(net, prefix) {
    if ((net >>> 24) === 10) return 'Private (RFC 1918)';
    if ((net >>> 20) === 0xAC1) return 'Private (RFC 1918)';  // 172.16–31
    if ((net >>> 16) === 0xC0A8) return 'Private (RFC 1918)'; // 192.168
    if ((net >>> 24) === 127) return 'Loopback';
    if ((net >>> 24) === 169 && ((net >>> 16) & 0xFF) === 254) return 'Link-local (APIPA)';
    if ((net >>> 28) === 14) return 'Multicast';
    if ((net >>> 16) === 0xC0FF && (net & 0xFFFF) === 0xFF00) return 'Limited broadcast';
    return 'Public';
}

/* ---- IPv6 basic ---- */
function expandIPv6(addr) {
    if (addr.includes('::')) {
        var parts = addr.split('::');
        var left  = parts[0] ? parts[0].split(':') : [];
        var right = parts[1] ? parts[1].split(':') : [];
        var missing = 8 - left.length - right.length;
        var mid = Array(missing).fill('0000');
        return left.concat(mid).concat(right).map(function (g) { return g.padStart(4, '0'); }).join(':');
    }
    return addr.split(':').map(function (g) { return g.padStart(4, '0'); }).join(':');
}

function calcIPv6(input) {
    var cidrMatch = input.match(/^([0-9a-fA-F:]+)\/(\d+)$/);
    var addr = cidrMatch ? cidrMatch[1] : input;
    var prefix = cidrMatch ? parseInt(cidrMatch[2], 10) : 128;
    try {
        var expanded = expandIPv6(addr);
        return [
            ['Address', expanded],
            ['Prefix length', '/' + prefix],
            ['Full expanded', expanded],
            ['Compressed', compressIPv6(expanded)],
        ];
    } catch (e) {
        throw new Error('Invalid IPv6 address');
    }
}

function compressIPv6(expanded) {
    var groups = expanded.split(':').map(function (g) { return parseInt(g, 16).toString(16); });
    var s = groups.join(':');
    // Find longest run of zeros
    var best = { start: -1, len: 0 };
    var cur  = { start: -1, len: 0 };
    groups.forEach(function (g, i) {
        if (g === '0') {
            if (cur.start === -1) cur.start = i;
            cur.len++;
            if (cur.len > best.len) { best = { start: cur.start, len: cur.len }; }
        } else { cur = { start: -1, len: 0 }; }
    });
    if (best.len > 1) {
        var before = groups.slice(0, best.start).join(':');
        var after  = groups.slice(best.start + best.len).join(':');
        s = (before ? before + '::' : '::') + after;
    }
    return s;
}

/* ---- Subnet split ---- */
function splitSubnet(networkStr, newPrefix) {
    var match = networkStr.match(/^([\d.]+)\/(\d+)$/);
    if (!match) throw new Error('Enter a network like 192.168.1.0/24');
    var baseIP = ipToLong(match[1]);
    var oldPrefix = parseInt(match[2], 10);
    var mask = cidrToMask(oldPrefix);
    var network = (baseIP & mask) >>> 0;

    if (newPrefix <= oldPrefix) throw new Error('New prefix must be larger than ' + oldPrefix);
    var count = Math.pow(2, newPrefix - oldPrefix);
    if (count > 256) throw new Error('Too many subnets (max 256 shown)');
    var subnetSize = Math.pow(2, 32 - newPrefix) >>> 0;

    var rows = [];
    for (var i = 0; i < count; i++) {
        var snet = (network + i * subnetSize) >>> 0;
        var sbcast = (snet + subnetSize - 1) >>> 0;
        var hosts = newPrefix >= 31 ? subnetSize : subnetSize - 2;
        rows.push([
            (i + 1),
            longToIP(snet) + '/' + newPrefix,
            longToIP((snet + (newPrefix < 31 ? 1 : 0)) >>> 0),
            longToIP((sbcast - (newPrefix < 31 ? 1 : 0)) >>> 0),
            longToIP(sbcast),
            hosts,
        ]);
    }
    return rows;
}

/* ---- UI ---- */
function renderRows(rows) {
    var tbody = document.getElementById('cidrTableBody');
    tbody.innerHTML = '';
    rows.forEach(function (row) {
        var tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        row.forEach(function (cell, i) {
            var td = document.createElement('td');
            td.style.cssText = 'padding:8px 12px;font-size:13px;' + (i === 0 ? 'color:var(--text-muted);' : '');
            if (i === 1 || cell.toString().match(/^\d+\.\d+/)) {
                td.style.fontFamily = 'JetBrains Mono,monospace';
                td.style.fontSize = '12px';
            }
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    document.getElementById('cidrResultWrapper').style.display = '';
}

function renderSplitRows(rows) {
    var tbody = document.getElementById('splitTableBody');
    tbody.innerHTML = '';
    rows.forEach(function (row) {
        var tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        row.forEach(function (cell, i) {
            var td = document.createElement('td');
            td.style.cssText = 'padding:7px 10px;font-size:12px;font-family:JetBrains Mono,monospace;';
            if (i === 0) { td.style.fontFamily = 'inherit'; td.style.color = 'var(--text-muted)'; td.style.fontSize = '12px'; }
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    document.getElementById('splitResultWrapper').style.display = '';
}

function runCalc() {
    var input = document.getElementById('cidrInput').value.trim();
    var errEl = document.getElementById('cidrError');
    document.getElementById('cidrResultWrapper').style.display = 'none';
    errEl.textContent = '';

    if (!input) return;

    try {
        var rows;
        if (input.match(/:/)) {
            rows = calcIPv6(input).map(function (r) { return [r[0], r[1], '']; });
            document.getElementById('cidrTableHead').innerHTML =
                '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Property</th>' +
                '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Value</th>' +
                '<th></th>';
        } else {
            rows = calcIPv4(input);
            document.getElementById('cidrTableHead').innerHTML =
                '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Property</th>' +
                '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Value</th>' +
                '<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-size:11px;text-transform:uppercase;">Binary</th>';
        }
        renderRows(rows);
    } catch (e) {
        errEl.textContent = e.message;
    }
}

function runSplit() {
    var network = document.getElementById('splitNetwork').value.trim();
    var prefix  = parseInt(document.getElementById('splitPrefix').value, 10);
    var errEl   = document.getElementById('splitError');
    document.getElementById('splitResultWrapper').style.display = 'none';
    errEl.textContent = '';
    try {
        renderSplitRows(splitSubnet(network, prefix));
    } catch (e) {
        errEl.textContent = e.message;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('calcBtn').addEventListener('click', runCalc);
    document.getElementById('splitBtn').addEventListener('click', runSplit);
    document.getElementById('cidrInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') runCalc();
    });
    document.getElementById('cidrResultWrapper').style.display = 'none';
    document.getElementById('splitResultWrapper').style.display = 'none';
});
