"use client";

import Image from "next/image";
import storyImg from "../../images/our-story/clouds.webp";
import manImage from "../../images/our-story/manImage.webp";
import styles from "../../styles/AboutHeritageStory.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { optimizeImage } from "@/lib/cloudinary";
import type { AboutPageData } from "@/lib/api";

interface Props {
  content?: AboutPageData["story"];
}

export default function HeritageStory({ content }: Props = {}) {
  const { lang } = useLanguage();
  const t = getT(lang);

  function rt(block: AboutPageData["story"]["heading"] | undefined, fallback: string) {
    return block ? (resolveText(block, lang) || fallback) : fallback;
  }
  function rs(block: AboutPageData["story"]["heading"] | undefined): React.CSSProperties {
    return block ? (resolveStyle(block, lang) as React.CSSProperties) : {};
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2
          className={styles.heading}
          data-editable="story.heading"
          style={{ whiteSpace: "pre-wrap", ...rs(content?.heading) }}
          dangerouslySetInnerHTML={{ __html: rt(content?.heading, t.ourStory.foundedHeading) }}
        />
        <p
          className={styles.intro}
          data-editable="story.intro"
          style={{ whiteSpace: "pre-wrap", ...rs(content?.intro) }}
          dangerouslySetInnerHTML={{ __html: rt(content?.intro, t.ourStory.foundedIntro) }}
        />
        <div className={styles.manWrap}>
          <Image src={manImage} alt="Founder illustration" className={styles.manImage} />
        </div>
        <p
          className={styles.vision}
          data-editable="story.copy"
          style={{ whiteSpace: "pre-wrap", ...rs(content?.copy) }}
          dangerouslySetInnerHTML={{ __html: rt(content?.copy, t.ourStory.visionText) }}
        />
      </div>

      <div className={styles.wideImageWrap} data-editable-image="story.storyImage">
        {content?.storyImage
          ? <img src={optimizeImage(content.storyImage, 1920)} alt="Seascape" className={styles.wideImage} />
          : <Image src={storyImg} alt="Seascape" className={styles.wideImage} sizes="100vw" />
        }
      </div>

      <div className={styles.inner2}>
        <p
          className={styles.copy}
          data-editable="story.philosophy"
          style={{ whiteSpace: "pre-wrap", ...rs(content?.philosophy) }}
          dangerouslySetInnerHTML={{ __html: rt(content?.philosophy, t.ourStory.copy1) }}
        />
        <p
          className={styles.copy}
          data-editable="story.philosophyStrong"
          style={{ whiteSpace: "pre-wrap", ...rs(content?.philosophyStrong) }}
          dangerouslySetInnerHTML={{ __html: rt(content?.philosophyStrong, t.ourStory.copy2) }}
        />
        <p
          className={styles.copy}
          data-editable="story.tagline"
          style={{ whiteSpace: "pre-wrap", ...rs(content?.tagline) }}
          dangerouslySetInnerHTML={{ __html: rt(content?.tagline, t.ourStory.copy3) }}
        />
      </div>
    </section>
  );
}
