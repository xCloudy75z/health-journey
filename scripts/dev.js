// scripts/dev.js — build once and serve dist/ on http://localhost:5178
const http = require('http');
const fs = require('fs');
const path = require('path');
require('./build.js');
const DIST = path.resolve(__dirname, '..', 'dist');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.png':'image/png' };
http.createServer(function (req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]); if (rel === '/') rel = '/index.html';
  const file = path.join(DIST, rel);
  fs.readFile(file, function (err, buf) {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(5178, function () { console.log('dev server → http://localhost:5178'); });
