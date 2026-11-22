"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

const FEATURES = [
  ["🪜", "Tiny steps", "Any skill broken into steps a normal person can actually do.", "Từng bước nhỏ ai cũng làm được."],
  ["🎬", "The right video", "A real teacher's video for every single step.", "Video hướng dẫn cho từng bước."],
  ["🎥", "Live coach", "Show your hands, your drawing or your screen and talk it through.", "Huấn luyện viên nhìn và nghe bạn."],
  ["🆘", "“I'm stuck” button", "Too hard? It splits the step smaller. No talent required.", "Khó quá? Chia nhỏ ra."],
];

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
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Left: brand panel */}
      <section className="dot-grid relative hidden flex-col justify-between bg-ink p-12 text-white lg:flex [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)]">
        <div className="flex items-center gap-3 text-xl font-extrabold">
          <Logo size={36} /> Down <span className="-ml-2 text-brand">To Try</span>
        </div>
        <div>
          <p className="eyebrow !text-white/50">Learning platform · Nền tảng học tập</p>
          <h1 className="mt-4 text-6xl font-black leading-[1.02] tracking-tight">
            Not talented?
            <br />
            <span className="text-brand">Perfect.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/70">
            Learn piano, English, drawing, cooking — anything — one small step at a time, with a coach that can see and
            hear you.
          </p>
          {/* Rising steps illustration */}
          <div className="mt-10 flex items-end gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`w-14 rounded-t-xl ${n === 5 ? "bg-brand" : "bg-white/10"}`}
                style={{ height: 24 + n * 26 }}
              />
            ))}
            <span className="mb-2 ml-2 text-4xl">🙌</span>
          </div>
        </div>
        <p className="text-sm text-white/40">For you and your whole family · Cho cả gia đình</p>
      </section>

      {/* Right: sign in */}
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-xl font-extrabold lg:hidden">
            <Logo size={32} /> Down <span className="-ml-1 text-brand">To Try</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight">{sent ? "Check your email 📬" : "Welcome in"}</h2>
          <p className="mt-2 text-ink/60">
            {sent ? (
              <>
                We sent a sign-in button to <b className="text-ink">{email}</b>. Open it on this device.
                <br />
                Mở email và bấm nút để đăng nhập.
              </>
            ) : (
              <>
                No password needed — we&apos;ll email you a sign-in button.
                <br />
                Không cần mật khẩu — nhập email để đăng nhập.
              </>
            )}
          </p>

          {!sent ? (
            <form onSubmit={send} className="mt-8 space-y-3">
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
                {loading ? "Sending…" : "Continue with email →"}
              </button>
              {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
            </form>
          ) : (
            <button onClick={() => setSent(false)} className="btn-ghost mt-8">
              Use a different email
            </button>
          )}

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(([icon, title, en, vi]) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-4">
                <div className="text-2xl">{icon}</div>
                <p className="mt-2 font-bold">{title}</p>
                <p className="text-sm text-ink/60">{en}</p>
                <p className="text-sm text-ink/40">{vi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
