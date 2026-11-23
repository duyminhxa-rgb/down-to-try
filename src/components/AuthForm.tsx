"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sprout from "./Sprout";

type Mode = "signin" | "signup" | "forgot" | "magic";

const COPY: Record<Mode, { title: string; sub: string; vi: string; btn: string }> = {
  signin: { title: "Welcome Back", sub: "Sign in to water your garden.", vi: "Đăng nhập để tưới vườn của bạn.", btn: "Sign In" },
  signup: { title: "Plant Your First Seed", sub: "Create a free account. Takes 10 seconds.", vi: "Tạo tài khoản miễn phí, chỉ 10 giây.", btn: "Create Account" },
  forgot: { title: "Forgot Your Password?", sub: "We'll email you a link to set a new one.", vi: "Chúng tôi sẽ gửi link để đặt mật khẩu mới.", btn: "Send Reset Link" },
  magic: { title: "Sign In With A Link", sub: "No password — we'll email you a sign-in button.", vi: "Không cần mật khẩu — nhận nút đăng nhập qua email.", btn: "Email Me A Link" },
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function AuthForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState(initialError ?? "");
  const [loading, setLoading] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const c = COPY[mode];

  async function google() {
    setError("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
        router.refresh();
        return;
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback`, data: { display_name: name.trim() || undefined } },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }
        setSent(`We sent a confirm button to ${email}. Tap it and you're in. / Kiểm tra email để xác nhận.`);
      }
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setSent(`If ${email} has an account, a reset link is on its way. / Link đặt lại mật khẩu đã được gửi.`);
      }
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) throw error;
        setSent(`We sent a sign-in button to ${email}. Open it on this device. / Mở email và bấm nút để đăng nhập.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(
        /invalid login/i.test(msg)
          ? "Wrong email or password. / Sai email hoặc mật khẩu."
          : /already registered/i.test(msg)
            ? "That email already has an account — sign in instead. / Email này đã có tài khoản."
            : msg
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent)
    return (
      <div>
        <Sprout pose="wave" size={120} className="mb-2" />
        <h2 className="text-4xl font-black tracking-tight">Check Your Email</h2>
        <p className="mt-2 text-ink/60">{sent}</p>
        <button onClick={() => { setSent(null); setMode("signin"); }} className="btn-ghost mt-8">
          ← Back To Sign In
        </button>
      </div>
    );

  return (
    <div>
      {(mode === "signin" || mode === "signup") && (
        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-cream p-1 font-bold">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              className={`rounded-xl py-2.5 transition ${mode === m ? "bg-white shadow-sm" : "text-ink/50"}`}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
      )}

      <h2 className="text-4xl font-black tracking-tight">{c.title}</h2>
      <p className="mt-2 text-ink/60">
        {c.sub}
        <br />
        <span className="text-ink/45">{c.vi}</span>
      </p>

      {(mode === "signin" || mode === "signup") && (
        <>
          <button type="button" onClick={google} className="btn-ghost mt-6 w-full gap-3 !bg-white">
            <GoogleIcon /> Continue With Google
          </button>
          <div className="my-5 flex items-center gap-3 text-sm font-semibold text-ink/40">
            <div className="h-px flex-1 bg-line" /> or / hoặc <div className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={`space-y-3 ${mode === "forgot" || mode === "magic" ? "mt-6" : ""}`}>
        {mode === "signup" && (
          <input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name / Tên của bạn" />
        )}
        <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        {(mode === "signin" || mode === "signup") && (
          <input
            className="input"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Password (8+ characters)" : "Password / Mật khẩu"}
          />
        )}
        <button className="btn-primary w-full text-lg" disabled={loading}>
          {loading ? "One sec…" : c.btn}
        </button>
        {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      </form>

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm font-semibold">
        {mode === "signin" && (
          <button type="button" onClick={() => setMode("forgot")} className="text-sky hover:underline">
            Forgot Password?
          </button>
        )}
        {mode !== "magic" ? (
          <button type="button" onClick={() => setMode("magic")} className="text-ink/50 hover:underline">
            Email Me A Sign-In Link Instead
          </button>
        ) : null}
        {(mode === "forgot" || mode === "magic") && (
          <button type="button" onClick={() => setMode("signin")} className="text-sky hover:underline">
            ← Back To Sign In
          </button>
        )}
      </div>
    </div>
  );
}
