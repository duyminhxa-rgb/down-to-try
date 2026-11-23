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
        <h1 className="text-3xl font-extrabold leading-tight">{titleCase(step.title)}</h1>
      </div>

      {videos && videos.length > 0 && <VideoPicker videos={videos} label={t(lang, "moreVideos")} />}

      <section className="card space-y-4">
        <p className="text-lg leading-relaxed">{step.explanation}</p>
        {step.why_it_matters && (
          <div>
            <h3 className="flex items-center gap-2 font-bold"><Icon name="why" size={26} /> {t(lang, "why")}</h3>
            <p className="text-ink/80">{step.why_it_matters}</p>
          </div>
        )}
        {step.practice && (
          <div className="rounded-2xl bg-cream p-4">
            <h3 className="flex items-center gap-2 font-bold"><Icon name="practice" size={26} /> {t(lang, "practice")}</h3>
            <p>{step.practice}</p>
          </div>
        )}
        {step.done_looks_like && (
          <div>
            <h3 className="flex items-center gap-2 font-bold"><Icon name="target" size={26} /> {t(lang, "doneLooks")}</h3>
            <p className="text-ink/80">{step.done_looks_like}</p>
          </div>
        )}
        {step.common_mistakes?.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 font-bold"><Icon name="warning" size={26} /> {t(lang, "mistakes")}</h3>
            <ul className="list-disc space-y-1 pl-6 text-ink/80">
              {step.common_mistakes.map((m: string) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

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
