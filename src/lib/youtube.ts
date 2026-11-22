import { youtubeKey } from "./keys";

export type Video = {
  youtube_id: string;
  title: string;
  channel: string;
  thumbnail: string;
};

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function search(q: string, lang?: string): Promise<Video[]> {
  const key = youtubeKey();
  if (!key || !q) return [];
  const params = new URLSearchParams({
    part: "snippet",
    q,
    type: "video",
    maxResults: "4",
    videoEmbeddable: "true",
    safeSearch: "strict",
    key,
  });
  if (lang) params.set("relevanceLanguage", lang);
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("YouTube search failed", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    return (json.items ?? [])
      .filter((i: { id?: { videoId?: string } }) => i.id?.videoId)
      .map(
        (i: {
          id: { videoId: string };
          snippet: { title: string; channelTitle: string; thumbnails?: { medium?: { url: string } } };
        }) => ({
          youtube_id: i.id.videoId,
          title: decode(i.snippet.title),
          channel: i.snippet.channelTitle,
          thumbnail: i.snippet.thumbnails?.medium?.url ?? "",
        })
      );
  } catch (e) {
    console.error("YouTube search error", e);
    return [];
  }
}

/**
 * Finds videos for a step. Vietnamese learners get Vietnamese videos first,
 * then English videos fill the gaps (many niche skills only have English teachers).
 */
export async function findVideos(
  queryEn: string,
  queryVi: string | undefined,
  lang: string
): Promise<Video[]> {
  let results: Video[] = [];
  if ((lang === "vi" || lang === "mix") && queryVi) {
    results = await search(queryVi, "vi");
  }
  if (results.length < 3) {
    const en = await search(queryEn, "en");
    const seen = new Set(results.map((v) => v.youtube_id));
    results = [...results, ...en.filter((v) => !seen.has(v.youtube_id))];
  }
  return results.slice(0, 3);
}
