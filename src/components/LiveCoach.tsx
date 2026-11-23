"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";
import Sprout from "./Sprout";
import Icon from "./Icon";

type Source = "camera" | "screen" | "voice";
type Line = { role: "you" | "coach"; text: string };
type Status = "idle" | "connecting" | "live" | "reconnecting" | "error";

const L = {
  en: {
    camera: "Camera",
    screen: "Share Screen",
    voice: "Voice Only",
    start: "Start Coaching",
    stop: "End Session",
    connecting: "Connecting…",
    reconnecting: "Reconnecting…",
    live: "Live — Just Talk",
    mute: "Mute Mic",
    unmute: "Unmute",
    flip: "Flip Camera",
    typeHere: "Or type a question…",
    tipTitle: "Tips",
    tips: [
      "Use headphones/earbuds so the coach doesn't hear itself.",
      "Prop your phone so the coach can see your hands/body clearly, with good light.",
      "The coach sees about 1 picture per second — go slowly or freeze when you want feedback.",
      "Just talk normally. You can interrupt it anytime.",
    ],
    empty: "Your conversation will show here.",
    you: "You",
    coach: "Sprouty",
    noScreen: "Screen sharing isn't supported on this device (iPhone/iPad). Use camera or voice.",
  },
  vi: {
    camera: "Camera",
    screen: "Chia Sẻ Màn Hình",
    voice: "Chỉ Giọng Nói",
    start: "Bắt Đầu",
    stop: "Kết Thúc",
    connecting: "Đang kết nối…",
    reconnecting: "Đang kết nối lại…",
    live: "Đang trực tiếp — cứ nói chuyện",
    mute: "Tắt Mic",
    unmute: "Bật Mic",
    flip: "Đổi Camera",
    typeHere: "Hoặc gõ câu hỏi…",
    tipTitle: "Mẹo",
    tips: [
      "Đeo tai nghe để huấn luyện viên không nghe lại tiếng của chính nó.",
      "Dựng điện thoại sao cho thấy rõ tay/người, đủ ánh sáng.",
      "Huấn luyện viên thấy khoảng 1 hình mỗi giây — làm chậm hoặc dừng lại khi muốn được góp ý.",
      "Cứ nói chuyện bình thường. Có thể ngắt lời bất cứ lúc nào.",
    ],
    empty: "Cuộc trò chuyện sẽ hiện ở đây.",
    you: "Bạn",
    coach: "Sprouty",
    noScreen: "Thiết bị này (iPhone/iPad) không hỗ trợ chia sẻ màn hình. Dùng camera hoặc giọng nói.",
  },
};

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromBase64Pcm16(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
  const f = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) f[i] = pcm[i] / 0x8000;
  return f;
}

