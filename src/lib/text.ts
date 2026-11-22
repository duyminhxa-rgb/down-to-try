const SMALL = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "nor", "of", "on", "or", "over",
  "per", "the", "to", "up", "via", "vs", "with",
]);

// Vietnamese titles use sentence case by convention, so leave them alone.
const VIETNAMESE = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;

/** "sit well and find your keys" → "Sit Well and Find Your Keys" (English only). */
export function titleCase(input: string | null | undefined): string {
  const s = (input ?? "").trim();
  if (!s || VIETNAMESE.test(s)) return s;
  const words = s.split(/(\s+)/);
  const real = words.filter((w) => w.trim()).length;
  let i = 0;
  return words
    .map((w) => {
      if (!w.trim()) return w;
      const idx = i++;
      // Keep words that already have inner capitals (iPhone, BPM, DJ, C-major).
      if (/[A-Z]/.test(w.slice(1))) return w;
      const lower = w.toLowerCase();
      const bare = lower.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
      const afterColon = idx > 0 && /[:—–-]$/.test(words.filter((x) => x.trim())[idx - 1] ?? "");
      if (idx !== 0 && idx !== real - 1 && !afterColon && SMALL.has(bare)) return lower;
      return lower.replace(/[a-z0-9]/, (c) => c.toUpperCase()).replace(/-([a-z])/g, (_, c) => "-" + c.toUpperCase());
    })
    .join("");
}
