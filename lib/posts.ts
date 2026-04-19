import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  draft?: boolean;
};

export type PostItem = {
  slug: string;
  frontmatter: PostFrontmatter;
};

export type PostDetail = PostItem & {
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function sortByDateDesc(a: PostItem, b: PostItem) {
  return (
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export async function getAllPosts(): Promise<PostItem[]> {
  const files = await fs.readdir(POSTS_DIR);
  const postFiles = files.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

  const posts = await Promise.all(
    postFiles.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(POSTS_DIR, fileName);
      const fileContent = await fs.readFile(fullPath, "utf8");
      const { data } = matter(fileContent);

      return {
        slug,
        frontmatter: {
          title: String(data.title ?? slug),
          date: String(data.date ?? new Date().toISOString()),
          summary: String(data.summary ?? ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          draft: Boolean(data.draft),
        },
      } satisfies PostItem;
    }),
  );

  return posts.filter((post) => !post.frontmatter.draft).sort(sortByDateDesc);
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const possibleFiles = [`${slug}.md`, `${slug}.mdx`];

  for (const fileName of possibleFiles) {
    const fullPath = path.join(POSTS_DIR, fileName);
    try {
      const fileContent = await fs.readFile(fullPath, "utf8");
      const { data, content } = matter(fileContent);

      return {
        slug,
        content,
        frontmatter: {
          title: String(data.title ?? slug),
          date: String(data.date ?? new Date().toISOString()),
          summary: String(data.summary ?? ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          draft: Boolean(data.draft),
        },
      };
    } catch {
      continue;
    }
  }

  return null;
}
