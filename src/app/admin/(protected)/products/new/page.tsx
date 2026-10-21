import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createProductAction } from "@/actions/admin-products";
import { AdminHeading } from "@/components/admin/admin-ui";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

const DEFAULTS: ProductFormValues = {
  name: "",
  tagline: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "Gifts",
  recipient: "For Her",
  occasion: "Everyday",
  badge: "",
  images: "",
  sizes: "",
  colors: "",
  stock: 25,
  sku: "",
  barcode: "",
  status: "ACTIVE",
  featured: false,
  tags: "",
  supplierConnectionId: "",
  supplierCost: "",
  supplierProductId: "",
  supplierSku: "",
  supplierUrl: "",
  supplierCurrency: "ZAR",
  shipsFrom: "South Africa",
  leadTimeMin: 2,
  leadTimeMax: 5,
  promoLabel: "",
  promoEndsAt: "",
};

export default async function NewProductPage() {
  const connections = await prisma.supplierConnection.findMany({
    where: { enabled: true },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
    select: { id: true, name: true, kind: true },
  });

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Catalogue"
        title="New piece"
        description="Add a piece to the atelier. Leave SKU and barcode blank to auto-generate identifiers, and leave imagery blank to use the generated portrait render."
        action={
          <Link href="/admin/products" className="btn-outline min-h-10 px-4 text-[9px]">
            <ArrowLeft className="size-3.5" aria-hidden />
            All products
          </Link>
        }
      />
      <ProductForm
        action={createProductAction}
        values={DEFAULTS}
        connections={connections}
        submitLabel="Create piece"
      />
    </div>
  );
}
