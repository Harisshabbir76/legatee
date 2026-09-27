/** Minimal product shape needed to work out what a customer pays. */
export interface PricedProduct {
  price: number;
  discountedPrice?: number | null;
}

/** True when the admin set a discounted price lower than the original price. */
export function hasDiscount(product: PricedProduct): boolean {
  const d = product.discountedPrice;
  return typeof d === "number" && d >= 0 && d < product.price;
}

/** Price the customer actually pays — discounted price if set, else the original price. */
export function effectivePrice(product: PricedProduct): number {
  return hasDiscount(product) ? (product.discountedPrice as number) : product.price;
}
