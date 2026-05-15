import { notFound } from "next/navigation";
import { EditProduceForm } from "@/components/farmer/EditProduceForm";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export default async function FarmerEditProducePage({ params }: Params) {
  const session = await requireRoles("FARMER");
  const farmerId = session.user.farmerId!;

  const produce = await prisma.produce.findFirst({
    where: { id: params.id, farmerId },
  });
  if (!produce) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Inventory</p>
        <h1 className="section-heading">Edit listing</h1>
      </div>
      <EditProduceForm
        produce={{
          ...produce,
          harvestDate: produce.harvestDate.toISOString(),
        }}
      />
    </div>
  );
}
