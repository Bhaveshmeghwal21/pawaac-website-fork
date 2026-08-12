/**
 * Route-level loading state shown while Next.js streams a page.
 * A minimal, premium loading indicator that matches the site's design language.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-8 w-8">
          <span className="absolute inset-0 rounded-full border border-line" />
          <span
            className="absolute inset-0 rounded-full border border-t-fg/60"
            style={{ animation: "spin 0.9s linear infinite" }}
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Loading
        </span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
