# Tech Note

Markdown-first technical blog built with Next.js (App Router).

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS 4
- Markdown rendering: `gray-matter` + `react-markdown` + `remark-gfm`

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Writing Posts

Create new markdown files in:

- `content/posts/*.md`
- `content/posts/*.mdx`

Required frontmatter fields:

```yaml
---
title: "Post title"
date: "2026-04-20"
summary: "Short summary"
tags:
  - nextjs
  - markdown
draft: false
---
```

## Routes

- `/` home page with latest posts
- `/blog` post list
- `/blog/[slug]` post detail page rendered from markdown

## Notes

- `draft: true` posts are excluded from list and static route generation.
- A sample post is included at `content/posts/welcome-to-tech-note.md`.
