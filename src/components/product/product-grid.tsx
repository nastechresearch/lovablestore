import { ProductCard } from "@/components/product/product-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import type { StoreProduct } from "@/lib/products";

export function ProductGrid({
  products,
  priorityCount = 2,
  columns = 4,
  className = "",
}: {
  products: StoreProduct[];
  priorityCount?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 3
        ? "md:grid-cols-3 lg:grid-cols-3"
        : "md:grid-cols-3 lg:grid-cols-4";

  return (
    <StaggerGroup
      className={`grid grid-cols-2 gap-x-4 gap-y-9 lg:gap-x-6 lg:gap-y-12 ${columnClasses} ${className}`}
    >
      {products.map((product, index) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
