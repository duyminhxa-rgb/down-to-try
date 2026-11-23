export type Lang = "en" | "vi" | "mix";

const dict = {
  appName: { en: "Sprout It", vi: "Sprout It" },
  tagline: {
    en: "Every expert was once a sprout.",
    vi: "Chuyên gia nào cũng từng là một mầm non.",
  },
  mySkills: { en: "My Garden", vi: "Vườn Của Tôi" },
  newSkill: { en: "Plant A New Skill", vi: "Gieo Kỹ Năng Mới" },
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
  build: { en: "Sprout It!", vi: "Gieo Hạt Thôi!" },
  building: {
    en: "Sprouty is planting your plan + finding videos… (about 1 minute)",
    vi: "Sprouty đang gieo lộ trình + tìm video… (khoảng 1 phút)",
  },
  noSkills: {
    en: "Your garden is empty. Plant your first skill!",
    vi: "Vườn còn trống. Gieo kỹ năng đầu tiên nhé!",
  },
  steps: { en: "steps", vi: "bước" },
  done: { en: "done", vi: "xong" },
  doneBtn: { en: "✓ I Can Do This", vi: "✓ Mình Làm Được Rồi" },
  stuckBtn: { en: "Too Big — Make It Smaller", vi: "Khó Quá — Chia Nhỏ Ra" },
  undo: { en: "Not Yet", vi: "Chưa Được" },
  why: { en: "Why It Matters", vi: "Tại Sao Quan Trọng" },
  practice: { en: "Practice", vi: "Luyện Tập" },
  doneLooks: { en: "You're Done When…", vi: "Xong Khi…" },
  mistakes: { en: "Common Mistakes", vi: "Lỗi Hay Gặp" },
  watch: { en: "Watch", vi: "Xem Video" },
  moreVideos: { en: "Other Videos", vi: "Video Khác" },
  askCoach: { en: "Ask Sprouty", vi: "Hỏi Sprouty" },
  askPlaceholder: {
    en: "Ask anything about this step…",
    vi: "Hỏi bất cứ điều gì về bước này…",
  },
  send: { en: "Send", vi: "Gửi" },
  liveCoach: { en: "Grow With Sprouty", vi: "Học Cùng Sprouty" },
  liveCoachDesc: {
    en: "Sprouty can see you (camera or screen) and talk with you, live.",
    vi: "Sprouty nhìn thấy bạn (camera hoặc màn hình) và nói chuyện trực tiếp với bạn.",
  },
  back: { en: "← Back", vi: "← Quay Lại" },
  settings: { en: "Settings", vi: "Cài Đặt" },
  signOut: { en: "Sign Out", vi: "Đăng Xuất" },
  splitFrom: { en: "Smaller Steps For:", vi: "Các Bước Nhỏ Hơn Cho:" },
  next: { en: "Next Step →", vi: "Bước Tiếp →" },
  thinking: { en: "Sprouty is thinking…", vi: "Sprouty đang nghĩ…" },
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
