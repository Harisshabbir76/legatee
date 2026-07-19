"use client";

import Image from "next/image";
import bottleImg from "../../images/homepage/why-choose-bottle.webp";
import tlImg from "../../images/homepage/tl.webp";
import trImg from "../../images/homepage/tr.webp";
import blImg from "../../images/homepage/bl.webp";
import brImg from "../../images/homepage/br.webp";
import bottomImg from "../../images/homepage/bottom.webp";
import { optimizeImage } from "@/lib/cloudinary";
import styles from "../../styles/WhyLegatee.module.css";
import type { HomepageData, ArrowConfig } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const DEFAULT_ARROW_IMAGES = {
  topLeft:     tlImg,
  topRight:    trImg,
  bottomLeft:  blImg,
  bottomRight: brImg,
  bottom:      bottomImg,
};

function Arrow({ position, config }: { position: keyof typeof DEFAULT_ARROW_IMAGES; config?: ArrowConfig }) {
  const style: React.CSSProperties = {
    ...(config?.width !== undefined       && { width: config.width }),
    ...(config?.marginTop !== undefined   && { marginTop: config.marginTop }),
    ...(config?.marginRight !== undefined && { marginRight: config.marginRight }),
    ...(config?.marginBottom !== undefined && { marginBottom: config.marginBottom }),
    ...(config?.marginLeft !== undefined  && { marginLeft: config.marginLeft }),
    ...(config?.paddingTop !== undefined   && { paddingTop: config.paddingTop }),
    ...(config?.paddingRight !== undefined && { paddingRight: config.paddingRight }),
    ...(config?.paddingBottom !== undefined && { paddingBottom: config.paddingBottom }),
    ...(config?.paddingLeft !== undefined  && { paddingLeft: config.paddingLeft }),
  };
  const src = config?.image ?? null;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={styles.arrow} style={style} />;
  }
  return <Image src={DEFAULT_ARROW_IMAGES[position]} alt="" className={styles.arrow} style={style} sizes="60px" />;
}

export default function WhyLegatee({ content }: { content?: HomepageData["whyChoose"] }) {
  const why = content ?? {} as HomepageData["whyChoose"];
  const { lang } = useLanguage();
  const t = getT(lang);

  function itemText(index: number): string {
    return resolveText(why?.items?.[index]?.title, lang) || t.home.whyItems[index];
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title} data-editable="whyChoose.sectionTitle" style={resolveStyle(why.sectionTitle, lang) as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: resolveText(why.sectionTitle, lang) || t.home.whyTitle }} />

      <div className={styles.layout}>
        <div className={styles.col}>
          <div className={styles.item}>
            <p className={`${styles.label} ${styles.labelTopLeft}`} data-editable="whyChoose.items.0.title" style={why.arrows?.topLeft?.labelMaxWidth ? { maxWidth: why.arrows.topLeft.labelMaxWidth } : undefined}>{itemText(0)}</p>
            <div className={styles.arrowWrap} data-editable-image="whyChoose.arrows.topLeft.image" suppressHydrationWarning>
              <Arrow position="topLeft" config={why.arrows?.topLeft} />
            </div>
          </div>
          <div className={styles.item}>
            <p className={`${styles.label} ${styles.labelBottomLeft}`} data-editable="whyChoose.items.2.title" style={why.arrows?.bottomLeft?.labelMaxWidth ? { maxWidth: why.arrows.bottomLeft.labelMaxWidth } : undefined}>{itemText(2)}</p>
            <div className={styles.arrowWrap} data-editable-image="whyChoose.arrows.bottomLeft.image" suppressHydrationWarning>
              <Arrow position="bottomLeft" config={why.arrows?.bottomLeft} />
            </div>
          </div>
        </div>

        <div className={styles.center}>
          <div className={styles.bottleWrap} data-editable-image="whyChoose.bottleImage" suppressHydrationWarning>
            {why.items?.[0]?.image
              ? <img src={optimizeImage(why.items[0].image!, 400)} alt="Legatee bottle" className={styles.bottle} />
              : <Image src={bottleImg} alt="Legatee bottle" className={styles.bottle} sizes="260px" placeholder="blur" />
            }
          </div>
          <div className={styles.bottomItem}>
            <div data-editable-image="whyChoose.arrows.bottom.image" suppressHydrationWarning>
              <Arrow position="bottom" config={why.arrows?.bottom} />
            </div>
            <p className={`${styles.label} ${styles.labelBottom}`} data-editable="whyChoose.items.4.title" style={why.arrows?.bottom?.labelMaxWidth ? { maxWidth: why.arrows.bottom.labelMaxWidth } : undefined}>{itemText(4)}</p>
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.item}>
            <div className={styles.arrowWrap} data-editable-image="whyChoose.arrows.topRight.image" suppressHydrationWarning>
              <Arrow position="topRight" config={why.arrows?.topRight} />
            </div>
            <p className={`${styles.label} ${styles.labelTopRight}`} data-editable="whyChoose.items.1.title" style={why.arrows?.topRight?.labelMaxWidth ? { maxWidth: why.arrows.topRight.labelMaxWidth } : undefined}>{itemText(1)}</p>
          </div>
          <div className={styles.item}>
            <div className={styles.arrowWrap} data-editable-image="whyChoose.arrows.bottomRight.image" suppressHydrationWarning>
              <Arrow position="bottomRight" config={why.arrows?.bottomRight} />
            </div>
            <p className={`${styles.label} ${styles.labelBottomRight}`} data-editable="whyChoose.items.3.title" style={why.arrows?.bottomRight?.labelMaxWidth ? { maxWidth: why.arrows.bottomRight.labelMaxWidth } : undefined}>{itemText(3)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
