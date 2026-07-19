"use client";

import { useState } from "react";
import styles from "../../styles/ContactUs.module.css";
import formStyles from "../../styles/ContactUsForm.module.css";
import type { ContactPageData, ContentBlock } from "@/lib/api";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import { API_URL } from "@/lib/api-client";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

const b = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

interface Props { content?: ContactPageData | null }

export default function ContactUsForm({ content }: Props) {
  const { lang } = useLanguage();
  const t = getT(lang);

  const formTitle     = content?.formTitle?.text?.trim()        ? content.formTitle       : b(t.contact.formTitle, "h2");
  const formCopy      = content?.formCopy?.text?.trim()         ? content.formCopy        : b(t.contact.formCopy);
  const submitBtnText = content?.submitButtonText?.text?.trim() ? content.submitButtonText : b(t.contact.submitButton, "span");

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState<"success" | "error" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contactpage/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (res.ok) {
        setModal("success");
        setName(""); setEmail(""); setPhone(""); setMessage("");
      } else {
        setModal("error");
      }
    } catch {
      setModal("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className={styles.formSection} aria-labelledby="contact-heading">
        <div className={styles.formCard}>
          <h2 id="contact-heading" className={styles.formTitle} data-editable="formTitle" style={{ whiteSpace: "pre-wrap", ...resolveStyle(formTitle, lang) as React.CSSProperties }}
            dangerouslySetInnerHTML={{ __html: resolveText(formTitle, lang) }} />
          <p className={styles.formCopy} data-editable="formCopy" style={{ whiteSpace: "pre-wrap", ...resolveStyle(formCopy, lang) as React.CSSProperties }}
            dangerouslySetInnerHTML={{ __html: resolveText(formCopy, lang) }} />

          <form className={styles.form} onSubmit={handleSubmit}>
            <input className={styles.input} type="text" placeholder={t.contact.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} required />
            <input className={styles.input} type="email" placeholder={t.contact.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className={styles.input} type="tel" placeholder={t.contact.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} />
            <textarea className={`${styles.input} ${styles.message}`} placeholder={t.contact.messagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} required />
            <button className={styles.submit} type="submit" disabled={loading} data-editable="submitButtonText" style={{ whiteSpace: "pre-wrap", ...resolveStyle(submitBtnText, lang) as React.CSSProperties }}>
              {loading ? t.contact.sending : resolveText(submitBtnText, lang)}
            </button>
          </form>
        </div>
      </section>

      {modal && (
        <div className={formStyles.overlay} onClick={() => setModal(null)}>
          <div className={formStyles.modal} onClick={(e) => e.stopPropagation()}>
            {modal === "success" ? (
              <>
                <div className={formStyles.icon}>✓</div>
                <h3 className={formStyles.modalTitle}>{t.contact.successTitle}</h3>
                <p className={formStyles.modalCopy}>{t.contact.successCopy}</p>
              </>
            ) : (
              <>
                <div className={`${formStyles.icon} ${formStyles.iconError}`}>✕</div>
                <h3 className={formStyles.modalTitle}>{t.contact.errorTitle}</h3>
                <p className={formStyles.modalCopy}>{t.contact.errorCopy}</p>
              </>
            )}
            <button className={formStyles.modalBtn} onClick={() => setModal(null)}>
              {modal === "success" ? t.contact.done : t.contact.tryAgain}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
