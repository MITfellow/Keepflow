# KeepFlow Blog Infrastructure

This folder is prepared for future KeepFlow blog publishing (AI agent research and tutorials).

## Status
No low-quality or fabricated articles are published automatically. Publish only reviewed, original, useful content.

## Planned topics
1. What Is a Personal AI Agent?
2. AI Assistant vs AI Agent: What's the Difference?
3. Can AI Agents Complete Real-World Tasks?
4. How Personal AI Agents Use Browser Automation.
5. Why AI Agents Need Context and Memory.
6. How to Build a Personal AI Agent.
7. AI Agent Security and User Permissions.
8. The Future of Personal AI Agents.

## Publishing checklist (per post)
- Unique title and meta description
- One clear H1; logical H2/H3 structure
- Canonical URL (`https://keepflow.in/blog/<slug>`)
- Accurate claims only; cite sources for research
- Internal links to `/product`, `/how-it-works`, `/use-cases` where relevant
- OG/Twitter metadata and appropriate structured data (Article/BlogPosting only when accurate)
- Add URL to `sitemap.xml` and link from `blog.html`
- Accessibility: alt text, semantic HTML, readable contrast

## Static template
Create posts as `blog/<slug>.html` (or configure a static generator later). Reuse the site nav/footer and `/styles.css`. Keep the same SEO/metadata pattern used on public pages.