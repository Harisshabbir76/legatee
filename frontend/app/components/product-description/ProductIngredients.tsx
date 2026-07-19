"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/api";
import ingredientImage from "../../images/product-description/ingredients-img-1.webp";
import styles from "./ProductDescription.module.css";
import { optimizeImage } from "@/lib/cloudinary";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function ProductIngredients({ product }: { product: Product }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { lang } = useLanguage();
  const t = getT(lang);

  const ingredients = product.ingredients ?? [];
  if (ingredients.length === 0) return null;

  const cloudinaryUrl = product.ingredientsImage
    ? optimizeImage(product.ingredientsImage, 600)
    : null;

  return (
    <section className={styles.ingredientsSection}>
      <div className={styles.ingredientsGrid}>
        <div className={styles.ingredientImageWrap}>
          {cloudinaryUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryUrl}
              alt="Product ingredients"
              className={styles.ingredientImage}
              loading="eager"
              decoding="async"
            />
          ) : (
            <Image
              src={ingredientImage}
              alt="Product ingredients"
              className={styles.ingredientImage}
              sizes="(max-width: 768px) 90vw, 580px"
              placeholder="blur"
              priority
            />
          )}
        </div>

        <div className={styles.notesPanel}>
          <h2>{t.product.ingredientsTitle}</h2>
          <div className={styles.notesList}>
            {ingredients.map((ingredient, i) => (
              <div className={styles.noteRow} key={ingredient.name}>
                <button
                  type="button"
                  className={styles.noteRowSummary}
                  aria-expanded={openIndex === i}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  {ingredient.name.toUpperCase()}
                </button>
                {openIndex === i && (
                  <div className={styles.noteBody}>
                    <p>{ingredient.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
