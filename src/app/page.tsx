import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import NewSkillForm from "@/components/NewSkillForm";

export const maxDuration = 300;

export default async function Home() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");
  const lang = profile.language;

  const { data: skills } = await supabase
    .from("skills")
    .select("id, name, summary, created_at, steps(status)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-extrabold">
          {lang === "en" ? `Hey ${profile.display_name} 👋` : `Chào ${profile.display_name} 👋`}
        </h1>
        <p className="text-ink/70">{t(lang, "tagline")}</p>
      </section>

      <section className="card">
        <h2 className="mb-4 text-2xl font-bold">{t(lang, "newSkill")}</h2>
        <NewSkillForm
          labels={{
            skillPlaceholder: t(lang, "skillPlaceholder"),
            goalPlaceholder: t(lang, "goalPlaceholder"),
            level: t(lang, "level"),
            zero: t(lang, "zero"),
            little: t(lang, "little"),
            some: t(lang, "some"),
            build: t(lang, "build"),
            building: t(lang, "building"),
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-bold">{t(lang, "mySkills")}</h2>
        {!skills?.length && <p className="text-ink/60">{t(lang, "noSkills")}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {skills?.map((s) => {
            const real = (s.steps ?? []).filter((x: { status: string }) => x.status !== "split");
            const done = real.filter((x: { status: string }) => x.status === "done").length;
            const pct = real.length ? Math.round((done / real.length) * 100) : 0;
            return (
              <Link key={s.id} href={`/skill/${s.id}`} className="card block transition hover:ring-brand/40">
                <p className="text-xl font-bold">{s.name}</p>
                <p className="mt-1 line-clamp-2 text-base text-ink/60">{s.summary}</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-mint" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-sm text-ink/60">
                  {done}/{real.length} {t(lang, "steps")} {t(lang, "done")}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
