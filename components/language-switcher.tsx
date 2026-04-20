"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  chineseLabel: string;
  englishLabel: string;
};

function buildRedirectPath(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function LanguageSwitcher({
  locale,
  label,
  chineseLabel,
  englishLabel,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirect = buildRedirectPath(pathname, new URLSearchParams(searchParams.toString()));

  return (
    <nav
      className="rounded-md border border-zinc-200 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
      aria-label={label}
    >
      <span className="mr-2">{label}:</span>
      <Link
        href={`/lang/zh?redirect=${encodeURIComponent(redirect)}`}
        className={locale === "zh" ? "font-semibold text-zinc-900 dark:text-zinc-100" : "hover:underline"}
      >
        {chineseLabel}
      </Link>
      <span className="mx-2">|</span>
      <Link
        href={`/lang/en?redirect=${encodeURIComponent(redirect)}`}
        className={locale === "en" ? "font-semibold text-zinc-900 dark:text-zinc-100" : "hover:underline"}
      >
        {englishLabel}
      </Link>
    </nav>
  );
}
