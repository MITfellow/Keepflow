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

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net; connect-src 'self' https://tppsxyfsovlawijtnbeq.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com; frame-src https://www.googletagmanager.com;"
};

function safePath(urlPath) {
  const raw = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rewrites = {
    '/product': '/product.html',
    '/how-it-works': '/how-it-works.html',
    '/use-cases': '/use-cases.html',
    '/blog': '/blog.html',
    '/about': '/about.html',
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
    res.writeHead(403, securityHeaders); res.end('Forbidden'); return;
  }
  fs.stat(file, (err, stat) => {
    const target = !err && stat.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, securityHeaders));
        res.end('Not found');
        return;
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, Object.assign({ 'Content-Type': types[ext] || 'application/octet-stream' }, securityHeaders));
      res.end(data);
    });
  });
}).listen(port, '0.0.0.0', () => console.log(`Static server listening on ${port}`));
