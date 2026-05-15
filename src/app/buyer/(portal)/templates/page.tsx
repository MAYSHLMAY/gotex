import { TemplateBuilderForm } from "@/components/buyer/TemplateBuilderForm";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function BuyerTemplatesPage() {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const rows = await prisma.procurementTemplate.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
    include: { lines: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Templates</p>
        <h1 className="section-heading">Smart procurement lists</h1>
      </div>
      <TemplateBuilderForm />
      <div className="grid gap-4">
        {rows.map((t) => (
          <GoteraCard key={t.id}>
            <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{t.name}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-[var(--gotera-earth)]">
              {t.lines.map((l) => (
                <li key={l.id}>
                  {l.nameEn} ({l.nameAm || "—"}) — {l.targetKg} kg
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[var(--gotera-earth)]">
              Auto-matching to best farmers can call `/api/produce` with these targets in a later iteration.
            </p>
          </GoteraCard>
        ))}
      </div>
    </div>
  );
}
