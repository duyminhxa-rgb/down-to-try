"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Temporary helper: receives generated brand images from a ChatGPT tab via
 * postMessage and stores them in the public "brand" bucket.
 */
export default function BrandReceiver() {
  const [log, setLog] = useState<string[]>(["Waiting for images…"]);

  useEffect(() => {
    const supabase = createClient();
    async function onMessage(e: MessageEvent) {
      if (e.origin !== "https://chatgpt.com") return;
      const { name, blob } = (e.data ?? {}) as { name?: string; blob?: Blob };
      if (!name || !(blob instanceof Blob)) return;
      const { error } = await supabase.storage
        .from("brand")
        .upload(name, blob, { contentType: blob.type || "image/png", upsert: false });
      const msg = error ? `❌ ${name}: ${error.message}` : `✅ ${name} (${Math.round(blob.size / 1024)}KB)`;
      setLog((l) => [...l, msg]);
      (e.source as Window | null)?.postMessage({ name, ok: !error, error: error?.message }, { targetOrigin: e.origin });
    }
    window.addEventListener("message", onMessage);
    window.opener?.postMessage({ ready: true }, "https://chatgpt.com");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="mx-auto max-w-xl p-8 font-mono text-sm">
      <h1 className="mb-4 text-xl font-bold">Brand receiver</h1>
      {log.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
    </div>
  );
}
