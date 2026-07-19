"use client";

import { useState } from "react";
import styles from "../../styles/GotQuestions.module.css";
import type { ShopPageData } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";


interface Props {
  content?: ShopPageData["faq"];
  /** Controlled open indices — provided by the editor. When absent, component manages its own state. */
  openItems?: number[];
}

export default function GotQuestions({ content, openItems }: Props) {
  const [internalOpen, setInternalOpen] = useState<number | null>(null);
  const isControlled = openItems !== undefined;
  const { lang } = useLanguage();
  const t = getT(lang);

  const faq = content ?? {} as ShopPageData["faq"];
  const defaultItems = t.faq.items.slice(0, 5).map((d, i) => ({
    q: { text: `${i + 1}. ${d.q}`, style: {} },
    a: { text: d.a, style: {} },
  }));
  const items = faq.items?.length ? faq.items : defaultItems;

  function isOpen(i: number) {
    return isControlled ? openItems!.includes(i) : internalOpen === i;
  }

  function toggle(i: number) {
    if (!isControlled) {
      setInternalOpen((prev) => (prev === i ? null : i));
    }
    // In controlled (editor) mode the parent's handleCanvasClick drives openItems
  }

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h2
          className={styles.title}
          data-editable="faq.title"
          style={{ whiteSpace: "pre-wrap", ...resolveStyle(faq.title, lang) as React.CSSProperties }}
          dangerouslySetInnerHTML={{ __html: resolveText(faq.title, lang) || t.shop.gotQuestionsTitle }}
        />
        <p
          className={styles.copy}
          data-editable="faq.copy"
          style={{ whiteSpace: "pre-wrap", ...resolveStyle(faq.copy, lang) as React.CSSProperties }}
          dangerouslySetInnerHTML={{ __html: resolveText(faq.copy, lang) || t.shop.gotQuestionsCopy }}
        />

        <div className={styles.list}>
          {items.map((item, i) => (
            <div key={i} className={styles.item}>
              {/* Summary row */}
              <div className={`${styles.summary}${isOpen(i) ? ` ${styles.summaryOpen}` : ""}`} onClick={() => toggle(i)}>
                <span
                  data-editable={`faq.items.${i}.q`}
                  style={{ whiteSpace: "pre-wrap", flex: 1, ...resolveStyle(item.q, lang) as React.CSSProperties }}
                  dangerouslySetInnerHTML={{ __html: resolveText(item.q, lang) || "" }}
                />
                <span
                  className={`${styles.icon}${isOpen(i) ? ` ${styles.iconOpen}` : ""}`}
                  data-faq-toggle={String(i)}
                >
                  +
                </span>
              </div>

              {/* Answer — only rendered when open */}
              {isOpen(i) && (
                <p
                  className={styles.answer}
                  data-editable={`faq.items.${i}.a`}
                  style={{ whiteSpace: "pre-wrap", ...resolveStyle(item.a, lang) as React.CSSProperties }}
                  dangerouslySetInnerHTML={{ __html: resolveText(item.a, lang) || "" }}
                />
              )}
            </div>
          ))}
        </div>

        <a href="/faq" className={styles.faqBtn}>
          {t.shop.viewAllFaq}
        </a>
      </div>
    </section>
  );
}
