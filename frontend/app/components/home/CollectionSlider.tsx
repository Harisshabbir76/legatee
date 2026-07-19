"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StoreProductCard from "../StoreProductCard";
import type { Product } from "@/lib/api";
import styles from "../../styles/OurCollection.module.css";

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CollectionSlider({ products }: { products: Product[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const [vpWidth, setVpWidth] = useState(0);

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const per = window.innerWidth < 768 ? 2 : 3;
    setVpWidth(el.offsetWidth);
    setPerPage((prev) => {
      if (prev !== per) setPage(0);
      return per;
    });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const totalPages = Math.ceil(products.length / perPage);
  const cardWidth = vpWidth > 0 ? vpWidth / perPage : 0;

  function prev() { setPage((p) => Math.max(0, p - 1)); }
  function next() { setPage((p) => Math.min(totalPages - 1, p + 1)); }

  return (
    <div className={styles.sliderOuter}>
      {/* Viewport */}
      <div className={styles.sliderViewport} ref={viewportRef}>
        <div
          className={styles.sliderTrack}
          style={{ transform: `translateX(-${page * vpWidth}px)` }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className={styles.sliderItem}
              style={cardWidth > 0 ? { width: `${cardWidth}px` } : undefined}
            >
              <StoreProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {totalPages > 1 && (
        <div className={styles.sliderControls}>
          <button
            onClick={prev}
            disabled={page === 0}
            className={`${styles.sliderArrow} ${page === 0 ? styles.sliderArrowDisabled : ""}`}
            aria-label="Previous"
          >
            <ChevronLeft />
          </button>

          <div className={styles.sliderDots}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`${styles.sliderDot} ${i === page ? styles.sliderDotActive : ""}`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={page === totalPages - 1}
            className={`${styles.sliderArrow} ${page === totalPages - 1 ? styles.sliderArrowDisabled : ""}`}
            aria-label="Next"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
