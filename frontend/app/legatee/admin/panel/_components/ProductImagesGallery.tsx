"use client";

import formStyles from "@/app/styles/dashboard styling/product-form.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

// Merge both style objects so existing JSX (styles.xxx) keeps working
const styles = { ...formStyles, ...sharedStyles };

const MAX_IMAGES = 7;

export interface ImageSlot {
  id: string;
  url?: string;
  file?: File;
}

interface ProductImagesGalleryProps {
  rows: ImageSlot[];
  onChange: (rows: ImageSlot[]) => void;
}

export default function ProductImagesGallery({ rows, onChange }: ProductImagesGalleryProps) {
  const remaining = MAX_IMAGES - rows.length;

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const additions = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({ id: crypto.randomUUID(), file }));
    onChange([...rows, ...additions]);
  }

  function removeRow(id: string) {
    onChange(rows.filter((row) => row.id !== id));
  }

  return (
    <div>
      <div className={styles.galleryHeader}>
        <h3 className={styles.cardTitle}>Product images</h3>
        <label className={remaining > 0 ? styles.galleryAddLabel : styles.galleryAddLabelDisabled}>
          + Add image{remaining > 0 ? ` (${remaining} left)` : ""}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={remaining <= 0}
            style={{ display: "none" }}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <p className={styles.galleryHint}>Up to {MAX_IMAGES} images.</p>

      {rows.length === 0 ? (
        <p className={styles.galleryEmpty}>No images added.</p>
      ) : (
        <div className={styles.galleryGrid}>
          {rows.map((row) => (
            <div key={row.id} className={styles.gallerySlot}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.url ?? (row.file ? URL.createObjectURL(row.file) : "")}
                alt=""
                className={styles.galleryImg}
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className={styles.galleryRemove}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
