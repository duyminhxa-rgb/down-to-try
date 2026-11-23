"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sprout from "@/components/Sprout";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <Sprout pose="thinking" size={110} />
      <h1 className="mt-2 text-4xl font-black tracking-tight">Set A New Password</h1>
      <p className="mt-2 text-ink/60">Đặt mật khẩu mới cho tài khoản của bạn.</p>
      <form onSubmit={save} className="mt-6 space-y-3">
        <input className="input" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" />
        <button className="btn-primary w-full text-lg" disabled={loading}>{loading ? "Saving…" : "Save Password"}</button>
        {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      </form>
    </div>
  );
}
