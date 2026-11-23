export type Lang = "en" | "vi" | "mix";

const dict = {
  appName: { en: "Down To Try", vi: "Down To Try" },
  tagline: {
    en: "Learn anything, one small step at a time.",
    vi: "Học bất cứ thứ gì, từng bước nhỏ một.",
  },
  mySkills: { en: "My Skills", vi: "Kỹ Năng Của Tôi" },
  newSkill: { en: "Learn Something New", vi: "Học Kỹ Năng Mới" },
  skillPlaceholder: {
    en: "e.g. guitar, speaking English, drawing faces, piano…",
    vi: "vd: đàn guitar, nói tiếng Anh, vẽ mặt người, piano…",
  },
  goalPlaceholder: {
    en: "Your goal (optional): e.g. play 3 songs for my family",
    vi: "Mục tiêu (không bắt buộc): vd đàn được 3 bài hát",
  },
  level: { en: "Where are you now?", vi: "Bạn đang ở mức nào?" },
  zero: { en: "Total Beginner", vi: "Chưa Biết Gì" },
  little: { en: "Know a Little", vi: "Biết Chút Chút" },
  some: { en: "Some Experience", vi: "Có Kinh Nghiệm" },
  build: { en: "Build My Plan", vi: "Tạo Lộ Trình" },
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
  doneBtn: { en: "✓ I Can Do This", vi: "✓ Mình Làm Được Rồi" },
  stuckBtn: { en: "I'm Stuck — Make It Smaller", vi: "Khó Quá — Chia Nhỏ Ra" },
  undo: { en: "Not Yet", vi: "Chưa Được" },
  why: { en: "Why It Matters", vi: "Tại Sao Quan Trọng" },
  practice: { en: "Practice", vi: "Luyện Tập" },
  doneLooks: { en: "You're Done When…", vi: "Xong Khi…" },
  mistakes: { en: "Common Mistakes", vi: "Lỗi Hay Gặp" },
  watch: { en: "Watch", vi: "Xem Video" },
  moreVideos: { en: "Other Videos", vi: "Video Khác" },
  askCoach: { en: "Ask Your Coach", vi: "Hỏi Huấn Luyện Viên" },
  askPlaceholder: {
    en: "Ask anything about this step…",
    vi: "Hỏi bất cứ điều gì về bước này…",
  },
  send: { en: "Send", vi: "Gửi" },
  liveCoach: { en: "Live Coach", vi: "Huấn Luyện Trực Tiếp" },
  liveCoachDesc: {
    en: "Your coach can see you (camera or screen) and talk with you.",
    vi: "Huấn luyện viên nhìn thấy bạn (camera hoặc màn hình) và nói chuyện với bạn.",
  },
  back: { en: "← Back", vi: "← Quay Lại" },
  settings: { en: "Settings", vi: "Cài Đặt" },
  signOut: { en: "Sign Out", vi: "Đăng Xuất" },
  splitFrom: { en: "Smaller Steps For:", vi: "Các Bước Nhỏ Hơn Cho:" },
  next: { en: "Next Step →", vi: "Bước Tiếp →" },
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
