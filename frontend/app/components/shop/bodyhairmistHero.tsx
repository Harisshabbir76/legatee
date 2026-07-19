"use client";

import Image from "next/image";
import shopHero from "../../images/shop/shophero.webp";
import styles from "../../styles/ShopHero.module.css";
import type { ShopHeroData } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function BodyhairmistHero({ content }: { content?: ShopHeroData }) {
  const { lang } = useLanguage();
  const t = getT(lang);
  const hero = content ?? {} as ShopHeroData;
  return (
    <section className={styles.section} suppressHydrationWarning data-editable-image="bodyHairMist.hero.backgroundImage">
      {hero.backgroundImage
        ? <img src={hero.backgroundImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", zIndex: 0 }} />
        : <Image src={shopHero} alt="" fill priority placeholder="blur" sizes="100vw" className={styles.background} />
      }
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title} data-editable="bodyHairMist.hero.title" style={{ whiteSpace: "pre-wrap", ...resolveStyle(hero.title, lang) as React.CSSProperties }}
          dangerouslySetInnerHTML={{ __html: resolveText(hero.title, lang) || t.shop.bodyHairMistTitle }} />
        <p className={styles.copy} data-editable="bodyHairMist.hero.copy" style={{ whiteSpace: "pre-wrap", ...resolveStyle(hero.copy, lang) as React.CSSProperties }}
          dangerouslySetInnerHTML={{ __html: resolveText(hero.copy, lang) || t.shop.bodyHairMistCopy }} />
      </div>
    </section>
  );
}
