import "server-only";
import {
  buildDeliveryPlan,
  deliveryModeFromKinds,
  type DeliveryPlan,
} from "@/lib/delivery";
import type { StoreSettings } from "@/lib/settings";

type OrderForDelivery = {
  createdAt: Date;
  items: {
    product: {
      leadTimeMin: number;
      leadTimeMax: number;
      supplierConnection: { kind: string } | null;
    } | null;
  }[];
};

export function deliveryPlanForOrder(
  order: OrderForDelivery,
  settings: StoreSettings,
): DeliveryPlan {
  const products = order.items
    .map((item) => item.product)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  const mode = deliveryModeFromKinds(
    order.items.map((item) => item.product?.supplierConnection?.kind ?? "LOCAL"),
  );

  const leadTimeMin =
    products.length > 0
      ? Math.max(...products.map((product) => product.leadTimeMin))
      : mode === "LOCAL"
        ? settings.localLeadMin
        : settings.globalLeadMin;
  const leadTimeMax =
    products.length > 0
      ? Math.max(...products.map((product) => product.leadTimeMax))
      : mode === "LOCAL"
        ? settings.localLeadMax
        : settings.globalLeadMax;

  return buildDeliveryPlan({
    createdAt: order.createdAt,
    mode,
    leadTimeMin,
    leadTimeMax,
    cutoffHour: settings.dispatchCutoffHour,
  });
}
