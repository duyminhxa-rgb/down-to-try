import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import NewSkillForm from "@/components/NewSkillForm";
import SkillCard, { progressOf, type SkillSummary } from "@/components/SkillCard";

export const maxDuration = 300;

export default async function Home() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");
  const lang = profile.language;
  const en = lang === "en";

  const [{ data: skills }, { count: sessions }, { data: lastDone }] = await Promise.all([
    supabase
      .from("skills")
      .select("id, name, summary, created_at, steps(id, title, status, position)")
      .order("created_at", { ascending: false }),
    supabase.from("coach_sessions").select("id", { count: "exact", head: true }),
    supabase.from("steps").select("completed_at").eq("status", "done").order("completed_at", { ascending: false }).limit(60),
  ]);

  type FullStep = { id: string; title: string; status: string; position: number };
  type FullSkill = Omit<SkillSummary, "steps"> & { steps: FullStep[] | null };
  const list = (skills ?? []) as FullSkill[];
  const stepsDone = list.reduce((a, s) => a + progressOf(s).done, 0);

  // Days in a row with at least one finished step
  const days = new Set((lastDone ?? []).map((d) => (d.completed_at ?? "").slice(0, 10)));
  let streak = 0;
  for (let d = new Date(); ; d.setDate(d.getDate() - 1)) {
    if (days.has(d.toISOString().slice(0, 10))) streak++;
    else if (streak > 0 || d.toDateString() !== new Date().toDateString()) break;
  }

  const active = list.find((s) => progressOf(s).pct < 100 && s.steps?.length);
  const nextStep = active?.steps
    ?.filter((x) => x.status !== "split" && x.status !== "done")
    .sort((a, b) => a.position - b.position)[0];

  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Los_Angeles" }).format(new Date())
  );
  const hello = en
    ? hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    : hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{hello}</p>
          <h1 className="text-4xl font-black tracking-tight">{profile.display_name} 👋</h1>
        </div>
        <div className="flex gap-2">
          {[
            ["🔥", streak, en ? "day streak" : "ngày liên tiếp"],
            ["✅", stepsDone, en ? "steps done" : "bước xong"],
            ["🎥", sessions ?? 0, en ? "coach sessions" : "buổi HLV"],
          ].map(([icon, n, label]) => (
            <div key={String(label)} className="rounded-2xl border border-line bg-white px-4 py-2 text-center">
              <p className="text-xl font-black">
                {icon} {n}
              </p>
              <p className="text-xs font-semibold text-ink/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {active && nextStep && (
        <Link
          href={`/step/${nextStep.id}`}
          className="group relative block overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8"
        >
          <div className="pointer-events-none absolute -right-6 bottom-0 flex items-end gap-2 opacity-30">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-10 rounded-t-lg bg-brand" style={{ height: 20 + n * 22 }} />
            ))}
          </div>
          <p className="eyebrow !text-white/50">{en ? "Continue learning" : "Học tiếp"} · {active.name}</p>
          <p className="mt-2 max-w-xl text-2xl font-extrabold leading-snug sm:text-3xl">{nextStep.title}</p>
          <span className="btn-primary mt-5">{en ? "Practice now →" : "Luyện ngay →"}</span>
        </Link>
      )}

      <section className="card !p-6">
        <h2 className="text-2xl font-black tracking-tight">{en ? "What are you down to try?" : "Bạn muốn thử học gì?"}</h2>
        <p className="mb-5 text-ink/60">
          {en
            ? "Pick a path or type anything. We'll break it into small steps with a video for each."
            : "Chọn một chủ đề hoặc gõ bất cứ thứ gì. Mình sẽ chia thành từng bước nhỏ kèm video."}
        </p>
        <NewSkillForm lang={lang} />
      </section>

      {list.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">{en ? "My skills" : "Kỹ năng của tôi"}</h2>
            <Link href="/skills" className="text-sm font-bold text-brand">
              {en ? "See all →" : "Xem tất cả →"}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(0, 6).map((s) => (
              <SkillCard key={s.id} s={s} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
