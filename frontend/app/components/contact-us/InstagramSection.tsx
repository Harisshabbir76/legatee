"use client";

import Image from "next/image";
import styles from "../../styles/ContactUs.module.css";
import { optimizeImage } from "@/lib/cloudinary";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";
import ig1 from "../../images/contact-us/ig1.webp";
import ig2 from "../../images/contact-us/ig2.webp";
import ig3 from "../../images/contact-us/ig3.webp";
import ig4 from "../../images/contact-us/ig4.webp";
import ig5 from "../../images/contact-us/ig5.webp";
import ig6 from "../../images/contact-us/ig6.webp";
import ig7 from "../../images/contact-us/ig7.webp";
import type { ContactPageData, ContentBlock } from "@/lib/api";

const b = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

const DEFAULT_IMAGES = [ig1, ig2, ig3, ig4, ig5, ig6, ig7];

interface Props { content?: ContactPageData | null }

export default function InstagramSection({ content }: Props) {
  const { lang } = useLanguage();
  const t = getT(lang);
  const instagramTitle  = content?.instagramTitle?.text?.trim()  ? content.instagramTitle  : b(t.contact.instagramTitle, "h2");
  const instagramCopy   = content?.instagramCopy?.text?.trim()   ? content.instagramCopy   : b(t.contact.instagramCopy);
  const instagramHandle = content?.instagramHandle?.text?.trim() ? content.instagramHandle : b("@legatee", "span");
  const handleLink      = content?.instagramHandleLink || "https://www.instagram.com/";

  const igKeys = ["igImage1","igImage2","igImage3","igImage4","igImage5","igImage6","igImage7"] as const;

  return (
    <section className={styles.instagram}>
      <div className={styles.instagramGrid} aria-hidden="true">
        {igKeys.map((key, index) => {
          const customUrl = content?.[key];
          return (
            <div
              className={styles.instagramSlot}
              key={key}
              data-editable-image={key}
              suppressHydrationWarning
            >
              {customUrl
                ? <img src={optimizeImage(customUrl, 600)} alt="" className={styles.instagramImage} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="eager" decoding="async" />
                : <Image src={DEFAULT_IMAGES[index]} alt="" className={styles.instagramImage} sizes="(max-width: 640px) 50vw, (max-width: 900px) 25vw, 14vw" placeholder="blur" />
              }
            </div>
          );
        })}
      </div>
    </section>
  );
}
