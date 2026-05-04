#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://ctlib.github.io/CyberTools/';
const LOGO_URL = `${SITE_URL}assets/logowb.png`;
const TODAY = '2026-05-04';
const AUTHOR = 'CTLib';
const AUTHOR_URL = 'https://github.com/ctlib';
const SEO_START = '<!-- Search metadata -->';
const SEO_END = '<!-- /Search metadata -->';
const ROBOTS_CONTENT = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`;

function read(path) {
    return readFileSync(resolve(ROOT, path), 'utf8');
}

function write(path, content) {
    writeFileSync(resolve(ROOT, path), content, 'utf8');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function stripTags(value) {
    return String(value).replace(/<\/?([a-z0-9-]+)[^>]*>/gi, '$1').replace(/\s+/g, ' ').trim();
}

function sentence(value) {
    const text = stripTags(value);
    return /[.!?]$/.test(text) ? text : `${text}.`;
}

function truncate(value, max = 158) {
    const text = stripTags(value).replace(/\s+/g, ' ').trim();
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(' ');
    return `${cut.slice(0, lastSpace > 90 ? lastSpace : max - 1).trim()}…`;
}

function unique(items) {
    return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];
}

function pageUrl(path) {
    return new URL(path, SITE_URL).href;
}

function jsonLd(data) {
    return JSON.stringify(data);
}

function buildBreadcrumb(url, name) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'CyberTools',
                item: SITE_URL
            },
            {
                '@type': 'ListItem',
                position: 2,
                name,
                item: url
            }
        ]
    };
}

function toolTitle(tool) {
    return `${tool.name} - Free Client-Side Tool | CyberTools`;
}

function toolDescription(tool) {
    return truncate(`Free online ${tool.name} tool. ${sentence(tool.description)} Runs locally in your browser with no tracking, signup, or uploads.`);
}

function rootMetadata(path) {
    const pages = {
        'index.html': {
            title: 'CyberTools - Free Client-Side Cybersecurity Tools',
            description: 'Free online cybersecurity toolkit with 39 client-side tools for Base64, JWT, AES, hashes, forensics, CTF, OSINT, and web security. No tracking or uploads.',
            url: SITE_URL,
            type: 'WebSite',
            keywords: [
                'cybersecurity tools',
                'online security tools',
                'ctf tools',
                'penetration testing tools',
                'browser security tools',
                'client-side tools',
                'cyber tools',
                'أدوات الأمن السيبراني',
                'أدوات CTF',
                'أدوات تشفير'
            ]
        },
        'tools-index.html': {
            title: 'All Cybersecurity Tools - CyberTools',
            description: 'Browse every CyberTools utility: encoding, hashes, JWT, crypto, web security, forensics, CTF, OSINT, networking, and developer tools.',
            url: pageUrl('tools-index.html'),
            type: 'CollectionPage',
            keywords: [
                'all cybersecurity tools',
                'security tools catalog',
                'ctf tool collection',
                'online developer tools',
                'forensics tools',
                'web security tools'
            ]
        },
        'about.html': {
            title: 'About CyberTools - Private Browser-Based Security Tools',
            description: 'CyberTools is a free, open-source cybersecurity toolkit for analysts, pentesters, CTF players, and developers. Everything runs locally in the browser.',
            url: pageUrl('about.html'),
            type: 'AboutPage',
            keywords: ['about cybertools', 'open source security tools', 'private cybersecurity toolkit']
        },
        'privacy.html': {
            title: 'Privacy and Security - CyberTools',
            description: 'CyberTools privacy policy: every operation runs in your browser. No analytics, no cookies, no uploads, no server-side processing.',
            url: pageUrl('privacy.html'),
            type: 'PrivacyPolicy',
            keywords: ['privacy-first security tools', 'client-side cybersecurity tools', 'no tracking tools']
        }
    };

    return pages[path];
}

function buildHomeGraph(tools) {
    const toolItems = tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: pageUrl(tool.path)
    }));

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${SITE_URL}#website`,
                name: 'CyberTools',
                alternateName: [
                    'Cyber Tools',
                    'Client-side Cybersecurity Tools',
                    'CTF Tools',
                    'Browser Security Toolkit',
                    'أدوات الأمن السيبراني',
                    'أدوات سايبر'
                ],
                url: SITE_URL,
                inLanguage: 'en',
                publisher: { '@id': `${SITE_URL}#organization` },
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${SITE_URL}tools-index.html?q={search_term_string}`,
                    'query-input': 'required name=search_term_string'
                }
            },
            {
                '@type': 'Organization',
                '@id': `${SITE_URL}#organization`,
                name: 'CyberTools',
                url: SITE_URL,
                logo: LOGO_URL,
                sameAs: [AUTHOR_URL, 'https://github.com/ctlib/CyberTools']
            },
            {
                '@type': 'SoftwareApplication',
                '@id': `${SITE_URL}#app`,
                name: 'CyberTools',
                applicationCategory: 'SecurityApplication',
                operatingSystem: 'Any',
                url: SITE_URL,
                image: LOGO_URL,
                description: 'Free, open-source cybersecurity toolkit that runs entirely in your browser.',
                isAccessibleForFree: true,
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                author: { '@type': 'Organization', name: AUTHOR, url: AUTHOR_URL },
                license: 'https://opensource.org/licenses/MIT'
            },
            {
                '@type': 'ItemList',
                '@id': `${SITE_URL}#tools`,
                name: 'CyberTools tool catalog',
                numberOfItems: tools.length,
                itemListElement: toolItems
            }
        ]
    };
}

