"use client";

import { HarvestPlanForm } from "@/components/farmer/HarvestPlanForm";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { useEffect, useState } from "react";

interface HarvestPlan {
  id: string;
  nameEn: string;
  nameAm: string;
  quantityKg: number;
  harvestDate: string;
  notes?: string;
}

export default function FarmerCalendarPage() {
  const [plans, setPlans] = useState<HarvestPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    const res = await fetch("/api/farmer/harvest-plans");
    const data = await res.json();
    setPlans(data.data || []); // 👈 Changed: data.data
    setLoading(false);
  };

  const removePlan = async (id: string) => {
    if (!confirm("Remove this harvest plan?")) return;
    await fetch(`/api/farmer/harvest-plans/${id}`, { method: "DELETE" });
    loadPlans();
  };

  useEffect(() => {
    loadPlans();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="eyebrow">Harvest calendar</p>
          <h1 className="section-heading">Signal upcoming abundance</h1>
        </div>
        <GoteraCard>Loading your harvest plans...</GoteraCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Harvest calendar</p>
        <h1 className="section-heading">Signal upcoming abundance</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Buyers can pre-order against these windows once matching is enabled.</p>
      </div>
      
      <HarvestPlanForm onSuccess={loadPlans} />
      
      <div className="grid gap-3">
        {plans.map((p) => (
          <GoteraCard key={p.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{p.nameEn}</p>
              <p className="text-xs text-[var(--gotera-earth)]">
                {p.quantityKg.toFixed(0)} kg · {new Date(p.harvestDate).toDateString()}
              </p>
            </div>
            <button
              className="btn-danger"
              type="button"
              onClick={() => removePlan(p.id)}
            >
              Remove
            </button>
          </GoteraCard>
        ))}
        {plans.length === 0 ? <GoteraCard>No upcoming harvests logged.</GoteraCard> : null}
      </div>
    </div>
  );
}