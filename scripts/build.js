// scripts/build.js — inline src/*.js + styles into one dist/index.html (+ sw.js, icons, manifest)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BASE_VERSION = '0.1.0';
function buildId() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); }
  catch (e) { return 'b' + Date.now().toString(36); }
}
const VERSION = BASE_VERSION + '-' + buildId();
const read = function (p) { return fs.readFileSync(p, 'utf8'); };
function write(p, c) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c, 'utf8'); }
function inlineBetween(html, startTag, endTag, mapFn) {
  const s = html.indexOf(startTag), e = html.indexOf(endTag);
  if (s < 0 || e < 0) return html;
  const block = html.slice(s, e);
  return html.slice(0, s) + mapFn(block) + html.slice(e);
}
let html = read(path.join(ROOT, 'index.html'));
html = inlineBetween(html, '<!-- STYLES:START -->', '<!-- STYLES:END -->', function (b) {
  const hrefs = [...b.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
  return '<!-- STYLES:INLINED -->\n' + hrefs.map(r => '<style>\n' + read(path.join(ROOT, r)).trim() + '\n</style>').join('\n') + '\n';
});
html = inlineBetween(html, '<!-- MODULES:START -->', '<!-- MODULES:END -->', function (b) {
  const srcs = [...b.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  return '<!-- MODULES:INLINED -->\n' + srcs.map(r => '<script>\n' + read(path.join(ROOT, r)).trim() + '\n</script>').join('\n') + '\n';
});
html = html.replace(/__VERSION__/g, VERSION);
write(path.join(DIST, 'index.html'), html);
const swSrc = path.join(ROOT, 'src', 'sw.js');
if (fs.existsSync(swSrc)) write(path.join(DIST, 'sw.js'), read(swSrc).replace(/__VERSION__/g, VERSION));
const ICONS = path.join(ROOT, 'icons');
if (fs.existsSync(ICONS)) {
  fs.mkdirSync(path.join(DIST, 'icons'), { recursive: true });
  for (const f of fs.readdirSync(ICONS)) {
    const dest = f === 'manifest.webmanifest' ? path.join(DIST, f) : path.join(DIST, 'icons', f);
    fs.copyFileSync(path.join(ICONS, f), dest);
  }
}
console.log('OK Built dist/index.html (' + (fs.statSync(path.join(DIST, 'index.html')).size / 1024).toFixed(1) + ' KB)');
