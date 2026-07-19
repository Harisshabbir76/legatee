"use client";

import Image from "next/image";
import birdsImg from "../../images/homepage/birds.webp";
import monogramImg from "../../images/homepage/mono-6.webp";
import styles from "../../styles/BrandQuote.module.css";
import type { HomepageData } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { optimizeImage } from "@/lib/cloudinary";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function BrandQuote({ content }: { content?: HomepageData["brandQuote"] }) {
  const bq = content ?? {} as HomepageData["brandQuote"];
  const { lang } = useLanguage();
  const t = getT(lang);

  return (
    <section className={styles.section}>
      <div className={styles.imageWrap} data-editable-image="brandQuote.birdsImage" suppressHydrationWarning>
        {bq.birdsImage
          ? <img src={optimizeImage(bq.birdsImage, 1400)} alt="" className={styles.image} />
          : <Image src={birdsImg} alt="" className={styles.image} sizes="100vw" placeholder="blur" />
        }
      </div>
      <div className={styles.quoteWrap}>
        <h2 className={styles.heading} style={resolveStyle(bq.heading, lang) as React.CSSProperties} data-editable="brandQuote.heading"
          dangerouslySetInnerHTML={{ __html: resolveText(bq.heading, lang) || t.home.brandQuoteHeading }} />
        <p className={styles.copy} style={resolveStyle(bq.copy, lang) as React.CSSProperties} data-editable="brandQuote.copy"
          dangerouslySetInnerHTML={{ __html: resolveText(bq.copy, lang) || t.home.brandQuoteCopy }} />
      </div>
      <div className={styles.monogramRow} data-editable-image="brandQuote.monogramImage" suppressHydrationWarning>
        <Image src={monogramImg} alt="Monograms" className={styles.monogram} />
      </div>
    </section>
  );
}
