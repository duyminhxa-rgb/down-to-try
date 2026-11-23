import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import StepActions from "@/components/StepActions";
import StepChat from "@/components/StepChat";
import VideoPicker from "@/components/VideoPicker";
import { findVideos } from "@/lib/youtube";
import { titleCase } from "@/lib/text";
import Sprout from "@/components/Sprout";
import Icon from "@/components/Icon";
import StepImage from "@/components/StepImage";

/** Break a paragraph into short, scannable lines (one or two sentences each). */
function toLines(text: string | null): string[] {
  if (!text) return [];
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ỹ0-9"'“])/u)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last && (last.length < 45 || p.length < 30) && out.length >= 1 && last.length + p.length < 140) out[out.length - 1] = `${last} ${p}`;
    else out.push(p);
  }
  return out.slice(0, 8);
}

export const maxDuration = 300;

export default async function StepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");
  const lang = profile.language;

  const { data: step } = await supabase.from("steps").select("*, skills(id, name)").eq("id", id).single();
  if (!step) notFound();

  const [{ data: foundVideos }, { data: messages }, { data: siblings }, parent] = await Promise.all([
    supabase.from("step_videos").select("*").eq("step_id", id).order("is_primary", { ascending: false }),
    supabase.from("chat_messages").select("id, role, content").eq("step_id", id).order("created_at"),
    supabase
      .from("steps")
      .select("id, status, position")
      .eq("skill_id", step.skill_id)
      .neq("status", "split")
      .order("position"),
    step.parent_step_id
      ? supabase.from("steps").select("title").eq("id", step.parent_step_id).single()
      : Promise.resolve({ data: null }),
  ]);

  // Backfill videos for steps that were created without any (e.g. YouTube was down).
  let videos = foundVideos;
  if (!videos?.length && step.youtube_query) {
    const fresh = await findVideos(step.youtube_query, undefined, "en");
    if (fresh.length) {
      const { data } = await supabase
        .from("step_videos")
        .insert(fresh.map((v, j) => ({ ...v, step_id: step.id, is_primary: j === 0 })))
        .select("*");
      videos = data ?? [];
    }
  }

  const idx = siblings?.findIndex((s) => s.id === id) ?? -1;
  const next = idx >= 0 ? siblings?.[idx + 1] : undefined;

  return (
    <div className="space-y-6">
      <Link href={`/skill/${step.skills.id}`} className="text-ink/60">
        ← {titleCase(step.skills.name)}
      </Link>

      <div>
        {parent.data && (
          <p className="text-sm text-ink/50">
            {t(lang, "splitFrom")} {titleCase(parent.data.title)}
          </p>
        )}
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{titleCase(step.level_name)}</p>
        <h1 className="text-[28px] font-black leading-tight sm:text-3xl">{titleCase(step.title)}</h1>
      </div>

      {videos && videos.length > 0 && <VideoPicker videos={videos} label={t(lang, "moreVideos")} />}

      <section className="card space-y-5 !p-4 sm:!p-6">
        <StepImage
          stepId={step.id}
          imageUrl={step.image_url ?? null}
          alt={titleCase(step.title)}
          drawing={lang === "en" ? "Sprouty is drawing this step…" : "Sprouty đang vẽ bước này…"}
        />
        <div>
          <h2 className="mb-3 text-xl font-extrabold">{lang === "en" ? "How To Do It" : "Cách Làm"}</h2>
          <ol className="space-y-3">
            {toLines(step.explanation).map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
                  {i + 1}
                </span>
                <span className="text-[16px] leading-[1.6] text-ink/90 sm:text-[17px]">{line}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {step.practice && (
        <section className="rounded-2xl border-2 border-brand/25 bg-brand-soft p-4 sm:p-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-extrabold text-brand-dark">
            <Icon name="practice" size={30} /> {t(lang, "practice")}
          </h3>
          <p className="text-[16px] leading-[1.6] text-ink sm:text-[17px]">{step.practice}</p>
        </section>
      )}

      {step.done_looks_like && (
        <section className="rounded-2xl border-2 border-sky/20 bg-sky-soft p-4 sm:p-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-extrabold text-[#1a5fb4]">
            <Icon name="target" size={30} /> {t(lang, "doneLooks")}
          </h3>
          <p className="text-[16px] leading-[1.6] text-ink sm:text-[17px]">{step.done_looks_like}</p>
        </section>
      )}

      {step.common_mistakes?.length > 0 && (
        <section className="rounded-2xl border-2 border-sun/40 bg-[#fff8e1] p-4 sm:p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-[#8a6100]">
            <Icon name="warning" size={30} /> {t(lang, "mistakes")}
          </h3>
          <ul className="space-y-2.5">
            {step.common_mistakes.map((m: string) => (
              <li key={m} className="flex gap-3 text-[16px] leading-[1.55] text-ink sm:text-[17px]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sun/60 text-xs font-black text-[#8a6100]">
                  ✕
                </span>
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {step.why_it_matters && (
        <section className="flex gap-3 px-1">
          <Icon name="why" size={30} className="mt-0.5" />
          <div>
            <h3 className="text-base font-extrabold">{t(lang, "why")}</h3>
            <p className="text-[15px] leading-[1.6] text-ink/75 sm:text-base">{step.why_it_matters}</p>
          </div>
        </section>
      )}

      <Link
        href={`/coach?step=${step.id}`}
        className="card flex items-center gap-4 !border-sky/30 !bg-sky-soft transition hover:-translate-y-0.5"
      >
        <Sprout pose="coach" size={88} />
        <span>
          <span className="block text-xl font-bold">{t(lang, "liveCoach")}</span>
          <span className="text-ink/60">{t(lang, "liveCoachDesc")}</span>
        </span>
      </Link>

      <StepActions
        stepId={step.id}
        status={step.status}
        nextId={next?.id}
        labels={{
          done: t(lang, "doneBtn"),
          stuck: t(lang, "stuckBtn"),
          undo: t(lang, "undo"),
          next: t(lang, "next"),
          thinking: t(lang, "thinking"),
          stuckQuestion:
            lang === "en" ? "What feels hard? (optional)" : "Phần nào khó với bạn? (không bắt buộc)",
        }}
      />

      <StepChat
        stepId={step.id}
        initial={messages ?? []}
        labels={{ title: t(lang, "askCoach"), placeholder: t(lang, "askPlaceholder"), send: t(lang, "send"), thinking: t(lang, "thinking") }}
      />
    </div>
  );
}
