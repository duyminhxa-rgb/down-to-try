"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { makeStepSmaller, setStepStatus } from "@/app/actions";
import Sprout, { SproutLoader } from "./Sprout";
import { sfx } from "@/lib/sfx";

type Labels = Record<"done" | "stuck" | "undo" | "next" | "thinking" | "stuckQuestion", string>;

export default function StepActions({
  stepId,
  status,
  nextId,
  labels,
}: {
  stepId: string;
  status: string;
  nextId?: string;
  labels: Labels;
}) {
  const [pending, start] = useTransition();
  const [stuckOpen, setStuckOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  if (status === "done")
    return (
      <div className="card flex flex-wrap items-center justify-between gap-3 !border-brand/30 !bg-brand-soft">
        <span className="flex items-center gap-3 text-xl font-extrabold text-brand-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/celebrate.webp" alt="" className="h-20 w-20 rounded-2xl" />
          {labels.done}
        </span>
        <div className="flex gap-2">
          <button className="btn-ghost" disabled={pending} onClick={() => start(() => setStepStatus(stepId, "todo"))}>
            {labels.undo}
          </button>
          {nextId && (
            <Link href={`/step/${nextId}`} className="btn-primary">
              {labels.next}
            </Link>
          )}
        </div>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className="btn-mint text-lg"
          disabled={pending}
          onClick={() => {
            if (nextId) sfx.done();
            else sfx.bloom();
            start(() => setStepStatus(stepId, "done"));
          }}
        >
          {labels.done}
        </button>
        <button className="btn-ghost text-lg" disabled={pending} onClick={() => setStuckOpen((v) => !v)}>
          {labels.stuck}
        </button>
      </div>
      {stuckOpen && pending && <SproutLoader title={labels.thinking} />}
      {stuckOpen && !pending && (
        <div className="card space-y-3">
          <div className="flex items-center gap-3">
            <Sprout pose="stuck" size={72} />
            <label className="font-semibold">{labels.stuckQuestion}</label>
          </div>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <button
            className="btn-primary w-full"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await makeStepSmaller(stepId, note);
                if (res?.error) setError(res.error);
                else sfx.split();
              })
            }
          >
            {pending ? labels.thinking : labels.stuck}
          </button>
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
