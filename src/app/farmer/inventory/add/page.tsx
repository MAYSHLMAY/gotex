import { AddProduceForm } from "@/components/farmer/AddProduceForm";
import { requireRoles } from "@/lib/require-auth";

export default async function FarmerAddProducePage() {
  await requireRoles("FARMER");
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Inventory</p>
        <h1 className="section-heading">Add new produce</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Listings sync to the buyer marketplace as soon as you publish.</p>
      </div>
      <AddProduceForm />
    </div>
  );
}
