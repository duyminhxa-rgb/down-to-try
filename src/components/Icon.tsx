/* eslint-disable @next/next/no-img-element */
export type IconName =
  | "streak" | "done" | "coach" | "steps" | "video" | "help"
  | "why" | "practice" | "target" | "warning" | "home" | "chat";

export default function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <img
      src={`/brand/icons/${name}.png`}
      alt=""
      width={size}
      height={size}
      className={`inline-block shrink-0 select-none ${className}`}
      draggable={false}
    />
  );
}
