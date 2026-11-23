"use client";

/**
 * Tiny synthesized sound effects (Web Audio, no files).
 * Muted state is a per-device preference kept in localStorage.
 */
let ctx: AudioContext | null = null;

export function soundOn(): boolean {
  try {
    return localStorage.getItem("sfx") !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem("sfx", on ? "on" : "off");
  } catch {}
}

function ac() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18, slideTo?: number) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function buzz(ms: number | number[]) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}

export const sfx = {
  /** Little "pop" for taps that matter (send, open). */
  pop() {
    if (!soundOn()) return;
    tone(620, 0, 0.09, "sine", 0.12, 900);
  },
  /** Step done: bright two-note "ding-ding" + happy sparkle. */
  done() {
    if (!soundOn()) return;
    tone(784, 0, 0.18, "triangle", 0.2);
    tone(1175, 0.11, 0.32, "triangle", 0.2);
    tone(1568, 0.22, 0.25, "sine", 0.08);
    buzz([20, 40, 30]);
  },
  /** Step split smaller: soft descending "whoop". */
  split() {
    if (!soundOn()) return;
    tone(660, 0, 0.22, "sine", 0.14, 330);
    tone(495, 0.12, 0.2, "sine", 0.1, 260);
    buzz(15);
  },
  /** Sprouty replied in chat: gentle blip. */
  reply() {
    if (!soundOn()) return;
    tone(880, 0, 0.07, "sine", 0.08);
    tone(1320, 0.06, 0.1, "sine", 0.06);
  },
  /** Skill finished (In Bloom): little rising arpeggio. */
  bloom() {
    if (!soundOn()) return;
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, "triangle", 0.16));
    buzz([30, 50, 30, 50, 60]);
  },
};
