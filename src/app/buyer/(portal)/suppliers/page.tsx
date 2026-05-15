import Link from "next/link";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function BuyerSuppliersPage() {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const favorites = await prisma.favoriteFarmer.findMany({
    where: { buyerId },
    include: { farmer: { include: { user: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Suppliers</p>
        <h1 className="section-heading">Saved farmers</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Star farmers from marketplace listings — favorites sync here.</p>
      </div>
      <div className="grid gap-3">
        {favorites.map((f) => (
          <GoteraCard key={f.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{f.farmer.user.nameEn}</p>
              <p className="text-xs text-[var(--gotera-earth)]">{f.farmer.region}</p>
            </div>
            <Link className="btn-secondary" href={`/buyer/marketplace?region=${encodeURIComponent(f.farmer.region)}`}>
              View region listings
            </Link>
          </GoteraCard>
        ))}
        {favorites.length === 0 ? <GoteraCard>No favorites yet.</GoteraCard> : null}
      </div>
    </div>
  );
}
