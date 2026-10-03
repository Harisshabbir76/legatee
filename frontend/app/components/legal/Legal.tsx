"use client";

import Link from "next/link";
import styles from "../../styles/Legal.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";
import { resolveText, resolveStyle } from "@/lib/resolve-text"; // resolveStyle used for hero blocks
import type { LegalPageData } from "@/lib/api";

interface Props {
  content?: LegalPageData | null;
}

const LEGAL_INTRO =
  "By accessing or purchasing from the LEGATEE website, you agree to the following terms, which are governed by the applicable laws of the United Arab Emirates.";

const LEGAL_SECTIONS = [
  {
    title: "Website & Intellectual Property",
    text: "All content on this website, including the LEGATEE name, logo, images, product photography, designs, and written content, belongs to LEGATEE and may not be copied or used without prior written permission.",
  },
  {
    title: "Products & Orders",
    text: "We aim to ensure that all product descriptions, images, prices, and availability are accurate. Prices are displayed in AED and may be updated when necessary. An order is confirmed once payment has been successfully received.",
  },
  {
    title: "Delivery",
    text: "Customers are responsible for providing accurate delivery details. Delivery times may vary depending on location and circumstances beyond our control.",
  },
  {
    title: "Returns & Exchanges",
    text: "Due to the nature of fragrance products, opened or used products may not be eligible for return or exchange. Any request will be handled according to LEGATEE’s Return & Exchange Policy and applicable UAE consumer-protection laws.",
  },
  {
    title: "Privacy",
    text: "Customer information is collected and used only where necessary to process orders, arrange delivery, provide customer support, and operate our services, in accordance with applicable UAE privacy laws.",
  },
  {
    title: "Governing Law",
    text: "These terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the jurisdiction of the competent UAE courts.",
  },
];

const LEGAL_OUTRO =
  "For any questions, please contact LEGATEE through the contact details provided on our website.";

export default function Legal({ content }: Props = {}) {
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

      <div className={styles.content}>
        <p className={styles.policyLine}>{LEGAL_INTRO}</p>
        {LEGAL_SECTIONS.map((sec) => (
          <div className={styles.policyBlock} key={sec.title}>
            <h2 className={styles.policyTitle}>{sec.title}</h2>
            <p className={styles.policyLine}>{sec.text}</p>
          </div>
        ))}
        <p className={styles.policyLine}>{LEGAL_OUTRO}</p>
      </div>
    </section>
  );
}
