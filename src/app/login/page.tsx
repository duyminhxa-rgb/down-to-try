"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import Credit from "@/components/Credit";
import Sprout from "@/components/Sprout";
import Icon, { type IconName } from "@/components/Icon";

const FEATURES: [IconName, string, string, string][] = [
  ["steps", "Tiny Steps", "Any skill broken into steps a normal person can actually do.", "Từng bước nhỏ ai cũng làm được."],
  ["video", "The Right Video", "A real teacher's video for every single step.", "Video hướng dẫn cho từng bước."],
  ["coach", "Live Coach", "Show your hands, your drawing or your screen and talk it through.", "Huấn luyện viên nhìn và nghe bạn."],
  ["help", "“I'm Stuck” Button", "Too hard? It splits the step smaller. No talent required.", "Khó quá? Chia nhỏ ra."],
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
      <section className="relative hidden overflow-hidden bg-[#eef8f2] lg:flex lg:flex-col">
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3 text-xl font-extrabold">
            <Logo size={40} /> Down <span className="-ml-2 text-brand">To Try</span>
          </div>
          <h1 className="mt-10 text-6xl font-black leading-[1.02] tracking-tight text-ink">
            Not Talented?
            <br />
            <span className="text-brand">Perfect.</span>
          </h1>
          <p className="mt-5 max-w-sm text-lg text-ink/70">
            Learn piano, English, drawing, cooking — anything — one small step at a time, with a coach that can see and
            hear you.
          </p>
          <p className="mt-2 max-w-sm text-ink/50">Học bất cứ thứ gì, từng bước nhỏ một.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/hero.webp"
          alt="Sprout climbing steps of piano, guitar, art, language, cooking and tech"
          className="mt-auto w-full object-cover object-bottom"
        />
      </section>

      {/* Right: sign in */}
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2 text-xl font-extrabold">
              <Logo size={36} /> Down <span className="-ml-1 text-brand">To Try</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hero.webp" alt="" className="mt-4 w-full rounded-2xl" />
          </div>
          {sent && <Sprout pose="wave" size={120} className="mb-2" />}
          <h2 className="text-4xl font-black tracking-tight">{sent ? "Check Your Email" : "Welcome In"}</h2>
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
                {loading ? "Sending…" : "Continue With Email →"}
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
                <Icon name={icon} size={40} />
                <p className="mt-2 font-bold">{title}</p>
                <p className="text-sm text-ink/60">{en}</p>
                <p className="text-sm text-ink/40">{vi}</p>
              </div>
            ))}
          </div>
          <Credit className="mt-10" />
        </div>
      </section>
    </div>
  );
}
