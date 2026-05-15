import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { VerifyToggle } from "@/components/admin/VerifyToggle";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function AdminUsersPage() {
  await requireRoles("ADMIN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { farmer: true, buyer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Users</p>
        <h1 className="section-heading">Directory</h1>
      </div>
      <div className="grid gap-3">
        {users.map((u) => (
          <GoteraCard key={u.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{u.nameEn}</p>
              <p className="text-xs text-[var(--gotera-earth)]">
                {u.role} · {u.phone} · {u.verified ? "Verified" : "Pending"}
              </p>
            </div>
            <VerifyToggle userId={u.id} verified={u.verified} />
          </GoteraCard>
        ))}
      </div>
    </div>
  );
}
