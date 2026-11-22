import Link from "next/link";

export type SkillSummary = {
  id: string;
  name: string;
  summary: string | null;
  steps: { status: string }[] | null;
};

export function progressOf(s: SkillSummary) {
  const real = (s.steps ?? []).filter((x) => x.status !== "split");
  const done = real.filter((x) => x.status === "done").length;
  return { done, total: real.length, pct: real.length ? Math.round((done / real.length) * 100) : 0 };
}

export default function SkillCard({ s, lang }: { s: SkillSummary; lang: string }) {
  const p = progressOf(s);
  return (
    <Link href={`/skill/${s.id}`} className="card group block transition hover:-translate-y-0.5 hover:border-ink">
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-extrabold leading-tight">{s.name}</p>
        <span className="shrink-0 rounded-full bg-cream px-2 py-1 text-xs font-bold">{p.pct}%</span>
      </div>
      <p className="mt-1 line-clamp-2 text-[15px] text-ink/60">{s.summary}</p>
      <div className="mt-4 flex gap-1">
        {Array.from({ length: Math.max(p.total, 1) }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < p.done ? "bg-mint" : "bg-black/5"}`} />
        ))}
      </div>
      <p className="mt-2 text-sm font-semibold text-ink/50">
        {p.done}/{p.total} {lang === "en" ? "steps" : "bước"}
      </p>
    </Link>
  );
}
