"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../../styles/Legal.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";
import { resolveText, resolveStyle } from "@/lib/resolve-text"; // resolveStyle used for hero blocks
import type { LegalPageData } from "@/lib/api";

interface Props {
  content?: LegalPageData | null;
}

export default function Legal({ content }: Props = {}) {
  const [activeTab, setActiveTab] = useState(0);
  const { lang } = useLanguage();
  const t = getT(lang);

  const titleText  = content?.heroTitle ? resolveText(content.heroTitle, lang) || t.legal.title : t.legal.title;
  const titleStyle = content?.heroTitle ? resolveStyle(content.heroTitle, lang) as React.CSSProperties : {};
  const subText    = content?.heroSubtitle ? resolveText(content.heroSubtitle, lang) || t.legal.subtitle : t.legal.subtitle;
  const subStyle   = content?.heroSubtitle ? resolveStyle(content.heroSubtitle, lang) as React.CSSProperties : {};


  return (
    <section className={styles.section}>
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t.legal.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{t.legal.breadcrumbCurrent}</span>
      </p>

      <div className={styles.header}>
        <h1
          className={styles.title}
          data-editable="heroTitle"
          style={{ whiteSpace: "pre-wrap", ...titleStyle }}
          dangerouslySetInnerHTML={{ __html: titleText }}
        />
        <p
          className={styles.subtitle}
          data-editable="heroSubtitle"
          style={{ whiteSpace: "pre-wrap", ...subStyle }}
          dangerouslySetInnerHTML={{ __html: subText }}
        />
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
              data-legal-tab={i}
            >
              {t.legal.tabs[i]}
              <span className={`${styles.tabArrow} no-rtl`}>{activeTab === i ? "▼" : "▶"}</span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {t.legal.tabsContent[activeTab]?.sections.map((sec, si) => (
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