function buildCollectionGraph(tools, page) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': page.type,
                '@id': `${page.url}#webpage`,
                name: page.title,
                url: page.url,
                description: page.description,
                isPartOf: { '@id': `${SITE_URL}#website` },
                inLanguage: 'en'
            },
            {
                '@type': 'ItemList',
                '@id': `${page.url}#tools`,
                name: 'CyberTools tool catalog',
                numberOfItems: tools.length,
                itemListElement: tools.map((tool, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: tool.name,
                    description: tool.description,
                    url: pageUrl(tool.path)
                }))
            },
            buildBreadcrumb(page.url, page.title.replace(' - CyberTools', ''))
        ]
    };
}

function buildSimpleGraph(page) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': page.type,
                '@id': `${page.url}#webpage`,
                name: page.title,
                url: page.url,
                description: page.description,
                isPartOf: { '@id': `${SITE_URL}#website` },
                inLanguage: 'en'
            },
            buildBreadcrumb(page.url, page.title.replace(' - CyberTools', ''))
        ]
    };
}

function buildToolGraph(tool, meta) {
    const categoryNames = {
        encoding: 'Encoding and Decoding',
        hashing: 'Hashing',
        jwt: 'JWT and Tokens',
        crypto: 'Cryptography',
        'web-security': 'Web Security',
        network: 'Network and DNS',
        utilities: 'Utilities',
        forensics: 'Forensics',
        classical: 'Classical Ciphers',
        pentest: 'Authorized Web App Testing',
        osint: 'OSINT'
    };

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                '@id': `${meta.url}#app`,
                name: tool.name,
                alternateName: unique([tool.slug, ...tool.tags]),
                applicationCategory: 'SecurityApplication',
                applicationSubCategory: categoryNames[tool.category] || tool.category,
                operatingSystem: 'Any',
                url: meta.url,
                image: LOGO_URL,
                description: meta.description,
                keywords: unique(tool.tags).join(', '),
                isAccessibleForFree: true,
                browserRequirements: 'Requires JavaScript. Runs locally in the browser without server uploads.',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                author: { '@type': 'Organization', name: AUTHOR, url: AUTHOR_URL },
                publisher: { '@id': `${SITE_URL}#organization` },
                isPartOf: { '@id': `${SITE_URL}#app` },
                license: 'https://opensource.org/licenses/MIT'
            },
            {
                '@type': 'WebPage',
                '@id': `${meta.url}#webpage`,
                name: meta.title,
                url: meta.url,
                description: meta.description,
                inLanguage: 'en',
                isPartOf: { '@id': `${SITE_URL}#website` }
            },
            buildBreadcrumb(meta.url, tool.name)
        ]
    };
}

function buildSeoBlock(meta, graph, depth) {
    const image = LOGO_URL;
    const prefix = depth === 2 ? '../../' : '';
    const keywords = unique(meta.keywords || []).slice(0, 18).join(', ');

    return `${SEO_START}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content="#0d1117" />
        ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ''}
        <meta property="og:site_name" content="CyberTools" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content="${escapeHtml(meta.title)}" />
        <meta property="og:description" content="${escapeHtml(meta.description)}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${escapeHtml(meta.url)}" />
        <meta property="og:image" content="${image}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
        <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
        <meta name="twitter:image" content="${image}" />
        <link rel="alternate" hreflang="en" href="${escapeHtml(meta.url)}" />
        <link rel="alternate" hreflang="x-default" href="${escapeHtml(meta.url)}" />
        <link rel="sitemap" type="application/xml" href="${prefix}sitemap.xml" />
        <script type="application/ld+json">
        ${jsonLd(graph)}
        </script>
        ${SEO_END}`;
}

