import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export const DEFAULT_CATEGORY = "default";
export const CHANNEL_DIRECTORIES = ["ios", "ai", "iOS-review"] as const;
export type Category = string;

export type PostFrontmatter = {
  title: string;
  date: string;
  summary: string;
  category: Category;
  tags?: string[];
  slug: string;
  draft?: boolean;
};

export type PostItem = {
  slug: string;
  frontmatter: PostFrontmatter;
};

export type PostDetail = PostItem & {
  content: string;
};

type ParsedPost = PostDetail & {
  sourcePath: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");
const LEGACY_POSTS_DIR = path.join(CONTENT_DIR, "posts");

function sortByDateDesc(a: PostItem, b: PostItem) {
  return (
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

function parseDate(value: unknown, filePath: string): string {
  const date = String(value ?? "");
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid "date" in ${filePath}. Received: ${String(value)}`);
  }
  return date;
}

function parseTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map((tag) => String(tag).trim())
        .filter(Boolean)
    : [];
}

function normalizeCategory(value: unknown, fallback: string = DEFAULT_CATEGORY): string {
  const normalized = String(value ?? "").trim();

  return normalized || fallback;
}

function normalizeFrontmatter(
  data: matter.GrayMatterFile<string>["data"],
  fileSlug: string,
  sourceCategory: string,
  filePath: string,
): PostFrontmatter {
  const categoryValue = normalizeCategory(data.category, sourceCategory);

  const slug = String(data.slug ?? fileSlug).trim();
  if (!slug) {
    throw new Error(`Missing "slug" in ${filePath}.`);
  }

  return {
    title: String(data.title ?? slug),
    date: parseDate(data.date ?? new Date().toISOString(), filePath),
    summary: String(data.summary ?? data.description ?? ""),
    category: categoryValue,
    tags: parseTags(data.tags),
    slug,
    draft: Boolean(data.draft),
  };
}

async function readCategoryDir(category: Category): Promise<ParsedPost[]> {
  const categoryDir = path.join(CONTENT_DIR, category);

  try {
    const files = await fs.readdir(categoryDir);
    const postFiles = files.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

    return Promise.all(
      postFiles.map(async (fileName) => {
        const fileSlug = fileName.replace(/\.mdx?$/, "");
        const fullPath = path.join(categoryDir, fileName);
        const fileContent = await fs.readFile(fullPath, "utf8");
        const { data, content } = matter(fileContent);
        const frontmatter = normalizeFrontmatter(data, fileSlug, category, fullPath);

        return {
          slug: frontmatter.slug,
          frontmatter,
          content,
          sourcePath: fullPath,
        };
      }),
    );
  } catch {
    return [];
  }
}

async function readLegacyPostsDir(): Promise<ParsedPost[]> {
  try {
    const files = await fs.readdir(LEGACY_POSTS_DIR);
    const postFiles = files.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

    return Promise.all(
      postFiles.map(async (fileName) => {
        const fileSlug = fileName.replace(/\.mdx?$/, "");
        const fullPath = path.join(LEGACY_POSTS_DIR, fileName);
        const fileContent = await fs.readFile(fullPath, "utf8");
        const { data, content } = matter(fileContent);
        const sourceCategory = DEFAULT_CATEGORY;
        const frontmatter = normalizeFrontmatter(data, fileSlug, sourceCategory, fullPath);

        return {
          slug: frontmatter.slug,
          frontmatter,
          content,
          sourcePath: fullPath,
        };
      }),
    );
  } catch {
    return [];
  }
}

function detectDuplicateSlugs(posts: ParsedPost[]) {
  const slugToPath = new Map<string, string>();
  for (const post of posts) {
    const existingPath = slugToPath.get(post.slug);
    if (existingPath) {
      throw new Error(
        `Duplicate slug "${post.slug}" found in ${existingPath} and ${post.sourcePath}.`,
      );
    }
    slugToPath.set(post.slug, post.sourcePath);
  }
}

async function readAllParsedPosts(): Promise<ParsedPost[]> {
  const categoryPosts = await Promise.all(
    CHANNEL_DIRECTORIES.map((category) => readCategoryDir(category)),
  );
  const legacyPosts = await readLegacyPostsDir();
  const posts = [...categoryPosts.flat(), ...legacyPosts];
  detectDuplicateSlugs(posts);
  return posts;
}

function toPostItems(posts: ParsedPost[]): PostItem[] {
  return posts.map((post) => ({
    slug: post.slug,
    frontmatter: post.frontmatter,
  }));
}

export async function getAllPosts(): Promise<PostItem[]> {
  const posts = await readAllParsedPosts();
  return toPostItems(posts).filter((post) => !post.frontmatter.draft).sort(sortByDateDesc);
}

export async function getPostsByCategory(category: Category): Promise<PostItem[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.frontmatter.category === category);
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const posts = await readAllParsedPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post || post.frontmatter.draft) {
    return null;
  }

  return {
    slug: post.slug,
    frontmatter: post.frontmatter,
    content: post.content,
  };
}

export async function getPostByCategoryAndSlug(
  category: Category,
  slug: string,
): Promise<PostDetail | null> {
  const posts = await readAllParsedPosts();
  const post = posts.find(
    (item) => item.frontmatter.category === category && item.slug === slug,
  );
  if (!post || post.frontmatter.draft) {
    return null;
  }

  return {
    slug: post.slug,
    frontmatter: post.frontmatter,
    content: post.content,
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const posts = await getAllPosts();
  const categories = new Set<Category>([DEFAULT_CATEGORY]);
  for (const post of posts) {
    categories.add(post.frontmatter.category);
  }
  return Array.from(categories);
}
