import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocaleFromCookie, uiText } from "@/lib/i18n";
import LanguageSwitcher from "@/components/language-switcher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Note",
  description: "A markdown-first technical blog",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromCookie();
  const text = uiText[locale];

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="mx-auto flex w-full max-w-3xl justify-end px-6 pt-6">
          <LanguageSwitcher
            locale={locale}
            label={text.languageLabel}
            chineseLabel={text.chinese}
            englishLabel={text.english}
          />
        </header>
        {children}
      </body>
    </html>
  );
}
