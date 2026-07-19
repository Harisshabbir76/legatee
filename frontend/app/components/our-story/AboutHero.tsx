"use client";

import Image from "next/image";
import heroBg from "../../images/our-story/herosection.webp";
import archImg from "../../images/our-story/our-story-insert.webp";
import styles from "../../styles/AboutHero.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { optimizeImage } from "@/lib/cloudinary";
import type { AboutPageData } from "@/lib/api";

interface Props {
  content?: AboutPageData["hero"];
}

export default function AboutHero({ content }: Props = {}) {
  const { lang } = useLanguage();
  const t = getT(lang);

  const titleText  = content?.title ? resolveText(content.title, lang) || t.ourStory.heroTitle : t.ourStory.heroTitle;
  const titleStyle = content?.title ? (resolveStyle(content.title, lang) as React.CSSProperties) : {};

  return (
    <>
      <section className={styles.section} data-editable-image="hero.backgroundImage">
        {content?.backgroundImage
          ? <img src={optimizeImage(content.backgroundImage, 1920)} alt="" className={styles.background} />
          : <Image src={heroBg} alt="" fill priority placeholder="blur" sizes="100vw" className={styles.background} />
        }
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h1
            className={styles.title}
            data-editable="hero.title"
            style={{ whiteSpace: "pre-wrap", ...titleStyle }}
            dangerouslySetInnerHTML={{ __html: titleText }}
          />
        </div>
      </section>
      <div className={styles.insetWrap} data-editable-image="hero.insetImage">
        {content?.insetImage
          ? <img src={optimizeImage(content.insetImage, 400)} alt="Arabian archway courtyard" className={styles.insetImage} />
          : <Image src={archImg} alt="Arabian archway courtyard" className={styles.insetImage} sizes="(max-width: 640px) 180px, 260px" placeholder="blur" />
        }
      </div>
    </>
  );
}