function updateHead(html, meta, graph, depth) {
    let next = html;
    const block = buildSeoBlock(meta, graph, depth);

    next = next.replace(new RegExp(`${SEO_START}[\\s\\S]*?${SEO_END}\\s*`, 'g'), '');
    next = next.replace(/\s*<!-- Structured data -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '\n');
    next = next.replace(/\s*<!-- OpenGraph -->\s*/g, '\n');
    next = next.replace(/\s*<!-- Twitter -->\s*/g, '\n');
    next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

    if (/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i.test(next)) {
        next = next.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`);
    } else {
        next = next.replace(/<title>[\s\S]*?<\/title>/i, (match) => `${match}\n        <meta name="description" content="${escapeHtml(meta.description)}" />`);
    }

    if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i.test(next)) {
        next = next.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(meta.url)}" />`);
    } else {
        next = next.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, (match) => `${match}\n        <link rel="canonical" href="${escapeHtml(meta.url)}" />`);
    }

    next = next.replace(/\s*<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/gi, '');
    next = next.replace(/\s*<meta\s+name="robots"\s+content="(?!noindex)[^"]*"\s*\/?>/gi, '');
    next = next.replace(/\s*<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>/gi, '');
    next = next.replace(/\s*<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>/gi, '');
    next = next.replace(/\s*<meta\s+name="theme-color"\s+content="[^"]*"\s*\/?>/gi, '');
    next = next.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]*"\s*\/?>/gi, '');
    next = next.replace(/\s*<link\s+rel="sitemap"\s+type="application\/xml"\s+href="[^"]*"\s*\/?>/gi, '');

    return next
        .replace(/(<meta\s+http-equiv="Content-Security-Policy"[^>]*>\s*)/i, `$1\n        ${block}\n`)
        .replace(/\n\s*<!-- CSP -->/g, '\n        <!-- CSP -->')
        .replace(/\n\s*<!-- Favicon -->/g, '\n        <!-- Favicon -->')
        .replace(/\n\s*<!-- Fonts preload -->/g, '\n        <!-- Fonts preload -->')
        .replace(/\n\s*<!-- Styles -->/g, '\n        <!-- Styles -->')
        .replace(/\n\s*<!-- Theme:/g, '\n        <!-- Theme:')
        .replace(/\n\s*\n\s*\n\s*<!-- Search metadata -->/g, '\n\n        <!-- Search metadata -->')
        .replace(/\n<link rel="icon"/g, '\n        <link rel="icon"');
}

function updateToolsIndexQuerySupport() {
    const path = 'js/tools-index.js';
    let js = read(path);
    if (js.includes('function syncQueryParam')) return;

    js = js.replace(
        "    function renderToolsGrid(query) {",
        `    function syncQueryParam(query) {
        var url = new URL(window.location.href);
        if (query) url.searchParams.set('q', query);
        else url.searchParams.delete('q');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    function renderToolsGrid(query) {`
    );

    js = js.replace(
        `        var search = document.getElementById('tools-search');
        if (search) {
            search.addEventListener('input', function () {
                renderToolsGrid(this.value);
            });
        }
        renderToolsGrid(search ? search.value : '');`,
        `        var search = document.getElementById('tools-search');
        if (search) {
            var initialQuery = new URLSearchParams(window.location.search).get('q') || '';
            search.value = initialQuery;
            search.addEventListener('input', function () {
                syncQueryParam(this.value.trim());
                renderToolsGrid(this.value);
            });
        }
        renderToolsGrid(search ? search.value : '');`
    );

    write(path, js);
}

function buildSitemap(tools) {
    const rootPages = [
        { loc: SITE_URL, priority: '1.0', changefreq: 'weekly' },
        { loc: pageUrl('tools-index.html'), priority: '0.9', changefreq: 'weekly' },
        { loc: pageUrl('about.html'), priority: '0.6', changefreq: 'monthly' },
        { loc: pageUrl('privacy.html'), priority: '0.6', changefreq: 'monthly' }
    ];

    const toolPages = tools.map((tool) => ({
        loc: pageUrl(tool.path),
        priority: tool.tier === 'S' ? '0.9' : '0.8',
        changefreq: 'monthly'
    }));

    const urls = rootPages.concat(toolPages);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `    <url>
        <loc>${escapeXml(url.loc)}</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>
`;
}

function main() {
    const tools = JSON.parse(read('assets/data/tools.json'));
    const htmlPages = ['index.html', 'tools-index.html', 'about.html', 'privacy.html'];

    for (const pagePath of htmlPages) {
        if (!existsSync(resolve(ROOT, pagePath))) continue;
        const meta = rootMetadata(pagePath);
        const graph = pagePath === 'index.html'
            ? buildHomeGraph(tools)
            : pagePath === 'tools-index.html'
                ? buildCollectionGraph(tools, meta)
                : buildSimpleGraph(meta);
        write(pagePath, updateHead(read(pagePath), meta, graph, 0));
    }

    for (const tool of tools) {
        const pagePath = `${tool.path}index.html`;
        if (!existsSync(resolve(ROOT, pagePath))) continue;
        const meta = {
            title: toolTitle(tool),
            description: toolDescription(tool),
            url: pageUrl(tool.path),
            keywords: unique([
                tool.name,
                `${tool.name} online`,
                `${tool.name} tool`,
                `${tool.name} CyberTools`,
                ...tool.tags,
                'cybersecurity tools',
                'ctf tools',
                'client-side tools'
            ])
        };
        write(pagePath, updateHead(read(pagePath), meta, buildToolGraph(tool, meta), 2));
    }

    updateToolsIndexQuerySupport();
    write('sitemap.xml', buildSitemap(tools));
    write('robots.txt', ROBOTS_CONTENT);
}

main();
