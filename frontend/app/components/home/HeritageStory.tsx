"use client";

import Image from "next/image";
import heritageImg from "../../images/homepage/HERITAGE.webp";
import styles from "../../styles/HeritageStory.module.css";
import type { HomepageData } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { optimizeImage } from "@/lib/cloudinary";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function HeritageStory({ content }: { content?: HomepageData["heritage"] }) {
  const heritage = content ?? {} as HomepageData["heritage"];
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.heading} style={resolveStyle(heritage.heading, lang) as React.CSSProperties} data-editable="heritage.heading"
          dangerouslySetInnerHTML={{ __html: resolveText(heritage.heading, lang) || t.home.heritageHeading }} />
        <p className={styles.intro} style={resolveStyle(heritage.intro, lang) as React.CSSProperties} data-editable="heritage.intro"
          dangerouslySetInnerHTML={{ __html: resolveText(heritage.intro, lang) || t.home.heritageIntro }} />
        <p className={styles.copy} style={resolveStyle(heritage.copy, lang) as React.CSSProperties} data-editable="heritage.copy"
          dangerouslySetInnerHTML={{ __html: resolveText(heritage.copy, lang) || t.home.heritageCopy }} />
        <p className={styles.tagline} style={resolveStyle(heritage.tagline, lang) as React.CSSProperties} data-editable="heritage.tagline"
          dangerouslySetInnerHTML={{ __html: resolveText(heritage.tagline, lang) || t.home.heritageTagline }} />
        <div className={styles.imageWrap} data-editable-image="heritage.image" suppressHydrationWarning>
          {heritage.image
            ? <img src={optimizeImage(heritage.image, 800)} alt="Heritage" className={styles.image} loading="eager" decoding="async" />
            : <Image src={heritageImg} alt="Heritage" className={styles.image} sizes="(max-width: 640px) 100vw, 420px" placeholder="blur" />
          }
        </div>
      </div>
    </section>
  );
}
