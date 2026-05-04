/* ============================================================
   Common Ports Reference — script.js
   ============================================================ */

var PORTS = [
    // Network infrastructure
    [20,'TCP','FTP','FTP data transfer'],
    [21,'TCP','FTP','FTP control (command)'],
    [22,'TCP','SSH','Secure Shell, SFTP, SCP'],
    [23,'TCP','Telnet','Unencrypted remote login (insecure — use SSH)'],
    [25,'TCP','SMTP','Email sending (server-to-server)'],
    [53,'TCP/UDP','DNS','Domain Name System'],
    [67,'UDP','DHCP','DHCP server'],
    [68,'UDP','DHCP','DHCP client'],
    [69,'UDP','TFTP','Trivial File Transfer Protocol'],
    [80,'TCP','HTTP','Hypertext Transfer Protocol'],
    [110,'TCP','POP3','Post Office Protocol v3 (email retrieval)'],
    [119,'TCP','NNTP','Network News Transfer Protocol'],
    [123,'UDP','NTP','Network Time Protocol'],
    [135,'TCP','MSRPC','Microsoft RPC endpoint mapper'],
    [137,'UDP','NetBIOS','NetBIOS Name Service'],
    [138,'UDP','NetBIOS','NetBIOS Datagram Service'],
    [139,'TCP','NetBIOS','NetBIOS Session Service / SMB over NetBIOS'],
    [143,'TCP','IMAP','Internet Message Access Protocol'],
    [161,'UDP','SNMP','Simple Network Management Protocol'],
    [162,'UDP','SNMPTRAP','SNMP trap receiver'],
    [179,'TCP','BGP','Border Gateway Protocol'],
    [194,'TCP','IRC','Internet Relay Chat'],
    [389,'TCP','LDAP','Lightweight Directory Access Protocol'],
    [443,'TCP','HTTPS','HTTP over TLS/SSL'],
    [445,'TCP','SMB','Server Message Block (Windows file sharing)'],
    [465,'TCP','SMTPS','SMTP over TLS (legacy)'],
    [500,'UDP','IKE','IPsec Internet Key Exchange'],
    [514,'UDP','Syslog','System log messages'],
    [515,'TCP','LPD','Line Printer Daemon'],
    [554,'TCP','RTSP','Real Time Streaming Protocol'],
    [587,'TCP','SMTP','SMTP submission (email client → server)'],
    [631,'TCP','IPP','Internet Printing Protocol'],
    [636,'TCP','LDAPS','LDAP over TLS'],
    [993,'TCP','IMAPS','IMAP over TLS'],
    [995,'TCP','POP3S','POP3 over TLS'],
    [1080,'TCP','SOCKS','SOCKS proxy'],
    [1194,'UDP','OpenVPN','OpenVPN default port'],
    [1433,'TCP','MSSQL','Microsoft SQL Server'],
    [1434,'UDP','MSSQL','Microsoft SQL Server Browser'],
    [1521,'TCP','Oracle','Oracle Database'],
    [1723,'TCP','PPTP','Point-to-Point Tunneling Protocol VPN'],
    [2049,'TCP','NFS','Network File System'],
    [2181,'TCP','ZooKeeper','Apache ZooKeeper'],
    [2375,'TCP','Docker','Docker daemon (unauthenticated — do not expose)'],
    [2376,'TCP','Docker','Docker daemon over TLS'],
    [3000,'TCP','Dev','Common development server (Node.js, React, etc.)'],
    [3306,'TCP','MySQL','MySQL / MariaDB database'],
    [3389,'TCP','RDP','Windows Remote Desktop Protocol'],
    [4444,'TCP','Metasploit','Metasploit Framework default listener'],
    [4789,'UDP','VXLAN','Virtual Extensible LAN overlay'],
    [5000,'TCP','Dev','Common dev server / Flask default'],
    [5432,'TCP','PostgreSQL','PostgreSQL database'],
    [5601,'TCP','Kibana','Kibana dashboard'],
    [5900,'TCP','VNC','Virtual Network Computing (remote desktop)'],
    [5985,'TCP','WinRM','Windows Remote Management (HTTP)'],
    [5986,'TCP','WinRM','Windows Remote Management (HTTPS)'],
    [6379,'TCP','Redis','Redis in-memory database'],
    [6443,'TCP','K8s','Kubernetes API server'],
    [7001,'TCP','WebLogic','Oracle WebLogic Server'],
    [8000,'TCP','Dev','Common HTTP development server'],
    [8080,'TCP','HTTP-Alt','HTTP alternative / proxy / dev server'],
    [8443,'TCP','HTTPS-Alt','HTTPS alternative'],
    [8888,'TCP','Jupyter','Jupyter Notebook default'],
    [9000,'TCP','PHP-FPM','PHP FastCGI Process Manager / SonarQube'],
    [9090,'TCP','Prometheus','Prometheus metrics server'],
    [9200,'TCP','Elasticsearch','Elasticsearch HTTP API'],
    [9300,'TCP','Elasticsearch','Elasticsearch cluster transport'],
    [10250,'TCP','Kubelet','Kubernetes Kubelet API'],
    [11211,'TCP/UDP','Memcached','Memcached cache server'],
    [27017,'TCP','MongoDB','MongoDB database'],
    [27018,'TCP','MongoDB','MongoDB shard server'],
    [27019,'TCP','MongoDB','MongoDB config server'],
    [50000,'TCP','Jenkins','Jenkins web interface (common config)'],
    [51820,'UDP','WireGuard','WireGuard VPN default port'],
];

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function getRiskBadge(port) {
    var risky = [21,23,25,80,135,137,138,139,445,1433,1521,2375,3306,4444,5432,5900,6379,9200,11211,27017];
    var caution = [22,53,443,3389,5985,5986,8080,8443];
    if (risky.includes(port))   return '<span style="background:color-mix(in srgb,var(--danger) 20%,transparent);color:var(--danger);border:1px solid color-mix(in srgb,var(--danger) 40%,transparent);font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;">RISKY</span>';
    if (caution.includes(port)) return '<span style="background:color-mix(in srgb,var(--warning) 20%,transparent);color:var(--warning);border:1px solid color-mix(in srgb,var(--warning) 40%,transparent);font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;">COMMON TARGET</span>';
    return '';
}

