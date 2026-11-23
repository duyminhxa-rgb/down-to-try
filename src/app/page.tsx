import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import NewSkillForm from "@/components/NewSkillForm";
import SkillCard, { progressOf, type SkillSummary } from "@/components/SkillCard";
import { titleCase } from "@/lib/text";
import Sprout from "@/components/Sprout";
import Icon, { type IconName } from "@/components/Icon";

export const maxDuration = 300;

export default async function Home() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");
  const lang = profile.language;
  const en = lang === "en";

  const [{ data: skills }, { count: sessions }, { data: lastDone }] = await Promise.all([
    supabase
      .from("skills")
      .select("id, name, summary, cover_url, created_at, steps(id, title, status, position)")
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
    : hour < 12 ? "Chào Buổi Sáng" : hour < 18 ? "Chào Buổi Chiều" : "Chào Buổi Tối";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sprout pose="wave" size={72} />
          <div>
            <p className="eyebrow">{hello}</p>
            <h1 className="text-4xl font-black tracking-tight">{profile.display_name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {(
            [
              ["streak", streak, en ? "Day Streak" : "Ngày Liên Tiếp"],
              ["done", stepsDone, en ? "Steps Done" : "Bước Xong"],
              ["coach", sessions ?? 0, en ? "Coach Sessions" : "Buổi HLV"],
            ] as [IconName, number, string][]
          ).map(([icon, n, label]) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3 py-2 shadow-[0_3px_0_#e2eae6]"
            >
              <Icon name={icon} size={34} />
              <div>
                <p className="text-xl font-black leading-none">{n}</p>
                <p className="text-xs font-semibold text-ink/50">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {active && nextStep && (
        <Link
          href={`/step/${nextStep.id}`}
          className="group relative block overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-[0_6px_0_#1f9a58] sm:p-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/app-icon.png"
            alt=""
            className="pointer-events-none absolute -bottom-6 -right-6 w-40 rotate-6 opacity-90 sm:w-48"
          />
          <p className="eyebrow !text-white/80">{en ? "Continue Learning" : "Học Tiếp"} · {titleCase(active.name)}</p>
          <p className="mt-2 max-w-xl text-2xl font-extrabold leading-snug sm:text-3xl max-w-md">{titleCase(nextStep.title)}</p>
          <span className="mt-5 inline-flex items-center rounded-xl bg-white px-5 py-3 font-bold text-brand-dark shadow-[0_4px_0_rgba(0,0,0,0.15)]">{en ? "Practice Now →" : "Luyện Ngay →"}</span>
        </Link>
      )}

      <section className="card !p-6">
        <h2 className="text-2xl font-black tracking-tight">{en ? "What Are You Down to Try?" : "Bạn Muốn Thử Học Gì?"}</h2>
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
            <h2 className="text-2xl font-black tracking-tight">{en ? "My Skills" : "Kỹ Năng Của Tôi"}</h2>
            <Link href="/skills" className="text-sm font-bold text-brand">
              {en ? "See All →" : "Xem Tất Cả →"}
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
