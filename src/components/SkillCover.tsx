"use client";

import { useEffect, useState } from "react";

// One request per skill per page load, even if several cards render the same skill.
const inflight = new Map<string, Promise<string | null>>();

function requestCover(skillId: string) {
  if (!inflight.has(skillId)) {
    inflight.set(
      skillId,
      fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      })
        .then((r) => r.json())
        .then((j) => (j.url as string) ?? null)
        .catch(() => null)
    );
  }
  return inflight.get(skillId)!;
}

export default function SkillCover({
  skillId,
  coverUrl,
  name,
  className = "",
}: {
  skillId: string;
  coverUrl: string | null;
  name: string;
  className?: string;
}) {
  const [url, setUrl] = useState(coverUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (coverUrl) return;
    let alive = true;
    requestCover(skillId).then((u) => {
      if (!alive) return;
      if (u) setUrl(u);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [coverUrl, skillId]);

  return (
    <div className={`relative overflow-hidden bg-brand-soft ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-soft via-[#fff3c4] to-[#dff3ea]">
          <span className="text-5xl font-black text-ink/20">{name.slice(0, 1).toUpperCase()}</span>
          {!failed && (
            <span className="absolute bottom-2 right-3 animate-pulse text-xs font-semibold text-ink/40">Sprout is drawing…</span>
          )}
        </div>
      )}
    </div>
  );
}