var filtered = PORTS;

function render(ports) {
    var tbody = document.getElementById('portsTable');
    if (!ports.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text-muted);">No ports match your search.</td></tr>';
        return;
    }
    tbody.innerHTML = ports.map(function (p) {
        return '<tr style="border-bottom:1px solid var(--border);">' +
            '<td style="padding:8px 12px;font-family:JetBrains Mono,monospace;font-size:13px;font-weight:600;color:var(--accent-2);">' + p[0] + '</td>' +
            '<td style="padding:8px 12px;font-size:12px;color:var(--text-muted);">' + p[1] + '</td>' +
            '<td style="padding:8px 12px;font-size:13px;font-weight:600;">' + escHtml(p[2]) + '</td>' +
            '<td style="padding:8px 12px;font-size:13px;color:var(--text-muted);">' + escHtml(p[3]) + '</td>' +
            '<td style="padding:8px 12px;">' + getRiskBadge(p[0]) + '</td></tr>';
    }).join('');
}

function filterPorts() {
    var q = document.getElementById('portSearch').value.toLowerCase().trim();
    if (!q) { filtered = PORTS; render(PORTS); document.getElementById('portCount').textContent = PORTS.length + ' ports'; return; }
    filtered = PORTS.filter(function (p) {
        return String(p[0]).includes(q) || p[1].toLowerCase().includes(q) ||
               p[2].toLowerCase().includes(q) || p[3].toLowerCase().includes(q);
    });
    render(filtered);
    document.getElementById('portCount').textContent = filtered.length + ' match' + (filtered.length !== 1 ? 'es' : '');
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('portSearch').addEventListener('input', filterPorts);
    render(PORTS);
    document.getElementById('portCount').textContent = PORTS.length + ' ports';
});
