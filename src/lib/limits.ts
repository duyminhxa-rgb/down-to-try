import type { SupabaseClient } from "@supabase/supabase-js";

/** Max AI spend (USD) per person per day before Sprouty asks them to come back tomorrow. */
export const DAILY_CAP_USD = Number(process.env.DAILY_CAP_USD || 1.5);
/** Max live Sprouty sessions per person per day. */
export const DAILY_LIVE_SESSIONS = Number(process.env.DAILY_LIVE_SESSIONS || 8);

function startOfDayISO() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function overDailyCap(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("api_costs")
    .select("cost_usd")
    .eq("user_id", userId)
    .gte("created_at", startOfDayISO());
  const spent = (data ?? []).reduce((s, r) => s + Number(r.cost_usd || 0), 0);
  return spent >= DAILY_CAP_USD;
}

export async function overLiveCap(supabase: SupabaseClient, userId: string) {
  const { count } = await supabase
    .from("coach_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDayISO());
  return (count ?? 0) >= DAILY_LIVE_SESSIONS;
}

export const CAP_MSG = {
  en: "Sprouty needs to rest for today — you've used today's limit. Come back tomorrow! 🌱",
  vi: "Hôm nay Sprouty cần nghỉ rồi — bạn đã dùng hết lượt hôm nay. Mai quay lại nhé! 🌱",
};
