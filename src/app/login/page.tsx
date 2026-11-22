"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mt-10 space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold leading-tight">
          Not talented? <span className="text-brand">Perfect.</span>
        </h1>
        <p className="mt-3 text-xl text-ink/70">
          Learn anything, one small step at a time.
          <br />
          Học bất cứ thứ gì, từng bước nhỏ một.
        </p>
      </div>

      <div className="card">
        {sent ? (
          <div className="space-y-2">
            <p className="text-2xl font-bold">📬 Check your email</p>
            <p className="text-ink/70">
              We sent a sign-in link to <b>{email}</b>. Open it on this device.
              <br />
              Mở email và bấm vào link để đăng nhập.
            </p>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <label className="block text-lg font-semibold">Email</label>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
            <button className="btn-primary w-full text-lg" disabled={loading}>
              {loading ? "Sending…" : "Send me a sign-in link · Gửi link đăng nhập"}
            </button>
            {error && <p className="text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
