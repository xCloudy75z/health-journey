// scripts/make-icon.js — rasterize the Health Journey leaf mark to PNG (180/192/512).
// Build-only. Requires devDependency @resvg/resvg-js (NOT shipped in dist — dist is a single
// self-contained HTML + these separate committed PNG/SVG icon files). Run once to regenerate:
//   npm i -D @resvg/resvg-js && node scripts/make-icon.js
// The on-disk icon.svg keeps its rounded corners for browsers that render the SVG favicon.
// The raster PNGs use a FULL-BLEED teal square (no transparent corners) so iOS home-screen and
// Android/PWA maskable masks never expose black/gap corners — the OS applies its own rounding.
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const TEAL = '#2f9e8f';
// Same leaf mark as icons/icon.svg, on a full-bleed 512 canvas (rect has no rx = fills edges).
const SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
  '<rect width="512" height="512" fill="', TEAL, '"/>',
  '<path d="M352 150c0 120-70 190-160 210 10-96 70-160 160-210z" fill="#fff" opacity=".95"/>',
  '<path d="M170 360c40-70 100-120 175-150" stroke="', TEAL,
  '" stroke-width="16" fill="none" stroke-linecap="round"/>',
  '</svg>'
].join('');

const OUT = path.resolve(__dirname, '..', 'icons');
const targets = [
  { size: 180, name: 'apple-touch-icon-180.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' }
];
for (const t of targets) {
  const png = new Resvg(SVG, { fitTo: { mode: 'width', value: t.size } }).render().asPng();
  fs.writeFileSync(path.join(OUT, t.name), png);
  console.log('OK wrote ' + t.name + ' (' + t.size + 'x' + t.size + ', ' + png.length + ' bytes)');
}
