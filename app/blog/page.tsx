import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog",
  description: "Tech Note blog posts",
};

function getCategoryLabel(category: string) {
  return category === "default" ? "未分类" : category;
}

type BlogListPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
};

function getTagList(tags: string[] | undefined): string[] {
  return Array.isArray(tags) ? tags : [];
}

function normalizeKeyword(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function buildBlogHref(params: { q?: string; category?: string; tag?: string }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  const query = search.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const posts = await getAllPosts();
  const { q, category, tag } = await searchParams;
  const keyword = normalizeKeyword(q);

  const categoryStats = posts.reduce<Map<string, number>>((acc, post) => {
    const key = post.frontmatter.category;
    acc.set(key, (acc.get(key) ?? 0) + 1);
    return acc;
  }, new Map());
  const categories = Array.from(categoryStats.entries()).sort((a, b) => b[1] - a[1]);

  const tagStats = posts.reduce<Map<string, number>>((acc, post) => {
    for (const item of getTagList(post.frontmatter.tags)) {
      acc.set(item, (acc.get(item) ?? 0) + 1);
    }
    return acc;
  }, new Map());
  const tags = Array.from(tagStats.entries()).sort((a, b) => b[1] - a[1]);

  const filteredPosts = posts.filter((post) => {
    const normalizedTitle = post.frontmatter.title.toLowerCase();
    const normalizedSummary = post.frontmatter.summary.toLowerCase();
    const normalizedTags = getTagList(post.frontmatter.tags).map((item) => item.toLowerCase());

    const matchesKeyword =
      !keyword ||
      normalizedTitle.includes(keyword) ||
      normalizedSummary.includes(keyword) ||
      normalizedTags.some((item) => item.includes(keyword));

    const matchesCategory = !category || post.frontmatter.category === category;
    const matchesTag = !tag || getTagList(post.frontmatter.tags).includes(tag);

    return matchesKeyword && matchesCategory && matchesTag;
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Markdown-driven technical posts from this repository.
      </p>

      <form className="mt-6" action="/blog" method="get">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="搜索标题、摘要、标签..."
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {category ? <input type="hidden" name="category" value={category} /> : null}
          {tag ? <input type="hidden" name="tag" value={tag} /> : null}
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            搜索
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">分类</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={buildBlogHref({ q: q ?? undefined, tag: tag ?? undefined })}
                  className={!category ? "font-semibold underline" : "hover:underline"}
                >
                  全部 ({posts.length})
                </Link>
              </li>
              {categories.map(([name, count]) => (
                <li key={name}>
                  <Link
                    href={buildBlogHref({ q: q ?? undefined, category: name, tag: tag ?? undefined })}
                    className={category === name ? "font-semibold underline" : "hover:underline"}
                  >
                    {getCategoryLabel(name)} ({count})
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">标签</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={buildBlogHref({ q: q ?? undefined, category: category ?? undefined })}
                className={
                  !tag
                    ? "rounded-full bg-zinc-900 px-3 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-500 dark:border-zinc-700"
                }
              >
                全部
              </Link>
              {tags.slice(0, 20).map(([name]) => (
                <Link
                  key={name}
                  href={buildBlogHref({
                    q: q ?? undefined,
                    category: category ?? undefined,
                    tag: name,
                  })}
                  className={
                    tag === name
                      ? "rounded-full bg-zinc-900 px-3 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-500 dark:border-zinc-700"
                  }
                >
                  #{name}
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <section>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            共找到 {filteredPosts.length} 篇文章
          </p>
          <ul className="space-y-6">
            {filteredPosts.map((post) => (
              <li
                key={post.slug}
                className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
              >
                <Link href={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">
                  {post.frontmatter.title}
                </Link>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(post.frontmatter.date).toLocaleDateString("zh-CN")} ·{" "}
                  {getCategoryLabel(post.frontmatter.category)}
                </p>
                <p className="mt-3 text-zinc-700 dark:text-zinc-300">{post.frontmatter.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getTagList(post.frontmatter.tags).map((item) => (
                    <Link
                      key={item}
                      href={buildBlogHref({
                        q: q ?? undefined,
                        category: category ?? undefined,
                        tag: item,
                      })}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-500 dark:border-zinc-700"
                    >
                      #{item}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
