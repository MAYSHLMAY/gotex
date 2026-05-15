import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function FarmerProfilePage() {
  const session = await requireRoles("FARMER");
  const farmer = await prisma.farmer.findUnique({
    where: { id: session.user.farmerId! },
    include: { user: true, cooperative: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Profile</p>
        <h1 className="section-heading">Account & farm facts</h1>
      </div>
      <GoteraCard>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Name</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{farmer?.user.nameEn}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Phone</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{farmer?.user.phone}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Region</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{farmer?.region}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Woreda</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{farmer?.woreda}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Verified</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{farmer?.user.verified ? "Yes" : "Pending"}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Cooperative</dt>
            <dd className="font-semibold text-[var(--gotera-bark)]">{farmer?.cooperative?.name ?? "—"}</dd>
          </div>
        </dl>
      </GoteraCard>
    </div>
  );
}
