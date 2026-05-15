type TiletDividerProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

/**
 * Thin horizontal tilet-inspired geometric divider (habesha kemis motif).
 */
export function TiletDivider({
  className = "",
  "aria-hidden": ariaHidden = true,
}: TiletDividerProps) {
  return (
    <div className={`relative h-6 w-full ${className}`} aria-hidden={ariaHidden}>
      <svg
        className="h-full w-full text-[var(--gotera-gold)]"
        viewBox="0 0 800 24"
        preserveAspectRatio="none"
        role="presentation"
      >
        <defs>
          <pattern
            id="tilet-diamonds"
            x="0"
            y="0"
            width="32"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M16 2 L30 12 L16 22 L2 12 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.55"
            />
            <path
              d="M16 6 L24 12 L16 18 L8 12 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              opacity="0.35"
            />
          </pattern>
        </defs>
        <rect width="800" height="24" fill="url(#tilet-diamonds)" opacity="0.9" />
        <line
          x1="0"
          y1="12"
          x2="800"
          y2="12"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}
