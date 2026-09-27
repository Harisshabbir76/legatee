import { effectivePrice, hasDiscount, type PricedProduct } from "@/lib/pricing";

const defaultFormat = (n: number) => `${n.toLocaleString("en-US")} AED`;

/**
 * Renders a product price. When the product has a discounted price, the
 * original price is shown crossed out next to it. `className` styles the
 * price the customer pays so each page keeps its own typography.
 */
export default function PriceTag({
  product,
  className,
  format = defaultFormat,
}: {
  product: PricedProduct;
  className?: string;
  format?: (n: number) => string;
}) {
  if (!hasDiscount(product)) {
    return <span className={className}>{format(product.price)}</span>;
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.5em", flexWrap: "wrap" }}>
      <del style={{ opacity: 0.55, fontSize: "0.85em", fontWeight: 400 }} aria-label={`Original price ${format(product.price)}`}>
        {format(product.price)}
      </del>
      <span className={className}>{format(effectivePrice(product))}</span>
    </span>
  );
}
