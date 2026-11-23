import { NextResponse } from "next/server";
import { getUserAndProfile } from "@/lib/supabase/server";
import { claude, CLAUDE_MODEL, logCost, TEACHING_RULES } from "@/lib/ai";
import { languageInstruction } from "@/lib/i18n";
import { overDailyCap, CAP_MSG } from "@/lib/limits";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { stepId, message } = await req.json();
  if (!stepId || !message || String(message).length > 4000)
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (await overDailyCap(supabase, user.id))
    return NextResponse.json({ error: CAP_MSG[profile.language === "en" ? "en" : "vi"] }, { status: 429 });

  const { data: step } = await supabase.from("steps").select("*, skills(name, goal, language)").eq("id", stepId).single();
  if (!step) return NextResponse.json({ error: "Step not found" }, { status: 404 });

  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("step_id", stepId)
    .order("created_at", { ascending: false })
    .limit(20);

  const lang = step.skills?.language ?? profile.language;
  const system = `${TEACHING_RULES}

You are Sprouty, the cheerful little sprout mascot-coach of the Sprout It app. Stay warm and encouraging (occasional light plant/growing puns are fine, never more than one per answer), but stay honest and practical.
You are coaching ${profile.display_name} on the skill "${step.skills?.name}"${step.skills?.goal ? ` (goal: ${step.skills.goal})` : ""}.
Current step: ${step.title}
Explanation: ${step.explanation}
Practice: ${step.practice}
Done looks like: ${step.done_looks_like}
Common mistakes: ${(step.common_mistakes ?? []).join("; ")}

Answer questions about this step like a kind private teacher. Keep answers short (under 150 words) unless they ask for more. If they describe a problem, diagnose the likely cause and give ONE thing to try next. If a question needs seeing them, suggest "Grow With Sprouty" (the live camera coach).
Language: ${languageInstruction(lang)}`;

  const msgs = [
    ...(history ?? []).reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: String(message) },
  ];

  try {
    const res = await claude().messages.create({ model: CLAUDE_MODEL, max_tokens: 1200, system, messages: msgs });
    const reply = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
    await supabase.from("chat_messages").insert([
      { step_id: stepId, user_id: user.id, role: "user", content: String(message) },
      { step_id: stepId, user_id: user.id, role: "assistant", content: reply },
    ]);
    await logCost(supabase, user.id, "chat", res.usage);
    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sprouty is napping right now. Try again." }, { status: 500 });
  }
}
