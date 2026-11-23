import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import Credit from "@/components/Credit";
import AuthForm from "@/components/AuthForm";
import Icon, { type IconName } from "@/components/Icon";

const FEATURES: [IconName, string, string, string][] = [
  ["steps", "Tiny Steps", "Any skill broken into steps a normal person can actually do.", "Từng bước nhỏ ai cũng làm được."],
  ["video", "The Right Video", "A real teacher's video for every single step.", "Video hướng dẫn cho từng bước."],
  ["coach", "Grow With Sprouty", "Show your hands, your drawing or your screen and talk it through.", "Sprouty nhìn và nghe bạn trực tiếp."],
  ["help", "“Too Big” Button", "Too hard? Sprouty splits the step smaller. No talent required.", "Khó quá? Sprouty chia nhỏ ra."],
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (user) redirect("/");
  const initialError = error ? "That link expired or was already used. Try again. / Link đã hết hạn, thử lại nhé." : undefined;
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Left: brand panel */}
      <section className="relative hidden overflow-hidden bg-[#eef8f2] lg:flex lg:flex-col">
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3 text-xl font-extrabold">
            <Logo size={40} /> Sprout <span className="-ml-2 text-brand">It</span>
          </div>
          <h1 className="mt-10 text-6xl font-black leading-[1.02] tracking-tight text-ink">
            Every Expert
            <br />
            Was Once A <span className="text-brand">Sprout.</span>
          </h1>
          <p className="mt-5 max-w-sm text-lg text-ink/70">
            Not talented? Perfect. Plant any skill — piano, English, drawing, cooking — and grow it one tiny step at a
            time with Sprouty, a coach that can see and hear you.
          </p>
          <p className="mt-2 max-w-sm text-ink/50">Chuyên gia nào cũng từng là một mầm non. Gieo kỹ năng, lớn lên từng bước nhỏ.</p>
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
              <Logo size={36} /> Sprout <span className="-ml-1 text-brand">It</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hero.webp" alt="" className="mt-4 w-full rounded-2xl" />
          </div>
          <AuthForm initialError={initialError} />

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
