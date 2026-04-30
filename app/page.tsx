import Link from "next/link";
import { getLocaleFromCookie, uiText } from "@/lib/i18n";
import { getAllPosts } from "@/lib/posts";

export default async function Home() {
  const locale = await getLocaleFromCookie();
  const text = uiText[locale];
  const posts = await getAllPosts();
  const latestPosts = posts.slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">迷途小书童</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        {text.siteDescription}
      </p>

      <div className="mt-6">
        <Link href="/blog" className="text-sm font-medium hover:underline">
          {text.viewAllPosts}
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{text.latestPosts}</h2>
        <ul className="mt-4 space-y-4">
          {latestPosts.map((post) => (
            <li key={post.slug} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <Link href={`/blog/${post.slug}`} className="font-medium hover:underline">
                {post.frontmatter.title}
              </Link>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(post.frontmatter.date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
