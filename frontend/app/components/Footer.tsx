"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import messageicon from "../images/footer/footer-msg.webp";
import styles from "../styles/Footer.module.css";
import type { FooterData } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { useLanguage } from "./LanguageContext";
import { getT } from "@/lib/translations";


function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <g transform="translate(2.9 2.9) scale(0.76)">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.155 1.6 5.953L0 24l6.275-1.65A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0Zm0 22c-1.95 0-3.838-.495-5.495-1.435l-.394-.227-4.07 1.07 1.087-3.97-.256-.41A9.93 9.93 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10Z" />
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.149.347-.346.495-.521.149-.174.198-.298.297-.497.099-.198.05-.371-.05-.521-.099-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.05 3.131 4.967 4.39 2.918 1.26 2.918.84 3.443.79.525-.05 1.69-.69 1.927-1.36.238-.668.238-1.24.165-1.36-.073-.12-.273-.198-.57-.347Z" />
      </g>
    </svg>
  );
}

const DEFAULTS = {
  signatureTitle: "SOFTLY RARE. DEEPLY YOURS.\nCONNECT WITH US.",
  signatureCopy:  "Discover the world of LEGATEE and stay connected with the stories, inspirations, and fragrances that leave a lasting impression.",
  buttonText:     "@INSTAGRAM",
  buttonLink:     "https://www.instagram.com",
};

const LANG_LABELS = { en: { en: "English", ar: "Arabic" }, ar: { en: "English", ar: "العربية" } } as const;

export default function Footer({ content: propContent }: { content?: FooterData | null }) {
  const c = propContent ?? null;
  const { lang, setLang } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const t = getT(lang);

  const sigTitle = resolveText(c?.signatureTitle, lang) || t.footer.signatureTitle;
  const sigCopy  = resolveText(c?.signatureCopy, lang)  || t.footer.signatureCopy;
  const btnText  = resolveText(c?.buttonText, lang)     || t.footer.buttonText;
  const btnLink  = c?.buttonLink           || DEFAULTS.buttonLink;

  const footerLinks = [
    { label: t.footer.home,      href: "/" },
    { label: t.footer.shop,      href: "/shop" },
    { label: t.footer.ourStory,  href: "/our-story" },
    { label: t.footer.faq,       href: "/faq" },
    { label: t.footer.contactUs, href: "/contact-us" },
    { label: t.footer.legal,     href: "/legal" },
  ];

  return (
    <footer className={styles.footer}>
      {/* ── Upper band ── */}
      <div className={styles.upperBand}>
        <div className={styles.iconWrap} data-editable-image="footer.footerImage" suppressHydrationWarning>
          <Image src={messageicon} alt="" className={styles.icon} sizes="80px" placeholder="blur" />
        </div>

        <h3
          className={styles.heading}
          style={{ whiteSpace: "pre-wrap", ...resolveStyle(c?.signatureTitle, lang) as React.CSSProperties }}
          data-editable="footer.signatureTitle"
          dangerouslySetInnerHTML={{ __html: sigTitle }}
        />

        <p
          className={styles.copy}
          style={{ whiteSpace: "pre-wrap", ...resolveStyle(c?.signatureCopy, lang) as React.CSSProperties }}
          data-editable="footer.signatureCopy"
          dangerouslySetInnerHTML={{ __html: sigCopy }}
        />

        <Link href={btnLink} className={styles.button} data-editable="footer.buttonText"
          dangerouslySetInnerHTML={{ __html: btnText }} />
      </div>

      {/* ── Nav bar ── */}
      <div className={styles.navBar}>
        <div className={styles.navBarInner}>
        <nav className={styles.navLinks}>
          {footerLinks.map((l) => (
            <Link key={l.label} href={l.href} className={styles.navLink}>{l.label}</Link>
          ))}
        </nav>

        <div className={styles.navRight}>
          <span className={styles.copyright}>© {new Date().getFullYear()} LEGATEE</span>
          <div className={styles.socialIcons}>
            <Link href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com"} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialLink}>
              <InstagramIcon />
            </Link>
            <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? ""}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={styles.socialLink}>
              <WhatsAppIcon />
            </Link>
          </div>
          <div className={styles.langWrap}>
            <button
              className={styles.langSelect}
              onClick={() => setLangOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              {LANG_LABELS[lang][lang]}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: langOpen ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {langOpen && (
              <ul className={styles.langDropdown} role="listbox">
                {(["en", "ar"] as const).map((l) => (
                  <li
                    key={l}
                    role="option"
                    aria-selected={lang === l}
                    className={`${styles.langOption} ${lang === l ? styles.langOptionActive : ""}`}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                  >
                    {LANG_LABELS[lang][l]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
