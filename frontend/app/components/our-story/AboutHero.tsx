"use client";

import Image from "next/image";
import heroBg from "../../images/our-story/herosection.webp";
import archImg from "../../images/our-story/our-story-insert.webp";
import styles from "../../styles/AboutHero.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function AboutHero() {
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <>
      <section className={styles.section}>
        <Image src={heroBg} alt="" fill priority placeholder="blur" sizes="100vw" className={styles.background} />
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h1 className={styles.title}>{t.ourStory.heroTitle}</h1>
        </div>
      </section>
      <div className={styles.insetWrap}>
        <Image src={archImg} alt="Arabian archway courtyard" className={styles.insetImage} sizes="(max-width: 640px) 180px, 260px" placeholder="blur" />
      </div>
    </>
  );
}
