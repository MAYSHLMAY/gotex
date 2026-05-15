import Link from "next/link";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { requireSession } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function NotificationsPage() {
  const session = await requireSession();

  const rows = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1 className="section-heading">Notifications</h1>
        </div>
        <MarkAllReadButton />
      </div>
      <div className="grid gap-3">
        {rows.map((n) => (
          <GoteraCard key={n.id} className={n.read ? "opacity-70" : ""}>
            <p className="font-semibold text-[var(--gotera-bark)]">{n.title}</p>
            <p className="text-sm text-[var(--gotera-earth)]">{n.body}</p>
            {n.href ? (
              <Link className="mt-2 inline-block text-sm font-semibold hover:underline" href={n.href}>
                Open
              </Link>
            ) : null}
          </GoteraCard>
        ))}
        {rows.length === 0 ? <GoteraCard>No notifications yet.</GoteraCard> : null}
      </div>
    </div>
  );
}
