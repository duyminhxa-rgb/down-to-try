"use client";

import { useState, useTransition } from "react";
import { deleteSkill } from "@/app/actions";

export default function DeleteSkillButton({ skillId, lang }: { skillId: string; lang: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const en = lang === "en";
  if (!confirm)
    return (
      <button onClick={() => setConfirm(true)} className="text-sm text-ink/40 underline">
        {en ? "Delete This Skill" : "Xoá Kỹ Năng Này"}
      </button>
    );
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{en ? "Delete everything for this skill?" : "Xoá hết kỹ năng này?"}</span>
      <button className="btn-ghost !py-1 text-red-600" disabled={pending} onClick={() => start(() => deleteSkill(skillId))}>
        {en ? "Yes, Delete" : "Xoá"}
      </button>
      <button className="text-ink/60" onClick={() => setConfirm(false)}>
        {en ? "Cancel" : "Huỷ"}
      </button>
    </div>
  );
}