export default function LiveCoach({ stepId, lang }: { stepId: string | null; lang: string }) {
  const tx = lang === "en" ? L.en : L.vi;
  const [source, setSource] = useState<Source>("camera");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [level, setLevel] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [text, setText] = useState("");
  const canScreen = useSyncExternalStore(
    () => () => {},
    () => !!navigator.mediaDevices?.getDisplayMedia,
    () => true
  );
  const [coachTalking, setCoachTalking] = useState(false);

  const sessionRef = useRef<Session | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const nodeRef = useRef<AudioWorkletNode | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const playTime = useRef(0);
  const playing = useRef(new Set<AudioBufferSourceNode>());
  const handleRef = useRef<string | undefined>(undefined);
  const stopping = useRef(false);
  const reconnecting = useRef(false);
  const mutedRef = useRef(false);
  const linesRef = useRef<Line[]>([]);
  const turnOpen = useRef<{ you: boolean; coach: boolean }>({ you: false, coach: false });
  const startedAt = useRef<string>("");
  const sourceRef = useRef<Source>("camera");
  const scrollRef = useRef<HTMLDivElement>(null);
  const reconnectRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const pushText = useCallback((role: "you" | "coach", chunk: string) => {
    if (!chunk) return;
    const arr = [...linesRef.current];
    const last = arr[arr.length - 1];
    if (last && last.role === role && turnOpen.current[role]) {
      arr[arr.length - 1] = { role, text: last.text + chunk };
    } else {
      arr.push({ role, text: chunk.trimStart() });
    }
    turnOpen.current[role] = true;
    if (role === "coach") turnOpen.current.you = false;
    linesRef.current = arr;
    setLines(arr);
  }, []);

  const stopPlayback = useCallback(() => {
    playing.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    playing.current.clear();
    playTime.current = 0;
    setCoachTalking(false);
  }, []);

  const playChunk = useCallback((b64: string) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const data = fromBase64Pcm16(b64);
    if (!data.length) return;
    const buf = ctx.createBuffer(1, data.length, 24000);
    buf.copyToChannel(data, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const at = Math.max(ctx.currentTime + 0.02, playTime.current);
    src.start(at);
    playTime.current = at + buf.duration;
    playing.current.add(src);
    setCoachTalking(true);
    src.onended = () => {
      playing.current.delete(src);
      if (playing.current.size === 0) setCoachTalking(false);
    };
  }, []);

  // ---------- video ----------
  const stopVideo = useCallback(() => {
    if (frameTimer.current) clearInterval(frameTimer.current);
    frameTimer.current = null;
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    if (videoElRef.current) videoElRef.current.srcObject = null;
  }, []);

  const startVideo = useCallback(
    async (src: Source, face: "user" | "environment") => {
      stopVideo();
      if (src === "voice") return;
      let stream: MediaStream;
      if (src === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 5 }, audio: false });
        stream.getVideoTracks()[0].onended = () => {
          sourceRef.current = "voice";
          setSource("voice");
          stopVideo();
        };
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      }
      videoStreamRef.current = stream;
      const v = videoElRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play().catch(() => {});
      }
      if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
      frameTimer.current = setInterval(() => {
        const s = sessionRef.current;
        const vid = videoElRef.current;
        const c = canvasRef.current;
        if (!s || !vid || !c || !vid.videoWidth) return;
        const scale = Math.min(1, 1024 / Math.max(vid.videoWidth, vid.videoHeight));
        c.width = Math.round(vid.videoWidth * scale);
        c.height = Math.round(vid.videoHeight * scale);
        c.getContext("2d")?.drawImage(vid, 0, 0, c.width, c.height);
        const data = c.toDataURL("image/jpeg", 0.7).split(",")[1];
        try {
          s.sendRealtimeInput({ video: { data, mimeType: "image/jpeg" } });
        } catch {}
      }, 1000);
    },
    [stopVideo]
  );

  // ---------- connection ----------
  const connect = useCallback(async (): Promise<void> => {
    const res = await fetch(`/api/live-token${stepId ? `?step=${stepId}` : ""}`);
    const cfg = await res.json();
    if (!res.ok) throw new Error(cfg.error || "Couldn't start the coach");

    const ai = new GoogleGenAI({ apiKey: cfg.token, httpOptions: { apiVersion: "v1alpha" } });
    const session = await ai.live.connect({
      model: cfg.model,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: cfg.systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        contextWindowCompression: { slidingWindow: {} },
        sessionResumption: { handle: handleRef.current },
      },
      callbacks: {
        onopen: () => {},
        onmessage: (m: LiveServerMessage) => {
          if (m.sessionResumptionUpdate?.resumable && m.sessionResumptionUpdate.newHandle) {
            handleRef.current = m.sessionResumptionUpdate.newHandle;
          }
          if (m.goAway) void reconnectRef.current();
          const sc = m.serverContent;
          if (!sc) return;
          if (sc.interrupted) stopPlayback();
          sc.modelTurn?.parts?.forEach((p) => {
            if (p.inlineData?.data && p.inlineData.mimeType?.startsWith("audio")) playChunk(p.inlineData.data);
          });
          if (sc.inputTranscription?.text) pushText("you", sc.inputTranscription.text);
          if (sc.outputTranscription?.text) pushText("coach", sc.outputTranscription.text);
          if (sc.turnComplete) turnOpen.current = { you: false, coach: false };
        },
        onerror: (e: ErrorEvent) => {
          console.error("live error", e);
        },
        onclose: (e: CloseEvent) => {
          if (sessionRef.current !== session) return;
          sessionRef.current = null;
          if (!stopping.current && !reconnecting.current) {
            console.warn("live closed", e.code, e.reason);
            void reconnectRef.current();
          }
        },
      },
    });
    sessionRef.current = session;
  }, [stepId, playChunk, pushText, stopPlayback]);

  const reconnect = useCallback(async () => {
    if (reconnecting.current || stopping.current) return;
    reconnecting.current = true;
    setStatus("reconnecting");
    const old = sessionRef.current;
    sessionRef.current = null;
    try {
      old?.close();
    } catch {}
    for (let attempt = 0; attempt < 3 && !stopping.current; attempt++) {
      try {
        await connect();
        reconnecting.current = false;
        setStatus("live");
        return;
      } catch (e) {
        console.error("reconnect failed", e);
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    reconnecting.current = false;
    if (!stopping.current) {
      setError(lang === "en" ? "Lost connection to the coach." : "Mất kết nối với huấn luyện viên.");
      setStatus("error");
    }
  }, [connect, lang]);
  useEffect(() => {
    reconnectRef.current = reconnect;
  }, [reconnect]);

  const saveTranscript = useCallback(() => {
    const transcript = linesRef.current;
    if (!transcript.length) return;
    const body = JSON.stringify({ stepId, source: sourceRef.current, transcript, startedAt: startedAt.current });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/coach-session", new Blob([body], { type: "application/json" }));
    else void fetch("/api/coach-session", { method: "POST", body, headers: { "Content-Type": "application/json" } });
  }, [stepId]);

  const stop = useCallback(() => {
    stopping.current = true;
    try {
      sessionRef.current?.close();
    } catch {}
    sessionRef.current = null;
    stopVideo();
    stopPlayback();
    nodeRef.current?.disconnect();
    micRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    saveTranscript();
    setLevel(0);
    setStatus("idle");
  }, [saveTranscript, stopPlayback, stopVideo]);

  const start = useCallback(async () => {
    setError("");
    stopping.current = false;
    handleRef.current = undefined;
    linesRef.current = [];
    setLines([]);
    turnOpen.current = { you: false, coach: false };
    startedAt.current = new Date().toISOString();
    setStatus("connecting");
    try {
      // Audio must be created inside the click (iPhone requirement).
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      await ctx.resume();
      await ctx.audioWorklet.addModule("/pcm-worklet.js");
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
      micRef.current = mic;
      await startVideo(sourceRef.current, facing);

      await connect();

      const node = new AudioWorkletNode(ctx, "pcm-capture");
      nodeRef.current = node;
      const silent = ctx.createGain();
      silent.gain.value = 0;
      ctx.createMediaStreamSource(mic).connect(node);
      node.connect(silent).connect(ctx.destination);
      let lastLevel = 0;
      node.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; level: number }>) => {
        const now = performance.now();
        if (now - lastLevel > 120) {
          lastLevel = now;
          setLevel(mutedRef.current ? 0 : e.data.level);
        }
        const s = sessionRef.current;
        if (!s || mutedRef.current) return;
        try {
          s.sendRealtimeInput({ audio: { data: toBase64(e.data.pcm), mimeType: "audio/pcm;rate=16000" } });
        } catch {}
      };
      setStatus("live");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      stop();
      setError(
        /Permission|NotAllowed/i.test(msg)
          ? lang === "en"
            ? "Camera/mic permission was blocked. Allow it in your browser settings and try again."
            : "Camera/mic bị chặn. Hãy cho phép trong cài đặt trình duyệt rồi thử lại."
          : msg
      );
      setStatus("error");
    }
  }, [connect, facing, lang, startVideo, stop]);

  useEffect(() => () => {
    if (sessionRef.current || micRef.current) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeSource(s: Source) {
    setSource(s);
    sourceRef.current = s;
    if (status === "live") {
      try {
        await startVideo(s, facing);
      } catch (e) {
        console.error(e);
        sourceRef.current = "voice";
        setSource("voice");
      }
    }
  }

  async function flip() {
    const f = facing === "user" ? "environment" : "user";
    setFacing(f);
    if (status === "live" && sourceRef.current === "camera") await startVideo("camera", f);
  }

  function sendText(e: React.FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (!q || !sessionRef.current) return;
    setText("");
    turnOpen.current.you = false;
    pushText("you", q);
    turnOpen.current.you = false;
    sessionRef.current.sendRealtimeInput({ text: q });
  }

  const active = status === "live" || status === "connecting" || status === "reconnecting";
  const showVideo = source !== "voice";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["camera", "screen", "voice"] as Source[]).map((s) => (
          <button
            key={s}
            onClick={() => changeSource(s)}
            disabled={s === "screen" && !canScreen}
            className={`rounded-full px-4 py-2 font-semibold ring-1 ring-black/10 disabled:opacity-40 ${
              source === s ? "bg-ink text-white" : "bg-white"
            }`}
          >
            {tx[s]}
          </button>
        ))}
      </div>
      {!canScreen && <p className="text-sm text-ink/50">{tx.noScreen}</p>}

      <div className="relative overflow-hidden rounded-3xl bg-ink">
        <video
          ref={videoElRef}
          playsInline
          muted
          className={`aspect-video w-full object-contain ${showVideo ? "" : "hidden"} ${
            source === "camera" && facing === "user" ? "-scale-x-100" : ""
          }`}
        />
        {!showVideo && (
          <div className="flex aspect-video items-center justify-center bg-brand-soft">
            <Sprout pose={coachTalking ? "wave" : "coach"} size={200} bounce={coachTalking} />
          </div>
        )}
        {active && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            <span className={`h-2.5 w-2.5 rounded-full ${status === "live" ? "animate-pulse bg-red-500" : "bg-yellow-400"}`} />
            {status === "live" ? tx.live : status === "connecting" ? tx.connecting : tx.reconnecting}
          </div>
        )}
        {active && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-mint transition-all" style={{ width: `${Math.min(100, level * 250)}%` }} />
            </div>
            {coachTalking && <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white">{tx.coach} …</span>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!active ? (
          <button onClick={start} className="btn-primary flex-1 text-xl">
            ▶ {tx.start}
          </button>
        ) : (
          <>
            <button onClick={stop} className="btn-primary flex-1 !bg-red-600 text-lg">
              ■ {tx.stop}
            </button>
            <button onClick={() => setMuted((m) => !m)} className="btn-ghost">
              {muted ? tx.unmute : tx.mute}
            </button>
          </>
        )}
        {source === "camera" && (
          <button onClick={flip} className="btn-ghost">
            {tx.flip}
          </button>
        )}
      </div>
      {error && <p className="rounded-2xl bg-red-50 p-3 text-red-700">{error}</p>}

      <section className="card space-y-3">
        <div ref={scrollRef} className="max-h-80 space-y-2 overflow-y-auto">
          {lines.length === 0 && <p className="text-ink/50">{tx.empty}</p>}
          {lines.map((l, i) => (
            <div key={i} className={`rounded-2xl px-4 py-2 ${l.role === "you" ? "ml-8 bg-ink text-white" : "mr-8 bg-cream"}`}>
              <span className="mr-2 text-xs font-bold uppercase opacity-60">{l.role === "you" ? tx.you : tx.coach}</span>
              {l.text}
            </div>
          ))}
        </div>
        {status === "live" && (
          <form onSubmit={sendText} className="flex gap-2">
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={tx.typeHere} />
            <button className="btn-primary">→</button>
          </form>
        )}
      </section>

      <section className="card">
        <h3 className="mb-2 flex items-center gap-2 font-bold"><Icon name="why" size={26} /> {tx.tipTitle}</h3>
        <ul className="list-disc space-y-1 pl-6 text-ink/70">
          {tx.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
