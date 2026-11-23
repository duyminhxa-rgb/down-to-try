import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import DeleteSkillButton from "@/components/DeleteSkillButton";
import SkillCover from "@/components/SkillCover";
import { titleCase } from "@/lib/text";

type Step = {
  id: string;
  title: string;
  status: string;
  level: number;
  level_name: string | null;
  position: number;
  parent_step_id: string | null;
};

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");
  const lang = profile.language;

  const { data: skill } = await supabase.from("skills").select("*").eq("id", id).single();
  if (!skill) notFound();
  const { data: steps } = await supabase
    .from("steps")
    .select("id, title, status, level, level_name, position, parent_step_id")
    .eq("skill_id", id)
    .order("position");

  const visible = (steps ?? []).filter((s: Step) => s.status !== "split") as Step[];
  const nextStep = visible.find((s) => s.status !== "done");
  const levels = new Map<string, Step[]>();
  visible.forEach((s) => {
    const key = titleCase(s.level_name || `Level ${s.level}`);
    levels.set(key, [...(levels.get(key) ?? []), s]);
  });
  const done = visible.filter((s) => s.status === "done").length;

  return (
    <div className="space-y-6">
      <Link href="/" className="text-ink/60">
        {t(lang, "back")}
      </Link>
      <SkillCover
        skillId={skill.id}
        coverUrl={skill.cover_url}
        name={titleCase(skill.name)}
        className="aspect-[21/9] rounded-3xl border border-line"
      />
      <div>
        <h1 className="text-4xl font-black tracking-tight">{titleCase(skill.name)}</h1>
        <p className="mt-2 text-lg text-ink/70">{skill.summary}</p>
        <p className="mt-2 font-semibold text-mint">
          {done}/{visible.length} {t(lang, "steps")} {t(lang, "done")}
        </p>
      </div>

      {nextStep && (
        <Link href={`/step/${nextStep.id}`} className="btn-primary w-full text-xl">
          {lang === "en" ? "Continue: " : "Tiếp Tục: "}
          {titleCase(nextStep.title)}
        </Link>
      )}

      {[...levels.entries()].map(([name, list]) => (
        <section key={name}>
          <h2 className="mb-2 text-xl font-bold">{name}</h2>
          <ol className="space-y-2">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/step/${s.id}`}
                  className={`card flex items-center gap-3 !p-4 ${s.parent_step_id ? "ml-6" : ""}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      s.status === "done"
                        ? "bg-mint text-white"
                        : s.id === nextStep?.id
                          ? "bg-brand text-white"
                          : "bg-black/5"
                    }`}
                  >
                    {s.status === "done" ? "✓" : s.parent_step_id ? "·" : ""}
                  </span>
                  <span className={s.status === "done" ? "text-ink/50 line-through" : "font-semibold"}>
                    {titleCase(s.title)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <DeleteSkillButton skillId={skill.id} lang={lang} />
    </div>
  );
}
