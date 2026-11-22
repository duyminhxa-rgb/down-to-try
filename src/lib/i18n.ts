export type Lang = "en" | "vi" | "mix";

const dict = {
  appName: { en: "Down To Try", vi: "Down To Try" },
  tagline: {
    en: "Learn anything, one small step at a time.",
    vi: "Học bất cứ thứ gì, từng bước nhỏ một.",
  },
  mySkills: { en: "My skills", vi: "Kỹ năng của tôi" },
  newSkill: { en: "Learn something new", vi: "Học kỹ năng mới" },
  skillPlaceholder: {
    en: "e.g. guitar, speaking English, drawing faces, piano…",
    vi: "vd: đàn guitar, nói tiếng Anh, vẽ mặt người, piano…",
  },
  goalPlaceholder: {
    en: "Your goal (optional): e.g. play 3 songs for my family",
    vi: "Mục tiêu (không bắt buộc): vd đàn được 3 bài hát",
  },
  level: { en: "Where are you now?", vi: "Bạn đang ở mức nào?" },
  zero: { en: "Total beginner", vi: "Chưa biết gì" },
  little: { en: "Know a little", vi: "Biết chút chút" },
  some: { en: "Some experience", vi: "Có kinh nghiệm" },
  build: { en: "Build my plan", vi: "Tạo lộ trình" },
  building: {
    en: "Building your plan + finding videos… (about 1 minute)",
    vi: "Đang tạo lộ trình + tìm video… (khoảng 1 phút)",
  },
  noSkills: {
    en: "No skills yet. Pick something you're down to try!",
    vi: "Chưa có kỹ năng nào. Chọn một thứ bạn muốn thử nhé!",
  },
  steps: { en: "steps", vi: "bước" },
  done: { en: "done", vi: "xong" },
  doneBtn: { en: "✓ I can do this", vi: "✓ Mình làm được rồi" },
  stuckBtn: { en: "I'm stuck — make it smaller", vi: "Khó quá — chia nhỏ ra" },
  undo: { en: "Not yet", vi: "Chưa được" },
  why: { en: "Why it matters", vi: "Tại sao quan trọng" },
  practice: { en: "Practice", vi: "Luyện tập" },
  doneLooks: { en: "You're done when…", vi: "Xong khi…" },
  mistakes: { en: "Common mistakes", vi: "Lỗi hay gặp" },
  watch: { en: "Watch", vi: "Xem video" },
  moreVideos: { en: "Other videos", vi: "Video khác" },
  askCoach: { en: "Ask your coach", vi: "Hỏi huấn luyện viên" },
  askPlaceholder: {
    en: "Ask anything about this step…",
    vi: "Hỏi bất cứ điều gì về bước này…",
  },
  send: { en: "Send", vi: "Gửi" },
  liveCoach: { en: "🎥 Live coach", vi: "🎥 Huấn luyện trực tiếp" },
  liveCoachDesc: {
    en: "Your coach can see you (camera or screen) and talk with you.",
    vi: "Huấn luyện viên nhìn thấy bạn (camera hoặc màn hình) và nói chuyện với bạn.",
  },
  back: { en: "← Back", vi: "← Quay lại" },
  settings: { en: "Settings", vi: "Cài đặt" },
  signOut: { en: "Sign out", vi: "Đăng xuất" },
  splitFrom: { en: "Smaller steps for:", vi: "Các bước nhỏ hơn cho:" },
  next: { en: "Next step →", vi: "Bước tiếp →" },
  thinking: { en: "Thinking…", vi: "Đang suy nghĩ…" },
} as const;

export type Key = keyof typeof dict;

export function t(lang: Lang | string | null | undefined, key: Key): string {
  const l = lang === "vi" || lang === "mix" ? "vi" : "en";
  return dict[key][l];
}

export function languageInstruction(lang: string): string {
  if (lang === "vi")
    return "Write everything in natural, friendly Vietnamese (use 'bạn' / 'mình'). Keep common English technical terms (e.g. BPM, layer, chord names) in English and explain them in Vietnamese.";
  if (lang === "mix")
    return "Write mainly in Vietnamese, but put key terms and short phrases in BOTH Vietnamese and English, e.g. 'hợp âm (chord)'. This person is bilingual and learning in both languages.";
  return "Write everything in simple, friendly English. Short sentences, no jargon without explaining it.";
}
