/**
 * Google keys are easy to mix up. Gemini (AI Studio) keys start with "AQ.",
 * classic Google Cloud keys (YouTube) start with "AIza". Pick by shape so a
 * swapped paste in Vercel still works.
 */
function googleKeys() {
  const a = process.env.GEMINI_API_KEY ?? "";
  const b = process.env.YOUTUBE_API_KEY ?? "";
  const swapped = a.startsWith("AIza") && b.startsWith("AQ.");
  return swapped ? { gemini: b, youtube: a } : { gemini: a, youtube: b };
}

export const geminiKey = () => googleKeys().gemini;
export const youtubeKey = () => googleKeys().youtube;
