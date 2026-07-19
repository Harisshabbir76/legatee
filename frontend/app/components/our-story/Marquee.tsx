"use client";

import styles from "../../styles/AboutMarquee.module.css";
import type { AboutPageData } from "@/lib/api";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

interface Props {
  content?: AboutPageData["marquee"];
}

export default function Marquee({ content }: Props) {
  const { lang } = useLanguage();
  const t = getT(lang);

  const words = content?.words
    ? content.words.split("\n").map((w) => w.trim()).filter(Boolean)
    : t.marquee.words;

  return (
    <section className={styles.section} aria-hidden="true">
      <div className={styles.track}>
        {[0, 1].map((set) => (
          <div className={styles.group} key={set}>
            {words.map((word, i) => (
              <span className={styles.word} key={`${set}-${i}`}>
                {word}
                <span className={`${styles.dot} no-rtl`}>//</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
