"use client";

import Image from "next/image";
import Link from "next/link";
import heroBg from "../../images/homepage/herosection.webp";
import styles from "../../styles/HeroSection.module.css";
import { optimizeImage } from "@/lib/cloudinary";
import type { HomepageData } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

function omitCssOverrides(style: React.CSSProperties): React.CSSProperties {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fontSize, maxWidth, ...rest } = style as React.CSSProperties & { fontSize?: unknown; maxWidth?: unknown };
  return rest;
}

export default function HeroSection({ content }: { content?: HomepageData["hero"] }) {
  const hero = content ?? {} as HomepageData["hero"];
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <section className={styles.section} suppressHydrationWarning data-editable-image="hero.backgroundImage">
      {hero.backgroundImage
        ? <img src={optimizeImage(hero.backgroundImage, 1920)} alt="" className={styles.background} />
        : <Image src={heroBg} alt="" fill priority placeholder="blur" sizes="100vw" className={styles.background} />
      }
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title} style={{ whiteSpace: "pre-wrap", ...omitCssOverrides(resolveStyle(hero.title, lang) as React.CSSProperties) }} data-editable="hero.title"
          dangerouslySetInnerHTML={{ __html: resolveText(hero.title, lang) || t.home.heroTitle }} />
        <p className={styles.copy} style={{ whiteSpace: "pre-wrap", ...omitCssOverrides(resolveStyle(hero.copy, lang) as React.CSSProperties) }} data-editable="hero.copy"
          dangerouslySetInnerHTML={{ __html: resolveText(hero.copy, lang) || t.home.heroCopy }} />
        <Link href={hero.buttonLink || "/shop"} className={styles.button} style={{ whiteSpace: "pre-wrap", ...omitCssOverrides(resolveStyle(hero.buttonText, lang) as React.CSSProperties) }} data-editable="hero.buttonText"
          dangerouslySetInnerHTML={{ __html: resolveText(hero.buttonText, lang) || t.home.heroButton }} />
      </div>
    </section>
  );
}
