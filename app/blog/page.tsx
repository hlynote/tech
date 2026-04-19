import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog",
  description: "Tech Note blog posts",
};

export default async function BlogListPage() {
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Markdown-driven technical posts from this repository.
      </p>

      <ul className="mt-8 space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <Link
              href={`/blog/${post.slug}`}
              className="text-xl font-semibold hover:underline"
            >
              {post.frontmatter.title}
            </Link>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {new Date(post.frontmatter.date).toLocaleDateString("zh-CN")}
            </p>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              {post.frontmatter.summary}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
