/* eslint-disable @next/next/no-img-element */
export type Pose = "wave" | "thinking" | "stuck" | "coach" | "study" | "sleep";

const ALT: Record<Pose, string> = {
  wave: "Sprout waving hello",
  thinking: "Sprout thinking",
  stuck: "Sprout scratching its head",
  coach: "Sprout the coach",
  study: "Sprout studying",
  sleep: "Sprout sleeping",
};

/** Sprout, the Down To Try mascot. */
export default function Sprout({
  pose,
  size = 96,
  className = "",
  bounce = false,
}: {
  pose: Pose;
  size?: number;
  className?: string;
  bounce?: boolean;
}) {
  return (
    <img
      src={`/brand/sprout/${pose}.webp`}
      alt={ALT[pose]}
      width={size}
      height={size}
      className={`shrink-0 select-none mix-blend-multiply ${bounce ? "animate-sprout-bounce" : ""} ${className}`}
      draggable={false}
    />
  );
}

/** Full-width loading state with Sprout thinking. */
export function SproutLoader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Sprout pose="thinking" size={140} bounce />
      <p className="text-xl font-extrabold">{title}</p>
      {subtitle && <p className="max-w-sm text-ink/60">{subtitle}</p>}
      <div className="mt-1 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
