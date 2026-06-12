#!/usr/bin/env node
// Post-processes the exported web build (dist/index.html) into a proper
// installable PWA page: manifest link, theme colour, iOS home-screen icon,
// description, and Albanian lang. Run after `expo export -p web`, before the
// 404.html SPA fallback is copied (so the fallback inherits everything).
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const inject = [
  '<link rel="manifest" href="manifest.json">',
  '<meta name="theme-color" content="#FF5500">',
  '<meta name="description" content="Bli dhe shit gjithçka në Shqipëri — makina, prona, elektronikë, veshje e më shumë. Falas.">',
  '<link rel="apple-touch-icon" href="icon-192.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="Shitje">',
].join('');

html = html.replace('<html lang="en">', '<html lang="sq">');
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', `${inject}</head>`);
}
fs.writeFileSync(file, html);
console.log('postbuild-web: PWA meta injected into dist/index.html');
