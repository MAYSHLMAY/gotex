import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { DisputeRow } from "@/components/admin/DisputeRow";

export default async function AdminDisputesPage() {
  await requireRoles("ADMIN");

  const rows = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Disputes</p>
        <h1 className="section-heading">Mediation desk</h1>
      </div>
      <div className="grid gap-3">
        {rows.map((d) => (
          <DisputeRow key={d.id} dispute={{ id: d.id, reason: d.reason, status: d.status, orderId: d.orderId }} />
        ))}
        {rows.length === 0 ? <p className="text-sm text-[var(--gotera-earth)]">No disputes logged.</p> : null}
      </div>
    </div>
  );
}
