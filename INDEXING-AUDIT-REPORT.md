# KeepFlow — Indexing Audit: five unindexed URLs

Audit date: 2026-11-16  
Site: https://keepflow.in  
Scope: `/about`, `/blog`, `/how-it-works`, `/product`, `/use-cases`

## Important limitation

I could not read the **exact Google Search Console exclusion reason** because I have no GSC account access, and the site's `google-site-verification` meta value is still empty. Every statement below is based on live HTTP checks, rendered DOM checks, sitemap/robots inspection and source review. **Indexing is not claimed as fixed until GSC confirms it.**

## Cross-cutting findings and fixes

| Check | Before | After | Effect |
|---|---|---|---|
| Homepage crawlable internal links | **0 anchors** rendered on the React/SPA homepage. Footer items were buttons/text, not links. | Added a small, real HTML site-index `<nav>` after the React root with links to `/product`, `/how-it-works`, `/use-cases`, `/about`. | Gives Google a crawlable discovery path from the homepage. |
| Content depth | Four pages had only ~776–1,527 visible characters; most of that was nav/footer/CTA boilerplate. | Expanded to ~2,192–2,934 visible characters of unique, factual content per indexable page, aligned with the actual KeepFlow homepage messaging (local-first desk agent, browser control, Human Money Gate, House Rules, activity thread). | Addresses the most likely "Crawled - currently not indexed" root cause: thin / low-value pages. |
| `/blog` | "Coming soon", no posts, still in sitemap with `index,follow`. | Kept as a 200 page but changed to **`noindex,follow`** and removed from sitemap. No fake articles created. | Honest handling: a placeholder should not compete for indexing. |
| Sitemap | Included all 6 URLs including `/blog`. | 5 URLs: `/`, `/product`, `/how-it-works`, `/use-cases`, `/about`. | Only intended indexable canonical URLs remain. |
| Trailing slashes | `/about/`, `/product/`, etc. returned 404. | Unchanged (404). | No duplicate trailing-slash indexable versions exist. |
| `.html` variants | `/product.html`, etc. return 200 but carry canonical to clean URLs. | Unchanged. | Duplicate versions are consolidated by self-referencing clean canonicals; no split canonical signals. |
| Technical headers | All five returned 200, no `X-Robots-Tag`, `index,follow`, self-referencing canonicals, in sitemap, robots `Allow: /`. | Preserved. | No technical crawl block was found. |

## Per-URL report

### https://keepflow.in/about
- **Exact GSC exclusion reason:** unavailable (no account access).
- **Technical root cause:** no technical block; page was very thin (~1,258 chars, mostly generic statements) and not linked from the homepage.
- **Files changed:** `about.html`, `index.html`, `sitemap.xml`.
- **Fix applied:** rewrote main content into a unique About page: what KeepFlow is, single-owner/household focus, trust/privacy controls, product status, and links to product/how-it-works/use-cases. Added homepage crawlable link.
- **Before/after evidence:** rendered visible text **1,258 → 2,312** chars; one H1; `index,follow`; canonical `https://keepflow.in/about`.
- **Manual indexing request:** yes — URL Inspection → Request indexing after deploy.
- **Remaining Google action:** verify GSC property and confirm indexing state.

### https://keepflow.in/blog
- **Exact GSC exclusion reason:** unavailable.
- **Technical root cause:** the page explicitly said "Coming soon" and offered no published posts. Thin placeholder content is not a good indexing candidate.
- **Files changed:** `blog.html`, `sitemap.xml`, `scripts/verify-google.js`.
- **Fix applied:** kept page at 200 with an honest explanation, set **`<meta name="robots" content="noindex,follow">`**, removed from sitemap, verification script updated to expect 5 sitemap URLs. No fake articles created.
- **Before/after evidence:** `index,follow` → `noindex,follow`; sitemap URLs 6 → 5.
- **Manual indexing request:** no — intentionally excluded until real posts exist.
- **Remaining Google action:** when real posts are published, remove `noindex`, re-add to sitemap, then request indexing.

### https://keepflow.in/how-it-works
- **Exact GSC exclusion reason:** unavailable.
- **Technical root cause:** no technical block; content was a thin 4-step summary (~1,040 chars) with little detail and no homepage link.
- **Files changed:** `how-it-works.html`, `index.html`, `sitemap.xml`.
- **Fix applied:** expanded the four steps with concrete detail about goals, House Rules, approved surfaces, activity thread and Human Money Gate; added "When something needs a human" and "What you need to start".
- **Before/after evidence:** rendered visible text **1,040 → 2,192** chars; `index,follow`; canonical `https://keepflow.in/how-it-works`.
- **Manual indexing request:** yes.
- **Remaining Google action:** GSC indexing confirmation.

### https://keepflow.in/product
- **Exact GSC exclusion reason:** unavailable.
- **Technical root cause:** no technical block; page was thin (~1,248 chars) and generic, with only three short capability blocks and no homepage link.
- **Files changed:** `product.html`, `index.html`, `sitemap.xml`.
- **Fix applied:** rewrote into six concrete capability sections aligned with the actual site messaging: home desk chores, real browser control + Money Gate, local files/receipts, mail/messaging, learned routines/House Rules, transparent handoffs. Added a "What you stay in control of" section with honest early-access caveats.
- **Before/after evidence:** rendered visible text **1,248 → 2,934** chars; `index,follow`; canonical `https://keepflow.in/product`.
- **Manual indexing request:** yes.
- **Remaining Google action:** GSC indexing confirmation.

### https://keepflow.in/use-cases
- **Exact GSC exclusion reason:** unavailable.
- **Technical root cause:** no technical block; content had useful structure but only four short scenarios (~1,546 chars) and no homepage link.
- **Files changed:** `use-cases.html`, `index.html`, `sitemap.xml`.
- **Fix applied:** expanded to six distinct, clearly labelled illustrative scenarios: groceries with budget cap, bills/receipts, inbox drafts, local files, Telegram check-ins, price/routine watching. Added an explicit honesty note that these explain product direction rather than confirmed production outcomes.
- **Before/after evidence:** rendered visible text **1,546 → 2,426** chars; `index,follow`; canonical `https://keepflow.in/use-cases`.
- **Manual indexing request:** yes.
- **Remaining Google action:** GSC indexing confirmation.

## Verification performed
- Live HTTP checks: all five URLs return 200; no redirect chain; no `X-Robots-Tag`; trailing-slash variants return 404.
- Rendered DOM via Playwright mobile emulation: H1 present on each page, content lengths as above, internal links present, JS does not gate content (content is static HTML).
- `robots.txt`: `Allow: /` and sitemap declared; no page-level block.
- `sitemap.xml`: 5 canonical indexable URLs, valid XML.
- `node scripts/verify-google.js http://localhost:4173` → exit 0 after changes.
- No Lighthouse/PageSpeed or Rich Results Test run in this pass; those remain manual/owner actions.

## Required manual actions
1. Deploy the commit containing these changes.
2. In Google Search Console: verify property if not already, open each URL with URL Inspection, confirm "Crawl allowed / Indexing allowed", then **Request indexing** for product, how-it-works, use-cases and about. Do not request indexing for `/blog` while it is `noindex`.
3. After a few days, re-check the Pages report. If a page is still excluded, paste the exact exclusion string here and I will address that specific reason.
