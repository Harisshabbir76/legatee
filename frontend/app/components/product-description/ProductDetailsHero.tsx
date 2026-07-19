"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { Product } from "@/lib/api";
import ProductActions from "./ProductActions";
import ProductAccordion from "./ProductAccordion";
import styles from "./ProductDescription.module.css";
import { optimizeImage } from "@/lib/cloudinary";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const FALLBACK_DESCRIPTION =
  "A captivating blend of juicy litchi, pear, and bergamot opens this fragrance, leading into a heart of Turkish rose, agarwood, and incense. It settles into a warm, sensual base of vanilla, musk, amber, and sandalwood-crafted for lasting elegance and depth.";

function buildFragranceNotes(ingredients: { name: string; description: string }[]): string {
  if (!ingredients || ingredients.length === 0) return "";
  return ingredients.map((ing) => ing.description ? `${ing.name}: ${ing.description}` : ing.name).join("\n");
}

function formatPrice(price: number): string {
  return `AED ${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatSize(size: string): string {
  return size.replace(/^(\d+)\s*ml$/i, "$1 ml");
}

export default function ProductDetailsHero({ product, categoryLabel, categorySlug }: { product: Product; categoryLabel?: string; categorySlug?: string }) {
  const allImages = product.images.map((img) => optimizeImage(img, 900)).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const size = product.sizes[0] ? formatSize(product.sizes[0]) : "30 ml";
  const { lang } = useLanguage();
  const t = getT(lang);

  function scrollSlider(dir: "left" | "right") {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === "left" ? -110 : 110, behavior: "smooth" });
  }

  return (
    <section className={styles.heroOuter} suppressHydrationWarning>
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t.product.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&gt;</span>
        <Link href={categorySlug ? `/${categorySlug}` : "/shop"} className={styles.breadcrumbLink}>
          {categoryLabel ?? "Perfumes"}
        </Link>
        <span className={styles.breadcrumbSep}>&gt;</span>
        <strong className={styles.breadcrumbCurrent}>{product.name}</strong>
      </div>

      <div className={styles.heroSection}>
      <div className={styles.heroGrid}>
        <div className={styles.gallery}>
          {/* Main image */}
          <div className={styles.mainImageWrap}>
            {allImages[activeIndex] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={allImages[activeIndex]} alt={product.name} className={styles.mainImage} />
            ) : null}
          </div>

          {/* Thumbnail slider — only when there are multiple images */}
          {allImages.length > 1 && (
            <div className={styles.thumbnailSliderWrap}>
              {allImages.length > 3 && (
                <button
                  type="button"
                  className={styles.sliderArrow}
                  onClick={() => scrollSlider("left")}
                  aria-label="Scroll left"
                >
                  ‹
                </button>
              )}
              <div className={styles.thumbnailSlider} ref={sliderRef}>
                {allImages.map((image, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className={`${styles.thumbnail} ${index === activeIndex ? styles.thumbnailActive : ""}`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
              {allImages.length > 3 && (
                <button
                  type="button"
                  className={styles.sliderArrow}
                  onClick={() => scrollSlider("right")}
                  aria-label="Scroll right"
                >
                  ›
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.summary}>
          <p className={styles.category}>{product.category?.name ?? "PERFUME"}</p>
          <div className={styles.nameRow}>
            <h1>{product.name}</h1>
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </div>
          <p className={styles.stars} aria-label="Five star rating">
            {t.product.stars}
          </p>
          <p className={styles.description}>{product.description || FALLBACK_DESCRIPTION}</p>
          <p className={styles.size}>{t.product.size}: {size}</p>

          <ProductAccordion items={[
            ...(product.mood ? [{ title: t.product.mood, body: product.mood }] : []),
            { title: t.product.productDetails, body: product.description || FALLBACK_DESCRIPTION },
            ...(product.ingredients?.length ? [{ title: t.product.fragranceNotes, body: buildFragranceNotes(product.ingredients) }] : []),
            ...(product.howToUse ? [{ title: t.product.waysToUse, body: product.howToUse }] : []),
          ]} />

          <ProductActions product={product} />
        </div>
      </div>
      </div>
    </section>
  );
}
