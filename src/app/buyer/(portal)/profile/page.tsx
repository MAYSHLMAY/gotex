import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function BuyerProfilePage() {
  const session = await requireRoles("BUYER");
  const buyer = await prisma.buyer.findUnique({
    where: { id: session.user.buyerId! },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Profile</p>
        <h1 className="section-heading">Business identity</h1>
      </div>
      <GoteraCard>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Business</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{buyer?.businessName}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Contact</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{buyer?.user.nameEn}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Phone</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{buyer?.user.phone}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">City</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{buyer?.city}</dd>
          </div>
        </dl>
      </GoteraCard>
    </div>
  );
}
