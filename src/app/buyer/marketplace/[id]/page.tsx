import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProduceActions } from "@/components/buyer/ProduceActions";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { TrustScore } from "@/components/ui/TrustScore";

type Params = { params: { id: string } };

export default async function MarketplaceProducePage({ params }: Params) {
  const produce = await prisma.produce.findUnique({
    where: { id: params.id },
    include: { farmer: { include: { user: true, cooperative: true } } },
  });
  if (!produce || !produce.isAvailable) notFound();

  const cover = produce.imageUrls[0] ?? "/favicon.ico";

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/buyer/marketplace" className="text-sm font-semibold text-[var(--gotera-earth)] hover:underline">
          ← Back to marketplace
        </Link>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--gotera-mist)]">
            <Image src={cover} alt={produce.nameEn} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="eyebrow">{produce.category}</p>
              <h1 className="font-display text-3xl font-semibold text-[var(--gotera-bark)]">{produce.nameEn}</h1>
              <p className="font-display text-lg text-[var(--gotera-earth)]">{produce.nameAm}</p>
            </div>
            <GoteraCard>
              <p className="text-sm text-[var(--gotera-earth)]">
                {produce.farmer.user.nameEn} · {produce.farmer.region} / {produce.farmer.woreda}
              </p>
              <div className="mt-3">
                <TrustScore score={produce.farmer.trustScore} reviews={24} />
              </div>
              {produce.farmer.cooperative ? (
                <p className="mt-3 text-xs text-[var(--gotera-earth)]">Cooperative: {produce.farmer.cooperative.name}</p>
              ) : null}
            </GoteraCard>
            <GoteraCard>
              <p className="font-accent text-3xl font-semibold text-[var(--gotera-green)]">{produce.pricePerKg.toFixed(0)} ETB / kg</p>
              <p className="text-sm text-[var(--gotera-earth)]">
                {produce.quantityKg.toFixed(1)} kg available · MOQ {produce.minOrderKg} kg · Grade {produce.grade}
              </p>
            </GoteraCard>
            <ProduceActions
              produceId={produce.id}
              farmerId={produce.farmerId}
              nameEn={produce.nameEn}
              pricePerKg={produce.pricePerKg}
              minOrderKg={produce.minOrderKg}
              maxKg={produce.quantityKg}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
