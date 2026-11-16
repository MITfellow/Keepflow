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


## Analytics root-cause update (2026-11-16, second pass)

**Root cause found:** the site currently loads `GTM-M4NPF2L4`, whose published container is empty:
- `https://www.googletagmanager.com/gtm.js?id=GTM-M4NPF2L4` → HTTP 200 but `"tags":[]`, no `G-` measurement ID.
- Playwright network capture on the live homepage recorded only the `gtm.js` request. No `google-analytics.com` / `analytics.google.com` / `region1.google-analytics.com` requests were sent.
- `dataLayer` contained only `gtm.dom` and `gtm.load`; no GA4 page_view/config event.

The previously used container `GTM-W465H4F7` **does** contain a published GA4 configuration:
- Measurement ID found in the published container: `G-11DHLHNSE7`.
- Tags include GA4 config/first/last/scope plus enhanced measurement for page views, scroll, outbound clicks, downloads and forms.

Therefore the switch to `GTM-M4NPF2L4` removed GA4 data collection. This is a GTM container configuration issue, not a site-code, consent, ad-blocker, DNS or internal-filter issue that can be diagnosed from the repo.

**Current status:** GA4 Realtime = FAIL / root cause identified. Fix requires either:
1. Adding a GA4 configuration tag for `G-11DHLHNSE7` inside `GTM-M4NPF2L4` and republishing that container (owner GTM access required), or
2. Reverting the site to `GTM-W465H4F7`, which already has the working GA4 tag (conflicts with the earlier instruction to use the image container, so owner approval is needed before changing).

No GA4 ID was invented; `G-11DHLHNSE7` was read from the public published container script.


## Owner decision (2026-11-16)

The owner chose to **keep `GTM-M4NPF2L4`** as the active container. The site code is therefore unchanged in this respect.

### Required GTM action (owner / GTM editor access)
1. Open GTM container `GTM-M4NPF2L4`.
2. Create tag: **Google Analytics: GA4 Configuration**.
3. Set Measurement ID to **`G-11DHLHNSE7`** (confirm this is the correct GA4 property/web stream for `keepflow.in`).
4. Set trigger to **All Pages** (initialization).
5. Enable desired enhanced measurement events in the GA4 web stream (page views, scrolls, outbound clicks, file downloads, form interactions).
6. **Publish** the container. Publishing is required; saving a draft does not change `gtm.js`.
7. Verify with GTM Preview / Tag Assistant that the GA4 Configuration tag fires, then check GA4 Realtime and DebugView from two independent devices.
8. If Realtime is still empty after publishing, check in GA4: correct property, web stream ID, internal traffic filters, data filters, and any consent settings.

### Re-verification command after publishing
`node scripts/verify-google.js https://keepflow.in` will still PASS for container installation, but GA4 data collection must be confirmed in GA4 Realtime/DebugView; browser network capture should then show `google-analytics.com` / `region1.google-analytics.com` requests.
