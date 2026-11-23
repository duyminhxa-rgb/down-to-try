/* eslint-disable @next/next/no-img-element */
export default function Logo({ size = 32 }: { size?: number }) {
  return <img src="/brand/app-icon.png" width={size} height={size} alt="" className="shrink-0" />;
}
