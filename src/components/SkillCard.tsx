import Link from "next/link";
import SkillCover from "./SkillCover";
import { titleCase } from "@/lib/text";

export type SkillSummary = {
  id: string;
  name: string;
  summary: string | null;
  cover_url?: string | null;
  steps: { status: string }[] | null;
};

export function progressOf(s: { steps: { status: string }[] | null }) {
  const real = (s.steps ?? []).filter((x) => x.status !== "split");
  const done = real.filter((x) => x.status === "done").length;
  return { done, total: real.length, pct: real.length ? Math.round((done / real.length) * 100) : 0 };
}

export function growthStage(pct: number, lang: string) {
  const en = lang === "en";
  if (pct >= 100) return { emoji: "", label: en ? "In Bloom" : "Ra Hoa", color: "bg-sun/30 text-ink" };
  if (pct >= 60) return { emoji: "", label: en ? "Sapling" : "Cây Non", color: "bg-brand text-white" };
  if (pct >= 20) return { emoji: "", label: en ? "Sprout" : "Mầm", color: "bg-brand-soft text-brand-dark" };
  return { emoji: "", label: en ? "Seed" : "Hạt", color: "bg-cream text-ink/70" };
}

export default function SkillCard({ s, lang }: { s: SkillSummary; lang: string }) {
  const p = progressOf(s);
  const name = titleCase(s.name);
  return (
    <Link
      href={`/skill/${s.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-ink"
    >
      <SkillCover skillId={s.id} coverUrl={s.cover_url ?? null} name={name} className="aspect-[16/9]" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-extrabold leading-tight">{name}</p>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${growthStage(p.pct, lang).color}`}>{growthStage(p.pct, lang).label} · {p.pct}%</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[15px] text-ink/60">{s.summary}</p>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: Math.max(p.total, 1) }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i < p.done ? "bg-mint" : "bg-black/5"}`} />
          ))}
        </div>
        <p className="mt-2 text-sm font-semibold text-ink/50">
          {p.done}/{p.total} {lang === "en" ? "leaves grown" : "lá đã mọc"}
        </p>
      </div>
    </Link>
  );
}
