#!/usr/bin/env node
/**
 * CyberTools release audit.
 *
 * Checks:
 *  1. assets/data/tools.json
 *  2. js/components.js CT.TOOLS runtime registry
 *  3. tools/ folders
 *  4. homepage dynamic renderer wiring
 *  5. security posture basics for a GitHub Pages static app
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://ctlib.github.io/CyberTools/';
let errors = 0;

function fail(message) {
    console.error(`  [FAIL] ${message}`);
    errors++;
}

function pass(message) {
    console.log(`  [OK]   ${message}`);
}

function read(path) {
    return readFileSync(resolve(ROOT, path), 'utf8');
}

function walk(dir, predicate, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'test') continue;
        const abs = resolve(dir, entry.name);
        if (entry.isDirectory()) walk(abs, predicate, out);
        else if (predicate(abs)) out.push(abs);
    }
    return out;
}

function setDiff(left, right) {
    return [...left].filter((item) => !right.has(item)).sort();
}

const toolsJsonPath = resolve(ROOT, 'assets/data/tools.json');
if (!existsSync(toolsJsonPath)) {
    fail('assets/data/tools.json is missing');
    process.exit(1);
}

const jsonTools = JSON.parse(read('assets/data/tools.json'));
const jsonSlugs = new Set(jsonTools.map((tool) => tool.slug));
pass(`assets/data/tools.json lists ${jsonTools.length} tools`);

const componentsText = read('js/components.js');
const idMatches = [...componentsText.matchAll(/\{\s*id:\s*'([^']+)',\s*name:/g)];
const ctSlugs = new Set(idMatches.map((match) => match[1]));
pass(`js/components.js CT.TOOLS lists ${ctSlugs.size} tools`);

const diskFolders = readdirSync(resolve(ROOT, 'tools'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
const diskSlugs = new Set(diskFolders);
pass(`tools/ contains ${diskFolders.length} folders`);

for (const slug of setDiff(jsonSlugs, ctSlugs)) fail(`tools.json has '${slug}' but CT.TOOLS does not`);
for (const slug of setDiff(ctSlugs, jsonSlugs)) fail(`CT.TOOLS has '${slug}' but tools.json does not`);

for (const tool of jsonTools) {
    const folder = tool.path.replace(/^tools\//, '').replace(/\/$/, '');
    if (!diskSlugs.has(folder)) fail(`tools.json path '${tool.path}' has no matching tools/${folder}/ folder`);
}

for (const folder of diskFolders.sort()) {
    const inJson = jsonTools.some((tool) => tool.path === `tools/${folder}/`);
    if (!inJson) fail(`tools/${folder}/ exists but is missing from tools.json`);
}

const indexHtml = read('index.html');
if (!indexHtml.includes('id="home-tools-grid"') || !indexHtml.includes('js/homepage.js')) {
    fail('index.html is not wired to the dynamic homepage tool grid');
} else {
    pass('homepage uses dynamic tool grid renderer');
}

const serviceWorker = read('service-worker.js');
for (const tool of jsonTools) {
    const htmlPath = `./${tool.path}index.html`;
    if (!serviceWorker.includes(htmlPath)) fail(`service-worker.js does not precache ${htmlPath}`);
}
for (const asset of ['./js/theme.js', './js/page-init.js', './js/homepage.js', './js/tools-index.js']) {
    if (!serviceWorker.includes(asset)) fail(`service-worker.js does not precache ${asset}`);
}
pass('service worker cache manifest checked');

const htmlFiles = walk(ROOT, (abs) => abs.endsWith('.html'));
let inlineExecutableScripts = 0;
let missingCsp = 0;
let badBlankTargets = 0;
let missingBoot = 0;
let missingSearchMetadata = 0;
let invalidStructuredData = 0;

for (const abs of htmlFiles) {
    const text = readFileSync(abs, 'utf8');
    const rel = relative(ROOT, abs).replace(/\\/g, '/');

    if (!text.includes('http-equiv="Content-Security-Policy"')) {
        missingCsp++;
        fail(`${rel} is missing a CSP meta tag`);
    }

    if (!text.includes('js/theme.js') || !text.includes('js/page-init.js')) {
        missingBoot++;
        fail(`${rel} is missing shared theme/page bootstrap wiring`);
    }

    if (rel !== '404.html' && !text.includes('<!-- Search metadata -->')) {
        missingSearchMetadata++;
        fail(`${rel} is missing generated search metadata`);
    }

    for (const match of text.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
        try {
            JSON.parse(match[1].trim());
        } catch (error) {
            invalidStructuredData++;
            fail(`${rel} has invalid JSON-LD: ${error.message}`);
        }
    }

    const inlineScripts = [...text.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
        .filter((match) => !/type=["']application\/ld\+json["']/i.test(match[0]));
    if (inlineScripts.length) {
        inlineExecutableScripts += inlineScripts.length;
        fail(`${rel} has ${inlineScripts.length} executable inline script tag(s)`);
    }

    const blankLinks = [...text.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)];
    for (const link of blankLinks) {
        if (!/\brel=["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b/i.test(link[0])) {
            badBlankTargets++;
            fail(`${rel} has target="_blank" without rel="noopener noreferrer"`);
        }
    }
}

if (missingCsp === 0) pass(`all ${htmlFiles.length} HTML files include CSP`);
if (missingBoot === 0) pass(`all ${htmlFiles.length} HTML files use shared boot scripts`);
if (missingSearchMetadata === 0) pass('all indexable HTML files include generated search metadata');
if (invalidStructuredData === 0) pass('all JSON-LD structured data parses successfully');
if (inlineExecutableScripts === 0) pass('no executable inline <script> tags found');
if (badBlankTargets === 0) pass('all target="_blank" links use noopener noreferrer');

const sitemap = read('sitemap.xml');
const robots = read('robots.txt');
const expectedUrls = [
    SITE_URL,
    `${SITE_URL}tools-index.html`,
    `${SITE_URL}about.html`,
    `${SITE_URL}privacy.html`,
    ...jsonTools.map((tool) => `${SITE_URL}${tool.path}`)
];

for (const url of expectedUrls) {
    if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap.xml is missing ${url}`);
}

if (!robots.includes(`Sitemap: ${SITE_URL}sitemap.xml`)) {
    fail('robots.txt does not point to sitemap.xml');
} else {
    pass('robots.txt points to sitemap.xml');
}

console.log('-'.repeat(60));
if (errors === 0) {
    console.log(`\nAudit passed: ${jsonTools.length} tools and ${htmlFiles.length} HTML files checked.\n`);
    process.exit(0);
}

console.error(`\nAudit failed: ${errors} issue${errors === 1 ? '' : 's'} found.\n`);
process.exit(1);
