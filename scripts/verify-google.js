// Repeatable verification for Google tracking and search infrastructure.
// Usage: node scripts/verify-google.js [baseUrl]
// Default: http://localhost:4173
// This script does NOT send test events to GA4 and does NOT use production conversions.

const { chromium } = require('playwright');

const BASE = (process.argv[2] || process.env.BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const GTM = 'GTM-M4NPF2L4';
const ROUTES = [
  ['/', 'https://keepflow.in/'],
  ['/product', 'https://keepflow.in/product'],
  ['/how-it-works', 'https://keepflow.in/how-it-works'],
  ['/use-cases', 'https://keepflow.in/use-cases'],
  ['/about', 'https://keepflow.in/about'],
  ['/blog', 'https://keepflow.in/blog'],
];

function fail(msg) {
  console.error('FAIL:', msg);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  let hardFail = false;

  for (const [route, expectedCanonical] of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });

    let row = { route, ok: true, errors: [] };
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(400);
      const html = await page.content();
      const dom = await page.evaluate(() => ({
        gtmScripts: [...document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')].map((s) => s.src),
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        gsc: !!document.querySelector('meta[name="google-site-verification"]'),
        title: document.title || '',
        description: document.querySelector('meta[name="description"]')?.content || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        dataLayerEvents: (window.dataLayer || []).map((x) => (x && x['gtm.start'] ? 'gtm.js' : x && x.event ? x.event : null)).filter(Boolean),
        bodyTextLength: (document.body.innerText || '').trim().length,
        internalLinks: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && (h.startsWith('/') || h.startsWith(BASE))),
      }));

      const noscriptCount = (html.match(/googletagmanager\.com\/ns\.html\?id=GTM-M4NPF2L4/g) || []).length;
      const gtmExpected = dom.gtmScripts.filter((s) => s.includes(GTM));

      if (gtmExpected.length !== 1 || dom.gtmScripts.length !== 1) {
        row.errors.push(`GTM scripts: expected exactly 1 ${GTM}, found ${dom.gtmScripts.length} total / ${gtmExpected.length} expected`);
      }
      if (noscriptCount !== 1) row.errors.push(`GTM noscript: expected 1, found ${noscriptCount}`);
      if (!dom.dataLayerEvents.some((e) => ['gtm.js', 'gtm.dom', 'gtm.load'].includes(e))) row.errors.push('GTM did not push any gtm lifecycle event to dataLayer');
      if (dom.canonical !== expectedCanonical) row.errors.push(`canonical ${dom.canonical} != ${expectedCanonical}`);
      if (!dom.gsc) row.errors.push('missing google-site-verification meta');
      if (!dom.title) row.errors.push('missing title');
      if (!dom.description) row.errors.push('missing description');
      if (!dom.ogTitle) row.errors.push('missing og:title');
      if (!dom.robots) row.errors.push('missing robots meta');
      if (dom.bodyTextLength < 200) row.errors.push(`page has too little visible text (${dom.bodyTextLength})`);
      const trackingErrors = consoleErrors.filter((e) => /gtm|googletagmanager|google-analytics|tagmanager/i.test(e));
      if (trackingErrors.length) row.errors.push(`tracking console errors: ${trackingErrors.join(' | ')}`);

      row.details = {
        gtmScripts: dom.gtmScripts,
        noscriptCount,
        dataLayerEvents: dom.dataLayerEvents.slice(0, 5),
        canonical: dom.canonical,
        bodyTextLength: dom.bodyTextLength,
        internalLinks: dom.internalLinks.length,
      };
    } catch (e) {
      row.errors.push('navigation/evaluation error: ' + e.message);
    }
    await page.close();
    row.ok = row.errors.length === 0;
    if (!row.ok) {
      hardFail = true;
      fail(`${route}: ${row.errors.join('; ')}`);
    }
    results.push(row);
  }

  // Sitemap / robots checks
  const infra = { route: '/robots.txt + /sitemap.xml', ok: true, errors: [] };
  try {
    const ctx = await browser.newContext();
    const robots = await ctx.request.get(BASE + '/robots.txt');
    const sitemap = await ctx.request.get(BASE + '/sitemap.xml');
    const robotsText = await robots.text();
    const sitemapText = await sitemap.text();
    infra.details = {
      robotsStatus: robots.status(),
      sitemapStatus: sitemap.status(),
      robotsHasSitemap: robotsText.includes('Sitemap: https://keepflow.in/sitemap.xml'),
      sitemapUrlCount: (sitemapText.match(/<loc>/g) || []).length,
      sitemapHasXmlns: sitemapText.includes('http://www.sitemaps.org/schemas/sitemap/0.9'),
    };
    if (robots.status() !== 200) infra.errors.push('robots.txt status != 200');
    if (sitemap.status() !== 200) infra.errors.push('sitemap.xml status != 200');
    if (!infra.details.robotsHasSitemap) infra.errors.push('robots.txt missing sitemap declaration');
    if (!infra.details.sitemapHasXmlns) infra.errors.push('sitemap.xml missing sitemap namespace');
    if (infra.details.sitemapUrlCount !== ROUTES.length) infra.errors.push(`sitemap has ${infra.details.sitemapUrlCount} URLs, expected ${ROUTES.length}`);
    await ctx.close();
  } catch (e) {
    infra.errors.push('infra check error: ' + e.message);
  }
  infra.ok = infra.errors.length === 0;
  if (!infra.ok) { hardFail = true; fail(infra.route + ': ' + infra.errors.join('; ')); }
  results.push(infra);

  await browser.close();
  console.log(JSON.stringify({ base: BASE, gtm: GTM, results }, null, 2));
  process.exit(hardFail ? 1 : 0);
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
