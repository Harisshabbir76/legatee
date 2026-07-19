"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../../styles/Legal.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function Legal() {
  const [activeTab, setActiveTab] = useState(0);
  const { lang } = useLanguage();
  const t = getT(lang);
  const tab = t.legal.tabsContent[activeTab];

  return (
    <section className={styles.section}>
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t.legal.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{t.legal.breadcrumbCurrent}</span>
      </p>

      <div className={styles.header}>
        <h1 className={styles.title}>{t.legal.title}</h1>
        <p className={styles.subtitle}>{t.legal.subtitle}</p>
      </div>

      <div className={styles.dividerLine} />

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          {t.legal.tabs.map((_, i) => (
            <button
              key={i}
              className={`${styles.tab} ${activeTab === i ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(i)}
              type="button"
            >
              {t.legal.tabs[i]}
              <span className={`${styles.tabArrow} no-rtl`}>{activeTab === i ? "▼" : "▶"}</span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {tab.sections.map((sec, si) => (
            <div className={styles.policyBlock} key={si}>
              <h2 className={styles.policyTitle}>{sec.title}</h2>
              {sec.lines.map((line, li) => (
                <p className={styles.policyLine} key={li}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
