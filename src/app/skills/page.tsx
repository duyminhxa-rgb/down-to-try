import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import SkillCard, { type SkillSummary } from "@/components/SkillCard";

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
          <p className="eyebrow">{en ? "Your library" : "Thư viện"}</p>
          <h1 className="text-4xl font-black tracking-tight">{en ? "My skills" : "Kỹ năng của tôi"}</h1>
        </div>
        <Link href="/" className="btn-primary">
          + {en ? "New skill" : "Kỹ năng mới"}
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="card text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hero.webp" alt="" className="mx-auto mb-4 w-full max-w-md rounded-2xl" />
          <p className="mt-2 font-bold">{en ? "Nothing here yet." : "Chưa có gì."}</p>
          <p className="text-ink/60">{en ? "Pick something you're down to try." : "Chọn một thứ bạn muốn thử nhé."}</p>
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
