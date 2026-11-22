# Down To Try

Learn anything, one small step at a time. A family learning coach:

- **Roadmaps:** type any skill, and Claude breaks it into small beginner steps (English / Vietnamese / both)
- **Real YouTube videos** for every step (Vietnamese first when Vietnamese is chosen, with English fallback)
- **"I'm stuck"** splits a step into smaller ones
- **Ask your coach:** a chat on every step that knows the lesson
- **🎥 Live coach:** Gemini Live sees you (camera **or** screen share) and hears you, and talks back in real time. Works on PC and phone.

Stack: Next.js 16 · Supabase (auth + Postgres + RLS) · Claude API · Gemini Live API · YouTube Data API v3

---

## 1. Environment variables

Copy `.env.example` → `.env.local` (for local dev) and add the same keys in Vercel → Project → Settings → Environment Variables.

| Key | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | already filled in `.env.example` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | already filled in `.env.example` |
| `ANTHROPIC_API_KEY` | Claude Console → key "skilllab" |
| `GEMINI_API_KEY` | Google AI Studio → key "SkillLab" |
| `YOUTUBE_API_KEY` | Google Cloud → SkillLab project → "SkillLab YouTube" |
| `CLAUDE_MODEL` (optional) | defaults to `claude-sonnet-5-5` |
| `GEMINI_LIVE_MODEL` (optional) | defaults to `gemini-3.8-live` |

## 2. Deploy to Vercel (one time)

```bash
npm install
npx vercel login
npx vercel link          # create new project "down-to-try" in "Duy Xa's projects"
npx vercel env add ANTHROPIC_API_KEY
npx vercel env add GEMINI_API_KEY
npx vercel env add YOUTUBE_API_KEY
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx vercel --prod
```

(Or push to GitHub and use "Import Project" in Vercel, then add the env vars in the dashboard.)

## 3. Tell Supabase your site URL (for email sign-in links)

Supabase dashboard → project **down-to-try** → Authentication → URL Configuration:

- **Site URL:** `https://YOUR-APP.vercel.app` (later your real domain)
- **Redirect URLs:** add `https://YOUR-APP.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

## 4. Run locally

```bash
npm install
npm run dev
```

Note: camera/mic only work on `localhost` or HTTPS. To test the live coach on your phone, use the deployed HTTPS URL.

## 5. Family accounts

Each person signs in with their own email (magic link, no password), then goes to **Settings** to set their name and language (English / Tiếng Việt / Both).

---

## How the live coach works

1. The browser asks `/api/live-token` for a short-lived Gemini token. The real Gemini key never reaches the browser.
2. The browser connects straight to Gemini Live (lowest latency) and streams:
   - mic audio (16 kHz PCM, via `public/pcm-worklet.js`)
   - 1 JPEG frame/second from the camera **or** a shared screen
3. Gemini talks back (24 kHz audio) and sends live transcripts.
4. Sliding-window compression + session resumption keep long sessions alive, and the app auto-reconnects.
5. When you end the session, the transcript is saved to `coach_sessions`.

Limits to know:
- ~1 frame/second, so it's good for posture, hand position, chord shapes, drawings, and screens. For fast movement, slow down or freeze.
- iPhone/iPad Safari can't share the screen (Apple restriction). Camera and voice work.
- Use earbuds/headphones so the coach doesn't hear itself.

## Costs

- Claude: ~$0.10 per new roadmap, ~1–3¢ per chat question (tracked in Settings)
- Gemini Live: roughly 3–5¢ per minute of live coaching (see AI Studio billing)
- YouTube: free (≈100 searches/day; each roadmap uses ~10–14)
- Supabase / Vercel: free tiers
