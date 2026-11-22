import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getUserAndProfile } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Down To Try",
  description: "Learn anything, one small step at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff5a36",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getUserAndProfile();
  const lang = profile?.language ?? "en";
  return (
    <html lang={lang === "en" ? "en" : "vi"}>
      <body className="min-h-dvh antialiased">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-brand">Down</span> To Try
          </Link>
          {profile && (
            <Link href="/settings" className="rounded-full bg-white px-4 py-2 text-base ring-1 ring-black/10">
              {profile.display_name} · {t(lang, "settings")}
            </Link>
          )}
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-24">{children}</main>
      </body>
    </html>
  );
}
