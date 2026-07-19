"use client";

import Image from "next/image";
import storyImg from "../../images/our-story/clouds.webp";
import manImage from "../../images/our-story/manImage.webp";
import styles from "../../styles/AboutHeritageStory.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function HeritageStory() {
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>{t.ourStory.foundedHeading}</h2>
        <p className={styles.intro}>{t.ourStory.foundedIntro}</p>
        <div className={styles.manWrap}>
          <Image src={manImage} alt="Founder illustration" className={styles.manImage} />
        </div>
        <p className={styles.vision}>
          <strong>{t.ourStory.visionLabel}</strong> <br />
          {t.ourStory.visionText}
        </p>
      </div>

      <div className={styles.wideImageWrap}>
        <Image src={storyImg} alt="Seascape" className={styles.wideImage} sizes="100vw" />
      </div>

      <div className={styles.inner2}>
        <p className={styles.copy}>{t.ourStory.copy1}</p>
        <p className={styles.copy}>{t.ourStory.copy2}</p>
        <p className={styles.copy}>{t.ourStory.copy3}</p>
      </div>
    </section>
  );
}
