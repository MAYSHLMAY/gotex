import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { VerifyToggle } from "@/components/admin/VerifyToggle";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function AdminVerificationPage() {
  await requireRoles("ADMIN");

  const users = await prisma.user.findMany({
    where: { verified: false },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Verification</p>
        <h1 className="section-heading">IDs & licenses</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Document previews can plug into Supabase Storage or Cloudinary.</p>
      </div>
      <div className="grid gap-3">
        {users.map((u) => (
          <GoteraCard key={u.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{u.nameEn}</p>
              <p className="text-xs text-[var(--gotera-earth)]">
                {u.role} · {u.phone}
              </p>
            </div>
            <VerifyToggle userId={u.id} verified={u.verified} />
          </GoteraCard>
        ))}
        {users.length === 0 ? <GoteraCard>Queue is clear.</GoteraCard> : null}
      </div>
    </div>
  );
}
