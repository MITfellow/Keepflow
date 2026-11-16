# KeepFlow — Google Tracking & Search Infrastructure Report

Audit date: 2026-11-16  
Site: https://keepflow.in  
GTM container used: `GTM-M4NPF2L4` (from owner-provided image; supersedes earlier `GTM-W465H4F7`)

## Status table

| Component | Status | Evidence |
|---|---|---|
| GTM installation | **PASS** | `node scripts/verify-google.js https://keepflow.in` passes for all 6 routes: exactly one `gtm.js?id=GTM-M4NPF2L4` script, exactly one noscript iframe, `gtm.dom`/`gtm.load` pushed to `dataLayer`, no tracking-related console errors. |
| GA4 configuration | **BLOCKED** | No `G-XXXXXXXXXX` measurement ID exists in repo (`site-config.js` `ga4MeasurementId: ''`). GA4 must be configured in the GTM container by the owner; no ID was invented. |
| Realtime events | **BLOCKED** | Cannot verify GA4 Realtime without GA4 property access/measurement ID. No test conversions were sent to production. |
| Search Console | **BLOCKED** | `google-site-verification` meta is present on all pages but `content=""` is empty. Domain ownership, sitemap processing and indexing status require owner access to GSC/DNS. |
| Sitemap | **PASS** | `https://keepflow.in/sitemap.xml` → 200, valid XML, 6 canonical URLs, declared in robots.txt. |
| Robots.txt | **PASS** | `https://keepflow.in/robots.txt` → 200, `Allow: /`, sitemap declared. |
| SEO metadata | **PASS** | All 6 pages have unique title, description, canonical, OG, Twitter, robots meta, favicon links. |
| Structured data | **PASS (code) / external validation not run** | Organization and WebPage JSON-LD present on all pages; content matches visible site info (no fake reviews/ratings). |
| Privacy and consent | **BLOCKED** | No consent UI or Consent Mode v2 configuration exists. Requires owner decision/policy before implementation; analytics must not be silently blocked or forced. |
| Performance | **BLOCKED** | No new Lighthouse/CWV measurement performed in this pass. Earlier NO_FCP cause (broken homepage) was fixed; favicon/SEO tags now at byte ~605 of head. |
| Deployment | **PASS** | Latest commit `93537d5` is deployed; production verification passes after deploy. |

## Root causes and fixes applied

| Issue | Root cause | Fix | Commit |
|---|---|---|---|
| GTM noscript missing | Only the async script was installed; no `<noscript>` fallback existed. | Added official noscript iframe immediately after `<body>` on every page. | `93537d5` |
| GTM ID mismatch | `site-config.js` still referenced old container. | Updated to `GTM-M4NPF2L4`. | `4a0c481` |
| Subpages blank | Earlier broad script edit removed visible page bodies. | Restored full content for product/how-it-works/use-cases/about/blog and standardized metadata. | `c65d243` |
| Favicon/SEO tags buried | Tags were at byte ~895k of `<head>`, after large inline CSS. | Moved favicon/canonical/GSC/robots/OG/JSON-LD to start of `<head>`; absolute favicon URLs. | `9055e7f` |
| No repeatable check | Manual verification only. | Added `scripts/verify-google.js`; checks GTM count, noscript, dataLayer lifecycle events, canonicals, metadata, content, tracking console errors, sitemap and robots. | `93537d5` |

## Verification commands and results

- `npm run build` → `Static site: no build step required`.
- `node scripts/verify-google.js http://localhost:4173` → exit 0, all 6 routes + infra PASS.
- `node scripts/verify-google.js https://keepflow.in` → exit 0 after deploy, all 6 routes + infra PASS.
- Live homepage: `gtmPos=123`, `iconIdx=605`, `noscript=True`; one GTM script and one noscript.

## Information/actions required from owner

1. **GA4 Measurement ID** (`G-XXXXXXXXXX`) or GTM editor access to configure the GA4 tag in `GTM-M4NPF2L4`.
2. **Google Search Console verification token** (HTML meta value) or DNS TXT record authorization. Do not paste secrets into chat unless intended for source; DNS changes require owner approval.
3. **Consent policy decision**: whether to add a consent banner + Consent Mode v2 defaults. Without this, analytics runs by default; with denied defaults, GA4 will not receive data until consent is granted.
4. In GTM/GA4: enable page views, scroll, outbound clicks, file downloads, and form/CTA events as required; use GTM Preview and GA4 DebugView to verify without contaminating production conversions.
5. Re-run Lighthouse/PageSpeed and Search Console URL Inspection after the above are in place.

## Notes

- No GA4 measurement ID, GSC token or credentials were invented.
- No test events were sent to GA4; verification only inspects container loading and lifecycle dataLayer events.
- No DNS, Google account, or GTM container settings were modified.
