import Link from "next/link";
import Sprout from "@/components/Sprout";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Sprout pose="sleep" size={180} />
      <h1 className="text-3xl font-black">Nothing Here</h1>
      <p className="text-ink/60">Sprout looked everywhere. This page doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary mt-2">
        Back Home
      </Link>
    </div>
  );
}
