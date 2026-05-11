import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogMarkdown } from "@/components/blog-markdown";
import { getLocaleFromCookie, uiText } from "@/lib/i18n";
import { extractStructuredToc } from "@/lib/markdown-toc";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const locale = await getLocaleFromCookie();
  const text = uiText[locale];
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: text.postNotFound,
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const locale = await getLocaleFromCookie();
  const text = uiText[locale];
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.frontmatter.draft) {
    notFound();
  }
  const tocSections = extractStructuredToc(post.content);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_260px]">
        <section className="min-w-0">
          <Link href="/blog" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            {text.backToBlog}
          </Link>

          <h1 className="mt-5 text-3xl font-bold tracking-tight">{post.frontmatter.title}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {new Date(post.frontmatter.date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
          </p>

          <article className="markdown-body mt-8">
            <BlogMarkdown content={post.content} />
          </article>
        </section>

        {tocSections.length > 0 ? (
          <aside className="hidden xl:block">
            <div className="sticky top-20 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">目录</h2>
              <div className="mt-3 space-y-2 text-sm">
                {tocSections.map((section) => (
                  <details key={section.id} className="group">
                    <summary className="cursor-pointer select-none font-medium marker:text-zinc-400">
                      <a href={`#${section.id}`} className="hover:underline">
                        {section.text}
                      </a>
                    </summary>
                    {section.items.length > 0 ? (
                      <ul className="mt-2 space-y-1 pl-4">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <a
                              href={`#${item.id}`}
                              className={`block hover:underline ${
                                item.kind === "question"
                                  ? "text-zinc-600 dark:text-zinc-400"
                                  : "text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </details>
                ))}
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
