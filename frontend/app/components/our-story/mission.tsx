"use client";

import Image from "next/image";
import stripeBg from "../../images/our-story/stripe-bg.webp";
import towerImg from "../../images/our-story/tower.webp";
import styles from "../../styles/Mission.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

export default function Mission() {
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <section className={styles.section}>
      <div className={styles.missionWrap}>
        <div className={styles.stripesBg}>
          <Image src={stripeBg} alt="" fill className={styles.stripesImg} />
        </div>
        <p className={styles.missionText}>{t.ourStory.missionText}</p>
      </div>

      <div className={styles.visionWrap}>
        <p className={styles.visionText}>{t.ourStory.visionBig}</p>
        <div className={styles.towerWrap}>
          <Image src={towerImg} alt="Eiffel Tower" className={styles.towerImg} />
        </div>
      </div>

      <div className={styles.divider} />
    </section>
  );
}
