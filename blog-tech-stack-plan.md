# Blog Technical Stack and Monetization Plan

## Recommended Stack (Current Scenario)

- Framework: `Next.js` (App Router)
- Content: `Contentlayer` (or `next-mdx-remote`)
- Deployment: `Vercel`
- Analytics: `Plausible` or `GA4`
- Ads: start with `Google AdSense`, then add direct sponsorship and affiliate slots
- SEO: `next-sitemap` + structured data (`Article` schema)

## Why This Stack

- Content-first workflow: write posts in Markdown/MDX and manage via Git.
- Strong commercial extensibility: easy to add ad slots, tracking, experiments, and growth features later.
- Good SEO and performance control with Next.js rendering and script loading strategy.

## Suggested Project Structure (Blog + Expandable Ads)

```txt
tech-note/
  content/
    posts/
      2026-04-20-first-post.mdx
    authors/
      default.json
  src/
    app/
      (site)/
        page.tsx
        blog/
          page.tsx
          [slug]/
            page.tsx
    components/
      content/
        PostCard.tsx
        PostBody.tsx
      ads/
        AdSlot.tsx
        InArticleAd.tsx
        SidebarAd.tsx
    lib/
      seo/
        articleSchema.ts
      analytics/
        plausible.ts
        ga4.ts
      ads/
        ad-config.ts
  public/
    images/
    ads.txt
  next-sitemap.config.js
```

## Content Rules

- Keep all posts under `content/posts/*.mdx`.
- Use frontmatter fields consistently:
  - `title`
  - `date`
  - `updated`
  - `summary`
  - `tags`
  - `cover`
  - `draft`
- Keep ad logic outside post files; posts should stay content-only.

## Ad Integration Plan (Phased)

### Phase 1: Basic AdSense

- Create reusable `AdSlot` component for all ad placements.
- Reserve fixed slot height to avoid layout shift (CLS).
- Load ad scripts with controlled timing (after interactive or lazy).

### Phase 2: Hybrid Monetization

- Add direct sponsorship slots (manual campaign configs).
- Add affiliate modules (for relevant post categories only).
- Separate ad configuration from rendering with an `ad-config.ts`.

### Phase 3: Optimization

- Track impression/click/conversion events.
- Run placement experiments by page type (home/list/detail).
- Control ad density to balance UX, SEO, and revenue.

## SEO and Performance Checklist

- Generate sitemap and robots with `next-sitemap`.
- Add structured data for article pages (`Article` schema).
- Add canonical URLs and Open Graph/Twitter metadata.
- Keep above-the-fold ad count low.
- Lazy-load below-the-fold ads.
- Optimize images and avoid oversized ad scripts on initial render.

## Publishing Workflow

- Draft in MDX with `draft: true`.
- Open PR for content review (title, summary, tags, links, cover image).
- Merge to `main` for automatic deploy on Vercel.
- Verify production pages: metadata, structured data, ad rendering, and analytics events.

## Next Practical Steps

1. Initialize `Next.js` app in this repo.
2. Add `Contentlayer` and define post schema.
3. Build blog list and post detail routes.
4. Add base `AdSlot` component and one safe ad position.
5. Configure sitemap + structured data.
6. Connect analytics and verify events.

