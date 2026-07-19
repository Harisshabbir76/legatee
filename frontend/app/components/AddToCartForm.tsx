"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import type { Product } from "@/lib/api";
import { useLanguage } from "./LanguageContext";
import { getT } from "@/lib/translations";

function splitValues(values: string): string[] {
  return values
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = getT(lang);

  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const variant of product.variants) {
      const first = splitValues(variant.values)[0];
      if (first) initial[variant.name] = first;
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: size || undefined,
      variants: Object.entries(variantSelections).map(([name, value]) => ({ name, value })),
      quantity,
    });
    setAdded(true);
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      {product.sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink">{t.product.size}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                  size === s ? "border-maroon text-maroon" : "border-line text-ink hover:border-maroon"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.variants.map((variant) => (
        <div key={variant.id}>
          <p className="text-sm font-medium text-ink">{variant.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {splitValues(variant.values).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setVariantSelections((prev) => ({ ...prev, [variant.name]: option }))
                }
                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                  variantSelections[variant.name] === option
                    ? "border-maroon text-maroon"
                    : "border-line text-ink hover:border-maroon"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-ink">{t.product.quantity}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink hover:border-maroon"
          >
            &minus;
          </button>
          <span className="w-6 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink hover:border-maroon"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-md bg-maroon px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          {t.product.addToCart}
        </button>
        {added && (
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="rounded-md border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-maroon"
          >
            {t.product.viewCart}
          </button>
        )}
      </div>
    </div>
  );
}
