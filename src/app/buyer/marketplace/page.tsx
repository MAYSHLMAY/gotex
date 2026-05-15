import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { ProduceCard } from "@/components/ui/ProduceCard";
import type { FeaturedProduce } from "@/types";

export const dynamic = "force-dynamic";

type Props = { searchParams?: Record<string, string | string[] | undefined> };

export default async function MarketplacePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  const category = typeof searchParams?.category === "string" ? searchParams.category : undefined;
  const region = typeof searchParams?.region === "string" ? searchParams.region : undefined;
  const verifiedOnly = searchParams?.verified === "1";
  const deliveryOnly = searchParams?.delivery === "1";

  const farmerWhere: Prisma.FarmerWhereInput = {};
  if (region) farmerWhere.region = { equals: region, mode: "insensitive" };
  if (verifiedOnly) farmerWhere.user = { is: { verified: true } };

  const where: Prisma.ProduceWhereInput = {
    isAvailable: true,
    ...(Object.keys(farmerWhere).length ? { farmer: farmerWhere } : {}),
    ...(q
      ? {
          OR: [
            { nameEn: { contains: q, mode: "insensitive" } },
            { nameAm: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
    ...(deliveryOnly ? { deliveryOffered: true } : {}),
  };

  const rows = await prisma.produce.findMany({
    where,
    take: 48,
    orderBy: { updatedAt: "desc" },
    include: { farmer: { include: { user: true } } },
  });

  const featured: FeaturedProduce[] = rows.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameAm: p.nameAm,
    category: p.category,
    quantityKg: p.quantityKg,
    pricePerKg: p.pricePerKg,
    grade: p.grade,
    region: p.farmer.region,
    farmerName: p.farmer.user.nameEn,
    imageUrls: p.imageUrls,
    trustScore: p.farmer.trustScore,
  }));

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1 className="section-heading">Browse verified supply</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {session?.user ? (
            <Link className="btn-secondary" href="/buyer/dashboard">
              Buyer desk
            </Link>
          ) : (
            <Link className="btn-primary" href="/auth/login">
              Log in to order
            </Link>
          )}
          <Link className="btn-secondary" href="/">
            Home
          </Link>
        </div>
      </div>

      <form className="mx-auto mt-6 grid max-w-6xl gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:grid-cols-5" action="/buyer/marketplace" method="get">
        <input name="q" defaultValue={q} placeholder="Search" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
        <input name="category" defaultValue={category} placeholder="Category" className="rounded-lg border px-3 py-2 text-sm" />
        <input name="region" defaultValue={region} placeholder="Region" className="rounded-lg border px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--gotera-bark)]">
          <input type="checkbox" name="verified" value="1" defaultChecked={verifiedOnly} />
          Verified only
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--gotera-bark)]">
          <input type="checkbox" name="delivery" value="1" defaultChecked={deliveryOnly} />
          Delivery
        </label>
        <button className="btn-primary sm:col-span-5" type="submit">
          Apply filters
        </button>
      </form>

      <div className="mx-auto mt-8 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((item) => (
          <ProduceCard key={item.id} item={item} />
        ))}
      </div>
      {featured.length === 0 ? <p className="mx-auto mt-10 max-w-6xl text-sm text-[var(--gotera-earth)]">No listings match these filters.</p> : null}
    </div>
  );
}
