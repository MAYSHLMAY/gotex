"use client";

import { useId } from "react";

type TrustScoreProps = {
  score: number;
  max?: number;
  reviews?: number;
  className?: string;
};

export function TrustScore({ score, max = 5, reviews, className = "" }: TrustScoreProps) {
  const gid = useId();
  const clamped = Math.min(max, Math.max(0, score));
  const full = Math.floor(clamped);
  const partial = clamped - full >= 0.5 ? 1 : 0;
  const empty = max - full - partial;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        aria-label={`Trust score ${clamped.toFixed(1)} out of ${max}`}
      >
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f-${i}`} gid={gid} filled />
        ))}
        {partial === 1 ? <Star key="p" gid={gid} filled={false} partial /> : null}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} gid={gid} filled={false} />
        ))}
      </div>
      <span className="font-accent text-sm font-semibold text-[var(--gotera-bark)]">
        {clamped.toFixed(1)}
      </span>
      {reviews != null ? (
        <span className="text-xs text-[var(--gotera-earth)]">({reviews} reviews)</span>
      ) : null}
    </div>
  );
}

function Star({
  filled,
  partial,
  gid,
}: {
  filled: boolean;
  partial?: boolean;
  gid: string;
}) {
  const gradId = `${gid}-half`;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="var(--gotera-gold)" />
          <stop offset="50%" stopColor="rgba(139,69,19,0.12)" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.7L12 16.9 6.8 19.4l1-5.7-4.2-4.1 5.8-.8L12 3.5z"
        fill={partial ? `url(#${gradId})` : filled ? "var(--gotera-gold)" : "rgba(139,69,19,0.15)"}
        stroke="var(--gotera-earth)"
        strokeWidth="0.6"
      />
    </svg>
  );
}
