"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserAndProfile } from "@/lib/supabase/server";
import { generateRoadmap, splitStep as aiSplitStep, logCost, type GeneratedStep } from "@/lib/ai";
import { findVideos } from "@/lib/youtube";
import type { SupabaseClient } from "@supabase/supabase-js";
import { titleCase } from "@/lib/text";

async function attachVideos(
  supabase: SupabaseClient,
  rows: { id: string }[],
  generated: GeneratedStep[],
  lang: string
) {
  await Promise.all(
    rows.map(async (row, i) => {
      const g = generated[i];
      const videos = await findVideos(g.youtube_query_en, g.youtube_query_vi, lang);
      if (videos.length) {
        await supabase.from("step_videos").insert(
          videos.map((v, j) => ({ ...v, step_id: row.id, is_primary: j === 0 }))
        );
      }
    })
  );
}

function stepRow(g: GeneratedStep, extra: Record<string, unknown>) {
  return {
    title: titleCase(g.title),
    explanation: g.explanation,
    why_it_matters: g.why_it_matters,
    practice: g.practice,
    done_looks_like: g.done_looks_like,
    common_mistakes: g.common_mistakes ?? [],
    youtube_query: g.youtube_query_en,
    ...extra,
  };
}

export async function createSkill(_prev: { error?: string } | undefined, formData: FormData) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");

  const skill = String(formData.get("skill") || "").trim();
  const goal = String(formData.get("goal") || "").trim();
  const level = String(formData.get("level") || "total beginner");
  if (!skill) return { error: "Type a skill first." };

  let roadmap;
  try {
    const res = await generateRoadmap({ skill, goal, level, lang: profile.language });
    roadmap = res.roadmap;
    await logCost(supabase, user.id, "roadmap", res.usage);
  } catch (e) {
    console.error(e);
    return { error: "Couldn't build the plan right now. Try again in a minute." };
  }

  const { data: skillRow, error } = await supabase
    .from("skills")
    .insert({
      user_id: user.id,
      name: titleCase(roadmap.skill_name || skill),
      goal: goal || null,
      starting_level: level,
      language: profile.language,
      summary: roadmap.summary,
    })
    .select()
    .single();
  if (error || !skillRow) return { error: "Couldn't save the skill." };

  const generated: GeneratedStep[] = [];
  const rows: Record<string, unknown>[] = [];
  let pos = 1;
  roadmap.levels.forEach((lvl, li) => {
    lvl.steps.forEach((s) => {
      generated.push(s);
      rows.push(stepRow(s, { skill_id: skillRow.id, level: li + 1, level_name: titleCase(lvl.name), position: pos++ }));
    });
  });
  const { data: inserted } = await supabase.from("steps").insert(rows).select("id, position").order("position");
  if (inserted) await attachVideos(supabase, inserted, generated, profile.language);

  redirect(`/skill/${skillRow.id}`);
}

export async function setStepStatus(stepId: string, status: "todo" | "doing" | "done") {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("steps")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", stepId)
    .select("skill_id")
    .single();
  if (data) revalidatePath(`/skill/${data.skill_id}`);
  revalidatePath(`/step/${stepId}`);
}

export async function makeStepSmaller(stepId: string, note: string) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");

  const { data: step } = await supabase
    .from("steps")
    .select("*, skills(name, language)")
    .eq("id", stepId)
    .single();
  if (!step) return { error: "Step not found" };

  const lang = step.skills?.language ?? profile.language;
  let sub: GeneratedStep[];
  try {
    const res = await aiSplitStep({ skill: step.skills?.name ?? "", step, note, lang });
    sub = res.steps;
    await logCost(supabase, user.id, "split_step", res.usage);
  } catch (e) {
    console.error(e);
    return { error: "Couldn't split this step. Try again." };
  }

  const base = Number(step.position);
  const rows = sub.map((s, i) =>
    stepRow(s, {
      skill_id: step.skill_id,
      parent_step_id: step.id,
      level: step.level,
      level_name: step.level_name,
      position: base + (i + 1) / (sub.length + 1) / 10,
    })
  );
  const { data: inserted } = await supabase.from("steps").insert(rows).select("id, position").order("position");
  if (inserted) await attachVideos(supabase, inserted, sub, lang);
  await supabase.from("steps").update({ status: "split" }).eq("id", step.id);

  revalidatePath(`/skill/${step.skill_id}`);
  redirect(inserted?.[0] ? `/step/${inserted[0].id}` : `/skill/${step.skill_id}`);
}

export async function deleteSkill(skillId: string) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login");
  await supabase.from("skills").delete().eq("id", skillId);
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login");
  const display_name = String(formData.get("display_name") || "").trim() || "Learner";
  const language = String(formData.get("language") || "en");
  await supabase.from("profiles").update({ display_name, language }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const { supabase } = await getUserAndProfile();
  await supabase.auth.signOut();
  redirect("/login");
}
