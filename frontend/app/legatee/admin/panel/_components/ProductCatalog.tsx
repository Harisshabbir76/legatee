"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/api";
import DeleteProductButton from "./DeleteProductButton";
import catalogStyles from "@/app/styles/dashboard styling/catalog.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";
import PriceTag from "@/app/components/PriceTag";

// Merge both style objects so existing JSX (styles.xxx) keeps working
const styles = { ...catalogStyles, ...sharedStyles };

export default function ProductCatalog({ products: allProducts }: { products: Product[] }) {
  // Hide deleted products right away rather than waiting for the server refresh
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const products = allProducts.filter((p) => !removedIds.has(p.id));

  function setRemoved(id: string, removed: boolean) {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (removed) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (products.length === 0) {
    return (
      <p className={styles.empty}>
        No products yet. Add your first product to see it here.
      </p>
    );
  }

  return (
    <div className={styles.catalogGrid}>
      {products.map((product) => {
        const image = product.images[0] ?? product.ingredientsImage;
        const outOfStock = product.stock === 0;
        return (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImageWrap}>
              {outOfStock && <span className={styles.outOfStockBadge}>Out of stock</span>}
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={product.name} className={styles.productImage} />
              ) : (
                <span className={styles.productNoImage}>No image</span>
              )}
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}><PriceTag product={product} /></p>
              {typeof product.stock === "number" && (
                <p className={outOfStock ? styles.stockOut : styles.stockCount}>
                  {outOfStock ? "Out of stock" : `Stock: ${product.stock}`}
                </p>
              )}
              <div className={styles.productActions}>
                <Link href={`/legatee/admin/panel/products/${product.id}/edit`} className={styles.btnOutline}>
                  Edit
                </Link>
                <DeleteProductButton
                  id={product.id}
                  onDeleting={() => setRemoved(product.id, true)}
                  onDeleteFailed={() => setRemoved(product.id, false)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
