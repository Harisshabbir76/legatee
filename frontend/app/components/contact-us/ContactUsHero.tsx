"use client";

import Image from "next/image";
import contactHero from "../../images/contact-us/banner.webp";
import styles from "../../styles/ContactUs.module.css";
import type { ContactPageData, ContentBlock } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { optimizeImage } from "@/lib/cloudinary";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const b = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

interface Props { content?: ContactPageData | null }

export default function ContactUsHero({ content }: Props) {
  const { lang } = useLanguage();
  const t = getT(lang);
  const heroTitle = content?.heroTitle?.text?.trim() ? content.heroTitle : b(t.contact.heroTitle, "h1");

  return (
    <section className={styles.hero} suppressHydrationWarning data-editable-image="heroImage">
      {content?.heroImage
        ? <img src={optimizeImage(content.heroImage, 1920)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -10 }} />
        : <Image src={contactHero} alt="" fill priority placeholder="blur" sizes="100vw" className={styles.heroImage} />
      }
      <div className={styles.heroOverlay} />
      <h1
        className={styles.heroTitle}
        data-editable="heroTitle"
        style={{ whiteSpace: "pre-wrap", ...resolveStyle(heroTitle, lang) as React.CSSProperties }}
        dangerouslySetInnerHTML={{ __html: resolveText(heroTitle, lang) }}
      />
    </section>
  );
}
