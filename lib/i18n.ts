import { cookies } from "next/headers";

export const LOCALES = ["zh", "en"] as const;

export type Locale = (typeof LOCALES)[number];

const DEFAULT_LOCALE: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;

  if (locale && isLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}

export const uiText = {
  zh: {
    siteDescription: "一个面向技术写作的 Markdown 优先博客工作区。",
    viewAllPosts: "查看全部文章 →",
    latestPosts: "最新文章",
    blogTitle: "博客",
    blogDescription: "这个仓库中的 Markdown 技术文章。",
    backToBlog: "← 返回博客列表",
    postNotFound: "文章未找到",
    languageLabel: "语言",
    chinese: "中文",
    english: "English",
  },
  en: {
    siteDescription: "A markdown-first blog workspace for technical writing.",
    viewAllPosts: "View all posts →",
    latestPosts: "Latest Posts",
    blogTitle: "Blog",
    blogDescription: "Markdown-driven technical posts from this repository.",
    backToBlog: "← Back to blog",
    postNotFound: "Post Not Found",
    languageLabel: "Language",
    chinese: "中文",
    english: "English",
  },
} as const;
