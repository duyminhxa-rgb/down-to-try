export type Track = {
  id: string;
  icon: string;
  color: string; // tailwind bg class for the tile
  name: { en: string; vi: string };
  skills: { en: string; vi: string }[];
};

/** Curated starting points so the home screen isn't a blank prompt box. */
export const TRACKS: Track[] = [
  {
    id: "music",
    icon: "🎹",
    color: "bg-[#ffe1d6]",
    name: { en: "Music", vi: "Âm nhạc" },
    skills: [
      { en: "Piano", vi: "Piano" },
      { en: "Guitar", vi: "Đàn guitar" },
      { en: "Singing", vi: "Hát" },
      { en: "Ukulele", vi: "Ukulele" },
      { en: "DJing", vi: "DJ" },
    ],
  },
  {
    id: "language",
    icon: "🗣️",
    color: "bg-[#dff3ea]",
    name: { en: "Languages", vi: "Ngoại ngữ" },
    skills: [
      { en: "Speaking English for daily life", vi: "Nói tiếng Anh giao tiếp hằng ngày" },
      { en: "English pronunciation", vi: "Phát âm tiếng Anh" },
      { en: "Reading Vietnamese", vi: "Đọc tiếng Việt" },
      { en: "Spanish basics", vi: "Tiếng Tây Ban Nha cơ bản" },
    ],
  },
  {
    id: "art",
    icon: "✏️",
    color: "bg-[#e6e3ff]",
    name: { en: "Art & Design", vi: "Vẽ & Thiết kế" },
    skills: [
      { en: "Drawing faces", vi: "Vẽ chân dung" },
      { en: "Sketching basics", vi: "Phác thảo cơ bản" },
      { en: "Watercolor", vi: "Màu nước" },
      { en: "Calligraphy", vi: "Thư pháp" },
    ],
  },
  {
    id: "body",
    icon: "🧘",
    color: "bg-[#fff3c4]",
    name: { en: "Body & Movement", vi: "Vận động" },
    skills: [
      { en: "Juggling", vi: "Tung hứng" },
      { en: "Basic dance moves", vi: "Nhảy cơ bản" },
      { en: "Yoga for beginners", vi: "Yoga cho người mới" },
      { en: "Vovinam basics", vi: "Vovinam cơ bản" },
    ],
  },
  {
    id: "kitchen",
    icon: "🍜",
    color: "bg-[#ffe7c2]",
    name: { en: "Kitchen", vi: "Nấu ăn" },
    skills: [
      { en: "Knife skills", vi: "Kỹ năng dùng dao" },
      { en: "Cooking phở at home", vi: "Nấu phở tại nhà" },
      { en: "Baking bread", vi: "Làm bánh mì" },
      { en: "Vietnamese phin coffee", vi: "Pha cà phê phin" },
    ],
  },
  {
    id: "tech",
    icon: "💻",
    color: "bg-[#d9ecff]",
    name: { en: "Tech & Creative", vi: "Công nghệ" },
    skills: [
      { en: "VJing with Resolume", vi: "VJ với Resolume" },
      { en: "Video editing", vi: "Dựng video" },
      { en: "Phone photography", vi: "Chụp ảnh bằng điện thoại" },
      { en: "Touch typing", vi: "Gõ phím 10 ngón" },
    ],
  },
];
