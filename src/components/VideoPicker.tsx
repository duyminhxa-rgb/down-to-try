"use client";

import { useState } from "react";

type V = { id: string; youtube_id: string; title: string | null; channel: string | null; thumbnail: string | null };

export default function VideoPicker({ videos, label }: { videos: V[]; label: string }) {
  const [current, setCurrent] = useState(videos[0]);
  return (
    <section className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-3xl bg-black shadow">
        <iframe
          key={current.youtube_id}
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${current.youtube_id}?rel=0&modestbranding=1&playsinline=1`}
          title={current.title ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="font-semibold">
        {current.title} <span className="font-normal text-ink/50">· {current.channel}</span>
      </p>
      {videos.length > 1 && (
        <div>
          <p className="mb-2 text-sm text-ink/60">{label}</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {videos
              .filter((v) => v.youtube_id !== current.youtube_id)
              .map((v) => (
                <button key={v.id} onClick={() => setCurrent(v)} className="w-44 shrink-0 text-left">
                  {v.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnail} alt="" className="aspect-video w-full rounded-xl object-cover" />
                  )}
                  <p className="mt-1 line-clamp-2 text-sm">{v.title}</p>
                </button>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
