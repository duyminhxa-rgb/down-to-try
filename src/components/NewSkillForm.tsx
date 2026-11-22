"use client";

import { useActionState, useState } from "react";
import { createSkill } from "@/app/actions";
import { TRACKS } from "@/lib/catalog";

export default function NewSkillForm({ lang }: { lang: string }) {
  const en = lang === "en";
  const l = en ? "en" : "vi";
  const [state, action, pending] = useActionState(createSkill, undefined);
  const [track, setTrack] = useState(TRACKS[0].id);
  const [skill, setSkill] = useState("");
  const current = TRACKS.find((t) => t.id === track)!;

  return (
    <div className="space-y-5">
      {/* Track tiles */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {TRACKS.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTrack(t.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-sm font-bold transition ${t.color} ${
              track === t.id ? "border-ink" : "border-transparent opacity-80 hover:opacity-100"
            }`}
          >
            <span className="text-3xl">{t.icon}</span>
            {t.name[l]}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      <div>
        <p className="eyebrow mb-2">{en ? "Popular in" : "Phổ biến trong"} {current.name[l]}</p>
        <div className="flex flex-wrap gap-2">
          {current.skills.map((s) => (
            <button
              type="button"
              key={s.en}
              onClick={() => setSkill(s[l])}
              className={`rounded-full border px-4 py-2 text-[15px] font-semibold transition ${
                skill === s[l] ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
              }`}
            >
              {s[l]}
            </button>
          ))}
        </div>
      </div>

      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
          <input
            name="skill"
            className="input"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder={en ? "Or type anything you want to learn…" : "Hoặc gõ bất cứ thứ gì bạn muốn học…"}
            required
          />
          <input
            name="goal"
            className="input"
            placeholder={en ? "Goal (optional): play 3 songs" : "Mục tiêu: đàn được 3 bài"}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-ink/60">{en ? "I'm a" : "Mình là"}</span>
          {[
            ["total beginner", en ? "Total beginner" : "Chưa biết gì"],
            ["knows a little", en ? "Know a little" : "Biết chút chút"],
            ["some experience", en ? "Some experience" : "Có kinh nghiệm"],
          ].map(([v, label], i) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="level" value={v} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-block rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white">
                {label}
              </span>
            </label>
          ))}
          <button className="btn-primary ml-auto w-full sm:w-auto" disabled={pending || !skill.trim()}>
            {pending ? (en ? "Building your path…" : "Đang tạo lộ trình…") : en ? "Start learning →" : "Bắt đầu học →"}
          </button>
        </div>
        {pending && (
          <p className="text-sm text-ink/60">
            {en
              ? "Breaking it into small steps and finding the best videos. About a minute."
              : "Đang chia nhỏ từng bước và tìm video hay nhất. Khoảng 1 phút."}
          </p>
        )}
        {state?.error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{state.error}</p>}
      </form>
    </div>
  );
}
