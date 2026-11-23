import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserAndProfile } from "@/lib/supabase/server";
import { geminiKey } from "@/lib/keys";
import { stepImagePrompt } from "@/lib/art";
import { overDailyCap } from "@/lib/limits";

export const maxDuration = 120;

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-nano-banana-2.1";

/** Draws (once) a Sprouty illustration for a step and stores it in Supabase Storage. */
export async function POST(req: Request) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!geminiKey()) return NextResponse.json({ error: "Gemini key missing" }, { status: 500 });

  const { stepId } = await req.json();
  const { data: step } = await supabase
    .from("steps")
    .select("id, title, explanation, image_url, skills(name)")
    .eq("id", stepId)
    .single();
  if (!step) return NextResponse.json({ error: "Step not found" }, { status: 404 });
  if (step.image_url) return NextResponse.json({ url: step.image_url });
  if (await overDailyCap(supabase, user.id)) return NextResponse.json({ error: "Daily limit" }, { status: 429 });

  const skillName = (step.skills as unknown as { name: string } | null)?.name ?? "";
  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey() });
    const interaction = await ai.interactions.create({
      model: IMAGE_MODEL,
      input: stepImagePrompt(skillName, step.title, step.explanation ?? ""),
      response_format: { type: "image", aspect_ratio: "16:9", image_size: "1K" },
    });
    const img = interaction.output_image;
    if (!img?.data) throw new Error("No image returned");

    const mime = img.mime_type || "image/png";
    const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
    const path = `${user.id}/steps/${step.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, Buffer.from(img.data, "base64"), { contentType: mime, upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("covers").getPublicUrl(path);
    const url = `${pub.publicUrl}?v=${Date.now()}`;
    await supabase.from("steps").update({ image_url: url }).eq("id", step.id);
    await supabase.from("api_costs").insert({
      user_id: user.id,
      provider: "gemini",
      feature: "step_image",
      cost_usd: Number(process.env.COVER_COST_USD || 0.04),
    });
    return NextResponse.json({ url });
  } catch (e) {
    console.error("step image failed", e);
    return NextResponse.json({ error: "Couldn't draw this step right now." }, { status: 500 });
  }
}
