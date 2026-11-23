"use client";

import { useRef, useState } from "react";
import Icon from "./Icon";
import Sprout from "./Sprout";

type Msg = { id?: string; role: "user" | "assistant"; content: string };

export default function StepChat({
  stepId,
  initial,
  labels,
}: {
  stepId: string;
  initial: Msg[];
  labels: { title: string; placeholder: string; send: string; thinking: string };
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (!q || loading) return;
    setText("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, message: q }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: json.reply ?? json.error ?? "Error" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <section className="card space-y-3">
      <h2 className="flex items-center gap-2 text-xl font-bold"><Icon name="chat" size={30} /> {labels.title}</h2>
      <div className="max-h-[28rem] space-y-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={m.id ?? i} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <Sprout pose="coach" size={40} className="rounded-full bg-brand-soft" />}
            <div
              className={`whitespace-pre-wrap rounded-2xl px-4 py-3 ${
                m.role === "user" ? "ml-8 bg-sky text-white" : "mr-8 bg-cream"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-2">
            <Sprout pose="thinking" size={40} bounce className="rounded-full bg-brand-soft" />
            <div className="rounded-2xl bg-cream px-4 py-3 text-ink/50">{labels.thinking}</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={labels.placeholder} />
        <button className="btn-primary" disabled={loading}>
          {labels.send}
        </button>
      </form>
    </section>
  );
}
