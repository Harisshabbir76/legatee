"use client";

import Link from "next/link";
import styles from "../styles/StoreProductCard.module.css";
import type { Product } from "@/lib/api";
import { productPath } from "@/lib/product-slug";
import { optimizeImage } from "@/lib/cloudinary";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { useLanguage } from "./LanguageContext";
import { getT } from "@/lib/translations";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StoreProductCard({
  product,
  layout = "grid",
  collectionSlug,
}: {
  product: Product;
  layout?: "grid" | "list";
  collectionSlug?: string;
}) {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { lang } = useLanguage();
  const t = getT(lang);
  const image = optimizeImage(product.images[0], 600);
  const price = `${product.price.toLocaleString("en-US")} AED`;
  const href = productPath(product, collectionSlug);
  const outOfStock = product.stock === 0;
  const isWishlisted = wishlistItems.some((w) => w.id === product.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      size: product.sizes?.[0] || undefined,
      variants: [],
      quantity: 1,
    });
  }

  if (layout === "list") {
    return (
      <Link href={href} className={styles.listCard}>
        <div className={styles.listImageWrap}>
          {outOfStock && <span className={styles.outOfStockBadge}>{t.product.outOfStockLabel}</span>}
          {image
            ? <img src={image} alt={product.name} className={styles.listImage} loading="eager" decoding="async" />
            : <div className={styles.listImage} />
          }
        </div>
        <div className={styles.listInfo}>
          <h3 className={styles.listName}>{product.name}</h3>
          <p className={styles.listPrice}>{price}</p>
          {outOfStock && <p className={styles.outOfStockText}>{t.product.outOfStockLabel}</p>}
        </div>
      </Link>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrap} suppressHydrationWarning>
        <Link href={href} className={styles.cardImageLink}>
          {image
            ? <img src={image} alt={product.name} className={styles.cardImage} loading="eager" decoding="async" />
            : <div className={styles.cardPlaceholder} />
          }
        </Link>

        {outOfStock && <span className={styles.outOfStockBadge}>{t.product.outOfStockLabel}</span>}

        <div className={styles.cardIcons}>
          <Link href={href} className={styles.cardIcon} aria-label={t.product.viewProduct}>
            <EyeIcon />
          </Link>
          <button
            className={styles.cardIcon}
            aria-label={isWishlisted ? t.product.removeFromWishlist : t.product.addToWishlist}
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            style={isWishlisted ? { color: "#c0392b" } : undefined}
          >
            <HeartIcon filled={isWishlisted} />
          </button>
        </div>

        {!outOfStock && (
          <button className={styles.cardBtn} onClick={handleAddToCart}>{t.product.addToCart}</button>
        )}
      </div>

      <div className={styles.cardInfo}>
        <Link href={href} className={styles.cardName}>{product.name}</Link>
        <span className={styles.cardPrice}>{price}</span>
      </div>
    </div>
  );
}
