"use client";

import { useEffect, useState } from "react";
import Sprout from "./Sprout";

export default function StepImage({ stepId, imageUrl, alt, drawing }: { stepId: string; imageUrl: string | null; alt: string; drawing: string }) {
  const [url, setUrl] = useState(imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (imageUrl) return;
    let alive = true;
    fetch("/api/step-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId }),
    })
      .then((r) => r.json())
      .then((j) => alive && (j.url ? setUrl(j.url) : setFailed(true)))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [imageUrl, stepId]);

  if (failed) return null;
  return (
    <div className="overflow-hidden rounded-2xl bg-[#eef8f2]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2">
          <Sprout pose="study" size={80} bounce />
          <p className="animate-pulse text-sm font-bold text-ink/50">{drawing}</p>
        </div>
      )}
    </div>
  );
}
