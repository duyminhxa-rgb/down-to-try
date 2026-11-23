import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserAndProfile } from "@/lib/supabase/server";
import { geminiKey } from "@/lib/keys";
import { coverPrompt } from "@/lib/art";

export const maxDuration = 120;

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-nano-banana-2.1";

/** Generates (once) an AI cover illustration for a skill and stores it in Supabase Storage. */
export async function POST(req: Request) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!geminiKey()) return NextResponse.json({ error: "Gemini key missing" }, { status: 500 });

  const { skillId } = await req.json();
  const { data: skill } = await supabase.from("skills").select("id, name, cover_url").eq("id", skillId).single();
  if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  if (skill.cover_url) return NextResponse.json({ url: skill.cover_url });

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey() });
    const interaction = await ai.interactions.create({
      model: IMAGE_MODEL,
      input: coverPrompt(skill.name),
      response_format: { type: "image", aspect_ratio: "16:9", image_size: "1K" },
    });
    const img = interaction.output_image;
    if (!img?.data) throw new Error("No image returned");

    const mime = img.mime_type || "image/png";
    const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
    const path = `${user.id}/${skill.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, Buffer.from(img.data, "base64"), { contentType: mime, upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("covers").getPublicUrl(path);
    const url = `${pub.publicUrl}?v=${Date.now()}`;
    await supabase.from("skills").update({ cover_url: url }).eq("id", skill.id);
    await supabase.from("api_costs").insert({
      user_id: user.id,
      provider: "gemini",
      feature: "cover_art",
      cost_usd: Number(process.env.COVER_COST_USD || 0.04),
    });
    return NextResponse.json({ url });
  } catch (e) {
    console.error("cover generation failed", e);
    return NextResponse.json({ error: "Couldn't draw a cover right now." }, { status: 500 });
  }
}
