import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import LiveCoach from "@/components/LiveCoach";
import { titleCase } from "@/lib/text";
import Sprout from "@/components/Sprout";

export default async function CoachPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step: stepId } = await searchParams;
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");

  let title = "";
  if (stepId) {
    const { data } = await supabase.from("steps").select("title, skills(name)").eq("id", stepId).single();
    if (data) title = `${titleCase((data.skills as unknown as { name: string })?.name)} · ${titleCase(data.title)}`;
  }

  return (
    <div className="space-y-4">
      <Link href={stepId ? `/step/${stepId}` : "/"} className="text-ink/60">
        {profile.language === "en" ? "← Back" : "← Quay Lại"}
      </Link>
      <div className="flex items-center gap-4">
        <Sprout pose="coach" size={96} />
        <div>
          <h1 className="text-3xl font-black">{profile.language === "en" ? "Grow With Sprouty" : "Học Cùng Sprouty"}</h1>
          {title && <p className="text-ink/60">{title}</p>}
        </div>
      </div>
      <LiveCoach stepId={stepId ?? null} lang={profile.language} />
    </div>
  );
}
