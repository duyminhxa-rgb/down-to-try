import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserAndProfile } from "@/lib/supabase/server";
import { geminiKey } from "@/lib/keys";

const LIVE_MODEL = process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";

function langLine(lang: string) {
  if (lang === "vi")
    return "Speak Vietnamese naturally (friendly Southern/neutral tone, 'bạn'/'mình'). Keep common English technical words in English.";
  if (lang === "mix")
    return "The learner is bilingual Vietnamese/English. Default to Vietnamese, but switch to whatever language they speak to you in. Say key terms in both languages.";
  return "Speak simple, friendly English. If the learner speaks Vietnamese, reply in Vietnamese.";
}

/**
 * Creates a short-lived Gemini Live token so the browser can connect directly
 * (low latency) without ever seeing the real API key.
 */
export async function GET(req: Request) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!geminiKey()) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

  const stepId = new URL(req.url).searchParams.get("step");
  let context = "No specific lesson selected — help with whatever the learner wants to practice. Ask what they're working on first.";
  let lang = profile.language as string;

  if (stepId) {
    const { data: step } = await supabase.from("steps").select("*, skills(name, goal, language)").eq("id", stepId).single();
    if (step) {
      lang = step.skills?.language ?? lang;
      context = `Skill: ${step.skills?.name}${step.skills?.goal ? ` (goal: ${step.skills.goal})` : ""}
Current step: ${step.title}
How to do it: ${step.explanation}
Practice exercise: ${step.practice}
Done looks like: ${step.done_looks_like}
Common mistakes to watch for: ${(step.common_mistakes ?? []).join("; ")}`;
    }
  }

  const systemInstruction = `You are a live, in-person-style coach for ${profile.display_name}, an ordinary learner (not naturally talented). You can hear them, and you may receive their camera or shared screen as images about once per second.

${context}

How to coach:
- Start by greeting them in one short sentence and asking them to show you their setup or try the exercise.
- Talk like a real coach next to them: short sentences, one correction at a time, then let them try again.
- Only comment on what you can actually see or hear. You get roughly 1 image per second, so you CANNOT judge fast movement. For fast moves, ask them to go slowly, freeze in position, or move the camera closer. If the image is dark, blurry or cropped, say so.
- If you are not sure, say you're not sure instead of guessing.
- Be warm and encouraging but honest — don't praise something that is wrong.
- Watch for unsafe posture/strain and mention it immediately.
- If they're struggling, break the move into a smaller piece.
- Don't monologue. Keep most replies under 3 sentences.

Language: ${langLine(lang)}`;

  const ai = new GoogleGenAI({ apiKey: geminiKey() });
  const now = Date.now();
  try {
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 60 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 2 * 60 * 1000).toISOString(),
        liveConnectConstraints: { model: LIVE_MODEL },
      },
    });
    return NextResponse.json({ token: token.name, model: LIVE_MODEL, systemInstruction, lang });
  } catch (e) {
    console.error("live token error", e);
    return NextResponse.json({ error: "Couldn't start the live coach (check Gemini key/billing)." }, { status: 500 });
  }
}
