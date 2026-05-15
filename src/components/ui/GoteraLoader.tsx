type GoteraLoaderProps = {
  label?: string;
  className?: string;
};

/**
 * Meskel-inspired rotating cross loader in gold.
 */
export function GoteraLoader({ label = "Loading", className = "" }: GoteraLoaderProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} role="status" aria-live="polite">
      <svg
        className="h-12 w-12 animate-spin text-[var(--gotera-gold)]"
        viewBox="0 0 64 64"
        style={{ animationDuration: "1.15s" }}
        aria-hidden
      >
        <path
          d="M32 6 L38 26 L58 26 L42 36 L48 56 L32 44 L16 56 L22 36 L6 26 L26 26 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.85" />
      </svg>
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--gotera-earth)]">
        {label}
      </span>
    </div>
  );
}
