import { NextResponse } from "next/server";
import { getUserAndProfile } from "@/lib/supabase/server";

/** Saves a finished live-coach transcript. */
export async function POST(req: Request) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { stepId, source, transcript, startedAt } = await req.json();
  if (!Array.isArray(transcript) || transcript.length === 0) return NextResponse.json({ ok: true });
  await supabase.from("coach_sessions").insert({
    user_id: user.id,
    step_id: stepId || null,
    source: String(source || ""),
    transcript: transcript.slice(0, 500),
    started_at: startedAt || new Date().toISOString(),
    ended_at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
