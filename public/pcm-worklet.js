// Captures mic audio, resamples to 16 kHz mono, converts to 16-bit PCM,
// and posts ~100 ms chunks (plus a loudness level for the mic meter).
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.pos = 0;
    this.out = new Int16Array(1600);
    this.outIdx = 0;
    this.prev = 0;
    this.level = 0;
  }

  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) this.level = Math.max(this.level * 0.999, Math.abs(ch[i]));
    // linear-interpolation resample
    while (this.pos < ch.length) {
      const i = Math.floor(this.pos);
      const frac = this.pos - i;
      const a = i === 0 ? this.prev : ch[i - 1];
      const b = ch[i];
      const s = Math.max(-1, Math.min(1, a + (b - a) * frac));
      this.out[this.outIdx++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.outIdx === this.out.length) {
        this.port.postMessage({ pcm: this.out.buffer, level: this.level }, [this.out.buffer]);
        this.out = new Int16Array(1600);
        this.outIdx = 0;
      }
      this.pos += this.ratio;
    }
    this.pos -= ch.length;
    this.prev = ch[ch.length - 1];
    return true;
  }
}
registerProcessor("pcm-capture", PcmCapture);
