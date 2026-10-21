import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createConnectionAction } from "@/actions/admin-suppliers";
import { AdminHeading } from "@/components/admin/admin-ui";
import { SupplierForm, type ConnectionFormValues } from "@/components/admin/supplier-form";

export const dynamic = "force-dynamic";

const DEFAULTS: ConnectionFormValues = {
  name: "",
  provider: "CJ",
  kind: "CHINA",
  enabled: true,
  apiBaseUrl: "",
  defaultMarkupPct: 60,
  defaultCurrency: "USD",
  defaultShipsFrom: "China",
  defaultLeadMin: 10,
  defaultLeadMax: 18,
  notes: "",
};

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Sourcing"
        title="New connection"
        description="Connect a supplier, store encrypted credentials and set the defaults used when importing products."
        action={
          <Link href="/admin/suppliers" className="btn-outline min-h-10 px-4 text-[9px]">
            <ArrowLeft className="size-3.5" aria-hidden />
            All suppliers
          </Link>
        }
      />
      <SupplierForm action={createConnectionAction} values={DEFAULTS} hasCredentials={false} submitLabel="Create connection" />
    </div>
  );
}
