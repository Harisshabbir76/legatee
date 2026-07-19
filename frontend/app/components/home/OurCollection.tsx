"use client";

import Image from "next/image";
import Link from "next/link";
import monogram from "../../images/homepage/mon-collection.webp";
import styles from "../../styles/OurCollection.module.css";
import type { HomepageData, Collection } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { optimizeImage } from "@/lib/cloudinary";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function OurCollection({
  content,
  collections = [],
}: {
  content?: HomepageData["collection"];
  collections?: Collection[];
}) {
  const collection = content ?? {} as HomepageData["collection"];
  const { lang } = useLanguage();
  const t = getT(lang);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.monogramWrap} data-editable-image="collection.monogramImage" suppressHydrationWarning>
          {collection.monogramImage
            ? <img src={optimizeImage(collection.monogramImage, 200)} alt="" className={styles.monogram} />
            : <Image src={monogram} alt="" className={styles.monogram} />
          }
        </div>
        <h2 className={styles.title} style={resolveStyle(collection.title, lang) as React.CSSProperties} data-editable="collection.title"
          dangerouslySetInnerHTML={{ __html: resolveText(collection.title, lang) || t.home.collectionTitle }} />
        <p className={styles.copy} style={resolveStyle(collection.copy, lang) as React.CSSProperties} data-editable="collection.copy"
          dangerouslySetInnerHTML={{ __html: resolveText(collection.copy, lang) || t.home.collectionCopy }} />
      </div>

      {collections.length > 0 ? (
        <div className={styles.grid}>
          {collections.map((col) => (
            <Link key={col.id} href={`/shop?collection=${encodeURIComponent(col.name)}`} className={styles.card}>
              <div className={styles.cardImageWrap}>
                {col.image ? (
                  <img src={optimizeImage(col.image, 800)} alt={col.name} className={styles.cardImage} />
                ) : (
                  <div className={styles.cardPlaceholder} />
                )}
                <div className={styles.cardOverlay} />
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{col.name.toUpperCase()}</span>
                  <div className={styles.cardHoverContent}>
                    {col.description && (
                      <p className={styles.cardDescription}>{col.description}</p>
                    )}
                    <span className={styles.cardCta}>{t.home.collectionCta}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No collections yet. Add some from the dashboard.</p>
      )}
    </section>
  );
}
