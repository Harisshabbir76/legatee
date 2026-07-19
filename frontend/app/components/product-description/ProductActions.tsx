"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import type { Product } from "@/lib/api";
import styles from "./ProductDescription.module.css";
// import TabbyPromoWidget from "../TabbyPromoWidget";
// import TamaraPromoWidget from "../TamaraPromoWidget";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [qty, setQty] = useState(1);
  const size = product.sizes[0] || undefined;

  function addToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size,
      variants: [],
      quantity: qty,
    });
  }

  function buyNow() {
    addToCart();
    router.push("/checkout");
  }

  const { lang } = useLanguage();
  const t = getT(lang);
  const isFav = isWishlisted(product.id);
  const outOfStock = product.stock === 0;

  return (
    <div className={styles.actions}>
      {outOfStock && (
        <p className={styles.outOfStockLabel}>{t.product.outOfStockLabel}</p>
      )}

      {/* Quantity stepper */}
      <div className={styles.quantityRow}>
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label={t.product.decreaseQty}
        >
          −
        </button>
        <span className={styles.qtyValue}>{qty}</span>
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={() => setQty((q) => q + 1)}
          aria-label={t.product.increaseQty}
        >
          +
        </button>
      </div>

      <button
        type="button"
        className={`${styles.addButton} ${outOfStock ? styles.disabled : ""}`}
        onClick={addToCart}
        disabled={outOfStock}
      >
        {outOfStock ? t.product.outOfStock : t.product.addToCart}
      </button>
      <button
        type="button"
        className={`${styles.buyButton} ${outOfStock ? styles.disabled : ""}`}
        onClick={buyNow}
        disabled={outOfStock}
      >
        {t.product.buyNow}
      </button>

      {/* Tabby & Tamara installment promo widgets — commented out
      <TabbyPromoWidget price={product.price} currency="AED" />
      <TamaraPromoWidget price={product.price} currency="AED" />
      */}
    </div>
  );
}
