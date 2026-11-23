import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { signOut, updateProfile } from "@/app/actions";
import { t } from "@/lib/i18n";

export default async function SettingsPage() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");
  const lang = profile.language;

  const since = new Date();
  since.setDate(1);
  const { data: costs } = await supabase
    .from("api_costs")
    .select("cost_usd")
    .gte("created_at", since.toISOString());
  const monthCost = (costs ?? []).reduce((a, c) => a + Number(c.cost_usd ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{t(lang, "settings")}</h1>
      <form action={updateProfile} className="card space-y-4">
        <label className="block">
          <span className="font-semibold">{lang === "en" ? "Your Name" : "Tên Của Bạn"}</span>
          <input name="display_name" defaultValue={profile.display_name} className="input mt-1" />
        </label>
        <fieldset>
          <legend className="mb-2 font-semibold">{lang === "en" ? "Language" : "Ngôn Ngữ"}</legend>
          <div className="grid gap-2">
            {[
              ["en", "English"],
              ["vi", "Tiếng Việt"],
              ["mix", "Song ngữ · Both (Vietnamese + English terms)"],
            ].map(([v, l]) => (
              <label key={v} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                <input type="radio" name="language" value={v} defaultChecked={profile.language === v} className="h-5 w-5" />
                {l}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-ink/50">
            {lang === "en"
              ? "New skills use this language. Existing skills keep theirs."
              : "Kỹ năng mới sẽ dùng ngôn ngữ này."}
          </p>
        </fieldset>
        <button className="btn-primary w-full">{lang === "en" ? "Save" : "Lưu"}</button>
      </form>

      <div className="card">
        <p className="font-semibold">{lang === "en" ? "AI Cost This Month (Approx.)" : "Chi Phí AI Tháng Này (Ước Tính)"}</p>
        <p className="text-3xl font-extrabold">${monthCost.toFixed(2)}</p>
        <p className="text-sm text-ink/50">Claude only — live coach usage shows in Google AI Studio billing.</p>
      </div>

      <form action={signOut}>
        <button className="btn-ghost w-full">{t(lang, "signOut")}</button>
      </form>
    </div>
  );
}
