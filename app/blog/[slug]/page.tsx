import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogMarkdown } from "@/components/blog-markdown";
import { getLocaleFromCookie, uiText } from "@/lib/i18n";
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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
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
    </main>
  );
}
