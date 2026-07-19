"use client";

import React from "react";
import Link from "next/link";
import styles from "../../styles/ShopHero.module.css";
import type { ShopHeroData } from "@/lib/api";
import { resolveText } from "@/lib/resolve-text";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function ShopHero({
  content,
  title: titleOverride,
  copy: copyOverride,
  titleStyle,
  copyStyle,
  dataEditableTitle,
  dataEditableCopy,
  backgroundImage: bgOverride,
}: {
  content?: ShopHeroData;
  title?: string;
  copy?: string;
  titleStyle?: React.CSSProperties;
  copyStyle?: React.CSSProperties;
  dataEditableTitle?: string;
  dataEditableCopy?: string;
  backgroundImage?: string;
}) {
  const hero = content ?? {} as ShopHeroData;
  const { lang } = useLanguage();
  const t = getT(lang);
  const titleText = titleOverride || resolveText(hero.title, lang) || t.shop.title;
  const copyText = copyOverride || resolveText(hero.copy, lang) || t.shop.copy;
  const breadcrumbLabel = titleOverride || t.shop.title;
  return (
    <section className={styles.section}>
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t.shop.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{breadcrumbLabel}</span>
      </div>
      <h1 className={styles.title} style={{ whiteSpace: "pre-wrap", ...titleStyle }} data-editable={dataEditableTitle} dangerouslySetInnerHTML={{ __html: titleText }} />
      <p className={styles.copy} style={{ whiteSpace: "pre-wrap", ...copyStyle }} data-editable={dataEditableCopy} dangerouslySetInnerHTML={{ __html: copyText }} />
      <div className={styles.divider} />
    </section>
  );
}
