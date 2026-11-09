const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function safePath(urlPath) {
  const raw = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rewrites = {
    '/product': '/product.html',
    '/how-it-works': '/how-it-works.html',
    '/use-cases': '/use-cases.html',
    '/blog': '/blog.html',
    '/about': '/about.html',
    '/privacy': '/privacy.html',
    '/terms': '/terms.html',
    '/cookies': '/cookies.html',
    '/security': '/security.html',
  };
  const decoded = rewrites[raw] || raw;
  const rel = decoded === '/' ? '/index.html' : decoded;
  const full = path.normalize(path.join(root, rel));
  if (!full.startsWith(root)) return null;
  return full;
}

http.createServer((req, res) => {
  const file = safePath(req.url);
  if (!file) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(file, (err, stat) => {
    const target = !err && stat.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        fs.readFile(path.join(root, 'index.html'), (fbErr, fb) => {
          if (fbErr) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fb);
        });
        return;
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}).listen(port, '0.0.0.0', () => console.log(`Static server listening on ${port}`));
