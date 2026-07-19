"use client";

import styles from "./ProductDescription.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 4 L8 22 H15 L5 38 H17 L20 56 L23 38 H35 L25 22 H32 Z" fill="#173946" opacity="0.4" />
    </svg>
  );
}

export default function FragranceComposition() {
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <section className={styles.composition}>
      <p>{t.product.compositionText}</p>
      <div className={styles.treeRow} aria-hidden="true">
        <TreeIcon className={styles.treeIcon} />
        <TreeIcon className={styles.treeIcon} />
        <TreeIcon className={styles.treeIcon} />
      </div>
    </section>
  );
}
