import { requireRoles } from "@/lib/require-auth";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export default async function AdminSettingsPage() {
  await requireRoles("ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="section-heading">Commission & configs</h1>
      </div>
      <AdminSettingsForm />
    </div>
  );
}
