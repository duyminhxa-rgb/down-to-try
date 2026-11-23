"use client";

import { useSyncExternalStore } from "react";
import { setSoundOn, sfx, soundOn } from "@/lib/sfx";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));

export default function SoundToggle({ label, hint }: { label: string; hint: string }) {
  const on = useSyncExternalStore(subscribe, soundOn, () => true);
  return (
    <button
      type="button"
      onClick={() => {
        setSoundOn(!on);
        listeners.forEach((l) => l());
        if (!on) sfx.done();
      }}
      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-cream p-4 text-left"
    >
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="text-sm text-ink/55">{hint}</span>
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-ink/15"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
      </span>
    </button>
  );
}
