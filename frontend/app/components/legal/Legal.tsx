"use client";

import Link from "next/link";
import styles from "../../styles/Legal.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";
import { resolveText, resolveStyle } from "@/lib/resolve-text"; // resolveStyle used for hero blocks
import type { LegalPageData } from "@/lib/api";
import { LEGAL_DEFAULT_INTRO, LEGAL_DEFAULT_SECTIONS, LEGAL_DEFAULT_OUTRO } from "@/lib/legal-defaults";

interface Props {
  content?: LegalPageData | null;
}

export default function Legal({ content }: Props = {}) {
  const { lang } = useLanguage();
  const t = getT(lang);

  const titleText  = content?.heroTitle ? resolveText(content.heroTitle, lang) || t.legal.title : t.legal.title;
  const titleStyle = content?.heroTitle ? resolveStyle(content.heroTitle, lang) as React.CSSProperties : {};
  const subText    = content?.heroSubtitle ? resolveText(content.heroSubtitle, lang) || t.legal.subtitle : t.legal.subtitle;
  const subStyle   = content?.heroSubtitle ? resolveStyle(content.heroSubtitle, lang) as React.CSSProperties : {};

  const intro      = content?.intro?.text?.trim() ? content.intro : LEGAL_DEFAULT_INTRO;
  const outro      = content?.outro?.text?.trim() ? content.outro : LEGAL_DEFAULT_OUTRO;
  const sections   = content?.sections?.length ? content.sections : LEGAL_DEFAULT_SECTIONS;
  const introText  = resolveText(intro, lang, intro.text);
  const introStyle = resolveStyle(intro, lang) as React.CSSProperties;
  const outroText  = resolveText(outro, lang, outro.text);
  const outroStyle = resolveStyle(outro, lang) as React.CSSProperties;


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

      <div className={styles.content}>
        {introText && (
          <p className={styles.policyLine} data-editable="intro" style={introStyle} dangerouslySetInnerHTML={{ __html: introText }} />
        )}
        {sections.map((sec, si) => (
          <div className={styles.policyBlock} key={si}>
            <h2 className={styles.policyTitle}>{resolveText(sec.title, lang, sec.title.text)}</h2>
            {sec.lines.map((line, li) => (
              <p className={styles.policyLine} key={li}>{resolveText(line, lang, line.text)}</p>
            ))}
          </div>
        ))}
        {outroText && (
          <p className={styles.policyLine} data-editable="outro" style={outroStyle} dangerouslySetInnerHTML={{ __html: outroText }} />
        )}
      </div>
    </section>
  );
}
