"use client";

import Image from "next/image";
import icon1 from "../../images/our-story/1.svg";
import icon2 from "../../images/our-story/2.svg";
import icon3 from "../../images/our-story/3.svg";
import icon4 from "../../images/our-story/4.svg";
import icon5 from "../../images/our-story/5.svg";
import styles from "../../styles/Values.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const ICONS = [icon1, icon2, icon3, icon4, icon5];

export default function Values() {
  const { lang } = useLanguage();
  const t = getT(lang);
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t.ourStory.valuesHeading}</h2>
      <div className={styles.grid}>
        {t.ourStory.values.map((v, i) => (
          <div key={v.label} className={styles.item}>
            <div className={styles.icon}><Image src={ICONS[i]} alt={v.label} width={56} height={56} /></div>
            <p className={styles.label}>{v.label}</p>
            <p className={styles.description}>{v.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
