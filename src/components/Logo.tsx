export default function Logo({ size = 32 }: { size?: number }) {
  // Three rising steps — the whole idea of the app in one mark.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#17152a" />
      <rect x="6" y="19" width="6" height="7" rx="1.5" fill="#ff5a36" />
      <rect x="13" y="13" width="6" height="13" rx="1.5" fill="#ff8a6b" />
      <rect x="20" y="7" width="6" height="19" rx="1.5" fill="#ffffff" />
    </svg>
  );
}
