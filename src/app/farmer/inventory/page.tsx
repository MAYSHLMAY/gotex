import Link from "next/link";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { AIPriceCoach } from "@/components/farmer/AIPriceCoach";

export default async function FarmerInventoryPage() {
  const session = await requireRoles("FARMER");
  const farmerId = session.user.farmerId!;

  const rows = await prisma.produce.findMany({
    where: { farmerId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="section-heading">Your live Gotera listings</h1>
        </div>
        <Link href="/farmer/inventory/add" className="btn-primary inline-flex justify-center">
          Add produce
        </Link>
      </div>

      <div className="grid gap-4">
        {rows.map((p) => (
          <GoteraCard key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">
                {p.nameEn} · <span className="text-[var(--gotera-earth)]">{p.nameAm}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--gotera-earth)]">
                {p.category} · Grade {p.grade} · {p.quantityKg.toFixed(1)} kg @ {p.pricePerKg.toFixed(0)} ETB/kg
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <AIPriceCoach 
                produceName={p.nameEn}
                farmerPrice={p.pricePerKg}
                atikiltTeraPrice={p.atikiltTeraBaselinePrice ?? undefined}
                quantity={p.quantityKg}
              />
              <Link className="btn-secondary" href={`/farmer/inventory/${p.id}/edit`}>
                Edit
              </Link>
            </div>
          </GoteraCard>
        ))}
        {rows.length === 0 ? <GoteraCard>No listings yet — add your first crate.</GoteraCard> : null}
      </div>
    </div>
  );
}
