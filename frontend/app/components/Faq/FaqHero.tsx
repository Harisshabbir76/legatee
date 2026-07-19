"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../../styles/Faq.module.css";
import type { FaqPageData, ContentBlock } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const b = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

interface Props {
  content?: Pick<FaqPageData, "heroTitle" | "heroSubtitle" | "heroImage" | "items"> | null;
  openItems?: number[];
}

export default function FaqHero({ content, openItems }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { lang } = useLanguage();
  const t = getT(lang);

  const hasRealItems = content?.items && content.items.length > 0 && content.items.some((i) => i.q?.text?.trim());
  const items = hasRealItems
    ? content!.items
    : t.faq.items.map((item) => ({ q: b(item.q, "span"), a: b(item.a) }));

  function isOpen(i: number) {
    if (openItems !== undefined) return openItems.includes(i);
    return openIndex === i;
  }

  function toggle(i: number) {
    if (openItems !== undefined) return;
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <section className={styles.hero} aria-labelledby="faq-heading">
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t.faq.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{t.faq.breadcrumbCurrent}</span>
      </p>
      <h1 id="faq-heading" className={styles.title} data-editable="heroTitle"
        style={{ whiteSpace: "pre-wrap", ...resolveStyle(content?.heroTitle, lang) as React.CSSProperties }}
        dangerouslySetInnerHTML={{ __html: resolveText(content?.heroTitle, lang) || t.faq.title }} />
      <p className={styles.subtitle} data-editable="heroSubtitle"
        style={{ whiteSpace: "pre-wrap", ...resolveStyle(content?.heroSubtitle, lang) as React.CSSProperties }}
        dangerouslySetInnerHTML={{ __html: resolveText(content?.heroSubtitle, lang) || t.faq.subtitle }} />
      <div className={styles.panel}>
        <div className={styles.list}>
          {items.map((item, index) => {
            const open = isOpen(index);
            return (
              <div className={styles.item} key={index}>
                <button className={styles.question} type="button" aria-expanded={open} onClick={() => toggle(index)} data-faq-toggle={String(index)}>
                  <span data-editable={`items.${index}.q`} style={{ whiteSpace: "pre-wrap", ...resolveStyle(item.q, lang) as React.CSSProperties }}
                    dangerouslySetInnerHTML={{ __html: `${index + 1}. ` + (resolveText(item.q, lang) || "Question text") }} />
                  <span className={`${styles.plus} no-rtl`} aria-hidden="true" data-faq-toggle={String(index)}>
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <p className={styles.answer} data-editable={`items.${index}.a`} style={{ whiteSpace: "pre-wrap", ...resolveStyle(item.a, lang) as React.CSSProperties }}
                    dangerouslySetInnerHTML={{ __html: resolveText(item.a, lang) || "Answer text" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
