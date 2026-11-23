import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import SkillCard, { type SkillSummary } from "@/components/SkillCard";
import Sprout from "@/components/Sprout";

export default async function SkillsPage() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");
  const en = profile.language === "en";
  const { data } = await supabase
    .from("skills")
    .select("id, name, summary, cover_url, created_at, steps(status)")
    .order("created_at", { ascending: false });
  const list = (data ?? []) as SkillSummary[];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">{en ? "Your Library" : "Thư Viện"}</p>
          <h1 className="text-4xl font-black tracking-tight">{en ? "My Garden" : "Vườn Của Tôi"}</h1>
        </div>
        <Link href="/" className="btn-primary">
          + {en ? "New Skill" : "Kỹ Năng Mới"}
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="card text-center">
          <Sprout pose="sleep" size={160} className="mx-auto" />
          <p className="mt-2 font-bold">{en ? "Nothing Here Yet." : "Chưa Có Gì."}</p>
          <p className="text-ink/60">{en ? "Nothing planted yet. Pick a seed!" : "Chưa gieo gì cả. Chọn một hạt nhé!"}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <SkillCard key={s.id} s={s} lang={profile.language} />
          ))}
        </div>
      )}
    </div>
  );
}
