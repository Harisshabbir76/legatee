"use client";

import Link from "next/link";
import styles from "./styles/ErrorPage.module.css";
import { useLanguage } from "./components/LanguageContext";
import { getT } from "@/lib/translations";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{t.error.eyebrow}</p>
        <h1 className={styles.heading}>{t.error.heading}</h1>
        <p className={styles.copy}>{t.error.copy}</p>
        <div className={styles.actions}>
          <button onClick={reset} className={styles.primary}>{t.error.tryAgain}</button>
          <Link href="/" className={styles.secondary}>{t.error.goHome}</Link>
        </div>
      </div>
      <div className={styles.divider} style={{ marginTop: 48 }} />
    </main>
  );
}
