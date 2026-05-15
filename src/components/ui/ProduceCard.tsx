"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FeaturedProduce } from "@/types";
import { TrustScore } from "@/components/ui/TrustScore";

type ProduceCardProps = {
  item: FeaturedProduce;
  href?: string;
};

const PLACEHOLDER = "/images/produce-placeholder.svg";

export function ProduceCard({ item, href = `/buyer/marketplace/${item.id}` }: ProduceCardProps) {
  const [imgSrc, setImgSrc] = useState(item.imageUrls[0] || PLACEHOLDER);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(PLACEHOLDER);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-warm)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--gotera-mist)]">
        <Image
          src={imgSrc}
          alt={`${item.nameEn} harvest`}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 280px"
          loading="lazy"
          onError={handleError}
          unoptimized={imgSrc === PLACEHOLDER}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--gotera-bark)] shadow-sm">
          Grade {item.grade}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{item.nameEn}</h3>
          <p className="font-display text-sm text-[var(--gotera-earth)]">{item.nameAm}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--gotera-earth)]">
          <span className="rounded-full bg-[var(--gotera-mist)] px-2 py-1 font-mono uppercase tracking-wide">
            {item.category}
          </span>
          <span>{item.region}</span>
          <span className="text-[var(--gotera-charcoal)]/70">· {item.farmerName}</span>
        </div>
        <TrustScore score={item.trustScore} reviews={12} className="justify-between" />
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--gotera-earth)]/10 pt-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--gotera-earth)]">Price / kg</p>
            <p className="font-accent text-2xl font-semibold text-[var(--gotera-green)]">
              {item.pricePerKg.toFixed(0)}{" "}
              <span className="text-base font-medium text-[var(--gotera-bark)]">ETB</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--gotera-earth)]">Available</p>
            <p className="font-accent text-lg font-semibold text-[var(--gotera-bark)]">{item.quantityKg.toFixed(0)} kg</p>
          </div>
        </div>
        <Link
          href={href}
          className="btn-primary w-full text-center text-sm"
          aria-label={`View ${item.nameEn} from ${item.farmerName}`}
        >
          View listing
        </Link>
      </div>
    </article>
  );
}
