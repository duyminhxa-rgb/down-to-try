import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getUserAndProfile } from "@/lib/supabase/server";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Down To Try — learn anything, one small step at a time",
  description: "Learn anything, one small step at a time. Học bất cứ thứ gì, từng bước nhỏ một.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2fbf71",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getUserAndProfile();
  const lang = profile?.language ?? "en";
  const en = lang === "en";
  const initials = (profile?.display_name ?? "?").slice(0, 1).toUpperCase();

  return (
    <html lang={en ? "en" : "vi"}>
      <body className="min-h-dvh antialiased">
        {profile && (
          <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
              <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <Logo size={30} />
                <span>
                  Down <span className="text-brand">To Try</span>
                </span>
              </Link>
              <nav className="hidden items-center gap-1 text-[15px] font-semibold sm:flex">
                <Link href="/" className="rounded-lg px-3 py-2 hover:bg-white">
                  {en ? "Home" : "Trang chủ"}
                </Link>
                <Link href="/skills" className="rounded-lg px-3 py-2 hover:bg-white">
                  {en ? "My skills" : "Kỹ năng"}
                </Link>
                <Link href="/coach" className="rounded-lg px-3 py-2 hover:bg-white">
                  {en ? "Live coach" : "HLV trực tiếp"}
                </Link>
              </nav>
              <Link
                href="/settings"
                className="ml-auto flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-sm font-semibold"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">{initials}</span>
                {profile.display_name}
              </Link>
            </div>
          </header>
        )}
        <main className={profile ? "mx-auto max-w-5xl px-4 pb-28 pt-6" : ""}>{children}</main>
        {profile && (
          <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-white text-xs font-semibold sm:hidden">
            {[
              ["/", "🏠", en ? "Home" : "Trang chủ"],
              ["/skills", "🪜", en ? "Skills" : "Kỹ năng"],
              ["/coach", "🎥", en ? "Coach" : "HLV"],
            ].map(([href, icon, label]) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-2.5">
                <span className="text-xl">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </body>
    </html>
  );
}
