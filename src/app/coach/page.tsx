import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import LiveCoach from "@/components/LiveCoach";
import { titleCase } from "@/lib/text";

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
        {profile.language === "en" ? "← Back" : "← Quay lại"}
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold">🎥 Live coach</h1>
        {title && <p className="text-ink/60">{title}</p>}
      </div>
      <LiveCoach stepId={stepId ?? null} lang={profile.language} />
    </div>
  );
}
