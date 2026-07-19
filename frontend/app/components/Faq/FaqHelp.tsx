"use client";

import Image from "next/image";
import Link from "next/link";
import faqIcon from "../../images/Faq/icon.webp";
import styles from "../../styles/Faq.module.css";
import type { FaqPageData, ContentBlock } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const b = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

interface Props {
  content?: Pick<FaqPageData, "helpIcon" | "helpTitle" | "helpCopy" | "helpButtonText" | "helpButtonLink"> | null;
}

export default function FaqHelp({ content }: Props) {
  const { lang } = useLanguage();
  const t = getT(lang);

  const helpTitle      = content?.helpTitle      || b(t.faq.helpTitle, "h2");
  const helpCopy       = content?.helpCopy       || b(t.faq.helpCopy);
  const helpButtonText = content?.helpButtonText || b(t.faq.helpButton, "span");
  const helpButtonLink = content?.helpButtonLink || "/contact-us";

  return (
    <section className={styles.help} aria-labelledby="faq-help-heading">
      <span data-editable-image="helpIcon" style={{ display: "inline-block" }} suppressHydrationWarning>
        {content?.helpIcon
          ? <img src={content.helpIcon} alt="" className={styles.helpIcon} style={{ objectFit: "contain" }} />
          : <Image src={faqIcon} alt="" className={styles.helpIcon} sizes="78px" placeholder="blur" />
        }
      </span>
      <h2 id="faq-help-heading" className={styles.helpTitle} data-editable="helpTitle" style={{ whiteSpace: "pre-wrap", ...resolveStyle(helpTitle, lang) as React.CSSProperties }}
        dangerouslySetInnerHTML={{ __html: resolveText(helpTitle, lang) }} />
      <p className={styles.helpCopy} data-editable="helpCopy" style={{ whiteSpace: "pre-wrap", ...resolveStyle(helpCopy, lang) as React.CSSProperties }}
        dangerouslySetInnerHTML={{ __html: resolveText(helpCopy, lang) }} />
      <Link href={helpButtonLink} className={styles.helpButton} data-editable="helpButtonText" style={{ whiteSpace: "pre-wrap", ...resolveStyle(helpButtonText, lang) as React.CSSProperties }}
        dangerouslySetInnerHTML={{ __html: resolveText(helpButtonText, lang) }} />
    </section>
  );
}
