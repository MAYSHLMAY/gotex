import { CooperativeJoinForm } from "@/components/farmer/CooperativeJoinForm";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function FarmerCooperativePage() {
  const session = await requireRoles("FARMER");
  const farmerId = session.user.farmerId!;

  const [farmer, coops] = await Promise.all([
    prisma.farmer.findUnique({ where: { id: farmerId }, include: { cooperative: true } }),
    prisma.cooperative.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Cooperative mode</p>
        <h1 className="section-heading">Pool supply with neighbors</h1>
      </div>
      <GoteraCard>
        <p className="text-sm text-[var(--gotera-earth)]">
          Current group:{" "}
          <span className="font-semibold text-[var(--gotera-bark)]">{farmer?.cooperative?.name ?? "Independent"}</span>
        </p>
      </GoteraCard>
      <CooperativeJoinForm
        coops={coops.map((c) => ({ id: c.id, name: c.name, region: c.region }))}
        cooperativeId={farmer?.cooperativeId ?? null}
      />
    </div>
  );
}
