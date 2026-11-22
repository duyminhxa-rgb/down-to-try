"use client";

import { useActionState } from "react";
import { createSkill } from "@/app/actions";

type Labels = Record<
  "skillPlaceholder" | "goalPlaceholder" | "level" | "zero" | "little" | "some" | "build" | "building",
  string
>;

export default function NewSkillForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState(createSkill, undefined);
  return (
    <form action={action} className="space-y-3">
      <input name="skill" className="input text-xl" placeholder={labels.skillPlaceholder} required />
      <input name="goal" className="input" placeholder={labels.goalPlaceholder} />
      <fieldset>
        <legend className="mb-2 font-semibold">{labels.level}</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["total beginner", labels.zero],
            ["knows a little", labels.little],
            ["some experience", labels.some],
          ].map(([v, l], i) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="level" value={v} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-block rounded-full bg-cream px-4 py-2 ring-1 ring-black/10 peer-checked:bg-ink peer-checked:text-white">
                {l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button className="btn-primary w-full text-lg" disabled={pending}>
        {pending ? labels.building : labels.build}
      </button>
      {state?.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
