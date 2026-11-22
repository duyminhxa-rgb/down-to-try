import { NextResponse } from "next/server";
import { getUserAndProfile } from "@/lib/supabase/server";
import { geminiKey, youtubeKey } from "@/lib/keys";

/** Signed-in only. Shows key prefixes (never full keys) and whether YouTube accepts its key. */
export async function GET() {
  const { user } = await getUserAndProfile();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const prefix = (v?: string) => (v ? `${v.slice(0, 4)}… (${v.length} chars)` : "MISSING");
  let youtube = "not tested";
  if (youtubeKey()) {
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=piano&type=video&maxResults=1&key=${youtubeKey()}`,
      { cache: "no-store" }
    );
    youtube = r.ok ? "OK" : `${r.status} ${(await r.json().catch(() => ({})))?.error?.message ?? ""}`;
  }
  return NextResponse.json({
    ANTHROPIC_API_KEY: prefix(process.env.ANTHROPIC_API_KEY),
    gemini_in_use: prefix(geminiKey()),
    youtube_in_use: prefix(youtubeKey()),
    youtube_test: youtube,
  });
}
