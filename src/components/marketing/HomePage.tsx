import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { ProduceCard } from "@/components/ui/ProduceCard";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { TiletDivider } from "@/components/ui/TiletDivider";
import { FloatingProduce } from "@/components/marketing/FloatingProduce";
import { AuthAwareHeader } from "@/components/marketing/AuthAwareHeader";
import type { FeaturedProduce } from "@/types";

const GoteraMap = dynamic(() => import('@/components/shared/GoteraMap'), { ssr: false });

async function loadFeatured(): Promise<FeaturedProduce[]> {
  try {
    const rows = await prisma.produce.findMany({
      where: { isAvailable: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        farmer: {
          include: { user: { select: { nameEn: true } } },
        },
      },
    });
    return rows.map((p) => ({
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
  } catch {
    return [];
  }
}

async function loadStats() {
  try {
    const [farmers, buyers, orders] = await Promise.all([
      prisma.farmer.count(),
      prisma.buyer.count(),
      prisma.order.count(),
    ]);
    return { farmers, buyers, orders, deliveries: orders, etbSaved: farmers * 12000 };
  } catch {
    return { farmers: 0, buyers: 0, orders: 0, deliveries: 0, etbSaved: 0 };
  }
}

async function loadFarmersForMap() {
  try {
    const farmers = await prisma.farmer.findMany({
      take: 20,
      include: {
        user: { select: { nameEn: true } },
        produce: { select: { nameEn: true }, take: 5 },
      },
    });
    return farmers.map((f) => ({
      id: f.id,
      name: f.user.nameEn,
      lat: f.lat,
      lng: f.lng,
      produce: f.produce.map((p) => p.nameEn),
    }));
  } catch {
    return [];
  }
}

export async function HomePage() {
  const [featured, stats, farmersForMap] = await Promise.all([loadFeatured(), loadStats(), loadFarmersForMap()]);

  return (
    <div className="gotera-texture min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AuthAwareHeader />

      <main style={{ zIndex: 0 }}>
        <section className="relative z-0 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
              alt="Ethiopian highland fields at sunrise"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f06]/95 via-[#2b1a0d]/90 to-[#1d4a35]/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f06]/60 via-transparent to-transparent" />
          </div>
          <FloatingProduce />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:py-28">
            <div className="max-w-2xl space-y-6 text-[var(--gotera-cream)]">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-[var(--gotera-gold)]">Ancient granary · modern marketplace</p>
              <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                ጎተራ — From Farm to Your Kitchen, Without the Chaos
              </h1>
              <p className="text-lg text-[var(--gotera-mist)] sm:text-xl">
                Connect directly with Ethiopian farmers. Order fresh produce in bulk. No middlemen. No Atikilt Tera.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/auth/register?role=buyer" className="btn-primary min-w-[200px] justify-center">
                  I&apos;m a Buyer →
                </Link>
                <Link href="/auth/register?role=farmer" className="btn-secondary min-w-[200px] justify-center border-white/40 bg-white/10 text-white hover:bg-white/15">
                  I&apos;m a Farmer →
                </Link>
              </div>
            </div>
            <GoteraCard className="w-full max-w-md border-white/20 bg-white/10 text-white backdrop-blur-md lg:ml-auto">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-gold)]">Why Gotera</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--gotera-mist)]">
                <li>Live inventory with freshness windows and quality grades.</li>
                <li>Procurement templates, RFQs, and cooperative bulk listings.</li>
                <li>Delivery tracking, bilingual chat, and transparent ETB pricing.</li>
              </ul>
            </GoteraCard>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-4 text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="section-heading">Three calm steps, endless harvests</h2>
            <TiletDivider className="mx-auto max-w-3xl py-2" />
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <GoteraCard>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Step 1</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-[var(--gotera-bark)]">Farmers list their harvest</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--gotera-earth)]">
                Agrotera partners capture stock in Amharic and English, with grades, MOQ, and delivery radius from their kebele.
              </p>
            </GoteraCard>
            <GoteraCard>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Step 2</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-[var(--gotera-bark)]">You browse and order</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--gotera-earth)]">
                Buyers explore the marketplace, templates, and RFQs with filters for freshness, distance, and verified suppliers.
              </p>
            </GoteraCard>
            <GoteraCard>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Step 3</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-[var(--gotera-bark)]">Fresh produce delivered</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--gotera-earth)]">
                Orders move from confirmed to delivered with chat, photos, SMS alerts, and invoices ready for finance teams.
              </p>
            </GoteraCard>
          </div>
        </section>

        <section className="border-y border-[var(--gotera-earth)]/10 bg-[#efe7dc]">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            <Stat label="Verified farmers" value={stats.farmers || "—"} hint="IDs + kebele checks" />
            <Stat label="Buyers onboarded" value={stats.buyers || "—"} hint="Hotels & kitchens" />
            <Stat label="Deliveries logged" value={stats.deliveries || "—"} hint="Across Ethiopia" />
            <Stat label="ETB procurement saved" value={stats.etbSaved ? `${stats.etbSaved.toLocaleString()}+` : "—"} hint="Vs. informal market" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">Voices from the soil</p>
              <h2 className="section-heading">Trusted by chefs and growers</h2>
              <TiletDivider className="py-3" />
              <div className="mt-6 space-y-4">
                <GoteraCard>
                  <p className="font-accent text-lg text-[var(--gotera-bark)]">
                    “We finally see which farm each crate came from — guests taste the difference.”
                  </p>
                  <p className="mt-3 text-sm text-[var(--gotera-earth)]">Hotel procurement lead · Addis Ababa</p>
                </GoteraCard>
                <GoteraCard>
                  <p className="font-accent text-lg text-[var(--gotera-bark)]">
                    “My tomatoes stay priced fairly and buyers pay on time through Gotera.”
                  </p>
                  <p className="mt-3 text-sm text-[var(--gotera-earth)]">Farmer · Oromia highlands</p>
                </GoteraCard>
              </div>
            </div>
            <div id="map" className="min-h-[320px]">
              <GoteraMap farmers={farmersForMap} />
            </div>
          </div>
        </section>

        <section id="produce" className="bg-[var(--gotera-mist)]/60 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Featured produce</p>
                <h2 className="section-heading">Live listings from the ledger</h2>
              </div>
              <Link href="/buyer/marketplace" className="btn-secondary">
                Open marketplace
              </Link>
            </div>
            <TiletDivider className="py-4" />
            {featured.length === 0 ? (
              <GoteraCard className="mt-6">
                <p className="text-sm text-[var(--gotera-earth)]">
                  No listings yet. Configure <span className="font-mono text-xs">DATABASE_URL</span>, run{" "}
                  <span className="font-mono text-xs">npx prisma db push</span>, then{" "}
                  <span className="font-mono text-xs">npm run db:seed</span> to load demo inventory.
                </p>
              </GoteraCard>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featured.map((item) => (
                  <ProduceCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-[var(--gotera-gold)] bg-[var(--gotera-bark)] text-[var(--gotera-cream)]">
        <TiletDivider className="text-[var(--gotera-gold)]" />
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-2xl font-semibold">ጎተራ</p>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Gotera digitizes the spirit of Atikilt Tera with structured trust, transparent pricing, and logistics built for Ethiopian B2B kitchens.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              Built in Addis Ababa 🇪🇹
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-gold)]">Explore</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link className="hover:text-white" href="/buyer/marketplace">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="/farmer/dashboard">
                    Farmer dashboard
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="/messages">
                    Gotera Chat
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-gold)]">Legal</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a className="hover:text-white" href="#">
                    Privacy
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Terms
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="mailto:hello@gotera.et">
                    hello@gotera.et
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--gotera-earth)]/15 bg-[var(--gotera-cream)] p-4 shadow-inner">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gotera-earth)]">{label}</p>
      <p className="font-accent mt-2 text-3xl font-semibold text-[var(--gotera-green)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--gotera-earth)]">{hint}</p>
    </div>
  );
}
