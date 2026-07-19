"use client";

import Link from "next/link";
import styles from "./styles/ErrorPage.module.css";
import { useLanguage } from "./components/LanguageContext";
import { getT } from "@/lib/translations";

export default function NotFound() {
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <p className={styles.code}>{t.notFound.code}</p>
        <p className={styles.eyebrow}>{t.notFound.eyebrow}</p>
        <p className={styles.copy}>{t.notFound.copy}</p>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.primary}>{t.notFound.explore}</Link>
          <Link href="/" className={styles.secondary}>{t.notFound.goHome}</Link>
        </div>
      </div>
      <div className={styles.divider} style={{ marginTop: 48 }} />
    </main>
  );
}
