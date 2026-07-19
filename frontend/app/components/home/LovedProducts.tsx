"use client";

import Link from "next/link";
import { optimizeImage } from "@/lib/cloudinary";
import { productPath } from "@/lib/product-slug";
import styles from "../../styles/LovedProducts.module.css";
import type { HomepageData, Product } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useWishlist } from "../WishlistContext";
import { useCart } from "../CartContext";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const DEFAULTS = {
  title: "MOST LOVED PRODUCTS",
  copy: "Discover the fragrances our customers return to time and time again—crafted to leave a lasting impression and become part of their everyday story.",
  buttonText: "SHOP ALL",
  buttonLink: "/shop",
};

export default function LovedProducts({
  content,
  products = [],
}: {
  content?: HomepageData["lovedProducts"];
  products?: Product[];
}) {
  const lp = content ?? {} as HomepageData["lovedProducts"];
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { lang } = useLanguage();
  const t = getT(lang);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2
          className={styles.title}
          style={resolveStyle(lp.title, lang) as React.CSSProperties}
          data-editable="lovedProducts.title"
          dangerouslySetInnerHTML={{ __html: resolveText(lp.title, lang) || t.product.mostLoved }}
        />
        <p
          className={styles.copy}
          style={resolveStyle(lp.copy, lang) as React.CSSProperties}
          data-editable="lovedProducts.copy"
          dangerouslySetInnerHTML={{ __html: resolveText(lp.copy, lang) || t.product.mostLovedCopy }}
        />
      </div>

      {products.length > 0 && (
        <div className={styles.grid}>
          {products.map((product) => {
            const href = productPath(product);
            const isWishlisted = wishlistItems.some((w) => w.id === product.id);
            return (
              <div key={product.id} className={styles.card}>
                <div className={styles.cardImageWrap}>
                  <Link href={href} className={styles.cardImageLink}>
                    {product.images?.[0] ? (
                      <img
                        src={optimizeImage(product.images[0], 400)}
                        alt={product.name}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.cardPlaceholder} />
                    )}
                  </Link>
                  {/* Top-right icons */}
                  <div className={styles.cardIcons}>
                    <Link href={href} className={styles.cardIcon} title="Quick view">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </Link>
                    <button
                      className={styles.cardIcon}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      style={isWishlisted ? { color: "#c0392b" } : undefined}
                    >
                      <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>
                  <button
                    className={styles.cardBtn}
                    type="button"
                    onClick={() => addItem({
                      productId: product.id,
                      name: product.name,
                      image: product.images?.[0],
                      price: product.price,
                      size: product.sizes?.[0] || undefined,
                      variants: [],
                      quantity: 1,
                    })}
                  >{t.product.addToCart}</button>
                </div>
                <div className={styles.cardInfo}>
                  <Link href={href} className={styles.cardName}>
                    {product.name.toUpperCase()}
                  </Link>
                  <span className={styles.cardPrice}>{product.price} AED</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.footer}>
        <Link
          href={lp.buttonLink || DEFAULTS.buttonLink}
          className={styles.button}
          style={resolveStyle(lp.buttonText, lang) as React.CSSProperties}
          data-editable="lovedProducts.buttonText"
          dangerouslySetInnerHTML={{ __html: resolveText(lp.buttonText, lang) || t.product.shopAll }}
        />
      </div>
    </section>
  );
}
