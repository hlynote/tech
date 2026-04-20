import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { locale } = await context.params;
  const url = new URL(request.url);
  const redirectPath = url.searchParams.get("redirect");
  const redirectTo =
    redirectPath && redirectPath.startsWith("/") ? redirectPath : "/";

  const response = NextResponse.redirect(new URL(redirectTo, url.origin));

  response.cookies.set({
    name: "locale",
    value: isLocale(locale) ? locale : "zh",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
