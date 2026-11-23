export default function Credit({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-sm text-ink/50 ${className}`}>
      Built by <span className="font-semibold text-ink/70">Danny Xa</span> ·{" "}
      <a href="https://5spicesagency.com" target="_blank" rel="noopener" className="font-semibold text-brand-dark hover:underline">
        5 Spices Agency
      </a>
    </p>
  );
}
